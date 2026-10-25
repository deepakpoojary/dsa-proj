import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { supabase as adminSupabase } from '@/lib/supabase';

const MAX_ITEM_ID = 300;
const MAX_BATCH = 500;

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await adminSupabase
    .from('user_checklist')
    .select('item_id')
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 503 });
  return NextResponse.json({ itemIds: (data ?? []).map((r) => r.item_id as string) });
}

// Body: { itemIds: string[], checked: boolean } — batched so the client can
// push up items checked while offline / before the table existed.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { itemIds, checked } = await req.json().catch(() => ({}));
  if (
    !Array.isArray(itemIds) ||
    itemIds.length === 0 ||
    itemIds.length > MAX_BATCH ||
    !itemIds.every((id) => typeof id === 'string' && id.length > 0 && id.length <= MAX_ITEM_ID) ||
    typeof checked !== 'boolean'
  ) {
    return NextResponse.json({ error: 'Invalid itemIds or checked' }, { status: 400 });
  }

  const { error } = checked
    ? await adminSupabase
        .from('user_checklist')
        .upsert(itemIds.map((item_id: string) => ({ user_id: user.id, item_id })))
    : await adminSupabase
        .from('user_checklist')
        .delete()
        .eq('user_id', user.id)
        .in('item_id', itemIds);

  if (error) return NextResponse.json({ error: error.message }, { status: 503 });
  return NextResponse.json({ ok: true });
}
