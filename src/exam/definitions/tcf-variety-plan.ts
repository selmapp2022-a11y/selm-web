/**
 * Which variety each of the 39 TCF listening recordings is to be spoken in.
 *
 * ── NARROWED TO THREE ON 31 AUGUST 2026, BY THE FOUNDER ────────────────────
 *
 *   «لطفا برای آزمون و تمرین‌ها و درس‌های فرانسه فقط از لهجهٔ کبکی و پاریسی و
 *    سوییسی استفاده کن — فقط همین ۳ لهجه.»
 *
 *   "For the French exam, the practice and the lessons, use only Québécois,
 *    Parisian and Swiss — only those three."
 *
 * West African and Belgian are out of the bank, and Acadian — which was cast
 * but never scheduled — is out of the cast. `international` is the entry the
 * founder calls *Parisian*: standard France French, the Paris register, and
 * the name in the data is kept because thirty-nine recordings and their
 * provenance already carry it. It is labelled Parisian everywhere a person
 * reads it.
 *
 * ── WHAT THIS OVERRULES, STATED PLAINLY ────────────────────────────────────
 * The previous plan followed FEI's own TCF practice simulator, which draws its
 * audio from Paris, Geneva, Dakar, Montreal and Brussels. Dropping Dakar and
 * Brussels means the bank no longer mirrors that spread, and a candidate who
 * meets a West African voice in a real TCF sitting will not have met one here.
 * **That is a product decision and it is the founder's to take** — unlike the
 * IELTS accent question, no examining body publishes a required accent list
 * for TCF. It is recorded rather than argued because the next person to read
 * this file will otherwise re-derive the old mixture from the same source.
 *
 * ── The shares, after the narrowing ────────────────────────────────────────
 * Twenty-two Parisian, twelve Québécois, five Swiss — 56% / 31% / 13%.
 * Parisian stays a clear majority and Québécois stays a real minority rather
 * than becoming the bank: making it dominant is the Quebec option wearing the
 * mixture's clothes, and the MIFI/UQAM project to build a Quebec adaptation of
 * TCF *Québec* is itself evidence that TCF Canada does not already play
 * Québécois. An inference, not a proof, and recorded as one.
 *
 * ── Spread across the bands, which is the part that is easy to get wrong ────
 * The first attempt at this table distributed the shares across the bank in
 * LEVEL ORDER and produced a bank where a candidate met no Québécois below B1
 * and no Parisian at C2 — the mixture correlated with difficulty, which would
 * teach a candidate that an unfamiliar accent is a hard-band problem. Real
 * exams do not work that way, and the founder restated the constraint when he
 * asked for the re-render: *"the distribution must be applied inside each
 * band, not in level order."*
 *
 * So the nine reassigned recordings were placed band by band, keeping the
 * band's own composition, never by walking the list:
 *
 *              A1    A2    B1    B2    C1    C2
 *   parisian    2     3     5     6     3     3
 *   québécois   1     2     3     3     2     1
 *   swiss       1     1     1     1     1     0
 *
 * Québécois is now in every band, which it was not before. Swiss is in five of
 * six and absent only from C2, where the bank holds four recordings.
 *
 * ── This table is DATA, not a computation ──────────────────────────────────
 * A function that assigned varieties at render time would have to be re-run
 * and re-read to be checked, and a reviewer could not see at a glance that
 * Québécois appears at A1 as well as C1 — which is the property that matters
 * and the one a computation would hide.
 *
 * ── One constraint from the account, not from the exam ─────────────────────
 * A two-speaker dialogue needs two voices of ONE variety. All three remaining
 * varieties have a male and a female voice on the account, so — unlike the
 * Belgian case this file used to carry — no recording is barred from being a
 * dialogue. The rule stays asserted anyway, because the cast can change and
 * the renderer would substitute silently: the file would play perfectly and
 * be in the wrong accent, and nothing on the screen would say so.
 */

import type { SpeechVariety } from '../model/types';

export type VarietyAssignment = {
  id: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  /** Two speakers need two voices of one variety — see the Belgian note. */
  speakers: number;
  variety: SpeechVariety;
};

export const TCF_VARIETY_PLAN: VarietyAssignment[] = [
  { id: 'tcf-co-01-r', level: 'A1', speakers: 1, variety: 'quebecois' },
  { id: 'tcf-co-02-r', level: 'A1', speakers: 1, variety: 'international' },
  { id: 'tcf-co-03-r', level: 'A1', speakers: 1, variety: 'international' },
  { id: 'tcf-co-04-r', level: 'A1', speakers: 1, variety: 'swiss' },
  { id: 'tcf-co-05-r', level: 'A2', speakers: 2, variety: 'international' },
  { id: 'tcf-co-06-r', level: 'A2', speakers: 1, variety: 'quebecois' },
  { id: 'tcf-co-07-r', level: 'A2', speakers: 1, variety: 'swiss' },
  { id: 'tcf-co-08-r', level: 'A2', speakers: 2, variety: 'quebecois' },
  { id: 'tcf-co-09-r', level: 'A2', speakers: 1, variety: 'international' },
  { id: 'tcf-co-10-r', level: 'A2', speakers: 2, variety: 'international' },
  { id: 'tcf-co-11-r', level: 'B1', speakers: 2, variety: 'international' },
  { id: 'tcf-co-12-r', level: 'B1', speakers: 1, variety: 'quebecois' },
  { id: 'tcf-co-13-r', level: 'B1', speakers: 2, variety: 'international' },
  { id: 'tcf-co-14-r', level: 'B1', speakers: 1, variety: 'quebecois' },
  { id: 'tcf-co-15-r', level: 'B1', speakers: 2, variety: 'international' },
  { id: 'tcf-co-16-r', level: 'B1', speakers: 2, variety: 'international' },
  { id: 'tcf-co-17-r', level: 'B1', speakers: 1, variety: 'international' },
  { id: 'tcf-co-18-r', level: 'B1', speakers: 2, variety: 'quebecois' },
  { id: 'tcf-co-19-r', level: 'B1', speakers: 2, variety: 'swiss' },
  { id: 'tcf-co-20-r', level: 'B2', speakers: 1, variety: 'international' },
  { id: 'tcf-co-21-r', level: 'B2', speakers: 2, variety: 'quebecois' },
  { id: 'tcf-co-22-r', level: 'B2', speakers: 1, variety: 'international' },
  { id: 'tcf-co-23-r', level: 'B2', speakers: 1, variety: 'quebecois' },
  { id: 'tcf-co-24-r', level: 'B2', speakers: 2, variety: 'international' },
  { id: 'tcf-co-25-r', level: 'B2', speakers: 2, variety: 'quebecois' },
  { id: 'tcf-co-26-r', level: 'B2', speakers: 1, variety: 'international' },
  { id: 'tcf-co-27-r', level: 'B2', speakers: 1, variety: 'international' },
  { id: 'tcf-co-28-r', level: 'B2', speakers: 1, variety: 'international' },
  { id: 'tcf-co-29-r', level: 'B2', speakers: 2, variety: 'swiss' },
  { id: 'tcf-co-30-r', level: 'C1', speakers: 1, variety: 'international' },
  { id: 'tcf-co-31-r', level: 'C1', speakers: 1, variety: 'quebecois' },
  { id: 'tcf-co-32-r', level: 'C1', speakers: 1, variety: 'international' },
  { id: 'tcf-co-33-r', level: 'C1', speakers: 2, variety: 'quebecois' },
  { id: 'tcf-co-34-r', level: 'C1', speakers: 1, variety: 'international' },
  { id: 'tcf-co-35-r', level: 'C1', speakers: 1, variety: 'swiss' },
  { id: 'tcf-co-36-r', level: 'C2', speakers: 1, variety: 'international' },
  { id: 'tcf-co-37-r', level: 'C2', speakers: 1, variety: 'international' },
  { id: 'tcf-co-38-r', level: 'C2', speakers: 1, variety: 'international' },
  { id: 'tcf-co-39-r', level: 'C2', speakers: 1, variety: 'quebecois' },

  // ── THE TWENTY-EIGHT WRITTEN ON 31 AUGUST ──────────────────────────────
  //
  // The founder pointed at `annonce · B2` on his own Progress screen and asked
  // what "not built" meant. It meant a coordinate with nothing behind it —
  // seven of them in this section — and the answer was authoring.
  //
  // Placed BAND BY BAND, like the nine above and for the same reason: shares
  // applied in level order produce a bank where an unfamiliar accent is a
  // hard-band problem, which no real exam does. Québécois is now in every one
  // of the six bands and Swiss in five.
  { id: 'tcf-co-56-r', level: 'A1', speakers: 2, variety: 'quebecois' },
  { id: 'tcf-co-57-r', level: 'A1', speakers: 2, variety: 'international' },
  { id: 'tcf-co-58-r', level: 'A1', speakers: 2, variety: 'international' },
  { id: 'tcf-co-59-r', level: 'A1', speakers: 2, variety: 'quebecois' },
  { id: 'tcf-co-60-r', level: 'A1', speakers: 1, variety: 'international' },
  { id: 'tcf-co-61-r', level: 'A1', speakers: 1, variety: 'quebecois' },
  { id: 'tcf-co-62-r', level: 'A1', speakers: 1, variety: 'international' },
  { id: 'tcf-co-63-r', level: 'A1', speakers: 1, variety: 'international' },
  { id: 'tcf-co-40-r', level: 'B1', speakers: 1, variety: 'international' },
  { id: 'tcf-co-41-r', level: 'B1', speakers: 1, variety: 'quebecois' },
  { id: 'tcf-co-42-r', level: 'B1', speakers: 1, variety: 'swiss' },
  { id: 'tcf-co-43-r', level: 'B1', speakers: 1, variety: 'international' },
  { id: 'tcf-co-44-r', level: 'B2', speakers: 1, variety: 'international' },
  { id: 'tcf-co-45-r', level: 'B2', speakers: 1, variety: 'quebecois' },
  { id: 'tcf-co-46-r', level: 'B2', speakers: 1, variety: 'swiss' },
  { id: 'tcf-co-47-r', level: 'B2', speakers: 1, variety: 'international' },
  { id: 'tcf-co-48-r', level: 'C1', speakers: 1, variety: 'international' },
  { id: 'tcf-co-49-r', level: 'C1', speakers: 1, variety: 'quebecois' },
  { id: 'tcf-co-50-r', level: 'C1', speakers: 1, variety: 'international' },
  { id: 'tcf-co-51-r', level: 'C1', speakers: 1, variety: 'international' },
  { id: 'tcf-co-52-r', level: 'C2', speakers: 1, variety: 'international' },
  { id: 'tcf-co-53-r', level: 'C2', speakers: 1, variety: 'quebecois' },
  { id: 'tcf-co-54-r', level: 'C2', speakers: 1, variety: 'swiss' },
  { id: 'tcf-co-55-r', level: 'C2', speakers: 1, variety: 'international' },
  { id: 'tcf-co-64-r', level: 'C2', speakers: 2, variety: 'quebecois' },
  { id: 'tcf-co-65-r', level: 'C2', speakers: 2, variety: 'international' },
  { id: 'tcf-co-66-r', level: 'C2', speakers: 2, variety: 'international' },
  { id: 'tcf-co-67-r', level: 'C2', speakers: 2, variety: 'quebecois' },
];

/** The shares this plan realises, for a check to assert against. */
export const TCF_VARIETY_SHARES: Record<string, number> = {
  international: 38,
  quebecois: 21,
  swiss: 8,
};
