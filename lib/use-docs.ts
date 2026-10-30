'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type DocKind = 'journal' | 'goal';
export type DocStatus = 'saving' | 'saved' | 'local';

interface Stored<T> {
  data: T;
  updatedAt: number;
}

const SAVE_DELAY_MS = 600;
const localKey = (kind: DocKind) => `docs:${kind}:v1`;

function readLocal<T>(kind: DocKind): Record<string, Stored<T>> {
  try {
    const raw = localStorage.getItem(localKey(kind));
    return raw ? (JSON.parse(raw) as Record<string, Stored<T>>) : {};
  } catch {
    return {};
  }
}

function writeLocal<T>(kind: DocKind, docs: Record<string, Stored<T>>) {
  try {
    localStorage.setItem(localKey(kind), JSON.stringify(docs));
  } catch {
    // Storage blocked — docs still live in memory for this visit.
  }
}

async function pushDoc<T>(kind: DocKind, docId: string, doc: Stored<T> | null): Promise<boolean> {
  try {
    const res = await fetch('/api/docs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, docId, data: doc?.data ?? null, updatedAt: doc?.updatedAt }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Journal days and goals, keyed by doc id. Same sync model as notes: every
// change lands in memory + the browser at once; signed-in users also get a
// debounced save to `user_docs`, and on load newest updatedAt wins.
export function useDocs<T>(kind: DocKind, signedIn: boolean) {
  const [docs, setDocs] = useState<Record<string, T>>({});
  const [status, setStatus] = useState<DocStatus | null>(null);
  const ref = useRef<Record<string, Stored<T>>>({});
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const publish = useCallback((next: Record<string, Stored<T>>) => {
    ref.current = next;
    setDocs(Object.fromEntries(Object.entries(next).map(([id, d]) => [id, d.data])));
  }, []);

  useEffect(() => {
    const local = readLocal<T>(kind);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    publish(local);
    if (!signedIn) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/docs?kind=${kind}`, { cache: 'no-store' });
        if (!res.ok || cancelled) return;
        const { docs: server } = (await res.json()) as { docs: { docId: string; data: T; updatedAt: number }[] };
        const merged: Record<string, Stored<T>> = { ...local };
        const serverById = new Map(server.map((d) => [d.docId, d]));
        for (const d of server) {
          if (!merged[d.docId] || d.updatedAt >= merged[d.docId].updatedAt) merged[d.docId] = { data: d.data, updatedAt: d.updatedAt };
        }
        const newerLocally = Object.entries(local).filter(
          ([id, d]) => !serverById.has(id) || d.updatedAt > serverById.get(id)!.updatedAt
        );
        await Promise.all(newerLocally.map(([id, d]) => pushDoc(kind, id, d)));
        if (cancelled) return;
        publish(merged);
        writeLocal(kind, merged);
      } catch {
        // Offline — keep the browser copy.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [kind, signedIn, publish]);

  // Flush pending saves if the page is closed mid-typing.
  useEffect(() => {
    const pending = timers.current;
    const flushAll = () => {
      for (const [id, t] of pending) {
        clearTimeout(t);
        const doc = ref.current[id];
        if (signedIn) {
          navigator.sendBeacon?.(
            '/api/docs',
            new Blob([JSON.stringify({ kind, docId: id, data: doc?.data ?? null, updatedAt: doc?.updatedAt })], { type: 'application/json' })
          );
        }
      }
      pending.clear();
    };
    window.addEventListener('pagehide', flushAll);
    return () => window.removeEventListener('pagehide', flushAll);
  }, [kind, signedIn]);

  const save = useCallback(
    async (docId: string) => {
      timers.current.delete(docId);
      if (!signedIn) {
        setStatus('local');
        return;
      }
      const ok = await pushDoc(kind, docId, ref.current[docId] ?? null);
      setStatus(ok ? 'saved' : 'local');
    },
    [kind, signedIn]
  );

  // data: null removes the doc.
  const setDoc = useCallback(
    (docId: string, data: T | null) => {
      const next = { ...ref.current };
      if (data === null) delete next[docId];
      else next[docId] = { data, updatedAt: Date.now() };
      publish(next);
      writeLocal(kind, next);
      setStatus('saving');
      const existing = timers.current.get(docId);
      if (existing) clearTimeout(existing);
      timers.current.set(docId, setTimeout(() => void save(docId), SAVE_DELAY_MS));
    },
    [kind, publish, save]
  );

  return { docs, setDoc, status };
}

export const DOC_STATUS_LABEL: Record<DocStatus, string> = {
  saving: 'Saving…',
  saved: 'Saved',
  local: 'Saved on this device',
};
