// Piala emas: ancang-ancang, lalu meletupkan konfeti yang melayang turun; sinar berputar dan kilau menyapu cawan.
import React from 'react';
import {TAU, clamp, inOut, outBack, pop, rng, seg, wave, wave01, yoyo} from '../../kit/loop';
import {C, shade} from '../../kit/palette';
import {Shadow, Sparkle, roundedPath, starPts} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'business-trophy-confetti',
  theme: 'business',
  title: 'Golden trophy cup bursting with colorful confetti and shining rays, winner celebration animation, seamless loop with alpha channel',
  keywords: [
    'trophy', 'confetti', 'winner', 'award', 'gold cup', 'celebration', 'success', 'achievement', 'victory', 'champion',
    'first place', 'prize', 'reward', 'competition', 'best', 'congratulations', 'leader', 'leadership', 'goal', 'business success',
    'win', 'party', 'shine', 'golden', 'icon', 'flat design', 'illustration', 'presentation', 'explainer', 'social media',
    'animation', 'motion graphics', 'seamless loop', 'looped', 'alpha channel', 'transparent background', 'isolated', '4k',
    'business',
  ],
  category: 3,
  seconds: 8,
  vectorP: 0.4,
};

const X = 960;
const GOLD = C.yellow;
const G2 = shade(GOLD, -0.16);
const G3 = shade(GOLD, -0.3);
const GL = shade(GOLD, 0.5);
const CUP = `M790,300 L1130,300 C1130,470 1062,590 960,602 C858,590 790,470 790,300 Z`;
const CUP_R = `M984,300 L1130,300 C1130,470 1062,590 960,602 C1010,560 1000,420 984,300 Z`;
const BURST = 0.2;

// konfeti deterministik
const CONF = (() => {
  const r = rng(7);
  const cols = [C.coral, C.blue, C.teal, C.sky, C.pink, GOLD];
  return Array.from({length: 48}, (_, i) => {
    const side = i % 2 ? 1 : -1;
    return {
      x0: X + side * (40 + r() * 80),
      y0: 300 + r() * 30,
      up: 200 + r() * 100,
      out: side * (110 + r() * 380),
      fall: 760 + r() * 360,
      flut: 10 + r() * 20,
      fk: 3 + Math.floor(r() * 4),
      ph: r(),
      rot: r() * 360,
      spin: (r() < 0.5 ? -1 : 1) * (2 + Math.floor(r() * 3)),
      col: cols[(i >> 1) % cols.length],
      kind: i % 3,
      delay: r() * 0.03,
      life: 0.52 + r() * 0.12,
    };
  });
})();

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  const crouch = seg(p, 0.12, BURST, inOut) * (1 - seg(p, BURST, BURST + 0.02));
  const bounce = pop(p, BURST, 0.1, 0.1);
  const sy = (1 - 0.05 * crouch) * bounce;
  const sx = (1 + 0.04 * crouch) / Math.sqrt(bounce);
  const rays = yoyo(p, BURST - 0.02, BURST + 0.1, 0.84, 0.94, (t) => outBack(t, 1.6), inOut);
  const breath = 1 + 0.012 * wave(p, 3);
  const shine = [0.32, 0.66].map((t0) => seg(p, t0, t0 + 0.1, inOut));
  const twinkle = yoyo(p, BURST, BURST + 0.06, 0.86, 0.94);
  return (
    <g>
      <Shadow cx={X} cy={838} rx={230} ry={22} vector={vector} />
      {/* kipas sinar di belakang (berdenyut) */}
      {rays > 0.01 ? (
        <g transform={`translate(${X} 348) scale(${rays})`}>
          {Array.from({length: 9}, (_, i) => {
            const a = ((-155 + (i * 130) / 8) * Math.PI) / 180;
            const r0 = 146;
            const l = (i % 2 ? 44 : 70) * (1 + 0.16 * wave(p, 4, i * 0.11));
            return (
              <path
                key={i}
                d={`M${Math.cos(a) * r0},${Math.sin(a) * r0} L${Math.cos(a) * (r0 + l)},${Math.sin(a) * (r0 + l)}`}
                stroke={i % 2 ? shade(GOLD, 0.3) : GOLD}
                strokeWidth={i % 2 ? 14 : 18}
                strokeLinecap="round"
              />
            );
          })}
        </g>
      ) : null}
      {/* konfeti */}
      {CONF.map((c, i) => {
        const tau = p - BURST - c.delay;
        if (tau <= 0) return null;
        const life = clamp(tau / c.life);
        if (life >= 1) return null;
        const appear = clamp(tau / 0.02);
        const vanish = 1 - seg(life, 0.75, 1, inOut);
        const s = appear * vanish;
        if (s < 0.02) return null;
        const x = c.x0 + c.out * (1 - Math.exp(-tau / 0.07)) + c.flut * Math.sin(TAU * (c.fk * tau + c.ph));
        const y = c.y0 - c.up * (1 - Math.exp(-tau / 0.05)) + c.fall * tau;
        const flip = Math.cos(TAU * (c.spin * tau + c.ph));
        const rot = c.rot + 160 * c.spin * tau;
        return (
          <g key={i} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${s.toFixed(3)} ${(s * (c.kind === 2 ? 1 : Math.max(0.3, Math.abs(flip)))).toFixed(3)})`}>
            {c.kind === 0 ? (
              <rect x={-12} y={-21} width={24} height={42} rx={7} fill={flip > 0 ? c.col : shade(c.col, -0.2)} />
            ) : c.kind === 1 ? (
              <circle r={15} fill={flip > 0 ? c.col : shade(c.col, -0.2)} />
            ) : (
              <path d="M-26,0 Q-13,-16 0,0 T26,0" fill="none" stroke={c.col} strokeWidth={12} strokeLinecap="round" />
            )}
          </g>
        );
      })}
      <g transform={`translate(${X} 820) scale(${sx * breath} ${sy * breath}) translate(${-X} -820)`}>
        {/* alas bertingkat */}
        <rect x={X - 160} y={760} width={320} height={60} rx={16} fill={C.ink} />
        <rect x={X - 160} y={796} width={320} height={24} rx={12} fill={shade(C.ink, -0.25)} />
        <rect x={X - 116} y={712} width={232} height={56} rx={14} fill={shade(C.ink, 0.12)} />
        <rect x={X - 64} y={730} width={128} height={22} rx={11} fill={GOLD} />
        <rect x={X - 64} y={742} width={128} height={10} rx={5} fill={G2} />
        <rect x={X - 150} y={768} width={70} height={10} rx={5} fill={shade(C.ink, 0.3)} />
        {/* batang */}
        <path d={roundedPath([[X - 28, 600], [X + 28, 600], [X + 66, 716], [X - 66, 716]], 10)} fill={GOLD} />
        <path d={roundedPath([[X + 6, 600], [X + 28, 600], [X + 66, 716], [X + 18, 716]], 8)} fill={G2} />
        <ellipse cx={X} cy={640} rx={52} ry={18} fill={G2} />
        <ellipse cx={X} cy={634} rx={50} ry={16} fill={GOLD} />
        {/* gagang */}
        {[-1, 1].map((s) => (
          <path
            key={s}
            d={`M${X + s * 160},${345} C${X + s * 270},${330} ${X + s * 280},${500} ${X + s * 128},${500}`}
            fill="none"
            stroke={s > 0 ? G2 : GOLD}
            strokeWidth={28}
            strokeLinecap="round"
          />
        ))}
        {/* cawan */}
        <path d={CUP} fill={GOLD} />
        <path d={CUP_R} fill={G2} />
        <rect x={772} y={282} width={376} height={40} rx={20} fill={GOLD} />
        <rect x={772} y={306} width={376} height={16} rx={8} fill={G3} />
        <rect x={792} y={290} width={120} height={10} rx={5} fill={GL} />
        {/* bintang */}
        <path d={roundedPath(starPts(X + 4, 438, 74, 32, 5), 6)} fill={G3} />
        <path d={roundedPath(starPts(X, 432, 74, 32, 5), 6)} fill={GL} />
        {/* kilau samping */}
        <path d="M832,350 C836,430 858,500 896,548" fill="none" stroke={GL} strokeWidth={16} strokeLinecap="round" />
        {/* sapuan kilau (motion saja) */}
        {!vector
          ? shine.map((k, i) =>
              k > 0 && k < 1 ? (
                <g key={i} clipPath="url(#business-trophy-confetti-cup)">
                  <path d={`M${700 + 560 * k},280 l70,0 l-150,340 l-70,0 Z`} fill={C.white} opacity={0.55 * Math.sin(Math.PI * k)} />
                </g>
              ) : null,
            )
          : null}
        {!vector ? (
          <clipPath id="business-trophy-confetti-cup">
            <path d={CUP} />
          </clipPath>
        ) : null}
      </g>
      <Sparkle x={X - 250} y={250} r={26 * twinkle * (0.75 + 0.25 * wave(p, 4))} color={GOLD} rot={10} />
      <Sparkle x={X + 260} y={220} r={18 * twinkle * (0.75 + 0.25 * wave(p, 4, 0.3))} color={C.sky} />
      <Sparkle x={X + 300} y={640} r={14 * (0.6 + 0.4 * wave01(p, 2))} color={GOLD} rot={20} />
      <Sparkle x={X - 290} y={660} r={12 * (0.6 + 0.4 * wave01(p, 2, 0.5))} color={C.coral} />
    </g>
  );
};
