'use client';

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import SiteNav from './SiteNav';
import { useDocs, DOC_STATUS_LABEL } from '@/lib/use-docs';
import {
  blankResume, defaultResume, emptyEntry, emptySection, uid,
  ResumeData, ResumeEntry, ResumeSection, ResumeTemplate,
} from '@/lib/resume';
import { normalizeHref, parseRich, RichNode, stripRich } from '@/lib/rich-text';

const SEED_ID = 'main';
const A4_HEIGHT_PX = 1123; // 297mm at 96dpi

// ── Rendering helpers ─────────────────────────────────────────────────────

// Renders **bold**, *italic*, __underline__ and [text](url) markup.
function Rich({ text, classic }: { text: string; classic?: boolean }) {
  const render = (nodes: RichNode[], key = ''): React.ReactNode[] =>
    nodes.map((n, i) => {
      const k = `${key}${i}`;
      if (n.t === 'text') return <span key={k}>{n.v}</span>;
      if (n.t !== 'a') {
        const Tag = n.t === 'b' ? 'strong' : n.t === 'i' ? 'em' : 'u';
        return <Tag key={k}>{render(n.c, k)}</Tag>;
      }
      return (
        <a key={k} href={normalizeHref(n.href)} target="_blank" rel="noopener noreferrer"
          style={{ color: classic ? '#000' : '#1a0dab', textDecoration: 'underline' }}>
          {render(n.c, k)}
        </a>
      );
    });
  return <>{render(parseRich(text))}</>;
}

function contactHref(c: string): string | null {
  const t = c.trim();
  const url = t.match(/(https?:\/\/\S+)/)?.[1];
  if (url) return url;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return `mailto:${t}`;
  if (/^(www\.|linkedin\.com|github\.com|[\w-]+\.(com|in|dev|io|app|me)\/)/i.test(t)) return `https://${t.replace(/^https?:\/\//, '')}`;
  return null;
}

const bulletsOf = (s: string) => s.split('\n').map((b) => b.replace(/^\s*[-•*]\s*/, '').trim()).filter(Boolean);

// ── The page (both templates) ─────────────────────────────────────────────

function ResumePage({ data }: { data: ResumeData }) {
  const classic = data.template === 'classic';
  const font = classic
    ? 'var(--font-latex), "Latin Modern Roman", "CMU Serif", Cambria, Georgia, serif'
    : '"Liberation Serif", "Times New Roman", Times, serif';
  const contacts = data.contacts.split('\n').map((c) => c.trim()).filter(Boolean);
  const indent = classic ? '0.16in' : 0;

  const row: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'baseline' };

  const renderEntry = (e: ResumeEntry) => {
    const bullets = bulletsOf(e.bullets);
    const hasSub = e.subtitle || e.subtitleRight;
    return (
      <div key={e.id} style={{ marginLeft: indent, marginBottom: classic ? '5px' : '7px', breakInside: 'avoid' }}>
        {(e.title || e.titleRight || e.tech) && (
          <div style={row}>
            <span>
              <strong><Rich text={e.title} classic={classic} /></strong>
              {e.tech && <> {' | '}<span style={{ fontStyle: classic ? 'italic' : 'normal' }}><Rich text={e.tech} classic={classic} /></span></>}
            </span>
            <span style={{ whiteSpace: 'nowrap', fontWeight: classic ? 400 : 700 }}><Rich text={e.titleRight} classic={classic} /></span>
          </div>
        )}
        {hasSub && (
          <div style={{ ...row, fontStyle: 'italic', fontSize: classic ? '0.94em' : '0.98em' }}>
            <span><Rich text={e.subtitle} classic={classic} /></span>
            <span style={{ whiteSpace: 'nowrap' }}><Rich text={e.subtitleRight} classic={classic} /></span>
          </div>
        )}
        {bullets.length > 0 && (
          <ul style={{ margin: '2px 0 0', paddingLeft: classic ? '0.3in' : '0.32in', listStyle: 'disc' }}>
            {bullets.map((b, i) => (
              <li key={i} style={{ marginBottom: classic ? '0' : '1px', fontSize: classic ? '0.94em' : '1em' }}><Rich text={b} classic={classic} /></li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  const renderSection = (s: ResumeSection) => (
    <section key={s.id} style={{ marginTop: classic ? '7px' : '14px' }}>
      <h2
        style={
          classic
            ? { fontVariant: 'small-caps', fontWeight: 400, fontSize: '1.22em', margin: '0 0 4px', borderBottom: '1px solid #000', lineHeight: 1.25, letterSpacing: '0.01em' }
            : { textTransform: 'uppercase', fontWeight: 700, fontSize: '1.3em', margin: '0 0 6px', borderBottom: '1px solid #555', paddingBottom: '1px', letterSpacing: '0.01em' }
        }
      >
        <Rich text={s.title} classic={classic} />
      </h2>
      {s.kind === 'entries'
        ? s.entries.map(renderEntry)
        : (
          <div style={{ marginLeft: indent, fontSize: classic ? '0.94em' : '1em' }}>
            {s.lines.filter((l) => l.label || l.value).map((l) => (
              <div key={l.id} style={{ marginBottom: '1px' }}>
                {l.label && <strong><Rich text={l.label} classic={classic} /></strong>}
                {l.label && l.value && (s.sep === ':' ? ': ' : ' – ')}
                <Rich text={l.value} classic={classic} />
              </div>
            ))}
          </div>
        )}
    </section>
  );

  return (
    <div
      className="resume-print"
      style={{
        width: '210mm', minHeight: '297mm', background: '#fff', color: '#000', fontFamily: font,
        fontSize: classic ? '10.5pt' : '10.5pt', lineHeight: classic ? 1.32 : 1.3,
        padding: classic ? '11mm 15mm' : '16mm 17mm', boxSizing: 'border-box',
      }}
    >
      <header style={{ textAlign: 'center', marginBottom: classic ? '4px' : '10px' }}>
        <div
          style={
            classic
              ? { fontSize: '25pt', fontWeight: 700, letterSpacing: '0.02em', textTransform: 'uppercase', lineHeight: 1.1 }
              : { fontSize: '28pt', fontWeight: 700, letterSpacing: '0.04em', lineHeight: 1.15 }
          }
        >
          <Rich text={data.name} classic={classic} />
        </div>
        <div style={{ fontSize: classic ? '0.94em' : '1em', marginTop: classic ? '2px' : '8px' }}>
          {contacts.map((c, i) => {
            // A contact written as [text](url) is rendered as-is; plain ones are auto-linked.
            const href = /\[[^\]]+\]\([^)]+\)/.test(c) ? null : contactHref(c);
            return (
              <span key={i}>
                {i > 0 && <span style={{ margin: '0 0.45em' }}>|</span>}
                {href ? (
                  <a href={href} style={{ color: '#000', textDecoration: classic ? 'underline' : 'none' }}>{c}</a>
                ) : <Rich text={c} classic={classic} />}
              </span>
            );
          })}
        </div>
      </header>
      {data.sections.map(renderSection)}
    </div>
  );
}

// ── Editor bits ───────────────────────────────────────────────────────────

const input: React.CSSProperties = {
  width: '100%', padding: '5px 8px', borderRadius: '6px', border: '1px solid #30363d', background: '#0d1117',
  color: '#e6edf3', fontSize: '0.8rem', outline: 'none', fontFamily: 'inherit',
};
const small: React.CSSProperties = {
  background: 'none', border: '1px solid #30363d', borderRadius: '6px', color: '#8b949e', fontSize: '0.7rem',
  padding: '2px 7px', cursor: 'pointer',
};
const label: React.CSSProperties = { fontSize: '0.66rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.06em' };

// The editor remembers the last field you were in, so the toolbar can format it.
interface ActiveField {
  el: HTMLInputElement | HTMLTextAreaElement;
  onChange: (v: string) => void;
}
const FormatCtx = createContext<{ setActive: (f: ActiveField) => void }>({ setActive: () => {} });

type Mark = 'b' | 'i' | 'u' | 'a' | 'clear';
const WRAP: Record<'b' | 'i' | 'u', [string, string]> = { b: ['**', '**'], i: ['*', '*'], u: ['__', '__'] };

function applyMark(f: ActiveField, mark: Mark) {
  const { el, onChange } = f;
  const v = el.value;
  let s = el.selectionStart ?? v.length;
  let e = el.selectionEnd ?? v.length;
  let next: string;
  let selStart: number;
  let selEnd: number;

  if (mark === 'clear') {
    const plain = stripRich(v.slice(s, e));
    next = v.slice(0, s) + plain + v.slice(e);
    selStart = s;
    selEnd = s + plain.length;
  } else if (mark === 'a') {
    const sel = v.slice(s, e);
    const looksUrl = /^(https?:\/\/|www\.)\S+$/.test(sel.trim());
    const text = sel && !looksUrl ? sel : 'link text';
    const url = looksUrl ? sel.trim() : 'https://';
    next = v.slice(0, s) + `[${text}](${url})` + v.slice(e);
    // Select the URL so it can be typed over straight away.
    selStart = s + text.length + 3;
    selEnd = selStart + url.length;
  } else {
    const [open, close] = WRAP[mark];
    const before = v.slice(s - open.length, s);
    const after = v.slice(e, e + close.length);
    // For italic, "**" around the selection means bold, not italic.
    const boldNotItalic = mark === 'i' && v.slice(s - 2, s) === '**' && v.slice(s - 3, s) !== '***';
    if (s !== e && before === open && after === close && !boldNotItalic) {
      // Already wrapped → unwrap.
      next = v.slice(0, s - open.length) + v.slice(s, e) + v.slice(e + close.length);
      selStart = s - open.length;
      selEnd = e - open.length;
    } else {
      if (s === e) {
        // No selection: wrap the word under the cursor.
        while (s > 0 && /\S/.test(v[s - 1])) s--;
        while (e < v.length && /\S/.test(v[e])) e++;
      }
      const sel = v.slice(s, e) || (mark === 'b' ? 'bold' : mark === 'i' ? 'italic' : 'underline');
      next = v.slice(0, s) + open + sel + close + v.slice(e);
      selStart = s + open.length;
      selEnd = selStart + sel.length;
    }
  }
  onChange(next);
  requestAnimationFrame(() => {
    el.focus();
    el.setSelectionRange(selStart, selEnd);
  });
}

function Field({ value, onChange, placeholder, area, rows }: { value: string; onChange: (v: string) => void; placeholder?: string; area?: boolean; rows?: number }) {
  const { setActive } = useContext(FormatCtx);
  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => setActive({ el: e.currentTarget, onChange });
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
    const k = e.key.toLowerCase();
    const mark: Mark | null = k === 'b' ? 'b' : k === 'i' ? 'i' : k === 'u' ? 'u' : k === 'k' ? 'a' : null;
    if (!mark) return;
    e.preventDefault();
    e.stopPropagation(); // keep Ctrl+K from jumping to the site search
    applyMark({ el: e.currentTarget, onChange }, mark);
  };
  return area ? (
    <textarea value={value} onChange={(e) => onChange(e.target.value)} onFocus={onFocus} onKeyDown={onKeyDown} placeholder={placeholder} rows={rows ?? 4} style={{ ...input, resize: 'vertical', lineHeight: 1.45 }} />
  ) : (
    <input value={value} onChange={(e) => onChange(e.target.value)} onFocus={onFocus} onKeyDown={onKeyDown} placeholder={placeholder} style={input} />
  );
}

function Toolbar({ active }: { active: React.RefObject<ActiveField | null> }) {
  const btn = (mark: Mark, labelNode: React.ReactNode, title: string) => (
    <button
      type="button"
      title={title}
      // mousedown + preventDefault keeps the text selection in the field.
      onMouseDown={(e) => {
        e.preventDefault();
        if (active.current?.el.isConnected) applyMark(active.current, mark);
      }}
      style={{ ...small, color: '#e6edf3', minWidth: '30px', fontSize: '0.8rem', padding: '3px 8px' }}
    >
      {labelNode}
    </button>
  );
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 5, background: '#0d1117', padding: '6px 0', display: 'flex', gap: '0.35rem', alignItems: 'center', flexWrap: 'wrap', borderBottom: '1px solid #21262d' }}>
      {btn('b', <strong>B</strong>, 'Bold (Ctrl+B)')}
      {btn('i', <em style={{ fontFamily: 'Georgia, serif' }}>I</em>, 'Italic (Ctrl+I)')}
      {btn('u', <u>U</u>, 'Underline (Ctrl+U)')}
      {btn('a', '🔗 Link', 'Link (Ctrl+K) — select text first, then type the URL')}
      {btn('clear', 'Clear', 'Remove formatting from the selection')}
      <span style={{ fontSize: '0.68rem', color: '#6e7681' }}>Select text in any field, then format it</span>
    </div>
  );
}

function move<T>(arr: T[], i: number, d: number): T[] {
  const j = i + d;
  if (j < 0 || j >= arr.length) return arr;
  const next = [...arr];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

// ── Main ──────────────────────────────────────────────────────────────────

export default function ResumeBuilder({ signedIn }: { signedIn: boolean }) {
  const { docs, setDoc, status } = useDocs<ResumeData>('resume', signedIn);
  // Shown until the first edit; only then written, so a fresh device never
  // overwrites a resume that is still loading from the server.
  const [seed] = useState<ResumeData>(() => defaultResume());
  const all = useMemo(() => {
    const entries = Object.entries(docs).sort((a, b) => (a[1].createdAt ?? 0) - (b[1].createdAt ?? 0));
    return entries.length ? entries : [[SEED_ID, seed] as [string, ResumeData]];
  }, [docs, seed]);
  const [activeId, setActiveId] = useState<string>(SEED_ID);
  const current = all.find(([id]) => id === activeId) ?? all[0];
  const [docId, data] = current;
  const [confirmDelete, setConfirmDelete] = useState(false);
  const activeField = useRef<ActiveField | null>(null);
  const setActive = useCallback((f: ActiveField) => { activeField.current = f; }, []);
  const formatCtx = useMemo(() => ({ setActive }), [setActive]);

  const pageRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState(1);
  useLayoutEffect(() => {
    const h = pageRef.current?.scrollHeight ?? 0;
    setPages(Math.max(1, Math.ceil((h - 4) / A4_HEIGHT_PX)));
  }, [data]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConfirmDelete(false);
  }, [docId]);

  const update = (patch: Partial<ResumeData>) => setDoc(docId, { ...data, ...patch });
  const setSection = (id: string, patch: Partial<ResumeSection>) =>
    update({ sections: data.sections.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  const setEntry = (s: ResumeSection, id: string, patch: Partial<ResumeEntry>) =>
    setSection(s.id, { entries: s.entries.map((e) => (e.id === id ? { ...e, ...patch } : e)) });

  const create = (base: ResumeData) => {
    const id = uid();
    setDoc(id, { ...base, createdAt: Date.now() });
    setActiveId(id);
  };

  const download = () => {
    const prev = document.title;
    document.title = data.name ? `${stripRich(data.name)} - Resume` : 'Resume';
    window.print();
    document.title = prev;
  };

  const tplBtn = (t: ResumeTemplate, text: string, sub: string) => (
    <button
      type="button"
      onClick={() => update({ template: t })}
      style={{
        flex: 1, textAlign: 'left', padding: '7px 10px', borderRadius: '8px', cursor: 'pointer',
        border: `1px solid ${data.template === t ? '#58a6ff' : '#30363d'}`,
        background: data.template === t ? 'rgba(88,166,255,0.1)' : '#161b22',
      }}
    >
      <div style={{ fontSize: '0.8rem', color: data.template === t ? '#58a6ff' : '#e6edf3', fontWeight: 600 }}>{text}</div>
      <div style={{ fontSize: '0.68rem', color: '#8b949e' }}>{sub}</div>
    </button>
  );

  return (
    <FormatCtx.Provider value={formatCtx}>
    <div className="resume-app" style={{ minHeight: '100vh', background: '#0d1117', padding: '1.25rem 1rem 3rem' }}>
      <div className="resume-no-print" style={{ maxWidth: '1500px', margin: '0 auto 1rem' }}>
        <SiteNav />
      </div>

      <div style={{ maxWidth: '1500px', margin: '0 auto', display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Editor */}
        <div className="resume-no-print" style={{ flex: '1 1 420px', maxWidth: '560px', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <h1 style={{ fontSize: '1.3rem', color: '#e6edf3', margin: 0 }}>Resume Builder</h1>
            <span style={{ fontSize: '0.7rem', color: '#6e7681' }}>{status ? DOC_STATUS_LABEL[status] : docs[docId] ? '' : 'Starts saving on your first edit'}</span>
          </div>

          {/* Resume picker */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
            {all.map(([id, r]) => (
              <button key={id} type="button" onClick={() => setActiveId(id)}
                style={{ ...small, fontSize: '0.75rem', padding: '3px 10px', color: id === docId ? '#e6edf3' : '#8b949e', borderColor: id === docId ? '#58a6ff' : '#30363d', background: id === docId ? 'rgba(88,166,255,0.1)' : 'transparent' }}>
                {r.label || r.name || 'Untitled'}
              </button>
            ))}
            <button type="button" style={small} onClick={() => create({ ...data, label: `${data.label || 'Resume'} copy`, sections: data.sections.map((s) => ({ ...s, id: uid() })) })}>⧉ Duplicate</button>
            <button type="button" style={small} onClick={() => create(blankResume(data.template))}>+ Blank</button>
            {docs[docId] && (
              confirmDelete ? (
                <span style={{ fontSize: '0.72rem', color: '#f85149' }}>
                  Delete “{data.label}”?{' '}
                  <button type="button" style={{ ...small, color: '#f85149', borderColor: '#f85149' }} onClick={() => { setDoc(docId, null); setActiveId(SEED_ID); }}>Delete</button>{' '}
                  <button type="button" style={small} onClick={() => setConfirmDelete(false)}>Cancel</button>
                </span>
              ) : (
                <button type="button" style={small} onClick={() => setConfirmDelete(true)}>🗑</button>
              )
            )}
          </div>

          <div>
            <div style={{ ...label, marginBottom: '4px' }}>Template</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {tplBtn('classic', 'Classic · small caps', 'Prachi Shetty style — LaTeX look, indented')}
              {tplBtn('bold', 'Bold serif', 'Deepak style — big name, UPPERCASE headings')}
            </div>
          </div>

          <Toolbar active={activeField} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div><div style={label}>Resume label (only for you)</div><Field value={data.label} onChange={(v) => update({ label: v })} /></div>
            <div><div style={label}>Name</div><Field value={data.name} onChange={(v) => update({ name: v })} /></div>
          </div>
          <div>
            <div style={label}>Contacts — one per line (URLs & emails link automatically, or use 🔗)</div>
            <Field area rows={3} value={data.contacts} onChange={(v) => update({ contacts: v })} />
          </div>

          {data.sections.map((s, si) => (
            <div key={s.id} style={{ border: '1px solid #30363d', borderRadius: '10px', padding: '0.7rem', background: '#161b22' }}>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ flex: 1 }}><Field value={s.title} onChange={(v) => setSection(s.id, { title: v })} /></div>
                <button type="button" style={small} title="Move up" onClick={() => update({ sections: move(data.sections, si, -1) })}>↑</button>
                <button type="button" style={small} title="Move down" onClick={() => update({ sections: move(data.sections, si, 1) })}>↓</button>
                <button type="button" style={small} title="Remove section" onClick={() => update({ sections: data.sections.filter((x) => x.id !== s.id) })}>✕</button>
              </div>

              {s.kind === 'entries' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {s.entries.map((e, ei) => (
                    <div key={e.id} style={{ borderLeft: '2px solid #30363d', paddingLeft: '0.55rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '0.35rem' }}>
                        <Field value={e.title} onChange={(v) => setEntry(s, e.id, { title: v })} placeholder="Title (role / school / project)" />
                        <Field value={e.titleRight} onChange={(v) => setEntry(s, e.id, { titleRight: v })} placeholder="Right (dates / place)" />
                        <Field value={e.subtitle} onChange={(v) => setEntry(s, e.id, { subtitle: v })} placeholder="Italic line (company / degree)" />
                        <Field value={e.subtitleRight} onChange={(v) => setEntry(s, e.id, { subtitleRight: v })} placeholder="Italic right (city / years)" />
                      </div>
                      <Field value={e.tech} onChange={(v) => setEntry(s, e.id, { tech: v })} placeholder="Tech after title, e.g. React, Node.js (optional)" />
                      <Field area rows={Math.min(8, Math.max(2, bulletsOf(e.bullets).length + 1))} value={e.bullets} onChange={(v) => setEntry(s, e.id, { bullets: v })} placeholder="Bullets — one per line. Select text and use B / I / U / 🔗 to format." />
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        <button type="button" style={small} onClick={() => setSection(s.id, { entries: move(s.entries, ei, -1) })}>↑</button>
                        <button type="button" style={small} onClick={() => setSection(s.id, { entries: move(s.entries, ei, 1) })}>↓</button>
                        <button type="button" style={small} onClick={() => setSection(s.id, { entries: s.entries.filter((x) => x.id !== e.id) })}>Remove</button>
                      </div>
                    </div>
                  ))}
                  <button type="button" style={{ ...small, alignSelf: 'flex-start', color: '#58a6ff' }} onClick={() => setSection(s.id, { entries: [...s.entries, emptyEntry()] })}>+ Add entry</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {s.lines.map((l, li) => (
                    <div key={l.id} style={{ display: 'grid', gridTemplateColumns: '0.8fr 2fr auto auto', gap: '0.35rem' }}>
                      <Field value={l.label} onChange={(v) => setSection(s.id, { lines: s.lines.map((x) => (x.id === l.id ? { ...x, label: v } : x)) })} placeholder="Bold label" />
                      <Field value={l.value} onChange={(v) => setSection(s.id, { lines: s.lines.map((x) => (x.id === l.id ? { ...x, value: v } : x)) })} placeholder="Value" />
                      <button type="button" style={small} onClick={() => setSection(s.id, { lines: move(s.lines, li, -1) })}>↑</button>
                      <button type="button" style={small} onClick={() => setSection(s.id, { lines: s.lines.filter((x) => x.id !== l.id) })}>✕</button>
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <button type="button" style={{ ...small, color: '#58a6ff' }} onClick={() => setSection(s.id, { lines: [...s.lines, { id: uid(), label: '', value: '' }] })}>+ Add line</button>
                    <span style={{ fontSize: '0.7rem', color: '#8b949e' }}>Join with</span>
                    <button type="button" style={{ ...small, color: s.sep === ':' ? '#e6edf3' : '#8b949e' }} onClick={() => setSection(s.id, { sep: ':' })}>Label: value</button>
                    <button type="button" style={{ ...small, color: s.sep === '–' ? '#e6edf3' : '#8b949e' }} onClick={() => setSection(s.id, { sep: '–' })}>Label – value</button>
                  </div>
                </div>
              )}
            </div>
          ))}

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button type="button" style={{ ...small, color: '#58a6ff' }} onClick={() => update({ sections: [...data.sections, emptySection('entries')] })}>+ Section with entries (jobs, projects…)</button>
            <button type="button" style={{ ...small, color: '#58a6ff' }} onClick={() => update({ sections: [...data.sections, { ...emptySection('lines', 'Roles of Responsibility'), sep: '–' }] })}>+ Section with lines (skills, roles…)</button>
          </div>
        </div>

        {/* Preview */}
        <div style={{ flex: '0 0 auto', position: 'sticky', top: '1rem' }}>
          <div className="resume-no-print" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
            <button
              type="button"
              onClick={download}
              style={{ background: '#238636', border: '1px solid #2ea043', color: '#fff', borderRadius: '8px', padding: '6px 14px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
            >
              ⬇ Download PDF
            </button>
            <span style={{ fontSize: '0.72rem', color: pages > 1 ? '#d29922' : '#8b949e' }}>
              {pages > 1 ? `▲ Runs onto ${pages} pages — trim to fit one` : 'Fits on one A4 page'}
            </span>
            <span style={{ fontSize: '0.68rem', color: '#6e7681', marginLeft: 'auto' }}>In the print dialog choose “Save as PDF”, margins: None</span>
          </div>
          <div ref={pageRef} className="resume-sheet" style={{ boxShadow: '0 6px 30px rgba(0,0,0,0.5)', position: 'relative' }}>
            <ResumePage data={data} />
            {pages > 1 && (
              <div className="resume-no-print" style={{ position: 'absolute', left: 0, right: 0, top: `${A4_HEIGHT_PX}px`, borderTop: '2px dashed #d29922' }} />
            )}
          </div>
        </div>
      </div>
    </div>
    </FormatCtx.Provider>
  );
}
