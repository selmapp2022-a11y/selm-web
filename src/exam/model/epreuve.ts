/**
 * What the candidate has already been ASKED, across sittings.
 *
 * ── The defect this exists for ──────────────────────────────────────────
 *
 * `serveEpreuve` has always obeyed §4.3 — least-recently-served among
 * unseen — but `SectionPage` called it as `serveEpreuve(section)`, with no
 * state. A fresh `ServeState` has seen nothing, so the rule resolves to the
 * bank's own order every single time: the second sitting of a 61-document
 * bank presented the same eight documents as the first, and the tenth
 * presented them again. The bank had grown; the exam had not.
 *
 * The same defect was found and fixed in practice on 29 August, where the
 * memory is the attempt log. A mock exam has no attempt log — it records a
 * `SittingRecord` with counts, not with which recordings were asked — so it
 * needs its own, and this is it.
 *
 * ── Two memories, not one ───────────────────────────────────────────────
 *
 * This is deliberately SEPARATE from the practice memory:
 *
 *   - practice serves at the candidate's band and may exhaust a coordinate;
 *   - the épreuve serves the exam's PUBLISHED band profile, which the
 *     candidate's level does not change (`serveEpreuve` takes no level, and
 *     that is not an omission — TCF CE is 1 A1 · 2 A2 · … for everyone).
 *
 * Sharing one memory would let a candidate's practice quietly drain the mock
 * exam's bank, or the reverse: they would sit a mock and find the practice
 * pool exhausted without having practised. Meeting a document in practice and
 * then meeting it in a mock is a repeat, and a real one — but it is a repeat
 * of a document the candidate chose to study, which is the ordinary condition
 * of every published past paper. The one the founder reported, and the one
 * that makes a mock worthless, is the same PAPER twice.
 *
 * ── Where the paper itself lives ────────────────────────────────────────
 *
 * Here we keep only what has been served. The recordings of a sitting IN
 * PROGRESS are recorded on the sitting (`Sitting.papers`), because a
 * candidate who reloads forty minutes in must get the same paper back, and
 * re-drawing would hand them a different exam mid-clock.
 */
import { newServeState, type ServeState } from '../engine/pool';
import { serveEpreuve } from '../engine/comprehension';
import type { ComprehensionSection, Recording } from './types';

export const EPREUVE_KEY = 'selm_exam_epreuve_memory_v1';

/** A `ServeState` in a form `JSON.stringify` keeps. Map and Set do not survive. */
type Stored = { lastServed: Record<string, number>; seen: string[]; draw: number };

const readAll = (): Record<string, Stored> => {
  try {
    const raw = localStorage.getItem(EPREUVE_KEY);
    const v = raw ? JSON.parse(raw) : {};
    return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, Stored>) : {};
  } catch {
    return {};
  }
};

/** The memory for one section. A section never met returns an empty state. */
export function loadEpreuveState(sectionId: string): ServeState {
  const row = readAll()[sectionId];
  const st = newServeState();
  if (!row) return st;
  if (row.lastServed && typeof row.lastServed === 'object') {
    for (const [id, at] of Object.entries(row.lastServed)) {
      if (typeof at === 'number') st.lastServed.set(id, at);
    }
  }
  if (Array.isArray(row.seen)) for (const id of row.seen) st.seen.add(id);
  if (typeof row.draw === 'number') st.draw = row.draw;
  return st;
}

export function saveEpreuveState(sectionId: string, st: ServeState): void {
  try {
    const all = readAll();
    all[sectionId] = {
      lastServed: Object.fromEntries(st.lastServed),
      seen: [...st.seen],
      draw: st.draw,
    };
    localStorage.setItem(EPREUVE_KEY, JSON.stringify(all));
  } catch {
    /* a memory that cannot be saved gives the candidate a repeated paper, not
       a broken one — the same failure as before this file, and no worse */
  }
}

/** Used by the settings screen's reset, and by the checks. */
export function clearEpreuveMemory(): void {
  try {
    localStorage.removeItem(EPREUVE_KEY);
  } catch {
    /* nothing to do */
  }
}

/**
 * The paper one sitting runs — restored if this sitting already has one,
 * drawn from the durable memory if it does not.
 *
 * This is the whole of the rule, in one place, so that it can be checked
 * without a browser and so that `SectionPage` cannot get half of it right.
 * `drew` tells the caller whether the ids need recording on the sitting.
 */
export function paperFor(
  section: ComprehensionSection,
  stored: readonly string[] | undefined,
): { paper: Recording[]; drew: boolean } {
  if (stored && stored.length) {
    const by = new Map(section.recordings.map((r) => [r.id, r]));
    const rs = stored.map((id) => by.get(id)).filter(Boolean) as Recording[];
    // A stored paper whose documents no longer all exist is not this exam's
    // paper any more — the bank was edited under a sitting in progress. Draw
    // a new one rather than run a short épreuve.
    if (rs.length === stored.length) return { paper: rs, drew: false };
  }
  const st = loadEpreuveState(section.id);
  const paper = serveEpreuve(section, st);
  saveEpreuveState(section.id, st);
  return { paper, drew: true };
}
