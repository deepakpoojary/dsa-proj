'use client';

import { useCallback, useMemo, useState } from 'react';
import { UserFinance, EarningsBreakdown } from '@/lib/finance';

function formatInr(n: number) {
  const sign = n < 0 ? '-' : '';
  return `${sign}₹${Math.abs(Math.round(n)).toLocaleString('en-IN')}`;
}

export default function NetWorthDashboard({
  finance,
  totalEarned,
  earnings,
}: {
  finance: UserFinance;
  totalEarned: number;
  earnings: EarningsBreakdown;
}) {
  const [startingBalance, setStartingBalance] = useState(finance.startingBalance);
  const [targetAmount, setTargetAmount] = useState(finance.targetAmount);
  const [targetDays, setTargetDays] = useState(finance.targetDays);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  const currentNetWorth = startingBalance + totalEarned;
  const remaining = targetAmount - currentNetWorth;
  const perDay = remaining > 0 ? remaining / targetDays : 0;
  const reached = remaining <= 0;

  const progress = useMemo(() => {
    const span = targetAmount - startingBalance;
    if (span <= 0) return 1;
    return Math.min(1, Math.max(0, (currentNetWorth - startingBalance) / span));
  }, [currentNetWorth, startingBalance, targetAmount]);

  // Saves immediately (no debounce) so a quick navigation away right after
  // typing can't cancel a pending save before it's ever sent.
  const commitSave = useCallback(
    async (next: { startingBalance: number; targetAmount: number; targetDays: number }) => {
      try {
        const res = await fetch('/api/finance', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(next),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setSaveError(body.error || 'Failed to save — try again.');
          return;
        }
        setSaveError('');
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      } catch {
        setSaveError('Failed to save — check your connection.');
      }
    },
    []
  );

  const handleStartingBalanceBlur = () => commitSave({ startingBalance, targetAmount, targetDays });
  const handleTargetAmountBlur = () => commitSave({ startingBalance, targetAmount, targetDays });
  const handleTargetDaysCommit = () => commitSave({ startingBalance, targetAmount, targetDays });

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', padding: '2rem 1.5rem 4rem' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <a
          href="/"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px', marginBottom: '1.5rem',
            fontSize: '0.8rem', color: '#8b949e', textDecoration: 'none',
          }}
        >
          ← Back
        </a>

        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#e6edf3', margin: 0 }}>
          💰 Net Worth Dashboard
        </h1>
        <p style={{ color: '#8b949e', fontSize: '0.85rem', marginTop: '4px' }}>
          Every solved problem chips away at the target below.
        </p>

        {/* Net worth hero */}
        <div
          style={{
            marginTop: '1.5rem', padding: '1.5rem', borderRadius: '12px',
            background: '#161b22', border: '1px solid #30363d', textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '0.72rem', color: '#8b949e', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Current Net Worth
          </div>
          <div
            style={{
              fontSize: '2.4rem', fontWeight: 800, marginTop: '4px',
              color: currentNetWorth < 0 ? '#f85149' : '#3fb950',
            }}
          >
            {formatInr(currentNetWorth)}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#8b949e', marginTop: '6px' }}>
            Earned so far: <span style={{ color: '#3fb950', fontWeight: 600 }}>+{formatInr(totalEarned)}</span>
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: '1.25rem' }}>
            <div style={{ height: '10px', borderRadius: '999px', background: '#0d1117', border: '1px solid #30363d', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%', width: `${progress * 100}%`,
                  background: reached ? '#3fb950' : '#58a6ff', transition: 'width 0.3s',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#8b949e', marginTop: '4px' }}>
              <span>{formatInr(startingBalance)}</span>
              <span>{formatInr(targetAmount)}</span>
            </div>
          </div>
        </div>

        {/* Earnings breakdown */}
        <div
          style={{
            marginTop: '1.25rem', padding: '1.25rem', borderRadius: '12px',
            background: '#161b22', border: '1px solid #30363d',
          }}
        >
          <div style={{ fontSize: '0.72rem', color: '#8b949e', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.9rem' }}>
            Earnings
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {[
              { label: 'This Week', value: earnings.week },
              { label: 'This Month', value: earnings.month },
              { label: 'This Year', value: earnings.year },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  padding: '0.85rem 0.5rem', borderRadius: '10px',
                  background: '#0d1117', border: '1px solid #30363d', textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#3fb950', whiteSpace: 'nowrap' }}>
                  +{formatInr(value)}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#8b949e', marginTop: '3px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Goal message */}
        <div
          style={{
            marginTop: '1.25rem', padding: '1.25rem', borderRadius: '12px',
            background: reached ? 'rgba(63,185,80,0.08)' : 'rgba(210,153,34,0.08)',
            border: `1px solid ${reached ? 'rgba(63,185,80,0.3)' : 'rgba(210,153,34,0.3)'}`,
            textAlign: 'center',
          }}
        >
          {reached ? (
            <div style={{ color: '#3fb950', fontWeight: 700, fontSize: '1.05rem' }}>
              🎉 Target reached! Set a new one below.
            </div>
          ) : (
            <div style={{ color: '#d29922', fontSize: '1rem' }}>
              You need to earn <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>{formatInr(perDay)}</span> / day
              for the next <span style={{ fontWeight: 700 }}>{targetDays}</span> days to hit your target.
            </div>
          )}
        </div>

        {/* Settings */}
        <div
          style={{
            marginTop: '1.25rem', padding: '1.5rem', borderRadius: '12px',
            background: '#161b22', border: '1px solid #30363d', display: 'flex', flexDirection: 'column', gap: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e6edf3' }}>Settings</span>
            {saved && <span style={{ fontSize: '0.72rem', color: '#3fb950' }}>✓ saved</span>}
            {saveError && <span style={{ fontSize: '0.72rem', color: '#f85149' }}>{saveError}</span>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#8b949e', marginBottom: '6px' }}>
              Starting balance (e.g. existing debt — use a negative number)
            </label>
            <input
              type="number"
              value={startingBalance}
              onChange={(e) => setStartingBalance(Number(e.target.value))}
              onBlur={handleStartingBalanceBlur}
              style={{
                width: '100%', background: '#0d1117', border: '1px solid #30363d', borderRadius: '8px',
                padding: '0.5rem 0.75rem', color: '#e6edf3', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#8b949e', marginBottom: '6px' }}>
              Target net worth
            </label>
            <input
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(Number(e.target.value))}
              onBlur={handleTargetAmountBlur}
              style={{
                width: '100%', background: '#0d1117', border: '1px solid #30363d', borderRadius: '8px',
                padding: '0.5rem 0.75rem', color: '#e6edf3', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#8b949e', marginBottom: '6px' }}>
              <span>Days to reach target</span>
              <span style={{ color: '#e6edf3', fontWeight: 600 }}>{targetDays} days</span>
            </label>
            <input
              type="range"
              min={1}
              max={1000}
              value={targetDays}
              onChange={(e) => setTargetDays(Number(e.target.value))}
              onMouseUp={handleTargetDaysCommit}
              onTouchEnd={handleTargetDaysCommit}
              onKeyUp={handleTargetDaysCommit}
              onBlur={handleTargetDaysCommit}
              style={{ width: '100%', accentColor: '#238636' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
