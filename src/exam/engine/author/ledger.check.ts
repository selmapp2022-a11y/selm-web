/**
 * THE LEDGER MUST DESCRIBE THE GATE THAT ACTUALLY RAN.
 *
 * A ledger is a record of what a machine refused. It is worth exactly as much
 * as its agreement with that machine — a reason id that no rule emits is a
 * story about the past, and it looks identical to a measurement.
 *
 * So: every rule family named in `ledger.ts` must be a family `gate.ts` really
 * emits (read out of the source, not from a list kept beside it), every
 * rollup must be declared as one, and every batch's arithmetic must close.
 */
import { RULES } from './instructions';
import { LEDGER, FORMAT_OF_PREFIX, ROLLUPS, formatOf, type Format } from './ledger';

let failed = 0;
const t = (name: string, got: unknown, want: unknown) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failed += 1;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name}${ok ? '' : `   got ${JSON.stringify(got)} want ${JSON.stringify(want)}`}`);
};

console.log('\n1. Every rule family in the ledger is one the gate emits\n');

// The rule ids come from `instructions.ts`, and the chain is what makes this
// worth asserting: `instructions.check.ts` runs 21 deliberately-bad candidates
// through the REAL gate and fails if any id it fires is missing from `RULES`.
// So `RULES` ⊇ what the gate emits, and this file asserts ledger ⊆ `RULES`.
// A rule renamed in `gate.ts` breaks the first link, and a reason invented
// here breaks the second.
const emitted = new Set(Object.keys(RULES).map((r) => r.split('.')[0]));
console.log(`     gate families: ${[...emitted].sort().join(', ')}`);

const used = new Set<string>();
for (const b of LEDGER)
  for (const r of [...Object.keys(b.reasons), ...Object.keys(b.precondition ?? {})]) used.add(r);

for (const r of [...used].sort()) {
  const head = r.split('.')[0];
  t(`${r} is a real rule or a declared rollup`, emitted.has(head) || ROLLUPS.has(r), true);
}
t('a rollup is never also a real rule', [...ROLLUPS].filter((r) => r in RULES), []);

t('every family the gate emits is classified for format', [...emitted].filter((h) => !(h in FORMAT_OF_PREFIX)), []);

console.log('\n2. The arithmetic closes, per batch\n');

for (const b of LEDGER) {
  const refused = b.submitted - b.accepted;
  t(`${b.batch}: accepted ≤ submitted`, b.accepted <= b.submitted, true);
  // A refused candidate raises at least one reason, and a reason cannot be
  // raised by a candidate that was accepted. The ledger counts FIRINGS rather
  // than candidates, so firings ≥ refusals is the closable inequality — and
  // an unexplained refusal must be declared rather than left as a zero.
  const firings = Object.values(b.reasons).reduce((a, n) => a + n, 0);
  t(`${b.batch}: ${refused} refused, ${firings} firings, ${b.unattributed} unexplained`,
    refused === 0 ? firings === 0 : firings + b.unattributed >= refused, true);
  t(`${b.batch}: no reason recorded against a clean batch`, refused === 0 && firings > 0, false);
}

console.log('\n3. Preconditions are kept out of the rate\n');

// The 15 `matching.no-such-group` firings in Part 2 were a section-level
// declaration that did not exist yet, not fifteen bad items. Counting them in
// the rate would say matching is the worst format in the project, which is the
// opposite of what happened.
const pre = LEDGER.reduce((n, b) => n + Object.values(b.precondition ?? {}).reduce((a, x) => a + x, 0), 0);
t('there are preconditions to keep out at all', pre > 0, true);
const inRate = LEDGER.reduce((n, b) => n + Object.values(b.reasons).reduce((a, x) => a + x, 0), 0);
const matchingInRate = LEDGER.reduce(
  (n, b) => n + Object.entries(b.reasons).filter(([r]) => formatOf(r) === 'matching').reduce((a, [, x]) => a + x, 0), 0);
t('and none of them leaked into the counted reasons', matchingInRate, 0);
console.log(`     ${pre} precondition firings held out · ${inRate} firings counted`);

console.log('\n4. The format split is not an artefact of one batch\n');

const authored: Record<Format, number> = { choice: 0, completion: 0, matching: 0 };
for (const b of LEDGER) for (const [f, n] of Object.entries(b.items)) authored[f as Format] += n;
t('all three formats were actually authored', Object.values(authored).every((n) => n > 0), true);
// The claim being made in `format.run.ts` is that completion fired nothing.
// That claim is only worth making if enough completion was written to have
// fired something — 75 items against a rate of 8.9 per 100 would expect ~7.
t('enough completion was written for zero to mean something', authored.completion >= 60, true);
console.log(`     choice ${authored.choice} · completion ${authored.completion} · matching ${authored.matching}`);

console.log(failed ? `\n${failed} FAILED\n` : '\nThe ledger agrees with the gate it describes.\n');
if (failed) throw new Error(`${failed} ledger case(s) failed`);
