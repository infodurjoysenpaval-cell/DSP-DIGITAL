import React, { useState } from 'react';
import { UserProfile, Product } from '../../types';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar, AdminTab } from './AdminSidebar';
import { AdminOverview } from './AdminOverview';
import { AdminProducts } from './AdminProducts';
import { AdminThemeCustomization } from './AdminThemeCustomization';
import { AdminSettings } from './AdminSettings';
import { AdminCustomers } from './AdminCustomers';
import { AdminVendors } from './AdminVendors';
import { AdminOrders } from './AdminOrders';
import { AdminIncompleteOrders } from './AdminIncompleteOrders';
import { AdminAffiliates } from './AdminAffiliates';
import { AdminAdditionalPages } from './AdminAdditionalPages';
import { Sparkles, ArrowRight, Shield } from 'lucide-react';

interface AdminPanelProps {
  currentUser: UserProfile | null;
  onVisitWebsite: () => void;
  onLogout: () => void;
  onViewProductOnSite?: (product: Product) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  onVisitWebsite,
  onLogout,
  onViewProductOnSite,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Page title mapping matching screenshots
  const getHeaderTitle = (): string => {
    switch (activeTab) {
      case 'dashboard':
        return 'Overview';
      case 'products':
        return 'Product';
      case 'theme-view':
      case 'customization':
        return 'Theme View Customization';
      case 'settings':
        return 'Settings';
      case 'customer':
        return 'Add User';
      case 'affiliates':
        return 'Affiliate Applications & Verification';
      case 'admin-control':
        return 'Vendor Admins';
      case 'orders':
        return 'Order Management';
      case 'incomplete-orders':
        return 'Incomplete Orders & Abandoned Carts';
      case 'additional-pages':
        return 'Website Pages & Policies Editor';
      default:
        return activeTab
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
    }
  };

  return (
    <div className="flex h-screen bg-[#F8F9FD] text-slate-800 antialiased overflow-hidden font-sans">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onVisitWebsite={onVisitWebsite}
        onLogout={onLogout}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <AdminHeader
          title={getHeaderTitle()}
          currentUser={currentUser}
          onVisitWebsite={onVisitWebsite}
          onLogout={onLogout}
          onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
        />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && <AdminOverview />}

          {activeTab === 'products' && (
            <AdminProducts onViewProductOnSite={onViewProductOnSite} />
          )}

          {(activeTab === 'theme-view' ||
            activeTab === 'customization' ||
            activeTab === 'carousel' ||
            activeTab === 'banner' ||
            activeTab === 'popup' ||
            activeTab === 'website-info') && (
            <AdminThemeCustomization onBack={() => setActiveTab('dashboard')} />
          )}

          {activeTab === 'settings' && <AdminSettings />}

          {activeTab === 'customer' && <AdminCustomers />}

          {activeTab === 'affiliates' && <AdminAffiliates />}

          {activeTab === 'admin-control' && <AdminVendors />}

          {activeTab === 'orders' && <AdminOrders />}

          {activeTab === 'incomplete-orders' && <AdminIncompleteOrders />}

          {activeTab === 'additional-pages' && <AdminAdditionalPages />}

          {/* Secondary Views Fallback */}
          {activeTab !== 'dashboard' &&
            activeTab !== 'products' &&
            activeTab !== 'theme-view' &&
            activeTab !== 'customization' &&
            activeTab !== 'carousel' &&
            activeTab !== 'banner' &&
            activeTab !== 'popup' &&
            activeTab !== 'website-info' &&
            activeTab !== 'settings' &&
            activeTab !== 'customer' &&
            activeTab !== 'affiliates' &&
            activeTab !== 'admin-control' &&
            activeTab !== 'orders' &&
            activeTab !== 'incomplete-orders' &&
            activeTab !== 'additional-pages' && (
              <div className="p-8 max-w-4xl mx-auto text-center space-y-4 pt-16">
                <div className="w-16 h-16 rounded-3xl bg-blue-50 text-[#0052FF] flex items-center justify-center mx-auto shadow-xs border border-blue-100">
                  <Shield className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 font-main-heading">
                  {getHeaderTitle()} Module
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  This section is actively linked with your live DSP Digital Mart store. You can manage products, theme colors, payment settings, customer users, and orders using the main controls.
                </p>
                <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => setActiveTab('products')}
                    className="px-4 py-2 rounded-xl bg-[#0052FF] text-white text-xs font-bold shadow-xs hover:bg-[#0045DC]"
                  >
                    Manage Products
                  </button>
                  <button
                    onClick={() => setActiveTab('theme-view')}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50"
                  >
                    Theme Customization
                  </button>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50"
                  >
                    Back to Overview
                  </button>
                </div>
              </div>
            )}
        </main>
      </div>
    </div>
  );
};
