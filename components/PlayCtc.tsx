'use client';

// Play mode for the Salary Roadmap — just for motivation: tick topics and
// watch a "dream CTC" grow. It is NOT linked to the real checklist or
// progress; everything here lives in this browser only.
//
// Each topic (DSA, LLD, … or one you add) is a card. Click its name to open
// it and add child items; the topic's amount is split equally between its
// children, so each one is worth topic ÷ number of children. A topic with no
// children is ticked as a whole.

import { useEffect, useRef, useState } from 'react';
import type { RoadmapLever } from '@/lib/salary-roadmap';

const PLAY_KEY = 'salary-roadmap:play:v2';

interface Child { id: string; name: string }
interface Topic { id: string; name: string; lpa: number; custom?: boolean }
interface PlayState {
  /** Ticked topic ids (childless topics) and child keys `${topicId}::${childId}`. */
  ticked: string[];
  /** Topics you added yourself. */
  custom: Topic[];
  /** Children per topic, once you've changed them; otherwise a roadmap topic starts with its subtopics. */
  children: Record<string, Child[]>;
  /** Topics that are open. */
  open: string[];
}

const EMPTY: PlayState = { ticked: [], custom: [], children: {}, open: [] };
const childKey = (topicId: string, childId: string) => `${topicId}::${childId}`;

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
  background: '#0d1117', color: '#e6edf3', fontSize: '0.8rem', minWidth: 0,
};
const smallBtn: React.CSSProperties = {
  background: '#21262d', border: '1px solid #30363d', borderRadius: '8px', color: '#c9d1d9', fontSize: '0.8rem', padding: '0.4rem 0.8rem', cursor: 'pointer',
};
const xBtn: React.CSSProperties = { background: 'none', border: 'none', color: '#6e7681', cursor: 'pointer', padding: 0, fontSize: '0.9rem', lineHeight: 1 };

let uid = 0;
const newId = (p: string) => `${p}-${Date.now().toString(36)}-${(uid++).toString(36)}`;

export default function PlayCtc({ base, levers }: { base: number; levers: RoadmapLever[] }) {
  const [state, setState] = useState<PlayState>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [pop, setPop] = useState<{ id: number; lpa: number } | null>(null);
  const lastTopic = useRef<number | null>(null);
  const lastChild = useRef<{ topic: string; idx: number } | null>(null);
  const cells = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PLAY_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setState({ ...EMPTY, ...(JSON.parse(raw) as Partial<PlayState>) });
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

  const roadmapTopics: (Topic & { defaults: Child[] })[] = levers
    .filter((l) => l.key !== 'baseline')
    .map((l) => ({ id: l.key, name: l.name, lpa: l.lpa, defaults: l.subtopics.map((st) => ({ id: st.name, name: st.name })) }));
  const topics: (Topic & { defaults: Child[] })[] = [...roadmapTopics, ...state.custom.map((t) => ({ ...t, defaults: [] }))];
  const kidsOf = (t: { id: string; defaults: Child[] }) => state.children[t.id] ?? t.defaults;

  const ticked = new Set(state.ticked);
  const open = new Set(state.open);

  /** The tick keys a topic is made of: its children, or itself when it has none. */
  const keysOf = (t: (typeof topics)[number]) => {
    const kids = kidsOf(t);
    return kids.length ? kids.map((k) => childKey(t.id, k.id)) : [t.id];
  };
  const valueOf = (t: (typeof topics)[number]) => t.lpa / Math.max(1, kidsOf(t).length);
  const gainedOf = (t: (typeof topics)[number]) => keysOf(t).filter((k) => ticked.has(k)).length * valueOf(t);

  const gained = topics.reduce((a, t) => a + gainedOf(t), 0);
  const possible = topics.reduce((a, t) => a + t.lpa, 0);
  const pct = possible ? Math.min(100, (gained / possible) * 100) : 0;

  /** Ticks or unticks a set of keys; pops the amount newly added. */
  const setKeys = (entries: { key: string; value: number }[], on: boolean) => {
    const keys = new Set(entries.map((e) => e.key));
    setState((s) => ({ ...s, ticked: on ? [...new Set([...s.ticked, ...keys])] : s.ticked.filter((x) => !keys.has(x)) }));
    const added = on ? entries.filter((e) => !ticked.has(e.key)).reduce((a, e) => a + e.value, 0) : 0;
    // A new id restarts the pop animation when ticking quickly.
    if (added > 0) setPop((p) => ({ id: (p?.id ?? 0) + 1, lpa: added }));
  };
  const entriesOf = (t: (typeof topics)[number]) => keysOf(t).map((key) => ({ key, value: valueOf(t) }));

  // Topic cards between two cards on one straight line: the same row or the
  // same column, measured from where the cards actually sit on screen.
  // Anything else (diagonal) is just the clicked card.
  const lineBetween = (a: number, b: number): number[] => {
    const ea = cells.current[a];
    const eb = cells.current[b];
    if (!ea || !eb) return [b];
    const sameRow = Math.abs(ea.offsetTop - eb.offsetTop) < 4;
    const sameCol = Math.abs(ea.offsetLeft - eb.offsetLeft) < 4;
    if (!sameRow && !sameCol) return [b];
    const [lo, hi] = [Math.min(a, b), Math.max(a, b)];
    const out: number[] = [];
    for (let i = lo; i <= hi; i++) {
      const el = cells.current[i];
      if (!el) continue;
      if (sameRow ? Math.abs(el.offsetTop - ea.offsetTop) < 4 : Math.abs(el.offsetLeft - ea.offsetLeft) < 4) out.push(i);
    }
    return out;
  };

  // Topic checkbox: ticks the whole topic (all its children). Shift+click
  // applies the same to every card on the line from the last one clicked.
  const clickTopic = (e: React.MouseEvent, idx: number) => {
    const t = topics[idx];
    const on = !keysOf(t).every((k) => ticked.has(k));
    const last = lastTopic.current;
    const range = e.shiftKey && last !== null && last < topics.length ? lineBetween(last, idx) : [idx];
    lastTopic.current = idx;
    setKeys(range.flatMap((i) => entriesOf(topics[i])), on);
  };

  // Child checkbox; Shift+click ticks the run of children from the last one clicked.
  const clickChild = (e: React.MouseEvent, t: (typeof topics)[number], idx: number) => {
    e.preventDefault();
    const kids = kidsOf(t);
    const on = !ticked.has(childKey(t.id, kids[idx].id));
    const last = lastChild.current;
    const [lo, hi] = e.shiftKey && last && last.topic === t.id && last.idx < kids.length
      ? [Math.min(last.idx, idx), Math.max(last.idx, idx)]
      : [idx, idx];
    lastChild.current = { topic: t.id, idx };
    setKeys(kids.slice(lo, hi + 1).map((k) => ({ key: childKey(t.id, k.id), value: valueOf(t) })), on);
  };

  const toggleOpen = (id: string) =>
    setState((s) => ({ ...s, open: s.open.includes(id) ? s.open.filter((x) => x !== id) : [...s.open, id] }));

  const addChild = (t: (typeof topics)[number], childName: string) => {
    const n = childName.trim().slice(0, 80);
    if (!n) return;
    const kids = kidsOf(t);
    const child = { id: newId('c'), name: n };
    setState((s) => {
      // A topic ticked as a whole stays done: its first child starts ticked.
      const carry = kids.length === 0 && s.ticked.includes(t.id);
      return {
        ...s,
        children: { ...s.children, [t.id]: [...kids, child] },
        ticked: carry ? [...s.ticked.filter((x) => x !== t.id), childKey(t.id, child.id)] : s.ticked,
      };
    });
  };
  const removeChild = (t: (typeof topics)[number], childId: string) => {
    lastChild.current = null;
    setState((s) => ({
      ...s,
      children: { ...s.children, [t.id]: kidsOf(t).filter((k) => k.id !== childId) },
      ticked: s.ticked.filter((x) => x !== childKey(t.id, childId)),
    }));
  };
  const resetChildren = (t: (typeof topics)[number]) =>
    setState((s) => {
      const rest = { ...s.children };
      delete rest[t.id];
      return { ...s, children: rest, ticked: s.ticked.filter((x) => !x.startsWith(`${t.id}::`)) };
    });

  const addTopic = (e: React.FormEvent) => {
    e.preventDefault();
    const v = Number(amount);
    if (!name.trim() || !Number.isFinite(v) || v <= 0 || v > 100) return;
    const t: Topic = { id: newId('custom'), name: name.trim().slice(0, 80), lpa: Math.round(v * 10) / 10, custom: true };
    setState((s) => ({ ...s, custom: [...s.custom, t], open: [...s.open, t.id] }));
    setName('');
    setAmount('');
  };
  const removeTopic = (id: string) => {
    lastTopic.current = null;
    setState((s) => {
      const rest = { ...s.children };
      delete rest[id];
      return {
        ...s,
        custom: s.custom.filter((c) => c.id !== id),
        children: rest,
        open: s.open.filter((x) => x !== id),
        ticked: s.ticked.filter((x) => x !== id && !x.startsWith(`${id}::`)),
      };
    });
  };

  const allKeys = topics.flatMap(entriesOf);
  const tickAll = () => setKeys(allKeys, true);

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
          {allKeys.some((k) => !ticked.has(k.key)) && (
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '8px', alignItems: 'start' }}>
        {topics.map((t, idx) => {
          const keys = keysOf(t);
          const done = keys.filter((k) => ticked.has(k)).length;
          const all = done === keys.length;
          const some = done > 0 && !all;
          const isOpen = open.has(t.id);
          const kids = kidsOf(t);
          const share = valueOf(t);
          return (
            <div key={t.id} ref={(el) => { cells.current[idx] = el; }}
              style={{ border: `1px solid ${isOpen ? '#bc8cff55' : '#30363d'}`, borderRadius: '8px', background: '#0d1117', padding: '6px 8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
                <input type="checkbox" checked={all} ref={(el) => { if (el) el.indeterminate = some; }}
                  onClick={(e) => clickTopic(e, idx)} readOnly aria-label={`Tick all of ${t.name}`} style={{ accentColor: '#bc8cff' }} />
                <button type="button" onClick={() => toggleOpen(t.id)} aria-expanded={isOpen} title={isOpen ? 'Close' : 'Open to add child items'}
                  style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', color: all ? '#8b949e' : '#e6edf3', fontSize: 'inherit' }}>
                  <span style={{ color: '#6e7681', fontSize: '0.7rem', width: '10px' }}>{isOpen ? '▾' : '▸'}</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: all ? 'line-through' : 'none', textDecorationColor: '#6e7681' }}>{t.name}</span>
                  {kids.length > 0 && <span style={{ color: '#6e7681', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>{done}/{kids.length}</span>}
                </button>
                <span style={{ color: done ? '#3fb950' : '#8b949e', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', fontSize: '0.78rem' }}>+{money(t.lpa)}</span>
                {t.custom && <button type="button" onClick={() => removeTopic(t.id)} aria-label={`Remove ${t.name}`} style={xBtn}>×</button>}
              </div>

              {isOpen && (
                <div style={{ marginTop: '6px', paddingLeft: '18px', borderTop: '1px solid #21262d', paddingTop: '6px' }}>
                  {kids.length > 0 && (
                    <div style={{ fontSize: '0.68rem', color: '#6e7681', marginBottom: '4px' }}>
                      {money(t.lpa)} ÷ {kids.length} = {money(share)} each
                    </div>
                  )}
                  {kids.map((k, ci) => {
                    const on = ticked.has(childKey(t.id, k.id));
                    return (
                      <label key={k.id} onClick={(e) => clickChild(e, t, ci)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: on ? '#8b949e' : '#c9d1d9', cursor: 'pointer', padding: '2px 0', userSelect: 'none' }}>
                        <input type="checkbox" checked={on} readOnly style={{ accentColor: '#bc8cff' }} />
                        <span title={k.name} style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: on ? 'line-through' : 'none' }}>{k.name}</span>
                        <span style={{ color: on ? '#3fb950' : '#6e7681', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>+{money(share)}</span>
                        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeChild(t, k.id); }} aria-label={`Remove ${k.name}`} style={xBtn}>×</button>
                      </label>
                    );
                  })}
                  <AddChild onAdd={(n) => addChild(t, n)} />
                  {!t.custom && state.children[t.id] && (
                    <button type="button" onClick={() => resetChildren(t)}
                      style={{ background: 'none', border: 'none', color: '#6e7681', fontSize: '0.68rem', cursor: 'pointer', padding: '4px 0 0', textDecoration: 'underline' }}>
                      Reset to the roadmap&apos;s subtopics
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <form onSubmit={addTopic} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.9rem', flexWrap: 'wrap' }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Add your own topic, e.g. React" aria-label="Topic name"
          style={{ ...input, flex: '1 1 200px' }} />
        <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" min={0.1} max={100} step={0.1} placeholder="LPA" aria-label="Amount in LPA"
          style={{ ...input, width: '80px' }} />
        <button type="submit" style={smallBtn}>+ Add topic</button>
      </form>
      <div style={{ fontSize: '0.68rem', color: '#6e7681', marginTop: '0.5rem', lineHeight: 1.5 }}>
        Click a topic&apos;s name to open it and add child items: its amount is split equally between them. Shift+click topic boxes in the same row or
        column (or children in a list) to tick a run at once. Not linked to your real progress; saved in this browser only.
      </div>
    </div>
  );
}

function AddChild({ onAdd }: { onAdd: (name: string) => void }) {
  const [v, setV] = useState('');
  return (
    <form onSubmit={(e) => { e.preventDefault(); onAdd(v); setV(''); }} style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
      <input value={v} onChange={(e) => setV(e.target.value)} placeholder="Add a child item…" aria-label="Child item name"
        style={{ ...input, flex: 1, padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} />
      <button type="submit" style={{ ...smallBtn, padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}>+</button>
    </form>
  );
}
