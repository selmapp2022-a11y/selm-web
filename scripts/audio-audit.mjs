#!/usr/bin/env node
/**
 * THE BANK LIVES ON THE CDN, AND THE BUNDLE DOES NOT CARRY IT.
 *
 * `public/audio` reached 59 MB on 31 August and went to DigitalOcean Spaces.
 * Two things can quietly undo that: a file dropped back into `public/`, and an
 * `audioPath` that names a file nobody uploaded. The first makes the bundle
 * heavy again with no visible symptom; the second is a recording that plays
 * everywhere it is tested and 404s for the candidate.
 *
 * So this asserts three things, and it is a node script for the same reason
 * `i18n-audit` and `copy-audit` are: it reads the filesystem, and the app's
 * type-check must never be able to.
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

let bad = 0;
const ok = (cond, label, detail = '') => {
  if (!cond) bad += 1;
  console.log(`  ${cond ? 'ok  ' : 'FAIL'} ${label}${detail ? `   ${detail}` : ''}`);
};

const walk = (dir) => {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
};

console.log('\nAUDIO — where the bank lives\n');

// 1 ── nothing in the bundle
const inPublic = walk('public').filter((p) => /\.(mp3|m4a|wav|ogg)$/i.test(p));
ok(inPublic.length === 0, 'no audio ships inside the bundle', inPublic.slice(0, 5).join(', ') || 'public/ is clean');

// 2 ── every audioPath the definitions name exists in the store we upload from
const defs = walk('src/exam/definitions').filter((p) => p.endsWith('.ts'));
const paths = new Set();
for (const f of defs)
  for (const m of readFileSync(f, 'utf8').matchAll(/audioPath:\s*['"]([^'"]+)['"]/g)) paths.add(m[1]);
const missing = [...paths].filter((p) => !existsSync(join('audio-src', p)));
ok(paths.size > 0, 'the definitions name some audio at all', `${paths.size} paths`);
ok(missing.length === 0, 'every audioPath exists under audio-src/', missing.slice(0, 5).join(', ') || `${paths.size} found`);

// 3 ── and the default base is absolute, so an unset variable cannot 404 the bank
const audioTs = readFileSync('src/exam/engine/audio.ts', 'utf8');
const fallback = audioTs.match(/\?\?\s*'([^']+)'/)?.[1] ?? '';
ok(/^https?:\/\//.test(fallback), 'the default audio base is an absolute URL', fallback || 'none found');

// 4 ── and nothing in the store is unreferenced, which is how a rename leaves 59 MB behind
const stored = walk('audio-src').map((p) => p.replace(/^audio-src\//, ''));
const orphans = stored.filter((p) => /\.mp3$/i.test(p) && !paths.has(p));
ok(orphans.length === 0, 'nothing in the store is unreferenced', orphans.slice(0, 6).join(', ') || `${stored.length} files, all named`);

console.log(bad ? `\n${bad} FAILED\n` : '\nThe bank is on the CDN and the bundle is clean.\n');
process.exit(bad ? 1 : 0);
