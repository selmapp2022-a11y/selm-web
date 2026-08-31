import { useNavigate, Link } from 'react-router-dom';
import { ClipboardList, ChevronRight, History } from 'lucide-react';
import { tokenStore } from '../../lib/api';
import { useExam } from '../state';
import { t } from '../model/format';
import { useDocumentTitle } from '../../lib/useDocumentTitle';

/**
 * SELM-IA.md §2 (nav entry "Mock exam") and §3 (running a sitting is NOT on
 * /goal). The full, timed, official-order sitting starts here — occasional,
 * deliberate, high-stakes — not from the settings page that holds the exam,
 * destination and date.
 */
export default function MockExamPage() {
  useDocumentTitle('Mock exam');
  const { exam, ui, startSitting, sitting } = useExam();
  const nav = useNavigate();
  const canSit = exam.sections.some((s) => s.kind === 'comprehension');
  // A guest can be on this page now (ruling of 31 August 2026 — see
  // `components/OpenExam.tsx`). What they are offered is not the same exam,
  // and the page says so rather than letting them find out at section three.
  const guest = !tokenStore.get();
  const comprehensionCount = exam.sections.filter((s) => s.kind === 'comprehension').length;
  const sectionCount = guest ? comprehensionCount : exam.sections.length;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="flex items-center gap-2 font-display text-3xl font-bold text-navy">
          <ClipboardList className="h-6 w-6 text-teal" />
          {ui === 'en' ? 'Mock exam' : 'Examen blanc'}
        </h1>
        <div className="mt-2 font-display text-xl font-bold text-navy">{t(exam.name, ui)}</div>
        <p className="mt-1 text-ink-secondary">
          {ui === 'en'
            ? `The whole exam, in the official order — ${sectionCount} sections, each timed, section boundaries you cannot cross backwards. It answers the one question a task cannot: are you ready to book.`
            : `L'examen complet, dans l'ordre officiel — ${sectionCount} épreuves, chacune chronométrée, sans retour en arrière entre les épreuves. Il répond à la seule question qu'une tâche ne peut pas : êtes-vous prêt à réserver.`}
        </p>
      </header>

      {guest && (
        <div className="rounded-xl border border-surface-divider bg-white p-4 text-sm text-ink-secondary dark:bg-slate-900">
          {ui === 'en' ? (
            <>
              <strong className="text-navy">No account needed to sit it.</strong> You get the{' '}
              {comprehensionCount} comprehension sections — full length, real timing, one play of
              each recording — scored on this device. Make an account at the end to read the score,
              and to add the writing and speaking sections, which are marked away from your phone.
            </>
          ) : (
            <>
              <strong className="text-navy">Aucun compte nécessaire pour la passer.</strong> Vous
              passez les {comprehensionCount} épreuves de compréhension — durée réelle, une seule
              écoute — corrigées sur cet appareil. Créez un compte à la fin pour lire le résultat,
              et pour ajouter l'expression écrite et orale, corrigées hors de votre téléphone.
            </>
          )}
        </div>
      )}

      {sitting && (
        <div className="rounded-xl border-2 border-teal bg-teal/10 p-4 text-sm text-navy">
          {ui === 'en'
            ? 'A sitting is already in progress. The section clock is running.'
            : "Une session est déjà en cours. Le chronomètre de l'épreuve tourne."}
          <button onClick={() => nav('/section')} className="mt-3 block rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white">
            {ui === 'en' ? 'Resume the sitting' : 'Reprendre la session'}
          </button>
        </div>
      )}

      {canSit ? (
        <button
          onClick={() => { startSitting(exam, guest ? 'comprehension' : undefined); nav('/section'); }}
          className="btn-primary w-full justify-center py-4 text-base"
        >
          {ui === 'en'
            ? `Start the mock exam — ${sectionCount} sections`
            : `Commencer l'examen blanc — ${sectionCount} épreuves`}
          <ChevronRight className="h-4 w-4" />
        </button>
      ) : (
        <div className="card p-6 text-sm text-ink-secondary">
          {ui === 'en'
            ? 'This exam does not yet have a full comprehension sitting built. Practise its tasks in the meantime.'
            : "Cet examen n'a pas encore d'épreuve de compréhension complète. Entraînez-vous à ses tâches en attendant."}
          <Link to="/practice" className="btn-primary mt-4 inline-flex">{ui === 'en' ? 'Go to Practice' : 'Aller à Practice'}</Link>
        </div>
      )}

      {!guest && (
        <Link to="/progress" className="inline-flex items-center gap-2 text-sm font-medium text-teal hover:underline">
          <History className="h-4 w-4" />
          {ui === 'en' ? 'Your past sittings' : 'Vos sessions passées'}
        </Link>
      )}
    </div>
  );
}
