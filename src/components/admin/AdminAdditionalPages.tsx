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
  Plus,
  Trash2,
  Globe,
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
  { key: 'payment-methods', label: 'Online Payment Methods', icon: CreditCard, desc: 'বিকাশ, নগদ ও পেমেন্ট সংক্রান্ত তথ্য' },
  { key: 'support', label: 'After Sales Support', icon: Headphones, desc: 'ক্রয়-পরবর্তী টেকনিক্যাল সাপোর্ট ও ওয়ারেন্টি' },
  { key: 'faq', label: 'FAQ', icon: HelpCircle, desc: 'সচরাচর জিজ্ঞাসিত প্রশ্নোত্তর' },
];

export const AdminAdditionalPages: React.FC<AdminAdditionalPagesProps> = () => {
  const [pages, setPages] = useState<Record<string, PolicyPage>>(() => getAllPages());
  const [selectedKey, setSelectedKey] = useState<string>('refund');
  const [activeForm, setActiveForm] = useState<PolicyPage>(() => getPage('refund'));
  const [editLang, setEditLang] = useState<'bn' | 'en'>('bn');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [newHighlightBn, setNewHighlightBn] = useState('');
  const [newHighlightEn, setNewHighlightEn] = useState('');

  // Reload form when selected page changes
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
    if (window.confirm('আপনি কি এই পেজের কন্টেন্ট ডিফল্ট ফরম্যাটে রিসেট করতে চান?')) {
      const reset = resetPageToDefault(selectedKey);
      setActiveForm(reset);
      setPages(getAllPages());
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const handleAddHighlightBn = () => {
    if (!newHighlightBn.trim()) return;
    const current = activeForm.highlightsBn || [];
    setActiveForm({
      ...activeForm,
      highlightsBn: [...current, newHighlightBn.trim()],
    });
    setNewHighlightBn('');
  };

  const handleRemoveHighlightBn = (index: number) => {
    const current = [...(activeForm.highlightsBn || [])];
    current.splice(index, 1);
    setActiveForm({ ...activeForm, highlightsBn: current });
  };

  const handleAddHighlightEn = () => {
    if (!newHighlightEn.trim()) return;
    const current = activeForm.highlights || [];
    setActiveForm({
      ...activeForm,
      highlights: [...current, newHighlightEn.trim()],
    });
    setNewHighlightEn('');
  };

  const handleRemoveHighlightEn = (index: number) => {
    const current = [...(activeForm.highlights || [])];
    current.splice(index, 1);
    setActiveForm({ ...activeForm, highlights: current });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-main-heading flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-[#0052FF]" />
            <span>Bilingual Policy Pages Editor (বাংলা ও ইংলিশ কাস্টমাইজেশন)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            এখানে বাংলা ও ইংরেজি কন্টেন্ট সেভ করলে তা লাইভ ওয়েবসাইটে সাথে সাথে আপডেটেড হয়ে যাবে
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>লাইভ ওয়েবসাইটে সেভ হয়েছে!</span>
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
              Select Policy Page ({PAGE_KEYS.length})
            </h3>
            <div className="space-y-1">
              {PAGE_KEYS.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedKey === item.key;
                const pageData = pages[item.key];
                return (
                  <button
                    key={item.key}
                    type="button"
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
                          {pageData?.titleBn || pageData?.title || item.label}
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

        {/* Right Column: Language Switcher Tabs & Editor Form */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-5">
            {/* Top Bar with Language Tabs & Action Buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-[#0052FF] bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                  Editing: {activeForm.key}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  পেজ কন্টেন্ট কাস্টমাইজেশন
                </h3>
              </div>

              {/* Language Selector Tabs */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditLang('bn')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      editLang === 'bn'
                        ? 'bg-[#0052FF] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🇧🇩 বাংলা সম্পাদনা
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditLang('en')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      editLang === 'en'
                        ? 'bg-[#0052FF] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🌐 English Edit
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                  title="রিসেট করে ডিফল্ট টেক্সট আনুন"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0052FF] hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Page</span>
                </button>
              </div>
            </div>

            {/* BANGLA EDIT FORM */}
            {editLang === 'bn' ? (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="flex items-center gap-2 text-xs font-bold text-orange-600 bg-orange-50 px-3 py-2 rounded-xl border border-orange-100">
                  <Globe className="w-4 h-4" />
                  <span>বাংলা ভাষা ভার্সন সম্পাদনা করছেন:</span>
                </div>

                {/* Title Bn */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    বাংলা পেজ শিরোনাম (Bangla Title)
                  </label>
                  <input
                    type="text"
                    value={activeForm.titleBn || ''}
                    onChange={(e) => setActiveForm({ ...activeForm, titleBn: e.target.value })}
                    placeholder="যেমন: রিটার্ন ও রিফান্ড পলিসি"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#0052FF]"
                  />
                </div>

                {/* Summary Bn */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    বাংলা সংক্ষিপ্ত সারসংক্ষেপ (Short Summary)
                  </label>
                  <input
                    type="text"
                    value={activeForm.summaryBn || ''}
                    onChange={(e) => setActiveForm({ ...activeForm, summaryBn: e.target.value })}
                    placeholder="যেমন: আমাদের ১০০% রিপ্লেসমেন্ট এবং মানি-ব্যাক গ্যারান্টি..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0052FF]"
                  />
                </div>

                {/* Content Bn */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      বাংলা মূল কন্টেন্ট (Detailed Policy Content in Bangla)
                    </label>
                    <span className="text-[11px] text-slate-400">
                      পয়েন্ট তৈরি করতে "১. শিরোনাম" দিয়ে নতুন লাইন শুরু করুন
                    </span>
                  </div>
                  <textarea
                    rows={11}
                    value={activeForm.contentBn || ''}
                    onChange={(e) => setActiveForm({ ...activeForm, contentBn: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed font-mono focus:outline-none focus:border-[#0052FF]"
                    placeholder="১. শিরোনাম:
প্যারাগ্রাফ লেখা..."
                  />
                </div>

                {/* Highlights Bn */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    বাংলা কি-হাইলাইটস / বুলেট পয়েন্টসমূহ (Bangla Highlights)
                  </label>
                  <div className="space-y-2 mb-3">
                    {(activeForm.highlightsBn || []).map((hl, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/70">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="text-xs text-slate-700 flex-1">{hl}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveHighlightBn(idx)}
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
                      value={newHighlightBn}
                      onChange={(e) => setNewHighlightBn(e.target.value)}
                      placeholder="নতুন বাংলা বুলেট পয়েন্ট যোগ করুন..."
                      className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0052FF]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddHighlightBn();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddHighlightBn}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* ENGLISH EDIT FORM */
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-xl border border-blue-100">
                  <Globe className="w-4 h-4" />
                  <span>Editing English Language Version:</span>
                </div>

                {/* Title En */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    English Page Title
                  </label>
                  <input
                    type="text"
                    value={activeForm.title || ''}
                    onChange={(e) => setActiveForm({ ...activeForm, title: e.target.value })}
                    placeholder="e.g. Return & Refund Policy"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#0052FF]"
                  />
                </div>

                {/* Summary En */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    English Short Summary
                  </label>
                  <input
                    type="text"
                    value={activeForm.summary || ''}
                    onChange={(e) => setActiveForm({ ...activeForm, summary: e.target.value })}
                    placeholder="e.g. Our 100% replacement and money-back guarantee..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0052FF]"
                  />
                </div>

                {/* Content En */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Detailed Policy Content in English
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Use "1. Heading" for numbered sections
                    </span>
                  </div>
                  <textarea
                    rows={11}
                    value={activeForm.content || ''}
                    onChange={(e) => setActiveForm({ ...activeForm, content: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed font-mono focus:outline-none focus:border-[#0052FF]"
                    placeholder="1. Section Heading:
Detailed text paragraph..."
                  />
                </div>

                {/* Highlights En */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    English Key Highlights / Bullet Points
                  </label>
                  <div className="space-y-2 mb-3">
                    {(activeForm.highlights || []).map((hl, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/70">
                        <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="text-xs text-slate-700 flex-1">{hl}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveHighlightEn(idx)}
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
                      value={newHighlightEn}
                      onChange={(e) => setNewHighlightEn(e.target.value)}
                      placeholder="Add new English highlight..."
                      className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0052FF]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddHighlightEn();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddHighlightEn}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Submit Row */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                পরিবর্তন সেভ করলে গ্রাহকরা বাংলা ও ইংলিশ উভয় ভার্সনে আপডেটেড টেক্সট দেখতে পাবেন
              </span>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0052FF] hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save All Changes</span>
              </button>
            </div>
          </form>

          {/* Live Customer Preview Box */}
          <div className="bg-white rounded-2xl border border-blue-100 p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#0052FF]" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Live Customer Preview ({editLang === 'bn' ? 'বাংলা ভার্সন' : 'English Version'})
                </h4>
              </div>
              <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Instant Live Sync
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-main-heading">
                  {editLang === 'bn'
                    ? activeForm.titleBn || activeForm.title
                    : activeForm.title || activeForm.titleBn}
                </h3>
              </div>

              {(editLang === 'bn' ? activeForm.summaryBn : activeForm.summary) && (
                <div className="p-3 bg-orange-50 border border-orange-100 rounded-xl text-xs text-orange-950 font-medium">
                  💡 {editLang === 'bn' ? activeForm.summaryBn : activeForm.summary}
                </div>
              )}

              <div className="whitespace-pre-line text-xs text-slate-600 leading-relaxed font-sans">
                {editLang === 'bn'
                  ? activeForm.contentBn || activeForm.content
                  : activeForm.content || activeForm.contentBn}
              </div>

              {((editLang === 'bn' ? activeForm.highlightsBn : activeForm.highlights) || []).length > 0 && (
                <div className="pt-2">
                  <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Highlights:
                  </h5>
                  <ul className="space-y-1.5">
                    {(editLang === 'bn' ? activeForm.highlightsBn : activeForm.highlights)?.map((hl, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
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
