import { useNavigate } from 'react-router-dom';
import { useExam } from '../state';
import { t } from '../model/format';

/**
 * Score over time, per skill, against the target line.
 *
 * A single sitting is worth little. What makes the second purchase rational —
 * and what makes the "not yet" verdict bearable — is seeing the line move.
 *
 * Two rules carried over from the results page, because a history screen is
 * the easiest place in a product to start flattering:
 *
 *   - a skill with no level shows no level, and does not borrow one from a
 *     neighbouring sitting or from the average
 *   - the governing level is the lowest of the four, every time it is shown
 */
export default function HistoryPage() {
  const { exam, ui, goal, history, clearHistory } = useExam();
  const nav = useNavigate();

  const mine = history.filter((h) => h.examId === exam.id);

  if (mine.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-xl font-bold">
          {ui === 'en' ? 'Your history' : 'Votre historique'}
        </h1>
        <p className="rounded-xl border border-surface-divider bg-surface-card px-4 py-3 text-sm leading-relaxed text-ink-secondary">
          {ui === 'en'
            ? 'Nothing here yet. A single sitting says very little — what is worth looking at is the second one, and the fifth. Sit the exam and this page starts to mean something.'
            : "Rien ici pour l'instant. Une seule session ne dit pas grand-chose — ce qui compte, c'est la deuxième, et la cinquième. Passez l'examen et cette page commencera à avoir du sens."}
        </p>
        <button
          onClick={() => nav('/')}
          className="w-full rounded-xl bg-navy px-4 py-3 text-sm font-semibold text-white"
        >
          {ui === 'en' ? 'Go to the exam' : "Aller à l'examen"}
        </button>
      </div>
    );
  }

  // Every skill that has ever appeared, in the exam's own section order.
  const skills = exam.sections.map((s) => ({ id: s.id, name: s.name }));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-xl font-bold">
          {ui === 'en' ? 'Your history' : 'Votre historique'}
        </h1>
        <p className="mt-1 text-sm text-ink-secondary">
          {ui === 'en'
            ? `${mine.length} ${mine.length === 1 ? 'sitting' : 'sittings'} · target ${goal.system} ${goal.requiredLevel}`
            : `${mine.length} ${mine.length === 1 ? 'session' : 'sessions'} · objectif ${goal.system} ${goal.requiredLevel}`}
        </p>
      </header>

      {skills.map((sk) => {
        const points = mine.map((h) => ({
          at: h.finishedAt,
          v: h.skills[sk.id] ?? null,
        }));
        const known = points.filter((p) => p.v !== null) as Array<{ at: string; v: { correct: number; total: number; held: string | null } }>;
        return (
          <section key={sk.id} className="space-y-2">
            <h2 className="text-sm font-semibold">{t(sk.name, ui)}</h2>
            {known.length === 0 ? (
              <p className="rounded-xl border border-surface-divider bg-surface-card px-4 py-3 text-xs leading-relaxed text-ink-secondary">
                {ui === 'en'
                  ? 'No result recorded for this skill. It is not shown as zero and it is not filled in from the others.'
                  : "Aucun résultat enregistré pour cette compétence. Elle n'est ni affichée comme zéro, ni déduite des autres."}
              </p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-surface-divider bg-surface-card">
                {known.map((p, i) => {
                  const prev = i > 0 ? known[i - 1].v : null;
                  const delta = prev ? p.v.correct - prev.correct : null;
                  return (
                    <div
                      key={p.at}
                      className="flex items-center gap-3 border-b border-surface-divider px-4 py-2 last:border-0"
                    >
                      <span className="w-24 shrink-0 text-xs tabular-nums text-ink-secondary">
                        {p.at.slice(0, 10)}
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted">
                        <div
                          className="h-full rounded-full bg-teal"
                          style={{ width: `${Math.round((p.v.correct / p.v.total) * 100)}%` }}
                        />
                      </div>
                      <span className="w-14 shrink-0 text-right text-xs tabular-nums">
                        {p.v.correct}/{p.v.total}
                      </span>
                      <span className="w-10 shrink-0 text-right text-xs font-semibold">
                        {p.v.held ?? '—'}
                      </span>
                      <span
                        className={`w-10 shrink-0 text-right text-xs tabular-nums ${
                          delta === null ? 'text-ink-secondary' : delta > 0 ? 'text-teal-700' : delta < 0 ? 'text-amber-700' : 'text-ink-secondary'
                        }`}
                      >
                        {delta === null ? '' : delta > 0 ? `+${delta}` : delta}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}

      <p className="rounded-xl border border-surface-divider bg-surface-card px-4 py-3 text-xs leading-relaxed text-ink-secondary">
        {ui === 'en'
          ? 'The bars are correct answers out of the section total, and the letter is the highest difficulty band held. Neither is a TCF score: the official conversion from correct answers to the exam scale is not published and varies between versions of the exam.'
          : "Les barres indiquent les bonnes réponses sur le total de l'épreuve, et la lettre le niveau de difficulté le plus élevé tenu. Ni l'une ni l'autre n'est un score TCF : la conversion officielle n'est pas publiée et varie selon la version de l'épreuve."}
      </p>

      <button
        onClick={() => {
          if (confirm(ui === 'en' ? 'Delete every sitting stored on this device?' : 'Supprimer toutes les sessions enregistrées sur cet appareil ?')) {
            clearHistory();
          }
        }}
        className="w-full rounded-xl border border-surface-divider px-4 py-3 text-sm font-semibold"
      >
        {ui === 'en' ? 'Delete my history' : 'Supprimer mon historique'}
      </button>
    </div>
  );
}
