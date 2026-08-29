/**
 * Item hygiene for the comprehension bank.
 *
 *   npx tsc src/exam/engine/items.check.ts --outDir /tmp/it --module commonjs \
 *     --target es2020 --moduleResolution node --skipLibCheck --esModuleInterop
 *   node /tmp/it/exam/engine/items.check.js
 *
 * The gate checks what a CANDIDATE writes. Nothing until now checked what
 * WE wrote, and a multiple-choice bank has failure modes of its own that no
 * amount of good French prevents:
 *
 *  - **The longest option is the answer.** The commonest tell in the trade,
 *    because a correct option has to be precise and a distractor only has to
 *    be wrong. A candidate who notices it scores above chance in a language
 *    they cannot read.
 *  - **The key sits in the same position** more often than chance.
 *  - **Two options mean the same thing**, so both must be wrong, and the
 *    item is really a two-way choice.
 *  - **A distractor repeats the passage's wording** while the key
 *    paraphrases, which rewards matching rather than understanding.
 *
 * None of these is detectable by reading one item. All are detectable by
 * counting across the bank, which is what this does.
 */
import { TCF_CANADA } from '../definitions/tcf-canada';
import type { ComprehensionSection } from '../model/types';
import { segmentationFor, tokenSet, words } from './text';
import { isChoiceItem, isCompletionItem } from '../model/types';

const SEG = segmentationFor(TCF_CANADA.locale);
const pad = (s: string, n: number) => (s + ' '.repeat(n)).slice(0, n);
const pct = (a: number, b: number) => (b ? ((a / b) * 100).toFixed(1) + '%' : '—');

const sections = TCF_CANADA.sections.filter(
  (s): s is ComprehensionSection => s.kind === 'comprehension',
);

let hard = 0;
const soft: string[] = [];

for (const sec of sections) {
  const items = sec.items;
  // The material moved to `recordings` on 2026-08-29 (see the model). Where a
  // check reads the passage or the family, it reads the recording the
  // question is asked about.
  const recOf = (it: { recordingId: string }) =>
    sec.recordings.find((r) => r.id === it.recordingId);
  // The tendency analyses below — the length tell, key position, the echo —
  // are all about four options and a key index. They are computed over the
  // CHOICE items only, and the denominator says so: a section that is half
  // typed answers would otherwise look as though its keys had drifted to
  // position A when in fact half its items have no position at all.
  const choiceItems = items.filter(isChoiceItem);
  console.log(`\n${'='.repeat(84)}\n${sec.id} — ${items.length} items` +
    (choiceItems.length === items.length ? '' : `  (${choiceItems.length} choice, ${items.length - choiceItems.length} completion)`));

  // ── structural, per item. These are defects, not tendencies. ──────────
  for (const it of items) {
    const p: string[] = [];
    // The option checks belong to choice items. A completion item has no
    // options by construction, and reporting "0 options" for one would be this
    // check misreading the model rather than finding a defect.
    if (isChoiceItem(it)) {
      if (it.options.length !== 4) p.push(`${it.options.length} options`);
      if (it.answer < 0 || it.answer >= it.options.length) p.push('answer out of range');
      if (new Set(it.options.map((o) => o.trim().toLowerCase())).size !== it.options.length)
        p.push('duplicate options');
    } else if (isCompletionItem(it)) {
      if (!it.answer.accept.length) p.push('no accepted answer');
      if (!it.prompt.includes('___')) p.push('no gap in the prompt');
      if (it.answer.accept.some((a) => a.trim().split(/\s+/).length > it.answer.maxWords))
        p.push('an accepted form breaks its own word cap');
    } else {
      const g = sec.matchingGroups?.find((x) => x.id === it.groupId);
      if (!g) p.push('names a matching group that does not exist');
      else if (!g.options.some((o) => o.id === it.answer)) p.push('key is not one of the group\'s options');
    }
    if (!recOf(it)?.family) p.push('no family');
    if (!it.rationale) p.push('no rationale');
    if (!it.stem.trim().endsWith('?') && !it.stem.trim().endsWith(':')) p.push('stem is not a question');
    if (p.length) { hard += p.length; console.log(`  ✗ ${it.id}: ${p.join(', ')}`); }
  }

  // ── the length tell ──────────────────────────────────────────────────
  let longest = 0, shortest = 0;
  for (const it of choiceItems) {
    const lens = it.options.map((o) => words(o, SEG).length);
    const max = Math.max(...lens), min = Math.min(...lens);
    if (lens[it.answer] === max && lens.filter((l) => l === max).length === 1) longest += 1;
    if (lens[it.answer] === min && lens.filter((l) => l === min).length === 1) shortest += 1;
  }
  console.log(`  key is the single LONGEST option : ${pad(String(longest), 4)} of ${choiceItems.length}  (${pct(longest, choiceItems.length)}, chance 25%)`);
  console.log(`  key is the single SHORTEST option: ${pad(String(shortest), 4)} of ${choiceItems.length}  (${pct(shortest, choiceItems.length)}, chance 25%)`);
  if (choiceItems.length && longest / choiceItems.length > 0.4) soft.push(`${sec.id}: the longest option is the key ${pct(longest, choiceItems.length)} of the time — a candidate can score above chance without reading the passage`);
  if (choiceItems.length && shortest / choiceItems.length > 0.4) soft.push(`${sec.id}: the shortest option is the key ${pct(shortest, choiceItems.length)} of the time`);

  // ── position ─────────────────────────────────────────────────────────
  const pos = [0, 0, 0, 0];
  for (const it of choiceItems) pos[it.answer] += 1;
  console.log(`  key position A/B/C/D          : ${pos.join(' / ')}   (even would be ${(choiceItems.length / 4).toFixed(1)} each)`);
  // A flat percentage bar is the wrong test and it let a real skew through:
  // 22 of 57 is 38.6%, under a 40% bar, and still 2.4 standard deviations
  // from chance. With n items and p = 1/4 the count has sd = sqrt(n·p·(1-p)),
  // so the question "is this more than luck" has an answer rather than a
  // preference. Two sd is the bar, which is about one false alarm in twenty.
  const sd = Math.sqrt(choiceItems.length * 0.25 * 0.75);
  const expected = choiceItems.length / 4;
  const z = (Math.max(...pos) - expected) / sd;
  console.log(`  worst position is ${z.toFixed(2)} sd from chance` + (z > 2 ? '   ← skewed' : ''));
  if (choiceItems.length && z > 2) soft.push(`${sec.id}: keys cluster in position ${'ABCD'[pos.indexOf(Math.max(...pos))]} — ${Math.max(...pos)} of ${choiceItems.length}, ${z.toFixed(2)} sd from chance. A candidate who always guesses it scores ${pct(Math.max(...pos), choiceItems.length)} instead of 25%`);

  // ── does a distractor echo the passage more than the key does? ────────
  let echo = 0;
  for (const it of choiceItems) {
    const src = tokenSet(recOf(it)?.script ?? '', SEG);
    const overlap = it.options.map((o) => {
      const w = words(o, SEG).map((x) => x.toLowerCase()).filter((x) => x.length > 3);
      return w.length ? w.filter((x) => src.has(x)).length / w.length : 0;
    });
    const max = Math.max(...overlap);
    if (overlap[it.answer] < max && max > 0) echo += 1;
  }
  console.log(`  a distractor echoes the passage more than the key: ${echo} of ${choiceItems.length} (${pct(echo, choiceItems.length)})`);
  console.log('  (not a defect — it is how a good item defeats word-matching — but a bank at 100% is testing matching in reverse)');

  // ── per family × level, the planner's own coordinate ──────────────────
  const grid = new Map<string, number>();
  // Counted in RECORDINGS: the planner's coordinate is a recording, because
  // that is what a candidate is served.
  for (const r of sec.recordings) grid.set(`${r.family}|${r.level}`, (grid.get(`${r.family}|${r.level}`) ?? 0) + 1);
  const empty = [...(sec.families ?? [])].flatMap((f) =>
    ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].filter((l) => (grid.get(`${f.id}|${l}`) ?? 0) < 4).map((l) => `${f.id}·${l}`),
  );
  console.log(`  coordinates under 4 items: ${empty.length}${empty.length ? ' — ' + empty.join(', ') : ''}`);
}

console.log('\n' + '='.repeat(84));
console.log(hard === 0 ? 'STRUCTURE: clean' : `STRUCTURE: ${hard} defect(s)`);
if (soft.length) { console.log('TENDENCIES worth a reviewer:'); for (const s of soft) console.log('  · ' + s); }
else console.log('TENDENCIES: nothing above the thresholds this check sets');
