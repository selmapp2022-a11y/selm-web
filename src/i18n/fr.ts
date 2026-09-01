/**
 * ── NEEDS A HUMAN: fr-CA REVIEW ───────────────────────────────────────────
 *
 * Every French string in this file was written by a language model on
 * 31 August 2026. **No native speaker has read any of it.**
 *
 * That is the same standing as the exam bank — `selfJudged`, `needsReview` —
 * and it is recorded in the same place the bank's standing is recorded, in the
 * file itself, rather than in a document that can be closed.
 *
 * It matters more here than for a typical interface. The company's French
 * claim is fr-CA fidelity: the marketing site says the audio is Quebec French
 * "parce que l'examen s'appelle TCF *Canada*". An interface written in
 * metropolitan-sounding French contradicts that claim on the same screen, and
 * the French market is the larger half of the revenue forecast.
 *
 * **The reviewer is the one already contracted for content** — the French
 * content reviewer in the business plan's Section 11 — and the register is
 * `SELM-Website-Plan.md` PART 6, row 8, which named fr-CA review a blocking
 * item while it was still only about the marketing site.
 *
 * TWO ITEMS OUTSIDE THIS FILE CARRY THE SAME FLAG, and they carry more risk,
 * because they are contracts rather than labels:
 *
 *   `pages/PrivacyPolicyPage.tsx`  — the French privacy policy
 *   `pages/TermsPage.tsx`          — the French Terms of Use / EULA
 *
 * Both state, on the page, that the English version governs in the event of a
 * discrepancy. That clause is what makes shipping them before review
 * defensible; it is not a substitute for the review.
 */
/**
 * Le français.
 *
 * §5.5 — la discipline établie à l'étape 08 : terminologie officielle prise à
 * la source, vocabulaire canadien (*courriel*, non *e-mail*), typographie
 * française, **vous** partout, et — là où le doute subsiste — **écrire plus
 * simplement plutôt que deviner un idiome**.
 *
 * ⚠ Rien ici n'a été relu par une personne francophone. C'est la quatrième
 * chose qui attend ce relecteur.
 */
import type { EN } from './en';

/** Keys of the English list, values free strings. The key set is checked;
 *  the wording is not, and cannot be. */
type FrenchDict = Partial<Record<keyof typeof EN, string>>;

export const FR: FrenchDict = {
  'nav.dashboard': 'Tableau de bord',
  'nav.speaking': 'Expression orale',
  'nav.listening': 'Compréhension orale',
  'nav.reading': 'Compréhension écrite',
  'nav.writing': 'Expression écrite',
  'nav.vocabulary': 'Vocabulaire',
  'nav.progress': 'Progression',
  'nav.settings': 'Paramètres',
  'nav.today': "Aujourd'hui",
  'nav.practice': 'Entraînement',
  'nav.mockExam': "Examen blanc",
  'nav.you': 'Vous',
  'nav.myExam': 'Mon examen',
  'nav.signOut': 'Se déconnecter',
  'nav.appearance': 'Apparence',
  'nav.main': 'Navigation principale',

  'common.loading': 'Chargement…',
  'common.continue': 'Continuer',
  'common.chooseExam': 'Choisir un examen',

  'lang.label': "Langue de l'interface",
  'lang.help':
    "La langue de l'application. Votre examen reste dans sa propre langue : les deux sont indépendants.",
  'lang.en': 'English',
  'lang.fr': 'Français',

  'onboarding.title': 'Quel examen passez-vous ?',
  'onboarding.subtitle':
    "C'est la seule chose dont nous avons besoin pour commencer. Aucun test de niveau : l'examen donne les mêmes tâches à tous les candidats, il n'y a donc rien à situer.",
  'onboarding.complete': 'Complet — les quatre compétences sont construites.',
  'onboarding.partial': '{built} — prêtes à passer.',
  'onboarding.onlyBuilt':
    "Seuls les examens réellement construits figurent ici. Proposer un examen non construit serait une promesse que nous ne pourrions pas tenir.",
  'onboarding.satBefore': "L'avez-vous déjà passé ?",
  'onboarding.satBeforeHelp':
    "Si oui, vos notes réelles bâtissent un meilleur plan que n'importe quel test de notre part — quelle que soit son ancienneté. Sinon, nous commençons l'apprentissage maintenant.",
  'onboarding.yes': 'Oui — saisir mes notes',
  'onboarding.no': "Non — commencer l'apprentissage",
  'onboarding.neverBlocked':
    "Passer cette étape ne change rien à ce que vous pouvez utiliser. La question reviendra plus tard, et ne bloque jamais.",

  'onboarding.inLanguage': 'en {language}',
  'examLang.en': 'anglais',
  'examLang.fr': 'français',

  'onboarding.yesThis': "Oui — j'ai passé le {exam}",
  'onboarding.yesOther': "J'ai passé un autre examen",
  'onboarding.otherTitle': 'Quel examen avez-vous passé ?',
  'onboarding.otherSameLang':
    "Nous savons lire cet examen. Il n'est pas encore construit : ses notes ne peuvent donc pas être saisies ici aujourd'hui.",
  'onboarding.otherCrossLang':
    "Ce résultat mesure {language}, et vous préparez un examen en {target}. Des notes obtenues dans une langue ne disent rien de votre niveau dans l'autre : elles ne rendraient pas votre plan meilleur, elles le rendraient faux.",
  'onboarding.switchTo': 'Préparer le {exam} à la place',
  'onboarding.continueWithout': 'Continuer sans notes',
  'onboarding.back': 'Retour',

  'practice.chooseExamFirst': "Choisissez d'abord votre examen",
  'practice.writingNeedsExam':
    "L'entraînement à l'écrit reprend les tâches de l'examen que vous passez : ses consignes, ses bornes de mots, son minutage. Sans examen, il n'y a rien d'honnête à travailler.",
  'practice.speakingNeedsExam':
    "L'entraînement à l'oral reprend les tâches d'expression orale de votre examen, dans sa langue et avec son minutage — et non une fiche générique.",
  'practice.pronunciationNeedsExam':
    "L'entraînement à la prononciation lit des phrases de l'examen que vous passez, dans sa langue.",
  'practice.tasksAsSet': "{exam} — tâches d'expression écrite, telles que l'examen les pose.",
  'practice.pickAnother': 'Choisir une autre tâche',
  'practice.zeroTitle': 'Ce qui vaut zéro ici',
  'practice.zeroHelp':
    "Quelle que soit la qualité de la langue. Ce sont les règles de l'examen, pas les nôtres.",
  'practice.ourSplit': "(notre répartition du total publié par l'examen)",

  // ── §5.2, la dernière passe (31 août 2026) ───────────────────────────────
  'common.continueWithAnother': 'Continuer avec une autre',

  'standing.counted':
    "La compréhension est **comptée** — un nombre exact de bonnes réponses dans notre propre banque d'items. La production est **estimée**, et aucune estimation n'est encore publiée pour elle. Ce ne sont pas deux nombres de même nature et ils ne s'additionnent jamais.",
  'standing.allProduction':
    "Toutes les épreuves de cet examen relèvent de la **production** — expression écrite et orale — qui est estimée et non comptée, et aucune estimation n'est encore publiée pour elle.",

  'stale.body':
    "Cet onglet est ouvert depuis une version plus ancienne de SELM. Ce que vous voyez peut ne plus correspondre au matériel actuel — rechargez pour obtenir la version en cours.",
  'stale.reload': 'Recharger',

  'states.wentWrong': "Une erreur s'est produite.",
  'states.tryAgain': 'Réessayer',

  'need.writing': 'expression écrite',
  'need.speaking': 'expression orale',
  'need.demand': 'Votre destination exige **{system} {level}** en {skill}',
  'need.onThisExam': ', ce qui correspond à **{score}** à cet examen. ',
  'need.sameTask':
    "La tâche ci-dessous est celle que l'examen pose à tous les niveaux — ce qui change avec le niveau visé, c'est ce à quoi ressemble une réponse suffisante, pas la question posée.",

  'openExam.freeMock': 'Examen blanc gratuit',

  'recorder.start': "Démarrer l'enregistrement",
  'recorder.requesting': 'Accès au micro…',
  'recorder.processing': 'Traitement…',
  'recorder.stop': 'Arrêter ({s} s)',

  'player.loading': 'Chargement de l’audio…',
  'player.nowSpeaking': 'Locuteur :',
  'player.dialogue': 'Dialogue • {n} répliques',
  'player.fileUnavailable': 'Fichier audio indisponible — voix du navigateur utilisée',
  'player.browserVoice': 'Voix du navigateur',

  'practice.hubBlurb':
    "Vos quatre compétences d'examen. Choisissez-en une et travaillez ses tâches — dans la langue de votre examen.",
  'practice.speakingBlurb': "Les tâches d'expression orale de l'examen.",
  'practice.listeningBlurb': "Les questions de compréhension orale.",
  'practice.readingBlurb': "Les textes de compréhension écrite.",
  'practice.writingBlurb': "Les tâches d'expression écrite de l'examen.",
  'practice.vocabBlurb': "Un complément aux quatre compétences.",
  'practice.listenAnswer': 'Écoutez et répondez, à votre niveau.',
  'practice.listenAnswerNamed': '{exam} — écoutez et répondez, à votre niveau.',
  'practice.readAnswer': 'Lisez et répondez, à votre niveau.',
  'practice.readAnswerNamed': '{exam} — lisez et répondez, à votre niveau.',

  // ── Écrans d'authentification ────────────────────────────────────────────
  'auth.welcomeBack': 'Bon retour',
  'auth.signInBlurb': 'Connectez-vous pour reprendre votre préparation.',
  'auth.email': 'Courriel',
  'auth.emailPlaceholder': 'vous@exemple.com',
  'auth.password': 'Mot de passe',
  'auth.password8': 'Au moins 8 caractères',
  'auth.forgot': 'Mot de passe oublié ?',
  'auth.resetLink': 'Réinitialiser votre mot de passe →',
  'auth.signIn': 'Se connecter',
  'auth.signingIn': 'Connexion…',
  'auth.signInApple': 'Se connecter avec Apple',
  'auth.or': 'ou',
  'auth.newToSelm': 'Nouveau sur SELM ?',
  'auth.createAccount': 'Créer un compte',
  'auth.createYourAccount': 'Créez votre compte',
  'auth.registerBlurb': "Un accompagnement linguistique personnel, assisté par l'IA.",
  'auth.examMarked': 'Votre examen est corrigé',
  'auth.examMarkedBlurb':
    "Les réponses sont comptées et vous attendent sur cet appareil. Créez un compte pour lire le résultat — il est conservé avec votre compte, pas dans un onglet.",
  'auth.fullName': 'Nom complet',
  'auth.fullNamePlaceholder': 'Marie Tremblay',
  'auth.username': "Nom d'utilisateur",
  'auth.usernamePlaceholder': 'mtremblay',
  'auth.creating': 'Création du compte…',
  'auth.createAccountBtn': 'Créer le compte',
  'auth.continuing': 'Poursuite…',
  'auth.continueApple': 'Continuer avec Apple',
  'auth.haveAccount': 'Vous avez déjà un compte ?',
  'auth.resetTitle': 'Réinitialiser votre mot de passe',
  'auth.resetBlurb':
    "Saisissez le courriel utilisé à l'inscription et nous vous enverrons un lien de réinitialisation.",
  'auth.resetSent':
    "Si un compte existe pour **{email}**, nous avons envoyé un lien de réinitialisation. Vérifiez votre boîte de réception (et les indésirables) dans les prochaines minutes.",
  'auth.backToSignIn': 'Retour à la connexion',
  'auth.sending': 'Envoi…',
  'auth.sendResetLink': 'Envoyer le lien',
  'auth.rememberedIt': 'Vous vous en souvenez ?',
  'auth.newPasswordTitle': 'Choisissez un nouveau mot de passe',
  'auth.newPasswordBlurb':
    "Choisissez-en un d'au moins 8 caractères. Il vous servira à vous connecter la prochaine fois.",
  'auth.passwordUpdated': 'Mot de passe mis à jour. Redirection vers la connexion…',
  'auth.newPassword': 'Nouveau mot de passe',
  'auth.confirmNewPassword': 'Confirmer le nouveau mot de passe',
  'auth.reenterPassword': 'Saisissez à nouveau le mot de passe',
  'auth.requestNewLink': 'Demander un nouveau lien →',
  'auth.updating': 'Mise à jour…',
  'auth.setNewPassword': 'Définir le mot de passe',

  // ── Écran de consentement (App Store 5.1.1(i) / 5.1.2(i)) ────────────────
  'legal.privacyPolicy': 'Politique de confidentialité',
  'legal.termsOfUse': "Conditions d'utilisation",
  'consent.title': 'Vos données et les sous-traitants IA',
  'consent.intro':
    "SELM utilise l'IA pour vous accompagner. Avant que quoi que ce soit ne parte en votre nom, voici exactement ce que nous transmettons, à qui et pourquoi. Rien ne quitte votre appareil tant que vous n'avez pas accepté ci-dessous.",
  'consent.data': 'Données :',
  'consent.purpose': 'Finalité :',
  'consent.gemini.data':
    "Le texte que vous rédigez en expression orale, expression écrite, compréhension écrite et dans les réponses aux leçons",
  'consent.gemini.purpose': 'pour noter vos écrits et produire un retour personnalisé.',
  'consent.stt.data':
    "Les courts extraits audio que vous enregistrez en touchant le micro en expression orale",
  'consent.stt.purpose':
    'pour transcrire ce que vous avez dit et le comparer à la phrase cible.',
  'consent.speechace.data': 'Les mêmes extraits audio enregistrés en expression orale',
  'consent.speechace.purpose':
    "pour évaluer votre prononciation, l'accentuation, l'aisance et l'intonation, et renvoyer un retour de type CECR / IELTS.",
  'consent.elevenlabs.data': 'Uniquement le texte des leçons (jamais votre propre audio)',
  'consent.elevenlabs.purpose':
    "pour synthétiser les voix que vous entendez dans les exercices de compréhension orale.",
  'consent.revenuecat.data': 'Votre jeton de reçu {store} anonyme',
  'consent.revenuecat.purpose': 'pour vérifier que votre abonnement SELM Pro est actif.',
  'consent.store.data':
    'Votre identifiant {account} et votre moyen de paiement (entièrement gérés par {vendor})',
  'consent.store.purpose':
    "pour traiter le paiement de l'abonnement. SELM ne voit jamais votre numéro de carte.",
  'consent.commitment':
    "**Notre engagement.** Chaque sous-traitant ci-dessus est lié par un accord de traitement des données offrant une protection égale ou supérieure à celle qu'exige notre politique de confidentialité. Aucun ne peut utiliser vos contenus pour entraîner ses propres modèles. Nous ne vendons pas vos données. Vous pouvez supprimer votre compte et toutes ses données à tout moment depuis les réglages.",
  'consent.fullDetails':
    'Le détail complet, y compris les durées de conservation et vos droits, figure dans notre',
  'consent.and': 'et nos',
  'consent.notEnough':
    "Faire figurer cette information dans la seule politique ne suffit pas — c'est pourquoi nous vous demandons aussi de l'accepter ici.",
  'consent.checkbox':
    "J'ai lu ce qui précède et j'accepte que SELM transmette les données listées aux prestataires d'IA listés, aux finalités indiquées.",
  'consent.notNow': 'Pas maintenant',
  'consent.agree': 'Accepter et continuer',
  'consent.revoke':
    "Vous pouvez révoquer ce consentement en supprimant votre compte dans les réglages. Le retrait du consentement au traitement par IA passe par la suppression du compte, car les fonctions d'IA sont le cœur de SELM.",

  // ── Abonnement ───────────────────────────────────────────────────────────
  'common.close': 'Fermer',
  'paywall.blurb': 'Débloquez toutes les fonctions et progressez plus vite.',
  'paywall.perk1':
    "Accompagnement IA illimité en expression orale, compréhension orale, compréhension écrite et expression écrite",
  'paywall.perk2': 'Retour de prononciation en temps réel, noté à la manière IELTS',
  'paywall.perk3': 'Des leçons adaptées à votre niveau CECR (A1–C2)',
  'paywall.perk4': 'Répétition espacée du vocabulaire',
  'paywall.perk5': 'Réponses IA prioritaires',
  'paywall.reloadSubs': 'Recharger les abonnements et réessayer',
  'paywall.reminder':
    "Gratuit 7 jours, puis {price}/{cadence}. Renouvellement automatique sauf annulation au moins 24 heures avant la fin de l'essai.",
  'paywall.startTrial': "Commencer l'essai gratuit de 7 jours",
  'paywall.restore': 'Restaurer les achats',
  'paywall.legal':
    "Le paiement sera prélevé sur votre compte Apple ID à la fin de l'essai gratuit de 7 jours. L'abonnement se renouvelle automatiquement à {price}/{cadence} sauf annulation au moins 24 heures avant la fin de la période en cours. Vous pouvez gérer et annuler votre abonnement à tout moment dans les réglages de votre compte sur l'App Store après l'achat. Aucun remboursement n'est accordé pour une période d'abonnement entamée.",
  'paywall.bySubscribing': 'En vous abonnant, vous acceptez nos',

  // ── Expression orale ─────────────────────────────────────────────────────
  'speaking.record': "Enregistrez chaque tâche de l'examen et recevez un retour noté.",
  'speaking.recordNamed': '{exam} — enregistrez chaque tâche et recevez un retour noté.',
  'speaking.extraPractice': 'Entraînement complémentaire :',
  'speaking.pronunciation': 'Prononciation',
  'speaking.level': 'Niveau {level}',
  'speaking.new': 'Nouvelle',
  'speaking.readAloud': 'Lisez la phrase à voix haute',
  'speaking.analysing': 'Analyse de la prononciation…',
  'speaking.newSentence': 'Essayer une autre phrase',
  'speaking.recordToSee':
    'Enregistrez-vous pour voir les scores mot par mot et par phonème.',
  'speaking.speakUpTo': "Parlez jusqu'à {time} minutes",
  'speaking.timeOurs': " — notre répartition du temps de l'épreuve.",
  'speaking.timeExam': " — la limite propre à l'examen.",
  'speaking.tapToStart': "Touchez pour démarrer — jusqu'à {minutes} minutes",
  'speaking.scoring': 'Notation de votre réponse…',
  'speaking.recordAgain': 'Enregistrer à nouveau',
  'speaking.resultHere': 'Votre score et votre retour apparaîtront ici.',

  // ── Entraînement à la compréhension ──────────────────────────────────────
  'cp.levelFromResult': 'Servi autour de {band} — le niveau indiqué par votre dernier résultat {exam}.',
  'cp.levelFromGoal':
    "Servi autour de {band} — le niveau exigé par {system} {level}. Un relevé de notes antérieur ferait suivre vos résultats à la place.",
  'cp.levelPlain': 'Servi autour de {band}.',
  'cp.chooseExamFirst':
    "Choisissez d'abord votre examen. Tout ce que vous travaillez ici — la langue, les types de textes, les questions — en découle.",
  'cp.chooseMyExam': 'Choisir mon examen',
  'cp.skillNotBuilt': "{exam} — cette compétence n'est pas encore construite",
  'cp.skillNotBuiltWhy':
    "Votre examen attribue une note de {skill}, et nous n'avons pas encore rédigé cette partie. Rien n'est affiché ici plutôt que de substituer du matériel générique de {skill} : travailler ce que l'examen ne pose pas ne ferait pas bouger votre note, et prétendre le contraire serait pire qu'une page vide.",
  'cp.builtSkillsOnPractice': "Les compétences déjà construites se trouvent sur la page d'entraînement.",
  'cp.backToPractice': "Retour à l'entraînement",
  'cp.audioNotReady': '{exam} — les enregistrements ne sont pas prêts',
  'cp.audioNotReadyWhy':
    "Les questions existent mais leur audio n'a pas été enregistré. Une question de compréhension orale sans son enregistrement est une question de lecture ; elle n'est donc pas proposée. Cette section s'ouvrira dès que l'audio sera en place.",
  'cp.leftToPractise': '{unseen} {nouns} sur {total} \u00e0 travailler',
  'cp.allPractised': '{total} {nouns} dans cette banque \u00b7 tous travaill\u00e9s',
  'cp.oneQuestion': '{n} question',
  'cp.nQuestions': '{n} questions',
  'cp.fromYourPlan': 'de votre plan',
  'cp.recording': 'enregistrement',
  'cp.recordings': 'enregistrements',
  'cp.passage': 'texte',
  'cp.passages': 'textes',
  'cp.nothingHereYet': "Rien n'est encore écrit ici",
  'cp.planPointsAt':
    "Votre plan pointe vers **{label}**, et ce produit ne contient aucun {noun} à cette coordonnée pour {exam}. C'est une lacune de ce que nous avons construit, pas quelque chose que vous auriez déjà fait — et c'est la lacune que nous comblons ensuite.",
  'cp.practiseInstead': "Travailler la {skill} à votre niveau à la place",
  'cp.bankFinished':
    'Vous avez maintenant travaillé tous les {nounPl} dont nous disposons pour {exam} {skill} — les **{n}**.',
  'cp.bankFinishedWhy':
    "Vous pouvez les reprendre, et cela a une certaine utilité — l'orthographe, la deuxième écoute, la question expédiée. Mais un {noun} auquel vous avez déjà répondu teste surtout votre mémoire, et la mémoire n'est pas la compétence que l'examen évalue. Nous le disons plutôt que de vous redonner le même {noun} sans rien dire.",
  'cp.notAPredictedBand':
    "Le score ci-dessus indique votre résultat sur ces questions aujourd'hui. Ce n'est pas un niveau prédit.",
  'cp.goAgain': 'Les reprendre',
  'cp.replayHere':
    "Vous pouvez réécouter ici. Le jour de l'examen, vous ne l'entendrez qu'une fois.",
  'cp.correct': 'Correct',

  // ── Réglages du compte ───────────────────────────────────────────────────
  'account.title': 'Compte',
  'account.name': 'Nom',
  'account.privacy': 'Confidentialité',
  'account.privacyBlurb':
    'Découvrez comment SELM recueille, utilise et conserve vos données.',
  'account.readPolicy': 'Lire la politique de confidentialité →',
  'account.deleteTitle': 'Supprimer le compte',
  'account.deleted': 'Votre compte a été supprimé. Déconnexion…',
  'account.deleteMine': 'Supprimer mon compte',
  'account.sure': 'Êtes-vous sûr ? Cette action est irréversible.',
  'account.cancel': 'Annuler',
  'account.deleting': 'Suppression…',
  'account.yesDelete': 'Oui, supprimer',
  'account.deleteNote': 'Supprime votre compte et toutes vos données. Irréversible.',

  // ── Aujourd'hui ──────────────────────────────────────────────────────────
  'today.catalogueFailed': "Le catalogue des examens n'a pas pu être chargé",
  'today.catalogueFailedBody':
    "Votre tableau de bord en dépend : rien n'est affiché plutôt qu'une information fausse. Rechargez la page ; si l'erreur persiste, vous êtes probablement hors ligne.",
  'today.openEngine': "Ouvrir le moteur d'examen",
  'today.loadingExam': 'Chargement de votre examen',
  'today.changeExam': "Changer d'examen, de destination ou de date",
  'today.whenIsExam': 'Quand passez-vous votre examen ?',
  'today.pacedAgainstDate':
    "Tout ici est cadencé sur cette date. Sans elle, vous pouvez vous entraîner mais pas planifier.",
  'today.setDate': 'Fixer la date',
  'today.dayUntil': 'jour avant votre examen',
  'today.daysUntil': 'jours avant votre examen',
  'today.daySince': 'jour depuis votre examen',
  'today.daysSince': 'jours depuis votre examen',
  'today.doThisNext': 'À faire maintenant',
  'today.weakestFirst':
    "Votre compétence la plus faible d'abord — c'est elle qui fait bouger votre niveau déterminant.",
  'today.examOrder':
    "Votre plan suit l'ordre de l'examen tant que vous n'avez pas saisi de résultat antérieur.",
  'today.startNow': 'Commencer',
  'today.pickASkill': 'Choisissez une compétence et commencez.',
  'today.targetMeta': 'Objectif : {target} dans chaque compétence',
  'today.whereYouStand': 'Où vous en êtes',
  'today.notBuilt': "Ce qui n'est pas construit pour votre examen",
  'today.readyToBook': 'Êtes-vous prêt à réserver ?',
  'today.readyAnswer': '{system} {level} — et pourquoi',
  'today.notYetAnswerable': 'Pas encore de réponse — et pourquoi',
  'today.upgrade': 'Passer à SELM Pro',
  'today.upgradeBlurb': "Accompagnement IA illimité · essai gratuit de 7 jours",
  'today.reqOverall': '{label} · un total de {target}',
  'today.reqBoth': '{label} · un total de {target}, avec un minimum dans chaque compétence',
  'today.reqEvery':
    '{label} · {target} dans chaque compétence, et la plus basse fait foi',

  // ── Expression écrite ────────────────────────────────────────────────────
  'writing.eachTask': "Les tâches d'expression écrite de l'examen.",
  'writing.eachTaskNamed': '{exam} — rédigez chaque tâche et recevez un retour noté.',
  'writing.liveGrammar': 'Grammaire en direct',
  'writing.smartRewrite': 'Reformulation',
  'writing.writeHere': 'Écrivez ici — la vérification se fait à chaque pause',
  'writing.words': '{n} mots',
  'writing.checking': '· vérification…',
  'writing.startWriting':
    "Commencez à écrire… l'IA passe discrètement en revue votre grammaire, votre vocabulaire et votre style.",
  'writing.suggestionsHere': 'Les suggestions apparaissent ici au fil de votre écriture.',
  'writing.noIssues': 'Aucun problème détecté. Beau travail !',
  'writing.suggestion': '{n} suggestion',
  'writing.suggestions': '{n} suggestions',
  'writing.corrected': 'Corrigé',
  'writing.styleFormal': 'Soutenu',
  'writing.styleFormalDesc': 'Professionnel / officiel',
  'writing.styleSimple': 'Simple',
  'writing.styleSimpleDesc': 'Vocabulaire plus accessible',
  'writing.styleNatural': 'Naturel',
  'writing.styleNaturalDesc': 'Conversationnel',
  'writing.styleAcademic': 'Académique',
  'writing.styleAcademicDesc': 'Ton universitaire',
  'writing.styleFriendly': 'Amical',
  'writing.styleFriendlyDesc': 'Chaleureux et détendu',
  'writing.rewriteFailed': '(Reformulation impossible — réessayez.)',
  'writing.originalText': 'Texte d’origine',
  'writing.pasteToRewrite': 'Collez une phrase ou un paragraphe à reformuler…',
  'writing.chooseStyle': 'Choisir le style',
  'writing.rewriting': 'Reformulation…',
  'writing.rewriteAs': 'Reformuler en {style}',
  'writing.rewritten': 'Reformulé ({style})',
  'writing.yourDraft': 'Votre texte',
  'writing.writeResponse': 'Rédigez votre réponse ici…',
  'writing.scoring': 'Notation…',
  'writing.getFeedback': "Obtenir un retour de l'IA",
  'writing.overallScore': 'Score global',
  'writing.grammar': 'Grammaire',
  'writing.vocab': 'Vocabulaire',
  'writing.coherence': 'Cohérence',
  'writing.task': 'Tâche',
  'writing.strengths': 'Points forts',
  'writing.toImprove': 'À améliorer',
  'writing.writeAgain': 'Écrire à nouveau',

  // ── Résultats de l'oral ──────────────────────────────────────────────────
  'sr.overall': 'Global',
  'sr.ieltsBand': 'Niveau IELTS',
  'sr.cefr': 'CECR',
  'sr.fluency': 'Aisance :',
  'sr.pace': 'Débit :',
  'sr.wpm': '{n} mots/min',
  'sr.pauses': 'Pauses :',
  'sr.fillers': 'Mots de remplissage détectés :',
  'sr.coach': 'Coach :',
  'sr.bandBreakdown': 'Détail des niveaux IELTS',
  'sr.fluencyCoherence': 'Aisance et cohérence',
  'sr.lexicalResource': 'Ressources lexicales',
  'sr.grammarAccuracy': 'Grammaire et exactitude',
  'sr.toeflEst': 'TOEFL est.',
  'sr.pteEst': 'PTE est.',
  'sr.whatYouSaid': 'Ce que vous avez dit',
  'sr.transcript': 'Transcription',
  'sr.coachTips': 'Conseils du coach',
  'sr.grammarFixes': 'Corrections grammaticales',
  'sr.strongerWords': 'Des mots plus forts à employer',
  'sr.strongerWordsHelp':
    'Remplacez ces mots simples par ces équivalents de niveau supérieur la prochaine fois.',
  'sr.soundsToPractise': 'Sons à travailler',
  'sr.slipped': 'raté {n} ×',
  'sr.examples': 'Exemples :',
  'sr.wordByWord': 'Mot par mot',
  'sr.hoverHelp': 'Survolez un mot pour voir les scores par phonème.',

  // ── Vocabulaire ──────────────────────────────────────────────────────────
  'vocab.title': 'Révision du vocabulaire',
  'vocab.blurb': 'La répétition espacée fixe les mots dans votre mémoire à long terme.',
  'vocab.addWord': 'Ajouter un mot',
  'vocab.addToList': 'Ajouter un mot à votre liste',
  'vocab.addHelp':
    "Saisissez n'importe quel mot anglais. Nous le chercherons (ou demanderons à votre coach IA de le définir) et l'ajouterons à votre révision quotidienne.",
  'vocab.placeholder': 'ex. resilient',
  'vocab.adding': 'Ajout…',
  'vocab.add': 'Ajouter',
  'vocab.allCaughtUp': 'Tout est à jour',
  'vocab.nothingDue':
    "Aucun mot à réviser pour l'instant. Touchez **Ajouter un mot** ci-dessus pour commencer votre liste, ou lisez et écoutez pour en rencontrer de nouveaux.",
  'vocab.cardOf': 'Carte {i} sur {n}',
  'vocab.refresh': 'Actualiser',
  'vocab.word': 'mot',
  'vocab.definition': 'Définition',
  'vocab.example': 'Exemple',
  'vocab.hard': 'Difficile',
  'vocab.good': 'Correct',
  'vocab.easy': 'Facile',
  'vocab.howWell': 'Vous en souveniez-vous bien ?',
  'vocab.showDefinition': 'Afficher la définition',
  'vocab.sessionComplete': 'Session terminée',
  'vocab.reviewed': 'Vous avez révisé {n} mots. À demain.',
  'vocab.checkMore': "Vérifier s'il y en a d'autres",

  // ── Progression ──────────────────────────────────────────────────────────
  'progress.blurb': 'Ce que vous avez fait, et si la courbe bouge.',
  'progress.noPlan':
    "Choisissez votre examen et votre destination, et cette page pourra montrer à quoi sert votre entraînement. D'ici là il n'y a rien à mesurer — et une page qui remplirait l'espace malgré tout est précisément ce que celle-ci remplace.",
  'progress.notYetAnswerable': 'Pas encore de réponse',
  'progress.aggregate':
    "Cette destination lit un total : une compétence faible peut être compensée — mais un total exige encore que chaque compétence ait un nombre, et ce n'est pas le cas.",
  'progress.lowestGoverns':
    "C'est la plus basse de vos quatre compétences qui compte, pas la moyenne — un candidat à 8, 8, 8 et 5 est à 5. Aucun niveau global n'est affiché tant qu'une compétence est inconnue : prendre la plus basse de celles qui ont un nombre vous montrerait un meilleur résultat que celui que vous détenez.",
  'progress.meanwhile':
    "**Que faire en attendant :** travaillez les tâches que l'examen pose vraiment, passez l'examen blanc pour voir le niveau que vos réponses tiennent, et saisissez tout relevé de notes antérieur — c'est le seul nombre ici qui vienne de l'organisme certificateur et non de nous.",
  'progress.scoreOverTime': 'Score dans le temps',
  'progress.attempts': 'Tentatives',
  'progress.attemptsNote':
    "Le travail accompli, et quand. **Compter les tentatives n'est pas leur attribuer des points** — c'est un relevé de ce qui s'est passé, pas une note pour s'être présenté.",
  'progress.fourSkillsOnToday':
    "Vos quatre compétences et le niveau que chacune tient se trouvent sur **{today}**.",
  'progress.open': 'Ouvrir',
  'progress.notPractised': "Ce que vous n'avez pas encore travaillé",
  'progress.allAttempted': 'Chaque partie de votre plan a été tentée au moins une fois.',
  'progress.untouchedNote':
    "Une partie de l'examen jamais ouverte prédit mieux un niveau déterminant faible qu'un mauvais score sur une partie déjà travaillée. Voici les {n} que vous n'avez pas ouvertes.",
  'progress.nothingAuthored': "rien n'est encore rédigé derrière",
  'progress.notBuiltShort': 'non construit',
  'progress.noRealResult': 'Aucun résultat réel saisi',
  'progress.needPoints':
    'Une courbe a besoin de points. Saisissez un relevé {exam} antérieur et vous verrez votre niveau {system} par compétence face au {system} {level} exigé.',
  'progress.enteredResults': 'Vos résultats saisis · {system}',
  'progress.onePoint':
    "Un résultat est un point, pas une tendance. C'est un deuxième résultat saisi qui en fait une courbe.",
  'progress.needTwoSittings':
    "Ce graphique a besoin de deux sessions avant de pouvoir montrer quoi que ce soit. Il reste vide plutôt que rempli d'un nombre qui ne mesurerait que la fréquence de vos ouvertures de l'application.",
  'progress.secondSitting':
    "C'est une deuxième session qui transforme un point en courbe. D'ici là il n'y a rien à tracer, et tracer quelque chose malgré tout reviendrait à inventer une tendance.",
  'progress.takeMock': 'Passer un examen blanc',
  'progress.practiceSittings': "Sessions d'entraînement · niveau tenu",
  'progress.bandHeldNote':
    "Voici le niveau CECR tenu par chaque session. Il n'est **pas** tracé face à votre objectif {target} : une session d'entraînement produit un nombre de bonnes réponses, et la conversion de ce nombre vers l'échelle publiée de l'examen n'est pas diffusée par l'organisme certificateur. Une ligne d'objectif ici serait une conversion dessinée plutôt que calculée.",

  // ── Pages légales ────────────────────────────────────────────────────────
  'legal.tagline': 'Connaissez votre score',
  'legal.lastUpdated': 'Dernière mise à jour :',
  'legal.contactHeading': '11. Contact',
  'legal.address': 'Vancouver, Colombie-Britannique, Canada',
  'legal.email': 'Courriel :',
  'legal.returnToSelm': 'Retour à SELM',

  'privacy.contactHeading': '10. Contact',
  'privacy.contactBlurb':
    'Des questions ou des demandes concernant cette politique ou vos données ?',

  // ── Aujourd'hui : les quatre tuiles de compétence ────────────────────────
  'today.yourFourSkills': 'Vos quatre compétences',
  'today.startMock': "Commencer l'examen blanc",
  'today.resumeMock': 'Reprendre la session',
  'today.tileCorrect': '{correct} bonnes sur {total}',
  'today.tileQuestions': '{n} questions · pas encore passée',
  'today.tileTasks': "{tasks} tâches · {situations} sujets · ceux de l'examen",
  'today.tileNotBuiltShort': 'Pas encore construite',

  'me.progressTitle': 'Votre progression',
  'me.progressBlurb':
    'Chaque session et chaque tentative, tracées face au niveau fixé sur cette page.',
};
