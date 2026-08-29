/**
 * The TCF Listening voice cast.
 *
 * `SELM-RULING-french-dialect.md` settled WHICH varieties a French listening
 * bank must carry (`FRENCH_VARIETY_MIX` in `../model/types`) on one principle:
 * comfort on exam day comes from having practised the variety the exam plays.
 * It did not settle who speaks them, because at the time nobody could: the
 * server key could not add voices from the shared library, and 39 recordings
 * already existed whose variety nobody had established.
 *
 * Both of those changed on 29 August 2026:
 *
 *  - the key's Voices scope was raised from Read to Write, which was the whole
 *    of the `401 missing_perm: add_voice_from_voice_library` wall;
 *  - the shared library turns out to carry a French ACCENT facet with ten
 *    values — Acadian, African, Belgian, Cajun, Creole, Meridional, Parisian,
 *    Quebec, Standard, Swiss — so every variety the ruling names is available,
 *    by name, rather than approximated by a generic French voice.
 *
 * That makes the 39 unknown recordings a smaller problem than it looked. Their
 * variety is still unrecoverable from data (`GET /v1/history` no longer reaches
 * back that far). But it no longer has to be recovered: a recording can be
 * RE-RENDERED in a variety this file declares, and a declared variety is worth
 * more than a guessed one. See `MIGRATION` at the foot of this file.
 *
 * WHY THERE ARE NO IDS HERE. Every voice below is resolved by display name
 * against the account at render time, through
 * `ElevenLabsTTSService.voice_id_for_name`. Hard-coding ids was tried in
 * `ielts-voices.ts` and produced the defect recorded there: a voice can be
 * listed by `GET /v2/voices` and still return `voice_not_found` when rendered.
 * A name that resolves to nothing fails loudly at render; an id that has gone
 * stale fails quietly, in the wrong accent.
 */

import type { SpeechVariety } from '../model/types';

export type FrenchVoiceRole = {
  /** Stable name a script refers to, never the vendor's display name. */
  id: string;
  variety: SpeechVariety;
  gender: 'male' | 'female';
  /** Resolved against the account at render time. Must match exactly. */
  vendorName: string;
  why: string;
};

/**
 * The cast, ordered by the share each variety holds in `FRENCH_VARIETY_MIX`.
 *
 * Chosen 29 August 2026 from the account's library **on the vendor's own
 * accent labels and each voice's written description — NOT by listening.**
 * That limit is recorded rather than glossed: nobody at SELM has heard these
 * voices, and a label is a claim by whoever uploaded the voice. Before the
 * first bank is built, someone must listen to one recording per variety and
 * either confirm the entry or replace it. Until then this file is a
 * well-sourced hypothesis about how the bank will sound.
 */
export const TCF_VOICE_CAST: FrenchVoiceRole[] = [
  // --- international (majority) -------------------------------------------
  // The vendor splits this across two labels, "Parisian" and "Standard".
  // Both are matched, because the distinction is the uploader's and not one
  // a candidate would hear.
  {
    id: 'int-m-1',
    variety: 'international',
    gender: 'male',
    vendorName: 'David - Professional Narrator',
    why: 'Male in his fifties, neutral Parisian, deep and steady. The register the TCF plays for an announcement or an official recorded message.',
  },
  {
    id: 'int-m-2',
    variety: 'international',
    gender: 'male',
    vendorName: 'Antoine - Audiobook Narrator',
    why: 'Young Parisian male. The other half of the majority variety: the candidate in a TCF conversation is as often a student as an official, and one age of voice for a whole variety makes the bank sound like one person.',
  },
  {
    id: 'int-f-1',
    variety: 'international',
    gender: 'female',
    vendorName: 'Julia - Warm French Narrator',
    why: 'Young Parisian female, described as steady-paced with clear diction. Clarity over character, for the same reason it matters in English: comprehension items turn on numbers, times and names.',
  },
  {
    id: 'int-f-2',
    variety: 'international',
    gender: 'female',
    vendorName: 'Clémence - Advertising',
    why: 'Parisian female, confident and brisk. The TCF plays advertisements and public announcements, which is a register the narration voices do not cover.',
  },

  // --- quebecois (minority) -----------------------------------------------
  {
    id: 'qc-m',
    variety: 'quebecois',
    gender: 'male',
    vendorName: 'Alexandre - Authentic French Canadian',
    why: 'Québécois male. Chosen over the other seven the account holds because its description claims the accent plainly rather than as a character part — the same test used for the New Zealand voices in the IELTS cast.',
  },
  {
    id: 'qc-f',
    variety: 'quebecois',
    gender: 'female',
    vendorName: 'Amélie - Young, Confident and Friendly',
    why: 'Québécois female, described as "100% authentic Quebec accent". Added deliberately: the first pass through the library came away with eight Québécois males and no female, which would have made the minority variety sound like one gender.',
  },

  // --- west_african (minority) --------------------------------------------
  {
    id: 'wa-m',
    variety: 'west_african',
    gender: 'male',
    vendorName: 'Keli - Calm & Natural African',
    why: 'Described as a Togolese accent — West African specifically, not "African" generally, which is what the mix asks for. The vendor facet is a single "African" label covering a continent, so the description is doing the work here.',
  },
  {
    id: 'wa-f',
    variety: 'west_african',
    gender: 'female',
    vendorName: 'Alimata - Professional and Welcoming',
    why: 'West African female. The name is Sahelian and the description says conversational, which is the register the TCF plays this variety in.',
  },

  // --- belgian (occasional) -----------------------------------------------
  {
    id: 'be-m',
    variety: 'belgian',
    gender: 'male',
    vendorName: 'Christophe Géradon - Soft and Narrative',
    why: 'Belgian male, described as a fifty-year-old with a slight Liège accent — a located claim rather than a generic one.',
  },

  // --- swiss (occasional) -------------------------------------------------
  {
    id: 'ch-m',
    variety: 'swiss',
    gender: 'male',
    vendorName: 'Peter - Clear, Engaging and Professional',
    why: 'Swiss male, crisp and educational in register. The most-used Swiss French voice in the library by a wide margin, which is weak evidence of quality but the only evidence available without listening.',
  },
  {
    id: 'ch-f',
    variety: 'swiss',
    gender: 'female',
    vendorName: 'Nathalie - Tender and Optimistic',
    why: 'Swiss female, described as carrying small natural hesitations. Hesitations belong in a conversation item and are wrong in a monologue, so this voice is cast and not used everywhere.',
  },

  // --- acadian ------------------------------------------------------------
  // Not in FRENCH_VARIETY_MIX. Held here deliberately: see ACADIAN_NOTE.
  {
    id: 'ac-f',
    variety: 'acadian',
    gender: 'female',
    vendorName: 'Evangeline - Warm Acadian Conversational',
    why: 'Acadian female. Present in the cast, absent from the mix — available the day someone decides the mix should carry it.',
  },
  {
    id: 'ac-m',
    variety: 'acadian',
    gender: 'male',
    vendorName: 'Seddik - French',
    why: 'Acadian male. Same standing as the female: cast, not scheduled.',
  },
];

/**
 * Belgian has a male and no female.
 *
 * The library holds seven Belgian French voices and they are all male. That is
 * a gap in the account, not a decision, and it is written down so nobody later
 * reads the cast as saying Belgian French is spoken by men. Belgian is an
 * `occasional` share, so one voice covers the mix as ruled; if the share is
 * ever raised, this has to be solved first.
 */
export const KNOWN_CAST_GAPS = [
  { variety: 'belgian' as SpeechVariety, missing: 'female', reason: 'the library holds no Belgian French female voice' },
];

/**
 * Why Acadian is cast but not scheduled.
 *
 * It is a real variety of Canadian French and an immigration candidate can
 * meet it. It is not in `FRENCH_VARIETY_MIX` because the ruling derived that
 * mix from what the TCF actually plays — Paris, Geneva, Dakar, Montreal,
 * Brussels — and adding a variety on the grounds that it EXISTS in Canada is
 * the same error the ruling rejected when it refused to make Québécois
 * dominant. Putting the voices in the cast costs nothing and means the
 * decision, if it is ever taken, is a one-line change to the mix.
 *
 * Upheld 29 August 2026 (`SELM-RULINGS-voices.md` §2), which added the
 * argument this file was missing: it is not only that "it exists in Canada"
 * is the wrong test — **the evidence base itself excludes Acadian.** The
 * mixture is grounded in FEI's own TCF material, which draws on Paris,
 * Geneva, Dakar, Montreal and Brussels. Acadian is not among them.
 *
 * Cast, unscheduled, reason recorded. If evidence later shows the real TCF
 * plays it, it is one line.
 */
export const ACADIAN_NOTE = true;

/**
 * What to do about the 39 recordings marked `variety: 'unknown'`.
 *
 * They were generated before any of this existed and carry no record of which
 * voice spoke them. Three options were considered:
 *
 *  1. Listen to them and label them. Still correct, still needs a French ear,
 *     and gives a true label for 39 files.
 *  2. Read the vendor's generation history. Closed — `GET /v1/history` is
 *     readable again since the key was fixed, but does not reach back that far.
 *  3. Re-render them from their scripts against this cast, which REPLACES the
 *     unknown with a declared variety instead of discovering it.
 *
 * Option 3 is the one this file makes possible, and it is cheap: the whole
 * French bank is roughly 40 000 characters, about 40 000 credits, against an
 * account balance of ~348 000 with 15 060 used in the last cycle. Cost is not
 * what has been blocking this.
 *
 * It is NOT started here, because re-rendering 39 recordings changes what
 * every candidate mid-plan is listening to, and that is a decision for the
 * founder rather than a consequence of a voice-cast file.
 */
export const MIGRATION = {
  unknownRecordings: 39,
  approvedApproach: 're_render' as null | 'listen_and_label' | 're_render',
  /**
   * Ruled 29 August 2026, and NOT on the grounds this file expected.
   *
   * The file assumed the choice was between discovering the varieties and
   * declaring them. The ruling pointed out that discovery cannot succeed
   * either: the 39 were rendered in one batch, from one cast, by one process,
   * so **whatever variety they turn out to be, they are all the same one.**
   * A perfect identification still leaves a bank of a single variety, and
   * `FRENCH_VARIETY_MIX` requires a weighted mixture.
   *
   *   *"Listening tells us what they are. It does not make them what the
   *   ruling requires."*
   *
   * The cost objection was dismissed on facts: `calibration.samples` is 0,
   * no candidate is mid-plan, and 40 000 of 348 000 credits is 12% of a
   * balance running at 4% utilisation.
   */
  ruledOn: '2026-08-29',
  /**
   * The gate, from §4.2 of the same ruling, and it binds this migration too.
   *
   * Render ONE item per variety first, have it heard, then run the batch.
   * Rendering 39 files against a cast nobody has listened to would repeat
   * precisely the mistake the migration exists to correct.
   */
  castHeard: false,
} as const;

/**
 * The French cast is larger than the language labels suggest.
 *
 * ElevenLabs verifies accents PER LANGUAGE, in `verified_languages`, and that
 * field disagrees with `labels` more often than it agrees. Observed live on
 * 29 August 2026 on the account's own catalogue:
 *
 * ```json
 * // "Silias North - Passionate Narration"
 * "labels":  { "language": "en", "accent": "canadian", "gender": "male" },
 * "verified_languages": [
 *   { "language": "fr", "accent": "fr-quebec", "locale": "fr-FR",
 *     "model_id": "eleven_flash_v2_5" }
 * ]
 * ```
 *
 * A Canadian ENGLISH narrator, verified by the vendor as Québécois when
 * speaking French — which is what a Canadian anglophone speaking French
 * actually sounds like. Reading `labels.language` alone would have excluded it
 * from every French query, and with it an unknown number of others.
 *
 * So: **a voice's own language label is a statement about its primary use,
 * not a limit on what it can speak.** `find_voices` in
 * `elevenlabs_tts_service.py` reads both, and sorts native-language voices
 * first so a cross-language voice supplements the cast rather than displacing
 * it. Anyone extending this cast should search `verified_languages`, not the
 * French section of the library.
 */
export const CROSS_LANGUAGE_NOTE = true;
