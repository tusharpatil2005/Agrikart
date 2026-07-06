import React from 'react';
import { SlidersHorizontal, ArrowDownAZ, Star, X } from 'lucide-react';

interface FilterSidebarProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  minPrice: string;
  setMinPrice: (price: string) => void;
  maxPrice: string;
  setMaxPrice: (price: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  onClearFilters: () => void;
}

const categories = ['All', 'Produce', 'Seeds', 'Fertilizers', 'Tools', 'Equipment'];

export default function FilterSidebar({
  selectedCategory,
  setSelectedCategory,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  sortBy,
  setSortBy,
  onClearFilters,
}: FilterSidebarProps) {
  return (
    <div className="bg-white rounded-3xl border border-stone-200/60 p-5 space-y-6 shadow-xs sticky top-24">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-stone-100 pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
          <h3 className="font-bold font-display text-sm text-stone-900 tracking-tight">Marketplace Filters</h3>
        </div>
        <button
          onClick={onClearFilters}
          className="text-[10px] font-bold text-stone-400 hover:text-emerald-600 uppercase tracking-wider transition-colors"
        >
          Reset All
        </button>
      </div>

      {/* Categories */}
      <div className="space-y-2.5">
        <span className="text-xs font-bold text-stone-700 uppercase tracking-widest block">Product Category</span>
        <div className="flex flex-wrap md:flex-col gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-left px-3.5 py-2 rounded-xl text-xs font-medium transition-all w-full md:w-auto ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                  : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
              }`}
            >
              {cat === 'All' ? '🌱 All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3 pt-2 border-t border-stone-100/60">
        <span className="text-xs font-bold text-stone-700 uppercase tracking-widest block">Price Range (₹)</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-1/2 text-center border border-stone-200 rounded-xl bg-stone-50 text-xs text-stone-800 p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
          />
          <span className="text-stone-400 text-xs">-</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-1/2 text-center border border-stone-200 rounded-xl bg-stone-50 text-xs text-stone-800 p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Sorting */}
      <div className="space-y-2.5 pt-2 border-t border-stone-100/60">
        <span className="text-xs font-bold text-stone-700 uppercase tracking-widest block">Sort Listings</span>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <ArrowDownAZ className="h-4 w-4 text-stone-400" />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="block w-full pl-9 border border-stone-200 rounded-xl bg-stone-50 text-xs text-stone-800 p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all cursor-pointer"
          >
            <option value="newest">🆕 Newest Listed</option>
            <option value="price_asc">📉 Price: Low to High</option>
            <option value="price_desc">📈 Price: High to Low</option>
            <option value="rating">⭐️ Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Trust Banner info */}
      <div className="bg-emerald-50 border border-emerald-100/60 rounded-2xl p-3.5 space-y-1.5">
        <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[10px] uppercase tracking-wider">
          <Star className="h-3.5 w-3.5 text-emerald-600 fill-emerald-600" />
          <span>ESCROW PROTECTION</span>
        </div>
        <p className="text-[10px] text-emerald-700 leading-normal font-medium">
          Funds are held securely and only disbursed to farmers upon verified shipping dispatch.
        </p>
      </div>

    </div>
  );
}
