/**
 * The English strings. This file is the KEY LIST — `fr.ts` is checked
 * against it, and `scripts/i18n-audit.mjs` fails the build on a key that
 * exists here and not there.
 */
export const EN = {
  'nav.dashboard': 'Dashboard',
  'nav.speaking': 'Speaking',
  'nav.listening': 'Listening',
  'nav.reading': 'Reading',
  'nav.writing': 'Writing',
  'nav.vocabulary': 'Vocabulary',
  'nav.progress': 'Progress',
  'nav.settings': 'Settings',

  'common.loading': 'Loading…',
  'common.continue': 'Continue',
  'common.chooseExam': 'Choose an exam',

  'lang.label': 'Interface language',
  'lang.help': 'The language of the app. Your exam stays in its own language — they are independent.',
  'lang.en': 'English',
  'lang.fr': 'Français',

  'onboarding.title': 'Which exam are you sitting?',
  'onboarding.subtitle':
    'It is the only thing we need to start. No placement test, no level — the exam gives every candidate the same tasks, so there is nothing to place you on.',
  'onboarding.complete': 'Complete — all four skills built.',
  'onboarding.partial': '{built} only. {missing} not built yet.',
  'onboarding.onlyBuilt':
    'Only exams that are actually built are listed. An exam offered but unbuilt would be a claim we cannot keep.',
  'onboarding.satBefore': 'Have you sat it before?',
  'onboarding.satBeforeHelp':
    'If you have, your real marks build a better plan than any test we could give you — however long ago it was. If you have not, we start teaching now.',
  'onboarding.yes': 'Yes — enter my marks',
  'onboarding.no': 'No — start teaching',
  'onboarding.neverBlocked':
    'Skipping changes nothing about what you can use. You will be asked again later, and never blocked.',

  'practice.chooseExamFirst': 'Choose your exam first',
  'practice.writingNeedsExam':
    'Writing practice is the tasks of the exam you are sitting — its instructions, its word bands, its clock. Without an exam there is nothing honest to practise against.',
  'practice.speakingNeedsExam':
    'Speaking practice is the speaking tasks of the exam you are sitting, in its language and with its timing — not a generic cue card.',
  'practice.pronunciationNeedsExam':
    'Pronunciation practice reads lines from the exam you are sitting, in its language.',
  'practice.tasksAsSet': '{exam} — writing tasks, as the exam sets them.',
  'practice.pickAnother': 'Pick another task',
  'practice.zeroTitle': 'What scores zero here',
  'practice.zeroHelp': "Whatever the quality of the language. These are the exam's rules, not ours.",
  'practice.ourSplit': "(our split of the exam's published total)",
} as const;
