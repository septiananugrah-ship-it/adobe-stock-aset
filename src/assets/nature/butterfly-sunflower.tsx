// Kupu-kupu biru terbang mengelilingi bunga matahari (lintasan elips 3D: lewat belakang lalu depan bunga),
// sayap mengepak, jejak titik memudar, bunga bergoyang, serbuk sari berkilau. Satu putaran per loop.
import React from 'react';
import {mod, TAU, wave, wave01} from '../../kit/loop';
import {C, shade} from '../../kit/palette';
import {Shadow, Sparkle} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'nature-butterfly-sunflower',
  theme: 'nature',
  title: 'Blue butterfly flapping wings and flying around swaying sunflower, spring nature seamless loop animation with alpha channel',
  keywords: [
    'butterfly', 'sunflower', 'flower', 'flying', 'flapping wings', 'spring', 'summer', 'garden', 'nature', 'insect',
    'blossom', 'bloom', 'pollination', 'pollinator', 'meadow', 'wildlife', 'beauty', 'botany', 'plant', 'petals',
    'yellow flower', 'blue butterfly', 'freedom', 'eco', 'environment', 'season', 'flat design', 'illustration', 'icon',
    'cartoon', 'cute', 'animation', 'motion graphics', 'seamless loop', 'looped', 'alpha channel',
    'transparent background', 'isolated', '4k', 'explainer', 'social media',
  ],
  category: 14,
  seconds: 8,
  vectorP: 0.16,
};

const FC = {x: 960, y: 404}; // pusat kepala bunga
const STEM_BASE = {x: 960, y: 820};
const ORBIT = {cx: 960, cy: 420, a: 350, b: 100};
const FLAPS = 14;

const butterflyAt = (p: number) => {
  const th = TAU * p;
  const x = ORBIT.cx + ORBIT.a * Math.sin(th);
  const z = Math.cos(th); // >0: di depan bunga
  const y = ORBIT.cy + ORBIT.b * z - 34 * Math.sin(TAU * 3 * p) - 30;
  return {x, y, z, vx: Math.cos(th) * (1)};
};

const FORE = 'M0,-6 C18,-62 92,-104 132,-74 C156,-54 128,-6 84,6 C52,14 20,10 0,4 Z';
const FORE_IN = 'M6,-8 C24,-50 80,-80 108,-62 C124,-48 104,-16 74,-4 C50,4 24,4 6,0 Z';
const HIND = 'M0,6 C46,4 98,24 94,62 C90,96 46,98 24,70 C12,52 4,30 0,14 Z';
const HIND_IN = 'M6,14 C40,14 78,30 76,58 C72,82 44,80 30,62 C20,48 10,30 6,18 Z';

const Butterfly: React.FC<{x: number; y: number; s: number; rot: number; flap: number}> = ({x, y, s, rot, flap}) => {
  const wing = (side: 1 | -1) => (
    <g transform={`scale(${side * flap} 1)`}>
      <path d={HIND} fill={shade(C.blue, -0.2)} />
      <path d={HIND_IN} fill={C.sky} />
      <path d={FORE} fill={C.blue} />
      <path d={FORE_IN} fill={shade(C.sky, 0.15)} />
      <circle cx={112} cy={-66} r={9} fill={C.white} />
      <circle cx={92} cy={-80} r={6} fill={C.white} />
      <circle cx={70} cy={62} r={9} fill={C.yellow} />
    </g>
  );
  return (
    <g transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${rot.toFixed(2)}) scale(${s.toFixed(4)})`}>
      {wing(-1)}
      {wing(1)}
      {/* badan & antena */}
      <path d="M-4,-40 Q-18,-78 -30,-88" fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
      <path d="M4,-40 Q18,-78 30,-88" fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
      <circle cx={-30} cy={-88} r={7} fill={C.ink} />
      <circle cx={30} cy={-88} r={7} fill={C.ink} />
      <rect x={-11} y={-44} width={22} height={100} rx={11} fill={C.ink} />
      <circle cx={0} cy={-40} r={14} fill={C.ink} />
      <rect x={-5} y={-30} width={6} height={60} rx={3} fill={shade(C.ink, 0.35)} />
    </g>
  );
};

const leafD = 'M0,0 C30,-34 92,-40 132,-12 C96,18 34,22 0,0 Z';

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  const sway = 3.2 * wave(p, 2, 0.1);
  const breathe = 1 + 0.02 * wave(p, 4);
  const b = butterflyAt(p);
  const flap = 0.22 + 0.78 * (0.5 + 0.5 * Math.cos(TAU * FLAPS * p));
  const bs = 0.96 + 0.16 * b.z;
  const rot = 16 * Math.cos(TAU * p) + 4 * wave(p, 3);

  // jejak titik di belakang kupu-kupu
  const trail = Array.from({length: 12}, (_, i) => {
    const q = butterflyAt(mod(p - 0.012 * (i + 2), 1));
    return {...q, i};
  });
  const trailDot = (t: (typeof trail)[number]) => {
    const k = 1 - t.i / 12;
    const r = (4 + 5 * k) * (0.96 + 0.16 * t.z);
    if (vector && t.i % 2) return null;
    return <circle key={`t${t.i}`} cx={t.x} cy={t.y + 30} r={r} fill={shade(C.sky, 0.35)} opacity={vector ? undefined : 0.35 + 0.65 * k} />;
  };

  const flower = (
    <g>
      {/* batang & daun */}
      <g transform={`rotate(${sway * 0.6} ${STEM_BASE.x} ${STEM_BASE.y})`}>
        <path d={`M${STEM_BASE.x},${STEM_BASE.y} C${STEM_BASE.x - 30},${STEM_BASE.y - 140} ${FC.x + 24},${FC.y + 200} ${FC.x},${FC.y}`} fill="none" stroke={shade(C.green, -0.12)} strokeWidth={22} strokeLinecap="round" />
        <g transform={`translate(${STEM_BASE.x - 10} ${STEM_BASE.y - 120}) rotate(${-24 + 4 * wave(p, 2, 0.3)})`}>
          <path d={leafD} fill={C.green} />
          <path d="M0,0 C34,22 96,18 132,-12 Z" fill={shade(C.green, -0.16)} />
          <path d="M12,-2 Q60,-8 110,-12" fill="none" stroke={shade(C.green, 0.4)} strokeWidth={5} strokeLinecap="round" />
        </g>
        <g transform={`translate(${STEM_BASE.x - 6} ${STEM_BASE.y - 182}) scale(-1 1) rotate(${-22 + 4 * wave(p, 2, 0.55)})`}>
          <path d={leafD} fill={C.green} />
          <path d="M0,0 C34,22 96,18 132,-12 Z" fill={shade(C.green, -0.16)} />
          <path d="M12,-2 Q60,-8 110,-12" fill="none" stroke={shade(C.green, 0.4)} strokeWidth={5} strokeLinecap="round" />
        </g>
        {/* kepala bunga */}
        <g transform={`translate(${FC.x} ${FC.y}) rotate(${sway}) scale(${breathe})`}>
          {Array.from({length: 16}, (_, i) => (
            <ellipse key={`b${i}`} cx={0} cy={-122} rx={30} ry={62} fill={shade(C.orange, 0.12)} transform={`rotate(${i * 22.5 + 11.25})`} />
          ))}
          {Array.from({length: 16}, (_, i) => (
            <g key={`f${i}`} transform={`rotate(${i * 22.5})`}>
              <ellipse cx={0} cy={-114} rx={28} ry={58} fill={C.yellow} />
              <ellipse cx={-8} cy={-124} rx={7} ry={30} fill={shade(C.yellow, 0.45)} />
            </g>
          ))}
          <circle r={78} fill={shade(C.brown, -0.3)} />
          <circle r={60} fill={shade(C.brown, -0.12)} />
          {Array.from({length: 18}, (_, i) => {
            const a = (i / 18) * TAU;
            const rr = i % 2 ? 44 : 28;
            return <circle key={i} cx={rr * Math.cos(a + (i % 2) * 0.17)} cy={rr * Math.sin(a + (i % 2) * 0.17)} r={6} fill={shade(C.brown, 0.15)} />;
          })}
          <circle cx={-22} cy={-24} r={12} fill={shade(C.brown, 0.4)} />
        </g>
      </g>
      {/* rumput */}
      <g>
        <path d="M800,846 Q800,800 860,792 Q960,780 1060,792 Q1120,800 1120,846 Z" fill={C.green} />
        {[
          [836, 806, -16],
          [884, 796, -6],
          [1036, 796, 8],
          [1088, 806, 18],
        ].map(([x, y, a], i) => (
          <path key={i} d="M-15,0 Q-9,-46 -4,-68 Q0,-78 4,-68 Q9,-46 15,0 Z" fill={i % 2 ? shade(C.green, -0.14) : C.green} transform={`translate(${x} ${y}) rotate(${a + 4 * wave(p, 2, i * 0.2)})`} />
        ))}
        <rect x={800} y={830} width={320} height={16} rx={8} fill={shade(C.green, -0.18)} />
      </g>
    </g>
  );

  const behind = b.z < 0;
  const fly = (
    <g>
      {trail.filter((t) => (t.z < 0) === behind).map(trailDot)}
      <Butterfly x={b.x} y={b.y} s={bs} rot={rot} flap={flap} />
    </g>
  );
  const otherTrail = trail.filter((t) => (t.z < 0) !== behind);

  return (
    <g>
      <Shadow cx={960} cy={852} rx={200} ry={22} vector={vector} />
      {/* bayangan kupu-kupu di tanah tidak dipakai: terbang tinggi */}
      {otherTrail.filter((t) => t.z < 0).map(trailDot)}
      {behind ? fly : null}
      {flower}
      {otherTrail.filter((t) => t.z >= 0).map(trailDot)}
      {behind ? null : fly}
      {/* serbuk sari berkilau */}
      {[0, 1, 2].map((i) => {
        const t = mod(p * 2 + i / 3, 1);
        const x = FC.x + (i - 1) * 70 + 20 * Math.sin(TAU * t);
        const y = FC.y - 196 - 100 * t;
        const r = 14 * Math.sin(Math.PI * t) * (vector ? 1 : 1);
        if (vector && i !== 1) return null;
        return <Sparkle key={i} x={x} y={y} r={vector ? 16 : r * (0.7 + 0.3 * wave01(p, 4, i * 0.3))} color={i === 1 ? C.yellow : C.lime} rot={20 * t} />;
      })}
    </g>
  );
};
