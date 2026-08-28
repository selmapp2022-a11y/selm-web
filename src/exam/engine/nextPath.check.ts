/**
 *   npx tsc src/exam/engine/nextPath.check.ts --outDir /tmp/np --module commonjs \
 *     --target es2020 --moduleResolution node --skipLibCheck --esModuleInterop
 *   node /tmp/np/engine/nextPath.check.js
 */
import { safeNext } from '../../lib/nextPath';

const CASES: Array<[string, string | null]> = [
  ['?next=%2Fexam.html%23%2Fattestation', '/exam.html#/attestation'],
  ['?next=%2Fdashboard', '/dashboard'],
  ['', null],
  ['?next=', null],
  ['?next=https%3A%2F%2Fevil.example', null],
  ['?next=%2F%2Fevil.example', null],
  ['?next=%2F%5Cevil.example', null],
  ['?next=javascript%3Aalert(1)', null],
  ['?next=%2Fjavascript%3Aalert(1)', null],
  ['?next=%5C%2Fevil.example', null],
  ['?next=exam.html', null],
];

let bad = 0;
for (const [q, want] of CASES) {
  const got = safeNext(q);
  const ok = got === want;
  if (!ok) bad += 1;
  console.log((ok ? '  ok   ' : '  FAIL ') + (q || '(empty)').padEnd(42) + ' -> ' + String(got));
}
console.log(bad === 0 ? '\nopen-redirect surface: closed, ' + CASES.length + ' cases' : '\n' + bad + ' FAILURES');
