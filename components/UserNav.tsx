'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import CheckoutButton from './CheckoutButton';

export default function UserNav({ email, hasPaid }: { email: string | null; hasPaid: boolean }) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleLogout() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  if (!email) {
    return (
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
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <span style={{
          fontSize: '0.75rem', color: '#8b949e', overflow: 'hidden',
          textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {email}
        </span>
        <button
          onClick={handleLogout}
          disabled={signingOut}
          style={{
            background: 'none', border: 'none', color: '#8b949e', fontSize: '0.72rem',
            cursor: 'pointer', flexShrink: 0, textDecoration: 'underline',
          }}
        >
          Log out
        </button>
      </div>

      {hasPaid ? (
        <div style={{
          textAlign: 'center', fontSize: '0.72rem', color: '#3fb950',
          border: '1px solid rgba(63,185,80,0.3)', background: 'rgba(63,185,80,0.08)',
          borderRadius: '8px', padding: '0.4rem',
        }}>
          ✓ Full access unlocked
        </div>
      ) : (
        <CheckoutButton />
      )}
    </div>
  );
}
