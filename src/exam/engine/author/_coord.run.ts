import { EXAMS } from '../../definitions';
import type { ComprehensionSection } from '../../model/types';
const examId = process.argv[2] ?? 'tcf-canada';
const skill = process.argv[3] ?? 'listening';
const e = EXAMS.find((x) => x.id === examId)!;
const s = e.sections.find((x): x is ComprehensionSection => x.kind === 'comprehension' && x.skill === skill)!;
const fams = s.families.map((f) => f.id);
const bands = ['A1','A2','B1','B2','C1','C2'];
const key = (f: string, b: string) => `${f} · ${b}`;
const rec = new Map<string, number>(), noAudio = new Map<string, number>();
for (const r of s.recordings) {
  const k = key(r.family!, r.level);
  rec.set(k, (rec.get(k) ?? 0) + 1);
  if (!r.audioPath) noAudio.set(k, (noAudio.get(k) ?? 0) + 1);
}
console.log('recordings:', s.recordings.length, 'items:', s.items.length, 'anchors:', s.recordings.filter(r=>r.role==='anchor').length);
console.log('band'.padEnd(6) + fams.map(f=>f.padEnd(18)).join(''));
for (const b of bands) console.log(b.padEnd(6) + fams.map(f=>String(rec.get(key(f,b)) ?? 0).padEnd(18)).join(''));
console.log('no audio:', [...noAudio].map(([k,v])=>k+'='+v).join(', ') || 'none');
const maxId = Math.max(...s.recordings.map(r => Number((r.id.match(/-(\d+)-r$/)||[0,0])[1])));
console.log('highest id number:', maxId);
