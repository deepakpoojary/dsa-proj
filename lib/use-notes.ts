'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface Note {
  body: string;
  updatedAt: number;
}

export type NoteStatus = 'saving' | 'saved' | 'local';

const LOCAL_KEY = 'notes:v1';
const SAVE_DELAY_MS = 600;

function readLocal(): Record<string, Note> {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as Record<string, Note>) : {};
  } catch {
    return {};
  }
}

function writeLocal(notes: Record<string, Note>) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(notes));
  } catch {
    // Storage blocked — notes still live in memory for this visit.
  }
}

async function pushNote(itemId: string, note: Note): Promise<boolean> {
  try {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, body: note.body, updatedAt: note.updatedAt }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Notes keyed by checklist item id. Every keystroke is kept in memory and the
// browser immediately; signed-in users also get a debounced save to
// `user_notes`. On load, server and browser copies merge — newest wins.
export function useNotes(signedIn: boolean) {
  const [notes, setNotes] = useState<Record<string, Note>>({});
  const [status, setStatus] = useState<Record<string, NoteStatus>>({});
  const notesRef = useRef<Record<string, Note>>({});
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const save = useCallback(
    async (itemId: string) => {
      timers.current.delete(itemId);
      const note = notesRef.current[itemId] ?? { body: '', updatedAt: Date.now() };
      if (!signedIn) {
        setStatus((s) => ({ ...s, [itemId]: 'local' }));
        return;
      }
      const ok = await pushNote(itemId, note);
      setStatus((s) => ({ ...s, [itemId]: ok ? 'saved' : 'local' }));
    },
    [signedIn]
  );

  useEffect(() => {
    const local = readLocal();
    notesRef.current = local;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNotes(local);
    if (!signedIn) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/notes');
        if (!res.ok || cancelled) return;
        const { notes: server } = (await res.json()) as { notes: { itemId: string; body: string; updatedAt: number }[] };
        const merged: Record<string, Note> = { ...local };
        for (const n of server) {
          const mine = merged[n.itemId];
          if (!mine || n.updatedAt >= mine.updatedAt) merged[n.itemId] = { body: n.body, updatedAt: n.updatedAt };
        }
        const serverById = new Map(server.map((n) => [n.itemId, n]));
        const newerLocally = Object.entries(local).filter(
          ([id, n]) => n.body.trim() !== '' && (!serverById.has(id) || n.updatedAt > serverById.get(id)!.updatedAt)
        );
        await Promise.all(newerLocally.map(([id, n]) => pushNote(id, n)));
        if (cancelled) return;
        notesRef.current = merged;
        setNotes(merged);
        writeLocal(merged);
      } catch {
        // Offline — keep the browser copy.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [signedIn]);

  // Explicit refresh: server wins, except notes still waiting to save here.
  const refresh = useCallback(async () => {
    if (!signedIn) {
      const local = readLocal();
      notesRef.current = local;
      setNotes(local);
      return;
    }
    try {
      const res = await fetch('/api/notes', { cache: 'no-store' });
      if (!res.ok) return;
      const { notes: server } = (await res.json()) as { notes: { itemId: string; body: string; updatedAt: number }[] };
      const next: Record<string, Note> = {};
      for (const n of server) next[n.itemId] = { body: n.body, updatedAt: n.updatedAt };
      for (const id of timers.current.keys()) {
        if (notesRef.current[id]) next[id] = notesRef.current[id];
      }
      notesRef.current = next;
      setNotes(next);
      writeLocal(next);
    } catch {
      // Offline — keep what we have.
    }
  }, [signedIn]);

  // Flush pending saves if the page is closed mid-typing.
  useEffect(() => {
    const pending = timers.current;
    const flushAll = () => {
      for (const [id, t] of pending) {
        clearTimeout(t);
        const note = notesRef.current[id];
        if (note && signedIn) {
          navigator.sendBeacon?.(
            '/api/notes',
            new Blob([JSON.stringify({ itemId: id, body: note.body, updatedAt: note.updatedAt })], { type: 'application/json' })
          );
        }
      }
      pending.clear();
    };
    window.addEventListener('pagehide', flushAll);
    return () => window.removeEventListener('pagehide', flushAll);
  }, [signedIn]);

  const setNote = useCallback(
    (itemId: string, body: string) => {
      const next = { ...notesRef.current };
      if (body.trim() === '') delete next[itemId];
      else next[itemId] = { body, updatedAt: Date.now() };
      notesRef.current = next;
      setNotes(next);
      writeLocal(next);
      setStatus((s) => ({ ...s, [itemId]: 'saving' }));
      const existing = timers.current.get(itemId);
      if (existing) clearTimeout(existing);
      timers.current.set(itemId, setTimeout(() => void save(itemId), SAVE_DELAY_MS));
    },
    [save]
  );

  const flush = useCallback(
    (itemId: string) => {
      const t = timers.current.get(itemId);
      if (!t) return;
      clearTimeout(t);
      void save(itemId);
    },
    [save]
  );

  return { notes, status, setNote, flush, refresh };
}
