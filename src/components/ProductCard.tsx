import React from 'react';
import { ShoppingBag, Eye, Zap, Check, MessageCircle } from 'lucide-react';
import { Product, VariationItem } from '../types';
import { SHOP_INFO } from '../data/storeData';

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

  // Calculate pricing
  const defaultVar = hasVariations
    ? product.variationList?.find((v) => v.isDefault) || product.variationList![0]
    : null;

  const salePrice = defaultVar ? defaultVar.salePrice : (product.salePrice || 0);
  const regularPrice = defaultVar ? defaultVar.regularPrice : (product.regularPrice || 0);

  // Discount percentage
  const discountPercent = regularPrice > salePrice && regularPrice > 0
    ? Math.round(((regularPrice - salePrice) / regularPrice) * 100)
    : 0;

  const isFlashSale = product.tags?.some((t) => t.name.toLowerCase().includes('flash'));
  const isNewArrival = product.tags?.some((t) => t.name.toLowerCase().includes('new'));

  const phone = SHOP_INFO.whatsappNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
    `Hello DSP Digital Mart! I want to order "${product.name}" (Price: ৳${salePrice}). Please assist me.`
  )}`;

  return (
    <div
      id={`product-card-${product._id}`}
      className="group bg-white rounded-2xl border border-[#E2E8F0] hover:border-[#3B82F6] shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden relative"
    >
      {/* Top Badges matching Image 1 */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 pointer-events-none">
        {discountPercent > 0 && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] sm:text-xs font-offer-text bg-rose-500 text-white shadow-2xs">
            -{discountPercent}% OFF
          </span>
        )}
        {isFlashSale && (
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-offer-text bg-amber-500 text-white shadow-2xs">
            <Zap className="w-2.5 h-2.5 fill-current text-white" /> Flash Sale
          </span>
        )}
      </div>

      {/* 24/7 Badge on Top Right matching Image 1 */}
      <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-offer-text bg-slate-900/85 text-white backdrop-blur-xs shadow-2xs">
          24/7
        </span>
      </div>

      {/* Image with quick view trigger */}
      <div
        onClick={() => onViewProduct(product)}
        className="relative aspect-square w-full bg-white cursor-pointer overflow-hidden flex items-center justify-center p-3 sm:p-4 border-b border-slate-100"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Quick view overlay button */}
        <div className="absolute inset-0 bg-slate-900/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <span className="px-3 py-1.5 bg-white text-slate-900 text-xs font-btn-text rounded-full shadow-md flex items-center gap-1 hover:bg-blue-600 hover:text-white transition-colors">
            <Eye className="w-3.5 h-3.5" /> বিস্তারিত দেখুন
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Product Title matching Image 1 */}
          <h3
            onClick={() => onViewProduct(product)}
            className="text-xs sm:text-sm font-sub-heading text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 cursor-pointer leading-snug min-h-[2.5rem]"
            title={product.name}
          >
            {product.name}
          </h3>
        </div>

        {/* Pricing & Actions matching Image 1 */}
        <div className="mt-3 pt-2.5">
          {/* Price line: Bold current price + strikethrough regular price */}
          <div className="flex items-baseline justify-center gap-2 mb-3">
            <span className="text-base sm:text-lg font-price-text text-slate-900 tracking-tight">
              ৳ {salePrice.toLocaleString()}
            </span>
            {regularPrice > salePrice && (
              <span className="text-xs sm:text-sm font-price-text text-slate-400 line-through">
                ৳ {regularPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Two Stacked Full-Width Buttons: Buy Now (Brand Blue) & Add to cart (Harmonious Sky Blue) */}
          <div className="space-y-2">
            <button
              id={`buy-now-${product._id}`}
              onClick={() => onQuickBuy(product, defaultVar || undefined)}
              className="w-full py-2.5 px-3 bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.98] text-white text-xs sm:text-sm font-btn-text rounded-xl shadow-xs hover:shadow transition-all text-center flex items-center justify-center gap-1.5"
            >
              <span>Buy Now</span>
            </button>

            <button
              id={`add-cart-${product._id}`}
              onClick={() => onAddToCart(product, defaultVar || undefined)}
              className="w-full py-2.5 px-3 bg-[#0284C7] hover:bg-[#0369A1] active:scale-[0.98] text-white text-xs sm:text-sm font-btn-text rounded-xl transition-all text-center flex items-center justify-center gap-1.5 shadow-2xs"
              title="Add to cart"
            >
              <span>Add to cart</span>
            </button>
          </div>

          {/* WhatsApp Direct order link */}
          <div className="mt-2.5 text-center">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-body-text text-slate-500 hover:text-emerald-700 transition-colors"
            >
              <MessageCircle className="w-3 h-3 text-emerald-600" />
              <span>হোয়াটসঅ্যাপে প্রশ্ন করুন</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
