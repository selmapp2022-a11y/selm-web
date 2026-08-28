/**
 * Layer 3 — the proxy veto.
 *
 * THE PLAN §1.1 names three: sentence length, clause depth, lexical
 * diversity. They do not decide a level. They refuse an item whose SURFACE
 * is obviously outside the band it claims, before anything expensive looks
 * at it, and they are the only one of the three validation layers that
 * costs nothing and needs nothing bound.
 *
 * Bounds are per benchmark level and live with the cell, not here.
 */
import { words, DEFAULT_SEGMENTATION, type Segmentation } from './text';
import { sentences } from './diagnose';

/** Subordinators counted as clause depth. B1-visible ones only. */
const SUBORDINATORS = [
  'que', 'qui', 'dont', 'où', 'lorsque', 'quand', 'parce que', 'puisque',
  'bien que', 'quoique', 'si', 'comme', 'afin que', 'pour que', 'tandis que',
  'alors que', 'lequel', 'laquelle',
];

export type ProxyMetrics = {
  wordCount: number;
  sentenceCount: number;
  meanSentenceWords: number;
  maxSentenceWords: number;
  /** Subordinators per sentence — the clause-depth proxy. */
  clauseDepth: number;
  /** Distinct lowercase tokens ÷ tokens. */
  typeTokenRatio: number;
  /** Share of tokens longer than 9 characters — a crude register proxy. */
  longWordShare: number;
};

export function proxyMetrics(text: string, seg: Segmentation = DEFAULT_SEGMENTATION): ProxyMetrics {
  const w = words(text, seg);
  const sents = sentences(text);
  const lens = sents.map((s) => words(s, seg).length);
  const lower = w.map((x) => x.toLowerCase());
  const t = text.toLowerCase();

  let subs = 0;
  for (const s of SUBORDINATORS) {
    const re = new RegExp(`(^|[^a-zà-ÿ])${s.replace(/ /g, '\\s+')}([^a-zà-ÿ]|$)`, 'gu');
    subs += (t.match(re) ?? []).length;
  }

  return {
    wordCount: w.length,
    sentenceCount: sents.length,
    meanSentenceWords: sents.length ? w.length / sents.length : 0,
    maxSentenceWords: lens.length ? Math.max(...lens) : 0,
    clauseDepth: sents.length ? subs / sents.length : 0,
    typeTokenRatio: w.length ? new Set(lower).size / w.length : 0,
    longWordShare: w.length ? lower.filter((x) => x.length > 9).length / w.length : 0,
  };
}

export type ProxyBounds = {
  meanSentenceWords: [number, number];
  maxSentenceWords: [number, number];
  clauseDepth: [number, number];
  typeTokenRatio: [number, number];
  longWordShare: [number, number];
};

export type ProxyVerdict = {
  passed: boolean;
  breaches: Array<{ metric: keyof ProxyBounds; measured: number; bound: [number, number] }>;
  metrics: ProxyMetrics;
};

export function proxyVeto(text: string, bounds: ProxyBounds, seg?: Segmentation): ProxyVerdict {
  const m = proxyMetrics(text, seg);
  const breaches: ProxyVerdict['breaches'] = [];
  for (const k of Object.keys(bounds) as Array<keyof ProxyBounds>) {
    const [lo, hi] = bounds[k];
    const v = m[k] as number;
    if (v < lo || v > hi) breaches.push({ metric: k, measured: v, bound: [lo, hi] });
  }
  return { passed: breaches.length === 0, breaches, metrics: m };
}
