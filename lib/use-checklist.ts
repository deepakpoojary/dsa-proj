'use client';

import { useCallback, useEffect, useState } from 'react';

const LOCAL_KEY = 'checklist:v1';

function readLocal(): Set<string> {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function writeLocal(ids: Set<string>) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify([...ids]));
  } catch {
    // Storage blocked — state still lives in memory for this visit.
  }
}

async function pushToServer(itemIds: string[], checked: boolean): Promise<boolean> {
  try {
    const res = await fetch('/api/checklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemIds, checked }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Checkbox state for roadmap / course / guide items. Signed-in users sync to
// the `user_checklist` table; the browser copy is always kept too, so the
// page works logged out or before that table has been created.
export function useChecklist(signedIn: boolean) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    const local = readLocal();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChecked(local);
    if (!signedIn) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/checklist');
        if (!res.ok || cancelled) return;
        const { itemIds } = (await res.json()) as { itemIds: string[] };
        const server = new Set(itemIds);
        const merged = new Set([...server, ...local]);
        const missing = [...local].filter((id) => !server.has(id));
        if (missing.length > 0) await pushToServer(missing.slice(0, 500), true);
        if (cancelled) return;
        setChecked(merged);
        writeLocal(merged);
        setSynced(true);
      } catch {
        // Offline — keep the local copy.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [signedIn]);

  const setMany = useCallback(
    (ids: string[], value: boolean) => {
      setChecked((prev) => {
        const next = new Set(prev);
        for (const id of ids) {
          if (value) next.add(id);
          else next.delete(id);
        }
        writeLocal(next);
        return next;
      });
      if (signedIn && ids.length > 0) void pushToServer(ids, value);
    },
    [signedIn]
  );

  const toggle = useCallback((id: string) => setMany([id], !checked.has(id)), [checked, setMany]);

  return { checked, toggle, setMany, synced };
}
