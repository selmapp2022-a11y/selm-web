/**
 * IELTS Academic — the second English version, and the one Canada does not take.
 *
 * ── WHY IT EXISTS AND WHAT IT MAY NOT CLAIM ─────────────────────────────
 *
 * IRCC accepts IELTS **General Training** for economic immigration. It does
 * not accept IELTS Academic for that route, and a candidate who prepares on
 * the wrong version discovers it after paying for the sitting. So the one
 * thing this file must never do is let Academic look like a Canadian route:
 * `acceptedFor` says so in both languages, no `Goal` in `definitions/index.ts`
 * points at it, and the onboarding picker computes what is built from this
 * definition rather than from a sentence someone typed.
 *
 * ── WHAT IS ACTUALLY BUILT HERE, STATED PLAINLY ─────────────────────────
 *
 * Writing and Reading. Those are the two skills where Academic differs from
 * General Training at all: Task 1 describes data instead of writing a letter,
 * and the reading passages are academic rather than workplace and social.
 *
 * Listening and Speaking are, on the published format, **the same paper in
 * both versions**. They are not duplicated here — duplicating a bank is how
 * two copies of one thing drift — and the picker will therefore show this
 * exam as partial, which is what it is. That is a statement about us, not
 * about the exam.
 *
 * ── WHAT IS SHARED WITH GENERAL TRAINING, AND WHY THAT IS NOT A SHORTCUT ─
 *
 * The band scale, the CLB benchmark table and the four writing criteria are
 * the SAME instrument in both versions — 0–9 in half bands, the same public
 * conversion table, and the four criteria IELTS prints on the Test Report
 * Form. Copying them into a second literal would mean a correction to one
 * that never reaches the other; that class of defect is what this codebase
 * spends its checks on. So they are imported.
 *
 * What is NOT shared, because the ruling of 31 August is explicit that every
 * exam ships its own: the topic keywords, the prompts, and the reading bank.
 *
 * ── THE FIGURE PROBLEM, RECORDED RATHER THAN HIDDEN ─────────────────────
 *
 * Academic Task 1 shows a chart, a table, a map or a process diagram. This
 * product does not draw one yet. The prompts below therefore carry the SAME
 * figures the chart would carry, written as a small labelled table, and each
 * says so in its own instruction. A candidate is still describing data, still
 * selecting and comparing, still writing 150 words to a clock — but they are
 * not reading a graph, and the task is not the exam's until they are.
 */
import type { ComprehensionSection, ExamDefinition, ProductionSection } from '../model/types';
import { IELTS_GT } from './ielts-gt';

const gtWriting = IELTS_GT.sections.find(
  (s): s is ProductionSection => s.kind === 'production' && s.skill === 'writing',
)!;
const [gtT1, gtT2] = gtWriting.tasks;

const FIGURE_NOTE = {
  en: 'The figures below are given as a table. In the exam they appear as a chart, and describing a chart is part of the task — so this is our presentation of the data, not the exam’s.',
  fr: "Les données ci-dessous sont présentées sous forme de tableau. À l'examen, elles apparaissent sous forme de graphique : cette présentation est la nôtre, pas celle de l'examen.",
};

export const IELTS_ACADEMIC: ExamDefinition = {
  ...IELTS_GT,
  id: 'ielts-academic',
  name: { en: 'IELTS Academic', fr: 'IELTS Academic' },
  acceptedFor: {
    en: 'University admission and professional registration. NOT accepted for Canadian economic immigration — IRCC takes IELTS General Training for that route.',
    fr: "Admission universitaire et inscription professionnelle. NON accepté pour l'immigration économique canadienne — IRCC exige la version General Training pour cette voie.",
  },
  sections: [
    {
      kind: 'production',
      id: 'writing',
      sets: {
        tasks: 2,
        source: 'ielts.org — Academic Writing: 2 tasks in 60 minutes (describe visual information in at least 150 words, an essay of at least 250).',
      },
      skill: 'writing',
      name: { en: 'Writing', fr: 'Expression écrite' },
      allowReplay: false,
      tasks: [
        {
          ...gtT1,
          id: 'ac-w-t1',
          name: { en: 'Task 1', fr: 'Task 1' },
          instruction: {
            en: 'Describe the information below. Select and report the main features, and make comparisons where relevant. Spend about 20 minutes on this task and write at least 150 words. ' + FIGURE_NOTE.en,
            fr: "Décrivez les données ci-dessous. Retenez les éléments principaux et faites les comparaisons utiles. Consacrez environ 20 minutes à cette tâche et écrivez au moins 150 mots. " + FIGURE_NOTE.fr,
          },
          prompt: {
            en: 'Households with a home internet connection, as a percentage of all households:\n\n            2000    2010    2020\nCanada       51      79      94\nMexico       9       26      62\nJapan        34      78      89\nNigeria      1       6       35',
            fr: "Ménages disposant d'une connexion internet à domicile, en pourcentage :\n\n            2000    2010    2020\nCanada       51      79      94\nMexique      9       26      62\nJapon        34      78      89\nNigéria      1       6       35",
          },
          topicKeywords: ['households', 'internet', 'connection', 'percentage', 'increase', 'countries', 'period', 'compared'],
          prompts: [
            {
              id: 'ac-w-t1-p2',
              topicKeywords: ['electricity', 'sources', 'hydro', 'coal', 'wind', 'share', 'generation', 'compared'],
              freshness: 'current',
              prompt: {
                en: 'Where three countries got their electricity in 2023, as a percentage of total generation:\n\n            hydro   coal    gas     wind    other\nBrazil       58      3       9       14      16\nPoland       2       61      12      12      13\nDenmark      0       8       14      55      23',
                fr: "Origine de l'électricité dans trois pays en 2023, en pourcentage de la production totale :\n\n            hydro   charbon gaz     éolien  autre\nBrésil       58      3       9       14      16\nPologne      2       61      12      12      13\nDanemark     0       8       14      55      23",
              },
            },
            {
              id: 'ac-w-t1-p3',
              topicKeywords: ['glass', 'recycling', 'stages', 'sorted', 'crushed', 'furnace', 'moulded', 'process'],
              freshness: 'timeless',
              prompt: {
                en: 'The stages by which used glass becomes new containers:\n\n1. Collected glass arrives at the plant mixed with metal and paper.\n2. Magnets and air jets remove the metal and the light waste.\n3. The remaining glass is sorted by colour, by hand and by optical scanner.\n4. Sorted glass is crushed into small pieces called cullet.\n5. Cullet is melted in a furnace with sand and soda ash at 1,500 degrees.\n6. The molten mixture is moulded into new containers and cooled slowly.\n7. Containers are inspected; those that fail return to step 4.',
                fr: "Les étapes par lesquelles le verre usagé devient un contenant neuf : collecte, retrait des métaux, tri par couleur, broyage en calcin, fusion au four avec du sable et de la soude, moulage, puis contrôle — les pièces refusées retournent au broyage.",
              },
            },
            {
              id: 'ac-w-t1-p4',
              topicKeywords: ['students', 'enrolled', 'subject', 'engineering', 'nursing', 'numbers', 'fell', 'rose'],
              freshness: 'current',
              prompt: {
                en: 'Students enrolled at one university, by subject, in thousands:\n\n                 2015    2019    2023\nEngineering       4.2     5.1     6.8\nNursing           2.8     3.6     3.4\nHistory           3.1     2.4     1.5\nComputer science  2.0     4.7     9.3',
                fr: "Effectifs étudiants d'une université, par discipline, en milliers :\n\n                 2015    2019    2023\nIngénierie        4,2     5,1     6,8\nSoins infirmiers  2,8     3,6     3,4\nHistoire          3,1     2,4     1,5\nInformatique      2,0     4,7     9,3",
              },
            },
          ],
          timeLimitSec: 20 * 60,
          wordGuidance: { en: 'At least 150 words', fr: 'Au moins 150 mots' },
        },
        {
          ...gtT2,
          id: 'ac-w-t2',
          name: { en: 'Task 2', fr: 'Task 2' },
          instruction: {
            en: 'Write about the following topic. Give reasons for your answer and include any relevant examples from your own knowledge or experience. Spend about 40 minutes on this task and write at least 250 words.',
            fr: "Traitez le sujet suivant. Justifiez votre réponse et donnez des exemples tirés de vos connaissances ou de votre expérience. Consacrez environ 40 minutes à cette tâche et écrivez au moins 250 mots.",
          },
          prompt: {
            en: 'Some people believe that universities should spend their money on research, while others argue that teaching should come first. Discuss both views and give your own opinion.',
            fr: "Certains estiment que les universités devraient consacrer leurs moyens à la recherche, d'autres que l'enseignement doit primer. Examinez les deux points de vue et donnez votre avis.",
          },
          topicKeywords: ['universities', 'research', 'teaching', 'funding', 'students', 'academic', 'priority', 'opinion'],
          prompts: [
            {
              id: 'ac-w-t2-p2',
              topicKeywords: ['museums', 'artefacts', 'returned', 'origin', 'collections', 'heritage', 'countries', 'display'],
              freshness: 'current',
              prompt: {
                en: 'Museums in wealthy countries hold artefacts taken from other countries long ago. Some argue that these objects should be returned; others say they are better preserved and more widely seen where they are. Discuss both views and give your own opinion.',
                fr: "Les musées des pays riches conservent des objets pris ailleurs il y a longtemps. Faut-il les restituer ? Examinez les deux points de vue et donnez votre avis.",
              },
            },
            {
              id: 'ac-w-t2-p3',
              topicKeywords: ['research', 'published', 'public', 'access', 'journals', 'paid', 'knowledge', 'funding'],
              freshness: 'current',
              prompt: {
                en: 'Research paid for by taxpayers is often published in journals that charge readers to see it. To what extent do you agree that all publicly funded research should be free to read?',
                fr: "La recherche financée par l'impôt paraît souvent dans des revues payantes. Dans quelle mesure toute recherche publique devrait-elle être en accès libre ?",
              },
            },
            {
              id: 'ac-w-t2-p4',
              topicKeywords: ['cities', 'cars', 'restricted', 'centres', 'transport', 'pollution', 'residents', 'access'],
              freshness: 'current',
              prompt: {
                en: 'Some cities have banned private cars from their centres. Others say such bans harm shops and exclude people who cannot use public transport. Discuss both views and give your own opinion.',
                fr: "Certaines villes interdisent la voiture en centre-ville ; d'autres jugent que cela nuit aux commerces et exclut une partie des habitants. Examinez les deux points de vue et donnez votre avis.",
              },
            },
          ],
          timeLimitSec: 40 * 60,
          wordGuidance: { en: 'At least 250 words', fr: 'Au moins 250 mots' },
        },
      ],
    } satisfies ProductionSection,
    {
      kind: 'comprehension',
      id: 'reading',
      sets: {
        questions: 40,
        source: 'ielts.org — Academic Reading: 40 questions in 60 minutes, three long passages from books, journals and newspapers.',
      },
      skill: 'reading',
      name: { en: 'Reading', fr: 'Compréhension écrite' },
      timeLimitSec: 60 * 60,
      scaleId: 'band',
      delivery: {
        audioPlaysOnce: false,
        questionAfterAudio: false,
        transcriptDuringSection: false,
        presentation: 'all_at_once',
        clock: 'section',
        answersLockedOnAnswer: false,
        feedbackDuringSection: false,
      },
      // FOUR PASSAGES AT C1, AND ONE RUNG BELOW THEM.
      //
      // The épreuve is three long passages and forty questions; this bank is
      // not that yet and the row in the inventory says so. What it is instead
      // is one coordinate built to depth — four passages at C1, so a second
      // sitting is not the first sitting — plus a single B2 passage that
      // exists to be the LADDER's lower rung. That B2 passage is an anchor:
      // it cleared the gate and the anchor comparison, it could not clear the
      // statistical veto because there was nothing yet to measure it against,
      // and it is recorded as unmeasured rather than as passed.
      //
      // A sitting therefore draws the four C1 passages and their twenty
      // questions. The B2 anchor is not on the paper: one passage at a
      // coordinate is an instrument, not a supply.
      serve: { count: 4, byBand: { C1: 4 } },
      provenance: {
        en: 'Written for this product to the published IELTS Academic reading format; no real exam passage or question is reproduced, and no source text is quoted. CEFR banding and family assignment are ours and are unreviewed.',
        fr: "Rédigé pour ce produit selon le format publié de l'IELTS Academic ; aucun texte ni aucune question d'examen réels ne sont reproduits. Le classement CECRL et l'affectation aux familles sont les nôtres et non relus.",
      },
      families: [
        {
          id: 'study',
          label: { en: 'Research report', fr: 'Compte rendu de recherche' },
          describes: {
            en: 'A study described from method to result. What is tested is separating what was measured from what the writer concludes.',
            fr: "Une étude décrite de la méthode au résultat. Ce qui est testé, c'est de distinguer ce qui a été mesuré de ce que l'auteur en conclut.",
          },
          provenance: {
            en: 'Family names follow the Academic reading text types; item assignment is ours and unreviewed.',
            fr: "Les familles suivent les types de textes de l'épreuve Academic ; l'affectation est la nôtre et non relue.",
          },
        },
        {
          id: 'explanation',
          label: { en: 'Explanatory text', fr: 'Texte explicatif' },
          describes: {
            en: 'A mechanism or process explained. What is tested is following an order of causes across paragraphs.',
            fr: "Un mécanisme ou un processus expliqué. Ce qui est testé, c'est de suivre un ordre de causes sur plusieurs paragraphes.",
          },
          provenance: { en: 'As above.', fr: 'Comme ci-dessus.' },
        },
        {
          id: 'argued',
          label: { en: 'Argued text', fr: 'Texte argumentatif' },
          describes: {
            en: 'A position defended against an objection. What is tested is telling the claim from the concession.',
            fr: "Une thèse défendue contre une objection. Ce qui est testé, c'est de distinguer la thèse de la concession.",
          },
          provenance: { en: 'As above.', fr: 'Comme ci-dessus.' },
        },
      ],
      recordings: [
        {
          id: "ac-r-01-r",
          role: 'anchor',
          level: 'B2',
          family: 'study',
          freshness: 'current',
          script: "A team at a Dutch university wanted to know whether cycling to work changes how people feel about their jobs. They followed 1,240 employees at eleven companies for two years. At the start, each person recorded how they travelled to work and answered a short questionnaire about job satisfaction. The questionnaire was repeated every three months. About a fifth of the group changed the way they commuted at some point during the study, and it is this group that the researchers were most interested in. Employees who switched from driving to cycling reported higher satisfaction six months later, and the difference was still there at the end of the second year. Those who switched in the other direction reported no matching fall. The researchers are careful about what this shows. People who take up cycling may be changing other things at the same time, such as working hours or where they live, and the study did not record those. What the data support is an association between cycling and later satisfaction, measured over a longer period than most previous work. Whether the cycling causes the satisfaction, or a third change causes both, the design of this study cannot say.",
        },
        {
          id: "ac-r-02-r",
          level: 'C1',
          family: 'study',
          freshness: 'current',
          script: "For most of the twentieth century, the standard account of how coral reefs recover from bleaching rested on a single mechanism: surviving colonies release larvae, the larvae settle on dead skeleton, and the reef rebuilds from its own stock. A survey of thirty-one reefs in the western Pacific, published last year, complicates that account without overturning it. The survey team returned to sites that had bleached severely between 2016 and 2020 and genotyped the young colonies they found. On the reefs that had recovered fastest, a large minority of the new colonies — between a quarter and two fifths, depending on the site — were not descended from local survivors at all. Their genetic markers matched populations several hundred kilometres upstream in the prevailing current. This finding matters because it changes what a damaged reef is thought to need. If recovery draws chiefly on local stock, protecting the reef itself is the intervention that counts. If a substantial share of recruits arrives from elsewhere, then the health of distant reefs, and of the current that connects them, becomes part of the same problem. The authors are cautious about generalising. Their sites were chosen because they had recovered, which means the sample says little about reefs that did not, and the genetic method they used cannot distinguish a recruit that arrived last year from one whose parents arrived a decade ago. What the survey establishes is narrower than the headlines it attracted: on these reefs, at these times, connectivity contributed materially to recovery, and any management plan that assumes otherwise is assuming something the data do not support.",
        },
        {
          id: "ac-r-03-r",
          role: 'anchor',
          level: 'C1',
          family: 'study',
          freshness: 'current',
          script: "Economists have long suspected that the timing of a school day interacts with adolescent biology, and a natural experiment in one Canadian province has now given them something firmer than suspicion. In 2021 the province permitted secondary schools to choose their own start time within a two-hour window. Roughly a third moved later, a third stayed where they were, and the remainder made smaller adjustments in both directions. Because the choice was made by school boards on administrative grounds rather than by families, the resulting variation is close to random with respect to the students themselves, which is what makes the comparison worth anything. Three years of results are now available. Students in schools that moved to a later start gained, on average, twenty-six minutes of sleep on school nights and improved by a small but consistent margin on standardised tests in mathematics. There was no measurable change in reading scores. Attendance improved, and the improvement was concentrated in the first period of the day, which is what one would expect if lateness rather than absence were the mechanism. The study also records two findings that complicate the case for later starts. Participation in after-school employment fell in the schools that moved, and among students from lower-income households that fall was large enough to represent a meaningful loss of earnings. Rates of participation in team sports fell as well, since fixtures are scheduled by leagues that did not move. Neither effect appears in the mathematics scores, and neither is captured by the measures that make later starts look attractive. The authors conclude that later starts help, that the help is real but modest, and that the costs fall on a different group from the one that receives the benefit.",
        },
        {
          id: "ac-r-04-r",
          level: 'C1',
          family: 'study',
          freshness: 'current',
          script: "The claim that reading fiction improves the ability to understand other minds has had an unusually public career. It entered the literature through a set of experiments in which participants who had read a short literary extract performed better on a test of reading emotion from photographs of eyes than participants who had read popular fiction or nothing at all. The result was widely reported, and it was reported as though the effect were large and durable. A replication attempt across four laboratories, with a combined sample eight times the size of the original, found an effect in the same direction and roughly a tenth of the size. At that magnitude the difference is real but has no practical meaning for any individual reader, and the replication team said so. What is more interesting than the shrinkage is what the larger study could examine that the original could not. With enough participants to divide the sample, the team found that lifetime reading history predicted performance on the eyes test considerably better than the extract read that morning, and that the advantage of literary over popular fiction disappeared once lifetime reading was accounted for. The most defensible reading of the combined evidence is therefore almost the opposite of the headline: what people read on one occasion changes very little, while what they have read across years is associated with a measurable difference. That association is not itself evidence of cause, since people who find other minds interesting are likely to read more fiction in the first place, and no design so far has separated the two.",
        },
        {
          id: "ac-r-05-r",
          level: 'C1',
          family: 'study',
          freshness: 'current',
          script: "When a city publishes the location of every reported pothole, it is usually described as an exercise in transparency. A study of three mid-sized cities that opened such data between 2018 and 2022 suggests the effect is better understood as a change in who gets repaired. In all three cities the number of reports rose sharply after publication, roughly doubling within a year. Repair times fell overall. But the researchers matched the reports against census data and found that the increase was concentrated in neighbourhoods that were already well served, and that the fall in repair times followed the same pattern. Two years after publication, the gap in average repair time between the wealthiest and poorest quarters of each city was wider than it had been before the data were opened, in two cities substantially so. The mechanism the researchers propose is unglamorous. Reporting a pothole through the new channels required a smartphone, a working knowledge of the city's website and, in one city, an account. Residents who already found the municipality easy to deal with found the new channel easy as well, and used it more. The authors are careful not to argue against publication. Their point is that an open dataset records the reports it receives, that a repair queue driven by such a dataset inherits whatever inequality the reporting channel contains, and that a city which measures its performance by average repair time will see the inequality as an improvement. Where one of the three cities added telephone reporting with a staffed line, the gap narrowed again, which is the closest thing the study offers to a remedy.",
        },
      ],
      items: [
        {
          id: "ac-r-01-q1",
          recordingId: "ac-r-01-r",
          level: "B2",
          stem: "What did the researchers pay closest attention to?",
          rationale: "The passage says about a fifth changed their commute and that this is the group the researchers were most interested in.",
          options: ["The employees who changed how they commuted","The employees who cycled throughout","The eleven companies that took part","The questionnaire that was repeated every three months"],
          answer: 0,
        },
        {
          id: "ac-r-01-q2",
          recordingId: "ac-r-01-r",
          level: "B2",
          stem: "What happened to employees who stopped cycling and began driving?",
          rationale: "The text states that those who switched in the other direction reported no matching fall in satisfaction.",
          options: ["They reported a sharp rise in their working hours","Their satisfaction did not fall correspondingly","Their satisfaction fell sharply","They left the study early"],
          answer: 1,
        },
        {
          id: "ac-r-01-q3",
          recordingId: "ac-r-01-r",
          level: "B2",
          stem: "Why do the researchers avoid claiming a cause?",
          rationale: "They note that people taking up cycling may change hours or housing at the same time and that the study did not record those.",
          options: ["The questionnaire was unreliable","The study lasted less than a year","Other changes were not recorded","The sample was too small"],
          answer: 2,
        },
        {
          id: "ac-r-01-q4",
          recordingId: "ac-r-01-r",
          level: "B2",
          stem: "How long did the study run?",
          rationale: "The passage says the team followed employees at eleven companies for two years, with the effect still present at the end of the second year.",
          options: ["Six months","Three months","Eleven years","Two years"],
          answer: 3,
        },
        {
          id: "ac-r-02-q1",
          recordingId: "ac-r-02-r",
          level: "C1",
          stem: "What was the traditional explanation of reef recovery?",
          rationale: "The passage opens by describing the standard account: surviving colonies release larvae that settle on dead skeleton, so the reef rebuilds from its own stock.",
          options: ["Local survivors supply the new colonies","Currents carry larvae between distant reefs","Dead skeleton dissolves and reforms","Fish populations return before corals"],
          answer: 0,
        },
        {
          id: "ac-r-02-q2",
          recordingId: "ac-r-02-r",
          level: "C1",
          stem: "What did genotyping reveal on the fastest-recovering reefs?",
          rationale: "Between a quarter and two fifths of new colonies carried markers matching populations hundreds of kilometres upstream.",
          options: ["Bleaching had not in fact occurred","Many young colonies came from distant populations","All young colonies were locally descended","The young colonies proved older than the survey assumed"],
          answer: 1,
        },
        {
          id: "ac-r-02-q3",
          recordingId: "ac-r-02-r",
          level: "C1",
          stem: "Why does the finding change what a damaged reef needs?",
          rationale: "The passage argues that if many recruits arrive from elsewhere, the health of distant reefs and of the connecting current belongs to the same management problem.",
          options: ["Bleaching must be prevented entirely","Genetic surveys must replace visual ones","Distant reefs join the same problem","Local protection is shown useless"],
          answer: 2,
        },
        {
          id: "ac-r-02-q4",
          recordingId: "ac-r-02-r",
          level: "C1",
          stem: "What limitation follows from how the sites were chosen?",
          rationale: "The authors note the sites were selected because they had recovered, so the study cannot speak to reefs that did not.",
          options: ["It relies on too few genetic markers to be conclusive","It was surveyed in the wrong season","The reefs lay too far apart","It excludes reefs that never recovered"],
          answer: 3,
        },
        {
          id: "ac-r-02-q5",
          recordingId: "ac-r-02-r",
          level: "C1",
          stem: "How does the writer describe the survey's established result?",
          rationale: "The closing sentences say what the survey establishes is narrower than the headlines it attracted, and confine it to these reefs at these times.",
          options: ["Narrower than the coverage it received","Stronger than the authors are willing to admit","Identical to earlier findings","Impossible to reproduce"],
          answer: 0,
        },
        {
          id: "ac-r-03-q1",
          recordingId: "ac-r-03-r",
          level: "C1",
          stem: "What makes the provincial change useful as evidence?",
          rationale: "The passage explains that because school boards chose on administrative grounds, the variation is close to random with respect to students.",
          options: ["The change was tested on volunteers first","Boards chose start times for administrative reasons","Families were allowed to select the school they preferred","Every school moved by the same amount"],
          answer: 1,
        },
        {
          id: "ac-r-03-q2",
          recordingId: "ac-r-03-r",
          level: "C1",
          stem: "Which result did later starts NOT produce?",
          rationale: "The text records more sleep, small mathematics gains and better first-period attendance, but states there was no measurable change in reading.",
          options: ["Better mathematics results","Better attendance in first period","A change in reading scores","Extra sleep on school nights"],
          answer: 2,
        },
        {
          id: "ac-r-03-q3",
          recordingId: "ac-r-03-r",
          level: "C1",
          stem: "Why does the writer mention the first period specifically?",
          rationale: "Attendance improved mostly in the first period, which the passage says is what one would expect if lateness rather than absence explained the gain.",
          options: ["It is the period in which mathematics is usually taught","It was the only period measured","It was unaffected by the change","It fits lateness rather than absence as the mechanism"],
          answer: 3,
        },
        {
          id: "ac-r-03-q4",
          recordingId: "ac-r-03-r",
          level: "C1",
          stem: "Why did participation in team sports decline?",
          rationale: "The passage attributes the fall to fixtures being scheduled by leagues that did not change their timing.",
          options: ["Leagues kept the old fixture times","Students preferred to take on paid work instead","Coaches opposed the change","Facilities closed much earlier"],
          answer: 0,
        },
        {
          id: "ac-r-03-q5",
          recordingId: "ac-r-03-r",
          level: "C1",
          stem: "What is the authors' overall conclusion?",
          rationale: "They conclude that later starts help, that the help is real but modest, and that the costs fall on a different group from the beneficiaries.",
          options: ["Later starts benefit every group of students equally","The benefit is modest and its costs fall elsewhere","The change should be reversed","The evidence is too weak to interpret"],
          answer: 1,
        },
        {
          id: "ac-r-04-q1",
          recordingId: "ac-r-04-r",
          level: "C1",
          stem: "What did the original experiments report?",
          rationale: "The passage describes participants who read a literary extract outperforming those who read popular fiction or nothing on an eyes test.",
          options: ["Reading history predicted the results","No difference between the groups","A literary extract raised eyes-test scores","Popular fiction outperformed literary fiction"],
          answer: 2,
        },
        {
          id: "ac-r-04-q2",
          recordingId: "ac-r-04-r",
          level: "C1",
          stem: "What did the four-laboratory replication find?",
          rationale: "The replication found an effect in the same direction and roughly a tenth the magnitude of the original.",
          options: ["No detectable effect at all","A considerably larger effect","An effect in the opposite direction","The same direction, a tenth the size"],
          answer: 3,
        },
        {
          id: "ac-r-04-q3",
          recordingId: "ac-r-04-r",
          level: "C1",
          stem: "Why does the writer call the larger study more interesting?",
          rationale: "The passage says that with enough participants to divide the sample, the team could examine questions the original could not.",
          options: ["Its size allowed the sample to be divided","It used a better emotion test","It included children as well as adults","It was funded independently"],
          answer: 0,
        },
        {
          id: "ac-r-04-q4",
          recordingId: "ac-r-04-r",
          level: "C1",
          stem: "What happened to the literary advantage once reading history was considered?",
          rationale: "The text states the advantage of literary over popular fiction disappeared once lifetime reading was accounted for.",
          options: ["It stayed unchanged","It disappeared","It doubled","It reversed"],
          answer: 1,
        },
        {
          id: "ac-r-04-q5",
          recordingId: "ac-r-04-r",
          level: "C1",
          stem: "Why is the association with lifetime reading not proof of cause?",
          rationale: "The closing argument is that people who find other minds interesting are likely to read more fiction, and no design has separated the two.",
          options: ["The eyes test is unreliable","Reading history was self-reported","Interest in other minds may drive both","The samples were too small"],
          answer: 2,
        },
        {
          id: "ac-r-05-q1",
          recordingId: "ac-r-05-r",
          level: "C1",
          stem: "What happened to reports after the data were published?",
          rationale: "The passage states the number of reports rose sharply after publication, roughly doubling within a year in all three cities.",
          options: ["They fell steadily","They stayed the same","They rose only in poorer areas","They roughly doubled within a year"],
          answer: 3,
        },
        {
          id: "ac-r-05-q2",
          recordingId: "ac-r-05-r",
          level: "C1",
          stem: "What did matching reports against census data reveal?",
          rationale: "The increase in reports, and the fall in repair times, were both concentrated in neighbourhoods already well served.",
          options: ["The gains were concentrated in well-served neighbourhoods","Reports came evenly from all areas","Poorer neighbourhoods reported considerably more problems overall","Repair times rose everywhere"],
          answer: 0,
        },
        {
          id: "ac-r-05-q3",
          recordingId: "ac-r-05-r",
          level: "C1",
          stem: "What mechanism do the researchers propose?",
          rationale: "They point to the smartphone, website knowledge and account required, which suited residents who already dealt easily with the municipality.",
          options: ["Budgets were cut in poorer districts","The reporting channel favoured confident users","Crews were directed to wealthier streets","Poorer areas had fewer potholes"],
          answer: 1,
        },
        {
          id: "ac-r-05-q4",
          recordingId: "ac-r-05-r",
          level: "C1",
          stem: "Why can average repair time mislead a city?",
          rationale: "The authors note a city measuring itself by average repair time will read the widening inequality as an improvement.",
          options: ["It is measured only once a year","It excludes major roads","It can improve while inequality widens","It ignores the number of reports"],
          answer: 2,
        },
        {
          id: "ac-r-05-q5",
          recordingId: "ac-r-05-r",
          level: "C1",
          stem: "What narrowed the gap in one city?",
          rationale: "The passage ends by noting that where telephone reporting with a staffed line was added, the gap narrowed again.",
          options: ["Removing the account requirement","Publishing repair times as well","Hiring additional repair crews","A staffed telephone reporting line"],
          answer: 3,
        },
      ],
    } satisfies ComprehensionSection,
  ],
};
