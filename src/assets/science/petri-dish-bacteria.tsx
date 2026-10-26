// Cawan petri berisi agar: koloni bakteri tumbuh mengikuti pola goresan kuadran (zona 1 padat → zona 3 koloni
// tunggal yang besar), lalu kaca pembesar muncul dan menyapu memperlihatkan koloni yang diperbesar.
// Setelah itu kaca pembesar menghilang dan koloni menyusut kembali (loop).
import React from 'react';
import {clamp, inOut, mix, outBack, rng, seg, wave, wave01, yoyo} from '../../kit/loop';
import {C, blend, shade} from '../../kit/palette';
import {Shadow, Sparkle} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'science-petri-dish-bacteria',
  theme: 'science',
  title: 'Petri dish with bacteria colonies growing and magnifying glass inspecting culture, microbiology animation, seamless loop',
  keywords: [
    'petri dish', 'bacteria', 'colonies', 'microbiology', 'culture', 'agar', 'magnifying glass', 'biology', 'laboratory',
    'science', 'microbe', 'growth', 'research', 'medicine', 'medical', 'healthcare', 'infection', 'germs', 'microorganism',
    'experiment', 'analysis', 'streak plate', 'biotechnology', 'education', 'icon', 'flat design', 'illustration',
    'animation', 'motion graphics', 'seamless loop', 'looped', 'alpha channel', 'transparent background', 'isolated',
    'explainer', 'presentation', 'social media', '4k', 'pharmacy',
  ],
  category: 16,
  seconds: 8,
  vectorP: 0.46,
};

const CX = 960;
const CY = 548;
const RO = 380; // jari-jari luar cawan
const K = 0.6; // pemipihan perspektif
const WALL = 46; // tinggi dinding
const RA = RO - 26; // jari-jari agar

const AGAR = blend(C.yellow, C.white, 0.5);
const AGAR_D = blend(C.yellow, C.orange, 0.25);
const GLASS = blend(C.sky, C.white, 0.72);
const GLASS_D = blend(C.sky, C.white, 0.42);
const COL = C.teal;
const MAG = 1.8; // perbesaran

const R = rng(21);
type Colony = {u: number; v: number; r: number; t0: number; c: string};
const COLONIES: Colony[] = [];
/** Pola goresan: zigzag di tiap zona (koordinat cakram satuan). */
const zone = (ang0: number, ang1: number, rIn: number, rOut: number, n: number, rad: [number, number], density: number, tStart: number) => {
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = mix(ang0, ang1, i / (n - 1));
    const rr = i % 2 ? rOut : rIn;
    pts.push([rr * Math.cos(a), rr * Math.sin(a)]);
  }
  let order = 0;
  for (let s = 0; s < pts.length - 1; s++) {
    const [a, b] = [pts[s], pts[s + 1]];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const m = Math.max(1, Math.round(len * density));
    for (let j = 0; j < m; j++) {
      const t = (j + R()) / m;
      const u = mix(a[0], b[0], t) + (R() - 0.5) * 0.05;
      const v = mix(a[1], b[1], t) + (R() - 0.5) * 0.05;
      const r = mix(rad[0], rad[1], R());
      if (Math.hypot(u, v) + r / RA > 0.93) continue;
      if (COLONIES.some((c) => Math.hypot((c.u - u) * RA, (c.v - v) * RA) < (c.r + r) * 0.9)) continue;
      COLONIES.push({u, v, r, t0: tStart + order * 0.0016, c: R() < 0.5 ? COL : shade(COL, 0.12)});
      order++;
    }
  }
};
zone(-2.6, -1.2, 0.22, 0.86, 7, [9, 13], 24, 0.06); // zona 1: padat
zone(-0.9, 0.5, 0.28, 0.86, 6, [14, 20], 7.5, 0.14); // zona 2
zone(0.85, 2.5, 0.25, 0.84, 5, [22, 34], 2.6, 0.22); // zona 3: koloni tunggal

const rimPt = (th: number, y0: number) => [CX + RO * Math.cos(th), y0 + RO * K * Math.sin(th)] as [number, number];
const f1 = (q: [number, number]) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`;
const toXY = (u: number, v: number) => [CX + u * RA, CY + v * RA * K] as [number, number];

/** Satu koloni (elips pipih): tepi gelap, badan, inti, kilau. */
const ColonyShape: React.FC<{x: number; y: number; r: number; c: string; k?: number}> = ({x, y, r, c, k = K}) => (
  <g>
    <ellipse cx={x} cy={y + r * 0.12} rx={r} ry={r * k} fill={shade(c, -0.22)} />
    <ellipse cx={x} cy={y} rx={r * 0.92} ry={r * k * 0.92} fill={c} />
    {r > 12 ? <ellipse cx={x + r * 0.1} cy={y + r * 0.06} rx={r * 0.42} ry={r * k * 0.42} fill={shade(c, -0.12)} /> : null}
    {r > 9 ? <ellipse cx={x - r * 0.38} cy={y - r * k * 0.36} rx={Math.max(3, r * 0.2)} ry={Math.max(2.2, r * k * 0.2)} fill={shade(c, 0.5)} /> : null}
  </g>
);

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  const shrink = vector ? 0 : seg(p, 0.8, 0.94, inOut);
  const grown = COLONIES.map((c, i) => {
    if (vector) return 1;
    const g = outBack(clamp((p - c.t0) / 0.09), 1.8);
    const back = clamp((shrink * 1.4 - (1 - i / COLONIES.length) * 0.4) / 1);
    return Math.max(0, g * (1 - inOut(back)));
  });
  const breath = 1 + 0.03 * wave(p, 4);
  // kaca pembesar
  const magOn = vector ? 1 : yoyo(p, 0.4, 0.48, 0.7, 0.78, (t) => outBack(t, 1.6), inOut);
  // dua titik amatan: zona 2 (kanan) → zona 3 (kiri bawah), dengan geser halus
  const mv = vector ? 0 : seg(p, 0.52, 0.62, inOut);
  const drift = vector ? 0 : 0.03 * wave(p, 2);
  const lu = mix(0.44, -0.3, mv) + drift;
  const lv = mix(-0.06, 0.27, mv) - 0.12 * Math.sin(Math.PI * mv) + drift * 0.6;
  const [lx, ly] = toXY(lu, lv);
  const LR = 150;
  return (
    <g>
      <Shadow cx={CX} cy={CY + RO * K + WALL + 14} rx={RO + 30} ry={44} vector={vector} />
      {/* dinding cawan (badan) */}
      <path d={`M${CX - RO},${CY} L${CX - RO},${CY + WALL} A${RO},${RO * K} 0 0 0 ${CX + RO},${CY + WALL} L${CX + RO},${CY} Z`} fill={GLASS_D} />
      <ellipse cx={CX} cy={CY} rx={RO} ry={RO * K} fill={GLASS} />
      {/* agar: sisi tebal + permukaan */}
      <ellipse cx={CX} cy={CY + 16} rx={RA} ry={RA * K} fill={AGAR_D} />
      <ellipse cx={CX} cy={CY + 4} rx={RA} ry={RA * K} fill={AGAR} />
      <path d={`M${CX - RA * 0.78},${CY - RA * K * 0.42} A${RA * 0.86},${RA * K * 0.86} 0 0 1 ${CX - RA * 0.3},${CY - RA * K * 0.8}`} fill="none" stroke={shade(AGAR, 0.5)} strokeWidth={12} strokeLinecap="round" />
      {/* koloni */}
      {COLONIES.map((c, i) => {
        const s = grown[i] * (c.r > 14 ? breath : 1);
        if (s < 0.05) return null;
        const [x, y] = toXY(c.u, c.v);
        return <ColonyShape key={i} x={x} y={y} r={c.r * s} c={c.c} />;
      })}
      {/* bibir kaca depan */}
      <path d={`M${CX - RO},${CY} A${RO},${RO * K} 0 0 0 ${CX + RO},${CY}`} fill="none" stroke={blend(C.sky, C.white, 0.55)} strokeWidth={10} />
      <path d={`M${f1(rimPt(0.8 * Math.PI, CY + WALL * 0.6))} A${RO},${RO * K} 0 0 0 ${f1(rimPt(0.64 * Math.PI, CY + WALL * 0.6))}`} fill="none" stroke={C.white} strokeWidth={10} strokeLinecap="round" />
      {/* kaca pembesar */}
      {magOn > 0.02 ? (
        <g transform={`translate(${lx.toFixed(1)} ${ly.toFixed(1)}) scale(${magOn.toFixed(4)}) rotate(${(4 * wave(p, 2)).toFixed(2)})`}>
          <g transform="rotate(40)">
            <rect x={LR + 6} y={-22} width={46} height={44} rx={12} fill={C.slate} />
            <rect x={LR + 44} y={-30} width={190} height={60} rx={30} fill={shade(C.navy, -0.1)} />
            <rect x={LR + 44} y={-30} width={190} height={42} rx={21} fill={C.navy} />
            <rect x={LR + 70} y={-20} width={90} height={10} rx={5} fill={C.ink} />
          </g>
          <circle r={LR + 22} fill={C.ink} />
          <circle r={LR + 22} fill={C.navy} transform="translate(-4 -4)" />
          <circle r={LR} fill={blend(AGAR, C.white, 0.25)} />
          {!vector ? (
            <clipPath id={`${meta.id}-lens`}>
              <circle r={LR - 4} />
            </clipPath>
          ) : null}
          <g clipPath={vector ? undefined : `url(#${meta.id}-lens)`}>
          {COLONIES.map((c, i) => {
            const s = grown[i];
            if (s < 0.05) return null;
            const [x, y] = toXY(c.u, c.v);
            const mx = (x - lx) * MAG;
            const my = (y - ly) * MAG;
            const rr = c.r * s * MAG;
            if (vector ? Math.hypot(mx, my) + rr > LR - 10 : Math.hypot(mx, my) - rr > LR) return null;
            return <ColonyShape key={i} x={mx} y={my} r={rr} c={c.c} />;
          })}
          </g>
          <path d={`M${-LR * 0.72},${-LR * 0.3} A${LR * 0.78},${LR * 0.78} 0 0 1 ${-LR * 0.28},${-LR * 0.72}`} fill="none" stroke={C.white} strokeWidth={14} strokeLinecap="round" />
          <circle cx={-LR * 0.12} cy={-LR * 0.8} r={8} fill={C.white} />
        </g>
      ) : null}
      <Sparkle x={CX + 420} y={250} r={24 * (0.65 + 0.35 * wave01(p, 2))} color={C.yellow} rot={12} />
      <Sparkle x={CX + 490} y={330} r={12 * (0.6 + 0.4 * wave01(p, 2, 0.4))} color={COL} />
      <Sparkle x={CX - 440} y={300} r={19 * (0.6 + 0.4 * wave01(p, 2, 0.7))} color={C.yellow} rot={-8} />
      <Sparkle x={CX - 500} y={380} r={11 * (0.6 + 0.4 * wave01(p, 2, 0.2))} color={C.sky} />
    </g>
  );
};
