import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { updateProblem, deleteProblem } from '@/lib/data';
import { Problem } from '@/types';

async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get('admin_session')?.value === 'authenticated';
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body: Problem = await req.json();
  await updateProblem(id, body);

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  await deleteProblem(id);

  return NextResponse.json({ ok: true });
}
