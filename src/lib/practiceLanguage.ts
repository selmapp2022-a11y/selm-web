/**
 * What language the four practice surfaces should work in.
 *
 * The answer is not a setting and it is not the device locale. **It is the
 * exam the candidate chose**, which is the whole argument of Part 3:
 *
 * > *"For a candidate with no attestation, the level is not the organising
 * > fact. The chosen exam is."*
 *
 * Amendment 2 §2.3 lists four blockers that came from having no way to ask
 * this question, so the code answered it by assuming. Two of them are here:
 * `fd.append('language', 'en-US')` twice in `speaking.ts`, and
 * `startsWith('en')` on the voice list in `tts.ts`.
 *
 * The value is read from the plan, which copies it from the exam definition
 * when the exam is chosen — see `exam/model/plan.ts`. That keeps the exam
 * definition as the single source of truth while keeping 72 000 characters
 * of authored French out of the app bundle.
 */
import { loadPlan } from '../exam/model/plan';

/** BCP-47 tag for speech assessment and word segmentation. */
export function practiceLocale(): string {
  return loadPlan()?.examLocale || 'en-US';
}

/** Primary subtag only: 'en', 'fr'. */
export function practiceLanguage(): string {
  return practiceLocale().split('-')[0].toLowerCase();
}

/**
 * Does a `SpeechSynthesisVoice` belong to the practice language?
 *
 * Matched on the primary subtag, not the full tag, and deliberately: a
 * browser that offers `fr-FR` and not `fr-CA` should still speak French
 * rather than fall back to English, and STEP-10-B2 measured the
 * pronunciation scorer treating the two identically anyway.
 */
export function voiceMatchesPractice(lang: string): boolean {
  return lang.toLowerCase().startsWith(practiceLanguage());
}
