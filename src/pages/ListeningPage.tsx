import { useState } from 'react';
import { Headphones, Newspaper, PenLine, RefreshCcw, CheckCircle2, XCircle } from 'lucide-react';
import clsx from 'clsx';
import { AudioPlayer } from '../components/AudioPlayer';
import { useAuthStore } from '../store/authStore';
import { generateListening, type ListeningExercise } from '../lib/listening';

type Mode = 'practice' | 'news' | 'dictation';

const NEWS_TOPICS = ['Technology', 'Science', 'Health', 'Business', 'Climate', 'Sports'];

export default function ListeningPage() {
  const { user } = useAuthStore();
  const level = user?.current_level || 'B1';
  const [mode, setMode] = useState<Mode>('practice');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">Listening</h1>
        <p className="mt-1 text-ink-secondary">Adaptive playback, real-world content, and dictation training.</p>
      </div>

      <div className="flex gap-2 rounded-2xl bg-surface-muted p-1.5">
        <ModeBtn active={mode === 'practice'} onClick={() => setMode('practice')} icon={Headphones}>Adaptive Practice</ModeBtn>
        <ModeBtn active={mode === 'news'} onClick={() => setMode('news')} icon={Newspaper}>News & Stories</ModeBtn>
        <ModeBtn active={mode === 'dictation'} onClick={() => setMode('dictation')} icon={PenLine}>Dictation</ModeBtn>
      </div>

      {mode === 'practice' && <PracticeMode level={level} topic="general" />}
      {mode === 'news' && <NewsMode level={level} />}
      {mode === 'dictation' && <DictationMode level={level} />}
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

function PracticeMode({ level, topic }: { level: string; topic: string }) {
  const [exercise, setExercise] = useState<ListeningExercise | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const load = async () => {
    setLoading(true); setErr(null); setExercise(null); setAnswers({}); setSubmitted(false);
    try {
      const ex = await generateListening(level, topic);
      setExercise(ex);
    } catch (e: any) {
      setErr(e?.response?.data?.detail || 'Could not generate exercise.');
    } finally { setLoading(false); }
  };

  if (!exercise && !loading && !err) {
    return (
      <div className="card p-10 text-center">
        <Headphones className="mx-auto mb-4 h-12 w-12 text-teal" />
        <h3 className="mb-2 font-display text-xl font-bold text-navy">Adaptive listening practice</h3>
        <p className="mb-6 text-ink-secondary">A fresh audio passage at your level ({level}) with comprehension questions.</p>
        <button onClick={load} className="btn-primary">Start practice</button>
      </div>
    );
  }
  if (loading) return <Loader text="Generating audio passage…" />;
  if (err) return <ErrorBox msg={err} onRetry={load} />;
  if (!exercise) return null;

  const score = exercise.questions ? Object.entries(answers).filter(([qid, ans]) => {
    const q = exercise.questions!.find((qq) => String(qq.id) === qid);
    return q && ans.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();
  }).length : 0;

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <span className="chip">Level {exercise.difficulty_level}</span>
            <h3 className="mt-2 font-display text-xl font-bold text-navy">{exercise.title}</h3>
          </div>
          <button onClick={load} className="btn-ghost text-sm"><RefreshCcw className="h-4 w-4" /> New</button>
        </div>
        <AudioPlayer src={exercise.audio_url} fallbackText={exercise.audio_text || exercise.transcript} />
      </div>

      {exercise.questions && exercise.questions.length > 0 && (
        <div className="card p-6">
          <h4 className="mb-4 font-display text-lg font-bold text-navy">Comprehension</h4>
          <div className="space-y-5">
            {exercise.questions.map((q, idx) => (
              <div key={q.id || idx}>
                <p className="mb-3 font-medium text-ink-primary">{idx + 1}. {q.question}</p>
                <div className="space-y-2">
                  {(q.options || ['True', 'False']).map((opt) => {
                    const selected = answers[q.id || idx] === opt;
                    const isRight = opt.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();
                    return (
                      <button
                        key={opt}
                        onClick={() => !submitted && setAnswers((a) => ({ ...a, [q.id || idx]: opt }))}
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
          {!submitted ? (
            <button onClick={() => setSubmitted(true)} disabled={Object.keys(answers).length !== exercise.questions!.length} className="btn-primary mt-6 w-full">Submit answers</button>
          ) : (
            <div className="mt-6 rounded-xl bg-teal/10 p-4 text-center">
              <p className="font-display text-2xl font-bold text-teal">Score: {score}/{exercise.questions.length}</p>
              <button onClick={load} className="btn-secondary mt-3">Try another</button>
            </div>
          )}
        </div>
      )}

      {(exercise.transcript || exercise.audio_text) && (
        <details className="card p-6">
          <summary className="cursor-pointer font-display font-semibold text-navy">Show transcript</summary>
          <p className="mt-4 leading-relaxed text-ink-primary">{exercise.transcript || exercise.audio_text}</p>
        </details>
      )}
    </div>
  );
}

function NewsMode({ level }: { level: string }) {
  const [topic, setTopic] = useState<string | null>(null);
  if (!topic) {
    return (
      <div className="card p-8">
        <h3 className="mb-2 font-display text-xl font-bold text-navy">Pick a topic</h3>
        <p className="mb-6 text-sm text-ink-secondary">A short audio piece on today's topic, graded for your level.</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {NEWS_TOPICS.map((t) => (
            <button key={t} onClick={() => setTopic(t)} className="btn-secondary justify-start">{t}</button>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <button onClick={() => setTopic(null)} className="btn-ghost text-sm">← Change topic</button>
      <PracticeMode level={level} topic={topic.toLowerCase()} />
    </div>
  );
}

function DictationMode({ level }: { level: string }) {
  const [exercise, setExercise] = useState<ListeningExercise | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [userText, setUserText] = useState('');
  const [revealed, setRevealed] = useState(false);

  const load = async () => {
    setLoading(true); setErr(null); setExercise(null); setUserText(''); setRevealed(false);
    try {
      const ex = await generateListening(level, 'short_dictation');
      setExercise(ex);
    } catch (e: any) {
      setErr(e?.response?.data?.detail || 'Could not generate dictation.');
    } finally { setLoading(false); }
  };

  if (!exercise && !loading && !err) {
    return (
      <div className="card p-10 text-center">
        <PenLine className="mx-auto mb-4 h-12 w-12 text-teal" />
        <h3 className="mb-2 font-display text-xl font-bold text-navy">Dictation</h3>
        <p className="mb-6 text-ink-secondary">Listen carefully and type what you hear. Trains your ear for spelling and chunking.</p>
        <button onClick={load} className="btn-primary">Start dictation</button>
      </div>
    );
  }
  if (loading) return <Loader text="Preparing dictation…" />;
  if (err) return <ErrorBox msg={err} onRetry={load} />;
  if (!exercise) return null;

  const target = (exercise.transcript || exercise.audio_text || '').trim();
  const accuracy = revealed ? wordAccuracy(userText, target) : 0;

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <AudioPlayer src={exercise.audio_url} fallbackText={target} />
      </div>
      <div className="card p-6">
        <label className="label">Type what you hear</label>
        <textarea
          value={userText}
          onChange={(e) => setUserText(e.target.value)}
          disabled={revealed}
          rows={4}
          className="input font-mono"
          placeholder="Listen carefully and type the sentence(s)…"
        />
        {!revealed ? (
          <button onClick={() => setRevealed(true)} disabled={!userText.trim()} className="btn-primary mt-4 w-full">Check</button>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="rounded-xl bg-surface-muted p-4">
              <div className="mb-1 text-xs font-medium uppercase text-ink-secondary">Original</div>
              <p className="text-ink-primary">{target}</p>
            </div>
            <div className={clsx('rounded-xl p-4 text-center font-display text-2xl font-bold', accuracy >= 80 ? 'bg-teal/10 text-teal' : accuracy >= 50 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700')}>
              Accuracy: {accuracy}%
            </div>
            <button onClick={load} className="btn-secondary w-full">Next dictation</button>
          </div>
        )}
      </div>
    </div>
  );
}

function wordAccuracy(a: string, b: string) {
  const wa = a.toLowerCase().replace(/[^\w\s']/g, '').split(/\s+/).filter(Boolean);
  const wb = b.toLowerCase().replace(/[^\w\s']/g, '').split(/\s+/).filter(Boolean);
  if (wb.length === 0) return 0;
  let matches = 0;
  const len = Math.min(wa.length, wb.length);
  for (let i = 0; i < len; i++) if (wa[i] === wb[i]) matches++;
  return Math.round((matches / wb.length) * 100);
}

function Loader({ text }: { text: string }) {
  return (
    <div className="card flex h-64 items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-teal/30 border-t-teal" />
        <p className="text-sm text-ink-secondary">{text}</p>
      </div>
    </div>
  );
}
function ErrorBox({ msg, onRetry }: { msg: string; onRetry: () => void }) {
  return (
    <div className="card p-6 text-center">
      <p className="mb-4 text-red-700">{msg}</p>
      <button onClick={onRetry} className="btn-secondary">Try again</button>
    </div>
  );
}
