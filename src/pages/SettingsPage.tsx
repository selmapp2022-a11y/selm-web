import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Trash2, User as UserIcon, Mail, Shield, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { deleteAccount, tokenStore } from '../lib/api';

// Settings page — Build 37 / v2.0.6.
//
// Added to satisfy App Store Guideline 5.1.1(v): "Apps that support
// account creation must also offer account deletion." The Delete My
// Account button below calls the backend's
// DELETE /users/account?confirm_deletion=true endpoint, which performs
// a soft-delete: the user's email/username are anonymised, personal
// data is removed, and the same email can be used to register again.
// After a successful delete we clear the auth token, sign the user out
// locally, and route them to the login screen.
//
// The page also shows the signed-in account details, a quick link to
// the Privacy Policy, and the standard Sign out control so App Review
// can find the deletion flow without hunting.

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [step, setStep] = useState<'idle' | 'confirm' | 'deleting' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = () => {
    logout();
    tokenStore.clear();
    navigate('/login', { replace: true });
  };

  const handleDelete = async () => {
    setError(null);
    setStep('deleting');
    try {
      await deleteAccount();
      // Wipe everything client-side so nothing lingers after deletion.
      try {
        tokenStore.clear();
        localStorage.removeItem('selm_privacy_consent_v1');
      } catch { /* ignore */ }
      logout();
      setStep('done');
      // Give the user a moment to read the confirmation before booting.
      setTimeout(() => navigate('/login', { replace: true }), 1800);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg || 'Could not delete your account. Please try again.');
      setStep('confirm');
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 pb-40">
      <h1 className="mb-6 font-display text-2xl font-bold text-navy dark:text-white">
        Settings
      </h1>

      {/* Account details */}
      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-navy dark:text-white">
          <UserIcon className="h-5 w-5 text-teal-500" />
          Account
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <UserIcon className="h-4 w-4 flex-none text-ink-secondary" />
            <div>
              <div className="text-xs text-ink-secondary dark:text-slate-400">Name</div>
              <div className="font-medium text-navy dark:text-white">
                {user?.full_name || user?.username || '—'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 flex-none text-ink-secondary" />
            <div className="min-w-0">
              <div className="text-xs text-ink-secondary dark:text-slate-400">Email</div>
              <div className="truncate font-medium text-navy dark:text-white">
                {user?.email || '—'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-navy dark:text-white">
          <Shield className="h-5 w-5 text-teal-500" />
          Privacy
        </h2>
        <p className="mb-3 text-sm text-ink-secondary dark:text-slate-400">
          Learn how SELM collects, uses, and stores your data.
        </p>
        <a
          href="https://selmapp.com/privacy"
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1 text-sm font-semibold text-teal-600 hover:underline dark:text-teal-300"
        >
          Read Privacy Policy →
        </a>
      </section>

      {/* Danger zone — Delete Account (App Store 5.1.1(v)).
          Placed BEFORE Sign out so it never sits under the mobile
          bottom-nav bar (which was covering the button on iPhone).
          The Delete button is now visible in the middle of the page
          without any scroll gymnastics. */}
      <section id="delete-account" className="mb-6 rounded-2xl border-2 border-red-200 bg-red-50 p-5 dark:border-red-800/60 dark:bg-red-900/20">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-red-800 dark:text-red-200">
          <AlertTriangle className="h-5 w-5" />
          Delete account
        </h2>

        {/* Button FIRST so it's always visible right under the title —
            previously the long description pushed the button below the
            fold on iPhone and users couldn't tap it. */}
        {error && (
          <div className="mb-3 rounded-xl border border-red-300 bg-white px-3 py-2 text-sm text-red-900 dark:border-red-700 dark:bg-red-950 dark:text-red-200">
            {error}
          </div>
        )}

        {step === 'done' ? (
          <div className="mb-3 rounded-xl border border-teal-300 bg-teal-50 px-3 py-2 text-sm text-teal-900 dark:border-teal-700 dark:bg-teal-900/40 dark:text-teal-200">
            Your account has been deleted. Signing you out…
          </div>
        ) : step === 'idle' ? (
          <button
            type="button"
            onClick={() => setStep('confirm')}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3.5 text-base font-bold text-white shadow-md transition active:scale-[0.98] active:bg-red-800 hover:bg-red-700"
            style={{ WebkitTapHighlightColor: 'rgba(0,0,0,0.15)', touchAction: 'manipulation' }}
          >
            <Trash2 className="h-5 w-5" />
            Delete my account
          </button>
        ) : (
          <div className="rounded-xl border border-red-300 bg-white p-3 dark:border-red-700 dark:bg-red-950/40">
            <p className="mb-3 text-sm font-semibold text-red-900 dark:text-red-100">
              Are you sure? This cannot be undone.
            </p>
            {/* Side-by-side so both buttons fit on the same row and
                neither drops below the mobile bottom-nav. */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setStep('idle'); setError(null); }}
                disabled={step === 'deleting'}
                className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-300 bg-white py-3 text-sm font-semibold text-navy active:bg-slate-100 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                style={{ WebkitTapHighlightColor: 'rgba(0,0,0,0.15)', touchAction: 'manipulation' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={step === 'deleting'}
                className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-red-600 py-3 text-sm font-bold text-white shadow-sm active:bg-red-800 hover:bg-red-700 disabled:opacity-60"
                style={{ WebkitTapHighlightColor: 'rgba(0,0,0,0.15)', touchAction: 'manipulation' }}
              >
                <Trash2 className="h-4 w-4" />
                {step === 'deleting' ? 'Deleting…' : 'Yes, delete'}
              </button>
            </div>
          </div>
        )}

        {/* One-line note under the button — kept short so it never gets
            clipped by the mobile bottom-nav. Full details in Privacy. */}
        {step === 'idle' && (
          <p className="mt-3 text-xs text-red-900/80 dark:text-red-200/80">
            Removes your account and all data. Cannot be undone.
          </p>
        )}
      </section>

      {/* Sign out — moved after the danger zone so the Delete Account
          block sits mid-page and is never covered by the mobile
          bottom-nav bar. */}
      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-3 text-sm font-semibold text-navy hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </section>
    </div>
  );
}
