// Megafon pemasaran: berdenyut tiap "teriakan", gelombang suara melebar dari corongnya,
// dan gelembung ikon sosial (hati, bintang, putar, obrolan) mengalir keluar lalu memudar.
import React from 'react';
import {TAU, clamp, inOut, mod, out, outBack, wave, wave01} from '../../kit/loop';
import {C, shade} from '../../kit/palette';
import {Shadow, Sparkle, arcPath, roundedPath, starPts} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'business-megaphone-marketing',
  theme: 'business',
  title: 'Megaphone announcing with sound waves and social media icons flying out, digital marketing promotion, seamless loop animation with alpha channel',
  keywords: [
    'megaphone', 'marketing', 'digital marketing', 'announcement', 'promotion', 'advertising', 'social media', 'loudspeaker',
    'bullhorn', 'campaign', 'communication', 'news', 'attention', 'broadcast', 'influencer', 'engagement', 'like', 'heart',
    'star', 'chat', 'notification', 'sound waves', 'brand awareness', 'promo', 'content marketing', 'smm', 'business', 'icon',
    'flat design', 'illustration', 'presentation', 'explainer', 'animation', 'motion graphics', 'seamless loop', 'looped',
    'alpha channel', 'transparent background', 'isolated', '4k',
  ],
  category: 3,
  seconds: 8,
  vectorP: 0.06,
};

const BODY = C.orange;
const DARK = C.ink;
const ORG = {x: 630, y: 640};
const SC = 1.12; // skala megafon // pangkal megafon
const ROT = -16; // derajat (negatif = menengadah)
const MOUTH = 300; // jarak corong dari pangkal (sumbu lokal)
const rad = (ROT * Math.PI) / 180;
const MX = ORG.x + (MOUTH + 6) * SC * Math.cos(rad);
const MY = ORG.y + (MOUTH + 6) * SC * Math.sin(rad);
const AXIS = 90 + ROT; // sudut sumbu untuk arcPath (0 = atas, searah jarum jam)

type IconKind = 'heart' | 'star' | 'play' | 'chat';
const ICONS: {kind: IconKind; col: string; ang: number; dist: number}[] = [
  {kind: 'heart', col: C.pink, ang: -56, dist: 300},
  {kind: 'star', col: C.yellow, ang: -33, dist: 380},
  {kind: 'play', col: C.blue, ang: -10, dist: 390},
  {kind: 'chat', col: C.teal, ang: 13, dist: 320},
];
const K = 2; // siklus aliran ikon per loop

const Icon: React.FC<{kind: IconKind; col: string}> = ({kind, col}) => {
  switch (kind) {
    case 'heart':
      return <path d="M0,20 C-6,14 -26,2 -26,-10 C-26,-20 -18,-26 -10,-26 C-5,-26 -1,-23 0,-18 C1,-23 5,-26 10,-26 C18,-26 26,-20 26,-10 C26,2 6,14 0,20 Z" fill={col} />;
    case 'star':
      return <path d={roundedPath(starPts(0, 2, 28, 12.5, 5), 3)} fill={col} />;
    case 'play':
      return <path d={roundedPath([[-11, -20], [22, 0], [-11, 20]], 5)} fill={col} />;
    default:
      return (
        <g>
          <path d={roundedPath([[-26, -20], [26, -20], [26, 14], [-4, 14], [-16, 26], [-14, 14], [-26, 14]], 8)} fill={col} />
          {[-12, 0, 12].map((x) => (
            <circle key={x} cx={x} cy={-3} r={4.5} fill={C.white} />
          ))}
        </g>
      );
  }
};

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  // denyut "teriakan": 4 kali per loop
  const beat = Math.pow(wave01(p, 4, 0.25), 10);
  const kick = 1 + 0.045 * beat;
  const recoil = -8 * beat;
  const tilt = 1.5 * wave(p, 2);
  const W_N = 3;
  return (
    <g>
      <Shadow cx={ORG.x + 70} cy={892} rx={200} ry={20} s={1 - 0.03 * beat} vector={vector} />
      {/* gelombang suara (busur melebar) */}
      {Array.from({length: W_N}, (_, i) => {
        const u = vector ? [0.12, 0.42, 0.78][i] : mod(p * 4 + i / W_N, 1);
        const r = 130 + 190 * out(u);
        const o = vector ? 1 : clamp(u / 0.15) * (1 - clamp((u - 0.55) / 0.45));
        const span = 24 + 4 * u;
        if (o <= 0.01) return null;
        return (
          <path
            key={i}
            d={arcPath(MX, MY, r, ((AXIS - span) * Math.PI) / 180, ((AXIS + span) * Math.PI) / 180)}
            fill="none"
            stroke={shade(BODY, 0.35 - 0.1 * i)}
            strokeWidth={14 - 3 * u}
            strokeLinecap="round"
            opacity={o >= 1 ? undefined : o}
          />
        );
      })}
      {/* ikon mengalir */}
      {ICONS.map((ic, i) => {
        const u = mod(p * K + i / ICONS.length + 0.1, 1);
        if (vector && (u < 0.2 || u > 0.78)) return null;
        const d = 150 + ic.dist * out(u);
        const a = (ic.ang * Math.PI) / 180;
        const x = MX + d * Math.cos(a) + 10 * wave(p, 2 * K, i * 0.3) * u;
        const y = MY + d * Math.sin(a);
        const s = outBack(clamp(u / 0.18), 1.8) * (1 - inOut(clamp((u - 0.78) / 0.22)));
        if (s <= 0.01) return null;
        const rot = 10 * wave(p, 2 * K, i * 0.21);
        return (
          <g key={i} transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${rot.toFixed(2)}) scale(${s.toFixed(4)})`}>
            <circle cx={4} cy={6} r={50} fill={shade(C.mist, -0.1)} />
            <circle r={50} fill={C.mist} />
            <circle r={46} fill={C.white} />
            <Icon kind={ic.kind} col={ic.col} />
          </g>
        );
      })}
      {/* megafon */}
      <g transform={`translate(${ORG.x} ${ORG.y}) rotate(${ROT + tilt}) translate(${recoil} 0) scale(${kick * SC})`}>
        {/* pegangan */}
        <path d={roundedPath([[46, 40], [104, 40], [118, 212], [62, 212]], 20)} fill={DARK} />
        <path d={roundedPath([[80, 40], [104, 40], [118, 212], [92, 212]], 12)} fill={shade(DARK, -0.25)} />
        <rect x={110} y={66} width={26} height={52} rx={13} fill={shade(DARK, 0.25)} />
        {/* tutup belakang */}
        <rect x={-74} y={-66} width={90} height={132} rx={26} fill={DARK} />
        <rect x={-74} y={8} width={90} height={58} rx={22} fill={shade(DARK, -0.22)} />
        <rect x={-60} y={-52} width={50} height={12} rx={6} fill={shade(DARK, 0.3)} />
        {/* corong */}
        <path d={roundedPath([[0, -60], [MOUTH, -150], [MOUTH, 150], [0, 60]], 12)} fill={BODY} />
        <path d={roundedPath([[0, 14], [MOUTH, 40], [MOUTH, 150], [0, 60]], 10)} fill={shade(BODY, -0.14)} />
        <path d={`M24,-50 L${MOUTH - 26},-128`} stroke={shade(BODY, 0.42)} strokeWidth={12} strokeLinecap="round" />
        <path d={roundedPath([[118, -96], [156, -108], [156, 108], [118, 96]], 6)} fill={C.white} />
        <path d={roundedPath([[118, 22], [156, 26], [156, 108], [118, 96]], 4)} fill={C.cloud} />
        {/* bibir corong */}
        <ellipse cx={MOUTH} cy={0} rx={50} ry={160} fill={shade(BODY, 0.12)} />
        <ellipse cx={MOUTH + 8} cy={0} rx={36} ry={140} fill={shade(BODY, -0.42)} />
        <ellipse cx={MOUTH + 14} cy={0} rx={18} ry={64} fill={shade(BODY, -0.58)} />
      </g>
      {/* kilau */}
      <Sparkle x={ORG.x - 150} y={ORG.y - 180} r={20 * (0.7 + 0.3 * wave01(p, 2))} color={C.yellow} rot={15} />
      <Sparkle x={ORG.x - 110} y={ORG.y + 160} r={13 * (0.6 + 0.4 * wave01(p, 2, 0.5))} color={C.pink} />
      <Sparkle x={MX + 520} y={MY + 260} r={15 * (0.6 + 0.4 * wave01(p, 2, 0.25))} color={C.sky} rot={10} />
      {/* titik konfeti kecil mengalir */}
      {Array.from({length: 6}, (_, i) => {
        const u = mod(p * K + i / 6 + 0.05, 1);
        if (vector) return null;
        const a = ((ROT - 40 + i * 17) * Math.PI) / 180;
        const d = 160 + 360 * out(u);
        const o = vector ? 1 : clamp(u / 0.1) * (1 - clamp((u - 0.6) / 0.3));
        if (o <= 0.01) return null;
        const col = [C.yellow, C.pink, C.sky, C.teal, C.violet, C.coral][i];
        return <circle key={i} cx={MX + d * Math.cos(a)} cy={MY + d * Math.sin(a) + 20 * Math.sin(TAU * u)} r={9 - 3 * u} fill={col} opacity={o >= 1 ? undefined : o} />;
      })}
    </g>
  );
};
