// Neraca keseimbangan: koin jatuh ke piring kiri sehingga lengan miring, lalu balok biru jatuh ke piring kanan
// sampai seimbang kembali (gerak lengan teredam pegas); lencana centang muncul, lalu muatan menghilang.
import React from 'react';
import {inOut, outBack, pop, seg, wave, wave01, yoyo} from '../../kit/loop';
import {C, shade} from '../../kit/palette';
import {Shadow, Sparkle, roundedPath, starPts} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'business-balance-scale-budget',
  theme: 'business',
  title: 'Balance scale weighing gold coins against blue blocks until perfectly balanced, budget and fairness concept, seamless loop with alpha channel',
  keywords: [
    'balance', 'scale', 'balance scale', 'budget', 'fairness', 'equality', 'justice', 'comparison', 'weighing', 'coins',
    'money', 'finance', 'cost', 'value', 'benefit', 'risk', 'decision', 'trade off', 'equilibrium', 'stability', 'accounting',
    'law', 'business', 'economy', 'investment', 'check mark', 'approval', 'icon', 'flat design', 'illustration', 'presentation',
    'explainer', 'social media', 'animation', 'motion graphics', 'seamless loop', 'looped', 'alpha channel',
    'transparent background', 'isolated', '4k',
  ],
  category: 3,
  seconds: 8,
  vectorP: 0.62,
};

const X = 960;
const PIV = 352; // titik poros lengan
const L = 300; // setengah panjang lengan
const HANG = 220; // panjang tali ke bibir piring
const PAN_W = 118;
const FRAME = C.ink;
const PAN = C.teal;
const Y = C.yellow;
const BLK = C.blue;
const DEG = 6; // derajat per satuan beban

// muatan: sisi (-1 kiri, +1 kanan), waktu mendarat, jenis
const LOADS: {side: -1 | 1; t: number; kind: 'coin' | 'block'; slot: number}[] = [
  {side: -1, t: 0.12, kind: 'coin', slot: 0},
  {side: -1, t: 0.2, kind: 'coin', slot: 1},
  {side: 1, t: 0.31, kind: 'block', slot: 0},
  {side: 1, t: 0.4, kind: 'block', slot: 1},
];
const FALL = 0.035;
const OUT_A = 0.82;

/** respons pegas teredam 0→1 */
const resp = (t: number) => (t <= 0 ? 0 : 1 - Math.exp(-t / 0.022) * Math.cos((2 * Math.PI * t) / 0.075));

const SideCoin: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g>
    <ellipse cx={x} cy={y + 26} rx={62} ry={18} fill={shade(Y, -0.34)} />
    <rect x={x - 62} y={y} width={124} height={24} fill={shade(Y, -0.16)} />
    <ellipse cx={x} cy={y + 24} rx={62} ry={18} fill={shade(Y, -0.16)} />
    <rect x={x - 50} y={y + 8} width={8} height={22} rx={4} fill={shade(Y, 0.25)} />
    <ellipse cx={x} cy={y} rx={62} ry={18} fill={Y} />
    <ellipse cx={x} cy={y} rx={44} ry={12} fill={shade(Y, -0.1)} />
    <g transform={`translate(${x} ${y}) scale(1 0.3)`}>
      <path d={roundedPath(starPts(0, 2, 26, 11, 5), 3)} fill={shade(Y, 0.32)} />
    </g>
  </g>
);

const Block: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <g>
    <rect x={x - s / 2} y={y - s} width={s} height={s} rx={12} fill={shade(BLK, -0.18)} />
    <rect x={x - s / 2} y={y - s} width={s * 0.72} height={s} rx={12} fill={BLK} />
    <rect x={x - s / 2 + 12} y={y - s + 12} width={8} height={s * 0.5} rx={4} fill={shade(BLK, 0.4)} />
  </g>
);

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  const theta = LOADS.reduce((a, ld) => a + ld.side * DEG * resp(p - ld.t), 0);
  const th = (theta * Math.PI) / 180;
  const ends = [-1, 1].map((sd) => ({x: X + sd * L * Math.cos(th), y: PIV + sd * L * Math.sin(th)}));
  const outK = LOADS.map((_, i) => seg(p, OUT_A + (3 - i) * 0.015, OUT_A + 0.06 + (3 - i) * 0.015, inOut));
  const check = yoyo(p, 0.47, 0.54, 0.76, 0.81, (t) => outBack(t, 2.2), inOut);
  const ring = seg(p, 0.47, 0.6);
  const bob = 5 * wave(p, 2);

  const panRim = (side: -1 | 1) => {
    const e = ends[side === -1 ? 0 : 1];
    return {x: e.x, y: e.y + HANG};
  };

  const renderLoad = (ld: (typeof LOADS)[number], i: number) => {
    const rim = panRim(ld.side);
    const appear = seg(p, ld.t - FALL - 0.05, ld.t - FALL, (t) => outBack(t, 2.2));
    if (p < ld.t - FALL - 0.05) return null;
    const f = seg(p, ld.t - FALL, ld.t, (t) => t * t);
    const gone = 1 - outK[i];
    if (gone <= 0.01 || appear <= 0.01) return null;
    const lift = 90 * (1 - f);
    const squash = pop(p, ld.t, 0.06, 0.1);
    if (ld.kind === 'coin') {
      const y = rim.y - 26 - ld.slot * 26 - lift;
      return (
        <g key={i} transform={`translate(${rim.x} ${y + 26}) scale(${appear * gone * squash} ${(appear * gone) / squash}) translate(${-rim.x} ${-(y + 26)})`}>
          <SideCoin x={rim.x + (ld.slot ? 6 : -4)} y={y} />
        </g>
      );
    }
    const s = 74;
    const bx = rim.x + (ld.slot ? 44 : -40);
    const by = rim.y + 2 - lift;
    return (
      <g key={i} transform={`translate(${bx} ${by}) scale(${appear * gone * squash} ${(appear * gone) / squash}) translate(${-bx} ${-by})`}>
        <Block x={bx} y={by} s={s} />
      </g>
    );
  };

  return (
    <g>
      <Shadow cx={X} cy={846} rx={330} ry={24} vector={vector} />
      {/* tiang & alas */}
      <path d={roundedPath([[X - 26, PIV], [X + 26, PIV], [X + 34, 780], [X - 34, 780]], 10)} fill={FRAME} />
      <path d={roundedPath([[X + 4, PIV], [X + 26, PIV], [X + 34, 780], [X + 6, 780]], 8)} fill={shade(FRAME, -0.25)} />
      <rect x={X - 14} y={PIV + 40} width={9} height={340} rx={4.5} fill={shade(FRAME, 0.3)} />
      <path d={roundedPath([[X - 110, 770], [X + 110, 770], [X + 170, 836], [X - 170, 836]], 16)} fill={FRAME} />
      <path d={roundedPath([[X - 170, 812], [X + 170, 812], [X + 170, 836], [X - 170, 836]], 10)} fill={shade(FRAME, -0.25)} />
      <rect x={X - 96} y={782} width={90} height={9} rx={4.5} fill={shade(FRAME, 0.3)} />
      {/* tali & piring */}
      {([-1, 1] as const).map((sd) => {
        const e = ends[sd === -1 ? 0 : 1];
        const rim = panRim(sd);
        return (
          <g key={sd}>
            <path d={`M${rim.x - PAN_W + 14},${rim.y} L${e.x},${e.y + 6} L${rim.x + PAN_W - 14},${rim.y}`} fill="none" stroke={shade(FRAME, 0.25)} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );
      })}
      {LOADS.map((ld, i) => renderLoad(ld, i))}
      {([-1, 1] as const).map((sd) => {
        const rim = panRim(sd);
        return (
          <g key={`pan${sd}`}>
            <path d={`M${rim.x - PAN_W},${rim.y} A${PAN_W},${58} 0 0 0 ${rim.x + PAN_W},${rim.y} Z`} fill={PAN} />
            <path d={`M${rim.x + 10},${rim.y} L${rim.x + PAN_W},${rim.y} A${PAN_W},58 0 0 1 ${rim.x + 10},${rim.y + 58} Z`} fill={shade(PAN, -0.16)} />
            <rect x={rim.x - PAN_W - 8} y={rim.y - 8} width={PAN_W * 2 + 16} height={16} rx={8} fill={shade(PAN, 0.2)} />
            <path d={`M${rim.x - PAN_W + 28},${rim.y + 20} Q${rim.x - PAN_W + 40},${rim.y + 44} ${rim.x - 40},${rim.y + 52}`} fill="none" stroke={shade(PAN, 0.45)} strokeWidth={8} strokeLinecap="round" />
          </g>
        );
      })}
      {/* lengan */}
      <g transform={`rotate(${theta.toFixed(3)} ${X} ${PIV})`}>
        <rect x={X - L - 18} y={PIV - 14} width={2 * L + 36} height={28} rx={14} fill={FRAME} />
        <rect x={X - L - 6} y={PIV - 8} width={L - 40} height={7} rx={3.5} fill={shade(FRAME, 0.3)} />
        <circle cx={X - L} cy={PIV} r={20} fill={shade(FRAME, 0.15)} />
        <circle cx={X + L} cy={PIV} r={20} fill={shade(FRAME, 0.15)} />
        <circle cx={X - L} cy={PIV} r={8} fill={shade(FRAME, -0.3)} />
        <circle cx={X + L} cy={PIV} r={8} fill={shade(FRAME, -0.3)} />
      </g>
      {/* poros & mahkota */}
      <circle cx={X} cy={PIV} r={36} fill={Y} />
      <circle cx={X} cy={PIV} r={22} fill={shade(Y, -0.16)} />
      <circle cx={X - 8} cy={PIV - 9} r={6} fill={shade(Y, 0.5)} />
      <path d={roundedPath([[X - 18, PIV - 30], [X, PIV - 76], [X + 18, PIV - 30]], 6)} fill={FRAME} />
      {/* lencana seimbang */}
      {check > 0.01 ? (
        <g transform={`translate(${X} ${PIV - 170 + bob}) scale(${check})`}>
          {!vector && ring > 0 && ring < 1 ? <circle r={50 + 50 * ring} fill="none" stroke={C.green} strokeWidth={8 * (1 - ring)} opacity={1 - ring} /> : null}
          <circle cx={3} cy={6} r={50} fill={shade(C.green, -0.2)} />
          <circle r={50} fill={C.green} />
          <path d="M-22,2 L-6,18 L24,-14" fill="none" stroke={C.white} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ) : null}
      {/* kilau */}
      <Sparkle x={X - 120} y={PIV - 200} r={18 * check * (0.75 + 0.25 * wave(p, 4))} color={C.yellow} rot={15} />
      <Sparkle x={X + 130} y={PIV - 120} r={13 * check * (0.7 + 0.3 * wave(p, 4, 0.5))} color={C.green} />
      <Sparkle x={X - 470} y={PIV + 70} r={14 * (0.6 + 0.4 * wave01(p, 2))} color={C.sky} rot={20} />
      <Sparkle x={X + 480} y={PIV + 40} r={12 * (0.6 + 0.4 * wave01(p, 2, 0.5))} color={C.yellow} />
    </g>
  );
};
