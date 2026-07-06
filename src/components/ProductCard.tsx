import React from 'react';
import { Star, ShoppingCart, Eye } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  key?: string;
  product: Product;
  onViewDetails: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
  isBuyerOrGuest: boolean;
}

export default function ProductCard({
  product,
  onViewDetails,
  onQuickAdd,
  isBuyerOrGuest,
}: ProductCardProps) {
  const isOutOfStock = product.stock === 0;

  return (
    <div className="bg-white rounded-3xl border border-stone-200/50 shadow-xs hover:shadow-lg hover:border-emerald-500/20 transition-all duration-300 overflow-hidden flex flex-col group h-full">
      {/* Product Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-stone-100 shrink-0">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Category Badge */}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-stone-800 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-xs">
          {product.category}
        </span>

        {/* Out of Stock Badge */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-rose-600 text-white font-bold text-xs uppercase px-4 py-1.5 rounded-lg tracking-wider">
              Out of stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-4">
        <div className="space-y-1.5">
          {/* Supplier and Rating */}
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-emerald-700 font-semibold">{product.farmerName}</span>
            <div className="flex items-center gap-1 bg-stone-50 border border-stone-100 px-2 py-0.5 rounded-md font-bold text-amber-500">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
              <span>{product.rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Title */}
          <h4 
            onClick={() => onViewDetails(product)}
            className="text-stone-900 font-extrabold text-base tracking-tight hover:text-emerald-600 cursor-pointer line-clamp-1 leading-snug"
          >
            {product.name}
          </h4>

          {/* Description */}
          <p className="text-stone-500 text-xs line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price and Action Row */}
        <div className="flex items-end justify-between gap-2 border-t border-stone-100/60 pt-3.5 mt-auto">
          <div>
            <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block">Price</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-lg font-black font-display text-stone-950">₹{product.price.toFixed(2)}</span>
              <span className="text-stone-400 text-[11px]">/ {product.unit}</span>
            </div>
          </div>

          <div className="flex gap-1.5">
            <button
              onClick={() => onViewDetails(product)}
              className="p-2.5 bg-stone-50 hover:bg-stone-100 text-stone-600 rounded-xl transition-all border border-stone-200/40"
              title="View crop specifications"
            >
              <Eye className="h-4 w-4" />
            </button>

            {isBuyerOrGuest && (
              <button
                onClick={() => onQuickAdd(product)}
                disabled={isOutOfStock}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white p-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/10 flex items-center justify-center"
                title="Add 1 to basket"
              >
                <ShoppingCart className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
