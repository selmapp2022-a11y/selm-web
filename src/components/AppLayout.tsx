import { useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Logo } from './Logo';
import { StaleBuild } from './StaleBuild';
import { useAuthStore } from '../store/authStore';
import { syncAttemptsFromBackend } from '../lib/attempts';
import { claimCandidateRecord } from '../lib/localRecord';
import { syncDocumentLang, ts, useUiLangValue } from '../i18n';
import { Home, Dumbbell, Settings } from 'lucide-react';
import type { Key } from '../i18n';
import clsx from 'clsx';

/**
 * The THREE destinations, declared once and rendered twice — the sidebar on a
 * desktop, the tab bar on a phone. One list, so the two can never drift.
 *
 * ── Five became four, then three, both on 31 August ─────────────────────────
 * IA ruling §2.1, in the morning: *"Four tabs is still right. Drop `My exam`
 * into `You` … Keep Mock exam."* `My exam` and `Progress` folded into `You`,
 * which holds the numbers alongside the goal they are measured against.
 *
 *     Today · Practice · Mock exam · You
 *
 * In the evening the founder, looking at the built app: *"the app is
 * cluttered."* Mock exam left the bar and became the primary action of the
 * home screen — the detail and the reasoning are on `navItems` below.
 *
 *     Today · Practice · You
 *
 * The arithmetic is the same argument the morning's ruling made: five tabs on
 * a 390px screen is 78 points each, four is 97, three is 130. What went both
 * times was the destination a candidate reaches least often, and neither one
 * was deleted — `My exam` folded into a tab, and Mock exam moved to the first
 * screen instead of the fourth tab.
 *
 * **The ruling's reason for keeping Mock exam is not overturned.** *"Practice
 * teaches. The mock exam measures … it is the only surface that answers 'are
 * you ready to book?'"* That is why it went to the home screen rather than
 * under Practice: a tab bar ranks by FREQUENCY, and a full timed sitting is
 * occasional by design. Frequency is the wrong axis for it; prominence is the
 * right one, and the home screen gives it more of that than a quarter of the
 * tab bar did.
 *
 * The labels are KEYS as of 30 August. They were hard-coded English, which
 * made this the one place §5.2 was not being followed and the most visible
 * one: a candidate reading the app in French met English words on every
 * screen, in the only component that is on every screen.
 */
/**
 * ── FOUR DESTINATIONS BECAME THREE, 31 AUGUST ─────────────────────────────
 * The founder: *"the app is cluttered."*
 *
 * **Mock exam left the tab bar.** A tab bar is for what a candidate does
 * constantly; a full timed sitting is occasional, deliberate and high-stakes,
 * and it was competing for a thumb with the two screens that are opened
 * several times a day. It did not lose its place — it gained a better one: it
 * is now the primary action on Today, at the foot of the card that says which
 * exam and how many days are left, which is the only place those three facts
 * mean anything together. `/exam` is unchanged and still resolves.
 *
 * Three tabs also fixes something the fourth was costing: with four, each tap
 * target is a quarter of the width, and the two most-used destinations were
 * no easier to hit than the least-used one.
 */
/**
 * ── THREE BECAME TWO, 1 SEPTEMBER ─────────────────────────────────────────
 * The founder, looking at the shipped app: the person icon at the top and the
 * `You` tab at the bottom went to the SAME page, `/me`. Two doors into one
 * room, on a screen 390 points wide.
 *
 * The bottom door is the one that closed. The top one had to stay: Apple
 * rejected build 38 under 5.1.1(v) because account deletion was not reachable,
 * and that gear is the route to it — so the choice was never which to keep.
 * It is now a gear rather than a person, because the room it opens is called
 * Settings.
 *
 *     Today · Practice
 *
 * Two tabs on a 390px screen is 195 points each. Nothing was deleted: `/me`
 * is unchanged and still holds the destinations, the exam date, the past
 * results and the account.
 */
const navItems: Array<{ to: string; label: Key; icon: typeof Home; end?: boolean }> = [
  { to: '/', label: 'nav.today', icon: Home, end: true },
  { to: '/practice', label: 'nav.practice', icon: Dumbbell },
];

export function AppLayout() {
  const { user } = useAuthStore();
  // `index.html` hard-codes `lang="en"`. Keep the document on the language the
  // candidate chose, so assistive technology announces it correctly and the
  // browser's own date fields follow the app rather than the operating system.
  const ui = useUiLangValue();
  useEffect(() => { syncDocumentLang(ui); }, [ui]);

  // Bind this device's local record to whoever is signed in — discarding it
  // first if it belonged to someone else — and only then pull from the
  // backend. The order matters: syncing first would merge a previous
  // candidate's attempts into this account and push them back up.
  useEffect(() => {
    if (!user) return;
    claimCandidateRecord(user.id);
    void syncAttemptsFromBackend();
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-surface-app">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-surface-divider bg-white dark:border-slate-700 dark:bg-slate-900 md:block">
        <div className="flex h-full flex-col">
          <div className="px-6 pb-3 pt-6"><Logo /></div>
          <nav className="flex-1 space-y-1 px-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => clsx(
                  'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition',
                  isActive
                    ? 'bg-navy font-semibold text-white shadow-card'
                    : 'font-medium text-ink-secondary hover:bg-surface-muted hover:text-navy'
                )}
              >
                {({ isActive }) => (
                  <>
                    {/* Weight, not only colour. A tab that differs from its
                        neighbours by hue alone is invisible to a candidate who
                        cannot separate those hues, and washed out in sunlight
                        — which is where a phone is often held. */}
                    <item.icon className="h-5 w-5" strokeWidth={isActive ? 2.3 : 1.8} />
                    {ts(item.label, ui)}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
          {/* ── D4 AND D5: THE SIDEBAR STOPPED OWNING THE ACCOUNT ──────
              This block held a theme switcher, a Settings link and a Sign
              out button. All three now live on `/me`, which is a tab.

              They were not duplicated by accident. There were two places
              that could plausibly own "appearance" and "sign out" — the
              chrome and the account page — and both took it. Deleting one
              copy without merging the routes would have left the same
              question open for the next control.

              Sign out in particular has no business one stray tap away on
              every screen of an exam app: a candidate mid-practice does not
              want to discover it by accident. It is now behind the `You`
              tab, beside the account it signs out of. */}
          <div className="border-t border-surface-divider p-4">
            {/* The sidebar reached Settings only through the `You` tab, and
                that tab is gone as of 1 September. On a phone the gear in the
                header covers it; on a desktop there is no header, so without
                this row the account — and account deletion with it — would be
                unreachable. */}
            <NavLink
              to="/me"
              className={({ isActive }) => clsx(
                'mb-3 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition',
                isActive
                  ? 'bg-navy font-semibold text-white shadow-card'
                  : 'font-medium text-ink-secondary hover:bg-surface-muted hover:text-navy'
              )}
            >
              <Settings className="h-5 w-5" strokeWidth={1.8} />
              {ts('nav.settings', ui)}
            </NavLink>
            <div className="px-2">
              <div className="text-sm font-semibold text-navy">{user?.full_name || user?.username || 'Learner'}</div>
              <div className="truncate text-xs text-ink-secondary">{user?.email}</div>
              {/* The backend's `current_level` badge was removed here on
                  2026-08-27 with the rest of the invented level scale. The
                  field still exists on the account and is still used to pick
                  practice difficulty; it is simply not a score, so it is no
                  longer displayed as one beside the candidate's name. */}
            </div>
          </div>
        </div>
      </aside>

      {/* The mobile header, rebuilt 2026-08-29 because it broke on a phone.
          It carried the FULL logo — wordmark plus the "KNOW YOUR SCORE"
          tagline, which is letter-spaced and therefore wide — next to the
          language badge, next to three icon buttons and a theme switcher, all
          in one row. On a 390px screen that does not fit: the tagline wrapped
          to three lines and the badge sat on top of it.
          The symbol carries the brand here; the wordmark is still in the
          sidebar where there is room for it. */}
      {/* ── THE PHONE HEADER ────────────────────────────────────────────
          It carried five things: the full logo with its letter-spaced
          tagline, the exam/language pill, a theme switcher, a gear and a
          sign-out. On a 390px screen the tagline wrapped to three lines and
          the pill sat on top of it.

          It now carries two: the mark, and the gear. The pill went on
          30 August because "My exam" in the navigation already led there.
          The theme switcher and sign-out went with it — not because they are
          unimportant but because they belong to the account, not to the
          screen the candidate is on, and both are on `/me`, one tap behind
          the gear that is already required to be here.

          Sign-out in particular has no business one stray tap away on every
          screen of an exam app. A candidate mid-practice does not want to
          discover it by accident.

          `env(safe-area-inset-top)` because this ships inside Capacitor as
          well as a browser, and there the status bar overlays the web view. */}
      <header
        // OPAQUE. It was `bg-white/80 … backdrop-blur`, and the founder sent a
        // photograph of the page heading legible THROUGH the header, with the
        // logo sitting on top of the word "Today".
        //
        // A translucent bar only works because the blur behind it destroys the
        // detail of whatever is passing underneath. Take the blur away and 80%
        // opacity is a window. And the blur does go away: this screenshot is an
        // iPhone with Lockdown Mode on — the badge is visible at the foot of it
        // — and Lockdown Mode disables `backdrop-filter`. Low-power mode and
        // several older engines drop it too.
        //
        // So the chrome does not depend on a filter the platform may decline to
        // run. Nothing scrolls through it now, on any device, in any mode.
        className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-surface-divider bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900 md:hidden"
        style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top))' }}
      >
        <Logo variant="symbol" className="h-8 w-8 shrink-0 rounded-xl" />
        {/* Gear → `/me` → Delete Account. Required so iPhone users (and
            Apple's reviewers) can reach account deletion without an obscure
            gesture; 5.1.1(v) rejected Build 38 for exactly this. It points at
            `/me` since 31 August — `/settings` still resolves, but the gear
            should name where it actually goes. */}
        <NavLink
          to="/me"
          className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-ink-secondary transition hover:bg-surface-muted hover:text-navy"
          aria-label={ts('nav.settings', ui)}
        >
          <Settings className="h-5 w-5" />
        </NavLink>
      </header>

      {/* ── THE PHONE TAB BAR ───────────────────────────────────────────
          Same three destinations as the sidebar, from the same list.

          Three things changed on 30 August, all of them because this is the
          component a phone user touches most and it was the least considered:

          - **A tap target that exists.** It was `py-2` around a 20px icon —
            about 36px tall. Both platforms ask for 44; a candidate tapping
            "Practice" and landing on "Mock exam" blames themselves.
          - **The current tab is marked by SHAPE, not only hue.** A filled
            capsule behind the active icon, a heavier stroke, a heavier
            label. Colour alone fails a candidate who cannot separate teal
            from grey, and fails everyone in sunlight.
          - **`env(safe-area-inset-bottom)`.** Inside Capacitor on a
            gesture-bar iPhone the labels sat under the home indicator. */}
      <nav
        // Opaque, for the reason given on the header above: "Where you stand"
        // and the target line were both readable through this bar.
        className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-surface-divider bg-white dark:border-slate-700 dark:bg-slate-900 md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        aria-label={ts('nav.main', ui)}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className="flex min-h-[3.5rem] flex-1 flex-col items-center justify-center gap-1 pb-1 pt-1.5"
          >
            {({ isActive }) => (
              <>
                <span
                  className={clsx(
                    'flex h-7 w-14 items-center justify-center rounded-full transition-colors duration-150',
                    isActive ? 'bg-teal/15 text-teal' : 'text-ink-secondary',
                  )}
                >
                  <item.icon className="h-5 w-5" strokeWidth={isActive ? 2.3 : 1.8} />
                </span>
                <span
                  className={clsx(
                    'text-[11px] leading-none',
                    isActive ? 'font-semibold text-teal' : 'text-ink-secondary',
                  )}
                >
                  {ts(item.label, ui)}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <main className="md:pl-64">
        <StaleBuild />
        {/* The bottom padding is the tab bar's real height plus the device's
            inset, not a round number that happened to clear it. */}
        <div
          className="mx-auto max-w-6xl px-4 py-6 pb-[var(--tabbar)] md:px-8 md:py-10 md:pb-10"
          style={{ ['--tabbar' as string]: 'calc(5rem + env(safe-area-inset-bottom))' }}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}
