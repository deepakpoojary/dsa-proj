'use client';

import { useMemo, useState } from 'react';
import { EarningsPoint, EarningsRange } from '@/lib/finance';

const RANGES: { key: EarningsRange; label: string }[] = [
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
];

const VB_WIDTH = 640;
const VB_HEIGHT = 200;
const PAD_LEFT = 36;
const PAD_BOTTOM = 22;
const PAD_TOP = 12;

function niceMax(value: number): number {
  if (value <= 0) return 10;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const steps = [1, 2, 2.5, 5, 10];
  for (const step of steps) {
    const candidate = step * magnitude;
    if (candidate >= value) return candidate;
  }
  return 10 * magnitude;
}

function formatInr(n: number) {
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

export default function EarningsChart({ series }: { series: Record<EarningsRange, EarningsPoint[]> }) {
  const [range, setRange] = useState<EarningsRange>('week');
  const [hover, setHover] = useState<number | null>(null);

  const points = series[range];

  const { bars, gridlines, max } = useMemo(() => {
    const plotW = VB_WIDTH - PAD_LEFT;
    const plotH = VB_HEIGHT - PAD_TOP - PAD_BOTTOM;
    const max = niceMax(Math.max(...points.map((p) => p.value), 1));
    const slot = plotW / points.length;
    const barW = Math.min(24, slot * 0.6);

    const bars = points.map((p, i) => {
      const h = max === 0 ? 0 : (p.value / max) * plotH;
      const x = PAD_LEFT + i * slot + (slot - barW) / 2;
      const y = PAD_TOP + plotH - h;
      return { ...p, x, y, w: barW, h, cx: x + barW / 2 };
    });

    const gridlines = [0, 0.5, 1].map((f) => ({
      y: PAD_TOP + plotH * (1 - f),
      value: max * f,
    }));

    return { bars, gridlines, max };
  }, [points]);

  const showEveryLabel = points.length <= 12;

  return (
    <div
      style={{
        marginTop: '1.25rem', padding: '1.25rem', borderRadius: '12px',
        background: '#161b22', border: '1px solid #30363d',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#8b949e', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Earnings Over Time
        </div>
        <div style={{ display: 'flex', gap: '4px', background: '#0d1117', border: '1px solid #30363d', borderRadius: '8px', padding: '3px' }}>
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => { setRange(r.key); setHover(null); }}
              style={{
                border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                padding: '0.3rem 0.7rem', borderRadius: '6px',
                background: range === r.key ? '#238636' : 'transparent',
                color: range === r.key ? '#fff' : '#8b949e',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <svg
          viewBox={`0 0 ${VB_WIDTH} ${VB_HEIGHT}`}
          preserveAspectRatio="none"
          style={{ width: '100%', height: `${VB_HEIGHT}px`, display: 'block', overflow: 'visible' }}
          role="img"
          aria-label={`Earnings for the selected ${range}`}
        >
          {gridlines.map((g, i) => (
            <g key={i}>
              <line x1={PAD_LEFT} x2={VB_WIDTH} y1={g.y} y2={g.y} stroke="#21262d" strokeWidth={1} />
              <text x={PAD_LEFT - 6} y={g.y + 3} textAnchor="end" fontSize={9} fill="#8b949e">
                {g.value >= 1000 ? `${Math.round(g.value / 1000)}k` : Math.round(g.value)}
              </text>
            </g>
          ))}

          {bars.map((b, i) => (
            <g key={i}>
              <rect
                x={b.x}
                y={b.y}
                width={b.w}
                height={Math.max(b.h, 1)}
                rx={4}
                fill={hover === i ? '#56d364' : '#3fb950'}
                style={{ transition: 'fill 0.1s', cursor: 'pointer' }}
                tabIndex={0}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover((cur) => (cur === i ? null : cur))}
                onFocus={() => setHover(i)}
                onBlur={() => setHover((cur) => (cur === i ? null : cur))}
              />
              {/* transparent hit area, bigger than the bar, for easy hover/tap */}
              <rect
                x={PAD_LEFT + i * (VB_WIDTH - PAD_LEFT) / bars.length}
                y={PAD_TOP}
                width={(VB_WIDTH - PAD_LEFT) / bars.length}
                height={VB_HEIGHT - PAD_TOP - PAD_BOTTOM}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover((cur) => (cur === i ? null : cur))}
              />
              {(showEveryLabel || i === 0 || i === bars.length - 1 || i === hover) && (
                <text
                  x={b.cx}
                  y={VB_HEIGHT - PAD_BOTTOM + 13}
                  textAnchor="middle"
                  fontSize={9}
                  fill={hover === i ? '#e6edf3' : '#8b949e'}
                >
                  {b.label}
                </text>
              )}
            </g>
          ))}
        </svg>

        {hover !== null && bars[hover] && (
          <div
            style={{
              position: 'absolute',
              left: `${(bars[hover].cx / VB_WIDTH) * 100}%`,
              top: `${(bars[hover].y / VB_HEIGHT) * 100}%`,
              transform: 'translate(-50%, -100%)',
              marginTop: '-8px',
              background: '#21262d',
              border: '1px solid #30363d',
              borderRadius: '6px',
              padding: '0.35rem 0.6rem',
              fontSize: '0.75rem',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            }}
          >
            <div style={{ color: '#e6edf3', fontWeight: 700 }}>{formatInr(bars[hover].value)}</div>
            <div style={{ color: '#8b949e', fontSize: '0.68rem' }}>{bars[hover].label}</div>
          </div>
        )}
      </div>
    </div>
  );
}
