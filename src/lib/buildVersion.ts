/**
 * Is this tab still running the build the server is serving?
 *
 * ── The evening this became necessary ───────────────────────────────────
 *
 * On 2026-08-29 the founder reported, with screenshots, that IELTS Listening
 * said *"this skill is not built yet"* — a bank of four recordings, forty
 * questions and fourteen minutes of audio, reported as absent. It was not
 * absent. The page was open in a tab that had been left running since before
 * the listening bank existed, and a single-page application never fetches its
 * code again: navigating between Writing and Listening runs the JavaScript the
 * tab loaded on the day it was opened, however many deploys ago that was.
 *
 * The tab's own title was the proof — it read "SELM — Learn English with AI",
 * a title this application stopped serving several deploys earlier.
 *
 * Half an hour went into finding that, and the founder is the person best
 * placed to guess "stale tab". **A candidate is not.** A candidate whose tab
 * is a fortnight old practises a bank that has since grown, sees a defect that
 * was fixed a week ago, and concludes the product is broken — which, from
 * inside that tab, it is. They have no title to compare and no reason to press
 * reload.
 *
 * ── What this does, and what it deliberately does not ───────────────────
 *
 * `index.html` names the hashed bundle the server is serving right now. This
 * module remembers the one THIS tab loaded, re-reads `index.html` when the tab
 * is brought back to the front, and reports the difference. That is all.
 *
 * **It does not reload the page by itself.** A candidate is often mid-answer,
 * mid-recording, or mid-draft, and reloading under them would destroy work to
 * fix a cosmetic staleness. The notice says what is true and leaves the choice
 * where it belongs.
 *
 * It also fails silently. An offline tab cannot fetch `index.html`, and "we
 * could not check" must never be dressed up as "you are out of date".
 */

const SCRIPT = /assets\/main-[A-Za-z0-9_-]+\.js/;

/** The bundle this tab is actually running, read from its own DOM. */
export function runningBuild(): string | null {
  for (const el of Array.from(document.querySelectorAll('script[src]'))) {
    const m = SCRIPT.exec((el as HTMLScriptElement).getAttribute('src') ?? '');
    if (m) return m[0];
  }
  return null;
}

/** The bundle the server is serving now, or null if it could not be read. */
export async function servedBuild(): Promise<string | null> {
  try {
    const res = await fetch('/', { cache: 'no-store' });
    if (!res.ok) return null;
    return SCRIPT.exec(await res.text())?.[0] ?? null;
  } catch {
    return null;
  }
}

/**
 * True only when both builds are known AND they differ.
 *
 * Unknown is not stale. If the page was opened from a cache with no script
 * tag to read, or the network is down, the honest answer is "no idea", and no
 * idea must not put a banner in front of someone.
 */
export async function isStale(): Promise<boolean> {
  const mine = runningBuild();
  if (!mine) return false;
  const theirs = await servedBuild();
  if (!theirs) return false;
  return mine !== theirs;
}
