import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  Compass,
  Crown,
  Flag,
} from 'lucide-react';
import { EmptyState, Loader } from '../components/States';
import { SkillTiles } from '../components/SkillTiles';
import { lookFor } from '../lib/skillLook';
import { SectionHeading } from '../components/SectionHeading';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { loadHistory, type SittingRecord } from '../exam/model/history';
import { PLAN_EVENT, daysUntil, loadPlan, type Plan } from '../exam/model/plan';
import { loadSitting } from '../exam/state';
import { releaseGate } from '../exam/engine/aggregate';
import { buildPlan, type Coordinate } from '../exam/engine/planner';
import { loadAttestations } from '../exam/model/attestationStore';
import OnboardingPage from './OnboardingPage';
import { governingLevel } from '../exam/engine/comprehension';
import { t } from '../exam/model/format';
import { ts, tf, useUiLangValue, type UiLang } from '../i18n';
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
  const ui = useUiLangValue();
  useDocumentTitle(ts('nav.today', ui));

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
        title={ts('today.catalogueFailed', ui)}
        body={ts('today.catalogueFailedBody', ui)}
        action={<a href={EXAM_HOME} className="btn-primary">{ts('today.openEngine', ui)}</a>}
      />
    );
  }
  if (!cat) return <Loader text={ts('today.loadingExam', ui)} />;

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


  const sitting = loadSitting();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* ── ONE HERO, NOT THREE CARDS ──────────────────────────────────
          The founder, 31 August: *"the app is cluttered."* Today was six
          stacked sections and the first screen held three of them — a page
          heading, an exam card, and a countdown panel — before anything could
          be started.

          They are one thing: WHICH exam, HOW LONG, START. So they are one
          card. The heading "Today" went with them: the tab bar already says
          which screen this is, and a word repeated two inches below its own
          label is the kind of clutter that is invisible until it is gone. */}
      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-navy via-navy to-teal-700 text-white shadow-cardHover">
        <div className="flex flex-wrap items-start justify-between gap-4 p-5">
          <div className="min-w-0 flex-1">
            <span className="inline-flex rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold">
              {t(goal.destination.label, ui)}
            </span>
            <h1 className="mt-2 font-display text-2xl font-bold leading-tight">{t(exam.name, ui)}</h1>
            {/* Two lines at most. The Express Entry requirement line runs to
                four on a 390px screen and pushed the countdown's own card off
                the first screen — the one number this card exists to carry. */}
            <p className="mt-1 line-clamp-2 text-sm leading-snug text-white/75">{requirementLine(goal, ui)}</p>
          </div>

          {/* The countdown is the one number on this product that is both
              certain and the reason the candidate is here. When there is no
              date it is not a small grey chip — it is the same size, asking
              for the thing that turns the plan on. */}
          <div className="flex shrink-0 flex-col items-center rounded-2xl bg-white/10 px-4 py-3 text-center">
            {left === null ? (
              <>
                <CalendarDays className="h-6 w-6 opacity-90" />
                <a
                  href={EXAM_HOME}
                  className="mt-2 inline-flex min-h-[44px] items-center rounded-xl bg-white/20 px-3 text-xs font-semibold transition hover:bg-white/30"
                >
                  {ts('today.setDate', ui)}
                </a>
              </>
            ) : (
              <>
                <div className="font-display text-4xl font-bold leading-none tabular-nums">{Math.abs(left)}</div>
                <div className="mt-1 max-w-[9ch] text-[10px] font-semibold uppercase leading-tight tracking-wider opacity-85">
                  {ts(left >= 0
                    ? (left === 1 ? 'today.dayUntil' : 'today.daysUntil')
                    : (left === -1 ? 'today.daySince' : 'today.daysSince'), ui)}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── THE MOCK EXAM IS NO LONGER A TAB ────────────────────────────
            It was the third of four tab-bar destinations. It is the product's
            own hero — the thing the whole marketing site points at, and the
            thing a candidate opens the app to do occasionally and
            deliberately — and a tab is where you put what someone does
            constantly. So it is the primary action of the home screen, at the
            foot of the card that says which exam and how long is left, which
            is the only place those three facts mean anything together. */}
        <Link
          to="/exam"
          className="flex min-h-[3.5rem] items-center justify-between gap-3 border-t border-white/15 bg-white/10 px-5 py-4 transition hover:bg-white/20"
        >
          <span className="flex items-center gap-2.5 font-display text-base font-bold">
            <ClipboardCheck className="h-5 w-5" />
            {ts(sitting ? 'today.resumeMock' : 'today.startMock', ui)}
          </span>
          <ChevronRight className="h-5 w-5 opacity-80" />
        </Link>
      </section>

      {/* ── THE FOUR SKILLS ─────────────────────────────────────────────
          Four rows became four tiles, and "What is not built for your exam"
          — a whole section of prose two scrolls below — became the state of
          the tiles it was about. See `components/SkillTiles.tsx`. */}
      <section className="space-y-3">
        <SectionHeading icon={Flag} meta={tf('today.targetMeta', { target }, ui)}>
          {ts('today.yourFourSkills', ui)}
        </SectionHeading>
        <SkillTiles exam={exam} record={latest} />
        {!gate.publishNumeric && (
          <p className="text-xs leading-relaxed text-ink-secondary">{t(gate.reason, ui)}</p>
        )}
      </section>

      {/* ── THE NEXT THING, AS ONE STRIP ────────────────────────────────
          It was a card with a heading, a coordinate, a sentence of reasoning
          and a button. The reasoning is one line now and sits under the
          coordinate it explains. */}
      {nextSlot && nextSkill && (
        <Link
          to={practiceHref(nextSlot.coordinate)}
          className="card flex items-center gap-4 border-l-4 border-l-teal p-4 transition hover:shadow-cardHover"
        >
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm ${lookFor(nextSkill).tile}`}>
            <Compass className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-teal">{ts('today.doThisNext', ui)}</div>
            <div className="truncate font-display text-lg font-bold text-navy dark:text-white">{nextSlot.coordinate.label}</div>
            <div className="mt-0.5 text-xs leading-snug text-ink-secondary">
              {ts(builtPlan.basis === 'attestation' ? 'today.weakestFirst' : 'today.examOrder', ui)}
            </div>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-ink-secondary" />
        </Link>
      )}

      {/* The verdict, as one line, linking to the page that owns the
          reasoning. Unchanged in substance from 31 August. */}
      <Link
        to="/progress"
        className="card flex min-h-[44px] items-center gap-4 p-4 transition hover:border-navy/40 hover:bg-surface-muted"
      >
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-navy dark:text-white">{ts('today.readyToBook', ui)}</div>
          <div className="mt-0.5 text-xs text-ink-secondary">
            {gate.publishNumeric && governing.complete
              ? tf('today.readyAnswer', { system: exam.benchmark.system, level: governing.level ?? '' }, ui)
              : ts('today.notYetAnswerable', ui)}
          </div>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-ink-secondary" />
      </Link>

      {/* Upgrade. This is the primary in-app entry point to the paywall and it
          stays on the home screen: Apple's App Review has to be able to find
          the In-App Purchases without hunting through menus. */}
      <Link
        to="/upgrade"
        className="card flex items-center gap-4 overflow-hidden bg-gradient-to-br from-teal-500 to-teal-700 p-4 text-white shadow-cardHover"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
          <Crown className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-base font-bold">{ts('today.upgrade', ui)}</div>
          <div className="text-xs text-white/80">{ts('today.upgradeBlurb', ui)}</div>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-white/90" />
      </Link>
    </div>
  );
}

function requirementLine(goal: Goal, ui: UiLang): string {
  const target = `${goal.system} ${goal.requiredLevel}`;
  const label = t(goal.label, ui);
  switch (goal.destination.requirement) {
    case 'overall':
      return tf('today.reqOverall', { label, target }, ui);
    case 'both':
      return tf('today.reqBoth', { label, target }, ui);
    default:
      return tf('today.reqEvery', { label, target }, ui);
  }
}
