import React, { useState, useEffect } from 'react';
import { Home, Grid, ShoppingCart, MessageCircle, User } from 'lucide-react';
import { UserProfile } from '../types';
import { SHOP_INFO } from '../data/storeData';

interface MobileBottomBarProps {
  cartCount: number;
  onOpenCart: () => void;
  selectedCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
  onOpenCategories: () => void;
  onFocusSearch: () => void;
  searchQuery: string;
  currentUser?: UserProfile | null;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenDashboard?: (tab?: string) => void;
  onOpenMenu?: () => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  cartCount,
  onOpenCart,
  selectedCategory,
  onSelectCategory,
  onOpenCategories,
  currentUser,
  onOpenAuth,
  onOpenDashboard,
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'products' | 'cart' | 'support' | 'account'>('home');
  const [isCompact, setIsCompact] = useState(false);

  // WhatsApp Support link
  const rawPhone = SHOP_INFO.phones?.[0]?.value || '8801712792184';
  const phone = rawPhone.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent('Hello, I need assistance from DSP Digital Mart.')}`;

  // Scroll collapse effect: Shrinks menu & hides labels when scrolling down
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 80 && currentScrollY > lastScrollY + 10) {
        setIsCompact(true);
      } else if (currentScrollY < lastScrollY - 10 || currentScrollY < 50) {
        setIsCompact(false);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleHomeClick = () => {
    setActiveTab('home');
    onSelectCategory(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProductsClick = () => {
    setActiveTab('products');
    const el = document.getElementById('products-section') || document.getElementById('new-arrivals-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      onOpenCategories();
    }
  };

  const handleCartClick = () => {
    setActiveTab('cart');
    onOpenCart();
  };

  const handleAccountClick = () => {
    setActiveTab('account');
    if (currentUser) {
      onOpenDashboard?.('dashboard');
    } else {
      onOpenAuth('login');
    }
  };

  return (
    <div className="md:hidden fixed bottom-3 left-3 right-3 z-50 pointer-events-none flex justify-center">
      <nav
        id="mobile-bottom-nav-bar"
        aria-label="Mobile Navigation"
        className={`pointer-events-auto w-full max-w-md bg-white/90 backdrop-blur-2xl border border-white/90 shadow-[0_16px_40px_rgba(15,23,42,0.18)] transition-all duration-300 ${
          isCompact
            ? 'rounded-[24px] px-3 py-2 shadow-xl border-white scale-[0.98]'
            : 'rounded-[32px] px-3.5 py-2.5'
        }`}
      >
        <div className="grid grid-cols-5 items-center text-center gap-1">
          {/* 1. Home */}
          <button
            id="mobile-nav-home"
            onClick={handleHomeClick}
            className={`flex flex-col items-center justify-center rounded-[20px] transition-all duration-300 ${
              isCompact ? 'py-1.5 px-1' : 'py-2 px-1'
            } ${
              activeTab === 'home' && selectedCategory === null
                ? 'bg-[#0052FF] text-white shadow-md shadow-blue-500/30'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Home
              className={`transition-all duration-300 ${
                isCompact ? 'w-5.5 h-5.5 stroke-[2.3]' : 'w-5 h-5'
              } ${
                activeTab === 'home' && selectedCategory === null
                  ? 'text-white'
                  : 'text-slate-600'
              }`}
            />
            <span
              className={`font-bold tracking-tight transition-all duration-300 overflow-hidden ${
                isCompact
                  ? 'max-h-0 opacity-0 text-[0px] mt-0'
                  : 'max-h-4 opacity-100 text-[10.5px] mt-0.5'
              } ${
                activeTab === 'home' && selectedCategory === null
                  ? 'text-white'
                  : 'text-slate-600'
              }`}
            >
              Home
            </span>
          </button>

          {/* 2. Products */}
          <button
            id="mobile-nav-products"
            onClick={handleProductsClick}
            className={`flex flex-col items-center justify-center rounded-[20px] transition-all duration-300 ${
              isCompact ? 'py-1.5 px-1' : 'py-2 px-1'
            } ${
              activeTab === 'products' || selectedCategory !== null
                ? 'bg-[#0052FF] text-white shadow-md shadow-blue-500/30'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Grid
              className={`transition-all duration-300 ${
                isCompact ? 'w-5.5 h-5.5 stroke-[2.3]' : 'w-5 h-5'
              } ${
                activeTab === 'products' || selectedCategory !== null
                  ? 'text-white'
                  : 'text-slate-600'
              }`}
            />
            <span
              className={`font-bold tracking-tight transition-all duration-300 overflow-hidden ${
                isCompact
                  ? 'max-h-0 opacity-0 text-[0px] mt-0'
                  : 'max-h-4 opacity-100 text-[10.5px] mt-0.5'
              } ${
                activeTab === 'products' || selectedCategory !== null
                  ? 'text-white'
                  : 'text-slate-600'
              }`}
            >
              Products
            </span>
          </button>

          {/* 3. Cart */}
          <button
            id="mobile-nav-cart"
            onClick={handleCartClick}
            className={`flex flex-col items-center justify-center rounded-[20px] transition-all duration-300 ${
              isCompact ? 'py-1.5 px-1' : 'py-2 px-1'
            } ${
              activeTab === 'cart'
                ? 'bg-[#0052FF] text-white shadow-md shadow-blue-500/30'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="relative">
              <ShoppingCart
                className={`transition-all duration-300 ${
                  isCompact ? 'w-5.5 h-5.5 stroke-[2.3]' : 'w-5 h-5'
                } ${
                  activeTab === 'cart' ? 'text-white' : 'text-slate-600'
                }`}
              />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 bg-[#0052FF] text-white text-[9px] font-black rounded-full flex items-center justify-center border border-white shadow-xs">
                  {cartCount}
                </span>
              )}
            </div>
            <span
              className={`font-bold tracking-tight transition-all duration-300 overflow-hidden ${
                isCompact
                  ? 'max-h-0 opacity-0 text-[0px] mt-0'
                  : 'max-h-4 opacity-100 text-[10.5px] mt-0.5'
              } ${
                activeTab === 'cart' ? 'text-white' : 'text-slate-600'
              }`}
            >
              Cart
            </span>
          </button>

          {/* 4. Support */}
          <a
            id="mobile-nav-support"
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setActiveTab('support')}
            className={`flex flex-col items-center justify-center rounded-[20px] transition-all duration-300 ${
              isCompact ? 'py-1.5 px-1' : 'py-2 px-1'
            } ${
              activeTab === 'support'
                ? 'bg-[#25D366] text-white shadow-md shadow-emerald-500/30'
                : 'text-emerald-600 hover:text-emerald-700'
            }`}
          >
            <MessageCircle
              className={`transition-all duration-300 ${
                isCompact ? 'w-5.5 h-5.5 stroke-[2.3]' : 'w-5 h-5'
              } ${
                activeTab === 'support' ? 'text-white fill-current' : 'text-emerald-600'
              }`}
            />
            <span
              className={`font-bold tracking-tight transition-all duration-300 overflow-hidden ${
                isCompact
                  ? 'max-h-0 opacity-0 text-[0px] mt-0'
                  : 'max-h-4 opacity-100 text-[10.5px] mt-0.5'
              } ${
                activeTab === 'support' ? 'text-white' : 'text-emerald-600'
              }`}
            >
              Support
            </span>
          </a>

          {/* 5. Account */}
          <button
            id="mobile-nav-account"
            onClick={handleAccountClick}
            className={`flex flex-col items-center justify-center rounded-[20px] transition-all duration-300 ${
              isCompact ? 'py-1.5 px-1' : 'py-2 px-1'
            } ${
              activeTab === 'account'
                ? 'bg-[#0052FF] text-white shadow-md shadow-blue-500/30'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {currentUser ? (
              <div className={`rounded-full bg-[#0052FF] text-white flex items-center justify-center font-black shadow-xs transition-all duration-300 ${
                isCompact ? 'w-5.5 h-5.5 text-[11px]' : 'w-5 h-5 text-[10px]'
              }`}>
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
            ) : (
              <User
                className={`transition-all duration-300 ${
                  isCompact ? 'w-5.5 h-5.5 stroke-[2.3]' : 'w-5 h-5'
                } ${
                  activeTab === 'account' ? 'text-white' : 'text-slate-600'
                }`}
              />
            )}
            <span
              className={`font-bold tracking-tight transition-all duration-300 overflow-hidden ${
                isCompact
                  ? 'max-h-0 opacity-0 text-[0px] mt-0'
                  : 'max-h-4 opacity-100 text-[10.5px] mt-0.5'
              } ${
                activeTab === 'account' ? 'text-white' : 'text-slate-600'
              }`}
            >
              {currentUser ? 'Account' : 'Profile'}
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
};
