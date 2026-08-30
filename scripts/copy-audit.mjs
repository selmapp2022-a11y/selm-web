#!/usr/bin/env node
/**
 * COPY RULE 1, ENFORCED RATHER THAN REVIEWED.
 *
 *   node scripts/copy-audit.mjs
 *
 * The IA ruling of 30 August adopted five copy rules and put a condition on
 * the first one:
 *
 *   "No sentence may appear twice on the same screen — with an automated
 *   test."
 *
 * That condition is the whole of the rule. A copy rule kept by review is kept
 * until the reviewer is busy, and this codebase already has the evidence: the
 * "150 official score reports" sentence was printed twice on Today, one scroll
 * apart, and survived every reading of that page until somebody counted.
 *
 * ── What this can and cannot see ────────────────────────────────────────
 * It is a SOURCE lint, not a render. It reads the string literals in each page
 * and flags a long one that appears twice in the same file, and it counts the
 * app-wide CTAs that the ruling caps. It cannot see a sentence printed once
 * here and once in a component this page renders — the D1 and D2 cases were
 * exactly that shape, and they are caught by the second list below rather than
 * by the first.
 *
 * Written as a node script beside `i18n-audit.mjs` for the same reason that
 * one is: a lint over source text is not a unit test, and the engine checks
 * run without node types on purpose.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOTS = ['src/pages', 'src/exam/pages', 'src/components', 'src/exam/components'];

/**
 * Phrases the ruling caps, with the number of places they may appear.
 *
 * A CTA is a control. Printing its words somewhere it is not a control is how
 * a phrase stops being a button and becomes background.
 */
const CAPPED = [
  { phrase: 'Enter a past result', max: 1, why: 'IA ruling D3 — it appeared four times' },
  { phrase: 'Where you stand', max: 2, why: 'IA ruling D1 — Today owns the block; Progress may link to it by name' },
];

const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.tsx?$/.test(p)) files.push(p);
  }
};
for (const r of ROOTS) { try { walk(r); } catch { /* a root that does not exist is not a failure */ } }

/** String literals long enough to be a sentence rather than a label. */
const literalsOf = (src) => {
  // Comments are documentation, not rendered copy, and this file's own prose
  // would otherwise report itself.
  const code = src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/.*$/gm, ' ');
  // A Tailwind class list is a long string of words and is not copy. Half or
  // more of its words carry a hyphen or a colon and it has no sentence
  // punctuation, which separates it from prose without needing to know where
  // it sits in the JSX.
  const isClassList = (t) =>
    !/[.?!,;:]\s|[.?!]$/.test(t) &&
    t.split(' ').filter((w) => /[-:]/.test(w)).length >= t.split(' ').length * 0.5;
  const out = [];
  for (const m of code.matchAll(/(['"`])((?:\\.|(?!\1)[^\\])*)\1/g)) {
    const text = m[2].replace(/\s+/g, ' ').trim();
    if (text.split(' ').length >= 8 && /[a-z]{3}/i.test(text) && !isClassList(text)) out.push(text);
  }
  return out;
};

let problems = 0;
console.log('\n1. No long sentence appears twice in one file\n');
for (const f of files) {
  const counts = new Map();
  for (const t of literalsOf(readFileSync(f, 'utf8'))) counts.set(t, (counts.get(t) ?? 0) + 1);
  for (const [text, n] of counts) {
    if (n > 1) {
      problems += 1;
      console.log(`  FAIL ${f}\n       ×${n}  "${text.slice(0, 90)}${text.length > 90 ? '…' : ''}"`);
    }
  }
}
if (!problems) console.log(`  ok   ${files.length} files, no repeated sentence`);

console.log('\n2. The capped phrases\n');
for (const { phrase, max, why } of CAPPED) {
  const hits = [];
  for (const f of files) {
    const code = readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/.*$/gm, ' ');
    const n = code.split(phrase).length - 1;
    if (n) hits.push(`${f}${n > 1 ? ` ×${n}` : ''}`);
  }
  const total = hits.reduce((a, h) => a + (Number(h.match(/×(\d+)/)?.[1]) || 1), 0);
  const ok = total <= max;
  if (!ok) problems += 1;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} "${phrase}" — ${total} of at most ${max}   ${hits.join(', ') || 'nowhere'}`);
  if (!ok) console.log(`       ${why}`);
}

console.log(problems ? `\nFAIL — ${problems} copy problem(s)` : '\nCopy rules hold.');
process.exit(problems ? 1 : 0);
