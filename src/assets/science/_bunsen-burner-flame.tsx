// Pembakar Bunsen: mula-mula lubang udara tertutup → nyala kuning bercahaya yang bergoyang (nyala aman).
// Cincin pengatur berputar membuka lubang udara, udara tersedot masuk, nyala berubah menjadi biru
// dengan kerucut dalam terang yang tegas dan kerucut luar biru-ungu; lalu lubang menutup kembali (loop).
import React from 'react';
import {clamp, inOut, mix, mod, seg, wave, wave01, yoyo} from '../../kit/loop';
import {C, blend, shade} from '../../kit/palette';
import {Glow, Shadow, Sparkle} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'science-bunsen-burner-flame',
  theme: 'science',
  title: 'Bunsen burner switching from yellow safety flame to blue flame with inner cone, chemistry lab animation, seamless loop',
  keywords: [
    'bunsen burner', 'flame', 'blue flame', 'chemistry', 'laboratory', 'burner', 'fire', 'gas', 'combustion', 'heat', 'science',
    'experiment', 'lab equipment', 'safety flame', 'yellow flame', 'inner cone', 'air hole', 'education', 'school', 'teaching',
    'research', 'hot', 'heating', 'scientist', 'icon', 'flat design', 'illustration', 'animation', 'motion graphics',
    'seamless loop', 'looped', 'alpha channel', 'transparent background', 'isolated', 'explainer', 'presentation',
    'social media', '4k', 'equipment',
  ],
  category: 16,
  seconds: 8,
  vectorP: 0.5,
};

const CX = 960;
const TOP = 478; // mulut laras
const BW = 36; // setengah lebar laras
const COL_Y = 690; // cincin pengatur udara
const COL_H = 74;
const BASE_Y = 806;
const FLOOR = 868;

const METAL = C.mist;
const METAL_D = shade(C.mist, -0.2);
const METAL_L = shade(C.mist, 0.5);
const DARK = C.navy;
const HOSE = C.orange;

/** Lidah api: alas lebar `w0` di y0, tinggi h, setengah lebar maksimum w, ujung bergeser `sw`. */
const flame = (y0: number, h: number, w: number, w0: number, sw: number, bulge = 1) => {
  const t = y0 - h;
  const f = (n: number) => n.toFixed(1);
  return (
    `M${f(CX - w0)},${f(y0)} ` +
    `C${f(CX - w * 1.18 * bulge)},${f(y0 - h * 0.18)} ${f(CX - w * 0.62 + sw * 0.35)},${f(y0 - h * 0.62)} ${f(CX + sw)},${f(t)} ` +
    `C${f(CX + w * 0.62 + sw * 0.35)},${f(y0 - h * 0.62)} ${f(CX + w * 1.18 * bulge)},${f(y0 - h * 0.18)} ${f(CX + w0)},${f(y0)} ` +
    `Q${f(CX)},${f(y0 + w0 * 0.5)} ${f(CX - w0)},${f(y0)} Z`
  );
};

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  // m: lubang udara terbuka (0 = tertutup, nyala kuning; 1 = terbuka, nyala biru)
  const m = vector ? 1 : yoyo(p, 0.12, 0.3, 0.72, 0.9);
  const mo = inOut(m);
  // nyala kuning: tinggi, bergoyang, memudar saat udara masuk
  const ySw = 16 * wave(p, 5) + 8 * wave(p, 8, 0.3);
  const yH = 330 + 14 * wave(p, 6, 0.2) + 8 * wave(p, 11);
  const yK = 1 - mo;
  // nyala biru: tumbuh dari bawah
  const bSw = 3 * wave(p, 9) + 2 * wave(p, 13, 0.4);
  const bH = mix(40, 286 + 6 * wave(p, 10), mo);
  const bW = mix(30, 62, mo);
  const iH = mix(10, 124 + 3 * wave(p, 12, 0.1), mo);
  const y0 = TOP + 8;
  // cincin berputar: alur bergeser
  const turn = (p < 0.5 ? seg(p, 0.12, 0.3) : 1 - seg(p, 0.72, 0.9)) * 1.0;
  const holeW = 6 + 30 * mo;
  return (
    <g>
      <Shadow cx={CX - 40} cy={FLOOR} rx={300} ry={26} vector={vector} />
      <Glow cx={CX} cy={TOP - 160} r={250 + 20 * wave01(p, 6)} color={C.yellow} strength={0.55 * yK} vector={vector} />
      <Glow cx={CX} cy={TOP - 120} r={220 + 10 * wave01(p, 8)} color={C.sky} strength={0.55 * mo} vector={vector} />
      {/* selang karet ke keran gas (keluar ke kiri) */}
      <path
        d={`M${CX - 150},${BASE_Y - 8} C${CX - 250},${BASE_Y - 8} ${CX - 270},${FLOOR - 16} ${CX - 360},${FLOOR - 16} L${CX - 430},${FLOOR - 16}`}
        fill="none"
        stroke={shade(HOSE, -0.18)}
        strokeWidth={30}
        strokeLinecap="round"
      />
      <path
        d={`M${CX - 150},${BASE_Y - 12} C${CX - 248},${BASE_Y - 12} ${CX - 268},${FLOOR - 21} ${CX - 360},${FLOOR - 21} L${CX - 430},${FLOOR - 21}`}
        fill="none"
        stroke={HOSE}
        strokeWidth={20}
        strokeLinecap="round"
      />
      <path d={`M${CX - 168},${BASE_Y - 17} L${CX - 196},${BASE_Y - 17}`} stroke={shade(HOSE, 0.4)} strokeWidth={6} strokeLinecap="round" />
      {/* nosel gas berulir */}
      <rect x={CX - 150} y={BASE_Y - 26} width={130} height={36} rx={12} fill={METAL_D} />
      <rect x={CX - 150} y={BASE_Y - 26} width={130} height={24} rx={10} fill={METAL} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={CX - 140 + i * 26} y={BASE_Y - 30} width={14} height={44} rx={7} fill={i === 0 ? METAL_D : shade(METAL, -0.08)} />
      ))}
      {/* kaki */}
      <path d={`M${CX - 150},${FLOOR - 6} Q${CX - 150},${BASE_Y - 4} ${CX - 60},${BASE_Y - 10} L${CX + 60},${BASE_Y - 10} Q${CX + 150},${BASE_Y - 4} ${CX + 150},${FLOOR - 6} Z`} fill={METAL_D} />
      <path d={`M${CX - 150},${FLOOR - 16} Q${CX - 150},${BASE_Y - 4} ${CX - 60},${BASE_Y - 10} L${CX + 30},${BASE_Y - 10} Q${CX + 104},${BASE_Y - 4} ${CX + 108},${FLOOR - 16} Z`} fill={METAL} />
      <rect x={CX - 180} y={FLOOR - 26} width={360} height={30} rx={15} fill={METAL_D} />
      <rect x={CX - 180} y={FLOOR - 26} width={320} height={18} rx={9} fill={METAL} />
      <path d={`M${CX - 120},${BASE_Y + 22} Q${CX - 104},${BASE_Y + 6} ${CX - 70},${BASE_Y + 2}`} fill="none" stroke={METAL_L} strokeWidth={9} strokeLinecap="round" />
      {/* nyala kuning (di belakang) */}
      {yK > 0.01 ? (
        <g opacity={yK >= 0.999 ? undefined : yK}>
          <path d={flame(y0, yH, 78, BW - 4, ySw)} fill={C.orange} />
          <path d={flame(y0, yH * 0.8, 58, BW - 8, ySw * 0.8)} fill={C.yellow} />
          <path d={flame(y0, yH * 0.46, 34, BW - 14, ySw * 0.4)} fill={blend(C.yellow, C.white, 0.55)} />
          <path d={flame(y0, 46, 26, BW - 10, 0, 0.9)} fill={C.blue} />
        </g>
      ) : null}
      {/* nyala biru: kerucut luar (2 tingkat) + kerucut dalam tegas */}
      {mo > 0.01 ? (
        <g opacity={vector || mo >= 0.999 ? undefined : clamp(mo * 2.5)}>
          <path d={flame(y0, bH, bW, BW - 2, bSw)} fill={blend(C.blue, C.violet, 0.55)} />
          <path d={flame(y0, bH * 0.86, bW * 0.78, BW - 6, bSw * 0.8)} fill={C.blue} />
          <path d={flame(y0, iH, bW * 0.5, BW - 10, 0, 0.8)} fill={blend(C.sky, C.white, 0.3)} />
          <path d={flame(y0, iH * 0.62, bW * 0.26, BW - 20, 0, 0.7)} fill={C.white} />
        </g>
      ) : null}
      {/* laras */}
      <rect x={CX - BW} y={TOP} width={BW * 2} height={BASE_Y - TOP} rx={10} fill={METAL_D} />
      <rect x={CX - BW} y={TOP} width={BW * 1.36} height={BASE_Y - TOP} rx={10} fill={METAL} />
      <rect x={CX - BW + 12} y={TOP + 26} width={11} height={COL_Y - TOP - 50} rx={5.5} fill={METAL_L} />
      <rect x={CX - BW - 8} y={TOP - 8} width={BW * 2 + 16} height={22} rx={11} fill={METAL_D} />
      <rect x={CX - BW - 8} y={TOP - 8} width={BW * 2 + 4} height={14} rx={7} fill={METAL} />
      {/* cincin pengatur udara */}
      <rect x={CX - BW - 14} y={COL_Y} width={(BW + 14) * 2} height={COL_H} rx={14} fill={shade(C.steel, -0.12)} />
      <rect x={CX - BW - 14} y={COL_Y} width={(BW + 14) * 1.4} height={COL_H} rx={14} fill={C.steel} />
      {/* alur cincin bergeser saat diputar */}
      {[0, 1, 2, 3, 4].map((i) => {
        const u = mod(i / 5 + turn * 0.4, 1);
        const x = CX + (BW + 6) * Math.sin(Math.PI * (u - 0.5));
        const vis = Math.sin(Math.PI * u);
        if (vis < 0.3) return null;
        return <rect key={i} x={x - 3} y={COL_Y + 10} width={6} height={COL_H - 20} rx={3} fill={shade(C.steel, -0.22)} />;
      })}
      {/* lubang udara */}
      <rect x={CX - holeW / 2} y={COL_Y + 20} width={holeW} height={COL_H - 40} rx={Math.min(10, holeW / 2)} fill={DARK} />
      {/* udara tersedot masuk: titik-titik meluncur ke lubang dari kiri & kanan */}
      {!vector
        ? [0, 1, 2, 3, 4, 5].map((i) => {
            const t = mod(p * 5 + i / 6, 1);
            const k = mo * Math.sin(Math.PI * t);
            if (k < 0.05) return null;
            const side = i % 2 ? 1 : -1;
            const x = CX + side * (150 - 140 * inOut(t));
            const y = COL_Y + COL_H / 2 - 30 * (1 - t) * (i % 3 === 0 ? 1 : -0.6);
            return <circle key={i} cx={x} cy={y} r={7 + 5 * k} fill={blend(C.sky, C.white, 0.35)} opacity={k} />;
          })
        : null}
      <Sparkle x={CX + 300} y={260} r={24 * (0.65 + 0.35 * wave01(p, 2))} color={C.yellow} rot={12} />
      <Sparkle x={CX + 372} y={340} r={12 * (0.6 + 0.4 * wave01(p, 2, 0.4))} color={C.sky} />
      <Sparkle x={CX - 300} y={330} r={19 * (0.6 + 0.4 * wave01(p, 2, 0.7))} color={C.sky} rot={-8} />
      <Sparkle x={CX - 362} y={250} r={11 * (0.6 + 0.4 * wave01(p, 2, 0.2))} color={C.yellow} />
    </g>
  );
};
