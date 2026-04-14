'use client';
// app/ai-assistant/page.js
// ⚡ WOW FEATURE #2: AI Logistics Assistant (Claude-powered)
// ─────────────────────────────────────────────────────────────
// Uses the Anthropic API directly from the browser.
// 🔑 NO EXTRA API KEY NEEDED — uses the same Anthropic API
//    that powers this chat. Just works out of the box.
//
// Shippers and drivers can ask natural language questions:
// "What's the cheapest route from Chennai to Delhi?"
// "How much carbon credit will I earn on a 1200km run?"
// "Which return leg pays best this week?"
// ─────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from 'react';
import { Send, Zap } from 'lucide-react';

const SYSTEM_PROMPT = `You are GhostHaul's AI logistics assistant for India's trucking industry. You help shippers find the best return truck slots and help drivers understand their earnings, credit scores, and carbon bonuses.

You know about:
- Indian city routes, distances, and typical freight costs
- Dead freight problem (58% of trucks return empty)
- GhostHaul's predictive matching (48-72h pre-booking)
- Carbon credits: 0.082kg CO₂ per tonne-km, Gold Standard verified, ₹1290/tonne
- Freight Credit Score: 0-900 scale, built from trip history
- Micro-consolidation: bundling small loads (<500kg) on return legs
- Free tech stack: Supabase, OSRM, TensorFlow.js, Open-Meteo, OpenRouteService

When answering:
- Be concise and practical
- Use ₹ for prices, km for distances
- Give specific numbers when asked about costs or carbon
- Suggest GhostHaul features when relevant
- Keep responses under 150 words unless asked for detail

Carbon credit formula: tonnes_CO2 = (distance_km × load_tonnes × 0.082) / 1000
Credit value = tonnes × ₹1290
Driver gets 60% of credit value.`;

const QUICK_QUESTIONS = [
  'What will I earn on Chennai → Mumbai?',
  'How does my credit score increase?',
  'What carbon credit for a 1400km run?',
  'Best paying return routes this week?',
  'How does micro-consolidation work?',
  'Compare GhostHaul vs BlackBuck',
];

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} mb-4`}>
      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-semibold ${
        isUser ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
      }`}>
        {isUser ? 'YOU' : 'AI'}
      </div>
      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
        isUser
          ? 'bg-blue-600 text-white rounded-tr-sm'
          : 'bg-gray-100 text-gray-800 rounded-tl-sm'
      }`}
        style={isUser ? {} : { background: 'var(--color-background-secondary)', color: 'var(--color-text-primary)' }}>
        {msg.content}
      </div>
    </div>
  );
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m GhostHaul\'s AI assistant. Ask me anything about routes, earnings, carbon credits, or how the platform works. I can calculate your carbon bonus, estimate earnings on any route, or explain why a truck has a high empty-return probability.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(text) {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, system: SYSTEM_PROMPT }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'Sorry, I had trouble with that. Please try again.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Check your API setup in .env.local.' }]);
    }
    setLoading(false);
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Zap size={18} className="text-purple-600" />
        <h1 className="text-xl font-semibold">AI logistics assistant</h1>
        <span className="pill bg-purple-50 text-purple-800">Claude-powered</span>
      </div>
      <p className="text-sm text-gray-500 mb-4">Ask about routes, earnings, carbon credits, credit scores — anything GhostHaul.</p>

      {/* Quick questions */}
      <div className="flex flex-wrap gap-2 mb-4">
        {QUICK_QUESTIONS.map(q => (
          <button key={q}
            onClick={() => send(q)}
            className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors bg-transparent cursor-pointer"
            style={{ fontFamily: 'var(--font-sans)' }}>
            {q}
          </button>
        ))}
      </div>

      {/* Chat window */}
      <div className="card" style={{ minHeight: 400 }}>
        <div style={{ maxHeight: 420, overflowY: 'auto', paddingBottom: 8 }}>
          {messages.map((m, i) => <Message key={i} msg={m} />)}
          {loading && (
            <div className="flex gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-semibold text-purple-800 flex-shrink-0">AI</div>
              <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3" style={{ background: 'var(--color-background-secondary)' }}>
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 6, height: 6, borderRadius: '50%', background: '#9CA3AF',
                      animation: 'bounce 1.2s infinite', animationDelay: `${i * 0.2}s`
                    }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2 mt-3 pt-3" style={{ borderTop: '0.5px solid var(--color-border-tertiary)' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about routes, earnings, carbon credits..."
            style={{ flex: 1, fontSize: 13, padding: '8px 12px', borderRadius: 8, border: '0.5px solid var(--color-border-secondary)', background: 'var(--color-background-secondary)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-sans)', outline: 'none' }}
            disabled={loading}
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: '#185FA5', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Send size={14} />
          </button>
        </div>
      </div>

      <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-4px)} }`}</style>
    </div>
  );
}
