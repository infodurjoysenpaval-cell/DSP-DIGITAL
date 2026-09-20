import React, { useState } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  Check,
  Palette,
  Layout,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  getThemeConfig,
  saveThemeConfig,
  DEFAULT_THEME_CONFIG,
  ThemeConfig,
} from '../../utils/adminStore';

interface AdminThemeCustomizationProps {
  onBack?: () => void;
}

export const AdminThemeCustomization: React.FC<AdminThemeCustomizationProps> = ({ onBack }) => {
  const [config, setConfig] = useState<ThemeConfig>(() => getThemeConfig());
  const [activeTab, setActiveTab] = useState<'appearance' | 'views' | 'pages' | 'designs'>('appearance');
  const [lastSaved, setLastSaved] = useState<string>('Sep 19, 2026, 12:36:00 AM');
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = () => {
    saveThemeConfig(config);
    const now = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
    });
    setLastSaved(now);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Reset all theme settings to defaults?')) {
      setConfig(DEFAULT_THEME_CONFIG);
      saveThemeConfig(DEFAULT_THEME_CONFIG);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
      {/* Top Action Bar Matching Screenshot 3 */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-main-heading">
              Theme View Customization
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Info className="w-3 h-3 text-amber-600" />
                <span>Note: Changes may take 5-10 mins to reflect due to caching</span>
              </span>
              <span className="text-[11px] text-slate-400">
                Last saved: {lastSaved}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0052FF] hover:bg-[#0045DC] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      {savedNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Theme settings saved successfully! Live website interface updated.</span>
        </div>
      )}

      {/* Tabs Matching Screenshot 3 */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('appearance')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'appearance'
              ? 'border-[#0052FF] text-[#0052FF]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Appearance & Colors</span>
        </button>

        <button
          onClick={() => setActiveTab('views')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'views'
              ? 'border-[#0052FF] text-[#0052FF]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layout className="w-4 h-4" />
          <span>Theme Views</span>
        </button>

        <button
          onClick={() => setActiveTab('pages')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'pages'
              ? 'border-[#0052FF] text-[#0052FF]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Page Views</span>
        </button>

        <button
          onClick={() => setActiveTab('designs')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'designs'
              ? 'border-[#0052FF] text-[#0052FF]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Theme Designs</span>
        </button>
      </div>

      {/* Content Form Matching Screenshot 3 */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs space-y-8">
        {/* Section 1: THEME BRAND COLORS */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase font-main-heading">
              THEME BRAND COLORS
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Customize primary, secondary, and tertiary brand colors for your storefront:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Primary Color */}
            <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-2">
              <label className="block text-xs font-bold text-slate-700">Primary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.primaryColor}
                  onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                  className="w-10 h-10 rounded-xl border border-slate-300 p-0.5 cursor-pointer"
                />
                <input
                  type="text"
                  value={config.primaryColor}
                  onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold uppercase text-slate-800"
                />
              </div>
            </div>

            {/* Secondary Color */}
            <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-2">
              <label className="block text-xs font-bold text-slate-700">Secondary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.secondaryColor}
                  onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                  className="w-10 h-10 rounded-xl border border-slate-300 p-0.5 cursor-pointer"
                />
                <input
                  type="text"
                  value={config.secondaryColor}
                  onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold uppercase text-slate-800"
                />
              </div>
            </div>

            {/* Tertiary Color */}
            <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-2">
              <label className="block text-xs font-bold text-slate-700">Tertiary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.tertiaryColor}
                  onChange={(e) => setConfig({ ...config, tertiaryColor: e.target.value })}
                  className="w-10 h-10 rounded-xl border border-slate-300 p-0.5 cursor-pointer"
                />
                <input
                  type="text"
                  value={config.tertiaryColor}
                  onChange={(e) => setConfig({ ...config, tertiaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold uppercase text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: DASHBOARD STYLE */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase font-main-heading">
              DASHBOARD STYLE
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Choose your dashboard presentation and navigational style:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label
              onClick={() => setConfig({ ...config, dashboardStyle: 'classic' })}
              className={`p-4 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                config.dashboardStyle === 'classic'
                  ? 'border-[#0052FF] bg-blue-50/40'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="dashboard_style"
                checked={config.dashboardStyle === 'classic'}
                onChange={() => setConfig({ ...config, dashboardStyle: 'classic' })}
                className="mt-1 text-[#0052FF] focus:ring-[#0052FF]"
              />
              <div>
                <div className="text-xs font-bold text-slate-900">Classic Dashboard</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Traditional sidebar layout navigation with full vertical categories
                </div>
              </div>
            </label>

            <label
              onClick={() => setConfig({ ...config, dashboardStyle: 'professional' })}
              className={`p-4 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                config.dashboardStyle === 'professional'
                  ? 'border-[#0052FF] bg-blue-50/40'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="dashboard_style"
                checked={config.dashboardStyle === 'professional'}
                onChange={() => setConfig({ ...config, dashboardStyle: 'professional' })}
                className="mt-1 text-[#0052FF] focus:ring-[#0052FF]"
              />
              <div>
                <div className="text-xs font-bold text-slate-900">Professional Dashboard</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Modernized, compact workspace navigation with collapsible sections
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Section 3: SEARCH HINTS */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase font-main-heading">
              SEARCH HINTS
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Comma-separated search keywords suggested to visitors in the header search bar:
            </p>
          </div>

          <textarea
            rows={2}
            value={config.searchHints}
            onChange={(e) => setConfig({ ...config, searchHints: e.target.value })}
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF]"
            placeholder="windows 11, vpn, canva, chatgpt, antivirus, idm"
          ></textarea>
        </div>

        {/* Section 4: WEBSITE & CHECKOUT LANGUAGE */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase font-main-heading">
              WEBSITE & CHECKOUT LANGUAGE / ওয়েবসাইটের বিষয় ও ভাষা
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Select primary language for the entire website, product modals, buttons, and checkout:
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {[
              { code: 'en', label: 'English (Default - সম্পূর্ণ ওয়েবসাইট ইংরেজিতে)' },
              { code: 'bn', label: 'Bangla (বাংলা - সম্পূর্ণ ওয়েবসাইট বাংলায়)' },
            ].map((lang) => (
              <label
                key={lang.code}
                onClick={() => setConfig({ ...config, checkoutLanguage: lang.code as any })}
                className={`px-4 py-3 rounded-2xl border-2 flex items-center gap-2.5 cursor-pointer transition-all ${
                  config.checkoutLanguage === lang.code
                    ? 'border-[#0052FF] bg-blue-50/60 text-[#0052FF] font-bold shadow-2xs'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="checkout_language"
                  checked={config.checkoutLanguage === lang.code}
                  onChange={() => setConfig({ ...config, checkoutLanguage: lang.code as any })}
                  className="text-[#0052FF] focus:ring-[#0052FF] w-4 h-4"
                />
                <span className="text-xs sm:text-sm">{lang.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Save Footer Button */}
        <div className="pt-4 flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0052FF] hover:bg-[#0045DC] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Save Theme Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
