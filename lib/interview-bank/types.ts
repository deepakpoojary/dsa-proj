// Static interview question banks (JavaScript, Node.js, TypeScript, DevOps).
// They live in the repo rather than Supabase so they ship with the code;
// progress is tracked through the generic `user_checklist` sync under ids
// shaped `bank:<topic>/<id>`.

export type Stars = 1 | 2 | 3 | 4 | 5;

export interface BankQuestion {
  /** Unique within its bank, kebab-case, e.g. "closures". */
  id: string;
  /** Sub-area inside the topic, e.g. "Scope & Closures". */
  group: string;
  /** Interview importance: 5 = asked almost everywhere, 1 = rare / trivia. */
  stars: Stars;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  q: string;
  /** The answer as revision notes: one short bullet per entry. */
  a: string[];
  /** Optional short code snippet shown under the notes. */
  code?: string;
}
