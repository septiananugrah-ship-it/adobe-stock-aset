// Kamera instan: tombol ditekan → kilat blitz + rana iris menutup-membuka → foto keluar dari atas dan "berkembang" (warna muncul) → tahan → foto masuk kembali.
import React from 'react';
import {TAU, clamp, inOut, out, outBack, seg, wave, yoyo} from '../../kit/loop';
import {C, blend, shade} from '../../kit/palette';
import {Shadow, Sparkle} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'ui-camera-shutter-photo',
  theme: 'ui',
  title: 'Instant camera taking a picture with flash and iris shutter, photo printing out and developing, flat animation, seamless loop with alpha channel',
  keywords: [
    'camera',
    'photo',
    'photography',
    'instant camera',
    'shutter',
    'flash',
    'take a picture',
    'snapshot',
    'aperture',
    'lens',
    'picture',
    'image',
    'gallery',
    'capture',
    'photographer',
    'retro camera',
    'memories',
    'icon',
    'ui',
    'user interface',
    'app',
    'mobile app',
    'social media',
    'web',
    'media',
    'orange',
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
    'creative',
  ],
  category: 19,
  seconds: 8,
  vectorP: 0.66,
};

const CX = 960;
const BODY = {x: 630, y: 400, w: 660, h: 410, r: 64};
const LC = {x: CX, y: 612};
const R_RIM = 168;
const R_GLASS = 112;
const FLASH_AT = 0.16;
const PHOTO = {w: 300, h: 330};
const PHOTO_IN = BODY.y + 40; // puncak foto saat tersembunyi
const PHOTO_OUT = 104; // puncak foto saat keluar penuh

const kick = (p: number, a: number, w: number) => {
  const t = (p - a) / w;
  return t <= 0 || t >= 1 ? 0 : Math.sin(Math.PI * t) * (1 - t);
};

/** Iris enam bilah: a = jari-jari bukaan (0 = tertutup). */
const Iris: React.FC<{a: number; twist: number}> = ({a, twist}) => {
  const n = 6;
  const R = R_GLASS;
  const blade = shade(C.ink, 0.06);
  const seam = shade(C.ink, 0.3);
  const v = Array.from({length: n}, (_, k) => {
    const t = twist + (k * TAU) / n;
    return [a * Math.cos(t), a * Math.sin(t)];
  });
  const lines = v.map((p0, k) => {
    const p1 = v[(k + 1) % n];
    let dx = p1[0] - p0[0];
    let dy = p1[1] - p0[1];
    const L = Math.hypot(dx, dy) || 1;
    dx /= L;
    dy /= L;
    if (a < 0.5) {
      const t = twist + (k * TAU) / n;
      dx = Math.cos(t + 1.2);
      dy = Math.sin(t + 1.2);
    }
    // perpanjang dari p1 sampai ke tepi lingkaran R
    const b = p1[0] * dx + p1[1] * dy;
    const c = p1[0] * p1[0] + p1[1] * p1[1] - R * R;
    const s = -b + Math.sqrt(Math.max(0, b * b - c));
    return [p1[0], p1[1], p1[0] + dx * s, p1[1] + dy * s];
  });
  return (
    <g>
      <circle r={R} fill={blade} />
      {a > 1 ? (
        <g>
          <path d={v.map((q, k) => `${k ? 'L' : 'M'}${q[0].toFixed(2)},${q[1].toFixed(2)}`).join(' ') + ' Z'} fill={shade(C.navy, -0.1)} />
          {a > 30 ? <circle r={a * 0.62} fill={blend(C.navy, C.blue, 0.35)} /> : null}
          {a > 30 ? <circle cx={-a * 0.28} cy={-a * 0.3} r={Math.max(6, a * 0.16)} fill={shade(C.sky, 0.3)} /> : null}
        </g>
      ) : null}
      {lines.map((l, k) => (
        <line key={k} x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]} stroke={seam} strokeWidth={8} strokeLinecap="round" />
      ))}
    </g>
  );
};

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  const press = vector ? 0 : yoyo(p, 0.08, 0.12, 0.15, 0.19, inOut, outBack);
  const anti = vector ? 0 : Math.sin(Math.PI * seg(p, 0.08, 0.16, inOut));
  const recoil = vector ? 0 : kick(p, FLASH_AT, 0.12);
  // bukaan iris: menutup cepat lalu membuka dengan overshoot
  const close = vector ? 0 : yoyo(p, FLASH_AT, FLASH_AT + 0.035, FLASH_AT + 0.05, FLASH_AT + 0.12, inOut, (t) => outBack(t, 1.6));
  const aOpen = 80 + (vector ? 0 : 4 * wave(p, 2));
  const a = aOpen * (1 - close);
  const twist = -Math.PI / 6 + 0.6 * close;
  const flash = vector ? 0 : (p - FLASH_AT) / 0.14;
  const flashK = flash > 0 && flash < 1 ? 1 - out(flash) : 0;
  const rise = vector ? 1 : yoyo(p, 0.28, 0.42, 0.8, 0.9, out, inOut);
  const dev = vector ? 1 : yoyo(p, 0.4, 0.6, 0.86, 0.9, inOut, inOut);
  const sway = vector ? 0 : 2.5 * wave(p, 2, 0.1) * seg(p, 0.42, 0.5) * (1 - seg(p, 0.76, 0.82));
  const photoTop = PHOTO_IN + (PHOTO_OUT - PHOTO_IN) * rise;
  const breath = vector ? 1 : 1 + 0.01 * wave(p, 2);
  const sy = breath * (1 - 0.04 * anti + 0.03 * recoil);
  const sx = breath * (1 + 0.025 * anti - 0.02 * recoil);
  const tw = (k: number, ph: number) => (vector ? 1 : 0.8 + 0.2 * wave(p, k, ph));
  const done = vector ? 1 : yoyo(p, 0.56, 0.62, 0.8, 0.86, out, inOut);
  const COL = C.orange;
  const grey = shade(C.mist, -0.1);
  const dc = (c: string) => blend(grey, c, dev);
  const px = CX - PHOTO.w / 2;
  return (
    <g>
      <Shadow cx={CX} cy={BODY.y + BODY.h + 42} rx={360} ry={26} vector={vector} />
      {/* foto keluar dari celah atas (di belakang badan) */}
      <g transform={`rotate(${sway.toFixed(3)} ${CX} ${BODY.y})`}>
        <rect x={px + 10} y={photoTop + 8} width={PHOTO.w} height={PHOTO.h} rx={18} fill={shade(C.mist, -0.12)} />
        <rect x={px} y={photoTop} width={PHOTO.w} height={PHOTO.h} rx={18} fill={C.white} stroke={C.cloud} strokeWidth={6} />
        <rect x={px + 24} y={photoTop + 24} width={PHOTO.w - 48} height={220} rx={10} fill={dc(blend(C.sky, C.white, 0.35))} />
        <circle cx={px + 210} cy={photoTop + 80} r={28} fill={dc(C.yellow)} />
        <path
          d={`M${px + 24},${photoTop + 210} L${px + 100},${photoTop + 134} L${px + 150},${photoTop + 184} L${px + 194},${photoTop + 150} L${px + PHOTO.w - 24},${photoTop + 226} L${px + PHOTO.w - 24},${photoTop + 234} Q${px + PHOTO.w - 24},${photoTop + 244} ${px + PHOTO.w - 34},${photoTop + 244} L${px + 34},${photoTop + 244} Q${px + 24},${photoTop + 244} ${px + 24},${photoTop + 234} Z`}
          fill={dc(C.teal)}
        />
        <rect x={px + 24} y={photoTop + 268} width={150} height={16} rx={8} fill={C.cloud} />
      </g>
      <g transform={`translate(${CX} ${BODY.y + BODY.h}) scale(${sx.toFixed(4)} ${sy.toFixed(4)}) translate(${-CX} ${-(BODY.y + BODY.h)})`}>
        {/* tombol rana */}
        <rect x={1120} y={BODY.y - 46 + 18 * press} width={100} height={70} rx={20} fill={shade(C.coral, -0.12)} />
        <rect x={1120} y={BODY.y - 46 + 18 * press} width={100} height={34} rx={17} fill={C.coral} />
        {/* punuk blitz */}
        <rect x={650} y={BODY.y - 70} width={146} height={110} rx={28} fill={C.ink} />
        <rect x={670} y={BODY.y - 50} width={106} height={56} rx={16} fill={blend(C.cloud, C.yellow, Math.min(1, flashK * 1.5))} />
        <rect x={684} y={BODY.y - 40} width={34} height={12} rx={6} fill={C.white} />
        {/* badan */}
        <rect x={BODY.x} y={BODY.y + 18} width={BODY.w} height={BODY.h} rx={BODY.r} fill={shade(COL, -0.28)} />
        <rect x={BODY.x} y={BODY.y} width={BODY.w} height={BODY.h} rx={BODY.r} fill={COL} />
        <rect x={BODY.x} y={BODY.y + 150} width={BODY.w} height={150} fill={shade(COL, -0.12)} />
        <rect x={BODY.x} y={BODY.y} width={BODY.w} height={30} rx={15} fill={shade(COL, 0.18)} />
        <rect x={BODY.x + 40} y={BODY.y + 8} width={150} height={10} rx={5} fill={shade(COL, 0.5)} />
        {/* celah foto */}
        <rect x={CX - 172} y={BODY.y + 4} width={344} height={18} rx={9} fill={shade(COL, -0.42)} />
        {/* jendela bidik */}
        <rect x={1150} y={BODY.y + 60} width={92} height={62} rx={18} fill={C.navy} />
        <circle cx={1176} cy={BODY.y + 82} r={9} fill={shade(C.sky, 0.3)} />
        {/* lensa */}
        <g transform={`translate(${LC.x} ${LC.y})`}>
          <circle r={R_RIM} cy={12} fill={shade(C.navy, -0.2)} />
          <circle r={R_RIM} fill={C.cloud} />
          <circle r={R_RIM - 22} fill={C.navy} />
          <circle r={R_GLASS + 6} fill={shade(C.navy, -0.2)} />
          <g clipPath={vector ? undefined : 'url(#ui-camera-shutter-photo-clip)'}>
            {!vector ? (
              <clipPath id="ui-camera-shutter-photo-clip">
                <circle r={R_GLASS} />
              </clipPath>
            ) : null}
            <Iris a={a} twist={twist} />
          </g>
          <path d={`M${-R_RIM + 12},-30 A${R_RIM - 12},${R_RIM - 12} 0 0 1 -30,${-R_RIM + 12}`} fill="none" stroke={C.white} strokeWidth={12} strokeLinecap="round" />
        </g>
        {/* lampu kecil */}
        <circle cx={BODY.x + 70} cy={BODY.y + 92} r={18} fill={flashK > 0.05 ? C.yellow : C.green} />
      </g>
      {/* kilat blitz */}
      {flashK > 0.01 ? (
        <g opacity={flashK >= 1 ? undefined : Math.min(1, flashK * 1.4)}>
          <Sparkle x={723} y={BODY.y - 24} r={150 * out(clamp(flash * 2.5)) * (0.6 + 0.4 * flashK)} color={shade(C.yellow, 0.55)} rot={45 * flash} />
          <circle cx={723} cy={BODY.y - 24} r={46 * flashK} fill={C.white} />
        </g>
      ) : null}
      {/* sinar blitz */}
      {flashK > 0.01
        ? Array.from({length: 7}, (_, i) => {
            const ang = -Math.PI / 2 + (i - 3) * 0.32;
            const r0 = 110 + 90 * out(clamp(flash * 1.3));
            const len = 70 * flashK + 6;
            const cx = 723;
            const cy = BODY.y - 40;
            return (
              <line
                key={i}
                x1={cx + r0 * Math.cos(ang)}
                y1={cy + r0 * Math.sin(ang) * 0.8}
                x2={cx + (r0 + len) * Math.cos(ang)}
                y2={cy + (r0 + len) * Math.sin(ang) * 0.8}
                stroke={i % 2 ? C.yellow : shade(C.yellow, 0.4)}
                strokeWidth={12}
                strokeLinecap="round"
                opacity={flashK >= 1 ? undefined : Math.min(1, flashK * 1.6)}
              />
            );
          })
        : null}
      <Sparkle x={1250} y={170} r={26 * done * tw(4, 0)} color={C.yellow} rot={15} />
      <Sparkle x={1330} y={300} r={16 * done * tw(4, 0.5)} color={C.sky} />
      <Sparkle x={560} y={200} r={20 * done * tw(3, 0.2)} color={C.orange} rot={30} />
    </g>
  );
};
