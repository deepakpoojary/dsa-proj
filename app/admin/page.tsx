'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Problem } from '@/types';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const TOPICS = ['Arrays', 'Stack', 'Linked List', 'Trees', 'Graphs', 'Dynamic Programming', 'Sliding Window', 'Two Pointers', 'Binary Search', 'Backtracking', 'Heap', 'Trie', 'Greedy'];
const LANGUAGES = ['cpp'];

const blankForm = (): Partial<Problem> => ({
  title: '',
  slug: '',
  topic: 'Arrays',
  difficulty: 'Easy',
  description: '',
  examples: [{ input: '', output: '', explanation: '' }],
  bruteForce: { explanation: '', code: '', language: 'cpp', timeComplexity: '', spaceComplexity: '' },
  optimal: { explanation: '', code: '', language: 'cpp', timeComplexity: '', spaceComplexity: '' },
});

export default function AdminPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [form, setForm] = useState<Partial<Problem>>(blankForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/problems').then((r) => r.json()).then(setProblems);
  }, []);

  function flash(text: string) {
    setMsg(text);
    setTimeout(() => setMsg(''), 3000);
  }

  function selectProblem(p: Problem) {
    setEditingId(p.id);
    setForm({ ...p });
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  function newProblem() {
    setEditingId(null);
    setForm(blankForm());
  }

  function set(key: string, value: unknown) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setBrute(key: string, value: string) {
    setForm((prev) => ({
      ...prev,
      bruteForce: { ...(prev.bruteForce as Problem['bruteForce']), [key]: value },
    }));
  }

  function setOptimal(key: string, value: string) {
    setForm((prev) => ({
      ...prev,
      optimal: { ...(prev.optimal as Problem['optimal']), [key]: value },
    }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const slug = form.title!.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const payload = { ...form, slug };

    if (editingId) {
      await fetch(`/api/problems/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      flash('Problem updated!');
    } else {
      const id = String(Date.now());
      await fetch('/api/problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, id, createdAt: new Date().toISOString().split('T')[0] }),
      });
      flash('Problem added!');
    }

    const updated = await fetch('/api/problems').then((r) => r.json());
    setProblems(updated);
    setSaving(false);
    newProblem();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/problems/${id}`, { method: 'DELETE' });
    setProblems((prev) => prev.filter((p) => p.id !== id));
    if (editingId === id) newProblem();
    flash('Problem deleted.');
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#0d1117',
    border: '1px solid #30363d',
    borderRadius: '8px',
    padding: '0.55rem 0.75rem',
    color: '#e6edf3',
    fontSize: '0.875rem',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.75rem',
    color: '#8b949e',
    marginBottom: '5px',
    fontWeight: 500,
  };

  const sectionStyle: React.CSSProperties = {
    background: '#0d1117',
    border: '1px solid #30363d',
    borderRadius: '10px',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', color: '#e6edf3' }}>
      {/* Top bar */}
      <div
        style={{
          background: '#161b22',
          borderBottom: '1px solid #30363d',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a href="/" style={{ color: '#8b949e', textDecoration: 'none', fontSize: '0.8rem' }}>
            ← DSA Answers
          </a>
          <span style={{ color: '#30363d' }}>|</span>
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Admin Panel</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {msg && (
            <span style={{ color: '#3fb950', fontSize: '0.8rem', fontWeight: 500 }}>{msg}</span>
          )}
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: '1px solid #30363d',
              borderRadius: '6px',
              padding: '0.35rem 0.75rem',
              color: '#8b949e',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', height: 'calc(100vh - 49px)' }}>
        {/* Sidebar — problem list */}
        <aside
          style={{
            width: '260px',
            flexShrink: 0,
            borderRight: '1px solid #30363d',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ padding: '1rem', borderBottom: '1px solid #30363d' }}>
            <button
              onClick={newProblem}
              style={{
                width: '100%',
                background: '#238636',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.55rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              + New Problem
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {problems.map((p) => (
              <div
                key={p.id}
                onClick={() => selectProblem(p)}
                style={{
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid #21262d',
                  cursor: 'pointer',
                  background: editingId === p.id ? '#161b22' : 'transparent',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                }}
                onMouseEnter={(e) => {
                  if (editingId !== p.id)
                    (e.currentTarget as HTMLElement).style.background = '#0d1117';
                }}
                onMouseLeave={(e) => {
                  if (editingId !== p.id)
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 500, color: '#e6edf3' }}>
                    {p.title}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#8b949e', marginTop: '2px' }}>
                    {p.topic}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      color:
                        p.difficulty === 'Easy'
                          ? '#3fb950'
                          : p.difficulty === 'Medium'
                          ? '#d29922'
                          : '#f85149',
                      fontWeight: 600,
                    }}
                  >
                    {p.difficulty[0]}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete "${p.title}"?`)) handleDelete(p.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#8b949e',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      padding: '2px 4px',
                      borderRadius: '4px',
                    }}
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Form */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>
          <div ref={formRef}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              {editingId ? 'Edit Problem' : 'Add New Problem'}
            </h2>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Row 1: Title + Topic + Difficulty */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>Title *</label>
                  <input
                    style={inputStyle}
                    value={form.title || ''}
                    onChange={(e) => set('title', e.target.value)}
                    placeholder="e.g. Two Sum"
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Topic *</label>
                  <select
                    style={inputStyle}
                    value={form.topic || 'Arrays'}
                    onChange={(e) => set('topic', e.target.value)}
                  >
                    {TOPICS.map((t) => (
                      <option key={t} value={t} style={{ background: '#161b22' }}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Difficulty *</label>
                  <select
                    style={inputStyle}
                    value={form.difficulty || 'Easy'}
                    onChange={(e) => set('difficulty', e.target.value as Problem['difficulty'])}
                  >
                    <option value="Easy" style={{ background: '#161b22' }}>Easy</option>
                    <option value="Medium" style={{ background: '#161b22' }}>Medium</option>
                    <option value="Hard" style={{ background: '#161b22' }}>Hard</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>Description *</label>
                <textarea
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
                  value={form.description || ''}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Problem description..."
                  required
                />
              </div>

              {/* Examples */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={labelStyle}>Input / Output Examples</label>
                  <button
                    type="button"
                    onClick={() => set('examples', [...(form.examples || []), { input: '', output: '', explanation: '' }])}
                    style={{ background: 'none', border: '1px solid #30363d', borderRadius: '6px', color: '#58a6ff', fontSize: '0.75rem', padding: '2px 8px', cursor: 'pointer' }}
                  >
                    + Add
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {(form.examples || []).map((ex, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'start' }}>
                      <div>
                        <label style={{ ...labelStyle, marginBottom: 3 }}>Input</label>
                        <input
                          style={inputStyle}
                          value={ex.input}
                          onChange={(e) => {
                            const updated = [...(form.examples || [])];
                            updated[i] = { ...updated[i], input: e.target.value };
                            set('examples', updated);
                          }}
                          placeholder="nums = [2,7], target = 9"
                        />
                      </div>
                      <div>
                        <label style={{ ...labelStyle, marginBottom: 3 }}>Output</label>
                        <input
                          style={inputStyle}
                          value={ex.output}
                          onChange={(e) => {
                            const updated = [...(form.examples || [])];
                            updated[i] = { ...updated[i], output: e.target.value };
                            set('examples', updated);
                          }}
                          placeholder="[0, 1]"
                        />
                      </div>
                      <div>
                        <label style={{ ...labelStyle, marginBottom: 3 }}>Explanation (optional)</label>
                        <input
                          style={inputStyle}
                          value={ex.explanation || ''}
                          onChange={(e) => {
                            const updated = [...(form.examples || [])];
                            updated[i] = { ...updated[i], explanation: e.target.value };
                            set('examples', updated);
                          }}
                          placeholder="nums[0] + nums[1] = 9"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => set('examples', (form.examples || []).filter((_, j) => j !== i))}
                        style={{ background: 'none', border: 'none', color: '#f85149', cursor: 'pointer', fontSize: '0.85rem', marginTop: '20px' }}
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Language — C++ only */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <label style={{ ...labelStyle, margin: 0 }}>Language:</label>
                <span style={{ fontSize: '0.875rem', color: '#58a6ff', background: '#58a6ff18', border: '1px solid #58a6ff30', borderRadius: '6px', padding: '3px 10px' }}>
                  C++
                </span>
              </div>

              {/* Brute Force Section */}
              <div style={sectionStyle}>
                <div style={{ fontWeight: 600, color: '#f85149', fontSize: '0.85rem' }}>
                  Brute Force
                </div>
                <div>
                  <label style={labelStyle}>Explanation</label>
                  <textarea
                    style={{ ...inputStyle, resize: 'vertical', minHeight: '60px' }}
                    value={form.bruteForce?.explanation || ''}
                    onChange={(e) => setBrute('explanation', e.target.value)}
                    placeholder="How does the brute force work?"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Code</label>
                  <div
                    style={{
                      border: '1px solid #30363d',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      height: '240px',
                    }}
                  >
                    <MonacoEditor
                      height="240px"
                      language={form.bruteForce?.language || 'python'}
                      theme="vs-dark"
                      value={form.bruteForce?.code || ''}
                      onChange={(v) => setBrute('code', v || '')}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        lineNumbers: 'on',
                        wordWrap: 'on',
                        scrollBeyondLastLine: false,
                        padding: { top: 8 },
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={labelStyle}>Time Complexity</label>
                    <input
                      style={inputStyle}
                      value={form.bruteForce?.timeComplexity || ''}
                      onChange={(e) => setBrute('timeComplexity', e.target.value)}
                      placeholder="e.g. O(n²)"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Space Complexity</label>
                    <input
                      style={inputStyle}
                      value={form.bruteForce?.spaceComplexity || ''}
                      onChange={(e) => setBrute('spaceComplexity', e.target.value)}
                      placeholder="e.g. O(1)"
                    />
                  </div>
                </div>
              </div>

              {/* Optimal Section */}
              <div style={sectionStyle}>
                <div style={{ fontWeight: 600, color: '#3fb950', fontSize: '0.85rem' }}>
                  ✦ Optimal
                </div>
                <div>
                  <label style={labelStyle}>Explanation</label>
                  <textarea
                    style={{ ...inputStyle, resize: 'vertical', minHeight: '60px' }}
                    value={form.optimal?.explanation || ''}
                    onChange={(e) => setOptimal('explanation', e.target.value)}
                    placeholder="How does the optimal solution work?"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Code</label>
                  <div
                    style={{
                      border: '1px solid #30363d',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      height: '240px',
                    }}
                  >
                    <MonacoEditor
                      height="240px"
                      language={form.optimal?.language || 'python'}
                      theme="vs-dark"
                      value={form.optimal?.code || ''}
                      onChange={(v) => setOptimal('code', v || '')}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        lineNumbers: 'on',
                        wordWrap: 'on',
                        scrollBeyondLastLine: false,
                        padding: { top: 8 },
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={labelStyle}>Time Complexity</label>
                    <input
                      style={inputStyle}
                      value={form.optimal?.timeComplexity || ''}
                      onChange={(e) => setOptimal('timeComplexity', e.target.value)}
                      placeholder="e.g. O(n)"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Space Complexity</label>
                    <input
                      style={inputStyle}
                      value={form.optimal?.spaceComplexity || ''}
                      onChange={(e) => setOptimal('spaceComplexity', e.target.value)}
                      placeholder="e.g. O(n)"
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    background: '#238636',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.65rem 2rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? 'Saving...' : editingId ? 'Update Problem' : 'Add Problem'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={newProblem}
                    style={{
                      background: 'none',
                      color: '#8b949e',
                      border: '1px solid #30363d',
                      borderRadius: '8px',
                      padding: '0.65rem 1.25rem',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
