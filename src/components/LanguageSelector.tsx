import React from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useLocalization } from '../context/LocalizationContext';

export const LanguageSelector: React.FC = () => {
  const { languageOption, setIsLanguageModalOpen, t } = useLocalization();

  return (
    <button
      onClick={() => setIsLanguageModalOpen(true)}
      className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-emerald-300 hover:bg-slate-50 focus:outline-hidden group"
      title={t('Change Language & Script (100 World Languages)')}
      aria-label={t('Change Language & Script')}
    >
      <Globe className="h-4 w-4 text-emerald-600 group-hover:scale-105 transition" />
      <span className="flex items-center gap-1.5">
        <span className="text-sm">{languageOption.flag}</span>
        <span className="text-slate-900 font-bold max-w-24 truncate">{languageOption.nativeName}</span>
      </span>
      <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 transition" />
    </button>
  );
};
