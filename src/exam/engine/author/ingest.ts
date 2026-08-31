/**
 * The only door into the bank.
 *
 * Runs the three layers in §B.2's order and returns an `Accepted` or a
 * `Rejected`. Nothing else may construct an `Accepted`, so "was this checked"
 * is answered by the type rather than by remembering.
 *
 * ── The conflict this file refuses to hide ──────────────────────────────
 *
 * The ruling of 2026-08-29 put the authoring in this session's hands, on the
 * reasoning that **the validation matters more than the author**. That
 * reasoning is sound and it has one hole, which is this: layer 2 is a
 * JUDGEMENT — *harder than A, easier than B* — and when the judge is also the
 * author, an item is marking its own homework.
 *
 * The hole is not closed by pretending otherwise, and it is not closed by
 * refusing to run: layer 1 is deterministic, layer 3 is arithmetic against a
 * FIXED anchor set the author cannot move, and between them they catch the
 * failures a self-judging author would wave through — the band that drifts,
 * the passage that repeats, the key that is the longest option.
 *
 * What is done instead is to RECORD it. `selfJudged` is set whenever the judge
 * and the author are the same, and the addendum's 5% review sample is drawn
 * from those first. A reviewer who is told which items marked their own
 * homework can spend their thirty-two hours where the risk is; one who is not
 * told spends them uniformly and finds less.
 */
import type { ComprehensionSection } from '../../model/types';
import type { Blueprint } from './blueprint';
import { runGate } from './gate';
import { runVeto, type Anchor } from './veto';
import type { Accepted, AnchorVerdict, Candidate, Rejected } from './types';

/**
 * What this candidate is for, and it changes what can be asked of it.
 *
 * ── Why this distinction had to exist ───────────────────────────────────
 *
 * It fell out of the check rather than being designed. Layer 3 measures a
 * passage against the anchors at the bands either side of it — and the anchors
 * for IELTS reading are six placeholders of 16 to 45 words. Measured against
 * those, the FIRST honest passage at exam length is "too complex" at every
 * band, and so is the second, and so is every one after.
 *
 * The instrument has to be built before it can measure. So the first batch of
 * a thin section is not items, it is the LADDER: one passage per band at the
 * length the exam sets, which becomes what everything afterwards is measured
 * against.
 *
 * An anchor therefore clears layers 1 and 2 and cannot clear layer 3, because
 * there is nothing yet to measure it against. **It is not recorded as having
 * passed a layer it never ran.** It is recorded as unmeasured and as needing
 * the human review the addendum buys — *"100% of the anchor items"* — which is
 * precisely the money's job, and precisely why anchors are the 100% and the
 * rest is a 5% sample.
 */
export type Role = 'anchor' | 'item';

export type IngestInput = {
  candidate: Candidate;
  blueprint: Blueprint;
  section: ComprehensionSection;
  anchors: Anchor[];
  /** Layer 2's recorded verdict. A judgement, made elsewhere, stored here. */
  anchorVerdict: AnchorVerdict;
  locale?: string;
  /** Defaults to `item`: the strict path, all three layers. */
  role?: Role;
};

export type IngestResult =
  | {
      ok: true;
      accepted: Accepted & {
        selfJudged: boolean;
        role: Role;
        /** True when a person must read it before it is trusted. */
        needsReview: boolean;
      };
    }
  | { ok: false; rejected: Rejected };

export function ingest(input: IngestInput): IngestResult {
  const { candidate: c, blueprint, section, anchors, anchorVerdict, locale } = input;
  const role: Role = input.role ?? 'item';
  const at = new Date().toISOString();
  const fail = (layer: Rejected['layer'], reasons: string[]): IngestResult => ({
    ok: false,
    rejected: { id: c.id, examId: c.examId, skill: c.skill, family: c.family, level: c.level, layer, reasons, at },
  });

  // Order matters and it is §B.2's, not a preference: the cheap deterministic
  // layer runs first so a malformed item never costs a judgement, and the
  // judgement runs before the arithmetic so a passage nobody thinks is at the
  // right band is not measured to three decimal places.
  const gate = runGate({ candidate: c, blueprint, section, locale });
  if (!gate.pass) return fail('gate', gate.reasons);

  if (!anchorVerdict.pass) return fail('anchor', anchorVerdict.reasons);
  // A verdict with no judge is not a verdict.
  if (!anchorVerdict.judge.trim()) return fail('anchor', ['anchor.no-judge']);
  // And a comparison against nothing is not a comparison. At the ends of the
  // ladder one side is legitimately absent; both cannot be — for an ITEM.
  //
  // For an anchor it can, and until 31 August that made an empty section
  // impossible to start: the first rung of a ladder has nothing above it and
  // nothing below it, so every candidate for it was refused at this line and
  // the section stayed empty for want of the instrument it was being asked to
  // provide. The rule is not relaxed for items, which is where it does work.
  // An anchor with nothing either side is still recorded as unmeasured by the
  // veto and still carries `needsReview: true`.
  if (role === 'item' && anchorVerdict.easier === null && anchorVerdict.harder === null)
    return fail('anchor', ['anchor.no-anchors-either-side']);

  // An anchor is measured too, and the measurement is KEPT — it is what the
  // next batch will be compared against. What differs is that failing it does
  // not reject: an anchor at a band whose neighbours are empty has nothing to
  // be outside of, and calling that a failure would make a bank impossible to
  // start.
  const veto = runVeto(c.script, c.level, anchors, locale);
  if (role === 'item' && !veto.pass) return fail('veto', veto.reasons);

  const selfJudged = anchorVerdict.judge.trim() === c.provenance.author.trim();
  return {
    ok: true,
    accepted: {
      ...c,
      layers: { gate, anchor: anchorVerdict, veto },
      selfJudged,
      role,
      // An anchor is read by a person before it is trusted, always: it becomes
      // the instrument, and an unread instrument measures every item after it.
      // An item is read when it marked its own homework.
      needsReview: role === 'anchor' || selfJudged,
    },
  };
}

/**
 * What a batch did, in the two numbers the founder asked for and the one the
 * doc asks for.
 *
 * *"Report the new number when each batch is done — not a long report, just
 * the number before and after."* And §B.2: *"store the rejects' reasons, not
 * the rejects."*
 */
export type BatchReport = {
  before: number;
  after: number;
  accepted: number;
  rejected: Rejected[];
  /** Rejection reasons, counted. The pattern is what shows a prompt drifting. */
  byReason: Record<string, number>;
  selfJudged: number;
  /** How many of the accepted need a person to read them before they are trusted. */
  needsReview: number;
  anchors: number;
};

export function summarise(before: number, results: IngestResult[]): BatchReport {
  const rejected = results.filter((r): r is Extract<IngestResult, { ok: false }> => !r.ok).map((r) => r.rejected);
  const accepted = results.filter((r): r is Extract<IngestResult, { ok: true }> => r.ok);
  const byReason: Record<string, number> = {};
  for (const r of rejected)
    for (const reason of r.reasons) {
      // Count the RULE, not the measurement it carried, or every reason is
      // unique and the pattern the count exists to show cannot appear.
      const key = reason.replace(/\(.*\)$/, '').replace(/:.*$/, (m) => (m.includes('outside') ? '' : m));
      byReason[key] = (byReason[key] ?? 0) + 1;
    }
  return {
    before,
    // Questions, not passages. `accepted.length` counts recordings, and a
    // recording carries ten questions: the line read "questions in the bank"
    // and moved by three when thirty had been written. Counting the thing the
    // label names is not a cosmetic fix — the number went into reports.
    after: before + accepted.reduce((n, a) => n + a.accepted.items.length, 0),
    accepted: accepted.length,
    rejected,
    byReason,
    selfJudged: accepted.filter((a) => a.accepted.selfJudged).length,
    needsReview: accepted.filter((a) => a.accepted.needsReview).length,
    anchors: accepted.filter((a) => a.accepted.role === 'anchor').length,
  };
}
