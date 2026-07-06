import React, { useState } from 'react';
import { Sprout, Search, ShoppingCart, User, LogOut, Plus, Wallet, ChevronDown, Package, Award } from 'lucide-react';
import { User as UserType } from '../types';
import TranslateWidget from './TranslateWidget';

interface NavbarProps {
  user: UserType | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenOrders: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenFarmerPortal: () => void;
  onAddFunds: () => void;
  activeTab: 'marketplace' | 'weather' | 'schemes';
  setActiveTab: (tab: 'marketplace' | 'weather' | 'schemes') => void;
}

export default function Navbar({
  user,
  onOpenAuth,
  onLogout,
  cartCount,
  onOpenCart,
  onOpenOrders,
  searchQuery,
  setSearchQuery,
  onOpenFarmerPortal,
  onAddFunds,
  activeTab,
  setActiveTab,
}: NavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-stone-200/80 shadow-xs">
      {/* Top pre-header bar */}
      <div className="bg-stone-50 border-b border-stone-200/40 py-1.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] sm:text-xs text-stone-500 font-medium">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="truncate">Direct-from-farm cold-chain logistics active across India</span>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <TranslateWidget />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => { setSearchQuery(''); }}>
            <div className="bg-emerald-500 text-white p-2 rounded-xl flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Sprout className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xl font-bold font-display tracking-tight text-stone-900 block leading-tight">
                Agri<span className="text-emerald-600">kart</span>
              </span>
              <span className="text-[10px] text-stone-500 font-medium tracking-wider uppercase block -mt-0.5">
                Full-Stack Marketplace
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-stone-400" />
            </div>
            <input
              type="text"
              placeholder="Search farm fresh produce, certified seeds, organic fertilizers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-4 py-2 border border-stone-200 rounded-xl bg-stone-50 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all text-sm"
            />
          </div>

          {/* Action buttons & User profile */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Wallet (if buyer or farmer, but especially buyer) */}
            {user && (
              <div 
                onClick={onAddFunds}
                className="hidden sm:flex items-center gap-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl px-3 py-1.5 cursor-pointer transition-colors"
                title="Click to add demo funds"
              >
                <Wallet className="h-4 w-4 text-emerald-600" />
                <div className="text-left leading-none">
                  <span className="text-[9px] text-stone-500 block">Balance</span>
                  <span className="text-xs font-semibold text-stone-800">₹{user.balance.toFixed(2)}</span>
                </div>
                <Plus className="h-3 w-3 text-stone-400 ml-1 hover:text-emerald-600" />
              </div>
            )}

            {/* Farmer portal shortcut */}
            {user && user.role === 'farmer' && (
              <button
                onClick={onOpenFarmerPortal}
                className="hidden md:flex items-center gap-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/50 px-4 py-1.5 rounded-xl text-sm font-medium transition-all"
              >
                <Plus className="h-4 w-4" />
                Farmer Portal
              </button>
            )}

            {/* Shopping Cart */}
            {(!user || user.role === 'buyer') && (
              <button
                onClick={onOpenCart}
                className="relative p-2.5 text-stone-600 hover:text-emerald-600 hover:bg-stone-50 rounded-xl border border-transparent hover:border-stone-100 transition-all"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-600 text-white font-semibold text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Authentication / User Profile */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 hover:bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 transition-all"
                >
                  <div className="h-7 w-7 bg-emerald-600 text-white font-bold flex items-center justify-center rounded-lg text-sm font-display shadow-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden lg:block text-left max-w-[120px] truncate leading-tight">
                    <span className="text-xs font-medium text-stone-800 block truncate">{user.name}</span>
                    <span className="text-[10px] text-stone-400 block capitalize">{user.role}</span>
                  </div>
                  <ChevronDown className="h-3 w-3 text-stone-400" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-stone-200/80 rounded-2xl shadow-xl z-20 py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-100">
                      
                      <div className="px-4 py-2.5 border-b border-stone-100 bg-stone-50/50">
                        <span className="text-xs text-stone-400 block">Signed in as</span>
                        <span className="text-sm font-semibold text-stone-800 block truncate">{user.name}</span>
                        <span className="text-[10px] text-emerald-600 font-medium tracking-wider uppercase block mt-0.5 bg-emerald-50 px-1.5 py-0.5 rounded-md w-fit">
                          {user.role} Account
                        </span>
                      </div>

                      {/* Add funds in dropdown for mobile */}
                      <button
                        onClick={() => {
                          onAddFunds();
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-stone-50 text-stone-700 text-sm flex items-center gap-2.5 transition-colors sm:hidden"
                      >
                        <Wallet className="h-4 w-4 text-stone-400" />
                        Wallet: ₹{user.balance.toFixed(2)} (Add funds)
                      </button>

                      {user.role === 'farmer' && (
                        <button
                          onClick={() => {
                            onOpenFarmerPortal();
                            setDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 text-emerald-700 font-medium text-sm flex items-center gap-2.5 transition-colors"
                        >
                          <Plus className="h-4 w-4 text-emerald-600" />
                          Farmer Dashboard
                        </button>
                      )}

                      <button
                        onClick={() => {
                          onOpenOrders();
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-stone-50 text-stone-700 text-sm flex items-center gap-2.5 transition-colors"
                      >
                        <Package className="h-4 w-4 text-stone-400" />
                        My Orders
                      </button>

                      <div className="border-t border-stone-100 my-1" />

                      <button
                        onClick={() => {
                          onLogout();
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-rose-50 text-rose-600 text-sm flex items-center gap-2.5 transition-colors"
                      >
                        <LogOut className="h-4 w-4 text-rose-400" />
                        Log Out
                      </button>

                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/10 px-5 py-2 rounded-xl text-sm font-medium tracking-tight transition-all flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Sign In
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Secondary Sub-Navbar (Different Navbar!) */}
      <div className="border-t border-stone-100 bg-stone-50/50 py-2.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-start gap-4">
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveTab('marketplace');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer ${
              activeTab === 'marketplace'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/10'
                : 'bg-white text-stone-600 border-stone-200/80 hover:bg-stone-50 hover:text-stone-900'
            }`}
          >
            <Sprout className="h-4 w-4" />
            <span>🌱 Marketplace Storefront</span>
          </button>

          <button
            onClick={() => setActiveTab('weather')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer ${
              activeTab === 'weather'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/10'
                : 'bg-white text-stone-600 border-stone-200/80 hover:bg-stone-50 hover:text-stone-900'
            }`}
          >
            <span className="text-sm">☀️</span>
            <span>Agronomy & Weather Forecasting Portal</span>
            <span className="bg-amber-500 text-white text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-full animate-pulse tracking-wider">
              Live India Search
            </span>
          </button>

          <button
            onClick={() => setActiveTab('schemes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer ${
              activeTab === 'schemes'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/10'
                : 'bg-white text-stone-600 border-stone-200/80 hover:bg-stone-50 hover:text-stone-900'
            }`}
          >
            <Award className="h-4 w-4" />
            <span>🏛️ Government Schemes</span>
            <span className="bg-emerald-100 text-emerald-800 text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-md tracking-wider">
              Indian Farmer Benefits
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}
