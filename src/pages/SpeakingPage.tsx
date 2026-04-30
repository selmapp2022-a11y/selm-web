import { useEffect, useState } from 'react';
import { Mic, MessageSquare, Trophy, RefreshCcw, Volume2 } from 'lucide-react';
import clsx from 'clsx';
import { AudioRecorder } from '../components/AudioRecorder';
import { SpeechResults } from '../components/SpeechResults';
import { assessRealtime, audioConversation, generateConversationPrompt, type SpeechAssessment } from '../lib/speaking';
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
  'Describe a place you have visited that left a strong impression on you. You should say where it is, when you went there, what you did, and explain why it impressed you.',
  'Talk about a skill you would like to learn in the future. Explain what the skill is, why you want to learn it, and how it might help you.',
  'Describe an important decision you have made. Say what the decision was, when you made it, and why it was important.',
];

export default function SpeakingPage() {
  const { user } = useAuthStore();
  const level = user?.current_level || 'B1';
  const [mode, setMode] = useState<Mode>('pronunciation');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">Speaking</h1>
        <p className="mt-1 text-ink-secondary">Real-time AI feedback on pronunciation, fluency, and conversation.</p>
      </div>

      <div className="flex gap-2 rounded-2xl bg-surface-muted p-1.5">
        <ModeButton active={mode === 'pronunciation'} onClick={() => setMode('pronunciation')} icon={Mic}>
          Pronunciation
        </ModeButton>
        <ModeButton active={mode === 'conversation'} onClick={() => setMode('conversation')} icon={MessageSquare}>
          Live Conversation
        </ModeButton>
        <ModeButton active={mode === 'ielts'} onClick={() => setMode('ielts')} icon={Trophy}>
          IELTS Speaking
        </ModeButton>
      </div>

      {mode === 'pronunciation' && <PronunciationMode level={level} />}
      {mode === 'conversation' && <ConversationMode level={level} />}
      {mode === 'ielts' && <IELTSMode />}
    </div>
  );
}

function ModeButton({ active, onClick, icon: Icon, children }: any) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition',
        active ? 'bg-white text-navy shadow-card' : 'text-ink-secondary hover:text-navy'
      )}
    >
      <Icon className="h-4 w-4" /> {children}
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
    setResult(null);
    setErr(null);
  };

  const onRecorded = async (blob: Blob) => {
    setLoading(true);
    setErr(null);
    setResult(null);
    try {
      const r = await assessRealtime(blob, prompt.text);
      setResult(r);
    } catch (e: any) {
      setErr(e?.response?.data?.detail || e?.message || 'Assessment failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="card p-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="chip">Level {prompt.level}</span>
            <button onClick={newPrompt} className="btn-ghost text-sm">
              <RefreshCcw className="h-4 w-4" /> New prompt
            </button>
          </div>
          <p className="font-display text-xl leading-relaxed text-navy">"{prompt.text}"</p>
        </div>
        <AudioRecorder onComplete={onRecorded} maxSeconds={45} label="Read the sentence aloud" />
      </div>

      <div>
        {loading && (
          <div className="card flex h-64 items-center justify-center p-6">
            <div className="text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-teal/30 border-t-teal" />
              <p className="text-sm text-ink-secondary">Analyzing pronunciation…</p>
            </div>
          </div>
        )}
        {err && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{err}</div>}
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

type Turn = { role: 'ai' | 'user'; text: string; audio_url?: string };

function ConversationMode({ level }: { level: string }) {
  const TOPICS = ['Travel', 'Food & cooking', 'Work life', 'Movies', 'Hobbies', 'Daily routine'];
  const [topic, setTopic] = useState<string | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const startTopic = async (t: string) => {
    setTopic(t);
    setTurns([]);
    setErr(null);
    setLoading(true);
    try {
      const data = await generateConversationPrompt({ topic: t, level, turns: 6 });
      const opener = data?.opening || data?.first_message || data?.message || `Let's talk about ${t}. What's the first thing that comes to mind?`;
      setTurns([{ role: 'ai', text: opener }]);
      // try to TTS the opener
      speak(opener);
    } catch (e: any) {
      setErr(e?.response?.data?.detail || e?.message || 'Could not start conversation.');
    } finally {
      setLoading(false);
    }
  };

  const onUserAudio = async (blob: Blob) => {
    setLoading(true);
    setErr(null);
    try {
      const data = await audioConversation(blob);
      const userText = data.transcript || '(your turn)';
      const aiText = data.ai_response || '...';
      setTurns((t) => [...t, { role: 'user', text: userText }, { role: 'ai', text: aiText, audio_url: data.ai_audio_url }]);
      if (data.ai_audio_url) playUrl(data.ai_audio_url);
      else speak(aiText);
    } catch (e: any) {
      setErr(e?.response?.data?.detail || e?.message || 'Could not process audio.');
    } finally {
      setLoading(false);
    }
  };

  if (!topic) {
    return (
      <div className="card p-8">
        <h3 className="mb-2 font-display text-xl font-bold text-navy">Pick a topic</h3>
        <p className="mb-6 text-sm text-ink-secondary">Talk with an AI coach. Speak naturally — answer in your own words.</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {TOPICS.map((t) => (
            <button key={t} onClick={() => startTopic(t)} className="btn-secondary justify-start">{t}</button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
      <div className="card flex h-[500px] flex-col p-6">
        <div className="mb-4 flex items-center justify-between border-b border-surface-divider pb-3">
          <h3 className="font-display font-bold text-navy">Topic: {topic}</h3>
          <button onClick={() => { setTopic(null); setTurns([]); }} className="btn-ghost text-sm">Change topic</button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto pr-2">
          {turns.map((t, i) => (
            <div key={i} className={clsx('flex', t.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div
                className={clsx(
                  'max-w-[85%] rounded-2xl px-4 py-3 text-sm',
                  t.role === 'user' ? 'bg-navy text-white' : 'bg-surface-muted text-ink-primary'
                )}
              >
                {t.text}
                {t.role === 'ai' && (
                  <button onClick={() => speak(t.text)} className="ml-2 inline-block align-middle text-ink-secondary hover:text-teal">
                    <Volume2 className="inline h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-surface-muted px-4 py-3 text-sm text-ink-disabled">
                <span className="inline-flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-disabled" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-disabled [animation-delay:.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-disabled [animation-delay:.3s]" />
                </span>
              </div>
            </div>
          )}
        </div>
        {err && <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      </div>
      <AudioRecorder onComplete={onUserAudio} maxSeconds={30} label="Tap to respond" />
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
    setResult(null);
    setErr(null);
  };

  const onRecorded = async (blob: Blob) => {
    setLoading(true); setErr(null); setResult(null);
    try {
      const r = await assessRealtime(blob, prompt);
      setResult(r);
    } catch (e: any) {
      setErr(e?.response?.data?.detail || e?.message || 'Assessment failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="card p-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="chip bg-amber-100 text-amber-700">IELTS Part 2</span>
            <button onClick={newPrompt} className="btn-ghost text-sm">
              <RefreshCcw className="h-4 w-4" /> New cue card
            </button>
          </div>
          <p className="text-base leading-relaxed text-ink-primary">{prompt}</p>
          <p className="mt-3 text-xs text-ink-secondary">⏱ Speak for 1–2 minutes.</p>
        </div>
        <AudioRecorder onComplete={onRecorded} maxSeconds={120} label="Tap to start your 2-minute response" />
      </div>
      <div>
        {loading && (
          <div className="card flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-teal/30 border-t-teal" />
              <p className="text-sm text-ink-secondary">Scoring your response…</p>
            </div>
          </div>
        )}
        {err && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{err}</div>}
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

// Browser TTS fallback
function speak(text: string) {
  try {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.95;
    speechSynthesis.speak(u);
  } catch { /* ignore */ }
}

function playUrl(url: string) {
  try { const a = new Audio(url); void a.play(); } catch { /* ignore */ }
}

// Cleanup on unmount
export function _useCleanup() {
  useEffect(() => () => { if ('speechSynthesis' in window) speechSynthesis.cancel(); }, []);
}
