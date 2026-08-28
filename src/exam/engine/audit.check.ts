import { TCF_CANADA } from '../definitions/tcf-canada';
import { ITEMS } from '../definitions/practice/tcf-ee-t3-nclc6.items';
import { overlapRatio, segmentationFor, DEFAULT_SEGMENTATION, wordCount } from './text';
const FR = segmentationFor('fr-CA');
const OLD = DEFAULT_SEGMENTATION;
const A: any = (TCF_CANADA.sections as any[]).flatMap(s => s.tasks ?? []).find((t:any)=>t.id==='tcf-ee-t3');
const scaffold = (A.suppliedScaffold ?? []).join(' ');
const n = (x:number)=>x.toFixed(3);
console.log('THRESHOLD AUDIT — how the elision fix moved each measured quantity');
console.log('');
console.log('promptOverlap (rule maxOverlapRatio 0.85 on t3, 0.5 on t1/t2)');
let wo=0, wn=0, so=0, sn=0, k=0;
for (const it of ITEMS) for (const key of ['nclc7','nclc6','single'] as const) {
  const t = (it.responses as any)[key] as string;
  const o = overlapRatio(t, it.prompt.fr, OLD), nn = overlapRatio(t, it.prompt.fr, FR);
  const o2 = overlapRatio(t, scaffold, OLD), n2 = overlapRatio(t, scaffold, FR);
  wo+=o; wn+=nn; so+=o2; sn+=n2; k++;
}
console.log('  mean before ' + n(wo/k) + '   after ' + n(wn/k) + '   drift ' + n((wn-wo)/k) + ' (' + n(((wn/wo)-1)*100) + '%)');
console.log('');
console.log('scaffoldRatio (rule template_ratio 0.4 on t3, 0.2 on t1/t2)');
console.log('  mean before ' + n(so/k) + '   after ' + n(sn/k) + '   drift ' + n((sn-so)/k) + ' (' + n(((sn/so)-1)*100) + '%)');
console.log('');
console.log('worst single case, promptOverlap');
let worst = {id:'',o:0,nn:0};
for (const it of ITEMS) for (const key of ['nclc7','nclc6','single'] as const) {
  const t = (it.responses as any)[key] as string;
  const o = overlapRatio(t, it.prompt.fr, OLD), nn = overlapRatio(t, it.prompt.fr, FR);
  if (nn-o > worst.nn-worst.o) worst = {id: it.id+'/'+key, o, nn};
}
console.log('  ' + worst.id + '  ' + n(worst.o) + ' -> ' + n(worst.nn));
console.log('');
console.log('word counts on the eight NCLC 7 responses (bands 120-180)');
for (const it of ITEMS) {
  console.log('  ' + it.id.padEnd(26) + 'before ' + String(wordCount(it.responses.nclc7, OLD)).padStart(3) + '   after ' + String(wordCount(it.responses.nclc7, FR)).padStart(3));
}
