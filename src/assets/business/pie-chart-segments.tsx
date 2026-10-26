// Diagram pie: segmen tergambar memutar, lalu sedikit merenggang dan satu segmen menonjol keluar; legenda batang ikut tumbuh.
import React from 'react';
import {TAU, inOut, out, outBack, seg, wave, wave01, yoyo} from '../../kit/loop';
import {C, shade} from '../../kit/palette';
import {Shadow, Sparkle} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'business-pie-chart-segments',
  theme: 'business',
  title: 'Pie chart drawing itself with one segment popping out and growing legend bars, business data animation loop with alpha channel',
  keywords: [
    'pie chart', 'chart', 'infographic', 'statistics', 'data', 'analytics', 'market share', 'business', 'finance', 'report',
    'diagram', 'percentage', 'segment', 'budget', 'distribution', 'graph', 'dashboard', 'presentation', 'research',
    'marketing', 'accounting', 'economy', 'strategy', 'investment', 'results', 'icon', 'flat design', 'illustration',
    'explainer', 'social media', 'animation', 'motion graphics', 'seamless loop', 'looped', 'alpha channel',
    'transparent background', 'isolated', '4k', 'data visualization', 'corporate',
  ],
  category: 3,
  seconds: 8,
  vectorP: 0.6,
};

const CXP = 790;
const CYP = 520;
const R = 262;
const DEPTH = 24;
const VALS = [0.36, 0.22, 0.26, 0.16];
const COLS = [C.blue, C.sky, C.yellow, C.coral];
const HI = 2; // segmen yang menonjol
const STARTS = VALS.map((_, i) => VALS.slice(0, i).reduce((a, b) => a + b, 0));

/** Juring dari a0 ke a1 (rad, 0 = atas, searah jarum jam). */
const wedge = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  if (a1 - a0 >= TAU - 1e-4) return `M${cx},${cy - r} A${r},${r} 0 1 1 ${cx},${cy + r} A${r},${r} 0 1 1 ${cx},${cy - r} Z`;
  const x0 = cx + r * Math.sin(a0);
  const y0 = cy - r * Math.cos(a0);
  const x1 = cx + r * Math.sin(a1);
  const y1 = cy - r * Math.cos(a1);
  return `M${cx},${cy} L${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1.toFixed(2)},${y1.toFixed(2)} Z`;
};
const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const x0 = cx + r * Math.sin(a0);
  const y0 = cy - r * Math.cos(a0);
  const x1 = cx + r * Math.sin(a1);
  const y1 = cy - r * Math.cos(a1);
  return `M${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1.toFixed(2)},${y1.toFixed(2)}`;
};

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  const sweep = yoyo(p, 0.05, 0.3, 0.84, 0.95, inOut, inOut); // jejak gambar 0..1 keliling
  const spin = -100 * (1 - seg(p, 0.05, 0.34, out)) + 80 * seg(p, 0.84, 0.97, inOut); // derajat
  const gap = 13 * yoyo(p, 0.3, 0.38, 0.8, 0.86);
  const plate = 1 - yoyo(p, 0.27, 0.31, 0.8, 0.85);
  const popK = yoyo(p, 0.36, 0.46, 0.76, 0.83, (t) => outBack(t, 2.2), inOut);
  const idle = seg(p, 0.46, 0.52) * (1 - seg(p, 0.72, 0.77));
  const popD = 44 * popK + 7 * idle * wave(p, 3, 0.1);
  const breath = 1 + 0.012 * idle * wave(p, 3);
  const segs = VALS.map((v, i) => {
    const a0 = STARTS[i] * TAU;
    const a1 = Math.min((STARTS[i] + v) * TAU, sweep * TAU);
    const mid = (a0 + (STARTS[i] + v) * TAU) / 2 + (spin * Math.PI) / 180;
    const d = gap + (i === HI ? popD : 0);
    return {i, a0, a1, mid, d, s: i === HI ? 1 + 0.04 * popK : 1};
  });
  const rows = VALS.map((_, i) => yoyo(p, 0.14 + i * 0.04, 0.3 + i * 0.04, 0.82 + (3 - i) * 0.025, 0.9 + (3 - i) * 0.025, (t) => outBack(t, 1.2), inOut));
  const LX = 1158;
  const LY = 392;
  const LEN = [250, 170, 205, 130];
  return (
    <g>
      <Shadow cx={CXP + 10} cy={CYP + R + 82} rx={R * 1.05} ry={30} vector={vector} />
      {/* piring dasar (selalu tampak) */}
      {plate > 0.01 ? (
        <g transform={`translate(${CXP} ${CYP}) scale(${plate}) translate(${-CXP} ${-CYP})`}>
          <circle cx={CXP} cy={CYP + DEPTH} r={R} fill={shade(C.mist, -0.18)} />
          <circle cx={CXP} cy={CYP} r={R} fill={C.mist} />
          <circle cx={CXP} cy={CYP} r={R * 0.34} fill={shade(C.mist, 0.25)} />
        </g>
      ) : null}
      <g transform={`translate(${CXP} ${CYP}) scale(${breath}) translate(${-CXP} ${-CYP})`}>
        {/* tebal tiap segmen */}
        {segs.map(({i, a0, a1, mid, d, s}) =>
          a1 - a0 > 0.002 && s > 0.01 ? (
            <g key={`d${i}`} transform={`translate(${d * Math.sin(mid)} ${-d * Math.cos(mid) + DEPTH}) rotate(${spin} ${CXP} ${CYP}) translate(${CXP} ${CYP}) scale(${s}) translate(${-CXP} ${-CYP})`}>
              <path d={wedge(CXP, CYP, R, a0, a1)} fill={shade(COLS[i], -0.25)} stroke={shade(COLS[i], -0.25)} strokeWidth={10} strokeLinejoin="round" />
            </g>
          ) : null,
        )}
        {segs.map(({i, a0, a1, mid, d, s}) => {
          if (a1 - a0 <= 0.002 || s <= 0.01) return null;
          const col = COLS[i];
          const span = a1 - a0;
          return (
            <g key={`s${i}`} transform={`translate(${d * Math.sin(mid)} ${-d * Math.cos(mid)}) rotate(${spin} ${CXP} ${CYP}) translate(${CXP} ${CYP}) scale(${s}) translate(${-CXP} ${-CYP})`}>
              <path d={wedge(CXP, CYP, R, a0, a1)} fill={col} stroke={col} strokeWidth={10} strokeLinejoin="round" />
              {span > 0.35 ? (
                <path d={arc(CXP, CYP, R - 30, a0 + 0.16, a0 + Math.min(span - 0.16, 0.75))} fill="none" stroke={shade(col, 0.4)} strokeWidth={10} strokeLinecap="round" />
              ) : null}
            </g>
          );
        })}
      </g>
      {/* legenda: titik warna + batang */}
      {VALS.map((_, i) => {
        const k = rows[i];
        const y = LY + i * 92;
        const shift = i === HI ? 22 * popK : 0;
        const bh = 22 * Math.min(1, Math.max(0, k) * 4);
        const len = Math.max(bh, LEN[i] * Math.max(0, k));
        return (
          <g key={`r${i}`} transform={`translate(${shift} 0)`}>
            <circle cx={LX} cy={y} r={22 * (0.55 + 0.45 * Math.min(1, k))} fill={COLS[i]} />
            {bh > 1 ? (
              <rect x={LX + 44} y={y - bh / 2} width={len} height={bh} rx={bh / 2} fill={i === HI ? C.yellow : C.steel} />
            ) : null}
          </g>
        );
      })}
      {/* kilau di segmen menonjol */}
      {(() => {
        const s = segs[HI];
        const mid = s.mid;
        const rr = R + 70 + s.d;
        const x = CXP + rr * Math.sin(mid);
        const y = CYP - rr * Math.cos(mid);
        const k = popK * (0.75 + 0.25 * wave01(p, 4));
        return (
          <g>
            <Sparkle x={x + 26} y={y + 6} r={26 * k} color={C.yellow} rot={15} />
            <Sparkle x={x - 30} y={y + 52} r={13 * k} color={C.sky} />
          </g>
        );
      })()}
      <Sparkle x={CXP - R - 40} y={CYP - R + 30} r={16 * (0.7 + 0.3 * wave(p, 2))} color={C.yellow} rot={10} />
    </g>
  );
};
