// Render aset menjadi klip ber-alpha 4K + pratinjau kecil.
//   CHROME_PATH=... node scripts/render-assets.mjs [--format prores|png] [--scale 2] [id-atau-awalan ...]
// Hasil per aset di out/render/<tema>/:
//   <id>.mov          ProRes 4444 + alpha (format "prores", bawaan) atau QuickTime PNG + alpha ("png", lebih kecil)
//   <id>-preview.mp4  pratinjau H.264 720p di atas papan catur (untuk dicek di HP/iPad)
import {bundle} from '@remotion/bundler';
import {getCompositions, renderFrames} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import {mkdirSync, rmSync} from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  if (i < 0) return def;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
};
const format = opt('format', 'prores');
const scale = Number(opt('scale', '2'));
const filters = args;
const browserExecutable = process.env.CHROME_PATH ?? null;
const concurrency = Number(process.env.RENDER_CONCURRENCY ?? 4);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const {ASSET_THEMES} = await import('./themes.mjs');
const comps = (await getCompositions(serveUrl, {browserExecutable})).filter((c) => !filters.length || filters.some((f) => c.id.startsWith(f)));
console.log(`${comps.length} aset akan dirender (${format}, skala ${scale})`);
for (const c of comps) {
  const theme = ASSET_THEMES[c.id] ?? 'lain';
  const outDir = path.resolve('out/render', theme);
  const frames = path.resolve('out/frames', c.id);
  rmSync(frames, {recursive: true, force: true});
  mkdirSync(frames, {recursive: true});
  mkdirSync(outDir, {recursive: true});
  const t0 = Date.now();
  await renderFrames({
    serveUrl, composition: c, outputDir: frames, imageFormat: 'png', scale, concurrency, browserExecutable,
    inputProps: c.props, onStart: () => undefined, onFrameUpdate: () => undefined,
  });
  const inPat = path.join(frames, 'element-%0' + String(c.durationInFrames - 1).length + 'd.png');
  const mov = path.join(outDir, `${c.id}.mov`);
  const codec = format === 'png'
    ? ['-c:v', 'png', '-pix_fmt', 'rgba']
    : ['-c:v', 'prores_ks', '-profile:v', '4444', '-pix_fmt', 'yuva444p10le', '-alpha_bits', '16', '-vendor', 'apl0', '-qscale:v', '9'];
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(c.fps), '-i', inPat, ...codec, '-movflags', '+faststart', mov], {stdio: 'inherit'});
  // pratinjau di atas papan catur
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', `color=c=0xECECEC:s=1280x720:r=${c.fps}`, '-framerate', String(c.fps), '-i', inPat,
    '-filter_complex', "[0]geq=lum='if(mod(floor(X/32)+floor(Y/32),2),212,236)':cb=128:cr=128[bg];[1]scale=1280:720:flags=lanczos[fg];[bg][fg]overlay=shortest=1,format=yuv420p",
    '-c:v', 'libx264', '-crf', '20', '-movflags', '+faststart', path.join(outDir, `${c.id}-preview.mp4`)], {stdio: 'inherit'});
  rmSync(frames, {recursive: true, force: true});
  const mb = Number(execFileSync('stat', ['-c', '%s', mov]).toString()) / 1e6;
  console.log(`✓ ${c.id}: ${c.durationInFrames} frame, ${mb.toFixed(0)} MB, ${((Date.now() - t0) / 1000).toFixed(0)} dtk`);
}
