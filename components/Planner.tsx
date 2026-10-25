'use client';

import { useEffect, useMemo, useState } from 'react';
import { COURSE } from '@/lib/course-syllabus';
import { getGuide } from '@/lib/study-guides';
import type { Roadmap } from '@/lib/salary-roadmap';
import type { StudyStats } from '@/lib/study-stats';
import type { ActivityEvent } from '@/app/api/activity/route';

const STORAGE_KEY = 'planner:v1';
const DAY = 24 * 60 * 60 * 1000;
const PACE_WINDOW_DAYS = 28;

interface Scope {
  key: string;
  label: string;
  total: number;
  done: number;
  valueRemaining: number; // ₹/yr of salary value still to unlock
}

interface Saved {
  scopes: string[];
  date: string;
}

const DEFAULT_SCOPES = ['course-dsa', 'course-lld', 'course-hld'];

// Which scope an activity event counts towards.
function scopeOf(e: ActivityEvent): string | null {
  if (e.kind === 'problem') return 'site-dsa';
  if (e.kind === 'theory') return 'site-theory';
  const id = e.id;
  if (id.startsWith('course:dsa/')) return 'course-dsa';
  if (id.startsWith('course:lld/')) return 'course-lld';
  if (id.startsWith('course:hld/')) return 'course-hld';
  if (id.startsWith('guide:stack-')) return 'guide-stack';
  const m = id.match(/^guide:([a-z]+)\//);
  return m ? `guide-${m[1]}` : null;
}

const toInput = (t: number) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const fromInput = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d, 23, 59, 59).getTime();
};
const fmtDate = (t: number) => new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const fmtRate = (n: number) => (n >= 10 ? Math.round(n).toString() : (Math.round(n * 10) / 10).toString());
function fmtRs(v: number) {
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L/yr`;
  if (v >= 1000) return `₹${Math.round(v / 1000)}k/yr`;
  return `₹${Math.round(v)}/yr`;
}

export default function Planner({
  now,
  checked,
  stats,
  roadmap,
  events,
  valueMap,
  loading,
}: {
  now: number;
  checked: Set<string>;
  stats: StudyStats;
  roadmap: Roadmap | null;
  events: ActivityEvent[] | null;
  valueMap: Map<string, number>;
  loading: boolean;
}) {
  const endOfYear = useMemo(() => new Date(new Date(now).getFullYear(), 11, 31).getTime(), [now]);
  const [selected, setSelected] = useState<string[]>(DEFAULT_SCOPES);
  const [date, setDate] = useState<string>(() => toInput(endOfYear));

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as Saved;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (Array.isArray(saved.scopes) && saved.scopes.length) setSelected(saved.scopes);
      if (typeof saved.date === 'string' && saved.date) setDate(saved.date);
    } catch {
      // ignore
    }
  }, []);

  function save(next: Partial<Saved>) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ scopes: next.scopes ?? selected, date: next.date ?? date }));
    } catch {
      // ignore
    }
  }

  const scopes: Scope[] = useMemo(() => {
    const out: Scope[] = [];
    const fromItems = (key: string, label: string, ids: string[]) => {
      const remaining = ids.filter((id) => !checked.has(id));
      out.push({
        key, label, total: ids.length, done: ids.length - remaining.length,
        valueRemaining: remaining.reduce((a, id) => a + (valueMap.get(id) ?? 0), 0),
      });
    };
    fromItems('course-dsa', 'DSA · course', COURSE.dsa.flatMap((s) => s.items.map((i) => i.id)));
    fromItems('course-lld', 'LLD · course', COURSE.lld.flatMap((s) => s.items.map((i) => i.id)));
    fromItems('course-hld', 'System Design · course', COURSE.hld.flatMap((s) => s.items.map((i) => i.id)));

    const siteTotal = stats.problemTopics.reduce((a, t) => a + t.total, 0);
    if (siteTotal) {
      out.push({
        key: 'site-dsa', label: 'DSA · site problems', total: siteTotal,
        done: stats.problemTopics.reduce((a, t) => a + t.solved, 0),
        valueRemaining: stats.problemTopics.reduce((a, t) => a + (t.total - t.solved) * (valueMap.get(`site:${t.key}`) ?? 0), 0),
      });
    }
    const theoryTotal = stats.theoryTopics.reduce((a, t) => a + t.total, 0);
    if (theoryTotal) {
      out.push({
        key: 'site-theory', label: 'Theory Q&A', total: theoryTotal,
        done: stats.theoryTopics.reduce((a, t) => a + t.solved, 0),
        valueRemaining: stats.theoryTopics.reduce((a, t) => a + (t.total - t.solved) * (valueMap.get(`theory:${t.key}`) ?? 0), 0),
      });
    }

    const guideTasks = (key: string, track?: Roadmap['track'], lang?: string | null) =>
      (getGuide(key, track, lang) ?? []).flatMap((m) => m.tasks.map((t) => t.id));
    fromItems('guide-stack', 'Stack depth', guideTasks('stack-depth', roadmap?.track ?? 'general', roadmap?.language ?? null));
    fromItems('guide-cloud', 'Cloud & DevOps', guideTasks('cloud'));
    fromItems('guide-ai', 'AI / LLM', guideTasks('ai'));
    fromItems('guide-proof', 'Projects & profile', guideTasks('proof'));
    fromItems('guide-negotiation', 'Negotiation', guideTasks('negotiation'));
    return out;
  }, [checked, stats, roadmap, valueMap]);

  const active = scopes.filter((s) => selected.includes(s.key));
  const total = active.reduce((a, s) => a + s.total, 0);
  const done = active.reduce((a, s) => a + s.done, 0);
  const remaining = total - done;
  const valueRemaining = active.reduce((a, s) => a + s.valueRemaining, 0);
  const valuePerItem = remaining > 0 ? valueRemaining / remaining : 0;

  // Pace = completions in the selected scopes over the last 4 weeks (or since
  // the first completion, if that's more recent — but at least one week).
  const pace = useMemo(() => {
    const relevant = (events ?? []).filter((e) => {
      const s = scopeOf(e);
      return s !== null && selected.includes(s);
    });
    if (!relevant.length) return { perWeek: 0, windowDays: PACE_WINDOW_DAYS };
    const first = Math.min(...relevant.map((e) => e.at));
    const windowDays = Math.max(7, Math.min(PACE_WINDOW_DAYS, Math.ceil((now - first) / DAY)));
    const since = now - windowDays * DAY;
    const count = relevant.filter((e) => e.at >= since).length;
    return { perWeek: (count / windowDays) * 7, windowDays };
  }, [events, selected, now]);

  const target = fromInput(date);
  const daysLeft = Math.max(0, (target - now) / DAY);
  const weeksLeft = daysLeft / 7;
  const needPerWeek = weeksLeft > 0 ? remaining / weeksLeft : Infinity;
  const needPerDay = daysLeft > 0 ? remaining / daysLeft : Infinity;
  const projectedMore = Math.min(remaining, Math.floor(pace.perWeek * weeksLeft));
  const projectedPct = total ? ((done + projectedMore) / total) * 100 : 0;
  const finishAt = pace.perWeek > 0 ? now + (remaining / pace.perWeek) * 7 * DAY : null;
  const onTrack = remaining === 0 || pace.perWeek >= needPerWeek;
  const gap = Math.max(0, needPerWeek - pace.perWeek);

  const presets: { label: string; t: number }[] = [
    { label: 'End of month', t: new Date(new Date(now).getFullYear(), new Date(now).getMonth() + 1, 0).getTime() },
    { label: '+3 months', t: now + 91 * DAY },
    { label: 'End of year', t: endOfYear },
    { label: '+6 months', t: now + 182 * DAY },
  ];

  const card: React.CSSProperties = { background: '#161b22', border: '1px solid #30363d', borderRadius: '12px', padding: '1rem 1.1rem' };
  const label: React.CSSProperties = { fontSize: '0.68rem', color: '#8b949e', letterSpacing: '0.06em', textTransform: 'uppercase' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Inputs */}
      <div style={card}>
        <div style={label}>What counts as everything</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
          {scopes.filter((s) => s.total > 0).map((s) => {
            const on = selected.includes(s.key);
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => {
                  const next = on ? selected.filter((k) => k !== s.key) : [...selected, s.key];
                  setSelected(next);
                  save({ scopes: next });
                }}
                style={{
                  padding: '4px 11px', borderRadius: '999px', fontSize: '0.75rem', cursor: 'pointer',
                  border: `1px solid ${on ? '#58a6ff' : '#30363d'}`, background: on ? 'rgba(88,166,255,0.12)' : 'transparent',
                  color: on ? '#e6edf3' : '#8b949e',
                }}
              >
                {s.label} <span style={{ color: '#6e7681' }}>{s.done}/{s.total}</span>
              </button>
            );
          })}
        </div>

        <div style={{ ...label, marginTop: '1rem' }}>Finish by</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem' }}>
          <input
            type="date"
            value={date}
            min={toInput(now)}
            onChange={(e) => {
              if (!e.target.value) return;
              setDate(e.target.value);
              save({ date: e.target.value });
            }}
            style={{
              padding: '0.4rem 0.6rem', borderRadius: '8px', border: '1px solid #30363d', background: '#0d1117',
              color: '#e6edf3', fontSize: '0.85rem', colorScheme: 'dark',
            }}
          />
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                const v = toInput(p.t);
                setDate(v);
                save({ date: v });
              }}
              style={{
                padding: '4px 10px', borderRadius: '6px', fontSize: '0.72rem', cursor: 'pointer',
                border: '1px solid #30363d', background: date === toInput(p.t) ? '#30363d' : 'transparent', color: '#c9d1d9',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {active.length === 0 ? (
        <p style={{ color: '#8b949e', fontSize: '0.85rem', textAlign: 'center' }}>Pick at least one area above.</p>
      ) : (
        <>
          {/* Required pace */}
          <div style={{ ...card, borderColor: onTrack ? 'rgba(63,185,80,0.4)' : 'rgba(210,153,34,0.45)' }}>
            <div style={label}>To finish by {fmtDate(target)}</div>
            {remaining === 0 ? (
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#3fb950', marginTop: '0.4rem' }}>Everything selected is done ✓</div>
            ) : daysLeft < 1 ? (
              <div style={{ fontSize: '1rem', color: '#f85149', marginTop: '0.4rem' }}>Pick a date in the future.</div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                  <div>
                    <span style={{ fontSize: '2rem', fontWeight: 800, color: '#e6edf3' }}>{fmtRate(needPerWeek)}</span>
                    <span style={{ fontSize: '0.85rem', color: '#8b949e' }}> / week</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#c9d1d9' }}>
                    ≈ {fmtRate(needPerDay)} / day · {remaining} left · {Math.ceil(weeksLeft)} weeks
                  </div>
                </div>
                <div style={{ fontSize: '0.82rem', marginTop: '0.4rem', color: onTrack ? '#3fb950' : '#d29922' }}>
                  {loading && !events
                    ? 'Loading your pace…'
                    : onTrack
                      ? `✓ On track. Your pace is ${fmtRate(pace.perWeek)}/week.`
                      : pace.perWeek > 0
                        ? `▲ You're at ${fmtRate(pace.perWeek)}/week. Do ${fmtRate(gap)} more a week to make it.`
                        : '▲ No completions in these areas yet. Start this week.'}
                </div>

                {/* Per-area split */}
                <div style={{ marginTop: '0.9rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {active.filter((s) => s.total - s.done > 0).map((s) => {
                    const left = s.total - s.done;
                    return (
                      <div key={s.key} style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 1fr) 2fr auto', alignItems: 'center', gap: '0.7rem' }}>
                        <span style={{ fontSize: '0.78rem', color: '#c9d1d9' }}>{s.label}</span>
                        <div style={{ height: '6px', borderRadius: '3px', background: '#21262d', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${(s.done / s.total) * 100}%`, background: '#26a641' }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#8b949e', whiteSpace: 'nowrap', minWidth: '120px', textAlign: 'right' }}>
                          {left} left · <span style={{ color: '#e6edf3' }}>{fmtRate(left / weeksLeft)}/wk</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Projection at current pace */}
          {remaining > 0 && daysLeft >= 1 && (
            <div style={card}>
              <div style={label}>At your current pace</div>
              {pace.perWeek === 0 ? (
                <p style={{ fontSize: '0.85rem', color: '#8b949e', margin: '0.4rem 0 0' }}>
                  Tick a few items and come back. Pace is measured over your last {PACE_WINDOW_DAYS} days.
                </p>
              ) : (
                <>
                  <div style={{ fontSize: '0.95rem', color: '#e6edf3', marginTop: '0.4rem', lineHeight: 1.6 }}>
                    By <strong>{fmtDate(target)}</strong> you&apos;ll finish <strong>{projectedMore}</strong> more
                    ({Math.round(projectedPct)}% of everything selected)
                    {valuePerItem > 0 && <>, unlocking about <strong style={{ color: '#3fb950' }}>{fmtRs(projectedMore * valuePerItem)}</strong> of salary value</>}.
                  </div>
                  <div style={{ height: '8px', borderRadius: '4px', background: '#21262d', overflow: 'hidden', margin: '0.7rem 0 0.3rem', display: 'flex', gap: '2px' }}>
                    <div style={{ width: `${(done / total) * 100}%`, background: '#26a641' }} title={`Done: ${done}`} />
                    <div style={{ width: `${(projectedMore / total) * 100}%`, background: '#0e4429' }} title={`Projected: +${projectedMore}`} />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.7rem', color: '#8b949e' }}>
                    <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: '#26a641', marginRight: 4 }} />Done {done}</span>
                    <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: '#0e4429', marginRight: 4 }} />By {fmtDate(target)} +{projectedMore}</span>
                    <span style={{ marginLeft: 'auto' }}>of {total}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#c9d1d9', marginTop: '0.8rem' }}>
                    Everything selected done on <strong style={{ color: '#e6edf3' }}>{finishAt ? fmtDate(finishAt) : '—'}</strong>
                    <span style={{ color: '#6e7681' }}> · {fmtRate(pace.perWeek)}/week over the last {pace.windowDays} days</span>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
