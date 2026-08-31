import { readFileSync, readdirSync } from 'node:fs';
import { EXAMS } from '../../definitions';
import type { ComprehensionSection } from '../../model/types';
const dir = 'src/exam/engine/author/batches';
let bad = 0, checked = 0;
for (const f of readdirSync(dir)) {
  const raws = JSON.parse(readFileSync(`${dir}/${f}`, 'utf8')) as any[];
  for (const raw of raws) {
    for (const e of EXAMS) {
      for (const s of e.sections) {
        if (s.kind !== 'comprehension') continue;
        const sec = s as ComprehensionSection;
        for (const [qi, q] of (raw.items ?? []).entries()) {
          const id = q.id ?? `${String(raw.id).replace(/-r$/, '')}-q${qi + 1}`;
          const inBank = sec.items.find((i) => i.id === id) as any;
          if (!inBank || !inBank.options) continue;
          checked++;
          const wantText = (q.options ?? [])[q.correct ?? q.answer];
          const gotText = inBank.options[inBank.answer];
          if (wantText !== gotText) { bad++; if (bad < 8) console.log(`MISMATCH ${id} (${f}) want="${wantText}" got="${gotText}"`); }
        }
      }
    }
  }
}
console.log(`checked ${checked} items from batch files; key mismatches: ${bad}`);
