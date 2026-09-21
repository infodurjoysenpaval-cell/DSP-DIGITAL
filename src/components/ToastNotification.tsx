import React, { useEffect } from 'react';
import { Check, ShoppingBag, X } from 'lucide-react';
import { Product, VariationItem } from '../types';

export interface ToastData {
  id: string;
  message: string;
  product?: Product;
  selectedVariation?: VariationItem | null;
  quantity?: number;
  type?: 'cart' | 'info' | 'success';
}

interface ToastNotificationProps {
  toast: ToastData | null;
  onClose: () => void;
  onOpenCart: () => void;
  onOpenCheckout: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  toast,
  onClose,
  onOpenCart,
}) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 2800);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const product = toast.product;
  const variation = toast.selectedVariation;
  const imgUrl = product?.images?.[0] || '';

  return (
    <div
      id="toast-notification"
      className="fixed top-4 left-3 right-3 sm:left-auto sm:right-5 sm:max-w-sm z-[100] animate-in fade-in slide-in-from-top-3 duration-200 pointer-events-auto"
    >
      <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-xl border border-slate-800 p-2.5 sm:p-3 flex items-center justify-between gap-3 ring-1 ring-white/10">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Success Check Badge or Thumbnail */}
          {imgUrl ? (
            <img
              src={imgUrl}
              alt={product?.name || 'Product'}
              className="w-9 h-9 object-cover rounded-lg border border-slate-700 bg-slate-800 shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <Check className="w-4 h-4 stroke-[2.5]" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              <p className="text-xs font-bold text-white truncate">
                {product ? product.name : toast.message}
              </p>
            </div>
            <p className="text-[11px] text-slate-300 truncate mt-0.5">
              {variation ? `${variation.name} • ` : ''}Added to cart
            </p>
          </div>
        </div>

        {/* View Cart Quick Link & Close */}
        <div className="flex items-center gap-1.5 shrink-0 border-l border-slate-800 pl-2.5">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenCart();
            }}
            className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-[11px] rounded-lg transition-all flex items-center gap-1 cursor-pointer"
          >
            <ShoppingBag className="w-3 h-3" />
            <span>Cart</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

