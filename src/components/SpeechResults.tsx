import type { SpeechAssessment } from '../lib/speaking';
import { scoreColor } from '../lib/speaking';
import { loadPlan } from '../exam/model/plan';
import clsx from 'clsx';
import { ts, tf, useUiLangValue } from '../i18n';

export function SpeechResults({ result }: { result: SpeechAssessment }) {
  const ui = useUiLangValue();
  const overall = scoreColor(result.overall_score);
  // The four labels below (Fluency & Coherence, Lexical Resource, Grammar &
  // Accuracy, Pronunciation) and the heading are IELTS's own criteria. They
  // must never render for a TCF (French) candidate even if the backend
  // erroneously attaches an `ielts` block — the exam decides, not the payload.
  const examIsIelts = loadPlan()?.examId === 'ielts-gt';
  const isIelts = examIsIelts && !!(result.ielts || (result.transcript && result.transcript.trim().length > 0));

  return (
    <div className="space-y-6">
      {/* Top scorecard */}
      <div className={clsx('card p-6 border-l-4', overall.border)}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-ink-secondary">{ts('sr.overall', ui)}</div>
            <div className={clsx('font-display text-5xl font-bold', overall.text)}>
              {result.overall_score}<span className="text-2xl text-ink-secondary">/100</span>
            </div>
            {result.ielts?.overall_band != null && (
              <div className="mt-1 text-sm text-ink-secondary">
                {ts('sr.ieltsBand', ui)} <strong className="text-navy">{result.ielts.overall_band}</strong>
                {result.ielts.cefr_level && <> · {ts('sr.cefr', ui)} <strong className="text-navy">{result.ielts.cefr_level}</strong></>}
              </div>
            )}
          </div>
          <div className="text-right text-sm">
            {result.fluency_score != null && (
              <div className="mb-1">{ts('sr.fluency', ui)} <strong className="text-navy">{result.fluency_score}</strong></div>
            )}
            {result.pace_score != null && (
              <div className="mb-1">{ts('sr.pace', ui)} <strong className="text-navy">{tf('sr.wpm', { n: result.pace_score }, ui)}</strong></div>
            )}
            {result.pause_count != null && (
              <div>{ts('sr.pauses', ui)} <strong className="text-navy">{result.pause_count}</strong></div>
            )}
          </div>
        </div>

        {result.filler_words && result.filler_words.length > 0 && (
          <div className="mt-4 text-sm">
            <span className="text-ink-secondary">{ts('sr.fillers', ui)} </span>
            {result.filler_words.map((w) => (
              <span key={w} className="chip mr-1.5 bg-amber-100 text-amber-700">{w}</span>
            ))}
          </div>
        )}

        {result.feedback && (
          <div className="mt-4 rounded-xl bg-surface-muted p-4 text-sm text-ink-primary">
            <strong className="text-navy">{ts('sr.coach', ui)} </strong>{result.feedback}
          </div>
        )}
      </div>

      {/* IELTS bands grid — only on free-form / mode=ielts */}
      {isIelts && result.ielts?.bands && (
        <div className="card p-6">
          <h4 className="mb-4 font-display text-lg font-bold text-navy">{ts('sr.bandBreakdown', ui)}</h4>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              [ts('sr.fluencyCoherence', ui), result.ielts.bands.fluencyCoherence],
              [ts('sr.lexicalResource', ui), result.ielts.bands.lexicalResource],
              [ts('sr.grammarAccuracy', ui), result.ielts.bands.grammarAccuracy],
              [ts('speaking.pronunciation', ui), result.ielts.bands.pronunciation],
            ].map(([label, b]) => {
              const band: any = b;
              const v = band?.band;
              return (
                <div key={String(label)} className="rounded-2xl border border-surface-divider bg-white p-4 text-center">
                  <div className="text-xs font-medium uppercase tracking-wider text-ink-secondary">{label as string}</div>
                  <div className="mt-1 font-display text-3xl font-bold text-navy">{v != null ? v : '—'}</div>
                  {band?.comment && <div className="mt-1 text-xs text-ink-secondary">{band.comment}</div>}
                </div>
              );
            })}
          </div>
          {(result.ielts.toefl_score_estimate != null || result.ielts.pte_score_estimate != null) && (
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-ink-secondary">
              {result.ielts.toefl_score_estimate != null && (
                <span className="chip bg-surface-muted">{ts('sr.toeflEst', ui)} <strong className="ml-1 text-navy">{result.ielts.toefl_score_estimate}</strong></span>
              )}
              {result.ielts.pte_score_estimate != null && (
                <span className="chip bg-surface-muted">{ts('sr.pteEst', ui)} <strong className="ml-1 text-navy">{result.ielts.pte_score_estimate}</strong></span>
              )}
            </div>
          )}
        </div>
      )}

      {/* What you said — full transcript */}
      {result.transcript && result.transcript.trim().length > 0 && (
        <div className="card p-6">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-display text-lg font-bold text-navy">{ts('sr.whatYouSaid', ui)}</h4>
            <span className="text-xs text-ink-secondary">{ts('sr.transcript', ui)}</span>
          </div>
          <p className="rounded-xl bg-surface-muted p-4 text-base leading-relaxed text-ink-primary">
            {result.transcript}
          </p>
        </div>
      )}

      {/* Tips */}
      {result.tips && result.tips.length > 0 && (
        <div className="card p-6">
          <h4 className="mb-3 font-display text-lg font-bold text-navy">{ts('sr.coachTips', ui)}</h4>
          <ul className="space-y-2 text-sm text-ink-primary">
            {result.tips.map((t, i) => (
              <li key={i} className="rounded-xl border-l-4 border-teal bg-teal/5 p-3">{t}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Grammar issues — original → suggestion */}
      {result.grammar_items && result.grammar_items.length > 0 && (
        <div className="card p-6">
          <h4 className="mb-3 font-display text-lg font-bold text-navy">{ts('sr.grammarFixes', ui)}</h4>
          <div className="space-y-3">
            {result.grammar_items.map((g, i) => (
              <div key={i} className="rounded-xl border-l-4 border-amber-400 bg-amber-50 p-3 text-sm">
                {g.type && <div className="mb-1 text-xs font-bold uppercase text-amber-700">{g.type}</div>}
                {g.original && (
                  <div className="line-through text-red-600">{g.original}</div>
                )}
                {g.suggestion && (
                  <div className="font-medium text-teal-700">→ {g.suggestion}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vocabulary upgrades */}
      {result.vocabulary_suggestions && result.vocabulary_suggestions.length > 0 && (
        <div className="card p-6">
          <h4 className="mb-3 font-display text-lg font-bold text-navy">{ts('sr.strongerWords', ui)}</h4>
          <p className="mb-3 text-xs text-ink-secondary">{ts('sr.strongerWordsHelp', ui)}</p>
          <div className="space-y-2">
            {result.vocabulary_suggestions.map((v, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2 rounded-xl bg-surface-muted p-3 text-sm">
                <span className="rounded-md bg-amber-100 px-2 py-1 font-medium text-amber-700">{v.word}</span>
                <span className="text-ink-secondary">→</span>
                {(v.suggestions || []).slice(0, 4).map((s, j) => (
                  <span key={j} className="rounded-md bg-teal/10 px-2 py-1 font-medium text-teal-700">{s.word}</span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pronunciation top errors with phoneme detail */}
      {result.pronunciation_top_errors && result.pronunciation_top_errors.length > 0 && (
        <div className="card p-6">
          <h4 className="mb-3 font-display text-lg font-bold text-navy">{ts('sr.soundsToPractise', ui)}</h4>
          <div className="space-y-3">
            {result.pronunciation_top_errors.map((p, i) => (
              <div key={i} className="rounded-xl bg-surface-muted p-3 text-sm">
                <div className="mb-1">
                  <span className="font-mono text-base text-navy">/{p.phoneme}/</span>
                  {p.count != null && <span className="ml-2 text-xs text-ink-secondary">{tf('sr.slipped', { n: p.count }, ui)}</span>}
                </div>
                {p.examples && p.examples.length > 0 && (
                  <div className="mt-1 text-xs text-ink-secondary">
                    {ts('sr.examples', ui)} {p.examples.map((e) => e.text).filter(Boolean).slice(0, 5).join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Word-by-word (mostly for Pronunciation tab where reference matched) */}
      {result.word_scores.length > 0 && (
        <div className="card p-6">
          <h4 className="mb-4 font-display text-lg font-bold text-navy">{ts('sr.wordByWord', ui)}</h4>
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
          <p className="mt-3 text-xs text-ink-secondary">{ts('sr.hoverHelp', ui)}</p>
        </div>
      )}
    </div>
  );
}
