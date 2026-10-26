// Komponen bentuk bersama. Semua isi opak kecuali Shadow/Glow (yang otomatis opak di mode vektor).
import React from 'react';
import {TAU} from './loop';

/** Bayangan lantai elips. Motion: hitam transparan lembut; vektor: abu-abu opak. */
export const Shadow: React.FC<{cx: number; cy: number; rx: number; ry?: number; s?: number; vector?: boolean; strength?: number}> = ({
  cx,
  cy,
  rx,
  ry,
  s = 1,
  vector,
  strength = 1,
}) => {
  const RX = rx * s;
  const RY = (ry ?? rx * 0.16) * s;
  if (vector) return <ellipse cx={cx} cy={cy} rx={RX} ry={RY} fill="#E3E8F0" />;
  return (
    <g>
      {[1.15, 1.0, 0.86, 0.72, 0.58].map((k, i) => (
        <ellipse key={i} cx={cx} cy={cy} rx={RX * k} ry={RY * k} fill="#0B1020" opacity={0.045 * strength} />
      ))}
    </g>
  );
};

/** Cahaya lembut (lingkaran berlapis). Di mode vektor tidak digambar. */
export const Glow: React.FC<{cx: number; cy: number; r: number; color: string; strength?: number; vector?: boolean}> = ({cx, cy, r, color, strength = 1, vector}) => {
  if (vector) return null;
  return (
    <g>
      {[1, 0.75, 0.5].map((k, i) => (
        <circle key={i} cx={cx} cy={cy} r={r * k} fill={color} opacity={0.08 * strength * (i + 1)} />
      ))}
    </g>
  );
};

/** Transformasi di sekitar titik pusat (ox, oy). */
export const T: React.FC<{
  x?: number;
  y?: number;
  s?: number;
  sx?: number;
  sy?: number;
  r?: number;
  ox?: number;
  oy?: number;
  o?: number;
  children: React.ReactNode;
}> = ({x = 0, y = 0, s = 1, sx, sy, r = 0, ox = 0, oy = 0, o, children}) => (
  <g
    transform={`translate(${x + ox} ${y + oy}) rotate(${r}) scale(${(sx ?? 1) * s} ${(sy ?? 1) * s}) translate(${-ox} ${-oy})`}
    opacity={o === undefined || o >= 1 ? undefined : Math.max(0, o)}
  >
    {children}
  </g>
);

/** Bintang kilau 4 sudut. */
export const Sparkle: React.FC<{x: number; y: number; r: number; color: string; rot?: number}> = ({x, y, r, color, rot = 0}) => {
  if (r <= 0.2) return null;
  const k = 0.28;
  const d = `M0,${-r} Q${r * k},${-r * k} ${r},0 Q${r * k},${r * k} 0,${r} Q${-r * k},${r * k} ${-r},0 Q${-r * k},${-r * k} 0,${-r} Z`;
  return <path d={d} fill={color} transform={`translate(${x} ${y}) rotate(${rot})`} />;
};

/** Poligon beraturan (titik-titik) berpusat di (cx, cy). */
export const polygon = (cx: number, cy: number, r: number, n: number, rot = -Math.PI / 2) =>
  Array.from({length: n}, (_, i) => {
    const a = rot + (i * TAU) / n;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as [number, number];
  });

/** Path tertutup dengan sudut membulat dari daftar titik. */
export const roundedPath = (pts: [number, number][], radius: number) => {
  const n = pts.length;
  let d = '';
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const v1 = [p0[0] - p1[0], p0[1] - p1[1]];
    const v2 = [p2[0] - p1[0], p2[1] - p1[1]];
    const l1 = Math.hypot(v1[0], v1[1]);
    const l2 = Math.hypot(v2[0], v2[1]);
    const r = Math.min(radius, l1 / 2, l2 / 2);
    const a = [p1[0] + (v1[0] / l1) * r, p1[1] + (v1[1] / l1) * r];
    const b = [p1[0] + (v2[0] / l2) * r, p1[1] + (v2[1] / l2) * r];
    d += `${i === 0 ? 'M' : 'L'}${a[0].toFixed(2)},${a[1].toFixed(2)} Q${p1[0].toFixed(2)},${p1[1].toFixed(2)} ${b[0].toFixed(2)},${b[1].toFixed(2)} `;
  }
  return d + 'Z';
};

/** Bintang n sudut. */
export const starPts = (cx: number, cy: number, R: number, r: number, n = 5, rot = -Math.PI / 2) =>
  Array.from({length: n * 2}, (_, i) => {
    const a = rot + (i * Math.PI) / n;
    const rr = i % 2 ? r : R;
    return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)] as [number, number];
  });

/** Roda gigi (path) berpusat di (cx, cy). */
export const gearPath = (cx: number, cy: number, R: number, teeth: number, depth = 0.18, rot = 0) => {
  const pts: [number, number][] = [];
  const n = teeth * 4;
  for (let i = 0; i < n; i++) {
    const a = rot + (i * TAU) / n;
    const k = i % 4;
    const rr = k === 0 || k === 1 ? R : R * (1 - depth);
    pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
  }
  return roundedPath(pts, R * 0.05);
};

/** Busur (path terbuka) untuk cincin progres: sudut dalam radian, 0 = atas, searah jarum jam. */
export const arcPath = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const p = (a: number) => [cx + r * Math.sin(a), cy - r * Math.cos(a)];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  const large = Math.abs(a1 - a0) > Math.PI ? 1 : 0;
  return `M${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${large} ${a1 > a0 ? 1 : 0} ${x1.toFixed(2)},${y1.toFixed(2)}`;
};
