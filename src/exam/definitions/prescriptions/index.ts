/**
 * The prescription catalogue.
 *
 * THE PLAN old §3.2, restored by Amendment 2 §2.1: roughly 20–30 named
 * failure modes per exam, each with the one structural move that fixes it.
 *
 * **Three entries**, all of expression écrite at NCLC 6 — Amendment 2 §5's
 * order: *"Extend the cell to tâches 1 and 2, then expression orale, before
 * widening to another level."* The order is right because a candidate does
 * all six tâches whatever their level, so a second tâche at the same level
 * is worth more to them than the same tâche at a second level.
 *
 * Of 20–30 per exam, that is three. The file says so rather than pretending
 * at a catalogue.
 *
 * A coordinate with no cell returns nothing, and the caller says so out loud.
 * Amendment 1 §6: **a visible gap is a better failure than a plausible
 * generic answer** — and it is also the signal for which prescription to
 * write next.
 */
import type { Diagnosis, PrescriptionCell } from '../../model/prescription';
import type { Segmentation } from '../../engine/text';
import type { TaskDefinition } from '../../model/types';
import { diagnoseJuxtaposition, diagnoseEmptyMessage, diagnoseNoPivot } from '../../engine/diagnose';
import { CELL as TCF_EE_T3_NCLC6, THRESHOLDS as T3_N6 } from './tcf-ee-t3-nclc6';
import { CELL as TCF_EE_T1_NCLC6, THRESHOLDS as T1_N6 } from './tcf-ee-t1-nclc6';
import { CELL as TCF_EE_T2_NCLC6, THRESHOLDS as T2_N6 } from './tcf-ee-t2-nclc6';
import { ITEMS as T1_ITEMS } from '../practice/tcf-ee-t1-nclc6.items';

/**
 * A cell plus the detector that finds its failure mode.
 *
 * The detector is held beside the cell rather than inside it because the
 * cell is data and the detector is code; a second cell on the same failure
 * mode at a different level reuses the detector with different thresholds,
 * which is the whole reason thresholds live in the cell.
 */
export type CatalogueEntry = {
  cell: PrescriptionCell;
  detect: (task: TaskDefinition, text: string, seg: Segmentation) => Diagnosis;
};

export const CATALOGUE: CatalogueEntry[] = [
  {
    cell: TCF_EE_T1_NCLC6,
    // The second requirement is a property of the ITEM, not of the task —
    // tâche 1's instruction always has two halves and the second differs by
    // prompt. Outside a practice item the global default stands, and the
    // signal is weaker; the detector says so through its own threshold.
    detect: (task, text, seg) => {
      const item = T1_ITEMS.find((i) => i.id === task.id);
      return diagnoseEmptyMessage(task, text, T1_N6, item?.secondRequirement, seg);
    },
  },
  {
    cell: TCF_EE_T2_NCLC6,
    detect: (task, text, seg) => diagnoseNoPivot(task, text, T2_N6, seg),
  },
  {
    cell: TCF_EE_T3_NCLC6,
    detect: (task, text, seg) => diagnoseJuxtaposition(task, text, T3_N6, seg),
  },
];

/** Every entry written for this exam and task, at any level. */
export function entriesFor(examId: string, taskId: string): CatalogueEntry[] {
  return CATALOGUE.filter((e) => e.cell.at.examId === examId && e.cell.at.taskId === taskId);
}

/** The cell for one exact coordinate, or null when none has been written. */
export function cellAt(examId: string, taskId: string, level: number): PrescriptionCell | null {
  return CATALOGUE.find(
    (e) => e.cell.at.examId === examId && e.cell.at.taskId === taskId && e.cell.at.level === level,
  )?.cell ?? null;
}
