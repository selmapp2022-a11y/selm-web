/**
 * The IELTS family — and the good news is that it is nothing like the TCF's.
 *
 * Five real Test Report Forms were read into the model on 2026-08-28, on top
 * of the five already there. The finding that matters for engineering is a
 * relief: **Academic and General Training print the identical form.** Same
 * boxes, same order, same four bands, same overall, same CEFR cell. The only
 * difference is the word in the module box at the top right.
 *
 * So English needs ONE reader template, not six. The TCF needed five models
 * because Tout public awards an épreuve TCF Canada does not have and Québec
 * awards two épreuves in total; IELTS has no such split.
 *
 * But that one box is not decoration, and reading it is not optional:
 * **IRCC does not accept IELTS Academic for economic immigration.** A form
 * that treats "IELTS" as one exam will happily convert an Academic 8.0 into
 * a CLB 10 and build a plan on a document no officer will look at. Four of
 * the eight real IELTS documents in the corpus are Academic.
 *
 * Three axes, and they are independent:
 *
 *   module  — academic | general_training     ← decides IRCC acceptance
 *   layout  — standard | ukvi                 ← decides the verification URL
 *   trfKind — original | one_skill_retake     ← decides IRCC acceptance
 */

export type IeltsModule = 'academic' | 'general_training';
export type IeltsLayout = 'standard' | 'ukvi';

/**
 * Which Test Report Form this is.
 *
 * **One Skill Retake is the hazard here**, and it is a new one — the option
 * has existed since 2023. A candidate retakes a single skill and receives a
 * SECOND, separate Test Report Form carrying that one skill. Both forms are
 * genuine. Both are current. They disagree.
 *
 * So one person can hold two authentic IELTS documents with different marks
 * for the same skill, and nothing on either page says which one an
 * immigration officer will read. **IRCC does not accept One Skill Retake for
 * Express Entry** — it accepts it only for the Economic Mobility Pathways
 * Pilot — so for the destination this product serves, the ORIGINAL form is
 * the one that counts and the retake, however much better, is not evidence.
 *
 * Source, fetched 2026-08-28: "The IRCC doesn't accept IELTS One Skill
 * Retake for Express Entry" / "The IRCC accepts IELTS One Skill Retake (OSR)
 * for Economic Mobility Pathways Pilot (EMPP) candidates only" —
 * ielts.idp.com/canada/about/ielts-for-canadian-immigration
 *
 * This is a case where the honest answer is worse news than the candidate
 * wants and has to be given anyway: a candidate who retook writing and went
 * from 6.0 to 7.0 will reasonably believe they now have CLB 9 in writing.
 * For Express Entry they do not.
 */
export type IeltsTrfKind = 'original' | 'one_skill_retake';

/**
 * Where each layout says its own results can be checked.
 *
 * **Incomplete, and known to be.** These two were written from two documents
 * and a third document broke them within the hour: the oldest form in the
 * corpus prints a country-specific British Council address instead. The
 * right shape is to read the address off the page when a reader is bound,
 * and to treat this map as a default rather than as the truth. A fourth
 * address almost certainly exists.
 */
export const VERIFY_URL: Record<IeltsLayout, string> = {
  standard: 'ielts.ucles.org.uk',
  // The UKVI form prints a different address, and a checker pointed at the
  // wrong one gets nothing and reports "could not verify" — which would be
  // recorded against the candidate rather than against us.
  ukvi: 'ielts.org/verify',
};

/**
 * Band → CEFR, as IELTS itself prints it.
 *
 * Checked against every CEFR level printed on the corpus: eight overall
 * bands across eight documents from 2015 to 2024, and all agree.
 *
 * **Applied per skill, on IELTS's own authority.** A UKVI Test Report Form
 * in the corpus prints a CEFR level in its own cell beside EACH of the four
 * bands, not only beside the overall — so the awarding body applies this
 * table skill by skill, which is exactly the shape `bySkill` already assumes
 * for the CLB conversion.
 */
export const IELTS_CEFR: Array<{ from: number; cefr: string }> = [
  { from: 8.5, cefr: 'C2' },
  { from: 7.0, cefr: 'C1' },
  { from: 5.5, cefr: 'B2' },
  { from: 4.5, cefr: 'B1' },
  { from: 3.5, cefr: 'A2' },
  { from: 3.0, cefr: 'A1' },
];

export function cefrForBand(band: number): string | null {
  return IELTS_CEFR.find((b) => band >= b.from)?.cefr ?? null;
}

/**
 * The second free check.
 *
 * A Test Report Form prints BOTH the bands and the CEFR level the awarding
 * body derived from them. Those two readings are redundant — and redundancy
 * is a checksum. If a reader extracts an overall band of 7.0 and a CEFR cell
 * of B2, one of the two was misread, and the form knows it before anyone
 * downstream does.
 *
 * This costs nothing, needs no model, and works on every TRF since the CEFR
 * cell appeared. Together with the overall-band check — the overall is
 * itself derived from the four skill bands — a reader has **two independent
 * ways to catch its own error** on the same page.
 *
 * Returns `null` when there is nothing to check.
 */
export function crossCheckBandCefr(
  band: number | null | undefined,
  printedCefr: string | null | undefined,
): { agrees: boolean; expected: string | null; printed: string } | null {
  if (typeof band !== 'number' || !printedCefr) return null;
  const expected = cefrForBand(band);
  return { agrees: expected === printedCefr, expected, printed: printedCefr };
}

/**
 * The overall band, from the four skill bands.
 *
 * IELTS averages the four and rounds to the nearest half band, with .25
 * rounding up to the next half and .75 up to the next whole. This is the
 * first of the two checks: a reader that misreads one skill band usually
 * produces an overall that no longer follows from the four.
 */
export function overallFrom(bands: number[]): number | null {
  if (bands.length !== 4 || bands.some((b) => typeof b !== 'number')) return null;
  const mean = bands.reduce((a, b) => a + b, 0) / 4;
  return Math.round(mean * 2) / 2;
}

export const IELTS_REFUSALS = {
  academic: {
    en: 'This is an IELTS Academic Test Report Form. IRCC accepts IELTS General Training only for economic immigration — Academic is not accepted, whatever the bands. The two tests print an identical form, so this is easy to miss: the module is the box at the top right of your page.',
    fr: "Il s'agit d'une attestation IELTS Academic. IRCC n'accepte que l'IELTS General Training pour l'immigration économique — l'Academic n'est pas accepté, quels que soient les scores. Les deux examens impriment une attestation identique, ce qui rend l'erreur facile : le module figure dans la case en haut à droite de votre page.",
  },
  one_skill_retake: {
    en: 'This is a One Skill Retake report. It is a genuine IELTS result, but IRCC does not accept One Skill Retake for Express Entry — only for the Economic Mobility Pathways Pilot. For Express Entry your original Test Report Form is the one that counts, even where the retake is higher. Enter that one, and keep this result for your own picture of where you are.',
    fr: "Il s'agit d'une attestation One Skill Retake. C'est un vrai résultat IELTS, mais IRCC n'accepte pas le One Skill Retake pour Entrée express — seulement pour le Economic Mobility Pathways Pilot. Pour Entrée express, c'est votre attestation d'origine qui compte, même si la reprise est meilleure. Saisissez celle-là, et gardez ce résultat pour votre propre lecture de votre niveau.",
  },
} as const;
