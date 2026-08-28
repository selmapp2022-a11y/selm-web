/**
 * The prescription catalogue — shapes only.
 *
 * THE PLAN calls this "the fifth differentiator": every competitor returns a
 * mark and a "try again" button, and none of them says what specific thing
 * closes that specific gap. The diagnostic half of this is already built —
 * four official criteria per task, six deterministic gate rules, 78
 * `rationale` fields. The prescription half was empty and nothing connected
 * them. This file is the connector.
 *
 * Same discipline as `types.ts`: nothing here names an exam, a task, a
 * language or a level. A concrete cell is data of these types and lives in
 * `definitions/prescriptions/*.ts`.
 *
 * The unit is a CELL: one coordinate `(exam, task, benchmark level)`, one
 * named failure mode, one prescription, and the practice that forces the
 * prescribed move. Everything is built one cell at a time and a coordinate
 * with no cell says so out loud — Amendment 1 §6: a visible gap is a better
 * failure than a plausible generic answer.
 */
import type { Localised } from './types';

/** Where a cell sits. `level` is on the exam's own benchmark system. */
export type Coordinate = {
  examId: string;
  taskId: string;
  level: number;
};

/**
 * Evidence a detector produces. Deliberately a measured number and the
 * threshold it was compared against, never a verdict on its own — so the
 * candidate, and the reviewer, can see WHY it fired.
 */
export type Signal = {
  id: string;
  label: Localised;
  measured: number;
  threshold: number;
  /** True when this signal is pointing at the failure. */
  tripped: boolean;
};

/**
 * A named way of losing marks on one task, at one level.
 *
 * The distinction from a gate rule matters and is the reason this is a
 * separate layer: a gate rule fires on a response the exam would refuse to
 * mark at all. A failure mode fires on a response the exam WILL mark, and
 * mark low. The gate says "this scores zero". This says "this scores 8 when
 * you need 10, and here is the reason".
 */
export type FailureMode = {
  id: string;
  at: Coordinate;
  name: Localised;
  /** What the response looks like, in the candidate's own terms. */
  looksLike: Localised;
  /** Which official criterion it costs marks under. */
  criterionId: string;
  /**
   * Why it caps the mark where it does. Written for the candidate, and it
   * is the sentence that has to survive §2.3's honesty rule: it may name a
   * criterion only because WE measured it here, never because an
   * attestation implied it.
   */
  whyItCaps: Localised;
};

/**
 * The fix. One structural move, the language that move needs at this level,
 * and a worked before/after — not a lesson, not a topic, not a level.
 */
export type Prescription = {
  failureModeId: string;
  /** The single move. One sentence. If it needs two, it is two cells. */
  move: Localised;
  /**
   * The language the move needs, at this level and no higher. Kept short on
   * purpose: a B1 candidate handed twelve connectives uses none of them.
   */
  language: Array<{ pattern: Localised; use: Localised }>;
  worked: {
    before: string;
    after: string;
    /** What changed, and nothing else changed. */
    difference: Localised;
  };
};

/** One coordinate, fully served. */
export type PrescriptionCell = {
  at: Coordinate;
  failureMode: FailureMode;
  prescription: Prescription;
  /** Ids of the practice items that force the prescribed move. */
  practiceItemIds: string[];
};

/** What a detector returns for one response. */
export type Diagnosis = {
  failureModeId: string;
  fired: boolean;
  signals: Signal[];
};
