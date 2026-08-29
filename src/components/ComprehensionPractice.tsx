import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Headphones, BookOpen, RefreshCcw } from 'lucide-react';
import clsx from 'clsx';
import { loadPlan, PLAN_EVENT } from '../exam/model/plan';
import { resolveAudio } from '../exam/engine/audio';
import { itemsOf } from '../exam/engine/comprehension';
import type { ComprehensionSection, LanguageCode, Recording } from '../exam/model/types';
import { recordAttempt, type SkillKey } from '../lib/attempts';

/**
 * Practice for a comprehension skill, served from THE EXAM'S OWN BANK.
 *
 * Until 2026-08-29 Practice > Reading offered "paste any text" and
 * Practice > Listening offered topic cards - Technology, Science, Sports -
 * neither of which any examination sets. Speaking and Writing had already been
 * moved onto the exam's own tasks, so half the practice hub prepared the
 * candidate for their examination and half prepared them for nothing in
 * particular. Worse, the IELTS reading bank authored the night before was
 * reachable only through the planner: the one screen actually labelled
 * "Reading" could not open it.
 *
 * Three states, and each of them is honest:
 *
 *  - no plan yet          ask for the exam first; everything here derives from it
 *  - exam has no section  say so, naming the exam and the skill. Substituting
 *                         generic material would let the candidate believe they
 *                         were practising for their examination when they were
 *                         not, which is the one outcome worse than an empty page
 *  - section exists       serve its items, one at a time, WITH feedback
 *
 * Feedback is the difference between this and `SectionPage`. A mock section
 * shows nothing until it is submitted, because that is the examination. This is
 * practice: the rationale is the teaching, and withholding it here would waste
 * the item.
 */
export function ComprehensionPractice({ skill }: { skill: 'reading' | 'listening' }) {
  const [state, setState] = useState<
    | { kind: 'loading' }
    | { kind: 'no-plan' }
    | { kind: 'no-section'; examName: string }
    | { kind: 'no-audio'; examName: string }
    | { kind: 'ready'; examName: string; section: ComprehensionSection; recordings: Recording[]; lang: LanguageCode }
  >({ kind: 'loading' });

  useEffect(() => {
    let alive = true;
    const read = async () => {
      const plan = loadPlan();
      if (!plan?.examId) { if (alive) setState({ kind: 'no-plan' }); return; }
      const defs = await import('../exam/definitions');
      const exam = defs.EXAMS.find((e) => e.id === plan.examId);
      if (!exam) { if (alive) setState({ kind: 'no-plan' }); return; }
      const lang = exam.language as LanguageCode;
      const examName = exam.name[lang] ?? exam.name.en;
      const section = exam.sections.find(
        (s): s is ComprehensionSection => s.kind === 'comprehension' && s.skill === skill,
      );
      if (!section) { if (alive) setState({ kind: 'no-section', examName }); return; }

      // A recording that was never rendered cannot carry listening questions.
      // Showing its script would turn a listening test into a reading test -
      // the same rule SectionPage enforces, for the same reason.
      const usable = section.delivery.audioPlaysOnce
        ? section.recordings.filter((r) => !!r.audioPath)
        : section.recordings;
      if (!usable.length) { if (alive) setState({ kind: 'no-audio', examName }); return; }
      if (alive) setState({ kind: 'ready', examName, section, recordings: usable, lang });
    };
    read();
    window.addEventListener(PLAN_EVENT, read);
    return () => { alive = false; window.removeEventListener(PLAN_EVENT, read); };
  }, [skill]);

  const Icon = skill === 'listening' ? Headphones : BookOpen;

  if (state.kind === 'loading') {
    return <div className="card p-6 text-sm text-ink-secondary">Loading…</div>;
  }

  if (state.kind === 'no-plan') {
    return (
      <div className="card p-6">
        <p className="text-sm text-ink-primary">
          Choose your exam first. Everything you practise here — the language, the text types, the
          questions — comes from it.
        </p>
        <Link to="/goal" className="btn-primary mt-4 inline-block">Choose my exam</Link>
      </div>
    );
  }

  if (state.kind === 'no-section') {
    return (
      <div className="card border-dashed p-6">
        <div className="flex items-start gap-3">
          <Icon className="mt-0.5 h-5 w-5 shrink-0 text-ink-secondary" />
          <div>
            <p className="font-medium text-navy">
              {state.examName} — this skill is not built yet
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
              Your exam awards a {skill} score, and we have not authored that part of it. Nothing is
              shown here rather than substituting general {skill} material, because practising
              something the exam does not set would not move your score, and telling you otherwise
              would be worse than an empty page.
            </p>
            <p className="mt-3 text-sm text-ink-secondary">
              The skills that are built are on the practice page.
            </p>
            <Link to="/practice" className="btn-ghost mt-3 inline-block border-2 border-surface-divider px-4 py-2">
              Back to practice
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (state.kind === 'no-audio') {
    return (
      <div className="card border-dashed p-6">
        <div className="flex items-start gap-3">
          <Headphones className="mt-0.5 h-5 w-5 shrink-0 text-ink-secondary" />
          <div>
            <p className="font-medium text-navy">{state.examName} — the recordings are not ready</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
              The questions exist but their audio has not been recorded. A listening question without
              its recording is a reading question, so it is not offered. This section opens as soon as
              the audio is in place.
            </p>
            <Link to="/practice" className="btn-ghost mt-3 inline-block border-2 border-surface-divider px-4 py-2">
              Back to practice
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <Runner examName={state.examName} section={state.section} recordings={state.recordings} />;
}

/**
 * Practice serves a WHOLE PART: the recording, then its questions, then
 * feedback on all of them.
 *
 * Per-question listening practice does not exist for this skill. Question 7
 * without the four minutes of conversation before it is not a task, it is a
 * guess — ruling 3.
 *
 * And practice may replay, where the exam may not. The distinction is not
 * arbitrary: **refusing the script protects the construct, because reading a
 * transcript is a different skill. Replaying the audio does not — it is the
 * same skill, attempted again.** So the transcript stays hidden here too, and
 * the replay is allowed. The screen says the exam plays once, because the
 * candidate should never learn that difference on exam day.
 */
function Runner({
  examName,
  section,
  recordings,
}: {
  examName: string;
  section: ComprehensionSection;
  recordings: Recording[];
}) {
  // Easiest first. Practice is not a measurement, so there is no reason to
  // open on a C2 recording and no reason to randomise; a ladder is what
  // teaches.
  const ordered = useMemo(() => {
    const CEFR = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    return [...recordings].sort((a, b) => CEFR.indexOf(a.level) - CEFR.indexOf(b.level));
  }, [recordings]);

  const [cursor, setCursor] = useState(0);
  const [chosen, setChosen] = useState<Record<string, number>>({});
  const [marked, setMarked] = useState(false);
  const [tally, setTally] = useState({ correct: 0, total: 0 });
  const [done, setDone] = useState(false);

  const rec = ordered[cursor];
  const items = useMemo(() => (rec ? itemsOf(section, rec.id) : []), [section, rec]);
  const isAudio = section.delivery.audioPlaysOnce;
  const family = section.families?.find((f) => f.id === rec?.family);

  const restart = () => {
    setCursor(0); setChosen({}); setMarked(false); setTally({ correct: 0, total: 0 }); setDone(false);
  };

  if (done) {
    return (
      <div className="card p-6 text-center">
        <p className="font-display text-2xl font-bold text-navy">
          {tally.correct} of {tally.total}
        </p>
        <p className="mt-2 text-sm text-ink-secondary">
          These are practice questions from the {examName} bank. Your score here is not a predicted
          band — it is how you did on these questions today.
        </p>
        <button onClick={restart} className="btn-primary mt-4 inline-flex items-center gap-2">
          <RefreshCcw className="h-4 w-4" /> Again
        </button>
      </div>
    );
  }

  const allAnswered = items.every((i) => typeof chosen[i.id] === 'number');

  const mark = () => {
    const right = items.filter((i) => chosen[i.id] === i.answer).length;
    setTally((t) => ({ correct: t.correct + right, total: t.total + items.length }));
    setMarked(true);
    // Record the attempt.
    //
    // Until 29 August 2026 nothing here recorded anything: only Speaking and
    // Writing went through `CompletionCard`, so listening and reading practice
    // left no trace at all. The old scoreboard hid it — a candidate who read
    // for an hour still watched a number go up, because vocabulary and the
    // other two skills were feeding it.
    //
    // The topic is the planner's own coordinate label, `family · level`, and
    // it has to stay that exact string: Progress joins attempts to the
    // planner's coordinates to say what has NOT been practised, and a label
    // that drifts turns that list into "everything, forever".
    if (rec?.family) {
      recordAttempt({
        skill: section.skill as SkillKey,
        topic: `${rec.family} · ${rec.level}`,
        score: right,
        total: items.length,
      });
    }
  };

  const next = () => {
    if (cursor + 1 >= ordered.length) { setDone(true); return; }
    setCursor(cursor + 1); setChosen({}); setMarked(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-ink-secondary">
        <span>
          {isAudio ? 'Recording' : 'Passage'} {cursor + 1} of {ordered.length} · {items.length}{' '}
          {items.length === 1 ? 'question' : 'questions'}
        </span>
        <span className="chip">{rec.level}{family ? ` · ${family.label.en}` : ''}</span>
      </div>

      <div className="card p-6">
        {isAudio ? (
          <>
            <audio controls src={resolveAudio(rec.audioPath)} className="w-full" />
            <p className="mt-2 text-xs text-ink-secondary">
              You can replay this here. In the real exam you will hear it once.
            </p>
          </>
        ) : (
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink-primary">{rec.script}</p>
        )}
      </div>

      {items.map((item, n) => {
        const pick = chosen[item.id];
        return (
          <div key={item.id} className="card p-6">
            <p className="font-medium text-ink-primary">
              <span className="mr-2 text-ink-secondary">{n + 1}.</span>
              {item.stem}
            </p>
            <div className="mt-3 space-y-2">
              {item.options.map((o, i) => {
                const isKey = i === item.answer;
                const picked = pick === i;
                return (
                  <button
                    key={i}
                    onClick={() => !marked && setChosen((c) => ({ ...c, [item.id]: i }))}
                    disabled={marked}
                    className={clsx(
                      'flex w-full items-start gap-2 rounded-xl border-2 px-5 py-3 text-left text-sm font-medium transition-all',
                      !marked && picked && 'border-teal bg-teal/10 text-navy',
                      !marked && !picked && 'border-surface-divider bg-white text-ink-secondary hover:border-navy/40 hover:bg-surface-muted',
                      marked && isKey && 'border-teal bg-teal/10 text-navy',
                      marked && picked && !isKey && 'border-red-400 bg-red-50 text-red-800',
                      marked && !picked && !isKey && 'border-surface-divider bg-white text-ink-secondary opacity-60',
                    )}
                  >
                    {marked && isKey && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal" />}
                    {marked && picked && !isKey && <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />}
                    <span>{o}</span>
                  </button>
                );
              })}
            </div>
            {marked && item.rationale && (
              <p className="mt-3 rounded-xl bg-surface-muted p-3 text-sm leading-relaxed text-ink-secondary">
                {item.rationale}
              </p>
            )}
          </div>
        );
      })}

      {marked ? (
        <button onClick={next} className="btn-primary w-full">
          {cursor + 1 >= ordered.length ? 'Finish' : isAudio ? 'Next recording' : 'Next passage'}
        </button>
      ) : (
        <button
          onClick={mark}
          disabled={!allAnswered}
          className={clsx('w-full rounded-xl px-5 py-3 text-sm font-semibold',
            allAnswered ? 'bg-navy text-white' : 'cursor-not-allowed bg-surface-muted text-ink-secondary')}
        >
          {allAnswered ? 'Check my answers' : `Answer all ${items.length} to check`}
        </button>
      )}

      <div className="card p-6">
        <p className="text-xs leading-relaxed text-ink-secondary">{section.provenance.en}</p>
      </div>
    </div>
  );
}
