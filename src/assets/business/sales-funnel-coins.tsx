// Corong penjualan: bola-bola prospek jatuh ke mulut corong, lalu koin emas keluar dari ujung dan menumpuk (konversi).
import React from 'react';
import {inOut, outBack, pop, rng, seg, wave, wave01, yoyo} from '../../kit/loop';
import {C, shade} from '../../kit/palette';
import {Shadow, Sparkle} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'business-sales-funnel-coins',
  theme: 'business',
  title: 'Sales funnel filtering colorful leads into gold coins stacking below, marketing conversion animation, seamless loop with alpha channel',
  keywords: [
    'sales funnel', 'funnel', 'conversion', 'marketing funnel', 'leads', 'lead generation', 'coins', 'revenue', 'sales',
    'customer journey', 'conversion rate', 'pipeline', 'business process', 'filter', 'digital marketing', 'strategy', 'profit',
    'roi', 'growth', 'ecommerce', 'analytics', 'acquisition', 'money', 'gold coin', 'icon', 'flat design', 'illustration',
    'infographic', 'presentation', 'explainer', 'social media', 'animation', 'motion graphics', 'seamless loop', 'looped',
    'alpha channel', 'transparent background', 'isolated', '4k', 'business',
  ],
  category: 3,
  seconds: 8,
  vectorP: 0.62,
};

const X = 960;
const RIM_Y = 290;
const RIM = {rx: 330, ry: 62};
// tingkat corong: [y atas, setengah lebar atas, y bawah, setengah lebar bawah, warna]
const TIERS: [number, number, number, number, string][] = [
  [RIM_Y, 330, 410, 246, C.blue],
  [422, 240, 530, 168, C.sky],
  [542, 162, 640, 64, C.teal],
];
const SPOUT = {y0: 640, y1: 706, w: 54};
const FLOOR = 890;
const BASE_COINS = 1;
const OUT = [0.34, 0.5, 0.66]; // koin keluar
const COIN_T = 30; // tebal koin
const K = 0.19; // rasio ry/rx tepi elips

/** Titik-titik tepi depan elips (setengah bawah) dari x = a ke x = b (dalam satuan setengah lebar, −1..1). */
const front = (cy: number, rx: number, a: number, b: number, ry = rx * K, n = 24) =>
  Array.from({length: n + 1}, (_, i) => {
    const u = a + ((b - a) * i) / n;
    return [X + u * rx, cy + ry * Math.sqrt(Math.max(0, 1 - u * u))] as [number, number];
  });
const poly = (pts: [number, number][]) => 'M' + pts.map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(' L') + ' Z';
/** Badan tingkat (tepi atas & bawah melengkung) untuk rentang horizontal a..b. */
const tierPath = (t: (typeof TIERS)[number], a = -1, b = 1, ry0?: number) => {
  const [y0, w0, y1, w1] = t;
  return poly([...front(y0, w0, a, b, ry0), ...front(y1, w1, b, a)]);
};

const BALLS = (() => {
  const r = rng(11);
  const cols = [C.coral, C.violet, C.pink, C.purple];
  return Array.from({length: 12}, (_, i) => ({t0: 0.03 + i * 0.05, x: (i % 2 ? 1 : -1) * (40 + r() * 170), col: cols[i % 4], r: 30 + r() * 8}));
})();

const FlatCoin: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`}>
    <rect x={x - 62} y={y - 9} width={124} height={22} fill={shade(C.yellow, -0.22)} />
    <ellipse cx={x} cy={y + 13} rx={62} ry={19} fill={shade(C.yellow, -0.22)} />
    <ellipse cx={x} cy={y - 9} rx={62} ry={19} fill={C.yellow} />
    <ellipse cx={x} cy={y - 9} rx={44} ry={12} fill={shade(C.yellow, -0.12)} />
    <rect x={x - 46} y={y + 4} width={11} height={20} rx={5.5} fill={shade(C.yellow, 0.25)} />
  </g>
);

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  const breath = 1 + 0.01 * wave(p, 4);
  // jumlah koin tambahan yang sudah mendarat & hilangnya di akhir
  const stackTop = (n: number) => FLOOR - 26 - n * COIN_T;
  const landed = OUT.map((t0) => p >= t0 + 0.09);
  const gone = OUT.map((_, i) => seg(p, 0.86 + (2 - i) * 0.025, 0.92 + (2 - i) * 0.025, inOut));
  const squashF = OUT.reduce((a, t0) => a * pop(p, t0 + 0.09, 0.06, 0.06), 1);
  const funnelPulse = OUT.reduce((a, t0) => a * pop(p, t0 - 0.02, 0.08, 0.035), 1);
  return (
    <g>
      <Shadow cx={X} cy={FLOOR + 30} rx={200} ry={22} vector={vector} />
      {/* tumpukan koin */}
      {Array.from({length: BASE_COINS}, (_, k) => (
        <FlatCoin key={`b${k}`} x={X} y={stackTop(k)} />
      ))}
      {OUT.map((t0, i) => {
        // koin keluar dari ujung corong, jatuh ke tumpukan
        const f = seg(p, t0, t0 + 0.09, (t) => t * t);
        if (f <= 0) return null;
        const yEnd = stackTop(BASE_COINS + i);
        const y = SPOUT.y1 - 30 + (yEnd - (SPOUT.y1 - 30)) * f;
        const s = (1 - gone[i]) * (landed[i] ? squashF : 1);
        if (s < 0.01) return null;
        return <FlatCoin key={`o${i}`} x={X} y={y} s={landed[i] ? s : 0.8 + 0.2 * Math.min(1, f * 3)} />;
      })}
      <g transform={`translate(${X} ${RIM_Y}) scale(${breath / funnelPulse ** 0.4} ${breath * funnelPulse}) translate(${-X} ${-RIM_Y})`}>
        {/* ujung corong (menutupi koin yang belum keluar) */}
        <path d={poly([...front(SPOUT.y1, SPOUT.w, -1, 1), [X + SPOUT.w, SPOUT.y0 - 10], [X - SPOUT.w, SPOUT.y0 - 10]])} fill={shade(C.teal, -0.1)} />
        <path d={poly([...front(SPOUT.y1, SPOUT.w, 0.4, 1), [X + SPOUT.w, SPOUT.y0 - 10], [X + SPOUT.w * 0.4, SPOUT.y0 - 10]])} fill={shade(C.teal, -0.26)} />
        <path d={poly([...front(SPOUT.y1, SPOUT.w, -0.8, -0.6), [X - SPOUT.w * 0.6, SPOUT.y0 - 10], [X - SPOUT.w * 0.8, SPOUT.y0 - 10]])} fill={shade(C.teal, 0.3)} />
        {/* bibir belakang & mulut */}
        <ellipse cx={X} cy={RIM_Y} rx={RIM.rx} ry={RIM.ry} fill={shade(C.blue, 0.25)} />
        <ellipse cx={X} cy={RIM_Y + 4} rx={RIM.rx - 30} ry={RIM.ry - 14} fill={shade(C.blue, -0.5)} />
        {/* bola prospek masuk */}
        {BALLS.map((b, i) => {
          const appear = seg(p, b.t0, b.t0 + 0.035, (t) => outBack(t, 2.2));
          const f = seg(p, b.t0 + 0.04, b.t0 + 0.12, (t) => t * t);
          if (appear <= 0.01 || f >= 1) return null;
          const y = 140 + (RIM_Y + 110 - 140) * f;
          return (
            <g key={i} transform={`translate(${X + b.x * (1 - 0.35 * f)} ${y}) scale(${appear})`}>
              <circle r={b.r} fill={b.col} />
              <circle cx={b.r * 0.22} cy={b.r * 0.2} r={b.r * 0.72} fill={shade(b.col, -0.12)} />
              <circle cx={-b.r * 0.08} cy={-b.r * 0.06} r={b.r * 0.72} fill={b.col} />
              <circle cx={-b.r * 0.35} cy={-b.r * 0.38} r={b.r * 0.2} fill={shade(b.col, 0.5)} />
            </g>
          );
        })}
        {/* bibir depan (setengah cincin bawah) */}
        <path d={poly([...front(RIM_Y, RIM.rx, -1, 1, RIM.ry), ...front(RIM_Y + 4, RIM.rx - 30, 1, -1, RIM.ry - 14)])} fill={shade(C.blue, 0.25)} />
        {/* tingkat */}
        {TIERS.map((t, i) => {
          const col = t[4];
          const [y0, w0, y1, w1] = t;
          const ry0 = i === 0 ? RIM.ry : undefined;
          const wb = w1 + (w0 - w1) * (14 / (y1 - y0));
          return (
            <g key={i}>
              <path d={tierPath(t, -1, 1, ry0)} fill={col} />
              <path d={tierPath(t, 0.4, 1, ry0)} fill={shade(col, -0.16)} />
              <path d={tierPath(t, -0.82, -0.7, ry0)} fill={shade(col, 0.35)} />
              {/* pita tepi bawah */}
              <path d={poly([...front(y1 - 14, wb, -1, 1), ...front(y1, w1, 1, -1)])} fill={shade(col, -0.28)} />
            </g>
          );
        })}
      </g>
      {/* kilau saat koin keluar */}
      {OUT.map((t0, i) => {
        const k = yoyo(p, t0 + 0.06, t0 + 0.1, t0 + 0.14, t0 + 0.2, (t) => outBack(t, 2));
        if (k <= 0.01) return null;
        const side = i % 2 ? 1 : -1;
        return (
          <g key={`s${i}`}>
            <Sparkle x={X + side * 130} y={stackTop(BASE_COINS + i) - 30} r={24 * k} color={C.yellow} rot={15} />
            <Sparkle x={X - side * 110} y={stackTop(BASE_COINS + i) - 70} r={13 * k} color={C.yellow} />
          </g>
        );
      })}
      <Sparkle x={X + 400} y={RIM_Y - 90} r={18 * (0.6 + 0.4 * wave01(p, 2))} color={C.sky} rot={10} />
      <Sparkle x={X - 410} y={RIM_Y + 40} r={14 * (0.6 + 0.4 * wave01(p, 2, 0.5))} color={C.yellow} />
    </g>
  );
};
