'use client'

import { useState, useCallback } from 'react'
import { TheoryData, TheoryQuestion } from '@/types/theory'
import TheoryCard from './TheoryCard'

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

export default function TheoryView({ data: initialData }: { data: TheoryData }) {
  const [data, setData] = useState<TheoryData>(initialData)
  const [editMode, setEditMode] = useState(true)

  const topicEntries = Object.entries(data.topics)
  const enabledKeys = topicEntries.filter(([, t]) => t.enabled).map(([k]) => k)

  const questionsByTopic = data.questions.reduce<Record<string, TheoryQuestion[]>>((acc, q) => {
    if (!acc[q.topic]) acc[q.topic] = []
    acc[q.topic].push(q)
    return acc
  }, {})

  const toggleTopic = async (key: string) => {
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

  const totalEnabled = enabledKeys.reduce((sum, k) => sum + (questionsByTopic[k]?.length ?? 0), 0)

  return (
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

        {/* Nav */}
        <a
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem',
            color: '#8b949e',
            textDecoration: 'none',
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#e6edf3')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#8b949e')}
        >
          ← DSA Problems
        </a>

        {/* Edit mode */}
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

        {/* Topic toggles */}
        <div>
          <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            Topics
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {topicEntries.map(([key, topic]) => {
              const count = questionsByTopic[key]?.length ?? 0
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
                    <Toggle checked={topic.enabled} onChange={() => toggleTopic(key)} />
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
        <div style={{ marginBottom: '2rem', paddingBottom: '1.25rem', borderBottom: '1px solid #21262d' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#e6edf3', margin: 0 }}>
            Interview Theory Q&A
          </h1>
          <p style={{ color: '#8b949e', fontSize: '0.85rem', marginTop: '4px', margin: '4px 0 0' }}>
            OS · OOPs · Computer Networks · DBMS · SQL — in-depth answers
          </p>
        </div>

        {enabledKeys.length === 0 && (
          <div style={{ textAlign: 'center', color: '#8b949e', padding: '4rem 0' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>¯\_(ツ)_/¯</div>
            <div>All topics are disabled. Enable at least one from the sidebar.</div>
          </div>
        )}

        {enabledKeys.map((key) => {
          const topic = data.topics[key]
          const qs = questionsByTopic[key] ?? []

          return (
            <section key={key} id={topicId(key)} style={{ marginBottom: '3rem' }}>
              {/* Topic header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: topic.color, flexShrink: 0 }} />
                <h2 style={{ fontSize: '0.82rem', fontWeight: 700, color: topic.color, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                  {topic.label}
                </h2>
                <div style={{ flex: 1, height: '1px', background: '#21262d' }} />
                <span style={{ fontSize: '0.72rem', color: '#8b949e' }}>{qs.length}</span>
                {editMode && (
                  <button
                    onClick={() => addQuestion(key)}
                    style={{
                      background: 'rgba(88,166,255,0.1)',
                      border: '1px solid rgba(88,166,255,0.3)',
                      borderRadius: '6px',
                      color: '#58a6ff',
                      fontSize: '0.72rem',
                      padding: '2px 10px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    + Add
                  </button>
                )}
              </div>

              {/* Questions */}
              {qs.length === 0 ? (
                <div style={{ color: '#8b949e', fontSize: '0.82rem', padding: '1rem 0' }}>
                  No questions yet.{' '}
                  {editMode && (
                    <span
                      onClick={() => addQuestion(key)}
                      style={{ color: '#58a6ff', cursor: 'pointer' }}
                    >
                      Add one →
                    </span>
                  )}
                </div>
              ) : (
                <div>
                  {qs.map((q) => (
                    <TheoryCard
                      key={q.id}
                      question={q}
                      editMode={editMode}
                      topicColor={topic.color}
                      onUpdate={(updates) => updateQuestion(q.id, updates)}
                      onDelete={() => deleteQuestion(q.id)}
                      onAddAbove={() => addQuestion(key, q.id, true)}
                      onAddBelow={() => addQuestion(key, q.id, false)}
                    />
                  ))}
                </div>
              )}
            </section>
          )
        })}
      </main>
    </div>
  )
}
