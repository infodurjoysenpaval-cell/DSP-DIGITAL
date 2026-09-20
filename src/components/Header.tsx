import React, { useState, useEffect, useRef } from 'react';
import { Search, ShoppingBag, Phone, Menu, X, ChevronRight, Zap, ShieldCheck, User, Sparkles, Star, MessageCircle, ExternalLink, CheckCircle2 } from 'lucide-react';
import { SHOP_INFO, CATEGORIES, PRODUCTS } from '../data/storeData';
import { Product, Category, UserProfile } from '../types';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  selectedCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectProduct: (product: Product) => void;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
  currentUser?: UserProfile | null;
  onOpenAuth?: (mode?: 'login' | 'register' | 'profile') => void;
  onLogoClick?: () => void;
  isAffiliateOpen?: boolean;
  setIsAffiliateOpen?: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onSelectProduct,
  mobileMenuOpen: externalMenuOpen,
  setMobileMenuOpen: externalSetMenuOpen,
  currentUser,
  onOpenAuth,
  onLogoClick,
  isAffiliateOpen: externalAffiliateOpen,
  setIsAffiliateOpen: externalSetAffiliateOpen,
}) => {
  const [internalMenuOpen, setInternalMenuOpen] = useState(false);
  const mobileMenuOpen = externalMenuOpen !== undefined ? externalMenuOpen : internalMenuOpen;
  const setMobileMenuOpen = externalSetMenuOpen || setInternalMenuOpen;
  const [searchFocused, setSearchFocused] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [internalAffiliateOpen, setInternalAffiliateOpen] = useState(false);
  const isAffiliateModalOpen = externalAffiliateOpen !== undefined ? externalAffiliateOpen : internalAffiliateOpen;
  const setIsAffiliateModalOpen = externalSetAffiliateOpen || setInternalAffiliateOpen;
  const searchRef = useRef<HTMLDivElement>(null);

  const searchHints = [
    'ChatGPT Plus',
    'Canva Pro',
    'Microsoft Office',
    'Windows 11 Pro',
    'Adobe Creative Cloud',
    'CapCut Pro',
    'Grammarly Premium',
    'YouTube Premium',
    'Netflix',
    'Claude AI Pro',
    'NordVPN',
    'Zoom Premium'
  ];

  // Rotate placeholder hints
  useEffect(() => {
    const interval = setInterval(() => {
      setHintIndex((prev) => (prev + 1) % searchHints.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [searchHints.length]);

  // Close search suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered preview products for search dropdown
  const searchResults = searchQuery.trim()
    ? PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.seoKeyword && p.seoKeyword.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 6)
    : [];

  const phone = SHOP_INFO.whatsappNumber.replace(/[^0-9]/g, '');

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 transition-all">
        {/* Apple-Style Glass Main Header (Frosted translucent backdrop blur matching Image 2) */}
        <div className="bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/75 border-b border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
          <div className="w-full max-w-[1600px] 2xl:max-w-[1720px] mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 sm:gap-6">
            
            {/* Left: Brand Logo & Title */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                id="site-logo-link"
                onClick={() => {
                  onLogoClick?.();
                  onSelectCategory(null);
                  onSearchChange('');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center group text-left transition-all duration-200 hover:opacity-95 focus:outline-hidden"
                aria-label="DSP DIGITAL MART Home"
              >
                <img
                  src="/logo.png"
                  alt="DSP DIGITAL MART - Your Smart Partner in the Digital World"
                  referrerPolicy="no-referrer"
                  className="h-8.5 sm:h-10.5 md:h-12 w-auto max-w-[170px] sm:max-w-[240px] md:max-w-[280px] object-contain shrink-0 select-none transition-transform group-hover:scale-[1.01]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = SHOP_INFO.logoPrimary || '/logo.png';
                  }}
                />
              </button>
            </div>

            {/* Center: Apple-style Pill Search Bar with circular search button (Image 2 style) */}
            <div ref={searchRef} className="hidden md:flex flex-1 max-w-md lg:max-w-lg relative mx-2">
              <div className="relative w-full">
                <input
                  id="desktop-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  placeholder={`Search products: "${searchHints[hintIndex]}"...`}
                  className="w-full pl-4 pr-12 py-2 bg-slate-100/80 hover:bg-white focus:bg-white border border-slate-200/80 focus:border-[#3B82F6] rounded-full text-xs sm:text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 transition-all shadow-2xs"
                />
                {searchQuery ? (
                  <button
                    onClick={() => onSearchChange('')}
                    className="absolute right-9 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    setSearchFocused(false);
                    scrollToSection('products-section');
                  }}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-full flex items-center justify-center transition-transform active:scale-95 shadow-2xs"
                  aria-label="Search"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Live Search Autocomplete with frosted glass */}
              {searchFocused && (searchQuery.trim().length > 0 || searchResults.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
                  {searchResults.length > 0 ? (
                    <div>
                      <div className="px-4 py-2 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex justify-between">
                        <span>Product Results ({searchResults.length})</span>
                        <span>Click to View</span>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {searchResults.map((prod) => {
                          const minPrice = prod.variationList && prod.variationList.length > 0
                            ? Math.min(...prod.variationList.map((v) => v.salePrice))
                            : prod.salePrice || 0;
                          return (
                            <button
                              key={prod._id}
                              onClick={() => {
                                onSelectProduct(prod);
                                setSearchFocused(false);
                              }}
                              className="w-full text-left px-4 py-2.5 hover:bg-blue-50/70 flex items-center gap-3 transition-colors group"
                            >
                              <img
                                src={prod.images[0]}
                                alt={prod.name}
                                referrerPolicy="no-referrer"
                                className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0 group-hover:scale-105 transition-transform"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs sm:text-sm font-sub-heading text-slate-800 truncate group-hover:text-blue-600">
                                  {prod.name}
                                </h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs sm:text-sm font-price-text text-blue-600">৳{minPrice.toLocaleString()}</span>
                                  {prod.regularPrice && (
                                    <span className="text-[11px] font-price-text text-slate-400 line-through">
                                      ৳{prod.regularPrice.toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 text-center text-slate-500 text-xs sm:text-sm font-body-text">
                      No products found for "{searchQuery}". Try searching with another keyword.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Center-Right Navigation Links (matching Image 2: HOME, SHOP, REVIEWS, SUPPORT) */}
            <nav className="hidden lg:flex items-center gap-6 text-xs font-nav-text uppercase tracking-wider">
              <button
                onClick={() => {
                  onSelectCategory(null);
                  onSearchChange('');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`py-1 border-b-2 font-nav-text transition-all ${
                  selectedCategory === null && !searchQuery
                    ? 'border-[#3B82F6] text-[#3B82F6]'
                    : 'border-transparent text-slate-700 hover:text-[#3B82F6]'
                }`}
              >
                HOME
              </button>

              <button
                onClick={() => {
                  onSelectCategory(null);
                  scrollToSection('products-section');
                }}
                className="py-1 border-b-2 border-transparent font-nav-text text-slate-700 hover:text-[#3B82F6] transition-all"
              >
                SHOP
              </button>

              <button
                onClick={() => scrollToSection('customer-reviews-section')}
                className="py-1 border-b-2 border-transparent font-nav-text text-slate-700 hover:text-[#3B82F6] transition-all"
              >
                REVIEWS
              </button>

              <a
                href={`https://wa.me/${phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-1 border-b-2 border-transparent font-nav-text text-slate-700 hover:text-[#3B82F6] transition-all"
              >
                SUPPORT
              </a>
            </nav>

            {/* Right: Sign In pill button + Cart button matching Image 2 */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {currentUser ? (
                <button
                  id="header-user-profile-btn"
                  onClick={() => onOpenAuth?.('profile')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#0F172A] text-xs font-btn-text rounded-full border border-slate-200 transition-colors shadow-2xs"
                  title="My Account"
                >
                  <div className="w-5 h-5 rounded-full bg-[#3B82F6] text-white flex items-center justify-center text-[10px] font-price-text shadow-xs">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-[80px] truncate font-btn-text">{currentUser.name.split(' ')[0]}</span>
                </button>
              ) : (
                <button
                  id="header-login-btn"
                  onClick={() => onOpenAuth?.('login')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-btn-text rounded-full shadow-xs hover:shadow transition-all active:scale-95"
                  title="Customer Sign In"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="font-btn-text">Sign In</span>
                </button>
              )}

              {/* Cart Button (Image 2 style: Icon + Badge + "Cart") */}
              <button
                id="header-cart-btn"
                onClick={onOpenCart}
                className="flex items-center gap-2 px-3 sm:px-3.5 py-1.5 bg-slate-100/90 hover:bg-slate-200 text-[#0F172A] rounded-full border border-slate-200 transition-all duration-200 active:scale-95"
                aria-label="View Shopping Cart"
              >
                <div className="relative">
                  <ShoppingBag className="w-4 h-4 text-[#0F172A]" />
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 bg-[#3B82F6] text-white text-[10px] font-price-text rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                </div>
                <span className="hidden sm:inline text-xs font-btn-text text-slate-800">Cart</span>
              </button>

              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 text-slate-700 hover:text-slate-900 rounded-lg"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Search Row (Glass style) */}
          <div className="md:hidden px-4 pb-2.5 pt-1">
            <div className="relative flex items-center bg-slate-100/90 border border-slate-200 focus-within:border-[#3B82F6] rounded-full px-3 py-1 shadow-2xs">
              <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
              <input
                id="mobile-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-transparent text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="text-slate-400 hover:text-slate-600 p-0.5 mr-1 shrink-0"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
              <button
                type="button"
                onClick={() => scrollToSection('products-section')}
                className="px-2.5 py-1 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-[11px] font-bold rounded-full shadow-2xs shrink-0"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Navigation Bar: Matching Dark Sleek Categories Header in Screenshot */}
        <div className="bg-[#2D3339] border-t border-slate-700/60 border-b border-slate-800 text-xs shadow-md text-slate-200">
          <div className="w-full max-w-[1600px] 2xl:max-w-[1720px] mx-auto px-4 sm:px-6 flex items-center justify-between">
            {/* Scrollable list of categories */}
            <div className="flex items-center gap-1 sm:gap-2.5 overflow-x-auto py-2.5 scrollbar-none font-medium">
              <button
                onClick={() => {
                  onLogoClick?.();
                  onSelectCategory(null);
                  scrollToSection('products-section');
                }}
                className={`px-3 py-1 rounded-full text-xs font-nav-text whitespace-nowrap transition-all ${
                  selectedCategory === null
                    ? 'bg-[#3B82F6] text-white shadow-xs font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                All Products
              </button>

              {CATEGORIES.slice(0, 9).map((cat: Category) => (
                <button
                  key={cat._id}
                  id={`glass-cat-${cat.slug}`}
                  onClick={() => {
                    onLogoClick?.();
                    onSelectCategory(cat.slug);
                    scrollToSection('products-section');
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-nav-text whitespace-nowrap transition-all ${
                    selectedCategory === cat.slug
                      ? 'bg-[#3B82F6] text-white shadow-xs font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* "Become an Affiliate" highlighted link on right */}
            <button
              onClick={() => setIsAffiliateModalOpen(true)}
              className="ml-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 whitespace-nowrap transition-all shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Become an Affiliate</span>
            </button>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-[96px] z-50 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white/95 backdrop-blur-xl h-full max-h-[80vh] overflow-y-auto border-t border-slate-200 p-4 space-y-4 shadow-xl">
              {/* Brand Logo inside Mobile Drawer */}
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <img
                  src="/logo.png"
                  alt="DSP DIGITAL MART"
                  className="h-8.5 w-auto object-contain"
                />
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  Official Store
                </span>
              </div>

              {/* User Account / Login State */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                {currentUser ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{currentUser.name}</p>
                      <p className="text-[10px] text-slate-500">{currentUser.phone || currentUser.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenAuth?.('profile');
                      }}
                      className="px-2.5 py-1 text-xs font-bold text-blue-600 bg-white border border-blue-200 rounded-lg shadow-2xs"
                    >
                      My Account
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Customer Account</p>
                      <p className="text-[10px] text-slate-500">Sign in to view past orders and licenses</p>
                    </div>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenAuth?.('login');
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-[#3B82F6] rounded-xl shadow-xs"
                    >
                      Sign In
                    </button>
                  </div>
                )}
              </div>

              {/* Affiliate quick link */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsAffiliateModalOpen(true);
                }}
                className="w-full flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs font-bold"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Become an Affiliate / Reseller</span>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-400" />
              </button>

              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Categories</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-slate-500 hover:text-slate-700 text-xs font-semibold"
                >
                  Close
                </button>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    onSelectCategory(null);
                    setMobileMenuOpen(false);
                    scrollToSection('products-section');
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    selectedCategory === null ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  All Products
                </button>
                {CATEGORIES.map((cat: Category) => (
                  <button
                    key={cat._id}
                    onClick={() => {
                      onSelectCategory(cat.slug);
                      setMobileMenuOpen(false);
                      scrollToSection('products-section');
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                      selectedCategory === cat.slug ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                  </button>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="font-semibold text-slate-800">Contact & Support:</div>
                <p>WhatsApp: {SHOP_INFO.whatsappNumber}</p>
                <p>Email: {SHOP_INFO.emails[0]?.value}</p>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Become an Affiliate Modal */}
      {isAffiliateModalOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsAffiliateModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-sub-heading text-[#0F172A]">
                  Become an Affiliate & Reseller
                </h3>
                <p className="text-xs text-slate-500 font-body-text">
                  Official Partnership Program of DSP DIGITAL MART
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-600 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200 font-body-text">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong className="font-semibold text-slate-800">10% to 25% Direct Commission:</strong> High earnings on every digital subscription and license sale.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong className="font-semibold text-slate-800">Instant bKash/Nagad Payout:</strong> Withdraw your commission balance anytime without delay.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong className="font-semibold text-slate-800">Reseller Wholesale Rates:</strong> Full flexibility to set your own pricing for your clients.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong className="font-semibold text-slate-800">24/7 Dedicated Support:</strong> Dedicated partner assistance via WhatsApp whenever you need.</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <a
                href={`https://wa.me/${phone}?text=${encodeURIComponent('Hello DSP DIGITAL MART, I want to become an affiliate / reseller.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs sm:text-sm font-btn-text rounded-xl text-center flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Join via WhatsApp</span>
              </a>
              <button
                onClick={() => setIsAffiliateModalOpen(false)}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-btn-text rounded-xl transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

