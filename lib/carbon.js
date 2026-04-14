// lib/carbon.js
// ─────────────────────────────────────────────────────────────
// ✅ NO API KEY NEEDED — Carbon calculations are internal.
//    Emission factors from MoRTH India (Ministry of Road
//    Transport and Highways) + Gold Standard methodology.
// ─────────────────────────────────────────────────────────────

import { supabase } from './supabase.js';
import { calcCarbonSaving } from './predictor.js';

// Gold Standard verified price range for India road freight credits
const CREDIT_PRICE_INR = 1290; // ₹/tonne — update from market
const DRIVER_SHARE = 0.60;     // 60% of credit revenue goes to driver

/**
 * Process a completed match and log its carbon credit.
 * Called automatically when a booking is confirmed.
 */
export async function processMatchCarbon({ matchId, truckId, driverId, distanceKm, loadTonnes }) {
  const { tonnes_co2_saved, credit_value_inr } = calcCarbonSaving(distanceKm, loadTonnes);

  const driverEarning = Math.round(credit_value_inr * DRIVER_SHARE);
  const platformEarning = credit_value_inr - driverEarning;

  // Log to Supabase
  const { error } = await supabase.from('carbon_credits').insert([{
    match_id: matchId,
    truck_id: truckId,
    driver_id: driverId,
    tonnes_saved: tonnes_co2_saved,
    credit_value: credit_value_inr,
    driver_payout: driverEarning,
    platform_revenue: platformEarning,
    status: 'pending_verification',
    created_at: new Date().toISOString(),
  }]);

  if (error) console.error('carbon log error:', error);

  return {
    tonnes_co2_saved,
    credit_value_inr,
    driver_earning_inr: driverEarning,
    platform_revenue_inr: platformEarning,
    verification_status: 'pending_verification',
    note: 'Submitted for Gold Standard verification (7–14 days)',
  };
}

/**
 * Get total carbon impact stats for the dashboard.
 */
export async function getDashboardCarbonStats() {
  const today = new Date().toISOString().split('T')[0];

  const { data: todayData } = await supabase
    .from('carbon_credits')
    .select('tonnes_saved, credit_value, driver_payout')
    .gte('created_at', `${today}T00:00:00`);

  const { data: monthData } = await supabase
    .from('carbon_credits')
    .select('tonnes_saved, credit_value, driver_payout')
    .gte('created_at', `${today.slice(0, 7)}-01T00:00:00`);

  const sum = (arr, key) => arr?.reduce((acc, r) => acc + (r[key] || 0), 0) ?? 0;

  return {
    today: {
      tonnes: +sum(todayData, 'tonnes_saved').toFixed(1),
      value: sum(todayData, 'credit_value'),
      driver_payout: sum(todayData, 'driver_payout'),
    },
    month: {
      tonnes: +sum(monthData, 'tonnes_saved').toFixed(1),
      value: sum(monthData, 'credit_value'),
      driver_payout: sum(monthData, 'driver_payout'),
    },
    credit_price_inr: CREDIT_PRICE_INR,
    driver_share_pct: DRIVER_SHARE * 100,
  };
}

/**
 * Estimate credit value for a hypothetical match (used in shipper UI preview).
 */
export function estimateCredit(distanceKm, loadTonnes) {
  return calcCarbonSaving(distanceKm, loadTonnes);
}
