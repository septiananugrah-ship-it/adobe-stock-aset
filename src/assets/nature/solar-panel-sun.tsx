// Panel surya menerima sinar matahari: sinar berputar, berkas cahaya mengalir ke panel, kilau menyapu sel,
// energi mengalir lewat kabel ke baterai yang terisi bertingkat lalu kosong kembali (loop mulus).
import React from 'react';
import {clamp, inOut, mix, mod, outBack, seg, wave, wave01, yoyo} from '../../kit/loop';
import {blend, C, shade} from '../../kit/palette';
import {Glow, Shadow, Sparkle} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'nature-solar-panel-sun',
  theme: 'nature',
  title: 'Solar panel charging battery under shining sun with flowing energy, renewable power seamless loop animation, alpha channel',
  keywords: [
    'solar panel', 'solar energy', 'solar power', 'sun', 'renewable energy', 'green energy', 'clean energy', 'battery',
    'charging', 'electricity', 'photovoltaic', 'power', 'sunlight', 'sustainable', 'sustainability', 'eco', 'ecology',
    'environment', 'alternative energy', 'energy storage', 'technology', 'climate', 'sunny', 'flat design',
    'illustration', 'icon', 'cartoon', 'animation', 'motion graphics', 'seamless loop', 'looped', 'alpha channel',
    'transparent background', 'isolated', '4k', 'explainer', 'presentation', 'infographic', 'social media',
  ],
  category: 5,
  seconds: 8,
  vectorP: 0.66,
};

const DX = -66;
const SUN = {x: 618, y: 256, r: 84};
// panel (trapesium perspektif)
const TL: [number, number] = [826, 470];
const TR: [number, number] = [1304, 470];
const BR: [number, number] = [1366, 690];
const BL: [number, number] = [764, 690];
const at = (u: number, v: number): [number, number] => {
  const top = [mix(TL[0], TR[0], u), mix(TL[1], TR[1], u)];
  const bot = [mix(BL[0], BR[0], u), mix(BL[1], BR[1], u)];
  return [mix(top[0], bot[0], v), mix(top[1], bot[1], v)];
};
const quad = (pts: [number, number][]) => `M${pts.map((q) => `${q[0].toFixed(2)},${q[1].toFixed(2)}`).join(' L')} Z`;
const COLS = 4;
const ROWS = 3;
const BAT = {x: 1500, y: 748, w: 128, h: 196};
// kabel: kubik dari sisi kanan panel ke kutub baterai
const CAB = [
  [1340, 600],
  [1440, 588],
  [BAT.x, 560],
  [BAT.x, BAT.y - BAT.h / 2 - 20],
] as const;
const cab = (t: number) => {
  const m = 1 - t;
  const f = (i: 0 | 1) => m * m * m * CAB[0][i] + 3 * m * m * t * CAB[1][i] + 3 * m * t * t * CAB[2][i] + t * t * t * CAB[3][i];
  return [f(0), f(1)] as [number, number];
};

const bolt = 'M8,-34 L-16,4 L-1,4 L-8,34 L16,-4 L1,-4 Z';

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  const rot = 60 * p; // sinar simetris 60° → loop mulus
  const pulse = 1 + 0.03 * wave(p, 4);
  const band = vector ? 0.42 : mix(-0.35, 1.35, mod(p * 2, 1));
  const charge = [0, 1, 2].map((i) => yoyo(p, 0.12 + i * 0.14, 0.19 + i * 0.14, 0.84, 0.92, (t) => outBack(t, 2), inOut));
  const full = yoyo(p, 0.54, 0.62, 0.8, 0.86, (t) => outBack(t, 2.2), inOut);
  const flow = seg(p, 0.04, 0.1) * (1 - seg(p, 0.8, 0.88));
  const batPop = 1 + 0.06 * Math.sin(Math.PI * clamp((p - 0.54) / 0.1)) ;
  return (
    <g transform={`translate(${DX} 0)`}>
      <Shadow cx={1110} cy={868} rx={330} ry={26} vector={vector} />
      <Shadow cx={BAT.x} cy={BAT.y + BAT.h / 2 + 4} rx={96} ry={14} vector={vector} />
      {/* matahari */}
      <Glow cx={SUN.x} cy={SUN.y} r={SUN.r * 2} color={C.yellow} strength={0.55 + 0.15 * wave(p, 4)} vector={vector} />
      <g transform={`translate(${SUN.x} ${SUN.y}) rotate(${rot})`}>
        {Array.from({length: 12}, (_, i) => {
          const long = i % 2 === 0;
          const a = i * 30;
          const r0 = SUN.r + 16;
          const len = (long ? 48 : 30) * (1 + 0.12 * wave(p, 4, i % 2 ? 0.5 : 0));
          return (
            <rect key={i} x={-10} y={-(r0 + len)} width={20} height={len} rx={10} fill={long ? C.yellow : shade(C.yellow, -0.08)} transform={`rotate(${a})`} />
          );
        })}
      </g>
      <g transform={`translate(${SUN.x} ${SUN.y}) scale(${pulse})`}>
        <circle r={SUN.r} fill={C.orange} />
        <circle r={SUN.r - 10} fill={C.yellow} />
        <circle cx={-12} cy={-12} r={SUN.r * 0.6} fill={shade(C.yellow, 0.25)} />
        <path d={`M${-SUN.r * 0.62},${-SUN.r * 0.08} A${SUN.r * 0.62},${SUN.r * 0.62} 0 0 1 ${-SUN.r * 0.1},${-SUN.r * 0.62}`} fill="none" stroke={shade(C.yellow, 0.6)} strokeWidth={12} strokeLinecap="round" />
      </g>
      {/* berkas sinar menuju panel */}
      {[-1, 0, 1].map((k, i) => {
        const ang = Math.atan2(560 - SUN.y, 1010 - SUN.x) + k * 0.22;
        const r0 = SUN.r + 84;
        const r1 = r0 + 140;
        const t = mod(p * 3 + i * 0.33, 1);
        const a = r0 + (r1 - r0) * (vector ? 0.2 + i * 0.15 : t);
        const b = Math.min(r1, a + 56);
        const f = vector ? 1 : Math.sin(Math.PI * t);
        if (b - a < 4) return null;
        return (
          <line
            key={i}
            x1={SUN.x + Math.cos(ang) * a}
            y1={SUN.y + Math.sin(ang) * a}
            x2={SUN.x + Math.cos(ang) * b}
            y2={SUN.y + Math.sin(ang) * b}
            stroke={C.yellow}
            strokeWidth={11}
            strokeLinecap="round"
            opacity={vector ? undefined : f}
          />
        );
      })}
      {/* tiang & kaki */}
      <path d="M1176,700 L1236,846 L1206,846 L1150,706 Z" fill={shade(C.steel, -0.15)} />
      <rect x={1048} y={700} width={36} height={146} rx={10} fill={C.steel} />
      <rect x={1068} y={700} width={16} height={146} fill={shade(C.steel, -0.14)} />
      <rect x={960} y={836} width={300} height={26} rx={13} fill={C.slate} />
      <rect x={960} y={836} width={300} height={10} rx={5} fill={shade(C.slate, 0.25)} />
      {/* kabel */}
      <path d={`M${CAB[0][0]},${CAB[0][1]} C${CAB[1][0]},${CAB[1][1]} ${CAB[2][0]},${CAB[2][1]} ${CAB[3][0]},${CAB[3][1]}`} fill="none" stroke={C.slate} strokeWidth={12} strokeLinecap="round" />
      {/* tebal panel */}
      <path d={quad([BL, BR, [BR[0] - 4, BR[1] + 22], [BL[0] + 4, BL[1] + 22]])} fill={shade(C.mist, -0.3)} />
      {/* bingkai & sel */}
      <path d={quad([TL, TR, BR, BL])} fill={C.mist} />
      <path d={quad([at(0.025, 0.04), at(0.975, 0.04), at(0.975, 0.96), at(0.025, 0.96)])} fill={C.cloud} />
      {Array.from({length: COLS * ROWS}, (_, n) => {
        const i = n % COLS;
        const j = Math.floor(n / COLS);
        const gu = 0.012;
        const gv = 0.024;
        const u0 = 0.025 + (0.95 * i) / COLS + gu;
        const u1 = 0.025 + (0.95 * (i + 1)) / COLS - gu;
        const v0 = 0.04 + (0.92 * j) / ROWS + gv;
        const v1 = 0.04 + (0.92 * (j + 1)) / ROWS - gv;
        const cu = (u0 + u1) / 2;
        const cv = (v0 + v1) / 2;
        const d = Math.abs(cu * 0.75 + cv * 0.35 - band);
        const lit = Math.max(0, 1 - d / 0.2);
        const base = blend(C.blue, shade(C.sky, 0.2), lit * 0.6);
        return (
          <g key={n}>
            <path d={quad([at(u0, v0), at(u1, v0), at(u1, v1), at(u0, v1)])} fill={base} />
            <path d={quad([at(u0, v0), at(u1, v0), at(u0, v1)])} fill={shade(base, 0.1)} />
          </g>
        );
      })}
      {/* aliran energi di kabel */}
      {!vector &&
        Array.from({length: 4}, (_, i) => {
          const t = mod(p * 4 + i / 4, 1);
          const [x, y] = cab(t);
          const f = Math.sin(Math.PI * t) * flow;
          if (f < 0.02) return null;
          return <circle key={i} cx={x} cy={y} r={9} fill={C.yellow} opacity={Math.min(1, f * 1.6)} />;
        })}
      {/* baterai */}
      <g transform={`translate(${BAT.x} ${BAT.y + BAT.h / 2}) scale(${batPop}) translate(${-BAT.x} ${-(BAT.y + BAT.h / 2)})`}>
        <rect x={BAT.x - 26} y={BAT.y - BAT.h / 2 - 20} width={52} height={28} rx={9} fill={C.slate} />
        <rect x={BAT.x - BAT.w / 2} y={BAT.y - BAT.h / 2} width={BAT.w} height={BAT.h} rx={24} fill={C.mist} />
        <rect x={BAT.x - BAT.w / 2 + 12} y={BAT.y - BAT.h / 2 + 12} width={BAT.w - 24} height={BAT.h - 24} rx={14} fill={C.navy} />
        {charge.map((k, i) => {
          if (k <= 0.01) return null;
          const bh = 42;
          const y = BAT.y + BAT.h / 2 - 22 - (i + 1) * bh - i * 8 + bh;
          const col = full > 0.01 ? blend(C.green, shade(C.green, 0.3), full * (0.5 + 0.5 * wave01(p, 4))) : C.green;
          return (
            <g key={i} transform={`translate(${BAT.x} ${y - bh / 2}) scale(${k} ${k})`}>
              <rect x={-(BAT.w - 44) / 2} y={-bh / 2} width={BAT.w - 44} height={bh} rx={8} fill={col} />
              <rect x={-(BAT.w - 44) / 2} y={bh / 2 - 10} width={BAT.w - 44} height={10} rx={5} fill={shade(C.green, -0.16)} />
            </g>
          );
        })}
        {full > 0.01 ? (
          <g transform={`translate(${BAT.x} ${BAT.y}) scale(${full})`}>
            <path d={bolt} fill={C.yellow} transform="scale(1.45)" />
          </g>
        ) : null}
      </g>
      {/* kilau saat penuh */}
      <Sparkle x={BAT.x + 86} y={BAT.y - 128} r={22 * full * (0.8 + 0.2 * wave(p, 4))} color={C.yellow} rot={15} />
      <Sparkle x={BAT.x + 104} y={BAT.y + 6} r={14 * full * (0.8 + 0.2 * wave(p, 4, 0.5))} color={C.green} />
      <Sparkle x={TR[0] - 30} y={TR[1] - 50} r={16 * (vector ? 1 : wave01(p, 2, 0.1)) * (vector ? 1 : clamp(1 - Math.abs(mod(p * 2, 1) - 0.55) / 0.2))} color={C.yellow} />
    </g>
  );
};
