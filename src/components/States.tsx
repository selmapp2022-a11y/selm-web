/**
 * Loading, empty and error — the three states the application already had,
 * lifted out of the pages that had each grown a private copy.
 *
 * Nothing here is new. `Loader` and `ErrorBox` are moved verbatim from
 * ListeningPage and SpeakingPage, which had defined the same two components
 * twice; `EmptyState` is the `card p-10 text-center` block that appears in
 * ListeningPage, ReadingPage, VocabularyPage and AssessmentPage.
 *
 * They live here so the exam engine can *import* them rather than copy their
 * styles — two things that look alike today drift apart on the first change.
 */
import type { ReactNode } from 'react';

export function Loader({ text }: { text?: string }) {
  return (
    <div className="card flex h-64 items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-teal/30 border-t-teal" />
        {text && <p className="text-sm text-ink-secondary">{text}</p>}
      </div>
    </div>
  );
}

export function ErrorBox({ msg, onRetry }: { msg: string; onRetry?: () => void }) {
  return (
    <div className="card p-6 text-center">
      <p className="mb-4 text-red-700">{typeof msg === 'string' ? msg : 'Something went wrong.'}</p>
      {onRetry && <button onClick={onRetry} className="btn-secondary">Try again</button>}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: (p: { className?: string }) => ReactNode;
  title?: string;
  body?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="card p-10 text-center">
      <Icon className="mx-auto mb-4 h-12 w-12 text-teal" />
      {title && <h3 className="mb-2 font-display text-xl font-bold text-navy">{title}</h3>}
      {body && <p className="mb-6 text-ink-secondary">{body}</p>}
      {action}
    </div>
  );
}
