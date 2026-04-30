import { useEffect, useState } from 'react';
import { PenLine, Sparkles, FileText, RefreshCcw } from 'lucide-react';
import clsx from 'clsx';
import { checkGrammar, rewriteText, assessWriting, type GrammarCheck, type WritingAssessment } from '../lib/writing';

type Mode = 'live' | 'rewrite' | 'templates';

const TEMPLATES = [
  { id: 'email_professional', title: 'Professional email', prompt: 'Write a professional email to a colleague about scheduling a project meeting.', guide: ['Subject line', 'Greeting', 'Reason for writing', 'Specific details', 'Closing'] },
  { id: 'cover_letter', title: 'Cover letter', prompt: 'Write a cover letter for a software engineer position.', guide: ['Opening hook', 'Why you', 'Relevant experience', 'Why this company', 'Call to action'] },
  { id: 'opinion_essay', title: 'Opinion essay', prompt: 'Should remote work become the standard? Write an opinion essay (250 words).', guide: ['Thesis statement', 'Argument 1 + example', 'Argument 2 + example', 'Counter-argument', 'Conclusion'] },
  { id: 'short_story', title: 'Short story', prompt: 'Write a short story (200 words) starting with: "When the lights went out..."', guide: ['Set the scene', 'Introduce conflict', 'Build tension', 'Resolve', 'Reflect'] },
];

export default function WritingPage() {
  const [mode, setMode] = useState<Mode>('live');
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">Writing</h1>
        <p className="mt-1 text-ink-secondary">Live grammar coach, smart rewrites, and structured writing templates.</p>
      </div>

      <div className="flex gap-2 rounded-2xl bg-surface-muted p-1.5">
        <ModeBtn active={mode === 'live'} onClick={() => setMode('live')} icon={PenLine}>Live grammar</ModeBtn>
        <ModeBtn active={mode === 'rewrite'} onClick={() => setMode('rewrite')} icon={Sparkles}>Smart rewrite</ModeBtn>
        <ModeBtn active={mode === 'templates'} onClick={() => setMode('templates')} icon={FileText}>Templates</ModeBtn>
      </div>

      {mode === 'live' && <LiveMode />}
      {mode === 'rewrite' && <RewriteMode />}
      {mode === 'templates' && <TemplatesMode />}
    </div>
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
          <div className="card p-6 text-center text-ink-disabled">
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
                  {e.suggestion && <div className="font-medium text-teal-600">→ {e.suggestion}</div>}
                  {e.explanation && <div className="mt-1 text-xs text-ink-secondary">{e.explanation}</div>}
                  {e.rule && <div className="mt-1 text-xs italic text-ink-disabled">Rule: {e.rule}</div>}
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

function TemplatesMode() {
  const [tpl, setTpl] = useState<typeof TEMPLATES[number] | null>(null);
  const [text, setText] = useState('');
  const [assessment, setAssessment] = useState<WritingAssessment | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!text.trim()) return;
    setLoading(true); setAssessment(null);
    try { setAssessment(await assessWriting(text, tpl?.prompt)); }
    finally { setLoading(false); }
  };

  if (!tpl) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {TEMPLATES.map((t) => (
          <button key={t.id} onClick={() => { setTpl(t); setText(''); setAssessment(null); }} className="card p-6 text-left hover:shadow-cardHover">
            <FileText className="mb-3 h-8 w-8 text-teal" />
            <h3 className="font-display text-lg font-bold text-navy">{t.title}</h3>
            <p className="mt-1 text-sm text-ink-secondary">{t.prompt}</p>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,300px]">
      <div className="space-y-4">
        <div className="card p-6">
          <button onClick={() => setTpl(null)} className="btn-ghost mb-3 text-sm"><RefreshCcw className="h-4 w-4" /> Pick another template</button>
          <h3 className="mb-2 font-display text-xl font-bold text-navy">{tpl.title}</h3>
          <p className="text-sm text-ink-secondary">{tpl.prompt}</p>
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
        )}
      </div>
      <div className="card sticky top-6 h-fit p-6">
        <h4 className="mb-3 font-display font-bold text-navy">Structure guide</h4>
        <ol className="space-y-2 text-sm">
          {tpl.guide.map((g, i) => (
            <li key={i} className="flex gap-2"><span className="font-bold text-teal">{i + 1}.</span><span>{g}</span></li>
          ))}
        </ol>
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
