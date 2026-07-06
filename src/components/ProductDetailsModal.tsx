import React, { useState } from 'react';
import { X, Star, Calendar, MessageSquare, Plus, Minus, ShoppingCart, ShieldAlert } from 'lucide-react';
import { Product, User } from '../types';

interface ProductDetailsModalProps {
  product: Product;
  user: User | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onReviewAdded: (updatedProduct: Product) => void;
  token: string | null;
}

export default function ProductDetailsModal({
  product,
  user,
  onClose,
  onAddToCart,
  onReviewAdded,
  token,
}: ProductDetailsModalProps) {
  const [qty, setQty] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const handleQtyChange = (val: number) => {
    if (val < 1) return;
    if (val > product.stock) return;
    setQty(val);
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setReviewError(null);
    setReviewLoading(true);

    try {
      const response = await fetch(`/api/products/${product.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      onReviewAdded(data);
      setReviewComment('');
      setReviewRating(5);
    } catch (err: any) {
      setReviewError(err.message);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleAddToCartClick = () => {
    setAddingToCart(true);
    onAddToCart(product, qty);
    setTimeout(() => {
      setAddingToCart(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs" onClick={onClose} />

      {/* Modal */}
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden relative z-10 border border-stone-200/50 max-h-[90vh] flex flex-col md:flex-row animate-in zoom-in-95 duration-150">
        
        {/* Left Side: Image and Quick Stats */}
        <div className="w-full md:w-1/2 bg-stone-100 relative h-64 md:h-auto min-h-[250px] flex flex-col">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover absolute inset-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          
          <button
            onClick={onClose}
            className="absolute left-4 top-4 md:hidden bg-stone-900/60 text-white p-2 rounded-full hover:bg-stone-900 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Overlay info */}
          <div className="mt-auto p-6 relative z-10 text-white">
            <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider mb-2 inline-block">
              {product.category}
            </span>
            <h1 className="text-xl md:text-2xl font-bold font-display tracking-tight leading-tight">
              {product.name}
            </h1>
            <p className="text-xs text-stone-200 mt-1">
              Supplied by <span className="font-semibold text-white">{product.farmerName}</span>
            </p>
          </div>
        </div>

        {/* Right Side: Product Details & Reviews Scroll Area */}
        <div className="w-full md:w-1/2 flex flex-col max-h-[90vh]">
          {/* Top Header for Desktop */}
          <div className="hidden md:flex items-center justify-between p-6 pb-4 border-b border-stone-100">
            <div className="text-xs font-semibold text-stone-400 uppercase tracking-widest">
              PRODUCT DETAILS
            </div>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-700 hover:bg-stone-100 p-1.5 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Details Scroll Content */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            
            {/* Price and Stock */}
            <div className="flex justify-between items-end">
              <div>
                <span className="text-stone-400 text-xs block font-medium">Price per {product.unit}</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold font-display text-stone-900">₹{product.price.toFixed(2)}</span>
                  <span className="text-stone-500 text-sm font-medium">/ {product.unit}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-stone-400 text-xs block font-medium">Availability</span>
                {product.stock > 0 ? (
                  <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-md mt-1 ${
                    product.stock <= 10 
                      ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {product.stock} {product.unit}s left
                  </span>
                ) : (
                  <span className="inline-block text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-md mt-1">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Description</span>
              <p className="text-stone-600 text-sm leading-relaxed">{product.description}</p>
            </div>

            {/* Star Rating summary */}
            <div className="flex items-center gap-2 bg-stone-50 p-3.5 rounded-2xl border border-stone-200/50">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4.5 w-4.5 ${
                      i < Math.floor(product.rating) ? 'fill-amber-500 text-amber-500' : 'text-stone-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-stone-800">{product.rating.toFixed(1)}</span>
              <span className="text-xs text-stone-400">({product.reviewsCount} reviews)</span>
            </div>

            {/* Add to Cart Controls (only for buyers/guests) */}
            {(!user || user.role === 'buyer') && (
              <div className="space-y-3.5 pt-2 border-t border-stone-100">
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Purchase quantity</span>
                <div className="flex gap-3">
                  <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden bg-stone-50">
                    <button
                      onClick={() => handleQtyChange(qty - 1)}
                      disabled={qty <= 1 || product.stock === 0}
                      className="p-3 hover:bg-stone-100 text-stone-500 disabled:opacity-30 transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center font-bold text-sm text-stone-800">{qty}</span>
                    <button
                      onClick={() => handleQtyChange(qty + 1)}
                      disabled={qty >= product.stock || product.stock === 0}
                      className="p-3 hover:bg-stone-100 text-stone-500 disabled:opacity-30 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCartClick}
                    disabled={product.stock === 0 || addingToCart}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm px-6 py-3 flex items-center justify-center gap-2.5 transition-all disabled:opacity-40 shadow-md shadow-emerald-600/10"
                  >
                    <ShoppingCart className="h-4.5 w-4.5" />
                    {addingToCart ? 'Adding...' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="pt-4 border-t border-stone-100">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-3">
                Customer Reviews
              </span>

              {product.reviews.length === 0 ? (
                <div className="text-center py-6 text-stone-400 text-xs">
                  No reviews yet. Be the first to review this product!
                </div>
              ) : (
                <div className="space-y-4">
                  {product.reviews.map((rev) => (
                    <div key={rev.id} className="bg-stone-50 p-3.5 rounded-2xl border border-stone-100">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-xs font-bold text-stone-800">{rev.userName}</span>
                        <div className="flex items-center text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < rev.rating ? 'fill-amber-500 text-amber-500' : 'text-stone-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-stone-600 text-xs mt-1.5 leading-relaxed">{rev.comment}</p>
                      <span className="text-[10px] text-stone-400 block mt-2">{rev.createdAt}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Write a Review Form (If logged in) */}
            {token ? (
              <div className="pt-4 border-t border-stone-100">
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-3">
                  Write a Review
                </span>

                {reviewError && (
                  <div className="mb-3 p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 text-rose-500" />
                    <span>{reviewError}</span>
                  </div>
                )}

                <form onSubmit={handleAddReview} className="space-y-3">
                  {/* Rating selection */}
                  <div>
                    <label className="text-xs text-stone-500 font-medium block mb-1">Your Rating</label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="text-amber-500 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              star <= reviewRating ? 'fill-amber-500 text-amber-500' : 'text-stone-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <textarea
                      required
                      rows={3}
                      placeholder="Share your experience with this agricultural product..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="block w-full border border-stone-200 rounded-xl bg-stone-50 text-xs text-stone-900 placeholder-stone-400 p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white transition-all resize-none"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={reviewLoading}
                    className="bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {reviewLoading ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200/50 rounded-2xl text-[11px] text-amber-800 text-center">
                Please sign in to write customer reviews and rate this product.
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
