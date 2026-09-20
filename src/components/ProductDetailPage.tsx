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
  ExternalLink
} from 'lucide-react';
import { Product, VariationItem } from '../types';
import { SHOP_INFO, PRODUCTS, CATEGORIES } from '../data/storeData';
import { ProductCard } from './ProductCard';

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
  onSelectCategory: (categorySlug: string | null) => void;
  onAddToCart: (product: Product, variation?: VariationItem, quantity?: number) => void;
  onBuyNow: (product: Product, variation?: VariationItem, quantity?: number) => void;
  onOpenAffiliate?: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onBack,
  onSelectProduct,
  onSelectCategory,
  onAddToCart,
  onBuyNow,
  onOpenAffiliate,
}) => {
  const [selectedVariation, setSelectedVariation] = useState<VariationItem | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Initialize variation and image when product changes
  useEffect(() => {
    if (product) {
      const defaultVar =
        product.variationList && product.variationList.length > 0
          ? product.variationList.find((v) => v.isDefault) || product.variationList[0]
          : null;
      setSelectedVariation(defaultVar || null);
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
          question: 'অর্ডার করার পর ডেলিভারি কীভাবে পাব?',
          answer:
            'অর্ডার কনফার্ম করার পর সর্বোচ্চ ৩ ঘণ্টার মধ্যে (সাধারণত ৩০ মিনিটের ভেতর) আপনার প্রদত্ত ইমেইল ও হোয়াটসঅ্যাপে অফিশিয়াল ইনভাইটেশন লিংক অথবা লাইসেন্স কী পাঠানো হবে।',
        },
        {
          question: 'এটির মেয়াদ এবং ওয়ারেন্টি পলিসি কী?',
          answer:
            'সম্পূর্ণ মেয়াদের জন্য ১০০% রিপ্লেসমেন্ট গ্যারান্টি প্রদান করা হয়। কোনো সমস্যা হলে আমাদের ২৪/৭ হোয়াটসঅ্যাপ সাপোর্ট টিমের মাধ্যমে তাৎক্ষণিক সমাধান পাবেন।',
        },
        {
          question: 'পেমেন্ট মেথড কী কী সাপোর্টেড?',
          answer:
            'বিকাশ (bKash), নগদ (Nagad), রকেট (Rocket) এবং কার্ড পেমেন্টের মাধ্যমে খুব সহজে নিরাপদ পেমেন্ট করতে পারবেন।',
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
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full shadow-2xs transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Store (তালিকায় ফিরুন)</span>
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
              className="relative rounded-3xl bg-[#0F172A] border border-slate-200 overflow-hidden shadow-sm flex items-center justify-center p-4 sm:p-6 min-h-[380px] sm:min-h-[440px]"
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
                src={selectedImage || product.images[0]}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-auto max-h-[440px] object-contain rounded-2xl select-none transition-all duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    product.images[0] || '/logo.png';
                }}
              />
            </div>

            {/* Thumbnail Gallery (if multiple images) */}
            {product.images.length > 1 && (
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
              <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-[#0F172A] leading-tight tracking-tight">
                {product.name}
              </h1>

              {/* Views Count */}
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 mt-2.5 font-medium">
                <Eye className="w-4 h-4 text-slate-400" />
                <span>{viewsCount.toLocaleString()} views</span>
              </div>

              {/* Variation / Plan Selector (Matching Image) */}
              <div className="mt-6">
                <div className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                  SELECT PLAN
                </div>

                {hasVariations ? (
                  <div className="flex flex-wrap items-center gap-2.5">
                    {product.variationList!.map((v) => {
                      const isSelected = selectedVariation?._id === v._id;
                      return (
                        <button
                          key={v._id}
                          id={`plan-btn-${v._id}`}
                          onClick={() => setSelectedVariation(v)}
                          className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                            isSelected
                              ? 'border-2 border-[#FF6B00] text-[#FF6B00] bg-orange-50/50 shadow-2xs'
                              : 'border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {v.name}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="inline-flex">
                    <span className="px-5 py-2 rounded-full text-xs sm:text-sm font-semibold border-2 border-[#FF6B00] text-[#FF6B00] bg-orange-50/50">
                      Standard Plan
                    </span>
                  </div>
                )}
              </div>

              {/* Price & Stock Box (Exact Match to User Screenshot) */}
              <div className="mt-6 rounded-2xl border border-slate-200/90 bg-slate-50/60 p-4 sm:p-5">
                {/* Upper Price Row */}
                <div className="flex items-baseline flex-wrap gap-2 sm:gap-3">
                  <span className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
                    ৳{salePrice.toLocaleString()}
                  </span>
                  {regularPrice > salePrice && (
                    <span className="text-slate-400 line-through text-base sm:text-lg font-medium">
                      ৳{regularPrice.toLocaleString()}
                    </span>
                  )}
                  {discountPercent > 0 && (
                    <span className="bg-[#EF4444] text-white text-xs font-black px-2.5 py-0.5 rounded-full shadow-2xs">
                      -{discountPercent}%
                    </span>
                  )}
                </div>

                {/* Thin Divider */}
                <div className="border-b border-slate-200/80 my-3.5" />

                {/* Stock & Delivery Row */}
                <div className="flex items-center justify-between flex-wrap gap-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                    <Laptop className="w-4 h-4 shrink-0" />
                    <span>Unlimited stock</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Manual delivery within 3 hours</span>
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center justify-between mt-5 py-2 px-1">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Quantity (পরিমাণ):
                </span>
                <div className="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden shadow-2xs">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30 text-sm font-bold"
                  >
                    -
                  </button>
                  <span className="px-3.5 py-1.5 text-xs sm:text-sm font-extrabold text-slate-800 min-w-[32px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 text-sm font-bold"
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
                  className="w-full py-3.5 px-6 rounded-full sm:rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm flex items-center justify-center gap-2 shadow-2xs hover:shadow-xs transition-all active:scale-[0.98]"
                >
                  <ShoppingCart className="w-4 h-4 text-slate-700" />
                  <span>Add to Cart</span>
                </button>

                <button
                  id="product-page-buy-now-btn"
                  onClick={() => onBuyNow(product, selectedVariation || undefined, quantity)}
                  className="w-full py-3.5 px-6 rounded-full sm:rounded-xl bg-[#FF6B00] hover:bg-[#E65100] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
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
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Order via WhatsApp / হোয়াটসঅ্যাপে সরাসরি প্রশ্ন ও অর্ডার করুন</span>
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
                গুগলের শক্তিশালী AI মডেল Gemini 3 Pro সহ Google AI Pro এর Premium Access নিন BM DIGITAL / DSP DIGITAL MART থেকে।
                এর সাথে পাবেন Google Flow, প্রতি মাসে 1,000 Flow Credits, 5TB Storage, Google AI Studio, NotebookLM, Jules,
                Antigravity এবং আরও অনেক Premium AI সুবিধা।
              </p>
            )}
          </div>

          {/* Key Feature Badges Grid */}
          <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs sm:text-sm">
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 block">১০০% অফিশিয়াল প্রিমিয়াম অ্যাক্সেস</span>
                <span className="text-slate-500 text-xs">আপনার নিজস্ব ইমেইলে ইনভাইটেশন বা অফিশিয়াল ক্রেডেনশিয়াল</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 block">ইনস্ট্যান্ট ডেলিভারি (৩ ঘণ্টার মধ্যে)</span>
                <span className="text-slate-500 text-xs">অর্ডার করার পরপরই হোয়াটসঅ্যাপ ও ইমেইলে অ্যাক্সেস পাঠানো হয়</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 block">ফুল রিপ্লেসমেন্ট ওয়ারেন্টি</span>
                <span className="text-slate-500 text-xs">মেয়াদকালীন যেকোনো সমস্যায় তাৎক্ষণিক সাপোর্ট গ্যারান্টি</span>
              </div>
            </div>
          </div>

          {/* Delivery & Activation Guide */}
          <div className="mt-6 p-5 rounded-2xl bg-blue-50/50 border border-blue-100 text-xs sm:text-sm text-slate-700 space-y-2">
            <h4 className="font-bold text-blue-900 flex items-center gap-1.5 text-sm">
              <Info className="w-4 h-4 text-blue-600" />
              <span>কীভাবে অ্যাক্সেস পাবেন? (ডেলিভারি প্রসেস)</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-600">
              <li>অর্ডার করার সময় আপনার সচল ইমেইল অ্যাড্রেস ও হোয়াটসঅ্যাপ নম্বর দিন।</li>
              <li>পেমেন্ট কনফার্ম হলে আমাদের টিম আপনার ইমেইলে অফিশিয়াল ইনভাইটেশন বা লগইন ডিটেইলস পাঠাবে।</li>
              <li>ইনভাইটেশন লিঙ্ক একসেপ্ট করে সাথে সাথে প্রিমিয়াম ফিচারের সম্পূর্ণ সুবিধা উপভোগ করুন।</li>
            </ol>
          </div>

          {/* Frequently Asked Questions */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#FF6B00]" />
              <span>সাধারণ জিজ্ঞাসা (FAQ)</span>
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
            Related Products (সম্পর্কিত ডিজিটাল সেবা)
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
