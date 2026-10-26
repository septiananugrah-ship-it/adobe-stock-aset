// Otak tampak samping (lobus frontal di kiri) dengan serebelum dan batang otak. Jaringan neuron menyala
// bertingkat dari satu simpul (gelombang menyebar), sinyal listrik berjalan di sepanjang akson, simpul berkedip
// saat sinyal tiba; aktivitas meredup kembali (loop).
import React from 'react';
import {clamp, inOut, mix, mod, outBack, rng, wave, wave01, yoyo} from '../../kit/loop';
import {C, blend, shade} from '../../kit/palette';
import {Glow, Sparkle} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'science-brain-neural-signals',
  theme: 'science',
  title: 'Human brain with glowing neural network and electric signals traveling between neurons, neuroscience animation, seamless loop',
  keywords: [
    'brain', 'neural network', 'neurons', 'neuroscience', 'nerve signal', 'synapse', 'mind', 'thinking', 'intelligence',
    'memory', 'idea', 'creativity', 'psychology', 'anatomy', 'biology', 'medicine', 'medical', 'health', 'mental health',
    'cognition', 'learning', 'education', 'artificial intelligence', 'science', 'research', 'nervous system', 'icon',
    'flat design', 'illustration', 'animation', 'motion graphics', 'seamless loop', 'looped', 'alpha channel',
    'transparent background', 'isolated', 'explainer', 'presentation', 'social media', '4k',
  ],
  category: 16,
  seconds: 8,
  vectorP: 0.5,
};

type V = [number, number];
const CX = 960;
const CY = 500;

/** Kurva tertutup halus (Catmull-Rom → Bézier). */
const blob = (pts: V[]) => {
  const n = pts.length;
  let d = `M${(CX + pts[0][0]).toFixed(1)},${(CY + pts[0][1]).toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${(CX + c1[0]).toFixed(1)},${(CY + c1[1]).toFixed(1)} ${(CX + c2[0]).toFixed(1)},${(CY + c2[1]).toFixed(1)} ${(CX + p2[0]).toFixed(1)},${(CY + p2[1]).toFixed(1)}`;
  }
  return d + ' Z';
};
/** Kurva terbuka halus. */
const curve = (pts: V[]) => {
  let d = `M${(CX + pts[0][0]).toFixed(1)},${(CY + pts[0][1]).toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${(CX + c1[0]).toFixed(1)},${(CY + c1[1]).toFixed(1)} ${(CX + c2[0]).toFixed(1)},${(CY + c2[1]).toFixed(1)} ${(CX + p2[0]).toFixed(1)},${(CY + p2[1]).toFixed(1)}`;
  }
  return d;
};

const CEREBRUM: V[] = [
  [-318, 40], [-338, -60], [-292, -170], [-190, -246], [-50, -276], [90, -262], [214, -214], [300, -122], [330, -10],
  [300, 92], [210, 130], [120, 118], [40, 150], [-70, 170], [-190, 150], [-276, 110],
];
const CEREBELLUM: V[] = [[140, 120], [230, 98], [306, 120], [318, 178], [262, 222], [170, 214], [128, 172]];
const STEM: V[] = [[70, 118], [140, 128], [150, 210], [150, 300], [128, 330], [96, 318], [92, 240], [64, 160]];

// alur (sulkus) sebagai garis lengkung
const SULCI: V[][] = [
  [[-170, 92], [-90, 60], [0, 48], [90, 26], [170, -6], [214, -40]], // fisura lateral
  [[34, -270], [6, -200], [40, -150], [4, -90], [26, -30]], // sulkus sentral
  [[-60, -262], [-80, -200], [-40, -170], [-74, -110], [-40, -60]], // prasentral
  [[100, -250], [84, -190], [124, -150], [96, -86]], // pascasentral
  [[-200, -220], [-170, -170], [-210, -120], [-150, -90]],
  [[-300, -80], [-240, -100], [-210, -50], [-150, -30], [-110, 10]],
  [[-286, 40], [-230, 10], [-170, 30], [-120, 0]],
  [[-130, -170], [-120, -120]],
  [[180, -200], [168, -140], [216, -100], [180, -50], [230, -10]],
  [[270, -130], [252, -60], [290, -20]],
  [[70, -40], [120, -60], [150, -100]],
  [[-110, 126], [-30, 104], [60, 96], [130, 70], [200, 60]], // girus temporal
  [[270, 40], [240, 80]],
];
const CB_LINES: V[][] = [
  [[150, 150], [230, 135], [300, 150]],
  [[148, 182], [230, 172], [300, 182]],
];

const BRAIN = C.pink;
const BR_D = shade(BRAIN, -0.16);
const BR_DD = shade(BRAIN, -0.28);
const BR_L = shade(BRAIN, 0.4);
const LINK = blend(C.white, C.yellow, 0.2);
const SIG = C.yellow;

// jaringan neuron
const NODES: V[] = [
  [-230, -90], [-150, -190], [-40, -200], [70, -170], [190, -150], [250, -40], [170, 40], [60, -60], [-80, -80], [-200, 20],
  [-90, 110], [20, 60], [120, 90],
];
const EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 12], [12, 11], [11, 10], [10, 9], [9, 0], [8, 0], [8, 2], [8, 7],
  [7, 3], [7, 6], [7, 11], [8, 9], [8, 10], [1, 8], [4, 7],
];
// kedalaman BFS dari simpul 7 (pusat ledakan)
const DEPTH = (() => {
  const d = NODES.map(() => 99);
  d[7] = 0;
  const q = [7];
  while (q.length) {
    const a = q.shift()!;
    EDGES.forEach(([u, v]) => {
      const b = u === a ? v : v === a ? u : -1;
      if (b >= 0 && d[b] > d[a] + 1) {
        d[b] = d[a] + 1;
        q.push(b);
      }
    });
  }
  return d;
})();
const R = rng(3);
const PULSES = EDGES.map((_, i) => ({k: 1 + (i % 3 === 0 ? 1 : 0), off: R(), dir: R() < 0.5}));

const nx = (i: number) => CX + NODES[i][0];
const ny = (i: number) => CY + NODES[i][1];

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  const act = vector ? 1 : yoyo(p, 0.08, 0.3, 0.7, 0.9, inOut, inOut);
  const breath = 1 + 0.015 * wave(p, 2);
  const nodeOn = (i: number) => (vector ? 1 : yoyo(p, 0.08 + DEPTH[i] * 0.04, 0.16 + DEPTH[i] * 0.04, 0.7 + DEPTH[i] * 0.02, 0.78 + DEPTH[i] * 0.02, (t) => outBack(t, 2), inOut));
  return (
    <g transform={`translate(${CX} ${CY + 30}) scale(${breath}) translate(${-CX} ${-CY - 30})`}>
      <Glow cx={CX} cy={CY - 40} r={330 + 16 * wave01(p, 4)} color={BRAIN} strength={0.25 + 0.35 * act} vector={vector} />
      {/* batang otak & serebelum (belakang) */}
      <path d={blob(STEM)} fill={BR_DD} />
      <path d={blob(STEM.map(([x, y]) => [x - 8, y] as V))} fill={BR_D} />
      <path d={blob(CEREBELLUM)} fill={BR_DD} />
      <path d={blob(CEREBELLUM.map(([x, y]) => [x - 6, y - 6] as V))} fill={BR_D} />
      {CB_LINES.map((l, i) => (
        <path key={i} d={curve(l)} fill="none" stroke={BR_DD} strokeWidth={10} strokeLinecap="round" />
      ))}
      {/* serebrum: sisi gelap + badan */}
      <path d={blob(CEREBRUM.map(([x, y]) => [x + 10, y + 12] as V))} fill={BR_D} />
      <path d={blob(CEREBRUM)} fill={BRAIN} />
      {SULCI.map((l, i) => (
        <path key={i} d={curve(l)} fill="none" stroke={BR_D} strokeWidth={i < 2 ? 15 : 13} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      <path d={curve([[-280, -110], [-240, -190], [-150, -240]])} fill="none" stroke={BR_L} strokeWidth={14} strokeLinecap="round" />
      <circle cx={CX - 92} cy={CY - 254} r={8} fill={BR_L} />
      {/* jaringan: akson */}
      {EDGES.map(([a, b], i) => {
        const k = Math.min(nodeOn(a), nodeOn(b));
        const grow = clamp(k);
        if (grow <= 0.01) return null;
        const [s, e] = DEPTH[a] <= DEPTH[b] ? [a, b] : [b, a];
        const x2 = mix(nx(s), nx(e), grow);
        const y2 = mix(ny(s), ny(e), grow);
        return <path key={i} d={`M${nx(s)},${ny(s)} L${x2.toFixed(1)},${y2.toFixed(1)}`} stroke={LINK} strokeWidth={8} strokeLinecap="round" />;
      })}
      {/* sinyal berjalan */}
      {!vector
        ? EDGES.map(([a, b], i) => {
            const pl = PULSES[i];
            const t = mod(p * pl.k * 2 + pl.off, 1);
            const [s, e] = pl.dir ? [a, b] : [b, a];
            const k = act * Math.sin(Math.PI * t);
            if (k < 0.05) return null;
            const x = mix(nx(s), nx(e), inOut(t));
            const y = mix(ny(s), ny(e), inOut(t));
            const xb = mix(nx(s), nx(e), inOut(clamp(t - 0.12)));
            const yb = mix(ny(s), ny(e), inOut(clamp(t - 0.12)));
            return (
              <g key={i} opacity={Math.min(1, k * 1.4)}>
                <path d={`M${xb.toFixed(1)},${yb.toFixed(1)} L${x.toFixed(1)},${y.toFixed(1)}`} stroke={SIG} strokeWidth={10} strokeLinecap="round" />
                <circle cx={x} cy={y} r={10} fill={blend(SIG, C.white, 0.4)} />
              </g>
            );
          })
        : null}
      {/* neuron */}
      {NODES.map((_, i) => {
        const k = nodeOn(i);
        if (k <= 0.01) return null;
        const flash = vector ? 0 : act * wave01(p, 4, i * 0.37);
        return (
          <g key={i} transform={`translate(${nx(i)} ${ny(i)}) scale(${k.toFixed(4)})`}>
            <Glow cx={0} cy={0} r={34 + 10 * flash} color={SIG} strength={1.2 * flash} vector={vector} />
            <circle r={19} fill={C.white} />
            <circle r={12 + 2 * flash} fill={blend(SIG, C.orange, 0.3 * (1 - flash))} />
          </g>
        );
      })}
      {/* percikan ide */}
      {[0, 1, 2].map((i) => {
        const ang = -Math.PI / 2 + (i - 1) * 0.5;
        const k = vector ? 1 : act * (0.75 + 0.25 * wave(p, 4, i / 3));
        if (k < 0.05) return null;
        const r0 = 330;
        return (
          <path
            key={i}
            d={`M${CX - 30 + r0 * Math.cos(ang)},${CY - 20 + r0 * Math.sin(ang)} L${CX - 30 + (r0 + 54 * k) * Math.cos(ang)},${CY - 20 + (r0 + 54 * k) * Math.sin(ang)}`}
            stroke={C.yellow}
            strokeWidth={12}
            strokeLinecap="round"
          />
        );
      })}
      <Sparkle x={CX + 400} y={230} r={24 * (0.65 + 0.35 * wave01(p, 2))} color={C.yellow} rot={12} />
      <Sparkle x={CX + 470} y={310} r={12 * (0.6 + 0.4 * wave01(p, 2, 0.4))} color={C.sky} />
      <Sparkle x={CX - 440} y={320} r={19 * (0.6 + 0.4 * wave01(p, 2, 0.7))} color={C.yellow} rot={-8} />
      <Sparkle x={CX - 470} y={420} r={11 * (0.6 + 0.4 * wave01(p, 2, 0.2))} color={BRAIN} />
    </g>
  );
};
