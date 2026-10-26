// Pohon rindang bergoyang tertiup angin (batang melentur, tajuk berayun berlapis), daun jingga-kuning
// gugur berputar-putar, mendarat di rumput lalu memudar; garis angin melintas. Semua periodik → loop mulus.
import React from 'react';
import {clamp, inOut, mix, mod, out, outBack, seg, TAU, wave} from '../../kit/loop';
import {C, shade} from '../../kit/palette';
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

const LEAVES = [
  {o: 0.0, x0: -150, y0: 540, drift: 150, col: C.orange},
  {o: 0.14, x0: 120, y0: 556, drift: 140, col: C.yellow},
  {o: 0.29, x0: -40, y0: 586, drift: 170, col: C.orange},
  {o: 0.43, x0: 150, y0: 520, drift: 100, col: C.lime},
  {o: 0.57, x0: -210, y0: 470, drift: 210, col: C.yellow},
  {o: 0.71, x0: 60, y0: 590, drift: 160, col: C.orange},
  {o: 0.86, x0: -100, y0: 560, drift: 230, col: C.yellow},
];

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
    const fallT = seg(t, 0.04, 0.66, (u) => u);
    const land = t > 0.66;
    const fade = 1 - seg(t, 0.86, 0.96, inOut);
    if (appear <= 0.01 || fade <= 0.01) return null;
    if (vector && (t < 0.14 || t > 0.6)) return null;
    const startX = CAN.x + lf.x0;
    const groundY = GROUND_Y - 4 + (i % 3) * 6;
    const yFall = mix(lf.y0, groundY, inOutFall(fallT));
    const x = startX + lf.drift * out(fallT) + 34 * Math.sin(TAU * 2 * fallT) * (1 - fallT * 0.3);
    const r = land ? 8 * (i % 2 ? 1 : -1) : 40 * Math.sin(TAU * 1.5 * fallT + i);
    const flip = land ? 1 : 0.3 + 0.7 * Math.abs(Math.cos(TAU * 1.25 * fallT + i * 0.5));
    const sy = land ? 0.55 : 1;
    return (
      <g key={i} transform={`translate(${x.toFixed(2)} ${yFall.toFixed(2)}) rotate(${r.toFixed(2)}) scale(${(flip * appear).toFixed(3)} ${(sy * appear).toFixed(3)})`} opacity={vector || fade >= 1 ? undefined : fade}>
        <path d={leafD(60)} fill={lf.col} />
        <path d={`M-30,0 Q-6,25.2 30,0 Z`} fill={shade(lf.col, -0.15)} />
        <path d="M-24,0 L20,0" stroke={shade(lf.col, 0.4)} strokeWidth={5} strokeLinecap="round" />
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
      {/* batang & cabang */}
      <path d={trunk} fill={C.brown} />
      <path d={trunkShade} fill={shade(C.brown, -0.18)} />
      <g transform={`rotate(${(canRot * 0.85).toFixed(3)} ${BASE.x} ${BASE.y})`}>
        <path d="M948,640 Q900,600 862,560" fill="none" stroke={C.brown} strokeWidth={20} strokeLinecap="round" />
        <path d="M972,620 Q1020,584 1052,540" fill="none" stroke={shade(C.brown, -0.1)} strokeWidth={18} strokeLinecap="round" />
      </g>
      {/* tajuk berlapis */}
      <g transform={`rotate(${canRot.toFixed(3)} ${BASE.x} ${BASE.y})`}>
        {canopy(BLOBS, shade(C.green, -0.2), 12, 20, 0.6)}
        {canopy(BLOBS.slice(2, 5).concat([BLOBS[0]]), shade(C.green, 0.28), -12, -14, 1)}
        {canopy(BLOBS, C.green, 0, 0, 1)}
        {/* gumpal dalam: bulan sabit gelap di sisi kanan-bawah */}
        {canopy(INNER, shade(C.green, -0.1), 8, 12, 1.2)}
        {canopy(INNER, C.green, 0, 0, 1.2)}
        {canopy(LIGHT, shade(C.green, 0.14), 0, 0, 1.4)}
        {[
          [-150, -150, 12],
          [-60, -228, 10],
          [-214, -40, 10],
        ].map(([x, y, r], i) => (
          <circle key={i} cx={CAN.x + x} cy={CAN.y + y} r={r} fill={shade(C.green, 0.45)} />
        ))}
      </g>
      {/* garis angin: busur tetap, segmen terang menyapu */}
      {[
        {x: 560, y: 300, w: 300, ph: 0},
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

const inOutFall = (u: number) => 0.15 * u + 0.85 * u * u * (3 - 2 * u);
