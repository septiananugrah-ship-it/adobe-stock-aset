// Celengan babi menerima tiga koin yang jatuh berputar ke celah; tiap koin masuk, celengan memantul dan tanda plus muncul.
import React from 'react';
import {TAU, clamp, inOut, out, outBack, pop, seg, wave, wave01, yoyo} from '../../kit/loop';
import {C, shade} from '../../kit/palette';
import {Shadow, Sparkle, roundedPath, starPts} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'business-piggy-bank-coins',
  theme: 'business',
  title: 'Piggy bank catching spinning gold coins falling into the slot, savings and money concept, seamless loop animation with alpha channel',
  keywords: [
    'piggy bank', 'coins', 'savings', 'money', 'saving money', 'finance', 'deposit', 'investment', 'budget', 'banking',
    'gold coin', 'wealth', 'economy', 'personal finance', 'income', 'profit', 'cash', 'pension', 'retirement', 'financial',
    'growth', 'piggy', 'pig', 'cute', 'icon', 'flat design', 'illustration', 'cartoon', 'presentation', 'explainer',
    'social media', 'animation', 'motion graphics', 'seamless loop', 'looped', 'alpha channel', 'transparent background',
    'isolated', '4k', 'business',
  ],
  category: 3,
  seconds: 8,
  vectorP: 0.405,
};

const PX = 1000; // pusat badan celengan
const PY = 560;
const RX = 228;
const RY = 182;
const FLOOR = 800;
const SLOT_Y = PY - RY + 4; // garis celah di punggung
const PINK = C.pink;
const COIN_R = 50;
const DROPS = [0.1, 0.36, 0.62]; // koin muncul
const FALL0 = 0.05; // jeda melayang sebelum jatuh
const FALL = 0.11; // lama jatuh

/** Koin tampak depan berputar (sx = cos sudut putar). */
const Coin: React.FC<{x: number; y: number; r: number; sx: number}> = ({x, y, r, sx}) => {
  const s = Math.max(0.06, Math.abs(sx));
  const edge = (1 - s) * 12 * (sx >= 0 ? 1 : -1);
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={edge} cy={0} rx={r * s + Math.abs(edge) * 0.5} ry={r} fill={shade(C.yellow, -0.28)} />
      <g transform={`scale(${s} 1)`}>
        <circle r={r} fill={C.yellow} />
        <circle r={r * 0.74} fill={shade(C.yellow, -0.12)} />
        <path d={roundedPath(starPts(0, 2, r * 0.46, r * 0.2, 5), 3)} fill={shade(C.yellow, 0.35)} />
        <path d={`M${-r * 0.62},${-r * 0.42} A${r * 0.82},${r * 0.82} 0 0 1 ${-r * 0.1},${-r * 0.8}`} fill="none" stroke={shade(C.yellow, 0.5)} strokeWidth={7} strokeLinecap="round" />
      </g>
    </g>
  );
};

/** Koin tampak samping (tumpukan). */
const FlatCoin: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g>
    <rect x={x - 62} y={y - 9} width={124} height={22} fill={shade(C.yellow, -0.22)} />
    <ellipse cx={x} cy={y + 13} rx={62} ry={19} fill={shade(C.yellow, -0.22)} />
    <ellipse cx={x} cy={y - 9} rx={62} ry={19} fill={C.yellow} />
    <ellipse cx={x} cy={y - 9} rx={44} ry={12} fill={shade(C.yellow, -0.12)} />
    <rect x={x - 46} y={y + 4} width={11} height={20} rx={5.5} fill={shade(C.yellow, 0.25)} />
  </g>
);

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  // koin: muncul → melayang → jatuh berputar ke celah
  const coins = DROPS.map((t0, i) => {
    const appear = seg(p, t0, t0 + 0.04, (t) => outBack(t, 2));
    const f = seg(p, t0 + FALL0, t0 + FALL0 + FALL, (t) => t * t);
    const land = t0 + FALL0 + FALL;
    const y = 190 + 8 * wave(p, 4, i * 0.3) * (1 - f) + (SLOT_Y + COIN_R + 20 - 190) * f;
    const spin = TAU * (2 * f) + 0.0;
    return {i, appear, f, y, sx: Math.cos(spin), land, gone: p > land + 0.002};
  });
  // celengan menggembung sedikit tiap koin, kempis lagi di akhir
  const fat = (DROPS.reduce((a, t0) => a + seg(p, t0 + FALL0 + FALL, t0 + FALL0 + FALL + 0.06, (t) => outBack(t, 3)), 0) / 3) * (1 - seg(p, 0.86, 0.96, inOut));
  const squash = DROPS.reduce((a, t0) => a * pop(p, t0 + FALL0 + FALL, 0.09, 0.07), 1);
  const breath = 1 + 0.012 * wave(p, 4);
  const sx = (1 + 0.05 * fat) * breath * (1 + (squash - 1) * 0.6);
  const sy = (1 + 0.05 * fat) * breath / squash;
  const tail = 10 * wave(p, 4, 0.2);
  const blink = Math.max(yoyo(p, 0.48, 0.5, 0.5, 0.52), yoyo(p, 0.9, 0.92, 0.92, 0.94));
  const D = shade(PINK, -0.16);
  const DD = shade(PINK, -0.42);
  const L = shade(PINK, 0.42);
  const bodyY = FLOOR - 40; // poros skala di kaki
  return (
    <g>
      <Shadow cx={PX - 60} cy={FLOOR + 18} rx={330} ry={26} s={1 + 0.03 * fat} vector={vector} />
      {/* tumpukan koin di kiri */}
      {[0, 1, 2].map((k) => (
        <FlatCoin key={k} x={700} y={FLOOR - 14 - k * 30} />
      ))}
      <Sparkle x={742} y={FLOOR - 128} r={16 * (0.6 + 0.4 * wave01(p, 3))} color={C.yellow} rot={10} />
      <g transform={`translate(${PX} ${bodyY}) scale(${sx.toFixed(4)} ${sy.toFixed(4)}) translate(${-PX} ${-bodyY})`}>
        {/* kaki belakang (jauh) */}
        <rect x={PX - 150} y={PY + 120} width={58} height={FLOOR - PY - 112} rx={22} fill={D} />
        <rect x={PX + 98} y={PY + 120} width={58} height={FLOOR - PY - 112} rx={22} fill={D} />
        {/* ekor melingkar */}
        <g transform={`rotate(${tail} ${PX - RX + 8} ${PY - 10})`}>
          <path
            d={`M${PX - RX + 10},${PY - 10} C${PX - RX - 40},${PY - 14} ${PX - RX - 52},${PY - 70} ${PX - RX - 22},${PY - 76} C${PX - RX + 4},${PY - 80} ${PX - RX + 2},${PY - 44} ${PX - RX - 26},${PY - 40}`}
            fill="none"
            stroke={D}
            strokeWidth={13}
            strokeLinecap="round"
          />
        </g>
        {/* telinga jauh */}
        <path d={roundedPath([[PX + 40, PY - RY + 40], [PX + 64, PY - RY - 46], [PX + 130, PY - RY + 30]], 16)} fill={D} />
        {/* badan */}
        <ellipse cx={PX} cy={PY} rx={RX} ry={RY} fill={D} />
        <ellipse cx={PX - 10} cy={PY - 12} rx={RX - 14} ry={RY - 16} fill={PINK} />
        {/* kilau badan */}
        <path d={`M${PX - RX + 56},${PY - 70} A${RX - 50},${RY - 40} 0 0 1 ${PX - 70},${PY - RY + 40}`} fill="none" stroke={L} strokeWidth={14} strokeLinecap="round" />
        <circle cx={PX - 40} cy={PY - RY + 36} r={8} fill={L} />
        {/* kaki dekat */}
        <rect x={PX - 110} y={PY + 132} width={62} height={FLOOR - PY - 124} rx={24} fill={PINK} />
        <rect x={PX + 140} y={PY + 120} width={62} height={FLOOR - PY - 112} rx={24} fill={PINK} />
        <rect x={PX - 110} y={FLOOR - 26} width={62} height={18} rx={9} fill={D} />
        <rect x={PX + 140} y={FLOOR - 26} width={62} height={18} rx={9} fill={D} />
        {/* telinga dekat */}
        <path d={roundedPath([[PX + 70, PY - RY + 52], [PX + 112, PY - RY - 36], [PX + 166, PY - RY + 52]], 18)} fill={PINK} />
        <path d={roundedPath([[PX + 96, PY - RY + 44], [PX + 114, PY - RY - 6], [PX + 144, PY - RY + 44]], 10)} fill={D} />
        {/* moncong */}
        <ellipse cx={PX + RX - 6} cy={PY + 22} rx={50} ry={60} fill={D} />
        <ellipse cx={PX + RX - 12} cy={PY + 18} rx={44} ry={54} fill={shade(PINK, 0.18)} />
        <ellipse cx={PX + RX - 26} cy={PY + 2} rx={8} ry={14} fill={DD} />
        <ellipse cx={PX + RX + 4} cy={PY + 2} rx={8} ry={14} fill={DD} />
        {/* mata & pipi */}
        <g transform={`translate(${PX + 128} ${PY - 52}) scale(1 ${1 - 0.9 * blink})`}>
          <circle r={17} fill={C.navy} />
          <circle cx={-5} cy={-6} r={6} fill={C.white} />
        </g>
        <ellipse cx={PX + 112} cy={PY + 40} rx={26} ry={16} fill={shade(PINK, 0.3)} />
        {/* celah koin */}
        <rect x={PX - 78} y={SLOT_Y - 2} width={136} height={22} rx={11} fill={DD} />
      </g>
      {/* koin jatuh: terpotong di garis celah (motion), utuh di atasnya */}
      {!vector ? (
        <clipPath id="business-piggy-bank-coins-clip">
          <rect x={0} y={0} width={1920} height={SLOT_Y + 9} />
        </clipPath>
      ) : null}
      {coins.map(({i, appear, y, sx: csx, gone}) =>
        appear > 0.01 && !gone ? (
          <g key={i} clipPath={vector ? undefined : 'url(#business-piggy-bank-coins-clip)'}>
            <g transform={`translate(${PX - 10} ${y}) scale(${appear}) translate(${-(PX - 10)} ${-y})`}>
              <Coin x={PX - 10} y={y} r={COIN_R} sx={csx} />
            </g>
          </g>
        ) : null,
      )}
      {/* tanda plus & kilau setelah koin masuk */}
      {DROPS.map((t0, i) => {
        const land = t0 + FALL0 + FALL;
        const k = seg(p, land, land + 0.16);
        if (k <= 0 || k >= 1) return null;
        const s = outBack(clamp(k / 0.35), 2.4) * (1 - seg(k, 0.7, 1));
        const yy = SLOT_Y - 70 - 70 * out(k);
        const x = PX + 120 + i * 18;
        return (
          <g key={`plus${i}`}>
            <g transform={`translate(${x} ${yy}) scale(${s})`}>
              <rect x={-30} y={-9} width={60} height={18} rx={9} fill={C.green} />
              <rect x={-9} y={-30} width={18} height={60} rx={9} fill={C.green} />
            </g>
            <Sparkle x={PX - 120} y={SLOT_Y - 40 - 40 * out(k)} r={20 * s} color={C.yellow} rot={15} />
            <Sparkle x={PX + 40} y={SLOT_Y - 110 - 30 * out(k)} r={12 * s} color={C.yellow} />
          </g>
        );
      })}
    </g>
  );
};
