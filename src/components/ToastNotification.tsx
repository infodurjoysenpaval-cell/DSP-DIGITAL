import React, { useEffect, useRef, useState } from 'react';
import { Check, ArrowRight, X } from 'lucide-react';
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
  const [isExiting, setIsExiting] = useState(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const toastId = toast?.id;

  useEffect(() => {
    if (!toastId) {
      setIsExiting(false);
      return;
    }

    setIsExiting(false);

    // Smooth exit transition at 1800ms, then remove at 2000ms
    const fadeTimer = setTimeout(() => {
      setIsExiting(true);
    }, 1800);

    const closeTimer = setTimeout(() => {
      onCloseRef.current();
    }, 2000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(closeTimer);
    };
  }, [toastId]);

  if (!toast) return null;

  const product = toast.product;

  return (
    <div
      id="toast-notification"
      className={`fixed top-4 right-3 sm:right-5 z-[100] max-w-[calc(100vw-1.5rem)] sm:max-w-sm pointer-events-auto transition-all duration-200 ease-out ${
        isExiting
          ? 'opacity-0 -translate-y-2 scale-95 pointer-events-none'
          : 'opacity-100 translate-y-0 scale-100'
      }`}
    >
      <div className="bg-white/95 backdrop-blur-md text-slate-800 rounded-full shadow-md border border-slate-200/90 px-2.5 py-1 sm:px-3 sm:py-1.2 flex items-center justify-between gap-2">
        {/* Compact status badge & message */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <span className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
            <Check className="w-2.5 h-2.5 text-emerald-600 stroke-[3]" />
          </span>

          <div className="flex items-center gap-1 min-w-0 flex-1">
            <p className="text-[11px] font-medium text-slate-800 truncate max-w-[110px] sm:max-w-[160px]">
              {product ? product.name : toast.message}
            </p>
            <span className="text-[10px] text-slate-400 shrink-0">
              added to cart
            </span>
          </div>
        </div>

        {/* Action: Cart Button & Dismiss */}
        <div className="flex items-center gap-1 shrink-0 pl-1 border-l border-slate-100">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenCart();
            }}
            className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-medium text-[10px] rounded-full transition-all flex items-center gap-0.5 cursor-pointer shadow-2xs"
          >
            <span>Cart</span>
            <ArrowRight className="w-2.5 h-2.5" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-0.5 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>
    </div>
  );
};



