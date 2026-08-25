/**
 * Language-agnostic text measurement.
 *
 * Every function here works on any Latin-script language. French accented
 * characters, apostrophes in "l'environnement" and hyphens in "est-ce que"
 * are all handled by the same rules as English, which is the point: no
 * branch anywhere below asks which language it is looking at.
 */

/** Unicode letter classes, so "réussi" is one word and not two. */
const WORD_RE = /[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu;

export function words(text: string): string[] {
  return text.match(WORD_RE) ?? [];
}

export function wordCount(text: string): number {
  return words(text).length;
}

/** Lower-cased, accent-preserving token set. */
export function tokenSet(text: string): Set<string> {
  return new Set(words(text).map((w) => w.toLocaleLowerCase()));
}

/**
 * Proportion of the response's own tokens that also appear in `source`.
 * Used for prompt copying and for measuring supplied scaffolding — the same
 * measurement, two different sources.
 */
export function overlapRatio(response: string, source: string): number {
  const r = words(response).map((w) => w.toLocaleLowerCase());
  if (r.length === 0) return 0;
  const s = tokenSet(source);
  let hits = 0;
  for (const w of r) if (s.has(w)) hits++;
  return hits / r.length;
}

/**
 * Longest run of consecutive response tokens that also appears, in order,
 * in the source. Catches a lifted sentence that token overlap alone would
 * dilute across a long answer.
 */
export function longestCommonRun(response: string, source: string): number {
  const r = words(response).map((w) => w.toLocaleLowerCase());
  const s = words(source).map((w) => w.toLocaleLowerCase());
  if (!r.length || !s.length) return 0;
  let best = 0;
  let prev = new Array(s.length + 1).fill(0);
  for (let i = 1; i <= r.length; i++) {
    const cur = new Array(s.length + 1).fill(0);
    for (let j = 1; j <= s.length; j++) {
      if (r[i - 1] === s[j - 1]) {
        cur[j] = prev[j - 1] + 1;
        if (cur[j] > best) best = cur[j];
      }
    }
    prev = cur;
  }
  return best;
}

/** How many of the expected content words the response actually engages. */
export function keywordHits(text: string, keywords: string[]): number {
  const t = tokenSet(text);
  let hits = 0;
  for (const k of keywords) {
    const parts = words(k).map((w) => w.toLocaleLowerCase());
    if (parts.length && parts.every((p) => t.has(p))) hits++;
  }
  return hits;
}
