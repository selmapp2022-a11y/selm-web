/**
 * TCF Canada — data only, same shape, different numbers and language.
 *
 * This file is the test. It was written after the engine, and the engine was
 * not edited to accommodate it. Every difference from IELTS below is a value
 * in this object:
 *
 *   - a 0–20 scale instead of 0–9 bands
 *   - NCLC instead of CLB, with its own table
 *   - four criteria with French ids and French labels that no adapter knows
 *   - a word band (60–120) rather than a floor
 *   - "A1 non atteint" as an automatic zero where IELTS applies a penalty
 *   - no judge bound at all
 *
 * Sources and open items:
 * - Expression écrite is scored 0–20 and NCLC 7 requires 10/20. Stated in
 *   the business plan and consistent with the published equivalency.
 * - The score→NCLC rows below are VERIFIED, 2026-08-26, against IRCC's own
 *   test equivalency chart and against France Éducation international's
 *   correspondence table, which agree on every row. Three rows below NCLC 7
 *   were wrong and are corrected; see the note on `benchmark`.
 *
 * VERIFIED 2026-08-26 against France Éducation international, read through a
 * browser because the site refuses this project's network:
 *   - "Manuel du candidat TCF", Version P, avril 2026, p. 20 — expression
 *     écrite is three tâches, and for TCF tout public, Québec and Canada the
 *     expected length is: Tâche 1, 60–120 mots; Tâche 2, 120–150 mots;
 *     Tâche 3, 120–180 mots. Tâche 3 is described there as comparing two
 *     points of view on a fait de société expressed in two documents, with
 *     the candidate's own opinion — which is what this file already models.
 *   - france-education-international.fr/test/tcf-canada — "Expression
 *     écrite : Épreuve collective : 3 exercices. Durée : 60 minutes."
 *
 * So the word bands below are the exam's. The per-tâche times are not: FEI
 * publishes 60 minutes for the whole épreuve and no split at all. Ours is an
 * equal third, carried as `timeLimitApportioned` and shown to the candidate
 * as ours.
 *
 * Expression écrite tâche 2 and expression orale tâches 2 and 3 were added
 * on 2026-08-26 from the Manuel du candidat TCF, Version P, avril 2026, p.
 * 19–20. The word bands, the task types and the speaking durations are the
 * exam's; the subjects are ours and say so; the written per-tâche times are
 * ours and are flagged `timeLimitApportioned`.
 */
import type { ExamDefinition } from '../model/types';

export const TCF_CANADA: ExamDefinition = {
  id: 'tcf-canada',
  name: { en: 'TCF Canada', fr: 'TCF Canada' },
  language: 'fr',
  locale: 'fr-CA',
  acceptedFor: {
    en: 'Canadian economic immigration and Canadian citizenship.',
    fr: "Immigration économique canadienne et citoyenneté canadienne.",
  },
  scales: [
    {
      id: 'sur20',
      label: { en: 'Score out of 20', fr: 'Note sur 20' },
      min: 0,
      max: 20,
      step: 1,
      display: { suffix: { en: '/ 20', fr: '/ 20' }, decimals: 0 },
    },
    // 331 and 342 are NOT the floors of these scales. They are the NCLC 4
    // thresholds in IRCC's chart, which starts at NCLC 4 because that is the
    // lowest level it converts. FEI reports comprehension on 100–699. Encoded
    // as 331/342 on 26 August and corrected the same day, before anything
    // rendered them.
    {
      id: 'co699',
      label: { en: 'Listening score', fr: 'Score de compréhension orale' },
      min: 100,
      max: 699,
      step: 1,
      display: { suffix: { en: '/ 699', fr: '/ 699' }, decimals: 0 },
    },
    {
      id: 'ce699',
      label: { en: 'Reading score', fr: 'Score de compréhension écrite' },
      min: 100,
      max: 699,
      step: 1,
      display: { suffix: { en: '/ 699', fr: '/ 699' }, decimals: 0 },
    },
  ],
  // VERIFIED 2026-08-26 against two independent published sources that agree
  // on every row: IRCC's own test equivalency chart — the department that
  // reads the attestation and converts it — and France Éducation
  // international's "Correspondance entre les résultats au TCF Canada et les
  // niveaux de compétence linguistique canadiens".
  //
  // Three rows below 7 were WRONG before this. The table said 9→6, 7→5, 6→4;
  // the published table is 7→6, 6→5, 4→4. A candidate marked 6 was being told
  // NCLC 4 when the awarding body would say NCLC 5. The error was entirely in
  // the low half of the range, which is also the half this project has the
  // least evidence for.
  //
  // Note the shape, because it decides how accuracy may ever be published:
  // NCLC 7 spans two marks (10 and 11) and NCLC 5 spans exactly one (6). A
  // scorer with ±1 mark of error crosses a whole level in the middle of the
  // range and not at the bottom, so a single aggregate accuracy figure would
  // be a lie by averaging. `calibration.byLevel` and the gate's `minPerLevel`
  // are what make a per-level statement possible.
  benchmark: {
    system: 'NCLC',
    // Expression écrite and expression orale, mark out of 20.
    bands: [
      { from: 16, level: 10, cefr: 'C1-C2' },
      { from: 14, level: 9, cefr: 'C1' },
      { from: 12, level: 8, cefr: 'B2' },
      { from: 10, level: 7, cefr: 'B2' },
      { from: 7, level: 6, cefr: 'B1' },
      { from: 6, level: 5, cefr: 'B1' },
      { from: 4, level: 4, cefr: 'A2' },
    ],
    // The two comprehension scales. No section uses them yet — compréhension
    // orale and compréhension écrite are not modelled — but they are verified
    // and they differ at every boundary except the top, so they are recorded
    // separately rather than left to be guessed at when those sections exist.
    byScale: {
      co699: [
        { from: 549, level: 10, cefr: 'C1-C2' },
        { from: 523, level: 9, cefr: 'C1' },
        { from: 503, level: 8, cefr: 'B2' },
        { from: 458, level: 7, cefr: 'B2' },
        { from: 398, level: 6, cefr: 'B1' },
        { from: 369, level: 5, cefr: 'B1' },
        { from: 331, level: 4, cefr: 'A2' },
      ],
      ce699: [
        { from: 549, level: 10, cefr: 'C1-C2' },
        { from: 524, level: 9, cefr: 'C1' },
        { from: 499, level: 8, cefr: 'B2' },
        { from: 453, level: 7, cefr: 'B2' },
        { from: 406, level: 6, cefr: 'B1' },
        { from: 375, level: 5, cefr: 'B1' },
        { from: 342, level: 4, cefr: 'A2' },
      ],
    },
  },
  calibration: {
    // Zero, and for French there is a second problem behind the first: no
    // published set of examiner-rated French scripts exists to check against
    // in the meantime. English has official sample scripts with awarded
    // bands; French has commercial prep-site corrections, which are somebody's
    // opinion rather than an awarded level. Every French number therefore has
    // to wait for real attestations. There is no free external anchor.
    samples: 0,
    byLevel: {},
    mae: null,
    gate: {
      minSamples: 150,
      levels: [4, 5, 6, 7, 8, 9, 10],
      minPerLevel: 10,
      maxMae: 0.75,
      coverage: [0.88, 0.93],
    },
  },
  predictionTarget: {
    unit: 'skill_at_sitting',
    window: { days: 30, minResponses: 3 },
    claim: {
      en: 'The NCLC level this candidate would be awarded for this skill if they sat TCF Canada now, estimated from their practice responses of the last 30 days.',
      fr: "Le niveau NCLC que ce candidat obtiendrait pour cette compétence s'il passait le TCF Canada maintenant, estimé à partir de ses réponses d'entraînement des 30 derniers jours.",
    },
  },
  sections: [
    {
      kind: 'comprehension',
      id: 'comprehension-orale',
      skill: 'listening',
      name: { en: 'Listening comprehension', fr: 'Compréhension orale' },
      // Published: 35 minutes for the épreuve. FEI, TCF Canada page.
      timeLimitSec: 35 * 60,
      scaleId: 'co699',
      delivery: {
        // The audio plays once. This is the rule candidates find hardest and
        // the one no competing product enforces.
        audioPlaysOnce: true,
        // And the question appears after it, not during it — so the item
        // tests listening rather than reading-while-listening.
        questionAfterAudio: true,
        transcriptDuringSection: false,
        presentation: 'one_at_a_time',
        clock: 'section',
        answersLockedOnAnswer: false,
        feedbackDuringSection: false,
      },
      provenance: {
        en: 'Every item in this section was written for this product, to the published format — 39 questions, ordered by progressive difficulty — and no real exam question is reproduced. The A1-to-C2 banding is ours: the exam publishes that difficulty rises across the section and does not publish which item sits at which level.',
        fr: "Tous les items de cette épreuve ont été rédigés pour ce produit, selon le format publié — 39 questions, à difficulté progressive — sans reproduire aucune question réelle d'examen. Le classement A1 à C2 est le nôtre : l'examen indique que la difficulté augmente, sans publier le niveau de chaque item.",
      },
      items: [
        {
          id: "tcf-co-01",
          audioPath: "tcf-co/tcf-co-01.mp3",
          level: "A1",
          speakers: 1,
          content: "Bonjour, je voudrais un café, s'il vous plaît.",
          stem: "Que demande la personne ?",
          options: ["Un thé", "L'addition", "Un café", "Un verre d'eau"],
          answer: 2,
          rationale: "Tests recognition of a single everyday noun in a polite request; the distractors are all items plausibly ordered in the same setting but none of them is said.",
        },
        {
          id: "tcf-co-02",
          audioPath: "tcf-co/tcf-co-02.mp3",
          level: "A1",
          speakers: 1,
          content: "Le magasin ferme à dix-huit heures.",
          stem: "À quelle heure ferme le magasin ?",
          options: ["À dix-huit heures", "À dix heures", "À huit heures", "À dix-neuf heures"],
          answer: 0,
          rationale: "Tests comprehension of a compound time expression; the distractors are near-misses formed from the parts of dix-huit or by shifting one hour.",
        },
        {
          id: "tcf-co-03",
          audioPath: "tcf-co/tcf-co-03.mp3",
          level: "A1",
          speakers: 1,
          content: "Excusez-moi, où sont les toilettes ?",
          stem: "Que cherche la personne ?",
          options: ["La sortie du bâtiment", "Un taxi", "La caisse", "Les toilettes"],
          answer: 3,
          rationale: "Tests a basic où est-ce que question with a concrete place noun; the distractors are other things one commonly asks for in a public building but that are never mentioned.",
        },
        {
          id: "tcf-co-04",
          audioPath: "tcf-co/tcf-co-04.mp3",
          level: "A1",
          speakers: 1,
          content: "Il pleut beaucoup aujourd'hui, prends ton parapluie.",
          stem: "Quel temps fait-il ?",
          options: ["Il neige", "Il pleut", "Il fait chaud", "Il y a du vent"],
          answer: 1,
          rationale: "Tests weather vocabulary in a short piece of advice; the distractors are other common weather statements, one of which (le vent) would also motivate the umbrella but is not said.",
        },
        {
          id: "tcf-co-05",
          audioPath: "tcf-co/tcf-co-05.mp3",
          level: "A2",
          speakers: 2,
          content: "— Bonjour, je cherche un appartement pour deux personnes.\n— Nous en avons un au troisième étage, mais il n'y a pas d'ascenseur.",
          stem: "Quel est le problème de l'appartement ?",
          options: ["Il est trop petit", "Il n'y a pas d'ascenseur", "Il est trop cher", "Il est au rez-de-chaussée"],
          answer: 1,
          rationale: "Tests the restrictive mais in a short housing exchange; the distractors are typical apartment complaints that are never stated, and rez-de-chaussée contradicts troisième étage.",
        },
        {
          id: "tcf-co-06",
          audioPath: "tcf-co/tcf-co-06.mp3",
          level: "A2",
          speakers: 1,
          content: "Mesdames et messieurs, en raison de travaux, l'autobus numéro 12 ne s'arrête pas devant l'hôpital ce matin. Merci de descendre à l'arrêt suivant.",
          stem: "Que doivent faire les voyageurs ?",
          options: ["Prendre un autre autobus", "Attendre devant l'hôpital", "Payer un supplément", "Descendre à l'arrêt suivant"],
          answer: 3,
          rationale: "Tests an instruction inside a public announcement; hôpital and autobus appear in the script but answer a different question, and no change of bus or fare is mentioned.",
        },
        {
          id: "tcf-co-07",
          audioPath: "tcf-co/tcf-co-07.mp3",
          level: "A2",
          speakers: 1,
          content: "Pour vous inscrire au cours, remplissez d'abord le formulaire en ligne, puis apportez une pièce d'identité au bureau, le jeudi.",
          stem: "Que faut-il apporter au bureau ?",
          options: ["Une pièce d'identité", "Le formulaire papier rempli", "Une photo d'identité récente", "Un paiement en espèces"],
          answer: 0,
          rationale: "Tests the sequence d'abord / puis and what belongs to each step; the strongest distractor reuses formulaire, which is completed online and not carried to the office.",
        },
        {
          id: "tcf-co-08",
          audioPath: "tcf-co/tcf-co-08.mp3",
          level: "A2",
          speakers: 2,
          content: "— Le rendez-vous chez le dentiste est à quelle heure ?\n— À neuf heures quinze, mais il faut arriver dix minutes avant.",
          stem: "À quelle heure la personne doit-elle arriver ?",
          options: ["À neuf heures quinze", "À neuf heures trente", "À neuf heures cinq", "À huit heures quinze"],
          answer: 2,
          rationale: "Tests a one-step calculation on a stated time; the distractors are the appointment time itself, an addition instead of a subtraction, and an hour error.",
        },
        {
          id: "tcf-co-09",
          audioPath: "tcf-co/tcf-co-09.mp3",
          level: "A2",
          speakers: 1,
          content: "Bonjour, ici le garage. Votre voiture est prête, mais nous fermons à midi le samedi. Venez plutôt lundi matin.",
          stem: "Que conseille le garage ?",
          options: ["De venir samedi midi", "De rappeler plus tard", "De laisser la voiture au garage", "De venir lundi matin"],
          answer: 3,
          rationale: "Tests plutôt as a recommendation in a short voicemail; samedi and midi are in the script but describe the closing time being avoided, not the advice.",
        },
        {
          id: "tcf-co-10",
          audioPath: "tcf-co/tcf-co-10.mp3",
          level: "A2",
          speakers: 2,
          content: "— Tu prends le métro pour aller au travail ?\n— Non, je marche. C'est seulement quinze minutes.",
          stem: "Comment la personne va-t-elle au travail ?",
          options: ["En métro", "À pied", "À vélo", "En voiture"],
          answer: 1,
          rationale: "Tests a negative answer that corrects the question's assumption; métro is named only to be rejected, and the other means of transport are never mentioned.",
        },
        {
          id: "tcf-co-11",
          audioPath: "tcf-co/tcf-co-11.mp3",
          level: "B1",
          speakers: 2,
          content: "— Alors, cette formation en informatique, tu la commences quand ?\n— En principe en septembre. Mais je dois d'abord trouver quelqu'un pour garder les enfants le soir. Sinon, j'attendrai la session de janvier.",
          stem: "De quoi dépend le début de la formation ?",
          options: ["Du prix de la formation", "De la date limite d'inscription au programme", "D'une solution de garde pour les enfants", "Du résultat d'un examen d'entrée"],
          answer: 2,
          rationale: "Tests the conditional link carried by d'abord and sinon; the distractors are plausible but unstated obstacles to starting a course.",
        },
        {
          id: "tcf-co-12",
          audioPath: "tcf-co/tcf-co-12.mp3",
          level: "B1",
          speakers: 1,
          content: "Bonjour Madame, je vous appelle au sujet de votre demande de logement. Votre dossier est presque complet : il ne manque que la preuve de revenus. Sans ce document, nous ne pourrons pas l'examiner avant la fin du mois.",
          stem: "Pourquoi le dossier ne peut-il pas être examiné ?",
          options: ["Il manque une preuve de revenus", "La demande a été refusée", "Le dossier est arrivé trop tard", "Le logement est déjà loué"],
          answer: 0,
          rationale: "Tests il ne manque que plus the negative condition sans ce document; the distractors are stronger outcomes (refusal, lateness, loss of the flat) that the message explicitly does not announce.",
        },
        {
          id: "tcf-co-13",
          audioPath: "tcf-co/tcf-co-13.mp3",
          level: "B1",
          speakers: 2,
          content: "— Tu as l'air fatigué.\n— J'ai changé d'horaire au travail. Je commence à cinq heures du matin maintenant. Le salaire est meilleur, mais je m'endors devant la télévision à huit heures du soir.",
          stem: "Que dit l'homme de son nouvel horaire ?",
          options: ["Il regrette l'horaire qu'il avait avant", "Il travaille moins d'heures qu'auparavant", "Il s'entend mal avec ses nouveaux collègues", "Il gagne plus mais dort mal"],
          answer: 3,
          rationale: "Tests the concessive contrast le salaire est meilleur / mais; the distractors add a regret, a reduction in hours and a colleague problem that the speaker never expresses.",
        },
        {
          id: "tcf-co-14",
          audioPath: "tcf-co/tcf-co-14.mp3",
          level: "B1",
          speakers: 1,
          content: "Chers usagers, la bibliothèque restera ouverte pendant toute la durée des travaux. En revanche, l'entrée principale sera fermée : utilisez la porte située du côté du parc. Les retours de livres se font toujours à l'accueil.",
          stem: "Qu'est-ce qui change pendant les travaux ?",
          options: ["Les horaires d'ouverture", "L'entrée à utiliser", "Le lieu des retours de livres", "La durée des emprunts"],
          answer: 1,
          rationale: "Tests separating what changes from what stays the same; horaires and retours are addressed in the script precisely to say they are unchanged, and loan periods are not mentioned.",
        },
        {
          id: "tcf-co-15",
          audioPath: "tcf-co/tcf-co-15.mp3",
          level: "B1",
          speakers: 2,
          content: "— Vous avez déjà travaillé dans la vente ?\n— Pas exactement. J'ai été serveur pendant trois ans, donc j'ai l'habitude du contact avec les clients, mais je n'ai jamais tenu une caisse.",
          stem: "Que dit le candidat au sujet de son expérience ?",
          options: ["Il a trois ans d'expérience dans la vente", "Il n'a jamais travaillé avec le public", "Il connaît le contact client mais pas la caisse", "Il a déjà tenu une caisse dans un restaurant pendant trois ans"],
          answer: 2,
          rationale: "Tests the qualified pas exactement and the two-part self-description; the distractors misattribute the three years to sales, overstate the negation, or invert the caisse statement.",
        },
        {
          id: "tcf-co-16",
          audioPath: "tcf-co/tcf-co-16.mp3",
          level: "B1",
          speakers: 2,
          content: "— Le colis devait arriver hier.\n— Je vois qu'il est passé par notre centre de tri ce matin. Il sera livré demain avant midi. Si personne n'est présent, il sera déposé au bureau de poste du quartier.",
          stem: "Que se passera-t-il si personne n'est présent à la livraison ?",
          options: ["Le colis sera immédiatement renvoyé à l'expéditeur", "Le colis sera livré le lendemain", "Le colis restera au centre de tri", "Le colis sera déposé au bureau de poste"],
          answer: 3,
          rationale: "Tests a si-clause consequence; centre de tri and livré demain are in the script but describe the normal route, not the failed-delivery case.",
        },
        {
          id: "tcf-co-17",
          audioPath: "tcf-co/tcf-co-17.mp3",
          level: "B1",
          speakers: 1,
          content: "Voici mon message pour l'équipe : la réunion de vendredi est déplacée à mardi prochain, même heure, même salle. Ceux qui ne pourront pas venir sont invités à envoyer leurs commentaires par écrit avant lundi soir.",
          stem: "Que peuvent faire les personnes absentes ?",
          options: ["Envoyer leurs commentaires par écrit", "Demander une autre réunion", "Venir à une autre heure", "Écouter l'enregistrement de la réunion"],
          answer: 0,
          rationale: "Tests the instruction attached to the absent group; même heure appears in the script but applies to the rescheduled meeting, and no recording or second meeting is offered.",
        },
        {
          id: "tcf-co-18",
          audioPath: "tcf-co/tcf-co-18.mp3",
          level: "B1",
          speakers: 2,
          content: "— Tu as trouvé un médecin de famille ?\n— Non, je suis sur une liste d'attente depuis huit mois. En attendant, quand j'ai un problème, je vais dans une clinique sans rendez-vous. On y attend longtemps, mais au moins on est vu le jour même.",
          stem: "Pourquoi la personne va-t-elle à la clinique sans rendez-vous ?",
          options: ["Parce que c'est moins cher", "Parce qu'elle n'a pas encore de médecin de famille", "Parce que l'attente y est courte", "Parce que son médecin de famille est absent pour plusieurs semaines"],
          answer: 1,
          rationale: "Tests the causal link expressed through en attendant; the script says the wait there is long, and price and an absent doctor are never mentioned.",
        },
        {
          id: "tcf-co-19",
          audioPath: "tcf-co/tcf-co-19.mp3",
          level: "B1",
          speakers: 2,
          content: "— J'hésite encore entre les deux logements.\n— Le premier est plus grand et moins cher, mais il est à quarante minutes du centre. Le deuxième est petit, plus cher, et tu descends au travail à pied. À toi de voir ce que tu préfères perdre : du temps ou de l'argent.",
          stem: "Quel est l'avantage du deuxième logement ?",
          options: ["Il est nettement plus grand que l'autre", "Il coûte moins cher", "Il est proche du travail", "Il est plus calme"],
          answer: 2,
          rationale: "Tests holding two contrasted descriptions apart; plus grand and moins cher belong to the first flat, and quietness is never discussed.",
        },
        {
          id: "tcf-co-20",
          audioPath: "tcf-co/tcf-co-20.mp3",
          level: "B2",
          speakers: 1,
          content: "Selon une étude publiée cette semaine, le télétravail n'a pas fait baisser la productivité des entreprises interrogées. Ce sont plutôt les réunions qui se sont multipliées. Les auteurs relèvent que les employés déclarent travailler autant qu'avant, mais se plaignent davantage d'un sentiment d'isolement.",
          stem: "Quelle est la conclusion principale de l'étude ?",
          options: ["Le télétravail a réduit la productivité des entreprises", "Les employés interrogés travaillent moins qu'avant", "Les entreprises interrogées veulent supprimer le télétravail", "La productivité se maintient, mais l'isolement augmente"],
          answer: 3,
          rationale: "Tests a two-part finding stated partly in the negative; each distractor reverses one element the report explicitly denies or never raises.",
        },
        {
          id: "tcf-co-21",
          audioPath: "tcf-co/tcf-co-21.mp3",
          level: "B2",
          speakers: 2,
          content: "— On m'a demandé de reprendre le dossier de Sofia pendant son congé.\n— Tu vas t'en sortir ?\n— Le travail lui-même, oui, je le connais. Ce qui m'ennuie, c'est qu'on ne m'a rien dit sur la date de son retour, et j'ai mes propres échéances en novembre.",
          stem: "Qu'est-ce qui préoccupe la femme ?",
          options: ["La difficulté technique du dossier", "L'incertitude sur la durée du remplacement", "Le manque de formation pour reprendre ce dossier", "Le refus de sa collègue de l'aider"],
          answer: 1,
          rationale: "Tests locating the real worry after a concession; she states that the work itself is not the problem, and no training issue or refusal is mentioned.",
        },
        {
          id: "tcf-co-22",
          audioPath: "tcf-co/tcf-co-22.mp3",
          level: "B2",
          speakers: 1,
          content: "Personnellement, je ne suis pas contre l'idée d'augmenter le prix des transports. Ce qui me dérange, c'est qu'on nous annonce cette hausse en même temps qu'une réduction du nombre d'autobus le soir. Payer plus pour un meilleur service, d'accord. Payer plus pour attendre plus longtemps, non.",
          stem: "Quelle est la position de la personne ?",
          options: ["Elle accepterait une hausse si le service s'améliorait", "Elle est opposée à toute augmentation des prix", "Elle trouve que les transports coûtent déjà trop cher", "Elle préfère désormais utiliser sa voiture"],
          answer: 0,
          rationale: "Tests a conditional stance built on a double negation; the speaker opens by saying she is not against the rise, and neither current prices nor cars are her subject.",
        },
        {
          id: "tcf-co-23",
          audioPath: "tcf-co/tcf-co-23.mp3",
          level: "B2",
          speakers: 1,
          content: "Le nouveau règlement municipal oblige les propriétaires à déclarer les logements loués à court terme. Les associations de locataires saluent la mesure. Elles rappellent toutefois qu'un règlement sans inspecteurs pour le faire appliquer reste une déclaration d'intention.",
          stem: "Quelle réserve expriment les associations de locataires ?",
          options: ["Le règlement pénalise surtout les locataires", "Les propriétaires n'ont pas été consultés", "Les moyens de contrôle manquent", "Les loyers vont augmenter à cause du règlement"],
          answer: 2,
          rationale: "Tests inferring the reservation from the image of a rule without inspectors; propriétaires and locataires both appear in the script but answer a different question.",
        },
        {
          id: "tcf-co-24",
          audioPath: "tcf-co/tcf-co-24.mp3",
          level: "B2",
          speakers: 2,
          content: "— Votre candidature nous a intéressés, mais le poste suppose de se déplacer une semaine par mois.\n— Ce n'est pas un obstacle en soi. En revanche, j'aimerais savoir si ces déplacements sont planifiés à l'avance, parce que j'ai des obligations familiales fixes le mercredi.",
          stem: "Quelle est la réaction du candidat ?",
          options: ["Il refuse les déplacements proposés", "Il demande une augmentation de salaire", "Il propose de travailler entièrement à distance depuis chez lui", "Il accepte, sous réserve d'un calendrier prévisible"],
          answer: 3,
          rationale: "Tests a qualified acceptance signalled by pas un obstacle en soi and en revanche; nothing is refused, and salary and remote work are never raised.",
        },
        {
          id: "tcf-co-25",
          audioPath: "tcf-co/tcf-co-25.mp3",
          level: "B2",
          speakers: 2,
          content: "— Alors, ce cours du soir ?\n— Le contenu est excellent, vraiment. Mais franchement, trois heures de cours après une journée de travail, j'ai fini par remarquer que je ne retiens à peu près que la première heure. Je vais peut-être passer au format du samedi matin.",
          stem: "Pourquoi la personne envisage-t-elle de changer de format ?",
          options: ["Le contenu du cours ne lui convient pas vraiment", "Sa concentration baisse au fil de la soirée", "Le cours revient trop cher pour elle", "Le professeur va être remplacé"],
          answer: 1,
          rationale: "Tests inferring a cause from je ne retiens que la première heure; the speaker praises the content, and cost and staffing are never mentioned.",
        },
        {
          id: "tcf-co-26",
          audioPath: "tcf-co/tcf-co-26.mp3",
          level: "B2",
          speakers: 1,
          content: "On répète souvent que les jeunes lisent de moins en moins. Les chiffres montrent surtout qu'ils lisent autrement : moins de livres imprimés, beaucoup plus de textes en ligne. Ce qui recule, ce n'est donc pas la lecture, c'est un certain support.",
          stem: "Que veut dire le journaliste ?",
          options: ["Les jeunes lisent de moins en moins", "Les jeunes préfèrent toujours les livres imprimés aux écrans", "C'est le support qui change, pas la lecture elle-même", "La lecture en ligne est de moins bonne qualité"],
          answer: 2,
          rationale: "Tests the corrective structure ce n'est pas X, c'est Y; the first distractor repeats the received idea the speaker is refuting, and no judgement on quality is made.",
        },
        {
          id: "tcf-co-27",
          audioPath: "tcf-co/tcf-co-27.mp3",
          level: "B2",
          speakers: 1,
          content: "J'ai relu ton rapport hier soir. C'est solide, les données tiennent, et la méthode est claire. Je te dirai simplement une chose : ta recommandation arrive à la page onze. Personne, au comité, ne lira jusque-là.",
          stem: "Que reproche la personne au rapport ?",
          options: ["La recommandation apparaît trop tard dans le texte", "Les données sont contestables", "Le rapport est beaucoup trop court", "Le style est beaucoup trop technique pour les membres du comité"],
          answer: 0,
          rationale: "Tests understanding an implied criticism of structure; the script explicitly praises the data, and length and style are never criticised.",
        },
        {
          id: "tcf-co-28",
          audioPath: "tcf-co/tcf-co-28.mp3",
          level: "B2",
          speakers: 1,
          content: "La ville a inauguré hier sa première piste cyclable protégée. Le maire y voit un signal fort en faveur des déplacements actifs. Les commerçants du quartier, eux, comptent surtout les places de stationnement disparues. Un premier bilan de fréquentation est attendu au printemps.",
          stem: "Quelle est la position des commerçants du quartier ?",
          options: ["Ils soutiennent pleinement le projet du maire", "Ils attendent le bilan de fréquentation du printemps", "Ils réclament la construction d'une deuxième piste", "Ils regrettent la perte de places de stationnement"],
          answer: 3,
          rationale: "Tests attributing a stance to the right group in a report with several actors; the bilan belongs to the city's timeline and the support belongs to the mayor.",
        },
        {
          id: "tcf-co-29",
          audioPath: "tcf-co/tcf-co-29.mp3",
          level: "B2",
          speakers: 2,
          content: "— Vous nous dites donc que le délai de six semaines ne pose pas de problème.\n— Je dis que ce délai est tenable si les pièces arrivent en une seule livraison. Avec deux livraisons séparées, je ne m'engage sur rien.",
          stem: "Que précise le fournisseur ?",
          options: ["Le délai de six semaines est impossible à tenir", "Son engagement dépend du mode de livraison", "Il demande six semaines supplémentaires", "Il refuse finalement de livrer les pièces"],
          answer: 1,
          rationale: "Tests a correction that reframes rather than contradicts; the supplier does not declare the deadline impossible, ask for more time, or refuse the order.",
        },
        {
          id: "tcf-co-30",
          audioPath: "tcf-co/tcf-co-30.mp3",
          level: "C1",
          speakers: 1,
          content: "Quand on me demande si l'automatisation va supprimer des emplois, je réponds toujours par une autre question : lesquels, et pour qui ? Historiquement, les métiers ne disparaissent pas d'un bloc ; ce sont des tâches qui migrent, d'un poste à un autre, parfois d'un secteur à un autre. Le problème n'est donc pas l'ampleur du changement, mais sa vitesse. Une génération peut absorber une transformation de cette nature. Un trimestre ne le peut pas.",
          stem: "Quel est le point central de l'argumentation ?",
          options: ["L'automatisation supprimera la majorité des emplois", "Les métiers manuels sont les plus directement menacés", "Le rythme du changement importe plus que son ampleur", "Les transformations passées se sont faites sans difficulté"],
          answer: 2,
          rationale: "Tests identifying a thesis carried by a ce n'est pas X mais Y structure; the distractors state the alarmist claim the speaker declines, a category he never names, and a reassurance he never gives.",
        },
        {
          id: "tcf-co-31",
          audioPath: "tcf-co/tcf-co-31.mp3",
          level: "C1",
          speakers: 1,
          content: "Je vous remercie de cette proposition, qui témoigne d'une réelle réflexion et d'un vrai travail de terrain. Vous comprendrez néanmoins que le conseil, à ce stade de l'exercice budgétaire, ne puisse retenir un projet dont le financement repose sur des recettes encore hypothétiques. Revenez nous voir en janvier.",
          stem: "Quelle est la réponse du conseil ?",
          options: ["Un refus poli, assorti d'une invitation à revenir", "Une acceptation de principe sous conditions techniques", "Un rejet définitif et sans appel du projet", "Une demande de révision complète du montage financier"],
          answer: 0,
          rationale: "Tests reading formal register where the refusal is carried by néanmoins and a subjunctive; nothing is accepted, the invitation for January rules out finality, and no revision is requested.",
        },
        {
          id: "tcf-co-32",
          audioPath: "tcf-co/tcf-co-32.mp3",
          level: "C1",
          speakers: 1,
          content: "Ce que j'entends dans ce débat, ce sont deux définitions du mot intégration qui ne se rencontrent jamais. Pour les uns, c'est un résultat que l'on mesure : l'emploi, la langue, le logement. Pour les autres, c'est un processus, qui suppose que la société d'accueil bouge elle aussi. Tant que nous ne dirons pas de quoi nous parlons, nous continuerons à nous indigner en croyant nous répondre.",
          stem: "Que critique l'intervenant ?",
          options: ["Le manque de données fiables sur l'emploi, la langue et le logement", "L'absence de volonté des personnes concernées", "La lenteur des politiques publiques en la matière", "Le fait que les interlocuteurs n'emploient pas le mot dans le même sens"],
          answer: 3,
          rationale: "Tests grasping a meta-level criticism about vocabulary rather than policy; emploi and logement appear only as one camp's indicators, and neither slowness nor individual willingness is discussed.",
        },
        {
          id: "tcf-co-33",
          audioPath: "tcf-co/tcf-co-33.mp3",
          level: "C1",
          speakers: 2,
          content: "— Vous avez passé dix ans dans ce service. Vous partez sans regret ?\n— Sans regret, ce serait beaucoup dire. Disons que j'ai fini par comprendre que ce qui me retenait n'était plus le travail, mais les gens. Et cela, on peut le garder en partant.",
          stem: "Quelle est l'attitude de la personne qui part ?",
          options: ["Elle est amère envers ses anciens collègues", "Elle part avec une nostalgie mesurée", "Elle regrette d'avoir donné sa démission", "Elle se montre indifférente à ce départ"],
          answer: 1,
          rationale: "Tests attitude in an understated answer that neither denies nor dramatises regret; the colleagues are named warmly, and ce serait beaucoup dire rules out indifference.",
        },
        {
          id: "tcf-co-34",
          audioPath: "tcf-co/tcf-co-34.mp3",
          level: "C1",
          speakers: 1,
          content: "On oppose volontiers la formation courte, qui rendrait immédiatement employable, et la formation longue, accusée d'être trop théorique. L'expérience des dix dernières années invite à la prudence : les compétences très ciblées se périment vite, précisément parce qu'elles collent au marché du moment. Ce qui résiste, au fond, ce n'est pas le savoir technique lui-même, c'est la capacité à en réapprendre un autre.",
          stem: "Quelle est la thèse défendue ?",
          options: ["Les formations courtes sont finalement plus efficaces", "Les formations longues garantissent l'accès à un emploi stable", "La capacité à réapprendre compte plus qu'une compétence ciblée", "Le marché du travail évolue en réalité très peu"],
          answer: 2,
          rationale: "Tests separating the opposition the speaker reports from the position he defends; the first two options restate the two camps he holds at a distance, and the last contradicts the script.",
        },
        {
          id: "tcf-co-35",
          audioPath: "tcf-co/tcf-co-35.mp3",
          level: "C1",
          speakers: 1,
          content: "Le rapport annuel se félicite d'une baisse des plaintes de dix-huit pour cent. On aimerait sincèrement partager cet enthousiasme. Encore faudrait-il savoir si les usagers se plaignent moins parce que le service s'est amélioré, ou parce que le formulaire de plainte a changé d'adresse trois fois en un an.",
          stem: "Quelle est l'attitude du commentateur ?",
          options: ["Il félicite l'organisme pour ses résultats", "Il conteste l'exactitude du chiffre de dix-huit pour cent", "Il propose de supprimer le formulaire de plainte", "Il met en doute l'interprétation de ce chiffre"],
          answer: 3,
          rationale: "Tests a sceptical stance signalled by on aimerait and encore faudrait-il; he never disputes the figure itself, only what it is taken to prove.",
        },
        {
          id: "tcf-co-36",
          audioPath: "tcf-co/tcf-co-36.mp3",
          level: "C2",
          speakers: 1,
          content: "Il y a une élégance certaine dans la manière dont ce ministère annonce ses réformes : jamais un mot plus haut que l'autre, jamais un chiffre qui fâche, et toujours cette formule, à moyens constants, qui a le mérite de tout dire à ceux qui savent l'entendre. On nous promet donc davantage de services, dans les mêmes locaux, avec les mêmes équipes, et sans doute la même patience de la part des usagers. Le vocabulaire, lui, s'est considérablement enrichi.",
          stem: "Quelle est la position du locuteur ?",
          options: ["Il ironise sur une réforme annoncée sans moyens supplémentaires", "Il admire la clarté et la sobriété de la communication ministérielle", "Il annonce le recrutement prochain de nouveaux agents", "Il regrette la complexité du vocabulaire administratif"],
          answer: 0,
          rationale: "Tests sustained irony where praise words carry criticism; élégance and vocabulaire enrichi are the ironic vehicle, and the script says staff and premises are unchanged.",
        },
        {
          id: "tcf-co-37",
          audioPath: "tcf-co/tcf-co-37.mp3",
          level: "C2",
          speakers: 1,
          content: "Mon voisin m'explique chaque samedi que les jeunes ne veulent plus travailler. Il tient cette certitude de son père, qui la tenait déjà du sien. Ce qui me trouble, ce n'est pas qu'il ait tort — sur un point ou deux, il a d'ailleurs moins tort qu'il ne le croit lui-même — c'est qu'une phrase transmise sur trois générations continue d'être présentée comme le fruit d'une observation personnelle.",
          stem: "Que reproche le locuteur à son voisin ?",
          options: ["De ne jamais travailler le samedi", "De critiquer injustement son propre père et son grand-père", "De présenter un lieu commun hérité comme une observation personnelle", "De se tromper entièrement sur la jeunesse d'aujourd'hui et sur le travail"],
          answer: 2,
          rationale: "Tests a stance placed inside a concession: the speaker grants the neighbour is partly right, so the total-error option is excluded, and samedi and père are script words answering a different question.",
        },
        {
          id: "tcf-co-38",
          audioPath: "tcf-co/tcf-co-38.mp3",
          level: "C2",
          speakers: 1,
          content: "Nous avons évalué ce programme selon les critères que le programme s'était lui-même fixés. Il les remplit, naturellement. La question que personne n'a posée en commission est de savoir si ces critères mesuraient autre chose que la capacité de l'administration à produire les documents attendus dans les délais attendus. On me dira que c'est déjà quelque chose ; je veux bien le croire. Ce n'est pas ce que nous avions promis aux familles.",
          stem: "Quelle critique l'oratrice formule-t-elle ?",
          options: ["L'administration a rendu ses documents avec beaucoup de retard cette année", "L'évaluation valide une conformité de procédure, non un résultat réel", "Les familles concernées n'ont pas été consultées par la commission", "Le programme n'a atteint aucun des critères qui lui étaient fixés"],
          answer: 1,
          rationale: "Tests a circularity argument stated obliquely; the script says the criteria are met and the deadlines respected, and the families are invoked as the promise, not as an unconsulted party.",
        },
        {
          id: "tcf-co-39",
          audioPath: "tcf-co/tcf-co-39.mp3",
          level: "C2",
          speakers: 1,
          content: "On célèbre le retour de l'usine comme on célébrerait un fils prodigue. Trois cents emplois, annonce le communiqué ; deux cents, précise la note en bas de page, pour la première année. J'ajoute, sans malice, que la même municipalité expliquait il y a huit ans que l'avenir de la région ne passait plus par l'industrie. Je ne lui reproche pas d'avoir changé d'avis. Je lui reproche de n'avoir jamais changé de ton.",
          stem: "Quel est le reproche final du locuteur ?",
          options: ["La municipalité a menti sur le nombre d'emplois créés la première année", "L'usine n'ouvrira finalement pas ses portes cette année", "La région aurait dû rester industrielle depuis le début", "La municipalité affirme ses revirements avec la même assurance"],
          answer: 3,
          rationale: "Tests a final reproach placed in the contrast between changer d'avis and changer de ton; the job figures are reported without accusing anyone of lying, and the speaker takes no side on industrial policy.",
        },
      ],
    },
    {
      kind: 'comprehension',
      id: 'comprehension-ecrite',
      skill: 'reading',
      name: { en: 'Reading comprehension', fr: 'Compréhension écrite' },
      // Published: 60 minutes for the épreuve. FEI, TCF Canada page.
      timeLimitSec: 60 * 60,
      scaleId: 'ce699',
      delivery: {
        audioPlaysOnce: false,
        questionAfterAudio: false,
        transcriptDuringSection: false,
        // The whole section at once, as in the real épreuve: the candidate
        // budgets their own time across 39 items.
        presentation: 'all_at_once',
        clock: 'section',
        answersLockedOnAnswer: false,
        feedbackDuringSection: false,
      },
      provenance: {
        en: 'Every item in this section was written for this product, to the published format — 39 questions, ordered by progressive difficulty — and no real exam question is reproduced. The A1-to-C2 banding is ours: the exam publishes that difficulty rises across the section and does not publish which item sits at which level.',
        fr: "Tous les items de cette épreuve ont été rédigés pour ce produit, selon le format publié — 39 questions, à difficulté progressive — sans reproduire aucune question réelle d'examen. Le classement A1 à C2 est le nôtre : l'examen indique que la difficulté augmente, sans publier le niveau de chaque item.",
      },
      items: [
        {
          id: "tcf-ce-01",
          level: "A1",
          content: "Ascenseur en panne. Merci d'utiliser l'escalier.",
          stem: "Que doivent faire les personnes qui lisent cet avis ?",
          options: ["Réparer l'ascenseur", "Prendre l'escalier", "Attendre le technicien", "Sortir de l'immeuble"],
          answer: 1,
          rationale: "Tests literal comprehension of a single instruction; the distractors all name reactions that would be reasonable in real life but that the notice never asks for.",
        },
        {
          id: "tcf-ce-02",
          level: "A1",
          content: "À conserver au réfrigérateur après ouverture.",
          stem: "Que faut-il faire du produit une fois ouvert ?",
          options: ["Le mettre au réfrigérateur", "Le congeler", "Le jeter le jour même", "Le laisser à la lumière"],
          answer: 0,
          rationale: "Tests recognition of a storage instruction on a label; freezing and discarding are plausible food-handling actions in general but the label prescribes refrigeration only.",
        },
        {
          id: "tcf-ce-03",
          level: "A1",
          content: "Bibliothèque fermée le lundi. Ouverte du mardi au dimanche.",
          stem: "Quel jour la bibliothèque est-elle fermée ?",
          options: ["Le samedi", "Le mardi", "Le dimanche", "Le lundi"],
          answer: 3,
          rationale: "Tests reading of a simple opening-hours notice; Sunday is the day a reader would guess from general habit, and Tuesday and Saturday are days explicitly covered by the open period.",
        },
        {
          id: "tcf-ce-04",
          level: "A1",
          content: "Voie réservée aux piétons. Vélos interdits.",
          stem: "Qui peut circuler sur cette voie ?",
          options: ["Les cyclistes", "Les voitures", "Les piétons", "Personne"],
          answer: 2,
          rationale: "Tests understanding of a permission-plus-prohibition sign; the cyclist option reverses the prohibition, cars are never mentioned, and the sign does not close the lane to everyone.",
        },
        {
          id: "tcf-ce-05",
          level: "A2",
          content: "Bonjour Madame Roy, votre colis est arrivé ce matin, mais vous étiez absente. Je l'ai laissé chez le gardien, au rez-de-chaussée. Il travaille jusqu'à dix-neuf heures. Si vous ne pouvez pas passer aujourd'hui, il le gardera jusqu'à samedi. Bonne journée.",
          stem: "Où se trouve le colis ?",
          options: ["Devant la porte de Madame Roy", "Chez le gardien de l'immeuble", "Au bureau de poste", "Chez une voisine du premier étage"],
          answer: 1,
          rationale: "Tests locating one factual detail in a short message; the post office is the answer general experience suggests, while the door and the neighbour are plausible alternatives the note excludes.",
        },
        {
          id: "tcf-ce-06",
          level: "A2",
          content: "Ligne 12 — travaux du 3 au 17 mars. Pendant cette période, les bus ne desservent pas l'arrêt Hôpital Sud. Un service de remplacement part de la gare toutes les vingt minutes, de six heures à vingt et une heures. Les billets restent valables.",
          stem: "Qu'est-ce qui change pendant les travaux ?",
          options: ["L'arrêt Hôpital Sud n'est plus desservi", "Les billets doivent être achetés à la gare", "Les bus circulent pendant la nuit", "La ligne 12 est supprimée jusqu'en avril"],
          answer: 0,
          rationale: "Tests extraction of the single change announced in a service notice; the other options contradict the stated ticket validity, the stated hours, and the stated dates.",
        },
        {
          id: "tcf-ce-07",
          level: "A2",
          content: "Mode d'emploi : avant la première utilisation, rincez le réservoir à l'eau claire. Remplissez-le sans dépasser le repère. Branchez l'appareil et attendez que le voyant vert s'allume avant d'appuyer sur le bouton. N'utilisez jamais de produit nettoyant à l'intérieur du réservoir.",
          stem: "Quand peut-on appuyer sur le bouton ?",
          options: ["Dès que l'appareil est branché", "Avant de remplir le réservoir", "Lorsque le voyant vert est allumé", "Après avoir ajouté un produit nettoyant"],
          answer: 2,
          rationale: "Tests the order of steps in a set of instructions; each distractor picks up a real element of the text (plugging in, filling, cleaning product) but places it at the wrong point in the sequence.",
        },
        {
          id: "tcf-ce-08",
          level: "A2",
          content: "À louer : studio meublé de 28 m², cinquième étage sans ascenseur, proche de l'université. Loyer 620 euros par mois, charges comprises. Libre à partir du 1er septembre. Visites le samedi uniquement. Animaux non acceptés. Écrire à l'adresse indiquée ; pas d'appels téléphoniques.",
          stem: "Que peut faire une personne intéressée par ce logement ?",
          options: ["Téléphoner en semaine", "Emménager dès le mois d'août", "Venir visiter avec son chat", "Visiter le studio un samedi"],
          answer: 3,
          rationale: "Tests reading of the conditions in a small ad; the three wrong options each contradict an explicit restriction on phone calls, availability date, and animals.",
        },
        {
          id: "tcf-ce-09",
          level: "A2",
          content: "Avis aux patients : à partir du 5 avril, les rendez-vous se prennent en ligne ou par téléphone entre huit heures et midi. L'accueil ne prend plus de rendez-vous sur place. Les urgences sont reçues sans rendez-vous, mais l'attente peut dépasser deux heures.",
          stem: "Comment un patient peut-il obtenir un rendez-vous après le 5 avril ?",
          options: ["En se présentant à l'accueil", "En téléphonant le matin", "En téléphonant l'après-midi", "En passant par les urgences"],
          answer: 1,
          rationale: "Tests a detail restricted by a time window; the afternoon option is a near-miss on the stated hours, the reception desk is explicitly ruled out, and emergencies are mentioned but do not give a rendez-vous.",
        },
        {
          id: "tcf-ce-10",
          level: "A2",
          content: "Chers collègues, la réunion du jeudi est déplacée au vendredi, à 14 h, salle B. Merci d'apporter vos chiffres du mois. Ceux qui travaillent à distance recevront un lien la veille. La salle A reste réservée à la formation des nouveaux employés.",
          stem: "Que reçoivent les employés qui ne viennent pas au bureau ?",
          options: ["Les chiffres du mois", "Une invitation en salle A", "Un lien envoyé le jeudi", "Une formation le vendredi"],
          answer: 2,
          rationale: "Tests a small calculation from the text (the meeting is Friday, so \"la veille\" is Thursday); the other options recycle details that appear in the note but answer a different question.",
        },
        {
          id: "tcf-ce-11",
          level: "B1",
          content: "Objet : entretien du chauffage. Chers résidents, le remplacement de la chaudière commencera le lundi 6 octobre et durera environ cinq jours. Pendant les travaux, l'eau chaude sera coupée de neuf heures à seize heures, mais le chauffage continuera de fonctionner normalement. Les techniciens auront besoin d'accéder à la cave, dont la porte restera ouverte pendant la journée. Nous vous conseillons de ne pas y laisser d'objets personnels durant cette semaine. Aucune augmentation de charges n'est prévue cette année : les travaux sont financés par le fonds de réserve constitué depuis 2019.",
          stem: "Pourquoi les résidents doivent-ils faire attention à la cave ?",
          options: ["Parce qu'elle sera inondée pendant les travaux", "Parce que le chauffage y sera coupé", "Parce qu'elle servira à stocker la nouvelle chaudière", "Parce qu'elle restera ouverte toute la journée"],
          answer: 3,
          rationale: "Tests the inference linking an open door to the advice about personal belongings; the flooding and storage options invent details, and the heating option reverses what the email says about heating continuing.",
        },
        {
          id: "tcf-ce-12",
          level: "B1",
          content: "Je fais le trajet domicile-travail à vélo depuis huit mois, sur onze kilomètres. On m'avait dit que je tiendrais deux semaines. En réalité, ce qui m'a fait tenir, ce n'est ni la forme ni les économies : c'est de savoir exactement à quelle heure j'arriverai. En voiture, je perdais entre vingt et cinquante minutes selon la circulation ; à vélo, c'est toujours trente-cinq minutes. Je ne dis pas que c'est agréable en février. Mais quand on organise sa journée, la régularité vaut plus que le confort.",
          stem: "Quel avantage l'auteur met-il en avant ?",
          options: ["La durée du trajet est prévisible", "Le vélo est toujours plus rapide que la voiture", "Le vélo lui permet de faire des économies", "Le trajet à vélo est plus agréable qu'en voiture"],
          answer: 0,
          rationale: "Tests identification of the writer's main point against three widely believed claims about cycling that the text explicitly rejects or does not support.",
        },
        {
          id: "tcf-ce-13",
          level: "B1",
          content: "Depuis janvier, la ville met à disposition des bacs de compostage dans les cours d'immeubles qui en font la demande. Le service est gratuit, mais il exige qu'un résident accepte d'être formé et de surveiller le bac. C'est ce point qui bloque : sur les quatre-vingt-dix demandes reçues, quarante-deux n'ont pas abouti faute de volontaire. La municipalité étudie donc l'idée de rémunérer ces référents, comme cela se fait pour le gardiennage. Une décision sera prise avant la fin de l'année.",
          stem: "Pourquoi près de la moitié des demandes n'ont-elles pas abouti ?",
          options: ["Le service est devenu payant", "Aucun habitant n'a accepté de s'occuper du bac", "La ville manquait de bacs disponibles", "Les immeubles concernés n'avaient pas de cour"],
          answer: 1,
          rationale: "Tests the cause–effect link expressed by \"faute de volontaire\"; cost, supply shortages and unsuitable buildings are ordinary explanations for such failures but none is given in the text.",
        },
        {
          id: "tcf-ce-14",
          level: "B1",
          content: "À compter du 2 mai, l'accès aux locaux se fera uniquement par badge nominatif. Les anciennes cartes magnétiques cesseront de fonctionner le même jour. Chaque employé doit récupérer son badge auprès du service des ressources humaines, muni d'une pièce d'identité, avant le 30 avril. Les personnes en congé à cette date pourront le faire à leur retour ; l'accueil leur remettra un badge temporaire valable une journée. En cas de perte, le remplacement est facturé quinze euros à partir du deuxième badge perdu.",
          stem: "Que se passe-t-il si un employé perd son badge pour la première fois ?",
          options: ["Il doit payer quinze euros", "Il peut utiliser son ancienne carte magnétique", "Le remplacement ne lui est pas facturé", "Il ne peut plus accéder aux locaux"],
          answer: 2,
          rationale: "Tests the implication of \"à partir du deuxième badge perdu\"; the fifteen-euro option is the trap of applying the figure too early, and the other two contradict statements in the notice.",
        },
        {
          id: "tcf-ce-15",
          level: "B1",
          content: "Bonjour, votre inscription au module « Rédaction professionnelle » est enregistrée pour la session du 12 juin. Attention : cette session se déroule entièrement en ligne, contrairement à ce qui figurait dans le catalogue papier. Un lien de connexion vous parviendra quarante-huit heures avant. Si vous préférez la formule en présentiel, une session est prévue en octobre, mais les places sont attribuées par ordre d'inscription et il n'en reste que six. Merci de nous répondre avant vendredi pour confirmer votre choix.",
          stem: "Quelle information le catalogue papier donnait-il de façon inexacte ?",
          options: ["La date de la session de juin", "Le nombre de places disponibles", "Le nom du module", "Le mode de déroulement de la session"],
          answer: 3,
          rationale: "Tests what \"contrairement à ce qui figurait dans le catalogue\" refers back to; the date, the number of places and the module title all appear in the email but none is presented as an error.",
        },
        {
          id: "tcf-ce-16",
          level: "B1",
          content: "La bibliothèque municipale ouvrira désormais jusqu'à vingt-deux heures du lundi au jeudi. La mesure répond à une demande ancienne des étudiants, qui trouvaient porte close dès dix-neuf heures. Elle a toutefois été rendue possible par un argument différent : les relevés de fréquentation montrent que les salles restaient à moitié vides l'après-midi, ce qui a permis de déplacer des heures de personnel plutôt que d'en créer. Aucun poste supplémentaire n'a donc été financé. Les week-ends, les horaires demeurent inchangés.",
          stem: "Comment l'extension des horaires a-t-elle été rendue possible ?",
          options: ["Par une réorganisation du temps de travail existant", "Par l'embauche de personnel supplémentaire", "Par une subvention obtenue grâce aux étudiants", "Par la fermeture de la bibliothèque le week-end"],
          answer: 0,
          rationale: "Tests the distinction the text draws between the demand for the measure and the argument that made it feasible; hiring is explicitly denied, and the grant and weekend closure are inventions built on real elements of the text.",
        },
        {
          id: "tcf-ce-17",
          level: "B1",
          content: "Bonjour à tous. J'arrive dans trois semaines et je m'inquiète pour la couverture santé. D'après ce que j'ai lu, l'inscription au régime public n'est pas immédiate : il faut d'abord une adresse et un numéro qui met parfois plusieurs semaines à être délivré. Certains conseillent une assurance privée temporaire pour cette période, d'autres disent que c'est de l'argent perdu. Ceux qui sont passés par là : avez-vous eu des frais médicaux pendant ce délai ? Je voyage avec un enfant en bas âge, c'est surtout cela qui m'inquiète.",
          stem: "Que demande précisément l'auteur du message ?",
          options: ["Le nom d'une assurance privée fiable", "La liste des documents à fournir pour s'inscrire", "Le témoignage de personnes ayant vécu ce délai", "L'adresse d'un médecin pour les jeunes enfants"],
          answer: 2,
          rationale: "Tests recognition of the actual request rather than of the surrounding topics; private insurance, registration documents and the child are all mentioned but none of them is what the writer asks for.",
        },
        {
          id: "tcf-ce-18",
          level: "B1",
          content: "En raison de la réfection du pont, l'avenue des Ormes sera fermée à la circulation automobile du 8 au 29 juillet. Les piétons et les cyclistes pourront continuer d'emprunter le trottoir nord, élargi pour l'occasion. Une déviation par la rue Mercier est mise en place ; elle ajoute environ sept minutes au trajet aux heures creuses, davantage le matin. Les livraisons aux commerces de l'avenue restent autorisées entre cinq et sept heures. Les riverains ont reçu une autorisation spécifique par courrier.",
          stem: "Que peut-on déduire au sujet de la déviation ?",
          options: ["Elle est réservée aux riverains", "Elle fait perdre plus de sept minutes aux heures de pointe", "Elle est interdite aux véhicules de livraison", "Elle raccourcit le trajet de sept minutes"],
          answer: 1,
          rationale: "Tests the inference carried by \"davantage le matin\"; the last option reverses the direction of the figure and the other two misapply the separate rules given for residents and deliveries.",
        },
        {
          id: "tcf-ce-19",
          level: "B1",
          content: "Une chaîne de supermarchés a retiré les emballages plastiques de trente fruits et légumes. Les premiers résultats sont contrastés. Les pertes ont augmenté de six pour cent sur les produits fragiles, comme les fraises, mais elles ont diminué sur les pommes et les carottes, que les clients achètent désormais à l'unité et en plus petite quantité. Le responsable du projet reconnaît qu'il n'avait pas anticipé ce second effet : « Nous pensions parler d'emballage ; nous avons en fait changé la façon dont les gens font leurs courses. »",
          stem: "Qu'est-ce que le responsable du projet n'avait pas prévu ?",
          options: ["L'augmentation des pertes sur les fruits fragiles", "Le refus des clients d'acheter sans emballage", "La hausse du prix des fruits et légumes", "La modification des habitudes d'achat des clients"],
          answer: 3,
          rationale: "Tests identification of what \"ce second effet\" designates; the increase in losses is the first effect, and the customer refusal and price rise are plausible outcomes the text never reports.",
        },
        {
          id: "tcf-ce-20",
          level: "B2",
          content: "Une enquête menée auprès de quatre mille salariés de bureau apporte une nuance utile au débat sur le travail à distance. Interrogés sur leur propre productivité, les répondants se déclarent massivement plus efficaces chez eux : soixante-douze pour cent l'affirment. Mais lorsqu'on leur demande d'évaluer celle de leurs collègues placés dans la même situation, la proportion tombe à trente et un pour cent. Les auteurs se gardent de trancher : ils rappellent qu'aucune des deux réponses ne mesure la productivité réelle, faute d'indicateurs communs aux métiers étudiés. Ce qu'elles mesurent, en revanche, est plus intéressant : l'écart entre la confiance que l'on s'accorde et celle que l'on accorde aux autres. Les entreprises qui ont rétabli une présence obligatoire justifient rarement leur décision par des chiffres de performance ; elles invoquent la cohésion, la formation des nouveaux arrivants, parfois le coût de locaux inoccupés. L'enquête suggère qu'elles répondent surtout à un doute, et que ce doute est largement partagé par les salariés eux-mêmes.",
          stem: "Selon le texte, que révèle principalement cette enquête ?",
          options: ["Un décalage entre le jugement porté sur soi et celui porté sur les autres", "Que les salariés sont réellement plus productifs à domicile", "Que les entreprises disposent de chiffres précis sur la performance", "Que la majorité des salariés souhaitent revenir au bureau"],
          answer: 0,
          rationale: "Tests the reader's grasp of what the authors say the figures actually measure; the second option takes the self-reports at face value against the text's warning, and the last two contradict statements about the absence of performance figures and about employers rather than employees.",
        },
        {
          id: "tcf-ce-21",
          level: "B2",
          content: "Note interne — remboursement des frais professionnels. À la suite de l'audit du premier trimestre, la procédure évolue au 1er septembre. Les justificatifs devront être déposés dans l'outil en ligne dans les quinze jours suivant la dépense, et non plus à la fin du mois. Cette réduction du délai n'est pas une mesure de défiance : l'audit a montré que les retards de traitement venaient pour l'essentiel de justificatifs transmis tardivement, souvent illisibles, que la comptabilité devait réclamer une seconde fois. Le plafond des repas reste inchangé. En revanche, les trajets en taxi ne seront plus remboursés lorsqu'une solution de transport collectif existe et que le déplacement a lieu entre sept et vingt heures ; les exceptions, comme le port de matériel lourd ou un motif de sécurité, devront être signalées au moment du dépôt et non a posteriori. Les responsables d'équipe recevront un récapitulatif mensuel des dépenses de leur service.",
          stem: "Quelle raison la note donne-t-elle au raccourcissement du délai ?",
          options: ["Une baisse du budget consacré aux frais professionnels", "Une suspicion de fraude constatée lors de l'audit", "La lenteur de traitement provoquée par les envois tardifs", "Une demande formulée par les responsables d'équipe"],
          answer: 2,
          rationale: "Tests reading of a stated justification against the sentence that explicitly denies mistrust; budget cuts and managers' requests are plausible motives in such memos but appear nowhere in the text.",
        },
        {
          id: "tcf-ce-22",
          level: "B2",
          content: "On répète que les écrans ont envahi les salles de classe. Il faudrait d'abord s'entendre sur ce que l'on compte. Une tablette utilisée vingt minutes pour un exercice de langue et un ordinateur allumé toute la journée au fond de la classe ne relèvent pas du même phénomène, mais les enquêtes les additionnent volontiers. Le débat public s'organise ensuite autour de deux camps également pressés : ceux qui voient dans l'outil numérique la promesse d'un enseignement individualisé, et ceux qui y voient la cause de tous les décrochages. Les uns et les autres se dispensent d'une question moins spectaculaire : que fait l'enseignant pendant ce temps ? Les rares travaux qui l'ont posée observent que les effets mesurés dépendent moins du matériel que de la préparation de la séance. Autrement dit, on discute d'un objet là où il faudrait discuter d'un métier. Ce déplacement arrange tout le monde : il est plus simple d'acheter ou d'interdire des appareils que de financer du temps de formation.",
          stem: "Quel reproche l'auteur adresse-t-il aux deux camps du débat ?",
          options: ["Ils exagèrent le nombre d'écrans présents dans les classes", "Ils négligent le rôle joué par l'enseignant", "Ils refusent de financer l'achat de matériel", "Ils s'appuient sur des travaux de recherche trop rares"],
          answer: 1,
          rationale: "Tests identification of the common blind spot the writer names; the counting problem belongs to the surveys rather than to the two camps, and the funding and research options distort details from the text.",
        },
        {
          id: "tcf-ce-23",
          level: "B2",
          content: "Longtemps épargnées, les villes moyennes connaissent à leur tour une tension sur le logement. Le phénomène ne s'explique pas d'abord par la démographie : dans plusieurs d'entre elles, la population stagne. Ce qui a changé, c'est la composition des ménages et l'usage des logements. Les séparations, le vieillissement et le maintien à domicile produisent davantage de foyers d'une ou deux personnes occupant des logements conçus pour quatre. À cela s'ajoute la conversion d'appartements en locations de courte durée dans les centres anciens, marginale en volume mais concentrée sur les biens les plus recherchés. Les élus disposent de peu de leviers rapides : la construction neuve suppose des délais de cinq à sept ans, et les terrains disponibles se situent en périphérie, loin des services que ces ménages recherchent précisément. Certaines municipalités misent donc sur la remise en location de logements vacants, dont le nombre dépasse parfois celui des demandeurs. Encore faut-il convaincre des propriétaires que la vacance n'a pas découragés jusqu'ici.",
          stem: "D'après le texte, pourquoi la construction neuve ne règle-t-elle pas le problème ?",
          options: ["Les municipalités n'ont pas le droit de délivrer des permis", "Les habitants s'opposent systématiquement aux nouveaux projets", "Le coût des matériaux a fortement augmenté", "Elle demande des années et les terrains sont mal situés"],
          answer: 3,
          rationale: "Tests retrieval of the two obstacles the text actually names; permit powers, local opposition and material costs are familiar real-world explanations that the passage does not mention.",
        },
        {
          id: "tcf-ce-24",
          level: "B2",
          content: "Procédure d'entretien annuel — évolutions. L'entretien annuel change de forme cette année. Il ne comportera plus de note globale sur cinq. Les responsables devront à la place rédiger une appréciation portant sur trois objectifs définis conjointement en début d'année. Ce choix a été discuté : la note offrait une comparaison rapide entre services, mais l'analyse des trois dernières campagnes montre que quatre-vingts pour cent des salariés recevaient la même note, ce qui rendait l'exercice peu informatif et, pour certains, décourageant. La suppression de la note ne modifie pas le calendrier des augmentations, qui reste arrêté au mois de mars par la direction financière, sur proposition des responsables de service. Il est demandé aux encadrants de ne pas anticiper cette décision au cours de l'entretien : l'expérience montre que les engagements pris à cette occasion sont rarement tenus et pèsent ensuite sur la relation de travail. Une formation de deux heures leur est proposée en janvier ; elle n'est pas obligatoire, mais vivement conseillée.",
          stem: "Pourquoi la note globale a-t-elle été supprimée ?",
          options: ["Parce que les salariés la contestaient collectivement", "Parce qu'elle retardait la décision sur les augmentations", "Parce qu'elle ne distinguait presque personne", "Parce que les responsables refusaient de la remplir"],
          answer: 2,
          rationale: "Tests interpretation of the eighty-per-cent figure as the reason given; the timing of pay rises is mentioned but explicitly left unchanged, and employee protest and manager refusal are never stated.",
        },
        {
          id: "tcf-ce-25",
          level: "B2",
          content: "Chaque automne, les classements d'universités reviennent, et avec eux la même cérémonie : quelques établissements se félicitent, d'autres publient un communiqué expliquant que la méthodologie est discutable. Ils ont raison, mais ils le disent au mauvais moment, c'est-à-dire lorsqu'ils reculent. Le problème n'est pas que ces classements soient faux ; c'est qu'ils mesurent surtout ce qui est facile à compter. Le nombre de publications, les citations, la part d'étudiants étrangers se collectent aisément ; la qualité d'un cours de première année, non. Un établissement rationnel en tire les conséquences et investit là où les points se gagnent. On observe ainsi des universités qui recrutent des chercheurs prestigieux dispensés d'enseigner, tandis que les amphithéâtres de licence restent confiés à des vacataires. Le classement n'a rien imposé : il a simplement rendu certains efforts visibles et d'autres invisibles. C'est le propre de tout indicateur, et c'est pourquoi la question utile n'est pas de savoir qui arrive premier, mais qui a décidé de ce que l'on compte.",
          stem: "Quelle critique principale l'auteur formule-t-il contre les classements ?",
          options: ["Ils orientent les établissements vers ce qui est mesurable", "Ils reposent sur des données volontairement falsifiées", "Ils défavorisent les universités qui accueillent des étrangers", "Ils paraissent à une période défavorable de l'année"],
          answer: 0,
          rationale: "Tests the difference between \"false\" and \"selective\", which the text draws explicitly; the timing option misreads the remark about universities protesting at the wrong moment, and the foreign-student option inverts a criterion listed as easy to count.",
        },
        {
          id: "tcf-ce-26",
          level: "B2",
          content: "L'agglomération a annoncé la gratuité des transports pour les moins de vingt-cinq ans. La mesure est présentée comme sociale ; elle est aussi, plus discrètement, technique. Les contrôles menés sur cette tranche d'âge coûtaient davantage qu'ils ne rapportaient, et les abonnements jeunes étaient déjà subventionnés à hauteur de quatre-vingts pour cent. Le manque à gagner annoncé, deux millions par an, correspond donc surtout à des recettes théoriques. Les critiques portent moins sur le principe que sur le calendrier : la fréquence des lignes de banlieue n'a pas été augmentée, et plusieurs élus craignent que la gratuité n'attire des voyageurs supplémentaires sur un réseau déjà saturé aux heures de pointe. La collectivité répond que les nouveaux usagers voyageront surtout en dehors de ces heures, ce qu'aucune étude locale ne confirme pour l'instant. Le dispositif sera évalué au bout de dix-huit mois ; les indicateurs retenus n'ont pas encore été rendus publics.",
          stem: "Quelle est la principale objection rapportée par le texte ?",
          options: ["La mesure coûtera bien plus que les deux millions annoncés", "La gratuité ne devrait pas être réservée aux jeunes", "Les contrôles deviendront impossibles sur l'ensemble du réseau", "Le réseau risque de ne pas absorber les nouveaux voyageurs"],
          answer: 3,
          rationale: "Tests separation of the objection from the surrounding financial explanation; the cost, the age limit and ticket inspection all appear in the text but none is presented as the critics' argument.",
        },
        {
          id: "tcf-ce-27",
          level: "B2",
          content: "Rappel de produit — cafetière modèle CX-40. Nous procédons au rappel volontaire des cafetières CX-40 vendues entre mars et août. Un défaut d'assemblage du joint peut, dans de rares cas, provoquer une projection d'eau chaude au moment de l'ouverture du couvercle. Aucun accident n'a été signalé à ce jour, mais le nombre d'appareils concernés nous conduit à agir sans attendre. Il vous est demandé de cesser immédiatement l'utilisation de l'appareil et de le rapporter dans le magasin où il a été acheté, muni du ticket de caisse si vous l'avez conservé ; son absence ne fera pas obstacle au remboursement. Le numéro de série figure sous la base. Seuls les numéros commençant par 40B sont visés : les autres appareils de la gamme peuvent être utilisés normalement. Nos équipes en magasin ne sont pas en mesure de réparer l'appareil, et aucun échange contre un modèle équivalent n'est proposé pour l'instant, la production étant suspendue.",
          stem: "Que peut faire un client qui n'a plus son ticket de caisse ?",
          options: ["Faire réparer l'appareil en magasin", "Obtenir tout de même le remboursement", "Échanger l'appareil contre un modèle équivalent", "Continuer à l'utiliser avec précaution"],
          answer: 1,
          rationale: "Tests a concessive clause stating that the missing receipt is not an obstacle; repair, exchange and continued use are each ruled out elsewhere in the notice even though they are normal expectations for a faulty product.",
        },
        {
          id: "tcf-ce-28",
          level: "B2",
          content: "Planter des arbres est devenu le geste climatique le plus consensuel des municipalités. Les effets sur la chaleur urbaine sont réels : un alignement dense peut abaisser de plusieurs degrés la température ressentie en fin d'après-midi. Encore faut-il que l'arbre atteigne l'âge où il produit cet effet. Les relevés effectués dans plusieurs villes montrent qu'un jeune sujet planté en pleine rue a une espérance de vie de sept à dix ans, contre plus d'un siècle dans un parc. La cause n'est pas le climat mais le sol : compacté, salé l'hiver, traversé de réseaux, il ne laisse ni eau ni air aux racines. Les campagnes de plantation qui annoncent des dizaines de milliers d'arbres communiquent rarement sur le taux de reprise. Certaines collectivités préfèrent désormais planter moins et creuser davantage, en réservant à chaque arbre une fosse de plusieurs mètres cubes. Le résultat est moins photogénique la première année ; il se voit à la trentième.",
          stem: "Quelle est la fonction de la dernière phrase du texte ?",
          options: ["Reconnaître que les fosses coûtent trop cher aux communes", "Rappeler que les arbres urbains ne survivent jamais longtemps", "Opposer l'effet d'annonce immédiat au bénéfice à long terme", "Inviter les habitants à planter des arbres eux-mêmes"],
          answer: 2,
          rationale: "Tests the rhetorical role of a closing antithesis rather than its literal content; the cost and the invitation are absent from the text, and the survival option overstates a figure that applies only to street trees.",
        },
        {
          id: "tcf-ce-29",
          level: "B2",
          content: "Le quotidien régional a cessé de paraître en version imprimée. La direction évoque la baisse du lectorat ; les journalistes, eux, insistent sur un autre chiffre : la disparition des petites annonces, qui représentaient encore un tiers des recettes il y a quinze ans et qui ont migré vers des plateformes gratuites. Le site du journal continue, avec une rédaction réduite de moitié. Ce qui disparaît n'est pas seulement un support : c'est la couverture des conseils municipaux des communes de moins de cinq mille habitants, que personne d'autre n'assurait. Des chercheurs ont montré, dans des situations comparables, que le départ du dernier journaliste local s'accompagne d'une baisse de la participation aux élections locales et d'une hausse du coût des emprunts communaux, faute de regard extérieur sur la gestion. Le lien n'est pas mécanique, mais il est constant. On mesure mal ce que coûte une information qui n'existe plus, puisqu'il ne reste personne pour en rendre compte.",
          stem: "Selon les journalistes, quelle est la cause principale de l'arrêt de l'édition imprimée ?",
          options: ["La perte des revenus des petites annonces", "La réduction de moitié de la rédaction", "La baisse de la participation électorale", "Le désintérêt des lecteurs pour l'information locale"],
          answer: 0,
          rationale: "Tests attribution of a cause to the right voice in the text: the fall in readership is management's explanation, the smaller newsroom is a consequence, and lower turnout belongs to the research findings.",
        },
        {
          id: "tcf-ce-30",
          level: "C1",
          content: "On a beaucoup annoncé que le travail à distance viderait les centres-villes. Cinq ans plus tard, le tableau est plus contrarié. Les bureaux se sont bien vidés, mais inégalement : les immeubles récents, bien desservis et dotés d'espaces communs, se relouent presque au même prix qu'avant ; les tours des années soixante-dix, elles, ne trouvent plus preneur. Ce n'est donc pas la demande de bureaux qui s'effondre, c'est sa concentration qui s'accentue. Le second déplacement est moins commenté. Les commerces qui vivaient du déjeuner en semaine ont perdu deux jours de chiffre d'affaires, et ceux qui ont survécu l'ont fait en changeant de clientèle plutôt qu'en attendant le retour des salariés. Dans plusieurs quartiers d'affaires, des sandwicheries ont cédé la place à des services destinés aux résidents. Autrement dit, ces quartiers ne se sont pas dépeuplés : ils se sont mis, lentement, à ressembler à des quartiers ordinaires. Reste que l'on tire de ces observations des conclusions politiques hâtives. Certains y voient la preuve que la ville dense a gagné, d'autres qu'elle a perdu. Les deux lectures partagent le même défaut : elles traitent comme un état stable ce qui n'est qu'une transition, dont le rythme dépend d'échéances très concrètes — la fin des baux de neuf ans, le coût de la rénovation énergétique — plus que d'un changement de préférences.",
          stem: "Quelle position l'auteur adopte-t-il à l'égard des interprétations politiques évoquées à la fin du texte ?",
          options: ["Il donne raison à ceux qui annoncent le déclin de la ville dense", "Il estime que la question est tranchée par les données immobilières", "Il juge que ces lectures reposent sur des chiffres inventés", "Il leur reproche de figer une situation encore en mouvement"],
          answer: 3,
          rationale: "Tests the writer's stance in the concluding paragraph, where he faults both camps for the same reason; the first two options pick a side he refuses to pick, and the third replaces his objection about timing with an accusation of falsification he never makes.",
        },
        {
          id: "tcf-ce-31",
          level: "C1",
          content: "Faut-il limiter les locations de courte durée ? Le débat oppose deux argumentations qui, curieusement, ne se contredisent pas toujours. Les partisans d'un encadrement strict rappellent qu'un logement loué trois cents nuits par an à des visiteurs n'est plus un logement : c'est un hôtel qui n'en porte ni les obligations ni la fiscalité. Ils observent que la pression se concentre sur quelques quartiers, où la part des résidences principales a reculé, et que la disponibilité y détermine désormais les loyers de tout le voisinage. Leurs adversaires ne nient pas ces chiffres. Ils soutiennent en revanche que la cause du renchérissement est ailleurs : dans un déficit de construction accumulé depuis vingt ans, dont la location touristique ne serait qu'un symptôme visible et commode. Interdire, disent-ils, déplacerait le problème sans produire un seul logement supplémentaire, et priverait des propriétaires modestes d'un revenu d'appoint. Le point aveugle est commun aux deux camps. Aucun ne s'interroge sur ce qui se passe après l'interdiction : les études disponibles montrent que les logements retirés des plateformes reviennent surtout à la location meublée de moyenne durée, destinée à des étudiants et à des salariés en mission, à des prix supérieurs à ceux du marché classique. La mesure produit alors un effet réel, mais différent de celui qu'annoncent ses promoteurs comme de celui que redoutent ses opposants.",
          stem: "Que reproche l'auteur aux deux camps ?",
          options: ["De s'appuyer sur des chiffres contradictoires", "De ne pas examiner les conséquences réelles d'une interdiction", "De défendre les intérêts des propriétaires les plus aisés", "De confondre logement touristique et logement étudiant"],
          answer: 1,
          rationale: "Tests location of the shared blind spot named in the final paragraph; the text states that both camps accept the same figures, and the student rentals appear as a consequence of the ban rather than as a confusion made by either side.",
        },
        {
          id: "tcf-ce-32",
          level: "C1",
          content: "Il y a une manière très sûre de paraître exigeant sans l'être : élever le diplôme demandé. L'employeur qui réclame aujourd'hui cinq années d'études pour un poste que trois suffisaient à occuper hier n'a pas constaté que le travail était devenu plus complexe ; il a constaté qu'il recevait trois cents candidatures et qu'il fallait bien en écarter deux cent quatre-vingt-dix. Le diplôme sert alors moins à qualifier qu'à trier, et il trie d'autant mieux qu'il est long, c'est-à-dire coûteux. On dira que l'entreprise est libre de ses critères. Sans doute. Mais l'addition de ces libertés individuelles produit un résultat que personne n'a voulu : des jeunes gens qui empruntent pour financer des années d'études dont ils constateront, une fois embauchés, qu'elles ne leur servent guère, et des employeurs qui se plaignent ensuite de ne pas trouver de candidats. On me répondra que le diplôme reste un signal utile, et c'est vrai. Un signal, cependant, perd sa valeur à mesure que chacun se l'approprie ; il faut alors en émettre un plus fort, et la course recommence. Les rares secteurs qui ont rompu avec cette logique, en évaluant sur épreuve plutôt que sur titre, n'y sont pas venus par générosité, mais parce qu'ils ne trouvaient plus personne. C'est souvent ainsi que les habitudes changent : non par conviction, mais par pénurie.",
          stem: "Quelle est l'attitude de l'auteur envers l'élévation des diplômes exigés ?",
          options: ["Il l'approuve, à condition que les études soient mieux financées", "Il la juge inévitable compte tenu de la complexité croissante des métiers", "Il y voit un mécanisme de tri dont l'effet d'ensemble est nuisible", "Il la considère comme un phénomène déjà corrigé par la pénurie de candidats"],
          answer: 2,
          rationale: "Tests the writer's evaluative stance across a concessive argument; the second option repeats a claim he explicitly denies, and the fourth turns his remark about a few sectors into a general correction he does not assert.",
        },
        {
          id: "tcf-ce-33",
          level: "C1",
          content: "Chaque mois, un chiffre tombe et l'on discute de sa variation à la décimale près. On discute rarement de ce qu'il contient. Être au chômage, au sens de la statistique internationale, suppose trois conditions simultanées : ne pas avoir travaillé, même une heure, au cours de la semaine de référence ; être disponible pour occuper un emploi ; en avoir cherché un activement. Chacune de ces conditions est défendable, et chacune exclut du décompte des situations que le sens commun y placerait volontiers. Une personne qui a effectué quatre heures de ménage pour un particulier n'est pas comptée. Celle qui, après deux ans de recherches infructueuses, a cessé d'envoyer des candidatures sort du chiffre au moment précis où sa situation s'aggrave. À l'inverse, un étudiant qui cherche un emploi d'été y entre. Il ne s'agit pas de dénoncer une manipulation : la définition est publique, stable, et c'est cette stabilité qui permet les comparaisons dans le temps et entre pays. Le problème tient plutôt à l'usage que l'on en fait. Un indicateur conçu pour mesurer une tension sur le marché du travail est mobilisé pour trancher des questions qu'il n'a jamais eu vocation à traiter : la pauvreté, la précarité, le découragement. Les instituts publient d'ailleurs des mesures complémentaires du sous-emploi et du halo autour du chômage. Elles sont disponibles ; elles ne sont presque jamais citées.",
          stem: "Quel est l'argument central de l'auteur ?",
          options: ["L'indicateur est mal employé plutôt que mal construit", "La définition du chômage est volontairement trompeuse", "Les instituts refusent de publier des données complémentaires", "Les comparaisons entre pays devraient être abandonnées"],
          answer: 0,
          rationale: "Tests the distinction between the definition and its use, stated in the middle of the text; the other options each contradict an explicit sentence about manipulation, about published complementary measures, and about the value of stable comparisons.",
        },
        {
          id: "tcf-ce-34",
          level: "C1",
          content: "Les pistes cyclables séparées sont-elles la solution ? La question paraît technique ; elle recouvre en réalité deux visions de la rue. La première considère la sécurité comme un problème d'infrastructure. Séparer physiquement les flux, dit-elle, réduit les conflits et rassure les usagers les moins assurés — enfants, personnes âgées, débutants —, c'est-à-dire précisément ceux qui ne pédalent pas encore. Les comptages effectués après l'aménagement lui donnent souvent raison : la fréquentation augmente là où la séparation est continue, beaucoup moins là où elle s'interrompt à chaque carrefour. La seconde vision, minoritaire mais argumentée, tient que la séparation déplace le danger vers les intersections, où se produit l'essentiel des collisions graves, et qu'elle légitime implicitement la vitesse automobile sur le reste de la chaussée : chacun chez soi, donc chacun à son allure. Ses partisans plaident pour un abaissement généralisé de la vitesse, moins coûteux et plus homogène. Ces deux positions ne s'opposent pas autant qu'on le croit. Elles divergent sur un point précis : l'échelle à laquelle on juge une politique. La première raisonne sur des axes, la seconde sur un réseau. Une ville peut fort bien aménager ses grands boulevards et laisser ses rues secondaires en l'état ; elle obtiendra alors des comptages flatteurs sur les axes équipés et un bilan d'accidents inchangé. C'est ce qui s'est produit dans plusieurs agglomérations, sans que personne y ait rien fait de faux.",
          stem: "Sur quoi les deux visions divergent-elles réellement, selon l'auteur ?",
          options: ["Sur l'utilité de réduire la vitesse des voitures", "Sur la fiabilité des comptages de cyclistes", "Sur le nombre d'accidents survenant aux intersections", "Sur l'échelle à laquelle on évalue une politique"],
          answer: 3,
          rationale: "Tests the reader's ability to find the point of disagreement the writer isolates rather than the topics that merely appear in each camp's case; speed, counts and intersections are all raised, but only the question of scale is named as the real divergence.",
        },
        {
          id: "tcf-ce-35",
          level: "C1",
          content: "On reproche aux médias en ligne de courir après l'audience. Le reproche est juste et un peu court, car il suppose que l'audience serait un objectif qu'on pourrait abandonner à volonté, comme on renonce à une mauvaise habitude. Observons plutôt le mécanisme. Une rédaction dispose désormais, en temps réel, du nombre de lecteurs de chaque article, de la durée passée sur la page, du point exact où l'on décroche. Cette information n'existait pas il y a vingt ans ; elle est aujourd'hui affichée sur un écran au milieu de la salle. On n'a pas besoin de consigne pour qu'un journaliste, qui voit son sujet s'effondrer à la troisième minute, écrive différemment le suivant. Aucune décision éditoriale n'a été prise, et la ligne du journal a pourtant changé. C'est pourquoi les appels à la responsabilité individuelle des rédacteurs manquent leur cible. Ce n'est pas une faiblesse morale que l'on constate, c'est l'effet ordinaire d'un instrument de mesure sur ce qu'il mesure. Les rares titres qui ont préservé une hiérarchie de l'information indépendante de ces courbes ne l'ont pas fait par vertu : ils ont modifié leur financement, de sorte que la courbe ne détermine plus la recette. Tant que le revenu dépend du clic, exiger des journalistes qu'ils l'ignorent revient à leur demander de travailler contre leur employeur.",
          stem: "Quelle est la thèse défendue par l'auteur ?",
          options: ["Les journalistes en ligne manquent de rigueur professionnelle", "Le comportement des rédactions découle du dispositif de mesure et du mode de financement", "Les mesures d'audience en temps réel devraient être interdites", "Les lecteurs sont responsables de la baisse de qualité de l'information"],
          answer: 1,
          rationale: "Tests the structural explanation the writer substitutes for a moral one; the first option is the very reading he rejects, and the ban and the blaming of readers are conclusions the text never draws.",
        },
        {
          id: "tcf-ce-36",
          level: "C2",
          content: "Il existe désormais, dans chaque administration un peu importante, une direction de l'innovation. On lui doit des séminaires, des chartes, et parfois un mur repeint en couleurs vives où l'on est invité à déposer ses idées sur des papiers adhésifs. Nul n'oserait s'en plaindre : qui, raisonnablement, se déclarerait contre l'innovation ? C'est justement à ce caractère indiscutable qu'on la reconnaît. Un mot d'ordre auquel personne ne s'oppose n'a plus de contenu ; il a une fonction. Celle-ci consiste, dans le cas présent, à déplacer l'attention. Tant qu'on délibère sur la manière d'innover, on ne délibère pas sur ce qu'il faudrait cesser de faire, question autrement désagréable puisqu'elle engage des personnes, des services et des habitudes. L'observateur naïf s'étonnera que les administrations les plus prolixes en la matière soient rarement celles qui ont modifié leurs procédures. L'étonnement se dissipe si l'on admet que le dispositif fonctionne parfaitement, mais pas dans le sens annoncé : il produit du consentement et non du changement. Les agents y participent, apprennent le vocabulaire, et retournent ensuite à des formulaires que nul n'a touchés depuis vingt ans. Faut-il en conclure que tout cela est vain ? Ce serait aller vite. Ces rituels donnent à des organisations vieillissantes une image d'elles-mêmes qu'elles peuvent supporter, ce qui n'est pas rien. On appelle ordinairement cela du réconfort ; l'usage veut, dans le secteur public comme ailleurs, qu'on le nomme une transformation.",
          stem: "Quelle est la fonction du dernier paragraphe ?",
          options: ["Nuancer la critique en reconnaissant l'efficacité réelle des séminaires", "Proposer une méthode pour réformer enfin les procédures", "Feindre une concession pour reformuler la critique de façon plus incisive", "Marquer un changement d'avis de l'auteur sur l'innovation publique"],
          answer: 2,
          rationale: "Tests recognition of an ironic false concession whose closing sentence renames the practice; a literal reader takes it as a genuine qualification or a change of mind, and no method of reform is ever proposed.",
        },
        {
          id: "tcf-ce-37",
          level: "C2",
          content: "Une ville qui se donne pour tâche de conserver sa mémoire commence, sans y prendre garde, par en fabriquer une. Le classement d'un quartier, la restauration d'une halle, l'installation d'un panneau explicatif : chacun de ces gestes suppose qu'on a choisi une date à laquelle l'endroit était censé être lui-même. On restaure rarement une façade dans l'état où on l'a trouvée ; on la ramène à un moment antérieur, jugé plus authentique, et qui coïncide le plus souvent avec la période dont la ville tire aujourd'hui quelque fierté. Les couches suivantes — l'atelier installé dans les années trente, les logements ouvriers ajoutés après la guerre — sont alors traitées comme des accidents dont il conviendrait de débarrasser l'édifice. Elles étaient pourtant, elles aussi, de l'histoire ; simplement d'une histoire moins présentable. Ce n'est pas un procès qu'il faut instruire. Toute conservation choisit, faute de quoi elle ne conserverait rien : on ne peut pas maintenir simultanément tous les états d'un bâtiment. Mais il y a une différence entre choisir en le sachant et présenter son choix comme une restitution. La première attitude produit des villes discutables, où l'on peut demander pourquoi telle époque a été retenue. La seconde produit des décors, d'autant plus convaincants qu'ils n'ont jamais existé sous cette forme, et devant lesquels il devient impossible de poser la moindre question — puisqu'on ne discute pas avec ce qui se donne pour le passé lui-même.",
          stem: "Quelle distinction l'auteur tient-il pour décisive ?",
          options: ["Entre un choix assumé et un choix présenté comme une restitution fidèle", "Entre les bâtiments anciens et les ajouts du vingtième siècle", "Entre la restauration des façades et celle des intérieurs", "Entre la mémoire des habitants et celle des spécialistes"],
          answer: 0,
          rationale: "Tests the argumentative pivot introduced by \"Mais il y a une différence entre\"; the layers of the twentieth century serve as an illustration rather than as the distinction itself, and the other two contrasts are never drawn in the text.",
        },
        {
          id: "tcf-ce-38",
          level: "C2",
          content: "L'entreprise a bien fait les choses. Il y a eu la semaine du bien-être, la conférence sur le sommeil, l'atelier de respiration du mardi midi — sur le temps de pause, précisons-le, afin que nul ne puisse dire que la production en a souffert. Les affiches recommandent de savoir se déconnecter ; elles sont apposées, entre autres, dans le couloir qui mène au service dont les effectifs ont été réduits d'un tiers en janvier. On aurait tort d'y voir du cynisme. Le cynisme suppose qu'on sache ce que l'on fait. Ce qui se passe ici est plus banal et plus tenace : une organisation a rencontré un problème dont la cause se situait dans son organisation même, et elle a choisi le seul type de réponse qu'elle savait produire, c'est-à-dire un programme. Le programme a un budget, un responsable, des indicateurs de participation ; la charge de travail, elle, n'a ni budget ni responsable, elle résulte de décisions dispersées que personne n'a prises ensemble. Le résultat mérite d'être noté. Les salariés qui suivent ces ateliers vont mieux, ce que les évaluations internes établissent honnêtement. Ils vont mieux parce qu'ils ont passé quarante minutes sans écrire de courriels. On les félicite d'avoir appris à respirer. On aurait pu, à peu près au même coût, leur donner quarante minutes.",
          stem: "Que suggère la dernière phrase du texte ?",
          options: ["Que les ateliers devraient être rendus obligatoires", "Que les salariés ne prennent pas leurs pauses de façon responsable", "Que l'entreprise a réalisé des économies grâce à ce programme", "Que le bénéfice observé vient du temps libéré et non de la méthode enseignée"],
          answer: 3,
          rationale: "Tests an ironic conclusion whose force depends on the preceding sentence about forty minutes without e-mails; the cost comparison in the final clause tempts a reader toward the savings option, which reverses the point being made.",
        },
        {
          id: "tcf-ce-39",
          level: "C2",
          content: "On demande aux experts de prévoir, puis on leur reproche de s'être trompés ; et l'on recommence le trimestre suivant avec les mêmes, ce qui devrait suffire à faire soupçonner que la prévision n'est pas ce que l'on attend d'eux. Considérons ce que fait réellement un institut lorsqu'il annonce une croissance de un virgule deux pour cent. Il produit un chiffre assorti d'un intervalle, lequel disparaît dans la reprise médiatique, et d'hypothèses explicites — prix de l'énergie, comportement d'épargne — qui disparaissent également. Reste un nombre, seul, auquel on prêtera ensuite une autorité que son auteur ne lui a jamais reconnue. Le malentendu ne naît pas de l'institut ; il naît de l'usage qui veut qu'une décision paraisse fondée. Car c'est là, me semble-t-il, la véritable demande. Une administration qui doit arbitrer entre deux dépenses n'a pas besoin de connaître l'avenir : elle a besoin de pouvoir dire qu'elle s'est appuyée sur autre chose que sa préférence. Le chiffre remplit cet office, et il le remplit d'autant mieux qu'il est précis — la décimale, ici, ne mesure rien, elle rassure. On comprend alors pourquoi la répétition des erreurs ne discrédite personne. Un instrument dont on se sert pour justifier n'a pas à être exact, il a à être disponible. Ceux qui réclament des prévisionnistes plus modestes n'ont pas tort sur le fond ; ils se trompent seulement d'adresse, car la modestie qu'ils demandent supprimerait précisément le service que l'on attend d'eux.",
          stem: "Selon l'auteur, pourquoi la répétition des erreurs de prévision ne discrédite-t-elle pas les instituts ?",
          options: ["Parce que les médias ne vérifient jamais les prévisions passées", "Parce que le chiffre sert avant tout à justifier des décisions déjà à prendre", "Parce que les intervalles de confiance rendent toute erreur discutable", "Parce que les instituts corrigent leurs hypothèses à chaque trimestre"],
          answer: 1,
          rationale: "Tests the implicit argument that the forecast's function is legitimation rather than prediction; the media, the confidence intervals and the quarterly hypotheses all appear in the text but as elements of that argument, not as the reason asked for.",
        },
      ],
    },
    {
      kind: 'production',
      id: 'expression-ecrite',
      skill: 'writing',
      name: { en: 'Written expression', fr: 'Expression écrite' },
      allowReplay: false,
      // Published: 60 minutes for the three tâches together. FEI, TCF Canada
      // page, read 2026-08-26.
      timeLimitSec: 60 * 60,
      tasks: [
        {
          id: 'tcf-ee-t1',
          skill: 'writing',
          responseMode: 'text',
          // 60–120 mots: VERIFIED 2026-08-26 against the Manuel du candidat
          // TCF, Version P, avril 2026, p. 20. The earlier note here said
          // these were unconfirmed guesses; the band turns out to be right.
          //
          // The time is a different matter. 15 minutes was invented. FEI
          // publishes 60 minutes for the whole épreuve and no per-tâche
          // split, so this is an equal third and is labelled as ours.
          name: { en: 'Tâche 1', fr: 'Tâche 1' },
          instruction: {
            en: 'Write a short message. 60 to 120 words.',
            fr: "Rédigez un message. De 60 à 120 mots.",
          },
          prompt: {
            en: 'You have just finished a training course paid for by your employer. Write a message to your colleagues describing the course and what you learned.',
            fr: "Vous venez de terminer une formation payée par votre employeur. Vous écrivez un message à vos collègues pour décrire cette formation et expliquer ce que vous avez appris.",
          },
          timeLimitSec: 20 * 60,
          timeLimitApportioned: true,
          wordGuidance: { en: '60 to 120 words', fr: 'De 60 à 120 mots' },
          scaleId: 'sur20',
          criteria: [
            { id: 'respect_consigne', label: { en: 'Compliance with the instruction', fr: 'Respect de la consigne' } },
            { id: 'capacite_informer', label: { en: 'Ability to inform and describe', fr: 'Capacité à informer et à décrire' } },
            { id: 'lexique', label: { en: 'Lexis', fr: 'Lexique' } },
            { id: 'morphosyntaxe', label: { en: 'Morphosyntax', fr: 'Morphosyntaxe' } },
          ],
          gate: [
            {
              id: 'empty',
              verdict: {
                kind: 'zero',
                label: { en: 'Nothing submitted', fr: 'Aucune réponse remise' },
                detail: { en: 'An empty response cannot be marked.', fr: "Une réponse vide ne peut pas être corrigée." },
              },
            },
            {
              id: 'min_words',
              words: 60,
              verdict: {
                kind: 'zero',
                label: { en: 'Under length — "A1 non atteint"', fr: 'Trop court — « A1 non atteint »' },
                detail: {
                  en: 'TCF awards "A1 non atteint" — effectively zero — to a response below the required length, whatever its quality.',
                  fr: "Le TCF attribue « A1 non atteint » — soit zéro — à une réponse trop courte, quelle que soit sa qualité.",
                },
              },
            },
            {
              id: 'max_words',
              words: 120,
              verdict: {
                kind: 'warn',
                label: { en: 'Over the upper bound', fr: 'Au-dessus de la borne haute' },
                detail: {
                  en: 'Past 120 words the extra sentences earn nothing and cost time the next tâche needs.',
                  fr: "Au-delà de 120 mots, les phrases supplémentaires ne rapportent rien et coûtent du temps à la tâche suivante.",
                },
              },
            },
            {
              id: 'prompt_copy',
              maxOverlapRatio: 0.5,
              verdict: {
                kind: 'zero',
                label: { en: 'Copied from the instruction', fr: 'Recopié de la consigne' },
                detail: {
                  en: 'Sentences lifted from the consigne are one of the official automatic-zero triggers.',
                  fr: "Les phrases recopiées de la consigne font partie des déclencheurs officiels du zéro automatique.",
                },
              },
            },
            {
              id: 'template_ratio',
              maxRatio: 0.2,
              verdict: {
                kind: 'zero',
                label: { en: 'Memorised text', fr: 'Texte appris par cœur' },
                detail: {
                  en: 'TCF awards no score to memorised text. The threshold is tighter here than on IELTS because the consequence is total rather than a deduction.',
                  fr: "Le TCF n'accorde aucune note à un texte appris par cœur. Le seuil est plus strict qu'à l'IELTS parce que la conséquence est totale et non une pénalité.",
                },
              },
            },
            {
              id: 'off_topic',
              minKeywordHits: 2,
              verdict: {
                kind: 'zero',
                label: { en: 'Off topic', fr: 'Hors sujet' },
                detail: {
                  en: 'An off-topic response is one of the official automatic-zero triggers.',
                  fr: "Le hors-sujet fait partie des déclencheurs officiels du zéro automatique.",
                },
              },
            },
          ],
          topicKeywords: ['formation', 'collègues', 'appris', 'employeur', 'message', 'travail', 'cours', 'stage'],
          suppliedScaffold: [
            'Bonjour à tous,',
            "Je viens de terminer une formation sur",
            "Ce que j'ai le plus retenu, c'est",
            "Je pense que cela nous sera utile pour",
            'À bientôt,',
          ],
          judge: {
            kind: 'none',
            reason: {
              en: 'No calibrated judge is bound to TCF Canada yet. The deterministic checks above are real; the criterion grid below is what a judge would fill in, and it is empty because the French engine has not been built.',
              fr: "Aucun correcteur étalonné n'est encore rattaché au TCF Canada. Les vérifications déterministes ci-dessus sont réelles ; la grille de critères ci-dessous est ce qu'un correcteur remplirait, et elle est vide parce que le moteur français n'est pas construit.",
            },
          },
        },
        {
          id: 'tcf-ee-t2',
          skill: 'writing',
          responseMode: 'text',
          // 120–150 mots: VERIFIED against the Manuel du candidat TCF,
          // Version P, avril 2026, p. 20, which also gives the task type —
          // "raconter ou rédiger un court article": a narrative or short
          // article, an account of experience or a testimonial for a blog or
          // a publication, structured, with connectives guiding the reader.
          //
          // The subject below is OURS. The manual gives the task type, never
          // a subject, and this project does not reproduce real exam items.
          // The time is ours too: an equal third of the published 60 minutes.
          name: { en: 'Tâche 2', fr: 'Tâche 2' },
          instruction: {
            en: 'Write a short article or account for a blog or a publication. 120 to 150 words.',
            fr: "Rédigez un court article ou un récit destiné à un blog ou à une publication. De 120 à 150 mots.",
          },
          prompt: {
            en: 'A magazine for newcomers is collecting accounts of a day that changed something for its readers. Write your account: what happened, in what order, and what it changed for you. Your reader does not know you and was not there.',
            fr: "Un magazine destiné aux personnes nouvellement arrivées réunit des récits d'une journée qui a changé quelque chose. Rédigez le vôtre : ce qui s'est passé, dans quel ordre, et ce que cela a changé pour vous. Votre lecteur ne vous connaît pas et n'était pas présent.",
          },
          timeLimitSec: 20 * 60,
          timeLimitApportioned: true,
          wordGuidance: { en: '120 to 150 words', fr: 'De 120 à 150 mots' },
          scaleId: 'sur20',
          criteria: [
            { id: 'respect_consigne', label: { en: 'Compliance with the instruction', fr: 'Respect de la consigne' } },
            { id: 'capacite_raconter', label: { en: 'Ability to narrate and describe', fr: 'Capacité à raconter et à décrire' } },
            { id: 'lexique', label: { en: 'Lexis', fr: 'Lexique' } },
            { id: 'morphosyntaxe', label: { en: 'Morphosyntax', fr: 'Morphosyntaxe' } },
          ],
          gate: [
            {
              id: 'empty',
              verdict: {
                kind: 'zero',
                label: { en: 'Nothing submitted', fr: 'Aucune réponse remise' },
                detail: { en: 'An empty response cannot be marked.', fr: "Une réponse vide ne peut pas être corrigée." },
              },
            },
            {
              id: 'min_words',
              words: 120,
              verdict: {
                kind: 'zero',
                label: { en: 'Under length — "A1 non atteint"', fr: 'Trop court — « A1 non atteint »' },
                detail: {
                  en: 'TCF awards "A1 non atteint" — effectively zero — to a response below the required length, whatever its quality.',
                  fr: "Le TCF attribue « A1 non atteint » — soit zéro — à une réponse trop courte, quelle que soit sa qualité.",
                },
              },
            },
            {
              id: 'max_words',
              words: 150,
              verdict: {
                kind: 'warn',
                label: { en: 'Over the upper bound', fr: 'Au-dessus de la borne haute' },
                detail: {
                  en: 'Past 150 words the extra sentences earn nothing and cost time tâche 3 needs.',
                  fr: "Au-delà de 150 mots, les phrases supplémentaires ne rapportent rien et coûtent du temps à la tâche 3.",
                },
              },
            },
            {
              id: 'prompt_copy',
              maxOverlapRatio: 0.5,
              verdict: {
                kind: 'zero',
                label: { en: 'Copied from the instruction', fr: 'Recopié de la consigne' },
                detail: {
                  en: 'Sentences lifted from the consigne are one of the official automatic-zero triggers.',
                  fr: "Les phrases recopiées de la consigne font partie des déclencheurs officiels du zéro automatique.",
                },
              },
            },
            {
              id: 'template_ratio',
              maxRatio: 0.2,
              verdict: {
                kind: 'zero',
                label: { en: 'Memorised text', fr: 'Texte appris par cœur' },
                detail: {
                  en: 'TCF awards no score to memorised text. A narrative is the easiest tâche to arrive with pre-written, which is why the threshold is not relaxed here.',
                  fr: "Le TCF n'accorde aucune note à un texte appris par cœur. Le récit est la tâche la plus facile à préparer d'avance, et c'est pourquoi le seuil n'est pas assoupli ici.",
                },
              },
            },
            {
              id: 'off_topic',
              minKeywordHits: 2,
              verdict: {
                kind: 'zero',
                label: { en: 'Off topic', fr: 'Hors sujet' },
                detail: {
                  en: 'An off-topic response is one of the official automatic-zero triggers.',
                  fr: "Le hors-sujet fait partie des déclencheurs officiels du zéro automatique.",
                },
              },
            },
          ],
          topicKeywords: ['journée', 'jour', 'changé', 'arrivé', 'ensuite', 'raconte', 'souvenir', 'depuis'],
          suppliedScaffold: [
            "Ce jour-là,",
            "Tout a commencé quand",
            "Ensuite,",
            "Depuis, je",
          ],
          judge: {
            kind: 'none',
            reason: {
              en: 'No calibrated judge is bound to TCF Canada yet. The deterministic checks above are real; the criterion grid below is what a judge would fill in, and it is empty because the French engine has not been built.',
              fr: "Aucun correcteur étalonné n'est encore rattaché au TCF Canada. Les vérifications déterministes ci-dessus sont réelles ; la grille de critères ci-dessous est ce qu'un correcteur remplirait, et elle est vide parce que le moteur français n'est pas construit.",
            },
          },
        },
        {
          id: 'tcf-ee-t3',
          skill: 'writing',
          responseMode: 'text',
          // 120–180 mots: VERIFIED 2026-08-26, Manuel du candidat TCF,
          // Version P, avril 2026, p. 20, which also confirms the shape of
          // this tâche — two documents, two points of view on a fait de
          // société, the candidate's own opinion.
          //
          // The time is ours: an equal third of the published 60 minutes.
          name: { en: 'Tâche 3', fr: 'Tâche 3' },
          instruction: {
            en: 'Compare the two documents below and give your own reasoned opinion. 120 to 180 words.',
            fr: "Comparez les deux documents ci-dessous et donnez votre avis argumenté. De 120 à 180 mots.",
          },
          prompt: {
            en: 'Document 1 — a municipal notice announcing that the town centre will be closed to cars on Saturdays, to reduce pollution and make room for markets and cycling.\n\nDocument 2 — a letter from a shopkeepers\u2019 association arguing that the closure will cut takings, that deliveries have nowhere to stop, and that customers with reduced mobility will stay away.\n\nCompare the two positions and give your own reasoned opinion.',
            fr: "Document 1 — un avis municipal annonçant la fermeture du centre-ville aux voitures le samedi, afin de réduire la pollution et de laisser la place aux marchés et au vélo.\n\nDocument 2 — une lettre d'une association de commerçants soutenant que cette fermeture fera baisser le chiffre d'affaires, que les livraisons n'auront plus où s'arrêter, et que la clientèle à mobilité réduite ne viendra plus.\n\nComparez les deux positions et donnez votre avis argumenté.",
          },
          timeLimitSec: 20 * 60,
          timeLimitApportioned: true,
          wordGuidance: { en: '120 to 180 words', fr: 'De 120 à 180 mots' },
          scaleId: 'sur20',
          criteria: [
            { id: 'respect_consigne', label: { en: 'Compliance with the instruction', fr: 'Respect de la consigne' } },
            { id: 'capacite_argumenter', label: { en: 'Ability to compare and argue', fr: 'Capacité à comparer et à argumenter' } },
            { id: 'lexique', label: { en: 'Lexis', fr: 'Lexique' } },
            { id: 'morphosyntaxe', label: { en: 'Morphosyntax', fr: 'Morphosyntaxe' } },
          ],
          gate: [
            {
              id: 'empty',
              verdict: {
                kind: 'zero',
                label: { en: 'Nothing submitted', fr: 'Aucune réponse remise' },
                detail: { en: 'An empty response cannot be marked.', fr: "Une réponse vide ne peut pas être corrigée." },
              },
            },
            {
              id: 'min_words',
              words: 120,
              verdict: {
                kind: 'zero',
                label: { en: 'Under length — "A1 non atteint"', fr: 'Trop court — « A1 non atteint »' },
                detail: {
                  en: 'TCF awards "A1 non atteint" to a response below the required length, whatever its quality.',
                  fr: "Le TCF attribue « A1 non atteint » à une réponse trop courte, quelle que soit sa qualité.",
                },
              },
            },
            {
              id: 'max_words',
              words: 180,
              verdict: {
                kind: 'warn',
                label: { en: 'Over the upper bound', fr: 'Au-dessus de la borne haute' },
                detail: {
                  en: 'Tâche 3 is the last task and the one candidates run out of time on. Words past the bound earn nothing.',
                  fr: "La tâche 3 est la dernière et celle où le temps manque. Les mots au-delà de la borne ne rapportent rien.",
                },
              },
            },
            {
              // The comparison rule. This is the one that distinguishes
              // tâche 3 from every other written task in either exam.
              id: 'source_coverage',
              minHitsPerSource: 2,
              sources: [
                {
                  id: 'doc1',
                  label: { en: 'Document 1 — the municipal notice', fr: 'Document 1 — l\u2019avis municipal' },
                  // DISTINCTIVE words only. 'voiture', 'centre-ville' and
                  // 'samedi' were removed after the first test run: they are
                  // the shared subject of both documents, so an answer that
                  // discussed only the shopkeepers still scored hits against
                  // document 1 and passed. A coverage keyword has to be one
                  // the OTHER document would not naturally produce.
                  keywords: ['pollution', 'vélo', 'marché', 'piéton', 'municipal', 'mairie', 'air'],
                },
                {
                  id: 'doc2',
                  label: { en: 'Document 2 — the shopkeepers\u2019 letter', fr: 'Document 2 — la lettre des commerçants' },
                  keywords: ['commerçant', 'chiffre', 'livraison', 'clientèle', 'mobilité', 'affaires', 'boutique', 'vente'],
                },
              ],
              verdict: {
                kind: 'zero',
                label: { en: 'Only one document was addressed', fr: "Un seul document a été traité" },
                detail: {
                  en: 'Tâche 3 asks for a comparison. A response that engages with only one of the two documents has not performed the task, however well it is written — and the criterion it fails first is respect de la consigne.',
                  fr: "La tâche 3 demande une comparaison. Une réponse qui ne traite qu'un des deux documents n'a pas réalisé la tâche, aussi bien écrite soit-elle — et le premier critère qu'elle manque est le respect de la consigne.",
                },
              },
            },
            {
              // Token overlap is NOT a valid copy measure on this task, and
              // the first test run proved it: a genuine, well-argued
              // comparison was zeroed at 0.5 because the prompt here IS the
              // source material. A response that discusses two documents
              // must reuse their content words — that is the task.
              //
              // So the ratio is set high enough to be inert and the work is
              // done by the run detector in engine/gate.ts, which fires on
              // eight consecutive lifted tokens. That catches a copied
              // sentence and ignores shared vocabulary, which is the
              // distinction that actually matters here.
              id: 'prompt_copy',
              maxOverlapRatio: 0.85,
              // Naming what the two documents are about costs eight
              // consecutive words by itself. Fourteen is the point where a
              // response is reproducing a clause rather than a subject.
              maxLiftedRun: 14,
              verdict: {
                kind: 'zero',
                label: { en: 'Copied from the documents', fr: 'Recopié des documents' },
                detail: {
                  en: 'Tâche 3 supplies two texts, so it is the task where lifting is easiest and most penalised. Reusing their vocabulary is expected; reproducing their sentences is not.',
                  fr: "La tâche 3 fournit deux textes : c'est donc la tâche où le recopiage est le plus facile et le plus sanctionné. Réutiliser leur vocabulaire est attendu ; reproduire leurs phrases ne l'est pas.",
                },
              },
            },
            {
              // Also raised after the first test run. The scaffold for this
              // task is the connective phrasing a correct comparison uses —
              // "les deux documents", "le premier soutient que" — so at 0.2
              // it fired on the model answer. A candidate who structures a
              // comparison properly is not cheating.
              id: 'template_ratio',
              maxRatio: 0.4,
              verdict: {
                kind: 'zero',
                label: { en: 'Memorised text', fr: 'Texte appris par cœur' },
                detail: {
                  en: 'TCF awards no score to memorised text.',
                  fr: "Le TCF n'accorde aucune note à un texte appris par cœur.",
                },
              },
            },
            {
              id: 'off_topic',
              minKeywordHits: 2,
              verdict: {
                kind: 'zero',
                label: { en: 'Off topic', fr: 'Hors sujet' },
                detail: {
                  en: 'An off-topic response is one of the official automatic-zero triggers.',
                  fr: "Le hors-sujet fait partie des déclencheurs officiels du zéro automatique.",
                },
              },
            },
          ],
          topicKeywords: ['centre-ville', 'voiture', 'commerçant', 'pollution', 'avis', 'samedi'],
          suppliedScaffold: [
            'Les deux documents abordent',
            "Le premier document soutient que",
            "Le second, en revanche, met en avant",
            "Pour ma part, je pense que",
            'En conclusion,',
          ],
          judge: {
            kind: 'none',
            reason: {
              en: 'No judge is bound. The bound writing assessor refuses French outright — fr-fr and fr-ca both return error_feature_unavailable — so the deterministic checks above are the only real output for this task today, and they are real.',
              fr: "Aucun correcteur n'est rattaché. Le correcteur d'écrit refuse le français — fr-fr et fr-ca renvoient tous deux error_feature_unavailable — de sorte que les vérifications déterministes ci-dessus sont aujourd'hui le seul résultat réel de cette tâche, et elles sont réelles.",
            },
          },
        },
      ],
    },
    {
      kind: 'production',
      id: 'expression-orale',
      skill: 'speaking',
      name: { en: 'Spoken expression', fr: 'Expression orale' },
      allowReplay: false,
      tasks: [
        {
          id: 'tcf-eo-t1',
          skill: 'speaking',
          responseMode: 'audio',
          name: { en: 'Tâche 1', fr: 'Tâche 1' },
          instruction: {
            en: 'Introduce yourself to the examiner. About two minutes, without preparation.',
            fr: "Présentez-vous à l'examinateur. Environ deux minutes, sans préparation.",
          },
          prompt: {
            en: 'Introduce yourself: who you are, what you do, and what brought you to learn French.',
            fr: "Présentez-vous : qui vous êtes, ce que vous faites, et ce qui vous a amené à apprendre le français.",
          },
          timeLimitSec: 120,
          // "Entretien dirigé sans préparation" — Manuel du candidat TCF,
          // Version P, avril 2026, p. 19. Zero here is the exam's published
          // answer, not a missing value.
          preparationSec: 0,
          wordGuidance: { en: 'About two minutes', fr: 'Environ deux minutes' },
          scaleId: 'sur20',
          criteria: [
            { id: 'respect_consigne', label: { en: 'Compliance with the instruction', fr: 'Respect de la consigne' } },
            { id: 'capacite_interagir', label: { en: 'Ability to interact', fr: 'Capacité à interagir' } },
            { id: 'lexique', label: { en: 'Lexis', fr: 'Lexique' } },
            { id: 'morphosyntaxe', label: { en: 'Morphosyntax', fr: 'Morphosyntaxe' } },
          ],
          gate: [
            {
              id: 'empty',
              verdict: {
                kind: 'zero',
                label: { en: 'Nothing was heard', fr: "Rien n'a été entendu" },
                detail: {
                  en: 'The recording produced no transcript.',
                  fr: "L'enregistrement n'a produit aucune transcription.",
                },
              },
            },
            {
              id: 'min_words',
              words: 80,
              verdict: {
                kind: 'zero',
                label: { en: 'Too short — "A1 non atteint"', fr: 'Trop court — « A1 non atteint »' },
                detail: {
                  en: 'A response too short to show the level is scored as not reaching A1, whatever its quality.',
                  fr: "Une réponse trop courte pour montrer le niveau est notée « A1 non atteint », quelle que soit sa qualité.",
                },
              },
            },
            {
              id: 'off_topic',
              minKeywordHits: 1,
              verdict: {
                kind: 'zero',
                label: { en: 'Off topic', fr: 'Hors sujet' },
                detail: {
                  en: 'Off-topic is one of the official automatic-zero triggers.',
                  fr: "Le hors-sujet fait partie des déclencheurs officiels du zéro automatique.",
                },
              },
            },
          ],
          topicKeywords: ['je', 'suis', 'travaille', 'français', 'appelle'],
          // The transcriber is bound: SpeechAce and the STT chain both
          // support fr-CA, so a French recording yields a real transcript and
          // real acoustic measures. The judge is not bound, because nothing
          // scores the TCF grid.
          signal: {
            kind: 'remote',
            adapter: 'speech_evaluate',
            endpoint: '/speech/evaluate',
            language: 'fr-CA',
            fields: { reference_text: '' },
          },
          judge: {
            kind: 'none',
            reason: {
              en: 'No judge scores the TCF speaking grid. The transcript and the acoustic measures above are real; the four criteria below are what an examiner would fill in, and they are empty.',
              fr: "Aucun correcteur n'évalue la grille d'expression orale du TCF. La transcription et les mesures acoustiques ci-dessus sont réelles ; les quatre critères ci-dessous sont ce qu'un examinateur remplirait, et ils sont vides.",
            },
          },
        },
        {
          id: 'tcf-eo-t2',
          skill: 'speaking',
          responseMode: 'audio',
          // "Exercice en interaction AVEC préparation" — Manuel du candidat
          // TCF, Version P, avril 2026, p. 19: 3 min 30 of dialogue plus 2
          // minutes of preparation, for TCF tout public, Québec and Canada.
          //
          // This settles the conflict recorded in step 05 §C2, where one
          // source claimed there is no preparation at all and called that
          // absence the task's main trap. There is preparation, and it is two
          // minutes. Every figure on this task is published; none is ours.
          //
          // The manual also states, among the assessed capabilities for
          // expression orale, "poser des questions adaptées à la situation de
          // communication proposée". That is the task: the candidate obtains
          // information, and the status of both parties is given in the
          // instruction. It is also the source for the teaching-boundary rule
          // that the business plan and the website both carry — previously
          // supported only by preparation sites.
          name: { en: 'Tâche 2', fr: 'Tâche 2' },
          instruction: {
            en: 'Obtain the information you need from your examiner, who plays the role given below. Two minutes to prepare, then about three and a half minutes of dialogue.',
            fr: "Obtenez auprès de votre examinateur, qui joue le rôle indiqué ci-dessous, les informations dont vous avez besoin. Deux minutes de préparation, puis environ trois minutes trente de dialogue.",
          },
          prompt: {
            en: 'You have just moved into a flat and the heating does not work. Your examiner is the building manager. Find out what is wrong, when it will be repaired, and what you should do in the meantime. Ask the questions you need to ask.',
            fr: "Vous venez d'emménager dans un appartement et le chauffage ne fonctionne pas. Votre examinateur est le gestionnaire de l'immeuble. Renseignez-vous sur l'origine du problème, sur la date de la réparation, et sur ce que vous devez faire en attendant. Posez les questions nécessaires.",
          },
          timeLimitSec: 210,
          preparationSec: 120,
          wordGuidance: { en: 'About three and a half minutes', fr: 'Environ trois minutes trente' },
          scaleId: 'sur20',
          criteria: [
            { id: 'respect_consigne', label: { en: 'Compliance with the instruction', fr: 'Respect de la consigne' } },
            { id: 'capacite_interagir', label: { en: 'Ability to interact', fr: 'Capacité à interagir' } },
            { id: 'lexique', label: { en: 'Lexis', fr: 'Lexique' } },
            { id: 'morphosyntaxe', label: { en: 'Morphosyntax', fr: 'Morphosyntaxe' } },
          ],
          gate: [
            {
              id: 'empty',
              verdict: {
                kind: 'zero',
                label: { en: 'Nothing was heard', fr: "Rien n'a été entendu" },
                detail: {
                  en: 'The recording produced no transcript.',
                  fr: "L'enregistrement n'a produit aucune transcription.",
                },
              },
            },
            {
              id: 'min_words',
              words: 100,
              verdict: {
                kind: 'zero',
                label: { en: 'Too short — "A1 non atteint"', fr: 'Trop court — « A1 non atteint »' },
                detail: {
                  en: 'A response too short to show the level is scored as not reaching A1, whatever its quality.',
                  fr: "Une réponse trop courte pour montrer le niveau est notée « A1 non atteint », quelle que soit sa qualité.",
                },
              },
            },
            {
              id: 'off_topic',
              minKeywordHits: 2,
              verdict: {
                kind: 'zero',
                label: { en: 'Off topic', fr: 'Hors sujet' },
                detail: {
                  en: 'Off-topic is one of the official automatic-zero triggers.',
                  fr: "Le hors-sujet fait partie des déclencheurs officiels du zéro automatique.",
                },
              },
            },
          ],
          topicKeywords: ['chauffage', 'appartement', 'réparation', 'quand', 'est-ce', 'pourquoi', 'combien'],
          signal: {
            kind: 'remote',
            adapter: 'speech_evaluate',
            endpoint: '/speech/evaluate',
            language: 'fr-CA',
            fields: { reference_text: '' },
          },
          judge: {
            kind: 'none',
            reason: {
              en: 'No judge scores the TCF speaking grid. The transcript and the acoustic measures above are real; the four criteria below are what an examiner would fill in, and they are empty.',
              fr: "Aucun correcteur n'évalue la grille d'expression orale du TCF. La transcription et les mesures acoustiques ci-dessus sont réelles ; les quatre critères ci-dessous sont ce qu'un examinateur remplirait, et ils sont vides.",
            },
          },
        },
        {
          id: 'tcf-eo-t3',
          skill: 'speaking',
          responseMode: 'audio',
          // "Expression d'un point de vue, sans préparation" — 4 min 30 for
          // TCF tout public, Québec and Canada. Manual, p. 19.
          //
          // 2 + 3.5 + 4.5 = 10 minutes of speaking, plus the 2 minutes of
          // preparation on tâche 2, is exactly the 12 minutes FEI publishes
          // for the épreuve. Unlike expression écrite, nothing here is
          // apportioned by us.
          name: { en: 'Tâche 3', fr: 'Tâche 3' },
          instruction: {
            en: 'Give and defend your point of view. About four and a half minutes, without preparation.',
            fr: "Exprimez et défendez votre point de vue. Environ quatre minutes trente, sans préparation.",
          },
          prompt: {
            en: 'Some people say that a city should be built for those who live in it, others that it should be built for those who work in it. What do you think? Give your view, support it, and say what you would answer to someone who disagreed.',
            fr: "Certains disent qu'une ville doit être conçue pour ceux qui l'habitent, d'autres pour ceux qui y travaillent. Qu'en pensez-vous ? Donnez votre avis, appuyez-le, et dites ce que vous répondriez à quelqu'un qui ne serait pas d'accord.",
          },
          timeLimitSec: 270,
          preparationSec: 0,
          wordGuidance: { en: 'About four and a half minutes', fr: 'Environ quatre minutes trente' },
          scaleId: 'sur20',
          criteria: [
            { id: 'respect_consigne', label: { en: 'Compliance with the instruction', fr: 'Respect de la consigne' } },
            { id: 'capacite_argumenter', label: { en: 'Ability to argue a point of view', fr: 'Capacité à argumenter' } },
            { id: 'lexique', label: { en: 'Lexis', fr: 'Lexique' } },
            { id: 'morphosyntaxe', label: { en: 'Morphosyntax', fr: 'Morphosyntaxe' } },
          ],
          gate: [
            {
              id: 'empty',
              verdict: {
                kind: 'zero',
                label: { en: 'Nothing was heard', fr: "Rien n'a été entendu" },
                detail: {
                  en: 'The recording produced no transcript.',
                  fr: "L'enregistrement n'a produit aucune transcription.",
                },
              },
            },
            {
              id: 'min_words',
              words: 140,
              verdict: {
                kind: 'zero',
                label: { en: 'Too short — "A1 non atteint"', fr: 'Trop court — « A1 non atteint »' },
                detail: {
                  en: 'A response too short to show the level is scored as not reaching A1, whatever its quality.',
                  fr: "Une réponse trop courte pour montrer le niveau est notée « A1 non atteint », quelle que soit sa qualité.",
                },
              },
            },
            {
              id: 'off_topic',
              minKeywordHits: 2,
              verdict: {
                kind: 'zero',
                label: { en: 'Off topic', fr: 'Hors sujet' },
                detail: {
                  en: 'Off-topic is one of the official automatic-zero triggers.',
                  fr: "Le hors-sujet fait partie des déclencheurs officiels du zéro automatique.",
                },
              },
            },
          ],
          topicKeywords: ['ville', 'habitants', 'travail', 'pense', 'avis', 'parce', 'exemple'],
          signal: {
            kind: 'remote',
            adapter: 'speech_evaluate',
            endpoint: '/speech/evaluate',
            language: 'fr-CA',
            fields: { reference_text: '' },
          },
          judge: {
            kind: 'none',
            reason: {
              en: 'No judge scores the TCF speaking grid. The transcript and the acoustic measures above are real; the four criteria below are what an examiner would fill in, and they are empty.',
              fr: "Aucun correcteur n'évalue la grille d'expression orale du TCF. La transcription et les mesures acoustiques ci-dessus sont réelles ; les quatre critères ci-dessous sont ce qu'un examinateur remplirait, et ils sont vides.",
            },
          },
        },
      ],
    },
  ],
};
