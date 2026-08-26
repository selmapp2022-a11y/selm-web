import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Sparkles, Mic, Lock, CreditCard, ExternalLink } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Logo } from '../components/Logo';
import { tokenStore } from '../lib/api';

// Which payment platform runs THIS binary. Apple rejected Build 38 v2.0.7
// under Guideline 2.3.10 because the iOS binary mentioned "Google Play"
// (irrelevant to App Store users). We must show ONLY the platform that
// actually runs the current build.
const PLATFORM = Capacitor.getPlatform(); // 'ios' | 'android' | 'web'
const IS_ANDROID = PLATFORM === 'android';
const PAYMENT_NAME = IS_ANDROID ? 'Google Play' : 'Apple';
const PAYMENT_ACCOUNT = IS_ANDROID ? 'Google account' : 'Apple ID';

// Privacy Consent screen — Build 38 / v2.0.7.
//
// Apple STILL rejected Build 37 under 5.1.1(i) + 5.1.2(i) even though
// the earlier consent screen named Gemini, Google Speech and ElevenLabs.
// Reviewer wrote: "The app appears to share the user's personal data
// with a third-party AI service but the app does not clearly explain
// what data is sent, identify who the data is sent to, and ask the
// user's permission before sharing the data."
//
// Root causes found on close reading:
//   1) The old screen linked to `selmapp.com/terms`, which does NOT
//      exist as a public route — it hit the SPA catch-all and bounced
//      through ProtectedRoute to /login. A reviewer clicking the link
//      would see a login page, not terms. That alone is a rejection
//      trigger.
//   2) The consent was a single "I understand & agree" button. Apple's
//      requirement is to "obtain the user's permission" — a passive
//      button is weaker than an explicit checkbox the user has to
//      actively tick. This build uses an unchecked checkbox that MUST
//      be ticked before the primary CTA enables.
//   3) The old copy named Gemini + Google Speech + ElevenLabs but did
//      NOT name RevenueCat (which receives the subscription receipt)
//      or Apple/Google Play (which receive the payment). This build
//      lists every processor the app touches.
//   4) The old copy did not include the "same or equal protection"
//      guarantee that App Store Guideline 5.1.2(i) requires. This
//      build states it explicitly on-screen (not just in the policy).
//   5) There was no way to decline. This build adds a "Not now" button
//      that closes the flow without setting the consent flag.
//
// The consent choice is stored in localStorage. AuthStore's guard
// (App.tsx's ConsentGate, plus ProtectedRoute) routes any user
// without the flag here BEFORE any personal data can leave the device.

const CONSENT_KEY = 'selm_privacy_consent_v2'; // v2 because the copy changed materially

export function hasPrivacyConsent(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === 'accepted';
  } catch {
    return false;
  }
}

export function setPrivacyConsent(): void {
  try {
    localStorage.setItem(CONSENT_KEY, 'accepted');
  } catch {
    /* localStorage disabled — silently ignore, we'll re-prompt next session */
  }
}

type Row = {
  icon: JSX.Element;
  title: string;
  data: string;
  purpose: string;
};

const ROWS: Row[] = [
  {
    icon: <Sparkles className="h-4 w-4" />,
    title: 'Google Gemini',
    data: 'The English text you write in Speaking, Writing, Reading, and lesson answers',
    purpose: 'to score your writing and generate personalised AI feedback.',
  },
  {
    icon: <Mic className="h-4 w-4" />,
    title: 'Google Cloud Speech-to-Text',
    data: 'The short audio clips you record when you tap the microphone in Speaking',
    purpose: 'to transcribe what you said into text so we can compare it to the target sentence.',
  },
  {
    icon: <Mic className="h-4 w-4" />,
    title: 'SpeechAce',
    data: 'The same audio clips you record in Speaking',
    purpose: 'to score your pronunciation, stress, fluency, and intonation and return CEFR / IELTS-style feedback.',
  },
  {
    icon: <Sparkles className="h-4 w-4" />,
    title: 'ElevenLabs',
    data: 'Only lesson text (never your own audio)',
    purpose: 'to synthesise the AI voices you hear in Listening exercises.',
  },
  {
    icon: <CreditCard className="h-4 w-4" />,
    title: 'RevenueCat',
    data: `Your anonymous ${PAYMENT_NAME} receipt token`,
    purpose: 'to verify that your SELM Pro subscription is active.',
  },
  {
    icon: <Lock className="h-4 w-4" />,
    title: PAYMENT_NAME,
    data: `Your ${PAYMENT_ACCOUNT} identifier and payment method (handled entirely by ${IS_ANDROID ? 'Google' : 'Apple'})`,
    purpose: `to process the actual subscription payment. SELM never sees your card number.`,
  },
];

export default function ConsentPage() {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);

  const handleAgree = () => {
    if (!agreed) return;
    setPrivacyConsent();
    // Send authenticated users straight to the dashboard so a
    // returning user updating from Build 34/35/36/37 (who already has
    // a valid session token in localStorage) doesn't get bounced
    // through the login page again.
    if (tokenStore.get()) {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  const handleDecline = () => {
    // Do NOT set the consent flag. Just send them to /login without
    // marking consent granted. If they later try to sign in, they'll
    // land back here first.
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-app via-white to-teal/5 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex justify-center"><Logo /></div>

        <div className="card p-6 sm:p-8">
          <div className="mb-4 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-navy dark:bg-teal-900/30 dark:text-teal-300">
              <Shield className="h-7 w-7" />
            </div>
          </div>

          <h1 className="text-center text-2xl font-display font-bold text-navy dark:text-white">
            Your data & AI processors
          </h1>
          <p className="mt-2 text-center text-sm text-ink-secondary dark:text-slate-400">
            SELM uses AI to coach your English. Before we send anything on
            your behalf, here is exactly what we share, who it goes to,
            and why. Nothing leaves your device until you accept below.
          </p>

          {/* Structured row per processor.  Each row spells out
              (a) WHO receives data, (b) WHAT data, (c) WHY.
              Directly addresses App Store Guideline 5.1.1(i) /
              5.1.2(i). */}
          <div className="mt-6 space-y-4">
            {ROWS.map((row) => (
              <div key={row.title} className="flex gap-3">
                <div className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-200">
                  {row.icon}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-navy dark:text-white">{row.title}</div>
                  <p className="text-sm text-ink-secondary dark:text-slate-400">
                    <span className="font-medium text-navy dark:text-slate-200">Data:</span> {row.data}.{' '}
                    <span className="font-medium text-navy dark:text-slate-200">Purpose:</span> {row.purpose}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Contractual guarantee — Apple Guideline 5.1.2(i) requires
              us to confirm the third parties provide the same or equal
              protection. State it inline, not just in the policy. */}
          <div className="mt-5 rounded-xl border border-teal-200 bg-teal-50 p-3 text-xs text-navy dark:border-teal-800 dark:bg-teal-900/20 dark:text-teal-100">
            <b>Our commitment.</b> Every processor listed above is bound
            by a data-processing agreement that provides the same or
            greater level of protection required by our Privacy Policy.
            None of them may use your content to train their own AI
            models. We do not sell your data. You can delete your
            account and all of its data at any time from Settings.
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-ink-secondary dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
            Full details, including retention periods and your rights,
            are in our{' '}
            <a
              href="https://selmapp.com/privacy"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 font-semibold text-navy hover:underline dark:text-teal-300"
            >
              Privacy Policy
              <ExternalLink className="h-3 w-3" />
            </a>
            {' '}and{' '}
            <a
              href="https://selmapp.com/terms"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 font-semibold text-navy hover:underline dark:text-teal-300"
            >
              Terms of Use
              <ExternalLink className="h-3 w-3" />
            </a>
            . Only including this information in the policy is not
            enough on its own — that is why we are asking you to accept
            here as well.
          </div>

          {/* Explicit unchecked checkbox — Apple Guideline 5.1.1(i)
              requires the user to *actively* grant permission. */}
          <label
            htmlFor="selm-consent-checkbox"
            className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
          >
            <input
              id="selm-consent-checkbox"
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-5 w-5 flex-none rounded border-slate-400 text-navy focus:ring-teal-500"
            />
            <span className="text-sm text-navy dark:text-slate-100">
              I have read the above and I agree to SELM sharing the
              listed data with the listed AI service providers for the
              stated purposes.
            </span>
          </label>

          <div className="mt-4 flex gap-2">
            <button
              onClick={handleDecline}
              className="flex-1 rounded-xl border border-slate-300 bg-white py-3 text-sm font-semibold text-ink-secondary transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Not now
            </button>
            <button
              onClick={handleAgree}
              disabled={!agreed}
              className="flex-[2] rounded-xl bg-navy py-3 text-sm font-bold text-white shadow-sm transition hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Agree & continue
            </button>
          </div>

          <p className="mt-3 text-center text-xs text-ink-secondary dark:text-slate-500">
            You can revoke this consent by deleting your account in
            Settings. Withdrawal of consent for AI processing requires
            account deletion because the AI features are the core of
            SELM.
          </p>
        </div>
      </div>
    </div>
  );
}
