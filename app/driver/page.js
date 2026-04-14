'use client';
// app/driver/page.js — Driver: Credit score, earnings, trip history
import CreditScoreGauge from '@/components/CreditScoreGauge';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { CheckCircle } from 'lucide-react';

const EARNINGS = [
  { month: 'Nov', base: 38000, carbon: 2800, bonus: 4200 },
  { month: 'Dec', base: 41000, carbon: 3100, bonus: 5100 },
  { month: 'Jan', base: 36000, carbon: 2600, bonus: 3800 },
  { month: 'Feb', base: 44000, carbon: 3600, bonus: 5800 },
  { month: 'Mar', base: 47000, carbon: 4200, bonus: 6200 },
  { month: 'Apr', base: 52000, carbon: 4900, bonus: 7100 },
];

const TRIPS = [
  { route: 'Chennai → Mumbai', date: 'Apr 8', earn: '₹14,200', carbon: '+₹840', load: '94%' },
  { route: 'Mumbai → Bangalore', date: 'Apr 4', earn: '₹11,800', carbon: '+₹720', load: '88%' },
  { route: 'Bangalore → Delhi', date: 'Mar 31', earn: '₹18,400', carbon: '+₹980', load: '100%' },
  { route: 'Delhi → Chennai', date: 'Mar 26', earn: '₹16,200', carbon: '+₹890', load: '91%' },
];

export default function DriverPage() {
  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-semibold">Driver dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your trips, credit score, and earnings — all from your movement data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Credit Score */}
        <div className="card text-center">
          <p className="text-sm font-medium mb-3">Freight credit score</p>
          <CreditScoreGauge score={785} max={900} />
          <div className="mt-3 space-y-2">
            <div className="bg-green-50 rounded-lg p-3 text-sm text-green-900">
              Eligible for <strong>₹4.2L micro-loan</strong> · 3 insurers interested
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-sm text-purple-900">
              Built from <strong>47 completed trips</strong> — no bank record needed
            </div>
          </div>
        </div>

        {/* Earnings chart */}
        <div className="card">
          <p className="text-sm font-medium mb-3">Monthly earnings (₹)</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={EARNINGS} margin={{ top: 0, right: 0, bottom: 0, left: -15 }}>
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => `₹${v.toLocaleString()}`} contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="base" stackId="a" fill="#B5D4F4" name="Base freight" />
              <Bar dataKey="carbon" stackId="a" fill="#C0DD97" name="Carbon bonus" />
              <Bar dataKey="bonus" stackId="a" fill="#7F77DD" name="Match bonus" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-200 inline-block" />Base</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-green-200 inline-block" />Carbon</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-purple-400 inline-block" />Match bonus</span>
          </div>
        </div>
      </div>

      {/* Trip history */}
      <div className="card">
        <p className="text-sm font-medium mb-3">Recent return legs — matched by GhostHaul AI</p>
        <div className="space-y-2">
          {TRIPS.map((t, i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
              <CheckCircle size={16} className="text-green-700 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-medium">{t.route}</div>
                <div className="text-xs text-gray-500">{t.date} · Load: {t.load}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">{t.earn}</div>
                <div className="text-xs text-green-700">{t.carbon} carbon</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between items-center bg-purple-50 rounded-lg p-3">
          <span className="text-sm text-purple-900">Total earned this month (incl. carbon)</span>
          <span className="text-lg font-semibold text-purple-900">₹64,120</span>
        </div>
      </div>
    </div>
  );
}
