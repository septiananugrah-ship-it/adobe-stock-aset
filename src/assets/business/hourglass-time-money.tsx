// Jam pasir berpasir emas: pasir mengalir ke bawah membentuk gundukan, lalu jam pasir dibalik 180° (loop mulus, bentuk simetris titik).
import React from 'react';
import {TAU, clamp, inOut, mix, outBack, seg, wave, wave01, yoyo} from '../../kit/loop';
import {C, blend, shade} from '../../kit/palette';
import {Shadow, Sparkle, roundedPath, starPts} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'business-hourglass-time-money',
  theme: 'business',
  title: 'Hourglass with flowing golden sand flipping over, time is money and deadline concept, seamless loop animation with alpha channel',
  keywords: [
    'hourglass', 'time is money', 'deadline', 'time management', 'sand clock', 'timer', 'waiting', 'golden sand', 'time',
    'countdown', 'productivity', 'schedule', 'planning', 'patience', 'investment', 'business', 'finance', 'efficiency',
    'urgency', 'project management', 'coins', 'money', 'hour', 'gold', 'icon', 'flat design', 'illustration',
    'presentation', 'explainer', 'social media', 'animation', 'motion graphics', 'seamless loop', 'looped', 'alpha channel',
    'transparent background', 'isolated', '4k',
  ],
  category: 3,
  seconds: 8,
  vectorP: 0.42,
};

const X = 960;
const NY = 540; // leher
const DM = 268; // jarak leher → tutup
const INSET = 9; // tebal kaca
/** setengah lebar rongga kaca pada jarak d dari leher */
const gw = (d: number) => {
  if (d < 205) return 15 + 117 * Math.pow(Math.sin((Math.PI / 2) * (d / 205)), 0.85);
  const t = (d - 205) / (DM - 205);
  return 132 - 22 * t * t;
};
// tabel luas kumulatif dari leher (pasir di dalam: lebar − inset)
const STEP = 1;
const sw = (d: number) => Math.max(0, gw(d) - INSET);
const CUM: number[] = [0];
for (let d = STEP; d <= DM; d += STEP) CUM.push(CUM[CUM.length - 1] + 2 * sw(d) * STEP);
const TOTAL = CUM[CUM.length - 1];
const SAND = 0.46 * TOTAL;
/** jarak dari leher yang memberi luas a (diisi dari leher) */
const levelFromNeck = (a: number) => {
  let i = 0;
  while (i < CUM.length - 1 && CUM[i + 1] < a) i++;
  return i * STEP;
};
/** jarak dari tutup (diisi dari tutup) yang memberi luas a */
const levelFromCap = (a: number) => {
  let i = CUM.length - 1;
  while (i > 0 && TOTAL - CUM[i - 1] < a) i--;
  return DM - i * STEP;
};

/** Poligon pasir di bulb (dir = −1 atas, +1 bawah) antara jarak d0 dan d1 dari leher; puncak/lekuk di permukaan. */
const sandPath = (dir: number, d0: number, d1: number, peak: number, dip: number) => {
  if (d1 - d0 < 1) return '';
  const n = 40;
  const right: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const d = d0 + ((d1 - d0) * i) / n;
    right.push([X + sw(d), NY + dir * d]);
  }
  // permukaan bebas: bulb atas di sisi tutup (d1), bulb bawah di sisi leher (d0)
  const surfAt = dir < 0 ? d1 : d0;
  const wS = sw(surfAt);
  const ys = NY + dir * surfAt;
  const left = right.map(([x, y]) => [2 * X - x, y] as [number, number]).reverse(); // d1 → d0
  const curve: [number, number][] = []; // kanan → kiri
  for (let i = 1; i < 20; i++) {
    const u = i / 20;
    const c = 1 - Math.abs(1 - 2 * u);
    curve.push([X + wS * (1 - 2 * u), ys - peak * Math.pow(c, 1.6) + dip * Math.pow(Math.sin(Math.PI * u), 2)]);
  }
  const all = dir < 0 ? [...right, ...curve, ...left] : [...curve.reverse(), ...right, ...left];
  return 'M' + all.map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(' L') + ' Z';
};

const glassPath = (() => {
  const n = 60;
  const side: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const d = -DM + (2 * DM * i) / n;
    side.push([X + gw(Math.abs(d)), NY + d]);
  }
  const left = side.map(([x, y]) => [2 * X - x, y] as [number, number]).reverse();
  return 'M' + [...side, ...left].map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(' L') + ' Z';
})();

const Coin: React.FC<{x: number; y: number; r: number; sx: number}> = ({x, y, r, sx}) => {
  const s = Math.max(0.08, Math.abs(sx));
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={(1 - s) * 9 * Math.sign(sx || 1)} rx={r * s + (1 - s) * 5} ry={r} fill={shade(C.yellow, -0.28)} />
      <g transform={`scale(${s} 1)`}>
        <circle r={r} fill={C.yellow} />
        <circle r={r * 0.74} fill={shade(C.yellow, -0.12)} />
        <path d={roundedPath(starPts(0, 2, r * 0.46, r * 0.2, 5), 3)} fill={shade(C.yellow, 0.35)} />
      </g>
    </g>
  );
};

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  const flowT = seg(p, 0.06, 0.74, (t) => 0.8 * t + 0.2 * inOut(t));
  const flowing = p > 0.06 && p < 0.745;
  const flip = seg(p, 0.8, 0.94, (t) => outBack(t, 1.3));
  const morph = seg(p, 0.828, 0.885, (t) => t * t);
  const lift = -34 * yoyo(p, 0.78, 0.84, 0.88, 0.95, inOut, inOut);
  const settle = seg(p, 0.72, 0.8, inOut);
  const top = SAND * (1 - flowT);
  const bot = SAND * flowT;
  const SAND_C = C.yellow;
  const SAND_D = shade(C.yellow, -0.16);
  // bulb atas: diisi dari leher sampai Lt
  const Lt = levelFromNeck(top);
  // bulb bawah: dari tutup setinggi Lb; saat dibalik → pindah ke sisi leher
  const Lb = levelFromCap(bot);
  const L0 = levelFromNeck(SAND);
  const bd0 = mix(DM - Lb, 0, morph);
  const bd1 = mix(DM, L0, morph);
  const peak = 30 * clamp(bot / (0.08 * SAND)) * (1 - settle);
  const dip = 14 * clamp(top / (0.1 * SAND)) * (flowing ? 1 : 0) * clamp(flowT * 30);
  // aliran
  const streamTop = NY - 4;
  const streamBot = NY + (DM - Lb) - peak + 4;
  const streamK = seg(p, 0.06, 0.09) * (1 - seg(p, 0.72, 0.745));
  const glass = blend(C.sky, C.white, 0.62);
  const wood = C.brown;
  return (
    <g>
      <Shadow cx={X} cy={890} rx={230} ry={24} s={1 + lift / 300} vector={vector} />
      {/* koin melayang di kiri-kanan */}
      <Coin x={X - 330} y={430 + 16 * wave(p, 2)} r={46} sx={Math.cos(TAU * p)} />
      <Coin x={X + 330} y={640 + 16 * wave(p, 2, 0.5)} r={38} sx={Math.cos(TAU * (p + 0.5))} />
      <g transform={`translate(0 ${lift.toFixed(2)}) rotate(${(180 * flip).toFixed(3)} ${X} ${NY})`}>
        {/* tiang (bayangan di sisi luar → simetris titik) */}
        {[-1, 1].map((s) => (
          <g key={s}>
            <rect x={X + s * 168 - 15} y={NY - DM} width={30} height={2 * DM} rx={15} fill={shade(wood, -0.08)} />
            <rect x={X + s * 168 + (s > 0 ? 3 : -15)} y={NY - DM} width={12} height={2 * DM} rx={6} fill={shade(wood, -0.28)} />
          </g>
        ))}
        {/* kaca */}
        <path d={glassPath} fill={glass} />
        {/* pasir atas */}
        {Lt > 1 ? <path d={sandPath(-1, 0, Lt, 0, dip)} fill={SAND_C} /> : null}
        {Lt > 1 ? <path d={sandPath(-1, 0, Math.min(Lt, 30), 0, 0)} fill={SAND_D} /> : null}
        {/* pasir bawah */}
        {bd1 - bd0 > 1 ? <path d={sandPath(1, bd0, bd1, morph > 0 ? peak * (1 - morph) : peak, 0)} fill={SAND_C} /> : null}
        {/* aliran pasir */}
        {streamK > 0.01 && streamBot > streamTop + 4 ? (
          <g>
            <rect x={X - 4.5 * streamK} y={streamTop} width={9 * streamK} height={streamBot - streamTop} rx={4} fill={SAND_C} />
            {Array.from({length: 6}, (_, i) => {
              const u = (p * 24 + i / 6) % 1;
              const y = streamTop + (streamBot - streamTop) * u;
              const r = 6 * streamK * Math.sin(Math.PI * u);
              return r > 1 ? <circle key={i} cx={X + (i % 2 ? 3 : -3)} cy={y} r={r} fill={SAND_D} /> : null;
            })}
          </g>
        ) : null}
        {/* kilau kaca (simetris titik) */}
        <path d={`M${X - 104},${NY - 196} C${X - 112},${NY - 150} ${X - 98},${NY - 100} ${X - 64},${NY - 58}`} fill="none" stroke={C.white} strokeWidth={12} strokeLinecap="round" />
        <path d={`M${X + 104},${NY + 196} C${X + 112},${NY + 150} ${X + 98},${NY + 100} ${X + 64},${NY + 58}`} fill="none" stroke={C.white} strokeWidth={12} strokeLinecap="round" />
        <circle cx={X - 108} cy={NY - 226} r={7} fill={C.white} />
        <circle cx={X + 108} cy={NY + 226} r={7} fill={C.white} />
        {/* tutup atas & bawah */}
        {[-1, 1].map((s) => {
          const y = NY + s * (DM + 22);
          return (
            <g key={`c${s}`}>
              <rect x={X - 196} y={y - 24} width={392} height={48} rx={18} fill={wood} />
              <rect x={X - 196} y={y + (s > 0 ? 8 : -24)} width={392} height={16} rx={8} fill={shade(wood, -0.22)} />
              <rect x={X - 170} y={y - 4} width={340} height={8} rx={4} fill={shade(wood, 0.3)} />
            </g>
          );
        })}
      </g>
      <Sparkle x={X + 260} y={300} r={22 * (0.7 + 0.3 * wave01(p, 3))} color={C.yellow} rot={15} />
      <Sparkle x={X - 280} y={720} r={14 * (0.6 + 0.4 * wave01(p, 3, 0.4))} color={C.yellow} />
      <Sparkle x={X + 230} y={800} r={12 * (0.6 + 0.4 * wave01(p, 2, 0.2))} color={C.sky} />
    </g>
  );
};
