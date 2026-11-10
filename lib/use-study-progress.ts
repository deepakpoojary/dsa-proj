'use client';

import { useCallback, useEffect, useState } from 'react';
import { useChecklist } from './use-checklist';
import type { StudyItem } from './study-items';

// Done-state for a mixed list of StudyItems: theory questions and site
// problems go to their own progress tables (they earn ₹), everything else
// (bank questions, course lessons) to the synced checklist.
export function useStudyProgress(items: StudyItem[], signedIn: boolean) {
  const { checked, setMany } = useChecklist(signedIn);
  const [serverDone, setServerDone] = useState<Set<string>>(
    () => new Set(items.filter((i) => i.done).map((i) => i.key))
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setServerDone(new Set(items.filter((i) => i.done).map((i) => i.key)));
  }, [items]);

  const isDone = useCallback(
    (it: StudyItem) => (it.progress.kind === 'checklist' ? checked.has(it.progress.id) : serverDone.has(it.key)),
    [checked, serverDone]
  );

  const onToggle = useCallback(
    (it: StudyItem, done: boolean) => {
      const p = it.progress;
      if (p.kind === 'checklist') {
        setMany([p.id], done);
        return;
      }
      const flip = (value: boolean) =>
        setServerDone((prev) => {
          const next = new Set(prev);
          if (value) next.add(it.key);
          else next.delete(it.key);
          return next;
        });
      flip(done);
      const [url, body] =
        p.kind === 'theory'
          ? ['/api/theory-progress', { questionId: p.id, solved: done }]
          : ['/api/progress', { problemId: p.id, solved: done }];
      fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then((r) => { if (!r.ok) flip(!done); })
        .catch(() => flip(!done));
    },
    [setMany]
  );

  return { isDone, onToggle, checked, serverDone };
}
