import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { useT, useUiLangValue } from '../i18n';

/**
 * Onboarding, rebuilt. Part 3 (replacement) §1.
 *
 * > *"One choice, one question, then start."*
 *
 * What was here until today, and what each piece was doing wrong:
 *
 *  - **Five demographic questions** — age, occupation, education, interests,
 *    and *"Why are you learning English?"* with options *Career growth ·
 *    Travel · Entertainment*. **The exam was never asked.** For a product
 *    whose organising fact is the exam, that is the wrong question five times.
 *  - **`/onboarding/assessment`** — an adaptive CEFR placement test, A1 to
 *    C2, walking a ladder. Part 3 §6 requires **no placement step anywhere**,
 *    and §0 gives the reason: *"TCF gives every candidate the same six
 *    tâches. Nobody is handed an easier tâche 2 because they are weaker. So a
 *    curriculum organised by level teaches something the exam does not test."*
 *
 * What replaces both: the exam, one question, then teaching.
 *
 * **The exam list states what is not built** (§1.1), because an exam offered
 * but unbuilt is the claim the rest of the plan forbids everywhere else — and
 * the gap is now computable rather than remembered, because `awards` and
 * `sections` are separate fields on the definition.
 */
type Row = {
  id: string;
  name: string;
  language: string;
  locale: string;
  /** Skills the awarding body reports. */
  awarded: string[];
  /** Skills SELM has actually built. */
  built: string[];
};

export default function OnboardingPage() {
  const t = useT();
  const lang = useUiLangValue();
  const nav = useNavigate();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [chosen, setChosen] = useState<Row | null>(null);
  // Default destination per exam, so choosing an exam yields a complete plan
  // and the candidate lands on Today rather than looping on the empty state.
  const [goalOf, setGoalOf] = useState<Record<string, string>>({});
  /** The exam the candidate says they SAT, when it is not the one chosen. */
  const [whichSat, setWhichSat] = useState<Row | null>(null);

  useEffect(() => {
    // Lazy, for the same reason `practiceTasks.ts` is lazy: the definitions
    // carry ~72 000 characters of authored French.
    import('../exam/definitions').then((d) => {
      setRows(
        d.EXAMS.map((e) => ({
          id: e.id,
          name: e.name[e.language],
          language: e.language,
          locale: e.locale,
          awarded: e.awards.map((a) => a.skill),
          built: Array.from(new Set(e.sections.map((s) => s.skill))),
        })),
      );
      const map: Record<string, string> = {};
      for (const e of d.EXAMS) {
        const g = d.GOALS.find((gg) => gg.exams.includes(e.id));
        if (g) map[e.id] = g.id;
      }
      setGoalOf(map);
    });
  }, []);

  const choose = (r: Row) => {
    setChosen(r);
    import('../exam/model/plan').then(({ savePlan, loadPlan }) => {
      // Exam is set, but the plan is left INCOMPLETE (no destination yet) so
      // Today stays on this empty state and shows the second question below.
      savePlan({
        goalId: loadPlan()?.goalId ?? '',
        examId: r.id,
        examDate: loadPlan()?.examDate ?? null,
        examLocale: r.locale,
      });
    });
  };

  // The second answer completes the plan with the exam's default destination
  // (changeable later on My exam), so the candidate lands on Today. 'Yes' then
  // goes to the score form; 'No' lets Today take over with the plan.
  /** They sat a different exam and would rather prepare for that one. */
  const switchTo = (r: Row) => {
    import('../exam/model/plan').then(({ savePlan, loadPlan }) => {
      savePlan({
        goalId: goalOf[r.id] ?? '',
        examId: r.id,
        examDate: loadPlan()?.examDate ?? null,
        examLocale: r.locale,
      });
      nav('/attestation');
    });
  };

  const finish = (satBefore: boolean) => {
    if (!chosen) return;
    import('../exam/model/plan').then(({ savePlan, loadPlan }) => {
      savePlan({
        goalId: goalOf[chosen.id] ?? '',
        examId: chosen.id,
        examDate: loadPlan()?.examDate ?? null,
        examLocale: chosen.locale,
      });
      if (satBefore) nav('/attestation');
    });
  };

  if (!rows) return <div className="card p-6 text-sm text-ink-secondary">{t('common.loading')}</div>;

  if (!chosen) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 py-8">
        <header>
          {/* This screen IS Today when there is no plan (IA §6), so it keeps
              Today's name. The question that used to be the heading is still
              the first thing read — it just is not pretending to be the page's
              name, which is what made the app read as assembled. */}
          <h1 className="font-display text-3xl font-bold text-navy">Today</h1>
          <p className="mt-1 font-display text-xl font-bold text-navy">{t('onboarding.title')}</p>
          <p className="mt-1 text-ink-secondary">{t('onboarding.subtitle')}</p>
        </header>
        <div className="grid gap-3">
          {rows.map((r) => {
            const missing = r.awarded.filter((s) => !r.built.includes(s));
            return (
              <button
                key={r.id}
                onClick={() => choose(r)}
                className="card flex items-center justify-between gap-4 p-5 text-left hover:shadow-cardHover"
              >
                <div>
                  <div className="font-display text-lg font-bold text-navy">
                    {r.name}{' '}
                    {/* The exam decides the language of every skill, and until
                        2026-08-29 this screen never said which language that
                        was. Nothing on "TCF Canada" reads as French, so a
                        candidate who came to learn French had no signpost at
                        the one moment the choice is made. */}
                    <span className="text-sm font-medium text-ink-secondary">
                      {t('onboarding.inLanguage', { language: t(r.language === 'fr' ? 'examLang.fr' : 'examLang.en') })}
                    </span>
                  </div>
                  {missing.length === 0 ? (
                    <div className="mt-1 text-sm text-teal">{t('onboarding.complete')}</div>
                  ) : (
                    // §1.1: state it plainly. The list is computed from the
                    // definition, so it cannot drift out of date the way a
                    // sentence written by hand would — and the joining word
                    // comes from the dictionary too, because "and"/"et" is a
                    // string like any other.
                    <div className="mt-1 text-sm text-amber-700">
                      {t('onboarding.partial', {
                        built: r.built.join(lang === 'fr' ? ' et ' : ' and '),
                        missing: missing.join(lang === 'fr' ? ' et ' : ' and '),
                      })}
                    </div>
                  )}
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-ink-secondary" />
              </button>
            );
          })}
        </div>
        <p className="text-xs text-ink-secondary">{t('onboarding.onlyBuilt')}</p>
      </div>
    );
  }

  const others = rows.filter((r) => r.id !== chosen.id);

  // "Have you sat IT before?" assumed the exam sat was the exam being prepared
  // for. A candidate who holds a TCF result and is now preparing for IELTS had
  // no key to say so, and the honest answer is not to take those marks
  // quietly: a French result measures French, and using it to plan an English
  // exam would not improve the plan, it would falsify it. So the question now
  // asks WHICH exam, and says plainly what can be done with each answer.
  if (whichSat) {
    const cross = whichSat.language !== chosen.language;
    return (
      <div className="mx-auto max-w-2xl space-y-6 py-8">
        <div className="flex items-center gap-2 text-sm text-teal">
          <Check className="h-4 w-4" /> {chosen.name}
        </div>
        <header>
          <h1 className="font-display text-3xl font-bold text-navy">{whichSat.name}</h1>
          <p className="mt-3 text-ink-secondary">
            {cross
              ? t('onboarding.otherCrossLang', {
                  language: t(whichSat.language === 'fr' ? 'examLang.fr' : 'examLang.en'),
                  target: t(chosen.language === 'fr' ? 'examLang.fr' : 'examLang.en'),
                })
              : t('onboarding.otherSameLang')}
          </p>
        </header>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => switchTo(whichSat)} className="btn-primary">
            {t('onboarding.switchTo', { exam: whichSat.name })}
          </button>
          <button
            type="button"
            onClick={() => finish(false)}
            className={clsx('btn-ghost border-2 border-surface-divider px-5 py-3')}
          >
            {t('onboarding.continueWithout')}
          </button>
        </div>
        <button type="button" onClick={() => setWhichSat(null)} className="text-sm text-ink-secondary underline">
          {t('onboarding.back')}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <div className="flex items-center gap-2 text-sm text-teal">
        <Check className="h-4 w-4" /> {chosen.name}
      </div>
      <header>
        <h1 className="font-display text-3xl font-bold text-navy">{t('onboarding.satBefore')}</h1>
        <p className="mt-1 text-ink-secondary">{t('onboarding.satBeforeHelp')}</p>
      </header>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => finish(true)} className="btn-primary">
          {t('onboarding.yesThis', { exam: chosen.name })}
        </button>
        <button type="button" onClick={() => finish(false)} className={clsx('btn-ghost border-2 border-surface-divider px-5 py-3')}>
          {t('onboarding.no')}
        </button>
      </div>
      {others.length > 0 && (
        <div className="border-t border-surface-divider pt-4">
          <p className="text-sm font-medium text-navy">{t('onboarding.otherTitle')}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {others.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setWhichSat(o)}
                className="rounded-full border-2 border-surface-divider px-4 py-2 text-sm font-medium text-ink-secondary hover:border-navy/40 hover:text-navy"
              >
                {o.name} <span className="text-xs">{t('onboarding.inLanguage', { language: t(o.language === 'fr' ? 'examLang.fr' : 'examLang.en') })}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <p className="text-xs text-ink-secondary">{t('onboarding.neverBlocked')}</p>
    </div>
  );
}
