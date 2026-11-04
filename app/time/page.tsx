import { getCurrentUser } from '@/lib/auth-helpers';
import TimeView from '@/components/TimeView';

export const metadata = { title: 'time' };

export const dynamic = 'force-dynamic';

export default async function TimePage() {
  const user = await getCurrentUser();
  return <TimeView signedIn={!!user} />;
}
