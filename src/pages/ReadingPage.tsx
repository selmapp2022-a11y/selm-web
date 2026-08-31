import { useEffect, useState } from 'react';
import { BackToPractice } from '../components/BackToPractice';
import { ComprehensionPractice } from '../components/ComprehensionPractice';
import { examNameForPractice } from '../lib/practiceTasks';

/**
 * Reading — the exam's own reading section, and nothing else.
 *
 * Three removals, each for the same reason, recorded because the reason took
 * three passes to state properly.
 *
 * 2026-08-27: "Article of the day" and the speed reader went. No instrument
 * tests words-per-minute, and none hands the candidate a news article of their
 * choosing.
 *
 * 2026-08-29 (morning): the page stopped BEING the paste tool and led with the
 * exam's own section instead, keeping "Paste any text" as a labelled extra.
 *
 * 2026-08-29 (evening): the extra went too. The founder found the same defect
 * on Listening — an "Extra practice:" row sitting directly above
 * `ComprehensionPractice`'s message that *"practising something the exam does
 * not set would not move your score, and telling you otherwise would be worse
 * than an empty page."* The buttons were exactly what the message refused.
 * Reading had one button of the same kind, so it goes for the same reason.
 *
 *   **Nothing may offer the SAME SKILL in a form the exam does not set.**
 *
 * "Paste any text" is not a small case of that — it is the purest one. The
 * candidate supplies the passage, so the material is guaranteed not to be
 * what the exam sets, and the questions generated from it are guaranteed not
 * to be the exam's question types. An honest label does not help: a candidate
 * who could tell exam-shaped reading from ordinary reading would not need us.
 *
 * `PasteMode`, `ReaderView`, `renderWithClickableVocab` and the `enhanceText`
 * call went with it. Speaking and Writing keep their extras — those are
 * component tools (pronunciation, grammar) that train a part of a skill,
 * cannot be mistaken for the exam's own task, and render only when the exam's
 * tasks are present.
 */
export default function ReadingPage() {
  const [examName, setExamName] = useState<string | null>(null);
  useEffect(() => { examNameForPractice().then(setExamName); }, []);

  return (
    <div className="space-y-6">
      <BackToPractice />
      <div>
        <h1 className="font-display text-3xl font-bold text-navy dark:text-white">Reading</h1>
        <p className="mt-1 text-ink-secondary">
          {examName ? `${examName} — read and answer, at your level.` : 'Read and answer, at your level.'}
        </p>
      </div>

      <ComprehensionPractice skill="reading" />
    </div>
  );
}
