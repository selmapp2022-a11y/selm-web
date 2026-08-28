import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Languages } from 'lucide-react';
import { loadPlan, PLAN_EVENT } from '../exam/model/plan';
import { useUiLangValue } from '../i18n';

/**
 * The always-visible answer to "which language am I practising in, and where
 * do I change it?"
 *
 * The language every skill is practised in comes from the chosen exam's
 * locale (`plan.examLocale`): fr-* => French (TCF), anything else => English
 * (IELTS). Until this badge and the Settings selector existed, that choice
 * was made once at onboarding and could never be seen or changed again, so a
 * candidate on the default English plan had no way to switch to French and
 * every skill silently stayed English. This shows the current language on
 * every screen and links to the switch.
 *
 * Reads only `examLocale`, never the exam definitions, so it costs nothing on
 * first paint. Re-reads on PLAN_EVENT so it follows a change made in Settings
 * or in the exam engine.
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
  const langLabel = isFr
    ? ui === 'fr' ? 'Français' : 'French'
    : ui === 'fr' ? 'Anglais' : 'English';
  const examLabel = isFr ? 'TCF' : 'IELTS';

  return (
    <NavLink
      to="/settings"
      aria-label={ui === 'fr' ? 'Changer la langue de pratique' : 'Change practice language'}
      className={
        'flex items-center gap-2 rounded-full border border-surface-divider bg-white px-3 py-1 text-xs font-medium text-ink-secondary transition hover:border-teal hover:text-navy ' +
        (compact ? '' : 'w-full justify-center')
      }
    >
      <Languages className="h-3.5 w-3.5 text-teal" />
      <span className="text-navy dark:text-white">{langLabel}</span>
      <span className="uppercase tracking-wide">· {examLabel}</span>
    </NavLink>
  );
}
