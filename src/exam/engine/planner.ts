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
import { deliverable } from './practicePool';
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
  /**
   * Skills, ordered by distance to target. Empty without an attestation.
   *
   * `awarded` and `gap` are `null` for an épreuve the candidate did not sit.
   * Those sort FIRST, ahead of every measured shortfall, and the reason is
   * not that they are presumed weak — it is that under IRCC an absent mark
   * is not a low mark, it is an application that cannot be filed at all.
   * A candidate at NCLC 4 against a target of 7 is three levels short; a
   * candidate who never sat the épreuve is missing a required document.
   */
  order: Array<{ skill: SkillId; awarded: number | null; target: number; gap: number | null }>;
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
 * Two published tables, in this order, and nothing invented in between.
 *
 *  1. **The benchmark band's own `cefr`**, where the awarding body prints one
 *     — *"the only bridge between a corpus labelled in CEFR and a benchmark
 *     expressed in NCLC or CLB"*. A band printed as `C1-C2` resolves to its
 *     first level; guessing between them would be inventing.
 *  2. **Otherwise the two tables composed**: the lowest scale score that earns
 *     this benchmark level, read through the scale's own `cefrBands`. Both
 *     halves are the awarding body's; only the join is ours, and the join is
 *     the identity — a score earns a level and the same score carries a CEFR.
 *
 * ── Why step 2 had to be added ──────────────────────────────────────────
 * IELTS General Training prints no `cefr` on its CLB rows. It prints CEFR
 * against the BAND, on the scale, which is where `cefrBands` sits. So step 1
 * missed for every IELTS level and this function returned its `2` fallback —
 * **B1, for CLB 4 and CLB 10 alike.** The planner has ordered every
 * attestation-less IELTS candidate's coordinates around B1 since it was
 * written, and nothing said so because a fallback that returns a plausible
 * number looks exactly like a working function.
 *
 * With step 2: CLB 9 reading needs band 7.0, and 7.0 is C1. CLB 4 reading
 * needs 3.5, and 3.5 is A2. Four bands apart, from tables both already in the
 * file.
 *
 * `skill` matters and is not decoration: IRCC converts each skill
 * differently — 7.5 is CLB 8 in reading and CLB 10 in listening — so
 * `bySkill` is read before `bands`, the same precedence the rest of the model
 * uses.
 */
export function cefrIndexFor(
  exam: ExamDefinition,
  level: number,
  skill?: SkillId,
  /**
   * The scale the LEVEL is expressed on, when the destination sets it on the
   * exam's own scale rather than on a benchmark.
   *
   * ── The conversion that must not be made twice ────────────────────────
   * Australia asks for **IELTS band 6** — a score, on the exam's own scale.
   * Every other destination here asks for a benchmark level: CLB 9, NCLC 7.
   * Without this parameter the 6 was read as CLB 6, sent through the
   * benchmark table, and came back as band 5.5 — a real number, for a
   * question nobody asked.
   *
   * `GoalPage` and `lib/practiceTasks` both already draw this distinction
   * (`onExamScale`). This function did not, and was right only by
   * coincidence: CLB 6 and band 6 happened to land on the same CEFR row.
   * A coincidence is not a conversion, and the next scale added would have
   * ended it silently.
   */
  targetScaleId?: string,
): number {
  const own = targetScaleId ? exam.scales.find((sc) => sc.id === targetScaleId) : undefined;
  if (own) {
    // A score on the exam's own scale needs no benchmark at all: the scale
    // carries CEFR itself. Ordered high-to-low on `from`, so the first row
    // this score reaches is the highest CEFR it earns.
    const hit = own.cefrBands?.find((b) => level >= b.from);
    const i = hit ? CEFR.indexOf(hit.cefr) : -1;
    if (i >= 0) return i;
    // A scale with no published CEFR is a real gap, not a number to invent.
    return 2;
  }

  const rows = (skill && exam.benchmark.bySkill?.[skill]) || exam.benchmark.bands;
  const band = rows.find((b) => b.level === level);

  const printed = band?.cefr?.split('-')[0];
  if (printed) {
    const i = CEFR.indexOf(printed);
    if (i >= 0) return i;
  }

  if (band) {
    const award = skill ? exam.awards.find((w) => w.skill === skill) : undefined;
    const scale = exam.scales.find((sc) => sc.id === award?.scaleId) ?? exam.scales[0];
    // `cefrBands` is ordered high-to-low on `from`, so the first row this
    // score reaches is the highest CEFR it earns — the same read as the
    // awarding body's chart.
    const hit = scale?.cefrBands?.find((b) => band.from >= b.from);
    if (hit) {
      const i = CEFR.indexOf(hit.cefr);
      if (i >= 0) return i;
    }
  }

  return 2;
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
    // Ruling 4: the RECORDING is the schedulable unit, because it is what a
    // candidate is served and you cannot serve half of one. Counting
    // questions here would have let the planner emit two coordinates that
    // require the same recording — which the once-only rule then has to
    // answer for. A recording IS one coordinate, so that cannot arise.
    const counts = new Map<string, number>();
    for (const r of s.recordings) {
      if (!r.family) continue;
      // A coordinate the product cannot play is not a coordinate the plan can
      // schedule. See `deliverable` — the same predicate practice and the
      // mock exam use, so a plan slot always has something behind it.
      if (!deliverable(s, r)) continue;
      const k = `${r.family}|${r.level}`;
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    for (const f of s.families ?? [])
      // A family's declared range, or the whole ladder where it declares none.
      // See `ComprehensionFamily.bands`: the families are the exam's and the
      // six bands are ours, and crossing them unconditionally invented
      // coordinates no exam contains.
      for (const level of f.bands ?? ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
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
/**
 * How much practisable material sits behind a production task.
 *
 * This counted ONLY prescription practice items until 2026-08-29, and the
 * prescription catalogue holds TCF cells and nothing else - so every IELTS
 * task counted zero, and the plan told the candidate "not authored yet" about
 * Writing Task 1 and Speaking Part 1 while /writing and /speaking rendered
 * both of them correctly on the same build. The measure was wrong, not the
 * content. A prescription is REMEDIATION, offered after a weak performance;
 * an authored task is practisable the moment it exists.
 *
 * So the task itself counts as one, and prescription items add to it.
 */
function itemsForTask(examId: string, taskId: string): number {
  const entries = entriesFor(examId, taskId);
  return 1 + entries.reduce((n, e) => n + e.cell.practiceItemIds.length, 0);
}

export type PlannerInput = {
  exam: ExamDefinition;
  /** The most recent attestation for this exam, if any. */
  attestation: Attestation | null;
  /** Required level, from the candidate's goal. */
  target: number;
  /**
   * The scale `target` is on, when the goal sets it on the exam's own rather
   * than on a benchmark — `Goal.scaleId`. Australia's "IELTS band 6" is a
   * score; CLB 9 and NCLC 7 are benchmark levels, and reading one as the
   * other converts a number that was already in the right units.
   */
  targetScaleId?: string;
  /** Days until the sitting, or null when no date is set. */
  daysLeft: number | null;
  /** How many slots the plan should hold. §4.1: roughly 30 over six weeks. */
  slots?: number;
};

/** The candidate's CEFR index for one skill, or null when unknown. */
function attestationLevel(exam: ExamDefinition, a: Attestation | null, skill: SkillId): number | null {
  if (!a) return null;
  // The AWARDED SCORE first, through the scale's own CEFR bands. Going via
  // the NCLC level made this a conversion of a conversion, and it disagreed
  // with the awarding body on 2 of 10 real listening scores — see
  // `cefrBands` in `types.ts`. The NCLC route stays only as the fallback for
  // an exam whose scale declares no CEFR.
  const award = exam.awards.find((w) => w.skill === skill);
  const raw = (a.awarded as unknown as Record<string, number | null>)[skill];
  const scale = exam.scales.find((sc) => sc.id === award?.scaleId);
  if (typeof raw === 'number' && Number.isFinite(raw) && scale?.cefrBands) {
    const hit = scale.cefrBands.find((b) => raw >= b.from);
    const i = hit ? CEFR.indexOf(hit.cefr) : -1;
    if (i >= 0) return i;
  }
  const lvl = (a.benchmark as unknown as Record<string, number>)[skill];
  if (typeof lvl !== 'number' || !Number.isFinite(lvl)) return null;
  return cefrIndexFor(exam, lvl, skill);
}

/**
 * The CEFR band to serve this candidate at, and where that band came from.
 *
 * ── The defect this exists for ──────────────────────────────────────────
 * Reported by the founder on 2026-08-29, three times in three ways, and
 * answered with explanations twice before it was heard. His words:
 * *"every exam has a level, and the questions and the practice have to
 * differ."*
 *
 * He was right and the product had the fact and did not use it. A
 * destination states the level it requires the moment it is chosen — CLB 9,
 * CLB 4, IELTS band 6 — and `requiredLevel` was read by the plan, by
 * Progress and by three headings, **and by nothing that chose material.**
 * Without a past score `attestationLevel` returned null, `coordinatesFor`
 * fell back to the raw ladder, and every candidate of every destination was
 * started at A1. Someone who needs CLB 9 was being handed the A1 notices.
 *
 * The target is not a guess. It is the one level-shaped fact we hold about a
 * candidate from their first minute, it is the level their exam is at, and
 * ordering by distance from it puts that band and its two neighbours first
 * instead of the two far ends.
 *
 * A measured level still wins, because it is about THEM rather than about
 * where they are going. The basis is returned rather than folded in, so a
 * screen can say which of the two it is standing on — the same discipline as
 * `calibration.ts`: a number whose provenance is not carried is a number
 * nobody can check.
 */
export type CandidateLevel = { index: number; basis: 'attestation' | 'target' };

export function candidateLevel(
  exam: ExamDefinition,
  attestation: Attestation | null,
  target: number,
  skill: SkillId,
  /** The scale `target` is on, when the destination sets it on the exam's own. */
  targetScaleId?: string,
): CandidateLevel {
  const measured = attestationLevel(exam, attestation, skill);
  if (measured !== null) return { index: measured, basis: 'attestation' };
  return { index: cefrIndexFor(exam, target, skill, targetScaleId), basis: 'target' };
}

/**
 * The lowest score on the exam's own scale that earns this benchmark level in
 * this skill — band 7.0 for CLB 9 in IELTS reading, and so on.
 *
 * The awarding body publishes the conversion in one direction and a candidate
 * needs it in the other: they are told they need CLB 9, and what they have to
 * produce is a band. Reading the table backwards is not a new claim — it is
 * the same row.
 *
 * Per skill, because IRCC converts each skill differently: 7.5 is CLB 8 in
 * reading and CLB 10 in listening, so a single number for "what you need"
 * would be wrong for three of the four.
 */
export function scoreNeededFor(exam: ExamDefinition, level: number, skill: SkillId): number | null {
  const rows = exam.benchmark.bySkill?.[skill] ?? exam.benchmark.bands;
  const hit = rows.find((b) => b.level === level);
  return hit ? hit.from : null;
}

/** The CEFR tag for an index, for a screen that has to name the band. */
export function cefrTag(index: number): string {
  return CEFR[Math.max(0, Math.min(CEFR.length - 1, index))];
}

/**
 * Every coordinate this exam can emit, grouped by skill, with how much sits
 * behind each one.
 *
 * Split out of `buildPlan` on 29 August 2026 so the content inventory counts
 * REACHABILITY with the planner's own function rather than a copy of it. A
 * second implementation of "what can the plan address" would answer the
 * question the inventory exists to ask, and would be free to drift from the
 * planner while still looking authoritative — which is the worst shape a
 * measurement can have.
 *
 * `here` is the candidate's CEFR index for the skill, or null. It affects only
 * the ORDER of the comprehension coordinates, never which ones exist, so the
 * inventory passes null and gets the full set.
 */
export function coordinatesFor(
  exam: ExamDefinition,
  here: (skill: SkillId) => number | null = () => null,
): Map<SkillId, Array<{ coordinate: Coordinate; items: number }>> {
  const perSkill = new Map<SkillId, Array<{ coordinate: Coordinate; items: number }>>();
  for (const a of exam.awards) {
    const list: Array<{ coordinate: Coordinate; items: number }> = [];
    for (const t of tasksOf(exam, a.skill))
      list.push({
        coordinate: { kind: 'task', skill: a.skill, taskId: t.id, label: t.name[exam.language] },
        items: itemsForTask(exam.id, t.id),
      });
    const at = here(a.skill);
    const fams = familiesOf(exam, a.skill).map((f) => ({
      ...f,
      distance: at === null ? CEFR.indexOf(f.level) : Math.abs(CEFR.indexOf(f.level) - at),
    }));
    fams.sort((x, y) => x.distance - y.distance || y.items - x.items);
    for (const f of fams)
      list.push({
        coordinate: { kind: 'family', skill: a.skill, family: f.family, level: f.level, label: `${f.family} · ${f.level}` },
        items: f.items,
      });
    if (list.length) perSkill.set(a.skill, list);
  }
  return perSkill;
}

export function buildPlan(input: PlannerInput): Plan {
  const { exam, attestation, target, daysLeft } = input;
  const want = input.slots ?? 30;

  // Every coordinate this exam can emit, grouped by skill.
  // The candidate's band, measured where we have marks and taken from the
  // destination's required level where we do not. Until 2026-08-29 this was
  // `attestationLevel` alone, which is null before a first score — so the
  // plan ordered by the raw ladder and put A1 in front of a candidate who
  // needs CLB 9. See `candidateLevel`.
  const perSkill = coordinatesFor(exam, (skill) => candidateLevel(exam, attestation, target, skill, input.targetScaleId).index);
  {
    // Comprehension coordinates are ordered by DISTANCE FROM THE CANDIDATE,
    // not by the ladder — see `coordinatesFor`, which now owns that ordering.
    //
    // Found by running the planner: a candidate at NCLC 5 was being handed
    // `annonce · A1` and `annonce · C2` in the same twelve slots. Both are
    // real coordinates and both are useless to them — one is years behind,
    // the other years ahead, and the plan has six weeks.
  }

  // Skill order. With marks, worst-first by distance to target — the
  // governing level is the lowest of the four, so the eights wait.
  let order: Plan['order'] = [];
  let basis: Plan['basis'] = 'exam-order';
  if (attestation) {
    basis = 'attestation';
    order = exam.awards
      .map((a) => {
        // `?? 0` stood here until a corpus of eight real score reports
        // showed two of them printing « Non inscrit(e) à cette épreuve »
        // where a mark would go. `null ?? 0` is 0, so an épreuve nobody sat
        // was arriving as "awarded NCLC 0" — the largest gap on the sheet,
        // taking the most slots, on a number the document never contained.
        const raw = (attestation.benchmark as unknown as Record<string, number | null>)[a.skill];
        const awarded = typeof raw === 'number' && Number.isFinite(raw) ? raw : null;
        return { skill: a.skill, awarded, target, gap: awarded === null ? null : target - awarded };
      })
      // Unsat épreuves first, then measured shortfalls worst-first.
      .sort((x, y) => {
        if (x.gap === null && y.gap === null) return 0;
        if (x.gap === null) return -1;
        if (y.gap === null) return 1;
        return y.gap - x.gap;
      });
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
    // MIN_ITEMS_PER_COORDINATE is a COMPREHENSION rule: a family holding two
    // questions cannot measure anything. A production task is one prompt, sat
    // once, so holding it to four is a category error - and it is what made
    // every authored IELTS task read as a gap. A task is thin only when it
    // does not exist at all.
    thin: slots.filter((s) =>
      s.coordinate.kind === 'family' ? s.items < MIN_ITEMS_PER_COORDINATE : s.items === 0,
    ),
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
      needs: s.coordinate.kind === 'family' ? MIN_ITEMS_PER_COORDINATE - s.items : 1,
    }))
    .sort((a, b) => b.needs - a.needs);
}
