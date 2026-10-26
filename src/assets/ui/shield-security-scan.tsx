// Perisai keamanan: garis pindai menyapu dua kali → centang tergambar + pop + riak → cincin orbit pelindung dengan titik berputar → surut kembali.
import React from 'react';
import {TAU, clamp, inOut, mod, out, outBack, seg, wave, yoyo} from '../../kit/loop';
import {C, shade} from '../../kit/palette';
import {Glow, Shadow, Sparkle} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'ui-shield-security-scan',
  theme: 'ui',
  title: 'Security shield scanning then showing checkmark with orbiting protection ring, flat icon animation, seamless loop with alpha channel',
  keywords: [
    'shield',
    'security',
    'protection',
    'secure',
    'cyber security',
    'antivirus',
    'scan',
    'scanning',
    'safe',
    'verified',
    'checkmark',
    'privacy',
    'data protection',
    'firewall',
    'guard',
    'defense',
    'insurance',
    'trust',
    'icon',
    'ui',
    'user interface',
    'app',
    'web',
    'technology',
    'network',
    'blue',
    'flat design',
    'illustration',
    'animation',
    'motion graphics',
    'seamless loop',
    'looped',
    'alpha channel',
    'transparent background',
    'isolated',
    '4k',
    'explainer',
    'presentation',
    'digital',
    'ux',
  ],
  category: 19,
  seconds: 8,
  vectorP: 0.66,
};

const CX = 960;
const TOP = 236;
const BOT = 800;
const SH_D = `M960,${TOP} C1040,286 1120,300 1186,300 L1186,486 C1186,646 1082,746 960,${BOT} C838,746 734,646 734,486 L734,300 C800,300 880,286 960,${TOP} Z`;
const SH_R = `M960,${TOP} C1040,286 1120,300 1186,300 L1186,486 C1186,646 1082,746 960,${BOT} Z`;
const MID = 510; // pusat skala panel dalam
const IN_S = 0.78;
const CHECK: [number, number][] = [
  [-96, 4],
  [-30, 70],
  [100, -64],
];
const L1 = Math.hypot(CHECK[1][0] - CHECK[0][0], CHECK[1][1] - CHECK[0][1]);
const L2 = Math.hypot(CHECK[2][0] - CHECK[1][0], CHECK[2][1] - CHECK[1][1]);
const CHECK_D = `M${CHECK[0][0]},${CHECK[0][1]} L${CHECK[1][0]},${CHECK[1][1]} L${CHECK[2][0]},${CHECK[2][1]}`;
const ORB = {cx: CX, cy: 560, rx: 400, ry: 104, rot: -12};
const DONE = 0.44;

const kick = (p: number, a: number, w: number) => {
  const t = (p - a) / w;
  return t <= 0 || t >= 1 ? 0 : Math.sin(Math.PI * t) * (1 - t);
};

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  const scanK = vector ? 0 : seg(p, 0.06, 0.1) * (1 - seg(p, 0.4, 0.44));
  const scanY = TOP + (BOT - TOP) * (0.5 - 0.5 * Math.cos(TAU * 2 * seg(p, 0.08, 0.42, (t) => t)));
  const check = vector ? 1 : yoyo(p, DONE, DONE + 0.09, 0.84, 0.9, inOut, inOut);
  const orbit = vector ? 1 : yoyo(p, DONE + 0.04, DONE + 0.12, 0.82, 0.9, out, inOut);
  const land = vector ? 0 : kick(p, DONE + 0.05, 0.12);
  const breath = vector ? 1 : 1 + 0.012 * wave(p, 2);
  const rip = vector ? -1 : (p - DONE - 0.06) / 0.18;
  const tw = (k: number, ph: number) => (vector ? 1 : 0.8 + 0.2 * wave(p, k, ph));
  const sc = breath * (1 + 0.06 * land);
  const col = C.blue;
  const drawn = (L1 + L2) * check;
  // cincin orbit: busur belakang & depan
  const ell = (a0: number, a1: number) => {
    const pt = (a: number) => [ORB.rx * Math.cos(a), ORB.ry * Math.sin(a)];
    const [x0, y0] = pt(a0);
    const [x1, y1] = pt(a1);
    return `M${x0.toFixed(1)},${y0.toFixed(1)} A${ORB.rx},${ORB.ry} 0 0 1 ${x1.toFixed(1)},${y1.toFixed(1)}`;
  };
  const spin = vector ? 0.08 : p * 2;
  const dots = [0, 1 / 3, 2 / 3].map((o, i) => {
    const a = TAU * mod(spin + o, 1);
    return {x: ORB.rx * Math.cos(a), y: ORB.ry * Math.sin(a), front: Math.sin(a) > 0, i};
  });
  const ringW = 12;
  const ringCol = C.sky;
  const Orbit = ({front}: {front: boolean}) =>
    orbit > 0.01 ? (
      <g
        transform={`translate(${ORB.cx} ${ORB.cy}) rotate(${ORB.rot}) scale(${(0.8 + 0.2 * orbit).toFixed(4)})`}
        opacity={orbit >= 1 ? undefined : orbit}
      >
        <path d={front ? ell(0, Math.PI) : ell(Math.PI, TAU)} fill="none" stroke={front ? ringCol : shade(ringCol, -0.18)} strokeWidth={ringW} strokeLinecap="round" />
        {dots
          .filter((d) => d.front === front)
          .map((d) => (
            <g key={d.i}>
              <circle cx={d.x} cy={d.y} r={d.i === 0 ? 24 : 17} fill={[C.yellow, C.green, C.sky][d.i]} />
              <circle cx={d.x - 6} cy={d.y - 6} r={d.i === 0 ? 7 : 5} fill={C.white} />
            </g>
          ))}
      </g>
    ) : null;
  return (
    <g>
      <Shadow cx={CX} cy={872} rx={260} ry={24} vector={vector} />
      <Glow cx={CX} cy={MID} r={380} color={C.sky} strength={orbit * 0.7} vector={vector} />
      {/* riak */}
      {rip > 0 && rip < 1
        ? [0, 0.22].map((d, j) => {
            const t = clamp((rip - d) / (1 - d));
            if (t <= 0) return null;
            const k = 1.08 + 0.32 * out(t);
            return (
              <path
                key={j}
                d={SH_D}
                fill="none"
                stroke={C.sky}
                strokeWidth={(12 * (1 - t) + 3) / k}
                strokeLinejoin="round"
                transform={`translate(${CX} ${MID}) scale(${k.toFixed(4)}) translate(${-CX} ${-MID})`}
                opacity={(1 - t) * 0.7}
              />
            );
          })
        : null}
      <Orbit front={false} />
      <g transform={`translate(${CX} ${BOT}) scale(${(sc * (1 + 0.02 * land)).toFixed(4)} ${(sc * (1 - 0.02 * land)).toFixed(4)}) translate(${-CX} ${-BOT})`}>
        <path d={SH_D} fill={shade(col, -0.28)} transform="translate(0 18)" />
        <path d={SH_D} fill={col} />
        <path d={SH_R} fill={shade(col, -0.12)} />
        <g transform={`translate(${CX} ${MID}) scale(${IN_S}) translate(${-CX} ${-MID})`}>
          <path d={SH_D} fill={shade(col, 0.2)} />
          <path d={SH_R} fill={shade(col, 0.1)} />
        </g>
        <path d="M790,500 L790,340 C830,336 872,326 912,306" fill="none" stroke={shade(col, 0.5)} strokeWidth={14} strokeLinecap="round" />
        {/* garis pindai (motion saja) */}
        {scanK > 0.01 ? (
          <g clipPath="url(#ui-shield-security-scan-clip)" opacity={scanK >= 1 ? undefined : scanK}>
            <clipPath id="ui-shield-security-scan-clip">
              <path d={SH_D} />
            </clipPath>
            {[0, 1, 2, 3].map((k) => (
              <rect key={k} x={700} y={scanY - 8 - k * 18 * Math.sign(Math.sin(TAU * 2 * seg(p, 0.08, 0.42, (t) => t)) || 1)} width={520} height={16} fill={C.white} opacity={[0.9, 0.35, 0.18, 0.08][k]} />
            ))}
            <rect x={700} y={scanY - 3} width={520} height={6} fill={shade(C.sky, 0.5)} />
          </g>
        ) : null}
        {/* centang */}
        {drawn > 1 ? (
          <g transform={`translate(${CX} ${MID - 6}) scale(${(vector ? 1 : 0.9 + 0.1 * outBack(clamp(check), 2)).toFixed(4)})`}>
            <path
              d={CHECK_D}
              transform="translate(5 9)"
              fill="none"
              stroke={shade(col, -0.22)}
              strokeWidth={46}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={`${drawn.toFixed(1)} ${L1 + L2 + 20}`}
            />
            <path
              d={CHECK_D}
              fill="none"
              stroke={C.white}
              strokeWidth={46}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={`${drawn.toFixed(1)} ${L1 + L2 + 20}`}
            />
          </g>
        ) : null}
      </g>
      <Orbit front />
      <Sparkle x={1300} y={268} r={28 * orbit * tw(4, 0)} color={C.yellow} rot={15} />
      <Sparkle x={620} y={330} r={20 * orbit * tw(4, 0.5)} color={C.sky} />
      <Sparkle x={1310} y={760} r={15 * orbit * tw(3, 0.2)} color={C.green} rot={30} />
    </g>
  );
};
