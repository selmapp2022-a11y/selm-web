import type { AccentTrack, Recording, Rendition } from './types';
import { PRIMARY_TRACK } from './types';

/**
 * WHICH AUDIO THIS CANDIDATE HEARS. The only way to ask.
 *
 * `Recording.audioPath` is always there when anything has been rendered, and
 * that is exactly the hazard: a surface that reads it directly plays the
 * primary track's file to every candidate, correctly for two destinations out
 * of three and silently wrongly for the third. The file plays. Nothing on the
 * screen says which accent it is.
 *
 * This is the `deliverable` lesson again, and it is the third time in a week
 * that four places have answered one question with three answers. One
 * accessor, and `counts-audit`-style greps can find anyone who bypasses it.
 */
export function renditionFor(r: Recording, track: AccentTrack = PRIMARY_TRACK): Rendition | undefined {
  const alt = r.renditions?.[track];
  if (alt) return alt;
  // The primary track lives in the recording's own fields, and all three have
  // to be there: this answers "who spoke it, in what accent", and audio with
  // no recorded voice is the provenance gap the 29 August ruling closed.
  if (track === PRIMARY_TRACK && r.audioPath && r.variety && r.voice)
    return { audioPath: r.audioPath, variety: r.variety, voice: r.voice };
  return undefined;
}

/**
 * THE AUDIO, IF THERE IS ANY, FOR THIS TRACK. A different question.
 *
 * `renditionFor` asks *who spoke it and in what accent* and is strict about
 * provenance. This asks *can it be played*, which is what `deliverable` needs
 * and what an `<audio>` element needs.
 *
 * Separating them is not pedantry, and the first version of this file did not:
 * `deliverable` was routed through the strict accessor and immediately called
 * a rendered recording undeliverable because a test fixture carried audio and
 * no voice record. A recording with audio and no provenance is a **provenance
 * defect** — checked, and loudly, in `comprehension.check.ts` — and it is not
 * an unplayable file. Answering one question with the other is how a real
 * recording gets taken off the air by a missing metadata field.
 */
export function audioFor(r: Recording, track: AccentTrack = PRIMARY_TRACK): string | undefined {
  const alt = r.renditions?.[track];
  if (alt) return alt.audioPath;
  return track === PRIMARY_TRACK ? r.audioPath : undefined;
}

/** Every track this recording can actually be played in. */
export function tracksOf(r: Recording): AccentTrack[] {
  const out: AccentTrack[] = [];
  for (const t of ['canada', 'australia'] as AccentTrack[]) if (renditionFor(r, t)) out.push(t);
  return out;
}
