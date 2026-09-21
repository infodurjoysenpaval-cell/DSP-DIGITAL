import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Phone, Mail, User, ArrowLeft, Copy, Check, Sparkles, LogIn, ShoppingBag, Zap, Tag, Shield } from 'lucide-react';
import { CartItem, OrderDetails, UserProfile } from '../types';
import { SHOP_INFO } from '../data/storeData';
import { saveOrderToHistory } from '../utils/authStorage';
import { saveIncompleteOrderDraft, resolveIncompleteOrder } from '../utils/incompleteOrdersStore';
import { trackMetaEvent } from '../utils/trackingInjector';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onOrderSuccess: (order: OrderDetails) => void;
  currentUser?: UserProfile | null;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  onUpdateQuantity?: (index: number, newQty: number) => void;
  onRemoveItem?: (index: number) => void;
  onBackToCart?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  onOrderSuccess,
  currentUser,
  onOpenAuth,
  onUpdateQuantity,
  onRemoveItem,
  onBackToCart,
}) => {
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'auto' | 'bkash' | 'nagad' | 'rocket' | 'bank'>('auto');
  const [transactionId, setTransactionId] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponMsg, setCouponMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-sync with currentUser when modal opens
  useEffect(() => {
    if (currentUser) {
      setCustomerName((prev) => prev || currentUser.name);
      setPhone((prev) => prev || currentUser.phone);
      setEmail((prev) => prev || currentUser.email);
    }
  }, [currentUser, isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Track incomplete order draft
  useEffect(() => {
    if (!isOpen || items.length === 0) return;
    if (phone.trim() || customerName.trim() || currentUser) {
      const timer = setTimeout(() => {
        saveIncompleteOrderDraft({
          userId: currentUser?.id,
          customerName: customerName.trim() || currentUser?.name || 'Guest Visitor',
          phone: phone.trim() || currentUser?.phone || '',
          email: email.trim() || currentUser?.email || '',
          items,
          totalAmount: items.reduce((acc, item) => {
            const price = item.selectedVariation ? item.selectedVariation.salePrice : (item.product.salePrice || 0);
            return acc + price * item.quantity;
          }, 0),
          paymentMethod,
          notes,
          stage: transactionId ? 'payment_pending' : phone ? 'checkout_entered' : 'cart_abandoned',
        });
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [customerName, phone, email, paymentMethod, transactionId, items, notes, currentUser, isOpen]);

  const handleClose = () => {
    if (items.length > 0 && (phone.trim() || customerName.trim() || currentUser)) {
      saveIncompleteOrderDraft({
        userId: currentUser?.id,
        customerName: customerName.trim() || currentUser?.name || 'Guest Visitor',
        phone: phone.trim() || currentUser?.phone || '',
        email: email.trim() || currentUser?.email || '',
        items,
        totalAmount: items.reduce((acc, item) => {
          const price = item.selectedVariation ? item.selectedVariation.salePrice : (item.product.salePrice || 0);
          return acc + price * item.quantity;
        }, 0),
        paymentMethod,
        notes,
        stage: transactionId ? 'payment_pending' : phone ? 'checkout_entered' : 'cart_abandoned',
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  const subTotal = items.reduce((acc, item) => {
    const price = item.selectedVariation ? item.selectedVariation.salePrice : (item.product.salePrice || 0);
    return acc + price * item.quantity;
  }, 0);

  const originalTotal = items.reduce((acc, item) => {
    const price = item.selectedVariation ? item.selectedVariation.regularPrice : (item.product.regularPrice || 0);
    return acc + price * item.quantity;
  }, 0);

  const rawDiscount = originalTotal > subTotal ? originalTotal - subTotal : 0;
  const couponDiscountAmount = couponApplied ? Math.round((subTotal * discountPercent) / 100) : 0;
  const totalAmount = Math.max(0, subTotal - couponDiscountAmount);

  const overallDiscountPercent = originalTotal > 0 ? Math.round(((originalTotal - totalAmount) / originalTotal) * 100) : 0;

  const paymentNumber = SHOP_INFO.whatsappNumber.replace(/[^0-9]/g, '');

  const copyPaymentNumber = () => {
    navigator.clipboard.writeText(paymentNumber);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponMsg('');
    if (!couponCode.trim()) {
      setCouponMsg('Please enter a coupon code');
      return;
    }
    const cleanCode = couponCode.trim().toUpperCase();
    if (cleanCode === 'SAVE10' || cleanCode === 'DISCOUNT10' || cleanCode === 'BMDIGITAL') {
      setDiscountPercent(10);
      setCouponApplied(true);
      setCouponMsg('10% discount coupon applied successfully!');
    } else if (cleanCode === 'PROMO15' || cleanCode === 'VIP15') {
      setDiscountPercent(15);
      setCouponApplied(true);
      setCouponMsg('15% special discount applied!');
    } else {
      setDiscountPercent(5);
      setCouponApplied(true);
      setCouponMsg('5% promo discount applied!');
    }
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (items.length === 0) {
      setErrorMsg('Your cart is currently empty.');
      return;
    }

    if (!customerName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!phone.trim() || phone.replace(/[^0-9]/g, '').length < 10) {
      setErrorMsg('Please enter a valid phone number.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    const generatedOrderId = `DSP-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: OrderDetails = {
      orderId: generatedOrderId,
      userId: currentUser?.id,
      customerName,
      phone,
      email,
      notes,
      items,
      paymentMethod: paymentMethod === 'auto' ? 'bkash' : paymentMethod,
      transactionId: transactionId.trim() || undefined,
      totalAmount,
      createdAt: new Date().toISOString(),
    };

    saveOrderToHistory(newOrder);

    trackMetaEvent(
      'Purchase',
      {
        value: totalAmount,
        currency: 'BDT',
        content_name: items.map((i) => i.product.name).join(', '),
        num_items: items.length,
        order_id: generatedOrderId,
      },
      {
        ph: phone.replace(/[^0-9]/g, ''),
        em: email.trim().toLowerCase(),
        fn: customerName.trim(),
      }
    );

    resolveIncompleteOrder(phone);
    if (email) resolveIncompleteOrder(email);

    setTimeout(() => {
      setIsSubmitting(false);
      onOrderSuccess(newOrder);
    }, 600);
  };

  const firstItem = items[0];
  const itemPrice = firstItem ? (firstItem.selectedVariation ? firstItem.selectedVariation.salePrice : (firstItem.product.salePrice || 0)) : 0;
  const imgUrl = firstItem?.product?.images?.[0] || '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/65 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        id="checkout-modal"
        className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-3 shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight font-main-heading">
              Quick Checkout
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Guest checkout available
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <div className="overflow-y-auto px-5 pb-6 flex-1 space-y-4">
          {items.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-800">Your cart is empty</h4>
              <button
                type="button"
                onClick={handleClose}
                className="mt-2 px-5 py-2.5 bg-orange-600 text-white text-xs font-bold rounded-full transition-all"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <form id="checkout-form" onSubmit={handleSubmitOrder} className="space-y-4">
              {/* Top Product Summary Box (Matching Reference Image 1) */}
              <div className="bg-slate-100/90 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 border border-slate-200/60">
                <div className="flex items-center gap-3 min-w-0">
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={firstItem.product.name}
                      className="w-12 h-12 rounded-full object-cover shrink-0 border border-slate-200 bg-white"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
                      DSP
                    </div>
                  )}

                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-[190px] sm:max-w-[220px]">
                      {items.length === 1 ? firstItem.product.name : `${firstItem.product.name} (+${items.length - 1} more)`}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {firstItem.selectedVariation ? firstItem.selectedVariation.name : 'Digital License'}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="block text-sm font-bold text-slate-900 font-price-text">
                    Tk {totalAmount.toLocaleString()}
                  </span>
                  {overallDiscountPercent > 0 && (
                    <span className="inline-block bg-[#ff5500] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md mt-0.5">
                      -{overallDiscountPercent}%
                    </span>
                  )}
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl">
                  {errorMsg}
                </div>
              )}

              {/* Guest Details Inputs */}
              <div className="space-y-2.5 pt-1">
                <h3 className="text-sm font-bold text-slate-900">Guest Details</h3>

                <input
                  type="text"
                  required
                  placeholder="Full name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-full text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />

                <input
                  type="tel"
                  required
                  placeholder="Phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-full text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />

                <input
                  type="email"
                  required
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-full text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              {/* Gmail / Notes Input */}
              <div className="space-y-2 pt-1">
                <h3 className="text-sm font-bold text-slate-900">Gmail</h3>

                <textarea
                  rows={2}
                  placeholder="Enter email address where you want to receive digital access"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3.5 bg-white border border-slate-200 rounded-2xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
                />
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2.5 pt-1">
                <h3 className="text-sm font-bold text-slate-900">Payment Method</h3>

                {/* Option 1: Auto / Online Gateway (Selected Box in Image 1) */}
                <div
                  onClick={() => setPaymentMethod('auto')}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    paymentMethod === 'auto'
                      ? 'border-orange-500 bg-orange-50/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-orange-500 flex items-center justify-center shrink-0">
                      {paymentMethod === 'auto' && <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                    </div>

                    <div className="w-7 h-5 bg-amber-500/10 border border-amber-300/40 rounded flex items-center justify-center shrink-0 text-amber-600 font-bold text-[10px]">
                      💳
                    </div>

                    <span className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      Bkash, Nagad, Roket, Upay, Bank, & Visa/Mastercard Auto Payment
                    </span>
                  </div>
                </div>

                {/* Option 2: Live Payment / Manual bKash */}
                <div
                  onClick={() => setPaymentMethod('bkash')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    paymentMethod === 'bkash'
                      ? 'border-orange-500 bg-orange-50/20 border-2'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0">
                      {paymentMethod === 'bkash' && <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                    </div>

                    <div className="w-7 h-5 bg-pink-50 border border-pink-200 rounded flex items-center justify-center shrink-0 text-[#E2136E] font-bold text-[10px]">
                      📱
                    </div>

                    <span className="text-xs sm:text-sm font-bold text-slate-800">
                      Bkash Live Payment / Send Money
                    </span>
                  </div>
                </div>

                {/* Optional TrxID box if manual bKash/send money selected */}
                {paymentMethod !== 'auto' && (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">Personal Number: {paymentNumber}</span>
                      <button
                        type="button"
                        onClick={copyPaymentNumber}
                        className="text-orange-600 hover:underline font-bold text-[11px]"
                      >
                        {copiedNumber ? 'Copied' : 'Copy Number'}
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Transaction ID / TrxID (optional)"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono uppercase focus:outline-none focus:border-orange-500"
                    />
                  </div>
                )}
              </div>

              {/* Have a coupon? Section (Matching Reference Image 2) */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <h3 className="text-sm font-bold text-slate-900">Have a coupon?</h3>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="COUPON CODE"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-full text-xs sm:text-sm font-mono uppercase placeholder:normal-case placeholder:font-sans focus:outline-none focus:border-orange-500 transition-all"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-6 py-2.5 bg-[#ff9966] hover:bg-orange-500 text-white font-bold rounded-full text-xs sm:text-sm transition-colors shrink-0 cursor-pointer shadow-2xs"
                  >
                    Apply
                  </button>
                </div>

                {couponMsg && (
                  <p className={`text-xs font-medium pl-2 ${couponApplied ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {couponMsg}
                  </p>
                )}
              </div>

              {/* Total Summary Row (Matching Reference Image 2) */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-base font-medium text-slate-600">Total</span>
                <span className="text-2xl font-black text-slate-900 font-price-text">
                  Tk {totalAmount.toLocaleString()}
                </span>
              </div>

              {/* Confirm & Pay Main Orange Button (Matching Reference Image 2) */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 sm:py-4 bg-[#ff5500] hover:bg-[#e64d00] active:scale-[0.99] disabled:bg-slate-300 text-white font-bold text-base sm:text-lg rounded-full shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
                >
                  <Zap className="w-5 h-5 fill-white text-white" />
                  <span>{isSubmitting ? 'Processing...' : 'Confirm & Pay'}</span>
                </button>
              </div>

              {/* Bottom Security Note */}
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Secure & encrypted</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
