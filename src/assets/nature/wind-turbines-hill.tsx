// Tiga turbin angin di bukit hijau: baling-baling berputar dengan kecepatan berbeda (kelipatan 360° per loop),
// garis angin melintas, awan kecil hanyut, pohon bergoyang pelan. Seluruh gerak periodik → loop mulus.
import React from 'react';
import {mix, mod, TAU, wave} from '../../kit/loop';
import {blend, C, shade} from '../../kit/palette';
import {Shadow} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'nature-wind-turbines-hill',
  theme: 'nature',
  title: 'Wind turbines spinning on green hill with blowing wind and drifting clouds, renewable energy seamless loop animation',
  keywords: [
    'wind turbine', 'wind energy', 'renewable energy', 'wind power', 'windmill', 'green energy', 'clean energy',
    'sustainable', 'sustainability', 'eco', 'ecology', 'environment', 'hill', 'landscape', 'electricity', 'power',
    'alternative energy', 'wind farm', 'turbine', 'spinning', 'wind', 'climate', 'climate change', 'nature', 'green',
    'flat design', 'illustration', 'icon', 'cartoon', 'animation', 'motion graphics', 'seamless loop', 'looped',
    'alpha channel', 'transparent background', 'isolated', '4k', 'explainer', 'presentation', 'infographic', 'social media',
  ],
  category: 5,
  seconds: 8,
  vectorP: 0.3,
};

const BASE = 866;
const SKY = {cx: 960, cy: 482, r: 380};
const dome = (cx: number, hw: number, h: number) => (x: number) => {
  const u = clamp1(1 - ((x - cx) / hw) ** 2);
  return BASE - h * Math.pow(u, 0.7);
};
const clamp1 = (v: number) => Math.max(0, Math.min(1, v));
// kubah bukit dengan puncak tetap di BASE − h dan alas di `base`
const domePath = (cx: number, hw: number, h: number, base = BASE) => {
  const top = BASE - h;
  const pts: string[] = [];
  const n = 64;
  for (let i = 0; i <= n; i++) {
    const x = cx - hw + (2 * hw * i) / n;
    const u = clamp1(1 - ((x - cx) / hw) ** 2);
    pts.push(`${x.toFixed(1)},${(base - (base - top) * Math.pow(u, 0.7)).toFixed(1)}`);
  }
  return `M${pts.join(' L')} Z`;
};
const FRONT = {cx: 860, hw: 420, h: 180};
const BACK = {cx: 1214, hw: 280, h: 240};
const frontY = dome(FRONT.cx, FRONT.hw, FRONT.h);
const backY = dome(BACK.cx, BACK.hw, BACK.h);

// garis kilau mengikuti permukaan bukit
const ridge = (f: (x: number) => number, x0: number, x1: number, inset: number) => {
  const pts = Array.from({length: 13}, (_, i) => {
    const x = x0 + ((x1 - x0) * i) / 12;
    return `${x.toFixed(1)},${(f(x) + inset).toFixed(1)}`;
  });
  return `M${pts.join(' L')}`;
};

const TURBINES = [
  {x: 1196, y: backY(1196), h: 280, blade: 112, k: 2, ph: 0.1, depth: 1},
  {x: 850, y: frontY(850), h: 390, blade: 168, k: 1, ph: 0, depth: 0},
  {x: 668, y: frontY(668), h: 190, blade: 82, k: 2, ph: 0.4, depth: 0},
];

// bilah: profil lebar (chord) sepanjang t ∈ [0,1], tepi depan lebih lurus, ujung membulat
const chord = (L: number, t: number) => L * 0.12 * (0.5 + 2.1 * t * Math.pow(1 - t, 1.5)) * Math.sqrt(Math.max(0, 1 - Math.pow(t, 6)));
const bladeSeg = (L: number, t0: number, t1: number, half: 'all' | 'right' = 'all') => {
  const n = 28;
  const ts = Array.from({length: n + 1}, (_, i) => t0 + ((t1 - t0) * i) / n);
  const y = (t: number) => -8 - (L - 8) * t;
  const left = ts.map((t) => `${(half === 'right' ? chord(L, t) * 0.08 : -chord(L, t) * 0.55).toFixed(2)},${y(t).toFixed(2)}`);
  const right = ts.map((t) => `${(chord(L, t) * 0.45).toFixed(2)},${y(t).toFixed(2)}`).reverse();
  return `M${left.join(' L')} L${right.join(' L')} Z`;
};

const Turbine: React.FC<{x: number; y: number; h: number; blade: number; rot: number}> = ({x, y, h, blade, rot}) => {
  const hubY = y - h;
  const wb = h * 0.075;
  const wt = h * 0.036;
  const hub = blade * 0.15;
  return (
    <g>
      {/* tiang meruncing */}
      <path d={`M${x - wb},${y + 30} L${x - wt},${hubY} L${x + wt},${hubY} L${x + wb},${y + 30} Z`} fill={C.white} />
      <path d={`M${x},${y + 30} L${x},${hubY} L${x + wt},${hubY} L${x + wb},${y + 30} Z`} fill={C.mist} />
      {/* rumah generator */}
      <rect x={x - hub * 0.9} y={hubY - hub * 0.75} width={hub * 2.6} height={hub * 1.5} rx={hub * 0.6} fill={C.mist} />
      {/* baling-baling */}
      <g transform={`translate(${x} ${hubY}) rotate(${rot.toFixed(3)})`}>
        {[0, 120, 240].map((a) => (
          <g key={a} transform={`rotate(${a})`}>
            <path d={bladeSeg(blade, 0, 1)} fill={C.white} />
            <path d={bladeSeg(blade, 0, 1, 'right')} fill={C.mist} />
            <path d={bladeSeg(blade, 0.82, 0.9)} fill={C.coral} />
            <path d={bladeSeg(blade, 0.82, 0.9, 'right')} fill={shade(C.coral, -0.14)} />
          </g>
        ))}
      </g>
      <circle cx={x} cy={hubY} r={hub} fill={C.white} />
      <circle cx={x} cy={hubY} r={hub * 0.5} fill={C.mist} />
    </g>
  );
};

const Tree: React.FC<{x: number; y: number; r: number; sway: number; col: string}> = ({x, y, r, sway, col}) => (
  <g>
    <rect x={x - r * 0.14} y={y - r * 1.1} width={r * 0.28} height={r * 1.2} rx={r * 0.12} fill={shade(C.brown, -0.1)} />
    <g transform={`translate(${x} ${y - r * 0.9}) rotate(${sway}) translate(${-x} ${-(y - r * 0.9)})`}>
      <circle cx={x} cy={y - r * 1.75} r={r} fill={col} />
      <path d={`M${x},${y - r * 2.75} A${r},${r} 0 0 1 ${x},${y - r * 0.75} Z`} fill={shade(col, -0.14)} />
      <circle cx={x - r * 0.38} cy={y - r * 2.12} r={r * 0.2} fill={shade(col, 0.4)} />
    </g>
  </g>
);

const Cloud: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-80} y={-18} width={160} height={44} rx={22} fill={C.mist} />
    <circle cx={-30} cy={-12} r={36} fill={C.white} />
    <circle cx={26} cy={-24} r={44} fill={C.white} />
    <rect x={-80} y={-26} width={160} height={44} rx={22} fill={C.white} />
  </g>
);

// garis angin: lengkung yang dilintasi segmen terang
const WINDS = [
  {d: 'M640,430 C710,400 770,452 846,426 S962,388 1016,410', len: 400, y: 0, k: 2, o: 0},
  {d: 'M990,566 C1050,536 1112,586 1182,556 S1276,524 1312,540', len: 345, y: 0, k: 2, o: 0.5},
  {d: 'M604,640 C664,614 716,662 790,636', len: 200, y: 0, k: 3, o: 0.25},
];

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  const frontTop = domePath(FRONT.cx, FRONT.hw - 10, FRONT.h, BASE - 24);
  return (
    <g>
      <Shadow cx={970} cy={884} rx={520} ry={30} vector={vector} />
      {/* cakram langit di belakang pemandangan */}
      <circle cx={SKY.cx} cy={SKY.cy} r={SKY.r} fill={shade(C.sky, 0.42)} />
      <circle cx={SKY.cx} cy={SKY.cy} r={SKY.r * 0.72} fill={shade(C.sky, 0.5)} />
      {/* awan hanyut (di belakang) */}
      {[
        {o: 0.0, y: 236, s: 0.85, x0: 700, x1: 1230},
        {o: 0.5, y: 172, s: 0.6, x0: 800, x1: 1130},
      ].map((c, i) => {
        const t = mod(p + c.o, 1);
        const x = mix(c.x0, c.x1, t);
        const f = Math.min(1, Math.sin(Math.PI * t) * 3);
        if (vector) return t > 0.15 && t < 0.85 ? <Cloud key={i} x={x} y={c.y} s={c.s} /> : null;
        return (
          <g key={i} opacity={f}>
            <Cloud x={x} y={c.y + 6 * wave(p, 2, c.o)} s={c.s} />
          </g>
        );
      })}
      {/* bukit belakang + turbin belakang */}
      <Turbine x={TURBINES[0].x} y={TURBINES[0].y} h={TURBINES[0].h} blade={TURBINES[0].blade} rot={360 * TURBINES[0].k * p + 360 * TURBINES[0].ph} />
      <path d={domePath(BACK.cx, BACK.hw, BACK.h)} fill={shade(C.green, -0.2)} />
      <path d={domePath(BACK.cx, BACK.hw - 10, BACK.h, BASE - 24)} fill={blend(C.green, C.lime, 0.45)} />
      <path d={ridge(backY, 1000, 1120, 22)} fill="none" stroke={shade(blend(C.green, C.lime, 0.45), 0.42)} strokeWidth={12} strokeLinecap="round" />
      <Tree x={1420} y={backY(1420) + 6} r={34} sway={3 * wave(p, 2, 0.3)} col={C.teal} />
      {/* turbin depan */}
      {TURBINES.slice(1).map((t, i) => (
        <Turbine key={i} x={t.x} y={t.y} h={t.h} blade={t.blade} rot={360 * t.k * p + 360 * t.ph} />
      ))}
      {/* bukit depan */}
      <path d={domePath(FRONT.cx, FRONT.hw, FRONT.h)} fill={shade(C.green, -0.2)} />
      <path d={frontTop} fill={C.green} />
      <path d={ridge(frontY, 520, 700, 22)} fill="none" stroke={shade(C.green, 0.4)} strokeWidth={12} strokeLinecap="round" />
      <Tree x={1010} y={frontY(1010) + 8} r={40} sway={3 * wave(p, 2)} col={C.teal} />
      <Tree x={1080} y={frontY(1080) + 10} r={28} sway={3 * wave(p, 2, 0.15)} col={shade(C.teal, 0.15)} />
      {/* garis angin */}
      {WINDS.map((w, i) => {
        const t = mod(p * w.k + w.o, 1);
        const dash = w.len * 0.32;
        const off = mix(dash, -w.len, t);
        const f = Math.sin(Math.PI * t);
        if (vector) {
          return (
            <path key={i} d={w.d} fill="none" stroke={C.white} strokeWidth={10} strokeLinecap="round" strokeDasharray={`${dash} ${w.len * 2}`} strokeDashoffset={-w.len * 0.3} />
          );
        }
        return (
          <path
            key={i}
            d={w.d}
            fill="none"
            stroke={C.white}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={`${dash.toFixed(1)} ${(w.len * 2).toFixed(1)}`}
            strokeDashoffset={off.toFixed(1)}
            opacity={Math.min(1, f * 2.2)}
          />
        );
      })}
      {/* daun kecil terbawa angin */}
      {[0, 1].map((i) => {
        const t = mod(p * 2 + i * 0.5 + 0.15, 1);
        const x = mix(640, 1300, t);
        const y = 470 + i * 130 + 40 * Math.sin(TAU * t * 1.5);
        const f = Math.sin(Math.PI * t);
        if (vector) return null;
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${360 * t * 2})`} opacity={Math.min(1, f * 3)}>
            <path d="M-14,0 Q0,-12 14,0 Q0,12 -14,0 Z" fill={C.lime} />
          </g>
        );
      })}
    </g>
  );
};
