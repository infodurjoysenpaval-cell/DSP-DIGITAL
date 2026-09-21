import React, { useState, useEffect, useRef } from 'react';
import { Search, ShoppingBag, Phone, Menu, X, ChevronRight, ChevronDown, Zap, ShieldCheck, User, Sparkles, Star, MessageCircle, ExternalLink, CheckCircle2, Wallet, ArrowRight, Loader2, Upload, FileText, Check } from 'lucide-react';
import { SHOP_INFO, CATEGORIES, PRODUCTS } from '../data/storeData';
import { Product, Category, UserProfile } from '../types';
import { registerUser, loginUser } from '../utils/authStorage';
import { saveAffiliateApplication } from '../utils/affiliateStorage';

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
  onUserChange?: (user: UserProfile | null) => void;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  onOpenDashboard?: (tab?: string) => void;
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
  onUserChange,
  onOpenAuth,
  onOpenDashboard,
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

  // Affiliate Application Form States
  const [affFullName, setAffFullName] = useState('');
  const [affPhone, setAffPhone] = useState('');
  const [affWhatsapp, setAffWhatsapp] = useState('');
  const [affEmail, setAffEmail] = useState('');
  const [affPassword, setAffPassword] = useState('');
  const [affChannelLink, setAffChannelLink] = useState('');
  const [affPayoutMethod, setAffPayoutMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [affAccountNumber, setAffAccountNumber] = useState('');
  const [affNidNumber, setAffNidNumber] = useState('');
  const [affDocName, setAffDocName] = useState('');
  const [affDocUrl, setAffDocUrl] = useState('');
  const [affSubmitting, setAffSubmitting] = useState(false);
  const [affError, setAffError] = useState('');
  const [affSuccess, setAffSuccess] = useState(false);

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setAffError('ফাইলের আকার সর্বোচ্চ ৮ মেগাবাইট (8MB) হতে পারবে।');
        return;
      }
      setAffDocName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setAffDocUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDirectAffiliateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAffError('');
    const cleanName = affFullName.trim();
    const cleanPhone = affPhone.trim();
    const cleanEmail = affEmail.trim();
    const cleanPass = affPassword.trim();
    const cleanAccount = affAccountNumber.trim();

    if (!cleanName || cleanName.length < 3) {
      setAffError('অনুগ্রহ করে আপনার পূর্ণ নাম লিখুন (কমপক্ষে ৩ অক্ষর)।');
      return;
    }
    const phoneDigits = cleanPhone.replace(/[^0-9]/g, '');
    if (phoneDigits.length !== 11 || !phoneDigits.startsWith('01')) {
      setAffError('অনুগ্রহ করে একটি সঠিক ১১-ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setAffError('অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা দিন।');
      return;
    }
    if (!cleanPass || cleanPass.length < 6) {
      setAffError('লগইন সুরক্ষার জন্য কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড দিন।');
      return;
    }
    if (!cleanAccount) {
      setAffError('উইথড্র করার জন্য আপনার বিকাশ/নগদ/রকেট নম্বরটি দিন।');
      return;
    }
    if (!affDocUrl) {
      setAffError('অ্যাডমিন ভেরিফিকেশনের জন্য আপনার অরিজিনাল এনআইডি/আইডি ডকুমেন্টের ছবি বা ফাইল সিলেক্ট করে আপলোড করুন।');
      return;
    }

    setAffSubmitting(true);
    setTimeout(() => {
      // 1. Try to register user account
      let res = registerUser(cleanName, cleanEmail, cleanPhone, cleanPass);
      let user = res.user;

      if (!res.success) {
        // If phone or email already registered, try logging them in with this password
        const loginRes = loginUser(cleanPhone, cleanPass);
        if (loginRes.success && loginRes.user) {
          user = loginRes.user;
        } else {
          setAffError(res.message || 'এই নম্বর বা ইমেইল দিয়ে ইতিপূর্বে একাউন্ট খোলা হয়েছে। অনুগ্রহ করে "সাইন ইন" করে আবেদন করুন।');
          setAffSubmitting(false);
          return;
        }
      }

      if (user) {
        // 2. Save affiliate application
        saveAffiliateApplication({
          userId: user.id,
          fullName: cleanName,
          contactNumber: cleanPhone,
          whatsappNumber: affWhatsapp.trim() || cleanPhone,
          email: user.email,
          channelLink: affChannelLink.trim() || 'Direct Affiliate Promotion',
          payoutMethod: affPayoutMethod,
          accountNumber: cleanAccount,
          nidNumber: affNidNumber.trim() || 'NID Provided in Application',
          documentUrl: affDocUrl || undefined,
          documentName: affDocName || undefined,
          status: 'pending',
        });

        // 3. Update state, notify user, close modal, and open user dashboard's affiliate tab
        onUserChange?.(user);
        setAffSubmitting(false);
        setAffSuccess(true);
        setTimeout(() => {
          setIsAffiliateModalOpen(false);
          setAffSuccess(false);
          onOpenDashboard?.('affiliate');
        }, 500);
      } else {
        setAffSubmitting(false);
      }
    }, 450);
  };

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
          {/* DESKTOP HEADER (md:flex) */}
          <div className="hidden md:flex w-full max-w-[1600px] 2xl:max-w-[1720px] mx-auto px-4 sm:px-6 py-2.5 items-center justify-between gap-3 sm:gap-6">
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

            {/* Center: Apple-style Pill Search Bar with circular search button */}
            <div ref={searchRef} className="flex-1 max-w-md lg:max-w-lg relative mx-2">
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
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-[#0052FF] hover:bg-[#0040CC] text-white rounded-full flex items-center justify-center transition-transform active:scale-95 shadow-2xs"
                  aria-label="Search"
                >
                  <Search className="w-3.5 h-3.5 text-white" />
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

            {/* Center-Right Navigation Links */}
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

              <button
                onClick={() => scrollToSection('footer-support-section')}
                className="py-1 border-b-2 border-transparent font-nav-text text-slate-700 hover:text-[#3B82F6] transition-all cursor-pointer"
              >
                SUPPORT
              </button>
            </nav>

            {/* Right: Wallet (when logged in) + Account/Sign In + Cart button */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              {currentUser && (
                <button
                  id="header-wallet-btn"
                  onClick={() => onOpenDashboard?.('wallet')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-blue-50/60 text-slate-700 text-xs font-semibold rounded-full border border-slate-200 transition-all hover:border-[#0052FF]/40 shadow-2xs active:scale-95"
                  title="My Wallet Balance"
                >
                  <Wallet className="w-3.5 h-3.5 text-[#0052FF]" />
                  <span className="font-price-text font-bold text-slate-900">
                    ৳{currentUser.walletBalance || 0}
                  </span>
                </button>
              )}

              {currentUser ? (
                currentUser.role === 'admin' ? (
                  <button
                    id="header-admin-panel-btn"
                    onClick={() => onOpenDashboard?.('admin')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-[#0052FF] to-[#00DFBA] hover:opacity-95 text-white text-xs font-bold rounded-full shadow-sm transition-all active:scale-95 cursor-pointer"
                    title="Open Admin Panel"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-300" />
                    <span>Admin Panel</span>
                  </button>
                ) : (
                  <button
                    id="header-user-profile-btn"
                    onClick={() => onOpenDashboard?.('dashboard')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-[#0F172A] text-xs font-semibold rounded-full border border-slate-200 transition-colors shadow-2xs active:scale-95"
                    title="My Account Dashboard"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#0052FF] text-white flex items-center justify-center text-[10px] font-bold shadow-2xs">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline max-w-[85px] truncate font-btn-text text-slate-800">
                      {currentUser.name.split(' ')[0]}
                    </span>
                  </button>
                )
              ) : (
                <button
                  id="header-login-btn"
                  onClick={() => onOpenAuth?.('login')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-800 hover:text-[#0052FF] text-xs font-semibold rounded-full border border-slate-200 transition-all shadow-2xs active:scale-95"
                  title="Sign In"
                >
                  <User className="w-3.5 h-3.5 text-slate-600" />
                  <span className="font-btn-text">Sign In</span>
                </button>
              )}

              <button
                id="header-cart-btn"
                onClick={onOpenCart}
                className="flex items-center gap-2 px-3 sm:px-3.5 py-1.5 bg-slate-100/90 hover:bg-slate-200 text-[#0F172A] rounded-full border border-slate-200 transition-all duration-200 active:scale-95"
                aria-label="View Shopping Cart"
              >
                <div className="relative">
                  <ShoppingBag className="w-4 h-4 text-[#0F172A]" />
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 bg-[#0052FF] text-white text-[10px] font-price-text font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                </div>
                <span className="hidden sm:inline text-xs font-btn-text text-slate-800">Cart</span>
              </button>
            </div>
          </div>

          {/* MOBILE HEADER (md:hidden) - MATCHES USER REFERENCE IMAGE */}
          <div className="md:hidden px-4 py-2.5 space-y-2.5">
            {/* Top Row: Hamburger (Left) | Brand Logo (Center) | Cart Icon (Right) */}
            <div className="flex items-center justify-between">
              {/* Left: Hamburger Menu Button */}
              <button
                id="mobile-header-hamburger-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6 stroke-[2.2]" /> : <Menu className="w-6 h-6 stroke-[2.2]" />}
              </button>

              {/* Center: DSP Digital Mart Logo */}
              <button
                id="mobile-site-logo-link"
                onClick={() => {
                  onLogoClick?.();
                  onSelectCategory(null);
                  onSearchChange('');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center justify-center focus:outline-none"
              >
                <img
                  src="/logo.png"
                  alt="DSP DIGITAL MART"
                  referrerPolicy="no-referrer"
                  className="h-8.5 w-auto max-w-[190px] object-contain select-none"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = SHOP_INFO.logoPrimary || '/logo.png';
                  }}
                />
              </button>

              {/* Right: Cart Icon with Badge */}
              <button
                id="mobile-header-cart-btn"
                onClick={onOpenCart}
                className="relative p-1.5 text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="View Shopping Cart"
              >
                <ShoppingBag className="w-6 h-6 text-slate-800" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 min-w-[18px] h-4.5 px-1 bg-[#0052FF] text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white shadow-2xs">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>

            {/* Bottom Row: Full Pill Search Bar with Circular Search Button */}
            <div className="relative">
              <div className="flex items-center bg-[#F3F4F6] border border-slate-200/90 focus-within:border-[#0052FF] rounded-full pl-4 pr-1 py-1 shadow-2xs transition-colors">
                <input
                  id="mobile-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  placeholder="Search products..."
                  className="w-full bg-transparent text-xs sm:text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none pr-2"
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="text-slate-400 hover:text-slate-600 p-1 mr-1 shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setSearchFocused(false);
                    scrollToSection('products-section');
                  }}
                  className="w-8 h-8 bg-[#0052FF] hover:bg-[#0040CC] active:scale-95 text-white rounded-full flex items-center justify-center shrink-0 shadow-2xs transition-transform"
                  aria-label="Search"
                >
                  <Search className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Mobile Live Autocomplete */}
              {searchFocused && (searchQuery.trim().length > 0 || searchResults.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white/98 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
                  {searchResults.length > 0 ? (
                    <div>
                      <div className="px-3.5 py-2 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex justify-between">
                        <span>Product Results ({searchResults.length})</span>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
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
                              className="w-full text-left px-3.5 py-2 hover:bg-blue-50/70 flex items-center gap-2.5 transition-colors group"
                            >
                              <img
                                src={prod.images[0]}
                                alt={prod.name}
                                referrerPolicy="no-referrer"
                                className="w-9 h-9 object-cover rounded-lg border border-slate-200 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-semibold text-slate-800 truncate">
                                  {prod.name}
                                </h4>
                                <span className="text-xs font-bold text-blue-600">৳{minPrice.toLocaleString()}</span>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-300" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-slate-500 text-xs font-medium">
                      No products found for "{searchQuery}".
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Secondary Navigation Bar: Hidden on mobile (hidden md:block), visible on desktop */}
        <div className="hidden md:block bg-[#2D3339] border-t border-slate-700/60 border-b border-slate-800 text-xs shadow-md text-slate-200">
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
                        onOpenDashboard?.('dashboard');
                      }}
                      className="px-2.5 py-1 text-xs font-bold text-[#FF6B00] bg-white border border-orange-200 rounded-lg shadow-2xs"
                    >
                      My Dashboard
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
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 relative my-auto animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsAffiliateModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 z-10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {currentUser ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 rounded-full border-[1.5px] border-slate-900 flex items-center justify-center text-slate-900 font-bold text-lg mx-auto shadow-xs">
                  $
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#0F172A]">Affiliate Program Dashboard</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Hello <strong className="text-slate-800">{currentUser.name}</strong>, you are currently logged in.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsAffiliateModalOpen(false);
                    onOpenDashboard?.('affiliate');
                  }}
                  className="w-full py-3.5 bg-[#FFB088] hover:bg-[#ff9c6b] text-white font-bold rounded-full shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <span>Go to Affiliate Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div>
                {/* Header matching screenshot 2: Dollar icon + Affiliate Program */}
                <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
                  <div className="w-6 h-6 rounded-full border-[1.5px] border-slate-900 flex items-center justify-center text-slate-900 font-bold text-xs shrink-0">
                    $
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-main-heading">
                    Affiliate Program
                  </h1>
                </div>

                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Apply to become an affiliate
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5 mb-5">
                    Fill in your details — our team will review and approve your application.
                  </p>
                </div>

                {affError && (
                  <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                    {affError}
                  </div>
                )}

                {affSuccess && (
                  <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Application submitted successfully! Redirecting to dashboard...</span>
                  </div>
                )}

                {/* Form matching screenshot 2 */}
                <form onSubmit={handleDirectAffiliateSubmit} className="space-y-4">
                  {/* Row 1: Full name + Contact number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        Full name
                      </label>
                      <input
                        type="text"
                        required
                        value={affFullName}
                        onChange={(e) => setAffFullName(e.target.value)}
                        placeholder="Your name"
                        className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 bg-white placeholder:text-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        Contact number
                      </label>
                      <input
                        type="tel"
                        required
                        value={affPhone}
                        onChange={(e) => setAffPhone(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 bg-white placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Row 2: WhatsApp number + Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        WhatsApp number
                      </label>
                      <input
                        type="tel"
                        value={affWhatsapp}
                        onChange={(e) => setAffWhatsapp(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 bg-white placeholder:text-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        value={affEmail}
                        onChange={(e) => setAffEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 bg-white placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Password field for account security */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Account Password
                    </label>
                    <input
                      type="password"
                      required
                      value={affPassword}
                      onChange={(e) => setAffPassword(e.target.value)}
                      placeholder="Minimum 6 characters password"
                      className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 bg-white placeholder:text-slate-400"
                    />
                  </div>

                  {/* Row 3: Page / Group / Channel link */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Page / Group / Channel link (where you'll sell)
                    </label>
                    <input
                      type="text"
                      value={affChannelLink}
                      onChange={(e) => setAffChannelLink(e.target.value)}
                      placeholder="https://facebook.com/yourpage"
                      className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 bg-white placeholder:text-slate-400"
                    />
                  </div>

                  {/* Row 4: Payout method + Account number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        Payout method
                      </label>
                      <div className="relative">
                        <select
                          value={affPayoutMethod}
                          onChange={(e) => setAffPayoutMethod(e.target.value as any)}
                          className="w-full appearance-none px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl text-slate-900 bg-white focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 cursor-pointer pr-10"
                        >
                          <option value="bKash">bKash</option>
                          <option value="Nagad">Nagad</option>
                          <option value="Rocket">Rocket</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        Account number
                      </label>
                      <input
                        type="tel"
                        required
                        value={affAccountNumber}
                        onChange={(e) => setAffAccountNumber(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 bg-white placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* NID / Document Upload Section for Admin Verification */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Verification Document (NID Card / Student ID / Trade License Photo) <span className="text-rose-500">*</span>
                    </label>
                    <p className="text-[11px] text-slate-500 mb-2">
                      অ্যাডমিন ভেরিফিকেশনের জন্য আপনার মূল আইডি কার্ডের পরিষ্কার ছবি বা ফাইল আপলোড করুন
                    </p>
                    <label className="flex items-center justify-between px-4 py-2.5 border border-dashed border-slate-300 rounded-xl bg-slate-50/80 hover:bg-slate-100 cursor-pointer text-slate-700 transition-colors">
                      <div className="flex items-center gap-2 text-xs font-medium truncate">
                        <Upload className="w-4 h-4 text-[#FF9B6D] shrink-0" />
                        <span className="truncate">{affDocName || 'Click to select NID / ID photo or PDF'}</span>
                      </div>
                      <span className="text-[11px] font-bold text-[#FF9B6D] shrink-0 ml-2">Browse</span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleDocUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Submit Button matching image 2: Pill peach button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={affSubmitting}
                      className="px-8 py-3 bg-[#FFB088] hover:bg-[#ff9c6b] active:scale-[0.99] text-white text-xs sm:text-sm font-semibold rounded-full text-center flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-60"
                    >
                      {affSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Submitting application...</span>
                        </>
                      ) : (
                        <span>Submit application</span>
                      )}
                    </button>
                  </div>

                  <div className="text-left pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAffiliateModalOpen(false);
                        onOpenAuth?.('login');
                      }}
                      className="text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors cursor-pointer"
                    >
                      Already have an account? <span className="underline font-semibold">Sign in</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

