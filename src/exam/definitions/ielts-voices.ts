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
  {
    id: 'narrator',
    voiceId: 'pqHfZKP75CvOlQylNhV4',
    accent: 'north_american',
    gender: 'male',
    source: 'account',
    publicOwnerId: null,
    vendorName: 'Bill - Wise',
    why: 'The voice that says "Now turn to Part 2". Older than every speaking role and never cast as a character, because a narrator a candidate could mistake for a speaker costs them the first sentence of the recording while they work out who is talking. The first choice here was Daniel, a British male, until a render test returned voice_not_found for it — see the note below: the voice LIST and the voices that actually render are not the same set.',
  },
  {
    id: 'br-m',
    voiceId: 'JBFqnCBsd6RMkjVDRZzb',
    accent: 'british',
    gender: 'male',
    source: 'account',
    publicOwnerId: null,
    vendorName: 'George - Warm',
    why: 'British male. Middle-aged and warm, which suits the Part 3 tutor and the Part 1 official — the two roles a British male most often plays in this exam.',
  },
  {
    id: 'br-f',
    voiceId: 'Xb7hH8MSUJpSbSDYk0k2',
    accent: 'british',
    gender: 'female',
    source: 'account',
    publicOwnerId: null,
    vendorName: 'Alice - Clear',
    why: 'British female. Clear rather than characterful: Part 2 monologues carry dense factual detail (times, prices, room numbers) and clarity is what the item depends on.',
  },
  {
    id: 'au-m',
    voiceId: 'IKne3meq5aSn9XLyUdCD',
    accent: 'australian',
    gender: 'male',
    source: 'account',
    publicOwnerId: null,
    vendorName: 'Charlie - Deep',
    why: 'The account holds exactly one Australian voice. Young, which fits a Part 3 student better than a Part 4 lecturer, so it is cast accordingly rather than used everywhere.',
  },
  {
    id: 'au-f',
    voiceId: 'zMK1eWY5DTw3Jjb8efU8',
    accent: 'australian',
    gender: 'female',
    source: 'shared_library',
    publicOwnerId: '77351c16498cbe9c449e0592dd6e',
    vendorName: 'Emily - Calm, clear',
    why: 'The account has no Australian female at all. Chosen for the same reason as the British female: Part 2 and Part 4 need clarity over character.',
  },
  {
    id: 'na-m',
    voiceId: 'nPczCjzI2devNBz1zQrb',
    accent: 'north_american',
    gender: 'male',
    source: 'account',
    publicOwnerId: null,
    vendorName: 'Brian - Deep',
    why: 'North American male, middle-aged. The Part 4 academic monologue is the longest single stretch in the test and wants a voice that holds attention without performing.',
  },
  {
    id: 'na-f',
    voiceId: 'EXAVITQu4vr4xnSDxMaL',
    accent: 'north_american',
    gender: 'female',
    source: 'account',
    publicOwnerId: null,
    vendorName: 'Sarah - Mature',
    why: 'North American female. Younger register, which is what Part 1 and Part 3 conversations mostly are — a student, a caller, an enquirer.',
  },
  {
    id: 'nz-m',
    voiceId: '1HGaTm3UFxAyxae5H0GU',
    accent: 'new_zealand',
    gender: 'male',
    source: 'shared_library',
    publicOwnerId: '9f19653a0f92ff6c8f990b4a1952cc08d502f8818ccd213b7827d1360efa7cf1',
    vendorName: 'Max - New Zealand',
    why: 'The account has no New Zealand voice at all, and IELTS names that accent explicitly. Of the forty in the shared library this one is labelled plainly New Zealand rather than a Kiwi character part, which is what a listening test needs.',
  },
  {
    id: 'nz-f',
    voiceId: 'ANYdMtqQZTRmq10Nw496',
    accent: 'new_zealand',
    gender: 'female',
    source: 'shared_library',
    publicOwnerId: '95955342bdf49ea4a069f3363ca37a87ae763e9a777c09c508ebc2950232b0bf',
    vendorName: 'Ella - Casual New Zealand',
    why: 'New Zealand female, casual register — Part 1 is everyday social, and a formal reading of "can I book the airport shuttle" is not what a candidate will meet.',
  },
  {
    id: 'ca-m',
    voiceId: null,
    accent: 'canadian',
    gender: 'male',
    source: 'account',
    publicOwnerId: null,
    vendorName: 'Barclay - Universal Narration',
    why: 'Added 29 August 2026 because the founder asked why Canadian English was missing, and the honest answer was that "North American" had been read as "American". Every candidate this product serves is sitting IELTS to move to Canada; a bank with no Canadian voice in it is a strange thing to hand them. Measured and unhurried, so it can carry Part 4.',
  },
  {
    id: 'ca-f',
    voiceId: null,
    accent: 'canadian',
    gender: 'female',
    source: 'account',
    publicOwnerId: null,
    vendorName: 'Rebecca - Calm, Warm and Engaging',
    why: 'Canadian female. Calm rather than bright, for the same reason as the British female: Part 2 carries the dense factual detail and clarity is what the item depends on.',
  },
  {
    id: 'ie-m',
    voiceId: null,
    accent: 'irish',
    gender: 'male',
    source: 'account',
    publicOwnerId: null,
    vendorName: 'Darren - Calm and Deep',
    why: 'IELTS says "different accents, INCLUDING" the four it names — a floor, not a list. Irish is one a candidate can meet, and meeting it for the first time on exam day costs them the recording. Cast sparingly, as an occasional Part 1 or Part 3 speaker.',
  },
  {
    id: 'sc-f',
    voiceId: null,
    accent: 'scottish',
    gender: 'female',
    source: 'account',
    publicOwnerId: null,
    vendorName: 'Claire - Warm and Measured',
    why: 'Scottish female, for the same reason as the Irish male. "Measured" matters more here than anywhere else in the cast: an unfamiliar variety read quickly is a listening test of the wrong thing.',
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
export const RENDER_VERIFIED = [
  'narrator', 'br-m', 'br-f', 'au-m', 'na-m', 'na-f',
] as const;
