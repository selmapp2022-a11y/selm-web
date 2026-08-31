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
//
// ── WHY THE TEXT IS DATA AND NOT FORTY i18n KEYS ──────────────────────────
// §5.2 says no user-facing string is written into a component, and the French
// market is 55–58% of the revenue forecast, so this document has to exist in
// French. But a legal document is ONE text: split into forty keys a
// translator meets out of order, the numbering, the defined terms and the
// cross-references come apart. So it is held here as `{ en, fr }` pairs in
// document order — the same shape the exam definitions have used since they
// were written — and rendered in the interface language.
//
// The English version governs. That is stated on the page, in both languages,
// because a translated contract with no governing-language clause is a second
// contract.
import { ts, useUiLangValue } from '../i18n';
import { RichText } from '../i18n/Rich';
import type { Localised } from '../exam/model/types';

const UPDATED: Localised = { en: 'July 15, 2026', fr: '15 juillet 2026' };

type Section = { h: Localised; paras?: Localised[]; list?: Localised[] };

const SECTIONS: Section[] = [
  {
    h: { en: '1. About these Terms', fr: "1. À propos des présentes conditions" },
    paras: [{
      en: 'These Terms of Use ("Terms") form a legal agreement between you and Selm Mobile Application Inc. ("SELM", "we", "us", "our") for the use of the SELM mobile and web applications and any related services (the "Service"). By creating an account, subscribing, or otherwise using the Service you accept these Terms.',
      fr: "Les présentes conditions d'utilisation (« Conditions ») constituent un accord juridique entre vous et Selm Mobile Application Inc. (« SELM », « nous », « notre ») portant sur l'utilisation des applications mobiles et web SELM et de tout service associé (le « Service »). En créant un compte, en vous abonnant ou en utilisant le Service de toute autre manière, vous acceptez les présentes Conditions.",
    }],
  },
  {
    h: { en: '2. Eligibility and accounts', fr: '2. Admissibilité et comptes' },
    paras: [{
      en: "You must be at least 13 years old to use SELM. You are responsible for keeping your account credentials secure and for all activity on your account. If you sign in with a third-party identity provider (for example Sign in with Apple), you also agree to that provider's terms.",
      fr: "Vous devez avoir au moins 13 ans pour utiliser SELM. Vous êtes responsable de la confidentialité de vos identifiants et de toute activité sur votre compte. Si vous vous connectez au moyen d'un fournisseur d'identité tiers (par exemple « Se connecter avec Apple »), vous acceptez également les conditions de ce fournisseur.",
    }],
  },
  {
    h: { en: '3. Subscriptions and payment', fr: '3. Abonnements et paiement' },
    list: [
      {
        en: 'SELM Pro is offered on a monthly or yearly auto-renewable subscription starting with a 7-day free trial for new customers.',
        fr: "SELM Pro est proposé sous forme d'abonnement mensuel ou annuel à renouvellement automatique, précédé d'un essai gratuit de 7 jours pour les nouveaux clients.",
      },
      {
        en: 'Payment is charged to your Apple ID (on iOS / iPadOS) or your Google account (on Android) at the end of the free trial, and again at the start of each renewal period, unless auto-renew is turned off at least 24 hours before the current period ends.',
        fr: "Le paiement est prélevé sur votre identifiant Apple (sur iOS / iPadOS) ou sur votre compte Google (sur Android) à la fin de l'essai gratuit, puis au début de chaque période de renouvellement, sauf si le renouvellement automatique est désactivé au moins 24 heures avant la fin de la période en cours.",
      },
      {
        en: 'Prices are displayed inside the paywall in your local currency and are subject to change. Any price change will only take effect at the following renewal.',
        fr: "Les prix sont affichés dans l'écran d'abonnement dans votre devise locale et peuvent être modifiés. Toute modification de prix ne prend effet qu'au renouvellement suivant.",
      },
      {
        en: 'You can manage or cancel your subscription any time in your Apple ID account settings (App Store) or Google account settings (Google Play). No partial refunds are provided for the unused part of a subscription period.',
        fr: "Vous pouvez gérer ou annuler votre abonnement à tout moment dans les réglages de votre compte Apple (App Store) ou de votre compte Google (Google Play). Aucun remboursement partiel n'est accordé pour la partie non utilisée d'une période d'abonnement.",
      },
    ],
  },
  {
    h: { en: '4. Acceptable use', fr: '4. Usage acceptable' },
    paras: [{
      en: 'You agree not to use SELM to (a) violate any law, (b) upload harmful, defamatory, or infringing content, (c) attempt to reverse engineer, decompile, or extract the source code of the Service beyond what is allowed by applicable law, or (d) resell or redistribute the Service. We may suspend or terminate accounts that violate these rules.',
      fr: "Vous vous engagez à ne pas utiliser SELM pour (a) enfreindre une loi, (b) téléverser un contenu nuisible, diffamatoire ou contrefaisant, (c) tenter de faire de l'ingénierie inverse, de décompiler ou d'extraire le code source du Service au-delà de ce que permet le droit applicable, ou (d) revendre ou redistribuer le Service. Nous pouvons suspendre ou résilier les comptes qui enfreignent ces règles.",
    }],
  },
  {
    h: { en: '5. AI-generated content', fr: "5. Contenus générés par l'IA" },
    paras: [{
      en: 'SELM uses artificial intelligence services (including Google Gemini, Google Cloud Speech-to-Text, SpeechAce, and ElevenLabs) to generate feedback, transcripts, and audio. AI output can contain errors and should not be treated as professional advice. You retain ownership of what you write or record; SELM only uses that content to run the Service features you invoke, as described in our Privacy Policy.',
      fr: "SELM recourt à des services d'intelligence artificielle (notamment Google Gemini, Google Cloud Speech-to-Text, SpeechAce et ElevenLabs) pour produire des retours, des transcriptions et de l'audio. Les résultats d'une IA peuvent comporter des erreurs et ne doivent pas être considérés comme un avis professionnel. Vous conservez la propriété de ce que vous écrivez ou enregistrez ; SELM n'utilise ce contenu que pour exécuter les fonctions du Service que vous sollicitez, comme l'explique notre politique de confidentialité.",
    }],
  },
  {
    h: { en: '6. Intellectual property', fr: '6. Propriété intellectuelle' },
    paras: [{
      en: 'The SELM name, logo, curriculum, lesson content, code, and designs are the property of Selm Mobile Application Inc. and its licensors. Nothing in these Terms transfers any intellectual property rights to you beyond a limited, non-exclusive, non-transferable licence to use the Service for personal, non-commercial learning.',
      fr: "Le nom SELM, le logo, le programme, le contenu des leçons, le code et les maquettes sont la propriété de Selm Mobile Application Inc. et de ses concédants. Rien dans les présentes Conditions ne vous transfère de droits de propriété intellectuelle au-delà d'une licence limitée, non exclusive et non transférable d'utiliser le Service à des fins d'apprentissage personnel et non commercial.",
    }],
  },
  {
    h: {
      en: '7. Disclaimer and limitation of liability',
      fr: '7. Exclusion de garanties et limitation de responsabilité',
    },
    paras: [{
      en: 'The Service is provided "as is" and "as available". To the maximum extent permitted by law, SELM disclaims all warranties, express or implied, including merchantability and fitness for a particular purpose. SELM’s total liability arising from your use of the Service is limited to the amount you paid us in the 12 months preceding the claim. Nothing in these Terms limits liability for gross negligence or wilful misconduct where such a limitation would be unenforceable.',
      fr: "Le Service est fourni « tel quel » et « selon disponibilité ». Dans toute la mesure permise par la loi, SELM exclut toute garantie, expresse ou implicite, y compris la qualité marchande et l'adéquation à un usage particulier. La responsabilité totale de SELM au titre de votre utilisation du Service est limitée au montant que vous nous avez versé au cours des 12 mois précédant la réclamation. Rien dans les présentes Conditions ne limite la responsabilité en cas de faute lourde ou de faute intentionnelle lorsqu'une telle limitation serait inopposable.",
    }],
  },
  {
    h: { en: '8. Termination and account deletion', fr: '8. Résiliation et suppression du compte' },
    paras: [{
      en: 'You may delete your account at any time from **Settings → Delete account → Delete my account**. On deletion we remove or anonymise your personal identifiers within 30 days. We may suspend or terminate your access for material breach of these Terms with reasonable notice where practical.',
      fr: "Vous pouvez supprimer votre compte à tout moment depuis **Réglages → Supprimer le compte → Supprimer mon compte**. À la suppression, nous effaçons ou anonymisons vos identifiants personnels dans un délai de 30 jours. Nous pouvons suspendre ou résilier votre accès en cas de manquement grave aux présentes Conditions, moyennant un préavis raisonnable lorsque cela est possible.",
    }],
  },
  {
    h: { en: '9. Changes to these Terms', fr: '9. Modification des présentes conditions' },
    paras: [{
      en: 'We may update these Terms from time to time. Material changes will be posted here with an updated "Last updated" date, and where required by law we will notify you inside the app before the change takes effect.',
      fr: "Nous pouvons mettre à jour les présentes Conditions de temps à autre. Les modifications importantes seront publiées ici avec une date de « dernière mise à jour » actualisée et, lorsque la loi l'exige, nous vous en informerons dans l'application avant leur entrée en vigueur.",
    }],
  },
  {
    h: { en: '10. Governing law', fr: '10. Droit applicable' },
    paras: [{
      en: 'These Terms are governed by the laws of British Columbia, Canada, without regard to its conflict-of-laws rules. Disputes shall be resolved in the courts of Vancouver, British Columbia, unless a mandatory consumer-protection law requires otherwise.',
      fr: "Les présentes Conditions sont régies par le droit de la Colombie-Britannique (Canada), sans égard à ses règles de conflit de lois. Les litiges seront tranchés par les tribunaux de Vancouver (Colombie-Britannique), sauf disposition impérative contraire d'une loi de protection du consommateur.",
    }],
  },
];

const GOVERNING: Localised = {
  en: 'This document is available in English and in French. In the event of any discrepancy between the two versions, the English version governs.',
  fr: "Ce document est disponible en anglais et en français. En cas de divergence entre les deux versions, la version anglaise prévaut.",
};

export default function TermsPage() {
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
        <h1 className="mb-2 font-display text-3xl font-bold">{ts('legal.termsOfUse', ui)}</h1>
        <p className="mb-2 text-sm text-ink-secondary dark:text-slate-400">
          {ts('legal.lastUpdated', ui)} {UPDATED[ui]}
        </p>
        <p className="mb-8 text-xs text-ink-secondary dark:text-slate-500">{GOVERNING[ui]}</p>

        <div className="prose prose-slate max-w-none space-y-6 text-base leading-relaxed dark:prose-invert">
          {SECTIONS.map((s) => (
            <section key={s.h.en}>
              <h2 className="text-xl font-bold">{s.h[ui]}</h2>
              {s.paras?.map((p, i) => (
                <p key={i}><RichText text={p[ui]} /></p>
              ))}
              {s.list && (
                <ul className="ml-6 list-disc space-y-2">
                  {s.list.map((li, i) => <li key={i}><RichText text={li[ui]} /></li>)}
                </ul>
              )}
            </section>
          ))}

          <section>
            <h2 className="text-xl font-bold">{ts('legal.contactHeading', ui)}</h2>
            <p>
              Selm Mobile Application Inc.
              <br />
              {ts('legal.address', ui)}
              <br />
              {ts('legal.email', ui)}{' '}
              <a href="mailto:admin@selmapp.com" className="text-navy hover:underline">admin@selmapp.com</a>
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
