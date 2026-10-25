'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ActivityEvent } from '@/app/api/activity/route';

export interface ResolvedEvent extends ActivityEvent {
  title: string;
  context: string;
  salaryRs: number; // ₹/yr of salary value this unlocked, per the roadmap
}

type View = 'day' | 'week' | 'month' | 'year';
type Metric = 'count' | 'salary';

const VIEWS: { key: View; label: string }[] = [
  { key: 'day', label: 'Day' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
];

const METRICS: { key: Metric; label: string }[] = [
  { key: 'count', label: 'Items done' },
  { key: 'salary', label: 'Salary value' },
];

// Sequential single-hue ramp (empty → most), tuned for the dark surface.
const RAMP = ['#21262d', '#0e4429', '#006d32', '#26a641', '#39d353'];
const KIND_ICON: Record<ActivityEvent['kind'], string> = { problem: '💻', theory: '📖', item: '☑️' };
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const dayStart = (t: number | Date) => {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d;
};
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const weekStart = (d: Date) => addDays(dayStart(d), -((d.getDay() + 6) % 7)); // Monday
const ymd = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const ym = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;

function metricValue(e: ResolvedEvent, m: Metric) {
  return m === 'count' ? 1 : e.salaryRs;
}

function fmt(v: number, m: Metric) {
  if (m === 'count') return `${v}`;
  const suffix = '/yr';
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L${suffix}`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k${suffix}`;
  return `₹${Math.round(v)}${suffix}`;
}

function heat(v: number, max: number) {
  if (v <= 0 || max <= 0) return RAMP[0];
  const step = Math.min(4, Math.max(1, Math.ceil((v / max) * 4)));
  return RAMP[step];
}

export default function ActivityCalendar({
  events,
  loading,
  onOpen,
}: {
  events: ResolvedEvent[] | null;
  loading: boolean;
  onOpen: (e: ResolvedEvent) => void;
}) {
  const [view, setView] = useState<View>('week');
  const [metric, setMetric] = useState<Metric>('count');
  const [anchor, setAnchor] = useState<Date>(() => dayStart(Date.now()));
  const [hover, setHover] = useState<string | null>(null);
  const [today, setToday] = useState(() => dayStart(Date.now()));

  useEffect(() => {
    const t = setInterval(() => setToday(dayStart(Date.now())), 60_000);
    return () => clearInterval(t);
  }, []);

  const byDay = useMemo(() => {
    const m = new Map<string, ResolvedEvent[]>();
    for (const e of events ?? []) {
      const k = ymd(new Date(e.at));
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(e);
    }
    return m;
  }, [events]);

  const dayTotal = (d: Date) => (byDay.get(ymd(d)) ?? []).reduce((a, e) => a + metricValue(e, metric), 0);
  const monthTotal = (y: number, mo: number) =>
    (events ?? []).filter((e) => ym(new Date(e.at)) === `${y}-${mo}`).reduce((a, e) => a + metricValue(e, metric), 0);

  function shift(dir: -1 | 1) {
    const a = new Date(anchor);
    if (view === 'day') a.setDate(a.getDate() + dir);
    if (view === 'week') a.setDate(a.getDate() + 7 * dir);
    if (view === 'month') a.setMonth(a.getMonth() + dir, 1);
    if (view === 'year') a.setFullYear(a.getFullYear() + dir, 0, 1);
    setAnchor(dayStart(a));
    setHover(null);
  }

  function drill(to: View, d: Date) {
    setView(to);
    setAnchor(dayStart(d));
    setHover(null);
  }

  // Period label + total.
  let label = '';
  let total = 0;
  if (view === 'day') {
    label = anchor.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    total = dayTotal(anchor);
  } else if (view === 'week') {
    const s = weekStart(anchor);
    const e = addDays(s, 6);
    label = `${s.getDate()} ${MONTHS[s.getMonth()]} – ${e.getDate()} ${MONTHS[e.getMonth()]} ${e.getFullYear()}`;
    for (let i = 0; i < 7; i++) total += dayTotal(addDays(s, i));
  } else if (view === 'month') {
    label = `${MONTHS[anchor.getMonth()]} ${anchor.getFullYear()}`;
    total = monthTotal(anchor.getFullYear(), anchor.getMonth());
  } else {
    label = `${anchor.getFullYear()}`;
    for (let mo = 0; mo < 12; mo++) total += monthTotal(anchor.getFullYear(), mo);
  }

  const btn: React.CSSProperties = {
    background: 'none', border: '1px solid #30363d', borderRadius: '6px', color: '#c9d1d9',
    padding: '3px 9px', cursor: 'pointer', fontSize: '0.8rem',
  };

  return (
    <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '12px', padding: '1rem 1.1rem' }}>
      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.6rem', flexWrap: 'wrap' }}>
        <Segmented options={VIEWS} value={view} onChange={(v) => { setView(v); setHover(null); }} />
        <Segmented options={METRICS} value={metric} onChange={setMetric} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.9rem' }}>
        <button type="button" style={btn} onClick={() => shift(-1)} aria-label="Previous">‹</button>
        <button type="button" style={btn} onClick={() => shift(1)} aria-label="Next">›</button>
        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e6edf3', marginLeft: '0.25rem' }}>{label}</span>
        <button type="button" style={{ ...btn, marginLeft: 'auto', fontSize: '0.72rem' }} onClick={() => drill(view, today)}>Today</button>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '0.6rem 0 0.8rem' }}>
        <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#e6edf3' }}>{fmt(total, metric)}</span>
        <span style={{ fontSize: '0.75rem', color: '#8b949e' }}>
          {METRICS.find((m) => m.key === metric)!.label.toLowerCase()} this {view}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#8b949e', minHeight: '1em' }}>{hover}</span>
      </div>

      {loading && !events ? (
        <p style={{ color: '#8b949e', fontSize: '0.82rem' }}>Loading activity…</p>
      ) : view === 'day' ? (
        <DayList events={byDay.get(ymd(anchor)) ?? []} metric={metric} onOpen={onOpen} />
      ) : view === 'week' ? (
        <WeekBars start={weekStart(anchor)} today={today} value={dayTotal} metric={metric} onHover={setHover} onPick={(d) => drill('day', d)} />
      ) : view === 'month' ? (
        <MonthGrid anchor={anchor} today={today} value={dayTotal} metric={metric} onHover={setHover} onPick={(d) => drill('day', d)} />
      ) : (
        <YearGrid year={anchor.getFullYear()} value={monthTotal} metric={metric} onHover={setHover} onPick={(mo) => drill('month', new Date(anchor.getFullYear(), mo, 1))} />
      )}
    </div>
  );
}

function Segmented<T extends string>({ options, value, onChange }: { options: { key: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div style={{ display: 'inline-flex', border: '1px solid #30363d', borderRadius: '8px', overflow: 'hidden' }}>
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(o.key)}
          style={{
            padding: '4px 11px', fontSize: '0.75rem', cursor: 'pointer', border: 'none',
            background: value === o.key ? '#30363d' : 'transparent',
            color: value === o.key ? '#e6edf3' : '#8b949e',
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function DayList({ events, metric, onOpen }: { events: ResolvedEvent[]; metric: Metric; onOpen: (e: ResolvedEvent) => void }) {
  if (events.length === 0) {
    return <p style={{ color: '#8b949e', fontSize: '0.82rem', textAlign: 'center', padding: '1.5rem 0' }}>Nothing done this day.</p>;
  }
  const sorted = [...events].sort((a, b) => a.at - b.at);
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {sorted.map((e) => (
        <button
          key={`${e.kind}:${e.id}`}
          type="button"
          onClick={() => onOpen(e)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.5rem 0.4rem', background: 'none',
            border: 'none', borderBottom: '1px solid #21262d', cursor: 'pointer', textAlign: 'left', borderRadius: '6px',
          }}
          onMouseEnter={(ev) => (ev.currentTarget.style.background = 'rgba(110,118,129,0.08)')}
          onMouseLeave={(ev) => (ev.currentTarget.style.background = 'none')}
        >
          <span style={{ fontSize: '0.72rem', color: '#6e7681', minWidth: '42px' }}>
            {new Date(e.at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}
          </span>
          <span style={{ fontSize: '0.8rem' }}>{KIND_ICON[e.kind]}</span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: '0.84rem', color: '#e6edf3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</span>
            <span style={{ display: 'block', fontSize: '0.7rem', color: '#8b949e' }}>{e.context}</span>
          </span>
          {metric !== 'count' && (
            <span style={{ fontSize: '0.75rem', color: '#c9d1d9', whiteSpace: 'nowrap' }}>{fmt(metricValue(e, metric), metric)}</span>
          )}
          <span style={{ color: '#6e7681', fontSize: '0.75rem' }}>→</span>
        </button>
      ))}
    </div>
  );
}

interface GridProps {
  today: Date;
  value: (d: Date) => number;
  metric: Metric;
  onHover: (s: string | null) => void;
  onPick: (d: Date) => void;
}

function WeekBars({ start, today, value, metric, onHover, onPick }: GridProps & { start: Date }) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const values = days.map(value);
  const max = Math.max(...values, 0);
  const H = 140;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', alignItems: 'end' }} onMouseLeave={() => onHover(null)}>
      {days.map((d, i) => {
        const v = values[i];
        const h = max > 0 ? Math.max(v > 0 ? 4 : 0, (v / max) * H) : 0;
        const isToday = d.getTime() === today.getTime();
        return (
          <button
            key={i}
            type="button"
            onClick={() => onPick(d)}
            onMouseEnter={() => onHover(`${WEEKDAYS[i]} ${d.getDate()} ${MONTHS[d.getMonth()]}: ${fmt(v, metric)}`)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
          >
            <span style={{ fontSize: '0.68rem', color: v > 0 ? '#c9d1d9' : '#484f58', minHeight: '1em' }}>{v > 0 ? fmt(v, metric) : ''}</span>
            <div style={{ height: `${H}px`, width: '100%', display: 'flex', alignItems: 'flex-end', borderBottom: '1px solid #30363d' }}>
              <div style={{ width: '100%', height: `${h}px`, background: v > 0 ? '#26a641' : 'transparent', borderRadius: '4px 4px 0 0', transition: 'height 0.25s' }} />
            </div>
            <span style={{ fontSize: '0.7rem', color: isToday ? '#e6edf3' : '#8b949e', fontWeight: isToday ? 700 : 400 }}>{WEEKDAYS[i]}</span>
            <span style={{ fontSize: '0.65rem', color: '#6e7681', marginTop: '-4px' }}>{d.getDate()}</span>
          </button>
        );
      })}
    </div>
  );
}

function MonthGrid({ anchor, today, value, metric, onHover, onPick }: GridProps & { anchor: Date }) {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const lead = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => new Date(anchor.getFullYear(), anchor.getMonth(), i + 1));
  const values = days.map(value);
  const max = Math.max(...values, 0);
  return (
    <div onMouseLeave={() => onHover(null)}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
        {WEEKDAYS.map((w) => <span key={w} style={{ fontSize: '0.66rem', color: '#6e7681', textAlign: 'center' }}>{w}</span>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {Array.from({ length: lead }, (_, i) => <span key={`l${i}`} />)}
        {days.map((d, i) => {
          const v = values[i];
          const isToday = d.getTime() === today.getTime();
          const bg = heat(v, max);
          return (
            <button
              key={i}
              type="button"
              onClick={() => onPick(d)}
              onMouseEnter={() => onHover(`${d.getDate()} ${MONTHS[d.getMonth()]}: ${fmt(v, metric)}`)}
              style={{
                aspectRatio: '1', borderRadius: '6px', cursor: 'pointer', background: bg, padding: '4px',
                border: isToday ? '1px solid #e6edf3' : '1px solid transparent',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start',
              }}
            >
              <span style={{ fontSize: '0.68rem', color: v > 0 ? '#e6edf3' : '#8b949e' }}>{d.getDate()}</span>
              {v > 0 && <span style={{ fontSize: '0.62rem', color: '#e6edf3', alignSelf: 'flex-end' }}>{fmt(v, metric)}</span>}
            </button>
          );
        })}
      </div>
      <Legend />
    </div>
  );
}

function YearGrid({ year, value, metric, onHover, onPick }: { year: number; value: (y: number, mo: number) => number; metric: Metric; onHover: (s: string | null) => void; onPick: (mo: number) => void }) {
  const values = MONTHS.map((_, mo) => value(year, mo));
  const max = Math.max(...values, 0);
  return (
    <div onMouseLeave={() => onHover(null)}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: '6px' }}>
        {MONTHS.map((m, mo) => {
          const v = values[mo];
          return (
            <button
              key={m}
              type="button"
              onClick={() => onPick(mo)}
              onMouseEnter={() => onHover(`${m} ${year}: ${fmt(v, metric)}`)}
              style={{
                borderRadius: '8px', cursor: 'pointer', background: heat(v, max), border: '1px solid transparent',
                padding: '0.6rem', textAlign: 'left', minHeight: '64px',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: '0.75rem', color: v > 0 ? '#e6edf3' : '#8b949e' }}>{m}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: v > 0 ? '#e6edf3' : '#484f58' }}>{v > 0 ? fmt(v, metric) : '–'}</span>
            </button>
          );
        })}
      </div>
      <Legend />
    </div>
  );
}

function Legend() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '0.6rem', fontSize: '0.66rem', color: '#6e7681' }}>
      Less
      {RAMP.map((c) => <span key={c} style={{ width: '10px', height: '10px', borderRadius: '2px', background: c }} />)}
      More
    </div>
  );
}
