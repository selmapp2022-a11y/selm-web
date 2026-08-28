import { useEffect, useState } from 'react';
import { PenLine, Sparkles, FileText } from 'lucide-react';
import clsx from 'clsx';
import { checkGrammar, rewriteText, assessWriting, type GrammarCheck, type WritingAssessment } from '../lib/writing';
import { CompletionCard } from '../components/CompletionCard';
import { practiceTasksFor, type PracticeSet, type PracticeTask } from '../lib/practiceTasks';
import { ts } from '../i18n';


// The four templates that used to live here — professional email, cover
// letter for a software engineer, opinion essay on remote work, short story
// beginning "When the lights went out…" — are gone. Amendment 2 §2.2.
//
// They were not merely English. They belonged to no exam. A TCF Canada
// candidate practising a cover letter is practising something the exam does
// not ask for, with no word band and no clock, and the mark they get back
// measures nothing they will be marked on.
//
// What replaces them is the exam's own writing tasks, loaded from the
// definition the candidate chose. See `lib/practiceTasks.ts`.

export default function WritingPage() {
  // Like Speaking: the main tabs are the EXAM's own writing tasks, from the
  // definition the candidate chose (TCF tâche 1·2·3, IELTS Task 1·2). The old
  // generic modes — live grammar coach and smart rewrite — belonged to no
  // exam; they are kept but demoted below the row as auxiliary practice.
  const [set, setSet] = useState<PracticeSet | null | 'loading'>('loading');
  const [taskIdx, setTaskIdx] = useState(0);
  const [aux, setAux] = useState<null | 'live' | 'rewrite'>(null);

  useEffect(() => { practiceTasksFor('writing').then(setSet); }, []);

  const tasks = set && set !== 'loading' ? set.tasks : [];
  const activeTask = !aux && tasks.length ? tasks[Math.min(taskIdx, tasks.length - 1)] : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">Writing</h1>
        <p className="mt-1 text-ink-secondary">
          {set && set !== 'loading' ? `${set.examName} — write each task and get scored feedback.` : 'Write each exam task and get scored feedback.'}
        </p>
      </div>

      {set === 'loading' && <div className="card p-6 text-sm text-ink-secondary">{ts('common.loading')}</div>}

      {set === null && (
        <div className="card p-6">
          <h3 className="font-display text-lg font-bold text-navy">{ts('practice.chooseExamFirst')}</h3>
          <p className="mt-1 text-sm text-ink-secondary">{ts('practice.writingNeedsExam')}</p>
          <a href="/goal" className="btn-primary mt-4 inline-flex">{ts('common.chooseExam')}</a>
        </div>
      )}

      {tasks.length > 0 && (
        <>
          <div className="flex gap-2 rounded-2xl bg-surface-muted p-1.5">
            {tasks.map((tk, i) => (
              <ModeBtn key={tk.id} active={!aux && taskIdx === i} onClick={() => { setAux(null); setTaskIdx(i); }} icon={FileText}>
                {tk.title}
              </ModeBtn>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-ink-secondary">Extra practice:</span>
            <AuxBtn active={aux === 'live'} onClick={() => setAux('live')} icon={PenLine}>Live grammar</AuxBtn>
            <AuxBtn active={aux === 'rewrite'} onClick={() => setAux('rewrite')} icon={Sparkles}>Smart rewrite</AuxBtn>
          </div>

          {activeTask && <TaskWriteMode task={activeTask} />}
          {aux === 'live' && <LiveMode />}
          {aux === 'rewrite' && <RewriteMode />}
        </>
      )}
    </div>
  );
}

function AuxBtn({ active, onClick, icon: Icon, children }: any) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition',
        active ? 'border-teal bg-teal/10 text-navy' : 'border-surface-divider text-ink-secondary hover:text-navy'
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {children}
    </button>
  );
}

function ModeBtn({ active, onClick, icon: Icon, children }: any) {
  return (
    <button onClick={onClick} className={clsx('flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition', active ? 'bg-white text-navy shadow-card' : 'text-ink-secondary hover:text-navy')}>
      <Icon className="h-4 w-4" /> {children}
    </button>
  );
}

function LiveMode() {
  const [text, setText] = useState('');
  const [check, setCheck] = useState<GrammarCheck | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (text.trim().length < 15) { setCheck(null); return; }
    const id = setTimeout(async () => {
      setChecking(true);
      try { setCheck(await checkGrammar(text)); } catch { /* ignore */ }
      finally { setChecking(false); }
    }, 1200);
    return () => clearTimeout(id);
  }, [text]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
      <div className="card p-6">
        <div className="mb-3 flex items-center justify-between">
          <label className="label !mb-0">Write here — checks happen as you pause</label>
          <span className="text-xs text-ink-secondary">{text.split(/\s+/).filter(Boolean).length} words {checking && '· checking…'}</span>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={16}
          className="input font-body text-base leading-relaxed"
          placeholder="Start writing… AI will quietly review your grammar, vocabulary, and style."
        />
      </div>

      <div className="space-y-4">
        {!check && (
          <div className="card p-6 text-center text-ink-secondary">
            <PenLine className="mx-auto mb-2 h-10 w-10 opacity-40" />
            <p className="text-sm">Suggestions appear here as you write.</p>
          </div>
        )}
        {check && check.errors.length === 0 && (
          <div className="card p-6 text-center">
            <div className="mb-2 text-4xl">✨</div>
            <p className="font-medium text-teal">No issues found. Nice writing!</p>
          </div>
        )}
        {check && check.errors.length > 0 && (
          <div className="card p-5">
            <h4 className="mb-3 font-display font-bold text-navy">{check.errors.length} suggestion{check.errors.length > 1 ? 's' : ''}</h4>
            {check.corrected_text && (
              <div className="mb-4 rounded-xl border-l-4 border-teal bg-teal/5 p-3 text-sm">
                <div className="mb-1 text-xs font-bold uppercase text-teal">Corrected</div>
                <p>{check.corrected_text}</p>
              </div>
            )}
            <div className="space-y-3">
              {check.errors.slice(0, 12).map((e, i) => (
                <div key={i} className="rounded-xl border-l-4 border-amber-400 bg-surface-muted p-3 text-sm">
                  <div className="mb-1 text-xs font-bold uppercase text-ink-secondary">{e.type}</div>
                  {e.text && <div className="line-through text-red-600">{e.text}</div>}
                  {e.suggestion && <div className="font-medium text-navy">→ {e.suggestion}</div>}
                  {e.explanation && <div className="mt-1 text-xs text-ink-secondary">{e.explanation}</div>}
                  {e.rule && <div className="mt-1 text-xs italic text-ink-secondary">Rule: {e.rule}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RewriteMode() {
  const [text, setText] = useState('');
  const [style, setStyle] = useState<'formal' | 'simple' | 'natural' | 'academic' | 'friendly'>('natural');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const STYLES: Array<{ key: typeof style; label: string; desc: string }> = [
    { key: 'formal', label: 'Formal', desc: 'Business / official' },
    { key: 'simple', label: 'Simple', desc: 'Easier vocabulary' },
    { key: 'natural', label: 'Natural', desc: 'Conversational' },
    { key: 'academic', label: 'Academic', desc: 'Scholarly tone' },
    { key: 'friendly', label: 'Friendly', desc: 'Warm and casual' },
  ];

  const submit = async () => {
    if (!text.trim()) return;
    setLoading(true); setOutput('');
    try { setOutput(await rewriteText(text, style)); }
    catch { setOutput('(Could not rewrite — try again.)'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <label className="label">Original text</label>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} className="input" placeholder="Paste a sentence or paragraph to rewrite…" />
      </div>
      <div className="card p-6">
        <div className="mb-3 text-sm font-medium text-ink-secondary">Choose style</div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {STYLES.map((s) => (
            <button key={s.key} onClick={() => setStyle(s.key)} className={clsx('rounded-xl border-2 p-3 text-left transition', style === s.key ? 'border-teal bg-teal/5' : 'border-surface-divider hover:border-navy/40')}>
              <div className="font-display font-bold text-navy">{s.label}</div>
              <div className="text-xs text-ink-secondary">{s.desc}</div>
            </button>
          ))}
        </div>
        <button onClick={submit} disabled={loading || !text.trim()} className="btn-primary mt-4 w-full">
          {loading ? 'Rewriting…' : `Rewrite as ${style}`}
        </button>
      </div>
      {output && (
        <div className="card border-l-4 border-teal p-6">
          <div className="mb-2 text-xs font-bold uppercase text-teal">Rewritten ({style})</div>
          <p className="whitespace-pre-wrap text-ink-primary">{output}</p>
        </div>
      )}
    </div>
  );
}

function TaskWriteMode({ task }: { task: PracticeTask }) {
  const [text, setText] = useState('');
  const [assessment, setAssessment] = useState<WritingAssessment | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => { setText(''); setAssessment(null); }, [task.id]);

  const submit = async () => {
    if (!text.trim()) return;
    setLoading(true); setAssessment(null);
    try { setAssessment(await assessWriting(text, task.prompt)); }
    finally { setLoading(false); }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,300px]">
      <div className="space-y-4">
        <div className="card p-6">
          <h3 className="mb-2 font-display text-xl font-bold text-navy">{task.title}</h3>
          <p className="text-sm font-medium text-navy">{task.instruction}</p>
          <p className="mt-2 whitespace-pre-line text-sm text-ink-secondary">{task.prompt}</p>
          <p className="mt-3 text-xs text-ink-secondary">
            {task.words ? task.words + ' \u00b7 ' : ''}{Math.round(task.timeLimitSec / 60)} min
            {task.timeIsOurs ? ' ' + ts('practice.ourSplit') : ''}
          </p>
        </div>
        <div className="card p-6">
          <label className="label">Your draft</label>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={14} className="input" placeholder="Write your response here…" />
          <div className="mt-2 text-xs text-ink-secondary">{text.split(/\s+/).filter(Boolean).length} words</div>
          <button onClick={submit} disabled={loading || text.split(/\s+/).filter(Boolean).length < 30} className="btn-primary mt-4 w-full">
            {loading ? 'Scoring…' : 'Get AI feedback'}
          </button>
        </div>
        {assessment && (
          <>
            <div className="card p-6">
              <div className="mb-4 text-center">
                <div className="font-display text-5xl font-bold text-teal">{assessment.overall_score}</div>
                <div className="text-xs uppercase tracking-wider text-ink-secondary">Overall score</div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                {assessment.grammar_score != null && <SubScore label="Grammar" v={assessment.grammar_score} />}
                {assessment.vocabulary_score != null && <SubScore label="Vocab" v={assessment.vocabulary_score} />}
                {assessment.coherence_score != null && <SubScore label="Coherence" v={assessment.coherence_score} />}
                {assessment.task_response_score != null && <SubScore label="Task" v={assessment.task_response_score} />}
              </div>
              {assessment.feedback && <div className="mt-4 rounded-xl bg-surface-muted p-4 text-sm">{assessment.feedback}</div>}
              {assessment.strengths && assessment.strengths.length > 0 && (
                <div className="mt-4">
                  <h5 className="mb-2 text-xs font-bold uppercase text-teal">Strengths</h5>
                  <ul className="space-y-1 text-sm">{assessment.strengths.map((s, i) => <li key={i}>• {s}</li>)}</ul>
                </div>
              )}
              {assessment.weaknesses && assessment.weaknesses.length > 0 && (
                <div className="mt-4">
                  <h5 className="mb-2 text-xs font-bold uppercase text-amber-700">To improve</h5>
                  <ul className="space-y-1 text-sm">{assessment.weaknesses.map((s, i) => <li key={i}>• {s}</li>)}</ul>
                </div>
              )}
            </div>
            <CompletionCard
              skill="writing"
              topic={task.title}
              score={assessment.overall_score}
              onNext={() => { setText(''); setAssessment(null); }}
              nextLabel="Write again"
            />
          </>
        )}
      </div>
      <div className="card sticky top-6 h-fit p-6">
        <h4 className="mb-1 font-display font-bold text-navy">{ts('practice.zeroTitle')}</h4>
        <p className="mb-3 text-xs text-ink-secondary">{ts('practice.zeroHelp')}</p>
        <ul className="space-y-3 text-sm">
          {task.zeroRules.map((r, i) => (
            <li key={i}>
              <div className="font-semibold text-navy">{r.label}</div>
              <div className="text-xs text-ink-secondary">{r.detail}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SubScore({ label, v }: { label: string; v: number }) {
  return (
    <div className="text-center">
      <div className="font-display text-2xl font-bold text-navy">{Math.round(v)}</div>
      <div className="text-xs text-ink-secondary">{label}</div>
    </div>
  );
}
