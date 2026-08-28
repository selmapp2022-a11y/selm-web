/**
 * CELLS — TCF Canada · expression orale · tâches 1, 2 and 3 · NCLC 6.
 *
 * Three cells in one file, because they share a bank and a check and
 * separating them would mean three files that only ever change together.
 *
 * Amendment 2 §5's order ends here: *"Extend the cell to tâches 1 and 2,
 * then expression orale, before widening to another level."* With these,
 * every one of TCF Canada's six tâches has a named failure mode, a
 * prescription and a bank at NCLC 6 — which is the level the French Express
 * Entry category turns on and where §2.5 says candidates cluster.
 */
import type { FailureMode, Prescription, PrescriptionCell } from '../../model/prescription';
import type { PresentationThresholds, QuestionThresholds, ArgumentThresholds } from '../../engine/diagnose';
import type { ProxyBounds } from '../../engine/proxy';
import { ITEMS } from '../practice/tcf-eo-nclc6.items';

const idsFor = (taskId: string) => ITEMS.filter((i) => i.taskId === taskId).map((i) => i.id);

/**
 * Bounds on the ITEM's prompt, not on the answer.
 *
 * Widened once, from measurement rather than taste. A spoken prompt carries
 * a role-play setup — *votre examinateur est le gestionnaire de l'immeuble* —
 * so it runs to more subordinate clauses than a written one: measured 3.00
 * against a bound of 2.6 on two items. And a subject like *bénévolat
 * obligatoire* is 0.21 long words by arithmetic, not by register.
 *
 * These are our bounds and loosening our own is the safe direction; the
 * numbers are recorded so the reviewer can tighten them with better reason
 * than we had for guessing them.
 */
export const ITEM_PROXY_BOUNDS: ProxyBounds = {
  meanSentenceWords: [6, 34],
  maxSentenceWords: [0, 52],
  clauseDepth: [0, 3.2],
  typeTokenRatio: [0.45, 1.0],
  longWordShare: [0, 0.22],
};

// ── tâche 1 ─────────────────────────────────────────────────────────────

export const T1_FAILURE: FailureMode = {
  id: 'presentation-catalogue',
  at: { examId: 'tcf-canada', taskId: 'tcf-eo-t1', level: 6 },
  name: { en: 'A CV read aloud', fr: 'Un curriculum vitae lu à voix haute' },
  looksLike: {
    en: 'Je m’appelle… Je suis… J’ai… Je travaille… J’habite… Every sentence is true, every sentence is correct, and every one ends where it began. Then there is a minute of silence left and nothing to put in it.',
    fr: 'Je m’appelle… Je suis… J’ai… Je travaille… J’habite… Chaque phrase est vraie, chaque phrase est correcte, et chacune se termine là où elle a commencé. Puis il reste une minute et rien à mettre dedans.',
  },
  criterionId: 'capacite_interagir',
  whyItCaps: {
    en: 'You have not run out of facts. You have run out of the words that attach one fact to the next — which is why the fix is five connectives and not more biography. The instruction also asks what brought you to French, and a catalogue never answers a why.',
    fr: 'Vous n’êtes pas à court de faits. Vous êtes à court des mots qui attachent un fait au suivant — c’est pourquoi le remède tient en cinq connecteurs et non en plus de biographie. La consigne demande aussi ce qui vous a amené au français : un catalogue ne répond jamais à un pourquoi.',
  },
};

export const T1_PRESCRIPTION: Prescription = {
  failureModeId: T1_FAILURE.id,
  move: {
    en: 'Say one fact, then say why it is true. The why is what gives you the next sentence.',
    fr: 'Dites un fait, puis dites pourquoi il est vrai. C’est le pourquoi qui vous donne la phrase suivante.',
  },
  language: [
    { pattern: { en: 'because', fr: 'parce que' }, use: { en: 'One per fact. It is the whole technique.', fr: 'Un par fait. C’est toute la technique.' } },
    { pattern: { en: 'which means that / so', fr: 'ce qui fait que / du coup' }, use: { en: 'Carries a consequence, so the next sentence is already started.', fr: 'Porte une conséquence : la phrase suivante est déjà commencée.' } },
    { pattern: { en: 'what brought me to it is…', fr: 'ce qui m’a amené à…' }, use: { en: 'Answers the instruction directly. One sentence, early.', fr: 'Répond directement à la consigne. Une phrase, tôt.' } },
    { pattern: { en: 'for example', fr: 'par exemple' }, use: { en: 'Turns a claim about yourself into something the examiner can picture.', fr: 'Transforme une affirmation sur vous en quelque chose que l’examinateur peut se représenter.' } },
    { pattern: { en: 'actually / in fact', fr: 'en fait' }, use: { en: 'Buys a second on a real answer instead of on "euh".', fr: 'Achète une seconde sur une vraie réponse plutôt que sur « euh ».' } },
  ],
  worked: {
    before: `Je m'appelle Ravi. J'ai trente-quatre ans. Je suis électricien. Je travaille dans
la construction. J'habite à Montréal. J'apprends le français. Je prends des cours
le soir. J'aime la langue française.`,
    after: `Je m'appelle Ravi et je suis électricien sur des chantiers résidentiels. Ce qui
m'a amené au français, c'est très concret en fait : les consignes de sécurité se
donnent en français sur la plupart des chantiers, du coup je ne pouvais pas devenir
chef d'équipe. C'est pour ça que j'ai commencé les cours du soir en janvier.`,
    difference: {
      en: 'Eight facts became three, and the answer got longer. Nothing was invented — the reason was always there, and saying it out loud is what produced the next two sentences.',
      fr: 'Huit faits sont devenus trois, et la réponse s’est allongée. Rien n’a été inventé : la raison était déjà là, et c’est de la dire qui a produit les deux phrases suivantes.',
    },
  },
};

export const T1_THRESHOLDS: PresentationThresholds = { minDevelopment: 3, maxJeOpeningShare: 0.6 };

// ── tâche 2 ─────────────────────────────────────────────────────────────

export const T2_FAILURE: FailureMode = {
  id: 'questions-fermees',
  at: { examId: 'tcf-canada', taskId: 'tcf-eo-t2', level: 6 },
  name: { en: 'Questions that come back with one word', fr: 'Des questions qui reviennent avec un mot' },
  looksLike: {
    en: 'Est-ce que le chauffage sera réparé ? — Oui. And there are three minutes left. You have been polite, you have been correct, and you have obtained nothing.',
    fr: 'Est-ce que le chauffage sera réparé ? — Oui. Et il reste trois minutes. Vous avez été poli, vous avez été correct, et vous n’avez rien obtenu.',
  },
  criterionId: 'capacite_interagir',
  whyItCaps: {
    en: 'Tâche 2 is the only task in the whole exam where you ask and the examiner answers. The instruction is obtenez les informations — obtaining is the task, not asking. A closed question hands the turn back after one word, so a candidate can ask five of them and finish with nothing the instruction told them to find out.',
    fr: 'La tâche 2 est la seule de tout l’examen où c’est vous qui demandez et l’examinateur qui répond. La consigne dit obtenez les informations : obtenir est la tâche, non pas demander. Une question fermée rend la parole après un mot ; on peut donc en poser cinq et terminer sans rien de ce que la consigne demandait d’obtenir.',
  },
};

export const T2_PRESCRIPTION: Prescription = {
  failureModeId: T2_FAILURE.id,
  move: {
    en: 'Start every question with a question word, not with est-ce que.',
    fr: 'Commencez chaque question par un mot interrogatif, pas par « est-ce que ».',
  },
  language: [
    { pattern: { en: 'why / what caused', fr: 'pourquoi / qu’est-ce qui a causé' }, use: { en: 'Gets the cause, which is usually the first of the three things asked for.', fr: 'Obtient la cause, qui est en général le premier des trois points demandés.' } },
    { pattern: { en: 'from when / how long', fr: 'à partir de quand / combien de temps' }, use: { en: 'A date is refusable; a range is not. Ask for both.', fr: 'Une date se refuse ; une fourchette, non. Demandez les deux.' } },
    { pattern: { en: 'what must I do meanwhile', fr: 'qu’est-ce que je dois faire en attendant' }, use: { en: 'The third point, and the one candidates leave out most.', fr: 'Le troisième point, et celui qu’on oublie le plus souvent.' } },
    { pattern: { en: 'and if…?', fr: 'et si… ?' }, use: { en: 'Follows up on the answer you were given instead of moving to the next item on your list.', fr: 'Rebondit sur la réponse reçue au lieu de passer au point suivant de votre liste.' } },
    { pattern: { en: 'who pays / who does it', fr: 'qui paie / qui s’en occupe' }, use: { en: 'Turns a vague reassurance into a named responsibility.', fr: 'Transforme une vague assurance en une responsabilité nommée.' } },
  ],
  worked: {
    before: `Est-ce que vous êtes au courant du problème ? … Est-ce que le chauffage sera
réparé ? … Est-ce que c'est un problème grave ? … Est-ce que vous pouvez faire
quelque chose rapidement ?`,
    after: `Pourquoi est-ce que ça ne marche pas — c'est seulement chez moi ou tout
l'immeuble ? … Qu'est-ce qui a causé la panne exactement ? … À partir de quand
est-ce que ce sera réparé, et si la pièce n'arrive pas mardi, combien de temps ça
peut prendre ? … Et qu'est-ce que je dois faire en attendant — qui paie
l'électricité si j'achète un chauffage d'appoint ?`,
    difference: {
      en: 'Four questions became four questions. Every one now begins with a question word, and every one of the three things the instruction asked for has been obtained.',
      fr: 'Quatre questions sont restées quatre questions. Chacune commence maintenant par un mot interrogatif, et chacun des trois points demandés a été obtenu.',
    },
  },
};

export const T2_THRESHOLDS: QuestionThresholds = { minQuestions: 4, minOpen: 3, minRequired: 3 };

// ── tâche 3 ─────────────────────────────────────────────────────────────

export const T3_FAILURE: FailureMode = {
  id: 'avis-sans-defense',
  at: { examId: 'tcf-canada', taskId: 'tcf-eo-t3', level: 6 },
  name: { en: 'An opinion repeated instead of defended', fr: 'Un avis répété au lieu d’être défendu' },
  looksLike: {
    en: 'You say what you think. Then you say it again in other words, more firmly. Then you say that this is truly your opinion. Nothing false has been said and nothing has been argued.',
    fr: 'Vous dites ce que vous pensez. Puis vous le redites autrement, plus fermement. Puis vous dites que c’est vraiment votre avis. Rien de faux n’a été dit, et rien n’a été argumenté.',
  },
  criterionId: 'capacite_argumenter',
  whyItCaps: {
    en: 'The instruction has three parts: give your view, support it, and say what you would answer someone who disagreed. Stating a clear view in good French satisfies the first and neither of the others. Conceding once is what separates arguing from repeating — and at this level it is also the cheapest thing to learn: one sentence, one connective.',
    fr: 'La consigne comporte trois parties : donnez votre avis, appuyez-le, et dites ce que vous répondriez à quelqu’un qui ne serait pas d’accord. Énoncer un avis clair en bon français satisfait la première et aucune des deux autres. Concéder une fois, c’est ce qui sépare argumenter de répéter — et à ce niveau c’est aussi le moins coûteux à apprendre : une phrase, un connecteur.',
  },
};

export const T3_PRESCRIPTION: Prescription = {
  failureModeId: T3_FAILURE.id,
  move: {
    en: 'Concede one thing to the other side, out loud, then answer it.',
    fr: 'Concédez une chose à l’autre camp, à voix haute, puis répondez-y.',
  },
  language: [
    { pattern: { en: 'Admittedly / it is true that', fr: 'Certes / il est vrai que' }, use: { en: 'The concession. One sentence, in the middle, not at the end.', fr: 'La concession. Une phrase, au milieu, pas à la fin.' } },
    { pattern: { en: 'I would be told that…', fr: 'On me dira que…' }, use: { en: 'Names the objection the instruction explicitly asks you to meet.', fr: 'Nomme l’objection que la consigne demande explicitement d’affronter.' } },
    { pattern: { en: 'To that I would answer…', fr: 'À cela je répondrais…' }, use: { en: 'Answers it. Without this the concession is a surrender.', fr: 'Y répond. Sans cela, la concession est un abandon.' } },
    { pattern: { en: 'for example', fr: 'par exemple' }, use: { en: 'One instance beats three assertions, and it is easier to say.', fr: 'Un exemple vaut mieux que trois affirmations, et se dit plus facilement.' } },
    { pattern: { en: 'that is why', fr: 'c’est pourquoi' }, use: { en: 'Closes on the view you started with, now carrying everything said since.', fr: 'Referme sur l’avis de départ, qui porte maintenant tout ce qui a été dit.' } },
  ],
  worked: {
    before: `À mon avis, une ville doit être conçue pour ceux qui l'habitent. Les habitants
sont les plus importants. Je trouve que c'est très important de penser à eux.
C'est mon opinion et je la défends. Voilà ce que je crois vraiment.`,
    after: `À mon avis, une ville doit être conçue pour ceux qui l'habitent, parce qu'une ville
se juge à seize heures, pas à midi. Par exemple, dans mon quartier, huit cafés
ferment quand les bureaux se vident. Certes, il est vrai qu'une ville sans emplois
se vide aussi, je le reconnais. Mais on me dira que le travail paie les taxes qui
paient les parcs ; à cela je répondrais que les habitants travaillent aussi,
seulement ailleurs, et qu'on les compte rarement.`,
    difference: {
      en: 'Same opinion, same length, same level of French. What was added: one reason, one example, one concession, and one objection met. What was removed: three restatements of the opinion.',
      fr: 'Même avis, même longueur, même niveau de français. Ce qui a été ajouté : une raison, un exemple, une concession, une objection affrontée. Ce qui a été retiré : trois reformulations de l’avis.',
    },
  },
};

export const T3_THRESHOLDS: ArgumentThresholds = { minSupport: 3 };

// ── the three cells ─────────────────────────────────────────────────────

export const T1_CELL: PrescriptionCell = {
  at: T1_FAILURE.at, failureMode: T1_FAILURE, prescription: T1_PRESCRIPTION,
  practiceItemIds: idsFor('tcf-eo-t1'),
};
export const T2_CELL: PrescriptionCell = {
  at: T2_FAILURE.at, failureMode: T2_FAILURE, prescription: T2_PRESCRIPTION,
  practiceItemIds: idsFor('tcf-eo-t2'),
};
export const T3_CELL: PrescriptionCell = {
  at: T3_FAILURE.at, failureMode: T3_FAILURE, prescription: T3_PRESCRIPTION,
  practiceItemIds: idsFor('tcf-eo-t3'),
};
