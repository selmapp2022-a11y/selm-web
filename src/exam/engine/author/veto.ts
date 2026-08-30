/**
 * LAYER 3 — the statistical veto. Arithmetic on the text, and nothing else.
 *
 * §B.2 names it: *sentence length, clause depth, lexical diversity.* The job
 * is narrow and worth stating precisely, because a veto that tried to do more
 * would be a second opinion nobody asked for:
 *
 *   **It does not decide whether an item is good. It decides whether the
 *   passage is plausibly at the band it claims**, by measuring it against the
 *   passages already at the bands either side of it.
 *
 * Layer 2 asks a judge *"is this harder than A and easier than B"*, which is a
 * reading. This asks whether the arithmetic agrees, which is not. When the two
 * disagree the item is discarded, and that is the point of having both: a
 * judge can be talked into a C1 passage that is four sentences of eight words,
 * and a ruler cannot.
 *
 * ── The anchors do not absorb what they measure ─────────────────────────
 *
 * The envelope is computed from a FIXED anchor set — the passages that were in
 * the bank before this build, which are the ones that have been read. Accepted
 * items do NOT join it.
 *
 * If they did, the envelope would widen by exactly the amount each new item
 * strayed, and the hundredth item would be measured against ninety-nine of its
 * own siblings. That is how a bank drifts a whole band over a build while
 * every single step passes: the instrument absorbs what it measures and stops
 * measuring. `stability.ts` records the same failure from the other end — a
 * number that was true when it was written and stopped being true, with
 * nothing in the product able to tell.
 */
import { segmentationFor, words } from '../text';
import { BANDS, bandIndex, type Band, type LayerVerdict } from './types';

export type Profile = {
  meanSentenceWords: number;
  /** Words of eight letters or more, as a share. A lexical-difficulty proxy. */
  longWordRate: number;
  /**
   * Distinct words over the SQUARE ROOT of total — Guiraud's index, not the
   * plain type/token ratio.
   *
   * The plain ratio was here first and it was wrong, and the way it was wrong
   * is worth keeping: **type/token ratio falls as a text gets longer**, for
   * arithmetic reasons and not linguistic ones — every text runs out of new
   * function words long before it runs out of length. So a 200-word B2
   * passage measured against an 80-word anchor scores lower on vocabulary
   * variety no matter how varied its vocabulary is, and the veto rejects it
   * for being long.
   *
   * It did exactly that on the first candidate put through it. Dividing by the
   * root instead is the standard correction and it removes most of the length
   * dependence, which also lets the measure run the same direction as the
   * other three: more varied vocabulary, higher number, harder band.
   */
  lexicalVariety: number;
  /** Commas and subordinators per sentence. A clause-depth proxy. */
  clauseRate: number;
};

const SUBORDINATORS = /\b(although|though|whereas|while|because|since|unless|until|whether|which|who|whom|whose|that|if|when|before|after|so that|even though|despite|however|nevertheless|moreover|bien que|alors que|parce que|puisque|tandis que|même si|afin que|dont|lequel|laquelle|cependant|néanmoins|toutefois)\b/gi;

export function profile(text: string, locale?: string): Profile {
  const seg = segmentationFor(locale);
  const sentences = text.split(/(?<=[.!?…])\s+/).map((s) => s.trim()).filter(Boolean);
  const w = words(text, seg);
  const total = Math.max(1, w.length);
  const uniq = new Set(w.map((x) => x.toLowerCase()));
  const commas = (text.match(/,/g) ?? []).length;
  const subs = (text.match(SUBORDINATORS) ?? []).length;
  return {
    meanSentenceWords: total / Math.max(1, sentences.length),
    longWordRate: w.filter((x) => x.length >= 8).length / total,
    lexicalVariety: uniq.size / Math.sqrt(total),
    clauseRate: (commas + subs) / Math.max(1, sentences.length),
  };
}

/** One anchor: a passage that was in the bank before this build, and its band. */
export type Anchor = { id: string; level: Band; script: string };

type Envelope = { lo: number | null; hi: number | null };

/**
 * The envelope for one measure at one band: bounded below by the band beneath
 * and above by the band above.
 *
 * `rising` is a parameter rather than an assumption because a measure that ran
 * the other way and was assumed to rise would make the veto reject every
 * honest C2 passage and accept every padded A1 one — and the failure would
 * look like a strict gate rather than a wrong one. All four measures happen to
 * rise today; the parameter stays for the next one that does not.
 */
function envelopeFor(
  anchors: Anchor[],
  level: Band,
  pick: (p: Profile) => number,
  rising: boolean,
  locale?: string,
  tolerance = 0.15,
): Envelope {
  const i = bandIndex(level);
  const at = (b: number) => anchors.filter((a) => bandIndex(a.level) === b).map((a) => pick(profile(a.script, locale)));
  const below = i > 0 ? at(i - 1) : [];
  const above = i < BANDS.length - 1 ? at(i + 1) : [];
  const min = (xs: number[]) => (xs.length ? Math.min(...xs) : null);
  const max = (xs: number[]) => (xs.length ? Math.max(...xs) : null);
  const slack = (v: number | null, dir: number) => (v === null ? null : v * (1 + dir * tolerance));
  return rising
    ? { lo: slack(min(below), -1), hi: slack(max(above), +1) }
    : { lo: slack(min(above), -1), hi: slack(max(below), +1) };
}

const MEASURES: Array<{ id: string; pick: (p: Profile) => number; rising: boolean }> = [
  { id: 'sentence-length', pick: (p) => p.meanSentenceWords, rising: true },
  { id: 'long-words', pick: (p) => p.longWordRate, rising: true },
  { id: 'clause-depth', pick: (p) => p.clauseRate, rising: true },
  { id: 'lexical-variety', pick: (p) => p.lexicalVariety, rising: true },
];

/**
 * The veto.
 *
 * A passage must sit inside the envelope on **at least three of the four**
 * measures. Not four of four: prose is not a spreadsheet, and a legitimate C1
 * passage can be written in short sentences if its vocabulary and its clauses
 * carry the difficulty. Not two of four either, which would pass anything with
 * a long word in it.
 *
 * Three is a threshold and thresholds are where banks are quietly bent, so it
 * is written here with its reason and it is not to be lowered to make a batch
 * fit. The precedent is `items.check.ts`, where a bar was once set at the
 * value the bank happened to sit on and had to be moved back.
 */
/**
 * Below this many words the four measures are noise, not measurement.
 *
 * The TCF A1 anchor was a consigne of eight words. Three of those eight are
 * long, so its `longWordRate` came out at 0.375 — higher than the C2 anchor's
 * 0.226 — and the ladder appeared to fall from A1 to C2 on that measure. The
 * passage is not wrong; a French sign is eight words. **A rate computed on a
 * denominator of eight is arithmetic about the denominator.**
 *
 * So a short passage is not vetoed and is not counted as having passed: it is
 * `skipped`, and the caller records it as unmeasured, exactly as an anchor at
 * a band with no neighbours is. The alternative — a floor low enough to
 * "measure" a four-word sign — would have put noise into the instrument and
 * called it a reading.
 */
export const MIN_MEASURABLE_WORDS = 30;

export function runVeto(
  script: string,
  level: Band,
  anchors: Anchor[],
  locale?: string,
): LayerVerdict {
  if (words(script, segmentationFor(locale)).length < MIN_MEASURABLE_WORDS)
    return { pass: true, skipped: true, reasons: [], measured: { note: `under ${MIN_MEASURABLE_WORDS} words — too short to measure` } };
  const p = profile(script, locale);
  const reasons: string[] = [];
  const measured: Record<string, number | string> = {};
  let inside = 0;

  for (const m of MEASURES) {
    const v = m.pick(p);
    measured[m.id] = Number(v.toFixed(3));
    const env = envelopeFor(anchors, level, m.pick, m.rising, locale);
    const lowOk = env.lo === null || v >= env.lo;
    const highOk = env.hi === null || v <= env.hi;
    if (lowOk && highOk) inside += 1;
    else reasons.push(
      `${m.id}:${v.toFixed(2)} outside [${env.lo === null ? '—' : env.lo.toFixed(2)}, ${env.hi === null ? '—' : env.hi.toFixed(2)}]`,
    );
  }

  measured.inside = inside;
  // With no anchors either side — a band at the end of a ladder with an empty
  // neighbour — every measure is unbounded and everything "passes". That is
  // not a pass, it is an unmeasured item, and it must not be recorded as the
  // former.
  const bounded = MEASURES.some((m) => {
    const e = envelopeFor(anchors, level, m.pick, m.rising, locale);
    return e.lo !== null || e.hi !== null;
  });
  if (!bounded) reasons.push('unmeasurable:no anchors at either neighbouring band');

  return { pass: bounded && inside >= 3 && reasons.filter((r) => r.startsWith('unmeasurable')).length === 0, reasons, measured };
}
