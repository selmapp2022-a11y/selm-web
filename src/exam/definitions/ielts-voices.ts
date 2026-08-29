/**
 * The IELTS Listening voice cast.
 *
 * Ruling 5 left this choice here rather than in the specification, with three
 * constraints: the four accents IELTS publishes, both genders, and a FIXED
 * cast reused across every test so that successive tests feel like one
 * examination rather than a collection. The ids and the reasoning are written
 * down so the next person does not have to re-derive them.
 *
 * ielts.org states the recordings carry "Different accents, including British,
 * Australian, New Zealand and North American". Four accents is therefore a
 * format requirement, not a stylistic preference: a candidate who has only
 * ever practised on one accent has practised a different test.
 *
 * Chosen 2026-08-29 from the account's own library (21 voices: 16 American,
 * 4 British, 1 Australian) plus the shared library for the two the account
 * cannot cover. WHAT THE ACCOUNT LACKS IS RECORDED HERE RATHER THAN WORKED
 * AROUND: there is no New Zealand voice on the account at all, and only one
 * Australian, and the format needs both genders in each.
 */

export type VoiceRole = {
  /** Stable name a script refers to, never the vendor's display name. */
  id: string;
  /**
   * The vendor id, when one was verified by rendering it.
   *
   * `null` means "resolve `vendorName` against the account at render time".
   * That path exists because a hard-coded id is a promise this file cannot
   * keep: `onwK4e9ZLuTAKqWWO3F9` is listed by `GET /v2/voices` and returns
   * `voice_not_found` from text-to-speech (see the note at the foot of this
   * file). The backend resolves names through
   * `ElevenLabsTTSService.voice_id_for_name`.
   */
  voiceId: string | null;
  accent:
    | 'british'
    | 'australian'
    | 'new_zealand'
    | 'north_american'
    | 'canadian'
    | 'irish'
    | 'scottish';
  gender: 'male' | 'female';
  /** Where the voice comes from, and what has to happen before it can render. */
  source: 'account' | 'shared_library';
  /** Required to add a shared voice to the account. Null for account voices. */
  publicOwnerId: string | null;
  /** The vendor's display name at the time of choosing, for tracing only. */
  vendorName: string;
  why: string;
};

/**
 * Eight speaking voices plus a narrator.
 *
 * A single test needs seven speaking roles — Part 1 has two, Part 2 has one,
 * Part 3 has up to three, Part 4 has one — and they are drawn from this cast
 * rather than chosen per test. Choosing per test would make voice selection
 * part of authoring, which is how a bank ends up sounding like eight
 * different products.
 */
export const IELTS_VOICE_CAST: VoiceRole[] = [
  // ── British ───────────────────────────────────────────────────────────
  {
    id: 'br-m',
    voiceId: null,
    accent: 'british',
    gender: 'male',
    source: 'account',
    publicOwnerId: null,
    vendorName: 'Jofra – Expressive & Neutral Narrator',
    why: 'Neutral British narrator. Heard and approved 29 August 2026. Carries the Part 3 tutor and the Part 1 official — the two roles a British male most often plays in this exam.',
  },
  {
    id: 'br-f',
    voiceId: null,
    accent: 'british',
    gender: 'female',
    source: 'account',
    publicOwnerId: null,
    vendorName: 'Juliet - British, Natural and Engaging',
    why: 'Neutral British female, described for e-learning and educational material rather than performance. Part 2 monologues carry dense factual detail — times, prices, room numbers — and clarity is what the item depends on.',
  },

  // ── North American (United States) ────────────────────────────────────
  {
    id: 'na-m',
    voiceId: null,
    accent: 'north_american',
    gender: 'male',
    source: 'account',
    publicOwnerId: null,
    vendorName: 'Russ – Deep, Smooth and Articulate',
    why: 'Grounded and non-regional, with calm authority. The Part 4 academic monologue is the longest single stretch in the test and wants a voice that holds attention without performing.',
  },
  {
    id: 'na-f',
    voiceId: null,
    accent: 'north_american',
    gender: 'female',
    source: 'account',
    publicOwnerId: null,
    vendorName: 'Heather - Warm, Raspy American Female',
    why: 'Replaced a younger, brighter candidate the founder rejected in one word: it read as a boy rather than a woman. Age and register are not decoration in an exam — a candidate who cannot place the speaker cannot place the situation either.',
  },

  // ── Canadian ──────────────────────────────────────────────────────────
  {
    id: 'ca-m',
    voiceId: null,
    accent: 'canadian',
    gender: 'male',
    source: 'account',
    publicOwnerId: null,
    vendorName: 'Dave - Deep, Warm and Approachable',
    why: 'Mature Canadian male, conversational. Added because the founder asked why Canadian English was missing and the honest answer was that "North American" had been read as "American" — in an app whose candidates are all moving to Canada.',
  },
  {
    id: 'ca-f',
    voiceId: null,
    accent: 'canadian',
    gender: 'female',
    source: 'account',
    publicOwnerId: null,
    vendorName: 'Rebecca - Calm, Warm and Engaging',
    why: 'Canadian female. Calm rather than bright, for the same reason as the British female.',
  },

  // ── Australian ────────────────────────────────────────────────────────
  {
    id: 'au-m',
    voiceId: null,
    accent: 'australian',
    gender: 'male',
    source: 'account',
    publicOwnerId: null,
    vendorName: 'Neil - Soft Australian accent',
    why: 'Mid-range Australian male, metro accent. Replaces the single Australian voice the account happened to hold, which had been cast everywhere because it was the only one.',
  },
  {
    id: 'au-f',
    voiceId: null,
    accent: 'australian',
    gender: 'female',
    source: 'account',
    publicOwnerId: null,
    vendorName: 'Emily - Calm, clear female Australian',
    why: 'Australian female. Clear over characterful, as with the British and Canadian females.',
  },

  // ── New Zealand ───────────────────────────────────────────────────────
  {
    id: 'nz-m',
    voiceId: null,
    accent: 'new_zealand',
    gender: 'male',
    source: 'account',
    publicOwnerId: null,
    vendorName: 'Luke - New Zealand, Deep, and Steady',
    why: 'Replaced the first New Zealand male, which the founder rejected. Described as an audiobook narrator with clear diction and professional pacing rather than a Kiwi character part — the same test that chose the first one, applied to a voice that survived hearing. NOTE: carries Live Moderation, which adds latency to a render but does not affect the audio.',
  },
  {
    id: 'nz-f',
    voiceId: null,
    accent: 'new_zealand',
    gender: 'female',
    source: 'account',
    publicOwnerId: null,
    vendorName: 'Ella - Casual New Zealand Female',
    why: 'New Zealand female, casual register — Part 1 is everyday social, and a formal reading of "can I book the airport shuttle" is not what a candidate will meet.',
  },

  // ── Irish and Scottish ────────────────────────────────────────────────
  // ielts.org says "different accents, INCLUDING" the four it names. A floor,
  // not a list. Cast sparingly, as occasional Part 1 or Part 3 speakers.
  {
    id: 'ie-m',
    voiceId: null,
    accent: 'irish',
    gender: 'male',
    source: 'account',
    publicOwnerId: null,
    vendorName: 'Darren - Calm and Deep',
    why: 'Irish male. A candidate can meet this variety, and meeting it for the first time on exam day costs them the recording.',
  },
  {
    id: 'sc-f',
    voiceId: null,
    accent: 'scottish',
    gender: 'female',
    source: 'account',
    publicOwnerId: null,
    vendorName: 'Claire - Warm and Measured',
    why: 'Scottish female. Took three passes: rejected, then two alternatives rejected, then chosen after all on a second hearing. Recorded because it is the clearest evidence in this file that these judgements are not derivable from the vendor descriptions — the same voice, the same words, a different verdict.',
  },
];


/**
 * The three voices that are NOT on the account yet.
 *
 * They have to be added before the first render, or the request falls back to
 * the default voice and the recording is in the wrong accent — a failure a
 * listener notices and a check does not. Adding is one call per voice:
 *
 *   POST /v1/voices/add/{publicOwnerId}/{voiceId}
 *
 * Kept as data rather than a comment so a pre-render check can assert it.
 */
export const VOICES_TO_ADD = IELTS_VOICE_CAST.filter((v) => v.source === 'shared_library');

/**
 * The narrator — the ONE role still unheard, and it is deliberately empty.
 *
 * Twelve speaking voices were auditioned on 29 August 2026 and five were
 * rejected. The narrator was not among them, so there is no approved voice for
 * "Now turn to Part 2" and this file will not name one.
 *
 * It cannot simply borrow a speaking voice. The original reasoning holds: a
 * narrator a candidate could mistake for a speaker costs them the first
 * sentence of the recording while they work out who is talking. So it must be
 * distinct from all twelve, older than every speaking role, and heard before it
 * is cast — the same gate as the rest.
 *
 * Until then, `RENDER_VERIFIED` is empty and no IELTS listening bank should be
 * rendered. A bank whose narrator was chosen from a list is the exact practice
 * this whole exercise replaced.
 */
export const NARRATOR_PENDING = true;

/** The cast a script may draw on for one part, by the exam's own structure. */
export const PART_VOICES: Record<1 | 2 | 3 | 4, number> = {
  // "a conversation between two speakers"
  1: 2,
  // "only one speaker"
  2: 1,
  // "two university students in discussion, perhaps guided by a tutor"
  3: 3,
  // "only one person speaks on an academic subject"
  4: 1,
};

/**
 * Verified against the live key on 2026-08-29, not assumed.
 *
 * Every voice above except the two New Zealand entries and the Australian
 * female was rendered through `POST /v1/text-to-speech` on `eleven_flash_v2_5`
 * and returned audio:
 *
 *   br-m  27 211 bytes      br-f  25 539      au-m  21 777
 *   na-m  21 777            na-f  22 613      narrator (Bill)  26 375
 *
 * Two findings worth keeping, because neither is visible from the voice list:
 *
 * 1. **Being listed is not the same as being renderable.** `onwK4e9ZLuTAKqWWO3F9`
 *    (Daniel) appears in `GET /v2/voices` and returns `voice_not_found` from
 *    text-to-speech. It was the first narrator choice. Anything that picks a
 *    voice from the list without rendering it can therefore ship a cast that
 *    fails at the moment the bank is built.
 *
 * 2. **The server key could not add voices from the shared library — FIXED.**
 *    `POST /v1/voices/add/...` returned 401 `missing_perm:
 *    add_voice_from_voice_library` for all three, and `GET /v1/history`
 *    returned 401 as well, which was the only route to recovering what variety
 *    the 39 existing French recordings are. Both were the same cause: the key
 *    "Unrelenting Sumatran Tiger" is a RESTRICTED key, and its Voices scope was
 *    Read and its History scope was No Access. Raised to Voices=Write and
 *    History=Read on 29 August 2026. Nothing else was widened.
 *
 *    The lesson outlives the fix: a 401 from this vendor names the missing
 *    scope in the body. Reading it is faster than working around it, and the
 *    workaround here — "a human must click Add in the web interface" — had
 *    already been written into this file as though it were a property of the
 *    product.
 *
 * 3. **A voice the account holds is addressable by name.** Since the catalogue
 *    change in `elevenlabs_tts_service.py`, `voiceId: null` is a supported
 *    entry: the backend reads `GET /v2/voices` (cached an hour) and matches
 *    `vendorName`. Adding a voice in the ElevenLabs library is then the whole
 *    of giving the exam a new accent — no deploy, no edit to this file.
 */
/**
 * Empty, and that is the honest state.
 *
 * It used to list six premade voices verified by rendering. Every one of them
 * has been replaced: they were chosen from a list and never heard, and when the
 * founder finally listened to a comparable set, five of twelve were rejected
 * outright. A verification that the vendor returns audio is not a verification
 * that the audio is right.
 *
 * The twelve voices above were each heard and approved. What is NOT yet done is
 * a render test against the live key with the new ids resolved by name — and
 * the narrator is not chosen at all. This stays empty until both are true.
 */
export const RENDER_VERIFIED = [] as const;
