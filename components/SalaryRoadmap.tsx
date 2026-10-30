'use client';

import { useContext, useEffect, useMemo, useState } from 'react';
import SiteNav from '@/components/SiteNav';
import { NoteButton, NotesCtx, useNoteHost } from '@/components/Notes';
import type { Roadmap, RoadmapInput, RoadmapLever } from '@/lib/salary-roadmap';
import type { StudyStats } from '@/lib/study-stats';
import { backLever, unlockedLpa, BackedRow, DsaSource, LeverBacking } from '@/lib/roadmap-backing';
import { COURSE_NAME } from '@/lib/course-syllabus';
import { useChecklist } from '@/lib/use-checklist';

const STORAGE_KEY = 'salary-roadmap:v1';
const DSA_SOURCE_KEY = 'salary-roadmap:dsa-source';

const LEVER_COLORS = ['#58a6ff', '#3fb950', '#d29922', '#bc8cff', '#f778ba', '#39c5cf', '#ff7b72', '#a5d6ff', '#7ee787'];
const BASELINE_COLOR = '#484f58';

const VERDICT_STYLE: Record<Roadmap['verdict'], { label: string; color: string; bg: string }> = {
  'on-track': { label: 'Realistic', color: '#3fb950', bg: 'rgba(63,185,80,0.08)' },
  stretch: { label: 'Stretch goal', color: '#d29922', bg: 'rgba(210,153,34,0.08)' },
  'multi-hop': { label: 'Needs more than one switch', color: '#f0883e', bg: 'rgba(240,136,62,0.08)' },
  'above-market': { label: 'Above market', color: '#bc8cff', bg: 'rgba(188,140,255,0.08)' },
};

const KIND_ICON: Record<string, string> = { reading: '📄', quiz: '❓', video: '🎬', test: '🧪' };

function lpa(n: number) {
  const r = Math.round(n * 10) / 10;
  return `₹${Number.isInteger(r) ? r : r.toFixed(1)} LPA`;
}

// Like lpa(), but amounts under 1 LPA read as "₹45k/yr" instead of "₹0.5 LPA".
function money(n: number) {
  if (n >= 1 || n <= 0) return lpa(n);
  return `₹${Math.max(1, Math.round(n * 100))}k/yr`;
}

function rupeesPerYear(lpaValue: number) {
  return `₹${Math.round(lpaValue * 100000).toLocaleString('en-IN')}/yr`;
}

interface Saved {
  input: RoadmapInput;
  roadmap: Roadmap | null;
}

function loadSaved(): Saved | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

function persist(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode / blocked storage — the page still works, it just won't remember.
  }
}

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '0.55rem 0.7rem', borderRadius: '8px',
  border: '1px solid #30363d', background: '#0d1117', color: '#e6edf3', fontSize: '0.9rem',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.68rem', color: '#8b949e', letterSpacing: '0.06em',
  textTransform: 'uppercase', marginBottom: '6px',
};

const cardStyle: React.CSSProperties = {
  background: '#161b22', border: '1px solid #30363d', borderRadius: '12px', padding: '1.25rem',
};

export default function SalaryRoadmap({ signedIn, stats }: { signedIn: boolean; stats: StudyStats }) {
  const [currentCtc, setCurrentCtc] = useState('4');
  const [yoe, setYoe] = useState('2');
  const [stack, setStack] = useState('');
  const [targetCtc, setTargetCtc] = useState('20');
  const [hoursPerWeek, setHoursPerWeek] = useState('12');
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [dsaSource, setDsaSource] = useState<DsaSource>('site');
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiAvailable, setAiAvailable] = useState(true);
  const { checked, toggle, setMany } = useChecklist(signedIn);
  const noteHost = useNoteHost(signedIn);

  useEffect(() => {
    // Restoring browser-only state after mount avoids a hydration mismatch.
    try {
      const src = localStorage.getItem(DSA_SOURCE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (src === '"course"' || src === '"site"') setDsaSource(JSON.parse(src));
    } catch {
      // ignore
    }
    const saved = loadSaved();
    if (!saved) return;
    setCurrentCtc(String(saved.input.currentCtc));
    setYoe(String(saved.input.yoe));
    setStack(saved.input.stack);
    setTargetCtc(String(saved.input.targetCtc));
    setHoursPerWeek(String(saved.input.hoursPerWeek));
    setRoadmap(saved.roadmap);
    if (saved.roadmap?.levers[0]) setOpen(new Set([saved.roadmap.levers[0].key]));
  }, []);

  const input: RoadmapInput = {
    currentCtc: Number(currentCtc),
    yoe: Number(yoe),
    stack: stack.trim(),
    targetCtc: Number(targetCtc),
    hoursPerWeek: Number(hoursPerWeek),
  };

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error || 'Could not build the roadmap. Try again.');
        return;
      }
      const next = body.roadmap as Roadmap;
      setAiAvailable(!!body.aiAvailable);
      setRoadmap(next);
      setOpen(new Set(next.levers[0] ? [next.levers[0].key] : []));
      persist(STORAGE_KEY, { input, roadmap: next });
    } catch {
      setError('Could not reach the server. Check your connection.');
    } finally {
      setLoading(false);
    }
  }

  function changeDsaSource(src: DsaSource) {
    setDsaSource(src);
    persist(DSA_SOURCE_KEY, src);
  }

  function toggleOpen(key: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const backings = useMemo(() => {
    const m = new Map<string, LeverBacking | null>();
    if (!roadmap) return m;
    for (const l of roadmap.levers) m.set(l.key, backLever(l, { roadmap, dsaSource, stats, checked }));
    return m;
  }, [roadmap, dsaSource, stats, checked]);

  const studyLevers = roadmap?.levers.filter((l) => l.key !== 'baseline') ?? [];
  const studyTotal = studyLevers.reduce((a, l) => a + l.lpa, 0);
  const unlocked = studyLevers.reduce((a, l) => a + unlockedLpa(backings.get(l.key)?.rows ?? []), 0);
  const totalHours = studyLevers.reduce((a, l) => a + l.hours, 0);

  return (
    <NotesCtx.Provider value={noteHost.value}>
    <div style={{ minHeight: '100vh', background: '#0d1117', padding: '2rem 1rem 4rem' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <SiteNav />

        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#e6edf3', margin: 0 }}>💸 Salary Roadmap</h1>
          <p style={{ color: '#8b949e', fontSize: '0.85rem', margin: '6px 0 0' }}>
            Enter where you are and where you want to be. Every topic below shows how much of the hike it&apos;s worth.
          </p>
        </div>

        {/* Inputs */}
        <form onSubmit={generate} style={{ ...cardStyle, display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
          <div>
            <label style={labelStyle} htmlFor="ctc">Current CTC (LPA)</label>
            <input id="ctc" style={inputStyle} type="number" min={0} step={0.5} required value={currentCtc} onChange={(e) => setCurrentCtc(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle} htmlFor="yoe">Experience (years)</label>
            <input id="yoe" style={inputStyle} type="number" min={0} max={40} step={0.5} required value={yoe} onChange={(e) => setYoe(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle} htmlFor="target">Target CTC (LPA)</label>
            <input id="target" style={inputStyle} type="number" min={1} step={0.5} required value={targetCtc} onChange={(e) => setTargetCtc(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle} htmlFor="hours">Study hours / week</label>
            <input id="hours" style={inputStyle} type="number" min={1} max={80} required value={hoursPerWeek} onChange={(e) => setHoursPerWeek(e.target.value)} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle} htmlFor="stack">Tech stack</label>
            <input id="stack" style={inputStyle} placeholder="e.g. Java, Spring Boot, MySQL, AWS" value={stack} onChange={(e) => setStack(e.target.value)} />
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.55rem 1.25rem', borderRadius: '8px', border: 'none', background: '#238636',
                color: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: loading ? 'wait' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (signedIn && aiAvailable ? 'Tailoring your roadmap…' : 'Building…') : roadmap ? 'Rebuild roadmap' : 'Build my roadmap'}
            </button>
            {!signedIn && (
              <span style={{ fontSize: '0.75rem', color: '#8b949e' }}>
                <a href="/login" style={{ color: '#58a6ff' }}>Log in</a> to sync progress and get an AI-tailored roadmap.
              </span>
            )}
            {error && <span style={{ fontSize: '0.78rem', color: '#f85149' }}>{error}</span>}
          </div>
        </form>

        {roadmap && (
          <>
            {/* Verdict */}
            <div style={{ ...cardStyle, background: VERDICT_STYLE[roadmap.verdict].bg, borderColor: VERDICT_STYLE[roadmap.verdict].color + '55' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: VERDICT_STYLE[roadmap.verdict].color }}>
                  {VERDICT_STYLE[roadmap.verdict].label}
                </span>
                <span style={{ fontSize: '0.68rem', color: '#8b949e', border: '1px solid #30363d', borderRadius: '999px', padding: '2px 8px' }}>
                  {roadmap.source === 'ai' ? '✨ AI-tailored' : 'Market model'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', margin: '0.6rem 0', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '1.6rem', fontWeight: 700, color: '#8b949e' }}>{lpa(roadmap.currentCtc)}</span>
                <span style={{ color: '#8b949e' }}>→</span>
                <span style={{ fontSize: '1.9rem', fontWeight: 800, color: '#e6edf3' }}>{lpa(roadmap.reachableCtc)}</span>
                {roadmap.reachableCtc < roadmap.targetCtc && (
                  <span style={{ fontSize: '0.85rem', color: '#8b949e' }}>(goal {lpa(roadmap.targetCtc)})</span>
                )}
              </div>
              <p style={{ color: '#c9d1d9', fontSize: '0.88rem', margin: 0, lineHeight: 1.5 }}>{roadmap.headline}</p>
              <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.9rem', flexWrap: 'wrap', fontSize: '0.78rem', color: '#8b949e' }}>
                <span>⏱ ~{roadmap.months} months at {hoursPerWeek} h/week</span>
                <span>📚 {totalHours} study hours</span>
                <span>📊 Band at {yoe} YOE: {lpa(roadmap.marketCeiling)} typical · {lpa(roadmap.stretchCeiling)} top-tier</span>
              </div>
            </div>

            {roadmap.warnings.length > 0 && (
              <div style={{ ...cardStyle, padding: '0.9rem 1.1rem', borderColor: 'rgba(210,153,34,0.4)' }}>
                {roadmap.warnings.map((w, i) => (
                  <p key={i} style={{ margin: i ? '0.5rem 0 0' : 0, fontSize: '0.82rem', color: '#d29922', lineHeight: 1.5 }}>⚠ {w}</p>
                ))}
              </div>
            )}

            {/* Money bar */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e6edf3' }}>
                  Where the +{lpa(roadmap.reachableCtc - roadmap.currentCtc)} comes from
                </span>
                <span style={{ fontSize: '0.8rem', color: '#3fb950', fontWeight: 600 }}>
                  {lpa(unlocked)} of {lpa(studyTotal)} unlocked by study
                </span>
              </div>
              <div style={{ display: 'flex', height: '14px', borderRadius: '7px', overflow: 'hidden', gap: '2px', background: '#0d1117' }}>
                {roadmap.levers.map((l, i) => (
                  <div
                    key={l.key}
                    title={`${l.name}: +${lpa(l.lpa)}`}
                    style={{ flex: l.lpa, background: l.key === 'baseline' ? BASELINE_COLOR : LEVER_COLORS[i % LEVER_COLORS.length] }}
                  />
                ))}
              </div>
              <div style={{ height: '4px', marginTop: '6px', borderRadius: '2px', background: '#21262d' }}>
                <div style={{ height: '100%', width: `${studyTotal ? Math.min(100, (unlocked / studyTotal) * 100) : 0}%`, background: '#3fb950', borderRadius: '2px', transition: 'width 0.3s' }} />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem 1rem', marginTop: '0.8rem' }}>
                {roadmap.levers.map((l, i) => (
                  <span key={l.key} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#c9d1d9' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: l.key === 'baseline' ? BASELINE_COLOR : LEVER_COLORS[i % LEVER_COLORS.length] }} />
                    {l.name} <strong style={{ color: '#e6edf3' }}>+{lpa(l.lpa)}</strong>
                  </span>
                ))}
              </div>
            </div>

            {/* Levers */}
            {roadmap.levers.map((l, i) => (
              <LeverCard
                key={l.key}
                lever={l}
                backing={backings.get(l.key) ?? null}
                rank={l.key === 'baseline' ? null : i + 1}
                color={l.key === 'baseline' ? BASELINE_COLOR : LEVER_COLORS[i % LEVER_COLORS.length]}
                open={open.has(l.key)}
                onToggleOpen={() => toggleOpen(l.key)}
                checked={checked}
                onToggle={toggle}
                onSetMany={setMany}
                dsaSource={l.key === 'dsa' ? dsaSource : undefined}
                onDsaSource={changeDsaSource}
              />
            ))}

            {/* Hops */}
            {roadmap.hops.length > 1 && (
              <div style={cardStyle}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e6edf3', marginBottom: '0.75rem' }}>Path to {lpa(roadmap.targetCtc)}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <HopRow ctc={roadmap.currentCtc} when="Now" note="Where you are today" muted />
                  {roadmap.hops.map((h, i) => <HopRow key={i} ctc={h.ctc} when={h.when} note={h.note} />)}
                </div>
              </div>
            )}

            <p style={{ fontSize: '0.72rem', color: '#6e7681', margin: 0, lineHeight: 1.5 }}>
              These are estimates based on Indian market bands for product companies. Actual offers depend on the company,
              your interview performance and timing. The figures show how much each topic is worth relative to the others.
              They are not guarantees.
            </p>
          </>
        )}
      </div>
      {noteHost.modal}
    </div>
    </NotesCtx.Provider>
  );
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ height: '4px', borderRadius: '2px', background: '#21262d', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.min(100, value * 100)}%`, background: color, transition: 'width 0.3s' }} />
    </div>
  );
}

function LeverCard({
  lever, backing, rank, color, open, onToggleOpen, checked, onToggle, onSetMany, dsaSource, onDsaSource,
}: {
  lever: RoadmapLever;
  backing: LeverBacking | null;
  rank: number | null;
  color: string;
  open: boolean;
  onToggleOpen: () => void;
  checked: Set<string>;
  onToggle: (id: string) => void;
  onSetMany: (ids: string[], value: boolean) => void;
  dsaSource?: DsaSource;
  onDsaSource: (src: DsaSource) => void;
}) {
  const [openRows, setOpenRows] = useState<Set<string>>(new Set());
  const isBaseline = lever.key === 'baseline';
  const rows = backing?.rows ?? [];
  const leverUnlocked = unlockedLpa(rows);
  const done = rows.reduce((a, r) => a + r.done, 0);
  const total = rows.reduce((a, r) => a + r.total, 0);
  const rate = lever.hours > 0 ? Math.round((lever.lpa * 100000) / lever.hours) : null;

  function toggleRow(id: string) {
    setOpenRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div style={{ ...cardStyle, padding: 0, borderLeft: `3px solid ${color}`, opacity: isBaseline ? 0.75 : 1 }}>
      <button
        onClick={onToggleOpen}
        disabled={isBaseline}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '0.9rem', padding: '1rem 1.1rem',
          background: 'none', border: 'none', cursor: isBaseline ? 'default' : 'pointer', textAlign: 'left',
        }}
      >
        <div style={{ minWidth: '84px' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color }}>+{lpa(lever.lpa).replace(' LPA', '')}</div>
          <div style={{ fontSize: '0.65rem', color: '#8b949e', letterSpacing: '0.06em' }}>LPA</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e6edf3' }}>
            {rank !== null && <span style={{ color: '#6e7681', marginRight: '6px' }}>#{rank}</span>}
            {lever.name}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#8b949e', marginTop: '3px', display: 'flex', gap: '0.9rem', flexWrap: 'wrap' }}>
            {lever.hours > 0 && <span>{lever.hours} h</span>}
            {rate !== null && <span>≈ ₹{rate.toLocaleString('en-IN')}/yr per hour studied</span>}
            {total > 0 && <span>{done}/{total} done</span>}
            {leverUnlocked > 0 && <span style={{ color: '#3fb950' }}>✓ {money(leverUnlocked)} unlocked</span>}
          </div>
          {total > 0 && <div style={{ marginTop: '6px' }}><ProgressBar value={done / total} color={color} /></div>}
        </div>
        {!isBaseline && <span style={{ color: '#8b949e', fontSize: '0.8rem' }}>{open ? '▴' : '▾'}</span>}
      </button>

      {(open || isBaseline) && (
        <div style={{ padding: '0 1.1rem 1.1rem' }}>
          <p style={{ fontSize: '0.82rem', color: '#c9d1d9', lineHeight: 1.55, margin: '0 0 0.8rem' }}>{lever.why}</p>

          {dsaSource && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', color: '#8b949e' }}>Track DSA with:</span>
              {(['site', 'course'] as const).map((src) => (
                <button
                  key={src}
                  onClick={() => onDsaSource(src)}
                  style={{
                    padding: '3px 10px', borderRadius: '999px', fontSize: '0.74rem', cursor: 'pointer',
                    border: `1px solid ${dsaSource === src ? color : '#30363d'}`,
                    background: dsaSource === src ? color + '22' : 'transparent',
                    color: dsaSource === src ? '#e6edf3' : '#8b949e',
                  }}
                >
                  {src === 'site' ? 'This site’s problems' : `My course (${COURSE_NAME})`}
                </button>
              ))}
            </div>
          )}

          {backing && backing.kind !== 'subtopics' && !dsaSource && (
            <div style={{ fontSize: '0.7rem', color: '#8b949e', marginBottom: '0.5rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {backing.kind === 'course' ? `Tracked from ${COURSE_NAME}` : backing.label}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {rows.map((row, idx) => {
              // Group headers for course sections ("Basic Case Studies", ...).
              const header = row.group && row.group !== rows[idx - 1]?.group && row.group !== 'DSA' ? row.group : null;
              return (
                <div key={row.id}>
                  {header && (
                    <div style={{ fontSize: '0.68rem', color: '#6e7681', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0.7rem 0 0.25rem 0.55rem' }}>
                      {header}
                    </div>
                  )}
                  <BackedRowView
                    row={row}
                    context={lever.name}
                    color={color}
                    open={openRows.has(row.id)}
                    onToggleOpen={() => toggleRow(row.id)}
                    checked={checked}
                    onToggle={onToggle}
                    onSetMany={onSetMany}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function BackedRowView({
  row, context, color, open, onToggleOpen, checked, onToggle, onSetMany,
}: {
  row: BackedRow;
  context: string;
  color: string;
  open: boolean;
  onToggleOpen: () => void;
  checked: Set<string>;
  onToggle: (id: string) => void;
  onSetMany: (ids: string[], value: boolean) => void;
}) {
  const notesCtx = useContext(NotesCtx);
  const complete = row.total > 0 && row.done >= row.total;
  const perItem = row.total > 0 ? row.lpa / row.total : 0;

  // A single-item row (plain checklist) is just a checkbox, no expansion.
  if (row.items && row.items.length === 1 && !row.module) {
    const item = row.items[0];
    const isChecked = checked.has(item.id);
    return (
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.45rem 0.55rem', borderRadius: '6px', cursor: 'pointer', background: isChecked ? 'rgba(63,185,80,0.06)' : 'transparent' }}>
        <input type="checkbox" checked={isChecked} onChange={() => onToggle(item.id)} style={{ accentColor: '#3fb950' }} />
        <span style={{ flex: 1, fontSize: '0.82rem', color: isChecked ? '#8b949e' : '#e6edf3', textDecoration: isChecked ? 'line-through' : 'none' }}>
          {row.title}
          {row.href && <a href={row.href} style={{ marginLeft: '8px', fontSize: '0.72rem', color: '#58a6ff', textDecoration: 'none' }}>open →</a>}
        </span>
        <NoteButton
          note={notesCtx.notes[item.id]}
          onClick={() => notesCtx.open({ id: item.id, title: row.title, context })}
          onView={() => notesCtx.open({ id: item.id, title: row.title, context, mode: 'view' })}
        />
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isChecked ? '#3fb950' : color, whiteSpace: 'nowrap' }}>+{money(row.lpa)}</span>
      </label>
    );
  }

  const expandable = !!row.items || !!row.module;
  const rowHeader = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
      <span style={{ width: '14px', fontSize: '0.75rem', color: complete ? '#3fb950' : '#8b949e' }}>
        {complete ? '✓' : expandable ? (open ? '▾' : '▸') : '•'}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.84rem', color: complete ? '#8b949e' : '#e6edf3' }}>{row.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '4px' }}>
          <div style={{ flex: 1, maxWidth: '180px' }}><ProgressBar value={row.total ? row.done / row.total : 0} color={complete ? '#3fb950' : color} /></div>
          <span style={{ fontSize: '0.7rem', color: '#8b949e', whiteSpace: 'nowrap' }}>{row.done}/{row.total}</span>
          {perItem > 0 && <span style={{ fontSize: '0.7rem', color: '#6e7681', whiteSpace: 'nowrap' }}>{rupeesPerYear(perItem)} each</span>}
        </div>
      </div>
      {row.href && (
        <a href={row.href} onClick={(e) => e.stopPropagation()} style={{ fontSize: '0.72rem', color: '#58a6ff', textDecoration: 'none', whiteSpace: 'nowrap' }}>
          open →
        </a>
      )}
      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: complete ? '#3fb950' : color, whiteSpace: 'nowrap', minWidth: '78px', textAlign: 'right' }}>
        +{money(row.lpa)}
      </span>
    </div>
  );

  return (
    <div style={{ borderRadius: '6px', background: open ? 'rgba(110,118,129,0.06)' : 'transparent' }}>
      {expandable ? (
        <button onClick={onToggleOpen} style={{ width: '100%', padding: '0.5rem 0.55rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
          {rowHeader}
        </button>
      ) : (
        <div style={{ padding: '0.5rem 0.55rem' }}>{rowHeader}</div>
      )}

      {open && expandable && (
        <div style={{ padding: '0 0.55rem 0.7rem 2.2rem' }}>
          {row.module && row.module.points.length > 0 && (
            <div style={{ marginBottom: '0.7rem' }}>
              <div style={{ fontSize: '0.68rem', color: '#8b949e', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>Key concepts</div>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {row.module.points.map((p, i) => (
                  <li key={i} style={{ fontSize: '0.8rem', color: '#c9d1d9', lineHeight: 1.5 }}>{p}</li>
                ))}
              </ul>
            </div>
          )}

          {row.items && row.items.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                <span style={{ fontSize: '0.68rem', color: '#8b949e', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {row.module ? 'Do this' : 'Lessons'}
                </span>
                <button
                  onClick={() => onSetMany(row.items!.map((it) => it.id), !complete)}
                  style={{ background: 'none', border: 'none', color: '#58a6ff', fontSize: '0.7rem', cursor: 'pointer' }}
                >
                  {complete ? 'Clear all' : 'Mark all done'}
                </button>
              </div>
              {row.items.map((it) => {
                const isChecked = checked.has(it.id);
                return (
                  <label key={it.id} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', padding: '0.28rem 0', cursor: 'pointer' }}>
                    <input type="checkbox" checked={isChecked} onChange={() => onToggle(it.id)} style={{ accentColor: '#3fb950' }} />
                    {it.kind && <span style={{ fontSize: '0.72rem' }} title={it.kind}>{KIND_ICON[it.kind]}</span>}
                    <span style={{ flex: 1, fontSize: '0.8rem', color: isChecked ? '#8b949e' : '#e6edf3', textDecoration: isChecked ? 'line-through' : 'none' }}>
                      {it.title}
                    </span>
                    <NoteButton
                      note={notesCtx.notes[it.id]}
                      onClick={() => notesCtx.open({ id: it.id, title: it.title, context: `${context} · ${row.title}` })}
                      onView={() => notesCtx.open({ id: it.id, title: it.title, context: `${context} · ${row.title}`, mode: 'view' })}
                    />
                    <span style={{ fontSize: '0.7rem', color: isChecked ? '#3fb950' : '#6e7681', whiteSpace: 'nowrap', minWidth: '78px', textAlign: 'right' }}>+{rupeesPerYear(perItem)}</span>
                  </label>
                );
              })}
            </div>
          )}

          {row.module && row.module.resources.length > 0 && (
            <div style={{ marginTop: '0.7rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {row.module.resources.map((r) => (
                <a
                  key={r.url}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.72rem', color: '#58a6ff', textDecoration: 'none', border: '1px solid #30363d', borderRadius: '999px', padding: '2px 9px' }}
                >
                  {r.label} ↗
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function HopRow({ ctc, when, note, muted }: { ctc: number; when: string; note: string; muted?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: muted ? '#484f58' : '#3fb950', flexShrink: 0 }} />
      <span style={{ minWidth: '92px', fontWeight: 700, color: muted ? '#8b949e' : '#e6edf3', fontSize: '0.9rem' }}>{lpa(ctc)}</span>
      <span style={{ minWidth: '84px', fontSize: '0.75rem', color: '#8b949e' }}>{when}</span>
      <span style={{ fontSize: '0.78rem', color: '#c9d1d9' }}>{note}</span>
    </div>
  );
}
