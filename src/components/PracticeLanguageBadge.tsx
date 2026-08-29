import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronRight, Languages } from 'lucide-react';
import { loadPlan, PLAN_EVENT } from '../exam/model/plan';
import { useUiLangValue } from '../i18n';

/**
 * The always-visible answer to "which exam am I preparing for, and therefore
 * which language am I practising in - and where do I change it?"
 *
 * The language of every skill is NOT an independent choice. It comes from the
 * chosen exam's locale (`plan.examLocale`): fr-* => French (TCF), anything
 * else => English (IELTS). A candidate reading "English · IELTS" reasonably
 * asked why French was not offered; the answer is that French arrives by
 * choosing the French exam, and the badge has to say so rather than look like
 * a broken language toggle. So it leads with the exam - the thing actually
 * chosen - and shows the language as its consequence.
 *
 * It links to /goal, the ONE place the exam is chosen (IA section 3). It used
 * to link to /settings, which then only held a card pointing at /goal: three
 * hops to reach one screen, with Settings already in the navigation below.
 *
 * Reads only `examLocale`, never the exam definitions, so it costs nothing on
 * first paint. Re-reads on PLAN_EVENT so it follows a change made anywhere.
 */
export function PracticeLanguageBadge({ compact = false }: { compact?: boolean }) {
  const ui = useUiLangValue();
  const [locale, setLocale] = useState<string | undefined>(() => loadPlan()?.examLocale);

  useEffect(() => {
    const read = () => setLocale(loadPlan()?.examLocale);
    window.addEventListener(PLAN_EVENT, read);
    window.addEventListener('storage', read);
    return () => {
      window.removeEventListener(PLAN_EVENT, read);
      window.removeEventListener('storage', read);
    };
  }, []);

  const isFr = (locale ?? '').toLowerCase().startsWith('fr');
  const examLabel = isFr ? 'TCF' : 'IELTS';
  // "in French" / "in English" - the preposition is what turns a pair of
  // labels into a sentence: the exam, and the language it is sat in.
  const langLabel = isFr
    ? ui === 'fr' ? 'en français' : 'in French'
    : ui === 'fr' ? 'en anglais' : 'in English';

  return (
    <NavLink
      to="/goal"
      aria-label={ui === 'fr' ? "Changer d'examen" : 'Change your exam'}
      title={
        ui === 'fr'
          ? "L'examen décide de la langue de toutes les épreuves. Appuyez pour en changer."
          : 'Your exam decides the language of every skill. Tap to change it.'
      }
      className={
        // `whitespace-nowrap` because "IELTS in English" broke across two
        // lines inside the pill on a phone, which read as two controls.
        'flex items-center gap-1.5 whitespace-nowrap rounded-full border border-surface-divider bg-white px-3 py-1 dark:border-slate-700 dark:bg-slate-800 text-xs font-medium text-ink-secondary transition hover:border-teal hover:text-navy ' +
        (compact ? 'min-w-0 shrink' : 'w-full justify-center')
      }
    >
      <Languages className="h-3.5 w-3.5 shrink-0 text-teal" />
      <span className="font-semibold uppercase tracking-wide text-navy dark:text-white">
        {examLabel}
      </span>
      <span className="truncate">{langLabel}</span>
      <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />
    </NavLink>
  );
}
