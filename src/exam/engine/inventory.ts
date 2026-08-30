/**
 * The content inventory. What exists, what the planner can reach, and which
 * side of the paywall it sits on.
 *
 *   npx tsx src/exam/engine/inventory.ts
 *
 * ── Why this is a program and not a table ─────────────────────────────────
 * Task 3 asks for real numbers "counted from the data at run time — not a
 * hand-written table that will go stale". A markdown table is correct for
 * about a day. This reads the definitions themselves, so the day someone
 * authors an item the figure moves without anyone remembering to move it.
 *
 * ── The three splits, and why the third one is the point ──────────────────
 *   1. EXISTS IN THE BANK — the raw count.
 *   2. REACHABLE BY THE PLANNER — a coordinate `(exam, skill, task|family,
 *      level)` the plan can actually emit, with enough behind it to serve.
 *      An item that exists and no coordinate routes to is not available to
 *      the model when it builds a study plan, and counting it is counting
 *      something the candidate will never be given.
 *   3. FREE EXAM or PAID PRACTICE — which side of the paywall it sits on.
 *
 * The third ratio is itself a finding, and it is the founder's: **if more of
 * the content sits behind the free exam than behind the paid practice, then
 * what is sold is thinner than what is given away.** That is a business fact
 * that no amount of authoring enthusiasm will surface on its own, and it is
 * the same shape as the finding of 29 August about IELTS — the app said a
 * skill was not built while another page rendered it.
 *
 * ── What counts as which side ─────────────────────────────────────────────
 * The free exam is the SITTING: the recordings and questions a mock exam
 * serves, and the production tasks it sets. The paid practice is what teaches
 * — the prescription cells and the practice items they prescribe. Material
 * used by both is reported as SHARED rather than claimed by either, because
 * claiming it for the paid side is exactly the flattery this report exists to
 * refuse.
 */
import { EXAMS } from '../definitions';
import { CATALOGUE } from '../definitions/prescriptions';
import { coordinatesFor, MIN_ITEMS_PER_COORDINATE } from './planner';
import { isChoiceItem, isCompletionItem, isMatchingItem } from '../model/types';
import type { ComprehensionSection, ExamDefinition, ProductionSection, SkillId } from '../model/types';

const CEFR = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

/** Bytes per second of the MP3s this product renders: 128 kbps, mono. */
const BYTES_PER_SECOND = 16_000;

const pad = (s: string | number, n: number) => String(s).padEnd(n);
const rpad = (s: string | number, n: number) => String(s).padStart(n);
const mmss = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, '0')}`;

export type SkillRow = {
  exam: string;
  language: string;
  skill: SkillId;
  sectionId: string;
  /** What the awarding body sets in one real sitting. */
  sets: number | null;
  setsUnit: 'questions' | 'tasks' | null;
  setsSource: string;
  /** What one sitting of OUR exam presents. */
  serves: number;
  /** Everything in the bank behind this skill. */
  existsItems: number;
  existsRecordings: number;
  byLevel: Record<string, number>;
  byGroup: Record<string, number>;
  byKind: Record<string, number>;
  audio: { files: number; seconds: number; varieties: string[] };
  cells: number;
  /** Coordinates the planner can emit, and how many of them are servable. */
  coordinates: number;
  coordinatesWithAnything: number;
  coordinatesServable: number;
  emptyCoordinates: string[];
  thinCoordinates: string[];
  /**
   * Items — questions for a counted skill, tasks for a produced one —
   * behind a coordinate the planner can emit at all, and behind one that
   * also holds the minimum a slot needs.
   *
   * Counted in the SAME UNIT as `existsItems` on purpose. The first version
   * of this table reported 40 questions existing and 4 reachable, because
   * "reachable" was counting recordings and "exists" was counting questions.
   * Both numbers were right and the row was nonsense.
   */
  reachableItems: number;
  servableItems: number;
  /** Which side of the paywall. */
  freeExamItems: number;
  paidPracticeItems: number;
};

function audioSeconds(bytes: number) {
  return bytes / BYTES_PER_SECOND;
}

export function inventory(sizeOf: (audioPath: string) => number = () => 0): SkillRow[] {
  const rows: SkillRow[] = [];

  for (const exam of EXAMS) {
    const coords = coordinatesFor(exam);
    for (const award of exam.awards) {
      const skill = award.skill;
      const section = exam.sections.find((s) => s.skill === skill) ?? null;
      const list = coords.get(skill) ?? [];

      const row: SkillRow = {
        exam: exam.id,
        language: exam.language,
        skill,
        sectionId: section?.id ?? '—',
        sets: null,
        setsUnit: null,
        setsSource: '',
        serves: 0,
        existsItems: 0,
        existsRecordings: 0,
        byLevel: {},
        byGroup: {},
        byKind: {},
        audio: { files: 0, seconds: 0, varieties: [] },
        cells: CATALOGUE.filter((c) => c.cell.at.examId === exam.id
          && exam.sections.some((s) => s.kind === 'production' && s.skill === skill
            && s.tasks.some((t) => t.id === c.cell.at.taskId))).length,
        coordinates: list.length,
        coordinatesWithAnything: list.filter((c) => c.items > 0).length,
        coordinatesServable: list.filter((c) => c.items >= MIN_ITEMS_PER_COORDINATE).length,
        emptyCoordinates: list.filter((c) => c.items === 0).map((c) => c.coordinate.label),
        thinCoordinates: list
          .filter((c) => c.items > 0 && c.items < MIN_ITEMS_PER_COORDINATE)
          .map((c) => `${c.coordinate.label} (${c.items})`),
        reachableItems: 0,
        servableItems: 0,
        freeExamItems: 0,
        paidPracticeItems: 0,
      };

      if (section?.kind === 'comprehension') {
        const c = section as ComprehensionSection;
        row.sets = c.sets.questions ?? null;
        row.setsUnit = 'questions';
        row.setsSource = c.sets.source;
        // QUESTIONS, not recordings, and the difference stopped being
        // invisible on 2026-08-29. `serve.count` is how many RECORDINGS a
        // sitting presents; when every recording carried exactly one question
        // the two numbers were the same, and the row was right by accident.
        // The first Task 4 batch put four to six questions behind each IELTS
        // reading passage, and the row went on reporting 6 against an `exists`
        // of 28 — a sitting that presents 28 questions described as presenting
        // 6, next to a `gap` computed from it.
        //
        // Counted the same way `exists` is, which is the rule this file has
        // already had to learn once: *"Both are questions now."*
        if (c.serve) {
          const perBand = new Map<string, number[]>();
          for (const r of c.recordings) {
            const n = c.items.filter((i) => i.recordingId === r.id).length;
            const list = perBand.get(r.level) ?? [];
            list.push(n);
            perBand.set(r.level, list);
          }
          let served = 0;
          for (const [band, want] of Object.entries(c.serve.byBand ?? {})) {
            // The most questions that band could present, taken largest-first:
            // the serve rule picks least-recently-served among unseen, so any
            // subset is possible and the row should not understate what a
            // sitting can carry.
            const counts = (perBand.get(band) ?? []).sort((x, y) => y - x);
            served += counts.slice(0, want as number).reduce((a, b) => a + b, 0);
          }
          row.serves = served;
        } else {
          row.serves = c.items.length;
        }
        row.existsItems = c.items.length;
        row.existsRecordings = c.recordings.length;
        for (const r of c.recordings) {
          row.byLevel[r.level] = (row.byLevel[r.level] ?? 0) + 1;
          const g = r.family ?? '(no family — invisible to the planner)';
          row.byGroup[g] = (row.byGroup[g] ?? 0) + 1;
          if (r.audioPath) {
            row.audio.files += 1;
            row.audio.seconds += audioSeconds(sizeOf(r.audioPath));
            if (r.variety && !row.audio.varieties.includes(r.variety)) row.audio.varieties.push(r.variety);
          }
        }
        for (const i of c.items) {
          const k = isCompletionItem(i) ? 'completion' : isMatchingItem(i) ? 'matching' : isChoiceItem(i) ? 'choice' : 'other';
          row.byKind[k] = (row.byKind[k] ?? 0) + 1;
        }
        // Reachability, in questions. A recording with no family is invisible
        // to the planner, and so are the questions asked about it.
        const perCoord = new Map<string, { recordings: number; questions: number }>();
        for (const r of c.recordings) {
          if (!r.family) continue;
          const k = `${r.family} · ${r.level}`;
          const e = perCoord.get(k) ?? { recordings: 0, questions: 0 };
          e.recordings += 1;
          e.questions += c.items.filter((i) => i.recordingId === r.id).length;
          perCoord.set(k, e);
        }
        for (const [, e] of perCoord) {
          row.reachableItems += e.questions;
          if (e.recordings >= MIN_ITEMS_PER_COORDINATE) row.servableItems += e.questions;
        }
        // A comprehension bank is served by the mock exam AND by practice, so
        // it is shared rather than owned by either side. It is counted on the
        // free side because the free exam is the thing that could not run
        // without it.
        row.freeExamItems = c.items.length;
      } else if (section?.kind === 'production') {
        const p = section as ProductionSection;
        row.sets = p.sets.tasks ?? null;
        row.setsUnit = 'tasks';
        row.setsSource = p.sets.source;
        row.serves = p.tasks.length;
        row.existsItems = p.tasks.length;
        for (const t of p.tasks) row.byGroup[t.id] = 1;
        row.reachableItems = list.filter((x) => x.coordinate.kind === 'task' && x.items > 0).length;
        row.servableItems = list.filter((x) => x.coordinate.kind === 'task' && x.items >= MIN_ITEMS_PER_COORDINATE).length;
        row.freeExamItems = p.tasks.length;
      }

      // The paid side: prescription practice items. These are remediation —
      // offered after a weak performance — and are not part of a sitting.
      const mine = CATALOGUE.filter((c) => c.cell.at.examId === exam.id
        && exam.sections.some((s) => s.kind === 'production' && s.skill === skill
          && s.tasks.some((t) => t.id === c.cell.at.taskId)));
      row.paidPracticeItems = mine.reduce((n, c) => n + c.cell.practiceItemIds.length, 0);
      for (const c of mine) {
        const lvl = `NCLC ${c.cell.at.level}`;
        row.byLevel[lvl] = (row.byLevel[lvl] ?? 0) + c.cell.practiceItemIds.length;
      }

      rows.push(row);
    }
  }
  return rows;
}

/** The plain-language answer Task 3 asks for, in one paragraph per exam. */
export function hoursOfWork(rows: SkillRow[], exam: ExamDefinition): string {
  const mine = rows.filter((r) => r.exam === exam.id);
  const audioSec = mine.reduce((n, r) => n + r.audio.seconds, 0);
  const items = mine.reduce((n, r) => n + r.existsItems, 0);
  const tasks = mine.filter((r) => r.setsUnit === 'tasks').reduce((n, r) => n + r.existsItems, 0);
  const practice = mine.reduce((n, r) => n + r.paidPracticeItems, 0);
  // A counted question takes roughly a minute including reading the material
  // it belongs to; a production task takes its published time. Both are
  // estimates and are labelled as such — the item COUNTS above are exact.
  const minutes = Math.round(items * 1 + tasks * 20 + practice * 5 + audioSec / 60);
  return `${exam.id}: ${items} items and ${practice} prescription practice items behind ${mine.length} skills, `
    + `with ${mmss(audioSec)} of audio. At roughly a minute per counted question, twenty minutes per production task `
    + `and five per prescription item, that is about ${Math.floor(minutes / 60)}h ${minutes % 60}m of non-repeating work `
    + `— an ESTIMATE built on exact counts, not a measurement.`;
}

export function report(sizeOf: (audioPath: string) => number): string {
  const rows = inventory(sizeOf);
  const out: string[] = [];
  const w = (s = '') => out.push(s);

  w('\n════════════════════════════════════════════════════════════════════════════════');
  w('  SELM CONTENT INVENTORY — counted from the definitions, at run time');
  w('════════════════════════════════════════════════════════════════════════════════');

  for (const exam of EXAMS) {
    const mine = rows.filter((r) => r.exam === exam.id);
    w(`\n\n■ ${exam.id.toUpperCase()}  (${exam.language})\n`);
    w(`  ${pad('skill', 11)}${pad('section', 22)}${rpad('sets', 6)}${rpad('serves', 8)}${rpad('exists', 8)}${rpad('gap', 8)}`);
    w(`  ${'─'.repeat(63)}`);
    for (const r of mine) {
      const gap = r.sets === null ? '—' : String(Math.max(0, r.sets - r.serves));
      w(`  ${pad(r.skill, 11)}${pad(r.sectionId, 22)}${rpad(r.sets ?? '—', 6)}${rpad(r.serves, 8)}${rpad(r.existsItems, 8)}${rpad(gap, 8)}`);
    }
    w(`\n  "sets" is what the awarding body publishes. "serves" is what one sitting of`);
    w(`  ours presents. "exists" is the whole bank. The gap is sets − serves: the`);
    w(`  questions a candidate would meet on the day that this product cannot yet set.`);

    for (const r of mine) {
      w(`\n  ── ${r.skill} · ${r.sectionId} ${'─'.repeat(Math.max(0, 58 - r.skill.length - r.sectionId.length))}`);
      w(`     published:  ${r.setsSource}`);
      if (r.existsRecordings) {
        w(`     material:   ${r.existsRecordings} recordings, ${r.existsItems} questions`);
        w(`     by level:   ${CEFR.map((l) => `${l} ${r.byLevel[l] ?? 0}`).join('  ')}`);
        w(`     by kind:    ${Object.entries(r.byKind).map(([k, n]) => `${k} ${n}`).join('  ') || '—'}`);
        w(`     audio:      ${r.audio.files} files, ${mmss(r.audio.seconds)}, ${r.audio.varieties.length} varieties`
          + `${r.audio.varieties.length ? ` (${r.audio.varieties.join(', ')})` : ''}`);
      } else {
        w(`     material:   ${r.existsItems} tasks`);
      }
      w(`     by group:   ${Object.entries(r.byGroup).map(([k, n]) => `${k} ${n}`).join('  ') || '—'}`);
      w(`     cells:      ${r.cells} prescription cell(s), ${r.paidPracticeItems} practice item(s)`);
      w(`     PLANNER:    ${r.coordinates} coordinates · ${r.coordinatesWithAnything} with anything behind them `
        + `· ${r.coordinatesServable} with the ${MIN_ITEMS_PER_COORDINATE} a slot needs`);
      if (r.thinCoordinates.length) {
        w(`     thin:       ${r.thinCoordinates.length} coordinate(s) under ${MIN_ITEMS_PER_COORDINATE}`);
        w(`                 ${r.thinCoordinates.join(', ')}`);
      }
      if (r.emptyCoordinates.length) {
        w(`     EMPTY:      ${r.emptyCoordinates.length} coordinate(s) the planner can emit with NOTHING behind them`);
        for (let i = 0; i < r.emptyCoordinates.length; i += 4) {
          w(`                 ${r.emptyCoordinates.slice(i, i + 4).join(', ')}`);
        }
      }
    }
  }

  // ── The three splits, side by side ───────────────────────────────────────
  w('\n\n════════════════════════════════════════════════════════════════════════════════');
  w('  THE THREE SPLITS');
  w('════════════════════════════════════════════════════════════════════════════════\n');
  w(`  ${pad('exam · skill', 26)}${rpad('exists', 8)}${rpad('reachable', 11)}${rpad('servable', 10)}${rpad('free', 7)}${rpad('paid', 7)}`);
  w(`  ${'─'.repeat(69)}`);
  let exists = 0, reach = 0, serv = 0, free = 0, paid = 0;
  for (const r of rows) {
    exists += r.existsItems; reach += r.reachableItems; serv += r.servableItems;
    free += r.freeExamItems; paid += r.paidPracticeItems;
    w(`  ${pad(`${r.exam} · ${r.skill}`, 26)}${rpad(r.existsItems, 8)}${rpad(r.reachableItems, 11)}${rpad(r.servableItems, 10)}${rpad(r.freeExamItems, 7)}${rpad(r.paidPracticeItems, 7)}`);
  }
  w(`  ${'─'.repeat(69)}`);
  w(`  ${pad('TOTAL', 26)}${rpad(exists, 8)}${rpad(reach, 11)}${rpad(serv, 10)}${rpad(free, 7)}${rpad(paid, 7)}`);
  w('');
  w('  exists     — in the bank.');
  w('  reachable  — behind a coordinate the plan can emit at all.');
  w('  servable   — coordinates that also hold the minimum a slot needs; below');
  w(`               that, the candidate meets the same material every time.`);

  w('');
  w(`  FREE EXAM ${free}   ·   PAID PRACTICE ${paid}`);
  const ratio = paid === 0 ? Infinity : free / paid;
  if (paid === 0) {
    w('  ⚠ NOTHING sits behind the paid side that is not also in the free exam.');
  } else if (ratio > 1) {
    w(`  ⚠ The free exam carries ${ratio.toFixed(1)}× what the paid practice carries.`);
  }
  w('    The exam measures and the practice teaches, so these are not the same');
  w('    kind of thing — but a candidate who has finished the free exam and finds');
  w('    the paid side thinner has been sold the smaller half. That is the ratio');
  w('    to watch, and it is why it is printed rather than left to be noticed.');

  w('\n\n════════════════════════════════════════════════════════════════════════════════');
  w('  HOURS OF NON-REPEATING WORK');
  w('════════════════════════════════════════════════════════════════════════════════\n');
  for (const exam of EXAMS) w(`  ${hoursOfWork(rows, exam)}\n`);

  return out.join('\n');
}
