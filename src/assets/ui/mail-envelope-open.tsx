// Amplop surat: bergoyang (antisipasi) → tutup terbuka → surat naik keluar, baris-baris tergambar, hati kecil melayang → surat masuk, tutup menutup.
import React from 'react';
import {TAU, clamp, inOut, out, outBack, seg, wave, yoyo} from '../../kit/loop';
import {C, shade} from '../../kit/palette';
import {Shadow, Sparkle, roundedPath} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'ui-mail-envelope-open',
  theme: 'ui',
  title: 'Envelope opening with letter sliding out and floating hearts, new message flat icon animation, seamless loop with alpha channel',
  keywords: [
    'envelope',
    'email',
    'mail',
    'letter',
    'new message',
    'inbox',
    'open',
    'message',
    'notification',
    'newsletter',
    'communication',
    'contact',
    'send',
    'receive',
    'postal',
    'correspondence',
    'love letter',
    'invitation',
    'icon',
    'animated icon',
    'ui animation',
    'email icon',
    'ui',
    'user interface',
    'app',
    'web',
    'subscribe',
    'email marketing',
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
    'social media',
    'digital',
  ],
  category: 19,
  seconds: 8,
  vectorP: 0.55,
};

const CX = 960;
const EW = 580;
const EH = 372;
const X0 = CX - EW / 2;
const X1 = CX + EW / 2;
const Y0 = 488;
const Y1 = Y0 + EH;
const VY = Y0 + 0.56 * EH; // ujung V saku depan
const FY = Y0 + 0.6 * EH; // ujung tutup
const LW = 470;
const LH = 420;

const HEART =
  'M0,0.92 C-0.55,0.55 -1,0.15 -1,-0.3 C-1,-0.68 -0.72,-0.95 -0.48,-0.95 C-0.24,-0.95 -0.08,-0.82 0,-0.62 C0.08,-0.82 0.24,-0.95 0.48,-0.95 C0.72,-0.95 1,-0.68 1,-0.3 C1,0.15 0.55,0.55 0,0.92 Z';
const heart = (k: number) => HEART.replace(/-?\d*\.?\d+/g, (m) => (Number(m) * k).toFixed(2));

const POCKET = roundedPath(
  [
    [X0, Y0],
    [CX, VY],
    [X1, Y0],
    [X1, Y1],
    [X0, Y1],
  ],
  26,
);
const BOTTOM = roundedPath(
  [
    [X0, Y1],
    [CX, Y0 + 0.5 * EH],
    [X1, Y1],
  ],
  26,
);
const FLAP = roundedPath(
  [
    [X0, Y0],
    [X1, Y0],
    [CX, FY],
  ],
  26,
);
const LINES = [
  {x: 104, y: 46, w: 170, h: 18},
  {x: 104, y: 80, w: 112, h: 18},
  {x: 40, y: 140, w: 390, h: 16},
  {x: 40, y: 176, w: 350, h: 16},
  {x: 40, y: 212, w: 372, h: 16},
  {x: 40, y: 248, w: 240, h: 16},
];
const POPS = [
  {x: -330, y: -40, s: 34, col: C.coral, d: 0.0},
  {x: 340, y: -110, s: 28, col: C.pink, d: 0.03},
  {x: 380, y: 50, s: 24, col: C.yellow, d: 0.06},
];

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  const wig = vector ? 0 : 3.2 * Math.sin(TAU * 2 * seg(p, 0.07, 0.15, (t) => t)) * Math.sin(Math.PI * seg(p, 0.07, 0.15, (t) => t));
  const open = vector ? 1 : yoyo(p, 0.14, 0.24, 0.82, 0.9, inOut, inOut);
  const sy = 1 - 2 * open; // 1 tertutup, −1 terbuka
  const rise = vector ? 1 : yoyo(p, 0.22, 0.36, 0.72, 0.82, (t) => outBack(t, 1.5), inOut);
  const float = vector ? 0 : 8 * wave(p, 2);
  const hold = vector ? 1 : yoyo(p, 0.36, 0.42, 0.7, 0.76);
  const letterBob = vector ? 0 : 7 * hold * wave(p, 3, 0.1);
  const LY = Y0 + 26 - 320 * rise + letterBob; // puncak surat
  const LX = CX - LW / 2;
  const sealS = vector ? 0 : p < 0.5 ? 1 - seg(p, 0.12, 0.16, inOut) : seg(p, 0.88, 0.95, (t) => outBack(t, 2.2));
  const sparkle = vector ? 1 : yoyo(p, 0.32, 0.42, 0.7, 0.8, out, inOut);

  const flapPath = (inner: boolean) => (
    <g transform={`translate(0 ${Y0}) scale(1 ${sy.toFixed(4)}) translate(0 ${-Y0})`}>
      <path d={FLAP} fill={inner ? shade(C.blue, -0.3) : shade(C.blue, 0.14)} />
      {!inner ? <path d={`M${X0 + 70},${Y0 + 34} L${X0 + 170},${Y0 + 96}`} stroke={shade(C.blue, 0.45)} strokeWidth={13} strokeLinecap="round" /> : null}
    </g>
  );

  return (
    <g>
      <Shadow cx={CX} cy={912} rx={330} ry={28} s={1 - float / 200} vector={vector} />
      <g transform={`translate(0 ${float.toFixed(2)}) rotate(${wig.toFixed(3)} ${CX} ${Y1})`}>
        {/* panel belakang (bagian dalam) */}
        <rect x={X0} y={Y0} width={EW} height={EH} rx={26} fill={shade(C.blue, -0.22)} />
        {sy < 0 ? flapPath(true) : null}
        {/* surat */}
        {!vector ? (
          <clipPath id="ui-mail-envelope-open-clip">
            <rect x={X0} y={0} width={EW} height={Y1 - 16} />
          </clipPath>
        ) : null}
        <g clipPath={vector ? undefined : 'url(#ui-mail-envelope-open-clip)'}>
          <g transform={`translate(${LX} ${LY.toFixed(2)})`}>
            {/* tepi kertas abu-biru tipis agar surat tetap terbaca di latar putih */}
            <rect x={0} y={0} width={LW} height={LH} rx={22} fill={shade(C.mist, 0.3)} />
            <rect x={7} y={7} width={LW - 14} height={LH - 14} rx={16} fill={C.white} />
            {LINES.map((l, i) => {
              const k = vector ? 1 : yoyo(p, 0.32 + i * 0.03, 0.42 + i * 0.03, 0.7, 0.76, out, inOut);
              if (k <= 0.01) return null;
              return (
                <rect
                  key={i}
                  x={l.x}
                  y={l.y}
                  width={Math.max(l.h, l.w * k)}
                  height={l.h}
                  rx={l.h / 2}
                  fill={i < 2 ? shade(C.mist, -0.1) : C.mist}
                  opacity={vector || k > 0.2 ? undefined : k * 5}
                />
              );
            })}
            {(() => {
              const k = vector ? 1 : yoyo(p, 0.3, 0.38, 0.72, 0.78, (t) => outBack(t, 2.2), inOut);
              if (k <= 0.01) return null;
              return (
                <g transform={`translate(62 64) scale(${k.toFixed(4)})`}>
                  <circle r={34} fill={C.coral} />
                  <path d={heart(15)} fill={C.white} transform="translate(0 3)" />
                </g>
              );
            })()}
          </g>
        </g>
        {/* saku depan */}
        <path d={POCKET} fill={C.blue} />
        <path d={BOTTOM} fill={shade(C.blue, 0.08)} />
        <path d={`M${X0 + 26},${Y0 + 70} L${X0 + 26},${Y0 + 150}`} stroke={shade(C.blue, 0.4)} strokeWidth={12} strokeLinecap="round" />
        {sy >= 0 ? flapPath(false) : null}
        {/* segel hati */}
        {sealS > 0.01 ? (
          <g transform={`translate(${CX} ${FY - 34}) scale(${sealS.toFixed(4)})`}>
            <circle r={50} fill={C.coral} />
            <path d="M50,0 A50,50 0 0 1 -35,36 A58,58 0 0 0 50,0 Z" fill={shade(C.coral, -0.15)} />
            <path d={heart(21)} fill={C.white} transform="translate(0 3)" />
          </g>
        ) : null}
      </g>
      {/* hati kecil yang keluar */}
      {POPS.map((h, i) => {
        const t = vector ? 0.55 : (p - 0.3 - h.d) / 0.4;
        if (t <= 0 || t >= 1) return null;
        const sc = vector ? 1 : outBack(clamp(t / 0.2), 2.2) * (1 - seg(t, 0.8, 1));
        const y = 520 + h.y - 60 * out(t);
        return (
          <g key={i} transform={`translate(${CX + h.x} ${y.toFixed(1)}) rotate(${(h.x > 0 ? 14 : -14) + 6 * Math.sin(TAU * t)}) scale(${sc.toFixed(4)})`}>
            <path d={heart(h.s)} fill={h.col} />
          </g>
        );
      })}
      <Sparkle x={CX + 380} y={300} r={24 * sparkle * (0.8 + 0.2 * wave(p, 4))} color={C.yellow} rot={15} />
      <Sparkle x={CX - 390} y={330} r={18 * sparkle * (0.8 + 0.2 * wave(p, 4, 0.5))} color={C.sky} />
    </g>
  );
};
