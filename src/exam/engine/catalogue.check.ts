import { CATALOGUE, entriesFor, cellAt } from '../definitions/prescriptions';
console.log('catalogue entries: ' + CATALOGUE.length);
for (const e of CATALOGUE)
  console.log('  ' + [e.cell.at.examId, e.cell.at.taskId, 'NCLC ' + e.cell.at.level].join(' / ') +
    '  failure=' + e.cell.failureMode.id + '  practice items=' + e.cell.practiceItemIds.length);
console.log('entriesFor(tcf-canada, tcf-ee-t3): ' + entriesFor('tcf-canada','tcf-ee-t3').length);
console.log('entriesFor(tcf-canada, tcf-ee-t1): ' + entriesFor('tcf-canada','tcf-ee-t1').length);
console.log('entriesFor(tcf-canada, tcf-eo-t1): ' + entriesFor('tcf-canada','tcf-eo-t1').length + '  <- expression orale, a visible gap and not a generic lesson');
console.log('cellAt(tcf-canada, tcf-ee-t3, 6): ' + (cellAt('tcf-canada','tcf-ee-t3',6) ? 'present' : 'none'));
console.log('cellAt(tcf-canada, tcf-eo-t1, 6): ' + (cellAt('tcf-canada','tcf-eo-t1',6) ? 'present' : 'none') + '  <- next cell to write, per Amendment 2 SS5');
