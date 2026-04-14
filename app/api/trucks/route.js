// app/api/trucks/route.js
// GET  /api/trucks       — list all trucks (with optional ?status= filter)
// POST /api/trucks       — register a new truck
// ─────────────────────────────────────────────────────────────
// 🔑 Requires SUPABASE_SERVICE_ROLE_KEY in .env.local for POST
//    GET uses NEXT_PUBLIC_SUPABASE_ANON_KEY (read-only)
// ─────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { getTrucks, getAvailableTrucks } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

const MOCK_TRUCKS = [
  { id: 1, truck_id: 'TN-01', driver_name: 'Rajan Kumar', current_city: 'Chennai', destination: 'Mumbai', status: 'matched',    eta_hours: 18, available_tonnes: 6,  credit_score: 812, outbound_load_pct: 94 },
  { id: 2, truck_id: 'KA-07', driver_name: 'Suresh Mohan', current_city: 'Bangalore', destination: 'Delhi',  status: 'available', eta_hours: 28, available_tonnes: 9,  credit_score: 741, outbound_load_pct: 87 },
  { id: 3, truck_id: 'MH-14', driver_name: 'Arjun Kumar',  current_city: 'Mumbai',    destination: 'Kolkata',status: 'available', eta_hours: 36, available_tonnes: 14, credit_score: 698, outbound_load_pct: 80 },
  { id: 4, truck_id: 'DL-22', driver_name: 'Vikram Singh', current_city: 'Delhi',     destination: 'Chennai',status: 'matched',   eta_hours: 42, available_tonnes: 7,  credit_score: 785, outbound_load_pct: 91 },
  { id: 5, truck_id: 'TS-09', driver_name: 'Priya Selvan', current_city: 'Hyderabad', destination: 'Pune',   status: 'available', eta_hours: 14, available_tonnes: 5,  credit_score: 656, outbound_load_pct: 75 },
  { id: 6, truck_id: 'WB-03', driver_name: 'Karthik Raj',  current_city: 'Kolkata',   destination: 'Mumbai', status: 'predicting',eta_hours: 52, available_tonnes: 12, credit_score: 723, outbound_load_pct: 82 },
];

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  try {
    // Try Supabase first
    let trucks = status === 'available'
      ? await getAvailableTrucks()
      : await getTrucks();

    // If Supabase not configured, return mock data
    if (!trucks || trucks.length === 0) {
      trucks = status ? MOCK_TRUCKS.filter(t => t.status === status) : MOCK_TRUCKS;
    }

    return NextResponse.json({ success: true, trucks, count: trucks.length });
  } catch (err) {
    return NextResponse.json({ success: true, trucks: MOCK_TRUCKS, count: MOCK_TRUCKS.length, note: 'Using demo data — connect Supabase to use live data' });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { truck_id, driver_name, driver_phone, current_city, destination, capacity_tonnes, driver_fcm_token } = body;

    if (!truck_id || !driver_name || !current_city || !destination) {
      return NextResponse.json({ error: 'truck_id, driver_name, current_city, destination required' }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    const { data, error } = await supabaseAdmin
      .from('trucks')
      .insert([{
        truck_id, driver_name, driver_phone,
        current_city, destination,
        capacity_tonnes: capacity_tonnes || 10,
        available_tonnes: capacity_tonnes || 10,
        driver_fcm_token,
        status: 'available',
        credit_score: 500, // Starting score
        outbound_load_pct: 100,
        historical_match_rate: 50,
        eta_accuracy: 0.8,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, truck: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
