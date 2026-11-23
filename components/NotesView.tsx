'use client';

// Notes: Google-Docs-style outline documents. Each line is a block (text,
// bullet, numbered, checkbox or heading) with an indent level.
//   Tab / Shift+Tab           indent / outdent (children come along)
//   Alt+Shift+↑ / ↓           move the line (with its children) up / down
//   Ctrl+Shift+8 / 7 / 9      bulleted / numbered / checklist
//   Ctrl+Enter                tick / untick a checkbox
//   Enter on an empty item    outdent, then back to plain text
//   "- ", "1. ", "[] ", "# "  at the start of a line turn it into that type
// Drag the ⋮⋮ handle to move a line anywhere. Saved per note via useDocs
// (kind 'outline'), so it syncs across devices when signed in.

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import SiteNav from './SiteNav';
import { useDocs, DOC_STATUS_LABEL } from '@/lib/use-docs';
import { newId } from '@/lib/journal';
import {
  type Block, type BlockType, type NoteDoc, dropAt, indent as indentAt, moveDown, moveUp, newBlock, newNote,
  normalize, noteText, numberOf, outdent as outdentAt, toPlainText,
} from '@/lib/outline';

const SELECTED_KEY = 'notes:selected';
const BULLETS = ['•', '◦', '▪'];

export default function NotesView({ signedIn }: { signedIn: boolean }) {
  const { docs, setDoc, status } = useDocs<NoteDoc>('outline', signedIn);
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelected(localStorage.getItem(SELECTED_KEY));
    } catch { /* ignore */ }
  }, []);
  const select = (id: string | null) => {
    setSelected(id);
    setConfirmDelete(false);
    try { if (id) localStorage.setItem(SELECTED_KEY, id); else localStorage.removeItem(SELECTED_KEY); } catch { /* ignore */ }
  };

  const list = useMemo(() => {
    const f = filter.trim().toLowerCase();
    return Object.entries(docs)
      .filter(([, d]) => !f || noteText(d).toLowerCase().includes(f))
      .sort(([, a], [, b]) => Number(!!b.pinned) - Number(!!a.pinned) || b.updatedAt - a.updatedAt);
  }, [docs, filter]);

  const current = selected && docs[selected] ? selected : list[0]?.[0] ?? null;
  const doc = current ? docs[current] : null;

  const create = () => {
    const id = newId();
    setDoc(id, newNote());
    select(id);
    setFilter('');
  };

  const update = useCallback((patch: Partial<NoteDoc>) => {
    if (!current || !docs[current]) return;
    setDoc(current, { ...docs[current], ...patch, updatedAt: Date.now() });
  }, [current, docs, setDoc]);

  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (!doc) return;
    try {
      await navigator.clipboard.writeText([doc.title, '', toPlainText(doc)].join('\n').trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch { /* clipboard blocked */ }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', padding: '2rem 1rem 4rem' }}>
      <style>{CSS}</style>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        <SiteNav />
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#e6edf3', margin: 0 }}>📝 Notes</h1>
          <span style={{ fontSize: '0.75rem', color: '#8b949e' }}>
            {status ? DOC_STATUS_LABEL[status] : signedIn ? 'Saves automatically' : 'Saved on this device · log in to sync'}
          </span>
        </div>

        <div className="notes-layout">
          <aside className="notes-side">
            <button type="button" onClick={create} className="notes-new">＋ New note</button>
            <input type="search" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search notes…" aria-label="Search notes" className="notes-search" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '0.4rem' }}>
              {list.length === 0 && <div style={{ fontSize: '0.78rem', color: '#6e7681', padding: '0.4rem' }}>{filter ? 'No matches.' : 'No notes yet.'}</div>}
              {list.map(([id, d]) => {
                const first = d.blocks.find((b) => b.text.trim())?.text ?? '';
                return (
                  <button key={id} type="button" onClick={() => select(id)} className={`notes-item${id === current ? ' active' : ''}`}>
                    <span style={{ display: 'block', fontWeight: 600, color: '#e6edf3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {d.pinned && '📌 '}{d.title.trim() || 'Untitled'}
                    </span>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: '#6e7681', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {new Date(d.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {first || 'Empty'}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="notes-main">
            {!doc || !current ? (
              <div style={{ color: '#8b949e', fontSize: '0.9rem', textAlign: 'center', padding: '3rem 1rem' }}>
                <p>Bullets, checklists and numbered lists you can indent and move around, like Google Docs.</p>
                <button type="button" onClick={create} className="notes-new" style={{ width: 'auto', padding: '0.5rem 1.2rem' }}>＋ Create your first note</button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  <input value={doc.title} onChange={(e) => update({ title: e.target.value })} placeholder="Untitled" aria-label="Note title" className="notes-title" />
                  <button type="button" onClick={() => update({ pinned: !doc.pinned })} className="notes-tool" title={doc.pinned ? 'Unpin' : 'Pin to the top'}>{doc.pinned ? '📌 Pinned' : '📌 Pin'}</button>
                  <button type="button" onClick={copy} className="notes-tool" title="Copy as plain text">{copied ? '✓ Copied' : '⧉ Copy'}</button>
                  {confirmDelete ? (
                    <>
                      <button type="button" onClick={() => { setDoc(current, null); select(null); }} className="notes-tool" style={{ color: '#f85149', borderColor: '#f8514988' }}>Delete for good</button>
                      <button type="button" onClick={() => setConfirmDelete(false)} className="notes-tool">Keep</button>
                    </>
                  ) : (
                    <button type="button" onClick={() => setConfirmDelete(true)} className="notes-tool" title="Delete this note">🗑</button>
                  )}
                </div>
                <OutlineEditor key={current} blocks={doc.blocks} onChange={(blocks) => update({ blocks })} />
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

// ── Editor ─────────────────────────────────────────────────────────────────

interface Snapshot { blocks: Block[]; focus: { id: string; pos: number } | null }

function OutlineEditor({ blocks: incoming, onChange }: { blocks: Block[]; onChange: (b: Block[]) => void }) {
  const [blocks, setBlocks] = useState<Block[]>(() => (incoming.length ? incoming : [newBlock('bullet')]));
  const emitted = useRef(incoming);
  const refs = useRef(new Map<string, HTMLTextAreaElement>());
  const pendingFocus = useRef<{ id: string; pos: number } | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const history = useRef<{ past: Snapshot[]; future: Snapshot[]; lastAt: number; lastKind: string }>({ past: [], future: [], lastAt: 0, lastKind: '' });
  const [drag, setDrag] = useState<{ from: number; over: number; place: 'before' | 'after' } | null>(null);

  // The same note changed elsewhere (another device synced in): take it.
  useEffect(() => {
    if (incoming === emitted.current) return;
    emitted.current = incoming;
    setBlocks(incoming.length ? incoming : [newBlock('bullet')]);
  }, [incoming]);

  const caretOf = (id: string) => {
    const el = refs.current.get(id);
    return el ? el.selectionStart : 0;
  };

  /** Every edit goes through here: history (typing is grouped), focus, save. */
  const commit = useCallback((next: Block[], focus: { id: string; pos: number } | null, kind = 'struct') => {
    const h = history.current;
    const now = Date.now();
    if (kind !== 'type' || h.lastKind !== 'type' || now - h.lastAt > 1000) {
      const cur = document.activeElement as HTMLTextAreaElement | null;
      const curId = cur?.dataset?.blockId;
      h.past.push({ blocks, focus: curId ? { id: curId, pos: cur!.selectionStart } : null });
      if (h.past.length > 200) h.past.shift();
    }
    h.future = [];
    h.lastAt = now;
    h.lastKind = kind;
    pendingFocus.current = focus;
    setBlocks(next);
    emitted.current = next;
    onChange(next);
  }, [blocks, onChange]);

  const restore = (from: 'past' | 'future') => {
    const h = history.current;
    const snap = h[from].pop();
    if (!snap) return;
    const cur = document.activeElement as HTMLTextAreaElement | null;
    const curId = cur?.dataset?.blockId;
    h[from === 'past' ? 'future' : 'past'].push({ blocks, focus: curId ? { id: curId, pos: cur!.selectionStart } : null });
    h.lastKind = '';
    pendingFocus.current = snap.focus;
    setBlocks(snap.blocks);
    emitted.current = snap.blocks;
    onChange(snap.blocks);
  };

  useLayoutEffect(() => {
    for (const el of refs.current.values()) autosize(el);
    const f = pendingFocus.current;
    if (!f) return;
    pendingFocus.current = null;
    const el = refs.current.get(f.id);
    if (el) {
      el.focus();
      const p = Math.min(f.pos, el.value.length);
      el.setSelectionRange(p, p);
    }
  });

  const idx = (id: string) => blocks.findIndex((b) => b.id === id);
  const patch = (i: number, p: Partial<Block>) => blocks.map((b, k) => (k === i ? { ...b, ...p } : b));

  // ── Operations on the block at i (toolbar + keys) ──
  const doIndent = (i: number) => commit(indentAt(blocks, i), { id: blocks[i].id, pos: caretOf(blocks[i].id) });
  const doOutdent = (i: number) => commit(outdentAt(blocks, i), { id: blocks[i].id, pos: caretOf(blocks[i].id) });
  const doMove = (i: number, dir: -1 | 1) => {
    const r = dir < 0 ? moveUp(blocks, i) : moveDown(blocks, i);
    if (r.blocks !== blocks) commit(r.blocks, { id: blocks[i].id, pos: caretOf(blocks[i].id) });
  };
  const setType = (i: number, type: BlockType) => {
    const b = blocks[i];
    const t = b.type === type ? 'text' : type; // pressing it again turns it off, like Docs
    commit(patch(i, { type: t, checked: t === 'check' ? !!b.checked : undefined }), { id: b.id, pos: caretOf(b.id) });
  };
  const toggleCheck = (i: number) => commit(patch(i, { checked: !blocks[i].checked }), { id: blocks[i].id, pos: caretOf(blocks[i].id) });

  const onText = (i: number, el: HTMLTextAreaElement) => {
    const b = blocks[i];
    let text = el.value;
    let type = b.type;
    let pos = el.selectionStart;
    // Markdown-style shortcuts typed at the start of a line.
    const m = /^(- |\* |\[\] |\[ \] |1\. |# )/.exec(text);
    if (m && (b.type === 'text' || (b.type === 'bullet' && m[1].startsWith('[')))) {
      const map: Record<string, BlockType> = { '- ': 'bullet', '* ': 'bullet', '[] ': 'check', '[ ] ': 'check', '1. ': 'number', '# ': 'heading' };
      type = map[m[1]];
      text = text.slice(m[1].length);
      pos = Math.max(0, pos - m[1].length);
      commit(patch(i, { text, type, checked: type === 'check' ? false : undefined }), { id: b.id, pos });
      return;
    }
    commit(patch(i, { text }), null, 'type');
  };

  const onKey = (i: number, e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;
    const el = e.currentTarget;
    const b = blocks[i];
    const s = el.selectionStart;
    const end = el.selectionEnd;
    const mod = e.ctrlKey || e.metaKey;
    const key = e.key;

    // Undo / redo across the whole note.
    if (mod && !e.altKey && key.toLowerCase() === 'z') { e.preventDefault(); restore(e.shiftKey ? 'future' : 'past'); return; }
    if (mod && !e.altKey && key.toLowerCase() === 'y') { e.preventDefault(); restore('future'); return; }

    // Move line: Alt+Shift+↑/↓ (Google Docs), Ctrl+Shift+↑/↓ too.
    if ((key === 'ArrowUp' || key === 'ArrowDown') && e.shiftKey && (e.altKey || mod)) {
      e.preventDefault();
      doMove(i, key === 'ArrowUp' ? -1 : 1);
      return;
    }
    if (key === 'Tab') { e.preventDefault(); if (e.shiftKey) doOutdent(i); else doIndent(i); return; }
    if (mod && e.shiftKey && (e.code === 'Digit8' || e.code === 'Digit7' || e.code === 'Digit9')) {
      e.preventDefault();
      setType(i, e.code === 'Digit8' ? 'bullet' : e.code === 'Digit7' ? 'number' : 'check');
      return;
    }
    if (mod && key === 'Enter') { e.preventDefault(); if (b.type === 'check') toggleCheck(i); else setType(i, 'check'); return; }

    if (key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!b.text && b.type !== 'text') {
        // Empty list item: step out a level, then out of the list.
        if (b.indent > 0) doOutdent(i);
        else commit(patch(i, { type: 'text', checked: undefined }), { id: b.id, pos: 0 });
        return;
      }
      const type: BlockType = b.type === 'heading' ? 'text' : b.type;
      if (s === 0 && end === 0 && b.text) {
        // Caret at the very start: open a line above, stay put.
        const above = newBlock(b.type === 'heading' ? 'text' : b.type, b.indent);
        commit([...blocks.slice(0, i), above, ...blocks.slice(i)], { id: b.id, pos: 0 });
        return;
      }
      const nb = { ...newBlock(type, b.indent, b.text.slice(end)), ...(type === 'check' ? { checked: false } : {}) };
      const next = [...blocks.slice(0, i), { ...b, text: b.text.slice(0, s) }, nb, ...blocks.slice(i + 1)];
      commit(next, { id: nb.id, pos: 0 });
      return;
    }

    if (key === 'Backspace' && s === 0 && end === 0) {
      if (b.type !== 'text') { e.preventDefault(); commit(patch(i, { type: 'text', checked: undefined }), { id: b.id, pos: 0 }); return; }
      if (b.indent > 0) { e.preventDefault(); doOutdent(i); return; }
      if (i > 0) {
        e.preventDefault();
        const prev = blocks[i - 1];
        const next = normalize([...blocks.slice(0, i - 1), { ...prev, text: prev.text + b.text }, ...blocks.slice(i + 1)]);
        commit(next, { id: prev.id, pos: prev.text.length });
      }
      return;
    }
    if (key === 'Delete' && s === b.text.length && end === s && i < blocks.length - 1) {
      e.preventDefault();
      const nx = blocks[i + 1];
      commit(normalize([...blocks.slice(0, i), { ...b, text: b.text + nx.text }, ...blocks.slice(i + 2)]), { id: b.id, pos: s });
      return;
    }

    // Arrow keys hop between lines at the first / last line of a block.
    if (key === 'ArrowUp' && !e.shiftKey && !e.altKey && !mod && i > 0 && !el.value.slice(0, s).includes('\n')) {
      e.preventDefault();
      const prev = blocks[i - 1];
      pendingFocus.current = { id: prev.id, pos: Math.min(s, prev.text.length) };
      setActive(prev.id);
      return;
    }
    if (key === 'ArrowDown' && !e.shiftKey && !e.altKey && !mod && i < blocks.length - 1 && !el.value.slice(end).includes('\n')) {
      e.preventDefault();
      const nx = blocks[i + 1];
      const line = s - (el.value.lastIndexOf('\n', s - 1) + 1);
      pendingFocus.current = { id: nx.id, pos: Math.min(line, nx.text.length) };
      setActive(nx.id);
    }
  };

  const activeIdx = active ? idx(active) : -1;

  const onDragOver = (k: number, e: React.DragEvent) => {
    if (!drag) return;
    e.preventDefault();
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const place = e.clientY < r.top + r.height / 2 ? 'before' : 'after';
    if (drag.over !== k || drag.place !== place) setDrag({ ...drag, over: k, place });
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!drag) return;
    const id = blocks[drag.from].id;
    const r = dropAt(blocks, drag.from, drag.over, drag.place);
    setDrag(null);
    if (r.blocks !== blocks) commit(r.blocks, { id, pos: 0 });
  };

  type ToolKey = 'heading' | 'bullet' | 'number' | 'check' | 'outdent' | 'indent' | 'up' | 'down' | 'undo' | 'redo';
  const runTool = (k: ToolKey) => {
    if (k === 'undo') return restore('past');
    if (k === 'redo') return restore('future');
    const i = activeIdx;
    if (i < 0) return;
    if (k === 'outdent') doOutdent(i);
    else if (k === 'indent') doIndent(i);
    else if (k === 'up') doMove(i, -1);
    else if (k === 'down') doMove(i, 1);
    else setType(i, k);
  };
  const at = activeIdx >= 0 ? blocks[activeIdx] : null;
  const TOOLS: (readonly [ToolKey, string, string] | null)[] = [
    ['heading', 'Aa', 'Heading (type # )'],
    ['bullet', '• List', 'Bulleted list (Ctrl+Shift+8)'],
    ['number', '1. List', 'Numbered list (Ctrl+Shift+7)'],
    ['check', '☑ Checklist', 'Checklist (Ctrl+Shift+9)'],
    null,
    ['outdent', '⇤', 'Decrease indent (Shift+Tab)'],
    ['indent', '⇥', 'Increase indent (Tab)'],
    null,
    ['up', '↑ Move', 'Move up (Alt+Shift+↑)'],
    ['down', '↓ Move', 'Move down (Alt+Shift+↓)'],
    null,
    ['undo', '↶', 'Undo (Ctrl+Z)'],
    ['redo', '↷', 'Redo (Ctrl+Y)'],
  ];

  return (
    <div>
      <div className="notes-toolbar" role="toolbar" aria-label="Formatting">
        {TOOLS.map((t, n) => {
          if (!t) return <span key={`sep${n}`} className="notes-sep" />;
          const [k, label, title] = t;
          const always = k === 'undo' || k === 'redo';
          return (
            <button key={k} type="button" title={title} onMouseDown={(e) => e.preventDefault()} onClick={() => runTool(k)}
              disabled={!always && activeIdx < 0} className={`notes-tool${at?.type === k ? ' on' : ''}`}>{label}</button>
          );
        })}
      </div>

      <div className="notes-doc" onDragEnd={() => setDrag(null)}>
        {blocks.map((b, i) => {
          const marker =
            b.type === 'bullet' ? <span className="notes-mark">{BULLETS[b.indent % BULLETS.length]}</span>
              : b.type === 'number' ? <span className="notes-mark num">{numberOf(blocks, i)}.</span>
                : b.type === 'check' ? (
                  <input type="checkbox" checked={!!b.checked} onChange={() => toggleCheck(i)} className="notes-check" aria-label="Done" />
                ) : null;
          const dropLine = drag && drag.over === i && drag.from !== i ? drag.place : null;
          return (
            <div key={b.id}
              className={`notes-row${drag?.from === i ? ' dragging' : ''}${dropLine ? ` drop-${dropLine}` : ''}`}
              style={{ paddingLeft: `${b.indent * 26}px` }}
              onDragOver={(e) => onDragOver(i, e)} onDrop={onDrop}>
              <span className="notes-handle" draggable title="Drag to move · Alt+Shift+↑/↓"
                onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', b.text); setDrag({ from: i, over: i, place: 'before' }); }}>
                ⋮⋮
              </span>
              {marker}
              <textarea
                ref={(el) => { if (el) refs.current.set(b.id, el); else refs.current.delete(b.id); }}
                data-block-id={b.id}
                rows={1}
                value={b.text}
                placeholder={blocks.length === 1 && !b.text ? 'Start typing… (Tab to indent, Alt+Shift+↑/↓ to move)' : b.type === 'heading' ? 'Heading' : ''}
                onChange={(e) => onText(i, e.currentTarget)}
                onKeyDown={(e) => onKey(i, e)}
                onFocus={() => setActive(b.id)}
                className={`notes-line t-${b.type}${b.type === 'check' && b.checked ? ' done' : ''}`}
                spellCheck
              />
            </div>
          );
        })}
        <div className="notes-tail" onClick={() => {
          const last = blocks[blocks.length - 1];
          if (last && !last.text) { pendingFocus.current = { id: last.id, pos: 0 }; setActive(last.id); return; }
          const nb = newBlock(last?.type === 'heading' ? 'text' : last?.type ?? 'bullet', last?.indent ?? 0);
          commit([...blocks, nb], { id: nb.id, pos: 0 });
        }} />
      </div>
      <p style={{ fontSize: '0.7rem', color: '#6e7681', marginTop: '0.8rem', lineHeight: 1.6 }}>
        Tab / Shift+Tab indent · Alt+Shift+↑/↓ move a line · Ctrl+Shift+8 / 7 / 9 bullets / numbers / checklist · Ctrl+Enter tick ·
        type <code>- </code> <code>1. </code> <code>[] </code> <code># </code> to start a list · Shift+Enter new line in the same item · drag ⋮⋮ to move
      </p>
    </div>
  );
}

function autosize(el: HTMLTextAreaElement) {
  el.style.height = '0px';
  el.style.height = `${el.scrollHeight}px`;
}

const CSS = `
.notes-layout { display: grid; grid-template-columns: 240px 1fr; gap: 1rem; align-items: start; }
@media (max-width: 760px) { .notes-layout { grid-template-columns: 1fr; } }
.notes-side { background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 0.7rem; position: sticky; top: 1rem; max-height: calc(100vh - 2rem); overflow-y: auto; }
@media (max-width: 760px) { .notes-side { position: static; max-height: 40vh; } }
.notes-new { width: 100%; padding: 0.5rem; border-radius: 8px; border: none; background: #238636; color: #fff; font-weight: 600; font-size: 0.85rem; cursor: pointer; }
.notes-search { width: 100%; margin-top: 0.5rem; padding: 0.4rem 0.6rem; border-radius: 8px; border: 1px solid #30363d; background: #0d1117; color: #e6edf3; font-size: 0.8rem; outline: none; }
.notes-item { text-align: left; background: none; border: 1px solid transparent; border-radius: 8px; padding: 0.4rem 0.55rem; cursor: pointer; font-size: 0.82rem; width: 100%; }
.notes-item:hover { background: #1c2128; }
.notes-item.active { background: rgba(88,166,255,0.1); border-color: #58a6ff55; }
.notes-main { background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 1rem 1.2rem 1.4rem; min-height: 60vh; min-width: 0; }
.notes-title { flex: 1; min-width: 0; background: none; border: none; outline: none; color: #e6edf3; font-size: 1.45rem; font-weight: 700; padding: 0.2rem 0; }
.notes-title::placeholder { color: #484f58; }
.notes-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; padding: 0.4rem 0; margin-bottom: 0.6rem; border-bottom: 1px solid #21262d; position: sticky; top: 0; background: #161b22; z-index: 2; }
.notes-tool { padding: 3px 9px; border-radius: 6px; border: 1px solid #30363d; background: #0d1117; color: #c9d1d9; font-size: 0.75rem; cursor: pointer; white-space: nowrap; }
.notes-tool:hover:not(:disabled) { border-color: #58a6ff88; }
.notes-tool:disabled { opacity: 0.45; cursor: default; }
.notes-tool.on { background: rgba(88,166,255,0.15); border-color: #58a6ff; color: #e6edf3; }
.notes-sep { width: 1px; height: 18px; background: #30363d; margin: 0 3px; }
.notes-doc { display: flex; flex-direction: column; }
.notes-row { display: flex; align-items: flex-start; gap: 6px; position: relative; border-radius: 4px; }
.notes-row.dragging { opacity: 0.4; }
.notes-row.drop-before::before, .notes-row.drop-after::after { content: ''; position: absolute; left: 0; right: 0; height: 2px; background: #58a6ff; }
.notes-row.drop-before::before { top: -1px; }
.notes-row.drop-after::after { bottom: -1px; }
.notes-handle { width: 16px; flex-shrink: 0; color: #484f58; cursor: grab; user-select: none; font-size: 0.75rem; line-height: 1.7rem; letter-spacing: -2px; opacity: 0; text-align: center; }
.notes-row:hover .notes-handle, .notes-row:focus-within .notes-handle { opacity: 1; }
@media (hover: none) { .notes-handle { opacity: 0.6; } }
.notes-mark { width: 1.3em; flex-shrink: 0; text-align: center; color: #8b949e; line-height: 1.7rem; font-size: 0.95rem; }
.notes-mark.num { width: auto; min-width: 1.5em; text-align: right; font-size: 0.88rem; font-variant-numeric: tabular-nums; }
.notes-check { margin: 0.45rem 0.15rem 0 0.15rem; width: 15px; height: 15px; accent-color: #3fb950; cursor: pointer; flex-shrink: 0; }
.notes-line { flex: 1; min-width: 0; resize: none; overflow: hidden; background: none; border: none; outline: none; color: #e6edf3; font: inherit; font-size: 0.95rem; line-height: 1.7rem; padding: 0; }
.notes-line::placeholder { color: #484f58; }
.notes-line.t-heading { font-size: 1.15rem; font-weight: 700; line-height: 2.1rem; margin-top: 0.3rem; }
.notes-line.done { color: #6e7681; text-decoration: line-through; }
.notes-tail { min-height: 3rem; cursor: text; }
`;
