import React, { useState, useEffect } from 'react';
import { Star, ShoppingBag, X } from 'lucide-react';
import {
  getRealPurchaseNotifications,
  formatRelativeTime,
  RealPurchaseNotification,
} from '../utils/authStorage';
import { getStoreSettings } from '../utils/adminStore';

interface Review {
  id: string;
  name: string;
  avatarText: string;
  avatarBg: string;
  comment: string;
}

const REVIEWS: Review[] = [
  {
    id: '1',
    name: 'Nusrat Jahan',
    avatarText: 'NJ',
    avatarBg: 'bg-rose-500',
    comment: 'Added to Spotify Family immediately. Working flawlessly on both my phone and laptop.',
  },
  {
    id: '2',
    name: 'Tanvir Ahmed',
    avatarText: 'TA',
    avatarBg: 'bg-amber-500',
    comment: 'Got Canva Pro license. Instant delivery received, working like a charm.',
  },
  {
    id: '3',
    name: 'Sumon Saha',
    avatarText: 'SU',
    avatarBg: 'bg-emerald-500',
    comment: 'Received the code and login details immediately after payment. Smooth transaction without any issues.',
  },
  {
    id: '4',
    name: 'Rakibul Islam',
    avatarText: 'RI',
    avatarBg: 'bg-blue-500',
    comment: 'Purchased ChatGPT Plus subscription. Support was very fast and helpful, highly recommended!',
  },
];

export const CustomerReviewsStats: React.FC = () => {
  // Only real purchases made by actual users are loaded from persistent lifetime storage
  const [realPurchases, setRealPurchases] = useState<RealPurchaseNotification[]>(() => {
    return getRealPurchaseNotifications();
  });
  const [purchaseIndex, setPurchaseIndex] = useState(0);
  const [showToast, setShowToast] = useState(false);

  // Live editable stats configured from the Admin Panel
  const [stats, setStats] = useState(() => {
    const s = getStoreSettings();
    return s.homepageStats || {
      ordersDelivered: '48K+',
      happyCustomers: '12K+',
      avgDeliveryTime: '~38s',
      verifiedReviewAvg: '4.9',
    };
  });

  // Sync stats when updated from admin in real time
  useEffect(() => {
    const updateStats = () => {
      const s = getStoreSettings();
      if (s.homepageStats) {
        setStats(s.homepageStats);
      }
    };

    window.addEventListener('dsp_settings_updated', updateStats);
    window.addEventListener('storage', updateStats);

    return () => {
      window.removeEventListener('dsp_settings_updated', updateStats);
      window.removeEventListener('storage', updateStats);
    };
  }, []);

  // Sync with actual lifetime orders on mount and when new orders are placed
  useEffect(() => {
    const syncRealOrders = () => {
      const orders = getRealPurchaseNotifications();
      setRealPurchases(orders);
      if (orders.length > 0) {
        setPurchaseIndex(0);
        setShowToast(true);
      } else {
        setShowToast(false);
      }
    };

    syncRealOrders();

    window.addEventListener('dsp_order_placed', syncRealOrders);
    window.addEventListener('storage', syncRealOrders);

    return () => {
      window.removeEventListener('dsp_order_placed', syncRealOrders);
      window.removeEventListener('storage', syncRealOrders);
    };
  }, []);

  // Cycle through real purchases only if real customers have bought items
  useEffect(() => {
    if (realPurchases.length <= 1) return;
    const timer = setInterval(() => {
      setPurchaseIndex((prev) => (prev + 1) % realPurchases.length);
      setShowToast(true);
    }, 9000);
    return () => clearInterval(timer);
  }, [realPurchases.length]);

  const currentPurchase = realPurchases[purchaseIndex];

  return (
    <section className="w-full">
      {/* Dark Navy Stats Section */}
      <div className="bg-[#0F172A] text-white py-10 px-4 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {/* Orders Delivered */}
            <div className="space-y-1">
              <h3 className="text-3xl sm:text-4xl font-price-text text-sky-400 tracking-tight">
                {stats.ordersDelivered || '48K+'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-body-text">
                orders delivered
              </p>
            </div>

            {/* Happy Customers */}
            <div className="space-y-1">
              <h3 className="text-3xl sm:text-4xl font-price-text text-sky-400 tracking-tight">
                {stats.happyCustomers || '12K+'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-body-text">
                happy customers
              </p>
            </div>

            {/* Average Delivery Time */}
            <div className="space-y-1">
              <h3 className="text-3xl sm:text-4xl font-price-text text-sky-400 tracking-tight">
                {stats.avgDeliveryTime || '~38s'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-body-text">
                avg delivery time
              </p>
            </div>

            {/* Verified Review Avg */}
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1 text-3xl sm:text-4xl font-price-text text-sky-400">
                <span>{stats.verifiedReviewAvg || '4.9'}</span>
                <Star className="w-6 h-6 sm:w-7 sm:h-7 fill-current text-amber-400" />
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-body-text">
                verified review avg
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="bg-[#F8FAFC] py-10 px-4 border-t border-slate-200 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6">
            <span className="text-xs font-sub-heading uppercase tracking-widest text-blue-600">
              CUSTOMER REVIEWS
            </span>
            <h2 className="text-2xl sm:text-3xl font-main-heading text-[#0F172A] mt-1">
              What our customers say
            </h2>
          </div>

          {/* Review Cards Grid / Horizontal Scroll */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {REVIEWS.map((rev) => (
              <div
                key={rev.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-9 h-9 rounded-full ${rev.avatarBg} text-white flex items-center justify-center text-xs font-sub-heading shrink-0`}
                  >
                    {rev.avatarText}
                  </div>
                  <div>
                    <h4 className="text-sm font-sub-heading text-[#0F172A] leading-tight">
                      {rev.name}
                    </h4>
                    <div className="flex items-center gap-0.5 text-amber-400 mt-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed italic font-body-text">
                  "{rev.comment}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Live Order Popup Notification Toast (Only displays real purchases lifetime) */}
        {showToast && currentPurchase && (
          <div className="fixed bottom-24 left-3 z-30 max-w-[260px] sm:max-w-xs bg-white border border-slate-200 rounded-xl p-2.5 shadow-lg flex items-center gap-2.5 animate-in slide-in-from-left-4 duration-300">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-sub-heading text-[#0F172A] leading-tight truncate">
                {currentPurchase.customerName}{' '}
                <span className="font-body-text text-slate-500">bought</span>
              </p>
              <p className="text-[11px] text-blue-600 font-sub-heading truncate">
                {currentPurchase.productName}
              </p>
              <span className="text-[10px] text-slate-400 font-body-text">
                {formatRelativeTime(currentPurchase.createdAt)}
              </span>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="text-slate-400 hover:text-slate-600 p-1 shrink-0"
              aria-label="Close Notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
