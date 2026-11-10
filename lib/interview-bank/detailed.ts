// Long, fresher-friendly versions of the bank answers (ELI5 → how it works →
// walkthrough → mistakes → interview answer). Same ids as the short banks.
// Server-only: served one question at a time by /api/bank-detail so pages
// never ship the whole thing.

import { JAVASCRIPT_1 } from './javascript-part1';
import { JAVASCRIPT_2 } from './javascript-part2';
import { NODE_1 } from './node-part1';
import { NODE_2 } from './node-part2';
import { TYPESCRIPT_1 } from './typescript-part1';
import { TYPESCRIPT_2 } from './typescript-part2';
import { DEVOPS_1 } from './devops-part1';
import { DEVOPS_2 } from './devops-part2';
import type { BankQuestion } from './types';

const BY_SLUG: Record<string, BankQuestion[]> = {
  js: [...JAVASCRIPT_1, ...JAVASCRIPT_2],
  node: [...NODE_1, ...NODE_2],
  ts: [...TYPESCRIPT_1, ...TYPESCRIPT_2],
  devops: [...DEVOPS_1, ...DEVOPS_2],
};

let index: Map<string, BankQuestion> | null = null;

/** Detailed answer for a bank item key (`bank:<slug>/<id>`). */
export function bankDetail(key: string): BankQuestion | undefined {
  if (!index) {
    index = new Map();
    for (const [slug, qs] of Object.entries(BY_SLUG)) for (const q of qs) index.set(`bank:${slug}/${q.id}`, q);
  }
  return index.get(key);
}
