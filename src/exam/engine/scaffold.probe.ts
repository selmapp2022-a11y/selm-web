import { TCF_CANADA } from '../definitions/tcf-canada';
import { ITEMS } from '../definitions/practice/tcf-ee-t1-nclc6.items';
import { overlapRatio, segmentationFor, words } from './text';
const SEG = segmentationFor(TCF_CANADA.locale);
const tasks: any[] = (TCF_CANADA.sections as any[]).flatMap((s) => s.tasks ?? []);
for (const tid of ['tcf-ee-t1', 'tcf-ee-t2', 'tcf-ee-t3']) {
  const t = tasks.find((x) => x.id === tid);
  const sc = (t.suppliedScaffold ?? []).join(' ');
  const rule = (t.gate ?? []).find((g: any) => g.id === 'template_ratio');
  console.log(`${tid}  maxRatio ${rule?.maxRatio}  scaffold ${words(sc, SEG).length} tokens, ${new Set(words(sc, SEG).map((w) => w.toLowerCase())).size} distinct`);
  console.log(`   scaffold: ${sc}`);
}
console.log('\nscaffoldRatio of the eight NCLC 7 model answers against tâche 1\'s scaffold (rule zeroes above 0.2):');
const t1 = tasks.find((x) => x.id === 'tcf-ee-t1');
const sc1 = (t1.suppliedScaffold ?? []).join(' ');
const vals: number[] = [];
for (const it of ITEMS) {
  const r = overlapRatio(it.responses.nclc7, sc1, SEG);
  vals.push(r);
  console.log(`   ${it.id.padEnd(26)} ${r.toFixed(3)}${r > 0.2 ? '   ZEROED' : ''}`);
}
console.log(`   min ${Math.min(...vals).toFixed(3)}  max ${Math.max(...vals).toFixed(3)}  mean ${(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(3)}`);
console.log('\nthe same eight against an EMPTY scaffold, as a control:', ITEMS.map((i) => overlapRatio(i.responses.nclc7, '', SEG)).join(', '));
