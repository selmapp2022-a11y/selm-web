import { useNavigate } from 'react-router-dom';
import { useExam } from '../state';
import { formatScale, t } from '../model/format';

const TONE: Record<string, string> = {
  zero: 'border-red-500/40 bg-red-500/5',
  penalty: 'border-amber-500/40 bg-amber-500/5',
  warn: 'border-surface-divider bg-surface-card',
};

export default function ResultPage() {
  const { result, goal, ui } = useExam();
  const nav = useNavigate();
  if (!result) {
    nav('/');
    return null;
  }
  const { exam, task, gate, judges, judgeAggregate, examScaleAggregate, benchmarkLevel, release, zeroedBy, overtimeSec } = result;
  const scored = judges.filter((j) => j.kind === 'scored') as Extract<(typeof judges)[number], { kind: 'scored' }>[];
  const judge = judges[0];
  const sameSystem = goal.system === exam.benchmark.system;

  return (
    <div className="space-y-5">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-disabled">
          {t(exam.name, ui)} · {t(task.name, ui)}
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          {ui === 'en' ? 'What this response actually did' : 'Ce que cette réponse a réellement fait'}
        </h1>
      </div>

      {/* ── 1. the deterministic layer — real for every exam ────────────── */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold">
          {ui === 'en' ? 'Deterministic checks' : 'Vérifications déterministes'}
          <span className="ml-2 rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal-600">
            {ui === 'en' ? 'measured' : 'mesuré'}
          </span>
        </h2>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            [ui === 'en' ? 'Words' : 'Mots', String(gate.measurements.wordCount)],
            [ui === 'en' ? 'From the prompt' : 'Repris de la consigne', `${Math.round(gate.measurements.promptOverlap * 100)}%`],
            [ui === 'en' ? 'From the structure' : 'Repris de la trame', `${Math.round(gate.measurements.scaffoldRatio * 100)}%`],
            [ui === 'en' ? 'Over time' : 'Temps dépassé', overtimeSec > 0 ? `${overtimeSec}s` : '—'],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl border border-surface-divider bg-surface-card p-3">
              <div className="font-display text-lg font-bold tabular-nums">{v}</div>
              <div className="text-[11px] leading-tight text-ink-secondary">{k}</div>
            </div>
          ))}
        </div>

        {gate.findings.length === 0 ? (
          <p className="rounded-xl border border-surface-divider bg-surface-card px-4 py-3 text-sm text-ink-secondary">
            {ui === 'en' ? 'No rule fired.' : "Aucune règle déclenchée."}
          </p>
        ) : (
          gate.findings.map((f) => (
            <div key={f.ruleId} className={`rounded-xl border px-4 py-3 ${TONE[f.kind]}`}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-semibold">{t(f.label, ui)}</span>
                <span className="shrink-0 text-xs tabular-nums text-ink-secondary">{f.measured}</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-ink-secondary">{t(f.detail, ui)}</p>
            </div>
          ))
        )}
      </section>

      {/* ── 2. the judge ───────────────────────────────────────────────── */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold">{ui === 'en' ? 'Criterion grid' : 'Grille de critères'}</h2>

        {zeroedBy ? (
          <p className="rounded-xl border border-surface-divider bg-surface-card px-4 py-3 text-sm text-ink-secondary">
            {ui === 'en'
              ? `Not sent to a judge: the response triggered "${t(zeroedBy, ui)}", which the official scheme awards nothing for. Paying to grade it would buy a number the exam board would never award.`
              : `Non transmis à un correcteur : la réponse a déclenché « ${t(zeroedBy, ui)} », à quoi le barème officiel n'accorde rien.`}
          </p>
        ) : scored.length ? (
          <div className="overflow-hidden rounded-xl border border-surface-divider bg-surface-card">
            <div className="border-b border-surface-divider bg-surface-muted px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-ink-secondary">
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
                <div key={c.id} className="flex items-center justify-between border-b border-surface-divider px-4 py-3 last:border-0">
                  <span className="text-sm">{t(c.label, ui)}</span>
                  <span className="flex items-baseline gap-2 text-sm font-semibold tabular-nums">
                    {vals.length ? vals.map((v) => formatScale(v, scored[0].scale, ui)).join(' · ') : '—'}
                    {spread > 0 && (
                      <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">
                        ±{spread}
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
            <p className="border-t border-surface-divider px-4 py-3 text-xs leading-relaxed text-ink-secondary">
              {t(scored[0].unmappedReason, ui)}
            </p>
            {judgeAggregate && judgeAggregate.judgeSpread > 0 && (
              <p className="border-t border-surface-divider bg-amber-500/5 px-4 py-3 text-xs leading-relaxed text-ink-secondary">
                {ui === 'en'
                  ? `Asked the same question ${judgeAggregate.judgeCount} times, this judge answered ${judgeAggregate.judgeSpread} points apart on identical text. A judge that does not agree with itself cannot be calibrated, and that is reported here rather than hidden behind an average.`
                  : `Interrogé ${judgeAggregate.judgeCount} fois sur le même texte, ce correcteur a répondu à ${judgeAggregate.judgeSpread} points d'écart. Un correcteur en désaccord avec lui-même ne peut pas être étalonné ; c'est signalé ici plutôt que masqué par une moyenne.`}
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-surface-divider bg-surface-card px-4 py-3">
            <p className="text-sm leading-relaxed text-ink-secondary">
              {judge?.kind === 'unavailable' ? t(judge.reason, ui) : '—'}
            </p>
            <div className="mt-3 space-y-1 opacity-40">
              {task.criteria.map((c) => (
                <div key={c.id} className="flex items-center justify-between text-sm">
                  <span>{t(c.label, ui)}</span>
                  <span className="tabular-nums">—</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── 3. the release gate ────────────────────────────────────────── */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold">{ui === 'en' ? 'Predicted score' : 'Note prédite'}</h2>
        <div className="rounded-xl border border-surface-divider bg-surface-card p-5">
          {release.publishNumeric && examScaleAggregate ? (
            <>
              <div className="font-display text-3xl font-bold">{formatScale(examScaleAggregate.point, result.scale, ui)}</div>
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
            <dd className="text-right font-medium tabular-nums">
              {release.evidence.samples} / {release.evidence.minSamples}
            </dd>
            <dt className="text-ink-secondary">{ui === 'en' ? 'Published error' : 'Erreur publiée'}</dt>
            <dd className="text-right font-medium tabular-nums">
              {release.evidence.mae ?? (ui === 'en' ? 'not measured' : 'non mesurée')} / ≤ {release.evidence.maxMae}
            </dd>
            <dt className="text-ink-secondary">{ui === 'en' ? 'Judges consulted' : 'Correcteurs consultés'}</dt>
            <dd className="text-right font-medium tabular-nums">{judgeAggregate?.judgeCount ?? 0}</dd>
          </dl>
        </div>
      </section>

      {/* ── 4. the decision ───────────────────────────────────────────── */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold">{ui === 'en' ? 'Should you book?' : 'Faut-il réserver ?'}</h2>
        <div className="rounded-xl border border-surface-divider bg-surface-card p-5">
          <div className="font-display text-lg font-semibold">
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
              <span className="font-semibold">
                {goal.system} {goal.requiredLevel}
              </span>
            </p>
          )}
        </div>
      </section>

      <button
        onClick={() => nav('/')}
        className="w-full rounded-xl border border-surface-divider px-4 py-3 text-sm font-semibold"
      >
        {ui === 'en' ? 'Run the same task under the other exam' : "Refaire la même tâche sous l'autre examen"}
      </button>
    </div>
  );
}
