/**
 * LAYER 1 — the deterministic gate. No model, no cost, no opinion.
 *
 * Every rule here is a thing that can be measured about one candidate, and
 * every one of them is a real defect this bank has already suffered from or
 * been shown to be vulnerable to:
 *
 *  - `items.check.ts` found that **the longest option is the answer** is the
 *    commonest tell in the trade, because a key has to be precise and a
 *    distractor only has to be wrong. It measured that ACROSS a bank. This
 *    measures the extreme case per item, so a batch cannot import the tell in
 *    bulk and be found later by a report nobody ran.
 *  - **A key lifted verbatim from the passage** turns a comprehension question
 *    into a string-matching exercise — the same reason `ComprehensionPractice`
 *    refuses to show the transcript.
 *  - **Two options that mean the same thing** must both be wrong, so the item
 *    is secretly a two-way choice with a 50% floor.
 *  - **A passage that repeats one already in the bank** is the failure this
 *    whole task exists to end. A bank of 100 that says the same thing twice is
 *    a bank of 99, and nobody notices until a candidate does.
 *  - **News** — §D. A passage that needs this month to be understood is
 *    confusing in six months and takes a position an exam may not.
 *
 * What it deliberately does NOT do is judge quality. "Is this a good question"
 * is layer 2's job and a human reviewer's after that. A deterministic gate that
 * tried would fail honest items and pass dishonest ones, and would be trusted
 * for both.
 */
import type { ComprehensionSection } from '../../model/types';
import { isChoiceItem, isCompletionItem, isMatchingItem } from '../../model/types';
import { longestCommonRun, segmentationFor, tokenSet, words } from '../text';
import type { Blueprint } from './blueprint';
import { BANDS, type Band, type Candidate, type LayerVerdict } from './types';

/**
 * §D's forbidden furniture, as words rather than as a judgement.
 *
 * This list cannot recognise a topical passage that avoids every one of these
 * — nothing deterministic can — and it is not pretending to. It catches the
 * obvious case cheaply, and `freshness: 'dated'` catches the author admitting
 * it. The two-year test in §D remains a reading, done by a person.
 */
const NEWS_EN = /\b(president|prime minister|chancellor|election|referendum|coup d'état|invasion|ceasefire|pandemic|lockdown|earthquake|hurricane|wildfire|shooting|scandal|impeach\w*|sanctions|general strike)\b/i;

/**
 * And the French list, because the English one matched French.
 *
 * `coup` was in the English list and fired on three TCF reading passages —
 * `tout à coup`, `un coup de fil`, `du coup`. Three perfectly ordinary French
 * sentences flagged as news, by a rule that had never been shown a French
 * text.
 *
 * A word list is a language-specific instrument and pretending otherwise is
 * how a gate quietly rejects a whole bank. The English `coup` now has to
 * appear as `coup d'état` to fire at all.
 */
const NEWS_FR = /\b(président|première ministre|premier ministre|élections?|référendum|coup d'État|invasion|cessez-le-feu|pandémie|confinement|séisme|tremblement de terre|ouragan|incendie de forêt|fusillade|scandale|destitution|sanctions|grève générale)\b/i;

/**
 * `war` and `guerre` were in these lists and came out again.
 *
 * A TCF reading passage about how cities restore their old buildings mentions
 * `les logements ouvriers ajoutés après la guerre` — post-war workers'
 * housing. That is history, and §D forbids NEWS: *"a framing that could only
 * have been written this month"*. A passage that would read identically in
 * 2015 and 2035 is the opposite of what the rule is aimed at, and a word list
 * that cannot tell `after the war` from a war is not enforcing the rule, it is
 * enforcing the word.
 *
 * What is left fires on events rather than on subjects: an invasion, a
 * ceasefire, a coup d'état, an election, a named office.
 */
const newsFor = (locale?: string) => (locale?.toLowerCase().startsWith('fr') ? NEWS_FR : NEWS_EN);

/** Two options that are near-restatements of each other. */
function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let hit = 0;
  for (const x of a) if (b.has(x)) hit += 1;
  return hit / (a.size + b.size - hit);
}

export type GateInput = {
  candidate: Candidate;
  blueprint: Blueprint;
  /** The section as it stands, for duplicate detection against what exists. */
  section: ComprehensionSection;
  locale?: string;
};

export function runGate({ candidate: c, blueprint: b, section, locale }: GateInput): LayerVerdict {
  const seg = segmentationFor(locale);
  const reasons: string[] = [];
  const w = words(c.script, seg).length;

  // ── the passage ──────────────────────────────────────────────────────
  if (!c.script.trim()) reasons.push('passage.empty');
  if (w < b.words.min) reasons.push(`passage.too-short(${w}<${b.words.min})`);
  if (w > b.words.max) reasons.push(`passage.too-long(${w}>${b.words.max})`);
  if (c.level !== b.level) reasons.push(`passage.wrong-band(${c.level}≠${b.level})`);
  if (c.family !== b.family) reasons.push(`passage.wrong-family(${c.family}≠${b.family})`);
  if (c.freshness === 'dated') reasons.push('passage.dated');
  const news = newsFor(locale).exec(c.script);
  if (news) reasons.push(`passage.news(${news[0].toLowerCase()})`);

  // Against every passage already in the section, and against nothing else:
  // two banks may legitimately cover the same subject in two languages.
  const mine = tokenSet(c.script, seg);
  for (const r of section.recordings) {
    const overlap = jaccard(mine, tokenSet(r.script ?? '', seg));
    if (overlap >= 0.35) { reasons.push(`passage.duplicate-of(${r.id}, ${overlap.toFixed(2)})`); break; }
  }

  // ── the questions ────────────────────────────────────────────────────
  const n = c.items.length;
  if (n < b.questions.min) reasons.push(`items.too-few(${n}<${b.questions.min})`);
  if (n > b.questions.max) reasons.push(`items.too-many(${n}>${b.questions.max})`);
  if (new Set(c.items.map((i) => i.id)).size !== n) reasons.push('items.duplicate-id');

  for (const it of c.items) {
    const at = it.id;
    if (it.recordingId !== c.id) reasons.push(`${at}:item.wrong-passage`);
    // An item's band is what the QUESTION is written to; the passage's band is
    // the passage's. In a forty-question listening part the two legitimately
    // differ — the last questions of a part are harder than the first — so
    // equality was the wrong test and fired on seven correct items. What is
    // not legitimate is a gap of two bands, which means one of the two labels
    // is wrong.
    if (Math.abs(BANDS.indexOf(it.level as Band) - BANDS.indexOf(c.level)) > 1)
      reasons.push(`${at}:item.band-far-from-passage(${it.level} vs ${c.level})`);
    const stem = it.stem.trim();
    if (!stem) reasons.push(`${at}:item.no-stem`);
    // A QUESTION MARK IS A MULTIPLE-CHOICE RULE, not an item rule. It was
    // applied to everything at first and fired on eleven IELTS listening
    // items whose stems are the labels of a form or a map — "Building where
    // the tour starts", "Cost per person" — which is exactly what a note
    // completion looks like on the paper. Requiring those to end in a
    // question mark would have made the bank less like the exam.
    else if (isChoiceItem(it) && !stem.endsWith('?') && !stem.endsWith(':'))
      reasons.push(`${at}:item.stem-not-a-question`);
    if (!it.rationale || it.rationale.trim().length < 40) reasons.push(`${at}:item.no-rationale`);
    if (!b.kinds.includes((it.kind ?? 'choice') as 'choice')) reasons.push(`${at}:item.kind-not-in-section`);

    if (isChoiceItem(it)) {
      const opts = it.options;
      if (opts.length !== 3 && opts.length !== 4) reasons.push(`${at}:options.count(${opts.length})`);
      if (it.answer < 0 || it.answer >= opts.length) reasons.push(`${at}:options.answer-out-of-range`);
      if (new Set(opts.map((o) => o.trim().toLowerCase())).size !== opts.length) reasons.push(`${at}:options.identical`);

      const sets = opts.map((o) => tokenSet(o, seg));
      for (let i = 0; i < sets.length; i++)
        for (let j = i + 1; j < sets.length; j++)
          if (jaccard(sets[i], sets[j]) >= 0.8) reasons.push(`${at}:options.near-duplicate(${i},${j})`);

      // The length tell, per item and at its extreme. A key may be the
      // longest option — sometimes the truth is the long one — but not by a
      // margin a candidate could learn to spot without reading.
      const lens = opts.map((o) => words(o, seg).length);
      const keyLen = lens[it.answer] ?? 0;
      const others = lens.filter((_, i) => i !== it.answer);
      const nextLongest = Math.max(...others, 0);
      if (keyLen > nextLongest * 1.4 && keyLen - nextLongest >= 3)
        reasons.push(`${at}:options.key-is-conspicuously-longest(${keyLen} vs ${nextLongest})`);

      // A key copied out of the passage rewards matching, not understanding.
      const run = longestCommonRun(opts[it.answer] ?? '', c.script, seg);
      if (run >= 6) reasons.push(`${at}:options.key-lifted-from-passage(${run} words)`);
    } else if (isCompletionItem(it)) {
      if (!it.prompt.includes('___')) reasons.push(`${at}:completion.no-gap`);
      if (!it.answer.accept.length) reasons.push(`${at}:completion.no-answer`);
      for (const a of it.answer.accept) {
        if (a.trim().split(/\s+/).length > it.answer.maxWords)
          reasons.push(`${at}:completion.answer-breaks-its-own-cap("${a}")`);
      }
      // The answer has to be IN the material. A completion whose answer is
      // not there is unanswerable however well it reads.
      //
      // Compared on letters and digits only. The first version compared raw
      // strings and reported four IELTS listening items as unanswerable when
      // the answer was audible and merely punctuated differently — a postcode
      // written `SW1A 2AA` against a script saying `S W 1 A, 2 A A`, a time
      // written `9.30` against `9:30`. `ielts-listening.check.ts` already
      // asserts audibility with a normalising comparison, and two checks that
      // disagree about the same fact are worse than one.
      //
      // NOT APPLIED TO AUDIO SECTIONS, and the reason is the four IELTS
      // listening items that were reported unanswerable when they are not: a
      // telephone number is SPOKEN as words and ANSWERED in digits, so it is
      // correctly absent from the script as a string and correctly present to
      // anyone listening. `ielts-listening.check.ts` already asserts that
      // every answer is audible, with a comparison built for spoken material.
      // Two checks that disagree about the same fact are worse than one, and
      // the one built for the job wins.
      const flatten = (x: string) => x.toLowerCase().replace(/[^a-z0-9à-ÿ]/gi, '');
      const hay = flatten(c.script);
      if (!section.delivery.audioPlaysOnce && !it.answer.accept.some((a) => hay.includes(flatten(a))))
        reasons.push(`${at}:completion.answer-not-in-passage`);
    } else if (isMatchingItem(it)) {
      const g = section.matchingGroups?.find((x) => x.id === it.groupId);
      if (!g) reasons.push(`${at}:matching.no-such-group`);
      else if (!g.options.some((o) => o.id === it.answer)) reasons.push(`${at}:matching.key-not-in-bank`);
    }
  }

  // ── provenance, which is not paperwork ───────────────────────────────
  if (!c.provenance.author.trim()) reasons.push('provenance.no-author');
  if (!c.provenance.promptVersion.trim()) reasons.push('provenance.no-prompt-version');
  if (!c.provenance.source.trim()) reasons.push('provenance.no-source');
  // §C: built from the published specification, never from a real paper. The
  // gate cannot verify where a passage came from, so it verifies that the
  // claim was made and is not the forbidden one.
  if (/real (exam|paper|test)|past paper|actual exam/i.test(c.provenance.source))
    reasons.push('provenance.source-is-a-real-paper');

  return {
    pass: reasons.length === 0,
    reasons,
    measured: { words: w, questions: n },
  };
}
