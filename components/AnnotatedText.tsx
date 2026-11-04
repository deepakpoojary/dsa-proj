'use client';

import { useEffect, useRef, useState } from 'react';
import { Segment, annotate, overlapsAnnotation, parse, setComment } from '@/lib/annotations';

type Ann = Extract<Segment, { kind: 'ann' }>;
type Pos = { left: number; top: number; bottom: number };

const posOf = (r: DOMRect): Pos => ({ left: r.left, top: r.top, bottom: r.bottom });

// Raw body offset for a selection boundary, or null if it falls inside an
// existing comment (or outside the text).
function rawOffset(root: HTMLElement, node: Node, offset: number): number | null {
  if (node.nodeType === Node.TEXT_NODE) {
    const span = node.parentElement?.closest<HTMLElement>('[data-s]');
    if (!span || !root.contains(span)) return null;
    return Number(span.dataset.s) + offset;
  }
  const el = node as HTMLElement;
  const seg = el.closest?.<HTMLElement>('[data-s]');
  if (seg && root.contains(seg)) return Number(seg.dataset.s) + (offset > 0 ? (seg.textContent ?? '').length : 0);
  if (el === root || root.contains(el)) {
    const child = el.childNodes[offset] as HTMLElement | undefined;
    if (child?.dataset?.s) return Number(child.dataset.s);
    const prev = el.childNodes[offset - 1] as HTMLElement | undefined;
    if (prev?.dataset?.s) return Number(prev.dataset.s) + (prev.textContent ?? '').length;
  }
  return null;
}

export function CommentPopover({
  pos, initial, editing, onSave, onDelete, onClose,
}: {
  pos: Pos;
  initial: string;
  editing: boolean;
  onSave: (c: string) => void;
  onDelete?: () => void;
  onClose: () => void;
}) {
  const [text, setText] = useState(initial);
  const left = Math.max(8, Math.min(pos.left, window.innerWidth - 288));
  const below = pos.bottom + 150 < window.innerHeight;
  return (
    <div
      data-ann-ui
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: 'fixed', left, zIndex: 300, width: '280px',
        ...(below ? { top: pos.bottom + 6 } : { bottom: window.innerHeight - pos.top + 6 }),
        background: '#161b22', border: '1px solid #30363d', borderRadius: '10px', padding: '0.55rem',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '0.4rem',
        whiteSpace: 'normal',
      }}
    >
      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === 'Escape') onClose();
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSave(text);
          }
        }}
        placeholder="Your comment…"
        rows={2}
        style={{
          resize: 'vertical', padding: '0.4rem 0.5rem', borderRadius: '6px', border: '1px solid #30363d',
          background: '#0d1117', color: '#e6edf3', fontSize: '0.8rem', fontFamily: 'inherit', outline: 'none',
        }}
      />
      <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => onSave(text)}
          style={{ background: '#238636', border: 'none', color: '#fff', borderRadius: '6px', padding: '3px 10px', fontSize: '0.74rem', cursor: 'pointer' }}
        >
          Save
        </button>
        <button
          type="button"
          onClick={onClose}
          style={{ background: 'none', border: '1px solid #30363d', color: '#8b949e', borderRadius: '6px', padding: '3px 10px', fontSize: '0.74rem', cursor: 'pointer' }}
        >
          Cancel
        </button>
        <span style={{ flex: 1 }} />
        {editing && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            style={{ background: 'none', border: 'none', color: '#f85149', fontSize: '0.74rem', cursor: 'pointer' }}
          >
            Remove
          </button>
        )}
      </div>
      <div style={{ fontSize: '0.65rem', color: '#6e7681' }}>Enter to save · Shift+Enter for a new line</div>
    </div>
  );
}

// A note body with its `[[words::comment]]` marks rendered as highlights that
// show the comment on hover (tap on touch). With `onChange`, selecting words
// offers "Comment", and clicking a highlight edits or removes its comment.
export default function AnnotatedText({
  body, onChange, style,
}: {
  body: string;
  onChange?: (body: string) => void;
  style?: React.CSSProperties;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const segments = parse(body);
  const [tip, setTip] = useState<{ comment: string; pos: Pos } | null>(null);
  const [pending, setPending] = useState<{ start: number; end: number; pos: Pos } | null>(null);
  const [editor, setEditor] = useState<{ pos: Pos; ann?: Ann; range?: { start: number; end: number } } | null>(null);

  // Offer "Comment" while a valid selection sits inside this note.
  useEffect(() => {
    if (!onChange) return;
    const onSel = () => {
      const root = rootRef.current;
      const sel = window.getSelection();
      if (!root || !sel || sel.isCollapsed || sel.rangeCount === 0) return setPending(null);
      const range = sel.getRangeAt(0);
      if (!root.contains(range.commonAncestorContainer)) return setPending(null);
      const a = rawOffset(root, range.startContainer, range.startOffset);
      const b = rawOffset(root, range.endContainer, range.endOffset);
      if (a === null || b === null || a === b) return setPending(null);
      const [start, end] = a < b ? [a, b] : [b, a];
      if (overlapsAnnotation(body, start, end) || !body.slice(start, end).trim()) return setPending(null);
      setPending({ start, end, pos: posOf(range.getBoundingClientRect()) });
    };
    document.addEventListener('selectionchange', onSel);
    return () => document.removeEventListener('selectionchange', onSel);
  }, [body, onChange]);

  // Fixed-position UI goes stale on scroll; drop it.
  useEffect(() => {
    if (!tip && !pending) return;
    const clear = () => { setTip(null); setPending(null); };
    window.addEventListener('scroll', clear, true);
    return () => window.removeEventListener('scroll', clear, true);
  }, [tip, pending]);

  const save = (next: string) => {
    onChange?.(next);
    setEditor(null);
    setPending(null);
    setTip(null);
    window.getSelection()?.removeAllRanges();
  };

  return (
    <div
      ref={rootRef}
      style={style}
      // Keep selecting / commenting from triggering the parent's "click to edit".
      onClick={(e) => {
        const t = e.target as HTMLElement;
        if (t.closest('[data-ann-ui], mark[data-ann]') || !window.getSelection()?.isCollapsed) e.stopPropagation();
      }}
      onKeyDown={(e) => { if ((e.target as HTMLElement).closest('[data-ann-ui]')) e.stopPropagation(); }}
    >
      {segments.map((s) =>
        s.kind === 'text' ? (
          <span key={s.start} data-s={s.start}>{s.text}</span>
        ) : (
          <mark
            key={s.start}
            data-ann
            className="ann-mark"
            tabIndex={0}
            aria-label={`${s.text}. Comment: ${s.comment}`}
            onMouseEnter={(e) => setTip({ comment: s.comment, pos: posOf(e.currentTarget.getBoundingClientRect()) })}
            onMouseLeave={() => setTip(null)}
            onFocus={(e) => setTip({ comment: s.comment, pos: posOf(e.currentTarget.getBoundingClientRect()) })}
            onBlur={() => setTip(null)}
            onClick={(e) => {
              const pos = posOf(e.currentTarget.getBoundingClientRect());
              if (onChange) {
                setTip(null);
                setEditor({ pos, ann: s });
              } else {
                setTip((t) => (t ? null : { comment: s.comment, pos }));
              }
            }}
          >
            {s.text}
          </mark>
        )
      )}

      {tip && !editor && (
        <div
          role="tooltip"
          style={{
            position: 'fixed', zIndex: 300, maxWidth: '300px',
            left: Math.max(8, Math.min(tip.pos.left, window.innerWidth - 308)),
            ...(tip.pos.top > 80 ? { bottom: window.innerHeight - tip.pos.top + 6 } : { top: tip.pos.bottom + 6 }),
            background: '#1f2428', border: '1px solid rgba(210,153,34,0.5)', borderRadius: '8px',
            padding: '0.45rem 0.6rem', color: '#e6edf3', fontSize: '0.78rem', lineHeight: 1.45,
            whiteSpace: 'pre-wrap', boxShadow: '0 6px 18px rgba(0,0,0,0.45)', pointerEvents: 'none',
          }}
        >
          💬 {tip.comment}
          {onChange && <div style={{ fontSize: '0.65rem', color: '#6e7681', marginTop: '3px' }}>Click to edit</div>}
        </div>
      )}

      {pending && !editor && (
        <button
          type="button"
          data-ann-ui
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setEditor({ pos: pending.pos, range: { start: pending.start, end: pending.end } })}
          style={{
            position: 'fixed', zIndex: 300,
            left: Math.max(8, Math.min(pending.pos.left, window.innerWidth - 120)),
            ...(pending.pos.top > 44 ? { top: pending.pos.top - 34 } : { top: pending.pos.bottom + 6 }),
            background: '#d29922', color: '#0d1117', border: 'none', borderRadius: '999px',
            padding: '4px 11px', fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}
        >
          💬 Comment
        </button>
      )}

      {editor && (
        <CommentPopover
          pos={editor.pos}
          initial={editor.ann?.comment ?? ''}
          editing={!!editor.ann}
          onClose={() => setEditor(null)}
          onDelete={editor.ann ? () => save(setComment(body, editor.ann!, null)) : undefined}
          onSave={(c) => {
            if (editor.ann) save(setComment(body, editor.ann, c));
            else if (editor.range) save(annotate(body, editor.range.start, editor.range.end, c));
          }}
        />
      )}
    </div>
  );
}
