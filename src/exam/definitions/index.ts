import type { Destination, ExamDefinition, Goal } from '../model/types';
import { PRIMARY_TRACK, type AccentTrack } from '../model/types';
import { IELTS_GT } from './ielts-gt';
import { TCF_CANADA } from './tcf-canada';

export const EXAMS: ExamDefinition[] = [IELTS_GT, TCF_CANADA];

export function examById(id: string): ExamDefinition {
  const e = EXAMS.find((x) => x.id === id);
  if (!e) throw new Error(`No exam definition "${id}"`);
  return e;
}

// ── destinations ────────────────────────────────────────────────────────
//
// A destination owns the surfaces that belong to it. The two Canadian ones
// below point at pages that exist on the marketing site today; nothing here
// links to a calculator the product has not built.

const CRS: Destination['surfaces'][number] = {
  id: 'points_calculator',
  label: { en: 'CRS points calculator', fr: 'Calculateur de points SCG' },
  href: 'https://selmapp.ca/calculator/',
};

const CONVERSION: Destination['surfaces'][number] = {
  id: 'benchmark_conversion',
  label: { en: 'How exam scores convert', fr: 'Conversion des notes' },
  href: 'https://selmapp.ca/scoring/',
};

const EXPRESS_ENTRY: Destination = {
  id: 'ca-express-entry',
  label: { en: 'Express Entry', fr: 'Entrée express' },
  country: 'CA',
  requirement: 'per_skill',
  surfaces: [CRS, CONVERSION],
};

// Citizenship reads a benchmark level and runs no points system, so it gets
// the conversion table and not the calculator. That difference is the reason
// surfaces are declared per destination rather than per country.
const CITIZENSHIP: Destination = {
  id: 'ca-citizenship',
  label: { en: 'Canadian citizenship', fr: 'Citoyenneté canadienne' },
  country: 'CA',
  requirement: 'per_skill',
  surfaces: [CONVERSION],
};

// The non-Canadian case, and it is here to be rendered rather than to be
// claimed. Australia's "Competent English" is IELTS 6 in each of the four
// bands — a requirement set on the exam's OWN scale, with no benchmark
// conversion involved and no points calculator this product has built.
const AU_SKILLED: Destination = {
  id: 'au-skilled',
  label: { en: 'Australia — skilled migration', fr: 'Australie — migration qualifiée' },
  country: 'AU',
  requirement: 'per_skill',
  surfaces: [],
};

/** Goals are data too: the required level per destination, per system. */
export const GOALS: Goal[] = [
  {
    id: 'ee-french',
    label: { en: 'Express Entry — French category', fr: 'Entrée express — catégorie francophone' },
    requiredLevel: 7,
    system: 'NCLC',
    destination: EXPRESS_ENTRY,
    exams: ['tcf-canada'],
  },
  {
    id: 'ee-english',
    label: { en: 'Express Entry — CLB 9 ("8777")', fr: 'Entrée express — CLB 9 (« 8777 »)' },
    requiredLevel: 9,
    system: 'CLB',
    destination: EXPRESS_ENTRY,
    exams: ['ielts-gt'],
  },
  {
    id: 'citizenship',
    label: { en: 'Canadian citizenship', fr: 'Citoyenneté canadienne' },
    requiredLevel: 4,
    system: 'CLB',
    destination: CITIZENSHIP,
    exams: ['ielts-gt'],
  },
  {
    id: 'au-competent',
    label: { en: 'Australia — Competent English', fr: 'Australie — anglais compétent' },
    requiredLevel: 6,
    system: 'IELTS band',
    scaleId: 'band',
    destination: AU_SKILLED,
    exams: ['ielts-gt'],
    // The one destination on the Australian accent track. It sits the SAME
    // IELTS General Training paper as Express Entry and citizenship — the
    // scripts, the questions and the keys are one bank — and hears it read in
    // Australian and British voices instead of Canadian ones.
    accentTrack: 'australia',
  },
];

/**
 * WHICH ACCENT TRACK A CANDIDATE HEARS, from the goal they picked.
 *
 * One function, for the reason `deliverable` is one function: three surfaces
 * choose audio — the mock exam, practice, and the inventory — and three
 * answers to "which file" is how one of them ends up playing the Canadian
 * recording to a candidate flying to Melbourne. It plays perfectly.
 */
export function trackForGoal(goalId: string | null | undefined): AccentTrack {
  return (goalId ? goalById(goalId)?.accentTrack : undefined) ?? PRIMARY_TRACK;
}

export function goalById(id: string): Goal | undefined {
  return GOALS.find((g) => g.id === id);
}
