#!/usr/bin/env node
/**
 * THE MOBILE BUILD CARRIES THE AUDIO. THE WEB BUILD DOES NOT.
 *
 * Ruled 31 August 2026, after the bank moved to the CDN and the consequence
 * was stated rather than discovered:
 *
 *   *"Offline is a commitment in the governing documents, and it exists for
 *   candidates on poor connections — the same population the French market is
 *   concentrated in. An exam that works offline for half its sections is not
 *   an offline exam."*
 *
 * ── TWO DELIVERY PATHS, ONE SOURCE ─────────────────────────────────────────
 * `audio-src/` is the source of truth for both. The web build leaves it alone
 * and the app resolves audio against the CDN; this build copies it into `dist`
 * and points the app at `/audio`, so a Capacitor bundle holds every recording
 * and needs no network to play one.
 *
 * ── WHY IT IS NOT A `public/` COPY ─────────────────────────────────────────
 * The obvious version copies `audio-src/` into `public/` before `vite build`
 * and deletes it after. That leaves the repository in a state where 84 MB of
 * audio is inside `public/` — and if the build fails, or is interrupted, it
 * stays there and the next WEB build ships it. `npm run audio` would catch it,
 * but only if someone ran it.
 *
 * Copying into `dist/` after the build cannot leave that residue: `dist` is
 * disposable and is rebuilt from scratch every time.
 */
import { cpSync, existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const SRC = 'audio-src';
const OUT = process.env.MOBILE_OUT ?? 'dist';

if (!existsSync(SRC)) {
  console.error(`No ${SRC}/ — nothing to bundle. The mobile build must not ship without audio.`);
  process.exit(1);
}

// `/audio` is the base the app used before the CDN move, and it is still the
// right one inside a Capacitor bundle: the web view serves `dist` from the
// device, so a root-relative path is a local file.
console.log('building with VITE_EXAM_AUDIO_BASE=/audio …');
execFileSync('npx', ['vite', 'build', '--outDir', OUT, '--emptyOutDir'], {
  stdio: 'inherit',
  env: { ...process.env, VITE_EXAM_AUDIO_BASE: '/audio' },
});

cpSync(SRC, join(OUT, 'audio'), { recursive: true });

const walk = (d) => readdirSync(d).flatMap((n) => {
  const p = join(d, n);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const bundled = walk(join(OUT, 'audio')).filter((p) => p.endsWith('.mp3'));
const source = walk(SRC).filter((p) => p.endsWith('.mp3'));
const bytes = bundled.reduce((n, p) => n + statSync(p).size, 0);

// A build that quietly shipped nine of ninety-one files would still run, and
// the candidate would find out one recording at a time. So it is counted.
if (bundled.length !== source.length) {
  console.error(`\nBundled ${bundled.length} of ${source.length} recordings. Refusing to call this an offline build.`);
  process.exit(1);
}
const js = walk(join(OUT, 'assets')).filter((p) => /main-.*\.js$/.test(p));
const points = js.some((p) => !/cdn\.digitaloceanspaces\.com/.test(readFileSync(p, 'utf8')));
console.log(`\n${bundled.length} recordings bundled · ${(bytes / 1e6).toFixed(1)} MB`);
console.log(points
  ? 'and the bundle resolves audio locally, not against the CDN.'
  : 'WARNING: the bundle still names the CDN — check VITE_EXAM_AUDIO_BASE.');
if (!points) process.exit(1);
