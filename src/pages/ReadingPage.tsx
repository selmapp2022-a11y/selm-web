import { useEffect, useRef, useState } from 'react';
import { ClipboardPaste, Newspaper, Timer, RefreshCcw, CheckCircle2, XCircle } from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '../store/authStore';
import { enhanceText, generateText, type ReadingText } from '../lib/reading';
import { CompletionCard } from '../components/CompletionCard';

type Mode = 'paste' | 'daily' | 'speed';

export default function ReadingPage() {
  const { user } = useAuthStore();
  const level = user?.current_level || 'B1';
  const [mode, setMode] = useState<Mode>('paste');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">Reading</h1>
        <p className="mt-1 text-ink-secondary">Texts at your level, vocabulary support, and reading speed training.</p>
      </div>

      <div className="flex gap-2 rounded-2xl bg-surface-muted p-1.5">
        <ModeBtn active={mode === 'paste'} onClick={() => setMode('paste')} icon={ClipboardPaste}>Paste any text</ModeBtn>
        <ModeBtn active={mode === 'daily'} onClick={() => setMode('daily')} icon={Newspaper}>Article of the day</ModeBtn>
        <ModeBtn active={mode === 'speed'} onClick={() => setMode('speed')} icon={Timer}>Speed reader</ModeBtn>
      </div>

      {mode === 'paste' && <PasteMode level={level} />}
      {mode === 'daily' && <DailyMode level={level} />}
      {mode === 'speed' && <SpeedMode level={level} />}
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

function PasteMode({ level }: { level: string }) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ReadingText | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    if (input.trim().length < 50) { setErr('Please paste at least a paragraph (50+ characters).'); return; }
    setLoading(true); setErr(null); setResult(null);
    try {
      const r = await enhanceText(input, level);
      setResult(r);
    } catch (e: any) {
      setErr(e?.response?.data?.detail || 'Could not analyze text.');
    } finally { setLoading(false); }
  };

  if (result) return <ReaderView text={result} onRetry={() => setResult(null)} />;

  return (
    <div className="card p-6">
      <h3 className="mb-2 font-display text-xl font-bold text-navy">Paste any English text</h3>
      <p className="mb-4 text-sm text-ink-secondary">Article, blog post, email — anything. AI will rate the level, highlight key vocabulary, and create comprehension questions.</p>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={10}
        className="input"
        placeholder="Paste text here…"
      />
      <div className="mt-3 flex items-center justify-between text-xs text-ink-secondary">
        <span>{input.split(/\s+/).filter(Boolean).length} words</span>
        <span>Your level: {level}</span>
      </div>
      {err && <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      <button onClick={submit} disabled={loading || input.trim().length < 50} className="btn-primary mt-4 w-full">
        {loading ? 'Analyzing…' : 'Analyze and create exercises'}
      </button>
    </div>
  );
}

function DailyMode({ level }: { level: string }) {
  const [, setTopic] = useState<string | null>(null);
  const [text, setText] = useState<ReadingText | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const TOPICS = ['Technology', 'Science', 'Travel', 'Health', 'Business', 'Culture', 'Environment', 'Education'];

  const load = async (t: string) => {
    setTopic(t); setLoading(true); setErr(null); setText(null);
    try {
      const r = await generateText(t.toLowerCase(), level);
      setText(r);
    } catch (e: any) {
      setErr(e?.response?.data?.detail || 'Could not load article.');
    } finally { setLoading(false); }
  };

  if (text) return <ReaderView text={text} onRetry={() => { setText(null); setTopic(null); }} />;
  if (loading) return <div className="card flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-teal/30 border-t-teal" /></div>;
  if (err) return <div className="card p-6 text-center"><p className="mb-3 text-red-700">{err}</p><button onClick={() => setTopic(null)} className="btn-secondary">Back</button></div>;

  return (
    <div className="card p-8">
      <h3 className="mb-2 font-display text-xl font-bold text-navy">Article of the day</h3>
      <p className="mb-6 text-sm text-ink-secondary">Pick a topic — we'll generate a fresh article at level {level}.</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {TOPICS.map((t) => (
          <button key={t} onClick={() => load(t)} className="btn-secondary justify-start">{t}</button>
        ))}
      </div>
    </div>
  );
}

function ReaderView({ text, onRetry }: { text: ReadingText; onRetry: () => void }) {
  const [vocabSel, setVocabSel] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const vocabMap = new Map((text.vocabulary || []).map((v) => [v.word.toLowerCase(), v]));
  const vocabSelDef = vocabSel ? vocabMap.get(vocabSel.toLowerCase()) : null;

  const wordCount = text.content.split(/\s+/).filter(Boolean).length;
  const score = text.questions ? text.questions.filter((q, i) => {
    const a = answers[i];
    return a && a.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();
  }).length : 0;

  return (
    <div className="space-y-6">
      <div className="card p-8">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <span className="chip">Level {text.difficulty_level}</span>
            <h2 className="mt-2 font-display text-2xl font-bold text-navy">{text.title}</h2>
            <div className="mt-1 text-xs text-ink-secondary">{wordCount} words · ~{Math.ceil(wordCount / 200)} min read</div>
          </div>
          <button onClick={onRetry} className="btn-ghost text-sm"><RefreshCcw className="h-4 w-4" /> New</button>
        </div>

        <div className="prose prose-lg max-w-none leading-relaxed text-ink-primary">
          {renderWithClickableVocab(text.content, vocabMap, setVocabSel)}
        </div>

        {vocabSelDef && (
          <div className="mt-6 rounded-2xl border-l-4 border-teal bg-teal/5 p-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-display text-lg font-bold text-navy">{vocabSelDef.word}</h4>
                <p className="mt-1 text-sm text-ink-primary">{vocabSelDef.definition}</p>
                {vocabSelDef.example && <p className="mt-2 text-sm italic text-ink-secondary">e.g. "{vocabSelDef.example}"</p>}
              </div>
              <button onClick={() => setVocabSel(null)} className="text-ink-disabled">×</button>
            </div>
          </div>
        )}
      </div>

      {text.vocabulary && text.vocabulary.length > 0 && (
        <details className="card p-6">
          <summary className="cursor-pointer font-display font-semibold text-navy">Key vocabulary ({text.vocabulary.length})</summary>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {text.vocabulary.map((v) => (
              <div key={v.word} className="rounded-xl border border-surface-divider p-3">
                <div className="font-display font-bold text-navy">{v.word}</div>
                <div className="text-sm text-ink-secondary">{v.definition}</div>
              </div>
            ))}
          </div>
        </details>
      )}

      {text.questions && text.questions.length > 0 && (
        <div className="card p-6">
          <h4 className="mb-4 font-display text-lg font-bold text-navy">Comprehension</h4>
          <div className="space-y-5">
            {text.questions.map((q, idx) => (
              <div key={idx}>
                <p className="mb-3 font-medium">{idx + 1}. {q.question}</p>
                <div className="space-y-2">
                  {(q.options || (q.question_type === 'true_false_ng' ? ['True', 'False', 'Not Given'] : ['True', 'False'])).map((opt) => {
                    const selected = answers[idx] === opt;
                    const isRight = opt.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();
                    return (
                      <button
                        key={opt}
                        onClick={() => !submitted && setAnswers((a) => ({ ...a, [idx]: opt }))}
                        disabled={submitted}
                        className={clsx(
                          'w-full rounded-xl border-2 px-4 py-2.5 text-left text-sm transition',
                          submitted && isRight && 'border-teal bg-teal/10 text-navy',
                          submitted && selected && !isRight && 'border-red-400 bg-red-50 text-red-700',
                          !submitted && selected && 'border-navy bg-navy/5',
                          !submitted && !selected && 'border-surface-divider hover:border-navy/40'
                        )}
                      >
                        {opt}
                        {submitted && isRight && <CheckCircle2 className="float-right h-5 w-5 text-teal" />}
                        {submitted && selected && !isRight && <XCircle className="float-right h-5 w-5 text-red-500" />}
                      </button>
                    );
                  })}
                </div>
                {submitted && q.explanation && <p className="mt-2 rounded-xl bg-surface-muted p-3 text-xs text-ink-secondary">{q.explanation}</p>}
              </div>
            ))}
          </div>
          {!submitted && (
            <button onClick={() => setSubmitted(true)} disabled={Object.keys(answers).length !== text.questions!.length} className="btn-primary mt-6 w-full">Check answers</button>
          )}
        </div>
      )}

      {submitted && text.questions && text.questions.length > 0 && (
        <CompletionCard
          skill="reading"
          topic={text.title}
          score={score}
          total={text.questions.length}
          onNext={onRetry}
          nextLabel="Read another article"
        />
      )}
    </div>
  );
}

function renderWithClickableVocab(content: string, vocab: Map<string, any>, onClick: (w: string) => void) {
  if (vocab.size === 0) return <p>{content}</p>;
  const words = content.split(/(\s+|[.,!?;:])/);
  return (
    <p>
      {words.map((w, i) => {
        const cleaned = w.toLowerCase().replace(/[^\w']/g, '');
        if (vocab.has(cleaned)) {
          return (
            <span
              key={i}
              onClick={() => onClick(cleaned)}
              className="cursor-pointer rounded bg-teal/10 px-0.5 underline decoration-teal decoration-dotted underline-offset-4 hover:bg-teal/20"
            >
              {w}
            </span>
          );
        }
        return <span key={i}>{w}</span>;
      })}
    </p>
  );
}

function SpeedMode({ level }: { level: string }) {
  const [text, setText] = useState<ReadingText | null>(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const startRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed(Math.round((Date.now() - startRef.current) / 1000)), 250);
    return () => clearInterval(id);
  }, [running]);

  const load = async () => {
    setLoading(true); setText(null); setDone(false); setElapsed(0); setRunning(false);
    try {
      const r = await generateText('general', level);
      setText(r);
    } finally { setLoading(false); }
  };

  if (!text && !loading) {
    return (
      <div className="card p-10 text-center">
        <Timer className="mx-auto mb-4 h-12 w-12 text-teal" />
        <h3 className="mb-2 font-display text-xl font-bold text-navy">Reading speed trainer</h3>
        <p className="mb-6 text-ink-secondary">Read at your own pace — we'll measure your words per minute (WPM).</p>
        <button onClick={load} className="btn-primary">Get a passage</button>
      </div>
    );
  }
  if (loading) return <div className="card flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-teal/30 border-t-teal" /></div>;
  if (!text) return null;

  const wordCount = text.content.split(/\s+/).filter(Boolean).length;
  const wpm = elapsed > 0 ? Math.round((wordCount / elapsed) * 60) : 0;

  return (
    <div className="space-y-4">
      <div className="card flex items-center justify-between p-4">
        <div className="flex gap-6">
          <div><div className="text-xs text-ink-secondary">Time</div><div className="font-mono text-xl font-bold text-navy">{Math.floor(elapsed/60)}:{String(elapsed%60).padStart(2,'0')}</div></div>
          <div><div className="text-xs text-ink-secondary">Words</div><div className="text-xl font-bold text-navy">{wordCount}</div></div>
          <div><div className="text-xs text-ink-secondary">WPM</div><div className="text-xl font-bold text-teal">{done ? wpm : '—'}</div></div>
        </div>
        {!running && !done && <button onClick={() => { startRef.current = Date.now(); setRunning(true); }} className="btn-accent">Start reading</button>}
        {running && <button onClick={() => { setRunning(false); setDone(true); }} className="btn-primary">I'm done</button>}
        {done && <button onClick={load} className="btn-secondary">Try another</button>}
      </div>

      <div className={clsx('card p-8 transition-opacity', !running && !done && 'opacity-30 blur-sm select-none')}>
        <h3 className="mb-4 font-display text-xl font-bold text-navy">{text.title}</h3>
        <p className="text-lg leading-relaxed text-ink-primary">{text.content}</p>
      </div>

      {done && (
        <CompletionCard
          skill="reading"
          topic={`Speed read · ${wpm} WPM`}
          score={Math.min(100, wpm)}
          onNext={load}
          nextLabel="Try another passage"
          extra={
            <div className="text-center">
              <div className="font-display text-3xl font-bold text-teal">{wpm} WPM</div>
              <p className="mt-1 text-sm text-ink-secondary">
                {wpm < 150 ? 'Steady — keep practicing for fluency' : wpm < 250 ? 'Good — close to native speed' : 'Excellent — fluent reader speed'}
              </p>
            </div>
          }
        />
      )}
    </div>
  );
}
