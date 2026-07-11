import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { supabase as adminSupabase } from '@/lib/supabase';

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { startingBalance, targetAmount, targetDays } = await req.json();
  if (
    typeof startingBalance !== 'number' ||
    typeof targetAmount !== 'number' ||
    typeof targetDays !== 'number' ||
    targetDays < 1
  ) {
    return NextResponse.json({ error: 'Invalid fields' }, { status: 400 });
  }

  const { error } = await adminSupabase.from('user_finance').upsert({
    user_id: user.id,
    starting_balance: startingBalance,
    target_amount: targetAmount,
    target_days: targetDays,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
