/**
 * What IRCC will actually accept, as IRCC publishes it.
 *
 * This file exists because a corpus of eight real score reports was read
 * into the model on 2026-08-28 and **every single one of them was already
 * unusable for an Express Entry application** — not one was rejected by our
 * form, and the product would have built a study plan on all eight without
 * saying a word.
 *
 * Two separate rules do that, and neither is about the marks:
 *
 * 1. **The wrong test.** IRCC names the tests it takes. `IELTS General
 *    Training only` — an IELTS Academic Test Report Form is not accepted for
 *    Express Entry, however high the bands. `TCF Canada`, likewise, is not
 *    `TCF Tout Public`; they are different examinations with different
 *    épreuves, and Tout Public awards a *maîtrise des structures de la
 *    langue* that TCF Canada does not test at all. Three of the eight
 *    documents were Tout Public and one was Academic — **half the sample.**
 *
 * 2. **Age.** Results must be less than two years old at BOTH moments: when
 *    the profile is completed and again when the PR application is
 *    submitted. This is stricter than the expiry printed on the paper, and
 *    it is the rule that catches everything: the newest document in the
 *    corpus was sat 2024-01 and is already over.
 *
 * Source, fetched 2026-08-28:
 * https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/language-test.html
 *
 * **This is not advice and must never be rendered as advice.** It is IRCC's
 * published rule, applied to a date the candidate typed, shown so they can
 * check it themselves. The plan is built either way — an out-of-date result
 * is still a true measurement of a person, and it is the best seed for a
 * study plan we will ever get. What changes is that we say so.
 */

/** Exam ids in our catalogue that IRCC accepts for Express Entry. */
export const IRCC_ACCEPTED: Record<string, { name: string; caution?: { en: string; fr: string } }> = {
  'ielts-gt': {
    name: 'IELTS General Training',
    caution: {
      en: 'General Training only. An IELTS Academic result is not accepted for Express Entry, whatever the bands.',
      fr: "General Training uniquement. Un résultat IELTS Academic n'est pas accepté pour Entrée express, quels que soient les scores.",
    },
  },
  'tcf-canada': {
    name: 'TCF Canada',
    caution: {
      en: 'TCF Canada only. A TCF Tout Public attestation is a different exam — it awards a mark for maîtrise des structures, which TCF Canada does not test — and it is not accepted for Express Entry.',
      fr: "TCF Canada uniquement. Une attestation TCF Tout Public relève d'un autre examen — elle note la maîtrise des structures, que le TCF Canada n'évalue pas — et elle n'est pas acceptée pour Entrée express.",
    },
  },
};

/** IRCC's own limit, in months, counted from the sitting. */
export const IRCC_VALIDITY_MONTHS = 24;

/** Whole months from a `YYYY-MM` sitting to a given date. */
export function monthsSince(sat: string, on: Date = new Date()): number | null {
  const m = /^(\d{4})-(\d{2})$/.exec(sat);
  if (!m) return null;
  return (on.getUTCFullYear() - Number(m[1])) * 12 + (on.getUTCMonth() + 1 - Number(m[2]));
}

export type IrccAge = 'within' | 'past' | 'unknown';

/**
 * Is a sitting still inside IRCC's two-year window?
 *
 * `unknown` where the sitting month was not recorded — and `unknown` is
 * shown as unknown, never quietly as `within`.
 */
export function irccAge(sat: string | null | undefined, on: Date = new Date()): IrccAge {
  if (!sat) return 'unknown';
  const m = monthsSince(sat, on);
  if (m === null) return 'unknown';
  return m < IRCC_VALIDITY_MONTHS ? 'within' : 'past';
}
