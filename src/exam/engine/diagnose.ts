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
 * Opposition and concession markers, B1 and below. The list is short on
 * purpose: it is a floor test — "did this response mark contrast at all" —
 * not a style score.
 */
export const CONTRAST_MARKERS = [
  'en revanche',
  'tandis que',
  'alors que',
  'au contraire',
  'contrairement',
  'cependant',
  'pourtant',
  'toutefois',
  'à l’inverse',
  "à l'inverse",
  'par contre',
  's’oppose',
  "s'oppose",
  'désaccord',
  'là où',
  'mais',
];

/**
 * The subset that marks contrast STRUCTURALLY rather than in passing.
 *
 * `mais` is excluded on purpose and the reason was measured: on 2 of 8
 * items the NCLC 6 response was not diagnosed, because a sentence that
 * merely REPORTS one document's worry about the other's proposal —
 * "l'amende touchera surtout les petits logements" — contains words from
 * both documents and was being counted as a comparison. Holding both
 * documents in one sentence is necessary and not sufficient; the sentence
 * has to set them against each other.
 */
export const STRUCTURAL_CONTRAST = [
  'en revanche', 'tandis que', 'alors que', 'au contraire', 'contrairement',
  'à l’inverse', "à l'inverse", 'par contre', 's’oppose', "s'oppose",
  'désaccord', 'là où', 'cependant', 'pourtant', 'toutefois',
];

/** First-person stance markers — where the candidate's own opinion lives. */
export const STANCE_MARKERS = [
  'je pense',
  'à mon avis',
  'pour ma part',
  'selon moi',
  'je trouve',
  'je crois',
  'j’estime',
  "j'estime",
  'il me semble',
];

function norm(s: string): string {
  return s.toLowerCase().normalize('NFC');
}

function countAny(text: string, needles: string[]): number {
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
      const structural = countAny(s, STRUCTURAL_CONTRAST) > 0;
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

  const opinion = sents.filter((s) => countAny(s, STANCE_MARKERS) > 0);
  const opinionAnchors = opinion.reduce(
    (n, s) => n + srcs.reduce((m, src) => m + keywordHits(s, src.keywords, seg), 0),
    0,
  );

  return {
    bridgeSentences,
    alternations,
    contrastMarkers: countAny(text, CONTRAST_MARKERS),
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
