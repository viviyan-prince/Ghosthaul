'use client';
// components/IndiaHeatMap.jsx
// Leaflet map with animated pulsing circles showing empty truck density.
// ✅ NO API KEY — uses OpenStreetMap tiles free forever.

import { useEffect, useRef } from 'react';

const CITY_DATA = [
  { name: 'Delhi',      lat: 28.6139, lng: 77.2090, empty: 312, severity: 'critical' },
  { name: 'Mumbai',     lat: 19.0760, lng: 72.8777, empty: 287, severity: 'high'     },
  { name: 'Kolkata',    lat: 22.5726, lng: 88.3639, empty: 241, severity: 'critical' },
  { name: 'Bangalore',  lat: 12.9716, lng: 77.5946, empty: 198, severity: 'moderate' },
  { name: 'Ahmedabad',  lat: 23.0225, lng: 72.5714, empty: 167, severity: 'high'     },
  { name: 'Chennai',    lat: 13.0827, lng: 80.2707, empty: 173, severity: 'moderate' },
  { name: 'Hyderabad',  lat: 17.3850, lng: 78.4867, empty: 154, severity: 'low'      },
  { name: 'Pune',       lat: 18.5204, lng: 73.8567, empty: 121, severity: 'low'      },
  { name: 'Jaipur',     lat: 26.9124, lng: 75.7873, empty: 98,  severity: 'moderate' },
  { name: 'Surat',      lat: 21.1702, lng: 72.8311, empty: 87,  severity: 'low'      },
  { name: 'Nagpur',     lat: 21.1458, lng: 79.0882, empty: 112, severity: 'moderate' },
  { name: 'Vizag',      lat: 17.6868, lng: 83.3032, empty: 143, severity: 'high'     },
];

const SEV_COLOR = { critical: '#E24B4A', high: '#EF9F27', moderate: '#378ADD', low: '#3B6D11' };
const SEV_RADIUS = { critical: 38, high: 30, moderate: 24, low: 18 };

export default function IndiaHeatMap({ onCityClick }) {
  const mapRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    import('leaflet').then(L => {
      const Leaflet = L.default;
      delete Leaflet.Icon.Default.prototype._getIconUrl;

      if (instanceRef.current) return;

      // Add pulse CSS
      const style = document.createElement('style');
      style.textContent = `
        @keyframes gh-pulse { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.35);opacity:.2} }
        .gh-pulse-ring { animation: gh-pulse 2s ease-in-out infinite; transform-origin: center; }
      `;
      document.head.appendChild(style);

      instanceRef.current = Leaflet.map(mapRef.current, {
        center: [20.5937, 78.9629],
        zoom: 5,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 18,
      }).addTo(instanceRef.current);

      CITY_DATA.forEach(city => {
        const color = SEV_COLOR[city.severity];
        const radius = SEV_RADIUS[city.severity];

        // Outer pulsing ring
        const pulseIcon = Leaflet.divIcon({
          className: '',
          html: `<div style="position:relative;width:${radius * 2}px;height:${radius * 2}px">
            <div class="gh-pulse-ring" style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:.35;animation-delay:${Math.random() * 1.5}s"></div>
            <div style="position:absolute;inset:${radius * 0.3}px;border-radius:50%;background:${color};opacity:.75"></div>
          </div>`,
          iconSize: [radius * 2, radius * 2],
          iconAnchor: [radius, radius],
        });

        const marker = Leaflet.marker([city.lat, city.lng], { icon: pulseIcon })
          .addTo(instanceRef.current)
          .bindPopup(`<b>${city.name}</b><br/>${city.empty} empty trucks<br/><span style="color:${color}">${city.severity} severity</span>`);

        marker.on('click', () => onCityClick?.(city.name));
      });
    });

    return () => {
      if (instanceRef.current) {
        instanceRef.current.remove();
        instanceRef.current = null;
      }
    };
  }, []);

  return <div ref={mapRef} style={{ width: '100%', height: 400 }} />;
}
