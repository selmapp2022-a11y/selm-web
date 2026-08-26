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
    },
    {
      id: 'ce699',
      label: { en: 'Reading score', fr: 'Score de compréhension écrite' },
      min: 100,
      max: 699,
      step: 1,
      display: { suffix: { en: '/ 699', fr: '/ 699' }, decimals: 0 },
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
  sections: [
    {
      id: 'expression-ecrite',
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
              maxOverlapRatio: 0.5,
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
              maxRatio: 0.2,
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
              maxOverlapRatio: 0.5,
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
              maxRatio: 0.2,
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
              maxLiftedRun: 14,
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
      id: 'expression-orale',
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
              minKeywordHits: 1,
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
          topicKeywords: ['je', 'suis', 'travaille', 'français', 'appelle'],
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
