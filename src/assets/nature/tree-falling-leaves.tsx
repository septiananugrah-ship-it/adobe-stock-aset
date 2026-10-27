// Pohon rindang bergoyang tertiup angin (batang melentur, tajuk berayun berlapis), daun jingga-kuning
// gugur berputar-putar, mendarat di rumput lalu memudar; garis angin melintas. Semua periodik → loop mulus.
import React from 'react';
import {clamp, inOut, mix, mod, outBack, seg, TAU, wave} from '../../kit/loop';
import {blend, C, shade} from '../../kit/palette';
import {Shadow} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'nature-tree-falling-leaves',
  theme: 'nature',
  title: 'Tree swaying in the wind with falling autumn leaves landing on grass, nature seamless loop animation with alpha channel',
  keywords: [
    'tree', 'falling leaves', 'autumn', 'fall', 'wind', 'swaying', 'leaves', 'nature', 'season', 'park', 'garden',
    'forest', 'breeze', 'windy', 'oak', 'foliage', 'plant', 'green', 'environment', 'ecology', 'eco', 'outdoor',
    'landscape', 'weather', 'seasonal', 'flat design', 'illustration', 'icon', 'cartoon', 'animation',
    'motion graphics', 'seamless loop', 'looped', 'alpha channel', 'transparent background', 'isolated', '4k',
    'explainer', 'presentation', 'social media',
  ],
  category: 14,
  seconds: 8,
  vectorP: 0.3,
};

const BASE = {x: 960, y: 826};
const CAN = {x: 960, y: 420}; // pusat tajuk
const GROUND_Y = 838;
const BLOBS: [number, number, number][] = [
  [-178, 30, 92],
  [178, 22, 96],
  [-112, -78, 122],
  [104, -88, 124],
  [0, -150, 118],
  [-60, 40, 128],
  [72, 36, 126],
  [0, -40, 150],
];
const INNER: [number, number, number][] = [
  [-96, -46, 74],
  [70, -66, 70],
  [-8, 52, 78],
  [-150, 70, 52],
  [150, 60, 56],
];
// bintik kilau kecil di tajuk (bagian terkena cahaya)
const LIGHT: [number, number, number][] = [
  [-150, -120, 34],
  [-34, -206, 30],
  [80, -150, 26],
];

const rot = (x: number, y: number, ox: number, oy: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  const dx = x - ox;
  const dy = y - oy;
  return [ox + dx * Math.cos(a) - dy * Math.sin(a), oy + dx * Math.sin(a) + dy * Math.cos(a)] as [number, number];
};

const leafD = (l: number) => `M${-l / 2},0 Q${-l * 0.1},${-l * 0.42} ${l / 2},0 Q${-l * 0.1},${l * 0.42} ${-l / 2},0 Z`;

// daun gugur: [x awal, drift ke kanan (angin), mendarat di x0 + drift]
const LEAVES = [
  {o: 0.0, x0: 720, y0: 560, drift: 96, col: C.yellow, land: -12},
  {o: 0.14, x0: 1060, y0: 568, drift: 118, col: C.coral, land: 14},
  {o: 0.29, x0: 860, y0: 590, drift: 196, col: C.orange, land: -6},
  {o: 0.43, x0: 1150, y0: 520, drift: 52, col: C.yellow, land: 20},
  {o: 0.57, x0: 770, y0: 500, drift: 64, col: C.coral, land: 8},
  {o: 0.71, x0: 980, y0: 586, drift: 176, col: C.yellow, land: -18},
  {o: 0.86, x0: 690, y0: 540, drift: 196, col: C.orange, land: 10},
];
// daun yang sudah tergeletak di rumput (tetap)
const PILE: [number, number, number, string][] = [
  [760, 826, -16, C.coral],
  [804, 834, 12, C.yellow],
  [1112, 830, -10, C.orange],
  [1160, 822, 18, C.yellow],
  [1208, 834, -22, C.coral],
];

const Leaf: React.FC<{col: string}> = ({col}) => (
  <g>
    <path d="M-34,0 L-40,0" stroke={shade(col, -0.25)} strokeWidth={5} strokeLinecap="round" />
    <path d={leafD(64)} fill={col} />
    <path d="M-32,0 Q-6,26.9 32,0 Z" fill={shade(col, -0.16)} />
    <path d="M-24,0 L22,0" stroke={shade(col, 0.42)} strokeWidth={5} strokeLinecap="round" />
  </g>
);

// jatuh dari diam lalu kecepatan tetap (kecepatan terminal)
const fallY = (u: number) => (u < 0.18 ? (u * u) / 0.36 : u - 0.09) / 0.91;

// warna tajuk musim gugur
const LEAF_MAIN = C.orange;
const LEAF_DARK = shade(C.orange, -0.2);
const LEAF_LIGHT = blend(C.orange, C.yellow, 0.55);

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  const sway = 2.6 * wave(p, 2) + 0.9 * wave(p, 3, 0.2);
  const gust = 0.5 + 0.5 * wave(p, 2, -0.08);
  // batang melentur: puncak ikut rotasi, dasar tetap
  const top = rot(CAN.x, 600, BASE.x, BASE.y, sway * 0.7);
  const trunk = `M${BASE.x - 44},${BASE.y + 6} C${BASE.x - 30},${BASE.y - 90} ${top[0] - 24},${top[1] + 90} ${top[0] - 22},${top[1]} L${top[0] + 22},${top[1]} C${top[0] + 24},${top[1] + 90} ${BASE.x + 30},${BASE.y - 90} ${BASE.x + 44},${BASE.y + 6} Z`;
  const trunkShade = `M${BASE.x + 6},${BASE.y + 6} C${BASE.x + 8},${BASE.y - 90} ${top[0] + 4},${top[1] + 90} ${top[0] + 4},${top[1]} L${top[0] + 22},${top[1]} C${top[0] + 24},${top[1] + 90} ${BASE.x + 30},${BASE.y - 90} ${BASE.x + 44},${BASE.y + 6} Z`;
  const canRot = sway;
  const canopy = (blobs: [number, number, number][], fill: string, dx: number, dy: number, jig: number) =>
    blobs.map(([x, y, r], i) => (
      <circle key={i} cx={CAN.x + x + dx + jig * 3 * wave(p, 3, i * 0.13)} cy={CAN.y + y + dy + jig * 2 * wave(p, 2, i * 0.21)} r={r} fill={fill} />
    ));
  const leaves = LEAVES.map((lf, i) => {
    const t = mod(p + lf.o, 1);
    const appear = seg(t, 0, 0.06, outBack);
    const fade = 1 - seg(t, 0.86, 0.96, inOut);
    if (appear <= 0.01 || fade <= 0.01) return null;
    if (vector && (t < 0.16 || t > 0.6)) return null;
    // u: kemajuan jatuh 0..1 (0,04–0,68), lalu tergeletak
    const u = seg(t, 0.04, 0.68, (v) => v);
    const env = 1 - seg(u, 0.72, 1, inOut); // ayunan mereda menjelang mendarat
    const lay = seg(u, 0.84, 1, inOut); // daun merebah ke tanah
    const groundY = GROUND_Y - 16 + (i % 3) * 6;
    const ph = TAU * (1.25 * u) + i * 0.9; // ±2,5 ayunan selama jatuh
    const x = lf.x0 + lf.drift * u + 34 * Math.sin(ph) * env;
    const y = mix(lf.y0, groundY, fallY(u)) - 9 * (1 - Math.cos(2 * ph)) * env * 0.5;
    const r = mix(30 * Math.cos(ph), lf.land, 1 - env) + 6 * wave(p, 4, i * 0.2) * (1 - lay);
    const sx = mix(0.62 + 0.38 * Math.cos(TAU * 1.6 * u + i), 1, 1 - env);
    const sy = mix(1, 0.55, lay);
    return (
      <g key={i} transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${r.toFixed(2)}) scale(${(sx * appear).toFixed(3)} ${(sy * appear).toFixed(3)})`} opacity={vector || fade >= 1 ? undefined : fade}>
        <Leaf col={lf.col} />
      </g>
    );
  });
  return (
    <g>
      <Shadow cx={960} cy={852} rx={330} ry={28} vector={vector} />
      {/* rumput */}
      <path d={`M640,${GROUND_Y + 14} Q646,${GROUND_Y - 30} 760,${GROUND_Y - 36} L1160,${GROUND_Y - 36} Q1274,${GROUND_Y - 30} 1280,${GROUND_Y + 14} Z`} fill={C.green} />
      <rect x={640} y={GROUND_Y} width={640} height={20} rx={10} fill={shade(C.green, -0.18)} />
      <path d={`M700,${GROUND_Y - 18} Q730,${GROUND_Y - 32} 790,${GROUND_Y - 34}`} fill="none" stroke={shade(C.green, 0.4)} strokeWidth={10} strokeLinecap="round" />
      {/* daun yang sudah gugur di rumput */}
      {PILE.map(([x, y, a, col], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${a}) scale(0.9 0.5)`}>
          <Leaf col={col} />
        </g>
      ))}
      {/* batang & cabang */}
      <path d={trunk} fill={C.brown} />
      <path d={trunkShade} fill={shade(C.brown, -0.18)} />
      <g transform={`rotate(${(canRot * 0.85).toFixed(3)} ${BASE.x} ${BASE.y})`}>
        <path d="M948,640 Q900,600 862,560" fill="none" stroke={C.brown} strokeWidth={20} strokeLinecap="round" />
        <path d="M972,620 Q1020,584 1052,540" fill="none" stroke={shade(C.brown, -0.1)} strokeWidth={18} strokeLinecap="round" />
      </g>
      {/* tajuk berlapis */}
      <g transform={`rotate(${canRot.toFixed(3)} ${BASE.x} ${BASE.y})`}>
        {canopy(BLOBS, LEAF_DARK, 12, 20, 0.6)}
        {canopy(BLOBS.slice(2, 5).concat([BLOBS[0]]), LEAF_LIGHT, -12, -14, 1)}
        {canopy(BLOBS, LEAF_MAIN, 0, 0, 1)}
        {/* gumpal dalam: bulan sabit gelap di sisi kanan-bawah */}
        {canopy(INNER, shade(LEAF_MAIN, -0.1), 8, 12, 1.2)}
        {canopy(INNER, LEAF_MAIN, 0, 0, 1.2)}
        {canopy(LIGHT, blend(LEAF_MAIN, C.yellow, 0.3), 0, 0, 1.4)}
        {[
          [-150, -150, 12],
          [-60, -228, 10],
          [-214, -40, 10],
        ].map(([x, y, r], i) => (
          <circle key={i} cx={CAN.x + x} cy={CAN.y + y} r={r} fill={blend(C.yellow, C.white, 0.35)} />
        ))}
      </g>
      {/* garis angin: busur tetap, segmen terang menyapu */}
      {[
        {x: 430, y: 300, w: 250, ph: 0},
        {x: 1130, y: 650, w: 240, ph: 0.5},
      ].map((w, i) => {
        const t = mod(p * 2 + w.ph, 1);
        const d = `M${w.x},${w.y} c${w.w * 0.35},-30 ${w.w * 0.7},-30 ${w.w},-6`;
        const L = w.w * 1.05;
        const dash = L * 0.45;
        const off = vector ? -L * 0.3 : mix(dash, -L, t);
        const f = vector ? 1 : clamp(Math.sin(Math.PI * t) * 2) * (0.6 + 0.4 * gust);
        if (f <= 0.01) return null;
        return (
          <path key={i} d={d} fill="none" stroke={C.sky} strokeWidth={10} strokeLinecap="round" strokeDasharray={`${dash.toFixed(1)} ${(L * 2).toFixed(1)}`} strokeDashoffset={off.toFixed(1)} opacity={vector || f >= 1 ? undefined : f} />
        );
      })}
      {leaves}
    </g>
  );
};

