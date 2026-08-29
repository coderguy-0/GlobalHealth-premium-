import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User, Phone, Globe, ShieldCheck, Check, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useLocalization } from '../../context/LocalizationContext';
import { signupUser, calculatePasswordStrength } from '../../services/authService';

interface SignUpFormProps {
  onSuccess: (data: { userId: string; email: string; type: 'email' | 'phone'; devCode?: string }) => void;
  onNavigate: (view: 'login' | 'forgot-password') => void;
  onRequestHelp?: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({
  onSuccess,
  onNavigate,
  onRequestHelp
}) => {
  const { t } = useLocalization();

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('United States');
  const [preferredLanguage, setPreferredLanguage] = useState('English');

  // Consents (Strictly separate mandatory legal from optional marketing)
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [duplicateAdvice, setDuplicateAdvice] = useState(false);

  const passwordStrength = calculatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setDuplicateAdvice(false);

    if (!firstName.trim()) {
      setErrorMessage('Please enter your first name.');
      return;
    }
    if (!lastName.trim()) {
      setErrorMessage('Please enter your last name.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please create a secure password.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (!termsAccepted) {
      setErrorMessage('You must agree to the Terms of Service and Privacy Policy to continue.');
      return;
    }

    setIsLoading(true);

    const result = await signupUser({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber.trim() || undefined,
      password,
      confirmPassword,
      termsAccepted,
      marketingConsent,
      country,
      preferredLanguage
    });

    setIsLoading(false);

    if (result.success) {
      onSuccess({
        userId: result.userId,
        email: result.email || email,
        type: result.verificationType || 'email',
        devCode: result.devCode
      });
    } else {
      setErrorMessage(result.error || 'Failed to create account. Please check your information.');
      if (result.duplicateAccount) {
        setDuplicateAdvice(true);
      }
    }
  };

  return (
    <div className="w-full">
      {/* Form Header */}
      <div className="mb-5 text-left">
        <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900">
          Create Your GlobalHealth Account
        </h1>
        <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
          Join GlobalHealth to personalize your healthcare experience and keep your preferences, appointments and saved information in one secure account.
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs text-rose-800 animate-in fade-in duration-150">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">Registration Alert</span>
              {errorMessage}
            </div>
          </div>
          {duplicateAdvice && (
            <div className="mt-3 flex gap-2 pt-2 border-t border-rose-200/60">
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="px-3 py-1 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-bold text-[11px] transition cursor-pointer"
              >
                Log In Instead
              </button>
              <button
                type="button"
                onClick={() => onNavigate('forgot-password')}
                className="px-3 py-1 bg-white border border-rose-300 text-rose-800 hover:bg-rose-100 rounded-lg font-bold text-[11px] transition cursor-pointer"
              >
                Recover Password
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Sign Up Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Name Fields Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              First Name
            </label>
            <div className="relative rounded-xl border border-slate-300 shadow-xs focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/20 transition-all bg-white">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
                className="w-full rounded-xl py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Last Name
            </label>
            <div className="relative rounded-xl border border-slate-300 shadow-xs focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/20 transition-all bg-white">
              <input
                type="text"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name"
                className="w-full rounded-xl py-2 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Contact Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative rounded-xl border border-slate-300 shadow-xs focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/20 transition-all bg-white">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full rounded-xl py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Mobile Number <span className="text-slate-400 font-normal normal-case">(Optional)</span>
            </label>
            <div className="relative rounded-xl border border-slate-300 shadow-xs focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/20 transition-all bg-white">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Phone className="h-4 w-4" />
              </div>
              <input
                type="tel"
                autoComplete="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full rounded-xl py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Password Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Password
            </label>
            <div className="relative rounded-xl border border-slate-300 shadow-xs focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/20 transition-all bg-white">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a secure password"
                className="w-full rounded-xl py-2 pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Confirm Password
            </label>
            <div className="relative rounded-xl border border-slate-300 shadow-xs focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/20 transition-all bg-white">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full rounded-xl py-2 pl-3 pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label="Toggle confirm password visibility"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Password Strength Indicator */}
        {password && (
          <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-2.5 text-xs text-left">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-slate-600">Password Strength:</span>
              <span className="font-bold text-slate-800">{passwordStrength.label}</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden mb-2">
              <div className={`h-full ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-transparent'}`} />
              <div className={`h-full ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-transparent'}`} />
              <div className={`h-full ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-transparent'}`} />
              <div className={`h-full ${passwordStrength.score >= 4 ? passwordStrength.color : 'bg-transparent'}`} />
            </div>
            {passwordStrength.feedback.length > 0 && (
              <p className="text-[11px] text-slate-500">
                Recommended: {passwordStrength.feedback.join(' · ')}
              </p>
            )}
          </div>
        )}

        {/* Regional & Language Defaults */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Country / Region
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs font-medium text-slate-800 shadow-xs focus:border-emerald-600 focus:outline-hidden"
              disabled={isLoading}
            >
              <option value="United States">United States (US)</option>
              <option value="United Kingdom">United Kingdom (UK)</option>
              <option value="Canada">Canada (CA)</option>
              <option value="India">India (IN)</option>
              <option value="United Arab Emirates">United Arab Emirates (UAE)</option>
              <option value="Germany">Germany (DE)</option>
              <option value="France">France (FR)</option>
              <option value="Singapore">Singapore (SG)</option>
              <option value="Australia">Australia (AU)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Preferred Language
            </label>
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs font-medium text-slate-800 shadow-xs focus:border-emerald-600 focus:outline-hidden"
              disabled={isLoading}
            >
              <option value="English">English</option>
              <option value="Hindi">हिन्दी (Hindi)</option>
              <option value="Arabic">العربية (Arabic)</option>
              <option value="Spanish">Español (Spanish)</option>
              <option value="French">Français (French)</option>
              <option value="German">Deutsch (German)</option>
              <option value="Japanese">日本語 (Japanese)</option>
              <option value="Mandarin">中文 (Mandarin)</option>
            </select>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="rounded-xl bg-emerald-50/70 border border-emerald-100 p-2.5 text-left flex items-start gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-emerald-900 leading-tight">
            <strong>Healthcare Privacy Principle:</strong> We only collect basic contact info to secure your account. No medical history, conditions, or prescriptions are required to create a general account.
          </p>
        </div>

        {/* Required Terms Checkbox */}
        <div className="space-y-2 pt-1 text-left">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <span className="text-xs text-slate-700 leading-snug">
              I agree to the GlobalHealth <a href="#terms" className="font-semibold text-emerald-700 hover:underline">Terms of Service</a> and acknowledge the <a href="#privacy" className="font-semibold text-emerald-700 hover:underline">Privacy Policy</a>.
            </span>
          </label>

          {/* Optional Marketing Checkbox */}
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={marketingConsent}
              onChange={(e) => setMarketingConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <span className="text-xs text-slate-500 leading-snug">
              Send me optional healthcare news, updates and health insights.
            </span>
          </label>
        </div>

        {/* Primary Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-60 disabled:cursor-not-allowed transition cursor-pointer mt-2"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Footer Navigation Switcher */}
      <div className="mt-5 pt-4 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline transition cursor-pointer"
          >
            Log In
          </button>
        </p>

        <div className="mt-3 flex items-center justify-center gap-3 text-[11px] text-slate-400">
          <a href="#privacy" className="hover:text-slate-600 transition">Privacy Policy</a>
          <span>·</span>
          <a href="#terms" className="hover:text-slate-600 transition">Terms of Service</a>
          <span>·</span>
          <button
            type="button"
            onClick={onRequestHelp}
            className="hover:text-slate-600 transition cursor-pointer"
          >
            Help & Security
          </button>
        </div>
      </div>
    </div>
  );
};
