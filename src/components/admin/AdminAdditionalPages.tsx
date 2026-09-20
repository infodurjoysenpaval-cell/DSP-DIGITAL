import React, { useState, useEffect } from 'react';
import {
  FileText,
  Save,
  RotateCcw,
  CheckCircle,
  Eye,
  Shield,
  HelpCircle,
  CreditCard,
  Headphones,
  Info,
  Sparkles,
  ExternalLink,
  Plus,
  Trash2,
} from 'lucide-react';
import { getAllPages, getPage, savePage, resetPageToDefault } from '../../utils/pagesStorage';
import { PolicyPage } from '../../types';

interface AdminAdditionalPagesProps {
  onBack?: () => void;
}

const PAGE_KEYS = [
  { key: 'refund', label: 'Return & Refund Policy', icon: Shield, desc: 'রিটার্ন ও রিফান্ড সংক্রান্ত নিয়মাবলী' },
  { key: 'privacy', label: 'Privacy Policy', icon: Shield, desc: 'গ্রাহকের তথ্য সুরক্ষা ও গোপনীয়তা নীতি' },
  { key: 'terms', label: 'Terms and Conditions', icon: FileText, desc: 'সার্ভিস ব্যবহার ও লাইসেন্সের শর্তাবলী' },
  { key: 'about', label: 'About Us', icon: Info, desc: 'আমাদের প্রতিষ্ঠান ও লক্ষ্য সম্পর্কে' },
  { key: 'why-shop', label: 'Why Shop Online with Us', icon: Sparkles, desc: 'কেন আমাদের থেকে কেনাকাটা করবেন' },
  { key: 'faq', label: 'FAQ', icon: HelpCircle, desc: 'সচরাচর জিজ্ঞাসিত প্রশ্নোত্তর' },
  { key: 'support', label: 'After Sales Support', icon: Headphones, desc: 'ক্রয়-পরবর্তী টেকনিক্যাল সাপোর্ট ও ওয়ারেন্টি' },
  { key: 'payment-methods', label: 'Online Payment Methods', icon: CreditCard, desc: 'বিকাশ, নগদ ও পেমেন্ট সংক্রান্ত তথ্য' },
];

export const AdminAdditionalPages: React.FC<AdminAdditionalPagesProps> = ({ onBack }) => {
  const [pages, setPages] = useState<Record<string, PolicyPage>>(() => getAllPages());
  const [selectedKey, setSelectedKey] = useState<string>('refund');
  const [activeForm, setActiveForm] = useState<PolicyPage>(() => getPage('refund'));
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [newHighlight, setNewHighlight] = useState('');

  // Reload when tab changes
  useEffect(() => {
    setActiveForm(getPage(selectedKey));
    setSavedSuccess(false);
  }, [selectedKey]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    savePage(activeForm);
    setPages(getAllPages());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm('আপনি কি এই পেজের তথ্য ডিফল্ট ফরম্যাটে রিসেট করতে চান?')) {
      const reset = resetPageToDefault(selectedKey);
      setActiveForm(reset);
      setPages(getAllPages());
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const handleAddHighlight = () => {
    if (!newHighlight.trim()) return;
    const currentHighlights = activeForm.highlights || [];
    setActiveForm({
      ...activeForm,
      highlights: [...currentHighlights, newHighlight.trim()],
    });
    setNewHighlight('');
  };

  const handleRemoveHighlight = (index: number) => {
    const currentHighlights = [...(activeForm.highlights || [])];
    currentHighlights.splice(index, 1);
    setActiveForm({ ...activeForm, highlights: currentHighlights });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-main-heading flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-[#0052FF]" />
            <span>Additional Pages & Policies Editor</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            এখানে যা লিখবেন তা স্বয়ংক্রিয়ভাবে ওয়েবসাইটের ফুটারের পলিসি ও তথ্য পেজগুলোতে প্রদর্শিত হবে
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>ওয়েবসাইটে সেভ হয়েছে!</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Grid: Sidebar of Pages on Left + Editor on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Page Selectors */}
        <div className="lg:col-span-4 space-y-2">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 px-2">
              Select Page to Edit ({PAGE_KEYS.length})
            </h3>
            <div className="space-y-1">
              {PAGE_KEYS.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedKey === item.key;
                const pageData = pages[item.key];
                return (
                  <button
                    key={item.key}
                    onClick={() => setSelectedKey(item.key)}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-[#0052FF] text-white shadow-xs'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-blue-50 text-[#0052FF]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold truncate block">
                          {pageData?.title || item.label}
                        </span>
                        {pageData?.lastUpdated && (
                          <span
                            className={`text-[10px] ml-1 shrink-0 ${
                              isSelected ? 'text-blue-100' : 'text-slate-400'
                            }`}
                          >
                            {pageData.lastUpdated}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-[11px] truncate mt-0.5 ${
                          isSelected ? 'text-blue-100' : 'text-slate-400'
                        }`}
                      >
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Editor Form & Live Preview */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-[#0052FF] bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                  Active Page: {activeForm.key}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  পেজ কন্টেন্ট সম্পাদনা করুন
                </h3>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  title="রিসেট করে ডিফল্ট টেক্সট আনুন"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Default Reset</span>
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-[#0052FF] hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Page</span>
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Page Title (পেজের শিরোনাম)
              </label>
              <input
                type="text"
                value={activeForm.title}
                onChange={(e) => setActiveForm({ ...activeForm, title: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF]"
              />
            </div>

            {/* Summary */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Short Summary / Key Note (সংক্ষিপ্ত সারসংক্ষেপ বা মূল নোট)
              </label>
              <input
                type="text"
                value={activeForm.summary || ''}
                onChange={(e) => setActiveForm({ ...activeForm, summary: e.target.value })}
                placeholder="যেমন: আমাদের ১০০% রিপ্লেসমেন্ট এবং মানি-ব্যাক গ্যারান্টি..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF]"
              />
            </div>

            {/* Main Content */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Detailed Page Content (মূল বিস্তারিত প্যারাগ্রাফ ও শর্তাবলী)
                </label>
                <span className="text-[11px] text-slate-400">
                  প্যারাগ্রাফ আলাদা করতে Enter চেপে নতুন লাইন দিন
                </span>
              </div>
              <textarea
                rows={9}
                value={activeForm.content}
                onChange={(e) => setActiveForm({ ...activeForm, content: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed font-mono focus:outline-none focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF]"
                placeholder="এখানে বিস্তারিত পলিসি বা পেজের লেখা লিখুন..."
              />
            </div>

            {/* Highlights list */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Key Highlights / বুলেট পয়েন্টসমূহ (ঐচ্ছিক)
              </label>
              <div className="space-y-2 mb-3">
                {(activeForm.highlights || []).map((hl, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/70">
                    <CheckCircle className="w-3.5 h-3.5 text-[#0052FF] shrink-0" />
                    <span className="text-xs text-slate-700 flex-1">{hl}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveHighlight(idx)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newHighlight}
                  onChange={(e) => setNewHighlight(e.target.value)}
                  placeholder="নতুন বুলেট পয়েন্ট যোগ করুন (যেমন: ২৪/৭ সরাসরি সাপোর্ট)..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0052FF]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddHighlight();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddHighlight}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Bottom action */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                পরিবর্তন সেভ করলে লাইভ ওয়েবসাইটে তৎক্ষণাৎ প্রতিফলিত হবে
              </span>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0052FF] hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>

          {/* Live Preview Card */}
          <div className="bg-white rounded-2xl border border-blue-100 p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#0052FF]" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Live Customer Modal Preview (কাস্টমাররা যেভাবে দেখবে)
                </h4>
              </div>
              <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Syncs with Live Footer
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-main-heading">
                  {activeForm.title}
                </h3>
                <span className="text-[10px] text-slate-400">
                  সর্বশেষ আপডেট: {new Date().toISOString().split('T')[0]}
                </span>
              </div>

              {activeForm.summary && (
                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900 font-medium">
                  {activeForm.summary}
                </div>
              )}

              <div className="whitespace-pre-line text-xs text-slate-600 leading-relaxed">
                {activeForm.content}
              </div>

              {activeForm.highlights && activeForm.highlights.length > 0 && (
                <div className="pt-2">
                  <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Key Highlights:
                  </h5>
                  <ul className="space-y-1.5">
                    {activeForm.highlights.map((hl, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                        <CheckCircle className="w-3.5 h-3.5 text-[#0052FF] shrink-0 mt-0.5" />
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
