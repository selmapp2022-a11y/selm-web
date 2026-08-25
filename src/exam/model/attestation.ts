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

export type Attestation = {
  /**
   * Random, generated at upload. Not derived from anything on the document
   * and not linkable back to the candidate's account by anyone reading the
   * calibration set.
   */
  id: string;
  /** Which exam definition this attestation belongs to, e.g. 'ielts-gt'. */
  examId: string;
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
 * The four things the consent has to say, in the candidate's words, before
 * an upload control is shown. Written here rather than in a design file
 * because the wording is a legal artefact, not a copy decision, and it
 * belongs next to the shape it authorises.
 */
export const CONSENT_POINTS = {
  en: [
    'We read four numbers off your result and nothing else. Your name, date of birth, candidate number and photo are never stored.',
    'The image you upload is discarded in the same moment it is read. We do not keep a copy.',
    'We use those numbers to measure how close our practice scores were to your real result, and to publish that error figure.',
    'You can withdraw it at any time and the record is destroyed. Withdrawing does not affect anything else in your account.',
  ],
  fr: [
    "Nous relevons quatre chiffres sur votre attestation, rien d'autre. Vos nom, date de naissance, numéro de candidat et photo ne sont jamais conservés.",
    "L'image que vous téléversez est détruite au moment même où elle est lue. Nous n'en gardons aucune copie.",
    "Ces chiffres servent à mesurer l'écart entre nos notes d'entraînement et votre résultat réel, et à publier ce chiffre d'erreur.",
    "Vous pouvez le retirer à tout moment et l'enregistrement est détruit. Ce retrait n'affecte rien d'autre dans votre compte.",
  ],
} as const;
