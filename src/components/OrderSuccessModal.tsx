import React, { useState } from 'react';
import { CheckCircle2, MessageCircle, Copy, Check, ArrowRight } from 'lucide-react';
import { OrderDetails } from '../types';
import { SHOP_INFO } from '../data/storeData';

interface OrderSuccessModalProps {
  order: OrderDetails | null;
  onClose: () => void;
  onViewOrders?: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ order, onClose, onViewOrders }) => {
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const phone = SHOP_INFO.whatsappNumber.replace(/[^0-9]/g, '');

  const itemsList = order.items
    .map((item, idx) => {
      const varInfo = item.selectedVariation ? ` (${item.selectedVariation.name})` : '';
      const pr = item.selectedVariation ? item.selectedVariation.salePrice : (item.product.salePrice || 0);
      return `${idx + 1}. ${item.product.name}${varInfo} x ${item.quantity} = ৳${pr * item.quantity}`;
    })
    .join('\n');

  const orderSummaryText = `*DSP DIGITAL MART ORDER #${order.orderId}*\n\n` +
    `*Customer:* ${order.customerName}\n` +
    `*Phone:* ${order.phone}\n` +
    `*Email:* ${order.email}\n` +
    (order.notes ? `*Notes:* ${order.notes}\n` : '') +
    `*Payment Method:* ${order.paymentMethod.toUpperCase()}\n` +
    (order.transactionId ? `*TrxID:* ${order.transactionId}\n` : '') +
    `*Total:* ৳${order.totalAmount.toLocaleString()}\n\n` +
    `*Products:*\n${itemsList}\n\n` +
    `Please process and send my digital license key / login access. Thank you!`;

  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(orderSummaryText)}`;

  const copyDetails = () => {
    navigator.clipboard.writeText(orderSummaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
      <div
        id="order-success-modal"
        className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-6 sm:p-8 text-center space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Brand Logo & Success Icon */}
        <div className="flex flex-col items-center gap-3">
          <img
            src="/logo.png"
            alt="DSP DIGITAL MART"
            className="h-8.5 w-auto object-contain"
          />
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-main-heading text-slate-900">
            ধন্যবাদ! আপনার অর্ডার সফল হয়েছে
          </h2>
          <p className="text-xs sm:text-sm font-body-text text-slate-500 mt-1">
            অর্ডার আইডি: <span className="font-mono font-price-text text-blue-600">#{order.orderId}</span>
          </p>
        </div>

        {/* Info card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs text-slate-700 font-body-text">
          <div className="flex justify-between border-b border-slate-200/70 pb-2">
            <span className="text-slate-500">গ্রাহক:</span>
            <span className="font-semibold text-slate-900">{order.customerName}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200/70 pb-2">
            <span className="text-slate-500">মোবাইল:</span>
            <span className="font-semibold text-slate-900">{order.phone}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200/70 pb-2">
            <span className="text-slate-500">ডেলিভারি ইমেইল:</span>
            <span className="font-semibold text-slate-900">{order.email}</span>
          </div>
          <div className="flex justify-between pt-1 text-sm font-sub-heading">
            <span>সর্বমোট পরিশোধযোগ্য:</span>
            <span className="text-blue-700 font-price-text">৳{order.totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Instant WhatsApp notification recommendation */}
        <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-xs text-emerald-800 space-y-1">
          <p className="font-sub-heading">⚡ দ্রুততম ডেলিভারির জন্য:</p>
          <p className="text-[11px] leading-relaxed font-body-text">
            নিচের বাটনে ক্লিক করে সরাসরি আমাদের অফিশিয়াল হোয়াটসঅ্যাপে অর্ডারের কপি পাঠান। সাথে সাথে আপনার লাইসেন্স প্রদান করা হবে।
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-2.5 pt-1">
          <a
            id="order-success-whatsapp-btn"
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-btn-text text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>হোয়াটসঅ্যাপে পাঠিয়ে ডেলিভারি নিন</span>
          </a>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={copyDetails}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-btn-text rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'কপি হয়েছে' : 'রসিদ কপি'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-btn-text rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <span>হোমপেজে ফিরুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {onViewOrders && (
            <p className="text-[11px] text-slate-500 pt-1 font-body-text">
              অর্ডারটি একাউন্ট হিস্টোরিতে সংরক্ষিত রয়েছে।{' '}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewOrders();
                }}
                className="text-blue-600 hover:text-blue-800 font-btn-text underline ml-1"
              >
                আমার অর্ডারসমূহ দেখুন →
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
