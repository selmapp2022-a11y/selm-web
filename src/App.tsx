import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AppLayout } from './components/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import SpeakingPage from './pages/SpeakingPage';
import ListeningPage from './pages/ListeningPage';
import ReadingPage from './pages/ReadingPage';
import WritingPage from './pages/WritingPage';
import VocabularyPage from './pages/VocabularyPage';
import ProgressPage from './pages/ProgressPage';
import PaywallPage from './pages/PaywallPage';
import MePage from './pages/MePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import ConsentPage, { hasPrivacyConsent } from './pages/ConsentPage';
import { OpenExamLayout, AccountRequired } from './components/OpenExam';
import { initTheme } from './lib/theme';
import PracticePage from './pages/PracticePage';
import MockExamPage from './exam/pages/MockExamPage';
// The exam engine, folded in from its old separate /exam.html entry point
// (SELM-IA.md §1: one app, one router, one navigation). These pages used to
// live behind ExamGate in a HashRouter; here they are ordinary protected
// routes, so ProtectedRoute (account) and the consent gate before login cover
// what ExamGate did.
import TaskPage from './exam/pages/TaskPage';
import ResultPage from './exam/pages/ResultPage';
import SectionPage from './exam/pages/SectionPage';
import SittingResultPage from './exam/pages/SittingResultPage';
import AttestationPage from './exam/pages/AttestationPage';
import PlanPage from './exam/pages/PlanPage';

// Gate every unauthenticated entry route through the privacy consent
// screen unless the user has already accepted. This satisfies App Store
// Guideline 5.1.1(i) / 5.1.2(i): the user must give informed consent
// BEFORE any personal data (text, audio) is sent to a third-party AI
// service, which happens the moment they hit Speaking / Writing / etc.
// Since account creation itself sends the email to our backend, the
// consent must land ahead of both login and register.
function ConsentGate({ children }: { children: JSX.Element }) {
  const location = useLocation();
  const allowedWithoutConsent = ['/consent', '/forgot-password', '/reset-password'];
  const isAllowed = allowedWithoutConsent.some((p) => location.pathname.startsWith(p));
  if (!hasPrivacyConsent() && !isAllowed) {
    // Carry the destination. Until 31 August this dropped it — a candidate
    // sent to `/register?next=/sitting-result` after a guest sitting arrived
    // at `/consent`, accepted, and was put on `/login` with the exam they had
    // just finished nowhere in sight. `ConsentPage` already reads `next`.
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/consent?next=${next}`} replace />;
  }
  return children;
}

export default function App() {
  useEffect(() => { initTheme(); }, []);
  return (
    <Routes>
      {/* Privacy consent — must be reachable without auth, and
          without triggering the ConsentGate loop. */}
      <Route path="/consent" element={<ConsentPage />} />

      {/* Public Privacy Policy page — the URL Apple's App Store Connect
          field points at. Must render without auth so App Review (and
          anyone else who follows the link from the App Store listing)
          can read it directly. Guideline 3.1.2(c) requires this link
          to be functional; previously /privacy hit the SPA catch-all
          and bounced to /login, which caused rejection. */}
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

      {/* Public Terms of Use / EULA page — required by App Store
          Guideline 3.1.2(c) for auto-renewable subscription apps.
          Build 38 v2.0.7 was rejected because no functional Terms
          of Use link was included in the app. Kept public so the
          reviewer can open it from the paywall link without needing
          to sign in first. */}
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/terms-of-use" element={<TermsPage />} />
      <Route path="/eula" element={<TermsPage />} />

      {/* Public auth routes — wrapped in the ConsentGate so the user
          can't reach the login/register form until they've read the AI
          data-sharing notice. */}
      <Route path="/login" element={<ConsentGate><LoginPage /></ConsentGate>} />
      <Route path="/register" element={<ConsentGate><RegisterPage /></ConsentGate>} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* ── THE FREE MOCK EXAM, OPEN ────────────────────────────────────
          Ruling of 31 August 2026. `/exam` was inside ProtectedRoute, so the
          visitor the marketing site was built to attract — someone who
          googled "which test does Canada accept" and followed the CTA — met
          a consent screen and a sign-up form before a single question. The
          exam now starts without an account; the RESULT is what needs one.
          `components/OpenExam.tsx` carries the reasoning and the limits. */}
      <Route element={<OpenExamLayout />}>
        <Route path="/exam" element={<MockExamPage />} />
        <Route path="/section" element={<SectionPage />} />
        <Route element={<AccountRequired />}>
          <Route path="/sitting-result" element={<SittingResultPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {/* IA §2: Today is the home route. /dashboard stays as an alias. */}
          <Route path="/" element={<DashboardPage />} />
          {/* Part 3 (replacement) §1 and §6: one choice, one question, then
              start. The five demographic questions and the adaptive CEFR
              placement test that used to live at these two paths are gone —
              §6 requires "no placement step anywhere", and the exam gives
              every candidate the same tasks, so there is nothing to place
              them on. Both old paths still resolve so that a link in an old
              email or a bookmarked route does not 404; neither runs a test. */}
          {/* IA section 6: onboarding is Today's empty state, not a page. */}
          <Route path="/onboarding" element={<Navigate to="/" replace />} />
          <Route path="/onboarding/profile" element={<Navigate to="/" replace />} />
          <Route path="/onboarding/assessment" element={<Navigate to="/" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* ── THE SKILL PAGES LIVE UNDER PRACTICE ──────────────────────
              IA ruling §1.3: `/listening` etc. become `/practice/listening`
              etc., old paths 301.

              The path was lying about the hierarchy. A skill page is not a
              destination — it is what Practice opens, and the tab bar shows
              Practice as current while the URL claims a sibling of it. The
              old paths still resolve, because a candidate's bookmark and a
              link in an old email are not ours to break. */}
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/practice/speaking" element={<SpeakingPage />} />
          <Route path="/practice/listening" element={<ListeningPage />} />
          <Route path="/practice/reading" element={<ReadingPage />} />
          <Route path="/practice/writing" element={<WritingPage />} />
          <Route path="/practice/vocabulary" element={<VocabularyPage />} />
          <Route path="/speaking" element={<Navigate to="/practice/speaking" replace />} />
          <Route path="/listening" element={<Navigate to="/practice/listening" replace />} />
          <Route path="/reading" element={<Navigate to="/practice/reading" replace />} />
          <Route path="/writing" element={<Navigate to="/practice/writing" replace />} />
          <Route path="/vocabulary" element={<Navigate to="/practice/vocabulary" replace />} />

          <Route path="/progress" element={<ProgressPage />} />
          {/* Paywall — reachable from the crown icon in the header and
              from the Upgrade card on the Dashboard. `/upgrade` and
              `/paywall` both resolve to the same page so we can point
              App Review at either without breaking their notes. */}
          <Route path="/upgrade" element={<PaywallPage />} />
          <Route path="/paywall" element={<PaywallPage />} />
          {/* ── /me — YOU ───────────────────────────────────────────────
              Three routes merged into one (IA ruling §1.3). `/me` holds the
              exam and destination, past results, the account, appearance and
              sign out — which is why the theme switcher and the sign-out
              could come out of the sidebar (D4, D5): they had two homes only
              because there were two places that could own them.

              The Delete Account flow required by App Store Guideline
              5.1.1(v) is inside it, one tap from the `You` tab and one from
              the gear in the phone header. `/settings` was the path App
              Review was given; it still resolves. */}
          <Route path="/me" element={<MePage />} />
          <Route path="/settings" element={<Navigate to="/me" replace />} />
          <Route path="/account" element={<Navigate to="/me" replace />} />
          <Route path="/goal" element={<Navigate to="/me" replace />} />

          {/* Exam engine, now in-app (SELM-IA.md §1). `/exam.html` redirects
              here so old links and bookmarks keep working. */}
          <Route path="/attestation" element={<AttestationPage />} />
          <Route path="/plan" element={<PlanPage />} />
          <Route path="/task" element={<TaskPage />} />
          <Route path="/result" element={<ResultPage />} />
          {/* D8 — past sittings were split across `/history` and
              `/progress`, and `/history` → `/exam` → `/history` was a
              circular dead end with no third exit. `/progress` already draws
              every sitting AND every practice attempt against the target, so
              the second page was the poorer half of a duplication rather
              than a second view of it. */}
          <Route path="/history" element={<Navigate to="/progress" replace />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
