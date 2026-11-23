import { getCurrentUser } from '@/lib/auth-helpers';
import NotesView from '@/components/NotesView';

export const metadata = { title: 'notes' };

export const dynamic = 'force-dynamic';

export default async function NotesPage() {
  const user = await getCurrentUser();
  return <NotesView signedIn={!!user} />;
}
