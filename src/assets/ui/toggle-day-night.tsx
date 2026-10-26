// Sakelar toggle siang-malam: kenop matahari melompat ke kanan (antisipasi + regang) → jalur jadi malam, kenop jadi bulan, bintang berkelip → kembali ke siang, awan melayang.
import React from 'react';
import {clamp, inOut, outBack, seg, wave, yoyo} from '../../kit/loop';
import {C, blend, shade} from '../../kit/palette';
import {Shadow, Sparkle} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'ui-toggle-day-night',
  theme: 'ui',
  title: 'Day and night toggle switch, sun knob sliding into moon with stars and clouds, flat animation, seamless loop with alpha channel',
  keywords: [
    'toggle',
    'switch',
    'toggle switch',
    'dark mode',
    'light mode',
    'day and night',
    'sun',
    'moon',
    'night mode',
    'on off',
    'button',
    'settings',
    'theme',
    'stars',
    'clouds',
    'icon',
    'ui',
    'user interface',
    'app',
    'mobile app',
    'web',
    'control',
    'slider',
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
    'ux',
    'digital',
    'weather',
  ],
  category: 19,
  seconds: 8,
  vectorP: 0.45,
};

const CX = 960;
const CY = 500;
const SC = 1.32; // skala keseluruhan sakelar
const TR = {w: 760, h: 340}; // jalur dalam
const RIM = 22;
const KR = 140;
const KX0 = CX - (TR.w / 2 - TR.h / 2);
const KX1 = CX + (TR.w / 2 - TR.h / 2);
const DAY = C.sky;
const NIGHT = shade(C.navy, 0.04);

const bump = (p: number, a: number, w: number) => {
  const t = (p - a) / w;
  return t <= 0 || t >= 1 ? 0 : Math.sin(Math.PI * t);
};

/** posisi kenop 0 (siang) .. 1 (malam), dengan antisipasi & overshoot */
const posAt = (p: number) =>
  yoyo(p, 0.13, 0.25, 0.62, 0.74, (t) => outBack(t, 0.9), (t) => outBack(t, 0.9)) - 0.05 * bump(p, 0.07, 0.07) + 0.05 * bump(p, 0.56, 0.07);

const Cloud: React.FC<{x: number; y: number; s: number; col: string}> = ({x, y, s, col}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-70,34 L70,34 A34,34 0 0 0 60,-12 A44,44 0 0 0 -8,-34 A40,40 0 0 0 -62,-4 A34,34 0 0 0 -70,34 Z" fill={shade(col, -0.1)} transform="translate(0 8)" />
    <path d="M-70,34 L70,34 A34,34 0 0 0 60,-12 A44,44 0 0 0 -8,-34 A40,40 0 0 0 -62,-4 A34,34 0 0 0 -70,34 Z" fill={col} />
    <circle cx={-22} cy={-14} r={7} fill={C.white} />
  </g>
);

const STARS: [number, number, number][] = [
  [700, 410, 24],
  [790, 570, 16],
  [860, 432, 13],
  [636, 520, 13],
  [928, 584, 11],
  [640, 466, 12],
];

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  const u = vector ? 1 : posAt(p);
  const n = clamp(u);
  const v = vector ? 0 : Math.abs(posAt(p + 0.004) - posAt(p - 0.004)) / 0.008;
  const kx = KX0 + (KX1 - KX0) * u;
  const stretch = Math.min(0.22, v * 0.045);
  const track = blend(DAY, NIGHT, n);
  const press = vector ? 1 : 1 - 0.03 * bump(p, 0.1, 0.08) - 0.03 * bump(p, 0.59, 0.08);
  const breath = vector ? 1 : 1 + 0.01 * wave(p, 2);
  const knob = blend(C.yellow, shade(C.cloud, -0.02), n);
  const moon = vector ? 1 : seg(n, 0.45, 1);
  const sunK = 1 - seg(n, 0, 0.55);
  const glowW = vector ? 0 : wave(p, 4);
  const tw = (k: number, ph: number) => (vector ? 1 : 0.75 + 0.25 * wave(p, k, ph));
  const L = CX - TR.w / 2;
  const T = CY - TR.h / 2;
  const R2 = TR.h / 2;
  const cloudDrift = vector ? 0 : 14 * wave(p, 1);
  return (
    <g>
      <Shadow cx={CX} cy={CY + 262 * SC} rx={380 * SC} ry={30} vector={vector} />
      <g transform={`translate(${CX} ${CY}) scale(${SC}) translate(${-CX} ${-CY})`}>
      <g transform={`translate(${CX} ${CY + R2}) scale(${(breath / press).toFixed(4)} ${(breath * press).toFixed(4)}) translate(${-CX} ${-(CY + R2)})`}>
        {/* bingkai */}
        <rect x={L - RIM} y={T - RIM + 16} width={TR.w + RIM * 2} height={TR.h + RIM * 2} rx={R2 + RIM} fill={shade(C.mist, -0.22)} />
        <rect x={L - RIM} y={T - RIM} width={TR.w + RIM * 2} height={TR.h + RIM * 2} rx={R2 + RIM} fill={C.cloud} />
        <rect x={L} y={T} width={TR.w} height={TR.h} rx={R2} fill={shade(track, -0.16)} />
        <rect x={L + 4} y={T + 16} width={TR.w - 8} height={TR.h - 18} rx={R2 - 6} fill={track} />
        {!vector ? (
          <clipPath id="ui-toggle-day-night-clip">
            <rect x={L} y={T} width={TR.w} height={TR.h} rx={R2} />
          </clipPath>
        ) : null}
        <g clipPath={vector ? undefined : 'url(#ui-toggle-day-night-clip)'}>
          {/* awan (siang) — turun keluar saat malam */}
          {n < 0.999 ? (
            <g transform={`translate(${cloudDrift.toFixed(2)} ${(260 * inOut(n)).toFixed(2)})`}>
              <Cloud x={1080} y={428} s={1} col={C.white} />
              <Cloud x={1196} y={566} s={0.72} col={C.white} />
              <Cloud x={1000} y={580} s={0.5} col={shade(C.sky, 0.55)} />
            </g>
          ) : null}
          {/* bintang (malam) */}
          {STARS.map(([x, y, r], i) => {
            const s = vector ? 1 : yoyo(n, 0.35 + i * 0.07, 0.6 + i * 0.07, 2, 3, (t) => outBack(t, 2.2));
            const k = s * tw(3, i * 0.21);
            if (k < 0.02) return null;
            return i % 2 === 1 ? (
              <circle key={i} cx={x} cy={y} r={Math.max(5, r * 0.5) * k} fill={shade(C.yellow, 0.4)} />
            ) : (
              <Sparkle key={i} x={x} y={y} r={r * k} color={i === 0 ? C.yellow : C.white} rot={i * 12} />
            );
          })}
        {/* lingkar cahaya di belakang kenop */}
          <circle cx={kx} cy={CY} r={KR + 26} fill={blend(track, C.white, 0.16)} />
          <circle cx={kx} cy={CY} r={KR + 13} fill={blend(track, C.white, 0.3)} />
        </g>
        {/* kenop */}
        <g transform={`translate(${kx.toFixed(2)} ${CY}) scale(${(1 + stretch).toFixed(4)} ${(1 - stretch * 0.6).toFixed(4)})`}>
          <circle r={KR} cy={12} fill={shade(knob, -0.24)} />
          <circle r={KR} fill={knob} />
          <path d={`M${KR},0 A${KR},${KR} 0 0 1 ${-KR * 0.6},${KR * 0.8} A${KR * 1.12},${KR * 1.12} 0 0 0 ${KR},0 Z`} fill={shade(knob, -0.12)} />
          {/* inti matahari: lingkar dalam berdenyut */}
          {sunK > 0.01 ? (
            <g opacity={sunK >= 1 ? undefined : sunK}>
              <circle r={KR * (0.66 + 0.03 * glowW)} fill={shade(C.yellow, 0.18)} />
              <circle r={KR * (0.44 + 0.03 * glowW)} fill={shade(C.yellow, 0.38)} />
            </g>
          ) : null}
          {/* kawah bulan */}
          {moon > 0.01 ? (
            <g opacity={moon >= 1 ? undefined : moon}>
              <circle cx={-38} cy={-34} r={30} fill={shade(C.mist, -0.06)} />
              <circle cx={44} cy={20} r={22} fill={shade(C.mist, -0.06)} />
              <circle cx={-18} cy={54} r={15} fill={shade(C.mist, -0.06)} />
              <circle cx={30} cy={-60} r={11} fill={shade(C.mist, -0.06)} />
            </g>
          ) : null}
          <path d={`M${-KR * 0.72},${-KR * 0.2} A${KR * 0.75},${KR * 0.75} 0 0 1 ${-KR * 0.22},${-KR * 0.7}`} fill="none" stroke={C.white} strokeWidth={13} strokeLinecap="round" />
        </g>
      </g>
      </g>
      <Sparkle x={1560} y={250} r={28 * tw(4, 0)} color={blend(C.yellow, C.violet, n)} rot={15} />
      <Sparkle x={380} y={790} r={20 * tw(4, 0.5)} color={blend(C.sky, C.yellow, n)} />
      <Sparkle x={1590} y={800} r={16 * tw(3, 0.3)} color={C.sky} rot={30} />
    </g>
  );
};
