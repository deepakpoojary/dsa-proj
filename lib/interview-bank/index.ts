import { JAVASCRIPT } from './javascript';
import { NODE } from './node';
import { TYPESCRIPT } from './typescript';
import { DEVOPS } from './devops';
import { INDIAN_STATES } from './states';
import { AI_ENGINEER } from './ai';
import type { BankQuestion } from './types';

export type { BankQuestion } from './types';

export interface BankTopic {
  key: string;      // topic key used across the theory page and search
  slug: string;     // used in checklist ids: bank:<slug>/<question id>
  label: string;
  color: string;
  questions: BankQuestion[];
}

export const BANK_TOPICS: BankTopic[] = [
  { key: 'JS', slug: 'js', label: 'JavaScript', color: '#e3b341', questions: JAVASCRIPT },
  { key: 'Node', slug: 'node', label: 'Node.js', color: '#3fb950', questions: NODE },
  { key: 'TS', slug: 'ts', label: 'TypeScript', color: '#58a6ff', questions: TYPESCRIPT },
  { key: 'DevOps', slug: 'devops', label: 'DevOps', color: '#f778ba', questions: DEVOPS },
  { key: 'AI', slug: 'ai', label: 'AI Engineer', color: '#d2a8ff', questions: AI_ENGINEER },
  { key: 'States', slug: 'states', label: 'Indian States', color: '#ff9933', questions: INDIAN_STATES },
];

export const bankItemId = (slug: string, id: string) => `bank:${slug}/${id}`;
