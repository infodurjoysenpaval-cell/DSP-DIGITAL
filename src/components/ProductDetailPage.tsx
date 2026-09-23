import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingCart,
  Zap,
  Flame,
  ShieldCheck,
  Clock,
  Laptop,
  Check,
  Share2,
  ChevronRight,
  ArrowLeft,
  MessageCircle,
  Sparkles,
  Eye,
  RefreshCw,
  Info,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Star
} from 'lucide-react';
import { Product, VariationItem } from '../types';
import { SHOP_INFO, PRODUCTS, CATEGORIES } from '../data/storeData';
import { ProductCard } from './ProductCard';
import { getVariationDimensions, findMatchingVariation } from '../utils/variationUtils';

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
  onSelectCategory: (categorySlug: string | null) => void;
  onAddToCart: (product: Product, variation?: VariationItem, quantity?: number) => void;
  onBuyNow: (product: Product, variation?: VariationItem, quantity?: number) => void;
  onOpenAffiliate?: () => void;
  isAffiliate?: boolean;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onBack,
  onSelectProduct,
  onSelectCategory,
  onAddToCart,
  onBuyNow,
  onOpenAffiliate,
  isAffiliate = false,
}) => {
  const [selectedVariation, setSelectedVariation] = useState<VariationItem | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [selectedValidity, setSelectedValidity] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Extract Plan & Validity/Month options
  const dimensions = getVariationDimensions(product);
  const plans = dimensions.plans;
  const validities = dimensions.validities;
  const planLabel = dimensions.planLabel;
  const validityLabel = dimensions.validityLabel;

  // Initialize variation and image when product changes
  useEffect(() => {
    if (product) {
      const dim = getVariationDimensions(product);
      const defaultP = dim.plans[0] || '';
      const defaultV = dim.validities[0] || '';

      setSelectedPlan(defaultP);
      setSelectedValidity(defaultV);

      const matched = findMatchingVariation(product, defaultP, defaultV);
      setSelectedVariation(matched || (product.variationList?.[0] ?? null));
      setSelectedImage(product.images?.[0] || '');
      setQuantity(1);
      setCopiedLink(false);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [product]);

  const hasVariations = Boolean(product.variationList && product.variationList.length > 0);

  // Price calculations
  const salePrice = selectedVariation
    ? selectedVariation.salePrice
    : product.salePrice || 0;
  const regularPrice = selectedVariation
    ? selectedVariation.regularPrice
    : product.regularPrice || 0;
  const discountPercent =
    regularPrice > salePrice && regularPrice > 0
      ? Math.round(((regularPrice - salePrice) / regularPrice) * 100)
      : 0;

  // View count
  const viewsCount = product.totalView || 2224;

  // Phone and WhatsApp link
  const phone = SHOP_INFO.whatsappNumber.replace(/[^0-9]/g, '');
  const varNameText = selectedVariation ? ` (${selectedVariation.name})` : '';
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
    `Hello DSP Digital Mart, I want to purchase "${product.name}"${varNameText} for ৳${salePrice}. Please provide payment & delivery details.`
  )}`;

  // Share handler
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Category name extraction
  const categoryName: string =
    (typeof product.category === 'object' && product.category !== null && product.category.name)
      ? product.category.name
      : product.categories?.[0]?.name || 'Ai Tools';

  const categorySlug: string =
    (typeof product.category === 'object' && product.category !== null && product.category.slug)
      ? product.category.slug
      : product.categories?.[0]?.slug || 'ai-tools';

  // Check tags
  const isHot =
    product.tags?.some((t) => t.name.toLowerCase().includes('hot')) ||
    product.name.toLowerCase().includes('gemini') ||
    discountPercent >= 70;

  const isFlash = product.tags?.some((t) => t.name.toLowerCase().includes('flash'));

  // Related products from same category or popular
  const relatedProducts = PRODUCTS.filter(
    (p) =>
      p._id !== product._id &&
      (p.category === product.category ||
        (typeof p.category === 'object' &&
          typeof product.category === 'object' &&
          p.category?.slug === product.category?.slug) ||
        p.categories?.some((c) => c.slug === categorySlug))
  ).slice(0, 4);

  // Fallback related products if none found
  const finalRelatedProducts =
    relatedProducts.length > 0
      ? relatedProducts
      : PRODUCTS.filter((p) => p._id !== product._id).slice(0, 4);

  // Standard FAQs if product doesn't have custom ones
  const faqs = product.faqList && product.faqList.length > 0
    ? product.faqList
    : [
        {
          question: 'How will I receive delivery after ordering?',
          answer:
            'After confirming your order, official invitation links, login credentials, or license keys are delivered to your provided email address and WhatsApp within 3 hours (usually within 15–30 minutes).',
        },
        {
          question: 'What is the warranty and validity policy?',
          answer:
            'All products include a 100% full replacement warranty for the entire validity period. If you experience any issues, our 24/7 WhatsApp customer support team provides immediate assistance.',
        },
        {
          question: 'Which payment methods are supported?',
          answer:
            'We support automated instant payments via bKash, Nagad, Rocket, debit/credit cards, and direct bank transfers.',
        },
      ];

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] pb-16">
      {/* Breadcrumbs Bar & Quick Back */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-slate-500">
          <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1.5">
            <button
              onClick={onBack}
              className="hover:text-blue-600 transition-colors font-medium flex items-center gap-1"
            >
              Home
            </button>
            <span className="text-slate-400">/</span>
            <button
              onClick={() => {
                onSelectCategory(categorySlug);
                onBack();
              }}
              className="hover:text-blue-600 transition-colors font-medium"
            >
              {categoryName}
            </button>
            <span className="text-slate-400">/</span>
            <span className="text-slate-800 font-semibold truncate max-w-[280px] sm:max-w-md">
              {product.name}
            </span>
          </nav>

          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full shadow-2xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Store</span>
          </button>
        </div>
      </div>

      {/* 3. Main Product Details (2-Column Hero Matching Image) */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left Column: Product Image Box */}
          <div className="lg:col-span-6 space-y-4">
            <div
              id="product-image-container"
              className="relative rounded-2xl sm:rounded-3xl bg-white overflow-hidden flex items-center justify-center p-2 sm:p-3"
            >
              {/* HOT / FLASH Badge Matching Image Top-Left */}
              {isHot ? (
                <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-[#FF5722] text-white px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-md">
                  <Flame className="w-3.5 h-3.5 fill-white text-white" />
                  <span>HOT</span>
                </div>
              ) : isFlash ? (
                <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-amber-500 text-white px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-md">
                  <Zap className="w-3.5 h-3.5 fill-white text-white" />
                  <span>FLASH</span>
                </div>
              ) : null}

              {/* Main Product Image */}
              <img
                src={selectedImage || product.images?.[0] || '/logo.png'}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-auto max-h-[460px] object-contain rounded-xl select-none transition-all duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    product.images?.[0] || '/logo.png';
                }}
              />
            </div>

            {/* Thumbnail Gallery (if multiple images) */}
            {product.images && product.images.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 overflow-hidden bg-slate-900 shrink-0 p-1.5 transition-all ${
                      selectedImage === img
                        ? 'border-[#FF6B00] ring-2 ring-[#FF6B00]/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} preview ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain rounded-xl"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Trust Points Under Image */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="bg-white p-3 rounded-2xl border border-slate-200 text-center shadow-2xs">
                <ShieldCheck className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <span className="text-[11px] font-semibold text-slate-700 block">100% Genuine</span>
                <span className="text-[10px] text-slate-400">Official Access</span>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-slate-200 text-center shadow-2xs">
                <Zap className="w-5 h-5 text-amber-500 mx-auto mb-1 fill-amber-500/20" />
                <span className="text-[11px] font-semibold text-slate-700 block">Fast Delivery</span>
                <span className="text-[10px] text-slate-400">Within 3 Hours</span>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-slate-200 text-center shadow-2xs">
                <RefreshCw className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <span className="text-[11px] font-semibold text-slate-700 block">Full Warranty</span>
                <span className="text-[10px] text-slate-400">Replacement Guarantee</span>
              </div>
            </div>
          </div>

          {/* Right Column: Product Details & Purchase Card */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col justify-between">
            <div>
              {/* Product Title */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#0F172A] leading-snug tracking-tight">
                {product.name}
              </h1>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mt-2">
                <div className="flex items-center gap-0.5 text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </div>
                <span className="text-slate-400 font-normal">({product.reviewTotal || 0} reviews)</span>
              </div>

              {/* Price Row (Matching Image) */}
              <div className="flex items-baseline flex-wrap gap-2.5 sm:gap-3 my-4">
                <span className="text-3xl sm:text-4xl font-black text-[#2563EB] tracking-tight">
                  ৳ {salePrice.toLocaleString()}
                </span>
                {regularPrice > salePrice && (
                  <>
                    <span className="text-xs sm:text-sm font-semibold text-[#FF7043] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded">
                      ৳ {(regularPrice - salePrice).toLocaleString()} Off
                    </span>
                    <span className="text-slate-400 line-through text-base font-normal">
                      ৳ {regularPrice.toLocaleString()}
                    </span>
                  </>
                )}
              </div>

              {/* Plan Selection Row (Matching Image) */}
              {plans.length > 0 && (
                <div className="my-3.5 flex items-center gap-3">
                  <span className="text-xs sm:text-sm font-semibold text-slate-700 min-w-[55px]">
                    {planLabel}:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {plans.map((p) => {
                      const isSelected = selectedPlan === p;
                      return (
                        <button
                          key={p}
                          id={`plan-btn-${p.replace(/\s+/g, '-').toLowerCase()}`}
                          onClick={() => {
                            setSelectedPlan(p);
                            const matched = findMatchingVariation(product, p, selectedValidity);
                            if (matched) setSelectedVariation(matched);
                          }}
                          className={`px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all border ${
                            isSelected
                              ? 'border-slate-300 text-slate-800 bg-white shadow-2xs ring-1 ring-slate-300 font-semibold'
                              : 'border-slate-200 text-slate-600 bg-white hover:border-slate-300 hover:text-slate-800'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Validity / Month Selection Row (Matching Image) */}
              {validities.length > 0 && (
                <div className="my-3.5 flex items-center gap-3">
                  <span className="text-xs sm:text-sm font-semibold text-slate-700 min-w-[55px]">
                    {validityLabel}:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {validities.map((v) => {
                      const isSelected = selectedValidity === v;
                      return (
                        <button
                          key={v}
                          id={`validity-btn-${v.replace(/\s+/g, '-').toLowerCase()}`}
                          onClick={() => {
                            setSelectedValidity(v);
                            const matched = findMatchingVariation(product, selectedPlan, v);
                            if (matched) setSelectedVariation(matched);
                          }}
                          className={`px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all border ${
                            isSelected
                              ? 'border-slate-300 text-slate-800 bg-white shadow-2xs ring-1 ring-slate-300 font-semibold'
                              : 'border-slate-200 text-slate-600 bg-white hover:border-slate-300 hover:text-slate-800'
                          }`}
                        >
                          {v}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center justify-between mt-5 py-2 px-1">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Quantity:
                </span>
                <div className="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden shadow-2xs">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30 text-sm font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3.5 py-1.5 text-xs sm:text-sm font-extrabold text-slate-800 min-w-[32px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 text-sm font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons: Add to Cart & Buy Now (Matching Image) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4">
                <button
                  id="product-page-add-to-cart-btn"
                  onClick={() => onAddToCart(product, selectedVariation || undefined, quantity)}
                  className="w-full py-3.5 px-6 rounded-full sm:rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm flex items-center justify-center gap-2 shadow-2xs hover:shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4 text-slate-700" />
                  <span>Add to Cart</span>
                </button>

                <button
                  id="product-page-buy-now-btn"
                  onClick={() => onBuyNow(product, selectedVariation || undefined, quantity)}
                  className="w-full py-3.5 px-6 rounded-full sm:rounded-xl bg-[#FF6B00] hover:bg-[#E65100] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Buy Now</span>
                </button>
              </div>

              {/* Direct WhatsApp Order */}
              <div className="mt-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Order via WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Share and Security Footer */}
            <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Verified Official Digital Asset</span>
              </span>

              <button
                onClick={handleShare}
                className="flex items-center gap-1 text-slate-600 hover:text-blue-600 font-medium transition-colors"
                title="Share product link"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Description Section (Matching Image) */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mb-4">
          Description
        </h2>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          {/* Main Description Text */}
          <div className="prose max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-4">
            {product.description ? (
              <div
                className="product-description-content"
                dangerouslySetInnerHTML={{
                  __html: product.description.replace(/\n/g, '<br />'),
                }}
              />
            ) : (
              <p>
                Get authentic premium access to cutting-edge digital services from DSP DIGITAL MART.
                Enjoy seamless activation, full validity coverage, prompt digital delivery, and dedicated 24/7 technical support.
              </p>
            )}
          </div>

          {/* Key Feature Badges Grid */}
          <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs sm:text-sm">
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 block">100% Official Premium Access</span>
                <span className="text-slate-500 text-xs">Official invitations or verified credentials delivered to your email</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 block">Fast Digital Delivery (Within 3 Hours)</span>
                <span className="text-slate-500 text-xs">Access details sent promptly to WhatsApp and email</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 block">Full Replacement Warranty</span>
                <span className="text-slate-500 text-xs">Guaranteed active coverage with instant technical assistance</span>
              </div>
            </div>
          </div>

          {/* Delivery & Activation Guide */}
          <div className="mt-6 p-5 rounded-2xl bg-blue-50/50 border border-blue-100 text-xs sm:text-sm text-slate-700 space-y-2">
            <h4 className="font-bold text-blue-900 flex items-center gap-1.5 text-sm">
              <Info className="w-4 h-4 text-blue-600" />
              <span>How will you receive access? (Delivery Process)</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-600">
              <li>Provide your active email address and WhatsApp number when placing your order.</li>
              <li>Once payment is confirmed, our automated system and dispatch team send official access details to you.</li>
              <li>Accept the invitation or sign in with your credentials to start enjoying full premium features immediately.</li>
            </ol>
          </div>

          {/* Frequently Asked Questions */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#0052FF]" />
              <span>Frequently Asked Questions (FAQ)</span>
            </h3>

            <div className="space-y-2">
              {faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className="border border-slate-200 rounded-2xl overflow-hidden transition-all bg-white"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full flex items-center justify-between p-4 text-left font-semibold text-xs sm:text-sm text-slate-800 hover:bg-slate-50 transition-colors"
                    >
                      <span>{faq.question}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-xs sm:text-sm text-slate-600 border-t border-slate-100 bg-slate-50/40 pt-3">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Related Products Section */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A]">
            Related Products
          </h2>
          <button
            onClick={() => {
              onSelectCategory(categorySlug);
              onBack();
            }}
            className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {finalRelatedProducts.map((relProd) => (
            <ProductCard
              key={relProd._id}
              product={relProd}
              onViewProduct={(p) => {
                onSelectProduct(p);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onAddToCart={(p, v) => onAddToCart(p, v, 1)}
              onQuickBuy={(p, v) => onBuyNow(p, v, 1)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
