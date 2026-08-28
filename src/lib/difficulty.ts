/**
 * How hard the material is, per exam and per task — and why it is never
 * shown to the candidate.
 *
 * Part 3 (replacement) §3, and the whole of it:
 *
 * > *"If a passage's vocabulary is beyond a candidate, the exercise does not
 * > happen — that is not a ranking problem, it is a usability problem. So the
 * > material's difficulty tracks their performance, invisibly. No number
 * > shown. No badge. Never told they moved down. Per tâche, not per skill —
 * > a candidate can be strong on tâche 1 and weak on tâche 3, and one number
 * > per skill hides exactly the gap the product exists to find."*
 *
 * What this replaces is a single `current_level` per user, set by an adaptive
 * CEFR placement test at `/onboarding/assessment` and read by three of the
 * four practice pages. That number was wrong three ways at once: it was one
 * number for four skills and six tâches, it came from a test rather than from
 * performance, and the test itself was the placement gate Part 3 removes.
 *
 * Nothing here is rendered anywhere. There is no exported label, no colour,
 * no badge — the same discipline as `attestation.ts`: a rule that a number
 * must not be shown is a hope; a module that returns no string to show it
 * with is closer to a guarantee.
 */
import { loadPlan } from '../exam/model/plan';
import { loadAttestations } from '../exam/model/attestationStore';

/** CEFR is what the generation endpoints speak. It is not shown either. */
export type Cefr = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
const LADDER: Cefr[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const KEY = 'selm_difficulty_v1';

/** `{ "tcf-canada:tcf-ee-t3": 3 }` — an index into LADDER. */
type Store = Record<string, number>;

function read(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    const v = raw ? JSON.parse(raw) : null;
    return v && typeof v === 'object' ? (v as Store) : {};
  } catch {
    return {};
  }
}

function write(s: Store): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* a disabled store must not break the exercise */
  }
}

const slot = (examId: string, taskId: string) => `${examId}:${taskId}`;

/**
 * The seed, when a candidate has an attestation.
 *
 * The attestation reports per SKILL and difficulty is per TASK, so this is a
 * 2→6 expansion for TCF and it is deliberately the crudest possible one:
 * every task of a skill starts at that skill's own level, and §3's silent
 * adaptation separates them within the first few attempts. Inventing a
 * per-task profile from four numbers would be inventing.
 */
function seedFor(examId: string, skill: string): number | null {
  const a = loadAttestations().filter((x) => x.examId === examId).sort((x, y) => (x.sat < y.sat ? 1 : -1))[0];
  if (!a) return null;
  const cefr = (a as any).benchmarkCefr?.[skill] as Cefr | undefined;
  if (cefr) {
    const i = LADDER.indexOf(cefr);
    if (i >= 0) return i;
  }
  // No CEFR recorded on the attestation: fall back to the benchmark level,
  // which is NCLC/CLB 4–10 and maps onto the ladder closely enough to start
  // from. It is a starting point, not a claim.
  const lvl = (a.benchmark as unknown as Record<string, number>)[skill];
  if (typeof lvl !== 'number' || !Number.isFinite(lvl)) return null;
  if (lvl >= 9) return 4;      // C1
  if (lvl >= 7) return 3;      // B2
  if (lvl >= 5) return 2;      // B1
  if (lvl >= 4) return 1;      // A2
  return 0;
}

/**
 * The current difficulty for one task. Defaults to B1 — the middle — because
 * a candidate with nothing recorded is unknown, not weak, and starting them
 * at A1 wastes the first sessions of the only funnel we have.
 */
export function difficultyFor(taskId: string, skill: string): Cefr {
  const examId = loadPlan()?.examId ?? '';
  const s = read();
  const k = slot(examId, taskId);
  if (typeof s[k] === 'number') return LADDER[Math.max(0, Math.min(5, s[k]))];
  const seeded = seedFor(examId, skill);
  return LADDER[seeded ?? 2];
}

/**
 * Move it after a scored attempt.
 *
 * Up on consistent performance, **down silently**. The asymmetry is
 * deliberate and it is §3's: a candidate is never told they moved down,
 * so a single bad attempt must not move them either — one weak score is a
 * bad day, two in a row is the material being wrong for them.
 */
export function recordAttempt(taskId: string, skill: string, fractionCorrect: number): void {
  const examId = loadPlan()?.examId ?? '';
  const s = read();
  const k = slot(examId, taskId);
  const cur = typeof s[k] === 'number' ? s[k] : (seedFor(examId, skill) ?? 2);
  const runKey = k + ':run';
  const run = typeof s[runKey] === 'number' ? s[runKey] : 0;

  let next = cur;
  let nextRun = run;
  if (fractionCorrect >= 0.85) {
    nextRun = run > 0 ? run + 1 : 1;
    if (nextRun >= 2) { next = Math.min(5, cur + 1); nextRun = 0; }
  } else if (fractionCorrect < 0.5) {
    nextRun = run < 0 ? run - 1 : -1;
    if (nextRun <= -2) { next = Math.max(0, cur - 1); nextRun = 0; }
  } else {
    nextRun = 0;
  }
  s[k] = next;
  s[runKey] = nextRun;
  write(s);
}

/** For the four practice pages, which are per skill rather than per task. */
export function difficultyForSkill(skill: string): Cefr {
  return difficultyFor(`skill:${skill}`, skill);
}
