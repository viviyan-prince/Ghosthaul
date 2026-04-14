'use client';
// app/auction/page.js
// ⚡ WOW FEATURE #1: Live Auction Room
// When AI predicts a truck will go empty, its return slot
// gets listed in a real-time auction. Shippers see a live
// countdown, competing bids, and price pressure — creating
// urgency that fills trucks FAST.

import { useState, useEffect, useRef } from 'react';
import { Zap, Clock, TrendingUp, Award } from 'lucide-react';

const INITIAL_AUCTIONS = [
  { id: 'A001', truckId: 'TN-01', driver: 'Rajan Kumar', from: 'Chennai', to: 'Mumbai', capacity: 8, basePrice: 8200, currentBid: 9800, bids: 4, timeLeft: 847, confidence: 94, co2: 0.83, status: 'hot', watchers: 12 },
  { id: 'A002', truckId: 'KA-07', driver: 'Suresh Mohan', from: 'Bangalore', to: 'Delhi', capacity: 12, basePrice: 13500, currentBid: 14200, bids: 2, timeLeft: 2341, confidence: 87, co2: 1.24, status: 'active', watchers: 7 },
  { id: 'A003', truckId: 'MH-14', driver: 'Arjun Kumar', from: 'Mumbai', to: 'Kolkata', capacity: 16, basePrice: 21000, currentBid: 21000, bids: 0, timeLeft: 5820, confidence: 78, co2: 1.56, status: 'new', watchers: 3 },
  { id: 'A004', truckId: 'TS-09', driver: 'Priya Selvan', from: 'Hyderabad', to: 'Pune', capacity: 8, basePrice: 7400, currentBid: 8900, bids: 6, timeLeft: 423, confidence: 91, co2: 0.61, status: 'closing', watchers: 18 },
  { id: 'A005', truckId: 'GJ-18', driver: 'Selvam P', from: 'Ahmedabad', to: 'Chennai', capacity: 14, basePrice: 17200, currentBid: 18100, bids: 3, timeLeft: 3600, confidence: 82, co2: 1.41, status: 'active', watchers: 5 },
];

const BID_FEED = [
  { id: 1, auction: 'A001', shipper: 'SpiceRoute Logistics', amount: 9800, ago: 2 },
  { id: 2, auction: 'A004', shipper: 'FastKart Pune', amount: 8900, ago: 5 },
  { id: 3, auction: 'A001', shipper: 'Mumbai Merchants', amount: 9400, ago: 9 },
  { id: 4, auction: 'A002', shipper: 'Delhi Wholesalers', amount: 14200, ago: 14 },
  { id: 5, auction: 'A004', shipper: 'FastKart Pune', amount: 8600, ago: 18 },
];

function fmt(s) {
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

function StatusBadge({ status }) {
  const cfg = {
    hot:     { bg: '#FCEBEB', color: '#791F1F', label: 'Hot — 12 watching' },
    closing: { bg: '#FAEEDA', color: '#633806', label: 'Closing soon' },
    active:  { bg: '#E6F1FB', color: '#0C447C', label: 'Active' },
    new:     { bg: '#EAF3DE', color: '#27500A', label: 'New listing' },
  };
  const c = cfg[status] || cfg.active;
  return <span style={{ background: c.bg, color: c.color, fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 20 }}>{c.label}</span>;
}

function CountdownRing({ seconds, total = 7200 }) {
  const pct = Math.min(1, seconds / total);
  const r = 20, circ = 2 * Math.PI * r;
  const color = seconds < 600 ? '#E24B4A' : seconds < 1800 ? '#EF9F27' : '#185FA5';
  return (
    <svg width="52" height="52" viewBox="0 0 52 52">
      <circle cx="26" cy="26" r={r} fill="none" stroke="var(--color-border-tertiary)" strokeWidth="3" />
      <circle cx="26" cy="26" r={r} fill="none" stroke={color} strokeWidth="3"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
        strokeLinecap="round" transform="rotate(-90 26 26)" />
      <text x="26" y="27" textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: 9, fontWeight: 600, fill: color, fontFamily: 'var(--font-mono)' }}>
        {fmt(seconds)}
      </text>
    </svg>
  );
}

export default function AuctionPage() {
  const [auctions, setAuctions] = useState(INITIAL_AUCTIONS);
  const [feed, setFeed] = useState(BID_FEED);
  const [won, setWon] = useState(null);
  const [totalMatched, setTotalMatched] = useState(1284);
  const [bidding, setBidding] = useState(null);
  const tickRef = useRef(null);
  const feedIdRef = useRef(10);

  useEffect(() => {
    tickRef.current = setInterval(() => {
      setAuctions(prev => prev.map(a => {
        let next = { ...a, timeLeft: Math.max(0, a.timeLeft - 1) };
        // Randomly add bids to hot auctions
        if (Math.random() > 0.97 && a.status !== 'new' && a.timeLeft > 10) {
          const increment = Math.floor(Math.random() * 400 + 100);
          next.currentBid += increment;
          next.bids += 1;
          next.watchers = Math.max(1, next.watchers + (Math.random() > 0.5 ? 1 : -1));
          const shippers = ['QuickLoad India', 'SpiceRoute Logistics', 'Mumbai Merchants', 'Delhi Wholesalers', 'FastKart'];
          const newEntry = {
            id: ++feedIdRef.current,
            auction: a.id,
            shipper: shippers[Math.floor(Math.random() * shippers.length)],
            amount: next.currentBid,
            ago: 0,
          };
          setFeed(f => [newEntry, ...f.slice(0, 7)]);
          setTotalMatched(t => t + 1);
        }
        if (next.timeLeft === 0 && a.timeLeft > 0) {
          next.status = 'closed';
        }
        return next;
      }));
      setFeed(f => f.map(e => ({ ...e, ago: e.ago + 1 / 60 })));
    }, 1000);
    return () => clearInterval(tickRef.current);
  }, []);

  function placeBid(auctionId) {
    setBidding(auctionId);
    setTimeout(() => {
      setAuctions(prev => prev.map(a => {
        if (a.id !== auctionId) return a;
        const newBid = a.currentBid + 300;
        const newEntry = { id: ++feedIdRef.current, auction: auctionId, shipper: 'You', amount: newBid, ago: 0 };
        setFeed(f => [newEntry, ...f.slice(0, 7)]);
        return { ...a, currentBid: newBid, bids: a.bids + 1, status: 'hot' };
      }));
      setBidding(null);
    }, 800);
  }

  function bookNow(auction) {
    setWon(auction);
  }

  if (won) {
    return (
      <div className="max-w-lg mx-auto mt-10">
        <div className="card border-green-300 bg-green-50 text-center py-10">
          <Award size={44} className="mx-auto text-green-700 mb-3" />
          <h2 className="text-xl font-semibold text-green-900">Auction won!</h2>
          <p className="text-sm text-green-800 mt-2">{won.truckId} · {won.driver}</p>
          <p className="text-sm text-green-800">{won.from} → {won.to} · {won.capacity}T capacity</p>
          <div className="mt-5 bg-white rounded-xl p-4 text-left space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Winning bid</span><span className="font-semibold text-green-700">₹{won.currentBid.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Saved vs spot rate</span><span className="font-semibold">₹{Math.round(won.currentBid * 0.38).toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">CO₂ credit generated</span><span className="font-semibold text-teal-700">{won.co2} tonnes</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Driver carbon bonus</span><span className="font-semibold text-purple-700">₹{Math.round(won.co2 * 1290 * 0.6).toLocaleString()}</span></div>
          </div>
          <button className="btn-outline mt-5" onClick={() => setWon(null)}>Back to auctions</button>
        </div>
      </div>
    );
  }

  const live = auctions.filter(a => a.status !== 'closed');
  const closed = auctions.filter(a => a.status === 'closed');

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Zap size={18} className="text-amber-600" />
            Live auction room
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Return truck slots — AI-predicted · real-time bidding</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-green-700">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
          {totalMatched.toLocaleString()} matched today
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <div className="stat-card"><div className="text-2xl font-semibold text-amber-600">{live.length}</div><div className="text-xs text-gray-500 mt-1">Live auctions</div></div>
        <div className="stat-card"><div className="text-2xl font-semibold text-blue-700">{auctions.reduce((a, b) => a + b.bids, 0)}</div><div className="text-xs text-gray-500 mt-1">Total bids today</div></div>
        <div className="stat-card"><div className="text-2xl font-semibold text-green-700">{auctions.reduce((a, b) => a + b.watchers, 0)}</div><div className="text-xs text-gray-500 mt-1">Active watchers</div></div>
        <div className="stat-card"><div className="text-2xl font-semibold text-purple-700">{closed.length}</div><div className="text-xs text-gray-500 mt-1">Closed today</div></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Auction cards */}
        <div className="lg:col-span-2 space-y-3">
          {live.map(a => {
            const savings = Math.round(a.currentBid * 0.38);
            const isBidding = bidding === a.id;
            const isClosing = a.timeLeft < 600;
            return (
              <div key={a.id} className={`card ${isClosing ? 'border-amber-300 bg-amber-50' : ''}`}
                style={isClosing ? { borderColor: '#FCD34D', background: '#FFFBEB' } : {}}>
                <div className="flex items-start gap-4">
                  <CountdownRing seconds={a.timeLeft} total={7200} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-semibold">{a.from} → {a.to}</span>
                      <StatusBadge status={a.status} />
                      <span className="text-xs text-gray-400">{a.truckId} · {a.driver}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                      <span>{a.capacity}T capacity</span>
                      <span>AI confidence: <strong className="text-blue-700">{a.confidence}%</strong></span>
                      <span className="text-teal-700">{a.co2}t CO₂ credit</span>
                      <span>{a.bids} bids · {a.watchers} watching</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="text-xs text-gray-400">Current bid</div>
                        <div className="text-lg font-semibold text-green-700">₹{a.currentBid.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Save vs spot</div>
                        <div className="text-sm font-medium text-blue-700">₹{savings.toLocaleString()}</div>
                      </div>
                      <div className="flex-1" />
                      <button
                        className="btn-outline text-xs px-3 py-1.5"
                        onClick={() => placeBid(a.id)}
                        disabled={isBidding}>
                        {isBidding ? 'Placing...' : `Bid ₹${(a.currentBid + 300).toLocaleString()}`}
                      </button>
                      <button
                        className="btn-primary text-xs px-3 py-1.5"
                        onClick={() => bookNow(a)}>
                        Buy now ₹{Math.round(a.currentBid * 1.08).toLocaleString()}
                      </button>
                    </div>
                  </div>
                </div>
                {isClosing && (
                  <div className="mt-2 text-xs font-medium text-amber-800 bg-amber-100 rounded-lg px-3 py-1.5">
                    Closing in {fmt(a.timeLeft)} — {a.bids} shippers competing for this slot
                  </div>
                )}
              </div>
            );
          })}
          {closed.length > 0 && (
            <div className="card bg-gray-50 opacity-60">
              <div className="text-xs font-medium text-gray-500 mb-2">Closed auctions</div>
              {closed.map(a => (
                <div key={a.id} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0 text-sm">
                  <span className="text-gray-500">{a.from} → {a.to} · {a.truckId}</span>
                  <span className="font-medium text-green-700">₹{a.currentBid.toLocaleString()} · {a.bids} bids</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live bid feed */}
        <div className="card h-fit">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-blue-700" />
            <span className="text-sm font-medium">Live bid feed</span>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block ml-auto" />
          </div>
          <div className="space-y-2">
            {feed.slice(0, 8).map(e => (
              <div key={e.id} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-800 flex-shrink-0">
                  {e.shipper === 'You' ? 'ME' : e.shipper.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-medium truncate ${e.shipper === 'You' ? 'text-green-700' : ''}`}>{e.shipper}</div>
                  <div className="text-xs text-gray-400">Auction {e.auction}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-green-700">₹{e.amount.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">{e.ago < 1 ? 'just now' : `${Math.floor(e.ago)}m ago`}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Carbon impact live */}
          <div className="mt-4 bg-green-50 rounded-xl p-3">
            <div className="text-xs font-semibold text-green-900 mb-1">Carbon impact — live</div>
            <div className="text-2xl font-semibold text-green-700">
              {(auctions.filter(a => a.status !== 'closed' && a.bids > 0).reduce((s, a) => s + a.co2, 0)).toFixed(2)}t
            </div>
            <div className="text-xs text-green-700">CO₂ queued for credit this session</div>
          </div>
        </div>
      </div>
    </div>
  );
}
