import type { ComponentType, ReactNode } from 'react';

/**
 * A section heading with a mark on it.
 *
 * Every page on this product is a stack of `<h2>`s over cards, and after the
 * scoreboard was removed they all read the same weight — the founder's
 * complaint that the pages had gone flat. A heading that carries its own icon
 * and a coloured rule gives the eye somewhere to land and tells the reader
 * which of four or five sections they are in without re-reading the words.
 *
 * It is one component so the sections cannot drift apart again.
 */
export function SectionHeading({
  icon: Icon,
  children,
  meta,
  accent = 'text-teal',
}: {
  icon?: ComponentType<{ className?: string }>;
  children: ReactNode;
  meta?: ReactNode;
  accent?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <span className={`flex h-8 w-8 items-center justify-center rounded-xl bg-teal/10 ${accent}`}>
            <Icon className="h-4 w-4" />
          </span>
        )}
        <h2 className="font-display text-xl font-bold text-navy dark:text-white">{children}</h2>
      </div>
      {meta && <span className="text-xs text-ink-secondary">{meta}</span>}
    </div>
  );
}
