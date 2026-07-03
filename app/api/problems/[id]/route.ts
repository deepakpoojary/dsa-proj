import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getProblem, updateProblem, deleteProblem } from '@/lib/data';
import { highlight } from '@/lib/highlight';
import { Problem } from '@/types';

async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get('admin_session')?.value === 'authenticated';
}

// No auth — inline editing from main page
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const updates = await req.json();

  const current = await getProblem(id);
  if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updated: Problem = {
    ...current,
    ...updates,
    bruteForce: updates.bruteForce
      ? { ...current.bruteForce, ...updates.bruteForce }
      : current.bruteForce,
    optimal: updates.optimal
      ? { ...current.optimal, ...updates.optimal }
      : current.optimal,
  };

  await updateProblem(id, updated);
  revalidatePath('/');

  const [bruteHtml, optimalHtml] = await Promise.all([
    highlight(updated.bruteForce.code, updated.bruteForce.language),
    highlight(updated.optimal.code, updated.optimal.language),
  ]);

  return NextResponse.json({ ...updated, bruteHtml, optimalHtml });
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
