'use client';
// app/shipper/page.js — Shipper: Pre-book return legs
import { useState } from 'react';
import { Truck, CheckCircle } from 'lucide-react';

const TRUCKS = [
  { id:'TN-01', driver:'Rajan Kumar', from:'Chennai', to:'Mumbai', eta:'18h', cap:8, avail:6, score:812, status:'available', price:10800 },
  { id:'KA-07', driver:'Suresh Mohan', from:'Bangalore', to:'Delhi', eta:'28h', cap:12, avail:9, score:741, status:'available', price:16200 },
  { id:'MH-14', driver:'Arjun Kumar', from:'Mumbai', to:'Kolkata', eta:'36h', cap:16, avail:14, score:698, status:'available', price:25200 },
  { id:'TS-09', driver:'Priya Selvan', from:'Hyderabad', to:'Pune', eta:'14h', cap:8, avail:5, score:656, status:'available', price:9000 },
  { id:'WB-03', driver:'Karthik Raj', from:'Kolkata', to:'Mumbai', eta:'52h', cap:20, avail:12, score:723, status:'predicting', price:21600 },
  { id:'GJ-18', driver:'Selvam P', from:'Ahmedabad', to:'Chennai', eta:'44h', cap:14, avail:11, score:669, status:'available', price:19800 },
];

export default function ShipperPage() {
  const [booked, setBooked] = useState(null);

  if (booked) {
    const saving = Math.round(booked.price * 0.41);
    return (
      <div className="max-w-xl mx-auto mt-10">
        <div className="card border-green-300 bg-green-50 text-center py-8">
          <CheckCircle size={40} className="mx-auto text-green-700 mb-3" />
          <h2 className="text-lg font-semibold text-green-900">Booking confirmed!</h2>
          <p className="text-sm text-green-800 mt-1">{booked.id} · {booked.driver}</p>
          <p className="text-sm text-green-800">{booked.from} → {booked.to} · ETA: {booked.eta}</p>
          <div className="mt-4 bg-white rounded-lg p-3 text-sm text-green-900 space-y-1">
            <div>You saved <strong>₹{saving.toLocaleString()}</strong> vs spot market rate</div>
            <div>0.8 tonnes CO₂ credit generated — ₹1,032 carbon value</div>
            <div>Driver credit score updated: +5 points</div>
          </div>
          <button className="btn-outline mt-4" onClick={() => setBooked(null)}>Book another truck</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-semibold">Shipper — pre-book return legs</h1>
        <p className="text-sm text-gray-500 mt-0.5">AI predicts which trucks will be empty 48–72h before delivery completes</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="stat-card"><div className="text-2xl font-semibold text-blue-700">{TRUCKS.length}</div><div className="text-xs text-gray-500 mt-1">Available return trucks</div></div>
        <div className="stat-card"><div className="text-2xl font-semibold text-green-700">41%</div><div className="text-xs text-gray-500 mt-1">Avg saving vs spot rate</div></div>
        <div className="stat-card"><div className="text-2xl font-semibold text-amber-700">48–72h</div><div className="text-xs text-gray-500 mt-1">Pre-book window ahead</div></div>
      </div>

      <div className="space-y-3">
        {TRUCKS.map(t => (
          <div key={t.id} className="card flex items-center gap-4">
            <div className={`p-2 rounded-lg flex-shrink-0 ${t.status === 'available' ? 'bg-blue-50' : 'bg-amber-50'}`}>
              <Truck size={20} className={t.status === 'available' ? 'text-blue-700' : 'text-amber-700'} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm">{t.from} → {t.to}</span>
                <span className={`pill ${t.status === 'available' ? 'pill-blue' : 'pill-amber'}`}>
                  {t.status === 'available' ? 'Pre-book now' : 'AI predicting'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t.driver} · {t.id} · ETA empty: {t.eta} · {t.avail}T available of {t.cap}T · Credit score: {t.score}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-sm font-semibold text-green-700">₹{t.price.toLocaleString()}</div>
              <div className="text-xs text-gray-400 mb-2">est. cost</div>
              <button className="btn-primary" onClick={() => setBooked(t)}>Book ↗</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
