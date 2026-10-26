// Keranjang belanja menerima produk: kotak, botol, dan tas jatuh bergantian (squash + tanda plus), keranjang bergoyang dengan roda berputar → produk menghilang → kembali kosong.
import React from 'react';
import {clamp, inOut, out, outBack, pop, seg, wave, yoyo} from '../../kit/loop';
import {C, shade} from '../../kit/palette';
import {Shadow, Sparkle, roundedPath} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'ui-shopping-cart-items',
  theme: 'ui',
  title: 'Shopping cart receiving falling products, box bottle and bag added to cart, flat icon animation, seamless loop with alpha channel',
  keywords: [
    'shopping cart',
    'cart',
    'add to cart',
    'online shopping',
    'ecommerce',
    'e-commerce',
    'shopping',
    'buy',
    'purchase',
    'checkout',
    'retail',
    'store',
    'shop',
    'products',
    'order',
    'delivery',
    'sale',
    'supermarket',
    'basket',
    'icon',
    'ui',
    'user interface',
    'app',
    'web',
    'marketing',
    'business',
    'flat design',
    'illustration',
    'animation',
    'motion graphics',
    'seamless loop',
    'looped',
    'alpha channel',
    'transparent background',
    'isolated',
    '4k',
    'explainer',
    'presentation',
    'social media',
    'digital',
  ],
  category: 3,
  seconds: 8,
  vectorP: 0.64,
};

const COL = C.coral;
const BASKET = roundedPath(
  [
    [700, 404],
    [1226, 404],
    [1176, 648],
    [754, 648],
  ],
  28,
);
const RIM = {x: 680, y: 384, w: 566, h: 40};
const WHEELS = [828, 1114];
const WY = 780;
const WR = 48;
// produk: jatuh pada waktu t, posisi akhir
const LAND = [0.16, 0.26, 0.36];

const fallY = (p: number, t: number) => {
  // posisi offset y (negatif = di atas), jatuh dipercepat lalu mendarat
  const a = t - 0.06;
  if (p < a) return -150;
  if (p >= t) return 0;
  const u = (p - a) / (t - a);
  return -150 * (1 - u * u);
};

const Plus: React.FC<{x: number; y: number; s: number; col: string}> = ({x, y, s, col}) =>
  s > 0.02 ? (
    <g transform={`translate(${x} ${y}) scale(${s.toFixed(4)})`}>
      <rect x={-22} y={-7} width={44} height={14} rx={7} fill={col} />
      <rect x={-7} y={-22} width={14} height={44} rx={7} fill={col} />
    </g>
  ) : null;

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  const roll = vector ? 0 : 16 * wave(p, 2);
  const spin = (roll / WR) * (180 / Math.PI);
  const dip = vector ? 0 : LAND.reduce((a, t) => a + 10 * Math.max(0, (pop(p, t, 0.08, 1) - 1)), 0);
  const items = LAND.map((t, i) => {
    const vis = vector ? 1 : yoyo(p, t - 0.1, t - 0.06, 0.84 + i * 0.03, 0.9 + i * 0.03, (u) => u, (u) => inOut(u) * inOut(u));
    const y = vector ? 0 : fallY(p, t);
    const sq = vector ? 1 : pop(p, t, 0.09, 0.14);
    const tilt = vector ? [-6, 4, 6][i] : [-6, 4, 6][i] * seg(p, t - 0.06, t, inOut) + (1 - seg(p, t - 0.06, t)) * [10, -8, -12][i];
    return {vis, y, sq, tilt};
  });
  const tw = (k: number, ph: number) => (vector ? 1 : 0.8 + 0.2 * wave(p, k, ph));
  const full = vector ? 1 : yoyo(p, 0.38, 0.44, 0.82, 0.88, out, inOut);
  const breath = vector ? 1 : 1 + 0.01 * wave(p, 2, 0.25);
  const Item = ({i, children, ax, ay}: {i: number; children: React.ReactNode; ax: number; ay: number}) => {
    const it = items[i];
    if (it.vis <= 0.01) return null;
    const s = vector ? 1 : outBack(clamp(it.vis), 1.8);
    return (
      <g
        transform={`translate(${ax} ${(ay + it.y).toFixed(2)}) rotate(${it.tilt.toFixed(2)}) scale(${(s / Math.sqrt(it.sq)).toFixed(4)} ${(s * it.sq).toFixed(4)})`}
      >
        {children}
      </g>
    );
  };
  return (
    <g>
      <Shadow cx={970 + roll} cy={WY + WR + 18} rx={330} ry={24} vector={vector} />
      <g transform={`translate(${roll.toFixed(2)} 0)`}>
        {/* roda */}
        {WHEELS.map((x, i) => (
          <g key={i} transform={`translate(${x} ${WY}) rotate(${spin.toFixed(2)})`}>
            <circle r={WR} fill={C.navy} />
            <circle r={WR - 14} fill={C.ink} />
            {[0, 60, 120].map((a) => (
              <rect key={a} x={-5} y={-(WR - 18)} width={10} height={2 * (WR - 18)} rx={5} fill={shade(C.ink, 0.25)} transform={`rotate(${a})`} />
            ))}
            <circle r={14} fill={C.mist} />
          </g>
        ))}
        <g transform={`translate(0 ${dip.toFixed(2)}) translate(960 700) scale(${breath.toFixed(4)}) translate(-960 -700)`}>
          {/* rangka bawah */}
          <rect x={772} y={636} width={26} height={110} rx={13} fill={shade(C.navy, 0.1)} />
          <rect x={1108} y={636} width={26} height={110} rx={13} fill={shade(C.navy, 0.1)} />
          <rect x={750} y={704} width={420} height={30} rx={15} fill={C.ink} />
          {/* gagang */}
          <path d="M716,420 L650,292 L560,292" fill="none" stroke={C.ink} strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" />
          <rect x={530} y={270} width={92} height={44} rx={22} fill={COL} />
          <rect x={530} y={296} width={92} height={18} rx={9} fill={shade(COL, -0.16)} />
          {/* produk (di belakang dinding depan keranjang) */}
          <Item i={0} ax={880} ay={360}>
            <rect x={-92} y={-100} width={184} height={200} rx={18} fill={shade(C.yellow, -0.18)} transform="translate(0 10)" />
            <rect x={-92} y={-100} width={184} height={200} rx={18} fill={C.yellow} />
            <rect x={30} y={-100} width={62} height={200} rx={18} fill={shade(C.yellow, -0.12)} />
            <rect x={30} y={-100} width={30} height={200} fill={shade(C.yellow, -0.12)} />
            <rect x={-26} y={-100} width={52} height={92} rx={8} fill={shade(C.yellow, 0.4)} />
            <rect x={-72} y={-82} width={12} height={60} rx={6} fill={shade(C.yellow, 0.5)} />
          </Item>
          <Item i={1} ax={1024} ay={350}>
            <rect x={-26} y={-150} width={52} height={50} rx={14} fill={shade(C.teal, -0.2)} />
            <rect x={-54} y={-110} width={108} height={260} rx={40} fill={C.teal} />
            <rect x={14} y={-110} width={40} height={260} rx={30} fill={shade(C.teal, -0.12)} />
            <rect x={-54} y={-30} width={108} height={70} fill={C.white} />
            <rect x={-54} y={-30} width={108} height={14} fill={shade(C.cloud, -0.06)} />
            <rect x={-34} y={-92} width={12} height={46} rx={6} fill={shade(C.teal, 0.45)} />
          </Item>
          <Item i={2} ax={1112} ay={372}>
            <path d="M-36,-70 L-36,-96 A36,36 0 0 1 36,-96 L36,-70" fill="none" stroke={shade(C.purple, -0.2)} strokeWidth={14} strokeLinecap="round" />
            <path d={roundedPath([[-74, -76], [74, -76], [84, 100], [-84, 100]], 18)} fill={C.purple} />
            <path d={roundedPath([[28, -76], [74, -76], [84, 100], [32, 100]], 14)} fill={shade(C.purple, -0.14)} />
            <circle cx={-36} cy={-48} r={9} fill={shade(C.purple, -0.3)} />
            <circle cx={36} cy={-48} r={9} fill={shade(C.purple, -0.3)} />
            <path d="M-26,10 L24,10" stroke={shade(C.purple, 0.45)} strokeWidth={12} strokeLinecap="round" />
          </Item>
          {/* keranjang depan */}
          <path d={BASKET} fill={shade(COL, -0.24)} transform="translate(0 16)" />
          <path d={BASKET} fill={COL} />
          <path d={roundedPath([[1080, 404], [1226, 404], [1176, 648], [1060, 648]], 26)} fill={shade(COL, -0.1)} />
          {[812, 900, 988, 1076].map((x, i) => (
            <rect key={i} x={x - 1 - i * 2} y={460} width={30} height={136} rx={15} fill={shade(COL, i === 3 ? 0.02 : 0.16)} />
          ))}
          <rect x={RIM.x} y={RIM.y} width={RIM.w} height={RIM.h} rx={20} fill={shade(COL, -0.08)} />
          <rect x={RIM.x} y={RIM.y} width={RIM.w} height={20} rx={10} fill={shade(COL, 0.12)} />
          <rect x={RIM.x + 26} y={RIM.y + 6} width={130} height={9} rx={4.5} fill={shade(COL, 0.45)} />
        </g>
      </g>
      {/* tanda plus saat produk mendarat */}
      {LAND.map((t, i) => {
        const u = vector ? 0.6 : (p - t) / 0.16;
        if (u <= 0 || u >= 1) return null;
        const s = vector ? 1 : outBack(clamp(u * 3), 2) * (1 - seg(u, 0.6, 1));
        const [x, y] = [[1300, 400], [1372, 320], [1300, 250]][i];
        return <Plus key={i} x={x} y={y - 60 * out(u)} s={s} col={C.green} />;
      })}
      <Sparkle x={660} y={190} r={26 * full * tw(4, 0)} color={C.yellow} rot={15} />
      <Sparkle x={590} y={560} r={18 * full * tw(4, 0.5)} color={C.coral} />
      <Sparkle x={1390} y={630} r={15 * full * tw(3, 0.2)} color={C.sky} rot={30} />
    </g>
  );
};
