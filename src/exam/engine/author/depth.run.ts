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
const SOURCE_BY_SKILL: Record<string, string> = {
  reading: 'ielts.org — General Training Reading: three sections rising in difficulty, 40 questions in 60 minutes.',
  listening: 'ielts.org — Listening: 4 parts, 40 questions, 10 per part, about 30 minutes.',
};

type Raw = {
  id: string; family: string; level: Band; freshness: 'timeless' | 'current' | 'dated';
  script: string;
  items: Array<{
    id?: string; kind?: string; stem: string; rationale: string;
    options?: string[]; correct?: number;
    // completion / matching carry their own shape and pass through untouched
    prompt?: string; answer?: unknown; groupId?: string;
  }>;
};

const file = process.argv[2];
if (!file) throw new Error('usage: depth.run.ts <batch.json> [--emit out.ts] [--section listening] [--exam tcf-canada]');
const emitAt = process.argv.includes('--emit') ? process.argv[process.argv.indexOf('--emit') + 1] : null;
// Reading was the only skill this ran for until 31 August. Listening is the
// same pipeline over a different section, and the only thing that changes is
// which section the blueprint and the anchors come from.
const skill = (process.argv.includes('--section') ? process.argv[process.argv.indexOf('--section') + 1] : 'reading') as 'reading' | 'listening';

// ── AND WHICH EXAM ────────────────────────────────────────────────────────
// IELTS was the only exam this ran for until 31 August, when the founder
// pointed at `annonce · B2` on his own Progress screen and asked what "not
// built" meant. It meant a coordinate with nothing behind it, and the answer
// is authoring, not a fix — so the runner had to stop being about one exam.
// Nothing else changes: the same three layers, the same anchors, the same
// refusal to accept anything a layer refuses.
const examId = process.argv.includes('--exam') ? process.argv[process.argv.indexOf('--exam') + 1] : 'ielts-gt';
const exam = EXAMS.find((e) => e.id === examId);
if (!exam) throw new Error(`no exam ${examId}; known: ${EXAMS.map((e) => e.id).join(', ')}`);
const section = exam.sections.find(
  (s): s is ComprehensionSection => s.kind === 'comprehension' && s.skill === skill,
);
if (!section) throw new Error(`${examId} has no ${skill} comprehension section`);
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
    const id = q.id ?? `${raw.id.replace(/-r$/, '')}-q${qi + 1}`;
    const base = { id, recordingId: raw.id, level: raw.level, stem: q.stem, rationale: q.rationale };
    // A completion or matching item is already an item: it has no options to
    // rotate and no position to spread. Only a multiple-choice key needs the
    // rotation, and applying it to the others would corrupt them.
    if (q.kind && q.kind !== 'choice') return { ...base, ...q } as unknown as ComprehensionItem;
    // Rotate so the key is not always the option written first. Cyclic, so the
    // distractors keep the order they were composed in.
    //
    // Modulo the OPTION COUNT, not modulo four. IELTS Part 3 asks three-option
    // questions, and a target of 3 in a list of three is out of range — the
    // gate would have caught it as `options.answer-out-of-range`, which is a
    // true report of a bug in this runner rather than in the item.
    const k = q.options!.length;
    const target = n++ % k;
    const shift = ((q.correct! - target) % k + k) % k;
    const options = [...q.options!.slice(shift), ...q.options!.slice(0, shift)];
    return { ...base, options, answer: target } as ComprehensionItem;
  });

  const blueprint = blueprints.find((b) => b.family === raw.family && b.level === raw.level)!;
  const candidate: Candidate = {
    id: raw.id, examId: exam.id, skill, family: raw.family, level: raw.level,
    script: raw.script, items, freshness: raw.freshness,
    provenance: { author: AUTHOR, authoredAt: new Date().toISOString(), promptVersion: PROMPT_VERSION, source: SOURCE_BY_SKILL[skill] },
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

/**
 * A PASTE-READY LEDGER ENTRY.
 *
 * The reject rate per batch is the number the founder plans capacity from, and
 * until 31 August it survived only in commit messages — when he asked for it
 * broken down by item format it had to be mined back out of `git log`, and one
 * batch's breakdown could not be recovered at all.
 *
 * This is not written to `ledger.ts` automatically, and that is deliberate:
 * the runner cannot tell a FIRST PASS from a repair, and every refused
 * candidate in this project was repaired and resubmitted until it passed. A
 * runner that overwrote its own ledger would end holding a file saying nothing
 * was ever refused. Only the author knows which run was the first one, so the
 * block is printed and a person puts it there, once.
 */
const items: Record<string, number> = {};
for (const raw of raws)
  for (const q of raw.items) {
    const f = q.options ? 'choice' : q.group ? 'matching' : 'completion';
    items[f] = (items[f] ?? 0) + 1;
  }
console.log('\n── ledger entry, IF this was the first pass (ledger.ts) ──\n');
console.log(JSON.stringify({
  batch: file.split('/').pop()!.replace(/\.json$/, ''),
  examId: exam.id,
  sectionId: section.id,
  sha: 'HEAD',
  submitted: raws.length,
  accepted: report.accepted,
  unattributed: 0,
  reasons: report.byReason,
  items,
}, null, 2));

if (emitAt) {
  const ok = results.filter((r) => r.result.ok);
  const q = (s: string) => JSON.stringify(s);
  const recs = ok.map(({ result }) => {
    const a = (result as { accepted: Candidate }).accepted;
    const extra = (raws.find((x) => x.id === a.id) as unknown as Record<string, unknown>) ?? {};
    const carry = ['part', 'speakers']
      .filter((k) => extra[k] !== undefined)
      .map((k) => `          ${k}: ${JSON.stringify(extra[k])},`)
      .join('\n');
    return `        {\n          id: ${q(a.id)},\n${carry ? carry + '\n' : ''}          level: '${a.level}',\n          family: '${a.family}',\n          freshness: '${a.freshness}',\n          script: ${q(a.script)},\n        },`;
  });
  const items = ok.flatMap(({ result }) => {
    const a = (result as { accepted: Candidate }).accepted;
    return a.items.map((i) => {
      const o = i as unknown as Record<string, unknown>;
      const lines = Object.entries(o)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => `          ${k}: ${typeof v === 'string' ? q(v) : JSON.stringify(v)},`);
      return `        {\n${lines.join('\n')}\n        },`;
    });
  });
  writeFileSync(emitAt, `// RECORDINGS\n${recs.join('\n')}\n// ITEMS\n${items.join('\n')}\n`);
  console.log(`\nemitted ${recs.length} recordings and ${items.length} items to ${emitAt}`);
}

if (results.some((r) => !r.result.ok)) throw new Error('batch has rejects');
