// Labu Erlenmeyer berisi cairan hijau toska yang menggelegak: gelembung naik dan pecah di permukaan,
// permukaan beriak, uap keluar dari leher labu. Mendidih menguat di tengah loop lalu tenang kembali.
import React from 'react';
import {TAU, clamp, inOut, mix, mod, out, rng, wave, wave01, yoyo} from '../../kit/loop';
import {C, blend, shade} from '../../kit/palette';
import {Glow, Shadow, Sparkle} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'science-erlenmeyer-flask-bubbles',
  theme: 'science',
  title: 'Bubbling Erlenmeyer flask with rising bubbles and vapor, chemistry lab animation, seamless loop with alpha channel',
  keywords: [
    'erlenmeyer flask', 'chemistry', 'laboratory', 'flask', 'bubbles', 'chemical reaction', 'science', 'experiment', 'liquid',
    'boiling', 'vapor', 'lab glassware', 'research', 'potion', 'education', 'school', 'biology', 'pharmacy', 'medicine',
    'scientist', 'test', 'formula', 'discovery', 'innovation', 'icon', 'flat design', 'illustration', 'animation',
    'motion graphics', 'seamless loop', 'looped', 'alpha channel', 'transparent background', 'isolated', 'explainer',
    'presentation', 'social media', '4k', 'green', 'glass',
  ],
  category: 16,
  seconds: 8,
  vectorP: 0.5,
};

const CX = 960;
// Profil labu (luar): leher, bahu, kerucut, dasar
const NECK_TOP = 262;
const NECK_BOT = 440;
const BOT = 800;
const NECK_HW = 64;
const BASE_HW = 272;
const T_GLASS = 16;
const SLOPE = (BASE_HW - NECK_HW) / (BOT - NECK_BOT);
const SEC = 1 / Math.cos(Math.atan(SLOPE));
/** Setengah lebar bagian dalam pada ketinggian y (bagian kerucut). */
const innerHW = (y: number) => NECK_HW + (y - NECK_BOT) * SLOPE - T_GLASS * SEC;
const IN_BOT = BOT - T_GLASS;

const GLASS = blend(C.sky, C.white, 0.8);
const GLASS_EDGE = blend(C.sky, C.white, 0.42);
const LIQ = C.teal;
const LIQ_DARK = shade(LIQ, -0.16);
const LIQ_LIGHT = shade(LIQ, 0.4);

/** Path tertutup dengan jari-jari sudut berbeda per titik. */
const rpath = (pts: [number, number][], radii: number[]) => {
  const n = pts.length;
  let d = '';
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const l1 = Math.hypot(p0[0] - p1[0], p0[1] - p1[1]);
    const l2 = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const r = Math.min(radii[i], l1 / 2, l2 / 2);
    const a = [p1[0] + ((p0[0] - p1[0]) / l1) * r, p1[1] + ((p0[1] - p1[1]) / l1) * r];
    const b = [p1[0] + ((p2[0] - p1[0]) / l2) * r, p1[1] + ((p2[1] - p1[1]) / l2) * r];
    d += `${i ? 'L' : 'M'}${a[0].toFixed(1)},${a[1].toFixed(1)} Q${p1[0].toFixed(1)},${p1[1].toFixed(1)} ${b[0].toFixed(1)},${b[1].toFixed(1)} `;
  }
  return d + 'Z';
};

const outerPts: [number, number][] = [
  [CX - NECK_HW, NECK_TOP],
  [CX - NECK_HW, NECK_BOT],
  [CX - BASE_HW, BOT],
  [CX + BASE_HW, BOT],
  [CX + NECK_HW, NECK_BOT],
  [CX + NECK_HW, NECK_TOP],
];
const OUTER = rpath(outerPts, [0, 90, 46, 46, 90, 0]);
const IN_NECK = NECK_HW - T_GLASS;
const innerPts: [number, number][] = [
  [CX - IN_NECK, NECK_TOP - 4],
  [CX - IN_NECK, NECK_BOT + 4],
  [CX - innerHW(IN_BOT), IN_BOT],
  [CX + innerHW(IN_BOT), IN_BOT],
  [CX + IN_NECK, NECK_BOT + 4],
  [CX + IN_NECK, NECK_TOP - 4],
];
const INNER = rpath(innerPts, [0, 80, 34, 34, 80, 0]);

/** Cairan: permukaan bergelombang pada tinggi `lv`, dinding kiri/kanan bisa digeser ke dalam (untuk pita bayangan). */
const liquidPath = (lv: number, amp: number, ph: number, insetL = 0, insetR = 0, rad = 30) => {
  const yb = IN_BOT;
  const xl = (y: number) => CX - innerHW(y) + insetL;
  const xr = (y: number) => CX + innerHW(y) - insetR;
  const steps = 24;
  const surf: string[] = [];
  const x0 = xl(lv);
  const x1 = xr(lv);
  const sy = (x: number) => lv + amp * Math.sin((x - CX) / 46 + ph) * Math.sin(Math.PI * clamp((x - (CX - innerHW(lv))) / (2 * innerHW(lv))));
  for (let i = 0; i <= steps; i++) {
    const x = mix(x1, x0, i / steps);
    surf.push(`L${x.toFixed(1)},${sy(x).toFixed(1)}`);
  }
  // sudut bawah membulat
  const dl = [xl(yb) - xl(yb - rad), rad];
  const ll = Math.hypot(dl[0], dl[1]);
  const pl = [xl(yb) - (dl[0] / ll) * rad, yb - (dl[1] / ll) * rad];
  const pr = [xr(yb) + (dl[0] / ll) * rad, pl[1]];
  return (
    `M${x0.toFixed(1)},${sy(x0).toFixed(1)} L${pl[0].toFixed(1)},${pl[1].toFixed(1)} Q${xl(yb).toFixed(1)},${yb} ${(xl(yb) + rad).toFixed(1)},${yb} ` +
    `L${(xr(yb) - rad).toFixed(1)},${yb} Q${xr(yb).toFixed(1)},${yb} ${pr[0].toFixed(1)},${pr[1].toFixed(1)} L${x1.toFixed(1)},${sy(x1).toFixed(1)} ` +
    surf.join(' ') +
    ' Z'
  );
};

// Gelembung: posisi horizontal relatif, ukuran, kecepatan (putaran per loop, bulat), fase
const R = rng(7);
const BUBBLES = Array.from({length: 16}, (_, i) => ({
  u: (R() * 2 - 1) * 0.78,
  r: 9 + R() * 13,
  k: i % 3 === 0 ? 3 : 2,
  off: R(),
  wob: R(),
}));
const VAPOR = Array.from({length: 6}, (_, i) => ({off: i / 6, dx: (R() * 2 - 1) * 18, r: 20 + R() * 12, side: i % 2 ? 1 : -1}));

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  // intensitas didih: tenang → kuat → tenang (loop mulus)
  const boil = yoyo(p, 0.08, 0.3, 0.7, 0.92);
  const lv = 548 - 10 * boil + 3 * wave(p, 2);
  const amp = 3 + 7 * boil;
  const ph = TAU * 3 * p;
  const glowS = 0.6 + 0.4 * boil;
  return (
    <g>
      <Shadow cx={CX} cy={BOT + 14} rx={320} ry={30} vector={vector} />
      <Glow cx={CX} cy={640} r={330} color={LIQ} strength={0.35 * glowS} vector={vector} />
      {/* kaca */}
      <path d={OUTER} fill={GLASS_EDGE} />
      <path d={INNER} fill={GLASS} />
      {/* cairan + pita bayangan kanan */}
      <path d={liquidPath(lv, amp, ph)} fill={LIQ_DARK} />
      <path d={liquidPath(lv, amp, ph, 0, 74)} fill={LIQ} />
      {/* garis kilau permukaan */}
      <path
        d={`M${CX - innerHW(lv) + 34},${lv + 18} L${CX - innerHW(lv) + 110},${lv + 18}`}
        stroke={LIQ_LIGHT}
        strokeWidth={10}
        strokeLinecap="round"
      />
      {/* gelembung */}
      {BUBBLES.map((b, i) => {
        const t = mod(p * b.k + b.off, 1);
        const y = mix(IN_BOT - 24, lv + 8, inOut(t) * 0.35 + t * 0.65);
        const g = clamp(t / 0.12) * (t > 0.9 ? 1 - (t - 0.9) / 0.1 : 1);
        const live = i < 8 ? 1 : boil; // gelembung tambahan hanya saat didih kuat
        const r = b.r * (0.65 + 0.35 * t) * out(g) * (vector ? 1 : live);
        if (r < 1) return null;
        const lim = innerHW(y) - r - 16;
        const x = CX + b.u * lim + 10 * Math.sin(TAU * (t * 2 + b.wob));
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={r} fill={shade(LIQ, 0.28)} />
            <circle cx={x - r * 0.3} cy={y - r * 0.32} r={Math.max(2.5, r * 0.26)} fill={C.white} />
          </g>
        );
      })}
      {/* percikan pecah di permukaan */}
      {BUBBLES.slice(0, 10).map((b, i) => {
        const t = mod(p * b.k + b.off, 1);
        if (vector || t < 0.9) return null;
        const q = (t - 0.9) / 0.1;
        const x = CX + b.u * (innerHW(lv) - 30);
        const live = i < 8 ? 1 : boil;
        return (
          <g key={i} opacity={(1 - q) * live}>
            <circle cx={x - 14 * out(q)} cy={lv - 14 - 20 * out(q)} r={7} fill={LIQ_LIGHT} />
            <circle cx={x + 14 * out(q)} cy={lv - 12 - 24 * out(q)} r={6} fill={LIQ_LIGHT} />
          </g>
        );
      })}
      {/* kilau kaca: strip kiri pada kerucut dan leher */}
      <path
        d={`M${CX - innerHW(560) + 42},${560} L${CX - innerHW(720) + 42},${720}`}
        stroke={C.white}
        strokeWidth={14}
        strokeLinecap="round"
      />
      <circle cx={CX - innerHW(752) + 46} cy={752} r={7} fill={C.white} />
      <path d={`M${CX - IN_NECK + 18},${300} L${CX - IN_NECK + 18},${400}`} stroke={C.white} strokeWidth={12} strokeLinecap="round" />
      {/* tanda takaran (tanpa angka) */}
      {[616, 670, 724].map((y, i) => (
        <path
          key={y}
          d={`M${CX + innerHW(y) - 70 + (i % 2 ? 0 : 22)},${y} L${CX + innerHW(y) - 22},${y}`}
          stroke={blend(LIQ, C.white, 0.55)}
          strokeWidth={8}
          strokeLinecap="round"
        />
      ))}
      {/* bibir leher */}
      <rect x={CX - NECK_HW - 16} y={NECK_TOP - 30} width={(NECK_HW + 16) * 2} height={34} rx={17} fill={GLASS_EDGE} />
      <rect x={CX - NECK_HW - 16} y={NECK_TOP - 30} width={(NECK_HW + 16) * 2} height={22} rx={11} fill={blend(C.sky, C.white, 0.62)} />
      <rect x={CX - NECK_HW - 2} y={NECK_TOP - 24} width={34} height={8} rx={4} fill={C.white} />
      {/* uap */}
      {VAPOR.map((v, i) => {
        const t = vector ? [0.25, 0.55, 0.85, -1, -1, -1][i] : mod(p * 2 + v.off, 1);
        if (t < 0) return null;
        const y = NECK_TOP - 36 - 104 * out(t);
        const x = CX + v.dx + v.side * 34 * Math.sin(Math.PI * t) + 8 * wave(p, 2, v.off);
        const k = vector ? 1 : Math.sqrt(Math.sin(Math.PI * clamp(t * 1.1))) * (0.55 + 0.45 * boil);
        const r = v.r * (0.5 + 0.6 * t) * k;
        if (r < 1.5) return null;
        return <circle key={i} cx={x} cy={y} r={r} fill={blend(LIQ, C.white, 0.62)} />;
      })}
      {/* kilau di sekitar */}
      <Sparkle x={CX + 330} y={330} r={26 * (0.65 + 0.35 * wave01(p, 2))} color={C.yellow} rot={12} />
      <Sparkle x={CX + 252} y={250} r={14 * (0.6 + 0.4 * wave01(p, 2, 0.4))} color={C.sky} />
      <Sparkle x={CX - 330} y={420} r={20 * (0.6 + 0.4 * wave01(p, 2, 0.7))} color={C.yellow} rot={-8} />
      <Sparkle x={CX - 268} y={350} r={11 * (0.6 + 0.4 * wave01(p, 2, 0.2))} color={LIQ} />
    </g>
  );
};
