// Waktu loop: p = frame / durasi (0..1). Semua gerak harus periodik terhadap p,
// atau naik lalu turun kembali (bolak-balik), sehingga frame terakhir menyambung ke frame pertama.

export const TAU = Math.PI * 2;
export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// Kurva easing
export const linear = (t: number) => t;
export const inOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const inOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
export const out = (t: number) => 1 - Math.pow(1 - t, 3);
export const outBack = (t: number, s = 1.70158) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);
export const outElastic = (t: number) =>
  t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;

/** 0→1 antara a dan b (bagian dari loop), dengan easing. */
export const seg = (p: number, a: number, b: number, ease: (t: number) => number = inOut) => ease(clamp((p - a) / (b - a)));

/**
 * Bolak-balik: 0 → 1 pada [a,b], tahan, lalu 1 → 0 pada [c,d]. Di luar itu 0.
 * Dipakai untuk "tumbuh lalu kembali" agar loop mulus.
 */
export const yoyo = (p: number, a: number, b: number, c: number, d: number, easeIn = inOut, easeOut = inOut) =>
  p < c ? seg(p, a, b, easeIn) : 1 - seg(p, c, d, easeOut);

/** Gelombang sinus periodik: k siklus per loop (bilangan bulat!). */
export const wave = (p: number, k = 1, phase = 0) => Math.sin(TAU * (k * p + phase));

/** Gelombang 0..1 (bukan −1..1). */
export const wave01 = (p: number, k = 1, phase = 0) => 0.5 + 0.5 * wave(p, k, phase);

/** Sisa bagi positif. */
export const mod = (a: number, m: number) => ((a % m) + m) % m;

/** Generator acak deterministik (mulberry32). */
export const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Pantulan kecil (squash) saat mendarat: 1 di luar jendela. */
export const pop = (p: number, at: number, dur = 0.08, amt = 0.12) => {
  const t = (p - at) / dur;
  return t < 0 || t > 1 ? 1 : 1 + amt * Math.sin(Math.PI * t) * (1 - t);
};
