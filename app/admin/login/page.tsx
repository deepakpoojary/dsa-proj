'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push('/admin');
      router.refresh();
    } else {
      setError('Invalid password');
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0d1117',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '12px',
          padding: '2.5rem',
          width: '100%',
          maxWidth: '360px',
        }}
      >
        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>⚡</div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#e6edf3', margin: 0 }}>
            Admin Login
          </h1>
          <p style={{ color: '#8b949e', fontSize: '0.8rem', marginTop: '4px' }}>
            DSA Answers Admin Panel
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label
              style={{ display: 'block', fontSize: '0.8rem', color: '#8b949e', marginBottom: '6px' }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              autoFocus
              style={{
                width: '100%',
                background: '#0d1117',
                border: `1px solid ${error ? '#f85149' : '#30363d'}`,
                borderRadius: '8px',
                padding: '0.6rem 0.75rem',
                color: '#e6edf3',
                fontSize: '0.875rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {error && (
              <p style={{ color: '#f85149', fontSize: '0.75rem', marginTop: '4px' }}>{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !password}
            style={{
              background: '#238636',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.65rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: loading || !password ? 'not-allowed' : 'pointer',
              opacity: loading || !password ? 0.6 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <a href="/" style={{ color: '#8b949e', fontSize: '0.78rem', textDecoration: 'none' }}>
            ← Back to problems
          </a>
        </div>
      </div>
    </div>
  );
}
