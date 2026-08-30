/**
 * IELTS Listening — one complete test. Data only.
 *
 * ── What this is, and what it is not ──────────────────────────────────────
 * Four parts, forty questions, about twenty-one minutes of speech. Every word
 * of every script and every question was written for this product. **No real
 * exam material is reproduced**, and none of it is a transcript of anything.
 *
 * ── The proportions, and why they are what they are ───────────────────────
 * The real paper is mostly COMPLETION — form, note, table, flow-chart,
 * sentence and summary — with matching and labelling present and multiple
 * choice a minority. This test is built to that shape rather than to the
 * shape that was easiest to author:
 *
 *   | kind       | questions | where                                            |
 *   |------------|-----------|--------------------------------------------------|
 *   | completion | 22        | Part 1 form (1–10), Part 2 notes (16, 19), Part 4 (31–40) |
 *   | matching   | 11        | Part 2 map (11–15), Part 3 (21–26)                |
 *   | choice     | 7         | Part 2 (17, 18, 20), Part 3 (27–30)               |
 *
 * The first draft of this bank came out at 20 completion, 11 matching and 9
 * choice — exactly half typed, which failed the check that completion must be
 * the MAJORITY. **The bank was changed to meet the bar rather than the bar
 * lowered to meet the bank**, which is the same mistake this codebase already
 * caught once in `items.check.ts`, where a threshold had been set at the value
 * the bank happened to sit on. Two Part 2 questions that were multiple choice
 * became note completion; both answers are said once in the recording.
 *
 * Twenty-two of the forty are typed, capped, and spelling-marked. That is the
 * point of the format work that preceded this file: forty multiple-choice
 * questions over the same four scripts would have been a substitute for the
 * exam's own task, which this codebase removed from all four skills on the
 * morning of 29 August 2026.
 *
 * ── Where the material came from, and the test it had to pass ─────────────
 * **From the published specification, never from a real paper.** IELTS
 * publishes the structure — four parts, forty questions, the question types,
 * the timings, the marking. None of that is anyone's protected content. No
 * real exam paper was read, quoted, reconstructed or used as a model for any
 * script here, and that is a position rather than a precaution: a product
 * whose whole claim is honesty and compliance, submitted in writing to an
 * immigration authority, cannot have a bank built from reconstructed papers.
 * An evaluator who found one would have reason to doubt the rest of the file.
 *
 * **And every script had to pass the two-year test:** would this still make
 * sense, and still feel current, to a candidate sitting in two years? Nothing
 * here needs today's news to be understood — there is no named politician, no
 * election, no disaster — and nothing here could have been written in 2015
 * without changing a word, which is the other half of the test. The subjects
 * are a leisure centre membership, volunteering at a community garden, a
 * student project on urban transport, and a lecture on urban heat: ordinary,
 * neutral, and of this decade.
 *
 * ── The accents ───────────────────────────────────────────────────────────
 * ielts.org says the recordings carry *"different accents, including British,
 * Australian, New Zealand and North American"* — **including**, so four is a
 * floor. This test spreads four across its four parts: Australian, British,
 * Canadian and Irish. The cast behind them was heard and approved on
 * 29 August 2026; eight of twenty candidate voices were rejected by ear.
 *
 * ── Two honest limits, stated rather than hidden ──────────────────────────
 * 1. **Part 3 has two speakers, not three or four.** The real paper allows up
 *    to four. Our renderer alternates two voices by turn and has been proven
 *    on thirty-nine French recordings; a third voice is a renderer change, not
 *    an authoring one, and shipping a three-hander that renders as two would
 *    be the "one voice reading both speakers" defect wearing a new hat.
 * 2. **The CEFR band on each recording and item is OURS.** IELTS bands 0–9 and
 *    publishes no CEFR mapping per question. The bands here exist because this
 *    product's planner and prescription engine are built on them; they are
 *    unreviewed, and `provenance` says so.
 */
import type { ComprehensionSection } from '../model/types';

/**
 * The plan for Part 2's labelling task.
 *
 * Inline, in the definition, rather than a fetched file: a section must not be
 * able to render half-built in a timed sitting because an image failed to
 * load. Drawn in plain shapes with explicit colours so it reads on any
 * background the app is themed to.
 */
const RIVERBANK_PLAN = `
<svg viewBox="0 0 520 320" width="100%" role="img" aria-label="Plan of the Riverbank Community Garden, with eight lettered positions">
  <rect x="0" y="0" width="520" height="320" fill="#ffffff"/>
  <rect x="20" y="20" width="480" height="280" fill="#f4f6f9" stroke="#183048" stroke-width="2"/>
  <!-- the river along the top -->
  <path d="M20 52 C 140 34, 260 70, 380 46 S 500 60, 500 60" fill="none" stroke="#5BD4C8" stroke-width="12" stroke-linecap="round"/>
  <text x="30" y="44" font-size="12" fill="#5B6670">River</text>
  <!-- main path -->
  <line x1="60" y1="300" x2="60" y2="90" stroke="#C0C6CC" stroke-width="10"/>
  <line x1="60" y1="180" x2="470" y2="180" stroke="#C0C6CC" stroke-width="10"/>
  <line x1="300" y1="180" x2="300" y2="90" stroke="#C0C6CC" stroke-width="10"/>
  <text x="66" y="292" font-size="11" fill="#5B6670">Entrance</text>
  <!-- lettered plots -->
  <g font-size="13" font-weight="700" fill="#183048" text-anchor="middle">
    <rect x="90" y="96" width="70" height="60" fill="#ffffff" stroke="#183048"/><text x="125" y="131">A</text>
    <rect x="190" y="96" width="70" height="60" fill="#ffffff" stroke="#183048"/><text x="225" y="131">B</text>
    <rect x="330" y="96" width="70" height="60" fill="#ffffff" stroke="#183048"/><text x="365" y="131">C</text>
    <rect x="420" y="96" width="60" height="60" fill="#ffffff" stroke="#183048"/><text x="450" y="131">D</text>
    <rect x="90" y="205" width="70" height="60" fill="#ffffff" stroke="#183048"/><text x="125" y="240">E</text>
    <rect x="190" y="205" width="70" height="60" fill="#ffffff" stroke="#183048"/><text x="225" y="240">F</text>
    <rect x="330" y="205" width="70" height="60" fill="#ffffff" stroke="#183048"/><text x="365" y="240">G</text>
    <rect x="420" y="205" width="60" height="60" fill="#ffffff" stroke="#183048"/><text x="450" y="240">H</text>
  </g>
</svg>`.trim();

export const IELTS_LISTENING: ComprehensionSection = {
  kind: 'comprehension',
  id: 'listening',
  skill: 'listening',
  name: { en: 'Listening', fr: 'Compréhension orale' },
  // Published: about 30 minutes of test plus 10 minutes' transfer time on
  // paper. The audio itself is about 21 minutes; the figure below is the
  // published 30 and is not our apportionment.
  timeLimitSec: 30 * 60,
  sets: {
    questions: 40,
    source: 'ielts.org — Listening: 4 parts, 40 questions, about 30 minutes plus 10 minutes to transfer answers on paper.',
  },
  scaleId: 'band',
  delivery: {
    // The whole argument of the listening ruling: the exam plays once, and a
    // practice that replays teaches a candidate to rely on something they will
    // not have. Practice may replay; a sitting may not.
    audioPlaysOnce: true,
    // A candidate reads the questions for a part BEFORE and WHILE it plays.
    // That is the task, and hiding them until the audio ends would be a
    // harder, different exam.
    questionAfterAudio: false,
    transcriptDuringSection: false,
    presentation: 'all_at_once',
    clock: 'section',
    answersLockedOnAnswer: false,
    feedbackDuringSection: false,
  },
  provenance: {
    en: 'Written for this product to the published IELTS Listening format: four parts, forty questions, completion in the majority with matching, labelling and multiple choice alongside. No real exam material is reproduced. The CEFR band on each recording and item is OURS and is unreviewed — IELTS reports bands 0–9 and publishes no per-question CEFR mapping.',
    fr: "Rédigé pour ce produit selon le format publié de l'IELTS Listening : quatre parties, quarante questions, une majorité de réponses à saisir, avec appariement, étiquetage de plan et choix multiple. Aucun matériel d'examen réel n'est reproduit. Le niveau CECRL de chaque enregistrement et de chaque question est LE NÔTRE et n'a pas été relu.",
  },
  families: [
    {
      id: 'transactional',
      label: { en: 'Everyday conversation', fr: 'Conversation courante' },
      describes: {
        en: 'Two people arranging something ordinary — a booking, an enquiry, a form being filled in. What is tested is catching detail exactly: names, numbers, times, and the correction when a speaker changes their mind.',
        fr: "Deux personnes qui organisent quelque chose d'ordinaire. Ce qui est testé, c'est de saisir le détail exact — noms, chiffres, horaires — et la correction lorsqu'un locuteur se reprend.",
      },
      provenance: {
        en: 'Family names follow the four parts IELTS publishes; the assignment of an item to a family is ours and unreviewed.',
        fr: "Les familles suivent les quatre parties publiées par IELTS ; l'affectation de chaque question est la nôtre et non relue.",
      },
    },
    {
      id: 'briefing',
      label: { en: 'Talk to a group', fr: 'Exposé à un groupe' },
      describes: {
        en: 'One speaker explaining a place or an arrangement to people who are new to it. What is tested is following a route or a structure while holding the whole picture.',
        fr: "Un locuteur explique un lieu ou une organisation à des personnes qui la découvrent. Ce qui est testé, c'est de suivre un parcours tout en gardant la vue d'ensemble.",
      },
      provenance: { en: 'As above.', fr: 'Comme ci-dessus.' },
    },
    {
      id: 'discussion',
      label: { en: 'Academic discussion', fr: 'Discussion académique' },
      describes: {
        en: 'Students and a tutor working through a piece of coursework. What is tested is separating who thinks what, and hearing agreement that is not quite agreement.',
        fr: "Des étudiants et un tuteur qui travaillent un devoir. Ce qui est testé, c'est de distinguer qui pense quoi, et d'entendre un accord qui n'en est pas tout à fait un.",
      },
      provenance: { en: 'As above.', fr: 'Comme ci-dessus.' },
    },
    {
      id: 'lecture',
      label: { en: 'Lecture', fr: 'Cours magistral' },
      describes: {
        en: 'A sustained talk on a subject, in an order the speaker signposts. What is tested is holding a structure across several minutes and catching the term that carries the point.',
        fr: "Un exposé suivi, dont le locuteur annonce le plan. Ce qui est testé, c'est de tenir une structure sur plusieurs minutes et de saisir le terme qui porte l'idée.",
      },
      provenance: { en: 'As above.', fr: 'Comme ci-dessus.' },
    },
  ],
  matchingGroups: [
    {
      id: 'gt-l-p2-map',
      recordingId: 'gt-l-p2',
      instruction: 'Label the plan below. Write the correct letter, A–H, next to questions 11–15.',
      figureSvg: RIVERBANK_PLAN,
      options: [
        { id: 'A', label: 'plot A' },
        { id: 'B', label: 'plot B' },
        { id: 'C', label: 'plot C' },
        { id: 'D', label: 'plot D' },
        { id: 'E', label: 'plot E' },
        { id: 'F', label: 'plot F' },
        { id: 'G', label: 'plot G' },
        { id: 'H', label: 'plot H' },
      ],
      reusable: false,
    },
    {
      id: 'gt-l-p3-who',
      recordingId: 'gt-l-p3',
      instruction: 'Who will take on each part of the project? Write the correct letter, A, B or C, next to questions 21–26.',
      options: [
        { id: 'A', label: 'Priya' },
        { id: 'B', label: 'Sam' },
        { id: 'C', label: 'both of them together' },
      ],
      reusable: true,
    },
  ],
  recordings: [
    {
      id: 'gt-l-p1',
      part: { en: 'Part 1', fr: 'Partie 1' },
      level: 'B1',
      family: 'transactional',
      speakers: 2,
      variety: 'australian',
      audioPath: 'ielts-listening/gt-l-p1.mp3',
      voice: {
        voiceId: "zMK1eWY5DTw3Jjb8efU8",
        voiceIds: ["zMK1eWY5DTw3Jjb8efU8", "iIg0uI51lssRFauz7W21", "GrVxA7Ub86nJH91Viyiv"],
        vendorName: "Emily + Neil + James (narrator)",
        requestedVariety: 'australian',
        modelId: "eleven_flash_v2_5",
        renderedAt: "2026-08-29",
      },
      script: "Now turn to Part one. You will hear a man enquiring about membership at a community sports centre. First, you have some time to look at questions one to ten.\n— Riverbank Leisure Centre, good morning. Erin speaking.\n— Oh, hello. I'd like to ask about joining, please. I've just moved into the area.\n— Of course. I'll take a few details and then talk you through what we offer. Can I start with your surname?\n— It's Whitfield.\n— Could you spell that for me?\n— Yes — W, H, I, T, F, I, E, L, D. Whitfield.\n— Thank you. And a contact number?\n— It's oh-seven-double-four, one-nine-six, three-eight-two. Sorry, that's my old one. Let me give you the new one — oh-seven-double-four, one-nine-six, three-two-eight.\n— Three-two-eight at the end. Got it. Now, we run three kinds of membership. There's Standard, which is the gym and the pool. There's Active, which adds every class on the timetable. And there's Family, which covers two adults and up to three children.\n— It would just be me. But I'd want the classes — I'm trying to get back into swimming properly, and there's a technique session I saw on your website.\n— Then Active is the one you want. Standard wouldn't include that session.\n— Active, then.\n— Lovely. Active is normally fifty-two pounds a month. There's an introductory rate for the first three months, though, which brings it down to forty-five.\n— Forty-five. That's better than I expected.\n— It goes up to the full fifty-two in month four, so do bear that in mind. Now, everyone joining does a short induction before their first visit — it's about forty minutes with one of the instructors.\n— When are those?\n— We run them Tuesdays and Thursdays. This week Tuesday's already full, I'm afraid, so the next one would be Thursday.\n— Thursday's fine.\n— And the times are ten in the morning or six in the evening.\n— Six, please. I don't finish work until half past four.\n— Six it is. Do come in something you can move in — you'll be shown the machines and you'll actually use a couple of them. And bring a towel; we don't provide those.\n— A towel. Right.\n— One more thing about the lockers. They take a one-pound coin, and you get it back when you return the key — but if you lose the key there's a charge of fifteen pounds for a replacement.\n— Fifteen. I'll be careful with it.\n— Most people are. Now, was there a particular class you wanted me to book you onto? The technique one you mentioned is called Stroke Clinic, and it fills up.\n— Yes, please — Stroke Clinic.\n— Stroke Clinic, Thursday evenings after your induction. And last thing, for our records: how did you hear about the centre?\n— A colleague, actually. Someone at work swims here.\n— A recommendation. That's what most people say. Right, Mr Whitfield, you're all set. See you Thursday at six.\nThat is the end of Part one.",
    },
    {
      id: 'gt-l-p2',
      part: { en: 'Part 2', fr: 'Partie 2' },
      level: 'B2',
      family: 'briefing',
      speakers: 1,
      variety: 'british',
      audioPath: 'ielts-listening/gt-l-p2.mp3',
      voice: {
        voiceId: "QJksobp1edMNvmwcG5lm",
        voiceIds: ["QJksobp1edMNvmwcG5lm", "GrVxA7Ub86nJH91Viyiv"],
        vendorName: "Juliet + James (narrator)",
        requestedVariety: 'british',
        modelId: "eleven_flash_v2_5",
        renderedAt: "2026-08-29",
      },
      script: "Now turn to Part two. You will hear a volunteer coordinator showing a new group around the Riverbank Community Garden. First, you have some time to look at questions eleven to twenty.\nGood morning, everyone, and thank you for giving up your Saturday. Before we put anyone to work, let me walk you round the plan so you know where things are — you'll be surprised how often people end up watering the wrong beds.\nSo. You've come in through the gate at the bottom left, and the main path runs straight up from there, then turns right along the middle of the site. Keep that shape in your head and you won't get lost.\nThe site is two rows of plots. The top row runs along the river; the bottom row is the one you walk past on your way in from the gate.\nSo, first, the tool store. That's on the bottom row, the very first plot you come to from the entrance. Everything is signed inside and there's a list on the door — please put things back where the list says, not where there's a gap.\nThe compost area is on the same bottom row, but right along at the other end. Not the last plot — the one before it, third along. People do get this wrong, so: third along the bottom, with the pond after it.\nUp on the top row now, along the river. The fruit cages are the first plot up there, directly above the tool store. They're netted, so the door is stiff — lift it rather than pull it.\nThe polytunnel is the biggest structure we have. It's on the top row too, at the far end, the very last plot in that row. It gets the afternoon sun in that corner, which is the whole reason it went there rather than nearer the gate.\nAnd finally the wildlife pond, which is the one I want everyone to be careful around. It is the very last plot on the bottom row, in the corner. There's no fence — that's deliberate, for the hedgehogs — so watch your step, particularly if you've brought children.\nRight. A few practical things.\nFirst, the question everyone asks: can you take produce home? Yes, but not on your first day, and not by the bagful. The rule is that anything harvested on a session day goes to the share table by the entrance, and whatever's left at four o'clock, volunteers may take. It isn't about trust; it's that a share table is how we keep the neighbours on our side.\nSecond, tools. The powered tools — the mower and the strimmer — are for trained volunteers only, and the training runs once a month. Hand tools, anyone can use. Please don't be the person who decides today is the day they learn to strim.\nThird, wet weather. We do not cancel for rain. We cancel for high wind, because of the trees along the river, and you'll get a text by eight in the morning if a session is off. If you haven't had a text, assume we're on.\nFourth, and this one has caught people out: parking. The car park behind the centre is not ours. It belongs to the health centre and they do issue tickets at weekends. There's free parking on Mill Lane, two minutes' walk, and that is what we'd recommend.\nAnd last of all — what we most need from new volunteers is not muscle, honestly. It's people who come back. One person here every other Saturday for a year is worth far more to this garden than twenty people once.\nThat is the end of Part two.",
    },
    {
      id: 'gt-l-p3',
      part: { en: 'Part 3', fr: 'Partie 3' },
      level: 'C1',
      family: 'discussion',
      speakers: 2,
      variety: 'canadian',
      audioPath: 'ielts-listening/gt-l-p3.mp3',
      voice: {
        voiceId: "lgkJiqKJlFaaki1bxYFT",
        voiceIds: ["lgkJiqKJlFaaki1bxYFT", "n5kSEVO24b8CF1IsU4B6", "GrVxA7Ub86nJH91Viyiv"],
        vendorName: "Rebecca + Dave + James (narrator)",
        requestedVariety: 'canadian',
        modelId: "eleven_flash_v2_5",
        renderedAt: "2026-08-29",
      },
      script: "Now turn to Part three. You will hear two students, Priya and Sam, discussing a project on urban transport with each other. First, you have some time to look at questions twenty-one to thirty.\n— Sam, have you got ten minutes? I want to divide the transport project up before Friday.\n— Yeah, now's good. I've got the brief here. Six sections, and we present for twenty minutes between us.\n— Right. So section one is the literature review, and I'd honestly rather do that on my own. I've already read most of it, and two people reading the same forty papers is how we waste a week.\n— No argument. That's yours.\n— Section two is the survey design. That one I think we have to do together — if I write the questions and you analyse the answers, we'll end up with data that doesn't answer anything.\n— Agreed. We sit down and draft the questions in the same room. Both of us.\n— Good. Section three, the cycling case study — that's Amsterdam and Copenhagen.\n— I'll take that. I spent a term there and I've still got contacts at the transport office.\n— Perfect, it's yours. Section four is the bus network modelling, and that's the one I'm nervous about, because it needs the software.\n— Which neither of us has used properly.\n— Which is why I'd rather one of us learns it well than both of us learn it badly. I'll take it. I've got a fortnight before it's due and I'd rather that be my problem.\n— If you're sure. Shout if it goes wrong.\n— Section five is the interviews with commuters.\n— That's got to be both of us — you can't run a focus group on your own and take notes at the same time.\n— That's a fair point. Both, then.\n— And section six, the cost comparison.\n— I'll do that one too. It's spreadsheets, and I'm faster at spreadsheets than you are.\n— I'm not going to pretend otherwise.\n— Right. Now — the part I actually wanted to talk about. Doctor Ellis said our research question was too broad.\n— She did. Although what she actually said was that it was too broad for the time we have. That's not the same as it being a bad question.\n— No, it isn't. So do we narrow it, or do we keep it and say clearly what we couldn't cover?\n— I'd narrow it. A report that admits it couldn't cover half its own question reads as though we ran out of time — which we did, but we don't have to advertise it.\n— See, I'd go the other way. I think naming the limits is what makes it look deliberate rather than rushed.\n— Hmm. We could do both. Narrow the question, and then have a limitations section that says what a wider study would have asked.\n— That I'll agree to.\n— Now, the presentation. Twenty minutes for six sections is three minutes each, which is nothing.\n— We don't present all six. We present the two case studies properly and summarise the rest in one slide.\n— Doctor Ellis will ask about the modelling, though. She always asks about the method.\n— Then we have a slide ready for it, but we don't lead with it. There's a difference between being ready for a question and spending eight of our twenty minutes on it.\n— Fine. One more thing — the deadline. It says Friday the fourteenth on the handbook, but the portal says the sixteenth.\n— The portal is the one that counts. But I'd work to the fourteenth anyway.\n— Why?\n— Because every time I've worked to the real deadline, something has gone wrong on the last day.\nThat is the end of Part three.",
    },
    {
      id: 'gt-l-p4',
      part: { en: 'Part 4', fr: 'Partie 4' },
      level: 'C1',
      family: 'lecture',
      speakers: 1,
      variety: 'irish',
      audioPath: 'ielts-listening/gt-l-p4.mp3',
      voice: {
        voiceId: "9TYDukkUVpJPDSIuv3ir",
        voiceIds: ["9TYDukkUVpJPDSIuv3ir", "GrVxA7Ub86nJH91Viyiv"],
        vendorName: "Darren + James (narrator)",
        requestedVariety: 'irish',
        modelId: "eleven_flash_v2_5",
        renderedAt: "2026-08-29",
      },
      script: "Now turn to Part four. You will hear a lecturer talking about urban heat and how cities are responding to it. First, you have some time to look at questions thirty-one to forty.\nGood afternoon. Today I want to talk about a problem that is easy to measure, hard to see, and increasingly expensive: the fact that a city is warmer than the countryside around it. The phenomenon has a name — the urban heat island — and I want to cover three things. What causes it, what it costs, and what actually works.\nLet's begin with the cause, because there is a common misunderstanding here. People assume the heat is produced by the city: by cars, by air conditioning, by industry. Some of it is, but that is the smaller part. The larger part is not produced at all. It is stored.\nConcrete, brick and asphalt have a high thermal mass. They absorb solar radiation through the day and release it slowly through the night. A field cools quickly after sunset; a street does not. And so the difference between a city and its surroundings is at its greatest not at noon, as you might expect, but a few hours after dark. In a large European city that night-time difference typically reaches four degrees, and in extreme conditions it has been measured above seven.\nThe second contributor is the absence of water. In a landscape with vegetation, a large share of incoming energy goes into evaporating water from leaves and soil — a process called evapotranspiration — and energy spent evaporating water is energy not spent raising the temperature. Pave that landscape and the water runs off into a drain within minutes. The cooling mechanism has been removed, and nothing replaced it.\nThe third is geometry. Narrow streets between tall buildings behave like a series of traps: radiation bounces between the walls rather than escaping upwards. Researchers describe this using the sky view factor — essentially, how much of the sky you can see from street level. The less sky, the less heat escapes.\nSo much for the cause. Now the cost.\nThe obvious cost is health, and it falls unevenly. During the 2003 heatwave in western Europe, mortality rose most sharply among people over seventy-five living alone on upper floors of buildings without ventilation. Heat is not distributed evenly across a city, and neither is the ability to escape it. The neighbourhoods that are hottest are, with tedious reliability, the neighbourhoods with the least tree cover, and those are rarely the wealthy ones.\nThe less obvious cost is energy. Air conditioning is a feedback loop: it cools a building by moving heat outside, which warms the street, which raises the demand for air conditioning. In dense districts this can raise the outdoor temperature by a further degree overnight.\nWhich brings me to what works, and here I want to be careful, because this field has a weakness for the photogenic solution.\nThe most effective intervention, by a wide margin, is trees — mature trees, in streets, in enough numbers to form a continuous canopy. Shade prevents the surface from absorbing the heat in the first place, which is worth more than removing it afterwards, and the evapotranspiration adds cooling on top. Measurements of well-shaded streets consistently show surface temperatures around ten degrees below unshaded ones nearby.\nSecond: surface colour. Painting roofs white, or using reflective paving, raises what is called the albedo — the proportion of sunlight reflected rather than absorbed. It is cheap, it works, and it is unglamorous.\nThird, and this is the one I would ask you to be sceptical about: green roofs. They are popular with planners and they photograph beautifully. They do cool the building beneath them, and they help with rainfall. But a green roof five storeys up does very little for the temperature of the street below, and the street is where people actually are. It is not that they do not work. It is that they are frequently used to answer a question they were never designed to address.\nThe pattern across all three is the same. The interventions that work best are the ones that stop heat being absorbed, rather than the ones that deal with it afterwards. Next week we will look at how these measures are costed, and why the cheapest of them is so often the last to be funded.\nThat is the end of Part four.",
    },
  ],
  items: [
    {
      id: 'gt-l-01',
      kind: 'completion',
      recordingId: 'gt-l-p1',
      level: 'B1',
      stem: 'Membership enquiry form — surname:',
      prompt: 'Surname: ___',
      answer: { accept: ['Whitfield'], maxWords: 1, },
      rationale: 'Spelt out letter by letter, which is what the item tests. A candidate who hears it and does not use the spelling will write Whitfeld or Whitfield with two Ls.',
    },
    {
      id: 'gt-l-02',
      kind: 'completion',
      recordingId: 'gt-l-p1',
      level: 'B1',
      stem: 'Membership enquiry form — telephone number:',
      prompt: 'Telephone: ___',
      answer: { accept: ['0744 196 328', '0744196328', '07441 96328'], maxWords: 3, },
      rationale: 'The speaker gives an old number first and corrects himself. The distractor ends 382; the answer ends 328.',
    },
    {
      id: 'gt-l-03',
      kind: 'completion',
      recordingId: 'gt-l-p1',
      level: 'B1',
      stem: 'Membership enquiry form — type of membership chosen:',
      prompt: 'Membership type: ___',
      answer: { accept: ['Active'], maxWords: 1, },
      rationale: 'Three types are named. Standard is rejected explicitly because it excludes the class he wants; Family does not apply to one person.',
    },
    {
      id: 'gt-l-04',
      kind: 'completion',
      recordingId: 'gt-l-p1',
      level: 'B1',
      stem: 'Membership enquiry form — price per month for the first three months:',
      prompt: 'First three months: £___ per month',
      answer: { accept: ['45', '45 pounds', '£45'], maxWords: 2, },
      rationale: 'Fifty-two is the full price and is said first. The item asks for the introductory rate, which is the second figure.',
    },
    {
      id: 'gt-l-05',
      kind: 'completion',
      recordingId: 'gt-l-p1',
      level: 'B1',
      stem: 'Induction — day:',
      prompt: 'Induction day: ___',
      answer: { accept: ['Thursday'], maxWords: 1, },
      rationale: 'Two days run inductions. Tuesday is named first and then ruled out because it is full.',
    },
    {
      id: 'gt-l-06',
      kind: 'completion',
      recordingId: 'gt-l-p1',
      level: 'B1',
      stem: 'Induction — time:',
      prompt: 'Induction time: ___',
      answer: { accept: ['6pm', '6 pm', '6.00pm', 'six pm', '18:00', '6 p.m.'], maxWords: 2, },
      rationale: 'Two times are offered. He chooses the later one and gives a reason, which is the confirmation.',
    },
    {
      id: 'gt-l-07',
      kind: 'completion',
      recordingId: 'gt-l-p1',
      level: 'B1',
      stem: 'What he is told to bring:',
      prompt: 'Bring: a ___',
      answer: { accept: ['towel'], maxWords: 1, },
      rationale: 'Two things are mentioned — clothing to move in, and a towel. Only the towel is a noun the form can take.',
    },
    {
      id: 'gt-l-08',
      kind: 'completion',
      recordingId: 'gt-l-p1',
      level: 'B2',
      stem: 'Charge for a lost locker key:',
      prompt: 'Lost key: £___',
      answer: { accept: ['15', '15 pounds', '£15'], maxWords: 2, },
      rationale: 'A one-pound coin is mentioned first and is refundable. The charge asked for is the replacement fee.',
    },
    {
      id: 'gt-l-09',
      kind: 'completion',
      recordingId: 'gt-l-p1',
      level: 'B2',
      stem: 'Class booked:',
      prompt: 'Class: ___',
      answer: { accept: ['Stroke Clinic'], maxWords: 2, },
      rationale: 'Two words, and the candidate has heard the class referred to earlier only as "a technique session" — the name itself is said once.',
    },
    {
      id: 'gt-l-10',
      kind: 'completion',
      recordingId: 'gt-l-p1',
      level: 'B2',
      stem: 'How he heard about the centre:',
      prompt: 'Heard about us from: a ___',
      answer: { accept: ['colleague'], maxWords: 1, },
      rationale: 'He says "a colleague" and then "someone at work". The form takes the single noun.',
    },
    {
      id: 'gt-l-11',
      kind: 'matching',
      recordingId: 'gt-l-p2',
      groupId: 'gt-l-p2-map',
      level: 'B2',
      stem: 'Tool store',
      answer: 'E',
      rationale: 'Bottom row, first plot from the entrance. The candidate must fix the entrance and the direction of travel before any of the five can be placed.',
    },
    {
      id: 'gt-l-12',
      kind: 'matching',
      recordingId: 'gt-l-p2',
      groupId: 'gt-l-p2-map',
      level: 'B2',
      stem: 'Compost area',
      answer: 'G',
      rationale: 'The speaker corrects an expected error out loud — "not the last, the one before it, third along" — so the item tests hearing the correction rather than the first plausible position.',
    },
    {
      id: 'gt-l-13',
      kind: 'matching',
      recordingId: 'gt-l-p2',
      groupId: 'gt-l-p2-map',
      level: 'B2',
      stem: 'Fruit cages',
      answer: 'A',
      rationale: 'Given by reference to another plot ("directly above the tool store"), so a candidate who mis-placed question 11 will mis-place this one too. That dependency is deliberate and is how the real task behaves.',
    },
    {
      id: 'gt-l-14',
      kind: 'matching',
      recordingId: 'gt-l-p2',
      groupId: 'gt-l-p2-map',
      level: 'B2',
      stem: 'Polytunnel',
      answer: 'D',
      rationale: 'Top row, far end. The reason given (afternoon sun) is the confirmation rather than the location.',
    },
    {
      id: 'gt-l-15',
      kind: 'matching',
      recordingId: 'gt-l-p2',
      groupId: 'gt-l-p2-map',
      level: 'B2',
      stem: 'Wildlife pond',
      answer: 'H',
      rationale: 'The last plot on the bottom row, and named again in question 12 as coming after the compost — two independent routes to the same answer.',
    },
    {
      id: 'gt-l-16',
      kind: 'completion',
      recordingId: 'gt-l-p2',
      level: 'B2',
      stem: 'Complete the notes on taking produce home:',
      prompt: 'Anything harvested on a session day goes to the ___ by the entrance.',
      answer: { accept: ['share table'], maxWords: 2, },
      rationale: 'Two common words in an uncommon pairing, said once. A candidate who writes "shared table" has heard it and not caught it, which is exactly what the completion format tests and the multiple-choice format hides.',
    },
    {
      id: 'gt-l-17',
      recordingId: 'gt-l-p2',
      level: 'B2',
      stem: 'Who may use the mower and the strimmer?',
      options: ['Any volunteer, after a safety briefing on the day.', 'Only volunteers who have completed the monthly training.', 'Only paid staff.', 'Any volunteer over eighteen.'],
      answer: 1,
      rationale: 'The speaker says "trained volunteers only" and that training runs monthly. The joke that follows names the wrong answer, which is what makes it tempting.',
    },
    {
      id: 'gt-l-18',
      recordingId: 'gt-l-p2',
      level: 'B2',
      stem: 'When is a session cancelled?',
      options: ['When it rains.', 'When the wind is high.', 'Whenever fewer than five volunteers have confirmed.', 'Only in winter.'],
      answer: 1,
      rationale: 'Rain is stated and then explicitly excluded. The reason for the wind rule — the trees along the river — is a confirmation, not the condition.',
    },
    {
      id: 'gt-l-19',
      kind: 'completion',
      recordingId: 'gt-l-p2',
      level: 'B2',
      stem: 'Complete the notes on parking:',
      prompt: 'There is free parking on ___ Lane, two minutes away.',
      answer: { accept: ['Mill'], maxWords: 1, },
      rationale: 'A proper noun said once, immediately after the car park that is NOT theirs — so the candidate has to hold the negative before the answer arrives.',
    },
    {
      id: 'gt-l-20',
      recordingId: 'gt-l-p2',
      level: 'C1',
      stem: 'What does the coordinator say the garden most needs from new volunteers?',
      options: ['Physical strength for the heavier work.', 'Volunteers who keep coming back over a long period.', 'Volunteers with gardening qualifications.', 'Large numbers at the busiest times of year.'],
      answer: 1,
      rationale: 'Stated as a contrast — "not muscle" — and then quantified. A candidate who stops listening at the last practical point misses the whole answer.',
    },
    {
      id: 'gt-l-21',
      kind: 'matching',
      recordingId: 'gt-l-p3',
      groupId: 'gt-l-p3-who',
      level: 'C1',
      stem: 'the literature review',
      answer: 'A',
      rationale: 'Priya claims it and gives a reason. Sam agrees in three words, which is the confirmation a candidate has to catch.',
    },
    {
      id: 'gt-l-22',
      kind: 'matching',
      recordingId: 'gt-l-p3',
      groupId: 'gt-l-p3-who',
      level: 'C1',
      stem: 'the survey design',
      answer: 'C',
      rationale: 'Both, and the reason is given before the decision — the order that makes a candidate wait.',
    },
    {
      id: 'gt-l-23',
      kind: 'matching',
      recordingId: 'gt-l-p3',
      groupId: 'gt-l-p3-who',
      level: 'C1',
      stem: 'the cycling case study',
      answer: 'B',
      rationale: 'Priya introduces the section, which is the trap: introducing a section is not taking it. Sam takes it in the next turn.',
    },
    {
      id: 'gt-l-24',
      kind: 'matching',
      recordingId: 'gt-l-p3',
      groupId: 'gt-l-p3-who',
      level: 'C1',
      stem: 'the bus network modelling',
      answer: 'A',
      rationale: 'Priya names it as the one she is nervous about, Sam does not volunteer, and she takes it anyway. Hesitation is not refusal.',
    },
    {
      id: 'gt-l-25',
      kind: 'matching',
      recordingId: 'gt-l-p3',
      groupId: 'gt-l-p3-who',
      level: 'C1',
      stem: 'the commuter interviews',
      answer: 'C',
      rationale: 'Sam argues for both and Priya concedes. The concession — "that\u2019s a fair point" — is where the answer is settled.',
    },
    {
      id: 'gt-l-26',
      kind: 'matching',
      recordingId: 'gt-l-p3',
      groupId: 'gt-l-p3-who',
      level: 'C1',
      stem: 'the cost comparison',
      answer: 'A',
      rationale: 'Sam names the section and Priya takes it, mirroring question 23 in the opposite direction so neither can be answered by a pattern.',
    },
    {
      id: 'gt-l-27',
      recordingId: 'gt-l-p3',
      level: 'C1',
      stem: 'What did Doctor Ellis say about their research question?',
      // The key was 'That it was too broad for the time they have', eight
      // words of which are said aloud in that order. A candidate who matched
      // the sound of the phrase scored without understanding Priya's
      // correction, which is the entire point of the item. Reworded to carry
      // the same meaning in different words; the distractors are untouched.
      options: ['That it was the wrong question for the module.', 'That its scope was larger than their timetable allowed.', 'That it had already been answered by other studies.', 'That it was too narrow to sustain six sections.'],
      answer: 1,
      rationale: 'Sam paraphrases her as saying it was "too broad", and Priya corrects the paraphrase. The corrected version is the answer, and the uncorrected one is option A\u2019s neighbour.',
    },
    {
      id: 'gt-l-28',
      recordingId: 'gt-l-p3',
      level: 'C1',
      stem: 'What do they decide to do about the research question?',
      // Same defect, same fix: 'a section on what a wider study would have
      // asked' is spoken almost verbatim. The item tests that the candidate
      // hears the two students COMBINE their positions, not that they can
      // recognise a phrase.
      options: ['Keep it as it is and state what they could not cover.', 'Reduce its scope, and record the questions a larger study would ask.', 'Narrow it and say nothing about the limits.', 'Ask Doctor Ellis to decide for them.'],
      answer: 1,
      rationale: 'Each student argues for a different one of the first two options before they combine them. A candidate who answers from either argument alone gets it wrong.',
    },
    {
      id: 'gt-l-29',
      recordingId: 'gt-l-p3',
      level: 'C1',
      stem: 'What do they agree about the presentation?',
      options: ['They will give equal time to all six sections.', 'They will present the two case studies fully and summarise the rest.', 'They will present only the modelling, since it is the hardest part.', 'They will let Doctor Ellis choose what they cover.'],
      answer: 1,
      rationale: 'The arithmetic — twenty minutes over six sections — is stated as the problem, and the answer is the response to it. The modelling slide is prepared but deliberately not led with.',
    },
    {
      id: 'gt-l-30',
      recordingId: 'gt-l-p3',
      level: 'C1',
      stem: 'What do they say about the deadline?',
      options: ['The handbook date is the one that counts.', 'The portal date is official, but they will work to the earlier one.', 'They will ask for an extension.', 'The two dates are the same once weekends are counted.'],
      answer: 1,
      rationale: 'Two dates conflict; one is authoritative and the other is the one they will actually work to. Both halves are needed and they are said in separate turns.',
    },
    {
      id: 'gt-l-31',
      kind: 'completion',
      recordingId: 'gt-l-p4',
      level: 'C1',
      stem: 'Notes on urban heat — the cause:',
      prompt: 'Most of the heat in a city is not produced there; it is ___.',
      answer: { accept: ['stored'], maxWords: 1, },
      rationale: 'The lecturer sets up the common misunderstanding first, so the answer arrives as a contrast with what the candidate has just heard.',
    },
    {
      id: 'gt-l-32',
      kind: 'completion',
      recordingId: 'gt-l-p4',
      level: 'C1',
      stem: 'Notes on urban heat — why materials hold heat:',
      prompt: 'Concrete, brick and asphalt have a high ___ mass.',
      answer: { accept: ['thermal'], maxWords: 1, },
      rationale: 'A technical collocation said once. The surrounding sentence explains it, so a candidate can reconstruct the meaning but must catch the word.',
    },
    {
      id: 'gt-l-33',
      kind: 'completion',
      recordingId: 'gt-l-p4',
      level: 'C1',
      stem: 'Notes on urban heat — when the difference is greatest:',
      prompt: 'The city is warmest compared with the countryside a few hours after ___.',
      answer: { accept: ['dark', 'sunset', 'nightfall'], maxWords: 1, },
      rationale: 'Noon is offered explicitly as the expected wrong answer in the same sentence.',
    },
    {
      id: 'gt-l-34',
      kind: 'completion',
      recordingId: 'gt-l-p4',
      level: 'C1',
      stem: 'Notes on urban heat — typical night-time difference:',
      prompt: 'In a large European city the night-time difference typically reaches ___ degrees.',
      answer: { accept: ['four', '4'], maxWords: 1, },
      rationale: 'Two figures are given in one sentence — the typical four and the extreme above seven. The item asks for the typical one.',
    },
    {
      id: 'gt-l-35',
      kind: 'completion',
      recordingId: 'gt-l-p4',
      level: 'C2',
      stem: 'Notes on urban heat — the missing cooling mechanism:',
      prompt: 'Energy used to evaporate water from leaves and soil is called ___.',
      answer: { accept: ['evapotranspiration'], maxWords: 1, },
      rationale: 'One long technical word, defined immediately before it is named. The spelling is the whole difficulty and is exactly what the format now marks.',
    },
    {
      id: 'gt-l-36',
      kind: 'completion',
      recordingId: 'gt-l-p4',
      level: 'C2',
      stem: 'Notes on urban heat — street geometry:',
      prompt: 'How much sky is visible from street level is measured by the ___ factor.',
      answer: { accept: ['sky view'], maxWords: 2, },
      rationale: 'A two-word term where each word is common and the pairing is not. A candidate who writes "skyview" has heard it and not caught it.',
    },
    {
      id: 'gt-l-37',
      kind: 'completion',
      recordingId: 'gt-l-p4',
      level: 'C1',
      stem: 'Notes on urban heat — who is most at risk:',
      prompt: 'In 2003, mortality rose most among people over ___ living alone.',
      answer: { accept: ['75', 'seventy-five', 'seventy five'], maxWords: 2, },
      rationale: 'A number inside a sentence with two other numbers nearby. Both digit and word forms are accepted because the lecturer says it in words.',
    },
    {
      id: 'gt-l-38',
      kind: 'completion',
      recordingId: 'gt-l-p4',
      level: 'C1',
      stem: 'Notes on urban heat — the air-conditioning loop:',
      prompt: 'In dense districts, air conditioning can raise the outdoor temperature by a further ___ overnight.',
      answer: { accept: ['degree', 'one degree', '1 degree'], maxWords: 2, },
      rationale: 'The feedback loop is described before the figure, so the candidate has to hold the structure to know which number is being reported.',
    },
    {
      id: 'gt-l-39',
      kind: 'completion',
      recordingId: 'gt-l-p4',
      level: 'C2',
      stem: 'Notes on urban heat — what reflective surfaces change:',
      prompt: 'Painting roofs white raises the ___.',
      answer: { accept: ['albedo'], maxWords: 1, },
      rationale: 'Named and then defined, which is the reverse of question 35 — the candidate meets the word before they can use the definition to catch it.',
    },
    {
      id: 'gt-l-40',
      kind: 'completion',
      recordingId: 'gt-l-p4',
      level: 'C1',
      stem: 'Notes on urban heat — the limit of green roofs:',
      prompt: 'A green roof does very little for the temperature of the ___ below.',
      answer: { accept: ['street'], maxWords: 1, },
      rationale: 'The lecturer\u2019s scepticism is the point of the whole final section, and the answer is the single word the argument turns on.',
    },
  ],
};
