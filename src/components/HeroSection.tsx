import React, { useState, useEffect, Suspense, lazy } from 'react';
import { 
  Search, 
  Pill, 
  FlaskConical, 
  ChefHat, 
  Newspaper, 
  Stethoscope, 
  Sparkles, 
  ArrowRight, 
  HelpCircle,
  Building2
} from 'lucide-react';
import { NavigationTab } from '../types';
import { HEALTH_CONDITIONS, MEDICINES, MEDICAL_TESTS, RECIPES, DOCTORS, MEDICAL_LITERACY_CHALLENGES } from '../data/healthData';
import { newsService } from '../services/newsService';
import { useLocalization } from '../context/LocalizationContext';
import type { DirectoryInfographicKind } from './DirectoryInfographicWorkspace';

// The full directory infographic workspace is heavy — only load it when a
// visitor actually opens one of the directory cards.
const DirectoryInfographicWorkspace = lazy(() =>
  import('./DirectoryInfographicWorkspace').then((m) => ({ default: m.DirectoryInfographicWorkspace }))
);

interface HeroSectionProps {
  onTabChange: (tab: NavigationTab) => void;
  onSelectSearchResult?: (type: string, item: any) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onTabChange }) => {
  const { t, formatNumber, isRTL } = useLocalization();
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [infographicKind, setInfographicKind] = useState<DirectoryInfographicKind | null>(null);

  // Search indexing across categories
  const filteredConditions = searchQuery.trim()
    ? HEALTH_CONDITIONS.filter(c => 
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.symptoms.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const filteredMedicines = searchQuery.trim()
    ? MEDICINES.filter(m => 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.genericName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredTests = searchQuery.trim()
    ? MEDICAL_TESTS.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredRecipes = searchQuery.trim()
    ? RECIPES.filter(r => 
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.dietTags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const filteredDoctors = searchQuery.trim()
    ? DOCTORS.filter(d => 
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.specialty.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const hasSearchHits = 
    filteredConditions.length > 0 || 
    filteredMedicines.length > 0 || 
    filteredTests.length > 0 || 
    filteredRecipes.length > 0 ||
    filteredDoctors.length > 0;

  const directoryCards: {
    tab: NavigationTab;
    title: string;
    desc: string;
    icon: React.ReactNode;
    accent: string;
    iconWrap: string;
    ring: string;
  }[] = [
    {
      tab: 'diseases',
      title: 'Diseases',
      desc: 'Guides, symptoms and care',
      icon: <Stethoscope className="h-5 w-5" />,
      accent: 'text-rose-700',
      iconWrap: 'bg-rose-100 text-rose-700',
      ring: 'hover:border-rose-300 hover:shadow-rose-100',
    },
    {
      tab: 'medicines',
      title: 'Medicines',
      desc: 'Directory and safety notes',
      icon: <Pill className="h-5 w-5" />,
      accent: 'text-violet-700',
      iconWrap: 'bg-violet-100 text-violet-700',
      ring: 'hover:border-violet-300 hover:shadow-violet-100',
    },
    {
      tab: 'medical-tests',
      title: 'Tests & labs',
      desc: 'Labs, ranges and prep',
      icon: <FlaskConical className="h-5 w-5" />,
      accent: 'text-cyan-700',
      iconWrap: 'bg-cyan-100 text-cyan-700',
      ring: 'hover:border-cyan-300 hover:shadow-cyan-100',
    },
    {
      tab: 'nutrition',
      title: 'Nutrition',
      desc: 'Meals, nutrients and plans',
      icon: <ChefHat className="h-5 w-5" />,
      accent: 'text-lime-700',
      iconWrap: 'bg-lime-100 text-lime-700',
      ring: 'hover:border-lime-300 hover:shadow-lime-100',
    },
    {
      tab: 'news',
      title: 'News',
      desc: 'Clinical research briefs',
      icon: <Newspaper className="h-5 w-5" />,
      accent: 'text-teal-700',
      iconWrap: 'bg-teal-100 text-teal-700',
      ring: 'hover:border-teal-300 hover:shadow-teal-100',
    },
    {
      tab: 'doctors',
      title: 'Hospitals',
      desc: 'Verified care network',
      icon: <Building2 className="h-5 w-5" />,
      accent: 'text-emerald-700',
      iconWrap: 'bg-emerald-100 text-emerald-700',
      ring: 'hover:border-emerald-300 hover:shadow-emerald-100',
    },
  ];

  // Dynamic News Question Teaser for Current Visit
  const [currentNewsQuestion, setCurrentNewsQuestion] = useState<any>(null);

  useEffect(() => {
    try {
      const published = newsService.getArticles().filter(a => a.status === 'published');
      if (published.length === 0) return;

      const visitKey = 'gh_news_visit_counter';
      const visitCount = parseInt(sessionStorage.getItem(visitKey) || '1', 10);
      const articleIdx = (visitCount - 1) % published.length;
      const targetArticle = published[articleIdx] || published[0];

      const matchedChallenge = MEDICAL_LITERACY_CHALLENGES.find(
        c => c.newsArticleId === targetArticle.id || targetArticle.title.toLowerCase().includes(c.newsHeadline.toLowerCase().slice(0, 15))
      );

      setCurrentNewsQuestion({
        article: targetArticle,
        question: matchedChallenge ? matchedChallenge.question : `Based on recent clinical findings in "${targetArticle.title}", how does this impact daily wellness?`,
        source: targetArticle.source,
        category: targetArticle.category
      });
    } catch {
      // ignore
    }
  }, []);

  const handleScrollToQuestion = () => {
    const el = document.getElementById('home-news-question-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      onTabChange('news');
    }
  };

  return (
    <section className="relative bg-gradient-to-b from-emerald-50/70 via-teal-50/30 to-white py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100/60 px-3.5 py-1 text-xs font-semibold text-emerald-800">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>{t('hero.portalBadge')}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {t('hero.title')}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>

          {/* Interactive Unified Search Box */}
          <div className="relative max-w-2xl mx-auto pt-2">
            <div className="relative flex items-center rounded-2xl border border-slate-300 bg-white shadow-lg focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition p-1.5">
              <Search className={`h-5 w-5 text-slate-400 shrink-0 ${isRTL ? 'mr-3 ml-1' : 'ml-3 mr-1'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                placeholder={t('hero.searchPlaceholder')}
                aria-label="Search conditions, medicines, tests and recipes"
                className="w-full bg-transparent px-3 py-2 text-sm text-slate-800 focus:outline-hidden placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setShowResults(false);
                  }}
                  className="mx-2 rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-200"
                >
                  {t('hero.clearSearch')}
                </button>
              )}
            </div>

            {/* Live Search Results Dropdown */}
            {showResults && searchQuery.trim() && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowResults(false)} />
                <div className="absolute left-0 right-0 top-full mt-2 z-40 max-h-96 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl text-left divide-y divide-slate-100 animate-in fade-in duration-150">
                  {!hasSearchHits && (
                    <div className="p-4 text-center text-xs text-slate-500">
                      {t('hero.noResults')} "{searchQuery}". {t('hero.trySearching')}
                    </div>
                  )}

                  {filteredConditions.length > 0 && (
                    <div className="py-2">
                      <div className="px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        {t('hero.conditionsHit')} ({formatNumber(filteredConditions.length)})
                      </div>
                      {filteredConditions.slice(0, 3).map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            onTabChange('diseases');
                            setShowResults(false);
                          }}
                          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-emerald-50 text-left transition"
                        >
                          <div>
                            <span className="text-xs font-semibold text-slate-900">{c.title}</span>
                            <span className="ml-2 text-[10px] text-slate-500 font-normal">({c.category})</span>
                          </div>
                          <ArrowRight className={`h-3.5 w-3.5 text-slate-400 ${isRTL ? 'rotate-180' : ''}`} />
                        </button>
                      ))}
                    </div>
                  )}

                  {filteredMedicines.length > 0 && (
                    <div className="py-2">
                      <div className="px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        {t('hero.medicinesHit')} ({formatNumber(filteredMedicines.length)})
                      </div>
                      {filteredMedicines.slice(0, 3).map((m) => (
                        <button
                          key={m.id}
                          onClick={() => {
                            onTabChange('medicines');
                            setShowResults(false);
                          }}
                          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-violet-50 text-left transition"
                        >
                          <div>
                            <span className="text-xs font-semibold text-slate-900">{m.name}</span>
                            <span className="ml-2 text-[10px] text-slate-500 font-normal">({m.genericName})</span>
                          </div>
                          <ArrowRight className={`h-3.5 w-3.5 text-slate-400 ${isRTL ? 'rotate-180' : ''}`} />
                        </button>
                      ))}
                    </div>
                  )}

                  {filteredTests.length > 0 && (
                    <div className="py-2">
                      <div className="px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        {t('hero.testsHit')} ({formatNumber(filteredTests.length)})
                      </div>
                      {filteredTests.slice(0, 3).map((test) => (
                        <button
                          key={test.id}
                          onClick={() => {
                            onTabChange('medical-tests');
                            setShowResults(false);
                          }}
                          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-cyan-50 text-left transition"
                        >
                          <div>
                            <span className="text-xs font-semibold text-slate-900">{test.name}</span>
                          </div>
                          <ArrowRight className={`h-3.5 w-3.5 text-slate-400 ${isRTL ? 'rotate-180' : ''}`} />
                        </button>
                      ))}
                    </div>
                  )}

                  {filteredRecipes.length > 0 && (
                    <div className="py-2">
                      <div className="px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        {t('hero.recipesHit')} ({formatNumber(filteredRecipes.length)})
                      </div>
                      {filteredRecipes.slice(0, 3).map((r) => (
                        <button
                          key={r.id}
                          onClick={() => {
                            onTabChange('recipes');
                            setShowResults(false);
                          }}
                          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-lime-50 text-left transition"
                        >
                          <div>
                            <span className="text-xs font-semibold text-slate-900">{r.title}</span>
                          </div>
                          <ArrowRight className={`h-3.5 w-3.5 text-slate-400 ${isRTL ? 'rotate-180' : ''}`} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Miniature symmetric directory cards */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {directoryCards.map((card) => (
            <button
              key={card.tab}
              type="button"
              onClick={() => setInfographicKind(card.tab as DirectoryInfographicKind)}
              className={`group flex h-full min-h-[148px] flex-col items-center justify-center gap-2.5 rounded-2xl border border-slate-200/90 bg-white px-3 py-4 text-center shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${card.ring}`}
            >
              <span className={`grid h-11 w-11 place-items-center rounded-2xl ${card.iconWrap} shadow-sm transition group-hover:scale-105`}>
                {card.icon}
              </span>
              <div className="space-y-0.5">
                <span className={`block text-[12px] font-extrabold leading-snug tracking-tight ${card.accent}`}>
                  {card.title}
                </span>
                <span className="block text-[10px] font-medium leading-snug text-slate-500">
                  {card.desc}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Live News Spotlight Teaser Bar */}
        {currentNewsQuestion && (
          <button 
            type="button"
            onClick={handleScrollToQuestion}
            className="mt-6 w-full rounded-2xl border border-teal-200/80 bg-white/90 p-4 shadow-sm hover:border-teal-400 hover:shadow-md transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 shrink-0 group-hover:scale-105 transition">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-teal-600 text-white px-2 py-0.5 rounded-md">
                    {t('hero.liveNewsQuestion')}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 hidden md:inline-block">
                    {t('hero.changesEveryVisit')} • {currentNewsQuestion.category}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-teal-700 transition line-clamp-1">
                  {currentNewsQuestion.question}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-extrabold text-teal-700 flex items-center gap-1 group-hover:translate-x-0.5 transition">
                {t('hero.answerAndRead')}
                <ArrowRight className={`h-3.5 w-3.5 ${isRTL ? 'rotate-180' : ''}`} />
              </span>
            </div>
          </button>
        )}
      </div>

      {infographicKind && (
        <Suspense
          fallback={
            <div className="mt-6 flex h-40 items-center justify-center rounded-2xl border border-slate-200 bg-white/70 text-xs font-bold text-slate-500">
              Loading directory workspace…
            </div>
          }
        >
          <DirectoryInfographicWorkspace
            kind={infographicKind}
            onClose={() => setInfographicKind(null)}
            onOpenFullDirectory={(tab) => {
              setInfographicKind(null);
              onTabChange(tab);
            }}
          />
        </Suspense>
      )}
    </section>
  );
};
