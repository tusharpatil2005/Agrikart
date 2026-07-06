import React, { useState, useEffect } from 'react';
import { X, Plus, Package, Edit2, Trash2, CheckCircle, TrendingUp, DollarSign, Loader, ShoppingBag, ShieldAlert } from 'lucide-react';
import { Product, User, Order } from '../types';

interface FarmerPortalProps {
  user: User;
  token: string;
  onClose: () => void;
  onRefreshProducts: () => void;
}

export default function FarmerPortal({
  user,
  token,
  onClose,
  onRefreshProducts,
}: FarmerPortalProps) {
  const [activeTab, setActiveTab] = useState<'listings' | 'add' | 'orders'>('listings');
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields for Listing Product
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'Produce' | 'Seeds' | 'Fertilizers' | 'Tools' | 'Equipment'>('Produce');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [unit, setUnit] = useState('kg');
  const [image, setImage] = useState('');
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Edit stock modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newStock, setNewStock] = useState('');

  const fetchMyData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch Farmer's listings
      const pRes = await fetch(`/api/products?farmerId=${user.id}`);
      if (!pRes.ok) throw new Error('Failed to fetch your product listings');
      const pData = await pRes.json();
      setMyProducts(pData);

      // Fetch Farmer's supplier orders
      const oRes = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!oRes.ok) throw new Error('Failed to fetch incoming orders');
      const oData = await oRes.json();
      setMyOrders(oData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyData();
  }, [activeTab]);

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFormSuccess(null);
    setLoading(true);

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          category,
          description,
          price: parseFloat(price),
          stock: parseInt(stock),
          unit,
          image: image || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to list product');
      }

      setFormSuccess('Your product has been listed successfully!');
      // Reset form
      setName('');
      setDescription('');
      setPrice('');
      setStock('');
      setUnit('kg');
      setImage('');
      onRefreshProducts();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setError(null);

    try {
      const response = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          stock: parseInt(newStock),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update stock');
      }

      setEditingProduct(null);
      fetchMyData();
      onRefreshProducts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing permanently?')) return;
    setError(null);

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete listing');
      }

      fetchMyData();
      onRefreshProducts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    setError(null);
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update order status');
      }

      fetchMyData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Math totals for farmer
  const totalRevenue = myOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalListingsCount = myProducts.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs" onClick={onClose} />

      {/* Modal */}
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden relative z-10 border border-stone-200/50 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150">
        
        {/* Header bar */}
        <div className="bg-emerald-800 text-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-700 p-2.5 rounded-xl">
              <Package className="h-6 w-6 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold font-display tracking-tight">Farmer & Supplier Portal</h2>
              <p className="text-xs text-emerald-100 font-medium">Manage inventories, fresh products, and check inbound orders</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white hover:bg-emerald-700/60 p-2 rounded-full transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mini stats row */}
        <div className="bg-emerald-900/5 border-b border-stone-200/50 grid grid-cols-3 divide-x divide-stone-200/50">
          <div className="p-4 text-center">
            <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">Farmer Shop</span>
            <span className="text-sm font-semibold text-stone-800 truncate block mt-0.5">{user.name}</span>
          </div>
          <div className="p-4 text-center">
            <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">Farmer Revenue</span>
            <span className="text-sm font-bold text-emerald-700 block mt-0.5">₹{totalRevenue.toFixed(2)}</span>
          </div>
          <div className="p-4 text-center">
            <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">Active Listings</span>
            <span className="text-sm font-semibold text-stone-800 block mt-0.5">{totalListingsCount} listed</span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-stone-50 border-b border-stone-200/70 p-2">
          <button
            onClick={() => { setActiveTab('listings'); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg font-display transition-all ${
              activeTab === 'listings' ? 'bg-white text-emerald-800 shadow-xs border border-stone-200/40' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            My Product Listings
          </button>
          <button
            onClick={() => { setActiveTab('add'); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg font-display transition-all ${
              activeTab === 'add' ? 'bg-white text-emerald-800 shadow-xs border border-stone-200/40' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            + List New Product
          </button>
          <button
            onClick={() => { setActiveTab('orders'); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg font-display transition-all relative ${
              activeTab === 'orders' ? 'bg-white text-emerald-800 shadow-xs border border-stone-200/40' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            Inbound Orders
            {myOrders.filter(o => o.status === 'Pending').length > 0 && (
              <span className="absolute right-3 top-2.5 bg-rose-500 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-full leading-none">
                {myOrders.filter(o => o.status === 'Pending').length} new
              </span>
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-stone-50/50">
          
          {error && (
            <div className="mb-4 bg-rose-50 border border-rose-100 rounded-xl p-3 flex items-start gap-2.5 text-rose-700 text-xs">
              <ShieldAlert className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-stone-500">
              <Loader className="h-8 w-8 text-emerald-600 animate-spin" />
              <span className="text-xs">Fetching portal data securely...</span>
            </div>
          )}

          {!loading && (
            <>
              {/* Tab: LISTINGS */}
              {activeTab === 'listings' && (
                <div className="space-y-4">
                  {myProducts.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-stone-200/50">
                      <Package className="h-10 w-10 text-stone-300 mx-auto mb-3" />
                      <span className="text-stone-500 text-sm block font-medium">No agricultural listings found.</span>
                      <button
                        onClick={() => setActiveTab('add')}
                        className="mt-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        List your first crop / product
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {myProducts.map((p) => (
                        <div key={p.id} className="bg-white rounded-2xl border border-stone-200/40 p-4 flex gap-4 items-center">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-16 h-16 rounded-xl object-cover border border-stone-100 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider block w-fit mb-1">
                              {p.category}
                            </span>
                            <h4 className="text-stone-900 font-bold text-sm truncate leading-tight">{p.name}</h4>
                            <div className="flex items-baseline gap-1 mt-1">
                              <span className="text-stone-800 font-extrabold text-sm">₹{p.price.toFixed(2)}</span>
                              <span className="text-stone-400 text-[10px]">/ {p.unit}</span>
                            </div>
                            <span className={`inline-block text-[10px] font-semibold mt-1.5 ${
                              p.stock === 0 ? 'text-rose-500' : p.stock <= 10 ? 'text-amber-600' : 'text-stone-400'
                            }`}>
                              Stock: {p.stock} {p.unit}s left
                            </span>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setNewStock(p.stock.toString());
                              }}
                              className="p-2 bg-stone-50 hover:bg-stone-100 text-stone-600 rounded-lg transition-colors border border-stone-200/40"
                              title="Update Stock"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors border border-rose-100"
                              title="Delete Listing"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: ADD PRODUCT */}
              {activeTab === 'add' && (
                <form onSubmit={handleAddProductSubmit} className="bg-white rounded-2xl border border-stone-200/50 p-6 space-y-4">
                  {formSuccess && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 flex items-center gap-2 text-emerald-800 text-xs font-semibold">
                      <CheckCircle className="h-4.5 w-4.5 text-emerald-600" />
                      <span>{formSuccess}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wider">Product Title / Crop Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Organic Seed Potatoes"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="block w-full border border-stone-200 rounded-xl bg-stone-50 text-xs text-stone-900 p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white transition-all"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wider">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as any)}
                        className="block w-full border border-stone-200 rounded-xl bg-stone-50 text-xs text-stone-900 p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white transition-all"
                      >
                        <option value="Produce">Produce (Vegetables, Fruits, Fresh)</option>
                        <option value="Seeds">Seeds</option>
                        <option value="Fertilizers">Fertilizers & Nutrients</option>
                        <option value="Tools">Farming Tools</option>
                        <option value="Equipment">Heavy Equipment & Timers</option>
                      </select>
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wider">Price per Unit (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="e.g. 14.50"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="block w-full border border-stone-200 rounded-xl bg-stone-50 text-xs text-stone-900 p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white transition-all"
                      />
                    </div>

                    {/* Unit */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wider">Unit</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. kg, bag (10kg), pack, unit"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="block w-full border border-stone-200 rounded-xl bg-stone-50 text-xs text-stone-900 p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white transition-all"
                      />
                    </div>

                    {/* Stock */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wider">Initial Stock Quantity</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 100"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        className="block w-full border border-stone-200 rounded-xl bg-stone-50 text-xs text-stone-900 p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white transition-all"
                      />
                    </div>

                    {/* Image URL */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wider">Product Image URL (Optional)</label>
                      <input
                        type="url"
                        placeholder="Leave blank for automatic placeholder photo"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        className="block w-full border border-stone-200 rounded-xl bg-stone-50 text-xs text-stone-900 p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wider">Product Description</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Explain features, specifications, and quality of your crop / product..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="block w-full border border-stone-200 rounded-xl bg-stone-50 text-xs text-stone-900 p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-6 py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    {loading ? 'Submitting list details...' : 'Publish Product Listing'}
                  </button>
                </form>
              )}

              {/* Tab: INBOUND ORDERS */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  {myOrders.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-stone-200/50">
                      <ShoppingBag className="h-10 w-10 text-stone-300 mx-auto mb-3" />
                      <span className="text-stone-500 text-sm block font-medium">No buyer orders containing your crops yet.</span>
                      <p className="text-[11px] text-stone-400 mt-1">Crops will appear here once buyers check out from the marketplace.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myOrders.map((o) => (
                        <div key={o.id} className="bg-white rounded-2xl border border-stone-200/40 p-5 space-y-4">
                          <div className="flex flex-col sm:flex-row justify-between gap-2 border-b border-stone-100 pb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-stone-800 font-mono">ID: {o.id}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                  o.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700' :
                                  o.status === 'Shipped' ? 'bg-indigo-50 text-indigo-700' :
                                  o.status === 'Cancelled' ? 'bg-rose-50 text-rose-700' :
                                  'bg-amber-50 text-amber-700 animate-pulse'
                                }`}>
                                  {o.status}
                                </span>
                              </div>
                              <span className="text-[10px] text-stone-400 block mt-1">Date: {new Date(o.createdAt).toLocaleString()}</span>
                            </div>

                            <div className="sm:text-right">
                              <span className="text-[10px] text-stone-400 block">Supplier Payout Share</span>
                              <span className="text-sm font-extrabold text-emerald-700">₹{o.totalAmount.toFixed(2)}</span>
                            </div>
                          </div>

                          {/* Order Items */}
                          <div className="space-y-2">
                            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Ordered Items</span>
                            {o.items.map((it: any) => (
                              <div key={it.productId} className="flex justify-between text-xs font-medium text-stone-700">
                                <span className="truncate max-w-md">{it.name} <span className="text-stone-400">x{it.quantity}</span></span>
                                <span className="font-mono text-stone-900">₹{(it.price * it.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>

                          {/* Shipping Address */}
                          <div className="text-xs bg-stone-50 border border-stone-200/50 p-3 rounded-xl space-y-0.5">
                            <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider block">Customer Delivery Address</span>
                            <p className="text-stone-600 font-medium leading-relaxed">{o.shippingAddress}</p>
                          </div>

                          {/* Farmer actions */}
                          {o.status !== 'Delivered' && o.status !== 'Cancelled' && (
                            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                              {o.status === 'Pending' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(o.id, 'Shipped')}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-4 py-2 rounded-lg transition-colors"
                                >
                                  Dispatch & Mark Shipped
                                </button>
                              )}
                              {o.status === 'Shipped' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(o.id, 'Delivered')}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-4 py-2 rounded-lg transition-colors"
                                >
                                  Complete Delivery
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </>
          )}

        </div>
      </div>

      {/* Embedded Stock Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setEditingProduct(null)} />
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl relative z-10 border border-stone-200 p-5 animate-in zoom-in-95 duration-100">
            <h3 className="text-sm font-bold text-stone-900 mb-1.5 uppercase">Update stock levels</h3>
            <p className="text-xs text-stone-500 mb-4 font-medium">Set the available stock quantity for <span className="font-semibold text-stone-700">{editingProduct.name}</span>.</p>

            <form onSubmit={handleUpdateStockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">New stock level ({editingProduct.unit}s)</label>
                <input
                  type="number"
                  required
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  className="block w-full border border-stone-200 rounded-xl bg-stone-50 text-sm text-stone-900 p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="text-stone-500 hover:bg-stone-50 text-xs font-semibold px-4 py-2 rounded-lg border border-stone-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
