import { useEffect, useState } from 'react';
import { LogIn, ShieldCheck } from 'lucide-react';
import { auth, tokenStore } from '../../lib/api';
import { hasPrivacyConsent } from '../../pages/ConsentPage';
import { useExam } from '../state';

/**
 * The door on `/exam.html`, which was standing open.
 *
 * Raised in the review of THE PLAN, then again, then again, and finally
 * carried into **Amendment 1 §3.4**, whose argument is not really about
 * security:
 *
 * > *"A candidate can sit the entire diagnostic without an account, and
 * > therefore can never be asked for an attestation. The highest-value
 * > funnel has an open door at the top of it."*
 *
 * The amendment moves it into §2.6 — beside the other offer points — and
 * that is the right place for it, because the reason to know who is sitting
 * is so that the question can be asked at all.
 *
 * **Free is not the same as anonymous.** Part 3 §1.3 keeps the diagnostic
 * free and keeps it optional; neither is affected by requiring an account.
 *
 * Two conditions, in this order, and the order matters:
 *
 *   1. **Consent.** The exam sends the candidate's writing and their
 *      recorded voice to third-party services the moment a task is scored.
 *      App Store Guideline 5.1.1(i) requires informed consent BEFORE that
 *      happens, and `/exam.html` was reaching those services without ever
 *      passing the screen that asks. That is the more serious half of this.
 *   2. **An account**, verified the same way `ProtectedRoute` verifies it —
 *      a token is not proof, so `/me` is called.
 *
 * `/exam.html` is a separate document, so leaving it is a real navigation
 * rather than a route change, and the destination carries `next` so the
 * candidate comes back to the exam they were trying to sit.
 */
type State = 'checking' | 'ok' | 'needs-consent' | 'needs-account';

const APP = (path: string) => {
  const next = encodeURIComponent('/exam.html' + window.location.hash);
  return `${window.location.origin}${path}?next=${next}`;
};

export default function ExamGate({ children }: { children: JSX.Element }) {
  const { ui } = useExam();
  const [state, setState] = useState<State>('checking');

  useEffect(() => {
    let live = true;
    (async () => {
      if (!hasPrivacyConsent()) { if (live) setState('needs-consent'); return; }
      if (!tokenStore.get()) { if (live) setState('needs-account'); return; }
      try {
        await auth.me();
        if (live) setState('ok');
      } catch {
        // An expired or forged token is the same as none. Clearing it
        // stops the candidate bouncing between a stale token and a login
        // screen that thinks they already have one.
        tokenStore.clear();
        if (live) setState('needs-account');
      }
    })();
    return () => { live = false; };
  }, []);

  if (state === 'ok') return children;

  if (state === 'checking') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy/20 border-t-navy" />
      </div>
    );
  }

  const consent = state === 'needs-consent';
  const title = consent
    ? ui === 'en' ? 'One thing to agree to first' : "Une chose à accepter d'abord"
    : ui === 'en' ? 'Sign in to sit the exam' : "Connectez-vous pour passer l'examen";
  const body = consent
    ? ui === 'en'
      ? 'Marking your writing and your recorded voice means sending them to services outside SELM. We ask before that happens, not after — and this exam had been reaching those services without asking.'
      : "Corriger votre écrit et votre voix enregistrée suppose de les transmettre à des services extérieurs à SELM. Nous demandons avant, non après — et cet examen atteignait ces services sans le demander."
    : ui === 'en'
      ? 'The exam is free and it stays free. An account exists so your results are yours, so a plan can be built from them, and so we can ask whether you already hold an official attestation.'
      : "L'examen est gratuit et le reste. Le compte existe pour que vos résultats vous appartiennent, qu'un plan puisse en découler, et que nous puissions vous demander si vous détenez déjà une attestation officielle.";

  return (
    <div className="mx-auto max-w-lg space-y-5 py-12">
      <div className="flex items-center gap-2 text-teal">
        {consent ? <ShieldCheck className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
      </div>
      <h1 className="font-display text-3xl font-bold text-navy">{title}</h1>
      <p className="text-ink-secondary">{body}</p>
      <div className="flex flex-wrap gap-3">
        <a
          href={APP(consent ? '/consent' : '/login')}
          className="rounded-xl bg-navy px-5 py-3 text-sm font-semibold text-white"
        >
          {consent
            ? ui === 'en' ? 'Read it and decide' : 'Lire et décider'
            : ui === 'en' ? 'Sign in' : 'Se connecter'}
        </a>
        {!consent && (
          <a
            href={APP('/register')}
            className="rounded-xl border-2 border-surface-divider px-5 py-3 text-sm font-medium text-ink-secondary"
          >
            {ui === 'en' ? 'Create an account' : 'Créer un compte'}
          </a>
        )}
      </div>
      <p className="text-xs text-ink-secondary">
        {ui === 'en'
          ? 'You will come back to this exam afterwards.'
          : "Vous reviendrez ensuite à cet examen."}
      </p>
    </div>
  );
}
