import { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { PracticeLanguageBadge } from './PracticeLanguageBadge';
import { useAuthStore } from '../store/authStore';
import { syncAttemptsFromBackend } from '../lib/attempts';
import { claimCandidateRecord } from '../lib/localRecord';
import { syncDocumentLang, useUiLangValue } from '../i18n';
import { Home, Dumbbell, ClipboardCheck, TrendingUp, Target, LogOut, Settings } from 'lucide-react';
import clsx from 'clsx';

// Five entries, and each label is the word its page uses as a heading —
// checked on 29 August 2026 after the founder observed that the app read as
// assembled rather than designed. `Progress` is back in this list because the
// page behind it is no longer the scoreboard it was: see `ProgressPage`.
const navItems = [
  { to: '/', label: 'Today', icon: Home, end: true },
  { to: '/practice', label: 'Practice', icon: Dumbbell },
  { to: '/exam', label: 'Mock exam', icon: ClipboardCheck },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/goal', label: 'My exam', icon: Target },
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
          <div className="mb-2 px-4"><PracticeLanguageBadge /></div>
          <nav className="flex-1 space-y-1 px-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => clsx(
                  'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition',
                  isActive ? 'bg-navy text-white shadow-card' : 'text-ink-secondary hover:bg-surface-muted hover:text-navy'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
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
              <Settings className="h-4 w-4" /> Settings
            </NavLink>
            <button onClick={handleLogout} className="mt-1 flex w-full items-center gap-2 rounded-xl px-4 py-2 text-sm text-ink-secondary hover:bg-surface-muted">
              <LogOut className="h-4 w-4" /> Sign out
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
      <header className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-surface-divider bg-white/80 px-4 py-3 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 md:hidden">
        <div className="flex min-w-0 items-center gap-2">
          <Logo variant="symbol" className="h-8 w-8 shrink-0 rounded-xl" />
          <PracticeLanguageBadge compact />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          {/* Gear icon → Settings → Delete Account. Required so
              iPhone users (Apple's phone reviewers) can reach the
              account deletion flow without an obscure gesture. */}
          <NavLink to="/settings" className="text-ink-secondary" aria-label="Settings">
            <Settings className="h-5 w-5" />
          </NavLink>
          <button onClick={handleLogout} className="text-ink-secondary" aria-label="Sign out">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Bottom nav for mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-surface-divider bg-white dark:border-slate-700 dark:bg-slate-900 md:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => clsx('flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px]', isActive ? 'text-teal' : 'text-ink-secondary')}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <main className="md:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 pb-24 md:px-8 md:py-10 md:pb-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
