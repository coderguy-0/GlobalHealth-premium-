import React, { useEffect } from 'react';
import {
  X,
  Newspaper,
  Building2,
  Droplets,
  Users,
  ShoppingBag,
  FileHeart,
  Stethoscope,
  Globe2,
  Ambulance,
  ArrowLeft,
  Heart,
  BookOpen,
  Activity,
  Pill,
  FlaskConical,
  Calculator,
  Salad,
} from 'lucide-react';
import { NavigationTab } from '../types';

interface MoreOverlayProps {
  open: boolean;
  onClose: () => void;
  currentTab: NavigationTab;
  onNavigate: (tab: NavigationTab, mode?: 'details' | 'dashboard' | 'ehr' | 'saved') => void;
  onEmergency: () => void;
  onLanguages: () => void;
}

interface OverlayItem {
  id: string;
  tab: NavigationTab;
  label: string;
  description: string;
  icon: React.ReactNode;
  mode?: 'details' | 'dashboard' | 'ehr' | 'saved';
  badge?: string;
}

const EXPLORE_ITEMS: OverlayItem[] = [
  { id: 'ov-diseases', tab: 'diseases', label: 'Diseases', description: 'Understand conditions, symptoms and prevention.', icon: <BookOpen className="h-5 w-5" /> },
  { id: 'ov-medicines', tab: 'medicines', label: 'Medicines', description: 'Medicine information, safety and educational guides.', icon: <Pill className="h-5 w-5" /> },
  { id: 'ov-tests', tab: 'medical-tests', label: 'Lab Tests', description: 'Explore tests, panels and what results mean.', icon: <FlaskConical className="h-5 w-5" /> },
  { id: 'ov-doctors', tab: 'doctors', label: 'Doctors', description: 'Find verified doctors and specialists.', icon: <Stethoscope className="h-5 w-5" /> },
  { id: 'ov-hospitals', tab: 'hospitals', label: 'Hospitals', description: 'Discover hospitals and medical facilities.', icon: <Building2 className="h-5 w-5" /> },
  { id: 'ov-facilities', tab: 'medical-map', label: 'MAP', description: 'Explore healthcare locations geographically.', icon: <Droplets className="h-5 w-5" /> },
  { id: 'ov-pharmacies', tab: 'pharmacy-portal', label: 'Pharmacies', description: 'Verified pharmacy partners.', icon: <ShoppingBag className="h-5 w-5" /> },
  { id: 'ov-community', tab: 'community', label: 'Community', description: 'Discussions, topics and educational content.', icon: <Users className="h-5 w-5" /> },
  { id: 'ov-news', tab: 'news', label: 'Health News', description: 'Sourced healthcare updates and research briefs.', icon: <Newspaper className="h-5 w-5" /> },
  { id: 'ov-nutrition', tab: 'nutrition', label: 'Nutrition & Recipes', description: 'Meals, nutrients and balanced plans.', icon: <Salad className="h-5 w-5" /> },
  { id: 'ov-wellness', tab: 'wellness', label: 'Wellness & Fitness', description: 'Movement, mobility and everyday wellbeing.', icon: <Activity className="h-5 w-5" /> },
  { id: 'ov-calculators', tab: 'calculators', label: 'Health Tools', description: 'Calculators and trackers for your health goals.', icon: <Calculator className="h-5 w-5" /> },
];

const WORKSPACE_ITEMS: OverlayItem[] = [
  { id: 'ov-health-records', tab: 'dashboard', mode: 'dashboard', label: 'My Health Records', description: 'Personal dashboard, EHR and doctor access.', icon: <FileHeart className="h-5 w-5" />, badge: 'Personal' },
  { id: 'ov-doctor-portal', tab: 'medauth', label: 'Doctor Portal', description: 'Verified physician workspace.', icon: <Stethoscope className="h-5 w-5" />, badge: 'MedAuth' },
  { id: 'ov-hospital-portal', tab: 'hospital-portal', label: 'Hospital Portal', description: 'Hospital operations & staff management.', icon: <Building2 className="h-5 w-5" />, badge: 'Enterprise' },
  { id: 'ov-pharmacy-portal', tab: 'pharmacy-portal', label: 'Pharmacy Porter', description: 'Pharmacy stock, expiry and orders.', icon: <ShoppingBag className="h-5 w-5" />, badge: 'v4.2' },
  { id: 'ov-news-cms', tab: 'news-management', label: 'News Management', description: 'Editorial CMS & authority publishing.', icon: <Newspaper className="h-5 w-5" />, badge: 'CMS' },
];

/**
 * Full-viewport overlay that covers the website page when the visitor opens
 * the "More" menu. Every tab inside it navigates and closes the overlay —
 * the page underneath stays mounted so closing returns exactly where they were.
 */
export const MoreOverlay: React.FC<MoreOverlayProps> = ({
  open,
  onClose,
  currentTab,
  onNavigate,
  onEmergency,
  onLanguages,
}) => {
  // Lock page scroll + close on Escape while open.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const renderItem = (item: OverlayItem) => {
    const active = currentTab === item.tab;
    return (
      <button
        key={item.id}
        id={item.id}
        type="button"
        onClick={() => onNavigate(item.tab, item.mode)}
        className={`group flex w-full items-start gap-3.5 rounded-2xl border p-4 text-left transition duration-200 ${
          active
            ? 'border-medical-300 bg-medical-50 shadow-sm'
            : 'border-slate-200/80 bg-white shadow-soft hover:-translate-y-0.5 hover:border-medical-200 hover:shadow-lift'
        }`}
      >
        <span
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition ${
            active ? 'bg-medical-600 text-white' : 'bg-medical-50 text-medical-700 group-hover:bg-medical-100'
          }`}
        >
          {item.icon}
        </span>
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-1.5">
            <span className={`text-sm font-bold ${active ? 'text-medical-800' : 'text-slate-900'}`}>{item.label}</span>
            {item.badge && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">
                {item.badge}
              </span>
            )}
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-slate-500">{item.description}</span>
        </span>
      </button>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-white animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="more-overlay-title"
    >
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-medical-500 to-medical-700 text-white shadow-sm">
            <Heart className="h-4.5 w-4.5 fill-white/20" />
          </span>
          <div className="min-w-0">
            <h2 id="more-overlay-title" className="truncate text-base font-bold tracking-tight text-slate-900">
              Explore GlobalHealth
            </h2>
            <p className="truncate text-[11px] text-slate-500">
              Every area of GlobalHealth in one place — pick a destination to continue.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
          {/* Explore */}
          <section aria-labelledby="more-explore-title">
            <div className="flex items-center gap-2">
              <span className="gh-eyebrow">Explore</span>
            </div>
            <h3 id="more-explore-title" className="mt-3 text-lg font-bold tracking-tight text-slate-900">
              More areas of GlobalHealth
            </h3>
            <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {EXPLORE_ITEMS.map(renderItem)}
            </div>
          </section>

          {/* Workspaces */}
          <section className="mt-10" aria-labelledby="more-workspaces-title">
            <div className="flex items-center gap-2">
              <span className="gh-eyebrow">Workspaces</span>
            </div>
            <h3 id="more-workspaces-title" className="mt-3 text-lg font-bold tracking-tight text-slate-900">
              Specialized portals
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Authorized workspaces open over the website and return you here when closed.
            </p>
            <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {WORKSPACE_ITEMS.map(renderItem)}
            </div>
          </section>

          {/* Support */}
          <section className="mt-10" aria-labelledby="more-support-title">
            <div className="flex items-center gap-2">
              <span className="gh-eyebrow">Support</span>
            </div>
            <h3 id="more-support-title" className="mt-3 text-lg font-bold tracking-tight text-slate-900">
              Help &amp; preferences
            </h3>
            <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <button
                type="button"
                onClick={onEmergency}
                className="group flex w-full items-start gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-soft transition duration-200 hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-lift"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-600 transition group-hover:bg-rose-600 group-hover:text-white">
                  <Ambulance className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-slate-900">Emergency numbers</span>
                  <span className="mt-1 block text-xs leading-relaxed text-slate-500">
                    Local emergency lines for the US, EU/UK, India and mental-health crisis support.
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={onLanguages}
                className="group flex w-full items-start gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-soft transition duration-200 hover:-translate-y-0.5 hover:border-medical-200 hover:shadow-lift"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-medical-50 text-medical-700 transition group-hover:bg-medical-600 group-hover:text-white">
                  <Globe2 className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-slate-900">Languages</span>
                  <span className="mt-1 block text-xs leading-relaxed text-slate-500">
                    Switch GlobalHealth to one of 100 languages and scripts.
                  </span>
                </span>
              </button>
            </div>
          </section>

          {/* Back */}
          <div className="mt-12 flex justify-center">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-soft transition hover:border-medical-200 hover:bg-medical-50 hover:text-medical-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to website
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
