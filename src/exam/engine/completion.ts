/**
 * Marking a typed answer.
 *
 * ── The one rule ──────────────────────────────────────────────────────────
 * **The accepted forms are a whitelist, and nothing outside it is ever
 * consulted.** No edit distance, no stemming, no phonetic comparison, no
 * "close enough". IELTS marks spelling; `recieve` is wrong.
 *
 * A forgiving matcher scores a candidate HIGHER here than the real exam will,
 * and that is the one direction this product must never be wrong in — a
 * candidate who books a test on our number and fails theirs has been harmed by
 * us, in the way that costs them money and months. Being harsher than the real
 * marker costs them an afternoon of extra practice. The two errors are not
 * symmetrical and this file is written for the asymmetry.
 *
 * ── What the marker is allowed to do, exhaustively ────────────────────────
 * Everything below is a thing a REAL marker ignores and that cannot forgive a
 * misspelling:
 *
 *   1. trim, and collapse runs of whitespace to one space;
 *   2. drop punctuation at the START and END of the whole response, and a
 *      trailing full stop — a marker does not fail "Smith." for the dot;
 *   3. case-fold, unless the item sets `caseSensitive`;
 *   4. normalise curly quotes and dashes to their plain forms, because the
 *      character a phone keyboard inserts is not a spelling decision by the
 *      candidate.
 *
 * That is the complete list. Nothing here can turn a wrong word into a right
 * one: every operation is applied identically to the accepted forms, so two
 * strings match only if they are the same letters in the same order.
 *
 * ── And the word cap is enforced, not printed ─────────────────────────────
 * IELTS sets ONE, TWO or THREE WORDS AND/OR A NUMBER, and an over-long answer
 * is marked wrong even when the right words are inside it. A product that
 * shows the instruction and then ignores it is teaching the candidate a habit
 * that will cost them marks on the day.
 */
import type { CompletionAnswer } from '../model/types';

/** Why an answer was marked wrong. Diagnostic; never shown mid-section. */
export type CompletionVerdict =
  | { correct: true; matched: string }
  | { correct: false; reason: 'blank' | 'too_many_words' | 'not_accepted' };

/** Curly punctuation a phone inserts, mapped to what a keyboard would. */
const SMART: Array<[RegExp, string]> = [
  [/[‘’ʼ]/g, "'"],
  [/[“”]/g, '"'],
  [/[–—−]/g, '-'],
  [/ /g, ' '],
];

/**
 * The single normalisation, applied to the response AND to every accepted
 * form. Applying it to both is what makes it incapable of forgiving a
 * spelling: it can only remove differences that are identical on both sides.
 */
export function normalise(raw: string, caseSensitive = false): string {
  let s = raw ?? '';
  for (const [re, to] of SMART) s = s.replace(re, to);
  s = s.replace(/\s+/g, ' ').trim();
  // Punctuation only at the outer edges. Interior punctuation is part of the
  // word — `o'clock` and `st.` are spellings, and stripping them would be the
  // marker deciding what the candidate meant.
  s = s.replace(/^[.,;:!?'"()\[\]-]+/, '').replace(/[.,;:!?'"()\[\]-]+$/, '');
  s = s.replace(/\s+/g, ' ').trim();
  return caseSensitive ? s : s.toLowerCase();
}

/** Words, as the instruction counts them. A number is one word. */
export function wordCount(normalised: string): number {
  if (!normalised) return 0;
  return normalised.split(' ').filter(Boolean).length;
}

/**
 * Mark one typed response.
 *
 * Order matters and is deliberate: blank, then the cap, then the whitelist.
 * An over-long response is wrong even if it contains an accepted form, so the
 * cap has to be checked BEFORE the match rather than after it — checking after
 * would let "the car park" pass a ONE WORD item because "car park" is in the
 * list.
 */
export function markCompletion(rule: CompletionAnswer, response: string | null | undefined): CompletionVerdict {
  const cs = rule.caseSensitive === true;
  const given = normalise(response ?? '', cs);
  if (!given) return { correct: false, reason: 'blank' };
  if (wordCount(given) > rule.maxWords) return { correct: false, reason: 'too_many_words' };
  for (const form of rule.accept) {
    if (normalise(form, cs) === given) return { correct: true, matched: form };
  }
  return { correct: false, reason: 'not_accepted' };
}

export const isCompletionCorrect = (rule: CompletionAnswer, response: string | null | undefined): boolean =>
  markCompletion(rule, response).correct;
