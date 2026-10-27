// Tiga roda gigi saling mengunci dengan rasio gigi yang benar (16 : 10 : 8) dan arah putar berselang-seling.
// Satu loop = 16 gigi lewat titik kontak → roda besar 1 putaran, sedang 1,6 putaran (= 216°, simetri 5 jari-jari
// & 10 gigi), kecil 2 putaran. Semua bentuk simetris terhadap sisa putarannya, jadi loop mulus tanpa lompatan.
import React from 'react';
import {TAU, inOut, wave, wave01, yoyo} from '../../kit/loop';
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

// Modul gigi M: jari-jari lingkaran jarak bagi rp = M·N/2 (sama untuk semua roda → bisa saling mengunci).
const M = 27;
const ADD = 0.78 * M; // tinggi kepala gigi
const DED = 0.98 * M; // tinggi kaki gigi
type Kind = 'spokes' | 'holes' | 'ring';
type Gear = {n: number; cx: number; cy: number; col: string; kind: Kind; count: number};
const rp = (g: Gear) => (M * g.n) / 2;
const A: Gear = {n: 16, cx: 812, cy: 612, col: C.blue, kind: 'spokes', count: 6};
const B: Gear = {n: 10, cx: 0, cy: 0, col: C.yellow, kind: 'holes', count: 5};
const Cg: Gear = {n: 8, cx: 0, cy: 0, col: C.teal, kind: 'ring', count: 0};
const AB = (-38 * Math.PI) / 180; // arah A → B
const BC = (60 * Math.PI) / 180; // arah B → C
B.cx = A.cx + (rp(A) + rp(B)) * Math.cos(AB);
B.cy = A.cy + (rp(A) + rp(B)) * Math.sin(AB);
Cg.cx = B.cx + (rp(B) + rp(Cg)) * Math.cos(BC);
Cg.cy = B.cy + (rp(B) + rp(Cg)) * Math.sin(BC);
const GEARS = [A, B, Cg];

/**
 * Garis luar roda gigi (gigi ke-0 di sudut 0). Gigi trapesium gemuk: lebar ±0,235 jarak-bagi di lingkaran bagi
 * (celah sedikit lebih lebar dari gigi → ada ruang main, gigi tidak saling menembus).
 */
const gearPoints = (g: Gear): [number, number][] => {
  const r0 = rp(g);
  const ra = r0 + ADD;
  const rf = r0 - DED;
  const pitch = TAU / g.n;
  const pts: [number, number][] = [];
  for (let j = 0; j < g.n; j++) {
    const a = j * pitch;
    for (const [da, r] of [
      [-0.3, rf],
      [-0.16, ra],
      [0.16, ra],
      [0.3, rf],
    ] as const) {
      const ang = a + da * pitch;
      pts.push([r * Math.cos(ang), r * Math.sin(ang)]);
    }
  }
  return pts;
};
const OUT = GEARS.map((g) => roundedPath(gearPoints(g), 9));

/**
 * Sudut roda yang digerakkan agar giginya masuk tepat ke celah roda penggerak (menggelinding tanpa selip).
 * φ = arah penggerak → digerakkan; θ1 = sudut penggerak.
 */
const driven = (g1: Gear, th1: number, g2: Gear, phi: number) => phi + Math.PI - Math.PI / g2.n + ((phi - th1) * g1.n) / g2.n;

/** Sudut tiap roda (rad, positif = searah jarum jam di layar) pada kemajuan δ roda A. */
const angles = (d: number) => {
  const a = d;
  const b = driven(A, a, B, AB);
  const c = driven(B, b, Cg, BC);
  return [a, b, c];
};

const GearBody: React.FC<{g: Gear; i: number; ang: number}> = ({g, i, ang}) => {
  const r0 = rp(g);
  const rf = r0 - DED;
  const deg = (ang * 180) / Math.PI;
  const dark = shade(g.col, -0.15);
  const deep = shade(g.col, -0.3);
  const light = shade(g.col, 0.42);
  const rin = rf - 22; // tepi cincin luar
  const hub = Math.max(30, r0 * 0.27);
  return (
    <g>
      <g transform={`translate(${g.cx} ${g.cy}) rotate(${deg.toFixed(3)})`}>
        <path d={OUT[i]} fill={g.col} />
        {g.kind === 'spokes' ? (
          <g>
            <circle r={rin} fill={dark} />
            {Array.from({length: g.count}, (_, k) => (
              <rect key={k} x={-17} y={0} width={34} height={rin + 6} rx={14} fill={g.col} transform={`rotate(${(k * 360) / g.count})`} />
            ))}
            <circle r={hub + 10} fill={g.col} />
          </g>
        ) : g.kind === 'ring' ? (
          <g>
            <circle r={rin} fill={dark} />
            <circle r={rin - 13} fill={g.col} />
          </g>
        ) : (
          <g>
            <circle r={rin} fill={dark} />
            <circle r={rin - 14} fill={g.col} />
            {Array.from({length: g.count}, (_, k) => {
              const a = (k * TAU) / g.count;
              const rr = (rin - 14 + hub) / 2 + 4;
              return <circle key={k} cx={rr * Math.cos(a)} cy={rr * Math.sin(a)} r={(rin - 14 - hub) * 0.3} fill={dark} />;
            })}
          </g>
        )}
        <circle r={hub} fill={dark} />
        <circle r={hub * 0.52} fill={deep} />
      </g>
      {/* kilau tetap (cahaya dari kiri atas) */}
      <path d={arcPath(g.cx, g.cy, rf - 11, -1.42, -0.52)} fill="none" stroke={light} strokeWidth={9} strokeLinecap="round" />
      <path d={arcPath(g.cx, g.cy, rf - 11, -0.34, -0.2)} fill="none" stroke={light} strokeWidth={9} strokeLinecap="round" />
      <circle cx={g.cx - hub * 0.36} cy={g.cy - hub * 0.36} r={Math.max(5, hub * 0.14)} fill={light} />
    </g>
  );
};

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  // Roda A satu putaran per loop; kecepatan sedikit bergelombang (2 siklus) agar terasa hidup.
  const d = TAU * p + 0.05 * Math.sin(TAU * 2 * p);
  const ang = angles(d);
  const bob = 6 * wave(p, 2);
  const arrow = yoyo(p, 0.08, 0.24, 0.76, 0.92, inOut, inOut);
  const sp = (k: number, ph: number) => 0.65 + 0.35 * wave01(p, k, ph);
  return (
    <g>
      <Shadow cx={975} cy={905} rx={350} ry={30} s={1 - 0.02 * wave(p, 2)} vector={vector} />
      <g transform={`translate(0 ${bob.toFixed(2)})`}>
        {/* tebal (sisi bawah) */}
        {GEARS.map((g, i) => (
          <g key={`t${i}`} transform={`translate(${g.cx + 3} ${g.cy + 13}) rotate(${((ang[i] * 180) / Math.PI).toFixed(3)})`}>
            <path d={OUT[i]} fill={shade(g.col, -0.32)} />
          </g>
        ))}
        {GEARS.map((g, i) => (
          <GearBody key={i} g={g} i={i} ang={ang[i]} />
        ))}
        {/* panah putar: A searah jarum jam, C searah jarum jam (B berlawanan) */}
        {arrow > 0.01 ? (
          <g>
            <RotArrow cx={A.cx} cy={A.cy} r={rp(A) + ADD + 46} a0={3.62} a1={3.62 + 1.0 * arrow} col={C.slate} />
            <RotArrow cx={Cg.cx} cy={Cg.cy} r={rp(Cg) + ADD + 44} a0={0.62} a1={0.62 + 1.12 * arrow} col={C.slate} />
          </g>
        ) : null}
      </g>
      <Sparkle x={B.cx + 230} y={B.cy - 80} r={26 * sp(2, 0)} color={C.yellow} rot={15} />
      <Sparkle x={B.cx + 280} y={B.cy - 2} r={13 * sp(2, 0.4)} color={C.sky} />
      <Sparkle x={A.cx - 300} y={A.cy - 230} r={20 * sp(2, 0.25)} color={C.yellow} rot={10} />
      <Sparkle x={A.cx - 236} y={A.cy - 292} r={11 * sp(2, 0.7)} color={C.teal} />
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
  const L = 26;
  const Wd = 21;
  const head: [number, number][] = [
    [tip[0] + tx * L, tip[1] + ty * L],
    [tip[0] + nx * Wd, tip[1] + ny * Wd],
    [tip[0] - nx * Wd, tip[1] - ny * Wd],
  ];
  return (
    <g>
      <path d={arcPath(cx, cy, r, Math.min(a0, a1), Math.max(a0, a1))} fill="none" stroke={col} strokeWidth={12} strokeLinecap="round" />
      <path d={roundedPath(head, 4)} fill={col} />
    </g>
  );
};
