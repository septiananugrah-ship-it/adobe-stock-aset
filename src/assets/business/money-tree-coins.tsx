// Pohon uang dalam pot: koin emas tumbuh sebagai buah secara bertingkat, berayun dan berkilau,
// satu koin matang jatuh lalu menggelinding di lantai, kemudian semua koin menyusut kembali.
import React from 'react';
import {TAU, clamp, inOut, out, outBack, pop, seg, wave, wave01, yoyo} from '../../kit/loop';
import {C, shade} from '../../kit/palette';
import {Shadow, Sparkle, roundedPath, starPts} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'business-money-tree-coins',
  theme: 'business',
  title: 'Money tree in a pot growing shiny gold coins, one coin falls and rolls, investment growth concept, seamless loop animation with alpha channel',
  keywords: [
    'money tree', 'coins', 'investment', 'growth', 'passive income', 'profit', 'finance', 'savings', 'gold coins', 'wealth',
    'dividend', 'interest', 'return on investment', 'financial growth', 'money', 'tree', 'plant', 'pot', 'harvest', 'income',
    'economy', 'banking', 'capital', 'success', 'prosperity', 'rich', 'business', 'fund', 'icon', 'flat design', 'illustration',
    'presentation', 'explainer', 'social media', 'animation', 'motion graphics', 'seamless loop', 'looped', 'alpha channel',
    'transparent background', 'isolated', '4k',
  ],
  category: 3,
  seconds: 8,
  vectorP: 0.5,
};

const FLOOR = 846;
const POT = C.coral;
const LEAF = C.green;
const TRUNK = C.brown;
const Y = C.yellow;
// tajuk: lingkaran-lingkaran yang menyatu
const BLOBS: [number, number, number][] = [
  [960, 365, 172],
  [815, 415, 112],
  [1105, 415, 112],
  [880, 252, 118],
  [1042, 248, 122],
  [960, 462, 104],
];
// koin buah: x, y (titik gantung), jeda muncul
const FRUIT: [number, number][] = [
  [842, 335],
  [962, 232],
  [1084, 318],
  [900, 450],
  [1030, 446],
  [774, 448],
  [1148, 452],
];
const COIN_R = 38;
const CY = 465; // poros napas tajuk
const DROP_I = 6;
const FALL_A = 0.58;
const FALL_B = 0.64;

const rotP = (x: number, y: number, deg: number, ox: number, oy: number): [number, number] => {
  const a = (deg * Math.PI) / 180;
  return [ox + (x - ox) * Math.cos(a) - (y - oy) * Math.sin(a), oy + (x - ox) * Math.sin(a) + (y - oy) * Math.cos(a)];
};
const swayAt = (p: number) => 1.6 * wave(p, 2);
const breathAt = (p: number) => 1 + 0.012 * wave(p, 4, 0.1);
const swingAt = (p: number, i: number) => 6 * wave(p, 2, i * 0.17) + (i === DROP_I ? 10 * seg(p, FALL_A - 0.06, FALL_A, inOut) * wave(p, 16) : 0);
// titik lepas koin jatuh (koordinat dunia) pada p = FALL_A
const RELEASE = (() => {
  const [hx, hy] = FRUIT[DROP_I];
  const sw = swingAt(FALL_A, DROP_I);
  let q = rotP(hx, hy + 10 + COIN_R, sw, hx, hy);
  const b = breathAt(FALL_A);
  q = [960 + (q[0] - 960) * b, CY + (q[1] - CY) * b];
  q = rotP(q[0], q[1], swayAt(FALL_A), 960, 700);
  return {x: q[0], y: q[1], rot: sw + swayAt(FALL_A)};
})();

/** Koin tampak depan. sx = lebar semu (putar). */
const Coin: React.FC<{r: number; sx?: number}> = ({r, sx = 1}) => {
  const s = Math.max(0.08, Math.abs(sx));
  return (
    <g>
      <ellipse cx={(1 - s) * 6} cy={0} rx={r * s + (1 - s) * 4} ry={r} fill={shade(Y, -0.3)} />
      <g transform={`scale(${s} 1)`}>
        <circle r={r} fill={Y} />
        <circle r={r * 0.72} fill={shade(Y, -0.12)} />
        <path d={roundedPath(starPts(0, 1.5, r * 0.44, r * 0.19, 5), 2)} fill={shade(Y, 0.35)} />
        <path d={`M${-r * 0.6},${-r * 0.42} A${r * 0.8},${r * 0.8} 0 0 1 ${-r * 0.12},${-r * 0.78}`} fill="none" stroke={shade(Y, 0.55)} strokeWidth={5} strokeLinecap="round" />
      </g>
    </g>
  );
};

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  const sway = swayAt(p);
  const breath = breathAt(p);
  const grow = FRUIT.map((_, i) => {
    const a = 0.06 + i * 0.035;
    const endA = 0.84 + (FRUIT.length - 1 - i) * 0.012;
    return yoyo(p, a, a + 0.09, endA, endA + 0.05, (t) => outBack(t, 2.2), inOut);
  });
  const glint = FRUIT.map((_, i) => (vector ? 0 : seg(p, 0.3 + i * 0.03, 0.4 + i * 0.03, inOut)));
  // koin jatuh: lepas → jatuh → memantul → menggelinding → diam → menyusut
  const fallT = seg(p, FALL_A, FALL_B, (t) => t * t);
  const roll = seg(p, FALL_B + 0.01, FALL_B + 0.11, out);
  const groundShrink = 1 - seg(p, 0.86, 0.92, inOut);
    const groundY = FLOOR - COIN_R - 4;
  const landed = p >= FALL_B;
  const bounce = landed ? 34 * Math.abs(Math.sin(Math.PI * clamp((p - FALL_B) / 0.045))) * (1 - clamp((p - FALL_B) / 0.045)) : 0;
  const dropX = RELEASE.x + (landed ? 120 * roll : 0);
  const dropY = landed ? groundY - bounce : RELEASE.y + (groundY - RELEASE.y) * fallT;
  const dropRot = landed ? (120 * roll * 180) / (Math.PI * COIN_R) : RELEASE.rot * (1 - seg(fallT, 0, 1, out));
  const squash = pop(p, FALL_B, 0.06, 0.1);
  const potPulse = pop(p, FALL_B, 0.07, 0.03);

  // ayunan tajuk di sekitar pangkal batang
  const OX = 960;
  const OY = 700;
  return (
    <g>
      <Shadow cx={990} cy={FLOOR + 6} rx={330} ry={26} vector={vector} />
      {/* koin di lantai (bayangan kecil) */}
      {p >= FALL_A && p < 0.92 && !vector ? (
        <ellipse cx={dropX} cy={FLOOR + 2} rx={COIN_R * (0.4 + 0.6 * fallT) * groundShrink} ry={7 * groundShrink} fill="#0B1020" opacity={0.1 * (0.4 + 0.6 * fallT)} />
      ) : null}
      <g transform={`rotate(${sway.toFixed(3)} ${OX} ${OY})`}>
        {/* batang & cabang */}
        <path d="M956,600 C930,580 900,560 874,520" fill="none" stroke={TRUNK} strokeWidth={20} strokeLinecap="round" />
        <path d="M966,586 C994,566 1022,546 1046,506" fill="none" stroke={shade(TRUNK, -0.12)} strokeWidth={20} strokeLinecap="round" />
        <path d={`M934,${OY + 10} C944,640 942,560 934,470 L990,470 C980,560 978,640 988,${OY + 10} Z`} fill={TRUNK} />
        <path d={`M964,${OY + 10} C966,640 968,560 968,470 L990,470 C980,560 978,640 988,${OY + 10} Z`} fill={shade(TRUNK, -0.18)} />
        <rect x={946} y={600} width={9} height={56} rx={4.5} fill={shade(TRUNK, 0.3)} />
        {/* tajuk */}
        <g transform={`translate(960 ${CY}) scale(${breath}) translate(-960 ${-CY})`}>
          {BLOBS.map(([x, y, r], i) => (
            <circle key={`d${i}`} cx={x + 6} cy={y + 14} r={r} fill={shade(LEAF, -0.24)} />
          ))}
          {BLOBS.map(([x, y, r], i) => (
            <circle key={`m${i}`} cx={x} cy={y} r={r} fill={LEAF} />
          ))}
          {BLOBS.filter((_, i) => i === 1 || i === 3 || i === 4).map(([x, y, r], i) => (
            <path key={`h${i}`} d={`M${x - r * 0.62},${y - r * 0.28} A${r * 0.7},${r * 0.7} 0 0 1 ${x - r * 0.12},${y - r * 0.68}`} fill="none" stroke={shade(LEAF, 0.4)} strokeWidth={12} strokeLinecap="round" />
          ))}
          <circle cx={1070} cy={190} r={10} fill={shade(LEAF, 0.4)} />
          <circle cx={1140} cy={380} r={8} fill={shade(LEAF, 0.4)} />
          {/* buah koin */}
          {FRUIT.map(([x, y], i) => {
            const g = grow[i];
            if (i === DROP_I && p >= FALL_A) {
              // tangkai tetap, koin sudah lepas
              return <rect key={i} x={x - 4} y={y - 4} width={8} height={18 * g} rx={4} fill={shade(LEAF, -0.36)} />;
            }
            if (g <= 0.01) return null;
            const swing = swingAt(p, i);
            const spin = Math.cos(TAU * glint[i]);
            return (
              <g key={i} transform={`translate(${x} ${y}) rotate(${swing.toFixed(3)}) scale(${g})`}>
                <rect x={-4} y={-4} width={8} height={18} rx={4} fill={shade(LEAF, -0.36)} />
                <g transform={`translate(0 ${10 + COIN_R})`}>
                  <Coin r={COIN_R} sx={spin} />
                </g>
              </g>
            );
          })}
        </g>
      </g>
      {/* pot */}
      <g transform={`translate(960 ${FLOOR}) scale(${1 / potPulse} ${potPulse}) translate(-960 ${-FLOOR})`}>
        <path d={roundedPath([[846, 708], [1074, 708], [1046, FLOOR], [874, FLOOR]], 14)} fill={POT} />
        <path d={roundedPath([[980, 708], [1074, 708], [1046, FLOOR], [990, FLOOR]], 12)} fill={shade(POT, -0.16)} />
        <rect x={826} y={676} width={268} height={48} rx={16} fill={shade(POT, 0.12)} />
        <rect x={826} y={704} width={268} height={20} rx={10} fill={shade(POT, -0.08)} />
        <rect x={846} y={686} width={120} height={10} rx={5} fill={shade(POT, 0.45)} />
        <rect x={876} y={748} width={12} height={62} rx={6} fill={shade(POT, 0.35)} />
      </g>
      {/* koin jatuh / menggelinding */}
      {p >= FALL_A && groundShrink > 0.01 ? (
        <g transform={`translate(${dropX} ${dropY + COIN_R}) scale(${(1 + (squash - 1) * 0.8) * groundShrink} ${groundShrink / squash}) translate(0 ${-COIN_R})`}>
          <g transform={`rotate(${dropRot.toFixed(2)})`}>
            <Coin r={COIN_R} sx={landed ? 1 : Math.cos(TAU * fallT)} />
          </g>
        </g>
      ) : null}
      {/* kilau */}
      {FRUIT.map(([x, y], i) => (
        <Sparkle key={i} x={x + 30} y={y + 18} r={18 * Math.sin(Math.PI * glint[i]) * grow[i]} color={C.white} rot={15} />
      ))}
      <Sparkle x={680} y={270} r={20 * grow[0] * (0.7 + 0.3 * wave01(p, 3))} color={C.yellow} rot={12} />
      <Sparkle x={1250} y={220} r={15 * grow[2] * (0.7 + 0.3 * wave01(p, 3, 0.5))} color={C.yellow} />
      <Sparkle x={1250} y={650} r={12 * (0.6 + 0.4 * wave01(p, 2, 0.2))} color={C.green} rot={20} />
    </g>
  );
};
