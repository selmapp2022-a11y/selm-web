import { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../lib/api';
import { Logo } from '../components/Logo';
import { ts, useUiLangValue } from '../i18n';
import { Rich } from '../i18n/Rich';

export default function ForgotPasswordPage() {
  const ui = useUiLangValue();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await auth.forgotPassword(email);
      // Backend always returns success to prevent email enumeration. We
      // mirror that here — show the generic confirmation even if the email
      // doesn't exist, so attackers can't probe the user table.
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || 'Could not send the reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-app via-white to-teal/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="card p-8">
          <h1 className="text-2xl font-display font-bold text-navy mb-1">{ts('auth.resetTitle', ui)}</h1>
          <p className="text-ink-secondary mb-6">{ts('auth.resetBlurb', ui)}</p>

          {submitted ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
                <Rich k="auth.resetSent" vars={{ email }} />
              </div>
              <Link to="/login" className="btn-primary w-full block text-center">
                {ts('auth.backToSignIn', ui)}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label" htmlFor="email">{ts('auth.email', ui)}</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder={ts('auth.emailPlaceholder', ui)}
                  autoComplete="email"
                  autoFocus
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading || !email} className="btn-primary w-full">
                {ts(loading ? 'auth.sending' : 'auth.sendResetLink', ui)}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-ink-secondary">
            {ts('auth.rememberedIt', ui)}{' '}
            <Link to="/login" className="font-semibold text-navy hover:underline">
              {ts('auth.backToSignIn', ui)}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
