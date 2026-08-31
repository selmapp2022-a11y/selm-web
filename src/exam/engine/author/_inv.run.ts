import { inventory } from '../inventory';
const rows = inventory();
console.log('exam         skill       exists reach serv  empty thin');
for (const r of rows as any[]) {
  console.log(
    String(r.examId).padEnd(13) + String(r.skill).padEnd(12) +
    String(r.existsItems).padStart(5) + String(r.reachableItems).padStart(6) + String(r.servableItems).padStart(6) +
    String(r.emptyCoordinates ?? '').padStart(6) + String(r.thinCoordinates ?? '').padStart(6));
}
