import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { supabase as adminSupabase } from '@/lib/supabase';

const MAX_ITEM_ID = 300;

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await adminSupabase
    .from('user_reviews')
    .select('item_id, state')
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 503 });
  return NextResponse.json({ reviews: (data ?? []).map((r) => ({ itemId: r.item_id as string, state: r.state })) });
}

// Body: { itemId, state } — state is a ReviewState; state: null removes it.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { itemId, state } = await req.json().catch(() => ({}));
  if (typeof itemId !== 'string' || itemId.length === 0 || itemId.length > MAX_ITEM_ID) {
    return NextResponse.json({ error: 'Invalid itemId' }, { status: 400 });
  }

  if (state === null) {
    const { error } = await adminSupabase.from('user_reviews').delete().eq('user_id', user.id).eq('item_id', itemId);
    if (error) return NextResponse.json({ error: error.message }, { status: 503 });
    return NextResponse.json({ ok: true });
  }

  const numeric = ['ease', 'intervalDays', 'reps', 'lapses', 'dueAt', 'firstReviewedAt', 'lastReviewedAt', 'updatedAt'];
  if (!state || typeof state !== 'object' || !numeric.every((k) => typeof state[k] === 'number' && Number.isFinite(state[k]))) {
    return NextResponse.json({ error: 'Invalid state' }, { status: 400 });
  }
  const clean = Object.fromEntries(numeric.map((k) => [k, state[k]]));

  const { error } = await adminSupabase.from('user_reviews').upsert({
    user_id: user.id,
    item_id: itemId,
    state: clean,
    due_at: new Date(clean.dueAt).toISOString(),
    updated_at: new Date(clean.updatedAt).toISOString(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 503 });
  return NextResponse.json({ ok: true });
}
