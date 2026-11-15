'use client';

// Focus sessions: opening the app greets you with "how long are you
// studying?", the app is usable for exactly that long (countdown in the
// corner), then a "time's up" screen locks it until you start another one.
// The session lives in localStorage, so reloads and other tabs share it.
// Each finished session is logged as a Study block in the Time tracker, so
// time studied per day shows here and on /time.

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { loadDays, readSession as read, recordSession, studyByDay, writeSession as write, type Session } from '@/lib/study-session';
import { formatDuration } from '@/lib/time-tracking';
import { parseDayKey } from '@/lib/journal';

const KEY = 'study-session:v1';
const HEARTBEAT_MS = 15_000;
/** '1' = the focus timer is switched off: the app never locks. */
const OFF_KEY = 'study-session:off';

function readOff(): boolean {
  try { return localStorage.getItem(OFF_KEY) === '1'; } catch { return false; }
}
function writeOff(off: boolean) {
  try { if (off) localStorage.setItem(OFF_KEY, '1'); else localStorage.removeItem(OFF_KEY); } catch { /* ignore */ }
}
const PRESETS = [5, 10, 15, 25, 45, 60, 90, 120];
/** An expired session still shows "time's up" for this long; after that you're greeted afresh. */
const SHOW_DONE_FOR = 60 * 60 * 1000;
/** Pages that never lock (signing in, admin). */
const OPEN_PATHS = ['/login', '/auth', '/admin'];

type Phase = 'checking' | 'pick' | 'running' | 'done';

/** When a session really stopped: its end, or soon after the last open tab was seen. */
function stoppedAt(s: Session): number {
  if (s.endedAt) return s.endedAt;
  return s.lastSeenAt ? Math.min(s.endsAt, s.lastSeenAt + HEARTBEAT_MS) : s.endsAt;
}

function phaseFor(s: Session | null, now: number): Phase {
  if (!s) return 'pick';
  if (s.endsAt > now) return 'running';
  return now - s.endsAt < SHOW_DONE_FOR ? 'done' : 'pick';
}

function fmt(ms: number): string {
  const secs = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = String(secs % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}

function greeting(now: number): string {
  const h = new Date(now).getHours();
  return h < 5 ? 'Up late' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export default function SessionGate() {
  const pathname = usePathname();
  const open = OPEN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const [session, setSession] = useState<Session | null>(null);
  const [phase, setPhase] = useState<Phase>('checking');
  const [now, setNow] = useState(0);
  const [off, setOff] = useState(false);

  // Load, and follow other tabs starting / ending sessions.
  useEffect(() => {
    const sync = () => {
      let s = read();
      const t = Date.now();
      // Expired while every tab was closed: pin when it really stopped, then log it.
      if (s && s.endsAt <= t && !s.endedAt) {
        s = { ...s, endedAt: stoppedAt(s) };
        write(s);
      }
      setSession(s);
      setNow(t);
      setPhase(phaseFor(s, t));
      setOff(readOff());
      if (s && s.endsAt <= t && !s.recorded) void recordSession(stoppedAt(s));
    };
    sync();
    const onStorage = (e: StorageEvent) => { if (e.key === KEY || e.key === OFF_KEY) sync(); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Tick while running; lock (and log the time) the moment it hits zero.
  useEffect(() => {
    if (phase !== 'running' || !session) return;
    let lastBeat = 0;
    const t = setInterval(() => {
      const n = Date.now();
      setNow(n);
      if (n >= session.endsAt) {
        // Read the stored copy: it has the latest heartbeat / extensions.
        const fin = { ...(read() ?? session), endedAt: session.endsAt };
        write(fin);
        setSession(fin);
        setPhase('done');
        void recordSession(session.endsAt);
        return;
      }
      // Heartbeat, so a session whose tabs all closed is only billed while open.
      if (n - lastBeat >= HEARTBEAT_MS) {
        lastBeat = n;
        const cur = read();
        if (cur && cur.startedAt === session.startedAt) write({ ...cur, lastSeenAt: n });
      }
    }, 500);
    return () => clearInterval(t);
  }, [phase, session]);

  const start = useCallback((minutes: number) => {
    const t = Date.now();
    const s: Session = { startedAt: t, endsAt: t + minutes * 60_000, minutes, lastSeenAt: t };
    write(s);
    setSession(s);
    setNow(t);
    setPhase('running');
  }, []);

  // Adds time to the running session; after time's up it starts a short new one.
  const extend = useCallback((minutes: number) => {
    const t = Date.now();
    const cur = read();
    if (!cur || cur.endsAt <= t || cur.recorded) return start(minutes);
    const s = { ...cur, endsAt: cur.endsAt + minutes * 60_000, minutes: cur.minutes + minutes };
    write(s);
    setSession(s);
    setNow(t);
  }, [start]);

  const end = useCallback(() => {
    const t = Date.now();
    const cur = read();
    if (!cur) return;
    const s = { ...cur, endsAt: t, endedAt: t };
    write(s);
    setSession(s);
    setNow(t);
    setPhase('done');
    void recordSession(t);
  }, []);

  // Off: a running session is ended first, so the time studied so far is logged.
  const turnOff = useCallback(() => {
    const t = Date.now();
    const cur = read();
    if (cur && cur.endsAt > t) {
      const s = { ...cur, endsAt: t, endedAt: t };
      write(s);
      setSession(s);
      void recordSession(t);
    }
    writeOff(true);
    setOff(true);
    setPhase('pick');
  }, []);
  const turnOn = useCallback(() => {
    writeOff(false);
    setOff(false);
    setNow(Date.now());
    setPhase('pick');
  }, []);

  const locked = !open && !off && phase !== 'running' && phase !== 'checking';
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [locked]);

  if (open || phase === 'checking') return null;
  if (off) return <OffPill onTurnOn={turnOn} />;
  if (phase === 'running' && session) return <Countdown left={session.endsAt - now} total={session.endsAt - session.startedAt} onExtend={() => extend(5)} onEnd={end} onTurnOff={turnOff} />;

  return (
    <div role="dialog" aria-modal="true" aria-label="Study session"
      style={{
        position: 'fixed', inset: 0, zIndex: 1000, background: '#0d1117', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '2rem', padding: '1.5rem 1rem', overflowY: 'auto',
      }}>
      {phase === 'pick' && <Picker now={now} onStart={start} />}
      {phase === 'done' && session && <TimesUp session={session} onAgain={() => setPhase('pick')} onMore={() => extend(5)} />}
      {(phase === 'pick' || phase === 'done') && <StudyLog key={phase} />}
      <button type="button" onClick={turnOff} title="Use the app without a time limit. Turn it back on from the ⏳ pill in the corner."
        style={{ background: 'none', border: 'none', color: '#6e7681', fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'underline', marginTop: '-1rem' }}>
        Turn off focus timer
      </button>
    </div>
  );
}

function Picker({ now, onStart }: { now: number; onStart: (minutes: number) => void }) {
  const [minutes, setMinutes] = useState(25);
  const [custom, setCustom] = useState('');
  const chosen = custom.trim() ? Math.round(Number(custom)) : minutes;
  const valid = Number.isFinite(chosen) && chosen >= 1 && chosen <= 600;
  const go = () => { if (valid) onStart(chosen); };
  const ends = new Date(now + (valid ? chosen : 0) * 60_000);

  return (
    <div style={{ width: '100%', maxWidth: '440px', textAlign: 'center' }}
      onKeyDown={(e) => { if (e.key === 'Enter') go(); }}>
      <div style={{ fontSize: '2.2rem' }}>⏳</div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#e6edf3', margin: '0.5rem 0 0.3rem' }}>{greeting(now)} 👋</h1>
      <p style={{ color: '#8b949e', fontSize: '0.92rem', margin: '0 0 1.5rem' }}>How long are you studying? The app stays open for exactly that long.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
        {PRESETS.map((m) => {
          const active = !custom.trim() && minutes === m;
          return (
            <button key={m} type="button" onClick={() => { setMinutes(m); setCustom(''); }}
              style={{
                padding: '0.75rem 0', borderRadius: '10px', cursor: 'pointer', fontSize: '1rem', fontWeight: 600,
                border: `1px solid ${active ? '#58a6ff' : '#30363d'}`, background: active ? 'rgba(88,166,255,0.12)' : '#161b22',
                color: active ? '#e6edf3' : '#c9d1d9',
              }}>
              {m < 60 ? `${m} min` : `${m / 60} hr`}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
        <input type="number" min={1} max={600} inputMode="numeric" value={custom} onChange={(e) => setCustom(e.target.value)}
          placeholder="Custom minutes" aria-label="Custom minutes"
          style={{
            flex: 1, padding: '0.6rem 0.8rem', borderRadius: '10px', border: `1px solid ${custom.trim() ? '#58a6ff' : '#30363d'}`,
            background: '#161b22', color: '#e6edf3', fontSize: '0.92rem', outline: 'none',
          }} />
      </div>

      <button type="button" onClick={go} disabled={!valid}
        style={{
          width: '100%', marginTop: '1rem', padding: '0.85rem', borderRadius: '10px', border: 'none',
          background: valid ? '#238636' : '#21262d', color: valid ? '#fff' : '#6e7681', fontSize: '1rem', fontWeight: 700,
          cursor: valid ? 'pointer' : 'not-allowed',
        }}>
        Start {valid ? `${chosen} min` : ''} session
      </button>
      {valid && now > 0 && (
        <p style={{ color: '#6e7681', fontSize: '0.78rem', marginTop: '0.6rem' }}>
          Ends at {ends.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}
        </p>
      )}
    </div>
  );
}

function TimesUp({ session, onAgain, onMore }: { session: Session; onAgain: () => void; onMore: () => void }) {
  const studied = Math.max(1, Math.round((stoppedAt(session) - session.startedAt) / 60_000));
  return (
    <div style={{ width: '100%', maxWidth: '420px', textAlign: 'center' }}>
      <div style={{ fontSize: '2.4rem' }}>🎉</div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#e6edf3', margin: '0.5rem 0 0.3rem' }}>Time&apos;s up</h1>
      <p style={{ color: '#8b949e', fontSize: '0.92rem', margin: '0 0 1.5rem' }}>
        You studied for <strong style={{ color: '#3fb950' }}>{studied} min</strong>. Take a break: stretch, drink water, look away from the screen.
      </p>
      <button type="button" onClick={onAgain}
        style={{ width: '100%', padding: '0.85rem', borderRadius: '10px', border: 'none', background: '#238636', color: '#fff', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}>
        Start another session
      </button>
      <button type="button" onClick={onMore}
        style={{ width: '100%', marginTop: '0.5rem', padding: '0.7rem', borderRadius: '10px', border: '1px solid #30363d', background: 'transparent', color: '#8b949e', fontSize: '0.88rem', cursor: 'pointer' }}>
        5 more minutes
      </button>
    </div>
  );
}

// Bottom-right pill: time left, a thin progress ring of colour, +5 / end on hover-click.
function Countdown({ left, total, onExtend, onEnd, onTurnOff }: { left: number; total: number; onExtend: () => void; onEnd: () => void; onTurnOff: () => void }) {
  const [menu, setMenu] = useState(false);
  const urgent = left <= 60_000;
  const warn = left <= 5 * 60_000;
  const color = urgent ? '#f85149' : warn ? '#d29922' : '#3fb950';
  const pct = total > 0 ? Math.max(0, Math.min(100, (left / total) * 100)) : 0;
  return (
    <div className="session-countdown" style={{ position: 'fixed', right: '14px', bottom: '14px', zIndex: 950, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
      <style>{'@media print { .session-countdown { display: none !important; } }'}</style>
      {menu && (
        <div style={{ display: 'flex', gap: '6px' }}>
          <button type="button" onClick={() => { onExtend(); setMenu(false); }} style={menuBtn}>+5 min</button>
          <button type="button" onClick={() => { onEnd(); setMenu(false); }} style={{ ...menuBtn, color: '#f85149' }}>End now</button>
          <button type="button" onClick={() => { onTurnOff(); setMenu(false); }} style={{ ...menuBtn, color: '#8b949e' }} title="Stop the timer and use the app without a time limit">Turn off</button>
        </div>
      )}
      <button type="button" onClick={() => setMenu((m) => !m)} title="Time left in this session · click for options"
        style={{
          position: 'relative', overflow: 'hidden', padding: '5px 12px', borderRadius: '999px', cursor: 'pointer',
          border: `1px solid ${color}66`, background: '#161b22', color, boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          fontSize: '0.82rem', fontWeight: 600, fontFamily: 'var(--font-geist-mono), monospace', fontVariantNumeric: 'tabular-nums',
          animation: urgent ? 'session-pulse 1s ease-in-out infinite' : 'none',
        }}>
        <span style={{ position: 'absolute', left: 0, bottom: 0, height: '2px', width: `${pct}%`, background: color, transition: 'width 0.5s linear' }} />
        ⏳ {fmt(left)}
      </button>
      <style>{'@keyframes session-pulse { 50% { opacity: 0.55; } }'}</style>
    </div>
  );
}

const menuBtn: React.CSSProperties = {
  padding: '4px 10px', borderRadius: '8px', border: '1px solid #30363d', background: '#161b22', color: '#c9d1d9',
  fontSize: '0.75rem', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
};

// Today's study time and the last 7 days, from the Time tracker's day logs.
function StudyLog() {
  const [week, setWeek] = useState<{ day: string; minutes: number }[] | null>(null);
  useEffect(() => {
    let live = true;
    // Give a just-finished session a moment to be written first.
    const t = setTimeout(() => {
      loadDays().then(({ days }) => { if (live) setWeek(studyByDay(days, 7)); });
    }, 400);
    return () => { live = false; clearTimeout(t); };
  }, []);
  if (!week) return <div style={{ height: '118px' }} />;
  const today = week[week.length - 1].minutes;
  const total = week.reduce((a, d) => a + d.minutes, 0);
  const max = Math.max(60, ...week.map((d) => d.minutes));
  return (
    <div style={{ width: '100%', maxWidth: '440px', background: '#161b22', border: '1px solid #30363d', borderRadius: '12px', padding: '0.9rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div>
          <div style={{ fontSize: '0.68rem', color: '#8b949e', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Studied today</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: today ? '#a371f7' : '#6e7681' }}>{today ? formatDuration(today) : '0m'}</div>
        </div>
        <div style={{ fontSize: '0.75rem', color: '#8b949e', textAlign: 'right' }}>
          {formatDuration(total) || '0m'} this week
          <div><Link href="/time" style={{ color: '#58a6ff', textDecoration: 'none' }}>Open Time →</Link></div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', alignItems: 'end', height: '56px', marginTop: '0.7rem' }}>
        {week.map((d, i) => (
          <div key={d.day} title={`${parseDayKey(d.day).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}: ${formatDuration(d.minutes) || '0m'}`}
            style={{
              height: `${Math.max(3, (d.minutes / max) * 100)}%`, borderRadius: '4px',
              background: d.minutes ? (i === week.length - 1 ? '#a371f7' : '#a371f766') : '#21262d',
            }} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginTop: '4px' }}>
        {week.map((d) => (
          <div key={d.day} style={{ fontSize: '0.62rem', color: '#6e7681', textAlign: 'center' }}>
            {parseDayKey(d.day).toLocaleDateString('en-IN', { weekday: 'narrow' })}
          </div>
        ))}
      </div>
    </div>
  );
}

// Shown while the focus timer is switched off: one click turns it back on.
function OffPill({ onTurnOn }: { onTurnOn: () => void }) {
  return (
    <button type="button" onClick={onTurnOn} className="session-countdown" title="Focus timer is off · click to turn it on"
      style={{
        position: 'fixed', right: '14px', bottom: '14px', zIndex: 950, padding: '4px 11px', borderRadius: '999px',
        border: '1px solid #30363d', background: '#161b22', color: '#6e7681', fontSize: '0.75rem', cursor: 'pointer', opacity: 0.7,
      }}>
      <style>{'@media print { .session-countdown { display: none !important; } }'}</style>
      ⏳ Focus off
    </button>
  );
}
