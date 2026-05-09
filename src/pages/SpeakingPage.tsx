import { useEffect, useRef, useState } from 'react';
import { Mic, MessageSquare, Trophy, RefreshCcw, Volume2, Play } from 'lucide-react';
import clsx from 'clsx';
import { AudioRecorder } from '../components/AudioRecorder';
import { SpeechResults } from '../components/SpeechResults';
import { assessRealtime, assessFreeform, audioConversation, type SpeechAssessment } from '../lib/speaking';
import { aiTTS, browserTTS, stopBrowserTTS } from '../lib/tts';
import { TopicPicker, SPEAKING_TOPICS } from '../components/TopicPicker';
import { useAuthStore } from '../store/authStore';
import { CompletionCard } from '../components/CompletionCard';

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
          <div className="card p-8 text-center text-ink-disabled">
            <Mic className="mx-auto mb-2 h-10 w-10 opacity-40" />
            <p className="text-sm">Record yourself to see word-by-word and phoneme scores.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Topic-specific opener so the user has something concrete to respond to. No
// scripted dialogue any more — just one greeting + question, then the user
// drives the conversation by speaking freely.
const CONVERSATION_OPENERS: Record<string, string> = {
  travel: "Hi! Tell me about a trip you really enjoyed. Where did you go and what made it memorable?",
  food: "Hi! What's a meal you love cooking or eating? Tell me about it.",
  work: "Hi! Tell me about your job — or a job you'd love to do. What's a typical day like?",
  movies: "Hi! What's the last movie or show you watched? Did you enjoy it? Why?",
  hobbies: "Hi! What do you like to do in your free time? How did you get into it?",
  daily_routine: "Hi! Walk me through your typical day, from morning until evening.",
  shopping: "Hi! Tell me about the last thing you bought. Why did you choose it?",
  health: "Hi! What do you do to stay healthy? Tell me about your routine.",
  family: "Hi! Tell me a little about your family or the people closest to you.",
  music: "Hi! What kind of music do you love? Who's an artist you'd recommend?",
  sports: "Hi! Do you play or follow any sports? Tell me about it.",
  school: "Hi! What's a subject you've enjoyed studying — or are studying now? Tell me why.",
};

function ConversationMode({ level: _level }: { level: string }) {
  const [topic, setTopic] = useState<string | null>(null);
  const [topicLabel, setTopicLabel] = useState<string>('');
  // Each turn: AI opener / AI follow-up, then user transcript, then AI reply.
  const [turns, setTurns] = useState<Array<{ kind: 'ai' | 'user'; text: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const startTopic = (value: string, label: string) => {
    const opener =
      CONVERSATION_OPENERS[value] ||
      `Hi! Let's chat about ${label.toLowerCase()}. What comes to mind first?`;
    setTopic(value);
    setTopicLabel(label);
    setTurns([{ kind: 'ai', text: opener }]);
    setErr(null);
  };

  const onUserAudio = async (blob: Blob) => {
    setLoading(true); setErr(null);
    try {
      const ctx = `${topicLabel || topic || 'general conversation'} — friendly free-form practice`;
      const data = await audioConversation(blob, ctx);
      const userText = (data.transcript || '').trim();
      const aiText = (data.ai_response || '').trim();
      setTurns((t) => {
        const next = [...t];
        if (userText) next.push({ kind: 'user', text: userText });
        else next.push({ kind: 'user', text: '(We could not hear you clearly — try again.)' });
        if (aiText) next.push({ kind: 'ai', text: aiText });
        return next;
      });
    } catch (e: any) {
      setErr(e?.response?.data?.detail || e?.message || 'Could not process audio.');
    } finally {
      setLoading(false);
    }
  };

  if (!topic) {
    return (
      <TopicPicker
        topics={SPEAKING_TOPICS}
        title="Pick a conversation topic"
        subtitle="Chat freely with your AI coach. No script — just speak in your own words and you'll get a transcript, a reply, and gentle corrections."
        onPick={(value, t) => startTopic(value, t.label)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <div className="mb-3 flex items-center justify-between">
          <span className="chip">Topic: {topicLabel || topic}</span>
          <button
            onClick={() => { setTopic(null); setTurns([]); setErr(null); }}
            className="btn-ghost text-sm"
          >
            Change topic
          </button>
        </div>
        <p className="text-sm italic text-ink-secondary">
          Speak naturally — your AI coach will reply, ask follow-ups, and quietly correct any mistakes.
        </p>
      </div>

      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="font-display font-bold text-navy">Conversation</h4>
        </div>
        <div className="space-y-3">
          {turns.map((t, i) => {
            if (t.kind === 'ai') {
              return (
                <div key={i} className="rounded-xl border-l-4 border-teal bg-teal/5 p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-teal">Coach</span>
                    <PlayButton text={t.text} />
                  </div>
                  <p className="text-sm text-ink-primary">{t.text}</p>
                </div>
              );
            }
            return (
              <div key={i} className="ml-8 rounded-xl bg-navy p-3 text-white">
                <div className="mb-1 text-xs font-bold uppercase opacity-70">You said</div>
                <p className="text-sm">{t.text}</p>
              </div>
            );
          })}
          {loading && <Loading text="Listening and thinking…" />}
        </div>
        {err && <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      </div>

      <AudioRecorder onComplete={onUserAudio} maxSeconds={30} label="Tap and speak your reply" />
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
      <div className="space-y-4">
        {loading && <Loading text="Scoring your response…" />}
        {err && <ErrorBox msg={err} />}
        {result && <SpeechResults result={result} />}
        {result && (
          <CompletionCard
            skill="speaking"
            topic="IELTS Part 2"
            score={Math.round(result.overall_score)}
            onNext={newPrompt}
            nextLabel="Try the next IELTS prompt"
          />
        )}
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
