// Baterai mengisi daya: petir muncul → sel terisi berurutan (merah → hijau) → penuh: pop + sinar → tahan berkilau → terkuras kembali.
import React from 'react';
import {TAU, clamp, inOut, mod, out, outBack, seg, wave, wave01, yoyo} from '../../kit/loop';
import {C, blend, shade} from '../../kit/palette';
import {Glow, Shadow, Sparkle, roundedPath} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'ui-battery-charging',
  theme: 'ui',
  title: 'Battery charging with lightning bolt, cells filling from red to full green, flat icon animation, seamless loop with alpha channel',
  keywords: [
    'battery',
    'charging',
    'battery charging',
    'lightning bolt',
    'energy',
    'power',
    'full battery',
    'low battery',
    'charge level',
    'electricity',
    'recharge',
    'icon',
    'ui',
    'user interface',
    'app',
    'mobile',
    'smartphone',
    'status',
    'indicator',
    'progress',
    'green',
    'eco',
    'electric',
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
    'technology',
    'ux',
    'digital',
  ],
  category: 19,
  seconds: 8,
  vectorP: 0.7,
};

const CX = 960;
const CY = 520;
const BODY = {x: 600, y: 320, w: 690, h: 400, r: 70};
const WELL = {x: BODY.x + 34, y: BODY.y + 34, w: BODY.w - 68, h: BODY.h - 68, r: 40};
const GAP = 18;
const NC = 4;
const CW = (WELL.w - GAP * (NC + 1)) / NC;
const CH = WELL.h - GAP * 2;
const CELL_T = [0.16, 0.27, 0.38, 0.49]; // mulai tiap sel terisi
const CELL_D = 0.08;
const FULL = 0.57;
const COLS = [C.coral, C.orange, C.yellow, C.green];
const BOLT: [number, number][] = [
  [-12, -142],
  [62, -142],
  [22, -34],
  [80, -34],
  [-46, 148],
  [-8, 24],
  [-74, 24],
];
const BOLT_D = roundedPath(BOLT, 9);
const BOLT_LOW = roundedPath([[22, -34], [80, -34], [-46, 148], [-8, 24], [-34, 24], [4, -34]], 6);

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  // isi tiap sel 0..1 (sel 0 selalu ada sebagai "baterai lemah")
  const drain = vector ? 0 : seg(p, 0.84, 0.94, inOut);
  const fill = CELL_T.map((t, i) => (i === 0 ? 1 : vector ? 1 : seg(p, t, t + CELL_D, (u) => outBack(u, 1.6)) * (1 - drain)));
  const level = vector ? 3 : fill.slice(1).reduce((a, b) => a + clamp(b), 0);
  const li = Math.min(2, Math.floor(level));
  const col = blend(COLS[li], COLS[li + 1], clamp(level - li));
  const charging = vector ? 1 : yoyo(p, 0.06, 0.14, 0.86, 0.94, (t) => outBack(t, 2), inOut);
  const lowBlink = vector ? 0 : 1 - yoyo(p, 0.08, 0.14, 0.88, 0.96);
  const full = vector ? 1 : yoyo(p, FULL, FULL + 0.05, 0.82, 0.88, out, inOut);
  const land = vector ? 1 : 1 + 0.06 * Math.sin(Math.PI * seg(p, FULL, FULL + 0.07)) * (1 - seg(p, FULL, FULL + 0.07));
  const breath = vector ? 1 : 1 + 0.012 * wave(p, 2);
  const boltPulse = vector ? 1 : 1 + 0.05 * wave01(p, 8) * (1 - full) * charging + 0.03 * full * wave(p, 4);
  const bt = vector ? 0.45 : (p - FULL) / 0.16;
  const sc = land * breath;
  return (
    <g>
      <Shadow cx={CX} cy={850} rx={380} ry={28} vector={vector} />
      <Glow cx={CX} cy={CY} r={420} color={C.green} strength={full * (0.8 + 0.2 * wave(p, 4))} vector={vector} />
      {/* sinar saat penuh */}
      {bt > 0 && bt < 1
        ? Array.from({length: 10}, (_, i) => {
            const a = (i / 10) * TAU + TAU / 20;
            const e = out(clamp(bt * 1.25));
            const rx = 430 + 80 * e;
            const ry = 260 + 80 * e;
            const len = 56 * (1 - out(clamp(bt))) + 6;
            const ux = Math.sin(a);
            const uy = -Math.cos(a);
            const x0 = CX + rx * ux;
            const y0 = CY + ry * uy;
            const o = vector ? 1 : 1 - seg(bt, 0.6, 1);
            return (
              <line
                key={i}
                x1={x0}
                y1={y0}
                x2={x0 + len * ux}
                y2={y0 + len * uy}
                stroke={[C.green, C.yellow][i % 2]}
                strokeWidth={12}
                strokeLinecap="round"
                opacity={o >= 1 ? undefined : o}
              />
            );
          })
        : null}
      {/* partikel energi naik saat mengisi */}
      {!vector
        ? Array.from({length: 6}, (_, i) => {
            const t = mod(p * 4 + i / 6, 1);
            const k = charging * (1 - full);
            const o = k * Math.sin(Math.PI * t);
            if (o < 0.02) return null;
            const x = BODY.x + 50 + ((i * 113) % (BODY.w - 60));
            const y = BODY.y + BODY.h - 60 - t * 380;
            return <circle key={i} cx={x} cy={y} r={7 + (i % 3) * 2} fill={i % 2 ? C.yellow : col} opacity={o * 0.85} />;
          })
        : null}
      <g transform={`translate(${CX} ${CY + BODY.h / 2}) scale(${sc.toFixed(4)}) translate(${-CX} ${-(CY + BODY.h / 2)})`}>
        {/* kutub (terminal) */}
        <rect x={BODY.x + BODY.w - 24} y={CY - 72} width={84} height={144} rx={26} fill={shade(C.mist, -0.2)} />
        <rect x={BODY.x + BODY.w - 24} y={CY - 72} width={84} height={40} rx={20} fill={shade(C.mist, -0.06)} />
        {/* badan */}
        <rect x={BODY.x} y={BODY.y + 18} width={BODY.w} height={BODY.h} rx={BODY.r} fill={shade(C.mist, -0.22)} />
        <rect x={BODY.x} y={BODY.y} width={BODY.w} height={BODY.h} rx={BODY.r} fill={C.cloud} />
        <path
          d={`M${BODY.x + 40},${BODY.y + 14} L${BODY.x + BODY.w - 60},${BODY.y + 17}`}
          stroke={C.white}
          strokeWidth={10}
          strokeLinecap="round"
        />
        <rect x={WELL.x} y={WELL.y} width={WELL.w} height={WELL.h} rx={WELL.r} fill={shade(C.navy, -0.12)} />
        {/* sel */}
        {fill.map((f, i) => {
          const w = CW * Math.max(0, f);
          if (w < 2) return null;
          const x = WELL.x + GAP + i * (CW + GAP);
          const y = WELL.y + GAP;
          const blink = i === 0 ? 1 - 0.55 * lowBlink * wave01(p, 6) : 1;
          const ci = i === 0 && level < 0.02 ? C.coral : col;
          const sh = 1 + 0.03 * full * wave(p, 4, -i * 0.12);
          return (
            <g key={i} opacity={blink >= 1 ? undefined : blink} transform={`translate(${x} ${y + CH}) scale(1 ${sh.toFixed(4)}) translate(${-x} ${-(y + CH)})`}>
              <rect x={x} y={y} width={w} height={CH} rx={Math.min(18, w / 2)} fill={ci} />
              <rect x={x} y={y + CH * 0.68} width={w} height={CH * 0.32} rx={Math.min(18, w / 2)} fill={shade(ci, -0.14)} />
              <rect x={x} y={y + CH * 0.68} width={w} height={20} fill={shade(ci, -0.14)} />
              {w > 30 ? <rect x={x + 14} y={y + 16} width={Math.max(0, Math.min(w - 28, 44))} height={12} rx={6} fill={shade(ci, 0.42)} /> : null}
            </g>
          );
        })}
        {/* kilau menyapu sel saat penuh (motion saja) */}
        {!vector && full > 0.01 ? (
          <g clipPath="url(#ui-battery-charging-clip)" opacity={0.25 * full}>
            <clipPath id="ui-battery-charging-clip">
              <rect x={WELL.x} y={WELL.y} width={WELL.w} height={WELL.h} rx={WELL.r} />
            </clipPath>
            {(() => {
              const s = seg(mod(p * 2, 1), 0.15, 0.65, inOut);
              const x = WELL.x - 160 + s * (WELL.w + 320);
              return <path d={`M${x},${WELL.y} l70,0 l-110,${WELL.h} l-70,0 Z`} fill={C.white} />;
            })()}
          </g>
        ) : null}
        {/* petir */}
        {charging > 0.01 ? (
          <g transform={`translate(${CX - 10} ${CY}) scale(${(1.3 * charging * boltPulse).toFixed(4)}) rotate(${(vector ? 0 : 8 * (1 - clamp(charging))).toFixed(2)})`}>
            <path d={BOLT_D} fill={shade(C.navy, -0.15)} transform="translate(10 12)" />
            <path d={BOLT_D} fill={C.white} />
            <path d={BOLT_LOW} fill={shade(C.cloud, -0.04)} />
          </g>
        ) : null}
      </g>
      <Sparkle x={1360} y={268} r={26 * full * (0.8 + 0.2 * wave(p, 4))} color={C.yellow} rot={15} />
      <Sparkle x={556} y={300} r={18 * full * (0.8 + 0.2 * wave(p, 4, 0.5))} color={C.green} />
      <Sparkle x={1380} y={760} r={15 * full * (0.75 + 0.25 * wave(p, 3, 0.2))} color={C.sky} rot={30} />
      <Sparkle x={540} y={740} r={13 * full * (0.75 + 0.25 * wave(p, 3, 0.7))} color={C.yellow} rot={30} />
    </g>
  );
};
