// Heliks ganda DNA (B-DNA tangan kanan, 10 pasang basa per putaran, alur mayor/minor) yang berputar
// pada sumbunya. Pasangan basa: A–T (koral–kuning) dan G–C (ungu–toska). Satu putaran penuh per loop.
// Cek tangan: di sisi depan (z > 0) untai naik ke kanan (dx/du > 0) → heliks tangan kanan.
import React from 'react';
import {TAU, wave, wave01} from '../../kit/loop';
import {C, blend, shade} from '../../kit/palette';
import {Sparkle} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'science-dna-double-helix',
  theme: 'science',
  title: 'Rotating DNA double helix with colorful base pairs, genetics and biology animation, seamless loop with alpha channel',
  keywords: [
    'dna', 'double helix', 'genetics', 'gene', 'biology', 'science', 'base pairs', 'chromosome', 'genome', 'molecule',
    'biotechnology', 'medicine', 'medical', 'research', 'laboratory', 'evolution', 'heredity', 'cell', 'health', 'genetic code',
    'nucleotide', 'helix', 'rotating', 'spinning', 'education', 'icon', 'flat design', 'illustration', 'animation',
    'motion graphics', 'seamless loop', 'looped', 'alpha channel', 'transparent background', 'isolated', 'explainer',
    'presentation', 'social media', '4k', 'pharmaceutical', 'innovation',
  ],
  category: 16,
  seconds: 8,
  vectorP: 0.06,
};

const CX = 960;
const CY = 540;
const HALF = 350; // setengah panjang heliks
const A = 120; // jari-jari heliks
const TURN = 350; // panjang satu putaran (10 pasang basa)
const BP = 20;
const STEP = TURN / 10;
const GROOVE = (150 * Math.PI) / 180; // beda sudut kedua untai (alur mayor/minor)
const TILT = -20;
const PERSP = 0.16;
const TAPER = 70; // ujung untai meruncing sepanjang ini

const STRAND = [C.blue, blend(C.blue, C.sky, 0.55)];
const BASE = {A: C.coral, T: C.yellow, G: C.purple, C: C.teal} as const;
const PAIR = {A: 'T', T: 'A', G: 'C', C: 'G'} as const;
// urutan tetap (deterministik)
const SEQ: (keyof typeof BASE)[] = ['A', 'G', 'C', 'T', 'T', 'G', 'A', 'C', 'G', 'A', 'T', 'C', 'C', 'A', 'G', 'T', 'A', 'G', 'C', 'T'];

type Item = {z: number; el: React.ReactNode};

/** 1 di tengah, meruncing halus ke ~0,3 di kedua ujung. */
const taper = (u: number) => {
  const t = Math.min(1, (HALF - Math.abs(u)) / TAPER);
  return 0.3 + 0.7 * Math.sin((Math.PI / 2) * Math.max(0, t));
};

export const Draw: React.FC<DrawProps> = ({p}) => {
  const phi = -TAU * p;
  const bob = 8 * wave(p, 2);
  // titik untai s pada posisi sumbu u (u ke atas). Kanan-atas di sisi depan → heliks tangan kanan.
  const pt = (s: number, u: number) => {
    const t = (u / TURN) * TAU + phi + s * GROOVE;
    const x = A * Math.cos(t);
    const z = -A * Math.sin(t);
    const k = 1 + (PERSP * z) / A;
    return {x: CX + x * k, y: CY - u * (1 + (0.02 * z) / A) + bob, z, k};
  };
  const items: Item[] = [];
  // tulang punggung: potongan pendek bersambung, warna & tebal menurut kedalaman, ujung meruncing
  for (let s = 0; s < 2; s++) {
    const n = 160;
    // kilau: satu garis utuh per bagian depan untai (bukan per potongan → tidak putus-putus)
    let run: {x: number; y: number}[] = [];
    let runZ = -Infinity;
    const flush = (key: string) => {
      if (run.length > 1) {
        items.push({
          z: runZ + 1,
          el: <path key={key} d={run.map((q, j) => `${j ? 'L' : 'M'}${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(' ')} stroke={shade(STRAND[s], 0.42)} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" fill="none" />,
        });
      }
      run = [];
      runZ = -Infinity;
    };
    for (let i = 0; i < n; i++) {
      const u0 = -HALF + (2 * HALF * i) / n;
      const u1 = -HALF + (2 * HALF * (i + 1)) / n;
      const a = pt(s, u0);
      const b = pt(s, u1);
      const z = (a.z + b.z) / 2;
      const k = (a.k + b.k) / 2;
      const d = 0.5 + (0.5 * z) / A; // 0 belakang … 1 depan
      const col = blend(shade(STRAND[s], -0.3), STRAND[s], d);
      // potongan = trapesium (lebar tepat di kedua ujung) + bulatan sambungan → tepi runcing halus tanpa gerigi
      const wa = 13 * a.k * taper(u0);
      const wb = 13 * b.k * taper(u1);
      const sl = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      const nx = -(b.y - a.y) / sl;
      const ny = (b.x - a.x) / sl;
      const quad = [
        [a.x + nx * wa, a.y + ny * wa],
        [b.x + nx * wb, b.y + ny * wb],
        [b.x - nx * wb, b.y - ny * wb],
        [a.x - nx * wa, a.y - ny * wa],
      ];
      items.push({
        z: z + 0.5,
        el: (
          <g key={`s${s}-${i}`} fill={col}>
            <path d={`M${quad.map((q) => `${q[0].toFixed(2)},${q[1].toFixed(2)}`).join(' L')} Z`} />
            <circle cx={b.x} cy={b.y} r={wb} />
            {i === 0 ? <circle cx={a.x} cy={a.y} r={wa} /> : null}
          </g>
        ),
      });
      if (d > 0.8 && Math.abs((u0 + u1) / 2) < HALF - TAPER) {
        if (!run.length) run.push({x: a.x - 5 * k, y: a.y - 4});
        run.push({x: b.x - 5 * k, y: b.y - 4});
        runZ = Math.max(runZ, z);
      } else flush(`h${s}-${i}`);
    }
    flush(`h${s}-end`);
  }
  // pasangan basa: dua setengah-anak tangga berwarna komplementer dengan celah kecil di tengah (ikatan hidrogen)
  for (let i = 0; i < BP; i++) {
    const u = -HALF + STEP * (i + 0.5);
    const b1 = SEQ[i];
    const b2 = PAIR[b1];
    const a = pt(0, u);
    const b = pt(1, u);
    const m = {x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2};
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const ux = (b.x - a.x) / len;
    const uy = (b.y - a.y) / len;
    const dim = 0.5 + (0.5 * m.z) / A;
    const w = 15 * (1 + (PERSP * m.z) / A) * Math.min(1, taper(u) * 1.25);
    const gap = Math.min(len * 0.12, 7);
    // anak tangga mulai dari tepi untai (bukan dari sumbunya) agar tidak tumpang-tindih aneh di tikungan
    const e1 = 11 * a.k;
    const e2 = 11 * b.k;
    const c1 = blend(shade(BASE[b1], -0.28), BASE[b1], dim);
    const c2 = blend(shade(BASE[b2], -0.28), BASE[b2], dim);
    if (len / 2 - gap - Math.max(e1, e2) > 4) {
      items.push({
        z: (a.z + m.z) / 2,
        el: <path key={`b${i}a`} d={`M${(a.x + ux * e1).toFixed(1)},${(a.y + uy * e1).toFixed(1)} L${(m.x - ux * gap).toFixed(1)},${(m.y - uy * gap).toFixed(1)}`} stroke={c1} strokeWidth={w} strokeLinecap="round" />,
      });
      items.push({
        z: (b.z + m.z) / 2,
        el: <path key={`b${i}b`} d={`M${(b.x - ux * e2).toFixed(1)},${(b.y - uy * e2).toFixed(1)} L${(m.x + ux * gap).toFixed(1)},${(m.y + uy * gap).toFixed(1)}`} stroke={c2} strokeWidth={w} strokeLinecap="round" />,
      });
    }
  }
  items.sort((x, y) => x.z - y.z);
  return (
    <g>
      <g transform={`rotate(${TILT} ${CX} ${CY})`}>{items.map((it) => it.el)}</g>
      {/* nukleotida kecil melayang & kilau, seimbang di kiri-kanan heliks */}
      {[
        [CX - 360, CY - 230, 15, C.teal, 0],
        [CX - 300, CY - 300, 10, C.coral, 0.3],
        [CX + 350, CY + 230, 16, C.purple, 0.55],
        [CX + 290, CY + 300, 10, C.yellow, 0.8],
        [CX + 330, CY - 250, 11, C.sky, 0.2],
        [CX - 330, CY + 250, 11, C.sky, 0.65],
      ].map(([x, y, r, c, o], i) => (
        <circle key={i} cx={(x as number) + 10 * wave(p, 1, o as number)} cy={(y as number) - 14 * wave(p, 2, o as number)} r={r as number} fill={c as string} />
      ))}
      <Sparkle x={CX + 400} y={CY - 140} r={26 * (0.6 + 0.4 * wave01(p, 2))} color={C.yellow} rot={10} />
      <Sparkle x={CX - 410} y={CY + 140} r={22 * (0.6 + 0.4 * wave01(p, 2, 0.5))} color={C.yellow} rot={-10} />
      <Sparkle x={CX - 420} y={CY - 70} r={13 * (0.6 + 0.4 * wave01(p, 2, 0.25))} color={C.teal} />
      <Sparkle x={CX + 420} y={CY + 60} r={13 * (0.6 + 0.4 * wave01(p, 2, 0.75))} color={C.coral} />
    </g>
  );
};
