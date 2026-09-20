import React, { useState, useEffect } from 'react';
import { X, CheckCircle, ShieldCheck, Phone, Mail, User, FileText, ArrowLeft, Copy, Check, Sparkles, LogIn } from 'lucide-react';
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
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  onOrderSuccess,
  currentUser,
  onOpenAuth,
}) => {
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'rocket' | 'bank'>('bkash');
  const [transactionId, setTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-sync with currentUser when modal opens or user logs in
  useEffect(() => {
    if (currentUser) {
      setCustomerName((prev) => prev || currentUser.name);
      setPhone((prev) => prev || currentUser.phone);
      setEmail((prev) => prev || currentUser.email);
    }
  }, [currentUser, isOpen]);

  // Automatically track incomplete order draft if user entered info but hasn't completed
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
    // If closed without completing, ensure incomplete draft is preserved
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

  const totalAmount = items.reduce((acc, item) => {
    const price = item.selectedVariation ? item.selectedVariation.salePrice : (item.product.salePrice || 0);
    return acc + price * item.quantity;
  }, 0);

  const paymentNumber = SHOP_INFO.whatsappNumber.replace(/[^0-9]/g, '');

  const copyPaymentNumber = () => {
    navigator.clipboard.writeText(paymentNumber);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg('অনুগ্রহ করে আপনার পুরো নাম প্রদান করুন।');
      return;
    }
    if (!phone.trim() || phone.replace(/[^0-9]/g, '').length < 10) {
      setErrorMsg('অনুগ্রহ করে সঠিক মোবাইল নম্বর প্রদান করুন।');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('ডিজিটাল লাইসেন্স ডেলিভারির জন্য বৈধ ইমেইল প্রদান আবশ্যক।');
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
      paymentMethod,
      transactionId: transactionId.trim() || undefined,
      totalAmount,
      createdAt: new Date().toISOString(),
    };

    // Save order in history
    saveOrderToHistory(newOrder);

    // Track Meta Purchase event (Pixel + Conversions API CAPI)
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

    // Resolve any incomplete draft for this user/phone
    resolveIncompleteOrder(phone);
    if (email) resolveIncompleteOrder(email);

    setTimeout(() => {
      setIsSubmitting(false);
      onOrderSuccess(newOrder);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div
        id="checkout-modal"
        className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg mr-1 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-base font-main-heading text-slate-800">
              ডিজিটাল চেকআউট (Quick Checkout)
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmitOrder} className="p-5 sm:p-6 space-y-6">
          {/* Order Summary Mini Box */}
          <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl">
            <div className="flex items-center justify-between font-sub-heading text-sm text-[#0F172A] mb-2">
              <span>অর্ডার সারাংশ ({items.length}টি আইটেম)</span>
              <span className="text-[#0F172A] text-base font-price-text">৳{totalAmount.toLocaleString()}</span>
            </div>
            <div className="max-h-24 overflow-y-auto space-y-1 text-xs text-slate-600 divide-y divide-slate-100 font-body-text">
              {items.map((it, idx) => {
                const pr = it.selectedVariation ? it.selectedVariation.salePrice : (it.product.salePrice || 0);
                return (
                  <div key={idx} className="pt-1 flex justify-between">
                    <span className="truncate max-w-[280px]">
                      {it.product.name} {it.selectedVariation ? `(${it.selectedVariation.name})` : ''} x {it.quantity}
                    </span>
                    <span className="font-price-text text-[#0F172A]">৳{(pr * it.quantity).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#0F172A] font-body-text">
              <span>ডেলিভারি চার্জ (ডিজিটাল ডেলিভারি)</span>
              <span className="text-emerald-600 font-offer-text">ফ্রি (৳০)</span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Guest Checkout / Logged-in Customer Status Banner */}
          {currentUser ? (
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-slate-800">
                    লগইন করা আছে: <span className="text-blue-700">{currentUser.name}</span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    অর্ডারটি স্বয়ংক্রিয়ভাবে আপনার একাউন্ট হিস্টোরিতে সংরক্ষিত হবে
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg shrink-0">
                ভেরিফাইড
              </span>
            </div>
          ) : (
            <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50/60 border border-amber-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-slate-700">
                  <strong className="text-slate-900">লগইন ছাড়াও সরাসরি অর্ডার (Guest Checkout):</strong> নিচের তথ্য দিয়ে কোনো একাউন্ট ছাড়াই অর্ডার সম্পন্ন করতে পারেন।
                </span>
              </div>
              {onOpenAuth && (
                <button
                  type="button"
                  onClick={() => onOpenAuth('login')}
                  className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-700 hover:underline shrink-0 text-[11px]"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>লগইন করবেন?</span>
                </button>
              )}
            </div>
          )}

          {/* Customer Information Inputs */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-sub-heading text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-600" /> গ্রাহকের তথ্য (ডেলিভারি এড্রেস)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-body-text text-slate-700 mb-1">
                  আপনার পুরো নাম *
                </label>
                <input
                  id="checkout-name-input"
                  type="text"
                  required
                  placeholder="যেমন: মোঃ সাব্বির আহমেদ"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-body-text focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-body-text text-slate-700 mb-1">
                  মোবাইল নম্বর (হোয়াটসঅ্যাপ নম্বর) *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="checkout-phone-input"
                    type="tel"
                    required
                    placeholder="017XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-body-text focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-body-text text-slate-700 mb-1">
                ইমেইল এড্রেস (লাইসেন্স ও লগইন এক্সেস পাঠানোর জন্য) *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="checkout-email-input"
                  type="email"
                  required
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-body-text focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-body-text">
                ডিজিটাল সাবস্ক্রিপশন ও কী এই ইমেইলে প্রেরণ করা হবে।
              </p>
            </div>

            <div>
              <label className="block text-xs font-body-text text-slate-700 mb-1">
                অতিরিক্ত তথ্য বা একাউন্ট ইমেইল (যদি প্রযোজ্য হয়)
              </label>
              <textarea
                rows={2}
                placeholder="যদি আপনার নিজস্ব ইমেইলে সাবস্ক্রিপশন একটিভ করতে চান, তবে উল্লেখ করুন"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-body-text focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-sub-heading text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" /> পেমেন্ট মেথড নির্বাচন করুন
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('bkash')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  paymentMethod === 'bkash'
                    ? 'border-[#E2136E] bg-pink-50/60 ring-2 ring-[#E2136E]/20 text-[#E2136E] font-btn-text shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                <span className="block text-xs font-btn-text">বিকাশ (bKash)</span>
                <span className="text-[10px] opacity-75 font-body-text">Send Money</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('nagad')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  paymentMethod === 'nagad'
                    ? 'border-[#F7921E] bg-amber-50/60 ring-2 ring-[#F7921E]/20 text-[#F7921E] font-btn-text shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                <span className="block text-xs font-btn-text">নগদ (Nagad)</span>
                <span className="text-[10px] opacity-75 font-body-text">Send Money</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('rocket')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  paymentMethod === 'rocket'
                    ? 'border-[#8C3494] bg-purple-50/60 ring-2 ring-[#8C3494]/20 text-[#8C3494] font-btn-text shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                <span className="block text-xs font-btn-text">রকেট (Rocket)</span>
                <span className="text-[10px] opacity-75 font-body-text">Send Money</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('bank')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  paymentMethod === 'bank'
                    ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 text-blue-700 font-btn-text shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                <span className="block text-xs font-btn-text">ব্যাংক ট্রান্সফার</span>
                <span className="text-[10px] opacity-75 font-body-text">Bank Deposit</span>
              </button>
            </div>

            {/* Payment Guide Box */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-sub-heading text-slate-700">
                  {paymentMethod.toUpperCase()} পার্সোনাল নম্বর:
                </span>
                <button
                  type="button"
                  onClick={copyPaymentNumber}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-btn-text bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs"
                >
                  {copiedNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedNumber ? 'কপি হয়েছে' : 'নম্বর কপি করুন'}</span>
                </button>
              </div>

              <div className="font-mono text-base font-price-text text-slate-900 bg-white p-2.5 rounded-xl border border-slate-200 text-center tracking-wider">
                {paymentNumber}
              </div>

              <ol className="list-decimal list-inside text-slate-600 space-y-1 text-[11px] leading-relaxed pt-1 font-body-text">
                <li>আপনার {paymentMethod} অ্যাপ থেকে <b>Send Money</b> অপশন বেছে নিন।</li>
                <li>উপরের নম্বরে মোট <b>৳{totalAmount.toLocaleString()}</b> টাকা সেন্ড মানি করুন।</li>
                <li>পেমেন্ট সফল হলে প্রাপ্ত <b>Transaction ID (TrxID)</b> নিচে লিখে অর্ডার কনফার্ম করুন।</li>
              </ol>

              {/* Transaction ID Input */}
              <div className="pt-2">
                <label className="block text-xs font-sub-heading text-slate-800 mb-1">
                  ট্রানজেকশন আইডি (Transaction ID / TrxID)
                </label>
                <input
                  id="checkout-trxid-input"
                  type="text"
                  placeholder="যেমন: 9L4K8D9Q2W"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 uppercase"
                />
                <p className="text-[10px] text-slate-400 mt-1 font-body-text">
                  (যদি এখনই পেমেন্ট না করতে চান, ফাঁকা রেখে অর্ডার দিতে পারেন। অর্ডার পর হোয়াটসঅ্যাপেও TrxID পাঠাতে পারবেন)
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              id="confirm-order-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#3B82F6] hover:bg-[#2563EB] active:scale-[0.99] disabled:bg-blue-300 text-white font-btn-text text-sm sm:text-base rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>{isSubmitting ? 'অর্ডার প্রসেস হচ্ছে...' : `অর্ডার নিশ্চিত করুন (৳${totalAmount.toLocaleString()})`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
