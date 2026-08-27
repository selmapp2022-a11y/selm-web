import { useEffect, useRef } from 'react';
import { Play, Volume2 } from 'lucide-react';
import clsx from 'clsx';

/**
 * One play, and no way to buy a second.
 *
 * The application's `AudioPlayer` cannot be imported here: it offers a scrub
 * bar, a restart button and five playback rates, every one of which breaks the
 * delivery rule this section runs under. So this is the one control that had to
 * be new — and it is built out of `AudioPlayer`'s own parts: the same
 * `rounded-2xl bg-navy p-6 text-white shadow-card` panel, the same `h-14 w-14`
 * round icon well, and the app's `.btn-accent` for the action. What is missing
 * from it is missing on purpose.
 *
 * The played flag is raised by the caller *before* the audio starts, so a
 * reload, a double click or a failed play does not hand back a second listen.
 */
export function PlayOnce({
  src,
  played,
  onPlayed,
  onEnded,
  label,
  note,
}: {
  src?: string;
  played: boolean;
  onPlayed: () => void;
  onEnded?: () => void;
  label: string;
  note?: string;
}) {
  const audio = useRef<HTMLAudioElement | null>(null);
  useEffect(() => { audio.current?.load(); }, [src]);

  return (
    <div className="rounded-2xl bg-navy p-6 text-white shadow-card">
      <audio ref={audio} src={src} onEnded={onEnded} className="hidden" preload="auto" />
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/10">
          {played ? <Volume2 className="h-6 w-6 text-white/60" /> : <Play className="ml-1 h-6 w-6" />}
        </div>
        <button
          disabled={played}
          onClick={() => {
            onPlayed();
            void audio.current?.play();
          }}
          className={clsx('flex-1', played ? 'btn bg-white/10 text-white' : 'btn-accent')}
        >
          {label}
        </button>
      </div>
      {note && <p className="mt-4 text-xs leading-relaxed text-white/70">{note}</p>}
    </div>
  );
}
