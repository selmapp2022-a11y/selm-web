import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Brain, Eye, EyeOff } from 'lucide-react';
import { dueWords, recordReview } from '../lib/vocab';

export default function VocabularyPage() {
  const { data, isLoading, refetch } = useQuery({ queryKey: ['vocab', 'due'], queryFn: dueWords });
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);

  const words = data || [];
  const current = words[idx];

  useEffect(() => { setIdx(0); setRevealed(false); setDone(false); }, [data]);

  const grade = async (q: 0 | 1 | 2 | 3 | 4 | 5) => {
    if (!current) return;
    void recordReview(current.id, q);
    if (idx + 1 >= words.length) {
      setDone(true);
    } else {
      setIdx(idx + 1);
      setRevealed(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">Vocabulary review</h1>
        <p className="mt-1 text-ink-secondary">Spaced repetition keeps words in your long-term memory.</p>
      </div>

      {isLoading && <div className="card p-10 text-center"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-teal/30 border-t-teal" /></div>}

      {!isLoading && words.length === 0 && (
        <div className="card p-10 text-center">
          <Brain className="mx-auto mb-4 h-12 w-12 text-teal" />
          <h3 className="mb-2 font-display text-xl font-bold text-navy">All caught up</h3>
          <p className="text-ink-secondary">No words due for review right now. Read or listen to add new words.</p>
        </div>
      )}

      {!isLoading && words.length > 0 && !done && current && (
        <>
          <div className="flex items-center justify-between text-sm font-medium text-ink-secondary">
            <span>Card {idx + 1} of {words.length}</span>
            <button onClick={() => refetch()} className="btn-ghost text-sm">Refresh</button>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
            <div className="h-full rounded-full bg-teal transition-all" style={{ width: `${((idx + 1) / words.length) * 100}%` }} />
          </div>

          <div className="card overflow-hidden p-10">
            <div className="text-center">
              <div className="mb-1 text-xs uppercase tracking-wider text-ink-secondary">{current.part_of_speech || 'word'}</div>
              <h2 className="font-display text-5xl font-bold text-navy">{current.word}</h2>
              {current.pronunciation && <p className="mt-2 font-mono text-sm text-ink-secondary">/{current.pronunciation}/</p>}
            </div>

            {revealed ? (
              <div className="mt-8 space-y-4">
                <div className="rounded-2xl bg-surface-muted p-5">
                  <div className="text-xs font-bold uppercase text-ink-secondary">Definition</div>
                  <p className="mt-1 text-lg text-ink-primary">{current.definition}</p>
                </div>
                {current.example && (
                  <div className="rounded-2xl border-l-4 border-teal bg-teal/5 p-5">
                    <div className="text-xs font-bold uppercase text-teal">Example</div>
                    <p className="mt-1 italic text-ink-primary">"{current.example}"</p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 pt-4">
                  <button onClick={() => grade(1)} className="btn bg-red-500 text-white hover:bg-red-600">Hard</button>
                  <button onClick={() => grade(3)} className="btn bg-amber-500 text-white hover:bg-amber-600">Good</button>
                  <button onClick={() => grade(5)} className="btn-accent">Easy</button>
                </div>
                <p className="text-center text-xs text-ink-secondary">How well did you remember it?</p>
              </div>
            ) : (
              <div className="mt-10 text-center">
                <button onClick={() => setRevealed(true)} className="btn-primary">
                  <Eye className="h-5 w-5" /> Show definition
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {done && (
        <div className="card p-10 text-center">
          <div className="mb-4 text-5xl">🎉</div>
          <h3 className="font-display text-2xl font-bold text-navy">Session complete</h3>
          <p className="mt-2 text-ink-secondary">You reviewed {words.length} words. See you tomorrow.</p>
          <button onClick={() => refetch()} className="btn-secondary mt-6">Check for more</button>
        </div>
      )}
    </div>
  );
}

// avoid unused import warning
void EyeOff;
