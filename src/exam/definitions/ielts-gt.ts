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
          id: "gt-r-a1-04-r",
          level: 'A1',
          family: 'notice',
          freshness: 'current',
          script: "LAUNDRY ROOM\n\nOpen every day, 7 am to 10 pm.\n\nThe machines take the building card only. There is no coin slot.\n\nPlease take your washing out as soon as the machine stops. Clothes left after 10 pm are put in the basket by the door.\n\nIf a machine does not start, write the number on the sheet by the sink. Do not use the machine again.",
        },
        {
          id: "gt-r-a1-05-r",
          level: 'A1',
          family: 'notice',
          freshness: 'current',
          script: "THIS STOP IS CLOSED\n\nWork on the road starts on Monday.\n\nBuses do not stop here for two weeks.\n\nPlease walk to the next stop, outside the post office.\n\nThe number and the times do not change.",
        },
        {
          id: "gt-r-a1-06-r",
          level: 'A1',
          family: 'notice',
          freshness: 'current',
          script: "SELF-SERVICE DESK\n\nScan your card first. Then put your books on the grey square, one at a time.\n\nWait for the green light before you take a book off.\n\nThe machine does not take money. Pay any charges at the front desk.\n\nReturning books? Use the box outside. It is open all night.",
        },
        {
          id: "gt-r-a1-07-r",
          level: 'A1',
          family: 'correspondence',
          freshness: 'current',
          script: "Hi Sam,\n\nSmall change. The cafe on the corner is shut today.\n\nCan we meet at the library instead? Same time, half past four.\n\nI have your book with me.\n\nSee you there,\nRosa",
        },
        {
          id: "gt-r-a1-08-r",
          level: 'A1',
          family: 'correspondence',
          freshness: 'current',
          script: "Dan —\n\nA parcel came for you this morning. It was too big for the box, so it is under my bed.\n\nI am out until nine. Just knock, I do not mind how late.\n\nThe man asked me to sign. I hope that is all right.\n\nPriya",
        },
        {
          id: "gt-r-a1-09-r",
          level: 'A1',
          family: 'correspondence',
          freshness: 'current',
          script: "Dear parents,\n\nOur trip to the farm is on Friday.\n\nThe bus leaves at nine. Please come at ten to nine, not later.\n\nChildren need a coat and a packed lunch. The farm is wet in places, so old shoes are best.\n\nWe are back by half past three.\n\nMs Owen",
        },
        {
          id: "gt-r-a2-03-r",
          level: 'A2',
          family: 'correspondence',
          freshness: 'current',
          script: "Dear Mr Bello,\n\nThe heating engineer will come on Thursday between nine and one. He needs to reach the boiler in the kitchen cupboard, so please move anything stored in front of it.\n\nIf Thursday is difficult, telephone the office before Wednesday midday and we will book another day. Do not telephone the engineer directly; he cannot change the list himself.\n\nThe visit takes about an hour. There is no charge, and nothing needs to be signed.\n\nKind regards,\nDahlia Prosser\nBuilding services",
        },
        {
          id: "gt-r-a2-04-r",
          level: 'A2',
          family: 'notice',
          freshness: 'current',
          script: "BIN STORE — WHAT GOES WHERE\n\nBLUE BIN: paper, card, tins and clean plastic bottles. Please rinse anything that has held food and squash the bottles flat.\n\nGREEN BIN: food waste only. Use the bags on the shelf. Loose food waste is not collected.\n\nGREY BIN: everything else.\n\nGlass is not collected from this building. There is a glass bank at the end of the street, beside the chemist.\n\nLarge items are not taken away with the bins. Ring the number on the door and a collection will be arranged, usually within five working days.",
        },
        {
          id: "gt-r-a2-05-r",
          level: 'A2',
          family: 'notice',
          freshness: 'current',
          script: "PRESCRIPTION DESK\n\nWe are open Monday to Friday, from 9 am until 6 pm. On Saturday we close at 1 pm. We do not open on Sunday.\n\nPlease bring a card or a passport with your photo on it. We cannot hand your medicine over without one.\n\nIf you are collecting for another person, bring a short note signed by them.\n\nYour medicine stays at this desk for seven days. After that it returns to the counter inside the shop. You can still collect it there, although the wait is normally longer.\n\nThe machine on the wall is only for repeat orders. If your order is new, please join the queue here.",
        },
        {
          id: "gt-r-a2-06-r",
          level: 'A2',
          family: 'notice',
          freshness: 'current',
          script: "LANE SWIMMING — PLEASE READ BEFORE YOU GET IN\n\nThree lanes are marked. The lane nearest the window is slow, the middle lane is medium, and the lane by the steps is fast. Choose by how fast you actually swim, not by how far.\n\nSwim anticlockwise. Keep to the right of your lane so that people can pass on your left.\n\nStop at the end of the lane, not in the middle. If you need to rest, move into the corner so the lane stays clear.\n\nThe lanes come out at half past seven for the club. The pool stays open, but the whole of it is then general swimming.",
        },
        {
          id: "gt-r-a2-07-r",
          level: 'A2',
          family: 'correspondence',
          freshness: 'current',
          script: "Dear Mr Hale,\n\nI live at flat 6. The window in the back bedroom will not shut properly. It closes, but there is a gap at the top and the rain comes in when the wind is from that side.\n\nI have put a towel on the floor for now. The wood under the window is already dark, so I do not want to leave it many weeks.\n\nI am at home on Tuesday and Thursday mornings. Any other day, my neighbour in flat 5 has a key and is happy to let someone in.\n\nCould you let me know a day? A message is fine; I do not need a telephone call.\n\nThank you,\nAnna Reyes",
        },
        {
          id: "gt-r-a2-08-r",
          level: 'A2',
          family: 'correspondence',
          freshness: 'current',
          script: "Hello Marta,\n\nThank you for the ladder. The gutter is completely clear now.\n\nI planned to return it on Sunday. Unfortunately one of the feet came off while I was folding it. I have found the missing part and I believe it fits back on. I did not force it, because I might have damaged something else.\n\nThe repair shop on Mill Lane can examine it on Wednesday. The man expects it to be inexpensive. I will pay whatever it costs.\n\nDo you need the ladder before Wednesday? Tell me and I will return it immediately, exactly as it is.\n\nBen",
        },
        {
          id: "gt-r-a2-09-r",
          level: 'A2',
          family: 'correspondence',
          freshness: 'current',
          script: "Dear students,\n\nThe Tuesday evening class moves from room 12 to room 4 from next week. Room 4 is on the ground floor, at the end of the corridor past the office.\n\nThe change is because room 12 has no lift access, and one of the group now finds the stairs difficult. The room is smaller, so please leave bags at the front rather than in the aisle.\n\nThe day, the time and the teacher stay the same.\n\nIf you arrive and the door is locked, the office will open it. Do not wait in the corridor.\n\nThe Course Office",
        },
        {
          id: "gt-r-b1-03-r",
          level: 'B1',
          family: 'correspondence',
          freshness: 'current',
          script: "Dear Ms Nakamura,\n\nThank you for your application to the evening course in bookkeeping. I am writing with an offer of a place, and with two things you should know before you accept.\n\nThe class has moved from Tuesday to Wednesday. This was decided after the brochure was printed, and I am sorry the wrong day is still shown on our website; it will be corrected this week.\n\nThe course now runs for eleven weeks rather than twelve, because the room is unavailable in the last week of March. The syllabus has not been shortened; the missing session has been spread across the others, so most evenings will finish ten minutes later than advertised.\n\nIf either change makes the course impossible for you, tell me and I will hold your application for the spring group instead, at no cost.\n\nPlease reply by the fifteenth. Places not confirmed by then are offered to the waiting list.\n\nYours sincerely,\nTomas Erdely",
        },
        {
          id: "gt-r-b1-04-r",
          level: 'B1',
          family: 'notice',
          freshness: 'current',
          script: "NEW ENTRY CARDS — FROM THE FIRST OF THE MONTH\n\nThe old keys stop working on the first. Everyone has been issued a card; if you have not collected yours, it is at reception and you will need to sign for it.\n\nThe card opens the main door, the side door and the store room. It does not open the roof access, which now requires a second card held by the duty supervisor.\n\nHold the card flat against the reader and wait for the light to turn green. A red light twice usually means the card has been kept next to a phone. Give it a few seconds and try once more before assuming it has failed.\n\nIf the card genuinely will not work, do not prop the door open and do not follow someone else through. Use the intercom by the main door. Between six in the evening and seven in the morning the intercom rings the security desk rather than reception, and it may take a minute to be answered.\n\nA lost card must be reported the same day, even if you expect to find it. The first replacement is free.",
        },
        {
          id: "gt-r-b1-05-r",
          level: 'B1',
          family: 'notice',
          freshness: 'current',
          script: "BOOKING A ROOM AT THE COMMUNITY CENTRE\n\nRooms may be booked up to eight weeks ahead. Bookings are taken in person or by telephone during office hours; the form on the website tells us you are interested but does not hold the room.\n\nThe hall and the two upstairs rooms are charged by the hour. The small meeting room off the entrance is free for groups of six or fewer, and it is the only room that can be booked for the same day.\n\nYour booking includes fifteen minutes before and after for setting up and clearing away. If you need longer, say so when you book; asking on the day will usually not be possible because another group follows.\n\nChairs and tables are in the store under the stairs and must go back there. The kitchen may be used for tea and coffee. It may not be used for cooking, and the oven is disconnected.\n\nCancel at least two working days ahead and there is no charge. After that the room is charged in full, whether or not it is used, unless the centre itself has to close.",
        },
        {
          id: "gt-r-b1-06-r",
          level: 'B1',
          family: 'notice',
          freshness: 'current',
          script: "VISITORS TO THE SITE — READ AT THE GATE\n\nEvery visitor signs in at the cabin, including anyone who has been here before. The signing-in sheet is how we know who is on site if the alarm sounds, and a name that is not on it is a person nobody will look for.\n\nA hard hat, boots with a toe cap and a high-visibility jacket are required past the yellow line. Hats and jackets are lent at the cabin. Boots are not, so a visitor in ordinary shoes will be asked to stay on the near side of the line, where most deliveries can still be dealt with.\n\nDo not walk under the crane, even when it is still. The area is marked on the ground and the marks are kept clear for a reason.\n\nIf the alarm sounds, walk to the gate you came in by and wait on the pavement. Do not collect belongings and do not use a vehicle, as the access road is kept clear for the fire service.\n\nPhotography is allowed of your own work only. Photographs of the site as a whole need the site manager's agreement, and that is not something the cabin can give you.",
        },
        {
          id: "gt-r-b1-07-r",
          level: 'B1',
          family: 'correspondence',
          freshness: 'current',
          script: "Subject: Cover for the next three weeks\n\nHi everyone,\n\nAs most of you know, Farah is away from Monday for three weeks. Rather than ask one person to absorb it all, I have split the work.\n\nThe order sheet moves to Ken, who already does it on Fridays, so this is more of the same rather than something new. The supplier calls go to Dolores. Neither of you should be doing your own job and this on the same day; if that is what is happening, tell me on the day and not at the end of the week, when it is too late for me to do anything about it.\n\nThe part nobody has volunteered for is the Thursday stock count. I am not going to assign it. It is two hours and it is dull, and I would rather one of you chose it than resented it. If nobody offers by Wednesday I will do it myself, which is not a threat, simply what will happen.\n\nFarah has left notes in the shared folder. They are good notes, but they assume you know why the Tuesday order is placed early, and only Ken does. Ken, could you add a line?\n\nThanks,\nMarcus",
        },
        {
          id: "gt-r-b1-08-r",
          level: 'B1',
          family: 'correspondence',
          freshness: 'current',
          script: "Dear Ms Achebe,\n\nWe are writing about the date your monthly payment leaves your account.\n\nAt present it is taken on the twenty-eighth. From October it will be taken on the fourth of the month instead. The amount does not change and neither does anything else about your account.\n\nWe are making the change because a payment on the twenty-eighth falls before many people are paid, and we would rather move the date than continue to see payments returned. If the fourth suits you less well than the twenty-eighth, write or telephone and we will set a different day; almost any date can be arranged, and doing so does not affect your record with us.\n\nOne payment will be short. The September payment goes out on the twenty-eighth as usual, and the next on the fourth of November, which leaves October without one. You do not owe anything for that month; the schedule simply moves.\n\nYou do not need to do anything if the new date suits you.\n\nYours sincerely,\nCustomer Accounts",
        },
        {
          id: "gt-r-b1-09-r",
          level: 'B1',
          family: 'correspondence',
          freshness: 'current',
          script: "Subject: Pausing my membership\n\nDear Sir or Madam,\n\nI joined in March and I have been coming twice a week since. I am writing because I have surgery on my shoulder in three weeks and have been told not to lift anything for two months afterwards.\n\nI would rather pause than cancel. I have looked on your website and can find the cancellation page easily, but nothing about a pause, so I may be asking for something you do not offer. If that is the case, please say so plainly and I will cancel and rejoin later; I would prefer a clear no to a form that quietly becomes a cancellation.\n\nIf a pause is possible, I would like it to run from the first of next month for three months, which allows a few weeks after the two.\n\nI should add that I do not need a letter from the hospital to be requested. I can send one, but the surgery is not yet booked to a day, so the letter would say less than this email does.\n\nThank you,\nJoanna Petrov",
        },
        {
          id: "gt-r-b2-03-r",
          level: 'B2',
          family: 'argued',
          freshness: 'current',
          script: "THE CASE FOR SLOWER DELIVERY\n\nEvery retailer now competes on speed, and the competition has a strange feature: almost nobody asked for it.\n\nSurveys of online shoppers put delivery speed well below price, below reliability, and below knowing when the parcel will actually arrive. What people say they want is a window they can trust — an hour, a stated day, a message if it slips. Speed matters most in the small number of cases where something is needed for a fixed date, and those cases are visible at the moment of ordering.\n\nRetailers know this. They compete on speed anyway, because speed is the one promise that can be printed beside a price and compared. Reliability cannot be advertised in the same way: a company that keeps its window ninety-eight times in a hundred has nothing to put on the button.\n\nThe cost of the mismatch falls in two places. It falls on the delivery network, which is sized for the promise rather than for the demand, and it falls on the customer who did not want a two-hour slot and received one, along with the price of building it.\n\nThere is an argument on the other side, and it is not weak. A promise of speed is easy to check and therefore easy to hold a company to, while a promise of reliability is measured over months and is exactly the kind of claim a company can quietly stop meeting. Speed may be the wrong thing, competed for in the right way.",
        },
        {
          id: "gt-r-b2-04-r",
          level: 'B2',
          family: 'correspondence',
          freshness: 'current',
          script: "Subject: Refund for the withdrawn evening course — fourth request\n\nDear Ms Lindqvist,\n\nI am writing for the fourth time about the same matter, and I would like to set out plainly where it now stands, because I think the record matters more than my irritation.\n\nOn 3 June I paid £340 for an eight-week evening course. On 11 June the college withdrew the course, citing low numbers. That is entirely reasonable and I have never disputed it. The college's own terms say that a withdrawn course is refunded within twenty-eight days.\n\nI wrote on 14 June and was told the refund had been raised. I wrote on 2 July and was told the same. I wrote on 24 July and was told that the finance system had changed and that a small number of payments had been affected. Each reply has been prompt and courteous, and none has produced any money.\n\nWhat I would like now is different from what I asked for before. I no longer want an assurance that it has been raised; I have three of those. I would like either the money, or a date — a real one, from someone who can see the system — after which I can escalate with a clear conscience.\n\nI should say that I am not seeking compensation and have no wish to make a formal complaint. I would rather this ended quietly. But eleven weeks against a twenty-eight-day term is a long way past the point where patience is a virtue, and if I have not heard by the fifteenth I will write to the ombudsman, not out of anger but because I will have run out of other things to do.\n\nYours sincerely,\nDeclan Moore",
        },
        {
          id: "gt-r-b2-05-r",
          level: 'B2',
          family: 'correspondence',
          freshness: 'current',
          script: "Subject: Roof work, and the things you are about to ask\n\nDear residents,\n\nScaffolding goes up on the ninth and the roof work should take five weeks. Rather than send the short version and answer the same questions forty times, here is the long one.\n\nYes, there will be noise, and it will start at eight. The contract says half past seven and we have asked for eight; that is the only concession we managed and we did ask.\n\nNo, the scaffolding does not mean anyone can climb to your windows. It will be alarmed at night and the ground-floor ladders are removed each evening. This is the question we are asked most and it is a fair one, so please do not feel awkward raising it again.\n\nThe car park loses six spaces for the duration. We considered allocating the remaining spaces by need, and decided against it: every scheme we drew up required someone to judge whose need was greater, and we did not want to be that person or ask a neighbour to be. They will be first come, first served, which is unfair in a different and more obvious way.\n\nThe cost is met from the reserve fund. It does not affect the service charge this year. Whether it affects it next year depends on what the reserve is asked to cover after this, which nobody can honestly answer yet.\n\nFinally, the part we would rather not write. The survey found more decay than expected above flats 7 to 11. If it turns out to run further, the five weeks becomes seven or eight. We will tell you the day we know, rather than at the end of a week when the news has aged.\n\nThe Management Committee",
        },
        {
          id: "gt-r-b2-06-r",
          level: 'B2',
          family: 'correspondence',
          freshness: 'current',
          script: "Subject: Reference for Tomás Villanueva\n\nDear Ms Odell,\n\nThank you for asking. Tomás worked in my team for two and a half years and left of his own accord in April.\n\nHe is careful. I do not use that word loosely. In a department where the cost of an error is measured in weeks, he made very few, and the ones he made he raised himself before anyone found them. He is also the only person I have managed who consistently read a brief to the end before starting.\n\nYou ask specifically about leading a team of six. I have to be straightforward with you: I do not know. Tomás led a project of three for four months and it went well, though I would say the three were unusually experienced and largely led themselves. He has not been tested by anyone who needed managing rather than informing, and I would not want to tell you he has when he has not.\n\nWhat I can say is that when he did not know something, he said so on the day rather than at the review, which in my experience is the harder half of the job and the half people do not learn.\n\nHe was not the fastest member of the team and would not claim to be. If the role rewards speed above accuracy, there are people who would suit it better. If it is the other way round, I would take him back tomorrow, and I say that having been the person who accepted his resignation.\n\nYours sincerely,\nPriya Raghunathan",
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
          id: "gt-r-a1-04-q1",
          recordingId: "gt-r-a1-04-r",
          level: 'A1',
          stem: "When does the laundry room close?",
          options: [
            "10 pm",
            "When the machines stop",
            "Every day",
            "7 am",
          ],
          answer: 0,
          rationale: "The notice gives the hours as 7 am to 10 pm, so 10 pm is the closing time.",
        },
        {
          id: "gt-r-a1-04-q2",
          recordingId: "gt-r-a1-04-r",
          level: 'A1',
          stem: "How do you pay?",
          options: [
            "With coins",
            "With the building card",
            "At the door",
            "You do not pay",
          ],
          answer: 1,
          rationale: "It says the machines take the building card only and that there is no coin slot.",
        },
        {
          id: "gt-r-a1-04-q3",
          recordingId: "gt-r-a1-04-r",
          level: 'A1',
          stem: "What happens to clothes left after 10 pm?",
          options: [
            "They are thrown away",
            "They stay in the machine",
            "They are moved to a basket",
            "They are washed again",
          ],
          answer: 2,
          rationale: "The notice says clothes left after 10 pm are put in the basket by the door.",
        },
        {
          id: "gt-r-a1-04-q4",
          recordingId: "gt-r-a1-04-r",
          level: 'A1',
          stem: "A machine does not start. What should you do?",
          options: [
            "Wait until morning",
            "Use your card twice",
            "Try the machine again",
            "Report the number",
          ],
          answer: 3,
          rationale: "You write the number on the sheet by the sink, and the notice tells you not to use that machine again.",
        },
        {
          id: "gt-r-a1-05-q1",
          recordingId: "gt-r-a1-05-r",
          level: 'A1',
          stem: "Why is the stop closed?",
          options: [
            "Because of road work",
            "Because the bus has changed",
            "Because the post office is closed",
            "Because it is Monday",
          ],
          answer: 0,
          rationale: "The notice says work on the road starts on Monday and buses will not stop here.",
        },
        {
          id: "gt-r-a1-05-q2",
          recordingId: "gt-r-a1-05-r",
          level: 'A1',
          stem: "Where should you wait instead?",
          options: [
            "At the bus station",
            "At the next stop",
            "At the road work",
            "At home",
          ],
          answer: 1,
          rationale: "It tells passengers to walk to the next stop, outside the post office.",
        },
        {
          id: "gt-r-a1-05-q3",
          recordingId: "gt-r-a1-05-r",
          level: 'A1',
          stem: "What is not changing?",
          options: [
            "The two weeks of work",
            "The place you wait",
            "The bus and its times",
            "The road outside",
          ],
          answer: 2,
          rationale: "The last line says the number and the times do not change.",
        },
        {
          id: "gt-r-a1-06-q1",
          recordingId: "gt-r-a1-06-r",
          level: 'A1',
          stem: "What do you scan first?",
          options: [
            "The grey square",
            "The green light",
            "Your books",
            "Your card",
          ],
          answer: 3,
          rationale: "The first line says to scan your card first, and the books after that.",
        },
        {
          id: "gt-r-a1-06-q2",
          recordingId: "gt-r-a1-06-r",
          level: 'A1',
          stem: "When can you take a book off the square?",
          options: [
            "After the green light",
            "After you pay",
            "When the desk is open",
            "At once",
          ],
          answer: 0,
          rationale: "The notice says to wait for the green light before taking a book off.",
        },
        {
          id: "gt-r-a1-06-q3",
          recordingId: "gt-r-a1-06-r",
          level: 'A1',
          stem: "Where do you pay a charge?",
          options: [
            "At the machine",
            "At the front desk",
            "In the box outside",
            "You cannot pay",
          ],
          answer: 1,
          rationale: "The machine does not take money; charges are paid at the front desk.",
        },
        {
          id: "gt-r-a1-06-q4",
          recordingId: "gt-r-a1-06-r",
          level: 'A1',
          stem: "When can you return books?",
          options: [
            "Only with a card",
            "Only in the day",
            "At any time of night",
            "Only at the front desk",
          ],
          answer: 2,
          rationale: "Returns go in the box outside, which the notice says is open all night.",
        },
        {
          id: "gt-r-a1-07-q1",
          recordingId: "gt-r-a1-07-r",
          level: 'A1',
          stem: "Why has Rosa written?",
          options: [
            "To change where they meet",
            "To ask about the time",
            "To say she cannot come",
            "To ask for a book back",
          ],
          answer: 0,
          rationale: "The message keeps the time and moves the meeting to a new place because the first one is shut.",
        },
        {
          id: "gt-r-a1-07-q2",
          recordingId: "gt-r-a1-07-r",
          level: 'A1',
          stem: "What time will they meet?",
          options: [
            "Four o'clock",
            "Half past four",
            "Half past five",
            "It is not said",
          ],
          answer: 1,
          rationale: "Rosa keeps the time and writes it out: half past four.",
        },
        {
          id: "gt-r-a1-07-q3",
          recordingId: "gt-r-a1-07-r",
          level: 'A1',
          stem: "What is Rosa bringing?",
          options: [
            "Some money",
            "Nothing",
            "A book",
            "A key",
          ],
          answer: 2,
          rationale: "Rosa ends by saying she has Sam's book with her, so it is the book she is bringing to the library.",
        },
        {
          id: "gt-r-a1-08-q1",
          recordingId: "gt-r-a1-08-r",
          level: 'A1',
          stem: "Where is the parcel now?",
          options: [
            "At the door",
            "At the post office",
            "In the post box",
            "In Priya's room",
          ],
          answer: 3,
          rationale: "It would not fit in the box, so she has put it under her bed.",
        },
        {
          id: "gt-r-a1-08-q2",
          recordingId: "gt-r-a1-08-r",
          level: 'A1',
          stem: "When can Dan collect it?",
          options: [
            "After nine",
            "Tomorrow",
            "At any time today",
            "Before nine",
          ],
          answer: 0,
          rationale: "Priya is out until nine and tells Dan to knock, however late it is.",
        },
        {
          id: "gt-r-a1-08-q3",
          recordingId: "gt-r-a1-08-r",
          level: 'A1',
          stem: "What does Priya seem unsure about?",
          options: [
            "The time she gets home",
            "Signing for the parcel",
            "The size of the parcel",
            "Dan's address",
          ],
          answer: 1,
          rationale: "She mentions being asked to sign and adds that she hopes it was all right.",
        },
        {
          id: "gt-r-a1-09-q1",
          recordingId: "gt-r-a1-09-r",
          level: 'A1',
          stem: "What time should children arrive?",
          options: [
            "On Friday morning",
            "At nine",
            "At ten to nine",
            "At half past three",
          ],
          answer: 2,
          rationale: "The bus goes at nine and the letter asks people to be there ten minutes before.",
        },
        {
          id: "gt-r-a1-09-q2",
          recordingId: "gt-r-a1-09-r",
          level: 'A1',
          stem: "Why does the letter mention old shoes?",
          options: [
            "The walk to the farm is long",
            "New shoes are not allowed there",
            "The floor of the bus gets dirty",
            "Parts of the ground are wet",
          ],
          answer: 3,
          rationale: "It gives the wet ground as the reason for old shoes.",
        },
        {
          id: "gt-r-a1-09-q3",
          recordingId: "gt-r-a1-09-r",
          level: 'A1',
          stem: "What must children bring?",
          options: [
            "A coat and a lunch",
            "A book and a pen",
            "Nothing",
            "Money and a bag",
          ],
          answer: 0,
          rationale: "The letter asks for a coat and a packed lunch.",
        },
        {
          id: "gt-r-a1-09-q4",
          recordingId: "gt-r-a1-09-r",
          level: 'A1',
          stem: "When does the trip end?",
          options: [
            "At lunch time",
            "At half past three",
            "On Friday evening",
            "At nine",
          ],
          answer: 1,
          rationale: "The letter closes by saying the class is back by half past three, which is when the trip ends.",
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
          id: "gt-r-a2-04-q1",
          recordingId: "gt-r-a2-04-r",
          level: 'A2',
          stem: "What must you do with a plastic bottle before putting it in the blue bin?",
          options: [
            "Put it in a bag",
            "Leave the lid on",
            "Fill it with water",
            "Rinse it and squash it flat",
          ],
          answer: 3,
          rationale: "The blue bin instructions say to rinse anything that has held food and to squash bottles flat.",
        },
        {
          id: "gt-r-a2-04-q2",
          recordingId: "gt-r-a2-04-r",
          level: 'A2',
          stem: "Where does food waste go?",
          options: [
            "In a bag in the green bin",
            "Loose in the green bin",
            "In the glass bank",
            "In the grey bin",
          ],
          answer: 0,
          rationale: "Food waste goes in the green bin in the bags provided; loose food waste is not collected.",
        },
        {
          id: "gt-r-a2-04-q3",
          recordingId: "gt-r-a2-04-r",
          level: 'A2',
          stem: "Where do you take glass?",
          options: [
            "The grey bin",
            "The glass bank down the street",
            "Nowhere, it is collected",
            "The blue bin",
          ],
          answer: 1,
          rationale: "Glass is not collected from the building; the notice points to the glass bank beside the chemist.",
        },
        {
          id: "gt-r-a2-04-q4",
          recordingId: "gt-r-a2-04-r",
          level: 'A2',
          stem: "How do you get rid of a large item?",
          options: [
            "Take it to the glass bank",
            "Leave it beside the bins",
            "Telephone to arrange collection",
            "Wait for the next collection",
          ],
          answer: 2,
          rationale: "Large items are not taken with the bins; you ring the number on the door to arrange a collection.",
        },
        {
          id: "gt-r-a2-04-q5",
          recordingId: "gt-r-a2-04-r",
          level: 'A2',
          stem: "How long does a large-item collection usually take?",
          options: [
            "Two weeks",
            "It is not said",
            "The same day",
            "About five working days",
          ],
          answer: 3,
          rationale: "The notice says a collection is usually arranged within five working days.",
        },
        {
          id: "gt-r-a2-05-q1",
          recordingId: "gt-r-a2-05-r",
          level: 'A2',
          stem: "When does the desk shut on Saturday?",
          options: [
            "At one in the afternoon",
            "At six in the evening",
            "It does not open",
            "At nine in the morning",
          ],
          answer: 0,
          rationale: "Saturday hours run from 9 am to 1 pm; Sunday is the closed day.",
        },
        {
          id: "gt-r-a2-05-q2",
          recordingId: "gt-r-a2-05-r",
          level: 'A2',
          stem: "What must you always bring?",
          options: [
            "A note from a friend",
            "A photo card or passport",
            "Your old medicine",
            "Money for the machine",
          ],
          answer: 1,
          rationale: "The notice asks for a card or passport with your photo on it every time.",
        },
        {
          id: "gt-r-a2-05-q3",
          recordingId: "gt-r-a2-05-r",
          level: 'A2',
          stem: "You are picking up for your neighbour. What else do you need?",
          options: [
            "Nothing else",
            "Your neighbour with you",
            "A short signed note",
            "A second photo card",
          ],
          answer: 2,
          rationale: "As well as photo identification, you bring a short note from that person with their name signed.",
        },
        {
          id: "gt-r-a2-05-q4",
          recordingId: "gt-r-a2-05-r",
          level: 'A2',
          stem: "Where is your medicine after seven days?",
          options: [
            "Sent back to the doctor",
            "Thrown away",
            "Still at this desk",
            "At the counter inside",
          ],
          answer: 3,
          rationale: "It moves to the counter inside the shop, where it can still be collected, though the wait is normally longer.",
        },
        {
          id: "gt-r-a2-05-q5",
          recordingId: "gt-r-a2-05-r",
          level: 'A2',
          stem: "What is the wall machine for?",
          options: [
            "Repeat orders",
            "Paying money",
            "Photo cards",
            "New orders",
          ],
          answer: 0,
          rationale: "The machine handles repeat orders only and cannot take a new one.",
        },
        {
          id: "gt-r-a2-06-q1",
          recordingId: "gt-r-a2-06-r",
          level: 'A2',
          stem: "Which lane is the fast one?",
          options: [
            "The middle one",
            "The one by the steps",
            "Any of them",
            "The one by the window",
          ],
          answer: 1,
          rationale: "The notice puts slow by the window, medium in the middle and fast by the steps.",
        },
        {
          id: "gt-r-a2-06-q2",
          recordingId: "gt-r-a2-06-r",
          level: 'A2',
          stem: "How should you choose a lane?",
          options: [
            "By where you get in",
            "By how far you swim",
            "By how fast you swim",
            "By which is emptiest",
          ],
          answer: 2,
          rationale: "It says to choose by how fast you actually swim, not by how far.",
        },
        {
          id: "gt-r-a2-06-q3",
          recordingId: "gt-r-a2-06-r",
          level: 'A2',
          stem: "Where do you rest?",
          options: [
            "Outside the pool",
            "On the steps",
            "In the middle of the lane",
            "In the corner at the end",
          ],
          answer: 3,
          rationale: "You stop at the end rather than the middle, and move into the corner so the lane stays clear.",
        },
        {
          id: "gt-r-a2-06-q4",
          recordingId: "gt-r-a2-06-r",
          level: 'A2',
          stem: "What happens at half past seven?",
          options: [
            "The lanes are taken out",
            "The club swims in one lane",
            "Swimming becomes slower",
            "The pool closes",
          ],
          answer: 0,
          rationale: "The lanes come out for the club and the whole pool becomes general swimming; it does not close.",
        },
        {
          id: "gt-r-a2-07-q1",
          recordingId: "gt-r-a2-07-r",
          level: 'A2',
          stem: "What is wrong with the window?",
          options: [
            "It will not open",
            "It is broken in the middle",
            "It leaves a gap when shut",
            "It has no glass",
          ],
          answer: 2,
          rationale: "It closes, but a gap remains at the top and rain enters when the wind blows that way.",
        },
        {
          id: "gt-r-a2-07-q2",
          recordingId: "gt-r-a2-07-r",
          level: 'A2',
          stem: "Why does Anna say she cannot wait long?",
          options: [
            "She has no towels",
            "The window will fall",
            "She is moving out",
            "The wood is going dark",
          ],
          answer: 3,
          rationale: "She points to the wood below the window already darkening as the reason not to leave it for weeks.",
        },
        {
          id: "gt-r-a2-07-q3",
          recordingId: "gt-r-a2-07-r",
          level: 'A2',
          stem: "How can someone get in on a Friday?",
          options: [
            "Through the neighbour with a key",
            "They cannot",
            "Only in the morning",
            "Anna will be at home",
          ],
          answer: 0,
          rationale: "On days other than Tuesday and Thursday mornings, the neighbour in flat 5 can let someone in.",
        },
        {
          id: "gt-r-a2-07-q4",
          recordingId: "gt-r-a2-07-r",
          level: 'A2',
          stem: "How does Anna want to be answered?",
          options: [
            "By telephone",
            "By a message",
            "In person",
            "She does not say",
          ],
          answer: 1,
          rationale: "She says a message is fine and that a telephone call is not needed.",
        },
        {
          id: "gt-r-a2-08-q1",
          recordingId: "gt-r-a2-08-r",
          level: 'A2',
          stem: "Why has Ben not returned the ladder?",
          options: [
            "Marta is away from home",
            "He is still using it",
            "A part has broken off",
            "He cannot find it",
          ],
          answer: 2,
          rationale: "A foot came off while he was folding it, so he has kept it back rather than hand it over damaged.",
        },
        {
          id: "gt-r-a2-08-q2",
          recordingId: "gt-r-a2-08-r",
          level: 'A2',
          stem: "Why did Ben not mend it himself?",
          options: [
            "He had no time on Sunday",
            "He had no tools at all",
            "He could not find the part",
            "He feared causing more damage",
          ],
          answer: 3,
          rationale: "He found the part and thinks it fits, but did not force it in case he damaged something else.",
        },
        {
          id: "gt-r-a2-08-q3",
          recordingId: "gt-r-a2-08-r",
          level: 'A2',
          stem: "Who is paying for the repair?",
          options: [
            "Ben is",
            "The shop is",
            "Nobody is",
            "Marta is",
          ],
          answer: 0,
          rationale: "Ben states that he will pay whatever the repair costs, and names the shop and the day.",
        },
        {
          id: "gt-r-a2-08-q4",
          recordingId: "gt-r-a2-08-r",
          level: 'A2',
          stem: "What does Ben offer to do?",
          options: [
            "Buy a replacement ladder",
            "Return it damaged if needed",
            "Keep it until the spring",
            "Lend Marta his own one",
          ],
          answer: 1,
          rationale: "If Marta needs the ladder before Wednesday, he will bring it back immediately in its present state.",
        },
        {
          id: "gt-r-a2-09-q1",
          recordingId: "gt-r-a2-09-r",
          level: 'A2',
          stem: "What has changed?",
          options: [
            "The time",
            "The day",
            "The room",
            "The teacher",
          ],
          answer: 2,
          rationale: "Only the room moves; the day, time and teacher are all said to stay the same.",
        },
        {
          id: "gt-r-a2-09-q2",
          recordingId: "gt-r-a2-09-r",
          level: 'A2',
          stem: "Why has it changed?",
          options: [
            "The teacher asked for it",
            "The office needs room 12",
            "The old room is too small",
            "There is no lift to the old room",
          ],
          answer: 3,
          rationale: "Room 12 has no lift access and one of the group now finds stairs difficult.",
        },
        {
          id: "gt-r-a2-09-q3",
          recordingId: "gt-r-a2-09-r",
          level: 'A2',
          stem: "Where should bags go?",
          options: [
            "At the front",
            "In the office",
            "Outside the door",
            "In the aisle",
          ],
          answer: 0,
          rationale: "Because the new room is smaller, bags go at the front and not in the aisle.",
        },
        {
          id: "gt-r-a2-09-q4",
          recordingId: "gt-r-a2-09-r",
          level: 'A2',
          stem: "The door is locked when you arrive. What should you do?",
          options: [
            "Wait in the corridor",
            "Ask at the office",
            "Go to room 12",
            "Go home",
          ],
          answer: 1,
          rationale: "The office will open it, and the notice says not to wait in the corridor.",
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
          id: "gt-r-b1-04-q1",
          recordingId: "gt-r-b1-04-r",
          level: 'B1',
          stem: "What does the new card not open?",
          options: [
            "The store room",
            "The roof access",
            "The main door",
            "The side door",
          ],
          answer: 1,
          rationale: "The card opens the main door, side door and store room; roof access needs a second card held by the duty supervisor.",
        },
        {
          id: "gt-r-b1-04-q2",
          recordingId: "gt-r-b1-04-r",
          level: 'B1',
          stem: "The reader shows red twice. What does the notice suggest?",
          options: [
            "You need the supervisor's card",
            "The card has failed",
            "The card may have been next to a phone",
            "The door is locked for the night",
          ],
          answer: 2,
          rationale: "Two red lights usually mean the card has been kept next to a phone, and you should wait a few seconds and try again.",
        },
        {
          id: "gt-r-b1-04-q3",
          recordingId: "gt-r-b1-04-r",
          level: 'B1',
          stem: "Your card will not work at all. What should you do?",
          options: [
            "Go to the roof entrance",
            "Prop the door open",
            "Follow a colleague through",
            "Use the intercom",
          ],
          answer: 3,
          rationale: "The notice forbids propping the door and following someone through, and directs you to the intercom.",
        },
        {
          id: "gt-r-b1-04-q4",
          recordingId: "gt-r-b1-04-r",
          level: 'B1',
          stem: "You press the intercom at nine in the evening. Who answers?",
          options: [
            "The security desk",
            "The duty supervisor",
            "Nobody until seven",
            "Reception",
          ],
          answer: 0,
          rationale: "Between six in the evening and seven in the morning the intercom rings the security desk rather than reception.",
        },
        {
          id: "gt-r-b1-04-q5",
          recordingId: "gt-r-b1-04-r",
          level: 'B1',
          stem: "You think you have mislaid your card but expect it to turn up. What does the notice ask?",
          options: [
            "Wait a day before reporting it",
            "Report it the same day",
            "Report it only if it is not found",
            "Collect a second card first",
          ],
          answer: 1,
          rationale: "A lost card must be reported the same day even if you expect to find it.",
        },
        {
          id: "gt-r-b1-05-q1",
          recordingId: "gt-r-b1-05-r",
          level: 'B1',
          stem: "What does filling in the website form do?",
          options: [
            "It reserves the hall only",
            "It books the room",
            "It tells the centre you are interested",
            "It cancels a booking",
          ],
          answer: 2,
          rationale: "The form registers interest; it does not hold the room, which is booked in person or by telephone.",
        },
        {
          id: "gt-r-b1-05-q2",
          recordingId: "gt-r-b1-05-r",
          level: 'B1',
          stem: "Which room can be booked for the same day?",
          options: [
            "Any of them",
            "The hall",
            "Either upstairs room",
            "The small meeting room",
          ],
          answer: 3,
          rationale: "The small meeting room off the entrance is the only room bookable on the day.",
        },
        {
          id: "gt-r-b1-05-q3",
          recordingId: "gt-r-b1-05-r",
          level: 'B1',
          stem: "What is included in the time you book?",
          options: [
            "Fifteen minutes each side",
            "Nothing extra",
            "Use of the oven",
            "An extra hour",
          ],
          answer: 0,
          rationale: "Bookings include fifteen minutes before and after for setting up and clearing away.",
        },
        {
          id: "gt-r-b1-05-q4",
          recordingId: "gt-r-b1-05-r",
          level: 'B1',
          stem: "What may the kitchen be used for?",
          options: [
            "Cooking a meal",
            "Tea and coffee",
            "Storing chairs",
            "Nothing at all",
          ],
          answer: 1,
          rationale: "Tea and coffee are allowed; cooking is not, and the oven is disconnected.",
        },
        {
          id: "gt-r-b1-05-q5",
          recordingId: "gt-r-b1-05-r",
          level: 'B1',
          stem: "You cancel the morning before your booking. What happens?",
          options: [
            "The booking moves",
            "Nothing is owed",
            "You pay the whole price",
            "You pay half",
          ],
          answer: 2,
          rationale: "Free cancellation requires at least two working days; later than that the room is charged in full.",
        },
        {
          id: "gt-r-b1-06-q1",
          recordingId: "gt-r-b1-06-r",
          level: 'B1',
          stem: "Who has to sign in?",
          options: [
            "Only contractors",
            "Anyone going past the yellow line",
            "First-time visitors",
            "Every visitor",
          ],
          answer: 3,
          rationale: "The notice says every visitor signs in, including those who have been on site before.",
        },
        {
          id: "gt-r-b1-06-q2",
          recordingId: "gt-r-b1-06-r",
          level: 'B1',
          stem: "Why does the notice say the sheet matters?",
          options: [
            "It names who might still be inside",
            "It is required by the crane operator",
            "It records the hours people work",
            "It shows who is owed payment",
          ],
          answer: 0,
          rationale: "The sheet is how the site knows who is present if the alarm sounds; a name not on it is a person nobody will look for.",
        },
        {
          id: "gt-r-b1-06-q3",
          recordingId: "gt-r-b1-06-r",
          level: 'B1',
          stem: "A visitor arrives in ordinary shoes. What happens?",
          options: [
            "Boots are lent at the cabin",
            "They keep to the near side",
            "They are sent away",
            "They may pass in a hard hat",
          ],
          answer: 1,
          rationale: "Hats and jackets are lent but boots are not, so the visitor stays on the near side, where most deliveries can be handled.",
        },
        {
          id: "gt-r-b1-06-q4",
          recordingId: "gt-r-b1-06-r",
          level: 'B1',
          stem: "What should you do if the alarm sounds?",
          options: [
            "Fetch your belongings first",
            "Drive out along the road",
            "Leave by the gate you entered",
            "Shelter beneath the crane",
          ],
          answer: 2,
          rationale: "You walk to the gate you entered by and wait on the pavement, without collecting belongings or using a vehicle.",
        },
        {
          id: "gt-r-b1-06-q5",
          recordingId: "gt-r-b1-06-r",
          level: 'B1',
          stem: "What may you photograph without asking?",
          options: [
            "The crane",
            "Nothing",
            "The whole site",
            "Your own work",
          ],
          answer: 3,
          rationale: "Photography of your own work is allowed; photographs of the site as a whole need the site manager's agreement.",
        },
        {
          id: "gt-r-b1-07-q1",
          recordingId: "gt-r-b1-07-r",
          level: 'B1',
          stem: "Why has Marcus divided the work?",
          options: [
            "To get the work finished faster",
            "Because Farah asked him to",
            "To spread it over three people",
            "Because Ken is away as well",
          ],
          answer: 2,
          rationale: "He says he chose not to ask a single person to absorb all of Farah's work, and split it instead.",
        },
        {
          id: "gt-r-b1-07-q2",
          recordingId: "gt-r-b1-07-r",
          level: 'B1',
          stem: "Why does he give Ken the order sheet?",
          options: [
            "Ken asked for it",
            "Nobody else can",
            "Ken has least to do",
            "Ken already does it on Fridays",
          ],
          answer: 3,
          rationale: "Ken already handles it on Fridays, so it is more of the same rather than new work.",
        },
        {
          id: "gt-r-b1-07-q3",
          recordingId: "gt-r-b1-07-r",
          level: 'B1',
          stem: "What does Marcus ask people to do straight away?",
          options: [
            "Report a clash the same day",
            "Send a weekly summary",
            "Write to Farah",
            "Rearrange their own work",
          ],
          answer: 0,
          rationale: "He wants to hear on the day, because at the end of the week it is too late for him to act.",
        },
        {
          id: "gt-r-b1-07-q4",
          recordingId: "gt-r-b1-07-r",
          level: 'B1',
          stem: "Why will he not assign the stock count?",
          options: [
            "It is not important",
            "He would rather someone chose it",
            "He has already given it away",
            "Farah will do it",
          ],
          answer: 1,
          rationale: "He says he would rather one of them chose it than resented it, and will take it himself if nobody offers.",
        },
        {
          id: "gt-r-b1-07-q5",
          recordingId: "gt-r-b1-07-r",
          level: 'B1',
          stem: "What is missing from Farah's notes?",
          options: [
            "The name of the shared folder",
            "The number for the supplier",
            "Why the Tuesday order is early",
            "The time of the stock count",
          ],
          answer: 2,
          rationale: "The notes assume the reader knows why the Tuesday order goes in early, and only Ken does.",
        },
        {
          id: "gt-r-b1-08-q1",
          recordingId: "gt-r-b1-08-r",
          level: 'B1',
          stem: "What is the letter mainly about?",
          options: [
            "A closed account",
            "A missed payment",
            "A rise in the amount",
            "A move in the payment day",
          ],
          answer: 3,
          rationale: "Only the day the money leaves is changing; the amount and everything else stay as they are.",
        },
        {
          id: "gt-r-b1-08-q2",
          recordingId: "gt-r-b1-08-r",
          level: 'B1',
          stem: "Why is the company making the change?",
          options: [
            "To reduce returned payments",
            "To increase what it collects",
            "Because customers complained about the amount",
            "To close the account sooner",
          ],
          answer: 0,
          rationale: "The old date falls before many people are paid, and the company would rather move it than keep seeing payments returned.",
        },
        {
          id: "gt-r-b1-08-q3",
          recordingId: "gt-r-b1-08-r",
          level: 'B1',
          stem: "What happens if the new date does not suit?",
          options: [
            "Nothing can be done",
            "Another day can be arranged",
            "The account is closed",
            "A charge is added",
          ],
          answer: 1,
          rationale: "The letter invites the reader to get in touch and says almost any date can be arranged.",
        },
        {
          id: "gt-r-b1-08-q4",
          recordingId: "gt-r-b1-08-r",
          level: 'B1',
          stem: "What does the reader owe for October?",
          options: [
            "Two payments",
            "Half a payment",
            "Nothing",
            "One payment",
          ],
          answer: 2,
          rationale: "October has no payment because the schedule moves, and the letter says nothing is owed for it.",
        },
        {
          id: "gt-r-b1-08-q5",
          recordingId: "gt-r-b1-08-r",
          level: 'B1',
          stem: "What must the reader do if the new date is fine?",
          options: [
            "Send a new form",
            "Reply to confirm",
            "Telephone the office",
            "Nothing at all",
          ],
          answer: 3,
          rationale: "The last line says no action is needed if the new date suits.",
        },
        {
          id: "gt-r-b1-09-q1",
          recordingId: "gt-r-b1-09-r",
          level: 'B1',
          stem: "Why is Joanna writing?",
          options: [
            "To ask whether a pause is possible",
            "To cancel at once",
            "To change her class times",
            "To complain about the fee",
          ],
          answer: 0,
          rationale: "She asks to pause rather than cancel and is not sure the club offers it.",
        },
        {
          id: "gt-r-b1-09-q2",
          recordingId: "gt-r-b1-09-r",
          level: 'B1',
          stem: "Why is she unsure it can be done?",
          options: [
            "A member told her so",
            "The website mentions cancelling but not pausing",
            "She has been refused before",
            "She joined too recently",
          ],
          answer: 1,
          rationale: "She found the cancellation page easily and nothing about pausing, so she may be asking for something not offered.",
        },
        {
          id: "gt-r-b1-09-q3",
          recordingId: "gt-r-b1-09-r",
          level: 'B1',
          stem: "What does she say she would prefer?",
          options: [
            "A telephone call",
            "A partial refund",
            "A clear refusal",
            "A long form",
          ],
          answer: 2,
          rationale: "She says a plain no is better than a form that quietly turns into a cancellation.",
        },
        {
          id: "gt-r-b1-09-q4",
          recordingId: "gt-r-b1-09-r",
          level: 'B1',
          stem: "How long does she ask for?",
          options: [
            "Six weeks",
            "Until March",
            "Two months",
            "Three months",
          ],
          answer: 3,
          rationale: "She asks for three months from the first of next month, allowing a few weeks beyond the two she was told to rest.",
        },
        {
          id: "gt-r-b1-09-q5",
          recordingId: "gt-r-b1-09-r",
          level: 'B1',
          stem: "Why does she mention a hospital letter?",
          options: [
            "To explain it would add little at present",
            "To prove she is a member",
            "She has enclosed one",
            "To ask the club to request one",
          ],
          answer: 0,
          rationale: "The surgery has no date yet, so a letter would say less than her email does.",
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
        {
          id: "gt-r-b2-04-q1",
          recordingId: "gt-r-b2-04-r",
          level: 'B2',
          stem: "What does the writer say he is not disputing?",
          options: [
            "The size of the refund",
            "The decision to withdraw the course",
            "The date he paid",
            "The college's terms",
          ],
          answer: 1,
          rationale: "He calls the withdrawal for low numbers entirely reasonable and says he has never argued with it.",
        },
        {
          id: "gt-r-b2-04-q2",
          recordingId: "gt-r-b2-04-r",
          level: 'B2',
          stem: "How does he describe the replies he has had?",
          options: [
            "Contradictory",
            "Rude but useful",
            "Polite and prompt, but empty",
            "Slow and vague",
          ],
          answer: 2,
          rationale: "He notes that every reply has been prompt and courteous while producing no money.",
        },
        {
          id: "gt-r-b2-04-q3",
          recordingId: "gt-r-b2-04-r",
          level: 'B2',
          stem: "What is he asking for that he did not ask for before?",
          options: [
            "A place on another course",
            "A larger sum of money",
            "A written apology",
            "A date he can rely on",
          ],
          answer: 3,
          rationale: "He says he no longer wants an assurance and would accept either the money or a real date from someone who can see the system.",
        },
        {
          id: "gt-r-b2-04-q4",
          recordingId: "gt-r-b2-04-r",
          level: 'B2',
          stem: "Why does he mention the twenty-eight-day term?",
          options: [
            "To measure how far past it the college is",
            "To ask for it to be extended",
            "To explain why he enrolled",
            "To show he paid on time",
          ],
          answer: 0,
          rationale: "He sets eleven weeks against the twenty-eight days to show the gap between the term and what has happened.",
        },
        {
          id: "gt-r-b2-04-q5",
          recordingId: "gt-r-b2-04-r",
          level: 'B2',
          stem: "How does he present the mention of the ombudsman?",
          options: [
            "As a threat made in anger",
            "As what is left when nothing else remains",
            "As a step already taken",
            "As a request for compensation",
          ],
          answer: 1,
          rationale: "He says it would not be out of anger but because he will have run out of other things to do.",
        },
        {
          id: "gt-r-b2-04-q6",
          recordingId: "gt-r-b2-04-r",
          level: 'B2',
          stem: "What does the writer say about a formal complaint?",
          options: [
            "He was advised to make one",
            "He has already made one",
            "He does not wish to make one",
            "He will make one on the fifteenth",
          ],
          answer: 2,
          rationale: "He states that he is not seeking compensation and has no wish to complain formally, and would rather it ended quietly.",
        },
        {
          id: "gt-r-b2-05-q1",
          recordingId: "gt-r-b2-05-r",
          level: 'B2',
          stem: "Why has the committee written at length?",
          options: [
            "Because residents complained",
            "To ask for a vote",
            "To satisfy a legal requirement",
            "To avoid answering the same questions repeatedly",
          ],
          answer: 3,
          rationale: "They say they would rather write the long version than answer the same questions forty times.",
        },
        {
          id: "gt-r-b2-05-q2",
          recordingId: "gt-r-b2-05-r",
          level: 'B2',
          stem: "What does the letter say about the start time?",
          options: [
            "Eight is a concession they obtained",
            "Residents chose it",
            "Work begins at half past seven",
            "It could not be moved at all",
          ],
          answer: 0,
          rationale: "The contract allows half past seven and they negotiated eight, describing it as the only concession they managed.",
        },
        {
          id: "gt-r-b2-05-q3",
          recordingId: "gt-r-b2-05-r",
          level: 'B2',
          stem: "How is the parking to be handled?",
          options: [
            "By allocating on need",
            "First come, first served",
            "By a rota",
            "By charging for spaces",
          ],
          answer: 1,
          rationale: "They rejected allocation by need and chose first come, first served, calling it unfair in a more obvious way.",
        },
        {
          id: "gt-r-b2-05-q4",
          recordingId: "gt-r-b2-05-r",
          level: 'B2',
          stem: "Why did they reject allocating spaces by need?",
          options: [
            "There were too few spaces",
            "It would have cost too much",
            "Someone would have to judge between neighbours",
            "The council forbade it",
          ],
          answer: 2,
          rationale: "Every scheme required someone to decide whose need was greater, and they did not want that role or to give it to a neighbour.",
        },
        {
          id: "gt-r-b2-05-q5",
          recordingId: "gt-r-b2-05-r",
          level: 'B2',
          stem: "What do they say about next year's service charge?",
          options: [
            "Residents will vote on it",
            "A rise is already agreed",
            "The reserve fund will be closed",
            "It cannot honestly be predicted",
          ],
          answer: 3,
          rationale: "They say it depends on what the reserve is asked to cover next, which nobody can answer honestly at this stage.",
        },
        {
          id: "gt-r-b2-05-q6",
          recordingId: "gt-r-b2-05-r",
          level: 'B2',
          stem: "What is their approach to bad news about the roof?",
          options: [
            "To report it the day they know",
            "To include it in the annual report",
            "To raise it at a meeting",
            "To confirm it before saying anything",
          ],
          answer: 0,
          rationale: "They promise to tell residents the day they know rather than at the end of a week when the news has aged.",
        },
        {
          id: "gt-r-b2-06-q1",
          recordingId: "gt-r-b2-06-r",
          level: 'B2',
          stem: "What is the writer's overall position?",
          options: [
            "A neutral confirmation of dates",
            "A warm recommendation with a stated limit",
            "A refusal to recommend",
            "A recommendation she was told to give",
          ],
          answer: 1,
          rationale: "She praises him strongly and says she would take him back, while stating plainly what she cannot vouch for.",
        },
        {
          id: "gt-r-b2-06-q2",
          recordingId: "gt-r-b2-06-r",
          level: 'B2',
          stem: "Why does she mention the errors he made?",
          options: [
            "To explain why he left",
            "To show there were many",
            "To show he reported them himself",
            "To warn against hiring him",
          ],
          answer: 2,
          rationale: "The point is that the few errors he made he raised himself before anyone else found them.",
        },
        {
          id: "gt-r-b2-06-q3",
          recordingId: "gt-r-b2-06-r",
          level: 'B2',
          stem: "What is her answer about leading six people?",
          options: [
            "He has done it before",
            "He is ready for it",
            "He is not capable of it",
            "She does not know",
          ],
          answer: 3,
          rationale: "She says directly that she does not know, because the team he led was small and largely led itself.",
        },
        {
          id: "gt-r-b2-06-q4",
          recordingId: "gt-r-b2-06-r",
          level: 'B2',
          stem: "How does she describe the three he led?",
          options: [
            "Experienced and self-directed",
            "Difficult to manage",
            "Chosen by her",
            "Newly appointed",
          ],
          answer: 0,
          rationale: "She calls them unusually experienced and says they largely led themselves.",
        },
        {
          id: "gt-r-b2-06-q5",
          recordingId: "gt-r-b2-06-r",
          level: 'B2',
          stem: "What does she call the harder half of the job?",
          options: [
            "Reading every brief closely",
            "Admitting ignorance at once",
            "Managing a much larger team",
            "Working at a fast pace",
          ],
          answer: 1,
          rationale: "Admitting on the day rather than at the review is what she calls the harder half, and the half people do not learn.",
        },
        {
          id: "gt-r-b2-06-q6",
          recordingId: "gt-r-b2-06-r",
          level: 'B2',
          stem: "What kind of role does she suggest may not suit him?",
          options: [
            "One requiring written reports",
            "One in a new department",
            "One that rewards speed over accuracy",
            "One with a small team",
          ],
          answer: 2,
          rationale: "She was not the fastest, and she says others would suit a role that puts speed above accuracy.",
        },
        {
          id: "gt-r-b2-06-q7",
          recordingId: "gt-r-b2-06-r",
          level: 'B2',
          stem: "Why does she mention accepting his resignation?",
          options: [
            "To explain a gap in his record",
            "To correct his account of leaving",
            "To show she was glad he left",
            "To give the offer its weight",
          ],
          answer: 3,
          rationale: "Saying she would have him back while having been the one who accepted his resignation is what gives the offer its force.",
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
