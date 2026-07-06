import React, { useState, useEffect } from 'react';
import { X, Package, Clock, Truck, CheckCircle2, ShieldAlert, FileText, Calendar } from 'lucide-react';
import { Order, User } from '../types';

interface OrdersModalProps {
  user: User;
  token: string;
  onClose: () => void;
}

export default function OrdersModal({ user, token, onClose }: OrdersModalProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/orders', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch order history');
        }

        setOrders(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs" onClick={onClose} />

      {/* Modal */}
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden relative z-10 border border-stone-200/50 max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-stone-900 text-white p-5 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="bg-stone-800 p-2 rounded-xl border border-stone-700">
              <Package className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display tracking-tight">Your Order History</h2>
              <p className="text-[10px] text-stone-400 font-medium">Track your agricultural orders and delivery logs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white hover:bg-stone-800 p-1.5 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-stone-50/50 space-y-4">
          
          {error && (
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 flex items-start gap-2 text-rose-700 text-xs font-semibold">
              <ShieldAlert className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12 text-stone-500 text-xs font-medium space-y-2">
              <div className="animate-spin h-6 w-6 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto" />
              <span>Fetching order invoices...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <FileText className="h-10 w-10 text-stone-300 mx-auto" />
              <span className="text-stone-500 text-xs font-semibold block">No transactions logged yet</span>
              <p className="text-[10px] text-stone-400 max-w-xs mx-auto">Orders you place on the marketplace will be logged here with tracking.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl border border-stone-200/55 p-4.5 space-y-3.5 shadow-xs">
                  {/* Summary */}
                  <div className="flex justify-between items-start gap-2 border-b border-stone-100 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-stone-800">Order ID: #{order.id}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                          order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/20' :
                          order.status === 'Shipped' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/20' :
                          order.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border border-rose-200/20' :
                          'bg-amber-50 text-amber-700 border border-amber-200/20 animate-pulse'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-stone-400 font-medium">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-stone-400 block font-medium">Grand Total</span>
                      <span className="text-sm font-extrabold text-stone-900">₹{order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.productId} className="flex gap-3 items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-8 h-8 rounded-md object-cover border border-stone-100 shrink-0"
                          />
                          <span className="font-semibold text-stone-700 truncate max-w-[200px] sm:max-w-xs">{item.name}</span>
                        </div>
                        <span className="font-mono font-medium text-stone-500 shrink-0 text-[11px]">
                          {item.quantity}x • ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Tracking progress bar for pending/shipped/delivered */}
                  <div className="pt-2 border-t border-stone-100">
                    <div className="flex justify-between text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                      <span>In Processing</span>
                      <span>Dispatched</span>
                      <span>Delivered</span>
                    </div>
                    <div className="relative flex items-center justify-between">
                      <div className="absolute left-0 right-0 h-1 bg-stone-100 rounded-full z-0" />
                      <div className={`absolute left-0 h-1 bg-emerald-500 rounded-full z-0 transition-all duration-300`} style={{
                        width: order.status === 'Delivered' ? '100%' : order.status === 'Shipped' ? '50%' : '0%'
                      }} />
                      
                      {/* Step 1 */}
                      <div className="bg-white p-0.5 rounded-full z-10 border-2 border-emerald-500">
                        <Clock className="h-3 w-3 text-emerald-600" />
                      </div>
                      {/* Step 2 */}
                      <div className={`p-0.5 rounded-full z-10 border-2 bg-white ${
                        order.status === 'Shipped' || order.status === 'Delivered' ? 'border-emerald-500' : 'border-stone-200'
                      }`}>
                        <Truck className={`h-3 w-3 ${
                          order.status === 'Shipped' || order.status === 'Delivered' ? 'text-emerald-600' : 'text-stone-300'
                        }`} />
                      </div>
                      {/* Step 3 */}
                      <div className={`p-0.5 rounded-full z-10 border-2 bg-white ${
                        order.status === 'Delivered' ? 'border-emerald-500' : 'border-stone-200'
                      }`}>
                        <CheckCircle2 className={`h-3 w-3 ${
                          order.status === 'Delivered' ? 'text-emerald-600' : 'text-stone-300'
                        }`} />
                      </div>
                    </div>
                  </div>

                  {/* Shipping address details */}
                  <div className="text-[11px] text-stone-500 bg-stone-50 p-2.5 rounded-xl border border-stone-200/30">
                    <span className="font-bold text-stone-700 block text-[9px] uppercase tracking-wide mb-0.5">Shipping to</span>
                    <span className="leading-normal">{order.shippingAddress}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
