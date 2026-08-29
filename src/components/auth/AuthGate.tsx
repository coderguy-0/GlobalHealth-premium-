import React, { useState } from 'react';
import {
  Lock,
  X,
  LogIn,
  UserPlus,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { useAuth, toUserAccount } from '../../context/AuthContext';
import { apiFetch } from '../../services/authClient';
import type { UserAccount } from '../../types';

interface AuthGateProps {
  // Allows a host view to react after successful auth (e.g. resume booking).
  onAuthenticated?: (user: UserAccount) => void;
}

// A single, consistent authentication gate used across the entire app.
// Used both as the global "this feature requires an account" modal and as the
// full-page protected-route experience.
export const AuthGate: React.FC<AuthGateProps> = ({ onAuthenticated }) => {
  const { gateOpen, closeGate, gateMode, setGateMode, gateIntent, authenticate } = useAuth();
  const [mode, setLocalMode] = useState<'login' | 'signup'>('login');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Login fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  // Signup fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const activeMode = gateMode || mode;
  const switchMode = (m: 'login' | 'signup') => {
    setLocalMode(m);
    setGateMode(m);
    setError('');
  };

  if (!gateOpen) return null;

  const finish = (user: UserAccount, token: string) => {
    authenticate(user, token);
    onAuthenticated?.(user);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!identifier.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setBusy(true);
    try {
      const res = await apiFetch<{
        success: boolean;
        error?: string;
        user?: any;
        token?: string;
        verificationRequired?: boolean;
      }>('/api/auth/login', {
        method: 'POST',
        auth: false,
        body: { identifier: identifier.trim(), password, rememberMe: true }
      });
      if (res?.success && res.user && res.token) {
        finish(toUserAccount(res.user), res.token);
      } else if (res?.verificationRequired) {
        setError('Please verify your email first. A new account needs email verification.');
      } else {
        setError(res?.error || 'Unable to sign in. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to sign in. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !signupPassword) {
      setError('Please fill in all required fields.');
      return;
    }
    if (signupPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    setBusy(true);
    try {
      // 1) Create the account.
      const reg = await apiFetch<{ success: boolean; error?: string; userId?: string; devCode?: string }>(
        '/api/auth/signup',
        {
          method: 'POST',
          auth: false,
          body: {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            password: signupPassword,
            confirmPassword: signupPassword,
            termsAccepted: true,
            marketingConsent: false,
            preferredLanguage: 'English'
          }
        }
      );
      if (!reg?.success || !reg.userId) {
        setError(reg?.error || 'Unable to create your account. Please try again.');
        setBusy(false);
        return;
      }
      // 2) Verify the email automatically in this prototype using the dispatched code.
      const code = reg.devCode || '123456';
      const ver = await apiFetch<{ success: boolean; error?: string; user?: any; token?: string }>(
        '/api/auth/verify-code',
        { method: 'POST', auth: false, body: { userId: reg.userId, code, type: 'email' } }
      );
      if (ver?.success && ver.user && ver.token) {
        finish(toUserAccount(ver.user), ver.token);
      } else {
        // Fallback: log in directly after registration.
        const login = await apiFetch<{ success: boolean; user?: any; token?: string; error?: string }>(
          '/api/auth/login',
          { method: 'POST', auth: false, body: { identifier: email.trim(), password: signupPassword } }
        );
        if (login?.success && login.user && login.token) {
          finish(toUserAccount(login.user), login.token);
        } else {
          setError('Your account was created. Please sign in to continue.');
          switchMode('login');
          setIdentifier(email.trim());
        }
      }
    } catch (err: any) {
      setError(err.message || 'Unable to create your account. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleDemo = async () => {
    setError('');
    setBusy(true);
    try {
      const res = await apiFetch<{ success: boolean; user?: any; token?: string; error?: string }>(
        '/api/auth/login',
        {
          method: 'POST',
          auth: false,
          body: { identifier: 'sarah.jenkins@example.com', password: 'Password123!', rememberMe: true }
        }
      );
      if (res?.success && res.user && res.token) {
        finish(toUserAccount(res.user), res.token);
      } else {
        setError(res?.error || 'Demo sign-in is unavailable.');
      }
    } catch (err: any) {
      setError(err.message || 'Demo sign-in is unavailable.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-gate-title"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 my-8">
        <button
          onClick={closeGate}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-white/60"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="relative bg-gradient-to-br from-emerald-700 via-teal-700 to-emerald-800 px-6 pt-8 pb-6 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h2 id="auth-gate-title" className="text-lg font-bold leading-tight">
                {activeMode === 'login' ? 'Sign in to continue' : 'Create your account'}
              </h2>
              <p className="text-sm text-emerald-50/90">
                <ShieldCheck className="mr-1 inline h-3.5 w-3.5" />
                Secured by GlobalHealth
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-emerald-50/95">
            {gateIntent?.feature
              ? `Sign in or create an account to ${gateIntent.feature}. Your health information stays private and secure.`
              : 'Sign in or create an account to access your personal healthcare features and participate in the GlobalHealth community.'}
          </p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-2 border-b border-slate-100 px-6 pt-4">
          <button
            onClick={() => switchMode('login')}
            className={`flex items-center justify-center gap-2 rounded-t-xl border-b-2 px-3 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              activeMode === 'login'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <LogIn className="h-4 w-4" /> Log In
          </button>
          <button
            onClick={() => switchMode('signup')}
            className={`flex items-center justify-center gap-2 rounded-t-xl border-b-2 px-3 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              activeMode === 'signup'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <UserPlus className="h-4 w-4" /> Create Account
          </button>
        </div>

        <div className="px-6 py-6">
          {error && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700"
            >
              <span className="mt-0.5">{error}</span>
            </div>
          )}

          {activeMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Email or username</span>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    autoComplete="username"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/30"
                    placeholder="you@example.com"
                  />
                </div>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Password</span>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/30"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>
              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                Log In
              </button>
              <button
                type="button"
                onClick={handleDemo}
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
              >
                <Sparkles className="h-4 w-4" /> Try a demo account
              </button>
              <p className="text-center text-sm text-slate-500">
                New to GlobalHealth?{' '}
                <button type="button" onClick={() => switchMode('signup')} className="font-semibold text-emerald-700 hover:underline">
                  Create an account
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">First name</span>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    autoComplete="given-name"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/30"
                    placeholder="Asha"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Last name</span>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    autoComplete="family-name"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/30"
                    placeholder="Sharma"
                  />
                </label>
              </div>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Email address</span>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/30"
                    placeholder="you@example.com"
                  />
                </div>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Password</span>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/30"
                    placeholder="At least 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>
              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                Create Account
              </button>
              <p className="flex items-start gap-1.5 text-xs text-slate-500">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                Your personal health data is private by default and protected at every layer.
              </p>
              <p className="text-center text-sm text-slate-500">
                Already have an account?{' '}
                <button type="button" onClick={() => switchMode('login')} className="font-semibold text-emerald-700 hover:underline">
                  Log in <ArrowRight className="inline h-3.5 w-3.5" />
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
