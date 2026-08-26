import { useNavigate } from 'react-router-dom';
import { useExam } from '../state';
import { scoreComprehension, governingLevel } from '../engine/comprehension';
import { t } from '../model/format';
import type { ComprehensionSection, ProductionSection } from '../model/types';

/**
 * The result of a whole sitting: four skills, and — the part that matters —
 * three different KINDS of number, each labelled as what it is.
 *
 *   comprehension  a count, exact, and ours
 *   difficulty     a band, exact, and ours
 *   production     nothing yet, because the release gate refuses to publish a
 *                  number this exam has no calibration for
 *
 * And the governing level, which is the lowest of the four, because that is
 * the one IRCC reads. A page that shows four numbers without showing that one
 * is showing the candidate a better result than they hold.
 */
export default function SittingResultPage() {
  const { exam, ui, sitting, endSitting } = useExam();
  const nav = useNavigate();

  if (!sitting) {
    return (
      <p className="rounded-xl border border-surface-divider bg-surface-card px-4 py-3 text-sm">
        {ui === 'en' ? 'No sitting to report.' : 'Aucune session à restituer.'}
      </p>
    );
  }

  const comprehension = exam.sections
    .filter((s): s is ComprehensionSection => s.kind === 'comprehension')
    .map((s) => {
      const given = sitting.answers[s.id] ?? {};
      return scoreComprehension(
        s,
        s.items.map((i) => ({ itemId: i.id, chose: given[i.id] ?? null }))
      );
    });

  const production = exam.sections.filter((s): s is ProductionSection => s.kind === 'production');

  // Every skill's benchmark level. Comprehension has none because the official
  // conversion is unpublished; production has none because the release gate
  // refuses. Four nulls is the honest state of this exam today.
  const levels: Array<number | null> = [
    ...comprehension.map(() => null),
    ...production.map(() => null),
  ];
  const governing = governingLevel(levels);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-xl font-bold">
          {ui === 'en' ? 'Your sitting' : 'Votre session'}
        </h1>
        <p className="mt-1 text-sm text-ink-secondary">{t(exam.name, ui)}</p>
      </header>

      {/* ── comprehension: counted ─────────────────────────────────────── */}
      {comprehension.map((r) => (
        <section key={r.section.id} className="space-y-2">
          <h2 className="text-sm font-semibold">
            {t(r.section.name, ui)}
            <span className="ml-2 rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-navy">
              {ui === 'en' ? 'counted' : 'compté'}
            </span>
          </h2>

          <div className="grid grid-cols-3 gap-2">
            <Tile
              value={`${r.correct}/${r.total}`}
              label={ui === 'en' ? 'Correct' : 'Bonnes réponses'}
            />
            <Tile
              value={r.held ?? '—'}
              label={ui === 'en' ? 'Held through' : "Tenu jusqu'à"}
            />
            <Tile
              value={r.breaksAt ?? '—'}
              label={ui === 'en' ? 'Broke down at' : 'A cédé à'}
            />
          </div>

          <div className="overflow-hidden rounded-xl border border-surface-divider bg-surface-card">
            {r.byBand.map((b) => (
              <div
                key={b.band}
                className="flex items-center gap-3 border-b border-surface-divider px-4 py-2 last:border-0"
              >
                <span className="w-8 text-xs font-semibold tabular-nums">{b.band}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className="h-full rounded-full bg-teal"
                    style={{ width: `${Math.round((b.correct / b.total) * 100)}%` }}
                  />
                </div>
                <span className="w-12 text-right text-xs tabular-nums text-ink-secondary">
                  {b.correct}/{b.total}
                </span>
              </div>
            ))}
          </div>

          <p className="rounded-xl border border-surface-divider bg-surface-card px-4 py-3 text-xs leading-relaxed text-ink-secondary">
            {t(r.scaleScoreReason, ui)}
          </p>
          <p className="px-1 text-[11px] leading-relaxed text-ink-secondary">
            {t(r.section.provenance, ui)}
          </p>
        </section>
      ))}

      {/* ── production: not scored ─────────────────────────────────────── */}
      {production.map((s) => (
        <section key={s.id} className="space-y-2">
          <h2 className="text-sm font-semibold">
            {t(s.name, ui)}
            <span className="ml-2 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
              {ui === 'en' ? 'not scored' : 'non noté'}
            </span>
          </h2>
          <p className="rounded-xl border border-surface-divider bg-surface-card px-4 py-3 text-xs leading-relaxed text-ink-secondary">
            {s.tasks[0] && s.tasks[0].judge.kind === 'none'
              ? t(s.tasks[0].judge.reason, ui)
              : ui === 'en'
                ? 'The deterministic checks ran; no calibrated scorer is bound to this section.'
                : "Les vérifications déterministes ont été faites ; aucun correcteur étalonné n'est rattaché à cette épreuve."}
          </p>
        </section>
      ))}

      {/* ── the governing level ────────────────────────────────────────── */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold">
          {ui === 'en' ? 'The level that governs' : 'Le niveau qui compte'}
        </h2>
        <div className="rounded-xl border border-surface-divider bg-surface-card px-4 py-4">
          <p className="font-display text-2xl font-bold">
            {governing.complete ? `${exam.benchmark.system} ${governing.level}` : '—'}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-ink-secondary">
            {ui === 'en'
              ? 'Immigration reads the lowest of your four skills, not the average — a candidate at NCLC 8, 8, 8 and 5 is at NCLC 5. '
              : "L'immigration retient le plus bas de vos quatre niveaux, pas la moyenne — à 8, 8, 8 et 5, on est à NCLC 5. "}
            {!governing.complete &&
              (ui === 'en'
                ? 'No governing level is shown here, because not every skill has one yet. Taking the lowest of the skills that do have one would show you a better result than you hold.'
                : "Aucun niveau global n'est affiché ici, car toutes les compétences n'en ont pas encore un. Retenir le plus bas de celles qui en ont donnerait un résultat meilleur que le vôtre.")}
          </p>
        </div>
      </section>

      <button
        onClick={() => {
          endSitting();
          nav('/');
        }}
        className="w-full rounded-xl border border-surface-divider px-4 py-3 text-sm font-semibold"
      >
        {ui === 'en' ? 'Finish' : 'Terminer'}
      </button>
    </div>
  );
}

function Tile({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-surface-divider bg-surface-card p-3">
      <div className="font-display text-lg font-bold tabular-nums">{value}</div>
      <div className="text-[11px] leading-tight text-ink-secondary">{label}</div>
    </div>
  );
}
