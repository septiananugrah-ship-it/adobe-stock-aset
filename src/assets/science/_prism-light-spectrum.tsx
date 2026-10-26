// Prisma kaca membiaskan cahaya putih dari senter menjadi spektrum pelangi. Sinar dilacak dengan hukum Snell
// (indeks bias bergantung warna, dispersi diperbesar agar terlihat): merah dibelokkan paling sedikit (paling atas),
// ungu paling banyak (paling bawah). Cahaya menyala, kipas spektrum mekar, prisma bergoyang halus sehingga kipas
// ikut bergeser, lalu cahaya padam bergerak menjauh (loop).
import React from 'react';
import {TAU, clamp, inOut, mix, mod, out, seg, wave, wave01, yoyo} from '../../kit/loop';
import {C, blend, shade} from '../../kit/palette';
import {Glow, Sparkle, roundedPath} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'science-prism-light-spectrum',
  theme: 'science',
  title: 'Glass prism refracting white light into rainbow spectrum, optics physics animation, seamless loop with alpha channel',
  keywords: [
    'prism', 'light', 'spectrum', 'rainbow', 'refraction', 'dispersion', 'optics', 'physics', 'science', 'white light',
    'color spectrum', 'glass', 'beam', 'flashlight', 'wavelength', 'visible light', 'colors', 'education', 'school',
    'experiment', 'laboratory', 'teaching', 'newton', 'ray', 'icon', 'flat design', 'illustration', 'animation',
    'motion graphics', 'seamless loop', 'looped', 'alpha channel', 'transparent background', 'isolated', 'explainer',
    'presentation', 'social media', '4k', 'colorful', 'learning',
  ],
  category: 16,
  seconds: 8,
  vectorP: 0.5,
};

type V = [number, number];
const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1]];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1]];
const mul = (a: V, k: number): V => [a[0] * k, a[1] * k];
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1];
const norm = (a: V): V => mul(a, 1 / Math.hypot(a[0], a[1]));
const f1 = (v: V) => `${v[0].toFixed(1)},${v[1].toFixed(1)}`;

const PC: V = [900, 470]; // titik berat prisma
const SIDE = 400;
const RAD = SIDE / Math.sqrt(3);
const DEPTH: V = [34, -26]; // tebal prisma (sisi belakang)
const BEAM_W = 22;
const FAN = 560; // panjang kipas setelah keluar

// warna spektrum (merah → ungu) dan indeks bias (dispersi diperbesar)
const SPEC = [C.coral, C.orange, C.yellow, C.green, C.sky, C.blue, C.purple];
const N_RED = 1.44;
const N_VIO = 1.64;
const nAt = (u: number) => mix(N_RED, N_VIO, u);
const WHITE = blend(C.yellow, C.white, 0.72);

const GLASS = blend(C.sky, C.white, 0.78);
const GLASS_EDGE = blend(C.sky, C.white, 0.45);
const GLASS_BACK = blend(C.sky, C.white, 0.6);

/** Simpul prisma (puncak, kiri-bawah, kanan-bawah) diputar rot radian. */
const verts = (rot: number): V[] =>
  [-90, 150, 30].map((deg) => {
    const a = (deg * Math.PI) / 180 + rot;
    return [PC[0] + RAD * Math.cos(a), PC[1] + RAD * Math.sin(a)] as V;
  });

/** Potong sinar o + t·d dengan segmen a–b; kembalikan t atau −1. */
const hit = (o: V, d: V, a: V, b: V) => {
  const e = sub(b, a);
  const den = d[0] * e[1] - d[1] * e[0];
  if (Math.abs(den) < 1e-9) return -1;
  const w = sub(a, o);
  const t = (w[0] * e[1] - w[1] * e[0]) / den;
  const s = (w[0] * d[1] - w[1] * d[0]) / den;
  return s >= 0 && s <= 1 && t > 1e-6 ? t : -1;
};
/** Hukum Snell bentuk vektor; nrm menghadap ke arah datang sinar. */
const refract = (d: V, nrm: V, eta: number): V => {
  const ci = -dot(nrm, d);
  const k = 1 - eta * eta * (1 - ci * ci);
  if (k < 0) return d;
  return norm(add(mul(d, eta), mul(nrm, eta * ci - Math.sqrt(k))));
};
const outward = (a: V, b: V): V => {
  const e = norm(sub(b, a));
  const nn: V = [e[1], -e[0]];
  const mid = mul(add(a, b), 0.5);
  return dot(nn, sub(mid, PC)) > 0 ? nn : mul(nn, -1);
};

// sinar datang: mengenai titik tengah sisi kiri dengan sudut deviasi minimum untuk n = 1,54 (prisma tegak)
const V0 = verts(0);
const ENTRY: V = mul(add(V0[0], V0[1]), 0.5);
const DIR: V = (() => {
  const nIn = mul(outward(V0[0], V0[1]), -1);
  const i = Math.asin(1.54 * Math.sin(Math.PI / 6));
  const a = Math.atan2(nIn[1], nIn[0]) - i; // putar ke atas (layar)
  return [Math.cos(a), Math.sin(a)];
})();
const SRC: V = sub(ENTRY, mul(DIR, 430));

/** Lacak satu warna: titik masuk, titik keluar, arah keluar. */
const trace = (rot: number, n: number) => {
  const v = verts(rot);
  const faces: [V, V][] = [
    [v[0], v[1]],
    [v[1], v[2]],
    [v[2], v[0]],
  ];
  const o = sub(ENTRY, mul(DIR, 300));
  const t0 = hit(o, DIR, faces[0][0], faces[0][1]);
  const p1 = add(o, mul(DIR, t0));
  const d1 = refract(DIR, outward(faces[0][0], faces[0][1]), 1 / n);
  let best = 1e9;
  let fi = 2;
  [1, 2].forEach((k) => {
    const t = hit(p1, d1, faces[k][0], faces[k][1]);
    if (t > 0 && t < best) {
      best = t;
      fi = k;
    }
  });
  const p2 = add(p1, mul(d1, best));
  const nOut = outward(faces[fi][0], faces[fi][1]);
  const d2 = refract(d1, mul(nOut, -1), n);
  return {p1, p2, d2};
};

const Torch: React.FC<{on: number}> = ({on}) => {
  const ang = (Math.atan2(DIR[1], DIR[0]) * 180) / Math.PI;
  return (
    <g transform={`translate(${f1(SRC)}) rotate(${ang.toFixed(2)})`}>
      <rect x={-250} y={-34} width={200} height={68} rx={26} fill={shade(C.navy, -0.2)} />
      <rect x={-250} y={-34} width={200} height={52} rx={24} fill={C.ink} />
      <rect x={-200} y={-22} width={70} height={10} rx={5} fill={shade(C.ink, 0.3)} />
      <rect x={-118} y={-46} width={34} height={22} rx={8} fill={C.coral} />
      <path d="M-60,-40 L-6,-64 Q8,-64 8,-50 L8,50 Q8,64 -6,64 L-60,40 Z" fill={C.slate} />
      <path d="M-60,-40 L-6,-64 Q8,-64 8,-50 L8,24 L-60,24 Z" fill={shade(C.slate, 0.12)} />
      <rect x={0} y={-56} width={16} height={112} rx={8} fill={on > 0.5 ? WHITE : C.mist} />
    </g>
  );
};

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  // cahaya: kepala sinar maju lalu ekor menyusul (padam bergerak menjauh)
  const head = vector ? 1 : seg(p, 0.08, 0.34, inOut);
  const tail = vector ? 0 : seg(p, 0.74, 0.92, inOut);
  const on = vector ? 1 : yoyo(p, 0.06, 0.1, 0.74, 0.8);
  const hold = seg(p, 0.34, 0.42) * (1 - seg(p, 0.66, 0.74));
  const rot = vector ? 0 : 0.05 * wave(p, 1, 0.25) * yoyo(p, 0.3, 0.42, 0.62, 0.74) * 1 + 0 * TAU;
  const v = verts(rot);
  const L1 = 430; // sumber → masuk
  const L2 = 230; // dalam kaca (perkiraan)
  const LT = L1 + L2 + FAN;
  const s1 = head * LT; // posisi kepala sepanjang lintasan
  const s0 = tail * LT; // posisi ekor
  const tr = SPEC.map((_, i) => [trace(rot, nAt(i / SPEC.length)), trace(rot, nAt((i + 1) / SPEC.length))]);
  const mid = trace(rot, nAt(0.5));
  // segmen sinar putih
  const wA = clamp(s0, 0, L1);
  const wB = clamp(s1, 0, L1);
  const beamPt = (s: number) => add(SRC, mul(DIR, s));
  const perp: V = [-DIR[1], DIR[0]];
  // dalam kaca: kipas sempit dari titik masuk ke titik keluar merah/ungu
  const inK = clamp((s1 - L1) / L2) * (1 - clamp((s0 - L1) / L2));
  const fanA = clamp(s0 - L1 - L2, 0, FAN);
  const fanB = clamp(s1 - L1 - L2, 0, FAN);
  const pRed = tr[0][0];
  const pVio = tr[SPEC.length - 1][1];
  const back = v.map((q) => add(q, DEPTH)) as V[];
  return (
    <g>
      <Glow cx={PC[0]} cy={PC[1]} r={300} color={C.sky} strength={0.35 * on} vector={vector} />
      {/* prisma: sisi belakang dan rusuk tebal */}
      <path d={roundedPath(back, 22)} fill={GLASS_BACK} />
      <path d={roundedPath([v[0], add(v[0], DEPTH), add(v[2], DEPTH), v[2]], 10)} fill={GLASS_EDGE} />
      <path d={roundedPath(v, 22)} fill={GLASS_EDGE} />
      <path d={roundedPath(verts(rot).map((q) => add(PC, mul(sub(q, PC), 0.9))) as V[], 16)} fill={GLASS} />
      {/* sinar putih masuk */}
      {wB - wA > 1 ? (
        <path
          d={`M${f1(add(beamPt(wA), mul(perp, -BEAM_W / 2)))} L${f1(add(beamPt(wB), mul(perp, -BEAM_W / 2)))} L${f1(add(beamPt(wB), mul(perp, BEAM_W / 2)))} L${f1(add(beamPt(wA), mul(perp, BEAM_W / 2)))} Z`}
          fill={WHITE}
        />
      ) : null}
      {/* cahaya di dalam kaca */}
      {inK > 0.01 ? (
        <path d={`M${f1(add(ENTRY, mul(perp, -BEAM_W / 2)))} L${f1(pRed.p2)} L${f1(pVio.p2)} L${f1(add(ENTRY, mul(perp, BEAM_W / 2)))} Z`} fill={WHITE} opacity={vector || inK >= 1 ? undefined : inK} />
      ) : null}
      {/* kipas spektrum */}
      {fanB - fanA > 1
        ? SPEC.map((c, i) => {
            const [a, b] = tr[i];
            const st = clamp(fanB / FAN);
            const r0 = fanA;
            const r1 = Math.max(r0, fanB - i * 6 * (1 - st));
            const q = [add(a.p2, mul(a.d2, r0)), add(a.p2, mul(a.d2, r1)), add(b.p2, mul(b.d2, r1)), add(b.p2, mul(b.d2, r0))];
            return <path key={i} d={`M${q.map(f1).join(' L')} Z`} fill={c} />;
          })
        : null}
      {/* fotón kecil berjalan di tiap warna */}
      {!vector && hold > 0.01
        ? SPEC.map((c, i) => {
            const t = mod(p * 4 + i * 0.13, 1);
            const a = trace(rot, nAt((i + 0.5) / SPEC.length));
            const q = add(a.p2, mul(a.d2, 40 + (FAN - 80) * t));
            const k = hold * Math.sin(Math.PI * t);
            return <circle key={i} cx={q[0]} cy={q[1]} r={7} fill={shade(c, 0.55)} opacity={k} />;
          })
        : null}
      {/* kilau kaca */}
      <path d={`M${f1(add(mul(add(v[0], v[1]), 0.5), [26, -6]))} L${f1(add(mul(add(mul(v[0], 3), v[1]), 0.25), [18, 10]))}`} stroke={C.white} strokeWidth={12} strokeLinecap="round" />
      <circle cx={mid.p1[0] * 0 + v[0][0]} cy={v[0][1] + 58} r={7} fill={C.white} />
      <Torch on={on} />
      <Glow cx={ENTRY[0]} cy={ENTRY[1]} r={60 + 8 * wave01(p, 4)} color={C.yellow} strength={on * (inK > 0 ? 1 : 0)} vector={vector} />
      <Sparkle x={1360} y={250} r={24 * (0.65 + 0.35 * wave01(p, 2))} color={C.yellow} rot={12} />
      <Sparkle x={1440} y={330} r={12 * (0.6 + 0.4 * wave01(p, 2, 0.4))} color={C.sky} />
      <Sparkle x={520} y={300} r={19 * (0.6 + 0.4 * wave01(p, 2, 0.7))} color={C.purple} rot={-8} />
      <Sparkle x={450} y={380} r={11 * (0.6 + 0.4 * wave01(p, 2, 0.2))} color={C.yellow} />
      {void out}
    </g>
  );
};
