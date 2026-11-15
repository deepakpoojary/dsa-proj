import { getCurrentUser } from '@/lib/auth-helpers';
import { getStudyStats } from '@/lib/study-stats';
import { bankItems } from '@/lib/study-items.server';
import { BANK_TOPICS } from '@/lib/interview-bank';
import type { CatalogItem } from '@/lib/item-catalog';
import RevisionView from '@/components/RevisionView';

export const metadata = { title: 'revision' };

export const dynamic = 'force-dynamic';

// Interview-bank questions (JavaScript, Node.js, …, Indian States) as revision
// catalog entries: titles only; answers are fetched when a card is revealed.
function bankCatalog(): CatalogItem[] {
  const label = new Map(BANK_TOPICS.map((t) => [t.key, t.label]));
  return bankItems().map((i) => ({ id: i.key, title: i.title, area: label.get(i.topic) ?? i.topic, section: i.group ?? '', hasAnswer: true }));
}

export default async function RevisionPage() {
  const user = await getCurrentUser();
  const stats = await getStudyStats(user?.id);
  return <RevisionView signedIn={!!user} stats={stats} bankCatalog={bankCatalog()} />;
}
