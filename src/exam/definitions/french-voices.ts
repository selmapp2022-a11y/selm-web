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
  {
    id: 'int-f',
    variety: 'international',
    gender: 'female',
    vendorName: 'Clémence - Advertising',
    why: 'Parisian female, confident and brisk. Chosen after the first candidate (Julia) was heard and rejected — the vendor description had recommended Julia warmly, which is the whole reason the listening gate exists.',
  },
  {
    id: 'int-m',
    variety: 'international',
    gender: 'male',
    vendorName: 'Antoine - Audiobook Narrator',
    why: 'Young Parisian male. The second voice of the majority variety, and the one that makes its dialogues possible: two speakers of one variety, one female and one male.',
  },

  // --- quebecois (minority) -----------------------------------------------
  {
    id: 'qc-f',
    variety: 'quebecois',
    gender: 'female',
    vendorName: 'Amélie - Young, Confident and Friendly',
    why: 'Québécois female, described as "100% authentic Quebec accent". Approved on first hearing.',
  },
  {
    id: 'qc-m',
    variety: 'quebecois',
    gender: 'male',
    vendorName: 'Alexandre - Authentic French Canadian',
    why: 'Québécois male. Claims the accent plainly rather than as a character part, and held up when heard.',
  },

  // ── WEST AFRICAN AND BELGIAN WERE CAST HERE, AND ARE OUT ────────────────
  //
  // Removed 31 August 2026 on the founder's ruling: *"for the French exam, the
  // practice and the lessons, use only Québécois, Parisian and Swiss — only
  // those three."*
  //
  // Both were auditioned and both passed. Fatou was the second West African
  // female, chosen after Alimata was rejected by ear; Keli was approved on
  // first hearing and is Togolese specifically rather than "African"
  // generally, which is what the old mix asked for. Christophe Géradon was the
  // only Belgian voice on the library, and the reason Belgian was confined to
  // monologues. Naming them here rather than deleting the lines is the point:
  // if the ruling is ever revisited, the work of choosing them does not have
  // to be done again, and neither does the work of learning that the library
  // holds no Belgian French female voice.
  //
  //   wa-f  Fatou - Radiant and Gentle
  //   wa-m  Keli - Calm & Natural African
  //   be-m  Christophe Géradon - Soft and Narrative
  //
  // Nine recordings were spoken by them and are re-rendered — see
  // `tcf-variety-plan.ts`.

  // --- swiss (occasional) -------------------------------------------------
  {
    id: 'ch-m',
    variety: 'swiss',
    gender: 'male',
    vendorName: 'Romain - Joyful, Optimistic and engaging',
    why: 'Swiss male. Chosen after the first candidate (Peter) was rejected on hearing, despite being the most-used Swiss French voice in the library by a wide margin. Popularity is not an ear.',
  },
  {
    id: 'ch-f',
    variety: 'swiss',
    gender: 'female',
    vendorName: 'Nathalie - Tender and Optimistic',
    why: 'Swiss female, carrying small natural hesitations. Hesitations belong in a conversation item and are wrong in a monologue, so this voice is cast and not used everywhere.',
  },

  // ── ACADIAN WAS CAST AND NEVER SCHEDULED, AND IS NOW OUT ────────────────
  //
  // Same ruling. It was in the cast and in no plan: `ACADIAN_NOTE` recorded
  // that Maritime French is a real variety a candidate for Canada can meet,
  // and that nothing scheduled it, so nothing had been rendered with it and
  // nobody had heard it. It cost nothing to keep and now costs nothing to
  // drop — the only thing lost is the two names, which are here:
  //
  //   ac-f  Evangeline - Warm Acadian Conversational
  //   ac-m  Seddik - French
];

/**
 * The voices that were heard and rejected, and why that list matters.
 *
 * Three of the eight French candidates auditioned on 29 August 2026 did not
 * survive being listened to:
 *
 *   Julia - Warm French Narrator      international, female
 *   Peter - Clear, Engaging...        swiss, male
 *   Alimata - Professional...         west african, female
 *
 * All three had been chosen FROM THE VENDOR'S OWN DESCRIPTIONS, and the
 * descriptions were good: "warm, gentle, clear diction", "crisp, professional",
 * "great for conversation". Peter is the most-used Swiss French voice in the
 * library.
 *
 * **Three of eight is the number to remember.** It is the measured failure rate
 * of choosing voices by reading about them, and it is why this file will not
 * accept a voice that has not been heard — including, still, its own narrator
 * equivalent in `ielts-voices.ts`.
 */
export const HEARD_AND_REJECTED = [
  { vendorName: 'Julia - Warm French Narrator', variety: 'international' as SpeechVariety },
  { vendorName: 'Peter - Clear, Engaging and Professional', variety: 'swiss' as SpeechVariety },
  { vendorName: 'Alimata - Professional and Welcoming', variety: 'west_african' as SpeechVariety },
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
   *
   * DONE, 29 August 2026. Eight candidates rendered on the production model
   * with real lines from this bank, played back one at a time, five approved
   * and three replaced. The batch may run.
   */
  castHeard: true,
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

/**
 * There is no French narrator, and that is a difference between the two exams
 * rather than an omission in this file.
 *
 * `ielts-voices.ts` casts a narrator — the voice that says *"Now turn to Part
 * two. You will hear a talk given by a museum guide. First, you have some time
 * to look at questions eleven to twenty."* In IELTS those sentences are INSIDE
 * the recording. The candidate hears them, which is why the role exists, why it
 * has to be older than every speaking voice, and why it was auditioned on its
 * own line.
 *
 * The TCF listening section as built here delivers that information on screen
 * instead. From `tcf-canada.ts`:
 *
 *     questionAfterAudio: true        the question comes AFTER the audio
 *     presentation: 'one_at_a_time'   one recording, then its question
 *
 * So each of the 39 recordings is only the material — an announcement, a
 * dialogue, an exposé. There is no sentence for a narrator to read, and casting
 * one "for symmetry with IELTS" would put a voice into the exam that the exam
 * has no line for.
 *
 * ONE HONEST CAVEAT. The real TCF does number its items in the audio; this
 * product substitutes on-screen presentation for that, a delivery decision
 * already taken in the exam definition. **If `questionAfterAudio` or
 * `presentation` ever changes, or spoken item numbering is added, a French
 * narrator becomes necessary** — and it goes through the same gate as every
 * other voice here: chosen, rendered on the real line, and heard.
 */
export const NO_FRENCH_NARRATOR_BY_DESIGN = true;
