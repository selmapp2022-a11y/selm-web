import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { useExam } from '../state';
import { scoreComprehension, governingLevel } from '../engine/comprehension';
import { ProgressBar } from '../components/SectionClock';
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
  const { exam, ui, sitting, endSitting, recordSitting } = useExam();
  const nav = useNavigate();

  if (!sitting) {
    return (
      <div className="card p-6">
        <p className="text-sm text-ink-primary">
          {ui === 'en' ? 'No sitting to report.' : 'Aucune session à restituer.'}
        </p>
      </div>
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

  // Record the sitting once, when the page first shows it. Recording on
  // "Finish" would lose the sitting of every candidate who closes the tab
  // after reading their result, which is most of them.
  const recorded = useRef(false);
  useEffect(() => {
    if (recorded.current || !sitting) return;
    recorded.current = true;
    const skills: Record<string, { correct: number; total: number; held: string | null } | null> = {};
    for (const r of comprehension) {
      skills[r.section.id] = { correct: r.correct, total: r.total, held: r.held };
    }
    // A production section has no result to record. It is stored as null
    // rather than omitted, so the history page can say "no result" instead of
    // silently leaving a gap that reads as a missing sitting.
    for (const s of production) skills[s.id] = null;
    recordSitting({ examId: exam.id, finishedAt: new Date().toISOString(), skills });
  }, [sitting, comprehension, production, exam.id, recordSitting]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold text-navy">
          {ui === 'en' ? 'Your sitting' : 'Votre session'}
        </h1>
        <p className="mt-1 text-ink-secondary">{t(exam.name, ui)}</p>
      </header>

      {/* ── comprehension: counted ─────────────────────────────────────── */}
      {comprehension.map((r) => (
        <section key={r.section.id} className="space-y-3">
          <h2 className="flex flex-wrap items-center gap-2 font-display text-xl font-bold text-navy">
            {t(r.section.name, ui)}
            <span className="rounded-full bg-teal/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-teal">
              {ui === 'en' ? 'counted' : 'compté'}
            </span>
          </h2>

          <div className="grid grid-cols-3 gap-3">
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

          <div className="card overflow-hidden">
            {r.byBand.map((b) => (
              <div
                key={b.band}
                className="flex items-center gap-3 border-b border-surface-divider px-6 py-3 last:border-0"
              >
                <span className="w-8 shrink-0 text-xs font-bold tabular-nums text-navy">{b.band}</span>
                <div className="flex-1"><ProgressBar value={b.correct} total={b.total} /></div>
                <span className="w-12 shrink-0 text-right text-xs tabular-nums text-ink-secondary">
                  {b.correct}/{b.total}
                </span>
              </div>
            ))}
          </div>

          <div className="card p-6">
            <p className="text-xs leading-relaxed text-ink-secondary">{t(r.scaleScoreReason, ui)}</p>
            <p className="mt-3 text-xs leading-relaxed text-ink-secondary">{t(r.section.provenance, ui)}</p>
          </div>
        </section>
      ))}

      {/* ── production: not scored ─────────────────────────────────────── */}
      {production.map((s) => (
        <section key={s.id} className="space-y-3">
          <h2 className="flex flex-wrap items-center gap-2 font-display text-xl font-bold text-navy">
            {t(s.name, ui)}
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-700">
              {ui === 'en' ? 'not scored' : 'non noté'}
            </span>
          </h2>
          <div className="card p-6">
            <p className="text-xs leading-relaxed text-ink-secondary">
              {s.tasks[0] && s.tasks[0].judge.kind === 'none'
                ? t(s.tasks[0].judge.reason, ui)
                : ui === 'en'
                  ? 'The deterministic checks ran; no calibrated scorer is bound to this section.'
                  : "Les vérifications déterministes ont été faites ; aucun correcteur étalonné n'est rattaché à cette épreuve."}
            </p>
          </div>
        </section>
      ))}

      {/* ── the governing level ────────────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="font-display text-xl font-bold text-navy">
          {ui === 'en' ? 'The level that governs' : 'Le niveau qui compte'}
        </h2>
        <div className="card p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-navy to-teal text-white shadow-md">
              <Trophy className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-2xl font-bold text-navy">
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
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button onClick={() => nav('/history')} className="btn-secondary flex-1">
          {ui === 'en' ? 'See your history' : 'Voir votre historique'}
        </button>
        <button
          onClick={() => {
            endSitting();
            nav('/goal');
          }}
          className="btn-primary flex-1"
        >
          {ui === 'en' ? 'Finish' : 'Terminer'}
        </button>
      </div>
    </div>
  );
}

function Tile({ value, label }: { value: string; label: string }) {
  return (
    <div className="card p-4">
      <div className="font-display text-lg font-bold tabular-nums text-navy">{value}</div>
      <div className="text-[11px] leading-tight text-ink-secondary">{label}</div>
    </div>
  );
}
