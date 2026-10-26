// Palet utama (datar, cerah, kontras cukup di atas latar terang maupun gelap).
// Satu aset sebaiknya memakai 3–5 warna aksen + netral. Bayangan pakai shade(), jangan hitam murni.
export const C = {
  navy: '#1F2A44',
  ink: '#2B3A55',
  slate: '#5B6B86',
  steel: '#8C9AB3',
  mist: '#C9D3E3',
  cloud: '#E8EDF5',
  white: '#FFFFFF',
  blue: '#3E7BFA',
  sky: '#5CC8F0',
  teal: '#22C3A6',
  green: '#3DD68C',
  lime: '#B6E35A',
  yellow: '#FFC93C',
  orange: '#FF8A3D',
  coral: '#FF6B6B',
  pink: '#FF5C8A',
  purple: '#8C6CFF',
  violet: '#B48CFF',
  brown: '#B77A4A',
  sand: '#F3D9B1',
} as const;

const toRgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const toHex = (c: number[]) => '#' + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('').toUpperCase();

/** Gelapkan (amt < 0) atau terangkan (amt > 0) warna, −1..1. Hasil tetap opak (aman untuk vektor). */
export const shade = (hex: string, amt: number) => {
  const c = toRgb(hex);
  return toHex(c.map((v) => (amt > 0 ? v + (255 - v) * amt : v * (1 + amt))));
};

/** Campur dua warna (t = 0 → a, 1 → b). */
export const blend = (a: string, b: string, t: number) => {
  const x = toRgb(a);
  const y = toRgb(b);
  return toHex(x.map((v, i) => v + (y[i] - v) * t));
};
