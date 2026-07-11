import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { supabase as adminSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { questionId, solved } = await req.json();
  if (!questionId || typeof solved !== 'boolean') {
    return NextResponse.json({ error: 'Missing questionId or solved' }, { status: 400 });
  }

  if (solved) {
    const { error } = await adminSupabase
      .from('theory_progress')
      .upsert({ user_id: user.id, question_id: questionId });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await adminSupabase
      .from('theory_progress')
      .delete()
      .eq('user_id', user.id)
      .eq('question_id', questionId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
