import { useNavigate } from 'react-router-dom';
import { useExam, allTasks, sectionOf } from '../state';
import { GOALS } from '../definitions';
import { t } from '../model/format';

export default function GoalPage() {
  const { exam, goal, setGoal, ui, taskId, setTaskId } = useExam();
  const nav = useNavigate();
  const tasks = allTasks(exam);
  const task = tasks.find((t) => t.id === taskId) ?? tasks[0];
  const sameSystem = goal.system === exam.benchmark.system;

  return (
    <div className="space-y-7">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          {ui === 'en' ? 'Where are you going, and what do you need?' : 'Où allez-vous, et que vous faut-il ?'}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
          {ui === 'en'
            ? 'The destination decides the required score. The exam is chosen from that, not the other way round.'
            : "La destination détermine la note exigée. L'examen en découle, et non l'inverse."}
        </p>
      </div>

      <section className="space-y-2">
        {GOALS.map((g) => (
          <button
            key={g.id}
            onClick={() => setGoal(g)}
            className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left ${
              g.id === goal.id ? 'border-teal bg-surface-card' : 'border-surface-divider bg-surface-card'
            }`}
          >
            <span className="text-sm font-medium">{t(g.label, ui)}</span>
            <span className="text-xs font-semibold text-ink-secondary">
              {g.system} {g.requiredLevel}
            </span>
          </button>
        ))}
      </section>

      <section className="rounded-xl border border-surface-divider bg-surface-card p-5">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-secondary">
          {ui === 'en' ? 'Selected exam' : 'Examen choisi'}
        </div>
        <div className="mt-1 font-display text-lg font-semibold">{t(exam.name, ui)}</div>
        <p className="mt-1 text-sm text-ink-secondary">{t(exam.acceptedFor, ui)}</p>

        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="text-ink-secondary">{ui === 'en' ? 'Reports on' : 'Barème'}</dt>
          <dd className="text-right font-medium">{t(exam.scales[0].label, ui)}</dd>
          <dt className="text-ink-secondary">{ui === 'en' ? 'Reads as' : 'Converti en'}</dt>
          <dd className="text-right font-medium">{exam.benchmark.system}</dd>
          <dt className="text-ink-secondary">{ui === 'en' ? 'Your target' : 'Votre cible'}</dt>
          <dd className="text-right font-medium">
            {sameSystem ? `${goal.system} ${goal.requiredLevel}` : '—'}
          </dd>
        </dl>

        {!sameSystem && (
          <p className="mt-3 rounded-lg bg-surface-muted px-3 py-2 text-xs leading-relaxed text-ink-secondary">
            {ui === 'en'
              ? `This exam reports in ${exam.benchmark.system} and the goal you picked is set in ${goal.system}. They are different scales; no conversion between them is shown because none is claimed.`
              : `Cet examen s'exprime en ${exam.benchmark.system} et l'objectif choisi est en ${goal.system}. Ce sont deux barèmes distincts ; aucune conversion n'est affichée car aucune n'est revendiquée.`}
          </p>
        )}
      </section>

      <section className="rounded-xl border border-surface-divider bg-surface-card p-5">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-secondary">
          {ui === 'en' ? 'The task' : 'La tâche'}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {tasks.map((x) => (
            <button
              key={x.id}
              onClick={() => setTaskId(x.id)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                x.id === task.id ? 'border-teal bg-teal-50 text-navy' : 'border-surface-divider bg-surface-app'
              }`}
            >
              {t(sectionOf(exam, x.id).name, ui)} · {t(x.name, ui)}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-ink-secondary">{t(task.instruction, ui)}</p>
        <p className="mt-1 text-xs text-ink-secondary">
          {task.responseMode === 'audio'
            ? ui === 'en' ? 'Spoken response · recorded' : 'Réponse orale · enregistrée'
            : ui === 'en' ? 'Written response' : 'Réponse écrite'}
          {' · '}
          {Math.round(task.timeLimitSec / 60)} {ui === 'en' ? 'min' : 'min'}
        </p>
        <button
          onClick={() => nav('/task')}
          className="mt-4 w-full rounded-xl bg-navy px-4 py-3 text-sm font-semibold text-white"
        >
          {ui === 'en' ? 'Start under exam conditions' : "Commencer en conditions d'examen"}
        </button>
      </section>
    </div>
  );
}
