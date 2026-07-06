import React, { useState, useEffect, useCallback } from 'react';
import { Sprout, Wallet, ShieldCheck, Truck, Users, Sparkles, Plus, AlertCircle, RefreshCw, Star, ArrowRight, Eye, ShoppingCart } from 'lucide-react';
import { Product, User, CartItem, Order } from './types';

import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import ProductDetailsModal from './components/ProductDetailsModal';
import FarmerPortal from './components/FarmerPortal';
import CartModal from './components/CartModal';
import OrdersModal from './components/OrdersModal';
import FilterSidebar from './components/FilterSidebar';
import ProductCard from './components/ProductCard';
import WeatherWidget from './components/WeatherWidget';
import GovernmentSchemes from './components/GovernmentSchemes';

export default function App() {
  // User Session State
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Products and Cart State
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Modals Open/Close States
  const [activeTab, setActiveTab] = useState<'marketplace' | 'weather' | 'schemes'>('marketplace');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [ordersModalOpen, setOrdersModalOpen] = useState(false);
  const [farmerPortalOpen, setFarmerPortalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Success/Notification Alerts
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Trigger alert helper
  const showAlert = (text: string, type: 'success' | 'error' = 'success') => {
    setAlertMessage({ type, text });
    setTimeout(() => {
      setAlertMessage(null);
    }, 4000);
  };

  // 1. Fetch User profile on startup if token is present
  useEffect(() => {
    const storedToken = localStorage.getItem('agri-token');
    if (storedToken) {
      setToken(storedToken);
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${storedToken}` },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error('Token expired');
          }
          return res.json();
        })
        .then((userData) => {
          setUser(userData);
          fetchCart(storedToken);
        })
        .catch(() => {
          // Clean stale session
          localStorage.removeItem('agri-token');
          setToken(null);
          setUser(null);
        });
    }
  }, []);

  // 2. Fetch products dynamically when filters update
  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory && selectedCategory !== 'All') params.append('category', selectedCategory);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (sortBy) params.append('sortBy', sortBy);

      const response = await fetch(`/api/products?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to load catalog products');
      const data = await response.json();
      setProducts(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingProducts(false);
    }
  }, [searchQuery, selectedCategory, minPrice, maxPrice, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // 3. Fetch User's Cart
  const fetchCart = async (authToken: string) => {
    try {
      const response = await fetch('/api/cart', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const cartData = await response.json();
        setCart(cartData);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  };

  // 4. Save User's Cart to Server
  const syncCartWithServer = async (updatedCart: CartItem[], authToken: string) => {
    try {
      const payload = updatedCart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ items: payload }),
      });
    } catch (err) {
      console.error('Error syncing cart:', err);
    }
  };

  // Auth Operations
  const handleLoginSuccess = (userData: User, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('agri-token', userToken);
    fetchCart(userToken);
    showAlert(`Welcome back, ${userData.name}! Successfully signed in.`, 'success');
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setCart([]);
    localStorage.removeItem('agri-token');
    showAlert('You have been logged out of your session.', 'success');
  };

  // Add Funds (Escrow Wallet Simulation)
  const handleAddFunds = async () => {
    if (!token) {
      setAuthModalOpen(true);
      return;
    }

    try {
      const response = await fetch('/api/auth/add-funds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: 5000 }), // Add ₹5000 demo funds instantly
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add funds');
      }

      setUser((prev) => prev ? { ...prev, balance: data.balance } : null);
      showAlert(data.message || 'Successfully loaded credits!', 'success');
    } catch (err: any) {
      showAlert(err.message, 'error');
    }
  };

  // Cart Operations
  const handleAddToCart = (product: Product, quantity: number) => {
    if (user && user.role === 'farmer') {
      showAlert('Farmers/Suppliers cannot purchase marketplace items.', 'error');
      return;
    }

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.product.id === product.id);
      let newCart = [...prevCart];

      if (existingIndex > -1) {
        const currentQty = newCart[existingIndex].quantity;
        const potentialQty = currentQty + quantity;

        if (potentialQty > product.stock) {
          showAlert(`Insufficient stock! Cannot add more than ${product.stock} units.`, 'error');
          return prevCart;
        }

        newCart[existingIndex].quantity = potentialQty;
      } else {
        if (quantity > product.stock) {
          showAlert(`Insufficient stock! Cannot add more than ${product.stock} units.`, 'error');
          return prevCart;
        }
        newCart.push({ product, quantity });
      }

      if (token) {
        syncCartWithServer(newCart, token);
      }
      showAlert(`Added ${quantity}x ${product.name} to basket!`, 'success');
      return newCart;
    });
  };

  const handleUpdateCartQty = (productId: string, quantity: number) => {
    if (quantity < 1) {
      handleRemoveFromCart(productId);
      return;
    }

    setCart((prevCart) => {
      const index = prevCart.findIndex((item) => item.product.id === productId);
      if (index === -1) return prevCart;

      const prodStock = prevCart[index].product.stock;
      if (quantity > prodStock) {
        showAlert(`Insufficient supplier stock! Maximum allowed: ${prodStock}.`, 'error');
        return prevCart;
      }

      let newCart = [...prevCart];
      newCart[index].quantity = quantity;

      if (token) {
        syncCartWithServer(newCart, token);
      }
      return newCart;
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prevCart) => {
      const newCart = prevCart.filter((item) => item.product.id !== productId);
      if (token) {
        syncCartWithServer(newCart, token);
      }
      showAlert('Item removed from your basket.', 'success');
      return newCart;
    });
  };

  // Place Order API Escrow flow
  const handleCheckout = async (shippingAddress: string, paymentMethod: string) => {
    if (!token) throw new Error('Authentication required');

    const payload = cart.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        items: payload,
        shippingAddress,
        paymentMethod,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to check out order');
    }

    // Refresh products catalog & user balance
    fetchProducts();
    setUser((prev) => prev ? { ...prev, balance: data.newBalance } : null);
    setCart([]); // Clear local cart
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-stone-50/20">
      
      {/* Alert Banner Notification */}
      {alertMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-150">
          <div className={`p-4 rounded-2xl shadow-xl flex items-center gap-3 border text-xs font-semibold max-w-sm ${
            alertMessage.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500'
              : 'bg-rose-600 text-white border-rose-500'
          }`}>
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>{alertMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Header / Navigation */}
      <Navbar
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenCart={() => setCartModalOpen(true)}
        onOpenOrders={() => {
          if (!token) setAuthModalOpen(true);
          else setOrdersModalOpen(true);
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenFarmerPortal={() => {
          if (!token) setAuthModalOpen(true);
          else setFarmerPortalOpen(true);
        }}
        onAddFunds={handleAddFunds}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {activeTab === 'marketplace' ? (
        <>
          {/* Hero Section */}
          <div className="relative bg-emerald-900 overflow-hidden shrink-0">
            <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay">
              <img
                src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1600&q=80"
                alt="Farming Fields Background"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Abstract Green decorative overlays */}
            <div className="absolute -top-32 -left-40 w-96 h-96 bg-emerald-600 rounded-full blur-3xl opacity-35" />
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500 rounded-full blur-3xl opacity-20" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10 flex flex-col items-center text-center">
              
              <div className="inline-flex items-center gap-2 bg-emerald-800/60 border border-emerald-600/30 px-3.5 py-1.5 rounded-full text-emerald-200 text-xs font-semibold mb-6 uppercase tracking-wider backdrop-blur-xs">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                Empowering Fair-Trade Farming
              </div>

              <h1 className="text-4xl md:text-6xl font-black text-white font-display tracking-tight max-w-3xl leading-none">
                The Modern <span className="text-emerald-400">Agricultural</span> E-Commerce Marketplace
              </h1>

              <p className="mt-4 text-base md:text-lg text-emerald-100 max-w-2xl font-medium leading-relaxed">
                Connect directly with verified local farmers. Access sun-ripened organic produce, high-yield seeds, eco-friendly fertilizers, and heavy duty farming tools with secure escrow wallet protection.
              </p>

              <div className="mt-8 flex flex-wrap gap-4 justify-center">
                <button
                  onClick={() => {
                    setSelectedCategory('Produce');
                    const element = document.getElementById('marketplace-storefront');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-emerald-500 text-white hover:bg-emerald-600 px-6 py-3 rounded-xl text-sm font-semibold shadow-md transition-all flex items-center gap-2"
                >
                  Browse Fresh Crops
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    if (!token) setAuthModalOpen(true);
                    else setFarmerPortalOpen(true);
                  }}
                  className="bg-white/10 hover:bg-white/15 text-white px-6 py-3 rounded-xl text-sm font-semibold border border-white/20 transition-all backdrop-blur-xs"
                >
                  Sell Your Harvest
                </button>
              </div>

            </div>
          </div>

          {/* Trust & Features Row */}
          <div className="bg-white border-b border-stone-200/60 shrink-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="flex items-start gap-4">
                <div className="bg-emerald-50 text-emerald-700 p-3 rounded-2xl shrink-0">
                  <Sprout className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-sm font-display">100% Direct Trade</h3>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">Zero middleman markup. 100% of order value goes directly to supplying farmer accounts.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-emerald-50 text-emerald-700 p-3 rounded-2xl shrink-0">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-sm font-display">Wallet Escrow Guarantee</h3>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">Buyers pay into smart escrow. Funds are only transferred once logistics mark items as shipped.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-emerald-50 text-emerald-700 p-3 rounded-2xl shrink-0">
                  <Truck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-sm font-display">Fast Cold-Chain Delivery</h3>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">Temperature controlled transport network guarantees produce arrives field-fresh within 24 hours.</p>
                </div>
              </div>

            </div>
          </div>

          {/* Main Marketplace Area */}
          <main id="marketplace-storefront" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 flex flex-col md:flex-row gap-8">
            
            {/* Left: Filters Sidebar */}
            <aside className="w-full md:w-1/4 shrink-0">
              <FilterSidebar
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                sortBy={sortBy}
                setSortBy={setSortBy}
                onClearFilters={handleClearFilters}
              />
            </aside>

            {/* Right: Products Listings Grid */}
            <section className="flex-1 space-y-6">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold font-display tracking-tight text-stone-950">
                    {selectedCategory === 'All' ? '🌱 Full Market Catalogue' : `🚜 ${selectedCategory} Listings`}
                  </h2>
                  <p className="text-xs text-stone-400 mt-0.5 font-medium">
                    Showing {products.length} agricultural listings currently available
                  </p>
                </div>

                {/* Quick reload action */}
                <button
                  onClick={fetchProducts}
                  className="p-2 text-stone-500 hover:text-emerald-600 hover:bg-stone-100 rounded-xl transition-all border border-stone-200/50"
                  title="Refresh Listings"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>

              {loadingProducts ? (
                <div className="text-center py-20 text-stone-500 text-xs space-y-3">
                  <div className="animate-spin h-8 w-8 border-3 border-emerald-600 border-t-transparent rounded-full mx-auto" />
                  <span className="font-medium block">Loading fresh listings...</span>
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white rounded-3xl border border-stone-200/40 py-16 px-6 text-center space-y-3">
                  <AlertCircle className="h-10 w-10 text-stone-300 mx-auto" />
                  <h4 className="font-bold text-stone-900 text-sm">No crops found matching filters</h4>
                  <p className="text-xs text-stone-400 max-w-sm mx-auto leading-relaxed">
                    Try widening your price range, typing a different harvest query, or clearing active filters.
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onViewDetails={(p) => setSelectedProduct(p)}
                      onQuickAdd={(p) => handleAddToCart(p, 1)}
                      isBuyerOrGuest={!user || user.role === 'buyer'}
                    />
                  ))}
                </div>
              )}
            </section>

          </main>
        </>
      ) : activeTab === 'weather' ? (
        /* Weather & Agronomy Portal View */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col gap-8 animate-in fade-in duration-200">
          <div className="bg-emerald-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg shadow-emerald-950/10">
            <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay">
              <img
                src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=80"
                alt="Agri Fields"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative z-10 max-w-xl">
              <span className="text-[10px] bg-emerald-800 border border-emerald-600/30 px-3 py-1 rounded-full text-emerald-300 font-extrabold uppercase tracking-widest block w-fit mb-3">
                Agronomic Intelligence Network
              </span>
              <h1 className="text-3xl font-black font-display tracking-tight leading-tight">
                National Microclimate <span className="text-emerald-400">Weather &amp; Agronomy Station</span>
              </h1>
              <p className="text-xs text-emerald-100 mt-2 leading-relaxed">
                Empowering growers with precision forecast intelligence, customized moisture-level soil stats, and disease pathogen spray advisories to protect crop yields.
              </p>
            </div>
          </div>

          {/* Dynamic Weather Search System */}
          <WeatherWidget />

          {/* Guidelines Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
            <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-sm">
              <h4 className="font-bold text-sm text-stone-900 font-display flex items-center gap-2">
                🌾 Crop Rotation Cycles
              </h4>
              <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                Introduce legume rotations after cereal harvesting to replenish nitrogen levels naturally. Avoid multi-year continuous cropping to reduce root parasite infestation risk.
              </p>
            </div>
            <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-sm">
              <h4 className="font-bold text-sm text-stone-900 font-display flex items-center gap-2">
                💧 Micro-irrigation Timing
              </h4>
              <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                Schedule drip systems during early dawn (4 AM - 7 AM). Afternoon irrigation can lead to up to 40% loss from evaporation and increase the risk of thermal leaf scalds.
              </p>
            </div>
            <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-sm">
              <h4 className="font-bold text-sm text-stone-900 font-display flex items-center gap-2">
                🍂 Organic Soil Protection
              </h4>
              <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                Incorporate green manure crops like dhaincha or sunn hemp to boost organic carbon content. Ensure compost holds a perfect C:N ratio before top-soil layering.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Government Schemes view */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col gap-8 animate-in fade-in duration-200">
          <GovernmentSchemes />
        </div>
      )}

      {/* Styled Footer */}
      <footer className="bg-stone-950 text-stone-400 py-12 border-t border-stone-900 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 text-white p-2 rounded-xl">
              <Sprout className="h-4 w-4" />
            </div>
            <div>
              <span className="text-sm font-bold font-display text-white tracking-tight">Agrikart</span>
              <span className="text-[9px] text-stone-500 block uppercase tracking-wider -mt-0.5">DIRECT-TRADE ECOSYSTEM</span>
            </div>
          </div>
          
          <div className="text-center md:text-right space-y-1">
            <p className="text-xs text-stone-500 font-medium">&copy; 2026 Agrikart. Designed with premium high-contrast responsive layouts.</p>
            <p className="text-[10px] text-stone-600">Full-Stack Express.js &amp; React JWT Auth demonstration portal.</p>
          </div>
        </div>
      </footer>

      {/* Modal Layers */}
      
      {/* Auth Modal */}
      {authModalOpen && (
        <AuthModal
          onClose={() => setAuthModalOpen(false)}
          onSuccess={(userData, userToken) => handleLoginSuccess(userData, userToken)}
        />
      )}

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          user={user}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onReviewAdded={(updatedProd) => {
            setSelectedProduct(updatedProd);
            fetchProducts(); // refresh list to update stars/averages
          }}
          token={token}
        />
      )}

      {/* Cart Basket Checkout Modal */}
      {cartModalOpen && (
        <CartModal
          cart={cart}
          user={user}
          onClose={() => setCartModalOpen(false)}
          onUpdateQuantity={handleUpdateCartQty}
          onRemoveItem={handleRemoveFromCart}
          onCheckout={handleCheckout}
          onAddFunds={handleAddFunds}
        />
      )}

      {/* Orders History Modal */}
      {ordersModalOpen && user && token && (
        <OrdersModal
          user={user}
          token={token}
          onClose={() => setOrdersModalOpen(false)}
        />
      )}

      {/* Farmer Portal Modal */}
      {farmerPortalOpen && user && user.role === 'farmer' && token && (
        <FarmerPortal
          user={user}
          token={token}
          onClose={() => setFarmerPortalOpen(false)}
          onRefreshProducts={fetchProducts}
        />
      )}

    </div>
  );
}
