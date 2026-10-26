// Gelas kimia berisi larutan bening; pipet tetes ditekan, setetes indikator (bening) jatuh, permukaan beriak,
// lalu warna merah muda mekar dari titik jatuh dan menyebar ke seluruh larutan (seperti fenolftalein dalam basa).
// Tahan dengan gelembung halus, lalu warna memudar kembali bening (loop).
import React from 'react';
import {clamp, inOut, mix, mod, out, rng, seg, wave, wave01, yoyo} from '../../kit/loop';
import {C, blend, shade} from '../../kit/palette';
import {Glow, Shadow, Sparkle} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'science-beaker-indicator-drop',
  theme: 'science',
  title: 'Dropper adds indicator drop to beaker and solution turns pink, chemical reaction animation, seamless loop with alpha channel',
  keywords: [
    'beaker', 'chemical reaction', 'indicator', 'dropper', 'pipette', 'drop', 'color change', 'chemistry', 'laboratory',
    'phenolphthalein', 'titration', 'solution', 'liquid', 'acid base', 'experiment', 'science', 'lab glassware', 'pink',
    'mixing', 'research', 'education', 'school', 'teaching', 'test', 'analysis', 'icon', 'flat design', 'illustration',
    'animation', 'motion graphics', 'seamless loop', 'looped', 'alpha channel', 'transparent background', 'isolated',
    'explainer', 'presentation', 'social media', '4k', 'ph',
  ],
  category: 16,
  seconds: 8,
  vectorP: 0.56,
};

const CX = 960;
const B = {l: CX - 235, r: CX + 235, top: 490, bot: 870}; // gelas luar
const T_G = 16;
const IN = {l: B.l + T_G, r: B.r - T_G, bot: B.bot - T_G};
const LV = 622; // permukaan cairan
const TIP_Y = 392; // ujung pipet (koordinat gambar pipet)
const PIP_S = 1.18; // skala pipet terhadap ujungnya
const PIP_DY = 22;
const TIP = TIP_Y + PIP_DY; // ujung pipet di layar
const DROP_R = 15;

const GLASS = blend(C.sky, C.white, 0.8);
const GLASS_EDGE = blend(C.sky, C.white, 0.42);
const CLEAR = blend(C.sky, C.white, 0.6);
const PINK = C.pink;
const BULB = C.purple;
const ID = 'science-beaker-indicator-drop';

const R = rng(5);
const BUB = Array.from({length: 9}, (_, i) => ({u: (R() * 2 - 1) * 0.8, r: 7 + R() * 8, k: i % 3 === 0 ? 2 : 1, off: R()}));

/** Path badan gelas: dinding tegak, sudut bawah membulat. */
const bodyPath = (l: number, r: number, top: number, bot: number, rad: number) =>
  `M${l},${top} L${l},${bot - rad} Q${l},${bot} ${l + rad},${bot} L${r - rad},${bot} Q${r},${bot} ${r},${bot - rad} L${r},${top} Z`;

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  // urutan: remas bulb → tetes tumbuh → jatuh → riak → warna mekar → tahan → pudar
  const squeeze = Math.sin(Math.PI * clamp((p - 0.06) / 0.12));
  const grow = seg(p, 0.08, 0.16, out);
  const fallT = clamp((p - 0.17) / 0.07);
  const falling = p >= 0.17 && p < 0.24;
  const impact = 0.24;
  const ripple = clamp((p - impact) / 0.16);
  const color = vector ? 1 : yoyo(p, impact + 0.01, 0.46, 0.74, 0.92, inOut, inOut);
  const cloud = vector ? 0 : clamp((p - impact) / 0.2);
  const liq = blend(CLEAR, PINK, color);
  const liqD = blend(blend(CLEAR, C.sky, 0.4), shade(PINK, -0.16), color);
  const surfAmp = 6 * Math.sin(Math.PI * ripple) * (1 - ripple) * 3 + 2 * wave01(p, 3);
  const hold = seg(p, 0.42, 0.5) * (1 - seg(p, 0.7, 0.76));
  const bob = 5 * wave(p, 2);
  // tetes
  let drop: React.ReactNode = null;
  if (!vector && p > 0.08 && p < 0.17) {
    const r = DROP_R * grow;
    drop = <ellipse cx={CX} cy={TIP + bob + r * 1.05} rx={r * 0.92} ry={r * 1.08} fill={CLEAR} />;
  } else if (!vector && falling) {
    const y = mix(TIP + bob + DROP_R, LV - 6, fallT * fallT);
    drop = (
      <g>
        <path d={`M${CX},${y - DROP_R * 2.1} Q${CX + DROP_R},${y - DROP_R * 0.6} ${CX + DROP_R},${y} A${DROP_R},${DROP_R} 0 0 1 ${CX - DROP_R},${y} Q${CX - DROP_R},${y - DROP_R * 0.6} ${CX},${y - DROP_R * 2.1} Z`} fill={CLEAR} />
        <circle cx={CX - 5} cy={y - 3} r={4} fill={C.white} />
      </g>
    );
  } else if (vector) {
    drop = <ellipse cx={CX} cy={TIP + DROP_R * 0.75} rx={DROP_R * 0.7} ry={DROP_R * 0.8} fill={CLEAR} />;
  }
  const surf = (y: number) => {
    const n = 20;
    return Array.from({length: n + 1}, (_, i) => {
      const x = mix(IN.r, IN.l, i / n);
      const dx = (x - CX) / 60;
      const yy = y + surfAmp * Math.cos(dx * 1.6 - ripple * 9) * Math.exp(-Math.abs(dx) * 0.25) * clamp(1 - Math.abs(x - CX) / 190 + 0.2);
      return `L${x.toFixed(1)},${yy.toFixed(1)}`;
    }).join(' ');
  };
  const liqPath = (inset = 0) => `M${IN.l},${LV} L${IN.l},${IN.bot - 26} Q${IN.l},${IN.bot} ${IN.l + 26},${IN.bot} L${IN.r - 26 - inset},${IN.bot} Q${IN.r - inset},${IN.bot} ${IN.r - inset},${IN.bot - 26} L${IN.r - inset},${LV} ${surf(LV)} Z`;
  return (
    <g>
      <Shadow cx={CX} cy={B.bot + 12} rx={260} ry={26} vector={vector} />
      <Glow cx={CX} cy={720} r={300} color={PINK} strength={0.4 * color} vector={vector} />
      {/* gelas */}
      <path d={bodyPath(B.l, B.r, B.top, B.bot, 40)} fill={GLASS_EDGE} />
      <path d={bodyPath(IN.l, IN.r, B.top + 4, IN.bot, 28)} fill={GLASS} />
      {/* cairan */}
      <path d={liqPath()} fill={liqD} />
      <path d={liqPath(80)} fill={liq} />
      {/* awan warna mekar dari titik jatuh (motion saja) */}
      {cloud > 0 && cloud < 1 && !vector ? (
        <g clipPath={`url(#${ID}-liq)`}>
          <clipPath id={`${ID}-liq`}>
            <path d={liqPath()} />
          </clipPath>
          {[0, 1, 2, 3, 4].map((i) => {
            const t = clamp(cloud * 1.3 - i * 0.07);
            if (t <= 0) return null;
            const ang = -0.6 + i * 0.3;
            const dist = 150 * out(t);
            return (
              <circle
                key={i}
                cx={CX + Math.sin(ang * 2.2) * dist * 0.9}
                cy={LV + 20 + Math.cos(ang) * dist}
                r={30 + 150 * out(t)}
                fill={PINK}
                opacity={0.55 * Math.sin(Math.PI * clamp(t))}
              />
            );
          })}
        </g>
      ) : null}
      {/* garis kilau permukaan */}
      <path d={`M${IN.l + 30},${LV + 20} L${IN.l + 104},${LV + 20}`} stroke={shade(liq, 0.42)} strokeWidth={10} strokeLinecap="round" />
      {/* gelembung saat bereaksi */}
      {BUB.map((b, i) => {
        const t = mod(p * b.k + b.off, 1);
        const k = vector ? (i < 4 ? 1 : 0) : hold * Math.sin(Math.PI * t);
        const r = b.r * (vector ? 1 : clamp(k * 1.6));
        if (r < 2) return null;
        const tt = vector ? [0.3, 0.55, 0.75, 0.42][i] : t;
        const y = mix(IN.bot - 30, LV + 22, tt);
        const x = CX + b.u * 180;
        return (
          <g key={i} opacity={vector || k >= 1 ? undefined : clamp(k * 1.6)}>
            <circle cx={x} cy={y} r={r} fill={shade(liq, 0.3)} />
            <circle cx={x - r * 0.3} cy={y - r * 0.3} r={Math.max(2.5, r * 0.28)} fill={C.white} />
          </g>
        );
      })}
      {/* riak lingkaran pada permukaan */}
      {!vector
        ? [0, 1].map((i) => {
            const t = clamp((p - impact - i * 0.04) / 0.14);
            if (t <= 0 || t >= 1) return null;
            return <ellipse key={i} cx={CX} cy={LV + 2} rx={18 + 180 * out(t)} ry={5 + 16 * out(t)} fill="none" stroke={shade(liq, 0.45)} strokeWidth={8} opacity={1 - t} />;
          })
        : null}
      {/* percikan */}
      {!vector
        ? [-1, 1].map((s) => {
            const t = clamp((p - impact) / 0.08);
            if (t <= 0 || t >= 1) return null;
            return <circle key={s} cx={CX + s * 34 * out(t)} cy={LV - 50 * Math.sin(Math.PI * t)} r={8 * (1 - t * 0.5)} fill={CLEAR} />;
          })
        : null}
      {/* kilau kaca, tanda takaran, bibir */}
      <path d={`M${IN.l + 22},${B.top + 50} L${IN.l + 22},${B.bot - 90}`} stroke={C.white} strokeWidth={14} strokeLinecap="round" />
      <circle cx={IN.l + 22} cy={B.bot - 60} r={7} fill={C.white} />
      {[680, 740, 800].map((y, i) => (
        <path key={y} d={`M${IN.r - 70 + (i % 2 ? 0 : 26)},${y} L${IN.r - 24},${y}`} stroke={blend(liq, C.white, 0.55)} strokeWidth={8} strokeLinecap="round" />
      ))}
      {[550, 590].map((y, i) => (
        <path key={y} d={`M${IN.r - 70 + (i % 2 ? 26 : 0)},${y} L${IN.r - 24},${y}`} stroke={GLASS_EDGE} strokeWidth={8} strokeLinecap="round" />
      ))}
      {/* bibir + cerat (kiri) */}
      <path d={`M${B.l - 46},${B.top - 30} Q${B.l - 20},${B.top - 30} ${B.l + 10},${B.top - 8} L${B.r + 6},${B.top - 8} Q${B.r + 18},${B.top - 8} ${B.r + 18},${B.top + 4} L${B.r + 18},${B.top + 10} Q${B.r + 18},${B.top + 22} ${B.r + 6},${B.top + 22} L${B.l + 10},${B.top + 22} Q${B.l - 6},${B.top + 22} ${B.l - 16},${B.top + 6} Q${B.l - 30},${B.top - 14} ${B.l - 46},${B.top - 20} Q${B.l - 54},${B.top - 25} ${B.l - 46},${B.top - 30} Z`} fill={GLASS_EDGE} />
      <rect x={B.l + 40} y={B.top - 1} width={140} height={9} rx={4.5} fill={C.white} />
      {/* tetes */}
      {drop}
      {/* pipet tetes */}
      <g transform={`translate(0 ${(bob + PIP_DY).toFixed(2)}) translate(${CX} ${TIP_Y}) scale(${PIP_S}) translate(${-CX} ${-TIP_Y})`}>
        <path d={`M${CX - 22},${250} L${CX + 22},${250} L${CX + 22},${340} L${CX + 8},${TIP_Y} L${CX - 8},${TIP_Y} L${CX - 22},${340} Z`} fill={GLASS_EDGE} />
        <path d={`M${CX - 12},${292} L${CX + 12},${292} L${CX + 12},${338} L${CX + 3},${TIP_Y - 8} L${CX - 3},${TIP_Y - 8} L${CX - 12},${338} Z`} fill={CLEAR} />
        <rect x={CX - 14} y={262} width={7} height={60} rx={3.5} fill={C.white} />
        {/* bulb karet */}
        <g transform={`translate(${CX} 250) scale(${1 + 0.16 * squeeze} ${1 - 0.14 * squeeze}) translate(${-CX} -250)`}>
          <rect x={CX - 34} y={230} width={68} height={34} rx={12} fill={shade(BULB, -0.18)} />
          <path d={`M${CX - 30},${236} L${CX - 30},${176} A30,30 0 0 1 ${CX + 30},${176} L${CX + 30},${236} Z`} fill={BULB} />
          <path d={`M${CX + 8},${236} L${CX + 8},${147.1} A30,30 0 0 1 ${CX + 30},${176} L${CX + 30},${236} Z`} fill={shade(BULB, -0.16)} />
          <rect x={CX - 20} y={168} width={9} height={50} rx={4.5} fill={shade(BULB, 0.4)} />
        </g>
      </g>
      <Sparkle x={CX + 330} y={330} r={26 * (0.4 + 0.6 * color) * (0.75 + 0.25 * wave01(p, 2))} color={C.yellow} rot={12} />
      <Sparkle x={CX + 400} y={410} r={13 * (0.6 + 0.4 * wave01(p, 2, 0.4))} color={PINK} />
      <Sparkle x={CX - 340} y={360} r={20 * (0.4 + 0.6 * color) * (0.75 + 0.25 * wave01(p, 2, 0.7))} color={C.yellow} rot={-8} />
      <Sparkle x={CX - 400} y={290} r={11 * (0.6 + 0.4 * wave01(p, 2, 0.2))} color={C.sky} />
    </g>
  );
};
