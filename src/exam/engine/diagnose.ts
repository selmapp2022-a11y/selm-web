/**
 * Layer 2 — the diagnostic tier.
 *
 * Layer 1 (`gate.ts`) refuses responses the exam would not mark. This layer
 * runs on responses the gate PASSED, and asks the question the gate cannot:
 * this will be marked, so why will it be marked low?
 *
 * No model is called here either. Everything below is counted, and every
 * count is returned as a `Signal` with the threshold it was compared
 * against, so a wrong threshold is visible rather than buried.
 *
 * ⚠ The thresholds in `definitions/prescriptions/*.ts` are OURS and are not
 * yet reviewed by a francophone examiner. That review is Amendment 1 §3.3
 * and it is the one item in the cell that cannot be done by machine.
 */
import type { Diagnosis, Signal } from '../model/prescription';
import type { GateRule, TaskDefinition } from '../model/types';
import { keywordHits, DEFAULT_SEGMENTATION, type Segmentation } from './text';

/** Sentence split that survives abbreviations badly and French fine. */
export function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?…])\s+/u)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * The lexicons moved out on 2026-08-28.
 *
 * They were French word lists inside `engine/`, which is the file that
 * `types.ts` says must never name a language. Re-exported here so existing
 * imports keep working; owned by `definitions/prescriptions/lexicon.fr.ts`.
 */
export { CONTRAST as CONTRAST_MARKERS, STRUCTURAL_CONTRAST, STANCE as STANCE_MARKERS } from '../definitions/prescriptions/lexicon.fr';
import { CONTRAST, STRUCTURAL_CONTRAST as SC, STANCE } from '../definitions/prescriptions/lexicon.fr';

function norm(s: string): string {
  return s.toLowerCase().normalize('NFC');
}

export function countAny(text: string, needles: string[]): number {
  const t = norm(text);
  let n = 0;
  for (const needle of needles) {
    let i = t.indexOf(norm(needle));
    while (i !== -1) {
      n += 1;
      i = t.indexOf(norm(needle), i + 1);
    }
  }
  return n;
}

function sourceRule(task: TaskDefinition): Extract<GateRule, { id: 'source_coverage' }> | null {
  const r = (task.gate ?? []).find((g) => g.id === 'source_coverage');
  return (r as Extract<GateRule, { id: 'source_coverage' }> | undefined) ?? null;
}

export type ComparisonMetrics = {
  /** Sentences containing keywords from BOTH declared sources. */
  bridgeSentences: number;
  /** Times the dominant source changes from one tagged sentence to the next. */
  alternations: number;
  /** Opposition/concession markers anywhere in the response. */
  contrastMarkers: number;
  /** Source keywords inside the sentences that carry the candidate's stance. */
  opinionAnchors: number;
  /** Sentences that carry a stance marker at all. */
  opinionSentences: number;
};

/**
 * The measurements behind "did this response compare, or did it summarise
 * twice". Meaningless on a task that declares no sources, which is why the
 * cell is bound to a coordinate rather than to a skill.
 */
export function comparisonMetrics(task: TaskDefinition, text: string, seg: Segmentation = DEFAULT_SEGMENTATION): ComparisonMetrics {
  const rule = sourceRule(task);
  const srcs = rule?.sources ?? [];
  const sents = sentences(text);

  let bridgeSentences = 0;
  const tags: Array<string | null> = [];

  for (const s of sents) {
    const hits = srcs.map((src) => ({ id: src.id, n: keywordHits(s, src.keywords, seg) }));
    const present = hits.filter((h) => h.n > 0);
    if (present.length >= 2) {
      // Both documents are in this sentence. It is a BRIDGE only if it also
      // sets them against each other — structurally, or by engaging each
      // document with more than one word.
      const structural = countAny(s, SC) > 0;
      const engaged = present.every((h) => h.n >= 2);
      if (structural || engaged) bridgeSentences += 1;
      tags.push('both');
    } else if (present.length === 1) {
      tags.push(present[0].id);
    } else {
      tags.push(null);
    }
  }

  let alternations = 0;
  let last: string | null = null;
  for (const t of tags) {
    if (t === null) continue;
    if (last !== null && t !== last) alternations += 1;
    last = t;
  }

  const opinion = sents.filter((s) => countAny(s, STANCE) > 0);
  const opinionAnchors = opinion.reduce(
    (n, s) => n + srcs.reduce((m, src) => m + keywordHits(s, src.keywords, seg), 0),
    0,
  );

  return {
    bridgeSentences,
    alternations,
    contrastMarkers: countAny(text, CONTRAST),
    opinionAnchors,
    opinionSentences: opinion.length,
  };
}

export type JuxtapositionThresholds = {
  minBridgeSentences: number;
  minContrastMarkers: number;
  minOpinionAnchors: number;
};

/**
 * `juxtaposition-sans-comparaison` — the NCLC 6 failure on TCF tâche 3.
 *
 * A response that treats both documents in sequence, never sets them
 * against each other, and ends on an opinion that is not attached to
 * anything either document said. The gate is silent on it: both sources are
 * covered, so `source_coverage` passes and the response is marked. It is
 * marked at 7–9 of 20, which is NCLC 6 — exactly one level below the NCLC 7
 * the French Express Entry category asks for.
 *
 * Fires on the AND of two weak signals rather than on either alone,
 * because each has an obvious false positive on its own: a response can
 * compare well inside a single long sentence (no alternation), and a
 * response can be stuffed with "mais" and still be two summaries.
 */
export function diagnoseJuxtaposition(
  task: TaskDefinition,
  text: string,
  t: JuxtapositionThresholds,
  seg: Segmentation = DEFAULT_SEGMENTATION,
): Diagnosis {
  const m = comparisonMetrics(task, text, seg);

  const signals: Signal[] = [
    {
      id: 'bridge_sentences',
      label: {
        en: 'Sentences that hold both documents at once',
        fr: 'Phrases qui tiennent les deux documents à la fois',
      },
      measured: m.bridgeSentences,
      threshold: t.minBridgeSentences,
      tripped: m.bridgeSentences < t.minBridgeSentences,
    },
    {
      id: 'contrast_markers',
      label: { en: 'Markers of opposition', fr: "Marqueurs d'opposition" },
      measured: m.contrastMarkers,
      threshold: t.minContrastMarkers,
      tripped: m.contrastMarkers < t.minContrastMarkers,
    },
    {
      id: 'opinion_anchors',
      label: {
        en: 'Document vocabulary inside the opinion',
        fr: "Vocabulaire des documents à l'intérieur de l'avis",
      },
      measured: m.opinionAnchors,
      threshold: t.minOpinionAnchors,
      tripped: m.opinionAnchors < t.minOpinionAnchors,
    },
  ];

  const structural = signals[0].tripped && signals[1].tripped;

  // The floating-opinion branch only counts when nothing ELSE in the
  // response connected the documents either.
  //
  // Measured 2026-08-28, and it is why this condition exists: on 4 of 8
  // items the NCLC 7 model answer was diagnosed as the failure, because a
  // good answer anchors its opinion to the NAMED disagreement — "sur ce
  // point précis" — rather than by repeating document vocabulary inside the
  // opinion sentence. Requiring source words there punished the better
  // writing. A response that bridged the two documents somewhere has
  // compared them, wherever it put its opinion.
  const floating = signals[2].tripped && m.opinionSentences > 0 && m.bridgeSentences === 0;

  return { failureModeId: 'juxtaposition-sans-comparaison', fired: structural || floating, signals };
}

// ── tâche 1 · `message-sans-information` ────────────────────────────────

import { EVALUATIVE, LEARNED, SEQUENCE, PIVOT, BEFORE_AFTER } from '../definitions/prescriptions/lexicon.fr';

/**
 * Concrete informational tokens: numbers, durations, and capitalised words
 * that are not sentence-initial.
 *
 * The last of these is the crude one and it is crude on purpose. A proper
 * noun mid-sentence — a place, a tool, a name — is almost always a FACT,
 * and a response made entirely of evaluations contains none. Counting them
 * is not understanding them, and this layer does not claim to.
 */
export function factTokens(text: string): number {
  const digits = (text.match(/\b\d+([.,]\d+)?\b/g) ?? []).length;
  const sentences_ = sentences(text);
  let propers = 0;
  for (const s of sentences_) {
    const words_ = s.split(/\s+/).slice(1);
    for (const w of words_) if (/^[A-ZÀ-Þ][\p{L}-]{2,}/u.test(w)) propers += 1;
  }
  return digits + propers;
}

export type MessageThresholds = {
  minFacts: number;
  /** Evaluative adjectives per 100 words, above which the response is telling. */
  maxEvaluativePer100: number;
};

/**
 * What the second half of THIS item's instruction asks for.
 *
 * Passed in rather than held here, because tâche 1's instruction always has
 * two halves and the second half differs by prompt: *what you learned*, or
 * *what changes for the reader*, or *what the rules are*. A global list
 * diagnosed four correct answers as failures before this argument existed.
 */
export type SecondRequirement = string[];

/**
 * `message-sans-information` — the NCLC 6 failure on TCF tâche 1.
 *
 * A message that is polite, correct and empty. The instruction asks two
 * things — *décrire cette formation* and *expliquer ce que vous avez
 * appris* — and a response can be fluent French while doing neither, by
 * saying the course was interesting and useful and that the candidate
 * learned a lot.
 *
 * The gate is silent on it: the word count is fine, the topic keywords hit,
 * nothing is copied. It is marked, and marked at 7–9 of 20 under
 * `capacite_informer`, which is NCLC 6.
 */
export function diagnoseEmptyMessage(
  _task: TaskDefinition,
  text: string,
  t: MessageThresholds,
  secondRequirement: SecondRequirement = LEARNED,
  seg: Segmentation = DEFAULT_SEGMENTATION,
): Diagnosis {
  const words_ = text.split(/\s+/).filter(Boolean).length || 1;
  const facts = factTokens(text);
  const evaluatives = countAny(text, EVALUATIVE);
  const evalPer100 = (evaluatives * 100) / words_;
  const learned = countAny(text, secondRequirement);
  void seg;

  const signals: Signal[] = [
    {
      id: 'facts',
      label: { en: 'Things a reader could repeat', fr: 'Choses qu’un lecteur pourrait répéter' },
      measured: facts,
      threshold: t.minFacts,
      tripped: facts < t.minFacts,
    },
    {
      id: 'evaluative_density',
      label: { en: 'Evaluative words per 100', fr: 'Mots d’appréciation pour 100' },
      measured: Math.round(evalPer100 * 10) / 10,
      threshold: t.maxEvaluativePer100,
      tripped: evalPer100 > t.maxEvaluativePer100,
    },
    {
      id: 'second_requirement',
      label: {
        en: 'Answers the second half of the instruction',
        fr: 'Répond à la seconde moitié de la consigne',
      },
      measured: learned,
      threshold: 1,
      tripped: learned < 1,
    },
  ];

  // Two ways to fail, and they are different failures: nothing concrete to
  // report, or one of the instruction's two requirements simply skipped.
  const empty = signals[0].tripped && signals[1].tripped;
  const halfDone = signals[2].tripped;
  return { failureModeId: 'message-sans-information', fired: empty || halfDone, signals };
}

// ── tâche 2 · `recit-sans-bascule` ──────────────────────────────────────

export type NarrativeThresholds = {
  /** Sequence markers below which there is no narrative to judge. */
  minSequence: number;
  minPivot: number;
};

/**
 * `recit-sans-bascule` — the NCLC 6 failure on TCF tâche 2.
 *
 * Events in order, and nothing turns. The instruction asks for *ce que cela
 * a changé pour vous*, so the change IS the task; a response that lists a
 * day from morning to evening has written a diary entry and answered the
 * easier question.
 *
 * Counted rather than understood: sequence markers say a narrative is being
 * attempted, and the absence of any pivot or before-and-after says it never
 * arrives anywhere. A response with no sequence markers at all is a
 * different problem and this detector stays quiet about it.
 */
export function diagnoseNoPivot(
  _task: TaskDefinition,
  text: string,
  t: NarrativeThresholds,
  seg: Segmentation = DEFAULT_SEGMENTATION,
): Diagnosis {
  void seg;
  const sequence = countAny(text, SEQUENCE);
  const pivot = countAny(text, PIVOT);
  const beforeAfter = countAny(text, BEFORE_AFTER);

  const signals: Signal[] = [
    {
      id: 'sequence',
      label: { en: 'Markers that move the story', fr: 'Marqueurs qui font avancer le récit' },
      measured: sequence,
      threshold: t.minSequence,
      tripped: sequence < t.minSequence,
    },
    {
      id: 'pivot',
      label: { en: 'The turn — what changed', fr: 'La bascule — ce qui a changé' },
      measured: pivot,
      threshold: t.minPivot,
      tripped: pivot < t.minPivot,
    },
    {
      id: 'before_after',
      label: { en: 'Before set against after', fr: 'Un avant opposé à un après' },
      measured: beforeAfter,
      threshold: 1,
      tripped: beforeAfter < 1,
    },
  ];

  // Only fires on a response that IS narrating. Without sequence markers
  // there is no récit to be missing a turn from, and saying so would be
  // diagnosing the wrong thing.
  const narrating = !signals[0].tripped;
  const noTurn = signals[1].tripped && signals[2].tripped;
  return { failureModeId: 'recit-sans-bascule', fired: narrating && noTurn, signals };
}

// ── expression orale ────────────────────────────────────────────────────

import {
  DEVELOPMENT, REASON, OPEN_QUESTION, CLOSED_QUESTION,
  SUPPORT, CONCESSION, OBJECTION,
} from '../definitions/prescriptions/lexicon.fr';

/**
 * `presentation-catalogue` — the NCLC 6 failure on TCF expression orale,
 * tâche 1.
 *
 * A self-presentation read out as a list. *Je m'appelle… Je suis… J'ai…
 * Je travaille… J'habite…* — five true sentences, each of which ends where
 * it began, and then two minutes of silence to fill with nothing left to
 * say.
 *
 * **The candidate has not run out of facts. They have run out of the words
 * that attach one fact to another**, which is why the fix is a word list and
 * not more biography. The instruction also asks *ce qui vous a amené à
 * apprendre le français* — a reason — and a catalogue never gives one.
 */
export type PresentationThresholds = { minDevelopment: number; maxJeOpeningShare: number };

export function diagnoseCatalogue(
  _task: TaskDefinition,
  text: string,
  t: PresentationThresholds,
  seg: Segmentation = DEFAULT_SEGMENTATION,
): Diagnosis {
  void seg;
  const sents = sentences(text);
  const jeOpening = sents.filter((s) => /^\s*(je|j’|j')/i.test(s)).length;
  const share = sents.length ? jeOpening / sents.length : 0;
  const development = countAny(text, DEVELOPMENT);
  const reason = countAny(text, REASON);

  const signals: Signal[] = [
    {
      id: 'development',
      label: { en: 'Words that attach one fact to the next', fr: 'Mots qui relient un fait au suivant' },
      measured: development,
      threshold: t.minDevelopment,
      tripped: development < t.minDevelopment,
    },
    {
      id: 'je_opening_share',
      label: { en: 'Sentences beginning "Je"', fr: 'Phrases commençant par « Je »' },
      measured: Math.round(share * 100) / 100,
      threshold: t.maxJeOpeningShare,
      tripped: share > t.maxJeOpeningShare,
    },
    {
      id: 'reason',
      label: { en: 'Says why, as the instruction asks', fr: 'Dit pourquoi, comme la consigne le demande' },
      measured: reason,
      threshold: 1,
      tripped: reason < 1,
    },
  ];

  const cataloguing = signals[0].tripped && signals[1].tripped;
  return { failureModeId: 'presentation-catalogue', fired: cataloguing || signals[2].tripped, signals };
}

/**
 * `questions-fermees` — the NCLC 6 failure on tâche 2, and the one the exam
 * is most explicit about.
 *
 * Tâche 2 is the only task in the exam where **the candidate asks and the
 * examiner answers**. The instruction is *obtenez les informations dont vous
 * avez besoin* — obtaining is the task. A candidate who asks *est-ce que le
 * chauffage sera réparé ?* gets "oui", and has three minutes left and
 * nothing obtained.
 *
 * `required` is per item: each prompt names the specific things to find out,
 * so the markers belong to the prompt. Same lesson as tâche 1's second
 * requirement, learned the same way.
 */
export type QuestionThresholds = { minQuestions: number; minOpen: number; minRequired: number };

export function diagnoseClosedQuestions(
  _task: TaskDefinition,
  text: string,
  t: QuestionThresholds,
  required: string[][] = [],
  seg: Segmentation = DEFAULT_SEGMENTATION,
): Diagnosis {
  void seg;
  const marks = (text.match(/\?/g) ?? []).length;
  const open = countAny(text, OPEN_QUESTION);
  const closed = countAny(text, CLOSED_QUESTION);
  const asked = Math.max(marks, open + closed);
  const covered = required.filter((group) => countAny(text, group) > 0).length;

  const signals: Signal[] = [
    {
      id: 'questions_asked',
      label: { en: 'Questions asked at all', fr: 'Questions réellement posées' },
      measured: asked,
      threshold: t.minQuestions,
      tripped: asked < t.minQuestions,
    },
    {
      id: 'open_questions',
      label: { en: 'Questions that come back with something', fr: 'Questions qui rapportent quelque chose' },
      measured: open,
      threshold: t.minOpen,
      tripped: open < t.minOpen,
    },
    {
      id: 'required_covered',
      label: { en: 'Things the instruction told you to find out', fr: 'Points que la consigne demandait d’obtenir' },
      measured: covered,
      threshold: t.minRequired,
      tripped: required.length > 0 && covered < t.minRequired,
    },
  ];

  return {
    failureModeId: 'questions-fermees',
    fired: signals[0].tripped || signals[1].tripped || signals[2].tripped,
    signals,
  };
}

/**
 * `avis-sans-defense` — the NCLC 6 failure on tâche 3.
 *
 * The instruction has three parts: give your view, **support it**, and say
 * what you would answer someone who disagreed. A response can state a clear
 * view in good French and then restate it three times more firmly, which
 * satisfies the first part and neither of the others.
 *
 * Conceding once is what separates arguing from repeating, and at this level
 * it is also the cheapest thing to teach: one sentence, one connective.
 */
export type ArgumentThresholds = { minSupport: number };

export function diagnoseUndefended(
  _task: TaskDefinition,
  text: string,
  t: ArgumentThresholds,
  seg: Segmentation = DEFAULT_SEGMENTATION,
): Diagnosis {
  void seg;
  const support = countAny(text, SUPPORT);
  const concession = countAny(text, CONCESSION);
  const objection = countAny(text, OBJECTION);

  const signals: Signal[] = [
    {
      id: 'support',
      label: { en: 'Reasons and instances', fr: 'Raisons et exemples' },
      measured: support,
      threshold: t.minSupport,
      tripped: support < t.minSupport,
    },
    {
      id: 'concession',
      label: { en: 'Conceded something once', fr: 'A concédé quelque chose une fois' },
      measured: concession,
      threshold: 1,
      tripped: concession < 1,
    },
    {
      id: 'objection',
      label: { en: 'Met the objection the instruction asks for', fr: 'A répondu à l’objection demandée' },
      measured: objection,
      threshold: 1,
      tripped: objection < 1,
    },
  ];

  // Supporting nothing is one failure; supporting well while never admitting
  // the other side exists is a different one, and the instruction asks for
  // both, so either fires.
  const unsupported = signals[0].tripped;
  const undefended = signals[1].tripped && signals[2].tripped;
  return { failureModeId: 'avis-sans-defense', fired: unsupported || undefended, signals };
}
