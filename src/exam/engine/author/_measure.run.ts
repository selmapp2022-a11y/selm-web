import { readFileSync } from 'node:fs';
import { EXAMS } from '../../definitions';
import type { ComprehensionSection } from '../../model/types';
import { runVeto, profile, type Anchor } from './veto';
import type { Band } from './types';
const [examId, skill, file] = process.argv.slice(2);
const e = EXAMS.find((x) => x.id === examId)!;
const s = e.sections.find((x): x is ComprehensionSection => x.kind === 'comprehension' && x.skill === skill)!;
const anchors = s.recordings.filter((r) => r.role === 'anchor').map((r) => ({ id: r.id, level: r.level as Band, script: r.script }));
const raws = JSON.parse(readFileSync(file, 'utf8')) as Array<{ id: string; level: Band; script: string }>;
for (const r of raws) {
  const p = profile(r.script, e.locale);
  const v = runVeto(r.script, r.level, anchors as Anchor[], e.locale);
  console.log(`${r.id.padEnd(15)} ${r.level}  sent ${p.meanSentenceWords.toFixed(2).padStart(6)}  long ${p.longWordRate.toFixed(3)}  clause ${p.clauseRate.toFixed(2)}  var ${p.lexicalVariety.toFixed(2)}  ${v.pass ? 'PASS' : 'FAIL ' + v.reasons.join('; ')}`);
}
