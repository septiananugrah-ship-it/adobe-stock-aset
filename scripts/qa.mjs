// QA: render still transparan (skala 0,5) pada beberapa fase loop untuk aset tertentu,
// lalu scripts/qa_check.py menilai sambungan loop, margin aman, tepi alpha, dan membuat lembar kontak.
// Pemakaian: CHROME_PATH=... node scripts/qa.mjs <id-atau-awalan> [...]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import {mkdirSync, rmSync} from 'node:fs';
import path from 'node:path';

const filters = process.argv.slice(2);
const browserExecutable = process.env.CHROME_PATH ?? null;
const scale = Number(process.env.QA_SCALE ?? 0.5);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const {getCompositions} = await import('@remotion/renderer');
const comps = await getCompositions(serveUrl, {browserExecutable});
const pick = comps.filter((c) => !filters.length || filters.some((f) => c.id.startsWith(f)));
for (const c of pick) {
  const dir = path.resolve('out/qa', c.id);
  rmSync(dir, {recursive: true, force: true});
  mkdirSync(dir, {recursive: true});
  const n = c.durationInFrames;
  const frames = [...new Set([0, 1, Math.round(n * 0.125), Math.round(n * 0.25), Math.round(n * 0.375), Math.round(n * 0.5), Math.round(n * 0.625), Math.round(n * 0.75), Math.round(n * 0.875), n - 1])];
  for (const frame of frames) {
    await renderStill({serveUrl, composition: c, frame, scale, browserExecutable, imageFormat: 'png', output: path.join(dir, `f-${String(frame).padStart(4, '0')}.png`)});
  }
  console.log('render', c.id, frames.length, 'still');
}
execFileSync('python3', ['scripts/qa_check.py', ...pick.map((c) => c.id)], {stdio: 'inherit'});
void selectComposition;
