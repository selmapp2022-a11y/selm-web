/**
 * TCF Canada — data only, same shape, different numbers and language.
 *
 * This file is the test. It was written after the engine, and the engine was
 * not edited to accommodate it. Every difference from IELTS below is a value
 * in this object:
 *
 *   - a 0–20 scale instead of 0–9 bands
 *   - NCLC instead of CLB, with its own table
 *   - four criteria with French ids and French labels that no adapter knows
 *   - a word band (60–120) rather than a floor
 *   - "A1 non atteint" as an automatic zero where IELTS applies a penalty
 *   - no judge bound at all
 *
 * Sources and open items:
 * - Expression écrite is scored 0–20 and NCLC 7 requires 10/20. Stated in
 *   the business plan and consistent with the published equivalency.
 * - The score→NCLC rows below are VERIFIED, 2026-08-26, against IRCC's own
 *   test equivalency chart and against France Éducation international's
 *   correspondence table, which agree on every row. Three rows below NCLC 7
 *   were wrong and are corrected; see the note on `benchmark`.
 *
 * VERIFIED 2026-08-26 against France Éducation international, read through a
 * browser because the site refuses this project's network:
 *   - "Manuel du candidat TCF", Version P, avril 2026, p. 20 — expression
 *     écrite is three tâches, and for TCF tout public, Québec and Canada the
 *     expected length is: Tâche 1, 60–120 mots; Tâche 2, 120–150 mots;
 *     Tâche 3, 120–180 mots. Tâche 3 is described there as comparing two
 *     points of view on a fait de société expressed in two documents, with
 *     the candidate's own opinion — which is what this file already models.
 *   - france-education-international.fr/test/tcf-canada — "Expression
 *     écrite : Épreuve collective : 3 exercices. Durée : 60 minutes."
 *
 * So the word bands below are the exam's. The per-tâche times are not: FEI
 * publishes 60 minutes for the whole épreuve and no split at all. Ours is an
 * equal third, carried as `timeLimitApportioned` and shown to the candidate
 * as ours.
 *
 * Expression écrite tâche 2 and expression orale tâches 2 and 3 were added
 * on 2026-08-26 from the Manuel du candidat TCF, Version P, avril 2026, p.
 * 19–20. The word bands, the task types and the speaking durations are the
 * exam's; the subjects are ours and say so; the written per-tâche times are
 * ours and are flagged `timeLimitApportioned`.
 */
import type { ExamDefinition } from '../model/types';

export const TCF_CANADA: ExamDefinition = {
  id: 'tcf-canada',
  name: { en: 'TCF Canada', fr: 'TCF Canada' },
  language: 'fr',
  locale: 'fr-CA',
  acceptedFor: {
    en: 'Canadian economic immigration and Canadian citizenship.',
    fr: "Immigration économique canadienne et citoyenneté canadienne.",
  },
  scales: [
    {
      id: 'sur20',
      label: { en: 'Score out of 20', fr: 'Note sur 20' },
      min: 0,
      max: 20,
      step: 1,
      display: { suffix: { en: '/ 20', fr: '/ 20' }, decimals: 0 },
    },
    // 331 and 342 are NOT the floors of these scales. They are the NCLC 4
    // thresholds in IRCC's chart, which starts at NCLC 4 because that is the
    // lowest level it converts. FEI reports comprehension on 100–699. Encoded
    // as 331/342 on 26 August and corrected the same day, before anything
    // rendered them.
    {
      id: 'co699',
      label: { en: 'Listening score', fr: 'Score de compréhension orale' },
      min: 100,
      max: 699,
      step: 1,
      display: { suffix: { en: '/ 699', fr: '/ 699' }, decimals: 0 },
      // FEI's own CEFR reading of a /699 score: one level per hundred.
      // Verified against 23 CEFR levels printed on 16 real attestations —
      // every one agrees. See `corpus.check.ts` §8.
      cefrBands: [
        { from: 600, cefr: 'C2' },
        { from: 500, cefr: 'C1' },
        { from: 400, cefr: 'B2' },
        { from: 300, cefr: 'B1' },
        { from: 200, cefr: 'A2' },
        { from: 100, cefr: 'A1' },
      ],
    },
    {
      id: 'ce699',
      label: { en: 'Reading score', fr: 'Score de compréhension écrite' },
      min: 100,
      max: 699,
      step: 1,
      display: { suffix: { en: '/ 699', fr: '/ 699' }, decimals: 0 },
      // FEI's own CEFR reading of a /699 score: one level per hundred.
      // Verified against 23 CEFR levels printed on 16 real attestations —
      // every one agrees. See `corpus.check.ts` §8.
      cefrBands: [
        { from: 600, cefr: 'C2' },
        { from: 500, cefr: 'C1' },
        { from: 400, cefr: 'B2' },
        { from: 300, cefr: 'B1' },
        { from: 200, cefr: 'A2' },
        { from: 100, cefr: 'A1' },
      ],
    },
  ],
  // VERIFIED 2026-08-26 against two independent published sources that agree
  // on every row: IRCC's own test equivalency chart — the department that
  // reads the attestation and converts it — and France Éducation
  // international's "Correspondance entre les résultats au TCF Canada et les
  // niveaux de compétence linguistique canadiens".
  //
  // Three rows below 7 were WRONG before this. The table said 9→6, 7→5, 6→4;
  // the published table is 7→6, 6→5, 4→4. A candidate marked 6 was being told
  // NCLC 4 when the awarding body would say NCLC 5. The error was entirely in
  // the low half of the range, which is also the half this project has the
  // least evidence for.
  //
  // Note the shape, because it decides how accuracy may ever be published:
  // NCLC 7 spans two marks (10 and 11) and NCLC 5 spans exactly one (6). A
  // scorer with ±1 mark of error crosses a whole level in the middle of the
  // range and not at the bottom, so a single aggregate accuracy figure would
  // be a lie by averaging. `calibration.byLevel` and the gate's `minPerLevel`
  // are what make a per-level statement possible.
  benchmark: {
    system: 'NCLC',
    // Expression écrite and expression orale, mark out of 20.
    bands: [
      { from: 16, level: 10, cefr: 'C1-C2' },
      { from: 14, level: 9, cefr: 'C1' },
      { from: 12, level: 8, cefr: 'B2' },
      { from: 10, level: 7, cefr: 'B2' },
      { from: 7, level: 6, cefr: 'B1' },
      { from: 6, level: 5, cefr: 'B1' },
      { from: 4, level: 4, cefr: 'A2' },
    ],
    // The two comprehension scales. No section uses them yet — compréhension
    // orale and compréhension écrite are not modelled — but they are verified
    // and they differ at every boundary except the top, so they are recorded
    // separately rather than left to be guessed at when those sections exist.
    byScale: {
      co699: [
        { from: 549, level: 10, cefr: 'C1-C2' },
        { from: 523, level: 9, cefr: 'C1' },
        { from: 503, level: 8, cefr: 'B2' },
        { from: 458, level: 7, cefr: 'B2' },
        { from: 398, level: 6, cefr: 'B1' },
        { from: 369, level: 5, cefr: 'B1' },
        { from: 331, level: 4, cefr: 'A2' },
      ],
      ce699: [
        { from: 549, level: 10, cefr: 'C1-C2' },
        { from: 524, level: 9, cefr: 'C1' },
        { from: 499, level: 8, cefr: 'B2' },
        { from: 453, level: 7, cefr: 'B2' },
        { from: 406, level: 6, cefr: 'B1' },
        { from: 375, level: 5, cefr: 'B1' },
        { from: 342, level: 4, cefr: 'A2' },
      ],
    },
  },
  calibration: {
    // Zero, and for French there is a second problem behind the first: no
    // published set of examiner-rated French scripts exists to check against
    // in the meantime. English has official sample scripts with awarded
    // bands; French has commercial prep-site corrections, which are somebody's
    // opinion rather than an awarded level. Every French number therefore has
    // to wait for real attestations. There is no free external anchor.
    samples: 0,
    byLevel: {},
    mae: null,
    gate: {
      minSamples: 150,
      levels: [4, 5, 6, 7, 8, 9, 10],
      minPerLevel: 10,
      maxMae: 0.75,
      coverage: [0.88, 0.93],
    },
  },
  predictionTarget: {
    unit: 'skill_at_sitting',
    window: { days: 30, minResponses: 3 },
    claim: {
      en: 'The NCLC level this candidate would be awarded for this skill if they sat TCF Canada now, estimated from their practice responses of the last 30 days.',
      fr: "Le niveau NCLC que ce candidat obtiendrait pour cette compétence s'il passait le TCF Canada maintenant, estimé à partir de ses réponses d'entraînement des 30 derniers jours.",
    },
  },
  // What FEI prints on the attestation. All four, and the two comprehension
  // sections are reported on their own scales, which is why `scaleId` is here
  // rather than assumed.
  awards: [
    { skill: 'listening', label: { en: 'Listening comprehension', fr: 'Compréhension orale' }, scaleId: 'co699' },
    { skill: 'reading', label: { en: 'Reading comprehension', fr: 'Compréhension écrite' }, scaleId: 'ce699' },
    { skill: 'writing', label: { en: 'Written expression', fr: 'Expression écrite' }, scaleId: 'sur20' },
    { skill: 'speaking', label: { en: 'Spoken expression', fr: 'Expression orale' }, scaleId: 'sur20' },
  ],
  sections: [
    {
      kind: 'comprehension',
      id: 'comprehension-orale',
      sets: {
        questions: 39,
        source: "France Éducation international — TCF Canada, compréhension orale : 39 questions, 35 minutes.",
      },
      skill: 'listening',
      name: { en: 'Listening comprehension', fr: 'Compréhension orale' },
      // Published: 35 minutes for the épreuve. FEI, TCF Canada page.
      timeLimitSec: 35 * 60,
      // ── THE PAPER IS 39 QUESTIONS, AND THE BANK IS NOT THE PAPER ────────
      //
      // This section had NO serve spec until 31 August, and nobody noticed for
      // a simple reason: the bank held exactly thirty-nine recordings, so
      // "serve everything" and "serve the paper" were the same list. The night
      // twenty-eight were written to fill the empty coordinates, they stopped
      // being the same list, and `serveEpreuve` — which returns the whole bank
      // when no spec is declared — would have put **sixty-seven questions**
      // into a thirty-five-minute épreuve.
      //
      // It was caught by `comprehension.check.ts` before anything shipped, and
      // it is the third time this exact defect has appeared: the TCF written
      // section on 28 August, IELTS listening on 30 August, this on 31. The
      // shape is always the same — a spec that is unnecessary while the bank
      // is exactly one paper, and silently wrong the moment it is not.
      //
      // The profile is the one the bank was written to and the one the section
      // publishes as progressive difficulty. A2 currently holds exactly six,
      // so the épreuve cannot vary there yet; that is the next authoring
      // target and it is visible in the inventory rather than hidden here.
      serve: { count: 39, byBand: { A1: 4, A2: 6, B1: 9, B2: 10, C1: 6, C2: 4 } },
      scaleId: 'co699',
      delivery: {
        // The audio plays once. This is the rule candidates find hardest and
        // the one no competing product enforces.
        audioPlaysOnce: true,
        // And the question appears after it, not during it — so the item
        // tests listening rather than reading-while-listening.
        questionAfterAudio: true,
        transcriptDuringSection: false,
        presentation: 'one_at_a_time',
        clock: 'section',
        answersLockedOnAnswer: false,
        feedbackDuringSection: false,
      },
      provenance: {
        en: 'Every item in this section was written for this product, to the published format — 39 questions, ordered by progressive difficulty — and no real exam question is reproduced. The A1-to-C2 banding is ours: the exam publishes that difficulty rises across the section and does not publish which item sits at which level. Recordings use three French varieties — Parisian French as the majority, with Québécois and Swiss voices among them, applied inside each band rather than by level.',
        fr: "Tous les items de cette épreuve ont été rédigés pour ce produit, selon le format publié — 39 questions, à difficulté progressive — sans reproduire aucune question réelle d'examen. Le classement A1 à C2 est le nôtre : l'examen indique que la difficulté augmente, sans publier le niveau de chaque item. Les enregistrements emploient trois variétés de français — surtout du français parisien, avec des voix québécoises et suisses, réparties à l'intérieur de chaque niveau et non par ordre de difficulté.",
      },
      families: [
        {
          id: 'annonce',
          label: { en: 'Announcement or short message', fr: 'Annonce ou message court' },
          describes: {
            en: 'One voice, a few seconds: a public address, a recorded message, a piece of practical information. What is tested is catching one fact the first time it is said.',
            fr: "Une seule voix, quelques secondes : une annonce publique, un message enregistré, une information pratique. Ce qui est testé, c'est de saisir un fait à la première écoute.",
          },
          provenance: {
            en: 'Family names follow the item types France Éducation international publishes for the compréhension orale épreuve. The assignment of individual items to families is OURS and is unreviewed.',
            fr: "Les noms de familles suivent les types d'items publiés par France Éducation international pour l'épreuve de compréhension orale. L'affectation de chaque item à une famille est LA NÔTRE et n'a pas été relue.",
          },
        },
        {
          id: 'dialogue',
          label: { en: 'Short dialogue', fr: 'Dialogue court' },
          describes: {
            en: 'Two voices in an everyday exchange. What is tested is following who wants what, not the vocabulary.',
            fr: "Deux voix dans un échange quotidien. Ce qui est testé, c'est de suivre qui veut quoi, non le vocabulaire.",
          },
          provenance: {
            en: 'As above.',
            fr: 'Comme ci-dessus.',
          },
        },
        {
          id: 'expose',
          label: { en: 'Talk or report', fr: 'Exposé ou reportage' },
          describes: {
            en: 'One voice at length: a report, an explanation, an argued point. What is tested is holding a structure across more than one sentence.',
            fr: "Une voix qui dure : un reportage, une explication, un point de vue argumenté. Ce qui est testé, c'est de tenir une structure sur plus d'une phrase.",
          },
          provenance: {
            en: 'As above.',
            fr: 'Comme ci-dessus.',
          },
        },
      ],
      recordings: [
        {
          id: "tcf-co-01-r",
          audioPath: "tcf-co/tcf-co-01.mp3",
          variety: 'quebecois',
          level: "A1",
          family: "annonce",
          speakers: 1,
          voice: { voiceId: "UJCi4DDncuo0VJDSIegj", voiceIds: ["UJCi4DDncuo0VJDSIegj"], vendorName: "Amélie - Young, Confident and Friendly", requestedVariety: 'quebecois', modelId: "eleven_flash_v2_5", renderedAt: "2026-08-30" },
          script: "Bonjour, je voudrais un café, s'il vous plaît.",
        },
        {
          id: "tcf-co-02-r",
          audioPath: "tcf-co/tcf-co-02.mp3",
          variety: 'international',
          level: "A1",
          family: "annonce",
          speakers: 1,
          voice: {
            voiceId: "LFo5X4P9PhYaOLBA9Hyh",
            vendorName: "Clémence - Advertising",
            requestedVariety: 'international',
            modelId: "eleven_flash_v2_5",
            renderedAt: "2026-08-29",
          },
          script: "Le magasin ferme à dix-huit heures.",
        },
        {
          id: "tcf-co-03-r",
          audioPath: "tcf-co/tcf-co-03.mp3",
          variety: 'international',
          level: "A1",
          family: "annonce",
          speakers: 1,
          voice: {
            voiceId: "LFo5X4P9PhYaOLBA9Hyh",
            vendorName: "Clémence - Advertising",
            requestedVariety: 'international',
            modelId: "eleven_flash_v2_5",
            renderedAt: "2026-08-29",
          },
          script: "Excusez-moi, où sont les toilettes ?",
        },
        {
          id: "tcf-co-04-r",
          audioPath: "tcf-co/tcf-co-04.mp3",
          variety: 'swiss',
          level: "A1",
          family: "annonce",
          speakers: 1,
          voice: { voiceId: "liiuwXIkU9JRzMLLqlt9", voiceIds: ["liiuwXIkU9JRzMLLqlt9"], vendorName: "Nathalie - Tender and Optimistic", requestedVariety: 'swiss', modelId: "eleven_flash_v2_5", renderedAt: "2026-08-30" },
          script: "Il pleut beaucoup aujourd'hui, prends ton parapluie.",
        },
        {
          id: "tcf-co-56-r",
          audioPath: "tcf-co/tcf-co-56.mp3",
          variety: 'quebecois',
          voice: { voiceId: "UJCi4DDncuo0VJDSIegj", voiceIds: ["UJCi4DDncuo0VJDSIegj", "1Ko2KP4agGOYHL6KVMtm"], vendorName: "Amélie - Young, Confident and Friendly + Alexandre - Authentic French Canadian", requestedVariety: 'quebecois', modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 2,
          level: 'A1',
          family: 'dialogue',
          freshness: 'current',
          script: "— Bonjour, je voudrais deux billets pour Montréal.\n— Pour aujourd'hui ou pour demain ?",
        },
        {
          id: "tcf-co-57-r",
          audioPath: "tcf-co/tcf-co-57.mp3",
          variety: 'international',
          voice: { voiceId: "LFo5X4P9PhYaOLBA9Hyh", voiceIds: ["LFo5X4P9PhYaOLBA9Hyh", "1a3lMdKLUcfcMtvN772u"], vendorName: "Clémence - Advertising + Antoine - Audiobook Narrator", requestedVariety: 'international', modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 2,
          level: 'A1',
          family: 'dialogue',
          freshness: 'current',
          script: "— Le musée ouvre à quelle heure ?\n— À dix heures, tous les jours.",
        },
        {
          id: "tcf-co-58-r",
          // ANCHOR. One per band, and the set is deliberately small: an
          // instrument that absorbs what it measures widens by exactly the
          // amount each item strays.
          //
          // ── HOW THESE SIX WERE CHOSEN, AND HOW THE FIRST RULE FAILED ─────
          // The first attempt took the recording of MEDIAN LENGTH in each
          // band. Objective, re-runnable, and wrong: length is one of four
          // measures, and a ladder chosen on one of them came out
          // non-monotonic on two others. `bank.check.ts` said so —
          // *"sentence length, clause depth did not rise"* — and it was right
          // about the yardstick rather than about the bank.
          //
          // These six are the recording CLOSEST TO ITS BAND'S MEDIAN PROFILE
          // on all four measures, normalised. An anchor should be the ordinary
          // member of its band, and "ordinary" has to mean ordinary in what is
          // being measured. The band centres rise cleanly on every measure,
          // which is what the bank is supposed to do and what these now say.
          //
          // A1 and A2 sit below `MIN_MEASURABLE_WORDS`: a fifteen-word
          // exchange cannot define an envelope, so those two rungs are marked
          // and are deliberately not used as one. That is honest for a bank
          // whose easiest recordings are six words long.
          role: 'anchor',
          audioPath: "tcf-co/tcf-co-58.mp3",
          variety: 'international',
          voice: { voiceId: "LFo5X4P9PhYaOLBA9Hyh", voiceIds: ["LFo5X4P9PhYaOLBA9Hyh", "1a3lMdKLUcfcMtvN772u"], vendorName: "Clémence - Advertising + Antoine - Audiobook Narrator", requestedVariety: 'international', modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 2,
          level: 'A1',
          family: 'dialogue',
          freshness: 'current',
          script: "— Vous avez ce manteau en noir ?\n— Oui, mais seulement en petite taille.",
        },
        {
          id: "tcf-co-59-r",
          audioPath: "tcf-co/tcf-co-59.mp3",
          variety: 'quebecois',
          voice: { voiceId: "UJCi4DDncuo0VJDSIegj", voiceIds: ["UJCi4DDncuo0VJDSIegj", "1Ko2KP4agGOYHL6KVMtm"], vendorName: "Amélie - Young, Confident and Friendly + Alexandre - Authentic French Canadian", requestedVariety: 'quebecois', modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 2,
          level: 'A1',
          family: 'dialogue',
          freshness: 'current',
          script: "— Où est la station de métro ?\n— Tout droit, puis à gauche.",
        },
        {
          id: "tcf-co-60-r",
          audioPath: "tcf-co/tcf-co-60.mp3",
          variety: 'international',
          voice: { voiceId: "LFo5X4P9PhYaOLBA9Hyh", voiceIds: ["LFo5X4P9PhYaOLBA9Hyh"], vendorName: "Clémence - Advertising", requestedVariety: 'international', modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 1,
          level: 'A1',
          family: 'expose',
          freshness: 'current',
          script: "Le train pour Ottawa part à huit heures. Il arrive à midi.",
        },
        {
          id: "tcf-co-61-r",
          audioPath: "tcf-co/tcf-co-61.mp3",
          variety: 'quebecois',
          voice: { voiceId: "UJCi4DDncuo0VJDSIegj", voiceIds: ["UJCi4DDncuo0VJDSIegj"], vendorName: "Amélie - Young, Confident and Friendly", requestedVariety: 'quebecois', modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 1,
          level: 'A1',
          family: 'expose',
          freshness: 'current',
          script: "Aujourd'hui, il fait froid. Mettez un manteau avant de sortir.",
        },
        {
          id: "tcf-co-62-r",
          audioPath: "tcf-co/tcf-co-62.mp3",
          variety: 'international',
          voice: { voiceId: "LFo5X4P9PhYaOLBA9Hyh", voiceIds: ["LFo5X4P9PhYaOLBA9Hyh"], vendorName: "Clémence - Advertising", requestedVariety: 'international', modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 1,
          level: 'A1',
          family: 'expose',
          freshness: 'current',
          script: "La cafétéria est fermée le dimanche. Elle ouvre du lundi au samedi.",
        },
        {
          id: "tcf-co-63-r",
          audioPath: "tcf-co/tcf-co-63.mp3",
          variety: 'international',
          voice: { voiceId: "LFo5X4P9PhYaOLBA9Hyh", voiceIds: ["LFo5X4P9PhYaOLBA9Hyh"], vendorName: "Clémence - Advertising", requestedVariety: 'international', modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 1,
          level: 'A1',
          family: 'expose',
          freshness: 'current',
          script: "Le cours commence à neuf heures. La salle est au premier étage.",
        },
        {
          id: "tcf-co-68-r",
          audioPath: "tcf-co/tcf-co-68.mp3",
          variety: "international",
          voice: { voiceId: "LFo5X4P9PhYaOLBA9Hyh", voiceIds: ["LFo5X4P9PhYaOLBA9Hyh"], vendorName: "Clémence - Advertising", requestedVariety: "international", modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 1,
          level: 'A1',
          family: 'annonce',
          freshness: 'current',
          script: "Attention : le train pour Québec part du quai numéro trois.",
        },
        {
          id: "tcf-co-69-r",
          audioPath: "tcf-co/tcf-co-69.mp3",
          variety: "quebecois",
          voice: { voiceId: "UJCi4DDncuo0VJDSIegj", voiceIds: ["UJCi4DDncuo0VJDSIegj", "1Ko2KP4agGOYHL6KVMtm"], vendorName: "Amélie - Young, Confident and Friendly + Alexandre - Authentic French Canadian", requestedVariety: "quebecois", modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 2,
          level: 'A1',
          family: 'dialogue',
          freshness: 'current',
          script: "— Tu veux du thé ou du jus ?\n— Du jus, merci.",
        },
        {
          id: "tcf-co-70-r",
          audioPath: "tcf-co/tcf-co-70.mp3",
          variety: "international",
          voice: { voiceId: "1a3lMdKLUcfcMtvN772u", voiceIds: ["1a3lMdKLUcfcMtvN772u"], vendorName: "Antoine - Audiobook Narrator", requestedVariety: "international", modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 1,
          level: 'A1',
          family: 'expose',
          freshness: 'current',
          script: "Les vélos sont interdits dans le parc.",
        },
        {
          id: "tcf-co-05-r",
          audioPath: "tcf-co/tcf-co-05.mp3",
          variety: 'international',
          level: "A2",
          family: "dialogue",
          speakers: 2,
          voice: {
            voiceId: "LFo5X4P9PhYaOLBA9Hyh",
            voiceIds: ["LFo5X4P9PhYaOLBA9Hyh", "1a3lMdKLUcfcMtvN772u"],
            vendorName: "Clémence - Advertising + Antoine - Audiobook Narrator",
            requestedVariety: 'international',
            modelId: "eleven_flash_v2_5",
            renderedAt: "2026-08-29",
          },
          script: "— Bonjour, je cherche un appartement pour deux personnes.\n— Nous en avons un au troisième étage, mais il n'y a pas d'ascenseur.",
        },
        {
          id: "tcf-co-06-r",
          audioPath: "tcf-co/tcf-co-06.mp3",
          variety: 'quebecois',
          level: "A2",
          family: "expose",
          speakers: 1,
          voice: {
            voiceId: "UJCi4DDncuo0VJDSIegj",
            vendorName: "Amélie - Young, Confident and Friendly",
            requestedVariety: 'quebecois',
            modelId: "eleven_flash_v2_5",
            renderedAt: "2026-08-29",
          },
          script: "Mesdames et messieurs, en raison de travaux, l'autobus numéro 12 ne s'arrête pas devant l'hôpital ce matin. Merci de descendre à l'arrêt suivant.",
        },
        {
          id: "tcf-co-07-r",
          audioPath: "tcf-co/tcf-co-07.mp3",
          variety: 'swiss',
          level: "A2",
          family: "annonce",
          speakers: 1,
          voice: { voiceId: "liiuwXIkU9JRzMLLqlt9", voiceIds: ["liiuwXIkU9JRzMLLqlt9"], vendorName: "Nathalie - Tender and Optimistic", requestedVariety: 'swiss', modelId: "eleven_flash_v2_5", renderedAt: "2026-08-30" },
          script: "Pour vous inscrire au cours, remplissez d'abord le formulaire en ligne, puis apportez une pièce d'identité au bureau, le jeudi.",
        },
        {
          id: "tcf-co-08-r",
          // ANCHOR. One per band, and the set is deliberately small: an
          // instrument that absorbs what it measures widens by exactly the
          // amount each item strays.
          //
          // ── HOW THESE SIX WERE CHOSEN, AND HOW THE FIRST RULE FAILED ─────
          // The first attempt took the recording of MEDIAN LENGTH in each
          // band. Objective, re-runnable, and wrong: length is one of four
          // measures, and a ladder chosen on one of them came out
          // non-monotonic on two others. `bank.check.ts` said so —
          // *"sentence length, clause depth did not rise"* — and it was right
          // about the yardstick rather than about the bank.
          //
          // These six are the recording CLOSEST TO ITS BAND'S MEDIAN PROFILE
          // on all four measures, normalised. An anchor should be the ordinary
          // member of its band, and "ordinary" has to mean ordinary in what is
          // being measured. The band centres rise cleanly on every measure,
          // which is what the bank is supposed to do and what these now say.
          //
          // A1 and A2 sit below `MIN_MEASURABLE_WORDS`: a fifteen-word
          // exchange cannot define an envelope, so those two rungs are marked
          // and are deliberately not used as one. That is honest for a bank
          // whose easiest recordings are six words long.
          role: 'anchor',
          audioPath: "tcf-co/tcf-co-08.mp3",
          variety: 'quebecois',
          level: "A2",
          family: "dialogue",
          speakers: 2,
          voice: { voiceId: "UJCi4DDncuo0VJDSIegj", voiceIds: ["UJCi4DDncuo0VJDSIegj", "1Ko2KP4agGOYHL6KVMtm"], vendorName: "Amélie - Young, Confident and Friendly + Alexandre - Authentic French Canadian", requestedVariety: 'quebecois', modelId: "eleven_flash_v2_5", renderedAt: "2026-08-30" },
          script: "— Le rendez-vous chez le dentiste est à quelle heure ?\n— À neuf heures quinze, mais il faut arriver dix minutes avant.",
        },
        {
          id: "tcf-co-09-r",
          audioPath: "tcf-co/tcf-co-09.mp3",
          variety: 'international',
          level: "A2",
          family: "annonce",
          speakers: 1,
          voice: {
            voiceId: "LFo5X4P9PhYaOLBA9Hyh",
            vendorName: "Clémence - Advertising",
            requestedVariety: 'international',
            modelId: "eleven_flash_v2_5",
            renderedAt: "2026-08-29",
          },
          script: "Bonjour, ici le garage. Votre voiture est prête, mais nous fermons à midi le samedi. Venez plutôt lundi matin.",
        },
        {
          id: "tcf-co-10-r",
          audioPath: "tcf-co/tcf-co-10.mp3",
          variety: 'international',
          level: "A2",
          family: "dialogue",
          speakers: 2,
          voice: {
            voiceId: "LFo5X4P9PhYaOLBA9Hyh",
            voiceIds: ["LFo5X4P9PhYaOLBA9Hyh", "1a3lMdKLUcfcMtvN772u"],
            vendorName: "Clémence - Advertising + Antoine - Audiobook Narrator",
            requestedVariety: 'international',
            modelId: "eleven_flash_v2_5",
            renderedAt: "2026-08-29",
          },
          script: "— Tu prends le métro pour aller au travail ?\n— Non, je marche. C'est seulement quinze minutes.",
        },
        {
          id: "tcf-co-71-r",
          audioPath: "tcf-co/tcf-co-71.mp3",
          variety: "international",
          voice: { voiceId: "LFo5X4P9PhYaOLBA9Hyh", voiceIds: ["LFo5X4P9PhYaOLBA9Hyh"], vendorName: "Clémence - Advertising", requestedVariety: "international", modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 1,
          level: 'A2',
          family: 'annonce',
          freshness: 'current',
          script: "Chers clients, la caisse numéro quatre est maintenant ouverte. Vous pouvez vous y présenter avec vos achats.",
        },
        {
          id: "tcf-co-72-r",
          audioPath: "tcf-co/tcf-co-72.mp3",
          variety: "quebecois",
          voice: { voiceId: "UJCi4DDncuo0VJDSIegj", voiceIds: ["UJCi4DDncuo0VJDSIegj"], vendorName: "Amélie - Young, Confident and Friendly", requestedVariety: "quebecois", modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 1,
          level: 'A2',
          family: 'annonce',
          freshness: 'current',
          script: "L'ascenseur est en panne aujourd'hui. Merci d'utiliser l'escalier situé au fond du couloir.",
        },
        {
          id: "tcf-co-73-r",
          audioPath: "tcf-co/tcf-co-73.mp3",
          variety: "swiss",
          voice: { voiceId: "XeVbkJn7LVS2lH3RXcQJ", voiceIds: ["XeVbkJn7LVS2lH3RXcQJ"], vendorName: "Romain - Joyful, Optimistic and engaging", requestedVariety: "swiss", modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 1,
          level: 'A2',
          family: 'annonce',
          freshness: 'current',
          script: "La piscine municipale sera fermée samedi pour le nettoyage annuel. Elle rouvrira dimanche aux heures habituelles.",
        },
        {
          id: "tcf-co-74-r",
          audioPath: "tcf-co/tcf-co-74.mp3",
          variety: "international",
          voice: { voiceId: "LFo5X4P9PhYaOLBA9Hyh", voiceIds: ["LFo5X4P9PhYaOLBA9Hyh", "1a3lMdKLUcfcMtvN772u"], vendorName: "Clémence - Advertising + Antoine - Audiobook Narrator", requestedVariety: "international", modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 2,
          level: 'A2',
          family: 'dialogue',
          freshness: 'current',
          script: "— J'ai réservé une table pour quatre personnes, mais nous serons six.\n— Pas de problème, je vous installe près de la fenêtre.",
        },
        {
          id: "tcf-co-75-r",
          audioPath: "tcf-co/tcf-co-75.mp3",
          variety: "quebecois",
          voice: { voiceId: "UJCi4DDncuo0VJDSIegj", voiceIds: ["UJCi4DDncuo0VJDSIegj", "1Ko2KP4agGOYHL6KVMtm"], vendorName: "Amélie - Young, Confident and Friendly + Alexandre - Authentic French Canadian", requestedVariety: "quebecois", modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 2,
          level: 'A2',
          family: 'dialogue',
          freshness: 'current',
          script: "— Est-ce que le colis est arrivé ?\n— Pas encore, il devrait être livré demain matin.",
        },
        {
          id: "tcf-co-76-r",
          audioPath: "tcf-co/tcf-co-76.mp3",
          variety: "international",
          voice: { voiceId: "1a3lMdKLUcfcMtvN772u", voiceIds: ["1a3lMdKLUcfcMtvN772u"], vendorName: "Antoine - Audiobook Narrator", requestedVariety: "international", modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 1,
          level: 'A2',
          family: 'expose',
          freshness: 'current',
          script: "Le marché a lieu chaque mercredi sur la place centrale. On y trouve surtout des légumes et du fromage.",
        },
        {
          id: "tcf-co-77-r",
          audioPath: "tcf-co/tcf-co-77.mp3",
          variety: "international",
          voice: { voiceId: "LFo5X4P9PhYaOLBA9Hyh", voiceIds: ["LFo5X4P9PhYaOLBA9Hyh"], vendorName: "Clémence - Advertising", requestedVariety: "international", modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 1,
          level: 'A2',
          family: 'expose',
          freshness: 'current',
          script: "Pour emprunter un livre, il faut présenter sa carte. Le prêt dure trois semaines et peut être prolongé une fois.",
        },
        {
          id: "tcf-co-78-r",
          audioPath: "tcf-co/tcf-co-78.mp3",
          variety: "quebecois",
          voice: { voiceId: "1Ko2KP4agGOYHL6KVMtm", voiceIds: ["1Ko2KP4agGOYHL6KVMtm"], vendorName: "Alexandre - Authentic French Canadian", requestedVariety: "quebecois", modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 1,
          level: 'A2',
          family: 'expose',
          freshness: 'current',
          script: "Notre bureau déménage le mois prochain. La nouvelle adresse se trouve à côté de la gare, au troisième étage.",
        },
        {
          id: "tcf-co-79-r",
          audioPath: "tcf-co/tcf-co-79.mp3",
          variety: "international",
          voice: { voiceId: "1a3lMdKLUcfcMtvN772u", voiceIds: ["1a3lMdKLUcfcMtvN772u"], vendorName: "Antoine - Audiobook Narrator", requestedVariety: "international", modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 1,
          level: 'A2',
          family: 'expose',
          freshness: 'current',
          script: "Le cours de natation du jeudi est complet. Les personnes intéressées peuvent s'inscrire sur la liste d'attente à l'accueil.",
        },
        {
          id: "tcf-co-11-r",
          audioPath: "tcf-co/tcf-co-11.mp3",
          variety: 'international',
          level: "B1",
          family: "dialogue",
          speakers: 2,
          voice: {
            voiceId: "LFo5X4P9PhYaOLBA9Hyh",
            voiceIds: ["LFo5X4P9PhYaOLBA9Hyh", "1a3lMdKLUcfcMtvN772u"],
            vendorName: "Clémence - Advertising + Antoine - Audiobook Narrator",
            requestedVariety: 'international',
            modelId: "eleven_flash_v2_5",
            renderedAt: "2026-08-29",
          },
          script: "— Alors, cette formation en informatique, tu la commences quand ?\n— En principe en septembre. Mais je dois d'abord trouver quelqu'un pour garder les enfants le soir. Sinon, j'attendrai la session de janvier.",
        },
        {
          id: "tcf-co-12-r",
          audioPath: "tcf-co/tcf-co-12.mp3",
          variety: 'quebecois',
          level: "B1",
          family: "expose",
          speakers: 1,
          voice: {
            voiceId: "UJCi4DDncuo0VJDSIegj",
            vendorName: "Amélie - Young, Confident and Friendly",
            requestedVariety: 'quebecois',
            modelId: "eleven_flash_v2_5",
            renderedAt: "2026-08-29",
          },
          script: "Bonjour Madame, je vous appelle au sujet de votre demande de logement. Votre dossier est presque complet : il ne manque que la preuve de revenus. Sans ce document, nous ne pourrons pas l'examiner avant la fin du mois.",
        },
        {
          id: "tcf-co-13-r",
          audioPath: "tcf-co/tcf-co-13.mp3",
          variety: 'international',
          level: "B1",
          family: "dialogue",
          speakers: 2,
          voice: {
            voiceId: "LFo5X4P9PhYaOLBA9Hyh",
            voiceIds: ["LFo5X4P9PhYaOLBA9Hyh", "1a3lMdKLUcfcMtvN772u"],
            vendorName: "Clémence - Advertising + Antoine - Audiobook Narrator",
            requestedVariety: 'international',
            modelId: "eleven_flash_v2_5",
            renderedAt: "2026-08-29",
          },
          script: "— Tu as l'air fatigué.\n— J'ai changé d'horaire au travail. Je commence à cinq heures du matin maintenant. Le salaire est meilleur, mais je m'endors devant la télévision à huit heures du soir.",
        },
        {
          id: "tcf-co-14-r",
          // ANCHOR. One per band, and the set is deliberately small: an
          // instrument that absorbs what it measures widens by exactly the
          // amount each item strays.
          //
          // ── HOW THESE SIX WERE CHOSEN, AND HOW THE FIRST RULE FAILED ─────
          // The first attempt took the recording of MEDIAN LENGTH in each
          // band. Objective, re-runnable, and wrong: length is one of four
          // measures, and a ladder chosen on one of them came out
          // non-monotonic on two others. `bank.check.ts` said so —
          // *"sentence length, clause depth did not rise"* — and it was right
          // about the yardstick rather than about the bank.
          //
          // These six are the recording CLOSEST TO ITS BAND'S MEDIAN PROFILE
          // on all four measures, normalised. An anchor should be the ordinary
          // member of its band, and "ordinary" has to mean ordinary in what is
          // being measured. The band centres rise cleanly on every measure,
          // which is what the bank is supposed to do and what these now say.
          //
          // A1 and A2 sit below `MIN_MEASURABLE_WORDS`: a fifteen-word
          // exchange cannot define an envelope, so those two rungs are marked
          // and are deliberately not used as one. That is honest for a bank
          // whose easiest recordings are six words long.
          role: 'anchor',
          audioPath: "tcf-co/tcf-co-14.mp3",
          variety: 'quebecois',
          level: "B1",
          family: "expose",
          speakers: 1,
          voice: {
            voiceId: "UJCi4DDncuo0VJDSIegj",
            vendorName: "Amélie - Young, Confident and Friendly",
            requestedVariety: 'quebecois',
            modelId: "eleven_flash_v2_5",
            renderedAt: "2026-08-29",
          },
          script: "Chers usagers, la bibliothèque restera ouverte pendant toute la durée des travaux. En revanche, l'entrée principale sera fermée : utilisez la porte située du côté du parc. Les retours de livres se font toujours à l'accueil.",
        },
        {
          id: "tcf-co-15-r",
          audioPath: "tcf-co/tcf-co-15.mp3",
          variety: 'international',
          level: "B1",
          family: "dialogue",
          speakers: 2,
          voice: {
            voiceId: "LFo5X4P9PhYaOLBA9Hyh",
            voiceIds: ["LFo5X4P9PhYaOLBA9Hyh", "1a3lMdKLUcfcMtvN772u"],
            vendorName: "Clémence - Advertising + Antoine - Audiobook Narrator",
            requestedVariety: 'international',
            modelId: "eleven_flash_v2_5",
            renderedAt: "2026-08-29",
          },
          script: "— Vous avez déjà travaillé dans la vente ?\n— Pas exactement. J'ai été serveur pendant trois ans, donc j'ai l'habitude du contact avec les clients, mais je n'ai jamais tenu une caisse.",
        },
        {
          id: "tcf-co-16-r",
          audioPath: "tcf-co/tcf-co-16.mp3",
          variety: 'international',
          level: "B1",
          family: "dialogue",
          speakers: 2,
          voice: { voiceId: "LFo5X4P9PhYaOLBA9Hyh", voiceIds: ["LFo5X4P9PhYaOLBA9Hyh", "1a3lMdKLUcfcMtvN772u"], vendorName: "Clémence - Advertising + Antoine - Audiobook Narrator", requestedVariety: 'international', modelId: "eleven_flash_v2_5", renderedAt: "2026-08-30" },
          script: "— Le colis devait arriver hier.\n— Je vois qu'il est passé par notre centre de tri ce matin. Il sera livré demain avant midi. Si personne n'est présent, il sera déposé au bureau de poste du quartier.",
        },
        {
          id: "tcf-co-17-r",
          audioPath: "tcf-co/tcf-co-17.mp3",
          variety: 'international',
          level: "B1",
          family: "expose",
          speakers: 1,
          voice: {
            voiceId: "LFo5X4P9PhYaOLBA9Hyh",
            vendorName: "Clémence - Advertising",
            requestedVariety: 'international',
            modelId: "eleven_flash_v2_5",
            renderedAt: "2026-08-29",
          },
          script: "Voici mon message pour l'équipe : la réunion de vendredi est déplacée à mardi prochain, même heure, même salle. Ceux qui ne pourront pas venir sont invités à envoyer leurs commentaires par écrit avant lundi soir.",
        },
        {
          id: "tcf-co-18-r",
          audioPath: "tcf-co/tcf-co-18.mp3",
          variety: 'quebecois',
          level: "B1",
          family: "dialogue",
          speakers: 2,
          voice: {
            voiceId: "UJCi4DDncuo0VJDSIegj",
            voiceIds: ["UJCi4DDncuo0VJDSIegj", "1Ko2KP4agGOYHL6KVMtm"],
            vendorName: "Amélie - Young, Confident and Friendly + Alexandre - Authentic French Canadian",
            requestedVariety: 'quebecois',
            modelId: "eleven_flash_v2_5",
            renderedAt: "2026-08-29",
          },
          script: "— Tu as trouvé un médecin de famille ?\n— Non, je suis sur une liste d'attente depuis huit mois. En attendant, quand j'ai un problème, je vais dans une clinique sans rendez-vous. On y attend longtemps, mais au moins on est vu le jour même.",
        },
        {
          id: "tcf-co-19-r",
          audioPath: "tcf-co/tcf-co-19.mp3",
          variety: 'swiss',
          level: "B1",
          family: "dialogue",
          speakers: 2,
          voice: {
            voiceId: "liiuwXIkU9JRzMLLqlt9",
            voiceIds: ["liiuwXIkU9JRzMLLqlt9", "XeVbkJn7LVS2lH3RxcQJ"],
            vendorName: "Nathalie - Tender and Optimistic + Romain - Joyful, Optimistic and engaging",
            requestedVariety: 'swiss',
            modelId: "eleven_flash_v2_5",
            renderedAt: "2026-08-29",
          },
          script: "— J'hésite encore entre les deux logements.\n— Le premier est plus grand et moins cher, mais il est à quarante minutes du centre. Le deuxième est petit, plus cher, et tu descends au travail à pied. À toi de voir ce que tu préfères perdre : du temps ou de l'argent.",
        },
        {
          id: "tcf-co-40-r",
          audioPath: "tcf-co/tcf-co-40.mp3",
          variety: 'international',
          voice: { voiceId: "LFo5X4P9PhYaOLBA9Hyh", voiceIds: ["LFo5X4P9PhYaOLBA9Hyh"], vendorName: "Clémence - Advertising", requestedVariety: 'international', modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 1,
          level: 'B1',
          family: 'annonce',
          freshness: 'current',
          script: "Mesdames et messieurs, le train pour Québec change de quai. Il partira du quai numéro sept, et non du quai trois. Les voyageurs déjà installés sont priés de se déplacer maintenant. L'heure du départ reste celle qui était annoncée.",
        },
        {
          id: "tcf-co-41-r",
          audioPath: "tcf-co/tcf-co-41.mp3",
          variety: 'quebecois',
          voice: { voiceId: "UJCi4DDncuo0VJDSIegj", voiceIds: ["UJCi4DDncuo0VJDSIegj"], vendorName: "Amélie - Young, Confident and Friendly", requestedVariety: 'quebecois', modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 1,
          level: 'B1',
          family: 'annonce',
          freshness: 'current',
          script: "Chers clients, notre rayon boulangerie ferme exceptionnellement à seize heures. Un nettoyage complet est prévu pendant toute la soirée. Les autres rayons restent accessibles jusqu'à leur horaire habituel. Le pain déjà présenté reste en vente jusqu'à la fermeture.",
        },
        {
          id: "tcf-co-42-r",
          audioPath: "tcf-co/tcf-co-42.mp3",
          variety: 'swiss',
          voice: { voiceId: "liiuwXIkU9JRzMLLqlt9", voiceIds: ["liiuwXIkU9JRzMLLqlt9"], vendorName: "Nathalie - Tender and Optimistic", requestedVariety: 'swiss', modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 1,
          level: 'B1',
          family: 'annonce',
          freshness: 'current',
          script: "Bonjour, vous êtes bien à la mairie de Sainte-Foy. Nos bureaux sont fermés au public le mercredi après-midi. Pour une demande de passeport, prenez rendez-vous en ligne : nous ne recevons plus sans rendez-vous depuis le mois dernier. Pour tout le reste, présentez-vous directement au guichet.",
        },
        {
          id: "tcf-co-43-r",
          audioPath: "tcf-co/tcf-co-43.mp3",
          variety: 'international',
          voice: { voiceId: "LFo5X4P9PhYaOLBA9Hyh", voiceIds: ["LFo5X4P9PhYaOLBA9Hyh"], vendorName: "Clémence - Advertising", requestedVariety: 'international', modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 1,
          level: 'B1',
          family: 'annonce',
          freshness: 'current',
          script: "Attention, la piscine municipale sera vidée pour entretien complet. Les cours d'aquagym sont annulés du lundi au vendredi. La salle de sport reste accessible, mais temporairement sans vestiaires. Aucun remboursement : la semaine perdue sera ajoutée à la fin.",
        },
        {
          id: "tcf-co-80-r",
          audioPath: "tcf-co/tcf-co-80.mp3",
          variety: "international",
          voice: { voiceId: "LFo5X4P9PhYaOLBA9Hyh", voiceIds: ["LFo5X4P9PhYaOLBA9Hyh"], vendorName: "Clémence - Advertising", requestedVariety: "international", modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 1,
          level: 'B1',
          family: 'annonce',
          freshness: 'current',
          script: "Les guichets de cette agence sont en panne. Le personnel reste à l'intérieur pour vous aider. L'agence voisine est à cinq minutes à pied. Elle marche bien.",
        },
        {
          id: "tcf-co-81-r",
          audioPath: "tcf-co/tcf-co-81.mp3",
          variety: "swiss",
          voice: { voiceId: "liiuwXIkU9JRzMLLqlt9", voiceIds: ["liiuwXIkU9JRzMLLqlt9"], vendorName: "Nathalie - Tender and Optimistic", requestedVariety: "swiss", modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 1,
          level: 'B1',
          family: 'annonce',
          freshness: 'current',
          script: "Les travaux de la rue Sainte-Catherine durent jusqu'à la fin du mois. La rue reste ouverte dans un seul sens. Les magasins restent ouverts. On y va à pied par le trottoir nord.",
        },
        {
          id: "tcf-co-82-r",
          audioPath: "tcf-co/tcf-co-82.mp3",
          variety: "quebecois",
          voice: { voiceId: "UJCi4DDncuo0VJDSIegj", voiceIds: ["UJCi4DDncuo0VJDSIegj", "1Ko2KP4agGOYHL6KVMtm"], vendorName: "Amélie - Young, Confident and Friendly + Alexandre - Authentic French Canadian", requestedVariety: "quebecois", modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 2,
          level: 'B1',
          family: 'dialogue',
          freshness: 'current',
          script: "— J'hésite entre l'abonnement mensuel et la carte à dix trajets.\n— Si vous voyagez plus de trois fois par semaine, l'abonnement revient moins cher ; sinon la carte suffit largement.",
        },
        {
          id: "tcf-co-83-r",
          audioPath: "tcf-co/tcf-co-83.mp3",
          variety: "international",
          voice: { voiceId: "1a3lMdKLUcfcMtvN772u", voiceIds: ["1a3lMdKLUcfcMtvN772u"], vendorName: "Antoine - Audiobook Narrator", requestedVariety: "international", modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 1,
          level: 'B1',
          family: 'expose',
          freshness: 'current',
          script: "Depuis la rentrée, la cantine propose un menu végétarien chaque jour. La mesure devait durer un trimestre, mais la fréquentation a doublé et l'établissement a décidé de la conserver toute l'année.",
        },
        {
          id: "tcf-co-84-r",
          audioPath: "tcf-co/tcf-co-84.mp3",
          variety: "international",
          voice: { voiceId: "LFo5X4P9PhYaOLBA9Hyh", voiceIds: ["LFo5X4P9PhYaOLBA9Hyh"], vendorName: "Clémence - Advertising", requestedVariety: "international", modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 1,
          level: 'B1',
          family: 'expose',
          freshness: 'current',
          script: "Le service de vélos compte aujourd'hui quarante stations. La ville en voulait soixante. Le budget voté au printemps n'a payé que les deux tiers.",
        },
        {
          id: "tcf-co-85-r",
          audioPath: "tcf-co/tcf-co-85.mp3",
          variety: "quebecois",
          voice: { voiceId: "UJCi4DDncuo0VJDSIegj", voiceIds: ["UJCi4DDncuo0VJDSIegj"], vendorName: "Amélie - Young, Confident and Friendly", requestedVariety: "quebecois", modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 1,
          level: 'B1',
          family: 'expose',
          freshness: 'current',
          script: "Le musée est gratuit le premier dimanche du mois. Ce jour-là, il y a beaucoup de monde. La direction conseille d'arriver tôt. On peut aussi venir un autre jour et payer.",
        },
        {
          id: "tcf-co-86-r",
          audioPath: "tcf-co/tcf-co-86.mp3",
          variety: "international",
          voice: { voiceId: "1a3lMdKLUcfcMtvN772u", voiceIds: ["1a3lMdKLUcfcMtvN772u"], vendorName: "Antoine - Audiobook Narrator", requestedVariety: "international", modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 1,
          level: 'B1',
          family: 'expose',
          freshness: 'current',
          script: "L'entreprise a posé des panneaux solaires sur le toit. Ils couvrent un tiers des besoins du bâtiment. Le reste est acheté au réseau public.",
        },
        {
          id: "tcf-co-20-r",
          audioPath: "tcf-co/tcf-co-20.mp3",
          variety: 'international',
          level: "B2",
          family: "expose",
          speakers: 1,
          voice: {
            voiceId: "LFo5X4P9PhYaOLBA9Hyh",
            vendorName: "Clémence - Advertising",
            requestedVariety: 'international',
            modelId: "eleven_flash_v2_5",
            renderedAt: "2026-08-29",
          },
          script: "Selon une étude publiée cette semaine, le télétravail n'a pas fait baisser la productivité des entreprises interrogées. Ce sont plutôt les réunions qui se sont multipliées. Les auteurs relèvent que les employés déclarent travailler autant qu'avant, mais se plaignent davantage d'un sentiment d'isolement.",
        },
        {
          id: "tcf-co-21-r",
          audioPath: "tcf-co/tcf-co-21.mp3",
          variety: 'quebecois',
          level: "B2",
          family: "dialogue",
          speakers: 2,
          voice: {
            voiceId: "UJCi4DDncuo0VJDSIegj",
            voiceIds: ["UJCi4DDncuo0VJDSIegj", "1Ko2KP4agGOYHL6KVMtm"],
            vendorName: "Amélie - Young, Confident and Friendly + Alexandre - Authentic French Canadian",
            requestedVariety: 'quebecois',
            modelId: "eleven_flash_v2_5",
            renderedAt: "2026-08-29",
          },
          script: "— On m'a demandé de reprendre le dossier de Sofia pendant son congé.\n— Tu vas t'en sortir ?\n— Le travail lui-même, oui, je le connais. Ce qui m'ennuie, c'est qu'on ne m'a rien dit sur la date de son retour, et j'ai mes propres échéances en novembre.",
        },
        {
          id: "tcf-co-22-r",
          // ANCHOR. One per band, and the set is deliberately small: an
          // instrument that absorbs what it measures widens by exactly the
          // amount each item strays.
          //
          // ── HOW THESE SIX WERE CHOSEN, AND HOW THE FIRST RULE FAILED ─────
          // The first attempt took the recording of MEDIAN LENGTH in each
          // band. Objective, re-runnable, and wrong: length is one of four
          // measures, and a ladder chosen on one of them came out
          // non-monotonic on two others. `bank.check.ts` said so —
          // *"sentence length, clause depth did not rise"* — and it was right
          // about the yardstick rather than about the bank.
          //
          // These six are the recording CLOSEST TO ITS BAND'S MEDIAN PROFILE
          // on all four measures, normalised. An anchor should be the ordinary
          // member of its band, and "ordinary" has to mean ordinary in what is
          // being measured. The band centres rise cleanly on every measure,
          // which is what the bank is supposed to do and what these now say.
          //
          // A1 and A2 sit below `MIN_MEASURABLE_WORDS`: a fifteen-word
          // exchange cannot define an envelope, so those two rungs are marked
          // and are deliberately not used as one. That is honest for a bank
          // whose easiest recordings are six words long.
          role: 'anchor',
          audioPath: "tcf-co/tcf-co-22.mp3",
          variety: 'international',
          level: "B2",
          family: "expose",
          speakers: 1,
          voice: {
            voiceId: "LFo5X4P9PhYaOLBA9Hyh",
            vendorName: "Clémence - Advertising",
            requestedVariety: 'international',
            modelId: "eleven_flash_v2_5",
            renderedAt: "2026-08-29",
          },
          script: "Personnellement, je ne suis pas contre l'idée d'augmenter le prix des transports. Ce qui me dérange, c'est qu'on nous annonce cette hausse en même temps qu'une réduction du nombre d'autobus le soir. Payer plus pour un meilleur service, d'accord. Payer plus pour attendre plus longtemps, non.",
        },
        {
          id: "tcf-co-23-r",
          audioPath: "tcf-co/tcf-co-23.mp3",
          variety: 'quebecois',
          level: "B2",
          family: "expose",
          speakers: 1,
          voice: {
            voiceId: "UJCi4DDncuo0VJDSIegj",
            vendorName: "Amélie - Young, Confident and Friendly",
            requestedVariety: 'quebecois',
            modelId: "eleven_flash_v2_5",
            renderedAt: "2026-08-29",
          },
          script: "Le nouveau règlement municipal oblige les propriétaires à déclarer les logements loués à court terme. Les associations de locataires saluent la mesure. Elles rappellent toutefois qu'un règlement sans inspecteurs pour le faire appliquer reste une déclaration d'intention.",
        },
        {
          id: "tcf-co-24-r",
          audioPath: "tcf-co/tcf-co-24.mp3",
          variety: 'international',
          level: "B2",
          family: "dialogue",
          speakers: 2,
          voice: {
            voiceId: "LFo5X4P9PhYaOLBA9Hyh",
            voiceIds: ["LFo5X4P9PhYaOLBA9Hyh", "1a3lMdKLUcfcMtvN772u"],
            vendorName: "Clémence - Advertising + Antoine - Audiobook Narrator",
            requestedVariety: 'international',
            modelId: "eleven_flash_v2_5",
            renderedAt: "2026-08-29",
          },
          script: "— Votre candidature nous a intéressés, mais le poste suppose de se déplacer une semaine par mois.\n— Ce n'est pas un obstacle en soi. En revanche, j'aimerais savoir si ces déplacements sont planifiés à l'avance, parce que j'ai des obligations familiales fixes le mercredi.",
        },
        {
          id: "tcf-co-25-r",
          audioPath: "tcf-co/tcf-co-25.mp3",
          variety: 'quebecois',
          level: "B2",
          family: "dialogue",
          speakers: 2,
          voice: { voiceId: "UJCi4DDncuo0VJDSIegj", voiceIds: ["UJCi4DDncuo0VJDSIegj", "1Ko2KP4agGOYHL6KVMtm"], vendorName: "Amélie - Young, Confident and Friendly + Alexandre - Authentic French Canadian", requestedVariety: 'quebecois', modelId: "eleven_flash_v2_5", renderedAt: "2026-08-30" },
          script: "— Alors, ce cours du soir ?\n— Le contenu est excellent, vraiment. Mais franchement, trois heures de cours après une journée de travail, j'ai fini par remarquer que je ne retiens à peu près que la première heure. Je vais peut-être passer au format du samedi matin.",
        },
        {
          id: "tcf-co-26-r",
          audioPath: "tcf-co/tcf-co-26.mp3",
          variety: 'international',
          level: "B2",
          family: "expose",
          speakers: 1,
          voice: {
            voiceId: "LFo5X4P9PhYaOLBA9Hyh",
            vendorName: "Clémence - Advertising",
            requestedVariety: 'international',
            modelId: "eleven_flash_v2_5",
            renderedAt: "2026-08-29",
          },
          script: "On répète souvent que les jeunes lisent de moins en moins. Les chiffres montrent surtout qu'ils lisent autrement : moins de livres imprimés, beaucoup plus de textes en ligne. Ce qui recule, ce n'est donc pas la lecture, c'est un certain support.",
        },
        {
          id: "tcf-co-27-r",
          audioPath: "tcf-co/tcf-co-27.mp3",
          variety: 'international',
          level: "B2",
          family: "expose",
          speakers: 1,
          voice: { voiceId: "LFo5X4P9PhYaOLBA9Hyh", voiceIds: ["LFo5X4P9PhYaOLBA9Hyh"], vendorName: "Clémence - Advertising", requestedVariety: 'international', modelId: "eleven_flash_v2_5", renderedAt: "2026-08-30" },
          script: "J'ai relu ton rapport hier soir. C'est solide, les données tiennent, et la méthode est claire. Je te dirai simplement une chose : ta recommandation arrive à la page onze. Personne, au comité, ne lira jusque-là.",
        },
        {
          id: "tcf-co-28-r",
          audioPath: "tcf-co/tcf-co-28.mp3",
          variety: 'international',
          level: "B2",
          family: "expose",
          speakers: 1,
          voice: {
            voiceId: "LFo5X4P9PhYaOLBA9Hyh",
            vendorName: "Clémence - Advertising",
            requestedVariety: 'international',
            modelId: "eleven_flash_v2_5",
            renderedAt: "2026-08-29",
          },
          script: "La ville a inauguré hier sa première piste cyclable protégée. Le maire y voit un signal fort en faveur des déplacements actifs. Les commerçants du quartier, eux, comptent surtout les places de stationnement disparues. Un premier bilan de fréquentation est attendu au printemps.",
        },
        {
          id: "tcf-co-29-r",
          audioPath: "tcf-co/tcf-co-29.mp3",
          variety: 'swiss',
          level: "B2",
          family: "dialogue",
          speakers: 2,
          voice: {
            voiceId: "liiuwXIkU9JRzMLLqlt9",
            voiceIds: ["liiuwXIkU9JRzMLLqlt9", "XeVbkJn7LVS2lH3RxcQJ"],
            vendorName: "Nathalie - Tender and Optimistic + Romain - Joyful, Optimistic and engaging",
            requestedVariety: 'swiss',
            modelId: "eleven_flash_v2_5",
            renderedAt: "2026-08-29",
          },
          script: "— Vous nous dites donc que le délai de six semaines ne pose pas de problème.\n— Je dis que ce délai est tenable si les pièces arrivent en une seule livraison. Avec deux livraisons séparées, je ne m'engage sur rien.",
        },
        {
          id: "tcf-co-44-r",
          audioPath: "tcf-co/tcf-co-44.mp3",
          variety: 'international',
          voice: { voiceId: "LFo5X4P9PhYaOLBA9Hyh", voiceIds: ["LFo5X4P9PhYaOLBA9Hyh"], vendorName: "Clémence - Advertising", requestedVariety: 'international', modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 1,
          level: 'B2',
          family: 'annonce',
          freshness: 'current',
          script: "Nous informons notre clientèle que le service de livraison à domicile sera suspendu pendant trois semaines. Il ne s'agit pas d'un arrêt définitif, contrairement à ce que certains ont compris : nous changeons de prestataire, et l'ancien contrat se termine avant que le nouveau ne commence. Les commandes passées d'ici vendredi seront honorées par l'ancien service.",
        },
        {
          id: "tcf-co-45-r",
          audioPath: "tcf-co/tcf-co-45.mp3",
          variety: 'quebecois',
          voice: { voiceId: "UJCi4DDncuo0VJDSIegj", voiceIds: ["UJCi4DDncuo0VJDSIegj"], vendorName: "Amélie - Young, Confident and Friendly", requestedVariety: 'quebecois', modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 1,
          level: 'B2',
          family: 'annonce',
          freshness: 'current',
          script: "Nous informons notre clientèle que le bureau de poste de la rue Sainte-Anne fermera définitivement à la fin du mois, parce que le bail arrive à son terme. Les colis déjà arrivés pourront être retirés jusqu'au dernier jour d'ouverture. Ceux qui arriveront ensuite seront transférés au bureau du boulevard Laurier, sans démarche de votre part.",
        },
        {
          id: "tcf-co-46-r",
          audioPath: "tcf-co/tcf-co-46.mp3",
          variety: 'swiss',
          voice: { voiceId: "liiuwXIkU9JRzMLLqlt9", voiceIds: ["liiuwXIkU9JRzMLLqlt9"], vendorName: "Nathalie - Tender and Optimistic", requestedVariety: 'swiss', modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 1,
          level: 'B2',
          family: 'annonce',
          freshness: 'current',
          script: "Message aux locataires du bâtiment C : la coupure d'eau prévue jeudi est reportée à mardi prochain, à la même heure. Il ne s'agit pas d'une annulation, car les travaux doivent avoir lieu avant l'hiver et un nouveau report ne serait plus possible. Prévoyez une réserve d'eau pour toute la matinée, puisque le rétablissement peut demander plus de temps que prévu.",
        },
        {
          id: "tcf-co-47-r",
          audioPath: "tcf-co/tcf-co-47.mp3",
          variety: 'international',
          voice: { voiceId: "LFo5X4P9PhYaOLBA9Hyh", voiceIds: ["LFo5X4P9PhYaOLBA9Hyh"], vendorName: "Clémence - Advertising", requestedVariety: 'international', modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 1,
          level: 'B2',
          family: 'annonce',
          freshness: 'current',
          script: "Chers voyageurs, le vol à destination de Montréal est retardé d'environ deux heures. Nous ne connaissons pas encore l'heure exacte du départ, et nous préférons le dire plutôt que d'annoncer un horaire que nous devrions corriger ensuite. Restez dans la zone d'embarquement : l'appel se fera sans préavis.",
        },
        {
          id: "tcf-co-87-r",
          audioPath: "tcf-co/tcf-co-87.mp3",
          variety: "international",
          voice: { voiceId: "LFo5X4P9PhYaOLBA9Hyh", voiceIds: ["LFo5X4P9PhYaOLBA9Hyh"], vendorName: "Clémence - Advertising", requestedVariety: "international", modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 1,
          level: 'B2',
          family: 'annonce',
          freshness: 'current',
          script: "Nous informons les voyageurs que le vol de dix-sept heures est reporté à vingt heures, en raison d'une immobilisation technique de l'appareil. Les passagers en correspondance sont invités à se présenter au comptoir, où un nouvel itinéraire leur sera proposé sans frais supplémentaires.",
        },
        {
          id: "tcf-co-88-r",
          audioPath: "tcf-co/tcf-co-88.mp3",
          variety: "swiss",
          voice: { voiceId: "XeVbkJn7LVS2lH3RXcQJ", voiceIds: ["XeVbkJn7LVS2lH3RXcQJ"], vendorName: "Romain - Joyful, Optimistic and engaging", requestedVariety: "swiss", modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 1,
          level: 'B2',
          family: 'annonce',
          freshness: 'current',
          script: "À compter du premier octobre, le stationnement devant l'établissement sera réservé aux véhicules de livraison. La réservation vaut entre sept et onze heures. En dehors de cette période, les places restent accessibles, mais la durée maximale autorisée passe de quatre heures à deux.",
        },
        {
          id: "tcf-co-89-r",
          audioPath: "tcf-co/tcf-co-89.mp3",
          variety: "international",
          voice: { voiceId: "1a3lMdKLUcfcMtvN772u", voiceIds: ["1a3lMdKLUcfcMtvN772u"], vendorName: "Antoine - Audiobook Narrator", requestedVariety: "international", modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 1,
          level: 'B2',
          family: 'annonce',
          freshness: 'current',
          script: "La direction rappelle que les congés doivent être demandés trois semaines avant la date voulue, sans exception. Une demande tardive, elle, ne sera pas refusée d'office. Elle passera après celles qui respectent le délai, une fois les premières traitées.",
        },
        {
          id: "tcf-co-90-r",
          audioPath: "tcf-co/tcf-co-90.mp3",
          variety: "quebecois",
          voice: { voiceId: "UJCi4DDncuo0VJDSIegj", voiceIds: ["UJCi4DDncuo0VJDSIegj", "1Ko2KP4agGOYHL6KVMtm"], vendorName: "Amélie - Young, Confident and Friendly + Alexandre - Authentic French Canadian", requestedVariety: "quebecois", modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 2,
          level: 'B2',
          family: 'dialogue',
          freshness: 'current',
          script: "— Le devis a progressé de six cents dollars depuis la première version, sans explication.\n— L'augmentation vient du matériau que vous avez choisi pendant le chantier. Il résiste davantage à l'humidité, mais son prix dépasse largement celui du devis initial.",
        },
        {
          id: "tcf-co-91-r",
          audioPath: "tcf-co/tcf-co-91.mp3",
          variety: "international",
          voice: { voiceId: "LFo5X4P9PhYaOLBA9Hyh", voiceIds: ["LFo5X4P9PhYaOLBA9Hyh", "1a3lMdKLUcfcMtvN772u"], vendorName: "Clémence - Advertising + Antoine - Audiobook Narrator", requestedVariety: "international", modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 2,
          level: 'B2',
          family: 'dialogue',
          freshness: 'current',
          script: "— Vous nous demandez un justificatif de domicile, mais je viens d'emménager et je n'ai encore aucune facture à mon nom.\n— Dans ce cas, une attestation d'hébergement signée par le propriétaire suffit, à condition qu'elle soit accompagnée de sa pièce d'identité.",
        },
        {
          id: "tcf-co-92-r",
          audioPath: "tcf-co/tcf-co-92.mp3",
          variety: "quebecois",
          voice: { voiceId: "UJCi4DDncuo0VJDSIegj", voiceIds: ["UJCi4DDncuo0VJDSIegj"], vendorName: "Amélie - Young, Confident and Friendly", requestedVariety: "quebecois", modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 1,
          level: 'B2',
          family: 'expose',
          freshness: 'current',
          script: "La commune a remplacé ses lampadaires par des modèles qui s'éteignent au milieu de la nuit. La facture a baissé d'un quart, ce qui était attendu. Ce qui l'était moins, c'est que les plaintes pour bruit nocturne ont diminué elles aussi, sans que personne sache encore l'expliquer.",
        },
        {
          id: "tcf-co-30-r",
          audioPath: "tcf-co/tcf-co-30.mp3",
          variety: 'international',
          level: "C1",
          family: "expose",
          speakers: 1,
          voice: {
            voiceId: "LFo5X4P9PhYaOLBA9Hyh",
            vendorName: "Clémence - Advertising",
            requestedVariety: 'international',
            modelId: "eleven_flash_v2_5",
            renderedAt: "2026-08-29",
          },
          script: "Quand on me demande si l'automatisation va supprimer des emplois, je réponds toujours par une autre question : lesquels, et pour qui ? Historiquement, les métiers ne disparaissent pas d'un bloc ; ce sont des tâches qui migrent, d'un poste à un autre, parfois d'un secteur à un autre. Le problème n'est donc pas l'ampleur du changement, mais sa vitesse. Une génération peut absorber une transformation de cette nature. Un trimestre ne le peut pas.",
        },
        {
          id: "tcf-co-31-r",
          audioPath: "tcf-co/tcf-co-31.mp3",
          variety: 'quebecois',
          level: "C1",
          family: "expose",
          speakers: 1,
          voice: {
            voiceId: "UJCi4DDncuo0VJDSIegj",
            vendorName: "Amélie - Young, Confident and Friendly",
            requestedVariety: 'quebecois',
            modelId: "eleven_flash_v2_5",
            renderedAt: "2026-08-29",
          },
          script: "Je vous remercie de cette proposition, qui témoigne d'une réelle réflexion et d'un vrai travail de terrain. Vous comprendrez néanmoins que le conseil, à ce stade de l'exercice budgétaire, ne puisse retenir un projet dont le financement repose sur des recettes encore hypothétiques. Revenez nous voir en janvier.",
        },
        {
          id: "tcf-co-32-r",
          audioPath: "tcf-co/tcf-co-32.mp3",
          variety: 'international',
          level: "C1",
          family: "expose",
          speakers: 1,
          voice: {
            voiceId: "LFo5X4P9PhYaOLBA9Hyh",
            vendorName: "Clémence - Advertising",
            requestedVariety: 'international',
            modelId: "eleven_flash_v2_5",
            renderedAt: "2026-08-29",
          },
          script: "Ce que j'entends dans ce débat, ce sont deux définitions du mot intégration qui ne se rencontrent jamais. Pour les uns, c'est un résultat que l'on mesure : l'emploi, la langue, le logement. Pour les autres, c'est un processus, qui suppose que la société d'accueil bouge elle aussi. Tant que nous ne dirons pas de quoi nous parlons, nous continuerons à nous indigner en croyant nous répondre.",
        },
        {
          id: "tcf-co-33-r",
          audioPath: "tcf-co/tcf-co-33.mp3",
          variety: 'quebecois',
          level: "C1",
          family: "dialogue",
          speakers: 2,
          voice: { voiceId: "UJCi4DDncuo0VJDSIegj", voiceIds: ["UJCi4DDncuo0VJDSIegj", "1Ko2KP4agGOYHL6KVMtm"], vendorName: "Amélie - Young, Confident and Friendly + Alexandre - Authentic French Canadian", requestedVariety: 'quebecois', modelId: "eleven_flash_v2_5", renderedAt: "2026-08-30" },
          script: "— Vous avez passé dix ans dans ce service. Vous partez sans regret ?\n— Sans regret, ce serait beaucoup dire. Disons que j'ai fini par comprendre que ce qui me retenait n'était plus le travail, mais les gens. Et cela, on peut le garder en partant.",
        },
        {
          id: "tcf-co-34-r",
          audioPath: "tcf-co/tcf-co-34.mp3",
          variety: 'international',
          level: "C1",
          family: "expose",
          speakers: 1,
          voice: {
            voiceId: "LFo5X4P9PhYaOLBA9Hyh",
            vendorName: "Clémence - Advertising",
            requestedVariety: 'international',
            modelId: "eleven_flash_v2_5",
            renderedAt: "2026-08-29",
          },
          script: "On oppose volontiers la formation courte, qui rendrait immédiatement employable, et la formation longue, accusée d'être trop théorique. L'expérience des dix dernières années invite à la prudence : les compétences très ciblées se périment vite, précisément parce qu'elles collent au marché du moment. Ce qui résiste, au fond, ce n'est pas le savoir technique lui-même, c'est la capacité à en réapprendre un autre.",
        },
        {
          id: "tcf-co-35-r",
          audioPath: "tcf-co/tcf-co-35.mp3",
          variety: 'swiss',
          level: "C1",
          family: "expose",
          speakers: 1,
          voice: {
            voiceId: "liiuwXIkU9JRzMLLqlt9",
            vendorName: "Nathalie - Tender and Optimistic",
            requestedVariety: 'swiss',
            modelId: "eleven_flash_v2_5",
            renderedAt: "2026-08-29",
          },
          script: "Le rapport annuel se félicite d'une baisse des plaintes de dix-huit pour cent. On aimerait sincèrement partager cet enthousiasme. Encore faudrait-il savoir si les usagers se plaignent moins parce que le service s'est amélioré, ou parce que le formulaire de plainte a changé d'adresse trois fois en un an.",
        },
        {
          id: "tcf-co-48-r",
          // ANCHOR. One per band, and the set is deliberately small: an
          // instrument that absorbs what it measures widens by exactly the
          // amount each item strays.
          //
          // ── HOW THESE SIX WERE CHOSEN, AND HOW THE FIRST RULE FAILED ─────
          // The first attempt took the recording of MEDIAN LENGTH in each
          // band. Objective, re-runnable, and wrong: length is one of four
          // measures, and a ladder chosen on one of them came out
          // non-monotonic on two others. `bank.check.ts` said so —
          // *"sentence length, clause depth did not rise"* — and it was right
          // about the yardstick rather than about the bank.
          //
          // These six are the recording CLOSEST TO ITS BAND'S MEDIAN PROFILE
          // on all four measures, normalised. An anchor should be the ordinary
          // member of its band, and "ordinary" has to mean ordinary in what is
          // being measured. The band centres rise cleanly on every measure,
          // which is what the bank is supposed to do and what these now say.
          //
          // A1 and A2 sit below `MIN_MEASURABLE_WORDS`: a fifteen-word
          // exchange cannot define an envelope, so those two rungs are marked
          // and are deliberately not used as one. That is honest for a bank
          // whose easiest recordings are six words long.
          role: 'anchor',
          audioPath: "tcf-co/tcf-co-48.mp3",
          variety: 'international',
          voice: { voiceId: "LFo5X4P9PhYaOLBA9Hyh", voiceIds: ["LFo5X4P9PhYaOLBA9Hyh"], vendorName: "Clémence - Advertising", requestedVariety: 'international', modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 1,
          level: 'C1',
          family: 'annonce',
          freshness: 'current',
          script: "Avis aux usagers de la ligne douze. Le service de nuit, qui devait être supprimé au printemps, sera finalement maintenu jusqu'en décembre, puisque la fréquentation observée cet hiver a dépassé les prévisions de la société. Cette prolongation ne préjuge cependant en rien de la décision finale, qui sera prise après une étude complète des coûts. Les horaires affichés en station restent valables.",
        },
        {
          id: "tcf-co-49-r",
          audioPath: "tcf-co/tcf-co-49.mp3",
          variety: 'quebecois',
          voice: { voiceId: "UJCi4DDncuo0VJDSIegj", voiceIds: ["UJCi4DDncuo0VJDSIegj"], vendorName: "Amélie - Young, Confident and Friendly", requestedVariety: 'quebecois', modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 1,
          level: 'C1',
          family: 'annonce',
          freshness: 'current',
          script: "Nous rappelons aux visiteurs que la photographie est permise dans toutes les salles, à une exception près. L'aile des estampes, où la lumière est volontairement réduite, ne s'y prête pas. Il ne s'agit pas des droits, contrairement à ce que l'on croit souvent, mais de la conservation. La lumière des appareils abîme les encres anciennes, lentement, et de façon définitive.",
        },
        {
          id: "tcf-co-50-r",
          audioPath: "tcf-co/tcf-co-50.mp3",
          variety: 'international',
          voice: { voiceId: "LFo5X4P9PhYaOLBA9Hyh", voiceIds: ["LFo5X4P9PhYaOLBA9Hyh"], vendorName: "Clémence - Advertising", requestedVariety: 'international', modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 1,
          level: 'C1',
          family: 'annonce',
          freshness: 'current',
          script: "Information destinée aux nouveaux inscrits, quelle que soit leur filière. Le paiement de la bourse arrive le quinze de chaque mois, sans exception. Le premier versement suit pourtant l'inscription de six semaines, le temps que le dossier soit vérifié. Ne comptez donc pas dessus pour le loyer, ni pour le dépôt de garantie.",
        },
        {
          id: "tcf-co-51-r",
          audioPath: "tcf-co/tcf-co-51.mp3",
          variety: 'international',
          voice: { voiceId: "LFo5X4P9PhYaOLBA9Hyh", voiceIds: ["LFo5X4P9PhYaOLBA9Hyh"], vendorName: "Clémence - Advertising", requestedVariety: 'international', modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 1,
          level: 'C1',
          family: 'annonce',
          freshness: 'current',
          script: "Chers abonnés, la salle de lecture ouvrira désormais à sept heures, et non plus à neuf. Cette ouverture avancée répond à une demande ancienne, faite depuis plusieurs années. Aucun agent de plus n'accompagne pourtant ce changement, ce qui limite ce qui est possible. Les prêts et les renseignements commenceront donc à neuf heures, comme auparavant.",
        },
        {
          id: "tcf-co-93-r",
          audioPath: "tcf-co/tcf-co-93.mp3",
          variety: "international",
          voice: { voiceId: "LFo5X4P9PhYaOLBA9Hyh", voiceIds: ["LFo5X4P9PhYaOLBA9Hyh"], vendorName: "Clémence - Advertising", requestedVariety: "international", modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 1,
          level: 'C1',
          family: 'annonce',
          freshness: 'current',
          script: "Nous rappelons aux détenteurs d'un abonnement annuel que le renouvellement, jusqu'ici automatique, devient une démarche volontaire à partir de janvier. Ceux qui ne se manifesteront pas verront leur accès suspendu sans que cela mette fin à leur compte, lequel restera consultable pendant douze mois. Passé ce délai, seules les données que la loi nous oblige à conserver seront gardées.",
        },
        {
          id: "tcf-co-94-r",
          audioPath: "tcf-co/tcf-co-94.mp3",
          variety: "quebecois",
          voice: { voiceId: "UJCi4DDncuo0VJDSIegj", voiceIds: ["UJCi4DDncuo0VJDSIegj", "1Ko2KP4agGOYHL6KVMtm"], vendorName: "Amélie - Young, Confident and Friendly + Alexandre - Authentic French Canadian", requestedVariety: "quebecois", modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 2,
          level: 'C1',
          family: 'dialogue',
          freshness: 'current',
          script: "— Vous soutenez que la formation a été suivie par tout le personnel, alors que le relevé de présence ne couvre que les équipes de jour.\n— Les équipes de nuit ont reçu la même formation, mais en ligne, et ce dispositif n'a jamais été intégré au relevé que vous consultez.\n— Admettons ; il reste que rien ne permet aujourd'hui de vérifier qui l'a réellement suivie, ce qui revient au même pour un audit.",
        },
        {
          id: "tcf-co-95-r",
          audioPath: "tcf-co/tcf-co-95.mp3",
          variety: "international",
          voice: { voiceId: "LFo5X4P9PhYaOLBA9Hyh", voiceIds: ["LFo5X4P9PhYaOLBA9Hyh", "1a3lMdKLUcfcMtvN772u"], vendorName: "Clémence - Advertising + Antoine - Audiobook Narrator", requestedVariety: "international", modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 2,
          level: 'C1',
          family: 'dialogue',
          freshness: 'current',
          script: "— Le rapport conclut à une amélioration, cependant il compare la satisfaction déclarée à l'arrivée et celle mesurée six mois plus tard, ce qui n'est pas la même chose.\n— La méthode a été validée par le comité scientifique, et je me garderais de la remettre en cause sur ce seul point.\n— Je ne remets pas la méthode en cause ; je dis que la conclusion va plus loin que ce que la méthode autorise.",
        },
        {
          id: "tcf-co-96-r",
          audioPath: "tcf-co/tcf-co-96.mp3",
          variety: "swiss",
          voice: { voiceId: "liiuwXIkU9JRzMLLqlt9", voiceIds: ["liiuwXIkU9JRzMLLqlt9", "XeVbkJn7LVS2lH3RXcQJ"], vendorName: "Nathalie - Tender and Optimistic + Romain - Joyful, Optimistic and engaging", requestedVariety: "swiss", modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 2,
          level: 'C1',
          family: 'dialogue',
          freshness: 'current',
          script: "— Nous avons réduit les délais de réponse de moitié, néanmoins les réclamations n'ont pas diminué, et j'avoue que je m'y attendais autrement.\n— Peut-être parce qu'une réponse rapide qui ne règle rien produit une deuxième réclamation, alors qu'une réponse lente mais complète en évite une.\n— C'est possible, toutefois nous n'avons rien qui permette de le montrer, et sans cela nous ne ferons que remplacer une hypothèse par une autre.",
        },
        {
          id: "tcf-co-97-r",
          audioPath: "tcf-co/tcf-co-97.mp3",
          variety: "quebecois",
          voice: { voiceId: "UJCi4DDncuo0VJDSIegj", voiceIds: ["UJCi4DDncuo0VJDSIegj", "1Ko2KP4agGOYHL6KVMtm"], vendorName: "Amélie - Young, Confident and Friendly + Alexandre - Authentic French Canadian", requestedVariety: "quebecois", modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 2,
          level: 'C1',
          family: 'dialogue',
          freshness: 'current',
          script: "— Vous avez retenu le candidat interne, bien que son dossier soit moins solide sur le plan technique que celui des deux autres.\n— Le poste demande surtout de faire travailler ensemble des services qui ne se parlent pas, et c'est là que son dossier est le plus solide.\n— Je l'entends, cependant il faudra l'expliquer, parce que le jury a été informé d'une grille où la technique pesait le plus lourd.",
        },
        {
          id: "tcf-co-98-r",
          audioPath: "tcf-co/tcf-co-98.mp3",
          variety: "international",
          voice: { voiceId: "1a3lMdKLUcfcMtvN772u", voiceIds: ["1a3lMdKLUcfcMtvN772u"], vendorName: "Antoine - Audiobook Narrator", requestedVariety: "international", modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 1,
          level: 'C1',
          family: 'expose',
          freshness: 'current',
          script: "L'établissement a ouvert une salle d'étude accessible jusqu'à minuit. La fréquentation a dépassé les prévisions dès la deuxième semaine, ce qui a été présenté comme un succès. Un relevé plus fin montre pourtant que la moitié des places sont occupées par des étudiants qui viennent y travailler faute de chauffage suffisant chez eux, si bien que la mesure répond à un besoin que personne n'avait cherché à mesurer.",
        },
        {
          id: "tcf-co-36-r",
          audioPath: "tcf-co/tcf-co-36.mp3",
          variety: 'international',
          level: "C2",
          family: "expose",
          speakers: 1,
          voice: {
            voiceId: "LFo5X4P9PhYaOLBA9Hyh",
            vendorName: "Clémence - Advertising",
            requestedVariety: 'international',
            modelId: "eleven_flash_v2_5",
            renderedAt: "2026-08-29",
          },
          script: "Il y a une élégance certaine dans la manière dont ce ministère annonce ses réformes : jamais un mot plus haut que l'autre, jamais un chiffre qui fâche, et toujours cette formule, à moyens constants, qui a le mérite de tout dire à ceux qui savent l'entendre. On nous promet donc davantage de services, dans les mêmes locaux, avec les mêmes équipes, et sans doute la même patience de la part des usagers. Le vocabulaire, lui, s'est considérablement enrichi.",
        },
        {
          id: "tcf-co-37-r",
          audioPath: "tcf-co/tcf-co-37.mp3",
          variety: 'international',
          level: "C2",
          family: "expose",
          speakers: 1,
          voice: {
            voiceId: "LFo5X4P9PhYaOLBA9Hyh",
            vendorName: "Clémence - Advertising",
            requestedVariety: 'international',
            modelId: "eleven_flash_v2_5",
            renderedAt: "2026-08-29",
          },
          script: "Mon voisin m'explique chaque samedi que les jeunes ne veulent plus travailler. Il tient cette certitude de son père, qui la tenait déjà du sien. Ce qui me trouble, ce n'est pas qu'il ait tort — sur un point ou deux, il a d'ailleurs moins tort qu'il ne le croit lui-même — c'est qu'une phrase transmise sur trois générations continue d'être présentée comme le fruit d'une observation personnelle.",
        },
        {
          id: "tcf-co-38-r",
          audioPath: "tcf-co/tcf-co-38.mp3",
          variety: 'international',
          level: "C2",
          family: "expose",
          speakers: 1,
          voice: {
            voiceId: "LFo5X4P9PhYaOLBA9Hyh",
            vendorName: "Clémence - Advertising",
            requestedVariety: 'international',
            modelId: "eleven_flash_v2_5",
            renderedAt: "2026-08-29",
          },
          script: "Nous avons évalué ce programme selon les critères que le programme s'était lui-même fixés. Il les remplit, naturellement. La question que personne n'a posée en commission est de savoir si ces critères mesuraient autre chose que la capacité de l'administration à produire les documents attendus dans les délais attendus. On me dira que c'est déjà quelque chose ; je veux bien le croire. Ce n'est pas ce que nous avions promis aux familles.",
        },
        {
          id: "tcf-co-39-r",
          audioPath: "tcf-co/tcf-co-39.mp3",
          variety: 'quebecois',
          level: "C2",
          family: "expose",
          speakers: 1,
          voice: { voiceId: "UJCi4DDncuo0VJDSIegj", voiceIds: ["UJCi4DDncuo0VJDSIegj"], vendorName: "Amélie - Young, Confident and Friendly", requestedVariety: 'quebecois', modelId: "eleven_flash_v2_5", renderedAt: "2026-08-30" },
          script: "On célèbre le retour de l'usine comme on célébrerait un fils prodigue. Trois cents emplois, annonce le communiqué ; deux cents, précise la note en bas de page, pour la première année. J'ajoute, sans malice, que la même municipalité expliquait il y a huit ans que l'avenir de la région ne passait plus par l'industrie. Je ne lui reproche pas d'avoir changé d'avis. Je lui reproche de n'avoir jamais changé de ton.",
        },
        {
          id: "tcf-co-52-r",
          audioPath: "tcf-co/tcf-co-52.mp3",
          variety: 'international',
          voice: { voiceId: "LFo5X4P9PhYaOLBA9Hyh", voiceIds: ["LFo5X4P9PhYaOLBA9Hyh"], vendorName: "Clémence - Advertising", requestedVariety: 'international', modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 1,
          level: 'C2',
          family: 'annonce',
          freshness: 'current',
          script: "Un mot sur la réforme du stationnement, dont l'application était annoncée pour janvier. Le conseil a choisi de la reporter d'un an, non pas qu'il en conteste le principe, mais parce que les habitants des quartiers concernés n'ont pas été consultés dans les formes. Le report portera donc sur la procédure et non sur le fond, et il serait imprudent d'en déduire que le projet est enterré : les tarifs annoncés restent ceux qui s'appliqueront.",
        },
        {
          id: "tcf-co-53-r",
          audioPath: "tcf-co/tcf-co-53.mp3",
          variety: 'quebecois',
          voice: { voiceId: "UJCi4DDncuo0VJDSIegj", voiceIds: ["UJCi4DDncuo0VJDSIegj"], vendorName: "Amélie - Young, Confident and Friendly", requestedVariety: 'quebecois', modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 1,
          level: 'C2',
          family: 'annonce',
          freshness: 'current',
          script: "Avis aux copropriétaires : le ravalement de la façade sud, voté l'an dernier, commencera effectivement au mois d'avril. Le devis retenu n'est pas le moins cher, et le conseil syndical tient à justifier publiquement ce choix, puisque la question a été soulevée en assemblée générale. L'entreprise la moins-disante refusait tout engagement sur les délais, alors que les échafaudages condamneront les balcons pendant toute la durée du chantier. Le surcoût, rapporté aux semaines d'immobilisation évitées, est apparu raisonnable, et l'assemblée l'a approuvé unanimement.",
        },
        {
          id: "tcf-co-54-r",
          audioPath: "tcf-co/tcf-co-54.mp3",
          variety: 'swiss',
          voice: { voiceId: "liiuwXIkU9JRzMLLqlt9", voiceIds: ["liiuwXIkU9JRzMLLqlt9"], vendorName: "Nathalie - Tender and Optimistic", requestedVariety: 'swiss', modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 1,
          level: 'C2',
          family: 'annonce',
          freshness: 'current',
          script: "Nous devons revenir sur l'information diffusée hier concernant la fermeture de l'accueil du soir, qui a été mal comprise. Elle était exacte quant au principe, mais fausse quant à la date, puisque la fermeture prendra effet en septembre et non ce mois-ci. Ce délai supplémentaire laisse le temps d'orienter les familles concernées, quartier par quartier, vers les autres structures du secteur. Nous regrettons cette confusion, d'autant qu'elle a conduit certaines personnes, par précaution, à renoncer à un service encore ouvert.",
        },
        {
          id: "tcf-co-55-r",
          audioPath: "tcf-co/tcf-co-55.mp3",
          variety: 'international',
          voice: { voiceId: "LFo5X4P9PhYaOLBA9Hyh", voiceIds: ["LFo5X4P9PhYaOLBA9Hyh"], vendorName: "Clémence - Advertising", requestedVariety: 'international', modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 1,
          level: 'C2',
          family: 'annonce',
          freshness: 'current',
          script: "Message aux personnes inscrites sur la liste d'attente du logement social, dont le fonctionnement est souvent mal compris. Le rang que vous consultez en ligne n'est pas, à proprement parler, un classement, et l'interpréter ainsi conduit régulièrement à des déceptions. Il indique une position dans un ensemble, alors que les attributions tiennent compte, en plus, de la composition du ménage et de la taille du logement libéré. Un rang qui recule n'est donc pas nécessairement un mauvais signe, contrairement à ce que beaucoup en concluent hâtivement.",
        },
        {
          id: "tcf-co-64-r",
          audioPath: "tcf-co/tcf-co-64.mp3",
          variety: 'quebecois',
          voice: { voiceId: "UJCi4DDncuo0VJDSIegj", voiceIds: ["UJCi4DDncuo0VJDSIegj", "1Ko2KP4agGOYHL6KVMtm"], vendorName: "Amélie - Young, Confident and Friendly + Alexandre - Authentic French Canadian", requestedVariety: 'quebecois', modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 2,
          level: 'C2',
          family: 'dialogue',
          freshness: 'current',
          script: "— Je comprends votre position, mais le rapport que vous invoquez portait sur l'année précédente, alors que la situation du service a changé depuis, et considérablement.\n— C'est justement pour cette raison que je le cite, puisqu'il montre à quel point la dégradation était prévisible, et personne, à l'époque, n'a voulu l'entendre.\n— Prévisible ne veut pas dire inévitable, et présenter les choses ainsi revient à excuser l'inaction plutôt qu'à l'expliquer.",
        },
        {
          id: "tcf-co-65-r",
          // ANCHOR. One per band, and the set is deliberately small: an
          // instrument that absorbs what it measures widens by exactly the
          // amount each item strays.
          //
          // ── HOW THESE SIX WERE CHOSEN, AND HOW THE FIRST RULE FAILED ─────
          // The first attempt took the recording of MEDIAN LENGTH in each
          // band. Objective, re-runnable, and wrong: length is one of four
          // measures, and a ladder chosen on one of them came out
          // non-monotonic on two others. `bank.check.ts` said so —
          // *"sentence length, clause depth did not rise"* — and it was right
          // about the yardstick rather than about the bank.
          //
          // These six are the recording CLOSEST TO ITS BAND'S MEDIAN PROFILE
          // on all four measures, normalised. An anchor should be the ordinary
          // member of its band, and "ordinary" has to mean ordinary in what is
          // being measured. The band centres rise cleanly on every measure,
          // which is what the bank is supposed to do and what these now say.
          //
          // A1 and A2 sit below `MIN_MEASURABLE_WORDS`: a fifteen-word
          // exchange cannot define an envelope, so those two rungs are marked
          // and are deliberately not used as one. That is honest for a bank
          // whose easiest recordings are six words long.
          role: 'anchor',
          audioPath: "tcf-co/tcf-co-65.mp3",
          variety: 'international',
          voice: { voiceId: "LFo5X4P9PhYaOLBA9Hyh", voiceIds: ["LFo5X4P9PhYaOLBA9Hyh", "1a3lMdKLUcfcMtvN772u"], vendorName: "Clémence - Advertising + Antoine - Audiobook Narrator", requestedVariety: 'international', modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 2,
          level: 'C2',
          family: 'dialogue',
          freshness: 'current',
          script: "— Vous proposez de réduire les délais, mais ce que vous appelez un délai recouvre en réalité deux choses distinctes, et les confondre nous a déjà coûté cher.\n— Je veux bien les distinguer, à condition que l'on ne s'en serve pas ensuite pour justifier l'absence de toute décision, comme la dernière fois.\n— La distinction n'est pas une manœuvre, néanmoins je reconnais qu'elle a servi de prétexte, et c'est précisément ce que je voudrais éviter cette fois.",
        },
        {
          id: "tcf-co-66-r",
          audioPath: "tcf-co/tcf-co-66.mp3",
          variety: 'international',
          voice: { voiceId: "LFo5X4P9PhYaOLBA9Hyh", voiceIds: ["LFo5X4P9PhYaOLBA9Hyh", "1a3lMdKLUcfcMtvN772u"], vendorName: "Clémence - Advertising + Antoine - Audiobook Narrator", requestedVariety: 'international', modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 2,
          level: 'C2',
          family: 'dialogue',
          freshness: 'current',
          script: "— Le comité a tranché en faveur du site nord, ce qui me surprend, car les objections soulevées en séance portaient sur des points que personne n'a réellement traités.\n— Elles ont été traitées, mais brièvement, et j'admets que la forme a pu donner le sentiment d'un examen expédié.\n— Ce n'est pas une question de forme : une objection à laquelle on répond en trois minutes n'a pas été examinée, elle a été écartée.",
        },
        {
          id: "tcf-co-67-r",
          audioPath: "tcf-co/tcf-co-67.mp3",
          variety: 'quebecois',
          voice: { voiceId: "UJCi4DDncuo0VJDSIegj", voiceIds: ["UJCi4DDncuo0VJDSIegj", "1Ko2KP4agGOYHL6KVMtm"], vendorName: "Amélie - Young, Confident and Friendly + Alexandre - Authentic French Canadian", requestedVariety: 'quebecois', modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 2,
          level: 'C2',
          family: 'dialogue',
          freshness: 'current',
          script: "— Vous parlez d'un succès, néanmoins les chiffres que vous citez comparent une année complète à un semestre, ce qui rend la progression flatteuse sans qu'elle soit réelle.\n— La comparaison figure telle quelle dans le document officiel, et je ne fais que la reprendre, sans intention de tromper qui que ce soit.\n— Je vous crois volontiers, cependant reprendre une comparaison fausse ne la rend pas juste, et le document devra être corrigé avant d'être diffusé.",
        },
        {
          id: "tcf-co-99-r",
          audioPath: "tcf-co/tcf-co-99.mp3",
          variety: "international",
          voice: { voiceId: "LFo5X4P9PhYaOLBA9Hyh", voiceIds: ["LFo5X4P9PhYaOLBA9Hyh"], vendorName: "Clémence - Advertising", requestedVariety: "international", modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 1,
          level: 'C2',
          family: 'annonce',
          freshness: 'current',
          script: "Le conseil informe les résidents que la révision du règlement intérieur, adoptée en mars, n'entrera en vigueur qu'après notification individuelle, laquelle ne pourra intervenir avant que le procès-verbal soit définitif. Autrement dit, un règlement voté n'est pas pour autant applicable, et toute sanction fondée sur le texte nouveau avant cette notification serait dépourvue de base. Les services ont donc reçu l'instruction de continuer à appliquer l'ancienne version, y compris lorsqu'elle leur paraît moins favorable.",
        },
        {
          id: "tcf-co-100-r",
          audioPath: "tcf-co/tcf-co-100.mp3",
          variety: "quebecois",
          voice: { voiceId: "UJCi4DDncuo0VJDSIegj", voiceIds: ["UJCi4DDncuo0VJDSIegj", "1Ko2KP4agGOYHL6KVMtm"], vendorName: "Amélie - Young, Confident and Friendly + Alexandre - Authentic French Canadian", requestedVariety: "quebecois", modelId: "eleven_flash_v2_5", renderedAt: "2026-08-31" },
          speakers: 2,
          level: 'C2',
          family: 'dialogue',
          freshness: 'current',
          script: "— Vous présentez cette baisse comme le résultat de votre programme, alors que la même courbe s'observe dans des régions où rien de comparable n'a été entrepris.\n— Je ne prétends pas que nous en soyons la seule cause, néanmoins l'écart avec ces régions s'est creusé depuis deux ans, et cet écart-là, il faut bien l'attribuer à quelque chose.\n— À condition que les deux populations soient comparables, ce dont je doute, puisque la vôtre est plus jeune de six ans en moyenne.",
        },
      ],
      items: [
        {
          id: "tcf-co-01",
          recordingId: "tcf-co-01-r",
          level: "A1",
          stem: "Que demande la personne ?",
          options: ["Un thé", "L'addition", "Un café", "Un verre d'eau"],
          answer: 2,
          rationale: "Tests recognition of a single everyday noun in a polite request; the distractors are all items plausibly ordered in the same setting but none of them is said.",
        },
        {
          id: "tcf-co-02",
          recordingId: "tcf-co-02-r",
          level: "A1",
          stem: "À quelle heure ferme le magasin ?",
          options: ["À dix-huit heures", "À dix heures", "À huit heures", "À dix-neuf heures"],
          answer: 0,
          rationale: "Tests comprehension of a compound time expression; the distractors are near-misses formed from the parts of dix-huit or by shifting one hour.",
        },
        {
          id: "tcf-co-03",
          recordingId: "tcf-co-03-r",
          level: "A1",
          stem: "Que cherche la personne ?",
          options: ["La sortie du bâtiment", "Un taxi", "La caisse", "Les toilettes"],
          answer: 3,
          rationale: "Tests a basic où est-ce que question with a concrete place noun; the distractors are other things one commonly asks for in a public building but that are never mentioned.",
        },
        {
          id: "tcf-co-04",
          recordingId: "tcf-co-04-r",
          level: "A1",
          stem: "Quel temps fait-il ?",
          options: ["Il neige", "Il pleut", "Il fait chaud", "Il y a du vent"],
          answer: 1,
          rationale: "Tests weather vocabulary in a short piece of advice; the distractors are other common weather statements, one of which (le vent) would also motivate the umbrella but is not said.",
        },
        {
          id: "tcf-co-05",
          recordingId: "tcf-co-05-r",
          level: "A2",
          stem: "Quel est le problème de l'appartement ?",
          // The key was « Il n'y a pas d'ascenseur », seven words repeated from
          // the recording in that order. A candidate who matched the sound of
          // the clause answered without following the « mais », which is what
          // the item exists to test. Now the key states the CONSEQUENCE, so it
          // has to be inferred from the third floor and the missing lift.
          options: ["Il est trop petit", "Il faut monter les escaliers", "Il est trop cher", "Il est au rez-de-chaussée"],
          answer: 1,
          rationale: "Tests the restrictive mais in a short housing exchange, and now also the inference from troisième étage plus pas d'ascenseur; the distractors are typical apartment complaints that are never stated, and rez-de-chaussée contradicts troisième étage.",
        },
        {
          id: "tcf-co-06",
          recordingId: "tcf-co-06-r",
          level: "A2",
          stem: "Que doivent faire les voyageurs ?",
          options: ["Prendre un autre autobus", "Attendre devant l'hôpital", "Payer un supplément", "Descendre à l'arrêt suivant"],
          answer: 3,
          rationale: "Tests an instruction inside a public announcement; hôpital and autobus appear in the script but answer a different question, and no change of bus or fare is mentioned.",
        },
        {
          id: "tcf-co-07",
          recordingId: "tcf-co-07-r",
          level: "A2",
          stem: "Que faut-il apporter au bureau ?",
          options: ["Une pièce d'identité", "Le formulaire papier rempli", "Une photo d'identité récente", "Un paiement en espèces"],
          answer: 0,
          rationale: "Tests the sequence d'abord / puis and what belongs to each step; the strongest distractor reuses formulaire, which is completed online and not carried to the office.",
        },
        {
          id: "tcf-co-08",
          recordingId: "tcf-co-08-r",
          level: "A2",
          stem: "À quelle heure la personne doit-elle arriver ?",
          options: ["À neuf heures quinze", "À neuf heures trente", "À neuf heures cinq", "À huit heures quinze"],
          answer: 2,
          rationale: "Tests a one-step calculation on a stated time; the distractors are the appointment time itself, an addition instead of a subtraction, and an hour error.",
        },
        {
          id: "tcf-co-09",
          recordingId: "tcf-co-09-r",
          level: "A2",
          stem: "Que conseille le garage ?",
          options: ["De venir samedi midi", "De rappeler plus tard", "De laisser la voiture au garage", "De venir lundi matin"],
          answer: 3,
          rationale: "Tests plutôt as a recommendation in a short voicemail; samedi and midi are in the script but describe the closing time being avoided, not the advice.",
        },
        {
          id: "tcf-co-10",
          recordingId: "tcf-co-10-r",
          level: "A2",
          stem: "Comment la personne va-t-elle au travail ?",
          options: ["En métro", "À pied", "À vélo", "En voiture"],
          answer: 1,
          rationale: "Tests a negative answer that corrects the question's assumption; métro is named only to be rejected, and the other means of transport are never mentioned.",
        },
        {
          id: "tcf-co-11",
          recordingId: "tcf-co-11-r",
          level: "B1",
          stem: "De quoi dépend le début de la formation ?",
          options: ["Du prix de la formation", "De la date limite d'inscription au programme", "D'une solution de garde pour les enfants", "Du résultat d'un examen d'entrée"],
          answer: 2,
          rationale: "Tests the conditional link carried by d'abord and sinon; the distractors are plausible but unstated obstacles to starting a course.",
        },
        {
          id: "tcf-co-12",
          recordingId: "tcf-co-12-r",
          level: "B1",
          stem: "Pourquoi le dossier ne peut-il pas être examiné ?",
          options: ["Il manque une preuve de revenus", "La demande a été refusée", "Le dossier est arrivé trop tard", "Le logement est déjà loué"],
          answer: 0,
          rationale: "Tests il ne manque que plus the negative condition sans ce document; the distractors are stronger outcomes (refusal, lateness, loss of the flat) that the message explicitly does not announce.",
        },
        {
          id: "tcf-co-13",
          recordingId: "tcf-co-13-r",
          level: "B1",
          stem: "Que dit l'homme de son nouvel horaire ?",
          options: ["Il regrette l'horaire qu'il avait avant", "Il travaille moins d'heures qu'auparavant", "Il s'entend mal avec ses nouveaux collègues", "Il gagne plus mais dort mal"],
          answer: 3,
          rationale: "Tests the concessive contrast le salaire est meilleur / mais; the distractors add a regret, a reduction in hours and a colleague problem that the speaker never expresses.",
        },
        {
          id: "tcf-co-14",
          recordingId: "tcf-co-14-r",
          level: "B1",
          stem: "Qu'est-ce qui change pendant les travaux ?",
          options: ["Les horaires d'ouverture", "L'entrée à utiliser", "Le lieu des retours de livres", "La durée des emprunts"],
          answer: 1,
          rationale: "Tests separating what changes from what stays the same; horaires and retours are addressed in the script precisely to say they are unchanged, and loan periods are not mentioned.",
        },
        {
          id: "tcf-co-15",
          recordingId: "tcf-co-15-r",
          level: "B1",
          stem: "Que dit le candidat au sujet de son expérience ?",
          options: ["Il a trois ans d'expérience dans la vente", "Il n'a jamais travaillé avec le public", "Il connaît le contact client mais pas la caisse", "Il a déjà tenu une caisse dans un restaurant pendant trois ans"],
          answer: 2,
          rationale: "Tests the qualified pas exactement and the two-part self-description; the distractors misattribute the three years to sales, overstate the negation, or invert the caisse statement.",
        },
        {
          id: "tcf-co-16",
          recordingId: "tcf-co-16-r",
          level: "B1",
          stem: "Que se passera-t-il si personne n'est présent à la livraison ?",
          // The key repeated « déposé au bureau de poste » verbatim. Reworded
          // so the candidate has to follow the si-clause rather than recognise
          // the phrase that follows it.
          options: ["Le colis sera immédiatement renvoyé à l'expéditeur", "Le colis sera livré le lendemain", "Le colis restera au centre de tri", "Il faudra aller le chercher dans le quartier"],
          answer: 3,
          rationale: "Tests a si-clause consequence, and now the inference that a parcel left at the local post office has to be collected; centre de tri and livré demain are in the script but describe the normal route, not the failed-delivery case.",
        },
        {
          id: "tcf-co-17",
          recordingId: "tcf-co-17-r",
          level: "B1",
          stem: "Que peuvent faire les personnes absentes ?",
          options: ["Envoyer leurs commentaires par écrit", "Demander une autre réunion", "Venir à une autre heure", "Écouter l'enregistrement de la réunion"],
          answer: 0,
          rationale: "Tests the instruction attached to the absent group; même heure appears in the script but applies to the rescheduled meeting, and no recording or second meeting is offered.",
        },
        {
          id: "tcf-co-18",
          recordingId: "tcf-co-18-r",
          level: "B1",
          stem: "Pourquoi la personne va-t-elle à la clinique sans rendez-vous ?",
          options: ["Parce que c'est moins cher", "Parce qu'elle n'a pas encore de médecin de famille", "Parce que l'attente y est courte", "Parce que son médecin de famille est absent pour plusieurs semaines"],
          answer: 1,
          rationale: "Tests the causal link expressed through en attendant; the script says the wait there is long, and price and an absent doctor are never mentioned.",
        },
        {
          id: "tcf-co-19",
          recordingId: "tcf-co-19-r",
          level: "B1",
          stem: "Quel est l'avantage du deuxième logement ?",
          options: ["Il est nettement plus grand que l'autre", "Il coûte moins cher", "Il est proche du travail", "Il est plus calme"],
          answer: 2,
          rationale: "Tests holding two contrasted descriptions apart; plus grand and moins cher belong to the first flat, and quietness is never discussed.",
        },
        {
          id: "tcf-co-20",
          recordingId: "tcf-co-20-r",
          level: "B2",
          stem: "Quelle est la conclusion principale de l'étude ?",
          options: ["Le télétravail a réduit la productivité des entreprises", "Les employés interrogés travaillent moins qu'avant", "Les entreprises interrogées veulent supprimer le télétravail", "La productivité se maintient, mais l'isolement augmente"],
          answer: 3,
          rationale: "Tests a two-part finding stated partly in the negative; each distractor reverses one element the report explicitly denies or never raises.",
        },
        {
          id: "tcf-co-21",
          recordingId: "tcf-co-21-r",
          level: "B2",
          stem: "Qu'est-ce qui préoccupe la femme ?",
          options: ["La difficulté technique du dossier", "L'incertitude sur la durée du remplacement", "Le manque de formation pour reprendre ce dossier", "Le refus de sa collègue de l'aider"],
          answer: 1,
          rationale: "Tests locating the real worry after a concession; she states that the work itself is not the problem, and no training issue or refusal is mentioned.",
        },
        {
          id: "tcf-co-22",
          recordingId: "tcf-co-22-r",
          level: "B2",
          stem: "Quelle est la position de la personne ?",
          options: ["Elle accepterait une hausse si le service s'améliorait", "Elle est opposée à toute augmentation des prix", "Elle trouve que les transports coûtent déjà trop cher", "Elle préfère désormais utiliser sa voiture"],
          answer: 0,
          rationale: "Tests a conditional stance built on a double negation; the speaker opens by saying she is not against the rise, and neither current prices nor cars are her subject.",
        },
        {
          id: "tcf-co-23",
          recordingId: "tcf-co-23-r",
          level: "B2",
          stem: "Quelle réserve expriment les associations de locataires ?",
          options: ["Le règlement pénalise surtout les locataires", "Les propriétaires n'ont pas été consultés", "Les moyens de contrôle manquent", "Les loyers vont augmenter à cause du règlement"],
          answer: 2,
          rationale: "Tests inferring the reservation from the image of a rule without inspectors; propriétaires and locataires both appear in the script but answer a different question.",
        },
        {
          id: "tcf-co-24",
          recordingId: "tcf-co-24-r",
          level: "B2",
          stem: "Quelle est la réaction du candidat ?",
          options: ["Il refuse les déplacements proposés", "Il demande une augmentation de salaire", "Il propose de travailler entièrement à distance depuis chez lui", "Il accepte, sous réserve d'un calendrier prévisible"],
          answer: 3,
          rationale: "Tests a qualified acceptance signalled by pas un obstacle en soi and en revanche; nothing is refused, and salary and remote work are never raised.",
        },
        {
          id: "tcf-co-25",
          recordingId: "tcf-co-25-r",
          level: "B2",
          stem: "Pourquoi la personne envisage-t-elle de changer de format ?",
          options: ["Le contenu du cours ne lui convient pas vraiment", "Sa concentration baisse au fil de la soirée", "Le cours revient trop cher pour elle", "Le professeur va être remplacé"],
          answer: 1,
          rationale: "Tests inferring a cause from je ne retiens que la première heure; the speaker praises the content, and cost and staffing are never mentioned.",
        },
        {
          id: "tcf-co-26",
          recordingId: "tcf-co-26-r",
          level: "B2",
          stem: "Que veut dire le journaliste ?",
          options: ["Les jeunes lisent de moins en moins", "Les jeunes préfèrent toujours les livres imprimés aux écrans", "C'est le support qui change, pas la lecture elle-même", "La lecture en ligne est de moins bonne qualité"],
          answer: 2,
          rationale: "Tests the corrective structure ce n'est pas X, c'est Y; the first distractor repeats the received idea the speaker is refuting, and no judgement on quality is made.",
        },
        {
          id: "tcf-co-27",
          recordingId: "tcf-co-27-r",
          level: "B2",
          stem: "Que reproche la personne au rapport ?",
          options: ["La recommandation apparaît trop tard dans le texte", "Les données sont contestables", "Le rapport est beaucoup trop court", "Le style est beaucoup trop technique pour les membres du comité"],
          answer: 0,
          rationale: "Tests understanding an implied criticism of structure; the script explicitly praises the data, and length and style are never criticised.",
        },
        {
          id: "tcf-co-28",
          recordingId: "tcf-co-28-r",
          level: "B2",
          stem: "Quelle est la position des commerçants du quartier ?",
          options: ["Ils soutiennent pleinement le projet du maire", "Ils attendent le bilan de fréquentation du printemps", "Ils réclament la construction d'une deuxième piste", "Ils regrettent la perte de places de stationnement"],
          answer: 3,
          rationale: "Tests attributing a stance to the right group in a report with several actors; the bilan belongs to the city's timeline and the support belongs to the mayor.",
        },
        {
          id: "tcf-co-29",
          recordingId: "tcf-co-29-r",
          level: "B2",
          stem: "Que précise le fournisseur ?",
          options: ["Le délai de six semaines est impossible à tenir", "Son engagement dépend du mode de livraison", "Il demande six semaines supplémentaires", "Il refuse finalement de livrer les pièces"],
          answer: 1,
          rationale: "Tests a correction that reframes rather than contradicts; the supplier does not declare the deadline impossible, ask for more time, or refuse the order.",
        },
        {
          id: "tcf-co-30",
          recordingId: "tcf-co-30-r",
          level: "C1",
          stem: "Quel est le point central de l'argumentation ?",
          options: ["L'automatisation supprimera la majorité des emplois", "Les métiers manuels sont les plus directement menacés", "Le rythme du changement importe plus que son ampleur", "Les transformations passées se sont faites sans difficulté"],
          answer: 2,
          rationale: "Tests identifying a thesis carried by a ce n'est pas X mais Y structure; the distractors state the alarmist claim the speaker declines, a category he never names, and a reassurance he never gives.",
        },
        {
          id: "tcf-co-31",
          recordingId: "tcf-co-31-r",
          level: "C1",
          stem: "Quelle est la réponse du conseil ?",
          options: ["Un refus poli, assorti d'une invitation à revenir", "Une acceptation de principe sous conditions techniques", "Un rejet définitif et sans appel du projet", "Une demande de révision complète du montage financier"],
          answer: 0,
          rationale: "Tests reading formal register where the refusal is carried by néanmoins and a subjunctive; nothing is accepted, the invitation for January rules out finality, and no revision is requested.",
        },
        {
          id: "tcf-co-32",
          recordingId: "tcf-co-32-r",
          level: "C1",
          stem: "Que critique l'intervenant ?",
          options: ["Le manque de données fiables sur l'emploi, la langue et le logement", "L'absence de volonté des personnes concernées", "La lenteur des politiques publiques en la matière", "Le fait que les interlocuteurs n'emploient pas le mot dans le même sens"],
          answer: 3,
          rationale: "Tests grasping a meta-level criticism about vocabulary rather than policy; emploi and logement appear only as one camp's indicators, and neither slowness nor individual willingness is discussed.",
        },
        {
          id: "tcf-co-33",
          recordingId: "tcf-co-33-r",
          level: "C1",
          stem: "Quelle est l'attitude de la personne qui part ?",
          options: ["Elle est amère envers ses anciens collègues", "Elle part avec une nostalgie mesurée", "Elle regrette d'avoir donné sa démission", "Elle se montre indifférente à ce départ"],
          answer: 1,
          rationale: "Tests attitude in an understated answer that neither denies nor dramatises regret; the colleagues are named warmly, and ce serait beaucoup dire rules out indifference.",
        },
        {
          id: "tcf-co-34",
          recordingId: "tcf-co-34-r",
          level: "C1",
          stem: "Quelle est la thèse défendue ?",
          options: ["Les formations courtes sont finalement plus efficaces", "Les formations longues garantissent l'accès à un emploi stable", "La capacité à réapprendre compte plus qu'une compétence ciblée", "Le marché du travail évolue en réalité très peu"],
          answer: 2,
          rationale: "Tests separating the opposition the speaker reports from the position he defends; the first two options restate the two camps he holds at a distance, and the last contradicts the script.",
        },
        {
          id: "tcf-co-35",
          recordingId: "tcf-co-35-r",
          level: "C1",
          stem: "Quelle est l'attitude du commentateur ?",
          options: ["Il félicite l'organisme pour ses résultats", "Il conteste l'exactitude du chiffre de dix-huit pour cent", "Il propose de supprimer le formulaire de plainte", "Il met en doute l'interprétation de ce chiffre"],
          answer: 3,
          rationale: "Tests a sceptical stance signalled by on aimerait and encore faudrait-il; he never disputes the figure itself, only what it is taken to prove.",
        },
        {
          id: "tcf-co-36",
          recordingId: "tcf-co-36-r",
          level: "C2",
          stem: "Quelle est la position du locuteur ?",
          options: ["Il ironise sur une réforme annoncée sans moyens supplémentaires", "Il admire la clarté et la sobriété de la communication ministérielle", "Il annonce le recrutement prochain de nouveaux agents", "Il regrette la complexité du vocabulaire administratif"],
          answer: 0,
          rationale: "Tests sustained irony where praise words carry criticism; élégance and vocabulaire enrichi are the ironic vehicle, and the script says staff and premises are unchanged.",
        },
        {
          id: "tcf-co-37",
          recordingId: "tcf-co-37-r",
          level: "C2",
          stem: "Que reproche le locuteur à son voisin ?",
          options: ["De ne jamais travailler le samedi", "De critiquer injustement son propre père et son grand-père", "De présenter un lieu commun hérité comme une observation personnelle", "De se tromper entièrement sur la jeunesse d'aujourd'hui et sur le travail"],
          answer: 2,
          rationale: "Tests a stance placed inside a concession: the speaker grants the neighbour is partly right, so the total-error option is excluded, and samedi and père are script words answering a different question.",
        },
        {
          id: "tcf-co-38",
          recordingId: "tcf-co-38-r",
          level: "C2",
          stem: "Quelle critique l'oratrice formule-t-elle ?",
          options: ["L'administration a rendu ses documents avec beaucoup de retard cette année", "L'évaluation valide une conformité de procédure, non un résultat réel", "Les familles concernées n'ont pas été consultées par la commission", "Le programme n'a atteint aucun des critères qui lui étaient fixés"],
          answer: 1,
          rationale: "Tests a circularity argument stated obliquely; the script says the criteria are met and the deadlines respected, and the families are invoked as the promise, not as an unconsulted party.",
        },
        {
          id: "tcf-co-39",
          recordingId: "tcf-co-39-r",
          level: "C2",
          stem: "Quel est le reproche final du locuteur ?",
          options: ["La municipalité a menti sur le nombre d'emplois créés la première année", "L'usine n'ouvrira finalement pas ses portes cette année", "La région aurait dû rester industrielle depuis le début", "La municipalité affirme ses revirements avec la même assurance"],
          answer: 3,
          rationale: "Tests a final reproach placed in the contrast between changer d'avis and changer de ton; the job figures are reported without accusing anyone of lying, and the speaker takes no side on industrial policy.",
        },
        {
          id: "tcf-co-40-q1",
          recordingId: "tcf-co-40-r",
          level: "B1",
          stem: "Qu'est-ce qui change pour les voyageurs ?",
          rationale: "L'annonce dit que le train partira du quai sept et non du quai trois, et précise ensuite que le départ reste à l'heure prévue.",
          options: ["Le quai de départ","L'heure du départ","La destination du train","Le numéro du train"],
          answer: 0,
        },
        {
          id: "tcf-co-41-q1",
          recordingId: "tcf-co-41-r",
          level: "B1",
          stem: "Que se passe-t-il à seize heures ?",
          rationale: "Seule la boulangerie ferme à seize heures ; les autres rayons restent ouverts jusqu'à vingt et une heures et le pain reste en vente.",
          options: ["Le nettoyage du magasin commence","Un seul rayon ferme","Tout le magasin ferme","Le pain est retiré de la vente"],
          answer: 1,
        },
        {
          id: "tcf-co-42-q1",
          recordingId: "tcf-co-42-r",
          level: "B1",
          stem: "Comment obtenir un passeport ?",
          rationale: "Le message dit qu'il faut prendre rendez-vous en ligne pour un passeport et que la mairie ne reçoit plus sans rendez-vous.",
          options: ["En se présentant au guichet","En téléphonant à la mairie","Uniquement sur rendez-vous","En venant le mercredi après-midi"],
          answer: 2,
        },
        {
          id: "tcf-co-43-q1",
          recordingId: "tcf-co-43-r",
          level: "B1",
          stem: "Que reçoivent les abonnés pour la semaine perdue ?",
          rationale: "L'annonce exclut le remboursement et précise que la semaine manquée sera ajoutée à la fin de l'abonnement.",
          options: ["Un remboursement","Un cours de rattrapage","Rien du tout","Une semaine supplémentaire"],
          answer: 3,
        },
        {
          id: "tcf-co-44-q1",
          recordingId: "tcf-co-44-r",
          level: "B2",
          stem: "Pourquoi le service est-il interrompu ?",
          rationale: "Le message écarte explicitement l'arrêt définitif et donne la raison : l'ancien contrat se termine avant le début du nouveau prestataire.",
          options: ["Un changement de prestataire","Une baisse de la demande","Un manque de personnel","Une décision définitive de la direction"],
          answer: 0,
        },
        {
          id: "tcf-co-45-q1",
          recordingId: "tcf-co-45-r",
          level: "B2",
          stem: "Que deviennent les colis qui arriveront après la fermeture ?",
          rationale: "L'annonce dit que les colis arrivés ensuite seront transférés au bureau du boulevard Laurier, sans démarche du destinataire.",
          options: ["Ils seront livrés à domicile","Ils iront à un autre bureau","Ils seront retournés à l'expéditeur","Ils seront gardés rue Sainte-Anne"],
          answer: 1,
        },
        {
          id: "tcf-co-46-q1",
          recordingId: "tcf-co-46-r",
          level: "B2",
          stem: "Que faut-il comprendre de ce message ?",
          rationale: "Le message dit que la coupure est reportée à mardi et insiste sur le fait qu'il ne s'agit pas d'une annulation.",
          options: ["La coupure dure toute la journée","La coupure concerne tout l'immeuble","La coupure aura lieu plus tard","La coupure est annulée"],
          answer: 2,
        },
        {
          id: "tcf-co-47-q1",
          recordingId: "tcf-co-47-r",
          level: "B2",
          stem: "Pourquoi l'heure de départ n'est-elle pas donnée ?",
          rationale: "L'annonce explique que l'heure exacte n'est pas connue et qu'elle préfère ne rien annoncer plutôt que de devoir se corriger.",
          options: ["Elle change toutes les heures","Elle dépend des voyageurs présents","Elle a déjà été annoncée deux fois","Elle n'est pas encore connue"],
          answer: 3,
        },
        {
          id: "tcf-co-48-q1",
          recordingId: "tcf-co-48-r",
          level: "C1",
          stem: "Que dit l'annonce de la suppression du service de nuit ?",
          rationale: "Le service est maintenu jusqu'en décembre, mais l'annonce précise que cette prolongation ne préjuge en rien de la décision finale, qui reste à prendre.",
          options: ["Elle est repoussée, sans être écartée","Elle est définitivement abandonnée","Elle est avancée au printemps","Elle dépend des horaires affichés"],
          answer: 0,
        },
        {
          id: "tcf-co-49-q1",
          recordingId: "tcf-co-49-r",
          level: "C1",
          stem: "Pourquoi la photographie est-elle interdite dans cette aile ?",
          rationale: "L'annonce écarte explicitement la question des droits et donne la raison : la lumière des appareils abîme les encres anciennes de manière irréversible.",
          options: ["Parce que les visiteurs y sont trop nombreux","Pour protéger les œuvres","Pour des raisons de droits d'auteur","Parce que la salle est trop sombre"],
          answer: 1,
        },
        {
          id: "tcf-co-50-q1",
          recordingId: "tcf-co-50-r",
          level: "C1",
          stem: "Pourquoi faut-il se méfier du premier versement ?",
          rationale: "Le premier versement suit l'inscription d'environ six semaines, le temps de la vérification, d'où le conseil de ne pas compter dessus pour le premier loyer.",
          options: ["Il n'est pas confirmé par écrit","Il dépend du montant du loyer","Il arrive environ six semaines plus tard","Il est d'un montant plus faible"],
          answer: 2,
        },
        {
          id: "tcf-co-51-q1",
          recordingId: "tcf-co-51-r",
          level: "C1",
          stem: "Qu'est-ce qui ne change pas à sept heures ?",
          rationale: "La salle ouvre plus tôt, mais l'annonce précise que les prêts et les renseignements ne commencent qu'à neuf heures, faute de personnel supplémentaire.",
          options: ["L'ouverture de la salle","L'accès aux places assises","L'entrée des abonnés","L'accès aux services de prêt"],
          answer: 3,
        },
        {
          id: "tcf-co-52-q1",
          recordingId: "tcf-co-52-r",
          level: "C2",
          stem: "Quelle conclusion l'annonce écarte-t-elle explicitement ?",
          rationale: "L'annonce dit qu'il serait imprudent de déduire que le projet est enterré, et ajoute que les tarifs annoncés restent ceux qui s'appliqueront.",
          options: ["Que le projet est abandonné","Que les tarifs vont augmenter","Que la consultation a eu lieu","Que le conseil est divisé"],
          answer: 0,
        },
        {
          id: "tcf-co-53-q1",
          recordingId: "tcf-co-53-r",
          level: "C2",
          stem: "Pourquoi l'offre la moins chère a-t-elle été écartée ?",
          rationale: "L'entreprise la moins-disante refusait de s'engager sur un délai, ce qui compte parce que les échafaudages condamnent les balcons pendant tout le chantier.",
          options: ["Elle avait été déposée trop tard","Elle ne garantissait aucun délai","Elle excluait les balcons du chantier","Elle ne prévoyait pas d'échafaudages"],
          answer: 1,
        },
        {
          id: "tcf-co-54-q1",
          recordingId: "tcf-co-54-r",
          level: "C2",
          stem: "Qu'est-ce qui était faux dans l'information d'hier ?",
          rationale: "L'annonce distingue les deux : l'information était exacte quant au principe et fausse quant à la date, la fermeture prenant effet en septembre.",
          options: ["Le nom du service concerné","Le nombre de familles touchées","La date de la fermeture","Le fait même de la fermeture"],
          answer: 2,
        },
        {
          id: "tcf-co-55-q1",
          recordingId: "tcf-co-55-r",
          level: "C2",
          stem: "Que faut-il comprendre du rang affiché en ligne ?",
          rationale: "Le rang indique une position dans un ensemble, mais les attributions dépendent aussi de la composition du ménage et de la taille du logement libéré.",
          options: ["Il est mis à jour une fois par an","Il ne concerne que les grands logements","Il est calculé par le demandeur lui-même","Il ne détermine pas à lui seul l'attribution"],
          answer: 3,
        },
        {
          id: "tcf-co-56-q1",
          recordingId: "tcf-co-56-r",
          level: "A1",
          stem: "Que demande l'employé ?",
          rationale: "Le client a déjà dit combien de billets et pour quelle ville ; l'employé demande seulement si c'est pour aujourd'hui ou pour demain.",
          options: ["Le jour du voyage","Le nombre de billets","Le prix des billets","La ville de départ"],
          answer: 0,
        },
        {
          id: "tcf-co-57-q1",
          recordingId: "tcf-co-57-r",
          level: "A1",
          stem: "Quand le musée ouvre-t-il ?",
          rationale: "La réponse donne l'heure, dix heures, et la fréquence, tous les jours.",
          options: ["À neuf heures chaque jour","À dix heures chaque jour","À dix heures le samedi","Tous les jours sauf lundi"],
          answer: 1,
        },
        {
          id: "tcf-co-58-q1",
          recordingId: "tcf-co-58-r",
          level: "A1",
          stem: "Quel est le problème ?",
          rationale: "Le vendeur dit oui pour le noir, mais précise qu'il ne reste que la petite taille.",
          options: ["Le manteau est trop cher","Le magasin va fermer","Une seule taille reste","La couleur noire manque"],
          answer: 2,
        },
        {
          id: "tcf-co-59-q1",
          recordingId: "tcf-co-59-r",
          level: "A1",
          stem: "Que fait la personne ?",
          rationale: "La deuxième voix répond en donnant la direction : tout droit, puis à gauche.",
          options: ["Elle demande le chemin","Elle refuse de répondre","Elle propose un taxi","Elle indique le chemin"],
          answer: 3,
        },
        {
          id: "tcf-co-60-q1",
          recordingId: "tcf-co-60-r",
          level: "A1",
          stem: "Le train arrive à quelle heure ?",
          rationale: "Le message donne l'heure du départ, huit heures, et celle de l'arrivée, midi.",
          options: ["À midi","À huit heures","À dix heures","À quatre heures"],
          answer: 0,
        },
        {
          id: "tcf-co-61-q1",
          recordingId: "tcf-co-61-r",
          level: "A1",
          stem: "Que conseille le message ?",
          rationale: "Après avoir dit qu'il fait froid, le message conseille de mettre un manteau avant de sortir.",
          options: ["De sortir plus tard","De porter un manteau","De rester à la maison","De prendre un parapluie"],
          answer: 1,
        },
        {
          id: "tcf-co-62-q1",
          recordingId: "tcf-co-62-r",
          level: "A1",
          stem: "Quand la cafétéria est-elle fermée ?",
          rationale: "Le message dit que la cafétéria est fermée le dimanche et ouverte du lundi au samedi.",
          options: ["Le lundi","Tous les soirs","Le dimanche","Le samedi"],
          answer: 2,
        },
        {
          id: "tcf-co-63-q1",
          recordingId: "tcf-co-63-r",
          level: "A1",
          stem: "Où a lieu le cours ?",
          rationale: "Le message donne l'heure, neuf heures, puis le lieu : la salle est au premier étage.",
          options: ["Au rez-de-chaussée","Au deuxième étage","Dans la salle neuf","Au premier étage"],
          answer: 3,
        },
        {
          id: "tcf-co-64-q1",
          recordingId: "tcf-co-64-r",
          level: "C2",
          stem: "Sur quoi porte le désaccord ?",
          rationale: "Le premier reproche au rapport d'être dépassé, le second l'invoque pour montrer que la dégradation était prévisible : le désaccord porte sur ce que le rapport prouve, non sur son contenu.",
          options: ["Sur la portée du rapport cité","Sur la date de publication du rapport","Sur les chiffres contenus dans le rapport","Sur l'auteur du rapport"],
          answer: 0,
        },
        {
          id: "tcf-co-65-q1",
          recordingId: "tcf-co-65-r",
          level: "C2",
          stem: "Que craint la deuxième voix ?",
          rationale: "Elle accepte la distinction à condition qu'on ne s'en serve pas pour justifier l'absence de décision, comme la fois précédente.",
          options: ["Que le coût augmente de nouveau","Que la distinction serve à ne rien décider","Que les délais soient encore allongés","Que la décision soit prise sans elle"],
          answer: 1,
        },
        {
          id: "tcf-co-66-q1",
          recordingId: "tcf-co-66-r",
          level: "C2",
          stem: "Que reproche la première voix au comité ?",
          rationale: "Elle refuse l'excuse de la forme : selon elle, une objection traitée en trois minutes a été écartée et non examinée.",
          options: ["D'avoir siégé trop longtemps","D'avoir refusé d'entendre les opposants","D'avoir écarté les objections","D'avoir choisi le mauvais site"],
          answer: 2,
        },
        {
          id: "tcf-co-67-q1",
          recordingId: "tcf-co-67-r",
          level: "C2",
          stem: "Quel est le défaut des chiffres cités ?",
          rationale: "La première voix reproche la comparaison d'une année complète avec un semestre, ce qui rend la progression flatteuse sans être réelle.",
          options: ["Ils proviennent d'un document non officiel","Ils ont été inventés par la deuxième voix","Ils ne portent pas sur le bon service","Ils comparent des périodes de longueur différente"],
          answer: 3,
        },
        {
          id: "tcf-co-68-q1",
          recordingId: "tcf-co-68-r",
          level: "A1",
          stem: "De quel quai part le train ?",
          rationale: "L'annonce donne un seul numéro de quai, le trois ; les autres numéros ne sont jamais prononcés dans le message.",
          options: ["Du quai trois","Du quai deux","Du quai quatre","Du quai un"],
          answer: 0,
        },
        {
          id: "tcf-co-69-q1",
          recordingId: "tcf-co-69-r",
          level: "A1",
          stem: "Que choisit la personne ?",
          rationale: "La question propose deux boissons et la réponse en retient une seule, le jus ; les deux autres options ne sont pas proposées.",
          options: ["Du lait","Du jus","Du thé","De l'eau"],
          answer: 1,
        },
        {
          id: "tcf-co-70-q1",
          recordingId: "tcf-co-70-r",
          level: "A1",
          stem: "Qu'est-ce qui est interdit ?",
          rationale: "Le message ne nomme qu'une seule chose interdite, les vélos ; les distracteurs sont d'autres interdictions courantes dans un parc.",
          options: ["Les voitures","Le pique-nique","Les vélos","Les chiens"],
          answer: 2,
        },
        {
          id: "tcf-co-71-q1",
          recordingId: "tcf-co-71-r",
          level: "A2",
          stem: "Que peuvent faire les clients ?",
          rationale: "L'annonce signale l'ouverture d'une caisse et invite les clients à s'y présenter avec leurs achats, rien d'autre n'est proposé.",
          options: ["Rendre un article acheté","Demander un sac gratuit","Attendre la fin des travaux","Aller à une nouvelle caisse"],
          answer: 3,
        },
        {
          id: "tcf-co-72-q1",
          recordingId: "tcf-co-72-r",
          level: "A2",
          stem: "Que demande le message ?",
          rationale: "Après avoir signalé la panne, le message indique une seule solution : utiliser l'escalier au fond du couloir.",
          options: ["De prendre l'escalier","De sortir du bâtiment","De patienter dix minutes","D'appeler un technicien"],
          answer: 0,
        },
        {
          id: "tcf-co-73-q1",
          recordingId: "tcf-co-73-r",
          level: "A2",
          stem: "Quand la piscine rouvre-t-elle ?",
          rationale: "Le message annonce une fermeture le samedi et précise la réouverture le dimanche aux heures habituelles.",
          options: ["Dans une semaine","Dimanche","Samedi soir","Lundi matin"],
          answer: 1,
        },
        {
          id: "tcf-co-74-q1",
          recordingId: "tcf-co-74-r",
          level: "A2",
          stem: "Quel est le changement ?",
          rationale: "Le client annonce qu'ils seront six alors que la réservation portait sur quatre personnes ; rien d'autre n'est modifié.",
          options: ["Le jour de la réservation","Le nom du client","Le nombre de convives","L'heure du repas"],
          answer: 2,
        },
        {
          id: "tcf-co-75-q1",
          recordingId: "tcf-co-75-r",
          level: "A2",
          stem: "Où en est le colis ?",
          rationale: "La réponse dit que le colis n'est pas encore là et annonce une livraison prévue pour le lendemain matin.",
          options: ["Il a été perdu","Il est déjà arrivé","Il repart chez l'expéditeur","Il n'est pas encore livré"],
          answer: 3,
        },
        {
          id: "tcf-co-76-q1",
          recordingId: "tcf-co-76-r",
          level: "A2",
          stem: "Que vend-on surtout au marché ?",
          rationale: "Le message cite les légumes et le fromage, qui sont des aliments ; aucune autre catégorie de marchandise n'est nommée.",
          options: ["Des produits alimentaires","Des vêtements d'occasion","Des livres anciens","Des fleurs coupées"],
          answer: 0,
        },
        {
          id: "tcf-co-77-q1",
          recordingId: "tcf-co-77-r",
          level: "A2",
          stem: "Combien de temps dure le prêt ?",
          rationale: "Le message donne une durée précise, trois semaines, et ajoute qu'elle peut être prolongée une seule fois.",
          options: ["Trois jours","Trois semaines","Une semaine","Un mois entier"],
          answer: 1,
        },
        {
          id: "tcf-co-78-q1",
          recordingId: "tcf-co-78-r",
          level: "A2",
          stem: "Où sera le nouveau bureau ?",
          rationale: "Le message situe la nouvelle adresse à côté de la gare et précise l'étage, sans mentionner aucun autre repère.",
          options: ["À côté de l'école","Dans le même immeuble","Près de la gare","Devant la mairie"],
          answer: 2,
        },
        {
          id: "tcf-co-79-q1",
          recordingId: "tcf-co-79-r",
          level: "A2",
          stem: "Que peut faire une personne intéressée ?",
          rationale: "Le cours étant complet, la seule possibilité offerte est de s'inscrire à l'accueil sur la liste d'attente.",
          options: ["Changer de discipline sportive","Assister au cours sans place","Demander un remboursement","S'inscrire sur une liste d'attente"],
          answer: 3,
        },
        {
          id: "tcf-co-80-q1",
          recordingId: "tcf-co-80-r",
          level: "B1",
          stem: "Que peut faire un client pressé ?",
          rationale: "L'annonce indique que l'agence voisine, à cinq minutes à pied, fonctionne normalement, ce qui est la solution la plus rapide proposée.",
          options: ["Se rendre à l'agence voisine","Revenir le lendemain matin","Utiliser un guichet extérieur","Téléphoner au service technique"],
          answer: 0,
        },
        {
          id: "tcf-co-81-q1",
          recordingId: "tcf-co-81-r",
          level: "B1",
          stem: "Quelle est la situation des commerces ?",
          rationale: "L'annonce précise que les commerces demeurent accessibles à pied par le trottoir nord malgré la circulation réduite.",
          options: ["Ils ouvrent seulement le matin","Ils restent accessibles à pied","Ils sont fermés pendant les travaux","Ils déménagent provisoirement"],
          answer: 1,
        },
        {
          id: "tcf-co-82-q1",
          recordingId: "tcf-co-82-r",
          level: "B1",
          stem: "Quand l'abonnement est-il plus avantageux ?",
          rationale: "Le conseil pose une condition chiffrée : plus de trois voyages par semaine rendent l'abonnement moins cher que la carte.",
          options: ["Pour les trajets de longue distance","Dès le premier déplacement","Au-delà de trois trajets par semaine","Seulement pendant les vacances"],
          answer: 2,
        },
        {
          id: "tcf-co-83-q1",
          recordingId: "tcf-co-83-r",
          level: "B1",
          stem: "Pourquoi la mesure est-elle maintenue ?",
          rationale: "Le texte lie la décision à la fréquentation, qui a doublé, et non à un coût, à une obligation ou à une demande interne.",
          options: ["Parce qu'elle coûte moins cher","Parce que la loi l'exige","Parce que le personnel l'a demandé","Parce qu'elle a rencontré du succès"],
          answer: 3,
        },
        {
          id: "tcf-co-84-q1",
          recordingId: "tcf-co-84-r",
          level: "B1",
          stem: "Pourquoi y a-t-il quarante stations ?",
          rationale: "Le texte oppose l'objectif de soixante stations au budget voté, qui n'a financé que les deux tiers de ce nombre.",
          options: ["Le budget n'a pas suivi le projet","Les habitants en voulaient moins","Les travaux ont pris du retard","Le fournisseur a fait faillite"],
          answer: 0,
        },
        {
          id: "tcf-co-85-q1",
          recordingId: "tcf-co-85-r",
          level: "B1",
          stem: "Que conseille la direction ?",
          rationale: "Face à l'affluence du dimanche gratuit, deux solutions sont proposées : arriver tôt, ou venir un autre jour en payant.",
          options: ["Éviter complètement le musée","Venir tôt ou choisir un autre jour","Réserver un billet en ligne","Visiter en groupe organisé"],
          answer: 1,
        },
        {
          id: "tcf-co-86-q1",
          recordingId: "tcf-co-86-r",
          level: "B1",
          stem: "Que couvrent les panneaux ?",
          rationale: "Le texte chiffre l'apport des panneaux à un tiers environ, le reste étant toujours acheté au réseau public.",
          options: ["Le chauffage seulement","Les bureaux mais pas l'entrepôt","Une partie de la consommation","La totalité des besoins"],
          answer: 2,
        },

        {
          id: "tcf-co-87-q1",
          recordingId: "tcf-co-87-r",
          level: "B2",
          stem: "Que doivent faire les passagers en correspondance ?",
          rationale: "L'annonce distingue le report du vol et le cas particulier des correspondances, pour lesquelles un nouvel itinéraire est proposé au comptoir sans frais.",
          options: ["Se présenter au comptoir pour être réacheminés","Attendre au salon jusqu'à vingt heures","Racheter un billet auprès d'une autre compagnie","Récupérer leurs bagages avant le départ"],
          answer: 0,
        },
        {
          id: "tcf-co-88-q1",
          recordingId: "tcf-co-88-r",
          level: "B2",
          stem: "Qu'est-ce qui change en dehors de la plage réservée ?",
          rationale: "L'annonce réserve d'abord une plage horaire aux livraisons, puis précise que le reste du temps la durée maximale tombe de quatre heures à deux.",
          options: ["Le type de véhicule accepté","La durée de stationnement autorisée","Le prix demandé à l'heure","Le nombre de places disponibles"],
          answer: 1,
        },
        {
          id: "tcf-co-89-q1",
          recordingId: "tcf-co-89-r",
          level: "B2",
          stem: "Comment sont traitées les demandes tardives ?",
          rationale: "Le message écarte le refus automatique et pose un ordre de traitement : les demandes hors délai passent après celles déposées à temps.",
          options: ["Avec un délai réduit à une semaine","Transmises à un autre service","Après les dossiers déposés à temps","Refusées sans examen possible"],
          answer: 2,
        },
        {
          id: "tcf-co-90-q1",
          recordingId: "tcf-co-90-r",
          level: "B2",
          stem: "D'où vient la hausse du devis ?",
          rationale: "La seconde voix rattache l'augmentation au matériau choisi en cours de route, plus durable mais plus cher que celui du devis initial.",
          options: ["D'une erreur de calcul du fournisseur","D'un allongement de la durée du chantier","D'une taxe entrée en vigueur récemment","D'un changement de matériau décidé après coup"],
          answer: 3,
        },
        {
          id: "tcf-co-91-q1",
          recordingId: "tcf-co-91-r",
          level: "B2",
          stem: "Que propose l'employé ?",
          rationale: "Faute de facture, l'employé accepte une attestation d'hébergement, mais pose une condition explicite : la pièce d'identité du propriétaire.",
          options: ["Une attestation accompagnée d'une pièce d'identité","Un délai de trois mois pour fournir la facture","Une déclaration sur l'honneur du demandeur","Un rendez-vous avec le service juridique"],
          answer: 0,
        },
        {
          id: "tcf-co-92-q1",
          recordingId: "tcf-co-92-r",
          level: "B2",
          stem: "Quel effet n'était pas prévu ?",
          rationale: "Le texte oppose l'économie attendue à un effet inattendu, la diminution des plaintes nocturnes, que personne n'explique encore.",
          options: ["Le mécontentement des habitants","La baisse des plaintes pour bruit","La réduction de la facture d'électricité","L'augmentation du nombre de lampadaires"],
          answer: 1,
        },
        {
          id: "tcf-co-93-q1",
          recordingId: "tcf-co-93-r",
          level: "C1",
          stem: "Qu'advient-il du compte d'un abonné qui ne fait rien ?",
          rationale: "L'annonce sépare la suspension de l'accès et la fin du compte : celui-ci reste consultable douze mois, après quoi seules les données légalement conservées demeurent.",
          options: ["Il est reconduit automatiquement comme auparavant","Il est transféré vers une formule gratuite","Il reste consultable un an avant d'être réduit au minimum légal","Il est supprimé dès la suspension de l'accès"],
          answer: 2,
        },
        {
          id: "tcf-co-94-q1",
          recordingId: "tcf-co-94-r",
          level: "C1",
          stem: "Que reproche finalement la première voix ?",
          rationale: "Elle accepte l'explication sur les équipes de nuit mais maintient que rien ne permet de vérifier qui a suivi la formation, ce qui suffit à bloquer un audit.",
          options: ["Le refus de former les équipes de nuit","Le coût trop élevé du dispositif en ligne","La durée insuffisante de la formation","L'absence de trace vérifiable pour une partie du personnel"],
          answer: 3,
        },
        {
          id: "tcf-co-95-q1",
          recordingId: "tcf-co-95-r",
          level: "C1",
          stem: "Quelle est la critique adressée au rapport ?",
          rationale: "La première voix distingue explicitement la méthode, qu'elle ne conteste pas, et la conclusion, qu'elle juge plus forte que ce que la méthode autorise.",
          options: ["Sa conclusion va au-delà de sa méthode","Sa méthode n'a jamais été validée","Ses données ont été recueillies trop tard","Son comité scientifique était incomplet"],
          answer: 0,
        },
        {
          id: "tcf-co-96-q1",
          recordingId: "tcf-co-96-r",
          level: "C1",
          stem: "Sur quoi les deux voix s'accordent-elles ?",
          rationale: "La seconde voix propose une explication et la première la juge possible tout en soulignant qu'aucune donnée ne permet de l'établir.",
          options: ["Que le service manque de personnel","Que l'explication avancée reste invérifiée","Que les délais doivent être allongés","Que les réclamations sont mal comptées"],
          answer: 1,
        },
        {
          id: "tcf-co-97-q1",
          recordingId: "tcf-co-97-r",
          level: "C1",
          stem: "Quelle difficulté la première voix soulève-t-elle ?",
          rationale: "Elle accepte l'argument sur les qualités du candidat mais rappelle que le jury avait reçu une grille où la technique pesait le plus lourd.",
          options: ["Les deux autres candidats ont été écartés trop tôt","Le poste a été redéfini après les entretiens","Le choix s'écarte de la grille annoncée au jury","Le candidat retenu n'a pas postulé dans les délais"],
          answer: 2,
        },
        {
          id: "tcf-co-98-q1",
          recordingId: "tcf-co-98-r",
          level: "C1",
          stem: "Que révèle le relevé plus fin ?",
          rationale: "Le relevé montre que la moitié des usagers viennent à cause du chauffage insuffisant chez eux, un motif que personne n'avait cherché à mesurer.",
          options: ["La fréquentation avait été surestimée au départ","Les étudiants y viennent surtout pour se retrouver","Les horaires devraient être encore élargis","La salle répond à un besoin non mesuré"],
          answer: 3,
        },
        {
          id: "tcf-co-99-q1",
          recordingId: "tcf-co-99-r",
          level: "C2",
          stem: "Pourquoi l'ancienne version continue-t-elle de s'appliquer ?",
          rationale: "Le message distingue l'adoption et l'entrée en vigueur : faute de notification individuelle, le texte voté n'est pas opposable et ne peut fonder aucune sanction.",
          options: ["Parce que le nouveau texte n'est pas encore opposable aux résidents","Parce que le vote de mars a été annulé","Parce que les résidents ont contesté la révision","Parce que le conseil préfère l'ancienne rédaction"],
          answer: 0,
        },
        {
          id: "tcf-co-100-q1",
          recordingId: "tcf-co-100-r",
          level: "C2",
          stem: "Quelle objection finale est opposée à l'argument de l'écart ?",
          rationale: "La dernière réplique accepte le raisonnement sous condition de comparabilité et la conteste aussitôt en relevant six ans d'écart d'âge moyen.",
          options: ["Les régions témoins n'ont pas fourni leurs chiffres","Les populations comparées ne sont pas de même nature","L'écart mesuré est trop faible pour signifier quoi que ce soit","Le programme n'a pas duré assez longtemps"],
          answer: 1,
        },
      ],
    },
    {
      kind: 'comprehension',
      id: 'comprehension-ecrite',
      sets: {
        questions: 39,
        source: "France Éducation international — TCF Canada, compréhension écrite : 39 questions, 60 minutes.",
      },
      skill: 'reading',
      name: { en: 'Reading comprehension', fr: 'Compréhension écrite' },
      // Published: 60 minutes for the épreuve. FEI, TCF Canada page.
      timeLimitSec: 60 * 60,
      scaleId: 'ce699',
      delivery: {
        audioPlaysOnce: false,
        questionAfterAudio: false,
        transcriptDuringSection: false,
        // The whole section at once, as in the real épreuve: the candidate
        // budgets their own time across the 39 items of the épreuve.
        presentation: 'all_at_once',
        clock: 'section',
        answersLockedOnAnswer: false,
        feedbackDuringSection: false,
      },
      // The épreuve is 39 questions. The bank behind it is larger, so that a
      // second sitting is not the same sitting. See `serveCount` in
      // `types.ts` — until today `items.length` was BOTH, and growing the
      // bank to 57 silently made the épreuve 57 questions long.
      // The band profile of the original 39, kept as the épreuve's shape.
      serve: { count: 39, byBand: { A1: 4, A2: 6, B1: 9, B2: 10, C1: 6, C2: 4 } },
      // ── THIS TEXT WAS THE LISTENING SECTION'S, WORD FOR WORD ────────────
      // Until 31 August this field was a copy of `comprehension-orale`'s, and
      // it ended by describing the accents of recordings — in a section that
      // has none. A provenance note is the one paragraph on the page whose
      // whole job is to say exactly what is ours and what is the exam's; a
      // copied one is worse than none, because it is read as checked.
      provenance: {
        en: 'Every item in this section was written for this product, to the published format — 39 questions, ordered by progressive difficulty — and no real exam question is reproduced. The A1-to-C2 banding is ours: the exam publishes that difficulty rises across the section and does not publish which item sits at which level. The passages are ours too, including their length: France Éducation international publishes the text types for the compréhension écrite épreuve but not a word count per band, so the lengths here are written to the type rather than to a published figure. The bank is larger than one épreuve, so a second sitting is not the same sitting.',
        fr: "Tous les items de cette épreuve ont été rédigés pour ce produit, selon le format publié — 39 questions, à difficulté progressive — sans reproduire aucune question réelle d'examen. Le classement A1 à C2 est le nôtre : l'examen indique que la difficulté augmente, sans publier le niveau de chaque item. Les textes sont également les nôtres, y compris leur longueur : France Éducation international publie les types de textes de l'épreuve de compréhension écrite, mais aucun nombre de mots par niveau ; les longueurs retenues ici suivent donc le type et non un chiffre publié. La banque est plus grande qu'une épreuve, afin qu'une deuxième session ne soit pas la même session.",
      },
      families: [
        {
          id: 'consigne',
          label: { en: 'Notice or instruction', fr: 'Consigne ou avis' },
          describes: {
            en: 'A sign, a label, a short notice. What is tested is doing exactly what it says and nothing a reasonable person might also do.',
            fr: "Un panneau, une étiquette, un avis court. Ce qui est testé, c'est de faire exactement ce qui est écrit, et rien de ce qu'une personne raisonnable ferait aussi.",
          },
          provenance: {
            en: 'Family names follow the item types France Éducation international publishes for the compréhension écrite épreuve. The assignment of individual items to families is OURS and is unreviewed.',
            fr: "Les noms de familles suivent les types d'items publiés par France Éducation international pour l'épreuve de compréhension écrite. L'affectation de chaque item à une famille est LA NÔTRE et n'a pas été relue.",
          },
        },
        {
          id: 'correspondance',
          label: { en: 'Letter, email or message', fr: 'Correspondance' },
          describes: {
            en: 'Someone writing to someone. What is tested is the intention behind the politeness, which is where a candidate at this level loses marks.',
            fr: "Quelqu'un qui écrit à quelqu'un. Ce qui est testé, c'est l'intention derrière la politesse — là où un candidat de ce niveau perd des points.",
          },
          provenance: { en: 'As above.', fr: 'Comme ci-dessus.' },
        },
        {
          id: 'article',
          label: { en: 'Informative text', fr: 'Texte informatif' },
          describes: {
            en: 'An article or a factual passage. What is tested is finding a fact that is stated once, among facts that are not asked about.',
            fr: "Un article ou un passage factuel. Ce qui est testé, c'est de retrouver un fait énoncé une seule fois, parmi des faits sur lesquels rien n'est demandé.",
          },
          provenance: { en: 'As above.', fr: 'Comme ci-dessus.' },
        },
        {
          id: 'argumentatif',
          label: { en: 'Argued text', fr: 'Texte argumentatif' },
          describes: {
            en: 'A text that takes a position. What is tested is separating what the author asserts from what the author reports others as saying — the single most common misreading at NCLC 6 and 7.',
            fr: "Un texte qui prend position. Ce qui est testé, c'est de distinguer ce que l'auteur affirme de ce qu'il rapporte d'autrui — le contresens le plus fréquent aux NCLC 6 et 7.",
          },
          provenance: { en: 'As above.', fr: 'Comme ci-dessus.' },
        },
      ],
      recordings: [
        {
          id: "tcf-ce-01-r",
          level: "A1",
          family: "consigne",
          script: "Ascenseur en panne. Merci d'utiliser l'escalier.",
        },
        {
          id: "tcf-ce-02-r",
          level: "A1",
          family: "consigne",
          script: "À conserver au réfrigérateur après ouverture.",
        },
        {
          id: "tcf-ce-03-r",
          // ANCHOR. One per band, chosen by closest-to-band-median profile.
          //
          // ── FIFTY-SEVEN OF SIXTY-ONE WERE ANCHORS UNTIL 31 AUGUST ────────
          // Which meant the instrument had absorbed the bank. The doctrine in
          // `Recording.role` says why that is fatal: *"an instrument that
          // absorbs what it measures widens by exactly the amount each item
          // strays, and the hundredth item ends up measured against
          // ninety-nine of its own siblings."* With four non-anchors left,
          // `bank.check.ts` was measuring four passages and reporting the
          // bank — an assertion satisfied by absence, the same shape as the
          // two others found this week.
          //
          // Reducing to six made fifty-one recordings measurable for the
          // first time. **Ten of them sit outside the ladder.** They are named
          // in `bank.check.ts` rather than excused, and the list may only
          // shrink.
          role: 'anchor',
          level: "A1",
          family: "consigne",
          script: "Bibliothèque fermée le lundi. Ouverte du mardi au dimanche.",
        },
        {
          id: "tcf-ce-04-r",
          level: "A1",
          family: "consigne",
          script: "Voie réservée aux piétons. Vélos interdits.",
        },
        {
          id: "tcf-ce-58-r",
          level: "A1",
          family: "correspondance",
          freshness: 'current',
          script: "Salut Karim,\n\nJe passe à la pharmacie ce soir. Tu veux que je prenne quelque chose ?\n\nJe rentre vers sept heures. Le pain est sur la table.\n\nLéa",
        },
        {
          id: "tcf-ce-62-r",
          level: 'A1',
          family: 'correspondance',
          freshness: 'current',
          script: "Salut Marc, je passe te voir samedi vers quinze heures. J'apporte le gâteau. Camille",
        },
        {
          id: "tcf-ce-63-r",
          level: 'A1',
          family: 'correspondance',
          freshness: 'current',
          script: "Bonjour, votre commande est prête. Vous pouvez la retirer en magasin avant vendredi. L'équipe du service client",
        },
        {
          id: "tcf-ce-64-r",
          level: 'A1',
          family: 'correspondance',
          freshness: 'current',
          script: "Chère voisine, je suis absente cette semaine. Pouvez-vous arroser mes plantes ? Merci beaucoup. Léa",
        },
        {
          id: "tcf-ce-65-r",
          level: 'A1',
          family: 'article',
          freshness: 'current',
          script: "Le nouveau parc ouvre samedi. On y trouve un terrain de jeux et un petit café.",
        },
        {
          id: "tcf-ce-66-r",
          level: 'A1',
          family: 'article',
          freshness: 'current',
          script: "La bibliothèque prête maintenant des vélos. Le prêt est gratuit pour les habitants de la ville.",
        },
        {
          id: "tcf-ce-67-r",
          level: 'A1',
          family: 'article',
          freshness: 'current',
          script: "Un marché de fruits s'installe chaque samedi devant la mairie. Il ouvre à huit heures.",
        },
        {
          id: "tcf-ce-68-r",
          level: 'A1',
          family: 'article',
          freshness: 'current',
          script: "L'école ferme lundi. Les élèves reprennent les cours mardi matin.",
        },
        {
          id: "tcf-ce-69-r",
          level: 'A1',
          family: 'argumentatif',
          freshness: 'current',
          script: "À mon avis, le vélo est mieux que la voiture en ville. C'est rapide et ça ne coûte rien.",
        },
        {
          id: "tcf-ce-70-r",
          level: 'A1',
          family: 'argumentatif',
          freshness: 'current',
          script: "Je pense que le musée doit rester gratuit. Beaucoup de familles ne peuvent pas payer.",
        },
        {
          id: "tcf-ce-71-r",
          level: 'A1',
          family: 'argumentatif',
          freshness: 'current',
          script: "Pour moi, il faut plus d'arbres dans la rue. L'été, il fait trop chaud ici.",
        },
        {
          id: "tcf-ce-72-r",
          level: 'A1',
          family: 'argumentatif',
          freshness: 'current',
          script: "Je trouve que la salle de sport ferme trop tôt. Beaucoup de gens travaillent jusqu'à dix-huit heures.",
        },
        {
          id: "tcf-ce-05-r",
          level: "A2",
          family: "correspondance",
          script: "Bonjour Madame Roy, votre colis est arrivé ce matin, mais vous étiez absente. Je l'ai laissé chez le gardien, au rez-de-chaussée. Il travaille jusqu'à dix-neuf heures. Si vous ne pouvez pas passer aujourd'hui, il le gardera jusqu'à samedi. Bonne journée.",
        },
        {
          id: "tcf-ce-06-r",
          // ANCHOR. One per band, chosen by closest-to-band-median profile.
          //
          // ── FIFTY-SEVEN OF SIXTY-ONE WERE ANCHORS UNTIL 31 AUGUST ────────
          // Which meant the instrument had absorbed the bank. The doctrine in
          // `Recording.role` says why that is fatal: *"an instrument that
          // absorbs what it measures widens by exactly the amount each item
          // strays, and the hundredth item ends up measured against
          // ninety-nine of its own siblings."* With four non-anchors left,
          // `bank.check.ts` was measuring four passages and reporting the
          // bank — an assertion satisfied by absence, the same shape as the
          // two others found this week.
          //
          // Reducing to six made fifty-one recordings measurable for the
          // first time. **Ten of them sit outside the ladder.** They are named
          // in `bank.check.ts` rather than excused, and the list may only
          // shrink.
          role: 'anchor',
          level: "A2",
          family: "article",
          script: "Ligne 12 — travaux du 3 au 17 mars. Pendant cette période, les bus ne desservent pas l'arrêt Hôpital Sud. Un service de remplacement part de la gare toutes les vingt minutes, de six heures à vingt et une heures. Les billets restent valables.",
        },
        {
          id: "tcf-ce-07-r",
          level: "A2",
          family: "article",
          script: "Mode d'emploi : avant la première utilisation, rincez le réservoir à l'eau claire. Remplissez-le sans dépasser le repère. Branchez l'appareil et attendez que le voyant vert s'allume avant d'appuyer sur le bouton. N'utilisez jamais de produit nettoyant à l'intérieur du réservoir.",
        },
        {
          id: "tcf-ce-08-r",
          level: "A2",
          family: "article",
          script: "À louer : studio meublé de 28 m², cinquième étage sans ascenseur, proche de l'université. Loyer 620 euros par mois, charges comprises. Libre à partir du 1er septembre. Visites le samedi uniquement. Animaux non acceptés. Écrire à l'adresse indiquée ; pas d'appels téléphoniques.",
        },
        {
          id: "tcf-ce-09-r",
          level: "A2",
          family: "article",
          script: "Avis aux patients : à partir du 5 avril, les rendez-vous se prennent en ligne ou par téléphone entre huit heures et midi. L'accueil ne prend plus de rendez-vous sur place. Les urgences sont reçues sans rendez-vous, mais l'attente peut dépasser deux heures.",
        },
        {
          id: "tcf-ce-10-r",
          level: "A2",
          family: "article",
          script: "Chers collègues, la réunion du jeudi est déplacée au vendredi, à 14 h, salle B. Merci d'apporter vos chiffres du mois. Ceux qui travaillent à distance recevront un lien la veille. La salle A reste réservée à la formation des nouveaux employés.",
        },
        {
          id: "tcf-ce-59-r",
          level: "A2",
          family: "consigne",
          freshness: 'timeless',
          script: "MACHINE À LAVER — MODE D'EMPLOI\n\nMettez le linge dans le tambour sans le tasser. Ajoutez la lessive dans le bac de gauche.\n\nChoisissez le programme, puis appuyez sur le bouton vert. La porte se verrouille : elle ne s'ouvre plus avant la fin du cycle.\n\nEn cas de problème, appuyez deux fois sur le bouton rouge et prévenez la réception. N'ouvrez jamais le panneau arrière.",
        },
        {
          id: "tcf-ce-73-r",
          level: 'A2',
          family: 'consigne',
          freshness: 'current',
          script: "Pour retirer votre colis, présentez cette carte au guichet numéro deux. Le guichet est ouvert du lundi au vendredi, de neuf heures à dix-sept heures.",
        },
        {
          id: "tcf-ce-74-r",
          level: 'A2',
          family: 'consigne',
          freshness: 'current',
          script: "Avant d'entrer dans l'atelier, laissez vos sacs dans les casiers. Les casiers sont gratuits et ferment à clé.",
        },
        {
          id: "tcf-ce-75-r",
          level: 'A2',
          family: 'consigne',
          freshness: 'current',
          script: "Remplissez le formulaire des deux côtés. Signez en bas de la seconde page, puis déposez-le dans la boîte à l'entrée.",
        },
        {
          id: "tcf-ce-76-r",
          level: 'A2',
          family: 'correspondance',
          freshness: 'current',
          script: "Bonjour Madame Roy, je confirme notre rendez-vous de jeudi à dix heures. Si cet horaire ne vous convient plus, écrivez-moi avant mercredi soir. Cordialement, Julien Tremblay",
        },
        {
          id: "tcf-ce-77-r",
          level: 'A2',
          family: 'correspondance',
          freshness: 'current',
          script: "Chers parents, la sortie au zoo est reportée au douze mai. Les billets déjà payés restent valables. Merci de votre compréhension. La direction",
        },
        {
          id: "tcf-ce-78-r",
          level: 'A2',
          family: 'correspondance',
          freshness: 'current',
          script: "Bonjour, votre demande de logement a bien été reçue. Un conseiller vous appellera dans les quinze jours. Aucune démarche supplémentaire n'est nécessaire pour l'instant.",
        },
        {
          id: "tcf-ce-79-r",
          level: 'A2',
          family: 'argumentatif',
          freshness: 'current',
          script: "Selon moi, les magasins devraient fermer le dimanche. Les employés ont besoin d'un jour de repos commun, et les familles aussi. Ceux qui travaillent toute la semaine peuvent faire leurs courses le samedi.",
        },
        {
          id: "tcf-ce-80-r",
          level: 'A2',
          family: 'argumentatif',
          freshness: 'current',
          script: "Je ne suis pas d'accord avec la fermeture de la petite école du village. Les enfants devraient prendre le bus pendant quarante minutes chaque matin. C'est trop long pour eux.",
        },
        {
          id: "tcf-ce-81-r",
          level: 'A2',
          family: 'argumentatif',
          freshness: 'current',
          script: "À mon avis, il faut garder la piscine ouverte l'hiver. C'est le seul endroit où les enfants apprennent à nager, et la ville n'a pas d'autre équipement sportif couvert.",
        },
        {
          id: "tcf-ce-82-r",
          level: 'A2',
          family: 'argumentatif',
          freshness: 'current',
          script: "Je pense que le tri des déchets devrait être expliqué à l'école. Beaucoup d'adultes se trompent encore de bac, et les enfants apprennent vite ces gestes.",
        },
        {
          id: "tcf-ce-11-r",
          // ANCHOR. One per band, chosen by closest-to-band-median profile.
          //
          // ── FIFTY-SEVEN OF SIXTY-ONE WERE ANCHORS UNTIL 31 AUGUST ────────
          // Which meant the instrument had absorbed the bank. The doctrine in
          // `Recording.role` says why that is fatal: *"an instrument that
          // absorbs what it measures widens by exactly the amount each item
          // strays, and the hundredth item ends up measured against
          // ninety-nine of its own siblings."* With four non-anchors left,
          // `bank.check.ts` was measuring four passages and reporting the
          // bank — an assertion satisfied by absence, the same shape as the
          // two others found this week.
          //
          // Reducing to six made fifty-one recordings measurable for the
          // first time. **Ten of them sit outside the ladder.** They are named
          // in `bank.check.ts` rather than excused, and the list may only
          // shrink.
          role: 'anchor',
          level: "B1",
          family: "article",
          script: "Objet : entretien du chauffage. Chers résidents, le remplacement de la chaudière commencera le lundi 6 octobre et durera environ cinq jours. Pendant les travaux, l'eau chaude sera coupée de neuf heures à seize heures, mais le chauffage continuera de fonctionner normalement. Les techniciens auront besoin d'accéder à la cave, dont la porte restera ouverte pendant la journée. Nous vous conseillons de ne pas y laisser d'objets personnels durant cette semaine. Aucune augmentation de charges n'est prévue cette année : les travaux sont financés par le fonds de réserve constitué depuis 2019.",
        },
        {
          id: "tcf-ce-12-r",
          level: "B1",
          family: "argumentatif",
          script: "Je fais le trajet domicile-travail à vélo depuis huit mois, sur onze kilomètres. On m'avait dit que je tiendrais deux semaines. En réalité, ce qui m'a fait tenir, ce n'est ni la forme ni les économies : c'est de savoir exactement à quelle heure j'arriverai. En voiture, je perdais entre vingt et cinquante minutes selon la circulation ; à vélo, c'est toujours trente-cinq minutes. Je ne dis pas que c'est agréable en février. Mais quand on organise sa journée, la régularité vaut plus que le confort.",
        },
        {
          id: "tcf-ce-13-r",
          level: "B1",
          family: "article",
          script: "Depuis janvier, la ville met à disposition des bacs de compostage dans les cours d'immeubles qui en font la demande. Le service est gratuit, mais il exige qu'un résident accepte d'être formé et de surveiller le bac. C'est ce point qui bloque : sur les quatre-vingt-dix demandes reçues, quarante-deux n'ont pas abouti faute de volontaire. La municipalité étudie donc l'idée de rémunérer ces référents, comme cela se fait pour le gardiennage. Une décision sera prise avant la fin de l'année.",
        },
        {
          id: "tcf-ce-14-r",
          level: "B1",
          family: "article",
          script: "À compter du 2 mai, l'accès aux locaux se fera uniquement par badge nominatif. Les anciennes cartes magnétiques cesseront de fonctionner le même jour. Chaque employé doit récupérer son badge auprès du service des ressources humaines, muni d'une pièce d'identité, avant le 30 avril. Les personnes en congé à cette date pourront le faire à leur retour ; l'accueil leur remettra un badge temporaire valable une journée. En cas de perte, le remplacement est facturé quinze euros à partir du deuxième badge perdu.",
        },
        {
          id: "tcf-ce-15-r",
          level: "B1",
          family: "correspondance",
          script: "Bonjour, votre inscription au module « Rédaction professionnelle » est enregistrée pour la session du 12 juin. Attention : cette session se déroule entièrement en ligne, contrairement à ce qui figurait dans le catalogue papier. Un lien de connexion vous parviendra quarante-huit heures avant. Si vous préférez la formule en présentiel, une session est prévue en octobre, mais les places sont attribuées par ordre d'inscription et il n'en reste que six. Merci de nous répondre avant vendredi pour confirmer votre choix.",
        },
        {
          id: "tcf-ce-16-r",
          level: "B1",
          family: "argumentatif",
          script: "La bibliothèque municipale ouvrira désormais jusqu'à vingt-deux heures du lundi au jeudi. La mesure répond à une demande ancienne des étudiants, qui trouvaient porte close dès dix-neuf heures. Elle a toutefois été rendue possible par un argument différent : les relevés de fréquentation montrent que les salles restaient à moitié vides l'après-midi, ce qui a permis de déplacer des heures de personnel plutôt que d'en créer. Aucun poste supplémentaire n'a donc été financé. Les week-ends, les horaires demeurent inchangés.",
        },
        {
          id: "tcf-ce-17-r",
          level: "B1",
          family: "correspondance",
          script: "Bonjour à tous. J'arrive dans trois semaines et je m'inquiète pour la couverture santé. D'après ce que j'ai lu, l'inscription au régime public n'est pas immédiate : il faut d'abord une adresse et un numéro qui met parfois plusieurs semaines à être délivré. Certains conseillent une assurance privée temporaire pour cette période, d'autres disent que c'est de l'argent perdu. Ceux qui sont passés par là : avez-vous eu des frais médicaux pendant ce délai ? Je voyage avec un enfant en bas âge, c'est surtout cela qui m'inquiète.",
        },
        {
          id: "tcf-ce-18-r",
          level: "B1",
          family: "article",
          script: "En raison de la réfection du pont, l'avenue des Ormes sera fermée à la circulation automobile du 8 au 29 juillet. Les piétons et les cyclistes pourront continuer d'emprunter le trottoir nord, élargi pour l'occasion. Une déviation par la rue Mercier est mise en place ; elle ajoute environ sept minutes au trajet aux heures creuses, davantage le matin. Les livraisons aux commerces de l'avenue restent autorisées entre cinq et sept heures. Les riverains ont reçu une autorisation spécifique par courrier.",
        },
        {
          id: "tcf-ce-19-r",
          level: "B1",
          family: "article",
          script: "Une chaîne de supermarchés a retiré les emballages plastiques de trente fruits et légumes. Les premiers résultats sont contrastés. Les pertes ont augmenté de six pour cent sur les produits fragiles, comme les fraises, mais elles ont diminué sur les pommes et les carottes, que les clients achètent désormais à l'unité et en plus petite quantité. Le responsable du projet reconnaît qu'il n'avait pas anticipé ce second effet : « Nous pensions parler d'emballage ; nous avons en fait changé la façon dont les gens font leurs courses. »",
        },
        {
          id: "tcf-ce-40-r",
          level: "B1",
          family: "consigne",
          script: "AVIS AUX LOCATAIRES — Travaux de plomberie. L'eau sera coupée du mardi 8 h au mardi 16 h. Les locataires du 3e et du 4e étage n'ont rien à faire. Ceux du 1er et du 2e doivent vider leur chauffe-eau avant lundi soir ; la marche à suivre est affichée dans la buanderie. Le concierge ne peut pas entrer chez vous en votre absence pour effectuer cette opération.",
        },
        {
          id: "tcf-ce-41-r",
          level: "B1",
          family: "consigne",
          script: "PHARMACIE — Renouvellement d'ordonnance. Déposez votre boîte vide ou votre ordonnance au comptoir. Le renouvellement est prêt en 24 heures, sauf le week-end. Si votre ordonnance date de plus d'un an, nous devons joindre votre médecin : comptez alors trois jours ouvrables. Aucun renouvellement n'est possible sans ordonnance, même si vous êtes un client régulier.",
        },
        {
          id: "tcf-ce-42-r",
          level: "B1",
          family: "consigne",
          script: "CENTRE SPORTIF — Inscription aux cours de natation. Les inscriptions se font en ligne à partir du 1er septembre pour les résidents du quartier, et à partir du 8 septembre pour les autres. Une preuve de résidence est exigée dans les deux cas. Les places non payées dans les 48 heures sont remises en vente.",
        },
        {
          id: "tcf-ce-43-r",
          level: "B1",
          family: "consigne",
          script: "BIBLIOTHÈQUE — Prêt de livres. Vous pouvez emprunter huit documents pour trois semaines. Le renouvellement se fait par téléphone ou sur le site, une seule fois, et seulement si personne n'a réservé le document. Les nouveautés, signalées par une pastille rouge, ne se renouvellent jamais.",
        },
        {
          id: "tcf-ce-48-r",
          level: "B1",
          family: "correspondance",
          script: "Bonjour Madame Tremblay,\n\nJe vous remercie encore pour la visite de samedi. L'appartement nous a beaucoup plu, en particulier la luminosité et la proximité de l'école.\n\nJe voulais vous dire que nous avons visité un autre logement dimanche, un peu plus grand et au même prix, mais plus loin du métro. Nous devons donner une réponse à ce propriétaire mercredi.\n\nSi jamais vous aviez la possibilité de revoir le loyer, ne serait-ce que de vingt-cinq dollars, cela changerait beaucoup notre décision.\n\nBien cordialement,\nSamira Belkacem",
        },
        {
          id: "tcf-ce-49-r",
          level: "B1",
          family: "correspondance",
          script: "Bonjour à toute l'équipe,\n\nJe reviens sur la réunion de mardi concernant les horaires d'été.\n\nPlusieurs d'entre vous m'ont dit après coup qu'ils n'avaient pas osé prendre la parole. Je le comprends : la discussion était rapide et j'ai moi-même conclu un peu vite.\n\nJe vous propose donc de m'écrire d'ici vendredi, individuellement, ce que vous en pensez réellement. Je ne prendrai aucune décision avant d'avoir lu tout le monde. Ce que vous m'écrirez ne sera pas partagé.\n\nMerci,\nDaniel",
        },
        {
          id: "tcf-ce-54-r",
          level: "B1",
          family: "argumentatif",
          script: "On répète qu'il faut apprendre la langue du pays où l'on s'installe, et je suis d'accord. Mais on ajoute presque toujours que ceux qui ne la parlent pas encore n'ont pas fait l'effort, et là je ne suis plus d'accord. Dans mon immeuble vivent quatre familles arrivées en même temps que la mienne. Les deux qui parlent aujourd'hui le mieux sont celles dont un adulte a trouvé un emploi de jour, avec des collègues qui parlent français. Les deux autres travaillent la nuit, dans des entrepôts, seules. Elles étudient pourtant davantage : je les vois sortir avec leurs cahiers. Certains diront que l'on peut apprendre seul avec de la volonté. C'est vrai pour quelques-uns. Cela ne dit rien de ce qui se passe pour la plupart.",
        },
        {
          id: "tcf-ce-55-r",
          level: "B1",
          family: "argumentatif",
          script: "Faut-il rendre les transports gratuits ? Les partisans avancent que cela réduirait la circulation automobile. Les opposants répondent que le réseau serait saturé sans nouvelles recettes. Les deux ont raison sur leur point, et c'est bien le problème : on discute du prix alors que la question est ailleurs. Dans ma ville, un aller simple coûte trois dollars cinquante et l'autobus passe toutes les quarante minutes le soir. J'ai des voisins qui prendraient l'autobus à cinq dollars s'il passait tous les quarts d'heure, et qui ne le prennent pas gratuitement à quarante minutes. On me dira que la fréquence coûte cher. Bien sûr. C'est précisément pourquoi je préfère qu'on mette l'argent là plutôt que dans la gratuité.",
        },
        {
          id: "tcf-ce-20-r",
          level: "B2",
          family: "argumentatif",
          script: "Une enquête menée auprès de quatre mille salariés de bureau apporte une nuance utile au débat sur le travail à distance. Interrogés sur leur propre productivité, les répondants se déclarent massivement plus efficaces chez eux : soixante-douze pour cent l'affirment. Mais lorsqu'on leur demande d'évaluer celle de leurs collègues placés dans la même situation, la proportion tombe à trente et un pour cent. Les auteurs se gardent de trancher : ils rappellent qu'aucune des deux réponses ne mesure la productivité réelle, faute d'indicateurs communs aux métiers étudiés. Ce qu'elles mesurent, en revanche, est plus intéressant : l'écart entre la confiance que l'on s'accorde et celle que l'on accorde aux autres. Les entreprises qui ont rétabli une présence obligatoire justifient rarement leur décision par des chiffres de performance ; elles invoquent la cohésion, la formation des nouveaux arrivants, parfois le coût de locaux inoccupés. L'enquête suggère qu'elles répondent surtout à un doute, et que ce doute est largement partagé par les salariés eux-mêmes.",
        },
        {
          id: "tcf-ce-21-r",
          // ANCHOR. One per band, chosen by closest-to-band-median profile.
          //
          // ── FIFTY-SEVEN OF SIXTY-ONE WERE ANCHORS UNTIL 31 AUGUST ────────
          // Which meant the instrument had absorbed the bank. The doctrine in
          // `Recording.role` says why that is fatal: *"an instrument that
          // absorbs what it measures widens by exactly the amount each item
          // strays, and the hundredth item ends up measured against
          // ninety-nine of its own siblings."* With four non-anchors left,
          // `bank.check.ts` was measuring four passages and reporting the
          // bank — an assertion satisfied by absence, the same shape as the
          // two others found this week.
          //
          // Reducing to six made fifty-one recordings measurable for the
          // first time. **Ten of them sit outside the ladder.** They are named
          // in `bank.check.ts` rather than excused, and the list may only
          // shrink.
          role: 'anchor',
          level: "B2",
          family: "argumentatif",
          script: "Note interne — remboursement des frais professionnels. À la suite de l'audit du premier trimestre, la procédure évolue au 1er septembre. Les justificatifs devront être déposés dans l'outil en ligne dans les quinze jours suivant la dépense, et non plus à la fin du mois. Cette réduction du délai n'est pas une mesure de défiance : l'audit a montré que les retards de traitement venaient pour l'essentiel de justificatifs transmis tardivement, souvent illisibles, que la comptabilité devait réclamer une seconde fois. Le plafond des repas reste inchangé. En revanche, les trajets en taxi ne seront plus remboursés lorsqu'une solution de transport collectif existe et que le déplacement a lieu entre sept et vingt heures ; les exceptions, comme le port de matériel lourd ou un motif de sécurité, devront être signalées au moment du dépôt et non a posteriori. Les responsables d'équipe recevront un récapitulatif mensuel des dépenses de leur service.",
        },
        {
          id: "tcf-ce-22-r",
          level: "B2",
          family: "article",
          script: "On répète que les écrans ont envahi les salles de classe. Il faudrait d'abord s'entendre sur ce que l'on compte. Une tablette utilisée vingt minutes pour un exercice de langue et un ordinateur allumé toute la journée au fond de la classe ne relèvent pas du même phénomène, mais les enquêtes les additionnent volontiers. Le débat public s'organise ensuite autour de deux camps également pressés : ceux qui voient dans l'outil numérique la promesse d'un enseignement individualisé, et ceux qui y voient la cause de tous les décrochages. Les uns et les autres se dispensent d'une question moins spectaculaire : que fait l'enseignant pendant ce temps ? Les rares travaux qui l'ont posée observent que les effets mesurés dépendent moins du matériel que de la préparation de la séance. Autrement dit, on discute d'un objet là où il faudrait discuter d'un métier. Ce déplacement arrange tout le monde : il est plus simple d'acheter ou d'interdire des appareils que de financer du temps de formation.",
        },
        {
          id: "tcf-ce-23-r",
          level: "B2",
          family: "article",
          script: "Longtemps épargnées, les villes moyennes connaissent à leur tour une tension sur le logement. Le phénomène ne s'explique pas d'abord par la démographie : dans plusieurs d'entre elles, la population stagne. Ce qui a changé, c'est la composition des ménages et l'usage des logements. Les séparations, le vieillissement et le maintien à domicile produisent davantage de foyers d'une ou deux personnes occupant des logements conçus pour quatre. À cela s'ajoute la conversion d'appartements en locations de courte durée dans les centres anciens, marginale en volume mais concentrée sur les biens les plus recherchés. Les élus disposent de peu de leviers rapides : la construction neuve suppose des délais de cinq à sept ans, et les terrains disponibles se situent en périphérie, loin des services que ces ménages recherchent précisément. Certaines municipalités misent donc sur la remise en location de logements vacants, dont le nombre dépasse parfois celui des demandeurs. Encore faut-il convaincre des propriétaires que la vacance n'a pas découragés jusqu'ici.",
        },
        {
          id: "tcf-ce-24-r",
          level: "B2",
          family: "article",
          script: "Procédure d'entretien annuel — évolutions. L'entretien annuel change de forme cette année. Il ne comportera plus de note globale sur cinq. Les responsables devront à la place rédiger une appréciation portant sur trois objectifs définis conjointement en début d'année. Ce choix a été discuté : la note offrait une comparaison rapide entre services, mais l'analyse des trois dernières campagnes montre que quatre-vingts pour cent des salariés recevaient la même note, ce qui rendait l'exercice peu informatif et, pour certains, décourageant. La suppression de la note ne modifie pas le calendrier des augmentations, qui reste arrêté au mois de mars par la direction financière, sur proposition des responsables de service. Il est demandé aux encadrants de ne pas anticiper cette décision au cours de l'entretien : l'expérience montre que les engagements pris à cette occasion sont rarement tenus et pèsent ensuite sur la relation de travail. Une formation de deux heures leur est proposée en janvier ; elle n'est pas obligatoire, mais vivement conseillée.",
        },
        {
          id: "tcf-ce-25-r",
          level: "B2",
          family: "article",
          script: "Chaque automne, les classements d'universités reviennent, et avec eux la même cérémonie : quelques établissements se félicitent, d'autres publient un communiqué expliquant que la méthodologie est discutable. Ils ont raison, mais ils le disent au mauvais moment, c'est-à-dire lorsqu'ils reculent. Le problème n'est pas que ces classements soient faux ; c'est qu'ils mesurent surtout ce qui est facile à compter. Le nombre de publications, les citations, la part d'étudiants étrangers se collectent aisément ; la qualité d'un cours de première année, non. Un établissement rationnel en tire les conséquences et investit là où les points se gagnent. On observe ainsi des universités qui recrutent des chercheurs prestigieux dispensés d'enseigner, tandis que les amphithéâtres de licence restent confiés à des vacataires. Le classement n'a rien imposé : il a simplement rendu certains efforts visibles et d'autres invisibles. C'est le propre de tout indicateur, et c'est pourquoi la question utile n'est pas de savoir qui arrive premier, mais qui a décidé de ce que l'on compte.",
        },
        {
          id: "tcf-ce-26-r",
          level: "B2",
          family: "article",
          script: "L'agglomération a annoncé la gratuité des transports pour les moins de vingt-cinq ans. La mesure est présentée comme sociale ; elle est aussi, plus discrètement, technique. Les contrôles menés sur cette tranche d'âge coûtaient davantage qu'ils ne rapportaient, et les abonnements jeunes étaient déjà subventionnés à hauteur de quatre-vingts pour cent. Le manque à gagner annoncé, deux millions par an, correspond donc surtout à des recettes théoriques. Les critiques portent moins sur le principe que sur le calendrier : la fréquence des lignes de banlieue n'a pas été augmentée, et plusieurs élus craignent que la gratuité n'attire des voyageurs supplémentaires sur un réseau déjà saturé aux heures de pointe. La collectivité répond que les nouveaux usagers voyageront surtout en dehors de ces heures, ce qu'aucune étude locale ne confirme pour l'instant. Le dispositif sera évalué au bout de dix-huit mois ; les indicateurs retenus n'ont pas encore été rendus publics.",
        },
        {
          id: "tcf-ce-27-r",
          level: "B2",
          family: "article",
          script: "Rappel de produit — cafetière modèle CX-40. Nous procédons au rappel volontaire des cafetières CX-40 vendues entre mars et août. Un défaut d'assemblage du joint peut, dans de rares cas, provoquer une projection d'eau chaude au moment de l'ouverture du couvercle. Aucun accident n'a été signalé à ce jour, mais le nombre d'appareils concernés nous conduit à agir sans attendre. Il vous est demandé de cesser immédiatement l'utilisation de l'appareil et de le rapporter dans le magasin où il a été acheté, muni du ticket de caisse si vous l'avez conservé ; son absence ne fera pas obstacle au remboursement. Le numéro de série figure sous la base. Seuls les numéros commençant par 40B sont visés : les autres appareils de la gamme peuvent être utilisés normalement. Nos équipes en magasin ne sont pas en mesure de réparer l'appareil, et aucun échange contre un modèle équivalent n'est proposé pour l'instant, la production étant suspendue.",
        },
        {
          id: "tcf-ce-28-r",
          level: "B2",
          family: "article",
          script: "Planter des arbres est devenu le geste climatique le plus consensuel des municipalités. Les effets sur la chaleur urbaine sont réels : un alignement dense peut abaisser de plusieurs degrés la température ressentie en fin d'après-midi. Encore faut-il que l'arbre atteigne l'âge où il produit cet effet. Les relevés effectués dans plusieurs villes montrent qu'un jeune sujet planté en pleine rue a une espérance de vie de sept à dix ans, contre plus d'un siècle dans un parc. La cause n'est pas le climat mais le sol : compacté, salé l'hiver, traversé de réseaux, il ne laisse ni eau ni air aux racines. Les campagnes de plantation qui annoncent des dizaines de milliers d'arbres communiquent rarement sur le taux de reprise. Certaines collectivités préfèrent désormais planter moins et creuser davantage, en réservant à chaque arbre une fosse de plusieurs mètres cubes. Le résultat est moins photogénique la première année ; il se voit à la trentième.",
        },
        {
          id: "tcf-ce-29-r",
          level: "B2",
          family: "article",
          script: "Le quotidien régional a cessé de paraître en version imprimée. La direction évoque la baisse du lectorat ; les journalistes, eux, insistent sur un autre chiffre : la disparition des petites annonces, qui représentaient encore un tiers des recettes il y a quinze ans et qui ont migré vers des plateformes gratuites. Le site du journal continue, avec une rédaction réduite de moitié. Ce qui disparaît n'est pas seulement un support : c'est la couverture des conseils municipaux des communes de moins de cinq mille habitants, que personne d'autre n'assurait. Des chercheurs ont montré, dans des situations comparables, que le départ du dernier journaliste local s'accompagne d'une baisse de la participation aux élections locales et d'une hausse du coût des emprunts communaux, faute de regard extérieur sur la gestion. Le lien n'est pas mécanique, mais il est constant. On mesure mal ce que coûte une information qui n'existe plus, puisqu'il ne reste personne pour en rendre compte.",
        },
        {
          id: "tcf-ce-44-r",
          level: "B2",
          family: "consigne",
          script: "PROCÉDURE DE RÉCLAMATION — Toute réclamation doit être déposée dans les trente jours suivant la date de facturation, et non la date de réception du service. Passé ce délai, seule une erreur de calcul demeure recevable, sans limite de temps. La réclamation suspend l'obligation de payer la somme contestée, mais non celle de payer le reste de la facture ; les intérêts continuent de courir sur la partie non contestée uniquement.",
        },
        {
          id: "tcf-ce-45-r",
          level: "B2",
          family: "consigne",
          script: "RÈGLEMENT DE STATIONNEMENT — La vignette de résident autorise le stationnement dans les zones vertes de votre secteur, sans limite de durée. Elle ne dispense pas du respect des interdictions temporaires signalées par panneau mobile, ni du déneigement : lors d'une opération annoncée, tout véhicule doit être déplacé, vignette ou non. Un véhicule remorqué est mis en fourrière aux frais du propriétaire, y compris lorsque le panneau a été posé moins de douze heures avant l'opération.",
        },
        {
          id: "tcf-ce-46-r",
          level: "B2",
          family: "consigne",
          script: "CONDITIONS D'ANNULATION — Une annulation communiquée plus de quatorze jours avant le départ donne droit au remboursement intégral, hors frais de dossier. Entre quatorze et sept jours, la moitié du montant est retenue. À moins de sept jours, aucun remboursement n'est accordé, sauf présentation d'un certificat médical, auquel cas les conditions des quatorze jours s'appliquent de nouveau, frais de dossier compris.",
        },
        {
          id: "tcf-ce-47-r",
          level: "B2",
          family: "consigne",
          script: "ACCÈS AU DOSSIER MÉDICAL — Vous pouvez consulter votre dossier sur place, gratuitement, ou en demander une copie, facturée au coût de reproduction. La demande écrite est obligatoire dans le second cas seulement. L'établissement dispose de trente jours pour répondre, portés à soixante lorsque le dossier a plus de cinq ans. Un refus doit être motivé par écrit ; l'absence de réponse dans les délais vaut refus et ouvre le recours.",
        },
        {
          id: "tcf-ce-50-r",
          level: "B2",
          family: "correspondance",
          script: "Madame, Monsieur,\n\nJ'ai bien reçu votre courrier du 14 mars m'informant que ma demande d'équivalence était incomplète, et je vous en remercie.\n\nVous mentionnez l'absence du relevé de notes officiel. Or ce document vous a été transmis le 3 février par mon université, directement et sous pli scellé, comme votre propre procédure l'exige — j'en joins l'accusé de réception postal.\n\nJe ne doute pas qu'il s'agisse d'un simple décalage dans le traitement du courrier. Je me permets toutefois de vous rappeler que le délai de six mois court depuis le dépôt initial, et non depuis la réception des pièces complémentaires.\n\nDans l'attente de votre confirmation,\nVeuillez agréer mes salutations distinguées,\nD. Okonkwo",
        },
        {
          id: "tcf-ce-51-r",
          level: "B2",
          family: "correspondance",
          script: "Chère Nadia,\n\nTu me demandes si tu devrais accepter ce poste à Sherbrooke. Je vais te répondre, mais tu sais déjà ce que j'en pense, et ce n'est pas pour ça que tu m'écris.\n\nTu m'as parlé du salaire, du logement moins cher, du fait que ta sœur y habite. Tout cela est vrai. Tu ne m'as pas dit un mot du travail lui-même, et tu m'as écrit trois pages.\n\nJe ne te dis pas de refuser. Je te dis de relire ta propre lettre.\n\nJe t'embrasse,\nFatou",
        },
        {
          id: "tcf-ce-52-r",
          level: "B2",
          family: "correspondance",
          script: "Objet : suite à votre évaluation annuelle\n\nBonjour Karim,\n\nJe reprends par écrit les points de notre entretien, comme vous me l'avez demandé.\n\nVos résultats techniques ne sont pas en cause et je l'ai dit clairement. Le point soulevé concerne les délais de réponse aux collègues des autres services, que plusieurs ont mentionnés spontanément lors de leur propre évaluation.\n\nVous m'avez répondu que ces demandes arrivaient sans priorité claire, ce qui est exact et ne dépend pas de vous. J'ai donc inscrit ce point comme une action de ma part, pas de la vôtre, et il figure comme tel dans le compte rendu.\n\nCe que je vous demande, pour ma part, reste un accusé de réception sous vingt-quatre heures, même sans réponse au fond.\n\nCordialement,\nMarie-Claude Fortin",
        },
        {
          id: "tcf-ce-53-r",
          level: "B2",
          family: "correspondance",
          script: "Bonjour,\n\nJe fais suite à notre conversation téléphonique de ce matin au sujet du branchement.\n\nVotre technicien m'a indiqué que l'intervention nécessitait mon absence de la matinée, ce que j'ai accepté. Après son départ, j'ai constaté que le compteur n'avait pas été remplacé et que le relevé transmis correspond à l'ancien appareil.\n\nJe ne cherche pas à savoir ce qui s'est passé et je ne demande pas de dédommagement. Je souhaite simplement que la prochaine intervention soit fixée un samedi, puisque j'ai déjà pris une demi-journée de congé pour celle-ci.\n\nMerci de me confirmer une date.\n\nA. Rossi",
        },
        {
          id: "tcf-ce-56-r",
          level: "B2",
          family: "argumentatif",
          script: "L'argument le plus fréquemment opposé au télétravail est celui de la cohésion : une équipe qui ne se voit pas se déliterait. On cite volontiers les nouveaux employés, qui apprennent mal seuls, et sur ce point l'objection porte. Il faut cependant remarquer qu'elle porte sur une population précise et qu'elle est ensuite appliquée à toutes. Un salarié de quinze ans d'ancienneté, dont le réseau interne est déjà constitué, ne se délite pas parce qu'il travaille de chez lui ; il perd deux heures de transport et n'y gagne rien d'autre. Que l'on impose donc la présence à ceux qui apprennent, et qu'on la propose aux autres. Ce n'est pas une position de compromis : c'est la seule qui tire réellement les conséquences de l'argument adverse, au lieu de l'étendre au-delà de ce qu'il établit.",
        },
        {
          id: "tcf-ce-57-r",
          level: "B2",
          family: "argumentatif",
          script: "On s'accorde à dire que la reconnaissance des diplômes étrangers est trop lente, et les ordres professionnels eux-mêmes ne le contestent plus. Le désaccord porte sur la cause. Pour les uns, il s'agit de protectionnisme : les membres en place limiteraient l'entrée. Pour les autres, la lenteur tient à la vérification, qui est réellement complexe. Je crois qu'on peut trancher, non par l'intention mais par le calendrier. Un dossier prend quatorze mois ; l'examen des équivalences, lorsqu'il a lieu, en prend deux. Les douze autres se passent en attente, sans que personne travaille sur le dossier. Une intention protectionniste produirait des refus ; l'attente, elle, produit des abandons, ce qui revient au même pour la profession et coûte moins cher à défendre. Je n'accuse donc personne d'avoir voulu ce résultat. Je constate qu'il n'y a aucune raison de le corriger.",
        },
        {
          id: "tcf-ce-30-r",
          level: "C1",
          family: "article",
          script: "On a beaucoup annoncé que le travail à distance viderait les centres-villes. Cinq ans plus tard, le tableau est plus contrarié. Les bureaux se sont bien vidés, mais inégalement : les immeubles récents, bien desservis et dotés d'espaces communs, se relouent presque au même prix qu'avant ; les tours des années soixante-dix, elles, ne trouvent plus preneur. Ce n'est donc pas la demande de bureaux qui s'effondre, c'est sa concentration qui s'accentue. Le second déplacement est moins commenté. Les commerces qui vivaient du déjeuner en semaine ont perdu deux jours de chiffre d'affaires, et ceux qui ont survécu l'ont fait en changeant de clientèle plutôt qu'en attendant le retour des salariés. Dans plusieurs quartiers d'affaires, des sandwicheries ont cédé la place à des services destinés aux résidents. Autrement dit, ces quartiers ne se sont pas dépeuplés : ils se sont mis, lentement, à ressembler à des quartiers ordinaires. Reste que l'on tire de ces observations des conclusions politiques hâtives. Certains y voient la preuve que la ville dense a gagné, d'autres qu'elle a perdu. Les deux lectures partagent le même défaut : elles traitent comme un état stable ce qui n'est qu'une transition, dont le rythme dépend d'échéances très concrètes — la fin des baux de neuf ans, le coût de la rénovation énergétique — plus que d'un changement de préférences.",
        },
        {
          id: "tcf-ce-31-r",
          level: "C1",
          family: "argumentatif",
          script: "Faut-il limiter les locations de courte durée ? Le débat oppose deux argumentations qui, curieusement, ne se contredisent pas toujours. Les partisans d'un encadrement strict rappellent qu'un logement loué trois cents nuits par an à des visiteurs n'est plus un logement : c'est un hôtel qui n'en porte ni les obligations ni la fiscalité. Ils observent que la pression se concentre sur quelques quartiers, où la part des résidences principales a reculé, et que la disponibilité y détermine désormais les loyers de tout le voisinage. Leurs adversaires ne nient pas ces chiffres. Ils soutiennent en revanche que la cause du renchérissement est ailleurs : dans un déficit de construction accumulé depuis vingt ans, dont la location touristique ne serait qu'un symptôme visible et commode. Interdire, disent-ils, déplacerait le problème sans produire un seul logement supplémentaire, et priverait des propriétaires modestes d'un revenu d'appoint. Le point aveugle est commun aux deux camps. Aucun ne s'interroge sur ce qui se passe après l'interdiction : les études disponibles montrent que les logements retirés des plateformes reviennent surtout à la location meublée de moyenne durée, destinée à des étudiants et à des salariés en mission, à des prix supérieurs à ceux du marché classique. La mesure produit alors un effet réel, mais différent de celui qu'annoncent ses promoteurs comme de celui que redoutent ses opposants.",
        },
        {
          id: "tcf-ce-32-r",
          level: "C1",
          family: "argumentatif",
          script: "Il y a une manière très sûre de paraître exigeant sans l'être : élever le diplôme demandé. L'employeur qui réclame aujourd'hui cinq années d'études pour un poste que trois suffisaient à occuper hier n'a pas constaté que le travail était devenu plus complexe ; il a constaté qu'il recevait trois cents candidatures et qu'il fallait bien en écarter deux cent quatre-vingt-dix. Le diplôme sert alors moins à qualifier qu'à trier, et il trie d'autant mieux qu'il est long, c'est-à-dire coûteux. On dira que l'entreprise est libre de ses critères. Sans doute. Mais l'addition de ces libertés individuelles produit un résultat que personne n'a voulu : des jeunes gens qui empruntent pour financer des années d'études dont ils constateront, une fois embauchés, qu'elles ne leur servent guère, et des employeurs qui se plaignent ensuite de ne pas trouver de candidats. On me répondra que le diplôme reste un signal utile, et c'est vrai. Un signal, cependant, perd sa valeur à mesure que chacun se l'approprie ; il faut alors en émettre un plus fort, et la course recommence. Les rares secteurs qui ont rompu avec cette logique, en évaluant sur épreuve plutôt que sur titre, n'y sont pas venus par générosité, mais parce qu'ils ne trouvaient plus personne. C'est souvent ainsi que les habitudes changent : non par conviction, mais par pénurie.",
        },
        {
          id: "tcf-ce-33-r",
          level: "C1",
          family: "article",
          script: "Chaque mois, un chiffre tombe et l'on discute de sa variation à la décimale près. On discute rarement de ce qu'il contient. Être au chômage, au sens de la statistique internationale, suppose trois conditions simultanées : ne pas avoir travaillé, même une heure, au cours de la semaine de référence ; être disponible pour occuper un emploi ; en avoir cherché un activement. Chacune de ces conditions est défendable, et chacune exclut du décompte des situations que le sens commun y placerait volontiers. Une personne qui a effectué quatre heures de ménage pour un particulier n'est pas comptée. Celle qui, après deux ans de recherches infructueuses, a cessé d'envoyer des candidatures sort du chiffre au moment précis où sa situation s'aggrave. À l'inverse, un étudiant qui cherche un emploi d'été y entre. Il ne s'agit pas de dénoncer une manipulation : la définition est publique, stable, et c'est cette stabilité qui permet les comparaisons dans le temps et entre pays. Le problème tient plutôt à l'usage que l'on en fait. Un indicateur conçu pour mesurer une tension sur le marché du travail est mobilisé pour trancher des questions qu'il n'a jamais eu vocation à traiter : la pauvreté, la précarité, le découragement. Les instituts publient d'ailleurs des mesures complémentaires du sous-emploi et du halo autour du chômage. Elles sont disponibles ; elles ne sont presque jamais citées.",
        },
        {
          id: "tcf-ce-34-r",
          level: "C1",
          family: "article",
          script: "Les pistes cyclables séparées sont-elles la solution ? La question paraît technique ; elle recouvre en réalité deux visions de la rue. La première considère la sécurité comme un problème d'infrastructure. Séparer physiquement les flux, dit-elle, réduit les conflits et rassure les usagers les moins assurés — enfants, personnes âgées, débutants —, c'est-à-dire précisément ceux qui ne pédalent pas encore. Les comptages effectués après l'aménagement lui donnent souvent raison : la fréquentation augmente là où la séparation est continue, beaucoup moins là où elle s'interrompt à chaque carrefour. La seconde vision, minoritaire mais argumentée, tient que la séparation déplace le danger vers les intersections, où se produit l'essentiel des collisions graves, et qu'elle légitime implicitement la vitesse automobile sur le reste de la chaussée : chacun chez soi, donc chacun à son allure. Ses partisans plaident pour un abaissement généralisé de la vitesse, moins coûteux et plus homogène. Ces deux positions ne s'opposent pas autant qu'on le croit. Elles divergent sur un point précis : l'échelle à laquelle on juge une politique. La première raisonne sur des axes, la seconde sur un réseau. Une ville peut fort bien aménager ses grands boulevards et laisser ses rues secondaires en l'état ; elle obtiendra alors des comptages flatteurs sur les axes équipés et un bilan d'accidents inchangé. C'est ce qui s'est produit dans plusieurs agglomérations, sans que personne y ait rien fait de faux.",
        },
        {
          id: "tcf-ce-35-r",
          // ANCHOR. One per band, chosen by closest-to-band-median profile.
          //
          // ── FIFTY-SEVEN OF SIXTY-ONE WERE ANCHORS UNTIL 31 AUGUST ────────
          // Which meant the instrument had absorbed the bank. The doctrine in
          // `Recording.role` says why that is fatal: *"an instrument that
          // absorbs what it measures widens by exactly the amount each item
          // strays, and the hundredth item ends up measured against
          // ninety-nine of its own siblings."* With four non-anchors left,
          // `bank.check.ts` was measuring four passages and reporting the
          // bank — an assertion satisfied by absence, the same shape as the
          // two others found this week.
          //
          // Reducing to six made fifty-one recordings measurable for the
          // first time. **Ten of them sit outside the ladder.** They are named
          // in `bank.check.ts` rather than excused, and the list may only
          // shrink.
          role: 'anchor',
          level: "C1",
          family: "article",
          script: "On reproche aux médias en ligne de courir après l'audience. Le reproche est juste et un peu court, car il suppose que l'audience serait un objectif qu'on pourrait abandonner à volonté, comme on renonce à une mauvaise habitude. Observons plutôt le mécanisme. Une rédaction dispose désormais, en temps réel, du nombre de lecteurs de chaque article, de la durée passée sur la page, du point exact où l'on décroche. Cette information n'existait pas il y a vingt ans ; elle est aujourd'hui affichée sur un écran au milieu de la salle. On n'a pas besoin de consigne pour qu'un journaliste, qui voit son sujet s'effondrer à la troisième minute, écrive différemment le suivant. Aucune décision éditoriale n'a été prise, et la ligne du journal a pourtant changé. C'est pourquoi les appels à la responsabilité individuelle des rédacteurs manquent leur cible. Ce n'est pas une faiblesse morale que l'on constate, c'est l'effet ordinaire d'un instrument de mesure sur ce qu'il mesure. Les rares titres qui ont préservé une hiérarchie de l'information indépendante de ces courbes ne l'ont pas fait par vertu : ils ont modifié leur financement, de sorte que la courbe ne détermine plus la recette. Tant que le revenu dépend du clic, exiger des journalistes qu'ils l'ignorent revient à leur demander de travailler contre leur employeur.",
        },
        {
          id: "tcf-ce-60-r",
          level: "C1",
          family: "correspondance",
          freshness: 'current',
          script: "Madame,\n\nVotre demande de report de la date de restitution nous est bien parvenue, et je tiens d'abord à écarter un malentendu que votre lettre laisse entendre : le refus qui vous a été opposé au guichet n'était pas une décision, mais l'application d'une règle que l'agent n'avait pas le pouvoir d'écarter.\n\nLa règle est la suivante. Un report est accordé de droit lorsqu'il est demandé avant l'échéance ; passé ce terme, il relève d'un examen individuel, dont l'issue dépend des motifs invoqués et non de l'ancienneté du dossier. Votre demande a été déposée deux jours après l'échéance, ce qui explique — sans le justifier à vos yeux, je le conçois — la réponse que vous avez reçue.\n\nJ'ai réexaminé votre situation. Les circonstances que vous décrivez me paraissent recevables, et le report vous est accordé jusqu'au 30 novembre. Il ne sera pas renouvelé.\n\nJe vous prie d'agréer, Madame, l'expression de mes salutations distinguées.\n\nHélène Marceau\nService des prêts",
        },
        {
          id: "tcf-ce-83-r",
          level: 'C1',
          family: 'consigne',
          freshness: 'current',
          script: "La demande de révision parvient au service dans les trente jours qui suivent la notification de la décision contestée. Ce délai court à compter de la réception effective du courrier, jamais depuis sa date d'expédition. Le dossier comprend l'exposé des motifs, la copie intégrale de la décision et les pièces établissant tout élément nouveau. Un dossier incomplet n'est jamais rejeté d'emblée : il demeure suspendu quinze jours, pendant lesquels le demandeur fournit les documents manquants. Passé ce terme, la demande est classée sans examen au fond, quelle que soit sa valeur apparente. Le dépôt ne suspend rien, si bien que la décision attaquée continue de produire ses effets jusqu'au terme de la procédure.",
        },
        {
          id: "tcf-ce-84-r",
          level: 'C1',
          family: 'consigne',
          freshness: 'current',
          script: "Chaque copie est lue par deux correcteurs indépendants, dont aucun ne connaît la note attribuée par son collègue. Lorsque l'écart entre les deux évaluations dépasse trois points, la copie passe entre les mains d'un troisième lecteur. Son appréciation ne remplace pas les précédentes : elle s'y ajoute, et la note définitive devient la moyenne des trois. Aucun correcteur ne peut modifier une note après la clôture officielle de la session, même s'il constate une erreur. Le correcteur concerné saisit alors le responsable de session, seul habilité à ouvrir une rectification, et motive sa demande par un écrit circonstancié.",
        },
        {
          id: "tcf-ce-85-r",
          level: 'C1',
          family: 'consigne',
          freshness: 'current',
          script: "Utilisation des salles partagées. La réservation s'effectue au plus tôt quatorze jours à l'avance et devient définitive une fois validée par le service concerné, cette validation intervenant sous quarante-huit heures. Une salle réservée qui reste inoccupée plus de vingt minutes après l'heure prévue est considérée comme libérée, et toute personne présente peut alors l'utiliser jusqu'à la fin du créneau. Les réservations répétées non honorées entraînent, après deux avertissements, la suspension du droit de réserver pendant un mois. Il est possible de céder son créneau à un collègue, à condition d'en informer le service avant le début de la plage réservée.",
        },
        {
          id: "tcf-ce-86-r",
          level: 'C1',
          family: 'consigne',
          freshness: 'current',
          script: "Conditions d'accès aux archives. La consultation sur place est libre pour les documents de plus de cinquante ans. Pour les documents plus récents, une autorisation est nécessaire ; elle est accordée au vu de l'objet de la recherche et n'ouvre l'accès qu'aux pièces expressément désignées. La reproduction est autorisée pour un usage personnel, mais toute publication, même partielle, suppose une autorisation distincte, qui ne peut être demandée qu'après la consultation. Les documents fragiles ne sont communiqués que sous forme numérisée, et lorsque la numérisation n'existe pas encore, le lecteur peut en demander la réalisation, dont le délai dépasse fréquemment trois mois.",
        },
        {
          id: "tcf-ce-87-r",
          level: 'C1',
          family: 'correspondance',
          freshness: 'current',
          script: "Nous avons bien reçu la lettre par laquelle vous contestez le montant porté sur votre dernière facture de mars. Après examen du dossier, il ressort que la somme prélevée correspond bien à un service que vous aviez demandé en février. Ce service a toutefois été mis en route quinze jours avant la date de départ que vous nous aviez donnée. Nous vous rendons donc la part qui n'aurait pas dû être prise, soit quarante-huit dollars pour la période en cause. Cette somme viendra en moins sur votre prochaine facture, et elle ne sera pas versée sur votre compte en banque. C'est le seul mode de retour que prévoient nos conditions de vente, et nous ne pouvons pas y déroger.",
        },
        {
          id: "tcf-ce-88-r",
          level: 'C1',
          family: 'correspondance',
          freshness: 'current',
          script: "Votre candidature au poste de coordonnateur a retenu l'attention du comité, dont je conduis les travaux depuis le mois de mars. Je vous en informe avant la fin d'une procédure dont le calendrier a pris beaucoup de retard cette année. Le comité a jugé votre travail de terrain très solide, et vos références lui ont paru claires et bien étayées. Il s'est en revanche demandé si vous seriez libre le soir, puisque le poste suppose une présence hors des heures de bureau. Je souhaite donc que vous nous disiez par écrit quelles sont, aujourd'hui, les contraintes qui pèsent sur vos horaires. Cette demande ne vise pas à écarter votre dossier, mais à fonder le second entretien sur des faits établis.",
        },
        {
          id: "tcf-ce-89-r",
          level: 'C1',
          family: 'correspondance',
          freshness: 'current',
          script: "Chère collègue, Je reviens sur la réunion de mardi, où l'on m'a semblé conclure un peu vite. Il a été retenu que le nouveau protocole s'appliquerait dès septembre à l'ensemble des services ; or deux d'entre eux ne disposeront pas avant décembre du matériel que ce protocole suppose. Je ne demande pas que la décision soit renversée, seulement qu'elle distingue ce qui peut commencer maintenant de ce qui ne le peut pas, faute de quoi nous inscrirons dans un compte rendu une échéance que personne ne pourra tenir, et c'est ce genre d'écart qui use la confiance des équipes. Bien à toi,",
        },
        {
          id: "tcf-ce-90-r",
          level: 'C1',
          family: 'argumentatif',
          freshness: 'current',
          script: "On répète que le travail à distance réduit les déplacements quotidiens et, du même coup, les émissions qui leur sont attribuées. Le raisonnement reste juste tant qu'on le borne au seul trajet professionnel que la journée de télétravail supprime. Il devient beaucoup plus fragile dès qu'on regarde ce que ces journées produisent ailleurs, sans qu'on y prenne garde. Un logement chauffé continuellement, des déplacements courts multipliés, parfois un déménagement vers un logement périurbain plus éloigné. Aucun de ces effets n'annule le gain initial, mais leur addition suffit à le réduire considérablement. Personne ne dispose aujourd'hui d'une estimation globale, et c'est précisément là que le pas est franchi trop vite.",
        },
        {
          id: "tcf-ce-91-r",
          level: 'C1',
          family: 'argumentatif',
          freshness: 'current',
          script: "L'idée que l'on apprend mieux une langue en immersion est devenue si banale qu'on l'utilise pour justifier à peu près n'importe quel dispositif. Elle repose pourtant sur une observation étroite : les apprenants placés en immersion progressent vite à l'oral courant. Ils ne progressent pas plus vite, et souvent moins, sur ce que les examens mesurent, c'est-à-dire l'écrit organisé et la précision grammaticale. Présenter l'immersion comme supérieure suppose donc qu'on ait décidé, sans le dire, quelle compétence compte. Ce choix est défendable ; ce qui ne l'est pas, c'est de le faire passer pour un résultat.",
        },
        {
          id: "tcf-ce-36-r",
          level: "C2",
          family: "article",
          script: "Il existe désormais, dans chaque administration un peu importante, une direction de l'innovation. On lui doit des séminaires, des chartes, et parfois un mur repeint en couleurs vives où l'on est invité à déposer ses idées sur des papiers adhésifs. Nul n'oserait s'en plaindre : qui, raisonnablement, se déclarerait contre l'innovation ? C'est justement à ce caractère indiscutable qu'on la reconnaît. Un mot d'ordre auquel personne ne s'oppose n'a plus de contenu ; il a une fonction. Celle-ci consiste, dans le cas présent, à déplacer l'attention. Tant qu'on délibère sur la manière d'innover, on ne délibère pas sur ce qu'il faudrait cesser de faire, question autrement désagréable puisqu'elle engage des personnes, des services et des habitudes. L'observateur naïf s'étonnera que les administrations les plus prolixes en la matière soient rarement celles qui ont modifié leurs procédures. L'étonnement se dissipe si l'on admet que le dispositif fonctionne parfaitement, mais pas dans le sens annoncé : il produit du consentement et non du changement. Les agents y participent, apprennent le vocabulaire, et retournent ensuite à des formulaires que nul n'a touchés depuis vingt ans. Faut-il en conclure que tout cela est vain ? Ce serait aller vite. Ces rituels donnent à des organisations vieillissantes une image d'elles-mêmes qu'elles peuvent supporter, ce qui n'est pas rien. On appelle ordinairement cela du réconfort ; l'usage veut, dans le secteur public comme ailleurs, qu'on le nomme une transformation.",
        },
        {
          id: "tcf-ce-37-r",
          level: "C2",
          family: "argumentatif",
          script: "Une ville qui se donne pour tâche de conserver sa mémoire commence, sans y prendre garde, par en fabriquer une. Le classement d'un quartier, la restauration d'une halle, l'installation d'un panneau explicatif : chacun de ces gestes suppose qu'on a choisi une date à laquelle l'endroit était censé être lui-même. On restaure rarement une façade dans l'état où on l'a trouvée ; on la ramène à un moment antérieur, jugé plus authentique, et qui coïncide le plus souvent avec la période dont la ville tire aujourd'hui quelque fierté. Les couches suivantes — l'atelier installé dans les années trente, les logements ouvriers ajoutés après la guerre — sont alors traitées comme des accidents dont il conviendrait de débarrasser l'édifice. Elles étaient pourtant, elles aussi, de l'histoire ; simplement d'une histoire moins présentable. Ce n'est pas un procès qu'il faut instruire. Toute conservation choisit, faute de quoi elle ne conserverait rien : on ne peut pas maintenir simultanément tous les états d'un bâtiment. Mais il y a une différence entre choisir en le sachant et présenter son choix comme une restitution. La première attitude produit des villes discutables, où l'on peut demander pourquoi telle époque a été retenue. La seconde produit des décors, d'autant plus convaincants qu'ils n'ont jamais existé sous cette forme, et devant lesquels il devient impossible de poser la moindre question — puisqu'on ne discute pas avec ce qui se donne pour le passé lui-même.",
        },
        {
          id: "tcf-ce-38-r",
          // ANCHOR. One per band, chosen by closest-to-band-median profile.
          //
          // ── FIFTY-SEVEN OF SIXTY-ONE WERE ANCHORS UNTIL 31 AUGUST ────────
          // Which meant the instrument had absorbed the bank. The doctrine in
          // `Recording.role` says why that is fatal: *"an instrument that
          // absorbs what it measures widens by exactly the amount each item
          // strays, and the hundredth item ends up measured against
          // ninety-nine of its own siblings."* With four non-anchors left,
          // `bank.check.ts` was measuring four passages and reporting the
          // bank — an assertion satisfied by absence, the same shape as the
          // two others found this week.
          //
          // Reducing to six made fifty-one recordings measurable for the
          // first time. **Ten of them sit outside the ladder.** They are named
          // in `bank.check.ts` rather than excused, and the list may only
          // shrink.
          role: 'anchor',
          level: "C2",
          family: "article",
          script: "L'entreprise a bien fait les choses. Il y a eu la semaine du bien-être, la conférence sur le sommeil, l'atelier de respiration du mardi midi — sur le temps de pause, précisons-le, afin que nul ne puisse dire que la production en a souffert. Les affiches recommandent de savoir se déconnecter ; elles sont apposées, entre autres, dans le couloir qui mène au service dont les effectifs ont été réduits d'un tiers en janvier. On aurait tort d'y voir du cynisme. Le cynisme suppose qu'on sache ce que l'on fait. Ce qui se passe ici est plus banal et plus tenace : une organisation a rencontré un problème dont la cause se situait dans son organisation même, et elle a choisi le seul type de réponse qu'elle savait produire, c'est-à-dire un programme. Le programme a un budget, un responsable, des indicateurs de participation ; la charge de travail, elle, n'a ni budget ni responsable, elle résulte de décisions dispersées que personne n'a prises ensemble. Le résultat mérite d'être noté. Les salariés qui suivent ces ateliers vont mieux, ce que les évaluations internes établissent honnêtement. Ils vont mieux parce qu'ils ont passé quarante minutes sans écrire de courriels. On les félicite d'avoir appris à respirer. On aurait pu, à peu près au même coût, leur donner quarante minutes.",
        },
        {
          id: "tcf-ce-39-r",
          level: "C2",
          family: "argumentatif",
          script: "On demande aux experts de prévoir, puis on leur reproche de s'être trompés ; et l'on recommence le trimestre suivant avec les mêmes, ce qui devrait suffire à faire soupçonner que la prévision n'est pas ce que l'on attend d'eux. Considérons ce que fait réellement un institut lorsqu'il annonce une croissance de un virgule deux pour cent. Il produit un chiffre assorti d'un intervalle, lequel disparaît dans la reprise médiatique, et d'hypothèses explicites — prix de l'énergie, comportement d'épargne — qui disparaissent également. Reste un nombre, seul, auquel on prêtera ensuite une autorité que son auteur ne lui a jamais reconnue. Le malentendu ne naît pas de l'institut ; il naît de l'usage qui veut qu'une décision paraisse fondée. Car c'est là, me semble-t-il, la véritable demande. Une administration qui doit arbitrer entre deux dépenses n'a pas besoin de connaître l'avenir : elle a besoin de pouvoir dire qu'elle s'est appuyée sur autre chose que sa préférence. Le chiffre remplit cet office, et il le remplit d'autant mieux qu'il est précis — la décimale, ici, ne mesure rien, elle rassure. On comprend alors pourquoi la répétition des erreurs ne discrédite personne. Un instrument dont on se sert pour justifier n'a pas à être exact, il a à être disponible. Ceux qui réclament des prévisionnistes plus modestes n'ont pas tort sur le fond ; ils se trompent seulement d'adresse, car la modestie qu'ils demandent supprimerait précisément le service que l'on attend d'eux.",
        },
        {
          id: "tcf-ce-61-r",
          level: "C2",
          family: "consigne",
          freshness: 'timeless',
          script: "EXTRAIT DU RÈGLEMENT INTÉRIEUR — DÉPÔT DES DEMANDES\n\nArticle 7. Toute demande est réputée déposée à la date de sa réception par le service, et non à celle de son envoi ; le cachet de la poste ne fait foi que lorsque le présent règlement le prévoit expressément, ce qui n'est le cas ni des demandes de report ni des recours.\n\nArticle 8. Une demande incomplète n'interrompt pas les délais. Le service en accuse réception et indique les pièces manquantes ; le délai continue de courir pendant que le demandeur les rassemble, sauf si l'incomplétude résulte d'une pièce que l'administration devait elle-même fournir, auquel cas le délai est suspendu jusqu'à sa transmission.\n\nArticle 9. Le silence gardé pendant deux mois vaut rejet, à l'exception des demandes mentionnées à l'annexe II, pour lesquelles il vaut acceptation. Il appartient au demandeur de vérifier à quelle catégorie sa demande appartient : aucune information à ce sujet n'est adressée d'office.",
        },
        {
          id: "tcf-ce-92-r",
          level: 'C2',
          family: 'consigne',
          freshness: 'current',
          script: "Le présent protocole fixe les conditions dans lesquelles une décision individuelle peut être retirée par l'autorité qui l'a prise. Le retrait n'est possible que si la décision est illégale et si elle est intervenue depuis moins de quatre mois, ces deux conditions étant cumulatives et non alternatives. Lorsque la décision a créé des droits au bénéfice de son destinataire, celui-ci est invité à présenter ses observations avant que le retrait ne soit prononcé, et le silence qu'il garde ne vaut jamais acceptation. Une décision obtenue par fraude échappe entièrement à ces règles : elle peut être retirée à tout moment, sans condition de délai, et l'administration n'a pas à démontrer un préjudice pour agir ainsi.",
        },
        {
          id: "tcf-ce-93-r",
          level: 'C2',
          family: 'consigne',
          freshness: 'current',
          script: "Les demandes de subvention sont instruites en deux temps, et la confusion entre ces deux temps est la cause la plus fréquente des recours. L'examen de recevabilité vérifie uniquement que le dossier est complet et que le demandeur entre dans le champ du dispositif, sans porter la moindre appréciation sur la qualité du projet présenté. L'examen au fond, qui suit, apprécie cette qualité et peut parfaitement écarter un dossier déclaré recevable quelques semaines auparavant. Une notification de recevabilité, quelle que soit la formulation employée par le service instructeur, ne constitue donc en aucun cas une promesse de financement, et les correspondances qui en font état ne sauraient être opposées à la commission lorsqu'elle statue.",
        },
        {
          id: "tcf-ce-94-r",
          level: 'C2',
          family: 'consigne',
          freshness: 'current',
          script: "Toute personne qui consulte ce fonds accepte les règles suivantes, dont l'application ne souffre aucune exception, quelle que soit la qualité du demandeur. Les documents sont communiqués un par un, et le lecteur qui souhaite en consulter un autre restitue d'abord celui qu'il détient, afin que le contrôle du fonds reste possible à tout instant. Aucune annotation, même au crayon et même destinée à être effacée, ne peut être portée sur une pièce originale. La reproduction photographique est tolérée sans flash, mais elle cesse de l'être dès lors qu'elle porte sur un ensemble cohérent, la reproduction intégrale d'un fonds relevant d'une convention distincte que le service négocie au cas par cas.",
        },
        {
          id: "tcf-ce-95-r",
          level: 'C2',
          family: 'correspondance',
          freshness: 'current',
          script: "Monsieur le Directeur, Je me permets de revenir sur l'entretien du quatorze mars, dont le compte rendu me paraît fidèle sur les faits et inexact sur leur portée. Il y est écrit que j'aurais accepté le principe d'un transfert au service voisin, alors que j'avais expressément subordonné mon accord au maintien de mes fonctions d'encadrement, condition dont le document ne porte aucune trace. Je ne mets pas en cause la bonne foi de la personne qui a rédigé ce texte, la nuance ayant pu se perdre dans une discussion longue et parfois vive. Je demande néanmoins qu'un addendum soit joint au dossier, car un accord conditionnel dont la condition a disparu se lit, quelques mois plus tard, comme un accord sans réserve. Je vous prie d'agréer, Monsieur le Directeur, l'expression de ma considération distinguée.",
        },
        {
          id: "tcf-ce-96-r",
          level: 'C2',
          family: 'correspondance',
          freshness: 'current',
          script: "Chère Madame, Votre lettre du deux juin m'a été communiquée et j'y réponds sans attendre la réunion de la commission, dont la date demeure indéterminée. Vous soutenez que le règlement adopté en avril vous a été appliqué avant même de vous avoir été régulièrement notifié, et vous avez raison sur ce point précis. Il ne s'ensuit pas, cependant, que la mesure prise à votre égard soit dépourvue de fondement : elle reposait sur l'ancien règlement, dont la rédaction était sur cette question rigoureusement identique, ce que votre correspondance ne conteste nullement. La difficulté qui subsiste n'est donc pas celle de la validité intrinsèque de la mesure, mais celle des modalités selon lesquelles elle vous a été présentée, et sur ce terrain votre grief me paraît parfaitement légitime. Veuillez croire, chère Madame, à l'expression de mes sentiments dévoués.",
        },
        {
          id: "tcf-ce-97-r",
          level: 'C2',
          family: 'correspondance',
          freshness: 'current',
          script: "Cher confrère, J'ai lu votre note sur l'évaluation des dossiers et je souscris à sa conclusion, non à l'un des chemins qui y mènent. Vous écrivez que la grille actuelle favorise les candidats issus des grandes structures, et l'observation est juste ; vous l'expliquez par la pondération accordée à l'expérience de gestion, et c'est ici que je décroche. Cette pondération existait déjà dans la grille précédente, sous laquelle l'écart entre les deux populations était plus faible, ce qui rend l'explication insuffisante à défaut d'être fausse. Il me semble que le facteur décisif est ailleurs : nous demandons désormais des lettres de recommandation, et une lettre suppose un réseau que les petites structures fournissent rarement. Bien à vous,",
        },
        {
          id: "tcf-ce-98-r",
          level: 'C2',
          family: 'correspondance',
          freshness: 'current',
          script: "Madame la Mairesse, Les habitants du quartier nord vous ont écrit deux fois au sujet du passage à niveau, et la réponse reçue en février portait sur un autre point que celui qui était soulevé. Nous ne demandions pas la suppression du passage, dont nous savons qu'elle relève de la compagnie ferroviaire et non de la municipalité, mais l'aménagement du cheminement piéton qui y conduit, lequel dépend entièrement de vos services. Cette confusion nous a coûté quatre mois, et elle se reproduira tant que nos courriers seront traités par le service chargé des transports plutôt que par celui de la voirie. Nous sollicitons donc un rendez-vous, en présence des deux services, afin que la question ne soit plus renvoyée de l'un à l'autre. Nous vous prions d'agréer, Madame la Mairesse, l'expression de notre haute considération.",
        },
        {
          id: "tcf-ce-99-r",
          level: 'C2',
          family: 'article',
          freshness: 'current',
          script: "La ville a rendu publics, l'an dernier, les délais de traitement de chacun de ses services, dans l'idée que la transparence produirait par elle-même une amélioration. Les délais se sont effectivement raccourcis, de dix-huit pour cent en moyenne, et le rapport annuel en fait un succès sans réserve. L'examen des dossiers nuance ce constat d'une manière qui mérite d'être dite : la baisse porte presque entièrement sur les demandes simples, que les agents traitent désormais en priorité parce qu'elles font baisser la moyenne publiée, tandis que les dossiers complexes attendent plus longtemps qu'auparavant. La mesure a donc modifié le comportement qu'elle observait, ce qui est le risque propre à tout indicateur rendu public, et personne n'avait prévu de suivre séparément les deux populations.",
        },
        {
          id: "tcf-ce-100-r",
          level: 'C2',
          family: 'article',
          freshness: 'current',
          script: "On présente souvent la pénurie de logements comme un problème de construction, et l'on en déduit qu'il suffirait de bâtir davantage. Les chiffres du dernier recensement compliquent cette lecture : le parc a crû plus vite que la population dans onze des quinze villes étudiées, et la tension y a pourtant augmenté. Ce que ces villes ont en commun n'est pas un défaut de logements, mais une transformation de leur usage, entre résidences occupées quelques semaines par an et locations de courte durée qui sortent du marché résidentiel sans quitter le parc. Le remède tiré du diagnostic habituel n'est pas inutile, il est simplement insuffisant, et le formuler autrement supposerait de compter les logements par leur usage plutôt que par leur existence.",
        },
        {
          id: "tcf-ce-101-r",
          level: 'C2',
          family: 'argumentatif',
          freshness: 'current',
          script: "L'argument selon lequel il faudrait enseigner le code informatique dès l'école primaire s'appuie sur une prémisse qu'on n'énonce presque jamais : que les compétences acquises tôt se transfèrent ensuite à d'autres domaines. Cette prémisse est douteuse. Les travaux disponibles montrent un transfert réel vers la résolution de problèmes structurés, et un transfert nul vers tout le reste, ce qui est beaucoup plus modeste que la promesse portée par le mot compétence. Rien de tout cela ne condamne l'enseignement du code, qui vaut pour lui-même comme vaut l'enseignement de la musique. Ce qui est contestable, c'est de le justifier par un bénéfice général dont nous savons déjà qu'il n'existe pas, car une justification fausse survit rarement à sa réfutation, et elle emporte alors avec elle la chose qu'elle défendait.",
        },
        {
          id: "tcf-ce-102-r",
          level: 'C2',
          family: 'argumentatif',
          freshness: 'current',
          script: "Chaque fois qu'un service public est jugé trop lent, la réponse proposée est la même : réduire le nombre d'étapes. La proposition est séduisante parce qu'elle se mesure facilement, et c'est précisément ce qui devrait éveiller la méfiance. Une étape supprimée n'est pas un délai supprimé ; elle est un contrôle déplacé, le plus souvent vers l'aval, où il coûte davantage parce qu'il intervient sur des dossiers déjà engagés. Les administrations qui ont le plus raccourci leurs procédures sont aussi celles qui ont vu croître le nombre de reprises, et le temps total, seul chiffre qui intéresse l'usager, n'a pas bougé. Simplifier reste possible, mais à la condition de compter ce que la simplification déplace, faute de quoi l'on ne réforme pas une procédure, on en change seulement la présentation.",
        },
      ],
      items: [
        {
          id: "tcf-ce-01",
          recordingId: "tcf-ce-01-r",
          level: "A1",
          stem: "Que doivent faire les personnes qui lisent cet avis ?",
          options: ["Réparer l'ascenseur", "Prendre l'escalier", "Attendre le technicien", "Sortir de l'immeuble"],
          answer: 1,
          rationale: "Tests literal comprehension of a single instruction; the distractors all name reactions that would be reasonable in real life but that the notice never asks for.",
        },
        {
          id: "tcf-ce-02",
          recordingId: "tcf-ce-02-r",
          level: "A1",
          stem: "Que faut-il faire du produit une fois ouvert ?",
          options: ["Le mettre au réfrigérateur", "Le congeler", "Le jeter le jour même", "Le laisser à la lumière"],
          answer: 0,
          rationale: "Tests recognition of a storage instruction on a label; freezing and discarding are plausible food-handling actions in general but the label prescribes refrigeration only.",
        },
        {
          id: "tcf-ce-03",
          recordingId: "tcf-ce-03-r",
          level: "A1",
          stem: "Quel jour la bibliothèque est-elle fermée ?",
          options: ["Le samedi", "Le mardi", "Le dimanche", "Le lundi"],
          answer: 3,
          rationale: "Tests reading of a simple opening-hours notice; Sunday is the day a reader would guess from general habit, and Tuesday and Saturday are days explicitly covered by the open period.",
        },
        {
          id: "tcf-ce-04",
          recordingId: "tcf-ce-04-r",
          level: "A1",
          stem: "Qui peut circuler sur cette voie ?",
          options: ["Les cyclistes", "Les voitures", "Les piétons", "Personne"],
          answer: 2,
          rationale: "Tests understanding of a permission-plus-prohibition sign; the cyclist option reverses the prohibition, cars are never mentioned, and the sign does not close the lane to everyone.",
        },
        {
          id: "tcf-ce-58",
          recordingId: "tcf-ce-58-r",
          level: "A1",
          stem: "Que propose Léa ?",
          options: [
            "De rapporter quelque chose",
            "De rentrer plus tôt",
            "D'acheter du pain",
            "De préparer le dîner",
          ],
          answer: 0,
          rationale: "Léa passe à la pharmacie et demande si Karim a besoin de quelque chose ; le pain est déjà là et l'heure du retour n'est qu'une information.",
        },
        {
          id: "tcf-ce-05",
          recordingId: "tcf-ce-05-r",
          level: "A2",
          stem: "Où se trouve le colis ?",
          options: ["Devant la porte de Madame Roy", "Chez le gardien de l'immeuble", "Au bureau de poste", "Chez une voisine du premier étage"],
          answer: 1,
          rationale: "Tests locating one factual detail in a short message; the post office is the answer general experience suggests, while the door and the neighbour are plausible alternatives the note excludes.",
        },
        {
          id: "tcf-ce-06",
          recordingId: "tcf-ce-06-r",
          level: "A2",
          stem: "Qu'est-ce qui change pendant les travaux ?",
          options: ["L'arrêt Hôpital Sud n'est plus desservi", "Les billets doivent être achetés à la gare", "Les bus circulent pendant la nuit", "La ligne 12 est supprimée jusqu'en avril"],
          answer: 0,
          rationale: "Tests extraction of the single change announced in a service notice; the other options contradict the stated ticket validity, the stated hours, and the stated dates.",
        },
        {
          id: "tcf-ce-07",
          recordingId: "tcf-ce-07-r",
          level: "A2",
          stem: "Quand peut-on appuyer sur le bouton ?",
          options: ["Dès que l'appareil est branché", "Avant de remplir le réservoir", "Lorsque le voyant vert est allumé", "Après avoir ajouté un produit nettoyant"],
          answer: 2,
          rationale: "Tests the order of steps in a set of instructions; each distractor picks up a real element of the text (plugging in, filling, cleaning product) but places it at the wrong point in the sequence.",
        },
        {
          id: "tcf-ce-08",
          recordingId: "tcf-ce-08-r",
          level: "A2",
          stem: "Que peut faire une personne intéressée par ce logement ?",
          options: ["Téléphoner en semaine", "Emménager dès le mois d'août", "Venir visiter avec son chat", "Visiter le studio un samedi"],
          answer: 3,
          rationale: "Tests reading of the conditions in a small ad; the three wrong options each contradict an explicit restriction on phone calls, availability date, and animals.",
        },
        {
          id: "tcf-ce-09",
          recordingId: "tcf-ce-09-r",
          level: "A2",
          stem: "Comment un patient peut-il obtenir un rendez-vous après le 5 avril ?",
          options: ["En se présentant à l'accueil", "En téléphonant le matin", "En téléphonant l'après-midi", "En passant par les urgences"],
          answer: 1,
          rationale: "Tests a detail restricted by a time window; the afternoon option is a near-miss on the stated hours, the reception desk is explicitly ruled out, and emergencies are mentioned but do not give a rendez-vous.",
        },
        {
          id: "tcf-ce-10",
          recordingId: "tcf-ce-10-r",
          level: "A2",
          stem: "Que reçoivent les employés qui ne viennent pas au bureau ?",
          options: ["Les chiffres du mois", "Une invitation en salle A", "Un lien envoyé le jeudi", "Une formation le vendredi"],
          answer: 2,
          rationale: "Tests a small calculation from the text (the meeting is Friday, so \"la veille\" is Thursday); the other options recycle details that appear in the note but answer a different question.",
        },
        {
          id: "tcf-ce-59",
          recordingId: "tcf-ce-59-r",
          level: "A2",
          stem: "Où faut-il mettre la lessive ?",
          options: [
            "Dans le bac de droite",
            "Dans le bac de gauche",
            "Sur le panneau arrière",
            "Dans le tambour, avec le linge",
          ],
          answer: 1,
          rationale: "Le mode d'emploi indique le bac de gauche ; le tambour reçoit le linge et le panneau arrière ne doit jamais être ouvert.",
        },
        {
          id: "tcf-ce-11",
          recordingId: "tcf-ce-11-r",
          level: "B1",
          stem: "Pourquoi les résidents doivent-ils faire attention à la cave ?",
          options: ["Parce qu'elle sera inondée pendant les travaux", "Parce que le chauffage y sera coupé", "Parce qu'elle servira à stocker la nouvelle chaudière", "Parce qu'elle restera ouverte toute la journée"],
          answer: 3,
          rationale: "Tests the inference linking an open door to the advice about personal belongings; the flooding and storage options invent details, and the heating option reverses what the email says about heating continuing.",
        },
        {
          id: "tcf-ce-12",
          recordingId: "tcf-ce-12-r",
          level: "B1",
          stem: "Quel avantage l'auteur met-il en avant ?",
          options: ["La durée du trajet est prévisible", "Le vélo est toujours plus rapide que la voiture", "Le vélo lui permet de faire des économies", "Le trajet à vélo est plus agréable qu'en voiture"],
          answer: 0,
          rationale: "Tests identification of the writer's main point against three widely believed claims about cycling that the text explicitly rejects or does not support.",
        },
        {
          id: "tcf-ce-13",
          recordingId: "tcf-ce-13-r",
          level: "B1",
          stem: "Pourquoi près de la moitié des demandes n'ont-elles pas abouti ?",
          options: ["Le service est devenu payant", "Aucun habitant n'a accepté de s'occuper du bac", "La ville manquait de bacs disponibles", "Les immeubles concernés n'avaient pas de cour"],
          answer: 1,
          rationale: "Tests the cause–effect link expressed by \"faute de volontaire\"; cost, supply shortages and unsuitable buildings are ordinary explanations for such failures but none is given in the text.",
        },
        {
          id: "tcf-ce-14",
          recordingId: "tcf-ce-14-r",
          level: "B1",
          stem: "Que se passe-t-il si un employé perd son badge pour la première fois ?",
          options: ["Il doit payer quinze euros", "Il peut utiliser son ancienne carte magnétique", "Le remplacement ne lui est pas facturé", "Il ne peut plus accéder aux locaux"],
          answer: 2,
          rationale: "Tests the implication of \"à partir du deuxième badge perdu\"; the fifteen-euro option is the trap of applying the figure too early, and the other two contradict statements in the notice.",
        },
        {
          id: "tcf-ce-15",
          recordingId: "tcf-ce-15-r",
          level: "B1",
          stem: "Quelle information le catalogue papier donnait-il de façon inexacte ?",
          options: ["La date de la session de juin", "Le nombre de places disponibles", "Le nom du module", "Le mode de déroulement de la session"],
          answer: 3,
          rationale: "Tests what \"contrairement à ce qui figurait dans le catalogue\" refers back to; the date, the number of places and the module title all appear in the email but none is presented as an error.",
        },
        {
          id: "tcf-ce-16",
          recordingId: "tcf-ce-16-r",
          level: "B1",
          stem: "Comment l'extension des horaires a-t-elle été rendue possible ?",
          options: ["Par une réorganisation du temps de travail existant", "Par l'embauche de personnel supplémentaire", "Par une subvention obtenue grâce aux étudiants", "Par la fermeture de la bibliothèque le week-end"],
          answer: 0,
          rationale: "Tests the distinction the text draws between the demand for the measure and the argument that made it feasible; hiring is explicitly denied, and the grant and weekend closure are inventions built on real elements of the text.",
        },
        {
          id: "tcf-ce-17",
          recordingId: "tcf-ce-17-r",
          level: "B1",
          stem: "Que demande précisément l'auteur du message ?",
          options: ["Le nom d'une assurance privée fiable", "La liste des documents à fournir pour s'inscrire", "Le témoignage de personnes ayant vécu ce délai", "L'adresse d'un médecin pour les jeunes enfants"],
          answer: 2,
          rationale: "Tests recognition of the actual request rather than of the surrounding topics; private insurance, registration documents and the child are all mentioned but none of them is what the writer asks for.",
        },
        {
          id: "tcf-ce-18",
          recordingId: "tcf-ce-18-r",
          level: "B1",
          stem: "Que peut-on déduire au sujet de la déviation ?",
          // The key ran to eleven words against a longest distractor of seven.
          // A candidate who has learned that the long option is the answer
          // scores here without reading the notice, which is the tell
          // items.check.ts exists to count and the gate now refuses per item.
          options: ["Elle est réservée aux riverains", "Elle coûte plus de sept minutes le matin", "Elle est interdite aux véhicules de livraison", "Elle raccourcit le trajet de sept minutes"],
          answer: 1,
          rationale: "Tests the inference carried by \"davantage le matin\"; the last option reverses the direction of the figure and the other two misapply the separate rules given for residents and deliveries.",
        },
        {
          id: "tcf-ce-19",
          recordingId: "tcf-ce-19-r",
          level: "B1",
          stem: "Qu'est-ce que le responsable du projet n'avait pas prévu ?",
          options: ["L'augmentation des pertes sur les fruits fragiles", "Le refus des clients d'acheter sans emballage", "La hausse du prix des fruits et légumes", "La modification des habitudes d'achat des clients"],
          answer: 3,
          rationale: "Tests identification of what \"ce second effet\" designates; the increase in losses is the first effect, and the customer refusal and price rise are plausible outcomes the text never reports.",
        },
        {
          id: "tcf-ce-40",
          recordingId: "tcf-ce-40-r",
          level: "B1",
          stem: "Vous habitez au 2e étage et vous serez absent lundi. Que devez-vous faire ?",
          options: ["Vider votre chauffe-eau avant de partir", "Prévenir vous-même les voisins du 3e et du 4e étage", "Laisser vos clés à la buanderie", "Attendre le concierge mardi matin"],
          answer: 0,
          rationale: "Tests reading a conditional instruction addressed to some readers and not others, then applying it to one's own case. Every distractor is an action the notice mentions or implies for somebody, but only one is required of a second-floor tenant who will not be there.",
        },
        {
          id: "tcf-ce-41",
          recordingId: "tcf-ce-41-r",
          level: "B1",
          stem: "Votre ordonnance a quinze mois. Vous la déposez un jeudi. Quand pouvez-vous espérer votre médicament ?",
          options: ["Le samedi", "Le mardi suivant", "Le jour même", "Le vendredi de la semaine en cours"],
          answer: 1,
          rationale: "Tests holding two rules at once — the one-year threshold and the three-working-day delay — and applying working days across a weekend. The first option applies the ordinary 24-hour rule, the second counts calendar days.",
        },
        {
          id: "tcf-ce-42",
          recordingId: "tcf-ce-42-r",
          level: "B1",
          stem: "Vous n'habitez pas le quartier. Que devez-vous faire ?",
          options: ["Payer d'abord, puis fournir la preuve dans les 48 heures", "Vous inscrire dès le 1er septembre sans preuve de résidence", "Attendre le 8 septembre et fournir une preuve de résidence", "Vous inscrire le 8 septembre sans preuve de résidence"],
          answer: 2,
          rationale: "Tests noticing that the residence proof is required 'dans les deux cas' — a clause that survives the exception about dates. Two distractors drop the proof because the reader assumes it belongs only to the residents' route.",
        },
        {
          id: "tcf-ce-43",
          recordingId: "tcf-ce-43-r",
          level: "B1",
          stem: "Vous avez emprunté un roman avec une pastille rouge il y a trois semaines. Personne ne l'a réservé. Que pouvez-vous faire ?",
          options: ["Le garder trois semaines de plus automatiquement", "Le renouveler par téléphone", "Le renouveler sur le site", "Le rapporter, il n'est pas renouvelable"],
          answer: 3,
          rationale: "Tests a rule that overrides the general condition the reader has just verified. Checking that nobody reserved it is the trap: the check is real and it is irrelevant for a nouveauté.",
        },
        {
          id: "tcf-ce-48",
          recordingId: "tcf-ce-48-r",
          level: "B1",
          stem: "Que cherche à obtenir Samira Belkacem ?",
          options: ["Une réduction du loyer", "Un délai supplémentaire pour répondre", "Les coordonnées de l'école du quartier", "Une deuxième visite de l'appartement"],
          answer: 0,
          rationale: "Tests reading an intention that arrives only in the fourth paragraph and is softened by 'si jamais' and 'ne serait-ce que'. The mention of a Wednesday deadline is the strongest distractor because it is the only explicit constraint in the letter, and it is there to create pressure rather than to request time.",
        },
        {
          id: "tcf-ce-49",
          recordingId: "tcf-ce-49-r",
          level: "B1",
          stem: "Pourquoi Daniel écrit-il ce message ?",
          options: ["Pour reprocher à l'équipe le silence qu'elle a gardé pendant toute la réunion", "Pour recueillir des avis que la réunion n'a pas permis d'exprimer", "Pour fixer une nouvelle réunion avant vendredi", "Pour annoncer les nouveaux horaires d'été"],
          answer: 1,
          rationale: "Tests separating the writer's self-criticism from a criticism of the readers. 'Je le comprends' and 'j'ai moi-même conclu un peu vite' place the fault with the writer, and a candidate reading the second paragraph as a reproach chooses the second option.",
        },
        {
          id: "tcf-ce-54",
          recordingId: "tcf-ce-54-r",
          level: "B1",
          stem: "Quelle est la position de l'auteur ?",
          options: ["Ceux qui ne parlent pas français n'ont pas fait assez d'efforts", "Les cours du soir sont plus efficaces que le travail de jour", "L'apprentissage dépend surtout des occasions de parler, non de la seule volonté", "Le travail de nuit devrait être interdit aux personnes nouvellement arrivées au pays"],
          answer: 2,
          rationale: "Tests separating what the author asserts from what the author reports in order to reject it. The first option is quoted in the text as the view being argued against, and 'je suis d'accord' in the opening sentence attaches to a different claim.",
        },
        {
          id: "tcf-ce-55",
          recordingId: "tcf-ce-55-r",
          level: "B1",
          stem: "Que défend l'auteur ?",
          options: ["Le maintien du réseau tel qu'il est aujourd'hui, sans dépense supplémentaire", "La gratuité des transports en commun", "L'augmentation du prix du billet", "L'investissement dans la fréquence plutôt que dans la gratuité"],
          answer: 3,
          rationale: "Tests a text that grants both reported positions before setting them aside. The second option misreads the neighbours' example, where five dollars is a hypothetical acceptance and not a proposal.",
        },
        {
          id: "tcf-ce-20",
          recordingId: "tcf-ce-20-r",
          level: "B2",
          stem: "Selon le texte, que révèle principalement cette enquête ?",
          options: ["Un décalage entre le jugement porté sur soi et celui porté sur les autres", "Que les salariés sont réellement plus productifs à domicile", "Que les entreprises disposent de chiffres précis sur la performance", "Que la majorité des salariés souhaitent revenir au bureau"],
          answer: 0,
          rationale: "Tests the reader's grasp of what the authors say the figures actually measure; the second option takes the self-reports at face value against the text's warning, and the last two contradict statements about the absence of performance figures and about employers rather than employees.",
        },
        {
          id: "tcf-ce-21",
          recordingId: "tcf-ce-21-r",
          level: "B2",
          stem: "Quelle raison la note donne-t-elle au raccourcissement du délai ?",
          options: ["Une baisse du budget consacré aux frais professionnels", "Une suspicion de fraude constatée lors de l'audit", "La lenteur de traitement provoquée par les envois tardifs", "Une demande formulée par les responsables d'équipe"],
          answer: 2,
          rationale: "Tests reading of a stated justification against the sentence that explicitly denies mistrust; budget cuts and managers' requests are plausible motives in such memos but appear nowhere in the text.",
        },
        {
          id: "tcf-ce-22",
          recordingId: "tcf-ce-22-r",
          level: "B2",
          stem: "Quel reproche l'auteur adresse-t-il aux deux camps du débat ?",
          options: ["Ils exagèrent le nombre d'écrans présents dans les classes", "Ils négligent le rôle joué par l'enseignant", "Ils refusent de financer l'achat de matériel", "Ils s'appuient sur des travaux de recherche trop rares"],
          answer: 1,
          rationale: "Tests identification of the common blind spot the writer names; the counting problem belongs to the surveys rather than to the two camps, and the funding and research options distort details from the text.",
        },
        {
          id: "tcf-ce-23",
          recordingId: "tcf-ce-23-r",
          level: "B2",
          stem: "D'après le texte, pourquoi la construction neuve ne règle-t-elle pas le problème ?",
          options: ["Les municipalités n'ont pas le droit de délivrer des permis", "Les habitants s'opposent systématiquement aux nouveaux projets", "Le coût des matériaux a fortement augmenté", "Elle demande des années et les terrains sont mal situés"],
          answer: 3,
          rationale: "Tests retrieval of the two obstacles the text actually names; permit powers, local opposition and material costs are familiar real-world explanations that the passage does not mention.",
        },
        {
          id: "tcf-ce-24",
          recordingId: "tcf-ce-24-r",
          level: "B2",
          stem: "Pourquoi la note globale a-t-elle été supprimée ?",
          options: ["Parce que les salariés la contestaient collectivement", "Parce qu'elle retardait la décision sur les augmentations", "Parce qu'elle ne distinguait presque personne", "Parce que les responsables refusaient de la remplir"],
          answer: 2,
          rationale: "Tests interpretation of the eighty-per-cent figure as the reason given; the timing of pay rises is mentioned but explicitly left unchanged, and employee protest and manager refusal are never stated.",
        },
        {
          id: "tcf-ce-25",
          recordingId: "tcf-ce-25-r",
          level: "B2",
          stem: "Quelle critique principale l'auteur formule-t-il contre les classements ?",
          options: ["Ils orientent les établissements vers ce qui est mesurable", "Ils reposent sur des données volontairement falsifiées", "Ils défavorisent les universités qui accueillent des étrangers", "Ils paraissent à une période défavorable de l'année"],
          answer: 0,
          rationale: "Tests the difference between \"false\" and \"selective\", which the text draws explicitly; the timing option misreads the remark about universities protesting at the wrong moment, and the foreign-student option inverts a criterion listed as easy to count.",
        },
        {
          id: "tcf-ce-26",
          recordingId: "tcf-ce-26-r",
          level: "B2",
          stem: "Quelle est la principale objection rapportée par le texte ?",
          options: ["La mesure coûtera bien plus que les deux millions annoncés", "La gratuité ne devrait pas être réservée aux jeunes", "Les contrôles deviendront impossibles sur l'ensemble du réseau", "Le réseau risque de ne pas absorber les nouveaux voyageurs"],
          answer: 3,
          rationale: "Tests separation of the objection from the surrounding financial explanation; the cost, the age limit and ticket inspection all appear in the text but none is presented as the critics' argument.",
        },
        {
          id: "tcf-ce-27",
          recordingId: "tcf-ce-27-r",
          level: "B2",
          stem: "Que peut faire un client qui n'a plus son ticket de caisse ?",
          options: ["Faire réparer l'appareil en magasin", "Obtenir tout de même le remboursement", "Échanger l'appareil contre un modèle équivalent", "Continuer à l'utiliser avec précaution"],
          answer: 1,
          rationale: "Tests a concessive clause stating that the missing receipt is not an obstacle; repair, exchange and continued use are each ruled out elsewhere in the notice even though they are normal expectations for a faulty product.",
        },
        {
          id: "tcf-ce-28",
          recordingId: "tcf-ce-28-r",
          level: "B2",
          stem: "Quelle est la fonction de la dernière phrase du texte ?",
          options: ["Reconnaître que les fosses coûtent trop cher aux communes", "Rappeler que les arbres urbains ne survivent jamais longtemps", "Opposer l'effet d'annonce immédiat au bénéfice à long terme", "Inviter les habitants à planter des arbres eux-mêmes"],
          answer: 2,
          rationale: "Tests the rhetorical role of a closing antithesis rather than its literal content; the cost and the invitation are absent from the text, and the survival option overstates a figure that applies only to street trees.",
        },
        {
          id: "tcf-ce-29",
          recordingId: "tcf-ce-29-r",
          level: "B2",
          stem: "Selon les journalistes, quelle est la cause principale de l'arrêt de l'édition imprimée ?",
          options: ["La perte des revenus des petites annonces", "La réduction de moitié de la rédaction", "La baisse de la participation électorale", "Le désintérêt des lecteurs pour l'information locale"],
          answer: 0,
          rationale: "Tests attribution of a cause to the right voice in the text: the fall in readership is management's explanation, the smaller newsroom is a consequence, and lower turnout belongs to the research findings.",
        },
        {
          id: "tcf-ce-44",
          recordingId: "tcf-ce-44-r",
          level: "B2",
          stem: "Vous contestez, quarante jours après la facturation, un montant que vous jugez trop élevé pour un service correctement rendu. Quelle est votre situation ?",
          options: ["La réclamation n'est pas recevable, car il ne s'agit pas d'une erreur de calcul", "La réclamation est recevable mais les intérêts courent sur la somme contestée", "La réclamation est recevable si le service a été reçu il y a moins de trente jours", "La réclamation est recevable et suspend tout paiement"],
          answer: 0,
          rationale: "Tests the distinction between a disputed amount and a calculation error, which is what survives the deadline. The fourth option offers the reception date the first sentence explicitly excludes.",
        },
        {
          id: "tcf-ce-45",
          recordingId: "tcf-ce-45-r",
          level: "B2",
          stem: "Une opération de déneigement est annoncée par un panneau posé la veille au soir. Vous avez une vignette. Que se passe-t-il si vous ne déplacez pas votre voiture ?",
          options: ["Vous êtes remorqué, mais sans frais puisque le panneau a moins de douze heures", "Vous êtes remorqué et vous payez la fourrière", "Vous recevez un avertissement avant tout remorquage", "Rien, la vignette vous protège dans votre secteur"],
          answer: 1,
          rationale: "Tests reading a clause that anticipates the reader's own objection — the twelve-hour notice is named precisely in order to be excluded as a defence, and a candidate scanning for it finds it and draws the opposite conclusion.",
        },
        {
          id: "tcf-ce-46",
          recordingId: "tcf-ce-46-r",
          level: "B2",
          stem: "Vous annulez cinq jours avant le départ avec un certificat médical. Que récupérez-vous ?",
          options: ["Rien", "La moitié du montant", "Le montant total, frais de dossier inclus", "Le montant total, mais hors frais de dossier non remboursables"],
          answer: 2,
          rationale: "Tests a re-application clause with one modification. The final three words reverse the exclusion stated in the first sentence, and a reader who has correctly retained 'hors frais de dossier' from the opening chooses the fourth option for exactly that reason.",
        },
        {
          id: "tcf-ce-47",
          recordingId: "tcf-ce-47-r",
          level: "B2",
          stem: "Vous demandez par écrit une copie d'un dossier vieux de sept ans. Cinquante jours passent sans réponse. Que pouvez-vous faire ?",
          options: ["Exiger une consultation gratuite sur place à la place", "Demander que le refus vous soit motivé par écrit", "Exercer un recours, l'absence de réponse valant refus", "Attendre, le délai applicable n'est pas écoulé"],
          answer: 3,
          rationale: "Tests applying the extended deadline before the silence rule. The first option is correct reasoning applied to the wrong deadline, which is the likelier error than not knowing the silence rule at all.",
        },
        {
          id: "tcf-ce-50",
          recordingId: "tcf-ce-50-r",
          level: "B2",
          stem: "Quel est l'objet principal de cette lettre ?",
          options: ["Demander une prolongation du délai de six mois", "Transmettre à nouveau le relevé de notes manquant", "Contester le constat d'incomplétude et rappeler le point de départ du délai", "Se plaindre du fonctionnement du service courrier et demander une enquête interne"],
          answer: 2,
          rationale: "Tests reading intention through professional politeness. 'Je ne doute pas qu'il s'agisse d'un simple décalage' is a concession made in order to make the following sentence acceptable; the letter's work is done by 'Or' and by 'je me permets toutefois'. Nothing is re-sent — only a receipt is attached.",
        },
        {
          id: "tcf-ce-51",
          recordingId: "tcf-ce-51-r",
          level: "B2",
          stem: "Que fait Fatou dans cette lettre ?",
          options: ["Elle reproche à Nadia de ne penser qu'à l'argent", "Elle conseille à Nadia d'accepter le poste", "Elle refuse de donner son avis pour ne pas peser sur une décision qui n'appartient qu'à Nadia", "Elle attire l'attention de Nadia sur ce que sa lettre ne dit pas"],
          answer: 3,
          rationale: "Tests a letter whose argument is made by an absence. The second option is close but wrong: Fatou does not refuse to answer, she answers by redirecting. The fourth reads the list of practical advantages as an accusation the text never makes.",
        },
        {
          id: "tcf-ce-52",
          recordingId: "tcf-ce-52-r",
          level: "B2",
          stem: "Quelle est la portée de ce message pour Karim ?",
          options: ["Il reconnaît une cause qui n'incombe pas à Karim tout en lui demandant une action précise", "Il annonce que le point ne figurera pas au compte rendu", "Il constate un problème de performance technique", "Il transfère à Karim la responsabilité d'un problème dont il a pourtant reconnu la cause ailleurs"],
          answer: 0,
          rationale: "Tests holding two movements at once: the manager accepts the cause as her own and still asks for something. Options one and two each take half the letter; the fourth inverts 'il figure comme tel'.",
        },
        {
          id: "tcf-ce-53",
          recordingId: "tcf-ce-53-r",
          level: "B2",
          stem: "Que demande l'auteur ?",
          options: ["Une explication détaillée sur les raisons de l'échec de l'intervention de ce matin", "Un rendez-vous un samedi pour la prochaine intervention", "Le remplacement immédiat du compteur", "Un dédommagement pour la demi-journée perdue"],
          answer: 1,
          rationale: "Tests a request stated after two explicit renunciations. The letter names the compensation and the explanation only in order to set them aside, and a candidate who reads for grievance finds both.",
        },
        {
          id: "tcf-ce-56",
          recordingId: "tcf-ce-56-r",
          level: "B2",
          stem: "Quel reproche l'auteur adresse-t-il à l'argument de la cohésion ?",
          options: ["Il est valable pour une catégorie d'employés mais est généralisé à toutes", "Il ignore le coût des transports pour les salariés", "Il sert les intérêts des employeurs bien plus que ceux des équipes qu'il prétend décrire", "Il repose sur des données invérifiables"],
          answer: 0,
          rationale: "Tests locating a criticism of an argument's SCOPE rather than of its truth. The author writes 'sur ce point l'objection porte' — the objection is accepted — and the third option names a real element of the text that supports the conclusion rather than constituting the criticism.",
        },
        {
          id: "tcf-ce-57",
          recordingId: "tcf-ce-57-r",
          level: "B2",
          stem: "Que conclut l'auteur sur la cause de la lenteur ?",
          options: ["Elle résulte de la complexité réelle des vérifications", "Elle résulte d'une inertie que personne n'a voulue mais que personne n'a intérêt à corriger", "Elle résulte du nombre insuffisant d'évaluateurs qualifiés", "Elle résulte d'un protectionnisme délibéré des ordres professionnels soucieux de limiter la concurrence"],
          answer: 1,
          rationale: "Tests a conclusion that explicitly refuses both reported positions — 'je n'accuse donc personne' rules out the first, and the twelve idle months rule out the second. The fourth is a plausible explanation the text never offers, which is why it is there.",
        },
        {
          id: "tcf-ce-30",
          recordingId: "tcf-ce-30-r",
          level: "C1",
          stem: "Quelle position l'auteur adopte-t-il à l'égard des interprétations politiques évoquées à la fin du texte ?",
          options: ["Il donne raison à ceux qui annoncent le déclin de la ville dense", "Il estime que la question est tranchée par les données immobilières", "Il juge que ces lectures reposent sur des chiffres inventés", "Il leur reproche de figer une situation encore en mouvement"],
          answer: 3,
          rationale: "Tests the writer's stance in the concluding paragraph, where he faults both camps for the same reason; the first two options pick a side he refuses to pick, and the third replaces his objection about timing with an accusation of falsification he never makes.",
        },
        {
          id: "tcf-ce-31",
          recordingId: "tcf-ce-31-r",
          level: "C1",
          stem: "Que reproche l'auteur aux deux camps ?",
          options: ["De s'appuyer sur des chiffres contradictoires", "De ne pas examiner les conséquences réelles d'une interdiction", "De défendre les intérêts des propriétaires les plus aisés", "De confondre logement touristique et logement étudiant"],
          answer: 1,
          rationale: "Tests location of the shared blind spot named in the final paragraph; the text states that both camps accept the same figures, and the student rentals appear as a consequence of the ban rather than as a confusion made by either side.",
        },
        {
          id: "tcf-ce-32",
          recordingId: "tcf-ce-32-r",
          level: "C1",
          stem: "Quelle est l'attitude de l'auteur envers l'élévation des diplômes exigés ?",
          options: ["Il l'approuve, à condition que les études soient mieux financées", "Il la juge inévitable compte tenu de la complexité croissante des métiers", "Il y voit un mécanisme de tri dont l'effet d'ensemble est nuisible", "Il la considère comme un phénomène déjà corrigé par la pénurie de candidats"],
          answer: 2,
          rationale: "Tests the writer's evaluative stance across a concessive argument; the second option repeats a claim he explicitly denies, and the fourth turns his remark about a few sectors into a general correction he does not assert.",
        },
        {
          id: "tcf-ce-33",
          recordingId: "tcf-ce-33-r",
          level: "C1",
          stem: "Quel est l'argument central de l'auteur ?",
          options: ["L'indicateur est mal employé plutôt que mal construit", "La définition du chômage est volontairement trompeuse", "Les instituts refusent de publier des données complémentaires", "Les comparaisons entre pays devraient être abandonnées"],
          answer: 0,
          rationale: "Tests the distinction between the definition and its use, stated in the middle of the text; the other options each contradict an explicit sentence about manipulation, about published complementary measures, and about the value of stable comparisons.",
        },
        {
          id: "tcf-ce-34",
          recordingId: "tcf-ce-34-r",
          level: "C1",
          stem: "Sur quoi les deux visions divergent-elles réellement, selon l'auteur ?",
          options: ["Sur l'utilité de réduire la vitesse des voitures", "Sur la fiabilité des comptages de cyclistes", "Sur le nombre d'accidents survenant aux intersections", "Sur l'échelle à laquelle on évalue une politique"],
          answer: 3,
          rationale: "Tests the reader's ability to find the point of disagreement the writer isolates rather than the topics that merely appear in each camp's case; speed, counts and intersections are all raised, but only the question of scale is named as the real divergence.",
        },
        {
          id: "tcf-ce-35",
          recordingId: "tcf-ce-35-r",
          level: "C1",
          stem: "Quelle est la thèse défendue par l'auteur ?",
          options: ["Les journalistes en ligne manquent de rigueur professionnelle", "Le comportement des rédactions découle du dispositif de mesure et du mode de financement", "Les mesures d'audience en temps réel devraient être interdites", "Les lecteurs sont responsables de la baisse de qualité de l'information"],
          answer: 1,
          rationale: "Tests the structural explanation the writer substitutes for a moral one; the first option is the very reading he rejects, and the ban and the blaming of readers are conclusions the text never draws.",
        },
        {
          id: "tcf-ce-60",
          recordingId: "tcf-ce-60-r",
          level: "C1",
          stem: "Pourquoi la demande a-t-elle d'abord été refusée ?",
          options: [
            "Parce que l'agent en a décidé ainsi",
            "Parce que les motifs étaient insuffisants",
            "Parce que le dossier était trop ancien",
            "Parce qu'elle est arrivée après l'échéance",
          ],
          answer: 3,
          rationale: "La lettre distingue explicitement une décision d'une application de règle : le dépôt tardif de deux jours fait basculer la demande dans l'examen individuel.",
        },
        {
          id: "tcf-ce-36",
          recordingId: "tcf-ce-36-r",
          level: "C2",
          stem: "Quelle est la fonction du dernier paragraphe ?",
          options: ["Nuancer la critique en reconnaissant l'efficacité réelle des séminaires", "Proposer une méthode pour réformer enfin les procédures", "Feindre une concession pour reformuler la critique de façon plus incisive", "Marquer un changement d'avis de l'auteur sur l'innovation publique"],
          answer: 2,
          rationale: "Tests recognition of an ironic false concession whose closing sentence renames the practice; a literal reader takes it as a genuine qualification or a change of mind, and no method of reform is ever proposed.",
        },
        {
          id: "tcf-ce-37",
          recordingId: "tcf-ce-37-r",
          level: "C2",
          stem: "Quelle distinction l'auteur tient-il pour décisive ?",
          options: ["Entre un choix assumé et un choix présenté comme une restitution fidèle", "Entre les bâtiments anciens et les ajouts du vingtième siècle", "Entre la restauration des façades et celle des intérieurs", "Entre la mémoire des habitants et celle des spécialistes"],
          answer: 0,
          rationale: "Tests the argumentative pivot introduced by \"Mais il y a une différence entre\"; the layers of the twentieth century serve as an illustration rather than as the distinction itself, and the other two contrasts are never drawn in the text.",
        },
        {
          id: "tcf-ce-38",
          recordingId: "tcf-ce-38-r",
          level: "C2",
          stem: "Que suggère la dernière phrase du texte ?",
          options: ["Que les ateliers devraient être rendus obligatoires", "Que les salariés ne prennent pas leurs pauses de façon responsable", "Que l'entreprise a réalisé des économies grâce à ce programme", "Que le bénéfice observé vient du temps libéré et non de la méthode enseignée"],
          answer: 3,
          rationale: "Tests an ironic conclusion whose force depends on the preceding sentence about forty minutes without e-mails; the cost comparison in the final clause tempts a reader toward the savings option, which reverses the point being made.",
        },
        {
          id: "tcf-ce-39",
          recordingId: "tcf-ce-39-r",
          level: "C2",
          stem: "Selon l'auteur, pourquoi la répétition des erreurs de prévision ne discrédite-t-elle pas les instituts ?",
          options: ["Parce que les médias ne vérifient jamais les prévisions passées", "Parce que le chiffre sert avant tout à justifier des décisions déjà à prendre", "Parce que les intervalles de confiance rendent toute erreur discutable", "Parce que les instituts corrigent leurs hypothèses à chaque trimestre"],
          answer: 1,
          rationale: "Tests the implicit argument that the forecast's function is legitimation rather than prediction; the media, the confidence intervals and the quarterly hypotheses all appear in the text but as elements of that argument, not as the reason asked for.",
        },
        {
          id: "tcf-ce-61",
          recordingId: "tcf-ce-61-r",
          level: "C2",
          stem: "Quand une demande est-elle considérée comme déposée ?",
          options: [
            "Deux mois après son envoi",
            "À sa réception par le service",
            "À la date de son envoi",
            "À la date du cachet de la poste",
          ],
          answer: 1,
          rationale: "L'article 7 écarte la date d'envoi et ne retient le cachet que dans les cas expressément prévus, dont ne font partie ni les reports ni les recours.",
        },
        {
          id: "tcf-ce-62-q1",
          recordingId: "tcf-ce-62-r",
          level: "A1",
          stem: "Que fera Camille samedi ?",
          rationale: "Le message annonce une visite samedi à quinze heures et précise ce qu'elle apporte, sans mentionner aucune autre activité.",
          options: ["Elle rendra visite à Marc","Elle restera chez elle","Elle partira en voyage","Elle travaillera au bureau"],
          answer: 0,
        },
        {
          id: "tcf-ce-63-q1",
          recordingId: "tcf-ce-63-r",
          level: "A1",
          stem: "Que doit faire le client ?",
          rationale: "Le message annonce que la commande est prête et indique un retrait en magasin avant vendredi, sans autre démarche.",
          options: ["Choisir une autre couleur","Venir chercher sa commande","Payer une deuxième fois","Renvoyer un article reçu"],
          answer: 1,
        },
        {
          id: "tcf-ce-64-q1",
          recordingId: "tcf-ce-64-r",
          level: "A1",
          stem: "Que demande Léa ?",
          rationale: "Le mot contient une seule demande, arroser les plantes pendant l'absence, et ne parle ni d'animal ni de courrier.",
          options: ["De relever son courrier","De fermer ses fenêtres","De s'occuper de ses plantes","De garder son chat"],
          answer: 2,
        },
        {
          id: "tcf-ce-65-q1",
          recordingId: "tcf-ce-65-r",
          level: "A1",
          stem: "Qu'y a-t-il dans le parc ?",
          rationale: "Le texte cite deux équipements, un terrain de jeux et un café, et aucune des autres installations proposées.",
          options: ["Une piscine chauffée","Un terrain de football","Une salle de sport","Un terrain de jeux"],
          answer: 3,
        },
        {
          id: "tcf-ce-66-q1",
          recordingId: "tcf-ce-66-r",
          level: "A1",
          stem: "Combien coûte le prêt ?",
          rationale: "Le texte précise que le prêt est gratuit, mais réserve cette gratuité aux habitants de la ville.",
          options: ["Rien pour les habitants","Cinq dollars par jour","Le prix d'un abonnement","Rien pour tout le monde"],
          answer: 0,
        },
        {
          id: "tcf-ce-67-q1",
          recordingId: "tcf-ce-67-r",
          level: "A1",
          stem: "Où se tient le marché ?",
          rationale: "Le texte donne un seul lieu, devant la mairie, et un seul jour, le samedi, sans autre repère.",
          options: ["Sur le pont","Devant la mairie","Dans le parc","Près de la gare"],
          answer: 1,
        },
        {
          id: "tcf-ce-68-q1",
          recordingId: "tcf-ce-68-r",
          level: "A1",
          stem: "Quand les cours reprennent-ils ?",
          rationale: "Le texte annonce une fermeture le lundi et une reprise le mardi matin, sans autre date.",
          options: ["Mercredi matin","Dans une semaine","Mardi matin","Lundi soir"],
          answer: 2,
        },
        {
          id: "tcf-ce-69-q1",
          recordingId: "tcf-ce-69-r",
          level: "A1",
          stem: "Pourquoi l'auteur préfère-t-il le vélo ?",
          rationale: "L'auteur donne deux raisons et seulement deux : la rapidité et l'absence de coût.",
          options: ["Il est plus confortable","Il est plus sûr la nuit","Il est plus facile à garer","Il est rapide et gratuit"],
          answer: 3,
        },
        {
          id: "tcf-ce-70-q1",
          recordingId: "tcf-ce-70-r",
          level: "A1",
          stem: "Quel est l'avis de l'auteur ?",
          rationale: "L'auteur défend la gratuité du musée et la justifie par les familles qui ne peuvent pas payer.",
          options: ["Le musée doit rester gratuit","Le musée doit fermer","Le prix doit augmenter","Le musée doit déménager"],
          answer: 0,
        },
        {
          id: "tcf-ce-71-q1",
          recordingId: "tcf-ce-71-r",
          level: "A1",
          stem: "Que demande l'auteur ?",
          rationale: "L'auteur réclame davantage d'arbres et donne comme raison la chaleur de l'été dans cette rue.",
          options: ["Installer des bancs","Planter plus d'arbres","Ouvrir une piscine","Fermer la rue aux voitures"],
          answer: 1,
        },
        {
          id: "tcf-ce-72-q1",
          recordingId: "tcf-ce-72-r",
          level: "A1",
          stem: "Quel problème l'auteur signale-t-il ?",
          rationale: "L'auteur reproche une fermeture trop précoce et l'explique par les horaires de travail des usagers.",
          options: ["La salle est trop petite","Les machines sont vieilles","Les horaires sont trop courts","Le prix est trop élevé"],
          answer: 2,
        },
        {
          id: "tcf-ce-73-q1",
          recordingId: "tcf-ce-73-r",
          level: "A2",
          stem: "Que faut-il apporter au guichet ?",
          rationale: "La consigne nomme un seul document à présenter, la carte, et donne ensuite les horaires du guichet.",
          options: ["Une pièce d'identité","Le bon de commande","Une preuve de paiement","La carte reçue"],
          answer: 3,
        },
        {
          id: "tcf-ce-74-q1",
          recordingId: "tcf-ce-74-r",
          level: "A2",
          stem: "Où doivent aller les sacs ?",
          rationale: "La consigne indique un seul endroit pour les sacs, les casiers, et précise qu'ils sont gratuits et fermant à clé.",
          options: ["Dans les casiers","À l'accueil","Dans la salle voisine","Sous les tables"],
          answer: 0,
        },
        {
          id: "tcf-ce-75-q1",
          recordingId: "tcf-ce-75-r",
          level: "A2",
          stem: "Où faut-il signer ?",
          rationale: "La consigne situe la signature précisément, en bas de la seconde page, avant le dépôt du formulaire.",
          options: ["Dans la boîte à l'entrée","Au bas de la deuxième page","En haut de la première page","Sur les deux pages"],
          answer: 1,
        },
        {
          id: "tcf-ce-76-q1",
          recordingId: "tcf-ce-76-r",
          level: "A2",
          stem: "Que doit faire Madame Roy si l'heure ne convient pas ?",
          rationale: "Le message pose une seule démarche en cas d'empêchement : écrire avant le mercredi soir.",
          options: ["Se présenter quand même","Attendre une autre proposition","Répondre avant mercredi soir","Téléphoner jeudi matin"],
          answer: 2,
        },
        {
          id: "tcf-ce-77-q1",
          recordingId: "tcf-ce-77-r",
          level: "A2",
          stem: "Que deviennent les billets déjà payés ?",
          rationale: "Le message annonce le report et précise que les billets déjà payés gardent leur validité.",
          options: ["Ils sont remboursés","Ils doivent être rachetés","Ils changent de titulaire","Ils restent valables"],
          answer: 3,
        },
        {
          id: "tcf-ce-78-q1",
          recordingId: "tcf-ce-78-r",
          level: "A2",
          stem: "Que doit faire le demandeur maintenant ?",
          rationale: "Le message annonce un appel dans les quinze jours et dit explicitement qu'aucune autre démarche n'est nécessaire.",
          options: ["Rien de plus pour le moment","Envoyer d'autres documents","Rappeler le service chaque semaine","Se rendre au bureau"],
          answer: 0,
        },
        {
          id: "tcf-ce-79-q1",
          recordingId: "tcf-ce-79-r",
          level: "A2",
          stem: "Quel est l'argument principal ?",
          rationale: "L'auteur défend la fermeture dominicale au nom d'un repos commun pour les employés et les familles.",
          options: ["La sécurité du personnel","Un repos hebdomadaire partagé","Le coût trop élevé du travail dominical","La faible fréquentation du dimanche"],
          answer: 1,
        },
        {
          id: "tcf-ce-80-q1",
          recordingId: "tcf-ce-80-r",
          level: "A2",
          stem: "Pourquoi l'auteur s'oppose-t-il à la fermeture ?",
          rationale: "L'auteur fonde son refus sur les quarante minutes de bus quotidiennes qu'il juge excessives pour des enfants.",
          options: ["Les enseignants partiraient","Le village perdrait des habitants","Le trajet deviendrait trop long","Les classes seraient trop grandes"],
          answer: 2,
        },
        {
          id: "tcf-ce-81-q1",
          recordingId: "tcf-ce-81-r",
          level: "A2",
          stem: "Pourquoi la piscine est-elle importante selon l'auteur ?",
          rationale: "L'auteur avance que les enfants y apprennent à nager et que la ville ne dispose d'aucun autre équipement couvert.",
          options: ["Elle attire des visiteurs","Elle coûte peu à chauffer","Elle emploie du personnel","C'est le seul équipement couvert"],
          answer: 3,
        },
        {
          id: "tcf-ce-82-q1",
          recordingId: "tcf-ce-82-r",
          level: "A2",
          stem: "Que propose l'auteur ?",
          rationale: "L'auteur propose un enseignement scolaire du tri et le justifie par les erreurs des adultes et la capacité d'apprentissage des enfants.",
          options: ["Enseigner le tri à l'école","Augmenter le prix des sacs","Installer plus de bacs","Contrôler les poubelles"],
          answer: 0,
        },

        {
          id: "tcf-ce-83-q1",
          recordingId: "tcf-ce-83-r",
          level: "C1",
          stem: "Que se passe-t-il si le dossier est incomplet ?",
          rationale: "Le texte écarte explicitement le rejet et décrit une suspension avec un délai de quinze jours pour compléter, sous peine de classement.",
          options: ["Il est suspendu pendant quinze jours","Il est rejeté immédiatement","Il est examiné en l'état","Il part à une autre autorité"],
          answer: 0,
        },
        {
          id: "tcf-ce-84-q1",
          recordingId: "tcf-ce-84-r",
          level: "C1",
          stem: "Que fait un correcteur qui découvre son erreur après la clôture ?",
          rationale: "Le texte interdit toute modification après la clôture et n'ouvre qu'une voie : saisir le responsable de session, seul habilité, en motivant par écrit.",
          options: ["Il annule sa participation à la session","Il saisit le responsable de session","Il corrige lui-même sa note","Il demande une nouvelle lecture au deuxième correcteur"],
          answer: 1,
        },
        {
          id: "tcf-ce-85-q1",
          recordingId: "tcf-ce-85-r",
          level: "C1",
          stem: "Quand une salle réservée devient-elle disponible pour d'autres ?",
          rationale: "Le texte fixe un seuil précis : passé vingt minutes après l'heure prévue, la salle inoccupée est réputée libérée et utilisable par les personnes présentes.",
          options: ["Après deux avertissements écrits","Seulement si le service l'autorise","Après vingt minutes d'inoccupation","Dès l'heure de début du créneau"],
          answer: 2,
        },
        {
          id: "tcf-ce-86-q1",
          recordingId: "tcf-ce-86-r",
          level: "C1",
          stem: "Que faut-il pour publier un extrait d'un document consulté ?",
          rationale: "Le texte distingue l'usage personnel de la publication et précise que celle-ci exige une autorisation distincte, demandée seulement après la consultation.",
          options: ["La même autorisation que pour consulter","Aucune démarche si l'extrait est court","L'accord du service de numérisation","Une autorisation demandée après la consultation"],
          answer: 3,
        },
        {
          id: "tcf-ce-87-q1",
          recordingId: "tcf-ce-87-r",
          level: "C1",
          stem: "Comment le remboursement sera-t-il effectué ?",
          rationale: "La lettre écarte le versement sur le compte et indique un crédit sur la prochaine facture, présenté comme le seul mode prévu.",
          options: ["En crédit sur la facture suivante","Par virement sur le compte bancaire","Par chèque envoyé au domicile","Par prolongation gratuite de l'abonnement"],
          answer: 0,
        },
        {
          id: "tcf-ce-88-q1",
          recordingId: "tcf-ce-88-r",
          level: "C1",
          stem: "Pourquoi l'auteur demande-t-il des précisions écrites ?",
          rationale: "La lettre indique expressément que la demande ne vise pas à écarter la candidature mais à fonder la discussion sur des éléments établis.",
          options: ["Pour comparer les candidats entre eux","Pour fonder l'entretien sur des faits","Pour justifier un refus déjà décidé","Pour reporter la procédure de recrutement"],
          answer: 1,
        },
        {
          id: "tcf-ce-89-q1",
          recordingId: "tcf-ce-89-r",
          level: "C1",
          stem: "Que demande l'auteure ?",
          rationale: "Elle dit ne pas vouloir renverser la décision mais demande qu'elle sépare ce qui peut commencer de ce qui ne le peut pas encore.",
          options: ["Que la réunion soit organisée de nouveau","Que le matériel soit commandé plus tôt","Que la décision distingue les services selon leurs moyens","Que le protocole soit abandonné"],
          answer: 2,
        },
        {
          id: "tcf-ce-90-q1",
          recordingId: "tcf-ce-90-r",
          level: "C1",
          stem: "Quelle est la thèse de l'auteur ?",
          rationale: "L'auteur reconnaît le gain initial, énumère des effets qui le réduisent et conclut que la conclusion vertueuse reste une hypothèse plausible.",
          options: ["Le télétravail aggrave les émissions","Le télétravail est clairement utile","Les mesures actuelles sont truquées","Le bénéfice reste non démontré"],
          answer: 3,
        },
        {
          id: "tcf-ce-91-q1",
          recordingId: "tcf-ce-91-r",
          level: "C1",
          stem: "Que reproche l'auteur à l'argument de l'immersion ?",
          rationale: "L'auteur admet le gain à l'oral et soutient que la supériorité affirmée suppose un choix non déclaré sur la compétence à privilégier.",
          options: ["Il masque un choix implicite","Il repose sur des données inventées","Il néglige le coût réel","Il confond deux langues voisines"],
          answer: 0,
        },

        {
          id: "tcf-ce-92-q1",
          recordingId: "tcf-ce-92-r",
          level: "C2",
          stem: "Qu'est-ce qui distingue une décision obtenue par fraude ?",
          rationale: "Le texte soustrait la fraude au régime commun et précise que le retrait devient alors possible à tout moment, sans délai ni preuve de préjudice.",
          options: ["Elle peut être retirée sans condition de délai","Elle ne peut jamais être retirée","Elle exige un préjudice démontré","Elle suppose l'accord du destinataire"],
          answer: 0,
        },
        {
          id: "tcf-ce-93-q1",
          recordingId: "tcf-ce-93-r",
          level: "C2",
          stem: "Que signifie une notification de recevabilité ?",
          rationale: "Le texte sépare la recevabilité, qui ne porte que sur le caractère complet du dossier, de l'examen au fond, qui peut ensuite écarter le projet.",
          options: ["Le dossier passe devant une autre instance","Le dossier est complet, rien de plus","Le financement est acquis","Le projet a convaincu la commission"],
          answer: 1,
        },
        {
          id: "tcf-ce-94-q1",
          recordingId: "tcf-ce-94-r",
          level: "C2",
          stem: "Quand la reproduction photographique cesse-t-elle d'être tolérée ?",
          rationale: "Le texte tolère la photographie sans flash mais l'exclut dès qu'elle couvre un ensemble cohérent, la reproduction intégrale exigeant une convention distincte.",
          options: ["Quand elle vise une pièce fragile","Quand elle est destinée à la publication","Quand elle porte sur un ensemble entier","Quand elle est faite sans flash"],
          answer: 2,
        },
        {
          id: "tcf-ce-95-q1",
          recordingId: "tcf-ce-95-r",
          level: "C2",
          stem: "Que demande l'auteur ?",
          rationale: "L'auteur écarte toute mise en cause personnelle et réclame un addendum, faute duquel un accord conditionnel se lira plus tard comme un accord sans réserve.",
          options: ["Que le compte rendu soit détruit","Que le transfert soit annulé","Que la personne rédactrice soit sanctionnée","Qu'un addendum rétablisse la condition posée"],
          answer: 3,
        },
        {
          id: "tcf-ce-96-q1",
          recordingId: "tcf-ce-96-r",
          level: "C2",
          stem: "Quelle est la position de l'auteur ?",
          rationale: "L'auteur admet le défaut de notification, rattache la mesure à l'ancien règlement identique, et ne retient le grief que sur la manière de présenter la décision.",
          options: ["La mesure tient, mais sa présentation était fautive","La mesure est entièrement invalide","Le grief ne repose sur rien","Le règlement d'avril s'appliquait bien"],
          answer: 0,
        },
        {
          id: "tcf-ce-97-q1",
          recordingId: "tcf-ce-97-r",
          level: "C2",
          stem: "Sur quoi porte le désaccord de l'auteur ?",
          rationale: "L'auteur accepte l'observation et la conclusion, mais juge l'explication insuffisante et propose un autre facteur, les lettres de recommandation.",
          options: ["Sur la nécessité d'une nouvelle grille","Sur l'explication de l'écart constaté","Sur l'existence même de l'écart","Sur la conclusion générale de la note"],
          answer: 1,
        },
        {
          id: "tcf-ce-98-q1",
          recordingId: "tcf-ce-98-r",
          level: "C2",
          stem: "Que reprochent les habitants à la réponse de février ?",
          rationale: "La lettre explique que la demande portait sur le cheminement piéton, ressort municipal, et non sur la suppression du passage, ressort ferroviaire.",
          options: ["Elle attribuait la charge à la municipalité","Elle arrivait plusieurs mois trop tard","Elle répondait à une autre question","Elle refusait le rendez-vous demandé"],
          answer: 2,
        },
        {
          id: "tcf-ce-99-q1",
          recordingId: "tcf-ce-99-r",
          level: "C2",
          stem: "Que montre l'examen des dossiers ?",
          rationale: "Le texte attribue le raccourcissement aux demandes simples traitées en priorité, les dossiers complexes attendant désormais plus longtemps qu'avant.",
          options: ["La baisse annoncée n'a pas eu lieu","Les agents travaillent plus lentement","Les dossiers complexes ont disparu","La baisse porte surtout sur les demandes simples"],
          answer: 3,
        },
        {
          id: "tcf-ce-100-q1",
          recordingId: "tcf-ce-100-r",
          level: "C2",
          stem: "Pourquoi la construction ne suffit-elle pas ?",
          rationale: "Le texte relève que le parc a crû plus vite que la population et impute la tension à un changement d'usage plutôt qu'à un manque de logements.",
          options: ["L'usage des logements a changé","Les logements construits sont trop chers","La population croît plus vite que le parc","Les villes étudiées sont trop peu nombreuses"],
          answer: 0,
        },
        {
          id: "tcf-ce-101-q1",
          recordingId: "tcf-ce-101-r",
          level: "C2",
          stem: "Que conteste l'auteur ?",
          rationale: "L'auteur dit expressément que l'enseignement du code vaut pour lui-même et n'attaque que la justification par un bénéfice général inexistant.",
          options: ["La comparaison avec la musique","La justification donnée, non la matière elle-même","L'enseignement du code à l'école","L'existence de tout transfert de compétence"],
          answer: 1,
        },
        {
          id: "tcf-ce-102-q1",
          recordingId: "tcf-ce-102-r",
          level: "C2",
          stem: "Quel est le raisonnement central de l'auteur ?",
          rationale: "L'auteur soutient qu'une étape supprimée devient un contrôle reporté vers l'aval, plus coûteux, le temps total mesuré par l'usager restant inchangé.",
          options: ["Les usagers réclament plus de contrôles","La lenteur des services est un mythe","Une étape supprimée devient un contrôle déplacé","Les procédures actuelles sont trop courtes"],
          answer: 2,
        },
      ],
    },
    {
      kind: 'production',
      id: 'expression-ecrite',
      sets: {
        tasks: 3,
        source: "France Éducation international — TCF Canada, expression écrite : 3 tâches, 60 minutes.",
      },
      skill: 'writing',
      name: { en: 'Written expression', fr: 'Expression écrite' },
      allowReplay: false,
      // Published: 60 minutes for the three tâches together. FEI, TCF Canada
      // page, read 2026-08-26.
      timeLimitSec: 60 * 60,
      tasks: [
        {
          id: 'tcf-ee-t1',
          skill: 'writing',
          responseMode: 'text',
          // 60–120 mots: VERIFIED 2026-08-26 against the Manuel du candidat
          // TCF, Version P, avril 2026, p. 20. The earlier note here said
          // these were unconfirmed guesses; the band turns out to be right.
          //
          // The time is a different matter. 15 minutes was invented. FEI
          // publishes 60 minutes for the whole épreuve and no per-tâche
          // split, so this is an equal third and is labelled as ours.
          name: { en: 'Tâche 1', fr: 'Tâche 1' },
          instruction: {
            en: 'Write a short message. 60 to 120 words.',
            fr: "Rédigez un message. De 60 à 120 mots.",
          },
          prompt: {
            en: 'You have just finished a training course paid for by your employer. Write a message to your colleagues describing the course and what you learned.',
            fr: "Vous venez de terminer une formation payée par votre employeur. Vous écrivez un message à vos collègues pour décrire cette formation et expliquer ce que vous avez appris.",
          },
          prompts: [
            {
              id: 'tcf-ee-t1-p2',
              topicKeywords: ['logement', 'quartier', 'voisins', 'commerces', 'transport', 'plaît', 'manque', 'déménagé'],
              freshness: 'current',
              prompt: {
                en: "You have found a home in a new neighbourhood. Write a message to a friend describing the area and what you like and miss about it.",
                fr: "Vous avez trouvé un logement dans un nouveau quartier. Vous écrivez un message à un ami pour décrire le quartier, ce qui vous plaît et ce qui vous manque.",
              },
            },
            {
              id: 'tcf-ee-t1-p3',
              topicKeywords: ['repas', 'départ', 'collègue', 'date', 'lieu', 'restaurant', 'participation', 'viendra'],
              freshness: 'current',
              prompt: {
                en: "Your team is organising a meal for a colleague who is leaving. Write a message to the others proposing a date, a place and a contribution, and asking who will come.",
                fr: "Votre équipe organise un repas pour le départ d'un collègue. Vous écrivez un message aux autres pour proposer une date, un lieu et une participation, et pour demander qui viendra.",
              },
            },
            {
              id: 'tcf-ee-t1-p4',
              topicKeywords: ['voisin', 'objet', 'abîmé', 'emprunté', 'désolé', 'réparer', 'remplacer', 'excuses'],
              freshness: 'current',
              prompt: {
                en: "You borrowed something from a neighbour and damaged it. Write a message telling them, explaining what happened and proposing a solution.",
                fr: "Vous avez emprunté un objet à un voisin et vous l'avez abîmé. Vous écrivez un message pour le lui dire, expliquer ce qui s'est passé et proposer une solution.",
              },
            },
          ],
          timeLimitSec: 20 * 60,
          timeLimitApportioned: true,
          wordGuidance: { en: '60 to 120 words', fr: 'De 60 à 120 mots' },
          scaleId: 'sur20',
          criteria: [
            { id: 'respect_consigne', label: { en: 'Compliance with the instruction', fr: 'Respect de la consigne' } },
            { id: 'capacite_informer', label: { en: 'Ability to inform and describe', fr: 'Capacité à informer et à décrire' } },
            { id: 'lexique', label: { en: 'Lexis', fr: 'Lexique' } },
            { id: 'morphosyntaxe', label: { en: 'Morphosyntax', fr: 'Morphosyntaxe' } },
          ],
          gate: [
            {
              id: 'empty',
              verdict: {
                kind: 'zero',
                label: { en: 'Nothing submitted', fr: 'Aucune réponse remise' },
                detail: { en: 'An empty response cannot be marked.', fr: "Une réponse vide ne peut pas être corrigée." },
              },
            },
            {
              id: 'min_words',
              words: 60,
              verdict: {
                kind: 'zero',
                label: { en: 'Under length — "A1 non atteint"', fr: 'Trop court — « A1 non atteint »' },
                detail: {
                  en: 'TCF awards "A1 non atteint" — effectively zero — to a response below the required length, whatever its quality.',
                  fr: "Le TCF attribue « A1 non atteint » — soit zéro — à une réponse trop courte, quelle que soit sa qualité.",
                },
              },
            },
            {
              id: 'max_words',
              words: 120,
              verdict: {
                kind: 'warn',
                label: { en: 'Over the upper bound', fr: 'Au-dessus de la borne haute' },
                detail: {
                  en: 'Past 120 words the extra sentences earn nothing and cost time the next tâche needs.',
                  fr: "Au-delà de 120 mots, les phrases supplémentaires ne rapportent rien et coûtent du temps à la tâche suivante.",
                },
              },
            },
            {
              id: 'prompt_copy',
              // RESTATED 2026-08-28, 0.5 -> 0.53. Measured across 24 French
              // responses: splitting elision raised prompt overlap by 6.4%
              // (0.540 -> 0.575 mean), because the elided fragments the fix
              // creates appear in BOTH the response and the prompt and so
              // count as overlap on each side. Left at 0.5 this rule became
              // 6.4% tighter as a side effect of fixing the word counter,
              // and it is an automatic zero.
              maxOverlapRatio: 0.53,
              verdict: {
                kind: 'zero',
                label: { en: 'Copied from the instruction', fr: 'Recopié de la consigne' },
                detail: {
                  en: 'Sentences lifted from the consigne are one of the official automatic-zero triggers.',
                  fr: "Les phrases recopiées de la consigne font partie des déclencheurs officiels du zéro automatique.",
                },
              },
            },
            {
              id: 'template_ratio',
              // RAISED 2026-08-28, 0.2 -> 0.4, matching tâche 3, and for the
              // same reason tâche 3 was raised: the scaffold is the phrasing a
              // CORRECT answer uses, so overlapping it is not evidence of
              // memorisation.
              //
              // Tâche 3's note records that at 0.2 the rule fired on its own
              // model answer. Tâches 1 and 2 were left at 0.2 because no model
              // answer had ever been run through them. MEASURED today across
              // eight independently written NCLC 7 messages: mean 0.211, max
              // 0.288, and **four of the eight were zeroed** — awarded
              // « texte appris par cœur », an automatic zero, for writing
              // ordinary French.
              //
              // The root cause is deeper than the number and is recorded here
              // rather than fixed in a hurry: this scaffold is 26 distinct
              // tokens and most of them are the commonest function words in
              // the language — à, de, une, ce, que, le, plus, je, nous, pour.
              // A ratio over tokens cannot tell "reused the scaffold" from
              // "wrote French". Measuring overlap on CONTENT words only would
              // fix the measure instead of the threshold, and it would change
              // tâche 3's calibration too, so it goes to the reviewer with the
              // rest of the cell rather than being changed alongside a bank.
              maxRatio: 0.4,
              verdict: {
                kind: 'zero',
                label: { en: 'Memorised text', fr: 'Texte appris par cœur' },
                detail: {
                  en: 'TCF awards no score to memorised text. The threshold is tighter here than on IELTS because the consequence is total rather than a deduction.',
                  fr: "Le TCF n'accorde aucune note à un texte appris par cœur. Le seuil est plus strict qu'à l'IELTS parce que la conséquence est totale et non une pénalité.",
                },
              },
            },
            {
              id: 'off_topic',
              minKeywordHits: 2,
              verdict: {
                kind: 'zero',
                label: { en: 'Off topic', fr: 'Hors sujet' },
                detail: {
                  en: 'An off-topic response is one of the official automatic-zero triggers.',
                  fr: "Le hors-sujet fait partie des déclencheurs officiels du zéro automatique.",
                },
              },
            },
          ],
          topicKeywords: ['formation', 'collègues', 'appris', 'employeur', 'message', 'travail', 'cours', 'stage'],
          suppliedScaffold: [
            'Bonjour à tous,',
            "Je viens de terminer une formation sur",
            "Ce que j'ai le plus retenu, c'est",
            "Je pense que cela nous sera utile pour",
            'À bientôt,',
          ],
          judge: {
            kind: 'none',
            reason: {
              en: 'No calibrated judge is bound to TCF Canada yet. The deterministic checks above are real; the criterion grid below is what a judge would fill in, and it is empty because the French engine has not been built.',
              fr: "Aucun correcteur étalonné n'est encore rattaché au TCF Canada. Les vérifications déterministes ci-dessus sont réelles ; la grille de critères ci-dessous est ce qu'un correcteur remplirait, et elle est vide parce que le moteur français n'est pas construit.",
            },
          },
        },
        {
          id: 'tcf-ee-t2',
          skill: 'writing',
          responseMode: 'text',
          // 120–150 mots: VERIFIED against the Manuel du candidat TCF,
          // Version P, avril 2026, p. 20, which also gives the task type —
          // "raconter ou rédiger un court article": a narrative or short
          // article, an account of experience or a testimonial for a blog or
          // a publication, structured, with connectives guiding the reader.
          //
          // The subject below is OURS. The manual gives the task type, never
          // a subject, and this project does not reproduce real exam items.
          // The time is ours too: an equal third of the published 60 minutes.
          name: { en: 'Tâche 2', fr: 'Tâche 2' },
          instruction: {
            en: 'Write a short article or account for a blog or a publication. 120 to 150 words.',
            fr: "Rédigez un court article ou un récit destiné à un blog ou à une publication. De 120 à 150 mots.",
          },
          prompt: {
            en: 'A magazine for newcomers is collecting accounts of a day that changed something for its readers. Write your account: what happened, in what order, and what it changed for you. Your reader does not know you and was not there.',
            fr: "Un magazine destiné aux personnes nouvellement arrivées réunit des récits d'une journée qui a changé quelque chose. Rédigez le vôtre : ce qui s'est passé, dans quel ordre, et ce que cela a changé pour vous. Votre lecteur ne vous connaît pas et n'était pas présent.",
          },
          prompts: [
            {
              id: 'tcf-ee-t2-p2',
              topicKeywords: ['emploi', 'collègues', 'bureau', 'attendais', 'premier', 'patron', 'retenu', 'métier'],
              freshness: 'current',
              prompt: {
                en: "A site about work collects accounts of a first day in a new job. Write yours.",
                fr: "Un site consacré au travail réunit des récits d'un premier jour dans un nouvel emploi. Rédigez le vôtre : ce que vous attendiez, ce qui s'est réellement passé, et ce que vous en avez retenu. Votre lecteur ne vous connaît pas.",
              },
            },
            {
              id: 'tcf-ee-t2-p3',
              topicKeywords: ['rencontre', 'inattendu', 'circonstances', 'suite', 'personne', 'hasard', 'dit', 'ensuite'],
              freshness: 'current',
              prompt: {
                en: "A neighbourhood magazine publishes accounts of a chance meeting that led somewhere unexpected. Write yours.",
                fr: "Un magazine de quartier publie des récits d'une rencontre qui a mené à quelque chose d'inattendu. Rédigez le vôtre : les circonstances, ce qui a été dit, et la suite. Votre lecteur n'était pas présent.",
              },
            },
            {
              id: 'tcf-ee-t2-p4',
              topicKeywords: ['décision', 'vite', 'regrette', 'situation', 'suivi', 'choix', 'trop', 'aujourd'],
              freshness: 'current',
              prompt: {
                en: "A review collects accounts of a decision taken too quickly. Write yours.",
                fr: "Une revue réunit des récits d'une décision prise trop vite. Rédigez le vôtre : la situation, la décision, ce qui a suivi, et ce que vous feriez aujourd'hui. Votre lecteur ne vous connaît pas.",
              },
            },
          ],
          timeLimitSec: 20 * 60,
          timeLimitApportioned: true,
          wordGuidance: { en: '120 to 150 words', fr: 'De 120 à 150 mots' },
          scaleId: 'sur20',
          criteria: [
            { id: 'respect_consigne', label: { en: 'Compliance with the instruction', fr: 'Respect de la consigne' } },
            { id: 'capacite_raconter', label: { en: 'Ability to narrate and describe', fr: 'Capacité à raconter et à décrire' } },
            { id: 'lexique', label: { en: 'Lexis', fr: 'Lexique' } },
            { id: 'morphosyntaxe', label: { en: 'Morphosyntax', fr: 'Morphosyntaxe' } },
          ],
          gate: [
            {
              id: 'empty',
              verdict: {
                kind: 'zero',
                label: { en: 'Nothing submitted', fr: 'Aucune réponse remise' },
                detail: { en: 'An empty response cannot be marked.', fr: "Une réponse vide ne peut pas être corrigée." },
              },
            },
            {
              id: 'min_words',
              words: 120,
              verdict: {
                kind: 'zero',
                label: { en: 'Under length — "A1 non atteint"', fr: 'Trop court — « A1 non atteint »' },
                detail: {
                  en: 'TCF awards "A1 non atteint" — effectively zero — to a response below the required length, whatever its quality.',
                  fr: "Le TCF attribue « A1 non atteint » — soit zéro — à une réponse trop courte, quelle que soit sa qualité.",
                },
              },
            },
            {
              id: 'max_words',
              words: 150,
              verdict: {
                kind: 'warn',
                label: { en: 'Over the upper bound', fr: 'Au-dessus de la borne haute' },
                detail: {
                  en: 'Past 150 words the extra sentences earn nothing and cost time tâche 3 needs.',
                  fr: "Au-delà de 150 mots, les phrases supplémentaires ne rapportent rien et coûtent du temps à la tâche 3.",
                },
              },
            },
            {
              id: 'prompt_copy',
              // RESTATED 2026-08-28, 0.5 -> 0.53. Measured across 24 French
              // responses: splitting elision raised prompt overlap by 6.4%
              // (0.540 -> 0.575 mean), because the elided fragments the fix
              // creates appear in BOTH the response and the prompt and so
              // count as overlap on each side. Left at 0.5 this rule became
              // 6.4% tighter as a side effect of fixing the word counter,
              // and it is an automatic zero.
              maxOverlapRatio: 0.53,
              verdict: {
                kind: 'zero',
                label: { en: 'Copied from the instruction', fr: 'Recopié de la consigne' },
                detail: {
                  en: 'Sentences lifted from the consigne are one of the official automatic-zero triggers.',
                  fr: "Les phrases recopiées de la consigne font partie des déclencheurs officiels du zéro automatique.",
                },
              },
            },
            {
              id: 'template_ratio',
              // RAISED 2026-08-28, 0.2 -> 0.4, matching tâche 3, and for the
              // same reason tâche 3 was raised: the scaffold is the phrasing a
              // CORRECT answer uses, so overlapping it is not evidence of
              // memorisation.
              //
              // Tâche 3's note records that at 0.2 the rule fired on its own
              // model answer. Tâches 1 and 2 were left at 0.2 because no model
              // answer had ever been run through them. MEASURED today across
              // eight independently written NCLC 7 messages: mean 0.211, max
              // 0.288, and **four of the eight were zeroed** — awarded
              // « texte appris par cœur », an automatic zero, for writing
              // ordinary French.
              //
              // The root cause is deeper than the number and is recorded here
              // rather than fixed in a hurry: this scaffold is 26 distinct
              // tokens and most of them are the commonest function words in
              // the language — à, de, une, ce, que, le, plus, je, nous, pour.
              // A ratio over tokens cannot tell "reused the scaffold" from
              // "wrote French". Measuring overlap on CONTENT words only would
              // fix the measure instead of the threshold, and it would change
              // tâche 3's calibration too, so it goes to the reviewer with the
              // rest of the cell rather than being changed alongside a bank.
              maxRatio: 0.4,
              verdict: {
                kind: 'zero',
                label: { en: 'Memorised text', fr: 'Texte appris par cœur' },
                detail: {
                  en: 'TCF awards no score to memorised text. A narrative is the easiest tâche to arrive with pre-written, which is why the threshold is not relaxed here.',
                  fr: "Le TCF n'accorde aucune note à un texte appris par cœur. Le récit est la tâche la plus facile à préparer d'avance, et c'est pourquoi le seuil n'est pas assoupli ici.",
                },
              },
            },
            {
              id: 'off_topic',
              minKeywordHits: 2,
              verdict: {
                kind: 'zero',
                label: { en: 'Off topic', fr: 'Hors sujet' },
                detail: {
                  en: 'An off-topic response is one of the official automatic-zero triggers.',
                  fr: "Le hors-sujet fait partie des déclencheurs officiels du zéro automatique.",
                },
              },
            },
          ],
          topicKeywords: ['journée', 'jour', 'changé', 'arrivé', 'ensuite', 'raconte', 'souvenir', 'depuis'],
          suppliedScaffold: [
            "Ce jour-là,",
            "Tout a commencé quand",
            "Ensuite,",
            "Depuis, je",
          ],
          judge: {
            kind: 'none',
            reason: {
              en: 'No calibrated judge is bound to TCF Canada yet. The deterministic checks above are real; the criterion grid below is what a judge would fill in, and it is empty because the French engine has not been built.',
              fr: "Aucun correcteur étalonné n'est encore rattaché au TCF Canada. Les vérifications déterministes ci-dessus sont réelles ; la grille de critères ci-dessous est ce qu'un correcteur remplirait, et elle est vide parce que le moteur français n'est pas construit.",
            },
          },
        },
        {
          id: 'tcf-ee-t3',
          skill: 'writing',
          responseMode: 'text',
          // 120–180 mots: VERIFIED 2026-08-26, Manuel du candidat TCF,
          // Version P, avril 2026, p. 20, which also confirms the shape of
          // this tâche — two documents, two points of view on a fait de
          // société, the candidate's own opinion.
          //
          // The time is ours: an equal third of the published 60 minutes.
          name: { en: 'Tâche 3', fr: 'Tâche 3' },
          instruction: {
            en: 'Compare the two documents below and give your own reasoned opinion. 120 to 180 words.',
            fr: "Comparez les deux documents ci-dessous et donnez votre avis argumenté. De 120 à 180 mots.",
          },
          prompt: {
            en: 'Document 1 — a municipal notice announcing that the town centre will be closed to cars on Saturdays, to reduce pollution and make room for markets and cycling.\n\nDocument 2 — a letter from a shopkeepers\u2019 association arguing that the closure will cut takings, that deliveries have nowhere to stop, and that customers with reduced mobility will stay away.\n\nCompare the two positions and give your own reasoned opinion.',
            fr: "Document 1 — un avis municipal annonçant la fermeture du centre-ville aux voitures le samedi, afin de réduire la pollution et de laisser la place aux marchés et au vélo.\n\nDocument 2 — une lettre d'une association de commerçants soutenant que cette fermeture fera baisser le chiffre d'affaires, que les livraisons n'auront plus où s'arrêter, et que la clientèle à mobilité réduite ne viendra plus.\n\nComparez les deux positions et donnez votre avis argumenté.",
          },
          prompts: [
            {
              id: 'tcf-ee-t3-p2',
              topicKeywords: ['télétravail', 'direction', 'bureau', 'employés', 'formation', 'réunions', 'distance', 'frais'],
              freshness: 'current',
              prompt: {
                en: "Compare an employer's notice introducing two days of remote work with a letter from employees opposing it, and give your reasoned opinion.",
                fr: "Document 1 — une note de direction annonçant que chacun travaillera désormais deux jours par semaine à distance, afin de réduire les frais de bureau.\n\nDocument 2 — une lettre d'un groupe d'employés soutenant que la formation des nouveaux et l'entraide informelle disparaissent quand la moitié de l'équipe est absente, et que les réunions ne les remplacent pas.\n\nComparez les deux positions et donnez votre avis argumenté.",
              },
            },
            {
              id: 'tcf-ee-t3-p3',
              topicKeywords: ['enregistrements', 'étudiants', 'amphithéâtre', 'présence', 'salariés', 'université', 'suivre', 'cours'],
              freshness: 'current',
              prompt: {
                en: "Compare a university notice ending lecture recordings with a student association's letter opposing it, and give your reasoned opinion.",
                fr: "Document 1 — un avis universitaire annonçant que les cours ne seront plus enregistrés, afin d'encourager la présence en amphithéâtre.\n\nDocument 2 — une lettre d'une association étudiante soutenant que ce sont les enregistrements qui permettent à ceux qui travaillent de suivre les cours, et que la mesure frappe les seuls étudiants salariés.\n\nComparez les deux positions et donnez votre avis argumenté.",
              },
            },
            {
              id: 'tcf-ee-t3-p4',
              topicKeywords: ['ordures', 'poids', 'déchets', 'dépôts', 'familles', 'facturées', 'volume', 'résidents'],
              freshness: 'current',
              prompt: {
                en: "Compare a municipal notice charging for waste by weight with a residents' association letter opposing it, and give your reasoned opinion.",
                fr: "Document 1 — un avis municipal annonçant que les ordures ménagères seront facturées au poids, afin d'en réduire le volume.\n\nDocument 2 — une lettre d'une association de résidents soutenant que la mesure fera apparaître des dépôts dans la rue et pénalisera les familles nombreuses, qui produisent davantage sans gaspiller davantage.\n\nComparez les deux positions et donnez votre avis argumenté.",
              },
            },
          ],
          timeLimitSec: 20 * 60,
          timeLimitApportioned: true,
          wordGuidance: { en: '120 to 180 words', fr: 'De 120 à 180 mots' },
          scaleId: 'sur20',
          criteria: [
            { id: 'respect_consigne', label: { en: 'Compliance with the instruction', fr: 'Respect de la consigne' } },
            { id: 'capacite_argumenter', label: { en: 'Ability to compare and argue', fr: 'Capacité à comparer et à argumenter' } },
            { id: 'lexique', label: { en: 'Lexis', fr: 'Lexique' } },
            { id: 'morphosyntaxe', label: { en: 'Morphosyntax', fr: 'Morphosyntaxe' } },
          ],
          gate: [
            {
              id: 'empty',
              verdict: {
                kind: 'zero',
                label: { en: 'Nothing submitted', fr: 'Aucune réponse remise' },
                detail: { en: 'An empty response cannot be marked.', fr: "Une réponse vide ne peut pas être corrigée." },
              },
            },
            {
              id: 'min_words',
              words: 120,
              verdict: {
                kind: 'zero',
                label: { en: 'Under length — "A1 non atteint"', fr: 'Trop court — « A1 non atteint »' },
                detail: {
                  en: 'TCF awards "A1 non atteint" to a response below the required length, whatever its quality.',
                  fr: "Le TCF attribue « A1 non atteint » à une réponse trop courte, quelle que soit sa qualité.",
                },
              },
            },
            {
              id: 'max_words',
              words: 180,
              verdict: {
                kind: 'warn',
                label: { en: 'Over the upper bound', fr: 'Au-dessus de la borne haute' },
                detail: {
                  en: 'Tâche 3 is the last task and the one candidates run out of time on. Words past the bound earn nothing.',
                  fr: "La tâche 3 est la dernière et celle où le temps manque. Les mots au-delà de la borne ne rapportent rien.",
                },
              },
            },
            {
              // The comparison rule. This is the one that distinguishes
              // tâche 3 from every other written task in either exam.
              id: 'source_coverage',
              minHitsPerSource: 2,
              sources: [
                {
                  id: 'doc1',
                  label: { en: 'Document 1 — the municipal notice', fr: 'Document 1 — l\u2019avis municipal' },
                  // DISTINCTIVE words only. 'voiture', 'centre-ville' and
                  // 'samedi' were removed after the first test run: they are
                  // the shared subject of both documents, so an answer that
                  // discussed only the shopkeepers still scored hits against
                  // document 1 and passed. A coverage keyword has to be one
                  // the OTHER document would not naturally produce.
                  keywords: ['pollution', 'vélo', 'marché', 'piéton', 'municipal', 'mairie', 'air'],
                },
                {
                  id: 'doc2',
                  label: { en: 'Document 2 — the shopkeepers\u2019 letter', fr: 'Document 2 — la lettre des commerçants' },
                  keywords: ['commerçant', 'chiffre', 'livraison', 'clientèle', 'mobilité', 'affaires', 'boutique', 'vente'],
                },
              ],
              verdict: {
                kind: 'zero',
                label: { en: 'Only one document was addressed', fr: "Un seul document a été traité" },
                detail: {
                  en: 'Tâche 3 asks for a comparison. A response that engages with only one of the two documents has not performed the task, however well it is written — and the criterion it fails first is respect de la consigne.',
                  fr: "La tâche 3 demande une comparaison. Une réponse qui ne traite qu'un des deux documents n'a pas réalisé la tâche, aussi bien écrite soit-elle — et le premier critère qu'elle manque est le respect de la consigne.",
                },
              },
            },
            {
              // Token overlap is NOT a valid copy measure on this task, and
              // the first test run proved it: a genuine, well-argued
              // comparison was zeroed at 0.5 because the prompt here IS the
              // source material. A response that discusses two documents
              // must reuse their content words — that is the task.
              //
              // So the ratio is set high enough to be inert and the work is
              // done by the run detector in engine/gate.ts, which fires on
              // eight consecutive lifted tokens. That catches a copied
              // sentence and ignores shared vocabulary, which is the
              // distinction that actually matters here.
              id: 'prompt_copy',
              maxOverlapRatio: 0.85,
              // Naming what the two documents are about costs eight
              // consecutive words by itself. Fourteen is the point where a
              // response is reproducing a clause rather than a subject.
              //
              // RESTATED 2026-08-28 from 14 to 15, and the number did not
              // change its meaning — the unit did. `text.ts` now splits
              // French elision, so `l'avis` is two tokens where it was one,
              // and every count in this file rose about 5%. Left at 14 the
              // rule would have quietly tightened by one word as a side
              // effect of fixing the word counter. Measured across eight
              // NCLC 6 responses: the same text scores 9→12, 14→15, 13→14.
              maxLiftedRun: 15,
              verdict: {
                kind: 'zero',
                label: { en: 'Copied from the documents', fr: 'Recopié des documents' },
                detail: {
                  en: 'Tâche 3 supplies two texts, so it is the task where lifting is easiest and most penalised. Reusing their vocabulary is expected; reproducing their sentences is not.',
                  fr: "La tâche 3 fournit deux textes : c'est donc la tâche où le recopiage est le plus facile et le plus sanctionné. Réutiliser leur vocabulaire est attendu ; reproduire leurs phrases ne l'est pas.",
                },
              },
            },
            {
              // Also raised after the first test run. The scaffold for this
              // task is the connective phrasing a correct comparison uses —
              // "les deux documents", "le premier soutient que" — so at 0.2
              // it fired on the model answer. A candidate who structures a
              // comparison properly is not cheating.
              id: 'template_ratio',
              // MEASURED 2026-08-28 and deliberately NOT changed. The elision
              // fix moved this ratio the OPPOSITE way from prompt overlap —
              // DOWN 5.0% (0.136 -> 0.130 mean) — because the scaffold phrases
              // are short connectives with little elision while the response's
              // denominator grew. So the rule is now ~5% LOOSER than when the
              // number was chosen.
              //
              // Restating it to 0.38 would preserve the original intent. It is
              // left alone because tightening an automatic-zero rule on our own
              // measurement, with no francophone reviewer yet appointed, is the
              // one direction that costs a real candidate a real mark. It goes
              // to the reviewer with the rest of the cell.
              maxRatio: 0.4,
              verdict: {
                kind: 'zero',
                label: { en: 'Memorised text', fr: 'Texte appris par cœur' },
                detail: {
                  en: 'TCF awards no score to memorised text.',
                  fr: "Le TCF n'accorde aucune note à un texte appris par cœur.",
                },
              },
            },
            {
              id: 'off_topic',
              minKeywordHits: 2,
              verdict: {
                kind: 'zero',
                label: { en: 'Off topic', fr: 'Hors sujet' },
                detail: {
                  en: 'An off-topic response is one of the official automatic-zero triggers.',
                  fr: "Le hors-sujet fait partie des déclencheurs officiels du zéro automatique.",
                },
              },
            },
          ],
          topicKeywords: ['centre-ville', 'voiture', 'commerçant', 'pollution', 'avis', 'samedi'],
          suppliedScaffold: [
            'Les deux documents abordent',
            "Le premier document soutient que",
            "Le second, en revanche, met en avant",
            "Pour ma part, je pense que",
            'En conclusion,',
          ],
          judge: {
            kind: 'none',
            reason: {
              en: 'No judge is bound. The bound writing assessor refuses French outright — fr-fr and fr-ca both return error_feature_unavailable — so the deterministic checks above are the only real output for this task today, and they are real.',
              fr: "Aucun correcteur n'est rattaché. Le correcteur d'écrit refuse le français — fr-fr et fr-ca renvoient tous deux error_feature_unavailable — de sorte que les vérifications déterministes ci-dessus sont aujourd'hui le seul résultat réel de cette tâche, et elles sont réelles.",
            },
          },
        },
      ],
    },
    {
      kind: 'production',
      id: 'expression-orale',
      sets: {
        tasks: 3,
        source: "France Éducation international — TCF Canada, expression orale : 3 tâches, 12 minutes.",
      },
      skill: 'speaking',
      name: { en: 'Spoken expression', fr: 'Expression orale' },
      allowReplay: false,
      tasks: [
        {
          id: 'tcf-eo-t1',
          skill: 'speaking',
          responseMode: 'audio',
          name: { en: 'Tâche 1', fr: 'Tâche 1' },
          instruction: {
            en: 'Introduce yourself to the examiner. About two minutes, without preparation.',
            fr: "Présentez-vous à l'examinateur. Environ deux minutes, sans préparation.",
          },
          prompt: {
            en: 'Introduce yourself: who you are, what you do, and what brought you to learn French.',
            fr: "Présentez-vous : qui vous êtes, ce que vous faites, et ce qui vous a amené à apprendre le français.",
          },
          prompts: [
            {
              id: 'tcf-eo-t1-p2',
              topicKeywords: ['parcours', 'aujourd', 'cinq', 'aimerais', 'projet', 'avenir', 'étudié', 'ans'],
              freshness: 'current',
              prompt: {
                en: "Introduce yourself: your background, what you do now, and what you would like to be doing in five years.",
                fr: "Présentez-vous : votre parcours, ce que vous faites aujourd'hui, et ce que vous aimeriez faire dans cinq ans.",
              },
            },
            {
              id: 'tcf-eo-t1-p3',
              topicKeywords: ['viens', 'vis', 'maintenant', 'difficile', 'changement', 'installé', 'langue', 'pays'],
              freshness: 'current',
              prompt: {
                en: "Introduce yourself: where you are from, where you live now, and what was hardest about the change.",
                fr: "Présentez-vous : d'où vous venez, où vous vivez maintenant, et ce qui a été le plus difficile dans ce changement.",
              },
            },
            {
              id: 'tcf-eo-t1-p4',
              topicKeywords: ['journée', 'ordinaire', 'matin', 'soir', 'loisirs', 'habitude', 'semaine', 'travail'],
              freshness: 'current',
              prompt: {
                en: "Introduce yourself: your work or your studies, an ordinary day for you, and what you do when you are not working.",
                fr: "Présentez-vous : votre travail ou vos études, une journée ordinaire pour vous, et ce que vous faites quand vous ne travaillez pas.",
              },
            },
          ],
          timeLimitSec: 120,
          // "Entretien dirigé sans préparation" — Manuel du candidat TCF,
          // Version P, avril 2026, p. 19. Zero here is the exam's published
          // answer, not a missing value.
          preparationSec: 0,
          wordGuidance: { en: 'About two minutes', fr: 'Environ deux minutes' },
          scaleId: 'sur20',
          criteria: [
            { id: 'respect_consigne', label: { en: 'Compliance with the instruction', fr: 'Respect de la consigne' } },
            { id: 'capacite_interagir', label: { en: 'Ability to interact', fr: 'Capacité à interagir' } },
            { id: 'lexique', label: { en: 'Lexis', fr: 'Lexique' } },
            { id: 'morphosyntaxe', label: { en: 'Morphosyntax', fr: 'Morphosyntaxe' } },
          ],
          gate: [
            {
              id: 'empty',
              verdict: {
                kind: 'zero',
                label: { en: 'Nothing was heard', fr: "Rien n'a été entendu" },
                detail: {
                  en: 'The recording produced no transcript.',
                  fr: "L'enregistrement n'a produit aucune transcription.",
                },
              },
            },
            {
              id: 'min_words',
              words: 80,
              verdict: {
                kind: 'zero',
                label: { en: 'Too short — "A1 non atteint"', fr: 'Trop court — « A1 non atteint »' },
                detail: {
                  en: 'A response too short to show the level is scored as not reaching A1, whatever its quality.',
                  fr: "Une réponse trop courte pour montrer le niveau est notée « A1 non atteint », quelle que soit sa qualité.",
                },
              },
            },
            {
              id: 'off_topic',
              // RAISED 2026-08-28, 1 -> 2, and the keywords widened below.
              //
              // At 1, with `je` and `suis` on the list, this rule could not
              // fire on any text written in French. MEASURED across four
              // model answers, four NCLC 6 answers and four deliberately
              // off-topic answers:
              //
              //   bar 1  correct wrongly zeroed 0/8 · off-topic missed 4/4
              //   bar 2  correct wrongly zeroed 0/8 · off-topic missed 1/4
              //   bar 3  correct wrongly zeroed 0/8 · off-topic missed 0/4
              //   bar 4  correct wrongly zeroed 1/8 · off-topic missed 0/4
              //
              // Bar 3 catches everything and leaves ZERO margin — the lowest
              // correct answer scores exactly 3. Bar 2 keeps a margin of one
              // and lets one off-topic answer through to the judge, which
              // then marks it low anyway.
              //
              // The asymmetry decides it: wrongly zeroing a correct answer
              // costs a real candidate a real mark, and missing an off-topic
              // one costs a marking pass that happens regardless. So 2, and
              // the trade-off goes to the reviewer with the rest of the cell.
              // Four items cannot calibrate this; they can only show that 1
              // was inert.
              minKeywordHits: 2,
              verdict: {
                kind: 'zero',
                label: { en: 'Off topic', fr: 'Hors sujet' },
                detail: {
                  en: 'Off-topic is one of the official automatic-zero triggers.',
                  fr: "Le hors-sujet fait partie des déclencheurs officiels du zéro automatique.",
                },
              },
            },
          ],
          // Widened at the same time. The shipped five included `je` and `suis`;
          // these carry content, which is what a topic list is for.
          topicKeywords: [
            'appelle', 'travaille', 'étudie', 'arrivé', 'arrivée', 'apprends',
            'ans', 'cours', 'famille', 'métier', 'pays',
          ],
          // The transcriber is bound: SpeechAce and the STT chain both
          // support fr-CA, so a French recording yields a real transcript and
          // real acoustic measures. The judge is not bound, because nothing
          // scores the TCF grid.
          signal: {
            kind: 'remote',
            adapter: 'speech_evaluate',
            endpoint: '/speech/evaluate',
            language: 'fr-CA',
            fields: { reference_text: '' },
          },
          judge: {
            kind: 'none',
            reason: {
              en: 'No judge scores the TCF speaking grid. The transcript and the acoustic measures above are real; the four criteria below are what an examiner would fill in, and they are empty.',
              fr: "Aucun correcteur n'évalue la grille d'expression orale du TCF. La transcription et les mesures acoustiques ci-dessus sont réelles ; les quatre critères ci-dessous sont ce qu'un examinateur remplirait, et ils sont vides.",
            },
          },
        },
        {
          id: 'tcf-eo-t2',
          skill: 'speaking',
          responseMode: 'audio',
          // "Exercice en interaction AVEC préparation" — Manuel du candidat
          // TCF, Version P, avril 2026, p. 19: 3 min 30 of dialogue plus 2
          // minutes of preparation, for TCF tout public, Québec and Canada.
          //
          // This settles the conflict recorded in step 05 §C2, where one
          // source claimed there is no preparation at all and called that
          // absence the task's main trap. There is preparation, and it is two
          // minutes. Every figure on this task is published; none is ours.
          //
          // The manual also states, among the assessed capabilities for
          // expression orale, "poser des questions adaptées à la situation de
          // communication proposée". That is the task: the candidate obtains
          // information, and the status of both parties is given in the
          // instruction. It is also the source for the teaching-boundary rule
          // that the business plan and the website both carry — previously
          // supported only by preparation sites.
          name: { en: 'Tâche 2', fr: 'Tâche 2' },
          instruction: {
            en: 'Obtain the information you need from your examiner, who plays the role given below. Two minutes to prepare, then about three and a half minutes of dialogue.',
            fr: "Obtenez auprès de votre examinateur, qui joue le rôle indiqué ci-dessous, les informations dont vous avez besoin. Deux minutes de préparation, puis environ trois minutes trente de dialogue.",
          },
          prompt: {
            en: 'You have just moved into a flat and the heating does not work. Your examiner is the building manager. Find out what is wrong, when it will be repaired, and what you should do in the meantime. Ask the questions you need to ask.',
            fr: "Vous venez d'emménager dans un appartement et le chauffage ne fonctionne pas. Votre examinateur est le gestionnaire de l'immeuble. Renseignez-vous sur l'origine du problème, sur la date de la réparation, et sur ce que vous devez faire en attendant. Posez les questions nécessaires.",
          },
          prompts: [
            {
              id: 'tcf-eo-t2-p2',
              topicKeywords: ['enfant', 'activité', 'école', 'horaires', 'coût', 'apporter', 'inscrire', 'centre'],
              freshness: 'current',
              prompt: {
                en: "Find out what you need about an after-school activity for your child. The examiner runs the centre.",
                fr: "Vous voulez inscrire votre enfant à une activité après l'école. Votre examinateur est le responsable du centre. Renseignez-vous sur les horaires, sur le coût et sur ce qu'il faut apporter. Posez les questions nécessaires.",
              },
            },
            {
              id: 'tcf-eo-t2-p3',
              topicKeywords: ['facture', 'téléphone', 'élevée', 'remboursement', 'annulé', 'conseiller', 'délai', 'différence'],
              freshness: 'current',
              prompt: {
                en: "Find out why your telephone bill is much higher than usual. The examiner is the customer adviser.",
                fr: "Vous avez reçu une facture de téléphone bien plus élevée que d'habitude. Votre examinateur est le conseiller du service client. Renseignez-vous sur l'origine de la différence, sur ce qui peut être annulé et sur le délai de remboursement. Posez les questions nécessaires.",
              },
            },
            {
              id: 'tcf-eo-t2-p4',
              topicKeywords: ['formation', 'français', 'soir', 'niveau', 'dates', 'séances', 'manque', 'inscription'],
              freshness: 'current',
              prompt: {
                en: "Find out what you need about an evening French course. The examiner works at the reception desk.",
                fr: "Vous cherchez une formation de français le soir. Votre examinateur travaille à l'accueil du centre de formation. Renseignez-vous sur le niveau demandé, sur les dates et sur ce qui se passe si vous manquez des séances. Posez les questions nécessaires.",
              },
            },
          ],
          timeLimitSec: 210,
          preparationSec: 120,
          wordGuidance: { en: 'About three and a half minutes', fr: 'Environ trois minutes trente' },
          scaleId: 'sur20',
          criteria: [
            { id: 'respect_consigne', label: { en: 'Compliance with the instruction', fr: 'Respect de la consigne' } },
            { id: 'capacite_interagir', label: { en: 'Ability to interact', fr: 'Capacité à interagir' } },
            { id: 'lexique', label: { en: 'Lexis', fr: 'Lexique' } },
            { id: 'morphosyntaxe', label: { en: 'Morphosyntax', fr: 'Morphosyntaxe' } },
          ],
          gate: [
            {
              id: 'empty',
              verdict: {
                kind: 'zero',
                label: { en: 'Nothing was heard', fr: "Rien n'a été entendu" },
                detail: {
                  en: 'The recording produced no transcript.',
                  fr: "L'enregistrement n'a produit aucune transcription.",
                },
              },
            },
            {
              id: 'min_words',
              words: 100,
              verdict: {
                kind: 'zero',
                label: { en: 'Too short — "A1 non atteint"', fr: 'Trop court — « A1 non atteint »' },
                detail: {
                  en: 'A response too short to show the level is scored as not reaching A1, whatever its quality.',
                  fr: "Une réponse trop courte pour montrer le niveau est notée « A1 non atteint », quelle que soit sa qualité.",
                },
              },
            },
            {
              id: 'off_topic',
              minKeywordHits: 2,
              verdict: {
                kind: 'zero',
                label: { en: 'Off topic', fr: 'Hors sujet' },
                detail: {
                  en: 'Off-topic is one of the official automatic-zero triggers.',
                  fr: "Le hors-sujet fait partie des déclencheurs officiels du zéro automatique.",
                },
              },
            },
          ],
          topicKeywords: ['chauffage', 'appartement', 'réparation', 'quand', 'est-ce', 'pourquoi', 'combien'],
          signal: {
            kind: 'remote',
            adapter: 'speech_evaluate',
            endpoint: '/speech/evaluate',
            language: 'fr-CA',
            fields: { reference_text: '' },
          },
          judge: {
            kind: 'none',
            reason: {
              en: 'No judge scores the TCF speaking grid. The transcript and the acoustic measures above are real; the four criteria below are what an examiner would fill in, and they are empty.',
              fr: "Aucun correcteur n'évalue la grille d'expression orale du TCF. La transcription et les mesures acoustiques ci-dessus sont réelles ; les quatre critères ci-dessous sont ce qu'un examinateur remplirait, et ils sont vides.",
            },
          },
        },
        {
          id: 'tcf-eo-t3',
          skill: 'speaking',
          responseMode: 'audio',
          // "Expression d'un point de vue, sans préparation" — 4 min 30 for
          // TCF tout public, Québec and Canada. Manual, p. 19.
          //
          // 2 + 3.5 + 4.5 = 10 minutes of speaking, plus the 2 minutes of
          // preparation on tâche 2, is exactly the 12 minutes FEI publishes
          // for the épreuve. Unlike expression écrite, nothing here is
          // apportioned by us.
          name: { en: 'Tâche 3', fr: 'Tâche 3' },
          instruction: {
            en: 'Give and defend your point of view. About four and a half minutes, without preparation.',
            fr: "Exprimez et défendez votre point de vue. Environ quatre minutes trente, sans préparation.",
          },
          prompt: {
            en: 'Some people say that a city should be built for those who live in it, others that it should be built for those who work in it. What do you think? Give your view, support it, and say what you would answer to someone who disagreed.',
            fr: "Certains disent qu'une ville doit être conçue pour ceux qui l'habitent, d'autres pour ceux qui y travaillent. Qu'en pensez-vous ? Donnez votre avis, appuyez-le, et dites ce que vous répondriez à quelqu'un qui ne serait pas d'accord.",
          },
          prompts: [
            {
              id: 'tcf-eo-t3-p2',
              topicKeywords: ['employeur', 'employés', 'horaires', 'confiance', 'privée', 'résultat', 'contrôle', 'vie'],
              freshness: 'current',
              prompt: {
                en: "Give and defend your view on whether an employer may ask where and when employees work.",
                fr: "Certains pensent qu'un employeur peut demander où et quand ses employés travaillent ; d'autres estiment que cela ne le regarde pas tant que le travail est fait. Qu'en pensez-vous ? Donnez votre avis, appuyez-le, et dites ce que vous répondriez à quelqu'un qui ne serait pas d'accord.",
              },
            },
            {
              id: 'tcf-eo-t3-p3',
              topicKeywords: ['langue', 'parler', 'erreurs', 'maîtriser', 'apprendre', 'confiance', 'pratique', 'attendre'],
              freshness: 'current',
              prompt: {
                en: "Give and defend your view on whether it is better to speak a language badly at once or wait until you master it.",
                fr: "Certains disent qu'il vaut mieux parler une langue mal tout de suite ; d'autres qu'il faut attendre de la maîtriser un peu. Qu'en pensez-vous ? Donnez votre avis, appuyez-le, et dites ce que vous répondriez à quelqu'un qui ne serait pas d'accord.",
              },
            },
            {
              id: 'tcf-eo-t3-p4',
              topicKeywords: ['services', 'publics', 'ligne', 'guichet', 'internet', 'accès', 'numérique', 'personnes'],
              freshness: 'current',
              prompt: {
                en: "Give and defend your view on whether every public service should be available online.",
                fr: "Certains estiment que tous les services publics devraient être accessibles en ligne ; d'autres qu'un guichet où l'on parle à quelqu'un doit toujours exister. Qu'en pensez-vous ? Donnez votre avis, appuyez-le, et dites ce que vous répondriez à quelqu'un qui ne serait pas d'accord.",
              },
            },
          ],
          timeLimitSec: 270,
          preparationSec: 0,
          wordGuidance: { en: 'About four and a half minutes', fr: 'Environ quatre minutes trente' },
          scaleId: 'sur20',
          criteria: [
            { id: 'respect_consigne', label: { en: 'Compliance with the instruction', fr: 'Respect de la consigne' } },
            { id: 'capacite_argumenter', label: { en: 'Ability to argue a point of view', fr: 'Capacité à argumenter' } },
            { id: 'lexique', label: { en: 'Lexis', fr: 'Lexique' } },
            { id: 'morphosyntaxe', label: { en: 'Morphosyntax', fr: 'Morphosyntaxe' } },
          ],
          gate: [
            {
              id: 'empty',
              verdict: {
                kind: 'zero',
                label: { en: 'Nothing was heard', fr: "Rien n'a été entendu" },
                detail: {
                  en: 'The recording produced no transcript.',
                  fr: "L'enregistrement n'a produit aucune transcription.",
                },
              },
            },
            {
              id: 'min_words',
              words: 140,
              verdict: {
                kind: 'zero',
                label: { en: 'Too short — "A1 non atteint"', fr: 'Trop court — « A1 non atteint »' },
                detail: {
                  en: 'A response too short to show the level is scored as not reaching A1, whatever its quality.',
                  fr: "Une réponse trop courte pour montrer le niveau est notée « A1 non atteint », quelle que soit sa qualité.",
                },
              },
            },
            {
              id: 'off_topic',
              minKeywordHits: 2,
              verdict: {
                kind: 'zero',
                label: { en: 'Off topic', fr: 'Hors sujet' },
                detail: {
                  en: 'Off-topic is one of the official automatic-zero triggers.',
                  fr: "Le hors-sujet fait partie des déclencheurs officiels du zéro automatique.",
                },
              },
            },
          ],
          topicKeywords: ['ville', 'habitants', 'travail', 'pense', 'avis', 'parce', 'exemple'],
          signal: {
            kind: 'remote',
            adapter: 'speech_evaluate',
            endpoint: '/speech/evaluate',
            language: 'fr-CA',
            fields: { reference_text: '' },
          },
          judge: {
            kind: 'none',
            reason: {
              en: 'No judge scores the TCF speaking grid. The transcript and the acoustic measures above are real; the four criteria below are what an examiner would fill in, and they are empty.',
              fr: "Aucun correcteur n'évalue la grille d'expression orale du TCF. La transcription et les mesures acoustiques ci-dessus sont réelles ; les quatre critères ci-dessous sont ce qu'un examinateur remplirait, et ils sont vides.",
            },
          },
        },
      ],
    },
  ],
};
