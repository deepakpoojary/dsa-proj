'use client';

// Personal edits to any question's notes (bank questions, theory, course
// items…). The original stays in the code/DB; each user's rewrite is stored
// per item key in user_docs (kind 'note-edit') and synced like journal docs.

import { createContext, useContext, useMemo } from 'react';
import { useDocs, DocStatus } from '@/lib/use-docs';
import type { NoteLine } from '@/lib/answer-notes';
import type { StudyItem } from '@/lib/study-items';

export interface NoteEdit {
  /** Editable text form of the notes — see notesToText / textToNotes. */
  notes: string;
  code: string;
}

interface Ctx {
  edits: Record<string, NoteEdit>;
  setEdit: (key: string, edit: NoteEdit | null) => void;
  status: DocStatus | null;
}

export const NoteEditsCtx = createContext<Ctx | null>(null);
export const useNoteEdits = () => useContext(NoteEditsCtx);

export function NoteEditsProvider({ signedIn, children }: { signedIn: boolean; children: React.ReactNode }) {
  const { docs, setDoc, status } = useDocs<NoteEdit>('note-edit', signedIn);
  const value = useMemo(() => ({ edits: docs, setEdit: setDoc, status }), [docs, setDoc, status]);
  return <NoteEditsCtx.Provider value={value}>{children}</NoteEditsCtx.Provider>;
}

// Text format:
//   # Heading
//   - top-level bullet      (a plain line works too)
//     - nested bullet       (indented)
export function notesToText(notes: NoteLine[] = []): string {
  return notes
    .map((n, i) => (n.heading ? `${i ? '\n' : ''}# ${n.text}` : `${n.level ? '  ' : ''}- ${n.text}`))
    .join('\n');
}

export function textToNotes(text: string): NoteLine[] {
  const out: NoteLine[] = [];
  for (const raw of text.split('\n')) {
    if (!raw.trim()) continue;
    const heading = raw.trim().match(/^#+\s*(.*)$/);
    if (heading) {
      if (heading[1]) out.push({ text: heading[1], level: 0, heading: true });
      continue;
    }
    const nested = /^\s+/.test(raw);
    const body = raw.trim().replace(/^(?:[-*•]|\d+[.)])\s+/, '');
    out.push({ text: body, level: nested ? 1 : 0 });
  }
  return out;
}

export function applyEdits(items: StudyItem[], edits: Record<string, NoteEdit> | undefined): StudyItem[] {
  if (!edits || Object.keys(edits).length === 0) return items;
  return items.map((it) => {
    const e = edits[it.key];
    if (!e) return it;
    return { ...it, notes: textToNotes(e.notes), code: e.code.trim() ? e.code : undefined, edited: true, original: { notes: it.notes, code: it.code } };
  });
}
