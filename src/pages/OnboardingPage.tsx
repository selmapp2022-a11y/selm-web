import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

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
  const nav = useNavigate();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [chosen, setChosen] = useState<Row | null>(null);

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
    });
  }, []);

  const choose = (r: Row) => {
    setChosen(r);
    import('../exam/model/plan').then(({ savePlan, loadPlan }) => {
      savePlan({
        goalId: loadPlan()?.goalId ?? '',
        examId: r.id,
        examDate: loadPlan()?.examDate ?? null,
        examLocale: r.locale,
      });
    });
  };

  if (!rows) return <div className="card p-6 text-sm text-ink-secondary">Loading…</div>;

  if (!chosen) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 py-8">
        <header>
          <h1 className="font-display text-3xl font-bold text-navy">Which exam are you sitting?</h1>
          <p className="mt-1 text-ink-secondary">
            It is the only thing we need to start. No placement test, no level — the exam gives every
            candidate the same tasks, so there is nothing to place you on.
          </p>
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
                  <div className="font-display text-lg font-bold text-navy">{r.name}</div>
                  {missing.length === 0 ? (
                    <div className="mt-1 text-sm text-teal">Complete — all four skills built.</div>
                  ) : (
                    // §1.1: state it plainly. The list is computed from the
                    // definition, so it cannot drift out of date the way a
                    // sentence written by hand would.
                    <div className="mt-1 text-sm text-amber-700">
                      {r.built.join(' and ')} only. {missing.join(' and ')} not built yet.
                    </div>
                  )}
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-ink-secondary" />
              </button>
            );
          })}
        </div>
        <p className="text-xs text-ink-secondary">
          Only exams that are actually built are listed. An exam offered but unbuilt would be a claim
          we cannot keep.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <div className="flex items-center gap-2 text-sm text-teal">
        <Check className="h-4 w-4" /> {chosen.name}
      </div>
      <header>
        <h1 className="font-display text-3xl font-bold text-navy">Have you sat it before?</h1>
        <p className="mt-1 text-ink-secondary">
          If you have, your real marks build a better plan than any test we could give you — however
          long ago it was. If you have not, we start teaching now.
        </p>
      </header>
      <div className="flex flex-wrap gap-3">
        <a href="/exam.html#/attestation" className="btn-primary">Yes — enter my marks</a>
        <button onClick={() => nav('/dashboard')} className={clsx('btn-ghost border-2 border-surface-divider px-5 py-3')}>
          No — start teaching
        </button>
      </div>
      <p className="text-xs text-ink-secondary">
        Skipping changes nothing about what you can use. You will be asked again later, and never
        blocked.
      </p>
    </div>
  );
}
