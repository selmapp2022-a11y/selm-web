import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';

/**
 * ONE BOARD, ONE SHAPE, EVERY PAGE.
 *
 * ── The defect this exists for ────────────────────────────────────────────
 * The founder, 31 August, looking at the deployed build's three tabs side by
 * side: *"the boards have a problem — on every page they must be one size and
 * one shape; each page is a different size and a different shape."*
 *
 * He is describing something the code made inevitable. Every screen drew its
 * own card from scratch, so the same object — a tappable thing with an icon, a
 * name and one line under it — arrived in three different bodies:
 *
 *     Today      2×2 grid, 8.5rem tall, 44px icon ABOVE a coloured title,
 *                one 11px meta line
 *     Practice   2×2 grid, ~5rem tall, 44px icon BESIDE an 18px navy title,
 *                a 14px blurb, a chevron — and Vocabulary full width, a
 *                fifth card in a fifth shape
 *     You        full-width rows, 2px border, a right-hand chip, no icon
 *
 * Nothing there is wrong on its own screen. Together they read as three
 * products, and the eye has to re-learn where the name is on every tab.
 *
 * ── The rule ──────────────────────────────────────────────────────────────
 * A screen may choose WHICH of these three it uses. It may not choose what
 * they look like. The three, and the only three:
 *
 *   `Board`     the tile. Fixed height, icon over title, one meta line, in a
 *               two-column grid. For a set of peer choices — the four skills,
 *               the destinations.
 *   `BoardRow`  the full-width strip. Icon beside title, one line under it,
 *               chevron. For a single onward link that is not a peer of
 *               anything beside it.
 *   `Panel`     the plain container for content that is not a choice — a
 *               form, a table, a paragraph.
 *
 * Height, padding, radius, icon size, title size and meta size live HERE and
 * are passed by nobody. Colour is the only thing a caller varies, because
 * colour carries meaning in this app (`lib/skillLook.ts`) and shape does not.
 */

/** The two-column grid every set of Boards is laid in. */
export function BoardGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

export type BoardProps = {
  /** Where it goes. A Board with neither `to` nor `onClick` is inert by design. */
  to?: string;
  onClick?: () => void;
  icon: ComponentType<{ className?: string }>;
  /** The icon tile's fill — the caller's one colour decision. */
  iconClass?: string;
  /** A tint behind the whole board, from the same palette. */
  tint?: string;
  title: string;
  /** The title's colour. Shape is fixed; hue is the skill's own. */
  titleClass?: string;
  /** One line, small. Nodes allowed so a progress bar can sit here. */
  meta?: ReactNode;
  /** A short badge in the top-right corner — a target level, a state. */
  badge?: ReactNode;
  /** Drawn as chosen, not as merely present. */
  selected?: boolean;
  /** Present but not available. Not a link, and says so. */
  locked?: boolean;
};

/**
 * ONE HEIGHT, NOT ONE MINIMUM.
 *
 * `min-h-` was not enough. A grid row stretches to its tallest cell, so
 * Practice's three-line blurbs made Practice's boards 11rem while Today's
 * two-line meta made Today's 8.5rem — every board on a page the same, and no
 * two pages the same, which is precisely the complaint. The height is fixed
 * here, and the two lines that can run long are clamped to fit it. A blurb
 * too long for two lines is a blurb to shorten, not a board to grow.
 */
const SHAPE = 'card relative flex h-[10.5rem] w-full flex-col overflow-hidden p-4 text-left';

export function Board({
  to,
  onClick,
  icon: Icon,
  iconClass,
  tint,
  title,
  titleClass,
  meta,
  badge,
  selected,
  locked,
}: BoardProps) {
  const body = (
    <>
      {badge !== undefined && (
        <span className="absolute right-3 top-3 rounded-full bg-teal/10 px-2 py-0.5 text-[11px] font-bold text-teal">
          {badge}
        </span>
      )}
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm ${
          locked ? 'bg-slate-300 dark:bg-slate-700' : (iconClass ?? 'bg-gradient-to-br from-navy to-teal')
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div
        className={`mt-3 line-clamp-2 font-display text-base font-bold leading-tight ${
          locked ? 'text-ink-secondary' : (titleClass ?? 'text-navy dark:text-white')
        }`}
      >
        {title}
      </div>
      {meta !== undefined && meta !== null && (
        <div className="mt-2 line-clamp-3 text-[11px] leading-snug text-ink-secondary">{meta}</div>
      )}
    </>
  );

  const ring = selected ? 'ring-2 ring-teal' : '';
  const paint = locked ? 'bg-surface-muted/60 opacity-90' : (tint ?? '');
  const cls = `${SHAPE} ${paint} ${ring} transition`.trim();

  if (locked || (!to && !onClick)) return <div className={cls}>{body}</div>;
  if (to) return <Link to={to} className={`${cls} hover:shadow-cardHover`}>{body}</Link>;
  return (
    <button type="button" onClick={onClick} className={`${cls} hover:shadow-cardHover`}>
      {body}
    </button>
  );
}

/**
 * The full-width strip. One onward link, never a set of them — a row of peers
 * is a `Board` grid, which is the distinction the three tabs were missing.
 */
export function BoardRow({
  to,
  href,
  icon: Icon,
  iconClass,
  tint,
  accent,
  title,
  eyebrow,
  sub,
  light,
}: {
  to?: string;
  href?: string;
  icon: ComponentType<{ className?: string }>;
  iconClass?: string;
  tint?: string;
  /** A 4px rule down the left edge, for a row that is an instruction. */
  accent?: string;
  title: string;
  eyebrow?: string;
  sub?: ReactNode;
  /** The row paints itself and carries light text (the upgrade card). */
  light?: boolean;
}) {
  const body = (
    <>
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm ${
          iconClass ?? 'bg-gradient-to-br from-navy to-teal text-white'
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        {eyebrow && (
          <div className="text-[11px] font-semibold uppercase tracking-wide text-teal">{eyebrow}</div>
        )}
        <div className={`truncate font-display text-base font-bold ${light ? '' : 'text-navy dark:text-white'}`}>
          {title}
        </div>
        {sub !== undefined && sub !== null && (
          <div className={`mt-0.5 text-[11px] leading-snug ${light ? 'text-white/80' : 'text-ink-secondary'}`}>
            {sub}
          </div>
        )}
      </div>
      <ChevronRight className={`h-5 w-5 shrink-0 ${light ? 'text-white/90' : 'text-ink-secondary'}`} />
    </>
  );

  // Same 4rem body as a Board's, one row instead of a column: the two shapes
  // are the same object seen from two directions, which is why they share the
  // icon tile, the title size and the meta size exactly.
  const cls = `card flex min-h-[4.75rem] items-center gap-4 overflow-hidden p-4 transition hover:shadow-cardHover ${
    accent ? `border-l-4 ${accent}` : ''
  } ${tint ?? ''}`.trim();

  if (href) return <a href={href} className={cls}>{body}</a>;
  return <Link to={to ?? '#'} className={cls}>{body}</Link>;
}

/** Content that is not a choice: a form, a table, a paragraph. One padding. */
export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={`card p-5 ${className ?? ''}`.trim()}>{children}</section>;
}
