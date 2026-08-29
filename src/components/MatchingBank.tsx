import type { MatchingGroup } from '../exam/model/types';

/**
 * The shared lettered bank a set of matching questions draws from — rendered
 * ONCE, above its questions.
 *
 * This is IELTS matching and plan/map/diagram labelling, which are one
 * mechanism with different pictures. Rendering the bank per question would
 * both waste the screen and quietly change the task: a candidate who can see
 * the whole list at once is doing the exam's task, and one who sees it seven
 * times over is reading a different page.
 *
 * `figureSvg` is inlined by the exam definition rather than fetched, so a
 * section cannot render half-built because an image 404'd in the middle of a
 * timed sitting.
 */
export function MatchingBank({ group }: { group: MatchingGroup }) {
  return (
    <div className="card space-y-3 p-6">
      <p className="text-sm font-semibold text-navy dark:text-white">{group.instruction}</p>

      {group.figureSvg && (
        <div
          className="overflow-x-auto rounded-xl border border-surface-divider bg-white p-3"
          // The figure is authored in this repository, in the exam definition,
          // and is never candidate-supplied or fetched. That is what makes
          // inlining it here safe.
          dangerouslySetInnerHTML={{ __html: group.figureSvg }}
        />
      )}

      <ul className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
        {group.options.map((o) => (
          <li key={o.id} className="flex gap-2 text-sm text-ink-primary">
            <span className="font-bold text-navy dark:text-white">{o.id}</span>
            <span>{o.label}</span>
          </li>
        ))}
      </ul>

      {/* The paper says this out loud, so the screen does too. Whether an
          option can be used twice changes the arithmetic of the whole set. */}
      <p className="text-xs text-ink-secondary">
        {group.reusable
          ? 'You may use any letter more than once.'
          : 'Each letter is used once.'}
      </p>
    </div>
  );
}
