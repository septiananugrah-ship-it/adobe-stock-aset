// Empat tumpukan koin tumbuh bertingkat: koin jatuh satu per satu dan mendarat dengan pantulan kecil,
// panah hijau melengkung naik di atasnya, kilau merambat naik di tiap tumpukan, lalu tumpukan memampat kembali.
import React from 'react';
import {clamp, inOut, outBack, pop, rng, seg, wave, wave01, yoyo} from '../../kit/loop';
import {C, blend, shade} from '../../kit/palette';
import {Shadow, Sparkle, roundedPath, starPts} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'business-coin-stacks-growth',
  theme: 'business',
  title: 'Growing stacks of gold coins with rising green arrow, money growth and investment concept, seamless loop animation with alpha channel',
  keywords: [
    'coins', 'coin stack', 'money growth', 'investment', 'profit', 'finance', 'savings', 'gold coins', 'growth', 'income',
    'wealth', 'revenue', 'increase', 'success', 'economy', 'banking', 'interest', 'dividend', 'financial growth', 'budget',
    'cash', 'stack', 'rising arrow', 'arrow up', 'progress', 'business', 'capital', 'fund', 'icon', 'flat design',
    'illustration', 'presentation', 'explainer', 'social media', 'animation', 'motion graphics', 'seamless loop', 'looped',
    'alpha channel', 'transparent background', 'isolated', '4k',
  ],
  category: 3,
  seconds: 8,
  vectorP: 0.635,
};

const FLOOR = 812;
const RX = 88;
const RY = 26;
const TH = 34; // tebal koin
const XS = [615, 845, 1075, 1305];
const COUNTS = [3, 5, 7, 10];
const Y = C.yellow;
const Y2 = shade(Y, -0.16);
const Y3 = shade(Y, -0.34);
const YL = shade(Y, 0.45);
const DROP = 0.017; // selang antar-koin
const FALL = 0.05;
const START = 0.05;

// jadwal jatuh + geser kecil acak (deterministik)
const COINS = (() => {
  const r = rng(11);
  const list: {s: number; j: number; t0: number; dx: number}[] = [];
  let k = 0;
  XS.forEach((_, s) => {
    for (let j = 0; j < COUNTS[s]; j++) {
      const dx = j === 0 ? 0 : Math.round((r() - 0.5) * 10);
      list.push({s, j, t0: j === 0 ? -1 : START + k++ * DROP, dx});
    }
  });
  return list;
})();
const ARROW = 'M470,560 C820,545 1140,430 1450,220';
const ARROW_LEN = (() => {
  const P = [[470, 560], [820, 545], [1140, 430], [1450, 220]];
  let L = 0;
  let prev = P[0];
  for (let i = 1; i <= 200; i++) {
    const t = i / 200;
    const u = 1 - t;
    const q = [0, 1].map((k) => u * u * u * P[0][k] + 3 * u * u * t * P[1][k] + 3 * u * t * t * P[2][k] + t * t * t * P[3][k]);
    L += Math.hypot(q[0] - prev[0], q[1] - prev[1]);
    prev = q;
  }
  return L;
})();

/** Satu koin tampak samping. y = tepi atas sisi koin (wajah atas di y). */
const SideCoin: React.FC<{x: number; y: number; glint: number; top?: boolean}> = ({x, y, glint, top}) => {
  const body = blend(Y2, YL, glint * 0.6);
  return (
    <g>
      <ellipse cx={x} cy={y + TH + 2} rx={RX} ry={RY} fill={Y3} />
      <rect x={x - RX} y={y} width={RX * 2} height={TH} fill={body} />
      <ellipse cx={x} cy={y + TH} rx={RX} ry={RY} fill={body} />
      <rect x={x - RX + 14} y={y + RY * 0.55} width={9} height={TH} rx={4.5} fill={blend(shade(Y, 0.2), C.white, glint * 0.5)} />
      <rect x={x + RX - 30} y={y + RY * 0.7} width={7} height={TH - 2} rx={3.5} fill={shade(Y2, -0.08)} />
      {top ? (
        <g>
          <ellipse cx={x} cy={y} rx={RX} ry={RY} fill={Y} />
          <ellipse cx={x} cy={y} rx={RX * 0.72} ry={RY * 0.68} fill={shade(Y, -0.1)} />
          <g transform={`translate(${x} ${y}) scale(1 0.3)`}>
            <path d={roundedPath(starPts(0, 2, 34, 15, 5), 3)} fill={shade(Y, 0.32)} />
          </g>
        </g>
      ) : null}
    </g>
  );
};

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  // pemampatan kembali (kanan → kiri)
  const collapse = XS.map((_, s) => seg(p, 0.83 + (3 - s) * 0.02, 0.92 + (3 - s) * 0.02, inOut));
  const arrowDraw = yoyo(p, 0.47, 0.6, 0.78, 0.85, inOut, inOut);
  const head = yoyo(p, 0.57, 0.63, 0.77, 0.8, (t) => outBack(t, 2.2), inOut);
  const glintPos = seg(p, 0.64, 0.78, inOut);
  const hold = seg(p, 0.58, 0.62) * (1 - seg(p, 0.76, 0.8));

  const stacks = XS.map((x, s) => {
    const items = COINS.filter((c) => c.s === s);
    const shown = items.filter((c) => c.t0 < 0 || p >= c.t0);
    // tumpukan memantul tiap koin mendarat
    const squash = items.reduce((a, c) => (c.t0 < 0 ? a : a * pop(p, c.t0 + FALL, 0.06, 0.05)), 1);
    return {x, s, items: shown, squash};
  });

  // arah ujung panah (tangen akhir kurva)
  const tip = [1450, 220];
  const ang = (Math.atan2(220 - 430, 1450 - 1140) * 180) / Math.PI;

  return (
    <g>
      <Shadow cx={960} cy={FLOOR + 32} rx={480} ry={30} vector={vector} />
      {/* panah naik (di belakang tumpukan) */}
      {arrowDraw > 0.003 ? (
        <path
          d={ARROW}
          fill="none"
          stroke={C.green}
          strokeWidth={20}
          strokeLinecap="round"
          strokeDasharray={`${(ARROW_LEN * arrowDraw).toFixed(1)} ${ARROW_LEN + 40}`}
        />
      ) : null}
      {head > 0.01 ? (
        <g transform={`translate(${tip[0]} ${tip[1]}) rotate(${ang}) scale(${head})`}>
          <path d={roundedPath([[58, 0], [-8, -40], [-8, 40]], 10)} fill={C.green} />
          <path d={roundedPath([[56, 1], [-6, 1], [-7, 38]], 6)} fill={shade(C.green, -0.14)} />
        </g>
      ) : null}
      {stacks.map(({x, s, items, squash}) => {
        const col = collapse[s];
        const sy = 1 / squash;
        return (
          <g key={s} transform={`translate(${x} ${FLOOR}) scale(${squash.toFixed(4)} ${sy.toFixed(4)}) translate(${-x} ${-FLOOR})`}>
            {items.map((c) => {
              let yy = FLOOR - TH - RY - c.j * TH * (1 - col);
              let o = 1;
              if (c.t0 >= 0) {
                const f = clamp((p - c.t0) / FALL);
                yy -= 220 * (1 - f * f);
                o = clamp(f / 0.35);
              }
              const dx = c.dx * (1 - col);
              const g = Math.exp(-Math.pow((c.j - (glintPos * (COUNTS[s] + 3) - 1.5 - s * 0.6)) / 1.1, 2)) * (glintPos > 0 && glintPos < 1 ? 1 : 0);
                            return (
                <g key={c.j} opacity={o >= 1 ? undefined : o}>
                  <SideCoin x={x + dx} y={yy} glint={g} top />
                </g>
              );
            })}
          </g>
        );
      })}
      {/* kilau */}
      <Sparkle x={1305 + 110} y={FLOOR - TH * 10 - 40} r={26 * hold * (0.8 + 0.2 * wave(p, 4))} color={C.yellow} rot={15} />
      <Sparkle x={1075 + 120} y={FLOOR - TH * 7 - 20} r={16 * hold * (0.75 + 0.25 * wave(p, 4, 0.5))} color={C.yellow} />
      <Sparkle x={1450 + 80} y={220 + 70} r={18 * head * (0.8 + 0.2 * wave(p, 3, 0.3))} color={C.green} rot={10} />
      <Sparkle x={460} y={FLOOR - 110} r={14 * (0.6 + 0.4 * wave01(p, 2))} color={C.yellow} rot={20} />
      <Sparkle x={700} y={FLOOR - 340} r={11 * (0.6 + 0.4 * wave01(p, 2, 0.5))} color={C.sky} />
    </g>
  );
};
