import React, { useState, useMemo } from 'react';
import { 
  FlaskConical, 
  Search, 
  Clock, 
  TestTube, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Info,
  X,
  ChevronRight,
  ChevronLeft,
  Activity,
  ShieldAlert,
  FileText,
  HelpCircle,
  HeartPulse,
  Droplets,
  Stethoscope,
  Microscope,
  BookOpen,
  Filter,
  Layers
} from 'lucide-react';
import { MEDICAL_TESTS } from '../data/healthData';
import { MedicalTest } from '../types';
import { useLocalization } from '../context/LocalizationContext';

const ITEMS_PER_PAGE = 24;

export const MedicalTestsView: React.FC = () => {
  const { t, formatNumber } = useLocalization();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTestId, setSelectedTestId] = useState<string>('test-crp');
  const [userValue, setUserValue] = useState<string>('');
  const [interpreterResult, setInterpreterResult] = useState<string | null>(null);
  const [activeModalTest, setActiveModalTest] = useState<MedicalTest | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'uses' | 'prep' | 'results' | 'faqs'>('overview');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const categories = [
    'All',
    'Hematology & Coagulation',
    'Kidney, Electrolytes & Urinalysis',
    'Gastroenterology & Hepatology',
    'Diabetes, Metabolism & Cardiovascular',
    'Endocrinology & Hormones',
    'Infectious Disease & Microbiology',
    'Immunology, Autoimmune & Allergy',
    'Oncology, Genetics & Molecular',
    'Reproductive & Obstetric Health',
    'Toxicology, Fluids & Specialized'
  ];

  const filteredTests = useMemo(() => {
    return MEDICAL_TESTS.filter((t) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch = 
        t.name.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.purpose.toLowerCase().includes(q) ||
        t.sampleType.toLowerCase().includes(q);
      
      const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory || t.category.includes(selectedCategory);
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  // Reset to page 1 whenever filters change
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Pagination calculation
  const totalPages = Math.ceil(filteredTests.length / ITEMS_PER_PAGE) || 1;
  const paginatedTests = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTests.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTests, currentPage]);

  const interpretValue = () => {
    const val = parseFloat(userValue);
    if (isNaN(val)) {
      setInterpreterResult('Please enter a valid numeric value.');
      return;
    }

    if (selectedTestId === 'test-crp') {
      if (val < 0.3) {
        setInterpreterResult(`Standard CRP of ${val} mg/dL (<3 mg/L) is in the Normal healthy range with no significant acute systemic inflammation detected.`);
      } else if (val >= 0.3 && val <= 1.0) {
        setInterpreterResult(`Standard CRP of ${val} mg/dL (3 - 10 mg/L) indicates Mild Elevation. Common causes include low-grade inflammation, obesity, smoking, pregnancy, minor injury, or early viral infection.`);
      } else if (val > 1.0 && val <= 10.0) {
        setInterpreterResult(`Standard CRP of ${val} mg/dL (10 - 100 mg/L) indicates Moderate Elevation. Often associated with autoimmune flare-ups (Rheumatoid Arthritis/Lupus), pneumonia, pancreatitis, or active infection.`);
      } else {
        setInterpreterResult(`Standard CRP of ${val} mg/dL (>100 mg/L) indicates Marked Elevation. Strongly suggests severe bacterial infection, sepsis, major trauma, or severe vasculitis. Prompt medical attention required.`);
      }
    } else if (selectedTestId === 'test-crp-hs') {
      if (val < 1.0) {
        setInterpreterResult(`hs-CRP of ${val} mg/L is in the Low Cardiovascular Risk category (<1.0 mg/L).`);
      } else if (val >= 1.0 && val <= 3.0) {
        setInterpreterResult(`hs-CRP of ${val} mg/L indicates Average (Moderate) Cardiovascular Risk (1.0 - 3.0 mg/L).`);
      } else {
        setInterpreterResult(`hs-CRP of ${val} mg/L indicates High Cardiovascular Risk (>3.0 mg/L). Evaluate alongside lipid profile, blood pressure, and metabolic markers.`);
      }
    } else if (selectedTestId === 'test-ecg') {
      if (val >= 60 && val <= 100) {
        setInterpreterResult(`Resting Heart Rate of ${val} bpm is within the normal resting adult reference range (60 - 100 bpm).`);
      } else if (val < 60) {
        setInterpreterResult(`Resting Heart Rate of ${val} bpm indicates Sinus Bradycardia (<60 bpm). Can be normal in trained endurance athletes, but should be checked for sinus node dysfunction, hypothyroidism, or heart block in non-athletes.`);
      } else {
        setInterpreterResult(`Resting Heart Rate of ${val} bpm indicates Sinus Tachycardia (>100 bpm). May reflect stress, caffeine, fever, anemia, hyperthyroidism, or an arrhythmia.`);
      }
    } else if (selectedTestId === 'test-urinalysis-ph') {
      if (val >= 4.5 && val <= 8.0) {
        setInterpreterResult(`Urine pH of ${val} is within the normal physiological reference range (4.5 - 8.0).`);
      } else if (val < 4.5) {
        setInterpreterResult(`Urine pH of ${val} is acidic (<4.5). Associated with high protein diet, metabolic acidosis, dehydration, or uric acid kidney stones.`);
      } else {
        setInterpreterResult(`Urine pH of ${val} is alkaline (>8.0). Associated with vegetarian diet, recent vomiting, or urinary tract infection with urease-producing bacteria (Proteus).`);
      }
    } else if (selectedTestId === 'test-hba1c') {
      if (val < 5.7) {
        setInterpreterResult(`HbA1c of ${val}% is within the normal healthy non-diabetic range (<5.7%).`);
      } else if (val >= 5.7 && val <= 6.4) {
        setInterpreterResult(`HbA1c of ${val}% indicates Prediabetes range (5.7% - 6.4%). Lifestyle modifications recommended.`);
      } else {
        setInterpreterResult(`HbA1c of ${val}% falls in the Diabetes diagnostic threshold (≥6.5%). Consult your doctor for clinical management.`);
      }
    } else if (selectedTestId === 'test-fasting-glucose') {
      if (val >= 70 && val <= 99) {
        setInterpreterResult(`Fasting glucose of ${val} mg/dL is within normal physiological range (70 - 99 mg/dL).`);
      } else if (val > 99 && val <= 125) {
        setInterpreterResult(`Fasting glucose of ${val} mg/dL suggests impaired fasting glucose (Prediabetes).`);
      } else {
        setInterpreterResult(`Fasting glucose of ${val} mg/dL is elevated (≥126 mg/dL fasting threshold). Discuss with your physician.`);
      }
    } else if (selectedTestId === 'test-creatinine') {
      if (val >= 0.6 && val <= 1.3) {
        setInterpreterResult(`Serum Creatinine of ${val} mg/dL is within the expected normal adult reference interval (0.6 - 1.3 mg/dL).`);
      } else if (val < 0.6) {
        setInterpreterResult(`Serum Creatinine of ${val} mg/dL is low, often reflecting reduced muscle mass or severe hepatic disease.`);
      } else {
        setInterpreterResult(`Serum Creatinine of ${val} mg/dL is elevated (>1.3 mg/dL), indicating impaired glomerular filtration or acute kidney injury. Correlate with eGFR.`);
      }
    } else if (selectedTestId === 'test-tsh') {
      if (val >= 0.45 && val <= 4.5) {
        setInterpreterResult(`TSH of ${val} mIU/L is in the Euthyroid baseline range (0.45 - 4.50 mIU/L).`);
      } else if (val < 0.45) {
        setInterpreterResult(`TSH of ${val} mIU/L is suppressed (<0.45 mIU/L), suggesting Hyperthyroidism or excess thyroid hormone therapy. Check Free T4/T3.`);
      } else {
        setInterpreterResult(`TSH of ${val} mIU/L is elevated (>4.50 mIU/L), suggesting Hypothyroidism (primary thyroid failure). Check Free T4 and anti-TPO.`);
      }
    } else if (selectedTestId === 'test-cholesterol') {
      if (val < 200) {
        setInterpreterResult(`Total Cholesterol of ${val} mg/dL is Desirable (<200 mg/dL).`);
      } else if (val >= 200 && val <= 239) {
        setInterpreterResult(`Total Cholesterol of ${val} mg/dL is Borderline High (200 - 239 mg/dL). Review LDL, HDL, and dietary saturated fat intake.`);
      } else {
        setInterpreterResult(`Total Cholesterol of ${val} mg/dL is High (≥240 mg/dL), increasing atherosclerotic cardiovascular disease risk.`);
      }
    } else if (selectedTestId === 'test-platelets') {
      if (val >= 150 && val <= 450) {
        setInterpreterResult(`Platelet count of ${val} x10^9/L is Normal (150 - 450 x10^9/L).`);
      } else if (val < 150) {
        setInterpreterResult(`Platelet count of ${val} x10^9/L indicates Thrombocytopenia (<150 x10^9/L). Assess for viral suppression, immune destruction (ITP), or bone marrow disorders.`);
      } else {
        setInterpreterResult(`Platelet count of ${val} x10^9/L indicates Thrombocytosis (>450 x10^9/L). Common causes include reactive inflammation, iron deficiency, or essential thrombocythemia.`);
      }
    } else {
      setInterpreterResult(`Value of ${userValue} recorded. Compare directly with laboratory reference bounds indicated on your clinical report.`);
    }
  };

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 lg:px-8 space-y-8">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2 text-cyan-700 font-semibold text-xs uppercase tracking-wider mb-1">
              <FlaskConical className="h-4 w-4" /> {t('Diagnostic Laboratory Catalog & Clinical Database')}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('Medical Laboratory Tests')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {t('Comprehensive reference library of 1,000 diagnostic medical laboratory tests across 10 specialized medical disciplines.')}
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder={t('Search 1,000 tests (e.g. CBC, Troponin, PSA, HIV)...')}
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-800 shadow-2xs focus:border-cyan-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-cyan-700 uppercase tracking-wider block">Total Catalog</span>
            <div className="text-xl font-black text-slate-900 mt-0.5">1,000 Tests</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Standardized laboratory profiles</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider block">Disciplines</span>
            <div className="text-xl font-black text-slate-900 mt-0.5">10 Categories</div>
            <p className="text-[11px] text-slate-500 mt-0.5">From Hematology to Genetics</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Reference Ranges</span>
            <div className="text-xl font-black text-slate-900 mt-0.5">Clinical Intervals</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Physiological baseline bounds</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">Diagnostic Protocols</span>
            <div className="text-xl font-black text-slate-900 mt-0.5">Fast Turnarounds</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Specimen prep & procedure guides</p>
          </div>
        </div>

        {/* Category Pills */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <Filter className="h-3.5 w-3.5 text-cyan-600" />
            <span>Filter by Clinical Category:</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-cyan-700 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                {t(cat)}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Result Interpreter Box */}
        <div className="rounded-3xl border border-cyan-200 bg-gradient-to-br from-cyan-50/90 via-sky-50/50 to-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-cyan-950 font-bold text-sm mb-2">
            <Sparkles className="h-5 w-5 text-cyan-600" />
            <span>{t('Interactive Clinical Lab Reference Interpreter')}</span>
          </div>
          <p className="text-xs text-slate-600 mb-4 max-w-2xl">
            {t('Select a laboratory biomarker and enter your numeric result to evaluate reference bounds and physiological categories.')}
          </p>

          <div className="grid gap-3 sm:grid-cols-3 items-center">
            <select
              value={selectedTestId}
              onChange={(e) => {
                setSelectedTestId(e.target.value);
                setInterpreterResult(null);
              }}
              className="rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 shadow-2xs focus:border-cyan-500 focus:outline-hidden"
            >
              <option value="test-crp">{t('C-Reactive Protein (CRP) - mg/dL')}</option>
              <option value="test-crp-hs">{t('High-Sensitivity hs-CRP (Cardiovascular Risk) - mg/L')}</option>
              <option value="test-ecg">{t('Electrocardiogram Resting Heart Rate (bpm)')}</option>
              <option value="test-urinalysis-ph">{t('Urinalysis Urine pH (4.5 - 8.0)')}</option>
              <option value="test-hba1c">{t('HbA1c (%) - Diabetes Screening')}</option>
              <option value="test-fasting-glucose">{t('Fasting Glucose (mg/dL)')}</option>
              <option value="test-creatinine">{t('Serum Creatinine (mg/dL) - Kidney Function')}</option>
              <option value="test-tsh">{t('TSH (mIU/L) - Thyroid Function')}</option>
              <option value="test-cholesterol">{t('Total Cholesterol (mg/dL) - Lipid Panel')}</option>
              <option value="test-platelets">{t('Platelet Count (x10^9/L) - Complete Blood Count')}</option>
            </select>

            <input
              type="number"
              step="0.01"
              value={userValue}
              onChange={(e) => setUserValue(e.target.value)}
              placeholder={t('e.g., 0.45, 5.8, or 95')}
              className="rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 shadow-2xs focus:border-cyan-500 focus:outline-hidden"
            />

            <button
              onClick={interpretValue}
              className="rounded-xl bg-cyan-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-cyan-800 transition"
            >
              {t('Interpret Value')}
            </button>
          </div>

          {interpreterResult && (
            <div className="mt-4 p-4 rounded-2xl bg-white border border-cyan-200 text-xs font-medium text-slate-800 shadow-2xs leading-relaxed">
              <span className="font-bold text-cyan-900 block mb-0.5">{t('Clinical Interpretation')}:</span>
              {t(interpreterResult)}
            </div>
          )}
        </div>

        {/* Results Counter & Pagination Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 px-1 border-b border-slate-200 pb-3">
          <div>
            {t('common.showing')}{' '}
            <strong className="text-slate-900 font-bold">
              {formatNumber(Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredTests.length))}-
              {formatNumber(Math.min(currentPage * ITEMS_PER_PAGE, filteredTests.length))}
            </strong>{' '}
            {t('of')} <strong className="text-slate-900 font-bold">{formatNumber(filteredTests.length)}</strong> {t('medical laboratory tests')}
          </div>

          {/* Quick Page Info & Controls */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                title="Previous Page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="font-semibold text-slate-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                title="Next Page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Test Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {paginatedTests.map((test) => {
            return (
              <div
                key={test.id}
                className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs hover:shadow-md hover:border-cyan-400 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3 gap-2">
                    <div>
                      <span className="inline-block rounded-lg bg-cyan-50 border border-cyan-100 px-2.5 py-0.5 text-[10px] font-bold text-cyan-800 uppercase tracking-wider mb-1">
                        {test.category}
                      </span>
                      <h3 
                        onClick={() => {
                          setActiveModalTest(test);
                          setActiveTab('overview');
                        }}
                        className="text-base font-bold text-slate-900 group-hover:text-cyan-700 transition cursor-pointer"
                      >
                        {test.name}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {test.purpose}
                  </p>

                  {/* Normal Reference Range Banner */}
                  <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 font-medium">
                    <span className="font-bold text-emerald-900 block text-[10px] uppercase tracking-wider mb-0.5">
                      Normal Reference Range:
                    </span>
                    <p className="text-emerald-900 text-[11px] leading-relaxed font-bold line-clamp-2">
                      {test.normalRange}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="font-bold text-slate-700 block text-[9px] uppercase tracking-wider mb-0.5">
                        Sample Specimen:
                      </span>
                      <p className="text-slate-600 truncate" title={test.sampleType}>{test.sampleType}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="font-bold text-slate-700 block text-[9px] uppercase tracking-wider mb-0.5">
                        Turnaround:
                      </span>
                      <p className="text-slate-600 truncate">{test.timeToResults}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end text-xs font-bold text-cyan-700 group-hover:text-cyan-800">
                  <button
                    onClick={() => {
                      setActiveModalTest(test);
                      setActiveTab('overview');
                    }}
                    className="inline-flex items-center gap-1 font-bold hover:text-cyan-900 transition"
                  >
                    <span>Full Diagnostic Guide</span>
                    <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
            <button
              disabled={currentPage === 1}
              onClick={() => {
                setCurrentPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 400, behavior: 'smooth' });
              }}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>

            {/* Page number buttons */}
            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 7) {
                pageNum = i + 1;
              } else if (currentPage <= 4) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 3) {
                pageNum = totalPages - 6 + i;
              } else {
                pageNum = currentPage - 3 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => {
                    setCurrentPage(pageNum);
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  className={`h-9 w-9 rounded-xl text-xs font-bold transition ${
                    currentPage === pageNum
                      ? 'bg-cyan-700 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              disabled={currentPage === totalPages}
              onClick={() => {
                setCurrentPage((p) => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 400, behavior: 'smooth' });
              }}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        )}

        {/* Detailed Modal / Slide-over for Medical Test */}
        {activeModalTest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto">
              
              {/* Modal Header */}
              <div className="p-6 bg-gradient-to-r from-cyan-900 via-sky-900 to-slate-900 text-white flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 text-[10px] font-bold uppercase tracking-wider">
                    {activeModalTest.category}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black mt-2 leading-tight">
                    {activeModalTest.name}
                  </h2>
                  <p className="text-xs text-cyan-100/90 mt-1 max-w-2xl">
                    {activeModalTest.description}
                  </p>
                </div>
                <button
                  onClick={() => setActiveModalTest(null)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Quick Spec Bar */}
              <div className="bg-slate-100 border-b border-slate-200 px-6 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Sample Type</span>
                  <span className="font-semibold text-slate-800 truncate block">{activeModalTest.sampleType}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Results Time</span>
                  <span className="font-semibold text-slate-800">{activeModalTest.timeToResults}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Preparation</span>
                  <span className="font-semibold text-slate-800 truncate block">{activeModalTest.preparation}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Primary Focus</span>
                  <span className="font-semibold text-cyan-800 truncate block">{activeModalTest.category}</span>
                </div>
              </div>

              {/* Modal Tabs */}
              <div className="flex border-b border-slate-200 bg-white overflow-x-auto">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-5 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition cursor-pointer ${
                    activeTab === 'overview'
                      ? 'border-cyan-600 text-cyan-700 bg-cyan-50/50'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Overview & Mechanism
                </button>
                <button
                  onClick={() => setActiveTab('uses')}
                  className={`px-5 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition cursor-pointer ${
                    activeTab === 'uses'
                      ? 'border-cyan-600 text-cyan-700 bg-cyan-50/50'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Clinical Indications & Uses
                </button>
                <button
                  onClick={() => setActiveTab('prep')}
                  className={`px-5 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition cursor-pointer ${
                    activeTab === 'prep'
                      ? 'border-cyan-600 text-cyan-700 bg-cyan-50/50'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Preparation & Safety
                </button>
                <button
                  onClick={() => setActiveTab('results')}
                  className={`px-5 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition cursor-pointer ${
                    activeTab === 'results'
                      ? 'border-cyan-600 text-cyan-700 bg-cyan-50/50'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Results & Reference Ranges
                </button>
                {activeModalTest.faqs && activeModalTest.faqs.length > 0 && (
                  <button
                    onClick={() => setActiveTab('faqs')}
                    className={`px-5 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition cursor-pointer ${
                      activeTab === 'faqs'
                        ? 'border-cyan-600 text-cyan-700 bg-cyan-50/50'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Clinical FAQs ({activeModalTest.faqs.length})
                  </button>
                )}
              </div>

              {/* Modal Body Content */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-xs leading-relaxed">
                
                {/* TAB 1: OVERVIEW */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Summary Purpose */}
                    <div className="p-4 rounded-2xl bg-cyan-50/80 border border-cyan-100">
                      <h4 className="font-bold text-cyan-900 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Info className="h-4 w-4 text-cyan-600" /> Primary Clinical Purpose
                      </h4>
                      <p className="text-slate-700">{activeModalTest.purpose}</p>
                    </div>

                    {/* Overview Text */}
                    {activeModalTest.overview && (
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm mb-2">Comprehensive Overview</h4>
                        <p className="text-slate-600 leading-relaxed">{activeModalTest.overview}</p>
                      </div>
                    )}

                    {/* What is it */}
                    {activeModalTest.whatIsIt && (
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm mb-2">What is this Test?</h4>
                        <p className="text-slate-600 leading-relaxed">{activeModalTest.whatIsIt}</p>
                      </div>
                    )}

                    {/* Why Important */}
                    {activeModalTest.whyImportant && (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                        <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1">
                          Why is this Biomarker/Test Important?
                        </h4>
                        <p className="text-slate-700">{activeModalTest.whyImportant}</p>
                      </div>
                    )}

                    {/* How It Works */}
                    {activeModalTest.howItWorks && (
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm mb-2">Biological Mechanism & Procedure Pathway</h4>
                        <div className="p-4 rounded-2xl bg-white border border-slate-200 whitespace-pre-line text-slate-700">
                          {activeModalTest.howItWorks}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: USES & CONDITIONS */}
                {activeTab === 'uses' && (
                  <div className="space-y-6">
                    {/* Why Performed */}
                    {activeModalTest.whyPerformed && (
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                          <Stethoscope className="h-4 w-4 text-cyan-600" /> Why Healthcare Providers Perform This Test
                        </h4>
                        <div className="grid sm:grid-cols-2 gap-2.5">
                          {activeModalTest.whyPerformed.map((reason, idx) => (
                            <div key={idx} className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                              <CheckCircle2 className="h-4 w-4 text-cyan-600 shrink-0 mt-0.5" />
                              <span className="text-slate-700">{reason}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Conditions Detected */}
                    {activeModalTest.conditionsDetected && (
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                          <Activity className="h-4 w-4 text-rose-600" /> Medical Conditions & Diseases Identified
                        </h4>
                        <div className="space-y-2">
                          {activeModalTest.conditionsDetected.map((cond, idx) => (
                            <div key={idx} className="p-3 rounded-2xl bg-rose-50/50 border border-rose-100 text-slate-800 flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0"></span>
                              <span>{cond}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Who Should Get It */}
                    {activeModalTest.whoShouldGetIt && (
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm mb-3">Who Should Undergo Testing?</h4>
                        <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
                          {activeModalTest.whoShouldGetIt.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* When Not Interpreted Alone */}
                    {activeModalTest.whenNotInterpretedAlone && (
                      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                        <h4 className="font-bold text-amber-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <AlertCircle className="h-4 w-4 text-amber-600" /> Clinical Context & Limitations
                        </h4>
                        <ul className="list-disc pl-5 space-y-1 text-amber-900 text-[11px]">
                          {activeModalTest.whenNotInterpretedAlone.map((warn, idx) => (
                            <li key={idx}>{warn}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: PREPARATION */}
                {activeTab === 'prep' && (
                  <div className="space-y-6">
                    {/* Checklist */}
                    {activeModalTest.testPreparationChecklist ? (
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm mb-3">Patient Preparation Checklist</h4>
                        <div className="space-y-2.5">
                          {activeModalTest.testPreparationChecklist.map((item, idx) => (
                            <div key={idx} className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100 flex items-start gap-3">
                              <span className="flex items-center justify-center h-5 w-5 rounded-full bg-cyan-700 text-white font-bold text-[10px] shrink-0">
                                {idx + 1}
                              </span>
                              <p className="text-slate-800 font-medium">{item}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                        <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1">Standard Preparation</h4>
                        <p className="text-slate-700">{activeModalTest.preparation}</p>
                      </div>
                    )}

                    {/* Risks and Complications */}
                    {activeModalTest.risksAndComplications && (
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm mb-2">Procedure Safety & Risks</h4>
                        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-emerald-950">
                          <ul className="list-disc pl-5 space-y-1">
                            {activeModalTest.risksAndComplications.map((risk, idx) => (
                              <li key={idx}>{risk}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Post test recovery */}
                    {activeModalTest.postTestRecovery && (
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm mb-2">Post-Test Recovery & Next Steps</h4>
                        <p className="text-slate-700">{activeModalTest.postTestRecovery}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 4: RESULTS & REFERENCE RANGES */}
                {activeTab === 'results' && (
                  <div className="space-y-6">
                    {/* Normal Values Table */}
                    {activeModalTest.normalValuesDetails ? (
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm mb-3">Physiological Reference Range Bounds</h4>
                        <div className="overflow-x-auto rounded-2xl border border-slate-200">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                              <tr>
                                <th className="p-3 border-b border-slate-200">Category / Parameter</th>
                                <th className="p-3 border-b border-slate-200">Reference Bound</th>
                                <th className="p-3 border-b border-slate-200">Clinical Interpretation</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {activeModalTest.normalValuesDetails.map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-50">
                                  <td className="p-3 font-bold text-slate-900">{row.title}</td>
                                  <td className="p-3 font-mono font-bold text-cyan-800">{row.range}</td>
                                  <td className="p-3 text-slate-600">{row.interpretation}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                        <h4 className="font-bold text-emerald-900 text-xs uppercase tracking-wider mb-1">Standard Reference Range</h4>
                        <p className="text-emerald-950 font-medium">{activeModalTest.normalRange}</p>
                      </div>
                    )}

                    {/* High Interpretation */}
                    {activeModalTest.highInterpretation && (
                      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
                        <h4 className="font-bold text-rose-900 text-xs uppercase tracking-wider mb-2">
                          High Level / Abnormal Findings Significance
                        </h4>
                        <ul className="list-disc pl-5 space-y-1 text-rose-950">
                          {activeModalTest.highInterpretation.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Low Interpretation */}
                    {activeModalTest.lowInterpretation && (
                      <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200">
                        <h4 className="font-bold text-sky-900 text-xs uppercase tracking-wider mb-2">
                          Low Level / Decreased Value Significance
                        </h4>
                        <ul className="list-disc pl-5 space-y-1 text-sky-950">
                          {activeModalTest.lowInterpretation.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Factors Affecting Results */}
                    {activeModalTest.factorsAffectingResults && (
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm mb-3">Factors Affecting Test Accuracy & Results</h4>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {activeModalTest.factorsAffectingResults.map((item, idx) => (
                            <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                              <span className="font-bold text-slate-900 block mb-0.5">{item.factor}</span>
                              <p className="text-slate-600 text-[11px]">{item.effect}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Advantages vs Limitations */}
                    <div className="grid sm:grid-cols-2 gap-4 pt-2">
                      {activeModalTest.advantagesAndBenefits && (
                        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                          <h5 className="font-bold text-emerald-900 text-xs uppercase tracking-wider mb-2">Key Advantages</h5>
                          <ul className="list-disc pl-4 space-y-1 text-emerald-950 text-[11px]">
                            {activeModalTest.advantagesAndBenefits.map((adv, idx) => (
                              <li key={idx}>{adv}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {activeModalTest.limitationsAndDisadvantages && (
                        <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200">
                          <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">Key Limitations</h5>
                          <ul className="list-disc pl-4 space-y-1 text-slate-700 text-[11px]">
                            {activeModalTest.limitationsAndDisadvantages.map((lim, idx) => (
                              <li key={idx}>{lim}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 5: FAQS */}
                {activeTab === 'faqs' && activeModalTest.faqs && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-900 text-sm mb-3">Frequently Asked Clinical Questions</h4>
                    {activeModalTest.faqs.map((faq, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                        <h5 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                          <HelpCircle className="h-4 w-4 text-cyan-600 shrink-0" /> {faq.question}
                        </h5>
                        <p className="text-slate-600 pl-6 text-xs leading-relaxed">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <ShieldAlert className="h-4 w-4 text-slate-400" /> Patient Education Resource — Always consult your physician.
                </span>
                <button
                  onClick={() => setActiveModalTest(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-900 transition cursor-pointer"
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
