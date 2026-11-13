import { NextRequest, NextResponse } from 'next/server';
import { gptAnswer } from '@/lib/interview-bank/gpt';

// GET /api/bank-gpt?key=bank:js/closures → the LLM-style markdown answer for one question.
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key') ?? '';
  const markdown = gptAnswer(key);
  if (!markdown) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(
    { markdown },
    { headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' } }
  );
}
