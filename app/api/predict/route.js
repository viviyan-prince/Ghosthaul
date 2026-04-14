// app/api/predict/route.js
// ─────────────────────────────────────────────────────────────
// POST /api/predict
// Runs the GhostHaul empty-return prediction for a list of trucks.
// Uses: Open-Meteo (no key), OpenRouteService (needs ORS_API_KEY),
//       rule-based LSTM fallback (no key).
// ─────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { getRouteWeatherRisk } from '@/lib/openmeteo';
import { getRouteInfo } from '@/lib/openroute';
import { rankTrucksByEmptyRisk, calcCarbonSaving } from '@/lib/predictor';

export async function POST(req) {
  try {
    const { trucks } = await req.json();

    if (!trucks || !Array.isArray(trucks)) {
      return NextResponse.json({ error: 'trucks array required' }, { status: 400 });
    }

    // Fetch weather scores for all unique routes in parallel
    const uniqueRoutes = [...new Set(trucks.map(t => `${t.current_city}|${t.destination}`))];

    const weatherMap = {};
    await Promise.all(
      uniqueRoutes.map(async route => {
        const [from, to] = route.split('|');
        try {
          const { routeRisk } = await getRouteWeatherRisk(from, to);
          weatherMap[route] = +(1 - routeRisk).toFixed(2);
        } catch {
          weatherMap[route] = 0.8; // default: good weather
        }
      })
    );

    // Build weather scores keyed by truck id
    const weatherScores = {};
    trucks.forEach(t => {
      const key = `${t.current_city}|${t.destination}`;
      weatherScores[t.id] = weatherMap[key] ?? 0.8;
    });

    // Route demand: count how many shippers want each route
    // In production this comes from Supabase shipper_requests table
    const routeDemand = {};
    trucks.forEach(t => {
      const key = `${t.current_city}-${t.destination}`;
      routeDemand[key] = (routeDemand[key] || 0) + Math.floor(Math.random() * 8 + 2);
    });

    // Run ranking
    const ranked = rankTrucksByEmptyRisk(trucks, weatherScores, routeDemand);

    // Enrich with route distance and carbon estimate
    const enriched = await Promise.all(
      ranked.map(async truck => {
        const routeInfo = await getRouteInfo(truck.current_city, truck.destination);
        const carbon = calcCarbonSaving(routeInfo.distance_km, truck.available_tonnes || 5);
        return {
          ...truck,
          distance_km: routeInfo.distance_km,
          duration_hours: routeInfo.duration_hours,
          carbon_saving: carbon,
          weather_score: weatherScores[truck.id],
        };
      })
    );

    return NextResponse.json({
      success: true,
      predictions: enriched,
      meta: {
        total: enriched.length,
        high_risk: enriched.filter(t => t.empty_probability > 0.65).length,
        model: 'ghosthaul-lstm-v1 (rules-based fallback)',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('/api/predict error:', err);
    return NextResponse.json({ error: 'Prediction failed', detail: err.message }, { status: 500 });
  }
}
