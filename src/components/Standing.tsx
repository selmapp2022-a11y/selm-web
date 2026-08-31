import { ProgressBar } from '../exam/components/SectionClock';
import { Rich } from '../i18n/Rich';
import { lookFor } from '../lib/skillLook';
import { t } from '../exam/model/format';
import type { SittingRecord } from '../exam/model/history';
import type { ExamDefinition, SectionDefinition } from '../exam/model/types';

/**
 * "Where you stand" — one component, rendered on both Today and Progress.
 *
 * It was a private function inside `DashboardPage` until 2026-08-29. Progress
 * needs the same four rows, and the alternative to sharing them is two pieces
 * of code that answer the same question and can disagree. **One truth stated
 * in one way** is the rule the ruling set; this file is what enforces it.
 *
 * Three things are carried from the engine and are NOT re-decided here:
 * comprehension is counted and production is estimated; the governing level is
 * the lowest of the four and is withheld entirely while any is unknown; and no
 * predicted number is shown while the release gate refuses.
 */
export function StandingRows({
  exam,
  record,
  target,
}: {
  exam: ExamDefinition;
  record: SittingRecord | null;
  target: string;
}) {
  return (
    <div className="card divide-y divide-surface-divider">
      {exam.sections.map((s) => (
        <SkillRow key={s.id} section={s} record={record} target={target} />
      ))}
    </div>
  );
}

/**
 * The sentence under the rows that says which kind of number each one is.
 * Shared for the same reason the rows are.
 */
export function StandingNote({ exam }: { exam: ExamDefinition }) {
  const counted = exam.sections.filter((s) => s.kind === 'comprehension').length;
  return counted > 0 ? (
    <p className="text-xs leading-relaxed text-ink-secondary">
      <Rich k="standing.counted" />
    </p>
  ) : (
    <p className="text-xs leading-relaxed text-ink-secondary">
      <Rich k="standing.allProduction" />
    </p>
  );
}

/**
 * The skills this exam awards that this product has not built.
 *
 * Stated as a count of what is missing, never as a zero and never as an
 * estimate: a page that lists two rows under "where you stand" and says
 * nothing about the other two is telling the candidate they have been
 * measured on the whole exam.
 */
export function NotBuiltNote({ exam }: { exam: ExamDefinition }) {
  const missing = 4 - exam.sections.length;
  if (missing <= 0) return null;
  return (
    <p className="rounded-xl bg-surface-muted px-4 py-3 text-xs leading-relaxed text-ink-secondary">
      {t(exam.name, 'en')} awards four skills. This product has {exam.sections.length} of them
      built, so {missing === 1 ? 'the fourth is' : `the other ${missing} are`} not shown here — not
      as a zero, and not as an estimate. Your real sitting will still be scored on all four, and the
      lowest of those four is what your destination reads.
    </p>
  );
}

function SkillRow({
  section,
  record,
  target,
}: {
  section: SectionDefinition;
  record: SittingRecord | null;
  target: string;
}) {
  const counted = section.kind === 'comprehension';
  const v = record ? record.skills[section.id] : null;
  // One hue per skill, the same hue everywhere that skill appears. See
  // `lib/skillLook.ts` for why colour came back after the standardisation.
  const look = lookFor((section as { skill?: string }).skill);
  const Icon = look.icon;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm ${look.tile}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-[150px] flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-display font-bold text-navy dark:text-white">{t(section.name, 'en')}</span>
          {counted ? (
            <span className="rounded-full bg-teal/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-teal">
              counted
            </span>
          ) : (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-700">
              not scored
            </span>
          )}
        </div>
        <div className="mt-1 text-xs text-ink-secondary">
          {counted
            ? v
              ? `Held through ${v.held ?? '—'}`
              : 'Not sat yet'
            : 'No calibrated scorer is bound to this section'}
        </div>
      </div>

      <div className="min-w-[140px] flex-1">
        {counted && v ? (
          <>
            <ProgressBar value={v.correct} total={v.total} />
            <div className="mt-1 flex flex-col gap-0.5 text-[11px] tabular-nums text-ink-secondary sm:flex-row sm:justify-between">
              <span>{v.correct}/{v.total} correct</span>
              {/* The target is stated, and deliberately not drawn as a mark on
                  this bar. The bar counts items; the target is a benchmark
                  level, and the conversion between them is not published by
                  the awarding body. Placing a mark would be drawing a
                  conversion we do not have. */}
              <span>needs {target}</span>
            </div>
          </>
        ) : (
          <div className="text-xs text-ink-secondary">
            {counted ? `Needs ${target}` : `Needs ${target} — no number is published for this skill`}
          </div>
        )}
      </div>
    </div>
  );
}
