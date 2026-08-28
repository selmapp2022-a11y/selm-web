import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Brain,
  CalendarDays,
  ChevronRight,
  Compass,
  Crown,
  ExternalLink,
  Flag,
  ScrollText,
  TrendingUp,
} from 'lucide-react';
import { api } from '../lib/api';
import { EmptyState, Loader } from '../components/States';
import { ProgressBar } from '../exam/components/SectionClock';
import { loadHistory, type SittingRecord } from '../exam/model/history';
import { PLAN_EVENT, daysUntil, loadPlan, type Plan } from '../exam/model/plan';
import { levelsShort, releaseGate } from '../exam/engine/aggregate';
import { governingLevel } from '../exam/engine/comprehension';
import { t } from '../exam/model/format';
import type {
  ComprehensionSection,
  ExamDefinition,
  Goal,
  SectionDefinition,
  SkillId,
} from '../exam/model/types';

/**
 * The dashboard, rebuilt 2026-08-27.
 *
 * What it replaced: `Level 16`, `76 / 200 XP`, a day-streak, four practice
 * tiles each with its own invented `Lv`, and the tagline ENGLISH, SIMPLY.
 * All of that measures activity. **A candidate with a booked TCF date in
 * seven weeks is not asking how active they have been.** They are asking one
 * question — am I going to hit the level I need, and if not, where am I
 * short — and the old screen could not answer it in any form.
 *
 * Three rules are carried from the exam engine and are NOT re-decided here:
 *
 *   1. Comprehension is counted; production is estimated. Two different
 *      kinds of number, each labelled as what it is, exactly as the results
 *      page labels them.
 *   2. The governing level is the LOWEST of the four, and it is withheld
 *      entirely while any skill is unknown. 8, 8, 8, 5 is a 5.
 *   3. The release gate decides whether any predicted number may be shown.
 *      It reads `calibration`, it currently refuses for every exam, and this
 *      page states the refusal rather than routing around it.
 *
 * The exam definitions are loaded with a dynamic `import()` on purpose. They
 * are 150 KB — nearly all of it the TCF item bank — and the application's
 * entry point has no business carrying the items of an exam it does not
 * render. Vite emits them as a chunk that the engine at `/exam.html` already
 * loads, so nothing is duplicated and nothing is downloaded twice.
 */

/** The engine is a second Vite entry point on the same origin, not a route. */
const EXAM_HOME = '/goal';
const EXAM_HISTORY = '/history';

/** Where a skill's own practice lives inside the application. */
const PRACTICE: Record<SkillId, string> = {
  listening: '/listening',
  reading: '/reading',
  writing: '/writing',
  speaking: '/speaking',
};

type Catalogue = { EXAMS: ExamDefinition[]; GOALS: Goal[] };

async function fetchVocabSummary() {
  try {
    const review = await api.get('/vocabulary/my/review').then((r) => r.data).catch(() => null);
    const dueCount = Array.isArray(review) ? review.length : (review?.words?.length || 0);
    return { dueCount };
  } catch { return { dueCount: 0 }; }
}

export default function DashboardPage() {
  const { data: vocab } = useQuery({ queryKey: ['vocab-sum'], queryFn: fetchVocabSummary });

  const [cat, setCat] = useState<Catalogue | null>(null);
  const [catFailed, setCatFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    import('../exam/definitions')
      .then((m) => { if (alive) setCat({ EXAMS: m.EXAMS, GOALS: m.GOALS }); })
      .catch(() => { if (alive) setCatFailed(true); });
    return () => { alive = false; };
  }, []);

  // The plan and the history both live in `localStorage`, written by the
  // engine. Re-read on focus as well as on the plan event: the candidate can
  // set their date in the engine, which is a different document, and come
  // back to a tab this one never re-rendered.
  const [plan, setPlan] = useState<Plan | null>(() => loadPlan());
  const [history, setHistory] = useState<SittingRecord[]>(() => loadHistory());
  useEffect(() => {
    const refresh = () => { setPlan(loadPlan()); setHistory(loadHistory()); };
    window.addEventListener(PLAN_EVENT, refresh);
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(PLAN_EVENT, refresh);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const goal = cat && plan ? cat.GOALS.find((g) => g.id === plan.goalId) : undefined;
  const exam = cat && plan ? cat.EXAMS.find((e) => e.id === plan.examId) : undefined;

  const mine = useMemo(
    () => (exam ? history.filter((h) => h.examId === exam.id) : []),
    [history, exam]
  );
  const latest = mine.length ? mine[mine.length - 1] : null;

  if (catFailed) {
    return (
      <EmptyState
        icon={Compass}
        title="The exam catalogue did not load"
        body="Your dashboard is built from it, so nothing is shown rather than something wrong. Reload the page; if it keeps failing you are probably offline."
        action={<a href={EXAM_HOME} className="btn-primary">Open the exam engine</a>}
      />
    );
  }
  if (!cat) return <Loader text="Loading your exam" />;

  // A candidate who has not set a destination is a real state, not an error.
  // The old dashboard would have shown them a level and a streak; this one
  // sends them to the one screen that makes everything else meaningful.
  if (!plan || !goal || !exam) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState
          icon={Compass}
          title="Where are you going, and what do you need?"
          body="The destination decides the score you need, and the exam is chosen from that. Set it once and this page can tell you whether you are on track."
          action={<a href={EXAM_HOME} className="btn-primary">Set your destination</a>}
        />
      </div>
    );
  }

  const left = daysUntil(plan.examDate);
  const gate = releaseGate(exam);
  const short = levelsShort(exam);
  const target = `${goal.system} ${goal.requiredLevel}`;

  // Every skill's benchmark level. Comprehension has none because the
  // official conversion is unpublished; production has none because the
  // release gate refuses. Four nulls is the honest state of both exams today,
  // and it is computed rather than written down so that the day one of them
  // produces a level, this page follows without being edited.
  const levels: Array<number | null> = exam.sections.map(() => null);
  const governing = governingLevel(levels);

  const weakest = weakestSection(exam, latest);
  const counted = exam.sections.filter((s) => s.kind === 'comprehension').length;

  // Both exams award four skills. Only the TCF definition carries all four
  // sections; IELTS General Training has writing and speaking built and its
  // two comprehension épreuves not yet authored. A page that lists two rows
  // under the heading "where you stand" and says nothing about the other two
  // is telling the candidate they have been measured on the whole exam.
  const missing = 4 - exam.sections.length;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* 1 ── destination, exam, and the number that governs the plan */}
      <header className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-[200px] flex-1">
            <span className="chip">{t(goal.destination.label, 'en')}</span>
            <h1 className="mt-3 font-display text-2xl font-bold text-navy sm:text-3xl">
              {t(exam.name, 'en')}
            </h1>
            <p className="mt-1 text-sm text-ink-secondary">
              {requirementLine(goal)}
            </p>
          </div>
          <div className="shrink-0 text-right">
            {left === null ? (
              <a href={EXAM_HOME} className="inline-flex items-center gap-2 rounded-xl bg-surface-muted px-3 py-2 text-sm font-medium text-ink-secondary hover:text-navy">
                <CalendarDays className="h-4 w-4" /> Set your exam date
              </a>
            ) : (
              <>
                <div className="font-display text-4xl font-bold tabular-nums text-navy">
                  {Math.abs(left)}
                </div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-secondary">
                  {left >= 0
                    ? `day${left === 1 ? '' : 's'} remaining`
                    : `day${left === -1 ? '' : 's'} ago`}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <a href={EXAM_HOME} className="text-xs font-medium text-teal hover:underline">
            Change destination, exam or date
          </a>
        </div>
      </header>

      {/* 2 ── the four skills, and which kind of number each one is */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-xl font-bold text-navy">Where you stand</h2>
          <span className="text-xs text-ink-secondary">Target: {target} in every skill</span>
        </div>

        <div className="card divide-y divide-surface-divider">
          {exam.sections.map((s) => (
            <SkillRow key={s.id} section={s} record={latest} target={target} />
          ))}
        </div>

        {counted > 0 ? (
          <p className="text-xs leading-relaxed text-ink-secondary">
            Comprehension is <strong>counted</strong> — an exact number of correct answers against
            our own item bank. Production is <strong>estimated</strong>, and no estimate is
            published for it yet. The two are not the same kind of number and are never added
            together.
          </p>
        ) : (
          <p className="text-xs leading-relaxed text-ink-secondary">
            Every section of this exam is <strong>production</strong> — writing and speaking — which
            is estimated rather than counted, and no estimate is published for it yet.
          </p>
        )}

        {missing > 0 && (
          <p className="rounded-xl bg-surface-muted px-4 py-3 text-xs leading-relaxed text-ink-secondary">
            {t(exam.name, 'en')} awards four skills. This product has {exam.sections.length} of them
            built, so {missing === 1 ? 'the fourth is' : `the other ${missing} are`} not shown here —
            not as a zero, and not as an estimate. Your real sitting will still be scored on all
            four, and the lowest of those four is what your destination reads.
          </p>
        )}
      </section>

      {/* 3 ── the decision, stated against the evidence rather than as a verdict */}
      <section className="space-y-3">
        <h2 className="font-display text-xl font-bold text-navy">Are you ready to book?</h2>
        <div className="card p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-navy to-teal text-white shadow-md">
              <Flag className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-2xl font-bold text-navy">
                {gate.publishNumeric && governing.complete
                  ? `${exam.benchmark.system} ${governing.level}`
                  : 'Not yet answerable'}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-ink-secondary">{t(gate.reason, 'en')}</p>
              {!governing.complete && (
                <p className="mt-2 text-xs leading-relaxed text-ink-secondary">
                  {goal.destination.requirement === 'overall'
                    ? 'This destination reads an aggregate, so a weak skill can be carried — but an aggregate still needs every skill to have a number, and not all of them do.'
                    : 'The lowest of your four skills is the one that counts, not the average — a candidate at 8, 8, 8 and 5 is at 5. No overall level is shown here while any skill is unknown, because taking the lowest of the ones that do have a number would show you a better result than you hold.'}
                </p>
              )}
              {/* The per-level shortfall is expressed in the exam's benchmark
                  system — CLB, NCLC. To a candidate bound for Australia,
                  whose requirement is set on the IELTS band scale, a list of
                  CLB levels is a Canadian instrument appearing on a page it
                  has no business being on. The count is already stated above
                  in `gate.reason`; only the breakdown is withheld. */}
              {short.length > 0 && !goal.scaleId && (
                <ul className="mt-3 space-y-1 text-xs text-ink-secondary">
                  {short.map((r) => (
                    <li key={r.level} className="tabular-nums">
                      {exam.benchmark.system} {r.level}: {r.have} of {r.need} score reports collected
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* A3 — surfaces that belong to the destination, not to the product.
            An Australian candidate sees neither of these, because the
            destination declares neither. */}
        {goal.destination.surfaces.length > 0 && (
          <div className="grid gap-2 sm:grid-cols-2">
            {goal.destination.surfaces.map((sf) => (
              <a
                key={sf.id}
                href={sf.href}
                target="_blank"
                rel="noreferrer"
                className="card flex items-center gap-3 p-4 hover:shadow-cardHover"
              >
                <ScrollText className="h-5 w-5 shrink-0 text-teal" />
                <span className="flex-1 text-sm font-medium text-navy">{t(sf.label, 'en')}</span>
                <ExternalLink className="h-4 w-4 text-ink-secondary" />
              </a>
            ))}
          </div>
        )}
      </section>

      {/* 4 ── the weakest skill, and one thing to do about it */}
      <section className="space-y-3">
        <h2 className="font-display text-xl font-bold text-navy">Your weakest skill</h2>
        {weakest ? (
          <div className="card flex flex-wrap items-center gap-4 p-5">
            <div className="min-w-[150px] flex-1">
              <div className="font-display text-lg font-bold text-navy">
                {t(weakest.section.name, 'en')}
              </div>
              <div className="text-xs text-ink-secondary">
                {weakest.correct} of {weakest.total} correct in your last sitting
              </div>
            </div>
            <Link to={PRACTICE[weakest.section.skill]} className="btn-primary shrink-0">
              Practise {t(weakest.section.name, 'en').toLowerCase()}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="card p-5 text-sm text-ink-secondary">
            Nothing to name yet — no sitting has been completed, so there is no measured weakest
            skill. Guessing one from practice activity would be an invented answer.
          </div>
        )}
      </section>

      {/* 5 ── the primary action. Before today the exam engine was not
              reachable from anywhere inside the signed-in application. */}
      <a href={EXAM_HOME} className="btn-primary w-full justify-center py-4 text-base">
        Sit a full mock exam — {exam.sections.length} sections
        <ChevronRight className="h-5 w-5" />
      </a>

      {/* 6 ── history */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-display text-xl font-bold text-navy">Your sittings</h2>
          {mine.length > 0 && (
            <a href={EXAM_HISTORY} className="text-xs font-medium text-teal hover:underline">
              See all {mine.length}
            </a>
          )}
        </div>
        {mine.length === 0 ? (
          <div className="card flex items-center gap-4 p-5 text-sm text-ink-secondary">
            <TrendingUp className="h-5 w-5 shrink-0 text-ink-secondary" />
            No sittings yet. The line starts at your first one.
          </div>
        ) : (
          <div className="card divide-y divide-surface-divider">
            {mine.slice(-4).reverse().map((r) => (
              <div key={r.finishedAt} className="space-y-2 px-5 py-4">
                <div className="text-xs font-semibold text-ink-secondary">
                  {new Date(r.finishedAt).toLocaleDateString()}
                </div>
                {exam.sections.map((s) => {
                  const v = r.skills[s.id];
                  if (!v) return null;
                  return (
                    <div key={s.id} className="flex items-center gap-3">
                      <span className="w-24 shrink-0 truncate text-xs text-ink-secondary sm:w-44">
                        {t(s.name, 'en')}
                      </span>
                      <div className="flex-1"><ProgressBar value={v.correct} total={v.total} /></div>
                      <span className="w-12 shrink-0 text-right text-xs tabular-nums text-ink-secondary">
                        {v.correct}/{v.total}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Vocabulary — kept, demoted. It has an exam analogue; it is simply
          not what the candidate came for. */}
      <Link to="/vocabulary" className="card flex items-center gap-4 p-5 hover:shadow-cardHover">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
          <Brain className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="font-display font-bold text-navy">Vocabulary</div>
          <div className="text-xs text-ink-secondary">
            {vocab?.dueCount ? `${vocab.dueCount} cards due for review` : 'Review and add new words'}
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-ink-secondary" />
      </Link>

      {/* Upgrade to SELM Pro. This is the primary in-app entry point to the
          paywall and it stays on the dashboard: Apple's App Review has to be
          able to find the In-App Purchases without hunting through menus. */}
      <Link
        to="/upgrade"
        className="card flex items-center gap-4 overflow-hidden bg-gradient-to-br from-teal-500 to-teal-700 p-5 text-white shadow-cardHover"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
          <Crown className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <div className="font-display text-lg font-bold">Upgrade to SELM Pro</div>
          <div className="text-xs text-white/80">Unlimited AI coaching · 7-day free trial</div>
        </div>
        <ChevronRight className="h-5 w-5 text-white/90" />
      </Link>
    </div>
  );
}

/** How this destination reads the result, in the candidate's own terms. */
function requirementLine(goal: Goal): string {
  const target = `${goal.system} ${goal.requiredLevel}`;
  switch (goal.destination.requirement) {
    case 'overall':
      return `${t(goal.label, 'en')} · an overall ${target}`;
    case 'both':
      return `${t(goal.label, 'en')} · an overall ${target}, with a floor in every skill`;
    default:
      return `${t(goal.label, 'en')} · ${target} in every skill, and the lowest one governs`;
  }
}

/**
 * The weakest skill, measured rather than guessed.
 *
 * Only comprehension sections can answer this today, because they are the
 * only ones with a number. A production section with no scorer bound is not
 * "weak" — it is unmeasured, and calling it weakest would be an invention.
 */
function weakestSection(
  exam: ExamDefinition,
  record: SittingRecord | null
): { section: ComprehensionSection; correct: number; total: number } | null {
  if (!record) return null;
  let best: { section: ComprehensionSection; correct: number; total: number } | null = null;
  for (const s of exam.sections) {
    if (s.kind !== 'comprehension') continue;
    const v = record.skills[s.id];
    if (!v || v.total === 0) continue;
    if (!best || v.correct / v.total < best.correct / best.total) {
      best = { section: s, correct: v.correct, total: v.total };
    }
  }
  return best;
}

/**
 * One skill, with the kind of number it produces stated on the row.
 *
 * The two chips are the ones the sitting-result page already uses — teal
 * `counted`, amber `not scored` — because a candidate who sees "counted" on
 * their result and something else here has been shown two vocabularies for
 * one idea.
 */
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

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
      <div className="min-w-[150px] flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-display font-bold text-navy">{t(section.name, 'en')}</span>
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
