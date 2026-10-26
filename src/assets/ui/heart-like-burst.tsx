// Tombol "suka": hati garis → ditekan (antisipasi) → hati penuh meledak (cincin + partikel) → berdetak, hati kecil melayang → kembali.
import React from 'react';
import {TAU, clamp, inOut, out, outBack, rng, seg, wave, yoyo} from '../../kit/loop';
import {C, shade} from '../../kit/palette';
import {Shadow, Sparkle} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'ui-heart-like-burst',
  theme: 'ui',
  title: 'Like heart button popping with particle burst and floating hearts, flat icon animation, seamless loop with alpha channel',
  keywords: [
    'heart',
    'like',
    'like button',
    'love',
    'favorite',
    'social media',
    'reaction',
    'burst',
    'particles',
    'icon',
    'ui',
    'user interface',
    'app',
    'mobile app',
    'feedback',
    'follow',
    'valentine',
    'romance',
    'notification',
    'engagement',
    'live stream',
    'floating hearts',
    'pink',
    'button',
    'web',
    'flat design',
    'illustration',
    'animation',
    'motion graphics',
    'seamless loop',
    'looped',
    'alpha channel',
    'transparent background',
    'isolated',
    '4k',
    'explainer',
    'presentation',
    'ux',
    'digital',
  ],
  category: 8,
  seconds: 8,
  vectorP: 0.5,
};

const CX = 960;
const CY = 540;
const S = 228;
const HEART =
  'M0,0.92 C-0.55,0.55 -1,0.15 -1,-0.3 C-1,-0.68 -0.72,-0.95 -0.48,-0.95 C-0.24,-0.95 -0.08,-0.82 0,-0.62 C0.08,-0.82 0.24,-0.95 0.48,-0.95 C0.72,-0.95 1,-0.68 1,-0.3 C1,0.15 0.55,0.55 0,0.92 Z';
const SIDE = 'M0.48,-0.95 C0.72,-0.95 1,-0.68 1,-0.3 C1,0.15 0.55,0.55 0,0.92 C0.4,0.5 0.8,0.1 0.8,-0.3 C0.8,-0.62 0.66,-0.86 0.48,-0.95 Z';
const scaled = (d: string, k: number) => d.replace(/-?\d*\.?\d+/g, (m) => (Number(m) * k).toFixed(2));
const HEART_S = scaled(HEART, S);
const SIDE_S = scaled(SIDE, S);
const POP = 0.16;

const PARTS = (() => {
  const r = rng(7);
  const cols = [C.pink, C.yellow, C.violet, C.coral, C.yellow, C.pink, C.violet];
  return Array.from({length: 7}, (_, i) => ({a: (i / 7) * TAU + 0.15, c1: cols[i], c2: cols[(i + 3) % 7], d: 300 + r() * 30}));
})();
const FLOAT = [
  {x: 150, delay: 0.3, s: 46, col: C.pink, sway: 0},
  {x: -170, delay: 0.38, s: 38, col: C.violet, sway: 0.4},
  {x: 60, delay: 0.47, s: 32, col: C.coral, sway: 0.7},
  {x: -60, delay: 0.55, s: 42, col: shade(C.pink, 0.25), sway: 0.2},
];

/** Batas atas cairan bergelombang (koordinat lokal hati) untuk efek terkuras. */
const drainPath = (k: number, p: number) => {
  const top = -0.98 * S + k * 1.95 * S;
  const pts: string[] = [];
  for (let i = 0; i <= 24; i++) {
    const x = -1.1 * S + (i / 24) * 2.2 * S;
    const y = top + 12 * Math.sin(TAU * (i / 12 + p * 6)) * Math.sin(Math.PI * k);
    pts.push(`${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return `${pts.join(' ')} L${(1.1 * S).toFixed(1)},${S} L${(-1.1 * S).toFixed(1)},${S} Z`;
};

/** Detak "lub-dub": dua denyut per siklus. */
const beat = (x: number) => {
  const f = x - Math.floor(x);
  const g = (c: number, w: number) => Math.exp(-(((f - c) / w) ** 2));
  return g(0.12, 0.05) + 0.6 * g(0.32, 0.05);
};

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  const anti = vector ? 0 : Math.sin((Math.PI / 2) * seg(p, 0.08, POP, inOut)) * (p < POP + 0.001 ? 1 : 0);
  const fillIn = vector ? 1 : seg(p, POP, POP + 0.13, (t) => outBack(t, 2.6));
  // "batal suka": isi hati surut seperti cairan yang terkuras
  const drain = vector ? 0 : seg(p, 0.8, 0.91, inOut);
  const fill = p > 0.5 && !vector ? 1 : fillIn;
  const fillO = drain >= 0.999 ? 0 : 1;
  const outline = vector ? 0 : p < 0.5 ? 1 - seg(p, POP, POP + 0.02) : seg(p, 0.76, 0.8, inOut);
  const hold = vector ? 0 : yoyo(p, 0.3, 0.36, 0.74, 0.8);
  const pulse = 1 + 0.055 * hold * beat(p * 6);
  const idle = 1 + 0.02 * wave(p, 2);
  const bt = vector ? 0.45 : (p - POP - 0.015) / 0.17;
  const sparkle = vector ? 1 : yoyo(p, 0.22, 0.32, 0.74, 0.84, out, inOut);

  const shadowS = Math.max(fill * fillO, outline);
  return (
    <g>
      <Shadow cx={CX} cy={850} rx={200} ry={24} s={Math.max(0.01, shadowS)} vector={vector} />
      {/* cincin ledakan */}
      {bt > 0 && bt < 1 && !vector ? (
        <circle
          cx={CX}
          cy={CY - 10}
          r={150 + 250 * out(clamp(bt * 1.4))}
          fill="none"
          stroke={shade(C.pink, 0.25)}
          strokeWidth={40 * (1 - out(clamp(bt * 1.4))) + 0.5}
          opacity={1 - seg(bt, 0.4, 0.75)}
        />
      ) : null}
      {/* partikel berpasangan */}
      {bt > 0 && bt < 1
        ? PARTS.map((q, i) => {
            const e = out(clamp(bt * 1.15));
            const d = 200 + (q.d - 200 + 40) * e;
            const r1 = vector ? 15 : 17 * (1 - seg(bt, 0.35, 1));
            if (r1 < 0.5) return null;
            const x = CX + d * Math.sin(q.a);
            const y = CY - 10 - d * Math.cos(q.a);
            const a2 = q.a + 0.2;
            const d2 = d - 34;
            return (
              <g key={i}>
                <circle cx={x.toFixed(1)} cy={y.toFixed(1)} r={r1} fill={q.c1} />
                <circle cx={(CX + d2 * Math.sin(a2)).toFixed(1)} cy={(CY - 10 - d2 * Math.cos(a2)).toFixed(1)} r={r1 * 0.7} fill={q.c2} />
              </g>
            );
          })
        : null}
      {/* hati garis (keadaan istirahat) */}
      {outline > 0.01 ? (
        <g
          transform={`translate(${CX} ${CY}) scale(${((0.92 + 0.08 * outline) * idle * (1 - 0.14 * anti)).toFixed(4)})`}
          opacity={outline >= 1 ? undefined : outline}
        >
          <path d={HEART_S} fill="none" stroke={C.pink} strokeWidth={26} strokeLinejoin="round" />
          <path d={scaled('M-0.7,-0.3 C-0.7,-0.5 -0.6,-0.66 -0.46,-0.68', S)} fill="none" stroke={shade(C.pink, 0.45)} strokeWidth={14} strokeLinecap="round" />
        </g>
      ) : null}
      {/* hati penuh */}
      {fill > 0.005 && fillO > 0.005 ? (
        <g
          transform={`translate(${CX} ${CY}) scale(${(fill * pulse * idle).toFixed(4)})`}
          clipPath={drain > 0.001 ? 'url(#ui-heart-like-burst-drain)' : undefined}
        >
          {drain > 0.001 ? (
            <clipPath id="ui-heart-like-burst-drain">
              <path d={drainPath(drain, p)} />
            </clipPath>
          ) : null}
          <path d={HEART_S} fill={C.pink} />
          <path d={SIDE_S} fill={shade(C.pink, -0.14)} />
          <path
            d={scaled('M-0.74,-0.28 C-0.74,-0.52 -0.62,-0.7 -0.44,-0.72', S)}
            fill="none"
            stroke={shade(C.pink, 0.45)}
            strokeWidth={18}
            strokeLinecap="round"
          />
          <circle cx={-0.74 * S} cy={-0.06 * S} r={10} fill={shade(C.pink, 0.45)} />
        </g>
      ) : null}
      {/* hati kecil melayang */}
      {FLOAT.map((f, i) => {
        const t = vector ? [0.35, 0.55, 0.25, 0.7][i] : (p - f.delay) / 0.22;
        if (t <= 0 || t >= 1) return null;
        const y = CY - 240 - 150 * out(t);
        const x = CX + f.x + 22 * Math.sin(TAU * (t * 1.2 + f.sway));
        const sc = vector ? 1 : outBack(clamp(t / 0.25), 2) * (1 - seg(t, 0.75, 1));
        const o = vector ? 1 : 1 - seg(t, 0.6, 1);
        return (
          <g
            key={i}
            transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(12 * Math.sin(TAU * (t + f.sway))).toFixed(2)}) scale(${sc.toFixed(4)})`}
            opacity={o >= 1 ? undefined : o}
          >
            <path d={scaled(HEART, f.s)} fill={f.col} />
            <path d={scaled(SIDE, f.s)} fill={shade(f.col, -0.14)} />
          </g>
        );
      })}
      <Sparkle x={CX + 330} y={CY - 210} r={24 * sparkle * (0.8 + 0.2 * wave(p, 4))} color={C.yellow} rot={15} />
      <Sparkle x={CX - 340} y={CY + 120} r={18 * sparkle * (0.8 + 0.2 * wave(p, 4, 0.5))} color={C.violet} />
      <Sparkle x={CX + 300} y={CY + 190} r={13 * sparkle * (0.75 + 0.25 * wave(p, 3, 0.2))} color={C.pink} rot={30} />
    </g>
  );
};
