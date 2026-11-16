import { getTheoryData } from '@/lib/theory';
import { theoryItems, type StudyItem } from '@/lib/study-items';
import { bankItems, courseDsaItems, designCourseItems } from '@/lib/study-items.server';
import { matchCategory } from '@/lib/search';
import { GLOSSARY, type GlossaryTerm } from '@/lib/glossary';
import GlossaryView, { type GlossaryEntry } from '@/components/GlossaryView';

export const metadata = { title: 'glossary' };

export const dynamic = 'force-dynamic';

// Lowercase words; keeps + # . inside words (c++, c#, node.js) but drops a full stop at the end.
const norm = (s: string) => ` ${s.toLowerCase().replace(/[^a-z0-9+#.]+/g, ' ').replace(/\.(?=\s|$)/g, '').trim()} `;

/** Where a term should link and how many questions back it — or null when the app has none. */
function linkFor(term: GlossaryTerm, all: StudyItem[], hay: string[]): { href: string; count: number } | null {
  const q = term.q ?? term.name;
  const href = `/search?q=${encodeURIComponent(q)}`;

  // A whole topic (e.g. "sql", "dsa"), only when the term asks for it with `q` —
  // so "Express" or "MySQL" don't borrow the whole Node.js / SQL topic count.
  const cat = term.q ? matchCategory(term.q) : null;
  if (cat && !cat.rest) {
    const count = all.filter((i) => cat.category.topics.includes(i.topic)).length;
    if (count) return { href, count };
  }

  // Otherwise: questions whose title or group mentions the term as a whole word.
  // Very short words ("go") are skipped as they'd match ordinary English.
  const needles = [...new Set([q, term.name, ...(term.aka ?? [])].map(norm))].filter((n) => n.trim().length >= 3 || /[+#]/.test(n));
  let count = 0;
  for (const h of hay) if (needles.some((n) => h.includes(n))) count++;
  return count ? { href, count } : null;
}

export default async function GlossaryPage() {
  const theory = await getTheoryData();
  const all: StudyItem[] = [...courseDsaItems(), ...designCourseItems(), ...theoryItems(theory.questions), ...bankItems()];
  const hay = all.map((i) => norm(`${i.title} ${i.group ?? ''}`));

  const sections = GLOSSARY.map((s) => ({
    key: s.key,
    icon: s.icon,
    label: s.label,
    blurb: s.blurb,
    terms: s.terms.map((t): GlossaryEntry => ({ name: t.name, desc: t.desc, link: linkFor(t, all, hay) })),
  }));

  return <GlossaryView sections={sections} />;
}
