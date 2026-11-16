'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import SiteNav from '@/components/SiteNav';
import {
  AREAS, LEVELS, SKILLS, TIERS, estimateFor, salaryBand,
  type Demand, type Level, type Tier,
} from '@/lib/skill-salaries';

const PREFS_KEY = 'skill-salaries:v1';

const DEMAND: Record<Demand, { label: string; color: string; title: string }> = {
  hot: { label: '🔥 Hot', color: '#f0883e', title: 'More openings than good candidates right now' },
  steady: { label: 'Steady', color: '#8b949e', title: 'Plenty of jobs, plenty of candidates' },
  cooling: { label: '↘ Cooling', color: '#6e7681', title: 'Fewer new openings; pay growing slowly' },
};

const lpa = (n: number) => `₹${Number.isInteger(n) ? n : n.toFixed(1)}L`;
const monthly = (n: number) => `≈ ₹${Math.round((n * 100000) / 12 / 1000).toLocaleString('en-IN')}k/month gross`;

export default function SkillSalaries() {
  const [level, setLevel] = useState<Level>('junior');
  const [tier, setTier] = useState<Tier>('product');
  const [area, setArea] = useState<string>('All');
  const [mine, setMine] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Remember the last level / tier / ticked skills on this device.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (raw) {
        const p = JSON.parse(raw) as { level?: Level; tier?: Tier; mine?: string[] };
        /* eslint-disable react-hooks/set-state-in-effect */
        if (p.level && LEVELS.some((l) => l.key === p.level)) setLevel(p.level);
        if (p.tier && TIERS.some((t) => t.key === p.tier)) setTier(p.tier);
        if (Array.isArray(p.mine)) setMine(p.mine.filter((k) => SKILLS.some((s) => s.key === k)));
        /* eslint-enable react-hooks/set-state-in-effect */
      }
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(PREFS_KEY, JSON.stringify({ level, tier, mine })); } catch { /* ignore */ }
  }, [loaded, level, tier, mine]);

  const rows = useMemo(() => SKILLS
    .filter((s) => area === 'All' || s.area === area)
    .map((s) => ({ s, band: salaryBand(s, level, tier) }))
    .sort((a, b) => (b.band?.typical ?? -1) - (a.band?.typical ?? -1)), [area, level, tier]);

  const est = estimateFor(mine, level, tier);
  const max = Math.max(...rows.map((r) => r.band?.high ?? 0), 1);
  const lvl = LEVELS.find((l) => l.key === level)!;
  const tr = TIERS.find((t) => t.key === tier)!;
  const toggle = (key: string) => setMine((m) => (m.includes(key) ? m.filter((k) => k !== key) : [...m, key]));

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', padding: '2rem 1rem 4rem' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        <SiteNav />

        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#e6edf3', margin: 0 }}>💼 Skill Salaries</h1>
          <p style={{ color: '#8b949e', fontSize: '0.85rem', margin: '6px 0 0' }}>
            Realistic yearly CTC in India by skill, experience and company type. Tick the skills you have for your own estimate.{' '}
            <Link href="/roadmap" style={{ color: '#58a6ff', textDecoration: 'none' }}>Plan a switch →</Link>
          </p>
        </div>

        {/* Level + tier */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <Segmented label="Experience" value={level} onChange={setLevel}
            options={LEVELS.map((l) => ({ key: l.key, label: l.label, sub: l.yoe }))} />
          <Segmented label="Company" value={tier} onChange={setTier}
            options={TIERS.map((t) => ({ key: t.key, label: t.label, title: t.hint }))} />
          <div style={{ fontSize: '0.72rem', color: '#6e7681' }}>{tr.hint}</div>
        </div>

        {/* Personal estimate */}
        <div style={{ background: '#161b22', border: `1px solid ${est ? '#3fb95066' : '#30363d'}`, borderRadius: '12px', padding: '0.9rem 1rem' }}>
          <div style={{ fontSize: '0.68rem', color: '#8b949e', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Your estimate · {lvl.label} ({lvl.yoe}) · {tr.label}
          </div>
          {est ? (
            <>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', flexWrap: 'wrap', marginTop: '4px' }}>
                <span style={{ fontSize: '1.6rem', fontWeight: 700, color: '#3fb950' }}>{lpa(est.typical)} / yr</span>
                <span style={{ fontSize: '0.88rem', color: '#c9d1d9' }}>range {lpa(est.low)} – {lpa(est.high)}</span>
                <span style={{ fontSize: '0.75rem', color: '#6e7681' }}>{monthly(est.typical)}</span>
              </div>
              <div style={{ fontSize: '0.76rem', color: '#8b949e', marginTop: '4px' }}>
                Based on <strong style={{ color: '#c9d1d9' }}>{est.best.name}</strong>, your best-paid skill
                {est.bonusPct ? `, +${est.bonusPct}% for skills from other areas` : ''}. Skills don&apos;t add up: offers pay for your main role, with breadth as a bonus.
              </div>
            </>
          ) : (
            <div style={{ fontSize: '0.84rem', color: '#8b949e', marginTop: '4px' }}>
              {mine.length ? 'None of your ticked skills hire at this level.' : 'Tick ✓ the skills you have in the table below.'}
            </div>
          )}
        </div>

        {/* Area filter */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['All', ...AREAS].map((a) => (
            <button key={a} type="button" onClick={() => setArea(a)}
              style={{
                fontSize: '0.75rem', borderRadius: '999px', padding: '3px 11px', cursor: 'pointer',
                border: `1px solid ${area === a ? '#58a6ff' : '#30363d'}`, background: area === a ? 'rgba(88,166,255,0.12)' : '#161b22',
                color: area === a ? '#e6edf3' : '#c9d1d9',
              }}>
              {a}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {rows.map(({ s, band }) => {
            const on = mine.includes(s.key);
            const d = DEMAND[s.demand];
            return (
              <label key={s.key}
                style={{
                  display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr) auto', gap: '0.7rem', alignItems: 'center', cursor: 'pointer',
                  padding: '0.55rem 0.75rem', borderRadius: '8px', background: on ? 'rgba(63,185,80,0.06)' : '#161b22',
                  border: `1px solid ${on ? '#3fb95055' : '#21262d'}`,
                }}>
                <input type="checkbox" checked={on} onChange={() => toggle(s.key)} aria-label={`I know ${s.name}`} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e6edf3' }}>{s.name}</span>
                    <span style={{ fontSize: '0.68rem', color: '#6e7681' }}>{s.area}</span>
                    <span style={{ fontSize: '0.68rem', color: d.color }} title={d.title}>{d.label}</span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#8b949e', marginTop: '1px' }}>{s.stack}</div>
                  {band && (
                    <div style={{ position: 'relative', height: '6px', marginTop: '6px', background: '#21262d', borderRadius: '3px' }}
                      title={`${lpa(band.low)} – ${lpa(band.high)}, typical ${lpa(band.typical)}`}>
                      <div style={{ position: 'absolute', left: `${(band.low / max) * 100}%`, width: `${((band.high - band.low) / max) * 100}%`, top: 0, bottom: 0, background: '#58a6ff55', borderRadius: '3px' }} />
                      <div style={{ position: 'absolute', left: `calc(${(band.typical / max) * 100}% - 1px)`, width: '3px', top: '-2px', bottom: '-2px', background: '#58a6ff', borderRadius: '2px' }} />
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {band ? (
                    <>
                      <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#e6edf3', fontVariantNumeric: 'tabular-nums' }}>{lpa(band.typical)}</div>
                      <div style={{ fontSize: '0.7rem', color: '#8b949e', fontVariantNumeric: 'tabular-nums' }}>{lpa(band.low)} – {lpa(band.high)}</div>
                    </>
                  ) : (
                    <div style={{ fontSize: '0.74rem', color: '#6e7681' }}>Rare at this level</div>
                  )}
                </div>
              </label>
            );
          })}
        </div>

        <div style={{ fontSize: '0.74rem', color: '#6e7681', lineHeight: 1.6, borderTop: '1px solid #21262d', paddingTop: '0.8rem' }}>
          <strong style={{ color: '#8b949e' }}>How to read this.</strong> Figures are yearly CTC in ₹ lakh (1L = ₹1,00,000), 2026 Indian market:
          fixed pay plus usual bonus and stock, before tax. The big number is a typical offer; the range covers most offers, and in-hand pay is lower than CTC.
          These are estimates from public salary data patterns (AmbitionBox, Glassdoor, levels.fyi, recruiter reports), not live listings. Bengaluru, Hyderabad and
          Pune pay at or slightly above these; smaller cities often 10–25% less. Strong DSA and system design is what moves you from the Product column to Top-tier.
        </div>
      </div>
    </div>
  );
}

function Segmented<K extends string>({ label, value, onChange, options }: {
  label: string; value: K; onChange: (k: K) => void;
  options: { key: K; label: string; sub?: string; title?: string }[];
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
      <span style={{ fontSize: '0.72rem', color: '#8b949e', width: '74px' }}>{label}</span>
      <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '2px', border: '1px solid #30363d', borderRadius: '8px', padding: '2px' }}>
        {options.map((o) => (
          <button key={o.key} type="button" onClick={() => onChange(o.key)} title={o.title}
            style={{
              border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '0.76rem', cursor: 'pointer',
              background: value === o.key ? 'rgba(88,166,255,0.15)' : 'transparent', color: value === o.key ? '#58a6ff' : '#c9d1d9',
              fontWeight: value === o.key ? 600 : 400,
            }}>
            {o.label}{o.sub && <span style={{ color: '#6e7681', fontWeight: 400 }}> · {o.sub}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
