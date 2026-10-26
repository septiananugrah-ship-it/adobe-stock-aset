// Model atom: inti 3 proton + 4 neutron (litium-7) yang berputar pelan dalam 3D, tiga elektron mengorbit
// pada tiga lintasan elips (sisi belakang lintasan lewat di balik inti). Semua periodik → loop mulus.
import React from 'react';
import {TAU, inOutSine, mod, wave, wave01} from '../../kit/loop';
import {C, blend, shade} from '../../kit/palette';
import {Glow, Sparkle} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'science-atom-electron-orbits',
  theme: 'science',
  title: 'Atom model with electrons orbiting the nucleus on three elliptical paths, physics animation, seamless loop with alpha channel',
  keywords: [
    'atom', 'electron', 'nucleus', 'orbit', 'proton', 'neutron', 'physics', 'science', 'chemistry', 'atomic model', 'nuclear',
    'energy', 'particle', 'quantum', 'molecule', 'research', 'technology', 'education', 'school', 'laboratory', 'innovation',
    'symbol', 'icon', 'flat design', 'illustration', 'animation', 'motion graphics', 'seamless loop', 'looped', 'alpha channel',
    'transparent background', 'isolated', 'explainer', 'presentation', 'social media', '4k', 'microcosm', 'element', 'orbital',
    'spinning',
  ],
  category: 16,
  seconds: 8,
  vectorP: 0.1,
};

const CX = 960;
const CY = 540;
const RX = 352;
const RY = 124;
const ORBITS = [-30, 30, 90].map((deg) => (deg * Math.PI) / 180);
const ORBIT = blend(C.blue, C.sky, 0.35);
const ORBIT_BACK = shade(ORBIT, -0.22);

/** Titik pada orbit ke-i, sudut θ (lokal). Kedalaman: sin θ > 0 = depan. */
const orbitPt = (i: number, th: number) => {
  const a = ORBITS[i];
  const lx = RX * Math.cos(th);
  const ly = RY * Math.sin(th);
  return {x: CX + lx * Math.cos(a) - ly * Math.sin(a), y: CY + lx * Math.sin(a) + ly * Math.cos(a), z: Math.sin(th)};
};
const arc = (i: number, t0: number, t1: number, n = 40) => {
  return Array.from({length: n + 1}, (_, k) => {
    const q = orbitPt(i, t0 + ((t1 - t0) * k) / n);
    return `${k ? 'L' : 'M'}${q.x.toFixed(1)},${q.y.toFixed(1)}`;
  }).join(' ');
};

/** Bola datar: sisi gelap bawah-kanan, warna dasar, kilau kiri-atas. */
const Ball: React.FC<{x: number; y: number; r: number; c: string}> = ({x, y, r, c}) => (
  <g>
    <circle cx={x} cy={y} r={r} fill={shade(c, -0.2)} />
    <circle cx={x - r * 0.08} cy={y - r * 0.08} r={r * 0.86} fill={c} />
    <ellipse cx={x - r * 0.36} cy={y - r * 0.4} rx={r * 0.24} ry={r * 0.15} fill={shade(c, 0.45)} transform={`rotate(-35 ${x - r * 0.36} ${y - r * 0.4})`} />
  </g>
);

// Inti: bipiramida pentagonal (5 di cincin + 2 di kutub), 3 proton + 4 neutron
const NUC = [
  ...Array.from({length: 5}, (_, i) => ({x: 52 * Math.cos((i * TAU) / 5), y: 0, z: 52 * Math.sin((i * TAU) / 5)})),
  {x: 0, y: -46, z: 0},
  {x: 0, y: 46, z: 0},
];
const PROTON = [true, false, true, false, false, true, false];

const ELECTRONS = [
  {orbit: 0, off: 0.0},
  {orbit: 1, off: 0.36},
  {orbit: 2, off: 0.7},
];

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  const back: React.ReactNode[] = [];
  const front: React.ReactNode[] = [];
  // lintasan: separuh belakang (θ ∈ [π, 2π]) & separuh depan
  ORBITS.forEach((_, i) => {
    const n = 72;
    for (let k = 0; k < n; k++) {
      const t0 = (k * TAU) / n;
      const t1 = ((k + 1) * TAU) / n;
      const z = Math.sin((t0 + t1) / 2);
      const col = blend(ORBIT_BACK, ORBIT, 0.5 + 0.5 * Math.max(-1, Math.min(1, z * 1.6)));
      (z > 0 ? front : back).push(<path key={`o${i}-${k}`} d={arc(i, t0, t1, 2)} fill="none" stroke={col} strokeWidth={12} strokeLinecap="round" />);
    }
  });
  // elektron + jejak
  ELECTRONS.forEach((e, j) => {
    const th = TAU * (2 * p + e.off);
    for (let k = 16; k >= 1; k--) {
      const q = orbitPt(e.orbit, th - k * 0.034);
      const s = 0.72 + 0.28 * (0.5 + 0.5 * q.z);
      const r = (19 - k * 0.95) * s;
      const col = shade(C.yellow, q.z > 0 ? -0.01 * k : -0.1 - 0.01 * k);
      (q.z > 0 ? front : back).push(<circle key={`t${j}-${k}`} cx={q.x} cy={q.y} r={r} fill={col} />);
    }
    const q = orbitPt(e.orbit, th);
    const s = 0.78 + 0.22 * (0.5 + 0.5 * q.z);
    (q.z > 0 ? front : back).push(
      <g key={`e${j}`}>
        <Glow cx={q.x} cy={q.y} r={46 * s} color={C.yellow} strength={1.4} vector={vector} />
        <Ball x={q.x} y={q.y} r={24 * s} c={q.z > 0 ? C.yellow : shade(C.yellow, -0.1)} />
      </g>,
    );
  });
  // inti berputar pelan (1 putaran/loop) dengan sedikit kemiringan
  const rot = TAU * p;
  const tilt = 0.38;
  const breath = 1 + 0.03 * wave(p, 4);
  const nuc = NUC.map((n, i) => {
    const x1 = n.x * Math.cos(rot) + n.z * Math.sin(rot);
    const z1 = -n.x * Math.sin(rot) + n.z * Math.cos(rot);
    const y2 = n.y * Math.cos(tilt) - z1 * Math.sin(tilt);
    const z2 = n.y * Math.sin(tilt) + z1 * Math.cos(tilt);
    return {x: CX + x1 * breath, y: CY + y2 * breath, z: z2, i};
  }).sort((a, b) => a.z - b.z);
  const pulse = inOutSine(wave01(p, 2));
  return (
    <g>
      <Glow cx={CX} cy={CY} r={150 + 20 * pulse} color={C.coral} strength={0.9} vector={vector} />
      <Glow cx={CX} cy={CY} r={420} color={ORBIT} strength={0.25} vector={vector} />
      {back}
      {nuc.map((n) => (
        <Ball key={n.i} x={n.x} y={n.y} r={38 * (1 + n.z / 480)} c={PROTON[n.i] ? C.coral : C.steel} />
      ))}
      {front}
      <Sparkle x={CX + 420} y={CY - 290} r={24 * (0.6 + 0.4 * wave01(p, 2))} color={C.yellow} rot={10} />
      <Sparkle x={CX + 488} y={CY - 210} r={12 * (0.6 + 0.4 * wave01(p, 2, 0.35))} color={C.sky} />
      <Sparkle x={CX - 450} y={CY + 250} r={20 * (0.6 + 0.4 * wave01(p, 2, 0.6))} color={C.yellow} rot={-12} />
      <Sparkle x={CX - 500} y={CY + 170} r={11 * (0.6 + 0.4 * wave01(p, 2, 0.15))} color={C.coral} />
      <Sparkle x={CX - 420} y={CY - 300} r={14 * (0.6 + 0.4 * wave01(p, 2, 0.8))} color={C.sky} rot={20} />
      {/* titik kecil mengambang */}
      {[0, 1, 2, 3].map((i) => {
        const t = mod(p + i / 4, 1);
        const a = (i * TAU) / 4 + 0.6;
        const r = 470 + 30 * Math.sin(TAU * t);
        return <circle key={i} cx={CX + r * Math.cos(a)} cy={CY + r * 0.55 * Math.sin(a)} r={6 + 3 * wave01(p, 2, i / 4)} fill={ORBIT} />;
      })}
    </g>
  );
};
