/**
 * What an authored item is, before it is allowed to be part of the bank.
 *
 * TASK 4 §B.2 names the pipeline and it is not negotiable:
 *
 *     author against the coordinate's blueprint
 *      → deterministic gate
 *      → anchor comparison (harder than A, easier than B)
 *      → statistical veto
 *      → store WITH PROVENANCE, or discard with the reason logged
 *
 * The ruling of 2026-08-29 added the sentence that decides how this file is
 * shaped: **"validation matters more than the author. An item that passes all
 * three layers is good, and one that does not is bad, even if the most
 * expensive model wrote it."**
 *
 * So a `Candidate` is not an item. It is an application to become one, and
 * `Accepted` is the only type the bank will take — it cannot be constructed
 * without the three verdicts, because a type with no field for the thing is
 * a guarantee where a rule in a document is a hope (the same discipline as
 * `calibration.ts` and `attestation.ts`).
 */
import type { ComprehensionItem, Recording } from '../../model/types';

export type Band = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export const BANDS: Band[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

/**
 * PART D. Recorded per item so the annual refresh can find aged framing
 * without re-reading the bank.
 *
 *  - `timeless`   — would have read the same in 2015 and will in 2035. The
 *                   doc calls this the stock content of the market and is
 *                   right to reject a bank made only of it.
 *  - `current`    — could have been written this year: remote work, apps,
 *                   delivery, climate adaptation. What the bank should mostly
 *                   be.
 *  - `dated`      — needs something from a particular year to make sense.
 *                   The gate refuses these; the value exists so a refresh can
 *                   name one that slipped through.
 */
export type Freshness = 'timeless' | 'current' | 'dated';

export type LayerVerdict = {
  pass: boolean;
  /**
   * True when the layer did not run rather than ran and passed.
   *
   * `pass: true, skipped: true` is not a pass and must not be reported as one.
   * A statistical veto on a passage of eight words, or on a band whose
   * neighbours are empty, has nothing to measure — and a record that cannot
   * distinguish "checked and sound" from "never checked" is the record this
   * codebase refuses everywhere else, from `stability.ts` to `calibration.ts`.
   */
  skipped?: boolean;
  /** Rule ids that fired, empty when it passed. */
  reasons: string[];
  /** Measurements worth keeping whether or not anything fired. */
  measured?: Record<string, number | string>;
};

/**
 * The record of the anchor comparison. It is a JUDGEMENT, so it names who
 * made it and against which two anchors, and it is stored rather than
 * recomputed — a judgement re-derived later by a different judge is a
 * different judgement wearing the same field name.
 */
export type AnchorVerdict = LayerVerdict & {
  judge: string;
  /** The anchor one band below, and one above. Either may be absent at the ends. */
  easier: string | null;
  harder: string | null;
};

export type AuthorProvenance = {
  /** Who wrote it. Never inferred, never blank. */
  author: string;
  authoredAt: string;
  /** Bumped whenever the authoring instructions change, so drift is findable. */
  promptVersion: string;
  /** The specification the item was built from. NEVER a real exam paper (§C). */
  source: string;
};

export type Candidate = {
  id: string;
  examId: string;
  skill: 'reading' | 'listening';
  family: string;
  level: Band;
  /** The passage, or the script of the recording. */
  script: string;
  items: ComprehensionItem[];
  freshness: Freshness;
  provenance: AuthorProvenance;
};

/** A candidate that cleared all three layers. Only this may enter the bank. */
export type Accepted = Candidate & {
  layers: { gate: LayerVerdict; anchor: AnchorVerdict; veto: LayerVerdict };
};

/** A candidate that did not. The reasons are kept; the item is not (§B.2). */
export type Rejected = {
  id: string;
  examId: string;
  skill: string;
  family: string;
  level: Band;
  layer: 'gate' | 'anchor' | 'veto';
  reasons: string[];
  at: string;
};

export const bandIndex = (b: string): number => BANDS.indexOf(b as Band);

/** The recording an accepted candidate becomes, once it is in the bank. */
export type AcceptedRecording = Recording & { freshness: Freshness };
