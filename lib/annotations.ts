// Inline comments inside a note body: `[[annotated words::comment]]`.
// Kept in the plain-text body so notes keep syncing as a single string.

const RE = /\[\[([\s\S]+?)::([\s\S]*?)\]\]/g;

export type Segment =
  | { kind: 'text'; text: string; start: number; end: number }
  | { kind: 'ann'; text: string; comment: string; start: number; end: number };

// `start`/`end` are raw offsets into the body; for text segments the shown
// text is the raw text, so raw offset = start + offset within it.
export function parse(body: string): Segment[] {
  const out: Segment[] = [];
  let last = 0;
  for (const m of body.matchAll(RE)) {
    const i = m.index!;
    if (i > last) out.push({ kind: 'text', text: body.slice(last, i), start: last, end: i });
    out.push({ kind: 'ann', text: m[1], comment: m[2], start: i, end: i + m[0].length });
    last = i + m[0].length;
  }
  if (last < body.length) out.push({ kind: 'text', text: body.slice(last), start: last, end: body.length });
  return out;
}

export const hasAnnotations = (body: string) => body.includes('[[') && parse(body).some((s) => s.kind === 'ann');

// Body with markup replaced, e.g. for previews, tooltips and print.
export function flatten(body: string, ann: (text: string, comment: string) => string = (t) => t): string {
  return body.replace(RE, (_, t: string, c: string) => ann(t, c));
}

// The markup's delimiters can't appear inside it, so strip them.
const clean = (s: string) => s.replace(/\[\[|\]\]|::/g, ' ').trim();

// Wraps raw [start, end) — which must not overlap an existing comment.
export function annotate(body: string, start: number, end: number, comment: string): string {
  const text = body.slice(start, end);
  const lead = text.length - text.trimStart().length;
  const trail = text.length - text.trimEnd().length;
  const core = text.trim();
  if (!core || !clean(comment)) return body;
  const s = start + lead, e = end - trail;
  return `${body.slice(0, s)}[[${core.replace(/\[\[|\]\]|::/g, ' ')}::${clean(comment)}]]${body.slice(e)}`;
}

export function overlapsAnnotation(body: string, start: number, end: number): boolean {
  return parse(body).some((s) => s.kind === 'ann' && start < s.end && end > s.start);
}

export function setComment(body: string, seg: Extract<Segment, { kind: 'ann' }>, comment: string | null): string {
  const replacement = comment === null || !clean(comment) ? seg.text : `[[${seg.text}::${clean(comment)}]]`;
  return body.slice(0, seg.start) + replacement + body.slice(seg.end);
}
