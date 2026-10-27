// Gedung bank klasik tersusun: tiang naik bertingkat, atap segitiga turun dan mendarat,
// lalu koin emas besar muncul dan berputar di atas atap sebelum semuanya kembali.
import React from 'react';
import {TAU, clamp, inOut, outBack, pop, seg, wave, wave01, yoyo} from '../../kit/loop';
import {C, blend, shade} from '../../kit/palette';
import {Shadow, Sparkle, roundedPath, starPts} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'business-bank-building-coin',
  theme: 'business',
  title: 'Classical bank building assembling with columns and roof, gold coin spinning above, banking and finance concept, seamless loop with alpha channel',
  keywords: [
    'bank', 'bank building', 'banking', 'finance', 'gold coin', 'coin', 'money', 'investment', 'savings', 'deposit',
    'financial institution', 'columns', 'architecture', 'economy', 'loan', 'credit', 'payment', 'treasury', 'wealth', 'capital',
    'business', 'account', 'interest', 'secure', 'trust', 'government', 'building', 'icon', 'flat design', 'illustration',
    'presentation', 'explainer', 'social media', 'animation', 'motion graphics', 'seamless loop', 'looped', 'alpha channel',
    'transparent background', 'isolated', '4k',
  ],
  category: 3,
  seconds: 8,
  vectorP: 0.73,
};

const X = 960;
const ROOF = C.blue;
const COL = blend(C.cloud, C.steel, 0.1);
const COL_D = blend(C.mist, C.steel, 0.25);
const STEP = C.mist;
const COLS = [-200, -100, 0, 100, 200];
const COL_TOP = 470;
const COL_BOT = 700;
const COIN = {y: 178, r: 68};
const Y = C.yellow;

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  const n = COLS.length;
  const rise = COLS.map((_, i) => yoyo(p, 0.05 + i * 0.03, 0.17 + i * 0.03, 0.84 + (n - 1 - i) * 0.02, 0.92 + (n - 1 - i) * 0.02, (t) => outBack(t, 1.4), inOut));
  const roofK = yoyo(p, 0.23, 0.33, 0.79, 0.85, inOut, inOut);
  const land = 2 - pop(p, 0.33, 0.1, 0.05); // tiang sedikit tertekan saat atap mendarat
  const coinK = yoyo(p, 0.35, 0.43, 0.745, 0.8, (t) => outBack(t, 2.2), inOut);
  const spinT = seg(p, 0.42, 0.72, inOut);
  const spin = Math.cos(TAU * 2 * spinT);
  const bob = 8 * wave(p, 2);
  const shine = yoyo(p, 0.45, 0.5, 0.5, 0.58) + yoyo(p, 0.62, 0.67, 0.67, 0.74);
  const roofY = -150 * (1 - roofK) + (COL_BOT - COL_TOP) * (1 - land);
  const roofO = clamp(roofK * 4);
  const lightOn = seg(p, 0.36, 0.42) * (1 - seg(p, 0.76, 0.8));

  // koin depan (lebar semu = |spin|)
  const s = Math.max(0.06, Math.abs(spin));
  const edge = (1 - s) * 16 * (spin >= 0 ? 1 : -1);
  return (
    <g>
      <Shadow cx={X} cy={850} rx={400} ry={28} vector={vector} />
      {/* anak tangga (selalu ada) */}
      <rect x={X - 330} y={790} width={660} height={44} rx={12} fill={shade(STEP, -0.12)} />
      <rect x={X - 330} y={790} width={660} height={30} rx={12} fill={STEP} />
      <rect x={X - 300} y={758} width={600} height={40} rx={10} fill={shade(STEP, -0.06)} />
      <rect x={X - 300} y={758} width={600} height={26} rx={10} fill={blend(STEP, C.cloud, 0.5)} />
      <rect x={X - 270} y={COL_BOT} width={540} height={66} rx={10} fill={blend(C.cloud, C.mist, 0.3)} />
      <rect x={X - 270} y={COL_BOT + 44} width={540} height={22} rx={10} fill={shade(C.cloud, -0.1)} />
      <rect x={X - 250} y={COL_BOT + 12} width={140} height={10} rx={5} fill={C.white} />
      {/* tiang */}
      {COLS.map((dx, i) => {
        const k = rise[i] * land;
        if (k <= 0.01) return null;
        const h = (COL_BOT - COL_TOP) * k;
        const x = X + dx;
        const top = COL_BOT - h;
        return (
          <g key={i}>
            <rect x={x - 28} y={top} width={56} height={h} fill={COL} />
            <rect x={x + 6} y={top} width={22} height={h} fill={COL_D} />
            {h > 40 ? <rect x={x - 18} y={top + 18} width={8} height={h - 36} rx={4} fill={C.white} /> : null}
            {h > 40 ? <rect x={x - 3} y={top + 18} width={6} height={h - 36} rx={3} fill={shade(COL, -0.06)} /> : null}
            <rect x={x - 40} y={top - 6} width={80} height={22} rx={7} fill={shade(COL_D, -0.05)} />
            <rect x={x - 40} y={top - 6} width={80} height={12} rx={6} fill={COL} />
            <rect x={x - 38} y={COL_BOT - 18} width={76} height={18} rx={6} fill={shade(COL_D, -0.05)} />
          </g>
        );
      })}
      {/* atap: balok + segitiga */}
      {roofO > 0.01 ? (
        <g transform={`translate(0 ${roofY.toFixed(2)})`} opacity={roofO >= 1 ? undefined : roofO}>
          <path d={roundedPath([[X - 300, COL_TOP - 56], [X, COL_TOP - 200], [X + 300, COL_TOP - 56]], 18)} fill={ROOF} />
          <path d={roundedPath([[X - 200, COL_TOP - 72], [X, COL_TOP - 168], [X + 200, COL_TOP - 72]], 10)} fill={shade(ROOF, -0.2)} />
          <circle cx={X} cy={COL_TOP - 110} r={24} fill={blend(shade(ROOF, -0.2), Y, lightOn)} />
          <circle cx={X} cy={COL_TOP - 110} r={12} fill={blend(shade(ROOF, -0.32), shade(Y, -0.15), lightOn)} />
          <path d={`M${X - 268},${COL_TOP - 74} L${X - 50},${COL_TOP - 176}`} stroke={shade(ROOF, 0.38)} strokeWidth={10} strokeLinecap="round" />
          <rect x={X - 322} y={COL_TOP - 70} width={644} height={24} rx={12} fill={shade(ROOF, -0.2)} />
          <rect x={X - 322} y={COL_TOP - 70} width={644} height={14} rx={7} fill={shade(ROOF, -0.08)} />
          <rect x={X - 290} y={COL_TOP - 52} width={580} height={48} rx={12} fill={shade(ROOF, -0.18)} />
          <rect x={X - 290} y={COL_TOP - 52} width={580} height={30} rx={12} fill={ROOF} />
          <rect x={X - 270} y={COL_TOP - 44} width={180} height={8} rx={4} fill={shade(ROOF, 0.4)} />
        </g>
      ) : null}
      {/* koin berputar di atas atap */}
      {coinK > 0.01 ? (
        <g transform={`translate(${X} ${COIN.y + bob}) scale(${coinK})`}>
          <ellipse cx={edge} cy={0} rx={COIN.r * s + Math.abs(edge) * 0.6} ry={COIN.r} fill={shade(Y, -0.3)} />
          <g transform={`scale(${s} 1)`}>
            <circle r={COIN.r} fill={Y} />
            <circle r={COIN.r * 0.76} fill={shade(Y, -0.12)} />
            <path d={roundedPath(starPts(0, 3, COIN.r * 0.44, COIN.r * 0.19, 5), 4)} fill={shade(Y, 0.38)} />
            <path d={`M${-COIN.r * 0.62},${-COIN.r * 0.44} A${COIN.r * 0.84},${COIN.r * 0.84} 0 0 1 ${-COIN.r * 0.1},${-COIN.r * 0.82}`} fill="none" stroke={shade(Y, 0.55)} strokeWidth={10} strokeLinecap="round" />
          </g>
        </g>
      ) : null}
      {/* kilau */}
      <Sparkle x={X + 110} y={COIN.y - 60 + bob} r={24 * shine * coinK} color={C.white} rot={10} />
      <Sparkle x={X - 150} y={COIN.y - 20} r={20 * coinK * (0.75 + 0.25 * wave(p, 4))} color={C.yellow} rot={15} />
      <Sparkle x={X + 170} y={COIN.y + 40} r={14 * coinK * (0.7 + 0.3 * wave(p, 4, 0.5))} color={C.yellow} />
      <Sparkle x={X - 400} y={600} r={15 * (0.6 + 0.4 * wave01(p, 2))} color={C.sky} rot={20} />
      <Sparkle x={X + 390} y={540} r={12 * (0.6 + 0.4 * wave01(p, 2, 0.5))} color={C.yellow} />
    </g>
  );
};
