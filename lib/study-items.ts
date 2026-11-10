// One shape for every reviewable question on the site — theory Q&A from the
// database, the static JS/Node/TS/DevOps banks, the course DSA syllabus and
// (optionally) this site's own DSA problems — so the theory page, the DSA
// page and the global search can all render them with the same list/popup.
//
// This module is client-safe; the builders for the big static banks, the
// course syllabus and site problems live in study-items.server.ts so they
// never end up in a client bundle.

import type { TheoryQuestion } from '@/types/theory';
import { answerToNotes, NoteLine } from './answer-notes';
import { theoryStars } from './importance';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type Progress =
  | { kind: 'theory'; id: string }      // theory_progress (earns ₹)
  | { kind: 'problem'; id: string }     // user_progress (earns ₹)
  | { kind: 'checklist'; id: string };  // user_checklist (synced ticks)

export interface StudyItem {
  key: string;
  topic: string;
  group?: string;
  title: string;
  stars: number;
  difficulty?: Difficulty;
  notes?: NoteLine[];
  code?: string;
  progress: Progress;
  /** Server-known done state (theory/problem). Checklist state is client-side. */
  done: boolean;
  links?: { label: string; href: string }[];
  /** Course lesson kind (quiz / test / reading) — shows an icon. */
  kind?: string;
  /** Items without an answer get a personal-note button under this id instead. */
  noteId?: string;
  /** For DB theory questions — needed to keep admin editing working. */
  theory?: TheoryQuestion;
  /** Set client-side when the user has rewritten this item's notes. */
  edited?: boolean;
  /** A long, beginner-friendly version can be fetched from /api/bank-detail. */
  hasDetail?: boolean;
  original?: { notes?: NoteLine[]; code?: string };
}

export interface StudyTopic {
  key: string;
  label: string;
  color: string;
  source: 'db' | 'bank' | 'dsa';
  enabled?: boolean;
}

export function theoryItems(questions: TheoryQuestion[]): StudyItem[] {
  return questions.map((q) => ({
    key: `theory:${q.id}`,
    topic: q.topic,
    title: q.question,
    stars: theoryStars(q),
    difficulty: q.difficulty,
    notes: answerToNotes(q.answer),
    progress: { kind: 'theory', id: q.id },
    done: q.solved,
    theory: q,
  }));
}

export const DSA_TOPIC: StudyTopic = { key: 'DSA', label: 'DSA · course', color: '#bc8cff', source: 'dsa' };
export const LLD_TOPIC: StudyTopic = { key: 'LLD', label: 'LLD · course', color: '#39c5cf', source: 'dsa' };
export const HLD_TOPIC: StudyTopic = { key: 'HLD', label: 'HLD · system design', color: '#ff7b72', source: 'dsa' };
export const SITE_DSA_TOPIC: StudyTopic = { key: 'DSA-site', label: 'DSA · site problems', color: '#a371f7', source: 'dsa' };

// Cookie that turns this site's own DSA problems back on (off by default —
// the course syllabus is the main DSA list).
export const SITE_DSA_COOKIE = 'dsa_site_problems';
