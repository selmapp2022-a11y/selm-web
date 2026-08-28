/**
 * Part 6's two i18n rows, as a command.
 *
 *   node scripts/i18n-audit.mjs
 *
 *   | i18n coverage     | Automated check for hard-coded strings —
 *   |                   | **fails today, passes when done**
 *   | i18n completeness | Every key in both files. Missing French falls back
 *   |                   | visibly in development, never silently in production
 *
 * The first row says in as many words that this must FAIL right now. It
 * does, and it prints the number, so "done" stops being a feeling.
 *
 * `src/exam/` is excluded on purpose: the exam engine is bilingual by DATA
 * — 119 `{ en, fr }` objects in its definitions — and a literal inside it is
 * usually part of an exam's own wording rather than interface copy. Part 5
 * is about the app.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SRC = join(ROOT, 'src');

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (p.includes('/src/exam') || p.includes('/src/i18n')) continue;
      walk(p, out);
    } else if (/\.tsx?$/.test(p)) out.push(p);
  }
  return out;
}

// A user-facing literal: text between JSX tags starting with a capital, or a
// human-readable attribute. Deliberately conservative — it under-counts
// rather than crying wolf, because a check nobody believes is not a check.
const JSX_TEXT = />\s*([A-Z][^<>{}\n]{2,}?)\s*</g;
const ATTR = /(?:placeholder|title|aria-label|alt)=["']([^"']{3,})["']/g;

const files = walk(SRC);
let total = 0;
const rows = [];
for (const f of files) {
  const s = readFileSync(f, 'utf8');
  const hits = [...s.matchAll(JSX_TEXT), ...s.matchAll(ATTR)].map((m) => m[1]).filter((t) => !/^[\s\d.,%$·—–-]+$/.test(t));
  if (hits.length) {
    total += hits.length;
    rows.push([hits.length, relative(ROOT, f)]);
  }
}
rows.sort((a, b) => b[0] - a[0]);

console.log('i18n COVERAGE — user-facing literals still written into components');
console.log(`  ${total} across ${rows.length} files\n`);
for (const [n, f] of rows.slice(0, 12)) console.log(`  ${String(n).padStart(4)}  ${f}`);
if (rows.length > 12) console.log(`  … and ${rows.length - 12} more files`);

const en = readFileSync(join(SRC, 'i18n/en.ts'), 'utf8');
const fr = readFileSync(join(SRC, 'i18n/fr.ts'), 'utf8');
const keys = (s) => new Set([...s.matchAll(/^\s*'([\w.]+)':/gm)].map((m) => m[1]));
const EK = keys(en), FK = keys(fr);
const missing = [...EK].filter((k) => !FK.has(k));
const extra = [...FK].filter((k) => !EK.has(k));

console.log('\ni18n COMPLETENESS — every key in both files');
console.log(`  English keys ${EK.size} · French keys ${FK.size}`);
console.log(`  missing from French: ${missing.length}${missing.length ? ' -> ' + missing.join(', ') : ''}`);
console.log(`  in French but not English: ${extra.length}${extra.length ? ' -> ' + extra.join(', ') : ''}`);

const ok = total === 0 && missing.length === 0 && extra.length === 0;
console.log('\n' + (ok ? 'PASS' : `FAIL — ${total} literal(s) still in components, ${missing.length} key(s) missing from French`));
process.exit(ok ? 0 : 1);
