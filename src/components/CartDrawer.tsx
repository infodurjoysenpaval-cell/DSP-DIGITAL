import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, MessageCircle, Sparkles } from 'lucide-react';
import { CartItem, UserProfile } from '../types';
import { SHOP_INFO } from '../data/storeData';
import { isApprovedAffiliate } from '../utils/affiliateStorage';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onProceedCheckout: () => void;
  currentUser?: UserProfile | null;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedCheckout,
  currentUser,
}) => {
  if (!isOpen) return null;

  const isAffiliate = isApprovedAffiliate(currentUser);

  const subtotal = items.reduce((acc, item) => {
    const price = item.selectedVariation ? item.selectedVariation.salePrice : (item.product.salePrice || 0);
    return acc + price * item.quantity;
  }, 0);

  const affiliateDiscount = isAffiliate ? Math.round(subtotal * 0.15) : 0;
  const finalTotal = Math.max(0, subtotal - affiliateDiscount);

  const phone = SHOP_INFO.whatsappNumber.replace(/[^0-9]/g, '');

  const handleWhatsAppCartOrder = () => {
    const itemsSummary = items
      .map((item, idx) => {
        const varName = item.selectedVariation ? ` (${item.selectedVariation.name})` : '';
        const price = item.selectedVariation ? item.selectedVariation.salePrice : (item.product.salePrice || 0);
        return `${idx + 1}. ${item.product.name}${varName} x ${item.quantity} = ৳${price * item.quantity}`;
      })
      .join('\n');

    const discountText = affiliateDiscount > 0 ? `\n*Affiliate 15% Discount: -৳${affiliateDiscount.toLocaleString()}*` : '';
    const msg = `Hello DSP Digital Mart! I want to order the following items:\n\n${itemsSummary}${discountText}\n\n*Total: ৳${finalTotal.toLocaleString()}*\nPlease confirm my order.`;
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
                Shopping Cart ({items.reduce((acc, i) => acc + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-3">
                <ShoppingBag className="w-12 h-12 stroke-[1.5]" />
                <p className="font-body-text text-sm">Your shopping cart is currently empty.</p>
              </div>
            ) : (
              items.map((item, index) => {
                const itemPrice = item.selectedVariation
                  ? item.selectedVariation.salePrice
                  : (item.product.salePrice || 0);
                const itemRegular = item.selectedVariation
                  ? item.selectedVariation.regularPrice
                  : (item.product.regularPrice || 0);

                return (
                  <div
                    key={`${item.product._id}-${index}`}
                    className="flex gap-3 pb-4 border-b border-slate-100 last:border-0 items-start"
                  >
                    <img
                      src={item.product.images?.[0] || '/logo.png'}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-xl object-cover border border-slate-100 shrink-0 bg-slate-50"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/logo.png';
                      }}
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="font-body-text text-sm font-semibold text-slate-800 line-clamp-1">
                        {item.product.name}
                      </h4>
                      {item.selectedVariation && (
                        <span className="inline-block mt-0.5 text-[11px] text-[#2563EB] font-medium bg-blue-50 px-2 py-0.5 rounded">
                          {item.selectedVariation.name}
                        </span>
                      )}

                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-price-text text-sm font-bold text-slate-900">
                          Tk {itemPrice.toLocaleString()}
                        </span>
                        {itemRegular > itemPrice && (
                          <span className="text-[11px] text-slate-400 line-through">
                            Tk {itemRegular.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                          <button
                            onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                            className="px-2.5 py-0.5 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer text-xs font-bold"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-semibold text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                            className="px-2.5 py-0.5 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer text-xs font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveItem(index)}
                      className="text-slate-400 hover:text-red-500 p-1.5 transition-colors cursor-pointer"
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
                <span className="font-body-text text-slate-600">Subtotal:</span>
                <span className="font-price-text text-base text-[#0F172A]">Tk {subtotal.toLocaleString()}</span>
              </div>

              {isAffiliate && affiliateDiscount > 0 && (
                <div className="flex items-center justify-between text-xs text-[#EA580C] font-bold bg-orange-50 px-3 py-2 rounded-xl border border-orange-200">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#EA580C]" />
                    Affiliate 15% Discount:
                  </span>
                  <span>-Tk {affiliateDiscount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-500 font-body-text">
                <span>Delivery Charge (Digital Delivery):</span>
                <span className="font-offer-text text-emerald-600">Free (Tk 0)</span>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">Final Total:</span>
                <span className="font-price-text text-xl font-black text-[#0F172A]">
                  Tk {finalTotal.toLocaleString()}
                </span>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  id="cart-checkout-proceed-btn"
                  onClick={() => {
                    onClose();
                    onProceedCheckout();
                  }}
                  className="w-full py-3 bg-[#3B82F6] hover:bg-[#2563EB] active:scale-[0.98] text-white font-btn-text text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleWhatsAppCartOrder}
                  className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-btn-text text-xs rounded-xl border border-emerald-200/80 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Order Directly via WhatsApp</span>
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
