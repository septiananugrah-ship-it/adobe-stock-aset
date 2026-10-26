// Tulis scripts/themes.mjs (peta id → tema) agar skrip .mjs tidak perlu memuat TSX.
import {writeFileSync} from 'node:fs';
import {ASSETS} from '../src/registry';

writeFileSync('scripts/themes.mjs', `export const ASSET_THEMES = ${JSON.stringify(Object.fromEntries(ASSETS.map((a) => [a.meta.id, a.meta.theme])), null, 1)};\n`);
console.log(`${ASSETS.length} tema ditulis`);
