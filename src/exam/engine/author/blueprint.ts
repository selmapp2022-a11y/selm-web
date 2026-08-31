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
type Range = { min: number; max: number };
type Format = { words: Record<Band, Range>; questions: Record<Band, Range>; source: string };

const IELTS_READING_WORDS: Record<Band, Range> = {
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
const IELTS_READING_QUESTIONS: Record<Band, Range> = {
  A1: { min: 2, max: 4 },
  A2: { min: 2, max: 5 },
  B1: { min: 3, max: 6 },
  B2: { min: 4, max: 8 },
  C1: { min: 4, max: 9 },
  C2: { min: 4, max: 8 },
};

const flat = (r: Range): Record<Band, Range> =>
  ({ A1: r, A2: r, B1: r, B2: r, C1: r, C2: r });

const scaled = (mins: number[], maxs: number[]): Record<Band, Range> =>
  Object.fromEntries(BANDS.map((b, i) => [b, { min: mins[i], max: maxs[i] }])) as Record<Band, Range>;

/**
 * ONE FORMAT PER EXAM AND SKILL, because they are not one format.
 *
 * The first version of this file had a single table and applied it to
 * everything, and the check found it within the hour by running the gate over
 * the banks that already exist. IELTS listening came back with every part
 * "too long" and "too many questions" — a Part IS four hundred to nine hundred
 * words and DOES carry exactly ten questions, and the numbers it was being
 * measured against were the ones for a General Training reading passage.
 *
 * That is not a near miss. A gate calibrated for one skill and applied to
 * another rejects correct material and, worse, would have accepted a TCF
 * listening recording ten times longer than the épreuve sets.
 *
 * So each row below is a fact about a published format, with the source
 * beside it. The CEFR split within a row remains ours, as it is everywhere
 * else in this product: the awarding bodies band by section or by nothing.
 */
const FORMATS: Record<string, Format> = {
  'ielts-gt:reading': {
    words: IELTS_READING_WORDS,
    questions: IELTS_READING_QUESTIONS,
    source: 'ielts.org — GT Reading: three sections rising in difficulty, 40 questions in 60 minutes.',
  },
  'ielts-gt:listening': {
    // Four parts, TEN questions each, about thirty minutes of recording. The
    // question count is not a range: it is the paper.
    words: scaled([300, 320, 350, 400, 450, 500], [700, 750, 800, 850, 900, 1000]),
    questions: flat({ min: 10, max: 10 }),
    source: 'ielts.org — Listening: 4 parts, 40 questions, 10 per part, about 30 minutes.',
  },
  'tcf-canada:listening': {
    // DERIVED FROM THE ÉPREUVE'S OWN CLOCK, not from the bank and not by eye.
    //
    // Thirty-nine questions in thirty-five minutes is 2,100 seconds over 39
    // items — about 54 seconds each. Of that, the question read aloud, the
    // pause for the answer and the gap between items take roughly 28, which
    // leaves about 26 seconds of recording. French read speech runs 140 to 160
    // words a minute, so 26 seconds is 60 to 70 words AT THE TOP OF THE
    // LADDER, and much less at the bottom, where a document is one sentence.
    //
    // The first version of this row was guessed and put the B2 floor at 50 and
    // the C1 floor at 70; the check then reported 24 of the 39 recordings as
    // too short. Two of those were genuinely thin and the rest were the
    // guess being wrong — 39 recordings running 8:44 in a 35-minute épreuve is
    // close to what the clock allows, not far below it.
    //
    // The ceilings are per item and deliberately above the average: an exposé
    // may run long when its question is quick. What no row may do is exceed
    // the clock at every band at once, which is what a table built from a
    // reading paper would have done.
    words: scaled([4, 10, 20, 30, 40, 45], [25, 50, 90, 120, 150, 180]),
    questions: flat({ min: 1, max: 2 }),
    source: 'France Éducation international — TCF Canada, compréhension orale : 39 questions, 35 minutes.',
  },
  'tcf-canada:reading': {
    // Thirty-nine questions in sixty minutes over short independent documents:
    // notices and instructions at the bottom, argued texts at the top.
    //
    // The A1 and A2 floors were 12 and 20 and came down to 5 and 15 after the
    // check reported four A1 consignes as too short. They are six to nine
    // words — « Défense de fumer », a lift sign, a ticket-machine instruction —
    // and that is what the épreuve sets at the bottom of the ladder. **Length
    // there is fixed by the genre, not by the band**: a notice is short
    // because notices are short, and a floor that forced a twelve-word sign
    // would have made the bank less like the exam rather than more.
    //
    // This is the opposite decision from the IELTS reading floors, which were
    // RAISED against a bank that failed them. The difference is which one is
    // the placeholder: the six IELTS passages were stubs standing in for a
    // paper that runs to thousands of words; a four-word French sign is the
    // real thing.
    words: scaled([5, 15, 40, 60, 90, 110], [60, 100, 180, 280, 400, 500]),
    // ONE QUESTION PER DOCUMENT, and that is the épreuve rather than a
    // preference. The range was 1 to 3 for about an hour, four documents were
    // authored against it carrying two questions each, and the inventory
    // immediately reported the section as SERVING 42 QUESTIONS WHERE THE
    // ÉPREUVE SETS 39.
    //
    // `tcf-canada.ts` already carries a comment about the same failure in an
    // earlier form — *"growing the bank to 57 silently made the épreuve 57
    // questions long"* — which was fixed by pinning `serve.count` to 39. A
    // range here reopened it from the other end: the count of documents was
    // right and the count of questions was not.
    //
    // All 57 documents of the reviewed French bank carry exactly one question.
    // The range was mine and unsupported; this is the bank's own shape.
    questions: flat({ min: 1, max: 1 }),
    source: 'France Éducation international — TCF Canada, compréhension écrite : 39 questions, 60 minutes.',
  },
};

/** The format for a section, or the IELTS reading one as the documented default. */
export function formatFor(examId: string, skill: string): Format {
  return (
    FORMATS[`${examId}:${skill}`] ?? {
      words: IELTS_READING_WORDS,
      questions: IELTS_READING_QUESTIONS,
      source: 'no published format declared for this exam and skill — IELTS GT Reading used as a stand-in',
    }
  );
}

/** The kinds a section already uses, so authoring cannot invent a format. */
export function kindsOf(section: ComprehensionSection): Array<'choice' | 'completion' | 'matching'> {
  const seen = new Set<'choice' | 'completion' | 'matching'>();
  for (const i of section.items) seen.add((i.kind ?? 'choice') as 'choice' | 'completion' | 'matching');
  // An EMPTY section holds no kinds, and read literally that forbids every
  // kind — so the first batch into a new section was refused as
  // `item.kind-not-in-section` for all four of its questions, by a rule whose
  // purpose is to stop a batch introducing a format the section does not use.
  // A section with nothing in it does not yet use any format. `choice` is the
  // model's own default for an item that declares no kind, so it is what an
  // empty section starts from; the moment the section holds anything, this
  // line stops applying and the rule is as strict as before.
  return seen.size ? [...seen] : ['choice'];
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
  const format = formatFor(exam.id, section.skill);
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
        words: format.words[level],
        questions: format.questions[level],
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
