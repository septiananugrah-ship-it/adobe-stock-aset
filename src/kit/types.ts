import type React from 'react';

export type Theme = 'ui' | 'science' | 'business' | 'nature';

export type Meta = {
  /** kebab-case unik, dipakai sebagai nama komposisi & berkas, mis. "business-monitor-growth-chart" */
  id: string;
  theme: Theme;
  /** Judul Adobe Stock (bahasa Inggris, 5–20 kata, tanpa merek/nama orang) */
  title: string;
  /** 25–49 kata kunci bahasa Inggris, paling penting di depan */
  keywords: string[];
  /** Kategori Adobe Stock: 3 Business, 5 Environment, 8 Graphic Resources, 12 Lifestyle, 14 Plants, 16 Science, 19 Technology … */
  category: number;
  /** Durasi loop (detik), 5–12 */
  seconds: number;
  /** Pose (0..1) untuk ekspor ilustrasi vektor statis; pilih saat semua elemen terlihat penuh */
  vectorP: number;
};

export type DrawProps = {
  /** fase loop 0..1 */
  p: number;
  /** true saat diekspor sebagai vektor: semua isi harus opak (kit menangani bayangan/kilau) */
  vector?: boolean;
};

export type AssetModule = {meta: Meta; Draw: React.FC<DrawProps>};

/** Kanvas desain (dirender skala 2 → 3840×2160). */
export const W = 1920;
export const H = 1080;
