import React, { useState } from 'react';
import {
  Truck,
  CreditCard,
  MessageSquare,
  Package,
  ShieldCheck,
  Facebook,
  Video,
  BarChart,
  ShoppingBag,
  Gift,
  PhoneCall,
  Globe,
  Settings,
  FileText,
  Search,
  Check,
  ArrowRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  getStoreSettings,
  saveStoreSettings,
  StoreSettings,
} from '../../utils/adminStore';
import { SettingModals } from './settings/SettingModals';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<StoreSettings>(() => getStoreSettings());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const handleSave = (updated: StoreSettings) => {
    setSettings(updated);
    saveStoreSettings(updated);
    setActiveModal(null);
    setSaveSuccessMsg('Settings saved successfully and scripts updated in real-time!');
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  // Helper to determine status badge for each card
  const getCardStatus = (id: string): { label: string; active: boolean } => {
    switch (id) {
      case 'facebook-pixel':
        return {
          label: settings.facebookPixel.enabled
            ? settings.facebookPixel.pixelId
              ? 'Active'
              : 'Enabled'
            : 'Disabled',
          active: settings.facebookPixel.enabled,
        };
      case 'tiktok-pixel':
        return {
          label: settings.tiktokPixel.enabled
            ? settings.tiktokPixel.pixelId
              ? 'Active'
              : 'Enabled'
            : 'Disabled',
          active: settings.tiktokPixel.enabled,
        };
      case 'tag-manager':
        return {
          label: settings.tagManager.enabled
            ? settings.tagManager.gtmId
              ? 'Active'
              : 'Enabled'
            : 'Disabled',
          active: settings.tagManager.enabled,
        };
      case 'google-search-console':
        return {
          label: settings.googleSearchConsole.enabled ? 'Verified' : 'Disabled',
          active: settings.googleSearchConsole.enabled,
        };
      case 'sms':
        return {
          label: settings.smsGateway.enabled ? 'Active' : 'Disabled',
          active: settings.smsGateway.enabled,
        };
      case 'payment-methods':
        const anyPayment =
          settings.paymentMethods.bkash.enabled ||
          settings.paymentMethods.nagad.enabled ||
          settings.paymentMethods.rocket.enabled;
        return {
          label: anyPayment ? '4 Methods Active' : 'Configure',
          active: anyPayment,
        };
      case 'delivery':
        return {
          label: settings.deliveryCharge.enabled
            ? `৳${settings.deliveryCharge.insideCity} / ৳${settings.deliveryCharge.outsideCity}`
            : 'Free',
          active: true,
        };
      case 'advance-payment':
        return {
          label: settings.advancePayment.enabled ? 'Required' : 'Optional',
          active: settings.advancePayment.enabled,
        };
      case 'fraud-check':
        return {
          label: settings.fraudCheck.enabled ? 'Active' : 'Disabled',
          active: settings.fraudCheck.enabled,
        };
      case 'chat-manage':
        return {
          label: settings.chatManage.floatingWidgetEnabled ? 'Online' : 'Hidden',
          active: settings.chatManage.floatingWidgetEnabled ?? true,
        };
      case 'reward-point':
        return {
          label: settings.rewardPoint.enabled ? 'Active' : 'Disabled',
          active: settings.rewardPoint.enabled,
        };
      case 'manage-offer':
        return {
          label: settings.manageOffer.bannerEnabled ? 'Banner Live' : 'Paused',
          active: settings.manageOffer.bannerEnabled,
        };
      case 'domain-manage':
        return {
          label: 'SSL Active',
          active: true,
        };
      default:
        return {
          label: 'Configured',
          active: true,
        };
    }
  };

  // Exactly matching all 23 cards from User Screenshot 4
  const settingCards = [
    {
      id: 'delivery',
      title: 'Delivery Charge',
      desc: 'Inside city and outside city delivery rates & free shipping criteria',
      icon: Truck,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      id: 'advance-payment',
      title: 'Advance Payment',
      desc: 'Require partial or full advance fee for order confirmation',
      icon: CreditCard,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      id: 'sms',
      title: 'SMS Gateway',
      desc: 'Automated order notification SMS via Alpha Net, Greenweb, BulkSMS BD',
      icon: MessageSquare,
      color: 'bg-blue-50 text-[#0052FF]',
    },
    {
      id: 'courier',
      title: 'Courier Integration',
      desc: 'Steadfast, Pathao, RedX shipping APIs and auto consignment sync',
      icon: Package,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      id: 'fraud-check',
      title: 'Fraud Check API',
      desc: 'Blacklist suspicious phone numbers and prevent fraudulent COD orders',
      icon: ShieldCheck,
      color: 'bg-rose-50 text-rose-600',
    },
    {
      id: 'payment-methods',
      title: 'Payment Methods',
      desc: 'Manage bKash, Nagad, Rocket numbers and bank transfer details',
      icon: CreditCard,
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      id: 'social-login',
      title: 'Social Login',
      desc: 'Google One-Tap and Facebook authentication settings',
      icon: Globe,
      color: 'bg-sky-50 text-sky-600',
    },
    {
      id: 'facebook-pixel',
      title: 'Facebook Pixel',
      desc: 'Meta Pixel ID, Base Header Tracking Script, CAPI and Body NoScript',
      icon: Facebook,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      id: 'tiktok-pixel',
      title: 'TikTok Pixel',
      desc: 'TikTok Pixel ID, Header Script snippet & Events API for video ad campaigns',
      icon: Video,
      color: 'bg-pink-50 text-pink-600',
    },
    {
      id: 'tag-manager',
      title: 'Tag Manager & Analytics',
      desc: 'Google Tag Manager GTM Container, GA4, Head Script, Body & Data Layer',
      icon: BarChart,
      color: 'bg-violet-50 text-violet-600',
    },
    {
      id: 'facebook-catalog',
      title: 'Facebook Catalog',
      desc: 'Auto-sync product feeds with Meta Commerce Manager & Instagram Shopping',
      icon: ShoppingBag,
      color: 'bg-cyan-50 text-cyan-600',
    },
    {
      id: 'manage-offer',
      title: 'Manage Offer',
      desc: 'Flash sale discounts, universal coupon codes and top promotional bar',
      icon: Gift,
      color: 'bg-fuchsia-50 text-fuchsia-600',
    },
    {
      id: 'chat-manage',
      title: 'Chat Manage',
      desc: 'Floating WhatsApp support number, Messenger & Telegram live widgets',
      icon: PhoneCall,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      id: 'currency',
      title: 'Shop Currency & Country',
      desc: 'Store currency formatting (BDT ৳) and localized pricing settings',
      icon: Globe,
      color: 'bg-teal-50 text-teal-600',
    },
    {
      id: 'domain-manage',
      title: 'Domain Manage',
      desc: 'Primary domain, custom subdomains, CNAME DNS records & SSL status',
      icon: Globe,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      id: 'order-setting',
      title: 'Order Setting',
      desc: 'Min/max order limits, auto-confirmations, cancel windows & status rules',
      icon: Settings,
      color: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'product-setting',
      title: 'Product Setting',
      desc: 'Low stock alerts, out-of-stock visibility & instant software license delivery',
      icon: Package,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      id: 'google-search-console',
      title: 'Google Search Console',
      desc: 'HTML verification meta tag, ownership proof & XML sitemap submission',
      icon: Search,
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      id: 'blog-settings',
      title: 'Blog Settings',
      desc: 'Enable store blog articles, tech guides, and comment moderation rules',
      icon: FileText,
      color: 'bg-sky-50 text-sky-600',
    },
    {
      id: 'invoice',
      title: 'Invoice Settings',
      desc: 'Official DSP Digital Mart invoice header, company address & return terms',
      icon: FileText,
      color: 'bg-orange-50 text-orange-600',
    },
    {
      id: 'reward-point',
      title: 'Reward Point & Cashback',
      desc: 'Points earned per ৳100, point redemption rate, signup & referral bonus',
      icon: Gift,
      color: 'bg-blue-50 text-[#0052FF]',
    },
    {
      id: 'epbx',
      title: 'ePBX Auto Call',
      desc: 'Automated VoIP phone calls to verify high-value orders instantly',
      icon: PhoneCall,
      color: 'bg-lime-50 text-lime-700',
    },
    {
      id: 'bizmation',
      title: 'Bizmation Sync',
      desc: 'Direct integration with Bizmation ERP inventory and warehouse branches',
      icon: RefreshCw,
      color: 'bg-emerald-50 text-emerald-600',
    },
  ];

  const filteredCards = settingCards.filter((card) =>
    card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Header Matching Screenshot 4 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-main-heading">
              Settings
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0052FF]/10 text-[#0052FF]">
              23 Modules
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure Facebook Pixel, TikTok Pixel, GTM, payment methods, delivery charges & store APIs
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search settings (e.g. pixel, bKash)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0052FF] shadow-2xs"
          />
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Grid of Setting Cards Matching Screenshot 4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {filteredCards.map((card) => {
          const Icon = card.icon;
          const status = getCardStatus(card.id);

          return (
            <div
              key={card.id}
              className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${card.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      status.active
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}
                  >
                    {status.label}
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {card.desc}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-end">
                <button
                  onClick={() => setActiveModal(card.id)}
                  className="text-xs font-bold text-[#0052FF] hover:text-[#0045DC] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Manage</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Complete Configuration Modals */}
      <SettingModals
        activeModal={activeModal}
        settings={settings}
        setSettings={setSettings}
        onClose={() => setActiveModal(null)}
        onSave={handleSave}
      />
    </div>
  );
};
