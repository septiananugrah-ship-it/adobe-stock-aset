// Teleskop refraktor di atas tripod memindai langit: bintang-bintang berkelip bergantian, garis rasi bintang
// tergambar, bintang jatuh melintas, lensa berkilau; lalu rasi memudar dan teleskop kembali ke posisi awal (loop).
import React from 'react';
import {clamp, inOut, mix, out, outBack, wave, wave01, yoyo} from '../../kit/loop';
import {C, blend, shade} from '../../kit/palette';
import {Glow, Shadow, Sparkle, roundedPath, starPts} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'science-telescope-shooting-star',
  theme: 'science',
  title: 'Telescope on tripod scanning night sky with twinkling stars, constellation and shooting star, astronomy animation loop',
  keywords: [
    'telescope', 'astronomy', 'stars', 'shooting star', 'constellation', 'night sky', 'space', 'moon', 'stargazing',
    'observatory', 'science', 'universe', 'galaxy', 'cosmos', 'meteor', 'explore', 'discovery', 'education', 'school',
    'learning', 'research', 'tripod', 'twinkle', 'astronomer', 'icon', 'flat design', 'illustration', 'animation',
    'motion graphics', 'seamless loop', 'looped', 'alpha channel', 'transparent background', 'isolated', 'explainer',
    'presentation', 'social media', '4k', 'astrophysics',
  ],
  category: 16,
  seconds: 8,
  vectorP: 0.5,
};

const DX = -110; // geser komposisi agar berpusat
const PV = {x: 900 + DX, y: 596}; // poros teleskop
const FLOOR = 884;
const TUBE = C.blue;
const TUBE_D = shade(TUBE, -0.2);
const TUBE_L = shade(TUBE, 0.4);
const METAL = C.navy;
const LEG = C.slate;

// bintang: posisi, ukuran, fase kelip
const STARS = [
  {x: 1330, y: 330, r: 38, ph: 0.0, c: C.yellow},
  {x: 1480, y: 400, r: 28, ph: 0.3, c: C.yellow},
  {x: 1640, y: 346, r: 33, ph: 0.6, c: C.yellow},
  {x: 1590, y: 530, r: 26, ph: 0.15, c: C.yellow},
  {x: 1440, y: 590, r: 22, ph: 0.45, c: C.yellow},
].map((s) => ({...s, x: s.x + DX}));
const LINKS: [number, number][] = [[0, 1], [1, 2], [1, 3], [3, 4]];
const TWINKLES = [
  {x: 1180, y: 420, r: 16, ph: 0.2, c: C.sky},
  {x: 1700, y: 460, r: 14, ph: 0.7, c: C.violet},
  {x: 1100, y: 160, r: 15, ph: 0.5, c: C.sky},
  {x: 470, y: 470, r: 15, ph: 0.85, c: C.violet},
  {x: 760, y: 170, r: 13, ph: 0.35, c: C.sky},
  {x: 1660, y: 560, r: 12, ph: 0.1, c: C.yellow},
].map((s) => ({...s, x: s.x + DX}));
const MOON = {x: 600 + DX, y: 290, r: 82};

/** Bulan sabit: lingkaran luar dikurangi lingkaran dalam bergeser (path dua busur, tanpa mask). */
const crescent = (cx: number, cy: number, R: number, dx: number, dy: number, r2: number) => {
  const d = Math.hypot(dx, dy);
  const a = (R * R - r2 * r2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, R * R - a * a));
  const ux = dx / d;
  const uy = dy / d;
  const mx = cx + a * ux;
  const my = cy + a * uy;
  const p1 = [mx - h * uy, my + h * ux];
  const p2 = [mx + h * uy, my - h * ux];
  return `M${p1[0].toFixed(1)},${p1[1].toFixed(1)} A${R},${R} 0 1 1 ${p2[0].toFixed(1)},${p2[1].toFixed(1)} A${r2},${r2} 0 0 0 ${p1[0].toFixed(1)},${p1[1].toFixed(1)} Z`;
};

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  // sudut teleskop: memindai pelan, lalu mengikuti bintang jatuh
  const track = vector ? 0.5 : yoyo(p, 0.36, 0.52, 0.66, 0.84);
  const ang = -30 - 2.5 * wave(p, 1) * (1 - track) - 7 * inOut(track);
  const cons = vector ? 1 : yoyo(p, 0.1, 0.34, 0.74, 0.9);
  // bintang jatuh
  const sT = vector ? 0.55 : clamp((p - 0.4) / 0.16);
  const sOn = vector ? 1 : Math.sin(Math.PI * sT);
  const S0 = [1330 + DX, 128];
  const S1 = [1660 + DX, 236];
  const head = [mix(S0[0], S1[0], out(sT)), mix(S0[1], S1[1], out(sT))];
  const tl = 170 * sOn;
  const dirx = (S1[0] - S0[0]) / Math.hypot(S1[0] - S0[0], S1[1] - S0[1]);
  const diry = (S1[1] - S0[1]) / Math.hypot(S1[0] - S0[0], S1[1] - S0[1]);
  const glint = vector ? 0.6 : yoyo(p, 0.5, 0.56, 0.62, 0.7, (t) => outBack(t, 2));
  return (
    <g>
      <Shadow cx={PV.x + 10} cy={FLOOR} rx={250} ry={26} vector={vector} />
      {/* bulan */}
      <Glow cx={MOON.x} cy={MOON.y} r={150 + 10 * wave01(p, 2)} color={C.yellow} strength={0.5} vector={vector} />
      <path d={crescent(MOON.x, MOON.y, MOON.r, 44, -30, MOON.r * 0.86)} fill={C.yellow} />
      <circle cx={MOON.x - 30} cy={MOON.y + 42} r={11} fill={shade(C.yellow, -0.12)} />
      <circle cx={MOON.x - 56} cy={MOON.y - 6} r={14} fill={shade(C.yellow, -0.12)} />
      {/* rasi bintang */}
      {LINKS.map(([a, b], i) => {
        const k = clamp(cons * 1.6 - i * 0.18);
        if (k <= 0.01) return null;
        const A = STARS[a];
        const B = STARS[b];
        return (
          <path
            key={i}
            d={`M${A.x},${A.y} L${mix(A.x, B.x, k).toFixed(1)},${mix(A.y, B.y, k).toFixed(1)}`}
            stroke={blend(C.sky, C.white, 0.2)}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray="4 22"
          />
        );
      })}
      {STARS.map((s, i) => {
        const tw = 0.82 + 0.18 * wave(p, 3, s.ph);
        const k = (0.8 + 0.2 * cons) * tw;
        return (
          <g key={i}>
            <Glow cx={s.x} cy={s.y} r={s.r * 2.2} color={s.c} strength={0.6 * cons} vector={vector} />
            <path d={roundedPath(starPts(s.x, s.y, s.r * k, s.r * k * 0.48, 5), 4)} fill={s.c} />
          </g>
        );
      })}
      {TWINKLES.map((s, i) => (
        <Sparkle key={i} x={s.x} y={s.y} r={s.r * (0.55 + 0.45 * wave01(p, 2, s.ph))} color={s.c} rot={i * 10} />
      ))}
      {/* bintang jatuh */}
      {sOn > 0.02 ? (
        <g opacity={vector || sOn >= 0.999 ? undefined : Math.min(1, sOn * 1.5)}>
          <path
            d={`M${(head[0] - dirx * tl).toFixed(1)},${(head[1] - diry * tl).toFixed(1)} L${(head[0] - diry * 9).toFixed(1)},${(head[1] + dirx * 9).toFixed(1)} L${(head[0] + diry * 9).toFixed(1)},${(head[1] - dirx * 9).toFixed(1)} Z`}
            fill={blend(C.yellow, C.white, 0.45)}
          />
          <Sparkle x={head[0]} y={head[1]} r={24} color={C.yellow} rot={20} />
        </g>
      ) : null}
      {/* tripod: kaki belakang, kepala, kaki depan */}
      <path d={`M${PV.x + 6},${PV.y + 40} L${PV.x + 40},${FLOOR - 30}`} stroke={shade(LEG, -0.25)} strokeWidth={22} strokeLinecap="round" />
      <path d={`M${PV.x - 10},${PV.y + 40} L${PV.x - 170},${FLOOR - 6}`} stroke={LEG} strokeWidth={26} strokeLinecap="round" />
      <path d={`M${PV.x + 10},${PV.y + 40} L${PV.x + 180},${FLOOR - 6}`} stroke={shade(LEG, -0.12)} strokeWidth={26} strokeLinecap="round" />
      <path d={`M${PV.x - 98},${PV.y + 168} L${PV.x + 108},${PV.y + 168}`} stroke={shade(LEG, -0.2)} strokeWidth={14} strokeLinecap="round" />
      <rect x={PV.x - 40} y={PV.y + 14} width={80} height={52} rx={14} fill={METAL} />
      <rect x={PV.x - 40} y={PV.y + 14} width={80} height={20} rx={10} fill={shade(METAL, 0.2)} />
      {/* teleskop */}
      <g transform={`translate(${PV.x} ${PV.y}) rotate(${ang.toFixed(3)})`}>
        {/* okuler */}
        <rect x={-268} y={-17} width={60} height={34} rx={10} fill={METAL} />
        <rect x={-286} y={-24} width={30} height={48} rx={10} fill={shade(METAL, 0.15)} />
        <rect x={-218} y={-30} width={40} height={60} rx={10} fill={C.slate} />
        <circle cx={-198} cy={38} r={13} fill={C.slate} />
        {/* tabung */}
        <rect x={-190} y={-42} width={420} height={84} rx={22} fill={TUBE_D} />
        <rect x={-190} y={-42} width={420} height={62} rx={22} fill={TUBE} />
        <rect x={-150} y={-30} width={300} height={12} rx={6} fill={TUBE_L} />
        {/* pelindung embun (lebih lebar) */}
        <rect x={200} y={-56} width={170} height={112} rx={24} fill={TUBE_D} />
        <rect x={200} y={-56} width={170} height={84} rx={24} fill={TUBE} />
        <rect x={226} y={-44} width={110} height={12} rx={6} fill={TUBE_L} />
        <ellipse cx={368} cy={0} rx={18} ry={50} fill={blend(C.sky, C.white, 0.35)} />
        <ellipse cx={372} cy={-14} rx={6} ry={16} fill={C.white} />
        {/* cincin penjepit */}
        <rect x={-36} y={-50} width={30} height={100} rx={10} fill={METAL} />
        <rect x={84} y={-50} width={30} height={100} rx={10} fill={METAL} />
        {/* teropong pencari */}
        <rect x={-20} y={-74} width={14} height={30} rx={5} fill={METAL} />
        <rect x={86} y={-74} width={14} height={30} rx={5} fill={METAL} />
        <rect x={-60} y={-94} width={190} height={34} rx={14} fill={C.slate} />
        <rect x={-60} y={-94} width={190} height={22} rx={11} fill={shade(C.slate, 0.2)} />
        <rect x={124} y={-98} width={22} height={42} rx={8} fill={METAL} />
        {/* kilau lensa */}
        <Sparkle x={392} y={-38} r={30 * glint} color={C.yellow} rot={15} />
      </g>
      <circle cx={PV.x} cy={PV.y} r={18} fill={shade(METAL, 0.25)} />
      <circle cx={PV.x} cy={PV.y} r={8} fill={C.mist} />
    </g>
  );
};
