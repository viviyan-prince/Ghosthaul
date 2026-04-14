// lib/openmeteo.js
// ─────────────────────────────────────────────────────────────
// ✅ NO API KEY NEEDED — Open-Meteo is 100% free, no signup!
//    Docs: https://open-meteo.com/en/docs
//    Unlimited requests, no rate limit for standard use
// ─────────────────────────────────────────────────────────────

import { CITY_COORDS } from './openroute.js';

const BASE = process.env.OPEN_METEO_BASE_URL || 'https://api.open-meteo.com/v1';

/**
 * Get current weather for a city.
 * Returns conditions that affect trucking: rain, visibility, temperature.
 */
export async function getCityWeather(city) {
  const coords = CITY_COORDS[city];
  if (!coords) return defaultWeather();

  const [lng, lat] = coords;

  try {
    const url = `${BASE}/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,precipitation,weathercode,windspeed_10m,visibility&hourly=precipitation_probability&forecast_days=2`;
    const res = await fetch(url, { next: { revalidate: 1800 } });
    const json = await res.json();

    const current = json.current;
    const code = current.weathercode;

    return {
      city,
      temperature: Math.round(current.temperature_2m),
      precipitation: current.precipitation,
      windspeed: Math.round(current.windspeed_10m),
      visibility: current.visibility,
      condition: weatherCodeToLabel(code),
      delayRisk: calcDelayRisk(code, current.precipitation, current.windspeed_10m),
      raw: current,
    };
  } catch (err) {
    console.error(`Weather fetch failed for ${city}:`, err);
    return defaultWeather(city);
  }
}

/**
 * Get weather for multiple cities along a truck's route.
 * Returns overall delay risk score (0–1) for the route.
 */
export async function getRouteWeatherRisk(fromCity, toCity) {
  const [fromWeather, toWeather] = await Promise.all([
    getCityWeather(fromCity),
    getCityWeather(toCity),
  ]);

  const routeRisk = (fromWeather.delayRisk + toWeather.delayRisk) / 2;

  return {
    fromCity: fromWeather,
    toCity: toWeather,
    routeRisk,           // 0 = no risk, 1 = severe delay risk
    estimatedDelayHours: routeRisk > 0.6 ? Math.round(routeRisk * 4) : 0,
    summary: routeRisk > 0.6
      ? `High delay risk: ${fromWeather.condition} in ${fromCity}, ${toWeather.condition} in ${toCity}`
      : `Clear conditions — no weather delays expected`,
  };
}

/**
 * Score a truck's return route based on weather.
 * Used by the AI matching engine as one input feature.
 */
export async function weatherScore(fromCity, toCity) {
  const { routeRisk } = await getRouteWeatherRisk(fromCity, toCity);
  return +(1 - routeRisk).toFixed(2); // 1 = perfect conditions, 0 = severe weather
}

// ── Helpers ────────────────────────────────────────────────

function weatherCodeToLabel(code) {
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 49) return 'Foggy';
  if (code <= 69) return 'Drizzle';
  if (code <= 79) return 'Rain';
  if (code <= 99) return 'Thunderstorm';
  return 'Unknown';
}

function calcDelayRisk(code, precipitation, windspeed) {
  let risk = 0;
  if (code >= 61) risk += 0.3;   // Rain
  if (code >= 80) risk += 0.3;   // Heavy rain / storm
  if (precipitation > 5) risk += 0.2;
  if (windspeed > 50) risk += 0.2;
  return Math.min(1, risk);
}

function defaultWeather(city = 'Unknown') {
  return { city, temperature: 30, precipitation: 0, windspeed: 10, condition: 'Clear', delayRisk: 0, visibility: 10000 };
}
