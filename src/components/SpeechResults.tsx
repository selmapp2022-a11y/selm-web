import type { SpeechAssessment } from '../lib/speaking';
import { scoreColor } from '../lib/speaking';
import clsx from 'clsx';

export function SpeechResults({ result }: { result: SpeechAssessment }) {
  const overall = scoreColor(result.overall_score);

  return (
    <div className="space-y-6">
      <div className={clsx('card p-6 border-l-4', overall.border)}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-ink-secondary">Overall</div>
            <div className={clsx('font-display text-5xl font-bold', overall.text)}>
              {result.overall_score}<span className="text-2xl text-ink-disabled">/100</span>
            </div>
          </div>
          <div className="text-right text-sm">
            {result.fluency_score != null && (
              <div className="mb-1">Fluency: <strong className="text-navy">{result.fluency_score}</strong></div>
            )}
            {result.pace_score != null && (
              <div className="mb-1">Pace: <strong className="text-navy">{result.pace_score} wpm</strong></div>
            )}
            {result.pause_count != null && (
              <div>Pauses: <strong className="text-navy">{result.pause_count}</strong></div>
            )}
          </div>
        </div>

        {result.filler_words && result.filler_words.length > 0 && (
          <div className="mt-4 text-sm">
            <span className="text-ink-secondary">Filler words detected: </span>
            {result.filler_words.map((w) => (
              <span key={w} className="chip mr-1.5 bg-amber-100 text-amber-700">{w}</span>
            ))}
          </div>
        )}

        {result.feedback && (
          <div className="mt-4 rounded-xl bg-surface-muted p-4 text-sm text-ink-primary">
            <strong className="text-navy">Coach: </strong>{result.feedback}
          </div>
        )}
      </div>

      {result.word_scores.length > 0 && (
        <div className="card p-6">
          <h4 className="mb-4 font-display text-lg font-bold text-navy">Word-by-word</h4>
          <div className="flex flex-wrap gap-2">
            {result.word_scores.map((w, i) => {
              const c = scoreColor(w.quality_score);
              return (
                <div key={i} className="group relative">
                  <span className={clsx('inline-flex items-center rounded-lg border px-3 py-1.5 text-sm font-medium', c.bg, c.text, c.border)}>
                    {w.word}
                    <span className="ml-2 text-xs opacity-70">{Math.round(w.quality_score)}</span>
                  </span>
                  {w.phonemes && w.phonemes.length > 0 && (
                    <div className="invisible absolute left-1/2 top-full z-10 mt-1 -translate-x-1/2 whitespace-nowrap rounded-lg bg-navy px-3 py-2 text-xs text-white shadow-lg group-hover:visible">
                      {w.phonemes.map((p, j) => {
                        const pc = p.quality_score >= 70 ? 'text-teal-300' : p.quality_score >= 50 ? 'text-amber-300' : 'text-red-300';
                        return (
                          <span key={j} className={clsx('mr-1.5', pc)}>
                            /{p.phoneme}/
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-ink-disabled">Hover any word to see phoneme-level scores.</p>
        </div>
      )}
    </div>
  );
}
