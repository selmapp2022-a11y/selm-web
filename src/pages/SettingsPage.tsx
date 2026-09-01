import { AccountSettings } from '../components/AccountSettings';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { ts, useUiLangValue } from '../i18n';

/**
 * `/settings` — SETTINGS.
 *
 * ── Why this page exists again, 1 September 2026 ───────────────────────────
 * It used to be a page, then it was folded into `/me` on 31 August with the
 * exam, the destination and the results, because appearance and sign-out had
 * two homes and one of them had to go.
 *
 * The fold went one step too far. The founder, looking at the shipped app:
 * the gear at the top of the screen and the `You` tab at the foot opened the
 * SAME page — one door called Settings, one called You, one room behind both.
 *
 * The answer is not to close a door. It is to give each door its own room:
 *
 *     You  (tab, at the foot)   the destination, the exam date, the results
 *     Settings (gear, at the top)  the account, the language, appearance,
 *                                  privacy, delete account, sign out
 *
 * Nothing is duplicated now, and nothing is unreachable — which is what the
 * 31 August fold was actually for.
 *
 * The Delete Account flow required by App Store Guideline 5.1.1(v) lives in
 * `AccountSettings`, so it is one tap from the gear that is on every screen.
 * `/settings` is also the path App Review was given, and it resolves again.
 */
export default function SettingsPage() {
  const ui = useUiLangValue();
  useDocumentTitle(ts('nav.settings', ui));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold text-navy dark:text-white">
          {ts('nav.settings', ui)}
        </h1>
      </header>

      <AccountSettings />
    </div>
  );
}
