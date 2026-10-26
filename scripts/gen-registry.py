#!/usr/bin/env python3
"""Tulis ulang src/registry.ts dari semua berkas src/assets/<tema>/*.tsx (urut nama).
Berkas yang namanya diawali "_" diabaikan (draf)."""
from pathlib import Path

root = Path(__file__).resolve().parent.parent
files = sorted(p for p in (root / "src/assets").glob("*/*.tsx") if not p.name.startswith("_"))
lines = ["// Dibuat otomatis oleh scripts/gen-registry.py — jangan diedit manual.", "import type {AssetModule} from './kit/types';"]
for i, f in enumerate(files):
    rel = f.relative_to(root / "src").with_suffix("").as_posix()
    lines.append(f"import * as a{i} from './{rel}';")
lines.append("")
lines.append("export const ASSETS: AssetModule[] = [" + ", ".join(f"a{i}" for i in range(len(files))) + "];")
lines.append("")
(root / "src/registry.ts").write_text("\n".join(lines))
bad = [f for f in files if not f.stem and False]
for f in files:
    txt = f.read_text()
    import re
    m = re.search(r"id:\s*'([^']+)'", txt)
    theme = f.parent.name
    if not m or not m.group(1).startswith(theme + "-"):
        print(f"PERINGATAN: {f.relative_to(root)} — id harus diawali '{theme}-'")
print(f"{len(files)} aset terdaftar")
