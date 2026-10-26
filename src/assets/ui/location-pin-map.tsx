// Pin lokasi jatuh ke peta lipat mini, memantul, riak di titik tujuan, rute putus-putus tergambar, lalu pin terangkat pergi.
import React from 'react';
import {clamp, inOut, mod, out, outBack, seg, wave, wave01, yoyo} from '../../kit/loop';
import {C, shade} from '../../kit/palette';
import {Shadow, Sparkle, roundedPath} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'ui-location-pin-map',
  theme: 'ui',
  title: 'Location pin dropping and bouncing on folded map with route line, flat icon animation, seamless loop with alpha channel',
  keywords: [
    'location pin',
    'map pin',
    'map',
    'gps',
    'navigation',
    'location',
    'marker',
    'destination',
    'route',
    'travel',
    'direction',
    'place',
    'address',
    'delivery',
    'tracking',
    'geolocation',
    'pointer',
    'icon',
    'ui',
    'user interface',
    'app',
    'mobile app',
    'folded map',
    'journey',
    'tourism',
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
    'social media',
    'logistics',
    'web',
  ],
  category: 19,
  seconds: 8,
  vectorP: 0.6,
};

// --- peta dalam perspektif: (u,v) ∈ [0,1]², u kiri→kanan, v jauh→dekat ---
const FOLD = 22;
const fold = (u: number) => {
  const k = (u * 3) % 2; // 0..2 zigzag tiap sepertiga
  const t = k <= 1 ? k : 2 - k;
  return FOLD * t;
};
const mp = (u: number, v: number): [number, number] => {
  const top = 652 + 616 * u;
  const bot = 548 + 824 * u;
  return [top + (bot - top) * v, 608 + 252 * v - fold(u)];
};
const fmt = (pts: [number, number][]) => pts.map((q, i) => `${i ? 'L' : 'M'}${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(' ');
/** Catmull–Rom di ruang uv → titik layar. */
const spline = (uv: [number, number][], n = 80) => {
  const out: [number, number][] = [];
  const P = [uv[0], ...uv, uv[uv.length - 1]];
  for (let s = 0; s <= n; s++) {
    const g = (s / n) * (uv.length - 1);
    const i = Math.min(uv.length - 2, Math.floor(g));
    const t = g - i;
    const [p0, p1, p2, p3] = [P[i], P[i + 1], P[i + 2], P[i + 3]];
    const cr = (a: number, b: number, c: number, d: number) =>
      0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
    out.push(mp(cr(p0[0], p1[0], p2[0], p3[0]), cr(p0[1], p1[1], p2[1], p3[1])));
  }
  return out;
};
/** Petak membulat (superelips) dalam uv → path layar. */
const blob = (cu: number, cv: number, ru: number, rv: number, e = 0.6, n = 48) =>
  fmt(
    Array.from({length: n}, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      const c = Math.cos(a);
      const s = Math.sin(a);
      return mp(cu + ru * Math.sign(c) * Math.pow(Math.abs(c), e), cv + rv * Math.sign(s) * Math.pow(Math.abs(s), e));
    }),
  ) + ' Z';
const panel = (u0: number, u1: number) => [mp(u0, 0), mp(u1, 0), mp(u1, 1), mp(u0, 1)] as [number, number][];

const RIVER = spline([
  [0, 0.2],
  [0.22, 0.3],
  [0.42, 0.14],
  [0.62, 0.22],
  [0.82, 0.08],
  [1, 0.16],
]);
const ROAD_H = spline(
  [
    [0.02, 0.62],
    [0.3, 0.6],
    [0.6, 0.66],
    [0.98, 0.62],
  ],
  40,
);
const ROAD_V = spline(
  [
    [0.38, 0.03],
    [0.4, 0.4],
    [0.36, 0.97],
  ],
  40,
);
const ROAD_D = spline(
  [
    [0.66, 0.36],
    [0.82, 0.5],
    [0.97, 0.66],
  ],
  40,
);
const ROUTE = spline(
  [
    [0.13, 0.86],
    [0.2, 0.72],
    [0.36, 0.7],
    [0.52, 0.64],
    [0.6, 0.5],
  ],
  90,
);
const TARGET = mp(0.6, 0.5);
const START = mp(0.13, 0.86);
const CUM = ROUTE.map((_, i) => 0);
for (let i = 1; i < ROUTE.length; i++) CUM[i] = CUM[i - 1] + Math.hypot(ROUTE[i][0] - ROUTE[i - 1][0], ROUTE[i][1] - ROUTE[i - 1][1]);
const routeLen = CUM[CUM.length - 1];
const GAP = 30;
/** Titik-titik rute berjarak GAP, digeser `shift` px sepanjang lintasan (berbaris maju). */
const routeDots = (shift: number) => {
  const res: [number, number, number][] = [];
  let j = 0;
  for (let d = 44 + (shift % GAP); d <= routeLen - 60; d += GAP) {
    while (j < CUM.length - 2 && CUM[j + 1] < d) j++;
    const t = (d - CUM[j]) / (CUM[j + 1] - CUM[j]);
    res.push([ROUTE[j][0] + (ROUTE[j + 1][0] - ROUTE[j][0]) * t, ROUTE[j][1] + (ROUTE[j + 1][1] - ROUTE[j][1]) * t, d]);
  }
  return res;
};

// --- pin ---
const R = 148;
const D = 248; // jarak pusat kepala → ujung
const st = Math.sqrt(1 - (R / D) ** 2);
const ct = R / D;
const TX = R * st;
const TY = R * ct;
const PIN = `M${TX.toFixed(1)},${(TY - D).toFixed(1)} A${R},${R} 0 1 0 ${(-TX).toFixed(1)},${(TY - D).toFixed(1)} L-14,-22 Q0,4 14,-22 Z`;
const PIN_SIDE = `M0,${-D - R} A${R},${R} 0 0 1 ${TX.toFixed(1)},${(TY - D).toFixed(1)} L14,-22 Q0,4 -4,-10 Q74,-150 0,${-D - R} Z`;

const DROP = [0.07, 0.2]; // jatuh
const LIFT = [0.8, 0.9]; // terangkat pergi

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  // ketinggian pin (px di atas tanah) & squash
  let h = 0;
  let o = 1;
  if (!vector) {
    if (p < DROP[0] || p > LIFT[1]) {
      h = 200;
      o = 0;
    } else if (p < DROP[1]) {
      const t = (p - DROP[0]) / (DROP[1] - DROP[0]);
      h = 200 * (1 - t * t);
      o = clamp(t * 2.5);
    } else if (p < 0.34) {
      // dua pantulan teredam
      const t = (p - DROP[1]) / (0.34 - DROP[1]);
      h = t < 0.6 ? 90 * Math.sin((Math.PI * t) / 0.6) : 24 * Math.sin((Math.PI * (t - 0.6)) / 0.4);
    } else if (p > LIFT[0]) {
      const t = (p - LIFT[0]) / (LIFT[1] - LIFT[0]);
      h = t < 0.25 ? 0 : 220 * Math.pow((t - 0.25) / 0.75, 1.6);
      o = 1 - seg(t, 0.4, 1);
    }
  }
  const squashImpact = vector
    ? 0
    : Math.max(
        Math.sin(Math.PI * clamp((p - DROP[1]) / 0.035)) * (p >= DROP[1] ? 1 : 0),
        0.5 * Math.sin(Math.PI * clamp((p - (DROP[1] + 0.6 * (0.34 - DROP[1]))) / 0.03)),
        0.35 * Math.sin(Math.PI * clamp((p - 0.34) / 0.03)),
      );
  const anti = vector ? 0 : Math.sin(Math.PI * seg(p, LIFT[0], LIFT[0] + 0.025, inOut));
  const sq = 0.12 * squashImpact + 0.08 * anti;
  const stretch = !vector && p > DROP[0] && p < DROP[1] ? 0.06 * seg(p, DROP[0], DROP[1]) : 0;
  const settled = vector ? 1 : yoyo(p, 0.3, 0.38, 0.76, 0.8);
  const breath = 1 + 0.02 * settled * wave(p, 4);
  const route = vector ? 1 : yoyo(p, 0.34, 0.52, 0.8, 0.9, inOut, inOut);
  const startDot = vector ? 1 : yoyo(p, 0.3, 0.38, 0.84, 0.92, (t) => outBack(t, 2), inOut);
  const dashShift = vector ? 0 : mod(p * 8, 1) * GAP;
  const sparkle = vector ? 1 : settled;
  const shadowK = clamp(1 - h / 260);

  return (
    <g>
      <Shadow cx={960} cy={884} rx={450} ry={30} vector={vector} />
      {/* tepi kertas (tebal) */}
      {[0, 1, 2].map((i) => {
        const a = mp(i / 3, 1);
        const b = mp((i + 1) / 3, 1);
        return (
          <path
            key={`e${i}`}
            d={`M${a[0]},${a[1]} L${b[0]},${b[1]} L${b[0]},${b[1] + 16} L${a[0]},${a[1] + 16} Z`}
            fill={shade(C.mist, i % 2 ? -0.22 : -0.12)}
            strokeLinejoin="round"
          />
        );
      })}
      {/* panel peta */}
      {[0, 1, 2].map((i) => (
        <path key={`p${i}`} d={roundedPath(panel(i / 3, (i + 1) / 3), 6)} fill={i % 2 ? shade(C.cloud, -0.07) : C.white} />
      ))}
      {/* taman & kolam */}
      <path d={blob(0.15, 0.4, 0.11, 0.12)} fill={C.green} />
      <path d={blob(0.84, 0.82, 0.11, 0.11)} fill={shade(C.green, 0.1)} />
      <path d={blob(0.57, 0.86, 0.09, 0.08, 0.9)} fill={shade(C.sky, 0.15)} />
      <path d={blob(0.55, 0.84, 0.035, 0.03, 1)} fill={shade(C.sky, 0.5)} />
      {/* sungai */}
      <path d={fmt(RIVER)} fill="none" stroke={shade(C.sky, 0.15)} strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" />
      <path
        d={fmt(RIVER)}
        fill="none"
        stroke={shade(C.sky, 0.5)}
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray="28 44"
        strokeDashoffset={vector ? 0 : -mod(p * 4, 1) * 72}
      />
      {/* jalan */}
      {[ROAD_H, ROAD_V, ROAD_D].map((r, i) => (
        <path key={`r${i}`} d={fmt(r)} fill="none" stroke={shade(C.mist, -0.04)} strokeWidth={18} strokeLinecap="round" />
      ))}
      {/* pepohonan bulat */}
      {[
        [0.1, 0.38],
        [0.2, 0.44],
        [0.8, 0.8],
        [0.89, 0.86],
      ].map(([u, v], i) => {
        const [x, y] = mp(u, v);
        const s = 1 + 0.04 * wave(p, 2, i * 0.3);
        return (
          <g key={`t${i}`} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s.toFixed(4)})`}>
            <rect x={-5} y={-14} width={10} height={16} rx={5} fill={shade(C.brown, -0.1)} />
            <circle cy={-30} r={22} fill={shade(C.green, -0.08)} />
            <circle cx={-7} cy={-37} r={7} fill={shade(C.green, 0.35)} />
          </g>
        );
      })}
      {/* rute putus-putus */}
      {route > 0.01
        ? routeDots(dashShift).map(([x, y, d], i) => {
            const lim = routeLen * route;
            if (d > lim) return null;
            const k = clamp((lim - d) / 30);
            return <circle key={`d${i}`} cx={x.toFixed(1)} cy={y.toFixed(1)} r={7.5 * k} fill={shade(C.coral, -0.06)} />;
          })
        : null}
      {startDot > 0.01 ? (
        <g transform={`translate(${START[0].toFixed(1)} ${START[1].toFixed(1)}) scale(${startDot.toFixed(4)} ${(startDot * 0.62).toFixed(4)})`}>
          <circle r={26} fill={C.coral} />
          <circle r={12} fill={C.white} />
        </g>
      ) : null}
      {/* riak di titik tujuan (elips, ikut perspektif) */}
      {[0, 0.5].map((off, i) => {
        const t = mod(p * 4 + off, 1);
        const a = vector ? (i ? 0 : 1) : settled * (1 - t);
        if (a < 0.01) return null;
        const r = vector ? 130 : 80 + 110 * out(t);
        return (
          <ellipse
            key={`w${i}`}
            cx={TARGET[0]}
            cy={TARGET[1]}
            rx={r}
            ry={r * 0.34}
            fill="none"
            stroke={C.coral}
            strokeWidth={vector ? 9 : 10 * (1 - t) + 3}
            opacity={vector ? undefined : a * 0.7}
          />
        );
      })}
      {/* bayangan pin di peta */}
      {o > 0.01 ? (
        <ellipse
          cx={TARGET[0]}
          cy={TARGET[1]}
          rx={66 * (0.45 + 0.55 * shadowK) * (1 + sq)}
          ry={20 * (0.45 + 0.55 * shadowK)}
          fill={vector ? shade(C.cloud, -0.2) : '#0B1020'}
          opacity={vector ? undefined : 0.22 * shadowK * o}
        />
      ) : null}
      {/* pin */}
      {o > 0.01 ? (
        <g
          transform={`translate(${TARGET[0].toFixed(1)} ${(TARGET[1] - h).toFixed(1)}) scale(${((1 + sq - stretch) * breath * out(o)).toFixed(4)} ${((1 - sq + stretch) * breath * out(o)).toFixed(4)})`}
        >
          <path d={PIN} fill={C.coral} />
          <path d={PIN_SIDE} fill={shade(C.coral, -0.14)} />
          <circle cy={-D} r={62} fill={C.white} />
          <path d={`M62,${-D} A62,62 0 0 1 -44,${-D + 44} A70,70 0 0 0 62,${-D} Z`} fill={shade(C.cloud, -0.06)} />
          <circle cy={-D} r={30} fill={shade(C.coral, -0.12)} />
          <path
            d={`M${-R + 34},${-D - 30} A${R - 34},${R - 34} 0 0 1 ${-34},${-D - R + 36}`}
            fill="none"
            stroke={shade(C.coral, 0.4)}
            strokeWidth={16}
            strokeLinecap="round"
          />
          <circle cx={-R + 30} cy={-D + 18} r={9} fill={shade(C.coral, 0.4)} />
        </g>
      ) : null}
      <Sparkle x={1330} y={330} r={26 * sparkle * (0.8 + 0.2 * wave(p, 4))} color={C.yellow} rot={15} />
      <Sparkle x={640} y={400} r={18 * sparkle * (0.8 + 0.2 * wave(p, 4, 0.5))} color={C.sky} />
      <Sparkle x={1250} y={470} r={12 * sparkle * wave01(p, 3, 0.2)} color={C.coral} rot={30} />
    </g>
  );
};
