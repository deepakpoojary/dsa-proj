// Small Markdown renderer for chat-style answers: headings, paragraphs,
// bullet / numbered lists (one nesting level), fenced code, pipe tables,
// blockquotes, rules, and inline `code`, **bold**, *italic*.

import type { ReactNode } from 'react';

const MONO = 'var(--font-geist-mono), monospace';

type Block =
  | { t: 'h'; level: number; text: string }
  | { t: 'p'; text: string }
  | { t: 'code'; lang: string; text: string }
  | { t: 'list'; ordered: boolean; items: { text: string; sub: { ordered: boolean; items: string[] } | null }[] }
  | { t: 'table'; head: string[]; rows: string[][] }
  | { t: 'quote'; text: string }
  | { t: 'hr' };

const LIST_ITEM = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
// Splits a table row on `|`, except escaped `\|` or pipes inside `code` (e.g. `a || b`).
function splitRow(line: string): string[] {
  const row = line.trim().replace(/^\|/, '').replace(/(?<!\\)\|$/, '');
  const cells: string[] = [];
  let cur = '';
  let inCode = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === '\\' && row[i + 1] === '|') { cur += '|'; i++; continue; }
    if (ch === '`') inCode = !inCode;
    if (ch === '|' && !inCode) { cells.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  cells.push(cur.trim());
  return cells;
}

function parse(md: string): Block[] {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    const fence = line.match(/^\s*(```|~~~)\s*([\w+-]*)/);
    if (fence) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(fence[1])) body.push(lines[i++]);
      i++;
      out.push({ t: 'code', lang: fence[2], text: body.join('\n') });
      continue;
    }
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) { out.push({ t: 'h', level: h[1].length, text: h[2].replace(/\s*#+\s*$/, '') }); i++; continue; }
    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) { out.push({ t: 'hr' }); i++; continue; }

    if (line.trim().startsWith('|') && i + 1 < lines.length && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
      const head = splitRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) rows.push(splitRow(lines[i++]));
      out.push({ t: 'table', head, rows });
      continue;
    }
    if (line.startsWith('>')) {
      const body: string[] = [];
      while (i < lines.length && lines[i].startsWith('>')) body.push(lines[i++].replace(/^>\s?/, ''));
      out.push({ t: 'quote', text: body.join(' ') });
      continue;
    }
    const li = line.match(LIST_ITEM);
    if (li && !li[1]) {
      const ordered = /\d/.test(li[2]);
      const items: Extract<Block, { t: 'list' }>['items'] = [];
      while (i < lines.length) {
        const m = lines[i].match(LIST_ITEM);
        if (m && !m[1]) { items.push({ text: m[3], sub: null }); i++; continue; }
        if (m && m[1] && items.length) {
          const last = items[items.length - 1];
          last.sub ??= { ordered: /\d/.test(m[2]), items: [] };
          last.sub.items.push(m[3]);
          i++;
          continue;
        }
        // Lazy continuation line of the previous item.
        if (lines[i].trim() && /^\s+/.test(lines[i]) && items.length && !/^\s*```/.test(lines[i])) {
          items[items.length - 1].text += ' ' + lines[i].trim();
          i++;
          continue;
        }
        // A blank line followed by another item keeps the list going.
        if (!lines[i].trim() && lines[i + 1]?.match(LIST_ITEM)) { i++; continue; }
        break;
      }
      out.push({ t: 'list', ordered, items });
      continue;
    }
    const para: string[] = [];
    while (
      i < lines.length && lines[i].trim() && !/^(#{1,6}\s|\s*```|\s*~~~|>|\|)/.test(lines[i]) && !(lines[i].match(LIST_ITEM) && !lines[i].match(LIST_ITEM)![1])
    ) para.push(lines[i++].trim());
    if (para.length) out.push({ t: 'p', text: para.join(' ') });
    else i++;
  }
  return out;
}

// Inline: `code` first (its contents are literal), then **bold** and *italic*.
function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  text.split(/(`[^`]+`)/g).forEach((part, i) => {
    if (part.length > 2 && part.startsWith('`') && part.endsWith('`')) {
      out.push(
        <code key={i} style={{ background: 'rgba(110,118,129,0.2)', borderRadius: '4px', padding: '0 4px', fontSize: '0.9em', fontFamily: MONO }}>
          {part.slice(1, -1)}
        </code>
      );
      return;
    }
    part.split(/(\*\*[^*]+\*\*|(?<![\w*])\*[^*\s][^*]*\*(?![\w*])|(?<!\w)_[^_\s][^_]*_(?!\w))/g).forEach((s, j) => {
      if (!s) return;
      if (s.startsWith('**') && s.endsWith('**') && s.length > 4) out.push(<strong key={`${i}-${j}`} style={{ color: '#e6edf3' }}>{inline(s.slice(2, -2))}</strong>);
      else if ((s.startsWith('*') && s.endsWith('*')) || (s.startsWith('_') && s.endsWith('_'))) out.push(<em key={`${i}-${j}`}>{s.slice(1, -1)}</em>);
      else out.push(<span key={`${i}-${j}`}>{s}</span>);
    });
  });
  return out;
}

const H_SIZE = ['1.05rem', '0.98rem', '0.9rem', '0.86rem', '0.86rem', '0.86rem'];

export default function Markdown({ text }: { text: string }) {
  const blocks = parse(text);
  return (
    <div style={{ fontSize: '0.86rem', lineHeight: 1.65, color: '#c9d1d9', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      {blocks.map((b, i) => {
        switch (b.t) {
          case 'h':
            return (
              <div key={i} style={{ fontSize: H_SIZE[b.level - 1], fontWeight: 600, color: '#e6edf3', marginTop: i ? '0.4rem' : 0 }}>
                {inline(b.text)}
              </div>
            );
          case 'p':
            return <p key={i} style={{ margin: 0 }}>{inline(b.text)}</p>;
          case 'hr':
            return <hr key={i} style={{ border: 'none', borderTop: '1px solid #30363d', margin: '0.2rem 0', width: '100%' }} />;
          case 'quote':
            return (
              <div key={i} style={{ borderLeft: '3px solid #30363d', paddingLeft: '0.75rem', color: '#8b949e' }}>{inline(b.text)}</div>
            );
          case 'code':
            return (
              <pre key={i} style={{
                margin: 0, padding: '0.7rem 0.85rem', background: '#0d1117', border: '1px solid #30363d', borderRadius: '8px',
                overflowX: 'auto', fontSize: '0.78rem', lineHeight: 1.55, color: '#e6edf3', fontFamily: MONO,
              }}>
                {b.text}
              </pre>
            );
          case 'table':
            return (
              <div key={i} style={{ overflowX: 'auto' }}>
                <table style={{ borderCollapse: 'collapse', fontSize: '0.8rem', width: '100%' }}>
                  <thead>
                    <tr>{b.head.map((c, j) => <th key={j} style={{ ...cell, color: '#e6edf3', background: '#0d1117', textAlign: 'left' }}>{inline(c)}</th>)}</tr>
                  </thead>
                  <tbody>
                    {b.rows.map((r, k) => <tr key={k}>{r.map((c, j) => <td key={j} style={cell}>{inline(c)}</td>)}</tr>)}
                  </tbody>
                </table>
              </div>
            );
          case 'list': {
            const Tag = b.ordered ? 'ol' : 'ul';
            return (
              <Tag key={i} style={{ margin: 0, paddingLeft: '1.3rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {b.items.map((it, j) => (
                  <li key={j}>
                    {inline(it.text)}
                    {it.sub && (() => {
                      const Sub = it.sub.ordered ? 'ol' : 'ul';
                      return (
                        <Sub style={{ margin: '4px 0 0', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '3px', listStyle: it.sub.ordered ? undefined : 'circle' }}>
                          {it.sub.items.map((s, k) => <li key={k}>{inline(s)}</li>)}
                        </Sub>
                      );
                    })()}
                  </li>
                ))}
              </Tag>
            );
          }
        }
      })}
    </div>
  );
}

const cell: React.CSSProperties = { border: '1px solid #30363d', padding: '4px 8px', verticalAlign: 'top' };
