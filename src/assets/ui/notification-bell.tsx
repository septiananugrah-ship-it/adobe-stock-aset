// Lonceng notifikasi: antisipasi → berayun berdering (gelombang suara) → badge muncul → tenang → kembali.
import React from 'react';
import {TAU, clamp, inOut, out, outBack, seg, wave, wave01, yoyo} from '../../kit/loop';
import {C, shade} from '../../kit/palette';
import {Shadow, Sparkle} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'ui-notification-bell',
  theme: 'ui',
  title: 'Notification bell ringing with red alert badge, flat icon animation, seamless loop with alpha channel',
  keywords: [
    'notification',
    'bell',
    'notification bell',
    'alert',
    'badge',
    'ringing',
    'reminder',
    'new message',
    'icon',
    'ui',
    'user interface',
    'app',
    'mobile app',
    'social media',
    'subscribe',
    'alarm',
    'inbox',
    'update',
    'web',
    'button',
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
    'interface',
    'yellow',
    'ux',
    'digital',
    'sound',
  ],
  category: 19,
  seconds: 8,
  vectorP: 0.3,
};

const CX = 960;
const PIV = {x: CX, y: 236}; // titik gantung (atas kenop)
const BODY = 'M716,648 C764,632 792,604 792,560 L792,470 C792,358 864,282 960,282 C1056,282 1128,358 1128,470 L1128,560 C1128,604 1156,632 1204,648 Z';
const SIDE =
  'M1012,292 C1084,316 1128,384 1128,470 L1128,560 C1128,604 1156,632 1204,648 L1080,648 C1090,616 1086,582 1086,548 L1086,470 C1086,392 1062,332 1012,292 Z';
const RING_T = [0.1, 0.5];

/** Sudut ayunan (derajat) saat berdering: osilasi teredam. */
const swingAt = (p: number) => {
  const u = (p - RING_T[0]) / (RING_T[1] - RING_T[0]);
  if (u <= 0 || u >= 1) return 0;
  const env = inOut(clamp(u / 0.1)) * Math.pow(1 - u, 1.6);
  return 18 * env * Math.sin(TAU * 5.5 * u);
};

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  const ringU = clamp((p - RING_T[0]) / (RING_T[1] - RING_T[0]));
  const env = ringU > 0 && ringU < 1 ? inOut(clamp(ringU / 0.08)) * Math.pow(1 - ringU, 1.2) : 0;
  // antisipasi: lonceng sedikit tertekan sebelum berayun
  const anti = Math.sin(Math.PI * seg(p, 0.05, 0.12, inOut));
  const idle = 1.6 * wave(p, 2);
  const ang = vector ? -9 : swingAt(p) + idle;
  // pemukul tertinggal dari badan lonceng
  const clap = vector ? 7 : -0.55 * swingAt(p - 0.022) - 0.4 * idle;
  const breath = 1 + 0.014 * wave(p, 2, 0.25);
  const badge = vector ? 1 : yoyo(p, 0.16, 0.25, 0.82, 0.9, (t) => outBack(t, 2.4), inOut);
  const badgePop = vector ? 1 : 1 + 0.06 * wave(p, 4) * seg(p, 0.3, 0.36) * (1 - seg(p, 0.76, 0.82));
  const sparkle = vector ? 1 : yoyo(p, 0.2, 0.3, 0.74, 0.84, out, inOut);
  const sy = 1 - 0.05 * anti;
  const sx = 1 + 0.03 * anti;
  return (
    <g>
      <Shadow cx={CX} cy={858} rx={230 - Math.abs(ang) * 2.2} ry={24} vector={vector} />
      {/* gelombang suara di kedua sisi */}
      {[-1, 1].map((side) =>
        [0, 1].map((i) => {
          const r = 330 + i * 70;
          const a = vector ? 1 : clamp(env * 1.6) * (0.55 + 0.45 * wave01(p, 10, -i * 0.25));
          if (a <= 0.01) return null;
          const grow = vector ? 0 : 14 * wave01(p, 10, -i * 0.25);
          const rr = r + grow;
          const a0 = (side > 0 ? 90 : -90) - 22;
          const a1 = (side > 0 ? 90 : -90) + 22;
          const pt = (deg: number) => [CX + rr * Math.sin((deg * Math.PI) / 180), 470 - rr * Math.cos((deg * Math.PI) / 180)];
          const [x0, y0] = pt(a0);
          const [x1, y1] = pt(a1);
          return (
            <path
              key={`${side}${i}`}
              d={`M${x0.toFixed(1)},${y0.toFixed(1)} A${rr.toFixed(1)},${rr.toFixed(1)} 0 0 1 ${x1.toFixed(1)},${y1.toFixed(1)}`}
              fill="none"
              stroke={i ? shade(C.yellow, -0.08) : C.yellow}
              strokeWidth={i ? 11 : 14}
              strokeLinecap="round"
              opacity={a >= 1 ? undefined : a}
            />
          );
        }),
      )}
      <g transform={`rotate(${ang.toFixed(3)} ${PIV.x} ${PIV.y})`}>
        <g transform={`translate(${CX} 690) scale(${(sx * breath).toFixed(4)} ${(sy * breath).toFixed(4)}) translate(${-CX} -690)`}>
          {/* pemukul */}
          <g transform={`rotate(${clap.toFixed(3)} ${CX} 600)`}>
            <rect x={CX - 9} y={600} width={18} height={92} rx={9} fill={shade(C.yellow, -0.32)} />
            <circle cx={CX} cy={716} r={42} fill={shade(C.yellow, -0.18)} />
            <path d={`M${CX + 42},716 A42,42 0 0 1 ${CX - 28},747 A50,50 0 0 0 ${CX + 42},716 Z`} fill={shade(C.yellow, -0.3)} />
            <circle cx={CX - 14} cy={702} r={9} fill={shade(C.yellow, 0.4)} />
          </g>
          {/* kenop atas */}
          <rect x={CX - 30} y={234} width={60} height={64} rx={26} fill={shade(C.yellow, -0.16)} />
          <rect x={CX - 18} y={244} width={14} height={30} rx={7} fill={shade(C.yellow, 0.3)} />
          {/* badan */}
          <path d={BODY} fill={C.yellow} />
          <path d={SIDE} fill={shade(C.yellow, -0.14)} />
          <path d="M846,520 L846,470 C846,412 864,370 896,338" fill="none" stroke={shade(C.yellow, 0.5)} strokeWidth={16} strokeLinecap="round" />
          <circle cx={846} cy={566} r={9} fill={shade(C.yellow, 0.5)} />
          {/* bibir lonceng */}
          <rect x={692} y={632} width={536} height={56} rx={28} fill={shade(C.yellow, -0.1)} />
          <rect x={692} y={660} width={536} height={28} rx={14} fill={shade(C.yellow, -0.24)} />
          <rect x={724} y={642} width={150} height={12} rx={6} fill={shade(C.yellow, 0.36)} />
          {/* badge notifikasi */}
          {badge > 0.01 ? (
            <g transform={`translate(1112 330) scale(${(badge * badgePop).toFixed(4)})`}>
              {!vector ? (
                <circle r={78 + 30 * seg((p % 0.25) / 0.25, 0, 1, out)} fill={C.coral} opacity={0.22 * (1 - seg((p % 0.25) / 0.25, 0, 1)) * clamp(badge)} />
              ) : null}
              <circle r={84} fill={C.white} />
              <circle r={66} fill={C.coral} />
              <path d="M66,0 A66,66 0 0 1 -46,47 A78,78 0 0 0 66,0 Z" fill={shade(C.coral, -0.16)} />
              <path d="M-40,-18 A44,44 0 0 1 -12,-42" fill="none" stroke={shade(C.coral, 0.45)} strokeWidth={12} strokeLinecap="round" />
            </g>
          ) : null}
        </g>
      </g>
      <Sparkle x={1290} y={262} r={24 * sparkle * (0.8 + 0.2 * wave(p, 4))} color={C.yellow} rot={15} />
      <Sparkle x={636} y={330} r={18 * sparkle * (0.8 + 0.2 * wave(p, 4, 0.5))} color={C.coral} />
      <Sparkle x={1312} y={690} r={14 * sparkle * (0.75 + 0.25 * wave(p, 3, 0.2))} color={C.sky} rot={30} />
    </g>
  );
};
