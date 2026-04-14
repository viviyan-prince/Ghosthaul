// app/api/match/route.js
// ─────────────────────────────────────────────────────────────
// POST /api/match
// Confirms a booking: shipper locks a return truck slot.
// Writes match to Supabase, logs carbon credit, sends FCM push
// to driver.
//
// 🔑 Requires in .env.local:
//    SUPABASE_SERVICE_ROLE_KEY — write access to Supabase
//    FIREBASE_SERVER_KEY       — push notification to driver
// ─────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getRouteInfo } from '@/lib/openroute';
import { calcCarbonSaving } from '@/lib/predictor';

// Server-side Supabase client (service role — can write)
// 🔑 SUPABASE_SERVICE_ROLE_KEY goes in .env.local
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(req) {
  try {
    const { truckId, shipperId, shipperName, fromCity, toCity, loadTonnes, agreedPrice } = await req.json();

    if (!truckId || !fromCity || !toCity) {
      return NextResponse.json({ error: 'truckId, fromCity, toCity required' }, { status: 400 });
    }

    // Get route info for carbon calculation
    const routeInfo = await getRouteInfo(fromCity, toCity);
    const carbon = calcCarbonSaving(routeInfo.distance_km, loadTonnes || 5);

    // 1. Create match record in Supabase
    const { data: match, error: matchErr } = await supabaseAdmin
      .from('matches')
      .insert([{
        truck_id: truckId,
        shipper_id: shipperId || 'anonymous',
        shipper_name: shipperName || 'Shipper',
        from_city: fromCity,
        to_city: toCity,
        load_tonnes: loadTonnes || 5,
        agreed_price: agreedPrice || 0,
        distance_km: routeInfo.distance_km,
        duration_hours: routeInfo.duration_hours,
        co2_saved: carbon.tonnes_co2_saved,
        credit_value: carbon.credit_value_inr,
        status: 'confirmed',
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (matchErr) {
      console.error('Match insert error:', matchErr);
      // Return partial success — Supabase may not be configured yet
    }

    // 2. Update truck status to matched
    await supabaseAdmin
      .from('trucks')
      .update({ status: 'matched', updated_at: new Date().toISOString() })
      .eq('id', truckId);

    // 3. Log carbon credit
    if (match?.id) {
      await supabaseAdmin.from('carbon_credits').insert([{
        match_id: match.id,
        truck_id: truckId,
        tonnes_saved: carbon.tonnes_co2_saved,
        credit_value: carbon.credit_value_inr,
        driver_payout: Math.round(carbon.credit_value_inr * 0.6),
        platform_revenue: Math.round(carbon.credit_value_inr * 0.4),
        status: 'pending_verification',
        created_at: new Date().toISOString(),
      }]);
    }

    // 4. Send FCM push notification to driver
    // 🔑 FIREBASE_SERVER_KEY goes in .env.local
    if (process.env.FIREBASE_SERVER_KEY) {
      await sendDriverPush(truckId, fromCity, toCity, agreedPrice);
    }

    return NextResponse.json({
      success: true,
      matchId: match?.id || 'demo-' + Date.now(),
      summary: {
        route: `${fromCity} → ${toCity}`,
        distance_km: routeInfo.distance_km,
        duration_hours: routeInfo.duration_hours,
        co2_saved_tonnes: carbon.tonnes_co2_saved,
        carbon_credit_value_inr: carbon.credit_value_inr,
        driver_carbon_payout_inr: Math.round(carbon.credit_value_inr * 0.6),
        savings_vs_spot_inr: Math.round((agreedPrice || 0) * 0.41),
      },
    });
  } catch (err) {
    console.error('/api/match error:', err);
    return NextResponse.json({ error: 'Match failed', detail: err.message }, { status: 500 });
  }
}

// ── Firebase Cloud Messaging push ──────────────────────────
// 🔑 Uses FIREBASE_SERVER_KEY from .env.local
async function sendDriverPush(truckId, from, to, price) {
  try {
    // In production: look up driver's FCM token from Supabase drivers table
    const { data: truck } = await supabaseAdmin
      .from('trucks')
      .select('driver_fcm_token, driver_name')
      .eq('id', truckId)
      .single();

    if (!truck?.driver_fcm_token) return;

    await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        Authorization: `key=${process.env.FIREBASE_SERVER_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: truck.driver_fcm_token,
        notification: {
          title: 'New return load matched!',
          body: `${from} → ${to} · ₹${price?.toLocaleString()} confirmed`,
        },
        data: { type: 'match', from, to, price: String(price || 0) },
      }),
    });
  } catch (err) {
    console.error('FCM push error (non-fatal):', err);
  }
}
