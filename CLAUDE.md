# adobe-stock-aset — panduan untuk asisten AI

Pemilik: Septian Anugrah ("Yayan"), berbahasa Indonesia, mengunduh dan menonton lewat iPad.
Tujuan repo: **aset microstock bernilai tinggi** untuk Adobe Stock, yaitu:
1. **Klip motion graphics loop mulus ber-alpha**: 4K 3840×2160, 30 FPS, ProRes 4444 + alpha (opsi QuickTime PNG + alpha).
2. **Ilustrasi vektor** dari pose terbaik tiap klip: SVG, EPS level 2, JPG 5000 px, dan PNG transparan.

Standar mutu: **setiap aset harus layak jual mahal**. Gaya konsisten, proporsi rapi, gerak halus, loop tanpa lompatan, tepi tajam, tanpa kesalahan. Lebih baik sedikit tapi sempurna daripada banyak tapi asal jadi.

## Aturan proses
- Kerja di branch kerja, lalu PR ke `main`. **Claude tidak menjalankan workflow GitHub Actions**: setelah merge, minta pengguna menekan *Run workflow* dan beri link serta isiannya.
- Satu aset = satu berkas `src/assets/<tema>/<nama>.tsx` yang mengekspor `meta` dan `Draw`. Setelah menambah berkas, jalankan `python3 scripts/gen-registry.py`.
- `meta.id` wajib diawali tema: `ui-…`, `science-…`, `business-…`, `nature-…` (kebab-case, unik).
- Cek wajib sebelum aset dianggap jadi:
  1. `npx tsc --noEmit` bersih.
  2. `CHROME_PATH=… node scripts/qa.mjs <id>` → baris status **OK**. Lalu **lihat** lembar kontak `out/qa/<id>.jpg`: papan catur terang di atas, latar gelap di bawah.
  3. Still penuh (`QA_SCALE=1`) pada pose puncak harus diperiksa dari dekat: proporsi, jarak antar-elemen, tidak ada elemen bertabrakan atau terpotong, tepi rapi.
  4. `npx tsx scripts/export-vectors.tsx <id> && python3 scripts/vectors.py` → harus ✓ (vektor opak, tanpa filter/mask/teks).
- Chrome lokal: `export CHROME_PATH=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`.

## Kontrak `Draw`
- `Draw({p, vector})`: p = fase loop 0..1 (p = frame/durasi). Mengembalikan elemen SVG untuk kanvas **1920×1080** (dirender skala 2 → 4K). Latar **transparan**: jangan menggambar persegi latar.
- Komponen murni: **tanpa hook Remotion** (`useCurrentFrame` dll.), tanpa `Math.random()` (pakai `rng(seed)`), tanpa animasi CSS. Semua dihitung dari `p`.
- **Loop mulus**: keadaan di p = 0 harus identik dengan p → 1.
  - Gerak periodik: `wave(p, k)` dengan k bilangan bulat.
  - Gerak "tumbuh lalu kembali": `yoyo(p, a, b, c, d)`, dengan a > 0 dan d < 1, supaya ada jeda istirahat yang sama di kedua ujung.
  - Rotasi: kelipatan 360° per loop.
  - Partikel yang mengalir: posisi `mod(p·k + offset, 1)` dengan k bulat, dan memudar di kedua ujung.
- **Mode vektor** (`vector === true`): semua isi opak. Tidak boleh ada `opacity` < 1, `fill-opacity`, `filter`, `mask`, `<text>`, atau `<image>`. Bayangan lantai pakai `Shadow` dan cahaya pakai `Glow` dari kit (keduanya otomatis opak atau hilang di mode vektor). Di mode motion boleh memakai opacity untuk muncul/hilang, tetapi pose `vectorP` harus tampil penuh tanpa transparansi.
- `clipPath` boleh dipakai di motion, tetapi **id harus unik** (awali dengan id aset). Hindari di mode vektor bila memungkinkan.

## Gaya visual (wajib konsisten)
- **Flat illustration modern**: bentuk geometris membulat (radius sudut 8–30 px), **tanpa garis kontur hitam**. Kedalaman lewat 2–3 tingkat warna: warna dasar, sisi gelap `shade(c, −0.12…−0.25)`, dan kilau `shade(c, +0.3…0.45)` berupa strip tipis atau bulatan kecil.
- Palet `C` di `src/kit/palette.ts`. Satu aset: 1 warna utama, 1–2 aksen, ditambah netral (navy/ink/mist/cloud). Jangan memakai warna di luar palet kecuali turunan `shade`/`blend`.
- **Proporsi & tata letak**:
  - Objek utama berpusat. Tinggi total isi sekitar 50–70 % tinggi kanvas (540–760 px). Margin ke tepi ≥ 8 %.
  - Bayangan lantai `Shadow` di bawah objek yang berdiri.
  - Elemen sekunder (kilau, partikel, ikon kecil) mengisi ruang di sekitar tanpa menempel tepi.
- **Ketebalan**: garis ikon dan stroke 8–14 px, ujung membulat (`strokeLinecap="round"`). Elemen kecil minimal 10 px.
- **Tanpa teks/huruf/angka/logo/merek.** Tanda (centang, panah, plus, hati, petir, bintang) boleh.
- Tiap bentuk berwarna terang di atas latar terang harus tetap terbaca di latar gelap, dan sebaliknya (lembar QA menampilkan keduanya).

## Prinsip animasi (kualitas "mahal")
- Easing selalu halus: `inOut`, `out`, `outBack` untuk "pop", dan `outElastic` secukupnya. Tidak ada gerak linear kaku, kecuali rotasi kontinu.
- **Bertingkat (stagger)**: elemen sejenis muncul berurutan dengan selang 0,02–0,05 p.
- **Antisipasi & overshoot** pada pop-in, squash kecil saat mendarat (`pop`).
- **Gerak sekunder saat diam**: napas halus (skala ±2–3 %), kilau berdenyut, partikel kecil. Tidak ada frame yang benar-benar mati selama lebih dari 1 detik, kecuali jeda singkat di titik loop.
- Durasi 6–10 detik. Siklus cerita: muncul atau bangun → aksi utama → tahan dengan gerak halus → kembali ke awal.
- Kecepatan wajar: gerak utama 0,4–1,2 detik, tidak terlalu cepat atau berkedip.

## Metadata Adobe Stock (`meta`)
- `title`: bahasa Inggris deskriptif, 8–20 kata, sebutkan objek + aksi + "seamless loop" / "animation" / "alpha channel" bila relevan.
- `keywords`: 30–49 kata kunci bahasa Inggris, yang paling penting di depan. Sertakan: objek, konsep, kegunaan (presentation, explainer, social media), gaya (flat design, icon, illustration), dan teknis (seamless loop, alpha channel, transparent background, 4k, motion graphics, animation).
- `category`: 3 Business, 5 Environment, 8 Graphic Resources, 12 Lifestyle, 14 Plants and Flowers, 16 Science, 19 Technology.
- Aset dibuat dengan bantuan AI. Saat mengunggah, pengguna wajib mencentang "Created using generative AI tools".

## Skrip
| Skrip | Fungsi |
|---|---|
| `scripts/gen-registry.py` | Tulis `src/registry.ts` dari semua aset |
| `scripts/qa.mjs <id>` | Still QA, cek loop/margin/latar, lembar kontak `out/qa/<id>.jpg` |
| `scripts/render-assets.mjs [--format prores\|png] <id>` | Klip 4K ber-alpha + pratinjau di `out/render/<tema>/` |
| `scripts/export-vectors.tsx` + `scripts/vectors.py` | Vektor SVG/EPS/JPG/PNG di `out/vectors/<tema>/` |
| `scripts/metadata.ts` | CSV Adobe Stock per tema |
| `scripts/themes.ts` | Peta id → tema untuk skrip .mjs |
