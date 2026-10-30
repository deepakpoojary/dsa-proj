import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { supabase as adminSupabase } from '@/lib/supabase';

const KINDS = new Set(['journal', 'goal']);
const MAX_DOC_ID = 100;
const MAX_DATA = 50000;

// GET /api/docs?kind=journal
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const kind = req.nextUrl.searchParams.get('kind') ?? '';
  if (!KINDS.has(kind)) return NextResponse.json({ error: 'Invalid kind' }, { status: 400 });

  const { data, error } = await adminSupabase
    .from('user_docs')
    .select('doc_id, data, updated_at')
    .eq('user_id', user.id)
    .eq('kind', kind);

  if (error) return NextResponse.json({ error: error.message }, { status: 503 });
  return NextResponse.json({
    docs: (data ?? []).map((r) => ({
      docId: r.doc_id as string,
      data: r.data as unknown,
      updatedAt: new Date(r.updated_at as string).getTime(),
    })),
  });
}

// Body: { kind, docId, data, updatedAt? } — data: null deletes the doc.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { kind, docId, data, updatedAt } = await req.json().catch(() => ({}));
  if (
    typeof kind !== 'string' || !KINDS.has(kind) ||
    typeof docId !== 'string' || docId.length === 0 || docId.length > MAX_DOC_ID ||
    (data !== null && (typeof data !== 'object' || JSON.stringify(data).length > MAX_DATA))
  ) {
    return NextResponse.json({ error: 'Invalid kind, docId or data' }, { status: 400 });
  }

  const { error } = data === null
    ? await adminSupabase.from('user_docs').delete().eq('user_id', user.id).eq('kind', kind).eq('doc_id', docId)
    : await adminSupabase.from('user_docs').upsert({
        user_id: user.id,
        kind,
        doc_id: docId,
        data,
        updated_at: new Date(typeof updatedAt === 'number' ? updatedAt : Date.now()).toISOString(),
      });

  if (error) return NextResponse.json({ error: error.message }, { status: 503 });
  return NextResponse.json({ ok: true });
}
