# adobe-stock-aset

Aset microstock buatan kode (Remotion + SVG):

- **Klip motion graphics loop mulus ber-alpha**: 4K 3840×2160, 30 FPS, ProRes 4444 dengan alpha channel (opsi QuickTime PNG + alpha), 6–10 detik, siap ditempel di atas footage apa pun.
- **Ilustrasi vektor** dari pose terbaik tiap klip: EPS (PostScript level 2), SVG, JPG 5000 px, PNG transparan.
- **CSV metadata Adobe Stock** per tema (judul & kata kunci bahasa Inggris).

Tema: `ui` (ikon & antarmuka), `science`, `business`, `nature`.

## Render (GitHub Actions)

1. Merge PR ke `main`.
2. Buka Actions, pilih **Render aset Adobe Stock (alpha 4K + vektor)**, lalu tekan *Run workflow*:
   - `tema` = `semua` (atau satu tema)
   - `format` = `prores` (ProRes 4444 + alpha, standar editor) atau `png` (lossless, lebih kecil)
   - `ids` dikosongkan untuk semua aset
3. Unduh artefak per tema:
   - `adobe-<tema>-klip-prores`: berisi `.mov` + `adobe_stock.csv`
   - `adobe-<tema>-vektor`: berisi `eps/ svg/ jpg/ png/` + `adobe_stock.csv`
   - `pratinjau-<tema>`: MP4 kecil di atas papan catur, untuk dicek di iPad

## Unggah ke Adobe Stock

- **Klip:** unggah `.mov` lewat contributor.stock.adobe.com, lalu impor `adobe_stock.csv` di halaman metadata.
- **Vektor:** unggah `.eps` bersama `.jpg` dengan nama sama, lalu impor CSV vektor.
- Centang **"Created using generative AI tools"** (kode dan desain dibuat dengan bantuan AI).
- Mulai dari 10–20 aset terbaik, tunggu hasil review, lalu lanjutkan bertahap.

Detail teknis dan standar mutu: lihat `CLAUDE.md`.
