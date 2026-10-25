'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { schedule, Grade, ReviewState } from './spaced-repetition';

const LOCAL_KEY = 'reviews:v1';

function readLocal(): Record<string, ReviewState> {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as Record<string, ReviewState>) : {};
  } catch {
    return {};
  }
}

function writeLocal(reviews: Record<string, ReviewState>) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(reviews));
  } catch {
    // Storage blocked — schedule still lives in memory for this visit.
  }
}

async function pushReview(itemId: string, state: ReviewState | null): Promise<boolean> {
  try {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, state }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Spaced-repetition schedule per item. Same sync model as notes: browser copy
// always, `user_reviews` for signed-in users, newest updatedAt wins on load.
export function useReviews(signedIn: boolean) {
  const [reviews, setReviews] = useState<Record<string, ReviewState>>({});
  const ref = useRef<Record<string, ReviewState>>({});

  useEffect(() => {
    const local = readLocal();
    ref.current = local;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReviews(local);
    if (!signedIn) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/reviews');
        if (!res.ok || cancelled) return;
        const { reviews: server } = (await res.json()) as { reviews: { itemId: string; state: ReviewState }[] };
        const merged: Record<string, ReviewState> = { ...local };
        const serverById = new Map(server.map((r) => [r.itemId, r.state]));
        for (const [id, s] of serverById) {
          if (!merged[id] || s.updatedAt >= merged[id].updatedAt) merged[id] = s;
        }
        const newerLocally = Object.entries(local).filter(([id, s]) => !serverById.has(id) || s.updatedAt > serverById.get(id)!.updatedAt);
        await Promise.all(newerLocally.map(([id, s]) => pushReview(id, s)));
        if (cancelled) return;
        ref.current = merged;
        setReviews(merged);
        writeLocal(merged);
      } catch {
        // Offline — keep the browser copy.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [signedIn]);

  // Explicit refresh: newest updatedAt wins per item, as on load.
  const refresh = useCallback(async () => {
    if (!signedIn) {
      const local = readLocal();
      ref.current = local;
      setReviews(local);
      return;
    }
    try {
      const res = await fetch('/api/reviews', { cache: 'no-store' });
      if (!res.ok) return;
      const { reviews: server } = (await res.json()) as { reviews: { itemId: string; state: ReviewState }[] };
      const next: Record<string, ReviewState> = { ...ref.current };
      for (const r of server) {
        if (!next[r.itemId] || r.state.updatedAt >= next[r.itemId].updatedAt) next[r.itemId] = r.state;
      }
      ref.current = next;
      setReviews(next);
      writeLocal(next);
    } catch {
      // Offline — keep what we have.
    }
  }, [signedIn]);

  const grade = useCallback(
    (itemId: string, g: Grade) => {
      const next = { ...ref.current, [itemId]: schedule(ref.current[itemId], g) };
      ref.current = next;
      setReviews(next);
      writeLocal(next);
      if (signedIn) void pushReview(itemId, next[itemId]);
    },
    [signedIn]
  );

  return { reviews, grade, refresh };
}
