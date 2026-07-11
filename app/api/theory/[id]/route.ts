import { NextRequest, NextResponse } from 'next/server'
import { updateTheoryQuestion, deleteTheoryQuestion } from '@/lib/theory'
import { isAdminSession } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const updates = await req.json()
  const updated = await updateTheoryQuestion(id, updates)
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  await deleteTheoryQuestion(id)
  return NextResponse.json({ ok: true })
}
