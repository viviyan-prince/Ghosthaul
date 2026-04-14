// lib/openroute.js
// ─────────────────────────────────────────────────────────────
// 🔑 API KEY LOCATION:
//    Set ORS_API_KEY in your .env.local file.
//    Get it FREE at: https://openrouteservice.org/dev/#/signup
//    Free tier: 2,000 requests/day — enough for hackathon demo
// ─────────────────────────────────────────────────────────────

const ORS_BASE = 'https://api.openrouteservice.org';

// 🔑 This reads ORS_API_KEY from .env.local
const API_KEY = process.env.ORS_API_KEY;

if (!API_KEY) {
  console.warn('⚠️  ORS_API_KEY missing in .env.local — routing features disabled.');
}

// City coordinates for major Indian cities
export const CITY_COORDS = {
  Delhi:      [77.2090, 28.6139],
  Mumbai:     [72.8777, 19.0760],
  Bangalore:  [77.5946, 12.9716],
  Chennai:    [80.2707, 13.0827],
  Kolkata:    [88.3639, 22.5726],
  Hyderabad:  [78.4867, 17.3850],
  Pune:       [73.8567, 18.5204],
  Ahmedabad:  [72.5714, 23.0225],
  Coimbatore: [76.9558, 11.0168],
  Kochi:      [76.2673, 9.9312],
  Vizag:      [83.3032, 17.6868],
  Surat:      [72.8311, 21.1702],
  Nagpur:     [79.0882, 21.1458],
  Jaipur:     [75.7873, 26.9124],
};

/**
 * Get driving distance and duration between two cities.
 * Returns { distance_km, duration_hours, success }
 */
export async function getRouteInfo(fromCity, toCity) {
  if (!API_KEY) return mockRouteInfo(fromCity, toCity);

  const from = CITY_COORDS[fromCity];
  const to = CITY_COORDS[toCity];
  if (!from || !to) return { distance_km: 0, duration_hours: 0, success: false };

  try {
    const res = await fetch(
      `${ORS_BASE}/v2/directions/driving-hgv?api_key=${API_KEY}&start=${from[0]},${from[1]}&end=${to[0]},${to[1]}`,
      { next: { revalidate: 3600 } }
    );
    const json = await res.json();
    const summary = json.features?.[0]?.properties?.summary;
    return {
      distance_km: Math.round(summary.distance / 1000),
      duration_hours: +(summary.duration / 3600).toFixed(1),
      success: true,
    };
  } catch (err) {
    console.error('ORS route error:', err);
    return mockRouteInfo(fromCity, toCity);
  }
}

/**
 * Get distance matrix for multiple origins → destinations.
 * Useful for matching many trucks to many shippers at once.
 */
export async function getDistanceMatrix(origins, destinations) {
  if (!API_KEY) return null;

  const locations = [
    ...origins.map(c => CITY_COORDS[c]).filter(Boolean),
    ...destinations.map(c => CITY_COORDS[c]).filter(Boolean),
  ];
  const sources = origins.map((_, i) => i);
  const dests = destinations.map((_, i) => origins.length + i);

  try {
    const res = await fetch(`${ORS_BASE}/v2/matrix/driving-car`, {
      method: 'POST',
      headers: { Authorization: API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ locations, sources, destinations: dests, metrics: ['distance', 'duration'] }),
    });
    return await res.json();
  } catch (err) {
    console.error('ORS matrix error:', err);
    return null;
  }
}

/**
 * Geocode an address using ORS geocoding.
 * Falls back to Nominatim if ORS key is missing.
 */
export async function geocodeAddress(address) {
  if (!API_KEY) return nominatimGeocode(address);

  try {
    const res = await fetch(
      `${ORS_BASE}/geocode/search?api_key=${API_KEY}&text=${encodeURIComponent(address)}&boundary.country=IN&size=1`
    );
    const json = await res.json();
    const feature = json.features?.[0];
    if (!feature) return null;
    return { lat: feature.geometry.coordinates[1], lng: feature.geometry.coordinates[0], label: feature.properties.label };
  } catch {
    return nominatimGeocode(address);
  }
}

// ── Fallback: Nominatim (no key needed) ────────────────────
// 🔑 NO KEY NEEDED — Free OpenStreetMap geocoding
async function nominatimGeocode(address) {
  try {
    const res = await fetch(
      `${process.env.NOMINATIM_BASE_URL || 'https://nominatim.openstreetmap.org'}/search?q=${encodeURIComponent(address)}&format=json&limit=1&countrycodes=in`,
      { headers: { 'User-Agent': 'GhostHaul/1.0 (ghosthaul.vercel.app)' } }
    );
    const [result] = await res.json();
    if (!result) return null;
    return { lat: parseFloat(result.lat), lng: parseFloat(result.lon), label: result.display_name };
  } catch {
    return null;
  }
}

// ── Mock fallback when ORS key not set ─────────────────────
function mockRouteInfo(from, to) {
  const distances = {
    'Chennai-Mumbai': { distance_km: 1337, duration_hours: 19.2 },
    'Mumbai-Delhi': { distance_km: 1415, duration_hours: 20.4 },
    'Bangalore-Delhi': { distance_km: 2150, duration_hours: 29.8 },
    'Delhi-Chennai': { distance_km: 2175, duration_hours: 31.2 },
    'Mumbai-Kolkata': { distance_km: 2054, duration_hours: 29.0 },
    'Hyderabad-Pune': { distance_km: 560, duration_hours: 8.5 },
  };
  const key = `${from}-${to}`;
  const rev = `${to}-${from}`;
  return {
    ...(distances[key] || distances[rev] || { distance_km: 800 + Math.random() * 1000, duration_hours: 12 + Math.random() * 18 }),
    success: false,
    note: 'Mock data — add ORS_API_KEY for real routing',
  };
}
