/**
 * Run the content inventory.
 *
 *   npx tsx src/exam/engine/inventory.run.ts
 *
 * Split from `inventory.ts` so the inventory itself imports nothing from node
 * and could be rendered in the app one day; this file is the only part that
 * touches the filesystem, and it does so for one reason — an audio duration
 * is a fact about a file on disk, not about a definition.
 */
import { report } from './inventory';

// @ts-expect-error - node built-in, not in the browser type set
const fs = await import('node:fs');

const sizeOf = (audioPath: string): number => {
  for (const base of ['public/audio', 'dist/audio']) {
    const p = `${base}/${audioPath}`;
    try { if (fs.existsSync(p)) return fs.statSync(p).size; } catch { /* */ }
  }
  return 0;
};

console.log(report(sizeOf));
