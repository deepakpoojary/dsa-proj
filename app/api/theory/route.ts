import { NextRequest, NextResponse } from 'next/server'
import { getTheoryData, addTheoryQuestion } from '@/lib/theory'
import { isAdminSession } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

export async function GET() {
  const data = await getTheoryData()
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { topic, afterId, before } = await req.json()
  const newQ = await addTheoryQuestion(topic, afterId, before)
  return NextResponse.json(newQ)
}
