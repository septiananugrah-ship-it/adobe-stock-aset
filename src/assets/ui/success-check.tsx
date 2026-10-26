// Lingkaran centang sukses: cincin tergambar → cakram mengembang → centang tergambar + ledakan konfeti → tahan → surut.
import React from 'react';
import {TAU, clamp, inOut, mod, out, outBack, rng, seg, wave, wave01, yoyo} from '../../kit/loop';
import {C, shade} from '../../kit/palette';
import {Shadow, Sparkle, arcPath} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'ui-success-check',
  theme: 'ui',
  title: 'Green success checkmark circle drawing itself with confetti burst, flat icon animation, seamless loop with alpha channel',
  keywords: [
    'checkmark',
    'check mark',
    'success',
    'done',
    'complete',
    'approved',
    'tick',
    'confirmation',
    'verified',
    'correct',
    'icon',
    'animated icon',
    'ui animation',
    'success icon',
    'ui',
    'user interface',
    'app',
    'payment successful',
    'task completed',
    'accepted',
    'ok',
    'yes',
    'confetti',
    'celebration',
    'green',
    'circle',
    'button',
    'web',
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
    'ux',
    'digital',
  ],
  category: 8,
  seconds: 7,
  vectorP: 0.56,
};

const CX = 960;
const CY = 514;
const R_RING = 262;
const R_DISK = 222;
const CHECK: [number, number][] = [
  [-96, 6],
  [-28, 74],
  [108, -64],
];
const L1 = Math.hypot(CHECK[1][0] - CHECK[0][0], CHECK[1][1] - CHECK[0][1]);
const L2 = Math.hypot(CHECK[2][0] - CHECK[1][0], CHECK[2][1] - CHECK[1][1]);
const CHECK_D = `M${CHECK[0][0]},${CHECK[0][1]} L${CHECK[1][0]},${CHECK[1][1]} L${CHECK[2][0]},${CHECK[2][1]}`;
const BURST_AT = 0.36;

// konfeti: tersebar merata di atas & samping (sektor bawah dikosongkan agar tidak menimpa bayangan lantai)
const CONF = (() => {
  const r = rng(11);
  const cols = [C.teal, C.yellow, C.green, C.sky, C.yellow, C.teal, C.green];
  const n = 16;
  return Array.from({length: n}, (_, i) => ({
    a: ((-132 + (i * 264) / (n - 1) + (r() - 0.5) * 8) * Math.PI) / 180,
    d: (i % 2 ? 392 : 340) + r() * 26,
    s: 11 + r() * 5,
    col: cols[i % cols.length],
    kind: i % 3,
    spin: (r() - 0.5) * 540,
    delay: r() * 0.03,
  }));
})();
/** Masuk dengan antisipasi (kebalikan outBack): untuk mengecil cepat saat keluar. */
const inBack = (t: number, s = 1.70158) => t * t * ((s + 1) * t - s);

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  const ringIn = seg(p, 0.05, 0.24, inOut);
  const ringOut = seg(p, 0.84, 0.95, inOut);
  const disk = yoyo(p, 0.17, 0.3, 0.82, 0.9, (t) => outBack(t, 1.3), (t) => inBack(t, 1.4));
  const check = seg(p, 0.29, 0.37, inOut); // keluar bersama cakram yang mengecil
  const hold = yoyo(p, 0.36, 0.44, 0.76, 0.84, inOut, inOut);
  const land = vector ? 1 : 1 + 0.06 * Math.sin(Math.PI * seg(p, 0.36, 0.44)) * (1 - seg(p, 0.36, 0.44));
  const breath = vector ? 1 : 1 + 0.018 * hold * wave(p, 3);
  const bt = vector ? 0.42 : (p - BURST_AT) / 0.16; // 0..1 ledakan
  const showBurst = bt > 0 && bt < 1;

  // cincin: tergambar dari atas searah jarum jam, lalu terhapus dari ujung awal
  const a0 = TAU * ringOut;
  const a1 = TAU * ringIn;
  const ringFull = ringIn >= 0.9995 && ringOut <= 0.0005;
  const ringVisible = a1 - a0 > 0.01;

  const fullCheck = L1 + L2;
  const drawn = fullCheck * (vector ? 1 : check);
  return (
    <g>
      <Shadow cx={CX} cy={858} rx={230} ry={24} s={vector ? 1 : Math.max(disk, 0.62)} vector={vector} />
      {/* riak saat ditahan */}
      {!vector
        ? [0, 0.5].map((off, i) => {
            const t = mod(p * 3 + off, 1);
            const o = hold * 0.35 * (1 - t);
            if (o < 0.01) return null;
            return <circle key={i} cx={CX} cy={CY} r={R_RING + 12 + 70 * out(t)} fill="none" stroke={C.green} strokeWidth={10 * (1 - t) + 2} opacity={o} />;
          })
        : null}
      {/* lintasan cincin (keadaan menunggu) */}
      <circle
        cx={CX}
        cy={CY}
        r={R_RING}
        fill="none"
        stroke={shade(C.mist, -0.04)}
        strokeWidth={20}
        transform={vector ? undefined : `translate(${CX} ${CY}) scale(${(1 + 0.015 * wave(p, 2)).toFixed(4)}) translate(${-CX} ${-CY})`}
      />
      {/* cincin luar */}
      {ringFull || vector ? (
        <circle cx={CX} cy={CY} r={R_RING} fill="none" stroke={C.teal} strokeWidth={20} />
      ) : ringVisible ? (
        <path d={arcPath(CX, CY, R_RING, a0, a1)} fill="none" stroke={C.teal} strokeWidth={20} strokeLinecap="round" />
      ) : null}
      {/* cakram */}
      {disk > 0.02 ? (
        <g transform={`translate(${CX} ${CY}) scale(${(disk * land * breath).toFixed(4)})`}>
          <circle r={R_DISK} fill={C.green} />
          <path
            d={`M${R_DISK},0 A${R_DISK},${R_DISK} 0 0 1 ${-R_DISK * 0.62},${R_DISK * 0.785} A${R_DISK * 1.12},${R_DISK * 1.12} 0 0 0 ${R_DISK},0 Z`}
            fill={shade(C.green, -0.13)}
          />
          <path d={arcPath(0, 0, R_DISK - 40, -1.25, -0.35)} fill="none" stroke={shade(C.green, 0.42)} strokeWidth={14} strokeLinecap="round" />
          <circle cx={(R_DISK - 40) * Math.sin(-1.6)} cy={-(R_DISK - 40) * Math.cos(-1.6)} r={8} fill={shade(C.green, 0.42)} />
          {/* kilau menyapu (motion saja) */}
          {!vector && hold > 0.01 ? (
            <g clipPath="url(#ui-success-check-clip)" opacity={0.18 * hold}>
              <clipPath id="ui-success-check-clip">
                <circle r={R_DISK} />
              </clipPath>
              {(() => {
                const s = seg(mod(p * 2, 1), 0.1, 0.6, inOut);
                const x = -R_DISK * 1.6 + s * R_DISK * 3.2;
                return <path d={`M${x},${-R_DISK} l70,0 l-150,${R_DISK * 2} l-70,0 Z`} fill={C.white} />;
              })()}
            </g>
          ) : null}
          {/* centang: bayangan + putih */}
          {drawn > 1 ? (
            <g>
              <path
                d={CHECK_D}
                transform="translate(6 10)"
                fill="none"
                stroke={shade(C.green, -0.24)}
                strokeWidth={44}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={`${drawn.toFixed(1)} ${fullCheck + 20}`}
              />
              <path
                d={CHECK_D}
                fill="none"
                stroke={C.white}
                strokeWidth={44}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={`${drawn.toFixed(1)} ${fullCheck + 20}`}
              />
            </g>
          ) : null}
        </g>
      ) : null}
      {/* sinar ledakan */}
      {showBurst && !vector
        ? Array.from({length: 8}, (_, i) => {
            const a = (i / 8) * TAU + TAU / 16;
            // sinar melesat: ujung luar bergerak lebih cepat dari ujung dalam → memanjang lalu memendek
            const r0 = R_RING + 28 + 150 * out(clamp(bt));
            const r1 = R_RING + 28 + 150 * out(clamp(bt * 2));
            const len = r1 - r0;
            const col = [C.yellow, C.teal][i % 2];
            const o = clamp(bt * 8) * (1 - seg(bt, 0.65, 1));
            if (o < 0.01) return null;
            return (
              <line
                key={i}
                x1={CX + r0 * Math.sin(a)}
                y1={CY - r0 * Math.cos(a)}
                x2={CX + (r0 + len) * Math.sin(a)}
                y2={CY - (r0 + len) * Math.cos(a)}
                stroke={col}
                strokeWidth={13}
                strokeLinecap="round"
                opacity={o >= 1 ? undefined : o}
              />
            );
          })
        : null}
      {/* konfeti */}
      {CONF.map((c, i) => {
        const t = vector ? 0.62 : clamp((p - BURST_AT - c.delay) / 0.3);
        if (t <= 0 || t >= 1) return null;
        const e = out(t);
        const d = R_RING * 0.9 + (c.d - R_RING * 0.9) * e;
        const x = CX + d * Math.sin(c.a);
        const y = CY - d * Math.cos(c.a) + (vector ? 0 : 40 * t * t);
        const o = vector ? 1 : Math.min(1, t * 8) * (1 - seg(t, 0.55, 1));
        const sc = vector ? 1 : 0.6 + 0.4 * Math.sin(Math.PI * Math.min(1, t * 1.6));
        const rot = c.spin * e;
        return (
          <g
            key={i}
            transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${sc.toFixed(3)})`}
            opacity={o >= 1 ? undefined : o}
          >
            {c.kind === 0 ? (
              <circle r={c.s * 0.75} fill={c.col} />
            ) : c.kind === 1 ? (
              <rect x={-c.s} y={-c.s * 0.45} width={c.s * 2} height={c.s * 0.9} rx={c.s * 0.45} fill={c.col} />
            ) : (
              <Sparkle x={0} y={0} r={c.s * 1.2} color={c.col} />
            )}
          </g>
        );
      })}
      {/* kilau saat ditahan (motion; di vektor peran ini diambil konfeti) */}
      <Sparkle x={CX + 330} y={CY - 250} r={vector ? 0 : 24 * hold * (0.8 + 0.2 * wave(p, 4))} color={C.yellow} rot={12} />
      <Sparkle x={CX - 340} y={CY + 170} r={vector ? 0 : 18 * hold * (0.8 + 0.2 * wave(p, 4, 0.5))} color={C.teal} />
      <Sparkle x={CX - 300} y={CY - 260} r={vector ? 0 : 13 * hold * wave01(p, 3, 0.2)} color={C.green} rot={30} />
    </g>
  );
};
