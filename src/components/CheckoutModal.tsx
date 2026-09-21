import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Phone, Mail, User, ArrowLeft, Copy, Check, Sparkles, LogIn, ShoppingBag, Zap, Tag, Shield, Gift, Wallet } from 'lucide-react';
import { CartItem, OrderDetails, UserProfile } from '../types';
import { SHOP_INFO } from '../data/storeData';
import { getStoreSettings } from '../utils/adminStore';
import { saveOrderToHistory, deductWalletBalance } from '../utils/authStorage';
import { saveIncompleteOrderDraft, resolveIncompleteOrder } from '../utils/incompleteOrdersStore';
import { trackMetaEvent, trackGtmEvent } from '../utils/trackingInjector';
import { isApprovedAffiliate, getActiveReferralCode, creditAffiliateCommission } from '../utils/affiliateStorage';

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
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'rocket' | 'wallet'>('bkash');
  const [senderPhone, setSenderPhone] = useState('');
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

  // 15% discount for approved affiliates
  const isAffiliate = isApprovedAffiliate(currentUser);
  const affiliateDiscount = isAffiliate ? Math.round(subTotal * 0.15) : 0;

  // ৳20 referral discount if customer arrived via an affiliate's referral link
  const activeRefCode = getActiveReferralCode();
  const isOwnReferral = Boolean(
    currentUser?.referralCode &&
    activeRefCode &&
    currentUser.referralCode.trim().toUpperCase() === activeRefCode.trim().toUpperCase()
  );
  const referralDiscount = (!isOwnReferral && activeRefCode && subTotal >= 20) ? 20 : 0;

  const totalAmount = Math.max(0, subTotal - couponDiscountAmount - affiliateDiscount - referralDiscount);

  const overallDiscountPercent = originalTotal > 0 ? Math.round(((originalTotal - totalAmount) / originalTotal) * 100) : 0;

  const storeSettings = getStoreSettings();
  const getProviderNumber = (method: 'bkash' | 'nagad' | 'rocket' | 'wallet') => {
    if (method === 'wallet') return '';
    const fallbackNumber = SHOP_INFO.whatsappNumber.replace(/[^0-9]/g, '') || '01712792184';
    if (method === 'bkash') {
      return storeSettings.paymentMethods?.bkash?.number || fallbackNumber;
    }
    if (method === 'nagad') {
      return storeSettings.paymentMethods?.nagad?.number || fallbackNumber;
    }
    return storeSettings.paymentMethods?.rocket?.number || fallbackNumber;
  };

  const currentPaymentNumber = getProviderNumber(paymentMethod);

  const copyPaymentNumber = () => {
    navigator.clipboard.writeText(currentPaymentNumber);
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

    if (paymentMethod === 'wallet') {
      if (!currentUser) {
        setErrorMsg('Please sign in or register to pay using your wallet balance.');
        return;
      }
      if ((currentUser.walletBalance || 0) < totalAmount) {
        setErrorMsg(`Insufficient wallet balance. You have ৳${(currentUser.walletBalance || 0).toLocaleString()}, but this order requires ৳${totalAmount.toLocaleString()}. Please top up your wallet or select bKash/Nagad/Rocket.`);
        return;
      }
    } else {
      if (!transactionId.trim()) {
        setErrorMsg('Please enter the Transaction ID (TrxID) after sending the payment.');
        return;
      }
    }

    setIsSubmitting(true);

    const generatedOrderId = `DSP-${Math.floor(100000 + Math.random() * 900000)}`;

    // If paid via wallet, deduct immediately
    if (paymentMethod === 'wallet' && currentUser) {
      const deductRes = deductWalletBalance(currentUser.id, totalAmount, generatedOrderId);
      if (!deductRes.success) {
        setErrorMsg(deductRes.message);
        setIsSubmitting(false);
        return;
      }
    }

    const fullNotes = [
      notes.trim(),
      paymentMethod === 'wallet' ? 'Paid via DSP Wallet Balance' : (senderPhone.trim() ? `Sender Number (${paymentMethod}): ${senderPhone.trim()}` : ''),
    ].filter(Boolean).join(' | ');

    const newOrder: OrderDetails = {
      orderId: generatedOrderId,
      userId: currentUser?.id,
      customerName: customerName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      notes: fullNotes,
      items,
      paymentMethod,
      transactionId: paymentMethod === 'wallet' ? `WALLET-${Date.now().toString().slice(-6)}` : (transactionId.trim() || undefined),
      totalAmount,
      affiliateDiscount: affiliateDiscount > 0 ? affiliateDiscount : undefined,
      referralDiscount: referralDiscount > 0 ? referralDiscount : undefined,
      appliedReferralCode: referralDiscount > 0 && activeRefCode ? activeRefCode : undefined,
      createdAt: new Date().toISOString(),
    };

    saveOrderToHistory(newOrder);

    // Credit 15% product discount value (or ৳20 minimum) to affiliate's dashboard balance
    // upon customer ordering with their referral link
    if (activeRefCode) {
      const subtotal = items.reduce((acc, item) => {
        const price = item.selectedVariation ? item.selectedVariation.salePrice : (item.product.salePrice || 0);
        return acc + price * item.quantity;
      }, 0);
      const earnedCommission = Math.max(20, Math.round(subtotal * 0.15));
      const itemsSummary = items.map((i) => `${i.product.name} (x${i.quantity})`).join(', ');
      creditAffiliateCommission(activeRefCode, earnedCommission, generatedOrderId, itemsSummary, totalAmount);
    }

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

    trackGtmEvent('purchase', {
      transaction_id: generatedOrderId,
      value: totalAmount,
      currency: 'BDT',
      items: items.map((i) => ({
        item_id: i.product._id,
        item_name: i.product.name,
        price: i.selectedVariation?.salePrice ?? i.product.salePrice,
        quantity: i.quantity,
      })),
    });

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
                className="mt-2 px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-full transition-all"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <form id="checkout-form" onSubmit={handleSubmitOrder} className="space-y-4">
              {/* Top Product Summary Box */}
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
                    <span className="inline-block bg-[#2563EB] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md mt-0.5">
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
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-full text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                />

                <input
                  type="tel"
                  required
                  placeholder="Phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-full text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                />

                <input
                  type="email"
                  required
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-full text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                />
              </div>

              {/* Gmail / Delivery Email Notes */}
              <div className="space-y-2 pt-1">
                <h3 className="text-sm font-bold text-slate-900">Delivery Email / Notes</h3>

                <textarea
                  rows={2}
                  placeholder="Enter email address where you want to receive digital access or delivery notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3.5 bg-white border border-slate-200 rounded-2xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all resize-none"
                />
              </div>

              {/* Payment Method Selector (bKash, Nagad, Rocket) */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Payment Method (পেমেন্ট মেথড)</h3>
                  <span className="text-[11px] font-semibold text-[#2563EB] bg-[#2563EB]/10 px-2.5 py-0.5 rounded-full">
                    ম্যানুয়াল পেমেন্ট
                  </span>
                </div>

                {/* 4 Payment Options: bKash, Nagad, Rocket, Wallet */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
                  {/* bKash */}
                  <div
                    id="payment-method-bkash"
                    onClick={() => setPaymentMethod('bkash')}
                    className={`p-2.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 ${
                      paymentMethod === 'bkash'
                        ? 'border-[#2563EB] bg-[#2563EB]/5 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-[#E2136E]/10 border border-[#E2136E]/20 flex items-center justify-center font-bold text-xs text-[#E2136E]">
                      বিকাশ
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-slate-900">bKash</span>
                      <span className="text-[10px] text-slate-500 font-medium">Send Money</span>
                    </div>
                    <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center mt-0.5 ${paymentMethod === 'bkash' ? 'border-[#2563EB]' : 'border-slate-300'}`}>
                      {paymentMethod === 'bkash' && <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />}
                    </div>
                  </div>

                  {/* Nagad */}
                  <div
                    id="payment-method-nagad"
                    onClick={() => setPaymentMethod('nagad')}
                    className={`p-2.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 ${
                      paymentMethod === 'nagad'
                        ? 'border-[#2563EB] bg-[#2563EB]/5 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-[#F7941D]/10 border border-[#F7941D]/20 flex items-center justify-center font-bold text-xs text-[#F7941D]">
                      নগদ
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-slate-900">Nagad</span>
                      <span className="text-[10px] text-slate-500 font-medium">Send Money</span>
                    </div>
                    <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center mt-0.5 ${paymentMethod === 'nagad' ? 'border-[#2563EB]' : 'border-slate-300'}`}>
                      {paymentMethod === 'nagad' && <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />}
                    </div>
                  </div>

                  {/* Rocket */}
                  <div
                    id="payment-method-rocket"
                    onClick={() => setPaymentMethod('rocket')}
                    className={`p-2.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 ${
                      paymentMethod === 'rocket'
                        ? 'border-[#2563EB] bg-[#2563EB]/5 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-[#8C3494]/10 border border-[#8C3494]/20 flex items-center justify-center font-bold text-xs text-[#8C3494]">
                      রকেট
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-slate-900">Rocket</span>
                      <span className="text-[10px] text-slate-500 font-medium">Send Money</span>
                    </div>
                    <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center mt-0.5 ${paymentMethod === 'rocket' ? 'border-[#2563EB]' : 'border-slate-300'}`}>
                      {paymentMethod === 'rocket' && <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />}
                    </div>
                  </div>

                  {/* Wallet Balance */}
                  <div
                    id="payment-method-wallet"
                    onClick={() => setPaymentMethod('wallet')}
                    className={`p-2.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 relative ${
                      paymentMethod === 'wallet'
                        ? 'border-[#2563EB] bg-[#2563EB]/5 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center font-bold text-xs text-emerald-600">
                      <Wallet className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-slate-900">Wallet</span>
                      <span className="text-[10px] text-emerald-600 font-bold">
                        ৳ {(currentUser?.walletBalance || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center mt-0.5 ${paymentMethod === 'wallet' ? 'border-[#2563EB]' : 'border-slate-300'}`}>
                      {paymentMethod === 'wallet' && <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />}
                    </div>
                  </div>
                </div>

                {/* Wallet Balance Payment Box */}
                {paymentMethod === 'wallet' ? (
                  <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs space-y-3 mt-2">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-[#2563EB]" />
                        <span className="font-bold text-slate-800">DSP Wallet Balance (ওয়ালেট ব্যালেন্স)</span>
                      </div>
                      <span className="font-mono text-sm font-black text-emerald-600">
                        ৳ {(currentUser?.walletBalance || 0).toLocaleString()}
                      </span>
                    </div>

                    {!currentUser ? (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center justify-between">
                        <span>ওয়ালেট ব্যালেন্স দিয়ে পে করতে অনুগ্রহ করে আগে সাইন-ইন বা লগইন করুন।</span>
                        <button
                          type="button"
                          onClick={() => onOpenAuth?.('login')}
                          className="px-3 py-1 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700"
                        >
                          লগইন
                        </button>
                      </div>
                    ) : (currentUser.walletBalance || 0) < totalAmount ? (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs space-y-1">
                        <p className="font-bold">⚠ আপনার ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই!</p>
                        <p className="text-[11px] text-rose-700">
                          অর্ডারের মোট মূল্য: <b>৳ {totalAmount.toLocaleString()}</b>, আপনার ব্যালেন্স: <b>৳ {(currentUser.walletBalance || 0).toLocaleString()}</b>। বাকি ৳ {(totalAmount - (currentUser.walletBalance || 0)).toLocaleString()} টাকা টপ-আপ করুন (টপআপে পাচ্ছেন ৫% বোনাস) অথবা bKash/Nagad/Rocket দিয়ে পরিশোধ করুন।
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs space-y-1">
                        <p className="font-bold flex items-center gap-1.5 text-emerald-700">
                          <Check className="w-4 h-4 text-emerald-600" />
                          পর্যাপ্ত ওয়ালেট ব্যালেন্স আছে!
                        </p>
                        <p className="text-[11px] text-emerald-700">
                          অর্ডার কনফার্ম করার সাথে সাথে স্বয়ংক্রিয়ভাবে আপনার ওয়ালেট থেকে <b>৳ {totalAmount.toLocaleString()}</b> কেটে নেওয়া হবে। কোনো ট্রানজেকশন আইডি লিখতে হবে না।
                        </p>
                        <p className="text-[10px] text-slate-500 pt-1">
                          অর্ডারের পর অবশিষ্ট ব্যালেন্স থাকবে: ৳ {((currentUser.walletBalance || 0) - totalAmount).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Manual Payment Details & Instructions Box */
                  <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs space-y-3 mt-2">
                    <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200/70">
                      <div>
                        <span className="text-[11px] text-slate-500 block">
                          {paymentMethod === 'bkash' ? 'bKash Personal Number' : paymentMethod === 'nagad' ? 'Nagad Personal Number' : 'Rocket Personal Number'} (Send Money)
                        </span>
                        <span className="font-mono text-sm font-bold text-slate-900 tracking-wider">
                          {currentPaymentNumber}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={copyPaymentNumber}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-[#2563EB] border border-[#2563EB]/30 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                      >
                        {copiedNumber ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="bg-[#2563EB]/5 border border-[#2563EB]/15 rounded-xl p-2.5 text-[11px] text-slate-700 space-y-1">
                      <p className="font-semibold text-slate-900">
                        পরিশোধের নিয়মাবলী (Manual Payment Instructions):
                      </p>
                      <p>
                        ১. আপনার <span className="font-bold text-[#2563EB] capitalize">{paymentMethod}</span> একাউন্ট থেকে উপরে দেওয়া নম্বরে <b>৳ {totalAmount.toLocaleString()}</b> টাকা <b>Send Money</b> করুন।
                      </p>
                      <p>
                        ২. সফলভাবে টাকা পাঠানোর পর প্রাপ্ত TrxID এবং আপনার নম্বরটি নিচের বক্সে লিখুন।
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          আপনার প্রেরক নম্বর (Sender Number)
                        </label>
                        <input
                          type="tel"
                          placeholder="e.g. 017XXXXXXXX"
                          value={senderPhone}
                          onChange={(e) => setSenderPhone(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          ট্রানজেকশন আইডি (TrxID)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 9J87AKL1"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono uppercase placeholder:normal-case placeholder:font-sans placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Have a coupon? Section */}
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
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-full text-xs sm:text-sm font-mono uppercase placeholder:normal-case placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-full text-xs sm:text-sm transition-colors shrink-0 cursor-pointer shadow-2xs"
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

              {/* Discounts breakdown */}
              {(isAffiliate || referralDiscount > 0 || couponDiscountAmount > 0) && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  {couponApplied && couponDiscountAmount > 0 && (
                    <div className="flex items-center justify-between text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <span>Coupon Discount ({discountPercent}%):</span>
                      <span>-Tk {couponDiscountAmount.toLocaleString()}</span>
                    </div>
                  )}

                  {isAffiliate && affiliateDiscount > 0 && (
                    <div className="flex items-center justify-between text-xs text-[#EA580C] font-bold bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-200">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#EA580C]" />
                        Affiliate Partner Discount (15% Off):
                      </span>
                      <span>-Tk {affiliateDiscount.toLocaleString()}</span>
                    </div>
                  )}

                  {referralDiscount > 0 && activeRefCode && (
                    <div className="flex items-center justify-between text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <span className="flex items-center gap-1.5">
                        <Gift className="w-3.5 h-3.5 text-emerald-600" />
                        Referral Discount (Ref: {activeRefCode}):
                      </span>
                      <span>-Tk 20</span>
                    </div>
                  )}
                </div>
              )}

              {/* Total Summary Row */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-base font-medium text-slate-600">Total</span>
                <span className="text-2xl font-black text-slate-900 font-price-text">
                  Tk {totalAmount.toLocaleString()}
                </span>
              </div>

              {/* Confirm & Pay Main Button */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 sm:py-4 bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.99] disabled:bg-slate-300 text-white font-bold text-base sm:text-lg rounded-full shadow-lg shadow-[#2563EB]/25 transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
                >
                  <Zap className="w-5 h-5 fill-white text-white" />
                  <span>{isSubmitting ? 'Processing...' : 'Confirm Order & Pay'}</span>
                </button>
              </div>

              {/* Bottom Security Note */}
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Secure & encrypted manual payment</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
