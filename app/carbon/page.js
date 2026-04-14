'use client';
// app/carbon/page.js — Carbon Credits Engine
import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar } from 'recharts';
import { Shield } from 'lucide-react';

const BUYERS = [
  { name: 'Tata Steel', initials: 'TS', tonnes: 840, price: 1200, date: 'Apr 10', value: '₹10.1L' },
  { name: 'Infosys ESG', initials: 'IE', tonnes: 620, price: 1350, date: 'Apr 8', value: '₹8.4L' },
  { name: 'Mahindra Sustain', initials: 'MS', tonnes: 480, price: 1180, date: 'Apr 5', value: '₹5.7L' },
  { name: 'HDFC Green Fund', initials: 'HG', tonnes: 320, price: 1420, date: 'Apr 3', value: '₹4.5L' },
  { name: 'Wipro EcoEnergy', initials: 'WE', tonnes: 280, price: 1310, date: 'Mar 30', value: '₹3.7L' },
];

const MONTHLY_CO2 = [
  { month: 'Nov', tonnes: 1840 }, { month: 'Dec', tonnes: 2120 },
  { month: 'Jan', tonnes: 1960 }, { month: 'Feb', tonnes: 2480 },
  { month: 'Mar', tonnes: 2840 }, { month: 'Apr', tonnes: 3241 },
];

export default function CarbonPage() {
  const [live, setLive] = useState(3241);

  useEffect(() => {
    const t = setInterval(() => setLive(v => v + (Math.random() > 0.5 ? 1 : 0)), 3000);
    return () => clearInterval(t);
  }, []);

  const equiv = Math.round(live * 1.4).toLocaleString();

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-semibold">Carbon credit engine</h1>
        <p className="text-sm text-gray-500 mt-0.5">Every filled return leg generates verified CO₂ credits sold to ESG corporates</p>
      </div>

      {/* Hero counter */}
      <div className="card bg-green-50 border-green-200 text-center py-8 mb-4">
        <Shield size={28} className="mx-auto text-green-700 mb-3" />
        <div className="text-5xl font-semibold text-green-900">{live.toLocaleString()}</div>
        <div className="text-sm text-green-700 mt-1">tonnes CO₂ saved today · live counter</div>
        <div className="text-xs text-green-600 mt-1">= {equiv} trucks off road · verified under Gold Standard protocol</div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="stat-card"><div className="text-2xl font-semibold text-green-700">4,281</div><div className="text-xs text-gray-500 mt-1">Credits sold this month</div></div>
        <div className="stat-card"><div className="text-2xl font-semibold text-blue-700">₹1,290</div><div className="text-xs text-gray-500 mt-1">Avg credit price per tonne</div></div>
        <div className="stat-card"><div className="text-2xl font-semibold text-purple-700">₹55.2L</div><div className="text-xs text-gray-500 mt-1">Driver carbon payout</div></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Monthly CO2 chart */}
        <div className="card">
          <p className="text-sm font-medium mb-3">Monthly CO₂ saved (tonnes)</p>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={MONTHLY_CO2} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B6D11" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3B6D11" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="tonnes" stroke="#3B6D11" fill="url(#cg)" strokeWidth={2} name="Tonnes CO₂" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* How it works */}
        <div className="card">
          <p className="text-sm font-medium mb-3">How the credit flows</p>
          <div className="space-y-2 text-sm">
            {[
              { step: '1', text: 'Truck completes matched return leg', color: 'bg-blue-100 text-blue-800' },
              { step: '2', text: 'OSRM calculates exact distance → CO₂ delta computed', color: 'bg-blue-100 text-blue-800' },
              { step: '3', text: 'Credit submitted for Gold Standard verification (7–14 days)', color: 'bg-amber-100 text-amber-800' },
              { step: '4', text: 'Verified credit sold to ESG corporate buyer', color: 'bg-green-100 text-green-800' },
              { step: '5', text: '60% of value → driver green bonus · 40% → platform', color: 'bg-purple-100 text-purple-800' },
            ].map(s => (
              <div key={s.step} className="flex items-start gap-3">
                <span className={`pill flex-shrink-0 ${s.color}`}>{s.step}</span>
                <span className="text-gray-600 text-xs leading-5">{s.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Buyer list */}
      <div className="card">
        <p className="text-sm font-medium mb-3">Corporate ESG buyers (SEBI-mandated from FY2024–25)</p>
        <div className="space-y-2">
          {BUYERS.map(b => (
            <div key={b.name} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-800 flex-shrink-0">{b.initials}</div>
              <div className="flex-1">
                <div className="text-sm font-medium">{b.name}</div>
                <div className="text-xs text-gray-500">{b.tonnes} tonnes · {b.date} · ₹{b.price}/t</div>
              </div>
              <div className="text-sm font-semibold text-green-700">{b.value}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 bg-green-50 rounded-lg p-3 text-xs text-green-900">
          60% of credit revenue flows back to truck drivers as monthly "green bonus" — a new income stream from carbon markets that has never existed for logistics workers before.
        </div>
      </div>
    </div>
  );
}
