import { useNavigate } from 'react-router-dom';
import { Shield, Sparkles, Mic, ExternalLink } from 'lucide-react';
import { Logo } from '../components/Logo';
import { tokenStore } from '../lib/api';

// Privacy Consent screen (App Store Guideline 5.1.1(i) / 5.1.2(i)).
// Apple rejected Build 35 with:
//   "The app appears to share the user's personal data with a third-party
//    AI service but the app does not clearly explain what data is sent,
//    identify who the data is sent to, and ask the user's permission
//    before sharing the data."
//
// We show this screen the first time the app is opened. The user must
// tap "I Understand & Agree" to proceed. The choice is stored in
// localStorage so returning users aren't re-prompted. AuthStore's guard
// (in App.tsx) routes any unauthenticated user without the consent flag
// here BEFORE the login page can be reached.

const CONSENT_KEY = 'selm_privacy_consent_v1';

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

export default function ConsentPage() {
  const navigate = useNavigate();

  const handleAgree = () => {
    setPrivacyConsent();
    // Send authenticated users straight to the dashboard so a
    // returning user updating from Build 34/35 (who already has a
    // valid session token in localStorage) doesn't get bounced
    // through the login page again.
    if (tokenStore.get()) {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-app via-white to-teal/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center"><Logo /></div>

        <div className="card p-6 sm:p-8">
          <div className="mb-4 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-300">
              <Shield className="h-7 w-7" />
            </div>
          </div>

          <h1 className="text-center text-2xl font-display font-bold text-navy dark:text-white">
            Before you sign in
          </h1>
          <p className="mt-2 text-center text-sm text-ink-secondary dark:text-slate-400">
            SELM uses AI to coach your English. Here's what you should know
            before we send anything on your behalf.
          </p>

          {/* Line-item disclosures — each covers one of the four points
              Apple listed in the rejection: what data, who receives it,
              why, and where to read the policy. */}
          <div className="mt-6 space-y-4">
            <div className="flex gap-3">
              <div className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-200">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <div className="font-semibold text-navy dark:text-white">Text you write is sent to Google Gemini</div>
                <p className="text-sm text-ink-secondary dark:text-slate-400">
                  Your writing, reading responses, and lesson answers are
                  processed by Google's Gemini AI to score them and give
                  you feedback. Google acts as our processor.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-200">
                <Mic className="h-4 w-4" />
              </div>
              <div>
                <div className="font-semibold text-navy dark:text-white">Audio you record is sent to Google Speech and ElevenLabs</div>
                <p className="text-sm text-ink-secondary dark:text-slate-400">
                  When you tap "Start recording", your speech is
                  transcribed by Google Speech-to-Text and scored by our
                  pronunciation service. Text-to-speech playback is
                  synthesized by ElevenLabs or Google.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <div className="font-semibold text-navy dark:text-white">We don't sell your data</div>
                <p className="text-sm text-ink-secondary dark:text-slate-400">
                  Data is only used to run these features and improve your
                  learning progress. It is not sold, shared for advertising,
                  or used to train third-party models. You can delete your
                  account at any time.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-ink-secondary dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
            Full details in our{' '}
            <a
              href="https://selmapp.com/privacy"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 font-semibold text-teal-600 hover:underline dark:text-teal-300"
            >
              Privacy Policy
              <ExternalLink className="h-3 w-3" />
            </a>{' '}
            and{' '}
            <a
              href="https://selmapp.com/terms"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 font-semibold text-teal-600 hover:underline dark:text-teal-300"
            >
              Terms of Service
              <ExternalLink className="h-3 w-3" />
            </a>
            .
          </div>

          <button
            onClick={handleAgree}
            className="btn-primary mt-6 w-full"
          >
            I understand & agree
          </button>

          <p className="mt-3 text-center text-xs text-ink-disabled dark:text-slate-500">
            Tap "I understand & agree" to grant SELM permission to send
            the data described above to the listed AI services. You can
            revoke this by deleting your account.
          </p>
        </div>
      </div>
    </div>
  );
}
