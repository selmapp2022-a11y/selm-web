/**
 * Which situation a writing or speaking task sets today.
 *
 * ── Why this file exists, and why it did not exist a day earlier ────────
 *
 * The founder said, twice, that the practice was the same across all four
 * skills. The comprehension half was a selection defect — thirty-nine
 * recordings serving one — and was fixed. The production half was answered
 * with an explanation: *Writing and Speaking list every tâche by name, so
 * there is nothing to select among.*
 *
 * That was true and it was not the point. **The exam sets a new situation
 * every sitting; we held one per task.** A candidate who opened Tâche 1 twice
 * wrote the same letter twice, and the reason there was nothing to select
 * among was that there was nothing else there.
 *
 * ── The rule is `pool.ts`'s, again, and not restated ────────────────────
 *
 * Least-recently-served among unseen, never random — THE PLAN §4.3 — with the
 * same durable memory `practicePool.ts` gives it: the attempt log, keyed by
 * the PROMPT id rather than the task id, because a task the candidate has done
 * three times is not the same fact as a situation they have met before.
 *
 * The one difference from comprehension is that there is no band ordering
 * here. A tâche is the same tâche at every level — IELTS Task 1 is a letter
 * whether the candidate needs band 5 or band 8 — so what changes with level is
 * what a good answer looks like, not which situation is set. Ordering these by
 * distance from the candidate's band would be inventing a difference the exam
 * does not make.
 */
import type { Attempt } from '../../lib/attempts';
import type { Localised, TaskDefinition, TaskPrompt } from '../model/types';
import { newServeState, serve, type ServeState } from './pool';

/** Every situation this task can set, the declared one first. */
export function promptsOf(task: TaskDefinition): TaskPrompt[] {
  const first: TaskPrompt = { id: `${task.id}-p1`, prompt: task.prompt };
  return [first, ...(task.prompts ?? [])];
}

export type ServedPrompt = {
  id: string;
  prompt: Localised;
  /** How many situations this task holds. */
  total: number;
  /** How many the candidate has not met, before this one was served. */
  unseen: number;
  /** True when every situation has been met and the pool came round again. */
  recycled: boolean;
};

/**
 * Serve one situation for a task, from what this candidate has actually done.
 *
 * `attempts` is the durable log. Only entries naming a prompt of THIS task
 * count: a candidate who has written every Tâche 2 situation has not thereby
 * seen any of Tâche 1's.
 */
export function servePrompt(task: TaskDefinition, attempts: readonly Attempt[]): ServedPrompt {
  const list = promptsOf(task);
  const known = new Set(list.map((p) => p.id));
  const st: ServeState = newServeState();
  for (const a of attempts) {
    if (!a.itemId || !known.has(a.itemId)) continue;
    st.seen.add(a.itemId);
    const prev = st.lastServed.get(a.itemId) ?? -1;
    if (a.ts > prev) st.lastServed.set(a.itemId, a.ts);
  }
  st.draw = Date.now();
  const unseen = list.filter((p) => !st.seen.has(p.id)).length;
  const { item, recycled } = serve(list, st);
  const chosen = item ?? list[0];
  return { id: chosen.id, prompt: chosen.prompt, total: list.length, unseen, recycled };
}
