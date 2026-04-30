import { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Volume2 } from 'lucide-react';
import clsx from 'clsx';

const RATES = [0.5, 0.75, 1, 1.25, 1.5];

type Props = {
  src?: string;
  fallbackText?: string; // use browser TTS if no audio src
  onEnd?: () => void;
};

export function AudioPlayer({ src, fallbackText, onEnd }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRate] = useState(1);
  const usingTTS = !src && !!fallbackText;

  useEffect(() => {
    if (!src) return;
    const a = new Audio(src);
    audioRef.current = a;
    a.preservesPitch = true;
    a.playbackRate = rate;
    a.addEventListener('timeupdate', () => setProgress(a.currentTime));
    a.addEventListener('loadedmetadata', () => setDuration(a.duration || 0));
    a.addEventListener('ended', () => { setPlaying(false); onEnd?.(); });
    return () => { a.pause(); audioRef.current = null; };
  }, [src]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = rate;
    if (usingTTS) (window as any).__selmTTSRate = rate;
  }, [rate, usingTTS]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (playing) audioRef.current.pause();
      else void audioRef.current.play();
      setPlaying(!playing);
    } else if (fallbackText) {
      if (playing) {
        speechSynthesis.cancel();
        setPlaying(false);
      } else {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(fallbackText);
        u.lang = 'en-US';
        u.rate = rate;
        u.onend = () => { setPlaying(false); onEnd?.(); };
        speechSynthesis.speak(u);
        setPlaying(true);
      }
    }
  };

  const restart = () => {
    if (audioRef.current) {
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
          {!usingTTS && (
            <>
              <div className="mb-1 flex justify-between font-mono text-xs opacity-70">
                <span>{fmt(progress)}</span>
                <span>{fmt(duration)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/20">
                <div className="h-full bg-teal transition-all" style={{ width: `${pct}%` }} />
              </div>
            </>
          )}
          {usingTTS && (
            <div className="text-sm opacity-80">
              <Volume2 className="mr-1 inline h-4 w-4" /> Browser voice
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
