import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Check, ShieldCheck, Zap, MessageCircle, ChevronDown, ChevronUp, Share2 } from 'lucide-react';
import { Product, VariationItem } from '../types';
import { SHOP_INFO } from '../data/storeData';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, variation?: VariationItem, quantity?: number) => void;
  onBuyNow: (product: Product, variation?: VariationItem, quantity?: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
}) => {
  const [selectedVariation, setSelectedVariation] = useState<VariationItem | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'faq' | 'warranty'>('desc');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (product) {
      const defaultVar = product.variationList && product.variationList.length > 0
        ? product.variationList.find((v) => v.isDefault) || product.variationList[0]
        : null;
      setSelectedVariation(defaultVar || null);
      setSelectedImage(product.images[0] || '');
      setQuantity(1);
      setActiveTab('desc');
      setOpenFaqIndex(0);
      setCopiedLink(false);
      // Lock body scroll
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [product]);

  if (!product) return null;

  const salePrice = selectedVariation ? selectedVariation.salePrice : (product.salePrice || 0);
  const regularPrice = selectedVariation ? selectedVariation.regularPrice : (product.regularPrice || 0);
  const discountPercent = regularPrice > salePrice && regularPrice > 0
    ? Math.round(((regularPrice - salePrice) / regularPrice) * 100)
    : 0;

  const phone = SHOP_INFO.whatsappNumber.replace(/[^0-9]/g, '');
  const varText = selectedVariation ? ` (${selectedVariation.name})` : '';
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
    `Hello DSP Digital Mart, I want to purchase "${product.name}"${varText} for ৳${salePrice}. Please provide payment and delivery details.`
  )}`;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="product-detail-modal"
        className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            ডিজিটাল প্রোডাক্ট বিস্তারিত (Product Details)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors relative"
              title="Share Link"
            >
              <Share2 className="w-4 h-4" />
              {copiedLink && (
                <span className="absolute -top-7 right-0 bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded shadow">
                  লিংক কপি হয়েছে!
                </span>
              )}
            </button>
            <button
              id="close-product-modal-btn"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
              aria-label="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Left: Image Gallery */}
            <div className="space-y-3">
              <div className="aspect-square bg-slate-50 rounded-2xl border border-slate-200 p-4 flex items-center justify-center overflow-hidden">
                <img
                  src={selectedImage || product.images[0]}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(img)}
                      className={`w-16 h-16 rounded-xl border-2 p-1 bg-white shrink-0 transition-all ${
                        selectedImage === img ? 'border-blue-600 scale-105 shadow-xs' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" referrerPolicy="no-referrer" className="w-full h-full object-contain rounded-lg" />
                    </button>
                  ))}
                </div>
              )}

              {/* Assurance Callout */}
              <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-3.5 space-y-2 text-xs text-blue-900">
                <div className="flex items-center gap-2 font-bold text-blue-700">
                  <ShieldCheck className="w-4 h-4" /> ১০০% সুরক্ষিত ও অফিসিয়াল এক্সেস
                </div>
                <p className="text-blue-800/80 leading-relaxed text-[11px]">
                  অর্ডার কনফার্ম করার পর আপনার ইমেইল বা হোয়াটসঅ্যাপে অফিসিয়াল লাইসেন্স কী অথবা লগইন তথ্য সরবরাহ করা হবে।
                </p>
              </div>
            </div>

            {/* Right: Info & Purchase Controls */}
            <div className="flex flex-col justify-between">
              <div>
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {discountPercent > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-offer-text bg-red-600 text-white">
                      {discountPercent}% ছাড়
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-btn-text bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <Check className="w-3 h-3 stroke-[3]" /> ইন স্টক / ইনস্ট্যান্ট
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-lg sm:text-xl font-main-heading text-slate-900 leading-snug">
                  {product.name}
                </h1>

                {/* Pricing Display */}
                <div className="mt-3 p-3 bg-white rounded-2xl border border-slate-200 flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-price-text text-[#0F172A]">
                    ৳{salePrice.toLocaleString()}
                  </span>
                  {regularPrice > salePrice && (
                    <span className="text-sm sm:text-base font-price-text text-slate-400 line-through">
                      ৳{regularPrice.toLocaleString()}
                    </span>
                  )}
                  {discountPercent > 0 && (
                    <span className="text-xs font-price-text text-blue-600">
                      (সাশ্রয়: ৳{(regularPrice - salePrice).toLocaleString()})
                    </span>
                  )}
                </div>

                {/* Variations Selector */}
                {product.variationList && product.variationList.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <label className="text-xs font-sub-heading text-[#0F172A] block uppercase tracking-wider">
                      প্যাকেজ / সাবস্ক্রিপশন প্ল্যান নির্বাচন করুন:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {product.variationList.map((item) => {
                        const isSelected = selectedVariation?._id === item._id;
                        return (
                          <button
                            key={item._id}
                            id={`var-btn-${item._id}`}
                            onClick={() => setSelectedVariation(item)}
                            className={`px-3 py-2.5 rounded-xl border text-left transition-all ${
                              isSelected
                                ? 'border-[#3B82F6] bg-[#3B82F6]/10 text-[#0F172A] ring-2 ring-[#3B82F6]/30 shadow-xs'
                                : 'border-slate-200 bg-white hover:border-blue-400 text-slate-700'
                            }`}
                          >
                            <div className="text-xs font-body-text">{item.name}</div>
                            <div className="text-xs font-price-text text-[#0F172A] mt-0.5">
                              ৳{item.salePrice.toLocaleString()}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="mt-4 flex items-center gap-3">
                  <label className="text-xs font-sub-heading text-[#0F172A] uppercase tracking-wider">
                    পরিমাণ:
                  </label>
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1 text-slate-600 hover:bg-slate-100 font-btn-text text-sm"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 font-price-text text-sm text-[#0F172A]">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-1 text-slate-600 hover:bg-slate-100 font-btn-text text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 space-y-2.5">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    id="modal-buy-now-btn"
                    onClick={() => onBuyNow(product, selectedVariation || undefined, quantity)}
                    className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.98] text-white font-btn-text text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>এখনই কিনুন</span>
                  </button>

                  <button
                    id="modal-add-cart-btn"
                    onClick={() => onAddToCart(product, selectedVariation || undefined, quantity)}
                    className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-400 active:scale-[0.98] text-[#0F172A] font-btn-text text-sm rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#2563EB]" />
                    <span>কার্টে যোগ করুন</span>
                  </button>
                </div>

                {/* Direct WhatsApp Order */}
                <a
                  id="modal-whatsapp-order-btn"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-btn-text text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>সরাসরি হোয়াটসঅ্যাপে অর্ডার করুন</span>
                </a>
              </div>
            </div>
          </div>

          {/* Tabbed Content: Description, Specs, FAQs, Warranty */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            {/* Tabs Navigation */}
            <div className="flex border-b border-slate-200 gap-4 mb-4">
              <button
                onClick={() => setActiveTab('desc')}
                className={`pb-2.5 text-xs sm:text-sm font-nav-text transition-colors relative ${
                  activeTab === 'desc'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-500 hover:text-[#0F172A]'
                }`}
              >
                বিস্তারিত বিবরণ (Description)
              </button>

              {product.faqList && product.faqList.length > 0 && (
                <button
                  onClick={() => setActiveTab('faq')}
                  className={`pb-2.5 text-xs sm:text-sm font-nav-text transition-colors relative ${
                    activeTab === 'faq'
                      ? 'text-[#3B82F6] border-b-2 border-[#3B82F6]'
                      : 'text-slate-500 hover:text-[#0F172A]'
                  }`}
                >
                  প্রশ্নোত্তর (FAQ - {product.faqList.length})
                </button>
              )}

              <button
                onClick={() => setActiveTab('warranty')}
                className={`pb-2.5 text-xs sm:text-sm font-nav-text transition-colors relative ${
                  activeTab === 'warranty'
                    ? 'text-[#3B82F6] border-b-2 border-[#3B82F6]'
                    : 'text-slate-500 hover:text-[#0F172A]'
                }`}
              >
                ডেলিভারি ও সাপোর্ট
              </button>
            </div>

            {/* Tab: Description */}
            {activeTab === 'desc' && (
              <div className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed text-slate-700 space-y-3">
                {product.description ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: product.description }}
                    className="overflow-x-auto"
                  />
                ) : (
                  <p>{product.seoDescription || product.shortDescription || 'অফিসিয়াল ও নির্ভরযোগ্য ডিজিটাল সার্ভিস।'}</p>
                )}

                {product.seoKeyword && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400">ট্যাগস: </span>
                    <span className="text-[11px] text-slate-500">
                      {product.seoKeyword.split(',').slice(0, 10).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Tab: FAQ */}
            {activeTab === 'faq' && product.faqList && (
              <div className="space-y-2.5">
                {product.faqList.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50"
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full px-4 py-3 text-left text-xs sm:text-sm font-sub-heading text-slate-800 flex items-center justify-between hover:bg-slate-100/70 transition-colors"
                      >
                        <span>{faq.question}</span>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-3.5 pt-1 text-xs font-body-text text-slate-600 leading-relaxed border-t border-slate-100 bg-white">
                          <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab: Warranty & Support */}
            {activeTab === 'warranty' && (
              <div className="text-xs sm:text-sm text-slate-700 space-y-3 font-body-text">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5">
                  <h4 className="font-sub-heading text-emerald-800">✅ ওয়ারেন্টি ও রিপ্লেসমেন্ট পলিসি</h4>
                  <p className="text-emerald-700 text-xs font-body-text">
                    প্রতিটি ডিজিটাল প্রোডাক্ট ও সাবস্ক্রিপশনে নির্দিষ্ট মেয়াদের জন্য ফুল-টাইম ওয়ারেন্টি এবং প্রতিস্থাপন সাপোর্ট প্রদান করা হয়।
                  </p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-1.5">
                  <h4 className="font-sub-heading text-blue-800">⚡ ইনস্ট্যান্ট ডেলিভারি প্রক্রিয়া</h4>
                  <p className="text-blue-700 text-xs font-body-text">
                    অর্ডার করার পর বিকাশ/নগদ/রকেটে পেমেন্ট কনফার্মেশনের পর কয়েক মিনিটের মধ্যে আপনার প্রদানকৃত ইমেইল বা হোয়াটসঅ্যাপে ডেলিভারি সম্পন্ন হবে।
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
