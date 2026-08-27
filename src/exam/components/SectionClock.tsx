import { Clock } from 'lucide-react';
import clsx from 'clsx';

/**
 * A count-down the application has no counterpart for.
 *
 * Built from the pieces that are already there rather than designed fresh:
 * the numerals are `font-mono … text-navy`, which is the one clock the app
 * ships (`AudioRecorder`'s recording timer); the tray is the `rounded-xl
 * bg-surface-muted px-3 py-2` chip used for quiet inline stats; and both the
 * last-minute and the over-time states use the app's `bg-red-50 /
 * text-red-700` pair, which `global.css` already carries dark-mode rules for.
 */
export function SectionClock({
  seconds,
  label,
  tone = 'normal',
}: {
  seconds: number;
  label: string;
  tone?: 'normal' | 'warn' | 'over';
}) {
  const s = Math.max(0, Math.abs(seconds));
  const mmss = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const red = tone !== 'normal';
  return (
    <div className={clsx('flex shrink-0 items-center gap-2 rounded-xl px-3 py-2', red ? 'bg-red-50' : 'bg-surface-muted')}>
      <Clock className={clsx('h-4 w-4', red ? 'text-red-700' : 'text-ink-secondary')} />
      <span className={clsx('font-mono text-xl tabular-nums', red ? 'text-red-700' : 'text-navy')}>
        {tone === 'over' ? '+' : ''}{mmss}
      </span>
      <span className="text-[10px] uppercase tracking-wide text-ink-secondary">{label}</span>
    </div>
  );
}

/**
 * The app's progress bar, unchanged: `h-2 overflow-hidden rounded-full
 * bg-surface-muted` with a `bg-navy` fill. It appears in six of the app's own
 * pages with exactly these classes, so it is written once here and imported.
 */
export function ProgressBar({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  return (
    <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
      <div className="h-full rounded-full bg-navy transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}
