/**
 * Which recording practice serves next — and the memory that makes it work.
 *
 * ## The defect this file exists to fix
 *
 * Found by the founder on 2026-08-29: *"the practice text is the same in
 * every one of the four skills."* Measured on the deployed build the same
 * evening, ten visits per skill:
 *
 *   TCF Canada · Listening   10 visits → `tcf-co-01.mp3`, ten times out of ten
 *   TCF Canada · Reading     10 visits → passage 1, ten times out of ten
 *   IELTS GT   · Listening    5 visits → `gt-l-p1.mp3`, five times out of five
 *   IELTS GT   · Reading      4 visits → passage 1, four times out of four
 *
 * And the sharpest one: answer recording 1, press *Next recording*, arrive at
 * recording 2, leave the page, come back — **recording 1**. The attempt had
 * been recorded. The backend had it. The selector never asked.
 *
 * The cause was three lines in `ComprehensionPractice`: sort the bank easiest
 * first, `useState(0)`, read `ordered[cursor]`. A component's state does not
 * survive a navigation, so the cursor was 0 on every arrival. A bank of
 * thirty-nine that serves one recording is a bank of one — which is precisely
 * the sentence `pool.ts` was written to prevent, and `pool.ts` was never
 * called from here.
 *
 * ## The rule, and where it lives
 *
 * The rule is not restated here. THE PLAN §4.3 — *"least-recently-served
 * among unseen. Never random."* — is implemented once, in `pool.ts`, and a
 * second implementation would be a second rule pretending to be the same one.
 * What this file does is give that function the one thing it lacked in
 * practice: a memory that outlives the page.
 *
 * The memory is the attempt log, which is already durable, already synced to
 * `/users/me/client-state`, already cleared on sign-out and already claimed
 * from an owner-less record by `localRecord.ts`. It gains no new privileges
 * here; it gains one field, `itemId`, and `practiceState` reads it.
 *
 * Two consequences worth stating because they are choices:
 *
 *  - **Unseen recordings are served easiest-first.** `serve` breaks a tie
 *    among never-served items by taking the first of the list it is handed,
 *    so handing it the ladder keeps the teaching order that was right about
 *    the old code. The ladder was never the bug; starting at the bottom of it
 *    every single time was.
 *
 *  - **Exhaustion is reported, not absorbed.** When every recording has been
 *    practised, `serve` recycles and says so. The caller must show that
 *    rather than quietly dealing the same card again: a candidate who has
 *    done all four IELTS parts is not practising listening when they do them
 *    a fifth time, they are practising memory, and only we can see the
 *    difference.
 */
import type { Attempt } from '../../lib/attempts';
import type { ComprehensionSection, Recording } from '../model/types';
import { newServeState, serve, type ServeResult, type ServeState } from './pool';

const BANDS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

/**
 * The bank in teaching order: easiest first, and within a band the bank's own
 * order, which is the order it was authored and reviewed in.
 */
export function ladder(recordings: readonly Recording[]): Recording[] {
  const at = new Map(recordings.map((r, n) => [r.id, n]));
  return [...recordings].sort(
    (a, b) => BANDS.indexOf(a.level) - BANDS.indexOf(b.level) || at.get(a.id)! - at.get(b.id)!,
  );
}

/**
 * A serve state rebuilt from what this candidate has actually done.
 *
 * `lastServed` carries epoch milliseconds rather than a draw counter. `serve`
 * only ever compares those numbers against each other, and a timestamp is the
 * one ordering that survives a page reload — which is the entire point.
 *
 * Attempts that name a recording this section does not hold are ignored:
 * changing exam must not make the new bank look half-finished.
 */
export function practiceState(
  recordings: readonly Recording[],
  attempts: readonly Attempt[],
): ServeState {
  const known = new Set(recordings.map((r) => r.id));
  const st = newServeState();
  for (const a of attempts) {
    if (!a.itemId || !known.has(a.itemId)) continue;
    st.seen.add(a.itemId);
    const prev = st.lastServed.get(a.itemId) ?? -1;
    if (a.ts > prev) st.lastServed.set(a.itemId, a.ts);
  }
  st.draw = Date.now();
  return st;
}

export type PracticeServe = ServeResult<Recording> & {
  /** How many of this bank the candidate has never practised, before this serve. */
  unseen: number;
  /** The whole bank. */
  total: number;
};

/**
 * Serve one recording for practice, obeying §4.3 with a durable memory.
 *
 * Mutates `st`, exactly as `serve` does, so a sitting that presses "next"
 * five times gets five different recordings without going back to storage.
 */
export function servePractice(recordings: readonly Recording[], st: ServeState): PracticeServe {
  const order = ladder(recordings);
  const unseen = order.filter((r) => !st.seen.has(r.id)).length;
  const result = serve(order, st);
  return { ...result, unseen, total: order.length };
}

/**
 * The recordings a practice session can actually reach.
 *
 * `SectionPage` filters a comprehension section down to the recordings that
 * carry questions and, for audio, that have been rendered. Practice must use
 * the same filter or the count it prints is not the count it serves.
 */
export function practicable(section: ComprehensionSection): Recording[] {
  const withItems = new Set(section.items.map((i) => i.recordingId));
  const usable = section.delivery.audioPlaysOnce
    ? section.recordings.filter((r) => !!r.audioPath)
    : section.recordings;
  return usable.filter((r) => withItems.has(r.id));
}
