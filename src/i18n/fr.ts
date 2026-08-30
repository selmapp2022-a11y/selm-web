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
  'onboarding.partial': '{built} seulement. {missing} pas encore construit.',
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
};
