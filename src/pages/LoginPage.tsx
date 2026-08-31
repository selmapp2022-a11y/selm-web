import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SignInWithApple, SignInWithAppleOptions } from '@capacitor-community/apple-sign-in';
import { auth } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { goNext, safeNext } from '../lib/nextPath';
import { Logo } from '../components/Logo';
import { Eye, EyeOff } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // A candidate sent here from `/exam.html` carries where to go back to.
  // `/exam.html` is a separate document, so returning is a navigation and
  // not a route change — and `safeNext` refuses anything that is not a path
  // on this origin, because the value arrives in a query string.
  const back = safeNext(window.location.search);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await auth.login(email, password);
      setUser(res.user);
      if (back) { goNext(back); return; }
      navigate(res.user.onboarding_completed ? '/dashboard' : '/');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setError(null);
    setAppleLoading(true);
    try {
      const options: SignInWithAppleOptions = {
        clientId: 'com.selmapp.app',
        redirectURI: 'https://selmapp.com/auth/apple/callback',
        scopes: 'email name',
        state: Math.random().toString(36).slice(2),
        nonce: Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2),
      };
      const result = await SignInWithApple.authorize(options);
      const r = result.response;
      if (!r?.identityToken) {
        throw new Error('Apple did not return an identity token');
      }
      const res = await auth.appleLogin({
        identity_token: r.identityToken,
        authorization_code: r.authorizationCode,
        user: r.user || undefined,
        email: r.email || undefined,
        given_name: r.givenName || undefined,
        family_name: r.familyName || undefined,
      });
      setUser(res.user);
      if (back) { goNext(back); return; }
      navigate(res.user?.onboarding_completed ? '/dashboard' : '/');
    } catch (err: any) {
      // User cancel is silent — everything else surfaces.
      const msg = err?.message || String(err);
      if (!/cancel|1001/i.test(msg)) {
        setError(msg || 'Apple sign-in failed.');
      }
    } finally {
      setAppleLoading(false);
    }
  };

  // Heuristic: if the backend rejected the credentials (vs. e.g. a network
  // failure), surface a "Forgot password?" shortcut inside the error banner.
  // We don't gate on status code here because the auth client throws axios
  // errors before we get clean access to one — string matching is enough.
  const looksLikeCredentialError = !!error && /password|credential|invalid|incorrect|unauthor/i.test(error);

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-app via-white to-teal/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="card p-8">
          <h1 className="text-2xl font-display font-bold text-navy mb-1">Welcome back</h1>
          <p className="text-ink-secondary mb-6">Sign in to continue your English journey.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-12"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-secondary hover:text-navy">
                  {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {/* Static Forgot Password link — always visible, right-aligned under
                  the password field. Mirrors the placement used by every major
                  auth form so returning users find it without thinking. */}
              <div className="mt-2 flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold text-navy hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <div>{error}</div>
                {/* When the failure looks like a wrong-credentials error, give
                    the user a one-click path to recovery right inside the
                    banner — many users miss the static link above and just
                    stare at the message. */}
                {looksLikeCredentialError && (
                  <div className="mt-2">
                    <Link
                      to="/forgot-password"
                      className="font-semibold text-red-800 underline hover:text-red-900"
                    >
                      Reset your password →
                    </Link>
                  </div>
                )}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Sign in with Apple is a NATIVE-only path, and it is gated here.

              The plugin's web implementation calls AppleID.auth.signIn(), which
              needs three things this site does not have: Apple's appleid.auth.js
              loaded on the page, a Services ID as clientId (com.selmapp.app is
              the iOS bundle ID and Apple rejects it on the web endpoint), and a
              route at the redirectURI. Without them the button threw on every
              click in a browser — a visible, permanent error on a live product.

              Guideline 4.8 governs the app, where this works. Hiding it on the
              web removes a control that could not do anything. Turning it back
              on for the web means all three of the above plus APPLE_SERVICE_ID
              in the backend environment, so the token's audience is accepted.

              The divider is inside the guard because Apple is the only
              third-party provider — with it hidden there is nothing to divide. */}
          {Capacitor.isNativePlatform() && (
            <>
            {/* Divider — separates traditional login from third-party providers. */}
            <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-ink-secondary">
              <div className="h-px flex-1 bg-slate-200" />
              <span>or</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Sign in with Apple — required by Apple guideline 4.8 whenever the
                app offers any social/third-party login. Uses the native flow via
                @capacitor-community/apple-sign-in on iOS. */}
            <button
              type="button"
              onClick={handleAppleSignIn}
              disabled={appleLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-60"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              {appleLoading ? 'Signing in…' : 'Sign in with Apple'}
            </button>
            </>
          )}

          <p className="mt-6 text-center text-sm text-ink-secondary">
            New to SELM?{' '}
            <Link to={`/register${window.location.search}`} className="font-semibold text-navy hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
