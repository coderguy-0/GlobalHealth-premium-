import React, { useState, useMemo } from 'react';
import { 
  Stethoscope, 
  Search, 
  Bookmark, 
  Clock, 
  ChevronRight, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert,
  Activity,
  Filter,
  Sparkles,
  HeartPulse,
  Brain,
  Wind,
  Droplets,
  Layers,
  Check,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Flame,
  ArrowUpDown,
  Tag
} from 'lucide-react';
import { HEALTH_CONDITIONS } from '../data/healthData';
import { HealthCondition } from '../types';
import { useLocalization } from '../context/LocalizationContext';
import { DiseaseInfographic } from './DiseaseInfographic';

interface DiseasesViewProps {
  savedIds: string[];
  onToggleSave: (id: string) => void;
}

type SymptomMatchMode = 'any' | 'all';
type SortOption = 'relevance' | 'title-asc' | 'title-desc' | 'read-time-asc' | 'read-time-desc';

export const DiseasesView: React.FC<DiseasesViewProps> = ({
  savedIds,
  onToggleSave,
}) => {
  const { t, formatNumber, isRTL } = useLocalization();
  // Multi-Filter State
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [symptomMatchMode, setSymptomMatchMode] = useState<SymptomMatchMode>('any');
  const [selectedBodyParts, setSelectedBodyParts] = useState<string[]>([]);
  const [hasEmergencyFlagsOnly, setHasEmergencyFlagsOnly] = useState<boolean>(false);
  const [showSavedOnly, setShowSavedOnly] = useState<boolean>(false);
  const [readTimeFilter, setReadTimeFilter] = useState<'all' | 'quick' | 'indepth'>('all');
  const [hasDiagnosticTestsOnly, setHasDiagnosticTestsOnly] = useState<boolean>(false);
  
  // Search & Sorting
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');

  // UI Panels & Infographic States
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState<boolean>(false);
  const [symptomSearchQuery, setSymptomSearchQuery] = useState<string>('');
  const [selectedCondition, setSelectedCondition] = useState<HealthCondition | null>(null);
  const [modalViewMode, setModalViewMode] = useState<'all' | 'infograph' | 'guide'>('all');

  // Dynamic Categories from Data with counts
  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    HEALTH_CONDITIONS.forEach(c => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    const list = Object.keys(counts).sort();
    return { list, counts };
  }, []);

  // Dynamic Popular Symptoms from Data with occurrence counts
  const allSymptomsWithCounts = useMemo(() => {
    const map = new Map<string, number>();
    HEALTH_CONDITIONS.forEach(c => {
      c.symptoms.forEach(s => {
        // Normalize symptom string for grouping
        const trimmed = s.trim();
        map.set(trimmed, (map.get(trimmed) || 0) + 1);
      });
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([symptom, count]) => ({ symptom, count }));
  }, []);

  // Filtered symptoms for the symptom picker
  const filteredSymptomsList = useMemo(() => {
    if (!symptomSearchQuery.trim()) {
      return allSymptomsWithCounts.slice(0, 24);
    }
    return allSymptomsWithCounts.filter(item => 
      item.symptom.toLowerCase().includes(symptomSearchQuery.toLowerCase())
    );
  }, [allSymptomsWithCounts, symptomSearchQuery]);

  // Dynamic Affected Body Parts / Organ Systems
  const allBodyPartsWithCounts = useMemo(() => {
    const map = new Map<string, number>();
    HEALTH_CONDITIONS.forEach(c => {
      if (c.affectedBodyParts) {
        c.affectedBodyParts.forEach(part => {
          const trimmed = part.trim();
          map.set(trimmed, (map.get(trimmed) || 0) + 1);
        });
      }
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([part, count]) => ({ part, count }));
  }, []);

  // Category Multi-Selection Toggle
  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const selectAllCategories = () => {
    setSelectedCategories(categoryStats.list);
  };

  const clearCategories = () => {
    setSelectedCategories([]);
  };

  // Symptom Multi-Selection Toggle
  const toggleSymptom = (sym: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
    );
  };

  // Body Part Multi-Selection Toggle
  const toggleBodyPart = (part: string) => {
    setSelectedBodyParts(prev =>
      prev.includes(part) ? prev.filter(p => p !== part) : [...prev, part]
    );
  };

  // Reset all filters
  const resetAllFilters = () => {
    setSelectedCategories([]);
    setSelectedSymptoms([]);
    setSymptomMatchMode('any');
    setSelectedBodyParts([]);
    setHasEmergencyFlagsOnly(false);
    setShowSavedOnly(false);
    setReadTimeFilter('all');
    setHasDiagnosticTestsOnly(false);
    setSearchTerm('');
    setSymptomSearchQuery('');
    setSortBy('relevance');
  };

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    count += selectedCategories.length;
    count += selectedSymptoms.length;
    count += selectedBodyParts.length;
    if (hasEmergencyFlagsOnly) count += 1;
    if (showSavedOnly) count += 1;
    if (readTimeFilter !== 'all') count += 1;
    if (hasDiagnosticTestsOnly) count += 1;
    if (searchTerm.trim()) count += 1;
    return count;
  }, [
    selectedCategories.length,
    selectedSymptoms.length,
    selectedBodyParts.length,
    hasEmergencyFlagsOnly,
    showSavedOnly,
    readTimeFilter,
    hasDiagnosticTestsOnly,
    searchTerm
  ]);

  // Main Filtering Engine with Multiple Simultaneous Constraints
  const filteredAndSortedConditions = useMemo(() => {
    const results = HEALTH_CONDITIONS.filter(condition => {
      // 1. Multiple Category Filter (OR logic within selected categories)
      if (selectedCategories.length > 0 && !selectedCategories.includes(condition.category)) {
        return false;
      }

      // 2. Multiple Symptoms Filter
      if (selectedSymptoms.length > 0) {
        const condSymptomsLower = condition.symptoms.map(s => s.toLowerCase());
        if (symptomMatchMode === 'all') {
          // Condition must contain ALL selected symptoms
          const hasAll = selectedSymptoms.every(selSym => 
            condSymptomsLower.some(cs => cs.includes(selSym.toLowerCase()) || selSym.toLowerCase().includes(cs))
          );
          if (!hasAll) return false;
        } else {
          // Condition must contain AT LEAST ONE selected symptom
          const hasAny = selectedSymptoms.some(selSym => 
            condSymptomsLower.some(cs => cs.includes(selSym.toLowerCase()) || selSym.toLowerCase().includes(cs))
          );
          if (!hasAny) return false;
        }
      }

      // 3. Multiple Affected Body Parts Filter (OR logic across selected body parts)
      if (selectedBodyParts.length > 0) {
        if (!condition.affectedBodyParts || condition.affectedBodyParts.length === 0) {
          return false;
        }
        const condPartsLower = condition.affectedBodyParts.map(p => p.toLowerCase());
        const matchesBodyPart = selectedBodyParts.some(selPart =>
          condPartsLower.some(cp => cp.includes(selPart.toLowerCase()) || selPart.toLowerCase().includes(cp))
        );
        if (!matchesBodyPart) return false;
      }

      // 4. Emergency Flags Only
      if (hasEmergencyFlagsOnly) {
        if (!condition.emergencyWarningSigns || condition.emergencyWarningSigns.length === 0) {
          return false;
        }
      }

      // 5. Saved Only
      if (showSavedOnly) {
        if (!savedIds.includes(condition.id)) {
          return false;
        }
      }

      // 6. Read Time Filter
      if (readTimeFilter !== 'all') {
        const readMins = parseInt(condition.readTime, 10) || 5;
        if (readTimeFilter === 'quick' && readMins > 5) return false;
        if (readTimeFilter === 'indepth' && readMins <= 5) return false;
      }

      // 7. Diagnostic Tests Available Only
      if (hasDiagnosticTestsOnly) {
        if (!condition.diagnosisAndTests || condition.diagnosisAndTests.length === 0) {
          return false;
        }
      }

      // 8. Keyword Search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = condition.title.toLowerCase().includes(q);
        const matchesSummary = condition.summary.toLowerCase().includes(q);
        const matchesCategory = condition.category.toLowerCase().includes(q);
        const matchesSymptoms = condition.symptoms.some(s => s.toLowerCase().includes(q));
        const matchesTreatments = condition.treatments.some(t => t.toLowerCase().includes(q));
        const matchesCauses = condition.causes.some(c => c.toLowerCase().includes(q));
        const matchesBodyParts = condition.affectedBodyParts?.some(p => p.toLowerCase().includes(q)) || false;

        if (!matchesTitle && !matchesSummary && !matchesCategory && !matchesSymptoms && !matchesTreatments && !matchesCauses && !matchesBodyParts) {
          return false;
        }
      }

      return true;
    });

    // Sorting Logic
    return results.sort((a, b) => {
      if (sortBy === 'title-asc') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'title-desc') {
        return b.title.localeCompare(a.title);
      }
      if (sortBy === 'read-time-asc') {
        const aMins = parseInt(a.readTime, 10) || 5;
        const bMins = parseInt(b.readTime, 10) || 5;
        return aMins - bMins;
      }
      if (sortBy === 'read-time-desc') {
        const aMins = parseInt(a.readTime, 10) || 5;
        const bMins = parseInt(b.readTime, 10) || 5;
        return bMins - aMins;
      }
      
      // Default: Relevance (Matched symptoms count if symptoms are selected)
      if (selectedSymptoms.length > 0) {
        const countMatched = (cond: HealthCondition) => {
          const lower = cond.symptoms.map(s => s.toLowerCase());
          return selectedSymptoms.filter(sel => lower.some(s => s.includes(sel.toLowerCase()))).length;
        };
        return countMatched(b) - countMatched(a);
      }
      return 0;
    });
  }, [
    selectedCategories,
    selectedSymptoms,
    symptomMatchMode,
    selectedBodyParts,
    hasEmergencyFlagsOnly,
    showSavedOnly,
    readTimeFilter,
    hasDiagnosticTestsOnly,
    searchTerm,
    sortBy,
    savedIds
  ]);

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 lg:px-8 space-y-6">
        
        {/* Header Title Bar */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-100 text-rose-900 px-3 py-1 text-xs font-bold uppercase tracking-wider mb-2">
              <Stethoscope className="h-3.5 w-3.5 text-rose-700" />
              <span>{t('Diseases & Clinical Conditions Index')}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {t('Diseases & Medical Conditions Directory')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              {t('Explore medical guides with multi-category filtering, symptom correlation, affected organ systems, and emergency red flag indicators.')}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-700 font-bold">
              {formatNumber(HEALTH_CONDITIONS.length)}
            </div>
            <div className="text-xs">
              <span className="font-bold text-slate-900 block">{t('Peer-Reviewed Guides')}</span>
              <span className="text-slate-500">{formatNumber(categoryStats.list.length)} {t('Specialties')}</span>
            </div>
          </div>
        </div>

        {/* Primary Search Bar & Control Strip */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('Search by condition name, symptoms, diagnostic tests, or treatments...')}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 pl-10 pr-10 py-2.5 text-xs sm:text-sm placeholder-slate-400 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <div className="relative flex items-center">
                <ArrowUpDown className="absolute left-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  aria-label={t('Sort diseases directory')}
                  className="rounded-2xl border border-slate-200 bg-slate-50/60 pl-8 pr-8 py-2.5 text-xs font-bold text-slate-700 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 appearance-none transition"
                >
                  <option value="relevance">{t('Sort: Most Relevant')}</option>
                  <option value="title-asc">{t('Alphabetical: A to Z')}</option>
                  <option value="title-desc">{t('Alphabetical: Z to A')}</option>
                  <option value="read-time-asc">{t('Read Time: Short to Long')}</option>
                  <option value="read-time-desc">{t('Read Time: Long to Short')}</option>
                </select>
              </div>

              {/* Advanced Multi-Filters Toggle Button */}
              <button
                onClick={() => setIsAdvancedFiltersOpen(!isAdvancedFiltersOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-bold transition shadow-2xs shrink-0 ${
                  isAdvancedFiltersOpen || activeFiltersCount > 0
                    ? 'bg-rose-600 border-rose-600 text-white shadow-rose-600/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>{t('Multiple Filters')}</span>
                {activeFiltersCount > 0 && (
                  <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-white text-rose-700 text-[10px] font-black flex items-center justify-center">
                    {formatNumber(activeFiltersCount)}
                  </span>
                )}
                {isAdvancedFiltersOpen ? <ChevronUp className="h-3.5 w-3.5 ml-0.5" /> : <ChevronDown className="h-3.5 w-3.5 ml-0.5" />}
              </button>
            </div>
          </div>

          {/* Quick Category Multi-Select Chips Bar */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-rose-600" />
                <span>{t('Medical Specialties')}:</span>
              </span>
              <div className="flex items-center gap-2">
                {selectedCategories.length > 0 && (
                  <button
                    onClick={clearCategories}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-800 underline underline-offset-2"
                  >
                    {t('common.clear')} {t('Specialties')}
                  </button>
                )}
                <button
                  onClick={selectedCategories.length === categoryStats.list.length ? clearCategories : selectAllCategories}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-900"
                >
                  {selectedCategories.length === categoryStats.list.length ? t('Deselect All') : t('Select All')}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {/* "All" button */}
              <button
                onClick={clearCategories}
                className={`rounded-2xl px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCategories.length === 0
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{t('All Specialties')}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedCategories.length === 0 ? 'bg-rose-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {formatNumber(HEALTH_CONDITIONS.length)}
                </span>
              </button>

              {/* Individual Multi-Select Categories */}
              {categoryStats.list.map((cat) => {
                const isSelected = selectedCategories.includes(cat);
                const count = categoryStats.counts[cat] || 0;
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`rounded-2xl px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-500/20'
                        : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                    <span>{cat}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-rose-700 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Symptoms Multi-Select Filter Bar */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-rose-600" />
                  <span>Quick Symptom Multi-Select ({selectedSymptoms.length} active):</span>
                </span>
                
                {/* Match Mode (ANY vs ALL) */}
                {selectedSymptoms.length > 1 && (
                  <div className="flex items-center rounded-xl bg-slate-100 p-0.5 border border-slate-200 text-[10px] font-extrabold">
                    <button
                      onClick={() => setSymptomMatchMode('any')}
                      className={`px-2 py-0.5 rounded-lg transition ${
                        symptomMatchMode === 'any' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      Match Any
                    </button>
                    <button
                      onClick={() => setSymptomMatchMode('all')}
                      className={`px-2 py-0.5 rounded-lg transition ${
                        symptomMatchMode === 'all' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      Match All
                    </button>
                  </div>
                )}
              </div>

              {selectedSymptoms.length > 0 && (
                <button
                  onClick={() => setSelectedSymptoms([])}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-800 underline underline-offset-2"
                >
                  Clear Symptoms
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {allSymptomsWithCounts.slice(0, 10).map(({ symptom, count }) => {
                const isSelected = selectedSymptoms.includes(symptom);
                return (
                  <button
                    key={symptom}
                    onClick={() => toggleSymptom(symptom)}
                    className={`rounded-full px-3 py-1 text-[11px] font-medium transition flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-rose-600 text-white font-bold shadow-2xs ring-2 ring-rose-500/20'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                    <span>{symptom}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-rose-700 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
              <button
                onClick={() => setIsAdvancedFiltersOpen(true)}
                className="text-[11px] font-bold text-rose-700 hover:text-rose-800 px-2 py-1 bg-rose-50 rounded-full border border-rose-200 flex items-center gap-1"
              >
                <span>+ More Symptoms & Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Advanced Multi-Filter Panel */}
        {isAdvancedFiltersOpen && (
          <div className="rounded-3xl border border-rose-200 bg-white p-6 shadow-md space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  <SlidersHorizontal className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                    Comprehensive Multi-Filter Selection Panel
                  </h3>
                  <p className="text-xs text-slate-500">
                    Combine medical categories, multi-symptom criteria, affected organ systems, and clinical severity flags.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={resetAllFilters}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset All</span>
                </button>
                <button
                  onClick={() => setIsAdvancedFiltersOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Grid of Advanced Multi-Filter Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Section 1: All Symptoms Multi-Picker with Search */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-rose-600" />
                    <span>Multi-Symptom Picker</span>
                  </span>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                    {selectedSymptoms.length} selected
                  </span>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={symptomSearchQuery}
                    onChange={(e) => setSymptomSearchQuery(e.target.value)}
                    placeholder="Search symptoms (e.g. Chest pain, Fever, Cough)..."
                    className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1 pr-1 text-xs">
                  {filteredSymptomsList.map(({ symptom, count }) => {
                    const isSelected = selectedSymptoms.includes(symptom);
                    return (
                      <button
                        key={symptom}
                        onClick={() => toggleSymptom(symptom)}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition ${
                          isSelected
                            ? 'bg-rose-600 text-white font-bold shadow-2xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <div className={`h-4 w-4 rounded-md border flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-white text-rose-600 border-white' : 'border-slate-300 bg-slate-50'
                          }`}>
                            {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <span className="truncate">{symptom}</span>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-md shrink-0 ml-1 ${
                          isSelected ? 'bg-rose-700 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Match Mode Selector */}
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-600 font-medium">Symptom Logic:</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSymptomMatchMode('any')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                        symptomMatchMode === 'any' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      Match Any (OR)
                    </button>
                    <button
                      onClick={() => setSymptomMatchMode('all')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                        symptomMatchMode === 'all' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      Match All (AND)
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 2: Affected Body Systems / Organs */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <HeartPulse className="h-3.5 w-3.5 text-rose-600" />
                    <span>Organ & Body Systems</span>
                  </span>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                    {selectedBodyParts.length} selected
                  </span>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1 pr-1 text-xs">
                  {allBodyPartsWithCounts.slice(0, 16).map(({ part, count }) => {
                    const isSelected = selectedBodyParts.includes(part);
                    return (
                      <button
                        key={part}
                        onClick={() => toggleBodyPart(part)}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition ${
                          isSelected
                            ? 'bg-rose-600 text-white font-bold shadow-2xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <div className={`h-4 w-4 rounded-md border flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-white text-rose-600 border-white' : 'border-slate-300 bg-slate-50'
                          }`}>
                            {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <span className="truncate">{part}</span>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-md shrink-0 ml-1 ${
                          isSelected ? 'bg-rose-700 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: Clinical Criteria & Toggles */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
                <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
                  <span>Clinical Criteria & Toggles</span>
                </span>

                <div className="space-y-2 text-xs">
                  {/* Emergency Red Flags Toggle */}
                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/70 cursor-pointer hover:bg-slate-50 transition">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-red-600" />
                      <div>
                        <span className="font-bold text-slate-900 block leading-snug">Emergency Red Flags Only</span>
                        <span className="text-[10px] text-slate-500">Conditions with acute critical warning signs</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={hasEmergencyFlagsOnly}
                      onChange={(e) => setHasEmergencyFlagsOnly(e.target.checked)}
                      className="h-4 w-4 rounded-md text-rose-600 focus:ring-rose-500 border-slate-300 accent-rose-600"
                    />
                  </label>

                  {/* Diagnostic Tests Toggle */}
                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/70 cursor-pointer hover:bg-slate-50 transition">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-teal-600" />
                      <div>
                        <span className="font-bold text-slate-900 block leading-snug">Lab / Imaging Workup Guide</span>
                        <span className="text-[10px] text-slate-500">Conditions with step-by-step diagnostic tests</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={hasDiagnosticTestsOnly}
                      onChange={(e) => setHasDiagnosticTestsOnly(e.target.checked)}
                      className="h-4 w-4 rounded-md text-rose-600 focus:ring-rose-500 border-slate-300 accent-rose-600"
                    />
                  </label>

                  {/* Saved / Bookmarked Only */}
                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/70 cursor-pointer hover:bg-slate-50 transition">
                    <div className="flex items-center gap-2">
                      <Bookmark className="h-4 w-4 text-amber-600" />
                      <div>
                        <span className="font-bold text-slate-900 block leading-snug">Bookmarked Guides Only</span>
                        <span className="text-[10px] text-slate-500">View your saved disease articles ({savedIds.length})</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={showSavedOnly}
                      onChange={(e) => setShowSavedOnly(e.target.checked)}
                      className="h-4 w-4 rounded-md text-rose-600 focus:ring-rose-500 border-slate-300 accent-rose-600"
                    />
                  </label>

                  {/* Read Time Filter */}
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/70 space-y-1.5">
                    <span className="font-bold text-slate-900 block text-[11px]">Article Read Time:</span>
                    <div className="grid grid-cols-3 gap-1 text-[11px] font-bold">
                      <button
                        onClick={() => setReadTimeFilter('all')}
                        className={`py-1.5 rounded-lg transition ${
                          readTimeFilter === 'all' ? 'bg-rose-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setReadTimeFilter('quick')}
                        className={`py-1.5 rounded-lg transition ${
                          readTimeFilter === 'quick' ? 'bg-rose-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        ≤ 5 min
                      </button>
                      <button
                        onClick={() => setReadTimeFilter('indepth')}
                        className={`py-1.5 rounded-lg transition ${
                          readTimeFilter === 'indepth' ? 'bg-rose-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        6+ min
                      </button>
                    </div>
                  </div>

                </div>
              </div>

            </div>

          </div>
        )}

        {/* Active Filter Chips Bar */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs">
            <div className="flex items-center gap-1.5 text-rose-900 font-extrabold mr-1">
              <Filter className="h-3.5 w-3.5 text-rose-600" />
              <span>{t('Active Filters')} ({formatNumber(activeFiltersCount)}):</span>
            </div>

            {/* Keyword Chip */}
            {searchTerm && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-white border border-rose-200 px-2.5 py-1 text-slate-800 font-bold shadow-2xs">
                <span>{t('Keyword')}: "{searchTerm}"</span>
                <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-700">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {/* Category Chips */}
            {selectedCategories.map((cat) => (
              <span key={cat} className="inline-flex items-center gap-1 rounded-lg bg-white border border-rose-200 px-2.5 py-1 text-rose-900 font-bold shadow-2xs">
                <span>{t(cat)}</span>
                <button onClick={() => toggleCategory(cat)} className="text-rose-400 hover:text-rose-700">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}

            {/* Symptom Chips */}
            {selectedSymptoms.map((sym) => (
              <span key={sym} className="inline-flex items-center gap-1 rounded-lg bg-white border border-amber-300 px-2.5 py-1 text-amber-900 font-bold shadow-2xs">
                <Activity className="h-3 w-3 text-amber-600" />
                <span>{t(sym)}</span>
                <button onClick={() => toggleSymptom(sym)} className="text-amber-500 hover:text-amber-800">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}

            {/* Body Part Chips */}
            {selectedBodyParts.map((part) => (
              <span key={part} className="inline-flex items-center gap-1 rounded-lg bg-white border border-blue-200 px-2.5 py-1 text-blue-900 font-bold shadow-2xs">
                <HeartPulse className="h-3 w-3 text-blue-600" />
                <span>{t(part)}</span>
                <button onClick={() => toggleBodyPart(part)} className="text-blue-400 hover:text-blue-700">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}

            {/* Emergency flags chip */}
            {hasEmergencyFlagsOnly && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-white border border-red-200 px-2.5 py-1 text-red-900 font-bold shadow-2xs">
                <ShieldAlert className="h-3 w-3 text-red-600" />
                <span>{t('Emergency Red Flags')}</span>
                <button onClick={() => setHasEmergencyFlagsOnly(false)} className="text-red-400 hover:text-red-700">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {/* Diagnostic tests chip */}
            {hasDiagnosticTestsOnly && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-white border border-teal-200 px-2.5 py-1 text-teal-900 font-bold shadow-2xs">
                <Stethoscope className="h-3 w-3 text-teal-600" />
                <span>{t('Lab & Diagnostic Workup')}</span>
                <button onClick={() => setHasDiagnosticTestsOnly(false)} className="text-teal-400 hover:text-teal-700">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {/* Saved only chip */}
            {showSavedOnly && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-white border border-amber-200 px-2.5 py-1 text-amber-900 font-bold shadow-2xs">
                <Bookmark className="h-3 w-3 text-amber-600" />
                <span>{t('Saved Only')}</span>
                <button onClick={() => setShowSavedOnly(false)} className="text-amber-400 hover:text-amber-700">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {/* Read time chip */}
            {readTimeFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-300 px-2.5 py-1 text-slate-800 font-bold shadow-2xs">
                <Clock className="h-3 w-3 text-slate-500" />
                <span>{readTimeFilter === 'quick' ? t('Read Time ≤ 5 min') : t('Read Time 6+ min')}</span>
                <button onClick={() => setReadTimeFilter('all')} className="text-slate-400 hover:text-slate-700">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {/* Clear All button */}
            <button
              onClick={resetAllFilters}
              className="ml-auto text-[11px] font-black text-rose-700 hover:text-rose-900 underline underline-offset-2"
            >
              {t('common.clear')} {t('All')}
            </button>
          </div>
        )}

        {/* Results Counter Summary Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 px-1">
          <div>
            {t('common.showing')} <strong className="text-slate-900 font-bold">{formatNumber(filteredAndSortedConditions.length)}</strong> {t('of')}{' '}
            <strong className="text-slate-900 font-bold">{formatNumber(HEALTH_CONDITIONS.length)}</strong> {t('nav.diseases')}
          </div>
        </div>

        {/* Diseases Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedConditions.map((cond) => {
            const isSaved = savedIds.includes(cond.id);

            return (
              <div
                key={cond.id}
                className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-2xs hover:border-rose-300 hover:shadow-md transition-all duration-300"
              >
                <div>
                  {/* Miniature Banner Image */}
                  <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100">
                    {cond.image ? (
                      <img
                        src={cond.image}
                        alt={t(cond.title)}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-rose-50 text-rose-300">
                        <Stethoscope className="h-12 w-12" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/25 to-transparent" />
                    
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="rounded-xl bg-white/95 backdrop-blur-md px-3 py-1 text-[10px] font-extrabold text-rose-900 shadow-2xs uppercase tracking-wider border border-rose-100">
                        {t(cond.category)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onToggleSave(cond.id)}
                          className={`rounded-xl p-2 backdrop-blur-md transition ${
                            isSaved
                              ? 'bg-rose-600 text-white shadow-2xs'
                              : 'bg-white/80 text-slate-700 hover:bg-white'
                          }`}
                          title={isSaved ? t('Remove from saved') : t('Save article')}
                        >
                          <Bookmark className="h-4 w-4 fill-current" />
                        </button>
                      </div>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[10px] font-medium text-slate-200">
                        <Clock className="h-3 w-3 text-rose-300" /> {t(cond.readTime)}
                      </span>
                      {cond.emergencyWarningSigns && cond.emergencyWarningSigns.length > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-xs">
                          <ShieldAlert className="h-3 w-3 text-amber-400" /> {t('Red Flags')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 
                          onClick={() => setSelectedCondition(cond)}
                          className="text-lg font-extrabold text-slate-900 group-hover:text-rose-700 transition tracking-tight leading-snug cursor-pointer"
                        >
                          {t(cond.title)}
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed mt-1 line-clamp-2">
                          {t(cond.summary)}
                        </p>
                      </div>
                    </div>

                    {/* Characteristic Symptoms preview */}
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        {t('Symptoms')}:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {cond.symptoms.slice(0, 4).map((sym, idx) => {
                          const isHighlighted = selectedSymptoms.some(sel => 
                            sym.toLowerCase().includes(sel.toLowerCase()) || sel.toLowerCase().includes(sym.toLowerCase())
                          );
                          return (
                            <span
                              key={idx}
                              className={`rounded-lg px-2 py-0.5 text-[10px] font-medium transition ${
                                isHighlighted
                                  ? 'bg-amber-100 text-amber-950 font-bold border border-amber-300'
                                  : 'bg-rose-50/80 border border-rose-100/60 text-rose-900'
                              }`}
                            >
                              {t(sym)}
                            </span>
                          );
                        })}
                        {cond.symptoms.length > 4 && (
                          <span className="text-[10px] text-slate-400 self-center font-medium">
                            +{cond.symptoms.length - 4} {t('common.more')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-end text-xs border-t border-slate-100 mt-2">
                  <button
                    onClick={() => {
                      setSelectedCondition(cond);
                      setModalViewMode('all');
                    }}
                    className="flex items-center gap-1 font-extrabold text-slate-800 hover:text-rose-800 transition pt-3 cursor-pointer"
                  >
                    <span>{t('View More')}</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State when no conditions match */}
        {filteredAndSortedConditions.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Filter className="h-6 w-6" />
            </div>
            <p className="text-base font-extrabold text-slate-800">{t('No medical conditions match your filter combination')}</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {t('Try removing some selected symptoms, expanding categories, or toggling symptom logic to "Match Any".')}
            </p>
            <button
              onClick={resetAllFilters}
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-rose-700 transition shadow-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{t('Reset All Filters')}</span>
            </button>
          </div>
        )}

        {/* Detailed Disease Article & Infographic Modal */}
        {selectedCondition && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
            <div className="w-full max-w-5xl lg:max-w-6xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 text-slate-800 space-y-6 my-6">
              
              {/* Header Image Banner in Modal */}
              <div className="relative h-48 sm:h-64 w-full rounded-2xl overflow-hidden bg-slate-100">
                {selectedCondition.image ? (
                  <img
                    src={selectedCondition.image}
                    alt={t(selectedCondition.title)}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-rose-100 text-rose-400">
                    <Stethoscope className="h-16 w-16" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent" />
                
                <button
                  onClick={() => setSelectedCondition(null)}
                  className="absolute top-4 right-4 rounded-full bg-white/90 p-2 text-slate-700 hover:bg-white hover:text-slate-900 transition shadow-md cursor-pointer z-10"
                >
                  <X className="h-6 w-6" />
                </button>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="rounded-lg bg-rose-600 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                      {t(selectedCondition.category)}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-medium text-slate-200">
                      <Clock className="h-3.5 w-3.5 text-rose-300" /> {t(selectedCondition.readTime)}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-3xl font-black tracking-tight drop-shadow-xs">
                    {t(selectedCondition.title)}
                  </h2>
                </div>
              </div>

              {/* View Mode Switcher Header */}
              <div className="flex items-center justify-between flex-wrap gap-3 bg-slate-100/90 p-2 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => setModalViewMode('all')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                      modalViewMode === 'all'
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t('🌟 Combined Overview')}
                  </button>
                  <button
                    onClick={() => setModalViewMode('infograph')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                      modalViewMode === 'infograph'
                        ? 'bg-rose-700 text-white shadow-xs'
                        : 'text-rose-700 hover:bg-rose-50 bg-white/60'
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{t('Visual Pathophysiology')}</span>
                  </button>
                  <button
                    onClick={() => setModalViewMode('guide')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                      modalViewMode === 'guide'
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t('📋 Medical Text Guide')}
                  </button>
                </div>

                <div className="text-[11px] font-bold text-slate-500 hidden sm:block">
                  {t('Verified Clinical & Pathological Record')}
                </div>
              </div>

              {/* Infographic Section (Visible in 'all' and 'infograph' modes) */}
              {(modalViewMode === 'all' || modalViewMode === 'infograph') && (
                <div className="space-y-4">
                  <DiseaseInfographic condition={selectedCondition} />
                </div>
              )}

              {/* Text Monograph Sections (Visible in 'all' and 'guide' modes) */}
              {(modalViewMode === 'all' || modalViewMode === 'guide') && (
                <div className="space-y-6 pt-2">
                  {/* Medical Overview & Meta Banner */}
                  <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200/70 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="font-black text-slate-900 text-base sm:text-lg flex items-center gap-2">
                        <Stethoscope className="h-5 w-5 text-rose-600" />
                        <span>Disease Overview</span>
                      </h4>
                      {selectedCondition.specialist && (
                        <span className="rounded-full bg-rose-100 text-rose-800 font-bold px-3 py-1 text-xs flex items-center gap-1.5">
                          <Stethoscope className="h-3.5 w-3.5" /> Specialist: {selectedCondition.specialist}
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {selectedCondition.summary}
                    </p>
                  </div>

                  {/* Quick Facts Interactive Grid */}
                  {selectedCondition.quickFacts && selectedCondition.quickFacts.length > 0 && (
                    <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs">
                      <h4 className="font-extrabold text-slate-900 mb-3 text-xs uppercase tracking-wider flex items-center gap-2 text-rose-700">
                        <Sparkles className="h-4 w-4 text-rose-600" /> Clinical Quick Facts
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
                        {selectedCondition.quickFacts.map((fact, idx) => (
                          <div key={idx} className="flex flex-col bg-slate-50/80 p-3 rounded-xl border border-slate-200/60">
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{fact.label}</span>
                            <span className="font-black text-slate-900 mt-1 leading-snug">{fact.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* What Body Parts Does It Affect? */}
                  {selectedCondition.affectedBodyParts && selectedCondition.affectedBodyParts.length > 0 && (
                    <div>
                      <h4 className="font-bold text-slate-900 mb-2 text-xs uppercase tracking-wider text-slate-500">
                        What Body Parts Does It Affect?
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCondition.affectedBodyParts.map((part, idx) => (
                          <span key={idx} className="rounded-xl bg-rose-50 text-rose-900 border border-rose-100 px-3.5 py-1.5 text-xs font-bold shadow-2xs">
                            {part}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Staged Symptoms (Early, Common, Less Common, Emergency) */}
                  <div className="space-y-3">
                    <h4 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-rose-600" /> Symptoms & Clinical Presentation
                    </h4>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {/* Early Symptoms */}
                      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 space-y-2">
                        <span className="font-extrabold text-amber-900 text-xs uppercase tracking-wider block">
                          🌅 Early Symptoms
                        </span>
                        <ul className="space-y-1.5 text-xs text-slate-700">
                          {(selectedCondition.earlySymptoms || selectedCondition.symptoms.slice(0, 3)).map((s, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-amber-500 font-bold">•</span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Common Symptoms */}
                      <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/60 space-y-2">
                        <span className="font-extrabold text-rose-900 text-xs uppercase tracking-wider block">
                          ⚡ Common Symptoms
                        </span>
                        <ul className="space-y-1.5 text-xs text-slate-700">
                          {(selectedCondition.commonSymptoms || selectedCondition.symptoms).map((s, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-rose-500 font-bold">•</span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Less Common Symptoms */}
                      <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 space-y-2">
                        <span className="font-extrabold text-slate-800 text-xs uppercase tracking-wider block">
                          🔍 Less Common Symptoms
                        </span>
                        <ul className="space-y-1.5 text-xs text-slate-700">
                          {(selectedCondition.lessCommonSymptoms || ['Atypical presentations', 'Referred sensation', 'Subtle systemic malaise']).map((s, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-slate-400 font-bold">•</span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Emergency Warning Signs */}
                    {selectedCondition.emergencyWarningSigns && selectedCondition.emergencyWarningSigns.length > 0 && (
                      <div className="p-4 rounded-2xl bg-red-600 text-white space-y-2 shadow-md">
                        <h5 className="font-black flex items-center gap-2 text-xs uppercase tracking-wider text-red-100">
                          <ShieldAlert className="h-4 w-4 text-white" /> Emergency Warning Signs (Seek Urgent Care Immediately)
                        </h5>
                        <ul className="space-y-1.5 text-xs text-red-50 list-disc list-inside font-medium">
                          {selectedCondition.emergencyWarningSigns.map((sign, idx) => (
                            <li key={idx} className="leading-relaxed">{sign}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Causes, Transmission & Risk Factors */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-600">
                        Etiology & Causes
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 leading-relaxed">
                        {selectedCondition.causes.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-600">
                        Transmission & Risk Factors
                      </h4>
                      {selectedCondition.howDoesItSpread && (
                        <p className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200/60 font-medium">
                          <strong className="text-slate-900">Spread:</strong> {selectedCondition.howDoesItSpread}
                        </p>
                      )}
                      <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 leading-relaxed">
                        {(selectedCondition.riskFactors || []).map((rf, i) => (
                          <li key={i}>{rf}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Diagnosis (Medical History, Physical Exam, Tests) */}
                  <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200 space-y-3">
                    <h4 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-rose-600" /> Diagnosis & Clinical Evaluation
                    </h4>
                    
                    <div className="grid gap-3 sm:grid-cols-2 text-xs">
                      {selectedCondition.diagnosisMedicalHistory && (
                        <div className="bg-white p-3 rounded-xl border border-slate-200">
                          <span className="font-bold text-slate-900 block mb-1 text-rose-900">Medical History:</span>
                          <span className="text-slate-600 leading-relaxed">{selectedCondition.diagnosisMedicalHistory}</span>
                        </div>
                      )}
                      {selectedCondition.diagnosisPhysicalExam && (
                        <div className="bg-white p-3 rounded-xl border border-slate-200">
                          <span className="font-bold text-slate-900 block mb-1 text-rose-900">Physical Examination:</span>
                          <span className="text-slate-600 leading-relaxed">{selectedCondition.diagnosisPhysicalExam}</span>
                        </div>
                      )}
                    </div>

                    {selectedCondition.diagnosisAndTests && selectedCondition.diagnosisAndTests.length > 0 && (
                      <div className="pt-2">
                        <span className="font-bold text-slate-900 block mb-1.5 text-xs">Diagnostic Tests & Modalities:</span>
                        <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                          {selectedCondition.diagnosisAndTests.map((dt, i) => (
                            <li key={i}>{dt}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Treatment (Home Care, Symptom Relief Medicines, Clinical Treatments) */}
                  <div className="space-y-3">
                    <h4 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Comprehensive Treatment & Clinical Care
                    </h4>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {/* Home Care */}
                      <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 space-y-2">
                        <span className="font-extrabold text-emerald-900 text-xs uppercase tracking-wider block">
                          🏡 Home Care & Self-Management
                        </span>
                        <ul className="space-y-1.5 text-xs text-slate-700">
                          {(selectedCondition.homeCare || ['Adequate rest and hydration', 'Pacing daily activities', 'Symptom logging']).map((hc, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-emerald-500 font-bold">•</span>
                              <span>{hc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Symptom Relief Medicines */}
                      <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/60 space-y-2">
                        <span className="font-extrabold text-blue-900 text-xs uppercase tracking-wider block">
                          💊 Medicines (Symptom Relief)
                        </span>
                        <ul className="space-y-1.5 text-xs text-slate-700">
                          {(selectedCondition.symptomReliefMedicines || selectedCondition.treatments.slice(0, 3)).map((med, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-blue-500 font-bold">•</span>
                              <span>{med}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Guideline Treatments */}
                      <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/60 space-y-2">
                        <span className="font-extrabold text-purple-900 text-xs uppercase tracking-wider block">
                          🏥 Clinical Treatments
                        </span>
                        <ul className="space-y-1.5 text-xs text-slate-700">
                          {selectedCondition.treatments.map((t, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-purple-500 font-bold">•</span>
                              <span>{t}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Prevention & Complications */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-600">
                        🛡️ Prevention & Risk Reduction
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 leading-relaxed">
                        {selectedCondition.prevention.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <h4 className="font-bold text-rose-900 text-xs uppercase tracking-wider">
                        ⚠️ Potential Complications
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 leading-relaxed">
                        {(selectedCondition.complications || ['Secondary organ strain', 'Chronic functional limitation']).map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Recovery & Living */}
                  {(selectedCondition.recovery || selectedCondition.recoveryAndLiving) && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-600">
                        🌱 Recovery, Prognosis & Living with Condition
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        {selectedCondition.recovery || selectedCondition.recoveryAndLiving}
                      </p>
                    </div>
                  )}

                  {/* When to See Doctor & When to Seek Emergency Care */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/70 text-slate-800 space-y-1.5">
                      <h4 className="font-bold text-rose-900 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                        <Stethoscope className="h-4 w-4 text-rose-700" /> When to See a Doctor
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        {selectedCondition.whenToSeeDoctor}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-950 space-y-1.5">
                      <h4 className="font-bold text-red-800 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                        <ShieldAlert className="h-4 w-4 text-red-700" /> When to Seek Emergency Care
                      </h4>
                      <p className="text-xs sm:text-sm text-red-900 leading-relaxed">
                        {selectedCondition.whenToSeekEmergencyCare || 'Call 911 or visit the nearest emergency room immediately for severe unremitting symptoms, acute chest pain, sudden weakness, or loss of consciousness.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer with Medical Disclaimer & Close */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
                <p className="text-[11px] text-slate-400 italic max-w-xl">
                  {selectedCondition.disclaimer || 'Medical Disclaimer: Educational guide only. Always consult a licensed healthcare professional for medical diagnosis and treatment.'}
                </p>
                <button
                  onClick={() => setSelectedCondition(null)}
                  className="rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  Close Guide
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
