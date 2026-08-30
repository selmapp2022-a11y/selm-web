/**
 * THE REJECT RATE, PER ITEM FORMAT.
 *
 *   npx tsx src/exam/engine/author/format.run.ts
 *
 * The founder, after Part 2 and again after Part 3: *"when all four parts are
 * done, compare that reject rate with reading — if completion really does
 * lower the rate, that finding affects the format decision in later banks."*
 *
 * It does, and not for the reason the question assumes. Completion is not
 * easier to write. It is that a choice item obliges the author to write THREE
 * WRONG ANSWERS, and every one of them is a chance to leak the key. Six of the
 * gate's rules exist only because those wrong answers exist. A completion item
 * has nothing to leak into, so those six cannot fire on it at all.
 *
 * Read the three tables in order. They answer three different questions and
 * the second is the one that transfers to a new bank.
 */
import { RULES } from './instructions';
import { LEDGER, formatOf, type Format } from './ledger';

const pct = (a: number, b: number) => (b === 0 ? '   —  ' : `${((a / b) * 100).toFixed(0).padStart(4)}% `);
const bar = (a: number, b: number, w = 24) => (b === 0 ? '' : '█'.repeat(Math.round((a / b) * w)));

console.log('\nTHE REJECT RATE PER ITEM FORMAT — IELTS reading and listening, 31 August');
console.log('Source: `ledger.ts`. Every refusal was repaired and resubmitted, so this is a');
console.log('REWORK rate, not a waste rate. Nothing was discarded.\n');

// ── 1 ──────────────────────────────────────────────────────────────────────
// The candidate-level rate, by what the candidate was made of. This is the
// number that was asked for, and on its own it is misleading — which is why
// it is not the last table.
console.log('1. CANDIDATES REFUSED ON THE FIRST PASS, by the batch they belong to\n');
console.log('   batch                              made of              subm  acc  refused');
console.log('   ' + '-'.repeat(74));
let S = 0, A = 0;
for (const b of LEDGER) {
  const made = Object.entries(b.items).map(([f, n]) => `${f} ${n}`).join(' + ');
  const ref = b.submitted - b.accepted;
  S += b.submitted; A += b.accepted;
  console.log(
    `   ${b.batch.replace('2026-08-31-', '').padEnd(34)}${made.padEnd(21)}${String(b.submitted).padStart(4)}${String(b.accepted).padStart(5)}${pct(ref, b.submitted).padStart(9)}`,
  );
}
console.log('   ' + '-'.repeat(74));
console.log(`   ${'ALL EIGHT BATCHES'.padEnd(55)}${String(S).padStart(4)}${String(A).padStart(5)}${pct(S - A, S).padStart(9)}\n`);

const grp = (pred: (b: typeof LEDGER[number]) => boolean) => {
  const g = LEDGER.filter(pred);
  const s = g.reduce((n, b) => n + b.submitted, 0);
  const a = g.reduce((n, b) => n + b.accepted, 0);
  return { s, a, r: s - a };
};
const only = (f: Format) => grp((b) => Object.keys(b.items).length === 1 && b.items[f] !== undefined);
const choiceOnly = only('choice');
const complOnly = only('completion');
const mixed = grp((b) => Object.keys(b.items).length > 1);

console.log('   grouped by what the candidate was made of:\n');
for (const [label, g] of [
  ['every item a 4-option choice', choiceOnly],
  ['every item a completion', complOnly],
  ['mixed (matching + one other)', mixed],
] as const) {
  console.log(`   ${label.padEnd(32)}${String(g.r).padStart(3)} of ${String(g.s).padStart(3)} refused  ${pct(g.r, g.s)} ${bar(g.r, g.s)}`);
}
console.log('\n   Read alone this says completion is free and choice costs half the batch.');
console.log('   It is not that simple, and table 2 is why.\n');

// ── 2 ──────────────────────────────────────────────────────────────────────
// The rule-level rate. A rule can only fire on a format it applies to, so this
// is the number that transfers to a bank not yet written.
console.log('2. RULE FIRINGS, per hundred items of the format the rule can fire on\n');

const authored: Record<Format, number> = { choice: 0, completion: 0, matching: 0 };
for (const b of LEDGER)
  for (const [f, n] of Object.entries(b.items)) authored[f as Format] += n;

const fired: Record<Format | 'blind', number> = { choice: 0, completion: 0, matching: 0, blind: 0 };
const byRule: Record<string, number> = {};
for (const b of LEDGER)
  for (const [reason, n] of Object.entries(b.reasons)) {
    const f = formatOf(reason);
    fired[f ?? 'blind'] += n;
    byRule[reason] = (byRule[reason] ?? 0) + n;
  }

console.log('   format      items authored   rules that CAN fire   firings   per 100 items');
console.log('   ' + '-'.repeat(74));
// Counted from the gate's own rule list, not written down beside it. This is
// the structural half of the finding and it must not be able to go stale: a
// rule added to `gate.ts` changes this table on the next run.
const RULES_PER_FORMAT: Record<Format, number> = { choice: 0, completion: 0, matching: 0 };
for (const id of Object.keys(RULES)) { const f = formatOf(id); if (f) RULES_PER_FORMAT[f] += 1; }
for (const f of ['choice', 'completion', 'matching'] as Format[]) {
  const per = authored[f] === 0 ? '—' : ((fired[f] / authored[f]) * 100).toFixed(1);
  console.log(
    `   ${f.padEnd(12)}${String(authored[f]).padStart(9)}${String(RULES_PER_FORMAT[f]).padStart(22)}${String(fired[f]).padStart(11)}${per.padStart(15)}`,
  );
}
console.log('   ' + '-'.repeat(74));
console.log(`   ${'format-blind'.padEnd(12)}${'—'.padStart(9)}${'—'.padStart(22)}${String(fired.blind).padStart(11)}\n`);

const leaks = (byRule['options.key-is-conspicuously-longest'] ?? 0) + (byRule['options.key-lifted-from-passage'] ?? 0);
console.log(`   ${fired.choice} firings, and ${leaks} of them are two rules saying the same thing:\n`);
for (const [r, n] of Object.entries(byRule).filter(([r]) => formatOf(r) === 'choice').sort((a, b) => b[1] - a[1]))
  console.log(`     ${String(n).padStart(3)}  ${r}`);
console.log('\n   Both are the KEY GIVING ITSELF AWAY — it is the longest option, or it');
console.log('   repeats six words of the passage. Neither can exist without distractors, and');
console.log('   the third rule (an option and its negation in one list) cannot either.');
console.log(`   Completion authored ${authored.completion} items and fired NOTHING, because its four rules ask`);
console.log('   whether the item is well formed (is there a gap, is the answer said, is it');
console.log('   inside the exam’s three-word cap), not whether it can be guessed. There is');
console.log('   nothing to guess from.\n');

// ── 3 ──────────────────────────────────────────────────────────────────────
// And the thing that would have been missed by answering only the question
// asked: listening's refusals were almost all format-blind.
console.log('3. WHERE THE REFUSALS ACTUALLY CAME FROM, reading against listening\n');
const skillOf = (b: typeof LEDGER[number]) => (b.sectionId === 'reading' ? 'reading' : 'listening');
for (const skill of ['reading', 'listening'] as const) {
  const g = LEDGER.filter((b) => skillOf(b) === skill);
  const s = g.reduce((n, b) => n + b.submitted, 0);
  const a = g.reduce((n, b) => n + b.accepted, 0);
  let itemLevel = 0, passageLevel = 0, unattr = 0;
  for (const b of g) {
    unattr += b.unattributed;
    for (const [reason, n] of Object.entries(b.reasons)) (formatOf(reason) === null ? (passageLevel += n) : (itemLevel += n));
  }
  console.log(`   ${skill.toUpperCase()}   ${s - a} of ${s} candidates refused   ${pct(s - a, s)}`);
  console.log(`      item-format rules       ${String(itemLevel).padStart(3)} firings`);
  console.log(`      passage-level rules     ${String(passageLevel).padStart(3)} firings   (veto, duplicate — format-blind)`);
  if (unattr) console.log(`      not written down        ${String(unattr).padStart(3)} candidates`);
  console.log('');
}

console.log('   THE SECOND FINDING, AND IT IS THE ONE THAT COSTS MONEY LATER.\n');
const lis = grp((b) => b.sectionId === 'listening'), rea = grp((b) => b.sectionId === 'reading');
console.log(`   Listening refused ${lis.r} of ${lis.s} and NOT ONE of those refusals was an item defect.`);
console.log('   Four were the veto and one a near-duplicate script — all of them judgements');
console.log(`   about the PASSAGE. Reading refused ${rea.r} of ${rea.s}, and ${fired.choice} of its firings were item`);
console.log('   defects, in a bank where every item is a choice.\n');
console.log('   So the two skills fail for different reasons, and switching format only');
console.log('   fixes one of them. A spoken script sits awkwardly against an envelope built');
console.log('   from written anchors at the same band: a dialogue’s turns are short and its');
console.log('   words are plain, and the C1 floor of 11.0 mean sentence words refused two');
console.log('   scripts that a listener would have called demanding. That is the next thing');
console.log('   to measure — whether listening needs its own envelope rather than borrowing');
console.log('   reading’s — and it is not solved by choosing completion.\n');

console.log('WHAT THIS MEANS FOR THE NEXT BANK\n');
console.log('  · Prefer completion where the exam permits it. Not because it is easier, but');
console.log(`    because it removes the ${RULES_PER_FORMAT.choice} rules that produced all ${fired.choice} item-level firings here.`);
console.log('  · Where the exam sets choice — TCF is choice throughout, all 100 items — the');
console.log('    rate stands, and the budget must carry a second authoring pass on about');
console.log('    half of what is written.');
console.log('  · The rate rises with the band. C2 refused 3 of 3 on the key-longest rule');
console.log('    alone: a long passage invites a long correct answer. Budget the top of the');
console.log('    ladder at a worse rate than the bottom, not the average.');
console.log('  · And it is REWORK. Every refused candidate was repaired and admitted. The');
console.log('    cost is author time on a second pass, not a discarded item.\n');
