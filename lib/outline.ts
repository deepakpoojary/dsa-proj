// Outline documents for /notes: a flat list of blocks, each with an indent
// level. A block's "children" are the blocks right after it with a deeper
// indent, so moving / indenting a block carries its children with it.
// All functions here are pure: they return a new array.

import { newId } from './journal';

export type BlockType = 'text' | 'bullet' | 'number' | 'check' | 'heading';

export interface Block {
  id: string;
  type: BlockType;
  text: string;
  indent: number;
  checked?: boolean;
  /** Its children are folded away (Notion-style toggle). */
  collapsed?: boolean;
}

export interface NoteDoc {
  title: string;
  blocks: Block[];
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
}

export const MAX_INDENT = 8;

export const newBlock = (type: BlockType = 'bullet', indent = 0, text = ''): Block => ({ id: newId(), type, text, indent });

export function newNote(): NoteDoc {
  const now = Date.now();
  return { title: '', blocks: [newBlock('bullet')], createdAt: now, updatedAt: now };
}

/** Index just past `i`'s children. */
export function subtreeEnd(blocks: Block[], i: number): number {
  let j = i + 1;
  while (j < blocks.length && blocks[j].indent > blocks[i].indent) j++;
  return j;
}

/** First block at indent 0; nobody more than one level deeper than the block above. */
export function normalize(blocks: Block[]): Block[] {
  let prev = -1;
  let changed = false;
  const out = blocks.map((b) => {
    const max = prev + 1;
    const indent = Math.max(0, Math.min(b.indent, max, MAX_INDENT));
    prev = indent;
    if (indent === b.indent) return b;
    changed = true;
    return { ...b, indent };
  });
  return changed ? out : blocks;
}

function shift(blocks: Block[], from: number, to: number, by: number): Block[] {
  return blocks.map((b, k) => (k >= from && k < to ? { ...b, indent: Math.max(0, Math.min(MAX_INDENT, b.indent + by)) } : b));
}

/** Tab: one level deeper, with children. Not past one level below the block above. */
export function indent(blocks: Block[], i: number): Block[] {
  if (i <= 0 || blocks[i].indent >= MAX_INDENT || blocks[i].indent > blocks[i - 1].indent) return blocks;
  return shift(blocks, i, subtreeEnd(blocks, i), 1);
}

/** Shift+Tab: one level shallower, with children. */
export function outdent(blocks: Block[], i: number): Block[] {
  if (blocks[i].indent === 0) return blocks;
  return shift(blocks, i, subtreeEnd(blocks, i), -1);
}

/** Lines a..b (inclusive) plus the children of the last one: the unit a multi-line selection moves as. */
export function rangeEnd(blocks: Block[], a: number, b: number): number {
  let end = b + 1;
  for (let k = a; k <= b; k++) end = Math.max(end, subtreeEnd(blocks, k));
  return end;
}

/** Tab on a selection of lines a..b: all one level deeper, if the first one can go. */
export function indentRange(blocks: Block[], a: number, b: number): Block[] {
  if (a === b) return indent(blocks, a);
  if (a <= 0 || blocks[a].indent > blocks[a - 1].indent) return blocks;
  return normalize(shift(blocks, a, rangeEnd(blocks, a, b), 1));
}

/** Shift+Tab on a selection: every line that can go one level shallower does. */
export function outdentRange(blocks: Block[], a: number, b: number): Block[] {
  if (a === b) return outdent(blocks, a);
  return normalize(shift(blocks, a, rangeEnd(blocks, a, b), -1));
}

/** Moves the block range [from, to) so it starts at `at` (an index in the array without it). */
function relocate(blocks: Block[], from: number, to: number, at: number, newIndent?: number): Block[] {
  const chunk = blocks.slice(from, to);
  const rest = [...blocks.slice(0, from), ...blocks.slice(to)];
  const by = newIndent === undefined ? 0 : newIndent - chunk[0].indent;
  const moved = by ? chunk.map((b) => ({ ...b, indent: Math.max(0, b.indent + by) })) : chunk;
  return normalize([...rest.slice(0, at), ...moved, ...rest.slice(at)]);
}

/** Alt+Shift+↑: swap with the block (and its children) above. Returns the moved block's new index. */
export function moveUp(blocks: Block[], i: number, end = subtreeEnd(blocks, i)): { blocks: Block[]; index: number } {
  if (i <= 0) return { blocks, index: i };
  let k = i - 1;
  while (k > 0 && blocks[k].indent > blocks[i].indent) k--;
  return { blocks: relocate(blocks, i, end, k), index: k };
}

/** Alt+Shift+↓: swap with the block (and its children) below. */
export function moveDown(blocks: Block[], i: number, end = subtreeEnd(blocks, i)): { blocks: Block[]; index: number } {
  if (end >= blocks.length) return { blocks, index: i };
  // A sibling below jumps over us with its children; a shallower block alone.
  const after = blocks[end].indent >= blocks[i].indent ? subtreeEnd(blocks, end) : end + 1;
  const at = after - (end - i);
  return { blocks: relocate(blocks, i, end, at), index: at };
}

/** Drag and drop: puts `i` (with children) before or after `target`, at `target`'s indent. */
export function dropAt(blocks: Block[], i: number, target: number, place: 'before' | 'after'): { blocks: Block[]; index: number } {
  const end = subtreeEnd(blocks, i);
  if (target >= i && target < end) return { blocks, index: i }; // into itself
  let at = place === 'before' ? target : target + 1;
  if (at > i) at -= end - i;
  // Dropped just under a block that has children: become its first child.
  const rest = [...blocks.slice(0, i), ...blocks.slice(end)];
  const hasKids = (rest[at]?.indent ?? -1) > blocks[target].indent;
  const lvl = place === 'after' && hasKids ? blocks[target].indent + 1 : blocks[target].indent;
  return { blocks: relocate(blocks, i, end, at, lvl), index: at };
}

/** Indexes hidden because an ancestor is collapsed. */
export function hiddenSet(blocks: Block[]): Set<number> {
  const out = new Set<number>();
  let below = Infinity; // hide everything deeper than this indent
  blocks.forEach((b, i) => {
    if (b.indent > below) { out.add(i); return; }
    below = b.collapsed ? b.indent : Infinity;
  });
  return out;
}

/** 1-based number of a numbered block among its consecutive numbered siblings. */
export function numberOf(blocks: Block[], i: number): number {
  let n = 1;
  for (let k = i - 1; k >= 0; k--) {
    const b = blocks[k];
    if (b.indent > blocks[i].indent) continue;
    if (b.indent < blocks[i].indent || b.type !== 'number') break;
    n++;
  }
  return n;
}

export function noteText(doc: NoteDoc): string {
  return [doc.title, ...doc.blocks.map((b) => b.text)].join('\n');
}

/** Plain-text copy with indents and markers, for the clipboard. */
export function toPlainText(doc: NoteDoc): string {
  return doc.blocks
    .map((b, i) => {
      const pad = '  '.repeat(b.indent);
      const mark = b.type === 'bullet' ? '- ' : b.type === 'number' ? `${numberOf(doc.blocks, i)}. ` : b.type === 'check' ? (b.checked ? '[x] ' : '[ ] ') : b.type === 'heading' ? '# ' : '';
      return pad + mark + b.text;
    })
    .join('\n');
}

// ── Paste: Google Docs / web lists and plain-text lists → blocks ───────────

type Parsed = Omit<Block, 'id'>;

const LINE_MARK = /^(☐|☑|☒|✅|✔|\[ ?\]|\[[xX✓]\]|[-*•◦▪▫●○■□–]|\d+[.)])\s+/;

/** One plain-text line → a block: leading tabs / spaces become indent, a marker sets the type. */
function parseLine(raw: string): Parsed {
  const lead = /^[\t ]*/.exec(raw)![0];
  const indent = Math.min(MAX_INDENT, (lead.match(/\t/g)?.length ?? 0) + Math.floor(lead.replace(/\t/g, '').length / 2));
  let text = raw.slice(lead.length);
  const m = LINE_MARK.exec(text);
  if (!m) return { type: 'text', text: text.trimEnd(), indent };
  const mark = m[1];
  text = text.slice(m[0].length).trimEnd();
  if (/^(☐|\[ ?\])$/.test(mark)) return { type: 'check', text, indent, checked: false };
  if (/^(☑|☒|✅|✔|\[[xX✓]\])$/.test(mark)) return { type: 'check', text, indent, checked: true };
  if (/^\d/.test(mark)) return { type: 'number', text, indent };
  return { type: 'bullet', text, indent };
}

export function parsePlainList(text: string): Parsed[] {
  return text.replace(/\r\n?/g, '\n').split('\n').filter((l, i, all) => l.trim() || (i > 0 && i < all.length - 1)).map(parseLine);
}

/** True when plain text looks like a list worth splitting into blocks. */
export function looksLikeList(text: string): boolean {
  const lines = text.replace(/\r\n?/g, '\n').split('\n').filter((l) => l.trim());
  return lines.length > 1 || lines.some((l) => LINE_MARK.test(l.trimStart()));
}

/** Text of an element, without the text of lists nested inside it. */
function ownText(el: Element): string {
  let out = '';
  el.childNodes.forEach((n) => {
    if (n.nodeType === 3) out += n.textContent ?? '';
    else if (n.nodeType === 1) {
      const e = n as Element;
      if (e.tagName === 'UL' || e.tagName === 'OL') return;
      if (e.tagName === 'BR') out += ' ';
      else out += ownText(e);
    }
  });
  return out.replace(/\s+/g, ' ').trim();
}

/**
 * Clipboard HTML (Google Docs, web pages) → blocks. Google Docs marks
 * checklist items with role="checkbox" + aria-checked and nesting with
 * aria-level; other sites nest <ul>/<ol>. Returns null if there's no list.
 */
export function parseHtmlList(html: string): Parsed[] | null {
  if (typeof DOMParser === 'undefined') return null;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  if (!doc.querySelector('li')) return null;
  const out: Parsed[] = [];
  for (const el of doc.body.querySelectorAll('li, p, h1, h2, h3, h4, h5, h6')) {
    if (el.tagName !== 'LI' && el.closest('li')) continue; // a <p> inside a list item
    const text = ownText(el);
    if (el.tagName !== 'LI') {
      if (text) out.push({ type: /^H\d$/.test(el.tagName) ? 'heading' : 'text', text, indent: 0 });
      continue;
    }
    let depth = 0;
    for (let p = el.parentElement; p && p !== doc.body; p = p.parentElement) if (p.tagName === 'UL' || p.tagName === 'OL') depth++;
    const level = Number(el.getAttribute('aria-level'));
    const indent = Math.min(MAX_INDENT, Math.max(0, level > 0 ? level - 1 : depth - 1));
    const box = el.querySelector(':scope > input[type=checkbox], :scope > * > input[type=checkbox]') as HTMLInputElement | null;
    const ariaChecked = el.getAttribute('aria-checked') ?? el.querySelector('[aria-checked]')?.getAttribute('aria-checked') ?? null;
    const isCheck = el.getAttribute('role') === 'checkbox' || ariaChecked !== null || !!box || /^(☐|☑|☒)\s/.test(text);
    if (isCheck) {
      const struck = /line-through/.test(el.getAttribute('style') ?? '') || !!el.querySelector('[style*="line-through"], s, del, strike');
      const checked = ariaChecked === 'true' || !!box?.hasAttribute('checked') || /^(☑|☒)\s/.test(text) || struck;
      out.push({ type: 'check', text: text.replace(/^(☐|☑|☒)\s+/, ''), indent, checked });
    } else {
      out.push({ type: el.parentElement?.tagName === 'OL' ? 'number' : 'bullet', text, indent });
    }
  }
  return out.length ? out : null;
}
