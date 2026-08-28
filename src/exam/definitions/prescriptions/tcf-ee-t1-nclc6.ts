/**
 * CELL — TCF Canada · expression écrite · tâche 1 · NCLC 6.
 *
 * The second cell, and Amendment 2 §5's Order asks for it before widening
 * to another level: *"Extend the cell to tâches 1 and 2, then expression
 * orale, before widening."*
 *
 * The reason the order is right: a candidate does all six tâches whatever
 * their level, so a second tâche at the same level is worth more to them
 * than the same tâche at a second level.
 */
import type { FailureMode, Prescription, PrescriptionCell } from '../../model/prescription';
import type { MessageThresholds } from '../../engine/diagnose';
import type { ProxyBounds } from '../../engine/proxy';
import { ITEMS } from '../practice/tcf-ee-t1-nclc6.items';

export const AT = { examId: 'tcf-canada', taskId: 'tcf-ee-t1', level: 6 } as const;

export const FAILURE_MODE: FailureMode = {
  id: 'message-sans-information',
  at: AT,
  name: {
    en: 'A polite message that informs of nothing',
    fr: 'Un message poli qui n’informe de rien',
  },
  looksLike: {
    en: 'Your message opens well, is polite, and is correct French. Read it back and ask: what could a colleague repeat to someone else after reading it? If the answer is "that it was interesting", the message has not informed anyone.',
    fr: 'Votre message s’ouvre bien, il est poli, le français est correct. Relisez-le et demandez-vous : qu’est-ce qu’un collègue pourrait répéter à quelqu’un d’autre après l’avoir lu ? Si la réponse est « que c’était intéressant », le message n’a informé personne.',
  },
  criterionId: 'capacite_informer',
  whyItCaps: {
    en: 'The instruction asks two things — describe the training, and explain what you learned. A response can be fluent French and do neither, by saying it was interesting and useful and that you learned a lot. Respect de la consigne is satisfied, so the response is marked; capacité à informer is not, and that is what holds it at 7–9 out of 20.',
    fr: 'La consigne demande deux choses : décrire la formation, et expliquer ce que vous avez appris. Une réponse peut être en bon français et ne faire ni l’une ni l’autre, en disant que c’était intéressant, utile, et que vous avez beaucoup appris. Le respect de la consigne est satisfait : la réponse est donc corrigée. La capacité à informer ne l’est pas, et c’est ce qui la retient à 7–9 sur 20.',
  },
};

export const PRESCRIPTION: Prescription = {
  failureModeId: FAILURE_MODE.id,
  move: {
    en: 'Replace every word of praise with the fact that earned it.',
    fr: 'Remplacez chaque appréciation par le fait qui la justifiait.',
  },
  language: [
    {
      pattern: { en: 'It was about…', fr: 'Il s’agissait de…' },
      use: {
        en: 'Names the subject in the first two lines. Without it the reader has no idea what the training was.',
        fr: 'Nomme le sujet dès les deux premières lignes. Sans cela, le lecteur ignore de quoi il s’agissait.',
      },
    },
    {
      pattern: { en: 'For three days, we…', fr: 'Pendant trois jours, nous avons…' },
      use: {
        en: 'A number is the cheapest fact there is, and it is always available: how long, how many people, how many times.',
        fr: 'Un nombre est le fait le moins coûteux qui soit, et il est toujours disponible : combien de temps, combien de personnes, combien de fois.',
      },
    },
    {
      pattern: { en: 'Specifically, …', fr: 'Concrètement, …' },
      use: {
        en: 'Put it after any sentence you suspect of being vague. If nothing follows it, the sentence was vague.',
        fr: 'Placez-le après toute phrase que vous soupçonnez d’être vague. Si rien ne suit, la phrase était vague.',
      },
    },
    {
      pattern: { en: 'What I mainly take away is that…', fr: 'Ce que je retiens surtout, c’est que…' },
      use: {
        en: 'This is the second requirement, and it is the one candidates drop. One sentence answers it.',
        fr: 'C’est la seconde exigence, et c’est celle que les candidats oublient. Une phrase y répond.',
      },
    },
    {
      pattern: { en: 'We now know how to…', fr: 'Nous savons maintenant…' },
      use: {
        en: 'Turns "I learned a lot" into something a colleague could act on.',
        fr: 'Transforme « j’ai beaucoup appris » en quelque chose qu’un collègue peut utiliser.',
      },
    },
  ],
  worked: {
    before: `Bonjour à tous,

Je viens de terminer une formation payée par notre employeur. C'était vraiment
très intéressant et très utile. Le formateur était excellent et l'ambiance était
agréable. J'ai beaucoup appris pendant ces journées et je pense que c'était une
expérience enrichissante.

Je vous conseille vivement de la suivre si vous en avez l'occasion. Cela vaut
vraiment la peine et je suis sûr que cela vous plaira aussi.

À bientôt,
Karim`,
    after: `Bonjour à tous,

Je viens de terminer la formation sur la sécurité des données, payée par notre
employeur. Il s'agissait de trois jours à Laval, avec douze participants venus de
quatre services.

Concrètement, nous avons travaillé sur trois choses : reconnaître un courriel
frauduleux, choisir un mot de passe qui résiste, et signaler un incident dans les
vingt-quatre heures.

Ce que je retiens surtout, c'est que la moitié des incidents commence par une
pièce jointe ouverte trop vite. Nous savons maintenant à qui écrire et quoi
écrire quand cela arrive.

À bientôt,
Karim`,
    difference: {
      en: 'Same length, same politeness, same level of French. Every evaluative word — interesting, useful, excellent, enriching — has been replaced by the fact that would have justified it: a subject, three days, twelve people, three named things, one number, one action.',
      fr: 'Même longueur, même politesse, même niveau de français. Chaque mot d’appréciation — intéressant, utile, excellent, enrichissant — a été remplacé par le fait qui l’aurait justifié : un sujet, trois jours, douze personnes, trois choses nommées, un chiffre, une action.',
    },
  },
};

/**
 * ⚠ OURS, unreviewed, and set from the worked pair above and then checked
 * against the 24 responses in `practice/`.
 *
 * `minFacts: 3` is the lowest number that separates the two worked
 * responses. `maxEvaluativePer100: 3.5` is roughly one evaluative adjective
 * per thirty words, which is where a message stops reporting and starts
 * recommending.
 */
export const THRESHOLDS: MessageThresholds = {
  minFacts: 3,
  maxEvaluativePer100: 3.5,
};

/** Bounds for the item's own prompt, at B1. */
export const ITEM_PROXY_BOUNDS: ProxyBounds = {
  meanSentenceWords: [8, 30],
  maxSentenceWords: [0, 46],
  clauseDepth: [0, 2.4],
  typeTokenRatio: [0.5, 0.98],
  longWordShare: [0, 0.16],
};

export const CELL: PrescriptionCell = {
  at: AT,
  failureMode: FAILURE_MODE,
  prescription: PRESCRIPTION,
  practiceItemIds: ITEMS.map((i) => i.id),
};
