/**
 * Does a second sitting present a second paper?
 *
 *   npx tsx src/exam/engine/epreuve.check.ts
 *
 * It did not. `SectionPage` called `serveEpreuve(section)` with no state, so
 * every sitting drew from a memory that had seen nothing and resolved to the
 * bank's own order. Sixty-one documents were written for compréhension
 * écrite; eight of them were ever asked.
 *
 * What is checked here is the whole of the claim, including the parts that
 * must NOT change: the published band profile, the length, and the ladder.
 */
import { EXAMS, GOALS } from '../definitions';
import { itemsFor } from './comprehension';
import { paperFor, situationFor, clearEpreuveMemory, EPREUVE_KEY } from '../model/epreuve';
import type { ComprehensionSection } from '../model/types';

const mem = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (k: string) => (mem.has(k) ? mem.get(k)! : null),
  setItem: (k: string, v: string) => { mem.set(k, v); },
  removeItem: (k: string) => { mem.delete(k); },
};

let failed = 0;
const must = (ok: boolean, what: string) => {
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${what}`);
  if (!ok) failed += 1;
};

/** A NEW sitting, exactly as `SectionPage` runs it: no stored paper. */
const sit = (section: ComprehensionSection) => {
  const { paper, drew } = paperFor(section, undefined);
  if (!drew) { failed += 1; console.log('  FAIL  a new sitting did not draw'); }
  return paper;
};

const BANDS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

for (const exam of EXAMS) {
  for (const section of exam.sections) {
    if (section.kind !== 'comprehension') continue;
    if (!section.serve) continue;   // a section that presents its whole bank
    clearEpreuveMemory();

    console.log(`\n${exam.id} · ${section.id} — bank ${section.recordings.length} recordings, épreuve ${section.serve.count}`);

    const papers = [sit(section), sit(section), sit(section)];
    const ids = papers.map((p) => p.map((r) => r.id).join(','));

    must(ids[0] !== ids[1], 'sitting 2 is not sitting 1');
    must(ids[1] !== ids[2], 'sitting 3 is not sitting 2');
    must(ids[0] !== ids[2], 'sitting 3 is not sitting 1');

    for (let n = 0; n < papers.length; n++) {
      const p = papers[n];
      // The PUBLISHED shape does not move with the candidate or the sitting.
      const profile = Object.fromEntries(
        BANDS.map((b) => [b, p.filter((r) => r.level === b).length]).filter(([, c]) => (c as number) > 0),
      );
      const want = Object.fromEntries(Object.entries(section.serve!.byBand).filter(([, c]) => (c ?? 0) > 0));
      must(
        JSON.stringify(profile) === JSON.stringify(want),
        `sitting ${n + 1} keeps the published band profile ${JSON.stringify(want)}`,
      );
      const ladder = p.map((r) => BANDS.indexOf(r.level));
      must(ladder.every((v, i) => i === 0 || v >= ladder[i - 1]), `sitting ${n + 1} is in ladder order`);
      must(p.length === section.serve!.count, `sitting ${n + 1} is ${section.serve!.count} recordings long`);
      console.log(`      sitting ${n + 1}: ${itemsFor(section, p).length} questions · ${p.map((r) => r.id).join(' ')}`);
    }

    // A RELOAD is not a new sitting. The candidate must get their own paper
    // back, and the memory must not move — otherwise a dropped connection
    // costs them a paper's worth of documents they will never be asked.
    const before = mem.get(EPREUVE_KEY);
    const storedIds = papers[2].map((r) => r.id);
    const reload = paperFor(section, storedIds);
    must(!reload.drew, 'a reload does not draw');
    must(reload.paper.map((r) => r.id).join(',') === storedIds.join(','), 'a reload returns the same paper');
    must(mem.get(EPREUVE_KEY) === before, 'a reload does not advance the memory');

    // A stored paper the bank can no longer honour is not a paper. Better a
    // fresh full-length épreuve than a silently shortened one.
    const broken = paperFor(section, [...storedIds.slice(0, -1), 'this-id-does-not-exist']);
    must(broken.drew, 'a stored paper with a missing document is re-drawn');
    must(broken.paper.length === section.serve.count, 'and the re-draw is full length');

    // And exhaustion recycles rather than shortening the exam — a candidate
    // who sits twenty mocks gets repeats, not a twenty-question épreuve.
    let short = 0;
    for (let n = 0; n < 20; n++) if (sit(section).length !== section.serve.count) short += 1;
    must(short === 0, 'twenty further sittings are all full length');
  }
}

// ── THE EXPRESSION HALF ──────────────────────────────────────────────────
// `TaskPage` rendered `task.prompt` — situation one, every sitting, every
// destination. Same defect, same fix, and the same two rules that pull apart.
for (const exam of EXAMS) {
  const sharing = GOALS.filter((g) => g.exams.includes(exam.id)).map((g) => g.id);
  for (const section of exam.sections) {
    if (section.kind !== 'production') continue;
    for (const task of section.tasks) {
      clearEpreuveMemory();
      console.log(`\n${exam.id} · ${task.id}`);
      const goal = sharing[0];
      const seen: string[] = [];
      for (let n = 0; n < 3; n++) seen.push(situationFor(task, undefined, sharing, goal).situation.id);
      must(new Set(seen).size === 3, `three sittings, three situations (${seen.join(' → ')})`);

      const before = mem.get(EPREUVE_KEY);
      const back = situationFor(task, seen[2], sharing, goal);
      must(!back.drew && back.situation.id === seen[2], 'a reload returns the same situation');
      must(mem.get(EPREUVE_KEY) === before, 'a reload does not advance the memory');

      // And the served situation carries ITS OWN keywords, which is what
      // stops `off_topic` zeroing a correct answer to situation three.
      const gated = (task.gate ?? []).some((g) => g.id === 'off_topic');
      if (gated) must(Boolean(back.situation.topicKeywords?.length) || back.situation.id.endsWith('-p1'),
        'the served situation carries keywords of its own');

      // Three destinations, three different opening situations.
      if (sharing.length > 1) {
        clearEpreuveMemory();
        const firsts = sharing.map((g) => situationFor(task, undefined, sharing, g).situation.id);
        must(new Set(firsts).size === sharing.length, `${sharing.length} destinations open on ${sharing.length} situations`);
      }
    }
  }
}

console.log(failed ? `\n${failed} FAILED` : '\nall assertions pass');
if (failed) throw new Error(`${failed} épreuve case(s) failed`);
