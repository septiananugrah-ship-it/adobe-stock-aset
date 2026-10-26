// Papan target: anak panah ditarik, melesat, lalu menancap tepat di pusat dengan getar, gelombang benturan, dan kilau.
import React from 'react';
import {inOut, out, outBack, pop, seg, wave, wave01, yoyo} from '../../kit/loop';
import {C, shade} from '../../kit/palette';
import {Shadow, Sparkle, roundedPath} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'business-target-arrow-hit',
  theme: 'business',
  title: 'Arrow flying and hitting the bullseye of a target board, business goal achievement animation, seamless loop with alpha channel',
  keywords: [
    'target', 'arrow', 'bullseye', 'goal', 'aim', 'success', 'achievement', 'business goal', 'strategy', 'focus',
    'objective', 'accuracy', 'precision', 'marketing', 'target audience', 'hit', 'dartboard', 'mission', 'winner',
    'performance', 'planning', 'motivation', 'kpi', 'result', 'challenge', 'icon', 'flat design', 'illustration',
    'presentation', 'explainer', 'social media', 'animation', 'motion graphics', 'seamless loop', 'looped', 'alpha channel',
    'transparent background', 'isolated', '4k', 'business',
  ],
  category: 3,
  seconds: 8,
  vectorP: 0.55,
};

const TX = 900;
const TY = 500;
const RINGS = [250, 200, 150, 100, 52];
const ANG = -28; // arah dari ujung ke ekor (derajat)
const DIR = [Math.cos((ANG * Math.PI) / 180), Math.sin((ANG * Math.PI) / 180)];
const LEN = 360;
const FLOOR = 880;

/** Anak panah: ujung di (0,0), batang ke arah +x. */
const Arrow: React.FC<{head: boolean; sway: number}> = ({head, sway}) => {
  const shaft = C.slate;
  const feather = C.yellow;
  return (
    <g>
      <rect x={-6} y={-9} width={LEN - 10} height={18} rx={9} fill={shaft} />
      <rect x={24} y={-9} width={LEN - 150} height={6} rx={3} fill={shade(shaft, 0.35)} />
      {/* bulu ekor */}
      <g transform={`rotate(${sway} ${LEN - 60} 0)`}>
        <path d={roundedPath([[LEN - 120, -8], [LEN - 62, -8], [LEN - 4, -62], [LEN - 66, -62]], 10)} fill={feather} />
        <path d={roundedPath([[LEN - 120, 8], [LEN - 62, 8], [LEN - 4, 62], [LEN - 66, 62]], 10)} fill={shade(feather, -0.18)} />
      </g>
      <rect x={LEN - 24} y={-13} width={30} height={26} rx={9} fill={shade(shaft, -0.25)} />
      {head ? <path d={roundedPath([[-70, 0], [8, -34], [-6, 0], [8, 34]], 6)} fill={C.steel} /> : null}
      {head ? <path d={roundedPath([[-70, 0], [-6, 0], [8, 34]], 5)} fill={shade(C.steel, -0.2)} /> : null}
    </g>
  );
};

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  const HIT = 0.24;
  const appear = yoyo(p, 0.06, 0.11, 0.84, 0.92, (t) => outBack(t, 2), inOut);
  const pull = 36 * seg(p, 0.1, 0.17, inOut) * (1 - seg(p, 0.17, 0.2, inOut)); // tarik mundur (antisipasi)
  const fly = seg(p, 0.18, HIT, (t) => t * t * t);
  const D = (1 - fly) * 370 + pull * (1 - fly);
  const hit = p >= HIT;
  const tt = (p - HIT) / 0.16;
  const wob = hit && tt < 1 ? 7 * Math.exp(-4 * tt) * Math.sin(tt * 28) : 0;
  const sway = 3 * seg(p, HIT + 0.1, HIT + 0.2) * (1 - seg(p, 0.78, 0.84)) * wave(p, 4);
  const squash = pop(p, HIT, 0.08, 0.05);
  const shake = hit && tt < 1 ? 5 * Math.exp(-5 * tt) * Math.sin(tt * 40) : 0;
  const breath = 1 + 0.01 * wave(p, 2);
  const burst = seg(p, HIT, HIT + 0.12, out);
  const ripple = seg(p, HIT, HIT + 0.14, out);
  const glow = yoyo(p, HIT + 0.04, HIT + 0.12, 0.8, 0.88);
  const tipX = TX + DIR[0] * D;
  const tipY = TY + DIR[1] * D;
  // garis laju saat terbang
  const trail = Math.sin(Math.PI * seg(p, 0.18, HIT + 0.02));
  return (
    <g>
      <Shadow cx={TX + 20} cy={FLOOR + 6} rx={250} ry={24} vector={vector} />
      {/* kaki penyangga */}
      <path d={roundedPath([[TX - 22, TY + 120], [TX + 4, TY + 120], [TX - 120, FLOOR], [TX - 156, FLOOR]], 10)} fill={shade(C.slate, -0.1)} />
      <path d={roundedPath([[TX + 40, TY + 100], [TX + 70, TY + 100], [TX + 216, FLOOR], [TX + 180, FLOOR]], 10)} fill={shade(C.slate, -0.3)} />
      <path d={roundedPath([[TX - 4, TY + 140], [TX + 26, TY + 140], [TX + 62, FLOOR], [TX + 26, FLOOR]], 10)} fill={C.slate} />
      <g transform={`translate(${TX + shake} ${TY}) scale(${breath * (2 - squash)} ${breath * squash}) translate(${-TX} ${-TY})`}>
        {/* tebal papan */}
        <circle cx={TX + 12} cy={TY + 16} r={RINGS[0]} fill={shade(C.coral, -0.32)} />
        {RINGS.map((r, i) => (
          <g key={i}>
            {i > 0 ? <circle cx={TX + 5} cy={TY + 7} r={r} fill={i % 2 ? shade(C.coral, -0.2) : shade(C.cloud, -0.14)} /> : null}
            <circle cx={TX} cy={TY} r={r} fill={i % 2 ? C.cloud : C.coral} />
          </g>
        ))}
        <path d={`M${TX - 214},${TY - 70} A225,225 0 0 1 ${TX - 70},${TY - 214}`} fill="none" stroke={shade(C.coral, 0.42)} strokeWidth={12} strokeLinecap="round" />
        <circle cx={TX - 150} cy={TY - 150} r={7} fill={shade(C.coral, 0.42)} />
        {/* gelombang benturan */}
        {ripple > 0 && ripple < 1 ? (
          <circle cx={TX} cy={TY} r={52 + 150 * ripple} fill="none" stroke={C.white} strokeWidth={14 * (1 - ripple)} />
        ) : null}
        {hit && appear > 0.02 ? <circle cx={TX} cy={TY} r={14 * appear} fill={shade(C.coral, -0.45)} /> : null}
      </g>
      {/* jejak laju */}
      {trail > 0.02 && !hit
        ? [-30, 0, 30].map((o, i) => {
            const nx = -DIR[1];
            const ny = DIR[0];
            const l = 150 * trail * (i === 1 ? 1 : 0.65);
            const sx = tipX + DIR[0] * (LEN + 30) + nx * o;
            const sy = tipY + DIR[1] * (LEN + 30) + ny * o;
            return <path key={i} d={`M${sx},${sy} L${sx + DIR[0] * l},${sy + DIR[1] * l}`} stroke={C.steel} strokeWidth={10} strokeLinecap="round" />;
          })
        : null}
      {/* panah */}
      {appear > 0.01 ? (
        <g transform={`translate(${tipX + (hit ? shake : 0)} ${tipY}) rotate(${ANG + wob}) scale(${appear})`}>
          <Arrow head={!hit} sway={sway} />
        </g>
      ) : null}
      {/* semburan sinar di pusat */}
      {burst > 0 && burst < 1
        ? Array.from({length: 8}, (_, i) => {
            const a = (i / 8) * Math.PI * 2 + 0.2;
            const r0 = 70 + 120 * burst;
            const l = 46 * Math.sin(Math.PI * burst);
            return (
              <path
                key={`b${i}`}
                d={`M${TX + Math.cos(a) * r0},${TY + Math.sin(a) * r0} L${TX + Math.cos(a) * (r0 + l)},${TY + Math.sin(a) * (r0 + l)}`}
                stroke={C.yellow}
                strokeWidth={12}
                strokeLinecap="round"
              />
            );
          })
        : null}
      {/* kilau perayaan */}
      <Sparkle x={TX - 330} y={TY - 170} r={28 * glow * (0.8 + 0.2 * wave(p, 4))} color={C.yellow} rot={15} />
      <Sparkle x={TX - 290} y={TY - 250} r={14 * glow * (0.8 + 0.2 * wave(p, 4, 0.4))} color={C.yellow} />
      <Sparkle x={TX + 330} y={TY + 150} r={20 * glow * (0.8 + 0.2 * wave(p, 4, 0.2))} color={C.coral} rot={10} />
      <Sparkle x={TX - 300} y={TY + 220} r={12 * (0.6 + 0.4 * wave01(p, 2))} color={C.yellow} />
    </g>
  );
};
