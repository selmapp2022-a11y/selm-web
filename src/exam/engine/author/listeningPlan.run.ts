/**
 * GENERATE THE BACKEND'S RENDER PLAN FROM THE DEFINITION.
 *
 *   npx tsx src/exam/engine/author/listeningPlan.run.ts
 *
 * The scripts live in `ielts-listening.ts`, beside the questions asked about
 * them. The renderer runs on a server that cannot import TypeScript, so a
 * generated JSON copy ships with the backend — and the French bank is why this
 * is generated rather than maintained: a script that carries its own copy of
 * the material drifts from the definition the questions were written against,
 * and nothing notices until a candidate hears a recording that answers a
 * different question.
 *
 * `ielts-listening.check.ts` §9 compares the two word for word. This is the
 * only thing that should ever write that file.
 *
 * ── The shape, and the one assumption it makes ─────────────────────────────
 * Every script is narrator, body, narrator: in IELTS the "Now turn to Part
 * two" is INSIDE the recording and the candidate hears it. So the first line
 * is the intro, the last is the outro, and the rest is the body — asserted
 * here rather than assumed, because a script whose last line is not an outro
 * would silently render the final sentence of a lecture in the narrator's
 * voice.
 */
import { writeFileSync } from 'node:fs';
import { EXAMS } from '../../definitions';
import { IELTS_VARIETY_PLAN } from '../../definitions/ielts-variety-plan';
import type { ComprehensionSection } from '../../model/types';

const OUT = '../selmapp/backend/scripts/ielts-listening-plan.json';
const OUT_AU = '../selmapp/backend/scripts/ielts-listening-plan-au.json';

const exam = EXAMS.find((e) => e.id === 'ielts-gt')!;
const S = exam.sections.find((s): s is ComprehensionSection => s.id === 'listening')!;

const rows = S.recordings.map((r) => {
  const plan = IELTS_VARIETY_PLAN.find((p) => p.id === r.id);
  if (!plan) throw new Error(`${r.id} has no variety assignment`);

  const lines = r.script.split('\n').map((l) => l.trim()).filter(Boolean);
  const intro = lines[0];
  const outro = lines[lines.length - 1];
  if (!/^Now turn to Part /i.test(intro)) throw new Error(`${r.id}: first line is not a narrator intro`);
  if (!/^That is the end of Part /i.test(outro)) throw new Error(`${r.id}: last line is not a narrator outro`);
  const body = lines.slice(1, -1);
  if (!body.length) throw new Error(`${r.id}: nothing between the narrator lines`);

  const chars = [intro, ...body, outro].join('\n').length;
  return {
    id: r.id,
    level: r.level,
    speakers: r.speakers ?? 1,
    // The variety a recording IS SUPPOSED TO BE, taken from the frozen plan —
    // never from `r.variety`, which is what a recording turned out to be and
    // is empty until something has rendered it.
    variety: plan.variety,
    // What the definition already says was rendered, and whether that audio
    // is audio the plan still allows. `rendered && !keep` is `gt-l-p4`,
    // spoken Irish before the 31 August ruling took Irish out — the renderer
    // must redo it, and must not redo the other three.
    rendered: !!r.audioPath,
    keep: plan.keep,
    narratorIntro: intro,
    narratorOutro: outro,
    body,
    chars,
    words: [intro, ...body, outro].join(' ').split(/\s+/).filter(Boolean).length,
  };
});

writeFileSync(OUT, JSON.stringify(rows, null, 1) + '\n', 'utf-8');

// ── THE AUSTRALIA TRACK, AND ONLY WHAT IT ACTUALLY NEEDS ──────────────────
// Eight of the sixteen are already spoken in an accent the Australia track
// allows — Australian, British, North American, New Zealand — so an
// Australian candidate can be served the SAME FILE. Only the eight Canadian
// ones are re-spoken. A rendition is audio; two tracks sharing one file when
// the accent suits both is not a compromise, it is the correct answer.
const au = rows
  .map((r) => ({ r, plan: IELTS_VARIETY_PLAN.find((p) => p.id === r.id)! }))
  .filter(({ r, plan }) => plan.australiaVariety !== r.variety)
  .map(({ r, plan }) => ({ ...r, variety: plan.australiaVariety, rendered: false, keep: false }));
writeFileSync(OUT_AU, JSON.stringify(au, null, 1) + '\n', 'utf-8');
console.log(`\nwrote ${au.length} Australia-track rows to ${OUT_AU}`);
console.log(`  ~${au.reduce((n, r) => n + r.chars, 0).toLocaleString()} characters`);
console.log(`  ${rows.length - au.length} recordings are reused from the Canada track — the accent already suits both`);

const todo = rows.filter((r) => !r.keep);
const chars = todo.reduce((n, r) => n + r.chars, 0);
console.log(`\nwrote ${rows.length} rows to ${OUT}`);
console.log(`  keep as rendered   ${rows.length - todo.length}`);
console.log(`  to render          ${todo.length}   ~${chars.toLocaleString()} characters`);
const byVariety: Record<string, number> = {};
for (const r of todo) byVariety[r.variety] = (byVariety[r.variety] ?? 0) + 1;
console.log(`  by variety         ${Object.entries(byVariety).map(([k, v]) => `${k} ${v}`).join(' · ')}`);
console.log('\nNothing has been rendered. This only writes the plan.\n');
