/**
 * Turn the frozen variety plan plus the bank's scripts into the JSON the
 * backend re-render script eats.
 *
 *   node scripts/emit-variety-plan.mjs > ../selmapp/backend/scripts/tcf-variety-plan.json
 *
 * The output is COMMITTED, into the backend, on purpose. The re-render runs on
 * the server — that is where the API key lives — and a plan file that has to be
 * carried there by hand is a step that will one day be done with a stale copy.
 * Committing it means the container already has the plan the moment it deploys,
 * and `comprehension.check.ts` asserts the JSON still matches this table, so
 * the two cannot drift in silence.
 *
 * Two sources, joined here rather than duplicated: `tcf-variety-plan.ts` holds
 * WHICH variety each recording becomes, and `tcf-canada.ts` holds the script.
 * Copying the scripts into a second file would mean an edit to a script could
 * silently fail to reach the re-render — the class of defect this whole ruling
 * is about.
 */
import { TCF_VARIETY_PLAN } from '../src/exam/definitions/tcf-variety-plan.ts';
import { TCF_CANADA } from '../src/exam/definitions/tcf-canada.ts';

const listening = TCF_CANADA.sections.find(
  (s) => s.kind === 'comprehension' && s.skill === 'listening',
);
const byId = new Map(listening.recordings.map((r) => [r.id, r]));

const rows = TCF_VARIETY_PLAN.map((a) => {
  const rec = byId.get(a.id);
  if (!rec) throw new Error(`plan names ${a.id}, which is not in the bank`);
  return {
    id: a.id,
    level: a.level,
    speakers: a.speakers,
    variety: a.variety,
    script: rec.script,
  };
});

if (rows.length !== listening.recordings.length) {
  throw new Error(`plan covers ${rows.length}, bank holds ${listening.recordings.length}`);
}

process.stdout.write(JSON.stringify(rows, null, 1));
