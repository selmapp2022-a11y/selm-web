import { ReactNode } from 'react';
import { useExam } from '../state';
import { EXAMS } from '../definitions';
import { t } from '../model/format';

/**
 * The shell.
 *
 * Brand: navy header with the white logo — the preferred lockup in the
 * guidelines ("Use White logo on Navy only"). Colours, type and radii come
 * from the tokens in tailwind.config.js, which already match the palette in
 * the brand document exactly (#183048 navy, #2EC4B6 accent used sparingly,
 * Poppins display, Inter body).
 *
 * The wordmark is used without the "English learning app" descriptor from
 * the guidelines: this product examines French as well, so that lockup would
 * contradict the strategic transformation document. Flagged rather than
 * quietly diverged from.
 *
 * The exam switcher lives in the header on purpose: swapping the definition
 * mid-session is the demonstration, so it should be one click from anywhere.
 */
export default function Chrome({ children }: { children: ReactNode }) {
  const { exam, setExam, ui, setUi } = useExam();
  return (
    <div className="min-h-full bg-surface-app text-ink-primary">
      <header className="bg-navy">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-3 px-5 py-3">
          <img src="/selm-icon.png" alt="" aria-hidden="true" className="h-8 w-8 rounded-lg" />
          <span className="font-display text-lg font-bold tracking-tight text-white">SELM</span>
          <span className="rounded-full border border-teal/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-teal">
            {ui === 'en' ? 'exam engine · preview' : "moteur d'examen · aperçu"}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <select
              aria-label="Exam definition"
              className="rounded-lg border border-white/25 bg-white/10 px-2 py-1.5 text-sm text-white outline-none [&>option]:text-ink-primary"
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
              className="rounded-lg border border-white/25 px-2.5 py-1.5 text-sm font-semibold text-white"
              onClick={() => setUi(ui === 'en' ? 'fr' : 'en')}
            >
              {ui === 'en' ? 'FR' : 'EN'}
            </button>
          </div>
        </div>
        <div className="h-1 bg-navy" />
      </header>

      <main className="mx-auto max-w-3xl px-5 py-7">{children}</main>

      <footer className="mx-auto max-w-3xl px-5 pb-10 text-xs leading-relaxed text-ink-secondary">
        {ui === 'en'
          ? 'A working slice of the exam engine. One code path, two exam definitions. Nothing here publishes a predicted score — the result screen says why.'
          : "Une tranche fonctionnelle du moteur d'examen. Un seul code, deux définitions d'examen. Aucune note prédite n'est publiée ici — l'écran de résultat en donne la raison."}
      </footer>
    </div>
  );
}
