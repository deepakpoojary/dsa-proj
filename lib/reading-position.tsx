'use client';

// "Pick up where you left off", across devices on the same account.
// While you read Search or Theory we remember: the question nearest the top
// of the screen (and how far it sat from the top), which answer popup was
// open, how far down that popup you'd scrolled, and the notes depth
// (short / detailed / GPT). It's kept in this browser and, when signed in,
// on the account (/api/docs kind 'reading'). Opening the page on any device
// restores the newest copy. Positions are by question, not raw pixels, so
// they land in the right place on a phone and a laptop alike.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

export interface ReadingPos {
  /** Search query the position belongs to (Search only). */
  q?: string;
  /** Key of the question nearest the top of the screen. */
  anchor?: string;
  /** That question's distance from the top of the viewport, px. */
  top?: number;
  /** Key of the question whose answer popup was open. */
  open?: string | null;
  /** How far down the popup was scrolled, 0..1. */
  popup?: number;
  depth?: string;
  at: number;
}

const LOCAL = (page: string) => `reading-pos:v1:${page}`;
const DEPTH_KEY = 'study:notes-depth';
const SERVER_EVERY_MS = 4000;

function readLocal(page: string): ReadingPos | null {
  try {
    const raw = localStorage.getItem(LOCAL(page));
    return raw ? (JSON.parse(raw) as ReadingPos) : null;
  } catch {
    return null;
  }
}

function writeLocal(page: string, pos: ReadingPos) {
  try { localStorage.setItem(LOCAL(page), JSON.stringify(pos)); } catch { /* storage blocked */ }
}

async function readServer(page: string): Promise<ReadingPos | null> {
  try {
    const res = await fetch('/api/docs?kind=reading', { cache: 'no-store' });
    if (!res.ok) return null;
    const { docs } = (await res.json()) as { docs: { docId: string; data: ReadingPos }[] };
    return docs.find((d) => d.docId === page)?.data ?? null;
  } catch {
    return null;
  }
}

function writeServer(page: string, pos: ReadingPos, keepalive = false) {
  void fetch('/api/docs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind: 'reading', docId: page, data: pos, updatedAt: pos.at }),
    keepalive,
  }).catch(() => { /* offline: the browser copy still has it */ });
}

// ── Which popup is open (reported by StudyList) ───────────────────────────

interface ReadingCtxValue {
  /** A question whose popup should open once its list renders. */
  pendingOpen: string | null;
  takePendingOpen: () => void;
  /** StudyList reports its popup opening (key) or closing (null, with the key that closed). */
  reportOpen: (key: string | null, closed?: string | null) => void;
}

export const ReadingCtx = createContext<ReadingCtxValue | null>(null);
export const useReadingCtx = () => useContext(ReadingCtx);

// ── Measuring / restoring ─────────────────────────────────────────────────

function measureAnchor(): { anchor?: string; top?: number } {
  const els = document.querySelectorAll<HTMLElement>('[data-item-key]');
  for (const el of els) {
    if (el.closest('[role=dialog]')) continue;
    const r = el.getBoundingClientRect();
    if (r.height > 0 && r.bottom > 8) return { anchor: el.dataset.itemKey, top: Math.round(r.top) };
  }
  return {};
}

function popupScroller(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[data-reading-popup]');
}

function measurePopup(): number | undefined {
  const el = popupScroller();
  if (!el) return undefined;
  const room = el.scrollHeight - el.clientHeight;
  return room > 0 ? Math.round((el.scrollTop / room) * 1000) / 1000 : 0;
}

function findItem(key: string): HTMLElement | null {
  for (const el of document.querySelectorAll<HTMLElement>('[data-item-key]')) {
    if (el.dataset.itemKey === key && !el.closest('[role=dialog]')) return el;
  }
  return null;
}

/** Waits for the popup to finish loading its answer, then scrolls it to `frac`. */
function restorePopupScroll(frac: number) {
  const until = Date.now() + 6000;
  const tick = () => {
    const el = popupScroller();
    if (el && el.dataset.loading !== '1') {
      requestAnimationFrame(() => {
        const room = el.scrollHeight - el.clientHeight;
        if (room > 0) el.scrollTop = frac * room;
      });
      return;
    }
    if (Date.now() < until) setTimeout(tick, 120);
  };
  setTimeout(tick, 60);
}

/**
 * Saves and restores the reading position of `page`.
 * Search passes its query: a position saved under another query is restored
 * only by switching to that query first (via `onQuery`), and only when the
 * URL didn't ask for a specific search.
 */
export function useReadingPosition({ page, signedIn, q, onQuery }: {
  page: 'search' | 'theory';
  signedIn: boolean;
  q?: string;
  onQuery?: (q: string) => void;
}): ReadingCtxValue {
  const [pendingOpen, setPendingOpen] = useState<string | null>(null);
  const openKey = useRef<string | null>(null);
  /** Saving waits until the restore attempt is over, so it can't overwrite the saved spot with "top of page". */
  const armed = useRef(false);
  const target = useRef<ReadingPos | null>(null);
  const qRef = useRef(q);
  const lastServer = useRef(0);
  const serverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef<ReadingPos | null>(null);
  useEffect(() => { qRef.current = q; }, [q]);

  const flushServer = useCallback((keepalive = false) => {
    if (serverTimer.current) { clearTimeout(serverTimer.current); serverTimer.current = null; }
    if (!signedIn || !latest.current) return;
    lastServer.current = Date.now();
    writeServer(page, latest.current, keepalive);
  }, [page, signedIn]);

  const save = useCallback(() => {
    if (!armed.current) return;
    let depth: string | undefined;
    try { depth = localStorage.getItem(DEPTH_KEY) ?? undefined; } catch { /* ignore */ }
    const pos: ReadingPos = {
      ...(page === 'search' ? { q: (qRef.current ?? '').trim() } : {}),
      ...measureAnchor(),
      open: openKey.current,
      popup: openKey.current ? measurePopup() : undefined,
      depth,
      at: Date.now(),
    };
    latest.current = pos;
    writeLocal(page, pos);
    if (!signedIn || serverTimer.current) return;
    const wait = Math.max(0, SERVER_EVERY_MS - (Date.now() - lastServer.current));
    serverTimer.current = setTimeout(() => flushServer(), wait);
  }, [page, signedIn, flushServer]);

  const scheduleSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(save, 400);
  }, [save]);

  const applyRestore = useCallback(() => {
    const pos = target.current;
    target.current = null;
    if (!pos) return;
    // Don't yank the page if you've already started scrolling or opened something.
    if (window.scrollY > 40 || openKey.current) { armed.current = true; return; }
    if (pos.depth === 'short' || pos.depth === 'detailed' || pos.depth === 'gpt') setDepthEverywhere(pos.depth);
    requestAnimationFrame(() => {
      const el = pos.anchor ? findItem(pos.anchor) : null;
      if (el) window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - (pos.top ?? 0), behavior: 'instant' as ScrollBehavior });
      if (pos.open) {
        setPendingOpen(pos.open);
        if (pos.popup) restorePopupScroll(pos.popup);
      }
      setTimeout(() => { armed.current = true; }, 800);
    });
  }, []);

  // Load the newest saved position (this browser vs the account) once.
  useEffect(() => {
    let live = true;
    (async () => {
      const local = readLocal(page);
      const server = signedIn ? await readServer(page) : null;
      if (!live) return;
      const pos = [local, server].filter(Boolean).sort((a, b) => b!.at - a!.at)[0] ?? null;
      if (!pos || (!pos.anchor && !pos.open)) { armed.current = true; return; }
      if (page === 'search' && (pos.q ?? '') !== (qRef.current ?? '').trim()) {
        const urlAsked = new URLSearchParams(window.location.search).has('q');
        if (urlAsked || !pos.q || !onQuery) { armed.current = true; return; }
        target.current = pos;
        onQuery(pos.q); // the restore runs once the results for it arrive
        return;
      }
      target.current = pos;
      applyRestore();
    })();
    return () => { live = false; };
    // Runs once on mount: later prop changes must not restore again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Search switched to the saved query: restore now that its results are in.
  useEffect(() => {
    const pos = target.current;
    if (pos && page === 'search' && (pos.q ?? '') === (q ?? '').trim()) applyRestore();
  }, [q, page, applyRestore]);

  // Save on scroll (page or popup), and flush when the tab is hidden or closed.
  useEffect(() => {
    const onScroll = () => scheduleSave();
    const onHide = () => {
      if (document.visibilityState === 'hidden') { save(); flushServer(true); }
    };
    const onPageHide = () => { save(); flushServer(true); };
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', onPageHide);
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('scroll', onScroll, { capture: true });
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', onPageHide);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (serverTimer.current) clearTimeout(serverTimer.current);
    };
  }, [scheduleSave, save, flushServer]);

  const reportOpen = useCallback((key: string | null, closed?: string | null) => {
    if (key) openKey.current = key;
    else if (!closed || openKey.current === closed) openKey.current = null;
    else return;
    scheduleSave();
  }, [scheduleSave]);

  const takePendingOpen = useCallback(() => setPendingOpen(null), []);

  return useMemo(() => ({ pendingOpen, takePendingOpen, reportOpen }), [pendingOpen, takePendingOpen, reportOpen]);
}

// The popup reads the depth from storage when it opens, so writing it first is enough.
function setDepthEverywhere(d: 'short' | 'detailed' | 'gpt') {
  try { localStorage.setItem(DEPTH_KEY, d); } catch { /* ignore */ }
}
