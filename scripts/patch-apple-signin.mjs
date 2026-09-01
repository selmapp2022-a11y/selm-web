/**
 * KEEP SIGN IN WITH APPLE BUILDABLE ON CAPACITOR 8.
 *
 * ── The failure this exists for ──────────────────────────────────────────
 * 1 September 2026, archiving 2.1.0 for the App Store. Xcode:
 *
 *   Failed to resolve dependencies. Dependencies could not be resolved
 *   because 'apple-sign-in' depends on 'capacitor-swift-pm' 7.0.0..<8.0.0
 *   and 'purchases-capacitor' depends on 'capacitor-swift-pm' 8.x
 *
 * `@capacitor-community/apple-sign-in` declares
 * `.package(url: capacitor-swift-pm, from: "7.0.0")`, and SPM reads a bare
 * `from:` as **>= 7.0.0 and < 8.0.0**. This app is on Capacitor 8.3.3, so the
 * package graph has no solution and the whole CapApp-SPM product disappears —
 * which surfaces as the far less helpful "Missing package product
 * 'CapApp-SPM'".
 *
 * 7.1.0 is the newest release on npm; there is no Capacitor 8 build of this
 * plugin. Its Swift source compiles against Capacitor 8 unchanged — only the
 * declared range is wrong — so the range is widened here.
 *
 * ── Why a postinstall script and not an edit ─────────────────────────────
 * The file lives in `node_modules`, which is not committed. Any `npm install`
 * or `npm ci` would silently restore the broken range and the next person to
 * archive would lose an evening to a package-resolution error that says
 * nothing about Sign in with Apple. This runs on every install instead.
 *
 * **Delete this script the day the plugin ships a Capacitor 8 release.**
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const FILE = 'node_modules/@capacitor-community/apple-sign-in/Package.swift';
const BROKEN = '.package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "7.0.0")';
const FIXED = '.package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", "7.0.0"..<"9.0.0")';

if (!existsSync(FILE)) {
  // Not installed (CI job that skips optional deps, or the plugin was removed).
  process.exit(0);
}

const src = readFileSync(FILE, 'utf8');

if (src.includes(FIXED)) {
  console.log('apple-sign-in: capacitor-swift-pm range already widened.');
  process.exit(0);
}

if (!src.includes(BROKEN)) {
  // The upstream manifest changed. Do not guess — say so and let a human look,
  // because a silent no-op here reappears as an unexplained Xcode error later.
  console.warn(
    'apple-sign-in: expected dependency line not found. The plugin may have ' +
      'been updated — check whether this patch is still needed, and delete ' +
      'scripts/patch-apple-signin.mjs if it is not.'
  );
  process.exit(0);
}

writeFileSync(FILE, src.replace(BROKEN, FIXED));
console.log('apple-sign-in: widened capacitor-swift-pm to 7.0.0..<9.0.0 for Capacitor 8.');
