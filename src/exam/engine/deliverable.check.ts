/**
 * A SCRIPT WITH NO AUDIO IS NOT A QUESTION THE PRODUCT CAN ASK.
 *
 *   npx tsx src/exam/engine/deliverable.check.ts
 *
 * The listening banks are being written while the audio waits on the variety
 * gate, so for the first time the product holds comprehension material it
 * cannot serve. The founder's condition when he approved that:
 *
 *   *"An item with no audioPath must not be served to a user. Make sure
 *   `servable` does not count them — otherwise the number goes up and there
 *   is nothing behind it."*
 *
 * Four places have to agree, and this check is what stops them drifting:
 *
 *   - `practicable`  — practice already filtered, and always did
 *   - `serveEpreuve` — did NOT, and this is the dangerous one: one
 *                      unrenderable recording on a paper makes `SectionPage`
 *                      refuse the WHOLE section, so twenty scripts with no
 *                      audio would have taken the four that do have it off
 *                      the air
 *   - `coordinatesFor` — the planner would have scheduled coordinates that
 *                      cannot play
 *   - `inventory`    — `reachable` and `servable` would have counted them
 *
 * The fixture is synthetic and frozen on purpose. Read from the live bank
 * this check would go quiet the moment every recording had audio, which is
 * the failure `author.check.ts` was caught with on 30 August.
 */
import type { ComprehensionSection, Recording } from '../model/types';
import { serveEpreuve } from './comprehension';
import { practicable, deliverable } from './practicePool';

let failed = 0;
const t = (name: string, got: unknown, want: unknown) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failed++;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name}${ok ? '' : `   got ${JSON.stringify(got)} want ${JSON.stringify(want)}`}`);
};

const rec = (id: string, level: string, audio?: string): Recording =>
  ({ id, level, family: 'monologue', script: `Script for ${id}.`, audioPath: audio } as Recording);

const section = (audioPlaysOnce: boolean): ComprehensionSection =>
  ({
    id: 's', kind: 'comprehension', skill: 'listening',
    name: { en: 'S', fr: 'S' },
    timeLimitSec: 600,
    delivery: { audioPlaysOnce, presentation: 'one_at_a_time' },
    sets: { source: 'fixture' },
    serve: { count: 2, byBand: { A1: 1, B1: 1 } },
    families: [{ id: 'monologue', label: { en: 'M', fr: 'M' }, describes: { en: 'x', fr: 'x' }, provenance: { en: 'x', fr: 'x' } }],
    recordings: [
      rec('with-a1', 'A1', '/audio/a1.mp3'),
      rec('bare-a1', 'A1'),
      rec('with-b1', 'B1', '/audio/b1.mp3'),
      rec('bare-b1', 'B1'),
    ],
    items: [
      { id: 'q1', recordingId: 'with-a1', level: 'A1', stem: 'A?', options: ['a', 'b', 'c', 'd'], answer: 0 },
      { id: 'q2', recordingId: 'bare-a1', level: 'A1', stem: 'B?', options: ['a', 'b', 'c', 'd'], answer: 1 },
      { id: 'q3', recordingId: 'with-b1', level: 'B1', stem: 'C?', options: ['a', 'b', 'c', 'd'], answer: 2 },
      { id: 'q4', recordingId: 'bare-b1', level: 'B1', stem: 'D?', options: ['a', 'b', 'c', 'd'], answer: 3 },
    ],
  } as unknown as ComprehensionSection);

console.log('\n1. In an AUDIO section, a script with no audio is not deliverable\n');
const audio = section(true);
t('a rendered recording is deliverable', deliverable(audio, audio.recordings[0]), true);
t('a bare script is not', deliverable(audio, audio.recordings[1]), false);
t('practice never offers it', practicable(audio).map((r) => r.id), ['with-a1', 'with-b1']);

console.log('\n2. And the mock exam does not put it on the paper\n');
// THE DANGEROUS ONE. `SectionPage` refuses a whole section when any served
// recording has no audio, so a paper drawn without this filter would take the
// renderable recordings down with the bare ones.
const paper = serveEpreuve(audio);
t('the paper holds only rendered recordings', paper.map((r) => r.id), ['with-a1', 'with-b1']);
t('and is still full length', paper.length, audio.serve!.count);

console.log('\n3. A READING section is unaffected — it has no audio to be missing\n');
const text = section(false);
t('every passage is deliverable', text.recordings.every((r) => deliverable(text, r)), true);
t('practice offers all of them', practicable(text).length, 4);
t('and so does the paper', serveEpreuve(text).length, 2);

console.log(failed ? `\n${failed} FAILED` : '\nA number with nothing behind it cannot be produced this way.');
if (failed) throw new Error(`${failed} deliverable case(s) failed`);
