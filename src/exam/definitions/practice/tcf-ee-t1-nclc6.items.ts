/**
 * PRACTICE BANK — TCF Canada · expression écrite · tâche 1 · NCLC 6.
 *
 * Eight items. The task type is the exam's — *rédiger un message*, 60 to 120
 * words — and every subject is ours, as `tcf-canada.ts` says of its own.
 *
 * Each item carries three responses, and they are the item's own test:
 *
 *   nclc7    facts, and both halves of the instruction. Gate passes,
 *            diagnosis stays clear.
 *   nclc6    polite, correct, empty. Gate passes, diagnosis FIRES.
 *   offTopic a well-written message about something else. The gate must
 *            refuse it on `off_topic` — which is what proves the item's
 *            topic keywords discriminate rather than decorate.
 *
 * There is no `source_coverage` on tâche 1, so the negative control is a
 * different rule from tâche 3's, and it has to be: an item whose keywords
 * fire on any competent French message is not testing this subject.
 */
export type MessageItem = {
  id: string;
  /** The two things the instruction requires, in our words, for the report. */
  requires: [string, string];
  /**
   * Phrases that show the SECOND requirement has been answered.
   *
   * Found by running the cell: the detector originally looked for a global
   * list of "what I learned" phrases, and diagnosed four correct NCLC 7
   * answers as failures — because tâche 1's second requirement is not always
   * *what you learned*. Three of these eight items ask *what changes for the
   * reader* or *what the rules are* instead.
   *
   * The instruction's two halves are a property of the item, so the markers
   * are too. Same lesson as everywhere else today: it is data, not code.
   */
  secondRequirement: string[];
  prompt: { en: string; fr: string };
  topicKeywords: string[];
  responses: { nclc7: string; nclc6: string; offTopic: string };
};

export const ITEMS: MessageItem[] = [
  {
    id: 't1-n6-01-nouveau-bureau',
    secondRequirement: ['change', 'changent', 'désormais', 'ne plus', 'non plus', 'il faut', 'se réservent', 'se fait'],
    requires: ['describe the new premises', 'say what changes for the reader'],
    prompt: {
      en: 'Your team has moved to a new office. Write a message to your colleagues describing the new premises and explaining what changes for them.',
      fr: "Votre équipe a déménagé dans de nouveaux bureaux. Rédigez un message à vos collègues pour décrire les nouveaux locaux et expliquer ce qui change pour eux.",
    },
    topicKeywords: ['bureaux', 'déménagement', 'locaux', 'équipe', 'étage', 'nouvelle'],
    responses: {
      nclc7: `Bonjour à tous,

Nous sommes installés depuis lundi dans les nouveaux bureaux, au troisième étage
du 240 rue Sainte-Catherine. Il s'agit d'un plateau unique de quarante postes,
avec quatre petites salles fermées pour les appels et une cuisine au même étage.

Concrètement, trois choses changent pour vous. L'entrée se fait par la rue et non
plus par le stationnement. Les salles de réunion se réservent sur le calendrier
partagé, deux heures au maximum. Et le courrier arrive désormais à la réception
du rez-de-chaussée, où il faut passer le chercher avant seize heures.

À bientôt,
Amina`,
      nclc6: `Bonjour à tous,

Comme vous le savez, nous avons déménagé dans de nouveaux bureaux. C'est vraiment
très agréable et l'endroit est magnifique. Toute l'équipe semble contente et
l'ambiance est excellente.

Je pense que ce changement est très important pour nous tous et qu'il sera très
utile pour notre travail quotidien. Les nouveaux locaux sont beaucoup mieux que
les anciens et je suis sûre que vous les apprécierez beaucoup.

N'hésitez pas à venir voir si vous avez le temps. Cela vaut vraiment la peine et
je crois que vous serez agréablement surpris.

À bientôt,
Amina`,
      offTopic: `Bonjour à tous,

Je vous écris au sujet de la collecte de fonds pour l'hôpital de quartier. Nous
avons réuni deux mille quatre cents dollars en trois semaines, grâce aux
quarante-six personnes qui ont participé.

L'argent servira à acheter deux fauteuils roulants et à repeindre la salle
d'attente des familles. La remise du chèque aura lieu le douze mars à dix heures,
et vous êtes tous invités à venir.

Merci sincèrement à celles et ceux qui ont donné, et à Farid qui a organisé la
vente de gâteaux du vendredi.

Bien cordialement,
Amina`,
    },
  },

  {
    id: 't1-n6-02-logiciel',
    secondRequirement: ['ce que je retiens', 'j’ai appris', 'j\'ai appris', 'nous savons maintenant', 'il ne faut', 'j’ai compris', 'j\'ai compris'],
    requires: ['describe the new software', 'say what you learned in the session'],
    prompt: {
      en: 'A new piece of software has been installed at your workplace and you attended the training session. Write a message to your team describing the software and explaining what you learned.',
      fr: "Un nouveau logiciel vient d'être installé dans votre entreprise et vous avez suivi la séance de formation. Rédigez un message à votre équipe pour décrire ce logiciel et expliquer ce que vous avez appris.",
    },
    topicKeywords: ['logiciel', 'formation', 'séance', 'équipe', 'installer', 'utiliser'],
    responses: {
      nclc7: `Bonjour,

J'ai suivi mardi la séance de formation sur le nouveau logiciel de suivi des
dossiers. La séance a duré deux heures et nous étions neuf.

Il s'agit d'un outil en ligne qui remplace les trois fichiers partagés que nous
utilisions. Chaque dossier y reçoit un numéro, un responsable et une date
limite, et le logiciel envoie un rappel deux jours avant l'échéance.

Ce que je retiens surtout, c'est qu'il ne faut jamais créer un dossier sans lui
attribuer un responsable : sans nom, le rappel ne part pas. Nous savons
maintenant comment reprendre un dossier laissé par un collègue absent.

Bonne journée,
Thomas`,
      nclc6: `Bonjour,

J'ai assisté à la formation sur le nouveau logiciel. C'était vraiment très
intéressant et le formateur était excellent. J'ai beaucoup appris pendant cette
séance.

Le logiciel est très utile et il va sûrement nous faire gagner beaucoup de temps.
Je pense que c'est un excellent outil et que tout le monde sera content de
l'utiliser. C'est bien plus pratique qu'avant.

N'hésitez pas à me poser des questions si vous en avez. Je serai heureux de vous
aider et je suis certain que vous vous y habituerez très vite.

Bonne journée,
Thomas`,
      offTopic: `Bonjour,

Je vous écris pour vous parler du tournoi de soccer de fin de saison. Il aura
lieu le samedi dix-huit juin au parc Jarry, de neuf heures à seize heures.

Six équipes de sept joueurs sont inscrites et il reste deux places. Chaque équipe
joue au minimum trois matchs de vingt minutes. Apportez de l'eau et des chaussures
de rechange, car le terrain reste humide le matin.

Écrivez-moi avant le premier juin si vous voulez jouer, en précisant votre poste
préféré.

Bonne journée,
Thomas`,
    },
  },

  {
    id: 't1-n6-03-local-velos',
    secondRequirement: ['règle', 'règles', 'a droit', 'ferme à', 'seront', 'il faut', 'interdit', 'chaque logement'],
    requires: ['describe the bike room', 'say what the rules are'],
    prompt: {
      en: 'A bike room has opened in your building. Write a message to the other residents describing it and explaining the rules.',
      fr: "Un local à vélos vient d'ouvrir dans votre immeuble. Rédigez un message aux autres résidents pour le décrire et expliquer les règles d'utilisation.",
    },
    topicKeywords: ['vélos', 'local', 'immeuble', 'résidents', 'règles', 'sous-sol'],
    responses: {
      nclc7: `Bonjour à toutes et à tous,

Le local à vélos est ouvert depuis samedi, au sous-sol, à droite en sortant de
l'ascenseur. Il compte vingt-quatre supports et une prise pour gonfler les pneus.

Trois règles, décidées à la réunion du huit avril. Chaque logement a droit à deux
places, marquées à votre numéro d'appartement. Le local ferme à minuit et la clé
est la même que celle de la buanderie. Les vélos laissés plus de trois mois sans
être utilisés seront déplacés dans le fond, pour libérer les supports.

Écrivez-moi si votre numéro manque sur un support.

Bonne journée,
Sofia`,
      nclc6: `Bonjour à toutes et à tous,

Je vous informe que le nouveau local à vélos est maintenant ouvert. C'est vraiment
une excellente nouvelle pour tout l'immeuble et je trouve cela très utile.

L'endroit est bien et je pense que tout le monde sera content. C'est beaucoup plus
pratique qu'avant et cela va sûrement plaire à de nombreux résidents. L'ambiance
dans l'immeuble est déjà plus agréable depuis cette décision.

Merci de respecter les règles et de faire attention. Je suis certaine que tout se
passera très bien si chacun fait un petit effort.

Bonne journée,
Sofia`,
      offTopic: `Bonjour à toutes et à tous,

Je vous écris au sujet du chauffage. La chaudière sera arrêtée le mardi neuf
janvier, de huit heures à quinze heures, pour l'entretien annuel obligatoire.

Il n'y aura ni chauffage ni eau chaude pendant ces sept heures. Le technicien
passera dans les appartements des étages trois et quatre pour purger les
radiateurs; merci d'être présent ou de laisser vos clés chez un voisin.

Prévoyez une couverture supplémentaire pour la journée, surtout dans les
logements donnant sur la cour.

Bonne journée,
Sofia`,
    },
  },

  {
    id: 't1-n6-04-cours-du-soir',
    secondRequirement: ['ce que je retiens', 'j’ai appris', 'j\'ai appris', 'nous avons vu', 'je sais maintenant', 'je sais désormais'],
    requires: ['describe the evening course', 'say what you have learned so far'],
    prompt: {
      en: 'You have started an evening course. Write a message to a friend describing the course and explaining what you have learned so far.',
      fr: "Vous avez commencé un cours du soir. Rédigez un message à un ami pour décrire ce cours et expliquer ce que vous avez appris jusqu'ici.",
    },
    topicKeywords: ['cours', 'soir', 'ami', 'semaine', 'appris', 'inscrit'],
    responses: {
      nclc7: `Salut Karim,

J'ai commencé le cours du soir de comptabilité, deux mardis sur trois, de dix-huit
à vingt et une heures, au centre communautaire de la rue Bélanger. Nous sommes
quatorze, presque tous arrivés au pays depuis moins de deux ans.

Jusqu'ici nous avons vu comment lire un relevé bancaire, comment classer une
dépense professionnelle et comment remplir le formulaire T2125.

Ce que je retiens surtout, c'est qu'il faut garder les reçus six ans, pas deux
comme je le croyais. Je sais maintenant faire moi-même la déclaration de mon
petit commerce.

Passe un soir si tu veux voir.

Yara`,
      nclc6: `Salut Karim,

Je me suis inscrite à un cours du soir et je voulais te raconter. C'est vraiment
très intéressant et l'enseignante est formidable. J'apprends beaucoup de choses.

Le cours est très utile et je pense qu'il va beaucoup m'aider pour mon travail.
Les autres participants sont sympathiques et l'ambiance est agréable. Je suis
vraiment contente de m'être inscrite.

Je te conseille d'essayer toi aussi si tu as le temps. Je suis sûre que cela te
plairait beaucoup et que tu trouverais cela aussi enrichissant que moi.

À très bientôt,
Yara`,
      offTopic: `Salut Karim,

Je t'écris pour te parler de l'appartement que j'ai visité samedi. Trois pièces
au deuxième étage, rue Beaubien, huit cent quatre-vingts dollars par mois, chauffage
compris.

Il y a un balcon donnant sur la ruelle et une buanderie au sous-sol. Le
propriétaire demande deux références et un premier mois d'avance. La station de
métro est à sept minutes à pied.

Je dois répondre avant vendredi. Dis-moi ce que tu en penses, tu connais mieux ce
quartier que moi.

À très bientôt,
Yara`,
    },
  },
  {
    id: 't1-n6-05-remplacement',
    secondRequirement: ['ce que j’ai appris', 'ce que j\'ai appris', 'j’ai appris', 'j\'ai appris', 'il ne faut', 'ce que je retiens'],
    requires: ['describe the procedure', 'say what you learned doing it'],
    prompt: {
      en: 'A colleague will cover your post next week. Write a message describing a procedure they will have to follow and explaining what you learned when you first did it.',
      fr: "Un collègue va vous remplacer la semaine prochaine. Rédigez un message pour décrire une procédure qu'il devra suivre et expliquer ce que vous avez appris en la faisant pour la première fois.",
    },
    topicKeywords: ['remplacement', 'collègue', 'procédure', 'semaine', 'poste', 'dossiers'],
    responses: {
      nclc7: `Bonjour Lucie,

Tu me remplaces la semaine du quatorze. Voici la seule procédure un peu délicate :
l'ouverture des dossiers du matin.

Il s'agit de relever la boîte partagée avant huit heures trente, d'attribuer un
numéro à chaque demande et de la transmettre au service concerné avant midi. Il y
en a entre douze et vingt par jour, davantage le lundi.

Ce que j'ai appris la première semaine, c'est qu'il ne faut jamais transmettre
une demande sans le numéro de téléphone du demandeur : le service la renvoie et
on perd une journée. Le formulaire refuse un champ vide, mais pas un champ faux.

Bonne semaine,
Rachid`,
      nclc6: `Bonjour Lucie,

Comme tu me remplaces la semaine prochaine, je voulais t'écrire un petit mot. Le
poste est vraiment intéressant et je pense que cela se passera très bien.

La procédure du matin est importante mais elle n'est pas difficile. Tu verras,
c'est assez simple et tu t'y habitueras rapidement. J'ai beaucoup appris en la
faisant et je trouve que c'est une bonne expérience.

N'hésite pas à m'écrire si tu as besoin. Je suis certain que tu feras cela très
bien et que tout se passera parfaitement pendant mon absence.

Bonne semaine,
Rachid`,
      offTopic: `Bonjour Lucie,

Je t'écris au sujet du cadeau de départ de Madame Nguyen. Nous avons réuni cent
soixante dollars auprès de onze personnes.

L'idée retenue est un appareil photo instantané et un album, achetés à la
boutique de la rue Masson. Il reste vingt dollars, que nous mettrons dans une
carte signée par tout le service.

La remise se fera jeudi à quinze heures dans la salle du fond, avec un gâteau
commandé chez Amir. Merci de ne pas en parler devant elle avant.

Bonne semaine,
Rachid`,
    },
  },

  {
    id: 't1-n6-06-benevolat',
    secondRequirement: ['ce que j’ai appris', 'ce que j\'ai appris', 'j’ai appris', 'j\'ai appris', 'ce que je retiens'],
    requires: ['describe the event', 'say what you learned there'],
    prompt: {
      en: 'You volunteered at a community event. Write a message to the group describing the event and explaining what you learned there.',
      fr: "Vous avez été bénévole lors d'un événement communautaire. Rédigez un message au groupe pour décrire cet événement et expliquer ce que vous y avez appris.",
    },
    topicKeywords: ['bénévole', 'événement', 'groupe', 'quartier', 'organisé', 'participants'],
    responses: {
      nclc7: `Bonjour à tous,

J'ai été bénévole samedi à la distribution alimentaire du quartier Saint-Michel.
Nous étions dix-huit bénévoles pour deux cent quarante familles, de neuf heures à
quatorze heures.

Mon poste était l'accueil : vérifier l'inscription, remettre un numéro, expliquer
le parcours dans les trois langues affichées.

Ce que j'ai appris, c'est que la file avance deux fois plus vite quand une
personne circule dans la queue pour remplir les fiches à l'avance. Nous l'avons
fait à partir de onze heures et l'attente est passée de quarante minutes à un
quart d'heure.

Merci à tous,
Nadia`,
      nclc6: `Bonjour à tous,

Je voulais vous parler de la journée de bénévolat de samedi. C'était vraiment une
très belle expérience et l'ambiance était formidable.

Tout le monde était très motivé et j'ai trouvé cela extrêmement enrichissant.
J'ai beaucoup appris et je pense que c'est important de participer à ce genre
d'événement. Les organisateurs ont fait un excellent travail.

Je vous encourage vivement à venir la prochaine fois. Je suis sûre que cela vous
plairait autant qu'à moi et que vous ne le regretteriez pas du tout.

Merci à tous,
Nadia`,
      offTopic: `Bonjour à tous,

Je vous écris à propos des horaires de la bibliothèque de quartier. À partir du
premier octobre, elle ouvrira le dimanche de treize à dix-sept heures.

En contrepartie, la fermeture du mardi passe de vingt heures à dix-huit heures
trente. Le personnel reste le même : quatre personnes, aucune embauche prévue
pour l'instant.

Une consultation est ouverte jusqu'au vingt septembre sur le site de
l'arrondissement, et les commentaires écrits sont acceptés à l'accueil.

Merci à tous,
Nadia`,
    },
  },

  {
    id: 't1-n6-07-examen-conduite',
    secondRequirement: ['ce que j’en ai appris', 'ce que j\'en ai appris', 'j’ai appris', 'j\'ai appris', 'il faut', 'ce que je retiens'],
    requires: ['describe the driving test', 'say what you learned from it'],
    prompt: {
      en: 'A friend is about to take their driving test. Write a message describing how the test went for you and explaining what you learned from it.',
      fr: "Un ami va bientôt passer son examen de conduite. Rédigez un message pour décrire comment votre examen s'est déroulé et expliquer ce que vous en avez appris.",
    },
    topicKeywords: ['conduite', 'examen', 'permis', 'ami', 'route', 'examinateur'],
    responses: {
      nclc7: `Salut Diego,

Mon examen de conduite a duré trente-cinq minutes, dont cinq de vérifications à
l'arrêt. L'examinateur m'a fait sortir du centre par le boulevard, puis emprunter
deux ronds-points, une bretelle d'autoroute et une rue résidentielle à trente.

Il note surtout trois choses : les angles morts, la distance de sécurité et le
respect des arrêts obligatoires.

Ce que j'en ai appris, c'est qu'il faut tourner la tête de façon visible, pas
seulement regarder le rétroviseur. J'ai perdu deux points la première fois pour
cela, alors que je vérifiais bel et bien.

Bonne chance,
Inès`,
      nclc6: `Salut Diego,

Je sais que tu passes bientôt ton examen de conduite, alors je voulais t'écrire.
Le mien s'est très bien passé et l'examinateur était vraiment sympathique.

C'était une bonne expérience et j'ai beaucoup appris. Ce n'est pas si difficile
que ça et je pense que tu réussiras sans problème. Il ne faut surtout pas trop
stresser, c'est le plus important.

Bonne chance pour ton examen. Je suis certaine que tout se passera très bien
pour toi et que tu auras ton permis du premier coup.

À bientôt,
Inès`,
      offTopic: `Salut Diego,

Je t'écris pour te parler du chien que ma sœur veut adopter. C'est un croisé
berger de quatre ans, arrivé au refuge de Longueuil en février.

Les frais d'adoption sont de deux cent vingt dollars, vaccination et stérilisation
comprises. Le refuge demande une visite du logement et l'accord écrit du
propriétaire quand on est locataire.

Elle hésite parce que le chien ne supporte pas d'être seul plus de six heures.
Toi qui en as eu un, tu en penses quoi ?

À bientôt,
Inès`,
    },
  },

  {
    id: 't1-n6-08-jardin-communautaire',
    secondRequirement: ['règle', 'règles', 'une parcelle par', 'obligatoire', 'obligatoires', 'aucun', 'il faut', 'inscription'],
    requires: ['describe the garden', 'say what the rules are'],
    prompt: {
      en: 'A community garden has opened near your home. Write a message to your neighbours describing it and explaining the rules.',
      fr: "Un jardin communautaire vient d'ouvrir près de chez vous. Rédigez un message à vos voisins pour le décrire et expliquer les règles.",
    },
    topicKeywords: ['jardin', 'communautaire', 'voisins', 'parcelle', 'règles', 'saison'],
    responses: {
      nclc7: `Bonjour à toutes et à tous,

Le jardin communautaire a ouvert derrière l'école, sur le terrain vacant de la
rue Dandurand. Il compte trente-deux parcelles de quatre mètres sur deux, un
cabanon d'outils et deux robinets.

Les règles tiennent en trois points. Une parcelle par foyer, attribuée par
tirage le premier avril. Deux corvées collectives obligatoires dans la saison,
de trois heures chacune. Et aucun produit chimique, la ville teste le sol chaque
automne.

L'inscription se fait à la maison de quartier jusqu'au vingt mars, avec une
preuve de résidence.

Bonne saison,
Étienne`,
      nclc6: `Bonjour à toutes et à tous,

Je voulais vous annoncer que le jardin communautaire est enfin ouvert. C'est une
excellente nouvelle et je trouve cela vraiment formidable pour notre quartier.

L'endroit est magnifique et je pense que cela va beaucoup plaire à tout le monde.
C'est très utile et très agréable, surtout pour les familles avec des enfants.
L'ambiance y est déjà très sympathique.

N'hésitez pas à vous inscrire, cela vaut vraiment la peine. Je suis sûr que vous
apprécierez beaucoup et que vous ne le regretterez pas.

Bonne saison,
Étienne`,
      offTopic: `Bonjour à toutes et à tous,

Je vous écris au sujet de la collecte des encombrants. Elle a lieu le troisième
jeudi de chaque mois, et non plus toutes les deux semaines depuis janvier.

Les objets doivent être sortis la veille après dix-huit heures, sur le trottoir
et non dans la ruelle. Les matelas doivent être emballés dans un sac plastique
fermé, sans quoi ils ne sont pas ramassés.

Les appareils électroniques ne sont plus acceptés du tout : il faut les porter à
l'écocentre de la rue Papineau.

Bonne journée,
Étienne`,
    },
  },
];
