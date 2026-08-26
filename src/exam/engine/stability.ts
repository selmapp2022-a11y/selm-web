/**
 * Reading a stability figure, and refusing to read a stale one.
 *
 * Step 04 recorded a judge's worst criterion spread as 11 points. Step 06
 * found the same judge behaving differently two days later. The number was
 * not wrong when it was written; it stopped being true, and nothing in the
 * product could tell the difference.
 *
 * So a stability figure is read through here, never off the record directly.
 * Past its validity window it reads as `unknown` — which is what the result
 * screen must then say, rather than quoting a number nobody has checked.
 */
import type { Localised, StabilityRecord } from '../model/types';

export const DEFAULT_VALIDITY_DAYS = 30;

export type StabilityReading =
  | { kind: 'never_measured'; label: Localised }
  | {
      kind: 'stale';
      label: Localised;
      measuredAt: string;
      ageDays: number;
      validForDays: number;
    }
  | {
      kind: 'valid';
      record: StabilityRecord;
      measuredAt: string;
      ageDays: number;
      validForDays: number;
    };

const DAY = 24 * 60 * 60 * 1000;

/** Whole days between an ISO date and `now`. Negative dates read as 0. */
export function ageInDays(measuredAt: string, now: Date): number {
  const then = Date.parse(measuredAt + 'T00:00:00Z');
  if (Number.isNaN(then)) return Number.POSITIVE_INFINITY;
  return Math.max(0, Math.floor((now.getTime() - then) / DAY));
}

export function readStability(
  record: StabilityRecord | undefined,
  now: Date = new Date()
): StabilityReading {
  if (!record) {
    return {
      kind: 'never_measured',
      label: {
        en: 'Repeatability has never been measured for this scorer.',
        fr: "La répétabilité de ce correcteur n'a jamais été mesurée.",
      },
    };
  }
  const validForDays = record.validForDays ?? DEFAULT_VALIDITY_DAYS;
  const ageDays = ageInDays(record.measuredAt, now);
  if (ageDays > validForDays) {
    return {
      kind: 'stale',
      measuredAt: record.measuredAt,
      ageDays,
      validForDays,
      label: {
        en: `Repeatability was last measured on ${record.measuredAt}, ${ageDays} days ago, and that figure is no longer quoted. A third-party scorer can change without notice — this one did, inside two days — so the figure is treated as unknown until it is measured again.`,
        fr: `La répétabilité a été mesurée le ${record.measuredAt}, il y a ${ageDays} jours ; ce chiffre n'est plus cité. Un correcteur tiers peut changer sans préavis — celui-ci l'a fait en deux jours — et la valeur est donc considérée comme inconnue jusqu'à une nouvelle mesure.`,
      },
    };
  }
  return { kind: 'valid', record, measuredAt: record.measuredAt, ageDays, validForDays };
}
