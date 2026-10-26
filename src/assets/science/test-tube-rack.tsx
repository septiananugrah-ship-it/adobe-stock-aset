// Rak berisi lima tabung reaksi dengan cairan warna-warni. Gelembung naik terus-menerus, dan tiap tabung
// bergantian berbuih (busa naik lalu surut) dengan sedikit uap, berurutan dari kiri ke kanan.
import React from 'react';
import {TAU, clamp, inOut, mix, mod, out, outBack, rng, wave, wave01, yoyo} from '../../kit/loop';
import {C, blend, shade} from '../../kit/palette';
import {Shadow, Sparkle} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'science-test-tube-rack',
  theme: 'science',
  title: 'Test tube rack with colorful bubbling and foaming liquids, chemistry laboratory animation, seamless loop with alpha channel',
  keywords: [
    'test tube', 'test tubes', 'rack', 'chemistry', 'laboratory', 'experiment', 'bubbles', 'foam', 'chemical reaction',
    'science', 'liquid', 'colorful', 'lab equipment', 'glassware', 'research', 'biology', 'medicine', 'pharmacy', 'analysis',
    'sample', 'education', 'school', 'scientist', 'discovery', 'icon', 'flat design', 'illustration', 'animation',
    'motion graphics', 'seamless loop', 'looped', 'alpha channel', 'transparent background', 'isolated', 'explainer',
    'presentation', 'social media', '4k', 'rainbow', 'reagent',
  ],
  category: 16,
  seconds: 8,
  vectorP: 0.37,
};

const CX = 960;
const N = 5;
const GAP = 160;
const HW = 44; // setengah lebar luar tabung
const TG = 10; // tebal kaca
const TOP = 286;
const BOT = 772; // dasar luar tabung
const PLATE_Y = 384;
const PLATE_H = 44;
const BASE_Y = 760;
const RACK = C.slate;
const GLASS = blend(C.sky, C.white, 0.8);
const GLASS_EDGE = blend(C.sky, C.white, 0.42);
const COLORS = [C.coral, C.yellow, C.teal, C.purple, C.sky];
const LEVELS = [560, 600, 540, 585, 570];
const RW = (N - 1) * GAP / 2 + HW + 70; // setengah lebar rak

const tx = (i: number) => CX + (i - (N - 1) / 2) * GAP;

/** Bentuk U tabung (ujung atas terbuka) dengan setengah lebar hw. */
const tubePath = (x: number, top: number, bot: number, hw: number) =>
  `M${x - hw},${top} L${x - hw},${bot - hw} A${hw},${hw} 0 0 0 ${x + hw},${bot - hw} L${x + hw},${top} Z`;

const R = rng(11);
const BUB = Array.from({length: N}, () => Array.from({length: 5}, (_, j) => ({u: R() * 2 - 1, r: 7 + R() * 6, k: j % 2 ? 2 : 3, off: R()})));
// busa: [dx, dy, r] — |dx| + r ≤ setengah lebar dalam tabung agar tidak menembus kaca
const FOAM = [
  [-12, 0, 17],
  [11, -3, 18],
  [0, -18, 17],
  [14, -24, 13],
  [-14, -22, 13],
  [2, -36, 13],
];

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  const ihw = HW - TG;
  const tubes = COLORS.map((col, i) => {
    const x = tx(i);
    const a = 0.06 + 0.11 * i;
    const f = yoyo(p, a, a + 0.1, a + 0.2, a + 0.32, (t) => outBack(t, 1.2), inOut);
    const lv = LEVELS[i] - 70 * f + 3 * wave(p, 2, i * 0.2);
    const yb = BOT - TG;
    const liq = `M${x - ihw},${lv} L${x - ihw},${yb - ihw} A${ihw},${ihw} 0 0 0 ${x + ihw},${yb - ihw} L${x + ihw},${lv} Q${x},${lv + 8} ${x - ihw},${lv} Z`;
    const h2 = ihw * 0.68;
    const yb2 = yb - 7;
    const xr2 = x - ihw + 2 * h2;
    const liqLight = `M${x - ihw},${lv} L${x - ihw},${yb2 - h2} A${h2},${h2} 0 0 0 ${xr2},${yb2 - h2} L${xr2},${lv + 7} Q${x - ihw * 0.45},${lv + 7} ${x - ihw},${lv} Z`;
    return {x, col, f, lv, liq, liqLight, yb};
  });
  return (
    <g>
      <Shadow cx={CX} cy={BASE_Y + 44} rx={RW + 40} ry={30} vector={vector} />
      {tubes.map((t, i) => (
        <g key={i}>
          {/* tabung kaca */}
          <path d={tubePath(t.x, TOP, BOT, HW)} fill={GLASS_EDGE} />
          <path d={tubePath(t.x, TOP - 2, BOT - TG, HW - TG)} fill={GLASS} />
          {/* cairan */}
          <path d={t.liq} fill={shade(t.col, -0.15)} />
          <path d={t.liqLight} fill={t.col} />
          {/* gelembung */}
          {BUB[i].map((b, j) => {
            const q = mod(p * b.k + b.off, 1);
            const y = mix(t.yb - 30, t.lv + 12, q);
            const g = clamp(q / 0.15) * clamp((1 - q) / 0.12);
            const r = b.r * out(g) * (0.85 + 0.15 * q) * (j < 3 ? 1 : 0.4 + 0.6 * t.f);
            if (r < 1.5) return null;
            const x = t.x + b.u * (ihw - r - 6) + 4 * Math.sin(TAU * (q * 2 + b.off));
            return (
              <g key={j}>
                <circle cx={x} cy={y} r={r} fill={shade(t.col, 0.32)} />
                <circle cx={x - r * 0.3} cy={y - r * 0.3} r={Math.max(2, r * 0.28)} fill={C.white} />
              </g>
            );
          })}
          {/* busa */}
          {FOAM.map(([dx, dy, r], j) => {
            const k = clamp(t.f * 1.4 - j * 0.07);
            if (k <= 0.02) return null;
            const rr = r * outBack(k, 1.6) * (1 + 0.06 * wave(p, 4, j * 0.3 + i * 0.1));
            return (
              <g key={`f${j}`}>
                <circle cx={t.x + dx} cy={t.lv + 2 + dy * k} r={rr} fill={blend(t.col, C.white, 0.55)} />
                <circle cx={t.x + dx - rr * 0.32} cy={t.lv + 2 + dy * k - rr * 0.32} r={rr * 0.3} fill={blend(t.col, C.white, 0.85)} />
              </g>
            );
          })}
          {/* kilau kaca */}
          <rect x={t.x - HW + 15} y={TOP + 30} width={9} height={BOT - TOP - 120} rx={4.5} fill={C.white} />
          {/* bibir tabung */}
          <rect x={t.x - HW - 9} y={TOP - 18} width={(HW + 9) * 2} height={24} rx={12} fill={GLASS_EDGE} />
          <rect x={t.x - HW - 9} y={TOP - 18} width={(HW + 9) * 2} height={15} rx={7.5} fill={blend(C.sky, C.white, 0.62)} />
          {/* uap saat berbuih */}
          {[0, 1, 2].map((j) => {
            if (vector) return null;
            const q = mod(p * 4 + j / 3 + i * 0.13, 1);
            const o = t.f * Math.sqrt(Math.sin(Math.PI * q));
            const r = (10 + 10 * q) * o;
            if (r < 1.5) return null;
            return <circle key={`v${j}`} cx={t.x + (j - 1) * 12 + 10 * Math.sin(TAU * (q + j * 0.3))} cy={TOP - 40 - 90 * out(q)} r={r} fill={blend(t.col, C.white, 0.6)} />;
          })}
        </g>
      ))}
      {/* alas rak */}
      <rect x={CX - RW - 16} y={BASE_Y} width={(RW + 16) * 2} height={44} rx={18} fill={shade(RACK, -0.18)} />
      <rect x={CX - RW - 16} y={BASE_Y} width={(RW + 16) * 2} height={30} rx={15} fill={RACK} />
      <rect x={CX - RW + 10} y={BASE_Y + 8} width={220} height={8} rx={4} fill={shade(RACK, 0.32)} />
      {/* pelat atas rak (di depan tabung) */}
      <rect x={CX - RW} y={PLATE_Y} width={RW * 2} height={PLATE_H} rx={16} fill={shade(RACK, -0.18)} />
      <rect x={CX - RW} y={PLATE_Y} width={RW * 2} height={PLATE_H - 12} rx={14} fill={RACK} />
      <rect x={CX - RW + 24} y={PLATE_Y + 8} width={240} height={8} rx={4} fill={shade(RACK, 0.32)} />
      {/* tiang depan */}
      {[-1, 1].map((sgn) => (
        <g key={sgn}>
          <rect x={CX + sgn * (RW - 22) - 15} y={PLATE_Y + PLATE_H - 6} width={30} height={BASE_Y - PLATE_Y - PLATE_H + 12} rx={12} fill={shade(RACK, -0.1)} />
          <rect x={CX + sgn * (RW - 22) - 15} y={PLATE_Y + PLATE_H - 6} width={18} height={BASE_Y - PLATE_Y - PLATE_H + 12} rx={9} fill={RACK} />
        </g>
      ))}
      <Sparkle x={CX + RW + 60} y={TOP - 30} r={26 * (0.6 + 0.4 * wave01(p, 2))} color={C.yellow} rot={12} />
      <Sparkle x={CX + RW + 120} y={TOP + 40} r={13 * (0.6 + 0.4 * wave01(p, 2, 0.4))} color={C.sky} />
      <Sparkle x={CX - RW - 70} y={TOP + 10} r={20 * (0.6 + 0.4 * wave01(p, 2, 0.7))} color={C.yellow} rot={-10} />
      <Sparkle x={CX - RW - 110} y={TOP + 90} r={12 * (0.6 + 0.4 * wave01(p, 2, 0.2))} color={C.coral} />
    </g>
  );
};
