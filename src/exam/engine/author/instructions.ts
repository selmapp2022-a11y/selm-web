/**
 * THE AUTHORING INSTRUCTIONS — the prompt, and the reason it is a file.
 *
 * ── Why this exists ─────────────────────────────────────────────────────
 * Four batches of IELTS reading were written on 30 August. The gate refused
 * 52% of them on first submission, and the refusal rate FELL across the four:
 * 67%, 58%, 40%, 50%. The fall was not the material getting better on its
 * own. It was the author learning the rules by being refused, batch after
 * batch, and applying them deliberately in the next one.
 *
 * The founder's instruction, immediately after reading that:
 *
 *   *"Write the rules that were discovered across the four batches explicitly
 *   into the prompt — 'the key must not be the longest option', 'six words
 *   must not be repeated verbatim from the passage'. Because, as you said, a
 *   model does not learn between batches."*
 *
 * That is exactly right, and it is the whole point of this file. A person
 * writing batch four remembers batch one. **A model writing batch four
 * remembers nothing**, so the 67% of batch one is what it will keep producing
 * unless the rules are in front of it. Everything a batch cost in rework is
 * recoverable by writing it down once.
 *
 * ── What must stay true ─────────────────────────────────────────────────
 * Every rule below names the gate rule id it prevents. `instructions.check.ts`
 * trips each rule with a deliberately bad candidate, reads the id the gate
 * actually emits, and fails if that id is not documented here. So the prompt
 * cannot silently fall behind the gate — which is the failure mode of every
 * written-down rule, and the one that would put the reject rate back to 67%
 * without anybody noticing why.
 */

/** Bumped whenever these instructions change, and recorded on every item. */
export const PROMPT_VERSION = 'reading-depth-2026-08-31';

/**
 * The rules, keyed by the gate rule id each one prevents.
 *
 * Keys are ids as the gate emits them, without the per-item prefix and
 * without the parenthesised measurement.
 */
export const RULES: Record<string, string> = {
  // ── The passage ───────────────────────────────────────────────────────
  'passage.too-short':
    'Write to the word range for the band, which is given with the coordinate. Below the floor the passage cannot carry its questions; the floors come from the published paper, not from what is convenient.',
  'passage.too-long':
    'Stay under the ceiling for the band. A long passage at a low band is not a harder passage, it is a different exam.',
  'passage.wrong-band':
    'Write at the band you were asked for. A passage is at its band when its sentences, its vocabulary and its clause structure sit inside the envelope the neighbouring bands define — not when its subject sounds advanced.',
  'passage.wrong-family':
    'Write in the family you were asked for. A notice is not a short informative text: what a notice tests is doing exactly what it says.',
  'passage.duplicate-of':
    'Do not rewrite a passage that is already in the bank. Change the situation, not the wording.',
  'passage.news':
    'No wars, elections, disasters or named current events. A bank dated by an event has to be rewritten when the event ages. Ordinary current life — remote work, deliveries, apps, adapting to weather — is what "current" means.',
  'passage.dated':
    'Nothing that needs a particular year to make sense.',
  'passage.empty':
    'A passage is required.',

  // ── The questions ─────────────────────────────────────────────────────
  'items.too-few':
    'Ask at least the minimum number of questions for the band. A passage carrying one question is a passage the bank cannot afford.',
  'items.too-many':
    'Do not exceed the maximum for the band. A passage cannot carry fourteen questions that are not padding.',
  'items.duplicate-id':
    'Every item id is unique.',
  'item.no-stem':
    'Every question has a stem.',
  'item.stem-not-a-question':
    'A multiple-choice stem ends in a question mark or a colon.',
  'item.no-rationale':
    'Every question carries a rationale of AT LEAST FORTY CHARACTERS that explains why the key is right — ideally why the nearest distractor is wrong as well. "The class returns at half past three" is a restatement and will be refused; a rationale is a reason, not a repetition.',
  'item.wrong-passage':
    'An item names the passage it belongs to.',
  'item.band-far-from-passage':
    'An item sits at its passage\'s band.',
  'item.kind-not-in-section':
    'Use only the item kinds the section declares.',

  // ── The options: the two rules that cost the most rework ──────────────
  'options.key-is-conspicuously-longest':
    'THE KEY MUST NOT BE THE CONSPICUOUSLY LONGEST OPTION. The gate refuses a key that is BOTH more than 1.4x the longest distractor AND at least three words longer than it. Keep all four options within about two words of one another. This was the single most common refusal — thirteen items across four batches — and it is worst at C1 and C2, where a long passage invites a long correct answer and every C2 passage was refused for it on first submission. A candidate who has never read the passage can pick the fullest sentence in the list and be right more often than chance.',
  'options.key-lifted-from-passage':
    'THE KEY MUST NOT REPEAT SIX OR MORE CONSECUTIVE WORDS OF THE PASSAGE. Paraphrase it. A key lifted verbatim can be found by scanning for the matching string, which tests pattern matching and not reading — and it looks like a perfectly good question from the outside. Eight items across four batches.',
  'options.near-duplicate':
    'No two options may say nearly the same thing, and an option with its own negation ("it will rise" / "it will not rise") counts: a candidate reads the pair as one choice, which quietly turns a four-option question into a three-option one.',
  'options.identical':
    'No two options are the same string.',
  'options.count':
    'Three or four options.',
  'options.answer-out-of-range':
    'The key is one of the options. Do not place the key yourself: the runner rotates it so that keys are spread evenly across the positions. Batch one of Task 4 shipped 27 of 28 keys at option A, where a candidate always guessing A scored 96%.',

  // ── Completion and matching ───────────────────────────────────────────
  'completion.no-gap':
    'A completion item contains a gap marked ___.',
  'completion.no-answer':
    'A completion item has at least one accepted answer.',
  'completion.answer-breaks-its-own-cap':
    'An accepted answer respects the item\'s own word limit.',
  'completion.answer-not-in-passage':
    'In a READING section the answer must appear in the passage. In a listening section it need not appear as a string — a telephone number is spoken as words and answered in digits — and the gate does not apply this rule there.',
  'matching.no-such-group':
    'A matching item names a group the section declares.',
  'matching.key-not-in-bank':
    'The key is one of the group\'s options.',

  // ── Provenance ────────────────────────────────────────────────────────
  'provenance.no-author':
    'Name the author. Never blank, never inferred later.',
  'provenance.no-prompt-version':
    'Record the version of these instructions the item was written under, so drift is findable.',
  'provenance.no-source':
    'Name the published specification the item was built from.',
  'provenance.source-is-a-real-paper':
    'Build from the published FORMAT, never from a real exam paper. A source that names a past paper is refused.',
};

/**
 * The statistical veto is not a gate rule and has no rule id, so it is stated
 * separately. It refuses in BOTH directions and that is not a formality: in
 * four batches it bracketed two different A2 passages from opposite sides —
 * too heavy, then, once corrected, too light — and only the third version of
 * each sat inside the envelope.
 */
export const VETO_NOTE =
  'The passage is also measured against the bands above and below it on mean sentence length, long-word rate, lexical variety and clause depth, and must sit inside the envelope on at least three of the four. It is refused for being too SIMPLE for its band as readily as for being too complex. An A2 text is plainer than B1 in its sentence structure and is not thinner in its vocabulary: a flat list of short sentences fails as surely as a chain of subordinate clauses.';

/** The whole prompt, as a model would be handed it. */
export function authoringPrompt(coordinate: {
  examId: string; skill: string; family: string; familyDescribes: string; level: string;
  words: { min: number; max: number }; questions: { min: number; max: number };
}): string {
  const rules = Object.entries(RULES).map(([id, text]) => `- [${id}] ${text}`).join('\n');
  return [
    `Write passages for ${coordinate.examId}, ${coordinate.skill}.`,
    ``,
    `COORDINATE: family "${coordinate.family}" at ${coordinate.level}.`,
    `The family is: ${coordinate.familyDescribes}`,
    `Length: ${coordinate.words.min} to ${coordinate.words.max} words.`,
    `Questions: ${coordinate.questions.min} to ${coordinate.questions.max} per passage.`,
    ``,
    `EVERY ONE OF THE FOLLOWING IS ENFORCED AUTOMATICALLY AND A FAILURE DISCARDS`,
    `THE ITEM. They are not style preferences; each names the check that refuses it.`,
    ``,
    rules,
    ``,
    `BAND FIT: ${VETO_NOTE}`,
    ``,
    `Write the passage first and the questions second. Questions must be`,
    `answerable from the passage alone, and a candidate who has not read it`,
    `must have no way to prefer the key — not by its length, not by finding`,
    `its words in the text, and not by eliminating an option that repeats`,
    `another.`,
  ].join('\n');
}
