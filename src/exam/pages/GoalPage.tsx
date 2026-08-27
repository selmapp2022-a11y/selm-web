import { useNavigate } from 'react-router-dom';
import { ChevronRight, Target } from 'lucide-react';
import clsx from 'clsx';
import { useExam, allTasks, sectionOf } from '../state';
import { GOALS } from '../definitions';
import { t } from '../model/format';

export default function GoalPage() {
  const { exam, goal, setGoal, ui, taskId, setTaskId, startSitting } = useExam();
  const nav = useNavigate();
  const tasks = allTasks(exam);
  const task = tasks.find((t) => t.id === taskId) ?? tasks[0];
  const sameSystem = goal.system === exam.benchmark.system;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold text-navy">
          {ui === 'en' ? 'Where are you going, and what do you need?' : 'Où allez-vous, et que vous faut-il ?'}
        </h1>
        <p className="mt-1 text-ink-secondary">
          {ui === 'en'
            ? 'The destination decides the required score. The exam is chosen from that, not the other way round.'
            : "La destination détermine la note exigée. L'examen en découle, et non l'inverse."}
        </p>
      </header>

      <section className="grid gap-3">
        {GOALS.map((g) => {
          const selected = g.id === goal.id;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => setGoal(g)}
              className={clsx(
                'flex w-full items-center justify-between gap-3 rounded-xl border-2 px-5 py-4 text-left text-sm font-medium transition-all',
                selected
                  ? 'border-teal bg-teal/10 text-navy shadow-card'
                  : 'border-surface-divider bg-white text-ink-secondary hover:border-navy/40 hover:bg-surface-muted'
              )}
            >
              <span>{t(g.label, ui)}</span>
              <span className="shrink-0 rounded-full bg-teal/10 px-2.5 py-0.5 text-xs font-bold text-teal">
                {g.system} {g.requiredLevel}
              </span>
            </button>
          );
        })}
      </section>

      <section className="card p-6">
        <span className="chip">{ui === 'en' ? 'Selected exam' : 'Examen choisi'}</span>
        <h2 className="mt-3 font-display text-xl font-bold text-navy">{t(exam.name, ui)}</h2>
        <p className="mt-1 text-sm text-ink-secondary">{t(exam.acceptedFor, ui)}</p>

        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="text-ink-secondary">{ui === 'en' ? 'Reports on' : 'Barème'}</dt>
          <dd className="text-right font-medium text-ink-primary">{t(exam.scales[0].label, ui)}</dd>
          <dt className="text-ink-secondary">{ui === 'en' ? 'Reads as' : 'Converti en'}</dt>
          <dd className="text-right font-medium text-ink-primary">{exam.benchmark.system}</dd>
          <dt className="text-ink-secondary">{ui === 'en' ? 'Your target' : 'Votre cible'}</dt>
          <dd className="text-right font-medium text-ink-primary">
            {sameSystem ? `${goal.system} ${goal.requiredLevel}` : '—'}
          </dd>
        </dl>

        {!sameSystem && (
          <p className="mt-4 rounded-xl bg-surface-muted px-4 py-3 text-xs leading-relaxed text-ink-secondary">
            {ui === 'en'
              ? `This exam reports in ${exam.benchmark.system} and the goal you picked is set in ${goal.system}. They are different scales; no conversion between them is shown because none is claimed.`
              : `Cet examen s'exprime en ${exam.benchmark.system} et l'objectif choisi est en ${goal.system}. Ce sont deux barèmes distincts ; aucune conversion n'est affichée car aucune n'est revendiquée.`}
          </p>
        )}
      </section>

      <section className="card p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-navy to-teal text-white shadow-md">
            <Target className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="chip">{ui === 'en' ? 'The task' : 'La tâche'}</span>
            <div className="mt-3 flex flex-wrap gap-2">
              {tasks.map((x) => (
                <button
                  key={x.id}
                  type="button"
                  onClick={() => setTaskId(x.id)}
                  className={clsx(
                    'rounded-xl border-2 px-4 py-2 text-sm font-medium transition-all',
                    x.id === task.id
                      ? 'border-teal bg-teal/10 text-navy'
                      : 'border-surface-divider bg-white text-ink-secondary hover:border-navy/40 hover:bg-surface-muted'
                  )}
                >
                  {t(sectionOf(exam, x.id).name, ui)} · {t(x.name, ui)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-ink-primary">{t(task.instruction, ui)}</p>
        <p className="mt-1 text-xs text-ink-secondary">
          {task.responseMode === 'audio'
            ? ui === 'en' ? 'Spoken response · recorded' : 'Réponse orale · enregistrée'
            : ui === 'en' ? 'Written response' : 'Réponse écrite'}
          {' · '}
          {Math.round(task.timeLimitSec / 60)} {ui === 'en' ? 'min' : 'min'}
          {task.preparationSec !== undefined && (
            <>
              {' · '}
              {task.preparationSec > 0
                ? ui === 'en'
                  ? `${Math.round(task.preparationSec / 60)} min to prepare`
                  : `${Math.round(task.preparationSec / 60)} min de préparation`
                : ui === 'en'
                  ? 'no preparation'
                  : 'sans préparation'}
            </>
          )}
        </p>
        {task.timeLimitApportioned && (
          <p className="mt-1 text-xs text-ink-secondary">
            {ui === 'en'
              ? `This exam publishes ${Math.round((sectionOf(exam, task.id).timeLimitSec ?? 0) / 60)} minutes for the whole section and no time per task. The figure above is our own even split, not the exam's rule.`
              : `Cet examen publie ${Math.round((sectionOf(exam, task.id).timeLimitSec ?? 0) / 60)} minutes pour l'ensemble de l'épreuve et aucun temps par tâche. La durée ci-dessus est notre propre répartition, et non une règle de l'examen.`}
          </p>
        )}

        <button onClick={() => nav('/task')} className="btn-primary mt-6 w-full">
          {ui === 'en' ? 'Start this task' : 'Commencer cette tâche'}
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* A whole sitting, not a task: four épreuves in the official order,
            with section boundaries that cannot be crossed backwards. It is
            the only thing that answers "am I ready to book", which is the
            question the candidate actually arrived with. */}
        {exam.sections.some((s) => s.kind === 'comprehension') && (
          <button
            onClick={() => {
              startSitting(exam);
              nav('/section');
            }}
            className="btn-secondary mt-2 w-full"
          >
            {ui === 'en'
              ? `Sit the whole exam — ${exam.sections.length} sections`
              : `Passer l'examen complet — ${exam.sections.length} épreuves`}
          </button>
        )}
      </section>
    </div>
  );
}
