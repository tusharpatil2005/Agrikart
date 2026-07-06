import React, { useState } from 'react';
import { Search, Filter, Award, Coins, FileText, CheckCircle, ExternalLink, ChevronRight, ChevronDown, UserCheck, Sparkles, Calculator, HelpCircle, Info, BookOpen, Clock, CreditCard, Droplets } from 'lucide-react';

interface Scheme {
  id: string;
  name: string;
  hindiName: string;
  category: 'Income Support' | 'Crop Insurance' | 'Pensions' | 'Credit & Loans' | 'Soil & Irrigation' | 'Farm Machinery' | 'Organic Farming';
  description: string;
  benefits: string[];
  eligibility: string[];
  documents: string[];
  applyUrl: string;
  authority: string;
}

const SCHEMES_DATA: Scheme[] = [
  {
    id: 'pm-kisan',
    name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    hindiName: 'प्रधानमंत्री किसान सम्मान निधि',
    category: 'Income Support',
    description: 'A 100% central government-funded income support initiative that delivers direct cash benefits to small and marginal farming families across India to fulfill domestic and agricultural input requirements.',
    benefits: [
      'Guaranteed direct income support of ₹6,000 per year.',
      'Transferred in 3 equal installments of ₹2,000 every 4 months.',
      '100% direct bank transfer (DBT) to eliminate middleman commissions.'
    ],
    eligibility: [
      'Small and marginal landholding farmer families.',
      'Must have cultivable land registered under their name in land records.',
      'Must not be institutional landholders or high-income tax payers.'
    ],
    documents: [
      'Aadhaar Card (Mandatory)',
      'Land Ownership Documents / Khasra-Khatauni records',
      'Bank Account details linked with Aadhaar & Mobile Number',
      'Active Mobile Number'
    ],
    applyUrl: 'https://pmkisan.gov.in/',
    authority: 'Ministry of Agriculture & Farmers Welfare'
  },
  {
    id: 'pmfby',
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    hindiName: 'प्रधानमंत्री फसल बीमा योजना',
    category: 'Crop Insurance',
    description: 'A highly subsidized, unified national crop insurance scheme protecting farmers against crop failures arising from unavoidable natural calamities, pest attacks, droughts, landslides, and torrential rainstorms.',
    benefits: [
      'Extremely low premium rates: only 1.5% for Rabi crops, 2.0% for Kharif crops, and 5% for commercial/horticultural crops.',
      'Balance premium cost is heavily co-funded by the Central and State Governments.',
      'Covers pre-sowing losses, mid-season disasters, and localized post-harvest losses up to 14 days.'
    ],
    eligibility: [
      'All farmers growing notified crops in the notified areas, including sharecroppers and tenant farmers.',
      'Both loanee (farmers with active bank crop credit) and non-loanee farmers are eligible.'
    ],
    documents: [
      'Land holding records or Land Rent Agreement (for tenant farmers)',
      'Sowing Certificate issued by local Revenue/Agri Officer',
      'Aadhaar Card copy',
      'Bank passbook photocopy for claim settlement'
    ],
    applyUrl: 'https://pmfby.gov.in/',
    authority: 'Ministry of Agriculture & Farmers Welfare'
  },
  {
    id: 'kcc',
    name: 'Kisan Credit Card (KCC) Scheme',
    hindiName: 'किसान क्रेडिट कार्ड योजना',
    category: 'Credit & Loans',
    description: 'A pioneering program designed to shield farmers from exploitative high-interest local money lenders by offering extremely low-interest credit for short-term agricultural expenses, seed purchases, and household needs.',
    benefits: [
      'Highly subsidized interest rate of 4% per annum (after 3% prompt repayment subvention).',
      'Revolving credit limit up to ₹3 Lakhs without collateral for limits up to ₹1.6 Lakhs.',
      'Includes built-in personal accident insurance coverage up to ₹50,000.'
    ],
    eligibility: [
      'All individual/joint cultivators, tenant farmers, oral lessees, and sharecroppers.',
      'Self-Help Groups (SHGs) or Joint Liability Groups (JLGs) of farmers.'
    ],
    documents: [
      'Duly filled KCC Application Form',
      'Identity Proof (Aadhaar, Voter ID, PAN card)',
      'Address Proof with land registration records',
      'Sowing crop declaration certificate'
    ],
    applyUrl: 'https://pmkisan.gov.in/', // KCC application is now integrated with PM-Kisan portal
    authority: 'National Bank for Agriculture and Rural Development (NABARD)'
  },
  {
    id: 'pm-kmy',
    name: 'Pradhan Mantri Kisan Maan-Dhan Yojana (PM-KMY)',
    hindiName: 'प्रधानमंत्री किसान मान-धन योजना',
    category: 'Pensions',
    description: 'A voluntary and contribution-based pension program offering a guaranteed safety net for small and marginal landholders to ensure they live with dignity and financial security after reaching old age.',
    benefits: [
      'Assured monthly pension of ₹3,000 upon attaining the age of 60.',
      'If the pensioner passes away, the spouse is entitled to receive 50% as family pension (₹1,500/month).',
      'The Central Government contributes an equal matching amount directly to your pension fund.'
    ],
    eligibility: [
      'Small and marginal farmers holding cultivable land up to 2 hectares.',
      'Age between 18 and 40 years at the time of registration.',
      'Must not be covered under EPFO, ESIC, or National Pension Schemes.'
    ],
    documents: [
      'Aadhaar Card',
      'Savings Bank Account details with IFSC',
      'PM-Kisan beneficiary account number (if applicable)'
    ],
    applyUrl: 'https://pmkmy.gov.in/',
    authority: 'Ministry of Agriculture & LIC India'
  },
  {
    id: 'shc',
    name: 'Soil Health Card Scheme',
    hindiName: 'मृदा स्वास्थ्य कार्ड योजना',
    category: 'Soil & Irrigation',
    description: 'Promotes soil sustainability by collecting agricultural soil samples from fields, testing them in state-of-the-art labs, and issuing detailed recommendations for fertilizer usage to increase crop yields and save costs.',
    benefits: [
      'Free printed card detailing the chemical and nutrient composition of the field soil.',
      'Assesses 12 crucial parameters: macro-nutrients (N, P, K), secondary nutrients (S), and micro-nutrients (Fe, Mn, Cu, Zn).',
      'Provides customized guidance on dosage of chemical fertilizers and organic manures.'
    ],
    eligibility: [
      'All active land-holding farmers across every state in India.'
    ],
    documents: [
      'Land identity survey details',
      'Farmer contact number',
      'Aadhaar Card'
    ],
    applyUrl: 'https://soilhealth.dac.gov.in/',
    authority: 'Department of Agriculture, Cooperation & Farmers Welfare'
  },
  {
    id: 'pm-ksy',
    name: 'Pradhan Mantri Krishi Sinchayee Yojana (PM-KSY)',
    hindiName: 'प्रधानमंत्री कृषि सिंचाई योजना',
    category: 'Soil & Irrigation',
    description: 'Launched with the vision of "Har Khet Ko Pani" (Water for Every Field) and "Per Drop More Crop" to improve farm-level water use efficiency through modern micro-irrigation, drip systems, and sprinklers.',
    benefits: [
      'Up to 55% direct financial subsidy for small and marginal farmers to install drip and sprinkler networks.',
      'Up to 45% financial subsidy for other category farmers.',
      'Saves up to 40% of irrigation water and increases crop yields by up to 30% due to targeted watering.'
    ],
    eligibility: [
      'Farmers who own cultivable land with a verified source of irrigation water.',
      'Members of Water User Associations, cooperative societies, and self-help groups.'
    ],
    documents: [
      'Land revenue map/Khasra records',
      'Identity Proof & Passport Size Photograph',
      'Aadhaar Card linked to Bank Account'
    ],
    applyUrl: 'https://pmksy.gov.in/',
    authority: 'Ministry of Water Resources & Agriculture'
  },
  {
    id: 'smam',
    name: 'Sub-Mission on Agricultural Mechanization (SMAM)',
    hindiName: 'कृषि यंत्रीकरण पर उप-मिशन',
    category: 'Farm Machinery',
    description: 'Designed to boost farm efficiency, save labor costs, and modernize sowing/harvesting practices by subsidizing expensive tractors, power tillers, rotavators, high-yield threshers, and drone spray systems.',
    benefits: [
      'Subsidies ranging from 40% to 50% on buying registered state-approved agricultural machinery.',
      'Additional priority subsidy rates for small, marginal, SC, ST, and women farmers.',
      'Financial support to establish Custom Hiring Centers (CHCs) in rural villages.'
    ],
    eligibility: [
      'Active Indian farmers with clear landholding status.',
      'Self-Help Groups or Cooperative farming bodies.'
    ],
    documents: [
      'Valid Land Ownership Proof',
      'Aadhaar card copy',
      'Bank Account Passbook',
      'Quotation of the machinery/equipment from authorized dealer'
    ],
    applyUrl: 'https://agrimachinery.nic.in/',
    authority: 'Ministry of Agriculture & Farmers Welfare'
  },
  {
    id: 'pkvy',
    name: 'Paramparagat Krishi Vikas Yojana (PKVY)',
    hindiName: 'परम्परागत कृषि विकास योजना',
    category: 'Organic Farming',
    description: 'Promotes commercial organic farming through cluster-based ecological crop production. Ensures organic soil building, natural pest control, and local Participatory Guarantee System (PGS) certification.',
    benefits: [
      'Financial assistance of ₹50,000 per hectare over 3 years.',
      'Direct benefit transfer of ₹31,000 (62% of total aid) to buy organic inputs, bio-fertilizers, neem cake, and vermicompost.',
      'Free organic certification and market branding support for crop exports.'
    ],
    eligibility: [
      'Farmers willing to form organic farming groups/clusters of minimum 50 farmers.',
      'The collective land area of the cluster must be at least 50 acres (20 hectares).'
    ],
    documents: [
      'Soil health test report (initial)',
      'Group registration agreement document',
      'Aadhaar cards of participating cluster members',
      'Verified bank accounts'
    ],
    applyUrl: 'https://pgsindia-ncof.gov.in/',
    authority: 'National Centre of Organic and Natural Farming'
  }
];

const CATEGORIES = ['All', 'Income Support', 'Credit & Loans', 'Crop Insurance', 'Pensions', 'Soil & Irrigation', 'Farm Machinery', 'Organic Farming'];

export default function GovernmentSchemes() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>('pm-kisan');

  // Calculator states
  const [landSize, setLandSize] = useState<string>('under2');
  const [farmerAge, setFarmerAge] = useState<number>(35);
  const [interestArea, setInterestArea] = useState<string>('all');
  const [wizardResult, setWizardResult] = useState<Scheme[] | null>(null);

  // Filter schemes
  const filteredSchemes = SCHEMES_DATA.filter((scheme) => {
    const matchesCategory = selectedCategory === 'All' || scheme.category === selectedCategory;
    const matchesSearch = scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          scheme.hindiName.includes(searchQuery) ||
                          scheme.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to recommend schemes
    const recommended = SCHEMES_DATA.filter((scheme) => {
      // Land Size logic
      if (scheme.id === 'pm-kmy' && landSize === 'above2') return false; // pm-kmy needs <= 2 hectares
      if (scheme.id === 'pm-kisan' && landSize === 'above5') return false; // small/marginal
      
      // Age logic for PM-KMY (18-40)
      if (scheme.id === 'pm-kmy' && (farmerAge < 18 || farmerAge > 40)) return false;

      // Interest filter
      if (interestArea === 'all') return true;
      if (interestArea === 'credit' && scheme.category === 'Credit & Loans') return true;
      if (interestArea === 'machinery' && scheme.category === 'Farm Machinery') return true;
      if (interestArea === 'organic' && scheme.category === 'Organic Farming') return true;
      if (interestArea === 'irrigation' && scheme.category === 'Soil & Irrigation') return true;

      // Default category matching for secondary categories
      if (interestArea === 'credit' && scheme.id === 'pm-kisan') return true; // Income support also matches credit need
      if (interestArea === 'insurance' && scheme.category === 'Crop Insurance') return true;

      return scheme.category.toLowerCase().includes(interestArea) || interestArea === 'all';
    });

    setWizardResult(recommended);
  };

  return (
    <div className="bg-stone-50/50 rounded-3xl border border-stone-200/80 shadow-md overflow-hidden transition-all duration-300">
      
      {/* Banner / Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 px-6 py-8 relative overflow-hidden text-white border-b border-stone-200">
        <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay">
          <img
            src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=1200&q=80"
            alt="National Flag colors / Farm Fields"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute -top-32 -left-40 w-96 h-96 bg-emerald-600 rounded-full blur-3xl opacity-35" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500 rounded-full blur-3xl opacity-20" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-700/60 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-emerald-200 text-xs font-semibold mb-3.5 uppercase tracking-wider backdrop-blur-xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Official Government Benefits Finder
            </div>
            <h2 className="text-3xl font-black text-white font-display tracking-tight leading-tight">
              Indian Farmer Welfare <span className="text-emerald-400">Government Schemes Portal</span>
            </h2>
            <p className="text-xs text-emerald-100 mt-2 max-w-2xl leading-relaxed">
              Explore and apply for central subsidies, minimum income guarantees, zero-collateral farming loans, and heavily subsidized crop insurance policies provided by the Government of India.
            </p>
          </div>
          <div className="bg-emerald-800/80 border border-emerald-700 backdrop-blur-md p-4 rounded-2xl shrink-0 text-center flex flex-col items-center justify-center min-w-[180px]">
            <span className="text-3xl">🇮🇳</span>
            <span className="text-xs font-extrabold uppercase mt-1.5 text-emerald-200 tracking-wider">National Digital</span>
            <span className="text-[10px] text-emerald-300 font-semibold">Agricultural Grid</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Finder on Left, Schemes on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Side: Eligibility Wizard / Calculator (span 4) */}
        <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-stone-200 p-6 bg-white/70">
          <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-stone-100">
            <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
              <Calculator className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-stone-900 uppercase tracking-tight">Scheme Matcher Wizard</h3>
              <p className="text-[10px] text-stone-500">Find exactly which subsidies you can apply for instantly</p>
            </div>
          </div>

          <form onSubmit={handleCalculate} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1.5">Registered Land Size</label>
              <select
                value={landSize}
                onChange={(e) => setLandSize(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-stone-800"
              >
                <option value="under2">Small / Marginal (&lt; 2 Hectares / 5 Acres)</option>
                <option value="above2">Medium (2 to 5 Hectares)</option>
                <option value="above5">Large (&gt; 5 Hectares)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Farmer Age</label>
                <span className="text-xs font-extrabold text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded-lg">{farmerAge} Years Old</span>
              </div>
              <input
                type="range"
                min="18"
                max="75"
                value={farmerAge}
                onChange={(e) => setFarmerAge(parseInt(e.target.value))}
                className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[9px] text-stone-400 mt-1">
                <span>18 Years</span>
                <span>40 Years (Max for Pension)</span>
                <span>75 Years</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1.5">Primary Agriculture Goal</label>
              <select
                value={interestArea}
                onChange={(e) => setInterestArea(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-stone-800"
              >
                <option value="all">Discover All Subsidies &amp; Aid</option>
                <option value="credit">Low-Interest Loans &amp; Cash Credit</option>
                <option value="machinery">Purchase Tractors &amp; Modern Machinery</option>
                <option value="irrigation">Water drip lines / soil health reports</option>
                <option value="organic">Start Organic Pesticide-Free Cultivation</option>
                <option value="insurance">Secure Crops from Hail/Rain damage</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md shadow-emerald-700/10 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <UserCheck className="h-4 w-4" />
              <span>Match Qualifying Schemes</span>
            </button>
          </form>

          {/* Results section */}
          {wizardResult !== null && (
            <div className="mt-6 p-4 rounded-2xl bg-stone-50 border border-stone-200/60 animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] text-stone-400 font-extrabold uppercase">Wizard Matching Results</span>
                <button 
                  onClick={() => setWizardResult(null)}
                  className="text-[10px] text-stone-400 hover:text-stone-600 underline font-bold"
                >
                  Clear Results
                </button>
              </div>

              {wizardResult.length === 0 ? (
                <p className="text-xs text-stone-500 font-medium">No direct matching schemes found. Adjust your age or interest filters above.</p>
              ) : (
                <div className="space-y-2.5">
                  <p className="text-xs text-stone-600 font-bold">You qualify for {wizardResult.length} schemes:</p>
                  <div className="space-y-2">
                    {wizardResult.map((sch) => (
                      <button
                        key={sch.id}
                        onClick={() => {
                          setExpandedId(sch.id);
                          const el = document.getElementById(sch.id);
                          el?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="w-full p-2.5 bg-white hover:bg-emerald-50 border border-stone-200 hover:border-emerald-200 rounded-xl text-left flex items-center justify-between gap-2 transition-all cursor-pointer group"
                      >
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-stone-800 block truncate group-hover:text-emerald-950">{sch.name}</span>
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded-md mt-1 inline-block">{sch.category}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-stone-400 shrink-0 group-hover:text-emerald-600" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Official Helpline Box */}
          <div className="mt-8 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3 shadow-xs">
            <Info className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-emerald-950">Farmer National Helpline</h4>
              <p className="text-[10px] text-stone-600 mt-1 leading-relaxed">
                Need phone assistance? Call the national agricultural portal toll-free helpline at <strong className="text-emerald-700 font-mono text-xs block mt-0.5">1800-180-1551</strong> (Kisan Call Centre, available 6 AM - 10 PM daily).
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Tab filtering and Scheme lists (span 8) */}
        <div className="lg:col-span-8 p-6 flex flex-col justify-between bg-white">
          
          {/* Top Controls: Search and Tabs */}
          <div className="space-y-4">
            
            {/* Search Input */}
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search schemes by keywords (e.g. Fasal Bima, credit, tractor, organic)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-xs placeholder-stone-400 font-medium"
              />
            </div>

            {/* Sub-Category tabs scrollbar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/5'
                      : 'bg-white text-stone-600 border-stone-200/80 hover:bg-stone-50 hover:text-stone-900'
                  }`}
                >
                  {cat === 'All' ? '📂 Show All' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Scheme Items list */}
          <div className="mt-6 space-y-4 flex-1">
            {filteredSchemes.length === 0 ? (
              <div className="py-16 text-center bg-stone-50 border border-dashed border-stone-200 rounded-2xl space-y-2">
                <HelpCircle className="h-8 w-8 text-stone-300 mx-auto" />
                <h4 className="font-bold text-stone-850 text-xs">No matching schemes listed</h4>
                <p className="text-[11px] text-stone-400 max-w-xs mx-auto">
                  We couldn't find any state benefit schemes matching "{searchQuery}" under the category "{selectedCategory}".
                </p>
              </div>
            ) : (
              filteredSchemes.map((scheme) => {
                const isExpanded = expandedId === scheme.id;
                return (
                  <div
                    key={scheme.id}
                    id={scheme.id}
                    className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
                      isExpanded
                        ? 'bg-gradient-to-b from-stone-50/50 to-white border-emerald-500/60 shadow-md shadow-emerald-900/5'
                        : 'bg-white border-stone-200 hover:border-stone-300 shadow-xs'
                    }`}
                  >
                    {/* Collapsible header bar */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : scheme.id)}
                      className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[9px] font-extrabold uppercase rounded-md tracking-wider">
                            {scheme.category}
                          </span>
                          <span className="text-[10px] text-stone-400 font-medium">
                            {scheme.authority}
                          </span>
                        </div>
                        <h3 className="text-sm font-extrabold text-stone-900 mt-1 font-display tracking-tight flex items-center gap-1.5 flex-wrap">
                          {scheme.name}
                          <span className="text-[11px] text-emerald-700 font-medium font-sans">({scheme.hindiName})</span>
                        </h3>
                      </div>
                      <div className="p-1 hover:bg-stone-100 rounded-lg text-stone-500 shrink-0">
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </div>
                    </button>

                    {/* Detailed info body */}
                    {isExpanded && (
                      <div className="px-5 pb-5 border-t border-stone-100/60 pt-4 space-y-5 animate-in slide-in-from-top-1 duration-200">
                        
                        <div>
                          <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                            <BookOpen className="h-3.5 w-3.5 text-stone-400" /> Objective &amp; Overview
                          </h4>
                          <p className="text-xs text-stone-650 leading-relaxed font-medium">
                            {scheme.description}
                          </p>
                        </div>

                        {/* Grid for Eligibility & Benefits */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          <div className="bg-emerald-50/30 border border-emerald-100/40 p-4 rounded-xl">
                            <h4 className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-2 flex items-center gap-1">
                              <Coins className="h-3.5 w-3.5 text-emerald-700" /> Financial Aid &amp; Benefits
                            </h4>
                            <ul className="space-y-1.5">
                              {scheme.benefits.map((benefit, bIdx) => (
                                <li key={bIdx} className="text-xs text-stone-700 flex items-start gap-1.5">
                                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                  <span className="font-medium leading-normal">{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-stone-50 border border-stone-100 p-4 rounded-xl">
                            <h4 className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                              <UserCheck className="h-3.5 w-3.5 text-stone-400" /> Who Qualifies (Eligibility)
                            </h4>
                            <ul className="space-y-1.5">
                              {scheme.eligibility.map((el, eIdx) => (
                                <li key={eIdx} className="text-xs text-stone-650 flex items-start gap-1.5">
                                  <span className="h-1.5 w-1.5 bg-amber-500 rounded-full mt-1.5 shrink-0" />
                                  <span className="font-medium leading-normal">{el}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                        </div>

                        {/* Document requirements & action footer */}
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-stone-50 border border-stone-200/80 rounded-xl">
                          <div>
                            <h4 className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                              <FileText className="h-3.5 w-3.5 text-stone-400" /> Required Documents for Application
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {scheme.documents.map((doc, dIdx) => (
                                <span key={dIdx} className="bg-white border border-stone-200 px-2 py-1 rounded-md text-[10px] font-bold text-stone-600">
                                  📄 {doc}
                                </span>
                              ))}
                            </div>
                          </div>

                          <a
                            href={scheme.applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow-md shadow-emerald-700/10 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                          >
                            <span>Apply on Official Portal</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Quick FAQ / Guide Section */}
          <div className="mt-8 pt-6 border-t border-stone-100">
            <h4 className="text-[10px] text-stone-400 font-extrabold uppercase tracking-widest mb-3.5 flex items-center gap-1.5">
              <HelpCircle className="h-3.5 w-3.5 text-stone-400" /> Frequently Asked Questions
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-stone-200 rounded-2xl shadow-xs">
                <h5 className="text-xs font-black text-stone-900">Q: Are there any fees required to submit these applications?</h5>
                <p className="text-[10px] text-stone-500 mt-1 leading-relaxed">
                  No, all registrations on the official Central portals (such as PM-Kisan, PMFBY, Soil Health Card) are 100% free of charge. Be wary of unauthorized private sites charging processing fees.
                </p>
              </div>
              <div className="p-4 bg-white border border-stone-200 rounded-2xl shadow-xs">
                <h5 className="text-xs font-black text-stone-900">Q: How do I know if my Aadhaar card is linked to my land records?</h5>
                <p className="text-[10px] text-stone-500 mt-1 leading-relaxed">
                  You can verify state-level Aadhaar mapping via your state Bhulekh portal or visit the nearest local Common Service Centre (CSC) for immediate biometric verification.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
