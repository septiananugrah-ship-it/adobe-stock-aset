// Tata surya mini: Matahari berdenyut di pusat, lima planet dalam urutan nyata (Merkurius, Venus, Bumi + Bulan,
// Mars, Jupiter) mengorbit pada elips miring; makin jauh makin lambat (5, 4, 3, 2, 1 putaran per loop).
// Sisi siang tiap planet selalu menghadap Matahari; planet di belakang lewat di balik Matahari.
import React from 'react';
import {TAU, wave, wave01} from '../../kit/loop';
import {C, blend, shade} from '../../kit/palette';
import {Glow, Sparkle} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'science-solar-system-orbits',
  theme: 'science',
  title: 'Solar system with planets orbiting the sun, Earth and Moon, astronomy animation, seamless loop with alpha channel',
  keywords: [
    'solar system', 'planets', 'sun', 'orbit', 'astronomy', 'space', 'earth', 'moon', 'mars', 'jupiter', 'venus', 'mercury',
    'universe', 'galaxy', 'cosmos', 'science', 'planetary', 'revolution', 'gravity', 'star', 'education', 'school',
    'geography', 'exploration', 'icon', 'flat design', 'illustration', 'animation', 'motion graphics', 'seamless loop',
    'looped', 'alpha channel', 'transparent background', 'isolated', 'explainer', 'presentation', 'social media', '4k',
    'cosmic', 'orbiting', 'heliocentric',
  ],
  category: 16,
  seconds: 10,
  vectorP: 0.06,
};

const CX = 960;
const CY = 540;
const TILT = 0.48;
const ORBIT = blend(C.steel, C.mist, 0.15);

type Planet = {rx: number; r: number; k: number; off: number; col: string; kind: 'rock' | 'venus' | 'earth' | 'mars' | 'jupiter'};
const PLANETS: Planet[] = [
  {rx: 250, r: 21, k: 5, off: 0.1, col: C.steel, kind: 'rock'},
  {rx: 338, r: 31, k: 4, off: 0.62, col: blend(C.sand, C.orange, 0.35), kind: 'venus'},
  {rx: 428, r: 35, k: 3, off: 0.28, col: C.blue, kind: 'earth'},
  {rx: 516, r: 26, k: 2, off: 0.85, col: C.coral, kind: 'mars'},
  {rx: 625, r: 64, k: 1, off: 0.45, col: blend(C.sand, C.orange, 0.22), kind: 'jupiter'},
];

const pos = (rx: number, th: number) => ({x: CX + rx * Math.cos(th), y: CY + rx * TILT * Math.sin(th), z: Math.sin(th)});

const halfOrbit = (rx: number, front: boolean) => {
  const n = 64;
  return Array.from({length: n + 1}, (_, i) => {
    const th = (front ? 0 : Math.PI) + (Math.PI * i) / n;
    const q = pos(rx, th);
    return `${i ? 'L' : 'M'}${q.x.toFixed(1)},${q.y.toFixed(1)}`;
  }).join(' ');
};

/** Lensa sisi malam: irisan lingkaran planet dengan salinannya yang digeser menjauhi Matahari. */
const nightPath = (x: number, y: number, r: number, ux: number, uy: number, d = 1.15) => {
  const D = d * r;
  const a = Math.acos(D / (2 * r));
  const base = Math.atan2(uy, ux);
  const pts: string[] = [];
  const n = 16;
  for (let i = 0; i <= n; i++) {
    const t = base - a + (2 * a * i) / n;
    pts.push(`${(x + r * Math.cos(t)).toFixed(1)},${(y + r * Math.sin(t)).toFixed(1)}`);
  }
  const bx = x + ux * D;
  const by = y + uy * D;
  for (let i = 0; i <= n; i++) {
    const t = base + Math.PI - a + (2 * a * i) / n;
    pts.push(`${(bx + r * Math.cos(t)).toFixed(1)},${(by + r * Math.sin(t)).toFixed(1)}`);
  }
  return `M${pts.join(' L')} Z`;
};

/** Pita horizontal di dalam lingkaran (untuk Jupiter). */
const band = (x: number, y: number, r: number, y0: number, y1: number) => {
  const w0 = Math.sqrt(r * r - y0 * y0);
  const w1 = Math.sqrt(r * r - y1 * y1);
  return `M${x - w0},${y + y0} L${x + w0},${y + y0} A${r},${r} 0 0 1 ${x + w1},${y + y1} L${x - w1},${y + y1} A${r},${r} 0 0 1 ${x - w0},${y + y0} Z`;
};

const PlanetBody: React.FC<{pl: Planet; x: number; y: number; r: number; p: number}> = ({pl, x, y, r, p}) => {
  const dx = x - CX;
  const dy = y - CY;
  const l = Math.hypot(dx, dy) || 1;
  const ux = dx / l;
  const uy = dy / l;
  const night = shade(pl.col, -0.3);
  let detail: React.ReactNode = null;
  if (pl.kind === 'rock') {
    detail = (
      <g fill={shade(pl.col, -0.14)}>
        <circle cx={x - r * 0.3} cy={y - r * 0.2} r={r * 0.24} />
        <circle cx={x + r * 0.32} cy={y + r * 0.3} r={r * 0.18} />
      </g>
    );
  } else if (pl.kind === 'venus') {
    detail = <path d={band(x, y, r, -r * 0.2, r * 0.12)} fill={shade(pl.col, 0.2)} />;
  } else if (pl.kind === 'earth') {
    detail = (
      <g fill={C.green}>
        <path d={`M${x - r * 0.55},${y - r * 0.35} q${r * 0.3},${-r * 0.35} ${r * 0.6},${-r * 0.1} q${r * 0.05},${r * 0.35} ${-r * 0.25},${r * 0.45} q${-r * 0.3},${r * 0.05} ${-r * 0.35},${-r * 0.35} Z`} />
        <path d={`M${x + r * 0.15},${y + r * 0.1} q${r * 0.4},${-r * 0.1} ${r * 0.5},${r * 0.2} q${-r * 0.05},${r * 0.35} ${-r * 0.35},${r * 0.4} q${-r * 0.2},${-r * 0.25} ${-r * 0.15},${-r * 0.6} Z`} />
      </g>
    );
  } else if (pl.kind === 'mars') {
    detail = (
      <g fill={shade(pl.col, -0.15)}>
        <ellipse cx={x - r * 0.25} cy={y + r * 0.15} rx={r * 0.3} ry={r * 0.18} />
        <circle cx={x + r * 0.35} cy={y - r * 0.35} r={r * 0.16} />
      </g>
    );
  } else if (pl.kind === 'jupiter') {
    const b = shade(C.orange, -0.05);
    detail = (
      <g>
        <path d={band(x, y, r, -r * 0.62, -r * 0.42)} fill={b} />
        <path d={band(x, y, r, -r * 0.18, r * 0.06)} fill={shade(C.brown, 0.15)} />
        <path d={band(x, y, r, r * 0.3, r * 0.48)} fill={b} />
        <ellipse cx={x + r * 0.22} cy={y + r * 0.18} rx={r * 0.2} ry={r * 0.11} fill={C.coral} />
      </g>
    );
  }
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={pl.col} />
      {detail}
      <path d={nightPath(x, y, r, ux, uy)} fill={night} />
      <circle cx={x - ux * r * 0.55} cy={y - uy * r * 0.55} r={Math.max(3.5, r * 0.12)} fill={shade(pl.col, 0.5)} />
    </g>
  );
};

const STARS = [
  [300, 250, 18, C.yellow, 0],
  [380, 180, 10, C.sky, 0.3],
  [1610, 260, 22, C.yellow, 0.55],
  [1540, 190, 11, C.sky, 0.8],
  [360, 830, 14, C.yellow, 0.15],
  [1580, 860, 16, C.yellow, 0.7],
  [1660, 790, 9, C.sky, 0.45],
  [270, 760, 9, C.violet, 0.9],
  [960, 175, 12, C.yellow, 0.35],
  [990, 905, 10, C.sky, 0.6],
] as const;

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  const back: React.ReactNode[] = [];
  const front: React.ReactNode[] = [];
  PLANETS.forEach((pl, i) => {
    const th = TAU * (pl.k * p + pl.off);
    const q = pos(pl.rx, th);
    const s = 1 + 0.1 * q.z;
    const r = pl.r * s;
    const nodes: React.ReactNode[] = [];
    if (pl.kind === 'earth') {
      // Bulan mengorbit Bumi (6 putaran per loop), lewat di depan/belakang Bumi
      const mt = TAU * 6 * p;
      const mx = q.x + 62 * s * Math.cos(mt);
      const my = q.y + 24 * s * Math.sin(mt);
      const moon = <PlanetBody key="moon" pl={{rx: 0, r: 9, k: 0, off: 0, col: C.mist, kind: 'rock'}} x={mx} y={my} r={12 * s} p={p} />;
      const moonFront = Math.sin(mt) > 0;
      if (!moonFront) nodes.push(moon);
      nodes.push(<PlanetBody key="earth" pl={pl} x={q.x} y={q.y} r={r} p={p} />);
      if (moonFront) nodes.push(moon);
    } else {
      nodes.push(<PlanetBody key="pl" pl={pl} x={q.x} y={q.y} r={r} p={p} />);
    }
    (q.z < 0 ? back : front).push(<g key={i}>{nodes}</g>);
  });
  const sunPulse = 1 + 0.025 * wave(p, 2);
  return (
    <g>
      {STARS.map(([x, y, r, c, o], i) => (
        <Sparkle key={i} x={x} y={y} r={r * (0.5 + 0.5 * wave01(p, 2 + (i % 2), o))} color={c} rot={(i * 17) % 40} />
      ))}
      {PLANETS.map((pl, i) => (
        <path key={`ob${i}`} d={halfOrbit(pl.rx, false)} stroke={shade(ORBIT, -0.12)} strokeWidth={7} fill="none" strokeLinecap="round" />
      ))}
      {back}
      {/* Matahari */}
      <Glow cx={CX} cy={CY} r={200 * sunPulse} color={C.yellow} strength={1.0} vector={vector} />
      <circle cx={CX} cy={CY} r={104 * sunPulse} fill={C.orange} />
      <circle cx={CX - 6} cy={CY - 6} r={91 * sunPulse} fill={C.yellow} />
      <circle cx={CX + 24} cy={CY + 28} r={14} fill={shade(C.yellow, -0.08)} />
      <circle cx={CX - 30} cy={CY + 34} r={9} fill={shade(C.yellow, -0.08)} />
      <ellipse cx={CX - 40} cy={CY - 44} rx={24} ry={14} fill={shade(C.yellow, 0.55)} transform={`rotate(-35 ${CX - 40} ${CY - 44})`} />
      {PLANETS.map((pl, i) => (
        <path key={`of${i}`} d={halfOrbit(pl.rx, true)} stroke={ORBIT} strokeWidth={7} fill="none" strokeLinecap="round" />
      ))}
      {front}
    </g>
  );
};
