'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TheoryData, TheoryQuestion, rewardForTheory } from '@/types/theory'
import { createClient } from '@/lib/supabase/client'
import TheoryCard from './TheoryCard'
import SiteNav from './SiteNav'
import StudyList, { arrange, ModeToggle, SortToggle, useListMode } from './StudyList'
import { StarFilter } from './Stars'
import { NotesCtx, useNoteHost } from './Notes'
import { theoryItems, StudyItem, StudyTopic } from '@/lib/study-items'
import { useChecklist } from '@/lib/use-checklist'

const BANK_OFF_KEY = 'theory:bank-topics-off'
const PREFS_KEY = 'theory:prefs'

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div
      onClick={onChange}
      style={{
        width: '36px',
        height: '20px',
        borderRadius: '999px',
        background: checked ? '#238636' : '#30363d',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.2s',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          background: '#fff',
          position: 'absolute',
          top: '3px',
          left: checked ? '19px' : '3px',
          transition: 'left 0.2s',
        }}
      />
    </div>
  )
}

function topicId(key: string) {
  return `theory-${key.toLowerCase()}`
}

export default function TheoryView({
  data: initialData,
  email,
  isAdmin,
  startingBalance,
  otherDomainEarned,
  otherDomainEarnedToday,
  bankTopics,
  bankItems,
}: {
  bankTopics: StudyTopic[]
  bankItems: StudyItem[]
  data: TheoryData
  email: string | null
  isAdmin: boolean
  startingBalance: number
  otherDomainEarned: number
  otherDomainEarnedToday: number
}) {
  const router = useRouter()
  const [data, setData] = useState<TheoryData>(initialData)
  const [editMode, setEditMode] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [mode, setMode] = useListMode()
  const [minStars, setMinStars] = useState(0)
  const [sort, setSort] = useState<'order' | 'stars'>('order')
  const [bankOff, setBankOff] = useState<Set<string>>(new Set())
  const { checked, setMany } = useChecklist(!!email)
  const noteHost = useNoteHost(!!email)

  useEffect(() => {
    try {
      const off = JSON.parse(localStorage.getItem(BANK_OFF_KEY) ?? '[]') as string[]
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBankOff(new Set(off))
      const prefs = JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}') as { minStars?: number; sort?: 'order' | 'stars' }
      if (typeof prefs.minStars === 'number') setMinStars(prefs.minStars)
      if (prefs.sort === 'stars' || prefs.sort === 'order') setSort(prefs.sort)
    } catch {
      // ignore
    }
  }, [])

  const savePrefs = (next: { minStars?: number; sort?: 'order' | 'stars' }) => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({ minStars, sort, ...next }))
    } catch {
      // ignore
    }
  }

  const handleLogout = async () => {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/theory')
    router.refresh()
  }

  const handleToggleSolved = useCallback((questionId: string, solved: boolean) => {
    setData((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId ? { ...q, solved, solvedToday: solved ? true : q.solvedToday } : q
      ),
    }))
    fetch('/api/theory-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId, solved }),
    }).catch(() => {
      setData((prev) => ({
        ...prev,
        questions: prev.questions.map((q) => (q.id === questionId ? { ...q, solved: !solved } : q)),
      }))
    })
  }, [])

  const totalEarned = useMemo(
    () => data.questions.filter((q) => q.solved).reduce((sum, q) => sum + rewardForTheory(q), 0),
    [data.questions]
  )

  const earnedTodayFromTheory = useMemo(
    () => data.questions.filter((q) => q.solved && q.solvedToday).reduce((sum, q) => sum + rewardForTheory(q), 0),
    [data.questions]
  )

  const earnedToday = earnedTodayFromTheory + otherDomainEarnedToday
  const netWorth = startingBalance + totalEarned + otherDomainEarned

  // DB topics (OS, OOPs, CN, DBMS, SQL) + the static banks (JS, Node, TS, DevOps).
  const allTopics = useMemo<Record<string, StudyTopic>>(() => {
    const out: Record<string, StudyTopic> = {}
    for (const [k, t] of Object.entries(data.topics)) out[k] = { key: k, label: t.label, color: t.color, source: 'db', enabled: t.enabled }
    for (const t of bankTopics) out[t.key] = { ...t, enabled: !bankOff.has(t.key) }
    return out
  }, [data.topics, bankTopics, bankOff])

  const topicEntries = Object.entries(allTopics)
  const enabledKeys = topicEntries.filter(([, t]) => t.enabled).map(([k]) => k)

  const itemsByTopic = useMemo(() => {
    const all = [...theoryItems(data.questions), ...bankItems]
    return all.reduce<Record<string, StudyItem[]>>((acc, it) => {
      ;(acc[it.topic] ??= []).push(it)
      return acc
    }, {})
  }, [data.questions, bankItems])

  const isDone = useCallback(
    (it: StudyItem) => (it.progress.kind === 'checklist' ? checked.has(it.progress.id) : !!it.theory?.solved),
    [checked]
  )

  const onToggleItem = useCallback(
    (it: StudyItem, done: boolean) => {
      if (it.progress.kind === 'checklist') setMany([it.progress.id], done)
      else if (it.progress.kind === 'theory') handleToggleSolved(it.progress.id, done)
    },
    [setMany, handleToggleSolved]
  )

  const toggleTopic = async (key: string) => {
    if (allTopics[key]?.source === 'bank') {
      setBankOff((prev) => {
        const next = new Set(prev)
        if (next.has(key)) next.delete(key)
        else next.add(key)
        try {
          localStorage.setItem(BANK_OFF_KEY, JSON.stringify([...next]))
        } catch {
          // ignore
        }
        return next
      })
      return
    }
    const newEnabled = !data.topics[key].enabled
    setData((prev) => ({
      ...prev,
      topics: { ...prev.topics, [key]: { ...prev.topics[key], enabled: newEnabled } },
    }))
    await fetch('/api/theory/topics', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: key, enabled: newEnabled }),
    })
  }

  const addQuestion = useCallback(async (topic: string, afterId?: string, before?: boolean) => {
    const res = await fetch('/api/theory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, afterId, before }),
    })
    const newQ: TheoryQuestion = await res.json()

    setData((prev) => {
      const qs = [...prev.questions]
      if (afterId) {
        const idx = qs.findIndex((q) => q.id === afterId)
        qs.splice(before ? idx : idx + 1, 0, newQ)
      } else {
        const lastIdx = qs.reduce((last, q, i) => (q.topic === topic ? i : last), -1)
        qs.splice(lastIdx + 1, 0, newQ)
      }
      return { ...prev, questions: qs }
    })
  }, [])

  const updateQuestion = useCallback(async (id: string, updates: Partial<TheoryQuestion>) => {
    setData((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === id ? { ...q, ...updates } : q)),
    }))
    await fetch(`/api/theory/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
  }, [])

  const deleteQuestion = useCallback(async (id: string) => {
    setData((prev) => ({ ...prev, questions: prev.questions.filter((q) => q.id !== id) }))
    await fetch(`/api/theory/${id}`, { method: 'DELETE' })
  }, [])

  const totalEnabled = enabledKeys.reduce((sum, k) => sum + (itemsByTopic[k]?.length ?? 0), 0)

  return (
    <NotesCtx.Provider value={noteHost.value}>
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0d1117' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: '220px',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
          borderRight: '1px solid #21262d',
          background: '#0d1117',
          padding: '1.5rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        {/* Logo */}
        <div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#e6edf3' }}>Theory Q&A</div>
          <div style={{ fontSize: '0.72rem', color: '#8b949e', marginTop: '2px' }}>
            {totalEnabled} questions
          </div>
        </div>

        <SiteNav variant="sidebar" />

        {/* Earned today */}
        <div
          style={{
            padding: '10px 12px',
            borderRadius: '8px',
            background: 'rgba(88,166,255,0.08)',
            border: '1px solid rgba(88,166,255,0.3)',
          }}
        >
          <div style={{ fontSize: '0.68rem', color: '#8b949e', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Earned Today
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#58a6ff' }}>
            ₹{earnedToday.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Net worth */}
        <a
          href="/net-worth"
          style={{
            display: 'block',
            padding: '10px 12px',
            borderRadius: '8px',
            textDecoration: 'none',
            background: netWorth < 0 ? 'rgba(248,81,73,0.08)' : 'rgba(63,185,80,0.08)',
            border: `1px solid ${netWorth < 0 ? 'rgba(248,81,73,0.3)' : 'rgba(63,185,80,0.3)'}`,
          }}
        >
          <div style={{ fontSize: '0.68rem', color: '#8b949e', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Net Worth
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: netWorth < 0 ? '#f85149' : '#3fb950' }}>
            {netWorth < 0 ? '-' : ''}₹{Math.abs(Math.round(netWorth)).toLocaleString('en-IN')}
          </div>
        </a>

        {/* Total earned counter */}
        <div
          style={{
            padding: '10px 12px',
            borderRadius: '8px',
            background: 'rgba(63,185,80,0.08)',
            border: '1px solid rgba(63,185,80,0.3)',
          }}
        >
          <div style={{ fontSize: '0.68rem', color: '#8b949e', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Total Earned
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#3fb950' }}>
            ₹{totalEarned.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Auth / account */}
        {email ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#8b949e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {email}
            </span>
            <button
              onClick={handleLogout}
              disabled={signingOut}
              style={{ background: 'none', border: 'none', color: '#8b949e', fontSize: '0.72rem', cursor: 'pointer', flexShrink: 0, textDecoration: 'underline' }}
            >
              Log out
            </button>
          </div>
        ) : (
          <a
            href="/login"
            style={{
              display: 'block', textAlign: 'center', padding: '0.45rem', borderRadius: '8px',
              border: '1px solid #30363d', color: '#e6edf3', fontSize: '0.78rem',
              textDecoration: 'none', background: '#21262d',
            }}
          >
            Log in
          </a>
        )}

        {/* Edit mode — admin only */}
        {isAdmin && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 10px',
            borderRadius: '8px',
            background: editMode ? 'rgba(88,166,255,0.08)' : '#161b22',
            border: `1px solid ${editMode ? 'rgba(88,166,255,0.3)' : '#30363d'}`,
            transition: 'all 0.2s',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: editMode ? '#58a6ff' : '#8b949e', fontWeight: 500 }}>
            ✏ Edit Mode
          </span>
          <Toggle checked={editMode} onChange={() => setEditMode((e) => !e)} />
        </div>
        )}

        {/* Topic toggles */}
        <div>
          <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            Topics
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {topicEntries.map(([key, topic]) => {
              const count = itemsByTopic[key]?.length ?? 0
              return (
                <div key={key}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      background: topic.enabled ? 'transparent' : 'transparent',
                    }}
                  >
                    <a
                      href={topic.enabled ? `#${topicId(key)}` : undefined}
                      style={{
                        fontSize: '0.8rem',
                        color: topic.enabled ? '#e6edf3' : '#4a5568',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          background: topic.enabled ? topic.color : '#30363d',
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {topic.label}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: '#8b949e', flexShrink: 0 }}>{count}</span>
                    </a>
                    <Toggle checked={!!topic.enabled} onChange={() => toggleTopic(key)} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #21262d' }}>
          <a
            href="/admin"
            style={{
              display: 'block',
              textAlign: 'center',
              padding: '0.4rem',
              borderRadius: '8px',
              border: '1px solid #30363d',
              color: '#8b949e',
              fontSize: '0.75rem',
              textDecoration: 'none',
              transition: 'color 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.color = '#e6edf3'
              el.style.borderColor = '#8b949e'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.color = '#8b949e'
              el.style.borderColor = '#30363d'
            }}
          >
            ⚙ Admin
          </a>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '2rem 2.5rem 4rem', maxWidth: 'calc(100% - 220px)', overflowX: 'hidden' }}>
        <div style={{ marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid #21262d' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#e6edf3', margin: 0 }}>
            Interview Theory Q&A
          </h1>
          <p style={{ color: '#8b949e', fontSize: '0.85rem', margin: '4px 0 0' }}>
            OS · OOPs · CN · DBMS · SQL · JavaScript · Node.js · TypeScript · DevOps — every question rated ★1–5 for interview importance
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', marginTop: '0.9rem' }}>
            <ModeToggle mode={mode} onChange={setMode} />
            <StarFilter value={minStars} onChange={(n) => { setMinStars(n); savePrefs({ minStars: n }) }} />
            <SortToggle value={sort} onChange={(v) => { setSort(v); savePrefs({ sort: v }) }} />
            <a href="/search" style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#58a6ff', textDecoration: 'none' }}>🔎 Search everything →</a>
          </div>
          {editMode && mode === 'notes' && (
            <div style={{ fontSize: '0.72rem', color: '#d29922', marginTop: '0.5rem' }}>
              Edit mode shows the editable Q&A cards for database questions.
            </div>
          )}
        </div>

        {enabledKeys.length === 0 && (
          <div style={{ textAlign: 'center', color: '#8b949e', padding: '4rem 0' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>¯\_(ツ)_/¯</div>
            <div>All topics are disabled. Enable at least one from the sidebar.</div>
          </div>
        )}

        {enabledKeys.map((key) => {
          const topic = allTopics[key]
          const all = itemsByTopic[key] ?? []
          const qs = arrange(all, minStars, sort)
          const revised = all.filter(isDone).length
          const isDb = topic.source === 'db'

          return (
            <section key={key} id={topicId(key)} style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: topic.color, flexShrink: 0 }} />
                <h2 style={{ fontSize: '0.82rem', fontWeight: 700, color: topic.color, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                  {topic.label}
                </h2>
                <div style={{ flex: 1, height: '1px', background: '#21262d' }} />
                <span style={{ fontSize: '0.72rem', color: '#8b949e' }}>
                  {revised}/{all.length} revised{qs.length !== all.length ? ` · showing ${qs.length}` : ''}
                </span>
                {editMode && isDb && (
                  <button
                    onClick={() => addQuestion(key)}
                    style={{
                      background: 'rgba(88,166,255,0.1)', border: '1px solid rgba(88,166,255,0.3)', borderRadius: '6px',
                      color: '#58a6ff', fontSize: '0.72rem', padding: '2px 10px', cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    + Add
                  </button>
                )}
              </div>

              {qs.length === 0 ? (
                <div style={{ color: '#8b949e', fontSize: '0.82rem', padding: '1rem 0' }}>
                  {all.length === 0 ? 'No questions yet. ' : 'No questions at this importance level.'}
                  {editMode && isDb && all.length === 0 && (
                    <span onClick={() => addQuestion(key)} style={{ color: '#58a6ff', cursor: 'pointer' }}>Add one →</span>
                  )}
                </div>
              ) : (
                <StudyList
                  items={qs}
                  topics={allTopics}
                  mode={editMode && isAdmin && isDb ? 'inline' : mode}
                  isDone={isDone}
                  onToggle={onToggleItem}
                  canTrack={!!email}
                  showGroups={sort === 'order'}
                  renderInline={(it) => {
                    const q = it.theory
                    if (!q) return null
                    return (
                      <TheoryCard
                        question={q}
                        stars={it.stars}
                        editMode={editMode && isAdmin}
                        topicColor={topic.color}
                        canTrackProgress={!!email}
                        onUpdate={(updates) => updateQuestion(q.id, updates)}
                        onDelete={() => deleteQuestion(q.id)}
                        onAddAbove={() => addQuestion(key, q.id, true)}
                        onAddBelow={() => addQuestion(key, q.id, false)}
                        onToggleSolved={handleToggleSolved}
                      />
                    )
                  }}
                />
              )}
            </section>
          )
        })}
      </main>
      {noteHost.modal}
    </div>
    </NotesCtx.Provider>
  )
}
