/**
 * Where a rendered item's audio is served from.
 *
 * The bank is authored once and shared by every candidate — roughly USD 0.05
 * per active user per month against about USD 12 for per-user generation, and
 * per-user generation would also make offline delivery impossible.
 *
 * The base is configurable so the same bank can move from the app bundle to
 * DigitalOcean Spaces behind the CDN by changing one environment variable,
 * without editing 39 items. It ships inside the bundle today because this
 * session had no Spaces credentials — that is a deployment decision, not a
 * product one, and nothing above this line depends on which is in use.
 */
/**
 * The audio store, as of 31 August 2026: DigitalOcean Spaces behind the CDN
 * the rest of this product already uses.
 *
 * It used to be `/audio`, inside the bundle. That was right while the bank was
 * a handful of French clips and it stopped being right the night the IELTS
 * listening bank was rendered: `public/audio` reached **59 MB**, every byte of
 * it shipped to every visitor's browser and into the Capacitor app, and the
 * Australia accent track is about to double the English half of it.
 *
 * The founder: *"now, before Australia, not after — Australia doubles it, and
 * moving 120 MB is no harder than moving 59, but doing it once is better."*
 *
 * ── Why the DEFAULT changed and not just the environment ───────────────────
 * `VITE_EXAM_AUDIO_BASE` has existed since the beginning for exactly this
 * move, and setting it in the App Platform spec would have worked. It is a
 * build-time variable, though, so the app would be one unset variable away
 * from serving 404s for every recording in the product — in a preview build,
 * in a local `npm run build`, in the mobile build, anywhere the variable was
 * not carried. **Where the bank lives is a fact about the product, not about
 * one deployment.** The variable stays, as the override it always was.
 *
 * ── The consequence, stated because it is real ─────────────────────────────
 * The bank no longer travels inside the Capacitor app, so a candidate with no
 * connection can read but not listen. That was true of nothing before tonight.
 * The files are still in the repository under `audio-src/`, so a mobile build
 * that wants them offline can copy them into `public/` at build time; nothing
 * here decides that.
 */
/**
 * ── Why this is written the long way round ────────────────────────────────
 * 2026-09-01. It used to read the variable through a cast and an optional
 * chain:
 *
 *     (import.meta as unknown as { env?: Record<string, string> })
 *       .env?.VITE_EXAM_AUDIO_BASE
 *
 * Vite substitutes `import.meta.env.VITE_NAME` **statically, as that exact
 * expression**. The cast and the `?.` defeat the match, so nothing was
 * inlined: `import.meta.env` became `{}`, the variable was never in it, and
 * the fallback always won. `npm run build:mobile` therefore produced a bundle
 * 176 MB larger that still fetched every recording over the network — the
 * worst of both — and no test caught it, because `npm run audio` asserts the
 * DEFAULT is the CDN rather than what the build actually resolved.
 *
 * The literal expression below is the fix. It changes nothing for a normal
 * build, where the variable is unset and the CDN default still wins.
 */
const ENV_BASE = import.meta.env.VITE_EXAM_AUDIO_BASE as string | undefined;

const BASE: string = (ENV_BASE || 'https://selmapp.nyc3.cdn.digitaloceanspaces.com/exam-audio')
  .replace(/\/+$/, '');

export function resolveAudio(audioPath: string | undefined): string | undefined {
  if (!audioPath) return undefined;
  if (/^https?:\/\//i.test(audioPath)) return audioPath;
  return `${BASE}/${audioPath.replace(/^\/+/, '')}`;
}
