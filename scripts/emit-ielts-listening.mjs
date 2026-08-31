/**
 * Emit the IELTS listening plan the backend renders from.
 *
 * The scripts live in `ielts-listening.ts`, beside the questions asked about
 * them, and that is where they should live. The renderer runs on a server that
 * cannot import TypeScript, so this writes the same content out as JSON —
 * generated, never hand-maintained, and checked for drift by
 * `ielts-listening.check.ts` so the two cannot separate silently. The French
 * bank learned this the hard way.
 *
 *   node scripts/emit-ielts-listening.mjs > /tmp/ielts-listening-plan.json
 */
import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('../src/exam/definitions/ielts-listening.ts', import.meta.url), 'utf8');
// `keep` is the variety plan's word, not this file's: it says whether the audio
// that exists is in a variety the plan still allows. It was hand-edited into
// the committed JSON once and then went missing the first time this script was
// re-run, which is exactly the drift the committed copy exists to prevent.
const planSrc = readFileSync(new URL('../src/exam/definitions/ielts-variety-plan.ts', import.meta.url), 'utf8');
const keepOf = new Map();
for (const m of planSrc.matchAll(/id: '([^']+)'[^}]*?keep: (true|false)/g)) keepOf.set(m[1], m[2] === 'true');

// The recordings block, read as data rather than executed.
//
// This was one regular expression matching `id: 'gt-l-p\d'` with the fields in
// a fixed order, and on 31 August it silently returned four rows out of
// thirty-two: the sixteen recordings authored that day have longer ids and
// carry `audioPath`, `variety` and `voice` before `level`. A scraper that
// matches a field ORDER is a scraper that fails the first time a file is
// written by a different hand, and it fails by returning less rather than by
// stopping. So the block is split first and each field is read on its own.
const rows = [];
// Indentation is not uniform either: the original sixteen sit four spaces in
// and the ones spliced later sit eight, so the split cannot depend on it.
const blocks = src.split(/\n(?=\s{4,8}\{\n)/).filter((b) => /^\s+id: ["']gt-l-p\d/m.test(b));
const field = (b, name) => {
  const m = new RegExp(`\\n\\s+${name}: ['"]((?:[^"'\\\\]|\\\\.)*)['"],`).exec(b);
  return m ? m[1] : null;
};
// ── AND A SECOND FIELD ORDER PROBLEM, FOUND THE SAME WAY ──────────────────
// The sixteen recordings authored on 31 August carry a `renditions.australia`
// sub-object, and it declares a `variety` of its own — BEFORE the recording's.
// `field()` reads the first match in the block, so every one of those sixteen
// rows was emitted with the AUSTRALIA track's accent as if it were the
// recording's, and `ielts-listening.check` went red saying the plan and the
// file disagreed about what had been spoken. Both were right; the scraper was
// reading a nested object as though it were the outer one.
//
// A recording now has TWO accents — one per track — so the row carries both
// and the sub-object is lifted out before the outer fields are read.
const splitRenditions = (b) => {
  const at = b.indexOf('renditions: {');
  if (at < 0) return [b, null];
  let i = b.indexOf('{', at), depth = 0;
  for (let j = i; j < b.length; j++) {
    if (b[j] === '{') depth++;
    else if (b[j] === '}' && --depth === 0) return [b.slice(0, at) + b.slice(j + 1), b.slice(at, j + 1)];
  }
  return [b, null];
};

for (const raw of blocks) {
  const [b, renditions] = splitRenditions(raw);
  const id = field(b, 'id');
  const rawScript = /\n\s+script: "((?:[^"\\]|\\.)*)",/.exec(b);
  if (!id || !rawScript) continue;
  const script = JSON.parse(`"${rawScript[1]}"`);
  const lines = script.split('\n').filter((l) => l.trim().length > 0);
  // The narrator's own lines: the announcement that opens a part and the one
  // that closes it. They are the reason a narrator was cast — in IELTS the
  // candidate HEARS them — so they are rendered by the narrator voice, not by
  // whoever speaks the part.
  const intro = lines[0].startsWith('Now turn to Part') ? lines.shift() : null;
  const outro = lines.length && lines[lines.length - 1].startsWith('That is the end of Part') ? lines.pop() : null;
  const speakers = /\n\s+speakers: (\d)/.exec(b);
  rows.push({
    id,
    // Audio exists iff the recording carries a path to it. Read from the same
    // file the app reads, so the two cannot disagree.
    rendered: /\n\s+audioPath: /.test(b),
    keep: keepOf.get(id) ?? true,
    level: field(b, 'level'),
    speakers: speakers ? Number(speakers[1]) : 1,
    variety: field(b, 'variety'),
    // The Australia track's accent, where that track has been rendered. Null
    // for a recording that only exists on the primary track.
    australiaVariety: renditions ? field(renditions, 'variety') : null,
    narratorIntro: intro,
    narratorOutro: outro,
    body: lines,
    chars: script.length,
    words: script.split(/\s+/).filter(Boolean).length,
  });
}
process.stdout.write(JSON.stringify(rows, null, 1) + '\n');
