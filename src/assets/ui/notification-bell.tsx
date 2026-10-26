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
    'animated icon',
    'ui animation',
    'push notification',
    'alert icon',
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
// dua dering per loop: dering utama (lebar) lalu dering pengingat (lebih kecil)
const RINGS = [
  {a: 0.08, b: 0.4, amp: 15, cyc: 6.5},
  {a: 0.56, b: 0.72, amp: 8, cyc: 3.5},
];
const WAVE_C = {y: 400, r: [372, 442], span: 17};

/** Selubung dering (0..1): naik cepat, lalu meluruh. */
const envAt = (p: number, a: number, b: number) => {
  const u = (p - a) / (b - a);
  if (u <= 0 || u >= 1) return 0;
  return inOut(clamp(u / 0.15)) * Math.pow(1 - u, 1.5);
};

/** Sudut ayunan (derajat) saat berdering: osilasi teredam. */
const swingAt = (p: number) =>
  RINGS.reduce((acc, r) => {
    const u = (p - r.a) / (r.b - r.a);
    if (u <= 0 || u >= 1) return acc;
    return acc + r.amp * envAt(p, r.a, r.b) * Math.sin(TAU * r.cyc * u);
  }, 0);

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  // selubung gelombang suara: muncul lebih lembut daripada ayunan (tanpa kedip)
  const waveEnv = (r: (typeof RINGS)[number]) => {
    const u = (p - r.a) / (r.b - r.a);
    return u <= 0 || u >= 1 ? 0 : inOut(clamp(u / 0.22)) * Math.pow(1 - u, 1.3);
  };
  const env = Math.max(waveEnv(RINGS[0]), 0.8 * waveEnv(RINGS[1]));
  // antisipasi: lonceng sedikit tertekan sebelum berayun
  const anti = Math.sin(Math.PI * seg(p, 0.035, 0.09, inOut));
  const idle = 1.6 * wave(p, 2);
  const ang = vector ? -9 : swingAt(p) + idle;
  // pemukul tertinggal dari badan lonceng
  const clap = vector ? 7 : -0.6 * swingAt(p - 0.02) - 0.4 * idle;
  const breath = 1 + 0.014 * wave(p, 2, 0.25);
  const badge = vector ? 1 : yoyo(p, 0.14, 0.22, 0.84, 0.9, (t) => outBack(t, 2.4), inOut);
  const badgePop = vector ? 1 : 1 + 0.06 * wave(p, 4) * seg(p, 0.3, 0.36) * (1 - seg(p, 0.78, 0.84));
  const sparkle = vector ? 1 : yoyo(p, 0.2, 0.3, 0.76, 0.86, out, inOut);
  const sy = 1 - 0.05 * anti;
  const sx = 1 + 0.03 * anti;
  return (
    <g>
      <Shadow cx={CX} cy={858} rx={230 - Math.abs(ang) * 2.2} ry={24} vector={vector} />
      {/* gelombang suara di kedua sisi */}
      {[-1, 1].map((side) =>
        [0, 1].map((i) => {
          const r = WAVE_C.r[i];
          const a = vector ? 1 : clamp(env * 1.8) * (0.55 + 0.45 * wave01(p, 10, -i * 0.25));
          if (a <= 0.01) return null;
          const grow = vector ? 0 : 12 * wave01(p, 10, -i * 0.25);
          const rr = r + grow;
          const a0 = (side > 0 ? 90 : -90) - WAVE_C.span;
          const a1 = (side > 0 ? 90 : -90) + WAVE_C.span;
          const pt = (deg: number) => [CX + rr * Math.sin((deg * Math.PI) / 180), WAVE_C.y - rr * Math.cos((deg * Math.PI) / 180)];
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
      <Sparkle x={1262} y={196} r={24 * sparkle * (0.8 + 0.2 * wave(p, 4))} color={C.yellow} rot={15} />
      <Sparkle x={688} y={262} r={18 * sparkle * (0.8 + 0.2 * wave(p, 4, 0.5))} color={C.coral} />
      <Sparkle x={1312} y={690} r={14 * sparkle * (0.75 + 0.25 * wave(p, 3, 0.2))} color={C.sky} rot={30} />
    </g>
  );
};
