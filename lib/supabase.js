// lib/supabase.js
// ─────────────────────────────────────────────────────────────
// 🔑 API KEY LOCATION:
//    Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
//    in your .env.local file.
//    Get them from: https://supabase.com → Project Settings → API
// ─────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️  Supabase keys missing! Copy .env.local.example → .env.local and fill your keys.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

// ── Truck helpers ──────────────────────────────────────────

export async function getTrucks() {
  const { data, error } = await supabase
    .from('trucks')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) { console.error('getTrucks:', error); return []; }
  return data;
}

export async function getAvailableTrucks() {
  const { data, error } = await supabase
    .from('trucks')
    .select('*')
    .in('status', ['available', 'predicting'])
    .order('eta_hours', { ascending: true });
  if (error) { console.error('getAvailableTrucks:', error); return []; }
  return data;
}

export async function updateTruckStatus(truckId, status) {
  const { error } = await supabase
    .from('trucks')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', truckId);
  if (error) console.error('updateTruckStatus:', error);
}

// ── Match helpers ──────────────────────────────────────────

export async function createMatch({ truckId, shipperId, shipperName, route, price, co2Saved }) {
  const { data, error } = await supabase
    .from('matches')
    .insert([{ truck_id: truckId, shipper_id: shipperId, shipper_name: shipperName, route, price, co2_saved: co2Saved, created_at: new Date().toISOString() }])
    .select()
    .single();
  if (error) { console.error('createMatch:', error); return null; }
  return data;
}

export async function getMatchesByDriver(driverId) {
  const { data, error } = await supabase
    .from('matches')
    .select('*, trucks(*)')
    .eq('trucks.driver_id', driverId)
    .order('created_at', { ascending: false });
  if (error) { console.error('getMatchesByDriver:', error); return []; }
  return data;
}

// ── Carbon helpers ─────────────────────────────────────────

export async function logCarbonCredit({ truckId, matchId, tonnesSaved, estimatedValue }) {
  const { error } = await supabase
    .from('carbon_credits')
    .insert([{ truck_id: truckId, match_id: matchId, tonnes_saved: tonnesSaved, estimated_value: estimatedValue, created_at: new Date().toISOString() }]);
  if (error) console.error('logCarbonCredit:', error);
}

export async function getCarbonStats() {
  const { data, error } = await supabase.rpc('get_carbon_stats');
  if (error) { console.error('getCarbonStats:', error); return { total_tonnes: 0, total_value: 0, credits_sold: 0 }; }
  return data;
}

// ── Realtime subscription ──────────────────────────────────

export function subscribeToTrucks(callback) {
  return supabase
    .channel('trucks-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'trucks' }, callback)
    .subscribe();
}

export function subscribeToMatches(callback) {
  return supabase
    .channel('matches-realtime')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'matches' }, callback)
    .subscribe();
}

// ── Driver credit score ────────────────────────────────────

export async function getDriverScore(driverId) {
  const { data, error } = await supabase
    .from('driver_scores')
    .select('*')
    .eq('driver_id', driverId)
    .single();
  if (error) { return { score: 0, trips: 0, reliability: 0 }; }
  return data;
}

export async function upsertDriverScore(driverId, { score, trips, reliability }) {
  const { error } = await supabase
    .from('driver_scores')
    .upsert({ driver_id: driverId, score, trips, reliability, updated_at: new Date().toISOString() });
  if (error) console.error('upsertDriverScore:', error);
}
