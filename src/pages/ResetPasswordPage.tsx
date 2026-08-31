import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { auth } from '../lib/api';
import { Logo } from '../components/Logo';
import { ts, useUiLangValue } from '../i18n';
import { Eye, EyeOff } from 'lucide-react';

export default function ResetPasswordPage() {
  const ui = useUiLangValue();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // If the user hits /reset-password with no token (e.g. typed the URL by
  // hand), there's nothing to do here — bounce them to forgot-password so
  // they can request a fresh email.
  useEffect(() => {
    if (!token) {
      navigate('/forgot-password', { replace: true });
    }
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      await auth.resetPassword(token, password);
      setSuccess(true);
      // Give the user a beat to read the confirmation, then send them to
      // /login. They sign in fresh — we deliberately don't auto-log-in
      // because the new credentials should be exercised once.
      setTimeout(() => navigate('/login', { replace: true }), 1800);
    } catch (err: any) {
      const msg = err?.message || 'Could not reset password.';
      // 400 from the backend usually means the token expired or was already
      // used. Make that path obvious instead of showing a raw error.
      if (/invalid|expired|token/i.test(msg)) {
        setError('This reset link is invalid or has expired. Please request a new one.');
      } else {
        setError(msg);
      }
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
          <h1 className="text-2xl font-display font-bold text-navy mb-1">{ts('auth.newPasswordTitle', ui)}</h1>
          <p className="text-ink-secondary mb-6">{ts('auth.newPasswordBlurb', ui)}</p>

          {success ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
                {ts('auth.passwordUpdated', ui)}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label" htmlFor="password">{ts('auth.newPassword', ui)}</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pr-12"
                    placeholder={ts('auth.password8', ui)}
                    autoComplete="new-password"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-secondary hover:text-navy"
                  >
                    {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="label" htmlFor="confirm">{ts('auth.confirmNewPassword', ui)}</label>
                <input
                  id="confirm"
                  type={showPw ? 'text' : 'password'}
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="input"
                  placeholder={ts('auth.reenterPassword', ui)}
                  autoComplete="new-password"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <div>{error}</div>
                  {/expired|invalid/i.test(error) && (
                    <div className="mt-2">
                      <Link
                        to="/forgot-password"
                        className="font-semibold text-red-800 underline hover:text-red-900"
                      >
                        {ts('auth.requestNewLink', ui)}
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !password || !confirm}
                className="btn-primary w-full"
              >
                {ts(loading ? 'auth.updating' : 'auth.setNewPassword', ui)}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-ink-secondary">
            <Link to="/login" className="font-semibold text-navy hover:underline">
              {ts('auth.backToSignIn', ui)}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
