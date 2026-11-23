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
  type Block, type BlockType, type NoteDoc, dropAt, hiddenSet, indentRange, moveDown, moveUp, newBlock, newNote, outdentRange, rangeEnd, subtreeEnd,
  looksLikeList, normalize, noteText, numberOf, parseHtmlList, parsePlainList, toPlainText,
} from '@/lib/outline';

const SELECTED_KEY = 'notes:selected';
const BULLETS = ['•', '◦', '▪'];
const NEWLINE = String.fromCharCode(10);

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
  // Multi-line selection (anchor -> focus, by block id), like selecting several lines in Docs.
  const [sel, setSel] = useState<{ anchor: string; focus: string } | null>(null);
  const mouseFrom = useRef<string | null>(null);
  useEffect(() => {
    const up = () => { mouseFrom.current = null; };
    window.addEventListener('mouseup', up);
    return () => window.removeEventListener('mouseup', up);
  }, []);

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

  // Folding (Notion-style): lines under a collapsed line are hidden.
  const hidden = hiddenSet(blocks);
  const hasKids = (i: number) => subtreeEnd(blocks, i) > i + 1;
  const prevVisible = (i: number) => { let k = i - 1; while (k >= 0 && hidden.has(k)) k--; return k; };
  const nextVisible = (i: number) => { let k = i + 1; while (k < blocks.length && hidden.has(k)) k++; return k < blocks.length ? k : -1; };
  const toggleFold = (i: number) => {
    if (!hasKids(i)) return;
    commit(patch(i, { collapsed: !blocks[i].collapsed || undefined }), keepFocus(i));
  };
  /** After indenting, open the line it went under so it doesn't vanish. */
  const expandParentOf = (list: Block[], i: number): Block[] => {
    for (let k = i - 1; k >= 0; k--) {
      if (list[k].indent < list[i].indent) return list[k].collapsed ? list.map((x, n) => (n === k ? { ...x, collapsed: undefined } : x)) : list;
    }
    return list;
  };

  // Selected lines a..b (inclusive), or just line i when nothing is multi-selected.
  const selIdx = sel ? [idx(sel.anchor), idx(sel.focus)] : null;
  const multi = !!selIdx && selIdx[0] >= 0 && selIdx[1] >= 0 && selIdx[0] !== selIdx[1];
  const selA = multi ? Math.min(selIdx![0], selIdx![1]) : -1;
  const selB = multi ? Math.max(selIdx![0], selIdx![1]) : -1;
  const rangeOf = (i: number): [number, number] => (multi ? [selA, selB] : [i, i]);
  function keepFocus(i: number) { return { id: blocks[i].id, pos: caretOf(blocks[i].id) }; }

  // ── Operations on line i, or on the whole selection (toolbar + keys) ──
  const doIndent = (i: number) => {
    const [a, b] = rangeOf(i);
    const next = indentRange(blocks, a, b);
    if (next !== blocks) commit(expandParentOf(next, a), keepFocus(i));
  };
  const doOutdent = (i: number) => { const [a, b] = rangeOf(i); commit(outdentRange(blocks, a, b), keepFocus(i)); };
  const doMove = (i: number, dir: -1 | 1) => {
    const [a, b] = rangeOf(i);
    const end = rangeEnd(blocks, a, b);
    const r = dir < 0 ? moveUp(blocks, a, end) : moveDown(blocks, a, end);
    if (r.blocks !== blocks) commit(r.blocks, keepFocus(i));
  };
  const deleteRange = (a: number, b: number) => {
    let next = normalize([...blocks.slice(0, a), ...blocks.slice(b + 1)]);
    if (!next.length) next = [newBlock('bullet')];
    const to = next[Math.max(0, a - 1)];
    setSel(null);
    commit(next, { id: to.id, pos: a > 0 ? to.text.length : 0 });
  };
  const rangeText = (a: number, b: number) => {
    const part = blocks.slice(a, b + 1);
    const min = Math.min(...part.map((x) => x.indent));
    return toPlainText({ title: '', blocks: part.map((x) => ({ ...x, indent: x.indent - min })), createdAt: 0, updatedAt: 0 });
  };
  /** Puts parsed lines in place of the selection in block i (splitting it), shifted to its indent. */
  const insertParsed = (i: number, parsed: Omit<Block, 'id'>[], s: number, e: number) => {
    const b = blocks[i];
    const before = b.text.slice(0, s);
    const after = b.text.slice(e);
    const items: Block[] = parsed.map((p) => ({ ...p, id: newId(), indent: p.indent + b.indent }));
    const last = items[items.length - 1];
    const caret = last.text.length;
    last.text += after;
    const head: Block[] = before.trim() ? [{ ...b, text: before }] : [];
    // Text before the caret stays as its own line; an empty line is replaced by the paste.
    commit(normalize([...blocks.slice(0, i), ...head, ...items, ...blocks.slice(i + 1)]), { id: last.id, pos: caret });
  };

  const onPaste = (i: number, e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const html = e.clipboardData.getData('text/html');
    const plain = e.clipboardData.getData('text/plain');
    const parsed = (html && parseHtmlList(html)) || (plain && looksLikeList(plain) ? parsePlainList(plain) : null);
    if (!parsed?.length) return; // ordinary text: let the browser paste it
    e.preventDefault();
    const el = e.currentTarget;
    setSel(null);
    insertParsed(i, parsed, el.selectionStart, el.selectionEnd);
  };

  const setType = (i: number, type: BlockType) => {
    if (multi) {
      // Whole selection: all become `type`; if they already all are, back to plain text (like Docs).
      const all = blocks.slice(selA, selB + 1).every((x) => x.type === type);
      const t: BlockType = all ? 'text' : type;
      commit(blocks.map((x, k) => (k < selA || k > selB ? x : { ...x, type: t, checked: t === 'check' ? !!x.checked && x.type === 'check' : undefined })), keepFocus(i));
      return;
    }
    const b = blocks[i];
    if (b.text.includes(NEWLINE) && type !== 'heading') {
      // Several lines in one item (e.g. pasted earlier): split them into separate items of this type.
      const items: Block[] = parsePlainList(b.text).filter((p) => p.text.trim()).map((p) => ({
        id: newId(), text: p.text, indent: b.indent + p.indent,
        type: type === 'check' || p.type === 'text' ? type : p.type,
        ...(type === 'check' ? { checked: p.type === 'check' ? !!p.checked : false } : {}),
      }));
      if (items.length) {
        commit(normalize([...blocks.slice(0, i), ...items, ...blocks.slice(i + 1)]), { id: items[items.length - 1].id, pos: items[items.length - 1].text.length });
        return;
      }
    }
    const t = b.type === type ? 'text' : type; // pressing it again turns it off, like Docs
    commit(patch(i, { type: t, checked: t === 'check' ? !!b.checked : undefined }), { id: b.id, pos: caretOf(b.id) });
  };
  const toggleCheck = (i: number) => commit(patch(i, { checked: !blocks[i].checked }), { id: blocks[i].id, pos: caretOf(blocks[i].id) });
  /** Ctrl+Enter on a selection: make them all checkboxes, or tick / untick them all. */
  const toggleCheckRange = (i: number) => {
    const part = blocks.slice(selA, selB + 1);
    if (!part.every((x) => x.type === 'check')) return setType(i, 'check');
    const val = !part.every((x) => x.checked);
    commit(blocks.map((x, k) => (k < selA || k > selB ? x : { ...x, checked: val })), keepFocus(i));
  };

  const onText = (i: number, el: HTMLTextAreaElement) => {
    if (sel) setSel(null);
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
    if (mod && !e.altKey && key.toLowerCase() === 'z') { e.preventDefault(); setSel(null); restore(e.shiftKey ? 'future' : 'past'); return; }
    if (mod && !e.altKey && key.toLowerCase() === 'y') { e.preventDefault(); setSel(null); restore('future'); return; }

    // Ctrl+. folds / unfolds the lines under this one.
    if (mod && key === '.') { e.preventDefault(); toggleFold(i); return; }

    // Ctrl+A: first selects this line's text, again selects every line.
    if (mod && !e.shiftKey && key.toLowerCase() === 'a' && (multi || (s === 0 && end === el.value.length))) {
      e.preventDefault();
      setSel({ anchor: blocks[0].id, focus: blocks[blocks.length - 1].id });
      return;
    }
    // Shift+Up/Down grows the selection by whole lines once it leaves this line.
    if ((key === 'ArrowUp' || key === 'ArrowDown') && e.shiftKey && !e.altKey && !mod) {
      const up = key === 'ArrowUp';
      if (multi) {
        e.preventDefault();
        const f = idx(sel!.focus);
        const g = up ? prevVisible(f) : nextVisible(f);
        if (g >= 0) setSel({ anchor: sel!.anchor, focus: blocks[g].id });
        return;
      }
      const atEdge = up ? !el.value.slice(0, s).includes(NEWLINE) : !el.value.slice(end).includes(NEWLINE);
      const j = up ? prevVisible(i) : nextVisible(i);
      if (atEdge && j >= 0) {
        e.preventDefault();
        setSel({ anchor: b.id, focus: blocks[j].id });
      }
      return;
    }
    if (multi) {
      if (key === 'Escape') { e.preventDefault(); setSel(null); return; }
      if (key === 'Backspace' || key === 'Delete') { e.preventDefault(); deleteRange(selA, selB); return; }
      if (mod && key === 'Enter') { e.preventDefault(); toggleCheckRange(i); return; }
      if (key.startsWith('Arrow') && !e.shiftKey) setSel(null);
      else if (key.length === 1 && !mod && !e.altKey) setSel(null); // typing goes back to this line
    }

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
      const after = b.collapsed && hasKids(i) ? subtreeEnd(blocks, i) : i + 1;
      const next = [...blocks.slice(0, i), { ...b, text: b.text.slice(0, s) }, ...blocks.slice(i + 1, after), nb, ...blocks.slice(after)];
      commit(next, { id: nb.id, pos: 0 });
      return;
    }

    if (key === 'Backspace' && s === 0 && end === 0) {
      if (b.type !== 'text') { e.preventDefault(); commit(patch(i, { type: 'text', checked: undefined }), { id: b.id, pos: 0 }); return; }
      if (b.indent > 0) { e.preventDefault(); doOutdent(i); return; }
      const p = prevVisible(i);
      if (p >= 0) {
        e.preventDefault();
        const prev = blocks[p];
        const next = normalize(blocks.flatMap((x, k) => (k === p ? [{ ...prev, text: prev.text + b.text }] : k === i ? [] : [x])));
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
    if (key === 'ArrowUp' && !e.shiftKey && !e.altKey && !mod && prevVisible(i) >= 0 && !el.value.slice(0, s).includes('\n')) {
      e.preventDefault();
      const prev = blocks[prevVisible(i)];
      pendingFocus.current = { id: prev.id, pos: Math.min(s, prev.text.length) };
      setActive(prev.id);
      return;
    }
    if (key === 'ArrowDown' && !e.shiftKey && !e.altKey && !mod && nextVisible(i) >= 0 && !el.value.slice(end).includes('\n')) {
      e.preventDefault();
      const nx = blocks[nextVisible(i)];
      const line = s - (el.value.lastIndexOf('\n', s - 1) + 1);
      pendingFocus.current = { id: nx.id, pos: Math.min(line, nx.text.length) };
      setActive(nx.id);
    }
  };

  const activeIdx = active ? idx(active) : -1;

  // Mouse: drag across lines or Shift+click to select several.
  const onLineMouseDown = (b: Block, e: React.MouseEvent<HTMLTextAreaElement>) => {
    if (e.shiftKey && active && active !== b.id) {
      e.preventDefault();
      setSel({ anchor: sel?.anchor ?? active, focus: b.id });
      return;
    }
    if (sel) setSel(null);
    mouseFrom.current = b.id;
  };
  const onRowEnter = (b: Block, e: React.MouseEvent) => {
    const from = mouseFrom.current;
    if (!from || !(e.buttons & 1)) return;
    if (from !== b.id) setSel({ anchor: from, focus: b.id });
    else if (sel) setSel(null);
  };
  const onCopyCut = (e: React.ClipboardEvent<HTMLTextAreaElement>, cut: boolean) => {
    if (!multi) return;
    e.preventDefault();
    e.clipboardData.setData('text/plain', rangeText(selA, selB));
    if (cut) deleteRange(selA, selB);
  };

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
    if (k === 'undo') { setSel(null); return restore('past'); }
    if (k === 'redo') { setSel(null); return restore('future'); }
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
              disabled={!always && activeIdx < 0} className={`notes-tool${(multi ? blocks.slice(selA, selB + 1).every((x) => x.type === k) : at?.type === k) ? ' on' : ''}`}>{label}</button>
          );
        })}
      </div>

      <div className="notes-doc" onDragEnd={() => setDrag(null)}>
        {blocks.map((b, i) => {
          if (hidden.has(i)) return null;
          const kids = hasKids(i);
          const marker =
            b.type === 'bullet' ? <span className="notes-mark">{BULLETS[b.indent % BULLETS.length]}</span>
              : b.type === 'number' ? <span className="notes-mark num">{numberOf(blocks, i)}.</span>
                : b.type === 'check' ? (
                  <input type="checkbox" checked={!!b.checked} onChange={() => toggleCheck(i)} className="notes-check" aria-label="Done" />
                ) : null;
          const dropLine = drag && drag.over === i && drag.from !== i ? drag.place : null;
          return (
            <div key={b.id}
              className={`notes-row${drag?.from === i ? ' dragging' : ''}${dropLine ? ` drop-${dropLine}` : ''}${multi && i >= selA && i <= selB ? ' selected' : ''}`}
              style={{ paddingLeft: `${b.indent * 26}px` }}
              onMouseEnter={(e) => onRowEnter(b, e)}
              onDragOver={(e) => onDragOver(i, e)} onDrop={onDrop}>
              <span className="notes-handle" draggable title="Drag to move · Alt+Shift+↑/↓"
                onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', b.text); setDrag({ from: i, over: i, place: 'before' }); }}>
                ⋮⋮
              </span>
              <button type="button" className={`notes-fold${kids ? '' : ' none'}${b.collapsed ? ' closed' : ''}`} tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()} onClick={() => toggleFold(i)} disabled={!kids}
                aria-label={b.collapsed ? 'Expand' : 'Collapse'} title={kids ? `${b.collapsed ? 'Expand' : 'Collapse'} (Ctrl+.)` : undefined}>
                ▾
              </button>
              {marker}
              <textarea
                ref={(el) => { if (el) refs.current.set(b.id, el); else refs.current.delete(b.id); }}
                data-block-id={b.id}
                rows={1}
                value={b.text}
                placeholder={blocks.length === 1 && !b.text ? 'Start typing… (Tab to indent, Alt+Shift+↑/↓ to move)' : b.type === 'heading' ? 'Heading' : ''}
                onChange={(e) => onText(i, e.currentTarget)}
                onKeyDown={(e) => onKey(i, e)}
                onPaste={(e) => onPaste(i, e)}
                onMouseDown={(e) => onLineMouseDown(b, e)}
                onCopy={(e) => onCopyCut(e, false)}
                onCut={(e) => onCopyCut(e, true)}
                onFocus={() => setActive(b.id)}
                className={`notes-line t-${b.type}${b.type === 'check' && b.checked ? ' done' : ''}`}
                spellCheck
              />
              {b.collapsed && kids && (
                <button type="button" className="notes-folded" onClick={() => toggleFold(i)} title="Show hidden lines">
                  {subtreeEnd(blocks, i) - i - 1} hidden
                </button>
              )}
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
        Select several lines: drag across them, Shift+click, Shift+↑/↓ or Ctrl+A twice, then any button or shortcut applies to all ·
        ▸ / Ctrl+. folds the lines under a line ·
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
.notes-row.selected { background: rgba(56,139,253,0.18); }
.notes-row.selected .notes-line::selection { background: transparent; }
.notes-fold { width: 16px; flex-shrink: 0; background: none; border: none; color: #8b949e; cursor: pointer; font-size: 0.75rem; line-height: 1.7rem; padding: 0; transition: transform 0.12s; }
.notes-fold.closed { transform: rotate(-90deg); color: #c9d1d9; }
.notes-fold.none { visibility: hidden; }
.notes-folded { flex-shrink: 0; align-self: center; background: #21262d; border: 1px solid #30363d; border-radius: 999px; color: #8b949e; font-size: 0.68rem; padding: 0 7px; cursor: pointer; }
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
