/**
 * Everything on this device that belongs to ONE candidate, and how to clear it.
 *
 * ── The defect this exists for ────────────────────────────────────────────
 * Reported by the founder on 29 August 2026: **a brand-new account, signing in
 * for the first time, opened Progress and saw `Level 16 · 3076 XP · 57
 * exercises`.** Not a scoring bug. `logout()` cleared the auth token and
 * nothing else, so every `selm_*` key written by the previous person on that
 * browser was still there when the next person signed in.
 *
 * XP was the visible symptom and it is now deleted, but the residue was never
 * only XP. The same keys hold **the plan, the exam history, the sitting in
 * progress, and the attestations — which carry a real person's printed exam
 * scores.** On a shared laptop, or a phone handed to a friend, the next
 * candidate to sign in was shown them.
 *
 * ── The rule ──────────────────────────────────────────────────────────────
 * A key listed here belongs to a candidate and is cleared when the candidate
 * changes. A key NOT listed belongs to the browser — theme, interface
 * language, the privacy consent this device gave — and survives, because
 * resetting someone's dark mode when their colleague signs out is not a
 * privacy improvement.
 *
 * Anything added later that holds a candidate's work goes in `CANDIDATE_KEYS`.
 */

/** Written by one candidate, meaningless and unsafe for the next. */
export const CANDIDATE_KEYS = [
  'selm_progress_v1',      // the attempt log
  'selm_achievements_v1',  // the removed scoreboard's unlocks — cleared, not read
  'selm_plan_v1',          // exam, destination, date
  'selm_exam_history_v1',  // finished sittings
  'selm_exam_sitting_v1',  // a sitting in progress
  'selm_attestations_v1',  // REAL score reports. The reason this list exists.
  'selm_difficulty_v1',    // difficulty state derived from the above
] as const;

/** Which candidate the local record currently belongs to. */
const OWNER_KEY = 'selm_record_owner';

export function clearCandidateRecord(): void {
  for (const k of CANDIDATE_KEYS) {
    try { localStorage.removeItem(k); } catch { /* a locked store is not a crash */ }
  }
  try { localStorage.removeItem(OWNER_KEY); } catch { /* */ }
}

/**
 * Bind the local record to a candidate, clearing it first if it belonged to
 * someone else.
 *
 * Called on every sign-in rather than only on sign-out, because sign-out is
 * the step that gets skipped — a closed tab, an expired session, a device
 * handed over. Clearing on the way IN is the one that always runs.
 *
 * Returns true when a different candidate's record was discarded.
 */
export function claimCandidateRecord(userId: string | number | null | undefined): boolean {
  const id = userId == null ? '' : String(userId);
  if (!id) return false;
  let previous: string | null = null;
  try { previous = localStorage.getItem(OWNER_KEY); } catch { /* */ }
  if (previous === id) return false;
  const hadOther = previous !== null && previous !== id;
  // A record with NO owner recorded predates this guard. It is adopted by the
  // candidate now signing in rather than deleted.
  //
  // That is the weaker of the two available guarantees and it is chosen
  // deliberately. Deleting it would, on the first load after this ships,
  // destroy a real candidate's plan, sittings and — worst — the score report
  // they typed in from a document they may not still have. Adopting it can
  // mis-attribute one browser's history exactly once, to the next person who
  // signs in there. From that moment the owner is recorded, and every later
  // change of candidate is caught by the branch above.
  if (hadOther) clearCandidateRecord();
  try { localStorage.setItem(OWNER_KEY, id); } catch { /* */ }
  return hadOther;
}
