// Awan hujan mengambang: tetes air jatuh dari bawah awan, menimpa genangan dan membentuk cincin riak
// serta percikan kecil. Semua gerak periodik (tetes berulang k kali per loop) sehingga loop mulus.
import React from 'react';
import {clamp, mod, out, rng, wave} from '../../kit/loop';
import {C, shade} from '../../kit/palette';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'nature-rain-cloud-puddle',
  theme: 'nature',
  title: 'Rain cloud with falling raindrops splashing into puddle ripples, weather icon seamless loop animation with alpha channel',
  keywords: [
    'rain', 'rain cloud', 'raindrops', 'puddle', 'ripples', 'splash', 'weather', 'cloud', 'rainy day', 'drizzle', 'shower',
    'water', 'drop', 'forecast', 'weather icon', 'climate', 'season', 'autumn', 'monsoon', 'precipitation', 'nature',
    'environment', 'meteorology', 'wet', 'storm', 'flat design', 'illustration', 'icon', 'cartoon', 'animation',
    'motion graphics', 'seamless loop', 'looped', 'alpha channel', 'transparent background', 'isolated', '4k', 'explainer',
    'presentation', 'social media', 'weather app',
  ],
  category: 5,
  seconds: 6,
  vectorP: 0.37,
};

const K = 2; // tiap tetes jatuh 2 kali per loop (siklus 3 dtk)
const FALL = 0.28; // porsi siklus untuk jatuh (±0,8 dtk, makin cepat)
const RIPPLE = 0.32; // porsi siklus untuk riak menyebar & memudar
const POOL = {cx: 960, cy: 826, rx: 344, ry: 56};
const TOP = 462; // tetes lahir di balik awan

const R = rng(11);
const COLS = [-204, -136, -68, 0, 68, 136, 204];
const DROPS = COLS.flatMap((cx, c) =>
  [0, 1].map((j) => {
    const z = (c * 0.53 + j * 0.37) % 1;
    return {
      x: 960 + cx + (R() - 0.5) * 22,
      o: (c * 0.29 + j / 2 + R() * 0.05) % 1,
      z,
      landY: POOL.cy - 20 + z * 36,
    };
  }),
).sort((a, b) => a.z - b.z);

// genangan berbentuk organik (perspektif)
const puddlePath = (dy = 0) => {
  const n = 72;
  const pts = Array.from({length: n}, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + 0.04 * Math.sin(2 * a + 2.2) + 0.035 * Math.sin(3 * a + 0.4) + 0.018 * Math.sin(5 * a + 1.1);
    return `${(POOL.rx * k * Math.cos(a)).toFixed(2)},${(POOL.ry * k * Math.sin(a) + dy).toFixed(2)}`;
  });
  return `M${pts.join(' L')} Z`;
};
const PUDDLE = puddlePath();
const PUDDLE_SIDE = puddlePath(9);

// awan dari gabungan lingkaran + alas membulat
const CLOUD_BUMPS: [number, number, number][] = [
  [782, 374, 86],
  [880, 318, 116],
  [1018, 296, 132],
  [1124, 352, 98],
];
// baseOnly: hanya alas (untuk pita bayangan bawah) supaya bayangan tidak mengintip di lekuk antar-tonjolan
const Cloud: React.FC<{fill: string; dy?: number; dx?: number; baseOnly?: boolean}> = ({fill, dy = 0, dx = 0, baseOnly}) => (
  <g transform={`translate(${dx} ${dy})`} fill={fill}>
    {baseOnly
      ? null
      : CLOUD_BUMPS.map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} />
        ))}
    <rect x={690} y={350} width={540} height={110} rx={55} />
  </g>
);

// [kolom, y, kedalaman] untuk pose vektor; riak [x, y, rx]
const VDROPS: [number, number, number][] = [
  [0, 590, 0.3],
  [1, 520, 0.8],
  [2, 676, 0.5],
  [3, 556, 0.9],
  [4, 640, 0.2],
  [5, 516, 0.6],
  [6, 604, 0.4],
];
const VRINGS: [number, number, number][] = [
  [880, 822, 64],
  [1100, 832, 46],
];

const dropPath = (r: number, h: number) =>
  `M0,${-h} Q${r * 1.05},${-r * 0.35} ${r},0 A${r},${r} 0 0 1 ${-r},0 Q${-r * 1.05},${-r * 0.35} 0,${-h} Z`;

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  const bob = 7 * wave(p, 1);
  const breathe = 1 + 0.014 * wave(p, 2, 0.25);
  const backBob = 6 * wave(p, 1, 0.3);
  const poolPulse = 1 + 0.01 * wave(p, 3);

  // pose vektor: susunan tetes & riak yang dikurasi (7 tetes berselang-seling, 2 riak)
  const drops = vector ? [] : DROPS.map((d) => ({...d, t: mod(p * K + d.o, 1)}));
  return (
    <g>
      {/* genangan */}
      <g transform={`translate(${POOL.cx} ${POOL.cy}) scale(${poolPulse} 1)`}>
        <path d={PUDDLE_SIDE} fill={shade(C.blue, -0.05)} />
        <path d={PUDDLE} fill={C.sky} />
        <g transform="translate(-26 -5) scale(0.8 0.66)">
          <path d={PUDDLE} fill={shade(C.sky, -0.1)} />
        </g>
        <path d="M-300,-4 Q-292,-34 -232,-44" fill="none" stroke={shade(C.sky, 0.55)} strokeWidth={9} strokeLinecap="round" />
      </g>
      {/* riak & percikan */}
      {drops.map((d, i) => {
        if (d.t < FALL) return null;
        const u = (d.t - FALL) / RIPPLE;
        if (u > 1) return null;
        const rings = [0, 0.3].map((lag, j) => {
          const v = clamp((u - lag) / (1 - lag));
          if (v <= 0 || v >= 1) return null;
          const rx = (14 + (j ? 36 : 62) * out(v)) * (0.85 + 0.25 * d.z);
          const fade = Math.pow(1 - v, 1.4);
          if (vector && (fade < 0.5 || j > 0)) return null;
          return (
            <ellipse
              key={j}
              cx={d.x}
              cy={d.landY}
              rx={rx}
              ry={rx * (POOL.ry / POOL.rx) * 1.05}
              fill="none"
              stroke={shade(C.sky, 0.72)}
              strokeWidth={(j ? 5 : 7.5) * (0.65 + 0.35 * fade)}
              opacity={vector ? undefined : fade}
            />
          );
        });
        const sp = clamp(u / 0.4);
        const splash =
          sp > 0 && sp < 1
            ? [-1, 1].map((s) => {
                const x = d.x + s * (10 + 34 * out(sp));
                const y = d.landY - 52 * Math.sin(Math.PI * sp) * (s > 0 ? 1 : 0.8);
                const r = 7 * (1 - sp * 0.5);
                if (vector) return null;
                return <circle key={s} cx={x} cy={y} r={r} fill={shade(C.sky, 0.3)} />;
              })
            : null;
        return (
          <g key={i}>
            {rings}
            {splash}
          </g>
        );
      })}
      {vector
        ? VDROPS.map(([c, y, z], i) => {
            const r = 13 + 4 * z;
            const col = z > 0.5 ? C.blue : shade(C.blue, 0.2);
            return (
              <g key={`v${i}`} transform={`translate(${960 + COLS[c]} ${y}) scale(0.92 1.18)`}>
                <path d={dropPath(r, r * 2.5)} fill={col} />
                <ellipse cx={-r * 0.38} cy={-r * 0.15} rx={r * 0.22} ry={r * 0.42} fill={shade(col, 0.55)} />
              </g>
            );
          })
        : null}
      {vector
        ? VRINGS.map(([x, y, rx], i) => (
            <ellipse key={`r${i}`} cx={x} cy={y} rx={rx} ry={rx * (POOL.ry / POOL.rx) * 1.05} fill="none" stroke={shade(C.sky, 0.72)} strokeWidth={7} />
          ))
        : null}
      {/* tetes jatuh (lahir di balik awan) */}
      {drops.map((d, i) => {
        if (d.t >= FALL) return null;
        const v = d.t / FALL;
        const y = TOP + (d.landY - 20 - TOP) * (0.55 * v + 0.45 * v * v);
        const r = 13 + 4 * d.z;
        if (vector && y - r * 2.6 < 470) return null; // pose statis: tetes boleh tampak keluar dari awan, tapi tidak tersembunyi penuh
        const stretch = 1 + 0.25 * v;
        const col = d.z > 0.5 ? C.blue : shade(C.blue, 0.2);
        return (
          <g key={i} transform={`translate(${d.x.toFixed(2)} ${y.toFixed(2)}) scale(${(1 / Math.sqrt(stretch)).toFixed(3)} ${stretch.toFixed(3)})`}>
            <path d={dropPath(r, r * 2.5)} fill={col} />
            <ellipse cx={-r * 0.38} cy={-r * 0.15} rx={r * 0.22} ry={r * 0.42} fill={shade(col, 0.55)} />
          </g>
        );
      })}
      <g transform="translate(960 330) scale(1.1) translate(-960 -330)">
      {/* awan belakang (lebih gelap, paralaks) */}
      <g transform={`translate(760 ${292 + backBob}) scale(0.62) translate(-960 -380)`}>
        <Cloud fill={shade(C.steel, -0.16)} dy={18} baseOnly />
        <Cloud fill={C.steel} />
      </g>
      {/* awan utama */}
      <g transform={`translate(960 ${380 + bob}) scale(${breathe} ${2 - breathe}) translate(-960 -380)`}>
        <Cloud fill={shade(C.mist, -0.16)} dy={18} baseOnly />
        <Cloud fill={C.mist} />
        {/* kilau di puncak tonjolan */}
        <path d="M800,330 A64,64 0 0 1 846,292" fill="none" stroke={C.cloud} strokeWidth={14} strokeLinecap="round" />
        <path d="M940,240 A92,92 0 0 1 1010,196" fill="none" stroke={C.cloud} strokeWidth={14} strokeLinecap="round" />
        <circle cx={1040} cy={194} r={7} fill={C.cloud} />
      </g>
      </g>
    </g>
  );
};
