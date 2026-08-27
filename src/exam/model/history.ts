/**
 * Where a finished sitting is kept, and the only place it is kept.
 *
 * Split out of `exam/state.ts` on 2026-08-27 so the application's dashboard
 * can read the candidate's sittings without importing the exam store — and
 * therefore without pulling the 137 KB of TCF items that the store's
 * `definitions` import drags with it. The store still owns the writing; this
 * file owns the shape and the key, once.
 */

/**
 * A finished sitting, kept so the line can be seen to move.
 *
 * Deliberately small: per-skill counts and the band held, no answers, no
 * transcripts, no free text. A history record is the easiest place in a
 * product to accumulate more than it needs.
 */
export type SittingRecord = {
  examId: string;
  /** ISO timestamp the sitting finished. */
  finishedAt: string;
  /** By section id. `null` for a skill with no result — never a zero. */
  skills: Record<string, { correct: number; total: number; held: string | null } | null>;
};

export const HISTORY_KEY = 'selm_exam_history_v1';

export const loadHistory = (): SittingRecord[] => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const v = raw ? JSON.parse(raw) : [];
    return Array.isArray(v) ? (v as SittingRecord[]) : [];
  } catch {
    return [];
  }
};

export const saveHistory = (h: SittingRecord[]) => {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
  } catch {
    /* a history that cannot be saved is a lost history, not a broken app */
  }
};
