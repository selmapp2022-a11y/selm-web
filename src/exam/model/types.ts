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
  /**
   * The AWARDING BODY's own CEFR level for a score on this scale, highest
   * threshold first.
   *
   * This is not the same mapping as `benchmark`, and treating it as the same
   * was a real defect. `benchmark` converts a score to CLB/NCLC — IRCC's
   * chart, for immigration. CEFR is the awarding body's own reading of the
   * same number, and the product uses it for something else entirely: to
   * decide which practice material is at the candidate's level.
   *
   * Until 2026-08-28 the CEFR was read off the NCLC row, which made it a
   * conversion of a conversion. Checked against 23 CEFR levels printed on
   * real TCF attestations, that route was **wrong on 2 of 10 compréhension
   * orale readings** — a candidate awarded 447 was being called B1 where FEI
   * calls them B2, and one awarded 521 was called B2 where FEI says C1. The
   * planner orders practice by distance from this level, so a CEFR one level
   * low spends a six-week plan on material the candidate finished a year ago.
   *
   * Read straight off the score, it agrees with all 23.
   */
  cefrBands?: Array<{ from: number; cefr: string }>;
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
export type SkillId = 'speaking' | 'listening' | 'reading' | 'writing';

export type BenchmarkSystem = string;

/**
 * An item-type family inside a comprehension section — the teaching unit
 * that section did not have.
 *
 * Amendment 2 §2.4, listed **Open**: *"`comprehension-orale` and
 * `comprehension-ecrite` carry 39 items each and zero named tâches. The
 * catalogue and the planner both address tasks by tâche. Until comprehension
 * has an equivalent structure, half the exam cannot be planned or prescribed
 * against."*
 *
 * Expression has six named tâches because the exam names them. Comprehension
 * has none, because the exam does not name them — it publishes item TYPES.
 * So the unit here is the family, and it is declared per exam as data rather
 * than assumed by the engine, exactly as scales and criteria already are.
 */
export type ComprehensionFamily = {
  id: string;
  label: Localised;
  /** What an item of this family looks like, in the candidate's terms. */
  describes: Localised;
  /**
   * Where the taxonomy comes from. Non-optional on purpose: a teaching unit
   * invented by us and a teaching unit published by the awarding body are
   * different things, and the difference has to survive into the code.
   */
  provenance: Localised;
};

export type BenchmarkBand = {
  from: number;
  level: number;
  /**
   * The CEFR level the awarding body prints alongside this benchmark level,
   * where it prints one. Recorded because it is the only bridge between a
   * corpus labelled in CEFR and a benchmark expressed in NCLC or CLB; it is
   * not used to compute anything.
   */
  cefr?: string;
};

export type BenchmarkMap = {
  system: BenchmarkSystem;
  /** Bands on the exam's primary scale — the one its production tasks use. */
  bands: BenchmarkBand[];
  /**
   * Further band tables for exams that report different sections on different
   * scales, keyed by scale id. TCF Canada is the reason this exists: its two
   * comprehension sections are scored 331–699 and 342–699 and their bands
   * differ at every boundary except the top, so one table cannot serve both.
   */
  byScale?: Record<string, BenchmarkBand[]>;
  /**
   * Band tables that differ per SKILL rather than per scale.
   *
   * Added 2026-08-28, when a real IELTS Test Report Form was put through the
   * model for the first time and two of its four conversions came out wrong.
   *
   * `byScale` cannot express IELTS: all four of its skills are reported on
   * the same 0–9 band scale, and IRCC still converts them differently — a
   * Reading 6.5 is CLB 8 while a Listening 6.5 is CLB 7, because the
   * published chart requires 7.5 in listening for CLB 8 and 6.5 in reading.
   * One table per exam was a structural assumption, and a real document is
   * what exposed it.
   *
   * Read before `byScale` and before `bands`.
   */
  bySkill?: Partial<Record<SkillId, BenchmarkBand[]>>;
};

// ── the exam tree ───────────────────────────────────────────────────────

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
  | {
      id: 'prompt_copy';
      maxOverlapRatio: number;
      /**
       * Longest run of consecutive tokens the response may share with the
       * prompt before it counts as lifting. Defaults to 8.
       *
       * Declared here rather than fixed in the engine because the right
       * value depends on what the prompt IS. Against a one-line instruction,
       * eight consecutive words is plagiarism. Against TCF Tâche 3, whose
       * prompt contains the two documents being compared, naming the subject
       * costs eight words on its own — "la fermeture du centre-ville aux
       * voitures le samedi" — and a correct answer was zeroed for it on the
       * first test run.
       */
      maxLiftedRun?: number;
      verdict: GateVerdict;
    }
  | { id: 'template_ratio'; maxRatio: number; verdict: GateVerdict }
  | { id: 'off_topic'; minKeywordHits: number; verdict: GateVerdict }
  | { id: 'empty'; verdict: GateVerdict }
  /**
   * The response must engage with EVERY source the task puts in front of it.
   *
   * TCF Tâche 3 gives the candidate two documents and asks for a comparison
   * and a reasoned opinion. A response that discusses only one of them is a
   * known score-killer, and it is deterministic to detect: the two documents
   * are known in advance, so the words that belong to each are known too.
   *
   * Generic on purpose. It is not "the tâche 3 rule" — it is "answer all the
   * parts you were given", which is also IELTS General Training Task 1 with
   * its three bullets, and TEF section B. The engine does not know which.
   */
  | {
      id: 'source_coverage';
      sources: Array<{ id: string; label: Localised; keywords: string[] }>;
      /** Keyword hits required from each source individually. */
      minHitsPerSource: number;
      verdict: GateVerdict;
    };

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
/**
 * What a judge's repeatability was, on one day.
 *
 * The date is not decoration. `D-fort` scored 83.0 with zero spread on 25
 * August and 83/89/83 on the 27th — a third-party scorer changed underneath
 * the product inside two days, without telling anyone. A figure from before
 * such a change is not a smaller truth, it is a false one, so this record
 * carries an expiry and anything reading it past that expiry must report the
 * stability as UNKNOWN rather than as the recorded number.
 */
export type StabilityRecord = {
  /** ISO date the measurement was taken. */
  measuredAt: string;
  /**
   * Days after `measuredAt` for which this figure may be quoted. Past it the
   * figure is stale and `readStability` returns `unknown`. 30 unless a
   * definition states otherwise — chosen because the one change we have
   * observed happened in two days, so a month is already generous.
   */
  validForDays?: number;
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
      payload?: Record<string, string | number | boolean>;
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
       * Whether this judge should report the exam's band scale alongside its
       * own numbers.
       *
       * False by default, and false is the honest default: the IELTS band
       * scale belongs to one English examination, and the bound assessor
       * returned one for a French script until 2026-08-27. There is no such
       * thing, and on a French page it would be read as real by exactly the
       * candidate least able to know otherwise.
       */
      reportsBand?: boolean;
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
  /**
   * Seconds. Taken from the published specification wherever the instrument
   * publishes a per-task time. Where it publishes only a time for the whole
   * section — TCF's expression écrite is 60 minutes for three tâches, with no
   * per-tâche split anywhere in the candidate manual — this figure is ours,
   * `timeLimitApportioned` says so, and everything that shows it must repeat
   * that to the candidate rather than let it read as the exam's own rule.
   */
  timeLimitSec: number;
  /**
   * True when `timeLimitSec` is our division of the section time rather than
   * a published per-task limit. Absent means published.
   */
  timeLimitApportioned?: true;
  /** Word guidance shown to the candidate, if the exam publishes one. */
  wordGuidance?: Localised;
  /**
   * Published preparation time before the response begins, in seconds.
   * `0` means the exam publishes that there is none — TCF expression orale
   * tâches 1 and 3 are explicitly *sans préparation*, and that is a fact
   * about the exam, not a missing value. Absent means the exam says nothing.
   */
  preparationSec?: number;
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

/**
 * One question in a comprehension section: a stem, options, one key.
 *
 * `content` and `stem` are plain strings in the exam's own language, not
 * `Localised`. A production prompt is translated because an English-speaking
 * candidate sitting the TCF still needs to know what the tâche asks. **A
 * comprehension item is not translated, because translating it destroys the
 * thing being measured** — a French reading item rendered in English tests
 * nothing about reading French. The UI language may differ from the exam
 * language everywhere else in this model; here it may not.
 */
export type ComprehensionItem = {
  id: string;
  /**
   * The CEFR band this item is written to. **Ours, not the exam's.** TCF
   * publishes that its comprehension épreuves run "selon un principe de
   * difficulté progressive" and publishes nothing about which item sits at
   * which level, so this banding is our authoring decision and is labelled as
   * one wherever it is shown.
   */
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  /** Listening: the words spoken. Reading: the passage read. */
  content: string;
  /** Listening only: how many voices the script has. */
  speakers?: number;
  stem: string;
  options: string[];
  /** Index into `options`. Exactly one key per item. */
  answer: number;
  /** What the item tests. Never shown during the section. */
  rationale?: string;
  /**
   * Which `ComprehensionFamily` this item belongs to — the teaching unit.
   *
   * Optional because an exam may declare no taxonomy, and because an item
   * with no family is a **visible gap** rather than a silent default: the
   * planner routes on this, and a wrong family is worse than a missing one.
   */
  family?: string;
  /**
   * Path to the rendered audio **within the audio store**, e.g.
   * `tcf-co/tcf-co-01.mp3` — not a full URL. `resolveAudio()` joins it with
   * the configured base, so the same bank can be served from the app bundle
   * today and from the CDN later without editing a single item.
   *
   * Authored once, stored, served — never generated per user and never
   * generated at request time. Absent means not yet rendered, and a section
   * whose items are missing audio refuses to run rather than falling back to
   * showing the script.
   */
  audioPath?: string;
};

/**
 * What "exam conditions" actually means, as data rather than as behaviour
 * buried in a component.
 *
 * These are not presentation details. They are the difference between a
 * practice app and a simulation, and the second rule below is the one
 * candidates find hardest and that no competing product enforces.
 */
export type DeliveryRules = {
  /** The audio plays once. Not pausable, not rewindable, no scrub bar. */
  audioPlaysOnce: boolean;
  /** The question appears after the audio, not during it. */
  questionAfterAudio: boolean;
  /** A transcript at any point during the section. False in every exam here. */
  transcriptDuringSection: boolean;
  /** Reading shows the whole section at once; listening moves item by item. */
  presentation: 'all_at_once' | 'one_at_a_time';
  /** A section clock, not a per-item clock. */
  clock: 'section' | 'item';
  /** Answers stay changeable until the section is submitted. */
  answersLockedOnAnswer: boolean;
  /** Per-item feedback during the section. Feedback is a results-page concern. */
  feedbackDuringSection: boolean;
};

export type ProductionSection = {
  kind: 'production';
  id: string;
  skill: SkillId;
  name: Localised;
  /** Whether audio may be replayed. Listening sections in every exam: false. */
  allowReplay: boolean;
  /**
   * Seconds for the whole section, when that is the constraint the exam
   * actually publishes. Present on TCF expression écrite: 60 minutes across
   * three tâches. Absent where the exam times each task instead.
   */
  timeLimitSec?: number;
  tasks: TaskDefinition[];
};

export type ComprehensionSection = {
  kind: 'comprehension';
  id: string;
  skill: SkillId;
  name: Localised;
  /** Seconds for the whole épreuve, as published. */
  timeLimitSec: number;
  /** True when the figure above is our division rather than a published one. */
  timeLimitApportioned?: true;
  /** The scale this section is reported on, e.g. `co699`. */
  scaleId: string;
  delivery: DeliveryRules;
  /** Where the items came from. Always ours, and always said so. */
  provenance: Localised;
  /**
   * The item-type families this section teaches by. Empty means the section
   * has no teaching unit yet, and the planner must say so rather than
   * inventing one — Amendment 1 §6.
   */
  families?: ComprehensionFamily[];
  /**
   * How many items the épreuve presents, and with what band profile, when
   * `items` is a BANK larger than one sitting.
   *
   * The published TCF compréhension écrite épreuve is 39 questions. The bank
   * behind it was grown to 57 so that a candidate who practises twice does
   * not meet the same 39 items twice — §4.3's whole argument — and the
   * moment it was grown, `items.length` stopped being the length of the
   * exam. It was silently presenting 57 questions in a 60-minute épreuve
   * published as 39.
   *
   * Absent means the section presents everything it holds.
   */
  serve?: {
    /** Items in one sitting. Must equal the sum of `byBand`. */
    count: number;
    /**
     * How many of each band the épreuve presents.
     *
     * Declared, not inferred from the bank. A profile inferred from the bank
     * changes every time an item is written, which would mean the exam's
     * shape drifts as a side effect of authoring — and the candidate would
     * have no way to know.
     */
    byBand: Record<string, number>;
  };
  items: ComprehensionItem[];
};

export type SectionDefinition = ProductionSection | ComprehensionSection;

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
  /**
   * What the AWARDING BODY reports on its attestation — which is not the
   * same thing as `sections`, and conflating the two was a real defect.
   *
   * Found 2026-08-28 by rendering the attestation form: it derived its
   * fields from `sections`, so an IELTS General Training candidate holding
   * a Test Report Form with four band scores was asked for **two** of them,
   * because listening and reading are not built here.
   *
   * `sections` is what SELM has built. `awards` is what the exam gives the
   * candidate. **The candidate's document is governed by the second.** The
   * gap between the two lists is also exactly what Part 3 §1.1 requires be
   * stated out loud when the exam is offered.
   */
  awards: Array<{
    skill: SkillId;
    label: Localised;
    /** Which of this exam's scales that skill is reported on. */
    scaleId: string;
  }>;
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

/**
 * A surface that belongs to a destination rather than to the product.
 *
 * The Comprehensive Ranking System calculator and the NCLC conversion table
 * are Canadian instruments. On the dashboard of a candidate bound for
 * Melbourne they are not merely irrelevant, they are misleading — they imply
 * a points system that destination does not run. So the dashboard implements
 * a small closed set of surfaces and **a destination declares which of them
 * it has**. Nothing in the engine or the dashboard decides this by country.
 */
export type DestinationSurface = {
  id: 'points_calculator' | 'benchmark_conversion';
  label: Localised;
  /** Where it lives. Absolute for anything outside the application. */
  href: string;
};

/**
 * Where the candidate is going, and how that place reads a language result.
 *
 * `country` is an ISO 3166-1 alpha-2 tag and it is DATA. No branch anywhere
 * reads it to decide what to render — `surfaces` and `requirement` do that.
 * It is carried so a record can say which destination a sitting was aimed at
 * without parsing a label.
 */
export type Destination = {
  id: string;
  label: Localised;
  country: string;
  /**
   * `per_skill` — every skill must reach the required level, and the lowest
   * one governs. Canadian immigration, and most skilled-migration routes.
   * `overall` — an aggregate is read and a weak skill can be carried.
   * `both` — an overall AND a per-skill floor, which many universities set.
   */
  requirement: 'per_skill' | 'overall' | 'both';
  surfaces: DestinationSurface[];
};

export type Goal = {
  id: string;
  label: Localised;
  /** Benchmark level the candidate needs, per skill. */
  requiredLevel: number;
  system: BenchmarkSystem;
  /**
   * Present when the requirement is set on one of the EXAM's own scales
   * rather than on a government benchmark. An Australian skilled-migration
   * route asks for IELTS 6 in each skill; it does not ask for a CLB level,
   * and showing "CLB" beside that 6 would be inventing a conversion the
   * destination never made. When this is set, `system` is only a label.
   */
  scaleId?: string;
  /** Where the candidate is going. */
  destination: Destination;
  /**
   * Exam ids that actually serve this goal. The destination decides the
   * required score and the exam is chosen from that, not the other way
   * round — this is that sentence, as data.
   */
  exams: string[];
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
