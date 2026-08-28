/**
 * The calibration record, run.
 *
 *   npx tsc src/exam/engine/calibration.check.ts --outDir /tmp/cal --module commonjs \
 *     --target es2020 --moduleResolution node --skipLibCheck --esModuleInterop
 *   node /tmp/cal/engine/calibration.check.js
 *
 * Four things it has to show, and the fourth is the one Amendment 2 §1
 * turns on:
 *
 *   1. `kind` is derived from the record, never asked
 *   2. the two kinds are counted separately and the gate is judged per kind
 *   3. recency weights a retrospective pair down, and never rejects it
 *   4. **the retrospective gate can open while the prospective one is still
 *      empty** — which is the whole reason the product is buildable
 */
import { kindOf } from '../model/attestation';
import { coverage, publishableClaim, recencyWeight, type Pair } from './calibration';

const pad = (s: string, n: number) => (s + ' '.repeat(n)).slice(0, n);
const n2 = (x: number) => x.toFixed(2);

console.log('1. kind is DERIVED, never asked');
console.log('   no responses of ours before the sitting  -> ' + kindOf({ responseIds: [] }));
console.log('   two responses of ours before the sitting -> ' + kindOf({ responseIds: ['r1', 'r2'] }));
console.log('');

console.log('2. recency is a WEIGHT, never a filter');
for (const [g, st] of [[0, false], [1, false], [6, false], [12, false], [12, true], [36, false]] as const)
  console.log('   gap ' + pad(String(g) + ' months', 11) + (st ? 'studied since  ' : 'not stated     ') + 'weight ' + n2(recencyWeight({ gapMonths: g, studiedSince: st })));
console.log('   nothing is ever excluded — the lowest weight above is still counted');
console.log('');

// A population shaped the way the founder described it: attestations arrive
// from candidates who already sat, before they ever met us. Ten per level,
// four to ten, all retrospective. And three prospective pairs, because the
// loop that produces them is slow.
const pairs: Pair[] = [];
let i = 0;
for (const level of [4, 5, 6, 7, 8, 9, 10])
  for (let k = 0; k < 10; k += 1) {
    const skill = (['speaking', 'listening', 'reading', 'writing'] as const)[k % 4];
    const official = level + 3;
    pairs.push({
      attestationId: 'a' + i++, kind: 'retrospective', examId: 'tcf-canada', skill,
      official, ours: official + (k % 3 === 0 ? 1 : k % 3 === 1 ? 0 : 0.5),
      officialLevel: level, gapMonths: 2 + (k % 9), studiedSince: k % 4 === 0 ? true : null,
    });
  }
for (let k = 0; k < 3; k += 1)
  pairs.push({
    attestationId: 'p' + k, kind: 'prospective', examId: 'tcf-canada', skill: 'writing',
    official: 10, ours: 10 + k * 0.5, officialLevel: 7, gapMonths: 0, studiedSince: false,
  });

const c = coverage(pairs);
console.log('3. counted per kind, gate judged per kind');
console.log('   ' + pad('', 16) + pad('pairs', 8) + pad('bias', 8) + pad('|diff|', 9) + pad('within 1', 10) + pad('median gap', 12) + 'gate');
for (const k of ['retrospective', 'prospective'] as const) {
  const a = c[k].agreement;
  console.log('   ' + pad(k, 16) + pad(String(a.n), 8) + pad(n2(a.bias), 8) + pad(n2(a.meanAbs), 9) +
    pad(n2(a.within1 * 100) + '%', 10) + pad(a.medianGapMonths + ' months', 12) + (c[k].gateOpen ? 'OPEN' : 'shut'));
}
console.log('');
console.log('   levels, retrospective: ' + c.retrospective.perLevel.map((l) => l.level + ':' + l.n).join('  '));
console.log('   levels, prospective:   ' + c.prospective.perLevel.map((l) => l.level + ':' + l.n).join('  '));
console.log('');

console.log('4. what may be published');
for (const k of ['retrospective', 'prospective'] as const) {
  const claim = publishableClaim(c[k]);
  console.log('   ' + k + ': ' + (claim ? '' : 'NOTHING — the gate for this kind is shut, and there is no wording for a figure we have not earned'));
  if (claim) console.log('     "' + claim.en + '"');
}
console.log('');
console.log('   The retrospective gate is open while the prospective one is empty.');
console.log('   That is the product being buildable: 70 candidates who never came back.');
console.log('');
console.log('5. there is no combined figure, by construction');
console.log('   `Coverage` is keyed by kind at the top level and exports no total.');
console.log('   Adding them has to be written out by hand, where a reviewer sees it.');
