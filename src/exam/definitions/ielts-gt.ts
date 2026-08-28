/**
 * IELTS General Training — data only.
 *
 * Nothing in this file is imported by the engine. The engine imports the
 * TYPES and receives this object; if anything here needed a code change to
 * work, the abstraction would be wrong.
 *
 * Sources and open items:
 * - Four writing criteria and the 0–9 band scale: official IELTS descriptors.
 * - Criterion scores are whole integers, as the Test Report Form reports
 *   them. A product showing "Grammar: 5.5" is recognisably not modelled on
 *   the real thing, so the scale declares step 1 rather than 0.5.
 * - Task 1 recommended time (20 min) and the 150-word minimum: official.
 * - The band→CLB rows below are the writing column of the IRCC equivalency
 *   table, reduced to integer band boundaries because this scale is integer.
 */
import type { ExamDefinition } from '../model/types';

export const IELTS_GT: ExamDefinition = {
  id: 'ielts-gt',
  name: { en: 'IELTS General Training', fr: 'IELTS General Training' },
  language: 'en',
  locale: 'en-GB',
  acceptedFor: {
    en: 'Canadian economic immigration, and skilled-migration routes that accept General Training.',
    fr: "Immigration économique canadienne et voies de migration qualifiée acceptant la version General Training.",
  },
  scales: [
    {
      id: 'band',
      label: { en: 'Band', fr: 'Bande' },
      min: 0,
      max: 9,
      step: 1,
      display: { prefix: { en: 'Band', fr: 'Bande' }, decimals: 0 },
    },
  ],
  benchmark: {
    system: 'CLB',
    bands: [
      { from: 8, level: 10 },
      { from: 7, level: 9 },
      { from: 6, level: 7 },
      { from: 5, level: 5 },
      { from: 4, level: 4 },
    ],
  },
  calibration: {
    // Accuracy against real Test Report Forms. Still zero: no official score
    // report has been collected and matched. The repeatability figure
    // recorded on the writing judge below is a different measurement and
    // does not count toward this gate.
    samples: 0,
    byLevel: {},
    mae: null,
    gate: {
      minSamples: 150,
      // The CLB range the product serves. A report at CLB 11 or 12 is
      // welcome and counts toward `samples`, but it is not required: nobody
      // at that level is asking whether they are ready to book.
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
      en: 'The CLB level this candidate would be awarded for this skill if they sat IELTS General Training now, estimated from their practice responses of the last 30 days.',
      fr: "Le niveau CLB que ce candidat obtiendrait pour cette compétence s'il passait l'IELTS General Training maintenant, estimé à partir de ses réponses d'entraînement des 30 derniers jours.",
    },
  },
  // What the Test Report Form prints: four band scores, all on the same
  // 4-9 band scale. Two of these four have nothing built behind them here,
  // and that is a fact about US, not about the candidate's document.
  awards: [
    { skill: 'listening', label: { en: 'Listening', fr: 'Compréhension orale' }, scaleId: 'band' },
    { skill: 'reading', label: { en: 'Reading', fr: 'Compréhension écrite' }, scaleId: 'band' },
    { skill: 'writing', label: { en: 'Writing', fr: 'Expression écrite' }, scaleId: 'band' },
    { skill: 'speaking', label: { en: 'Speaking', fr: 'Expression orale' }, scaleId: 'band' },
  ],
  sections: [
    {
      kind: 'production',
      id: 'writing',
      skill: 'writing',
      name: { en: 'Writing', fr: 'Expression écrite' },
      allowReplay: false,
      tasks: [
        {
          id: 'gt-w-t1',
          skill: 'writing',
          responseMode: 'text',
          name: { en: 'Task 1', fr: 'Task 1' },
          instruction: {
            en: 'Write a letter. You should spend about 20 minutes on this task. Write at least 150 words. You do NOT need to write any addresses.',
            fr: 'Rédigez une lettre. Consacrez environ 20 minutes à cette tâche. Écrivez au moins 150 mots.',
          },
          prompt: {
            en: 'You recently took a training course that was paid for by your employer. Write a letter to your manager. In your letter: say what the course was and when you took it, explain what you learned that you can use in your job, and suggest one change you would make if the course is offered again.',
            fr: "Vous avez récemment suivi une formation payée par votre employeur. Écrivez une lettre à votre responsable.",
          },
          timeLimitSec: 20 * 60,
          wordGuidance: { en: 'At least 150 words', fr: 'Au moins 150 mots' },
          scaleId: 'band',
          criteria: [
            { id: 'task', label: { en: 'Task Achievement', fr: 'Réalisation de la tâche' } },
            { id: 'coherence', label: { en: 'Coherence and Cohesion', fr: 'Cohérence et cohésion' } },
            { id: 'vocabulary', label: { en: 'Lexical Resource', fr: 'Étendue lexicale' } },
            { id: 'grammar', label: { en: 'Grammatical Range and Accuracy', fr: 'Morphosyntaxe' } },
          ],
          gate: [
            {
              id: 'empty',
              verdict: {
                kind: 'zero',
                label: { en: 'Nothing submitted', fr: 'Aucune réponse remise' },
                detail: { en: 'An empty response cannot be marked.', fr: 'Une réponse vide ne peut pas être corrigée.' },
              },
            },
            {
              id: 'min_words',
              words: 150,
              verdict: {
                kind: 'penalty',
                label: { en: 'Under the word minimum', fr: 'Sous le minimum de mots' },
                detail: {
                  en: 'IELTS penalises responses under 150 words. The penalty applies regardless of how good the English is.',
                  fr: "IELTS pénalise les réponses de moins de 150 mots, quelle que soit la qualité de la langue.",
                },
              },
            },
            {
              id: 'prompt_copy',
              maxOverlapRatio: 0.55,
              verdict: {
                kind: 'penalty',
                label: { en: 'Copied from the prompt', fr: 'Recopié de la consigne' },
                detail: {
                  en: 'Words lifted from the question are discounted from the word count and read as avoidance of the task.',
                  fr: "Les mots repris de la consigne sont retirés du décompte et lus comme un évitement de la tâche.",
                },
              },
            },
            {
              id: 'template_ratio',
              maxRatio: 0.35,
              verdict: {
                kind: 'warn',
                label: { en: 'Heavy use of supplied scaffolding', fr: 'Recours important à la trame fournie' },
                detail: {
                  en: 'More than a third of this response is structure SELM gave you. A practice score inflated by scaffolding is not a score you can defend in the exam room.',
                  fr: "Plus d'un tiers de cette réponse est la structure fournie par SELM. Une note gonflée par la trame n'est pas défendable le jour de l'examen.",
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
                  en: 'A response that does not address the question is marked against the task it was set, not the one it answers.',
                  fr: "Une réponse qui ne traite pas la consigne est corrigée par rapport à la tâche demandée.",
                },
              },
            },
          ],
          topicKeywords: ['course', 'training', 'manager', 'employer', 'learned', 'job', 'change', 'letter'],
          suppliedScaffold: [
            'Dear Sir or Madam, I am writing to',
            'I would like to explain that',
            'The main thing I learned was',
            'If the course is offered again, I would suggest',
            'Thank you for your time and consideration. Yours faithfully,',
          ],
          judge: {
            kind: 'remote',
            adapter: 'writing_assess',
            endpoint: '/writing/assess',
            // Exam data, not a code constant. The bound assessor takes a
            // task_type of chat-writing | essay-writing | short-writing and
            // marks against a different expectation for each. A 150-word
            // Task 1 letter is short-writing; a 250-word Task 2 essay is
            // essay-writing. It was hard-coded in the backend until
            // 2026-08-25, which meant every task in every exam was silently
            // marked as the same kind of writing.
            payload: { writing_type: 'letter', task_type: 'short-writing' },
            // The bound judge is a general writing assessor answering 0-100.
            // It is not an IELTS examiner and it has never seen a Test Report
            // Form, so its numbers are reported on its own scale.
            judgeScale: {
              id: 'writing_assess_100',
              label: { en: 'General writing assessor, 0-100', fr: 'Correcteur général, 0-100' },
              min: 0,
              max: 100,
              step: 1,
              display: { suffix: { en: '/ 100', fr: '/ 100' }, decimals: 0 },
            },
            toExamScale: {
              kind: 'none',
              reason: {
                en: 'These are the assessor\u2019s own numbers out of 100. They are not IELTS bands and are not converted into any, because no mapping between the two has been measured against real Test Report Forms.',
                fr: "Ce sont les notes propres du correcteur sur 100. Ce ne sont pas des bandes IELTS et elles n\u2019y sont pas converties, faute d\u2019une correspondance mesur\u00e9e sur de vraies attestations.",
              },
            },
            // This exam does report a band scale, so the judge may return
            // one. TCF and TEF do not, and their bindings leave this false.
            reportsBand: true,
            // Asked twice on purpose: the spread between two answers to the
            // same text is reported rather than averaged away.
            samples: 2,
            stability: {
              measuredAt: '2026-08-25',
              // Read through `readStability`, which returns `unknown` past
              // this window rather than quoting the numbers below. They were
              // measured on the 25th and this judge was observed behaving
              // differently on the 27th.
              validForDays: 30,
              responses: 5,
              callsPerResponse: 10,
              scaleId: 'writing_assess_100',
              worstOverallSpread: 5,
              worstCriterionSpread: 11,
              note: {
                en: 'Fifty identical calls, ten each over five English responses written to span weak to very strong. Four of the five returned the same overall value on all ten calls; the fifth moved 5 points. The worst single criterion moved 11 points on the judge\u2019s 0\u2013100 scale. This is the judge agreeing with itself. It is not evidence that it agrees with an examiner, and no such measurement exists yet.',
                fr: "Cinquante appels identiques, dix par r\u00e9ponse sur cinq r\u00e9ponses anglaises couvrant du faible au tr\u00e8s fort. Quatre r\u00e9ponses sur cinq ont re\u00e7u la m\u00eame note globale aux dix appels ; la cinqui\u00e8me a vari\u00e9 de 5 points. Le pire crit\u00e8re isol\u00e9 a vari\u00e9 de 11 points sur l\u2019\u00e9chelle 0\u2013100 du correcteur. Cela mesure l\u2019accord du correcteur avec lui-m\u00eame, pas avec un examinateur.",
              },
            },
          },
        },
      ],
    },
    {
      kind: 'production',
      id: 'speaking',
      skill: 'speaking',
      name: { en: 'Speaking', fr: 'Expression orale' },
      allowReplay: false,
      tasks: [
        {
          id: 'gt-s-p2',
          skill: 'speaking',
          responseMode: 'audio',
          name: { en: 'Part 2', fr: 'Part 2' },
          instruction: {
            en: 'You have one minute to think about what you are going to say. Then speak for one to two minutes.',
            fr: "Vous avez une minute pour préparer, puis parlez pendant une à deux minutes.",
          },
          prompt: {
            en: 'Describe a skill you learned that turned out to be more useful than you expected. You should say: what the skill is, how and when you learned it, why you did not expect it to be useful, and explain how you have used it since.',
            fr: "Décrivez une compétence que vous avez apprise et qui s'est révélée plus utile que prévu.",
          },
          timeLimitSec: 120,
          wordGuidance: { en: 'Speak for one to two minutes', fr: 'Parlez une à deux minutes' },
          scaleId: 'band',
          criteria: [
            // The four official IELTS SPEAKING criteria. Note the fourth:
            // Speaking is marked on Pronunciation, not on Task Response.
            // Task Response is a Writing criterion, and listing it here — as
            // the backend's own examiner prompt still does — asks for a mark
            // the test does not award.
            { id: 'fluency_coherence', label: { en: 'Fluency and Coherence', fr: 'Aisance et cohérence' } },
            { id: 'lexical_resource', label: { en: 'Lexical Resource', fr: 'Étendue lexicale' } },
            { id: 'grammar_accuracy', label: { en: 'Grammatical Range and Accuracy', fr: 'Morphosyntaxe' } },
            { id: 'pronunciation', label: { en: 'Pronunciation', fr: 'Prononciation' } },
          ],
          gate: [
            {
              id: 'empty',
              verdict: {
                kind: 'zero',
                label: { en: 'Nothing was heard', fr: "Rien n'a été entendu" },
                detail: {
                  en: 'The recording produced no transcript. An examiner scores what was said, and nothing was.',
                  fr: "L'enregistrement n'a produit aucune transcription.",
                },
              },
            },
            {
              id: 'min_words',
              words: 90,
              verdict: {
                kind: 'penalty',
                label: { en: 'Too short for the task', fr: 'Trop court pour la tâche' },
                detail: {
                  en: 'A Part 2 answer that stops early gives the examiner too little language to place at the higher bands.',
                  fr: "Une réponse qui s'arrête trop tôt ne donne pas assez de matière pour les bandes supérieures.",
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
                  en: 'Task Response is scored against the cue card that was set, not the one that was answered.',
                  fr: "La réalisation de la tâche est évaluée par rapport à la consigne donnée.",
                },
              },
            },
          ],
          topicKeywords: ['skill', 'learned', 'useful', 'expected', 'used'],
          // One upload, two uses: the transcript and the acoustic measures
          // are the signal layer, and the band block in the same payload is
          // the judge.
          signal: {
            kind: 'remote',
            adapter: 'speech_evaluate',
            endpoint: '/speech/evaluate',
            language: 'en-US',
            fields: { mode: 'ielts', reference_text: '' },
          },
          judge: {
            kind: 'from_signal',
            adapter: 'ielts_speaking',
            judgeScale: {
              id: 'band',
              label: { en: 'IELTS band, single automated examiner', fr: 'Bande IELTS, un seul correcteur automatique' },
              min: 0,
              max: 9,
              step: 1,
              display: { prefix: { en: 'Band', fr: 'Bande' }, decimals: 0 },
            },
            toExamScale: {
              kind: 'none',
              reason: {
                en: 'One automated examiner, asked once, with no measurement of its error against a real Test Report Form. The bands are on the exam\u2019s scale but they are not a calibrated prediction of it.',
                fr: "Un seul correcteur automatique, interrog\u00e9 une fois, sans mesure de son erreur face \u00e0 une vraie attestation.",
              },
            },
          },
        },
      ],
    },
  ],
};
