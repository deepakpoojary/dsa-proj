// 1–5 star "how important is this for a tech interview" rating for every
// question on the site. Hand-reviewed ratings live in importance-data.ts;
// anything not listed there (new admin-added questions, renamed items) falls
// back to a small heuristic so every row still gets stars.

import { THEORY_STARS, PROBLEM_STARS, COURSE_DSA_STARS } from './importance-data';

export const normTitle = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const clamp = (n: number) => Math.max(1, Math.min(5, Math.round(n)));

export function theoryStars(q: { id: string; difficulty: string }): number {
  const s = THEORY_STARS[q.id];
  if (s) return clamp(s);
  return q.difficulty === 'Hard' ? 4 : 3;
}

export function problemStars(p: { slug: string; title: string; isTop150: boolean }): number {
  const s = PROBLEM_STARS[p.slug] ?? COURSE_DSA_STARS[normTitle(p.title)];
  if (s) return clamp(s);
  return p.isTop150 ? 4 : 3;
}

export function courseItemStars(title: string, kind: string): number {
  if (kind === 'quiz' || kind === 'test') return COURSE_DSA_STARS[normTitle(title)] ?? 2;
  const s = COURSE_DSA_STARS[normTitle(title)];
  return s ? clamp(s) : 3;
}

// LLD / HLD course lessons. Rated per topic (case studies inherit their
// section's rating) since lesson titles like "Requirements" repeat.
const LLD_TOPIC_STARS: Record<string, number> = {
  'single responsibility principle': 5, 'open closed principle': 5, 'dependency inversion principle': 5,
  'liskov s substitution principle': 5, 'interface segregation principle': 5,
  inheritence: 4, association: 4, composition: 4, aggregation: 4,
  singleton: 5, factory: 5, 'abstract factory': 4, builder: 4,
  decorator: 4, facade: 3, adapter: 4, bridge: 2,
  command: 3, observer: 5, state: 4, strategy: 5,
  'design patterns': 4, 'snakes and ladders game implementation': 4,
};
const LLD_SECTION_STARS: Record<string, number> = {
  'car parking': 5, 'elevator system': 5, 'ticket management system': 4, 'payment processor': 4, logger: 4,
  amazon: 4, whatsapp: 4, 'social media': 4, 'weather station': 3, 'pizza factory': 3,
  'sql query builder': 3, 'car price calculator': 3,
};
const HLD_TOPIC_STARS: Record<string, number> = {
  'what is hld': 3, 'consistent hashing': 5, caching: 5, 'load balancing': 5, 'cap theorem': 5, indexes: 4,
  'redundancy and replication': 4, 'sql vs nosql': 5, 'data partitioning': 5, 'long polling and websockets': 4,
  'retrieval augmented generation rag': 3, 'gen ai enabled api systems': 2, quorum: 3,
};
const HLD_SECTION_STARS: Record<string, number> = {
  'url shortener tinyurl': 5, 'rate limiter': 5, 'typeahead suggestion': 4, pastebin: 3, dropbox: 4,
  'facebook s newsfeed': 5, instagram: 4, 'facebook messenger': 5, 'ticket booking bookmyshow': 4,
};

export function designItemStars(track: 'lld' | 'hld', section: string, title: string, kind: string): number {
  if (kind === 'quiz' || kind === 'test') return 2;
  const topicMap = track === 'lld' ? LLD_TOPIC_STARS : HLD_TOPIC_STARS;
  const sectionMap = track === 'lld' ? LLD_SECTION_STARS : HLD_SECTION_STARS;
  const t = topicMap[normTitle(title)];
  if (t) return t;
  const s = sectionMap[normTitle(section)];
  if (!s) return 3;
  // Inside a case study, videos are optional extras; the design steps carry it.
  return kind === 'video' ? Math.max(1, s - 1) : s;
}
