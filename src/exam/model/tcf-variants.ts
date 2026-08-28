/**
 * The TCF is not one exam. It is a family, and the attestation form was
 * built as though it were one.
 *
 * Sixteen real score reports read into the model on 2026-08-28 contained
 * **four different TCF examinations** printing four different sets of
 * épreuves on four different score scales. A form that asks "your TCF
 * scores" and shows four boxes is wrong for three of the four.
 *
 * ┌──────────────┬───────────────────────────────────┬──────────┬─────┬────────┐
 * │ variant      │ épreuves                          │ QCM max  │ QR  │ global │
 * ├──────────────┼───────────────────────────────────┼──────────┼─────┼────────┤
 * │ canada       │ CO CE EO EE                       │ 699      │ yes │ no     │
 * │ tout-public  │ CO MdS CE + EO EE optional        │ 699      │ yes │ yes    │
 * │ quebec       │ CO EO                             │ 699      │ no  │ no     │
 * │ irn          │ CO CE EO EE                       │ DISPUTED │ yes │ no     │
 * │ legacy       │ CO MdS CE + EO EE optional (CIEP) │ 699      │ no  │ yes    │
 * │ provisional  │ CO MdS CE, no expression at all   │ 699      │ no  │ yes    │
 * └──────────────┴───────────────────────────────────┴──────────┴─────┴────────┘
 *
 * **On `irn`, and why it has no ceiling here.** The TCF IRN — Intégration,
 * Résidence, Nationalité — is the French residence-and-naturalisation exam
 * and certifies A1 to B2 only. Two published sources disagree about its
 * scale: one centre's own course page states « Chaque épreuve est notée sur
 * 399 points », while a survey of attestation layouts puts it at 499. France
 * Éducation international's own page refuses automated access, so neither
 * could be checked against the awarding body.
 *
 * The disagreement is exactly the hazard: a 350 read on a 699 scale is
 * "B1, middling"; on a 399 scale it is near the top of what the exam can
 * award. **So this file records `qcmMax: null` for IRN and the conversion
 * refuses rather than guessing.** It costs nothing — IRN is France's exam
 * and IRCC does not accept it for Express Entry under any scale — and a
 * refusal that says why is worth more than a number that might be a level
 * and a half wrong.
 */

export type TcfVariantId =
  | 'canada'
  | 'tout-public'
  | 'quebec'
  | 'irn'
  | 'legacy'
  | 'provisional';

/** The épreuve names as the attestations themselves print them. */
export type TcfEpreuve =
  | 'comprehension_orale'
  | 'comprehension_ecrite'
  | 'maitrise_des_structures'
  | 'expression_orale'
  | 'expression_ecrite';

export type TcfVariant = {
  id: TcfVariantId;
  label: { en: string; fr: string };
  /** Épreuves always present. */
  required: TcfEpreuve[];
  /** Épreuves the candidate may or may not have sat. */
  optional: TcfEpreuve[];
  /**
   * The top of the QCM scale. `null` where it is not established — see the
   * note on IRN above. A null here means the conversion must refuse.
   */
  qcmMax: number | null;
  /** Whether the layout prints a combined QCM score. */
  hasGlobal: boolean;
  /**
   * Whether this variant's CURRENT layout carries a verification QR.
   *
   * **A QR present is evidence; a QR absent is not.** Found 2026-08-28 by
   * this file's own detector failing on three real TCF Canada attestations:
   * `hasQr` was being used as a filter in both directions, and the 2021 and
   * 2025 documents in the corpus carry no QR at all. The QR arrived with an
   * FEI layout change, so its absence dates a document — it does not tell
   * you which examination it is. Treating it as a variant property made
   * three genuine TCF Canada attestations match no known variant.
   */
  hasQr: boolean;
  /**
   * Whether the document carries a photograph of the candidate.
   *
   * Every attestation does. A *fiche de résultats provisoires* does not, and
   * that absence — with no QR and no expression épreuve — is how it is
   * recognised.
   */
  hasPhoto: boolean;
  /** Whether IRCC accepts this variant for Express Entry. */
  irccAccepted: boolean;
  /** Our exam definition id, where we model it. */
  examId: string | null;
  why?: { en: string; fr: string };
};

export const TCF_VARIANTS: TcfVariant[] = [
  {
    id: 'canada',
    label: { en: 'TCF Canada', fr: 'TCF Canada' },
    required: ['comprehension_orale', 'comprehension_ecrite', 'expression_orale', 'expression_ecrite'],
    optional: [],
    qcmMax: 699,
    hasGlobal: false,
    hasQr: true,
    hasPhoto: true,
    irccAccepted: true,
    examId: 'tcf-canada',
  },
  {
    id: 'tout-public',
    label: { en: 'TCF Tout public', fr: 'TCF Tout public' },
    required: ['comprehension_orale', 'maitrise_des_structures', 'comprehension_ecrite'],
    optional: ['expression_orale', 'expression_ecrite'],
    qcmMax: 699,
    hasGlobal: true,
    hasQr: true,
    hasPhoto: true,
    irccAccepted: false,
    examId: null,
    why: {
      en: 'TCF Tout public is a different examination from TCF Canada — it awards a mark for maîtrise des structures de la langue, which TCF Canada does not test — and IRCC does not accept it for Express Entry.',
      fr: "Le TCF Tout public est un autre examen que le TCF Canada — il note la maîtrise des structures de la langue, que le TCF Canada n'évalue pas — et IRCC ne l'accepte pas pour Entrée express.",
    },
  },
  {
    id: 'quebec',
    label: { en: 'TCF pour le Québec', fr: 'TCF pour le Québec' },
    required: ['comprehension_orale', 'expression_orale'],
    optional: [],
    qcmMax: 699,
    hasGlobal: false,
    hasQr: false,
    // The corpus document carries NO photograph, though a published survey of
    // TCF layouts says it does. The paper wins over the survey.
    hasPhoto: false,
    irccAccepted: false,
    examId: null,
    why: {
      en: 'TCF pour le Québec reports two épreuves only — listening and speaking. It is a Québec immigration document and is not an Express Entry language test.',
      fr: "Le TCF pour le Québec ne rapporte que deux épreuves — compréhension orale et expression orale. C'est un document d'immigration québécoise, pas un test de langue pour Entrée express.",
    },
  },
  {
    id: 'irn',
    label: { en: 'TCF IRN (France — residence / naturalisation)', fr: 'TCF IRN (intégration, résidence, nationalité)' },
    required: ['comprehension_orale', 'comprehension_ecrite', 'expression_orale', 'expression_ecrite'],
    optional: [],
    // Deliberately null. See the file header.
    qcmMax: null,
    hasGlobal: false,
    hasQr: true,
    hasPhoto: true,
    irccAccepted: false,
    examId: null,
    why: {
      en: 'TCF IRN is the French residence and naturalisation exam and certifies A1 to B2 only. It is not accepted for Canadian Express Entry, and its published score scale is not agreed between sources — so no level is calculated from it here.',
      fr: "Le TCF IRN est l'examen français pour la résidence et la naturalisation et ne certifie que de A1 à B2. Il n'est pas accepté pour Entrée express, et son barème publié n'est pas concordant selon les sources — aucun niveau n'en est donc calculé ici.",
    },
  },
  {
    // Kept so a candidate can say "mine looks like this", and so the
    // catalogue records that the older layout exists — but it is NOT a
    // separate examination, and `detectTcfVariant` deliberately does not try
    // to tell it apart from `tout-public`. It cannot: the box set is
    // identical, because it IS Tout public, issued by CIEP before FEI.
    // Three real documents made the detector return "ambiguous" for a
    // distinction that carries no consequence — same épreuves, same scale,
    // same answer from IRCC.
    id: 'legacy',
    label: { en: 'TCF — older CIEP attestation', fr: 'TCF — ancienne attestation CIEP' },
    required: ['comprehension_orale', 'maitrise_des_structures', 'comprehension_ecrite'],
    optional: ['expression_orale', 'expression_ecrite'],
    qcmMax: 699,
    hasGlobal: true,
    hasQr: false,
    hasPhoto: true,
    irccAccepted: false,
    examId: null,
    why: {
      en: 'The older CIEP layout is the Tout public examination under its previous issuer. Same reason, and it is old enough that IRCC would refuse it on age alone.',
      fr: "L'ancienne présentation CIEP correspond à l'examen Tout public sous son émetteur précédent. Même raison, et elle est assez ancienne pour qu'IRCC la refuse déjà sur l'ancienneté.",
    },
  },
  {
    id: 'provisional',
    label: { en: 'Fiche de résultats provisoires', fr: 'Fiche de résultats provisoires' },
    required: ['comprehension_orale', 'maitrise_des_structures', 'comprehension_ecrite'],
    optional: [],
    qcmMax: 699,
    hasGlobal: true,
    hasQr: false,
    hasPhoto: false,
    irccAccepted: false,
    examId: null,
    why: {
      en: 'A provisional results sheet is not a result. It says so itself: the TCF office reserves the right to cancel these results, and only the definitive attestation on secured paper is valid. It is recognisable by what it lacks — no photograph, no QR code, and no expression épreuves at all.',
      fr: "Une fiche de résultats provisoires n'est pas un résultat. Elle le dit elle-même : le bureau du TCF se réserve le droit d'annuler ces résultats, et seule l'attestation définitive, sur papier sécurisé, fait foi. On la reconnaît à ce qui lui manque — ni photographie, ni QR code, ni aucune épreuve d'expression.",
    },
  },
];

export const variantById = (id: TcfVariantId) => TCF_VARIANTS.find((v) => v.id === id)!;

/**
 * What can be seen on the paper, as a candidate or a reader would report it.
 * Every field is optional because a reader may not establish all of them,
 * and a detector that requires everything establishes nothing.
 */
export type TcfEvidence = {
  /** Épreuve rows the document prints, whether or not they carry a mark. */
  boxes?: TcfEpreuve[];
  /** Does it print a combined QCM score? */
  global?: boolean;
  qr?: boolean;
  photo?: boolean;
  /** The largest QCM score printed, which bounds the scale from below. */
  maxQcmScore?: number;
  /** The title line, if read. Used LAST and never alone — see `detect`. */
  title?: string;
};

export type TcfDetection = {
  variant: TcfVariantId | null;
  /** Every variant the evidence is consistent with. */
  candidates: TcfVariantId[];
  /** Why the answer is what it is, in one line, for a human to check. */
  reason: string;
  /** True where the evidence contradicts itself and nothing should be assumed. */
  contradiction?: string;
};

/**
 * Which TCF is this?
 *
 * **Shape first, title last, and never title alone.** A real attestation in
 * the corpus is titled « Test de RECONNAISSANCE du français pour le Canada »
 * — the awarding body's own typo for *connaissance*, printed and signed. A
 * matcher keyed on the title string would have failed on a genuine document
 * and, worse, a survey of layouts assigns that exact title to TCF IRN, whose
 * scale may top out at 399 or 499. The document prints 602 and 665. Taking
 * the title at its word would have put two scores above the ceiling of the
 * scale they were being read on, and the candidate would have been told they
 * were something they are not.
 *
 * So the box set decides, the scores veto, and the title is a tiebreak.
 */
export function detectTcfVariant(e: TcfEvidence): TcfDetection {
  const boxes = e.boxes ? [...e.boxes].sort() : null;
  let candidates = TCF_VARIANTS.filter((v) => {
    if (!boxes) return true;
    const allowed = new Set<TcfEpreuve>([...v.required, ...v.optional]);
    // Every box printed must belong to the variant, and every required
    // épreuve must appear as a row — « non inscrit » is still a row.
    return boxes.every((b) => allowed.has(b)) && v.required.every((r) => boxes.includes(r));
  });

  if (e.global !== undefined) candidates = candidates.filter((v) => v.hasGlobal === e.global);

  // A QR PRESENT rules out the layouts that never had one. A QR ABSENT rules
  // out nothing — it dates the document, it does not name the exam. This
  // asymmetry is the fix for the defect described on `hasQr` above.
  if (e.qr === true) candidates = candidates.filter((v) => v.hasQr);

  // The photograph is the other way round, and symmetric: every attestation
  // carries one, and only the provisional sheet does not.
  if (e.photo !== undefined) candidates = candidates.filter((v) => v.hasPhoto === e.photo);

  // The scores veto. A printed score above a variant's ceiling proves it is
  // not that variant, whatever the title says.
  let contradiction: string | undefined;
  if (e.maxQcmScore !== undefined) {
    const before = candidates.map((v) => v.id);
    candidates = candidates.filter((v) => v.qcmMax === null || e.maxQcmScore! <= v.qcmMax);
    const dropped = before.filter((id) => !candidates.some((v) => v.id === id));
    if (dropped.length)
      contradiction = `a printed score of ${e.maxQcmScore} is above the scale of ${dropped.join(', ')}`;
  }

  // `legacy` IS `tout-public`, under its previous issuer. Where both survive
  // together, the answer is tout-public and the issuer is a separate fact.
  const ids = new Set(candidates.map((v) => v.id));
  if (ids.size === 2 && ids.has('legacy') && ids.has('tout-public'))
    candidates = candidates.filter((v) => v.id === 'tout-public');

  if (candidates.length === 1)
    return { variant: candidates[0].id, candidates: [candidates[0].id], reason: 'the épreuves printed match exactly one variant', contradiction };

  // Title, last, and only to choose among what the shape already allows.
  if (e.title && candidates.length > 1) {
    const t = e.title.toLowerCase();
    const byTitle = candidates.filter((v) =>
      v.id === 'canada' ? t.includes('canada')
      : v.id === 'quebec' ? t.includes('québec') || t.includes('quebec')
      : v.id === 'tout-public' || v.id === 'legacy' ? t.includes('tout public')
      : v.id === 'provisional' ? t.includes('provisoire')
      : false,
    );
    if (byTitle.length === 1)
      return { variant: byTitle[0].id, candidates: candidates.map((v) => v.id), reason: 'the épreuves narrowed it and the title decided', contradiction };
  }

  return {
    variant: null,
    candidates: candidates.map((v) => v.id),
    reason:
      candidates.length === 0
        ? 'no known TCF variant prints this combination — ask the candidate rather than guessing'
        : `${candidates.length} variants remain consistent; the candidate must say which`,
    contradiction,
  };
}

/**
 * The refusal a provisional sheet earns, in the candidate's words.
 *
 * It is not a rejection of the candidate and must not read like one — the
 * marks on it are real, the plan is built from them, and the definitive
 * attestation is usually weeks away and identical.
 */
export const PROVISIONAL_REFUSAL = {
  en: 'This is a provisional results sheet, not your attestation. The sheet says so itself — the TCF office can still cancel these results, and only the definitive attestation on secured paper counts. We will build your plan from these marks right now, and they are not recorded as an official result until you enter the definitive attestation.',
  fr: "Il s'agit d'une fiche de résultats provisoires, pas de votre attestation. La fiche le dit elle-même : le bureau du TCF peut encore annuler ces résultats, et seule l'attestation définitive sur papier sécurisé fait foi. Nous bâtissons votre plan à partir de ces notes dès maintenant, et elles ne sont pas enregistrées comme résultat officiel tant que vous n'avez pas saisi l'attestation définitive.",
} as const;
