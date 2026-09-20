import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Sliders,
  Settings,
  Grid,
  FileText,
  Target,
  Percent,
  Users,
  BarChart3,
  MapPin,
  ClipboardList,
  Truck,
  Clock,
  PieChart,
  Zap,
  CreditCard,
  Star,
  DollarSign,
  Activity,
  ShieldAlert,
  Image,
  Layers,
  Search,
  TrendingDown,
  Bell,
  ShieldCheck,
  Smartphone,
  Headphones,
  PlayCircle,
  Sparkles,
  User,
  LogOut,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Code2,
  X,
} from 'lucide-react';
import { SHOP_INFO } from '../../data/storeData';

export type AdminTab =
  | 'dashboard'
  | 'orders'
  | 'incomplete-orders'
  | 'products'
  | 'customization'
  | 'theme-view'
  | 'website-info'
  | 'carousel'
  | 'banner'
  | 'popup'
  | 'settings'
  | 'catalog'
  | 'landing-page'
  | 'daily-target'
  | 'coupon'
  | 'customer'
  | 'affiliates'
  | 'reports'
  | 'sub-area'
  | 'requisition'
  | 'suppliers'
  | 'purchase-history'
  | 'stock-adjustment'
  | 'damage'
  | 'balance-sheet'
  | 'review'
  | 'income'
  | 'activity-log'
  | 'ip-block'
  | 'gallery'
  | 'additional-pages'
  | 'seo-pages'
  | 'expense'
  | 'user-notification'
  | 'admin-control'
  | 'app-setup'
  | 'support'
  | 'tutorials'
  | 'new-release'
  | 'profile';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onVisitWebsite: () => void;
  onLogout: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onTabChange: onTabChangeProp,
  onVisitWebsite,
  onLogout,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  // Collapsible menu states
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    orders: true,
    customization: true,
    customer: true,
    'admin-control': true,
  });

  const toggleMenu = (key: string) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isTabActive = (tab: AdminTab) => activeTab === tab;

  // Intercept onTabChange so clicking on mobile auto-closes drawer
  const onTabChange = (tab: AdminTab) => {
    onTabChangeProp(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const renderNavContent = () => (
    <div className="flex flex-col h-full bg-white select-none overflow-hidden">
      {/* Top Store Branding Matching Store Logo */}
      <div className="h-16 sm:h-18 px-4 border-b border-slate-200/80 flex items-center justify-between shrink-0 bg-white">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center p-1.5 overflow-hidden shrink-0 shadow-2xs">
            <img
              src="/emblem.png"
              alt={SHOP_INFO.websiteName || 'DSP Digital Mart'}
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo.png';
              }}
            />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-extrabold text-slate-900 leading-tight truncate">
              {SHOP_INFO.websiteName || 'DSP Digital Mart'}
            </h2>
            <button
              onClick={() => {
                onVisitWebsite();
                if (onCloseMobile) onCloseMobile();
              }}
              className="text-[11px] font-semibold text-slate-500 hover:text-[#0052FF] flex items-center gap-1 transition-colors mt-0.5"
            >
              <span>Visit website</span>
              <span className="text-[9px]">›</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              onVisitWebsite();
              if (onCloseMobile) onCloseMobile();
            }}
            title="Switch to Storefront"
            className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Code2 className="w-4 h-4" />
          </button>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Nav Items List (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-200">
        {/* 1. Dashboard */}
        <button
          onClick={() => onTabChange('dashboard')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            isTabActive('dashboard')
              ? 'bg-[#0052FF] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        {/* 2. Orders (Collapsible) */}
        <div>
          <button
            onClick={() => {
              toggleMenu('orders');
              onTabChange('orders');
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'orders' || activeTab === 'incomplete-orders'
                ? 'bg-slate-100 text-[#0052FF]'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-4 h-4" />
              <span>Orders</span>
            </div>
            {openMenus['orders'] ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {openMenus['orders'] && (
            <div className="pl-9 pr-2 py-1 space-y-1">
              <button
                onClick={() => onTabChange('orders')}
                className={`w-full text-left py-1.5 px-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
                  isTabActive('orders') ? 'text-[#0052FF] font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                <span>All Orders</span>
              </button>
              <button
                onClick={() => onTabChange('incomplete-orders')}
                className={`w-full text-left py-1.5 px-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
                  isTabActive('incomplete-orders') ? 'text-[#0052FF] font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                <span>Incomplete Orders</span>
              </button>
            </div>
          )}
        </div>

        {/* 3. Products */}
        <button
          onClick={() => onTabChange('products')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            isTabActive('products')
              ? 'bg-[#0052FF] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Products</span>
        </button>

        {/* 4. Customization (Collapsible) */}
        <div>
          <button
            onClick={() => {
              toggleMenu('customization');
              onTabChange('theme-view');
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'theme-view' || activeTab === 'customization' || activeTab === 'carousel' || activeTab === 'banner'
                ? 'bg-[#0052FF] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Sliders className="w-4 h-4" />
              <span>Customization</span>
            </div>
            {openMenus['customization'] ? (
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 opacity-70" />
            )}
          </button>

          {openMenus['customization'] && (
            <div className="pl-9 pr-2 py-1 space-y-1">
              <button
                onClick={() => onTabChange('carousel')}
                className={`w-full text-left py-1.5 px-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
                  isTabActive('carousel') ? 'text-[#0052FF] font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                <span>Carousel</span>
              </button>
              <button
                onClick={() => onTabChange('banner')}
                className={`w-full text-left py-1.5 px-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
                  isTabActive('banner') ? 'text-[#0052FF] font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                <span>Banner</span>
              </button>
              <button
                onClick={() => onTabChange('popup')}
                className={`w-full text-left py-1.5 px-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
                  isTabActive('popup') ? 'text-[#0052FF] font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                <span>PopUp</span>
              </button>
              <button
                onClick={() => onTabChange('website-info')}
                className={`w-full text-left py-1.5 px-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
                  isTabActive('website-info') ? 'text-[#0052FF] font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                <span>Website Information</span>
              </button>
              <button
                onClick={() => onTabChange('theme-view')}
                className={`w-full text-left py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
                  isTabActive('theme-view')
                    ? 'text-[#0052FF] font-bold bg-blue-50'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#0052FF]"></span>
                <span>Theme View</span>
              </button>
              <button
                onClick={() => onTabChange('additional-pages')}
                className={`w-full text-left py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
                  isTabActive('additional-pages')
                    ? 'text-[#0052FF] font-bold bg-blue-50'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#0052FF]"></span>
                <span>Pages & Policies (পেজ এডিটর)</span>
              </button>
            </div>
          )}
        </div>

        {/* 5. Settings */}
        <button
          onClick={() => onTabChange('settings')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            isTabActive('settings')
              ? 'bg-[#0052FF] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>

        {/* 6. Catalog */}
        <button
          onClick={() => onTabChange('catalog')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            isTabActive('catalog') ? 'bg-[#0052FF] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <Grid className="w-4 h-4" />
            <span>Catalog</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 opacity-70" />
        </button>

        {/* 7. Landing page */}
        <button
          onClick={() => onTabChange('landing-page')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            isTabActive('landing-page') ? 'bg-[#0052FF] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <FileText className="w-4 h-4" />
            <span>Landing page</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 opacity-70" />
        </button>

        {/* 8. Daily Target */}
        <button
          onClick={() => onTabChange('daily-target')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            isTabActive('daily-target') ? 'bg-[#0052FF] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Daily Target</span>
        </button>

        {/* 9. Coupon */}
        <button
          onClick={() => onTabChange('coupon')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            isTabActive('coupon') ? 'bg-[#0052FF] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Percent className="w-4 h-4" />
          <span>Coupon</span>
        </button>

        {/* 10. Customer (Collapsible) */}
        <div>
          <button
            onClick={() => {
              toggleMenu('customer');
              onTabChange('customer');
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              isTabActive('customer')
                ? 'bg-[#0052FF] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4" />
              <span>Customer</span>
            </div>
            {openMenus['customer'] ? (
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 opacity-70" />
            )}
          </button>

          {openMenus['customer'] && (
            <div className="pl-9 pr-2 py-1 space-y-1">
              <button
                onClick={() => onTabChange('customer')}
                className={`w-full text-left py-1.5 px-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
                  isTabActive('customer') ? 'text-[#0052FF] font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#0052FF]"></span>
                <span>All Users</span>
              </button>
              <button
                onClick={() => onTabChange('affiliates')}
                className={`w-full text-left py-1.5 px-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
                  isTabActive('affiliates') ? 'text-[#0052FF] font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#0052FF]"></span>
                <span>Affiliate Documents (অ্যাফিলিয়েট)</span>
              </button>
            </div>
          )}
        </div>

        {/* 11. Reports */}
        <button
          onClick={() => onTabChange('reports')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            isTabActive('reports') ? 'bg-[#0052FF] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <BarChart3 className="w-4 h-4" />
            <span>Reports</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 opacity-70" />
        </button>

        {/* 12. Sub Area */}
        <button
          onClick={() => onTabChange('sub-area')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            isTabActive('sub-area') ? 'bg-[#0052FF] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Sub Area</span>
        </button>

        {/* 13. Requisition */}
        <button
          onClick={() => onTabChange('requisition')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            isTabActive('requisition') ? 'bg-[#0052FF] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Requisition</span>
        </button>

        {/* 14. Suppliers */}
        <button
          onClick={() => onTabChange('suppliers')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            isTabActive('suppliers') ? 'bg-[#0052FF] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <Truck className="w-4 h-4" />
            <span>Suppliers</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 opacity-70" />
        </button>

        {/* 15. Purchase History */}
        <button
          onClick={() => onTabChange('purchase-history')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            isTabActive('purchase-history') ? 'bg-[#0052FF] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Purchase History</span>
        </button>

        {/* 16. Stock Adjustment */}
        <button
          onClick={() => onTabChange('stock-adjustment')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            isTabActive('stock-adjustment') ? 'bg-[#0052FF] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Stock Adjustment</span>
        </button>

        {/* 17. Damage */}
        <button
          onClick={() => onTabChange('damage')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            isTabActive('damage') ? 'bg-[#0052FF] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <Zap className="w-4 h-4" />
            <span>Damage</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 opacity-70" />
        </button>

        {/* 18. Balance Sheet */}
        <button
          onClick={() => onTabChange('balance-sheet')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            isTabActive('balance-sheet') ? 'bg-[#0052FF] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Balance Sheet</span>
        </button>

        {/* 19. Review */}
        <button
          onClick={() => onTabChange('review')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            isTabActive('review') ? 'bg-[#0052FF] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Review</span>
        </button>

        {/* 20. Income */}
        <button
          onClick={() => onTabChange('income')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            isTabActive('income') ? 'bg-[#0052FF] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <DollarSign className="w-4 h-4" />
            <span>Income</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 opacity-70" />
        </button>

        {/* 21. Activity Log */}
        <button
          onClick={() => onTabChange('activity-log')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            isTabActive('activity-log') ? 'bg-[#0052FF] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Activity Log</span>
        </button>

        {/* 22. IP Block */}
        <button
          onClick={() => onTabChange('ip-block')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            isTabActive('ip-block') ? 'bg-[#0052FF] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>IP Block</span>
        </button>

        {/* 23. Gallery */}
        <button
          onClick={() => onTabChange('gallery')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            isTabActive('gallery') ? 'bg-[#0052FF] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Image className="w-4 h-4" />
          <span>Gallery</span>
        </button>

        {/* 24. Additional Pages */}
        <button
          onClick={() => onTabChange('additional-pages')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            isTabActive('additional-pages') ? 'bg-[#0052FF] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <Layers className="w-4 h-4" />
            <span>Additional Pages</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 opacity-70" />
        </button>

        {/* 25. SEO Pages */}
        <button
          onClick={() => onTabChange('seo-pages')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            isTabActive('seo-pages') ? 'bg-[#0052FF] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>SEO Pages</span>
        </button>

        {/* 26. Expense */}
        <button
          onClick={() => onTabChange('expense')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            isTabActive('expense') ? 'bg-[#0052FF] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <TrendingDown className="w-4 h-4" />
            <span>Expense</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 opacity-70" />
        </button>

        {/* 27. User Notification */}
        <button
          onClick={() => onTabChange('user-notification')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            isTabActive('user-notification') ? 'bg-[#0052FF] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4" />
            <span>User Notification</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 opacity-70" />
        </button>

        {/* 28. Admin Control (Collapsible Matching Screenshot 6) */}
        <button
          onClick={() => onTabChange('admin-control')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            isTabActive('admin-control')
              ? 'bg-[#0052FF] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Admin Control</span>
        </button>

        {/* 29. App Setup */}
        <button
          onClick={() => onTabChange('app-setup')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            isTabActive('app-setup') ? 'bg-[#0052FF] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>App Setup</span>
        </button>

        {/* 30. New Release */}
        <button
          onClick={() => onTabChange('new-release')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            isTabActive('new-release') ? 'bg-[#0052FF] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>New Release</span>
        </button>

        {/* 33. Profile */}
        <button
          onClick={() => onTabChange('profile')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            isTabActive('profile') ? 'bg-[#0052FF] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile</span>
        </button>

        {/* 34. Logout */}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>

        {/* Bottom Version Card (Screenshot 6) */}
        <div className="pt-4 pb-2">
          <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-3 text-[11px] space-y-1">
            <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <span className="w-3.5 h-3.5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-extrabold text-[9px]">
                i
              </span>
              <span>ADMIN PANEL</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Current version</span>
              <span className="font-semibold text-slate-700">v1.0.47</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Last update</span>
              <span className="font-semibold text-slate-700">20 Aug 2026</span>
            </div>
            <div className="pt-1.5 flex items-center justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Panel up to date</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-white border-r border-slate-200/80 flex-col h-screen sticky top-0 overflow-hidden select-none">
        {renderNavContent()}
      </aside>

      {/* Mobile Responsive Slide-Out Drawer */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
            aria-hidden="true"
          />
          <aside className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {renderNavContent()}
          </aside>
        </div>
      )}
    </>
  );
};
