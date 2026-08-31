import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

/**
 * THE WAY OUT OF A SKILL PAGE.
 *
 * IA ruling §1.2: *"Skill pages have no back control. On mobile the tab bar is
 * the only exit. Add `← Practice`."*
 *
 * Walking the deployed app on 31 August confirmed it: every skill page exits
 * only through the tab bar, and a candidate who arrived from Today's "Do this
 * next" card has no way back to where they came from except a tab that is not
 * where they came from.
 *
 * It is a LINK and not `history.back()`. A back control that depends on how
 * the page was reached behaves differently for a bookmark, a refresh and a
 * shared URL, and the one thing a way out must be is the same every time.
 *
 * 44px minimum on both axes — the ruling's other §1.2 item, tap targets under
 * 44×44 on inline text links, and the reason the padding here is not decorative.
 */
export function BackToPractice({ label = 'Practice' }: { label?: string }) {
  return (
    <Link
      to="/practice"
      className="-ml-2 inline-flex min-h-[44px] items-center gap-1 rounded-xl px-2 text-sm font-medium text-ink-secondary transition hover:bg-surface-muted hover:text-navy"
    >
      <ChevronLeft className="h-4 w-4" />
      {label}
    </Link>
  );
}
