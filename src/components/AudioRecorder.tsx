import { useEffect, useRef, useState } from 'react';
import { AudioRecorder as Rec } from '../lib/audio';
import { Mic, Square, Loader2 } from 'lucide-react';
import clsx from 'clsx';

type Props = {
  onComplete: (blob: Blob, durationMs: number) => void;
  maxSeconds?: number;
  disabled?: boolean;
  label?: string;
};

const BAR_COUNT = 32;

export function AudioRecorder({ onComplete, maxSeconds = 60, disabled, label }: Props) {
  const recRef = useRef<Rec | null>(null);
  const [state, setState] = useState<'idle' | 'requesting' | 'recording' | 'processing'>('idle');
  const [bars, setBars] = useState<number[]>(Array(BAR_COUNT).fill(0));
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => {
    recRef.current?.stop();
    if (timerRef.current) window.clearInterval(timerRef.current);
  }, []);

  const start = async () => {
    setError(null);
    setSeconds(0);
    setBars(Array(BAR_COUNT).fill(0));
    setState('requesting');
    const rec = new Rec({
      onAmplitude: (lvl) => {
        setBars((prev) => {
          const next = [...prev.slice(1), lvl];
          return next;
        });
      },
      onStop: (blob, durationMs) => {
        setState('processing');
        onComplete(blob, durationMs);
        setTimeout(() => setState('idle'), 800);
      },
      onError: (err) => {
        setError(err.message || 'Could not access microphone.');
        setState('idle');
      },
    });
    recRef.current = rec;
    try {
      await rec.start();
      setState('recording');
      timerRef.current = window.setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= maxSeconds) {
            stop();
            return s + 1;
          }
          return s + 1;
        });
      }, 1000);
    } catch {
      // handled by onError
    }
  };

  const stop = () => {
    recRef.current?.stop();
    if (timerRef.current) window.clearInterval(timerRef.current);
  };

  const isActive = state === 'recording';

  return (
    <div className="rounded-2xl bg-surface-card border border-surface-divider p-6">
      {label && <div className="mb-4 text-center text-sm font-medium text-ink-secondary">{label}</div>}

      <div className="flex h-20 items-center justify-center gap-1">
        {bars.map((v, i) => (
          <div
            key={i}
            className={clsx(
              'w-1.5 rounded-full transition-all duration-75',
              isActive ? 'bg-teal' : 'bg-surface-divider'
            )}
            style={{ height: `${Math.max(4, v * 64)}px` }}
          />
        ))}
      </div>

      <div className="mt-4 text-center font-mono text-2xl text-navy">
        {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}
        <span className="ml-2 text-sm text-ink-disabled">/ {String(Math.floor(maxSeconds / 60)).padStart(2, '0')}:{String(maxSeconds % 60).padStart(2, '0')}</span>
      </div>

      <div className="mt-6 flex justify-center">
        {state === 'idle' && (
          <button onClick={start} disabled={disabled} className="btn-accent w-48">
            <Mic className="h-5 w-5" /> Start recording
          </button>
        )}
        {state === 'requesting' && (
          <button disabled className="btn-secondary w-48">
            <Loader2 className="h-5 w-5 animate-spin" /> Requesting mic…
          </button>
        )}
        {state === 'recording' && (
          <button onClick={stop} className="btn w-48 bg-red-500 text-white hover:bg-red-600">
            <Square className="h-4 w-4" /> Stop ({maxSeconds - seconds}s)
          </button>
        )}
        {state === 'processing' && (
          <button disabled className="btn-secondary w-48">
            <Loader2 className="h-5 w-5 animate-spin" /> Processing…
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
