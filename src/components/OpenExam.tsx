import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { tokenStore } from '../lib/api';
import { hasPrivacyConsent } from '../pages/ConsentPage';
import { AppLayout } from './AppLayout';
import { Logo } from './Logo';

/**
 * ── THE FREE MOCK, WITHOUT AN ACCOUNT ────────────────────────────────────
 *
 * Ruling of 31 August 2026. The whole marketing argument for the site is that
 * someone who googles "which test does Canada accept" can sit a free mock
 * exam. Until now that link landed on `/exam`, which was inside
 * `ProtectedRoute`, so the visitor met a consent screen and then a sign-up
 * form before a single question. Every page of search work was spent on a
 * door that was locked.
 *
 * So the door opens, and the ONLY thing that stays behind the account is the
 * result — the candidate sits the exam, then makes an account to read the
 * score. Two components carry that:
 *
 *   OpenExamLayout   chrome for a route that both a guest and a signed-in
 *                    candidate can be on
 *   AccountRequired  the one remaining wall, placed at the result
 *
 * What is NOT relaxed: the privacy consent. A guest sitting runs the
 * comprehension sections only, and those are scored on the device — "no
 * judge, no vendor", in the words of `exam/state.ts`. Nothing leaves the
 * browser, so there is nothing to consent to yet. The moment anything does
 * leave — creating the account, or a writing/speaking task, which posts to
 * the backend and from there to a third-party model — the consent screen is
 * still ahead of it, because `/register`, `/login` and `ProtectedRoute` all
 * still hold it. App Store Guideline 5.1.1(i) asks for consent before
 * personal data is sent, and it still lands there.
 */

/**
 * A signed-in candidate gets the app they know — sidebar, tab bar, their
 * name. A guest gets a shell with no navigation at all, because every tab
 * would lead to a route they cannot enter, and an exam is the one screen
 * where a stray tap is expensive.
 */
export function OpenExamLayout() {
  const loc = useLocation();
  if (tokenStore.get()) {
    // A SIGNED-IN candidate is exactly who ProtectedRoute used to hold here,
    // and it held the consent too. Dropping this route out of ProtectedRoute
    // must not drop that: someone updating from an older build carries a
    // valid token and has never seen the consent screen.
    if (!hasPrivacyConsent()) {
      return <Navigate to={`/consent?next=${encodeURIComponent(loc.pathname + loc.search)}`} replace />;
    }
    return <AppLayout />;
  }
  return (
    <div className="min-h-screen bg-surface-app">
      <header className="border-b border-surface-divider bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Logo />
          <span className="text-xs font-medium text-ink-secondary">Free mock exam</span>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-3xl px-4 py-6 md:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

/**
 * The result is the wall. A candidate arriving here without an account is
 * sent to `/register` carrying where to come back to — and their sitting is
 * in `localStorage`, so it survives the full page load that returning them
 * costs. `claimCandidateRecord` then adopts the ownerless record for the
 * account they just made, which is the branch that file documents as
 * "adopted by the candidate now signing in rather than deleted".
 *
 * `/register` rather than `/login` deliberately: someone who has just sat a
 * mock exam as a guest does not have an account. The sign-in link on that
 * page carries the same `next`.
 */
export function AccountRequired() {
  const loc = useLocation();
  if (tokenStore.get()) return <Outlet />;
  const next = encodeURIComponent(loc.pathname + loc.search);
  return <Navigate to={`/register?next=${next}`} replace />;
}
