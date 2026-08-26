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
 * - The score→NCLC rows below are recorded as UNVERIFIED against a primary
 *   source. They are used to render the target line only, and no predicted
 *   score is published for this exam, so nothing user-facing rests on them
 *   yet. Verify before that changes.
 * - Tâche 1 timing is taken as a third of the 60-minute épreuve. The exact
 *   per-tâche split is an open item and is marked as such in the UI.
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
  ],
  benchmark: {
    system: 'NCLC',
    bands: [
      { from: 16, level: 10 },
      { from: 14, level: 9 },
      { from: 12, level: 8 },
      { from: 10, level: 7 },
      { from: 9, level: 6 },
      { from: 7, level: 5 },
      { from: 6, level: 4 },
    ],
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
      tasks: [
        {
          id: 'tcf-ee-t1',
          skill: 'writing',
          responseMode: 'text',
          // NUMBERS UNVERIFIED, 2026-08-27. The file header claims every
          // figure is taken from the published specification. These were
          // not: France Éducation international's site returns ERR-BOT-403
          // to this network, and every other source for TCF word bands is a
          // commercial preparation site — which this project has already
          // ruled out as authoritative for French, in step 05.
          //
          // 60/120 and 15 minutes are plausible and unconfirmed. Someone
          // with a browser should read the specification and either confirm
          // them or correct them. Flagged rather than left to look sourced.
          name: { en: 'Tâche 1', fr: 'Tâche 1' },
          instruction: {
            en: 'Write a short message. 60 to 120 words.',
            fr: "Rédigez un message. De 60 à 120 mots.",
          },
          prompt: {
            en: 'You have just finished a training course paid for by your employer. Write a message to your colleagues describing the course and what you learned.',
            fr: "Vous venez de terminer une formation payée par votre employeur. Vous écrivez un message à vos collègues pour décrire cette formation et expliquer ce que vous avez appris.",
          },
          timeLimitSec: 15 * 60,
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
          id: 'tcf-ee-t3',
          skill: 'writing',
          responseMode: 'text',
          // NUMBERS UNVERIFIED. See the note on tcf-ee-t1: the word band and
          // the time below could not be checked against France Éducation
          // international, whose site refuses this network. Treat both as
          // placeholders until someone reads the published specification.
          name: { en: 'Tâche 3', fr: 'Tâche 3' },
          instruction: {
            en: 'Compare the two documents below and give your own reasoned opinion. 120 to 180 words.',
            fr: "Comparez les deux documents ci-dessous et donnez votre avis argumenté. De 120 à 180 mots.",
          },
          prompt: {
            en: 'Document 1 — a municipal notice announcing that the town centre will be closed to cars on Saturdays, to reduce pollution and make room for markets and cycling.\n\nDocument 2 — a letter from a shopkeepers\u2019 association arguing that the closure will cut takings, that deliveries have nowhere to stop, and that customers with reduced mobility will stay away.\n\nCompare the two positions and give your own reasoned opinion.',
            fr: "Document 1 — un avis municipal annonçant la fermeture du centre-ville aux voitures le samedi, afin de réduire la pollution et de laisser la place aux marchés et au vélo.\n\nDocument 2 — une lettre d'une association de commerçants soutenant que cette fermeture fera baisser le chiffre d'affaires, que les livraisons n'auront plus où s'arrêter, et que la clientèle à mobilité réduite ne viendra plus.\n\nComparez les deux positions et donnez votre avis argumenté.",
          },
          timeLimitSec: 25 * 60,
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
      ],
    },
  ],
};
