// Ekspor pose statis tiap aset (meta.vectorP, mode vector=true) ke out/vectors/<id>.svg,
// lalu scripts/vectors.py memotong ke isi + membuat EPS (PS level 2), JPG 5000 px, PNG transparan.
//   npx tsx scripts/export-vectors.tsx [id-atau-awalan ...]
import {mkdirSync, writeFileSync} from 'node:fs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {H, W} from '../src/kit/types';
import {ASSETS} from '../src/registry';

const filters = process.argv.slice(2);
mkdirSync('out/vectors', {recursive: true});
let n = 0;
for (const {meta, Draw} of ASSETS) {
  if (filters.length && !filters.some((f) => meta.id.startsWith(f))) continue;
  const body = renderToStaticMarkup(React.createElement(Draw, {p: meta.vectorP, vector: true}));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${body}</svg>\n`;
  writeFileSync(`out/vectors/${meta.id}.raw.svg`, svg);
  n++;
}
console.log(`${n} SVG mentah ditulis`);
