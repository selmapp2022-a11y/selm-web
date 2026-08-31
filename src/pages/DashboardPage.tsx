import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  ChevronRight,
  Compass,
  Crown,
  Flag,
  ScrollText,
} from 'lucide-react';
import { EmptyState, Loader } from '../components/States';
import { StandingRows } from '../components/Standing';
import { SectionHeading } from '../components/SectionHeading';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { loadHistory, type SittingRecord } from '../exam/model/history';
import { PLAN_EVENT, daysUntil, loadPlan, type Plan } from '../exam/model/plan';
import { releaseGate } from '../exam/engine/aggregate';
import { buildPlan, type Coordinate } from '../exam/engine/planner';
import { loadAttestations } from '../exam/model/attestationStore';
import OnboardingPage from './OnboardingPage';
import { governingLevel } from '../exam/engine/comprehension';
import { t } from '../exam/model/format';
import type {
  ExamDefinition,
  Goal,
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
const EXAM_HOME = '/me';

/** Where a skill's own practice lives inside the application. */
const PRACTICE: Record<SkillId, string> = {
  listening: '/practice/listening',
  reading: '/practice/reading',
  writing: '/practice/writing',
  speaking: '/practice/speaking',
};

/**
 * WHERE "DO THIS NEXT" ACTUALLY GOES.
 *
 * The card names a coordinate — `exposé · B2` — and until 31 August its button
 * went to the generic `/practice/listening`, which serves whatever the pool
 * draws. The IA audit called this **the worst defect it found**, and the
 * ruling agreed: *"the card names an item and delivers a different screen. It
 * must open the named item."*
 *
 * It was found again by WALKING the deployed app rather than reading the
 * router, which is the condition the ruling attached to this whole phase.
 *
 * A task coordinate has no query to carry — the writing and speaking pages
 * serve the exam's tasks in order — so only a family coordinate gets one.
 */
function practiceHref(c: Coordinate): string {
  const base = PRACTICE[c.skill];
  if (c.kind !== 'family') return base;
  return `${base}?family=${encodeURIComponent(c.family)}&level=${encodeURIComponent(c.level)}`;
}

type Catalogue = { EXAMS: ExamDefinition[]; GOALS: Goal[] };

export default function DashboardPage() {
  useDocumentTitle('Today');

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
  // IA §4 & §6: when there is no plan, Today IS the entry flow — the onboarding
  // rendered in place, in the same app and router, not a prompt pointing away.
  if (!plan || !goal || !exam) {
    return <OnboardingPage />;
  }

  const left = daysUntil(plan.examDate);
  const gate = releaseGate(exam);
  const target = `${goal.system} ${goal.requiredLevel}`;

  // Every skill's benchmark level. Comprehension has none because the
  // official conversion is unpublished; production has none because the
  // release gate refuses. Four nulls is the honest state of both exams today,
  // and it is computed rather than written down so that the day one of them
  // produces a level, this page follows without being edited.
  const levels: Array<number | null> = exam.sections.map(() => null);
  const governing = governingLevel(levels);

  // IA §4 item 2 — the next thing, from the plan. The planner orders slots
  // worst-first; the first one with content behind it is where to go now.
  const attestation = loadAttestations().filter((a) => a.examId === exam.id).sort((a, b) => (a.sat < b.sat ? 1 : -1))[0] ?? null;
  const builtPlan = buildPlan({ exam, attestation, target: goal.requiredLevel, targetScaleId: goal.scaleId, daysLeft: left });
  const nextSlot = builtPlan.slots.find((sl) => sl.items > 0) ?? builtPlan.slots[0] ?? null;
  const nextSkill = nextSlot?.coordinate.skill ?? null;


  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* 1 ── where you are going. The page's own name leads, because the
              navigation calls this screen Today and a page whose heading is a
              different word reads as an app assembled rather than designed.
              The countdown is the hero: it is the one number on this product
              that is both certain and the reason the candidate is here. */}
      <header className="space-y-4">
        <h1 className="font-display text-3xl font-bold text-navy">Today</h1>

        <div className="card overflow-hidden p-0">
          <div className="flex flex-wrap items-stretch">
            <div className="min-w-[220px] flex-1 p-6">
              <span className="chip">{t(goal.destination.label, 'en')}</span>
              <h2 className="mt-3 font-display text-2xl font-bold text-navy">
                {t(exam.name, 'en')}
              </h2>
              <p className="mt-1 text-sm text-ink-secondary">
                {requirementLine(goal)}
              </p>
              <a href={EXAM_HOME} className="mt-3 inline-block text-xs font-medium text-teal hover:underline">
                Change exam, destination or date
              </a>
            </div>

            <div className="flex min-w-[180px] flex-col items-center justify-center bg-gradient-to-br from-navy to-teal px-8 py-6 text-white">
              {left === null ? (
                <>
                  <CalendarDays className="h-7 w-7 opacity-90" />
                  <div className="mt-2 text-center text-sm font-semibold">No exam date set</div>
                  <a href={EXAM_HOME} className="mt-1 text-xs underline opacity-90">Set one</a>
                </>
              ) : (
                <>
                  <div className="font-display text-6xl font-bold leading-none tabular-nums">
                    {Math.abs(left)}
                  </div>
                  <div className="mt-2 text-center text-[11px] font-semibold uppercase tracking-widest opacity-90">
                    {left >= 0
                      ? `day${left === 1 ? '' : 's'} until your exam`
                      : `day${left === -1 ? '' : 's'} since your exam`}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 2 ── the next thing, from the plan: one button, straight into it (IA §4) */}
      <section className="card relative overflow-hidden border-l-4 border-l-teal p-6">
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-teal/10" />
        <div className="relative flex items-center gap-2 text-sm font-semibold text-teal">
          <Compass className="h-4 w-4" /> Do this next
        </div>
        {nextSlot && nextSkill ? (
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <div className="min-w-[180px] flex-1">
              <div className="font-display text-2xl font-bold text-navy dark:text-white">{nextSlot.coordinate.label}</div>
              <div className="mt-0.5 text-xs text-ink-secondary">
                {builtPlan.basis === 'attestation'
                  ? 'Your weakest skill first — this is what moves your governing level.'
                  : 'Your plan is in exam order until you enter a past result.'}
              </div>
            </div>
            <Link to={practiceHref(nextSlot.coordinate)} className="btn-primary shrink-0">
              Start now
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-3 flex flex-wrap items-center gap-4">
            {/* D6 — a "Go to Practice" button sat here, and Practice is a tab
                on this same screen. The sentence tells the candidate what to
                do; the tab bar is how they do it. A button that duplicates a
                tab teaches that the tab is not to be trusted. */}
            <p className="min-w-[180px] flex-1 text-sm text-ink-secondary">Pick a skill and begin.</p>
          </div>
        )}
      </section>

      {/* 2 ── the four skills, and which kind of number each one is */}
      <section className="space-y-3">
        <SectionHeading icon={Flag} meta={`Target: ${target} in every skill`}>
          Where you stand
        </SectionHeading>

        {/* FOUR ROWS, ONE STATUS CHIP EACH, NO PARAGRAPH — the ruling's §2.2,
            in its own words. `StandingNote` explained what "counted" and
            "estimated" mean; it is on `/progress` now, beside the verdict it
            qualifies, and Today shows the four rows a candidate opens the app
            several times a day to see. */}
        <StandingRows exam={exam} record={latest} target={target} />
        {/* D2 — THE SENTENCE THAT WAS ON THIS SCREEN TWICE.
            `gate.reason` ("no predicted score is published … it requires 150
            official score reports") was printed under "Are you ready to book?"
            AND again under "What is not built for your exam". Same words, one
            scroll apart, which reads as two different facts until you notice
            it is one. The IA ruling of 30 August: keep it once, under "Where
            you stand", because that is the block it qualifies. */}
        {!gate.publishNumeric && (
          <p className="text-xs leading-relaxed text-ink-secondary">{t(gate.reason, 'en')}</p>
        )}
      </section>

      {/* ── TODAY IS THREE CARDS ────────────────────────────────────────
          IA ruling §1.4: *"`/` at 390px runs about four screens, roughly 70%
          prose before any action. That is the real finding under 'clutter'."*
          Walking the deployed app on 31 August measured it: **2,157px of
          content, 2.56 screens of 844** against an acceptance criterion of
          1.5. Reading the router would never have produced that number.

          What stood here was two more blocks of prose — "Are you ready to
          book?", with three paragraphs explaining why the governing level is
          the lowest and not the average, and "What is not built for your
          exam", with a fourth telling the candidate what to do meanwhile.

          Both are TRUE and neither is deleted. They are moved to `/progress`,
          which is the page that owns the numbers and is opened when a
          candidate wants to study them — Today is opened several times a day
          to see one thing. The verdict itself stays, as one line, because it
          is the question the candidate came with; what left is the reasoning
          behind it, one tap away and named.

          The destination's own surfaces went with them for the same reason:
          an external link to a government page is not something a candidate
          needs on the screen they open before practising. */}
      <Link
        to="/progress"
        className="card flex items-center gap-4 p-5 transition hover:border-navy/40 hover:bg-surface-muted"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface-muted text-navy">
          <ScrollText className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-base font-bold text-navy dark:text-white">
            Are you ready to book?
          </div>
          <div className="mt-0.5 text-sm text-ink-secondary">
            {gate.publishNumeric && governing.complete
              ? `${exam.benchmark.system} ${governing.level} · the reasoning, and what is not built for this exam`
              : 'Not yet answerable — the reasoning, and what is not built for this exam'}
          </div>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-ink-secondary" />
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
