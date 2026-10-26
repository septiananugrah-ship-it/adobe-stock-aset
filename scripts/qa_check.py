#!/usr/bin/env python3
"""Penilaian otomatis still QA (out/qa/<id>/f-*.png) + lembar kontak out/qa/<id>.jpg.

Cek:
- SAMBUNGAN: selisih(frame terakhir, frame 0) harus sebanding selisih(frame 1, frame 0).
- MARGIN: isi tidak boleh menyentuh tepi; jarak minimum ke tepi ≥ 5 % lebar/tinggi.
- LATAR: sudut harus transparan; cakupan piksel non-transparan < 70 % (bukan kotak penuh).
- KOSONG: tiap still (kecuali pose istirahat) harus punya isi.
Lembar kontak: tiap still di atas papan catur terang dan latar gelap (untuk melihat tepi alpha).
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

root = Path("out/qa")
ok_all = True
for cid in sys.argv[1:]:
    files = sorted((root / cid).glob("f-*.png"))
    if not files:
        continue
    ims = [Image.open(f).convert("RGBA") for f in files]
    arr = [np.asarray(im, dtype=np.float32) for im in ims]
    h, w = arr[0].shape[:2]
    msgs = []

    def diff(a, b):
        return np.abs(a - b).mean()

    d1 = diff(arr[1], arr[0])
    dl = diff(arr[-1], arr[0])
    ratio = dl / max(d1, 0.02)
    if dl > 0.05 and ratio > 3:
        msgs.append(f"SAMBUNGAN loop melompat (rasio {ratio:.1f})")
    minm = 1.0
    cover = 0
    for a in arr:
        al = a[..., 3]
        if al[0, 0] > 0 or al[0, -1] > 0 or al[-1, 0] > 0 or al[-1, -1] > 0:
            msgs.append("LATAR: sudut tidak transparan")
            break
        ys, xs = np.nonzero(al > 8)
        if len(xs):
            m = min(xs.min() / w, (w - 1 - xs.max()) / w, ys.min() / h, (h - 1 - ys.max()) / h)
            minm = min(minm, m)
        cover = max(cover, (al > 8).mean())
    if minm < 0.05:
        msgs.append(f"MARGIN terlalu tipis ({minm * 100:.1f} %)")
    if cover > 0.7:
        msgs.append(f"LATAR: cakupan {cover * 100:.0f} % (terlalu penuh)")
    empties = sum(1 for a in arr if (a[..., 3] > 8).mean() < 0.002)
    if empties > 2:
        msgs.append(f"KOSONG: {empties} still tanpa isi")
    status = "OK " if not msgs else "CEK"
    ok_all &= not msgs
    print(f"{status} {cid:52s} sambungan {ratio:4.1f} · margin {minm * 100:4.1f} % · cakupan {cover * 100:3.0f} %  {'; '.join(msgs)}")
    # lembar kontak: baris atas papan catur terang, baris bawah gelap
    tw = 480
    th = int(h * tw / w)
    cols = len(ims)
    sheet = Image.new("RGB", (tw * cols, th * 2 + 26), "white")
    for i, im in enumerate(ims):
        small = im.resize((tw, th), Image.LANCZOS)
        chk = Image.new("RGBA", (tw, th), (236, 236, 236, 255))
        dr = ImageDraw.Draw(chk)
        for y in range(0, th, 24):
            for x in range(0, tw, 24):
                if (x // 24 + y // 24) % 2:
                    dr.rectangle([x, y, x + 23, y + 23], fill=(212, 212, 212, 255))
        chk.alpha_composite(small)
        dark = Image.new("RGBA", (tw, th), (18, 22, 34, 255))
        dark.alpha_composite(small)
        sheet.paste(chk.convert("RGB"), (i * tw, 26))
        sheet.paste(dark.convert("RGB"), (i * tw, 26 + th))
    ImageDraw.Draw(sheet).text((6, 6), f"{cid}  {status}  {'; '.join(msgs)}", fill="black")
    sheet.save(root / f"{cid}.jpg", quality=85)
print("SEMUA OK" if ok_all else "ADA YANG PERLU DICEK")
