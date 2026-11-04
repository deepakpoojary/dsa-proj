// Fuel-efficiency (km/L) tracking. Mileage comes from distance and litres
// only, so fuel price changes never distort the trend.
//
// Each fill-up has two flags:
//   empty – tank was empty / on reserve BEFORE filling  (level before = 0)
//   full  – tank was filled to full                      (level after  = capacity)
//
// A fill-up with either flag is an "anchor": a point where the tank level is
// known. A segment runs between two anchors whose levels can be compared:
//   empty → empty : fuel burned = litres added at the first fill-up (+ top-ups)
//   full  → full  : fuel burned = litres added after the first fill-up, up to
//                   and including the closing one.
// Levels are tracked as absolute litres ("abs") or relative to the unknown
// tank capacity ("cap"); a segment is only computed when both ends share a
// form, so capacity always cancels out. Fill-ups with neither flag are
// top-ups whose litres join the current segment.

export type VehicleType = 'car' | 'bike' | 'other';

export const VEHICLE_ICONS: Record<VehicleType, string> = { car: '🚗', bike: '🛵', other: '🚙' };

export interface Fillup {
  id: string;
  date: string; // YYYY-MM-DD
  odometer: number; // km
  litres: number;
  empty?: boolean;
  full?: boolean;
  note?: string;
}

// One doc per vehicle (kind 'vehicle'), fill-ups embedded.
export interface Vehicle {
  name: string;
  type: VehicleType;
  createdAt: number;
  fillups: Fillup[];
}

export interface Segment {
  id: string; // the closing fill-up
  date: string;
  odometer: number;
  distance: number;
  fuel: number;
  kmpl: number;
  method: 'empty→empty' | 'full→full';
}

export interface MileageSummary {
  count: number;
  totalDistance: number;
  totalFuel: number;
  average: number;
  best: number;
  worst: number;
  latest: number;
  latestVsAvgPct: number;
}

export const sortFillups = (fillups: Fillup[]): Fillup[] =>
  [...fillups].sort((a, b) => a.odometer - b.odometer || a.date.localeCompare(b.date));

type Level = { abs?: number; cap?: number };

function levelBefore(f: Fillup, litres: number): Level {
  const l: Level = {};
  if (f.empty) l.abs = 0;
  if (f.full) l.cap = -litres; // capacity - litres
  return l;
}

function levelAfter(f: Fillup, litres: number): Level {
  const l: Level = {};
  if (f.empty) l.abs = litres;
  if (f.full) l.cap = 0; // capacity
  return l;
}

export function computeSegments(fillups: Fillup[]): Segment[] {
  const segments: Segment[] = [];
  let anchor: { odometer: number; level: Level } | null = null;
  let fuelSince = 0;

  for (const f of sortFillups(fillups)) {
    const litres = Number(f.litres) || 0;
    if (!f.empty && !f.full) {
      if (anchor) fuelSince += litres;
      continue;
    }
    if (anchor) {
      const before = levelBefore(f, litres);
      const form =
        anchor.level.abs !== undefined && before.abs !== undefined ? 'abs' :
        anchor.level.cap !== undefined && before.cap !== undefined ? 'cap' : null;
      if (form) {
        const fuel = anchor.level[form]! + fuelSince - before[form]!;
        const distance = f.odometer - anchor.odometer;
        if (distance > 0 && fuel > 0) {
          segments.push({
            id: f.id, date: f.date, odometer: f.odometer, distance, fuel,
            kmpl: distance / fuel, method: form === 'abs' ? 'empty→empty' : 'full→full',
          });
        }
      }
    }
    anchor = { odometer: f.odometer, level: levelAfter(f, litres) };
    fuelSince = 0;
  }
  return segments;
}

export function summarize(segments: Segment[]): MileageSummary | null {
  if (!segments.length) return null;
  const totalDistance = segments.reduce((s, x) => s + x.distance, 0);
  const totalFuel = segments.reduce((s, x) => s + x.fuel, 0);
  const values = segments.map((s) => s.kmpl);
  const latest = segments[segments.length - 1].kmpl;
  const average = totalDistance / totalFuel; // distance-weighted, not mean of ratios
  return {
    count: segments.length, totalDistance, totalFuel, average,
    best: Math.max(...values), worst: Math.min(...values), latest,
    latestVsAvgPct: ((latest - average) / average) * 100,
  };
}

// New entries default to the flags of the vehicle's latest fill-up, so
// someone who always fills from empty doesn't re-tick it every time.
export function defaultFlags(fillups: Fillup[]): { empty: boolean; full: boolean } {
  const last = sortFillups(fillups).pop();
  return last ? { empty: !!last.empty, full: !!last.full } : { empty: true, full: false };
}

// Backup format of the standalone Mileage Tracker app (its Export button):
// { vehicles: [{ id, name, type }], fillups: [{ id, vehicleId, date, odometer, litres, empty, full, note }] }
export interface LegacyBackup {
  vehicles: { id: string; name: string; type?: string }[];
  fillups: (Fillup & { vehicleId: string })[];
}

export function isLegacyBackup(x: unknown): x is LegacyBackup {
  const o = x as LegacyBackup;
  return !!o && Array.isArray(o.vehicles) && Array.isArray(o.fillups);
}

// Converts a backup into vehicle docs keyed by the original vehicle id, so
// importing the same file twice overwrites rather than duplicates.
export function fromLegacyBackup(b: LegacyBackup): Record<string, Vehicle> {
  const out: Record<string, Vehicle> = {};
  b.vehicles.forEach((v, i) => {
    const type: VehicleType = v.type === 'car' || v.type === 'bike' ? v.type : 'other';
    out[v.id] = {
      name: String(v.name || 'Vehicle').slice(0, 40),
      type,
      createdAt: Date.now() + i,
      fillups: b.fillups
        .filter((f) => f.vehicleId === v.id)
        .map((f) => ({
          id: String(f.id),
          date: String(f.date),
          odometer: Number(f.odometer),
          litres: Number(f.litres),
          ...(f.empty ? { empty: true } : {}),
          ...(f.full ? { full: true } : {}),
          ...(f.note ? { note: String(f.note).slice(0, 80) } : {}),
        }))
        .filter((f) => Number.isFinite(f.odometer) && f.litres > 0 && /^\d{4}-\d{2}-\d{2}$/.test(f.date)),
    };
  });
  return out;
}

export function toLegacyBackup(vehicles: Record<string, Vehicle>): LegacyBackup {
  return {
    vehicles: Object.entries(vehicles).map(([id, v]) => ({ id, name: v.name, type: v.type })),
    fillups: Object.entries(vehicles).flatMap(([id, v]) => v.fillups.map((f) => ({ ...f, vehicleId: id }))),
  };
}
