// Roket startup: menyala dan bergetar di atas awan asap, melesat naik, melayang, lalu turun lagi ke awan (loop mulus).
import React from 'react';
import {TAU, clamp, inOut, mod, out, wave, wave01, yoyo} from '../../kit/loop';
import {C, shade} from '../../kit/palette';
import {Sparkle, roundedPath} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'business-startup-rocket-launch',
  theme: 'business',
  title: 'Startup rocket launching with fire and billowing smoke clouds, business launch concept, seamless loop animation with alpha channel',
  keywords: [
    'rocket', 'startup', 'launch', 'business launch', 'spaceship', 'smoke', 'fire', 'flame', 'takeoff', 'boost', 'growth',
    'success', 'innovation', 'new business', 'project launch', 'start up', 'entrepreneur', 'idea', 'ambition', 'progress',
    'speed', 'acceleration', 'goal', 'vision', 'marketing', 'icon', 'flat design', 'illustration', 'cartoon', 'presentation',
    'explainer', 'social media', 'animation', 'motion graphics', 'seamless loop', 'looped', 'alpha channel',
    'transparent background', 'isolated', '4k',
  ],
  category: 3,
  seconds: 8,
  vectorP: 0.5,
};

const CX = 960;
const TOP = 246; // ujung hidung (posisi dasar, sebelum naik)
const L = 360; // panjang badan
const WM = 84; // setengah lebar maksimum
/** setengah lebar badan pada t = 0 (hidung) … 1 (pantat) */
const half = (t: number) => (t < 0.5 ? WM * Math.pow(Math.sin((Math.PI / 2) * (t / 0.5)), 0.72) : WM * (1 - 0.24 * Math.pow((t - 0.5) / 0.5, 2)));
const N = 48;
const ts = (a: number, b: number) => Array.from({length: N + 1}, (_, i) => a + ((b - a) * i) / N);
/** potongan badan antara t0 dan t1 (kiri→kanan sebagai pita), opsional hanya sisi kanan mulai fraksi f */
const band = (t0: number, t1: number, f0 = -1, f1 = 1) => {
  const right = ts(t0, t1).map((t) => [CX + half(t) * f1, TOP + t * L] as [number, number]);
  const left = ts(t1, t0).map((t) => [CX + half(t) * f0, TOP + t * L] as [number, number]);
  return 'M' + [...right, ...left].map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(' L') + ' Z';
};

const Body: React.FC = () => {
  const red = C.coral;
  const yb = TOP + L;
  const wb = half(1);
  return (
    <g>
      {/* sirip samping */}
      <path
        d={roundedPath(
          [
            [CX - half(0.6) + 6, TOP + 0.6 * L],
            [CX - wb - 62, yb + 10],
            [CX - wb - 56, yb + 50],
            [CX - wb + 10, yb - 4],
          ],
          14,
        )}
        fill={red}
      />
      <path
        d={roundedPath(
          [
            [CX + half(0.6) - 6, TOP + 0.6 * L],
            [CX + wb + 62, yb + 10],
            [CX + wb + 56, yb + 50],
            [CX + wb - 10, yb - 4],
          ],
          14,
        )}
        fill={shade(red, -0.16)}
      />
      {/* nosel */}
      <path d={roundedPath([[CX - 46, yb - 6], [CX + 46, yb - 6], [CX + 58, yb + 30], [CX - 58, yb + 30]], 8)} fill={C.slate} />
      <path d={roundedPath([[CX + 10, yb - 6], [CX + 46, yb - 6], [CX + 58, yb + 30], [CX + 14, yb + 30]], 6)} fill={shade(C.slate, -0.2)} />
      {/* badan */}
      <path d={band(0, 1)} fill={C.cloud} />
      <path d={band(0.02, 1, 0.42, 1)} fill={C.mist} />
      {/* hidung & pita */}
      <path d={band(0, 0.26)} fill={red} />
      <path d={band(0.02, 0.26, 0.42, 1)} fill={shade(red, -0.16)} />
      <path d={band(0.8, 1)} fill={red} />
      <path d={band(0.8, 1, 0.42, 1)} fill={shade(red, -0.16)} />
      {/* kilau kiri */}
      <path
        d={ts(0.33, 0.72)
          .map((t, i) => `${i ? 'L' : 'M'}${(CX - half(t) * 0.66).toFixed(1)},${(TOP + t * L).toFixed(1)}`)
          .join(' ')}
        fill="none"
        stroke={C.white}
        strokeWidth={12}
        strokeLinecap="round"
      />
      <path
        d={ts(0.1, 0.18)
          .map((t, i) => `${i ? 'L' : 'M'}${(CX - half(t) * 0.55).toFixed(1)},${(TOP + t * L).toFixed(1)}`)
          .join(' ')}
        fill="none"
        stroke={shade(red, 0.42)}
        strokeWidth={10}
        strokeLinecap="round"
      />
      {/* jendela */}
      <circle cx={CX} cy={TOP + 0.47 * L} r={50} fill={C.ink} />
      <circle cx={CX} cy={TOP + 0.47 * L} r={36} fill={C.sky} />
      <path d={`M${CX + 36},${TOP + 0.47 * L} A36,36 0 0 1 ${CX - 25.5},${TOP + 0.47 * L + 25.5} A44,44 0 0 0 ${CX + 36},${TOP + 0.47 * L}Z`} fill={shade(C.sky, -0.16)} />
      <circle cx={CX - 12} cy={TOP + 0.47 * L - 13} r={10} fill={shade(C.sky, 0.6)} />
      {/* sirip tengah (depan) */}
      <rect x={CX - 13} y={TOP + 0.74 * L} width={26} height={0.26 * L - 4} rx={13} fill={shade(red, -0.1)} />
      <rect x={CX - 6} y={TOP + 0.76 * L} width={8} height={0.26 * L - 20} rx={4} fill={shade(red, 0.3)} />
    </g>
  );
};

/** Lidah api (tetes) dari (x, y) ke bawah sepanjang len. */
const flame = (x: number, y: number, hw: number, len: number) =>
  `M${x - hw},${y} C${x - hw},${y + len * 0.45} ${x - hw * 0.35},${y + len * 0.8} ${x},${y + len} C${x + hw * 0.35},${y + len * 0.8} ${x + hw},${y + len * 0.45} ${x + hw},${y} Z`;

const SMOKE_Y = 812;
export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  // kekuatan dorong: siaga → menyala → naik → melayang → turun
  const ign = yoyo(p, 0.06, 0.2, 0.84, 0.95, inOut, inOut); // nyala & asap
  const lift = yoyo(p, 0.2, 0.36, 0.66, 0.86, inOut, inOut); // ketinggian
  const shake = clamp(ign * (1.15 - 0.6 * lift)) * (1 + 0.6 * yoyo(p, 0.16, 0.22, 0.24, 0.34));
  const dx = shake * (4.5 * wave(p, 64) + 2.5 * wave(p, 41, 0.3));
  const dy = -112 * lift + 6 * lift * wave(p, 3, 0.1) + shake * 2.2 * wave(p, 53, 0.6);
  const rot = shake * 0.9 * wave(p, 37, 0.2) + lift * 1.5 * wave(p, 2, 0.25);
  const fl = 0.35 + 0.65 * ign;
  const flick = 1 + 0.1 * wave(p, 24) + 0.06 * wave(p, 37, 0.4);
  const fy = TOP + L + 26;
  const fLen = (70 + 120 * fl + 40 * lift) * flick;
  // awan asap: inti berdenyut + gumpal yang mengalir ke samping
  const core = [
    [-150, -10, 74],
    [-60, -42, 92],
    [50, -38, 96],
    [150, -6, 78],
    [-230, 18, 56],
    [235, 20, 58],
    [0, 10, 86],
  ];
  const sm = 0.62 + 0.38 * ign;
  const spread = 0.5 + 0.5 * ign;
  const puffs = Array.from({length: 10}, (_, i) => {
    const side = i % 2 ? 1 : -1;
    const u = mod(p * 3 + i / 10 + (side > 0 ? 0.05 : 0), 1);
    const x = CX + side * (110 + 250 * out(u) * spread);
    const y = SMOKE_Y + 18 - 70 * u + 10 * Math.sin(u * TAU);
    const r = (38 + 30 * (i % 3) / 2) * Math.pow(Math.sin(Math.PI * u), 0.8) * ign;
    return {x, y, r, i};
  });
  // garis laju & bintang yang jatuh ke bawah
  const speed = 0.25 + 0.75 * lift;
  const lines = [
    [-250, 0.0, 120],
    [-190, 0.45, 80],
    [-320, 0.7, 70],
    [230, 0.2, 110],
    [300, 0.62, 80],
    [175, 0.85, 70],
  ];
  return (
    <g>
      {/* garis laju */}
      {lines.map(([ox, off, len], i) => {
        const u = mod(p * 4 + off, 1);
        const k = Math.sin(Math.PI * u) * speed;
        const y = 170 + 520 * u;
        const l = len * k;
        if (l < 18) return null;
        return <rect key={`l${i}`} x={CX + ox - 6} y={y} width={12} height={l} rx={6} fill={i % 2 ? C.steel : C.mist} />;
      })}
      {[
        [-330, 0.1, 18, C.yellow],
        [320, 0.55, 22, C.yellow],
        [260, 0.32, 12, C.sky],
        [-260, 0.78, 13, C.sky],
      ].map(([ox, off, r, col], i) => {
        const u = mod(p * 2 + (off as number), 1);
        return (
          <Sparkle
            key={`s${i}`}
            x={CX + (ox as number)}
            y={170 + 480 * u}
            r={(r as number) * Math.pow(Math.sin(Math.PI * u), 0.6) * (0.85 + 0.15 * wave(p, 6, i * 0.2))}
            color={col as string}
            rot={i * 20}
          />
        );
      })}
      {/* asap belakang */}
      {puffs.map(({x, y, r, i}) =>
        r > 1 ? <circle key={`pb${i}`} cx={x} cy={y - r * 0.15} r={r} fill={shade(C.mist, -0.12)} /> : null,
      )}
      {/* roket */}
      <g transform={`translate(${dx.toFixed(2)} ${dy.toFixed(2)}) rotate(${rot.toFixed(3)} ${CX} ${TOP + L})`}>
        <path d={flame(CX, fy - 4, 46, fLen)} fill={C.orange} />
        <path d={flame(CX, fy - 4, 30, fLen * 0.74)} fill={C.yellow} />
        <path d={flame(CX, fy - 4, 15, fLen * 0.46)} fill={shade(C.yellow, 0.7)} />
        <Body />
      </g>
      {/* awan inti di depan pantat roket */}
      {core.map(([ox, oy, r], i) => {
        const rr = r * 0.88 * sm * (1 + 0.07 * wave(p, 3 + (i % 3), i * 0.17));
        return <circle key={`c${i}`} cx={CX + ox * spread} cy={SMOKE_Y + oy} r={rr} fill={shade(C.mist, -0.12)} />;
      })}
      {core.map(([ox, oy, r], i) => {
        const rr = r * 0.88 * sm * (1 + 0.07 * wave(p, 3 + (i % 3), i * 0.17));
        return <circle key={`f${i}`} cx={CX + ox * spread} cy={SMOKE_Y + oy - 8} r={rr - 8} fill={C.mist} />;
      })}
      {core.map(([ox, oy, r], i) => {
        const rr = r * 0.88 * sm * (1 + 0.07 * wave(p, 3 + (i % 3), i * 0.17));
        return i < 4 ? <circle key={`h${i}`} cx={CX + ox * spread - rr * 0.3} cy={SMOKE_Y + oy - rr * 0.42} r={rr * 0.2} fill={shade(C.mist, 0.5)} /> : null;
      })}
      {puffs.map(({x, y, r, i}) => (r > 1 ? <circle key={`pf${i}`} cx={x} cy={y} r={r * 0.86} fill={C.mist} /> : null))}
      <Sparkle x={CX - 300} y={260} r={20 * wave01(p, 2) + 6} color={C.yellow} rot={12} />
    </g>
  );
};
