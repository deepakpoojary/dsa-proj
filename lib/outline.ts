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

/** Moves the block range [from, to) so it starts at `at` (an index in the array without it). */
function relocate(blocks: Block[], from: number, to: number, at: number, newIndent?: number): Block[] {
  const chunk = blocks.slice(from, to);
  const rest = [...blocks.slice(0, from), ...blocks.slice(to)];
  const by = newIndent === undefined ? 0 : newIndent - chunk[0].indent;
  const moved = by ? chunk.map((b) => ({ ...b, indent: Math.max(0, b.indent + by) })) : chunk;
  return normalize([...rest.slice(0, at), ...moved, ...rest.slice(at)]);
}

/** Alt+Shift+↑: swap with the block (and its children) above. Returns the moved block's new index. */
export function moveUp(blocks: Block[], i: number): { blocks: Block[]; index: number } {
  if (i <= 0) return { blocks, index: i };
  const end = subtreeEnd(blocks, i);
  let k = i - 1;
  while (k > 0 && blocks[k].indent > blocks[i].indent) k--;
  return { blocks: relocate(blocks, i, end, k), index: k };
}

/** Alt+Shift+↓: swap with the block (and its children) below. */
export function moveDown(blocks: Block[], i: number): { blocks: Block[]; index: number } {
  const end = subtreeEnd(blocks, i);
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
