import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Sparkles, TriangleAlert } from 'lucide-react';
import { useExam } from '../state';
import { t } from '../model/format';
import { loadPlan, daysUntil } from '../model/plan';
import { loadAttestations } from '../model/attestationStore';
import { buildPlan, shortfall } from '../engine/planner';

/**
 * STEP 6 — the plan is built, and teaching starts.
 *
 * The moment the whole entry flow exists for. Until now `buildPlan` was
 * exercised only by a check script; nothing rendered it. This is the screen
 * that reads the marks (or their absence), assembles a package from the
 * content that EXISTS, states the gap as a number, and says "you can start".
 *
 * Two rules from the spec that this screen must hold:
 *  - It never names a failed criterion. An attestation is four numbers; the
 *    script is never released. "Your writing is one level short" — yes.
 *    "Your morphosyntaxe was the problem" — impossible: the data to say it
 *    does not exist here.
 *  - A hole is shown, not filled. A coordinate with no content behind it says
 *    so, because a visible gap is a better failure than a generic lesson.
 */
export default function PlanPage() {
  const { exam, goal, ui } = useExam();
  const nav = useNavigate();

  const plan = useMemo(() => {
    const atts = loadAttestations()
      .filter((a) => a.examId === exam.id)
      .sort((a, b) => (a.sat < b.sat ? 1 : -1));
    const attestation = atts[0] ?? null;
    const daysLeft = daysUntil(loadPlan()?.examDate ?? null);
    return buildPlan({ exam, attestation, target: goal.requiredLevel, targetScaleId: goal.scaleId, daysLeft });
  }, [exam, goal]);

  const holes = shortfall(plan);
  const skillLabel = (id: string) => {
    const a = exam.awards.find((w) => w.skill === id);
    return a ? t(a.label, ui) : id;
  };
  const sys = exam.benchmark.system;

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <header>
        <div className="flex items-center gap-2 text-sm font-semibold text-teal">
          <Sparkles className="h-4 w-4" />
          {ui === 'en' ? 'Your study package is ready' : "Votre plan d'étude est prêt"}
        </div>
        <h1 className="mt-2 font-display text-3xl font-bold text-navy">
          {t(exam.name, ui)}
        </h1>
        <p className="mt-1 text-ink-secondary">
          {plan.basis === 'attestation'
            ? ui === 'en'
              ? 'Built from your real marks — a better start than any placement test, because it came from a real exam.'
              : "Construit à partir de vos vraies notes — un meilleur départ qu'un test de niveau, car il vient d'un examen réel."
            : ui === 'en'
              ? 'Built in exam order. Enter a past result any time and this reorders around your real marks.'
              : "Construit dans l'ordre de l'examen. Saisissez un résultat passé à tout moment et ceci se réorganise autour de vos vraies notes."}
        </p>
      </header>

      {/* The gap, as a number, per skill — worst first. */}
      {plan.order.length > 0 && (
        <section className="rounded-xl border-2 border-surface-divider bg-white p-5">
          <h2 className="text-sm font-semibold text-navy">
            {ui === 'en' ? 'Where the plan puts its effort, and why' : "Où le plan met l'effort, et pourquoi"}
          </h2>
          <p className="mt-1 text-xs text-ink-secondary">
            {ui === 'en'
              ? `Ordered by distance to your target of ${sys} ${goal.requiredLevel}. The governing level is the lowest of the four, so the strongest skills wait.`
              : `Classé par distance à votre cible de ${sys} ${goal.requiredLevel}. Le niveau qui compte est le plus bas des quatre : les compétences les plus fortes attendent.`}
          </p>
          <ul className="mt-3 space-y-2">
            {plan.order.map((o) => {
              const notSat = o.awarded === null;
              const gapText = notSat
                ? ui === 'en' ? 'not sat — a missing document, not a low mark' : 'non passée — un document manquant, pas une note basse'
                : o.gap !== null && o.gap > 0
                  ? ui === 'en' ? `you scored ${sys} ${o.awarded}, you need ${o.target} — ${o.gap} level${o.gap === 1 ? '' : 's'} short`
                                : `vous avez ${sys} ${o.awarded}, il vous faut ${o.target} — ${o.gap} niveau${o.gap === 1 ? '' : 'x'} à gagner`
                  : ui === 'en' ? `${sys} ${o.awarded} — at or above target` : `${sys} ${o.awarded} — à la cible ou au-dessus`;
              return (
                <li key={o.skill} className="flex items-start justify-between gap-3 rounded-lg bg-surface-muted px-3 py-2 text-sm">
                  <span className="font-medium text-navy">{skillLabel(o.skill)}</span>
                  <span className={notSat || (o.gap ?? 0) > 0 ? 'text-amber-700' : 'text-teal'}>{gapText}</span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* The package: the ordered slots, prescriptions attached, holes visible. */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-navy">
          {ui === 'en' ? `Your first ${plan.slots.length} sessions` : `Vos ${plan.slots.length} premières séances`}
        </h2>
        <ol className="space-y-2">
          {plan.slots.map((s) => {
            const hole = s.items === 0;
            return (
              <li
                key={s.n}
                className={
                  'flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm ' +
                  (hole ? 'border-dashed border-amber-300 bg-amber-50' : 'border-surface-divider bg-white')
                }
              >
                <div className="min-w-0">
                  <div className="font-medium text-navy">
                    <span className="mr-2 text-xs text-ink-secondary">{s.n}.</span>
                    {s.coordinate.label}
                  </div>
                  <div className="mt-0.5 text-xs text-ink-secondary">
                    {skillLabel(s.coordinate.skill)}
                    {s.prescription ? ` · ${s.prescription}` : ''}
                  </div>
                </div>
                {hole ? (
                  <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-amber-700">
                    <TriangleAlert className="h-3.5 w-3.5" />
                    {ui === 'en' ? 'not authored yet' : 'pas encore rédigé'}
                  </span>
                ) : (
                  <span className="shrink-0 text-xs text-ink-secondary">
                    {s.items} {ui === 'en' ? (s.items === 1 ? 'item' : 'items') : 'items'}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      {/* A hole is shown, not filled — the honest count. */}
      {holes.length > 0 && (
        <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
          {ui === 'en'
            ? `${holes.length} coordinate${holes.length === 1 ? '' : 's'} in your plan have no content authored behind them yet. They are shown, not hidden and not filled with a generic lesson — a visible gap is the honest state, and the signal for what to write next.`
            : `${holes.length} coordonnée${holes.length === 1 ? '' : 's'} de votre plan n'${holes.length === 1 ? 'a' : 'ont'} pas encore de contenu. Elles sont affichées, ni cachées ni comblées par une leçon générique — un manque visible est l'état honnête, et le signal de ce qu'il faut rédiger.`}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => { window.location.href = '/#/dashboard'; }}
          className="flex items-center gap-2 rounded-xl bg-navy px-6 py-3 text-sm font-semibold text-white"
        >
          <Check className="h-4 w-4" />
          {ui === 'en' ? 'You can start' : 'Vous pouvez commencer'}
        </button>
        <button
          type="button"
          onClick={() => nav('/attestation')}
          className="rounded-xl border-2 border-surface-divider px-5 py-3 text-sm font-medium text-ink-secondary"
        >
          {plan.basis === 'attestation'
            ? ui === 'en' ? 'Edit my result' : 'Modifier mon résultat'
            : ui === 'en' ? 'I have sat it — enter my scores' : "Je l'ai passé — saisir mes notes"}
        </button>
      </div>
    </div>
  );
}
