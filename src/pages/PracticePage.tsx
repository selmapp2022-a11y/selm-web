import { Mic, Headphones, BookOpen, PenLine, Brain } from 'lucide-react';
import { Board, BoardGrid, BoardRow } from '../components/Board';
import type { ComponentType } from 'react';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { lookFor } from '../lib/skillLook';
import { ts, useUiLangValue, type Key } from '../i18n';

/**
 * SELM-IA.md §5 — one "start practising".
 *
 * The navigation used to list the four skills and Vocabulary as five siblings.
 * This is the single Practice entry. It shows the four exam skills; choosing
 * one opens that skill, where the exam's own tasks run in place (built in the
 * "practice tabs" pass). Vocabulary is a support surface, not a fifth skill,
 * so it is a card here rather than a sibling in the nav.
 */
// The four cards hold KEYS, not words. §5.2 — a label written here is a label
// a francophone candidate reads in English on the page that decides what they
// practise next.
const SKILLS = [
  { to: '/practice/speaking',  skill: 'speaking',  label: 'nav.speaking',  icon: Mic,        blurb: 'practice.speakingBlurb' },
  { to: '/practice/listening', skill: 'listening', label: 'nav.listening', icon: Headphones, blurb: 'practice.listeningBlurb' },
  { to: '/practice/reading',   skill: 'reading',   label: 'nav.reading',   icon: BookOpen,   blurb: 'practice.readingBlurb' },
  { to: '/practice/writing',   skill: 'writing',   label: 'nav.writing',   icon: PenLine,    blurb: 'practice.writingBlurb' },
] as const satisfies ReadonlyArray<{ to: string; skill: string; label: Key; icon: ComponentType<{ className?: string }>; blurb: Key }>;

export default function PracticePage() {
  const ui = useUiLangValue();
  useDocumentTitle(ts('nav.practice', ui));
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold text-navy dark:text-white">{ts('nav.practice', ui)}</h1>
        <p className="mt-1 text-ink-secondary">{ts('practice.hubBlurb', ui)}</p>
      </header>

      {/* ── ONE SHAPE, DECIDED IN `components/Board.tsx` ────────────────────
          These were wide rows with the icon beside an 18px title and a 14px
          blurb, and Vocabulary was a full-width card below them — three
          shapes on one tab, and none of them the shape Today used for the
          same four skills. The founder, 31 August: *"on every page the boards
          must be one size and one shape."* The four skills and Vocabulary are
          now the same Board that Today draws, in the same grid, and this file
          no longer decides how a card looks.

          Vocabulary is still not a fifth skill — IA §5. It keeps the support
          surface's own neutral colour, which is how it says so now that it
          cannot say it by being a different size. */}
      <BoardGrid>
        {SKILLS.map((s) => (
          <Board
            key={s.to}
            to={s.to}
            icon={s.icon}
            iconClass={lookFor(s.skill).tile}
            tint={lookFor(s.skill).soft}
            title={ts(s.label, ui)}
            titleClass={lookFor(s.skill).ink}
            meta={ts(s.blurb, ui)}
          />
        ))}
      </BoardGrid>

      {/* Vocabulary is a support surface, not a fifth skill — IA §5, and the
          shape says so. As a fifth tile it sat in the grid's left column and
          left a hole beside it; the founder, 1 September: *"make the
          vocabulary board a rectangle that runs the full width under the four
          blocks — no empty space."* It is the app's own full-width row, the
          same one Today uses under its four tiles, so the page still has
          exactly two card shapes and neither of them is new. */}
      <BoardRow
        to="/practice/vocabulary"
        icon={Brain}
        iconClass="bg-gradient-to-br from-slate-500 to-slate-700 text-white"
        title={ts('nav.vocabulary', ui)}
        sub={ts('practice.vocabBlurb', ui)}
      />
    </div>
  );
}
