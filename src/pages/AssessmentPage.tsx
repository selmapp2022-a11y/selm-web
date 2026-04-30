import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import clsx from 'clsx';

type Question = {
  id: number;
  skill: string;
  difficulty_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  question_type: 'multiple_choice' | 'true_false' | 'fill_in_blank';
  passage?: string;
  audio_text?: string;
  audio_url?: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  points: number;
};

type Quiz = {
  quiz_metadata: { title: string; total_questions: number };
  questions: Question[];
};

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

function pickAdaptive(remaining: Question[], currentLevelIdx: number) {
  // pick a question with difficulty closest to current target level
  const target = LEVELS[currentLevelIdx];
  const sorted = [...remaining].sort((a, b) => {
    const da = Math.abs(LEVELS.indexOf(a.difficulty_level) - LEVELS.indexOf(target));
    const db = Math.abs(LEVELS.indexOf(b.difficulty_level) - LEVELS.indexOf(target));
    return da - db;
  });
  return sorted[0];
}

export default function AssessmentPage() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<'starting' | 'loading' | 'asking' | 'complete'>('starting');
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState('Preparing personalized questions…');
  const [pool, setPool] = useState<Question[]>([]);
  const [asked, setAsked] = useState<Question[]>([]);
  const [current, setCurrent] = useState<Question | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [levelIdx, setLevelIdx] = useState(2); // start at B1
  const [correctStreak, setCorrectStreak] = useState(0);
  const [wrongStreak, setWrongStreak] = useState(0);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [finalLevel, setFinalLevel] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const demographics = JSON.parse(localStorage.getItem('selm_demographics') || '{}');
    const preferences = [
      ...(demographics.interests || []),
      demographics.occupation,
      demographics.goal,
    ].filter(Boolean);

    (async () => {
      try {
        const { data: job } = await api.post('/users/level-assessment/start', {
          question_count: 12,
          user_preferences: preferences,
          personalized: true,
        });
        const jobId: string = job.job_id;

        // poll until complete
        let attempts = 0;
        while (attempts++ < 60) {
          await new Promise((r) => setTimeout(r, 2000));
          const { data: status } = await api.get(`/users/level-assessment/job/${jobId}`);
          setProgress(status.progress || 0);
          setStatusMsg(status.message || 'Generating questions…');
          if (status.status === 'completed') {
            const quiz: Quiz = status.result?.quiz_data || status.result;
            const qs = quiz.questions || [];
            setPool(qs);
            setStage('asking');
            const first = pickAdaptive(qs, 2);
            setCurrent(first);
            return;
          }
          if (status.status === 'failed') {
            throw new Error(status.error || 'Assessment generation failed');
          }
        }
        throw new Error('Timeout');
      } catch (e: any) {
        setStatusMsg(e?.message || 'Could not generate assessment. Please try again.');
      }
    })();
  }, []);

  const handleAnswer = (opt: string) => {
    if (showFeedback) return;
    setSelected(opt);
    setShowFeedback(true);
    const isCorrect = opt.trim().toLowerCase() === current!.correct_answer.trim().toLowerCase();
    setScore((s) => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }));

    if (isCorrect) {
      setCorrectStreak((c) => c + 1);
      setWrongStreak(0);
      if (correctStreak + 1 >= 2 && levelIdx < 5) setLevelIdx((l) => Math.min(5, l + 1));
    } else {
      setWrongStreak((w) => w + 1);
      setCorrectStreak(0);
      if (wrongStreak + 1 >= 2 && levelIdx > 0) setLevelIdx((l) => Math.max(0, l - 1));
    }
  };

  const handleNext = async () => {
    const newAsked = [...asked, current!];
    setAsked(newAsked);
    setSelected(null);
    setShowFeedback(false);

    const remaining = pool.filter((q) => !newAsked.some((a) => a.id === q.id));
    const stoppingCondition = newAsked.length >= 8 || remaining.length === 0;

    if (stoppingCondition) {
      // submit final
      setStage('complete');
      try {
        const answers = newAsked.map((q, i) => ({
          question_id: q.id,
          user_answer: i === newAsked.length - 1 ? selected : 'submitted',
          is_correct: undefined,
        }));
        const { data } = await api.post('/users/level-assessment/submit', {
          answers,
          time_taken_seconds: 0,
        });
        setFinalLevel(data?.cefr_level || data?.level || LEVELS[levelIdx]);
      } catch {
        setFinalLevel(LEVELS[levelIdx]);
      }
      return;
    }
    setCurrent(pickAdaptive(remaining, levelIdx));
  };

  if (stage === 'starting' || stage === 'loading') {
    return (
      <div className="mx-auto max-w-xl">
        <div className="card p-10 text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-teal" />
          <h2 className="mb-2 font-display text-2xl font-bold text-navy">Building your assessment</h2>
          <p className="text-ink-secondary">{statusMsg}</p>
          {progress > 0 && (
            <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
              <div className="h-full rounded-full bg-teal transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (stage === 'complete') {
    return (
      <div className="mx-auto max-w-xl">
        <div className="card p-10 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-teal/10 text-teal">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="mb-2 font-display text-3xl font-bold text-navy">Assessment complete</h2>
          <p className="mb-6 text-ink-secondary">Based on your answers, your estimated level is:</p>
          <div className="mb-8">
            <div className="text-7xl font-display font-bold text-teal">{finalLevel || '…'}</div>
            <div className="mt-2 text-sm uppercase tracking-wider text-ink-secondary">CEFR level</div>
          </div>
          <p className="mb-6 text-sm text-ink-secondary">
            You answered {score.correct} out of {score.total} questions correctly.
          </p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary w-full">
            Continue to dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!current) return null;
  const qNum = asked.length + 1;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm font-medium text-ink-secondary">
          <span>Question {qNum} of ~10</span>
          <span className="chip">{current.skill} · {current.difficulty_level}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
          <div className="h-full rounded-full bg-teal transition-all duration-300" style={{ width: `${(qNum / 10) * 100}%` }} />
        </div>
      </div>

      <div className="card p-8">
        {current.passage && (
          <div className="mb-6 rounded-xl border-l-4 border-teal bg-surface-muted/50 p-5 text-sm text-ink-primary">
            {current.passage}
          </div>
        )}
        {current.audio_text && (
          <div className="mb-6 rounded-xl bg-navy/5 p-4 text-sm italic text-ink-secondary">
            🔊 "{current.audio_text}"
          </div>
        )}

        <h3 className="mb-6 font-display text-xl font-semibold text-navy">{current.question}</h3>

        <div className="space-y-3">
          {(current.options.length > 0 ? current.options : ['True', 'False']).map((opt) => {
            const isSelected = selected === opt;
            const isCorrect = opt.trim().toLowerCase() === current.correct_answer.trim().toLowerCase();
            const showAsCorrect = showFeedback && isCorrect;
            const showAsWrong = showFeedback && isSelected && !isCorrect;

            return (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                disabled={showFeedback}
                className={clsx(
                  'w-full rounded-xl border-2 px-5 py-4 text-left text-sm font-medium transition-all',
                  showAsCorrect && 'border-teal bg-teal/10 text-navy',
                  showAsWrong && 'border-red-400 bg-red-50 text-red-700',
                  !showFeedback && isSelected && 'border-navy bg-navy/5',
                  !showFeedback && !isSelected && 'border-surface-divider bg-white hover:border-navy/40 hover:bg-surface-muted',
                  showFeedback && !isSelected && !isCorrect && 'border-surface-divider bg-white opacity-60'
                )}
              >
                <div className="flex items-center justify-between">
                  <span>{opt}</span>
                  {showAsCorrect && <CheckCircle2 className="h-5 w-5 text-teal" />}
                  {showAsWrong && <XCircle className="h-5 w-5 text-red-500" />}
                </div>
              </button>
            );
          })}
        </div>

        {showFeedback && (
          <div className="mt-6 rounded-xl bg-surface-muted p-4 text-sm text-ink-secondary">
            <strong className="text-navy">Explanation: </strong>{current.explanation}
          </div>
        )}

        {showFeedback && (
          <button onClick={handleNext} className="btn-primary mt-6 w-full">
            {asked.length + 1 >= 8 ? 'See results' : 'Next question'}
          </button>
        )}
      </div>
    </div>
  );
}
