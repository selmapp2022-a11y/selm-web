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

export type Verification = 'qr_verified' | 'unverified' | 'not_available';

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
   */
  awarded: {
    speaking: number;
    listening: number;
    reading: number;
    writing: number;
  };
  /** The benchmark levels those map to, so the gate can count by level. */
  benchmark: {
    system: string;
    speaking: number;
    listening: number;
    reading: number;
    writing: number;
  };
  /**
   * The candidate's own responses that fall inside the prediction window
   * before `sat`, by id. Never the text — the text already lives with the
   * response, and copying it here would create a second store of the
   * candidate's writing with a different retention rule.
   */
  responseIds: string[];
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
