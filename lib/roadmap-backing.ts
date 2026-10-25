// Connects each roadmap lever to the thing you actually study for it, and
// splits the lever's LPA across that material so every checkbox has a price:
//   dsa            → this site's problems (by topic) or the user's course
//   lld / hld      → the user's course syllabus
//   core-cs        → this site's theory questions (by topic)
//   cloud, ai, ... → the built-in study guides
// Anything else falls back to the roadmap's own subtopics.

import { COURSE, CourseItemKind } from './course-syllabus';
import { getGuide, GuideModule } from './study-guides';
import { RoadmapLever, Roadmap, splitLpa } from './salary-roadmap';
import type { StudyStats } from './study-stats';

export type DsaSource = 'site' | 'course';

export interface BackedItem {
  id: string;
  title: string;
  kind?: CourseItemKind;
}

export interface BackedRow {
  id: string;
  title: string;
  group?: string;
  lpa: number;
  total: number;
  done: number;
  href?: string;          // progress tracked on another page of the site
  items?: BackedItem[];   // checkable here
  module?: GuideModule;   // guide content: key points + resources
}

export interface LeverBacking {
  kind: 'course' | 'site' | 'theory' | 'guide' | 'subtopics';
  label: string;
  rows: BackedRow[];
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function withLpa(lever: RoadmapLever, rows: Omit<BackedRow, 'lpa'>[], weights: number[]): BackedRow[] {
  const lpa = splitLpa(lever.lpa, weights, 0.01);
  return rows.map((r, i) => ({ ...r, lpa: lpa[i] }));
}

function countDone(items: BackedItem[], checked: Set<string>) {
  return items.reduce((a, it) => a + (checked.has(it.id) ? 1 : 0), 0);
}

function courseRows(lever: RoadmapLever, track: 'dsa' | 'lld' | 'hld', checked: Set<string>): BackedRow[] {
  const sections = COURSE[track];
  return withLpa(
    lever,
    sections.map((s) => ({
      id: s.id,
      title: s.title,
      group: s.group,
      total: s.items.length,
      done: countDone(s.items, checked),
      items: s.items,
    })),
    sections.map((s) => s.items.length)
  );
}

export function backLever(
  lever: RoadmapLever,
  opts: { roadmap: Roadmap; dsaSource: DsaSource; stats: StudyStats; checked: Set<string> }
): LeverBacking | null {
  const { roadmap, dsaSource, stats, checked } = opts;
  if (lever.key === 'baseline') return null;

  if (lever.key === 'dsa') {
    if (dsaSource === 'site' && stats.problemTopics.length > 0) {
      const topics = stats.problemTopics;
      return {
        kind: 'site',
        label: 'This site’s problems',
        rows: withLpa(
          lever,
          topics.map((t) => ({ id: `site:${t.key}`, title: t.label, total: t.total, done: t.solved, href: t.href })),
          topics.map((t) => t.total)
        ),
      };
    }
    return { kind: 'course', label: 'My course', rows: courseRows(lever, 'dsa', checked) };
  }
  if (lever.key === 'lld') return { kind: 'course', label: 'My course', rows: courseRows(lever, 'lld', checked) };
  if (lever.key === 'system-design') return { kind: 'course', label: 'My course', rows: courseRows(lever, 'hld', checked) };

  if (lever.key === 'core-cs' && stats.theoryTopics.length > 0) {
    const topics = stats.theoryTopics;
    return {
      kind: 'theory',
      label: 'Theory Q&A on this site',
      rows: withLpa(
        lever,
        topics.map((t) => ({ id: `theory:${t.key}`, title: t.label, total: t.total, done: t.solved, href: t.href })),
        topics.map((t) => t.total)
      ),
    };
  }

  const guide = getGuide(lever.key, roadmap.track ?? 'general', roadmap.language ?? null);
  if (guide) {
    return {
      kind: 'guide',
      label: 'Study guide',
      rows: withLpa(
        lever,
        guide.map((m) => ({
          id: m.id,
          title: m.title,
          total: m.tasks.length,
          done: countDone(m.tasks, checked),
          items: m.tasks,
          module: m,
        })),
        guide.map((m) => m.weight)
      ),
    };
  }

  // A lever we have no material for (e.g. one the AI added): its own
  // subtopics become single checkboxes.
  return {
    kind: 'subtopics',
    label: 'Checklist',
    rows: lever.subtopics.map((s) => {
      const item = { id: `roadmap:${lever.key}/${slug(s.name)}`, title: s.name };
      return {
        id: item.id,
        title: s.name,
        lpa: s.lpa,
        total: 1,
        done: checked.has(item.id) ? 1 : 0,
        items: [item],
        href: s.link,
      };
    }),
  };
}

export function unlockedLpa(rows: BackedRow[]): number {
  return rows.reduce((a, r) => a + (r.total > 0 ? (r.lpa * r.done) / r.total : 0), 0);
}
