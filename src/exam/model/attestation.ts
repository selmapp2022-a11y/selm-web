/**
 * What an official score report reduces to before it is stored.
 *
 * This file exists because the calibration set cannot be collected safely
 * without it, and it has to exist BEFORE the first upload rather than after.
 *
 * A Test Report Form or a TCF attestation is a government-relevant identity
 * document. It carries the candidate's name, date of birth, nationality,
 * candidate number, centre, and a photograph. None of that is needed to
 * calibrate anything. What calibration needs is four levels, a date and an
 * exam id.
 *
 * So the shape below is the whole record. It is deliberately impossible to
 * express a name in it. A redaction rule written in a policy document is a
 * hope; a type that has no field for the thing is a guarantee, and the
 * reviewer of any pull request can see it in one screen.
 *
 * The image is never stored. Extraction happens at the moment of upload and
 * the file is discarded in the same request; nothing downstream ever holds a
 * copy. That is a stronger promise than "we delete it later" and it is the
 * only one the product should make.
 */
import type { LanguageCode } from './types';

/**
 * The two kinds of evidence an attestation can be, and what each one can
 * honestly be used to claim.
 *
 * | | Establishes | Reachable? |
 * |---|---|---|
 * | `retrospective` | **Alignment** — does our marking agree with official marking, on the same person | Yes, at scale, from day one |
 * | `prospective`   | **Predictive validity** — did our forecast of a future sitting hold | Rarely, and slowly |
 *
 * Amendment 2 §1.3, and it is the reason these are two words and not one:
 * **a retrospective attestation carries drift.** The candidate sat in June
 * and wrote for us in September, and has been studying in between.
 * Agreement measured across that gap is agreement PLUS whatever they
 * learned. So the interval is recorded with every pair and published with
 * every figure — see `calibration.ts`.
 */
export type AttestationKind = 'retrospective' | 'prospective';

export type EntryMethod =
  | 'typed'
  /** An image was offered and could not be read. §1.4's own row: typed values stand, recorded as unread. */
  | 'typed+image_unread'
  | 'typed+image_agreed'
  | 'typed+image_disagreed_resolved';

/**
 * Whether the awarding body's own check confirmed this document, and — where
 * it did not — WHY not. The distinction was added 2026-08-28 because
 * `unverified` was carrying two situations that call for different actions:
 *
 * | | means | what to do |
 * |---|---|---|
 * | `qr_verified` | the QR was followed and the body confirmed it | nothing |
 * | `no_qr_legacy_format` | the document predates verification — no QR exists to follow | nothing CAN be done; do not imply otherwise |
 * | `not_available` | a check exists but is not open to us | say so plainly |
 *
 * Of sixteen real score reports, **eight carry no QR at all** — every CIEP
 * attestation and every pre-2023 FEI layout. Filing those as `unverified`
 * reads as "we did not bother", and a reviewer looking at a calibration set
 * would discount them for a failure that is ours rather than theirs.
 *
 * `not_available` covers two closures that are the same from the candidate's
 * side: IELTS restricts verification to registered Recognising
 * Organisations, which SELM is not; and a current TCF attestation carries a
 * QR that no reader here is bound to follow. In both cases a check exists
 * and we did not make it, which is not the same as no check existing.
 * **Never mixed silently.**
 */
export type Verification = 'qr_verified' | 'no_qr_legacy_format' | 'not_available';

export type Attestation = {
  /**
   * Random, generated at upload. Not derived from anything on the document
   * and not linkable back to the candidate's account by anyone reading the
   * calibration set.
   */
  id: string;
  /** Which exam definition this attestation belongs to, e.g. 'ielts-gt'. */
  examId: string;
  /**
   * Which of the two kinds of evidence this is. **Derived, never asked** —
   * see `kindOf` below.
   *
   * Amendment 1 §1 introduced this field to EXCLUDE retrospective
   * attestations from the calibration count. **Amendment 2 §1 reverses that
   * and the reversal is right:** the prospective loop requires a candidate
   * to practise here, be predicted, sit the real exam and come back, and
   * that population is small and slow. Waiting for it means waiting
   * indefinitely, and meanwhile the attestations that DO arrive after a
   * sitting are selected for failure — the candidate who passed has what
   * they came for and leaves.
   *
   * So both kinds count. **The field's job changed from excluding to
   * separating**, because the two measure different things and adding them
   * together would produce a number that means neither.
   */
  kind: AttestationKind;
  /**
   * How the four numbers arrived. §1.4: the candidate types them AND
   * uploads the image, the typed values are the source of truth, and
   * disagreement asks rather than silently preferring either.
   */
  entryMethod: EntryMethod;
  /**
   * Whether the awarding body's own check confirmed the document.
   * §2.4: TCF and TEF publish a QR that anyone can follow; IELTS restricts
   * verification to registered Recognising Organisations, which SELM is not.
   * **Never mixed silently.**
   */
  verification: Verification;
  language: LanguageCode;
  /**
   * The sitting date, month precision. The day is not needed to calibrate
   * and a full date plus an exam centre narrows a person considerably.
   */
  sat: `${number}-${number}`;
  /**
   * The awarded result, on the exam's own scale, per skill. This is the
   * ground truth, and it is the only thing on the document that is.
   *
   * **`null` is a real value and means the candidate did not sit that
   * épreuve.** Discovered 2026-08-28 from a corpus of eight real score
   * reports: TCF's expression épreuves are optional, and two attestations in
   * the sample print *« Non inscrit(e) à cette épreuve »* where a mark would
   * go. A form that demands four numbers cannot accept those documents at
   * all, and a zero would be a lie about a test nobody took.
   */
  awarded: {
    speaking: number | null;
    listening: number | null;
    reading: number | null;
    writing: number | null;
  };
  /**
   * The benchmark levels those map to, so the gate can count by level.
   *
   * `null` wherever `awarded` is `null`. There is no CLB/NCLC level for an
   * épreuve nobody sat, and a zero here would be worse than a blank: the
   * planner sorts by distance to target, so a fabricated 0 would silently
   * become "this candidate's most urgent skill" on evidence that does not
   * exist.
   */
  benchmark: {
    system: string;
    speaking: number | null;
    listening: number | null;
    reading: number | null;
    writing: number | null;
  };
  /**
   * The candidate's own responses that fall inside the prediction window
   * before `sat`, by id. Never the text — the text already lives with the
   * response, and copying it here would create a second store of the
   * candidate's writing with a different retention rule.
   */
  responseIds: string[];
  /**
   * Marks a variant prints that are NOT one of the four teaching skills. Kept
   * as printed, for completeness, and NEVER converted to a benchmark level —
   * none of them seeds a per-skill plan.
   *
   * They exist because the form the candidate is reading shows them and a
   * cross-check needs the printed value: TCF Tout public prints a *maîtrise
   * des structures* mark and a *note globale*; an IELTS Test Report Form
   * prints an Overall Band and a CEFR level, and the spec requires both IELTS
   * cross-checks (skills-average-to-Overall, Overall-agrees-with-CEFR) to run,
   * which is impossible unless the printed Overall and CEFR are captured.
   *
   * Optional, so every record written before this field existed stays valid.
   */
  otherMarks?: {
    /** TCF maîtrise des structures, on the /699 QCM scale. */
    maitrise?: number | null;
    /** TCF note globale, on the /699 scale. */
    global?: number | null;
    /** IELTS Overall Band as printed, 0-9 in half steps. */
    overallBand?: number | null;
    /** IELTS CEFR level as printed, e.g. "C1". */
    cefr?: string | null;
  };
  /**
   * How this arrived, so a self-selection bias can be measured rather than
   * assumed away. Candidates who did well are more likely to volunteer a
   * report, and a set built only from `volunteered` will overstate accuracy
   * exactly where the product is most confident.
   */
  provenance: 'volunteered' | 'incentivised' | 'partner_institution';
  /**
   * Whether the candidate says they studied since the sitting. Asked once,
   * at upload, and `null` — *rather not say* — is a real answer that is not
   * treated as "no".
   *
   * It never changes the plan. It changes only how much weight this record
   * carries when our marking is compared with official marking, because
   * studying in between is the mechanism by which the interval does damage.
   * Amendment 2 §1.3.
   */
  studiedSince: boolean | null;
  /**
   * The document's OWN expiry, as printed on it. `null` where it prints none.
   *
   * Not the same thing as `retainUntil`, which is our retention rule. This is
   * whether the awarding body still stands behind the result, and whether
   * IRCC would accept it.
   *
   * **Of eight real score reports, two printed an expiry and both had already
   * passed it.** A plan built on those marks is built on numbers no
   * immigration officer will look at, and the product would have said nothing.
   * TCF attestations are valid two years; IELTS prints no expiry but its own
   * note recommends re-assessment after two years, and IRCC applies its own
   * limit.
   */
  expiresAt: string | null;
  /**
   * Whether this is the awarding body's definitive result or an interim sheet.
   *
   * A TCF *fiche de résultats provisoires* carries scores and says in its own
   * words that only the definitive attestation on secured paper is valid. It
   * is worth having — it is a real measurement of a real candidate — but it
   * is not the same evidence, and adding it to the same pile as a definitive
   * attestation would be the same mistake as adding retrospective and
   * prospective pairs together.
   */
  documentStatus: 'definitive' | 'provisional';
  /** ISO timestamp of the consent that permitted this record to exist. */
  consentedAt: string;
  /**
   * When this record is destroyed. Calibration needs the record for as long
   * as the model it calibrates is in service, so this is a real date and not
   * "indefinitely".
   */
  retainUntil: string;
};

/**
 * `kind`, derived from the record itself.
 *
 * **Never asked.** A question — *"did you sit this before you started with
 * us?"* — invites the answer the candidate thinks earns the better outcome,
 * and the field decides how the record is counted. The dates already hold
 * the answer: a prospective attestation is one where responses of ours fall
 * inside the prediction window BEFORE the sitting.
 */
export function kindOf(a: Pick<Attestation, 'responseIds'>): AttestationKind {
  return a.responseIds.length > 0 ? 'prospective' : 'retrospective';
}

/**
 * The four things the consent has to say, in the candidate's words, before
 * an upload control is shown. Written here rather than in a design file
 * because the wording is a legal artefact, not a copy decision, and it
 * belongs next to the shape it authorises.
 */
export const CONSENT_POINTS = {
  en: [
    'We read four numbers off your result and nothing else. Your name, date of birth, candidate number and photo are never stored.',
    'The image you upload is discarded in the same moment it is read. We do not keep a copy.',
    'We use those numbers twice: to build your study plan from your real marks, and to check how closely our marking agrees with official marking. We publish that agreement figure, and we always say which of the two kinds of evidence it rests on.',
    'You can withdraw it at any time and the record is destroyed. Withdrawing does not affect anything else in your account.',
  ],
  fr: [
    "Nous relevons quatre chiffres sur votre attestation, rien d'autre. Vos nom, date de naissance, numéro de candidat et photo ne sont jamais conservés.",
    "L'image que vous téléversez est détruite au moment même où elle est lue. Nous n'en gardons aucune copie.",
    "Ces chiffres servent à deux choses : bâtir votre plan d'étude à partir de vos notes réelles, et vérifier dans quelle mesure notre correction s'accorde avec la correction officielle. Nous publions ce chiffre d'accord, en précisant toujours sur quel type de preuve il repose.",
    "Vous pouvez le retirer à tout moment et l'enregistrement est détruit. Ce retrait n'affecte rien d'autre dans votre compte.",
  ],
} as const;


/**
 * Has the awarding body's own validity period passed?
 *
 * `null` for a document that prints no expiry — which is not the same as
 * "valid forever" and must not be rendered as though it were.
 *
 * `expiresAt` is held at MONTH precision, for the same reason `sat` is: a TCF
 * attestation expires exactly two years after the sitting, so storing a full
 * expiry date would hand back the full sitting date the form deliberately
 * refused to ask for. A month is therefore read as its LAST instant — a
 * document valid through January is not expired on the 2nd of January.
 */
export function isExpired(a: Pick<Attestation, 'expiresAt'>, on: Date = new Date()): boolean | null {
  if (!a.expiresAt) return null;
  const m = /^(\d{4})-(\d{2})$/.exec(a.expiresAt);
  const end = m
    ? new Date(Date.UTC(Number(m[1]), Number(m[2]), 1) - 1)
    : new Date(a.expiresAt);
  if (Number.isNaN(end.getTime())) return null;
  return end < on;
}
