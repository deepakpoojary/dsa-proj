'use client';

import { useRef, useState } from 'react';
import SiteNav from '@/components/SiteNav';
import { useDocs, DOC_STATUS_LABEL } from '@/lib/use-docs';
import { newId } from '@/lib/journal';
import {
  Fillup, Vehicle, VehicleType, VEHICLE_ICONS, Segment, MileageSummary,
  computeSegments, summarize, sortFillups, defaultFlags,
  isLegacyBackup, fromLegacyBackup, toLegacyBackup,
} from '@/lib/mileage';

const card: React.CSSProperties = {
  background: '#161b22', border: '1px solid #30363d', borderRadius: '12px', padding: '1rem 1.1rem',
};
const label: React.CSSProperties = {
  fontSize: '0.68rem', color: '#8b949e', letterSpacing: '0.06em', textTransform: 'uppercase',
};
const input: React.CSSProperties = {
  padding: '0.5rem 0.65rem', borderRadius: '8px', border: '1px solid #30363d', background: '#0d1117',
  color: '#e6edf3', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box',
};
const ghostBtn: React.CSSProperties = {
  background: 'none', border: '1px solid #30363d', color: '#8b949e', borderRadius: '8px',
  padding: '0.35rem 0.7rem', fontSize: '0.75rem', cursor: 'pointer',
};
const primaryBtn: React.CSSProperties = { ...ghostBtn, color: '#e6edf3', background: '#21262d' };
const ACCENT = '#58a6ff';

const fmt = (n: number, d = 1) => n.toLocaleString(undefined, { maximumFractionDigits: d, minimumFractionDigits: d });
const fmtDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

interface FormState {
  date: string;
  odometer: string;
  litres: string;
  empty: boolean;
  full: boolean;
  note: string;
}

const blankForm = (fills: Fillup[]): FormState => ({
  date: todayIso(), odometer: '', litres: '', note: '', ...defaultFlags(fills),
});

export default function MileageView({ signedIn }: { signedIn: boolean }) {
  const { docs: vehicles, setDoc: setVehicle, status } = useDocs<Vehicle>('vehicle', signedIn);
  const ordered = Object.entries(vehicles).sort(([, a], [, b]) => a.createdAt - b.createdAt);

  const [pickedId, setPickedId] = useState<string | null>(null);
  const selectedId = pickedId && vehicles[pickedId] ? pickedId : ordered[0]?.[0] ?? null;
  const vehicle = selectedId ? vehicles[selectedId] : null;
  const fills = vehicle?.fillups ?? [];

  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<VehicleType>('car');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // The form starts blank for whichever vehicle is selected; `form` only
  // holds state once the user touches it.
  const f = form ?? blankForm(fills);
  const patch = (p: Partial<FormState>) => setForm({ ...f, ...p });
  const resetForm = () => {
    setForm(null);
    setEditingId(null);
    setError(null);
  };

  const selectVehicle = (id: string) => {
    setPickedId(id);
    resetForm();
  };

  const addVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    const id = newId();
    setVehicle(id, { name, type: newType, createdAt: Date.now(), fillups: [] });
    setPickedId(id);
    setNewName('');
    setAdding(false);
    resetForm();
  };

  const deleteVehicle = () => {
    if (!selectedId || !vehicle) return;
    if (!window.confirm(`Delete "${vehicle.name}" and all ${fills.length} fill-ups?`)) return;
    setVehicle(selectedId, null);
    setPickedId(null);
    resetForm();
  };

  const saveFills = (next: Fillup[]) => {
    if (!selectedId || !vehicle) return;
    setVehicle(selectedId, { ...vehicle, fillups: next });
  };

  const submitFillup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle) return;
    const odometer = parseFloat(f.odometer);
    const litres = parseFloat(f.litres);
    const problem =
      !f.date ? 'Pick a date.' :
      !(odometer >= 0) ? 'Enter a valid odometer reading.' :
      !(litres > 0) ? 'Enter litres filled.' :
      fills.some((x) => x.odometer === odometer && x.id !== editingId) ? 'A fill-up with this odometer reading already exists.' :
      null;
    if (problem) {
      setError(problem);
      return;
    }
    const note = f.note.trim();
    const entry: Fillup = {
      id: editingId ?? newId(), date: f.date, odometer, litres,
      ...(f.empty ? { empty: true } : {}),
      ...(f.full ? { full: true } : {}),
      ...(note ? { note } : {}),
    };
    saveFills(editingId ? fills.map((x) => (x.id === editingId ? entry : x)) : [...fills, entry]);
    resetForm();
  };

  const startEdit = (x: Fillup) => {
    setEditingId(x.id);
    setForm({
      date: x.date, odometer: String(x.odometer), litres: String(x.litres),
      empty: !!x.empty, full: !!x.full, note: x.note ?? '',
    });
    setError(null);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const deleteFillup = (id: string) => {
    if (!window.confirm('Delete this fill-up?')) return;
    saveFills(fills.filter((x) => x.id !== id));
    if (id === editingId) resetForm();
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(toLegacyBackup(vehicles), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `mileage-backup-${todayIso()}.json`;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const importData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const data: unknown = JSON.parse(await file.text());
      if (!isLegacyBackup(data)) throw new Error('bad shape');
      const imported = fromLegacyBackup(data);
      const ids = Object.keys(imported);
      const fillCount = ids.reduce((n, id) => n + imported[id].fillups.length, 0);
      const clashes = ids.filter((id) => vehicles[id]).length;
      if (
        !window.confirm(
          `Import ${ids.length} vehicle${ids.length === 1 ? '' : 's'} with ${fillCount} fill-ups?` +
            (clashes ? ` ${clashes} already imported vehicle${clashes === 1 ? '' : 's'} will be replaced.` : '')
        )
      )
        return;
      for (const id of ids) setVehicle(id, imported[id]);
      setPickedId(ids[0] ?? null);
      resetForm();
      setNotice(`Imported ${ids.length} vehicle${ids.length === 1 ? '' : 's'} and ${fillCount} fill-ups${signedIn ? ' — syncing to your account' : ''}.`);
    } catch {
      setNotice('That file is not a valid mileage backup.');
    }
  };

  const segments = computeSegments(fills);
  const summary = summarize(segments);
  const segById = new Map(segments.map((s) => [s.id, s]));
  const lastFill = sortFillups(fills).pop();

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', padding: '2rem 1rem 4rem' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        <SiteNav />

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#e6edf3', margin: 0 }}>⛽ Mileage</h1>
            <p style={{ color: '#8b949e', fontSize: '0.85rem', margin: '6px 0 0' }}>
              Fuel efficiency (km/L) per vehicle, from distance and litres only.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', color: '#6e7681', marginRight: '0.3rem' }}>
              {status ? DOC_STATUS_LABEL[status] : signedIn ? 'Saves automatically' : 'Saved on this device · log in to sync'}
            </span>
            <button type="button" style={ghostBtn} onClick={() => fileRef.current?.click()}>Import</button>
            <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={importData} />
            <button type="button" style={ghostBtn} onClick={exportData} disabled={!ordered.length}>Export</button>
          </div>
        </div>

        {notice && (
          <div style={{ ...card, padding: '0.6rem 0.9rem', fontSize: '0.82rem', color: '#e6edf3', display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss" style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer' }}>×</button>
          </div>
        )}

        {/* Vehicles */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'stretch' }}>
          {ordered.map(([id, v]) => {
            const sum = summarize(computeSegments(v.fillups));
            const active = id === selectedId;
            return (
              <button
                key={id}
                type="button"
                onClick={() => selectVehicle(id)}
                aria-pressed={active}
                style={{
                  ...card, padding: '0.55rem 0.9rem', cursor: 'pointer', textAlign: 'left',
                  borderColor: active ? 'rgba(88,166,255,0.6)' : '#30363d',
                  background: active ? 'rgba(88,166,255,0.08)' : '#161b22',
                  display: 'flex', flexDirection: 'column', gap: '2px',
                }}
              >
                <span style={{ fontSize: '0.88rem', color: '#e6edf3', fontWeight: 600 }}>{VEHICLE_ICONS[v.type]} {v.name}</span>
                <span style={{ fontSize: '0.72rem', color: '#8b949e' }}>{sum ? `${fmt(sum.average)} km/L avg` : 'no mileage yet'}</span>
              </button>
            );
          })}
          {adding ? (
            <form onSubmit={addVehicle} style={{ ...card, padding: '0.5rem', display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Swift, Activa"
                maxLength={40} autoFocus aria-label="Vehicle name" style={{ ...input, width: '150px' }}
              />
              <select value={newType} onChange={(e) => setNewType(e.target.value as VehicleType)} aria-label="Vehicle type" style={{ ...input, width: 'auto' }}>
                <option value="car">🚗 Car</option>
                <option value="bike">🛵 Bike / Scooter</option>
                <option value="other">🚙 Other</option>
              </select>
              <button type="submit" style={primaryBtn} disabled={!newName.trim()}>Add</button>
              <button type="button" style={ghostBtn} onClick={() => setAdding(false)}>Cancel</button>
            </form>
          ) : (
            <button type="button" onClick={() => setAdding(true)} style={{ ...ghostBtn, borderStyle: 'dashed', padding: '0.55rem 0.9rem' }}>
              + Add vehicle
            </button>
          )}
        </div>

        {!vehicle ? (
          <div style={{ ...card, textAlign: 'center', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', alignItems: 'center' }}>
            <div style={{ fontSize: '1rem', color: '#e6edf3', fontWeight: 600 }}>No vehicles yet</div>
            <p style={{ fontSize: '0.82rem', color: '#8b949e', margin: 0, maxWidth: '420px' }}>
              Add a vehicle and log each fill-up with the odometer reading and litres filled — or import a backup exported from the old Mileage Tracker.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" style={primaryBtn} onClick={() => setAdding(true)}>+ Add your first vehicle</button>
              <button type="button" style={ghostBtn} onClick={() => fileRef.current?.click()}>Import backup</button>
            </div>
          </div>
        ) : (
          <>
            <Stats summary={summary} fills={fills} />

            <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={label}>Mileage over time (km/L)</div>
              <Chart segments={segments} summary={summary} />
              <p style={{ fontSize: '0.72rem', color: '#6e7681', margin: 0 }}>
                Each point needs two fill-ups that are both <strong>from empty</strong> or both <strong>to full</strong>. Fuel price has no effect.
              </p>
            </div>

            <div className="journal-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 340px) minmax(0, 1fr)', gap: '1rem', alignItems: 'start' }}>
              {/* Fill-up form */}
              <form ref={formRef} onSubmit={submitFillup} style={{ ...card, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={label}>{editingId ? 'Edit fill-up' : 'Log a fill-up'}</div>
                <Field name="Date">
                  <input type="date" value={f.date} onChange={(e) => patch({ date: e.target.value })} style={input} required />
                </Field>
                <Field name="Odometer (km)">
                  <input type="number" step="0.1" min="0" value={f.odometer} onChange={(e) => patch({ odometer: e.target.value })} style={input} required />
                </Field>
                <Field name="Litres filled">
                  <input type="number" step="0.01" min="0.01" value={f.litres} onChange={(e) => patch({ litres: e.target.value })} style={input} required />
                </Field>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem', color: '#e6edf3' }}>
                  <label style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', cursor: 'pointer' }}>
                    <input type="checkbox" checked={f.empty} onChange={(e) => patch({ empty: e.target.checked })} />
                    Was empty / on reserve before filling
                  </label>
                  <label style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', cursor: 'pointer' }}>
                    <input type="checkbox" checked={f.full} onChange={(e) => patch({ full: e.target.checked })} />
                    Filled to full
                  </label>
                  <span style={{ fontSize: '0.7rem', color: '#6e7681' }}>Neither ticked = a top-up.</span>
                </div>
                <Field name="Note (optional)">
                  <input type="text" maxLength={80} value={f.note} onChange={(e) => patch({ note: e.target.value })} style={input} />
                </Field>
                <div style={{ fontSize: '0.72rem', color: '#6e7681' }}>
                  {lastFill
                    ? `Last odometer reading: ${fmt(lastFill.odometer, 0)} km on ${fmtDate(lastFill.date)}`
                    : 'First entry: fill from empty (or to full) so the next such fill-up can be measured.'}
                </div>
                {error && <div style={{ fontSize: '0.78rem', color: '#f85149' }}>{error}</div>}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" style={primaryBtn}>{editingId ? 'Save changes' : 'Save fill-up'}</button>
                  {editingId && <button type="button" style={ghostBtn} onClick={resetForm}>Cancel</button>}
                </div>
              </form>

              {/* History */}
              <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={label}>History</div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', color: '#e6edf3' }}>
                    <thead>
                      <tr style={{ color: '#8b949e', textAlign: 'left' }}>
                        {['Date', 'Odometer', 'Litres', 'Distance', 'km/L', ''].map((h) => (
                          <th key={h} style={{ fontWeight: 500, padding: '0.35rem 0.4rem', borderBottom: '1px solid #30363d', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {fills.length === 0 && (
                        <tr><td colSpan={6} style={{ padding: '0.8rem', color: '#6e7681', textAlign: 'center' }}>No fill-ups yet.</td></tr>
                      )}
                      {sortFillups(fills).reverse().map((x) => {
                        const sg = segById.get(x.id);
                        return (
                          <tr key={x.id} className="time-row" style={{ background: x.id === editingId ? 'rgba(88,166,255,0.08)' : undefined }}>
                            <td style={{ padding: '0.4rem', borderBottom: '1px solid #21262d' }}>
                              <div style={{ whiteSpace: 'nowrap' }}>{fmtDate(x.date)}</div>
                              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '2px' }}>
                                {x.empty && <Tag>from empty</Tag>}
                                {x.full && <Tag>to full</Tag>}
                                {!x.empty && !x.full && <Tag>top-up</Tag>}
                              </div>
                              {x.note && <div style={{ fontSize: '0.7rem', color: '#8b949e', marginTop: '2px' }}>{x.note}</div>}
                            </td>
                            <td style={{ padding: '0.4rem', borderBottom: '1px solid #21262d' }}>{fmt(x.odometer, 0)}</td>
                            <td style={{ padding: '0.4rem', borderBottom: '1px solid #21262d' }}>{fmt(x.litres, 2)}</td>
                            <td style={{ padding: '0.4rem', borderBottom: '1px solid #21262d', color: '#8b949e', whiteSpace: 'nowrap' }}>{sg ? `${fmt(sg.distance, 0)} km` : '—'}</td>
                            <td style={{ padding: '0.4rem', borderBottom: '1px solid #21262d', fontWeight: 700 }}>{sg ? fmt(sg.kmpl, 2) : '—'}</td>
                            <td style={{ padding: '0.4rem', borderBottom: '1px solid #21262d', whiteSpace: 'nowrap', textAlign: 'right' }}>
                              <button type="button" className="time-del" onClick={() => startEdit(x)} aria-label="Edit fill-up" style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer' }}>✎</button>
                              <button type="button" className="time-del" onClick={() => deleteFillup(x.id)} aria-label="Delete fill-up" style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer' }}>×</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <button type="button" onClick={deleteVehicle} style={{ ...ghostBtn, color: '#f85149', borderColor: 'rgba(248,81,73,0.4)', alignSelf: 'flex-end' }}>
                  Delete this vehicle
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Field({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem', color: '#8b949e' }}>
      {name}
      {children}
    </label>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontSize: '0.64rem', color: '#8b949e', border: '1px solid #30363d', borderRadius: '999px', padding: '0 6px' }}>
      {children}
    </span>
  );
}

function Stats({ summary, fills }: { summary: MileageSummary | null; fills: Fillup[] }) {
  const tile = (title: string, value: string, sub: React.ReactNode) => (
    <div key={title} style={{ ...card, display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={label}>{title}</div>
      <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#e6edf3', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      <div style={{ fontSize: '0.72rem', color: '#8b949e' }}>{sub}</div>
    </div>
  );
  const grid: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem' };

  if (!summary) {
    const anchors = fills.filter((x) => x.empty || x.full).length;
    return (
      <div style={grid}>
        {tile('Average mileage', '—', anchors
          ? 'Next time, fill from empty (or to full) again to get a reading'
          : 'Log a fill-up from empty or to full to start')}
      </div>
    );
  }
  const delta = summary.latestVsAvgPct;
  return (
    <div style={grid}>
      {tile('Average mileage', `${fmt(summary.average)} km/L`, `over ${fmt(summary.totalDistance, 0)} km`)}
      {tile('Latest', `${fmt(summary.latest)} km/L`, (
        <span style={{ color: delta >= 0 ? '#3fb950' : '#f85149' }}>
          {delta >= 0 ? '▲' : '▼'} {fmt(Math.abs(delta))}% vs average
        </span>
      ))}
      {tile('Best / Worst', `${fmt(summary.best)} / ${fmt(summary.worst)}`, 'km/L')}
      {tile('Fuel tracked', `${fmt(summary.totalFuel)} L`, `${summary.count} tank${summary.count === 1 ? '' : 's'} measured`)}
    </div>
  );
}

// SVG line chart: x = date, y = km/L, dashed average line. Drawn in a fixed
// viewBox and scaled to the container width.
function Chart({ segments, summary }: { segments: Segment[]; summary: MileageSummary | null }) {
  const [hover, setHover] = useState<number | null>(null);
  if (!segments.length || !summary) {
    return (
      <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#6e7681', border: '1px dashed #30363d', borderRadius: '8px', textAlign: 'center', padding: '0 1rem' }}>
        Your mileage trend will appear here after two full-tank (or two from-empty) fill-ups.
      </div>
    );
  }

  const W = 720, H = 260;
  const m = { t: 16, r: 14, b: 30, l: 38 };
  const iw = W - m.l - m.r, ih = H - m.t - m.b;
  const pts = segments
    .map((s) => ({ ...s, t: new Date(s.date + 'T00:00:00').getTime() }))
    .sort((a, b) => a.t - b.t || a.odometer - b.odometer);

  let tMin = pts[0].t, tMax = pts[pts.length - 1].t;
  if (tMin === tMax) { tMin -= 7 * 86400000; tMax += 7 * 86400000; }
  const vals = pts.map((p) => p.kmpl);
  const rawMin = Math.min(...vals), rawMax = Math.max(...vals);
  const pad = Math.max((rawMax - rawMin) * 0.15, rawMax * 0.05, 1);
  const yTicks = 5;
  const yMin = Math.max(0, Math.floor(rawMin - pad));
  const step = Math.max(1, Math.ceil((rawMax + pad - yMin) / yTicks));
  const yMax = yMin + step * yTicks;

  const x = (t: number) => m.l + ((t - tMin) / (tMax - tMin)) * iw;
  const y = (v: number) => m.t + ih - ((v - yMin) / (yMax - yMin)) * ih;
  const xTicks = Math.min(6, Math.max(2, pts.length));
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${x(p.t).toFixed(1)},${y(p.kmpl).toFixed(1)}`).join(' ');
  const hp = hover !== null ? pts[hover] : null;

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Mileage over time chart" style={{ width: '100%', height: 'auto', display: 'block' }} onMouseLeave={() => setHover(null)}>
        {Array.from({ length: yTicks + 1 }, (_, i) => {
          const v = yMin + step * i;
          return (
            <g key={i}>
              <line x1={m.l} x2={W - m.r} y1={y(v)} y2={y(v)} stroke="#21262d" />
              <text x={m.l - 8} y={y(v) + 4} textAnchor="end" fontSize="11" fill="#6e7681">{v}</text>
            </g>
          );
        })}
        {Array.from({ length: xTicks }, (_, i) => {
          const t = tMin + ((tMax - tMin) * i) / (xTicks - 1);
          const anchor = i === 0 ? 'start' : i === xTicks - 1 ? 'end' : 'middle';
          return (
            <text key={i} x={x(t)} y={H - 8} textAnchor={anchor} fontSize="11" fill="#6e7681">
              {new Date(t).toLocaleDateString(undefined, { month: 'short', year: '2-digit' })}
            </text>
          );
        })}
        <line x1={m.l} x2={W - m.r} y1={y(summary.average)} y2={y(summary.average)} stroke="#d29922" strokeDasharray="5 4" />
        <text x={W - m.r - 4} y={y(summary.average) - 6} textAnchor="end" fontSize="11" fill="#d29922">avg {fmt(summary.average)}</text>
        {pts.length > 1 && <path d={path} fill="none" stroke={ACCENT} strokeWidth="2" strokeLinejoin="round" />}
        {pts.map((p, i) => (
          <g key={p.id} onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} tabIndex={0} style={{ cursor: 'default', outline: 'none' }}>
            <circle cx={x(p.t)} cy={y(p.kmpl)} r="12" fill="transparent" />
            <circle cx={x(p.t)} cy={y(p.kmpl)} r={hover === i ? 5.5 : 4} fill={ACCENT} stroke="#0d1117" strokeWidth="2" />
          </g>
        ))}
      </svg>
      {hp && (
        <div
          style={{
            position: 'absolute', pointerEvents: 'none',
            left: `${(x(hp.t) / W) * 100}%`, top: `${(y(hp.kmpl) / H) * 100}%`,
            transform: `translate(${x(hp.t) > W * 0.7 ? '-105%' : '8px'}, -110%)`,
            background: '#0d1117', border: '1px solid #30363d', borderRadius: '8px', padding: '0.4rem 0.6rem',
            fontSize: '0.72rem', color: '#e6edf3', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}
        >
          <div style={{ color: '#8b949e' }}>{fmtDate(hp.date)}</div>
          <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{fmt(hp.kmpl, 2)} km/L</div>
          <div style={{ color: '#8b949e' }}>{fmt(hp.distance, 0)} km on {fmt(hp.fuel, 2)} L · {hp.method}</div>
        </div>
      )}
    </div>
  );
}
