// Resolves every checklist item id (course lessons, guide tasks, roadmap
// subtopics) back to a title + where it lives, for the Revision page.

import { COURSE, CourseItemKind } from './course-syllabus';
import { getGuide } from './study-guides';
import type { Roadmap, Track } from './salary-roadmap';

export interface CatalogItem {
  id: string;
  title: string;
  area: string;
  section: string;
  kind?: CourseItemKind;
}

const TRACKS: Track[] = ['backend', 'frontend', 'fullstack', 'mobile', 'data', 'devops', 'qa', 'general'];
const LANGS: (string | null)[] = [null, 'java', 'node', 'python', 'go', 'dotnet'];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function buildCatalog(roadmap: Roadmap | null): Map<string, CatalogItem> {
  const m = new Map<string, CatalogItem>();
  const add = (item: CatalogItem) => {
    if (!m.has(item.id)) m.set(item.id, item);
  };

  const courseAreas: [keyof typeof COURSE, string][] = [['dsa', 'DSA'], ['lld', 'LLD'], ['hld', 'System Design']];
  for (const [track, area] of courseAreas) {
    for (const s of COURSE[track]) {
      for (const it of s.items) add({ id: it.id, title: it.title, area, section: s.title, kind: it.kind });
    }
  }

  // The user's own stack first, so its titles win for shared module ids.
  const stackCombos: [Track, string | null][] = [
    ...(roadmap ? [[roadmap.track ?? 'general', roadmap.language ?? null] as [Track, string | null]] : []),
    ...TRACKS.flatMap((t) => LANGS.map((l) => [t, l] as [Track, string | null])),
  ];
  for (const [t, l] of stackCombos) {
    for (const mod of getGuide('stack-depth', t, l) ?? []) {
      for (const task of mod.tasks) add({ id: task.id, title: task.title, area: 'Stack depth', section: mod.title });
    }
  }

  const guideAreas: [string, string][] = [['cloud', 'Cloud & DevOps'], ['ai', 'AI / LLM'], ['proof', 'Projects & profile'], ['negotiation', 'Negotiation']];
  for (const [key, area] of guideAreas) {
    for (const mod of getGuide(key) ?? []) {
      for (const task of mod.tasks) add({ id: task.id, title: task.title, area, section: mod.title });
    }
  }

  for (const lever of roadmap?.levers ?? []) {
    for (const s of lever.subtopics) {
      add({ id: `roadmap:${lever.key}/${slug(s.name)}`, title: s.name, area: lever.name, section: '' });
    }
  }

  return m;
}

// Fallback for ids no longer in the catalog (e.g. a guide that changed).
export function describeUnknown(id: string): CatalogItem {
  const last = id.split('/').pop() ?? id;
  const title = last.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
  return { id, title, area: 'Other', section: '' };
}
