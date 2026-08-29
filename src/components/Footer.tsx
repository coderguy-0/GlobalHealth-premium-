import React, { useState } from 'react';
import { Heart, ShieldCheck, PhoneCall, Globe2, X } from 'lucide-react';
import { NavigationTab } from '../types';
import { useLocalization } from '../context/LocalizationContext';

interface FooterProps {
  onTabChange: (tab: NavigationTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onTabChange }) => {
  const { t, languageOption, setIsLanguageModalOpen } = useLocalization();
  const [legalDoc, setLegalDoc] = useState<'privacy' | 'terms' | 'editorial' | null>(null);

  const legalCopy = {
    privacy: {
      title: 'Privacy policy',
      body: 'GlobalHealth stores personal health information only for the signed-in account. Records are isolated per user, access is consent-controlled, and emergency numbers on this site are for public information only. We do not sell health data.',
    },
    terms: {
      title: 'Terms of service',
      body: 'GlobalHealth is an educational health directory and care-coordination workspace. It does not replace professional medical advice, diagnosis or emergency care. Always consult a licensed clinician for personal medical decisions.',
    },
    editorial: {
      title: 'Editorial guidelines',
      body: 'Public news and research briefs are labelled by source and evidence type. Institutional announcements are published through the Verified Authority portal. Content is educational and is not a prescription.',
    },
  };

  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300 pt-10 pb-8 text-xs">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                <Heart className="h-4 w-4 fill-white/20" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">GlobalHealth</span>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-sm">
              {t('footer.brandDesc')}
            </p>
            <div className="flex items-start gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{t('disclaimer.badge')}</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 text-xs tracking-wider uppercase">{t('footer.explore')}</h4>
            <ul className="space-y-2 text-slate-400">
              <li><button type="button" onClick={() => onTabChange('diseases')} className="hover:text-emerald-400 transition cursor-pointer">Diseases</button></li>
              <li><button type="button" onClick={() => onTabChange('medicines')} className="hover:text-emerald-400 transition cursor-pointer">Medicines</button></li>
              <li><button type="button" onClick={() => onTabChange('medical-tests')} className="hover:text-emerald-400 transition cursor-pointer">Tests &amp; labs</button></li>
              <li><button type="button" onClick={() => onTabChange('nutrition')} className="hover:text-emerald-400 transition cursor-pointer">Nutrition</button></li>
              <li><button type="button" onClick={() => onTabChange('wellness')} className="hover:text-emerald-400 transition cursor-pointer">Wellness</button></li>
              <li><button type="button" onClick={() => onTabChange('ai-assistant')} className="hover:text-emerald-400 transition cursor-pointer">AI assistant</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 text-xs tracking-wider uppercase">{t('footer.directories')}</h4>
            <ul className="space-y-2 text-slate-400">
              <li><button type="button" onClick={() => onTabChange('doctors')} className="hover:text-emerald-400 transition cursor-pointer">Hospitals</button></li>
              <li><button type="button" onClick={() => onTabChange('community')} className="hover:text-emerald-400 transition cursor-pointer">Community</button></li>
              <li><button type="button" onClick={() => onTabChange('news')} className="hover:text-emerald-400 transition cursor-pointer">News</button></li>
              <li><button type="button" onClick={() => onTabChange('medical-map')} className="hover:text-emerald-400 transition cursor-pointer">Medical map</button></li>
              <li><button type="button" onClick={() => onTabChange('medauth')} className="hover:text-emerald-400 transition cursor-pointer">Doctor Portal</button></li>
              <li><button type="button" onClick={() => onTabChange('hospital-portal')} className="hover:text-emerald-400 transition cursor-pointer">Hospital Portal</button></li>
              <li><button type="button" onClick={() => onTabChange('pharmacy-portal')} className="hover:text-emerald-400 transition cursor-pointer">Pharmacy Porter</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 text-xs tracking-wider uppercase">{t('footer.emergencySupport')}</h4>
            <div className="space-y-2 text-slate-400">
              <p className="flex items-center gap-1.5 text-red-400 font-medium">
                <PhoneCall className="h-3.5 w-3.5" /> Emergency: 911 / 112 / 102
              </p>
              <button
                type="button"
                onClick={() => setIsLanguageModalOpen(true)}
                className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
              >
                <Globe2 className="h-3.5 w-3.5" /> Languages ({languageOption.nativeName})
              </button>
            </div>
          </div>
        </div>

        <div className="pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>{t('footer.rights')}</p>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => setLegalDoc('privacy')} className="hover:text-slate-300 cursor-pointer">{t('footer.privacyPolicy')}</button>
            <span>•</span>
            <button type="button" onClick={() => setLegalDoc('terms')} className="hover:text-slate-300 cursor-pointer">{t('footer.termsOfService')}</button>
            <span>•</span>
            <button type="button" onClick={() => setLegalDoc('editorial')} className="hover:text-slate-300 cursor-pointer">{t('footer.editorialGuidelines')}</button>
          </div>
        </div>
      </div>

      {legalDoc && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/60"
          role="dialog"
          aria-modal="true"
          aria-labelledby="legal-title"
          onClick={() => setLegalDoc(null)}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-5 text-slate-800 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <h3 id="legal-title" className="text-sm font-extrabold text-slate-900">{legalCopy[legalDoc].title}</h3>
              <button type="button" aria-label="Close" onClick={() => setLegalDoc(null)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-600">{legalCopy[legalDoc].body}</p>
            <button
              type="button"
              onClick={() => setLegalDoc(null)}
              className="mt-4 w-full rounded-xl bg-slate-900 py-2 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </footer>
  );
};
