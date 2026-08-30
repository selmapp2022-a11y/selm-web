import { RotateCcw } from 'lucide-react';
import type { PracticeTask } from '../lib/practiceTasks';

/**
 * How many situations this task still has for you, said on the screen.
 *
 * ── What it replaced, and why ───────────────────────────────────────────
 *
 * `SeenBefore` said *"you have written this once already, and this is the only
 * Tâche 1 prompt we hold."* It was honest and it was a confession. The founder
 * had already said, twice, that the practice was the same in all four skills;
 * a sentence admitting it is not a fix, and the second time he said it he was
 * right to be short about it.
 *
 * A task now holds several situations and serves the least-recently-used
 * unseen one, so what the screen owes the candidate is a count rather than an
 * apology: **how much of this task is still new.**
 *
 * Three states, and the third is the one that keeps the old file's honesty:
 *
 *  - more than one left   say how many, quietly
 *  - the last one         say so, so finishing it is a decision
 *  - none left            say that this is one they have already done, and
 *                         that doing it again practises the answer rather than
 *                         the task. That is the sentence `SeenBefore` existed
 *                         for, and it survives here for the case it was
 *                         written for: a task the bank has not caught up with.
 */
export function PromptCount({ task, verb }: { task: PracticeTask; verb: 'written' | 'recorded' }) {
  const { promptsTotal: total, promptsUnseen: unseen, promptsRecycled: again } = task;

  if (!again && unseen > 1) {
    return (
      <p className="text-xs text-ink-secondary">
        {unseen} of {total} {task.title} situations you have not {verb} yet.
      </p>
    );
  }

  if (!again) {
    return (
      <p className="text-xs text-ink-secondary">
        The last of {total} {task.title} {total === 1 ? 'situation' : 'situations'} you have not{' '}
        {verb} yet.
      </p>
    );
  }

  return (
    <div className="card border-dashed p-4">
      <div className="flex items-start gap-3">
        <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-ink-secondary" />
        <p className="text-sm leading-relaxed text-ink-secondary">
          You have {verb} {total === 1 ? 'this one' : `all ${total}`} already, and this is the one
          you did longest ago. The real exam sets a new situation each sitting; we hold{' '}
          {total === 1 ? 'one' : total} for {task.title} so far. Doing it again practises the
          answer rather than the task — worth it for the feedback on a rewrite, and we would
          rather say which it is.
        </p>
      </div>
    </div>
  );
}
