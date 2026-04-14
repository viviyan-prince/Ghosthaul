'use client';
// app/algorithm/page.js — AI Engine + Live Pipeline Simulation
import { useState, useRef } from 'react';
import { Zap } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

const FEATURES = [
  { name: 'ETA accuracy', value: 94, color: '#185FA5' },
  { name: 'Historical match rate', value: 87, color: '#3B6D11' },
  { name: 'Weather impact', value: 71, color: '#854F0B' },
  { name: 'Driver reliability', value: 92, color: '#534AB7' },
  { name: 'Demand forecast', value: 83, color: '#0F6E56' },
  { name: 'Capacity utilization', value: 78, color: '#A32D2D' },
];

const RADAR_DATA = FEATURES.map(f => ({ subject: f.name.split(' ')[0], A: f.value }));

const FREE_APIS = [
  { name: 'OpenRouteService', use: 'Route optimisation, ETA, distance matrix', limit: '2,000 req/day free', key: true, color: '#185FA5' },
  { name: 'Open-Meteo', use: 'Weather delay risk prediction per city', limit: 'Unlimited — no key needed', key: false, color: '#3B6D11' },
  { name: 'OSRM', use: 'Self-hosted routing engine for carbon calc', limit: 'Unlimited (self-hosted)', key: false, color: '#854F0B' },
  { name: 'TensorFlow.js', use: 'LSTM model runs fully in-browser', limit: 'Unlimited — no server cost', key: false, color: '#534AB7' },
  { name: 'Supabase Realtime', use: 'Live DB sync + Auth + Websockets', limit: '500MB + 2GB transfer free', key: true, color: '#0F6E56' },
  { name: 'Nominatim / OSM', use: 'Geocoding all Indian addresses', limit: '1 req/sec — completely free', key: false, color: '#533806' },
  { name: 'Firebase FCM', use: 'Push notifications to driver app', limit: 'Unlimited push — free tier', key: true, color: '#A32D2D' },
];

const ALGO_STEPS = [
  { msg: 'Fetching live delivery ETAs via OpenRouteService API...', delay: 700 },
  { msg: 'Querying Open-Meteo: weather impact on 847 active routes...', delay: 750 },
  { msg: 'Loading TensorFlow.js LSTM model weights from Supabase storage...', delay: 900 },
  { msg: 'Running in-browser prediction: 2,847 trucks × 1,204 shippers...', delay: 1100 },
  { msg: 'Micro-consolidation engine: bundling 28 small shipments (<500kg)...', delay: 800 },
  { msg: 'OSRM: calculating exact CO₂ delta per potential match...', delay: 750 },
  { msg: 'Driver credit score weighted into matching priority queue...', delay: 600 },
  { msg: 'Scoring matrix complete — 94% confidence · 1,284 matches found ✓', delay: 0, success: true },
];

export default function AlgorithmPage() {
  const [logs, setLogs] = useState([]);
  const [running, setRunning] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [done, setDone] = useState(false);
  const stepRef = useRef(0);

  function runPipeline() {
    if (running) return;
    setLogs([]); setRunning(true); setDone(false); setConfidence(0);
    stepRef.current = 0;

    function next() {
      const i = stepRef.current;
      if (i >= ALGO_STEPS.length) { setRunning(false); setDone(true); return; }
      const step = ALGO_STEPS[i];
      setLogs(prev => [...prev, step]);
      setConfidence(Math.round(((i + 1) / ALGO_STEPS.length) * 94));
      stepRef.current++;
      if (i < ALGO_STEPS.length - 1) setTimeout(next, step.delay);
      else { setRunning(false); setDone(true); }
    }
    next();
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-semibold">AI engine</h1>
        <p className="text-sm text-gray-500 mt-0.5">LSTM prediction pipeline — runs entirely on free-tier infrastructure</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Feature importance */}
        <div className="card">
          <p className="text-sm font-medium mb-3">ML feature importance</p>
          <div className="space-y-3">
            {FEATURES.map(f => (
              <div key={f.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">{f.name}</span>
                  <span className="font-medium" style={{ color: f.color }}>{f.value}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${f.value}%`, background: f.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Radar chart */}
        <div className="card">
          <p className="text-sm font-medium mb-1">Model confidence radar</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={RADAR_DATA}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#6b7280' }} />
              <Radar name="Score" dataKey="A" stroke="#185FA5" fill="#185FA5" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Free API list */}
      <div className="card mb-4">
        <p className="text-sm font-medium mb-3">Free APIs powering GhostHaul</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {FREE_APIS.map(a => (
            <div key={a.name} className="flex items-start gap-2 p-2 rounded-lg bg-gray-50">
              <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: a.color }} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">{a.name}</span>
                  {a.key
                    ? <span className="pill bg-amber-50 text-amber-800">needs API key</span>
                    : <span className="pill bg-green-50 text-green-800">no key needed</span>}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{a.use}</div>
                <div className="text-xs text-gray-400">{a.limit}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live pipeline runner */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium">Live pipeline simulation</p>
          <button className="btn-primary flex items-center gap-1.5" onClick={runPipeline} disabled={running}>
            <Zap size={13} />
            {running ? 'Running...' : done ? 'Run again' : 'Run now'}
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 font-mono text-xs min-h-[160px] space-y-1.5">
          {logs.length === 0 && (
            <span className="text-gray-400">Press "Run now" to simulate the GhostHaul AI matching pipeline...</span>
          )}
          {logs.map((log, i) => (
            <div key={i} className={`flex items-center gap-2 ${log.success ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {log.msg}
            </div>
          ))}
        </div>

        {logs.length > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">Prediction confidence</span>
              <span className="font-medium text-green-700">{confidence}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-600 rounded-full transition-all duration-700" style={{ width: `${confidence}%` }} />
            </div>
          </div>
        )}

        {done && (
          <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-900">
            Pipeline complete: <strong>1,284 matches</strong> found · <strong>3.2 tonnes CO₂</strong> credit queued · <strong>₹48,000</strong> in driver earnings unlocked
          </div>
        )}
      </div>
    </div>
  );
}
