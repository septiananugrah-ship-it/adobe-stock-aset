// Sinyal Wi-Fi: busur memindai (mencari jaringan) dua kali → tersambung: busur menyala biru bertingkat dengan pantulan → riak sinyal → padam dari luar.
import React from 'react';
import {clamp, inOut, mod, out, seg, wave, yoyo} from '../../kit/loop';
import {C, blend, shade} from '../../kit/palette';
import {Glow, Shadow, Sparkle, arcPath} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'ui-wifi-signal',
  theme: 'ui',
  title: 'Wi-Fi signal icon searching then connecting, arcs lighting up with signal ripples, flat animation, seamless loop with alpha channel',
  keywords: [
    'wifi',
    'wi-fi',
    'wireless',
    'signal',
    'internet',
    'connection',
    'network',
    'connecting',
    'online',
    'hotspot',
    'router',
    'broadband',
    'signal strength',
    'searching',
    'icon',
    'ui',
    'user interface',
    'app',
    'mobile',
    'web',
    'technology',
    'communication',
    'free wifi',
    'blue',
    'symbol',
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
  ],
  category: 19,
  seconds: 8,
  vectorP: 0.66,
};

const CX = 960;
const CY = 790;
const DOT_R = 58;
const RADII = [190, 320, 450];
const SW = 70;
const SPAN = 0.78; // setengah bukaan busur (radian)
const OFF = C.mist;
const ON = C.blue;
const SCAN = C.sky;

/** benjolan 0→1→0 di [a, a+w] */
const bump = (p: number, a: number, w: number) => {
  const t = (p - a) / w;
  return t <= 0 || t >= 1 ? 0 : Math.sin(Math.PI * t);
};
/** pantulan kecil (0 di luar jendela) */
const kick = (p: number, a: number, w: number) => {
  const t = (p - a) / w;
  return t <= 0 || t >= 1 ? 0 : Math.sin(Math.PI * t) * (1 - t);
};

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  // indeks 0 = titik, 1..3 = busur
  const items = [0, 1, 2, 3].map((i) => {
    const onAt = 0.42 + i * 0.045;
    const offAt = 0.86 - i * 0.03;
    const lit = vector ? 1 : yoyo(p, onAt, onAt + 0.06, offAt, offAt + 0.06, out, inOut);
    const scan = vector ? 0 : bump(p, 0.08 + i * 0.04, 0.1) + bump(p, 0.24 + i * 0.04, 0.1);
    const k = vector ? 0 : kick(p, onAt, 0.12);
    const pulse = vector ? 0 : seg(p, 0.6, 0.66) * (1 - seg(p, 0.78, 0.84)) * (0.5 + 0.5 * wave(p, 4, -i * 0.08));
    const base = blend(blend(OFF, SCAN, clamp(scan)), ON, lit);
    const col = blend(base, shade(ON, 0.14), 0.6 * pulse);
    return {lit, k, col};
  });
  const linked = vector ? 1 : yoyo(p, 0.55, 0.6, 0.8, 0.86, out, inOut);
  const breath = vector ? 1 : 1 + 0.012 * wave(p, 2);
  const tw = (k: number, ph: number) => (vector ? 1 : 0.8 + 0.2 * wave(p, k, ph));
  return (
    <g>
      <Shadow cx={CX} cy={892} rx={220} ry={22} vector={vector} />
      <Glow cx={CX} cy={CY - 200} r={400} color={C.blue} strength={linked * 0.55} vector={vector} />
      {/* riak sinyal (motion saja) */}
      {!vector
        ? [0, 1 / 3, 2 / 3].map((off, j) => {
            const t = mod(p * 6 + off, 1);
            const o = linked * (1 - t) * Math.min(1, t * 6) * 0.7;
            if (o < 0.01) return null;
            const r = RADII[2] + 62 + 76 * out(t);
            return (
              <path
                key={j}
                d={arcPath(CX, CY, r, -SPAN * 0.9, SPAN * 0.9)}
                fill="none"
                stroke={C.sky}
                strokeWidth={14 * (1 - t) + 4}
                strokeLinecap="round"
                opacity={o}
              />
            );
          })
        : null}
      <g transform={`translate(${CX} ${CY + DOT_R}) scale(${breath.toFixed(4)}) translate(${-CX} ${-(CY + DOT_R)})`}>
        {/* busur */}
        {RADII.map((r0, j) => {
          const it = items[j + 1];
          const r = r0 + 22 * it.k;
          const d = arcPath(CX, CY, r, -SPAN, SPAN);
          const hl = arcPath(CX, CY, r - SW / 2 + 16, -SPAN + 0.14, -SPAN * 0.42);
          return (
            <g key={j}>
              <path d={d} fill="none" stroke={shade(it.col, -0.24)} strokeWidth={SW} strokeLinecap="round" transform="translate(0 16)" />
              <path d={d} fill="none" stroke={it.col} strokeWidth={SW} strokeLinecap="round" />
              <path d={hl} fill="none" stroke={shade(it.col, 0.42)} strokeWidth={12} strokeLinecap="round" />
            </g>
          );
        })}
        {/* titik */}
        {(() => {
          const it = items[0];
          const s = 1 + 0.18 * it.k;
          return (
            <g transform={`translate(${CX} ${CY}) scale(${s.toFixed(4)})`}>
              <circle r={DOT_R} cy={16} fill={shade(it.col, -0.24)} />
              <circle r={DOT_R} fill={it.col} />
              <path d={`M${DOT_R},0 A${DOT_R},${DOT_R} 0 0 1 ${-DOT_R * 0.6},${DOT_R * 0.8} A${DOT_R * 1.15},${DOT_R * 1.15} 0 0 0 ${DOT_R},0 Z`} fill={shade(it.col, -0.1)} />
              <circle cx={-20} cy={-20} r={12} fill={shade(it.col, 0.42)} />
            </g>
          );
        })()}
      </g>
      <Sparkle x={1350} y={262} r={26 * linked * tw(4, 0)} color={C.yellow} rot={15} />
      <Sparkle x={536} y={440} r={20 * linked * tw(4, 0.5)} color={C.sky} />
      <Sparkle x={1404} y={640} r={15 * linked * tw(3, 0.2)} color={C.blue} rot={30} />
      <Sparkle x={520} y={700} r={14 * linked * tw(3, 0.7)} color={C.yellow} rot={30} />
    </g>
  );
};
