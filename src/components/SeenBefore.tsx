import { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { ATTEMPTS_EVENT, getAttempts } from '../lib/attempts';

/**
 * "You have done this one before, and it is the only one we have."
 *
 * Writing and Speaking do not have the selection defect that Listening and
 * Reading had — the tâches are listed by name, all of them, and the candidate
 * picks. There is nothing to select among, because the exam sets three tâches
 * and we hold three.
 *
 * What we hold is **one prompt each**. The exam does not: it sets a new
 * situation every sitting. So the second time a candidate opens Tâche 1 they
 * meet the letter they have already written, and until today nothing on the
 * screen said so — the page looked identical to the first visit.
 *
 * That is the same failure as the listening one seen from the other side. The
 * ruling of 2026-08-29 covers both: *"a skill with one item should not present
 * it as though there were more."* The listening fix was to serve a different
 * recording. Here there is no different prompt to serve, so the honest act is
 * to say the number out loud and let the candidate decide.
 *
 * It appears only after the first attempt, deliberately. Announcing "we have
 * one prompt" to someone who has not yet written it is noise about our bank
 * when they came to do the task; announcing it to someone about to write the
 * same letter twice is the fact they need.
 *
 * This notice is what Task 4 removes. When the bank holds four prompts for a
 * tâche, the honest thing is to serve an unseen one — and this component
 * should disappear on the day that becomes possible, not be edited to
 * accommodate it.
 */
export function SeenBefore({ taskId, taskTitle, verb }: { taskId: string; taskTitle: string; verb: 'written' | 'recorded' }) {
  const [times, setTimes] = useState(0);

  useEffect(() => {
    const read = () => setTimes(getAttempts().filter((a) => a.itemId === taskId).length);
    read();
    window.addEventListener(ATTEMPTS_EVENT, read);
    return () => window.removeEventListener(ATTEMPTS_EVENT, read);
  }, [taskId]);

  if (times < 1) return null;

  return (
    <div className="card border-dashed p-4">
      <div className="flex items-start gap-3">
        <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-ink-secondary" />
        <p className="text-sm leading-relaxed text-ink-secondary">
          You have {verb} this {times === 1 ? 'once' : `${times} times`} already, and this is the
          only {taskTitle} prompt we hold. The real exam sets a new situation each sitting; we
          cannot yet, so doing it again practises the answer rather than the task. It is still
          worth doing if you want the feedback on a rewrite — we would rather say which one it is.
        </p>
      </div>
    </div>
  );
}
