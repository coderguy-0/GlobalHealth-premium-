import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ArrowLeft, 
  CheckCircle2, 
  HelpCircle, 
  Lock, 
  Heart, 
  Calendar, 
  Bookmark, 
  Sparkles, 
  Layers, 
  Shield, 
  Activity,
  Globe2
} from 'lucide-react';
import { useLocalization } from '../context/LocalizationContext';
import { AuthSubView, PublicUserAccount } from '../types/auth';
import { LoginForm } from './auth/LoginForm';
import { SignUpForm } from './auth/SignUpForm';
import { ForgotPasswordForm } from './auth/ForgotPasswordForm';
import { ResetPasswordForm } from './auth/ResetPasswordForm';
import { VerifyEmailPhoneForm } from './auth/VerifyEmailPhoneForm';
import { AccountSecurityView } from './auth/AccountSecurityView';
import { LogoutSuccessView } from './auth/LogoutSuccessView';
import { AuthHelpModal } from './auth/AuthHelpModal';

interface AuthPageProps {
  initialView?: AuthSubView;
  currentUser: PublicUserAccount | null;
  onLoginSuccess: (user: PublicUserAccount, token?: string) => void;
  onLogout: () => void;
  onUpdateUser: (user: PublicUserAccount) => void;
  onReturnToHome: () => void;
  onNavigateToDashboard: () => void;
  /** Open a full legal page (Terms / Privacy Policy). */
  onOpenLegalPage?: (tab: 'terms' | 'privacy-policy') => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialView = 'login',
  currentUser,
  onLoginSuccess,
  onLogout,
  onUpdateUser,
  onReturnToHome,
  onNavigateToDashboard,
  onOpenLegalPage
}) => {
  const { t, currentLanguage } = useLocalization();
  const [activeSubView, setActiveSubView] = useState<AuthSubView>(initialView);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Verification state handover
  const [verificationData, setVerificationData] = useState<{
    userId: string;
    contactTarget?: string;
    type: 'email' | 'phone';
    devCode?: string;
  } | null>(null);

  // Reset password token handover
  const [recoveryToken, setRecoveryToken] = useState<string>('');

  useEffect(() => {
    if (initialView) {
      setActiveSubView(initialView);
    }
  }, [initialView]);

  // If user is already authenticated and opens security
  if (currentUser && activeSubView === 'security') {
    return (
      <div className="min-h-screen bg-slate-50 py-6">
        <AccountSecurityView
          currentUser={currentUser}
          onUpdateUser={onUpdateUser}
          onBackToDashboard={onNavigateToDashboard}
          onOpenLegalPage={onOpenLegalPage}
          onLogout={() => {
            onLogout();
            setActiveSubView('logout-success');
          }}
        />
        <AuthHelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/30 flex flex-col justify-between">
      {/* 1. Header Navigation Bar (Focused for Authentication) */}
      <header className="w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand identity */}
          <div className="flex items-center gap-3">
            <button
              onClick={onReturnToHome}
              className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-hidden"
            >
              <div className="h-10 w-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:scale-105 transition">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-slate-900 tracking-tight block leading-tight">
                  GlobalHealth
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 tracking-wide block uppercase">
                  Verified Healthcare Portal
                </span>
              </div>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:text-slate-900 hover:border-slate-300 transition cursor-pointer"
            >
              <HelpCircle className="h-3.5 w-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Security & Help</span>
            </button>

            <button
              type="button"
              onClick={onReturnToHome}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to GlobalHealth</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Authentication Content Surface */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex items-center justify-center">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Branding / Value Proposition (Desktop) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-between text-left space-y-8 pr-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/70 border border-emerald-200 text-emerald-800 text-xs font-bold mb-4 shadow-2xs">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                <span>Public Patient & User Portal</span>
              </div>
              <h2 className="text-3xl xl:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Your healthcare, organized around you.
              </h2>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                Connect your medical preferences, track upcoming appointments, and save verified hospitals and doctors with complete privacy.
              </p>
            </div>

            {/* Core Value Badges */}
            <div className="space-y-3.5">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="h-8 w-8 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Bookmark className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Saved Healthcare Directory</h3>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Bookmark trusted hospitals, specialized clinics, doctors and urgent care centers.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="h-8 w-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Centralized Consultations</h3>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Track consultation schedules, clinical reminders, and verified pharmacy orders.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="h-8 w-8 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Privacy By Design</h3>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Zero required diagnosis disclosures for account registration. Strict role-based isolation.
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Flow Indicators */}
            <div className="pt-2 border-t border-slate-200/80 flex items-center gap-4 text-xs font-semibold text-slate-500">
              <button
                type="button"
                onClick={() => setActiveSubView('login')}
                className={`transition cursor-pointer ${activeSubView === 'login' ? 'text-emerald-700 font-bold underline' : 'hover:text-slate-800'}`}
              >
                Log In
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setActiveSubView('signup')}
                className={`transition cursor-pointer ${activeSubView === 'signup' ? 'text-emerald-700 font-bold underline' : 'hover:text-slate-800'}`}
              >
                Create Account
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setActiveSubView('forgot-password')}
                className={`transition cursor-pointer ${activeSubView === 'forgot-password' ? 'text-emerald-700 font-bold underline' : 'hover:text-slate-800'}`}
              >
                Forgot Password
              </button>
            </div>
          </div>

          {/* Right Column: Active Authentication Card */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 sm:p-8 relative">
              
              {/* Secondary Tab Switcher Bar */}
              {(activeSubView === 'login' || activeSubView === 'signup' || activeSubView === 'forgot-password') && (
                <div className="flex rounded-2xl bg-slate-100 p-1 mb-6 text-xs font-bold text-slate-600">
                  <button
                    type="button"
                    onClick={() => setActiveSubView('login')}
                    className={`flex-1 py-2 rounded-xl transition cursor-pointer ${
                      activeSubView === 'login'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    Log In
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSubView('signup')}
                    className={`flex-1 py-2 rounded-xl transition cursor-pointer ${
                      activeSubView === 'signup'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    Create Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSubView('forgot-password')}
                    className={`flex-1 py-2 rounded-xl transition cursor-pointer ${
                      activeSubView === 'forgot-password'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    Recover
                  </button>
                </div>
              )}

              {/* View Router */}
              {activeSubView === 'login' && (
                <LoginForm
                  onSuccess={(user, token) => {
                    onLoginSuccess(user, token);
                    onNavigateToDashboard();
                  }}
                  onNavigate={(view) => setActiveSubView(view)}
                  onRequestHelp={() => setShowHelpModal(true)}
                  onOpenLegal={onOpenLegalPage}
                  onRequiresVerification={(data) => {
                    setVerificationData({
                      userId: data.userId,
                      contactTarget: data.email || data.phone || 'your registered contact',
                      type: data.type
                    });
                    setActiveSubView(data.type === 'phone' ? 'verify-phone' : 'verify-email');
                  }}
                />
              )}

              {activeSubView === 'signup' && (
                <SignUpForm
                  onSuccess={(data) => {
                    setVerificationData({
                      userId: data.userId,
                      contactTarget: data.email,
                      type: data.type,
                      devCode: data.devCode
                    });
                    setActiveSubView(data.type === 'phone' ? 'verify-phone' : 'verify-email');
                  }}
                  onNavigate={(view) => setActiveSubView(view)}
                  onRequestHelp={() => setShowHelpModal(true)}
                  onOpenLegal={onOpenLegalPage}
                />
              )}

              {activeSubView === 'forgot-password' && (
                <ForgotPasswordForm
                  onNavigate={(view) => setActiveSubView(view)}
                  onRecoveryTokenGenerated={(token) => {
                    setRecoveryToken(token);
                  }}
                  onRequestHelp={() => setShowHelpModal(true)}
                  onOpenLegal={onOpenLegalPage}
                />
              )}

              {activeSubView === 'reset-password' && (
                <ResetPasswordForm
                  initialToken={recoveryToken}
                  onSuccess={() => setActiveSubView('login')}
                  onOpenLegal={onOpenLegalPage}
                  onNavigate={(view) => setActiveSubView(view)}
                  onRequestHelp={() => setShowHelpModal(true)}
                />
              )}

              {(activeSubView === 'verify-email' || activeSubView === 'verify-phone') && (
                <VerifyEmailPhoneForm
                  userId={verificationData?.userId || 'usr-sarah-jenkins'}
                  contactTarget={verificationData?.contactTarget || 'your registered email/number'}
                  type={activeSubView === 'verify-phone' ? 'phone' : 'email'}
                  devCode={verificationData?.devCode}
                  onSuccess={(user, token) => {
                    onLoginSuccess(user, token);
                    onNavigateToDashboard();
                  }}
                  onNavigate={(view) => setActiveSubView(view)}
                  onRequestHelp={() => setShowHelpModal(true)}
                  onOpenLegal={onOpenLegalPage}
                />
              )}

              {activeSubView === 'logout-success' && (
                <LogoutSuccessView
                  onLoginAgain={() => setActiveSubView('login')}
                  onReturnHome={onReturnToHome}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 3. Footer */}
      <footer className="w-full border-t border-slate-200/80 bg-white py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} GlobalHealth Portal. All rights reserved. Strict Public User Security Policy.</p>
          <div className="flex items-center gap-4 text-slate-600 font-semibold">
            <button type="button" onClick={() => onOpenLegalPage?.('privacy-policy')} className="hover:text-emerald-700 transition cursor-pointer">Privacy Policy</button>
            <button type="button" onClick={() => onOpenLegalPage?.('terms')} className="hover:text-emerald-700 transition cursor-pointer">Terms &amp; Conditions</button>
            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="hover:text-emerald-700 transition cursor-pointer"
            >
              Security Policy
            </button>
          </div>
        </div>
      </footer>

      {/* Help Modal */}
      <AuthHelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
    </div>
  );
};
