import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, ChevronRight, Flag } from 'lucide-react';
import { Board, BoardGrid, Panel } from '../../components/Board';
import { useExam } from '../state';
import { GOALS } from '../definitions';
import { t } from '../model/format';
import { daysUntil, loadPlan, savePlan } from '../model/plan';
import { fmtDate, localeTag } from '../../i18n';

/**
 * THE EXAM SECTION OF `/me`.
 *
 * This was `GoalPage`, a top-level destination at `/goal` with a tab of its
 * own. The IA ruling of 30 August folds it into `You`: *"Drop `My exam` into
 * `You` … `Progress` folds into `You`, which holds the numbers alongside the
 * goal they are measured against."* The page's own `<h1>` went with the route
 * — a section inside a page does not get to be a page heading — and everything
 * below it is unchanged, including the two notes explaining why it says what
 * it says.
 */
export function ExamGoal() {
  const { exam, goal, setGoal, ui } = useExam();
  const nav = useNavigate();

  // The requirement may be set on one of the exam's own scales — Australia
  // asks for IELTS 6, not a CLB level — or on a government benchmark. Only
  // the second case can disagree with the exam.
  const onExamScale = goal.scaleId ? exam.scales.some((sc) => sc.id === goal.scaleId) : false;
  const sameSystem = goal.scaleId ? onExamScale : goal.system === exam.benchmark.system;

  /**
   * The other destinations that are sat on THIS SAME PAPER.
   *
   * ── The confusion this exists for ───────────────────────────────────────
   * Found by the founder on 2026-08-29. He switched destination three times —
   * Express Entry CLB 9, Canadian citizenship, Australia Competent English —
   * opened Writing after each, and got the identical Task 1 every time. He
   * reported it as the practice repeating, which is exactly what it looks
   * like from the outside.
   *
   * It is not a repeat. Those three destinations are all sat on IELTS General
   * Training; only the French category uses a different exam. So the paper is
   * the same because THE PAPER IS THE SAME, and a candidate cannot be expected
   * to deduce that from four rows in a list.
   *
   * The page already named the selected exam. Naming it was not enough: it
   * answered "which exam is this?" and the question in front of the candidate
   * was "why did nothing change?".
   *
   * ── And the first version of this note was wrong ────────────────────────
   * It said the destination changes the score you need "and not the
   * questions". That was true when it was written and false hours later: the
   * same day, practice began serving at the band the destination requires, so
   * CLB 9 and CLB 4 now meet different passages out of the one bank. Left
   * alone it would have been a sentence on the deployed product contradicting
   * what the product does — which is the failure this page exists to prevent.
   *
   * Built from the goal data rather than written out, so a fifth destination
   * added tomorrow appears here without anyone remembering to edit a sentence.
   */
  const sharingThisExam = GOALS.filter((g) => g.id !== goal.id && g.exams.includes(exam.id));

  const [examDate, setExamDate] = useState<string>(() => loadPlan()?.examDate ?? '');
  const [dateRejected, setDateRejected] = useState(false);
  const left = daysUntil(examDate || null);

  /**
   * Store the exam date, and ONLY a date this application can read back.
   *
   * ── The defect this exists for ──────────────────────────────────────────
   * Found on 29 August 2026 by typing into this field on the deployed build.
   * A browser date input accepts years far beyond four digits, so a slip of
   * one keystroke produced `202610-12-15`. `savePlan` wrote it. `daysUntil`
   * requires `\d{4}-\d{2}-\d{2}` and returned null for it. Today then said
   * **"No exam date set"** while this page still displayed a date.
   *
   * Nothing raised, nothing was said, and the candidate's countdown — the one
   * number on this product that is both certain and the reason they are here —
   * simply vanished. A wrong date is recoverable because the candidate can see
   * it; a date the app cannot read looks identical to never having entered one.
   *
   * So the window is stated twice: `min`/`max` on the field, so the browser
   * refuses out of range, and this guard, because an attribute is a request
   * and this is the promise.
   */
  const commitDate = (v: string) => {
    setExamDate(v);
    if (v && daysUntil(v) === null) {
      // Keep what they typed on screen so they can correct it, and do not
      // store something that would read back as no date at all.
      setDateRejected(true);
      return;
    }
    setDateRejected(false);
    savePlan({ goalId: goal.id, examId: exam.id, examDate: v || null, examLocale: exam.locale });
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="font-display text-lg font-semibold text-navy">
          {ui === 'en' ? 'Where are you going, and what do you need?' : 'Où allez-vous, et que vous faut-il ?'}
        </p>
        <p className="mt-1 text-ink-secondary">
          {ui === 'en'
            ? 'The destination decides the required score. The exam is chosen from that, not the other way round.'
            : "La destination détermine la note exigée. L'examen en découle, et non l'inverse."}
        </p>
      </header>

      {/* ── THE DESTINATIONS, IN THE APP'S ONE BOARD SHAPE ─────────────────
          These were full-width rows with a 2px border and a right-hand chip —
          a third card shape, on the third tab, for a set of peer choices that
          Today and Practice both draw as a grid of tiles. The founder, 31
          August: *"on every page the boards must be one size and one shape."*
          The required level keeps its chip; it moved to the corner because
          that is where a Board carries a badge. See `components/Board.tsx`. */}
      <BoardGrid>
        {GOALS.map((g) => (
          <Board
            key={g.id}
            onClick={() => setGoal(g)}
            selected={g.id === goal.id}
            icon={Flag}
            iconClass={g.id === goal.id ? 'bg-gradient-to-br from-navy to-teal' : 'bg-slate-400 dark:bg-slate-600'}
            tint={g.id === goal.id ? 'bg-teal/10' : undefined}
            title={t(g.label, ui)}
            badge={`${g.system} ${g.requiredLevel}`}
            meta={t(g.destination.label, ui)}
          />
        ))}
      </BoardGrid>

      {/* The date. Not a nicety and not a reminder feature — it is the
          number the whole dashboard is arranged around, and until it is set
          the product can tell the candidate how they are doing but not
          whether they are on time. */}
      <Panel>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-navy to-teal text-white shadow-md">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="chip">{ui === 'en' ? 'Your exam date' : 'Votre date d\u2019examen'}</span>
            {/* `lang` is not decoration. Chrome renders a date field in the
                numbering system of ITS OWN UI locale, so on a Persian-locale
                browser this showed `۲۰۲۶/۱۲/dd` inside an English page —
                found by using the app, not by reading it. The attribute is
                what pins the field to the language the candidate chose. */}
            <input
              type="date"
              lang={localeTag(ui)}
              min="2000-01-01"
              max="2100-12-31"
              value={examDate}
              onChange={(e) => commitDate(e.target.value)}
              className="input mt-3 w-full"
              aria-label={ui === 'en' ? 'Exam date' : 'Date de l’examen'}
            />
            {/* The field itself is drawn by the browser, which renders its
                digits in the OPERATING SYSTEM's numbering — on a Persian-locale
                Mac it shows `۲۰۲۶/۱۰/۱۵` inside an English page, and neither
                `lang` nor `<html lang>` overrides that. This line is the app
                saying the date back in the language the candidate chose, so
                what is stored is never in doubt. */}
            {!dateRejected && examDate && left !== null && (
              <p className="mt-2 text-sm font-semibold text-navy">{fmtDate(`${examDate}T00:00:00`, ui)}</p>
            )}
            {dateRejected && (
              <p className="mt-2 text-sm font-semibold text-amber-600">
                {ui === 'en'
                  ? 'That is not a date this app can read, so it has not been saved. Check the year.'
                  : "Cette date n’est pas lisible par l’application : elle n’a pas été enregistrée. Vérifiez l’année."}
              </p>
            )}
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
      </Panel>

      <Panel>
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

        {sharingThisExam.length > 0 && (
          <p className="mt-4 rounded-xl bg-surface-muted px-4 py-3 text-xs leading-relaxed text-ink-secondary">
            {ui === 'en' ? (
              <>
                {sharingThisExam.map((g) => t(g.label, ui)).join(sharingThisExam.length > 2 ? ', ' : ' and ')}
                {sharingThisExam.length === 1 ? ' is' : ' are'} sat on this same paper — the same
                sections, the same task types, the same bank. What changes with your destination is
                the level you need — yours is {goal.system} {goal.requiredLevel}, theirs{' '}
                {sharingThisExam.map((g) => `${g.system} ${g.requiredLevel}`).join(', ')} — and
                practice follows it: you are served material at your band, not at the bottom of the
                bank. So the exam is shared and the work is not.
              </>
            ) : (
              <>
                {sharingThisExam.map((g) => t(g.label, ui)).join(' et ')} se passe
                {sharingThisExam.length === 1 ? '' : 'nt'} sur cette même épreuve — mêmes sections,
                mêmes types de tâches, même banque. Ce que la destination change, c’est le niveau
                exigé — le vôtre est {goal.system} {goal.requiredLevel}, le leur{' '}
                {sharingThisExam.map((g) => `${g.system} ${g.requiredLevel}`).join(', ')} — et
                l’entraînement le suit : on vous sert du matériel à votre niveau, pas au bas de la
                banque. L’examen est commun ; le travail ne l’est pas.
              </>
            )}
          </p>
        )}

        {!sameSystem && (
          <p className="mt-4 rounded-xl bg-surface-muted px-4 py-3 text-xs leading-relaxed text-ink-secondary">
            {ui === 'en'
              ? `This exam reports in ${exam.benchmark.system} and the goal you picked is set in ${goal.system}. They are different scales; no conversion between them is shown because none is claimed.`
              : `Cet examen s'exprime en ${exam.benchmark.system} et l'objectif choisi est en ${goal.system}. Ce sont deux barèmes distincts ; aucune conversion n'est affichée car aucune n'est revendiquée.`}
          </p>
        )}
      </Panel>

      <Panel>
        <span className="chip">{ui === 'en' ? 'Already sat this exam?' : 'Déjà passé cet examen ?'}</span>
        {/* Copy rule 1 — no sentence twice on one screen — applies inside a
            card as well as across one. The heading names the thing; the
            button is the only place the CTA's words appear. */}
        <h2 className="mt-3 font-display text-xl font-bold text-navy">
          {ui === 'en' ? 'Your past results' : 'Vos résultats passés'}
        </h2>
        <p className="mt-1 text-sm text-ink-secondary">
          {ui === 'en'
            ? 'Your real marks build a better plan than any test we could give you. This page holds your exam, destination and date; your scores go in here.'
            : "Vos vraies notes bâtissent un meilleur plan que tout test. Cette page contient votre examen, votre destination et votre date ; vos notes se saisissent ici."}
        </p>
        {/* D3 — the heading above says "Enter a past result" and this button
            said "Enter my scores". Two labels, one action, one card: a
            candidate reading them as two things is reading them correctly,
            because that is how they were written. The button now carries the
            same words as the heading, and this is the only place in the app
            they appear. */}
        <button onClick={() => nav('/attestation')} className="btn-primary mt-4">
          {ui === 'en' ? 'Enter a past result' : 'Saisir un résultat passé'}
          <ChevronRight className="h-4 w-4" />
        </button>
        {/* Deleted 31 August: "To practise, or to sit a full mock exam, use
            Practice and Mock exam in the navigation."

            A page that has to explain the navigation in prose is the
            navigation reporting its own failure. Both are one tap away in the
            tab bar on every screen, and a sentence pointing at them says only
            that we did not trust the tab bar. */}
      </Panel>
    </div>
  );
}
