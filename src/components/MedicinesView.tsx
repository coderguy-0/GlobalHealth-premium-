import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Pill, 
  Search, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Sparkles,
  Bookmark,
  X,
  FileText,
  HelpCircle as QuestionIcon,
  Clock,
  Thermometer,
  ShieldCheck,
  Stethoscope,
  ArrowRight,
  Droplet,
  HeartPulse,
  Activity,
  Layers,
  Zap,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Building2,
  Truck,
  Plus,
  Minus,
  SlidersHorizontal,
  Check,
  Award,
  Package,
  RotateCcw,
  Mic,
  CreditCard,
  Lock,
  ArrowUpRight,
  TrendingDown,
  Eye,
  Sliders,
  DollarSign,
  MapPin
} from 'lucide-react';
import { MEDICINES } from '../data/healthData';
import { PHARMACY_PRODUCTS, VERIFIED_PHARMACY_PARTNERS, PHARMACY_FAQS } from '../data/pharmacyProductsData';
import { fetchProductAvailability } from '../services/pharmacyInventoryClient';
import { Medicine, NavigationTab } from '../types';
import { PharmacyProduct, CartItem, UploadedPrescription, PharmacyOrder, PharmacyPartner, PartnerAvailabilityOption } from '../types/pharmacyMarketplace';
import { useLocalization } from '../context/LocalizationContext';
import { useAuth } from '../context/AuthContext';
import { PharmacyProductDetailModal } from './pharmacy/PharmacyProductDetailModal';
import { MedicineMonographModal } from './MedicineMonographModal';
import { MedicineDetailPage } from './medicines/MedicineDetailPage';
import { VerifiedPartnerSelectModal } from './pharmacy/VerifiedPartnerSelectModal';
import { PharmacyCartSlideOver } from './pharmacy/PharmacyCartSlideOver';
import { PharmacyCheckoutModal } from './pharmacy/PharmacyCheckoutModal';
import { OrderTrackingModal } from './pharmacy/OrderTrackingModal';

interface MedicinesViewProps {
  savedIds: string[];
  onToggleSave: (id: string) => void;
  onNavigateToPharmacyPortal?: (targetScreen?: 'landing' | 'apply' | 'track' | 'login' | 'dashboard') => void;
  isAuthenticated?: boolean;
  onRequireAuth?: (feature: string) => void;
  onNavigate?: (tab: NavigationTab) => void;
  onAskAI?: (prompt: string) => void;
}

export const MedicinesView: React.FC<MedicinesViewProps> = ({ 
  savedIds, 
  onToggleSave,
  onNavigateToPharmacyPortal,
  isAuthenticated = false,
  onRequireAuth,
  onNavigate,
  onAskAI
}) => {
  const { t, formatNumber } = useLocalization();

  // Purchasing / checkout / orders are transactional → require an account.
  const requirePurchaseAuth = (feature: string): boolean => {
    if (isAuthenticated) return true;
    onRequireAuth?.(feature);
    return false;
  };

  // Active Main Tab: 400 Clinical Monographs, Verified Pharmacy Store, My Orders, Drug Interactions
  const [activeTab, setActiveTab] = useState<'monographs' | 'marketplace' | 'orders' | 'interactions'>('monographs');

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [monographSpecialtyFilter, setMonographSpecialtyFilter] = useState<string>('All');
  const [selectedMedicineForMonograph, setSelectedMedicineForMonograph] = useState<Medicine | null>(null);

  // Hash listener for deep links like #medicines/med-1-paracetamol
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (hash.startsWith('medicines/')) {
        const id = hash.replace('medicines/', '').trim();
        const found = MEDICINES.find((m) => m.id === id || m.name.toLowerCase().replace(/\s+/g, '-') === id.toLowerCase());
        if (found) {
          setSelectedMedicineForMonograph(found);
        }
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const openMedicine = (med: Medicine) => {
    setSelectedMedicineForMonograph(med);
    if (window.location.hash.replace(/^#\/?/, '') !== `medicines/${med.id}`) {
      window.location.hash = `#medicines/${med.id}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeMedicine = () => {
    setSelectedMedicineForMonograph(null);
    if (window.location.hash.includes('medicines/')) {
      window.location.hash = '#medicines';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  // Voice search (Web Speech API). Hidden when unsupported — never decorative.
  const [voiceListening, setVoiceListening] = useState(false);
  const [voiceSupported] = useState(
    () => typeof window !== 'undefined' && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
  );
  const voiceRecognitionRef = useRef<any>(null);

  const startVoiceSearch = () => {
    if (!voiceSupported || voiceListening) return;
    const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new Ctor();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setVoiceListening(true);
    recognition.onend = () => setVoiceListening(false);
    recognition.onerror = () => setVoiceListening(false);
    recognition.onresult = (event: any) => {
      const transcript: string = event.results?.[0]?.[0]?.transcript || '';
      if (transcript.trim()) setSearchTerm(transcript.trim());
    };
    voiceRecognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setVoiceListening(false);
    }
  };

  const stopVoiceSearch = () => {
    try {
      voiceRecognitionRef.current?.stop();
    } catch {}
    setVoiceListening(false);
  };
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // All personal pharmacy data (cart, prescriptions, orders) is namespaced to
  // the authenticated account so it can never be shared between users or
  // remain visible after logout. Derived from the secure auth session.
  const { user: authUserAccount } = useAuth();
  const pharmacyScope = authUserAccount ? `user_${authUserAccount.id}` : 'guest';

  // Cart State (Persisted in localStorage, per-user)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(`globalhealth_${pharmacyScope}_pharmacy_cart`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      if (cartItems.length) localStorage.setItem(`globalhealth_${pharmacyScope}_pharmacy_cart`, JSON.stringify(cartItems));
      else localStorage.removeItem(`globalhealth_${pharmacyScope}_pharmacy_cart`);
    } catch {}
  }, [cartItems, pharmacyScope]);

  // Uploaded Prescriptions State (private — starts empty per account)
  const [uploadedPrescriptions, setUploadedPrescriptions] = useState<UploadedPrescription[]>(() => {
    try {
      const saved = localStorage.getItem(`globalhealth_${pharmacyScope}_uploaded_prescriptions`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      if (uploadedPrescriptions.length) localStorage.setItem(`globalhealth_${pharmacyScope}_uploaded_prescriptions`, JSON.stringify(uploadedPrescriptions));
      else localStorage.removeItem(`globalhealth_${pharmacyScope}_uploaded_prescriptions`);
    } catch {}
  }, [uploadedPrescriptions, pharmacyScope]);

  // Past Orders State (private — starts empty per account)
  const [orders, setOrders] = useState<PharmacyOrder[]>(() => {
    try {
      const saved = localStorage.getItem(`globalhealth_${pharmacyScope}_pharmacy_orders`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      if (orders.length) localStorage.setItem(`globalhealth_${pharmacyScope}_pharmacy_orders`, JSON.stringify(orders));
      else localStorage.removeItem(`globalhealth_${pharmacyScope}_pharmacy_orders`);
    } catch {}
  }, [orders, pharmacyScope]);

  // Modal Control States
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<PharmacyProduct | null>(null);
  const [selectedProductForBuying, setSelectedProductForBuying] = useState<PharmacyProduct | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<PharmacyOrder | null>(null);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);

  // Interaction Tool States
  const [selectedMed1, setSelectedMed1] = useState<string>('');
  const [selectedMed2, setSelectedMed2] = useState<string>('');
  const [interactionResult, setInteractionResult] = useState<{ type: 'warning' | 'safe' | 'info'; text: string } | null>(null);

  // 8 Popular Healthcare Categories
  const categories = [
    'All',
    'Prescription',
    'OTC',
    'Generic',
    'Vitamins & Nutrition',
    'Medical Devices',
    'First Aid',
    'Personal Care'
  ];

  const checkCategoryMatch = (prodCategory: string, filter: string) => {
    if (filter === 'All') return true;
    if (filter === 'Prescription' || filter === 'Prescription Medicines') {
      return prodCategory === 'Prescription' || prodCategory === 'Prescription Medicines';
    }
    if (filter === 'OTC' || filter === 'Over-the-Counter') {
      return prodCategory === 'OTC' || prodCategory === 'Over-the-Counter';
    }
    if (filter === 'Generic' || filter === 'Generic Medicines') {
      return prodCategory === 'Generic' || prodCategory === 'Generic Medicines';
    }
    return prodCategory.toLowerCase() === filter.toLowerCase();
  };

  // Cart operations
  const handleAddToCartWithPartner = (product: PharmacyProduct, partner: PartnerAvailabilityOption) => {
    if (!requirePurchaseAuth('add medicines to your cart and place an order')) return;
    const customizedProduct: PharmacyProduct = {
      ...product,
      price: partner.price,
      pharmacyPartnerId: partner.partnerId,
      pharmacyPartnerName: partner.partnerName
    };

    setCartItems(prev => {
      const existing = prev.find(i => i.product.id === product.id && i.selectedPharmacyId === partner.partnerId);
      if (existing) {
        return prev.map(i => (i.product.id === product.id && i.selectedPharmacyId === partner.partnerId) 
          ? { ...i, quantity: i.quantity + 1 } 
          : i);
      }
      return [...prev, { product: customizedProduct, quantity: 1, selectedPharmacyId: partner.partnerId }];
    });

    setSelectedProductForBuying(null);
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCartItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: newQty } : i));
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems(prev => prev.filter(i => i.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleOrderPlaced = (order: PharmacyOrder) => {
    setOrders(prev => [order, ...prev]);
    setCartItems([]);
  };

  // Search Autocomplete Suggestions
  const searchSuggestions = useMemo(() => {
    if (!searchTerm || searchTerm.trim().length < 2) return [];
    const query = searchTerm.toLowerCase();
    const suggestions: { title: string; type: 'Medicine' | 'Generic' | 'Device' | 'Category'; id?: string }[] = [];

    // Check categories
    categories.forEach(cat => {
      if (cat !== 'All' && cat.toLowerCase().includes(query)) {
        suggestions.push({ title: cat, type: 'Category' });
      }
    });

    // Check products
    PHARMACY_PRODUCTS.forEach(p => {
      if (p.name.toLowerCase().includes(query) || p.brandName.toLowerCase().includes(query)) {
        suggestions.push({ title: p.name, type: p.category === 'Medical Devices' ? 'Device' : 'Medicine', id: p.id });
      } else if (p.genericName.toLowerCase().includes(query)) {
        suggestions.push({ title: p.genericName, type: 'Generic', id: p.id });
      }
    });

    return suggestions.slice(0, 6);
  }, [searchTerm]);

  // Filtered Products (Medicine Catalog)
  const filteredProducts = useMemo(() => {
    return PHARMACY_PRODUCTS.filter(p => {
      // Search term: searches across name, brandName, genericName, active ingredient (composition), category, subCategory, manufacturer, dosageForm
      const matchesSearch = 
        !searchTerm ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.composition.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.subCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.dosageForm.toLowerCase().includes(searchTerm.toLowerCase());

      // Category
      const matchesCategory = checkCategoryMatch(p.category, selectedCategory);

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  // 8 Specialties / Categories for 400 Complete Clinical Monographs
  const monographCategories = [
    'All',
    'Daily Life & Primary Care',
    'Cardiology',
    'Neurology',
    'Pulmonology',
    'Gastroenterology',
    'Orthopedics',
    'Nephrology',
    'Specialist & Endocrinology'
  ];

  // Filtered 400 Clinical Monographs
  const filteredMonographs = useMemo(() => {
    return MEDICINES.filter(m => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = !q ||
        m.name.toLowerCase().includes(q) ||
        m.genericName.toLowerCase().includes(q) ||
        (m.therapeuticGroup && m.therapeuticGroup.toLowerCase().includes(q)) ||
        m.category.toLowerCase().includes(q) ||
        m.uses.some(u => u.toLowerCase().includes(q));

      const matchesSpecialty = monographSpecialtyFilter === 'All' ||
        m.category.toLowerCase().includes(monographSpecialtyFilter.toLowerCase()) ||
        (m.therapeuticGroup && m.therapeuticGroup.toLowerCase().includes(monographSpecialtyFilter.toLowerCase()));

      return matchesSearch && matchesSpecialty;
    });
  }, [searchTerm, monographSpecialtyFilter]);

  // Clinical drug interaction checker
  const checkInteractions = () => {
    if (!selectedMed1 || !selectedMed2) return;
    if (selectedMed1 === selectedMed2) {
      setInteractionResult({ type: 'warning', text: 'Please select two different medications to check for interactions.' });
      return;
    }

    const med1 = MEDICINES.find((m) => m.id === selectedMed1);
    const med2 = MEDICINES.find((m) => m.id === selectedMed2);

    if (med1 && med2) {
      const name1 = med1.name.toLowerCase();
      const name2 = med2.name.toLowerCase();

      const isNSAID1 = name1.includes('ibuprofen') || name1.includes('naproxen') || name1.includes('aspirin') || name1.includes('diclofenac');
      const isNSAID2 = name2.includes('ibuprofen') || name2.includes('naproxen') || name2.includes('aspirin') || name2.includes('diclofenac');
      const isAntacid1 = name1.includes('antacid');
      const isAntacid2 = name2.includes('antacid');
      const isSedative1 = name1.includes('chlorpheniramine') || name1.includes('dextromethorphan');
      const isSedative2 = name2.includes('chlorpheniramine') || name2.includes('dextromethorphan');

      if (isNSAID1 && isNSAID2) {
        setInteractionResult({
          type: 'warning',
          text: `⚠️ High Interaction Warning: Combining multiple NSAIDs (${med1.name} + ${med2.name}) significantly increases the risk of severe stomach ulcers, gastrointestinal bleeding, and kidney strain. Avoid taking them together unless specifically prescribed by a physician.`
        });
      } else if (isAntacid1 || isAntacid2) {
        const otherMed = isAntacid1 ? med2.name : med1.name;
        setInteractionResult({
          type: 'info',
          text: `ℹ️ Absorption Warning: Antacids can decrease or delay the intestinal absorption of other oral medications (${otherMed}). Maintain a 2 to 4 hour gap between taking antacids and other medicines.`
        });
      } else if (isSedative1 && isSedative2) {
        setInteractionResult({
          type: 'warning',
          text: `⚠️ Central Nervous System Depressant Interaction: Taking ${med1.name} together with ${med2.name} can cause additive drowsiness, severe dizziness, reduced alertness, and slowed reaction times. Do not drive or operate heavy machinery.`
        });
      } else {
        setInteractionResult({
          type: 'safe',
          text: `✅ No major direct clinical contra-indications documented between ${med1.name} and ${med2.name} in standard databases. Always consult your doctor or pharmacist prior to combining multiple medications.`
        });
      }
    }
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // If a medicine is selected, render the dedicated full-page MedicineDetailPage
  if (selectedMedicineForMonograph) {
    return (
      <MedicineDetailPage
        medicine={selectedMedicineForMonograph}
        isSaved={savedIds.includes(selectedMedicineForMonograph.id)}
        onToggleSave={() => onToggleSave(selectedMedicineForMonograph.id)}
        onOpenMedicine={(id) => {
          const next = MEDICINES.find((m) => m.id === id);
          if (next) openMedicine(next);
        }}
        onBack={closeMedicine}
        onNavigate={onNavigate}
        onAskAI={onAskAI}
        onFindPharmacy={() => {
          const prod = PHARMACY_PRODUCTS.find(
            (p) =>
              p.name.toLowerCase().includes(selectedMedicineForMonograph.name.toLowerCase()) ||
              selectedMedicineForMonograph.name.toLowerCase().includes(p.name.toLowerCase())
          );
          setSelectedMedicineForMonograph(null);
          setActiveTab('marketplace');
          if (prod) {
            setSearchTerm(prod.name);
          }
        }}
      />
    );
  }

  return (
    <div className="py-6 sm:py-8 bg-slate-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* ========================================================================= */}
        {/* Top Statutory Medical Notice Strip */}
        {/* ========================================================================= */}
        <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 flex items-center justify-between gap-3 text-xs text-amber-950">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="h-4 w-4 text-amber-700 shrink-0" />
            <span className="font-medium leading-tight">
              <strong>Statutory Pharmacy Advisory:</strong> Schedule H/H1 prescription medicines strictly require a valid registered doctor's prescription from your Clinical Health Record (EHR) prior to fulfillment.
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 1. Medicine & Drugs Header */}
        {/* ========================================================================= */}
        <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 text-white p-6 sm:p-10 shadow-xl border border-slate-800 overflow-hidden">
          
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-6 w-full">
            
            <div className="mx-auto max-w-3xl space-y-4 text-center">
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-bold text-emerald-300">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Medicine Overview & Drug Directory</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 border border-slate-700 px-3 py-1 text-xs font-medium text-slate-300">
                  <Building2 className="h-3.5 w-3.5 text-teal-400" />
                  <span>Verified Pharmacy Partner Fulfillment</span>
                </span>
              </div>

              <div className="mx-auto space-y-2">
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                  Medicine & Drugs
                </h1>
                <p className="mx-auto text-xs sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
                  Find detailed medicine information first, explore therapeutic indications, active ingredients, dosage forms, and safety precautions, and purchase safely through our accredited Verified Pharmacy Partners.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80 text-xs">
                <div className="flex items-center justify-center gap-2 text-slate-300">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>100% Genuine Medicines</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-slate-300">
                  <Clock className="h-4 w-4 text-teal-400 shrink-0" />
                  <span>Express 2-Hr Delivery</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-slate-300">
                  <Building2 className="h-4 w-4 text-blue-400 shrink-0" />
                  <span>State Licensed Depots</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-slate-300">
                  <FileText className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>Clinical Pharmacist Review</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* Main Navigation Switcher Tabs */}
        {/* ========================================================================= */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-200/70 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('monographs')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'monographs'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="h-4 w-4 text-emerald-600" />
              <span>400 Clinical Monographs ({MEDICINES.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('marketplace')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'marketplace'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Pill className="h-4 w-4" />
              <span>Pharmacy Store ({PHARMACY_PRODUCTS.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Package className="h-4 w-4" />
              <span>My Orders & Prescriptions ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('interactions')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'interactions'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldAlert className="h-4 w-4 text-rose-600" />
              <span>Drug Interactions Checker</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs cursor-pointer"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>Verified Cart ({totalCartCount})</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: 400 Complete Clinical Medicine Monographs */}
        {/* ========================================================================= */}
        {activeTab === 'monographs' && (
          <div className="space-y-7">
            {/* Search Bar for Monographs */}
            <div className="relative">
              <div className="relative rounded-2xl bg-white shadow-xs border border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition p-1">
                <div className="flex items-center px-3.5 py-2.5">
                  <Search className="h-5 w-5 text-slate-400 shrink-0 mr-3" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search across 400 medicine monographs, active molecules, uses, dosages, side effects..."
                    className="w-full text-xs sm:text-sm text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="p-1 rounded-full text-slate-400 hover:bg-slate-100 transition mr-2 cursor-pointer"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  {voiceSupported && (
                    <button
                      onClick={voiceListening ? stopVoiceSearch : startVoiceSearch}
                      className={`p-1.5 rounded-xl transition cursor-pointer ${
                        voiceListening ? 'bg-emerald-100 text-emerald-700 animate-pulse' : 'text-slate-400 hover:text-emerald-700 hover:bg-slate-100'
                      }`}
                      title={voiceListening ? 'Stop voice search' : 'Voice search — say a medicine name'}
                    >
                      <Mic className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Specialty / Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {monographCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setMonographSpecialtyFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    monographSpecialtyFilter === cat
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Header info */}
            <div className="flex items-center justify-between text-xs text-slate-600 px-1">
              <div>
                Showing <strong className="text-slate-900 font-bold">{filteredMonographs.length}</strong> of{' '}
                <strong className="text-slate-900 font-bold">{MEDICINES.length}</strong> complete clinical medicine monographs
              </div>
              {monographSpecialtyFilter !== 'All' && (
                <button
                  onClick={() => setMonographSpecialtyFilter('All')}
                  className="text-emerald-600 hover:underline font-bold"
                >
                  Reset Specialty Filter
                </button>
              )}
            </div>

            {/* 400 Monographs Grid */}
            {filteredMonographs.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
                <Pill className="h-10 w-10 text-slate-300 mx-auto" />
                <h5 className="font-bold text-slate-800 text-sm">No clinical monographs match "{searchTerm}"</h5>
                <p className="text-xs text-slate-500">Try searching generic names, brand names, or clear the specialty filter.</p>
                <button
                  onClick={() => { setSearchTerm(''); setMonographSpecialtyFilter('All'); }}
                  className="rounded-xl bg-emerald-600 text-white px-4 py-2 text-xs font-bold hover:bg-emerald-700 transition cursor-pointer"
                >
                  View All 400 Medicines
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredMonographs.map((med) => {
                  const isSaved = savedIds.includes(med.id);
                  return (
                    <div
                      key={med.id}
                      className="rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                    >
                      <div className="p-5 space-y-3.5">
                        {/* Top Meta Badges */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                            {med.category || 'Therapeutics'}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {med.prescriptionRequired ? (
                              <span className="rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-extrabold px-2 py-0.5 flex items-center gap-1">
                                <FileText className="h-2.5 w-2.5" />
                                <span>Prescription (Rx)</span>
                              </span>
                            ) : (
                              <span className="rounded-full bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-extrabold px-2 py-0.5">
                                OTC Safe
                              </span>
                            )}
                            <button
                              onClick={() => onToggleSave(med.id)}
                              className={`p-1.5 rounded-full transition cursor-pointer ${
                                isSaved ? 'bg-rose-50 text-rose-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                              }`}
                              title={isSaved ? 'Remove from saved' : 'Save medicine'}
                            >
                              <Bookmark className={`h-3.5 w-3.5 ${isSaved ? 'fill-current' : ''}`} />
                            </button>
                          </div>
                        </div>

                        {/* Title & Generic Name */}
                        <div>
                          <h3
                            onClick={() => openMedicine(med)}
                            className="text-base font-black text-slate-900 hover:text-emerald-700 cursor-pointer transition flex items-center gap-1.5"
                          >
                            <span>{med.name}</span>
                          </h3>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            Generic Active Molecule: <strong className="text-slate-800">{med.genericName}</strong>
                          </p>
                        </div>

                        {/* Available Forms */}
                        {med.forms && med.forms.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {med.forms.map((f, i) => (
                              <span key={i} className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                                {f}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Key Medically Recognized Uses */}
                        {med.uses && med.uses.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Primary Clinical Indications:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {med.uses.slice(0, 3).map((use, i) => (
                                <span key={i} className="text-[11px] font-medium bg-emerald-50/80 text-emerald-900 border border-emerald-100 px-2 py-0.5 rounded-lg">
                                  {use}
                                </span>
                              ))}
                              {med.uses.length > 3 && (
                                <span className="text-[10px] text-slate-400 self-center">
                                  +{med.uses.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Dosage Preview snippet */}
                        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-[11px] text-slate-600 space-y-1">
                          <div>
                            <strong className="text-slate-900">Adult Dosage:</strong> {med.dosageAdults || med.dosage || 'Follow prescribed medical regimen.'}
                          </div>
                          {med.dosageChildren && (
                            <div>
                              <strong className="text-slate-900">Pediatric:</strong> {med.dosageChildren}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2">
                        <button
                          onClick={() => openMedicine(med)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer shadow-2xs"
                        >
                          <FileText className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Full Monograph (15 Sections)</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: Verified Pharmacy Store & Partner Purchasing */}
        {/* ========================================================================= */}
        {activeTab === 'marketplace' && (
          <div className="space-y-7">
            
            {/* 3. Single Prominent Search Bar */}
            <div className="relative">
              <div className="relative rounded-2xl bg-white shadow-xs border border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition p-1">
                <div className="flex items-center px-3.5 py-2.5">
                  <Search className="h-5 w-5 text-slate-400 shrink-0 mr-3" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowSearchSuggestions(true);
                    }}
                    onFocus={() => setShowSearchSuggestions(true)}
                    placeholder="Search medicines, brands, generics, or healthcare products…"
                    className="w-full text-xs sm:text-sm text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="p-1 rounded-full text-slate-400 hover:bg-slate-100 transition mr-2 cursor-pointer"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  {voiceSupported && (
                <button
                  onClick={voiceListening ? stopVoiceSearch : startVoiceSearch}
                  className={`p-1.5 rounded-xl transition cursor-pointer ${
                    voiceListening ? 'bg-emerald-100 text-emerald-700 animate-pulse' : 'text-slate-400 hover:text-emerald-700 hover:bg-slate-100'
                  }`}
                  title={voiceListening ? 'Stop voice search' : 'Voice search — say a medicine name'}
                  aria-label={voiceListening ? 'Stop voice search' : 'Start voice search'}
                  aria-pressed={voiceListening}
                >
                  <Mic className="h-4 w-4" />
                </button>
              )}
              {voiceListening && (
                <span className="hidden sm:inline text-[10px] font-bold text-emerald-700 animate-pulse shrink-0">Listening…</span>
              )}
                </div>
              </div>

              {/* Suggestions Dropdown */}
              {showSearchSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl bg-white border border-slate-200 shadow-xl z-30 overflow-hidden divide-y divide-slate-100 animate-in fade-in">
                  <div className="px-4 py-2 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Search Suggestions</span>
                    <button onClick={() => setShowSearchSuggestions(false)} className="text-slate-400 hover:text-slate-600">
                      Close
                    </button>
                  </div>
                  {searchSuggestions.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSearchTerm(item.title);
                        setShowSearchSuggestions(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs hover:bg-emerald-50/70 flex items-center justify-between group transition cursor-pointer"
                    >
                      <span className="font-bold text-slate-800 group-hover:text-emerald-800">{item.title}</span>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-800">
                        {item.type}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Popular Healthcare Categories (Horizontal Scrollable Chips) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                <span className="uppercase tracking-wider text-slate-500 text-[11px]">Popular Healthcare Categories</span>
                {selectedCategory !== 'All' && (
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className="text-emerald-700 hover:underline cursor-pointer"
                  >
                    Reset to All Categories
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer shrink-0 border ${
                      selectedCategory === cat
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Count Strip */}
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
              <span>
                Showing <strong>{filteredProducts.length}</strong> available medicines & healthcare products
              </span>
            </div>

            {/* 5. Medicine Listing Cards Grid */}
            {filteredProducts.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <Search className="h-7 w-7" />
                </div>
                <h4 className="font-bold text-slate-800 text-base">No Matching Medicines Found</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  We couldn't find a medicine matching your search terms. Try searching by generic active ingredient or clear filters.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All');
                  }}
                  className="rounded-xl bg-emerald-600 text-white px-4 py-2 text-xs font-bold hover:bg-emerald-700 transition cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredProducts.map((product) => {
                  const isSaved = savedIds.includes(product.id);
                  const isRx = product.prescriptionRequired;

                  const stockLabel = product.availability === 'in_stock' 
                    ? 'In Stock' 
                    : product.availability === 'low_stock' 
                    ? 'Limited Stock' 
                    : 'Currently Unavailable';

                  const stockBadgeClass = product.availability === 'in_stock'
                    ? 'bg-emerald-100 text-emerald-800'
                    : product.availability === 'low_stock'
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-rose-100 text-rose-800';

                  return (
                    <div
                      key={product.id}
                      className="rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                    >
                      {/* Card Visual Area */}
                      <div>
                        <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />

                          {/* Top Badges */}
                          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1">
                            {isRx ? (
                              <span className="rounded-full bg-amber-500 text-slate-950 px-2.5 py-0.5 text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
                                <FileText className="h-3 w-3" />
                                <span>Prescription Required</span>
                              </span>
                            ) : (
                              <span className="rounded-full bg-blue-600 text-white px-2.5 py-0.5 text-[10px] font-extrabold shadow-sm">
                                OTC
                              </span>
                            )}

                            <button
                              onClick={() => onToggleSave(product.id)}
                              className={`p-1.5 rounded-full backdrop-blur-md transition cursor-pointer ${
                                isSaved
                                  ? 'bg-rose-500 text-white shadow-xs'
                                  : 'bg-black/40 text-white hover:bg-black/60'
                              }`}
                              title={isSaved ? 'Remove from saved' : 'Save medicine'}
                            >
                              <Bookmark className="h-3.5 w-3.5 fill-current" />
                            </button>
                          </div>

                          {/* Bottom Dosage Form Badge */}
                          <div className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-xs text-slate-900 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-2xs">
                            {product.dosageForm} • {product.strength}
                          </div>
                        </div>

                        {/* Card Body Content */}
                        <div className="p-4 space-y-2.5">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase tracking-wider block">
                              {product.subCategory}
                            </span>
                            <h3 
                              onClick={() => setSelectedProductForDetail(product)}
                              className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 hover:text-emerald-700 cursor-pointer transition"
                            >
                              {product.name}
                            </h3>
                            <p className="text-[11px] text-slate-500 truncate">
                              Generic: <strong className="text-slate-700">{product.genericName}</strong>
                            </p>
                          </div>

                          {/* Pack Size & Manufacturer */}
                          <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
                            <span>Pack: <strong className="text-slate-700">{product.packSize}</strong></span>
                            <span className="truncate max-w-[120px]">{product.manufacturer}</span>
                          </div>

                          {/* Availability Indicator */}
                          <div className="flex items-center justify-between text-[11px] pt-1">
                            <span className="text-slate-500">Status:</span>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${stockBadgeClass}`}>
                              {stockLabel}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer: Starting Price & View Medicine Button */}
                      <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
                        <div className="flex items-baseline justify-between">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xs text-slate-500 font-semibold">Starting from</span>
                            <span className="text-lg font-black text-slate-900 font-mono">
                              ₹{product.price.toFixed(2)}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 font-semibold line-through">
                            MRP ₹{product.mrp.toFixed(2)}
                          </span>
                        </div>

                        {/* Primary View Medicine Button */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setSelectedProductForDetail(product)}
                            className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-800 py-2.5 text-xs font-bold transition cursor-pointer shadow-2xs"
                          >
                            <Eye className="h-3.5 w-3.5 text-emerald-600" />
                            <span>View Medicine</span>
                          </button>

                          <button
                            onClick={() => { if (requirePurchaseAuth('purchase medicines')) setSelectedProductForBuying(product); }}
                            className="flex items-center justify-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 text-xs font-bold transition shadow-2xs cursor-pointer group"
                          >
                            <Building2 className="h-3.5 w-3.5 text-emerald-200 group-hover:scale-110 transition-transform" />
                            <span>Buy Medicine</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

            {/* How GlobalHealth Pharmacy Works (Step-by-step) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
              <div className="text-center space-y-1">
                <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider">
                  Safe Pharmacy Journey
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  How Medicine Discovery & Verified Purchasing Works
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  A clinical-first model ensuring accurate drug education, clear prescription verification, and trusted fulfillment.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                    1
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">1. Search & Overview</h4>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Find medicine indications, active ingredients, dosage forms, and safety warnings first.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-black">
                    2
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">2. Select Verified Partner</h4>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Compare nearby licensed pharmacy partners by distance, live inventory, and fulfillment speed.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-black">
                    3
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">3. Prescription Review</h4>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Upload doctor prescription for Schedule H medicines. Registered pharmacists inspect dosage and indications.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black">
                    4
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">4. Secure Dispatch</h4>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Receive tamper-evident packages dispatched with cold-chain protection and real-time live GPS delivery tracking.
                  </p>
                </div>
              </div>
            </div>

            {/* Price Transparency & Trust Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase">
                  <DollarSign className="h-4 w-4" />
                  <span>Price Transparency Guaranteed</span>
                </div>
                <h4 className="text-lg font-black text-white">Clear Pricing, Before You Pay</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  No hidden surcharges. Every order displays product MRP, discount savings, itemized GST, and transparent delivery costs upfront.
                </p>
                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs space-y-1.5 font-mono">
                  <div className="flex justify-between text-slate-400"><span>Product MRP:</span><span>₹175.00</span></div>
                  <div className="flex justify-between text-emerald-400 font-bold"><span>Verified Discount:</span><span>-₹26.00</span></div>
                  <div className="flex justify-between text-slate-400"><span>Standard Delivery:</span><span>FREE (Over ₹500)</span></div>
                  <div className="flex justify-between text-slate-400"><span>Estimated GST (5%):</span><span>₹7.45</span></div>
                  <div className="flex justify-between text-white font-bold border-t border-slate-700 pt-1.5"><span>Final Payable:</span><span>₹156.45</span></div>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-blue-600 font-mono text-xs font-bold uppercase">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Accredited Pharmacy Quality</span>
                </div>
                <h4 className="text-lg font-black text-slate-900">Clinical Safety & Quality Standards</h4>
                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Accredited Partners Only:</strong> Retail depots licensed under State Drug Control Authorities.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Cold-Chain Integrity:</strong> Calibrated temperature sensors for biologicals & insulins.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Pharmacist Supervision:</strong> Every prescription order audited by a Registered Pharmacist (R.Ph).</span>
                  </div>
                </div>
              </div>

            </div>

            {/* FAQs Accordion */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider">
                  Patient Help & Support
                </span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Frequently Asked Questions
                </h3>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {PHARMACY_FAQS.map((faq, idx) => {
                  const isOpen = activeFaqIndex === idx;
                  return (
                    <div key={idx} className="py-3.5">
                      <button
                        onClick={() => setActiveFaqIndex(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between text-left font-bold text-slate-900 hover:text-emerald-700 transition cursor-pointer"
                      >
                        <span className="text-xs sm:text-sm">{faq.question}</span>
                        {isOpen ? (
                          <ChevronUp className="h-4 w-4 text-slate-400 shrink-0 ml-2" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 ml-2" />
                        )}
                      </button>
                      {isOpen && (
                        <p className="mt-2 text-slate-600 leading-relaxed text-xs animate-in fade-in">
                          {faq.answer}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: My Orders & Prescriptions */}
        {/* ========================================================================= */}
        {activeTab === 'orders' && !isAuthenticated && (
          <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-100">
              <ShoppingCart className="h-7 w-7 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Login required to view your orders</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Create a GlobalHealth account or sign in to continue with your medicine order, track
              deliveries, and access your prescription uploads.
            </p>
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <button
                onClick={() => requirePurchaseAuth('view your personal orders')}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Log In
              </button>
              <button
                onClick={() => onRequireAuth?.('purchase medicines and track your orders')}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
              >
                Create Account
              </button>
            </div>
          </div>
        )}
        {activeTab === 'orders' && isAuthenticated && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  My Pharmacy Orders & Prescriptions
                </h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  Track live medication dispatches, review pharmacist verification notes, and download official tax invoices.
                </p>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-xs font-bold text-teal-800">
                <ShieldCheck className="h-4 w-4 text-teal-600" />
                <span>Prescriptions linked to Clinical Health Record</span>
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-3 pt-2">
              {orders.length === 0 ? (
                <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
                  <Package className="h-10 w-10 text-slate-300 mx-auto" />
                  <h5 className="font-bold text-slate-800 text-sm">No Orders Placed Yet</h5>
                  <p className="text-xs text-slate-500">Your completed pharmacy purchases will appear here with live tracking.</p>
                  <button
                    onClick={() => setActiveTab('medicines')}
                    className="rounded-xl bg-emerald-600 text-white px-4 py-2 text-xs font-bold hover:bg-emerald-700 transition cursor-pointer"
                  >
                    Browse Medicines
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div
                      key={order.id}
                      className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 text-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 text-sm">{order.id}</span>
                            <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                              {order.status}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            Placed on {new Date(order.date).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="text-right sm:text-right">
                          <span className="font-black text-slate-900 text-sm font-mono">
                            ₹{order.pricing.grandTotal.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {order.items.length} {order.items.length === 1 ? 'item' : 'items'} • {order.paymentMethod}
                          </span>
                        </div>
                      </div>

                      {/* Items Preview */}
                      <div className="space-y-1.5 text-slate-700">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-[11px]">
                            <span>{item.quantity}x {item.productName}</span>
                            <span className="font-mono text-slate-900 font-bold">₹{item.totalPrice.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-slate-500 text-[11px]">
                          Fulfillment: <strong className="text-slate-800">{order.fulfillingPharmacy.name}</strong>
                        </span>

                        <button
                          onClick={() => setSelectedOrderForTracking(order)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
                        >
                          <Truck className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Track Live Order</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: Clinical Drug Interactions Checker */}
        {/* ========================================================================= */}
        {activeTab === 'interactions' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
              <div>
                <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider mb-1">
                  <ShieldAlert className="h-4 w-4" />
                  <span>Clinical Safety & Contra-indications</span>
                </div>
                <h3 className="text-xl font-black text-slate-900">Drug-to-Drug Interaction Checker</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Select two medications to check for known pharmacological interactions, overlapping side effects, absorption competition, or severe safety warnings.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-xs">Select First Medication</label>
                  <select
                    value={selectedMed1}
                    onChange={(e) => setSelectedMed1(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- Choose Medicine 1 --</option>
                    {MEDICINES.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.genericName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-xs">Select Second Medication</label>
                  <select
                    value={selectedMed2}
                    onChange={(e) => setSelectedMed2(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- Choose Medicine 2 --</option>
                    {MEDICINES.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.genericName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={checkInteractions}
                disabled={!selectedMed1 || !selectedMed2}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs transition cursor-pointer shadow-xs"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Evaluate Pharmacological Interactions</span>
              </button>

              {interactionResult && (
                <div
                  className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                    interactionResult.type === 'warning'
                      ? 'bg-rose-50 border-rose-200 text-rose-950 font-medium'
                      : interactionResult.type === 'info'
                      ? 'bg-blue-50 border-blue-200 text-blue-950 font-medium'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-950 font-medium'
                  }`}
                >
                  {interactionResult.text}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* Interactive Modals */}
      {/* ========================================================================= */}

      {/* 1. Medicine Details / Overview Modal */}
      {selectedProductForDetail && (
        <PharmacyProductDetailModal
          product={selectedProductForDetail}
          onClose={() => setSelectedProductForDetail(null)}
          onOpenBuyMedicine={(product) => {
            setSelectedProductForBuying(product);
          }}
        />
      )}

      {/* 2. Verified Pharmacy Partner Selector Modal (Opens after clicking "Buy Medicine") */}
      {selectedProductForBuying && (
        <VerifiedPartnerSelectModal
          product={selectedProductForBuying}
          onClose={() => setSelectedProductForBuying(null)}
          onSelectPartnerAndProceed={(product, partner) => {
            handleAddToCartWithPartner(product, partner);
          }}
        />
      )}

      {/* 3. Cart Slide-Over */}
      <PharmacyCartSlideOver
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* 4. Safe Checkout Modal with Prescription Verification */}
      <PharmacyCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        uploadedPrescriptions={uploadedPrescriptions}
        onOrderPlaced={handleOrderPlaced}
        onUnavailableItems={(unavailable) => {
          // Final validation failed for these items — drop them from the cart
          // so the customer can re-pick a pharmacy that currently has stock.
          setCartItems(prev => prev.filter(i => !unavailable.some(u => u.productId === i.product.id && u.pharmacyId === i.selectedPharmacyId)));
        }}
      />

      {/* 5. Order Live Tracking Modal */}
      <OrderTrackingModal
        order={selectedOrderForTracking}
        onClose={() => setSelectedOrderForTracking(null)}
        onReorder={async (order) => {
          // Re-ordering also runs against LIVE availability: we re-check each
          // medicine and add it from the first verified pharmacy currently
          // holding stock. If no pharmacy can fulfil an item, the partner
          // selector opens so the customer sees the current situation.
          for (const item of order.items) {
            const prod = PHARMACY_PRODUCTS.find(p => p.id === item.productId);
            if (!prod) continue;
            const availability = await fetchProductAvailability(prod.id);
            if (availability.ok && availability.options.length > 0) {
              handleAddToCartWithPartner(prod, availability.options[0]);
            } else {
              setSelectedProductForBuying(prod);
            }
          }
        }}
      />

    </div>
  );
};
