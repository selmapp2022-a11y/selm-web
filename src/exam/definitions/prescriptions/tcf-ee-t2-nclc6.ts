/**
 * CELL — TCF Canada · expression écrite · tâche 2 · NCLC 6.
 *
 * Third cell, and the last of expression écrite. Amendment 2 §5's Order:
 * *"Extend the cell to tâches 1 and 2, then expression orale, before
 * widening to another level."*
 */
import type { FailureMode, Prescription, PrescriptionCell } from '../../model/prescription';
import type { NarrativeThresholds } from '../../engine/diagnose';
import type { ProxyBounds } from '../../engine/proxy';
import { ITEMS } from '../practice/tcf-ee-t2-nclc6.items';

export const AT = { examId: 'tcf-canada', taskId: 'tcf-ee-t2', level: 6 } as const;

export const FAILURE_MODE: FailureMode = {
  id: 'recit-sans-bascule',
  at: AT,
  name: {
    en: 'A sequence of events with no turn',
    fr: 'Une suite d’événements sans bascule',
  },
  looksLike: {
    en: 'Your account moves: first this, then that, then the next thing. Read the last line and ask what is different now from before. If nothing is, you have written a diary entry — a record of a day, not an account of one.',
    fr: 'Votre récit avance : d’abord ceci, ensuite cela, puis la suite. Lisez la dernière ligne et demandez-vous ce qui est différent maintenant. Si rien ne l’est, vous avez écrit une page d’agenda — le compte rendu d’une journée, non le récit d’une journée.',
  },
  criterionId: 'capacite_raconter',
  whyItCaps: {
    en: 'The instruction asks what happened, in what order, AND what it changed for you. The change is the task, not the decoration — and it is the half candidates drop, because listing events is easier than saying why they mattered. The order is there, so respect de la consigne is satisfied and the response is marked; capacité à raconter is not, and that is 7–9 out of 20.',
    fr: 'La consigne demande ce qui s’est passé, dans quel ordre, ET ce que cela a changé pour vous. Le changement est la tâche, non l’ornement — et c’est la moitié que les candidats abandonnent, parce qu’énumérer des événements est plus facile que de dire pourquoi ils comptaient. L’ordre est là : le respect de la consigne est satisfait et la réponse est corrigée. La capacité à raconter ne l’est pas, et cela fait 7–9 sur 20.',
  },
};

export const PRESCRIPTION: Prescription = {
  failureModeId: FAILURE_MODE.id,
  move: {
    en: 'Name the second when something turned, then say what is no longer the same.',
    fr: 'Nommez la seconde où quelque chose a basculé, puis dites ce qui n’est plus pareil.',
  },
  language: [
    {
      pattern: { en: 'It was then that…', fr: 'C’est alors que…' },
      use: {
        en: 'Marks the turn as a moment, not a mood. One sentence, in the middle, not at the end.',
        fr: 'Marque la bascule comme un instant, non comme une impression. Une phrase, au milieu, pas à la fin.',
      },
    },
    {
      pattern: { en: 'Before, I…; now, I…', fr: 'Avant, je… ; maintenant, je…' },
      use: {
        en: 'The plainest way to show a change, and at B1 the safest. Two clauses, one contrast.',
        fr: 'La façon la plus simple de montrer un changement, et la plus sûre au niveau B1. Deux propositions, une opposition.',
      },
    },
    {
      pattern: { en: 'Since that day, I…', fr: 'Depuis ce jour, je…' },
      use: {
        en: 'Puts the change in the present, where the reader is. A past tense alone leaves it finished and far away.',
        fr: 'Place le changement au présent, là où se trouve le lecteur. Un passé seul le laisse achevé et lointain.',
      },
    },
    {
      pattern: { en: 'I no longer…', fr: 'Je ne… plus' },
      use: {
        en: 'Says what stopped. A change is easier to believe when something is missing from it.',
        fr: 'Dit ce qui a cessé. Un changement est plus crédible quand quelque chose y manque.',
      },
    },
    {
      pattern: { en: 'What I did not know then was…', fr: 'Ce que j’ignorais alors, c’est que…' },
      use: {
        en: 'Lets you write from now, looking back — which is what an account is and a diary is not.',
        fr: 'Vous fait écrire depuis maintenant, en regardant en arrière — c’est ce qu’est un récit, et ce que n’est pas un agenda.',
      },
    },
  ],
  worked: {
    before: `Ce jour-là, je me suis levée très tôt parce que j'avais rendez-vous au bureau
d'immigration. J'ai pris l'autobus de sept heures et je suis arrivée en avance.

Ensuite, j'ai attendu deux heures dans la salle. Il y avait beaucoup de monde et
j'ai lu les affiches sur les murs. Puis on a appelé mon numéro et je suis entrée
dans le bureau numéro quatre.

L'agent m'a posé des questions sur mon travail et sur ma famille. J'ai répondu et
j'ai donné mes documents. Enfin, il m'a dit que tout était en ordre et je suis
repartie. C'était une longue journée et j'étais fatiguée en rentrant chez moi.`,
    after: `Ce jour-là, je me suis levée très tôt pour un rendez-vous au bureau
d'immigration. J'ai attendu deux heures, puis on a appelé mon numéro.

L'agent m'a posé ses questions en français, sans ralentir. J'ai répondu comme j'ai
pu. C'est alors qu'il a levé les yeux et m'a dit, simplement : « vous vous
débrouillez bien ». Il ne le disait pas pour m'encourager ; il remplissait une
case.

Avant ce matin-là, je préparais chaque phrase dans ma tête avant d'ouvrir la
bouche, et je choisissais les caisses libre-service pour ne pas avoir à parler.
Depuis ce jour, je ne les choisis plus. Ce que j'ignorais alors, c'est qu'il ne
me manquait pas des mots. Il me manquait une personne pour me dire que j'en avais
assez.`,
    difference: {
      en: 'Same day, same events, same order, same level of French — and the second one is shorter on the queue. What changed: one sentence names the moment it turned, one sets before against now, and the last line says what stopped. Nothing was added that was not already in the day.',
      fr: 'Même journée, mêmes événements, même ordre, même niveau de français — et le second passe moins de temps dans la file. Ce qui a changé : une phrase nomme l’instant de la bascule, une autre oppose l’avant au maintenant, et la dernière ligne dit ce qui a cessé. Rien n’a été ajouté qui ne fût déjà dans la journée.',
    },
  },
};

/**
 * ⚠ OURS, unreviewed. `minSequence: 2` is the floor at which a response is
 * narrating at all — below it, the failure is something else and this
 * detector stays quiet rather than misnaming it.
 */
export const THRESHOLDS: NarrativeThresholds = {
  minSequence: 2,
  minPivot: 1,
};

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
