import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { supabase as adminSupabase } from '@/lib/supabase';

const MAX_ITEM_ID = 300;
const MAX_BODY = 20000;

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await adminSupabase
    .from('user_notes')
    .select('item_id, body, updated_at')
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 503 });
  return NextResponse.json({
    notes: (data ?? []).map((r) => ({
      itemId: r.item_id as string,
      body: r.body as string,
      updatedAt: new Date(r.updated_at as string).getTime(),
    })),
  });
}

// Body: { itemId, body, updatedAt? } — an empty body deletes the note.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { itemId, body, updatedAt } = await req.json().catch(() => ({}));
  if (
    typeof itemId !== 'string' || itemId.length === 0 || itemId.length > MAX_ITEM_ID ||
    typeof body !== 'string' || body.length > MAX_BODY
  ) {
    return NextResponse.json({ error: 'Invalid itemId or body' }, { status: 400 });
  }

  const { error } = body.trim() === ''
    ? await adminSupabase.from('user_notes').delete().eq('user_id', user.id).eq('item_id', itemId)
    : await adminSupabase.from('user_notes').upsert({
        user_id: user.id,
        item_id: itemId,
        body,
        updated_at: new Date(typeof updatedAt === 'number' ? updatedAt : Date.now()).toISOString(),
      });

  if (error) return NextResponse.json({ error: error.message }, { status: 503 });
  return NextResponse.json({ ok: true });
}
