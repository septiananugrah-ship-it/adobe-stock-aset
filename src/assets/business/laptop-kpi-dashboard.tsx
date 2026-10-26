// Laptop dengan dasbor KPI: cincin progres terisi, batang mini tumbuh bertingkat, bilah progres memanjang,
// garis tren tergambar dengan area di bawahnya, lalu kartu notifikasi centang muncul; semuanya surut kembali.
import React from 'react';
import {clamp, inOut, out, outBack, seg, wave, wave01, yoyo} from '../../kit/loop';
import {C, blend, shade} from '../../kit/palette';
import {Shadow, Sparkle, arcPath} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'business-laptop-kpi-dashboard',
  theme: 'business',
  title: 'Laptop with animated KPI dashboard, progress ring, bar chart and trend line filling up, seamless loop animation with alpha channel',
  keywords: [
    'dashboard', 'kpi', 'laptop', 'analytics', 'business analytics', 'data', 'progress', 'performance', 'report', 'statistics',
    'chart', 'graph', 'bar chart', 'line chart', 'progress ring', 'metrics', 'growth', 'trend', 'marketing', 'finance',
    'computer', 'web app', 'admin panel', 'software', 'saas', 'monitoring', 'success', 'notification', 'infographic',
    'flat design', 'icon', 'illustration', 'presentation', 'explainer', 'social media', 'animation', 'motion graphics',
    'seamless loop', 'looped', 'alpha channel', 'transparent background', 'isolated', '4k', 'technology',
  ],
  category: 3,
  seconds: 8,
  vectorP: 0.6,
};

// Geometri (desain 1920×1080)
const LID = {x: 556, y: 214, w: 808, h: 520, r: 30};
const SCR = {x: LID.x + 24, y: LID.y + 26, w: LID.w - 48, h: LID.h - 52};
const SIDE_W = 70;
const CX0 = SCR.x + SIDE_W + 22; // awal area konten
const CX1 = SCR.x + SCR.w - 20;
const ROW1 = {y: SCR.y + 62, h: 170};
const ROW2 = {y: ROW1.y + ROW1.h + 18, h: SCR.y + SCR.h - 18 - (ROW1.y + ROW1.h + 18)};
const GAP = 18;
const CW = (CX1 - CX0 - 2 * GAP) / 3;
const card = (i: number) => ({x: CX0 + i * (CW + GAP), y: ROW1.y, w: CW, h: ROW1.h});
const BARS = [0.42, 0.66, 0.5, 0.82, 0.96];
const LINE = [0.18, 0.3, 0.26, 0.46, 0.4, 0.62, 0.58, 0.86];
const RING = 0.78;

/** Bagian polyline sepanjang fraksi f (0..1) dari panjang total. */
const partial = (pts: [number, number][], f: number) => {
  const L = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]));
  const total = L.reduce((a, b) => a + b, 0);
  let left = total * clamp(f);
  const res: [number, number][] = [pts[0]];
  for (let i = 0; i < L.length; i++) {
    if (left >= L[i]) {
      res.push(pts[i + 1]);
      left -= L[i];
    } else {
      const t = left / L[i];
      if (t > 0) res.push([pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t]);
      break;
    }
  }
  return res;
};

const UpBadge: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) =>
  s > 0.01 ? (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-22} y={-14} width={44} height={28} rx={14} fill={blend(C.green, C.white, 0.78)} />
      <path d="M-9,5 L0,-5 L9,5" fill="none" stroke={shade(C.green, -0.12)} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ) : null;

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  const hold = seg(p, 0.46, 0.52) * (1 - seg(p, 0.74, 0.78));
  const ringK = yoyo(p, 0.04, 0.28, 0.8, 0.9, out, inOut) * RING;
  const barK = BARS.map((_, i) => yoyo(p, 0.08 + i * 0.03, 0.21 + i * 0.03, 0.79 + i * 0.012, 0.88 + i * 0.012, (t) => outBack(t, 1.5), inOut));
  const progK = [0, 1, 2].map((i) => yoyo(p, 0.12 + i * 0.04, 0.29 + i * 0.04, 0.8 + i * 0.01, 0.89 + i * 0.01));
  const draw = yoyo(p, 0.2, 0.46, 0.77, 0.88, inOut, inOut);
  const notif = yoyo(p, 0.46, 0.54, 0.74, 0.8, (t) => outBack(t, 1.8), inOut);
  const check = seg(p, 0.5, 0.58, out) * (1 - seg(p, 0.74, 0.77));
  const chev = yoyo(p, 0.28, 0.34, 0.8, 0.85, (t) => outBack(t, 2.4));
  const badges = [0, 1, 2].map((i) => yoyo(p, 0.32 + i * 0.04, 0.38 + i * 0.04, 0.8, 0.85, (t) => outBack(t, 2.2)));
  const glare = p % 1;
  const bob = wave(p, 2);

  const c1 = card(0);
  const c2 = card(1);
  const c3 = card(2);
  // grafik garis (kartu bawah)
  const PL = {x: CX0 + 30, y: ROW2.y + 54, w: CX1 - CX0 - 60, h: ROW2.h - 78};
  const linePts = LINE.map((v, i) => [PL.x + (PL.w * i) / (LINE.length - 1), PL.y + PL.h - v * PL.h] as [number, number]);
  const shown = partial(linePts, draw);
  const last = shown[shown.length - 1];
  const lineD = shown.map((q, i) => `${i ? 'L' : 'M'}${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(' ');
  const areaD = `${lineD} L${last[0].toFixed(1)},${PL.y + PL.h} L${PL.x},${PL.y + PL.h} Z`;
  const ringCx = c1.x + c1.w / 2;
  const ringCy = c1.y + c1.h / 2 + 8;
  const ringR = 52;

  return (
    <g>
      <Shadow cx={960} cy={806} rx={540} ry={30} vector={vector} />
      {/* layar (tutup laptop) */}
      <rect x={LID.x} y={LID.y} width={LID.w} height={LID.h} rx={LID.r} fill={C.navy} />
      <rect x={LID.x + 8} y={LID.y + 8} width={LID.w - 16} height={8} rx={4} fill={shade(C.navy, 0.14)} />
      <circle cx={960} cy={LID.y + 13} r={5} fill={shade(C.navy, 0.3)} />
      <rect x={SCR.x} y={SCR.y} width={SCR.w} height={SCR.h} rx={12} fill={C.cloud} />
      {/* bilah samping */}
      <rect x={SCR.x} y={SCR.y} width={SIDE_W} height={SCR.h} rx={12} fill={C.ink} />
      <rect x={SCR.x + SIDE_W - 20} y={SCR.y} width={20} height={SCR.h} fill={C.ink} />
      <circle cx={SCR.x + SIDE_W / 2} cy={SCR.y + 34} r={14} fill={C.teal} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={SCR.x + SIDE_W / 2 - 13} y={SCR.y + 84 + i * 52} width={26} height={26} rx={8} fill={i === 0 ? C.blue : shade(C.ink, 0.22)} />
      ))}
      {/* bilah atas */}
      <rect x={CX0} y={SCR.y + 18} width={210} height={26} rx={13} fill={C.white} />
      <circle cx={CX0 + 18} cy={SCR.y + 31} r={6} fill={C.mist} />
      <rect x={CX1 - 110} y={SCR.y + 24} width={56} height={14} rx={7} fill={C.mist} />
      <circle cx={CX1 - 18} cy={SCR.y + 31} r={15} fill={C.orange} />
      <circle cx={CX1 - 18} cy={SCR.y + 27} r={6} fill={shade(C.orange, 0.5)} />

      {/* kartu 1: cincin progres */}
      <rect x={c1.x} y={c1.y} width={c1.w} height={c1.h} rx={16} fill={C.white} />
      <path d={arcPath(ringCx, ringCy, ringR, 0, Math.PI * 2 - 0.0001)} fill="none" stroke={C.cloud} strokeWidth={16} />
      {ringK > 0.004 ? (
        <path d={arcPath(ringCx, ringCy, ringR, 0, Math.PI * 2 * ringK)} fill="none" stroke={C.teal} strokeWidth={16} strokeLinecap="round" />
      ) : null}
      {chev > 0.01 ? (
        <g transform={`translate(${ringCx} ${ringCy}) scale(${chev})`}>
          <path d="M-16,8 L0,-9 L16,8" fill="none" stroke={C.teal} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ) : null}
      <rect x={c1.x + 18} y={c1.y + 16} width={54} height={10} rx={5} fill={C.mist} />

      {/* kartu 2: batang mini */}
      <rect x={c2.x} y={c2.y} width={c2.w} height={c2.h} rx={16} fill={C.white} />
      <rect x={c2.x + 18} y={c2.y + 16} width={64} height={10} rx={5} fill={C.mist} />
      <UpBadge x={c2.x + c2.w - 36} y={c2.y + 22} s={badges[0]} />
      {BARS.map((v, i) => {
        const bw = 22;
        const slot = (c2.w - 40) / BARS.length;
        const x = c2.x + 20 + slot * (i + 0.5) - bw / 2;
        const base = c2.y + c2.h - 20;
        const h = Math.max(0, v * 100 * barK[i] * (1 + 0.03 * hold * wave(p, 3, i * 0.17)));
        const col = i === BARS.length - 1 ? C.purple : C.violet;
        return (
          <g key={i}>
            <rect x={x} y={base - 100} width={bw} height={100} rx={8} fill={C.cloud} />
            {h > 1 ? <rect x={x} y={base - h} width={bw} height={h} rx={Math.min(8, h / 2)} fill={col} /> : null}
            {h > 18 ? <rect x={x + 5} y={base - h + 6} width={5} height={h - 14} rx={2.5} fill={shade(col, 0.4)} /> : null}
          </g>
        );
      })}

      {/* kartu 3: bilah progres */}
      <rect x={c3.x} y={c3.y} width={c3.w} height={c3.h} rx={16} fill={C.white} />
      {[C.yellow, C.pink, C.blue].map((col, i) => {
        const y = c3.y + 36 + i * 46;
        const tw = c3.w - 86;
        const vals = [0.82, 0.6, 0.72];
        const w = tw * vals[i] * progK[i];
        return (
          <g key={i}>
            <circle cx={c3.x + 32} cy={y + 8} r={14} fill={blend(col, C.white, 0.7)} />
            <circle cx={c3.x + 32} cy={y + 8} r={6} fill={col} />
            <rect x={c3.x + 56} y={y} width={tw} height={16} rx={8} fill={C.cloud} />
            {w > 2 ? <rect x={c3.x + 56} y={y} width={Math.max(16, w)} height={16} rx={8} fill={col} /> : null}
          </g>
        );
      })}

      {/* kartu bawah: garis tren */}
      <rect x={CX0} y={ROW2.y} width={CX1 - CX0} height={ROW2.h} rx={16} fill={C.white} />
      <rect x={CX0 + 22} y={ROW2.y + 18} width={90} height={10} rx={5} fill={C.mist} />
      <rect x={CX0 + 124} y={ROW2.y + 18} width={46} height={10} rx={5} fill={C.cloud} />
      <UpBadge x={CX1 - 40} y={ROW2.y + 24} s={badges[2]} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={PL.x} y={PL.y + (PL.h * i) / 2 - 1} width={PL.w} height={3} rx={1.5} fill={C.cloud} />
      ))}
      {draw > 0.002 ? (
        <>
          <path d={areaD} fill={blend(C.blue, C.white, 0.84)} />
          <path d={lineD} fill="none" stroke={C.blue} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : null}
      {linePts.map((q, i) => {
        const reach = i / (linePts.length - 1);
        const s = draw <= 0.002 ? 0 : outBack(clamp((draw - reach) / 0.08 + 1), 2.2);
        if (s <= 0.01 || i === 0) return null;
        const pulse = i === linePts.length - 1 ? 1 + 0.16 * hold * wave01(p, 4) : 1;
        return (
          <g key={i} transform={`translate(${q[0]} ${q[1]}) scale(${s * pulse})`}>
            <circle r={i === linePts.length - 1 ? 15 : 11} fill={C.blue} />
            <circle r={i === linePts.length - 1 ? 7 : 5} fill={C.white} />
          </g>
        );
      })}

      {/* kilau kaca menyapu layar (motion saja) */}
      {!vector ? (
        <g opacity={0.12 * Math.sin(Math.PI * glare)} clipPath="url(#business-laptop-kpi-dashboard-clip)">
          <clipPath id="business-laptop-kpi-dashboard-clip">
            <rect x={SCR.x} y={SCR.y} width={SCR.w} height={SCR.h} rx={12} />
          </clipPath>
          <path d={`M${SCR.x + SCR.w * (glare * 1.4 - 0.3)},${SCR.y} l110,0 l-170,${SCR.h} l-110,0 Z`} fill={C.white} />
        </g>
      ) : null}

      {/* alas & papan ketik (tampak depan) */}
      <path d={`M${LID.x - 70},${LID.y + LID.h + 4} L${LID.x + LID.w + 70},${LID.y + LID.h + 4} L${LID.x + LID.w + 110},${LID.y + LID.h + 46} L${LID.x - 110},${LID.y + LID.h + 46} Z`} fill={C.mist} />
      <rect x={LID.x - 112} y={LID.y + LID.h + 40} width={LID.w + 224} height={30} rx={15} fill={C.cloud} />
      <rect x={LID.x - 112} y={LID.y + LID.h + 56} width={LID.w + 224} height={14} rx={7} fill={shade(C.cloud, -0.14)} />
      <rect x={960 - 80} y={LID.y + LID.h + 40} width={160} height={12} rx={6} fill={shade(C.mist, -0.12)} />
      <rect x={LID.x - 40} y={LID.y + LID.h + 8} width={LID.w + 80} height={6} rx={3} fill={shade(C.mist, 0.3)} />

      {/* kartu notifikasi melayang (kanan) */}
      {notif > 0.01 ? (
        <g transform={`translate(${LID.x + LID.w + 66} ${LID.y + 70 + 6 * bob}) scale(${notif}) translate(-20 0)`}>
          <rect x={-6} y={8} width={210} height={86} rx={22} fill={shade(C.mist, -0.1)} />
          <rect x={-13} y={-3} width={216} height={92} rx={25} fill={C.mist} />
          <rect x={-10} y={0} width={210} height={86} rx={22} fill={C.white} />
          <circle cx={34} cy={43} r={26} fill={C.green} />
          <path
            d="M21,44 L31,54 L48,34"
            fill="none"
            stroke={C.white}
            strokeWidth={8}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={`${(40 * check).toFixed(1)} 60`}
          />
          <rect x={72} y={28} width={104} height={12} rx={6} fill={C.mist} />
          <rect x={72} y={50} width={70} height={12} rx={6} fill={C.cloud} />
        </g>
      ) : null}

      {/* ikon tren melayang (kiri) */}
      <g transform={`translate(${LID.x - 120} ${LID.y + 150 - 8 * bob}) rotate(${-8 + 3 * wave(p, 1, 0.25)})`}>
        <rect x={-50} y={-50} width={100} height={100} rx={26} fill={shade(C.blue, -0.18)} transform="translate(5 7)" />
        <rect x={-50} y={-50} width={100} height={100} rx={26} fill={C.blue} />
        <path d="M-26,20 L-6,-2 L6,10 L26,-14" fill="none" stroke={C.white} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8,-16 L28,-16 L28,4" fill="none" stroke={C.white} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* kilau */}
      <Sparkle x={LID.x + LID.w + 250} y={LID.y + 30} r={18 * notif * (0.8 + 0.2 * wave(p, 4))} color={C.yellow} rot={15} />
      <Sparkle x={LID.x + LID.w + 30} y={LID.y + 214} r={12 * notif * (0.75 + 0.25 * wave(p, 4, 0.5))} color={C.teal} />
      <Sparkle x={LID.x - 150} y={LID.y + 320} r={14 * (0.7 + 0.3 * wave01(p, 2))} color={C.yellow} rot={10} />
    </g>
  );
};
