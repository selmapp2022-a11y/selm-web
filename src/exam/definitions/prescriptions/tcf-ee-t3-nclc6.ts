/**
 * CELL — TCF Canada · expression écrite · tâche 3 · NCLC 6.
 *
 * The first cell built end to end, and it was built first for the reason
 * Amendment 1 §5 gives: this project has discussed content generation,
 * costed it and designed a bank around it without once building a real cell.
 *
 * Why this coordinate and not another:
 *
 *   - NCLC 6 is a mark of 7–9 out of 20 on this task (`benchmark.bands`
 *     in `tcf-canada.ts`). NCLC 7 starts at 10. So this cell sits on the
 *     one boundary the French Express Entry category actually turns on,
 *     and §2.5 measured that candidates cluster exactly here.
 *   - Tâche 3 is the only task in either exam that supplies source
 *     documents, so it is the only one where "did they compare" is a
 *     question that can be asked deterministically at all.
 *   - The gate is SILENT on this failure. `source_coverage` passes. That
 *     is what makes it worth a prescription instead of a rule.
 */
import type { FailureMode, Prescription, PrescriptionCell } from '../../model/prescription';
import type { JuxtapositionThresholds } from '../../engine/diagnose';
import type { ProxyBounds } from '../../engine/proxy';

export const AT = { examId: 'tcf-canada', taskId: 'tcf-ee-t3', level: 6 } as const;

export const FAILURE_MODE: FailureMode = {
  id: 'juxtaposition-sans-comparaison',
  at: AT,
  name: {
    en: 'Two summaries instead of one comparison',
    fr: 'Deux résumés au lieu d’une comparaison',
  },
  looksLike: {
    en: 'The first half of your answer says what document 1 claims. The second half says what document 2 claims. Then you give your opinion. Nothing in between puts the two documents against each other.',
    fr: 'La première moitié de votre réponse dit ce qu’affirme le document 1. La seconde dit ce qu’affirme le document 2. Puis vient votre avis. Entre les deux, rien ne met les documents face à face.',
  },
  criterionId: 'capacite_argumenter',
  whyItCaps: {
    en: 'Both documents were treated, so respect de la consigne is satisfied and the response is marked rather than zeroed. But the instruction says comparez, and a response that reports two positions in sequence has not compared them. That is what holds a well-written answer at 7–9 out of 20 — NCLC 6 — when the target is 10.',
    fr: 'Les deux documents sont traités : le respect de la consigne est donc satisfait et la réponse est corrigée, non annulée. Mais la consigne dit « comparez », et une réponse qui expose deux positions l’une après l’autre ne les a pas comparées. C’est ce qui retient une réponse bien écrite à 7–9 sur 20 — NCLC 6 — alors que la cible est 10.',
  },
};

export const PRESCRIPTION: Prescription = {
  failureModeId: FAILURE_MODE.id,
  move: {
    en: 'Name the one point the two documents disagree about, then take your side on that named point.',
    fr: 'Nommez le seul point sur lequel les deux documents s’opposent, puis prenez position sur ce point-là.',
  },
  language: [
    {
      pattern: { en: 'The disagreement is about…', fr: 'Le désaccord porte sur…' },
      use: {
        en: 'Opens the comparison by naming the axis. One sentence, early.',
        fr: 'Ouvre la comparaison en nommant l’axe. Une phrase, tôt dans le texte.',
      },
    },
    {
      pattern: { en: 'Where A…, B…', fr: 'Là où l’un…, l’autre…' },
      use: {
        en: 'Holds both documents inside a single sentence. This is the sentence the failure mode is missing.',
        fr: 'Tient les deux documents dans une seule phrase. C’est la phrase qui manque dans ce type d’erreur.',
      },
    },
    {
      pattern: { en: 'whereas / on the other hand', fr: 'tandis que / en revanche' },
      use: {
        en: 'Marks the opposition explicitly. Two of these is enough; five is noise.',
        fr: 'Marque l’opposition explicitement. Deux suffisent ; cinq font du bruit.',
      },
    },
    {
      pattern: { en: 'Admittedly…, but…', fr: 'Certes…, mais…' },
      use: {
        en: 'Concede the other side once before taking your own. A B1 candidate who does this reads as an arguer rather than a reporter.',
        fr: 'Concédez une fois à l’autre camp avant de prendre parti. Un candidat B1 qui le fait passe pour quelqu’un qui argumente, non qui rapporte.',
      },
    },
    {
      pattern: { en: 'On this precise point, I think…', fr: 'Sur ce point précis, je pense que…' },
      use: {
        en: 'Attaches your opinion to the named disagreement instead of floating free of both documents.',
        fr: 'Rattache votre avis au désaccord nommé au lieu de le laisser flotter à côté des deux documents.',
      },
    },
  ],
  worked: {
    before: `L'avis municipal annonce la fermeture du centre-ville aux voitures le samedi. La mairie veut réduire la pollution et laisser la place aux marchés et au vélo. Les piétons pourront circuler tranquillement.

La lettre des commerçants dit que le chiffre d'affaires va baisser. Les livraisons n'auront plus d'endroit où s'arrêter. La clientèle à mobilité réduite ne viendra plus dans les boutiques.

Pour ma part, je pense que la protection de l'environnement est très importante aujourd'hui. Il faut penser aux générations futures. C'est pourquoi je suis favorable à cette mesure.`,
    after: `Le désaccord ne porte pas sur la pollution : personne ne la défend. Il porte sur la question de savoir qui paie un bien public.

Là où l'avis municipal compte l'air et les piétons, la lettre des commerçants compte les livraisons et la clientèle à mobilité réduite. La mairie mesure un gain partagé par toute la ville ; les commerçants mesurent une perte concentrée sur quelques rues. En revanche, ni l'un ni l'autre ne dit qui devrait compenser cette perte.

Certes, les boutiques risquent vraiment de perdre des ventes le samedi. Mais sur ce point précis, je pense que la ville doit agir et payer : des créneaux de livraison tôt le matin et un transport adapté coûtent moins cher qu'un centre-ville vide.`,
    difference: {
      en: 'Same two documents, same opinion, same level of French. What changed: one sentence names the disagreement, one sentence holds both documents at once, and the opinion is attached to the named point instead of to the general subject.',
      fr: 'Mêmes documents, même avis, même niveau de français. Ce qui a changé : une phrase nomme le désaccord, une phrase tient les deux documents à la fois, et l’avis est rattaché au point nommé plutôt qu’au sujet général.',
    },
  },
};

/**
 * Thresholds for `diagnoseJuxtaposition` at this coordinate.
 *
 * ⚠ OURS, and not reviewed. They were set from the worked pair above and
 * then checked against the 24 responses in `practice/`. Amendment 1 §3.3
 * puts a francophone reviewer on the Order table; until that person exists
 * these numbers are a working hypothesis and are labelled as one.
 */
export const THRESHOLDS: JuxtapositionThresholds = {
  minBridgeSentences: 1,
  minContrastMarkers: 2,
  minOpinionAnchors: 1,
};

/**
 * Proxy bounds for the two SOURCE DOCUMENTS of an item at this level, not
 * for the candidate's response. An item whose documents are written above
 * B1 tests reading, not writing, and that is a defect in the item.
 */
export const ITEM_PROXY_BOUNDS: ProxyBounds = {
  meanSentenceWords: [8, 26],
  // 42 → 44 for the same reason as `maxLiftedRun` in `tcf-canada.ts`: the
  // elision fix raised every token count about 5%, and a bound authored
  // before it means one word less than it says.
  maxSentenceWords: [0, 44],
  clauseDepth: [0, 2.2],
  typeTokenRatio: [0.45, 0.95],
  longWordShare: [0, 0.14],
};

export const CELL: PrescriptionCell = {
  at: AT,
  failureMode: FAILURE_MODE,
  prescription: PRESCRIPTION,
  practiceItemIds: [],
};
