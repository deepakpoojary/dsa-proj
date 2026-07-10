'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const supabase = createClient();

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      router.push('/');
      router.refresh();
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setMessage('Check your email to confirm your account.');
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError('');
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
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
            {mode === 'signin' ? 'Log in' : 'Create account'}
          </h1>
          <p style={{ color: '#8b949e', fontSize: '0.8rem', marginTop: '4px' }}>
            DSA Answers
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          style={{
            width: '100%',
            background: '#21262d',
            color: '#e6edf3',
            border: '1px solid #30363d',
            borderRadius: '8px',
            padding: '0.6rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
            marginBottom: '1.25rem',
          }}
        >
          Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ flex: 1, height: '1px', background: '#30363d' }} />
          <span style={{ color: '#8b949e', fontSize: '0.72rem' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: '#30363d' }} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#8b949e', marginBottom: '6px' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
              style={{
                width: '100%',
                background: '#0d1117',
                border: '1px solid #30363d',
                borderRadius: '8px',
                padding: '0.6rem 0.75rem',
                color: '#e6edf3',
                fontSize: '0.875rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#8b949e', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
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
            {error && <p style={{ color: '#f85149', fontSize: '0.75rem', marginTop: '4px' }}>{error}</p>}
            {message && <p style={{ color: '#3fb950', fontSize: '0.75rem', marginTop: '4px' }}>{message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            style={{
              background: '#238636',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.65rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: loading || !email || !password ? 'not-allowed' : 'pointer',
              opacity: loading || !email || !password ? 0.6 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            {loading ? 'Please wait...' : mode === 'signin' ? 'Log in' : 'Sign up'}
          </button>
        </form>

        <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setMessage(''); }}
            style={{ background: 'none', border: 'none', color: '#58a6ff', fontSize: '0.8rem', cursor: 'pointer' }}
          >
            {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
          </button>
        </div>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <a href="/" style={{ color: '#8b949e', fontSize: '0.78rem', textDecoration: 'none' }}>
            ← Back to problems
          </a>
        </div>
      </div>
    </div>
  );
}
