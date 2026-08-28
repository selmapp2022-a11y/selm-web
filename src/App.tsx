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
import SettingsPage from './pages/SettingsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import ConsentPage, { hasPrivacyConsent } from './pages/ConsentPage';
import { initTheme } from './lib/theme';
import PracticePage from './pages/PracticePage';
import MockExamPage from './exam/pages/MockExamPage';
// The exam engine, folded in from its old separate /exam.html entry point
// (SELM-IA.md §1: one app, one router, one navigation). These pages used to
// live behind ExamGate in a HashRouter; here they are ordinary protected
// routes, so ProtectedRoute (account) and the consent gate before login cover
// what ExamGate did.
import GoalPage from './exam/pages/GoalPage';
import TaskPage from './exam/pages/TaskPage';
import ResultPage from './exam/pages/ResultPage';
import SectionPage from './exam/pages/SectionPage';
import SittingResultPage from './exam/pages/SittingResultPage';
import HistoryPage from './exam/pages/HistoryPage';
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
    return <Navigate to="/consent" replace state={{ from: location.pathname }} />;
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
          <Route path="/speaking" element={<SpeakingPage />} />
          <Route path="/listening" element={<ListeningPage />} />
          <Route path="/reading" element={<ReadingPage />} />
          <Route path="/writing" element={<WritingPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/vocabulary" element={<VocabularyPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          {/* Paywall — reachable from the crown icon in the header and
              from the Upgrade card on the Dashboard. `/upgrade` and
              `/paywall` both resolve to the same page so we can point
              App Review at either without breaking their notes. */}
          <Route path="/upgrade" element={<PaywallPage />} />
          <Route path="/paywall" element={<PaywallPage />} />
          {/* Settings — exposes the Delete Account flow required by
              App Store Guideline 5.1.1(v). Reachable from the sidebar
              entry with the same name. */}
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/account" element={<SettingsPage />} />

          {/* Exam engine, now in-app (SELM-IA.md §1). Provisional paths for
              this step; §2 renames the navigation. `/exam.html` redirects
              here so old links and bookmarks keep working. */}
          <Route path="/goal" element={<GoalPage />} />
          <Route path="/attestation" element={<AttestationPage />} />
          <Route path="/plan" element={<PlanPage />} />
          <Route path="/task" element={<TaskPage />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/exam" element={<MockExamPage />} />
          <Route path="/section" element={<SectionPage />} />
          <Route path="/sitting-result" element={<SittingResultPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
