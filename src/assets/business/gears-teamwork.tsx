// Tiga roda gigi saling mengunci dan berputar dengan rasio gigi yang benar (18 : 12 : 9).
// Satu loop = 18 gigi lewat titik kontak → roda besar 1 putaran, sedang 1,5, kecil 2 (loop mulus).
import React from 'react';
import {TAU, inOut, mod, wave, wave01, yoyo} from '../../kit/loop';
import {C, shade} from '../../kit/palette';
import {Shadow, Sparkle, arcPath, roundedPath} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'business-gears-teamwork',
  theme: 'business',
  title: 'Three interlocking gears rotating together, teamwork and business process animation, seamless loop with alpha channel',
  keywords: [
    'gears', 'cogwheels', 'teamwork', 'business process', 'mechanism', 'cooperation', 'workflow', 'engineering', 'settings',
    'automation', 'machine', 'rotation', 'system', 'strategy', 'efficiency', 'productivity', 'solution', 'integration',
    'management', 'operations', 'industry', 'technology', 'progress', 'development', 'icon', 'flat design', 'illustration',
    'infographic', 'presentation', 'explainer', 'social media', 'animation', 'motion graphics', 'seamless loop', 'looped',
    'alpha channel', 'transparent background', 'isolated', '4k', 'business',
  ],
  category: 3,
  seconds: 8,
  vectorP: 0.5,
};

// Modul gigi m: jari-jari jarak bagi rp = m·N/2, puncak rp + m, kaki rp − 1,25 m.
const M = 24;
type Gear = {n: number; cx: number; cy: number; col: string; spokes: number};
const A: Gear = {n: 18, cx: 812, cy: 590, col: C.blue, spokes: 6};
const AB = (-36 * Math.PI) / 180; // arah A → B
const BC = (58 * Math.PI) / 180; // arah B → C
const rp = (g: Gear) => (M * g.n) / 2;
const B: Gear = {n: 12, cx: 0, cy: 0, col: C.yellow, spokes: 4};
B.cx = A.cx + (rp(A) + rp(B)) * Math.cos(AB);
B.cy = A.cy + (rp(A) + rp(B)) * Math.sin(AB);
const Cg: Gear = {n: 9, cx: 0, cy: 0, col: C.teal, spokes: 5};
Cg.cx = B.cx + (rp(B) + rp(Cg)) * Math.cos(BC);
Cg.cy = B.cy + (rp(B) + rp(Cg)) * Math.sin(BC);

/** Garis luar roda gigi dengan gigi trapesium (gigi ke-0 di sudut 0, sumbu +x). */
const gearOutline = (g: Gear) => {
  const r0 = rp(g);
  const ra = r0 + M * 0.92;
  const rf = r0 - M * 1.1;
  const pitch = TAU / g.n;
  const pts: [number, number][] = [];
  for (let j = 0; j < g.n; j++) {
    const a = j * pitch;
    for (const [da, r] of [
      [-0.27, rf],
      [-0.135, ra],
      [0.135, ra],
      [0.27, rf],
    ] as const) {
      const ang = a + da * pitch;
      pts.push([r * Math.cos(ang), r * Math.sin(ang)]);
    }
  }
  return roundedPath(pts, 7);
};
const OUT = [A, B, Cg].map(gearOutline);

/** Sudut (rad) tiap roda pada kemajuan δ (rad roda A). Fase dipilih agar gigi A masuk celah B, dst. */
const angles = (d: number) => {
  const a = AB + d;
  // B: celah menghadap A (arah AB+π) saat A punya gigi di arah AB
  const b = AB + Math.PI + Math.PI / B.n - (d * A.n) / B.n;
  // C: saat d = 0 gigi B terdekat berada e rad melewati arah BC; B maju +e setara C mundur e·nB/nC
  const pitchB = TAU / B.n;
  const e = mod(AB + Math.PI + Math.PI / B.n - BC, pitchB);
  const c = BC + Math.PI + Math.PI / Cg.n - (e * B.n) / Cg.n + (d * A.n) / Cg.n;
  return [a, b, c];
};

const GearBody: React.FC<{g: Gear; path: string; ang: number; vector?: boolean}> = ({g, path, ang}) => {
  const r0 = rp(g);
  const rf = r0 - M * 1.1;
  const deg = (ang * 180) / Math.PI;
  const dark = shade(g.col, -0.16);
  const deep = shade(g.col, -0.3);
  const rin = rf - 26;
  const hub = Math.max(30, r0 * 0.3);
  return (
    <g>
      <g transform={`translate(${g.cx} ${g.cy}) rotate(${deg})`}>
        <path d={path} fill={g.col} />
        <circle r={rin} fill={dark} />
        {g.spokes > 0
          ? Array.from({length: g.spokes}, (_, i) => (
              <rect key={i} x={-15} y={0} width={30} height={rin + 4} rx={12} fill={g.col} transform={`rotate(${(i * 360) / g.spokes + 90})`} />
            ))
          : [0, 1, 2].map((i) => {
              const a = (i * TAU) / 3;
              const rr = (rin + hub) / 2;
              return <circle key={i} cx={rr * Math.cos(a)} cy={rr * Math.sin(a)} r={(rin - hub) * 0.32} fill={deep} />;
            })}
        <circle r={hub} fill={g.col} />
        <circle r={hub * 0.5} fill={deep} />
        {/* tanda kecil pada hub agar putaran terlihat */}
        <rect x={hub * 0.5 + 6} y={-5} width={hub * 0.32} height={10} rx={5} fill={shade(g.col, 0.38)} />
      </g>
      {/* kilau tetap (cahaya dari kiri atas) */}
      <path d={arcPath(g.cx, g.cy, rf - 13, -1.35, -0.45)} fill="none" stroke={shade(g.col, 0.42)} strokeWidth={9} strokeLinecap="round" />
      <path d={arcPath(g.cx, g.cy, rf - 13, -0.25, -0.12)} fill="none" stroke={shade(g.col, 0.42)} strokeWidth={9} strokeLinecap="round" />
      <circle cx={g.cx - hub * 0.42} cy={g.cy - hub * 0.42} r={Math.max(6, hub * 0.16)} fill={shade(g.col, 0.42)} />
    </g>
  );
};

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  // 18 gigi per loop: roda A satu putaran penuh. Kecepatan sedikit bergelombang (2 siklus) agar hidup.
  const d = TAU * (p + (0.035 / TAU) * Math.sin(TAU * 2 * p));
  const ang = angles(d);
  const gears = [A, B, Cg];
  const bob = 5 * wave(p, 2);
  const arrow = yoyo(p, 0.08, 0.22, 0.78, 0.92, inOut, inOut);
  const sp = (k: number, ph: number) => 0.7 + 0.3 * wave01(p, k, ph);
  return (
    <g>
      <Shadow cx={960} cy={900} rx={340} ry={30} s={1 - 0.02 * wave(p, 2)} vector={vector} />
      <g transform={`translate(0 ${bob.toFixed(2)})`}>
        {/* tebal (sisi bawah) */}
        {gears.map((g, i) => (
          <g key={`t${i}`} transform={`translate(${g.cx + 4} ${g.cy + 14}) rotate(${(ang[i] * 180) / Math.PI})`}>
            <path d={OUT[i]} fill={shade(g.col, -0.32)} />
          </g>
        ))}
        {gears.map((g, i) => (
          <GearBody key={i} g={g} path={OUT[i]} ang={ang[i]} vector={vector} />
        ))}
        {/* panah putar di sekitar roda besar (searah putaran A = searah jarum jam) */}
        {arrow > 0.01 ? (
          <g>
            <RotArrow cx={A.cx} cy={A.cy} r={rp(A) + 74} a0={3.55} a1={3.55 + 1.05 * arrow} col={C.slate} />
            <RotArrow cx={Cg.cx} cy={Cg.cy} r={rp(Cg) + 66} a0={0.7} a1={0.7 + 1.1 * arrow} col={C.slate} />
          </g>
        ) : null}
      </g>
      <Sparkle x={B.cx + 210} y={B.cy - 110} r={24 * sp(2, 0)} color={C.yellow} rot={15} />
      <Sparkle x={B.cx + 268} y={B.cy - 30} r={13 * sp(2, 0.4)} color={C.sky} />
      <Sparkle x={A.cx - 300} y={A.cy - 190} r={18 * sp(2, 0.25)} color={C.yellow} rot={10} />
      <Sparkle x={A.cx - 250} y={A.cy - 250} r={10 * sp(2, 0.7)} color={C.teal} />
    </g>
  );
};

/** Busur berpanah: dari a0 ke a1 (rad, 0 = atas, searah jarum jam bila a1 > a0). */
const RotArrow: React.FC<{cx: number; cy: number; r: number; a0: number; a1: number; col: string}> = ({cx, cy, r, a0, a1, col}) => {
  if (Math.abs(a1 - a0) < 0.05) return null;
  const dir = a1 > a0 ? 1 : -1;
  const tip = [cx + r * Math.sin(a1), cy - r * Math.cos(a1)];
  // arah tangen searah gerak
  const tx = Math.cos(a1) * dir;
  const ty = Math.sin(a1) * dir;
  const nx = -ty;
  const ny = tx;
  const L = 24;
  const Wd = 20;
  const head = `M${tip[0] + tx * L},${tip[1] + ty * L} L${tip[0] + nx * Wd},${tip[1] + ny * Wd} L${tip[0] - nx * Wd},${tip[1] - ny * Wd} Z`;
  return (
    <g>
      <path d={arcPath(cx, cy, r, Math.min(a0, a1), Math.max(a0, a1))} fill="none" stroke={col} strokeWidth={12} strokeLinecap="round" />
      <path d={roundedPath(parsePts(head), 4)} fill={col} />
    </g>
  );
};
const parsePts = (d: string) =>
  d
    .replace(/[MLZ]/g, ' ')
    .trim()
    .split(/\s+/)
    .map((s) => s.split(',').map(Number) as [number, number]);
