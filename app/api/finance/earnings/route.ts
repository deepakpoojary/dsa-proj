import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { getEarningsSeries, EarningsRange } from '@/lib/finance';

const VALID_RANGES: EarningsRange[] = ['week', 'month', 'year'];

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const range = searchParams.get('range');
  const offsetParam = searchParams.get('offset');

  if (!range || !VALID_RANGES.includes(range as EarningsRange)) {
    return NextResponse.json({ error: 'Invalid range' }, { status: 400 });
  }

  const offset = Number(offsetParam ?? '0');
  if (!Number.isInteger(offset) || offset < 0) {
    return NextResponse.json({ error: 'Invalid offset' }, { status: 400 });
  }

  const series = await getEarningsSeries(user.id, range as EarningsRange, offset);
  return NextResponse.json(series);
}
