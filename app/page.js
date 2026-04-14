'use client';
// app/page.js — Live Dashboard
import dynamic from 'next/dynamic';
import LiveStats from '@/components/LiveStats';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

// Leaflet must be loaded client-side only (no SSR)
const IndiaMap = dynamic(() => import('@/components/IndiaMap'), { ssr: false });

const MOCK_TRUCKS = [
  { id: 1, truck_id: 'TN-01', driver_name: 'Rajan Kumar', current_city: 'Chennai', from_city: 'Chennai', to_city: 'Mumbai', destination: 'Mumbai', status: 'matched', eta_hours: 18, available_tonnes: 6, credit_score: 812 },
  { id: 2, truck_id: 'KA-07', driver_name: 'Suresh Mohan', current_city: 'Bangalore', from_city: 'Bangalore', to_city: 'Delhi', destination: 'Delhi', status: 'available', eta_hours: 28, available_tonnes: 9, credit_score: 741 },
  { id: 3, truck_id: 'MH-14', driver_name: 'Arjun Kumar', current_city: 'Mumbai', from_city: 'Mumbai', to_city: 'Kolkata', destination: 'Kolkata', status: 'available', eta_hours: 36, available_tonnes: 14, credit_score: 698 },
  { id: 4, truck_id: 'DL-22', driver_name: 'Vikram Singh', current_city: 'Delhi', from_city: 'Delhi', to_city: 'Chennai', destination: 'Chennai', status: 'matched', eta_hours: 42, available_tonnes: 7, credit_score: 785 },
  { id: 5, truck_id: 'TS-09', driver_name: 'Priya Selvan', current_city: 'Hyderabad', from_city: 'Hyderabad', to_city: 'Pune', destination: 'Pune', status: 'available', eta_hours: 14, available_tonnes: 5, credit_score: 656 },
  { id: 6, truck_id: 'WB-03', driver_name: 'Karthik Raj', current_city: 'Kolkata', from_city: 'Kolkata', to_city: 'Mumbai', destination: 'Mumbai', status: 'predicting', eta_hours: 52, available_tonnes: 12, credit_score: 723 },
  { id: 7, truck_id: 'MH-31', driver_name: 'Anbu Mani', current_city: 'Pune', from_city: 'Pune', to_city: 'Bangalore', destination: 'Bangalore', status: 'matched', eta_hours: 22, available_tonnes: 8, credit_score: 797 },
];

const CO2_DATA = [
  { day: 'Mon', t: 42 }, { day: 'Tue', t: 58 }, { day: 'Wed', t: 51 },
  { day: 'Thu', t: 67 }, { day: 'Fri', t: 74 }, { day: 'Sat', t: 63 }, { day: 'Today', t: 89 },
];

const TECH_STACK = [
  'Supabase', 'OSRM', 'TensorFlow.js', 'OpenRouteService',
  'Open-Meteo', 'Socket.io', 'Leaflet.js', 'Vercel',
  'Firebase FCM', 'Nominatim OSM', 'Next.js 14', 'Tailwind CSS',
];

const STATUS_LEGEND = [
  { color: 'bg-green-700', label: 'Matched' },
  { color: 'bg-blue-700', label: 'Available' },
  { color: 'bg-amber-700', label: 'Predicting' },
];

export default function Dashboard() {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold">Live dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Real-time truck network across India</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
          Live feed active
        </div>
      </div>

      <LiveStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Map */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Live truck network</span>
            <div className="flex gap-3">
              {STATUS_LEGEND.map(s => (
                <span key={s.label} className="flex items-center gap-1 text-xs text-gray-500">
                  <span className={`w-2 h-2 rounded-full ${s.color} inline-block`} />
                  {s.label}
                </span>
              ))}
            </div>
          </div>
          <IndiaMap trucks={MOCK_TRUCKS} />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* CO2 chart */}
          <div className="card flex-1">
            <p className="text-sm font-medium mb-3">CO₂ saved this week (tonnes)</p>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={CO2_DATA} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B6D11" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3B6D11" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="t" stroke="#3B6D11" fill="url(#g1)" strokeWidth={2} name="Tonnes" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Tech stack */}
          <div className="card bg-green-50 border-green-100">
            <p className="text-xs font-semibold text-green-900 mb-2">Tech stack — 100% free, zero paid tier</p>
            <div className="flex flex-wrap gap-1.5">
              {TECH_STACK.map(t => (
                <span key={t} className="pill bg-green-100 text-green-900">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
