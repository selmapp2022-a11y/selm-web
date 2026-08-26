import { Capacitor } from '@capacitor/core';

// Public privacy policy page — served at /privacy.
//
// Apple's Build 36 rejection under Guideline 3.1.2(c) noted:
//   "The following information needs to be included in the App Store
//    metadata: a functional link to the privacy policy in the Privacy
//    Policy field in App Store Connect."
//
// The URL we had listed (https://selmapp.com/privacy) redirected to the
// login screen because there was no static privacy page on that host.
// This component fixes that: it renders the full privacy policy without
// requiring authentication, so Apple's reviewer (and any user) can read
// the policy directly from the URL in App Store Connect.

const UPDATED = 'July 15, 2026';

// Apple 2.3.10 rejected Build 38 because the iOS binary mentioned
// "Google Play". We show ONLY the platform of the current binary
// (Apple on iOS, Google Play on Android, or both on the web page).
const PLATFORM = Capacitor.getPlatform(); // 'ios' | 'android' | 'web'
const IS_ANDROID = PLATFORM === 'android';
const IS_IOS = PLATFORM === 'ios';
const PAYMENT_STORE = IS_ANDROID
  ? 'Google Play'
  : IS_IOS
    ? 'Apple'
    : 'Apple or Google Play';
const MANAGE_SUB = IS_ANDROID
  ? 'your Google account settings on Google Play'
  : IS_IOS
    ? 'your Apple ID account settings on the App Store'
    : 'your Apple ID or Google account subscription settings';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white text-navy dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-6 py-4">
          <img src="/selm-icon.png" alt="" className="h-8 w-8 rounded-lg" />
          <div>
            <div className="text-base font-bold">SELM</div>
            <div className="text-[11px] uppercase tracking-wider text-ink-secondary">English, Simply</div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="mb-2 font-display text-3xl font-bold">Privacy Policy</h1>
        <p className="mb-8 text-sm text-ink-secondary dark:text-slate-400">
          Last updated: {UPDATED}
        </p>

        <div className="prose prose-slate max-w-none space-y-6 text-base leading-relaxed dark:prose-invert">
          <section>
            <h2 className="text-xl font-bold">1. Who we are</h2>
            <p>
              SELM ("we", "us", "our") is operated by Selm Mobile Application Inc.
              We provide an AI-powered English learning app on iOS, Android,
              and the web. This policy explains what personal information we
              collect, how we use it, who we share it with, and the choices
              you have.
            </p>
            <p>Contact: admin@selmapp.com</p>
          </section>

          <section>
            <h2 className="text-xl font-bold">2. Information we collect</h2>
            <p>We collect only what we need to run the app:</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong>Account information</strong> — email address, display
                name, and (if you use Sign in with Apple) the private-relay
                email Apple provides. We do NOT collect passwords when you
                sign in with Apple.
              </li>
              <li>
                <strong>Learning progress</strong> — your CEFR level, XP,
                streak, completed lessons, and saved vocabulary.
              </li>
              <li>
                <strong>Text you write</strong> in Speaking, Writing, Reading,
                and Listening exercises so we can score it and give feedback.
              </li>
              <li>
                <strong>Audio you record</strong> when you tap the microphone
                in Speaking so we can transcribe and score your pronunciation.
              </li>
              <li>
                <strong>Purchase data</strong> — an anonymous receipt token
                from {PAYMENT_STORE} that confirms your subscription. We do
                not receive your credit-card number.
              </li>
              <li>
                <strong>Diagnostics</strong> — anonymous crash reports and
                error logs that help us fix bugs.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold">3. How we use your information</h2>
            <ul className="ml-6 list-disc space-y-2">
              <li>Provide, personalise, and improve the SELM learning experience.</li>
              <li>Generate AI feedback, pronunciation scoring, and IELTS-style assessments.</li>
              <li>Sync your progress across your devices.</li>
              <li>Verify your subscription and prevent fraud.</li>
              <li>Fix crashes and diagnose bugs.</li>
              <li>Reply to support requests when you contact us.</li>
            </ul>
            <p>
              We do <strong>not</strong> sell your personal information, and
              we do <strong>not</strong> use it for advertising.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">4. Third-party AI services we share with</h2>
            <p>
              To power the learning features you use, we send certain data to
              specialised AI processors. They act only on our behalf and are
              contractually forbidden from using your content to train their
              own models:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong>Google Gemini</strong> — receives the text you write
                in Writing, Reading, and lesson answers so we can grade it
                and give feedback.
              </li>
              <li>
                <strong>Google Cloud Speech-to-Text</strong> — receives the
                audio you record in Speaking so we can transcribe your
                speech into text.
              </li>
              <li>
                <strong>SpeechAce</strong> — receives the same audio you
                record in Speaking so we can score your pronunciation,
                stress, fluency, and intonation and return CEFR- and
                IELTS-style feedback.
              </li>
              <li>
                <strong>ElevenLabs</strong> — synthesises the model voices
                you hear in Listening exercises from text; it does not
                receive your personal recordings.
              </li>
              <li>
                <strong>RevenueCat</strong> — validates your {PAYMENT_STORE}
                subscription receipt on our behalf.
              </li>
              <li>
                <strong>{PAYMENT_STORE}</strong> — process{IS_ANDROID || IS_IOS ? 'es' : ''} the actual
                payment when you subscribe.
              </li>
            </ul>
            <p>
              Before any of the above happens for the first time, we show you
              a consent screen inside the app and require you to explicitly
              accept.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">5. Where your data lives</h2>
            <p>
              Your account and learning progress are stored on servers
              operated by our infrastructure provider in Canada and the
              United States. AI processing may occur in the regions our
              third-party providers operate in (primarily the United States
              and the European Union). All data is encrypted in transit
              using TLS and at rest.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">6. How long we keep your data</h2>
            <p>
              We keep your account and progress for as long as you have an
              active SELM account. If you delete your account (see below),
              we remove or anonymise personal identifiers within 30 days.
              Anonymised, aggregated data may be kept for analytics and
              improvement of the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">7. Your rights and choices</h2>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong>Access, correct, or export</strong> your data — email
                admin@selmapp.com and we will respond within 30 days.
              </li>
              <li>
                <strong>Delete your account</strong> from inside the app:
                open <em>Settings → Delete account → Delete my account</em>.
                This permanently removes your personal identifiers.
              </li>
              <li>
                <strong>Withdraw consent</strong> for AI processing — because
                the AI features are the core of SELM, withdrawing consent
                requires deleting your account (above).
              </li>
              <li>
                <strong>Manage your subscription</strong> in {MANAGE_SUB} at
                any time.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold">8. Children</h2>
            <p>
              SELM is rated 4+ on the App Store but is not directed at
              children under 13. We do not knowingly collect personal
              information from children under 13. If you believe we have,
              please contact admin@selmapp.com and we will delete it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">9. Changes to this policy</h2>
            <p>
              We may update this policy from time to time. When we make
              material changes we will update the "Last updated" date at
              the top of this page and, where required by law, notify you
              inside the app before the change takes effect.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">10. Contact</h2>
            <p>
              Questions or requests about this policy or your data?
              <br />
              Email: <a href="mailto:admin@selmapp.com" className="text-navy hover:underline">admin@selmapp.com</a>
              <br />
              Selm Mobile Application Inc., Vancouver, BC, Canada.
            </p>
          </section>
        </div>

        <footer className="mt-16 border-t border-slate-200 pt-6 text-sm text-ink-secondary dark:border-slate-800 dark:text-slate-400">
          © 2026 Selm Mobile Application Inc. — <a href="/" className="text-navy hover:underline">Return to SELM</a>
        </footer>
      </main>
    </div>
  );
}
