import React, { useState } from 'react';
import { 
  ChefHat, 
  Search, 
  Clock, 
  Flame, 
  Bookmark, 
  Check, 
  X, 
  Sparkles, 
  Apple,
  Salad,
  Pill,
  ShieldAlert,
  BookOpen,
  CalendarDays,
  ArrowRight,
  Heart,
  Scale,
  Activity,
  Layers,
  AlertTriangle,
  FileText,
  Printer,
  ChevronRight,
  Info,
  CheckCircle2,
  Utensils,
  Plus,
  Minus,
  Sparkle,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Dna,
  ExternalLink,
  Shield
} from 'lucide-react';
import { 
  NUTRITION_FOODS, 
  VITAMINS_DATA, 
  MINERALS_DATA, 
  MACRONUTRIENTS_DATA, 
  MICRONUTRIENT_SYNERGIES, 
  ENHANCED_RECIPES, 
  MEAL_PLANS_DATA, 
  FOOD_INTERACTIONS_DATA, 
  DIETARY_GUIDELINES_DATA, 
  DEFICIENCY_DISEASES_DATA, 
  TOXICITY_DISEASES_DATA 
} from '../data/nutritionData';
import { Recipe, NutritionFood, VitaminDetail, MineralDetail, DeficiencyDisease, ToxicityDisease, FoodInteraction, MealPlan } from '../types';
import { AIMealPlannerView } from './AIMealPlannerView';
import { FoodDrugInteractionView } from './FoodDrugInteractionView';
import { FoodComparisonLabView } from './FoodComparisonLabView';
import { RecipesView } from './RecipesView';

interface NutritionLibraryViewProps {
  savedIds: string[];
  onToggleSave: (id: string) => void;
  onRequestAuth?: () => void;
}

type NutritionSection = 
  | 'recipes'
  | 'mealplans'
  | 'interactions'
  | 'guidelines'
  | 'comparison';

export const NutritionLibraryView: React.FC<NutritionLibraryViewProps> = ({
  savedIds,
  onToggleSave,
  onRequestAuth
}) => {
  const [activeSection, setActiveSection] = useState<NutritionSection>('recipes');

  // Foods State
  const [foodSearch, setFoodSearch] = useState('');
  const [selectedFoodCategory, setSelectedFoodCategory] = useState<string>('All');
  const [activeFoodModal, setActiveFoodModal] = useState<NutritionFood | null>(null);

  // Comparison State
  const [compareFoodA, setCompareFoodA] = useState<string>(NUTRITION_FOODS[0]?.id || '');
  const [compareFoodB, setCompareFoodB] = useState<string>(NUTRITION_FOODS[1]?.id || '');

  // Vitamins / Minerals / Diseases State
  const [vitaminSearch, setVitaminSearch] = useState('');
  const [mineralSearch, setMineralSearch] = useState('');
  const [deficiencySearch, setDeficiencySearch] = useState('');
  const [toxicitySearch, setToxicitySearch] = useState('');
  const [interactionSearch, setInteractionSearch] = useState('');

  const foodCategories = [
    'All',
    'Vegetables',
    'Fruits',
    'Whole Grains',
    'Proteins & Seafood',
    'Legumes & Beans',
    'Dairy & Alternatives',
    'Nuts & Seeds',
    'Fats & Healthy Oils',
    'Herbs & Superfoods'
  ];

  // Filter Foods
  const filteredFoods = NUTRITION_FOODS.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(foodSearch.toLowerCase()) ||
      f.keyHealthBenefits.some(b => b.toLowerCase().includes(foodSearch.toLowerCase()));
    const matchesCat = selectedFoodCategory === 'All' || f.category === selectedFoodCategory;
    return matchesSearch && matchesCat;
  });

  const foodA = NUTRITION_FOODS.find(f => f.id === compareFoodA) || NUTRITION_FOODS[0];
  const foodB = NUTRITION_FOODS.find(f => f.id === compareFoodB) || NUTRITION_FOODS[1];

  const sectionsNav = [
    { id: 'recipes', label: 'Healthy Recipes', icon: <ChefHat className="h-4 w-4" />, count: ENHANCED_RECIPES.length },
    { id: 'mealplans', label: 'AI Meal Planner', icon: <Sparkles className="h-4 w-4 text-emerald-500" /> },
    { id: 'interactions', label: 'Food & Drug Interactions', icon: <AlertTriangle className="h-4 w-4" />, count: FOOD_INTERACTIONS_DATA.length },
    { id: 'guidelines', label: 'Dietary Guidelines & Limits', icon: <BookOpen className="h-4 w-4" />, count: DIETARY_GUIDELINES_DATA.length },
    { id: 'comparison', label: 'Food Comparison Lab', icon: <Scale className="h-4 w-4" /> }
  ];

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 lg:px-8 space-y-8">
        
        {/* Main Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-1.5">
              <Salad className="h-4 w-4" /> Evidence-Based Clinical Nutrition & Dietary Library
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Nutrition, Culinary Medicine & Human Metabolism
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Explore nutrient-dense whole foods, detailed therapeutic recipes, vitamin & mineral biochemical roles, clinical deficiency diseases, toxicity thresholds, and food-drug interactions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSection('recipes')}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition"
            >
              <ChefHat className="h-4 w-4" />
              <span>Explore Recipes</span>
            </button>
            <button
              onClick={() => setActiveSection('comparison')}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
            >
              <Scale className="h-4 w-4 text-emerald-600" />
              <span>Compare Foods</span>
            </button>
          </div>
        </div>

        {/* Top Horizontal Section Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200/80">
          {sectionsNav.map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id as NutritionSection)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {sec.icon}
                <span>{sec.label}</span>
                {sec.count !== undefined && (
                  <span className={`grid h-4.5 min-w-4.5 place-items-center rounded-full px-1 text-[10px] font-extrabold ${
                    isActive ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {sec.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* 1. HEALTHY RECIPES SECTION (ENHANCED IN DETAIL WITH MULTIPLE FILTER SELECTION) */}
        {/* ========================================================================= */}
        {activeSection === 'recipes' && (
          <RecipesView 
            savedIds={savedIds} 
            onToggleSave={onToggleSave}
            hideHeader={true}
          />
        )}

        {/* ========================================================================= */}
        {/* 2. FOODS & NUTRITIONAL VALUES SECTION */}
        {/* ========================================================================= */}
        {activeSection === 'foods' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Apple className="h-5 w-5 text-emerald-600" />
                  Nutritional Values & Functional Foods Database
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Detailed macro/micronutrient breakdown per 100g, Glycemic Index (GI), Glycemic Load (GL), and therapeutic suitability.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={foodSearch}
                  onChange={(e) => setFoodSearch(e.target.value)}
                  placeholder="Search spinach, blueberries, walnuts..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {foodCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedFoodCategory(cat)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                    selectedFoodCategory === cat
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Foods Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredFoods.map((food) => (
                <div
                  key={food.id}
                  onClick={() => setActiveFoodModal(food)}
                  className="cursor-pointer group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-2xs hover:shadow-md hover:border-emerald-300 transition"
                >
                  <div>
                    <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                      <img
                        src={food.imageUrl}
                        alt={food.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="rounded-lg bg-slate-900/85 backdrop-blur-xs px-2.5 py-1 text-[10px] font-bold text-white">
                          {food.category}
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs rounded-xl px-2.5 py-1 text-[11px] font-bold text-slate-900 shadow-xs">
                        {food.calories} kcal / {food.servingSize}
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition">
                        {food.name}
                      </h4>

                      {/* Macronutrient Bars */}
                      <div className="grid grid-cols-4 gap-1.5 text-center text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block">PRO</span>
                          <span className="font-extrabold text-slate-800">{food.proteinG}g</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block">CARBS</span>
                          <span className="font-extrabold text-slate-800">{food.carbsG}g</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block">FAT</span>
                          <span className="font-extrabold text-slate-800">{food.fatG}g</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block">GI / GL</span>
                          <span className="font-extrabold text-emerald-700">{food.glycemicIndex}/{food.glycemicLoad}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {food.keyHealthBenefits[0]}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:translate-x-0.5 transition">
                      <span>View Complete Nutrient Facts</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. VITAMINS DIRECTORY */}
        {/* ========================================================================= */}
        {activeSection === 'vitamins' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Pill className="h-5 w-5 text-emerald-600" />
                  Vitamins Encyclopedia (Fat-Soluble & Water-Soluble)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete biological functions, Recommended Daily Allowances (RDAs), upper limits, and natural food sources.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={vitaminSearch}
                  onChange={(e) => setVitaminSearch(e.target.value)}
                  placeholder="Search Vitamin D, B12, C, Folate..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {VITAMINS_DATA.filter(v => 
                v.name.toLowerCase().includes(vitaminSearch.toLowerCase()) ||
                v.chemicalName.toLowerCase().includes(vitaminSearch.toLowerCase()) ||
                v.primaryFunctions.some(f => f.toLowerCase().includes(vitaminSearch.toLowerCase()))
              ).map((vit) => (
                <div key={vit.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className={`inline-block rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider mb-1 ${
                        vit.type === 'Fat-Soluble' ? 'bg-amber-100 text-amber-900' : 'bg-sky-100 text-sky-900'
                      }`}>
                        {vit.type} Vitamin
                      </span>
                      <h4 className="text-lg font-extrabold text-slate-900">{vit.name}</h4>
                      <span className="text-xs text-slate-500 italic">{vit.chemicalName}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">RDA (Adults)</span>
                      <span className="text-xs font-extrabold text-emerald-700">{vit.rdaMen}</span>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider">Primary Biological Roles</h5>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {vit.primaryFunctions.map((fn, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                          <span>{fn}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Food Sources */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5">
                      Top Natural Food Sources
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {vit.topFoodSources.map((src, i) => (
                        <div key={i} className="bg-white p-2 rounded-xl border border-slate-200/60">
                          <span className="font-bold text-slate-800 block">{src.food}</span>
                          <span className="text-[10px] text-emerald-700 font-semibold">{src.amountPerServing} ({src.serving})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Deficiency vs Toxicity Footer */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-100 text-rose-900">
                      <span className="text-[10px] font-bold uppercase block text-rose-700">Deficiency</span>
                      <span className="font-semibold">{vit.deficiencyDisorder}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100 text-amber-900">
                      <span className="text-[10px] font-bold uppercase block text-amber-700">Upper Limit</span>
                      <span className="font-semibold">{vit.upperLimit}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. ESSENTIAL MINERALS */}
        {/* ========================================================================= */}
        {activeSection === 'minerals' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="h-5 w-5 text-emerald-600" />
                  Essential Macrominerals & Trace Elements
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Electrolytes, bone minerals, and enzymatic cofactors essential for cellular metabolism and homeostasis.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={mineralSearch}
                  onChange={(e) => setMineralSearch(e.target.value)}
                  placeholder="Search Iron, Magnesium, Calcium, Zinc..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {MINERALS_DATA.filter(m => 
                m.name.toLowerCase().includes(mineralSearch.toLowerCase()) ||
                m.chemicalSymbol.toLowerCase().includes(mineralSearch.toLowerCase()) ||
                m.primaryFunctions.some(f => f.toLowerCase().includes(mineralSearch.toLowerCase()))
              ).map((min) => (
                <div key={min.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold text-base">
                        {min.chemicalSymbol}
                      </div>
                      <div>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase">
                          {min.type}
                        </span>
                        <h4 className="text-lg font-extrabold text-slate-900 mt-0.5">{min.name}</h4>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">RDA (Adults)</span>
                      <span className="text-xs font-extrabold text-emerald-700">{min.rdaMen}</span>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider">Physiological Mechanisms</h5>
                    <ul className="space-y-1 text-xs text-slate-600">
                      {min.primaryFunctions.map((fn, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                          <span>{fn}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5">
                      Top Bioavailable Sources
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {min.topFoodSources.map((src, i) => (
                        <div key={i} className="bg-white p-2 rounded-xl border border-slate-200/60">
                          <span className="font-bold text-slate-800 block">{src.food}</span>
                          <span className="text-[10px] text-emerald-700 font-semibold">{src.amountPerServing} ({src.serving})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-950">
                    <span className="font-bold block text-amber-800 text-[10px] uppercase">Absorption & Bioavailability Factors:</span>
                    <p className="mt-0.5 leading-relaxed">{min.absorptionFactors}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. MACRONUTRIENTS MASTERCLASS */}
        {/* ========================================================================= */}
        {activeSection === 'macros' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Flame className="h-5 w-5 text-emerald-600" />
                Macronutrients: Proteins, Carbohydrates, Fats & Hydration
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Energy substrate biochemistry, Acceptable Macronutrient Distribution Ranges (AMDR), and physiological impacts.
              </p>
            </div>

            <div className="space-y-6">
              {MACRONUTRIENTS_DATA.map((macro) => (
                <div key={macro.id} className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <span className="rounded-md bg-emerald-100 text-emerald-900 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                        {macro.category}
                      </span>
                      <h4 className="text-xl font-extrabold text-slate-900 mt-1">{macro.name}</h4>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-bold">
                      <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-center">
                        <span className="text-[10px] text-slate-400 block">ENERGY</span>
                        <span className="text-slate-900">{macro.caloriesPerGram} kcal / gram</span>
                      </div>
                      <div className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-center text-emerald-900">
                        <span className="text-[10px] text-emerald-700 block">AMDR TARGET</span>
                        <span>{macro.recommendedPercentOfDailyCalories}</span>
                      </div>
                    </div>
                  </div>

                  {/* Subtypes */}
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 mb-3 uppercase tracking-wider">
                      Subtypes & Clinical Differences
                    </h5>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {macro.subtypes.map((sub, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                          <h6 className="font-bold text-slate-900 text-xs">{sub.name}</h6>
                          <p className="text-xs text-slate-600 leading-relaxed">{sub.description}</p>
                          <div className="pt-2 border-t border-slate-200/60 text-[11px]">
                            <span className="text-slate-400 font-bold block">SOURCES:</span>
                            <span className="text-slate-700 font-semibold">{sub.healthySources.join(', ')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Timing & Physiological Roles */}
                  <div className="grid sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-1.5 text-emerald-950">
                      <span className="text-[10px] font-bold uppercase text-emerald-800 block">Optimal Intake & Timing:</span>
                      <p className="leading-relaxed">{macro.optimalTimingAndIntake}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-1.5 text-rose-950">
                      <span className="text-[10px] font-bold uppercase text-rose-800 block">Risks of Chronic Deficiency / Excess:</span>
                      <p className="leading-relaxed"><strong className="text-rose-900">Deficiency:</strong> {macro.healthRisksOfDeficiency}</p>
                      <p className="leading-relaxed mt-1"><strong className="text-rose-900">Excess:</strong> {macro.healthRisksOfExcess}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 6. MICRONUTRIENT SYNERGIES */}
        {/* ========================================================================= */}
        {activeSection === 'synergies' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-600" />
                Micronutrient Synergies & Nutrient Pairing Matrix
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                How vitamins and minerals interact: absorption multipliers vs competitive channel inhibitors.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {MICRONUTRIENT_SYNERGIES.map((syn) => (
                <div key={syn.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className={`rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                      syn.type.includes('Synergy') ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                    }`}>
                      {syn.type}
                    </span>
                  </div>

                  <h4 className="text-base font-extrabold text-slate-900">{syn.title}</h4>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Biochemical Mechanism:</span>
                      <p className="text-slate-700 leading-relaxed mt-0.5">{syn.mechanism}</p>
                    </div>
                    <div className="pt-2 border-t border-slate-200/60">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase block">Dietitian Clinical Advice:</span>
                      <p className="text-slate-900 font-medium leading-relaxed mt-0.5">{syn.clinicalAdvice}</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/60 text-xs text-emerald-950 flex items-start gap-2">
                    <Utensils className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold block text-[10px] uppercase text-emerald-800">Therapeutic Meal Example:</span>
                      <span>{syn.mealExample}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 7. AI MEAL PLANNER & SMART GROCERY HUB */}
        {/* ========================================================================= */}
        {activeSection === 'mealplans' && (
          <AIMealPlannerView onRequestAuth={onRequestAuth} />
        )}

        {/* ========================================================================= */}
        {/* 8. FOOD-DRUG INTERACTIONS */}
        {/* ========================================================================= */}
        {activeSection === 'interactions' && (
          <FoodDrugInteractionView />
        )}

        {/* ========================================================================= */}
        {/* 9. DIETARY GUIDELINES & LIMITS */}
        {/* ========================================================================= */}
        {activeSection === 'guidelines' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-600" />
                World Health Organization & Dietary Guidelines Standards
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Official population benchmarks for sodium, added sugars, saturated fats, and healthy plate portions.
              </p>
            </div>

            {DIETARY_GUIDELINES_DATA.map((guide) => (
              <div key={guide.id} className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xs space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <span className="rounded-md bg-emerald-100 text-emerald-900 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    {guide.targetGroup}
                  </span>
                  <h4 className="text-2xl font-extrabold text-slate-900 mt-1">{guide.authority}</h4>
                </div>

                {/* 3 Critical Caps */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-center space-y-1">
                    <span className="text-[10px] font-bold uppercase text-rose-700 block">Sodium Ceiling</span>
                    <span className="text-lg font-extrabold text-rose-900">{guide.sodiumLimit}</span>
                    <span className="text-[11px] text-rose-800 block">Lowers stroke & hypertension risk</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-center space-y-1">
                    <span className="text-[10px] font-bold uppercase text-amber-700 block">Added Sugar Ceiling</span>
                    <span className="text-lg font-extrabold text-amber-900">{guide.addedSugarLimit}</span>
                    <span className="text-[11px] text-amber-800 block">Prevents NAFLD & insulin spikes</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 text-center space-y-1">
                    <span className="text-[10px] font-bold uppercase text-sky-700 block">Saturated Fat Ceiling</span>
                    <span className="text-lg font-extrabold text-sky-900">{guide.saturatedFatLimit}</span>
                    <span className="text-[11px] text-sky-800 block">Optimizes ApoB & LDL cholesterol</span>
                  </div>
                </div>

                {/* Food Group Servings */}
                <div>
                  <h5 className="text-xs font-bold text-slate-800 mb-3 uppercase tracking-wider">
                    Recommended Daily Food Group Servings
                  </h5>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {guide.foodGroupServings.map((fg, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                        <span className="font-bold text-slate-900 block text-sm">{fg.group}</span>
                        <span className="text-emerald-700 font-bold block">{fg.dailyServings}</span>
                        <span className="text-slate-500 block text-[11px]">{fg.examples}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Core Recommendations */}
                <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                  <h5 className="text-xs font-bold text-emerald-950 uppercase tracking-wider mb-2">
                    Core Nutritional Directives
                  </h5>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {guide.coreRecommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 10. DEFICIENCY DISEASES GUIDE */}
        {/* ========================================================================= */}
        {activeSection === 'deficiencies' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-rose-600" />
                  Nutritional Deficiency Diseases Encyclopedia
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Clinical manifestations, diagnostic lab markers, high-risk populations, and therapeutic recovery protocols.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={deficiencySearch}
                  onChange={(e) => setDeficiencySearch(e.target.value)}
                  placeholder="Search scurvy, rickets, anemia, pellagra..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="space-y-6">
              {DEFICIENCY_DISEASES_DATA.filter(d => 
                d.name.toLowerCase().includes(deficiencySearch.toLowerCase()) ||
                d.deficientNutrient.toLowerCase().includes(deficiencySearch.toLowerCase()) ||
                d.clinicalDescription.toLowerCase().includes(deficiencySearch.toLowerCase())
              ).map((def) => (
                <div key={def.id} className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-rose-100 text-rose-900 px-2 py-0.5 text-[10px] font-bold uppercase">
                          Deficiency Disease
                        </span>
                        {def.icdCode && (
                          <span className="text-[10px] text-slate-400 font-mono">ICD-10: {def.icdCode}</span>
                        )}
                      </div>
                      <h4 className="text-xl font-extrabold text-slate-900 mt-1">{def.name}</h4>
                    </div>

                    <div className="bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 text-rose-900 text-xs font-bold">
                      Deficient: {def.deficientNutrient}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {def.clinicalDescription}
                  </p>

                  <div className="grid sm:grid-cols-2 gap-4 text-xs">
                    {/* Symptoms */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Advanced Clinical Symptoms</span>
                      <ul className="space-y-1 text-slate-700">
                        {def.advancedSymptoms.map((sym, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-rose-600 font-bold">•</span>
                            <span>{sym}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* High Risk & Labs */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Diagnostic Workup & Labs</span>
                      <ul className="space-y-1 text-slate-700">
                        {def.diagnosticLaboratoryTests.map((tst, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>{tst}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Therapeutic Recovery Protocol */}
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/60 text-xs text-emerald-950 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-emerald-800 block">
                      Therapeutic Food Protocol & Recovery Timeline
                    </span>
                    <ul className="space-y-1">
                      {def.therapeuticDietProtocol.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-1.5 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="pt-1.5 text-[11px] text-emerald-800 font-semibold">
                      <strong>Expected Recovery:</strong> {def.recoveryTimeline}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 11. TOXICITY & EXTRA EATING DISEASES */}
        {/* ========================================================================= */}
        {activeSection === 'toxicities' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-rose-600" />
                  Excess Consumption & Nutrient Toxicity Disorders
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Overconsumption pathophysiologies: hypervitaminosis, iron overload, NAFLD from fructose, and sodium hypertrophy.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={toxicitySearch}
                  onChange={(e) => setToxicitySearch(e.target.value)}
                  placeholder="Search toxicity, fructose, hemochromatosis..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="space-y-6">
              {TOXICITY_DISEASES_DATA.filter(t => 
                t.name.toLowerCase().includes(toxicitySearch.toLowerCase()) ||
                t.excessNutrientOrAgent.toLowerCase().includes(toxicitySearch.toLowerCase()) ||
                t.pathophysiology.toLowerCase().includes(toxicitySearch.toLowerCase())
              ).map((tox) => (
                <div key={tox.id} className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <span className="rounded-md bg-amber-100 text-amber-900 px-2 py-0.5 text-[10px] font-bold uppercase">
                        Nutrient Toxicity / Excess
                      </span>
                      <h4 className="text-xl font-extrabold text-slate-900 mt-1">{tox.name}</h4>
                    </div>

                    <div className="bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 text-amber-900 text-xs font-bold">
                      Excess Agent: {tox.excessNutrientOrAgent}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {tox.pathophysiology}
                  </p>

                  <div className="grid sm:grid-cols-2 gap-4 text-xs">
                    {/* Acute & Chronic Signs */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Chronic Organ Damage</span>
                      <ul className="space-y-1 text-slate-700">
                        {tox.chronicManifestations.map((m, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-rose-600 font-bold">•</span>
                            <span>{m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Target Organs & Management */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Clinical Management</span>
                      <ul className="space-y-1 text-slate-700">
                        {tox.clinicalManagement.map((mgt, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>{mgt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Threshold Banner */}
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-950 flex items-center justify-between">
                    <div>
                      <span className="font-bold block text-[10px] uppercase text-rose-800">Preventive Dietary Ceiling:</span>
                      <span>{tox.preventiveDietaryCaps}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-rose-700 font-mono">Threshold: {tox.toxicThreshold}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 12. FOOD COMPARISON LAB */}
        {/* ========================================================================= */}
        {activeSection === 'comparison' && (
          <FoodComparisonLabView 
            initialFoodAId={compareFoodA}
            initialFoodBId={compareFoodB}
            onSelectFood={(food) => setActiveFoodModal(food)}
          />
        )}

        {/* ========================================================================= */}
        {/* FOOD DETAIL MODAL */}
        {/* ========================================================================= */}
        {activeFoodModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 text-slate-800 space-y-6 my-6">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="rounded-md bg-emerald-100 text-emerald-900 px-2.5 py-0.5 text-[10px] font-bold uppercase">
                    {activeFoodModal.category}
                  </span>
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{activeFoodModal.name}</h3>
                  <span className="text-xs text-slate-500 font-medium">Standard Serving: {activeFoodModal.servingSize}</span>
                </div>

                <button
                  onClick={() => setActiveFoodModal(null)}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Macros Box */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Calories</span>
                  <span className="text-base font-extrabold text-slate-900">{activeFoodModal.calories}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Protein</span>
                  <span className="text-base font-extrabold text-emerald-700">{activeFoodModal.proteinG}g</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Carbs</span>
                  <span className="text-base font-extrabold text-slate-900">{activeFoodModal.carbsG}g</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Fat</span>
                  <span className="text-base font-extrabold text-slate-900">{activeFoodModal.fatG}g</span>
                </div>
              </div>

              {/* Health Benefits */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Evidence-Based Health Perks</h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {activeFoodModal.keyHealthBenefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Vitamins & Minerals Tables */}
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Vitamins Profile</span>
                  <div className="space-y-1.5">
                    {activeFoodModal.vitamins.map((v, i) => (
                      <div key={i} className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-800">{v.name}</span>
                        <span className="font-mono text-emerald-700">{v.amount} ({v.dvPercent}% DV)</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Minerals Profile</span>
                  <div className="space-y-1.5">
                    {activeFoodModal.minerals.map((m, i) => (
                      <div key={i} className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-800">{m.name}</span>
                        <span className="font-mono text-emerald-700">{m.amount} ({m.dvPercent}% DV)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {activeFoodModal.bestPairings && (
                <div className="p-3 rounded-xl bg-emerald-50 text-xs text-emerald-950">
                  <span className="font-bold block text-[10px] uppercase text-emerald-800">Synergistic Food Pairings:</span>
                  <span>{activeFoodModal.bestPairings.join(' • ')}</span>
                </div>
              )}

              <div className="text-right pt-2 border-t border-slate-100">
                <button
                  onClick={() => setActiveFoodModal(null)}
                  className="rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
