import { useEffect, useState } from 'react';
import { ComprehensionPractice } from '../components/ComprehensionPractice';
import { examNameForPractice } from '../lib/practiceTasks';

/**
 * Listening — the exam's own listening section, and nothing else.
 *
 * This page has been emptied twice, and the second time is the one worth
 * writing down.
 *
 * On 2026-08-29 (morning) the page's two tabs — "Adaptive Practice" (topic
 * cards: Technology, Science, Sports) and "Dictation" — were demoted to an
 * "Extra practice:" row above the exam's own section, on the reasoning that a
 * demoted, honestly-labelled extra costs nothing.
 *
 * It cost something. Directly beneath that row, `ComprehensionPractice`
 * renders this when the exam has no listening section built:
 *
 *   *"Nothing is shown here rather than substituting general listening
 *   material, because practising something the exam does not set would not
 *   move your score, and telling you otherwise would be worse than an empty
 *   page."*
 *
 * And directly above it sat two buttons offering general listening material.
 * The founder found it: **the buttons are exactly what the message refuses.**
 * A page that argues against itself teaches the candidate that neither half is
 * to be believed, and the half that was right is the one they stop trusting.
 *
 * So the rule, applied here and to Reading:
 *
 *   **Nothing may offer the SAME SKILL in a form the exam does not set.**
 *
 * A candidate cannot tell a substitute from the real thing — that is the whole
 * reason they came to us — so an honest label does not protect them. It only
 * records that we knew.
 *
 * `DictationMode`, `PracticeWithPicker` and `PracticeMode` were deleted with
 * this page, along with the `generateListening` calls and `TopicPicker` use
 * that only they reached. Speaking and Writing keep their extras, and that is
 * not an inconsistency: those are component TOOLS (pronunciation drilling,
 * grammar correction) which train a part of a skill and cannot be mistaken for
 * the exam's own task, and they render only when the exam's tasks are present.
 *
 * When the section is missing, this page is one honest panel. It stays that
 * way until the listening bank is rendered.
 */
export default function ListeningPage() {
  const [examName, setExamName] = useState<string | null>(null);
  useEffect(() => { examNameForPractice().then(setExamName); }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy dark:text-white">Listening</h1>
        <p className="mt-1 text-ink-secondary">
          {examName ? `${examName} — listen and answer, at your level.` : 'Listen and answer, at your level.'}
        </p>
      </div>

      <ComprehensionPractice skill="listening" />
    </div>
  );
}
