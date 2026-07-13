import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { getProblem, getUserOverride, upsertUserOverride, deleteUserOverride } from '@/lib/data';
import { highlight } from '@/lib/highlight';

// Personal edits — writes to user_problem_overrides, never to the master
// `problems` row, so they're private to the editing user and immune to
// later admin edits of the master data.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const updates = await req.json();

  const master = await getProblem(id);
  if (!master) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const current = (await getUserOverride(user.id, id)) ?? {
    description: master.description,
    bruteForce: master.bruteForce,
    optimal: master.optimal,
  };

  const merged = {
    description: updates.description !== undefined ? updates.description : current.description,
    bruteForce: updates.bruteForce ? { ...current.bruteForce, ...updates.bruteForce } : current.bruteForce,
    optimal: updates.optimal ? { ...current.optimal, ...updates.optimal } : current.optimal,
  };

  await upsertUserOverride(user.id, id, merged);

  const [bruteHtml, optimalHtml] = await Promise.all([
    highlight(merged.bruteForce.code, merged.bruteForce.language),
    highlight(merged.optimal.code, merged.optimal.language),
  ]);

  return NextResponse.json({ ...merged, bruteHtml, optimalHtml, hasOverride: true });
}

// Reset — drop the user's override and go back to seeing master data.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const master = await getProblem(id);
  if (!master) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await deleteUserOverride(user.id, id);

  const [bruteHtml, optimalHtml] = await Promise.all([
    highlight(master.bruteForce.code, master.bruteForce.language),
    highlight(master.optimal.code, master.optimal.language),
  ]);

  return NextResponse.json({
    description: master.description,
    bruteForce: master.bruteForce,
    optimal: master.optimal,
    bruteHtml,
    optimalHtml,
    hasOverride: false,
  });
}
