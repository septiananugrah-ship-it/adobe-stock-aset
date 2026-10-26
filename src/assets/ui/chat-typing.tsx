// Obrolan di ponsel: gelembung masuk mengetik (tiga titik) → berubah jadi pesan, gelembung balasan sama, reaksi hati, lalu mengetik lagi → semua surut.
import React from 'react';
import {TAU, clamp, inOut, mod, out, outBack, seg, wave, yoyo} from '../../kit/loop';
import {C, shade} from '../../kit/palette';
import {Shadow, Sparkle} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'ui-chat-typing',
  theme: 'ui',
  title: 'Smartphone chat conversation with typing indicator dots and message bubbles popping out, flat animation, seamless loop with alpha channel',
  keywords: [
    'chat',
    'typing',
    'message',
    'chat bubble',
    'speech bubble',
    'messenger',
    'conversation',
    'texting',
    'smartphone',
    'mobile phone',
    'typing indicator',
    'dots',
    'communication',
    'social media',
    'notification',
    'reply',
    'online chat',
    'customer support',
    'chatbot',
    'sms',
    'app',
    'icon',
    'animated icon',
    'ui animation',
    'chat icon',
    'ui',
    'user interface',
    'web',
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
    'dialogue',
  ],
  category: 19,
  seconds: 9,
  vectorP: 0.7,
};

const CX = 960;
const PH = {x: 792, y: 186, w: 336, h: 700, r: 54};
const SC = {x: PH.x + 16, y: PH.y + 16, w: PH.w - 32, h: PH.h - 32, r: 40};

type Bub = {
  side: -1 | 1; // −1 masuk (kiri), 1 balasan (kanan)
  ax: number; // x tepi berekor
  bottom: number;
  w: number;
  h: number;
  col: string;
  lines: number[];
  t0: number; // muncul
  t1: number; // berubah jadi pesan
  t2: number; // mulai surut
};

const TYPE_W = 186;
const TYPE_H = 92;
const BUBS: Bub[] = [
  {side: -1, ax: 632, bottom: 452, w: 388, h: 146, col: C.teal, lines: [290, 200], t0: 0.04, t1: 0.19, t2: 0.86},
  {side: 1, ax: 1288, bottom: 640, w: 388, h: 146, col: C.blue, lines: [300, 170], t0: 0.29, t1: 0.43, t2: 0.88},
  {side: -1, ax: 632, bottom: 776, w: TYPE_W, h: TYPE_H, col: C.teal, lines: [], t0: 0.6, t1: 2, t2: 0.9},
];

const Dots: React.FC<{p: number; col: string; still?: boolean}> = ({p, col, still}) => (
  <g>
    {[0, 1, 2].map((i) => {
      const t = mod(p * 13 - i * 0.14, 1);
      const y = still ? (i === 1 ? -9 : 0) : -10 * Math.max(0, Math.sin(TAU * t)) * (t < 0.5 ? 1 : 0);
      const c = still ? (i === 1 ? col : shade(col, -0.12)) : t < 0.5 ? col : shade(col, -0.12);
      return <circle key={i} cx={(i - 1) * 42} cy={y.toFixed(2)} r={14} fill={c} />;
    })}
  </g>
);

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  const breath = 1 + 0.01 * wave(p, 2);
  const heart = vector ? 1 : yoyo(p, 0.53, 0.61, 0.86, 0.91, (t) => outBack(t, 2.6), inOut);
  const sparkle = vector ? 1 : yoyo(p, 0.5, 0.6, 0.84, 0.92, out, inOut);
  return (
    <g>
      <Shadow cx={CX} cy={924} rx={260} ry={26} vector={vector} />
      {/* ponsel */}
      <g transform={`translate(${CX} ${PH.y + PH.h}) scale(${breath.toFixed(4)}) translate(${-CX} ${-(PH.y + PH.h)})`}>
        <rect x={PH.x + 10} y={PH.y + 12} width={PH.w} height={PH.h} rx={PH.r} fill={shade(C.navy, -0.25)} />
        <rect x={PH.x} y={PH.y} width={PH.w} height={PH.h} rx={PH.r} fill={C.navy} />
        <rect x={SC.x} y={SC.y} width={SC.w} height={SC.h} rx={SC.r} fill={C.cloud} />
        {/* kepala obrolan */}
        <path
          d={`M${SC.x},${SC.y + 96} L${SC.x},${SC.y + SC.r} Q${SC.x},${SC.y} ${SC.x + SC.r},${SC.y} L${SC.x + SC.w - SC.r},${SC.y} Q${SC.x + SC.w},${SC.y} ${SC.x + SC.w},${SC.y + SC.r} L${SC.x + SC.w},${SC.y + 96} Z`}
          fill={C.white}
        />
        <rect x={CX - 44} y={SC.y + 14} width={88} height={14} rx={7} fill={C.navy} />
        <circle cx={SC.x + 52} cy={SC.y + 62} r={22} fill={C.teal} />
        <circle cx={SC.x + 52} cy={SC.y + 56} r={8} fill={shade(C.teal, 0.55)} />
        <path d={`M${SC.x + 38},${SC.y + 77} Q${SC.x + 52},${SC.y + 62} ${SC.x + 66},${SC.y + 77} Z`} fill={shade(C.teal, 0.55)} />
        <rect x={SC.x + 88} y={SC.y + 50} width={110} height={12} rx={6} fill={C.mist} />
        <rect x={SC.x + 88} y={SC.y + 70} width={70} height={10} rx={5} fill={shade(C.teal, 0.45)} />
        {/* kolom ketik */}
        <rect x={SC.x + 20} y={SC.y + SC.h - 76} width={SC.w - 110} height={54} rx={27} fill={C.white} />
        <rect x={SC.x + 44} y={SC.y + SC.h - 55} width={80} height={12} rx={6} fill={C.mist} />
        <circle cx={SC.x + SC.w - 50} cy={SC.y + SC.h - 49} r={29} fill={C.blue} />
        <path
          d={`M${SC.x + SC.w - 61},${SC.y + SC.h - 49} L${SC.x + SC.w - 38},${SC.y + SC.h - 49} M${SC.x + SC.w - 48},${SC.y + SC.h - 60} L${SC.x + SC.w - 37},${SC.y + SC.h - 49} L${SC.x + SC.w - 48},${SC.y + SC.h - 38}`}
          fill="none"
          stroke={C.white}
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      {/* gelembung */}
      {BUBS.map((b, i) => {
        const vis = vector ? (i === 2 ? 1 : 1) : p < b.t2 ? seg(p, b.t0, b.t0 + 0.07, (t) => outBack(t, 2)) : 1 - seg(p, b.t2, b.t2 + 0.06, inOut);
        if (vis <= 0.005) return null;
        const m = vector ? (b.lines.length ? 1 : 0) : seg(p, b.t1, b.t1 + 0.07, (t) => outBack(t, 1.4));
        const w = TYPE_W + (b.w - TYPE_W) * m;
        const h = TYPE_H + (b.h - TYPE_H) * m;
        const x = b.side < 0 ? b.ax : b.ax - w;
        const y = b.bottom - h;
        const tail =
          b.side < 0
            ? `M${x + 10},${y + h - 56} Q${x + 2},${y + h + 4} ${x - 22},${y + h + 12} Q${x + 34},${y + h + 12} ${x + 64},${y + h - 4} Z`
            : `M${x + w - 10},${y + h - 56} Q${x + w - 2},${y + h + 4} ${x + w + 22},${y + h + 12} Q${x + w - 34},${y + h + 12} ${x + w - 64},${y + h - 4} Z`;
        const dotsO = vector ? (b.lines.length ? 0 : 1) : 1 - clamp(m * 3);
        return (
          <g key={i} transform={`translate(${b.ax} ${b.bottom}) scale(${vis.toFixed(4)}) translate(${-b.ax} ${-b.bottom})`}>
            <path d={tail} transform="translate(0 10)" fill={shade(b.col, -0.22)} />
            <rect x={x} y={y + 10} width={w} height={h} rx={Math.min(42, h / 2)} fill={shade(b.col, -0.22)} />
            <path d={tail} fill={b.col} />
            <rect x={x} y={y} width={w} height={h} rx={Math.min(42, h / 2)} fill={b.col} />
            <rect x={x + 32} y={y + 15} width={30 + (w * 0.22 - 30) * m} height={9} rx={4.5} fill={shade(b.col, 0.4)} />
            {dotsO > 0.01 ? (
              <g transform={`translate(${x + w / 2} ${y + h / 2 + 4})`} opacity={dotsO >= 1 ? undefined : dotsO}>
                <Dots p={p} col={shade(b.col, 0.62)} still={vector} />
              </g>
            ) : null}
            {b.lines.map((lw, j) => {
              const k = vector ? 1 : seg(p, b.t1 + 0.04 + j * 0.03, b.t1 + 0.12 + j * 0.03, out);
              if (k <= 0.01) return null;
              const lx = b.side < 0 ? x + 44 : x + w - 44 - lw;
              return (
                <rect
                  key={j}
                  x={b.side < 0 ? lx : lx + lw * (1 - k)}
                  y={y + 46 + j * 42}
                  width={Math.max(20, lw * k)}
                  height={20}
                  rx={10}
                  fill={shade(b.col, 0.7)}
                />
              );
            })}
          </g>
        );
      })}
      {/* reaksi hati di gelembung balasan */}
      {heart > 0.01 ? (
        <g transform={`translate(1270 ${640 - 146 - 6}) scale(${heart.toFixed(4)})`}>
          <circle r={40} fill={C.white} />
          <circle r={32} fill={C.coral} />
          <path
            d="M0,13 C-8,8 -15,2 -15,-5 C-15,-11 -11,-14 -7,-14 C-4,-14 -1,-12 0,-9 C1,-12 4,-14 7,-14 C11,-14 15,-11 15,-5 C15,2 8,8 0,13 Z"
            fill={C.white}
            transform="scale(1.2) translate(0 1)"
          />
        </g>
      ) : null}
      <Sparkle x={1330} y={330} r={24 * sparkle * (0.8 + 0.2 * wave(p, 4))} color={C.yellow} rot={15} />
      <Sparkle x={600} y={250} r={17 * sparkle * (0.8 + 0.2 * wave(p, 4, 0.5))} color={C.teal} />
      <Sparkle x={1260} y={790} r={13 * sparkle * (0.75 + 0.25 * wave(p, 3, 0.2))} color={C.blue} rot={30} />
    </g>
  );
};
