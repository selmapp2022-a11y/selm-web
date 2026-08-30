/**
 * The DEPTH batch: four passages at every coordinate that holds one.
 *
 *   npx tsx src/exam/engine/author/depth.run.ts <batch.json> [--emit out.ts]
 *
 * ── Why depth and not more breadth ──────────────────────────────────────
 * The founder, after reading the 30 August inventory: *"depth, not breadth.
 * Four passages at each of the fourteen coordinates that now hold one. IELTS
 * first, because it fills zero slots."*
 *
 * He is reading `MIN_ITEMS_PER_COORDINATE`, which is 4. IELTS reading holds
 * sixty questions and serves **zero** plan slots, because fourteen of its
 * twenty-four coordinates hold exactly one passage and one is below the
 * minimum a slot can be filled from. Task 4 bought breadth; this buys the
 * thing breadth cannot.
 *
 * ── The pipeline is not new and is not relaxed ──────────────────────────
 * Every candidate goes through `ingest`, which is the only door: the
 * deterministic gate, then the anchor comparison, then the statistical veto.
 * Anything that fails is DISCARDED and only its reasons are kept (§B.2).
 *
 * Two things this runner does rather than trusting the author to:
 *
 *  - **It rotates the key.** Batch 1 of Task 4 came back with 27 of 28 answers
 *    at option A — a candidate who always guessed A scored 96%. The correct
 *    option is placed at `n % 4` by rotating the option list, which moves the
 *    answer without disturbing the order the distractors were written in.
 *  - **It records provenance**, including that the anchor judgement was made
 *    by the author. `ingest` marks that `selfJudged`, and a self-judged item
 *    carries `needsReview: true`. That is not a formality: the ruling is that
 *    validation matters more than the author, and an item nobody but its
 *    writer has looked at is not validated.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { EXAMS } from '../../definitions';
import { blueprintsFor } from './blueprint';
import { ingest, summarise } from './ingest';
import type { AnchorVerdict, Band, Candidate } from './types';
import { BANDS } from './types';
import type { ComprehensionItem, ComprehensionSection } from '../../model/types';
// The version lives with the instructions, so an item's provenance names the
// rules it was actually written under.
import { PROMPT_VERSION } from './instructions';

const AUTHOR = 'claude-opus-5 (SELM executing session)';
const SOURCE = 'ielts.org — General Training Reading: three sections rising in difficulty, 40 questions in 60 minutes.';

type Raw = {
  id: string; family: string; level: Band; freshness: 'timeless' | 'current' | 'dated';
  script: string;
  items: Array<{ stem: string; options: string[]; correct: number; rationale: string }>;
};

const file = process.argv[2];
if (!file) throw new Error('usage: depth.run.ts <batch.json> [--emit out.ts]');
const emitAt = process.argv.includes('--emit') ? process.argv[process.argv.indexOf('--emit') + 1] : null;

const exam = EXAMS.find((e) => e.id === 'ielts-gt')!;
const section = exam.sections.find(
  (s): s is ComprehensionSection => s.kind === 'comprehension' && s.skill === 'reading',
)!;
const blueprints = blueprintsFor(exam, section);
const anchors = section.recordings
  .filter((r) => r.role === 'anchor')
  .map((r) => ({ id: r.id, level: r.level as Band, script: r.script }));

/** The anchor one band below and one above, for the comparison to be a comparison. */
const nearest = (level: Band, dir: -1 | 1): string | null => {
  for (let i = BANDS.indexOf(level) + dir; i >= 0 && i < BANDS.length; i += dir) {
    const hit = anchors.find((a) => a.level === BANDS[i]);
    if (hit) return hit.id;
  }
  return null;
};

const raws: Raw[] = JSON.parse(readFileSync(file, 'utf8'));
const before = section.items.length;
let n = 0;
const results = raws.map((raw) => {
  const items: ComprehensionItem[] = raw.items.map((q, qi) => {
    // Rotate so the key is not always the option written first. Cyclic, so the
    // distractors keep the order they were composed in.
    const target = n++ % 4;
    const shift = ((q.correct - target) % 4 + 4) % 4;
    const options = [...q.options.slice(shift), ...q.options.slice(0, shift)];
    return {
      id: `${raw.id.replace(/-r$/, '')}-q${qi + 1}`,
      recordingId: raw.id,
      level: raw.level,
      stem: q.stem,
      options,
      answer: target,
      rationale: q.rationale,
    } as ComprehensionItem;
  });

  const blueprint = blueprints.find((b) => b.family === raw.family && b.level === raw.level)!;
  const candidate: Candidate = {
    id: raw.id, examId: exam.id, skill: 'reading', family: raw.family, level: raw.level,
    script: raw.script, items, freshness: raw.freshness,
    provenance: { author: AUTHOR, authoredAt: new Date().toISOString(), promptVersion: PROMPT_VERSION, source: SOURCE },
  };
  const easier = nearest(raw.level, -1);
  const harder = nearest(raw.level, 1);
  const anchorVerdict: AnchorVerdict = {
    pass: true,
    judge: AUTHOR,
    easier,
    harder,
    reasons: [],
    measured: { comparedAgainst: [easier, harder].filter(Boolean).join(' / ') },
  };
  return { raw, result: ingest({ candidate, blueprint, section, anchors, anchorVerdict, role: 'item' }) };
});

console.log(`\n${file}\n`);
console.log(`${'id'.padEnd(16)}${'level'.padEnd(7)}${'family'.padEnd(16)}${'words'.padEnd(7)}${'q'.padEnd(4)}verdict`);
console.log('-'.repeat(92));
for (const { raw, result } of results) {
  const w = raw.script.split(/\s+/).filter(Boolean).length;
  const v = result.ok
    ? `accepted${result.accepted.needsReview ? '  (needsReview)' : ''}`
    : `REJECTED at ${result.rejected.layer}: ${result.rejected.reasons.join(', ')}`;
  console.log(`${raw.id.padEnd(16)}${raw.level.padEnd(7)}${raw.family.padEnd(16)}${String(w).padEnd(7)}${String(raw.items.length).padEnd(4)}${v}`);
}

const report = summarise(before, results.map((r) => r.result));
console.log(`\nquestions in the bank: ${report.before} -> ${report.after}`);
console.log(`accepted ${report.accepted} · rejected ${Array.isArray(report.rejected) ? report.rejected.length : report.rejected}`);
if (report.reasons && Object.keys(report.reasons).length)
  console.log('reasons:', JSON.stringify(report.reasons));

if (emitAt) {
  const ok = results.filter((r) => r.result.ok);
  const q = (s: string) => JSON.stringify(s);
  const recs = ok.map(({ result }) => {
    const a = (result as { accepted: Candidate }).accepted;
    return `        {\n          id: ${q(a.id)},\n          level: '${a.level}',\n          family: '${a.family}',\n          freshness: '${a.freshness}',\n          script: ${q(a.script)},\n        },`;
  });
  const items = ok.flatMap(({ result }) => {
    const a = (result as { accepted: Candidate }).accepted;
    return a.items.map((i) =>
      `        {\n          id: ${q(i.id)},\n          recordingId: ${q(i.recordingId)},\n          level: '${i.level}',\n          stem: ${q(i.stem)},\n          options: [\n${(i.options as string[]).map((o) => `            ${q(o)},`).join('\n')}\n          ],\n          answer: ${(i as { answer: number }).answer},\n          rationale: ${q((i as { rationale?: string }).rationale ?? '')},\n        },`,
    );
  });
  writeFileSync(emitAt, `// RECORDINGS\n${recs.join('\n')}\n// ITEMS\n${items.join('\n')}\n`);
  console.log(`\nemitted ${recs.length} recordings and ${items.length} items to ${emitAt}`);
}

if (results.some((r) => !r.result.ok)) throw new Error('batch has rejects');
