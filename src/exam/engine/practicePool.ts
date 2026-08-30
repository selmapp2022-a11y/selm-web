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
import { audioFor } from '../model/rendition';
import type { AccentTrack, ComprehensionSection, Recording } from '../model/types';
import { PRIMARY_TRACK } from '../model/types';
import { newServeState, serve, type ServeResult, type ServeState } from './pool';

const BANDS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

/**
 * The bank in the order this candidate should meet it.
 *
 * `here` is their CEFR index — measured if they have a score, otherwise the
 * band their destination requires (`candidateLevel` in the planner owns that
 * decision; this file does not repeat it). Nearest band first, and within a
 * band the bank's own order, which is the order it was authored and reviewed
 * in.
 *
 * ── Why this is not the ladder any more ─────────────────────────────────
 * It was, until 2026-08-29, and the comment defending it read *"there is no
 * reason to open on a C2 recording and no reason to randomise; a ladder is
 * what teaches."* Half of that is still true — randomising is still wrong.
 * The other half was answering a question nobody asked.
 *
 * The founder's: *"every exam has a level, and the questions and the practice
 * have to differ."* A candidate who needs CLB 9 and a candidate who needs
 * CLB 4 were being served the identical A1 notice, from the identical bank,
 * because the ladder starts where the bank starts rather than where the
 * candidate is. The planner had ordered its coordinates by distance from the
 * candidate since it was written; practice never asked.
 *
 * A tie — two bands equally far, one above and one below — resolves DOWNWARD.
 * Consolidating the band beneath the target is useful; the band above it is
 * not yet theirs.
 *
 * `here === null` keeps the old ladder, and that is not a leftover: the
 * inventory and the checks count a bank belonging to nobody, and giving them
 * a candidate's ordering would make a measurement depend on whose screen it
 * was taken from.
 */
export function orderFor(recordings: readonly Recording[], here: number | null): Recording[] {
  const at = new Map(recordings.map((r, n) => [r.id, n]));
  const key = (r: Recording) => {
    const i = BANDS.indexOf(r.level);
    if (here === null) return [i, 0] as const;
    return [Math.abs(i - here), i > here ? 1 : 0] as const;
  };
  return [...recordings].sort((a, b) => {
    const ka = key(a), kb = key(b);
    return ka[0] - kb[0] || ka[1] - kb[1] || at.get(a.id)! - at.get(b.id)!;
  });
}

/** The bank easiest-first, for anything counting a bank rather than serving one. */
export function ladder(recordings: readonly Recording[]): Recording[] {
  return orderFor(recordings, null);
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
  /** The band this serve was ordered around, or null when nobody's. */
  here: number | null;
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
export function servePractice(
  recordings: readonly Recording[],
  st: ServeState,
  here: number | null = null,
): PracticeServe {
  const order = orderFor(recordings, here);
  const unseen = order.filter((r) => !st.seen.has(r.id)).length;

  // ── THE SECOND TIME ROUND IS ALSO AT THE CANDIDATE'S LEVEL ────────────
  //
  // `serve` recycles by clearing `seen` and taking the least-recently-served
  // of EVERYTHING. That is right for a pool with no ordering, and wrong here:
  // the item served longest ago is the one furthest from the candidate's band
  // — it was served first, back when the bank was fresh and the far ends were
  // still being drawn. So a candidate at B2 who exhausted the bank was handed
  // A1 notices on their second pass, having been served correctly on the
  // first. The ordering was applied to the draw and not to the recycle, which
  // is the same class of defect as the épreuve serving without state: a rule
  // that holds in one path and not in the other.
  //
  // On recycle the draw is confined to the NEAREST BAND — the first tier of
  // `orderFor` — and only then falls to least-recently-served within it.
  // With no known level there is no nearest band, so the ladder recycles
  // whole, which is what it already did.
  if (unseen === 0 && order.length > 0 && here !== null) {
    st.seen.clear();
    const tier = nearestTier(order, here);
    const { item } = serve(tier, st);
    return { item, recycled: true, unseen: 0, total: order.length, here };
  }

  const result = serve(order, st);
  return { ...result, unseen, total: order.length, here };
}

/** The recordings at the smallest distance from `here` — one band, usually. */
function nearestTier(order: readonly Recording[], here: number): Recording[] {
  const distance = (r: Recording) => Math.abs(BANDS.indexOf(r.level) - here);
  let best = Infinity;
  for (const r of order) best = Math.min(best, distance(r));
  return order.filter((r) => distance(r) === best);
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
  return section.recordings.filter((r) => deliverable(section, r) && withItems.has(r.id));
}

/**
 * CAN THIS RECORDING BE PUT IN FRONT OF A CANDIDATE TODAY?
 *
 * One predicate, used by practice, by the mock exam and by the inventory,
 * because three answers to this question is how a number comes to say
 * something the product cannot do.
 *
 * A play-once section is an AUDIO section. A recording there with no rendered
 * audio is a written script: real work, and not something anybody can sit.
 * Showing the script instead would turn a listening test into a reading test,
 * which is the one behaviour worse than showing nothing.
 *
 * ── Why this exists as of 31 August ────────────────────────────────────
 * The listening banks are about to be written while the audio waits on the
 * variety gate, so for the first time the product will hold comprehension
 * material it cannot serve. The founder's condition when he approved that:
 *
 *   *"An item with no audioPath must not be served to a user. Make sure
 *   `servable` does not count them — otherwise the number goes up and there
 *   is nothing behind it."*
 *
 * He is right, and the risk is wider than the number. Without this predicate
 * the planner would schedule coordinates that cannot play, and `serveEpreuve`
 * would put an unrenderable recording on a paper, which `SectionPage` answers
 * by refusing the WHOLE section — so twenty scripts with no audio would have
 * taken the four that do have it off the air.
 */
/**
 * ── And why it takes a TRACK as of 31 August ───────────────────────────
 * `!!r.audioPath` was the whole test while every candidate heard the same
 * file. The accent ruling made the audio depend on where the candidate is
 * going, and `audioPath` is the PRIMARY track's field — always present once
 * anything has been rendered. Left as it was, this predicate would have
 * answered "yes, deliverable" for an Australian candidate about to be handed
 * a Canadian recording, or nothing at all.
 *
 * The track defaults to the primary one, so every existing caller keeps the
 * behaviour it had, and a caller that knows the candidate passes it.
 */
export function deliverable(section: ComprehensionSection, r: Recording, track: AccentTrack = PRIMARY_TRACK): boolean {
  return section.delivery.audioPlaysOnce ? !!audioFor(r, track) : true;
}
