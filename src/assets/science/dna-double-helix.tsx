// Heliks ganda DNA (B-DNA tangan kanan, 10 pasang basa per putaran, alur mayor/minor) yang berputar
// pada sumbunya. Pasangan basa: A–T (koral–kuning) dan G–C (ungu–toska). Satu putaran penuh per loop.
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
const HALF = 340; // setengah panjang heliks
const A = 108; // jari-jari heliks
const TURN = 340; // panjang satu putaran (10 pasang basa)
const BP = 20;
const STEP = TURN / 10;
const GROOVE = (150 * Math.PI) / 180; // beda sudut kedua untai (alur mayor/minor)
const TILT = -18;
const PERSP = 0.16;

const STRAND = [C.blue, blend(C.blue, C.sky, 0.55)];
const BASE = {A: C.coral, T: C.yellow, G: C.purple, C: C.teal} as const;
const PAIR = {A: 'T', T: 'A', G: 'C', C: 'G'} as const;
// urutan tetap (deterministik)
const SEQ: (keyof typeof BASE)[] = ['A', 'G', 'C', 'T', 'T', 'G', 'A', 'C', 'G', 'A', 'T', 'C', 'C', 'A', 'G', 'T', 'A', 'G', 'C', 'T'];

type Item = {z: number; el: React.ReactNode};

export const Draw: React.FC<DrawProps> = ({p}) => {
  const phi = -TAU * p;
  const bob = 8 * wave(p, 2);
  // titik untai s pada posisi sumbu u (u ke atas)
  const pt = (s: number, u: number) => {
    const t = (u / TURN) * TAU + phi + s * GROOVE;
    const x = A * Math.cos(t);
    const z = -A * Math.sin(t);
    const k = 1 + (PERSP * z) / A;
    return {x: CX + x * k, y: CY - u * (1 + 0.02 * z / A) + bob, z, k};
  };
  const items: Item[] = [];
  // tulang punggung: potongan pendek, warna & tebal menurut kedalaman
  for (let s = 0; s < 2; s++) {
    const n = 96;
    for (let i = 0; i < n; i++) {
      const u0 = -HALF + (2 * HALF * i) / n;
      const u1 = -HALF + (2 * HALF * (i + 1)) / n;
      const a = pt(s, u0);
      const b = pt(s, u1);
      const z = (a.z + b.z) / 2;
      const k = (a.k + b.k) / 2;
      const col = blend(shade(STRAND[s], -0.3), STRAND[s], 0.5 + (0.5 * z) / A);
      items.push({
        z: z + 0.5,
        el: <path key={`s${s}-${i}`} d={`M${a.x.toFixed(1)},${a.y.toFixed(1)} L${b.x.toFixed(1)},${b.y.toFixed(1)}`} stroke={col} strokeWidth={22 * k} strokeLinecap="round" />,
      });
    }
  }
  // pasangan basa
  for (let i = 0; i < BP; i++) {
    const u = -HALF + STEP * (i + 0.5);
    const b1 = SEQ[i];
    const b2 = PAIR[b1];
    const a = pt(0, u);
    const b = pt(1, u);
    const m = {x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2};
    const dim = 0.5 + (0.5 * m.z) / A; // 0 belakang … 1 depan
    const w = 13 * (1 + (PERSP * m.z) / A);
    const c1 = blend(shade(BASE[b1], -0.28), BASE[b1], dim);
    const c2 = blend(shade(BASE[b2], -0.28), BASE[b2], dim);
    const half = (from: typeof a, col: string, key: string) => (
      <path key={key} d={`M${from.x.toFixed(1)},${from.y.toFixed(1)} L${m.x.toFixed(1)},${m.y.toFixed(1)}`} stroke={col} strokeWidth={w} strokeLinecap="round" />
    );
    items.push({z: (a.z + m.z) / 2, el: half(a, c1, `b${i}a`)});
    items.push({z: (b.z + m.z) / 2, el: half(b, c2, `b${i}b`)});
    // simpul gula-fosfat di ujung tiap basa
    for (const [q, s] of [
      [a, 0],
      [b, 1],
    ] as const) {
      const r = 12.5 * q.k;
      const col = blend(shade(STRAND[s], -0.25), shade(STRAND[s], 0.2), 0.5 + (0.5 * q.z) / A);
      items.push({
        z: q.z + 1,
        el: (
          <g key={`n${i}-${s}`}>
            <circle cx={q.x} cy={q.y} r={r} fill={col} />
            <circle cx={q.x - r * 0.3} cy={q.y - r * 0.3} r={r * 0.32} fill={shade(col, 0.45)} />
          </g>
        ),
      });
    }
  }
  items.sort((x, y) => x.z - y.z);
  return (
    <g>
      <g transform={`rotate(${TILT} ${CX} ${CY})`}>{items.map((it) => it.el)}</g>
      {/* gelembung molekul kecil & kilau */}
      {[
        [CX - 330, CY - 250, 16, C.teal, 0],
        [CX - 380, CY - 170, 10, C.coral, 0.3],
        [CX + 340, CY + 230, 18, C.purple, 0.55],
        [CX + 400, CY + 160, 10, C.yellow, 0.8],
        [CX + 300, CY - 300, 12, C.sky, 0.2],
        [CX - 300, CY + 300, 12, C.sky, 0.65],
      ].map(([x, y, r, c, o], i) => (
        <circle key={i} cx={(x as number) + 10 * wave(p, 1, o as number)} cy={(y as number) - 14 * wave(p, 2, o as number)} r={r as number} fill={c as string} />
      ))}
      <Sparkle x={CX + 380} y={CY - 200} r={26 * (0.6 + 0.4 * wave01(p, 2))} color={C.yellow} rot={10} />
      <Sparkle x={CX - 400} y={CY + 210} r={22 * (0.6 + 0.4 * wave01(p, 2, 0.5))} color={C.yellow} rot={-10} />
      <Sparkle x={CX - 420} y={CY - 60} r={13 * (0.6 + 0.4 * wave01(p, 2, 0.25))} color={C.teal} />
      <Sparkle x={CX + 430} y={CY + 40} r={13 * (0.6 + 0.4 * wave01(p, 2, 0.75))} color={C.coral} />
    </g>
  );
};
