import React, { useState } from 'react';
import { X, Trash2, MapPin, Wallet, ArrowRight, ShoppingCart, Info, CheckCircle, ShieldAlert } from 'lucide-react';
import { CartItem, User } from '../types';

interface CartModalProps {
  cart: CartItem[];
  user: User | null;
  onClose: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: (shippingAddress: string, paymentMethod: string) => Promise<void>;
  onAddFunds: () => void;
}

export default function CartModal({
  cart,
  user,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onAddFunds,
}: CartModalProps) {
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Wallet Balance');
  const [error, setError] = useState<string | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Please sign in to place an order.');
      return;
    }
    if (!shippingAddress.trim()) {
      setError('Please provide a delivery address.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await onCheckout(shippingAddress, paymentMethod);
      setCheckoutSuccess('Your agricultural order has been placed successfully!');
      setShippingAddress('');
    } catch (err: any) {
      setError(err.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs" onClick={onClose} />

      {/* Modal */}
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden relative z-10 border border-stone-200/50 max-h-[90vh] flex flex-col md:flex-row animate-in zoom-in-95 duration-150">
        
        {/* Left Side: Cart Items */}
        <div className="w-full md:w-3/5 p-6 flex flex-col max-h-[90vh]">
          <div className="flex justify-between items-center border-b border-stone-100 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-emerald-600" />
              <h3 className="font-bold text-lg font-display text-stone-900">Your Shopping Basket</h3>
            </div>
            <button onClick={onClose} className="md:hidden text-stone-400 hover:text-stone-700">
              <X className="h-5 w-5" />
            </button>
          </div>

          {checkoutSuccess ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h4 className="font-bold text-stone-950 text-base">Order Confirmed!</h4>
              <p className="text-stone-500 text-xs leading-relaxed max-w-xs">
                {checkoutSuccess} Your suppliers are notified and preparing your items for shipping.
              </p>
              <button
                onClick={onClose}
                className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
              >
                Continue Shopping
              </button>
            </div>
          ) : cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-2">
              <ShoppingCart className="h-10 w-10 text-stone-300" />
              <span className="text-stone-500 text-sm font-semibold">Your basket is empty</span>
              <p className="text-xs text-stone-400 max-w-[200px]">Browse the farm listings and add goods to start your order.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {cart.map((item) => (
                <div key={item.product.id} className="flex gap-3 bg-stone-50 p-3 rounded-2xl border border-stone-200/30 items-center justify-between">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-12 h-12 rounded-lg object-cover shrink-0 border border-stone-100"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-stone-850 font-bold text-xs truncate leading-tight">{item.product.name}</h4>
                    <span className="text-[10px] text-stone-400 mt-0.5 block">₹{item.product.price.toFixed(2)} / {item.product.unit}</span>
                  </div>

                  {/* Quantity Actions */}
                  <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-white shrink-0 scale-90">
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                      className="px-2.5 py-1.5 hover:bg-stone-50 text-stone-500 font-semibold"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-stone-800">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                      className="px-2.5 py-1.5 hover:bg-stone-50 text-stone-500 font-semibold"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    className="text-stone-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg transition-all shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {cart.length > 0 && !checkoutSuccess && (
            <div className="border-t border-stone-100 pt-3.5 mt-3.5 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-500">Cart subtotal:</span>
                <span className="font-bold text-stone-800">₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-extrabold border-t border-stone-100/50 pt-2">
                <span className="text-stone-900">Total Price:</span>
                <span className="text-emerald-700 text-lg font-display">₹{cartTotal.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Checkout Form (Only if items exist and not success) */}
        {cart.length > 0 && !checkoutSuccess && (
          <div className="w-full md:w-2/5 bg-stone-50 p-6 border-t md:border-t-0 md:border-l border-stone-200/60 flex flex-col justify-between max-h-[90vh]">
            <div className="hidden md:flex justify-between items-center border-b border-stone-200/40 pb-4 mb-4">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">ORDER SECURELY</span>
              <button onClick={onClose} className="text-stone-400 hover:text-stone-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4 flex-1">
              {error && (
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-rose-700 text-xs flex items-start gap-1.5 font-medium">
                  <ShieldAlert className="h-4.5 w-4.5 text-rose-500 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Wallet Info */}
              {user ? (
                <div className="bg-white p-3.5 rounded-2xl border border-stone-200/50 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Your wallet balance</span>
                    <span className={`text-xs font-bold ${user.balance >= cartTotal ? 'text-emerald-600' : 'text-rose-500'}`}>
                      ₹{user.balance.toFixed(2)}
                    </span>
                  </div>
                  
                  {user.balance < cartTotal && (
                    <div className="pt-2 border-t border-stone-100 space-y-2">
                      <p className="text-[10px] text-rose-600 leading-tight">
                        Insufficient funds. Add demo credits instantly to proceed with payment.
                      </p>
                      <button
                        type="button"
                        onClick={onAddFunds}
                        className="w-full bg-emerald-50 text-emerald-700 border border-emerald-200/50 text-[10px] font-bold py-1.5 rounded-lg hover:bg-emerald-100 transition-all flex items-center justify-center gap-1"
                      >
                        <Wallet className="h-3 w-3" />
                        Top up ₹5000 (Demo Credits)
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200/50 rounded-2xl p-3 text-[11px] text-amber-800 leading-normal">
                  <Info className="h-4 w-4 text-amber-600 inline mr-1 mb-0.5" />
                  You must be signed in to purchase products. Please close the basket and sign in.
                </div>
              )}

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wider">Shipping Address</label>
                <div className="relative">
                  <div className="absolute top-3 left-3 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 text-stone-400" />
                  </div>
                  <textarea
                    required
                    rows={3}
                    placeholder="Enter full street, city, state, postal code..."
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="block w-full border border-stone-200 rounded-xl bg-white text-xs text-stone-900 placeholder-stone-400 pl-9 p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Payment Method Selection */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wider">Payment Method</label>
                <div className="bg-white p-3 rounded-xl border border-emerald-100 flex items-center gap-2.5">
                  <Wallet className="h-4 w-4 text-emerald-600" />
                  <div className="text-left leading-none">
                    <span className="text-xs font-semibold text-stone-800 block">Agrikart Secure Wallet</span>
                    <span className="text-[9px] text-stone-400 mt-0.5 block">Instant escrow release on delivery</span>
                  </div>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                type="submit"
                disabled={loading || !user || user.balance < cartTotal}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl text-xs tracking-tight transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? 'Authorizing escrow...' : 'Place Secure Order'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
