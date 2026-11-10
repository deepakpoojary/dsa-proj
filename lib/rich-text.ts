// Tiny inline markup for the Resume Builder:
//   **bold**   *italic*   __underline__   [text](https://link)
// Nesting works (e.g. **bold *and italic***).

export type RichNode =
  | { t: 'text'; v: string }
  | { t: 'b' | 'i' | 'u'; c: RichNode[] }
  | { t: 'a'; href: string; c: RichNode[] };

const RULES: { re: RegExp; make: (m: RegExpExecArray) => RichNode }[] = [
  { re: /\[([^\]]+)\]\(([^)\s]+)\)/, make: (m) => ({ t: 'a', href: m[2], c: parseRich(m[1]) }) },
  { re: /\*\*(.+?)\*\*(?!\*)/, make: (m) => ({ t: 'b', c: parseRich(m[1]) }) },
  { re: /__(.+?)__/, make: (m) => ({ t: 'u', c: parseRich(m[1]) }) },
  { re: /\*([^*]+)\*/, make: (m) => ({ t: 'i', c: parseRich(m[1]) }) },
];

export function parseRich(text: string): RichNode[] {
  const out: RichNode[] = [];
  let rest = text;
  while (rest) {
    let best: { idx: number; len: number; node: RichNode } | null = null;
    for (const r of RULES) {
      const m = r.re.exec(rest);
      if (m && (!best || m.index < best.idx)) best = { idx: m.index, len: m[0].length, node: r.make(m) };
    }
    if (!best) {
      out.push({ t: 'text', v: rest });
      break;
    }
    if (best.idx > 0) out.push({ t: 'text', v: rest.slice(0, best.idx) });
    out.push(best.node);
    rest = rest.slice(best.idx + best.len);
  }
  return out;
}

/** Plain text with the markup removed (for titles, file names…). */
export function stripRich(text: string): string {
  const walk = (ns: RichNode[]): string => ns.map((n) => (n.t === 'text' ? n.v : walk(n.c))).join('');
  return walk(parseRich(text));
}

/** Makes a bare "linkedin.com/in/x" or email into a usable href. */
export function normalizeHref(h: string): string {
  const t = h.trim();
  if (/^(https?:|mailto:|tel:)/i.test(t)) return t;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return `mailto:${t}`;
  if (/^\+?[\d\s()-]{7,}$/.test(t)) return `tel:${t.replace(/[^\d+]/g, '')}`;
  return `https://${t}`;
}
