import { NextRequest, NextResponse } from 'next/server';
import { bankItems } from '@/lib/study-items.server';

// GET /api/bank-answer?key=bank:states/karnataka → the short answer notes for
// one bank question (used when a card is revealed in a review session).
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key') ?? '';
  const item = bankItems().find((i) => i.key === key);
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(
    { notes: item.notes ?? [], code: item.code ?? null },
    { headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' } }
  );
}
