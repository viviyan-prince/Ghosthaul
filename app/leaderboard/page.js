'use client';
// app/leaderboard/page.js
// ⚡ WOW FEATURE #3: Gamified Driver Leaderboard
// Real-time rankings with animated rank changes, streak badges,
// and carbon champion crowns. Makes drivers compete to fill
// more return legs — turning the logistics problem into a game.

import { useState, useEffect } from 'react';
import { Trophy, Flame, Zap, Leaf } from 'lucide-react';

const INITIAL_DRIVERS = [
  { rank: 1, id: 'D001', name: 'Rajan Kumar',   city: 'Chennai',   trips: 147, score: 891, carbon: 12.4, earnings: 284000, streak: 18, badge: 'Carbon Champion', prev: 1 },
  { rank: 2, id: 'D002', name: 'Suresh Mohan',  city: 'Bangalore', trips: 132, score: 867, carbon: 10.8, earnings: 261000, streak: 12, badge: 'Speed Star',       prev: 3 },
  { rank: 3, id: 'D003', name: 'Vikram Singh',  city: 'Delhi',     trips: 128, score: 854, carbon: 9.6,  earnings: 249000, streak: 8,  badge: 'Reliable',        prev: 2 },
  { rank: 4, id: 'D004', name: 'Priya Selvan',  city: 'Hyderabad', trips: 119, score: 831, carbon: 8.9,  earnings: 231000, streak: 21, badge: 'Streak Master',    prev: 4 },
  { rank: 5, id: 'D005', name: 'Karthik Raj',   city: 'Kolkata',   trips: 108, score: 812, carbon: 7.7,  earnings: 208000, streak: 6,  badge: 'Rising Star',     prev: 6 },
  { rank: 6, id: 'D006', name: 'Anbu Mani',     city: 'Pune',      trips: 101, score: 797, carbon: 7.1,  earnings: 194000, streak: 9,  badge: 'Reliable',        prev: 5 },
  { rank: 7, id: 'D007', name: 'Selvam P',      city: 'Ahmedabad', trips: 94,  score: 783, carbon: 6.5,  earnings: 181000, streak: 4,  badge: 'Rising Star',     prev: 7 },
  { rank: 8, id: 'D008', name: 'Mohan Das',     city: 'Vizag',     trips: 87,  score: 768, carbon: 5.9,  earnings: 167000, streak: 14, badge: 'Eco Warrior',     prev: 9 },
  { rank: 9, id: 'D009', name: 'Arjun Kumar',   city: 'Surat',     trips: 82,  score: 751, carbon: 5.3,  earnings: 154000, streak: 3,  badge: 'Active',          prev: 8 },
  { rank: 10, id: 'D010', name: 'Divya Nair',   city: 'Kochi',     trips: 76,  score: 734, carbon: 4.8,  earnings: 142000, streak: 7,  badge: 'Rising Star',     prev: 10 },
];

const BADGE_COLORS = {
  'Carbon Champion': { bg: '#E1F5EE', text: '#085041', icon: 'leaf' },
  'Speed Star':      { bg: '#FAEEDA', text: '#633806', icon: 'zap' },
  'Streak Master':   { bg: '#EEEDFE', text: '#3C3489', icon: 'flame' },
  'Eco Warrior':     { bg: '#EAF3DE', text: '#27500A', icon: 'leaf' },
  'Reliable':        { bg: '#E6F1FB', text: '#0C447C', icon: 'trophy' },
  'Rising Star':     { bg: '#FCEBEB', text: '#791F1F', icon: 'zap' },
  'Active':          { bg: '#F1EFE8', text: '#444441', icon: 'zap' },
};

const TABS = ['Overall', 'Carbon saved', 'Earnings', 'Streak'];

function RankDelta({ curr, prev }) {
  const diff = prev - curr;
  if (diff === 0) return <span style={{ fontSize: 10, color: 'var(--color-text-tertiary)' }}>—</span>;
  if (diff > 0) return <span style={{ fontSize: 10, color: '#3B6D11', fontWeight: 600 }}>▲{diff}</span>;
  return <span style={{ fontSize: 10, color: '#A32D2D', fontWeight: 600 }}>▼{Math.abs(diff)}</span>;
}

function MedalIcon({ rank }) {
  if (rank === 1) return <span style={{ fontSize: 18 }}>🥇</span>;
  if (rank === 2) return <span style={{ fontSize: 18 }}>🥈</span>;
  if (rank === 3) return <span style={{ fontSize: 18 }}>🥉</span>;
  return <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', width: 24, textAlign: 'center', display: 'inline-block' }}>{rank}</span>;
}

export default function LeaderboardPage() {
  const [drivers, setDrivers] = useState(INITIAL_DRIVERS);
  const [activeTab, setActiveTab] = useState('Overall');
  const [highlight, setHighlight] = useState(null);
  const [totalCarbon, setTotalCarbon] = useState(89.4);

  // Simulate live rank changes every 8 seconds
  useEffect(() => {
    const t = setInterval(() => {
      setDrivers(prev => {
        const next = prev.map(d => ({ ...d }));
        // Randomly bump someone's score a little
        const idx = Math.floor(Math.random() * (next.length - 2)) + 1;
        next[idx].score += Math.floor(Math.random() * 4);
        next[idx].trips += Math.random() > 0.7 ? 1 : 0;
        next[idx].carbon = +(next[idx].carbon + (Math.random() > 0.6 ? 0.01 : 0)).toFixed(2);

        // Resort and update ranks
        let sorted;
        if (activeTab === 'Carbon saved') sorted = [...next].sort((a, b) => b.carbon - a.carbon);
        else if (activeTab === 'Earnings') sorted = [...next].sort((a, b) => b.earnings - a.earnings);
        else if (activeTab === 'Streak') sorted = [...next].sort((a, b) => b.streak - a.streak);
        else sorted = [...next].sort((a, b) => b.score - a.score);

        return sorted.map((d, i) => ({ ...d, prev: d.rank, rank: i + 1 }));
      });
      setTotalCarbon(v => +(v + Math.random() * 0.05).toFixed(2));
      setHighlight(Math.floor(Math.random() * 10));
      setTimeout(() => setHighlight(null), 1200);
    }, 8000);
    return () => clearInterval(t);
  }, [activeTab]);

  function sorted() {
    if (activeTab === 'Carbon saved') return [...drivers].sort((a, b) => b.carbon - a.carbon);
    if (activeTab === 'Earnings') return [...drivers].sort((a, b) => b.earnings - a.earnings);
    if (activeTab === 'Streak') return [...drivers].sort((a, b) => b.streak - a.streak);
    return [...drivers].sort((a, b) => b.score - a.score);
  }

  const list = sorted();

  function metricVal(d) {
    if (activeTab === 'Carbon saved') return `${d.carbon}t`;
    if (activeTab === 'Earnings') return `₹${(d.earnings / 1000).toFixed(0)}k`;
    if (activeTab === 'Streak') return `${d.streak} days`;
    return d.score;
  }

  function metricLabel() {
    if (activeTab === 'Carbon saved') return 'CO₂ saved';
    if (activeTab === 'Earnings') return 'Earned';
    if (activeTab === 'Streak') return 'Streak';
    return 'Score';
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Trophy size={18} className="text-amber-600" />
            Driver leaderboard
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Live rankings update as trips complete</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-green-700">{totalCarbon.toFixed(1)}t</div>
          <div className="text-xs text-gray-500">CO₂ saved today</div>
        </div>
      </div>

      {/* Top 3 podium */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[list[1], list[0], list[2]].map((d, i) => {
          const podiumRank = [2, 1, 3][i];
          const isFirst = podiumRank === 1;
          const bc = BADGE_COLORS[d.badge] || BADGE_COLORS['Active'];
          return (
            <div key={d.id} className={`card text-center ${isFirst ? 'border-amber-300' : ''}`}
              style={isFirst ? { borderColor: '#FCD34D', background: '#FFFBEB' } : {}}>
              {isFirst && <div className="text-xl mb-1">👑</div>}
              <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center text-sm font-bold mb-2 ${isFirst ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                {d.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="text-xs font-semibold">{d.name.split(' ')[0]}</div>
              <div className="text-xs text-gray-400">{d.city}</div>
              <div className="text-lg font-semibold mt-1" style={{ color: isFirst ? '#854F0B' : '#185FA5' }}>
                {metricVal(d)}
              </div>
              <div style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: bc.bg, color: bc.text, display: 'inline-block', marginTop: 4 }}>
                {d.badge}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg" style={{ background: 'var(--color-background-secondary)', borderRadius: 10 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            style={{
              flex: 1, padding: '6px 0', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 500,
              cursor: 'pointer', fontFamily: 'var(--font-sans)',
              background: activeTab === t ? 'var(--color-background-primary)' : 'transparent',
              color: activeTab === t ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              boxShadow: activeTab === t ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all .2s',
            }}>
            {t}
          </button>
        ))}
      </div>

      {/* Full rankings */}
      <div className="card">
        <div className="flex items-center justify-between text-xs text-gray-400 px-1 pb-2 mb-1" style={{ borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
          <span>Rank · Driver</span>
          <span>{metricLabel()} · Trips · Badge</span>
        </div>
        <div className="space-y-0.5">
          {list.map((d, i) => {
            const bc = BADGE_COLORS[d.badge] || BADGE_COLORS['Active'];
            const isHighlighted = highlight === i;
            return (
              <div key={d.id}
                className="flex items-center gap-3 px-1 py-2.5 rounded-lg transition-all"
                style={{
                  background: isHighlighted ? 'var(--color-background-success)' : 'transparent',
                  borderBottom: i < list.length - 1 ? '0.5px solid var(--color-border-tertiary)' : 'none',
                  transition: 'background .4s',
                }}>
                <div className="w-8 flex items-center justify-center flex-shrink-0">
                  <MedalIcon rank={i + 1} />
                </div>
                <div className="w-5 text-center flex-shrink-0">
                  <RankDelta curr={i + 1} prev={d.prev} />
                </div>
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-800 flex-shrink-0">
                  {d.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{d.name}</div>
                  <div className="text-xs text-gray-400">{d.city} · {d.trips} trips</div>
                </div>
                <div className="text-right flex-shrink-0 mr-2">
                  <div className="text-sm font-semibold">{metricVal(d)}</div>
                  <div className="flex items-center gap-1 justify-end">
                    {d.streak >= 10 && <Flame size={10} style={{ color: '#E24B4A' }} />}
                    <span style={{ fontSize: 10, color: 'var(--color-text-tertiary)' }}>{d.streak}d streak</span>
                  </div>
                </div>
                <div style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: bc.bg, color: bc.text, flexShrink: 0 }}>
                  {d.badge}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="stat-card text-center">
          <Leaf size={16} className="mx-auto text-green-700 mb-1" />
          <div className="text-lg font-semibold text-green-700">{drivers.reduce((s, d) => +(s + d.carbon).toFixed(1), 0)}t</div>
          <div className="text-xs text-gray-500">Total CO₂ saved</div>
        </div>
        <div className="stat-card text-center">
          <Trophy size={16} className="mx-auto text-amber-600 mb-1" />
          <div className="text-lg font-semibold text-amber-600">{drivers.reduce((s, d) => s + d.trips, 0)}</div>
          <div className="text-xs text-gray-500">Total matched trips</div>
        </div>
        <div className="stat-card text-center">
          <Flame size={16} className="mx-auto text-red-600 mb-1" />
          <div className="text-lg font-semibold text-red-600">{Math.max(...drivers.map(d => d.streak))}</div>
          <div className="text-xs text-gray-500">Longest active streak</div>
        </div>
      </div>
    </div>
  );
}
