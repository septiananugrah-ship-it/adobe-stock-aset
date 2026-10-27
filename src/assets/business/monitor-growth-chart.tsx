// Monitor dengan grafik batang + garis yang tumbuh, bertahan, lalu surut (loop bolak-balik).
import React from 'react';
import {inOut, outBack, seg, wave, wave01, yoyo} from '../../kit/loop';
import {C, blend, shade} from '../../kit/palette';
import {Shadow, Sparkle} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'business-monitor-growth-chart',
  theme: 'business',
  title: 'Computer monitor with growing bar chart and line graph, business growth animation loop, flat design with alpha channel',
  keywords: [
    'growth chart', 'bar chart', 'line graph', 'business growth', 'monitor', 'computer', 'dashboard', 'analytics', 'statistics',
    'data', 'profit', 'increase', 'success', 'finance', 'report', 'presentation', 'infographic', 'flat design', 'animation',
    'motion graphics', 'seamless loop', 'looped', 'alpha channel', 'transparent background', 'isolated', 'icon', 'chart',
    'graph', 'investment', 'marketing', 'kpi', 'trend', 'upward', 'screen', 'technology', '4k',
  ],
  category: 3,
  seconds: 8,
  vectorP: 0.62,
};

// Geometri layar (desain 1920×1080)
const SCR = {x: 600, y: 230, w: 720, h: 430, r: 26};
const IN = {x: SCR.x + 22, y: SCR.y + 22, w: SCR.w - 44, h: SCR.h - 44};
const PLOT = {x: IN.x + 56, y: IN.y + 50, w: IN.w - 112, h: IN.h - 120};
const BASE_Y = PLOT.y + PLOT.h;
const SCREEN = blend(C.navy, C.blue, 0.17);
const BARS = [0.28, 0.42, 0.36, 0.58, 0.52, 0.74, 0.9];
const LINE = [0.2, 0.34, 0.3, 0.5, 0.46, 0.68, 0.86];

/** Batang dengan sudut atas membulat dan dasar rata (duduk di garis dasar). rightOnly: hanya sudut kanan atas. */
const topRound = (x: number, y: number, w: number, h: number, r: number, rightOnly = false) => {
  const rl = rightOnly ? 0 : r;
  return `M${x},${y + h} L${x},${y + rl} Q${x},${y} ${x + rl},${y} L${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r} L${x + w},${y + h} Z`;
};

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  const n = BARS.length;
  const slot = PLOT.w / n;
  const bw = slot * 0.5;
  // kapan tiap batang tumbuh / surut (bertingkat)
  const barK = BARS.map((_, i) => yoyo(p, 0.06 + i * 0.035, 0.2 + i * 0.035, 0.8 + i * 0.012, 0.9 + i * 0.012, (t) => outBack(t, 1.4), inOut));
  const draw = yoyo(p, 0.3, 0.52, 0.76, 0.86, inOut, inOut);
  const pts = LINE.map((v, i) => [PLOT.x + slot * (i + 0.5), BASE_Y - v * PLOT.h] as [number, number]);
  const segLen = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]));
  const total = segLen.reduce((a, b) => a + b, 0);
  const shown = total * draw;
  // titik muncul saat garis melewatinya
  let acc = 0;
  const reach = pts.map((_, i) => {
    if (i > 0) acc += segLen[i - 1];
    return acc / total;
  });
  const idle = seg(p, 0.5, 0.56) * (1 - seg(p, 0.74, 0.78));
  const legend = yoyo(p, 0.04, 0.14, 0.88, 0.95);
  const badge = yoyo(p, 0.5, 0.58, 0.72, 0.78, (t) => outBack(t, 2));
  const glare = (p * 1.0) % 1;
  return (
    <g>
      <Shadow cx={960} cy={872} rx={300} ry={26} vector={vector} />
      {/* kaki & dasar */}
      <path d="M915,660 L1005,660 L1025,812 L895,812 Z" fill={C.mist} />
      <path d="M960,660 L1005,660 L1025,812 L960,812 Z" fill={shade(C.mist, -0.14)} />
      <rect x={810} y={798} width={300} height={36} rx={18} fill={shade(C.mist, -0.22)} />
      <rect x={810} y={798} width={300} height={24} rx={12} fill={C.mist} />
      <rect x={834} y={804} width={120} height={7} rx={3.5} fill={shade(C.mist, 0.5)} />
      {/* bingkai monitor dengan sisi tebal (kesan 3D) */}
      <rect x={SCR.x + 10} y={SCR.y + 12} width={SCR.w} height={SCR.h} rx={SCR.r} fill={shade(C.ink, -0.32)} />
      <rect x={SCR.x} y={SCR.y} width={SCR.w} height={SCR.h} rx={SCR.r} fill={C.ink} />
      <rect x={SCR.x + 30} y={SCR.y + 7} width={160} height={7} rx={3.5} fill={shade(C.ink, 0.3)} />
      <circle cx={SCR.x + SCR.w / 2} cy={SCR.y + 11} r={4.5} fill={shade(C.ink, 0.3)} />
      <rect x={IN.x} y={IN.y} width={IN.w} height={IN.h} rx={12} fill={SCREEN} />
      {/* kisi */}
      {Array.from({length: 5}, (_, i) => (
        <rect key={`h${i}`} x={PLOT.x} y={PLOT.y + (PLOT.h * i) / 4 - 1} width={PLOT.w} height={2} fill={blend(C.navy, C.blue, 0.32)} />
      ))}
      {Array.from({length: n + 1}, (_, i) => (
        <rect key={`v${i}`} x={PLOT.x + slot * i - 1} y={PLOT.y} width={2} height={PLOT.h} fill={blend(C.navy, C.blue, 0.27)} />
      ))}
      {/* batang */}
      {BARS.map((v, i) => {
        const breath = 1 + 0.025 * idle * wave(p, 3, i * 0.13);
        const h = Math.max(0, v * PLOT.h * barK[i] * breath);
        if (h < 1) return null;
        const x = PLOT.x + slot * (i + 0.5) - bw / 2;
        const col = i % 2 ? C.sky : C.blue;
        return (
          <g key={i}>
            <path d={topRound(x, BASE_Y - h, bw, h, Math.min(8, h / 2))} fill={col} />
            <path d={topRound(x + bw * 0.62, BASE_Y - h, bw * 0.38, h, Math.min(8, h / 2), true)} fill={shade(col, -0.14)} />
            <rect x={x + 6} y={BASE_Y - h + 6} width={6} height={Math.max(0, h - 16)} rx={3} fill={shade(col, 0.35)} />
          </g>
        );
      })}
      {/* garis tren */}
      {draw > 0.002 ? (
        <path
          d={pts.map((q, i) => `${i ? 'L' : 'M'}${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(' ')}
          fill="none"
          stroke={C.pink}
          strokeWidth={9}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={`${shown.toFixed(1)} ${(total + 10).toFixed(1)}`}
        />
      ) : null}
      {pts.map((q, i) => {
        const show = draw <= 0.001 ? 0 : outBack(Math.max(0, Math.min(1, (draw - reach[i]) / 0.07 + 1)), 2.2);
        if (show <= 0.01) return null;
        const pulse = i === n - 1 ? 1 + 0.12 * idle * wave01(p, 4) : 1;
        return (
          <g key={i} transform={`translate(${q[0]} ${q[1]}) scale(${show * pulse})`}>
            <circle r={17} fill={C.white} />
            <circle r={11} fill={C.yellow} />
          </g>
        );
      })}
      {/* lencana naik di titik terakhir */}
      {badge > 0.01 ? (
        <g transform={`translate(${SCR.x + SCR.w + 4} ${SCR.y - 26}) scale(${badge})`}>
          <path d="M-30,22 L-44,46 L-8,28 Z" fill={shade(C.green, -0.08)} />
          <rect x={-56} y={-36} width={112} height={72} rx={36} fill={C.green} />
          <path d="M-18,10 L0,-12 L18,10" fill="none" stroke={C.white} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ) : null}
      {/* legenda */}
      <g opacity={legend >= 1 ? undefined : legend}>
        <rect x={PLOT.x} y={BASE_Y + 30} width={72 * legend} height={12} rx={6} fill={C.sky} />
        <rect x={PLOT.x + 92} y={BASE_Y + 30} width={46 * legend} height={12} rx={6} fill={C.pink} />
        <rect x={PLOT.x + PLOT.w - 70} y={BASE_Y + 30} width={70 * legend} height={12} rx={6} fill={blend(C.navy, C.blue, 0.45)} />
      </g>
      {/* kilau kaca bergerak menyapu layar (periodik) */}
      {!vector ? (
        <g opacity={0.07 * Math.sin(Math.PI * glare)} clipPath="url(#clip-monitor-growth)">
          <clipPath id="clip-monitor-growth">
            <rect x={IN.x} y={IN.y} width={IN.w} height={IN.h} rx={12} />
          </clipPath>
          <path d={`M${IN.x + IN.w * (glare * 1.4 - 0.3)},${IN.y} l120,0 l-180,${IN.h} l-120,0 Z`} fill={C.white} />
        </g>
      ) : null}
      {/* kilau bintang saat puncak */}
      <Sparkle x={SCR.x + SCR.w + 96} y={SCR.y - 92} r={22 * badge * (0.8 + 0.2 * wave(p, 4))} color={C.yellow} rot={20} />
      <Sparkle x={SCR.x + SCR.w - 70} y={SCR.y - 64} r={13 * badge * (0.8 + 0.2 * wave(p, 4, 0.5))} color={C.sky} />
      <Sparkle x={SCR.x - 40} y={SCR.y + 70} r={16 * legend * (0.75 + 0.25 * wave(p, 2))} color={C.yellow} rot={10} />
    </g>
  );
};
