import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LineChart, CheckCircle2 } from 'lucide-react';
import { type SkillKey, recordAttempt } from '../lib/attempts';
import { ts, useUiLangValue } from '../i18n';

type Props = {
  skill: SkillKey;
  topic?: string;
  /**
   * The exact task this attempt was about, when there is one.
   *
   * `topic` is the task's display title and two exams can share it — both
   * call their first writing task "Task 1". The id cannot collide, and
   * `SeenBefore` needs it to say "you have written this one before".
   */
  itemId?: string;
  score?: number;       // raw correct OR 0..100
  total?: number;       // out of (omit for free-form)
  onNext: () => void;
  nextLabel?: string;
  extra?: React.ReactNode;
};

/**
 * What is shown when a piece of work is finished.
 *
 * This card used to award XP, announce a level-up, show a day streak, fill two
 * progress bars towards the next level, and unlock achievements. All of it is
 * gone — removed on 2026-08-29, not softened. A candidate four weeks from a
 * booked TCF does not need to be told they reached Level 16; they need to know
 * what they got, that it was recorded, and what to do next.
 *
 * There is also no praise line. "You crushed it!" was chosen at random from a
 * list of six and had no relationship to the result — it fired on 2 out of 10
 * as readily as on 10 out of 10. A product whose entire claim is that it will
 * not tell a candidate something it cannot defend should not open with that.
 */
export function CompletionCard({ skill, topic, itemId, score, total, onNext, nextLabel, extra }: Props) {
  const ui = useUiLangValue();
  nextLabel = nextLabel ?? ts('common.continueWithAnother', ui);
  // Record exactly once, even under React's double-invoked effects in dev.
  const written = useRef(false);
  useEffect(() => {
    if (written.current) return;
    written.current = true;
    recordAttempt({ skill, topic, itemId, score, total });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counted = typeof score === 'number' && typeof total === 'number' && total > 0;
  const pct = counted
    ? Math.round((score! / total!) * 100)
    : (typeof score === 'number' ? Math.round(score) : null);

  return (
    <div className="card overflow-hidden">
      <div className="bg-gradient-to-br from-teal to-navy px-6 py-7 text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-2xl font-bold">
              {counted ? `${score} of ${total} correct` : 'Recorded'}
            </h3>
            <p className="mt-0.5 text-sm opacity-90">
              {counted
                ? `${pct}% on this set${topic ? ` · ${topic}` : ''}`
                : pct != null
                  ? `Scored ${pct} out of 100${topic ? ` · ${topic}` : ''}`
                  : `This attempt is saved${topic ? ` · ${topic}` : ''}`}
            </p>
          </div>
        </div>

        <p className="mt-4 text-xs leading-relaxed opacity-80">
          {counted
            ? 'One set is not a band. Your standing is read from sittings and from the result you enter, not from a single practice run.'
            : 'This skill is estimated rather than counted, so no number is published for it here.'}
        </p>
      </div>

      {extra && <div className="border-b border-surface-divider px-6 py-4">{extra}</div>}

      <div className="flex flex-col gap-2 p-6 sm:flex-row">
        <button onClick={onNext} className="btn-primary flex-1 justify-center">
          {nextLabel} <ArrowRight className="h-4 w-4" />
        </button>
        <Link to="/progress" className="btn-secondary flex-1 justify-center">
          <LineChart className="h-4 w-4" /> {ts('nav.progress', ui)}
        </Link>
      </div>
    </div>
  );
}
