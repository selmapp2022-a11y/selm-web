import { useEffect, useRef, useState } from 'react';
import { Mic, MessageSquare, Trophy, RefreshCcw, Volume2, Play } from 'lucide-react';
import clsx from 'clsx';
import { AudioRecorder } from '../components/AudioRecorder';
import { SpeechResults } from '../components/SpeechResults';
import { assessRealtime, audioConversation, generateConversation, type SpeechAssessment, type ConversationDialogue } from '../lib/speaking';
import { aiTTS, browserTTS, stopBrowserTTS, speakSequence, genderForSpeaker } from '../lib/tts';
import { useAuthStore } from '../store/authStore';

type Mode = 'pronunciation' | 'conversation' | 'ielts';

const PRACTICE_PROMPTS = [
  { level: 'A1', text: 'My name is Alex and I live in a small town near the mountains.' },
  { level: 'A2', text: 'Last weekend I visited my grandparents and we cooked dinner together.' },
  { level: 'B1', text: 'Although the weather was unpredictable, the team decided to continue with the outdoor event.' },
  { level: 'B2', text: 'Climate change is one of the most pressing issues of our generation, requiring international cooperation.' },
  { level: 'C1', text: 'The intricate relationship between technology and society has been the subject of countless academic debates.' },
];

const IELTS_PROMPTS = [
  'Describe a place you have visited that left a strong impression on you. Say where it is, when you went there, what you did, and explain why it impressed you.',
  'Talk about a skill you would like to learn in the future. Explain what the skill is, why you want to learn it, and how it might help you.',
  'Describe an important decision you have made. Say what the decision was, when you made it, and why it was important.',
];

export default function SpeakingPage() {
  const { user } = useAuthStore();
  const level = user?.current_level || 'B1';
  const [mode, setMode] = useState<Mode>('pronunciation');

  useEffect(() => () => stopBrowserTTS(), []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">Speaking</h1>
        <p className="mt-1 text-ink-secondary">Real-time AI feedback on pronunciation, fluency, and conversation.</p>
      </div>

      <div className="flex gap-2 rounded-2xl bg-surface-muted p-1.5">
        <ModeBtn active={mode === 'pronunciation'} onClick={() => setMode('pronunciation')} icon={Mic}>Pronunciation</ModeBtn>
        <ModeBtn active={mode === 'conversation'} onClick={() => setMode('conversation')} icon={MessageSquare}>Live Conversation</ModeBtn>
        <ModeBtn active={mode === 'ielts'} onClick={() => setMode('ielts')} icon={Trophy}>IELTS Speaking</ModeBtn>
      </div>

      {mode === 'pronunciation' && <PronunciationMode level={level} />}
      {mode === 'conversation' && <ConversationMode level={level} />}
      {mode === 'ielts' && <IELTSMode />}
    </div>
  );
}

function ModeBtn({ active, onClick, icon: Icon, children }: any) {
  return (
    <button onClick={onClick} className={clsx('flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition', active ? 'bg-white text-navy shadow-card' : 'text-ink-secondary hover:text-navy')}>
      <Icon className="h-4 w-4" /> {children}
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
    // For dialogue lines (with speaker), use browser TTS directly so we can pick a per-speaker voice.
    if (speaker) {
      setPlaying(true);
      browserTTS(text, { speaker, onEnd: () => setPlaying(false) });
      return;
    }
    setLoading(true);
    const url = await aiTTS(text);
    setLoading(false);
    if (url) {
      const a = new Audio(url);
      audioRef.current = a;
      a.onended = () => setPlaying(false);
      setPlaying(true);
      void a.play();
    } else {
      setPlaying(true);
      browserTTS(text, { onEnd: () => setPlaying(false) });
    }
  };
  return (
    <button onClick={play} className="btn-ghost text-sm">
      {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-teal/30 border-t-teal" /> : <Play className="h-4 w-4" />}
      {playing ? 'Stop' : 'Listen'}
    </button>
  );
}

function PlayAllButton({ dialogue }: { dialogue: Array<{ speaker: string; text: string }> }) {
  const [playing, setPlaying] = useState(false);
  const [idx, setIdx] = useState(-1);
  const cancelRef = useRef<() => void>(() => {});
  const start = () => {
    if (playing) { cancelRef.current(); setPlaying(false); setIdx(-1); return; }
    setPlaying(true);
    cancelRef.current = speakSequence(
      dialogue.map((d) => ({ text: d.text, speaker: d.speaker })),
      { onProgress: setIdx, onDone: () => { setPlaying(false); setIdx(-1); } },
    );
  };
  return (
    <button onClick={start} className="btn-accent text-sm">
      {playing ? <><Volume2 className="h-4 w-4 animate-pulse" /> Stop ({idx + 1}/{dialogue.length})</> : <><Play className="h-4 w-4" /> Play full conversation</>}
    </button>
  );
}

function PronunciationMode({ level }: { level: string }) {
  const [prompt, setPrompt] = useState(() => PRACTICE_PROMPTS.find((p) => p.level === level) || PRACTICE_PROMPTS[2]);
  const [result, setResult] = useState<SpeechAssessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const newPrompt = () => {
    const others = PRACTICE_PROMPTS.filter((p) => p.text !== prompt.text);
    setPrompt(others[Math.floor(Math.random() * others.length)]);
    setResult(null); setErr(null);
  };

  const onRecorded = async (blob: Blob) => {
    setLoading(true); setErr(null); setResult(null);
    try { setResult(await assessRealtime(blob, prompt.text)); }
    catch (e: any) { setErr(e?.response?.data?.detail || e?.message || 'Assessment failed.'); }
    finally { setLoading(false); }
  };

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

      <div>
        {loading && <Loading text="Analyzing pronunciation…" />}
        {err && <ErrorBox msg={err} />}
        {result && <SpeechResults result={result} />}
        {!loading && !err && !result && (
          <div className="card p-8 text-center text-ink-disabled">
            <Mic className="mx-auto mb-2 h-10 w-10 opacity-40" />
            <p className="text-sm">Record yourself to see word-by-word and phoneme scores.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ConversationMode({ level }: { level: string }) {
  const TOPICS = ['Travel', 'Food & cooking', 'Work life', 'Movies', 'Hobbies', 'Daily routine'];
  const [topic, setTopic] = useState<string | null>(null);
  const [convo, setConvo] = useState<ConversationDialogue | null>(null);
  const [turnIdx, setTurnIdx] = useState(0);
  const [userTurns, setUserTurns] = useState<Array<{ transcript?: string; ai_response?: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const startTopic = async (t: string) => {
    setTopic(t); setConvo(null); setTurnIdx(0); setUserTurns([]); setErr(null); setLoading(true);
    try {
      const c = await generateConversation(t.toLowerCase(), level, 6);
      setConvo(c);
    } catch (e: any) { setErr(e?.response?.data?.detail || e?.message || 'Could not start conversation.'); }
    finally { setLoading(false); }
  };

  const onUserAudio = async (blob: Blob) => {
    setLoading(true); setErr(null);
    try {
      const data = await audioConversation(blob);
      setUserTurns((u) => [...u, data]);
      setTurnIdx((i) => i + 1);
    } catch (e: any) { setErr(e?.response?.data?.detail || e?.message || 'Could not process audio.'); }
    finally { setLoading(false); }
  };

  if (!topic) {
    return (
      <div className="card p-8">
        <h3 className="mb-2 font-display text-xl font-bold text-navy">Pick a topic</h3>
        <p className="mb-6 text-sm text-ink-secondary">A scripted scenario opens, then you take over and respond by voice.</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {TOPICS.map((t) => <button key={t} onClick={() => startTopic(t)} className="btn-secondary justify-start">{t}</button>)}
        </div>
      </div>
    );
  }

  if (loading && !convo) return <Loading text="Preparing conversation…" />;
  if (err && !convo) return <ErrorBox msg={err} onRetry={() => setTopic(null)} />;
  if (!convo) return null;

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <div className="mb-3 flex items-center justify-between">
          <span className="chip">Topic: {topic}</span>
          <button onClick={() => { setTopic(null); setConvo(null); }} className="btn-ghost text-sm">Change</button>
        </div>
        <p className="text-sm italic text-ink-secondary">{convo.scenario}</p>
      </div>

      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="font-display font-bold text-navy">Conversation</h4>
          <PlayAllButton dialogue={convo.dialogue.slice(0, turnIdx + 1)} />
        </div>
        <div className="space-y-3">
          {convo.dialogue.slice(0, turnIdx + 1).map((d, i) => {
            const g = genderForSpeaker(d.speaker);
            return (
              <div key={i} className="rounded-xl bg-surface-muted p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-teal">
                    {g === 'female' ? '♀' : '♂'} {d.speaker}
                  </span>
                  <PlayButton text={d.text} speaker={d.speaker} />
                </div>
                <p className="text-sm text-ink-primary">{d.text}</p>
              </div>
            );
          })}
          {userTurns.map((u, i) => (
            <div key={`u${i}`} className="space-y-2">
              {u.transcript && (
                <div className="ml-8 rounded-xl bg-navy p-3 text-white">
                  <div className="mb-1 text-xs font-bold uppercase opacity-70">You said</div>
                  <p className="text-sm">{u.transcript}</p>
                </div>
              )}
              {u.ai_response && (
                <div className="rounded-xl border-l-4 border-teal bg-teal/5 p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-teal">Coach</span>
                    <PlayButton text={u.ai_response} />
                  </div>
                  <p className="text-sm text-ink-primary">{u.ai_response}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        {err && <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      </div>

      <AudioRecorder onComplete={onUserAudio} maxSeconds={30} label="Tap to respond in your own words" />
    </div>
  );
}

function IELTSMode() {
  const [prompt, setPrompt] = useState(IELTS_PROMPTS[0]);
  const [result, setResult] = useState<SpeechAssessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const newPrompt = () => {
    const others = IELTS_PROMPTS.filter((p) => p !== prompt);
    setPrompt(others[Math.floor(Math.random() * others.length)]);
    setResult(null); setErr(null);
  };

  const onRecorded = async (blob: Blob) => {
    setLoading(true); setErr(null); setResult(null);
    try { setResult(await assessRealtime(blob, prompt)); }
    catch (e: any) { setErr(e?.response?.data?.detail || e?.message || 'Assessment failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="card p-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="chip bg-amber-100 text-amber-700">IELTS Part 2</span>
            <div className="flex gap-2">
              <PlayButton text={prompt} />
              <button onClick={newPrompt} className="btn-ghost text-sm"><RefreshCcw className="h-4 w-4" /> New</button>
            </div>
          </div>
          <p className="text-base leading-relaxed text-ink-primary">{prompt}</p>
          <p className="mt-3 text-xs text-ink-secondary">Speak for 1–2 minutes.</p>
        </div>
        <AudioRecorder onComplete={onRecorded} maxSeconds={120} label="Tap to start your 2-minute response" />
      </div>
      <div>
        {loading && <Loading text="Scoring your response…" />}
        {err && <ErrorBox msg={err} />}
        {result && <SpeechResults result={result} />}
        {!loading && !err && !result && (
          <div className="card p-8 text-center text-ink-disabled">
            <Trophy className="mx-auto mb-2 h-10 w-10 opacity-40" />
            <p className="text-sm">Your IELTS-style score will appear here.</p>
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
function ErrorBox({ msg, onRetry }: { msg: string; onRetry?: () => void }) {
  return (
    <div className="card p-6 text-center">
      <p className="mb-4 text-red-700">{typeof msg === 'string' ? msg : 'Something went wrong.'}</p>
      {onRetry && <button onClick={onRetry} className="btn-secondary">Try again</button>}
    </div>
  );
}
// preserve unused import noise
void Volume2;
