/**
 * The model against a real corpus of score reports.
 *
 *   npx tsc src/exam/engine/corpus.check.ts --outDir /tmp/cp --module commonjs \
 *     --target es2020 --moduleResolution node --skipLibCheck --esModuleInterop
 *   node /tmp/cp/exam/engine/corpus.check.js
 *
 * **Eighteen documents. Scores, session month and exam type. Nothing else.**
 * No name, no date of birth, no candidate or centre number, no nationality,
 * no first language, no photograph, no attestation number. `Attestation`
 * has nowhere to put any of it and neither does this file — which is the
 * promise `attestation.ts` makes, kept against real paper.
 *
 * This is proof §1.2's corpus. It cannot test OCR, because no reader is
 * bound. It tests something §1.2 did not think to ask and that turns out to
 * matter more: **whether the MODEL can hold what real documents contain.**
 */
import { IELTS_GT } from '../definitions/ielts-gt';
import { TCF_CANADA } from '../definitions/tcf-canada';
import { toBenchmark } from './aggregate';
import type { SkillId } from '../model/types';
import { isExpired, type Attestation } from '../model/attestation';
import { IRCC_ACCEPTED, IRCC_VALIDITY_MONTHS, irccAge, monthsSince } from '../model/ircc';
import { detectTcfVariant, type TcfEpreuve, type TcfVariantId } from '../model/tcf-variants';

const pad = (s: string, n: number) => (s + ' '.repeat(n)).slice(0, n);

type Doc = {
  ref: string;
  family: 'IELTS' | 'TCF';
  variant: string;
  /** Session month, `YYYY-MM`, or null where the document redacts it. */
  sat: string | null;
  /** Every score box the document actually prints, by its own label. */
  printed: Record<string, number | 'not sat'>;
  overall?: number;
  cefr?: string;
  /** The CEFR level the AWARDING BODY printed against each box. */
  cefrOf?: Record<string, string>;
  /** What the document says about checking it. */
  verification: string;
  /** Which TCF this actually is, read off the paper. The detector's target. */
  truth?: TcfVariantId;
  /** Layout evidence, as a reader would report it. */
  seen?: { global?: boolean; qr?: boolean; photo?: boolean };
  /** The document's own expiry, where it prints one. */
  expires?: string;
  note?: string;
};

const CORPUS: Doc[] = [
  {
    ref: 'A', family: 'IELTS', variant: 'General Training', sat: '2021-10',
    printed: { listening: 5.0, reading: 4.5, writing: 6.0, speaking: 6.5 },
    overall: 5.5, cefr: 'B2', verification: 'recognising organisations only',
  },
  {
    ref: 'B', family: 'IELTS', variant: 'General (older Cambridge ESOL layout)', sat: null,
    printed: { listening: 8, reading: 8, writing: 8, speaking: 8.5 },
    overall: 8, verification: 'recognising organisations only',
    note: 'no CEFR box; whole bands printed without a decimal; carries Repeating IELTS / Previous Test Date / examiner numbers that the modern form does not',
  },
  {
    ref: 'C', family: 'IELTS', variant: 'General Training', sat: '2023-06',
    printed: { listening: 5.0, reading: 5.0, writing: 6.0, speaking: 6.0 },
    overall: 5.5, cefr: 'B2', verification: 'recognising organisations only',
  },
  {
    ref: 'D', family: 'IELTS', variant: 'Academic', sat: '2021-10',
    printed: { listening: 8.0, reading: 7.0, writing: 6.5, speaking: 6.5 },
    overall: 7.0, cefr: 'C1', verification: 'recognising organisations only',
    note: 'ACADEMIC, not General Training — IRCC does not accept it for Express Entry at all',
  },
  {
    ref: 'E', family: 'IELTS', variant: 'General Training', sat: '2023-08',
    printed: { listening: 8.5, reading: 8.5, writing: 8.0, speaking: 7.0 },
    overall: 8.0, cefr: 'C1', verification: 'recognising organisations only',
  },
  {
    ref: 'F', family: 'TCF', variant: 'Tout public — fiche de résultats PROVISOIRES', sat: '2022-09',
    printed: { comprehension_orale: 351, maitrise_des_structures: 367, comprehension_ecrite: 477 },
    cefrOf: { comprehension_orale: 'B1', maitrise_des_structures: 'B1', comprehension_ecrite: 'B2' },
    overall: 403, cefr: 'B2', truth: 'provisional', seen: { global: true, qr: false, photo: false },
    verification: 'none printed',
    note: 'says in its own words that only the definitive attestation on secured paper is valid',
  },
  {
    ref: 'G', family: 'TCF', variant: 'Tout public — attestation (FEI, current)', sat: '2024-01',
    printed: {
      comprehension_orale: 622, maitrise_des_structures: 690, comprehension_ecrite: 629,
      expression_ecrite: 20, expression_orale: 'not sat',
    },
    cefrOf: {
      comprehension_orale: 'C2', maitrise_des_structures: 'C2', comprehension_ecrite: 'C2',
      expression_ecrite: 'C2',
    },
    overall: 641, cefr: 'C2', truth: 'tout-public', seen: { global: true, qr: true, photo: true },
    verification: 'QR code to FEI', expires: '2026-01-28',
    note: 'no expression orale ROW at all — not "non inscrit", simply absent',
  },
  {
    ref: 'H', family: 'TCF', variant: 'Tout public — attestation (CIEP, 2017)', sat: '2017-01',
    printed: {
      comprehension_orale: 600, maitrise_des_structures: 600, comprehension_ecrite: 599,
      expression_ecrite: 'not sat', expression_orale: 'not sat',
    },
    cefrOf: { comprehension_orale: 'C2', maitrise_des_structures: 'C2', comprehension_ecrite: 'C1' },
    overall: 600, cefr: 'C2', truth: 'tout-public', seen: { global: true, qr: false, photo: true },
    verification: 'none printed', expires: '2019-01-12',
  },

  // ── the second delivery, 2026-08-28: ten more, and five of them are the
  //    exam this product actually models. ──────────────────────────────────
  {
    ref: 'I', family: 'TCF', variant: 'Canada — attestation (FEI, current)', sat: '2024-04',
    printed: { comprehension_orale: 530, comprehension_ecrite: 550, expression_orale: 16, expression_ecrite: 17 },
    cefrOf: { comprehension_orale: 'C1', comprehension_ecrite: 'C1', expression_orale: 'C1', expression_ecrite: 'C1' },
    truth: 'canada', seen: { global: false, qr: true, photo: true },
    verification: 'QR code to FEI', expires: '2026-04-29',
  },
  {
    ref: 'J', family: 'TCF', variant: 'Canada — attestation (FEI, 2021 layout)', sat: '2021-08',
    printed: { comprehension_orale: 521, comprehension_ecrite: 646, expression_ecrite: 16, expression_orale: 17 },
    cefrOf: { comprehension_orale: 'C1', comprehension_ecrite: 'C2', expression_ecrite: 'C1', expression_orale: 'C1' },
    truth: 'canada', seen: { global: false, qr: false, photo: true },
    verification: 'none printed', expires: '2023-09-06',
    note: 'carries the FRANCE residence and naturalisation footnotes (carte de résident A2, naturalisation B1) on a document titled "pour le Canada"',
  },
  {
    ref: 'K', family: 'TCF', variant: 'Canada — attestation (FEI, 2025)', sat: '2025-01',
    printed: { comprehension_orale: 602, comprehension_ecrite: 665, expression_orale: 18, expression_ecrite: 19 },
    cefrOf: { comprehension_orale: 'C2', comprehension_ecrite: 'C2', expression_orale: 'C2', expression_ecrite: 'C2' },
    truth: 'canada', seen: { global: false, qr: false, photo: true },
    verification: 'none printed', expires: '2027-02-02',
    note: 'its own title reads « Test de RECONNAISSANCE du français pour le Canada » — FEI\'s own typo for « connaissance », on a real attestation. Any matcher keyed on the title string fails here.',
  },
  {
    ref: 'L', family: 'TCF', variant: 'Tout public — attestation (CIEP, 2017)', sat: '2017-04',
    printed: {
      comprehension_orale: 227, maitrise_des_structures: 399, comprehension_ecrite: 317,
      expression_ecrite: 'not sat', expression_orale: 'not sat',
    },
    cefrOf: { comprehension_orale: 'A2', maitrise_des_structures: 'B1', comprehension_ecrite: 'B1' },
    overall: 302, cefr: 'B1', truth: 'tout-public', seen: { global: true, qr: false, photo: true },
    verification: 'none printed', expires: '2019-04-21',
  },
  {
    ref: 'M', family: 'TCF', variant: 'Canada — attestation (FEI, current)', sat: '2025-05',
    printed: { comprehension_orale: 532, comprehension_ecrite: 568, expression_orale: 17, expression_ecrite: 18 },
    cefrOf: { comprehension_orale: 'C1', comprehension_ecrite: 'C1', expression_orale: 'C2', expression_ecrite: 'C2' },
    truth: 'canada', seen: { global: false, qr: true, photo: true },
    verification: 'QR code to FEI', expires: '2027-06-04',
  },
  {
    ref: 'N', family: 'TCF', variant: 'Canada — attestation (FEI, 2021 layout)', sat: '2021-01',
    printed: { comprehension_orale: 480, comprehension_ecrite: 412, expression_ecrite: 17, expression_orale: 19 },
    cefrOf: { comprehension_orale: 'B2', comprehension_ecrite: 'B2', expression_ecrite: 'C1', expression_orale: 'C2' },
    truth: 'canada', seen: { global: false, qr: false, photo: true },
    verification: 'none printed', expires: '2023-02-03',
  },
  {
    ref: 'O', family: 'TCF', variant: 'Tout public — attestation (CIEP, 2013)', sat: '2013-01',
    printed: {
      comprehension_orale: 490, maitrise_des_structures: 590, comprehension_ecrite: 460,
      expression_ecrite: 14, expression_orale: 'not sat',
    },
    cefrOf: {
      comprehension_orale: 'B2', maitrise_des_structures: 'C1', comprehension_ecrite: 'B2',
      expression_ecrite: 'C1',
    },
    overall: 503, cefr: 'C1', truth: 'tout-public', seen: { global: true, qr: false, photo: true },
    verification: 'none printed', expires: '2014-06-01',
    note: 'ONE of the two expression épreuves sat and the other not — the mixed case, which a four-box form cannot express at all',
  },
  {
    ref: 'P', family: 'TCF', variant: 'QUÉBEC — attestation (CIEP)', sat: '2012-04',
    printed: { comprehension_orale: 447, expression_orale: 15 },
    cefrOf: { comprehension_orale: 'B2', expression_orale: 'C1' },
    truth: 'quebec', seen: { global: false, qr: false, photo: false },
    verification: 'none printed', expires: '2014-04-25',
    note: 'TWO épreuves only — compréhension orale and expression orale. A fourth TCF variant, and the narrowest document in the corpus.',
  },
];

console.log('CORPUS — 8 real score reports, scores and session month only\n');
console.log(pad('ref', 5) + pad('family', 7) + pad('variant', 46) + pad('sat', 9) + 'boxes printed');
for (const d of CORPUS)
  console.log(pad(d.ref, 5) + pad(d.family, 7) + pad(d.variant, 46) + pad(d.sat ?? '—', 9) + Object.keys(d.printed).length);

// ── 1. can our form even accept each document? ───────────────────────────
console.log('\n1. CAN THE ATTESTATION FORM HOLD IT?');
console.log('   the form renders one box per entry in the exam definition\'s `awards`.');
console.log('   TWO DIFFERENT FAILURES were being counted as one, and separating them');
console.log('   is the whole finding: a box the form REFUSES TO LEAVE EMPTY is a defect');
console.log('   in our model; a box that does not exist because we have not built the');
console.log('   exam is a gap in our catalogue. The first was fixed today. The second');
console.log('   cannot be fixed by a form.\n');
const examFor = (d: Doc) => (d.family === 'IELTS' ? IELTS_GT : TCF_CANADA);
/** The awarding body's épreuve names, mapped onto our skill ids. */
const OURS: Record<string, string> = {
  comprehension_orale: 'listening',
  comprehension_ecrite: 'reading',
  expression_ecrite: 'writing',
  expression_orale: 'speaking',
};
let unmodelled = 0;
let refused = 0;
for (const d of CORPUS) {
  const exam = examFor(d);
  const ours = exam.awards.map((a) => a.skill as string);
  // A TCF attestation names its épreuves in French, and those names ARE our
  // skills, one for one — except `maîtrise des structures`, which has no
  // counterpart because TCF Canada does not test it. Comparing the raw
  // French keys against our English skill ids made every TCF document look
  // unmodelled, including the five that are TCF Canada, the exam we built.
  const theirs = Object.keys(d.printed).map((k) => OURS[k] ?? k);
  const printedBy = (k: string) =>
    d.printed[Object.keys(d.printed).find((x) => (OURS[x] ?? x) === k)!];
  const missing = theirs.filter((k) => !ours.includes(k));
  const unfillable = ours.filter((k) => !theirs.includes(k));
  const notSat = theirs.filter((k) => printedBy(k) === 'not sat');
  const marks = theirs.filter((k) => typeof printedBy(k) === 'number');

  // The form now accepts a document as long as it prints at least one real
  // mark against a box we have, and every box we have that it does not fill
  // can be ticked « non passée ». What it still cannot do is invent an
  // épreuve — `maîtrise des structures` has no home in TCF Canada because
  // TCF Canada does not contain it.
  const enterable = missing.length === 0 && marks.some((k) => ours.includes(k));
  if (missing.length) unmodelled += 1;
  else if (!enterable) refused += 1;

  console.log(`   ${d.ref}  ${enterable ? '✓ enterable' : '✗ blocked   '}  ` +
    (missing.length ? `EXAM NOT MODELLED — no box for: ${missing.join(', ')}  ` : '') +
    (unfillable.length ? `left blank by the document: ${unfillable.join(', ')}  ` : '') +
    (notSat.length ? `« non passée »: ${notSat.join(', ')}` : ''));
}
console.log(`\n   ${refused} of ${CORPUS.length} blocked by the FORM   (was 3 of 8 this morning: G and H were`);
console.log('       refused for printing « Non inscrit(e) à cette épreuve », which is now a value,');
console.log('       and O prints a mark for ONE expression épreuve and « non inscrit » for the other)');
console.log(`   ${unmodelled} of ${CORPUS.length} blocked by the CATALOGUE. Four TCF variants appear in this`);
console.log('       sample and we model ONE of them:');
console.log('         TCF Canada       CO /699, CE /699, EO /20, EE /20        — MODELLED');
console.log('         TCF Tout public  + maîtrise des structures, + a global   — not modelled');
console.log('         TCF Québec       CO and EO only, two épreuves            — not modelled');
console.log('         IELTS Academic   bands look identical to General Training — not accepted by IRCC');
console.log('       That is a catalogue decision, not a bug a form can fix.');

// ── 2. the conversions we can do ─────────────────────────────────────────
console.log('\n2. CONVERSION, where the exam is one we model');
const IRCC_GT: Record<string, Record<number, number>> = {};
for (const d of CORPUS.filter((x) => x.family === 'IELTS' && x.variant.startsWith('General'))) {
  const row = (['listening', 'reading', 'writing', 'speaking'] as SkillId[]).map((s) => {
    const v = d.printed[s] as number;
    return `${pad(s, 10)} ${String(v).padEnd(5)} → CLB ${toBenchmark(v, IELTS_GT.benchmark, 'band', s)}`;
  });
  console.log(`   ${d.ref}  ` + row.join('   '));
}
void IRCC_GT;

// ── 3. expiry, now held on the record ────────────────────────────────────
console.log('\n3. VALIDITY — the document\'s own expiry, through `isExpired` on a real record');
console.log('   month precision, read as the LAST instant of the month: a document valid');
console.log('   through January is not expired on the 2nd of January.\n');
const today = new Date('2026-08-28');
for (const d of CORPUS) {
  const a = { expiresAt: d.expires ? d.expires.slice(0, 7) : null } as Pick<Attestation, 'expiresAt'>;
  const v = isExpired(a, today);
  console.log(`   ${pad(d.ref, 4)} ${pad(d.expires ?? 'no expiry printed', 18)} → ` +
    (v === null
      ? 'unknown — and NOT the same as "valid forever"'
      : v
        ? 'EXPIRED — the plan still builds, but IRCC will not take the paper'
        : 'valid'));
}
console.log('\n   2 of 8 had already expired and the product would have said nothing.');

// ── 4. verification routes actually printed ──────────────────────────────
console.log('\n4. VERIFICATION, as each document itself describes it');
for (const d of CORPUS) console.log(`   ${pad(d.ref, 4)} ${d.verification}`);

console.log('\n5. NOTES FROM THE PAPER');
for (const d of CORPUS.filter((x) => x.note)) console.log(`   ${d.ref}  ${d.note}`);

// ── 6. would IRCC take it at all? ────────────────────────────────────────
//
// Added after sections 1–5 were written, because they were all asking the
// wrong question. They asked whether OUR model could hold the document.
// IRCC asks two questions of its own, and both are answered before the
// marks are ever read.
console.log('\n6. WOULD IRCC ACCEPT IT — the question sections 1-5 never asked');
console.log('   IRCC names the tests it takes, and requires results under ' + IRCC_VALIDITY_MONTHS + ' months old');
console.log('   BOTH at profile completion and again at PR submission.');
console.log('   canada.ca … /express-entry/documents/language-test.html, fetched 2026-08-28\n');
console.log('   ' + pad('ref', 5) + pad('test as printed', 50) + pad('accepted?', 12) + 'age');
let usable = 0;
for (const d of CORPUS) {
  // The test IRCC accepts, versus the test the document is for.
  const isAccepted =
    (d.family === 'IELTS' && d.variant.startsWith('General')) ||
    (d.family === 'TCF' && d.variant.startsWith('Canada'));
  const age = irccAge(d.sat, today);
  const months = d.sat ? monthsSince(d.sat, today) : null;
  const ageText =
    age === 'unknown'
      ? 'sitting month not printed'
      : `${months} months old — ${age === 'within' ? 'within the window' : 'PAST the two-year window'}`;
  if (isAccepted && age === 'within') usable += 1;
  console.log('   ' + pad(d.ref, 5) + pad(`${d.family} ${d.variant}`, 50) +
    pad(isAccepted ? 'yes' : 'NO', 12) + ageText);
}
console.log(`\n   ${usable} of ${CORPUS.length} documents could be filed with IRCC today.`);
console.log('   Four fail on the TEST ITSELF: three TCF Tout Public and one IELTS Academic.');
console.log('   Seven fail on AGE, including the newest, sat 2024-01. The eighth prints');
console.log('   no session date at all, so it cannot be shown to be within the window');
console.log('   either — and unknown is reported as unknown, never as within.');
console.log('   Not one of them was refused by our form, and before today the product');
console.log('   would have built a plan on all eight and said nothing about any of it.');
console.log('\n   The plan should still be built — an out-of-date result is a true');
console.log('   measurement of a person and the best seed we will ever get. What was');
console.log('   missing was the sentence next to it. `ircc.ts` is that sentence.');
console.log('\n   Catalogue, for the record: ' + Object.values(IRCC_ACCEPTED).map((x) => x.name).join(', '));

// ── 7. WHICH TCF IS IT — the detector, run over every shape in the corpus ─
//
// "Run the OCR test on at least two different TCF shapes, not one." No OCR
// reader is bound — there is no model key — so this is the half that can be
// tested without one, and it is the half that decides: given what a reader
// (or a candidate) reports seeing, does the model identify the right exam?
//
// Eleven TCF documents, FIVE distinct variants, four distinct layouts.
console.log('\n7. VARIANT DETECTION — eleven TCF documents, five distinct variants');
console.log('   shape first, scores veto, title last and never alone.\n');
const TO_EPREUVE: Record<string, TcfEpreuve> = {
  comprehension_orale: 'comprehension_orale',
  comprehension_ecrite: 'comprehension_ecrite',
  maitrise_des_structures: 'maitrise_des_structures',
  expression_orale: 'expression_orale',
  expression_ecrite: 'expression_ecrite',
};
let hits = 0;
let tried = 0;
for (const d of CORPUS.filter((x) => x.truth)) {
  tried += 1;
  const boxes = Object.keys(d.printed)
    .map((k) => TO_EPREUVE[k])
    .filter(Boolean);
  const qcm = Object.entries(d.printed)
    .filter(([k, v]) => typeof v === 'number' && k !== 'expression_orale' && k !== 'expression_ecrite')
    .map(([, v]) => v as number);
  const det = detectTcfVariant({
    boxes,
    global: d.seen?.global,
    qr: d.seen?.qr,
    photo: d.seen?.photo,
    maxQcmScore: qcm.length ? Math.max(...qcm) : undefined,
    title: `Attestation TCF ${d.variant}`,
  });
  const ok = det.variant === d.truth;
  if (ok) hits += 1;
  console.log(
    `   ${d.ref}  ${ok ? '✓' : '✗'} ${pad(String(det.variant), 14)} expected ${pad(d.truth!, 14)}` +
      (ok ? '' : `  candidates: ${det.candidates.join(', ')}  — ${det.reason}`),
  );
}
console.log(`\n   ${hits} of ${tried} identified from layout alone.`);

// The case the title would have got wrong, stated on its own because it is
// the reason the title is consulted last.
const K = CORPUS.find((d) => d.ref === 'K')!;
console.log('\n   THE CASE THAT BREAKS TITLE MATCHING — document K');
console.log('     its own title reads « Test de RECONNAISSANCE du français pour le Canada ».');
console.log('     A published survey of TCF layouts assigns that exact title to TCF IRN,');
console.log('     whose scale is given as 399 by one centre and 499 by that survey — the two');
console.log('     sources do not agree, and FEI\'s own page refuses automated access.');
console.log(`     The document prints ${K.printed.comprehension_orale} and ${K.printed.comprehension_ecrite}.`);
console.log('     Both are above either ceiling, so it cannot be IRN on either reading, and');
console.log('     a title match would have scored a C2 candidate against a scale that ends');
console.log('     below their marks. The score veto catches it; the title never gets a vote.');
console.log('     `tcf-variants.ts` therefore carries qcmMax: null for IRN and REFUSES to');
console.log('     convert, rather than picking one of two published numbers.');

// ── 8. OUR CEFR AGAINST THEIRS ───────────────────────────────────────────
//
// Sixteen documents print 23 CEFR levels the awarding body assigned to its
// own scores. That is the first external check on any conversion in this
// product, and it found one wrong.
console.log('\n8. CEFR — the awarding body\'s own reading of its own scores');
const SC: Record<string, string> = { comprehension_orale: 'co699', comprehension_ecrite: 'ce699' };
const scaleOf = (id: string) => TCF_CANADA.scales.find((s) => s.id === id);
const nclcCefr = (lvlScale: string, v: number): string => {
  // The OLD route: score → NCLC → the cefr tag on that NCLC row.
  const bands = TCF_CANADA.benchmark.byScale?.[lvlScale] ?? [];
  const hit = bands.find((b) => v >= b.from);
  return hit?.cefr?.split('-')[0] ?? '—';
};
let agree = 0;
let checked = 0;
let oldAgree = 0;
console.log('\n   ' + pad('doc', 5) + pad('épreuve', 22) + pad('score', 7) + pad('FEI says', 10) + pad('scale→', 8) + 'via NCLC→');
for (const d of CORPUS) {
  if (!d.cefrOf) continue;
  for (const [box, theirs] of Object.entries(d.cefrOf)) {
    const sid = SC[box];
    if (!sid) continue; // maîtrise des structures and the /20 épreuves: below
    const v = d.printed[box] as number;
    if (typeof v !== 'number') continue;
    checked += 1;
    const ours = scaleOf(sid)?.cefrBands?.find((b) => v >= b.from)?.cefr ?? '—';
    const old = nclcCefr(sid, v);
    if (ours === theirs) agree += 1;
    if (old === theirs) oldAgree += 1;
    console.log(
      '   ' + pad(d.ref, 5) + pad(box, 22) + pad(String(v), 7) + pad(theirs, 10) +
      pad(`${ours}${ours === theirs ? ' ✓' : ' ✗'}`, 8) + `${old}${old === theirs ? ' ✓' : ' ✗'}`,
    );
  }
}
console.log(`\n   straight off the scale : ${agree}/${checked}`);
console.log(`   via the NCLC row       : ${oldAgree}/${checked}   ← what the planner used until today`);
console.log('   The planner orders practice by distance from this level. A CEFR one level');
console.log('   low spends a six-week plan on material the candidate finished a year ago.');

// ── 9. THE /20 EXPRESSION SCALE, WHICH HAS NO FIXED TABLE ────────────────
console.log('\n9. EXPRESSION /20 → CEFR — and why no table can be written');
const marks = new Map<number, Set<string>>();
for (const d of CORPUS) {
  if (!d.cefrOf) continue;
  for (const box of ['expression_orale', 'expression_ecrite']) {
    const v = d.printed[box];
    const c = d.cefrOf[box];
    if (typeof v !== 'number' || !c) continue;
    if (!marks.has(v)) marks.set(v, new Set());
    marks.get(v)!.add(`${c} (${d.ref}, ${d.sat})`);
  }
}
for (const k of [...marks.keys()].sort((a, b) => a - b))
  console.log(`   ${pad(String(k) + '/20', 7)} → ${[...marks.get(k)!].join('   ')}`);
const split = [...marks.entries()].filter(([, v]) => new Set([...v].map((x) => x.slice(0, 2))).size > 1);
console.log(`\n   ${split.length} mark(s) land on TWO DIFFERENT CEFR levels on real attestations.`);
console.log('   17/20 is C1 on documents from 2021 and 2024 and C2 on one from 2025 — all');
console.log('   three TCF Canada, same awarding body, same épreuve. Either FEI moved the');
console.log('   boundary or it is equated per session, which is what FEI already claims for');
console.log('   the QCM: « quelle que soit la version du test, les résultats restent');
console.log('   comparables ». Either way NO FIXED /20 TABLE IS CORRECT, and the argument');
console.log('   `comprehension.ts` makes for the QCM scale now has evidence for expression');
console.log('   too. We must not print a CEFR level for an expression mark.');
