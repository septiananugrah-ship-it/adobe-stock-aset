// Bola bumi berputar ke timur: dengan kutub utara di atas, permukaan bergerak dari kiri ke kanan
// (Afrika → Atlantik → Amerika → Pasifik → Asia). Sumbu miring 23,4°, proyeksi ortografis.
// Benua & awan dipotong tepat di cakrawala (bagian di balik bola diganti busur tepi piringan), jadi tidak ada
// serpihan/sliver di tepi. Daratan & awan dua nada mengikuti bayangan samudra. Satu putaran 360° per loop → mulus.
import React from 'react';
import {mod, TAU, wave, wave01} from '../../kit/loop';
import {C, shade} from '../../kit/palette';
import {Glow, Shadow, Sparkle} from '../../kit/shapes';
import type {DrawProps, Meta} from '../../kit/types';

export const meta: Meta = {
  id: 'nature-earth-globe-rotating',
  theme: 'nature',
  title: 'Planet Earth globe rotating eastward with continents and clouds, world icon seamless loop animation with alpha channel',
  keywords: [
    'earth', 'globe', 'planet', 'world', 'rotating', 'spinning', 'continents', 'world map', 'earth day', 'global',
    'geography', 'ocean', 'environment', 'ecology', 'save the planet', 'climate', 'sustainability', 'nature',
    'international', 'travel', 'globalization', 'green planet', 'blue planet', 'clouds', 'space', 'flat design',
    'illustration', 'icon', 'cartoon', 'animation', 'motion graphics', 'seamless loop', 'looped', 'alpha channel',
    'transparent background', 'isolated', '4k', 'explainer', 'presentation', 'infographic', 'social media',
  ],
  category: 5,
  seconds: 10,
  vectorP: 0.14,
};

type P2 = [number, number];
type V3 = [number, number, number];
const DEG = Math.PI / 180;
const G = {cx: 960, cy: 494, r: 300};
const LAT0 = 14 * DEG; // pusat pandang sedikit di utara khatulistiwa
const TILT = -23.4 * DEG; // kemiringan sumbu bumi di layar
const LON_START = 20; // p = 0: Afrika di tengah
const SL = Math.sin(LAT0);
const CL = Math.cos(LAT0);
const CT = Math.cos(TILT);
const ST = Math.sin(TILT);
// bagian terang samudra/daratan: lingkaran bergeser ke kiri atas, bersinggungan dari dalam dengan piringan
const OFF = 0.065 * G.r;
const LIT = {x: -OFF, y: -OFF, r: G.r - Math.hypot(OFF, OFF)};

// Garis pantai disederhanakan [bujur, lintang, ...]
const LAND: {pts: number[]; ice?: boolean}[] = [
  // Amerika Utara
  {pts: [-166,68.5,-156,71.3,-141,69.7,-128,70.2,-115,68.6,-104,68,-95,71.5,-86,69.5,-82,66.5,-86,64.5,-94,61,-94,58.5,-88,56.5,-82,55,-79,51.5,-78.5,56,-77,60.5,-73,62,-70,59,-64,60,-61,56,-56,52,-59,48,-64,48.5,-66,45,-70,43,-70,41.7,-74,40.5,-76,37,-75.6,35.2,-78,33.8,-81,31.5,-80.2,27,-80.3,25.3,-81.5,25.5,-82.6,27.5,-83,29.5,-85.5,30,-89,30.2,-91,29.3,-94,29.6,-97.2,27.7,-97.6,24,-97.6,22,-96,19,-94.5,18.2,-91.5,18.5,-90.5,20.8,-87,21.5,-87.6,18.5,-88.2,16,-85,15.9,-83.3,15,-83.6,11,-82,9,-79.5,9.5,-77.4,8.5,-78,7.2,-80.5,7.3,-83.5,8.4,-85.7,10,-87.5,13,-91,13.8,-94,16,-97,15.8,-101,17.3,-105.3,19.5,-105.6,22.5,-108.5,25.5,-112.5,29.5,-114.7,31.6,-114,30,-112.2,27,-110,24,-110.2,23,-112,24.7,-114,27.5,-115.5,29.5,-117.1,32.5,-118.5,34,-120.6,34.6,-122.5,37.5,-124,40.4,-124.2,43,-124,46.3,-124.7,48.4,-123,49,-127.5,50.8,-130.5,54.5,-134,58,-137.5,58.8,-141.5,60,-146,60.8,-150.5,61,-151.5,59.2,-154,58,-157,56.8,-162,55,-164.5,54.6,-160,56.5,-157.5,58.6,-162,59.8,-165,62,-164.5,63.2,-161,64.5,-166,65.3,-168,65.6]},
  {pts: [-80,63.5,-65,62,-62,66.6,-68,70,-77,72.7,-89,72,-84,69.5,-80.5,67]}, // Baffin
  {pts: [-118,69,-102,68.5,-101,70.5,-107,73,-117,72]}, // Victoria
  {pts: [-90,76.5,-78,76,-62,82,-75,83,-92,81]}, // Ellesmere
  {pts: [-84.9,21.9,-82,23.1,-80,23,-77,21.2,-74.2,20.2,-77.7,19.9,-80,21.8,-82.5,22.3]}, // Kuba
  {pts: [-73,78.5,-66,81,-45,82.5,-25,83,-18,81,-20,76,-22,72,-22,70.5,-27,68.3,-33,68,-40,65,-43,60,-48,61,-51,64,-54,67,-55,70.5,-58,75.5,-66,76.5], ice: true}, // Greenland
  // Amerika Selatan
  {pts: [-77.4,8.5,-75.5,10.5,-72,12,-71,11,-68,10.6,-64,10.6,-61,10.5,-60,8.5,-57,6,-52,5,-50,1.5,-48.5,-1,-44,-2.5,-40,-3,-37,-5,-35,-7.5,-35.5,-10,-38.5,-13,-39,-17.5,-40.5,-21,-42,-23,-45,-23.5,-48.5,-26,-48.7,-28.5,-51,-31,-53.5,-34,-56,-34.8,-57.5,-36.5,-57,-38.5,-62,-39,-62.5,-41,-65,-42,-64.5,-45,-67.5,-46.5,-66,-48,-69,-51,-68.5,-52.5,-71,-54,-74,-52.5,-75.5,-49,-74,-45,-73.5,-41,-73.5,-37,-71.5,-32,-71.5,-28,-70.5,-23,-70.3,-18.5,-75,-15.5,-77,-12,-79.5,-7.5,-81.2,-5.5,-80.3,-3.5,-80,-1,-80.4,0.5,-79,1.5,-78,3,-77.3,4,-77.4,6.5]},
  // Afrika
  {pts: [-17,21,-16,24,-13,27.6,-10,29.5,-9.7,32,-6.8,34,-5.9,35.8,-2,35.1,3,36.8,10,37.3,11,35,10,33.8,13,32.8,20,30.8,20,32.3,25,31.8,29,30.9,32.3,31.3,34.2,27.8,35.5,24,37.2,21,38.5,18,39.7,15.5,41.7,13.3,43.3,12.5,44,11,51,11.8,51.2,10.4,49,6.5,46,2.5,42,-1,40,-3.5,39,-7,39.5,-10,40.5,-15,37,-17.5,35.3,-21,35.5,-24,32.9,-26,32.5,-29,30,-31.3,27.5,-33.3,22,-34,18.5,-34.2,18.2,-31.6,16.5,-28.6,15.2,-26.7,14.5,-22.5,11.8,-18,11.8,-16,13.5,-12,13,-9,12.2,-6,12.3,-4.5,9.5,-2,9.3,0.5,9.8,3,8.5,4.5,6,4.3,4.5,6.3,2,6.3,-1,5,-4,5.2,-7.5,4.4,-9.3,5.5,-11.4,6.9,-13.2,8.8,-15,11,-16.8,12.4,-16.8,13.8,-17.5,14.7,-16.5,16,-16.3,19]},
  {pts: [49.3,-12,50.4,-15.5,49.7,-17.5,48.5,-20.5,47.1,-24.8,45.2,-25.5,43.6,-23.5,43.4,-21.5,44.4,-19.5,44,-17,46.3,-15.8,47.9,-14]}, // Madagaskar
  // Eurasia
  {pts: [-9,43,-8.9,38.7,-8.8,37,-6,36.2,-5.5,36,-2,36.7,0,38.7,0.5,40.5,3.2,41.9,3,43.3,4.5,43.5,6.5,43.1,8.5,44.3,10.2,43.9,12.5,41.8,15.6,40,16,38,17,39,18.5,40.2,16.2,41.3,14,42.5,12.3,44.5,12.5,45.5,13.7,45.7,15.2,44.2,19,42,19.4,40.3,21,38,23,36.5,24,38.2,23,40.2,26,40.8,28.9,41,26.4,40.1,26.2,39,27.3,37,28.5,36.7,31,36.8,34.6,36.8,36,36,35.9,34.3,35,32.8,34.3,31.3,32.6,30,34.9,29.5,36.5,27.5,39,22,41,18,43.2,13.5,45,12.8,48.5,14,52.2,15.6,55.4,17.8,57.8,19,59.8,22.4,58.5,23.6,56.4,24.9,56,26.2,54.6,24.3,51.6,24.2,51,26,50,26.5,48.5,28.5,48,30,50,30.2,51,28,54.6,26.7,57.3,25.8,61.5,25.2,66.5,25.4,67.5,23.8,70,21.5,72.8,21,72.8,19,73.5,16,74.8,12.8,76.3,9.5,77.5,8,78.2,8.9,79.8,10.4,80.2,13.5,80.3,15.8,82.2,16.6,84.5,19,87,21.5,89,21.8,90.5,22.6,91.8,22.4,92.3,20.7,94.4,17.5,94.3,16,97.6,16.5,98.5,13,98.7,10,98.3,8,100.3,6.4,100.3,4,101.3,2.8,103.5,1.3,104.2,1.4,103.4,4.5,103,5.5,101,6.8,100.3,8.5,99.2,9.2,99.9,12.5,100.9,13.5,102.6,12.2,104.8,10.4,105,8.6,106.5,9.6,109,11.5,109.3,13.5,108.3,16,106.6,17.5,106.3,20.2,108,21.5,109.8,21.4,110.4,20.3,111,21.6,113.5,22.2,116.5,22.9,119.5,25.5,120.5,27.5,121.9,30.8,120.8,32.5,119.2,34.5,120.5,36.2,122.5,37,121,37.8,118,38,117.6,38.8,119,39.3,121.5,40.9,122.2,40.5,121,38.9,124.3,39.9,125.3,37.7,126.5,34.5,129.4,35.2,129.5,37,128.3,38.6,127.5,39.8,129.7,40.9,129.7,42.2,133,42.8,135.5,43.9,138.2,46.6,140.4,48.7,141.4,52.2,140.5,53.4,137.5,54,135.2,54.7,138,56.4,142.2,59,145.5,59.3,149,59.6,152.4,59.1,154.2,59.4,156.7,61.5,160,61.8,163.4,62.5,162.1,59.9,156.7,57,155.9,52.5,156.6,51,158.5,52.9,160,54.3,163.3,56.1,162,58,163.3,59.6,170.3,60,173.7,61.7,179.2,62.3,179.4,64.7,178,64.5,180,65,180,68.9,170,70.1,161,69.5,152,70.9,143,72.7,135,71.6,129,72.4,127,73.5,122.5,73,113,73.7,110,76.7,104.3,77.7,100,76,95,76.1,88,75.2,85,74,80.5,73.6,86.8,70,80,67.6,75,67,72.4,66,73.5,69,73,71.4,69.3,72.9,66.7,69.2,60,68.4,55,68.5,53.7,66.8,48,67.5,44,67.5,44,66,40,64.6,38,64.3,36.5,64.8,34.9,66.6,33,66.6,34.6,64.5,37,63.8,37.2,65.2,41,66.5,40.3,67.9,37,69.3,33.8,69.3,29.4,70,25,70.9,19,70,14.6,68.5,12.5,66,10.7,64.5,8,63,5,62,5,59.2,6.5,58,8.5,58.1,10.5,59.2,11,58.8,12,58,12.5,56.5,13,55.4,14.2,55.4,16,56.2,16.5,57.5,18.5,59.5,17.8,61.2,17.4,62.5,19,63.6,22,65,25.3,65.1,25,64,21.5,62.6,21.4,60.9,22.9,59.8,26,60.4,29.5,60,28,59.4,23.7,59.2,23.4,58.5,24.5,57.5,21.7,57.5,21,56.8,21.2,55.2,19.9,54.9,18.6,54.7,17.6,54.8,15,54,12.5,54.4,11,54,10.9,54.4,9.9,55,10.3,56.9,8.5,57.2,8.1,56.1,8.7,54.7,8.8,53.7,7,53.4,4.8,52.8,3.6,51.6,1.6,50.9,1.4,50.2,0,49.6,-1.6,49.7,-1.4,48.6,-4.6,48.7,-4.2,47.8,-2.2,47.1,-1.2,46,-1.4,44,-1.8,43.4,-4.3,43.4,-8,43.7]},
  {pts: [-5.7,50,-3,50.6,1.4,51.2,1.7,52.7,0.2,53.4,-0.4,54.5,-1.6,55.6,-2,56.4,-1.9,57.6,-3.6,58.6,-5,58.6,-5.8,57.4,-5.6,56.3,-4.9,55.4,-3.1,54.9,-3.4,54.3,-2.8,53.4,-4.6,53.3,-4.3,52.3,-5.2,51.7,-3.4,51.4]}, // Britania
  {pts: [-6,52.1,-6.2,53.9,-5.6,54.6,-7.4,55.3,-8.5,54.5,-10,54,-9.6,52,-8,51.6]}, // Irlandia
  {pts: [-22.6,63.8,-14.5,64.3,-13.6,65.1,-16.2,66.5,-22.4,66.4,-24.3,65.5]}, // Islandia
  {pts: [52,71,56,70.6,60,74,69,76.8,64,77,56,74.5]}, // Novaya Zemlya
  {pts: [130.9,31.4,132,33.2,134.6,33.8,135.8,33.5,137,34.6,139,34.7,140.3,35.5,140.8,38,141.8,39.5,141.4,41.4,140,40.5,139.7,39,138.8,37.8,137,37,136,35.8,133,35.5,131,34.4,129.8,33.2]}, // Jepang
  {pts: [140,41.5,141.6,42.6,143.5,42,145.5,43.3,144.5,44,141.8,45.4,141.3,43.4,140,42.8]}, // Hokkaido
  {pts: [95.3,5.6,98,4,100.6,2,103.7,-1,106,-3,106,-5.9,104.6,-5.9,102.3,-4,100.3,-1,98.6,1.7]}, // Sumatra
  {pts: [109,1.5,110.5,-1.5,114,-4,116.2,-3.9,116.6,-1,118,1,119,5.2,117,7,115.4,5,113,3.1,111,2]}, // Kalimantan
  {pts: [105.3,-6.8,108,-6.3,111,-6.4,114.5,-7.7,114.5,-8.6,111,-8.2,106.5,-7.4]}, // Jawa
  {pts: [119.3,-5.5,120.4,-5.6,120.8,-2.6,123.3,-0.9,125,1.5,121,1.2,119.8,0.2,118.8,-2.8]}, // Sulawesi
  {pts: [131,-1.5,134.2,-0.9,138,-1.6,141,-2.6,145,-4.3,147.5,-6,150.7,-10.5,147,-10,144.5,-7.5,142.9,-9.3,141,-9.1,138,-8.4,137.6,-5.5,134,-3.9,132.4,-2.9]}, // Papua
  {pts: [120.6,18.5,122.2,18.5,122,16.3,123.6,13.9,124.1,12.5,120.6,13.9]}, // Luzon
  {pts: [122,7,124,6,126,6.3,126.5,7.5,126,9.3,124,8.2]}, // Mindanao
  // Australia
  {pts: [113.6,-22,114.2,-26.3,115,-29.5,115.7,-33.3,115,-34.3,118,-35,121.4,-33.9,124,-33,126,-32.3,129,-31.7,131.3,-31.5,134.2,-32.7,135.6,-34.8,137.6,-33.1,137.8,-35.4,139.6,-36.1,140.6,-38,143.6,-38.8,146.3,-39,148,-37.8,150,-37.5,150.7,-35,151.3,-33.6,153,-31,153.6,-28.2,153,-25.3,150.8,-22.6,149.4,-21,146.4,-19,145.4,-16.4,145.3,-14.9,143.5,-12.8,142.5,-10.7,141.6,-12.9,141.7,-15,140.6,-17.5,139.3,-17.4,137.8,-15.9,135.9,-15,136.9,-12.3,135.9,-11.9,132.6,-11.5,131.8,-12.3,130.1,-13,129.4,-15,127.8,-14.3,125.7,-14.4,124.3,-16.3,122.2,-17.9,121.1,-19.5,118.9,-20.3,116.7,-20.6,114.6,-21.8]},
  {pts: [144.7,-40.7,148.3,-40.9,148,-43.2,146,-43.6]}, // Tasmania
  {pts: [172.7,-34.4,174.6,-36.2,175.9,-37.5,178.5,-37.7,177,-39.3,176,-41.3,174.6,-41.3,175.2,-40.4,173.8,-39.2,174.6,-38.2]}, // Selandia Baru utara
  {pts: [172.7,-40.5,174.3,-41.6,173,-43.8,171,-45,169.3,-46.6,166.5,-46,168.3,-44.1,170.6,-42.8]}, // Selandia Baru selatan
];

// densifikasi: titik tiap ≤ 1.5° agar tepi halus
const densify = (pts: number[]) => {
  const out: P2[] = [];
  const n = pts.length / 2;
  for (let i = 0; i < n; i++) {
    const a = [pts[2 * i], pts[2 * i + 1]];
    const b = [pts[2 * ((i + 1) % n)], pts[2 * ((i + 1) % n) + 1]];
    const d = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]));
    const k = Math.max(1, Math.ceil(d / 1.5));
    for (let j = 0; j < k; j++) out.push([a[0] + ((b[0] - a[0]) * j) / k, a[1] + ((b[1] - a[1]) * j) / k]);
  }
  return out;
};
const DENSE = LAND.map(({pts, ice}) => ({ring: densify(pts), ice}));

// ---- proyeksi & pemotongan ----
const toView = (lon: number, lat: number, lon0: number): V3 => {
  const l = (lon - lon0) * DEG;
  const f = lat * DEG;
  const X = Math.cos(f) * Math.sin(l);
  const Y = Math.sin(f);
  const Z = Math.cos(f) * Math.cos(l);
  return [X, CL * Y - SL * Z, SL * Y + CL * Z]; // x kanan, y atas, z ke arah penonton
};
/** koordinat pandang (cakram satuan) → layar relatif pusat bola (px), sudah dimiringkan */
const scr = (x: number, y: number): P2 => {
  const X = G.r * x;
  const Y = -G.r * y;
  return [X * CT - Y * ST, X * ST + Y * CT];
};
const limb = (a: number) => scr(Math.cos(a), Math.sin(a));

type Chain = {pts: P2[]; a0: number; a1: number};
/** luas bertanda (rumus tali sepatu); tandanya = arah putar cincin */
const area = (pts: P2[]) => pts.reduce((s, [x, y], i) => {
  const [x2, y2] = pts[(i + 1) % pts.length];
  return s + x * y2 - x2 * y;
}, 0);
/**
 * Sambung rantai yang terpotong lingkaran dengan busur lingkaran. Arah busur = arah putar poligon
 * (bagian dalam irisan tetap di sisi yang sama), lalu dari tiap titik keluar menuju titik masuk terdekat.
 */
const stitch = (chains: Chain[], arcPt: (a: number) => P2, dir: number) => {
  const nextEntry = (a: number) => {
    let best = 0;
    let bd = Infinity;
    chains.forEach((c, i) => {
      const d = dir > 0 ? mod(c.a0 - a, TAU) : mod(a - c.a0, TAU);
      if (d < bd) {
        bd = d;
        best = i;
      }
    });
    return {i: best, d: bd};
  };
  const used = new Set<number>();
  const rings: P2[][] = [];
  for (let s = 0; s < chains.length; s++) {
    if (used.has(s)) continue;
    const ring: P2[] = [];
    let c = s;
    for (let guard = 0; guard <= chains.length; guard++) {
      used.add(c);
      ring.push(...chains[c].pts);
      const {i: nx, d} = nextEntry(chains[c].a1);
      const k = Math.max(1, Math.ceil(d / (2 * DEG)));
      for (let m = 1; m < k; m++) ring.push(arcPt(chains[c].a1 + (dir * d * m) / k));
      if (nx === s || used.has(nx)) break;
      c = nx;
    }
    rings.push(ring);
  }
  return rings;
};

/** Potong cincin bujur/lintang ke belahan yang tampak; bagian di belakang diganti busur tepi piringan. */
const clipHemi = (ring: P2[], lon0: number): P2[][] => {
  const n = ring.length;
  const v = ring.map(([lo, la]) => toView(lo, la, lon0));
  const vis = v.map((q) => q[2] > 0);
  const nVis = vis.filter(Boolean).length;
  if (nVis === 0) return [];
  if (nVis === n) return [v.map((q) => scr(q[0], q[1]))];
  const cross = (a: V3, b: V3) => {
    const t = a[2] / (a[2] - b[2]);
    return Math.atan2(a[1] + (b[1] - a[1]) * t, a[0] + (b[0] - a[0]) * t);
  };
  const s = vis.findIndex((b, i) => b && !vis[(i - 1 + n) % n]);
  const chains: Chain[] = [];
  let cur: P2[] = [];
  let a0 = 0;
  for (let k = 0; k < n; k++) {
    const i = (s + k) % n;
    if (!vis[i]) continue;
    const h = (i - 1 + n) % n;
    const j = (i + 1) % n;
    if (!vis[h]) {
      a0 = cross(v[h], v[i]);
      cur = [limb(a0)];
    }
    cur.push(scr(v[i][0], v[i][1]));
    if (!vis[j]) {
      const a1 = cross(v[i], v[j]);
      cur.push(limb(a1));
      chains.push({pts: cur, a0, a1});
    }
  }
  // proyeksi sisi depan mempertahankan arah putar bujur/lintang (timur = kanan, utara = atas)
  return stitch(chains, limb, Math.sign(area(ring)));
};

/** Irisan poligon layar dengan lingkaran (cx, cy, r). */
const clipCircle = (poly: P2[], cx: number, cy: number, r: number): P2[][] => {
  const n = poly.length;
  const dir = Math.sign(area(poly));
  if (Math.abs(area(poly)) < 4) return []; // serpihan sub-piksel: abaikan
  const ins = poly.map(([x, y]) => Math.hypot(x - cx, y - cy) < r);
  const nIn = ins.filter(Boolean).length;
  if (nIn === n) return [poly];
  if (nIn === 0) return [];
  const arc = (a: number): P2 => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  const cross = (a: P2, b: P2) => {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const fx = a[0] - cx;
    const fy = a[1] - cy;
    const A = dx * dx + dy * dy;
    const B = 2 * (fx * dx + fy * dy);
    const Cc = fx * fx + fy * fy - r * r;
    const disc = Math.sqrt(Math.max(0, B * B - 4 * A * Cc));
    let t = (-B - disc) / (2 * A);
    if (t < 0 || t > 1) t = (-B + disc) / (2 * A);
    t = Math.min(1, Math.max(0, t));
    return Math.atan2(a[1] + dy * t - cy, a[0] + dx * t - cx);
  };
  const s = ins.findIndex((b, i) => b && !ins[(i - 1 + n) % n]);
  const chains: Chain[] = [];
  let cur: P2[] = [];
  let a0 = 0;
  for (let k = 0; k < n; k++) {
    const i = (s + k) % n;
    if (!ins[i]) continue;
    const h = (i - 1 + n) % n;
    const j = (i + 1) % n;
    if (!ins[h]) {
      a0 = cross(poly[h], poly[i]);
      cur = [arc(a0)];
    }
    cur.push(poly[i]);
    if (!ins[j]) {
      const a1 = cross(poly[i], poly[j]);
      cur.push(arc(a1));
      chains.push({pts: cur, a0, a1});
    }
  }
  return stitch(chains, arc, dir);
};

const pathOf = (rings: P2[][]) =>
  rings
    .filter((r) => r.length > 2)
    .map((r) => `M${r.map(([x, y]) => `${(G.cx + x).toFixed(1)},${(G.cy + y).toFixed(1)}`).join(' L')} Z`)
    .join(' ');

// ---- awan di permukaan (bujur/lintang), digambar dari bentuk datar lokal (derajat) ----
type Prim = {x: number; y: number; r: number; w?: number};
const CLOUD: Prim[] = [
  {x: 0, y: -0.6, r: 2.9, w: 22.3}, // alas kapsul (w = lebar total)
  {x: -3.85, y: 1.15, r: 4.6},
  {x: 3.1, y: 2.7, r: 5.8},
];
const primRing = (lonC: number, latC: number, s: number, q: Prim, dy = 0): P2[] => {
  const pts: P2[] = [];
  const k = 1 / Math.cos(latC * DEG);
  const put = (x: number, y: number) => pts.push([lonC + x * s * k, latC + (y + dy) * s]);
  if (q.w) {
    const hw = q.w / 2 - q.r;
    for (let i = 0; i <= 14; i++) {
      const a = -Math.PI / 2 + (Math.PI * i) / 14;
      put(q.x + hw + q.r * Math.cos(a), q.y + q.r * Math.sin(a));
    }
    for (let i = 0; i <= 14; i++) {
      const a = Math.PI / 2 + (Math.PI * i) / 14;
      put(q.x - hw + q.r * Math.cos(a), q.y + q.r * Math.sin(a));
    }
  } else {
    for (let i = 0; i < 30; i++) {
      const a = (TAU * i) / 30;
      put(q.x + q.r * Math.cos(a), q.y + q.r * Math.sin(a));
    }
  }
  return pts;
};
const CLOUDS = [
  {lon: -40, lat: 36, s: 1},
  {lon: -14, lat: -24, s: 0.85},
  {lon: -118, lat: 10, s: 0.9},
  {lon: -165, lat: -24, s: 0.95},
  {lon: 148, lat: 30, s: 0.95},
  {lon: 78, lat: -14, s: 0.9},
];

/** Gambar daftar cincin layar dua nada: seluruhnya warna bayangan, bagian terang ditimpa warna dasar. */
const TwoTone: React.FC<{rings: P2[][]; base: string; dark: string}> = (props) => {
  const {base, dark} = props;
  let {rings} = props;
  rings = rings.filter((r) => Math.abs(area(r)) >= 4);
  if (!rings.length) return null;
  const lit = rings.flatMap((r) => clipCircle(r, LIT.x, LIT.y, LIT.r));
  return (
    <g>
      <path d={pathOf(rings)} fill={dark} />
      {lit.length ? <path d={pathOf(lit)} fill={base} /> : null}
    </g>
  );
};

export const Draw: React.FC<DrawProps> = ({p, vector}) => {
  const lon0 = LON_START - 360 * p; // bujur pusat pandang berkurang → permukaan bergerak ke timur (kanan)
  const land = DENSE.map(({ring, ice}, i) => (
    <TwoTone key={i} rings={clipHemi(ring, lon0)} base={ice ? C.white : C.green} dark={ice ? C.cloud : shade(C.green, -0.16)} />
  ));
  const clouds = CLOUDS.map((c, i) => {
    // pose vektor: hanya awan yang utuh (tidak terpotong cakrawala)
    if (vector && toView(c.lon, c.lat, lon0)[2] < 0.5) return null;
    const under = CLOUD.flatMap((q) => clipHemi(primRing(c.lon, c.lat, c.s, q, -1.3), lon0));
    const top = CLOUD.flatMap((q) => clipHemi(primRing(c.lon, c.lat, c.s, q), lon0));
    return (
      <g key={i}>
        <path d={pathOf(under.filter((r) => Math.abs(area(r)) >= 4))} fill={C.mist} />
        <TwoTone rings={top} base={C.white} dark={C.cloud} />
      </g>
    );
  });
  const R = G.r;
  return (
    <g>
      <Shadow cx={G.cx} cy={880} rx={230} ry={26} vector={vector} />
      <Glow cx={G.cx} cy={G.cy} r={R * 1.3} color={C.sky} strength={0.35 + 0.15 * wave(p, 2)} vector={vector} />
      {/* atmosfer */}
      <circle cx={G.cx} cy={G.cy} r={R + 20} fill={shade(C.sky, 0.45)} />
      {/* samudra: bayangan sabit di kanan bawah */}
      <circle cx={G.cx} cy={G.cy} r={R} fill={shade(C.blue, -0.16)} />
      <circle cx={G.cx + LIT.x} cy={G.cy + LIT.y} r={LIT.r} fill={C.blue} />
      {land}
      {clouds}
      {/* kilau kaca */}
      <path d={`M${G.cx - R * 0.8},${G.cy - R * 0.2} A${R * 0.83},${R * 0.83} 0 0 1 ${G.cx - R * 0.32},${G.cy - R * 0.76}`} fill="none" stroke={shade(C.sky, 0.62)} strokeWidth={14} strokeLinecap="round" />
      <circle cx={G.cx - R * 0.17} cy={G.cy - R * 0.84} r={8} fill={shade(C.sky, 0.62)} />
      {/* kilau sekitar */}
      {[
        {x: G.cx + R + 92, y: G.cy - R + 34, r: 28, c: C.yellow, ph: 0},
        {x: G.cx - R - 84, y: G.cy + 126, r: 20, c: C.sky, ph: 0.33},
        {x: G.cx + R + 46, y: G.cy + R - 56, r: 16, c: C.yellow, ph: 0.66},
      ].map((s, i) => (
        <Sparkle key={i} x={s.x} y={s.y} r={s.r * (vector ? 1 : 0.55 + 0.45 * wave01(p, 3, s.ph))} color={s.c} rot={20 * Math.sin(TAU * (p + s.ph))} />
      ))}
    </g>
  );
};
