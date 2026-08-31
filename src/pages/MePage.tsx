import { Link } from 'react-router-dom';
import { TrendingUp, ChevronRight } from 'lucide-react';
import { ExamGoal } from '../exam/components/ExamGoal';
import { AccountSettings } from '../components/AccountSettings';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { ts, useUiLangValue } from '../i18n';

/**
 * `/me` — YOU.
 *
 * The last of the three tabs, and the destination three routes were merged
 * into. It was the fourth of four until 31 August, when Mock exam left the tab
 * bar for the home screen — see `components/AppLayout.tsx`.
 *
 * ── What was here before, and why it was three screens ──────────────────────
 * The navigation had five tabs and the account had three homes:
 *
 *     /goal       the exam, the destination, the date, past results
 *     /settings   account, interface language, appearance, delete, sign out
 *     /progress   the numbers
 *
 * plus a theme switcher and a sign-out in the desktop sidebar, and a gear in
 * the phone header — so **appearance appeared twice and sign out appeared
 * twice** (D4 and D5), not because anyone added them twice but because there
 * were two places that could plausibly own them.
 *
 * The IA ruling of 30 August: *"Four tabs is still right. Drop `My exam` into
 * `You` … and `Progress` folds into `You`, which holds the numbers alongside
 * the goal they are measured against."* Four became three on 31 August, and
 * this page was not the one that changed.
 *
 * ── Why Progress is a link and not a section ────────────────────────────────
 * Folding Progress into `You` is about the NAVIGATION, not about the page:
 * `/progress` holds four charts and a table of attempts, and pasting them
 * under a goal picker would make this page the density problem the same ruling
 * objects to on `/`. It is one tap from here, which keeps every feature within
 * the ruling's two taps.
 *
 * ── And why Mock exam is NOT here ───────────────────────────────────────────
 * The audit of 30 August proposed moving it under Practice. The ruling
 * rejected that, and the reason survives: *"Practice teaches. The mock exam
 * measures … it is the only surface that answers 'are you ready to book?'"*
 *
 * On 31 August it stopped being a tab all the same — but it did not go under
 * Practice, and it was not demoted. It became the primary action of the home
 * screen, which is a promotion: it now sits on the card that carries the exam
 * and the countdown, and it is the first thing on the first screen.
 */
export default function MePage() {
  const ui = useUiLangValue();
  useDocumentTitle(ts('nav.you', ui));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold text-navy dark:text-white">
          {ts('nav.you', ui)}
        </h1>
      </header>

      <ExamGoal />

      {/* The one link to the numbers. `/progress` is no longer a tab, and a
          page that has been demoted out of the navigation has to be reachable
          from the page that absorbed it — otherwise the fold is a deletion. */}
      <Link
        to="/progress"
        className="card flex items-center gap-4 p-6 transition hover:border-navy/40 hover:bg-surface-muted"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-navy to-teal text-white shadow-md">
          <TrendingUp className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-xl font-bold text-navy dark:text-white">
            {ts('me.progressTitle', ui)}
          </div>
          <p className="mt-1 text-sm text-ink-secondary">{ts('me.progressBlurb', ui)}</p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-ink-secondary" />
      </Link>

      <AccountSettings />
    </div>
  );
}
