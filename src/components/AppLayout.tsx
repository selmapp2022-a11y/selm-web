import { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { StaleBuild } from './StaleBuild';
import { useAuthStore } from '../store/authStore';
import { syncAttemptsFromBackend } from '../lib/attempts';
import { claimCandidateRecord } from '../lib/localRecord';
import { syncDocumentLang, ts, useUiLangValue } from '../i18n';
import { Home, Dumbbell, ClipboardCheck, TrendingUp, Target, LogOut, Settings } from 'lucide-react';
import type { Key } from '../i18n';
import clsx from 'clsx';

/**
 * The five destinations, declared once and rendered twice — the sidebar on a
 * desktop, the tab bar on a phone. One list, so the two can never drift.
 *
 * Each label is the word its page uses as a heading, checked on 29 August 2026
 * after the founder observed that the app read as assembled rather than
 * designed. `Progress` is in the list because the page behind it is no longer
 * the scoreboard it was: see `ProgressPage`.
 *
 * The labels are KEYS as of 30 August. They were hard-coded English, which
 * made this the one place §5.2 was not being followed and the most visible
 * one: a candidate reading the app in French met five English words on every
 * screen, in the only component that is on every screen.
 */
const navItems: Array<{ to: string; label: Key; icon: typeof Home; end?: boolean }> = [
  { to: '/', label: 'nav.today', icon: Home, end: true },
  { to: '/practice', label: 'nav.practice', icon: Dumbbell },
  { to: '/exam', label: 'nav.mockExam', icon: ClipboardCheck },
  { to: '/progress', label: 'nav.progress', icon: TrendingUp },
  { to: '/goal', label: 'nav.myExam', icon: Target },
];

export function AppLayout() {
  const { user, logout } = useAuthStore();
  // `index.html` hard-codes `lang="en"`. Keep the document on the language the
  // candidate chose, so assistive technology announces it correctly and the
  // browser's own date fields follow the app rather than the operating system.
  const ui = useUiLangValue();
  useEffect(() => { syncDocumentLang(ui); }, [ui]);
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  // Bind this device's local record to whoever is signed in — discarding it
  // first if it belonged to someone else — and only then pull from the
  // backend. The order matters: syncing first would merge a previous
  // candidate's attempts into this account and push them back up.
  useEffect(() => {
    if (!user) return;
    claimCandidateRecord(user.id);
    void syncAttemptsFromBackend();
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-surface-app">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-surface-divider bg-white dark:border-slate-700 dark:bg-slate-900 md:block">
        <div className="flex h-full flex-col">
          <div className="px-6 pb-3 pt-6"><Logo /></div>
          <nav className="flex-1 space-y-1 px-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => clsx(
                  'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition',
                  isActive
                    ? 'bg-navy font-semibold text-white shadow-card'
                    : 'font-medium text-ink-secondary hover:bg-surface-muted hover:text-navy'
                )}
              >
                {({ isActive }) => (
                  <>
                    {/* Weight, not only colour. A tab that differs from its
                        neighbours by hue alone is invisible to a candidate who
                        cannot separate those hues, and washed out in sunlight
                        — which is where a phone is often held. */}
                    <item.icon className="h-5 w-5" strokeWidth={isActive ? 2.3 : 1.8} />
                    {ts(item.label, ui)}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="border-t border-surface-divider p-4">
            <div className="mb-3 px-2">
              <div className="text-sm font-semibold text-navy">{user?.full_name || user?.username || 'Learner'}</div>
              <div className="truncate text-xs text-ink-secondary">{user?.email}</div>
              {/* The backend's `current_level` badge was removed here on
                  2026-08-27 with the rest of the invented level scale. The
                  field still exists on the account and is still used to pick
                  practice difficulty; it is simply not a score, so it is no
                  longer displayed as one beside the candidate's name. */}
            </div>
            <div className="mb-2 px-2"><ThemeToggle /></div>
            {/* Settings entry — required so users (and Apple's App Review)
                can reach the Delete Account flow. Apple 5.1.1(v) rejected
                Build 38 because the sidebar had no visible way to open
                Settings. */}
            <NavLink
              to="/settings"
              className={({ isActive }) => clsx(
                'flex w-full items-center gap-2 rounded-xl px-4 py-2 text-sm hover:bg-surface-muted',
                isActive ? 'text-navy font-semibold' : 'text-ink-secondary'
              )}
            >
              <Settings className="h-4 w-4" /> {ts('nav.settings', ui)}
            </NavLink>
            <button onClick={handleLogout} className="mt-1 flex w-full items-center gap-2 rounded-xl px-4 py-2 text-sm text-ink-secondary hover:bg-surface-muted">
              <LogOut className="h-4 w-4" /> {ts('nav.signOut', ui)}
            </button>
          </div>
        </div>
      </aside>

      {/* The mobile header, rebuilt 2026-08-29 because it broke on a phone.
          It carried the FULL logo — wordmark plus the "KNOW YOUR SCORE"
          tagline, which is letter-spaced and therefore wide — next to the
          language badge, next to three icon buttons and a theme switcher, all
          in one row. On a 390px screen that does not fit: the tagline wrapped
          to three lines and the badge sat on top of it.
          The symbol carries the brand here; the wordmark is still in the
          sidebar where there is room for it. */}
      {/* ── THE PHONE HEADER ────────────────────────────────────────────
          It carried five things: the full logo with its letter-spaced
          tagline, the exam/language pill, a theme switcher, a gear and a
          sign-out. On a 390px screen the tagline wrapped to three lines and
          the pill sat on top of it.

          It now carries two: the mark, and the gear. The pill went on
          30 August because "My exam" in the navigation already led there.
          The theme switcher and sign-out went with it — not because they are
          unimportant but because they belong to the account, not to the
          screen the candidate is on, and both are in Settings, one tap
          behind the gear that is already required to be here.

          Sign-out in particular has no business one stray tap away on every
          screen of an exam app. A candidate mid-practice does not want to
          discover it by accident.

          `env(safe-area-inset-top)` because this ships inside Capacitor as
          well as a browser, and there the status bar overlays the web view. */}
      <header
        className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-surface-divider bg-white/80 px-4 py-3 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 md:hidden"
        style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top))' }}
      >
        <Logo variant="symbol" className="h-8 w-8 shrink-0 rounded-xl" />
        {/* Gear → Settings → Delete Account. Required so iPhone users (and
            Apple's reviewers) can reach account deletion without an obscure
            gesture; 5.1.1(v) rejected Build 38 for exactly this. */}
        <NavLink
          to="/settings"
          className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-ink-secondary transition hover:bg-surface-muted hover:text-navy"
          aria-label={ts('nav.settings', ui)}
        >
          <Settings className="h-5 w-5" />
        </NavLink>
      </header>

      {/* ── THE PHONE TAB BAR ───────────────────────────────────────────
          Same five destinations as the sidebar, from the same list.

          Three things changed on 30 August, all of them because this is the
          component a phone user touches most and it was the least considered:

          - **A tap target that exists.** It was `py-2` around a 20px icon —
            about 36px tall. Both platforms ask for 44; a candidate tapping
            "Practice" and landing on "Mock exam" blames themselves.
          - **The current tab is marked by SHAPE, not only hue.** A filled
            capsule behind the active icon, a heavier stroke, a heavier
            label. Colour alone fails a candidate who cannot separate teal
            from grey, and fails everyone in sunlight.
          - **`env(safe-area-inset-bottom)`.** Inside Capacitor on a
            gesture-bar iPhone the labels sat under the home indicator. */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-surface-divider bg-white/95 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        aria-label={ts('nav.main', ui)}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className="flex min-h-[3.5rem] flex-1 flex-col items-center justify-center gap-1 pb-1 pt-1.5"
          >
            {({ isActive }) => (
              <>
                <span
                  className={clsx(
                    'flex h-7 w-14 items-center justify-center rounded-full transition-colors duration-150',
                    isActive ? 'bg-teal/15 text-teal' : 'text-ink-secondary',
                  )}
                >
                  <item.icon className="h-5 w-5" strokeWidth={isActive ? 2.3 : 1.8} />
                </span>
                <span
                  className={clsx(
                    'text-[11px] leading-none',
                    isActive ? 'font-semibold text-teal' : 'text-ink-secondary',
                  )}
                >
                  {ts(item.label, ui)}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <main className="md:pl-64">
        <StaleBuild />
        {/* The bottom padding is the tab bar's real height plus the device's
            inset, not a round number that happened to clear it. */}
        <div
          className="mx-auto max-w-6xl px-4 py-6 pb-[var(--tabbar)] md:px-8 md:py-10 md:pb-10"
          style={{ ['--tabbar' as string]: 'calc(5rem + env(safe-area-inset-bottom))' }}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}
