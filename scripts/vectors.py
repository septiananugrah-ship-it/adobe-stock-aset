#!/usr/bin/env python3
"""out/vectors/*.raw.svg → potong ke isi (+ bantalan 6 %) → out/vectors/<tema>/{svg,eps,jpg,png}.

Menolak SVG yang masih memakai transparansi/filter/clip (EPS level 2 akan merasternya):
opacity < 1, fill-opacity, stroke-opacity, filter, mask, foreignObject, image, text.
"""
import io
import re
import sys
from pathlib import Path

import cairocffi
import cairosvg
from cairosvg.surface import Surface
from PIL import Image

sys.path.insert(0, str(Path(__file__).parent))


class EPS2Surface(Surface):
    def _create_surface(self, width, height):
        surface = cairocffi.PSSurface(self.output, width, height)
        surface.restrict_to_level(cairocffi.PS_LEVEL_2)
        surface.set_eps(True)
        return surface, width, height


BAD = [
    (r'opacity="0?\.\d+"', "opacity < 1"),
    (r'(fill|stroke)-opacity', "fill/stroke-opacity"),
    (r"<filter|filter=", "filter"),
    (r"<mask|mask=", "mask"),
    (r"<foreignObject", "foreignObject"),
    (r"<image", "image"),
    (r"<text", "text"),
]

src = Path("out/vectors")
themes = {}
tm = Path("scripts/themes.mjs")
if tm.exists():
    for m in re.finditer(r'"([^"]+)":\s*"([^"]+)"', tm.read_text()):
        themes[m.group(1)] = m.group(2)
fails = 0
for raw in sorted(src.glob("*.raw.svg")):
    cid = raw.name[: -len(".raw.svg")]
    svg = raw.read_text()
    probs = [why for pat, why in BAD if re.search(pat, svg)]
    if probs:
        print(f"✗ {cid}: tidak aman untuk vektor ({', '.join(sorted(set(probs)))}) — dilewati")
        fails += 1
        continue
    # kotak isi dari render alfa
    png = cairosvg.svg2png(bytestring=svg.encode(), output_width=1920, output_height=1080)
    im = Image.open(io.BytesIO(png)).convert("RGBA")
    x0, y0, x1, y1 = im.getchannel("A").getbbox()
    pad = 0.06 * max(x1 - x0, y1 - y0)
    x0, y0, x1, y1 = x0 - pad, y0 - pad, x1 + pad, y1 + pad
    w, h = x1 - x0, y1 - y0
    cropped = re.sub(r'width="\d+" height="\d+" viewBox="[^"]+"', f'width="{w:.0f}" height="{h:.0f}" viewBox="{x0:.1f} {y0:.1f} {w:.1f} {h:.1f}"', svg, count=1)
    out = src / themes.get(cid, "lain")
    for sub in ("svg", "eps", "jpg", "png"):
        (out / sub).mkdir(parents=True, exist_ok=True)
    (out / "svg" / f"{cid}.svg").write_text(cropped)
    eps = io.BytesIO()
    EPS2Surface.convert(bytestring=cropped.encode(), write_to=eps)
    (out / "eps" / f"{cid}.eps").write_bytes(eps.getvalue())
    big = Image.open(io.BytesIO(cairosvg.svg2png(bytestring=cropped.encode(), output_width=5000))).convert("RGBA")
    big.save(out / "png" / f"{cid}.png", optimize=True)
    bg = Image.new("RGB", big.size, "white")
    bg.paste(big, mask=big.split()[3])
    bg.save(out / "jpg" / f"{cid}.jpg", quality=95, dpi=(300, 300))
    raw.unlink()
    print(f"✓ {cid}: {big.size[0]}×{big.size[1]} px")
print("selesai" + (f", {fails} dilewati" if fails else ""))
