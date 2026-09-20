import React from 'react';
import { Product, VariationItem } from '../types';

interface ProductCardProps {
  product: Product;
  onViewProduct: (product: Product) => void;
  onAddToCart: (product: Product, variation?: VariationItem) => void;
  onQuickBuy: (product: Product, variation?: VariationItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewProduct,
  onAddToCart,
  onQuickBuy,
}) => {
  const hasVariations = product.variationList && product.variationList.length > 0;

  // Calculate default variation and pricing
  const defaultVar = hasVariations
    ? product.variationList?.find((v) => v.isDefault) || product.variationList![0]
    : null;

  const salePrice = defaultVar ? defaultVar.salePrice : (product.salePrice || 0);
  const regularPrice = defaultVar ? defaultVar.regularPrice : (product.regularPrice || 0);

  // Discount percentage
  const discountPercent = regularPrice > salePrice && regularPrice > 0
    ? Math.round(((regularPrice - salePrice) / regularPrice) * 100)
    : 0;

  // Price range if variations exist
  let priceDisplay = `৳ ${salePrice.toLocaleString()}`;
  let hasPriceRange = false;

  if (hasVariations && product.variationList && product.variationList.length > 0) {
    const salePrices = product.variationList.map((v) => v.salePrice).filter((p) => p > 0);
    if (salePrices.length > 0) {
      const minP = Math.min(...salePrices);
      const maxP = Math.max(...salePrices);
      if (minP < maxP) {
        priceDisplay = `৳ ${minP.toLocaleString()} – ৳ ${maxP.toLocaleString()}`;
        hasPriceRange = true;
      } else {
        priceDisplay = `৳ ${minP.toLocaleString()}`;
      }
    }
  }

  return (
    <div
      id={`product-card-${product._id}`}
      className="group bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden relative"
    >
      {/* Image Container with Discount Badge */}
      <div
        onClick={() => onViewProduct(product)}
        className="relative aspect-square w-full bg-white cursor-pointer overflow-hidden flex items-center justify-center p-3 sm:p-4"
      >
        {/* Discount Badge on Top-Left */}
        {discountPercent > 0 && (
          <div className="absolute top-0 left-0 z-10">
            <span className="inline-block bg-[#00A3FF] text-white text-xs sm:text-sm font-semibold px-3 py-1 rounded-tl-xl rounded-br-2xl shadow-2xs">
              -{discountPercent}% OFF
            </span>
          </div>
        )}

        <img
          src={product.images[0]}
          alt={product.name}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Details Container */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between bg-white">
        <div>
          {/* Product Name (2 lines properly formatted as per reference image) */}
          <h3
            onClick={() => onViewProduct(product)}
            className="text-xs sm:text-sm font-normal text-slate-900 group-hover:text-[#2563EB] transition-colors line-clamp-2 min-h-[2.5rem] leading-snug cursor-pointer"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Pricing Row (Centered directly above Buy Now button) */}
          <div className="text-center my-2.5 sm:my-3 flex items-center justify-center gap-2">
            <span className="text-base sm:text-lg font-normal text-slate-900 tracking-tight">
              {priceDisplay}
            </span>
            {regularPrice > salePrice && !hasPriceRange && (
              <span className="text-xs sm:text-sm font-normal text-slate-400 line-through">
                ৳ {regularPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Buttons (Top: Buy Now, Bottom: Add to cart) */}
        <div className="space-y-2 pt-1">
          <button
            id={`buy-now-${product._id}`}
            onClick={() => onQuickBuy(product, defaultVar || undefined)}
            className="w-full py-2.5 px-3 bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.98] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-2xs transition-all text-center"
          >
            Buy Now
          </button>

          <button
            id={`add-cart-${product._id}`}
            onClick={() => onAddToCart(product, defaultVar || undefined)}
            className="w-full py-2.5 px-3 bg-[#00A3FF] hover:bg-[#008AE6] active:scale-[0.98] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-2xs transition-all text-center"
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
};
