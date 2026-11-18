import { JAVASCRIPT } from './javascript';
import { NODE } from './node';
import { TYPESCRIPT } from './typescript';
import { DEVOPS } from './devops';
import { INDIAN_STATES } from './states';
import { AI_ENGINEER } from './ai';
import { PYTHON } from './python';
import { GENAI } from './genai';
import { SQL_BANK } from './sql';
import { POSTGRES } from './postgres';
import { MONGODB } from './mongodb';
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
  { key: 'Python', slug: 'python', label: 'Python', color: '#4b8bbe', questions: PYTHON },
  { key: 'GenAI', slug: 'genai', label: 'Gen AI', color: '#a371f7', questions: GENAI },
  // 'SQL' is taken by the CS-fundamentals theory topic, hence a separate key.
  { key: 'SQLBank', slug: 'sql', label: 'SQL Interview', color: '#e8912d', questions: SQL_BANK },
  { key: 'Postgres', slug: 'postgres', label: 'PostgreSQL', color: '#336791', questions: POSTGRES },
  { key: 'MongoDB', slug: 'mongodb', label: 'MongoDB', color: '#47a248', questions: MONGODB },
  { key: 'States', slug: 'states', label: 'Indian States', color: '#ff9933', questions: INDIAN_STATES },
];

export const bankItemId = (slug: string, id: string) => `bank:${slug}/${id}`;
