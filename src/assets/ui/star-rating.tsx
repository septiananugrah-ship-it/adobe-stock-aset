// Rating bintang lima: bintang terisi kuning satu per satu (putar 72° + pop + percikan) → bintang kelima: lompatan & riak → kilau berjalan → padam dari kanan.
import React from 'react';
import {TAU, clamp, inOut, mod, out, outBack, seg, wave, yoyo} from '../../kit/loop';
import {C, blend, shade} from '../../kit/palette';
import {Shadow, Sparkle, roundedPath, starPts} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'ui-star-rating',
  theme: 'ui',
  title: 'Five star rating filling one by one with sparkles, customer review feedback icon animation, seamless loop with alpha channel',
  keywords: [
    'star rating',
    'five stars',
    'rating',
    'review',
    'feedback',
    'customer satisfaction',
    'stars',
    'rank',
    'quality',
    'best',
    'excellent',
    'testimonial',
    'evaluation',
    'score',
    'success',
    'favorite',
    'icon',
    'ui',
    'user interface',
    'app',
    'web',
    'ecommerce',
    'service',
    'gold',
    'yellow',
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
    'marketing',
    'ux',
  ],
  category: 8,
  seconds: 8,
  vectorP: 0.66,
};

const CX = 960;
const CARD = {x: 400, y: 236, w: 1120, h: 590, r: 52};
const SY = 548; // garis tengah bintang
const SR = 90;
const STARS: [number, number, number][] = [-2, -1, 0, 1, 2].map((k) => [CX + k * 200, SY, SR]);
const FILL_T = (i: number) => 0.12 + i * 0.065;
const LAST = FILL_T(4);

const kick = (p: number, a: number, w: number) => {
  const t = (p - a) / w;
  return t <= 0 || t >= 1 ? 0 : Math.sin(Math.PI * t) * (1 - t);
};

const shape = (R: number) => {
  const pts = starPts(0, 0, R, R * 0.5, 5);
  const full = roundedPath(pts, R * 0.13);
  const right = roundedPath([pts[0], pts[1], pts[2], pts[3], pts[4], pts[5]], R * 0.13);
  return {full, right};
};
const SHAPES = STARS.map(([, , R]) => shape(R));

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  const all = vector ? 1 : yoyo(p, LAST, LAST + 0.05, 0.8, 0.84, out, inOut);
  const land = vector ? 0 : kick(p, LAST + 0.01, 0.12);
  const breath = vector ? 1 : 1 + 0.012 * wave(p, 2);
  const tw = (k: number, ph: number) => (vector ? 1 : 0.8 + 0.2 * wave(p, k, ph));
  const rip = vector ? -1 : (p - LAST) / 0.2;
  const lineIn = (i: number) => (vector ? 1 : yoyo(p, 0.04 + i * 0.025, 0.12 + i * 0.025, 0.88 + i * 0.012, 0.95, out, inOut));
  return (
    <g>
      <Shadow cx={CX} cy={CARD.y + CARD.h + 52} rx={560} ry={30} vector={vector} />
      {/* titik naik di sisi kartu */}
      {!vector
        ? Array.from({length: 6}, (_, j) => {
            const t = mod(p * 2 + j / 6, 1);
            const o = all * Math.sin(Math.PI * t) * 0.8;
            if (o < 0.02) return null;
            const x = j % 2 ? CARD.x - 60 - (j % 3) * 34 : CARD.x + CARD.w + 60 + (j % 3) * 34;
            const y = CARD.y + CARD.h - 60 - t * 420;
            return <circle key={j} cx={x} cy={y} r={7} fill={j % 3 ? shade(C.yellow, 0.2) : C.orange} opacity={o} />;
          })
        : null}
      {/* riak bingkai saat bintang kelima terisi */}
      {rip > 0 && rip < 1
        ? [0, 0.2].map((d, j) => {
            const t = clamp((rip - d) / (1 - d));
            if (t <= 0) return null;
            const g = 20 + 70 * out(t);
            return (
              <rect
                key={j}
                x={CARD.x - g}
                y={CARD.y - g}
                width={CARD.w + 2 * g}
                height={CARD.h + 2 * g}
                rx={CARD.r + g}
                fill="none"
                stroke={C.yellow}
                strokeWidth={14 * (1 - t) + 3}
                opacity={(1 - t) * 0.6}
              />
            );
          })
        : null}
      <g transform={`translate(${CX} ${CARD.y + CARD.h}) scale(${(breath * (1 + 0.03 * land)).toFixed(4)} ${(breath * (1 - 0.03 * land)).toFixed(4)}) translate(${-CX} ${-(CARD.y + CARD.h)})`}>
        {/* kartu ulasan */}
        <rect x={CARD.x} y={CARD.y + 20} width={CARD.w} height={CARD.h} rx={CARD.r} fill={shade(C.mist, -0.2)} />
        <rect x={CARD.x} y={CARD.y} width={CARD.w} height={CARD.h} rx={CARD.r} fill={C.cloud} />
        <rect x={CARD.x + 26} y={CARD.y + 22} width={CARD.w - 52} height={CARD.h - 44} rx={CARD.r - 18} fill={C.white} />
        {/* avatar abstrak */}
        {(() => {
          const ax = CARD.x + 130;
          const ay = CARD.y + 128;
          const k = lineIn(0);
          return (
            <g transform={`translate(${ax} ${ay}) scale(${outBack(clamp(k), 1.6).toFixed(4)})`}>
              <circle r={66} fill={C.sky} />
              <path d="M66,0 A66,66 0 0 1 -40,52 A74,74 0 0 0 66,0 Z" fill={shade(C.sky, -0.12)} />
              <circle cy={-14} r={24} fill={C.white} />
              <path d="M-40,48 C-36,20 -18,12 0,12 C18,12 36,20 40,48 A66,66 0 0 1 -40,48 Z" fill={C.white} />
            </g>
          );
        })()}
        {/* baris teks (abstrak) */}
        <rect x={CARD.x + 236} y={CARD.y + 90} width={420 * lineIn(1)} height={28} rx={14} fill={C.ink} />
        <rect x={CARD.x + 236} y={CARD.y + 140} width={280 * lineIn(2)} height={22} rx={11} fill={C.mist} />
        <rect x={CARD.x + 110} y={CARD.y + 430} width={860 * lineIn(3)} height={24} rx={12} fill={shade(C.cloud, -0.04)} />
        <rect x={CARD.x + 110} y={CARD.y + 480} width={600 * lineIn(4)} height={24} rx={12} fill={shade(C.cloud, -0.04)} />
        {STARS.map(([x, y, R], i) => {
          const t0 = FILL_T(i);
          const offAt = 0.86 + (4 - i) * 0.022;
          const on = vector ? 1 : yoyo(p, t0, t0 + 0.04, offAt, offAt + 0.05, out, inOut);
          const spin = vector ? 0 : -72 * (1 - outBack(seg(p, t0, t0 + 0.09, (u) => u), 1.6)) * (p >= t0 - 0.0001 && p < offAt ? 1 : 0);
          const k = vector ? 0 : kick(p, t0, 0.1);
          // kilau berjalan saat ditahan
          const shimmer = vector ? 0 : all * Math.max(0, wave(p, 3, -i * 0.06)) ** 6;
          const fill = blend(blend(shade(C.mist, -0.02), C.yellow, on), shade(C.yellow, 0.35), shimmer * 0.7);
          const s = (1 + 0.2 * k) * (vector ? 1 : 1 - 0.06 * (1 - on));
          const float = vector ? 0 : 6 * all * wave(p, 2, i * 0.15);
          const {full, right} = SHAPES[i];
          return (
            <g key={i} transform={`translate(${x} ${(y - float).toFixed(2)}) rotate(${spin.toFixed(2)}) scale(${s.toFixed(4)})`}>
              <path d={full} fill={shade(fill, -0.22)} transform={`translate(0 ${R * 0.09})`} />
              <path d={full} fill={fill} />
              <path d={right} fill={shade(fill, -0.08)} />
              <path d={`M${-R * 0.62},${-R * 0.2} L${-R * 0.3},${-R * 0.24}`} fill="none" stroke={shade(fill, 0.5)} strokeWidth={12} strokeLinecap="round" />
              <circle cx={-R * 0.13} cy={-R * 0.5} r={6} fill={shade(fill, 0.5)} />
            </g>
          );
        })}
        {/* percikan kecil dari tiap bintang saat terisi */}
        {!vector
          ? STARS.map(([x, y, R], i) => {
              const t = (p - FILL_T(i)) / 0.12;
              if (t <= 0 || t >= 1) return null;
              return Array.from({length: 6}, (_, j) => {
                const a = (j / 6) * TAU + i * 0.4;
                const d = R * (1.05 + 0.5 * out(t));
                const o = 1 - seg(t, 0.5, 1);
                return (
                  <circle
                    key={`${i}-${j}`}
                    cx={x + d * Math.cos(a)}
                    cy={y + d * Math.sin(a)}
                    r={8 * (1 - 0.5 * t) + 2}
                    fill={j % 2 ? C.yellow : C.orange}
                    opacity={o >= 1 ? undefined : o}
                  />
                );
              });
            })
          : null}
      </g>
      {/* kilau di sekitar */}
      <Sparkle x={CARD.x + CARD.w + 40} y={CARD.y - 30} r={30 * all * tw(4, 0)} color={C.yellow} rot={15} />
      <Sparkle x={CARD.x + CARD.w + 110} y={CARD.y + 90} r={16 * all * tw(4, 0.5)} color={C.orange} />
      <Sparkle x={CARD.x - 70} y={CARD.y + 40} r={22 * all * tw(3, 0.2)} color={C.sky} rot={30} />
      <Sparkle x={CARD.x - 30} y={CARD.y + CARD.h + 10} r={16 * all * tw(3, 0.7)} color={C.yellow} rot={30} />
    </g>
  );
};
