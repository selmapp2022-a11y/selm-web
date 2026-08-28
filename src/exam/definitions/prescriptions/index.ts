/**
 * The prescription catalogue.
 *
 * THE PLAN old §3.2, restored by Amendment 2 §2.1: roughly 20–30 named
 * failure modes per exam, each with the one structural move that fixes it.
 *
 * **One entry so far.** That is the honest state and the file says so
 * rather than pretending at a catalogue. Amendment 2 §2.1: *"`tcf-ee-t3-nclc6`
 * is the first entry. The catalogue is what it is the first entry of."*
 *
 * A coordinate with no cell returns nothing, and the caller says so out loud.
 * Amendment 1 §6: **a visible gap is a better failure than a plausible
 * generic answer** — and it is also the signal for which prescription to
 * write next.
 */
import type { Diagnosis, PrescriptionCell } from '../../model/prescription';
import type { Segmentation } from '../../engine/text';
import type { TaskDefinition } from '../../model/types';
import { diagnoseJuxtaposition } from '../../engine/diagnose';
import { CELL as TCF_EE_T3_NCLC6, THRESHOLDS as T3_N6 } from './tcf-ee-t3-nclc6';

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
