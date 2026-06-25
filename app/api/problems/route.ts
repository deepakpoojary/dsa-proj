import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getProblems, insertProblem } from '@/lib/data';
import { Problem } from '@/types';

export async function GET() {
  const problems = await getProblems();
  return NextResponse.json(problems);
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  if (cookieStore.get('admin_session')?.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body: Problem = await req.json();
  await insertProblem(body);

  return NextResponse.json({ ok: true });
}
