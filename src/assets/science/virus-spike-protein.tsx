// Partikel virus 3D berputar satu putaran penuh per loop: protein spike tersebar merata di permukaan bola
// (titik Fibonacci), spike di sisi belakang tertutup badan, spike di tepi tampak menonjol, spike depan tampak
// sebagai kepala bulat. Badan bernapas halus, dua virus kecil melayang, partikel kecil mengalir.
import React from 'react';
import {TAU, mod, wave, wave01} from '../../kit/loop';
import {C, blend, shade} from '../../kit/palette';
import {Glow, Sparkle} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'science-virus-spike-protein',
  theme: 'science',
  title: 'Rotating 3D virus particle with spike proteins and floating viruses, microbiology animation, seamless loop with alpha channel',
  keywords: [
    'virus', 'coronavirus', 'spike protein', 'pathogen', 'microbiology', 'infection', 'disease', 'pandemic', 'epidemic',
    'flu', 'influenza', 'germ', 'microbe', 'cell', 'biology', 'science', 'medicine', 'medical', 'healthcare', 'vaccine',
    'immunity', 'research', 'laboratory', 'microscopic', 'molecule', '3d', 'rotating', 'icon', 'flat design', 'illustration',
    'animation', 'motion graphics', 'seamless loop', 'looped', 'alpha channel', 'transparent background', 'isolated',
    'explainer', 'presentation', 'social media', '4k',
  ],
  category: 16,
  seconds: 8,
  vectorP: 0.12,
};

type P3 = [number, number, number];
const fib = (n: number): P3[] =>
  Array.from({length: n}, (_, i) => {
    const y = 1 - (2 * (i + 0.5)) / n;
    const r = Math.sqrt(1 - y * y);
    const a = i * Math.PI * (3 - Math.sqrt(5));
    return [r * Math.cos(a), y, r * Math.sin(a)];
  });
const SPIKES = fib(44);
const DOTS = fib(70).map(([x, y, z]) => [x * 0.98 + 0.03, y * 0.98, z] as P3);

const BODY = C.purple;
const HEAD = C.pink;

/** Putar (y-axis θ) lalu miring (x-axis tilt). z > 0 = menghadap penonton. */
const rot = (q: P3, th: number, tilt: number): P3 => {
  const x1 = q[0] * Math.cos(th) + q[2] * Math.sin(th);
  const z1 = -q[0] * Math.sin(th) + q[2] * Math.cos(th);
  const y2 = q[1] * Math.cos(tilt) - z1 * Math.sin(tilt);
  const z2 = q[1] * Math.sin(tilt) + z1 * Math.cos(tilt);
  return [x1, y2, z2];
};

const Virus: React.FC<{cx: number; cy: number; R: number; th: number; body: string; head: string; detail?: boolean; wig?: number}> = ({
  cx,
  cy,
  R,
  th,
  body,
  head,
  detail = true,
  wig = 0,
}) => {
  const tilt = 0.42;
  const L = R * 0.3;
  const HR = R * 0.085;
  const sp = SPIKES.map((q, i) => ({q: rot(q, th, tilt), i})).sort((a, b) => a.q[2] - b.q[2]);
  const spike = ({q, i}: {q: P3; i: number}) => {
    const w = 1 + wig * Math.sin(i * 1.7);
    const bx = cx + q[0] * R * 0.9;
    const by = cy + q[1] * R * 0.9;
    const tx = cx + q[0] * (R + L * w);
    const ty = cy + q[1] * (R + L * w);
    const front = q[2] > 0;
    const hc = front ? blend(head, C.white, 0.08 * q[2]) : shade(head, -0.18 + 0.1 * q[2]);
    return (
      <g key={i}>
        <path d={`M${bx.toFixed(1)},${by.toFixed(1)} L${tx.toFixed(1)},${ty.toFixed(1)}`} stroke={shade(body, front ? -0.08 : -0.28)} strokeWidth={Math.max(6, R * 0.04)} strokeLinecap="round" />
        <circle cx={tx} cy={ty} r={HR * (0.92 + 0.08 * q[2])} fill={hc} />
        {front && detail ? <circle cx={tx - HR * 0.3} cy={ty - HR * 0.3} r={HR * 0.32} fill={shade(head, 0.45)} /> : null}
      </g>
    );
  };
  return (
    <g>
      {sp.filter((s) => s.q[2] <= 0).map(spike)}
      <circle cx={cx} cy={cy} r={R} fill={shade(body, -0.2)} />
      <circle cx={cx - R * 0.07} cy={cy - R * 0.07} r={R * 0.91} fill={body} />
      {detail
        ? DOTS.map((d, i) => {
            const q = rot(d, th, 0.42);
            if (q[2] < 0.22) return null;
            const r = R * 0.05 * (0.55 + 0.45 * q[2]);
            return <circle key={i} cx={cx + q[0] * R * 0.86} cy={cy + q[1] * R * 0.86} r={r} fill={i % 3 ? shade(body, 0.22) : shade(body, -0.12)} />;
          })
        : null}
      <ellipse cx={cx - R * 0.42} cy={cy - R * 0.46} rx={R * 0.22} ry={R * 0.12} fill={shade(body, 0.42)} transform={`rotate(-40 ${cx - R * 0.42} ${cy - R * 0.46})`} />
      {sp.filter((s) => s.q[2] > 0).map(spike)}
    </g>
  );
};

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  const th = TAU * p;
  const breath = 1 + 0.025 * wave(p, 2);
  const bob = 10 * wave(p, 1, 0.25);
  return (
    <g>
      <Glow cx={960} cy={540 + bob} r={400} color={BODY} strength={0.4} vector={vector} />
      {/* virus kecil melayang */}
      <Virus cx={470 + 12 * wave(p, 1)} cy={330 + 16 * wave(p, 2, 0.3)} R={58} th={-TAU * p * 2 + 1} body={blend(BODY, C.white, 0.35)} head={blend(HEAD, C.white, 0.3)} detail={false} />
      <Virus cx={1450 + 14 * wave(p, 1, 0.5)} cy={770 + 14 * wave(p, 2, 0.8)} R={72} th={TAU * p * 2 + 2} body={blend(BODY, C.white, 0.35)} head={blend(HEAD, C.white, 0.3)} detail={false} />
      {/* virus utama */}
      <Virus cx={960} cy={540 + bob} R={226 * breath} th={th} body={BODY} head={HEAD} wig={0.04 * wave(p, 4)} />
      {/* partikel kecil */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const t = mod(p + i / 6, 1);
        const a = (i * TAU) / 6 + 0.4;
        const r = 400 + 40 * Math.sin(TAU * t);
        const k = vector ? 1 : 0.6 + 0.4 * Math.sin(Math.PI * t);
        return <circle key={i} cx={960 + r * Math.cos(a + TAU * t * 0)} cy={540 + r * 0.62 * Math.sin(a)} r={(6 + 4 * wave01(p, 2, i / 6)) * k} fill={i % 2 ? C.pink : C.violet} />;
      })}
      <Sparkle x={1380} y={260} r={24 * (0.65 + 0.35 * wave01(p, 2))} color={C.yellow} rot={12} />
      <Sparkle x={1450} y={340} r={12 * (0.6 + 0.4 * wave01(p, 2, 0.4))} color={C.pink} />
      <Sparkle x={560} y={800} r={19 * (0.6 + 0.4 * wave01(p, 2, 0.7))} color={C.yellow} rot={-8} />
      <Sparkle x={480} y={720} r={11 * (0.6 + 0.4 * wave01(p, 2, 0.2))} color={C.violet} />
    </g>
  );
};
