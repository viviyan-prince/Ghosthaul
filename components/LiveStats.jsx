'use client';
// components/LiveStats.jsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LiveStats() {
  const [stats, setStats] = useState({
    trucks: 2847, matches: 1284, co2: 3241, revenue: 48.2,
  });

  useEffect(() => {
    // Subscribe to realtime match events from Supabase
    // 🔑 Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
    const channel = supabase
      .channel('live-stats')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'matches' }, () => {
        setStats(s => ({ ...s, matches: s.matches + 1, revenue: +(s.revenue + 0.015).toFixed(3) }));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'carbon_credits' }, payload => {
        setStats(s => ({ ...s, co2: s.co2 + (payload.new?.tonnes_saved || 0) }));
      })
      .subscribe();

    // Fallback: simulate live increments when Supabase not connected
    const sim = setInterval(() => {
      setStats(s => ({
        trucks: s.trucks + (Math.random() > 0.8 ? 1 : 0),
        matches: s.matches + (Math.random() > 0.7 ? 1 : 0),
        co2: s.co2 + (Math.random() > 0.5 ? 1 : 0),
        revenue: +(s.revenue + 0.002).toFixed(3),
      }));
    }, 2500);

    return () => { supabase.removeChannel(channel); clearInterval(sim); };
  }, []);

  const items = [
    { label: 'Trucks tracked', value: stats.trucks.toLocaleString(), color: 'text-blue-700' },
    { label: 'Matches today', value: stats.matches.toLocaleString(), color: 'text-green-700' },
    { label: 'CO₂ saved (t)', value: stats.co2.toLocaleString(), color: 'text-teal-700' },
    { label: 'Revenue unlocked', value: `₹${stats.revenue.toFixed(1)}L`, color: 'text-purple-700' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      {items.map(item => (
        <div key={item.label} className="stat-card">
          <div className={`text-2xl font-semibold ${item.color}`}>{item.value}</div>
          <div className="text-xs text-gray-500 mt-1">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
