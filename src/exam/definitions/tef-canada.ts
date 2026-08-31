import type { ExamDefinition } from '../model/types';

/**
 * TEF CANADA — DEFINED, AND NOT SERVED.
 *
 * ── What this file is ─────────────────────────────────────────────────────
 * The structure below is verified from the awarding body's own pages and is
 * worth keeping. What is NOT verified is the one number every score on this
 * exam is read against: the maximum of each scale. So the exam is defined,
 * every scale declares `max: null`, and `definitions/index.ts` keeps it out
 * of `EXAMS`. Nothing serves it, nothing plans against it, and no candidate
 * is shown a TEF number this product cannot stand behind.
 *
 * ── THE CONTRADICTION, IN FULL, BECAUSE IT IS THE WHOLE REASON ────────────
 * Two official sources. Two ceilings. They cannot both be describing the
 * number printed on a candidate's attestation today.
 *
 *   **Le français des affaires** (CCI Paris Île-de-France — the awarding
 *   body), "Correspondance Score TEF – Niveau NCLC":
 *   https://www.lefrancaisdesaffaires.fr/wp-content/uploads/2024/10/correspondance-tef-nclc.pdf
 *   Two periods are printed side by side. For tests taken **from 11 December
 *   2023**, all four épreuves are scored **out of 699** — the document writes
 *   "score / 699" — and NCLC 7 is compréhension écrite 434–461, compréhension
 *   orale 428–471, expression écrite 456–493, expression orale 456–493.
 *
 *   **IRCC**, the language-test equivalency chart for Express Entry:
 *   https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/language-requirements/language-testing.html
 *   ONE table, no date split, whose NCLC 7 row reads speaking 310–348,
 *   listening 249–279, reading 207–232, writing 310–348 — numbers that cannot
 *   sit on a 699 scale. The page adds that the raw-score change CCI made
 *   between 11 December 2023 and 6 May 2024 "has been reverted back to the
 *   Express Entry scoring grid we currently use."
 *
 * The widely-repeated maxima — 300 reading, 360 listening, 450 writing and
 * speaking — appear on neither of those two pages. They are consistent with
 * IRCC's ranges and with nothing the awarding body publishes.
 *
 * **So the ceiling is unknown, and a guess here would be a guess about the
 * one number a candidate acts on.** It stays `null` until someone reads a
 * real TEF Canada attestation issued this year, or the awarding body answers.
 * The same discipline the rest of this product already applies to a predicted
 * band: a number whose provenance cannot be carried is not shown.
 *
 * ── What IS verified, and from where ──────────────────────────────────────
 * Four compulsory épreuves, attestation on a scale to 699 —
 * https://www.lefrancaisdesaffaires.fr/tests-diplomes/test-evaluation-francais/tef-canada/
 *
 *   compréhension écrite   40 questions   60 minutes
 *   compréhension orale    40 questions   40 minutes
 *   expression écrite      2 sections     60 minutes  (A ≥80 words, B ≥200)
 *   expression orale       2 sections     15 minutes  (A 5 min, B 10 min)
 *
 * Comprehension marking, from the awarding body's own preparation page:
 * "Une bonne réponse vous donne 1 point. Si votre réponse est fausse ou si
 * vous ne répondez pas, vous n'obtenez aucun point." —
 * https://www.lefrancaisdesaffaires.fr/se-preparer-a-lepreuve-de-comprehension-orale-du-tef/
 *
 * **Expression écrite and expression orale publish no marking scheme at all.**
 * No criteria, no weights, no barème. That is not a gap in this file; it is
 * what the awarding body publishes. Anything this product ever says about how
 * a TEF written or spoken answer is marked will therefore be OURS, and must
 * be labelled as ours wherever it appears — the same rule the TCF sections
 * already follow in their `provenance`.
 *
 * ── What is deliberately absent ───────────────────────────────────────────
 * `benchmark.bands` is EMPTY. The conversion is the contested half, and an
 * empty table is the honest shape of "we do not know" — a table filled from
 * either source would be this file asserting which official document is
 * right. `sections` is empty for the same reason content has not started:
 * a section whose scale has no ceiling cannot report a score.
 */
export const TEF_CANADA: ExamDefinition = {
  id: 'tef-canada',
  name: { en: 'TEF Canada', fr: 'TEF Canada' },
  language: 'fr',
  locale: 'fr-FR',
  acceptedFor: {
    en: 'Accepted by IRCC for Canadian permanent residence and citizenship. NOT SERVED by this product: the scale its scores are reported on is not established — see the note in this file.',
    fr: "Accepté par IRCC pour la résidence permanente et la citoyenneté canadiennes. NON PROPOSÉ par ce produit : l'échelle sur laquelle ses scores sont rapportés n'est pas établie — voir la note de ce fichier.",
  },
  // Four scales, four unknown ceilings. `min: 0` is safe: both candidate
  // sources agree the floor is zero.
  scales: [
    {
      id: 'tef-ce',
      label: { en: 'Reading score', fr: 'Score de compréhension écrite' },
      min: 0,
      max: null,
      step: 1,
      display: { decimals: 0 },
    },
    {
      id: 'tef-co',
      label: { en: 'Listening score', fr: 'Score de compréhension orale' },
      min: 0,
      max: null,
      step: 1,
      display: { decimals: 0 },
    },
    {
      id: 'tef-ee',
      label: { en: 'Writing score', fr: "Score d'expression écrite" },
      min: 0,
      max: null,
      step: 1,
      display: { decimals: 0 },
    },
    {
      id: 'tef-eo',
      label: { en: 'Speaking score', fr: "Score d'expression orale" },
      min: 0,
      max: null,
      step: 1,
      display: { decimals: 0 },
    },
  ],
  // Empty on purpose. See the note above.
  benchmark: { system: 'NCLC', bands: [] },
  awards: [
    { skill: 'reading', label: { en: 'Reading', fr: 'Compréhension écrite' }, scaleId: 'tef-ce' },
    { skill: 'listening', label: { en: 'Listening', fr: 'Compréhension orale' }, scaleId: 'tef-co' },
    { skill: 'writing', label: { en: 'Writing', fr: 'Expression écrite' }, scaleId: 'tef-ee' },
    { skill: 'speaking', label: { en: 'Speaking', fr: 'Expression orale' }, scaleId: 'tef-eo' },
  ],
  sections: [],
  calibration: {
    samples: 0,
    byLevel: {},
    mae: null,
    gate: { minSamples: 30, levels: [4, 5, 6, 7, 8, 9, 10], minPerLevel: 3, maxMae: 0.5, coverage: [0.8, 0.95] },
  },
  predictionTarget: {
    unit: 'skill_at_sitting',
    window: { days: 60, minResponses: 4 },
    claim: {
      en: 'No claim is made. This exam is not served, and nothing about a TEF result is predicted while the scale its scores are reported on is unestablished.',
      fr: "Aucune affirmation n'est faite. Cet examen n'est pas proposé, et rien n'est prédit d'un résultat TEF tant que l'échelle sur laquelle ses scores sont rapportés n'est pas établie.",
    },
  },
};

/**
 * What has to be true before this exam may be added to `EXAMS`.
 *
 * Written as a list rather than a sentence so that the day someone believes
 * it is ready, they have to point at which line they have satisfied.
 */
export const TEF_CANADA_BLOCKERS = [
  'The maximum of each of the four scales, established from a TEF Canada attestation issued in the current scoring period or from a direct answer by the awarding body.',
  'The NCLC conversion that IRCC will actually apply to that number — the two published tables disagree.',
  'Items. Nothing has been authored for this exam.',
] as const;
