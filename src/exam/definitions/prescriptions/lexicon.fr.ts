/**
 * The French word lists the detectors count.
 *
 * They lived inside `engine/diagnose.ts` until 2026-08-28, which made that
 * file the sixth instance of the defect class THE PLAN §5.2 names: a value
 * that should have come from configuration, written into code instead.
 * `types.ts` states the rule the engine is meant to keep — *"nothing here
 * names an exam, a language, a scale or a criterion"* — and a French
 * connective list in `engine/` breaks it as surely as `startsWith('en')` did.
 *
 * So the engine counts; the language lives here, beside the cells that use
 * it. A Spanish exam adds a file and no branch.
 *
 * ⚠ Every list below is ours and unreviewed. They are the fifth thing
 * waiting on the francophone reviewer.
 */

/** Opposition and concession, B1 and below. A floor test, not a style score. */
export const CONTRAST = [
  'en revanche', 'tandis que', 'alors que', 'au contraire', 'contrairement',
  'cependant', 'pourtant', 'toutefois', 'à l’inverse', "à l'inverse",
  'par contre', 's’oppose', "s'oppose", 'désaccord', 'là où', 'mais',
];

/**
 * The subset that marks contrast STRUCTURALLY rather than in passing.
 * `mais` is excluded, and the measurement that put it there is in
 * `diagnose.ts`.
 */
export const STRUCTURAL_CONTRAST = [
  'en revanche', 'tandis que', 'alors que', 'au contraire', 'contrairement',
  'à l’inverse', "à l'inverse", 'par contre', 's’oppose', "s'oppose",
  'désaccord', 'là où', 'cependant', 'pourtant', 'toutefois',
];

/** Where the candidate's own opinion lives. */
export const STANCE = [
  'je pense', 'à mon avis', 'pour ma part', 'selon moi', 'je trouve',
  'je crois', 'j’estime', "j'estime", 'il me semble',
];

/**
 * Evaluative adjectives — the words a candidate reaches for when they have
 * not got a fact. *"La formation était très intéressante"* tells the reader
 * what to feel and nothing they could repeat to someone else.
 */
export const EVALUATIVE = [
  'intéressant', 'intéressante', 'intéressants', 'intéressantes',
  'utile', 'utiles', 'formidable', 'formidables', 'enrichissant',
  'enrichissante', 'super', 'génial', 'géniale', 'excellent', 'excellente',
  'agréable', 'agréables', 'sympa', 'magnifique', 'extraordinaire',
  'important', 'importante', 'bien', 'très bien', 'satisfaisant',
];

/** What the candidate says they now know. Tâche 1's second requirement. */
export const LEARNED = [
  'j’ai appris', "j'ai appris", 'nous avons appris', 'j’ai retenu', "j'ai retenu",
  'j’ai compris', "j'ai compris", 'j’ai découvert', "j'ai découvert",
  'je sais maintenant', 'je sais désormais', 'ce que je retiens',
  'j’ai acquis', "j'ai acquis", 'je suis maintenant capable',
];

/** Sequence markers — a narrative that moves. */
export const SEQUENCE = [
  "d’abord", "d'abord", 'ensuite', 'puis', 'enfin', 'ce jour-là', 'ce matin-là',
  'le lendemain', 'plus tard', 'au début', 'à la fin', 'après', 'avant',
  'quand', 'lorsque', 'soudain', 'tout à coup',
];

/**
 * The turn. A récit without one is a diary entry, and tâche 2 asks for
 * *ce que cela a changé* — the change is the task, not the decoration.
 */
export const PIVOT = [
  'c’est alors que', "c'est alors que", 'tout a changé', 'depuis ce jour',
  'depuis, je', 'désormais', 'à partir de ce moment', 'je n’ai plus',
  "je n'ai plus", 'je ne suis plus', 'ce jour-là a', 'cela a changé',
  'grâce à', 'à cause de', 'c’est ce qui a', "c'est ce qui a",
];

/**
 * Explicit before-and-after — the other way a change can be marked.
 *
 * **Contrastive frames only, and the measurement is why.** This list held
 * bare `avant` and `maintenant` until 2026-08-28, and it fired on four of
 * eight NCLC 6 responses that mark no change at all: *"j'ai attendu deux
 * heures avant de voir un médecin"*, *"je suis arrivé avant l'ouverture"*,
 * *"je réfléchis maintenant à ce que je vais faire"*. Those are the two
 * commonest temporal adverbs in the language doing ordinary temporal work.
 *
 * A word that appears in almost every narrative cannot be the signal that
 * distinguishes one narrative from another. So the entries below are frames
 * — the adverb plus a subject pronoun, or a construction that can only be
 * contrastive.
 */
export const BEFORE_AFTER = [
  'avant, je', 'avant, j’', "avant, j'", 'avant, nous', 'avant, on',
  'avant cela', 'avant ce', 'avant cette', 'avant, tout',
  'maintenant, je', 'maintenant, j’', "maintenant, j'", 'maintenant, nous',
  'aujourd’hui, je', "aujourd'hui, je",
  'autrefois', 'à l’époque', "à l'époque", 'désormais', 'plus jamais',
  'ne les choisis plus', 'ne le pense plus', 'ne le défends plus',
];
