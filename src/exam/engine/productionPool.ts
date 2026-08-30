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
/**
 * A stable number for a destination, used to rotate the pool.
 *
 * ── Why a rotation, and why it is not a difference we invented ──────────
 *
 * The founder, a third time and about Speaking: *"all the practice in the
 * three English destinations is the same."* It was. Serving the
 * least-recently-used unseen situation varies what ONE candidate meets over
 * time, and leaves three candidates who have done nothing all starting at
 * situation one.
 *
 * The tempting fix is to band the situations — to call one of them harder and
 * give it to CLB 9. That would be inventing a difference the exam does not
 * make: IELTS Speaking Part 1 asks about your home whether you need band 5 or
 * band 8, and what changes with the level is what a sufficient answer looks
 * like, not which question is asked. §D's discipline applies to a product's
 * own claims as much as to its content.
 *
 * What is honest is that **the order within a pool was already arbitrary**.
 * Situation one is first because it was written first. Rotating the start by
 * the destination claims nothing about difficulty, and it means three
 * candidates on three destinations do not open the same screen — which is what
 * was actually wrong.
 *
 * The rotation is deterministic, so a candidate who returns tomorrow does not
 * find the bank reshuffled underneath them.
 *
 * ── And it is a POSITION, not a hash ────────────────────────────────────
 * The first version hashed the destination id. Two of the three English
 * destinations landed on the same offset — with four situations and three
 * destinations, a hash colliding is ordinary luck — and Canadian citizenship
 * and Australia opened on the identical question, which is the whole
 * complaint, surviving the fix meant to end it.
 *
 * The offset is now the destination's POSITION among those sharing the exam,
 * so three destinations take three different starts by construction rather
 * than by hoping.
 */
export function seedFor(destinationsSharingThisExam: readonly string[], goalId: string | null | undefined): number {
  const i = goalId ? destinationsSharingThisExam.indexOf(goalId) : -1;
  return i < 0 ? 0 : i;
}

export function servePrompt(
  task: TaskDefinition,
  attempts: readonly Attempt[],
  seed = 0,
): ServedPrompt {
  const all = promptsOf(task);
  // Rotate, so the arbitrary first is a different arbitrary first per
  // destination. Order is otherwise untouched: `serve` still takes the
  // least-recently-served among unseen.
  const off = all.length ? seed % all.length : 0;
  const list = [...all.slice(off), ...all.slice(0, off)];
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
