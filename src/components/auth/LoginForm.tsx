import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { useLocalization } from '../../context/LocalizationContext';
import { loginUser } from '../../services/authService';
import { PublicUserAccount } from '../../types/auth';

interface LoginFormProps {
  onSuccess: (user: PublicUserAccount, token?: string) => void;
  onNavigate: (view: 'signup' | 'forgot-password' | 'verify-email' | 'verify-phone') => void;
  onRequestHelp?: () => void;
  onOpenLegal?: (tab: 'terms' | 'privacy-policy') => void;
  onRequiresVerification?: (data: { userId: string; email?: string; phone?: string; type: 'email' | 'phone' }) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onNavigate,
  onRequestHelp,
  onOpenLegal,
  onRequiresVerification
}) => {
  const { t } = useLocalization();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!identifier.trim()) {
      setErrorMessage('Please enter your email or mobile number.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);

    const result = await loginUser(identifier.trim(), password, rememberMe);
    setIsLoading(false);

    if (result.success) {
      if (result.verificationRequired && onRequiresVerification) {
        onRequiresVerification({
          userId: result.userId,
          email: result.email,
          type: result.verificationType || 'email'
        });
        return;
      }

      setSuccessMessage(result.message || 'Login successful!');
      setTimeout(() => {
        onSuccess(result.user, result.token);
      }, 400);
    } else {
      setErrorMessage(
        result.error || 'Unable to sign in with those credentials. Please try again.'
      );
    }
  };

  const handleFillDemoUser = (userType: 'sarah' | 'alex') => {
    if (userType === 'sarah') {
      setIdentifier('sarah.jenkins@example.com');
      setPassword('Password123!');
    } else {
      setIdentifier('alex.turner@example.com');
      setPassword('Password123!');
    }
    setErrorMessage('');
  };

  return (
    <div className="w-full">
      {/* Form Header */}
      <div className="mb-6 text-left">
        <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900">
          Welcome back
        </h1>
        <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
          Sign in to your GlobalHealth account.
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs text-rose-800 animate-in fade-in duration-150">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
          <div className="leading-snug">
            <span className="font-semibold block mb-0.5">Authentication Issue</span>
            {errorMessage}
          </div>
        </div>
      )}

      {/* Success Alert */}
      {successMessage && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 animate-in fade-in duration-150">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Identifier Field */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Email or Mobile Number
          </label>
          <div className="relative rounded-xl border border-slate-300 shadow-xs focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/20 transition-all bg-white">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="h-4 w-4" />
            </div>
            <input
              type="text"
              autoComplete="username"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="Enter your email or mobile number"
              className="w-full rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Password
            </label>
            <button
              type="button"
              onClick={() => onNavigate('forgot-password')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline transition cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative rounded-xl border border-slate-300 shadow-xs focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/20 transition-all bg-white">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="Enter your password"
              className="w-full rounded-xl py-2.5 pl-10 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer focus:outline-hidden"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Remember Device Checkbox */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <span className="text-xs font-medium text-slate-600">
              Remember this device
            </span>
          </label>
        </div>

        {/* Login consent line — returning users are not forced to re-accept
            Terms every time; this is an acknowledgement, not a new consent. */}
        <p className="text-[11px] leading-relaxed text-slate-500">
          By continuing, you agree to the{' '}
          <button type="button" onClick={() => onOpenLegal?.('terms')} className="font-semibold text-medical-700 hover:underline cursor-pointer">Terms &amp; Conditions</button>{' '}
          and acknowledge the{' '}
          <button type="button" onClick={() => onOpenLegal?.('privacy-policy')} className="font-semibold text-medical-700 hover:underline cursor-pointer">Privacy Policy</button>.
        </p>

        {/* Primary Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-60 disabled:cursor-not-allowed transition cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Signing you in...</span>
            </>
          ) : (
            <>
              <span>Log In</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Demo Credentials Quick Fill */}
      <div className="mt-5 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 text-left">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500" />
            Quick Demo User Access
          </span>
          <span className="text-[10px] text-slate-400">Pre-seeded</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleFillDemoUser('sarah')}
            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-300 text-[11px] font-semibold text-slate-700 hover:text-emerald-700 transition text-left cursor-pointer truncate shadow-2xs"
          >
            Sarah Jenkins (Verified)
          </button>
          <button
            type="button"
            onClick={() => handleFillDemoUser('alex')}
            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-300 text-[11px] font-semibold text-slate-700 hover:text-emerald-700 transition text-left cursor-pointer truncate shadow-2xs"
          >
            Alex Turner (Standard)
          </button>
        </div>
      </div>

      {/* Footer Navigation Switcher */}
      <div className="mt-6 pt-5 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-600">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => onNavigate('signup')}
            className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline transition cursor-pointer"
          >
            Create Account
          </button>
        </p>

        <div className="mt-4 flex items-center justify-center gap-3 text-[11px] text-slate-400">
          <button type="button" onClick={() => onOpenLegal?.('privacy-policy')} className="hover:text-slate-600 transition cursor-pointer">Privacy Policy</button>
          <span>·</span>
          <button type="button" onClick={() => onOpenLegal?.('terms')} className="hover:text-slate-600 transition cursor-pointer">Terms &amp; Conditions</button>
          <span>·</span>
          <button
            type="button"
            onClick={onRequestHelp}
            className="hover:text-slate-600 transition cursor-pointer"
          >
            Help & Security
          </button>
        </div>

        {/* Security note — accurate, never overclaiming (spec) */}
        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-medical-500" />
          Your account is protected by security measures designed to help safeguard your information. Never share
          your password or verification code with anyone.
        </p>
      </div>
    </div>
  );
};
