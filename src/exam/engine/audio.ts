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
const BASE: string =
  ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_EXAM_AUDIO_BASE ?? '/audio')
    .replace(/\/+$/, '');

export function resolveAudio(audioPath: string | undefined): string | undefined {
  if (!audioPath) return undefined;
  if (/^https?:\/\//i.test(audioPath)) return audioPath;
  return `${BASE}/${audioPath.replace(/^\/+/, '')}`;
}
