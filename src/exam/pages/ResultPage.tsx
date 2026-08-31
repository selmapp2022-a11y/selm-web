import { Navigate, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useExam } from '../state';
import { readStability } from '../engine/stability';
import { formatScale, t } from '../model/format';

// The three tones a deterministic finding can carry, in the application's own
// alert colours — the pastel `bg-*-50 / border-*-200 / text-*-700` family that
// `global.css` already carries dark-mode overrides for.
const TONE: Record<string, string> = {
  zero: 'border-red-200 bg-red-50',
  penalty: 'border-amber-200 bg-amber-50',
  warn: 'border-surface-divider bg-surface-card',
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <div className="font-display text-lg font-bold tabular-nums text-navy">{value}</div>
      <div className="text-[11px] leading-tight text-ink-secondary">{label}</div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-teal/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-teal">
      {children}
    </span>
  );
}

export default function ResultPage() {
  const { result, goal, ui } = useExam();
  const nav = useNavigate();
  // ── A REDIRECT, NOT A CALL DURING RENDER ────────────────────────────
  // This was `nav('/me'); return null;` in the render body — a side effect
  // during render, which React does not promise to run once, and which left
  // the screen blank for a beat on the way out. It also pointed at the
  // account page: this is the result of a PRACTICE task, so when there is no
  // result the place to be is practice.
  if (!result) return <Navigate to="/practice" replace />;
  const { exam, task, signal, gate, judges, judgeAggregate, examScaleAggregate, benchmarkLevel, release, zeroedBy, overtimeSec } = result;
  const scored = judges.filter((j) => j.kind === 'scored') as Extract<(typeof judges)[number], { kind: 'scored' }>[];
  const judge = judges[0];
  const sameSystem = goal.system === exam.benchmark.system;

  return (
    <div className="space-y-8">
      <header>
        <span className="chip">
          {t(exam.name, ui)} · {t(task.name, ui)}
        </span>
        <h1 className="mt-3 font-display text-3xl font-bold text-navy">
          {ui === 'en' ? 'What this response actually did' : 'Ce que cette réponse a réellement fait'}
        </h1>
      </header>

      {/* ── 0. the signal layer — spoken responses only ──────────────── */}
      {task.responseMode === 'audio' && (
        <section className="space-y-3">
          <h2 className="flex flex-wrap items-center gap-2 font-display text-xl font-bold text-navy">
            {ui === 'en' ? 'What was heard' : "Ce qui a été entendu"}
            <Badge>{ui === 'en' ? 'measured' : 'mesuré'}</Badge>
          </h2>
          {signal.error ? (
            <div className="card p-6">
              <p className="text-sm text-ink-secondary">{t(signal.error, ui)}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  [ui === 'en' ? 'Recording' : 'Enregistrement', signal.durationSec ? `${signal.durationSec}s` : '—'],
                  [ui === 'en' ? 'Words per minute' : 'Mots par minute', signal.wpm !== null ? String(signal.wpm) : '—'],
                  ...signal.measures.map((m) => [t(m.label, ui), `${Math.round(m.value)} / ${m.outOf}`] as [string, string]),
                ].map(([k, v]) => (
                  <Stat key={k} label={k} value={v} />
                ))}
              </div>
              <div className="card p-6">
                <span className="chip">{ui === 'en' ? 'Transcript' : 'Transcription'}</span>
                <p className="mt-3 text-sm leading-relaxed text-ink-primary" lang={exam.locale}>
                  {signal.transcript || (ui === 'en' ? '(nothing transcribed)' : '(rien de transcrit)')}
                </p>
                <p className="mt-3 text-xs leading-relaxed text-ink-secondary">
                  {ui === 'en'
                    ? 'Everything below is measured against this transcript, not against the audio. A spoken response has no words to count until something transcribes it, so this step runs before the deterministic checks rather than after them.'
                    : "Tout ce qui suit est mesuré sur cette transcription, non sur l'audio. Une réponse orale n'a pas de mots à compter tant que rien ne la transcrit : cette étape précède donc les vérifications déterministes."}
                </p>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── 1. the deterministic layer — real for every exam ────────────── */}
      <section className="space-y-3">
        <h2 className="flex flex-wrap items-center gap-2 font-display text-xl font-bold text-navy">
          {ui === 'en' ? 'Deterministic checks' : 'Vérifications déterministes'}
          <Badge>{ui === 'en' ? 'measured' : 'mesuré'}</Badge>
        </h2>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            [ui === 'en' ? 'Words' : 'Mots', String(gate.measurements.wordCount)],
            [ui === 'en' ? 'From the prompt' : 'Repris de la consigne', `${Math.round(gate.measurements.promptOverlap * 100)}%`],
            [ui === 'en' ? 'From the structure' : 'Repris de la trame', `${Math.round(gate.measurements.scaffoldRatio * 100)}%`],
            [ui === 'en' ? 'Over time' : 'Temps dépassé', overtimeSec > 0 ? `${overtimeSec}s` : '—'],
          ].map(([k, v]) => (
            <Stat key={k} label={k} value={v} />
          ))}
        </div>

        {gate.findings.length === 0 ? (
          <div className="card p-6">
            <p className="text-sm text-ink-secondary">
              {ui === 'en' ? 'No rule fired.' : "Aucune règle déclenchée."}
            </p>
          </div>
        ) : (
          gate.findings.map((f) => (
            <div key={f.ruleId} className={clsx('rounded-2xl border p-6 shadow-card', TONE[f.kind])}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-display font-bold text-ink-primary">{t(f.label, ui)}</span>
                <span className="shrink-0 text-xs tabular-nums text-ink-secondary">{f.measured}</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-ink-secondary">{t(f.detail, ui)}</p>
            </div>
          ))
        )}
      </section>

      {/* ── 2. the judge ───────────────────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="font-display text-xl font-bold text-navy">
          {ui === 'en' ? 'Criterion grid' : 'Grille de critères'}
        </h2>

        {zeroedBy ? (
          <div className="card p-6">
            <p className="text-sm leading-relaxed text-ink-secondary">
              {ui === 'en'
                ? `Not sent to a judge: the response triggered "${t(zeroedBy, ui)}", which the official scheme awards nothing for. Paying to grade it would buy a number the exam board would never award.`
                : `Non transmis à un correcteur : la réponse a déclenché « ${t(zeroedBy, ui)} », à quoi le barème officiel n'accorde rien.`}
            </p>
          </div>
        ) : scored.length ? (
          <div className="card overflow-hidden">
            <div className="border-b border-surface-divider bg-surface-muted px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-ink-secondary">
              {t(scored[0].scale.label, ui)}
              {scored.length > 1 && (
                <span className="ml-2 font-normal normal-case tracking-normal">
                  {ui === 'en' ? `asked ${scored.length}×` : `interrogé ${scored.length}×`}
                </span>
              )}
            </div>
            {task.criteria.map((c) => {
              const vals = scored
                .map((j) => j.scores.find((x) => x.criterionId === c.id)?.value)
                .filter((v): v is number => typeof v === 'number');
              const spread = vals.length > 1 ? Math.max(...vals) - Math.min(...vals) : 0;
              return (
                <div key={c.id} className="flex items-center justify-between gap-3 border-b border-surface-divider px-6 py-3 last:border-0">
                  <span className="text-sm text-ink-primary">{t(c.label, ui)}</span>
                  <span className="flex items-baseline gap-2 text-sm font-bold tabular-nums text-navy">
                    {vals.length ? vals.map((v) => formatScale(v, scored[0].scale, ui)).join(' · ') : '—'}
                    {spread > 0 && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                        ±{spread}
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
            <p className="border-t border-surface-divider px-6 py-3 text-xs leading-relaxed text-ink-secondary">
              {t(scored[0].unmappedReason, ui)}
            </p>
            {(() => {
              // What this judge's repeatability was, and whether that figure
              // is still allowed to be quoted. A stale one reads as unknown.
              const reading = readStability(task.judge.kind === 'remote' ? task.judge.stability : undefined);
              if (reading.kind === 'valid') {
                return (
                  <p className="border-t border-surface-divider px-6 py-3 text-xs leading-relaxed text-ink-secondary">
                    {ui === 'en'
                      ? `Repeatability, measured ${reading.ageDays} days ago on ${reading.measuredAt}: across ${reading.record.responses} responses asked ${reading.record.callsPerResponse}× each, the worst single criterion moved ${reading.record.worstCriterionSpread} points. `
                      : `Répétabilité, mesurée il y a ${reading.ageDays} jours le ${reading.measuredAt} : sur ${reading.record.responses} réponses interrogées ${reading.record.callsPerResponse} fois chacune, le pire critère isolé a varié de ${reading.record.worstCriterionSpread} points. `}
                    {t(reading.record.note, ui)}
                  </p>
                );
              }
              return (
                <p className="border-t border-surface-divider bg-amber-50 px-6 py-3 text-xs leading-relaxed text-ink-secondary">
                  {t(reading.label, ui)}
                </p>
              );
            })()}
            {judgeAggregate && judgeAggregate.judgeSpread > 0 && (
              <p className="border-t border-surface-divider bg-amber-50 px-6 py-3 text-xs leading-relaxed text-ink-secondary">
                {ui === 'en'
                  ? `Asked the same question ${judgeAggregate.judgeCount} times, this judge answered ${judgeAggregate.judgeSpread} points apart on identical text. A judge that does not agree with itself cannot be calibrated, and that is reported here rather than hidden behind an average.`
                  : `Interrogé ${judgeAggregate.judgeCount} fois sur le même texte, ce correcteur a répondu à ${judgeAggregate.judgeSpread} points d'écart. Un correcteur en désaccord avec lui-même ne peut pas être étalonné ; c'est signalé ici plutôt que masqué par une moyenne.`}
              </p>
            )}
          </div>
        ) : (
          <div className="card p-6">
            <p className="text-sm leading-relaxed text-ink-secondary">
              {judge?.kind === 'unavailable' ? t(judge.reason, ui) : '—'}
            </p>
            <div className="mt-3 space-y-1 opacity-40">
              {task.criteria.map((c) => (
                <div key={c.id} className="flex items-center justify-between text-sm text-ink-primary">
                  <span>{t(c.label, ui)}</span>
                  <span className="tabular-nums">—</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── 3. the release gate ────────────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="font-display text-xl font-bold text-navy">
          {ui === 'en' ? 'Predicted score' : 'Note prédite'}
        </h2>
        <div className="card p-6">
          {examScaleAggregate && !release.publishNumeric ? (
            <>
              <div className="font-display text-2xl font-bold text-ink-secondary">
                {ui === 'en' ? 'Withheld' : 'Non communiquée'}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                {ui === 'en'
                  ? `The judge did answer on this exam's own scale — ${formatScale(examScaleAggregate.point, result.scale, ui)} — but that answer is not published as a prediction. `
                  : `Le correcteur a bien répondu sur le barème de cet examen — ${formatScale(examScaleAggregate.point, result.scale, ui)} — mais cette réponse n'est pas publiée comme prédiction. `}
                {t(release.reason, ui)}
              </p>
            </>
          ) : release.publishNumeric && examScaleAggregate ? (
            <>
              <div className="font-display text-3xl font-bold text-navy">{formatScale(examScaleAggregate.point, result.scale, ui)}</div>
              {benchmarkLevel !== null && (
                <div className="mt-1 text-sm text-ink-secondary">
                  {exam.benchmark.system} {benchmarkLevel}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="font-display text-2xl font-bold text-ink-secondary">
                {ui === 'en' ? 'Withheld' : 'Non communiquée'}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{t(release.reason, ui)}</p>
            </>
          )}

          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-surface-divider pt-4 text-xs">
            <dt className="text-ink-secondary">{ui === 'en' ? 'Score reports collected' : 'Attestations recueillies'}</dt>
            <dd className="text-right font-bold tabular-nums text-navy">
              {release.evidence.samples} / {release.evidence.minSamples}
            </dd>
            <dt className="text-ink-secondary">{ui === 'en' ? 'Published error' : 'Erreur publiée'}</dt>
            <dd className="text-right font-bold tabular-nums text-navy">
              {release.evidence.mae ?? (ui === 'en' ? 'not measured' : 'non mesurée')} / ≤ {release.evidence.maxMae}
            </dd>
            <dt className="text-ink-secondary">{ui === 'en' ? 'Judges consulted' : 'Correcteurs consultés'}</dt>
            <dd className="text-right font-bold tabular-nums text-navy">{judgeAggregate?.judgeCount ?? 0}</dd>
          </dl>
        </div>
      </section>

      {/* ── 4. the decision ───────────────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="font-display text-xl font-bold text-navy">
          {ui === 'en' ? 'Should you book?' : 'Faut-il réserver ?'}
        </h2>
        <div className="card p-6">
          <div className="font-display text-lg font-bold text-navy">
            {ui === 'en' ? 'Cannot be answered yet' : 'Impossible à trancher pour le moment'}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
            {ui === 'en'
              ? 'Advising you to book means accepting responsibility for the fee. That advice is only worth taking when it rests on a measured error against real score reports, and it does not yet.'
              : "Vous conseiller de réserver, c'est assumer la responsabilité des frais. Ce conseil ne vaut que s'il repose sur une erreur mesurée face à de vraies attestations, ce qui n'est pas encore le cas."}
          </p>
          {sameSystem && (
            <p className="mt-3 text-xs text-ink-secondary">
              {ui === 'en' ? 'Your target: ' : 'Votre cible : '}
              <span className="font-bold text-navy">
                {goal.system} {goal.requiredLevel}
              </span>
            </p>
          )}
        </div>
      </section>

      <button onClick={() => nav('/me')} className="btn-secondary w-full">
        {ui === 'en' ? 'Run the same task under the other exam' : "Refaire la même tâche sous l'autre examen"}
      </button>
    </div>
  );
}
