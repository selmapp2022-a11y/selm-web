import { Headphones, BookOpen, Mic, PenLine, Brain } from 'lucide-react';
import type { ComponentType } from 'react';

/**
 * How each skill looks, decided once.
 *
 * ── Why this exists ───────────────────────────────────────────────────────
 * The 29 August standardisation removed the invented scoreboard, and with it
 * removed most of the colour on the page — the founder's words: *the pages
 * have all become uniform and lifeless.* He is right, and the two things are
 * not the same problem. `Level 16` was dishonest. A teal ring around the
 * listening row is not; it is how a candidate finds their skill on a page
 * without reading four labels.
 *
 * So colour comes back, but as MEANING rather than decoration: one hue per
 * skill, the same hue everywhere that skill appears — Practice, Today's
 * standing rows, Progress, the attempt list. A candidate learns the four
 * colours once. That is the opposite of a gradient chosen because a card
 * looked empty.
 *
 * Vocabulary is deliberately outside the four. It supports them and is not one
 * of them, and its colour says so by not being one of the four.
 */
export type SkillLook = {
  label: string;
  icon: ComponentType<{ className?: string }>;
  /** Solid fill for the icon tile. */
  tile: string;
  /** Tint for a row or badge background. */
  soft: string;
  /** Text/stroke accent. */
  ink: string;
  /** The bar or rule under the row. */
  bar: string;
};

export const SKILL_LOOK: Record<string, SkillLook> = {
  listening: {
    label: 'Listening',
    icon: Headphones,
    tile: 'bg-gradient-to-br from-sky-500 to-sky-700',
    soft: 'bg-sky-500/10',
    ink: 'text-sky-600 dark:text-sky-300',
    bar: 'bg-sky-500',
  },
  reading: {
    label: 'Reading',
    icon: BookOpen,
    tile: 'bg-gradient-to-br from-amber-500 to-orange-600',
    soft: 'bg-amber-500/10',
    ink: 'text-amber-600 dark:text-amber-300',
    bar: 'bg-amber-500',
  },
  writing: {
    label: 'Writing',
    icon: PenLine,
    tile: 'bg-gradient-to-br from-violet-500 to-purple-700',
    soft: 'bg-violet-500/10',
    ink: 'text-violet-600 dark:text-violet-300',
    bar: 'bg-violet-500',
  },
  speaking: {
    label: 'Speaking',
    icon: Mic,
    tile: 'bg-gradient-to-br from-teal-500 to-teal-700',
    soft: 'bg-teal-500/10',
    ink: 'text-teal-600 dark:text-teal-300',
    bar: 'bg-teal-500',
  },
  vocabulary: {
    label: 'Vocabulary',
    icon: Brain,
    tile: 'bg-gradient-to-br from-slate-400 to-slate-600',
    soft: 'bg-slate-500/10',
    ink: 'text-slate-500 dark:text-slate-300',
    bar: 'bg-slate-400',
  },
};

/** A section's skill, mapped from the four exam skills. Falls back gracefully. */
export function lookFor(skill: string | undefined | null): SkillLook {
  return (skill && SKILL_LOOK[skill]) || SKILL_LOOK.vocabulary;
}
