// Kartu kredit ditempelkan ke terminal pembayaran: gelombang nirsentuh memancar, layar memproses, lalu berubah hijau dengan centang.
import React from 'react';
import {clamp, inOut, mix, out, outBack, pop, seg, wave, yoyo} from '../../kit/loop';
import {C, shade} from '../../kit/palette';
import {Shadow, Sparkle, arcPath} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'business-contactless-card-payment',
  theme: 'business',
  title: 'Credit card tapping a payment terminal with contactless waves and approved check mark, cashless payment animation loop with alpha channel',
  keywords: [
    'contactless payment', 'credit card', 'payment terminal', 'nfc', 'tap to pay', 'cashless', 'pos terminal', 'card payment',
    'transaction', 'approved', 'payment successful', 'checkout', 'shopping', 'banking', 'finance', 'fintech', 'debit card',
    'wireless', 'purchase', 'retail', 'ecommerce', 'money', 'secure payment', 'check mark', 'icon', 'flat design',
    'illustration', 'presentation', 'explainer', 'social media', 'animation', 'motion graphics', 'seamless loop', 'looped',
    'alpha channel', 'transparent background', 'isolated', '4k', 'business', 'technology',
  ],
  category: 3,
  seconds: 8,
  vectorP: 0.7,
};

// terminal
const TM = {x: 576, y: 362, w: 320, h: 500, r: 40};
const SCR = {x: TM.x + 34, y: TM.y + 118, w: TM.w - 68, h: 150, r: 18};
const RD = {x: TM.x + TM.w / 2, y: TM.y + 62}; // pusat pembaca nirsentuh
// kartu
const CW = 380;
const CH = 240;
const REST = {x: 1196, y: 600, r: -9};
const TAP = {x: TM.x + TM.w / 2 + 22, y: TM.y - 22, r: 4};

/** Ikon nirsentuh (3 busur) berpusat di (x, y), mengarah ke kanan. */
const Waves: React.FC<{x: number; y: number; s: number; col: string; w?: number}> = ({x, y, s, col, w = 9}) => (
  <g>
    {[0, 1, 2].map((i) => (
      <path key={i} d={arcPath(x - 14 * s, y, (14 + i * 14) * s, Math.PI / 2 - 0.75, Math.PI / 2 + 0.75)} fill="none" stroke={col} strokeWidth={w} strokeLinecap="round" />
    ))}
  </g>
);

const Card: React.FC = () => {
  const col = C.blue;
  const R = 22;
  return (
    <g>
      <rect x={-CW / 2 + 8} y={-CH / 2 + 12} width={CW} height={CH} rx={R} fill={shade(col, -0.32)} />
      <rect x={-CW / 2} y={-CH / 2} width={CW} height={CH} rx={R} fill={col} />
      <path d={`M${CW * 0.02},${CH / 2} L${CW / 2 - R},${CH / 2} A${R},${R} 0 0 0 ${CW / 2},${CH / 2 - R} L${CW / 2},${-CH * 0.18} Z`} fill={shade(col, -0.12)} />
      <rect x={-CW / 2 + 26} y={-CH / 2 + 18} width={150} height={9} rx={4.5} fill={shade(col, 0.32)} />
      {/* cip */}
      <rect x={-CW / 2 + 34} y={-CH / 2 + 62} width={70} height={52} rx={11} fill={C.yellow} />
      <rect x={-CW / 2 + 34} y={-CH / 2 + 84} width={70} height={8} fill={shade(C.yellow, -0.22)} />
      <rect x={-CW / 2 + 64} y={-CH / 2 + 62} width={8} height={52} fill={shade(C.yellow, -0.22)} />
      <Waves x={CW / 2 - 50} y={-CH / 2 + 88} s={0.9} col={C.white} w={8} />
      {/* nomor (balok, bukan angka) */}
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={-CW / 2 + 34 + i * 82} y={CH * 0.1} width={66} height={16} rx={8} fill={shade(col, 0.55)} />
      ))}
      <rect x={-CW / 2 + 34} y={CH * 0.3} width={130} height={14} rx={7} fill={shade(col, 0.35)} />
      <rect x={CW / 2 - 104} y={CH * 0.3} width={70} height={14} rx={7} fill={shade(col, 0.35)} />
    </g>
  );
};

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  const tap = yoyo(p, 0.14, 0.27, 0.5, 0.62, inOut, inOut);
  const float = 1 - tap;
  const cx = mix(REST.x, TAP.x, tap);
  const cy = mix(REST.y, TAP.y, tap) + 10 * float * wave(p, 2);
  const cr = mix(REST.r, TAP.r, tap) + 1.5 * float * wave(p, 2, 0.25);
  const contact = 0.27;
  const bump = pop(p, contact, 0.07, 0.04);
  const spin = seg(p, 0.3, 0.44, (t) => t);
  const spinOn = yoyo(p, 0.29, 0.31, 0.42, 0.44);
  const ok = yoyo(p, 0.43, 0.5, 0.82, 0.9, out, inOut); // layar hijau
  const check = yoyo(p, 0.47, 0.55, 0.82, 0.88, inOut, inOut);
  const checkPop = outBack(clamp((p - 0.47) / 0.08), 2.5);
  const spark = yoyo(p, 0.48, 0.56, 0.8, 0.88, (t) => outBack(t, 2));
  const idleBars = 1 - yoyo(p, 0.28, 0.3, 0.88, 0.92);
  const breath = 1 + 0.008 * wave(p, 2);
  const keyGlow = (i: number) => (i === 8 ? yoyo(p, 0.45, 0.48, 0.52, 0.56) : 0);
  return (
    <g>
      <Shadow cx={TM.x + TM.w / 2 + 10} cy={TM.y + TM.h + 30} rx={220} ry={22} vector={vector} />
      <Shadow cx={REST.x} cy={TM.y + TM.h + 30} rx={170 * (1 - 0.4 * tap)} ry={16} s={1 - 0.03 * wave(p, 2)} vector={vector} strength={0.8 * (1 - tap)} />
      <g transform={`translate(${TM.x + TM.w / 2} ${TM.y + TM.h}) scale(${breath / bump ** 0.5} ${breath * bump}) translate(${-(TM.x + TM.w / 2)} ${-(TM.y + TM.h)})`}>
        {/* badan terminal */}
        <rect x={TM.x + 14} y={TM.y + 14} width={TM.w} height={TM.h} rx={TM.r} fill={shade(C.slate, -0.35)} />
        <rect x={TM.x} y={TM.y} width={TM.w} height={TM.h} rx={TM.r} fill={C.slate} />
        <rect x={TM.x + 18} y={TM.y + 14} width={110} height={10} rx={5} fill={shade(C.slate, 0.3)} />
        {/* pembaca nirsentuh */}
        <rect x={RD.x - 54} y={RD.y - 38} width={108} height={76} rx={20} fill={shade(C.slate, -0.18)} />
        <Waves x={RD.x + 4} y={RD.y} s={1.1} col={C.mist} w={9} />
        {/* layar */}
        <rect x={SCR.x} y={SCR.y} width={SCR.w} height={SCR.h} rx={SCR.r} fill={C.navy} />
        {idleBars > 0.01 ? (
          <g>
            <rect x={SCR.x + 30} y={SCR.y + 40} width={120 * idleBars} height={18} rx={9} fill={C.sky} />
            <rect x={SCR.x + 30} y={SCR.y + 78} width={180 * idleBars} height={30} rx={15} fill={shade(C.navy, 0.3)} />
          </g>
        ) : null}
        {spinOn > 0.01 ? (
          <g transform={`translate(${SCR.x + SCR.w / 2} ${SCR.y + SCR.h / 2}) rotate(${spin * 720}) scale(${spinOn})`}>
            <circle r={40} fill="none" stroke={shade(C.navy, 0.25)} strokeWidth={12} />
            <path d={arcPath(0, 0, 40, 0, 1.9)} fill="none" stroke={C.sky} strokeWidth={12} strokeLinecap="round" />
          </g>
        ) : null}
        {ok > 0.01 ? (
          vector ? (
            <rect x={SCR.x} y={SCR.y} width={SCR.w} height={SCR.h} rx={SCR.r} fill={C.green} />
          ) : (
            <g>
              <clipPath id="business-contactless-card-payment-scr">
                <rect x={SCR.x} y={SCR.y} width={SCR.w} height={SCR.h} rx={SCR.r} />
              </clipPath>
              <circle clipPath="url(#business-contactless-card-payment-scr)" cx={SCR.x + SCR.w / 2} cy={SCR.y + SCR.h / 2} r={150 * ok} fill={C.green} />
            </g>
          )
        ) : null}
        {check > 0.01 ? (
          <g transform={`translate(${SCR.x + SCR.w / 2} ${SCR.y + SCR.h / 2}) scale(${0.6 + 0.4 * checkPop})`}>
            <circle r={46} fill={shade(C.green, -0.14)} />
            <path d="M-22,2 L-6,18 L24,-14" fill="none" stroke={C.white} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${(70 * check).toFixed(1)} 200`} />
          </g>
        ) : null}
        {/* papan tombol */}
        {Array.from({length: 9}, (_, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          const bw = 70;
          const bh = 44;
          const gx = (TM.w - 68 - bw * 3) / 2;
          const x = TM.x + 34 + col * (bw + gx);
          const y = SCR.y + SCR.h + 32 + row * 62;
          const base = i === 6 ? C.coral : i === 8 ? C.green : C.mist;
          const press = keyGlow(i) * 6;
          return (
            <g key={i}>
              <rect x={x} y={y + 6} width={bw} height={bh} rx={12} fill={shade(base, -0.28)} />
              <rect x={x} y={y + press} width={bw} height={bh} rx={12} fill={base} />
              <rect x={x + 10} y={y + press + 8} width={24} height={7} rx={3.5} fill={shade(base, 0.45)} />
            </g>
          );
        })}
      </g>
      {/* gelombang memancar dari pembaca */}
      {[0, 1, 2].map((i) => {
        const u = seg(p, 0.25 + i * 0.05, 0.42 + i * 0.05, out);
        if (u <= 0 || u >= 1) return null;
        const r = 90 + 190 * u;
        const w = 14 * (1 - u * u) + 3;
        return (
          <g key={`w${i}`}>
            <path d={arcPath(RD.x, RD.y, r, -Math.PI / 2 - 0.6, -Math.PI / 2 + 0.6)} fill="none" stroke={C.sky} strokeWidth={w} strokeLinecap="round" />
            <path d={arcPath(RD.x, RD.y, r, Math.PI / 2 - 0.6, Math.PI / 2 + 0.6)} fill="none" stroke={C.sky} strokeWidth={w} strokeLinecap="round" />
          </g>
        );
      })}
      {/* kartu */}
      <g transform={`translate(${cx.toFixed(2)} ${cy.toFixed(2)}) rotate(${cr.toFixed(3)})`}>
        <Card />
      </g>
      {/* kilau keberhasilan */}
      <Sparkle x={TM.x - 70} y={SCR.y + 10} r={26 * spark * (0.8 + 0.2 * wave(p, 4))} color={C.yellow} rot={15} />
      <Sparkle x={TM.x - 40} y={SCR.y - 70} r={14 * spark * (0.8 + 0.2 * wave(p, 4, 0.3))} color={C.green} />
      <Sparkle x={TM.x - 90} y={SCR.y + 120} r={12 * spark} color={C.sky} rot={10} />
    </g>
  );
};
