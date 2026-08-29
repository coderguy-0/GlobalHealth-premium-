import React, { useState, useRef, useEffect } from 'react';
import { 
  Heart, 
  Pill, 
  FlaskConical, 
  Calculator, 
  Bot, 
  Users, 
  Newspaper, 
  Bookmark, 
  PhoneCall, 
  Menu, 
  X, 
  Building2, 
  Stethoscope,
  ShieldCheck,
  LayoutDashboard,
  Salad,
  LogIn,
  UserPlus,
  LogOut,
  ChevronDown,
  Activity,
  Calendar,
  ShoppingBag,
  Layers,
  FileSpreadsheet,
  History,
  FileHeart,
  Shield,
  User
} from 'lucide-react';
import { NavigationTab, UserAccount } from '../types';
import { LanguageSelector } from './LanguageSelector';
import { useLocalization } from '../context/LocalizationContext';
import { useAuth } from '../context/AuthContext';


interface NavbarProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab, subMode?: 'details' | 'dashboard' | 'ehr' | 'saved') => void;
  savedCount: number;
  currentUser: UserAccount | null;
  onOpenAuthModal: (mode?: 'login' | 'signup') => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  savedCount,
  currentUser,
  onOpenAuthModal,
  onLogout,
}) => {
  const { t, isRTL } = useLocalization();
  const { requireAuth } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [healthRecordsDropdownOpen, setHealthRecordsDropdownOpen] = useState(false);
  const [portalsDropdownOpen, setPortalsDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const healthRecordsRef = useRef<HTMLDivElement>(null);
  const portalsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (healthRecordsRef.current && !healthRecordsRef.current.contains(e.target as Node)) {
        setHealthRecordsDropdownOpen(false);
      }
      if (portalsRef.current && !portalsRef.current.contains(e.target as Node)) {
        setPortalsDropdownOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setUserDropdownOpen(false);
        setHealthRecordsDropdownOpen(false);
        setPortalsDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  // 11 Core Navigation Items requested by user
  const mainNavItems = [
    { id: 'nav-home', tab: 'home' as NavigationTab, label: 'Home', icon: <Heart className="h-3.5 w-3.5 text-rose-500" /> },
    { id: 'nav-diseases', tab: 'diseases' as NavigationTab, label: 'Diseases', icon: <Stethoscope className="h-3.5 w-3.5 text-indigo-500" /> },
    { id: 'nav-medicines', tab: 'medicines' as NavigationTab, label: 'Medicines', icon: <Pill className="h-3.5 w-3.5 text-sky-500" /> },
    { id: 'nav-tests', tab: 'medical-tests' as NavigationTab, label: 'Tests & labs', icon: <FlaskConical className="h-3.5 w-3.5 text-purple-500" /> },
    { id: 'nav-nutrition', tab: 'nutrition' as NavigationTab, label: 'Nutrition', icon: <Salad className="h-3.5 w-3.5 text-emerald-500" /> },
    { id: 'nav-wellness', tab: 'wellness' as NavigationTab, label: 'Wellness', icon: <Activity className="h-3.5 w-3.5 text-amber-500" /> },
    { id: 'nav-ai', tab: 'ai-assistant' as NavigationTab, label: 'AI assistant', icon: <Bot className="h-3.5 w-3.5 text-teal-600" />, hasBadge: 'AI' },
    { id: 'nav-calculators', tab: 'calculators' as NavigationTab, label: 'Calculators', icon: <Calculator className="h-3.5 w-3.5 text-orange-500" /> },
    { id: 'nav-community', tab: 'community' as NavigationTab, label: 'Community', icon: <Users className="h-3.5 w-3.5 text-pink-500" /> },
    { id: 'nav-news', tab: 'news' as NavigationTab, label: 'News', icon: <Newspaper className="h-3.5 w-3.5 text-blue-500" /> },
    { id: 'nav-doctors', tab: 'doctors' as NavigationTab, label: 'Hospitals', icon: <Building2 className="h-3.5 w-3.5 text-emerald-600" /> },
  ];

  // My Health Records Dropdown Details
  const isHealthRecordsActive = 
    currentTab === 'dashboard' || 
    currentTab === 'privacy' || 
    currentTab === 'doctor-consent' || 
    currentTab === 'my-history';

  // Portals Dropdown Details
  const isPortalsActive = 
    currentTab === 'doctor-portal' || 
    currentTab === 'hospital-portal' || 
    currentTab === 'pharmacy-portal' || 
    currentTab === 'news-management' || 
    currentTab === 'news-admin' || 
    currentTab === 'news-authority' || 
    currentTab === 'medauth' ||
    currentTab === 'doctor-console';

  return (
    <>
      <header className="sticky top-0 z-40 overflow-visible border-b border-slate-200 bg-white/95 backdrop-blur-md">
        {/* Top Header Bar */}
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
          {/* Brand Logo & Wordmark */}
          <div className="flex items-center gap-3">
            <button
              id="brand-logo-btn"
              onClick={() => onTabChange('home')}
              className="flex items-center gap-2.5 group text-left focus:outline-hidden cursor-pointer"
              aria-label="GlobalHealth Home"
            >
              <div className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20 transition group-hover:scale-105">
                <Heart className="h-4.5 w-4.5 fill-white/20 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-emerald-700 transition">
                  Global<span className="text-emerald-600">Health</span>
                </span>
                <span className="hidden sm:block text-[10px] font-medium text-slate-500 tracking-wide">
                  Universal Health Network
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Right Header Utilities */}
          <div className="hidden lg:flex items-center gap-2.5">
            {/* Global Language Selector */}
            <LanguageSelector />

            {/* User Session Auth Button or Dropdown Menu */}
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  aria-expanded={userDropdownOpen}
                  aria-haspopup="menu"
                  className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 py-1.5 px-3 text-xs font-bold text-slate-800 hover:bg-emerald-100/70 transition cursor-pointer"
                >
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.fullName || 'User'}
                      className="h-6 w-6 rounded-full object-cover border border-emerald-300"
                    />
                  ) : (
                    <div className="grid h-6 w-6 place-items-center rounded-full bg-emerald-600 text-[10px] font-extrabold text-white">
                      {currentUser?.fullName?.charAt(0) || currentUser?.username?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span className="max-w-28 truncate">{currentUser.fullName || currentUser.username || 'User'}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-emerald-700" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-xl z-50 text-xs text-slate-800 animate-in fade-in`}>
                    <div className="border-b border-slate-100 pb-2 mb-2 px-2">
                      <div className="font-extrabold text-slate-900 text-sm">{currentUser.fullName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">@{currentUser.username}</div>
                      <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
                    </div>

                    <div className="space-y-0.5">
                      <button
                        onClick={() => {
                          onTabChange('dashboard', 'details');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 rounded-xl p-2 hover:bg-slate-50 font-semibold text-slate-700 text-left transition"
                      >
                        <User className="h-4 w-4 text-slate-600" />
                        <span>Personal Details</span>
                      </button>

                      <button
                        onClick={() => {
                          onTabChange('dashboard', 'dashboard');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 rounded-xl p-2 hover:bg-slate-50 font-semibold text-slate-700 text-left transition"
                      >
                        <LayoutDashboard className="h-4 w-4 text-teal-600" />
                        <span>Personal Health Dashboard</span>
                      </button>

                      <button
                        onClick={() => {
                          onTabChange('dashboard', 'ehr');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 rounded-xl p-2 hover:bg-slate-50 font-semibold text-slate-700 text-left transition"
                      >
                        <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                        <span>Clinical Health Record (EHR)</span>
                      </button>

                      <button
                        onClick={() => {
                          onTabChange('dashboard', 'saved');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-between rounded-xl p-2 hover:bg-slate-50 font-semibold text-slate-700 text-left transition"
                      >
                        <div className="flex items-center gap-2">
                          <Bookmark className="h-4 w-4 text-amber-600" />
                          <span>Saved Library</span>
                        </div>
                        {savedCount > 0 && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">
                            {savedCount}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          onTabChange('doctor-consent');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 rounded-xl p-2 hover:bg-emerald-50 font-semibold text-emerald-800 text-left transition"
                      >
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        <span>Doctor Access &amp; Consent</span>
                      </button>

                      <button
                        onClick={() => {
                          onTabChange('appointments');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 rounded-xl p-2 hover:bg-slate-50 font-semibold text-slate-700 text-left transition"
                      >
                        <Calendar className="h-4 w-4 text-indigo-600" />
                        <span>My Appointments</span>
                      </button>

                      <button
                        onClick={() => {
                          onTabChange('my-history');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 rounded-xl p-2 hover:bg-slate-50 font-semibold text-slate-700 text-left transition"
                      >
                        <History className="h-4 w-4 text-slate-600" />
                        <span>Activity &amp; Security History</span>
                      </button>
                    </div>

                    <div className="pt-2 mt-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          onLogout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 rounded-xl p-2 hover:bg-rose-50 font-semibold text-rose-700 text-left transition"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>{t('nav.signOut')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  id="navbar-signin-btn"
                  onClick={() => requireAuth({}, 'login')}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
                >
                  <LogIn className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{t('nav.signIn')}</span>
                </button>
                <button
                  id="navbar-signup-btn"
                  onClick={() => requireAuth({}, 'signup')}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition cursor-pointer"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>{t('nav.signUp')}</span>
                </button>
              </div>
            )}

            {/* Emergency Hotline Trigger */}
            <button
              id="emergency-hotline-btn"
              onClick={() => setShowEmergencyModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-red-700 transition cursor-pointer"
            >
              <PhoneCall className="h-3.5 w-3.5 animate-pulse" />
              <span>{t('nav.emergency')}</span>
            </button>
          </div>

          {/* Mobile Header Actions (Language + Mobile Menu Button) */}
          <div className="flex lg:hidden items-center gap-2">
            <LanguageSelector />
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 focus:outline-hidden cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Primary Sub-Navigation Bar for Desktop */}
        <nav className="hidden lg:block border-t border-slate-100 bg-slate-50/80 px-2 sm:px-4 py-1">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-1 overflow-visible text-xs">
            {/* 11 Main Navigation Links */}
            <div className="flex items-center gap-0.5 min-w-0 overflow-x-auto scrollbar-none">
              {mainNavItems.map((item) => {
                const isActive = currentTab === item.tab;
                return (
                  <button
                    key={item.id}
                    id={item.id}
                    onClick={() => onTabChange(item.tab)}
                    className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 font-medium transition cursor-pointer ${
                      isActive
                        ? 'bg-white font-bold text-emerald-800 shadow-xs border border-emerald-200/80'
                        : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {item.hasBadge && (
                      <span className="text-[9px] font-extrabold bg-teal-100 text-teal-800 px-1 py-0.2 rounded-md">
                        {item.hasBadge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Structured Dropdown Menus: My Health Records & Other Portals */}
            <div className="flex items-center gap-1 shrink-0 pl-2 border-l border-slate-200">
              {/* 12. Dropdown: My Health Records */}
              <div className="relative" ref={healthRecordsRef}>
                <div
                  className={`flex items-center overflow-hidden rounded-lg border transition ${
                    isHealthRecordsActive
                      ? 'border-teal-200 bg-white shadow-xs'
                      : 'border-transparent hover:bg-white/80'
                  }`}
                >
                  <button
                    id="dropdown-health-records-btn"
                    onClick={() => {
                      // Opens straight onto the personal health dashboard.
                      onTabChange('dashboard', 'dashboard');
                      setHealthRecordsDropdownOpen(false);
                      setPortalsDropdownOpen(false);
                    }}
                    className={`flex items-center gap-1.5 whitespace-nowrap px-2.5 py-1.5 font-medium transition cursor-pointer ${
                      isHealthRecordsActive
                        ? 'font-bold text-teal-800'
                        : 'text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <FileHeart className="h-3.5 w-3.5 text-teal-600" />
                    <span className="font-semibold">My health records</span>
                  </button>
                  <button
                    id="dropdown-health-records-toggle-btn"
                    aria-expanded={healthRecordsDropdownOpen}
                    aria-haspopup="menu"
                    aria-label="Health records menu"
                    onClick={() => {
                      setHealthRecordsDropdownOpen(!healthRecordsDropdownOpen);
                      setPortalsDropdownOpen(false);
                    }}
                    className={`flex items-center px-1.5 py-1.5 transition cursor-pointer ${
                      isHealthRecordsActive ? 'text-teal-800' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <ChevronDown className={`h-3 w-3 transition-transform ${healthRecordsDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {healthRecordsDropdownOpen && (
                  <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-1.5 w-80 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl z-[60] animate-in fade-in`}>
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                      <span>My Health Records</span>
                      <span className="text-[9px] bg-teal-50 text-teal-700 font-bold px-1.5 py-0.5 rounded-full border border-teal-200">
                        FHIR R4 Aligned
                      </span>
                    </div>

                    <div className="space-y-1 mt-1.5">
                      {/* Personal health dashboard */}
                      <button
                        id="nav-sub-personal-dashboard"
                        onClick={() => {
                          onTabChange('dashboard', 'dashboard');
                          setHealthRecordsDropdownOpen(false);
                        }}
                        className="w-full flex items-start gap-3 p-2.5 rounded-xl text-left hover:bg-teal-50/70 transition group cursor-pointer"
                      >
                        <div className="p-2 rounded-xl bg-teal-100/80 text-teal-700 group-hover:bg-teal-600 group-hover:text-white transition">
                          <LayoutDashboard className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-teal-900">
                            Personal health dashboard
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Daily telemetry, water logs, vitals &amp; wellness tracker
                          </div>
                        </div>
                      </button>

                      {/* Doctor access */}
                      <button
                        id="nav-sub-doctor-access"
                        onClick={() => {
                          onTabChange('doctor-consent');
                          setHealthRecordsDropdownOpen(false);
                        }}
                        className="w-full flex items-start gap-3 p-2.5 rounded-xl text-left hover:bg-emerald-50/70 transition group cursor-pointer"
                      >
                        <div className="p-2 rounded-xl bg-emerald-100/80 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition">
                          <ShieldCheck className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-900">
                            Doctor access
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Patient-controlled physician access, consent tokens &amp; sharing rules
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 13. Dropdown: Some Other Portals */}
              <div className="relative" ref={portalsRef}>
                <button
                  id="dropdown-portals-btn"
                  aria-expanded={portalsDropdownOpen}
                  aria-haspopup="menu"
                  onClick={() => {
                    setPortalsDropdownOpen(!portalsDropdownOpen);
                    setHealthRecordsDropdownOpen(false);
                  }}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 font-medium transition cursor-pointer ${
                    isPortalsActive
                      ? 'bg-white font-bold text-indigo-800 shadow-xs border border-indigo-200'
                      : 'text-slate-700 hover:bg-white/80 hover:text-slate-900'
                  }`}
                >
                  <Layers className="h-3.5 w-3.5 text-indigo-600" />
                  <span className="font-semibold">Portals</span>
                  <ChevronDown className={`h-3 w-3 text-slate-500 transition-transform ${portalsDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {portalsDropdownOpen && (
                  <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-1.5 w-80 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl z-[60] animate-in fade-in`}>
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      Specialized portals
                    </div>

                    <div className="space-y-1 mt-1.5">
                      <button
                        id="nav-portal-doctor"
                        onClick={() => {
                          onTabChange('medauth');
                          setPortalsDropdownOpen(false);
                        }}
                        className="w-full flex items-start gap-3 p-2.5 rounded-xl text-left hover:bg-emerald-50/80 transition group cursor-pointer"
                      >
                        <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 group-hover:bg-emerald-600 group-hover:text-white transition shrink-0">
                          <Stethoscope className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-extrabold text-slate-900">Doctor Portal</span>
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded font-mono">MedAuth Engine™</span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">Verified physician EHR, consults and e-prescriptions.</p>
                        </div>
                      </button>

                      <button
                        id="nav-portal-hospital"
                        onClick={() => {
                          onTabChange('hospital-portal');
                          setPortalsDropdownOpen(false);
                        }}
                        className="w-full flex items-start gap-3 p-2.5 rounded-xl text-left hover:bg-indigo-50/80 transition group cursor-pointer"
                      >
                        <div className="p-2 rounded-xl bg-indigo-100 text-indigo-800 group-hover:bg-indigo-600 group-hover:text-white transition shrink-0">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-extrabold text-slate-900">Hospital Portal</span>
                            <span className="text-[9px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.5 rounded font-mono">Enterprise</span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">Beds, ambulance dispatch and hospital staff ops.</p>
                        </div>
                      </button>

                      <button
                        id="nav-portal-pharmacy"
                        onClick={() => {
                          onTabChange('pharmacy-portal');
                          setPortalsDropdownOpen(false);
                        }}
                        className="w-full flex items-start gap-3 p-2.5 rounded-xl text-left hover:bg-teal-50/80 transition group cursor-pointer"
                      >
                        <div className="p-2 rounded-xl bg-teal-100 text-teal-800 group-hover:bg-teal-600 group-hover:text-white transition shrink-0">
                          <ShoppingBag className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-extrabold text-slate-900">Pharmacy Porter</span>
                            <span className="text-[9px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.5 rounded font-mono">v4.2</span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">Prescriptions, stock, expiry and multi-branch orders.</p>
                        </div>
                      </button>

                      <div className="p-2.5 rounded-xl hover:bg-purple-50/80 transition">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-xl bg-purple-100 text-purple-800 shrink-0">
                            <Newspaper className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-extrabold text-slate-900">news management</span>
                              <span className="text-[9px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded font-mono">CMS</span>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate">Publish clinical news and authority bulletins.</p>
                            <div className="mt-1.5 flex gap-1.5">
                              <button
                                id="nav-portal-news-cms"
                                onClick={() => {
                                  onTabChange('news-management');
                                  setPortalsDropdownOpen(false);
                                }}
                                className="rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold px-2 py-1 cursor-pointer"
                              >
                                News Management
                              </button>
                              <button
                                id="nav-portal-news-authority"
                                onClick={() => {
                                  onTabChange('news-authority');
                                  setPortalsDropdownOpen(false);
                                }}
                                className="rounded-lg bg-white hover:bg-purple-100 text-purple-900 border border-purple-300 text-[10px] font-bold px-2 py-1 cursor-pointer"
                              >
                                Verified Authority
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-2 duration-150 max-h-[85vh] overflow-y-auto">
            {/* Mobile Auth Bar */}
            <div className="mb-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
              {currentUser ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {currentUser.avatarUrl ? (
                      <img
                        src={currentUser.avatarUrl}
                        alt={currentUser.fullName || 'User'}
                        className="h-8 w-8 rounded-full object-cover border border-emerald-300"
                      />
                    ) : (
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                        {currentUser?.fullName?.charAt(0) || currentUser?.username?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-xs text-slate-900">{currentUser.fullName || currentUser.username || 'User'}</div>
                      <div className="text-[10px] text-slate-500 font-mono">@{currentUser.username || 'user'}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 cursor-pointer"
                  >
                    {t('nav.signOut')}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      requireAuth({}, 'login');
                      setMobileMenuOpen(false);
                    }}
                    className="rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-800 cursor-pointer"
                  >
                    {t('nav.signIn')}
                  </button>
                  <button
                    onClick={() => {
                      requireAuth({}, 'signup');
                      setMobileMenuOpen(false);
                    }}
                    className="rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white cursor-pointer"
                  >
                    {t('nav.signUp')}
                  </button>
                </div>
              )}
            </div>

            {/* Core Navigation Items */}
            <div className="mb-4">
              <div className="px-1 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Browse
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {mainNavItems.map((item) => {
                  const isActive = currentTab === item.tab;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onTabChange(item.tab);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-2.5 rounded-xl p-2.5 text-xs font-medium text-left transition cursor-pointer ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* My Health Records Details in Mobile */}
            <div className="mb-4 pt-3 border-t border-slate-100">
              <div className="px-1 mb-2 text-[10px] font-bold uppercase tracking-wider text-teal-700 flex items-center justify-between">
                <span>My Health Records</span>
                <span className="text-[9px] bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded font-bold">Personal &amp; EHR</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                <button
                  onClick={() => {
                    onTabChange('dashboard', 'dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2.5 rounded-xl p-2.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 hover:bg-teal-50 cursor-pointer"
                >
                  <LayoutDashboard className="h-4 w-4 text-teal-600 shrink-0" />
                    <span>Health dashboard</span>
                </button>

                <button
                  onClick={() => {
                    onTabChange('doctor-consent');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2.5 rounded-xl p-2.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 hover:bg-emerald-50 cursor-pointer"
                >
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Doctor access</span>
                </button>
              </div>
            </div>

            {/* Other Portals in Mobile */}
            <div className="mb-4 pt-3 border-t border-slate-100">
              <div className="px-1 mb-2 text-[10px] font-bold uppercase tracking-wider text-indigo-700 flex items-center justify-between">
                <span>Portals</span>
                <span className="text-[9px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded font-bold">Workspaces</span>
              </div>
              <div className="space-y-1.5">
                <button
                  onClick={() => {
                    onTabChange('medauth');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between rounded-xl p-2.5 text-xs font-bold text-emerald-900 bg-emerald-50/80 border border-emerald-200 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Stethoscope className="h-4 w-4 text-emerald-600" />
                    <span>Doctor Portal</span>
                  </div>
                  <span className="text-[9px] bg-emerald-200 text-emerald-900 font-extrabold px-1.5 py-0.2 rounded font-mono">MD</span>
                </button>

                <button
                  onClick={() => {
                    onTabChange('hospital-portal');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between rounded-xl p-2.5 text-xs font-bold text-indigo-900 bg-indigo-50/80 border border-indigo-200 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="h-4 w-4 text-indigo-600" />
                    <span>Hospital Portal</span>
                  </div>
                  <span className="text-[9px] bg-indigo-200 text-indigo-900 font-extrabold px-1.5 py-0.2 rounded font-mono">Enterprise</span>
                </button>

                <button
                  onClick={() => {
                    onTabChange('pharmacy-portal');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between rounded-xl p-2.5 text-xs font-bold text-teal-900 bg-teal-50/80 border border-teal-200 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag className="h-4 w-4 text-teal-600" />
                    <span>Pharmacy Porter</span>
                  </div>
                  <span className="text-[9px] bg-teal-200 text-teal-900 font-extrabold px-1.5 py-0.2 rounded font-mono">Pharmacy</span>
                </button>

                <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                  <button
                    onClick={() => {
                      onTabChange('news-management');
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-xl p-2.5 text-xs font-bold text-purple-900 bg-purple-50/80 border border-purple-200 cursor-pointer"
                  >
                    <Newspaper className="h-3.5 w-3.5 text-purple-600" />
                    <span>News management</span>
                  </button>

                  <button
                    onClick={() => {
                      onTabChange('news-authority');
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-xl p-2.5 text-xs font-bold text-purple-900 bg-white border border-purple-300 hover:bg-purple-50 cursor-pointer"
                  >
                    <Building2 className="h-3.5 w-3.5 text-purple-600" />
                    <span>Verified authority</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Emergency Hotline in Mobile Drawer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  setShowEmergencyModal(true);
                  setMobileMenuOpen(false);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-xs font-semibold text-white shadow-xs cursor-pointer"
              >
                <PhoneCall className="h-4 w-4" />
                <span>{t('emergency.title')}</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Emergency Contact Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-red-600">
                <PhoneCall className="h-5 w-5 animate-pulse" />
                <h3 className="text-base font-bold text-slate-900">{t('emergency.title')}</h3>
              </div>
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              {t('emergency.description')}
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-red-50 border border-red-100 text-red-950 font-medium">
                <span>🇺🇸 {t('emergency.usCanada')}</span>
                <a href="tel:911" className="font-bold text-red-700 hover:underline text-sm">911</a>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-red-50 border border-red-100 text-red-950 font-medium">
                <span>🇪🇺 {t('emergency.euUk')}</span>
                <a href="tel:112" className="font-bold text-red-700 hover:underline text-sm">112 / 999</a>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-red-50 border border-red-100 text-red-950 font-medium">
                <span>🇮🇳 {t('emergency.india')}</span>
                <a href="tel:112" className="font-bold text-red-700 hover:underline text-sm">112 / 102</a>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-950 font-medium">
                <span>🧠 {t('emergency.crisisLine')}</span>
                <a href="tel:988" className="font-bold text-emerald-700 hover:underline text-sm">988 (Call/Text)</a>
              </div>
            </div>

            <div className="mt-5 text-center">
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition cursor-pointer"
              >
                {t('emergency.closeBtn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
