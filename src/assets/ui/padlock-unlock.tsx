// Gembok: lubang kunci menyala + goyang → gembok terbuka (belenggu terangkat) → tahan → menutup dengan bunyi "klik" (squash + garis benturan) → lencana centang aman.
import React from 'react';
import {TAU, clamp, inOut, mod, out, outBack, pop, seg, wave, yoyo} from '../../kit/loop';
import {C, blend, shade} from '../../kit/palette';
import {Shadow, Sparkle} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'ui-padlock-unlock',
  theme: 'ui',
  title: 'Padlock unlocking and locking with glowing keyhole and security check badge, flat icon animation, seamless loop with alpha channel',
  keywords: [
    'padlock',
    'lock',
    'unlock',
    'security',
    'privacy',
    'protection',
    'password',
    'safe',
    'secure',
    'cyber security',
    'encryption',
    'access',
    'login',
    'data protection',
    'keyhole',
    'locked',
    'unlocked',
    'verified',
    'checkmark',
    'icon',
    'ui',
    'user interface',
    'app',
    'web',
    'technology',
    'purple',
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
    'gdpr',
  ],
  category: 19,
  seconds: 8,
  vectorP: 0.82,
};

const CX = 960;
const B = {x: 756, y: 486, w: 408, h: 316, r: 54};
const LEG_L = 846;
const LEG_R = 1074;
const ARC_Y = 404;
const SH_R = (LEG_R - LEG_L) / 2;
const SHACKLE = `M${LEG_L},${B.y + 40} L${LEG_L},${ARC_Y} A${SH_R},${SH_R} 0 0 1 ${LEG_R},${ARC_Y} L${LEG_R},${B.y + 40}`;
const HL = `M${LEG_L - 12},${B.y - 30} L${LEG_L - 12},${ARC_Y} A${SH_R + 12},${SH_R + 12} 0 0 1 ${CX - 30},${ARC_Y - SH_R - 4}`;
const KEY_Y = 616;
const SLAM = 0.68;

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  const glowK = vector ? 0 : yoyo(p, 0.08, 0.14, SLAM - 0.02, SLAM + 0.02, inOut, inOut);
  const wig = vector ? 0 : 3 * Math.sin(TAU * 2 * seg(p, 0.1, 0.17, (t) => t)) * Math.sin(Math.PI * seg(p, 0.1, 0.17, (t) => t));
  // belenggu: naik (terbuka) lalu turun cepat (dibanting)
  let lift = 0;
  if (!vector) {
    if (p >= 0.17 && p < 0.6)
      lift =
        96 *
        outBack(
          seg(p, 0.17, 0.27, (t) => t),
          2.2,
        );
    else if (p >= 0.6 && p < SLAM)
      lift =
        96 *
        (1 -
          Math.pow(
            seg(p, 0.6, SLAM, (t) => t),
            2.4,
          ));
  }
  const openHold = vector ? 0 : yoyo(p, 0.27, 0.32, 0.56, 0.6);
  lift += 6 * openHold * wave(p, 4);
  const squash = vector ? 1 : pop(p, SLAM, 0.07, 0.07) * pop(p, 0.17, 0.06, -0.04);
  const impact = vector ? 0.5 : (p - SLAM) / 0.12;
  const badge = vector ? 1 : yoyo(p, SLAM + 0.03, SLAM + 0.11, 0.9, 0.96, (t) => outBack(t, 2.2), inOut);
  const sparkleOpen = vector ? 0 : yoyo(p, 0.2, 0.28, 0.54, 0.6, out, inOut);
  const sparkleLock = vector ? 1 : yoyo(p, SLAM + 0.04, SLAM + 0.12, 0.88, 0.95, out, inOut);
  const sparkle = Math.max(sparkleOpen, sparkleLock);
  const breath = 1 + 0.012 * wave(p, 2);
  const keyCol = blend(C.navy, C.yellow, glowK);

  return (
    <g>
      <Shadow cx={CX} cy={850} rx={260} ry={26} vector={vector} />
      <g
        transform={`rotate(${wig.toFixed(3)} ${CX} ${B.y + B.h}) translate(${CX} ${B.y + B.h + 18}) scale(${((1 / squash) * breath).toFixed(4)} ${(squash * breath).toFixed(4)}) translate(${-CX} ${-(B.y + B.h + 18)})`}
      >
        {/* belenggu (di belakang badan) */}
        <g transform={`translate(0 ${(-lift).toFixed(2)})`}>
          <path d={SHACKLE} fill="none" stroke={shade(C.steel, -0.12)} strokeWidth={58} strokeLinecap="round" strokeLinejoin="round" />
          <path d={SHACKLE} fill="none" stroke={C.steel} strokeWidth={58} strokeLinecap="round" strokeLinejoin="round" transform="translate(-6 -4)" />
          <path d={HL} fill="none" stroke={shade(C.steel, 0.45)} strokeWidth={12} strokeLinecap="round" />
        </g>
        {/* badan */}
        <rect x={B.x} y={B.y + 20} width={B.w} height={B.h} rx={B.r} fill={shade(C.purple, -0.28)} />
        <rect x={B.x} y={B.y} width={B.w} height={B.h} rx={B.r} fill={C.purple} />
        <rect x={B.x + B.w - 92} y={B.y} width={92} height={B.h} rx={B.r} fill={shade(C.purple, -0.12)} />
        <rect x={B.x + B.w - 92} y={B.y} width={44} height={B.h} fill={shade(C.purple, -0.12)} />
        <rect x={B.x + B.w - 92} y={B.y} width={20} height={B.h} fill={C.purple} />
        <rect x={B.x} y={B.y} width={B.w} height={34} rx={17} fill={shade(C.purple, 0.16)} />
        <rect x={B.x + 18} y={B.y + 68} width={16} height={120} rx={8} fill={shade(C.purple, 0.4)} />
        <circle cx={B.x + 26} cy={B.y + 216} r={8} fill={shade(C.purple, 0.4)} />
        {/* lubang kunci */}
        {/* denyut cincin di sekitar lubang kunci (motion saja) */}
        {!vector && glowK > 0.02
          ? [0, 0.5].map((off, i) => {
              const t = mod(p * 5 + off, 1);
              const a = glowK * (1 - t);
              return (
                <circle
                  key={i}
                  cx={CX}
                  cy={KEY_Y + 30}
                  r={98 + 52 * out(t)}
                  fill="none"
                  stroke={shade(C.yellow, 0.2)}
                  strokeWidth={10 * (1 - t) + 2}
                  opacity={a * 0.8}
                />
              );
            })
          : null}
        <circle cx={CX} cy={KEY_Y} r={44} fill={keyCol} />
        <path
          d={`M${CX - 20},${KEY_Y + 20} L${CX + 20},${KEY_Y + 20} L${CX + 28},${KEY_Y + 104} Q${CX + 29},${KEY_Y + 118} ${CX + 15},${KEY_Y + 118} L${CX - 15},${KEY_Y + 118} Q${CX - 29},${KEY_Y + 118} ${CX - 28},${KEY_Y + 104} Z`}
          fill={keyCol}
        />
        <circle cx={CX - 14} cy={KEY_Y - 14} r={10} fill={blend(shade(C.navy, 0.25), shade(C.yellow, 0.6), glowK)} />
      </g>
      {/* garis benturan saat terkunci */}
      {impact > 0 && impact < 1
        ? [-1, 1].map((side) =>
            [0, 1, 2].map((j) => {
              const ang = (side < 0 ? 180 : 0) + side * (-35 + j * 30);
              const a = (ang * Math.PI) / 180;
              const ox = side < 0 ? B.x + 10 : B.x + B.w - 10;
              const oy = B.y + 6;
              const e = out(clamp(impact * 1.3));
              const r0 = 30 + 40 * e;
              const len = 44 * (1 - e) + 6;
              const o = vector ? 1 : 1 - seg(impact, 0.5, 1);
              return (
                <line
                  key={`${side}${j}`}
                  x1={(ox + r0 * Math.cos(a)).toFixed(1)}
                  y1={(oy - r0 * Math.sin(a)).toFixed(1)}
                  x2={(ox + (r0 + len) * Math.cos(a)).toFixed(1)}
                  y2={(oy - (r0 + len) * Math.sin(a)).toFixed(1)}
                  stroke={C.yellow}
                  strokeWidth={12}
                  strokeLinecap="round"
                  opacity={o >= 1 ? undefined : o}
                />
              );
            }),
          )
        : null}
      {/* lencana aman */}
      {badge > 0.01 ? (
        <g transform={`translate(${B.x + B.w - 6} ${B.y + B.h - 10}) scale(${badge.toFixed(4)})`}>
          <circle r={70} fill={C.white} />
          <circle r={56} fill={C.green} />
          <path d="M56,0 A56,56 0 0 1 -40,39 A66,66 0 0 0 56,0 Z" fill={shade(C.green, -0.14)} />
          <path d="M-24,2 L-7,19 L26,-16" fill="none" stroke={C.white} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ) : null}
      <Sparkle x={1300} y={300} r={26 * sparkle * (0.8 + 0.2 * wave(p, 4))} color={C.yellow} rot={15} />
      <Sparkle x={624} y={360} r={18 * sparkle * (0.8 + 0.2 * wave(p, 4, 0.5))} color={C.violet} />
      <Sparkle x={640} y={720} r={13 * sparkle * (0.75 + 0.25 * wave(p, 3, 0.2))} color={C.green} rot={30} />
    </g>
  );
};
