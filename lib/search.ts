// Central search across every question on the site. Two behaviours:
//   • the query names a category ("dsa", "node js", "devops", "os"…) → every
//     question in that category, nothing else;
//   • "<category> <words>" ("node streams") → fuzzy match inside it;
//   • anything else → fuzzy match over all questions.

import Fuse from 'fuse.js';
import type { StudyItem, StudyTopic } from './study-items';

export interface Category {
  key: string;
  label: string;
  topics: string[];
  aliases: string[];
}

export const CATEGORIES: Category[] = [
  { key: 'dsa', label: 'DSA', topics: ['DSA', 'DSA-site'], aliases: ['dsa', 'data structures', 'data structure', 'algorithms', 'algorithm', 'algo', 'leetcode', 'problems', 'ds algo', 'data structures and algorithms'] },
  { key: 'lld', label: 'LLD', topics: ['LLD'], aliases: ['lld', 'low level design', 'low-level design', 'machine coding', 'object oriented design', 'ood'] },
  { key: 'hld', label: 'HLD', topics: ['HLD'], aliases: ['hld', 'high level design', 'high-level design', 'system design', 'sd'] },
  { key: 'js', label: 'JavaScript', topics: ['JS'], aliases: ['js', 'javascript', 'java script', 'ecmascript', 'es6', 'vanilla js'] },
  { key: 'node', label: 'Node.js', topics: ['Node'], aliases: ['node', 'nodejs', 'node js', 'node.js', 'express', 'expressjs'] },
  { key: 'ts', label: 'TypeScript', topics: ['TS'], aliases: ['ts', 'typescript', 'type script'] },
  { key: 'devops', label: 'DevOps', topics: ['DevOps'], aliases: ['devops', 'dev ops', 'cloud', 'infra', 'infrastructure'] },
  { key: 'os', label: 'Operating Systems', topics: ['OS'], aliases: ['os', 'operating system', 'operating systems'] },
  { key: 'oops', label: 'OOPs', topics: ['OOPs'], aliases: ['oop', 'oops', 'object oriented', 'object oriented programming', 'object-oriented programming'] },
  { key: 'cn', label: 'Computer Networks', topics: ['CN'], aliases: ['cn', 'networks', 'networking', 'computer networks', 'computer network'] },
  { key: 'dbms', label: 'DBMS', topics: ['DBMS'], aliases: ['dbms', 'database', 'databases', 'db'] },
  { key: 'sql', label: 'SQL', topics: ['SQL'], aliases: ['sql', 'mysql', 'postgres', 'queries'] },
  { key: 'theory', label: 'CS fundamentals', topics: ['OS', 'OOPs', 'CN', 'DBMS', 'SQL'], aliases: ['theory', 'cs fundamentals', 'core cs', 'cs'] },
];

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9.+#]+/g, ' ').trim();

export function matchCategory(q: string): { category: Category; rest: string } | null {
  const n = norm(q);
  if (!n) return null;
  let best: { category: Category; rest: string; len: number } | null = null;
  for (const c of CATEGORIES) {
    for (const a of c.aliases) {
      const na = norm(a);
      if (n === na || n.startsWith(na + ' ')) {
        if (!best || na.length > best.len) best = { category: c, rest: n.slice(na.length).trim(), len: na.length };
      }
    }
  }
  return best && { category: best.category, rest: best.rest };
}

export interface SearchResult {
  category: Category | null;
  rest: string;
  items: StudyItem[];
}

export function searchItems(q: string, all: StudyItem[], topics: Record<string, StudyTopic>): SearchResult {
  const m = matchCategory(q);
  let pool = all;
  let text = q.trim();
  if (m) {
    pool = all.filter((i) => m.category.topics.includes(i.topic));
    text = m.rest;
  }
  if (!text) return { category: m?.category ?? null, rest: '', items: pool };

  const docs = pool.map((item) => ({
    item,
    title: item.title,
    group: item.group ?? '',
    topic: topics[item.topic]?.label ?? item.topic,
    notes: (item.notes ?? []).map((n) => n.text).join(' '),
  }));
  const fuse = new Fuse(docs, {
    keys: [
      { name: 'title', weight: 0.55 },
      { name: 'group', weight: 0.2 },
      { name: 'topic', weight: 0.15 },
      { name: 'notes', weight: 0.1 },
    ],
    threshold: 0.32,
    ignoreLocation: true,
    minMatchCharLength: 2,
  });
  return { category: m?.category ?? null, rest: text, items: fuse.search(text, { limit: 300 }).map((r) => r.item.item) };
}
