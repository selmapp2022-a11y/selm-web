import { ReactNode, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { ClipboardList, LineChart } from 'lucide-react';
import clsx from 'clsx';
import { Logo } from '../../components/Logo';
import { ThemeToggle } from '../../components/ThemeToggle';
import { initTheme } from '../../lib/theme';
import { useExam } from '../state';
import { EXAMS } from '../definitions';
import { t } from '../model/format';

/**
 * The shell — the application's own, not a second one.
 *
 * Structure copied from `src/components/AppLayout.tsx`: a fixed 16rem sidebar
 * on desktop with the logo at the top and the quiet controls at the bottom, a
 * sticky translucent header, a fixed bottom tab bar on narrow viewports, and
 * `mx-auto max-w-6xl px-4 py-6 pb-24 md:px-8 md:py-10 md:pb-10` around the
 * content. The `pb-24` is what keeps the bottom bar off the submit button.
 *
 * Three deliberate differences from AppLayout, all noted in the step-13 report:
 *
 *   1. The header renders at every width, not `md:hidden`. The exam switcher
 *      is a single <select> and duplicating it into the sidebar would put two
 *      of them in the DOM; one control, one node.
 *   2. Two nav destinations, not seven, and they are *disabled while a sitting
 *      is in progress*. The old shell offered no way out of a section and this
 *      one must not either — adopting the chrome must not hand the candidate a
 *      door mid-épreuve.
 *   3. `initTheme()` runs here. The app calls it in App.tsx; the exam entry
 *      point never did, so dark mode was simply dead in the exam engine.
 */
export default function ExamLayout({ children }: { children: ReactNode }) {
  const { exam, setExam, ui, setUi, sitting } = useExam();

  useEffect(() => { initTheme(); }, []);

  const nav = [
    { to: '/', label: ui === 'en' ? 'Exam' : 'Examen', icon: ClipboardList },
    { to: '/history', label: ui === 'en' ? 'History' : 'Historique', icon: LineChart },
  ];
  const locked = !!sitting;

  const controls = (
    <>
      <select
        aria-label="Exam definition"
        className="w-36 shrink-0 truncate rounded-xl border border-surface-divider bg-white px-3 py-2 text-sm font-medium text-navy focus:border-navy focus:outline-none focus:ring-2 focus:ring-teal/30 sm:w-auto"
        value={exam.id}
        onChange={(e) => setExam(EXAMS.find((x) => x.id === e.target.value)!)}
      >
        {EXAMS.map((e) => (
          <option key={e.id} value={e.id}>
            {t(e.name, ui)}
          </option>
        ))}
      </select>
      <button
        className="shrink-0 rounded-xl border-2 border-navy/20 px-3 py-2 font-display text-sm font-semibold text-navy transition hover:border-teal hover:bg-surface-muted"
        onClick={() => setUi(ui === 'en' ? 'fr' : 'en')}
      >
        {ui === 'en' ? 'FR' : 'EN'}
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-surface-app">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-surface-divider bg-white md:block">
        <div className="flex h-full flex-col">
          <div className="px-6 py-6"><Logo /></div>
          <nav className="flex-1 space-y-1 px-3">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                aria-disabled={locked}
                onClick={(e) => { if (locked) e.preventDefault(); }}
                className={({ isActive }) => clsx(
                  'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition',
                  locked && 'pointer-events-none opacity-40',
                  isActive ? 'bg-navy text-white shadow-card' : 'text-ink-secondary hover:bg-surface-muted hover:text-navy'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="border-t border-surface-divider p-4">
            <div className="mb-3 px-1"><ThemeToggle /></div>
            <span className="chip">
              {ui === 'en' ? 'exam engine · preview' : "moteur d'examen · aperçu"}
            </span>
            <p className="mt-3 px-1 text-xs leading-relaxed text-ink-secondary">
              {ui === 'en'
                ? 'A working slice of the exam engine. One code path, two exam definitions. Nothing here publishes a predicted score — the result screen says why.'
                : "Une tranche fonctionnelle du moteur d'examen. Un seul code, deux définitions d'examen. Aucune note prédite n'est publiée ici — l'écran de résultat en donne la raison."}
            </p>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-surface-divider bg-white/80 backdrop-blur md:pl-64">
        <div className="flex items-center gap-2 px-4 py-3 md:px-8">
          <div className="md:hidden"><Logo variant="symbol" className="h-9 w-9 rounded-xl" /></div>
          <div className="ml-auto flex min-w-0 items-center gap-2">
            {controls}
            <div className="md:hidden"><ThemeToggle /></div>
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-surface-divider bg-white md:hidden">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            aria-disabled={locked}
            onClick={(e) => { if (locked) e.preventDefault(); }}
            className={({ isActive }) => clsx(
              'flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs',
              locked && 'pointer-events-none opacity-40',
              isActive ? 'text-teal' : 'text-ink-secondary'
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <main className="md:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 pb-24 md:px-8 md:py-10 md:pb-10">
          <div className="mx-auto max-w-3xl">{children}</div>
        </div>
      </main>
    </div>
  );
}
