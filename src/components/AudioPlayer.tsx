import { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, AlertCircle, Users } from 'lucide-react';
import clsx from 'clsx';
import { parseDialogue, speakSequence, stopBrowserTTS } from '../lib/tts';

const RATES = [0.5, 0.75, 1, 1.25, 1.5];

type Props = {
  src?: string;
  fallbackText?: string;
  onEnd?: () => void;
};

// Mode: try the real audio file first; if it fails (404/network),
// fall back to browser SpeechSynthesis using fallbackText.
export function AudioPlayer({ src, fallbackText, onEnd }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRate] = useState(1);
  const [audioFailed, setAudioFailed] = useState(false);

  useEffect(() => {
    setAudioFailed(false);
    setProgress(0);
    setDuration(0);
    setPlaying(false);
    if (!src) return;

    const a = new Audio();
    a.crossOrigin = 'anonymous';
    a.preload = 'metadata';
    a.preservesPitch = true;
    a.playbackRate = rate;
    audioRef.current = a;

    const onTime = () => setProgress(a.currentTime);
    const onMeta = () => setDuration(a.duration || 0);
    const onErr = () => { setAudioFailed(true); setPlaying(false); };
    const onEnded = () => { setPlaying(false); onEnd?.(); };

    a.addEventListener('timeupdate', onTime);
    a.addEventListener('loadedmetadata', onMeta);
    a.addEventListener('error', onErr);
    a.addEventListener('ended', onEnded);

    a.src = src;
    return () => {
      a.pause();
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('loadedmetadata', onMeta);
      a.removeEventListener('error', onErr);
      a.removeEventListener('ended', onEnded);
      audioRef.current = null;
      try { speechSynthesis.cancel(); } catch { /* */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }, [rate]);

  const usingTTS = (!src || audioFailed) && !!fallbackText;
  const dialogue = useMemo(() => (fallbackText ? parseDialogue(fallbackText) : null), [fallbackText]);
  const isDialogue = !!dialogue && dialogue.length >= 2;
  const cancelSeqRef = useRef<() => void>(() => {});
  const [seqIdx, setSeqIdx] = useState(-1);

  const playTTS = () => {
    if (!fallbackText) return;
    stopBrowserTTS();
    setSeqIdx(-1);
    if (isDialogue && dialogue) {
      setPlaying(true);
      cancelSeqRef.current = speakSequence(
        dialogue.map((d) => ({ text: d.text, speaker: d.speaker })),
        {
          rate,
          onProgress: setSeqIdx,
          onDone: () => { setPlaying(false); setSeqIdx(-1); onEnd?.(); },
        },
      );
      return;
    }
    const u = new SpeechSynthesisUtterance(fallbackText);
    u.lang = 'en-US';
    u.rate = rate;
    u.onend = () => { setPlaying(false); onEnd?.(); };
    speechSynthesis.speak(u);
    setPlaying(true);
  };

  const stopTTS = () => {
    cancelSeqRef.current();
    stopBrowserTTS();
    setPlaying(false);
    setSeqIdx(-1);
  };

  const togglePlay = async () => {
    if (usingTTS) {
      if (playing) stopTTS();
      else playTTS();
      return;
    }
    if (audioRef.current && !audioFailed) {
      if (playing) { audioRef.current.pause(); setPlaying(false); }
      else {
        try {
          await audioRef.current.play();
          setPlaying(true);
        } catch {
          setAudioFailed(true);
          if (fallbackText) playTTS();
        }
      }
    } else if (fallbackText) {
      playTTS();
    }
  };

  const restart = () => {
    if (audioRef.current && !audioFailed) {
      audioRef.current.currentTime = 0;
      setProgress(0);
    }
  };

  const fmt = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div className="rounded-2xl bg-navy p-6 text-white shadow-card">
      <div className="flex items-center gap-4">
        <button onClick={togglePlay} className="flex h-14 w-14 items-center justify-center rounded-full bg-teal text-white transition hover:bg-teal-600">
          {playing ? <Pause className="h-6 w-6" /> : <Play className="ml-1 h-6 w-6" />}
        </button>
        <div className="flex-1">
          {!usingTTS ? (
            <>
              <div className="mb-1 flex justify-between font-mono text-xs opacity-70">
                <span>{fmt(progress)}</span>
                <span>{fmt(duration)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/20">
                <div className="h-full bg-teal transition-all" style={{ width: `${pct}%` }} />
              </div>
            </>
          ) : (
            <div className="text-sm opacity-80">
              {isDialogue ? (
                <>
                  <Users className="mr-1 inline h-4 w-4" />
                  {playing && seqIdx >= 0 && dialogue
                    ? <>Now speaking: <span className="font-semibold text-teal">{dialogue[seqIdx].speaker}</span> ({seqIdx + 1}/{dialogue.length})</>
                    : <>Dialogue • {dialogue!.length} lines • {Array.from(new Set(dialogue!.map((d) => d.speaker))).join(' & ')}</>}
                </>
              ) : (
                <>
                  {audioFailed ? <AlertCircle className="mr-1 inline h-4 w-4" /> : <Volume2 className="mr-1 inline h-4 w-4" />}
                  {audioFailed ? 'Audio file unavailable — using browser voice' : 'Browser voice'}
                </>
              )}
            </div>
          )}
        </div>
        {!usingTTS && (
          <button onClick={restart} className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white">
            <RotateCcw className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="mt-4 flex items-center justify-center gap-1.5">
        {RATES.map((r) => (
          <button
            key={r}
            onClick={() => setRate(r)}
            className={clsx(
              'rounded-full px-3 py-1 text-xs font-bold transition',
              rate === r ? 'bg-teal text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            )}
          >
            {r}×
          </button>
        ))}
      </div>
    </div>
  );
}
