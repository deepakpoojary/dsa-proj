'use client';

import { useCallback, useMemo, useState } from 'react';
import { EarningsRange, EarningsSeries } from '@/lib/finance';

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

function cacheKey(range: EarningsRange, offset: number) {
  return `${range}:${offset}`;
}

export default function EarningsChart({ series: initialSeries }: { series: Record<EarningsRange, EarningsSeries> }) {
  const [range, setRange] = useState<EarningsRange>('week');
  const [offsets, setOffsets] = useState<Record<EarningsRange, number>>({ week: 0, month: 0, year: 0 });
  const [cache, setCache] = useState<Record<string, EarningsSeries>>(() => ({
    [cacheKey('week', 0)]: initialSeries.week,
    [cacheKey('month', 0)]: initialSeries.month,
    [cacheKey('year', 0)]: initialSeries.year,
  }));
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [hover, setHover] = useState<number | null>(null);

  const offset = offsets[range];
  const key = cacheKey(range, offset);
  const current = cache[key];
  const isLoading = loadingKey === key && !current;

  const loadOffset = useCallback(
    async (r: EarningsRange, o: number) => {
      const k = cacheKey(r, o);
      if (cache[k]) return;
      setLoadingKey(k);
      try {
        const res = await fetch(`/api/finance/earnings?range=${r}&offset=${o}`);
        if (!res.ok) return;
        const data: EarningsSeries = await res.json();
        setCache((prev) => ({ ...prev, [k]: data }));
      } finally {
        setLoadingKey((cur) => (cur === k ? null : cur));
      }
    },
    [cache]
  );

  const goOlder = () => {
    const next = offset + 1;
    setOffsets((prev) => ({ ...prev, [range]: next }));
    setHover(null);
    loadOffset(range, next);
  };

  const goNewer = () => {
    if (offset === 0) return;
    const next = offset - 1;
    setOffsets((prev) => ({ ...prev, [range]: next }));
    setHover(null);
    loadOffset(range, next);
  };

  const points = current?.points ?? [];

  const { bars, gridlines } = useMemo(() => {
    const plotW = VB_WIDTH - PAD_LEFT;
    const plotH = VB_HEIGHT - PAD_TOP - PAD_BOTTOM;
    const max = niceMax(Math.max(...points.map((p) => p.value), 1));
    const slot = points.length ? plotW / points.length : plotW;
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

    return { bars, gridlines };
  }, [points]);

  const showEveryLabel = points.length <= 12;

  return (
    <div
      style={{
        marginTop: '1.25rem', padding: '1.25rem', borderRadius: '12px',
        background: '#161b22', border: '1px solid #30363d',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
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

      {/* Period navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <button
          type="button"
          onClick={goOlder}
          aria-label="Previous period"
          title="Previous period"
          style={{
            width: '26px', height: '26px', borderRadius: '6px', cursor: 'pointer',
            background: '#0d1117', border: '1px solid #30363d', color: '#e6edf3', fontSize: '0.85rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          ←
        </button>
        <span style={{ fontSize: '0.78rem', color: '#e6edf3', fontWeight: 600, minWidth: '160px', textAlign: 'center' }}>
          {current?.label ?? '…'}
        </span>
        <button
          type="button"
          onClick={goNewer}
          disabled={offset === 0}
          aria-label="Next period"
          title="Next period"
          style={{
            width: '26px', height: '26px', borderRadius: '6px',
            cursor: offset === 0 ? 'default' : 'pointer',
            background: '#0d1117', border: '1px solid #30363d',
            color: offset === 0 ? '#484f58' : '#e6edf3', fontSize: '0.85rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          →
        </button>
      </div>

      <div style={{ position: 'relative', opacity: isLoading || !current ? 0.4 : 1, transition: 'opacity 0.15s' }}>
        <svg
          viewBox={`0 0 ${VB_WIDTH} ${VB_HEIGHT}`}
          preserveAspectRatio="none"
          style={{ width: '100%', height: `${VB_HEIGHT}px`, display: 'block', overflow: 'visible' }}
          role="img"
          aria-label={`Earnings for ${current?.label ?? 'the selected period'}`}
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
                x={PAD_LEFT + (i * (VB_WIDTH - PAD_LEFT)) / bars.length}
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
