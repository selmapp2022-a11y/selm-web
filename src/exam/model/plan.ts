/**
 * The candidate's plan: where they are going, which exam, and when.
 *
 * Three fields, and the third is the one the old product did not have. A
 * day-streak rewards coming back tomorrow. A candidate with a booked date
 * four to eight weeks out is not deciding whether to come back tomorrow —
 * they are deciding whether to sit the exam at all, and the number that
 * governs that decision is how many days are left.
 *
 * Stored in `localStorage` rather than on the account because the exam
 * engine is a separate document on the same origin (`/exam.html`) and both
 * halves must read the same plan with no round trip. Moving it behind the
 * API is a later change and does not alter this shape.
 */
export type Plan = {
  /** Id of a `Goal` in `definitions`. */
  goalId: string;
  /** Id of an `ExamDefinition`. */
  examId: string;
  /**
   * The sitting date, `YYYY-MM-DD`, in the candidate's own calendar day.
   * Null is a real state: someone can be preparing before booking, and a
   * dashboard that demands a date before it will say anything is a form,
   * not a dashboard.
   */
  examDate: string | null;
};

export const PLAN_KEY = 'selm_plan_v1';

/** Fired on the window when the plan changes, so an open dashboard follows. */
export const PLAN_EVENT = 'selm:plan';

export function loadPlan(): Plan | null {
  try {
    const raw = localStorage.getItem(PLAN_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<Plan>;
    if (!v || typeof v.goalId !== 'string' || typeof v.examId !== 'string') return null;
    return { goalId: v.goalId, examId: v.examId, examDate: typeof v.examDate === 'string' ? v.examDate : null };
  } catch {
    return null;
  }
}

export function savePlan(p: Plan) {
  try {
    localStorage.setItem(PLAN_KEY, JSON.stringify(p));
  } catch {
    /* a plan that cannot be stored still governs this session */
  }
  try {
    window.dispatchEvent(new Event(PLAN_EVENT));
  } catch {
    /* no window — nothing is listening */
  }
}

/**
 * Whole days from today to the sitting, in local time.
 *
 * Both sides are floored to midnight first. Subtracting timestamps would
 * make "tomorrow at 09:00" read as 0 days for anyone asking after 09:00
 * today, and the candidate counts sleeps, not hours.
 */
export function daysUntil(isoDate: string | null, now: Date = new Date()): number | null {
  if (!isoDate) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!m) return null;
  const target = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}
