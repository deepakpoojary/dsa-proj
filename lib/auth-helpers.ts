import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { supabase as adminSupabase } from '@/lib/supabase';

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getIsPaidUser(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const { data } = await adminSupabase
    .from('profiles')
    .select('has_paid')
    .eq('id', user.id)
    .single();

  return data?.has_paid === true;
}

export async function isAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get('admin_session')?.value === 'authenticated';
}
