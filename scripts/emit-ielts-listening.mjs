/**
 * Emit the IELTS listening plan the backend renders from.
 *
 * The scripts live in `ielts-listening.ts`, beside the questions asked about
 * them, and that is where they should live. The renderer runs on a server that
 * cannot import TypeScript, so this writes the same content out as JSON —
 * generated, never hand-maintained, and checked for drift by
 * `ielts-listening.check.ts` so the two cannot separate silently. The French
 * bank learned this the hard way.
 *
 *   node scripts/emit-ielts-listening.mjs > /tmp/ielts-listening-plan.json
 */
import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('../src/exam/definitions/ielts-listening.ts', import.meta.url), 'utf8');

// The recordings block, read as data rather than executed.
const rows = [];
const re = /id: '(gt-l-p\d)',[\s\S]*?level: '(\w+)',[\s\S]*?speakers: (\d),\s*variety: '(\w+)',[\s\S]*?script: "((?:[^"\\]|\\.)*)",/g;
let m;
while ((m = re.exec(src))) {
  const script = JSON.parse(`"${m[5]}"`);
  const lines = script.split('\n').filter((l) => l.trim().length > 0);
  // The narrator's own lines: the announcement that opens a part and the one
  // that closes it. They are the reason a narrator was cast — in IELTS the
  // candidate HEARS them — so they are rendered by the narrator voice, not by
  // whoever speaks the part.
  const intro = lines[0].startsWith('Now turn to Part') ? lines.shift() : null;
  const outro = lines[lines.length - 1].startsWith('That is the end of Part') ? lines.pop() : null;
  rows.push({
    id: m[1],
    level: m[2],
    speakers: Number(m[3]),
    variety: m[4],
    narratorIntro: intro,
    narratorOutro: outro,
    body: lines,
    chars: script.length,
    words: script.split(/\s+/).filter(Boolean).length,
  });
}
process.stdout.write(JSON.stringify(rows, null, 1) + '\n');
