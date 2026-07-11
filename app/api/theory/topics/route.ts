import { NextRequest, NextResponse } from 'next/server'
import { setTopicEnabled } from '@/lib/theory'
import { isAdminSession } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

export async function PATCH(req: NextRequest) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { topic, enabled } = await req.json()
  await setTopicEnabled(topic, enabled)
  return NextResponse.json({ ok: true })
}
