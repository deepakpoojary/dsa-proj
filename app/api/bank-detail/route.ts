import { NextRequest, NextResponse } from 'next/server';
import { bankDetail } from '@/lib/interview-bank/detailed';
import { bulletsToNotes } from '@/lib/answer-notes';

// GET /api/bank-detail?key=bank:node/event-loop → the detailed notes for one question.
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key') ?? '';
  const q = bankDetail(key);
  if (!q) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(
    { notes: bulletsToNotes(q.a), code: q.code ?? null },
    { headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' } }
  );
}
