/**
 * Which variety each of the 16 IELTS Listening recordings is spoken in.
 *
 * The sister of `tcf-variety-plan.ts`, and DATA for the same reason: a
 * reviewer must be able to see at a glance that Scottish appears at B2 as well
 * as C1, which a computation would hide.
 *
 * ## The rule this exists to satisfy is not the same as the French one
 *
 * The French bank is LEVEL-defined: `FRENCH_VARIETY_MIX` is a weighted mixture
 * and the ruling is that it must be applied *inside each band*, never in level
 * order — otherwise the bank teaches that unfamiliar accents are a hard-band
 * problem.
 *
 * The IELTS listening paper is PART-defined. Its unit is the part, and the
 * founder set the constraint himself:
 *
 *   «تنوع باید در سطح پارت باشد، نه در سطح سؤال. کاربری که پارت ۱ را دوباره
 *    می‌گیرد، باید یک ضبط کاملاً متفاوت بشنود.»
 *
 *   "Variety must be at the level of the PART, not the question. A candidate
 *    who sits Part 1 again must hear a completely different recording."
 *
 * So the invariant here is **four distinct varieties inside every part**. A
 * candidate who sits Part 1 four times meets four accents, and the band is
 * not what decides which.
 *
 * ## Two constraints from the account, not from the exam
 *
 * The cast in `ielts-voices.ts` covers seven accents, and two of them are a
 * single voice: Irish is male-only (Darren) and Scottish is female-only
 * (Claire). **A two-speaker recording needs two voices of one variety**, so
 * Irish and Scottish are assigned only to the single-speaker parts — Part 2
 * and Part 4. That is the Belgian constraint from the French bank, met again
 * for a different reason, and written into the data rather than met at render
 * time, where the renderer would substitute silently and the file would play
 * perfectly and wrongly.
 *
 * The second is the ielts.org floor: *"Different accents, including British,
 * Australian, New Zealand and North American."* All four appear, and so do the
 * three the account additionally holds.
 *
 * ## The spread, and what it is checked against
 *
 *              Part 1 (B1)   Part 2 (B2)   Part 3 (C1)   Part 4 (C1)
 *   anchor     australian    british       canadian      irish
 *   v2         british       scottish      australian    north_american
 *   v3         north_american irish        new_zealand   scottish
 *   v4         new_zealand   canadian      north_american british
 *
 *   british 3 · north_american 3 · australian 2 · new_zealand 2 ·
 *   canadian 2 · scottish 2 · irish 2
 *
 * No variety sits only in Part 4. Irish and Scottish — the two the account can
 * only speak with one voice each — appear at B2 and at C1 rather than only at
 * the top, which is the French mistake in its IELTS form.
 *
 * ## What this plan CANNOT promise, stated here rather than discovered later
 *
 * `ielts-listening.check.ts` asserts *"no two rendered parts open with the same
 * voice"*. That was true and useful when the bank held one paper. **It cannot
 * be true of every drawable paper**, and the arithmetic is short: a paper draws
 * one version per part, all 4×4×4×4 = 256 combinations are drawable, so the
 * property requires the four parts' opener pools to be disjoint — sixteen
 * distinct voices. The cast holds twelve besides the narrator, and a FIXED
 * cast is itself the ruling (*"so that successive tests feel like one
 * examination rather than a collection"*).
 *
 * So one of three things has to give: the fixed cast, the four-versions depth,
 * or the property. The recommendation is the fourth option — keep all three
 * and make the DRAW avoid the collision, since `serveEpreuve` already chooses
 * among versions and can prefer one whose opener is not already on the paper.
 * That is a change to the serve and it is not made here. **It is a ruling to
 * take, and until it is taken the property is asserted over the anchors only,
 * which is the set it was written for.**
 */

import type { SpeechVariety } from '../model/types';

export type IeltsVarietyAssignment = {
  id: string;
  /** The part this recording is a version of. Variety is distinct within it. */
  part: 'Part 1' | 'Part 2' | 'Part 3' | 'Part 4';
  level: 'B1' | 'B2' | 'C1';
  /** Two speakers need two voices of ONE variety — see the Irish/Scottish note. */
  speakers: number;
  variety: SpeechVariety;
  /** True for the four heard on 29 August. Their variety is a record, not a plan. */
  rendered: boolean;
  /**
   * True when the audio that exists is audio this plan still allows.
   *
   * `rendered && !keep` is the one state that costs money: a file that plays
   * and is no longer permitted. It is `gt-l-p4`, spoken Irish, and it is
   * re-rendered rather than left — a bank described as Canadian-majority with
   * an Irish recording in it is the substitution defect with our own name on
   * it, and it would play perfectly.
   */
  keep: boolean;
};

export const IELTS_VARIETY_PLAN: IeltsVarietyAssignment[] = [
  // ── Part 1 · B1 · two speakers ────────────────────────────────────────
  { id: 'gt-l-p1',    part: 'Part 1', level: 'B1', speakers: 2, variety: 'australian',     rendered: true,  keep: true },
  { id: 'gt-l-p1-v2', part: 'Part 1', level: 'B1', speakers: 2, variety: 'canadian',       rendered: false, keep: false },
  { id: 'gt-l-p1-v3', part: 'Part 1', level: 'B1', speakers: 2, variety: 'canadian',       rendered: false, keep: false },
  { id: 'gt-l-p1-v4', part: 'Part 1', level: 'B1', speakers: 2, variety: 'north_american', rendered: false, keep: false },

  // ── Part 2 · B2 · one speaker ─────────────────────────────────────────
  { id: 'gt-l-p2',    part: 'Part 2', level: 'B2', speakers: 1, variety: 'british',        rendered: true,  keep: true },
  { id: 'gt-l-p2-v2', part: 'Part 2', level: 'B2', speakers: 1, variety: 'canadian',       rendered: false, keep: false },
  { id: 'gt-l-p2-v3', part: 'Part 2', level: 'B2', speakers: 1, variety: 'canadian',       rendered: false, keep: false },
  { id: 'gt-l-p2-v4', part: 'Part 2', level: 'B2', speakers: 1, variety: 'new_zealand',    rendered: false, keep: false },

  // ── Part 3 · C1 · two speakers ────────────────────────────────────────
  { id: 'gt-l-p3',    part: 'Part 3', level: 'C1', speakers: 2, variety: 'canadian',       rendered: true,  keep: true },
  { id: 'gt-l-p3-v2', part: 'Part 3', level: 'C1', speakers: 2, variety: 'canadian',       rendered: false, keep: false },
  { id: 'gt-l-p3-v3', part: 'Part 3', level: 'C1', speakers: 2, variety: 'british',        rendered: false, keep: false },
  { id: 'gt-l-p3-v4', part: 'Part 3', level: 'C1', speakers: 2, variety: 'australian',     rendered: false, keep: false },

  // ── Part 4 · C1 · one speaker ─────────────────────────────────────────
  // `gt-l-p4` was rendered IRISH and is the one already-rendered file this
  // ruling costs. Irish is out of the bank, so the audio that exists is audio
  // the plan no longer allows — and leaving it while calling the bank
  // Canadian-majority would be the substitution defect with our own name on
  // it. `keep: false` on a rendered row is what says "re-render this one".
  { id: 'gt-l-p4',    part: 'Part 4', level: 'C1', speakers: 1, variety: 'canadian',       rendered: true,  keep: false },
  { id: 'gt-l-p4-v2', part: 'Part 4', level: 'C1', speakers: 1, variety: 'canadian',       rendered: false, keep: false },
  { id: 'gt-l-p4-v3', part: 'Part 4', level: 'C1', speakers: 1, variety: 'north_american', rendered: false, keep: false },
  { id: 'gt-l-p4-v4', part: 'Part 4', level: 'C1', speakers: 1, variety: 'new_zealand',    rendered: false, keep: false },
];

/** The four accents ielts.org names. A floor, not the whole list. */
export const IELTS_PUBLISHED_ACCENTS: SpeechVariety[] = [
  'british', 'australian', 'new_zealand', 'north_american',
];

/**
 * Varieties the account can only speak with ONE voice.
 *
 * Both are now out of the bank — the 31 August ruling narrowed IELTS to
 * Canadian plus the four accents ielts.org names — so neither is assigned to
 * anything. The list stays because the RULE it exists for is the one that
 * survives a cast change: a two-speaker recording needs two voices of one
 * variety, and where the account holds one, the renderer would quietly
 * substitute a speaker of another accent. The file would play perfectly.
 */
export const SINGLE_VOICE_VARIETIES: SpeechVariety[] = ['irish', 'scottish'];

/**
 * The variety that dominates the bank, and the ruling behind it.
 *
 * The founder, 31 August: Canadian for IELTS, because his candidates are
 * moving to Canada — and, when the ielts.org accent list was put to him,
 * *"Canadian is the majority, but the four published accents stay."*
 *
 * Eight of sixteen is what that is: two of the four versions of every part.
 * A candidate meets a Canadian voice in every part they sit and meets the
 * exam's own spread as well.
 */
export const IELTS_MAJORITY_VARIETY: SpeechVariety = 'canadian';
