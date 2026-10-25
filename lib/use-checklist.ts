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

async function fetchServer(): Promise<Set<string> | null> {
  try {
    const res = await fetch('/api/checklist', { cache: 'no-store' });
    if (!res.ok) return null;
    const { itemIds } = (await res.json()) as { itemIds: string[] };
    return new Set(itemIds);
  } catch {
    return null;
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
      const server = await fetchServer();
      if (!server || cancelled) return;
      // First load: union, so anything ticked offline / before the table
      // existed gets uploaded rather than lost.
      const missing = [...local].filter((id) => !server.has(id));
      if (missing.length > 0) await pushToServer(missing.slice(0, 500), true);
      if (cancelled) return;
      const merged = new Set([...server, ...local]);
      setChecked(merged);
      writeLocal(merged);
      setSynced(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [signedIn]);

  // Explicit refresh: the server is the source of truth, so items unticked on
  // another device disappear here too.
  const refresh = useCallback(async () => {
    if (!signedIn) {
      setChecked(readLocal());
      return;
    }
    const server = await fetchServer();
    if (!server) return;
    setChecked(server);
    writeLocal(server);
    setSynced(true);
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

  return { checked, toggle, setMany, synced, refresh };
}
