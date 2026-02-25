import { NextResponse } from 'next/server';

// Server-side proxy to Hack Club AI (https://ai.hackclub.com)
// - Keeps the API key secret in server env (process.env.HACKCLUB_API_KEY)
// - Forwards POST bodies to the Hack Club proxy and streams back the response
// Usage (client): fetch('/api/hackclub', { method: 'POST', body: JSON.stringify(payload) })

export async function POST(request: Request) {
  try {
    const HACKCLUB_KEY = process.env.HACKCLUB_API_KEY || process.env.VERCEL_HACKCLUB_API_KEY;

    if (!HACKCLUB_KEY) {
      return NextResponse.json({ error: 'Missing server-side Hack Club API key' }, { status: 500 });
    }

    const body = await request.text();

    const resp = await fetch('https://ai.hackclub.com/proxy/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HACKCLUB_KEY}`,
        'Content-Type': 'application/json'
      },
      body
    });

    const contentType = resp.headers.get('content-type') || 'application/json';
    const data = await resp.text();

    return new NextResponse(data, {
      status: resp.status,
      headers: { 'content-type': contentType }
    });
  } catch (err: any) {
    console.error('[api/hackclub] proxy failed:', err?.message || err);
    return NextResponse.json({ error: 'Proxy request failed' }, { status: 502 });
  }
}
