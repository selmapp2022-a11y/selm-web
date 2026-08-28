import { CATALOGUE, entriesFor, cellAt } from '../definitions/prescriptions';
console.log('catalogue entries: ' + CATALOGUE.length);
for (const e of CATALOGUE)
  console.log('  ' + [e.cell.at.examId, e.cell.at.taskId, 'NCLC ' + e.cell.at.level].join(' / ') +
    '  failure=' + e.cell.failureMode.id + '  practice items=' + e.cell.practiceItemIds.length);
console.log('entriesFor(tcf-canada, tcf-ee-t3): ' + entriesFor('tcf-canada','tcf-ee-t3').length);
console.log('entriesFor(tcf-canada, tcf-ee-t1): ' + entriesFor('tcf-canada','tcf-ee-t1').length);
console.log('entriesFor(tcf-canada, tcf-eo-t1): ' + entriesFor('tcf-canada','tcf-eo-t1').length);
console.log('entriesFor(ielts-gt, gt-w-t1):      ' + entriesFor('ielts-gt','gt-w-t1').length + '  <- IELTS has no cell at all: a visible gap, not a generic lesson');
console.log('cellAt(tcf-canada, tcf-ee-t3, 6): ' + (cellAt('tcf-canada','tcf-ee-t3',6) ? 'present' : 'none'));
console.log('cellAt(tcf-canada, tcf-ee-t3, 7): ' + (cellAt('tcf-canada','tcf-ee-t3',7) ? 'present' : 'none') + '  <- NCLC 6 is complete; the next level is the next question');
