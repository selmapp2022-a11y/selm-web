#!/usr/bin/env node
/**
 * NO SURFACE MAY PUBLISH A COUNT THE BANK CANNOT SERVE.
 *
 * The founder, 31 August, on the IA ruling's tile hints:
 *
 *   «هیچ کاشی عددی نشان ندهد که بانک نمی‌تواند سرو کند. شنیدار الان ۱۶۰ سؤال
 *    دارد و صفر سرو می‌کند — تا صدا نیامده، هر عددی روی آن کاشی دروغ است.»
 *
 *   "No tile may show a count the bank cannot serve. Listening now holds 160
 *    questions and serves zero — until the audio exists, any number on that
 *    tile is a lie."
 *
 * This is the third time this week the same defect has been stopped: a figure
 * that is true about the DATA and false about the PRODUCT. The inventory
 * already separates the three numbers — exists, reachable, servable — and
 * `deliverable()` is the one predicate that decides the third. The gap this
 * closes is that a component can reach past all of it and read
 * `section.items.length` directly, which is `exists`, which is 160.
 *
 * A review cannot hold this: the wrong number and the right one look identical
 * on the screen, and the difference only shows on the day the bank grows
 * without its audio — which is exactly today.
 *
 * So: no file that draws a screen may read a raw bank length. Anything that
 * legitimately counts must either count what `serveEpreuve` returned (already
 * filtered) or say here why it is exempt.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOTS = ['src/pages', 'src/components', 'src/exam/pages', 'src/exam/components'];

/** Raw bank lengths. Each is `exists`, and none of them is servable. */
const BANNED = [
  // Written WITHOUT a leading dot on purpose. The first version required one
  // — `\.recordings\.length` — and reported a clean scan while
  // `SectionPage` printed `${recordings.length}` three times: the bank had
  // been destructured into a local first, so the dot was not there. A guard
  // that can be stepped around by naming a variable is not a guard.
  /\b(items|recordings)\s*\.\s*length\b/,
  /\b(items|recordings)\s*\.\s*filter\s*\(/,
];

/**
 * Files that count something already filtered, with the reason stated here
 * rather than in a comment nobody reads. An entry is a claim, and it names the
 * thing that does the filtering.
 */
const EXEMPT = {
  'src/exam/pages/SectionPage.tsx':
    'counts the recordings `serveEpreuve` returned for THIS sitting — already ' +
    'filtered by `deliverable`, so a script with no audio is not among them',
  'src/components/ComprehensionPractice.tsx':
    'counts `itemsOf(section, rec.id)` for the ONE recording `servePractice` ' +
    'drew, and that draw runs through `practicable` — so the number is the ' +
    'questions in the turn the candidate is sitting, never the bank',
};

const walk = (dir) => {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.tsx?$/.test(p) && !/\.check\.tsx?$/.test(p)) out.push(p);
  }
  return out;
};

let failures = 0;
let scanned = 0;
const hits = [];

for (const root of ROOTS) {
  for (const file of walk(root)) {
    scanned += 1;
    const rel = relative('.', file);
    const src = readFileSync(file, 'utf8');
    const lines = src.split('\n');
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      // A comment explaining the rule is not a violation of it.
      if (/^\s*(\/\/|\*|\/\*)/.test(line)) continue;
      for (const re of BANNED) {
        if (!re.test(line)) continue;
        if (EXEMPT[rel]) { hits.push({ rel, n: i + 1, line: line.trim(), exempt: true }); continue; }
        hits.push({ rel, n: i + 1, line: line.trim(), exempt: false });
        failures += 1;
      }
    }
  }
}

console.log('\nCOUNTS — no surface publishes a number the bank cannot serve\n');
console.log(`  scanned ${scanned} files under ${ROOTS.join(', ')}`);
for (const [file, why] of Object.entries(EXEMPT)) console.log(`  exempt  ${file}\n          ${why}`);
console.log('');
for (const h of hits) {
  if (h.exempt) console.log(`  ok   ${h.rel}:${h.n}  ${h.line.slice(0, 72)}`);
  else console.log(`  FAIL ${h.rel}:${h.n}  ${h.line.slice(0, 72)}`);
}
if (!hits.length) console.log('  ok   no raw bank length is read by any screen');

if (failures) {
  console.log(`\n${failures} raw bank length(s) read by a screen.`);
  console.log('A screen may count what `serveEpreuve` returned, or the inventory’s');
  console.log('`servable`. It may not count `exists`: the listening bank holds 160');
  console.log('questions and serves none of them.\n');
  process.exit(1);
}
console.log('\nNo screen publishes a count the bank cannot serve.\n');
