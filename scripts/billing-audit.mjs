#!/usr/bin/env node
/**
 * THE PLAY BILLING LIBRARY VERSION, READ OUT OF THE ARTEFACT ITSELF.
 *
 *   npm run billing
 *
 * ── The warning this exists for ───────────────────────────────────────────
 * Google Play, 27 August 2026, against `com.selmapp.app`:
 *
 *   *"App must use Google Play Billing Library version 8.0.0 or later. Your
 *   app uses an old version of Google Play Billing Library. From Oct 31, 2026,
 *   all apps must use version 8.0.0 or later."*  — **App updates with these
 *   issues will be rejected.**
 *
 * One bundle was named: versionCode 42 (2.0.8), published 23 July 2026. The
 * source had already moved on — `@revenuecat/purchases-capacitor` 13.4.2
 * pulls `purchases-hybrid-common` 18.32.1, and the AAB built from it on
 * 27 August carries `billing_client=8.3.0`. So the violation was against a
 * SHIPPED artefact, not against the code, and it clears the day 2.1.0 is
 * published.
 *
 * ── Why a check and not a note ────────────────────────────────────────────
 * Nobody chose that version. It arrives transitively, through a third-party
 * SDK, and it moved without anyone editing a line — which is exactly how it
 * fell behind in the first place, and exactly how it will fall behind again.
 * The `package.json` range `^13.4.2` says nothing about which billing library
 * ends up inside the binary; only the binary does.
 *
 * So this reads the artefact. `base/root/billing.properties` is written into
 * the bundle by the billing library itself and names its own version. That is
 * the number Play reads, so it is the number this asserts.
 *
 * Run it after `./gradlew bundleRelease` and before uploading.
 */
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

/** What Play requires from 31 October 2026. */
const MINIMUM = [8, 0, 0];

const OUT = 'android/app/build/outputs';

function newestBundle(dir) {
  let best = null;
  const walk = (d) => {
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      const st = statSync(p);
      if (st.isDirectory()) walk(p);
      else if (/\.(aab|apk)$/.test(name) && (!best || st.mtimeMs > best.mtime)) best = { p, mtime: st.mtimeMs };
    }
  };
  try { walk(dir); } catch { return null; }
  return best;
}

const found = newestBundle(OUT);
if (!found) {
  console.log(`No .aab or .apk under ${OUT}.`);
  console.log('Build one first:  cd android && ./gradlew bundleRelease');
  process.exit(1);
}

// `unzip -p` rather than a zip library: an AAB is a zip, the file is one
// entry, and this keeps the script dependency-free.
let props;
try {
  props = execFileSync('unzip', ['-p', found.p, 'base/root/billing.properties'], { encoding: 'utf8' });
} catch {
  try {
    props = execFileSync('unzip', ['-p', found.p, 'root/billing.properties'], { encoding: 'utf8' });
  } catch {
    console.log(`FAIL — ${found.p} carries no billing.properties.`);
    console.log('Either the billing library is not in the build at all, or it is a version');
    console.log('old enough not to declare itself. Both are a problem for the same reason.');
    process.exit(1);
  }
}

const m = /(?:^|\n)\s*billing_client\s*=\s*([0-9]+(?:\.[0-9]+)*)/.exec(props)
  ?? /(?:^|\n)\s*version\s*=\s*([0-9]+(?:\.[0-9]+)*)/.exec(props);
if (!m) {
  console.log(`FAIL — could not read a version out of billing.properties:\n${props}`);
  process.exit(1);
}

const version = m[1];
const parts = version.split('.').map(Number);
const ok = (() => {
  for (let i = 0; i < MINIMUM.length; i++) {
    const a = parts[i] ?? 0;
    if (a > MINIMUM[i]) return true;
    if (a < MINIMUM[i]) return false;
  }
  return true;
})();

console.log('GOOGLE PLAY BILLING LIBRARY — read from the built artefact\n');
console.log(`  artefact   ${found.p}`);
console.log(`  built      ${new Date(found.mtime).toISOString().slice(0, 16).replace('T', ' ')}`);
console.log(`  version    ${version}`);
console.log(`  required   ${MINIMUM.join('.')} or later, from 31 October 2026\n`);
console.log(ok
  ? 'PASS — this bundle may be uploaded.'
  : `FAIL — Play will reject an update built with ${version}.\n` +
    'Raise `@revenuecat/purchases-capacitor` (it is what brings the billing\n' +
    'library in), run `npm install`, rebuild, and run this again.');
process.exit(ok ? 0 : 1);
