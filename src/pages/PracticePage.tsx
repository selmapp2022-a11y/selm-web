import { Link } from 'react-router-dom';
import { Mic, Headphones, BookOpen, PenLine, Brain, ChevronRight } from 'lucide-react';
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
] as const satisfies ReadonlyArray<{ to: string; skill: string; label: Key; icon: unknown; blurb: Key }>;

export default function PracticePage() {
  const ui = useUiLangValue();
  useDocumentTitle(ts('nav.practice', ui));
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold text-navy">{ts('nav.practice', ui)}</h1>
        <p className="mt-1 text-ink-secondary">{ts('practice.hubBlurb', ui)}</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {SKILLS.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            className="card flex items-center justify-between gap-4 p-5 text-left hover:shadow-cardHover"
          >
            <div className="flex items-center gap-4">
              {/* The skill's own colour, from `lib/skillLook.ts`. Four cards
                  in one teal made the hub read as a single object; the hue is
                  what a candidate recognises on Today and Progress too. */}
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm ${lookFor(s.skill).tile}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-display text-lg font-bold text-navy">{ts(s.label, ui)}</div>
                <div className="mt-0.5 text-sm text-ink-secondary">{ts(s.blurb, ui)}</div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-ink-secondary" />
          </Link>
        ))}
      </div>

      {/* Vocabulary is a support surface, not a fifth skill — IA §5. */}
      <Link to="/practice/vocabulary" className="card flex items-center gap-4 p-5 hover:shadow-cardHover">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface-muted text-navy">
          <Brain className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-base font-bold text-navy">{ts('nav.vocabulary', ui)}</div>
          <div className="mt-0.5 text-sm text-ink-secondary">{ts('practice.vocabBlurb', ui)}</div>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-ink-secondary" />
      </Link>
    </div>
  );
}
