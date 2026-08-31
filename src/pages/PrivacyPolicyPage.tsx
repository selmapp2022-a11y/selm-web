// ── NEEDS A HUMAN: fr-CA REVIEW OF THE FRENCH TEXT BELOW ──────────────────
// The French half of this document was written by a language model on
// 31 August 2026 and no native speaker has read it. It ships with an
// English-governs clause on the page, which is what makes that defensible —
// not a substitute for the review. Same reviewer as the content; see the note
// at the top of `src/i18n/fr.ts`.
import { Capacitor } from '@capacitor/core';
import { ts, useUiLangValue } from '../i18n';
import { RichText } from '../i18n/Rich';
import type { Localised } from '../exam/model/types';

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
//
// ── WHY THE TEXT IS DATA AND NOT SIXTY i18n KEYS ──────────────────────────
// The reasoning is the same as `TermsPage.tsx`, and it is written out there:
// a privacy policy is ONE document, and cutting it into keys a translator
// meets out of order takes the numbering, the defined terms and the
// cross-references apart. The English version governs; the page says so.
//
// `{store}` and `{manage}` are interpolated because Apple 2.3.10 rejected
// Build 38 for a binary that mentioned a store it was not shipping to — that
// substitution is a compliance rule, not a convenience, and it has to survive
// translation. So it stays a placeholder in both languages.

const UPDATED: Localised = { en: 'July 15, 2026', fr: '15 juillet 2026' };

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
const MANAGE_SUB: Localised = IS_ANDROID
  ? { en: 'your Google account settings on Google Play', fr: 'les réglages de votre compte Google sur Google Play' }
  : IS_IOS
    ? { en: 'your Apple ID account settings on the App Store', fr: "les réglages de votre compte Apple sur l'App Store" }
    : {
        en: 'your Apple ID or Google account subscription settings',
        fr: "les réglages d'abonnement de votre compte Apple ou Google",
      };

type Section = { h: Localised; before?: Localised[]; list?: Localised[]; after?: Localised[] };

const SECTIONS: Section[] = [
  {
    h: { en: '1. Who we are', fr: '1. Qui nous sommes' },
    before: [
      {
        en: 'SELM ("we", "us", "our") is operated by Selm Mobile Application Inc. We provide an exam preparation app for TCF Canada and IELTS on iOS, Android, and the web. This policy explains what personal information we collect, how we use it, who we share it with, and the choices you have.',
        fr: "SELM (« nous », « notre ») est exploité par Selm Mobile Application Inc. Nous proposons une application de préparation aux examens TCF Canada et IELTS sur iOS, Android et le web. La présente politique explique quels renseignements personnels nous recueillons, comment nous les utilisons, avec qui nous les partageons et quels choix s'offrent à vous.",
      },
      { en: 'Contact: admin@selmapp.com', fr: 'Contact : admin@selmapp.com' },
    ],
  },
  {
    h: { en: '2. Information we collect', fr: '2. Les renseignements que nous recueillons' },
    before: [{
      en: 'We collect only what we need to run the app:',
      fr: "Nous ne recueillons que ce qui est nécessaire au fonctionnement de l'application :",
    }],
    list: [
      {
        en: '**Account information** — email address, display name, and (if you use Sign in with Apple) the private-relay email Apple provides. We do NOT collect passwords when you sign in with Apple.',
        fr: "**Informations de compte** — adresse courriel, nom affiché et, si vous utilisez « Se connecter avec Apple », l'adresse de relais privé fournie par Apple. Nous ne recueillons PAS de mot de passe lorsque vous vous connectez avec Apple.",
      },
      // Rewritten 29 August 2026, the same day the scoreboard was removed. A
      // privacy policy that lists data the product no longer keeps is not a
      // harmless leftover: it is the document a candidate is asked to rely on.
      {
        en: '**Your work** — which practice tasks and exam sections you have attempted and when, the results of the sittings you complete, the exam and destination you chose, and your saved vocabulary.',
        fr: "**Votre travail** — les tâches d'entraînement et les épreuves que vous avez tentées et à quel moment, les résultats des sessions que vous terminez, l'examen et la destination que vous avez choisis, et votre vocabulaire enregistré.",
      },
      {
        en: '**Text you write** in Speaking, Writing, Reading, and Listening exercises so we can score it and give feedback.',
        fr: "**Le texte que vous rédigez** dans les exercices d'expression orale, d'expression écrite, de compréhension écrite et de compréhension orale, afin que nous puissions le noter et vous faire un retour.",
      },
      {
        en: '**Audio you record** when you tap the microphone in Speaking so we can transcribe and score your pronunciation.',
        fr: "**L'audio que vous enregistrez** en touchant le micro en expression orale, afin que nous puissions le transcrire et noter votre prononciation.",
      },
      {
        en: '**Purchase data** — an anonymous receipt token from {store} that confirms your subscription. We do not receive your credit-card number.',
        fr: "**Données d'achat** — un jeton de reçu anonyme provenant de {store} qui confirme votre abonnement. Nous ne recevons pas votre numéro de carte bancaire.",
      },
      {
        en: '**Diagnostics** — anonymous crash reports and error logs that help us fix bugs.',
        fr: "**Diagnostics** — rapports de plantage et journaux d'erreurs anonymes qui nous aident à corriger les anomalies.",
      },
    ],
  },
  {
    h: { en: '3. How we use your information', fr: '3. Comment nous utilisons vos renseignements' },
    list: [
      { en: 'Provide, personalise, and improve the SELM learning experience.', fr: "Fournir, personnaliser et améliorer l'expérience d'apprentissage SELM." },
      { en: 'Generate AI feedback, pronunciation scoring, and IELTS-style assessments.', fr: "Produire des retours par IA, une notation de la prononciation et des évaluations de type IELTS." },
      { en: 'Sync your progress across your devices.', fr: 'Synchroniser votre progression entre vos appareils.' },
      { en: 'Verify your subscription and prevent fraud.', fr: 'Vérifier votre abonnement et prévenir la fraude.' },
      { en: 'Fix crashes and diagnose bugs.', fr: 'Corriger les plantages et diagnostiquer les anomalies.' },
      { en: 'Reply to support requests when you contact us.', fr: "Répondre à vos demandes d'assistance lorsque vous nous écrivez." },
    ],
    after: [{
      en: 'We do **not** sell your personal information, and we do **not** use it for advertising.',
      fr: "Nous ne vendons **pas** vos renseignements personnels et nous ne les utilisons **pas** à des fins publicitaires.",
    }],
  },
  {
    h: {
      en: '4. Third-party AI services we share with',
      fr: "4. Les services d'IA tiers avec lesquels nous partageons",
    },
    before: [{
      en: 'To power the learning features you use, we send certain data to specialised AI processors. They act only on our behalf and are contractually forbidden from using your content to train their own models:',
      fr: "Pour faire fonctionner les fonctions d'apprentissage que vous utilisez, nous transmettons certaines données à des sous-traitants d'IA spécialisés. Ils agissent uniquement pour notre compte et il leur est contractuellement interdit d'utiliser vos contenus pour entraîner leurs propres modèles :",
    }],
    list: [
      {
        en: '**Google Gemini** — receives the text you write in Writing, Reading, and lesson answers so we can grade it and give feedback.',
        fr: "**Google Gemini** — reçoit le texte que vous rédigez en expression écrite, en compréhension écrite et dans les réponses aux leçons, afin que nous puissions le noter et vous faire un retour.",
      },
      {
        en: '**Google Cloud Speech-to-Text** — receives the audio you record in Speaking so we can transcribe your speech into text.',
        fr: "**Google Cloud Speech-to-Text** — reçoit l'audio que vous enregistrez en expression orale afin de transcrire votre parole en texte.",
      },
      {
        en: '**SpeechAce** — receives the same audio you record in Speaking so we can score your pronunciation, stress, fluency, and intonation and return CEFR- and IELTS-style feedback.',
        fr: "**SpeechAce** — reçoit le même audio enregistré en expression orale afin d'évaluer votre prononciation, votre accentuation, votre aisance et votre intonation, et de renvoyer un retour de type CECR et IELTS.",
      },
      {
        en: '**ElevenLabs** — synthesises the model voices you hear in Listening exercises from text; it does not receive your personal recordings.',
        fr: "**ElevenLabs** — synthétise à partir de texte les voix que vous entendez dans les exercices de compréhension orale ; ce service ne reçoit pas vos enregistrements personnels.",
      },
      {
        en: '**RevenueCat** — validates your {store} subscription receipt on our behalf.',
        fr: "**RevenueCat** — valide pour notre compte le reçu de votre abonnement {store}.",
      },
      {
        en: '**{store}** — processes the actual payment when you subscribe.',
        fr: "**{store}** — traite le paiement lorsque vous vous abonnez.",
      },
    ],
    after: [{
      en: 'Before any of the above happens for the first time, we show you a consent screen inside the app and require you to explicitly accept.',
      fr: "Avant que l'une de ces opérations n'ait lieu pour la première fois, nous affichons un écran de consentement dans l'application et exigeons votre acceptation explicite.",
    }],
  },
  {
    h: { en: '5. Where your data lives', fr: '5. Où vos données sont hébergées' },
    before: [{
      en: 'Your account and learning progress are stored on servers operated by our infrastructure provider in Canada and the United States. AI processing may occur in the regions our third-party providers operate in (primarily the United States and the European Union). All data is encrypted in transit using TLS and at rest.',
      fr: "Votre compte et votre progression sont conservés sur des serveurs exploités par notre fournisseur d'infrastructure au Canada et aux États-Unis. Le traitement par IA peut avoir lieu dans les régions où opèrent nos prestataires tiers (principalement les États-Unis et l'Union européenne). Toutes les données sont chiffrées en transit au moyen de TLS et au repos.",
    }],
  },
  {
    h: { en: '6. How long we keep your data', fr: '6. Durée de conservation' },
    before: [{
      en: 'We keep your account and progress for as long as you have an active SELM account. If you delete your account (see below), we remove or anonymise personal identifiers within 30 days. Anonymised, aggregated data may be kept for analytics and improvement of the service.',
      fr: "Nous conservons votre compte et votre progression tant que votre compte SELM est actif. Si vous supprimez votre compte (voir ci-dessous), nous effaçons ou anonymisons vos identifiants personnels dans un délai de 30 jours. Des données anonymisées et agrégées peuvent être conservées à des fins d'analyse et d'amélioration du service.",
    }],
  },
  {
    h: { en: '7. Your rights and choices', fr: '7. Vos droits et vos choix' },
    list: [
      {
        en: '**Access, correct, or export** your data — email admin@selmapp.com and we will respond within 30 days.',
        fr: "**Consulter, corriger ou exporter** vos données — écrivez à admin@selmapp.com et nous répondrons dans un délai de 30 jours.",
      },
      {
        en: '**Delete your account** from inside the app: open **Settings → Delete account → Delete my account**. This permanently removes your personal identifiers.',
        fr: "**Supprimer votre compte** depuis l'application : ouvrez **Réglages → Supprimer le compte → Supprimer mon compte**. Vos identifiants personnels sont alors définitivement effacés.",
      },
      {
        en: '**Withdraw consent** for AI processing — because the AI features are the core of SELM, withdrawing consent requires deleting your account (above).',
        fr: "**Retirer votre consentement** au traitement par IA — les fonctions d'IA étant le cœur de SELM, le retrait du consentement passe par la suppression de votre compte (ci-dessus).",
      },
      {
        en: '**Manage your subscription** in {manage} at any time.',
        fr: "**Gérer votre abonnement** dans {manage} à tout moment.",
      },
    ],
  },
  {
    h: { en: '8. Children', fr: '8. Enfants' },
    before: [{
      en: 'SELM is rated 4+ on the App Store but is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe we have, please contact admin@selmapp.com and we will delete it.',
      fr: "SELM est classé 4+ sur l'App Store mais ne s'adresse pas aux enfants de moins de 13 ans. Nous ne recueillons pas sciemment de renseignements personnels auprès d'enfants de moins de 13 ans. Si vous pensez que c'est le cas, écrivez à admin@selmapp.com et nous les supprimerons.",
    }],
  },
  {
    h: { en: '9. Changes to this policy', fr: '9. Modification de la présente politique' },
    before: [{
      en: 'We may update this policy from time to time. When we make material changes we will update the "Last updated" date at the top of this page and, where required by law, notify you inside the app before the change takes effect.',
      fr: "Nous pouvons mettre à jour la présente politique de temps à autre. En cas de modification importante, nous actualiserons la date de « dernière mise à jour » en haut de cette page et, lorsque la loi l'exige, nous vous en informerons dans l'application avant son entrée en vigueur.",
    }],
  },
];

const GOVERNING: Localised = {
  en: 'This document is available in English and in French. In the event of any discrepancy between the two versions, the English version governs.',
  fr: "Ce document est disponible en anglais et en français. En cas de divergence entre les deux versions, la version anglaise prévaut.",
};

const fill = (s: string, lang: 'en' | 'fr') =>
  s.replace('{store}', PAYMENT_STORE).replace('{manage}', MANAGE_SUB[lang]);

export default function PrivacyPolicyPage() {
  const ui = useUiLangValue();
  return (
    <div className="min-h-screen bg-white text-navy dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-6 py-4">
          <img src="/selm-icon.png" alt="" className="h-8 w-8 rounded-lg" />
          <div>
            <div className="text-base font-bold">SELM</div>
            <div className="text-[11px] uppercase tracking-wider text-ink-secondary">{ts('legal.tagline', ui)}</div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="mb-2 font-display text-3xl font-bold">{ts('legal.privacyPolicy', ui)}</h1>
        <p className="mb-2 text-sm text-ink-secondary dark:text-slate-400">
          {ts('legal.lastUpdated', ui)} {UPDATED[ui]}
        </p>
        <p className="mb-8 text-xs text-ink-secondary dark:text-slate-500">{GOVERNING[ui]}</p>

        <div className="prose prose-slate max-w-none space-y-6 text-base leading-relaxed dark:prose-invert">
          {SECTIONS.map((s) => (
            <section key={s.h.en}>
              <h2 className="text-xl font-bold">{s.h[ui]}</h2>
              {s.before?.map((p, i) => <p key={i}><RichText text={fill(p[ui], ui)} /></p>)}
              {s.list && (
                <ul className="ml-6 list-disc space-y-2">
                  {s.list.map((li, i) => <li key={i}><RichText text={fill(li[ui], ui)} /></li>)}
                </ul>
              )}
              {s.after?.map((p, i) => <p key={i}><RichText text={fill(p[ui], ui)} /></p>)}
            </section>
          ))}

          <section>
            <h2 className="text-xl font-bold">{ts('privacy.contactHeading', ui)}</h2>
            <p>
              {ts('privacy.contactBlurb', ui)}
              <br />
              {ts('legal.email', ui)}{' '}
              <a href="mailto:admin@selmapp.com" className="text-navy hover:underline">admin@selmapp.com</a>
              <br />
              Selm Mobile Application Inc., {ts('legal.address', ui)}
            </p>
          </section>
        </div>

        <footer className="mt-16 border-t border-slate-200 pt-6 text-sm text-ink-secondary dark:border-slate-800 dark:text-slate-400">
          © 2026 Selm Mobile Application Inc. — <a href="/" className="text-navy hover:underline">{ts('legal.returnToSelm', ui)}</a>
        </footer>
      </main>
    </div>
  );
}
