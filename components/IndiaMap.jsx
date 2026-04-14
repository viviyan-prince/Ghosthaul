'use client';
// components/IndiaMap.jsx
// ─────────────────────────────────────────────────────────────
// ✅ NO API KEY NEEDED
//    Uses Leaflet.js + OpenStreetMap tiles — 100% free forever
//    Tile URL: https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react';

const CITY_LATLNG = {
  Delhi:      [28.6139, 77.2090],
  Mumbai:     [19.0760, 72.8777],
  Bangalore:  [12.9716, 77.5946],
  Chennai:    [13.0827, 80.2707],
  Kolkata:    [22.5726, 88.3639],
  Hyderabad:  [17.3850, 78.4867],
  Pune:       [18.5204, 73.8567],
  Ahmedabad:  [23.0225, 72.5714],
  Coimbatore: [11.0168, 76.9558],
  Kochi:      [9.9312,  76.2673],
  Vizag:      [17.6868, 83.3032],
  Surat:      [21.1702, 72.8311],
  Nagpur:     [21.1458, 79.0882],
  Jaipur:     [26.9124, 75.7873],
};

const STATUS_COLORS = {
  matched:    '#3B6D11',
  available:  '#185FA5',
  predicting: '#854F0B',
};

export default function IndiaMap({ trucks = [] }) {
  const mapRef = useRef(null);
  const instanceRef = useRef(null);
  const markersRef = useRef([]);
  const polylinesRef = useRef([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let L;
    import('leaflet').then(leaflet => {
      L = leaflet.default;

      // Fix default icon path (Next.js build issue)
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:      'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (instanceRef.current) return; // Already initialized

      instanceRef.current = L.map(mapRef.current, {
        center: [20.5937, 78.9629], // India center
        zoom: 5,
        zoomControl: true,
        attributionControl: true,
      });

      // ✅ OpenStreetMap tiles — NO KEY NEEDED
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(instanceRef.current);

      drawTrucks(L, trucks);
    });

    return () => {
      if (instanceRef.current) {
        instanceRef.current.remove();
        instanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!instanceRef.current || typeof window === 'undefined') return;
    import('leaflet').then(leaflet => drawTrucks(leaflet.default, trucks));
  }, [trucks]);

  function drawTrucks(L, trucks) {
    const map = instanceRef.current;
    if (!map) return;

    // Clear old markers and lines
    markersRef.current.forEach(m => m.remove());
    polylinesRef.current.forEach(p => p.remove());
    markersRef.current = [];
    polylinesRef.current = [];

    trucks.forEach(truck => {
      const from = CITY_LATLNG[truck.from_city || truck.current_city];
      const to   = CITY_LATLNG[truck.to_city || truck.destination];
      if (!from || !to) return;

      const color = STATUS_COLORS[truck.status] || '#888';

      // Route line
      const line = L.polyline([from, to], {
        color,
        weight: 2,
        opacity: 0.6,
        dashArray: truck.status === 'predicting' ? '6 4' : null,
      }).addTo(map);
      polylinesRef.current.push(line);

      // Animated truck marker (circle marker)
      const marker = L.circleMarker(from, {
        radius: 6,
        fillColor: color,
        color: '#fff',
        weight: 1.5,
        opacity: 1,
        fillOpacity: 0.9,
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family:sans-serif;font-size:13px">
          <strong>${truck.driver_name || 'Driver'}</strong> · ${truck.truck_id || ''}<br/>
          ${truck.from_city || truck.current_city} → ${truck.to_city || truck.destination}<br/>
          <span style="color:${color};font-weight:500">${truck.status}</span> · ETA: ${truck.eta_hours}h<br/>
          Available: ${truck.available_tonnes}T · Credit: ${truck.credit_score}
        </div>
      `);

      markersRef.current.push(marker);
    });
  }

  return (
    <div ref={mapRef} style={{ width: '100%', height: '340px', borderRadius: '10px', overflow: 'hidden' }} />
  );
}
