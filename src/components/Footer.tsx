import React, { useState } from 'react';
import { Heart, X, Globe2, Accessibility, Info, Mail } from 'lucide-react';
import { NavigationTab } from '../types';
import { useLocalization } from '../context/LocalizationContext';

interface FooterProps {
  onTabChange: (tab: NavigationTab) => void;
}

type LegalDoc = 'privacy' | 'terms' | 'editorial' | 'about' | 'contact' | 'accessibility' | null;

export const Footer: React.FC<FooterProps> = ({ onTabChange }) => {
  const { t, languageOption, setIsLanguageModalOpen } = useLocalization();
  const [legalDoc, setLegalDoc] = useState<LegalDoc>(null);

  const legalCopy: Record<NonNullable<LegalDoc>, { title: string; body: string }> = {
    privacy: {
      title: 'Privacy policy',
      body: 'GlobalHealth stores personal health information only for the signed-in account. Records are isolated per user, access is consent-controlled, and emergency numbers on this site are for public information only. We do not sell health data.',
    },
    terms: {
      title: 'Terms of service',
      body: 'GlobalHealth is an educational health directory and care-coordination workspace. It does not replace professional medical advice, diagnosis or emergency care. Always consult a licensed clinician for personal medical decisions.',
    },
    editorial: {
      title: 'Medical disclaimer',
      body: 'Public news and research briefs are labelled by source and evidence type. Institutional announcements are published through the Verified Authority portal. Content is educational and is not a prescription. GlobalHealth is not a medical certification body.',
    },
    about: {
      title: 'About GlobalHealth',
      body: 'GlobalHealth is a unified healthcare platform connecting trustworthy information, healthcare discovery, personal health tools and intelligent assistance — with trusted information, medicines, healthcare professionals, medical facilities, laboratory resources and verified pharmacy pathways in one place.',
    },
    contact: {
      title: 'Contact',
      body: 'Healthcare institutions and partners connect through the dedicated Doctor, Hospital and Pharmacy portals available in the navigation. For editorial and institutional announcements, use the News Management workspace. Emergency numbers are always available in the header and footer.',
    },
    accessibility: {
      title: 'Accessibility',
      body: 'GlobalHealth is designed for keyboard navigation, visible focus states, semantic headings and screen readers. The interface honours the prefers-reduced-motion setting and maintains WCAG-aware color contrast. Text can be re-scaled without breaking layouts.',
    },
  };

  const columnLink = (label: string, action: () => void) => (
    <li>
      <button type="button" onClick={action} className="text-[13px] text-slate-400 transition hover:text-white">
        {label}
      </button>
    </li>
  );

  return (
    <footer className="border-t border-slate-800 bg-slate-950 pb-8 pt-14 text-xs">
      <div className="gh-container">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1 — brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-medical-500 to-medical-700 text-white">
                <Heart className="h-4.5 w-4.5 fill-white/20" />
              </span>
              <span className="text-lg font-bold tracking-tight text-white">
                Global<span className="text-medical-400">Health</span>
              </span>
            </div>
            <p className="max-w-xs text-[13px] leading-relaxed text-slate-400">
              Making healthcare easier to understand, discover and navigate.
            </p>
            <button
              type="button"
              onClick={() => setIsLanguageModalOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"
            >
              <Globe2 className="h-4 w-4 text-medical-400" />
              Languages ({languageOption.nativeName})
            </button>
          </div>

          {/* Column 2 — Explore */}
          <nav aria-label="Explore">
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-200">Explore</h4>
            <ul className="space-y-2.5">
              {columnLink('Health', () => onTabChange('diseases'))}
              {columnLink('Diseases', () => onTabChange('diseases'))}
              {columnLink('Medicines', () => onTabChange('medicines'))}
              {columnLink('Lab Tests', () => onTabChange('medical-tests'))}
              {columnLink('Doctors', () => onTabChange('doctors'))}
              {columnLink('Medical Map', () => onTabChange('medical-map'))}
            </ul>
          </nav>

          {/* Column 3 — Platform */}
          <nav aria-label="Platform">
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-200">Platform</h4>
            <ul className="space-y-2.5">
              {columnLink('Community', () => onTabChange('community'))}
              {columnLink('Health Tools', () => onTabChange('calculators'))}
              {columnLink('Health News', () => onTabChange('news'))}
              {columnLink('Saved Library', () => onTabChange('dashboard', 'saved'))}
              {columnLink('Dashboard', () => onTabChange('dashboard', 'dashboard'))}
            </ul>
          </nav>

          {/* Column 4 — Company / Information */}
          <nav aria-label="Company and information">
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-200">Company / Information</h4>
            <ul className="space-y-2.5">
              {columnLink('About', () => setLegalDoc('about'))}
              {columnLink('Contact', () => setLegalDoc('contact'))}
              {columnLink('Privacy', () => setLegalDoc('privacy'))}
              {columnLink('Terms', () => setLegalDoc('terms'))}
              {columnLink('Accessibility', () => setLegalDoc('accessibility'))}
              {columnLink('Medical Disclaimer', () => setLegalDoc('editorial'))}
            </ul>
          </nav>
        </div>

        {/* Bottom row */}
        <div className="mt-12 flex flex-col gap-4 border-t border-slate-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-slate-500">© {new Date().getFullYear()} GlobalHealth. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-slate-500">
            <button type="button" onClick={() => setLegalDoc('privacy')} className="transition hover:text-slate-300">Privacy</button>
            <span aria-hidden="true">•</span>
            <button type="button" onClick={() => setLegalDoc('terms')} className="transition hover:text-slate-300">Terms</button>
            <span aria-hidden="true">•</span>
            <button type="button" onClick={() => setLegalDoc('accessibility')} className="transition hover:text-slate-300">Accessibility</button>
            <span aria-hidden="true">•</span>
            <button type="button" onClick={() => setLegalDoc('editorial')} className="transition hover:text-slate-300">Medical Disclaimer</button>
          </div>
        </div>

        <p className="mt-6 max-w-4xl text-[11px] leading-relaxed text-slate-600">
          GlobalHealth provides educational health information and care-coordination tools. It does
          not provide medical advice, diagnosis or treatment, and is not a substitute for a licensed
          clinician or emergency services. Information on this platform should not be used to make
          decisions about your health without consulting a qualified professional.
        </p>
      </div>

      {/* Legal / info modal */}
      {legalDoc && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="legal-title"
          onClick={() => setLegalDoc(null)}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-5 text-slate-800 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <h3 id="legal-title" className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                {legalDoc === 'about' && <Info className="h-4 w-4 text-medical-600" />}
                {legalDoc === 'contact' && <Mail className="h-4 w-4 text-medical-600" />}
                {legalDoc === 'accessibility' && <Accessibility className="h-4 w-4 text-medical-600" />}
                {legalCopy[legalDoc].title}
              </h3>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setLegalDoc(null)}
                className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-600">{legalCopy[legalDoc].body}</p>
            <button
              type="button"
              onClick={() => setLegalDoc(null)}
              className="mt-4 w-full rounded-xl bg-slate-900 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </footer>
  );
};
