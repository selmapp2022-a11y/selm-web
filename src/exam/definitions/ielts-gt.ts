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
          prompts: [
            {
              id: 'gt-w-t1-p2',
              topicKeywords: ['furniture', 'ordered', 'damaged', 'delivery', 'refund', 'replacement', 'company', 'broken'],
              freshness: 'current',
              prompt: {
                en: "You ordered a piece of furniture online and it arrived damaged. Write a letter to the company. In your letter: describe what you ordered and when it arrived, explain what is wrong with it, and say what you would like the company to do.",
                fr: "Vous avez commandé un meuble en ligne et il est arrivé abîmé. Écrivez une lettre à l'entreprise.",
              },
            },
            {
              id: 'gt-w-t1-p3',
              topicKeywords: ['neighbour', 'flat', 'keys', 'plants', 'post', 'away', 'weeks', 'contact'],
              freshness: 'current',
              prompt: {
                en: "A neighbour has agreed to look after your flat while you are away for three weeks. Write a letter to your neighbour. In your letter: thank them and explain what needs doing, say where they will find what they need, and tell them how to reach you if something goes wrong.",
                fr: "Un voisin a accepté de s'occuper de votre appartement pendant trois semaines. Écrivez-lui une lettre.",
              },
            },
            {
              id: 'gt-w-t1-p4',
              topicKeywords: ['clash', 'hours', 'timetable', 'schedule', 'miss', 'overtime', 'permission', 'evening'],
              freshness: 'current',
              prompt: {
                en: "You have been offered a place on a course that clashes with your working hours. Write a letter to your employer. In your letter: explain what the course is and why you want to do it, describe the clash, and propose a way of making up the hours you would miss.",
                fr: "On vous propose une place dans une formation qui chevauche vos heures de travail. Écrivez une lettre à votre employeur.",
              },
            },
          ],
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
          prompts: [
            {
              id: 'gt-w-t2-p2',
              topicKeywords: ['older', 'retirement', 'workforce', 'younger', 'pension', 'age', 'experience', 'jobs'],
              freshness: 'current',
              prompt: {
                en: "In many countries people are working later in life than they used to. Some see this as a benefit to society; others believe it prevents younger people from entering the workforce. Discuss both views and give your own opinion.",
                fr: "Dans de nombreux pays, on travaille plus tard qu'avant. Discutez des deux points de vue et donnez le vôtre.",
              },
            },
            {
              id: 'gt-w-t2-p3',
              topicKeywords: ['buildings', 'heritage', 'housing', 'preserving', 'historic', 'homes', 'restore', 'money'],
              freshness: 'current',
              prompt: {
                en: "Some people believe that public money should be spent on preserving old buildings. Others argue that it should go towards new housing instead. Discuss both views and give your own opinion.",
                fr: "Faut-il dépenser l'argent public pour conserver les bâtiments anciens ou pour construire des logements ? Discutez des deux points de vue et donnez le vôtre.",
              },
            },
            {
              id: 'gt-w-t2-p4',
              topicKeywords: ['supervision', 'independently', 'teamwork', 'colleagues', 'employee', 'alone', 'together', 'quality'],
              freshness: 'current',
              prompt: {
                en: "Some think the ability to work without supervision is the most important quality an employee can have. Others believe that working well with other people matters more. Discuss both views and give your own opinion.",
                fr: "L'autonomie ou le travail en équipe : quelle qualité compte le plus chez un employé ? Discutez des deux points de vue et donnez le vôtre.",
              },
            },
          ],
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
          prompts: [
            {
              id: 'gt-s-p1-p2',
              topicKeywords: ['eat', 'cook', 'dish', 'meal', 'restaurant', 'food', 'week', 'recipe'],
              freshness: 'current',
              prompt: {
                en: "Let us talk about food. What do you usually eat during the week? Is there a dish you have learned to cook recently? Do you prefer eating at home or eating out, and why?",
                fr: "Parlons de la nourriture : ce que vous mangez en semaine, un plat appris récemment, et si vous préférez manger chez vous ou au restaurant.",
              },
            },
            {
              id: 'gt-s-p1-p3',
              topicKeywords: ['travel', 'bus', 'train', 'walk', 'car', 'journey', 'town', 'commute'],
              freshness: 'current',
              prompt: {
                en: "Let us talk about getting around. How do you usually travel in your town? Has that changed in the last few years? Is there a journey you make often that you enjoy?",
                fr: "Parlons des déplacements : comment vous circulez, ce qui a changé, et un trajet fréquent que vous aimez.",
              },
            },
            {
              id: 'gt-s-p1-p4',
              topicKeywords: ['free', 'afternoon', 'hobby', 'interests', 'friends', 'alone', 'younger', 'relax'],
              freshness: 'current',
              prompt: {
                en: "Let us talk about your free time. What do you do when you have an afternoon with nothing planned? Have your interests changed since you were younger? Do you prefer doing things alone or with other people?",
                fr: "Parlons du temps libre : un après-midi sans rien de prévu, l'évolution de vos centres d'intérêt, seul ou avec d'autres.",
              },
            },
          ],
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
          prompts: [
            {
              id: 'gt-s-p2-p2',
              topicKeywords: ['place', 'quiet', 'think', 'park', 'calm', 'suits', 'often', 'go'],
              freshness: 'current',
              prompt: {
                en: "Describe a place you go to when you want to think. You should say: where it is, how often you go there, what you do while you are there, and explain why it suits you better than other places.",
                fr: "Décrivez un endroit où vous allez pour réfléchir : où il est, à quelle fréquence, ce que vous y faites, et pourquoi il vous convient mieux qu'un autre.",
              },
            },
            {
              id: 'gt-s-p2-p3',
              topicKeywords: ['object', 'replace', 'own', 'difficult', 'gave', 'value', 'keep', 'use'],
              freshness: 'current',
              prompt: {
                en: "Describe an object you own that would be difficult to replace. You should say: what it is, how you came to have it, how you use it, and explain what makes replacing it difficult.",
                fr: "Décrivez un objet difficile à remplacer : ce que c'est, comment vous l'avez eu, comment vous l'utilisez, et pourquoi le remplacer serait difficile.",
              },
            },
            {
              id: 'gt-s-p2-p4',
              topicKeywords: ['believed', 'changed', 'mind', 'happened', 'wrong', 'opinion', 'realised', 'now'],
              freshness: 'current',
              prompt: {
                en: "Describe a time you changed your mind about something. You should say: what you believed at first, what happened, how long the change took, and explain how you feel about it now.",
                fr: "Décrivez une fois où vous avez changé d'avis : ce que vous pensiez, ce qui s'est passé, combien de temps, et ce que vous en pensez aujourd'hui.",
              },
            },
          ],
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
          prompts: [
            {
              id: 'gt-s-p3-p2',
              topicKeywords: ['concentrate', 'quiet', 'spaces', 'employers', 'cities', 'noise', 'distraction', 'work'],
              freshness: 'current',
              prompt: {
                en: "Let us consider quiet places in general. Why do people find it harder to concentrate than they once did? Should employers provide quiet spaces at work? How might the places people go to think change as cities grow?",
                fr: "Parlons des lieux calmes : la concentration, les espaces calmes au travail, et l'évolution de ces lieux dans des villes plus grandes.",
              },
            },
            {
              id: 'gt-s-p3-p3',
              topicKeywords: ['possessions', 'own', 'replace', 'repairing', 'things', 'decades', 'attitudes', 'buy'],
              freshness: 'current',
              prompt: {
                en: "Let us consider ownership in general. Why do some people keep possessions for decades while others replace them quickly? Is repairing things a skill worth teaching? How might attitudes to owning things change over the next twenty years?",
                fr: "Parlons de la possession : garder ou remplacer, l'utilité d'apprendre à réparer, et l'évolution du rapport aux objets.",
              },
            },
            {
              id: 'gt-s-p3-p4',
              topicKeywords: ['admit', 'wrong', 'argue', 'opinions', 'minds', 'debate', 'evidence', 'groups'],
              freshness: 'current',
              prompt: {
                en: "Let us consider how opinions change. Why do people find it difficult to admit they were wrong? Should schools teach students how to argue? What makes some groups better than others at changing their minds?",
                fr: "Parlons du changement d'opinion : la difficulté d'admettre une erreur, l'enseignement de l'argumentation, et pourquoi certains groupes changent plus facilement d'avis.",
              },
            },
          ],
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
      // THE ANCHOR LADDER, authored 2026-08-29 as Task 4's first batch.
      //
      // What was here before was six passages of 16 to 45 words carrying one
      // question each — placeholders, and the Task 3 inventory said so in its
      // own row: *6 questions against a published 40*. They were replaced
      // rather than kept, because the authoring gate written the same evening
      // rejects them on length, and a bank should not contain material we
      // would refuse if it arrived now.
      //
      // These six are one per CEFR band, at the lengths a GT paper actually
      // sets, and they are the ANCHORS: everything authored into this section
      // afterwards is measured against them by the statistical veto. That is
      // why they carry `needsReview` in the batch record and why the review
      // the addendum buys covers 100% of them and 5% of the rest.
      //
      // Author: this session. Judge for the anchor comparison: the same, which
      // is recorded rather than hidden — see `author/ingest.ts`.
      //
      // Every one was built from the published GT Reading format. No real exam
      // paper was used as a source, for the reason §C gives.
      // A sitting now presents eight passages rather than six — 37 questions
      // against the published 40, where it was 28.
      //
      // It rises only where the bank can afford it. A1, A2, B1 and B2 hold
      // three passages each, so taking two of the middle bands still leaves a
      // second sitting something it has not seen. C1 and C2 hold ONE each, so
      // every sitting repeats them, and raising their count would not change
      // that — it would only take the same passage twice. The fix for the
      // remaining three questions is more long passages, not a larger scoop
      // of the two there are.
      serve: { count: 8, byBand: { A1: 1, A2: 1, B1: 2, B2: 2, C1: 1, C2: 1 } },
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
          id: "gt-r-a1-01-r",
          level: 'A1',
          family: 'correspondence',
          role: 'anchor',
          freshness: 'current',
          script: "Hi Nadia,\n\nThanks for watering the plants while we were away. Everything looks green.\n\nI left your key with Mr Okafor in flat 4B, because we got back late on Sunday and your lights were off. He is home most mornings.\n\nThere is a bag of coffee on your doorstep. It is the one you liked.\n\nSee you soon,\nPriya",
        },
        {
          id: "gt-r-a2-01-r",
          level: 'A2',
          family: 'notice',
          role: 'anchor',
          freshness: 'current',
          script: "BICYCLE STORE — RULES FOR RESIDENTS\n\nThe store is open to residents of Blocks A to D. Your fob opens the door between 6 a.m. and midnight.\n\nPlease label your bicycle with your flat number. Unlabelled bicycles are tagged after two weeks and taken away two weeks after that.\n\nDo not charge electric bicycles or scooters inside the store. There are two charging points in the bin room, and they must not be used overnight.\n\nReport a broken lock or a jammed door to the building office, not to the caretaker, who cannot order parts.\n\nThe store is cleaned on the first Monday of each month. Please move your bicycle out of the way that morning.",
        },
        {
          id: "gt-r-b1-01-r",
          level: 'B1',
          family: 'notice',
          role: 'anchor',
          freshness: 'current',
          script: "NIGHT DELIVERIES — WHAT THE DRIVER NEEDS FROM YOU\n\nFrom the first of next month, deliveries to the warehouse will arrive between ten at night and five in the morning. The change is not permanent: it will be reviewed once the road works on Fenton Street are finished.\n\nBefore you leave for the day, put the pallet numbers on the whiteboard by the loading door. The night driver has no access to the office computer and cannot look them up.\n\nLeave the yard gate unlocked but closed. Drivers have been told not to force a gate that will not open, and a refused delivery costs a full day.\n\nDo not leave the forklift keys in the cab. Two sets are kept in the key box; the code is the one used for the store room.\n\nIf a delivery is missed, write the time on the sheet inside the loading door. Do not telephone the depot at night — the number is not answered until seven, and a message left there is not passed on.",
        },
        {
          id: "gt-r-b2-01-r",
          level: 'B2',
          family: 'informative',
          role: 'anchor',
          freshness: 'current',
          script: "WHY THE LETTERS WERE REWRITTEN\n\nA hospital in the north of the country has published the results of a two-year effort to reduce missed appointments, and the finding that has attracted attention is not the one the team expected.\n\nThe department began, as most do, by sending more reminders. Text messages went out three days before and again on the morning of the appointment. Missed appointments fell by about four per cent, which the team considered disappointing given the cost.\n\nThe second change was smaller and cost almost nothing. The appointment letter itself was rewritten. The old letter opened with the name of the trust, a reference number and a paragraph about parking; the new one opened with the date, the time, the building, and a single line saying what would happen at the visit. Missed appointments fell by a further eleven per cent.\n\nThe team's own explanation is cautious. They point out that the two changes were made in sequence rather than at random, so the second may have benefited from the first, and that the department also moved to a new building halfway through, which may have changed who found it easy to attend.\n\nWhat they are confident about is narrower and, they argue, more useful: patients who telephoned to rearrange rose sharply after the letter changed. Some of the people who had simply not come, it appears, had not understood that rearranging was possible. A reminder tells someone they have an appointment. It does not tell them what to do if they cannot keep it.",
        },
        {
          id: "gt-r-c1-01-r",
          level: 'C1',
          family: 'argued',
          role: 'anchor',
          freshness: 'current',
          script: "OFFICES INTO FLATS: THE ARGUMENT THAT KEEPS BEING WON AND LOST\n\nThe proposal has an appealing symmetry. Cities have more office space than they need and fewer homes than they need; converting the first into the second appears to solve two problems with one instrument. It is put forward roughly every decade, is adopted in some form, and then disappoints — and the pattern of the disappointment is more interesting than the proposal.\n\nThe technical objections are real but not decisive. Deep floor plates leave rooms without windows; service risers sit in the wrong places; the cost of adding drainage to a building designed for one kitchen on each floor is not trivial. Architects have solved all of these somewhere, and the solutions are published. What defeats conversion is rarely a problem to which nobody has an answer.\n\nWhat defeats it is that the answer becomes expensive at exactly the moment doing nothing becomes cheap. An office building is converted when its rent has fallen far enough to make housing the better use — and rents fall furthest in the districts where fewest people wish to live, which are the districts where the finished housing is worth least. The arithmetic that makes conversion possible is the arithmetic that makes it unattractive.\n\nThere is a stronger version of the case, and it is not the one usually made. It is that the alternative to a converted building is not a better building but an empty one, and an empty building imposes costs on the street around it that its owner does not pay. That case does not depend on conversion being profitable. It depends on someone being willing to say that the cost of vacancy is public, and to price it accordingly, which is a political sentence rather than an architectural one.\n\nThose who oppose conversion in the abstract rarely oppose it in the particular. Ask about a specific building and the objection changes shape: it becomes an objection to the standard of the flats, or to the absence of a school, or to the ground floor being given over to storage. These are objections to bad conversion, not to conversion, and treating the two as one is how a city ends up with neither the offices nor the homes.",
        },
        {
          id: "gt-r-c2-01-r",
          level: 'C2',
          family: 'informative',
          role: 'anchor',
          freshness: 'current',
          script: "COUNTING WHAT IS NOT THERE\n\nOf the quantities a statistical office is asked to produce, the number of empty homes is among the least tractable, and the reasons are instructive well beyond housing.\n\nThe difficulty is not that empty homes are hard to find. It is that “empty” is not one condition but several, and the several are not distinguishable from outside. A property between tenancies for three weeks, a property held vacant while probate is settled, a property whose owner lives abroad and returns for two months a year, and a property derelict since the last century are all, at any given instant, unoccupied. Only the last is what a reader of the figure imagines. Yet a definition narrow enough to exclude the first three requires knowing why a building is empty, and the reasons are held by owners who have, in several jurisdictions, a financial interest in the answer.\n\nThe usual response is to measure duration instead of state, on the reasoning that a property empty for six months is unlikely to be between tenancies. This is a considerable improvement, and it introduces a subtler error. Duration is inferred from administrative traces — council tax records, utility meters, registers of voters — and each trace has its own failure mode. A meter reading of zero distinguishes an empty flat from an occupied one; it does not distinguish either from a flat whose occupant has changed supplier. Council tax records are excellent where an exemption is claimed and silent where it is not worth claiming, which is precisely the case for the short vacancies the measure was designed to exclude and, awkwardly, also for the wealthiest owners of the longest ones.\n\nWhat is left is a figure reliable in the middle of its range and unreliable at both ends, which is the opposite of what policy wants from it. Policy is interested in the tail: the long, deliberate vacancies against which a charge might be levied. The measure is weakest exactly there, and weakest in a direction that is not random — undercounting where owners are best resourced to remain administratively invisible.\n\nNone of this makes the figure useless. It makes it a figure about which two honest statements can be made at once: that empty homes in this city rose by some percentage last year, and that the increase is a lower bound whose slack cannot presently be estimated. Statistical offices publish the first sentence readily and the second reluctantly, not from dishonesty but because the second is harder to write and much harder to headline.\n\nThe instructive part, for anyone reading official numbers, is that the pattern generalises. Wherever a quantity is defined by an absence, measured through traces left by presence, and matters most at the extreme where those traces are thinnest, the published figure will be soundest where it is least interesting.",
        },
        {
          id: "gt-r-a1-02-r",
          level: 'A1',
          family: 'notice',
          freshness: 'current',
          script: "SELF-SERVICE RETURNS\n\nPut one book at a time on the shelf inside the machine. Wait for the green light before you put the next one.\n\nThe machine does not take DVDs. Please hand those to the desk.\n\nReceipts are printed only if you ask for one.",
        },
        {
          id: "gt-r-a2-02-r",
          level: 'A2',
          family: 'informative',
          freshness: 'current',
          script: "THE STATION GARDEN — WHAT GROWS THERE\n\nThe strip beside platform two was planted three years ago by a group of volunteers. It now holds herbs, soft fruit and a small apple tree.\n\nAnyone may pick what is ripe. There is no charge and no need to ask. The volunteers request only that you take what you will use that day.\n\nThe group meets on the second Saturday of the month. New helpers are welcome, and no experience is needed. Tools are kept in the green box by the gate, which is not locked.\n\nWatering is the main job in summer.",
        },
        {
          id: "gt-r-b1-02-r",
          level: 'B1',
          family: 'informative',
          freshness: 'current',
          script: "THE FOUR-DAY WEEK, ONE YEAR ON\n\nA small engineering firm in the east of the city moved to a four-day week last spring, and has now published what it learned. Pay was unchanged and hours were cut from thirty-eight to thirty-two.\n\nOutput held steady, which the owners had expected, but the explanation surprised them. They had assumed people would simply work faster. Instead, the meetings changed: a weekly review that had run for ninety minutes was shortened to thirty, and two standing meetings were dropped entirely. Nobody has asked for them back.\n\nTwo things did not go well. Covering the telephones was more difficult than expected, and the company now pays an agency for Friday mornings. And three of the twenty-six employees said they preferred the previous arrangement, because a shorter week carrying the same work became a denser one.\n\nThe firm is keeping the arrangement. Its own summary is careful: the experiment ran for a year in a steady market, and the owners acknowledge that they do not know what would happen in a difficult one.",
        },
        {
          id: "gt-r-b2-02-r",
          level: 'B2',
          family: 'correspondence',
          freshness: 'current',
          script: "From: Ines Ferreira, Operations\nTo: All site staff\nSubject: The new sign-in system — what changes on Monday, and what does not\n\nFrom Monday the paper sign-in book at reception is replaced by a card reader. Your existing door card works; nothing new is being issued, and you do not need to do anything before Monday.\n\nThree things will be different. You will tap in at the reader rather than write in the book, so please allow an extra minute at eight o'clock while everybody finds out where it is. The reader records the time you arrive and the time you leave, and nothing else. And if you forget your card, reception can sign you in by hand, exactly as now.\n\nTwo questions have already come up, so I will answer them here rather than separately.\n\nThe system does not follow movement inside the building. There is one reader, at the front door, and no plan to add others.\n\nThe records are kept for ninety days and are visible to your line manager and to me. If you would like to see your own, ask and I will send them.\n\nI know a change of this kind is easier to accept when the reason is stated, so here it is: the book was unreadable in an emergency, and the fire officer asked us to replace it. That is the whole reason.\n\nInes",
        },
        {
          id: "gt-r-a1-03-r",
          level: 'A1',
          family: 'informative',
          freshness: 'current',
          script: "OPENING TIMES — WINTER\n\nThe pool opens at seven in the morning from Monday to Friday, and at nine at the weekend.\n\nThe last swim starts thirty minutes before closing.\n\nLane swimming is on Tuesday and Thursday evenings.",
        },
        {
          id: "gt-r-a2-03-r",
          level: 'A2',
          family: 'correspondence',
          freshness: 'current',
          script: "Dear Mr Bello,\n\nThe heating engineer will come on Thursday between nine and one. He needs to reach the boiler in the kitchen cupboard, so please move anything stored in front of it.\n\nIf Thursday is difficult, telephone the office before Wednesday midday and we will book another day. Do not telephone the engineer directly; he cannot change the list himself.\n\nThe visit takes about an hour. There is no charge, and nothing needs to be signed.\n\nKind regards,\nDahlia Prosser\nBuilding services",
        },
        {
          id: "gt-r-b1-03-r",
          level: 'B1',
          family: 'correspondence',
          freshness: 'current',
          script: "Dear Ms Nakamura,\n\nThank you for your application to the evening course in bookkeeping. I am writing with an offer of a place, and with two things you should know before you accept.\n\nThe class has moved from Tuesday to Wednesday. This was decided after the brochure was printed, and I am sorry the wrong day is still shown on our website; it will be corrected this week.\n\nThe course now runs for eleven weeks rather than twelve, because the room is unavailable in the last week of March. The syllabus has not been shortened; the missing session has been spread across the others, so most evenings will finish ten minutes later than advertised.\n\nIf either change makes the course impossible for you, tell me and I will hold your application for the spring group instead, at no cost.\n\nPlease reply by the fifteenth. Places not confirmed by then are offered to the waiting list.\n\nYours sincerely,\nTomas Erdely",
        },
        {
          id: "gt-r-b2-03-r",
          level: 'B2',
          family: 'argued',
          freshness: 'current',
          script: "THE CASE FOR SLOWER DELIVERY\n\nEvery retailer now competes on speed, and the competition has a strange feature: almost nobody asked for it.\n\nSurveys of online shoppers put delivery speed well below price, below reliability, and below knowing when the parcel will actually arrive. What people say they want is a window they can trust — an hour, a stated day, a message if it slips. Speed matters most in the small number of cases where something is needed for a fixed date, and those cases are visible at the moment of ordering.\n\nRetailers know this. They compete on speed anyway, because speed is the one promise that can be printed beside a price and compared. Reliability cannot be advertised in the same way: a company that keeps its window ninety-eight times in a hundred has nothing to put on the button.\n\nThe cost of the mismatch falls in two places. It falls on the delivery network, which is sized for the promise rather than for the demand, and it falls on the customer who did not want a two-hour slot and received one, along with the price of building it.\n\nThere is an argument on the other side, and it is not weak. A promise of speed is easy to check and therefore easy to hold a company to, while a promise of reliability is measured over months and is exactly the kind of claim a company can quietly stop meeting. Speed may be the wrong thing, competed for in the right way.",
        },
      ],
      items: [
        {
          id: "gt-r-a1-01-q1",
          recordingId: "gt-r-a1-01-r",
          level: 'A1',
          stem: "Where is Nadia's key?",
          options: [
            "With a neighbour in another flat",
            "Under the bag on the doorstep",
            "Inside Priya's flat, beside the plants",
            "Still with Priya, who will bring it round",
          ],
          answer: 0,
          rationale: "Priya says she left it with Mr Okafor in 4B. The doorstep holds the coffee, not the key, and Priya does not offer to bring it.",
        },
        {
          id: "gt-r-a1-01-q2",
          recordingId: "gt-r-a1-01-r",
          level: 'A1',
          stem: "Why did Priya not knock on Sunday?",
          options: [
            "The plants still needed watering",
            "Nadia's lights were off",
            "Mr Okafor had asked her not to",
            "She had already lost the key",
          ],
          answer: 1,
          rationale: "She got back late and the lights were off, so she left the key with a neighbour rather than disturbing Nadia that evening.",
        },
        {
          id: "gt-r-a1-01-q3",
          recordingId: "gt-r-a1-01-r",
          level: 'A1',
          stem: "What did Priya leave outside?",
          options: [
            "A plant from the flat",
            "A note addressed to Mr Okafor",
            "Some coffee",
            "The front door key",
          ],
          answer: 2,
          rationale: "The bag on the doorstep is coffee. The key went to the neighbour, and no note or plant is mentioned anywhere in the message.",
        },
        {
          id: "gt-r-a2-01-q1",
          recordingId: "gt-r-a2-01-r",
          level: 'A2',
          stem: "What happens to a bicycle with no label?",
          options: [
            "It is moved to the bin room for charging",
            "Nothing, provided the owner lives in Block A",
            "It is removed from the store the same day",
            "It is marked, and taken away a month later",
          ],
          answer: 3,
          rationale: "It is tagged at two weeks and taken away two weeks after that, which is a month in total. Nothing is removed on the day it is noticed.",
        },
        {
          id: "gt-r-a2-01-q2",
          recordingId: "gt-r-a2-01-r",
          level: 'A2',
          stem: "Where may an electric bicycle be charged?",
          options: [
            "In the bin room, but not overnight",
            "Anywhere in the store, at any hour",
            "Only inside the building office",
            "Nowhere on the premises at all",
          ],
          answer: 0,
          rationale: "Charging inside the store is forbidden; the bin room has two points, and the notice adds that those may not be used overnight.",
        },
        {
          id: "gt-r-a2-01-q3",
          recordingId: "gt-r-a2-01-r",
          level: 'A2',
          stem: "Who should be told about a jammed door?",
          options: [
            "Nobody, until the monthly cleaning",
            "The building office",
            "The caretaker",
            "Any resident of Blocks A to D",
          ],
          answer: 1,
          rationale: "The notice sends faults to the office and says explicitly that the caretaker cannot order the parts a repair would need.",
        },
        {
          id: "gt-r-a2-01-q4",
          recordingId: "gt-r-a2-01-r",
          level: 'A2',
          stem: "What must residents do on the first Monday of the month?",
          options: [
            "Label their bicycle again",
            "Report to the building office",
            "Move their bicycle",
            "Renew their door fob",
          ],
          answer: 2,
          rationale: "The store is cleaned that morning and bicycles must be moved out of the way; nothing else is asked of residents on that day.",
        },
        {
          id: "gt-r-b1-01-q1",
          recordingId: "gt-r-b1-01-r",
          level: 'B1',
          stem: "Why has the delivery time changed?",
          options: [
            "Because the depot closes at seven",
            "Because the forklift is out of use",
            "Because the office computer is unavailable at night",
            "Because of road works nearby",
          ],
          answer: 3,
          rationale: "The notice ties the change to the Fenton Street works and says it will be reviewed when they finish, so the arrangement is temporary.",
        },
        {
          id: "gt-r-b1-01-q2",
          recordingId: "gt-r-b1-01-r",
          level: 'B1',
          stem: "What must staff write on the whiteboard?",
          options: [
            "The pallet numbers",
            "The code for the key box",
            "The time the delivery arrived",
            "The driver's name and depot",
          ],
          answer: 0,
          rationale: "The driver cannot reach the office computer, so the numbers have to be left somewhere readable from the loading door itself.",
        },
        {
          id: "gt-r-b1-01-q3",
          recordingId: "gt-r-b1-01-r",
          level: 'B1',
          stem: "How should the yard gate be left?",
          options: [
            "Shut and locked, as on any other night",
            "Closed, but not locked",
            "Open and fastened back",
            "Locked, with the key in the box",
          ],
          answer: 1,
          rationale: "The instruction is unlocked but closed, because a driver who meets a gate that will not open is told to leave rather than force it.",
        },
        {
          id: "gt-r-b1-01-q4",
          recordingId: "gt-r-b1-01-r",
          level: 'B1',
          stem: "What should be done about a missed delivery?",
          options: [
            "Leave a message for the morning shift",
            "Tell the driver about it the following night",
            "Record the time on a sheet",
            "Telephone the depot straight away",
          ],
          answer: 2,
          rationale: "The sheet inside the loading door is the route; the depot number is unanswered at night and a message left there is not passed on.",
        },
        {
          id: "gt-r-b2-01-q1",
          recordingId: "gt-r-b2-01-r",
          level: 'B2',
          stem: "Which change had the larger effect?",
          options: [
            "Sending more text reminders",
            "Moving to a new building",
            "Telephoning patients before the visit",
            "Rewriting the appointment letter",
          ],
          answer: 3,
          rationale: "The reminders produced about four per cent and the rewritten letter a further eleven, which is the finding the team did not expect.",
        },
        {
          id: "gt-r-b2-01-q2",
          recordingId: "gt-r-b2-01-r",
          level: 'B2',
          stem: "What did the old letter begin with?",
          options: [
            "Administrative details and parking",
            "The date and time of the visit",
            "A description of the treatment",
            "A number to ring to rearrange",
          ],
          answer: 0,
          rationale: "It opened with the trust's name, a reference number and a paragraph on parking; the date and building came first only in the new one.",
        },
        {
          id: "gt-r-b2-01-q3",
          recordingId: "gt-r-b2-01-r",
          level: 'B2',
          stem: "Why is the team cautious about the result?",
          options: [
            "Patients were not told about the study",
            "The two changes were not made at random",
            "The fall in missed appointments was very small",
            "The letters were never actually posted",
          ],
          answer: 1,
          rationale: "Because the changes ran in sequence, the second may have gained from the first, and a move of building also fell inside the same period.",
        },
        {
          id: "gt-r-b2-01-q4",
          recordingId: "gt-r-b2-01-r",
          level: 'B2',
          stem: "What rose after the letter changed?",
          options: [
            "Appointments at the old building",
            "The number of text messages sent",
            "Calls to rearrange",
            "Complaints about parking",
          ],
          answer: 2,
          rationale: "The sharp rise in patients telephoning to rearrange is the one finding the team says it is confident about.",
        },
        {
          id: "gt-r-b2-01-q5",
          recordingId: "gt-r-b2-01-r",
          level: 'B2',
          stem: "What does the writer suggest a reminder fails to do?",
          options: [
            "State the time and the building clearly",
            "Reach patients who have no telephone at home",
            "Reduce the total cost of the appointment system",
            "Say how to rearrange",
          ],
          answer: 3,
          rationale: "The closing lines draw exactly this distinction: a reminder says there is an appointment but not what to do when it cannot be kept.",
        },
        {
          id: "gt-r-c1-01-q1",
          recordingId: "gt-r-c1-01-r",
          level: 'C1',
          stem: "What does the writer say about the technical objections?",
          options: [
            "They have answers, and the answers are known",
            "They are the main reason conversion fails",
            "They apply only to very old buildings",
            "They have never been studied seriously",
          ],
          answer: 0,
          rationale: "Deep plates, risers and drainage are called real but not decisive, because architects have solved each of them somewhere and published how.",
        },
        {
          id: "gt-r-c1-01-q2",
          recordingId: "gt-r-c1-01-r",
          level: 'C1',
          stem: "According to the writer, what actually defeats conversion?",
          options: [
            "Owners would in most cases rather demolish and rebuild",
            "The same conditions that allow it make it unattractive",
            "Planning authorities generally refuse permission for such schemes",
            "Architects have not yet published any workable solutions",
          ],
          answer: 1,
          rationale: "Rents fall furthest where the finished homes are worth least, so the arithmetic that opens the door is the arithmetic that closes it.",
        },
        {
          id: "gt-r-c1-01-q3",
          recordingId: "gt-r-c1-01-r",
          level: 'C1',
          stem: "What is the stronger argument the writer identifies?",
          options: [
            "That offices are cheaper to build than flats are",
            "That cities have too few offices, not too many",
            "That vacancy imposes a cost the owner does not bear",
            "That conversion is more profitable than it appears",
          ],
          answer: 2,
          rationale: "The alternative is framed as an empty building whose costs fall on the surrounding street rather than on the person who owns it.",
        },
        {
          id: "gt-r-c1-01-q4",
          recordingId: "gt-r-c1-01-r",
          level: 'C1',
          stem: "How does the writer describe that stronger argument?",
          options: [
            "As technical rather than financial",
            "As historical rather than current",
            "As practical rather than theoretical",
            "As political rather than architectural",
          ],
          answer: 3,
          rationale: "It requires someone to declare the cost of vacancy public and to price it, which the writer calls a political sentence, not a design one.",
        },
        {
          id: "gt-r-c1-01-q5",
          recordingId: "gt-r-c1-01-r",
          level: 'C1',
          stem: "What happens when opponents are asked about a specific building?",
          options: [
            "Their objection becomes one about quality or amenities",
            "They usually withdraw the objection entirely",
            "They demand that the building be demolished",
            "They agree the conversion should go ahead",
          ],
          answer: 0,
          rationale: "The objection reshapes itself into the standard of the flats, the missing school, or the storage occupying the ground floor.",
        },
        {
          id: "gt-r-c1-01-q6",
          recordingId: "gt-r-c1-01-r",
          level: 'C1',
          stem: "What does the writer say confusing the two kinds of objection leads to?",
          options: [
            "Rents fall further than they otherwise would",
            "Neither use of the building is achieved",
            "Conversions are approved without any scrutiny",
            "Architects stop publishing their solutions",
          ],
          answer: 1,
          rationale: "Objections to bad conversion are treated as objections to conversion itself, and the city is left without either use of the building.",
        },
        {
          id: "gt-r-c2-01-q1",
          recordingId: "gt-r-c2-01-r",
          level: 'C2',
          stem: "Why is the category of the empty home a difficult one?",
          options: [
            "Owners must by law report every vacancy",
            "The word has no accepted definition in law",
            "It covers several situations that look alike from outside",
            "Empty homes are physically hard to locate",
          ],
          answer: 2,
          rationale: "Four quite different properties are unoccupied at any instant, and telling them apart needs the owner's reason rather than an observation.",
        },
        {
          id: "gt-r-c2-01-q2",
          recordingId: "gt-r-c2-01-r",
          level: 'C2',
          stem: "What is the advantage of measuring duration?",
          options: [
            "It removes the need for council tax records",
            "It makes the figure exact rather than approximate",
            "It identifies who owns each empty property",
            "It excludes short gaps between tenancies",
          ],
          answer: 3,
          rationale: "Six months of vacancy is unlikely to be a gap between tenants, which is the class the state-based measure was unable to exclude.",
        },
        {
          id: "gt-r-c2-01-q3",
          recordingId: "gt-r-c2-01-r",
          level: 'C2',
          stem: "What problem does a zero meter reading create?",
          options: [
            "It looks the same as a change of supplier",
            "It cannot be recorded by the utility company",
            "It proves that the property has been derelict",
            "It is available only where an exemption is claimed",
          ],
          answer: 0,
          rationale: "The reading separates empty from occupied but not either from a flat whose occupant has simply moved to a different supplier.",
        },
        {
          id: "gt-r-c2-01-q4",
          recordingId: "gt-r-c2-01-r",
          level: 'C2',
          stem: "Where is the measure weakest?",
          options: [
            "Wherever council tax exemptions are claimed",
            "At the long-vacancy end that policy cares about",
            "In the middle of its range",
            "Among short gaps between tenancies",
          ],
          answer: 1,
          rationale: "Policy wants the tail, and the tail is exactly where the administrative traces thin out and the undercount stops being random.",
        },
        {
          id: "gt-r-c2-01-q5",
          recordingId: "gt-r-c2-01-r",
          level: 'C2',
          stem: "What two statements does the writer say can both be true?",
          options: [
            "That vacancies fell, and that the fall cannot be measured",
            "That owners are honest, and that the records are complete",
            "That vacancies rose, and that the rise is a lower bound",
            "That the figure is accurate, and that it is not published",
          ],
          answer: 2,
          rationale: "The rise can be reported and the increase still be a floor whose slack nobody can currently estimate; both sentences are honest at once.",
        },
        {
          id: "gt-r-c2-01-q6",
          recordingId: "gt-r-c2-01-r",
          level: 'C2',
          stem: "What general pattern does the writer draw out?",
          options: [
            "Official figures should not be published at all",
            "Absences are easier to measure than presences",
            "Statistical offices deliberately mislead readers",
            "A measure is soundest where it matters least",
          ],
          answer: 3,
          rationale: "Where a quantity is an absence read through traces of presence, the published number is firmest away from the extreme that matters most.",
        },
        {
          id: "gt-r-a1-02-q1",
          recordingId: "gt-r-a1-02-r",
          level: 'A1',
          stem: "What must you do after putting a book in?",
          options: [
            "Wait for a green light",
            "Take a printed receipt",
            "Put the next book straight in",
            "Press the return button twice",
          ],
          answer: 0,
          rationale: "The notice asks you to wait for the light before the next book, so the machine handles one at a time and nothing is pressed.",
        },
        {
          id: "gt-r-a1-02-q2",
          recordingId: "gt-r-a1-02-r",
          level: 'A1',
          stem: "What cannot be returned at the machine?",
          options: [
            "Large reference books",
            "Discs",
            "Anything without a receipt",
            "Books borrowed from another branch",
          ],
          answer: 1,
          rationale: "DVDs go to the desk. Nothing is said about other branches, about size, or about receipts being needed to return anything.",
        },
        {
          id: "gt-r-a1-02-q3",
          recordingId: "gt-r-a1-02-r",
          level: 'A1',
          stem: "When is a receipt printed?",
          options: [
            "Only for discs",
            "When the light turns green",
            "Only when you ask for one",
            "After every return",
          ],
          answer: 2,
          rationale: "The last line makes the receipt optional and available on request; it is not automatic and is not tied to the light or to any item.",
        },
        {
          id: "gt-r-a2-02-q1",
          recordingId: "gt-r-a2-02-r",
          level: 'A2',
          stem: "Who planted the garden?",
          options: [
            "A gardening company",
            "The local council",
            "The station staff",
            "A group of volunteers",
          ],
          answer: 3,
          rationale: "The first sentence names volunteers, and the rest of the notice describes the same group meeting monthly to look after it.",
        },
        {
          id: "gt-r-a2-02-q2",
          recordingId: "gt-r-a2-02-r",
          level: 'A2',
          stem: "What must you do before picking something?",
          options: [
            "Nothing at all",
            "Ask a volunteer first",
            "Pay a small charge",
            "Join the group of helpers",
          ],
          answer: 0,
          rationale: "The notice says there is no charge and no need to ask; the only request concerns how much you take, not permission to take it.",
        },
        {
          id: "gt-r-a2-02-q3",
          recordingId: "gt-r-a2-02-r",
          level: 'A2',
          stem: "How often does the group meet?",
          options: [
            "Twice a month",
            "Once a month",
            "Only during the summer",
            "Every Saturday",
          ],
          answer: 1,
          rationale: "It meets on the second Saturday of each month, so once a month, and summer is mentioned only as the season with most watering.",
        },
        {
          id: "gt-r-a2-02-q4",
          recordingId: "gt-r-a2-02-r",
          level: 'A2',
          stem: "Where are the tools?",
          options: [
            "With the volunteers who bring them",
            "Locked in the apple tree store",
            "In a box by the gate",
            "Inside the station building",
          ],
          answer: 2,
          rationale: "The green box by the gate holds them, and the notice adds that it is not locked, so no key has to be found first.",
        },
        {
          id: "gt-r-b1-02-q1",
          recordingId: "gt-r-b1-02-r",
          level: 'B1',
          stem: "Why did output stay the same?",
          options: [
            "Because the staff worked faster",
            "Because an agency covered the extra work",
            "Because pay was left unchanged",
            "Because meetings took much less time",
          ],
          answer: 3,
          rationale: "The owners expected people to speed up; what actually changed was the meetings, one of which was cut by an hour and two of which went.",
        },
        {
          id: "gt-r-b1-02-q2",
          recordingId: "gt-r-b1-02-r",
          level: 'B1',
          stem: "What did the firm have to pay for?",
          options: [
            "Agency cover on Friday mornings",
            "Training for the twenty-six employees",
            "A new telephone system",
            "Overtime on Thursday evenings",
          ],
          answer: 0,
          rationale: "Covering the telephones proved harder than expected, and Friday mornings are now bought from an agency; nothing else is described as a new cost.",
        },
        {
          id: "gt-r-b1-02-q3",
          recordingId: "gt-r-b1-02-r",
          level: 'B1',
          stem: "What did three employees say?",
          options: [
            "That their pay should have risen",
            "That they preferred the old week",
            "That they wanted longer hours again",
            "That the meetings were still too long",
          ],
          answer: 1,
          rationale: "Three of the twenty-six found that the same work in fewer days made the week denser, and said they preferred the previous arrangement.",
        },
        {
          id: "gt-r-b1-02-q4",
          recordingId: "gt-r-b1-02-r",
          level: 'B1',
          stem: "How does the firm describe its own result?",
          options: [
            "As too early to publish anything about",
            "As proof that shorter weeks always work",
            "As limited to one year and a steady market",
            "As a failure it intends to reverse",
          ],
          answer: 2,
          rationale: "The summary is explicitly cautious: a single year, a steady market, and no claim about what a difficult market would do.",
        },
        {
          id: "gt-r-b2-02-q1",
          recordingId: "gt-r-b2-02-r",
          level: 'B2',
          stem: "What must staff do before Monday?",
          options: [
            "Register their name with the fire officer",
            "Sign the paper book one last time",
            "Collect a new card from reception",
            "Nothing",
          ],
          answer: 3,
          rationale: "The message says the existing door card works, nothing new is being issued, and no action is needed in advance of the change.",
        },
        {
          id: "gt-r-b2-02-q2",
          recordingId: "gt-r-b2-02-r",
          level: 'B2',
          stem: "Why should staff allow an extra minute?",
          options: [
            "Because people will be learning where it is",
            "Because two cards must be tapped in turn",
            "Because the reader is slow to respond",
            "Because reception opens later on Monday",
          ],
          answer: 0,
          rationale: "The delay is expected at eight o'clock while everybody works out where the reader is, not because of the device or the hour.",
        },
        {
          id: "gt-r-b2-02-q3",
          recordingId: "gt-r-b2-02-r",
          level: 'B2',
          stem: "What does the reader record?",
          options: [
            "Every door opened during the day",
            "Arrival and departure times only",
            "Movement between floors",
            "The name of the person who signed you in",
          ],
          answer: 1,
          rationale: "It records the time of arrival and the time of leaving and nothing else, and the message states there is a single reader at the front door.",
        },
        {
          id: "gt-r-b2-02-q4",
          recordingId: "gt-r-b2-02-r",
          level: 'B2',
          stem: "How long are the records kept?",
          options: [
            "Until the end of the year",
            "For as long as the fire officer requires",
            "Ninety days",
            "They are not kept at all",
          ],
          answer: 2,
          rationale: "Ninety days is stated, together with who can see them: the line manager and the sender, and the employee on request.",
        },
        {
          id: "gt-r-b2-02-q5",
          recordingId: "gt-r-b2-02-r",
          level: 'B2',
          stem: "Why was the change made?",
          options: [
            "To record how long people work",
            "To replace a reader that had broken",
            "To save the cost of paper",
            "To make an emergency roll call possible",
          ],
          answer: 3,
          rationale: "The final paragraph gives one reason: the book could not be read in an emergency and the fire officer asked for it to be replaced.",
        },
        {
          id: "gt-r-a1-03-q1",
          recordingId: "gt-r-a1-03-r",
          level: 'A1',
          stem: "When does the pool open on Saturday?",
          options: [
            "At nine",
            "At half past six",
            "It is closed at the weekend",
            "At seven",
          ],
          answer: 0,
          rationale: "Weekdays open at seven and the weekend at nine, so Saturday is the later time; nothing in the notice closes the pool at weekends.",
        },
        {
          id: "gt-r-a1-03-q2",
          recordingId: "gt-r-a1-03-r",
          level: 'A1',
          stem: "How late can you begin a swim?",
          options: [
            "Thirty minutes after opening",
            "Half an hour before the pool shuts",
            "At any time until closing",
            "Only during lane swimming",
          ],
          answer: 1,
          rationale: "The last swim starts thirty minutes before closing, which is a limit on beginning rather than on how long you may stay.",
        },
        {
          id: "gt-r-a1-03-q3",
          recordingId: "gt-r-a1-03-r",
          level: 'A1',
          stem: "When is lane swimming?",
          options: [
            "Every evening",
            "At the weekend only",
            "On two evenings a week",
            "Every morning before nine",
          ],
          answer: 2,
          rationale: "Tuesday and Thursday evenings are named, which is two evenings; no morning or weekend lane session is mentioned.",
        },
        {
          id: "gt-r-a2-03-q1",
          recordingId: "gt-r-a2-03-r",
          level: 'A2',
          stem: "What must Mr Bello do before Thursday?",
          options: [
            "Telephone the engineer to confirm",
            "Pay for the visit in advance",
            "Sign and return the letter",
            "Clear the space in front of the boiler",
          ],
          answer: 3,
          rationale: "The engineer has to reach the boiler in the cupboard, so the only preparation asked for is moving whatever is stored in front of it.",
        },
        {
          id: "gt-r-a2-03-q2",
          recordingId: "gt-r-a2-03-r",
          level: 'A2',
          stem: "What should he do if Thursday does not suit him?",
          options: [
            "Ring the office before Wednesday midday",
            "Nothing; the date cannot be changed",
            "Ask the engineer to come later that day",
            "Wait for the office to write again",
          ],
          answer: 0,
          rationale: "The letter gives a deadline and a route — the office, not the engineer, who is said to have no power to alter the list.",
        },
        {
          id: "gt-r-a2-03-q3",
          recordingId: "gt-r-a2-03-r",
          level: 'A2',
          stem: "How long is the visit expected to take?",
          options: [
            "The whole morning",
            "About an hour",
            "Between nine and one",
            "It does not say",
          ],
          answer: 1,
          rationale: "Nine to one is the window in which the engineer may arrive; the visit itself is given as about an hour.",
        },
        {
          id: "gt-r-a2-03-q4",
          recordingId: "gt-r-a2-03-r",
          level: 'A2',
          stem: "What does the letter say about payment?",
          options: [
            "It will be added to the rent",
            "It is due on the day",
            "There is nothing to pay",
            "Only the parts are charged for",
          ],
          answer: 2,
          rationale: "There is no charge, and the letter also removes the other common expectation by saying nothing needs to be signed.",
        },
        {
          id: "gt-r-b1-03-q1",
          recordingId: "gt-r-b1-03-r",
          level: 'B1',
          stem: "What has changed about the day?",
          options: [
            "The class now meets twice a week",
            "The brochure was printed with the right day",
            "The website was corrected before the offer",
            "The class has moved to a different weekday",
          ],
          answer: 3,
          rationale: "Tuesday became Wednesday after printing, which is why the brochure and the website still show the old day at the time of writing.",
        },
        {
          id: "gt-r-b1-03-q2",
          recordingId: "gt-r-b1-03-r",
          level: 'B1',
          stem: "Why is the course shorter?",
          options: [
            "The room cannot be used in late March",
            "Fewer students applied than expected",
            "Part of the syllabus has been removed",
            "The teacher is away for one week",
          ],
          answer: 0,
          rationale: "The room is unavailable in the last week of March; the syllabus itself is explicitly unchanged and has been redistributed instead.",
        },
        {
          id: "gt-r-b1-03-q3",
          recordingId: "gt-r-b1-03-r",
          level: 'B1',
          stem: "What is the effect on the evenings?",
          options: [
            "They will each lose ten minutes",
            "They will end slightly later",
            "They will start half an hour earlier",
            "They will be held in a different room",
          ],
          answer: 1,
          rationale: "The missing session is spread across the others, so most evenings run about ten minutes beyond the advertised finishing time.",
        },
        {
          id: "gt-r-b1-03-q4",
          recordingId: "gt-r-b1-03-r",
          level: 'B1',
          stem: "What happens if Ms Nakamura does not reply in time?",
          options: [
            "Her application is held for the spring",
            "She is charged a small fee",
            "The place goes to someone waiting",
            "She is offered the Tuesday class",
          ],
          answer: 2,
          rationale: "Unconfirmed places pass to the waiting list; the spring group is offered only if she asks because a change does not suit her.",
        },
        {
          id: "gt-r-b2-03-q1",
          recordingId: "gt-r-b2-03-r",
          level: 'B2',
          stem: "What do surveys of shoppers show?",
          options: [
            "That price is the only thing shoppers consider",
            "That shoppers want deliveries within two hours",
            "That reliability is impossible to measure",
            "That speed matters less than a trustworthy window",
          ],
          answer: 3,
          rationale: "Speed is ranked below price, reliability and knowing the arrival time; what is wanted is a window that can be relied on.",
        },
        {
          id: "gt-r-b2-03-q2",
          recordingId: "gt-r-b2-03-r",
          level: 'B2',
          stem: "Why do retailers compete on speed anyway?",
          options: [
            "Because it can be shown next to a price",
            "Because the delivery networks require it",
            "Because it is cheaper than being reliable",
            "Because customers complain about slow parcels",
          ],
          answer: 0,
          rationale: "It is the one promise that fits beside a price and can be compared; a good reliability record has nothing to put on the button.",
        },
        {
          id: "gt-r-b2-03-q3",
          recordingId: "gt-r-b2-03-r",
          level: 'B2',
          stem: "Where does the writer say the cost falls?",
          options: [
            "On companies that miss their windows",
            "On the network and on the customer",
            "On the retailer alone",
            "On the customer who orders for a fixed date",
          ],
          answer: 1,
          rationale: "The network is built for the promise rather than the demand, and the customer pays for a slot they did not ask for.",
        },
        {
          id: "gt-r-b2-03-q4",
          recordingId: "gt-r-b2-03-r",
          level: 'B2',
          stem: "What is the argument on the other side?",
          options: [
            "Windows cannot be measured at all",
            "Speed is what shoppers privately prefer",
            "A speed promise is easier to enforce",
            "Reliability costs more to deliver",
          ],
          answer: 2,
          rationale: "A promise of speed can be checked on the day, while a reliability record is measured over months and can be allowed to slip quietly.",
        },
        {
          id: "gt-r-b2-03-q5",
          recordingId: "gt-r-b2-03-r",
          level: 'B2',
          stem: "What does the last sentence claim?",
          options: [
            "That speed and reliability matter equally",
            "That retailers should stop advertising delivery",
            "That shoppers will change what they want",
            "That the wrong thing is being competed for well",
          ],
          answer: 3,
          rationale: "It concedes the mechanism while rejecting the target: the competition works, and it is aimed at something people did not ask for.",
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
