/**
 * PRACTICE BANK — TCF Canada · expression écrite · tâche 2 · NCLC 6.
 *
 * Eight items. The task type is the exam's — *raconter ou rédiger un court
 * article*, 120 to 150 words, for a blog or a publication — and every
 * subject is ours.
 *
 *   nclc7    events in order AND a turn: a moment named, a before set
 *            against a now. Gate passes, diagnosis stays clear.
 *   nclc6    events in order and nothing else. Gate passes, diagnosis FIRES.
 *   offTopic a well-written account of something else. `off_topic` refuses it.
 */
export type NarrativeItem = {
  id: string;
  /** The turn the subject makes available, in our words, for the report. */
  turn: string;
  prompt: { en: string; fr: string };
  topicKeywords: string[];
  responses: { nclc7: string; nclc6: string; offTopic: string };
};

export const ITEMS: NarrativeItem[] = [
  {
    id: 't2-n6-01-premier-hiver',
    turn: 'the moment the cold stopped being an enemy',
    prompt: {
      en: 'A magazine for newcomers is collecting accounts of a first winter. Write yours: what happened, in what order, and what it changed for you.',
      fr: "Un magazine destiné aux personnes nouvellement arrivées réunit des récits d'un premier hiver. Rédigez le vôtre : ce qui s'est passé, dans quel ordre, et ce que cela a changé pour vous.",
    },
    topicKeywords: ['hiver', 'froid', 'neige', 'janvier', 'arrivé', 'manteau'],
    responses: {
      nclc7: `Mon premier hiver a commencé un mardi de novembre, avec quatre centimètres de
neige et des chaussures de ville.

D'abord j'ai acheté un manteau trop léger, parce qu'il coûtait quarante dollars.
Ensuite j'ai passé trois semaines à courir entre les portes chauffées, du métro
au bureau, du bureau au métro. Je comptais les jours jusqu'en mars.

C'est alors qu'un collègue m'a prêté des bottes et m'a fait marcher vingt minutes
au bord du canal, un samedi à moins quinze. Il ne m'a rien expliqué ; il marchait,
c'est tout.

Avant, je subissais l'hiver entre deux portes. Depuis ce jour, je sors le samedi
matin, même quand il fait froid. Ce que j'ignorais alors, c'est qu'on ne s'habitue
pas au froid : on s'habille, et on sort.`,
      nclc6: `Mon premier hiver a commencé au mois de novembre. D'abord il a neigé un peu, puis
il a fait de plus en plus froid.

J'ai acheté un manteau et des gants au magasin près de chez moi. Ensuite j'ai
appris à marcher sur la glace sans tomber, ce qui n'était pas facile au début.

Au mois de janvier, il a fait moins vingt degrés pendant plusieurs jours. Je
prenais le métro tous les matins pour aller au travail et je rentrais le soir. Les
rues étaient blanches et les gens marchaient lentement.

Enfin, au mois de mars, la neige a commencé à fondre et le printemps est arrivé.
C'était un hiver long et très froid, mais je l'ai passé.`,
      offTopic: `L'année dernière, j'ai décidé de retourner aux études. D'abord j'ai comparé quatre
programmes, puis j'ai choisi celui du cégep, deux soirs par semaine.

Le premier trimestre a été difficile. Je travaillais de huit à seize heures, puis
je partais directement en classe sans souper. J'ai échoué mon premier examen de
statistiques, de deux points.

C'est alors que la professeure m'a proposé de refaire l'examen en français
simplifié, ce que le règlement permettait et que j'ignorais. Depuis, je lis les
règlements avant de me décourager. Avant, je pensais qu'un échec était une
réponse. Maintenant je sais que c'est souvent une question mal posée.`,
    },
  },

  {
    id: 't2-n6-02-entretien',
    turn: 'the question that revealed the job was not the one advertised',
    prompt: {
      en: 'A publication is collecting accounts of a job interview that stayed with its readers. Write yours: what happened, in what order, and what it changed for you.',
      fr: "Une publication réunit des récits d'un entretien d'embauche qui a marqué ses lecteurs. Rédigez le vôtre : ce qui s'est passé, dans quel ordre, et ce que cela a changé pour vous.",
    },
    topicKeywords: ['entretien', 'embauche', 'poste', 'candidature', 'employeur', 'expérience'],
    responses: {
      nclc7: `L'entretien était fixé à neuf heures, pour un poste de technicien que j'avais
préparé pendant deux semaines.

D'abord la responsable m'a fait visiter l'atelier. Ensuite nous nous sommes assis
et elle a posé les questions habituelles, sur mon expérience et sur mes diplômes.
Je répondais bien ; je m'entendais répondre bien.

C'est alors qu'elle m'a demandé combien de personnes je serais prêt à former la
première année. Le poste que j'avais préparé n'existait pas : celui-là était un
poste de formateur, et je ne l'avais compris qu'à la vingt-cinquième minute.

Avant, je préparais mes réponses. Depuis cet entretien, je prépare mes questions,
et je les pose au début. Je n'attends plus qu'on me dise pour quel travail je suis
assis dans la pièce.`,
      nclc6: `J'ai eu un entretien d'embauche pour un poste de technicien le mois dernier.
D'abord j'ai préparé mon curriculum vitae et j'ai révisé mes réponses.

Le jour de l'entretien, je suis arrivé vingt minutes en avance et j'ai attendu à
la réception. Ensuite la responsable est venue me chercher et nous sommes allés
dans son bureau.

Elle m'a posé beaucoup de questions sur mon expérience, sur mes diplômes et sur
mes anciens employeurs. J'ai répondu du mieux que je pouvais et l'entretien a duré
environ quarante minutes.

Enfin, elle m'a dit qu'elle me rappellerait dans la semaine. Je suis rentré chez
moi et j'ai attendu. C'était une expérience importante pour moi.`,
      offTopic: `Le déménagement était prévu pour le premier juillet, comme presque tous les
déménagements ici.

D'abord nous avons rempli soixante boîtes en dix jours. Ensuite le camion loué est
arrivé avec deux heures de retard, et l'ascenseur de l'ancien immeuble est tombé en
panne au troisième voyage.

C'est alors que trois voisins que nous connaissions à peine sont descendus, sans
qu'on leur demande, et ont porté les meubles par l'escalier pendant quatre heures.

Avant, je pensais qu'on emménageait dans un logement. Depuis ce premier juillet,
je sais qu'on emménage dans un immeuble, et que ce n'est pas la même chose.`,
    },
  },

  {
    id: 't2-n6-03-guichet',
    turn: 'the document refused, and what it revealed about asking',
    prompt: {
      en: 'A blog is collecting accounts of a day spent at an office counter. Write yours: what happened, in what order, and what it changed for you.',
      fr: "Un blogue réunit des récits d'une journée passée à un guichet administratif. Rédigez le vôtre : ce qui s'est passé, dans quel ordre, et ce que cela a changé pour vous.",
    },
    topicKeywords: ['guichet', 'document', 'dossier', 'attente', 'formulaire', 'bureau'],
    responses: {
      nclc7: `J'étais au guichet à huit heures dix, avec un dossier que j'avais vérifié trois
fois.

D'abord j'ai pris un numéro, le quarante-deux. Ensuite j'ai attendu une heure
quarante en regardant l'écran avancer de six numéros. Puis l'agente a ouvert mon
dossier, l'a refermé, et m'a dit qu'il manquait une traduction certifiée.

C'est alors que la femme derrière moi s'est penchée et m'a donné le nom d'une
traductrice, écrit sur son propre ticket. Elle était passée par là six mois plus
tôt.

Avant, je faisais la queue en silence, persuadé que demander était une faiblesse.
Depuis ce matin-là, je parle aux gens qui attendent avec moi. Ce que j'ignorais,
c'est que la file est le seul endroit où tout le monde connaît la réponse.`,
      nclc6: `Le mois dernier, je suis allé au guichet pour déposer mon dossier. D'abord j'ai
préparé tous les documents nécessaires la veille au soir.

Le matin, je suis parti tôt de chez moi et je suis arrivé au bureau avant
l'ouverture. J'ai pris un numéro et je me suis assis dans la salle d'attente avec
beaucoup d'autres personnes.

Ensuite j'ai attendu presque deux heures. Il y avait des affiches sur les murs et
un écran qui montrait les numéros. Puis on a appelé le mien et je suis allé au
comptoir.

Enfin, l'agente a regardé mes papiers et m'a dit qu'il manquait un document. Je
suis rentré chez moi et je suis revenu la semaine suivante.`,
      offTopic: `Ma fille a commencé la maternelle en septembre, dans l'école au bout de notre rue.

D'abord elle a pleuré tous les matins pendant deux semaines, et moi aussi, une
fois le coin de la rue passé. Ensuite elle a rapporté un dessin où nous étions
quatre, alors que nous sommes trois.

C'est alors que l'enseignante m'a expliqué que le quatrième était son amie Léa, et
que ma fille l'avait dessinée dans la famille.

Avant, je croyais que l'intégration se mesurait en mots de français. Depuis ce
dessin, je la mesure autrement.`,
    },
  },

  {
    id: 't2-n6-04-voisine',
    turn: 'the help that arrived without being asked for',
    prompt: {
      en: 'A magazine is collecting accounts of a neighbour who made a difference. Write yours: what happened, in what order, and what it changed for you.',
      fr: "Un magazine réunit des récits d'un voisin ou d'une voisine qui a fait une différence. Rédigez le vôtre : ce qui s'est passé, dans quel ordre, et ce que cela a changé pour vous.",
    },
    topicKeywords: ['voisine', 'voisin', 'immeuble', 'porte', 'aidé', 'quartier'],
    responses: {
      nclc7: `Notre voisine du dessous s'appelle Jeanne et elle a soixante-dix-neuf ans.

D'abord nous nous sommes croisés pendant huit mois sans rien nous dire de plus
qu'un bonjour dans l'escalier. Ensuite il y a eu la panne de courant de janvier,
quarante et une heures sans électricité et sans chauffage.

C'est alors qu'elle a frappé à notre porte avec deux couvertures et une lampe de
poche, et qu'elle est restée trois heures à jouer aux cartes avec mon fils pendant
que je cherchais des piles.

Avant, je pensais qu'il fallait connaître ses voisins pour pouvoir compter sur
eux. Depuis cette nuit-là, je ne le pense plus. Je frappe aux portes du troisième
quand il y a une tempête annoncée, sans attendre de savoir qui habite derrière.`,
      nclc6: `Nous habitons dans notre immeuble depuis deux ans. Notre voisine du dessous
s'appelle Jeanne et elle est très gentille.

D'abord nous nous disions seulement bonjour dans l'escalier. Ensuite nous avons
commencé à parler un peu plus longtemps, de la météo et du quartier.

Au mois de janvier, il y a eu une grande panne de courant dans tout le quartier.
Nous sommes restés sans électricité pendant presque deux jours. Jeanne est venue
nous voir et nous avons discuté ensemble.

Enfin, le courant est revenu le lendemain après-midi et tout est redevenu normal
dans l'immeuble. C'est une voisine très agréable et nous sommes contents de la
connaître depuis notre arrivée. L'ambiance ici est sympathique et les gens se
disent bonjour dans l'escalier.`,
      offTopic: `J'ai vendu ma voiture en avril, après onze ans.

D'abord j'ai calculé ce qu'elle me coûtait vraiment : assurance, essence,
stationnement, réparations, quatre mille deux cents dollars par année pour six
mille kilomètres.

Ensuite j'ai essayé de vivre un mois sans elle, pour voir. Le seul vrai problème
était l'épicerie du samedi.

C'est alors que j'ai découvert le service d'autopartage à trois rues, à neuf
dollars l'heure. Depuis, je n'ai plus de voiture et je loue quatre heures par mois.
Avant, je croyais avoir besoin d'une voiture. J'avais besoin de quatre heures.`,
    },
  },
  {
    id: 't2-n6-05-premiere-phrase',
    turn: 'the first sentence spoken in French without preparing it',
    prompt: {
      en: 'A publication is collecting accounts of the first time its readers spoke French without preparing the sentence first. Write yours: what happened, in what order, and what it changed for you.',
      fr: "Une publication réunit des récits de la première fois où ses lecteurs ont parlé français sans avoir préparé leur phrase. Rédigez le vôtre : ce qui s'est passé, dans quel ordre, et ce que cela a changé pour vous.",
    },
    topicKeywords: ['français', 'parlé', 'phrase', 'marché', 'répondu', 'langue'],
    responses: {
      nclc7: `Pendant onze mois, j'ai préparé chaque phrase avant de la dire.

D'abord je répétais dans l'ascenseur ce que j'allais demander à la pharmacie.
Ensuite, si la personne répondait autre chose que prévu, je disais merci et je
partais. Je choisissais les caisses libre-service.

C'est alors qu'au marché Jean-Talon, un samedi de septembre, une marchande m'a
tendu une pomme et m'a demandé si je la trouvais trop mûre. J'ai répondu « non,
elle est parfaite pour aujourd'hui » avant d'avoir eu le temps de traduire quoi
que ce soit.

Avant, je parlais français. Depuis ce samedi, il m'arrive de penser en français,
et ce n'est pas la même chose. Je ne prépare plus mes phrases dans l'ascenseur.`,
      nclc6: `J'apprends le français depuis mon arrivée, il y a environ un an. D'abord j'ai suivi
des cours trois fois par semaine dans un centre du quartier.

Ensuite j'ai commencé à parler un peu dans les magasins et dans les transports. Au
début c'était difficile et je ne comprenais pas tout ce que les gens disaient.

Un samedi, je suis allé au marché avec ma famille. J'ai acheté des fruits et des
légumes et j'ai parlé avec les marchands. Ils étaient patients et gentils avec moi.

Enfin, je suis rentré à la maison content de ma journée. Le français est une belle
langue et je continue à l'étudier tous les jours. C'est important pour mon avenir.`,
      offTopic: `J'ai commencé à faire du bénévolat à la bibliothèque en octobre, deux heures le
mercredi.

D'abord je rangeais les livres, sans parler à personne. Ensuite on m'a demandé de
tenir l'heure du conte du mercredi après-midi, parce que la personne habituelle
était malade.

C'est alors qu'un garçon de cinq ans m'a demandé pourquoi je disais certains mots
« pas comme sa maman ». Je lui ai expliqué. Il a trouvé cela normal et il est
revenu la semaine suivante.

Depuis, je tiens l'heure du conte tous les mercredis. Avant, je croyais qu'il
fallait parler sans accent pour lire aux enfants.`,
    },
  },

  {
    id: 't2-n6-06-nuit-hopital',
    turn: 'the night that changed how the narrator asks for help',
    prompt: {
      en: 'A magazine is collecting accounts of a night that its readers remember. Write yours: what happened, in what order, and what it changed for you.',
      fr: "Un magazine réunit des récits d'une nuit dont ses lecteurs se souviennent. Rédigez le vôtre : ce qui s'est passé, dans quel ordre, et ce que cela a changé pour vous.",
    },
    topicKeywords: ['nuit', 'urgences', 'fièvre', 'hôpital', 'attendu', 'infirmière'],
    responses: {
      nclc7: `Mon fils avait trois ans et quarante de fièvre un mardi à vingt-trois heures.

D'abord j'ai cherché sur internet pendant quarante minutes, en arabe, parce que
c'était plus rapide. Ensuite nous sommes partis aux urgences et j'ai rempli le
formulaire d'admission en tremblant, en cochant des cases dont je devinais le sens.

C'est alors qu'une infirmière s'est assise à côté de moi, a repris le formulaire
ligne par ligne, et m'a dit qu'un interprète était disponible par téléphone à
toute heure et gratuitement. Personne ne me l'avait jamais dit.

Avant, je demandais de l'aide seulement quand je n'avais plus le choix. Depuis
cette nuit-là, je demande d'abord. Ce que j'ignorais, c'est que le service existait
depuis des années.`,
      nclc6: `Un soir du mois de février, mon fils est tombé malade. D'abord il avait un peu de
fièvre et il ne voulait pas manger.

Ensuite la fièvre a augmenté pendant la nuit et il pleurait beaucoup. Nous avons
décidé d'aller aux urgences de l'hôpital le plus proche de chez nous.

Nous sommes arrivés vers minuit et il y avait beaucoup de monde dans la salle
d'attente. Nous avons attendu presque quatre heures avant de voir un médecin. Mon
fils dormait dans mes bras.

Enfin, le médecin l'a examiné pendant une dizaine de minutes et nous a donné un
médicament à prendre trois fois par jour. Nous sommes rentrés à la maison au petit
matin, en autobus. Ce fut une nuit très longue et très fatigante pour toute la
famille.`,
      offTopic: `J'ai passé mon examen de citoyenneté en mars, après quatre mois de révision.

D'abord j'ai lu le guide trois fois et j'ai retenu les dates. Ensuite j'ai fait
les tests en ligne, une quarantaine, jusqu'à ne plus faire d'erreur.

Le jour venu, l'examen a duré vingt minutes et comportait vingt questions. J'en
étais sûr de dix-neuf.

C'est alors qu'en sortant j'ai croisé un homme qui le passait pour la troisième
fois, et qui m'a dit qu'il ne savait pas lire. Depuis, quand quelqu'un me demande
si l'examen est difficile, je demande d'abord dans quelle langue il lit.`,
    },
  },

  {
    id: 't2-n6-07-diplome',
    turn: 'the day the qualification stopped being the plan',
    prompt: {
      en: 'A blog is collecting accounts of what happened to its readers’ qualifications. Write yours: what happened, in what order, and what it changed for you.',
      fr: "Un blogue réunit des récits de ce qu'il est advenu des diplômes de ses lecteurs. Rédigez le vôtre : ce qui s'est passé, dans quel ordre, et ce que cela a changé pour vous.",
    },
    topicKeywords: ['diplôme', 'équivalence', 'reconnu', 'métier', 'ordre', 'études'],
    responses: {
      nclc7: `J'étais ingénieure civile pendant neuf ans avant d'arriver ici avec un diplôme et
deux lettres de recommandation.

D'abord j'ai déposé une demande d'équivalence, qui a coûté huit cent cinquante
dollars et pris quatorze mois. Ensuite on m'a répondu qu'il me manquait trois cours
et un stage de six mois, non rémunéré.

C'est alors que j'ai calculé : trois ans, vingt mille dollars, et un enfant qui
entrait à l'école. Le même jour, une entreprise de structures m'a proposé un poste
de technicienne, à commencer en janvier.

Avant, je défendais mon diplôme. Depuis ce calcul, je ne le défends plus : je le
finirai à quarante-cinq ans ou jamais, et cela regarde moi seule. Je ne demande
plus la permission de travailler.`,
      nclc6: `J'ai fait des études d'ingénierie dans mon pays et j'ai travaillé neuf ans dans ce
domaine. D'abord j'étais très confiante en arrivant ici.

Ensuite j'ai déposé une demande de reconnaissance de mon diplôme auprès de l'ordre
professionnel. J'ai rempli beaucoup de formulaires et j'ai payé des frais assez
élevés.

L'attente a été très longue, plus d'une année. Pendant ce temps, j'ai travaillé
dans un autre domaine pour subvenir aux besoins de ma famille. Ce n'était pas
facile tous les jours.

Enfin, j'ai reçu la réponse : il me manque des cours et un stage. Je réfléchis
maintenant à ce que je vais faire. C'est une situation compliquée.`,
      offTopic: `Nous avons acheté notre première maison en août, à Longueuil.

D'abord nous avons visité vingt-deux logements en cinq mois, presque tous les
samedis. Ensuite nous avons fait trois offres, toutes refusées, dont une à quinze
mille dollars au-dessus du prix demandé.

C'est alors que le courtier nous a conseillé de chercher deux stations de métro
plus loin, là où personne ne cherchait cette année-là. La quatrième offre a été
acceptée en deux jours.

Avant, je croyais qu'acheter était une question d'argent. Depuis, je sais que
c'est surtout une question d'endroit où l'on accepte de regarder.`,
    },
  },

  {
    id: 't2-n6-08-autobus-manque',
    turn: 'the missed bus that redirected a year',
    prompt: {
      en: 'A publication is collecting accounts of a small accident that had large consequences. Write yours: what happened, in what order, and what it changed for you.',
      fr: "Une publication réunit des récits d'un petit contretemps aux grandes conséquences. Rédigez le vôtre : ce qui s'est passé, dans quel ordre, et ce que cela a changé pour vous.",
    },
    topicKeywords: ['autobus', 'manqué', 'retard', 'arrêt', 'attendre', 'matin'],
    responses: {
      nclc7: `J'ai manqué l'autobus de six heures quarante d'une trentaine de secondes, un
jeudi de mai.

D'abord j'ai attendu le suivant, vingt minutes plus tard, en pestant. Ensuite je
suis arrivé en retard à mon entrevue de renouvellement de contrat, et la
gestionnaire n'avait plus que dix minutes à me donner au lieu de trente.

C'est alors que, faute de temps, j'ai dit en une phrase ce que j'avais prévu de
dire en dix : que je voulais quitter l'entrepôt pour la formation des nouveaux.
Elle m'a regardé et m'a répondu qu'elle cherchait quelqu'un depuis février.

Avant, je préparais de longues explications que je n'osais pas donner. Depuis ce
jeudi-là, je commence par la phrase que j'aurais dite s'il ne me restait que dix
minutes.`,
      nclc6: `Un jeudi matin du mois de mai, je me suis réveillé un peu plus tard que d'habitude.
D'abord je me suis dépêché de préparer mes affaires.

Ensuite je suis sorti de chez moi en courant pour attraper mon autobus, mais je
suis arrivé trop tard à l'arrêt. Je l'ai vu partir devant moi.

J'ai donc attendu l'autobus suivant pendant une vingtaine de minutes. Il faisait
frais et je regardais ma montre toutes les deux minutes. Je suis arrivé au travail
avec vingt-cinq minutes de retard.

Enfin, j'ai expliqué la situation à ma gestionnaire et la journée s'est déroulée
normalement, comme les autres jours de la semaine. Je suis rentré chez moi le soir
par le même autobus, à la même heure, et j'ai préparé mes affaires pour le
lendemain.`,
      offTopic: `J'ai appris à nager à trente-quatre ans, à la piscine municipale.

D'abord je me suis inscrit au cours pour adultes débutants, huit personnes le
lundi soir. Ensuite j'ai passé trois séances à tenir le bord sans lâcher.

C'est alors que le moniteur m'a demandé de simplement m'allonger sur le dos et de
ne rien faire. J'ai flotté. Personne ne m'avait dit que c'était possible sans
effort.

Depuis, je nage un kilomètre le samedi. Avant, j'évitais les sorties au lac et je
disais que je n'aimais pas l'eau. Ce n'était pas vrai.`,
    },
  },
];
