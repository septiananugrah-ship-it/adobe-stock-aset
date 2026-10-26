// Cangkir kopi hangat di atas lepek: uap berkelok naik (gelombang merambat, k bulat), gumpalan uap kecil
// memudar, hati kecil melayang dari uap, seni latte berdenyut pelan. Seluruh gerak periodik → loop mulus.
import React from 'react';
import {clamp, mod, outBack, seg, TAU, wave, yoyo} from '../../kit/loop';
import {C, shade} from '../../kit/palette';
import {Shadow, Sparkle} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'nature-coffee-cup-steam',
  theme: 'nature',
  title: 'Hot coffee cup on saucer with rising steam and latte art heart, cozy morning seamless loop animation, alpha channel',
  keywords: [
    'coffee', 'coffee cup', 'hot coffee', 'steam', 'mug', 'latte', 'latte art', 'cappuccino', 'espresso', 'drink',
    'beverage', 'cafe', 'coffee shop', 'morning', 'breakfast', 'cozy', 'warm', 'coffee break', 'relax', 'lifestyle',
    'heart', 'love', 'aroma', 'saucer', 'coffee beans', 'flat design', 'illustration', 'icon', 'cartoon', 'animation',
    'motion graphics', 'seamless loop', 'looped', 'alpha channel', 'transparent background', 'isolated', '4k',
    'social media', 'menu', 'presentation',
  ],
  category: 12,
  seconds: 8,
  vectorP: 0.46,
};

const CUP = {cx: 936, top: 500, bot: 758, hw: 140, rimRy: 28};
const MUG = C.coral;
const STEAM = C.mist;

// pita uap meruncing: garis tengah berkelok dengan gelombang merambat ke atas
const ribbon = (x0: number, y0: number, h: number, p: number, ph: number, amp: number, wmax: number) => {
  const n = 36;
  const L: string[] = [];
  const R: string[] = [];
  for (let i = 0; i <= n; i++) {
    const s = i / n;
    const y = y0 - h * s;
    const a = amp * (0.35 + 0.65 * s);
    const x = x0 + a * Math.sin(TAU * (s * 1.15 - 2 * p) + ph);
    const w = wmax * Math.pow(Math.sin(Math.PI * Math.min(1, s * 1.08)), 0.7) * (1 - 0.35 * s);
    L.push(`${(x - w).toFixed(2)},${y.toFixed(2)}`);
    R.push(`${(x + w).toFixed(2)},${y.toFixed(2)}`);
  }
  return `M${L.join(' L')} L${R.reverse().join(' L')} Z`;
};

const heartPath = (s: number) =>
  `M0,${(0.9 * s).toFixed(2)} C${(-1.25 * s).toFixed(2)},${(0.05 * s).toFixed(2)} ${(-0.95 * s).toFixed(2)},${(-0.95 * s).toFixed(2)} 0,${(-0.42 * s).toFixed(2)} C${(0.95 * s).toFixed(2)},${(-0.95 * s).toFixed(2)} ${(1.25 * s).toFixed(2)},${(0.05 * s).toFixed(2)} 0,${(0.9 * s).toFixed(2)} Z`;

const Bean: React.FC<{x: number; y: number; r: number}> = ({x, y, r}) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`}>
    <ellipse rx={30} ry={21} fill={shade(C.brown, -0.25)} />
    <path d="M-24,4 Q-6,-10 6,2 Q16,12 26,-2" fill="none" stroke={shade(C.brown, -0.5)} strokeWidth={6} strokeLinecap="round" />
    <ellipse cx={-10} cy={-10} rx={9} ry={4} fill={shade(C.brown, 0.15)} />
  </g>
);

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  const {cx, top, bot, hw, rimRy} = CUP;
  const latte = 1 + 0.035 * wave(p, 2);
  const steams = [
    {x: cx - 62, h: 210 + 18 * wave(p, 1), ph: 0.0, amp: 18, w: 15},
    {x: cx + 4, h: 262 + 20 * wave(p, 1, 0.33), ph: 2.1, amp: 22, w: 18},
    {x: cx + 68, h: 196 + 16 * wave(p, 1, 0.66), ph: 4.2, amp: 17, w: 14},
  ];
  const heart = vector ? 1 : yoyo(p, 0.3, 0.38, 0.62, 0.7, (t) => outBack(t, 2.2));
  const heartRise = vector ? 0.5 : seg(p, 0.3, 0.7, (t) => t);
  return (
    <g transform={`translate(${cx + 24} 662) scale(1.07) translate(${-cx} -640)`}>
      <Shadow cx={cx} cy={800} rx={250} ry={26} vector={vector} />
      {/* uap */}
      {steams.map((s, i) => (
        <path key={i} d={ribbon(s.x, top - 22, s.h, p, s.ph, s.amp, s.w)} fill={STEAM} />
      ))}
      {/* gumpalan uap kecil */}
      {!vector &&
        steams.map((s, i) => {
          const t = mod(p * 2 + i * 0.37, 1);
          const y = top - 22 - s.h - 8 - 44 * t;
          const x = s.x + 14 * Math.sin(TAU * (t + i * 0.3));
          const f = Math.sin(Math.PI * t);
          return <circle key={i} cx={x} cy={y} r={7 + 5 * t} fill={STEAM} opacity={f} />;
        })}
      {/* hati melayang */}
      {heart > 0.01 ? (
        <g transform={`translate(${cx + 156 + 18 * Math.sin(TAU * heartRise)} ${top - 140 - 110 * heartRise}) rotate(${-10 + 14 * Math.sin(TAU * heartRise)}) scale(${heart})`}>
          <path d={heartPath(30)} fill={C.pink} />
          <ellipse cx={-12} cy={-12} rx={7} ry={5} fill={shade(C.pink, 0.45)} transform="rotate(-35 -12 -12)" />
        </g>
      ) : null}
      {/* lepek */}
      <ellipse cx={cx} cy={784} rx={236} ry={42} fill={C.mist} />
      <ellipse cx={cx} cy={772} rx={236} ry={40} fill={C.cloud} />
      <ellipse cx={cx} cy={770} rx={160} ry={24} fill={shade(C.mist, 0.2)} />
      <path d={`M${cx - 206},${760} Q${cx - 170},${742} ${cx - 120},${738}`} fill="none" stroke={C.white} strokeWidth={9} strokeLinecap="round" />
      {/* gagang */}
      <path d={`M${cx + hw - 10},${top + 64} C${cx + hw + 96},${top + 52} ${cx + hw + 104},${top + 182} ${cx + hw - 18},${top + 190}`} fill="none" stroke={shade(MUG, -0.16)} strokeWidth={36} strokeLinecap="round" />
      {/* badan cangkir */}
      <path d={`M${cx - hw},${top} L${cx + hw},${top} L${cx + hw - 8},${bot - 70} Q${cx + hw - 16},${bot} ${cx + hw - 80},${bot} L${cx - hw + 80},${bot} Q${cx - hw + 16},${bot} ${cx - hw + 8},${bot - 70} Z`} fill={MUG} />
      <path d={`M${cx + 60},${top} L${cx + hw},${top} L${cx + hw - 8},${bot - 70} Q${cx + hw - 16},${bot} ${cx + hw - 80},${bot} L${cx + 50},${bot} Z`} fill={shade(MUG, -0.12)} />
      <rect x={cx - hw + 26} y={top + 46} width={16} height={150} rx={8} fill={shade(MUG, 0.38)} />
      <rect x={cx - hw + 26} y={top + 210} width={16} height={18} rx={8} fill={shade(MUG, 0.38)} />
      {/* hati di badan cangkir */}
      <g transform={`translate(${cx - 6} ${top + 128})`}>
        <path d={heartPath(34)} fill={shade(MUG, 0.55)} />
      </g>
      {/* bibir & permukaan kopi */}
      <ellipse cx={cx} cy={top} rx={hw} ry={rimRy} fill={shade(MUG, 0.18)} />
      <ellipse cx={cx} cy={top + 3} rx={hw - 16} ry={rimRy - 8} fill={shade(C.brown, -0.45)} />
      <ellipse cx={cx} cy={top + 6} rx={hw - 26} ry={rimRy - 12} fill={shade(C.brown, -0.25)} />
      <g transform={`translate(${cx} ${top + 5}) scale(${latte} ${latte * 0.42})`}>
        <path d={heartPath(40)} fill={C.sand} />
        <path d={heartPath(22)} fill={shade(C.brown, -0.05)} transform="translate(0 4)" />
      </g>
      {/* biji kopi */}
      <Bean x={cx - 300} y={812} r={-24} />
      <Bean x={cx - 236} y={826} r={18} />
      {/* kilau */}
      <Sparkle x={cx - 208} y={top - 66} r={(vector ? 1 : clamp(0.6 + 0.4 * wave(p, 4))) * 18} color={C.yellow} rot={12} />
      <Sparkle x={cx + 262} y={top - 4} r={(vector ? 1 : clamp(0.6 + 0.4 * wave(p, 4, 0.5))) * 13} color={C.yellow} />
    </g>
  );
};
