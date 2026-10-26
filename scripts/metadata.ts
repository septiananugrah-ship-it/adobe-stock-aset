// CSV unggahan Adobe Stock per tema:
//   out/render/<tema>/adobe_stock.csv   (klip .mov)
//   out/vectors/<tema>/adobe_stock.csv  (ilustrasi .eps)
// Kolom: Filename, Title, Keywords, Category, Releases.
import {mkdirSync, writeFileSync} from 'node:fs';
import {ASSETS} from '../src/registry';

const MOTION_WORDS = ['animation', 'animated', 'motion graphics', 'motion', 'seamless loop', 'looped', 'loop', 'alpha channel', 'transparent background', '4k', 'video', 'footage', 'clip'];
const clean = (words: string[], limit = 49) => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const w of words) {
    const k = w.trim().toLowerCase();
    if (k && !seen.has(k)) {
      seen.add(k);
      out.push(k);
    }
  }
  return out.slice(0, limit);
};
const q = (s: string) => `"${s.replace(/"/g, '""')}"`;
const vectorTitle = (t: string) =>
  t
    .replace(/,?\s*(seamless )?(looped |loop(ing)? )?(motion graphics |animation)( loop)?/gi, '')
    .replace(/,?\s*with alpha channel/gi, '')
    .replace(/,?\s*flat design/gi, '')
    .replace(/,?\s*(4k|transparent background)/gi, '')
    .replace(/\s+,/g, ',')
    .replace(/[,\s]+$/, '')
    .trim() + ', flat vector illustration';

const rows: Record<string, {mov: string[]; vec: string[]}> = {};
for (const {meta} of ASSETS) {
  const r = (rows[meta.theme] ??= {mov: [], vec: []});
  r.mov.push([q(`${meta.id}.mov`), q(meta.title), q(clean(meta.keywords).join(', ')), meta.category, '""'].join(','));
  const vkw = clean(['vector', 'illustration', 'flat illustration', ...meta.keywords.filter((k) => !MOTION_WORDS.includes(k.toLowerCase()))]);
  r.vec.push([q(`${meta.id}.eps`), q(vectorTitle(meta.title)), q(vkw.join(', ')), meta.category, '""'].join(','));
}
for (const [theme, r] of Object.entries(rows)) {
  for (const [dir, list] of [[`out/render/${theme}`, r.mov], [`out/vectors/${theme}`, r.vec]] as const) {
    mkdirSync(dir, {recursive: true});
    writeFileSync(`${dir}/adobe_stock.csv`, ['Filename,Title,Keywords,Category,Releases', ...list].join('\n') + '\n');
  }
  console.log(`${theme}: ${r.mov.length} klip + ${r.vec.length} vektor`);
}
