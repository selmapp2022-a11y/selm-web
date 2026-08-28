/**
 * The planner — THE PLAN §4.5.
 *
 * > *"Not 'what level is this candidate.' It is: given this exam, these six
 * > tâches, this exam date, and these marks if any — what order, how much of
 * > each, and which prescription attached where."*
 *
 * Three rules it exists to enforce, and each of them is a line of the plan:
 *
 *  - **Ordered by distance-to-target per skill**, because the governing level
 *    is the lowest of the four. *"A candidate at 8, 8, 8, 5 gains nothing from
 *    more work on the eights."*
 *  - **With no marks, the exam's own order.** §5 of the Part 3 replacement
 *    never said what orders a plan when there is no attestation, and §1.3
 *    made the diagnostic optional, so a candidate can arrive with nothing.
 *    The answer was already in §2 — *"from the first tâche to the last, in the
 *    order the real exam presents them"* — and it is written down here.
 *  - **A coordinate with no items is a visible gap.** Amendment 1 §6: never a
 *    substituted generic lesson. The slot is emitted with `items: 0` and the
 *    caller must show it, because that emptiness is also the signal for which
 *    content to build next.
 *
 * Nothing here calls a model or a network. A plan is arithmetic over the exam
 * definition, the attestation and the catalogue.
 */
import type { ExamDefinition, SkillId, TaskDefinition } from '../model/types';
import type { Attestation } from '../model/attestation';
import { entriesFor } from '../definitions/prescriptions';

export type Coordinate =
  | { kind: 'task'; skill: SkillId; taskId: string; label: string }
  | { kind: 'family'; skill: SkillId; family: string; level: string; label: string };

export type Slot = {
  /** 1-based position in the plan. */
  n: number;
  coordinate: Coordinate;
  /**
   * How far this skill is from the target, in benchmark levels. Null when no
   * attestation exists — the plan is then in exam order and the gap is
   * genuinely unknown rather than zero.
   */
  gap: number | null;
  /** How many practice items actually exist behind this coordinate. */
  items: number;
  /** The prescription attached here, if a cell has been written for it. */
  prescription: string | null;
};

export type Plan = {
  examId: string;
  /** Ordered worst-first when marks exist; exam order when they do not. */
  slots: Slot[];
  /** Skills, ordered by distance to target. Empty without an attestation. */
  order: Array<{ skill: SkillId; awarded: number; target: number; gap: number }>;
  /** Slots whose coordinate holds fewer than this many items. §6 calls zero a bug. */
  thin: Slot[];
  daysLeft: number | null;
  basis: 'attestation' | 'exam-order';
};

/** §6's row: every coordinate the planner can emit needs at least this many. */
export const MIN_ITEMS_PER_COORDINATE = 4;

const CEFR = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

/**
 * Where a benchmark level sits on the CEFR ladder the items are banded to.
 *
 * Taken from the exam's own `benchmark.bands`, which carry a `cefr` field
 * for exactly this — *"the only bridge between a corpus labelled in CEFR and
 * a benchmark expressed in NCLC or CLB"*. A band printed as `C1-C2` resolves
 * to its first level; guessing between them would be inventing.
 */
function cefrIndexFor(exam: ExamDefinition, level: number): number {
  const band = exam.benchmark.bands.find((b) => b.level === level);
  const tag = band?.cefr?.split('-')[0];
  const i = tag ? CEFR.indexOf(tag) : -1;
  return i >= 0 ? i : 2;
}

function tasksOf(exam: ExamDefinition, skill: SkillId): TaskDefinition[] {
  const out: TaskDefinition[] = [];
  for (const s of exam.sections) if (s.kind === 'production' && s.skill === skill) out.push(...s.tasks);
  return out;
}

function familiesOf(exam: ExamDefinition, skill: SkillId): Array<{ family: string; level: string; items: number }> {
  const out: Array<{ family: string; level: string; items: number }> = [];
  for (const s of exam.sections) {
    if (s.kind !== 'comprehension' || s.skill !== skill) continue;
    const counts = new Map<string, number>();
    for (const it of s.items) {
      if (!it.family) continue;
      const k = `${it.family}|${it.level}`;
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    for (const f of s.families ?? [])
      for (const level of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
        out.push({ family: f.id, level, items: counts.get(`${f.id}|${level}`) ?? 0 });
  }
  return out;
}

/**
 * How many practice items sit behind a production tâche.
 *
 * **Zero today for every one of them, and that is not a bug in this
 * function.** The practice bank built so far is one cell — TCF · expression
 * écrite · tâche 3 · NCLC 6, eight items — and the planner is supposed to say
 * so rather than imply otherwise.
 */
function itemsForTask(examId: string, taskId: string): number {
  const entries = entriesFor(examId, taskId);
  return entries.reduce((n, e) => n + e.cell.practiceItemIds.length, 0);
}

export type PlannerInput = {
  exam: ExamDefinition;
  /** The most recent attestation for this exam, if any. */
  attestation: Attestation | null;
  /** Required benchmark level, from the candidate's goal. */
  target: number;
  /** Days until the sitting, or null when no date is set. */
  daysLeft: number | null;
  /** How many slots the plan should hold. §4.1: roughly 30 over six weeks. */
  slots?: number;
};

/** The candidate's CEFR index for one skill, or null when unknown. */
function attestationLevel(exam: ExamDefinition, a: Attestation | null, skill: SkillId): number | null {
  if (!a) return null;
  const lvl = (a.benchmark as unknown as Record<string, number>)[skill];
  if (typeof lvl !== 'number' || !Number.isFinite(lvl)) return null;
  return cefrIndexFor(exam, lvl);
}

export function buildPlan(input: PlannerInput): Plan {
  const { exam, attestation, target, daysLeft } = input;
  const want = input.slots ?? 30;

  // Every coordinate this exam can emit, grouped by skill.
  const perSkill = new Map<SkillId, Array<{ coordinate: Coordinate; items: number }>>();
  for (const a of exam.awards) {
    const list: Array<{ coordinate: Coordinate; items: number }> = [];
    for (const t of tasksOf(exam, a.skill))
      list.push({
        coordinate: { kind: 'task', skill: a.skill, taskId: t.id, label: t.name[exam.language] },
        items: itemsForTask(exam.id, t.id),
      });
    // Comprehension coordinates are ordered by DISTANCE FROM THE CANDIDATE,
    // not by the ladder.
    //
    // Found by running the planner: a candidate at NCLC 5 was being handed
    // `annonce · A1` and `annonce · C2` in the same twelve slots. Both are
    // real coordinates and both are useless to them — one is years behind,
    // the other years ahead, and the plan has six weeks. §4.5 sizes a plan
    // to the days remaining; spending them on levels the candidate is not
    // at is the same waste as teaching a level the exam does not test.
    //
    // Without an attestation there is no candidate level, so the ladder's
    // own order stands and the material adapts silently from performance
    // instead — Part 3 §3.
    const here = attestationLevel(exam, attestation, a.skill);
    const fams = familiesOf(exam, a.skill).map((f) => ({
      ...f,
      distance: here === null ? CEFR.indexOf(f.level) : Math.abs(CEFR.indexOf(f.level) - here),
    }));
    fams.sort((x, y) => x.distance - y.distance || y.items - x.items);
    for (const f of fams)
      list.push({
        coordinate: { kind: 'family', skill: a.skill, family: f.family, level: f.level, label: `${f.family} · ${f.level}` },
        items: f.items,
      });
    if (list.length) perSkill.set(a.skill, list);
  }

  // Skill order. With marks, worst-first by distance to target — the
  // governing level is the lowest of the four, so the eights wait.
  let order: Plan['order'] = [];
  let basis: Plan['basis'] = 'exam-order';
  if (attestation) {
    basis = 'attestation';
    order = exam.awards
      .map((a) => {
        const awarded = (attestation.benchmark as unknown as Record<string, number>)[a.skill] ?? 0;
        return { skill: a.skill, awarded, target, gap: target - awarded };
      })
      .sort((x, y) => y.gap - x.gap);
  }

  const skillSequence: SkillId[] = attestation
    ? order.map((o) => o.skill)
    : exam.awards.map((a) => a.skill);

  // Round-robin across skills in that order, so the weakest skill gets the
  // first slot and the most slots, without the strongest getting none.
  const cursors = new Map<SkillId, number>();
  const slots: Slot[] = [];
  let guard = 0;
  while (slots.length < want && guard++ < want * 8) {
    let placedAny = false;
    for (const skill of skillSequence) {
      if (slots.length >= want) break;
      const list = perSkill.get(skill);
      if (!list?.length) continue;
      const at = cursors.get(skill) ?? 0;
      if (at >= list.length) continue;
      cursors.set(skill, at + 1);
      const item = list[at];
      const gapRow = order.find((o) => o.skill === skill);
      const cell = item.coordinate.kind === 'task' ? entriesFor(exam.id, item.coordinate.taskId)[0] : undefined;
      slots.push({
        n: slots.length + 1,
        coordinate: item.coordinate,
        gap: gapRow ? gapRow.gap : null,
        items: item.items,
        prescription: cell ? cell.cell.failureMode.id : null,
      });
      placedAny = true;
      // The weakest skill is served twice per pass. One line, and it is the
      // difference between "ordered by need" and "ordered by need, once".
      if (attestation && skill === skillSequence[0] && slots.length < want) {
        const nxt = cursors.get(skill) ?? 0;
        if (nxt < list.length) {
          cursors.set(skill, nxt + 1);
          const extra = list[nxt];
          const cell2 = extra.coordinate.kind === 'task' ? entriesFor(exam.id, extra.coordinate.taskId)[0] : undefined;
          slots.push({
            n: slots.length + 1,
            coordinate: extra.coordinate,
            gap: gapRow ? gapRow.gap : null,
            items: extra.items,
            prescription: cell2 ? cell2.cell.failureMode.id : null,
          });
        }
      }
    }
    if (!placedAny) break;
  }

  return {
    examId: exam.id,
    slots,
    order,
    thin: slots.filter((s) => s.items < MIN_ITEMS_PER_COORDINATE),
    daysLeft,
    basis,
  };
}

/**
 * The plan's other output, and on some days the more useful one.
 *
 * Every coordinate the planner just emitted that cannot be filled, worst
 * first. **This is the content shopping list** — §4.1's *build thinnest-first*
 * turned from a principle into a list with names on it.
 */
export function shortfall(plan: Plan): Array<{ label: string; skill: SkillId; has: number; needs: number }> {
  return plan.thin
    .map((s) => ({
      label: s.coordinate.label,
      skill: s.coordinate.skill,
      has: s.items,
      needs: MIN_ITEMS_PER_COORDINATE - s.items,
    }))
    .sort((a, b) => b.needs - a.needs);
}
