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
import { IELTS_LISTENING } from './ielts-listening';

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
      // CORRECTED 2026-08-28 against a real Test Report Form: IELTS reports
      // HALF BANDS. The form read carried 4.5, 6.5 and an overall 5.5.
      //
      // `step: 1` with `decimals: 0` was worse than a validation error — a
      // candidate entering their real 6.5 would have seen it rendered as
      // "Band 7", one whole band above what they were awarded, on the screen
      // that exists to tell them what they were awarded.
      step: 0.5,
      display: { prefix: { en: 'Band', fr: 'Bande' }, decimals: 1 },
      // IELTS's own CEFR reading of a band, verified against eight overall
      // bands printed on real Test Report Forms from 2015 to 2024 — all
      // agree. Applied per skill on IELTS's own authority: a UKVI form in
      // the corpus prints a CEFR cell beside EACH of the four bands.
      // See `ielts-variants.ts`.
      cefrBands: [
        { from: 8.5, cefr: 'C2' },
        { from: 7.0, cefr: 'C1' },
        { from: 5.5, cefr: 'B2' },
        { from: 4.5, cefr: 'B1' },
        { from: 3.5, cefr: 'A2' },
        { from: 3.0, cefr: 'A1' },
      ],
    },
  ],
  benchmark: {
    system: 'CLB',
    // REPLACED 2026-08-28. The table that was here had one set of bands for
    // all four skills, and it was wrong twice over.
    //
    // First, IRCC's IELTS (General Training) equivalency chart converts EACH
    // SKILL DIFFERENTLY. A 6.5 is CLB 8 in reading, writing and speaking and
    // CLB 7 in listening, because listening needs 7.5 for CLB 8. One table
    // cannot express that, which is why `bySkill` now exists.
    //
    // Second, the old table could not emit CLB 6 or CLB 8 AT ALL — it ran
    // 4, 5, 7, 9, 10 — so no IELTS candidate could ever be told they were at
    // CLB 8, which is the level that carries the CRS points, or CLB 6.
    //
    // Checked against a real Test Report Form: of its four skills the old
    // table got two right and two wrong. Reading 4.5 came out CLB 4 instead
    // of 5; Speaking 6.5 came out CLB 7 instead of 8.
    //
    // Source: IRCC, "Language test equivalency charts",
    // canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/
    // operational-bulletins-manuals/standard-requirements/language-requirements/
    // test-equivalency-charts.html — fetched twice, from two pages, agreeing.
    // CLB 10 is the chart's top row; the chart shows 10+ as a range to 9.0.
    bands: [
      { from: 7.5, level: 10 },
      { from: 7.0, level: 9 },
      { from: 6.5, level: 8 },
      { from: 6.0, level: 7 },
      { from: 5.5, level: 6 },
      { from: 5.0, level: 5 },
      { from: 4.0, level: 4 },
    ],
    bySkill: {
      listening: [
        { from: 8.5, level: 10 },
        { from: 8.0, level: 9 },
        { from: 7.5, level: 8 },
        { from: 6.0, level: 7 },
        { from: 5.5, level: 6 },
        { from: 5.0, level: 5 },
        { from: 4.5, level: 4 },
      ],
      reading: [
        { from: 8.0, level: 10 },
        { from: 7.0, level: 9 },
        { from: 6.5, level: 8 },
        { from: 6.0, level: 7 },
        { from: 5.0, level: 6 },
        { from: 4.0, level: 5 },
        { from: 3.5, level: 4 },
      ],
      writing: [
        { from: 7.5, level: 10 },
        { from: 7.0, level: 9 },
        { from: 6.5, level: 8 },
        { from: 6.0, level: 7 },
        { from: 5.5, level: 6 },
        { from: 5.0, level: 5 },
        { from: 4.0, level: 4 },
      ],
      speaking: [
        { from: 7.5, level: 10 },
        { from: 7.0, level: 9 },
        { from: 6.5, level: 8 },
        { from: 6.0, level: 7 },
        { from: 5.5, level: 6 },
        { from: 5.0, level: 5 },
        { from: 4.0, level: 4 },
      ],
    },
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
      sets: {
        tasks: 2,
        source: 'ielts.org — General Training Writing: 2 tasks in 60 minutes (a letter of at least 150 words, an essay of at least 250).',
      },
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
        {
          id: 'gt-w-t2',
          skill: 'writing',
          responseMode: 'text',
          name: { en: 'Task 2', fr: 'Task 2' },
          instruction: {
            en: 'Write an essay. You should spend about 40 minutes on this task. Write at least 250 words. Give reasons for your answer and include relevant examples from your own knowledge or experience.',
            fr: 'Rédigez un essai. Consacrez environ 40 minutes à cette tâche. Écrivez au moins 250 mots.',
          },
          prompt: {
            en: 'Some people think that new arrivals to a country should adopt the customs and traditions of that country. Others think they should be free to keep their own way of life. Discuss both views and give your own opinion.',
            fr: "Certains pensent que les nouveaux arrivants dans un pays devraient adopter ses coutumes et traditions ; d'autres pensent qu'ils devraient rester libres de garder leur propre mode de vie. Discutez des deux points de vue et donnez votre opinion.",
          },
          timeLimitSec: 40 * 60,
          wordGuidance: { en: 'At least 250 words', fr: 'Au moins 250 mots' },
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
              words: 250,
              verdict: {
                kind: 'penalty',
                label: { en: 'Under the word minimum', fr: 'Sous le minimum de mots' },
                detail: {
                  en: 'IELTS penalises Task 2 responses under 250 words. The penalty applies regardless of how good the English is.',
                  fr: "IELTS pénalise les réponses de moins de 250 mots, quelle que soit la qualité de la langue.",
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
          topicKeywords: ['customs', 'traditions', 'country', 'opinion', 'view', 'adopt', 'keep', 'because'],
          suppliedScaffold: [
            'There are arguments on both sides of this issue.',
            'On the one hand,',
            'On the other hand,',
            'In my opinion,',
            'In conclusion,',
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
            payload: { writing_type: 'essay', task_type: 'essay-writing' },
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
      sets: {
        tasks: 3,
        source: 'ielts.org — Speaking: 3 parts, 11 to 14 minutes, face to face with an examiner.',
      },
      skill: 'speaking',
      name: { en: 'Speaking', fr: 'Expression orale' },
      allowReplay: false,
      tasks: [
        {
          id: 'gt-s-p1',
          skill: 'speaking',
          responseMode: 'audio',
          name: { en: 'Part 1', fr: 'Part 1' },
          instruction: {
            en: 'The examiner asks about familiar topics. Answer each question in one or two sentences — naturally, not in a single word.',
            fr: "L'examinateur pose des questions sur des sujets familiers. Répondez à chacune par une ou deux phrases.",
          },
          prompt: {
            en: 'Let us talk about where you live. Where is your home, and what do you like about it? Would you like to live somewhere else in the future? Do you prefer mornings or evenings, and why?',
            fr: "Parlons de l'endroit où vous vivez. Où se trouve votre domicile et qu'aimez-vous à son sujet ? Aimeriez-vous vivre ailleurs à l'avenir ? Préférez-vous le matin ou le soir, et pourquoi ?",
          },
          timeLimitSec: 90,
          wordGuidance: { en: 'Answer each question in a sentence or two', fr: 'Répondez par une ou deux phrases' },
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
              words: 30,
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
          topicKeywords: ['home', 'live', 'like', 'future', 'morning', 'evening', 'prefer'],
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
        {
          id: 'gt-s-p3',
          skill: 'speaking',
          responseMode: 'audio',
          name: { en: 'Part 3', fr: 'Part 3' },
          instruction: {
            en: 'A two-way discussion of more abstract questions linked to your Part 2 topic. Develop each answer with a reason and an example.',
            fr: "Une discussion à deux sur des questions plus abstraites liées au sujet de la partie 2. Développez chaque réponse avec une raison et un exemple.",
          },
          prompt: {
            en: 'Let us consider skills in general. Why do some skills grow more valuable over time while others fade? Should schools teach practical skills or focus on knowledge? How might the skills people need change over the next twenty years?',
            fr: "Considérons les compétences en général. Pourquoi certaines prennent-elles de la valeur avec le temps tandis que d'autres disparaissent ? L'école devrait-elle enseigner des compétences pratiques ou se concentrer sur les savoirs ? Comment les compétences nécessaires pourraient-elles évoluer dans les vingt prochaines années ?",
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
          topicKeywords: ['skills', 'valuable', 'time', 'schools', 'teach', 'knowledge', 'change', 'future'],
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
    IELTS_LISTENING,
    {
      kind: 'comprehension',
      id: 'reading',
      sets: {
        questions: 40,
        source: 'ielts.org — General Training Reading: 40 questions in 60 minutes, three sections rising in difficulty.',
      },
      skill: 'reading',
      name: { en: 'Reading', fr: 'Compréhension écrite' },
      // Published: 60 minutes, 40 questions, three sections rising in difficulty.
      timeLimitSec: 60 * 60,
      scaleId: 'band',
      delivery: {
        audioPlaysOnce: false,
        questionAfterAudio: false,
        transcriptDuringSection: false,
        presentation: 'all_at_once',
        clock: 'section',
        answersLockedOnAnswer: false,
        feedbackDuringSection: false,
      },
      // A SEED bank, not the full 40. Every item was written for this product
      // to the GT format and reproduces no real exam question; the CEFR banding
      // and the family assignment are OURS and are UNREVIEWED. It exists so the
      // skill is real — it appears on Today, in the mock exam and in the plan —
      // rather than absent; it is meant to be grown by the same generate-and-
      // review pipeline the French bank uses.
      serve: { count: 6, byBand: { A1: 1, A2: 1, B1: 1, B2: 1, C1: 1, C2: 1 } },
      provenance: {
        en: 'Seed bank written for this product to the IELTS General Training reading format; no real exam question is reproduced. CEFR banding and family assignment are ours and are unreviewed.',
        fr: "Banque initiale rédigée pour ce produit selon le format IELTS General Training ; aucune question réelle n'est reproduite. Le classement CECRL et l'affectation aux familles sont les nôtres et non relus.",
      },
      families: [
        { id: 'notice', label: { en: 'Notice or instruction', fr: 'Avis ou consigne' },
          describes: { en: 'A sign, label or short notice. What is tested is doing exactly what it says.', fr: "Un panneau, une étiquette ou un avis court. Ce qui est testé, c'est de faire exactement ce qui est écrit." },
          provenance: { en: 'Family names follow the GT reading text types; item assignment is ours and unreviewed.', fr: "Les familles suivent les types de textes du GT ; l'affectation est la nôtre et non relue." } },
        { id: 'correspondence', label: { en: 'Letter, email or message', fr: 'Correspondance' },
          describes: { en: 'Someone writing to someone. What is tested is the intention behind the words.', fr: "Quelqu'un qui écrit à quelqu'un. Ce qui est testé, c'est l'intention derrière les mots." },
          provenance: { en: 'As above.', fr: 'Comme ci-dessus.' } },
        { id: 'informative', label: { en: 'Informative text', fr: 'Texte informatif' },
          describes: { en: 'A factual passage. What is tested is finding a fact stated once among facts not asked about.', fr: "Un passage factuel. Ce qui est testé, c'est de retrouver un fait énoncé une seule fois." },
          provenance: { en: 'As above.', fr: 'Comme ci-dessus.' } },
        { id: 'argued', label: { en: 'Argued text', fr: 'Texte argumentatif' },
          describes: { en: 'A text that takes a position. What is tested is separating what the author asserts from what the author reports.', fr: "Un texte qui prend position. Ce qui est testé, c'est de distinguer ce que l'auteur affirme de ce qu'il rapporte." },
          provenance: { en: 'As above.', fr: 'Comme ci-dessus.' } },
      ],
      recordings: [
        {
          id: "gt-r-01-r",
          level: 'A1',
          family: 'notice',
          script: 'STAFF ONLY. This door is for employees. Customers, please use the main entrance on Oak Street.',
        },
        {
          id: "gt-r-02-r",
          level: 'A2',
          family: 'correspondence',
          script: "Hi Sam, I can't make lunch on Tuesday after all - something came up at work. Could we move it to Thursday? Same place is fine. Sorry! - Alex",
        },
        {
          id: "gt-r-03-r",
          level: 'B1',
          family: 'informative',
          script: 'The city library now opens at 8 a.m. on weekdays, an hour earlier than before. Weekend hours are unchanged. The later closing time of 9 p.m., introduced last year, remains in place.',
        },
        {
          id: "gt-r-04-r",
          level: 'B2',
          family: 'argued',
          script: 'Supporters of the new bypass say it will cut traffic in the town centre. Critics counter that similar roads elsewhere simply filled with new cars within a few years, leaving the centre as congested as before. The council has promised a review after eighteen months.',
        },
        {
          id: "gt-r-05-r",
          level: 'C1',
          family: 'informative',
          script: 'The report notes that remote work has raised productivity for tasks done alone, but adds a caveat: the same teams said that spontaneous problem-solving - the kind that once happened in a corridor - had become markedly rarer, and harder to replace with scheduled calls.',
        },
        {
          id: "gt-r-06-r",
          level: 'C2',
          family: 'argued',
          script: 'One might, of course, applaud the ministry for finally publishing the figures - were it not that the figures cover only the years in which the policy happened to succeed, and stop precisely where the awkward questions begin.',
        },
      ],
      items: [
        {
          id: 'gt-r-01',
          recordingId: "gt-r-01-r",
          level: 'A1',
          stem: 'Who may use this door?',
          options: ['Anyone carrying shopping bags into the store', 'Customers looking for the main entrance', 'People who work here', 'Visitors who arrive after the shop has closed'],
          answer: 2,
          rationale: 'The notice restricts the door to employees; the longest options are the distractors.',
        },
        {
          id: 'gt-r-02',
          recordingId: "gt-r-02-r",
          level: 'A2',
          stem: 'What does Alex want to do?',
          options: ['Cancel the lunch with Sam altogether because of work', 'Change the day of the lunch', 'Choose a different restaurant for Tuesday', 'Explain why lunch on Thursday is impossible'],
          answer: 1,
          rationale: 'Alex proposes moving the day, not cancelling; the key is the shortest option.',
        },
        {
          id: 'gt-r-03',
          recordingId: "gt-r-03-r",
          level: 'B1',
          stem: 'What has changed recently?',
          options: ['The library now opens at eight in the morning every day of the week', 'The library opens earlier on weekdays', 'Weekend opening hours have been made longer', 'The library has started closing later than the year before'],
          answer: 1,
          rationale: 'Only the weekday opening changed recently; the later closing was last year and weekends are unchanged.',
        },
        {
          id: 'gt-r-04',
          recordingId: "gt-r-04-r",
          level: 'B2',
          stem: 'What do the critics claim?',
          options: ['The town centre is already as congested as it could ever possibly become', 'New roads tend to fill with extra traffic over time', 'The bypass will succeed in cutting traffic in the centre', 'The council was right to promise a review'],
          answer: 1,
          rationale: 'The critics say new roads induce new traffic; the other options belong to supporters, the council, or misread the text.',
        },
        {
          id: 'gt-r-05',
          recordingId: "gt-r-05-r",
          level: 'C1',
          stem: 'What qualification does the report add?',
          options: ['Productivity fell across every single kind of task that the teams performed', 'Unplanned collaboration became rarer and hard to replace', 'Scheduled calls fully replaced the corridor conversations', 'Remote work raised productivity for solitary tasks'],
          answer: 1,
          rationale: 'The caveat is about lost spontaneous collaboration; the last option is the uncaveated first point, and the longest option is false.',
        },
        {
          id: 'gt-r-06',
          recordingId: "gt-r-06-r",
          level: 'C2',
          stem: "What is the writer's attitude to the ministry?",
          options: ['Genuinely appreciative that the long-awaited figures were at last released', 'Critical, because the published figures are conveniently selective', 'Neutral, merely recording that some figures were released', 'Confident the awkward questions will shortly be answered too'],
          answer: 1,
          rationale: 'The concessive "were it not that" signals irony; the surface praise (longest option) is undercut.',
        },
      ],
    },
  ],
};

/**
 * The listening section is now in this exam — see `ielts-listening.ts`.
 *
 * It was missing until 29 August 2026, and the reason was worth recording:
 * the narrator was expected to be the last blocker and was not. The blocker
 * was the ITEM MODEL. `ComprehensionItem` could express only four options and
 * a key, which is faithful to the TCF compréhension orale and is not faithful
 * to IELTS Listening, where most questions are typed, capped at three words,
 * and marked for spelling.
 *
 * Forty multiple-choice questions labelled *IELTS Listening* would have been a
 * substitute for the exam's own task — the thing this codebase removed from
 * all four skills that same morning, minus the "extra practice" label that
 * made those removals arguable.
 *
 * So the format was built first: a discriminated union with `choice`,
 * `completion` and `matching`; an answer RULE that is a whitelist and refuses
 * to be generous; a typed response carried through the store and the results
 * view; and both kinds scored side by side. Then the bank was written to it.
 *
 * The constant that used to live here said the section was blocked. It is
 * removed rather than set to false, because a flag that says "no longer true"
 * is a thing future readers have to reason about, and the section itself is
 * now the answer.
 */
export const IELTS_LISTENING_SECTION_ID = 'listening';
