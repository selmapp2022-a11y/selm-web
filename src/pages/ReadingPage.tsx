import { useEffect, useState } from 'react';
import { ClipboardPaste, RefreshCcw, CheckCircle2, XCircle } from 'lucide-react';
import clsx from 'clsx';
import { enhanceText, type ReadingText } from '../lib/reading';
import { CompletionCard } from '../components/CompletionCard';
import { difficultyForSkill } from '../lib/difficulty';
import { ComprehensionPractice } from '../components/ComprehensionPractice';
import { examNameForPractice } from '../lib/practiceTasks';

/**
 * `daily` and `speed` - "Article of the day" and the speed reader - were
 * removed from the mode row on 2026-08-27: no instrument tests
 * words-per-minute, and none gives the candidate a news article of their
 * choosing. On 2026-08-29 the page itself stopped being the paste tool, and
 * both components went with the row, along with the shared ModeBtn - the page
 * now leads with the exam's own reading section and offers "paste any text"
 * as a labelled extra.
 */

export default function ReadingPage() {
  // Was `user?.current_level` — one CEFR level per user, set by the adaptive
  // placement test at /onboarding/assessment and shared by three of the four
  // practice pages. Part 3 (replacement) §3: difficulty is per task, comes
  // from performance, and is never shown. See `lib/difficulty.ts`.
  const level = difficultyForSkill('reading');
  // The exam's own reading section is the page; "paste any text" is a tool
  // that supports it. It was the whole page until 2026-08-29, which meant the
  // one screen labelled Reading could not open the exam's reading test - the
  // bank existed and only the planner could reach it. Writing and Speaking
  // already led with the exam's own tasks; this makes Reading agree.
  const [aux, setAux] = useState<null | 'paste'>(null);
  const [examName, setExamName] = useState<string | null>(null);
  useEffect(() => { examNameForPractice().then(setExamName); }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">Reading</h1>
        <p className="mt-1 text-ink-secondary">
          {examName ? `${examName} — read and answer, at your level.` : 'Read and answer, at your level.'}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-ink-secondary">Extra practice:</span>
        <AuxBtn active={aux === 'paste'} onClick={() => setAux(aux === 'paste' ? null : 'paste')} icon={ClipboardPaste}>
          Paste any text
        </AuxBtn>
      </div>

      {aux === 'paste' ? <PasteMode level={level} /> : <ComprehensionPractice skill="reading" />}
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
              <button onClick={() => setVocabSel(null)} className="text-ink-secondary">×</button>
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
                <p className="mb-3 font-medium text-ink-primary">{idx + 1}. {q.question}</p>
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
                          'w-full rounded-xl border-2 px-4 py-2.5 text-left text-sm font-medium text-ink-primary transition',
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
