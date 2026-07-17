// Public Terms of Use / EULA page — served at /terms.
//
// Apple Guideline 3.1.2(c) rejected Build 38 v2.0.7 because the app
// did not include a functional link to the Terms of Use (EULA). Build
// 38 had actually REMOVED the /terms link from the Consent screen
// because the previous version linked to a route that did not exist.
// This page fixes that properly: a real Terms of Use component with
// EULA content, rendered without authentication so Apple's reviewer
// (and any user) can read it directly from the link in the paywall
// and the consent screen.
//
// Content note: this is a standard consumer-facing EULA for a
// paid subscription app. If the SELM legal team ever produces a
// negotiated EULA, replace the body of this file with theirs.
// The URL structure (/terms) must remain the same.

const UPDATED = 'July 15, 2026';

export default function TermsPage() {
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
        <h1 className="mb-2 font-display text-3xl font-bold">Terms of Use</h1>
        <p className="mb-8 text-sm text-ink-secondary dark:text-slate-400">
          Last updated: {UPDATED}
        </p>

        <div className="prose prose-slate max-w-none space-y-6 text-base leading-relaxed dark:prose-invert">
          <section>
            <h2 className="text-xl font-bold">1. About these Terms</h2>
            <p>
              These Terms of Use ("Terms") form a legal agreement between
              you and Selm Mobile Application Inc. ("SELM", "we", "us",
              "our") for the use of the SELM mobile and web applications
              and any related services (the "Service"). By creating an
              account, subscribing, or otherwise using the Service you
              accept these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">2. Eligibility and accounts</h2>
            <p>
              You must be at least 13 years old to use SELM. You are
              responsible for keeping your account credentials secure and
              for all activity on your account. If you sign in with a
              third-party identity provider (for example Sign in with
              Apple), you also agree to that provider's terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">3. Subscriptions and payment</h2>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                SELM Pro is offered on a monthly or yearly auto-renewable
                subscription starting with a 7-day free trial for new
                customers.
              </li>
              <li>
                Payment is charged to your Apple ID (on iOS / iPadOS) or
                your Google account (on Android) at the end of the free
                trial, and again at the start of each renewal period,
                unless auto-renew is turned off at least 24 hours before
                the current period ends.
              </li>
              <li>
                Prices are displayed inside the paywall in your local
                currency and are subject to change. Any price change will
                only take effect at the following renewal.
              </li>
              <li>
                You can manage or cancel your subscription any time in
                your Apple ID account settings (App Store) or Google
                account settings (Google Play). No partial refunds are
                provided for the unused part of a subscription period.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold">4. Acceptable use</h2>
            <p>
              You agree not to use SELM to (a) violate any law, (b)
              upload harmful, defamatory, or infringing content, (c)
              attempt to reverse engineer, decompile, or extract the
              source code of the Service beyond what is allowed by
              applicable law, or (d) resell or redistribute the Service.
              We may suspend or terminate accounts that violate these
              rules.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">5. AI-generated content</h2>
            <p>
              SELM uses artificial intelligence services (including
              Google Gemini, Google Cloud Speech-to-Text, SpeechAce, and
              ElevenLabs) to generate feedback, transcripts, and audio.
              AI output can contain errors and should not be treated as
              professional advice. You retain ownership of what you write
              or record; SELM only uses that content to run the Service
              features you invoke, as described in our{' '}
              <a href="/privacy" className="text-teal-600 hover:underline">Privacy Policy</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">6. Intellectual property</h2>
            <p>
              The SELM name, logo, curriculum, lesson content, code, and
              designs are the property of Selm Mobile Application Inc.
              and its licensors. Nothing in these Terms transfers any
              intellectual property rights to you beyond a limited,
              non-exclusive, non-transferable licence to use the Service
              for personal, non-commercial learning.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">7. Disclaimer and limitation of liability</h2>
            <p>
              The Service is provided "as is" and "as available". To the
              maximum extent permitted by law, SELM disclaims all
              warranties, express or implied, including merchantability
              and fitness for a particular purpose. SELM's total
              liability arising from your use of the Service is limited
              to the amount you paid us in the 12 months preceding the
              claim. Nothing in these Terms limits liability for gross
              negligence or wilful misconduct where such a limitation
              would be unenforceable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">8. Termination and account deletion</h2>
            <p>
              You may delete your account at any time from{' '}
              <em>Settings → Delete account → Delete my account</em>. On
              deletion we remove or anonymise your personal identifiers
              within 30 days. We may suspend or terminate your access
              for material breach of these Terms with reasonable notice
              where practical.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">9. Changes to these Terms</h2>
            <p>
              We may update these Terms from time to time. Material
              changes will be posted here with an updated "Last updated"
              date, and where required by law we will notify you inside
              the app before the change takes effect.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">10. Governing law</h2>
            <p>
              These Terms are governed by the laws of British Columbia,
              Canada, without regard to its conflict-of-laws rules.
              Disputes shall be resolved in the courts of Vancouver,
              British Columbia, unless a mandatory consumer-protection
              law requires otherwise.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">11. Contact</h2>
            <p>
              Selm Mobile Application Inc.
              <br />
              Vancouver, British Columbia, Canada
              <br />
              Email: <a href="mailto:admin@selmapp.com" className="text-teal-600 hover:underline">admin@selmapp.com</a>
            </p>
          </section>
        </div>

        <footer className="mt-16 border-t border-slate-200 pt-6 text-sm text-ink-secondary dark:border-slate-800 dark:text-slate-400">
          © 2026 Selm Mobile Application Inc. — <a href="/" className="text-teal-600 hover:underline">Return to SELM</a>
        </footer>
      </main>
    </div>
  );
}
