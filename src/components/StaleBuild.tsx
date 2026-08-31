import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { isStale } from '../lib/buildVersion';
import { ts, useUiLangValue } from '../i18n';

/**
 * "This tab is running an old copy of SELM."
 *
 * The reasoning is in `buildVersion.ts`. What belongs here is why the notice
 * looks the way it does:
 *
 *  - It is not dismissible. A dismissed banner comes back on the next check
 *    or it does not, and both are wrong: the first is nagging, the second
 *    leaves someone knowingly on stale content with nothing on screen. The
 *    button that removes it is the button that fixes it.
 *  - It says what is actually wrong — the content may be out of date — rather
 *    than "an update is available", which sounds optional and is not: the
 *    failure it prevents is a candidate seeing a bank that no longer matches
 *    what we hold.
 *  - It checks when the tab is brought back to the front, which is exactly
 *    when a long-lived tab is dangerous, and not on a timer, because a timer
 *    polls a server on behalf of a page nobody is looking at.
 */
export function StaleBuild() {
  const ui = useUiLangValue();
  const [stale, setStale] = useState(false);

  useEffect(() => {
    let alive = true;
    const check = () => {
      if (document.visibilityState !== 'visible') return;
      isStale().then((v) => { if (alive && v) setStale(true); });
    };
    check();
    document.addEventListener('visibilitychange', check);
    window.addEventListener('focus', check);
    return () => {
      alive = false;
      document.removeEventListener('visibilitychange', check);
      window.removeEventListener('focus', check);
    };
  }, []);

  if (!stale) return null;

  return (
    <div className="border-b border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-200">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3">
        <span className="flex-1">{ts('stale.body', ui)}</span>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-xl border-2 border-amber-400 px-4 py-2 text-sm font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/40"
        >
          <RefreshCw className="h-4 w-4" /> {ts('stale.reload', ui)}
        </button>
      </div>
    </div>
  );
}
