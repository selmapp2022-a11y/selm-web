import { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { useAuthStore } from '../store/authStore';
import { syncProgressFromBackend } from '../lib/progress';
import { LayoutDashboard, Mic, Headphones, BookOpen, PenLine, Brain, ClipboardCheck, LogOut, Settings } from 'lucide-react';
import clsx from 'clsx';

// `Progress` left this list on 2026-08-27. The page it opened is the XP,
// level and achievement screen — the scoreboard of the product the company
// is repositioning away from. The route still exists and nothing was deleted;
// it is simply no longer one of the seven things the navigation offers.
const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/speaking', label: 'Speaking', icon: Mic },
  { to: '/listening', label: 'Listening', icon: Headphones },
  { to: '/reading', label: 'Reading', icon: BookOpen },
  { to: '/writing', label: 'Writing', icon: PenLine },
  { to: '/vocabulary', label: 'Vocabulary', icon: Brain },
];

// The exam engine is a second Vite entry point at `/exam.html`, not a route
// in this router, so it is an anchor rather than a NavLink. Until today it
// had no entry anywhere in the signed-in application at all.
const EXAM_HOME = '/exam.html#/';

export function AppLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  // Pull XP/streak/achievements from the backend once the user is signed in,
  // so cleared cache or a fresh device shows the user's real progress instead
  // of an empty slate.
  useEffect(() => {
    if (user) { void syncProgressFromBackend(); }
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-surface-app">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-surface-divider bg-white md:block">
        <div className="flex h-full flex-col">
          <div className="px-6 py-6"><Logo /></div>
          <nav className="flex-1 space-y-1 px-3">
            <a
              href={EXAM_HOME}
              className="mb-2 flex items-center gap-3 rounded-xl bg-gradient-to-br from-navy to-teal px-4 py-2.5 text-sm font-semibold text-white shadow-card"
            >
              <ClipboardCheck className="h-5 w-5" />
              Mock exam
            </a>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
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

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-surface-divider bg-white/80 px-4 py-3 backdrop-blur md:hidden">
        <Logo />
        <div className="flex items-center gap-2">
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
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-surface-divider bg-white md:hidden">
        <a href={EXAM_HOME} className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs text-ink-secondary">
          <ClipboardCheck className="h-5 w-5" />
          Exam
        </a>
        {navItems.slice(0, 4).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => clsx('flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs', isActive ? 'text-teal' : 'text-ink-secondary')}
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
