// Handwritten journal answers, stored as vector strokes so they redraw
// exactly as written at any size. Coordinates are in a fixed logical space
// INK_WIDTH wide; the pad scales that to whatever width it's shown at.

export const INK_WIDTH = 1000;
export const INK_MIN_HEIGHT = 260;

export interface Stroke {
  c: string;   // colour
  w: number;   // base width, logical px
  d: number[]; // delta-encoded [x, y, p] triples; p = pressure 0–100
}

export interface Ink {
  h: number; // logical height
  strokes: Stroke[];
}

export const EMPTY_INK: Ink = { h: INK_MIN_HEIGHT, strokes: [] };

export type Point = [number, number, number];

// Deltas keep numbers small so a page of writing stays compact as JSON.
export function encodePoints(pts: Point[]): number[] {
  const out: number[] = [];
  let px = 0, py = 0, pp = 0;
  for (const [x, y, p] of pts) {
    const ix = Math.round(x), iy = Math.round(y), ip = Math.round(p);
    out.push(ix - px, iy - py, ip - pp);
    px = ix; py = iy; pp = ip;
  }
  return out;
}

export function decodePoints(d: number[]): Point[] {
  const out: Point[] = [];
  let x = 0, y = 0, p = 0;
  for (let i = 0; i + 2 < d.length; i += 3) {
    x += d[i]; y += d[i + 1]; p += d[i + 2];
    out.push([x, y, p]);
  }
  return out;
}

// Pressure → width multiplier. Mice report a flat 0.5, which lands at 1×.
export const pressureScale = (p: number) => 0.45 + (p / 100) * 1.1;

export const inkDocId = (day: string, key: string) => `${day}:${key}`;
