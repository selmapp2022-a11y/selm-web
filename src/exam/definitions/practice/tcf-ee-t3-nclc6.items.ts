/**
 * PRACTICE BANK — TCF Canada · expression écrite · tâche 3 · NCLC 6.
 *
 * Eight items for one coordinate. THE PLAN §4.1 asks for "several options
 * per coordinate, not hundreds" and Part 6 requires ≥ 4; eight gives the
 * pool test something to fail on.
 *
 * Every item is built to force the prescribed move: the two documents do
 * not disagree about the SUBJECT — they agree about the subject — they
 * disagree about one nameable thing underneath it. An item whose documents
 * simply say yes and no teaches juxtaposition, which is the failure this
 * cell exists to remove.
 *
 * Each item carries three responses, and they are the item's own test:
 *
 *   nclc7   — compares. Gate must pass, diagnosis must NOT fire.
 *   nclc6   — two summaries. Gate must pass, diagnosis MUST fire.
 *   single  — one document only. Gate MUST zero it on source_coverage.
 *
 * An item that cannot separate those three is a defective item, and
 * `cell.check.ts` prints which one and why.
 */
import type { GateRule, Localised } from '../../model/types';

export type PracticeItem = {
  id: string;
  /** The nameable axis the two documents disagree on. Written for us, not the candidate. */
  axis: string;
  prompt: Localised;
  topicKeywords: string[];
  sources: Extract<GateRule, { id: 'source_coverage' }>['sources'];
  responses: { nclc7: string; nclc6: string; single: string };
};

export const ITEMS: PracticeItem[] = [
  {
    id: 't3-n6-01-telephones',
    axis: 'Qui apprend l’autodiscipline à l’enfant : l’école par la règle, ou la famille par l’usage.',
    prompt: {
      en: 'Document 1 — a school board notice. Document 2 — a letter from a parents’ association.',
      fr: `Document 1 — un avis du conseil scolaire annonçant que les téléphones seront rangés dans un casier pendant toute la journée. Le conseil invoque la concentration en classe, de meilleurs résultats aux examens et moins de conflits en ligne pendant les récréations.

Document 2 — une lettre d'une association de parents. Elle rappelle que les parents doivent pouvoir joindre leur enfant en cas d'urgence, que beaucoup de familles s'organisent ainsi après les cours, et qu'un adolescent apprend l'autonomie en se servant d'un outil, non en s'en voyant privé.

Comparez les deux positions et donnez votre avis argumenté.`,
    },
    topicKeywords: ['téléphone', 'école', 'élève', 'portable', 'classe', 'parents'],
    sources: [
      {
        id: 'doc1',
        label: { en: 'Document 1 — the school board notice', fr: 'Document 1 — l’avis du conseil scolaire' },
        keywords: ['conseil', 'casier', 'concentration', 'résultats', 'récréation', 'conflits', 'examens'],
      },
      {
        id: 'doc2',
        label: { en: 'Document 2 — the parents’ letter', fr: 'Document 2 — la lettre des parents' },
        keywords: ['urgence', 'joindre', 'famille', 'association', 'autonomie', 'adolescent', 'outil'],
      },
    ],
    responses: {
      nclc7: `Le désaccord ne porte pas sur le téléphone lui-même : les deux textes admettent qu'il dérange la classe. Il porte sur la personne qui doit apprendre à l'enfant à s'en servir.

Là où le conseil scolaire compte les résultats aux examens et les conflits de récréation, la lettre des parents compte les urgences et l'organisation de la famille après les cours. Le conseil raisonne sur un groupe entier ; l'association raisonne sur un adolescent et sur son autonomie. En revanche, aucun des deux ne dit ce qui se passe le jour où un parent doit joindre son enfant pendant les heures de cours.

Certes, le casier réglerait la question de la concentration tout de suite. Mais sur ce point précis, je pense qu'une interdiction totale déplace le problème au lieu de l'apprendre.`,
      nclc6: `Le conseil scolaire a décidé que les téléphones seront rangés dans un casier toute la journée. Il explique que les élèves seront plus concentrés en classe. Les résultats aux examens devraient s'améliorer. Il y aura aussi moins de conflits pendant la récréation.

L'association de parents n'est pas d'accord avec cette décision. Les parents veulent pouvoir joindre leur enfant en cas d'urgence. Beaucoup de familles s'organisent avec le téléphone après les cours. L'association pense qu'un adolescent apprend l'autonomie en se servant d'un outil.

Pour ma part, je pense que la technologie est très importante dans le monde d'aujourd'hui. Les jeunes doivent apprendre à vivre avec elle. C'est pourquoi je trouve que cette question est difficile et qu'il faut réfléchir.`,
      single: `Le conseil scolaire a annoncé que les téléphones seront rangés dans un casier pendant toute la journée. L'avis explique que les élèves sont beaucoup moins concentrés quand l'appareil reste dans leur poche. Le conseil espère de meilleurs résultats aux examens à la fin de l'année.

Il ajoute qu'il y aura moins de conflits en ligne pendant la récréation, parce que les messages et les photos partent souvent de la cour de l'école.

Je trouve que cette décision est raisonnable. Dans ma propre expérience, il est impossible de suivre un cours quand l'écran s'allume toutes les deux minutes. Les élèves parlent davantage entre eux quand l'appareil n'est pas là. Le conseil devrait cependant expliquer sa règle aux élèves plutôt que de l'imposer sans discussion.`,
    },
  },

  {
    id: 't3-n6-02-compostage',
    axis: 'Une obligation sans moyen de l’appliquer est-elle une règle ou une amende déguisée.',
    prompt: {
      en: 'Document 1 — a municipal notice. Document 2 — a letter from a tenants’ association.',
      fr: `Document 1 — un avis municipal rendant le compostage des déchets de cuisine obligatoire dans tous les immeubles à partir du printemps. La ville met en avant la réduction des ordures envoyées au dépotoir, un sol enrichi pour les parcs, et une amende de cinquante dollars en cas de refus répété.

Document 2 — une lettre d'une association de locataires. Elle explique que la plupart des appartements n'ont ni balcon ni espace de rangement, que le bac fourni tient mal dans une cuisine, et que l'amende touchera d'abord les logements les plus petits.

Comparez les deux positions et donnez votre avis argumenté.`,
    },
    topicKeywords: ['compostage', 'déchets', 'immeuble', 'ville', 'bac', 'locataires'],
    sources: [
      {
        id: 'doc1',
        label: { en: 'Document 1 — the municipal notice', fr: 'Document 1 — l’avis municipal' },
        keywords: ['dépotoir', 'ordures', 'parcs', 'amende', 'printemps', 'obligatoire', 'sol'],
      },
      {
        id: 'doc2',
        label: { en: 'Document 2 — the tenants’ letter', fr: 'Document 2 — la lettre des locataires' },
        keywords: ['balcon', 'rangement', 'appartement', 'cuisine', 'locataires', 'petits', 'logements'],
      },
    ],
    responses: {
      nclc7: `Les deux textes veulent la même chose : moins d'ordures au dépotoir. Le désaccord porte sur ce qu'il faut fournir avant d'exiger.

Là où l'avis municipal parle du sol des parcs et d'une amende, la lettre des locataires parle d'un appartement sans balcon et d'une cuisine où le bac ne tient pas. La ville mesure un résultat à l'échelle de la ville ; l'association mesure un mètre carré chez elle. En revanche, la ville ne dit nulle part où le bac doit être rangé, et c'est justement la seule question que pose la lettre.

Certes, une obligation sans amende reste une invitation. Mais sur ce point précis, je pense qu'une règle qu'on ne peut pas appliquer chez soi devient une taxe sur les petits logements, tandis qu'un espace de rangement collectif réglerait les deux.`,
      nclc6: `La ville a décidé que le compostage des déchets de cuisine sera obligatoire dans tous les immeubles au printemps. Elle veut réduire les ordures envoyées au dépotoir. Le compost servira aussi à enrichir le sol des parcs de la ville. Une amende de cinquante dollars est prévue en cas de refus répété.

L'association de locataires a écrit une lettre contre cette décision. Elle dit que la plupart des appartements n'ont pas de balcon ni d'espace de rangement. Le bac fourni tient mal dans une cuisine. L'amende touchera surtout les petits logements.

À mon avis, la protection de l'environnement est une question très importante pour l'avenir. Chacun doit faire un effort à son niveau. Je trouve donc que cette mesure va dans la bonne direction.`,
      single: `L'avis municipal annonce que le compostage des déchets de cuisine deviendra obligatoire dans tous les immeubles dès le printemps prochain. La ville explique qu'une grande partie de ce qui part au dépotoir aujourd'hui pourrait servir ailleurs.

Le compost récolté enrichira le sol des parcs, ce qui coûtera moins cher que d'acheter de la terre chaque année. L'avis prévoit une amende de cinquante dollars pour les refus répétés, afin que la règle soit prise au sérieux.

Je pense que cette mesure est une bonne idée. Dans mon quartier, les poubelles débordent chaque semaine et une grande partie est de la nourriture. La ville devrait toutefois commencer par une année sans amende, le temps que les habitants prennent l'habitude et comprennent ce qui se composte.`,
    },
  },

  {
    id: 't3-n6-03-teletravail',
    axis: 'La présence au bureau mesure-t-elle le travail, ou déplace-t-elle son coût vers le salarié.',
    prompt: {
      en: 'Document 1 — an employer notice. Document 2 — a letter from a staff union.',
      fr: `Document 1 — une note de la direction demandant à tout le personnel de revenir au bureau trois jours par semaine. La direction invoque la formation des nouveaux employés, des décisions plus rapides quand les équipes se voient, et des bureaux loués qui restent vides.

Document 2 — une lettre du syndicat. Elle rappelle que les objectifs ont été atteints pendant deux ans à distance, que le trajet coûte du temps et de l'argent au salarié, et que beaucoup de personnes ont déménagé loin en se fiant à la règle précédente.

Comparez les deux positions et donnez votre avis argumenté.`,
    },
    topicKeywords: ['bureau', 'télétravail', 'personnel', 'direction', 'distance', 'semaine'],
    sources: [
      {
        id: 'doc1',
        label: { en: 'Document 1 — the employer notice', fr: 'Document 1 — la note de la direction' },
        keywords: ['formation', 'décisions', 'équipes', 'loués', 'vides', 'direction', 'nouveaux'],
      },
      {
        id: 'doc2',
        label: { en: 'Document 2 — the union letter', fr: 'Document 2 — la lettre du syndicat' },
        keywords: ['syndicat', 'objectifs', 'trajet', 'salarié', 'déménagé', 'argent', 'règle'],
      },
    ],
    responses: {
      nclc7: `Le désaccord ne porte pas sur la qualité du travail : la direction ne prétend nulle part que les objectifs n'ont pas été atteints. Il porte sur qui paie le retour.

Là où la note de la direction compte la formation des nouveaux et des bureaux loués qui restent vides, la lettre du syndicat compte le trajet du salarié et les personnes qui ont déménagé en se fiant à la règle précédente. L'employeur mesure un coût d'entreprise ; le syndicat mesure un coût privé. En revanche, ni l'un ni l'autre ne chiffre ce que vaut une heure de trajet.

Certes, un nouvel employé apprend mal seul devant un écran. Mais sur ce point précis, je pense que trois jours imposés à tous font payer la formation de quelques-uns par tout le monde.`,
      nclc6: `La direction demande à tout le personnel de revenir au bureau trois jours par semaine. Elle explique que les nouveaux employés ont besoin d'être formés sur place. Les décisions sont aussi plus rapides quand les équipes se voient. De plus, les bureaux loués par l'entreprise restent vides.

Le syndicat a répondu par une lettre. Il rappelle que les objectifs ont été atteints pendant deux ans à distance. Le trajet coûte du temps et de l'argent au salarié. Beaucoup de personnes ont déménagé loin en se fiant à la règle précédente.

Je crois que le monde du travail a beaucoup changé ces dernières années. Il faut trouver un équilibre entre la vie professionnelle et la vie privée. C'est pourquoi cette question mérite une vraie discussion.`,
      single: `La note de la direction demande à l'ensemble du personnel de revenir au bureau trois jours par semaine à partir du mois prochain. Elle donne trois raisons.

D'abord, les nouveaux employés apprennent mal à distance : personne ne voit ce qu'ils font et ils n'osent pas poser de questions. Ensuite, les décisions avancent plus vite quand les équipes se retrouvent dans la même pièce. Enfin, l'entreprise paie des bureaux loués qui restent vides toute la semaine.

Je pense que ces arguments ne se valent pas tous. La formation des nouveaux me paraît sérieuse, parce qu'un débutant a besoin de voir travailler quelqu'un. Le coût des bureaux vides, en revanche, est un problème de la direction et non du personnel. La règle devrait donc viser les équipes qui accueillent des débutants.`,
    },
  },

  {
    id: 't3-n6-04-ecole-village',
    axis: 'Un coût par élève contre des heures d’autobus : deux unités de mesure différentes.',
    prompt: {
      en: 'Document 1 — a school board notice. Document 2 — a letter from village parents.',
      fr: `Document 1 — un avis du conseil scolaire annonçant la fermeture de l'école du village à la rentrée. Le conseil explique qu'il reste trente-deux élèves pour trois classes, que le chauffage et l'entretien du bâtiment coûtent plus cher que dans une grande école, et que les enfants auront accès à un gymnase et à un laboratoire.

Document 2 — une lettre des parents du village. Elle indique que le trajet en autobus prendra une heure et quart matin et soir, que les plus jeunes ont six ans, et que l'école sert aussi de bibliothèque et de salle de réunion pour tout le village.

Comparez les deux positions et donnez votre avis argumenté.`,
    },
    topicKeywords: ['école', 'village', 'élèves', 'conseil', 'fermeture', 'enfants'],
    sources: [
      {
        id: 'doc1',
        label: { en: 'Document 1 — the school board notice', fr: 'Document 1 — l’avis du conseil scolaire' },
        keywords: ['chauffage', 'entretien', 'bâtiment', 'gymnase', 'laboratoire', 'classes', 'coûtent'],
      },
      {
        id: 'doc2',
        label: { en: 'Document 2 — the parents’ letter', fr: 'Document 2 — la lettre des parents' },
        keywords: ['autobus', 'trajet', 'bibliothèque', 'réunion', 'parents', 'matin', 'soir'],
      },
    ],
    responses: {
      nclc7: `Les deux textes parlent des mêmes enfants, mais ils ne comptent pas la même chose. Le désaccord porte sur l'unité de mesure.

Là où le conseil scolaire compte en dollars — le chauffage, l'entretien du bâtiment, un gymnase et un laboratoire qu'un village ne peut pas payer —, la lettre des parents compte en heures : une heure et quart d'autobus le matin, autant le soir, pour des enfants de six ans. Le conseil raisonne par élève ; les parents raisonnent par journée. En revanche, aucun des deux ne parle du village lui-même, alors que la lettre signale que le bâtiment sert aussi de bibliothèque et de salle de réunion.

Certes, trois classes pour trente-deux élèves coûtent cher. Mais sur ce point précis, je pense qu'on ferme aussi le seul lieu commun du village.`,
      nclc6: `Le conseil scolaire a décidé de fermer l'école du village à la rentrée prochaine. Il reste seulement trente-deux élèves pour trois classes. Le chauffage et l'entretien du bâtiment coûtent plus cher que dans une grande école. Les enfants auront accès à un gymnase et à un laboratoire.

Les parents du village ont écrit une lettre pour protester. Le trajet en autobus prendra une heure et quart le matin et le soir. Les plus jeunes enfants ont seulement six ans. L'école sert aussi de bibliothèque et de salle de réunion pour tout le village.

Selon moi, l'éducation des enfants est la chose la plus importante dans une société. Chaque enfant doit avoir les mêmes chances de réussir. Je trouve donc que cette décision est très difficile à prendre.`,
      single: `L'avis du conseil scolaire annonce que l'école du village fermera ses portes à la rentrée. Le conseil donne des chiffres : trente-deux élèves répartis dans trois classes, et un bâtiment dont le chauffage et l'entretien reviennent plus cher, par enfant, que dans une école de ville.

Il ajoute que les élèves transférés auront accès à un gymnase et à un laboratoire de sciences, ce que le village n'a jamais pu offrir.

Je comprends ce raisonnement, mais il me paraît incomplet. Un laboratoire ne sert que quelques heures par semaine, alors qu'une classe de dix enfants où l'enseignante connaît chacun sert tous les jours. Le conseil devrait publier ce que coûte réellement le transport des trente-deux élèves avant de présenter la fermeture comme une économie.`,
    },
  },
  {
    id: 't3-n6-05-publicite',
    axis: 'Qui choisit pour l’enfant : la famille dans le magasin, ou la règle avant le magasin.',
    prompt: {
      en: 'Document 1 — a health ministry notice. Document 2 — a letter from an advertisers’ association.',
      fr: `Document 1 — un avis du ministère de la Santé annonçant l'interdiction de la publicité pour les aliments très sucrés dans les émissions destinées aux moins de treize ans. Le ministère cite la hausse du diabète chez les jeunes et le coût des soins pour la collectivité.

Document 2 — une lettre d'une association d'annonceurs. Elle soutient que ce sont les parents qui remplissent le panier, que l'interdiction fera perdre des revenus aux chaînes qui produisent des émissions pour enfants, et qu'un produit légal doit pouvoir être présenté.

Comparez les deux positions et donnez votre avis argumenté.`,
    },
    topicKeywords: ['publicité', 'enfants', 'aliments', 'émissions', 'sucrés', 'interdiction'],
    sources: [
      {
        id: 'doc1',
        label: { en: 'Document 1 — the ministry notice', fr: 'Document 1 — l’avis du ministère' },
        keywords: ['ministère', 'diabète', 'soins', 'collectivité', 'santé', 'hausse', 'jeunes'],
      },
      {
        id: 'doc2',
        label: { en: 'Document 2 — the advertisers’ letter', fr: 'Document 2 — la lettre des annonceurs' },
        keywords: ['annonceurs', 'panier', 'revenus', 'chaînes', 'légal', 'parents', 'produit'],
      },
    ],
    responses: {
      nclc7: `Le désaccord ne porte pas sur le sucre : les annonceurs ne défendent nulle part le diabète. Il porte sur le moment où le choix se fait.

Là où le ministère compte les soins payés par la collectivité et raisonne avant le magasin, la lettre des annonceurs compte les revenus des chaînes et raisonne dans le magasin, au moment où le parent remplit le panier. L'un place la décision dans une règle générale ; l'autre la place dans une famille. En revanche, aucun des deux ne dit ce qu'un enfant de sept ans comprend d'une publicité.

Certes, un produit légal doit pouvoir être présenté quelque part. Mais sur ce point précis, je pense qu'une émission pour les moins de treize ans n'est pas ce quelque part.`,
      nclc6: `Le ministère de la Santé a décidé d'interdire la publicité pour les aliments très sucrés dans les émissions pour les moins de treize ans. Il explique que le diabète augmente beaucoup chez les jeunes. Les soins coûtent aussi très cher à la collectivité.

L'association d'annonceurs n'est pas d'accord. Elle dit que ce sont les parents qui remplissent le panier au magasin. L'interdiction fera perdre des revenus aux chaînes qui produisent des émissions pour enfants. Un produit légal doit pouvoir être présenté au public.

Pour ma part, je pense que la santé des enfants est un sujet essentiel dans nos sociétés modernes. Il faut protéger les plus jeunes. C'est pourquoi je trouve cette question très intéressante et compliquée.`,
      single: `L'avis du ministère de la Santé annonce l'interdiction de la publicité pour les aliments très sucrés dans les émissions destinées aux moins de treize ans. Le texte s'appuie sur deux chiffres.

Le premier est la hausse du diabète chez les jeunes, qui a doublé en une génération. Le second est le coût des soins pour la collectivité, puisque ces maladies durent toute la vie et se traitent longtemps.

Cette mesure me paraît justifiée. Un enfant de sept ans ne fait pas la différence entre une émission et la publicité qui la coupe ; il voit la même image. En revanche, le ministère devrait dire ce qu'il entend par « très sucré », sans quoi chaque fabricant décidera lui-même si son produit est concerné.`,
    },
  },

  {
    id: 't3-n6-06-bibliotheque',
    axis: 'Un service public le dimanche : accès pour qui, payé par le temps de qui.',
    prompt: {
      en: 'Document 1 — a city notice. Document 2 — a letter from the library staff union.',
      fr: `Document 1 — un avis de la ville annonçant l'ouverture de la bibliothèque municipale le dimanche. La ville explique que beaucoup d'habitants travaillent en semaine, que les élèves ont besoin d'une salle calme le week-end, et que le bâtiment reste fermé un jour sur sept.

Document 2 — une lettre du syndicat du personnel. Elle rappelle qu'aucun poste n'est créé, que les heures du dimanche seront prises sur les jours de semaine, et que les employés ont eux aussi des enfants et une vie de famille le week-end.

Comparez les deux positions et donnez votre avis argumenté.`,
    },
    topicKeywords: ['bibliothèque', 'dimanche', 'ville', 'ouverture', 'personnel', 'week-end'],
    sources: [
      {
        id: 'doc1',
        label: { en: 'Document 1 — the city notice', fr: 'Document 1 — l’avis de la ville' },
        keywords: ['habitants', 'élèves', 'calme', 'bâtiment', 'fermé', 'municipale', 'semaine'],
      },
      {
        id: 'doc2',
        label: { en: 'Document 2 — the union letter', fr: 'Document 2 — la lettre du syndicat' },
        keywords: ['syndicat', 'poste', 'heures', 'employés', 'famille', 'créé', 'personnel'],
      },
    ],
    responses: {
      nclc7: `Les deux textes veulent une bibliothèque utile. Le désaccord porte sur la personne dont on prend le dimanche.

Là où l'avis de la ville compte les habitants qui travaillent en semaine et les élèves qui cherchent une salle calme, la lettre du syndicat compte les heures qui seront retirées aux jours ouvrables et les employés qui ont aussi des enfants. La ville mesure un accès ; le syndicat mesure un horaire. En revanche, l'avis ne dit nulle part qu'aucun poste n'est créé, et c'est le seul chiffre que donne la lettre.

Certes, un bâtiment fermé un jour sur sept est mal utilisé. Mais sur ce point précis, je pense qu'ouvrir sans embaucher revient à déplacer la fermeture vers le mardi, tandis que deux postes régleraient les deux textes à la fois.`,
      nclc6: `La ville a annoncé que la bibliothèque municipale ouvrira le dimanche. Beaucoup d'habitants travaillent pendant la semaine et ne peuvent pas venir. Les élèves cherchent une salle calme pendant le week-end. Le bâtiment reste fermé un jour sur sept, ce qui est dommage.

Le syndicat du personnel a écrit une lettre. Il rappelle qu'aucun poste ne sera créé pour cette ouverture. Les heures du dimanche seront prises sur les jours de semaine. Les employés ont eux aussi des enfants et une vie de famille le week-end.

À mon avis, la lecture est une activité essentielle pour toute la population. Les bibliothèques jouent un rôle important dans une ville moderne. Je pense donc qu'il faut soutenir ces établissements.`,
      single: `L'avis de la ville annonce que la bibliothèque municipale ouvrira désormais le dimanche. Trois raisons sont données.

Beaucoup d'habitants travaillent du lundi au vendredi et ne peuvent venir qu'aux heures où l'établissement est déjà fermé. Les élèves, de leur côté, cherchent une salle calme pendant le week-end, surtout ceux qui vivent à plusieurs dans un petit logement. Enfin, le bâtiment reste inutilisé un jour sur sept alors que la ville en paie le chauffage.

Cette ouverture me paraît une bonne décision. Dans mon quartier, la bibliothèque est le seul endroit gratuit où l'on peut rester assis plusieurs heures. La ville devrait toutefois annoncer en même temps combien de personnes travailleront ce jour-là.`,
    },
  },

  {
    id: 't3-n6-07-voiture-electrique',
    axis: 'Une date fixée d’avance : qui porte le coût du changement, l’acheteur ou l’atelier.',
    prompt: {
      en: 'Document 1 — a government notice. Document 2 — a letter from a mechanics’ association.',
      fr: `Document 1 — un communiqué du gouvernement fixant à 2035 la fin de la vente de voitures neuves à essence. Le texte annonce une baisse des émissions, une aide à l'achat pour les ménages, et de nouvelles bornes de recharge sur les grandes routes.

Document 2 — une lettre d'une association de garagistes. Elle indique qu'un atelier de campagne vit surtout de l'entretien des moteurs, qu'une formation coûte plusieurs milliers de dollars par mécanicien, et qu'aucune aide n'est prévue pour les ateliers eux-mêmes.

Comparez les deux positions et donnez votre avis argumenté.`,
    },
    topicKeywords: ['voiture', 'électrique', 'essence', 'gouvernement', 'garagistes', 'vente'],
    sources: [
      {
        id: 'doc1',
        label: { en: 'Document 1 — the government notice', fr: 'Document 1 — le communiqué du gouvernement' },
        keywords: ['émissions', 'ménages', 'bornes', 'recharge', 'routes', 'communiqué', 'neuves'],
      },
      {
        id: 'doc2',
        label: { en: 'Document 2 — the mechanics’ letter', fr: 'Document 2 — la lettre des garagistes' },
        keywords: ['atelier', 'moteurs', 'formation', 'mécanicien', 'campagne', 'garagistes', 'entretien'],
      },
    ],
    responses: {
      nclc7: `Le désaccord ne porte pas sur la date : les garagistes ne défendent nulle part l'essence. Il porte sur ceux que l'aide oublie.

Là où le communiqué du gouvernement compte les émissions évitées, les bornes de recharge et une aide versée aux ménages, la lettre des garagistes compte une formation à plusieurs milliers de dollars par mécanicien et un atelier de campagne qui vit de l'entretien des moteurs. L'État aide celui qui achète ; personne n'aide celui qui répare. En revanche, les deux textes admettent que le métier va changer.

Certes, une date lointaine laisse le temps de se préparer. Mais sur ce point précis, je pense qu'une transition qui aide l'acheteur et pas l'atelier fera disparaître les garages avant les moteurs.`,
      nclc6: `Le gouvernement a annoncé la fin de la vente des voitures neuves à essence en 2035. Cette mesure permettra de réduire les émissions polluantes. Une aide à l'achat est prévue pour les ménages. De nouvelles bornes de recharge seront installées sur les grandes routes.

L'association de garagistes a répondu par une lettre. Un atelier de campagne vit surtout de l'entretien des moteurs à essence. Une formation coûte plusieurs milliers de dollars par mécanicien. Aucune aide n'est prévue pour les ateliers eux-mêmes.

Je crois que la lutte contre la pollution est un enjeu majeur de notre époque. Tous les pays doivent agir ensemble pour l'avenir de la planète. C'est pourquoi je trouve cette décision nécessaire.`,
      single: `Le communiqué du gouvernement fixe à 2035 la fin de la vente des voitures neuves à essence. Il annonce en même temps deux mesures d'accompagnement.

La première est une aide à l'achat versée aux ménages, afin qu'une voiture électrique reste accessible aux familles qui n'ont pas d'économies. La seconde est l'installation de bornes de recharge sur les grandes routes, parce que la crainte de tomber en panne loin de chez soi arrête beaucoup d'acheteurs.

Je trouve la date raisonnable, car dix ans suffisent pour changer de véhicule une fois. Le communiqué reste cependant silencieux sur les régions où il n'y a ni garage ni borne à moins de cinquante kilomètres, et c'est précisément là que la voiture est indispensable.`,
    },
  },

  {
    id: 't3-n6-08-frais-scolarite',
    axis: 'Une place d’université : attirer de loin ou garder pour près.',
    prompt: {
      en: 'Document 1 — a university notice. Document 2 — a letter from a student association.',
      fr: `Document 1 — un communiqué de l'université annonçant la gratuité des frais de scolarité pour les étudiants étrangers en maîtrise scientifique. L'université met en avant les laboratoires qui manquent de chercheurs, les diplômés qui restent souvent travailler dans la région, et la réputation internationale de l'établissement.

Document 2 — une lettre de l'association étudiante. Elle rappelle que les frais des étudiants d'ici n'ont pas baissé depuis huit ans, que le nombre de places en maîtrise n'augmente pas, et que les logements près du campus sont déjà introuvables.

Comparez les deux positions et donnez votre avis argumenté.`,
    },
    topicKeywords: ['université', 'étudiants', 'frais', 'scolarité', 'maîtrise', 'places'],
    sources: [
      {
        id: 'doc1',
        label: { en: 'Document 1 — the university notice', fr: 'Document 1 — le communiqué de l’université' },
        keywords: ['laboratoires', 'chercheurs', 'diplômés', 'région', 'réputation', 'gratuité', 'internationale'],
      },
      {
        id: 'doc2',
        label: { en: 'Document 2 — the student letter', fr: 'Document 2 — la lettre de l’association étudiante' },
        keywords: ['association', 'baissé', 'logements', 'campus', 'introuvables', 'huit', 'nombre'],
      },
    ],
    responses: {
      nclc7: `Les deux textes veulent une université forte. Le désaccord porte sur la ressource qui manque vraiment.

Là où le communiqué de l'université compte les laboratoires sans chercheurs et la réputation internationale, la lettre de l'association étudiante compte des places en maîtrise qui n'augmentent pas et des logements introuvables près du campus. L'établissement raisonne en attirant de loin ; les étudiants raisonnent en partageant ce qui existe déjà. En revanche, le communiqué ne dit nulle part si de nouvelles places seront ouvertes, et c'est la question que pose la lettre.

Certes, un laboratoire vide ne sert personne, et les diplômés restent souvent travailler dans la région. Mais sur ce point précis, je pense que la gratuité sans places supplémentaires met deux groupes d'étudiants en concurrence au lieu d'agrandir l'université.`,
      nclc6: `L'université a annoncé la gratuité des frais de scolarité pour les étudiants étrangers en maîtrise scientifique. Les laboratoires manquent de chercheurs depuis plusieurs années. Les diplômés restent souvent travailler dans la région après leurs études. Cette mesure améliorera aussi la réputation internationale de l'établissement.

L'association étudiante a écrit une lettre à la direction. Les frais des étudiants d'ici n'ont pas baissé depuis huit ans. Le nombre de places en maîtrise n'augmente pas cette année. Les logements près du campus sont déjà introuvables pour tout le monde.

Selon moi, l'éducation supérieure ouvre les portes de l'avenir. Les échanges entre les pays enrichissent beaucoup les jeunes générations. Je trouve donc que ce débat est important pour la société.`,
      single: `Le communiqué de l'université annonce la gratuité des frais de scolarité pour les étudiants étrangers inscrits en maîtrise scientifique. Trois arguments sont avancés.

D'abord, plusieurs laboratoires manquent de chercheurs et certains projets sont arrêtés faute de bras. Ensuite, les diplômés de ces programmes restent souvent travailler dans la région, si bien que la dépense revient dans l'économie locale. Enfin, la réputation internationale de l'établissement dépend du nombre de pays représentés.

Le raisonnement me paraît solide sur le premier point : un laboratoire sans chercheur ne produit rien. Il l'est moins sur le troisième, car une réputation ne se mesure pas et l'université ne dit pas combien coûtera la mesure ni pendant combien d'années elle sera maintenue.`,
    },
  },
];
