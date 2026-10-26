// Kaca pembesar memindai dokumen: dokumen tersusun → lensa menyapu baris demi baris (isi tampak diperbesar) → menemukan baris: stabilo + riak → kembali istirahat.
import React from 'react';
import {clamp, inOut, out, outBack, seg, wave, yoyo} from '../../kit/loop';
import {C, blend, shade} from '../../kit/palette';
import {Shadow, Sparkle, roundedPath} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'ui-magnifier-document-scan',
  theme: 'ui',
  title: 'Magnifying glass scanning a document and highlighting a found line, search icon flat animation, seamless loop with alpha channel',
  keywords: [
    'magnifying glass',
    'search',
    'document',
    'scan',
    'scanning',
    'find',
    'research',
    'analysis',
    'inspection',
    'audit',
    'review',
    'file',
    'paper',
    'zoom',
    'highlight',
    'magnifier',
    'seo',
    'data',
    'report',
    'icon',
    'ui',
    'user interface',
    'app',
    'web',
    'business',
    'office',
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
    'education',
    'digital',
  ],
  category: 8,
  seconds: 9,
  vectorP: 0.62,
};

const DOC = {x: 690, y: 218, w: 470, h: 620};
const FOLD = 96;
const DOC_D = roundedPath(
  [
    [DOC.x, DOC.y],
    [DOC.x + DOC.w - FOLD, DOC.y],
    [DOC.x + DOC.w, DOC.y + FOLD],
    [DOC.x + DOC.w, DOC.y + DOC.h],
    [DOC.x, DOC.y + DOC.h],
  ],
  30,
);
const FOLD_D = roundedPath(
  [
    [DOC.x + DOC.w - FOLD, DOC.y + 4],
    [DOC.x + DOC.w - FOLD, DOC.y + FOLD - 10],
    [DOC.x + DOC.w - FOLD + 10, DOC.y + FOLD],
    [DOC.x + DOC.w - 4, DOC.y + FOLD],
  ],
  10,
);
// baris teks: [x, y, w]
const LINES: [number, number, number][] = [
  [DOC.x + 56, DOC.y + 262, 358],
  [DOC.x + 56, DOC.y + 318, 300],
  [DOC.x + 56, DOC.y + 374, 340],
  [DOC.x + 56, DOC.y + 430, 250],
  [DOC.x + 56, DOC.y + 486, 330],
  [DOC.x + 56, DOC.y + 542, 210],
];
const TARGET = 3;
const LR = 124; // jari-jari lensa
const ZOOM = 1.7;
// lintasan pusat lensa: [p, x, y]
const KEYS: [number, number, number][] = [
  [0.0, 1250, 690],
  [0.08, 1250, 690],
  [0.2, 830, 400],
  [0.32, 1060, 470],
  [0.42, 850, 600],
  [0.52, 960, 650],
  [0.74, 960, 650],
  [0.88, 1250, 690],
  [1.0, 1250, 690],
];

const lensAt = (p: number) => {
  for (let i = 0; i < KEYS.length - 1; i++) {
    const [a, x0, y0] = KEYS[i];
    const [b, x1, y1] = KEYS[i + 1];
    if (p >= a && p <= b) {
      const t = inOut(clamp((p - a) / (b - a)));
      return [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t];
    }
  }
  return [KEYS[0][1], KEYS[0][2]];
};

const Content: React.FC<{p: number; vector?: boolean; found: number}> = ({p, vector, found}) => {
  const grow = (i: number) => (vector ? 1 : yoyo(p, 0.02 + i * 0.02, 0.1 + i * 0.02, 0.92, 0.97, out, inOut));
  const pic = grow(0);
  return (
    <g>
      {/* gambar */}
      <g transform={`translate(${DOC.x + 56} ${DOC.y + 190}) scale(${outBack(clamp(pic), 1.4).toFixed(4)}) translate(${-(DOC.x + 56)} ${-(DOC.y + 190)})`}>
        <rect x={DOC.x + 56} y={DOC.y + 60} width={200} height={130} rx={18} fill={blend(C.sky, C.white, 0.55)} />
        <circle cx={DOC.x + 212} cy={DOC.y + 96} r={18} fill={C.yellow} />
        <path
          d={`M${DOC.x + 56},${DOC.y + 172} L${DOC.x + 118},${DOC.y + 112} L${DOC.x + 160},${DOC.y + 150} L${DOC.x + 190},${DOC.y + 126} L${DOC.x + 256},${DOC.y + 180} L${DOC.x + 256},${DOC.y + 172} Q${DOC.x + 256},${DOC.y + 190} ${DOC.x + 238},${DOC.y + 190} L${DOC.x + 74},${DOC.y + 190} Q${DOC.x + 56},${DOC.y + 190} ${DOC.x + 56},${DOC.y + 172} Z`}
          fill={C.teal}
        />
      </g>
      <rect x={DOC.x + 288} y={DOC.y + 78} width={124 * grow(1)} height={22} rx={11} fill={C.ink} />
      <rect x={DOC.x + 288} y={DOC.y + 124} width={96 * grow(2)} height={18} rx={9} fill={C.mist} />
      {LINES.map(([x, y, w], i) => {
        const g = grow(i + 2);
        const hl = i === TARGET ? found : 0;
        return (
          <g key={i}>
            {hl > 0.01 ? <rect x={x - 14} y={y - 14} width={(w + 28) * hl} height={46} rx={14} fill={C.yellow} /> : null}
            <rect x={x} y={y} width={w * g} height={18} rx={9} fill={i === TARGET ? blend(C.mist, C.ink, found) : C.mist} />
          </g>
        );
      })}
    </g>
  );
};

/** Isi lensa untuk vektor: baris diperbesar dipotong analitis ke lingkaran (tanpa clipPath). */
const LensVector: React.FC<{lx: number; ly: number}> = ({lx, ly}) => {
  const R = LR - 18;
  const box = (x: number, y: number, w: number, h: number, fill: string, rx: number, key: string) => {
    const x0 = (x - lx) * ZOOM;
    const x1 = (x + w - lx) * ZOOM;
    const y0 = (y - ly) * ZOOM;
    const y1 = (y + h - ly) * ZOOM;
    if (y1 < -R || y0 > R) return null;
    const yy = y0 < 0 && y1 > 0 ? 0 : Math.max(y0 * y0, y1 * y1);
    if (yy >= R * R) return null;
    const hw = Math.sqrt(R * R - yy);
    const a = Math.max(x0, -hw);
    const b = Math.min(x1, hw);
    if (b - a < 2 * rx * ZOOM) return null;
    return <rect key={key} x={a} y={y0} width={b - a} height={y1 - y0} rx={rx * ZOOM} fill={fill} />;
  };
  return (
    <g>
      {LINES.map(([x, y, w], i) => (
        <g key={i}>
          {i === TARGET ? box(x - 14, y - 14, w + 28, 46, C.yellow, 14, 'h') : null}
          {box(x, y, w, 18, i === TARGET ? C.ink : C.mist, 9, 'l')}
        </g>
      ))}
    </g>
  );
};

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  const [lx0, ly0] = lensAt(p);
  const lx = lx0 + (vector ? 0 : 5 * wave(p, 3));
  const ly = ly0 + (vector ? 0 : 8 * wave(p, 2, 0.25));
  const [nx] = lensAt(Math.min(1, p + 0.01));
  const tilt = vector ? 0 : clamp((nx - lx0) * 0.2, -6, 6);
  const found = vector ? 1 : yoyo(p, 0.54, 0.6, 0.84, 0.9, out, inOut);
  const rip = vector ? -1 : (p - 0.53) / 0.14;
  const tw = (k: number, ph: number) => (vector ? 1 : 0.8 + 0.2 * wave(p, k, ph));
  const breath = vector ? 1 : 1 + 0.01 * wave(p, 2);
  const glass = vector ? blend(C.sky, C.white, 0.86) : blend(C.sky, C.white, 0.72);
  const handleA = 45; // derajat, menunjuk kanan bawah
  return (
    <g>
      <Shadow cx={960} cy={DOC.y + DOC.h + 48} rx={360} ry={26} vector={vector} />
      {/* dokumen */}
      <g transform={`translate(925 ${DOC.y + DOC.h}) scale(${breath.toFixed(4)}) translate(-925 ${-(DOC.y + DOC.h)})`}>
        <path d={DOC_D} fill={shade(C.mist, -0.1)} transform="translate(-34 26) rotate(-4 925 838)" />
        <path d={DOC_D} fill={shade(C.mist, -0.18)} transform="translate(0 18)" />
        <path d={DOC_D} fill={C.white} stroke={C.cloud} strokeWidth={8} strokeLinejoin="round" />
        <rect x={DOC.x} y={DOC.y + DOC.h - 44} width={DOC.w} height={44} rx={22} fill={C.cloud} />
        <rect x={DOC.x} y={DOC.y + DOC.h - 44} width={DOC.w} height={22} fill={C.cloud} />
        <path d={FOLD_D} fill={shade(C.cloud, -0.08)} />
        <Content p={p} vector={vector} found={found} />
      </g>
      {/* riak saat ketemu */}
      {rip > 0 && rip < 1
        ? [0, 0.25].map((d, j) => {
            const t = clamp((rip - d) / (1 - d));
            if (t <= 0) return null;
            return (
              <circle
                key={j}
                cx={lx}
                cy={ly}
                r={LR + 20 + 90 * out(t)}
                fill="none"
                stroke={C.yellow}
                strokeWidth={14 * (1 - t) + 3}
                opacity={(1 - t) * 0.7}
              />
            );
          })
        : null}
      {/* kaca pembesar */}
      <g transform={`translate(${lx.toFixed(2)} ${ly.toFixed(2)}) rotate(${tilt.toFixed(2)})`}>
        {/* gagang */}
        <g transform={`rotate(${handleA - 90})`}>
          <rect x={-30} y={LR + 6} width={60} height={70} rx={14} fill={shade(C.teal, -0.18)} />
          <rect x={-34} y={LR + 66} width={68} height={190} rx={34} fill={shade(C.navy, -0.15)} transform="translate(6 0)" />
          <rect x={-34} y={LR + 66} width={68} height={190} rx={34} fill={C.ink} />
          <rect x={-18} y={LR + 96} width={12} height={120} rx={6} fill={shade(C.ink, 0.3)} />
        </g>
        {/* kaca */}
        <circle r={LR} fill={glass} />
        {vector ? <LensVector lx={lx} ly={ly} /> : null}
        {!vector ? (
          <g clipPath="url(#ui-magnifier-document-scan-clip)">
            <clipPath id="ui-magnifier-document-scan-clip">
              <circle r={LR} />
            </clipPath>
            <g transform={`rotate(${-tilt.toFixed(2)}) scale(${ZOOM}) translate(${-lx.toFixed(2)} ${-ly.toFixed(2)})`}>
              <path d={DOC_D} fill={C.white} />
              <Content p={p} vector={vector} found={found} />
            </g>
            <circle r={LR} fill={C.sky} opacity={0.12} />
            {/* garis pindai */}
            {(() => {
              const scanK = seg(p, 0.1, 0.16) * (1 - seg(p, 0.48, 0.53));
              if (scanK < 0.01) return null;
              const y = -LR + 2 * LR * (0.5 + 0.5 * wave(p, 6));
              return <rect x={-LR} y={y - 5} width={2 * LR} height={10} fill={C.teal} opacity={0.55 * scanK} />;
            })()}
          </g>
        ) : null}
        <path d={`M${-LR * 0.62},${-LR * 0.2} A${LR * 0.66},${LR * 0.66} 0 0 1 ${-LR * 0.2},${-LR * 0.62}`} fill="none" stroke={C.white} strokeWidth={14} strokeLinecap="round" />
        {/* bingkai */}
        <circle r={LR} fill="none" stroke={shade(C.teal, -0.2)} strokeWidth={34} transform="translate(0 8)" />
        <circle r={LR} fill="none" stroke={C.teal} strokeWidth={34} />
        <path d={`M${-LR * 0.92},${-LR * 0.38} A${LR},${LR} 0 0 1 ${-LR * 0.38},${-LR * 0.92}`} fill="none" stroke={shade(C.teal, 0.42)} strokeWidth={10} strokeLinecap="round" />
      </g>
      <Sparkle x={1250} y={300} r={26 * found * tw(4, 0)} color={C.yellow} rot={15} />
      <Sparkle x={610} y={420} r={18 * found * tw(4, 0.5)} color={C.teal} />
      <Sparkle x={1330} y={440} r={14 * found * tw(3, 0.2)} color={C.sky} rot={30} />
    </g>
  );
};
