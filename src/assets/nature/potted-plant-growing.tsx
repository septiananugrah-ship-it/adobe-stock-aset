// Tanaman tumbuh di pot terakota: tunas menembus tanah, batang memanjang, daun membuka bertingkat,
// kuncup mekar menjadi bunga, bergoyang tertiup angin, lalu menyusut kembali (loop bolak-balik).
import React from 'react';
import {clamp, inOut, inOutSine, mod, out, outBack, seg, TAU, wave, yoyo} from '../../kit/loop';
import {C, shade} from '../../kit/palette';
import {Shadow, Sparkle} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'nature-potted-plant-growing',
  theme: 'nature',
  title: 'Green plant growing in terracotta pot, sprout unfolds leaves and blooms, seamless loop animation with alpha channel',
  keywords: [
    'plant', 'growing plant', 'potted plant', 'sprout', 'seedling', 'growth', 'flower pot', 'terracotta', 'leaves', 'bloom',
    'flower', 'gardening', 'garden', 'houseplant', 'nature', 'spring', 'eco', 'ecology', 'environment', 'green', 'botany',
    'germination', 'new life', 'development', 'progress', 'organic', 'flat design', 'illustration', 'icon', 'cartoon',
    'animation', 'motion graphics', 'seamless loop', 'looped', 'alpha channel', 'transparent background', 'isolated', '4k',
    'explainer', 'presentation', 'social media',
  ],
  category: 14,
  seconds: 8,
  vectorP: 0.6,
};

const CX = 960;
const SOIL_Y = 600;
const L = 380; // panjang batang penuh
const LEAF = C.green;
const POT = C.orange;
const PETAL = C.pink;

// titik batang pada s (0..1 panjang penuh), dengan lengkung dasar + lentur angin
const stemPt = (s: number, bend: number) => {
  const x = CX - 16 * Math.sin(Math.PI * s * 1.1) + bend * s * s;
  const y = SOIL_Y - L * s;
  return [x, y] as [number, number];
};
const stemAng = (s: number, bend: number) => {
  const a = stemPt(Math.max(0, s - 0.01), bend);
  const b = stemPt(s + 0.01, bend);
  return (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
};

const leafPath = (l: number, w: number) =>
  `M0,0 C${l * 0.25},${-w} ${l * 0.72},${-w * 0.95} ${l},0 C${l * 0.72},${w * 0.95} ${l * 0.25},${w} 0,0 Z`;
const leafUnder = (l: number, w: number) => `M0,0 L${l},0 C${l * 0.72},${w * 0.95} ${l * 0.25},${w} 0,0 Z`;

const Leaf: React.FC<{x: number; y: number; ang: number; l: number; w: number; flip: boolean}> = ({x, y, ang, l, w, flip}) => (
  <g transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${ang.toFixed(2)}) scale(1 ${flip ? -1 : 1})`}>
    <path d={leafPath(l, w)} fill={LEAF} />
    <path d={leafUnder(l, w)} fill={shade(LEAF, -0.18)} />
    <path d={`M${l * 0.12},0 Q${l * 0.5},${-w * 0.12} ${l * 0.8},${-w * 0.04}`} fill="none" stroke={shade(LEAF, 0.4)} strokeWidth={5} strokeLinecap="round" />
  </g>
);

const NODES = [
  {s: 0.24, side: 1, l: 150, w: 46},
  {s: 0.4, side: -1, l: 140, w: 44},
  {s: 0.56, side: 1, l: 122, w: 40},
  {s: 0.71, side: -1, l: 104, w: 34},
  {s: 0.84, side: 1, l: 66, w: 23},
];

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  const g = yoyo(p, 0.02, 0.4, 0.7, 0.96, inOutSine, inOutSine);
  const hold = seg(p, 0.3, 0.42) * (1 - seg(p, 0.66, 0.76));
  const bend = (22 * wave(p, 2) + 8 * wave(p, 3, 0.2)) * g;
  const bloom = yoyo(p, 0.37, 0.49, 0.66, 0.75, (t) => outBack(t, 1.6), inOut);
  const bud = clamp((g - 0.82) / 0.14);

  // batang (poligon meruncing)
  const n = 40;
  const left: string[] = [];
  const right: string[] = [];
  for (let i = 0; i <= n; i++) {
    const s = (g * i) / n;
    const [x, y] = stemPt(s, bend);
    const a = (stemAng(s, bend) * Math.PI) / 180;
    const w = (18 - 8 * s) / 2;
    const nx = -Math.sin(a);
    const ny = Math.cos(a);
    left.push(`${(x + nx * w).toFixed(2)},${(y + ny * w).toFixed(2)}`);
    right.push(`${(x - nx * w).toFixed(2)},${(y - ny * w).toFixed(2)}`);
  }
  const stemD = `M${left.join(' L')} L${right.reverse().join(' L')} Z`;
  const tip = stemPt(g, bend);
  const tipAng = stemAng(g, bend);
  const tipW = (18 - 8 * g) / 2;

  // remah tanah saat tunas menembus
  const crumbT = seg(p, 0.04, 0.14, (t) => t);
  // antisipasi: tanah menggembung sebelum tunas muncul, lalu turun lagi (melingkupi titik loop)
  const mq = mod(p + 0.06, 1);
  const mound = mq < 0.12 ? Math.sin((Math.PI * mq) / 0.12) : 0;
  const crumbs = [-1, -0.45, 0.4, 0.95].map((d, i) => {
    const t = clamp(crumbT * 1.15 - i * 0.05);
    return {x: CX + d * (38 + 50 * out(t)), y: SOIL_Y - 4 - 70 * Math.sin(Math.PI * t) * (0.7 + 0.3 * Math.abs(d)), o: t > 0 && t < 1 ? Math.sin(Math.PI * t) : 0, r: 9 - (i % 2) * 2};
  });

  const potBreath = 1 + 0.012 * hold * wave(p, 4);
  return (
    <g>
      <Shadow cx={CX} cy={872} rx={190} ry={24} vector={vector} />
      {/* pot */}
      <g transform={`translate(${CX} 860) scale(${potBreath} ${2 - potBreath}) translate(${-CX} -860)`}>
        <path d="M818,640 L1102,640 L1072,846 Q1069,862 1052,862 L868,862 Q851,862 848,846 Z" fill={POT} />
        <path d="M1000,640 L1102,640 L1072,846 Q1069,862 1052,862 L990,862 Z" fill={shade(POT, -0.14)} />
        <rect x={818} y={640} width={284} height={16} fill={shade(POT, -0.26)} />
        <rect x={858} y={672} width={14} height={150} rx={7} fill={shade(POT, 0.38)} transform="rotate(-6 865 747)" />
        {/* bibir pot */}
        <path d="M796,606 L1124,606 L1124,636 Q1124,652 1108,652 L812,652 Q796,652 796,636 Z" fill={shade(POT, 0.06)} />
        <path d="M1024,606 L1124,606 L1124,636 Q1124,652 1108,652 L1024,652 Z" fill={shade(POT, -0.1)} />
        <rect x={814} y={628} width={140} height={10} rx={5} fill={shade(POT, 0.42)} />
        <ellipse cx={CX} cy={606} rx={164} ry={20} fill={shade(POT, 0.2)} />
      </g>
      {/* tanah */}
      <ellipse cx={CX} cy={SOIL_Y + 6} rx={146} ry={14} fill={shade(C.brown, -0.38)} />
      <ellipse cx={CX} cy={SOIL_Y + 2} rx={44 * Math.min(1, g * 6)} ry={9 * Math.min(1, g * 6)} fill={shade(C.brown, -0.22)} />
      {mound > 0.005 ? <path d={`M${CX - 46 * mound},${SOIL_Y + 4} Q${CX},${SOIL_Y + 4 - 30 * mound} ${CX + 46 * mound},${SOIL_Y + 4} Z`} fill={shade(C.brown, -0.22)} /> : null}
      {crumbs.map((c, i) =>
        c.o > 0.01 ? <circle key={i} cx={c.x} cy={c.y} r={c.r} fill={shade(C.brown, -0.2)} opacity={vector ? undefined : c.o} /> : null,
      )}
      {/* batang & daun (di belakang bibir pot bagian depan) */}
      {g > 0.004 ? (
        <g>
          <path d={stemD} fill={shade(LEAF, -0.12)} />
          <circle cx={tip[0]} cy={tip[1]} r={tipW} fill={shade(LEAF, -0.12)} />
          {NODES.map((nd, i) => {
            const u = clamp((g - nd.s) / Math.min(0.26, 1 - nd.s));
            if (u <= 0.001) return null;
            const k = outBack(u, 1.8);
            const [x, y] = stemPt(nd.s, bend);
            const sa = stemAng(nd.s, bend);
            const open = 12 + 50 * k + 5 * hold * wave(p, 3, i * 0.17);
            const ang = sa + nd.side * open;
            return <Leaf key={i} x={x} y={y} ang={ang} l={nd.l * k} w={nd.w * k * (0.6 + 0.4 * clamp(u * 2))} flip={nd.side < 0} />;
          })}
          {/* kuncup & bunga di ujung */}
          {bud > 0.001 ? (
            <g transform={`translate(${tip[0].toFixed(2)} ${tip[1].toFixed(2)}) rotate(${(tipAng + 90).toFixed(2)})`}>
              {/* kelopak hijau */}
              <g transform={`scale(${out(bud)})`}>
                <path d={leafPath(34, 13)} transform="rotate(-150)" fill={LEAF} />
                <path d={leafPath(34, 13)} transform="rotate(-30)" fill={shade(LEAF, -0.1)} />
              </g>
              {bloom > 0.001
                ? Array.from({length: 6}, (_, i) => {
                    const a = -90 + (i - 2.5) * 60 + 6 * wave(p, 2, i * 0.1) * hold;
                    const len = 66 * bloom;
                    return (
                      <g key={i} transform={`translate(0 -22) rotate(${a}) `}>
                        <ellipse cx={len * 0.55} cy={0} rx={len * 0.58} ry={len * 0.36} fill={i % 2 ? PETAL : shade(PETAL, -0.1)} />
                        <ellipse cx={len * 0.62} cy={-len * 0.06} rx={len * 0.22} ry={len * 0.08} fill={shade(PETAL, 0.4)} />
                      </g>
                    );
                  })
                : null}
              {/* kuncup hijau (tertutup pusat bunga saat mekar) */}
              <g transform={`translate(0 -22) scale(${(bud * 0.55).toFixed(3)})`}>
                <circle r={18} fill={shade(LEAF, -0.05)} />
                <circle cx={-7} cy={-7} r={6} fill={shade(LEAF, 0.35)} />
              </g>
              {bloom > 0.001 ? (
                <g transform={`translate(0 -22) scale(${bloom.toFixed(3)})`}>
                  <circle r={27} fill={C.yellow} />
                  <circle r={27} cx={4} cy={4} fill={shade(C.yellow, -0.08)} />
                  <circle r={22} fill={C.yellow} />
                  <circle cx={-9} cy={-9} r={7} fill={shade(C.yellow, 0.5)} />
                </g>
              ) : null}
            </g>
          ) : null}
        </g>
      ) : null}
      {/* kilau */}
      {[
        {x: 1180, y: 300, r: 22, c: C.yellow, ph: 0},
        {x: 738, y: 372, r: 18, c: C.lime, ph: 0.33},
        {x: 1214, y: 470, r: 13, c: C.yellow, ph: 0.66},
      ].map((s, i) => {
        const k = vector ? 1 : hold * (0.75 + 0.25 * wave(p, 4, s.ph)) * seg(mod(p - 0.36 - i * 0.03, 1), 0, 0.06, outBack);
        return <Sparkle key={i} x={s.x} y={s.y} r={s.r * k} color={s.c} rot={15 * Math.sin(TAU * p)} />;
      })}
    </g>
  );
};
