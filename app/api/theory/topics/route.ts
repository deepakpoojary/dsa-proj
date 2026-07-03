import { NextRequest, NextResponse } from 'next/server'
import { setTopicEnabled } from '@/lib/theory'

export const dynamic = 'force-dynamic'

export async function PATCH(req: NextRequest) {
  const { topic, enabled } = await req.json()
  await setTopicEnabled(topic, enabled)
  return NextResponse.json({ ok: true })
}
