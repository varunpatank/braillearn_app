import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: Request) {
  try {
    const { content, model = 'gemini-pro' } = await req.json()
    if (!content) return NextResponse.json({ error: 'Missing content' }, { status: 400 })

    const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.VITE_GOOGLE_AI_API_KEY || (globalThis as any).VITE_GOOGLE_AI_API_KEY
    if (!apiKey) {
      console.error('No Google AI key configured for /api/gemini-chat')
      return NextResponse.json({ error: 'Server AI key missing' }, { status: 500 })
    }

    const gen = new GoogleGenerativeAI(apiKey)
    const m = gen.getGenerativeModel({ model })
    const result = await m.generateContent(content)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({ text })
  } catch (err: any) {
    console.error('/api/gemini-chat error', err)
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
