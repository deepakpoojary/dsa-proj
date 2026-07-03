'use client'

import { useState, useRef, useCallback } from 'react'
import { TheoryQuestion } from '@/types/theory'

const difficultyColors: Record<string, { text: string; bg: string; border: string }> = {
  Easy: { text: '#3fb950', bg: 'rgba(63,185,80,0.1)', border: 'rgba(63,185,80,0.3)' },
  Medium: { text: '#d29922', bg: 'rgba(210,153,34,0.1)', border: 'rgba(210,153,34,0.3)' },
  Hard: { text: '#f85149', bg: 'rgba(248,81,73,0.1)', border: 'rgba(248,81,73,0.3)' },
}

const difficulties: Array<'Easy' | 'Medium' | 'Hard'> = ['Easy', 'Medium', 'Hard']

function formatAnswer(text: string) {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let bulletBuffer: string[] = []

  const flushBullets = (key: string) => {
    if (bulletBuffer.length > 0) {
      elements.push(
        <ul key={key} style={{ margin: '6px 0 6px 0', paddingLeft: '1.2rem', listStyle: 'disc' }}>
          {bulletBuffer.map((b, i) => (
            <li key={i} style={{ color: '#c9d1d9', marginBottom: '2px' }}>{b}</li>
          ))}
        </ul>
      )
      bulletBuffer = []
    }
  }

  lines.forEach((line, i) => {
    if (line.startsWith('- ')) {
      bulletBuffer.push(line.slice(2))
    } else {
      flushBullets(`b-${i}`)
      if (line === '') {
        elements.push(<br key={`br-${i}`} />)
      } else {
        elements.push(
          <p key={`p-${i}`} style={{ margin: '4px 0', color: '#c9d1d9' }}>{line}</p>
        )
      }
    }
  })
  flushBullets('end')
  return elements
}

export default function TheoryCard({
  question,
  editMode,
  topicColor,
  onUpdate,
  onDelete,
  onAddAbove,
  onAddBelow,
}: {
  question: TheoryQuestion
  editMode: boolean
  topicColor: string
  onUpdate: (updates: Partial<TheoryQuestion>) => void
  onDelete: () => void
  onAddAbove: () => void
  onAddBelow: () => void
}) {
  const [saved, setSaved] = useState(false)
  const [hoverAdd, setHoverAdd] = useState<'above' | 'below' | null>(null)
  const questionRef = useRef<HTMLTextAreaElement>(null)
  const answerRef = useRef<HTMLTextAreaElement>(null)

  const flash = useCallback(() => {
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }, [])

  const handleBlur = useCallback(
    (field: 'question' | 'answer', ref: React.RefObject<HTMLTextAreaElement | null>) => {
      const val = ref.current?.value ?? ''
      if (val !== question[field]) {
        onUpdate({ [field]: val })
        flash()
      }
    },
    [question, onUpdate, flash]
  )

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto'
    e.target.style.height = e.target.scrollHeight + 'px'
  }

  const cycleDifficulty = () => {
    if (!editMode) return
    const idx = difficulties.indexOf(question.difficulty)
    onUpdate({ difficulty: difficulties[(idx + 1) % 3] })
  }

  const dc = difficultyColors[question.difficulty]

  const AddBar = ({ pos }: { pos: 'above' | 'below' }) => (
    <div
      onClick={pos === 'above' ? onAddAbove : onAddBelow}
      onMouseEnter={() => setHoverAdd(pos)}
      onMouseLeave={() => setHoverAdd(null)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '4px 0',
        cursor: 'pointer',
        opacity: hoverAdd === pos ? 1 : 0.3,
        transition: 'opacity 0.15s',
        userSelect: 'none',
      }}
    >
      <div style={{ flex: 1, height: '1px', background: '#30363d' }} />
      <span style={{ fontSize: '0.72rem', color: '#58a6ff', whiteSpace: 'nowrap' }}>+ add question</span>
      <div style={{ flex: 1, height: '1px', background: '#30363d' }} />
    </div>
  )

  return (
    <div>
      {editMode && <AddBar pos="above" />}

      <div
        style={{
          background: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '10px',
          marginBottom: '2px',
          overflow: 'hidden',
          borderLeft: `3px solid ${topicColor}`,
          transition: 'border-color 0.15s',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '14px 16px 10px' }}>
          {editMode ? (
            <textarea
              ref={questionRef}
              defaultValue={question.question}
              onBlur={() => handleBlur('question', questionRef)}
              onChange={autoResize}
              rows={1}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid #30363d',
                color: '#e6edf3',
                fontSize: '0.92rem',
                fontWeight: 600,
                resize: 'none',
                outline: 'none',
                overflow: 'hidden',
                lineHeight: '1.5',
                fontFamily: 'inherit',
                paddingBottom: '4px',
                width: '100%',
              }}
              onFocus={(e) => {
                e.target.style.height = 'auto'
                e.target.style.height = e.target.scrollHeight + 'px'
              }}
            />
          ) : (
            <div style={{ color: '#e6edf3', fontSize: '0.92rem', fontWeight: 600, flex: 1, lineHeight: '1.5' }}>
              {question.question}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px', flexShrink: 0 }}>
            {saved && (
              <span style={{ fontSize: '0.7rem', color: '#3fb950', animation: 'fadeIn 0.2s ease' }}>✓ saved</span>
            )}
            <span
              onClick={cycleDifficulty}
              style={{
                fontSize: '0.7rem',
                padding: '2px 8px',
                borderRadius: '999px',
                border: `1px solid ${dc.border}`,
                background: dc.bg,
                color: dc.text,
                cursor: editMode ? 'pointer' : 'default',
                userSelect: 'none',
                fontWeight: 500,
              }}
            >
              {question.difficulty}
            </span>
            {editMode && (
              <button
                onClick={onDelete}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#8b949e',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  lineHeight: 1,
                  padding: '0 2px',
                  borderRadius: '4px',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#f85149')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#8b949e')}
                title="Delete question"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Answer */}
        <div style={{ padding: '0 16px 14px', borderTop: '1px solid #21262d' }}>
          <div style={{ paddingTop: '10px' }}>
            {editMode ? (
              <textarea
                ref={answerRef}
                defaultValue={question.answer}
                onBlur={() => handleBlur('answer', answerRef)}
                onChange={autoResize}
                rows={4}
                style={{
                  width: '100%',
                  background: '#0d1117',
                  border: '1px solid #30363d',
                  borderRadius: '6px',
                  color: '#c9d1d9',
                  fontSize: '0.83rem',
                  resize: 'none',
                  outline: 'none',
                  lineHeight: '1.65',
                  fontFamily: 'inherit',
                  padding: '10px 12px',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                }}
                onFocus={(e) => {
                  e.target.style.height = 'auto'
                  e.target.style.height = e.target.scrollHeight + 'px'
                }}
              />
            ) : (
              <div style={{ fontSize: '0.83rem', lineHeight: '1.7', color: '#c9d1d9' }}>
                {formatAnswer(question.answer)}
              </div>
            )}
          </div>
        </div>
      </div>

      {editMode && <AddBar pos="below" />}
    </div>
  )
}
