/**
 * The twenty-one wrong keys of 31 August, repaired at their cause.
 *
 * `depth.run.ts` rotates the correct option so the key is not always written
 * first, and it read `q.correct`. Three TCF batches wrote `answer`. `correct`
 * was therefore `undefined`, the shift computed as `NaN`, `slice(NaN)` left the
 * options in their written order — and the answer index was set to the rotation
 * target regardless. The result is an item whose stored key points at a
 * distractor while its rationale still explains the option the author marked.
 *
 * The repair is NOT to move the answer index back to the author's option. That
 * would put every one of these keys back at position 0, which is the tell the
 * rotation exists to remove. It is to finish the rotation that was started:
 * rotate the option list cyclically so the author's option lands on the index
 * already stored. Distractors keep the order they were composed in, the key
 * ends where the runner meant to put it, and the rationale becomes true again.
 *
 *   npx tsx src/exam/engine/author/_keyfix.run.ts          # report only
 *   npx tsx src/exam/engine/author/_keyfix.run.ts --write  # repair in place
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { EXAMS } from '../../definitions';
import type { ComprehensionSection } from '../../model/types';

const DIR = 'src/exam/engine/author/batches';
const write = process.argv.includes('--write');
type Plan = { id: string; file: string; options: string[]; answer: number; rotated: string[] };
const plans: Plan[] = [];

for (const f of readdirSync(DIR)) {
  const raws = JSON.parse(readFileSync(`${DIR}/${f}`, 'utf8')) as Array<Record<string, unknown>>;
  for (const raw of raws) {
    const items = (raw.items ?? []) as Array<Record<string, unknown>>;
    for (const [qi, q] of items.entries()) {
      const authored = (q.correct ?? q.answer) as number | undefined;
      const opts = q.options as string[] | undefined;
      if (!opts || authored === undefined) continue;
      const id = (q.id as string) ?? `${String(raw.id).replace(/-r$/, '')}-q${qi + 1}`;
      for (const e of EXAMS) {
        for (const s of e.sections) {
          if (s.kind !== 'comprehension') continue;
          const inBank = (s as ComprehensionSection).items.find((i) => i.id === id) as
            | { id: string; options?: string[]; answer?: number }
            | undefined;
          if (!inBank?.options || inBank.answer === undefined) continue;
          if (inBank.options[inBank.answer] === opts[authored]) continue;
          // The author's option must still be present, or this is not a
          // rotation that went wrong — it is a different item, and the repair
          // would be a guess.
          const c = inBank.options.indexOf(opts[authored]);
          if (c < 0) { console.log(`SKIP ${id}: authored option not among the stored ones`); continue; }
          const k = inBank.options.length;
          const shift = ((c - inBank.answer) % k + k) % k;
          const rotated = [...inBank.options.slice(shift), ...inBank.options.slice(0, shift)];
          if (rotated[inBank.answer] !== opts[authored]) throw new Error(`rotation failed for ${id}`);
          plans.push({ id, file: f, options: inBank.options, answer: inBank.answer, rotated });
        }
      }
    }
  }
}

console.log(`${plans.length} item(s) whose stored key is not the authored one\n`);
for (const p of plans)
  console.log(`  ${p.id.padEnd(14)} answer=${p.answer}  was "${p.options[p.answer]}"  becomes "${p.rotated[p.answer]}"`);

if (!write) { console.log('\n(report only — pass --write to repair)'); process.exit(0); }

const path = 'src/exam/definitions/tcf-canada.ts';
let src = readFileSync(path, 'utf8');
let done = 0;
for (const p of plans) {
  const before = JSON.stringify(p.options).replace(/","/g, '","');
  const after = JSON.stringify(p.rotated);
  const at = src.indexOf(`id: "${p.id}"`);
  if (at < 0) throw new Error(`no block for ${p.id}`);
  const optAt = src.indexOf('options: [', at);
  const optEnd = src.indexOf(']', optAt) + 1;
  if (optAt < 0 || optEnd <= optAt) throw new Error(`no options for ${p.id}`);
  const found = src.slice(optAt + 'options: '.length, optEnd);
  if (JSON.stringify(JSON.parse(found)) !== JSON.stringify(p.options))
    throw new Error(`options for ${p.id} are not what was measured`);
  src = src.slice(0, optAt) + 'options: ' + after + src.slice(optEnd);
  void before;
  done += 1;
}
writeFileSync(path, src);
console.log(`\nrepaired ${done} item(s) in ${path}`);
