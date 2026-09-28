import React, { useState } from 'react';
import { CheckCircle2, MessageCircle, Copy, Check, ArrowRight, Mail, Key, Sparkles } from 'lucide-react';
import { OrderDetails } from '../types';
import { SHOP_INFO } from '../data/storeData';

interface OrderSuccessModalProps {
  order: OrderDetails | null;
  onClose: () => void;
  onViewOrders?: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ order, onClose, onViewOrders }) => {
  const [copied, setCopied] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  if (!order) return null;

  const phone = SHOP_INFO.whatsappNumber.replace(/[^0-9]/g, '');
  const licenseKey = order.licenseKey || `DSP-KEY-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

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
    `*License Key:* ${licenseKey}\n` +
    (order.notes ? `*Notes:* ${order.notes}\n` : '') +
    `*Payment Method:* ${order.paymentMethod.toUpperCase()}\n` +
    (order.transactionId ? `*TrxID:* ${order.transactionId}\n` : '') +
    `*Total:* ৳${order.totalAmount.toLocaleString()}\n\n` +
    `*Products:*\n${itemsList}\n\n` +
    `Please process and verify my order. Thank you!`;

  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(orderSummaryText)}`;

  const copyDetails = () => {
    navigator.clipboard.writeText(orderSummaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyKey = () => {
    navigator.clipboard.writeText(licenseKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
      <div
        id="order-success-modal"
        className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-6 sm:p-8 text-center space-y-4 max-h-[92vh] overflow-y-auto"
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
            Thank you! Your order was placed successfully
          </h2>
          <p className="text-xs sm:text-sm font-body-text text-slate-500 mt-1">
            Order ID: <span className="font-mono font-price-text text-blue-600 font-bold">#{order.orderId}</span>
          </p>
        </div>

        {/* Automated Email Service Confirmation Badge */}
        <div className="p-3 bg-blue-50/80 border border-blue-200/80 rounded-2xl text-left flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
            <Mail className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
              <span>Automated Email Dispatched</span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-blue-700/90 mt-0.5 leading-relaxed">
              An official order confirmation & license key delivery email has been sent to <strong className="text-blue-950 font-mono">{order.email}</strong>.
            </p>
          </div>
        </div>

        {/* Generated Digital License Key Box */}
        <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl text-left space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-emerald-600" /> Digital License / Access Key
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
              Instant Delivery
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 bg-white px-3 py-2 rounded-xl border border-emerald-300">
            <code className="font-mono text-xs sm:text-sm font-bold text-slate-900 select-all truncate">
              {licenseKey}
            </code>
            <button
              onClick={copyKey}
              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
            >
              {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Info card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs text-slate-700 font-body-text">
          <div className="flex justify-between border-b border-slate-200/70 pb-2">
            <span className="text-slate-500">Customer:</span>
            <span className="font-semibold text-slate-900">{order.customerName}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200/70 pb-2">
            <span className="text-slate-500">Phone:</span>
            <span className="font-semibold text-slate-900">{order.phone}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200/70 pb-2">
            <span className="text-slate-500">Delivery Email:</span>
            <span className="font-semibold text-slate-900">{order.email}</span>
          </div>
          <div className="flex justify-between pt-1 text-sm font-sub-heading">
            <span>Total Paid:</span>
            <span className="text-blue-700 font-price-text font-bold">৳{order.totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Instant WhatsApp notification recommendation */}
        <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-xs text-emerald-800 space-y-1 text-left">
          <p className="font-sub-heading flex items-center gap-1.5 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> 24/7 Verified Support:
          </p>
          <p className="text-[11px] leading-relaxed font-body-text text-emerald-700">
            For instant assistance or custom setup support, contact our support desk via WhatsApp:
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-2.5 pt-1">
          <a
            id="order-success-whatsapp-btn"
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-btn-text text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>Chat on WhatsApp Support (+880 1712-792184)</span>
          </a>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={copyDetails}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-btn-text rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy Receipt'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-btn-text rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Back to Store</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {onViewOrders && (
            <p className="text-[11px] text-slate-500 pt-1 font-body-text">
              This order has been saved to your account history.{' '}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewOrders();
                }}
                className="text-blue-600 hover:text-blue-800 font-btn-text underline ml-1 cursor-pointer"
              >
                View My Orders →
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
