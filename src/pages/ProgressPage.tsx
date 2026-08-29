import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Headphones, BookOpen, Mic, PenLine, Brain } from 'lucide-react';
import { StandingRows, StandingNote, NotBuiltNote } from '../components/Standing';
import { ATTEMPTS_EVENT, attemptsBySkill, getAttempts, type SkillKey } from '../lib/attempts';
import { loadHistory, type SittingRecord } from '../exam/model/history';
import { PLAN_EVENT, loadPlan, daysUntil } from '../exam/model/plan';
import { loadAttestations, ATTESTATION_EVENT } from '../exam/model/attestationStore';
import { buildPlan } from '../exam/engine/planner';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { fmtDate, fmtMonth, useUiLangValue } from '../i18n';
import { t } from '../exam/model/format';
import type { ExamDefinition, Goal, SkillId } from '../exam/model/types';
import type { Attestation } from '../exam/model/attestation';

/**
 * Progress, rebuilt 2026-08-29.
 *
 * What it replaced: `Level 16`, `3076 XP`, a day streak, a longest streak,
 * `11/18 BADGES`, eighteen achievements, `English Champion`, and four skill
 * cards each carrying an invented `Lv` and a rank of `Master` or `Apprentice`.
 *
 * **Two products with two philosophies were sitting behind one navigation
 * bar.** Today says no number is published for any production skill because
 * the conversion is not published; Progress awarded Level 16 for turning up.
 * The scoreboard was removed rather than renamed — softening `Level 16` to
 * `Activity 16` would have kept the number and lost only the honesty.
 *
 * This page answers the same question Today answers, over time instead of now.
 */

const SKILL_ICON: Record<SkillKey, any> = {
  listening: Headphones, reading: BookOpen, speaking: Mic, writing: PenLine, vocabulary: Brain,
};

const SKILL_LABEL: Record<SkillKey, string> = {
  listening: 'Listening', reading: 'Reading', speaking: 'Speaking', writing: 'Writing', vocabulary: 'Vocabulary',
};

const PRACTICE: Record<SkillId, string> = {
  listening: '/listening', reading: '/reading', writing: '/writing', speaking: '/speaking',
};

type Catalogue = { EXAMS: ExamDefinition[]; GOALS: Goal[] };

export default function ProgressPage() {
  useDocumentTitle('Progress');
  // Re-render when the candidate switches interface language, so the dates
  // below follow the language they chose rather than the one they last saw.
  useUiLangValue();

  const [cat, setCat] = useState<Catalogue | null>(null);
  const [plan, setPlan] = useState(() => loadPlan());
  const [history, setHistory] = useState<SittingRecord[]>(() => loadHistory());
  const [attestations, setAttestations] = useState<Attestation[]>(() => loadAttestations());
  const [attempts, setAttempts] = useState(() => getAttempts());

  useEffect(() => {
    let alive = true;
    import('../exam/definitions').then((m) => {
      if (alive) setCat({ EXAMS: m.EXAMS, GOALS: m.GOALS });
    });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const refresh = () => {
      setPlan(loadPlan());
      setHistory(loadHistory());
      setAttestations(loadAttestations());
      setAttempts(getAttempts());
    };
    window.addEventListener(ATTEMPTS_EVENT, refresh);
    window.addEventListener(PLAN_EVENT, refresh);
    window.addEventListener(ATTESTATION_EVENT, refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener(ATTEMPTS_EVENT, refresh);
      window.removeEventListener(PLAN_EVENT, refresh);
      window.removeEventListener(ATTESTATION_EVENT, refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  const exam = cat && plan?.examId ? cat.EXAMS.find((e) => e.id === plan.examId) ?? null : null;
  const goal = cat && plan?.goalId ? cat.GOALS.find((g) => g.id === plan.goalId) ?? null : null;
  const target = goal ? `${goal.system} ${goal.requiredLevel}` : null;

  const mine = useMemo(
    () => (exam ? history.filter((h) => h.examId === exam.id) : []),
    [history, exam],
  );
  const myAttestations = useMemo(
    () => (exam ? attestations.filter((a) => a.examId === exam.id).sort((a, b) => (a.sat < b.sat ? -1 : 1)) : []),
    [attestations, exam],
  );
  const bySkill = useMemo(() => attemptsBySkill(attempts), [attempts]);

  const header = (
    <div>
      <h1 className="font-display text-3xl font-bold text-navy">Progress</h1>
      <p className="mt-1 text-ink-secondary">
        What you have done, and whether the line is moving.
      </p>
    </div>
  );

  if (!plan || !exam || !goal || !target) {
    return (
      <div className="space-y-6">
        {header}
        <div className="card p-6">
          <p className="text-sm text-ink-primary">
            Choose your exam and destination, and this page can show what your practice is for.
            Until then there is nothing here to measure against — and a page that filled the space
            anyway is exactly what this one replaced.
          </p>
          <Link to="/goal" className="btn-primary mt-4 inline-block">Choose my exam</Link>
        </div>
      </div>
    );
  }

  const left = daysUntil(plan.examDate);
  const built = buildPlan({
    exam,
    attestation: myAttestations[myAttestations.length - 1] ?? null,
    target: goal.requiredLevel,
    daysLeft: left,
  });

  // A coordinate the planner can emit that the candidate has never worked on.
  // Matched by the label the planner itself prints, which is the same string
  // `CompletionCard` records as a topic — so this is a real join, not a guess.
  const touched = new Set(attempts.map((a) => a.topic).filter(Boolean) as string[]);
  const untouched = built.slots.filter((s) => !touched.has(s.coordinate.label));

  const latest = mine.length ? mine[mine.length - 1] : null;

  return (
    <div className="space-y-8">
      {header}

      {/* 1 ── score over time */}
      <section className="space-y-3">
        <h2 className="font-display text-xl font-bold text-navy">Score over time</h2>

        {/* Real results the candidate entered, on the exam's own scale, with
            the target drawn — because IRCC publishes the score→benchmark
            table and this exam definition carries it. */}
        <RealResults exam={exam} goal={goal} rows={myAttestations} />

        {/* Practice sittings are a SEPARATE series and are never plotted on
            the same axis. A practice sitting produces a count of correct
            answers and the CEFR band that count held; it does not produce a
            score on the exam's published scale, because the conversion from
            correct answers to that scale is not published — this product says
            so on every results page and must not quietly assume one here. */}
        <PracticeSittings exam={exam} rows={mine} target={target} />
      </section>

      {/* 2 ── attempts */}
      <section className="space-y-3">
        <h2 className="font-display text-xl font-bold text-navy">Attempts</h2>
        <p className="text-xs leading-relaxed text-ink-secondary">
          How much work you have done, and when. <strong>Counting attempts is not the same as
          awarding points for them</strong> — this is a record of what happened, not a score for
          having turned up.
        </p>
        <div className="card divide-y divide-surface-divider">
          {(['listening', 'reading', 'writing', 'speaking'] as SkillKey[]).map((k) => {
            const row = bySkill[k];
            const Icon = SKILL_ICON[k];
            return (
              <div key={k} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
                <div className="flex min-w-[150px] flex-1 items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0 text-ink-secondary" />
                  <span className="font-display font-bold text-navy">{SKILL_LABEL[k]}</span>
                </div>
                <div className="min-w-[120px] flex-1 text-sm tabular-nums text-ink-secondary">
                  {row.count === 0 ? 'None yet' : `${row.count} attempt${row.count === 1 ? '' : 's'}`}
                  {row.lastAt !== null && (
                    <span className="ml-2 text-xs">last {fmtDate(row.lastAt)}</span>
                  )}
                </div>
                <Link to={PRACTICE[k as SkillId] ?? '/practice'} className="text-sm font-medium text-teal hover:underline">
                  {row.count === 0 ? 'Start' : 'Continue'}
                </Link>
              </div>
            );
          })}
        </div>
        {bySkill.vocabulary.count > 0 && (
          <p className="text-xs text-ink-secondary">
            Vocabulary: {bySkill.vocabulary.count} review{bySkill.vocabulary.count === 1 ? '' : 's'}.
            It supports the four skills and is not one of them.
          </p>
        )}
      </section>

      {/* 3 ── where you stand: the same rows as Today, from the same component */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-xl font-bold text-navy">Where you stand</h2>
          <span className="text-xs text-ink-secondary">Target: {target} in every skill</span>
        </div>
        <StandingRows exam={exam} record={latest} target={target} />
        <StandingNote exam={exam} />
        <NotBuiltNote exam={exam} />
      </section>

      {/* 4 ── the gap */}
      <section className="space-y-3">
        <h2 className="font-display text-xl font-bold text-navy">What you have not practised yet</h2>
        {untouched.length === 0 ? (
          <div className="card p-6 text-sm text-ink-secondary">
            Every part of your plan has been attempted at least once.
          </div>
        ) : (
          <>
            <p className="text-xs leading-relaxed text-ink-secondary">
              An untouched part of the exam predicts a low governing level better than a low score
              on a part you have practised does. These are the {untouched.length} you have not
              opened.
            </p>
            <div className="card divide-y divide-surface-divider">
              {untouched.slice(0, 12).map((s) => (
                <div key={s.coordinate.label} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3">
                  <div className="min-w-[180px] flex-1">
                    <div className="text-sm font-semibold text-navy">{s.coordinate.label}</div>
                    <div className="text-xs text-ink-secondary">
                      {SKILL_LABEL[s.coordinate.skill as SkillKey]}
                      {s.items === 0 && ' · nothing is authored behind this yet'}
                    </div>
                  </div>
                  {s.items > 0 ? (
                    <Link to={PRACTICE[s.coordinate.skill] ?? '/practice'} className="text-sm font-medium text-teal hover:underline">
                      Open
                    </Link>
                  ) : (
                    <span className="text-xs text-ink-secondary">not built</span>
                  )}
                </div>
              ))}
            </div>
            {untouched.length > 12 && (
              <p className="text-xs text-ink-secondary">and {untouched.length - 12} more.</p>
            )}
          </>
        )}
      </section>
    </div>
  );
}

/**
 * Results from real sittings the candidate entered.
 *
 * Plotted on the benchmark the awarding body reports, with the target drawn as
 * a line — legitimate here and only here, because the score→benchmark table is
 * published by IRCC and carried in the exam definition. Nothing is converted.
 */
function RealResults({ exam, goal, rows }: { exam: ExamDefinition; goal: Goal; rows: Attestation[] }) {
  const skills: SkillId[] = ['listening', 'reading', 'writing', 'speaking'];
  const points = skills.map((k) => ({
    skill: k,
    series: rows
      .map((r) => ({ at: fmtMonth(r.sat), value: r.benchmark?.[k] ?? null }))
      .filter((p) => typeof p.value === 'number') as Array<{ at: string; value: number }>,
  }));
  const any = points.some((p) => p.series.length > 0);

  if (!any) {
    return (
      <div className="card p-6">
        <div className="text-sm font-semibold text-navy">No real result entered yet</div>
        <p className="mt-1 text-xs leading-relaxed text-ink-secondary">
          A line needs points. Enter a past {t(exam.name, 'en')} score report and this shows your
          {' '}{goal.system} level per skill against the {goal.system} {goal.requiredLevel} you need.
        </p>
        <Link to="/goal" className="btn-secondary mt-3 inline-block">Enter a past result</Link>
      </div>
    );
  }

  return (
    <div className="card space-y-4 p-5">
      <div className="text-sm font-semibold text-navy">Your entered results · {goal.system}</div>
      {points.filter((p) => p.series.length > 0).map((p) => (
        <Series
          key={p.skill}
          label={SKILL_LABEL[p.skill as SkillKey]}
          series={p.series}
          target={goal.requiredLevel}
          max={12}
        />
      ))}
      {points.every((p) => p.series.length < 2) && (
        <p className="text-xs leading-relaxed text-ink-secondary">
          One result is a point, not a trend. A second entered result is what makes this a line.
        </p>
      )}
    </div>
  );
}

/**
 * Practice sittings — the band held, over time.
 *
 * No target line. The band a practice sitting holds is CEFR; the target is
 * NCLC or CLB; and the bridge between them is printed by the awarding body but
 * explicitly not used to compute anything in this codebase. Drawing the line
 * would be performing that conversion in a chart instead of in a function,
 * which is the same act with less scrutiny.
 */
function PracticeSittings({ exam, rows, target }: { exam: ExamDefinition; rows: SittingRecord[]; target: string }) {
  const BANDS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const counted = exam.sections.filter((s) => s.kind === 'comprehension');

  if (rows.length < 2) {
    return (
      <div className="card p-6">
        <div className="text-sm font-semibold text-navy">
          {rows.length === 0 ? 'No practice sitting yet' : 'One practice sitting so far'}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-ink-secondary">
          {rows.length === 0
            ? 'This chart needs two sittings before it can show anything. It is left empty rather than filled with a number that would only be measuring how often you opened the app.'
            : 'A second sitting is what turns a point into a line. Until then there is nothing here to draw, and drawing something anyway would be inventing a trend.'}
        </p>
        <Link to="/exam" className="btn-secondary mt-3 inline-block">Take a mock exam</Link>
      </div>
    );
  }

  return (
    <div className="card space-y-4 p-5">
      <div className="text-sm font-semibold text-navy">Practice sittings · band held</div>
      {counted.map((s) => {
        const series = rows
          .map((r) => {
            const v = r.skills[s.id];
            const held = v?.held ?? null;
            const idx = held ? BANDS.indexOf(held) : -1;
            return idx >= 0 ? { at: fmtDate(r.finishedAt), value: idx + 1 } : null;
          })
          .filter(Boolean) as Array<{ at: string; value: number }>;
        if (series.length < 2) return null;
        return (
          <Series
            key={s.id}
            label={t(s.name, 'en')}
            series={series}
            max={6}
            format={(v) => BANDS[v - 1] ?? '—'}
          />
        );
      })}
      <p className="text-xs leading-relaxed text-ink-secondary">
        This is the CEFR band each sitting held. It is <strong>not</strong> plotted against your{' '}
        {target} target: a practice sitting produces a count of correct answers, and the conversion
        from that count to the exam's published scale is not released by the awarding body. A target
        line here would be a conversion drawn rather than computed.
      </p>
    </div>
  );
}

/** One skill's line. Small, honest, and readable without a legend. */
function Series({
  label, series, target, max, format,
}: {
  label: string;
  series: Array<{ at: string; value: number }>;
  target?: number;
  max: number;
  format?: (v: number) => string;
}) {
  const W = 260;
  const H = 56;
  const n = series.length;
  const x = (i: number) => (n === 1 ? W / 2 : (i / (n - 1)) * (W - 12) + 6);
  const y = (v: number) => H - 6 - (Math.min(v, max) / max) * (H - 12);
  const path = series.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  const last = series[n - 1];

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="min-w-[110px] text-sm font-semibold text-navy">{label}</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-14 w-full max-w-[260px] flex-1" role="img"
           aria-label={`${label}: ${series.map((p) => `${p.at} ${format ? format(p.value) : p.value}`).join(', ')}`}>
        {typeof target === 'number' && (
          <line x1={0} x2={W} y1={y(target)} y2={y(target)} className="stroke-amber-500" strokeWidth={1} strokeDasharray="4 3" />
        )}
        <path d={path} fill="none" className="stroke-teal" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {series.map((p, i) => (
          <circle key={i} cx={x(i)} cy={y(p.value)} r={3} className="fill-teal" />
        ))}
      </svg>
      <div className="min-w-[90px] text-right text-sm tabular-nums text-ink-secondary">
        <span className="font-bold text-navy">{format ? format(last.value) : last.value}</span>
        <div className="text-[11px]">{last.at}</div>
      </div>
    </div>
  );
}
