/**
 * What an item at one coordinate must be — read from the exam, not written here.
 *
 * A blueprint is the shape the authoring instructions are built from and the
 * shape the gate measures against. Both read the SAME object, which is the
 * point: an authoring prompt that drifts from the gate produces a batch that
 * is rejected wholesale, and an authoring prompt that the gate was loosened to
 * accommodate produces a bank nobody can vouch for.
 *
 * Almost everything here comes off the section definition. What does not — the
 * word bands per CEFR level — is declared once, below, with its reasoning,
 * because the awarding bodies publish passage lengths for the WHOLE section
 * and not per band. That number is ours and is labelled ours, the same way the
 * A1-to-C2 banding of the TCF bank is.
 */
import type { ComprehensionSection, ExamDefinition } from '../../model/types';
import { BANDS, type Band } from './types';

export type Blueprint = {
  examId: string;
  sectionId: string;
  skill: 'reading' | 'listening';
  family: string;
  familyDescribes: string;
  level: Band;
  /** Words the passage must fall within. Ours, and stated as ours. */
  words: { min: number; max: number };
  /** How many questions this passage should carry. */
  questions: { min: number; max: number };
  /** The item kinds this section actually supports, from what it already holds. */
  kinds: Array<'choice' | 'completion' | 'matching'>;
  /**
   * How many QUESTIONS already sit at this coordinate — not passages.
   *
   * The unit has to be the one the cap is expressed in and the one the
   * inventory prints, or the two disagree while both look right. That already
   * happened once: the first inventory printed IELTS listening as "40 exists,
   * 4 reachable", one counting questions and the other recordings. Both
   * numbers were correct and the row was nonsense.
   */
  have: number;
  /** The cap for this coordinate — §B.1, about 100 per skill spread over it. */
  want: number;
};

/**
 * Passage length per band. **Ours, and derived from the published format —
 * NOT from what the bank happens to hold.**
 *
 * The first version of this table was written by eye and the check caught it
 * within the hour, which is the note worth keeping. §5 of `author.check.ts`
 * asserts that the gate does not reject the passages already in the bank, and
 * four of the six came back `passage.too-short`. There were two ways out:
 *
 *  - lower the floors until the bank fits, which is setting a bar at the value
 *    the bank happens to sit on. `items.check.ts` records that being done once
 *    and having to be undone.
 *  - or look at what the exam actually sets.
 *
 * IELTS General Training Reading is three sections in sixty minutes: short
 * social texts, then workplace texts, then one long general-interest passage.
 * A GT paper runs to well over two thousand words. **The six passages in our
 * reading bank run from 16 to 45 words each.** They were placeholders — the
 * Task 3 inventory already said so, in the row reading *6 questions against a
 * published 40* — and a floor that accommodated them would have written the
 * placeholder into the specification.
 *
 * So the floors come from the paper, the bank fails them, and that failure is
 * the work: it is the difference between the exam and what we hold, made into
 * a number the gate enforces on everything authored from here.
 *
 * The band split is ours and is stated as ours: the exam bands by SECTION and
 * we band by CEFR, so A1–A2 carry the short social texts, B1–B2 the workplace
 * ones, and C1–C2 the long passage. FEI publishes less again for the TCF, and
 * the same reasoning applies to it.
 */
const WORDS: Record<Band, { min: number; max: number }> = {
  A1: { min: 25, max: 120 },
  A2: { min: 40, max: 180 },
  B1: { min: 90, max: 320 },
  B2: { min: 150, max: 450 },
  C1: { min: 250, max: 700 },
  C2: { min: 300, max: 900 },
};

/**
 * Questions per passage.
 *
 * One question per passage is what the reading bank holds today, and it is not
 * the exam: forty questions over three sections is six to fourteen per
 * passage. Authoring one question per passage would reach a hundred by writing
 * a hundred passages — more expensive, and less like the paper, which asks
 * several things about one text and expects the candidate to hold it in mind.
 *
 * The ceilings below are lower than fourteen on purpose. A passage cannot
 * carry fourteen questions that are not padding, and padding is what a bank
 * fills with when a number has to be reached.
 */
const QUESTIONS: Record<Band, { min: number; max: number }> = {
  A1: { min: 2, max: 4 },
  A2: { min: 2, max: 5 },
  B1: { min: 3, max: 6 },
  B2: { min: 4, max: 8 },
  C1: { min: 4, max: 9 },
  C2: { min: 4, max: 8 },
};

/** The kinds a section already uses, so authoring cannot invent a format. */
export function kindsOf(section: ComprehensionSection): Array<'choice' | 'completion' | 'matching'> {
  const seen = new Set<'choice' | 'completion' | 'matching'>();
  for (const i of section.items) seen.add((i.kind ?? 'choice') as 'choice' | 'completion' | 'matching');
  return [...seen];
}

/**
 * Every coordinate of one comprehension section, with what it holds and what
 * it should hold.
 *
 * `want` spreads the §B.1 cap of about 100 evenly across the coordinates the
 * planner can emit, rather than putting 100 behind one of them — which is the
 * failure mode the section is written against: *"not 100 in one coordinate and
 * none in the rest."*
 */
export function blueprintsFor(exam: ExamDefinition, section: ComprehensionSection, cap = 100): Blueprint[] {
  const fams = section.families ?? [];
  const coordinates = fams.length * BANDS.length;
  const want = Math.max(1, Math.round(cap / Math.max(1, coordinates)));
  const kinds = kindsOf(section);
  const out: Blueprint[] = [];
  for (const f of fams) {
    for (const level of BANDS) {
      const passages = section.recordings.filter((r) => r.family === f.id && r.level === level);
      const ids = new Set(passages.map((r) => r.id));
      const have = section.items.filter((i) => ids.has(i.recordingId)).length;
      out.push({
        examId: exam.id,
        sectionId: section.id,
        skill: section.skill as 'reading' | 'listening',
        family: f.id,
        familyDescribes: f.describes[exam.language] ?? f.describes.en,
        level,
        words: WORDS[level],
        questions: QUESTIONS[level],
        kinds,
        have,
        want,
      });
    }
  }
  return out;
}

/** Thinnest first, always — §B.1. Ties broken by band, easiest first. */
export function thinnestFirst(list: Blueprint[]): Blueprint[] {
  return [...list].sort((a, b) => a.have - b.have || BANDS.indexOf(a.level) - BANDS.indexOf(b.level));
}
