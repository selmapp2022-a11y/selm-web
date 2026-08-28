import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { useExam } from '../state';
import { GOALS } from '../definitions';
import { t } from '../model/format';
import { daysUntil, loadPlan, savePlan } from '../model/plan';

export default function GoalPage() {
  const { exam, goal, setGoal, ui } = useExam();
  const nav = useNavigate();

  // The requirement may be set on one of the exam's own scales — Australia
  // asks for IELTS 6, not a CLB level — or on a government benchmark. Only
  // the second case can disagree with the exam.
  const onExamScale = goal.scaleId ? exam.scales.some((sc) => sc.id === goal.scaleId) : false;
  const sameSystem = goal.scaleId ? onExamScale : goal.system === exam.benchmark.system;

  const [examDate, setExamDate] = useState<string>(() => loadPlan()?.examDate ?? '');
  const left = daysUntil(examDate || null);
  const commitDate = (v: string) => {
    setExamDate(v);
    savePlan({ goalId: goal.id, examId: exam.id, examDate: v || null, examLocale: exam.locale });
  };

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
              <span className="min-w-0">
                {t(g.label, ui)}
                <span className="mt-0.5 block text-xs font-normal text-ink-secondary">
                  {t(g.destination.label, ui)}
                </span>
              </span>
              <span className="shrink-0 rounded-full bg-teal/10 px-2.5 py-0.5 text-xs font-bold text-teal">
                {g.system} {g.requiredLevel}
              </span>
            </button>
          );
        })}
      </section>

      {/* The date. Not a nicety and not a reminder feature — it is the
          number the whole dashboard is arranged around, and until it is set
          the product can tell the candidate how they are doing but not
          whether they are on time. */}
      <section className="card p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-navy to-teal text-white shadow-md">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="chip">{ui === 'en' ? 'Your exam date' : 'Votre date d\u2019examen'}</span>
            <input
              type="date"
              value={examDate}
              onChange={(e) => commitDate(e.target.value)}
              className="input mt-3 w-full"
              aria-label={ui === 'en' ? 'Exam date' : 'Date de l\u2019examen'}
            />
            <p className="mt-2 text-xs leading-relaxed text-ink-secondary">
              {left === null
                ? ui === 'en'
                  ? 'Not booked yet is a normal answer. Leave it empty and everything else still works \u2014 you will see where you stand, just not how long you have.'
                  : "Pas encore r\u00e9serv\u00e9e est une r\u00e9ponse normale. Laissez vide : tout le reste fonctionne \u2014 vous verrez o\u00f9 vous en \u00eates, mais pas le temps qu\u2019il vous reste."
                : left >= 0
                  ? ui === 'en'
                    ? `${left} day${left === 1 ? '' : 's'} remaining.`
                    : `${left} jour${left === 1 ? '' : 's'} restant${left === 1 ? '' : 's'}.`
                  : ui === 'en'
                    ? 'That date has passed. Set the next one when you have it.'
                    : 'Cette date est pass\u00e9e. Indiquez la suivante quand vous l\u2019aurez.'}
            </p>
          </div>
        </div>
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
        <span className="chip">{ui === 'en' ? 'Already sat this exam?' : 'Déjà passé cet examen ?'}</span>
        <h2 className="mt-3 font-display text-xl font-bold text-navy">
          {ui === 'en' ? 'Enter a past result' : 'Saisir un résultat passé'}
        </h2>
        <p className="mt-1 text-sm text-ink-secondary">
          {ui === 'en'
            ? 'Your real marks build a better plan than any test we could give you. This page holds your exam, destination and date; your scores go in here.'
            : "Vos vraies notes bâtissent un meilleur plan que tout test. Cette page contient votre examen, votre destination et votre date ; vos notes se saisissent ici."}
        </p>
        <button onClick={() => nav('/attestation')} className="btn-primary mt-4">
          {ui === 'en' ? 'Enter my scores' : 'Saisir mes notes'}
          <ChevronRight className="h-4 w-4" />
        </button>
        <p className="mt-3 text-xs text-ink-secondary">
          {ui === 'en'
            ? 'To practise, or to sit a full mock exam, use Practice and Mock exam in the navigation.'
            : "Pour vous entraîner ou passer un examen blanc complet, utilisez Practice et Mock exam dans la navigation."}
        </p>
      </section>
    </div>
  );
}
