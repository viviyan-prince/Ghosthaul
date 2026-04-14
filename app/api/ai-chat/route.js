// app/api/ai-chat/route.js
// ─────────────────────────────────────────────────────────────
// Proxies messages to the Anthropic Claude API.
// 🔑 Requires ANTHROPIC_API_KEY in .env.local
//    Get it FREE at: https://console.anthropic.com
//    Free tier: $5 credit on signup — enough for thousands of queries
// ─────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';

export async function POST(req) {
  const { messages, system } = await req.json();

  // 🔑 Add to .env.local: ANTHROPIC_API_KEY=sk-ant-...
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      reply: "AI assistant not configured. Add ANTHROPIC_API_KEY to your .env.local file. Get a free key at console.anthropic.com — $5 free credit on signup.",
    });
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        system,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Anthropic API error:', data);
      return NextResponse.json({ reply: 'AI service error. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ reply: data.content?.[0]?.text || 'No response.' });
  } catch (err) {
    console.error('ai-chat route error:', err);
    return NextResponse.json({ reply: 'Connection error.' }, { status: 500 });
  }
}
