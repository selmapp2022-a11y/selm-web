/**
 * THE REJECTION LEDGER — what was submitted, and what the layers refused.
 *
 * §B.2 of the authoring ruling is *"store the rejects' reasons, not the
 * rejects"*, and until now that was honoured only in the console: the runner
 * printed the reasons, the batch was repaired, and the reasons went into a
 * commit message. That worked exactly once — when the founder asked for the
 * reject rate broken down BY ITEM FORMAT, the numbers had to be mined back out
 * of `git log`, and one batch's breakdown could not be recovered at all
 * (see `unattributed` below).
 *
 * A number that has to be excavated is not a measurement. This file is the
 * record, and `format.run.ts` is the only thing that reads it.
 *
 * ── WHY THIS IS NOT WRITTEN AUTOMATICALLY ──────────────────────────────────
 * The runner cannot know whether a run is a FIRST PASS or a repair. Every
 * refused candidate in this project was repaired and resubmitted until it
 * passed, so a runner that overwrote its own ledger on each run would end with
 * a file saying nothing was ever refused. The rate that matters is the first
 * pass, and only the author knows which run that was. So the runner PRINTS a
 * paste-ready block and a person puts it here, once, deliberately.
 *
 * ── AND WHY THE RATE IS REWORK, NOT WASTE ──────────────────────────────────
 * Nothing here was discarded. A refusal costs a second pass by the author, not
 * a passage thrown away: smaller in money than the percentage looks, larger in
 * time than a waste rate would be.
 */

/** A rule id as the gate emits it, with its measurement stripped. */
export type ReasonId = string;

export type BatchRecord = {
  /** The batch file, without directory or extension. */
  batch: string;
  examId: string;
  sectionId: string;
  /** The commit the numbers below were taken from. */
  sha: string;
  /** Candidates put through `ingest` on the first pass. */
  submitted: number;
  /** Candidates that cleared all three layers on the first pass. */
  accepted: number;
  /**
   * Reasons, counted, as they fired on the FIRST pass. A candidate may raise
   * several; these are reason firings, not candidates.
   */
  reasons: Record<ReasonId, number>;
  /**
   * First-pass candidate refusals whose reason was not written down at the
   * time. Honest gaps, not zeroes: `submitted - accepted` is authoritative and
   * `reasons` is what is known about it.
   */
  unattributed: number;
  /**
   * Rules that fired BEFORE the first pass could be counted, because a
   * section-level declaration the items referred to did not exist yet. Not
   * authoring defects, and deliberately kept out of the rate.
   */
  precondition?: Record<ReasonId, number>;
  /** Item formats authored in this batch, counted. */
  items: Partial<Record<Format, number>>;
  note?: string;
};

export type Format = 'choice' | 'completion' | 'matching';

/**
 * Which format a gate rule can fire on. Derived from `gate.ts` by prefix, and
 * asserted against it in `ledger.check.ts` so this cannot drift.
 *
 * The asymmetry in this table is the whole finding of 31 August: a choice item
 * carries SIX rules that only exist because it has wrong answers to write, and
 * every one of them is about the key leaking. A completion item has nothing to
 * leak into.
 */
export const FORMAT_OF_PREFIX: Record<string, Format | null> = {
  'options': 'choice',
  'completion': 'completion',
  'matching': 'matching',
  // Format-blind: they judge the passage, the item set, or the paperwork.
  'passage': null,
  'items': null,
  'item': null,
  'provenance': null,
  'anchor': null,
  // A ROLLUP, and the only id here that the gate does not emit verbatim. The
  // veto names the measure and the envelope it fell outside of —
  // `meanSentenceWords:8.40 outside [11.01, 14.90]` — which is unique per
  // firing and so cannot be counted. The measurement stays in the batch's
  // `note`; the count stays here.
  'veto': null,
};

/** Ledger-only rollups: ids no layer emits verbatim. Kept honest by `ledger.check.ts`. */
export const ROLLUPS = new Set(['veto.outside-envelope']);

export const formatOf = (reason: ReasonId): Format | null => {
  const head = reason.split(/[.:(]/)[0];
  if (!(head in FORMAT_OF_PREFIX)) throw new Error(`ledger: unknown rule family "${head}" in "${reason}"`);
  return FORMAT_OF_PREFIX[head];
};

export const LEDGER: BatchRecord[] = [
  // ── IELTS reading · depth, four batches · 31 August ─────────────────────
  {
    batch: '2026-08-31-reading-notice',
    examId: 'ielts-gt', sectionId: 'reading', sha: '29937b2',
    submitted: 9, accepted: 3, unattributed: 0,
    reasons: {
      'options.key-lifted-from-passage': 4,
      'options.key-is-conspicuously-longest': 3,
      'veto.outside-envelope': 1,
    },
    items: { choice: 45 },
    note: 'A2 notice bracketed by the veto from both sides — too heavy (0.10/1.25), then too light (0.04/0.36). Third version sat inside.',
  },
  {
    batch: '2026-08-31-reading-correspondence',
    examId: 'ielts-gt', sectionId: 'reading', sha: '1f185c4',
    submitted: 12, accepted: 5, unattributed: 0,
    reasons: {
      'options.key-is-conspicuously-longest': 5,
      'options.key-lifted-from-passage': 2,
      'item.no-rationale': 2,
      'options.near-duplicate': 1,
      'veto.outside-envelope': 1,
    },
    items: { choice: 60 },
  },
  {
    batch: '2026-08-31-reading-informative',
    examId: 'ielts-gt', sectionId: 'reading', sha: 'ba78ad6',
    submitted: 15, accepted: 9, unattributed: 2,
    reasons: {
      'options.key-is-conspicuously-longest': 3,
      'veto.outside-envelope': 1,
    },
    items: { choice: 75 },
    note: 'By band: A1/A2 4 of 6, B1/B2 5 of 6, C2 0 of 3 — all three C2 on the same rule. The rate is a property of the BAND as well as of the process. Two refusals were not itemised at the time; see `unattributed`.',
  },
  {
    batch: '2026-08-31-reading-argued',
    examId: 'ielts-gt', sectionId: 'reading', sha: 'd308a7e',
    submitted: 6, accepted: 3, unattributed: 0,
    reasons: {
      'options.key-is-conspicuously-longest': 2,
      'options.key-lifted-from-passage': 1,
    },
    items: { choice: 45 },
  },

  // ── IELTS listening · depth, four batches · 31 August ────────────────────
  {
    batch: '2026-08-31-listening-part1',
    examId: 'ielts-gt', sectionId: 'listening', sha: 'e7532e7',
    submitted: 3, accepted: 3, unattributed: 0,
    reasons: {},
    items: { completion: 30 },
    note: 'The first batch in the project to clear on the first pass. Two things carried it: the rules from the four reading batches were in `instructions.ts` rather than in the author’s memory, and a form has no options to give the key away with.',
  },
  {
    batch: '2026-08-31-listening-part2',
    examId: 'ielts-gt', sectionId: 'listening', sha: '72c4be8',
    submitted: 3, accepted: 1, unattributed: 0,
    reasons: { 'veto.outside-envelope': 2 },
    precondition: { 'matching.no-such-group': 15 },
    items: { matching: 15, completion: 15 },
    note: 'The 15 matching firings are a missing section-level declaration, not fifteen bad items: a matching key is validated against the section’s banks and the banks did not exist yet. Data before content.',
  },
  {
    batch: '2026-08-31-listening-part3',
    examId: 'ielts-gt', sectionId: 'listening', sha: '535e71d',
    submitted: 3, accepted: 0, unattributed: 0,
    reasons: {
      'passage.duplicate-of': 1,
      'veto.outside-envelope': 2,
    },
    items: { matching: 18, choice: 12 },
    note: 'Both veto refusals were for being too SIMPLE at C1 — 8.4 and 9.3 mean sentence words against a floor of 11.0. A dialogue has short turns by nature; at C1 the turns that CARRY the argument are not short.',
  },
  {
    batch: '2026-08-31-listening-part4',
    examId: 'ielts-gt', sectionId: 'listening', sha: '50cf467',
    submitted: 3, accepted: 3, unattributed: 0,
    reasons: {},
    items: { completion: 30 },
    note: 'Three C1 lectures, ten completion items each. Cleared on the first pass, like Part 1 and unlike everything in between.',
  },
];
