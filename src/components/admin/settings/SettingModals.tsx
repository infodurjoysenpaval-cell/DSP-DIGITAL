import React from 'react';
import {
  X,
  Check,
  Save,
  ShieldCheck,
  Facebook,
  Video,
  BarChart,
  Truck,
  CreditCard,
  MessageSquare,
  Package,
  Globe,
  Settings,
  FileText,
  Gift,
  PhoneCall,
  Search,
  Code2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { StoreSettings } from '../../../utils/adminStore';

interface SettingModalsProps {
  activeModal: string | null;
  settings: StoreSettings;
  setSettings: React.Dispatch<React.SetStateAction<StoreSettings>>;
  onClose: () => void;
  onSave: (updated: StoreSettings) => void;
}

export const SettingModals: React.FC<SettingModalsProps> = ({
  activeModal,
  settings,
  setSettings,
  onClose,
  onSave,
}) => {
  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0052FF]/10 text-[#0052FF] flex items-center justify-center font-bold text-xs">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 font-main-heading capitalize">
                {activeModal.replace(/-/g, ' ')} Settings
              </h3>
              <p className="text-[11px] text-slate-500">
                Live configuration for DSP Digital Mart
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs scrollbar-thin scrollbar-thumb-slate-200 pr-1">
          {/* 1. FACEBOOK PIXEL */}
          {activeModal === 'facebook-pixel' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-blue-900 text-xs flex items-center gap-1.5">
                    <Facebook className="w-4 h-4 text-blue-600" />
                    Meta (Facebook) Pixel Status
                  </span>
                  <p className="text-[11px] text-blue-700 mt-0.5">
                    Live tracking script injected automatically into &lt;head&gt;
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.facebookPixel.enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        facebookPixel: { ...settings.facebookPixel, enabled: e.target.checked },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00993B]"></div>
                </label>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Facebook Pixel ID</label>
                <input
                  type="text"
                  value={settings.facebookPixel.pixelId}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      facebookPixel: { ...settings.facebookPixel, pixelId: e.target.value },
                    })
                  }
                  placeholder="e.g. 8917249127491"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono text-xs focus:outline-none focus:border-[#0052FF]"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Find this inside Meta Events Manager &gt; Data Sources &gt; Pixel ID
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Header Script (Facebook Base Tracking Code)
                </label>
                <textarea
                  rows={5}
                  value={settings.facebookPixel.headerScript}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      facebookPixel: { ...settings.facebookPixel, headerScript: e.target.value },
                    })
                  }
                  placeholder="<!-- Meta Pixel Code --> <script>!function(f,b,e,v,n,t,s)...</script>"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-[11px] focus:outline-none focus:border-[#0052FF]"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Pasted code is automatically injected into document head on page load.
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Body / NoScript Code (Optional)
                </label>
                <textarea
                  rows={3}
                  value={settings.facebookPixel.bodyScript}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      facebookPixel: { ...settings.facebookPixel, bodyScript: e.target.value },
                    })
                  }
                  placeholder="<noscript><img height='1' width='1' style='display:none' src='https://www.facebook.com/tr?id=...' /></noscript>"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-[11px] focus:outline-none focus:border-[#0052FF]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Conversions API (CAPI) Access Token
                  </label>
                  <input
                    type="password"
                    value={settings.facebookPixel.accessToken}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        facebookPixel: { ...settings.facebookPixel, accessToken: e.target.value },
                      })
                    }
                    placeholder="EAACedEose0cBA..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Test Event Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={settings.facebookPixel.testEventCode || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        facebookPixel: { ...settings.facebookPixel, testEventCode: e.target.value },
                      })
                    }
                    placeholder="TEST12345"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. TIKTOK PIXEL */}
          {activeModal === 'tiktok-pixel' && (
            <div className="space-y-4">
              <div className="p-3 bg-pink-50/70 border border-pink-200/80 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-pink-900 text-xs flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-pink-600" />
                    TikTok Pixel Status
                  </span>
                  <p className="text-[11px] text-pink-700 mt-0.5">
                    Live TikTok conversion pixel and event tracking
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.tiktokPixel.enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        tiktokPixel: { ...settings.tiktokPixel, enabled: e.target.checked },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00993B]"></div>
                </label>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">TikTok Pixel ID</label>
                <input
                  type="text"
                  value={settings.tiktokPixel.pixelId}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      tiktokPixel: { ...settings.tiktokPixel, pixelId: e.target.value },
                    })
                  }
                  placeholder="e.g. C79234KL129841"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono text-xs focus:outline-none focus:border-[#0052FF]"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Obtained from TikTok Ads Manager &gt; Assets &gt; Events &gt; Web Events
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Header Script (TikTok Base Code)
                </label>
                <textarea
                  rows={5}
                  value={settings.tiktokPixel.headerScript}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      tiktokPixel: { ...settings.tiktokPixel, headerScript: e.target.value },
                    })
                  }
                  placeholder="<!-- TikTok Pixel Code --> <script>!function(w,d,t){w.TiktokAnalyticsObject=t;...}(window, document, 'ttq');</script>"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-[11px] focus:outline-none focus:border-[#0052FF]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  TikTok Events API Access Token (Optional)
                </label>
                <input
                  type="password"
                  value={settings.tiktokPixel.accessToken || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      tiktokPixel: { ...settings.tiktokPixel, accessToken: e.target.value },
                    })
                  }
                  placeholder="tiktok_events_token_xyz..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-xs"
                />
              </div>
            </div>
          )}

          {/* 3. TAG MANAGER & ANALYTICS */}
          {activeModal === 'tag-manager' && (
            <div className="space-y-4">
              <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-indigo-900 text-xs flex items-center gap-1.5">
                    <BarChart className="w-4 h-4 text-indigo-600" />
                    Google Tag Manager & Data Layer
                  </span>
                  <p className="text-[11px] text-indigo-700 mt-0.5">
                    Injected into document &lt;head&gt; and &lt;body&gt;
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.tagManager.enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        tagManager: { ...settings.tagManager, enabled: e.target.checked },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00993B]"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">GTM Container ID</label>
                  <input
                    type="text"
                    value={settings.tagManager.gtmId}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        tagManager: { ...settings.tagManager, gtmId: e.target.value },
                      })
                    }
                    placeholder="GTM-N6WQ89P"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono text-xs focus:outline-none focus:border-[#0052FF]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">GA4 Measurement ID</label>
                  <input
                    type="text"
                    value={settings.tagManager.ga4MeasurementId}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        tagManager: { ...settings.tagManager, ga4MeasurementId: e.target.value },
                      })
                    }
                    placeholder="G-32984920"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono text-xs focus:outline-none focus:border-[#0052FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  GTM Head Script (Paste code directly)
                </label>
                <textarea
                  rows={4}
                  value={settings.tagManager.headScript}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      tagManager: { ...settings.tagManager, headScript: e.target.value },
                    })
                  }
                  placeholder="<!-- Google Tag Manager --> <script>(function(w,d,s,l,i)...)(window,document,'script','dataLayer','GTM-XXXX');</script>"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-[11px] focus:outline-none focus:border-[#0052FF]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  GTM Body NoScript (Paste code directly)
                </label>
                <textarea
                  rows={2}
                  value={settings.tagManager.bodyNoScript}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      tagManager: { ...settings.tagManager, bodyNoScript: e.target.value },
                    })
                  }
                  placeholder="<!-- Google Tag Manager (noscript) --> <noscript><iframe src='https://www.googletagmanager.com/ns.html?id=GTM-XXXX'...></iframe></noscript>"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-[11px] focus:outline-none focus:border-[#0052FF]"
                />
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">Enhanced eCommerce Data Layer</span>
                  <p className="text-[11px] text-slate-500">
                    Pushes view_item, add_to_cart, and purchase events to window.dataLayer
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.tagManager.ecommerceDataLayer}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      tagManager: { ...settings.tagManager, ecommerceDataLayer: e.target.checked },
                    })
                  }
                  className="w-4 h-4 rounded text-[#0052FF]"
                />
              </div>
            </div>
          )}

          {/* 4. GOOGLE SEARCH CONSOLE */}
          {activeModal === 'google-search-console' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-amber-900 text-xs flex items-center gap-1.5">
                    <Search className="w-4 h-4 text-amber-600" />
                    Google Search Console Verification
                  </span>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Injects verification meta tag directly into document head
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.googleSearchConsole.enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        googleSearchConsole: {
                          ...settings.googleSearchConsole,
                          enabled: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00993B]"></div>
                </label>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  HTML Tag / Verification Meta Code
                </label>
                <input
                  type="text"
                  value={settings.googleSearchConsole.metaVerification}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      googleSearchConsole: {
                        ...settings.googleSearchConsole,
                        metaVerification: e.target.value,
                      },
                    })
                  }
                  placeholder="<meta name='google-site-verification' content='...' /> or code"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono text-xs"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Copy the verification tag provided in Search Console &gt; Ownership verification
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Sitemap XML URL</label>
                <input
                  type="text"
                  value={settings.googleSearchConsole.sitemapUrl}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      googleSearchConsole: {
                        ...settings.googleSearchConsole,
                        sitemapUrl: e.target.value,
                      },
                    })
                  }
                  placeholder="https://dspdigitalmart.com/sitemap.xml"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono text-xs"
                />
              </div>
            </div>
          )}

          {/* 5. PAYMENT METHODS */}
          {activeModal === 'payment-methods' && (
            <div className="space-y-4">
              <p className="text-slate-500">
                Configure bKash, Nagad, Rocket numbers and bank accounts shown to customers during checkout:
              </p>

              {/* bKash */}
              <div className="p-3.5 rounded-2xl border border-pink-100 bg-pink-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-pink-700">bKash (বিকাশ)</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.paymentMethods.bkash.enabled}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          paymentMethods: {
                            ...settings.paymentMethods,
                            bkash: { ...settings.paymentMethods.bkash, enabled: e.target.checked },
                          },
                        })
                      }
                      className="rounded text-pink-600 focus:ring-pink-500"
                    />
                    <span className="text-[11px] font-semibold text-slate-700">Enabled</span>
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={settings.paymentMethods.bkash.number}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        paymentMethods: {
                          ...settings.paymentMethods,
                          bkash: { ...settings.paymentMethods.bkash, number: e.target.value },
                        },
                      })
                    }
                    placeholder="01712792184"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                  <input
                    type="text"
                    value={settings.paymentMethods.bkash.type}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        paymentMethods: {
                          ...settings.paymentMethods,
                          bkash: { ...settings.paymentMethods.bkash, type: e.target.value },
                        },
                      })
                    }
                    placeholder="Personal / Merchant"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              {/* Nagad */}
              <div className="p-3.5 rounded-2xl border border-orange-100 bg-orange-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-orange-700">Nagad (নগদ)</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.paymentMethods.nagad.enabled}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          paymentMethods: {
                            ...settings.paymentMethods,
                            nagad: { ...settings.paymentMethods.nagad, enabled: e.target.checked },
                          },
                        })
                      }
                      className="rounded text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-[11px] font-semibold text-slate-700">Enabled</span>
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={settings.paymentMethods.nagad.number}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        paymentMethods: {
                          ...settings.paymentMethods,
                          nagad: { ...settings.paymentMethods.nagad, number: e.target.value },
                        },
                      })
                    }
                    placeholder="01712792184"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                  <input
                    type="text"
                    value={settings.paymentMethods.nagad.type}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        paymentMethods: {
                          ...settings.paymentMethods,
                          nagad: { ...settings.paymentMethods.nagad, type: e.target.value },
                        },
                      })
                    }
                    placeholder="Personal / Merchant"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              {/* Rocket */}
              <div className="p-3.5 rounded-2xl border border-purple-100 bg-purple-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0052FF]">Rocket (রকেট)</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.paymentMethods.rocket.enabled}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          paymentMethods: {
                            ...settings.paymentMethods,
                            rocket: { ...settings.paymentMethods.rocket, enabled: e.target.checked },
                          },
                        })
                      }
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-[11px] font-semibold text-slate-700">Enabled</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={settings.paymentMethods.rocket.number}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      paymentMethods: {
                        ...settings.paymentMethods,
                        rocket: { ...settings.paymentMethods.rocket, number: e.target.value },
                      },
                    })
                  }
                  placeholder="01712792184"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              {/* Bank Transfer */}
              <div className="p-3.5 rounded-2xl border border-emerald-100 bg-emerald-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-700">Bank Transfer (ব্যাংক অ্যাকাউন্ট)</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.paymentMethods.bank.enabled}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          paymentMethods: {
                            ...settings.paymentMethods,
                            bank: { ...settings.paymentMethods.bank, enabled: e.target.checked },
                          },
                        })
                      }
                      className="rounded text-emerald-600"
                    />
                    <span className="text-[11px] font-semibold text-slate-700">Enabled</span>
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={settings.paymentMethods.bank.bankName}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        paymentMethods: {
                          ...settings.paymentMethods,
                          bank: { ...settings.paymentMethods.bank, bankName: e.target.value },
                        },
                      })
                    }
                    placeholder="Bank Name"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                  />
                  <input
                    type="text"
                    value={settings.paymentMethods.bank.accountNo}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        paymentMethods: {
                          ...settings.paymentMethods,
                          bank: { ...settings.paymentMethods.bank, accountNo: e.target.value },
                        },
                      })
                    }
                    placeholder="Account Number"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                  />
                  <input
                    type="text"
                    value={settings.paymentMethods.bank.branch}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        paymentMethods: {
                          ...settings.paymentMethods,
                          bank: { ...settings.paymentMethods.bank, branch: e.target.value },
                        },
                      })
                    }
                    placeholder="Branch"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 6. DELIVERY CHARGE */}
          {activeModal === 'delivery' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-blue-900 text-xs">Enable Delivery Charge</span>
                  <p className="text-[11px] text-blue-700 mt-0.5">
                    For digital license items, delivery fee is usually ৳0
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.deliveryCharge.enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        deliveryCharge: { ...settings.deliveryCharge, enabled: e.target.checked },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00993B]"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Inside City (৳)</label>
                  <input
                    type="number"
                    value={settings.deliveryCharge.insideCity}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        deliveryCharge: {
                          ...settings.deliveryCharge,
                          insideCity: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Outside City (৳)</label>
                  <input
                    type="number"
                    value={settings.deliveryCharge.outsideCity}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        deliveryCharge: {
                          ...settings.deliveryCharge,
                          outsideCity: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Free Delivery on Orders Above (৳)
                </label>
                <input
                  type="number"
                  value={settings.deliveryCharge.freeDeliveryMinOrder || 0}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      deliveryCharge: {
                        ...settings.deliveryCharge,
                        freeDeliveryMinOrder: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono"
                />
              </div>
            </div>
          )}

          {/* 7. ADVANCE PAYMENT */}
          {activeModal === 'advance-payment' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-emerald-900 text-xs">
                    Require Advance Payment
                  </span>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Customers must pay advance to confirm order
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.advancePayment.enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        advancePayment: {
                          ...settings.advancePayment,
                          enabled: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00993B]"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Advance Amount</label>
                  <input
                    type="number"
                    value={settings.advancePayment.amount}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        advancePayment: {
                          ...settings.advancePayment,
                          amount: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Charge Type</label>
                  <select
                    value={settings.advancePayment.type || 'fixed'}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        advancePayment: {
                          ...settings.advancePayment,
                          type: e.target.value as any,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="fixed">Fixed BDT Amount (৳)</option>
                    <option value="percentage">Percentage (%) of Total</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 8. SMS GATEWAY */}
          {activeModal === 'sms' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-blue-950 text-xs">Automated SMS Notifications</span>
                  <p className="text-[11px] text-[#0052FF] mt-0.5">
                    Send order receipt, license keys, and status SMS
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.smsGateway.enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        smsGateway: { ...settings.smsGateway, enabled: e.target.checked },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00993B]"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">SMS Provider</label>
                  <select
                    value={settings.smsGateway.provider}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        smsGateway: { ...settings.smsGateway, provider: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Alpha Net SMS Gateway">Alpha Net SMS Gateway</option>
                    <option value="Greenweb Bangladesh">Greenweb Bangladesh</option>
                    <option value="BulkSMS BD">BulkSMS BD</option>
                    <option value="Metronet SMS API">Metronet SMS API</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Sender ID</label>
                  <input
                    type="text"
                    value={settings.smsGateway.senderId}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        smsGateway: { ...settings.smsGateway, senderId: e.target.value },
                      })
                    }
                    placeholder="DSPMART"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">API Key / Auth Token</label>
                <input
                  type="password"
                  value={settings.smsGateway.apiKey}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      smsGateway: { ...settings.smsGateway, apiKey: e.target.value },
                    })
                  }
                  placeholder="ak_live_89127491274"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Order SMS Template</label>
                <textarea
                  rows={3}
                  value={settings.smsGateway.template || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      smsGateway: { ...settings.smsGateway, template: e.target.value },
                    })
                  }
                  placeholder="Dear {customer_name}, your order #{order_id} has been received. Thank you for shopping with DSP Digital Mart!"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-sans text-xs"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Supported variables: &#123;customer_name&#125;, &#123;order_id&#125;, &#123;amount&#125;
                </span>
              </div>
            </div>
          )}

          {/* 9. COURIER INTEGRATION */}
          {activeModal === 'courier' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Courier Partner</label>
                  <select
                    value={settings.courier.provider}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        courier: { ...settings.courier, provider: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Steadfast Courier">Steadfast Courier (BD)</option>
                    <option value="Pathao Courier">Pathao Courier</option>
                    <option value="RedX Logistics">RedX Logistics</option>
                    <option value="Paperfly">Paperfly</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Store ID</label>
                  <input
                    type="text"
                    value={settings.courier.storeId || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        courier: { ...settings.courier, storeId: e.target.value },
                      })
                    }
                    placeholder="DSP_STORE_1"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Courier API Key</label>
                <input
                  type="password"
                  value={settings.courier.apiKey || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      courier: { ...settings.courier, apiKey: e.target.value },
                    })
                  }
                  placeholder="stdf_api_91827491827"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Secret Key</label>
                <input
                  type="password"
                  value={settings.courier.secretKey || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      courier: { ...settings.courier, secretKey: e.target.value },
                    })
                  }
                  placeholder="stdf_sec_81927491827"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono"
                />
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">Auto-Assign Tracking on Order Confirmation</span>
                  <p className="text-[11px] text-slate-500">
                    Automatically generates tracking code and consignment ID
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.courier.autoAssign}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      courier: { ...settings.courier, autoAssign: e.target.checked },
                    })
                  }
                  className="w-4 h-4 rounded text-[#0052FF]"
                />
              </div>
            </div>
          )}

          {/* 10. FRAUD CHECK API */}
          {activeModal === 'fraud-check' && (
            <div className="space-y-4">
              <div className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-rose-900 text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-rose-600" />
                    BD Courier Return & Fraud Checker
                  </span>
                  <p className="text-[11px] text-rose-700 mt-0.5">
                    Prevents fake orders and checks parcel return history by phone
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.fraudCheck.enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        fraudCheck: { ...settings.fraudCheck, enabled: e.target.checked },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00993B]"></div>
                </label>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Fraud Provider</label>
                <input
                  type="text"
                  value={settings.fraudCheck.provider}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      fraudCheck: { ...settings.fraudCheck, provider: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Fraud API Key</label>
                <input
                  type="password"
                  value={settings.fraudCheck.apiKey}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      fraudCheck: { ...settings.fraudCheck, apiKey: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Max COD Order Limit (৳)
                  </label>
                  <input
                    type="number"
                    value={settings.fraudCheck.maxCodAmount}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        fraudCheck: {
                          ...settings.fraudCheck,
                          maxCodAmount: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.fraudCheck.blockHighRisk}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          fraudCheck: {
                            ...settings.fraudCheck,
                            blockHighRisk: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 rounded text-rose-600"
                    />
                    <span className="font-bold text-slate-700">Block High Return Rate Customers</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 11. SOCIAL LOGIN */}
          {activeModal === 'social-login' && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-500" />
                    Google One-Tap Login
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.socialLogin.googleEnabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        socialLogin: {
                          ...settings.socialLogin,
                          googleEnabled: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 rounded text-[#0052FF]"
                  />
                </div>
                <input
                  type="text"
                  value={settings.socialLogin.googleClientId}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socialLogin: {
                        ...settings.socialLogin,
                        googleClientId: e.target.value,
                      },
                    })
                  }
                  placeholder="Google OAuth Client ID (apps.googleusercontent.com)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-xs"
                />
              </div>

              <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-2">
                    <Facebook className="w-4 h-4 text-blue-600" />
                    Facebook Login
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.socialLogin.facebookEnabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        socialLogin: {
                          ...settings.socialLogin,
                          facebookEnabled: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 rounded text-[#0052FF]"
                  />
                </div>
                <input
                  type="text"
                  value={settings.socialLogin.facebookAppId}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socialLogin: {
                        ...settings.socialLogin,
                        facebookAppId: e.target.value,
                      },
                    })
                  }
                  placeholder="Facebook App ID"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-xs"
                />
              </div>
            </div>
          )}

          {/* 12. CHAT MANAGE */}
          {activeModal === 'chat-manage' && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  WhatsApp Support Number
                </label>
                <input
                  type="text"
                  value={settings.chatManage.whatsapp}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      chatManage: { ...settings.chatManage, whatsapp: e.target.value },
                    })
                  }
                  placeholder="+8801712792184"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Messenger Username or Link
                </label>
                <input
                  type="text"
                  value={settings.chatManage.messenger}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      chatManage: { ...settings.chatManage, messenger: e.target.value },
                    })
                  }
                  placeholder="https://m.me/dspdigitalmart"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Telegram Username or Channel Link
                </label>
                <input
                  type="text"
                  value={settings.chatManage.telegram || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      chatManage: { ...settings.chatManage, telegram: e.target.value },
                    })
                  }
                  placeholder="https://t.me/dspdigitalmart"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">Floating Live Chat Button</span>
                  <p className="text-[11px] text-slate-500">
                    Displays WhatsApp icon at the bottom right corner of storefront
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.chatManage.floatingWidgetEnabled ?? true}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      chatManage: {
                        ...settings.chatManage,
                        floatingWidgetEnabled: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 rounded text-[#00993B]"
                />
              </div>
            </div>
          )}

          {/* 13. CURRENCY & COUNTRY */}
          {activeModal === 'currency' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Currency Symbol</label>
                  <input
                    type="text"
                    value={settings.shopCurrency}
                    onChange={(e) =>
                      setSettings({ ...settings, shopCurrency: e.target.value })
                    }
                    placeholder="৳"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-base font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Currency Code</label>
                  <input
                    type="text"
                    value={settings.currencyCode || 'BDT'}
                    onChange={(e) =>
                      setSettings({ ...settings, currencyCode: e.target.value })
                    }
                    placeholder="BDT"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Country</label>
                  <input
                    type="text"
                    value={settings.country}
                    onChange={(e) =>
                      setSettings({ ...settings, country: e.target.value })
                    }
                    placeholder="Bangladesh"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 14. DOMAIN MANAGE */}
          {activeModal === 'domain-manage' && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Primary Domain</label>
                <input
                  type="text"
                  value={settings.domainManage.primaryDomain}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      domainManage: { ...settings.domainManage, primaryDomain: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Custom Domain / Subdomain
                </label>
                <input
                  type="text"
                  value={settings.domainManage.customDomain}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      domainManage: { ...settings.domainManage, customDomain: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">CNAME Target Record</label>
                <input
                  type="text"
                  value={settings.domainManage.cnameTarget}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      domainManage: { ...settings.domainManage, cnameTarget: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono"
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-emerald-900">SSL Certificate Active</span>
                  <p className="text-[11px] text-emerald-700">
                    HTTPS Encryption 256-bit TLS auto-renewed
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 15. ORDER SETTINGS */}
          {activeModal === 'order-setting' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Min Order Amount (৳)</label>
                  <input
                    type="number"
                    value={settings.orderSetting.minOrderAmount}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        orderSetting: {
                          ...settings.orderSetting,
                          minOrderAmount: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Max Order Amount (৳)</label>
                  <input
                    type="number"
                    value={settings.orderSetting.maxOrderAmount}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        orderSetting: {
                          ...settings.orderSetting,
                          maxOrderAmount: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Customer Cancellation Window (Hours)
                </label>
                <input
                  type="number"
                  value={settings.orderSetting.cancelWindowHours}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      orderSetting: {
                        ...settings.orderSetting,
                        cancelWindowHours: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono"
                />
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">Auto-Confirm Digital Goods</span>
                  <p className="text-[11px] text-slate-500">
                    Immediately process verified digital software orders
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.orderSetting.autoConfirmDigital}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      orderSetting: {
                        ...settings.orderSetting,
                        autoConfirmDigital: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 rounded text-[#0052FF]"
                />
              </div>
            </div>
          )}

          {/* 16. PRODUCT SETTINGS */}
          {activeModal === 'product-setting' && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Low Stock Warning Threshold
                </label>
                <input
                  type="number"
                  value={settings.productSetting.lowStockThreshold}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      productSetting: {
                        ...settings.productSetting,
                        lowStockThreshold: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono"
                />
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">Show Out of Stock Products</span>
                  <p className="text-[11px] text-slate-500">
                    Display out of stock items with disabled Add to Cart button
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.productSetting.showOutOfStock}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      productSetting: {
                        ...settings.productSetting,
                        showOutOfStock: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 rounded text-[#0052FF]"
                />
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">
                    Auto-Deliver Digital License Keys
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Instantly reveal license key on order confirmation page and email
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.productSetting.autoDeliverLicenseKey}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      productSetting: {
                        ...settings.productSetting,
                        autoDeliverLicenseKey: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 rounded text-[#00993B]"
                />
              </div>
            </div>
          )}

          {/* 17. INVOICE SETTINGS */}
          {activeModal === 'invoice' && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Company / Store Name</label>
                <input
                  type="text"
                  value={settings.invoiceSettings.companyName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      invoiceSettings: {
                        ...settings.invoiceSettings,
                        companyName: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Support Phone</label>
                  <input
                    type="text"
                    value={settings.invoiceSettings.companyPhone}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        invoiceSettings: {
                          ...settings.invoiceSettings,
                          companyPhone: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Office Address</label>
                  <input
                    type="text"
                    value={settings.invoiceSettings.companyAddress}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        invoiceSettings: {
                          ...settings.invoiceSettings,
                          companyAddress: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Footer Terms & Policy Note
                </label>
                <textarea
                  rows={3}
                  value={settings.invoiceSettings.footerTerms}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      invoiceSettings: {
                        ...settings.invoiceSettings,
                        footerTerms: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white"
                />
              </div>
            </div>
          )}

          {/* 18. REWARD POINT */}
          {activeModal === 'reward-point' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-blue-950 text-xs">Reward Points Program</span>
                  <p className="text-[11px] text-[#0052FF] mt-0.5">
                    Customers earn points on every completed purchase
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.rewardPoint.enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        rewardPoint: { ...settings.rewardPoint, enabled: e.target.checked },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00993B]"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Points per ৳100 Spent
                  </label>
                  <input
                    type="number"
                    value={settings.rewardPoint.pointsPer100}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        rewardPoint: {
                          ...settings.rewardPoint,
                          pointsPer100: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    1 Point Value (৳)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.rewardPoint.pointValueBdt}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        rewardPoint: {
                          ...settings.rewardPoint,
                          pointValueBdt: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Welcome Signup Bonus Points
                  </label>
                  <input
                    type="number"
                    value={settings.rewardPoint.signupBonus}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        rewardPoint: {
                          ...settings.rewardPoint,
                          signupBonus: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Referral Bonus Points
                  </label>
                  <input
                    type="number"
                    value={settings.rewardPoint.referralBonus}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        rewardPoint: {
                          ...settings.rewardPoint,
                          referralBonus: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 19. FACEBOOK CATALOG */}
          {activeModal === 'facebook-catalog' && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Meta Catalog ID</label>
                <input
                  type="text"
                  value={settings.facebookCatalog.catalogId}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      facebookCatalog: {
                        ...settings.facebookCatalog,
                        catalogId: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  XML Product Feed URL
                </label>
                <input
                  type="text"
                  value={settings.facebookCatalog.feedUrl}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      facebookCatalog: {
                        ...settings.facebookCatalog,
                        feedUrl: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono"
                />
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">Auto Synchronize Daily</span>
                  <p className="text-[11px] text-slate-500">
                    Pushes updated product prices and availability to Meta Commerce Manager
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.facebookCatalog.autoSync}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      facebookCatalog: {
                        ...settings.facebookCatalog,
                        autoSync: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 rounded text-[#0052FF]"
                />
              </div>
            </div>
          )}

          {/* 20. MANAGE OFFER */}
          {activeModal === 'manage-offer' && (
            <div className="space-y-4">
              <div className="p-3 bg-pink-50/70 border border-pink-200/80 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-pink-900 text-xs">
                    Promotional Top Bar Banner
                  </span>
                  <p className="text-[11px] text-pink-700 mt-0.5">
                    Displays countdown and flash sale banner at the very top of site
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.manageOffer.bannerEnabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        manageOffer: {
                          ...settings.manageOffer,
                          bannerEnabled: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FE1AA7]"></div>
                </label>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Offer Title / Text</label>
                <input
                  type="text"
                  value={settings.manageOffer.offerTitle}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      manageOffer: {
                        ...settings.manageOffer,
                        offerTitle: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Discount %</label>
                  <input
                    type="number"
                    value={settings.manageOffer.discountPercent}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        manageOffer: {
                          ...settings.manageOffer,
                          discountPercent: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Coupon Code</label>
                  <input
                    type="text"
                    value={settings.manageOffer.couponCode}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        manageOffer: {
                          ...settings.manageOffer,
                          couponCode: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">End Date</label>
                  <input
                    type="date"
                    value={settings.manageOffer.endDate}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        manageOffer: {
                          ...settings.manageOffer,
                          endDate: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 21. BLOG SETTINGS */}
          {activeModal === 'blog-settings' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-slate-900 text-xs">Enable Blog Module</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Show Tech Guides and Antivirus tutorials on website
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.blogSettings.enabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      blogSettings: { ...settings.blogSettings, enabled: e.target.checked },
                    })
                  }
                  className="w-4 h-4 rounded text-[#0052FF]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Posts Per Page</label>
                <input
                  type="number"
                  value={settings.blogSettings.postsPerPage}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      blogSettings: {
                        ...settings.blogSettings,
                        postsPerPage: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono"
                />
              </div>
            </div>
          )}

          {/* 22. ePBX AUTO CALL */}
          {activeModal === 'epbx' && (
            <div className="space-y-4">
              <div className="p-3 bg-sky-50/70 border border-sky-200/80 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-sky-900 text-xs flex items-center gap-1.5">
                    <PhoneCall className="w-4 h-4 text-sky-600" />
                    ePBX Automated IVR Calling
                  </span>
                  <p className="text-[11px] text-sky-700 mt-0.5">
                    Auto-call customers to confirm orders with press 1 to confirm
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.ePBX.enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        ePBX: { ...settings.ePBX, enabled: e.target.checked },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00993B]"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">ePBX Provider</label>
                  <input
                    type="text"
                    value={settings.ePBX.provider}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        ePBX: { ...settings.ePBX, provider: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Caller ID Number</label>
                  <input
                    type="text"
                    value={settings.ePBX.callerId}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        ePBX: { ...settings.ePBX, callerId: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">API Key</label>
                <input
                  type="password"
                  value={settings.ePBX.apiKey}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      ePBX: { ...settings.ePBX, apiKey: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono"
                />
              </div>
            </div>
          )}

          {/* 23. BIZMATION SYNC */}
          {activeModal === 'bizmation' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-emerald-900 text-xs flex items-center gap-1.5">
                    <RefreshCw className="w-4 h-4 text-emerald-600" />
                    Bizmation ERP & Inventory Sync
                  </span>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Real-time stock level synchronization with physical store
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.bizmation.enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        bizmation: { ...settings.bizmation, enabled: e.target.checked },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00993B]"></div>
                </label>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Bizmation API Key</label>
                <input
                  type="password"
                  value={settings.bizmation.apiKey}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      bizmation: { ...settings.bizmation, apiKey: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Store / Branch ID</label>
                <input
                  type="text"
                  value={settings.bizmation.branchId}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      bizmation: { ...settings.bizmation, branchId: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="pt-3 sm:pt-4 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(settings)}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#0052FF] to-[#00DFBA] hover:from-[#0045DC] hover:to-[#00C4A7] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
