'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Ink, Point, Stroke, EMPTY_INK, INK_WIDTH, INK_MIN_HEIGHT, decodePoints, encodePoints, pressureScale } from '@/lib/ink';

const COLORS = ['#e6edf3', '#58a6ff', '#d29922', '#f85149', '#3fb950'];
const ERASE_RADIUS = 14; // logical px
const LINE_GAP = 40;     // ruled-line spacing, logical px

type Tool = 'pen' | 'eraser';

const toolBtn = (on: boolean): React.CSSProperties => ({
  background: on ? 'rgba(88,166,255,0.12)' : 'none', border: `1px solid ${on ? 'rgba(88,166,255,0.45)' : '#30363d'}`,
  color: on ? '#58a6ff' : '#8b949e', borderRadius: '8px', padding: '3px 9px', fontSize: '0.74rem', cursor: 'pointer',
});

function drawStroke(ctx: CanvasRenderingContext2D, pts: Point[], color: string, width: number) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  if (pts.length === 1) {
    const [x, y, p] = pts[0];
    ctx.beginPath();
    ctx.arc(x, y, (width * pressureScale(p)) / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  // Segment by segment so width can follow pressure.
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0, p0] = pts[i - 1];
    const [x1, y1, p1] = pts[i];
    ctx.lineWidth = width * pressureScale((p0 + p1) / 2);
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }
}

// Pen-first handwriting pad. Pen and mouse draw; a finger also draws until a
// pen is seen, after which touches are ignored (palm rejection). The pen's
// eraser end, or the eraser tool, removes whole strokes it passes over.
export default function InkPad({
  ink, onChange, title,
}: { ink: Ink | undefined; onChange: (ink: Ink | null) => void; title?: string }) {
  const value = ink ?? EMPTY_INK;
  const outerRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cssWidth, setCssWidth] = useState(0);
  const [viewH, setViewH] = useState(0);
  const [full, setFull] = useState(false);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(3);

  const penSeen = useRef(false);
  const active = useRef<{ id: number; erase: boolean; pts: Point[]; erased: Set<number> } | null>(null);
  const undoStack = useRef<Ink[]>([]);
  const [undoCount, setUndoCount] = useState(0);

  const decoded = useMemo(() => value.strokes.map((s) => decodePoints(s.d)), [value.strokes]);
  const scale = cssWidth / INK_WIDTH;
  // Fullscreen shows at least a screenful of page; it only becomes part of
  // the saved height once something is written there.
  const displayH = full && scale ? Math.max(value.h, Math.ceil(viewH / scale)) : value.h;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      setCssWidth(e.contentRect.width);
      setViewH(e.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Fullscreen: a fixed overlay, promoted to real browser fullscreen where
  // allowed. Leaving browser fullscreen (Esc / F11) closes the overlay too.
  useEffect(() => {
    if (!full) return;
    const el = outerRef.current;
    el?.requestFullscreen?.().catch(() => {});
    const onFsChange = () => { if (!document.fullscreenElement) setFull(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setFull(false); };
    document.addEventListener('fullscreenchange', onFsChange);
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, [full]);

  const redraw = useCallback((skip?: Set<number>) => {
    const canvas = canvasRef.current;
    if (!canvas || !cssWidth) return;
    const dpr = window.devicePixelRatio || 1;
    const w = Math.round(cssWidth * dpr), h = Math.round(displayH * scale * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    const ctx = canvas.getContext('2d')!;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.strokeStyle = 'rgba(139,148,158,0.12)';
    ctx.lineWidth = 1 / scale;
    for (let y = LINE_GAP; y < displayH; y += LINE_GAP) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(INK_WIDTH, y);
      ctx.stroke();
    }

    value.strokes.forEach((s, i) => {
      if (!skip?.has(i)) drawStroke(ctx, decoded[i], s.c, s.w);
    });
  }, [cssWidth, scale, value, decoded, displayH]);

  useEffect(() => redraw(), [redraw]);

  const commit = (next: Ink) => {
    undoStack.current.push(value);
    if (undoStack.current.length > 50) undoStack.current.shift();
    setUndoCount(undoStack.current.length);
    onChange(next.strokes.length === 0 && next.h <= INK_MIN_HEIGHT ? null : next);
  };

  const toPoint = (e: { clientX: number; clientY: number; pressure: number }, rect: DOMRect): Point => [
    (e.clientX - rect.left) / scale,
    (e.clientY - rect.top) / scale,
    Math.max(0, Math.min(100, (e.pressure || 0.5) * 100)),
  ];

  const eraseAt = (pt: Point, erased: Set<number>) => {
    const r2 = ERASE_RADIUS * ERASE_RADIUS;
    decoded.forEach((pts, i) => {
      if (erased.has(i)) return;
      if (pts.some(([x, y]) => (x - pt[0]) ** 2 + (y - pt[1]) ** 2 <= r2)) erased.add(i);
    });
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType === 'pen') penSeen.current = true;
    if (e.pointerType === 'touch' && penSeen.current) return;
    if (active.current) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    // buttons & 32 = pen eraser end / barrel eraser.
    const erase = tool === 'eraser' || (e.buttons & 32) !== 0;
    const pt = toPoint(e, e.currentTarget.getBoundingClientRect());
    active.current = { id: e.pointerId, erase, pts: [pt], erased: new Set() };
    if (erase) {
      eraseAt(pt, active.current.erased);
      redraw(active.current.erased);
    } else {
      const ctx = e.currentTarget.getContext('2d')!;
      drawStroke(ctx, [pt], color, size);
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const a = active.current;
    if (!a || a.id !== e.pointerId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const events = e.nativeEvent.getCoalescedEvents?.() ?? [e.nativeEvent];
    const ctx = e.currentTarget.getContext('2d')!;
    for (const ev of events.length ? events : [e.nativeEvent]) {
      const pt = toPoint(ev, rect);
      if (a.erase) {
        eraseAt(pt, a.erased);
      } else {
        drawStroke(ctx, [a.pts[a.pts.length - 1], pt], color, size);
        a.pts.push(pt);
      }
    }
    if (a.erase) redraw(a.erased);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const a = active.current;
    if (!a || a.id !== e.pointerId) return;
    active.current = null;
    if (a.erase) {
      if (a.erased.size > 0) commit({ ...value, strokes: value.strokes.filter((_, i) => !a.erased.has(i)) });
      return;
    }
    const stroke: Stroke = { c: color, w: size, d: encodePoints(a.pts) };
    const bottom = Math.max(...a.pts.map((p) => p[1]));
    // The page always keeps three empty lines below the lowest writing.
    const h = Math.max(value.h, Math.ceil((bottom + LINE_GAP * 3) / LINE_GAP) * LINE_GAP);
    commit({ h, strokes: [...value.strokes, stroke] });
  };

  const undo = () => {
    const prev = undoStack.current.pop();
    setUndoCount(undoStack.current.length);
    if (prev) onChange(prev.strokes.length === 0 && prev.h <= INK_MIN_HEIGHT ? null : prev);
  };

  return (
    <div
      ref={outerRef}
      style={full ? {
        position: 'fixed', inset: 0, zIndex: 200, background: '#0d1117', padding: '0.75rem 1rem',
        display: 'flex', flexDirection: 'column', gap: '0.5rem',
      } : { display: 'flex', flexDirection: 'column', gap: '0.45rem' }}
    >
      {full && title && (
        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e6edf3', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>{title}</div>
      )}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap',
        ...(full ? { maxWidth: '1400px', width: '100%', margin: '0 auto' } : {}),
      }}>
        <button type="button" style={toolBtn(tool === 'pen')} onClick={() => setTool('pen')}>✒ Pen</button>
        <button type="button" style={toolBtn(tool === 'eraser')} onClick={() => setTool('eraser')}>⌫ Eraser</button>
        <span style={{ width: '1px', height: '18px', background: '#30363d', margin: '0 2px' }} />
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={`Colour ${c}`}
            onClick={() => { setColor(c); setTool('pen'); }}
            style={{
              width: '18px', height: '18px', borderRadius: '50%', background: c, cursor: 'pointer', padding: 0,
              border: color === c && tool === 'pen' ? '2px solid #58a6ff' : '2px solid #30363d',
            }}
          />
        ))}
        <span style={{ width: '1px', height: '18px', background: '#30363d', margin: '0 2px' }} />
        {[2, 3, 5].map((s) => (
          <button key={s} type="button" style={toolBtn(size === s)} onClick={() => { setSize(s); setTool('pen'); }} aria-label={`Size ${s}`}>
            <span style={{ display: 'inline-block', width: `${s * 2}px`, height: `${s * 2}px`, borderRadius: '50%', background: 'currentColor', verticalAlign: 'middle' }} />
          </button>
        ))}
        <span style={{ flex: 1 }} />
        <button type="button" style={toolBtn(false)} onClick={undo} disabled={undoCount === 0}>↶ Undo</button>
        <button
          type="button"
          style={toolBtn(false)}
          onClick={() => { if (value.strokes.length && confirm('Clear this page?')) commit(EMPTY_INK); }}
        >
          Clear
        </button>
        <button
          type="button"
          style={toolBtn(full)}
          onClick={() => setFull(!full)}
          aria-label={full ? 'Exit fullscreen' : 'Fullscreen'}
          title={full ? 'Exit fullscreen (Esc)' : 'Fullscreen'}
        >
          {full ? '✕ Done' : '⛶ Fullscreen'}
        </button>
      </div>
      <div
        ref={wrapRef}
        style={{
          width: '100%', borderRadius: '8px', border: '1px solid #30363d', background: '#0d1117',
          ...(full
            ? { flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', maxWidth: '1400px', margin: '0 auto' }
            : { overflow: 'hidden' }),
        }}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{
            display: 'block', width: '100%', height: cssWidth ? `${displayH * scale}px` : `${INK_MIN_HEIGHT / 3}px`,
            touchAction: 'none', cursor: tool === 'eraser' ? 'cell' : 'crosshair',
          }}
        />
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#6e7681',
        ...(full ? { maxWidth: '1400px', width: '100%', margin: '0 auto' } : {}),
      }}>
        <span>{full ? 'Esc or ✕ Done to exit. Saves as you write.' : 'Pen eraser end works too. The page grows as you write.'}</span>
        <button
          type="button"
          onClick={() => commit({ ...value, h: value.h + LINE_GAP * 4 })}
          style={{ background: 'none', border: 'none', color: '#58a6ff', cursor: 'pointer', fontSize: '0.7rem', padding: 0 }}
        >
          + More space
        </button>
      </div>
    </div>
  );
}
