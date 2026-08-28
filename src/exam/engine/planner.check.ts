/**
 *   npx tsc src/exam/engine/planner.check.ts --outDir /tmp/pn --module commonjs \
 *     --target es2020 --moduleResolution node --skipLibCheck --esModuleInterop
 *   node /tmp/pn/exam/engine/planner.check.js
 *
 * Part 6's three planner rows, run:
 *
 *   Planner   | Complete plan for a candidate WITH an attestation and
 *             | WITHOUT, no empty slots
 *   Ordering  | Plan visibly prioritises the lowest skill
 *   Bank      | Every coordinate the planner can emit has >= 4 items.
 *             | Zero is a bug, not a gap
 */
import { TCF_CANADA } from '../definitions/tcf-canada';
import { buildPlan, shortfall, MIN_ITEMS_PER_COORDINATE } from './planner';
import type { Attestation } from '../model/attestation';

const pad = (s: string, n: number) => (s + ' '.repeat(n)).slice(0, n);

// A candidate one level short in writing and two in listening, at target
// NCLC 7 — the French Express Entry category, and the cluster §2.5 predicts.
const ATT: Attestation = {
  id: 'a1', examId: 'tcf-canada', kind: 'retrospective', entryMethod: 'typed',
  verification: 'unverified', language: 'fr', sat: '2026-06',
  awarded: { listening: 398, reading: 503, writing: 9, speaking: 12 },
  benchmark: { system: 'NCLC', listening: 5, reading: 8, writing: 6, speaking: 8 },
  responseIds: [], provenance: 'volunteered', studiedSince: null,
  consentedAt: '', retainUntil: '',
} as unknown as Attestation;

for (const att of [ATT, null]) {
  const plan = buildPlan({ exam: TCF_CANADA, attestation: att, target: 7, daysLeft: 42, slots: 12 });
  console.log(`\n${'='.repeat(78)}\nBASIS: ${plan.basis}${att ? '' : '  (no attestation, and no diagnostic taken)'}`);
  if (plan.order.length) {
    console.log('  distance to target, worst first:');
    for (const o of plan.order)
      console.log(`    ${pad(o.skill, 11)} awarded NCLC ${o.awarded}   target ${o.target}   gap ${o.gap > 0 ? '+' + o.gap : o.gap}`);
  } else {
    console.log('  no marks, so no distances. Order is the exam\'s own — Part 3 §2.');
  }
  console.log(`  ${plan.slots.length} slots, ${plan.daysLeft} days left`);
  console.log('  ' + pad('#', 4) + pad('skill', 11) + pad('coordinate', 26) + pad('gap', 6) + pad('items', 7) + 'prescription');
  for (const s of plan.slots)
    console.log('  ' + pad(String(s.n), 4) + pad(s.coordinate.skill, 11) + pad(s.coordinate.label, 26) +
      pad(s.gap === null ? '—' : (s.gap > 0 ? '+' + s.gap : String(s.gap)), 6) +
      pad(String(s.items), 7) + (s.prescription ?? '—'));

  const first = plan.slots[0];
  if (att) {
    const worst = plan.order[0].skill;
    console.log(`  ORDERING: worst skill is ${worst}; slot 1 is ${first.coordinate.skill} -> ${worst === first.coordinate.skill ? 'PASS' : 'FAIL'}`);
  }
}

console.log(`\n${'='.repeat(78)}\nTHE SHORTFALL — every coordinate the planner can emit that it cannot fill`);
const full = buildPlan({ exam: TCF_CANADA, attestation: ATT, target: 7, daysLeft: 42, slots: 60 });
const short = shortfall(full);
console.log(`  ${short.length} of ${full.slots.length} slots hold fewer than ${MIN_ITEMS_PER_COORDINATE} items.`);
console.log('  §6 calls zero a bug, not a gap. This is the content shopping list.\n');
console.log('  ' + pad('coordinate', 26) + pad('skill', 11) + pad('has', 5) + 'needs');
for (const r of short.slice(0, 16))
  console.log('  ' + pad(r.label, 26) + pad(r.skill, 11) + pad(String(r.has), 5) + '+' + r.needs);
if (short.length > 16) console.log(`  … and ${short.length - 16} more`);

const filled = full.slots.filter((s) => s.items >= MIN_ITEMS_PER_COORDINATE);
console.log(`\n  coordinates that ARE ready: ${filled.length}`);
for (const s of filled) console.log(`    ${pad(s.coordinate.label, 26)} ${s.items} items` + (s.prescription ? `  · ${s.prescription}` : ''));
