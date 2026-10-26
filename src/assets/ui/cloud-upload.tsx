// Unggah ke awan: berkas keluar dari folder di layar laptop dan terbang masuk ke awan, panah berdenyut, progres terisi bertahap → centang selesai → kembali.
import React from 'react';
import {clamp, inOut, mod, out, outBack, pop, seg, wave, yoyo} from '../../kit/loop';
import {C, blend, shade} from '../../kit/palette';
import {Shadow, Sparkle} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'ui-cloud-upload',
  theme: 'ui',
  title: 'Files uploading from laptop into cloud with progress bar and checkmark, flat icon animation, seamless loop with alpha channel',
  keywords: [
    'cloud upload',
    'upload',
    'cloud',
    'cloud storage',
    'cloud computing',
    'file transfer',
    'backup',
    'sync',
    'laptop',
    'progress bar',
    'data',
    'documents',
    'files',
    'folder',
    'arrow',
    'server',
    'online storage',
    'saas',
    'technology',
    'internet',
    'icon',
    'animated icon',
    'ui animation',
    'upload icon',
    'ui',
    'user interface',
    'app',
    'web',
    'complete',
    'success',
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
    'digital',
  ],
  category: 19,
  seconds: 8,
  vectorP: 0.42,
};

const CX = 960;
const CLOUD: [number, number, number][] = [
  [820, 362, 100],
  [962, 306, 150],
  [1104, 356, 108],
];
const BASE = {x: 706, y: 344, w: 508, h: 142, r: 71};
const CLOUD_BOTTOM = BASE.y + BASE.h;
const ARROW_Y = 372;
// laptop
const SCR = {x: 744, y: 616, w: 432, h: 250, r: 24};
const IN = {x: SCR.x + 18, y: SCR.y + 18, w: SCR.w - 36, h: SCR.h - 36};
const BAR = {x: IN.x + 50, y: IN.y + IN.h - 52, w: IN.w - 100, h: 22};
const FOLDER = {x: CX, y: IN.y + 84};
const FILES = [
  {dx: -70, at: 0.08, col: C.blue, rot: -10},
  {dx: 40, at: 0.17, col: C.teal, rot: 8},
  {dx: -20, at: 0.26, col: C.yellow, rot: -6},
  {dx: 70, at: 0.35, col: C.blue, rot: 10},
];
const DONE = 0.56;

const BAND = 22; // tebal sisi gelap di dasar awan
/** Awan datar: alas kapsul gelap penuh, di atasnya awan terang dengan alas lebih pendek → pita gelap rapi di bawah. */
const Cloud: React.FC = () => (
  <g>
    <rect x={BASE.x} y={BASE.y} width={BASE.w} height={BASE.h} rx={BASE.r} fill={shade(C.sky, -0.2)} />
    <g fill={C.sky}>
      <rect x={BASE.x} y={BASE.y} width={BASE.w} height={BASE.h - BAND} rx={(BASE.h - BAND) / 2} />
      {CLOUD.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} />
      ))}
    </g>
  </g>
);

const FileCard: React.FC<{col: string}> = ({col}) => (
  <g>
    <rect x={-46} y={-58} width={92} height={116} rx={16} fill={C.white} />
    <rect x={-46} y={30} width={92} height={28} rx={14} fill={shade(C.cloud, -0.05)} />
    <rect x={-46} y={30} width={92} height={12} fill={C.white} />
    <rect x={-28} y={-40} width={36} height={36} rx={10} fill={col} />
    <rect x={-28} y={8} width={56} height={11} rx={5.5} fill={C.mist} />
    <rect x={-28} y={28} width={38} height={11} rx={5.5} fill={C.mist} />
  </g>
);

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  const env = vector ? 1 : yoyo(p, 0.05, 0.1, DONE - 0.04, DONE, inOut, inOut);
  const progress = vector
    ? 0.68
    : p < 0.7
      ? 0.45 * seg(p, 0.08, 0.28, inOut) + 0.3 * seg(p, 0.3, 0.42, inOut) + 0.25 * seg(p, 0.44, DONE, inOut)
      : 1;
  // setelah selesai, bilah penuh memudar (bukan mundur) sebelum loop berulang
  const barO = vector || p < 0.7 ? 1 : 1 - seg(p, 0.82, 0.88, inOut);
  const done = vector ? 0 : yoyo(p, DONE, DONE + 0.08, 0.8, 0.86, (t) => outBack(t, 2.4), inOut);
  const arrowK = vector ? 1 : 1 - (p < 0.7 ? seg(p, DONE - 0.02, DONE + 0.03, inOut) : 1 - seg(p, 0.84, 0.9, (t) => outBack(t, 2)));
  const bob = vector ? 0 : 7 * wave(p, 2);
  const squash = vector ? 1 : pop(p, DONE, 0.07, 0.06);
  const sparkle = vector ? 1 : yoyo(p, DONE, DONE + 0.08, 0.78, 0.86, out, inOut);
  const cyc = mod(p * 8, 1);
  const arrowY = vector ? 0 : -24 * env * Math.pow(Math.sin(Math.PI * cyc), 2);
  const barGreen = vector ? 0 : seg(p, DONE - 0.02, DONE + 0.04);
  const barCol = blend(C.blue, C.teal, barGreen);
  // folder sedikit terbuka saat berkas keluar
  const lid = vector ? 1 : env;

  return (
    <g>
      <Shadow cx={CX} cy={918} rx={330} ry={26} vector={vector} />
      {/* laptop */}
      <rect x={SCR.x} y={SCR.y} width={SCR.w} height={SCR.h + 20} rx={SCR.r} fill={shade(C.mist, -0.1)} />
      <circle cx={CX} cy={SCR.y + 9} r={5} fill={shade(C.mist, -0.3)} />
      <rect x={IN.x} y={IN.y} width={IN.w} height={IN.h} rx={12} fill={C.navy} />
      <path
        d={`M${SCR.x - 70},${SCR.y + SCR.h} L${SCR.x + SCR.w + 70},${SCR.y + SCR.h} L${SCR.x + SCR.w + 70},${SCR.y + SCR.h + 22} Q${SCR.x + SCR.w + 70},${SCR.y + SCR.h + 40} ${SCR.x + SCR.w + 40},${SCR.y + SCR.h + 40} L${SCR.x - 40},${SCR.y + SCR.h + 40} Q${SCR.x - 70},${SCR.y + SCR.h + 40} ${SCR.x - 70},${SCR.y + SCR.h + 22} Z`}
        fill={C.mist}
      />
      <rect x={SCR.x - 70} y={SCR.y + SCR.h + 22} width={SCR.w + 140} height={18} rx={9} fill={shade(C.mist, -0.14)} />
      <rect x={CX - 60} y={SCR.y + SCR.h} width={120} height={12} rx={6} fill={shade(C.mist, -0.12)} />
      {/* bilah progres di layar */}
      <rect x={BAR.x} y={BAR.y} width={BAR.w} height={BAR.h} rx={BAR.h / 2} fill={C.ink} />
      {progress > 0.005 && barO > 0.005 ? (
        <rect
          x={BAR.x}
          y={BAR.y}
          width={Math.max(BAR.h, BAR.w * progress)}
          height={BAR.h}
          rx={BAR.h / 2}
          fill={barCol}
          opacity={barO >= 1 ? undefined : barO}
        />
      ) : null}
      {/* aliran data: titik-titik naik di kedua sisi */}
      {[-1, 1].map((side) =>
        [0, 1, 2, 3].map((j) => {
          const t = mod(p * 8 + j / 4 + (side > 0 ? 0.125 : 0), 1);
          const a = vector ? (j < 3 ? 1 : 0) : env * Math.sin(Math.PI * t);
          if (a < 0.02) return null;
          const y = 596 - 92 * (vector ? j / 3 : t);
          return (
            <circle
              key={`${side}${j}`}
              cx={CX + side * 170}
              cy={y.toFixed(1)}
              r={vector ? 8 : 8 * (0.6 + 0.4 * a)}
              fill={shade(C.sky, 0.1)}
              opacity={vector || a >= 1 ? undefined : a}
            />
          );
        }),
      )}
      {/* folder: belakang */}
      <rect x={FOLDER.x - 70} y={FOLDER.y - 44} width={140} height={90} rx={12} fill={shade(C.yellow, -0.2)} />
      {/* berkas terbang: keluar dari folder, masuk ke awan */}
      {FILES.map((f, i) => {
        const t = vector ? [0, 0.4, 0, 0][i] : (p - f.at) / 0.2;
        if (t <= 0 || t >= 1) return null;
        const e = inOut(t);
        const y0 = FOLDER.y - 10;
        const y = y0 + (CLOUD_BOTTOM - 40 - y0) * e + bob * e;
        const x = CX + f.dx * Math.sin(Math.PI * Math.min(1, e * 1.1));
        const sc = 0.55 + 0.4 * out(clamp(t / 0.4)) - 0.15 * seg(t, 0.6, 1);
        return (
          <g key={i} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(f.rot * Math.sin(Math.PI * t)).toFixed(2)}) scale(${sc.toFixed(4)})`}>
            <FileCard col={f.col} />
          </g>
        );
      })}
      {/* folder: depan (sedikit miring saat terbuka) */}
      <g transform={`translate(${FOLDER.x} ${FOLDER.y + 46}) skewX(${(-8 * lid).toFixed(2)}) scale(1 ${(1 - 0.12 * lid).toFixed(4)})`}>
        <rect x={-74} y={-62} width={148} height={62} rx={12} fill={C.yellow} />
        <rect x={-58} y={-50} width={50} height={9} rx={4.5} fill={shade(C.yellow, 0.45)} />
      </g>
      {/* awan */}
      <g
        transform={`translate(0 ${bob.toFixed(2)}) translate(${CX} ${CLOUD_BOTTOM}) scale(${(1 / squash).toFixed(4)} ${squash.toFixed(4)}) translate(${-CX} ${-CLOUD_BOTTOM})`}
      >
        <Cloud />
        <path d="M886,238 A116,116 0 0 1 990,192" fill="none" stroke={shade(C.sky, 0.45)} strokeWidth={16} strokeLinecap="round" />
        <circle cx={861} cy={262} r={9} fill={shade(C.sky, 0.45)} />
        <path d="M754,384 A70,70 0 0 1 776,326" fill="none" stroke={shade(C.sky, 0.3)} strokeWidth={12} strokeLinecap="round" />
        {arrowK > 0.01 ? (
          <g transform={`translate(${CX} ${(ARROW_Y + arrowY).toFixed(2)}) scale(${arrowK.toFixed(4)})`}>
            <path d="M0,-74 L-60,-14 M0,-74 L60,-14 M0,-70 L0,70" fill="none" stroke={C.white} strokeWidth={32} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        ) : null}
        {done > 0.01 ? (
          <g transform={`translate(${CX} ${ARROW_Y}) scale(${done.toFixed(4)})`}>
            <path d="M-68,0 L-22,46 L72,-48" fill="none" stroke={C.white} strokeWidth={34} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        ) : null}
      </g>
      <Sparkle x={1300} y={200} r={26 * sparkle * (0.8 + 0.2 * wave(p, 4))} color={C.yellow} rot={15} />
      <Sparkle x={630} y={250} r={18 * sparkle * (0.8 + 0.2 * wave(p, 4, 0.5))} color={C.teal} />
      <Sparkle x={1290} y={560} r={14 * sparkle * (0.75 + 0.25 * wave(p, 3, 0.2))} color={C.sky} rot={30} />
    </g>
  );
};
