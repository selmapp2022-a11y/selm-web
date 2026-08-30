import { useEffect, useRef, useState } from 'react';
import { Mic, Trophy, RefreshCcw, Volume2, Play } from 'lucide-react';
import clsx from 'clsx';
import { AudioRecorder } from '../components/AudioRecorder';
import { SpeechResults } from '../components/SpeechResults';
import { assessRealtime, assessFreeform, type SpeechAssessment } from '../lib/speaking';
import { aiTTS, browserTTS, stopBrowserTTS } from '../lib/tts';
import { CompletionCard } from '../components/CompletionCard';
import { ErrorBox } from '../components/States';
import { practiceTasksFor, pronunciationLinesFor, type PracticeSet, type PracticeTask } from '../lib/practiceTasks';
import { PromptCount } from '../components/PromptCount';
import { WhatYouNeed } from '../components/WhatYouNeed';
import { getAttempts } from '../lib/attempts';
import { difficultyForSkill } from '../lib/difficulty';
import { ts } from '../i18n';


// The five pronunciation sentences and the three IELTS cue cards that used
// to sit here are gone. Amendment 2 §2.2.
//
// They were English CEFR specimens and generic Part-2 cue cards belonging to
// no exam. A TCF Canada candidate was handed "Climate change is one of the
// most pressing issues of our generation" to read aloud, in the wrong
// language, against a level ladder the exam does not use.
//
// Both surfaces now come from the exam the candidate chose — the speaking
// tasks for the cue cards, the exam's own task instructions for the
// read-aloud lines. See `lib/practiceTasks.ts`, which also explains why the
// read-aloud lines are a stopgap rather than the finished answer.

export default function SpeakingPage() {
  const level = difficultyForSkill('speaking');
  // The tabs are the EXAM's tasks, built from the exam definition — TCF Canada
  // shows tâche 1·2·3, IELTS shows Part 1·2·3 — never a fixed "IELTS Speaking"
  // label on a French page. Pronunciation is kept but demoted below the main
  // row as auxiliary practice, because it drills a component of the skill and
  // is not the exam's task. Live conversation is gone — see the note further
  // down: it was the exam's own skill in a form no exam sets.
  const [set, setSet] = useState<PracticeSet | null | 'loading'>('loading');
  const [taskIdx, setTaskIdx] = useState(0);
  const [aux, setAux] = useState<null | 'pronunciation'>(null);

  useEffect(() => { practiceTasksFor('speaking', getAttempts()).then(setSet); }, []);
  useEffect(() => () => stopBrowserTTS(), []);

  const tasks = set && set !== 'loading' ? set.tasks : [];
  const activeTask = !aux && tasks.length ? tasks[Math.min(taskIdx, tasks.length - 1)] : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">Speaking</h1>
        <p className="mt-1 text-ink-secondary">
          {set && set !== 'loading'
            ? `${set.examName} — record each task and get scored feedback.`
            : 'Record each exam task and get scored feedback.'}
        </p>
      </div>

      {set === 'loading' && <div className="card p-6 text-sm text-ink-secondary">{ts('common.loading')}</div>}

      {set === null && (
        <div className="card p-6">
          <h3 className="font-display text-lg font-bold text-navy">{ts('practice.chooseExamFirst')}</h3>
          <p className="mt-1 text-sm text-ink-secondary">{ts('practice.speakingNeedsExam')}</p>
          <a href="/goal" className="btn-primary mt-4 inline-flex">{ts('common.chooseExam')}</a>
        </div>
      )}

      {tasks.length > 0 && (
        <>
          {/* MAIN ROW — the exam's own tasks, from the definition. */}
          <div className="flex gap-2 rounded-2xl bg-surface-muted p-1.5">
            {tasks.map((tk, i) => (
              <ModeBtn key={tk.id} active={!aux && taskIdx === i} onClick={() => { setAux(null); setTaskIdx(i); }} icon={Mic}>
                {tk.title}
              </ModeBtn>
            ))}
          </div>

          {/* AUXILIARY — kept, but not the exam. */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-ink-secondary">Extra practice:</span>
            <AuxBtn active={aux === 'pronunciation'} onClick={() => setAux('pronunciation')} icon={Volume2}>Pronunciation</AuxBtn>
          </div>

          {activeTask && <TaskMode task={activeTask} need={set && set !== 'loading' ? set.need : null} />}
          {aux === 'pronunciation' && <PronunciationMode level={level} />}
        </>
      )}
    </div>
  );
}

function AuxBtn({ active, onClick, icon: Icon, children }: any) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition',
        active ? 'border-teal bg-teal/10 text-navy' : 'border-surface-divider text-ink-secondary hover:text-navy'
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {children}
    </button>
  );
}

function ModeBtn({ active, onClick, icon: Icon, children }: any) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        // min-w-0 lets the flex child shrink below its content; px reduced on
        // mobile (px-2 sm:px-4) so three tabs comfortably fit a 360-class
        // viewport. truncate is the last line of defence for any oversized
        // children that slip past the responsive labels.
        'flex flex-1 min-w-0 items-center justify-center gap-1.5 sm:gap-2 rounded-xl px-2 sm:px-4 py-2.5 text-sm font-medium transition',
        active ? 'bg-white text-navy shadow-card' : 'text-ink-secondary hover:text-navy'
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{children}</span>
    </button>
  );
}

function PlayButton({ text, speaker }: { text: string; speaker?: string }) {
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = async () => {
    if (playing) {
      audioRef.current?.pause();
      stopBrowserTTS();
      setPlaying(false);
      return;
    }
    setLoading(true);
    const url = await aiTTS(text);
    setLoading(false);
    if (url) {
      const a = new Audio(url);
      audioRef.current = a;
      try { (a as any).preservesPitch = true; } catch { /* */ }
      a.onended = () => setPlaying(false);
      setPlaying(true);
      void a.play();
      return;
    }
    setPlaying(true);
    browserTTS(text, { speaker, onEnd: () => setPlaying(false) });
  };
  return (
    <button onClick={play} className="btn-ghost text-sm">
      {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-teal/30 border-t-teal" /> : <Play className="h-4 w-4" />}
      {playing ? 'Stop' : 'Listen'}
    </button>
  );
}

function PronunciationMode({ level }: { level: string }) {
  const [lines, setLines] = useState<string[] | null>(null);
  const [prompt, setPrompt] = useState<{ level: string; text: string } | null>(null);
  const [result, setResult] = useState<SpeechAssessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    pronunciationLinesFor().then((r) => {
      const ls = r?.lines ?? [];
      setLines(ls);
      if (ls.length) setPrompt({ level, text: ls[0] });
    });
  }, [level]);

  // Next in the list, not a random other one. `pronunciationLinesFor` already
  // rotated the list for this destination, and drawing at random from it threw
  // that ordering away and could hand back a sentence twice while others had
  // never been seen — the same defect the comprehension pool was fixed for.
  const newPrompt = () => {
    const ls = lines ?? [];
    if (ls.length < 2) return;
    const at = ls.indexOf(prompt?.text ?? '');
    setPrompt({ level, text: ls[(at + 1) % ls.length] });
    setResult(null); setErr(null);
  };

  const onRecorded = async (blob: Blob) => {
    if (!prompt) return;
    setLoading(true); setErr(null); setResult(null);
    try { setResult(await assessRealtime(blob, prompt.text)); }
    catch (e: any) { setErr(e?.response?.data?.detail || e?.message || 'Assessment failed.'); }
    finally { setLoading(false); }
  };

  if (lines === null) return <div className="card p-6 text-sm text-ink-secondary">{ts('common.loading')}</div>;

  // No exam chosen, so no sentences. The old code had five English ones to
  // fall back on; falling back to those is the behaviour this change exists
  // to remove — Amendment 1 §6, a visible gap over a plausible generic answer.
  if (!prompt) {
    return (
      <div className="card p-6">
        <h3 className="font-display text-lg font-bold text-navy">{ts('practice.chooseExamFirst')}</h3>
        <p className="mt-1 text-sm text-ink-secondary">{ts('practice.pronunciationNeedsExam')}</p>
        <a href="/goal" className="btn-primary mt-4 inline-flex">{ts('common.chooseExam')}</a>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="card p-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="chip">Level {prompt.level}</span>
            <div className="flex gap-2">
              <PlayButton text={prompt.text} />
              <button onClick={newPrompt} className="btn-ghost text-sm"><RefreshCcw className="h-4 w-4" /> New</button>
            </div>
          </div>
          <p className="font-display text-xl leading-relaxed text-navy">"{prompt.text}"</p>
        </div>
        <AudioRecorder onComplete={onRecorded} maxSeconds={45} label="Read the sentence aloud" />
      </div>

      <div className="space-y-4">
        {loading && <Loading text="Analyzing pronunciation…" />}
        {err && <ErrorBox msg={err} />}
        {result && <SpeechResults result={result} />}
        {result && (
          <CompletionCard
            skill="speaking"
            topic={`Pronunciation · ${prompt.level}`}
            score={Math.round(result.overall_score)}
            onNext={newPrompt}
            nextLabel="Try a new sentence"
          />
        )}
        {!loading && !err && !result && (
          <div className="card p-8 text-center text-ink-secondary">
            <Mic className="mx-auto mb-2 h-10 w-10 opacity-40" />
            <p className="text-sm">Record yourself to see word-by-word and phoneme scores.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ConversationMode and its topic openers were deleted here, for the same
// reason the Listening topic cards and the Reading paste tool were deleted on
// 29 August:
//
//   **Nothing may offer the SAME SKILL in a form the exam does not set.**
//
// Free-form chat with an AI on "Travel / Food & Cooking / Work Life" IS
// speaking. It is the same skill the exam sets, offered in a form no exam
// sets: no task, no timing, no level, no criteria, and — the plain evidence —
// the identical three topic cards for Express Entry CLB 9, for Australia band
// 6, and for TCF Canada. A candidate cannot tell a substitute from the real
// thing; that is why they came to us, so an honest label would only have
// recorded that we knew.
//
// Pronunciation is kept and is not the same case: it drills a COMPONENT of
// speaking (sounds and stress on a line the exam itself sets), it cannot be
// mistaken for the exam's task, and it renders only when the exam's tasks are
// present. See `lib/practiceTasks.ts` for why its lines are still a stopgap.

function TaskMode({ task, need }: { task: PracticeTask; need: PracticeSet['need'] }) {
  const prompt = task.instruction + '\n\n' + task.prompt;
  const [result, setResult] = useState<SpeechAssessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  // Re-mounting on task change resets the result; nothing else to do.
  useEffect(() => { setResult(null); setErr(null); }, [task.id]);

  const onRecorded = async (blob: Blob) => {
    setLoading(true); setErr(null); setResult(null);
    // IELTS uses free-form scoring (mode=ielts) so the backend runs SpeechAce
    // for pronunciation AND Gemini for fluency / lexical / grammar / task
    // response, and we pass the topic so Task Response can be graded.
    try { setResult(await assessFreeform(blob, prompt)); }
    catch (e: any) { setErr(e?.response?.data?.detail || e?.message || 'Assessment failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="card p-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="chip bg-amber-100 text-amber-700">{task.title}</span>
            <PlayButton text={prompt} />
          </div>
          <p className="text-base leading-relaxed text-ink-primary">{prompt}</p>
          <p className="mt-3 text-xs text-ink-secondary">Speak for 1–2 minutes.</p>
        </div>
        <WhatYouNeed need={need} skill="speaking" />
        <PromptCount task={task} verb="recorded" />
        <AudioRecorder onComplete={onRecorded} maxSeconds={120} label="Tap to start your 2-minute response" />
      </div>
      <div className="space-y-4">
        {loading && <Loading text="Scoring your response…" />}
        {err && <ErrorBox msg={err} />}
        {result && <SpeechResults result={result} />}
        {result && (
          <CompletionCard
            skill="speaking"
            topic={task.title}
            itemId={task.promptId}
            score={Math.round(result.overall_score)}
            onNext={() => { setResult(null); setErr(null); }}
            nextLabel="Record again"
          />
        )}
        {!loading && !err && !result && (
          <div className="card p-8 text-center text-ink-secondary">
            <Trophy className="mx-auto mb-2 h-10 w-10 opacity-40" />
            <p className="text-sm">Your score and feedback will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Loading({ text }: { text: string }) {
  return (
    <div className="card flex h-64 items-center justify-center p-6">
      <div className="text-center">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-teal/30 border-t-teal" />
        <p className="text-sm text-ink-secondary">{text}</p>
      </div>
    </div>
  );
}
// preserve unused import noise
void Volume2;
