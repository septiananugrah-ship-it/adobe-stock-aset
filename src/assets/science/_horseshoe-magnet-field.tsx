// Magnet tapal kuda: medan menyala, garis medan tergambar dari kutub ke kutub dengan titik mengalir,
// serbuk besi berputar menyelaraskan diri dengan arah medan (bertingkat dari dekat kutub), lalu kembali acak.
// Model medan 2D: dua kutub titik (N, S) → garis medan = busur lingkaran yang melewati kedua kutub.
import React from 'react';
import {TAU, clamp, inOut, mix, out, outBack, rng, seg, wave, wave01, yoyo} from '../../kit/loop';
import {C, blend, shade} from '../../kit/palette';
import {Glow, Sparkle} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'science-horseshoe-magnet-field',
  theme: 'science',
  title: 'Horseshoe magnet with magnetic field lines and aligning iron filings, physics animation, seamless loop with alpha channel',
  keywords: [
    'magnet', 'horseshoe magnet', 'magnetic field', 'field lines', 'iron filings', 'magnetism', 'physics', 'science',
    'attraction', 'force', 'electromagnetism', 'north pole', 'south pole', 'education', 'school', 'experiment', 'laboratory',
    'energy', 'pull', 'attract', 'flux', 'teaching', 'lesson', 'icon', 'flat design', 'illustration', 'animation',
    'motion graphics', 'seamless loop', 'looped', 'alpha channel', 'transparent background', 'isolated', 'explainer',
    'presentation', 'social media', '4k', 'red', 'magnetic',
  ],
  category: 16,
  seconds: 8,
  vectorP: 0.5,
};

const CX = 960;
const UY = 360; // pusat busur U
const LEG = 200; // jarak pusat kaki dari CX
const TH = 124; // tebal kaki
const RO = LEG + TH / 2;
const RI = LEG - TH / 2;
const POLE_Y = 610; // ujung kutub
const TIP = 86; // panjang ujung logam
const PN = {x: CX - LEG, y: POLE_Y};
const PS = {x: CX + LEG, y: POLE_Y};

const RED = C.coral;
const RED_D = shade(RED, -0.2);
const RED_L = shade(RED, 0.42);
const METAL = C.mist;
const METAL_D = shade(C.mist, -0.2);
const LINE = blend(C.sky, C.blue, 0.25);
const DOT = blend(C.sky, C.white, 0.35);

/** Medan 2D di titik (x, y): sumber di N, tujuan di S. */
const field = (x: number, y: number) => {
  const ax = x - PN.x;
  const ay = y - PN.y;
  const bx = x - PS.x;
  const by = y - PS.y;
  const a2 = ax * ax + ay * ay;
  const b2 = bx * bx + by * by;
  return [ax / a2 - bx / b2, ay / a2 - by / b2];
};

// Busur garis medan: pusat lingkaran di (CX, POLE_Y + k), melewati N & S, bagian bawah.
const KS = [-520, -230, -95, 0, 78, 150];
const arcD = (k: number) => {
  const r = Math.hypot(LEG, k);
  const large = k > 0 ? 1 : 0;
  // dari N ke S lewat bawah (searah berlawanan jarum jam di layar = sweep 0)
  return {d: `M${PN.x},${PN.y} A${r.toFixed(1)},${r.toFixed(1)} 0 ${large} 0 ${PS.x},${PS.y}`, len: arcLen(k, r)};
};
const arcLen = (k: number, r: number) => {
  const half = Math.asin(LEG / r); // setengah sudut tali busur dilihat dari pusat
  const ang = k > 0 ? TAU - 2 * half : 2 * half;
  return r * ang;
};
const ARCS = KS.map(arcD);

// Serbuk besi: tersebar acak di sekitar kutub (bukan di dalam magnet)
const R = rng(11);
type Filing = {x: number; y: number; a0: number; a1: number; d: number; c: number; L: number};
const FILINGS: Filing[] = [];
for (let tries = 0; FILINGS.length < 150 && tries < 4000; tries++) {
  const x = CX + (R() * 2 - 1) * 520;
  const y = 470 + R() * 470;
  const e = Math.pow((x - CX) / 540, 2) + Math.pow((y - 700) / 250, 2);
  if (e > 1) continue;
  if (Math.abs(x - CX) < RO + 22 && y < POLE_Y + 26) continue;
  if (Math.hypot(x - PN.x, y - PN.y) < 70 || Math.hypot(x - PS.x, y - PS.y) < 70) continue;
  if (FILINGS.some((f) => Math.hypot(f.x - x, f.y - y) < 40)) continue;
  const [fx, fy] = field(x, y);
  const target = Math.atan2(fy, fx);
  const a0 = R() * Math.PI;
  // pilih arah sasaran (mod π) yang paling dekat dengan arah awal
  let a1 = target;
  while (a1 - a0 > Math.PI / 2) a1 -= Math.PI;
  while (a1 - a0 < -Math.PI / 2) a1 += Math.PI;
  const d = Math.min(Math.hypot(x - PN.x, y - PN.y), Math.hypot(x - PS.x, y - PS.y));
  FILINGS.push({x, y, a0, a1, d, c: R(), L: 20 + R() * 10});
}

const Tip: React.FC<{x: number}> = ({x}) => (
  <g>
    <rect x={x - TH / 2} y={POLE_Y - TIP} width={TH} height={TIP} rx={14} fill={METAL_D} />
    <rect x={x - TH / 2} y={POLE_Y - TIP} width={TH * 0.7} height={TIP} rx={14} fill={METAL} />
    <rect x={x - TH / 2 + 16} y={POLE_Y - TIP + 14} width={12} height={TIP - 28} rx={6} fill={C.white} />
  </g>
);

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  const on = vector ? 1 : yoyo(p, 0.08, 0.26, 0.74, 0.9);
  const draw = vector ? 1 : yoyo(p, 0.1, 0.3, 0.72, 0.86, inOut, inOut);
  const hold = seg(p, 0.28, 0.36) * (1 - seg(p, 0.7, 0.76));
  const kick = 1 + 0.04 * Math.sin(Math.PI * clamp((p - 0.08) / 0.1)) * (1 - clamp((p - 0.08) / 0.1));
  // magnet berayun napas halus
  const bob = 4 * wave(p, 2);
  return (
    <g>
      <Glow cx={PN.x} cy={PN.y} r={150 + 20 * wave01(p, 4)} color={RED} strength={0.7 * on} vector={vector} />
      <Glow cx={PS.x} cy={PS.y} r={150 + 20 * wave01(p, 4, 0.5)} color={C.sky} strength={0.7 * on} vector={vector} />
      {/* serbuk besi */}
      {FILINGS.map((f, i) => {
        const delay = clamp((f.d - 70) / 420) * 0.12;
        const k = vector ? 1 : yoyo(p, 0.12 + delay, 0.24 + delay, 0.74 + delay * 0.5, 0.86 + delay * 0.5, (t) => outBack(t, 1.6), inOut);
        const jig = 4 * hold * wave(p, 6, f.c);
        const a = mix(f.a0, f.a1, k) * (180 / Math.PI) + jig;
        const col = f.c < 0.5 ? C.steel : shade(C.steel, -0.18);
        return (
          <rect
            key={i}
            x={-f.L / 2}
            y={-5}
            width={f.L}
            height={10}
            rx={5}
            fill={col}
            transform={`translate(${f.x.toFixed(1)} ${f.y.toFixed(1)}) rotate(${a.toFixed(2)})`}
          />
        );
      })}
      {/* garis medan */}
      {ARCS.map((a, i) => {
        const dk = clamp(draw * 1.25 - i * 0.05);
        if (dk <= 0.002) return null;
        return (
          <g key={i}>
            <path d={a.d} fill="none" stroke={LINE} strokeWidth={8} strokeLinecap="round" pathLength={1000} strokeDasharray={`${(dk * 1000).toFixed(1)} 2000`} />
            {!vector ? (
              <path
                d={a.d}
                fill="none"
                stroke={DOT}
                strokeWidth={12}
                strokeLinecap="round"
                strokeDasharray={`0.1 ${(a.len / Math.max(3, Math.round(a.len / 70))).toFixed(3)}`}
                strokeDashoffset={-((a.len / Math.max(3, Math.round(a.len / 70))) * 4 * p)}
                opacity={hold}
              />
            ) : null}
          </g>
        );
      })}
      {/* magnet */}
      <g transform={`translate(0 ${bob.toFixed(2)}) translate(${CX} ${POLE_Y}) scale(${kick}) translate(${-CX} ${-POLE_Y})`}>
        {/* sisi gelap (tebal) */}
        <path
          d={`M${CX - RO + 12},${POLE_Y} L${CX - RO + 12},${UY} A${RO},${RO} 0 0 1 ${CX + RO + 12},${UY} L${CX + RO + 12},${POLE_Y} Z`}
          fill={RED_D}
        />
        <path
          d={`M${CX - RO},${POLE_Y - TIP + 8} L${CX - RO},${UY} A${RO},${RO} 0 0 1 ${CX + RO},${UY} L${CX + RO},${POLE_Y - TIP + 8} L${CX + RI},${POLE_Y - TIP + 8} L${CX + RI},${UY} A${RI},${RI} 0 0 0 ${CX - RI},${UY} L${CX - RI},${POLE_Y - TIP + 8} Z`}
          fill={RED}
        />
        {/* bayangan dalam busur */}
        <path d={`M${CX + RI},${UY} A${RI},${RI} 0 0 0 ${CX - RI},${UY} L${CX - RI + 20},${UY} A${RI - 20},${RI - 20} 0 0 1 ${CX + RI - 20},${UY} Z`} fill={RED_D} />
        {/* kilau */}
        <path
          d={`M${CX - RO + 24},${POLE_Y - TIP - 20} L${CX - RO + 24},${UY} A${RO - 24},${RO - 24} 0 0 1 ${CX - 40},${UY - RO + 26}`}
          fill="none"
          stroke={RED_L}
          strokeWidth={12}
          strokeLinecap="round"
        />
        <Tip x={CX - LEG} />
        <Tip x={CX + LEG} />
      </g>
      {/* kilau sekitar */}
      <Sparkle x={CX + 400} y={250} r={26 * (0.65 + 0.35 * wave01(p, 2))} color={C.yellow} rot={12} />
      <Sparkle x={CX + 470} y={330} r={13 * (0.6 + 0.4 * wave01(p, 2, 0.4))} color={C.sky} />
      <Sparkle x={CX - 420} y={290} r={20 * (0.6 + 0.4 * wave01(p, 2, 0.7))} color={C.yellow} rot={-8} />
      <Sparkle x={CX - 480} y={220} r={11 * (0.6 + 0.4 * wave01(p, 2, 0.2))} color={RED} />
      {/* percikan energi saat menyala */}
      {!vector
        ? [0, 1, 2, 3, 4, 5].map((i) => {
            const t = clamp((p - 0.1 - i * 0.012) / 0.16);
            if (t <= 0 || t >= 1) return null;
            const ang = -Math.PI / 2 + (i - 2.5) * 0.42;
            const r0 = RO + 30 + 70 * out(t);
            return (
              <circle key={i} cx={CX + r0 * Math.cos(ang)} cy={UY + r0 * Math.sin(ang)} r={9 * (1 - t)} fill={C.yellow} />
            );
          })
        : null}
    </g>
  );
};
