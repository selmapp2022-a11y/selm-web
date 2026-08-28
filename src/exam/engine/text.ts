/**
 * Text measurement, with the one thing that cannot be language-agnostic
 * made explicit.
 *
 * This file used to open by claiming that French apostrophes in
 * "l'environnement" were "handled by the same rules as English, which is
 * the point: no branch anywhere below asks which language it is looking
 * at." They were handled, and handled wrongly, and the claim is why it went
 * unnoticed.
 *
 * MEASURED 2026-08-28, before the fix below, over 26 French responses of
 * exam length: the old rule counted `l'avis` as ONE token, under-counting
 * French by **5.0% overall and up to 9.9% on a single response**, and
 * **7 of 22 responses that were genuinely at or above the 120-word floor
 * were counted below it** — which on TCF tâche 3 is the `min_words` rule,
 * whose verdict is "A1 non atteint", an automatic zero.
 *
 * A third of correct-length French answers zeroed for being short, on the
 * highest-stakes rule the engine has.
 *
 * English has no elision, so the same rule is right for English and wrong
 * for French. That difference cannot be reasoned away; it can only be
 * declared. So segmentation is now a value that arrives from the exam
 * definition's `locale`, like `dialect` and `task_type` before it — the
 * fifth instance of the defect class THE PLAN §5.2 names, and the first one
 * caught before it shipped rather than after.
 */

/** What a locale changes about how text is cut into words. */
export type Segmentation = {
  /**
   * Split a leading elided clitic into its own token: `l'avis` → `l'` `avis`.
   * True for French. False for English, where `don't` is one word.
   */
  elision: boolean;
  /**
   * Match a content keyword across the regular plural: `commerçant` in a
   * response that writes `commerçants`.
   *
   * MEASURED 2026-08-28 on the SHIPPED tâche 3 item, against its own model
   * answer in `gate.check.ts`: exact-token matching fired on **3 of 7**
   * document-1 keywords and **4 of 8** document-2 keywords. Six of the eight
   * misses were the plural alone — `marché`/`marchés`, `piéton`/`piétons`,
   * `commerçant`/`commerçants`, `livraison`/`livraisons`,
   * `boutique`/`boutiques`, `vente`/`ventes`.
   *
   * `source_coverage` needs two hits per document. It was getting three and
   * four — passing by a margin of one, on the rule THE PLAN calls the one
   * that distinguishes tâche 3 from every other written task in either
   * exam. One different keyword choice and a correct comparison is zeroed.
   */
  pluralTolerant: boolean;
};

export const DEFAULT_SEGMENTATION: Segmentation = { elision: false, pluralTolerant: false };

/**
 * Elidable forms. Closed class, short, and deliberately a list rather than
 * a pattern: `aujourd'hui` and `prud'homme` are single words and any rule
 * of the shape "letters before an apostrophe" splits them.
 */
const ELIDABLE = new Set([
  'l', 'd', 'n', 'j', 'c', 's', 't', 'm',
  'qu', 'jusqu', 'lorsqu', 'puisqu', 'quoiqu', 'presqu', 'entr',
]);

export function segmentationFor(locale?: string): Segmentation {
  const fr = (locale ?? '').toLowerCase().startsWith('fr');
  return { elision: fr, pluralTolerant: fr };
}

/**
 * Regular French plural only: -s and -x. Deliberately not a stemmer —
 * `chevaux`/`cheval` and every irregular form is left to the keyword author,
 * because a stemmer that over-matches turns `vent` into a hit for `vente`
 * and silently loosens an automatic-zero rule.
 */
function pluralForms(w: string): string[] {
  const out = [w];
  if (w.endsWith('s') || w.endsWith('x')) out.push(w.slice(0, -1));
  else out.push(w + 's', w + 'x');
  return out;
}

/** Unicode letter classes, so "réussi" is one word and not two. */
const WORD_RE = /[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu;

const ELIDED_RE = /^([\p{L}]+)['’](.+)$/u;

function splitElision(token: string): string[] {
  const out: string[] = [];
  let rest = token;
  for (let guard = 0; guard < 4; guard += 1) {
    const m = rest.match(ELIDED_RE);
    if (!m) break;
    if (!ELIDABLE.has(m[1].toLocaleLowerCase())) break;
    out.push(m[1] + "'");
    rest = m[2];
  }
  out.push(rest);
  return out;
}

export function words(text: string, seg: Segmentation = DEFAULT_SEGMENTATION): string[] {
  const raw = text.match(WORD_RE) ?? [];
  if (!seg.elision) return raw;
  const out: string[] = [];
  for (const w of raw) for (const part of splitElision(w)) out.push(part);
  return out;
}

export function wordCount(text: string, seg?: Segmentation): number {
  return words(text, seg).length;
}

/** Lower-cased, accent-preserving token set. */
export function tokenSet(text: string, seg?: Segmentation): Set<string> {
  return new Set(words(text, seg).map((w) => w.toLocaleLowerCase()));
}

/**
 * Proportion of the response's own tokens that also appear in `source`.
 * Used for prompt copying and for measuring supplied scaffolding — the same
 * measurement, two different sources.
 */
export function overlapRatio(response: string, source: string, seg?: Segmentation): number {
  const r = words(response, seg).map((w) => w.toLocaleLowerCase());
  if (r.length === 0) return 0;
  const s = tokenSet(source, seg);
  let hits = 0;
  for (const w of r) if (s.has(w)) hits++;
  return hits / r.length;
}

/**
 * Longest run of consecutive response tokens that also appears, in order,
 * in the source. Catches a lifted sentence that token overlap alone would
 * dilute across a long answer.
 */
export function longestCommonRun(response: string, source: string, seg?: Segmentation): number {
  const r = words(response, seg).map((w) => w.toLocaleLowerCase());
  const s = words(source, seg).map((w) => w.toLocaleLowerCase());
  if (!r.length || !s.length) return 0;
  let best = 0;
  let prev: number[] = new Array(s.length + 1).fill(0);
  for (let i = 1; i <= r.length; i++) {
    const cur: number[] = new Array(s.length + 1).fill(0);
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

/**
 * How many of the expected content words the response actually engages.
 *
 * The elision fix matters twice as much here as in the word count: without
 * it the keyword `avis` never matches a response that writes `l'avis`,
 * which is how a French candidate writes it. That silently under-fires
 * `source_coverage`, `off_topic` and `topicKeywords` — the three rules that
 * make tâche 3 work at all.
 */
export function keywordHits(
  text: string,
  keywords: string[],
  seg: Segmentation = DEFAULT_SEGMENTATION,
): number {
  const t = tokenSet(text, seg);
  const present = (p: string) =>
    seg.pluralTolerant ? pluralForms(p).some((f) => t.has(f)) : t.has(p);
  let hits = 0;
  for (const k of keywords) {
    const parts = words(k, seg).map((w) => w.toLocaleLowerCase());
    if (parts.length && parts.every(present)) hits++;
  }
  return hits;
}
