import { NextResponse } from 'next/server'
import { verifyWasteImage } from '@/utils/gemini'

export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType, expectedText } = await req.json()
    if (!imageBase64 || !mimeType) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const result = await verifyWasteImage(imageBase64, mimeType, expectedText)
    return NextResponse.json({ result })
  } catch (err: any) {
    console.error('/api/verify-waste error', err)
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
