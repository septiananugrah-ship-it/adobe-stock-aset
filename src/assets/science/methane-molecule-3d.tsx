// Molekul metana (CH₄) bola-dan-batang dengan geometri tetrahedral nyata (sudut H–C–H 109,5°)
// yang berputar 360° dalam 3D. Cahaya tetap dari kiri atas; atom & ikatan diurutkan menurut kedalaman.
import React from 'react';
import {TAU, wave, wave01} from '../../kit/loop';
import {C, blend, shade} from '../../kit/palette';
import {Glow, Sparkle} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'science-methane-molecule-3d',
  theme: 'science',
  title: 'Methane molecule ball and stick model rotating in 3D with tetrahedral geometry, chemistry animation, seamless loop with alpha channel',
  keywords: [
    'methane', 'molecule', 'ball and stick', 'molecular model', 'chemistry', 'tetrahedral', 'carbon', 'hydrogen', 'atom',
    'chemical bond', 'organic chemistry', 'science', 'structure', '3d', 'rotating', 'spinning', 'gas', 'natural gas',
    'greenhouse gas', 'hydrocarbon', 'education', 'school', 'laboratory', 'research', 'icon', 'flat design', 'illustration',
    'animation', 'motion graphics', 'seamless loop', 'looped', 'alpha channel', 'transparent background', 'isolated',
    'explainer', 'presentation', 'social media', '4k', 'geometry', 'compound',
  ],
  category: 16,
  seconds: 8,
  vectorP: 0.03,
};

const CX = 960;
const CY = 540;
const BOND = 300;
const F = 1500; // jarak kamera (perspektif lembut)
const R_C = 124;
const R_H = 84;
const CARBON = blend(C.slate, C.steel, 0.3);
const HYDRO = C.cloud;
const STICK = C.mist;

// Tetrahedron: satu H ke atas, tiga di bawah (cos sudut = −1/3 → 109,47°)
const S = Math.sqrt(8) / 3;
const H_DIRS: [number, number, number][] = [
  [0, -1, 0],
  ...[0, 1, 2].map((i) => [S * Math.cos((i * TAU) / 3 + 0.5), 1 / 3, S * Math.sin((i * TAU) / 3 + 0.5)] as [number, number, number]),
];

const rotY = ([x, y, z]: number[], a: number) => [x * Math.cos(a) + z * Math.sin(a), y, -x * Math.sin(a) + z * Math.cos(a)];
const rotX = ([x, y, z]: number[], a: number) => [x, y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)];
const rotZ = ([x, y, z]: number[], a: number) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a), z];

/** Bola datar dengan sisi gelap & kilau tetap (cahaya kiri atas). */
const Ball: React.FC<{x: number; y: number; r: number; c: string; dark: string}> = ({x, y, r, c, dark}) => (
  <g>
    <circle cx={x} cy={y} r={r} fill={dark} />
    <circle cx={x - r * 0.09} cy={y - r * 0.09} r={r * 0.85} fill={c} />
    <ellipse cx={x - r * 0.36} cy={y - r * 0.4} rx={r * 0.26} ry={r * 0.16} fill={shade(c, 0.75)} transform={`rotate(-38 ${x - r * 0.36} ${y - r * 0.4})`} />
    <circle cx={x - r * 0.08} cy={y - r * 0.5} r={r * 0.07} fill={shade(c, 0.75)} />
  </g>
);

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  const a = TAU * p;
  const bob = 10 * wave(p, 2);
  const proj = (v: number[]) => {
    // orientasi awal miring (tak ada ikatan sejajar sumbu putar) → semua H ikut berputar
    let q = rotZ(rotX(v, 0.62), 0.3);
    q = rotY(q, a);
    q = rotX(q, -0.3);
    const k = F / (F - q[2] * BOND);
    return {x: CX + q[0] * BOND * k, y: CY + 20 + q[1] * BOND * k + bob, z: q[2], k};
  };
  const c0 = {x: CX, y: CY + 20 + bob, z: 0, k: 1};
  const items: {z: number; el: React.ReactNode}[] = [];
  items.push({z: 0, el: <Ball key="c" x={c0.x} y={c0.y} r={R_C} c={CARBON} dark={shade(CARBON, -0.28)} />});
  H_DIRS.forEach((d, i) => {
    const h = proj(d);
    // batang: dari pusat C ke pusat H, tebal mengikuti perspektif, kilau tipis di satu sisi
    const dx = h.x - c0.x;
    const dy = h.y - c0.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const w = 40 * (0.5 + 0.5 * h.k);
    const off = (w / 2) * 0.42;
    items.push({
      z: h.z / 2 - 0.001,
      el: (
        <g key={`b${i}`}>
          <path d={`M${c0.x},${c0.y} L${h.x},${h.y}`} stroke={shade(STICK, -0.14)} strokeWidth={w} strokeLinecap="round" />
          <path d={`M${c0.x + nx * off},${c0.y + ny * off} L${h.x + nx * off},${h.y + ny * off}`} stroke={STICK} strokeWidth={w * 0.5} strokeLinecap="round" />
        </g>
      ),
    });
    items.push({z: h.z, el: <Ball key={`h${i}`} x={h.x} y={h.y} r={R_H * h.k} c={HYDRO} dark={blend(C.mist, C.steel, 0.45)} />});
  });
  items.sort((u, v) => u.z - v.z);
  return (
    <g>
      <Glow cx={CX} cy={CY + 20} r={420} color={C.sky} strength={0.4 + 0.2 * wave01(p, 2)} vector={vector} />
      {items.map((it) => it.el)}
      <Sparkle x={CX + 440} y={CY - 260} r={26 * (0.6 + 0.4 * wave01(p, 2))} color={C.yellow} rot={12} />
      <Sparkle x={CX + 500} y={CY - 180} r={13 * (0.6 + 0.4 * wave01(p, 2, 0.4))} color={C.sky} />
      <Sparkle x={CX - 470} y={CY + 280} r={22 * (0.6 + 0.4 * wave01(p, 2, 0.6))} color={C.yellow} rot={-10} />
      <Sparkle x={CX - 520} y={CY + 200} r={12 * (0.6 + 0.4 * wave01(p, 2, 0.15))} color={C.teal} />
    </g>
  );
};
