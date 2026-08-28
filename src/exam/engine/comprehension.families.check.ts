/**
 *   npx tsc src/exam/engine/comprehension.families.check.ts --outDir /tmp/cf \
 *     --module commonjs --target es2020 --moduleResolution node --skipLibCheck --esModuleInterop
 *   node /tmp/cf/exam/engine/comprehension.families.check.js
 *
 * Amendment 2 §2.4, run. Half the exam now has a teaching unit — and the
 * same run shows how unevenly the bank is spread across it, which is the
 * number §4.1's thinnest-first rule needs and did not have.
 */
import { comprehensionFamiliesFor } from '../../lib/practiceTasks';
import { PLAN_KEY } from '../model/plan';

const mem = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (k: string) => (mem.has(k) ? mem.get(k)! : null),
  setItem: (k: string, v: string) => { mem.set(k, v); },
  removeItem: () => {},
};
(globalThis as any).window = { dispatchEvent() {}, addEventListener() {} };
(globalThis as any).CustomEvent = class { constructor(public type: string) {} };
mem.set(PLAN_KEY, JSON.stringify({ goalId: 'ee-french', examId: 'tcf-canada', examDate: null, examLocale: 'fr-CA' }));

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const pad = (s: string, n: number) => (s + ' '.repeat(n)).slice(0, n);

(async () => {
  for (const skill of ['listening', 'reading'] as const) {
    const r = await comprehensionFamiliesFor(skill);
    if (!r) { console.log(skill, '-> no families'); continue; }
    console.log(`\n${skill.toUpperCase()} — ${r.families.length} families, ${r.unassigned} item(s) unassigned`);
    console.log('  ' + pad('family', 18) + pad('total', 7) + LEVELS.map((l) => pad(l, 5)).join(''));
    for (const f of r.families)
      console.log('  ' + pad(f.id, 18) + pad(String(f.total), 7) + LEVELS.map((l) => pad(String(f.byLevel[l] ?? 0), 5)).join(''));
    const thin = r.families.filter((f) => f.total < 8).map((f) => f.id);
    if (thin.length) console.log('  thinnest first, per §4.1: ' + thin.join(', '));

    // The number the planner actually needs. §6 requires every coordinate
    // the planner can emit to have >= 4 items and calls zero a bug, not a
    // gap. A (family, level) grid makes that countable for the first time.
    const cells = r.families.length * LEVELS.length;
    let filled = 0, atFour = 0;
    for (const f of r.families) for (const l of LEVELS) {
      const n = f.byLevel[l] ?? 0;
      if (n > 0) filled += 1;
      if (n >= 4) atFour += 1;
    }
    console.log(`  (family × level) cells: ${cells} · non-empty ${filled} · with >= 4 items ${atFour}`);
  }
  console.log('\nEvery family carries its own provenance, and it says the same thing:');
  const r = await comprehensionFamiliesFor('reading');
  console.log('  "' + (r?.families[0].provenance ?? '') + '"');
})();
