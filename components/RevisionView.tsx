'use client';

import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type { Roadmap } from '@/lib/salary-roadmap';
import type { StudyStats } from '@/lib/study-stats';
import type { ActivityEvent } from '@/app/api/activity/route';
import { backLever } from '@/lib/roadmap-backing';
import ActivityCalendar, { ResolvedEvent } from '@/components/ActivityCalendar';
import Planner from '@/components/Planner';
import { buildCatalog, describeUnknown, CatalogItem } from '@/lib/item-catalog';
import { useChecklist } from '@/lib/use-checklist';
import { NoteButton, NotesCtx, useNoteHost } from '@/components/Notes';
import type { NoteStatus } from '@/lib/use-notes';
import ReviewSession from '@/components/ReviewSession';
import { useReviews } from '@/lib/use-reviews';
import { buildQueue, dueLabel, startOfToday, NEW_PER_DAY, ReviewState } from '@/lib/spaced-repetition';

const ROADMAP_KEY = 'salary-roadmap:v1';
const KIND_ICON: Record<string, string> = { reading: '📄', quiz: '❓', video: '🎬', test: '🧪' };

type Filter = 'all' | 'done' | 'notes';

// Read the clock in event handlers only (keeps render pure).
const clock = () => Date.now();

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Everything' },
  { key: 'done', label: 'Done' },
  { key: 'notes', label: 'Has notes' },
];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '4px 11px', borderRadius: '999px', fontSize: '0.75rem', cursor: 'pointer', whiteSpace: 'nowrap',
        border: `1px solid ${active ? '#58a6ff' : '#30363d'}`,
        background: active ? 'rgba(88,166,255,0.12)' : 'transparent',
        color: active ? '#e6edf3' : '#8b949e',
      }}
    >
      {children}
    </button>
  );
}

export default function RevisionView({ signedIn, stats }: { signedIn: boolean; stats: StudyStats }) {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [area, setArea] = useState<string>('All');
  const [tab, setTab] = useState<'review' | 'activity' | 'planner'>('review');
  const [highlight, setHighlight] = useState<string | null>(null);
  const { checked, toggle, refresh: refreshChecklist } = useChecklist(signedIn);
  const noteHost = useNoteHost(signedIn);
  const { notes } = noteHost;
  const { reviews, grade, refresh: refreshReviews } = useReviews(signedIn);
  const [rawEvents, setRawEvents] = useState<ActivityEvent[] | null>(null);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [syncedAt, setSyncedAt] = useState<number | null>(null);

  const loadActivity = useCallback(async () => {
    if (!signedIn) return;
    setEventsLoading(true);
    try {
      const res = await fetch('/api/activity', { cache: 'no-store' });
      if (res.ok) setRawEvents(((await res.json()) as { events: ActivityEvent[] }).events);
    } catch {
      // Offline — keep the last loaded events.
    } finally {
      setEventsLoading(false);
    }
  }, [signedIn]);

  useEffect(() => {
    // Also needed on Review: tick timestamps drive newest-first ordering.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (rawEvents === null) void loadActivity();
  }, [rawEvents, loadActivity]);

  async function refreshAll() {
    setRefreshing(true);
    await Promise.all([
      refreshChecklist(),
      noteHost.refresh(),
      refreshReviews(),
      loadActivity(),
    ]);
    setNow(clock());
    setSyncedAt(clock());
    setRefreshing(false);
  }
  const [session, setSession] = useState<CatalogItem[] | null>(null);
  // Clock for "what's due", refreshed each minute and after a session.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ROADMAP_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setRoadmap((JSON.parse(raw) as { roadmap: Roadmap | null }).roadmap);
    } catch {
      // No saved roadmap — course and guide items still resolve.
    }
  }, []);

  const catalog = useMemo(() => buildCatalog(roadmap), [roadmap]);
  const order = useMemo(() => new Map([...catalog.keys()].map((id, i) => [id, i])), [catalog]);

  // A note's sort time is pinned when it's first seen, so editing a note
  // doesn't make it jump to the top while you type.
  const [noteSeenAt, setNoteSeenAt] = useState<Record<string, number>>({});
  useEffect(() => {
    const unseen = Object.entries(notes).filter(([id]) => !(id in noteSeenAt));
    if (!unseen.length) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNoteSeenAt((prev) => ({ ...prev, ...Object.fromEntries(unseen.map(([id, n]) => [id, n.updatedAt])) }));
  }, [notes, noteSeenAt]);

  // When each item was ticked (from activity history).
  const checkedAt = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of rawEvents ?? []) if (e.kind === 'item') m.set(e.id, e.at);
    return m;
  }, [rawEvents]);

  // Everything the user has touched: ticked, or written a note on — newest
  // first (latest of tick time / note time), falling back to reverse course order.
  const touched = useMemo(() => {
    const ids = new Set<string>([...checked, ...Object.keys(notes).filter((id) => notes[id].body.trim() !== '')]);
    const recency = (id: string) => Math.max(checked.has(id) ? checkedAt.get(id) ?? 0 : 0, noteSeenAt[id] ?? 0);
    return [...ids]
      .filter((id) => !id.startsWith('site:') && !id.startsWith('theory:'))
      .map((id) => catalog.get(id) ?? describeUnknown(id))
      .sort((a, b) => recency(b.id) - recency(a.id) || (order.get(b.id) ?? -1) - (order.get(a.id) ?? -1));
  }, [checked, notes, catalog, order, checkedAt, noteSeenAt]);

  const doneCount = touched.filter((i) => checked.has(i.id)).length;
  const notedCount = touched.filter((i) => notes[i.id]?.body.trim()).length;
  const areas = useMemo(() => ['All', ...Array.from(new Set(touched.map((i) => i.area)))], [touched]);

  const q = query.trim().toLowerCase();
  const visible = touched.filter((i) => {
    if (filter === 'done' && !checked.has(i.id)) return false;
    if (filter === 'notes' && !notes[i.id]?.body.trim()) return false;
    if (area !== 'All' && i.area !== area) return false;
    if (!q) return true;
    return (
      i.title.toLowerCase().includes(q) ||
      i.section.toLowerCase().includes(q) ||
      i.area.toLowerCase().includes(q) ||
      (notes[i.id]?.body.toLowerCase().includes(q) ?? false)
    );
  });

  // area → section → items, preserving catalog order.
  const grouped = useMemo(() => {
    const g = new Map<string, Map<string, CatalogItem[]>>();
    for (const i of visible) {
      if (!g.has(i.area)) g.set(i.area, new Map());
      const sections = g.get(i.area)!;
      if (!sections.has(i.section)) sections.set(i.section, []);
      sections.get(i.section)!.push(i);
    }
    return g;
  }, [visible]);

  // Spaced repetition runs over completed items only.
  const doneItems = touched.filter((i) => checked.has(i.id));
  const byId = new Map(doneItems.map((i) => [i.id, i]));
  const { due, fresh } = buildQueue(doneItems.map((i) => i.id), reviews, now);
  const reviewedToday = Object.values(reviews).filter((r) => r.lastReviewedAt >= startOfToday(now)).length;
  const nextDue = Object.entries(reviews)
    .filter(([id]) => byId.has(id))
    .map(([, r]) => r.dueAt)
    .filter((t) => t > now)
    .sort((a, b) => a - b)[0];
  const backlogNew = doneItems.filter((i) => !reviews[i.id]).length - fresh.length;

  function startSession() {
    const items = [...due, ...fresh].map((id) => byId.get(id)!).filter(Boolean);
    if (items.length) setSession(items);
  }

  // ₹/yr of salary value per checkbox / site topic, from the saved roadmap —
  // the same split the roadmap page shows.
  const valueMap = useMemo(() => {
    const m = new Map<string, number>();
    if (!roadmap) return m;
    for (const lever of roadmap.levers) {
      for (const dsaSource of lever.key === 'dsa' ? (['site', 'course'] as const) : (['course'] as const)) {
        const backing = backLever(lever, { roadmap, dsaSource, stats, checked: new Set() });
        for (const row of backing?.rows ?? []) {
          const per = row.total > 0 ? (row.lpa * 100000) / row.total : 0;
          if (row.items) for (const it of row.items) m.set(it.id, per);
          else m.set(row.id, per);
        }
      }
    }
    return m;
  }, [roadmap, stats]);

  const events: ResolvedEvent[] | null = useMemo(() => {
    if (!rawEvents) return null;
    return rawEvents.map((e) => {
      if (e.kind === 'item') {
        const c = catalog.get(e.id) ?? describeUnknown(e.id);
        return { ...e, title: c.title, context: [c.area, c.section].filter(Boolean).join(' · '), salaryRs: valueMap.get(e.id) ?? 0 };
      }
      const key = e.kind === 'problem' ? `site:${e.topic}` : `theory:${e.topic}`;
      return { ...e, title: e.title ?? '', context: e.context ?? '', salaryRs: valueMap.get(key) ?? 0 };
    });
  }, [rawEvents, catalog, valueMap]);

  function openEvent(e: ResolvedEvent) {
    if (e.href) {
      window.location.href = e.href;
      return;
    }
    // A checklist item: show it in the Review list, or its note if it's no
    // longer ticked / noted.
    if (touched.some((i) => i.id === e.id)) {
      setTab('review');
      setQuery('');
      setFilter('all');
      setArea('All');
      setHighlight(e.id);
      setTimeout(() => document.getElementById(`rev-${e.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
      setTimeout(() => setHighlight(null), 2500);
    } else {
      noteHost.open({ id: e.id, title: e.title, context: e.context });
    }
  }

  // Uses the browser's print dialog ("Save as PDF"); the title becomes the
  // suggested file name.
  function exportPdf() {
    const prevTitle = document.title;
    const label = area !== 'All' ? ` - ${area}` : '';
    document.title = `Revision notes${label} - ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    window.addEventListener('afterprint', () => { document.title = prevTitle; }, { once: true });
    window.print();
  }

  function openRandom() {
    const pool = visible.length ? visible : touched;
    if (!pool.length) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    noteHost.open({ id: pick.id, title: pick.title, context: [pick.area, pick.section].filter(Boolean).join(' · ') });
  }

  return (
    <NotesCtx.Provider value={noteHost.value}>
      <div className="rev-screen" style={{ minHeight: '100vh', background: '#0d1117', padding: '2rem 1rem 4rem' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/roadmap" style={{ fontSize: '0.8rem', color: '#8b949e', textDecoration: 'none' }}>← Salary Roadmap</Link>
            <Link href="/" style={{ fontSize: '0.8rem', color: '#8b949e', textDecoration: 'none' }}>DSA Problems</Link>
            <Link href="/theory" style={{ fontSize: '0.8rem', color: '#8b949e', textDecoration: 'none' }}>Theory Q&amp;A</Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#e6edf3', margin: 0 }}>🔁 Revision</h1>
              <p style={{ color: '#8b949e', fontSize: '0.85rem', margin: '6px 0 0' }}>
                {doneCount} done · {notedCount} with notes
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {syncedAt && !refreshing && <span style={{ fontSize: '0.7rem', color: '#6e7681' }}>Synced</span>}
              <button
                type="button"
                onClick={refreshAll}
                disabled={refreshing}
                title="Re-sync ticks, notes, reviews and activity"
                style={{
                  padding: '0.45rem 0.8rem', borderRadius: '8px', border: '1px solid #30363d', background: '#21262d',
                  color: '#e6edf3', fontSize: '0.8rem', cursor: refreshing ? 'wait' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px',
                }}
              >
                <span style={{ display: 'inline-block', animation: refreshing ? 'rev-spin 0.8s linear infinite' : 'none' }}>↻</span>
                {refreshing ? 'Syncing…' : 'Refresh'}
              </button>
              {tab === 'review' && touched.length > 0 && (
                <button
                  type="button"
                  onClick={openRandom}
                  style={{
                    padding: '0.45rem 0.9rem', borderRadius: '8px', border: '1px solid #30363d', background: '#21262d',
                    color: '#e6edf3', fontSize: '0.8rem', cursor: 'pointer',
                  }}
                >
                  🎲 Random
                </button>
              )}
              {tab === 'review' && visible.length > 0 && (
                <button
                  type="button"
                  onClick={exportPdf}
                  title="Save what's shown below as a clean PDF"
                  style={{
                    padding: '0.45rem 0.9rem', borderRadius: '8px', border: '1px solid #30363d', background: '#21262d',
                    color: '#e6edf3', fontSize: '0.8rem', cursor: 'pointer',
                  }}
                >
                  ⬇ Export PDF
                </button>
              )}
            </div>
          </div>
          <style>{'@keyframes rev-spin { to { transform: rotate(360deg); } }'}</style>

          <div style={{ display: 'flex', gap: '1.25rem', borderBottom: '1px solid #21262d' }}>
            {(['review', 'activity', 'planner'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 0.6rem', fontSize: '0.88rem',
                  color: tab === t ? '#e6edf3' : '#8b949e', fontWeight: tab === t ? 600 : 400,
                  borderBottom: `2px solid ${tab === t ? '#f78166' : 'transparent'}`, marginBottom: '-1px',
                }}
              >
                {t === 'review' ? 'Review' : t === 'activity' ? 'Activity' : 'Planner'}
              </button>
            ))}
          </div>

          {tab === 'planner' ? (
            <Planner now={now} checked={checked} stats={stats} roadmap={roadmap} events={rawEvents} valueMap={valueMap} loading={eventsLoading} />
          ) : tab === 'activity' ? (
            signedIn ? (
              <ActivityCalendar events={events} loading={eventsLoading} onOpen={openEvent} />
            ) : (
              <p style={{ color: '#8b949e', fontSize: '0.85rem', textAlign: 'center', margin: '2rem 0' }}>
                <a href="/login" style={{ color: '#58a6ff' }}>Log in</a> to see your activity calendar.
              </p>
            )
          ) : touched.length === 0 ? (
            <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '12px', padding: '2.5rem 1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem' }}>📝</div>
              <p style={{ color: '#e6edf3', fontSize: '0.9rem', margin: '0.5rem 0 0.25rem' }}>Nothing to revise yet</p>
              <p style={{ color: '#8b949e', fontSize: '0.8rem', margin: 0 }}>
                Tick lessons or add notes on the <Link href="/roadmap" style={{ color: '#58a6ff' }}>Salary Roadmap</Link>. They show up here.
              </p>
            </div>
          ) : (
            <>
              <TodayCard
                due={due.length}
                fresh={fresh.length}
                backlogNew={backlogNew}
                reviewedToday={reviewedToday}
                nextDue={nextDue}
                hasDone={doneItems.length > 0}
                onStart={startSession}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search titles and notes…"
                  style={{
                    width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.8rem', borderRadius: '8px',
                    border: '1px solid #30363d', background: '#161b22', color: '#e6edf3', fontSize: '0.88rem', outline: 'none',
                  }}
                />
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {FILTERS.map((f) => (
                    <Chip key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)}>{f.label}</Chip>
                  ))}
                  <span style={{ width: '1px', background: '#30363d', margin: '0 0.2rem' }} />
                  {areas.map((a) => (
                    <Chip key={a} active={area === a} onClick={() => setArea(a)}>{a}</Chip>
                  ))}
                </div>
              </div>

              {visible.length === 0 && (
                <p style={{ color: '#8b949e', fontSize: '0.85rem', textAlign: 'center', margin: '1.5rem 0' }}>No matches.</p>
              )}

              {[...grouped].map(([areaName, sections]) => (
                <section key={areaName} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '12px', padding: '1rem 1.1rem' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e6edf3', marginBottom: '0.4rem' }}>{areaName}</div>
                  {[...sections].map(([sectionName, items]) => (
                    <div key={sectionName} style={{ marginTop: '0.6rem' }}>
                      {sectionName && (
                        <div style={{ fontSize: '0.68rem', color: '#6e7681', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                          {sectionName}
                        </div>
                      )}
                      {items.map((item) => (
                        <RevisionItem
                          key={item.id}
                          item={item}
                          review={reviews[item.id]}
                          now={now}
                          highlighted={highlight === item.id}
                          checked={checked.has(item.id)}
                          onToggle={() => toggle(item.id)}
                        />
                      ))}
                    </div>
                  ))}
                </section>
              ))}
            </>
          )}
        </div>
        {session && (
          <ReviewSession
            initial={session}
            reviews={reviews}
            onGrade={grade}
            onClose={() => {
              setSession(null);
              setNow(Date.now());
            }}
            noteOpen={noteHost.isOpen}
          />
        )}
        {noteHost.modal}
      </div>
      <PrintableRevision
        grouped={grouped}
        checked={checked}
        notes={notes}
        scope={[
          FILTERS.find((f) => f.key === filter)!.label,
          area !== 'All' ? area : null,
          q ? `"${query.trim()}"` : null,
        ].filter(Boolean).join(' · ')}
        count={visible.length}
      />
    </NotesCtx.Provider>
  );
}

// Print-only document for "Export PDF": light, distraction-free, one area per
// page. Hidden on screen; the app UI is hidden when printing.
function PrintableRevision({
  grouped, checked, notes, scope, count,
}: {
  grouped: Map<string, Map<string, CatalogItem[]>>;
  checked: Set<string>;
  notes: Record<string, { body: string }>;
  scope: string;
  count: number;
}) {
  return (
    <div className="rev-print">
      <style>{`
        .rev-print { display: none; }
        @media print {
          @page { margin: 16mm 14mm; }
          html, body { background: #fff !important; }
          .rev-screen { display: none !important; }
          .rev-print { display: block; color: #1f2328; font-family: Georgia, 'Times New Roman', serif; }
          .rev-print h1 { font-size: 20pt; margin: 0 0 2pt; }
          .rev-print .meta { font: 9pt system-ui, sans-serif; color: #59636e; margin-bottom: 14pt; }
          .rev-print .area { break-before: page; }
          .rev-print .area:first-of-type { break-before: auto; }
          .rev-print h2 { font: 600 14pt system-ui, sans-serif; border-bottom: 1.5pt solid #1f2328; padding-bottom: 3pt; margin: 0 0 8pt; }
          .rev-print h3 { font: 600 8.5pt system-ui, sans-serif; text-transform: uppercase; letter-spacing: 0.06em; color: #59636e; margin: 12pt 0 4pt; break-after: avoid; }
          .rev-print .item { break-inside: avoid; padding: 5pt 0; border-bottom: 0.5pt solid #d1d9e0; }
          .rev-print .title { font-size: 11pt; font-weight: 600; }
          .rev-print .box { display: inline-block; width: 9pt; margin-right: 5pt; font-family: system-ui, sans-serif; }
          .rev-print .note { font-size: 10.5pt; line-height: 1.55; white-space: pre-wrap; margin: 4pt 0 2pt 14pt; padding-left: 8pt; border-left: 2pt solid #d1d9e0; }
          .rev-print .blank { margin: 4pt 0 2pt 14pt; height: 28pt; border-left: 2pt dashed #d1d9e0; }
        }
      `}</style>
      <h1>Revision notes</h1>
      <div className="meta">
        {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} · {count} item{count === 1 ? '' : 's'} · {scope}
      </div>
      {[...grouped].map(([areaName, sections]) => (
        <section key={areaName} className="area">
          <h2>{areaName}</h2>
          {[...sections].map(([sectionName, items]) => (
            <div key={sectionName}>
              {sectionName && <h3>{sectionName}</h3>}
              {items.map((item) => {
                const body = notes[item.id]?.body.trim();
                return (
                  <div key={item.id} className="item">
                    <div className="title">
                      <span className="box">{checked.has(item.id) ? '☑' : '☐'}</span>
                      {item.title}
                    </div>
                    {body ? <div className="note">{body}</div> : <div className="blank" />}
                  </div>
                );
              })}
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

function TodayCard({
  due, fresh, backlogNew, reviewedToday, nextDue, hasDone, onStart,
}: {
  due: number;
  fresh: number;
  backlogNew: number;
  reviewedToday: number;
  nextDue?: number;
  hasDone: boolean;
  onStart: () => void;
}) {
  const total = due + fresh;
  if (!hasDone) return null;
  const next = nextDue ? new Date(nextDue) : null;
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', padding: '1rem 1.15rem', borderRadius: '12px',
        background: total ? 'rgba(63,185,80,0.08)' : '#161b22', border: `1px solid ${total ? 'rgba(63,185,80,0.35)' : '#30363d'}`,
      }}
    >
      <div style={{ flex: 1, minWidth: '200px' }}>
        <div style={{ fontSize: '0.68rem', color: '#8b949e', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Today&apos;s review</div>
        {total ? (
          <div style={{ fontSize: '1rem', color: '#e6edf3', fontWeight: 600, marginTop: '2px' }}>
            {due > 0 && <span>{due} due</span>}
            {due > 0 && fresh > 0 && <span style={{ color: '#6e7681' }}> · </span>}
            {fresh > 0 && <span style={{ color: '#58a6ff' }}>{fresh} new</span>}
          </div>
        ) : (
          <div style={{ fontSize: '1rem', color: '#3fb950', fontWeight: 600, marginTop: '2px' }}>All caught up ✓</div>
        )}
        <div style={{ fontSize: '0.72rem', color: '#6e7681', marginTop: '3px' }}>
          {reviewedToday > 0 ? `${reviewedToday} reviewed today` : `Up to ${NEW_PER_DAY} new items a day`}
          {backlogNew > 0 && ` · ${backlogNew} more waiting`}
          {!total && next && ` · next ${next.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}`}
        </div>
      </div>
      {total > 0 && (
        <button
          type="button"
          onClick={onStart}
          style={{ padding: '0.6rem 1.3rem', borderRadius: '8px', border: 'none', background: '#238636', color: '#fff', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}
        >
          Start review ({total})
        </button>
      )}
    </div>
  );
}

function RevisionItem({
  item, review, now, highlighted, checked, onToggle,
}: {
  item: CatalogItem;
  review?: ReviewState;
  now: number;
  highlighted: boolean;
  checked: boolean;
  onToggle: () => void;
}) {
  const { notes, status, setNote, flush } = useContext(NotesCtx);
  const [editing, setEditing] = useState(false);
  const note = notes[item.id];
  const hasNote = !!note && note.body.trim() !== '';

  function finish() {
    flush(item.id);
    setEditing(false);
  }

  return (
    <div
      id={`rev-${item.id}`}
      style={{
        padding: '0.35rem 0.4rem', margin: '0 -0.4rem', borderBottom: '1px solid #21262d', borderRadius: '6px',
        background: highlighted ? 'rgba(210,153,34,0.15)' : 'transparent', transition: 'background 0.6s',
      }}
    >
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
        <input type="checkbox" checked={checked} onChange={onToggle} style={{ accentColor: '#3fb950' }} />
        {item.kind && <span style={{ fontSize: '0.72rem' }}>{KIND_ICON[item.kind]}</span>}
        <span style={{ flex: 1, fontSize: '0.85rem', color: '#e6edf3' }}>{item.title}</span>
        {checked && (
          <span style={{ fontSize: '0.68rem', whiteSpace: 'nowrap', color: !review ? '#58a6ff' : review.dueAt <= now ? '#3fb950' : '#6e7681' }}>
            {dueLabel(review, now)}
          </span>
        )}
        {!editing && <NoteButton note={note} onClick={() => setEditing(true)} />}
      </label>

      {editing ? (
        <InlineNoteEditor
          initial={note?.body ?? ''}
          status={status[item.id]}
          onChange={(body) => setNote(item.id, body)}
          onDone={finish}
        />
      ) : (
        hasNote && (
          <div
            role="button"
            tabIndex={0}
            onClick={() => setEditing(true)}
            onKeyDown={(e) => { if (e.key === 'Enter') setEditing(true); }}
            title="Click to edit"
            style={{
              margin: '0.35rem 0 0.25rem 1.6rem', padding: '0.55rem 0.7rem', borderRadius: '8px',
              border: '1px solid #30363d', background: '#0d1117', color: '#c9d1d9', fontSize: '0.8rem',
              lineHeight: 1.55, whiteSpace: 'pre-wrap', cursor: 'text',
            }}
          >
            {note!.body}
          </div>
        )
      )}
    </div>
  );
}

const STATUS_TEXT: Record<NoteStatus, string> = { saving: 'Saving…', saved: 'Saved', local: 'Saved on this device' };

// In-place note editor: grows with its content, saves as you type, and
// closes on Esc / Ctrl+Enter / clicking away.
function InlineNoteEditor({
  initial, status, onChange, onDone,
}: {
  initial: string;
  status?: NoteStatus;
  onChange: (body: string) => void;
  onDone: () => void;
}) {
  const [text, setText] = useState(initial);
  const ref = useRef<HTMLTextAreaElement>(null);

  const grow = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
    grow();
  }, []);

  return (
    <div style={{ margin: '0.35rem 0 0.25rem 1.6rem' }}>
      <textarea
        ref={ref}
        value={text}
        rows={3}
        placeholder="Key idea, pattern, edge cases, complexity, mistakes you made…"
        onChange={(e) => {
          setText(e.target.value);
          onChange(e.target.value);
          grow();
        }}
        onBlur={onDone}
        onKeyDown={(e) => {
          if (e.key === 'Escape' || (e.key === 'Enter' && (e.ctrlKey || e.metaKey))) {
            e.preventDefault();
            onDone();
          }
        }}
        style={{
          display: 'block', width: '100%', boxSizing: 'border-box', resize: 'none', overflow: 'hidden',
          padding: '0.55rem 0.7rem', borderRadius: '8px', border: '1px solid #30363d', background: '#0d1117',
          color: '#e6edf3', fontSize: '0.8rem', lineHeight: 1.55, fontFamily: 'inherit', outline: 'none',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#6e7681', marginTop: '3px' }}>
        <span>{status ? STATUS_TEXT[status] : 'Saves as you type'}</span>
        <span>Esc or click away to finish</span>
      </div>
    </div>
  );
}
