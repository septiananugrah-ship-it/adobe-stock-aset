// Jam pasir berpasir emas: pasir mengalir membentuk gundukan sementara koin jatuh menumpuk di sampingnya (time is money);
// lalu jam pasir diangkat & dibalik 180°, pasir merosot ke leher dan langsung mengalir lagi (loop mulus, bentuk simetris titik).
import React from 'react';
import {clamp, inOut, mix, outBack, pop, seg, wave01, yoyo} from '../../kit/loop';
import {C, blend, shade} from '../../kit/palette';
import {Shadow, Sparkle} from '../../kit/shapes';
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

const X = 880;
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

/** Koin tampak samping (tumpukan). */
const FlatCoin: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s.toFixed(4)}) translate(${-x} ${-y})`}>
    <rect x={x - 62} y={y - 9} width={124} height={22} fill={shade(C.yellow, -0.22)} />
    <ellipse cx={x} cy={y + 13} rx={62} ry={19} fill={shade(C.yellow, -0.22)} />
    <ellipse cx={x} cy={y - 9} rx={62} ry={19} fill={C.yellow} />
    <ellipse cx={x} cy={y - 9} rx={44} ry={12} fill={shade(C.yellow, -0.12)} />
    <rect x={x - 46} y={y + 4} width={11} height={20} rx={5.5} fill={shade(C.yellow, 0.25)} />
  </g>
);

const SX = X + 330; // tumpukan koin
const FLOOR = 856; // dasar tutup bawah
const COIN_T = 30;
const stackY = (k: number) => FLOOR - 32 - k * COIN_T;
const DROPS = [0.1, 0.31, 0.52]; // koin muncul di atas tumpukan
const FLOW1 = 0.7; // pasir habis

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  // pasir mengalir 0 → FLOW1, gundukan merata, lalu diangkat & dibalik (sedikit lewat lalu kembali)
  const flowT = seg(p, 0, FLOW1, (t) => 0.85 * t + 0.15 * inOut(t));
  const settle = seg(p, FLOW1 + 0.01, 0.77, inOut);
  const lift = -38 * yoyo(p, 0.77, 0.83, 0.925, 0.99, inOut, inOut);
  const u = seg(p, 0.905, 0.975);
  const rot = 180 * seg(p, 0.805, 0.925, inOut) + 9 * Math.sin(Math.PI * u) * (1 - u);
  const morph = seg(p, 0.872, 0.985, (t) => t * t); // pasir merosot (dipercepat gravitasi) ke leher setelah terbalik
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
  const dip = 14 * clamp(top / (0.1 * SAND)) * (1 - seg(p, FLOW1 - 0.03, FLOW1 + 0.01));
  // aliran: kepala jatuh dari leher di awal, ekor jatuh di akhir
  const yBot = NY + (DM - Lb) - peak + 4;
  const head = seg(p, 0, 0.028, (t) => t * t);
  const tail = seg(p, FLOW1 - 0.012, FLOW1 + 0.016, (t) => t * t);
  const sTop = mix(NY - 4, yBot, tail);
  const sBot = mix(NY - 4, yBot, head);
  const streamOn = p < FLOW1 + 0.016 && sBot - sTop > 3;
  const glass = blend(C.sky, C.white, 0.62);
  const wood = C.brown;
  return (
    <g>
      <Shadow cx={X} cy={FLOOR + 30} rx={230} ry={24} s={1 + lift / 300} vector={vector} />
      <Shadow cx={SX} cy={FLOOR + 30} rx={110} ry={18} vector={vector} />
      {/* tumpukan koin: 1 koin dasar + 3 koin jatuh selama pasir mengalir, hilang bertingkat saat dibalik */}
      <FlatCoin x={SX} y={stackY(0)} />
      {DROPS.map((t0, i) => {
        const appear = seg(p, t0, t0 + 0.035, (t) => outBack(t, 2));
        const fall = seg(p, t0 + 0.045, t0 + 0.105, (t) => t * t);
        const land = t0 + 0.105;
        const gone = seg(p, 0.8 + (2 - i) * 0.035, 0.86 + (2 - i) * 0.035, inOut);
        const s = appear * (1 - gone) * (p >= land ? pop(p, land, 0.07, 0.1) : 1);
        if (s < 0.01) return null;
        const y = mix(stackY(i + 1) - 300, stackY(i + 1), fall);
        return <FlatCoin key={i} x={SX} y={y} s={s} />;
      })}
      <g transform={`translate(0 ${lift.toFixed(2)}) rotate(${rot.toFixed(3)} ${X} ${NY})`}>
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
        {streamOn ? (
          <g>
            <rect x={X - 4.5} y={sTop} width={9} height={sBot - sTop} rx={4.5} fill={SAND_C} />
            {Array.from({length: 6}, (_, i) => {
              const v = (p * 24 + i / 6) % 1;
              const y = mix(NY - 4, yBot, v);
              if (y < sTop || y > sBot) return null;
              const r = 6 * Math.sin(Math.PI * v);
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
      {/* kilau di atas tumpukan tiap koin mendarat */}
      {DROPS.map((t0, i) => {
        const k = yoyo(p, t0 + 0.105, t0 + 0.13, t0 + 0.15, t0 + 0.2, (t) => outBack(t, 2));
        return k > 0.01 ? <Sparkle key={`k${i}`} x={SX + 92} y={stackY(i + 1) - 44} r={20 * k} color={C.yellow} rot={15} /> : null;
      })}
      <Sparkle x={X - 290} y={330} r={22 * (0.7 + 0.3 * wave01(p, 3))} color={C.yellow} rot={15} />
      <Sparkle x={X - 250} y={250} r={11 * (0.6 + 0.4 * wave01(p, 3, 0.4))} color={C.sky} />
      <Sparkle x={X - 300} y={730} r={14 * (0.6 + 0.4 * wave01(p, 2, 0.2))} color={C.yellow} />
    </g>
  );
};
