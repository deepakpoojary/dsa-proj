// Read-only 1–5 star interview-importance badge.
export default function Stars({ value, size = '0.72rem' }: { value: number; size?: string }) {
  const n = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <span
      title={`Interview importance: ${n}/5`}
      aria-label={`Interview importance ${n} of 5`}
      style={{ fontSize: size, letterSpacing: '-0.5px', whiteSpace: 'nowrap', flexShrink: 0, lineHeight: 1 }}
    >
      <span style={{ color: '#e3b341' }}>{'★'.repeat(n)}</span>
      <span style={{ color: '#30363d' }}>{'★'.repeat(5 - n)}</span>
    </span>
  );
}

// Compact "min stars" picker: All · ★2+ · ★3+ · ★4+ · ★5
export function StarFilter({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const opts = [0, 2, 3, 4, 5];
  return (
    <div style={{ display: 'inline-flex', gap: '2px', border: '1px solid #30363d', borderRadius: '8px', padding: '2px' }}>
      {opts.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          title={n === 0 ? 'All importance levels' : `Only ${n}${n < 5 ? '+' : ''} star questions`}
          style={{
            border: 'none', borderRadius: '6px', padding: '2px 8px', fontSize: '0.72rem', cursor: 'pointer',
            background: value === n ? '#30363d' : 'transparent', color: value === n ? '#e3b341' : '#8b949e',
          }}
        >
          {n === 0 ? 'All' : `★${n}${n < 5 ? '+' : ''}`}
        </button>
      ))}
    </div>
  );
}
