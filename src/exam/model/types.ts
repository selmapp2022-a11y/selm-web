/**
 * The exam-agnostic model.
 *
 * Everything in this file is a SHAPE. Nothing here names an exam, a language,
 * a scale or a criterion. A concrete exam lives entirely in
 * `src/exam/definitions/*.ts` as data of these types, and the engine in
 * `src/exam/engine/*.ts` reads only these types.
 *
 * The test this design has to pass: running one task under two different
 * exam definitions — IELTS General Training in English and TCF Canada in
 * French — must not require a single edit inside `engine/`. If it does, the
 * abstraction is in the wrong place and it says so out loud rather than
 * being patched around.
 */

/** A string that exists in each language the product renders. */
export type Localised = Record<LanguageCode, string>;

export type LanguageCode = 'en' | 'fr';

/** BCP-47 tag used for audio, spell-checking and word segmentation. */
export type Locale = string;

// ── scales ──────────────────────────────────────────────────────────────
//
// IELTS reports bands 4–9. TCF writing and speaking report 0–20. TEF Canada
// reports /450. None of that belongs in code, so a scale is declared.

export type Scale = {
  id: string;
  label: Localised;
  min: number;
  max: number;
  /** Smallest reportable increment. IELTS criteria: 1. TCF: 1. */
  step: number;
  /** How a value on this scale is written out. */
  display: {
    prefix?: Localised;
    suffix?: Localised;
    decimals: number;
  };
};

/**
 * The government benchmark an exam result converts into. Canada reads CLB
 * for English and NCLC for French; nothing else in the product does the
 * conversion, so it is a lookup table on the definition.
 *
 * The system is a free string rather than a union of the two Canadian ones.
 * A union would have been the last place in the model where a destination
 * was named in code, and a UK or Australian points system would have needed
 * this file edited to be expressible.
 *
 * `from` is the lowest scale value that earns `level`, so the table is read
 * downward and the first match wins.
 */
export type BenchmarkSystem = string;

export type BenchmarkMap = {
  system: BenchmarkSystem;
  bands: Array<{ from: number; level: number }>;
};

// ── the exam tree ───────────────────────────────────────────────────────

export type SkillId = 'speaking' | 'listening' | 'reading' | 'writing';

export type Criterion = {
  id: string;
  label: Localised;
  /** Optional per-criterion scale; defaults to the task's scale. */
  scaleId?: string;
};

/**
 * A deterministic rule evaluated before any model is called — layer 1 of the
 * seven-layer engine. Every rule id below is implemented once, generically,
 * in `engine/gate.ts`; a definition chooses which rules apply and with what
 * numbers.
 */
export type GateRule =
  | { id: 'min_words'; words: number; verdict: GateVerdict }
  | { id: 'max_words'; words: number; verdict: GateVerdict }
  | { id: 'prompt_copy'; maxOverlapRatio: number; verdict: GateVerdict }
  | { id: 'template_ratio'; maxRatio: number; verdict: GateVerdict }
  | { id: 'off_topic'; minKeywordHits: number; verdict: GateVerdict }
  | { id: 'empty'; verdict: GateVerdict };

export type GateVerdict = {
  /**
   * `zero` — the official scheme awards no marks regardless of language
   * quality (TCF: "A1 non atteint"). `penalty` — marks are deducted.
   * `warn` — no official consequence, shown to the candidate anyway.
   */
  kind: 'zero' | 'penalty' | 'warn';
  label: Localised;
  detail: Localised;
};

/**
 * How a scored judgement is obtained. `none` is a first-class value: an exam
 * with no judge bound yet is a normal state of the system, not an error, and
 * it is what keeps an unbuilt exam honest instead of fabricated.
 */
/**
 * Layer 2 — the signal layer.
 *
 * For a spoken response the deterministic gate cannot run until there are
 * words to count, and the words come from transcription. So the signal layer
 * runs BEFORE the gate for audio tasks, not after it as the seven-layer
 * diagram in the business plan implies. The diagram's order holds for
 * written responses only.
 */
export type SignalBinding =
  | { kind: 'none' }
  | {
      kind: 'remote';
      adapter: 'speech_evaluate';
      endpoint: string;
      /** BCP-47 tag sent to the transcriber. */
      language: Locale;
      /** Extra multipart fields, e.g. `mode: 'ielts'`. */
      fields?: Record<string, string>;
    };

/**
 * What repeated calls to the same judge, on the same text, actually did.
 *
 * This is REPEATABILITY, not accuracy. It says how much the judge disagrees
 * with itself; it says nothing about whether it agrees with a human examiner.
 * `ExamDefinition.calibration` is the accuracy record and is a different
 * thing — a judge can be perfectly stable and consistently wrong.
 *
 * It lives on the binding rather than on the exam because it is a property
 * of the judge, and rebinding a different judge invalidates it.
 */
export type StabilityRecord = {
  /** ISO date the measurement was taken. */
  measuredAt: string;
  /** Distinct responses the judge was shown. */
  responses: number;
  /** Identical calls made per response. */
  callsPerResponse: number;
  /** Scale the two spreads below are expressed on — the judge's own. */
  scaleId: string;
  /** Largest spread on the overall value across identical calls. */
  worstOverallSpread: number;
  /** Largest spread on any single criterion across identical calls. */
  worstCriterionSpread: number;
  /** What was measured, and what it does not establish. */
  note: Localised;
};

export type JudgeBinding =
  | { kind: 'none'; reason: Localised }
  | {
      /**
       * Reads the payload the signal layer already fetched, instead of
       * making a second call. Uploading the same recording twice to score it
       * twice would be paying twice for one answer.
       */
      kind: 'from_signal';
      adapter: 'ielts_speaking';
      judgeScale: Scale;
      toExamScale: { kind: 'none'; reason: Localised };
    }
  | {
      kind: 'remote';
      /** Adapter name — see `engine/judge.ts`. */
      adapter: 'writing_assess';
      endpoint: string;
      /** Extra fields merged into the request body. */
      payload?: Record<string, string>;
      /**
       * The scale the judge itself answers on. This is NOT the exam's scale
       * unless `toExamScale` says a measured mapping exists. A general
       * writing score out of 100 is not an IELTS band, and rescaling one
       * onto the other produces a number no examiner would recognise.
       */
      judgeScale: Scale;
      /**
       * Whether the judge's output can be stated on the exam's own scale.
       * `none` is the honest default: until a mapping is fitted against real
       * score reports, criterion values are shown on the judge's scale and
       * labelled as such.
       */
      toExamScale: { kind: 'none'; reason: Localised };
      /**
       * How many times to ask the same judge. More than one measures the
       * judge's agreement with itself, which layer 5 then reports as spread
       * rather than averaging away.
       */
      samples?: number;
      /**
       * The last measured repeatability of this judge. Absent means it has
       * never been measured, which the result screen must say rather than
       * imply stability by silence.
       */
      stability?: StabilityRecord;
    };

export type TaskDefinition = {
  id: string;
  skill: SkillId;
  /** Name as the official instrument names it: "Task 1", "Tâche 1". */
  name: Localised;
  instruction: Localised;
  prompt: Localised;
  /** Seconds. Taken from the published specification, never approximated. */
  timeLimitSec: number;
  /** Word guidance shown to the candidate, if the exam publishes one. */
  wordGuidance?: Localised;
  /** What the candidate produces. Decides which runner renders the task. */
  responseMode: 'text' | 'audio';
  scaleId: string;
  criteria: Criterion[];
  gate: GateRule[];
  signal?: SignalBinding;
  judge: JudgeBinding;
  /** Content words the response is expected to engage with, for `off_topic`. */
  topicKeywords: string[];
  /**
   * Scaffolding the product itself supplies for this task. The template-ratio
   * detector measures a response against exactly this text, which is why it
   * lives on the task rather than in the detector.
   */
  suppliedScaffold?: string[];
};

export type SectionDefinition = {
  id: string;
  skill: SkillId;
  name: Localised;
  /** Whether audio may be replayed. Listening sections in every exam: false. */
  allowReplay: boolean;
  tasks: TaskDefinition[];
};

export type ExamDefinition = {
  id: string;
  name: Localised;
  /** The language the candidate is examined in. */
  language: LanguageCode;
  locale: Locale;
  /** Who accepts this exam and for what — shown on the goal screen. */
  acceptedFor: Localised;
  scales: Scale[];
  benchmark: BenchmarkMap;
  sections: SectionDefinition[];
  /**
   * The calibration evidence behind this exam's numeric predictions.
   * `samples` is the number of official score reports collected and matched.
   * The release gate reads this and nothing else.
   */
  calibration: {
    samples: number;
    /**
     * Collected reports broken down by the benchmark level the candidate
     * actually got, keyed by level.
     *
     * A total on its own is not evidence. 150 reports of which 130 sit at
     * CLB 8 and 9 say nothing about a candidate at CLB 5, and an interval
     * fitted on that sample is unsupported exactly where a candidate is most
     * likely to be told they are not ready. The gate reads this map, not
     * just `samples`.
     */
    byLevel: Record<string, number>;
    /** Published mean absolute error, in benchmark levels. Null until measured. */
    mae: number | null;
    /** Thresholds this exam must meet before a number may be published. */
    gate: {
      minSamples: number;
      /** Levels that must each be covered before any number is published. */
      levels: number[];
      /** Reports required at every one of those levels. */
      minPerLevel: number;
      maxMae: number;
      coverage: [number, number];
    };
  };
  /**
   * What this exam claims to predict, stated before anything is measured.
   *
   * This was undefined until 2026-08-25, and everything downstream depended
   * on it. An official attestation reports one level per skill for one
   * sitting. SELM scores one practice response. They are not the same object,
   * and "how accurate is SELM" has no answer until it is written down which
   * of the two is being predicted from which.
   */
  predictionTarget: PredictionTarget;
};

export type PredictionTarget = {
  /**
   * The unit being predicted. `skill_at_sitting` — one benchmark level for
   * one skill at one sitting — because that is what the attestation reports
   * and what an immigration officer reads. Not a per-response score.
   */
  unit: 'skill_at_sitting';
  /**
   * Which of the candidate's responses may inform an estimate.
   *
   * `days` — practice older than this describes a different candidate and is
   * excluded. `minResponses` — below this, no number is published for the
   * skill, however good the responses are. Both are parameters to be fitted
   * once reports exist, not constants; they are declared here so that the
   * value in force is visible rather than buried in an aggregation function.
   */
  window: { days: number; minResponses: number };
  /** The claim in the words the candidate is shown. */
  claim: Localised;
};

// ── a sitting ───────────────────────────────────────────────────────────

export type Goal = {
  id: string;
  label: Localised;
  /** Benchmark level the candidate needs, per skill. */
  requiredLevel: number;
  system: BenchmarkSystem;
};

export type Response =
  | {
      kind: 'text';
      taskId: string;
      text: string;
      /** Seconds actually spent, measured, not reported. */
      elapsedSec: number;
      submittedAt: string;
    }
  | {
      kind: 'audio';
      taskId: string;
      blob: Blob;
      /** Length of the recording itself, from the recorder. */
      durationSec: number;
      /** Seconds from the task appearing to the response being submitted. */
      elapsedSec: number;
      submittedAt: string;
    };
