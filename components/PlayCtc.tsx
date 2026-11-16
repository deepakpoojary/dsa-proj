'use client';

// Play mode for the Salary Roadmap — just for motivation: tick a topic and
// watch a "dream CTC" grow. It is NOT linked to the real checklist or
// progress; ticks and custom items live in this browser only.

import { useEffect, useState } from 'react';
import type { RoadmapLever } from '@/lib/salary-roadmap';

const PLAY_KEY = 'salary-roadmap:play:v1';

interface PlayItem { id: string; name: string; lpa: number; custom?: boolean }
interface PlayState { ticked: string[]; custom: PlayItem[] }

function lpa(n: number) {
  const r = Math.round(n * 10) / 10;
  return `₹${Number.isInteger(r) ? r : r.toFixed(1)} LPA`;
}
function money(n: number) {
  if (n >= 1 || n <= 0) return lpa(n);
  return `₹${Math.max(1, Math.round(n * 100))}k/yr`;
}

const input: React.CSSProperties = {
  boxSizing: 'border-box', padding: '0.4rem 0.6rem', borderRadius: '8px', border: '1px solid #30363d',
  background: '#0d1117', color: '#e6edf3', fontSize: '0.8rem',
};

export default function PlayCtc({ base, levers }: { base: number; levers: RoadmapLever[] }) {
  const [state, setState] = useState<PlayState>({ ticked: [], custom: [] });
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [pop, setPop] = useState<{ id: number; lpa: number } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PLAY_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setState({ ticked: [], custom: [], ...(JSON.parse(raw) as Partial<PlayState>) });
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(PLAY_KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [loaded, state]);
  useEffect(() => {
    if (!pop) return;
    const t = setTimeout(() => setPop(null), 1400);
    return () => clearTimeout(t);
  }, [pop]);

  // The roadmap's topics (each subtopic, or the lever itself when it has none), plus your own.
  const fromRoadmap: PlayItem[] = levers
    .filter((l) => l.key !== 'baseline')
    .flatMap((l) => (l.subtopics.length
      ? l.subtopics.map((st) => ({ id: `${l.key}/${st.name}`, name: st.name, lpa: st.lpa }))
      : [{ id: l.key, name: l.name, lpa: l.lpa }]));
  const items = [...fromRoadmap, ...state.custom];
  const ticked = new Set(state.ticked);
  const gained = items.filter((i) => ticked.has(i.id)).reduce((a, i) => a + i.lpa, 0);
  const possible = items.reduce((a, i) => a + i.lpa, 0);
  const pct = possible ? Math.min(100, (gained / possible) * 100) : 0;

  const toggleItem = (it: PlayItem) => {
    const on = !ticked.has(it.id);
    setState((s) => ({ ...s, ticked: on ? [...s.ticked, it.id] : s.ticked.filter((x) => x !== it.id) }));
    // A new id restarts the pop animation when ticking quickly.
    if (on) setPop((p) => ({ id: (p?.id ?? 0) + 1, lpa: it.lpa }));
  };
  const tickAll = () => {
    const rest = items.filter((i) => !ticked.has(i.id)).reduce((a, i) => a + i.lpa, 0);
    setState((s) => ({ ...s, ticked: items.map((i) => i.id) }));
    if (rest > 0) setPop((p) => ({ id: (p?.id ?? 0) + 1, lpa: rest }));
  };
  const addCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const v = Number(amount);
    if (!name.trim() || !Number.isFinite(v) || v <= 0 || v > 100) return;
    const it: PlayItem = { id: `custom-${Date.now()}`, name: name.trim().slice(0, 80), lpa: Math.round(v * 10) / 10, custom: true };
    setState((s) => ({ ...s, custom: [...s.custom, it] }));
    setName('');
    setAmount('');
  };
  const removeCustom = (id: string) =>
    setState((s) => ({ ticked: s.ticked.filter((x) => x !== id), custom: s.custom.filter((c) => c.id !== id) }));

  return (
    <div style={{ border: '1px solid #bc8cff55', borderRadius: '12px', padding: '1.25rem', background: 'linear-gradient(180deg, rgba(188,140,255,0.07), #161b22 60%)' }}>
      <style>{'@keyframes play-pop { 0% { opacity: 0; transform: translateY(6px) scale(0.9); } 20% { opacity: 1; transform: translateY(0) scale(1.05); } 100% { opacity: 0; transform: translateY(-18px); } }'}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: '0.68rem', color: '#bc8cff', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>
            🎮 Play mode · just for motivation
          </div>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#e6edf3', fontVariantNumeric: 'tabular-nums' }}>{lpa(base + gained)}</span>
            {pop && (
              <span key={pop.id}
                style={{ position: 'absolute', left: '100%', top: 0, marginLeft: '8px', whiteSpace: 'nowrap', color: '#3fb950', fontWeight: 700, fontSize: '0.95rem', animation: 'play-pop 1.4s ease-out forwards' }}>
                +{money(pop.lpa)} 🎉
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#8b949e' }}>
            dream CTC · {lpa(base)} + {money(gained)} ticked{possible > 0 && ` · ${lpa(base + possible)} if you tick everything`}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {items.some((i) => !ticked.has(i.id)) && (
            <button type="button" onClick={tickAll}
              style={{ background: 'rgba(188,140,255,0.12)', border: '1px solid #bc8cff66', borderRadius: '6px', color: '#d2a8ff', fontSize: '0.72rem', padding: '3px 10px', cursor: 'pointer' }}>
              ✓ Tick all
            </button>
          )}
          {state.ticked.length > 0 && (
            <button type="button" onClick={() => setState((s) => ({ ...s, ticked: [] }))}
              style={{ background: 'none', border: '1px solid #30363d', borderRadius: '6px', color: '#8b949e', fontSize: '0.72rem', padding: '3px 10px', cursor: 'pointer' }}>
              Untick all
            </button>
          )}
        </div>
      </div>

      <div style={{ height: '6px', borderRadius: '3px', background: '#21262d', margin: '0.8rem 0 0.9rem', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: '#bc8cff', borderRadius: '3px', transition: 'width 0.4s ease-out' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '4px 12px' }}>
        {items.map((it) => {
          const on = ticked.has(it.id);
          return (
            <label key={it.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: on ? '#e6edf3' : '#c9d1d9', cursor: 'pointer', padding: '3px 0' }}>
              <input type="checkbox" checked={on} onChange={() => toggleItem(it)} style={{ accentColor: '#bc8cff' }} />
              <span title={it.name}
                style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: on ? 'line-through' : 'none', textDecorationColor: '#6e7681' }}>
                {it.name}
              </span>
              <span style={{ color: on ? '#3fb950' : '#8b949e', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>+{money(it.lpa)}</span>
              {it.custom && (
                <button type="button" onClick={(e) => { e.preventDefault(); removeCustom(it.id); }} aria-label={`Remove ${it.name}`}
                  style={{ background: 'none', border: 'none', color: '#6e7681', cursor: 'pointer', padding: 0, fontSize: '0.9rem', lineHeight: 1 }}>
                  ×
                </button>
              )}
            </label>
          );
        })}
      </div>

      <form onSubmit={addCustom} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.9rem', flexWrap: 'wrap' }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Add your own, e.g. Finish 50 LeetCode" aria-label="Item name"
          style={{ ...input, flex: '1 1 200px' }} />
        <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" min={0.1} max={100} step={0.1} placeholder="LPA" aria-label="Amount in LPA"
          style={{ ...input, width: '80px' }} />
        <button type="submit" style={{ background: '#21262d', border: '1px solid #30363d', borderRadius: '8px', color: '#c9d1d9', fontSize: '0.8rem', padding: '0.4rem 0.8rem', cursor: 'pointer' }}>
          + Add
        </button>
      </form>
      <div style={{ fontSize: '0.68rem', color: '#6e7681', marginTop: '0.5rem' }}>
        Not linked to your real progress: ticking here doesn&apos;t mark anything as done. Saved in this browser only.
      </div>
    </div>
  );
}
