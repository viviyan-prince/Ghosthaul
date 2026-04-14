// app/api/carbon/route.js
// GET /api/carbon — dashboard stats
// POST /api/carbon/estimate — estimate carbon for a hypothetical route
// ─────────────────────────────────────────────────────────────
// ✅ NO KEY NEEDED for estimation — pure math
// 🔑 Supabase keys needed for live stats from DB
// ─────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { getDashboardCarbonStats } from '@/lib/carbon';
import { calcCarbonSaving } from '@/lib/predictor';
import { getRouteInfo } from '@/lib/openroute';

export async function GET() {
  try {
    const stats = await getDashboardCarbonStats();
    return NextResponse.json({ success: true, ...stats });
  } catch {
    // Return mock stats if Supabase not configured
    return NextResponse.json({
      success: true,
      today: { tonnes: 89.4, value: 115374, driver_payout: 69224 },
      month: { tonnes: 3241.2, value: 4181148, driver_payout: 2508689 },
      credit_price_inr: 1290,
      driver_share_pct: 60,
      note: 'Demo data — connect Supabase for live stats',
    });
  }
}

export async function POST(req) {
  try {
    const { fromCity, toCity, loadTonnes } = await req.json();
    const routeInfo = await getRouteInfo(fromCity, toCity);
    const credit = calcCarbonSaving(routeInfo.distance_km, loadTonnes || 5);
    return NextResponse.json({
      success: true,
      route: `${fromCity} → ${toCity}`,
      distance_km: routeInfo.distance_km,
      ...credit,
      driver_payout_inr: Math.round(credit.credit_value_inr * 0.6),
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
