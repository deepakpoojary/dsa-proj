'use client';

import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNotes, Note, NoteStatus } from '@/lib/use-notes';

export interface NoteTarget {
  id: string;
  title: string;
  context?: string;
  // 'view' opens a read-only popup with an Edit button; default is 'edit'.
  mode?: 'view' | 'edit';
}

export interface NotesApi {
  notes: Record<string, Note>;
  status: Record<string, NoteStatus>;
  open: (t: NoteTarget) => void;
  setNote: (id: string, body: string) => void;
  flush: (id: string) => void;
}

export const NotesCtx = createContext<NotesApi>({
  notes: {},
  status: {},
  open: () => {},
  setNote: () => {},
  flush: () => {},
});

// Owns note state + the popup for a page. Wrap the page in
// <NotesCtx.Provider value={host.value}> and render {host.modal}.
export function useNoteHost(signedIn: boolean) {
  const { notes, status, setNote, flush, refresh } = useNotes(signedIn);
  const [target, setTarget] = useState<NoteTarget | null>(null);

  const close = useCallback(() => {
    if (target) flush(target.id);
    setTarget(null);
  }, [target, flush]);

  const value = useMemo<NotesApi>(
    () => ({ notes, status, open: setTarget, setNote, flush }),
    [notes, status, setNote, flush]
  );

  const modal = target && target.mode === 'view' && notes[target.id] ? (
    <NoteViewer
      key={`${target.id}:view`}
      title={target.title}
      context={target.context}
      note={notes[target.id]}
      onEdit={() => setTarget({ ...target, mode: 'edit' })}
      onClose={close}
    />
  ) : target ? (
    <NoteModal
      key={target.id}
      title={target.title}
      context={target.context}
      note={notes[target.id]}
      status={status[target.id]}
      onChange={(body) => setNote(target.id, body)}
      onClose={close}
    />
  ) : null;

  return { notes, value, modal, open: setTarget, isOpen: target !== null, refresh };
}

// Small pencil next to a checkbox. Filled + tinted when a note exists, with
// the note's first line as a tooltip so it can be peeked without opening.
// With `onView`, the pill opens a read-only popup and a separate ✎ edits.
export function NoteButton({
  note, onClick, onView, label,
}: { note?: Note; onClick: () => void; onView?: () => void; label?: string }) {
  const has = !!note && note.body.trim() !== '';
  if (has && onView) {
    return (
      <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
        <NoteButton note={note} onClick={onView} />
        <NoteButton onClick={onClick} label="Edit note" />
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      title={has ? note!.body.split('\n')[0].slice(0, 120) : label ?? 'Add a note'}
      aria-label={has ? 'View note' : label ?? 'Add note'}
      style={{
        flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '4px',
        padding: '2px 7px', borderRadius: '999px', cursor: 'pointer', fontSize: '0.7rem',
        border: `1px solid ${has ? 'rgba(210,153,34,0.45)' : 'transparent'}`,
        background: has ? 'rgba(210,153,34,0.1)' : 'transparent',
        color: has ? '#d29922' : '#6e7681',
        transition: 'color 0.15s, background 0.15s',
      }}
      onMouseEnter={(e) => { if (!has) e.currentTarget.style.color = '#c9d1d9'; }}
      onMouseLeave={(e) => { if (!has) e.currentTarget.style.color = '#6e7681'; }}
    >
      {has ? '📝 Note' : '✎'}
    </button>
  );
}

const STATUS_LABEL: Record<NoteStatus, string> = {
  saving: 'Saving…',
  saved: 'Saved',
  local: 'Saved on this device',
};

export function NoteModal({
  title,
  context,
  note,
  status,
  onChange,
  onClose,
}: {
  title: string;
  context?: string;
  note?: Note;
  status?: NoteStatus;
  onChange: (body: string) => void;
  onClose: () => void;
}) {
  // Uncontrolled-ish: seeded once from the stored note so remote merges
  // never yank the cursor while typing.
  const [text, setText] = useState(note?.body ?? '');
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el) {
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const updated = note ? new Date(note.updatedAt) : null;

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
        aria-label={`Note: ${title}`}
        style={{
          width: '100%', maxWidth: '560px', background: '#161b22', border: '1px solid #30363d',
          borderRadius: '12px', boxShadow: '0 16px 48px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column',
        }}
      >
        <div style={{ padding: '0.9rem 1.1rem 0.6rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {context && <div style={{ fontSize: '0.68rem', color: '#8b949e', letterSpacing: '0.04em', marginBottom: '2px' }}>{context}</div>}
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e6edf3' }}>{title}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'none', border: 'none', color: '#8b949e', fontSize: '1.1rem', cursor: 'pointer', lineHeight: 1 }}
          >
            ×
          </button>
        </div>
        <textarea
          ref={ref}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            onChange(e.target.value);
          }}
          placeholder="Key idea, pattern, edge cases, complexity, mistakes you made…"
          style={{
            margin: '0 1.1rem', minHeight: '220px', maxHeight: '60vh', resize: 'vertical',
            padding: '0.75rem', borderRadius: '8px', border: '1px solid #30363d', background: '#0d1117',
            color: '#e6edf3', fontSize: '0.88rem', lineHeight: 1.55, fontFamily: 'inherit', outline: 'none',
          }}
        />
        <div style={{ padding: '0.6rem 1.1rem 0.9rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#6e7681' }}>
          <span>{status ? STATUS_LABEL[status] : updated ? `Last edited ${updated.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}` : 'Saves automatically'}</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
}

// Read-only popup for an existing note, same chrome as the editor.
export function NoteViewer({
  title,
  context,
  note,
  onEdit,
  onClose,
}: {
  title: string;
  context?: string;
  note: Note;
  onEdit: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'e' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        onEdit();
      }
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, onEdit]);

  const updated = new Date(note.updatedAt);

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
        aria-label={`Note: ${title}`}
        style={{
          width: '100%', maxWidth: '560px', background: '#161b22', border: '1px solid #30363d',
          borderRadius: '12px', boxShadow: '0 16px 48px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column',
        }}
      >
        <div style={{ padding: '0.9rem 1.1rem 0.6rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {context && <div style={{ fontSize: '0.68rem', color: '#8b949e', letterSpacing: '0.04em', marginBottom: '2px' }}>{context}</div>}
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e6edf3' }}>{title}</div>
          </div>
          <button
            type="button"
            onClick={onEdit}
            style={{
              background: 'rgba(210,153,34,0.1)', border: '1px solid rgba(210,153,34,0.45)', color: '#d29922',
              fontSize: '0.72rem', padding: '3px 10px', borderRadius: '999px', cursor: 'pointer',
            }}
          >
            ✎ Edit
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'none', border: 'none', color: '#8b949e', fontSize: '1.1rem', cursor: 'pointer', lineHeight: 1 }}
          >
            ×
          </button>
        </div>
        <div
          style={{
            margin: '0 1.1rem', maxHeight: '60vh', overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            padding: '0.75rem', borderRadius: '8px', border: '1px solid #30363d', background: '#0d1117',
            color: '#e6edf3', fontSize: '0.88rem', lineHeight: 1.55,
          }}
        >
          {note.body}
        </div>
        <div style={{ padding: '0.6rem 1.1rem 0.9rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#6e7681' }}>
          <span>Last edited {updated.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
          <span>E to edit · Esc to close</span>
        </div>
      </div>
    </div>
  );
}
