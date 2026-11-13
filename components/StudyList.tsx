'use client';

import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { StudyItem, StudyTopic } from '@/lib/study-items';
import type { NoteLine } from '@/lib/answer-notes';
import Stars from './Stars';
import { NoteButton, NotesCtx } from './Notes';
import { applyEdits, notesToText, textToNotes, useNoteEdits } from './NoteEdits';
import Markdown from './Markdown';

export type ListMode = 'notes' | 'inline';

const DIFF_COLOR: Record<string, string> = { Easy: '#3fb950', Medium: '#d29922', Hard: '#f85149' };
const KIND_ICON: Record<string, string> = { reading: '🧩', quiz: '❓', video: '🎬', test: '🧪' };

// `code` spans inside note text.
function Inline({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('`') && p.endsWith('`') && p.length > 2 ? (
          <code key={i} style={{ background: 'rgba(110,118,129,0.2)', borderRadius: '4px', padding: '0 4px', fontSize: '0.92em', fontFamily: 'var(--font-geist-mono), monospace' }}>
            {p.slice(1, -1)}
          </code>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

export function NotesBody({ notes, code }: { notes?: NoteLine[]; code?: string }) {
  return (
    <div style={{ fontSize: '0.86rem', lineHeight: 1.6, color: '#c9d1d9' }}>
      {notes && notes.length > 0 && (
        <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {notes.map((n, i) =>
            n.heading ? (
              <li key={i} style={{ listStyle: 'none', marginLeft: '-1.1rem', marginTop: i ? '6px' : 0, color: '#e6edf3', fontWeight: 600, fontSize: '0.8rem' }}>
                <Inline text={n.text} />
              </li>
            ) : (
              <li key={i} style={{ marginLeft: n.level ? '1rem' : 0, listStyle: n.level ? 'circle' : 'disc' }}>
                <Inline text={n.text} />
              </li>
            )
          )}
        </ul>
      )}
      {code && (
        <pre
          style={{
            margin: notes?.length ? '0.8rem 0 0' : 0, padding: '0.7rem 0.85rem', background: '#0d1117', border: '1px solid #30363d',
            borderRadius: '8px', overflowX: 'auto', fontSize: '0.78rem', lineHeight: 1.55, color: '#e6edf3',
            fontFamily: 'var(--font-geist-mono), monospace',
          }}
        >
          {code}
        </pre>
      )}
    </div>
  );
}

function DoneBox({
  item, done, canTrack, onToggle, color,
}: { item: StudyItem; done: boolean; canTrack: boolean; onToggle: (item: StudyItem, done: boolean) => void; color: string }) {
  if (!canTrack && item.progress.kind !== 'checklist') {
    return (
      <a href="/login" title="Log in to track progress" onClick={(e) => e.stopPropagation()} style={{ fontSize: '0.8rem', color: '#6e7681', textDecoration: 'none', width: '16px', textAlign: 'center' }}>
        ○
      </a>
    );
  }
  return (
    <input
      type="checkbox"
      checked={done}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => onToggle(item, e.target.checked)}
      title={done ? 'Mark as not revised' : 'Mark as revised'}
      style={{ accentColor: color, cursor: 'pointer', flexShrink: 0 }}
    />
  );
}

// ── Short / Detailed / GPT ─────────────────────────────────────────────────

export type Depth = 'short' | 'detailed' | 'gpt';
const DEPTH_KEY = 'study:notes-depth';
const depthListeners = new Set<(d: Depth) => void>();

// Which version of the notes to show; remembered and shared by every popup.
function useDepth(): [Depth, (d: Depth) => void] {
  const [depth, setDepthState] = useState<Depth>('short');
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DEPTH_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved === 'detailed' || saved === 'gpt') setDepthState(saved);
    } catch { /* storage blocked */ }
    depthListeners.add(setDepthState);
    return () => { depthListeners.delete(setDepthState); };
  }, []);
  const set = useCallback((d: Depth) => {
    for (const l of depthListeners) l(d);
    try { localStorage.setItem(DEPTH_KEY, d); } catch { /* ignore */ }
  }, []);
  return [depth, set];
}

interface Detail { notes: NoteLine[]; code: string | null }
const detailCache = new Map<string, Promise<Detail | null>>();
function fetchDetail(key: string): Promise<Detail | null> {
  let p = detailCache.get(key);
  if (!p) {
    p = fetch(`/api/bank-detail?key=${encodeURIComponent(key)}`)
      .then((r) => (r.ok ? (r.json() as Promise<Detail>) : null))
      .catch(() => null);
    p.then((d) => { if (!d) detailCache.delete(key); });
    detailCache.set(key, p);
  }
  return p;
}

function useDetail(key: string | null): { detail: Detail | null; loading: boolean } {
  const [state, setState] = useState<{ key: string | null; detail: Detail | null }>({ key: null, detail: null });
  useEffect(() => {
    if (!key) return;
    let live = true;
    fetchDetail(key).then((d) => { if (live) setState({ key, detail: d }); });
    return () => { live = false; };
  }, [key]);
  const ready = state.key === key;
  return { detail: ready ? state.detail : null, loading: !!key && !ready };
}

const gptCache = new Map<string, Promise<string | null>>();
function fetchGpt(key: string): Promise<string | null> {
  let p = gptCache.get(key);
  if (!p) {
    p = fetch(`/api/bank-gpt?key=${encodeURIComponent(key)}`)
      .then((r) => (r.ok ? (r.json() as Promise<{ markdown: string }>) : null))
      .then((d) => d?.markdown ?? null)
      .catch(() => null);
    p.then((d) => { if (!d) gptCache.delete(key); });
    gptCache.set(key, p);
  }
  return p;
}

function useGpt(key: string | null): { markdown: string | null; loading: boolean } {
  const [state, setState] = useState<{ key: string | null; markdown: string | null }>({ key: null, markdown: null });
  useEffect(() => {
    if (!key) return;
    let live = true;
    fetchGpt(key).then((d) => { if (live) setState({ key, markdown: d }); });
    return () => { live = false; };
  }, [key]);
  const ready = state.key === key;
  return { markdown: ready ? state.markdown : null, loading: !!key && !ready };
}

/** The depths this item offers, in toggle / T-key order. */
function depthsFor(item: StudyItem): Depth[] {
  const out: Depth[] = ['short'];
  if (item.hasDetail) out.push('detailed');
  if (item.hasGpt) out.push('gpt');
  return out;
}
/** The chosen depth if this item has it, else the short notes. */
function effectiveDepth(item: StudyItem, depth: Depth): Depth {
  return depthsFor(item).includes(depth) ? depth : 'short';
}

// Copies the question text (e.g. to paste into ChatGPT / Gemini).
function CopyQuestion({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(true);
  };
  return (
    <button type="button" onClick={copy} title="Copy question (C)" aria-label="Copy question" data-copy-question
      style={{
        background: 'none', border: '1px solid #30363d', borderRadius: '6px', color: copied ? '#3fb950' : '#8b949e',
        fontSize: '0.72rem', padding: '2px 8px', cursor: 'pointer', whiteSpace: 'nowrap', lineHeight: 1.4,
      }}>
      {copied ? '✓ Copied' : '⧉ Copy question'}
    </button>
  );
}

function DepthToggle({ depth, onChange, depths = ['short', 'detailed'] }: { depth: Depth; onChange: (d: Depth) => void; depths?: Depth[] }) {
  const opt = (d: Depth, label: string, title: string) => (
    <button key={d} type="button" title={title} onClick={() => onChange(d)}
      style={{
        border: 'none', borderRadius: '6px', padding: '2px 10px', fontSize: '0.72rem', cursor: 'pointer',
        background: depth === d ? 'rgba(88,166,255,0.15)' : 'transparent', color: depth === d ? '#58a6ff' : '#8b949e',
        fontWeight: depth === d ? 600 : 400,
      }}>
      {label}
    </button>
  );
  return (
    <div style={{ display: 'inline-flex', gap: '2px', border: '1px solid #30363d', borderRadius: '8px', padding: '2px' }}>
      {opt('short', '⚡ Short', 'Quick revision notes (T to switch)')}
      {depths.includes('detailed') && opt('detailed', '📖 Detailed', 'Explained from scratch: ELI5, how it works, walkthrough, mistakes, interview answer (T to switch)')}
      {depths.includes('gpt') && opt('gpt', '🤖 GPT', 'How ChatGPT / Gemini would answer this if you asked it from scratch (T to switch)')}
    </div>
  );
}

function Loading({ what = 'the detailed explanation' }: { what?: string }) {
  return <div style={{ fontSize: '0.82rem', color: '#8b949e', padding: '0.5rem 0' }}>Loading {what}…</div>;
}

// ── Popup ──────────────────────────────────────────────────────────────────

/** What the popup shows: notes (+code) for short/detailed, markdown for GPT. */
interface View {
  notes?: NoteLine[];
  code?: string;
  markdown?: string;
  edited: boolean;
  editKey: string;
  original?: { notes?: NoteLine[]; code?: string };
  originalMarkdown?: string;
}

function AnswerPopup({
  items, index, topics, isDone, canTrack, onToggle, onIndex, onClose, startEditing = false,
}: {
  items: StudyItem[];
  index: number;
  topics: Record<string, StudyTopic>;
  isDone: (item: StudyItem) => boolean;
  canTrack: boolean;
  onToggle: (item: StudyItem, done: boolean) => void;
  onIndex: (i: number) => void;
  onClose: () => void;
  startEditing?: boolean;
}) {
  const item = items[index];
  const editCtx = useNoteEdits();
  const [depth, setDepth] = useDepth();
  const depths = depthsFor(item);
  const shown = effectiveDepth(item, depth);
  const showDetail = shown === 'detailed';
  const showGpt = shown === 'gpt';
  const { detail, loading: detailLoading } = useDetail(showDetail ? item.key : null);
  const { markdown: gpt, loading: gptLoading } = useGpt(showGpt ? item.key : null);
  const loading = detailLoading || gptLoading;
  // Warm the next question so stepping through stays instant.
  const next = items[index + 1];
  const nextDetail = showDetail && next?.hasDetail ? next.key : null;
  const nextGpt = showGpt && next?.hasGpt ? next.key : null;
  useEffect(() => { if (nextDetail) void fetchDetail(nextDetail); }, [nextDetail]);
  useEffect(() => { if (nextGpt) void fetchGpt(nextGpt); }, [nextGpt]);

  // The version on screen. Short = the item (user edits already applied);
  // detailed = fetched notes, with the user's own detailed rewrite on top.
  const view = useMemo((): View => {
    if (showGpt) {
      // GPT answers are markdown; an edit keeps the whole markdown in `notes`.
      const editKey = `${item.key}#gpt`;
      const e = editCtx?.edits[editKey];
      const base = gpt ?? '';
      return { markdown: e ? e.notes : base, originalMarkdown: base, edited: !!e, editKey };
    }
    if (!showDetail) {
      return {
        notes: item.notes, code: item.code, edited: !!item.edited, editKey: item.key,
        original: item.edited ? item.original : { notes: item.notes, code: item.code },
      };
    }
    const base = { notes: detail?.notes, code: detail?.code ?? undefined };
    const editKey = `${item.key}#long`;
    const e = editCtx?.edits[editKey];
    return e
      ? { notes: textToNotes(e.notes), code: e.code.trim() ? e.code : undefined, edited: true, editKey, original: base }
      : { ...base, edited: false, editKey, original: base };
  }, [showGpt, gpt, showDetail, item, detail, editCtx?.edits]);

  const [editing, setEditing] = useState(startEditing && !!editCtx);
  const [draftNotes, setDraftNotes] = useState(() => (startEditing ? notesToText(item.notes) : ''));
  const [draftCode, setDraftCode] = useState(() => (startEditing ? item.code ?? '' : ''));
  const beginEdit = useCallback(() => {
    if (loading) return;
    setDraftNotes(view.markdown !== undefined ? view.markdown : notesToText(view.notes));
    setDraftCode(view.code ?? '');
    setEditing(true);
  }, [view, loading]);
  const saveEdit = () => {
    if (!editCtx) return;
    if (view.originalMarkdown !== undefined) {
      const same = draftNotes.trim() === view.originalMarkdown.trim();
      editCtx.setEdit(view.editKey, same ? null : { notes: draftNotes, code: '' });
      setEditing(false);
      return;
    }
    const orig = view.original;
    const sameAsOriginal = draftNotes.trim() === notesToText(orig?.notes).trim() && draftCode.trim() === (orig?.code ?? '').trim();
    editCtx.setEdit(view.editKey, sameAsOriginal ? null : { notes: draftNotes, code: draftCode });
    setEditing(false);
  };
  const resetEdit = () => {
    editCtx?.setEdit(view.editKey, null);
    setEditing(false);
  };
  const go = (i: number) => { setEditing(false); onIndex(i); };
  const switchDepth = useCallback((d: Depth) => { setEditing(false); setDepth(d); }, [setDepth]);
  const topic = topics[item.topic];
  const color = topic?.color ?? '#58a6ff';
  const done = isDone(item);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (editing) {
        if (e.key === 'Escape') setEditing(false);
        return;
      }
      if ((e.target as HTMLElement | null)?.closest?.('input[type=text], textarea')) return;
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight' && index < items.length - 1) onIndex(index + 1);
      else if (e.key === 'ArrowLeft' && index > 0) onIndex(index - 1);
      else if (e.key.toLowerCase() === 'e' && editCtx) { e.preventDefault(); beginEdit(); }
      else if (e.key.toLowerCase() === 't' && depths.length > 1) switchDepth(depths[(depths.indexOf(shown) + 1) % depths.length]);
      else if (e.key.toLowerCase() === 'c' && !e.ctrlKey && !e.metaKey && !window.getSelection()?.toString()) {
        (document.querySelector('[role=dialog] [data-copy-question]') as HTMLButtonElement | null)?.click();
      }
      else if (e.key.toLowerCase() === 'd' && (canTrack || item.progress.kind === 'checklist')) onToggle(item, !done);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [index, items.length, item, done, canTrack, onIndex, onClose, onToggle, editing, editCtx, beginEdit, switchDepth, depths, shown]);

  const navBtn: React.CSSProperties = {
    background: '#21262d', border: '1px solid #30363d', color: '#c9d1d9', borderRadius: '6px',
    padding: '3px 10px', fontSize: '0.75rem', cursor: 'pointer',
  };

  return (
    <div
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(1,4,9,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
      }}
    >
      <div
        role="dialog"
        aria-label={item.title}
        style={{
          width: '100%', maxWidth: '680px', maxHeight: '88vh', background: '#161b22', border: '1px solid #30363d',
          borderTop: `3px solid ${color}`, borderRadius: '12px', boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        <div style={{ padding: '0.9rem 1.1rem 0.7rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', borderBottom: '1px solid #21262d' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.68rem', color: '#8b949e', marginBottom: '4px', flexWrap: 'wrap' }}>
              <span style={{ color }}>{topic?.label ?? item.topic}</span>
              {item.group && <span>· {item.group}</span>}
              <Stars value={item.stars} />
              {item.difficulty && <span style={{ color: DIFF_COLOR[item.difficulty] }}>{item.difficulty}</span>}
              {view.edited && <span style={{ color: '#d29922' }} title="You've edited these notes">✏️ edited</span>}
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#e6edf3', lineHeight: 1.45 }}>{item.title}</div>
            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {depths.length > 1 && <DepthToggle depth={shown} onChange={switchDepth} depths={depths} />}
              <CopyQuestion text={item.title} />
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', color: '#8b949e', fontSize: '1.2rem', cursor: 'pointer', lineHeight: 1 }}>
            ×
          </button>
        </div>

        <div style={{ padding: '0.9rem 1.1rem', overflowY: 'auto', flex: 1 }}>
          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#8b949e' }}>
                {showGpt
                  ? <>Markdown · <code>## Heading</code> · <code>- list</code> · <code>**bold**</code> · <code>{'```js'}</code> code blocks · <code>| tables |</code></>
                  : <>One note per line · <code>- point</code> · indent <code>{'  - sub point'}</code> to nest · <code># Heading</code> · wrap <code>`code`</code> in backticks</>}
              </div>
              <textarea
                autoFocus
                value={draftNotes}
                onChange={(e) => setDraftNotes(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); saveEdit(); return; }
                  // Tab indents / outdents the current line instead of leaving the box.
                  if (e.key === 'Tab') {
                    e.preventDefault();
                    const el = e.currentTarget;
                    const pos = el.selectionStart;
                    const lineStart = draftNotes.lastIndexOf('\n', pos - 1) + 1;
                    if (e.shiftKey) {
                      if (draftNotes.startsWith('  ', lineStart)) {
                        setDraftNotes(draftNotes.slice(0, lineStart) + draftNotes.slice(lineStart + 2));
                        const p = Math.max(lineStart, pos - 2);
                        requestAnimationFrame(() => el.setSelectionRange(p, p));
                      }
                    } else {
                      setDraftNotes(draftNotes.slice(0, lineStart) + '  ' + draftNotes.slice(lineStart));
                      requestAnimationFrame(() => el.setSelectionRange(pos + 2, pos + 2));
                    }
                  }
                }}
                rows={showGpt ? 18 : 14}
                style={showGpt ? { ...editBox, fontFamily: 'var(--font-geist-mono), monospace', fontSize: '0.78rem' } : editBox}
              />
              {!showGpt && (
                <>
                  <div style={{ fontSize: '0.7rem', color: '#8b949e' }}>Code (optional)</div>
                  <textarea value={draftCode} onChange={(e) => setDraftCode(e.target.value)} rows={draftCode ? 8 : 3}
                    onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); saveEdit(); } }}
                    style={{ ...editBox, fontFamily: 'var(--font-geist-mono), monospace', fontSize: '0.78rem' }} />
                </>
              )}
              <div style={{ fontSize: '0.7rem', color: '#8b949e' }}>Preview</div>
              <div style={{ border: '1px dashed #30363d', borderRadius: '8px', padding: '0.6rem 0.8rem' }}>
                {showGpt
                  ? <Markdown text={draftNotes} />
                  : <NotesBody notes={textToNotes(draftNotes)} code={draftCode.trim() ? draftCode : undefined} />}
              </div>
            </div>
          ) : loading ? (
            <Loading what={showGpt ? 'the GPT-style answer' : 'the detailed explanation'} />
          ) : view.markdown ? (
            <Markdown text={view.markdown} />
          ) : view.notes?.length || view.code ? (
            <NotesBody notes={view.notes} code={view.code} />
          ) : (
            <div style={{ fontSize: '0.84rem', color: '#8b949e' }}>
              No notes yet.{' '}
              {editCtx && <button type="button" onClick={beginEdit} style={{ background: 'none', border: 'none', color: '#58a6ff', cursor: 'pointer', padding: 0, fontSize: 'inherit' }}>✏️ Add your notes</button>}
            </div>
          )}
          {!editing && item.links && item.links.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.9rem' }}>
              {item.links.map((l) => (
                <a key={l.href} href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                  style={{ fontSize: '0.75rem', color: '#58a6ff', textDecoration: 'none', border: '1px solid #30363d', borderRadius: '999px', padding: '2px 10px' }}>
                  {l.label}
                </a>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: '0.6rem 1.1rem 0.8rem', borderTop: '1px solid #21262d', display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {editing ? (
            <>
              <button type="button" onClick={saveEdit} style={{ ...navBtn, background: '#238636', borderColor: '#2ea043', color: '#fff' }}>Save notes</button>
              <button type="button" onClick={() => setEditing(false)} style={navBtn}>Cancel</button>
              {view.edited && (
                <button type="button" onClick={resetEdit} style={{ ...navBtn, color: '#f85149' }} title="Throw away your edits and show the original notes">
                  Reset to original
                </button>
              )}
              <span style={{ fontSize: '0.68rem', color: '#6e7681', width: '100%' }}>Ctrl+Enter to save · Tab / Shift+Tab to indent · Esc to cancel</span>
            </>
          ) : (
          <>
          <button type="button" style={{ ...navBtn, opacity: index > 0 ? 1 : 0.4 }} disabled={index === 0} onClick={() => go(index - 1)}>← Prev</button>
          <button type="button" style={{ ...navBtn, opacity: index < items.length - 1 ? 1 : 0.4 }} disabled={index >= items.length - 1} onClick={() => go(index + 1)}>Next →</button>
          <span style={{ fontSize: '0.72rem', color: '#6e7681' }}>{index + 1} / {items.length}</span>
          {editCtx && <button type="button" onClick={beginEdit} style={navBtn} title={`Rewrite the ${showGpt ? 'GPT' : showDetail ? 'detailed' : 'short'} answer in your own words (E)`}>✏️ Edit {showGpt ? 'GPT answer' : showDetail ? 'detailed' : 'notes'}</button>}
          <label style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: done ? '#3fb950' : '#c9d1d9', cursor: 'pointer' }}>
            <DoneBox item={item} done={done} canTrack={canTrack} onToggle={onToggle} color="#3fb950" />
            {done ? 'Revised' : 'Mark revised'}
          </label>
          <span style={{ fontSize: '0.68rem', color: '#6e7681', width: '100%' }}>← → to move · D to mark revised{editCtx ? ' · E to edit' : ''}{depths.length > 1 ? ` · T ${depths.join('/')}` : ''} · C to copy question · Esc to close</span>
          </>
          )}
        </div>
      </div>
    </div>
  );
}

// Q&A mode: short answers by default; each card can flip to the detailed or
// GPT one (loaded on demand, so a page of 100 cards doesn't fetch 100 long answers).
function InlineAnswer({ item }: { item: StudyItem }) {
  const [depth, setDepth] = useState<Depth>('short');
  const editCtx = useNoteEdits();
  const depths = depthsFor(item);
  const shown = effectiveDepth(item, depth);
  const { detail, loading: detailLoading } = useDetail(shown === 'detailed' ? item.key : null);
  const { markdown: gpt, loading: gptLoading } = useGpt(shown === 'gpt' ? item.key : null);
  const ownLong = editCtx?.edits[`${item.key}#long`];
  const ownGpt = editCtx?.edits[`${item.key}#gpt`];
  return (
    <>
      <div style={{ marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        {depths.length > 1 && <DepthToggle depth={shown} onChange={setDepth} depths={depths} />}
        <CopyQuestion text={item.title} />
      </div>
      {shown === 'short' ? (
        <NotesBody notes={item.notes} code={item.code} />
      ) : detailLoading || gptLoading ? (
        <Loading what={shown === 'gpt' ? 'the GPT-style answer' : 'the detailed explanation'} />
      ) : shown === 'gpt' ? (
        <Markdown text={ownGpt?.notes ?? gpt ?? ''} />
      ) : ownLong ? (
        <NotesBody notes={textToNotes(ownLong.notes)} code={ownLong.code.trim() ? ownLong.code : undefined} />
      ) : (
        <NotesBody notes={detail?.notes} code={detail?.code ?? undefined} />
      )}
    </>
  );
}

const editBox: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', background: '#0d1117', border: '1px solid #30363d', borderRadius: '8px',
  color: '#e6edf3', padding: '0.55rem 0.7rem', fontSize: '0.84rem', lineHeight: 1.55, resize: 'vertical', fontFamily: 'inherit',
};

// ── Mode toggle ────────────────────────────────────────────────────────────

const MODE_KEY = 'study:list-mode';

// Notes-popup style is the default (active recall); the choice is remembered.
export function useListMode(): [ListMode, (m: ListMode) => void] {
  const [mode, setMode] = useState<ListMode>('notes');
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (localStorage.getItem(MODE_KEY) === 'inline') setMode('inline');
    } catch {
      // storage blocked — stay on the default
    }
  }, []);
  const set = useCallback((m: ListMode) => {
    setMode(m);
    try { localStorage.setItem(MODE_KEY, m); } catch { /* ignore */ }
  }, []);
  return [mode, set];
}

export function ModeToggle({ mode, onChange }: { mode: ListMode; onChange: (m: ListMode) => void }) {
  const opts: { m: ListMode; label: string; title: string }[] = [
    { m: 'notes', label: '📝 Notes popup', title: 'Questions only — open the answer in a popup (active recall)' },
    { m: 'inline', label: '📄 Q & A', title: 'Show every answer below its question' },
  ];
  return (
    <div style={{ display: 'inline-flex', gap: '2px', border: '1px solid #30363d', borderRadius: '8px', padding: '2px' }}>
      {opts.map((o) => (
        <button key={o.m} type="button" title={o.title} onClick={() => onChange(o.m)}
          style={{
            border: 'none', borderRadius: '6px', padding: '3px 10px', fontSize: '0.74rem', cursor: 'pointer',
            background: mode === o.m ? 'rgba(88,166,255,0.15)' : 'transparent', color: mode === o.m ? '#58a6ff' : '#8b949e',
            fontWeight: mode === o.m ? 600 : 400,
          }}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function SortToggle({ value, onChange }: { value: 'order' | 'stars'; onChange: (v: 'order' | 'stars') => void }) {
  return (
    <button type="button" onClick={() => onChange(value === 'order' ? 'stars' : 'order')}
      title="Toggle ordering"
      style={{ border: '1px solid #30363d', borderRadius: '8px', padding: '4px 10px', fontSize: '0.74rem', cursor: 'pointer', background: 'transparent', color: '#8b949e' }}>
      Sort: <span style={{ color: '#e6edf3' }}>{value === 'stars' ? '★ Importance' : 'Topic order'}</span>
    </button>
  );
}

/** Filter by min stars and optionally sort most-important first (stable). */
export function arrange(items: StudyItem[], minStars: number, sort: 'order' | 'stars'): StudyItem[] {
  const f = minStars > 0 ? items.filter((i) => i.stars >= minStars) : items;
  return sort === 'stars' ? [...f].sort((a, b) => b.stars - a.stars) : f;
}

// ── List ───────────────────────────────────────────────────────────────────

export default function StudyList({
  items: rawItems, topics, mode, isDone, onToggle, canTrack, showGroups = true, showTopic = false, renderInline,
}: {
  items: StudyItem[];
  topics: Record<string, StudyTopic>;
  mode: ListMode;
  isDone: (item: StudyItem) => boolean;
  onToggle: (item: StudyItem, done: boolean) => void;
  canTrack: boolean;
  showGroups?: boolean;
  showTopic?: boolean;
  /** Return a node to replace an item's inline card (e.g. the admin editor). */
  renderInline?: (item: StudyItem) => React.ReactNode | null;
}) {
  const notesCtx = useContext(NotesCtx);
  const editCtx = useNoteEdits();
  const edits = editCtx?.edits;
  const personal = notesCtx.notes;
  // One notes model everywhere: built-in answer → else an older personal note
  // (the DSA "add note" ones) → and the user's own rewrite on top of either.
  const items = useMemo(() => {
    const seeded = rawItems.map((it) => {
      const body = it.noteId ? personal[it.noteId]?.body : undefined;
      if (it.notes?.length || it.code || !body?.trim()) return it;
      return { ...it, notes: textToNotes(body) };
    });
    return applyEdits(seeded, edits);
  }, [rawItems, edits, personal]);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [startEditing, setStartEditing] = useState(false);
  // With editing available every item opens the same popup (empty ones start
  // in edit mode); otherwise the popup steps only through items with notes.
  const answerable = editCtx ? items : items.filter((it) => it.notes?.length || it.code);
  const close = useCallback(() => setOpenIdx(null), []);

  const openItem = (item: StudyItem, edit = false) => {
    const i = answerable.indexOf(item);
    setStartEditing(edit || (!!editCtx && !item.notes?.length && !item.code));
    if (i >= 0) setOpenIdx(i);
    else if (item.noteId) {
      const has = !!notesCtx.notes[item.noteId]?.body.trim();
      notesCtx.open({ id: item.noteId, title: item.title, context: item.group, mode: has ? 'view' : 'edit' });
    }
  };

  return (
    <div>
      {items.map((item, idx) => {
        const topic = topics[item.topic];
        const color = topic?.color ?? '#58a6ff';
        const done = isDone(item);
        const groupHeader = showGroups && item.group && item.group !== items[idx - 1]?.group ? item.group : null;
        const header = groupHeader ? (
          <div style={{ fontSize: '0.7rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.07em', margin: `${idx ? '1rem' : '0.2rem'} 0 0.35rem` }}>
            {groupHeader}
          </div>
        ) : null;

        const custom = mode === 'inline' && renderInline ? renderInline(item) : null;
        if (custom) return <div key={item.key}>{header}{custom}</div>;

        const hasAnswer = !!(item.notes?.length || item.code);
        const meta = (
          <>
            {showTopic && topic && (
              <span style={{ fontSize: '0.66rem', color, border: `1px solid ${color}55`, borderRadius: '999px', padding: '0 6px', whiteSpace: 'nowrap' }}>{topic.label}</span>
            )}
            {item.difficulty && <span style={{ fontSize: '0.68rem', color: DIFF_COLOR[item.difficulty], whiteSpace: 'nowrap' }}>{item.difficulty}</span>}
            <Stars value={item.stars} />
          </>
        );

        if (mode === 'inline' && hasAnswer) {
          return (
            <div key={item.key}>
              {header}
              <div style={{ background: '#161b22', border: '1px solid #30363d', borderLeft: `3px solid ${color}`, borderRadius: '10px', marginBottom: '8px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', padding: '12px 14px 10px' }}>
                  <span style={{ paddingTop: '3px' }}><DoneBox item={item} done={done} canTrack={canTrack} onToggle={onToggle} color={color} /></span>
                  <div style={{ flex: 1, color: '#e6edf3', fontSize: '0.92rem', fontWeight: 600, lineHeight: 1.5 }}>{item.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '3px' }}>
                    {meta}
                    {editCtx && (
                      <button type="button" onClick={() => openItem(item, true)} title={item.edited ? 'Edited by you — edit again' : 'Edit these notes'}
                        style={{ background: 'none', border: '1px solid #30363d', borderRadius: '6px', color: item.edited ? '#d29922' : '#8b949e', fontSize: '0.7rem', padding: '1px 7px', cursor: 'pointer' }}>
                        ✏️{item.edited ? ' edited' : ''}
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ padding: '10px 14px 14px', borderTop: '1px solid #21262d' }}>
                  <InlineAnswer item={item} />
                  {item.links && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem' }}>
                      {item.links.map((l) => (
                        <a key={l.href} href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" style={{ fontSize: '0.72rem', color: '#58a6ff', textDecoration: 'none' }}>{l.label}</a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        }

        // Notes mode (and answer-less items in either mode): one compact row.
        const note = item.noteId ? notesCtx.notes[item.noteId] : undefined;
        return (
          <div key={item.key}>
            {header}
            <div
              role="button"
              tabIndex={0}
              onClick={() => openItem(item)}
              onKeyDown={(e) => { if (e.key === 'Enter') openItem(item); }}
              className="study-row"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.65rem', borderRadius: '8px',
                cursor: hasAnswer || item.noteId ? 'pointer' : 'default', borderLeft: `2px solid ${done ? '#3fb950' : color}`,
                background: done ? 'rgba(63,185,80,0.05)' : 'transparent', marginBottom: '2px',
              }}
            >
              <DoneBox item={item} done={done} canTrack={canTrack} onToggle={onToggle} color={color} />
              {item.kind && <span style={{ fontSize: '0.72rem' }} title={item.kind}>{KIND_ICON[item.kind] ?? '•'}</span>}
              <span style={{ flex: 1, minWidth: 0, fontSize: '0.86rem', color: done ? '#8b949e' : '#e6edf3', lineHeight: 1.45 }}>{item.title}</span>
              {meta}
              {hasAnswer || editCtx ? (
                <span style={{ fontSize: '0.7rem', color: '#d29922', border: '1px solid rgba(210,153,34,0.45)', background: 'rgba(210,153,34,0.1)', opacity: hasAnswer ? 1 : 0.6, borderRadius: '999px', padding: '1px 8px', whiteSpace: 'nowrap' }}>
                  {hasAnswer ? `📝 Notes${item.edited ? ' ✏️' : ''}` : '＋ Add notes'}
                </span>
              ) : item.noteId ? (
                <NoteButton
                  note={note}
                  onClick={() => notesCtx.open({ id: item.noteId!, title: item.title, context: item.group })}
                  onView={() => notesCtx.open({ id: item.noteId!, title: item.title, context: item.group, mode: 'view' })}
                />
              ) : null}
              {!hasAnswer && item.links?.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                  style={{ fontSize: '0.7rem', color: '#58a6ff', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        );
      })}

      {openIdx !== null && answerable[openIdx] && (
        <AnswerPopup
          key={startEditing ? 'edit' : 'view'}
          startEditing={startEditing}
          items={answerable}
          index={openIdx}
          topics={topics}
          isDone={isDone}
          canTrack={canTrack}
          onToggle={onToggle}
          onIndex={setOpenIdx}
          onClose={close}
        />
      )}
    </div>
  );
}
