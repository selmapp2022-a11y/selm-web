import { Link } from 'react-router-dom';
import { Mic, Headphones, BookOpen, PenLine, Brain, ChevronRight } from 'lucide-react';

/**
 * SELM-IA.md §5 — one "start practising".
 *
 * The navigation used to list the four skills and Vocabulary as five siblings.
 * This is the single Practice entry. It shows the four exam skills; choosing
 * one opens that skill, where the exam's own tasks run in place (built in the
 * "practice tabs" pass). Vocabulary is a support surface, not a fifth skill,
 * so it is a card here rather than a sibling in the nav.
 */
const SKILLS = [
  { to: '/speaking',  label: 'Speaking',  icon: Mic,        blurb: 'Record the exam’s speaking tasks and get scored feedback.' },
  { to: '/listening', label: 'Listening', icon: Headphones, blurb: 'The exam’s own listening questions, one at a time.' },
  { to: '/reading',   label: 'Reading',   icon: BookOpen,   blurb: 'The exam’s own reading passages and questions.' },
  { to: '/writing',   label: 'Writing',   icon: PenLine,    blurb: 'Write each exam task and get scored feedback.' },
] as const;

export default function PracticePage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold text-navy">Practice</h1>
        <p className="mt-1 text-ink-secondary">
          Your four exam skills. Pick one and work its tasks — in the language your exam is set in.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {SKILLS.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            className="card flex items-center justify-between gap-4 p-5 text-left hover:shadow-cardHover"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-navy to-teal text-white">
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-display text-lg font-bold text-navy">{s.label}</div>
                <div className="mt-0.5 text-sm text-ink-secondary">{s.blurb}</div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-ink-secondary" />
          </Link>
        ))}
      </div>

      {/* Vocabulary is a support surface, not a fifth skill — IA §5. */}
      <Link to="/vocabulary" className="card flex items-center gap-4 p-5 hover:shadow-cardHover">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface-muted text-navy">
          <Brain className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-base font-bold text-navy">Vocabulary</div>
          <div className="mt-0.5 text-sm text-ink-secondary">Extra practice that supports the four skills — not one of them.</div>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-ink-secondary" />
      </Link>
    </div>
  );
}
