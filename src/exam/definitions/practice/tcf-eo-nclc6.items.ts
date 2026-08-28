/**
 * PRACTICE BANK — TCF Canada · expression orale · tâches 1, 2 and 3 · NCLC 6.
 *
 * **Four items per tâche, which is exactly Part 6's floor and not a
 * comfortable margin.** Said plainly rather than quietly chosen: a spoken
 * tâche runs to four and a half minutes, so one item carries three long
 * transcripts, and twelve written carefully are worth more than
 * twenty-four written thin. The shortfall list will show these coordinates
 * sitting on the line, which is the correct thing for it to show.
 *
 * The responses are TRANSCRIPTS. They are punctuated because the scorer
 * receives punctuated text from the speech layer, and they carry the
 * hesitations a spoken answer has — a transcript with no repair in it is
 * not a transcript of speech.
 */
export type SpokenItem = {
  id: string;
  taskId: 'tcf-eo-t1' | 'tcf-eo-t2' | 'tcf-eo-t3';
  prompt: { en: string; fr: string };
  topicKeywords: string[];
  /**
   * Tâche 2 only: the specific things the instruction says to find out, as
   * groups of markers. A candidate covers a point if any marker in its group
   * appears. Per item, because each prompt names its own three.
   */
  required?: string[][];
  responses: { nclc7: string; nclc6: string; offTopic: string };
};

export const ITEMS: SpokenItem[] = [
  // ── tâche 1 · se présenter, environ deux minutes ───────────────────────
  {
    id: 'eo1-n6-01-presentation-travail',
    taskId: 'tcf-eo-t1',
    prompt: {
      en: 'Introduce yourself: who you are, what you do, and what brought you to learning French.',
      fr: "Présentez-vous : qui vous êtes, ce que vous faites, et ce qui vous a amené à apprendre le français.",
    },
    topicKeywords: ['je', 'suis', 'travaille', 'français', 'appelle'],
    responses: {
      nclc7: `Je m'appelle Ravi et je suis arrivé à Montréal il y a deux ans, avec ma femme et
notre fille. Alors, je travaille comme électricien dans une entreprise de
construction, surtout sur des chantiers résidentiels.

Ce qui m'a amené au français, c'est très concret en fait : la première année, je
travaillais avec une équipe anglophone et je gagnais bien ma vie, mais je ne
pouvais pas devenir chef d'équipe, parce que les consignes de sécurité se donnent
en français sur la plupart des chantiers du Québec. Du coup, je perdais des
contrats sans même le savoir.

Alors j'ai commencé les cours du soir en janvier, trois soirs par semaine. C'est
difficile après une journée de travail, je ne vais pas mentir, mais depuis six
mois je comprends les réunions du matin, ce qui fait que je peux enfin répondre
quand on me demande quelque chose.`,
      nclc6: `Je m'appelle Ravi. J'ai trente-quatre ans. Je suis marié et j'ai une fille de six
ans. Je viens de l'Inde. Je suis arrivé au Canada il y a deux ans.

J'habite à Montréal, dans le quartier Villeray. Je travaille comme électricien
dans une entreprise de construction. Je travaille du lundi au vendredi. Je
commence à sept heures du matin.

J'apprends le français. Je prends des cours le soir. Je suis dans le niveau
intermédiaire. J'aime beaucoup la langue française. Je trouve que c'est une belle
langue. J'étudie aussi à la maison le week-end.

Je fais du sport le samedi. Je joue au cricket avec des amis. J'aime aussi
cuisiner. Voilà, c'est tout.`,
      offTopic: `Alors, le sujet dont je voudrais parler, c'est le transport en commun dans les
banlieues. Parce qu'on parle beaucoup du métro, mais très peu des gens qui
habitent à quarante minutes du terminus.

Par exemple, ma belle-sœur habite à Mascouche et elle met une heure quarante pour
venir travailler, alors qu'en voiture c'est trente-cinq minutes. Du coup, elle
prend la voiture, comme tout le monde, et ensuite on s'étonne qu'il y ait des
bouchons sur le pont.

Certes, une ligne de train coûte très cher. Mais je pense qu'on calcule mal : on
compte le prix des rails et on ne compte jamais les heures perdues par cent mille
personnes chaque matin.`,
    },
  },
  {
    id: 'eo1-n6-02-presentation-etudes',
    taskId: 'tcf-eo-t1',
    prompt: {
      en: 'Introduce yourself: who you are, what you are studying or doing, and why French matters to you.',
      fr: "Présentez-vous : qui vous êtes, ce que vous étudiez ou faites, et pourquoi le français compte pour vous.",
    },
    topicKeywords: ['je', 'suis', 'étudie', 'français', 'appelle'],
    responses: {
      nclc7: `Je m'appelle Amina et j'étudie en soins infirmiers, en deuxième année, au cégep
du Vieux Montréal.

Alors, si le français compte pour moi, c'est pour une raison très précise : je
fais des stages en CHSLD, et les patients que je soigne ont quatre-vingts ou
quatre-vingt-dix ans. Ces personnes-là ne parlent pas anglais, et surtout, quand
on est malade et qu'on a peur, on revient à sa première langue. Du coup, un
soignant qui ne parle pas français ne peut pas faire ce travail ici, ce n'est pas
une question de diplôme.

Ce qui m'a le plus aidée, en fait, c'est de travailler l'été dans une résidence
plutôt que de rester à réviser. Parce qu'on apprend à demander « où avez-vous
mal » beaucoup plus vite quand quelqu'un attend la réponse.`,
      nclc6: `Je m'appelle Amina. J'ai vingt-trois ans. Je viens du Maroc. Je suis arrivée au
Canada il y a trois ans avec ma famille.

J'étudie en soins infirmiers au cégep. Je suis en deuxième année. J'ai des cours
quatre jours par semaine. J'ai aussi des stages à l'hôpital.

J'apprends le français depuis mon arrivée. Je trouve que c'est important. Je
pense que c'est nécessaire pour mon métier. J'aime la langue française. Je
regarde des séries en français.

J'habite avec mes parents et mon frère. Je fais du bénévolat le dimanche. Je
voudrais travailler dans un hôpital après mes études. Voilà.`,
      offTopic: `Je voudrais vous parler du prix des logements étudiants, parce que c'est quelque
chose qui touche presque tout le monde autour de moi.

Alors, dans mon cégep, une chambre coûte maintenant huit cents dollars par mois,
alors qu'il y a cinq ans c'était cinq cent cinquante. Par exemple, deux filles de
ma classe ont abandonné en novembre, pas à cause des notes, mais parce qu'elles ne
pouvaient plus payer le loyer et les livres en même temps.

Certes, on peut dire que c'est le marché. Mais à cela je répondrais que le marché
ne s'occupe pas de savoir s'il y aura des infirmières dans dix ans, et nous, si.`,
    },
  },
  {
    id: 'eo1-n6-03-presentation-reconversion',
    taskId: 'tcf-eo-t1',
    prompt: {
      en: 'Introduce yourself: who you are, what you do now, and what brought you to French.',
      fr: "Présentez-vous : qui vous êtes, ce que vous faites aujourd'hui, et ce qui vous a amené au français.",
    },
    topicKeywords: ['je', 'suis', 'travaille', 'français', 'appelle'],
    responses: {
      nclc7: `Je m'appelle Oleksandr, on m'appelle Sasha, et je conduis un camion de livraison
depuis huit mois.

Avant, en Ukraine, j'étais comptable pendant onze ans. Alors la question qu'on me
pose toujours, c'est pourquoi je ne fais pas de la comptabilité ici. En fait, la
réponse est simple : je peux lire un bilan en français sans problème, mais un
client au téléphone qui m'explique un problème de facturation, ça, je ne pouvais
pas le suivre.

C'est pour ça que j'ai pris le camion : je voulais un travail où j'entends parler
français toute la journée, parce que dans un bureau on m'aurait mis avec les
anglophones par gentillesse. Du coup, en huit mois de livraisons, j'ai plus appris
qu'en deux ans de cours, et je repasse le TCF en novembre pour revenir à mon
métier.`,
      nclc6: `Je m'appelle Oleksandr. J'ai quarante et un ans. Je viens d'Ukraine. Je suis arrivé
au Canada il y a deux ans.

J'étais comptable dans mon pays. J'ai travaillé onze ans dans ce métier.
Maintenant je travaille comme livreur. Je conduis un camion. Je commence à six
heures.

J'apprends le français. J'ai suivi des cours pendant un an. Je continue à
étudier seul. Je regarde la télévision en français le soir. Je lis aussi des
journaux.

J'habite avec ma femme et mon fils. Mon fils va à l'école en français. Il parle
mieux que moi. Voilà, c'est ma présentation.`,
      offTopic: `Je voudrais parler de la reconnaissance des diplômes étrangers, parce que c'est un
sujet dont on parle beaucoup mais toujours de la même façon.

Alors, on dit souvent que les immigrants ne veulent pas refaire d'études. Par
exemple, dans mon cours de français, il y avait un chirurgien syrien et une
architecte colombienne, et les deux étaient prêts à recommencer. Ce n'est pas la
volonté qui manque.

Certes, il faut protéger le public, je le comprends très bien. Mais à cela je
répondrais qu'on peut vérifier une compétence en six mois, et que quand on met
quatre ans, ce n'est plus de la vérification, c'est de la dissuasion.`,
    },
  },
  {
    id: 'eo1-n6-04-presentation-famille',
    taskId: 'tcf-eo-t1',
    prompt: {
      en: 'Introduce yourself: who you are, your life here, and why you are learning French.',
      fr: "Présentez-vous : qui vous êtes, votre vie ici, et pourquoi vous apprenez le français.",
    },
    topicKeywords: ['je', 'suis', 'travaille', 'français', 'appelle'],
    responses: {
      nclc7: `Bonjour, je m'appelle Grace et je suis infirmière auxiliaire dans une résidence à
Québec.

Alors, pourquoi le français. Je suis arrivée du Nigeria avec deux enfants, et la
première année j'ai vécu presque entièrement en anglais, ce qui était possible à
Toronto mais pas ici. En fait, le déclic n'est pas venu du travail : c'est ma
fille de neuf ans qui a commencé à traduire pour moi chez le dentiste, et à
répondre à ma place.

C'est pour ça que je me suis inscrite, du coup, pas pour le diplôme mais pour
récupérer ma place. Depuis un an je fais les rendez-vous moi-même, et je crois que
c'est le changement le plus important de ma vie ici, plus que le travail.`,
      nclc6: `Je m'appelle Grace. J'ai trente-huit ans. Je viens du Nigeria. J'ai deux enfants,
une fille et un garçon.

J'habite à Québec depuis trois ans. Avant j'habitais à Toronto pendant un an. Je
travaille comme infirmière auxiliaire dans une résidence pour personnes âgées.

Je travaille de nuit trois fois par semaine. C'est fatigant mais le salaire est
correct. Mes collègues sont sympathiques.

J'apprends le français dans un centre du quartier. Je suis les cours deux fois par
semaine. C'est important pour moi et pour ma famille. Mes enfants vont à l'école
française. Ils parlent très bien. Voilà.`,
      offTopic: `Je voudrais parler du travail de nuit, parce que je le fais depuis trois ans et
qu'on en parle très peu.

Alors, dans ma résidence, nous sommes deux pour quarante résidents entre minuit et
huit heures. Par exemple, si deux personnes tombent la même nuit, il faut choisir
laquelle on relève en premier. Ce n'est pas une question d'organisation, c'est une
question de nombre.

Certes, embaucher coûte cher, je comprends très bien la direction. Mais à cela je
répondrais qu'une chute mal soignée finit à l'hôpital, et qu'une nuit d'hôpital
coûte plus qu'un mois de salaire.`,
    },
  },
  // ── tâche 2 · obtenir des informations, environ 3 min 30 ───────────────
  //
  // The only task in the exam where the CANDIDATE asks and the examiner
  // answers. `required` names the three things each prompt says to find out.
  {
    id: 'eo2-n6-01-chauffage',
    taskId: 'tcf-eo-t2',
    prompt: {
      en: 'You have just moved in and the heating does not work. Your examiner is the building manager. Find out the cause, the repair date, and what you must do meanwhile.',
      fr: "Vous venez d'emménager et le chauffage ne fonctionne pas. Votre examinateur est le gestionnaire de l'immeuble. Renseignez-vous sur l'origine du problème, sur la date de la réparation, et sur ce que vous devez faire en attendant.",
    },
    topicKeywords: ['chauffage', 'appartement', 'réparation', 'quand', 'est-ce', 'pourquoi', 'combien'],
    required: [
      ['pourquoi', 'origine', "d'où vient", 'la cause', "qu'est-ce qui"],
      ['quand', 'à partir de quand', 'quelle date', 'combien de temps', 'délai'],
      ['que dois-je', 'qu’est-ce que je dois', "qu'est-ce que je dois", 'en attendant', 'comment faire'],
    ],
    responses: {
      nclc7: `Bonjour, je viens d'emménager au 4B et le chauffage ne fonctionne pas du tout
depuis samedi.

Alors, d'abord, pourquoi est-ce que ça ne marche pas ? Est-ce que c'est seulement
mon appartement ou tout l'immeuble ? … D'accord. Et qu'est-ce qui a causé la
panne, exactement ?

Ensuite, à partir de quand est-ce que ce sera réparé ? Je vous demande une date,
parce qu'on m'a déjà dit « bientôt » vendredi. … Et si la pièce n'arrive pas
mardi, combien de temps est-ce que ça peut prendre ?

Et enfin, qu'est-ce que je dois faire en attendant ? Est-ce que je peux utiliser
un chauffage d'appoint électrique, et qui paie l'électricité dans ce cas ? Parce
qu'il fait onze degrés chez moi et j'ai un bébé de huit mois.`,
      nclc6: `Bonjour. Je viens d'emménager dans l'appartement 4B. Le chauffage ne fonctionne
pas. Il fait très froid chez moi.

Est-ce que vous êtes au courant du problème ? … D'accord.

Est-ce que le chauffage sera réparé ? … Bien.

Est-ce que c'est un problème grave ? … Ah bon.

C'est vraiment un problème pour moi parce qu'il fait froid. J'ai un bébé à la
maison. Ma femme n'est pas contente. C'est difficile de dormir la nuit avec cette
température.

Est-ce que vous pouvez faire quelque chose rapidement ? … Merci beaucoup. Je vous
remercie de votre aide. Au revoir monsieur.`,
      offTopic: `Bonjour, je vous appelle au sujet du stationnement, parce que j'ai reçu un avis
sur mon pare-brise hier.

Alors, pourquoi est-ce que la place 12 n'est plus disponible ? On me l'avait
attribuée dans le bail. Et à partir de quand est-ce que le changement s'applique ?

Ensuite, combien coûte la place extérieure, et est-ce qu'elle est déneigée
l'hiver ou est-ce que c'est à moi de le faire ?

Et qu'est-ce que je dois faire pour contester l'avis ? Est-ce qu'il y a un
formulaire, ou est-ce que je dois écrire une lettre ?`,
    },
  },
  {
    id: 'eo2-n6-02-cours-inscription',
    taskId: 'tcf-eo-t2',
    prompt: {
      en: 'You want to enrol on an evening course. Your examiner works at the reception desk. Find out the timetable, the cost, and what documents are needed.',
      fr: "Vous voulez vous inscrire à un cours du soir. Votre examinateur travaille à l'accueil. Renseignez-vous sur l'horaire, sur le coût, et sur les documents nécessaires.",
    },
    topicKeywords: ['cours', 'inscription', 'horaire', 'combien', 'documents', 'quand'],
    required: [
      ['horaire', 'quel jour', 'quels jours', 'à quelle heure', 'quand est-ce que', 'combien de soirs'],
      ['combien', 'coût', 'coûte', 'prix', 'tarif', 'frais'],
      ['documents', 'papiers', 'quels papiers', "qu'est-ce qu'il faut apporter", 'pièces'],
    ],
    responses: {
      nclc7: `Bonjour, je voudrais m'inscrire au cours de français du soir, niveau intermédiaire.

D'abord, quels jours est-ce que le cours a lieu, et à quelle heure exactement ? …
D'accord, et est-ce que c'est toutes les semaines, ou est-ce qu'il y a des
semaines de relâche ?

Ensuite, combien est-ce que ça coûte pour la session complète ? Et est-ce que le
matériel est compris dans ce prix, ou est-ce qu'il faut acheter le livre à part ?

Et enfin, quels documents est-ce que je dois apporter pour l'inscription ? On m'a
parlé d'une preuve de résidence, mais je ne sais pas si un bail suffit ou s'il
faut une facture. Et jusqu'à quand est-ce que je peux m'inscrire ?`,
      nclc6: `Bonjour. Je voudrais m'inscrire à un cours de français. Je cherche un cours du
soir parce que je travaille la journée.

Est-ce qu'il y a de la place ? … Ah, c'est bien.

Est-ce que le cours est le soir ? … D'accord, très bien.

Est-ce que c'est cher ? … Bon.

J'ai besoin d'améliorer mon français pour mon travail. Mon niveau est
intermédiaire je pense. J'ai déjà suivi des cours avant, dans un autre centre.
C'était bien mais c'était loin de chez moi.

Est-ce que je peux m'inscrire aujourd'hui ? … D'accord, très bien. J'ai apporté
mes papiers avec moi, au cas où. Je peux revenir demain aussi si c'est
nécessaire, je ne travaille pas le matin. Merci beaucoup madame, vous êtes très
aimable. Au revoir et bonne journée à vous.`,
      offTopic: `Bonjour, je viens au sujet de la salle communautaire que je voudrais réserver pour
un anniversaire.

Alors, quels samedis est-ce qu'elle est libre au mois de juin ? Et à partir de
quelle heure est-ce qu'on peut entrer pour installer ?

Ensuite, combien coûte la location pour cinq heures, et est-ce qu'il y a un dépôt
de garantie en plus ?

Et qu'est-ce qu'il faut apporter comme documents ? Est-ce qu'il faut une preuve
d'assurance, ou est-ce que la ville couvre ça ?`,
    },
  },
  {
    id: 'eo2-n6-03-clinique',
    taskId: 'tcf-eo-t2',
    prompt: {
      en: 'You need an appointment at a clinic. Your examiner is the receptionist. Find out the wait, what to bring, and what to do if it gets worse.',
      fr: "Vous avez besoin d'un rendez-vous dans une clinique. Votre examinateur est la réceptionniste. Renseignez-vous sur le délai, sur ce qu'il faut apporter, et sur ce qu'il faut faire en cas d'aggravation.",
    },
    topicKeywords: ['rendez-vous', 'clinique', 'délai', 'carte', 'quand', 'urgence'],
    required: [
      ['combien de temps', 'délai', 'quand est-ce que', 'dans combien', "d'attente"],
      ['apporter', 'documents', 'carte', 'quels papiers', "qu'est-ce qu'il faut"],
      ['si ça empire', "en cas d'urgence", 'si ça s’aggrave', "si ça s'aggrave", 'que dois-je faire', 'qui appeler'],
    ],
    responses: {
      nclc7: `Bonjour, j'appelle pour prendre un rendez-vous, je ne suis pas encore inscrite
chez vous.

D'abord, dans combien de temps est-ce que je pourrais voir quelqu'un ? … Et est-ce
que le délai est le même pour une infirmière que pour un médecin ?

Ensuite, qu'est-ce qu'il faut apporter le jour du rendez-vous ? J'ai ma carte
d'assurance maladie, mais est-ce qu'il faut aussi une pièce d'identité, ou la liste
de mes médicaments ?

Et enfin, qu'est-ce que je dois faire si ça s'aggrave avant la date ? Est-ce que
je vous rappelle, est-ce que je vais aux urgences, ou est-ce qu'il y a une ligne
téléphonique la nuit ? Parce que c'est surtout le soir que ça me fait mal.`,
      nclc6: `Bonjour. Je voudrais un rendez-vous à la clinique s'il vous plaît. J'ai mal depuis
plusieurs jours.

Est-ce que vous avez de la place cette semaine ? … Ah, d'accord.

Est-ce que c'est possible la semaine prochaine ? … Bon, très bien.

Est-ce que je dois apporter ma carte ? … D'accord.

J'ai vraiment mal, surtout le soir. Je ne dors pas bien depuis trois nuits. J'ai
pris des médicaments mais ça ne fait rien. Mon mari me dit d'aller à l'hôpital
mais je préfère la clinique.

Est-ce que c'est possible d'avoir plus tôt ? … Merci beaucoup.`,
      offTopic: `Bonjour, je vous appelle au sujet du carnet de vaccination de ma fille, parce que
l'école le demande pour la rentrée.

Alors, combien de temps est-ce que ça prend pour obtenir une copie officielle ? Et
est-ce que je peux la demander par internet ou est-ce qu'il faut venir sur place ?

Ensuite, qu'est-ce qu'il faut apporter comme documents pour la demande ? Est-ce
que ma carte suffit, ou est-ce qu'il faut aussi le certificat de naissance ?

Et qu'est-ce que je dois faire si l'école la réclame avant que je l'aie reçue ?`,
    },
  },
  {
    id: 'eo2-n6-04-banque',
    taskId: 'tcf-eo-t2',
    prompt: {
      en: 'You want to open an account. Your examiner works at the bank. Find out the conditions, the fees, and how long it takes.',
      fr: "Vous voulez ouvrir un compte. Votre examinateur travaille à la banque. Renseignez-vous sur les conditions, sur les frais, et sur les délais.",
    },
    topicKeywords: ['compte', 'banque', 'frais', 'combien', 'documents', 'ouvrir'],
    required: [
      ['conditions', 'quels documents', "qu'est-ce qu'il faut", 'quelles pièces', 'faut-il un'],
      ['frais', 'combien', 'coûte', 'tarif', 'mensuel'],
      ['combien de temps', 'délai', 'quand est-ce que', 'à partir de quand', 'dans combien'],
    ],
    responses: {
      nclc7: `Bonjour, je voudrais ouvrir un compte courant, je suis arrivée au pays il y a
trois semaines.

D'abord, quelles sont les conditions exactement ? Qu'est-ce qu'il faut comme
documents quand on n'a pas encore de permis de travail, seulement le passeport et
la lettre d'immigration ?

Ensuite, combien coûtent les frais mensuels, et est-ce qu'ils sont supprimés la
première année comme je l'ai lu sur l'affiche ? Et si je descends sous un certain
montant, est-ce qu'il y a des frais en plus ?

Et enfin, dans combien de temps est-ce que je peux utiliser le compte ? Je veux
dire, à partir de quand est-ce que je reçois la carte, et est-ce que je peux
recevoir un virement de salaire avant de l'avoir ?`,
      nclc6: `Bonjour. Je voudrais ouvrir un compte dans votre banque. Je suis nouvelle au
Canada.

Est-ce que c'est possible aujourd'hui ? … D'accord.

Est-ce que j'ai besoin de documents ? … Bien sûr, oui.

Est-ce qu'il y a des frais ? … Ah bon.

Je viens d'arriver et je dois recevoir mon salaire bientôt. Mon employeur m'a
demandé un numéro de compte. C'est pour cette raison que je viens aujourd'hui.
J'ai apporté mon passeport avec moi.

Est-ce que ça va être long ? … D'accord. Je comprends. C'est ma première banque
au Canada, alors je ne connais pas encore les habitudes ici. Dans mon pays c'était
différent, il fallait beaucoup plus de documents. Merci beaucoup, vous êtes très
aimable. Au revoir.`,
      offTopic: `Bonjour, je viens au sujet d'un prélèvement que je ne reconnais pas sur mon relevé
du mois dernier.

Alors, d'où vient ce montant de quatre-vingt-neuf dollars, exactement ? Est-ce que
vous pouvez voir le nom du commerçant ?

Ensuite, combien de temps est-ce que j'ai pour contester, et est-ce que la somme
est remboursée pendant l'enquête ou seulement après ?

Et qu'est-ce que je dois faire maintenant : est-ce qu'il faut bloquer la carte
tout de suite, ou est-ce que j'attends votre réponse ?`,
    },
  },
  // ── tâche 3 · exprimer et défendre un point de vue, environ 4 min 30 ───
  {
    id: 'eo3-n6-01-ville',
    taskId: 'tcf-eo-t3',
    prompt: {
      en: 'Some say a city should be designed for the people who live in it, others for the people who work in it. What do you think? Give your view, support it, and say what you would answer someone who disagreed.',
      fr: "Certains disent qu'une ville doit être conçue pour ceux qui l'habitent, d'autres pour ceux qui y travaillent. Qu'en pensez-vous ? Donnez votre avis, appuyez-le, et dites ce que vous répondriez à quelqu'un qui ne serait pas d'accord.",
    },
    topicKeywords: ['ville', 'habitants', 'travail', 'pense', 'avis', 'parce', 'exemple'],
    responses: {
      nclc7: `À mon avis, une ville doit d'abord être conçue pour ceux qui l'habitent, et je
vais dire pourquoi.

Parce qu'une ville se juge à seize heures, pas à midi. Par exemple, dans mon
quartier, il y a huit cafés qui ferment à dix-sept heures, quand les bureaux se
vident, et le samedi il n'y a nulle part où s'asseoir. On a construit pour des
gens qui repartent.

Certes, il est vrai qu'une ville sans emplois se vide aussi, je le reconnais tout
à fait. Une ville-dortoir n'est pas mieux, d'ailleurs on le voit dans certaines
banlieues.

Mais on pourrait me dire que le travail paie les taxes qui paient les parcs. À
cela je répondrais que les gens qui habitent la ville travaillent aussi, seulement
ils travaillent ailleurs que dans les tours, et qu'on les compte rarement. En
effet, l'infirmière du CHSLD et la caissière du coin ne sont pas des visiteurs.

C'est pourquoi je pense qu'il faut construire pour ceux qui restent, parce que
c'est eux qui font qu'une rue reste vivante après six heures.`,
      nclc6: `À mon avis, une ville doit être conçue pour ceux qui l'habitent. C'est vraiment ce
que je pense.

Les habitants sont les plus importants dans une ville. Ce sont eux qui vivent là
tous les jours, du matin au soir. Ils ont besoin d'une bonne qualité de vie.

Je trouve que c'est très important de penser aux habitants. Une ville doit être
agréable pour les gens qui y vivent. C'est essentiel selon moi.

Les travailleurs sont importants aussi bien sûr, mais je pense que les habitants
passent en premier. C'est mon opinion et je la défends.

Une belle ville, c'est une ville où les habitants sont contents. Voilà ce que je
crois vraiment. Je pense sincèrement que c'est la meilleure façon de voir les
choses, et je ne changerai pas d'avis là-dessus.`,
      offTopic: `À mon avis, l'école devrait commencer plus tard le matin, et je vais expliquer
pourquoi.

Parce que les adolescents ne dorment pas au même rythme que nous. Par exemple, ma
fille de quinze ans s'endort à minuit quoi qu'on fasse, et se lève à six heures
vingt. En effet, quand on regarde ses notes, elles sont meilleures l'après-midi.

Certes, il est vrai que décaler l'horaire complique la vie des parents qui
travaillent, je le reconnais.

Mais on pourrait me dire que c'est aux jeunes de se coucher plus tôt. À cela je
répondrais que ce n'est pas une question de discipline, c'est une question de
biologie, et qu'on ne discipline pas une horloge.`,
    },
  },
  {
    id: 'eo3-n6-02-teletravail',
    taskId: 'tcf-eo-t3',
    prompt: {
      en: 'Some say working from home is good for employees, others that it isolates them. What do you think? Give your view, support it, and answer someone who disagreed.',
      fr: "Certains disent que le télétravail est bon pour les employés, d'autres qu'il les isole. Qu'en pensez-vous ? Donnez votre avis, appuyez-le, et répondez à quelqu'un qui ne serait pas d'accord.",
    },
    topicKeywords: ['télétravail', 'employés', 'bureau', 'pense', 'avis', 'parce', 'exemple'],
    responses: {
      nclc7: `Je pense que le télétravail est bon pour les employés, mais pas pour tous, et
c'est cette nuance qui compte.

Parce que le vrai gain, ce n'est pas le confort, c'est le trajet. Par exemple, ma
sœur récupérait deux heures par jour, ce qui fait dix heures par semaine, et elle
les a mises dans un cours du soir. En effet, personne ne parle de ça quand on
discute de productivité.

Certes, il est vrai que les nouveaux employés apprennent mal seuls devant un
écran, je l'admets complètement. On apprend un métier en regardant quelqu'un le
faire.

Mais on me dira que l'isolement rend les gens malheureux. À cela je répondrais que
l'isolement ne vient pas du lieu, il vient du nombre : quelqu'un qui voit trois
personnes par jour au bureau est aussi seul chez lui qu'au travail. D'ailleurs
c'est pourquoi je pense qu'il faut décider par personne, pas par entreprise.`,
      nclc6: `Je pense que le télétravail est une bonne chose pour les employés. C'est vraiment
mon avis sur cette question.

Travailler à la maison est plus confortable. Les employés sont plus tranquilles
chez eux. Ils peuvent organiser leur journée comme ils veulent.

Je trouve que c'est très pratique et très utile. C'est une bonne solution
moderne. Beaucoup de gens sont contents de cette possibilité.

Bien sûr, certaines personnes préfèrent le bureau, mais moi je pense que le
télétravail est mieux. C'est mon opinion personnelle.

Le monde du travail a changé et il faut s'adapter. Je pense sincèrement que c'est
l'avenir. Voilà ce que je crois, et je pense que beaucoup de gens sont d'accord
avec moi sur ce point important. C'est une évolution normale de la société
moderne. Les entreprises doivent comprendre cela et accepter le changement. C'est
vraiment mon avis sur cette question et je le maintiens.`,
      offTopic: `Je pense que les transports en commun devraient être gratuits, et voici pourquoi.

Parce que le prix n'est pas le vrai coût. Par exemple, à Montréal, un titre
mensuel coûte quatre-vingt-dix-sept dollars, ce qui fait presque une journée de
salaire au minimum. En effet, pour une famille de quatre, c'est un loyer de plus
par an.

Certes, il est vrai que quelqu'un doit payer le réseau, je le reconnais.

Mais on pourrait me dire que le gratuit fait fuir les investissements. À cela je
répondrais qu'on ne fait pas payer l'entrée des routes, et que personne ne trouve
ça étrange.`,
    },
  },
  {
    id: 'eo3-n6-03-benevolat-obligatoire',
    taskId: 'tcf-eo-t3',
    prompt: {
      en: 'Some say community service should be compulsory for young people, others that compulsory volunteering is a contradiction. What do you think?',
      fr: "Certains disent que le service communautaire devrait être obligatoire pour les jeunes, d'autres qu'un bénévolat obligatoire est une contradiction. Qu'en pensez-vous ?",
    },
    topicKeywords: ['jeunes', 'bénévolat', 'obligatoire', 'pense', 'avis', 'parce', 'exemple'],
    responses: {
      nclc7: `Je pense qu'il ne faut pas le rendre obligatoire, et pourtant je suis quelqu'un
qui fait du bénévolat toutes les semaines.

Parce que ce qui fait revenir les gens, c'est d'avoir choisi. Par exemple, dans
l'organisme où je vais, les élèves envoyés par leur école font leurs trente heures
et on ne les revoit jamais, alors que ceux qui sont venus seuls restent des
années. En effet, on le voit dans les registres.

Certes, il est vrai que beaucoup de jeunes ne découvriraient jamais ce milieu sans
qu'on les y pousse, je l'admets volontiers.

Mais on me dira qu'on n'a rien sans obligation. À cela je répondrais qu'il y a une
différence entre obliger et exposer : une visite d'une journée montrerait la même
chose sans transformer le don en devoir. C'est pourquoi je préfère qu'on ouvre les
portes plutôt qu'on remplisse les cases.`,
      nclc6: `Je pense que le bénévolat obligatoire pour les jeunes est une bonne idée. C'est
mon avis sur cette question.

Les jeunes doivent apprendre à aider les autres. C'est important pour leur
éducation et pour la société. Ils doivent comprendre la valeur du travail
communautaire.

Je trouve que c'est très utile et très formateur. Cela leur apprend beaucoup de
choses. C'est une expérience enrichissante pour eux.

Certains parents ne sont pas d'accord, mais je pense qu'ils ont tort. Les jeunes
d'aujourd'hui ont besoin de cela.

C'est vraiment ma position sur ce sujet. Je pense sincèrement que ce serait très
positif pour tout le monde et je défends cette idée depuis longtemps. Les jeunes
sont l'avenir de notre société et il faut s'en occuper sérieusement. Je trouve que
c'est une question vraiment essentielle aujourd'hui. Voilà mon opinion complète sur
ce sujet important.`,
      offTopic: `Je pense que les écoles devraient enseigner la finance personnelle, et voici
pourquoi.

Parce qu'on apprend le théorème de Pythagore et jamais ce qu'est un taux
d'intérêt. Par exemple, mon neveu de dix-neuf ans a signé une carte de crédit à
vingt-huit pour cent sans savoir ce que ça voulait dire. En effet, personne ne le
lui avait expliqué.

Certes, il est vrai que le programme est déjà chargé, je le reconnais.

Mais on pourrait me dire que c'est le rôle des parents. À cela je répondrais que
beaucoup de parents ne le savent pas non plus, et qu'on ne transmet pas ce qu'on
n'a pas.`,
    },
  },
  {
    id: 'eo3-n6-04-langue-travail',
    taskId: 'tcf-eo-t3',
    prompt: {
      en: 'Some say an employer should be able to require French at work, others that it excludes newcomers. What do you think?',
      fr: "Certains disent qu'un employeur devrait pouvoir exiger le français au travail, d'autres que cela exclut les personnes nouvellement arrivées. Qu'en pensez-vous ?",
    },
    topicKeywords: ['français', 'travail', 'employeur', 'pense', 'avis', 'parce', 'exemple'],
    responses: {
      nclc7: `Je pense qu'un employeur peut l'exiger, à une condition, et c'est la condition qui
m'intéresse plus que le principe.

Parce qu'exiger sans former, ce n'est pas une exigence, c'est un filtre. Par
exemple, sur mon chantier, l'entreprise demande le français pour les consignes de
sécurité, ce qui est parfaitement légitime, mais elle paie aussi trois heures de
cours par semaine sur le temps de travail. En effet, en un an, quatre gars de mon
équipe sont passés chefs.

Certes, il est vrai que toutes les entreprises ne peuvent pas payer cela, je
l'admets, surtout les petites.

Mais on me dira que c'est à chacun d'apprendre sur son temps libre. À cela je
répondrais qu'une personne qui travaille cinquante heures et élève deux enfants
n'a pas de temps libre, et que l'exigence retombe alors toujours sur les mêmes.
C'est pourquoi je dirais : exiger oui, mais en donnant les moyens.`,
      nclc6: `Je pense qu'un employeur peut exiger le français au travail. C'est mon opinion sur
cette question importante.

Le français est la langue officielle ici. C'est normal de le parler au travail.
Les employés doivent faire un effort pour apprendre.

Je trouve que c'est logique et que c'est important pour la société. La langue est
essentielle pour bien communiquer entre collègues.

Certaines personnes ne sont pas d'accord avec moi, mais je pense que c'est
nécessaire. C'est vraiment ma position.

Il faut apprendre la langue du pays où on vit. C'est ce que je pense sincèrement
et je crois que la majorité des gens partagent cette opinion sur ce sujet. La
langue est vraiment quelque chose de fondamental dans une société. Sans elle, les
gens ne peuvent pas bien se comprendre au travail. Voilà ma position et je la
défends.`,
      offTopic: `Je pense que les commerces devraient fermer un jour par semaine, et je vais
expliquer pourquoi.

Parce que le temps commun disparaît. Par exemple, quand j'étais enfant, tout
fermait le dimanche et on se retrouvait, alors qu'aujourd'hui chacun travaille un
jour différent. En effet, dans ma famille, nous n'avons pas mangé ensemble depuis
deux mois.

Certes, il est vrai que beaucoup de gens comptent sur ces heures pour boucler
leur mois, je le reconnais tout à fait.

Mais on pourrait me dire que c'est au client de décider. À cela je répondrais que
le client, c'est aussi quelqu'un qui travaille le dimanche.`,
    },
  },
];
