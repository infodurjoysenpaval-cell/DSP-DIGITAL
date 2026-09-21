import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { CategoryBar } from './components/CategoryBar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailPage } from './components/ProductDetailPage';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { Footer } from './components/Footer';
import { WhatsAppFloating } from './components/WhatsAppFloating';
import { MobileBottomBar } from './components/MobileBottomBar';
import { AuthAccountModal } from './components/AuthAccountModal';
import { UserAccountDashboard } from './components/UserAccountDashboard';
import { CustomerReviewsStats } from './components/CustomerReviewsStats';
import { PolicyPageView } from './components/PolicyPageView';
import { ToastNotification, ToastData } from './components/ToastNotification';
import { PRODUCTS, CATEGORIES, SHOP_INFO } from './data/storeData';
import { Product, VariationItem, CartItem, OrderDetails, UserProfile } from './types';
import { getCurrentUser, logoutUser } from './utils/authStorage';
import { getLiveProducts, syncInitialProducts } from './utils/adminStore';
import { initTrackingScripts, trackGtmEvent } from './utils/trackingInjector';
import { checkIncomingEmailVerificationLink } from './utils/firebase';
import { AdminPanel } from './components/admin/AdminPanel';
import { isApprovedAffiliate, setActiveReferralCode } from './utils/affiliateStorage';
import { Sparkles, Zap, Flame, Shield, ArrowUpDown, Check, RefreshCw, ChevronRight, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function App() {
  // Main view state ('store', 'dashboard', or 'admin')
  const [currentView, setCurrentView] = useState<'store' | 'dashboard' | 'admin'>('store');
  const [dashboardTab, setDashboardTab] = useState<string>('dashboard');

  // Initialize Real Tracking (Meta Pixel, TikTok Pixel, Google Tag Manager, etc.)
  useEffect(() => {
    initTrackingScripts();

    // Check if user came from a Firebase email verification link
    const handleIncomingVerification = async () => {
      try {
        const linkResult = await checkIncomingEmailVerificationLink();
        if (linkResult.verified && linkResult.user) {
          setCurrentUser(linkResult.user);
          alert(`Your email (${linkResult.user.email}) has been verified successfully via Firebase! You are now logged in.`);
        }
      } catch (err) {
        console.warn('Incoming verification error:', err);
      }
    };
    handleIncomingVerification();
  }, []);

  // Live products managed by Admin Panel (changes reflect on live site)
  const [liveProducts, setLiveProducts] = useState<Product[]>(() => {
    syncInitialProducts(PRODUCTS);
    return getLiveProducts();
  });

  // Listen for admin live changes
  useEffect(() => {
    const handleProductsChange = () => {
      setLiveProducts(getLiveProducts());
    };
    window.addEventListener('dsp_products_updated', handleProductsChange);
    return () => window.removeEventListener('dsp_products_updated', handleProductsChange);
  }, []);

  // Countdown Timer for New Arrivals (Matching Image 1: 0-15 Hours, 0-52 Mins, 0-7 Sec)
  const [countdown, setCountdown] = useState({ hours: 15, mins: 52, secs: 7 });

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev.secs > 0) {
          return { ...prev, secs: prev.secs - 1 };
        } else if (prev.mins > 0) {
          return { ...prev, mins: prev.mins - 1, secs: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, mins: 59, secs: 59 };
        }
        return { hours: 23, mins: 59, secs: 59 };
      });
    }, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  // Cart state with localStorage persistence
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('dsp_digital_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('dsp_digital_cart', JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems]);

  // Modals & Navigation state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);
  const [isAffiliateOpen, setIsAffiliateOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<OrderDetails | null>(null);

  // Authentication & Customer state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<'all' | 'flash' | 'new' | 'verified'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'name'>('featured');

  // Check if current user is an approved affiliate
  const isAffiliate = isApprovedAffiliate(currentUser);

  // URL deep-linking, referral link capture, and browser back/forward navigation support
  useEffect(() => {
    const syncUrlState = () => {
      try {
        const url = new URL(window.location.href);
        const refParam = url.searchParams.get('ref');
        if (refParam) {
          setActiveReferralCode(refParam.trim());
        }
        const prodParam = url.searchParams.get('product');
        if (prodParam) {
          const found = PRODUCTS.find((p) => p.slug === prodParam || p._id === prodParam);
          if (found) {
            setSelectedProduct(found);
            return;
          }
        }
        setSelectedProduct(null);
      } catch {
        setSelectedProduct(null);
      }
    };

    try {
      const url = new URL(window.location.href);
      const refParam = url.searchParams.get('ref');
      if (refParam) {
        setActiveReferralCode(refParam.trim());
      }
      const prodParam = url.searchParams.get('product');
      if (prodParam) {
        const found = PRODUCTS.find((p) => p.slug === prodParam || p._id === prodParam);
        if (found) {
          setSelectedProduct(found);
        }
      }
    } catch {}

    window.addEventListener('popstate', syncUrlState);
    return () => window.removeEventListener('popstate', syncUrlState);
  }, []);

  // Open customer account dashboard or admin panel
  const handleOpenDashboard = (tab?: string, targetUser?: UserProfile | null) => {
    const active = targetUser || currentUser || getCurrentUser();
    if (!active) {
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
      return;
    }
    if (active.role === 'admin' || tab === 'admin') {
      setCurrentView('admin');
      setSelectedProduct(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setDashboardTab(tab || 'dashboard');
    setCurrentView('dashboard');
    setSelectedProduct(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (product: Product) => {
    setCurrentView('store');
    setSelectedPolicy(null);
    setSelectedProduct(product);
    window.scrollTo({ top: 0, behavior: 'instant' });
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('product', product.slug || product._id);
      window.history.pushState({ productId: product._id }, '', url.toString());
    } catch {}
  };

  const handleBackFromProduct = () => {
    setCurrentView('store');
    setSelectedProduct(null);
    setSelectedPolicy(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('product');
      window.history.pushState({}, '', url.toString());
    } catch {}
  };

  // Toast notification state
  const [toastData, setToastData] = useState<ToastData | null>(null);
  const handleCloseToast = useCallback(() => {
    setToastData(null);
  }, []);

  const showToast = (
    msg: string,
    product?: Product,
    variation?: VariationItem | null,
    quantity: number = 1
  ) => {
    setToastData({
      id: Date.now().toString(),
      message: msg,
      product,
      selectedVariation: variation,
      quantity,
      type: 'cart',
    });
  };

  // Cart operations
  const handleAddToCart = (product: Product, variation?: VariationItem, quantity: number = 1) => {
    setCartItems((prev) => {
      const varId = variation?._id || 'default';
      const existingIndex = prev.findIndex(
        (item) => item.product._id === product._id && (item.selectedVariation?._id || 'default') === varId
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prev,
          {
            product,
            selectedVariation: variation || null,
            quantity,
          },
        ];
      }
    });

    showToast(`"${product.name}" added to cart!`, product, variation || null, quantity);

    trackGtmEvent('add_to_cart', {
      currency: 'BDT',
      value: (variation?.salePrice ?? product.salePrice) * quantity,
      items: [
        {
          item_id: product._id,
          item_name: product.name,
          item_variant: variation?.name || undefined,
          price: variation?.salePrice ?? product.salePrice,
          quantity,
        },
      ],
    });
  };

  const handleQuickBuy = (product: Product, variation?: VariationItem, quantity: number = 1) => {
    handleAddToCart(product, variation, quantity);
    setIsCheckoutOpen(true);
  };

  const handleUpdateQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(index);
    } else {
      setCartItems((prev) => {
        const updated = [...prev];
        updated[index].quantity = newQty;
        return updated;
      });
    }
  };

  const handleRemoveItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
    showToast('Item removed from cart');
  };

  const handleOrderSuccess = (order: OrderDetails) => {
    setCompletedOrder(order);
    setIsCheckoutOpen(false);
    setCartItems([]);
  };

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return liveProducts.filter((prod) => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = prod.name.toLowerCase().includes(query);
        const matchesKeywords = prod.seoKeyword?.toLowerCase().includes(query);
        if (!matchesName && !matchesKeywords) return false;
      }

      // Category filter
      if (selectedCategory) {
        const catSlug = typeof prod.category === 'object' && prod.category !== null
          ? prod.category.slug
          : prod.categories?.[0]?.slug;

        const matchesCat = catSlug === selectedCategory ||
          (typeof prod.category === 'string' && prod.category === selectedCategory);

        if (!matchesCat) {
          // Check categories array
          const inCategories = prod.categories?.some((c) => c.slug === selectedCategory);
          if (!inCategories) return false;
        }
      }

      // Tag filter
      if (activeTag === 'flash') {
        const hasFlash = prod.tags?.some((t) => t.name.toLowerCase().includes('flash'));
        if (!hasFlash) return false;
      } else if (activeTag === 'new') {
        const hasNew = prod.tags?.some((t) => t.name.toLowerCase().includes('new'));
        if (!hasNew) return false;
      } else if (activeTag === 'verified') {
        const isVerified = prod.name.toLowerCase().includes('verified') ||
          prod.tags?.some((t) => t.name.toLowerCase().includes('verified'));
        if (!isVerified) return false;
      }

      return true;
    }).sort((a, b) => {
      const getMinPrice = (p: Product) => {
        if (p.variationList && p.variationList.length > 0) {
          return Math.min(...p.variationList.map((v) => v.salePrice));
        }
        return p.salePrice || 0;
      };

      if (sortBy === 'price-low') {
        return getMinPrice(a) - getMinPrice(b);
      }
      if (sortBy === 'price-high') {
        return getMinPrice(b) - getMinPrice(a);
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0; // Default order
    });
  }, [liveProducts, searchQuery, selectedCategory, activeTag, sortBy]);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const activeCategoryObj = CATEGORIES.find((c) => c.slug === selectedCategory);

  // Check if we are in "Home Showcase" mode (multi-section layout matching Image 1)
  const isShowcaseMode = !selectedCategory && !searchQuery.trim() && activeTag === 'all';

  // Section 1: New Arrivals (Flash sale / new arrival tags or top trending items)
  const newArrivalProducts = useMemo(() => {
    const list = liveProducts.filter((p) =>
      p.tags?.some((t) => {
        const n = t.name.toLowerCase();
        return n.includes('new') || n.includes('arrival') || n.includes('flash');
      })
    );
    return list.length >= 5 ? list.slice(0, 10) : liveProducts.slice(0, 10);
  }, [liveProducts]);

  // Section 2: Verified Accounts
  const verifiedAccountProducts = useMemo(() => {
    const list = liveProducts.filter((p) => {
      const catSlug = typeof p.category === 'object' && p.category !== null ? p.category.slug : '';
      return (
        catSlug === 'verified-accounts' ||
        p.categories?.some((c) => c.slug === 'verified-accounts') ||
        p.tags?.some((t) => t.name.toLowerCase().includes('verified')) ||
        p.name.toLowerCase().includes('verified') ||
        p.name.toLowerCase().includes('account')
      );
    });
    return list.length >= 5 ? list.slice(0, 10) : liveProducts.filter((p) => (p.salePrice || 0) > 800).slice(0, 10);
  }, [liveProducts]);

  // Section 3: Subscriptions & AI Tools
  const subscriptionProducts = useMemo(() => {
    const list = liveProducts.filter((p) => {
      const catSlug = typeof p.category === 'object' && p.category !== null ? p.category.slug : '';
      return (
        catSlug === 'subscriptions' ||
        catSlug === 'ai-tools' ||
        catSlug === 'education-learning-tools' ||
        p.categories?.some((c) => c.slug === 'subscriptions' || c.slug === 'ai-tools') ||
        p.name.toLowerCase().includes('subscription') ||
        p.name.toLowerCase().includes('claude') ||
        p.name.toLowerCase().includes('chatgpt') ||
        p.name.toLowerCase().includes('canva')
      );
    });
    return list.length >= 5 ? list.slice(0, 10) : liveProducts.slice(5, 15);
  }, [liveProducts]);

  // Section 4: Windows Utility & VPN Security Keys
  const utilityAndVpnProducts = useMemo(() => {
    const list = liveProducts.filter((p) => {
      const catSlug = typeof p.category === 'object' && p.category !== null ? p.category.slug : '';
      return (
        catSlug === 'vpn-online-security' ||
        catSlug === 'windows-utility-key' ||
        p.categories?.some((c) => c.slug === 'vpn-online-security' || c.slug === 'windows-utility-key') ||
        p.name.toLowerCase().includes('vpn') ||
        p.name.toLowerCase().includes('windows') ||
        p.name.toLowerCase().includes('key') ||
        p.name.toLowerCase().includes('internet download manager')
      );
    });
    return list.length >= 5 ? list.slice(0, 10) : liveProducts.slice(10, 20);
  }, [liveProducts]);

  // If current view is Admin Panel and user is admin, render the full admin dashboard
  if (currentView === 'admin' && currentUser?.role === 'admin') {
    return (
      <AdminPanel
        currentUser={currentUser}
        onVisitWebsite={() => {
          setCurrentView('store');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onLogout={() => {
          logoutUser();
          setCurrentUser(null);
          setCurrentView('store');
          showToast('Logged out successfully');
        }}
        onViewProductOnSite={(prod) => {
          setCurrentView('store');
          handleSelectProduct(prod);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] pb-16 md:pb-0">
      {/* Header */}
      <Header
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        selectedCategory={selectedCategory}
        onSelectCategory={(slug) => {
          handleBackFromProduct();
          setSelectedCategory(slug);
          if (slug) {
            const el = document.getElementById('products-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectProduct={(product) => handleSelectProduct(product)}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        currentUser={currentUser}
        onOpenAuth={(mode) => {
          setAuthModalMode(mode || (currentUser ? 'login' : 'login'));
          setIsAuthModalOpen(true);
        }}
        onOpenDashboard={handleOpenDashboard}
        onLogoClick={handleBackFromProduct}
        isAffiliateOpen={isAffiliateOpen}
        setIsAffiliateOpen={setIsAffiliateOpen}
      />

      <main className="flex-1">
        {currentView === 'dashboard' && currentUser ? (
          <UserAccountDashboard
            currentUser={currentUser}
            onUserChange={(updated) => {
              setCurrentUser(updated);
              if (!updated) {
                setCurrentView('store');
              }
            }}
            onBrowseProducts={() => {
              setCurrentView('store');
              setSelectedProduct(null);
              setSelectedPolicy(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            initialTab={dashboardTab}
            onOpenAdmin={() => {
              setCurrentView('admin');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : selectedPolicy ? (
          <PolicyPageView
            policyKey={selectedPolicy}
            onBack={() => {
              setSelectedPolicy(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : selectedProduct ? (
          <ProductDetailPage
            product={selectedProduct}
            onBack={handleBackFromProduct}
            onSelectProduct={handleSelectProduct}
            onSelectCategory={(catSlug) => {
              handleBackFromProduct();
              setSelectedCategory(catSlug);
              setTimeout(() => {
                const el = document.getElementById('products-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }, 50);
            }}
            onAddToCart={(prod, variation, qty) => handleAddToCart(prod, variation, qty || 1)}
            onBuyNow={(prod, variation, qty) => handleQuickBuy(prod, variation, qty || 1)}
            onOpenAffiliate={() => handleOpenDashboard('affiliate')}
            isAffiliate={isAffiliate}
          />
        ) : (
          <>
            {/* Banner Carousel & Trust Bar */}
            <HeroBanner />

            {/* Categories Showcase Grid */}
            <CategoryBar
              selectedCategory={selectedCategory}
              onSelectCategory={(slug) => {
                setSelectedCategory(slug);
                const el = document.getElementById('products-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* Products Section - Full Screen Width layout matching Image 1 */}
            <section id="products-section" className="w-full max-w-[1600px] 2xl:max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-16">
          {isShowcaseMode ? (
            /* Multi-Section Showcase Mode matching Image 1 */
            <div className="space-y-12 sm:space-y-16">
              {/* Section 1: New Arrivals with Countdown Timer */}
              <div id="new-arrivals-section">
                <div className="flex items-center justify-between gap-3 pb-3 sm:pb-4 mb-4 sm:mb-6 border-b border-slate-200">
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-main-heading text-[#0F172A] tracking-tight">
                      New Arrivals
                    </h2>
                    {/* Countdown Timer Badges matching sleek digital aesthetic */}
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <span className="bg-blue-50 text-[#0052FF] border border-blue-200/90 font-mono font-bold text-[11px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg shadow-2xs whitespace-nowrap">
                        0-{String(countdown.hours).padStart(2, '0')} Hours
                      </span>
                      <span className="bg-blue-50 text-[#0052FF] border border-blue-200/90 font-mono font-bold text-[11px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg shadow-2xs whitespace-nowrap">
                        0-{String(countdown.mins).padStart(2, '0')} Mins
                      </span>
                      <span className="bg-blue-50 text-[#0052FF] border border-blue-200/90 font-mono font-bold text-[11px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg shadow-2xs whitespace-nowrap">
                        0-{String(countdown.secs).padStart(2, '0')} Sec
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTag('new');
                      const el = document.getElementById('products-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-xs sm:text-sm font-btn-text text-slate-700 hover:text-blue-600 flex items-center gap-1 shrink-0 transition-colors"
                  >
                    <span>View All</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5 gap-3.5 sm:gap-5 lg:gap-6">
                  {newArrivalProducts.map((prod) => (
                    <ProductCard
                      key={prod._id}
                      product={prod}
                      onViewProduct={(p) => handleSelectProduct(p)}
                      onAddToCart={(p, v) => handleAddToCart(p, v, 1)}
                      onQuickBuy={(p, v) => handleQuickBuy(p, v, 1)}
                      isAffiliate={isAffiliate}
                    />
                  ))}
                </div>
              </div>

              {/* Section 2: Verified Accounts */}
              <div id="verified-accounts-section">
                <div className="flex items-center justify-between gap-3 pb-3 sm:pb-4 mb-4 sm:mb-6 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-main-heading text-[#0F172A] tracking-tight">
                      Verified Accounts
                    </h2>
                    <span className="hidden sm:inline-flex items-center gap-1 text-xs font-body-text font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 100% KYC Verified
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedCategory('verified-accounts');
                      const el = document.getElementById('products-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-xs sm:text-sm font-btn-text text-slate-700 hover:text-blue-600 flex items-center gap-1 shrink-0 transition-colors"
                  >
                    <span>View All</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5 gap-3.5 sm:gap-5 lg:gap-6">
                  {verifiedAccountProducts.map((prod) => (
                    <ProductCard
                      key={prod._id}
                      product={prod}
                      onViewProduct={(p) => handleSelectProduct(p)}
                      onAddToCart={(p, v) => handleAddToCart(p, v, 1)}
                      onQuickBuy={(p, v) => handleQuickBuy(p, v, 1)}
                      isAffiliate={isAffiliate}
                    />
                  ))}
                </div>
              </div>

              {/* Section 3: AI Tools & Subscriptions */}
              <div id="subscriptions-section">
                <div className="flex items-center justify-between gap-3 pb-3 sm:pb-4 mb-4 sm:mb-6 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-main-heading text-[#0F172A] tracking-tight">
                      AI Tools & Premium Subscriptions
                    </h2>
                    <span className="hidden sm:inline-flex items-center gap-1 text-xs font-body-text font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Instant Delivery
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedCategory('subscriptions');
                      const el = document.getElementById('products-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-xs sm:text-sm font-btn-text text-slate-700 hover:text-blue-600 flex items-center gap-1 shrink-0 transition-colors"
                  >
                    <span>View All</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5 gap-3.5 sm:gap-5 lg:gap-6">
                  {subscriptionProducts.map((prod) => (
                    <ProductCard
                      key={prod._id}
                      product={prod}
                      onViewProduct={(p) => handleSelectProduct(p)}
                      onAddToCart={(p, v) => handleAddToCart(p, v, 1)}
                      onQuickBuy={(p, v) => handleQuickBuy(p, v, 1)}
                      isAffiliate={isAffiliate}
                    />
                  ))}
                </div>
              </div>

              {/* Section 4: Windows Utility Key & VPN Security */}
              <div id="utility-vpn-section">
                <div className="flex items-center justify-between gap-3 pb-3 sm:pb-4 mb-4 sm:mb-6 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-main-heading text-[#0F172A] tracking-tight">
                      Windows & VPN Security Keys
                    </h2>
                    <span className="hidden sm:inline-flex items-center gap-1 text-xs font-body-text font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> Genuine Licenses
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedCategory('windows-utility-key');
                      const el = document.getElementById('products-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-xs sm:text-sm font-btn-text text-slate-700 hover:text-blue-600 flex items-center gap-1 shrink-0 transition-colors"
                  >
                    <span>View All</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5 gap-3.5 sm:gap-5 lg:gap-6">
                  {utilityAndVpnProducts.map((prod) => (
                    <ProductCard
                      key={prod._id}
                      product={prod}
                      onViewProduct={(p) => handleSelectProduct(p)}
                      onAddToCart={(p, v) => handleAddToCart(p, v, 1)}
                      onQuickBuy={(p, v) => handleQuickBuy(p, v, 1)}
                      isAffiliate={isAffiliate}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Filtered Single Grid View (Search, Category Filter, or Tag selected) */
            <div>
              {/* Back to All Sections navigation button */}
              <div className="mb-4">
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setActiveTag('all');
                    setSearchQuery('');
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-btn-text rounded-xl border border-slate-200 hover:border-blue-500 transition-all shadow-2xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-blue-600" />
                  <span>Back to All Sections</span>
                </button>
              </div>

              {/* Section Header & Tag Filters */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2 text-xs font-btn-text text-blue-600 uppercase tracking-wider mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>DSP DIGITAL MART PRODUCTS</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-main-heading text-[#0F172A]">
                    {searchQuery.trim()
                      ? `Search: "${searchQuery}"`
                      : activeCategoryObj
                      ? activeCategoryObj.name
                      : activeTag === 'flash'
                      ? 'Flash Sale Collection'
                      : activeTag === 'new'
                      ? 'New Arrivals Collection'
                      : activeTag === 'verified'
                      ? 'Verified Accounts Collection'
                      : 'All Digital Products & Subscriptions'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 font-body-text">
                    {filteredProducts.length} official & genuine products available
                  </p>
                </div>

                {/* Controls: Tag Pills & Sort */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  {/* Tag filters */}
                  <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                    <button
                      onClick={() => setActiveTag('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-btn-text transition-all ${
                        activeTag === 'all'
                          ? 'bg-[#2563EB] text-white shadow-2xs'
                          : 'text-slate-600 hover:text-blue-600'
                      }`}
                    >
                      All Products
                    </button>

                    <button
                      onClick={() => setActiveTag('flash')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-btn-text transition-all flex items-center gap-1.5 ${
                        activeTag === 'flash'
                          ? 'bg-[#2563EB] text-white shadow-2xs'
                          : 'text-slate-600 hover:text-amber-600'
                      }`}
                    >
                      <Flame className={`w-3.5 h-3.5 fill-current ${activeTag === 'flash' ? 'text-amber-300' : 'text-amber-500'}`} />
                      <span>Flash Sale</span>
                    </button>

                    <button
                      onClick={() => setActiveTag('new')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-btn-text transition-all flex items-center gap-1.5 ${
                        activeTag === 'new'
                          ? 'bg-[#2563EB] text-white shadow-2xs'
                          : 'text-slate-600 hover:text-blue-600'
                      }`}
                    >
                      <Zap className={`w-3.5 h-3.5 fill-current ${activeTag === 'new' ? 'text-blue-200' : 'text-blue-500'}`} />
                      <span>New Arrivals</span>
                    </button>

                    <button
                      onClick={() => setActiveTag('verified')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-btn-text transition-all flex items-center gap-1.5 ${
                        activeTag === 'verified'
                          ? 'bg-[#2563EB] text-white shadow-2xs'
                          : 'text-slate-600 hover:text-emerald-600'
                      }`}
                    >
                      <Shield className={`w-3.5 h-3.5 ${activeTag === 'verified' ? 'text-emerald-200' : 'text-emerald-500'}`} />
                      <span>Verified Accounts</span>
                    </button>
                  </div>

                  {/* Sort Selector */}
                  <div className="relative flex items-center">
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                    <select
                      id="product-sort-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="pl-8 pr-7 py-2 bg-white border border-slate-200 rounded-xl text-xs font-body-text font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs cursor-pointer"
                    >
                      <option value="featured">Featured / Popular</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="name">Name (A-Z)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              {filteredProducts.length > 0 ? (
                <div className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5 gap-3.5 sm:gap-5 lg:gap-6">
                  {filteredProducts.map((prod) => (
                    <ProductCard
                      key={prod._id}
                      product={prod}
                      onViewProduct={(p) => handleSelectProduct(p)}
                      onAddToCart={(p, v) => handleAddToCart(p, v, 1)}
                      onQuickBuy={(p, v) => handleQuickBuy(p, v, 1)}
                      isAffiliate={isAffiliate}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200 mt-6 p-8">
                  <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <RefreshCw className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-sub-heading text-slate-800">
                    No products found
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto font-body-text">
                    There are currently no products matching your selected category or filter. Try a different filter.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setActiveTag('all');
                      setSearchQuery('');
                    }}
                    className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-btn-text rounded-xl transition-colors"
                  >
                    View All Products
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </>
    )}
  </main>

  {/* Customer Reviews & Stats Section (only shown on store view) */}
  {currentView !== 'dashboard' && <CustomerReviewsStats />}

  {/* Footer */}
  <Footer
    onSelectCategory={(slug) => {
      setCurrentView('store');
      setSelectedPolicy(null);
      setSelectedCategory(slug);
    }}
    onSelectPolicy={(policyKey) => {
      setSelectedPolicy(policyKey);
      setSelectedProduct(null);
      setCurrentView('store');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }}
  />

  {/* Floating WhatsApp Quick Support */}
  <WhatsAppFloating />

  {/* Mobile Bottom Navigation Bar */}
  <MobileBottomBar
    cartCount={totalCartCount}
    onOpenCart={() => setIsCartOpen(true)}
    selectedCategory={selectedCategory}
    onSelectCategory={(slug) => {
      handleBackFromProduct();
      setSelectedCategory(slug);
      setMobileMenuOpen(false);
      const el = document.getElementById('products-section');
      el?.scrollIntoView({ behavior: 'smooth' });
    }}
    onOpenCategories={() => {
      handleBackFromProduct();
      const el = document.getElementById('products-section');
      el?.scrollIntoView({ behavior: 'smooth' });
    }}
    onFocusSearch={() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        const el =
          document.getElementById('mobile-search-input') ||
          document.getElementById('desktop-search-input');
        el?.focus();
      }, 150);
    }}
    searchQuery={searchQuery}
    currentUser={currentUser}
    onOpenAuth={(mode) => {
      setAuthModalMode(mode || 'login');
      setIsAuthModalOpen(true);
    }}
    onOpenDashboard={handleOpenDashboard}
    onOpenMenu={() => setMobileMenuOpen((prev) => !prev)}
  />

  {/* Cart Slide-Over Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedCheckout={() => setIsCheckoutOpen(true)}
        currentUser={currentUser}
      />

      {/* Digital Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        onOrderSuccess={handleOrderSuccess}
        currentUser={currentUser}
        onOpenAuth={(mode) => {
          setAuthModalMode(mode || 'login');
          setIsAuthModalOpen(true);
        }}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onBackToCart={() => {
          setIsCheckoutOpen(false);
          setIsCartOpen(true);
        }}
      />

      {/* Customer Authentication & Profile Modal */}
      <AuthAccountModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUserChange={(user) => {
          setCurrentUser(user);
          if (user) {
            showToast(`Welcome back, ${user.name}!`);
            if (user.role === 'admin') {
              setCurrentView('admin');
              setIsAuthModalOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }
        }}
        initialMode={authModalMode}
        onOpenDashboard={(user) => handleOpenDashboard('dashboard', user)}
      />

      {/* Order Success Screen */}
      <OrderSuccessModal
        order={completedOrder}
        onClose={() => setCompletedOrder(null)}
        onViewOrders={() => {
          handleOpenDashboard('orders');
        }}
      />

      {/* Global Interactive Add-to-Cart Toast Notification */}
      <ToastNotification
        toast={toastData}
        onClose={handleCloseToast}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
      />
    </div>
  );
}
