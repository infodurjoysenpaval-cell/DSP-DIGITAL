import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, MessageCircle } from 'lucide-react';
import { CartItem } from '../types';
import { SHOP_INFO } from '../data/storeData';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onProceedCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedCheckout,
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => {
    const price = item.selectedVariation ? item.selectedVariation.salePrice : (item.product.salePrice || 0);
    return acc + price * item.quantity;
  }, 0);

  const phone = SHOP_INFO.whatsappNumber.replace(/[^0-9]/g, '');

  const handleWhatsAppCartOrder = () => {
    const itemsSummary = items
      .map((item, idx) => {
        const varName = item.selectedVariation ? ` (${item.selectedVariation.name})` : '';
        const price = item.selectedVariation ? item.selectedVariation.salePrice : (item.product.salePrice || 0);
        return `${idx + 1}. ${item.product.name}${varName} x ${item.quantity} = ৳${price * item.quantity}`;
      })
      .join('\n');

    const msg = `Hello DSP Digital Mart! I want to order the following items:\n\n${itemsSummary}\n\n*Total: ৳${subtotal.toLocaleString()}*\nPlease confirm my order.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside aria-label="Shopping Cart" className="w-screen max-w-md bg-white shadow-2xl flex flex-col z-10">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-main-heading text-slate-800">
                শপিং কার্ট ({items.reduce((acc, i) => acc + i.quantity, 0)})
              </h2>
            </div>
            <button
              id="close-cart-drawer-btn"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                </div>
                <h4 className="text-base font-sub-heading text-slate-700">আপনার কার্ট খালি রয়েছে</h4>
                <p className="text-xs font-body-text text-slate-400 max-w-xs">
                  পছন্দের ডিজিটাল সেবা ও সাবস্ক্রিপশন কার্টে যোগ করুন এবং এক ক্লিকেই অর্ডার করুন।
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-btn-text text-xs rounded-xl transition-colors"
                >
                  প্রোডাক্ট দেখুন
                </button>
              </div>
            ) : (
              items.map((item, index) => {
                const itemPrice = item.selectedVariation
                  ? item.selectedVariation.salePrice
                  : item.product.salePrice || 0;
                return (
                  <div
                    key={`${item.product._id}-${item.selectedVariation?._id || 'default'}-${index}`}
                    className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3 hover:border-slate-300 transition-colors"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 object-contain rounded-lg bg-slate-50 border border-slate-100 p-1 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-sub-heading text-[#0F172A] line-clamp-1 leading-snug">
                        {item.product.name}
                      </h4>
                      {item.selectedVariation && (
                        <p className="text-[11px] font-body-text text-[#3B82F6] mt-0.5 truncate">
                          প্ল্যান: {item.selectedVariation.name}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-price-text text-[#0F172A]">
                          ৳{(itemPrice * item.quantity).toLocaleString()}
                        </span>

                        {/* Quantity Controls */}
                        <div className="flex items-center border border-[#E2E8F0] rounded-lg overflow-hidden bg-white">
                          <button
                            onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                            className="px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-100 font-btn-text"
                          >
                            -
                          </button>
                          <span className="px-2 py-0.5 text-xs font-price-text text-[#0F172A]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                            className="px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-100 font-btn-text"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveItem(index)}
                      className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[#E2E8F0] bg-[#F8FAFC] space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-body-text text-slate-600">সাবটোটাল:</span>
                <span className="font-price-text text-lg text-[#0F172A]">৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 font-body-text">
                <span>ডেলিভারি চার্জ (ডিজিটাল ডেলিভারি):</span>
                <span className="font-offer-text text-emerald-600">ফ্রি (৳০)</span>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  id="cart-checkout-proceed-btn"
                  onClick={() => {
                    onClose();
                    onProceedCheckout();
                  }}
                  className="w-full py-3 bg-[#3B82F6] hover:bg-[#2563EB] active:scale-[0.98] text-white font-btn-text text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>অর্ডার সম্পন্ন করুন</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleWhatsAppCartOrder}
                  className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-btn-text text-xs rounded-xl border border-emerald-200/80 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>হোয়াটসঅ্যাপে সরাসরি কার্ট অর্ডার পাঠান</span>
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
