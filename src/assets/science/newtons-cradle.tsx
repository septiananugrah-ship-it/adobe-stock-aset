// Ayunan Newton: bola kiri dilepas, menumbuk deretan bola, dan momentum diteruskan sehingga hanya bola
// paling kanan yang terlempar dengan sudut sama, lalu kembali (gerak pendulum sinus, 4 siklus per loop).
import React from 'react';
import {TAU, clamp, out, wave01} from '../../kit/loop';
import {C, blend, shade} from '../../kit/palette';
import {Shadow, Sparkle} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'science-newtons-cradle',
  theme: 'science',
  title: "Newton's cradle with swinging steel balls transferring momentum, physics animation, seamless loop with alpha channel",
  keywords: [
    "newton's cradle", 'pendulum', 'physics', 'momentum', 'energy', 'kinetic energy', 'conservation', 'collision', 'swinging',
    'balls', 'steel', 'science', 'mechanics', 'motion', 'gravity', 'balance', 'executive toy', 'desk toy', 'cause and effect',
    'teamwork', 'impact', 'business concept', 'education', 'school', 'icon', 'flat design', 'illustration', 'animation',
    'motion graphics', 'seamless loop', 'looped', 'alpha channel', 'transparent background', 'isolated', 'explainer',
    'presentation', 'social media', '4k', 'chain reaction', 'rhythm',
  ],
  category: 16,
  seconds: 8,
  vectorP: 0.0625,
};

const CX = 960;
const BAR_Y = 262;
const PIV_Y = BAR_Y + 14;
const L = 330; // panjang tali (pivot → pusat bola)
const BR = 64;
const N = 5;
const AMP = (30 * Math.PI) / 180;
const CYCLES = 4;
const POST_X = [420, 1500];
const BASE_Y = 770;

const FRAME = C.slate;
const BALL = blend(C.mist, C.steel, 0.35);
const WOOD = C.brown;

const pivotX = (i: number) => CX + (i - (N - 1) / 2) * BR * 2;

const Ball: React.FC<{x: number; y: number; r: number}> = ({x, y, r}) => (
  <g>
    <circle cx={x} cy={y} r={r} fill={shade(BALL, -0.3)} />
    <circle cx={x - r * 0.08} cy={y - r * 0.08} r={r * 0.86} fill={BALL} />
    <path d={`M${x - r * 0.62},${y + r * 0.12} A${r * 0.66},${r * 0.66} 0 0 0 ${x + r * 0.2},${y + r * 0.6}`} stroke={shade(BALL, 0.35)} strokeWidth={r * 0.1} strokeLinecap="round" fill="none" />
    <ellipse cx={x - r * 0.34} cy={y - r * 0.38} rx={r * 0.26} ry={r * 0.16} fill={C.white} transform={`rotate(-38 ${x - r * 0.34} ${y - r * 0.38})`} />
  </g>
);

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  const s = Math.sin(TAU * CYCLES * p);
  const th = AMP * s; // + : bola kanan keluar, − : bola kiri keluar
  const angles = Array.from({length: N}, (_, i) => (i === 0 ? Math.min(0, th) : i === N - 1 ? Math.max(0, th) : 0));
  const balls = angles.map((a, i) => {
    const px = pivotX(i);
    // bola tengah diam: momentum diteruskan lewat tumbukan elastis
    return {px, a, x: px + L * Math.sin(a), y: PIV_Y + L * Math.cos(a)};
  });
  // fase untuk percikan: tepat setelah tumbukan, sisi yang menerima momentum
  const ph = (CYCLES * p) % 1; // 0: tumbukan kiri→kanan, 0.5: kanan→kiri
  const flash = (t: number) => (t >= 0 && t < 0.12 ? Math.sin((Math.PI * t) / 0.12) : 0);
  const fR = flash(ph);
  const fL = flash(ph - 0.5);
  return (
    <g>
      <Shadow cx={CX} cy={BASE_Y + 54} rx={600} ry={34} vector={vector} />
      {/* alas kayu */}
      <rect x={POST_X[0] - 70} y={BASE_Y} width={POST_X[1] - POST_X[0] + 140} height={54} rx={20} fill={shade(WOOD, -0.18)} />
      <rect x={POST_X[0] - 70} y={BASE_Y} width={POST_X[1] - POST_X[0] + 140} height={38} rx={19} fill={WOOD} />
      <rect x={POST_X[0] - 46} y={BASE_Y + 9} width={260} height={9} rx={4.5} fill={shade(WOOD, 0.35)} />
      {/* bayangan bola di alas (motion saja) */}
      {!vector
        ? balls.map((b, i) => (
            <ellipse key={i} cx={b.x} cy={BASE_Y + 12} rx={BR * 0.9} ry={7} fill="#0B1020" opacity={0.1 * clamp(1 - (BASE_Y - b.y - BR) / 260)} />
          ))
        : null}
      {/* tiang & palang */}
      {POST_X.map((x, i) => (
        <g key={i}>
          <rect x={x - 15} y={BAR_Y} width={30} height={BASE_Y - BAR_Y + 6} rx={15} fill={shade(FRAME, -0.16)} />
          <rect x={x - 15} y={BAR_Y} width={20} height={BASE_Y - BAR_Y + 6} rx={10} fill={FRAME} />
          <rect x={x - 9} y={BAR_Y + 40} width={7} height={BASE_Y - BAR_Y - 80} rx={3.5} fill={shade(FRAME, 0.32)} />
          <rect x={x - 34} y={BASE_Y - 12} width={68} height={22} rx={11} fill={shade(FRAME, -0.08)} />
        </g>
      ))}
      <rect x={POST_X[0] - 24} y={BAR_Y - 16} width={POST_X[1] - POST_X[0] + 48} height={32} rx={16} fill={shade(FRAME, -0.16)} />
      <rect x={POST_X[0] - 24} y={BAR_Y - 16} width={POST_X[1] - POST_X[0] + 48} height={22} rx={11} fill={FRAME} />
      <rect x={POST_X[0] + 20} y={BAR_Y - 10} width={300} height={7} rx={3.5} fill={shade(FRAME, 0.32)} />
      {/* tali */}
      {balls.map((b, i) => (
        <path key={i} d={`M${b.px},${PIV_Y} L${b.x.toFixed(1)},${b.y.toFixed(1)}`} stroke={shade(FRAME, -0.1)} strokeWidth={8} strokeLinecap="round" />
      ))}
      {/* bola (dengan dudukan kecil) */}
      {balls.map((b, i) => (
        <g key={i}>
          <g transform={`rotate(${(-b.a * 180) / Math.PI} ${b.x} ${b.y})`}>
            <rect x={b.x - 11} y={b.y - BR - 12} width={22} height={20} rx={7} fill={shade(FRAME, 0.1)} />
          </g>
          <Ball x={b.x} y={b.y} r={BR} />
        </g>
      ))}
      {/* bunyi "klik" di titik kontak saat tumbukan */}
      {[
        [fR, pivotX(0) + BR],
        [fL, pivotX(N - 1) - BR],
      ].map(([f, x], k) =>
        f > 0.02 ? (
          <g key={k}>
            {[-90, -70, -110].map((deg, j) => {
              const a = (deg * Math.PI) / 180;
              const r0 = 76 + 14 * out(f);
              const r1 = r0 + 30 * f;
              const y = PIV_Y + L;
              return (
                <path
                  key={j}
                  d={`M${(x + r0 * Math.cos(a)).toFixed(1)},${(y + r0 * Math.sin(a)).toFixed(1)} L${(x + r1 * Math.cos(a)).toFixed(1)},${(y + r1 * Math.sin(a)).toFixed(1)}`}
                  stroke={C.yellow}
                  strokeWidth={9}
                  strokeLinecap="round"
                />
              );
            })}
          </g>
        ) : null,
      )}
      <Sparkle x={CX + 590} y={150} r={24 * (0.6 + 0.4 * wave01(p, 2))} color={C.yellow} rot={12} />
      <Sparkle x={CX + 650} y={215} r={12 * (0.6 + 0.4 * wave01(p, 2, 0.4))} color={C.sky} />
      <Sparkle x={CX - 600} y={170} r={18 * (0.6 + 0.4 * wave01(p, 2, 0.7))} color={C.yellow} rot={-10} />
    </g>
  );
};
