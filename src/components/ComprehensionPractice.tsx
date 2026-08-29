import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Headphones, BookOpen, RefreshCcw } from 'lucide-react';
import clsx from 'clsx';
import { loadPlan, PLAN_EVENT } from '../exam/model/plan';
import { resolveAudio } from '../exam/engine/audio';
import type { ComprehensionItem, ComprehensionSection, LanguageCode } from '../exam/model/types';

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
    | { kind: 'ready'; examName: string; section: ComprehensionSection; items: ComprehensionItem[]; lang: LanguageCode }
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

      // An item whose audio was never rendered cannot be a listening question.
      // Showing its script would turn a listening test into a reading test -
      // the same rule SectionPage enforces, for the same reason.
      const usable = section.delivery.audioPlaysOnce
        ? section.items.filter((i) => !!i.audioPath)
        : section.items;
      if (!usable.length) { if (alive) setState({ kind: 'no-audio', examName }); return; }
      if (alive) setState({ kind: 'ready', examName, section, items: usable, lang });
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

  return <Runner examName={state.examName} section={state.section} items={state.items} />;
}

function Runner({
  examName,
  section,
  items,
}: {
  examName: string;
  section: ComprehensionSection;
  items: ComprehensionItem[];
}) {
  // Easiest first. Practice is not a measurement, so there is no reason to open
  // on a C2 item and no reason to randomise; a ladder is what teaches.
  const ordered = useMemo(() => {
    const CEFR = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    return [...items].sort((a, b) => CEFR.indexOf(a.level) - CEFR.indexOf(b.level));
  }, [items]);

  const [cursor, setCursor] = useState(0);
  const [chose, setChose] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  const item = ordered[cursor];
  const isAudio = section.delivery.audioPlaysOnce;
  const family = section.families?.find((f) => f.id === item?.family);

  const restart = () => {
    setCursor(0); setChose(null); setRevealed(false); setCorrect(0); setDone(false);
  };

  if (done) {
    return (
      <div className="card p-6 text-center">
        <p className="font-display text-2xl font-bold text-navy">
          {correct} of {ordered.length}
        </p>
        <p className="mt-2 text-sm text-ink-secondary">
          These are practice items from the {examName} bank. Your score here is not a predicted band —
          it is how you did on these questions today.
        </p>
        <button onClick={restart} className="btn-primary mt-4 inline-flex items-center gap-2">
          <RefreshCcw className="h-4 w-4" /> Again
        </button>
      </div>
    );
  }

  const answer = (i: number) => {
    if (revealed) return;
    setChose(i);
    setRevealed(true);
    if (i === item.answer) setCorrect((n) => n + 1);
  };

  const next = () => {
    if (cursor + 1 >= ordered.length) { setDone(true); return; }
    setCursor(cursor + 1); setChose(null); setRevealed(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-ink-secondary">
        <span>Question {cursor + 1} of {ordered.length}</span>
        <span className="chip">{item.level}{family ? ` · ${family.label.en}` : ''}</span>
      </div>

      <div className="card p-6">
        {isAudio ? (
          <audio controls src={resolveAudio(item.audioPath)} className="w-full" />
        ) : (
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink-primary">{item.content}</p>
        )}

        <p className="mt-4 font-medium text-ink-primary">{item.stem}</p>

        <div className="mt-3 space-y-2">
          {item.options.map((o, i) => {
            const isKey = i === item.answer;
            const picked = chose === i;
            return (
              <button
                key={i}
                onClick={() => answer(i)}
                disabled={revealed}
                className={clsx(
                  'flex w-full items-start gap-2 rounded-xl border-2 px-5 py-3 text-left text-sm font-medium transition-all',
                  !revealed && 'border-surface-divider bg-white text-ink-secondary hover:border-navy/40 hover:bg-surface-muted',
                  revealed && isKey && 'border-teal bg-teal/10 text-navy',
                  revealed && picked && !isKey && 'border-red-400 bg-red-50 text-red-800',
                  revealed && !picked && !isKey && 'border-surface-divider bg-white text-ink-secondary opacity-60',
                )}
              >
                {revealed && isKey && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal" />}
                {revealed && picked && !isKey && <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />}
                <span>{o}</span>
              </button>
            );
          })}
        </div>

        {revealed && (
          <div className="mt-4 rounded-xl bg-surface-muted p-4">
            <p className="text-sm font-medium text-navy">
              {chose === item.answer ? 'Correct' : 'Not this one'}
            </p>
            {item.rationale && (
              <p className="mt-1 text-sm leading-relaxed text-ink-secondary">{item.rationale}</p>
            )}
            <button onClick={next} className="btn-primary mt-3">
              {cursor + 1 >= ordered.length ? 'Finish' : 'Next question'}
            </button>
          </div>
        )}
      </div>

      <div className="card p-6">
        <p className="text-xs leading-relaxed text-ink-secondary">{section.provenance.en}</p>
      </div>
    </div>
  );
}
