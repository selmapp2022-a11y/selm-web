import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { useAuthStore } from '../store/authStore';
import { LayoutDashboard, Mic, Headphones, BookOpen, PenLine, Brain, LogOut } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/speaking', label: 'Speaking', icon: Mic },
  { to: '/listening', label: 'Listening', icon: Headphones },
  { to: '/reading', label: 'Reading', icon: BookOpen },
  { to: '/writing', label: 'Writing', icon: PenLine },
  { to: '/vocabulary', label: 'Vocabulary', icon: Brain },
];

export function AppLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-surface-app">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-surface-divider bg-white md:block">
        <div className="flex h-full flex-col">
          <div className="px-6 py-6"><Logo /></div>
          <nav className="flex-1 space-y-1 px-3">
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
              {user?.current_level && (
                <span className="mt-2 inline-flex items-center rounded-full bg-teal/10 px-2.5 py-0.5 text-xs font-bold text-teal-600">
                  Level {user.current_level}
                </span>
              )}
            </div>
            <div className="mb-2 px-2"><ThemeToggle /></div>
            <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-xl px-4 py-2 text-sm text-ink-secondary hover:bg-surface-muted">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-surface-divider bg-white/80 px-4 py-3 backdrop-blur md:hidden">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={handleLogout} className="text-ink-secondary"><LogOut className="h-5 w-5" /></button>
        </div>
      </header>

      {/* Bottom nav for mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-surface-divider bg-white md:hidden">
        {navItems.slice(0, 5).map((item) => (
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
