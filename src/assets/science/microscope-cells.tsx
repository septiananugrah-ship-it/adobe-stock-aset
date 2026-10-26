// Mikroskop: lampu menyala, sampel di kaca preparat berkilau, kenop fokus berputar, lalu jendela pembesaran
// muncul memperlihatkan sel-sel hidup yang bergoyang dan melayang; kemudian menutup kembali (loop bolak-balik).
import React from 'react';
import {TAU, inOut, out, outBack, seg, wave, wave01, yoyo} from '../../kit/loop';
import {C, blend, shade} from '../../kit/palette';
import {Glow, Shadow, Sparkle} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'science-microscope-cells',
  theme: 'science',
  title: 'Microscope with glowing sample and magnified view of living cells, biology research animation, seamless loop with alpha channel',
  keywords: [
    'microscope', 'cells', 'biology', 'science', 'laboratory', 'research', 'magnification', 'microbiology', 'cell', 'bacteria',
    'sample', 'slide', 'zoom', 'medicine', 'medical', 'healthcare', 'experiment', 'analysis', 'scientist', 'education', 'school',
    'discovery', 'virus', 'organism', 'nucleus', 'lens', 'icon', 'flat design', 'illustration', 'animation', 'motion graphics',
    'seamless loop', 'looped', 'alpha channel', 'transparent background', 'isolated', 'explainer', 'presentation',
    'social media', '4k', 'microscopic',
  ],
  category: 16,
  seconds: 8,
  vectorP: 0.5,
};

const OX = -125; // geser seluruh komposisi agar berpusat
const BODY = C.blue;
const METAL = blend(C.mist, C.steel, 0.25);
const SAMPLE = {x: 865 + OX, y: 578};
const MAG = {x: 1290 + OX, y: 400, r: 196};
const SLIDE = 270; // geseran mikroskop ke tengah saat jendela tertutup
const FIELD = blend(C.yellow, C.white, 0.82);
const CYTO = blend(C.pink, C.white, 0.5);
const MEMB = C.pink;
const NUC = C.purple;

/** Kurva tertutup halus (Catmull-Rom → Bézier) dari titik-titik. */
const blob = (pts: [number, number][]) => {
  const n = pts.length;
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d + 'Z';
};
const cellPath = (x: number, y: number, r: number, p: number, seed: number, amp = 0.05) =>
  blob(
    Array.from({length: 10}, (_, i) => {
      const a = (i * TAU) / 10;
      const rr = r * (1 + amp * Math.sin(TAU * (2 * p + seed + i * 0.29)) + 0.03 * Math.sin(i * 2.3 + seed * 9));
      return [x + rr * Math.cos(a), y + rr * Math.sin(a)] as [number, number];
    }),
  );

// Sel di jendela pembesaran (relatif pusat; r, fase)
const CELLS = [
  {x: 0, y: 4, r: 68, s: 0.1},
  {x: -104, y: -78, r: 44, s: 0.35},
  {x: 98, y: -86, r: 46, s: 0.6},
  {x: 104, y: 84, r: 44, s: 0.85},
  {x: -98, y: 92, r: 42, s: 0.2},
];
const DOTS = [
  [-150, 6, 9],
  [150, 2, 10],
  [-10, -132, 9],
  [10, 140, 8],
  [-52, -150, 7],
  [60, 150, 7],
];

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  const lamp = vector ? 1 : yoyo(p, 0.04, 0.1, 0.88, 0.95);
  const zoom = vector ? 1 : yoyo(p, 0.12, 0.24, 0.8, 0.88, (t) => outBack(t, 1.3), inOut);
  const cone = vector ? 1 : yoyo(p, 0.1, 0.18, 0.82, 0.9, out, inOut);
  const knob = 140 * seg(p, 0.08, 0.22) - 140 * seg(p, 0.84, 0.94);
  // saat istirahat mikroskop berdiri di tengah; bergeser ke kiri memberi ruang bagi jendela pembesaran
  const slide = vector ? 1 : yoyo(p, 0.05, 0.19, 0.83, 0.95);
  const sx = SLIDE * (1 - slide);
  const S = {x: SAMPLE.x + sx, y: SAMPLE.y};
  // garis singgung kerucut pembesaran dari sampel ke lingkaran
  const dx = MAG.x - S.x;
  const dy = MAG.y - S.y;
  const dist = Math.hypot(dx, dy);
  const base = Math.atan2(dy, dx);
  const half = Math.asin(Math.min(0.99, (MAG.r * zoom) / dist));
  const tan = (sgn: number) => {
    const a = base + sgn * half;
    const l = Math.sqrt(Math.max(0, dist * dist - (MAG.r * zoom) ** 2));
    return [S.x + l * Math.cos(a), S.y + l * Math.sin(a)];
  };
  const t1 = tan(1);
  const t2 = tan(-1);
  const coneCol = blend(C.yellow, C.white, 0.6);
  return (
    <g>
      {/* kerucut pembesaran (di belakang mikroskop) */}
      {cone > 0.01 && zoom > 0.01 ? (
        <path d={`M${S.x.toFixed(1)},${S.y} L${t1[0].toFixed(1)},${t1[1].toFixed(1)} L${MAG.x},${MAG.y} L${t2[0].toFixed(1)},${t2[1].toFixed(1)} Z`} fill={coneCol} opacity={vector || cone >= 1 ? undefined : cone} />
      ) : null}
      <g transform={sx ? `translate(${sx.toFixed(2)} 0)` : undefined}>
      <Shadow cx={780 + OX} cy={842} rx={260} ry={26} vector={vector} />
      {/* lengan (di belakang alas: ujung bawahnya tertutup alas) */}
      <path d={`M${700 + OX},${790} L${700 + OX},${560} C${700 + OX},${470} ${730 + OX},${420} ${812 + OX},${392}`} stroke={shade(BODY, -0.18)} strokeWidth={70} strokeLinecap="round" fill="none" />
      <path d={`M${692 + OX},${790} L${692 + OX},${560} C${692 + OX},${470} ${722 + OX},${414} ${806 + OX},${386}`} stroke={BODY} strokeWidth={54} strokeLinecap="round" fill="none" />
      <path d={`M${680 + OX},${720} L${680 + OX},${575}`} stroke={shade(BODY, 0.38)} strokeWidth={10} strokeLinecap="round" />
      {/* alas */}
      <rect x={600 + OX} y={792} width={360} height={48} rx={22} fill={shade(BODY, -0.22)} />
      <rect x={600 + OX} y={792} width={360} height={34} rx={17} fill={BODY} />
      <rect x={626 + OX} y={800} width={150} height={8} rx={4} fill={shade(BODY, 0.38)} />
      {/* lampu di alas */}
      <Glow cx={SAMPLE.x} cy={706} r={90} color={C.yellow} strength={1.3 * lamp} vector={vector} />
      <rect x={SAMPLE.x - 42} y={756} width={84} height={40} rx={12} fill={shade(METAL, -0.12)} />
      <path d={`M${SAMPLE.x - 34},${758} A34,34 0 0 1 ${SAMPLE.x + 34},${758} Z`} fill={blend(blend(C.mist, C.yellow, 0.3), C.yellow, lamp)} />
      <circle cx={SAMPLE.x - 10} cy={744} r={7} fill={blend(C.cloud, C.white, lamp)} />
      {/* berkas cahaya ke atas (motion) */}
      {!vector && lamp > 0.01 ? (
        <path d={`M${SAMPLE.x - 26},${724} L${SAMPLE.x - 14},${620} L${SAMPLE.x + 14},${620} L${SAMPLE.x + 26},${724} Z`} fill={C.yellow} opacity={0.28 * lamp} />
      ) : null}
      {/* tabung okuler miring */}
      <g transform={`rotate(-24 ${846 + OX} ${372})`}>
        <rect x={816 + OX} y={214} width={60} height={170} rx={14} fill={shade(METAL, -0.14)} />
        <rect x={816 + OX} y={214} width={42} height={170} rx={14} fill={METAL} />
        <rect x={804 + OX} y={190} width={84} height={40} rx={14} fill={shade(BODY, -0.2)} />
        <rect x={804 + OX} y={190} width={84} height={28} rx={12} fill={BODY} />
        <rect x={826 + OX} y={240} width={9} height={110} rx={4.5} fill={C.white} />
      </g>
      {/* kepala & revolver */}
      <rect x={790 + OX} y={350} width={150} height={130} rx={26} fill={shade(BODY, -0.18)} />
      <rect x={790 + OX} y={350} width={134} height={118} rx={24} fill={BODY} />
      <rect x={806 + OX} y={366} width={10} height={70} rx={5} fill={shade(BODY, 0.38)} />
      <path d={`M${812 + OX},${478} L${918 + OX},${478} L${902 + OX},${508} L${828 + OX},${508} Z`} fill={shade(METAL, -0.15)} />
      {/* objektif */}
      <rect x={SAMPLE.x - 18} y={500} width={36} height={52} rx={8} fill={METAL} />
      <rect x={SAMPLE.x + 4} y={500} width={14} height={52} rx={7} fill={shade(METAL, -0.15)} />
      <rect x={SAMPLE.x - 13} y={538} width={26} height={10} rx={5} fill={shade(C.yellow, -0.05)} />
      <g transform={`rotate(28 ${900 + OX} ${500})`}>
        <rect x={888 + OX} y={498} width={28} height={40} rx={8} fill={shade(METAL, -0.08)} />
      </g>
      {/* meja preparat + penjepit */}
      <rect x={700 + OX} y={594} width={110} height={26} rx={10} fill={shade(BODY, -0.18)} />
      <rect x={760 + OX} y={588} width={250} height={30} rx={12} fill={shade(C.slate, -0.25)} />
      <rect x={760 + OX} y={588} width={250} height={20} rx={10} fill={C.slate} />
      <rect x={780 + OX} y={595} width={80} height={6} rx={3} fill={shade(C.slate, 0.35)} />
      {/* kaca preparat & sampel */}
      <rect x={SAMPLE.x - 74} y={574} width={148} height={14} rx={5} fill={blend(C.sky, C.white, 0.55)} />
      <Glow cx={SAMPLE.x} cy={SAMPLE.y} r={46} color={C.pink} strength={1.6 * lamp} vector={vector} />
      <ellipse cx={SAMPLE.x} cy={SAMPLE.y + 1} rx={20} ry={6} fill={blend(shade(C.pink, -0.25), C.pink, lamp)} />
      <rect x={SAMPLE.x + 30} y={566} width={60} height={12} rx={6} fill={METAL} />
      {/* kenop fokus */}
      <circle cx={700 + OX} cy={650} r={38} fill={shade(METAL, -0.18)} />
      <circle cx={697 + OX} cy={647} r={32} fill={METAL} />
      <g transform={`rotate(${knob} ${697 + OX} ${647})`}>
        <rect x={691 + OX} y={619} width={12} height={22} rx={6} fill={shade(METAL, -0.28)} />
      </g>
      <circle cx={697 + OX} cy={647} r={11} fill={shade(METAL, 0.4)} />
      {/* kilau sampel saat menyala */}
      <Sparkle x={SAMPLE.x - 46} y={SAMPLE.y - 30} r={16 * lamp * (0.7 + 0.3 * wave01(p, 3))} color={C.yellow} rot={15} />
      <Sparkle x={560 + OX} y={330} r={18 * (0.55 + 0.45 * wave01(p, 2, 0.7))} color={C.yellow} rot={-10} />
      <Sparkle x={590 + OX} y={260} r={11 * (0.55 + 0.45 * wave01(p, 2, 0.2))} color={C.pink} />
      </g>
      {/* jendela pembesaran */}
      {zoom > 0.01 ? (
        <g transform={`translate(${MAG.x} ${MAG.y}) scale(${zoom}) translate(${-MAG.x} ${-MAG.y})`}>
          <circle cx={MAG.x} cy={MAG.y} r={MAG.r + 16} fill={shade(BODY, -0.18)} />
          <circle cx={MAG.x} cy={MAG.y} r={MAG.r + 14} fill={BODY} />
          <circle cx={MAG.x} cy={MAG.y} r={MAG.r} fill={FIELD} />
          {DOTS.map(([x, y, r], i) => (
            <ellipse
              key={`d${i}`}
              cx={MAG.x + x + 8 * wave(p, 1, i * 0.21)}
              cy={MAG.y + y + 8 * wave(p, 2, i * 0.13)}
              rx={r * 1.6}
              ry={r}
              fill={i % 2 ? blend(C.lime, C.green, 0.4) : blend(C.teal, C.white, 0.2)}
              transform={`rotate(${30 * i + 40 * wave(p, 1, i * 0.3)} ${MAG.x + x} ${MAG.y + y})`}
            />
          ))}
          {CELLS.map((c, i) => {
            const x = MAG.x + c.x + 7 * wave(p, 1, c.s);
            const y = MAG.y + c.y + 7 * wave(p, 1, c.s + 0.25);
            const nx = x + c.r * 0.2 * Math.cos(TAU * (p + c.s));
            const ny = y + c.r * 0.16 * Math.sin(TAU * (p + c.s));
            const pulse = 1 + 0.06 * wave(p, 2, c.s);
            return (
              <g key={i}>
                <path d={cellPath(x, y, c.r + 4, p, c.s)} fill={MEMB} />
                <path d={cellPath(x, y, c.r - 4, p, c.s)} fill={CYTO} />
                <circle cx={x - c.r * 0.42} cy={y + c.r * 0.38} r={Math.max(5, c.r * 0.09)} fill={shade(CYTO, -0.1)} />
                <circle cx={x + c.r * 0.45} cy={y - c.r * 0.32} r={Math.max(5, c.r * 0.08)} fill={shade(CYTO, -0.1)} />
                <circle cx={nx} cy={ny} r={c.r * 0.36 * pulse} fill={NUC} />
                <circle cx={nx + c.r * 0.08} cy={ny + c.r * 0.06} r={c.r * 0.12} fill={shade(NUC, -0.25)} />
                <circle cx={nx - c.r * 0.14} cy={ny - c.r * 0.14} r={Math.max(4, c.r * 0.07)} fill={shade(NUC, 0.45)} />
              </g>
            );
          })}
          {/* kilau lensa */}
          <path d={`M${MAG.x - MAG.r * 0.86},${MAG.y - MAG.r * 0.3} A${MAG.r * 0.91},${MAG.r * 0.91} 0 0 1 ${MAG.x - MAG.r * 0.3},${MAG.y - MAG.r * 0.86}`} stroke={C.white} strokeWidth={12} strokeLinecap="round" fill="none" />
        </g>
      ) : null}
      <Sparkle x={MAG.x + MAG.r + 50} y={MAG.y - MAG.r + 10} r={24 * zoom * (0.65 + 0.35 * wave01(p, 2))} color={C.yellow} rot={12} />
      <Sparkle x={MAG.x + MAG.r + 70} y={MAG.y - MAG.r + 80} r={12 * zoom * (0.6 + 0.4 * wave01(p, 2, 0.4))} color={C.sky} />
    </g>
  );
};
