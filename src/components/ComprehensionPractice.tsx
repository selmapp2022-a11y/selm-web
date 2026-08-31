import { useEffect, useMemo, useRef, useState } from 'react';
import { audioFor } from '../exam/model/rendition';
import type { AccentTrack } from '../exam/model/types';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Headphones, BookOpen, RefreshCcw } from 'lucide-react';
import clsx from 'clsx';
import { loadPlan, PLAN_EVENT } from '../exam/model/plan';
import { resolveAudio } from '../exam/engine/audio';
import { itemsOf } from '../exam/engine/comprehension';
import type { ComprehensionSection, LanguageCode, Recording } from '../exam/model/types';
import { getAttempts, recordAttempt, ATTEMPTS_EVENT, type SkillKey } from '../lib/attempts';
import { practicable, practiceState, servePractice, type PracticeServe } from '../exam/engine/practicePool';
import { candidateLevel, cefrTag, type CandidateLevel } from '../exam/engine/planner';
import { loadAttestations } from '../exam/model/attestationStore';
import type { ServeState } from '../exam/engine/pool';
import { isCompletionItem, isMatchingItem } from '../exam/model/types';
import { markCompletion } from '../exam/engine/completion';
import { isResponseCorrect } from '../exam/engine/comprehension';
import { MatchingBank } from './MatchingBank';

/**
 * Practice for a comprehension skill, served from THE EXAM'S OWN BANK.
 *
 * Until 2026-08-29 Practice > Reading offered "paste any text" and
 * Practice > Listening offered topic cards - Technology, Science, Sports -
 * neither of which any examination sets. Speaking and Writing had already been
 * moved onto the exam's own tasks, so half the practice hub prepared the
 * candidate for their examination and half prepared them for nothing in
 * particular. Worse, the IELTS reading bank authored the night before was
 * reachable only through the planner: the one screen actually labelled
 * "Reading" could not open it.
 *
 * Three states, and each of them is honest:
 *
 *  - no plan yet          ask for the exam first; everything here derives from it
 *  - exam has no section  say so, naming the exam and the skill. Substituting
 *                         generic material would let the candidate believe they
 *                         were practising for their examination when they were
 *                         not, which is the one outcome worse than an empty page
 *  - section exists       serve its items, one at a time, WITH feedback
 *
 * Feedback is the difference between this and `SectionPage`. A mock section
 * shows nothing until it is submitted, because that is the examination. This is
 * practice: the rationale is the teaching, and withholding it here would waste
 * the item.
 */
/** The exam's name, for a sentence that reads better with it than without. */
const state0Name = (n: string) => n;

export function ComprehensionPractice({ skill }: { skill: 'reading' | 'listening' }) {
  const [params] = useSearchParams();
  const askedFamily = params.get('family');
  const askedLevel = params.get('level');
  const [state, setState] = useState<
    | { kind: 'loading' }
    | { kind: 'no-plan' }
    | { kind: 'no-section'; examName: string }
    | { kind: 'no-audio'; examName: string }
    | {
        kind: 'ready';
        /** The candidate's accent track, decided by their destination. */
        track: AccentTrack;
        /** The coordinate the candidate asked for, when Today named one. */
        asked: { family: string; level: string; label: string } | null;
        examName: string;
        section: ComprehensionSection;
        recordings: Recording[];
        lang: LanguageCode;
        /** The band to serve at, and whether it is measured or the destination's. */
        level: CandidateLevel;
        /** One sentence naming the band and where it came from, for the screen. */
        levelNote: string;
      }
  >({ kind: 'loading' });

  useEffect(() => {
    let alive = true;
    const read = async () => {
      const plan = loadPlan();
      if (!plan?.examId) { if (alive) setState({ kind: 'no-plan' }); return; }
      const defs = await import('../exam/definitions');
      const exam = defs.EXAMS.find((e) => e.id === plan.examId);
      if (!exam) { if (alive) setState({ kind: 'no-plan' }); return; }
      const lang = exam.language as LanguageCode;
      const examName = exam.name[lang] ?? exam.name.en;
      const section = exam.sections.find(
        (s): s is ComprehensionSection => s.kind === 'comprehension' && s.skill === skill,
      );
      if (!section) { if (alive) setState({ kind: 'no-section', examName }); return; }

      // A recording that was never rendered cannot carry listening questions.
      // Showing its script would turn a listening test into a reading test -
      // the same rule SectionPage enforces, for the same reason. A recording
      // with no questions is dropped for a duller reason: it would be served
      // as a turn of practice on which nothing can be answered.
      //
      // `practicable` is the shared filter, so the number the header prints
      // is the number the selector can actually reach. When those two drifted
      // apart in the inventory the row read "40 exists / 4 reachable" and was
      // nonsense; the fix there was to count one thing, and it is the fix here.
      // The candidate's accent track — an Australian candidate practises on
      // the Australian recording of the same script, not on the Canadian one.
      const track = defs.trackForGoal(plan.goalId);
      const usable = practicable(section, track);

      // ── THE COORDINATE THE CANDIDATE ASKED FOR, IF THEY ASKED ───────────
      //
      // Today's "Do this next" card names a coordinate and now links to it.
      // Serving the whole skill instead is the defect the IA audit called its
      // worst: a card that names an item and delivers a different screen.
      //
      // A coordinate with nothing behind it is NOT quietly widened to the
      // whole skill. The candidate is told the name of what is missing —
      // Amendment 1 §6, *"never a substituted generic lesson"* — because that
      // emptiness is also the signal for what to author next, and it is the
      // sentence the founder read on his own Progress screen the night the
      // seven empty French coordinates were filled.
      if (!usable.length) { if (alive) setState({ kind: 'no-audio', examName }); return; }

      // WHICH BAND, and this is the point of the screen.
      //
      // The founder, 2026-08-29: *"every exam has a level, and the questions
      // and the practice have to differ."* Three destinations sit the same
      // IELTS paper and need CLB 9, CLB 4 and band 6 — three different levels,
      // known from the moment the destination is picked, and until today read
      // by the plan and by nothing that chose material. Everyone started at
      // A1.
      //
      // `candidateLevel` is the planner's own function: a measured level when
      // there is a score, the destination's required level when there is not.
      // Not a copy of it — the two must never disagree about where someone is.
      const goal = defs.goalById(plan.goalId ?? '');
      const att = loadAttestations()
        .filter((x) => x.examId === exam.id)
        .sort((x, y) => (x.sat < y.sat ? 1 : -1))[0] ?? null;
      const level = candidateLevel(exam, att, goal?.requiredLevel ?? 0, skill, goal?.scaleId);
      // Said out loud, with its source. "At your level" was on this page as a
      // subtitle for weeks while every candidate got A1; a claim that cannot
      // be checked from the screen is the kind this product does not make.
      const levelNote =
        level.basis === 'attestation'
          ? `Served around ${cefrTag(level.index)} — the level your last ${state0Name(examName)} result puts you at.`
          : goal
            ? `Served around ${cefrTag(level.index)} — the level ${goal.system} ${goal.requiredLevel} asks for. A past score report makes this follow your marks instead.`
            : `Served around ${cefrTag(level.index)}.`;
      // The coordinate Today named, if it named one. `usable` is already
      // filtered by `deliverable` and by the accent track; this narrows it to
      // one family and band, and NOTHING silently widens it back.
      const asked = askedFamily && askedLevel
        ? {
            family: askedFamily,
            level: askedLevel,
            label: `${section.families?.find((f) => f.id === askedFamily)?.label.en ?? askedFamily} · ${askedLevel}`,
          }
        : null;
      const here = asked
        ? usable.filter((r) => r.family === asked.family && r.level === asked.level)
        : usable;
      if (alive) setState({ kind: 'ready', examName, section, recordings: here, lang, level, levelNote, track, asked });
    };
    read();
    window.addEventListener(PLAN_EVENT, read);
    return () => { alive = false; window.removeEventListener(PLAN_EVENT, read); };
  }, [skill]);

  const Icon = skill === 'listening' ? Headphones : BookOpen;

  if (state.kind === 'loading') {
    return <div className="card p-6 text-sm text-ink-secondary">Loading…</div>;
  }

  if (state.kind === 'no-plan') {
    return (
      <div className="card p-6">
        <p className="text-sm text-ink-primary">
          Choose your exam first. Everything you practise here — the language, the text types, the
          questions — comes from it.
        </p>
        <Link to="/me" className="btn-primary mt-4 inline-block">Choose my exam</Link>
      </div>
    );
  }

  if (state.kind === 'no-section') {
    return (
      <div className="card border-dashed p-6">
        <div className="flex items-start gap-3">
          <Icon className="mt-0.5 h-5 w-5 shrink-0 text-ink-secondary" />
          <div>
            <p className="font-medium text-navy">
              {state.examName} — this skill is not built yet
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
              Your exam awards a {skill} score, and we have not authored that part of it. Nothing is
              shown here rather than substituting general {skill} material, because practising
              something the exam does not set would not move your score, and telling you otherwise
              would be worse than an empty page.
            </p>
            <p className="mt-3 text-sm text-ink-secondary">
              The skills that are built are on the practice page.
            </p>
            <Link to="/practice" className="btn-ghost mt-3 inline-block border-2 border-surface-divider px-4 py-2">
              Back to practice
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (state.kind === 'no-audio') {
    return (
      <div className="card border-dashed p-6">
        <div className="flex items-start gap-3">
          <Headphones className="mt-0.5 h-5 w-5 shrink-0 text-ink-secondary" />
          <div>
            <p className="font-medium text-navy">{state.examName} — the recordings are not ready</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
              The questions exist but their audio has not been recorded. A listening question without
              its recording is a reading question, so it is not offered. This section opens as soon as
              the audio is in place.
            </p>
            <Link to="/practice" className="btn-ghost mt-3 inline-block border-2 border-surface-divider px-4 py-2">
              Back to practice
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Runner
      examName={state.examName}
      section={state.section}
      recordings={state.recordings}
      level={state.level}
      levelNote={state.levelNote}
      track={state.track}
      asked={state.asked}
    />
  );
}

/**
 * Practice serves a WHOLE PART: the recording, then its questions, then
 * feedback on all of them.
 *
 * Per-question listening practice does not exist for this skill. Question 7
 * without the four minutes of conversation before it is not a task, it is a
 * guess — ruling 3.
 *
 * And practice may replay, where the exam may not. The distinction is not
 * arbitrary: **refusing the script protects the construct, because reading a
 * transcript is a different skill. Replaying the audio does not — it is the
 * same skill, attempted again.** So the transcript stays hidden here too, and
 * the replay is allowed. The screen says the exam plays once, because the
 * candidate should never learn that difference on exam day.
 */
function Runner({
  examName,
  section,
  recordings,
  level,
  levelNote,
  track,
  asked,
}: {
  examName: string;
  section: ComprehensionSection;
  recordings: Recording[];
  level: CandidateLevel;
  levelNote: string;
  /** The candidate's accent track. Decided by the destination, not the exam. */
  track: AccentTrack;
  /** The coordinate Today named, when it named one. */
  asked: { family: string; level: string; label: string } | null;
}) {
  // Which recording to serve is NOT this component's decision, and that is
  // the fix. Until 2026-08-29 it was: sort easiest-first, `useState(0)`, read
  // index 0 - and since component state does not survive a navigation, the
  // index was 0 on every arrival. Thirty-nine TCF recordings served one.
  //
  // The rule now comes from `servePractice`, which is `pool.ts` §4.3 given a
  // memory that outlives the page: the attempt log. See `practicePool.ts`.
  const st = useRef<ServeState | null>(null);
  // Set just before this component writes an attempt of its own, so the
  // ATTEMPTS_EVENT that write fires does not restart the sitting the
  // candidate is in the middle of. Only somebody ELSE's write - the backend
  // sync landing - should reopen the bank.
  const ownWrite = useRef(false);
  const [current, setCurrent] = useState<PracticeServe | null>(null);
  // Set when the candidate has finished the bank and asked to go round again,
  // so the "you have done all of these" panel is shown once and not on every
  // subsequent recording.
  const [replaying, setReplaying] = useState(false);

  const [chosen, setChosen] = useState<Record<string, number | string>>({});
  const [marked, setMarked] = useState(false);
  const [tally, setTally] = useState({ correct: 0, total: 0 });

  // Built from storage on arrival, and rebuilt when the backend sync lands -
  // a candidate who practised on their phone this morning should not be
  // handed the same recording on their laptop this afternoon.
  useEffect(() => {
    const open = () => {
      if (ownWrite.current) { ownWrite.current = false; return; }
      st.current = practiceState(recordings, getAttempts());
      setCurrent(servePractice(recordings, st.current, level.index));
      setReplaying(false);
      setChosen({}); setMarked(false); setTally({ correct: 0, total: 0 });
    };
    open();
    window.addEventListener(ATTEMPTS_EVENT, open);
    return () => window.removeEventListener(ATTEMPTS_EVENT, open);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordings, level.index]);

  const rec = current?.item ?? null;
  const items = useMemo(() => (rec ? itemsOf(section, rec.id) : []), [section, rec]);
  const isAudio = section.delivery.audioPlaysOnce;
  const family = section.families?.find((f) => f.id === rec?.family);
  const noun = isAudio ? 'recording' : 'passage';

  // ── THE COORDINATE TODAY NAMED, AND THE CASE WHERE IT HOLDS NOTHING ────
  //
  // Amendment 1 §6: a coordinate with no material is a VISIBLE GAP, never a
  // substituted generic lesson. So an empty coordinate says its own name and
  // offers the whole skill as a separate, labelled choice — it does not
  // quietly become the whole skill, which is the defect this link was added
  // to fix, arriving from the other direction.
  if (asked && recordings.length === 0) {
    return (
      <div className="card p-6">
        <span className="chip">{asked.label}</span>
        <h2 className="mt-3 font-display text-xl font-bold text-navy dark:text-white">
          Nothing is written here yet
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
          Your plan points at <strong>{asked.label}</strong>, and this product holds no{' '}
          {noun} at that coordinate for {examName}. That is a gap in what we have built, not
          something you have already done — and it is the gap we fill next.
        </p>
        <Link to={`/practice/${section.skill}`} className="btn-secondary mt-4 inline-flex">
          Practise {section.skill} at your level instead
        </Link>
      </div>
    );
  }

  if (!current || !rec) {
    return <div className="card p-6 text-sm text-ink-secondary">Loading…</div>;
  }

  /**
   * The bank is finished, and the screen says so.
   *
   * The old code showed a score card here — "12 of 15", "Again" — which read
   * as the end of an exercise and said nothing about the bank. It could not:
   * it had no idea how large the bank was, because it never asked.
   *
   * The founder's ruling on the thin banks is the reason this panel names a
   * number: *"a skill with one item should not present it as though there
   * were more."* Four IELTS listening parts is one paper. Practising them a
   * fifth time is not practising listening, and the candidate is the one
   * person who cannot tell.
   */
  if (current.recycled && !replaying) {
    return (
      <div className="card p-6">
        {tally.total > 0 && (
          <p className="font-display text-2xl font-bold text-navy">
            {tally.correct} of {tally.total}
          </p>
        )}
        <p className={clsx('text-sm leading-relaxed text-ink-primary', tally.total > 0 && 'mt-3')}>
          You have now practised every {noun} we have for {examName} {section.skill} — all{' '}
          <strong>{current.total}</strong> of {current.total === 1 ? 'it' : 'them'}.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
          You may go through them again, and there is some use in that — spelling, the second
          listen, the question you rushed. But a {noun} you have already answered mostly tests
          whether you remember it, and remembering is not the skill the exam awards. We are saying
          so rather than dealing you the same {noun} without comment.
        </p>
        {tally.total > 0 && (
          <p className="mt-2 text-sm text-ink-secondary">
            The score above is how you did on these questions today. It is not a predicted band.
          </p>
        )}
        {/* The level line is dropped everywhere else on this page the moment
            the bank runs out, and it is exactly here that it answers a
            question: a second pass is not the whole bank again in bank order
            — it starts at the candidate's own band, which is the one part of
            "go through them again" worth knowing before agreeing to it. */}
        <p className="mt-2 text-xs leading-relaxed text-ink-secondary">{levelNote}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => { setReplaying(true); setChosen({}); setMarked(false); setTally({ correct: 0, total: 0 }); }}
            className="btn-primary inline-flex items-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" /> Go through them again
          </button>
          <Link to="/practice" className="btn-ghost inline-block border-2 border-surface-divider px-4 py-2">
            Back to practice
          </Link>
        </div>
      </div>
    );
  }

  // A typed item counts as answered only when something was typed. Tabbing
  // through leaving blanks is not an attempt, and treating it as one would
  // inflate every attempt figure on Progress with work that did not happen.
  const allAnswered = items.every((i) => {
    const v = chosen[i.id];
    return typeof v === 'number' || (typeof v === 'string' && v.trim().length > 0);
  });

  const mark = () => {
    const right = items.filter((i) => isResponseCorrect(i, chosen[i.id] ?? null)).length;
    setTally((t) => ({ correct: t.correct + right, total: t.total + items.length }));
    setMarked(true);
    // Record the attempt.
    //
    // Until 29 August 2026 nothing here recorded anything: only Speaking and
    // Writing went through `CompletionCard`, so listening and reading practice
    // left no trace at all. The old scoreboard hid it — a candidate who read
    // for an hour still watched a number go up, because vocabulary and the
    // other two skills were feeding it.
    //
    // The topic is the planner's own coordinate label, `family · level`, and
    // it has to stay that exact string: Progress joins attempts to the
    // planner's coordinates to say what has NOT been practised, and a label
    // that drifts turns that list into "everything, forever".
    //
    // `itemId` is new, and it is what makes the selector above work: `topic`
    // is a coordinate, and eleven of them carry thirty-nine TCF recordings,
    // so the topic alone cannot say which one was practised.
    if (rec?.family) {
      ownWrite.current = true;
      recordAttempt({
        skill: section.skill as SkillKey,
        topic: `${rec.family} · ${rec.level}`,
        itemId: rec.id,
        score: right,
        total: items.length,
      });
    }
  };

  const next = () => {
    if (!st.current) return;
    const served = servePractice(recordings, st.current, level.index);
    setCurrent(served);
    if (served.recycled) setReplaying(false);
    setChosen({}); setMarked(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-ink-secondary">
        {/*
          * Not "Recording 1 of 39". That line was true of a cursor and false
          * of the candidate: it said 1 of 39 on the fortieth visit as loudly
          * as on the first. What is worth counting is how much of the bank
          * they have not met.
          */}
        <span>
          {replaying
            ? `${current.total} ${noun}${current.total === 1 ? '' : 's'} in this bank · all practised`
            : `${current.unseen} of ${current.total} ${noun}${current.total === 1 ? '' : 's'} left to practise`}
          {' · '}
          {items.length} {items.length === 1 ? 'question' : 'questions'}
        </span>
        <span className="chip">{rec.level}{family ? ` · ${family.label.en}` : ''}</span>
        {/* The candidate arrived from a card that named this coordinate. Saying
            so is how they can tell the promise was kept. */}
        {asked && <span className="chip">from your plan</span>}
      </div>

      <p className="text-xs leading-relaxed text-ink-secondary">{levelNote}</p>

      <div className="card p-6">
        {isAudio ? (
          <>
            <audio controls src={resolveAudio(audioFor(rec, track))} className="w-full" />
            <p className="mt-2 text-xs text-ink-secondary">
              You can replay this here. In the real exam you will hear it once.
            </p>
          </>
        ) : (
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink-primary">{rec.script}</p>
        )}
      </div>

      {/* Any shared bank belonging to this recording, above its questions. */}
      {(section.matchingGroups ?? [])
        .filter((g) => g.recordingId === rec.id)
        .map((g) => <MatchingBank key={g.id} group={g} />)}

      {items.map((item, n) => {
        const pick = chosen[item.id];

        // A completion item is answered by typing, and the feedback after
        // marking has to say what the accepted answer WAS — a candidate who
        // typed `recieve` learns nothing from being told they are wrong, and
        // the spelling is the thing being tested.
        if (isCompletionItem(item)) {
          const verdict = marked ? markCompletion(item.answer, typeof pick === 'string' ? pick : '') : null;
          return (
            <div key={item.id} className="card p-6">
              <p className="font-medium text-ink-primary">
                <span className="mr-2 text-ink-secondary">{n + 1}.</span>
                {item.stem}
              </p>
              <label className="mt-3 flex flex-wrap items-center gap-2 text-sm text-ink-primary">
                <span>{item.prompt.split('___')[0]}</span>
                <input
                  type="text"
                  value={typeof pick === 'string' ? pick : ''}
                  onChange={(e) => !marked && setChosen((c) => ({ ...c, [item.id]: e.target.value }))}
                  disabled={marked}
                  className={clsx('input w-48 py-2',
                    marked && verdict?.correct && 'border-teal bg-teal/10',
                    marked && verdict && !verdict.correct && 'border-red-400 bg-red-50')}
                  autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
                  aria-label={item.stem}
                />
                <span>{item.prompt.split('___')[1] ?? ''}</span>
              </label>
              <p className="mt-2 text-xs text-ink-secondary">
                {item.answer.maxWords === 1 ? 'ONE WORD AND/OR A NUMBER'
                  : item.answer.maxWords === 2 ? 'NO MORE THAN TWO WORDS AND/OR A NUMBER'
                  : 'NO MORE THAN THREE WORDS AND/OR A NUMBER'}
                {' · spelling is marked'}
              </p>
              {marked && verdict && !verdict.correct && (
                <p className="mt-2 text-sm text-red-700">
                  {verdict.reason === 'too_many_words'
                    ? `Too many words — the exam marks this wrong even when the answer is inside it. The answer was “${item.answer.accept[0]}”.`
                    : `The answer was “${item.answer.accept[0]}”.`}
                  {item.answer.accept.length > 1 && ` Also accepted: ${item.answer.accept.slice(1).map((a) => `“${a}”`).join(', ')}.`}
                </p>
              )}
              {marked && verdict?.correct && (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-teal">
                  <CheckCircle2 className="h-4 w-4" /> Correct
                </p>
              )}
            </div>
          );
        }

        // Matching draws from a bank shared with its neighbours — the same
        // mechanism as plan and map labelling. The bank is rendered ONCE,
        // above the group, by `MatchingBank` below; each question here is the
        // lettered choice from it.
        if (isMatchingItem(item)) {
          const group = section.matchingGroups?.find((g) => g.id === item.groupId);
          const picked = typeof pick === 'string' ? pick : null;
          return (
            <div key={item.id} className="card p-6">
              <p className="font-medium text-ink-primary">
                <span className="mr-2 text-ink-secondary">{n + 1}.</span>
                {item.stem}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(group?.options ?? []).map((o) => {
                  const isKey = o.id === item.answer;
                  const isPicked = picked === o.id;
                  return (
                    <button
                      key={o.id}
                      onClick={() => !marked && setChosen((c) => ({ ...c, [item.id]: o.id }))}
                      disabled={marked}
                      className={clsx(
                        'rounded-xl border-2 px-4 py-2 text-sm font-semibold transition-all',
                        !marked && isPicked && 'border-teal bg-teal/10 text-navy',
                        !marked && !isPicked && 'border-surface-divider bg-white text-ink-secondary hover:border-navy/40',
                        marked && isKey && 'border-teal bg-teal/10 text-navy',
                        marked && isPicked && !isKey && 'border-red-400 bg-red-50 text-red-800',
                        marked && !isPicked && !isKey && 'border-surface-divider bg-white text-ink-secondary opacity-60',
                      )}
                    >
                      {o.id}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        }

        return (
          <div key={item.id} className="card p-6">
            <p className="font-medium text-ink-primary">
              <span className="mr-2 text-ink-secondary">{n + 1}.</span>
              {item.stem}
            </p>
            <div className="mt-3 space-y-2">
              {item.options.map((o: string, i: number) => {
                const isKey = i === item.answer;
                const picked = pick === i;
                return (
                  <button
                    key={i}
                    onClick={() => !marked && setChosen((c) => ({ ...c, [item.id]: i }))}
                    disabled={marked}
                    className={clsx(
                      'flex w-full items-start gap-2 rounded-xl border-2 px-5 py-3 text-left text-sm font-medium transition-all',
                      !marked && picked && 'border-teal bg-teal/10 text-navy',
                      !marked && !picked && 'border-surface-divider bg-white text-ink-secondary hover:border-navy/40 hover:bg-surface-muted',
                      marked && isKey && 'border-teal bg-teal/10 text-navy',
                      marked && picked && !isKey && 'border-red-400 bg-red-50 text-red-800',
                      marked && !picked && !isKey && 'border-surface-divider bg-white text-ink-secondary opacity-60',
                    )}
                  >
                    {marked && isKey && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal" />}
                    {marked && picked && !isKey && <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />}
                    <span>{o}</span>
                  </button>
                );
              })}
            </div>
            {marked && item.rationale && (
              <p className="mt-3 rounded-xl bg-surface-muted p-3 text-sm leading-relaxed text-ink-secondary">
                {item.rationale}
              </p>
            )}
          </div>
        );
      })}

      {marked ? (
        <button onClick={next} className="btn-primary w-full">
          {current.unseen <= 1 && !replaying ? 'Finish' : isAudio ? 'Next recording' : 'Next passage'}
        </button>
      ) : (
        <button
          onClick={mark}
          disabled={!allAnswered}
          className={clsx('w-full rounded-xl px-5 py-3 text-sm font-semibold',
            allAnswered ? 'bg-navy text-white' : 'cursor-not-allowed bg-surface-muted text-ink-secondary')}
        >
          {allAnswered ? 'Check my answers' : `Answer all ${items.length} to check`}
        </button>
      )}

      <div className="card p-6">
        <p className="text-xs leading-relaxed text-ink-secondary">{section.provenance.en}</p>
      </div>
    </div>
  );
}
