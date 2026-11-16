'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import SiteNav from '@/components/SiteNav';

export interface GlossaryEntry {
  name: string;
  desc: string;
  /** Set when the app has questions on this term. */
  link: { href: string; count: number } | null;
}

export interface GlossaryViewSection {
  key: string;
  icon: string;
  label: string;
  blurb: string;
  terms: GlossaryEntry[];
}

export default function GlossaryView({ sections }: { sections: GlossaryViewSection[] }) {
  const [filter, setFilter] = useState('');
  const [onlyLinked, setOnlyLinked] = useState(false);

  const shown = useMemo(() => {
    const f = filter.trim().toLowerCase();
    return sections
      .map((s) => ({
        ...s,
        terms: s.terms.filter((t) =>
          (!onlyLinked || t.link) && (!f || t.name.toLowerCase().includes(f) || t.desc.toLowerCase().includes(f) || s.label.toLowerCase().includes(f))
        ),
      }))
      .filter((s) => s.terms.length > 0);
  }, [sections, filter, onlyLinked]);

  const total = sections.reduce((a, s) => a + s.terms.length, 0);
  const linked = sections.reduce((a, s) => a + s.terms.filter((t) => t.link).length, 0);

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', padding: '2rem 1rem 4rem' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        <SiteNav />

        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#e6edf3', margin: 0 }}>📚 Glossary</h1>
          <p style={{ color: '#8b949e', fontSize: '0.85rem', margin: '6px 0 0' }}>
            {total} essential software-engineering terms. <span style={{ color: '#58a6ff' }}>Blue</span> ones ({linked}) have questions here: click to open them.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input type="search" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter terms…" aria-label="Filter terms"
            style={{
              flex: '1 1 220px', padding: '0.5rem 0.8rem', borderRadius: '8px', border: '1px solid #30363d',
              background: '#161b22', color: '#e6edf3', fontSize: '0.88rem', outline: 'none',
            }} />
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#c9d1d9', cursor: 'pointer' }}>
            <input type="checkbox" checked={onlyLinked} onChange={(e) => setOnlyLinked(e.target.checked)} />
            Only terms with questions
          </label>
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {shown.map((s) => (
            <a key={s.key} href={`#${s.key}`}
              style={{ fontSize: '0.75rem', color: '#c9d1d9', textDecoration: 'none', border: '1px solid #30363d', borderRadius: '999px', padding: '3px 10px', background: '#161b22' }}>
              {s.icon} {s.label} <span style={{ color: '#6e7681' }}>{s.terms.length}</span>
            </a>
          ))}
        </div>

        {shown.length === 0 && <div style={{ color: '#8b949e', fontSize: '0.88rem' }}>No terms match “{filter}”.</div>}

        {shown.map((s) => (
          <section key={s.key} id={s.key} style={{ scrollMarginTop: '1rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#e6edf3', margin: '0.6rem 0 2px' }}>{s.icon} {s.label}</h2>
            <p style={{ color: '#8b949e', fontSize: '0.8rem', margin: '0 0 0.6rem' }}>{s.blurb}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.5rem' }}>
              {s.terms.map((t) => {
                const body = (
                  <>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: t.link ? '#58a6ff' : '#e6edf3' }}>{t.name}</span>
                      {t.link && (
                        <span style={{ fontSize: '0.68rem', color: '#8b949e', whiteSpace: 'nowrap' }}>
                          {t.link.count} Q{t.link.count === 1 ? '' : 's'} →
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#8b949e', lineHeight: 1.45, marginTop: '3px' }}>{t.desc}</div>
                  </>
                );
                const card: React.CSSProperties = {
                  display: 'block', padding: '0.6rem 0.75rem', borderRadius: '8px', background: '#161b22', textDecoration: 'none',
                  border: `1px solid ${t.link ? '#1f6feb55' : '#21262d'}`,
                };
                return t.link ? (
                  <Link key={t.name} href={t.link.href} style={card} title={`Open ${t.link.count} question${t.link.count === 1 ? '' : 's'} on ${t.name}`}>{body}</Link>
                ) : (
                  <div key={t.name} style={card}>{body}</div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
