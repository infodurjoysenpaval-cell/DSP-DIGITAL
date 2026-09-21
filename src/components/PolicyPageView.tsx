import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, Lock, RefreshCw, FileText, Award, CheckCircle2, CreditCard, Headphones, HelpCircle } from 'lucide-react';
import { SHOP_INFO } from '../data/storeData';
import { getPage } from '../utils/pagesStorage';
import { PolicyPage } from '../types';
import { getThemeConfig } from '../utils/adminStore';

interface PolicyPageViewProps {
  policyKey: string;
  onBack: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  refund: <RefreshCw className="w-6 h-6 text-[#0052FF]" />,
  privacy: <Lock className="w-6 h-6 text-[#0052FF]" />,
  terms: <FileText className="w-6 h-6 text-[#0052FF]" />,
  about: <Award className="w-6 h-6 text-[#0052FF]" />,
  'why-shop': <CheckCircle2 className="w-6 h-6 text-[#0052FF]" />,
  'payment-methods': <CreditCard className="w-6 h-6 text-[#0052FF]" />,
  support: <Headphones className="w-6 h-6 text-[#0052FF]" />,
  faq: <HelpCircle className="w-6 h-6 text-[#0052FF]" />,
};

export const PolicyPageView: React.FC<PolicyPageViewProps> = ({ policyKey, onBack }) => {
  const [language, setLanguage] = useState<'bn' | 'en'>(() => {
    return getThemeConfig().checkoutLanguage === 'bn' ? 'bn' : 'en';
  });
  const [pageData, setPageData] = useState<PolicyPage>(() => getPage(policyKey));

  // Scroll to top and reload page data when policyKey changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setPageData(getPage(policyKey));
  }, [policyKey]);

  // Listen for admin edits dynamically
  useEffect(() => {
    const handleUpdate = () => {
      setPageData(getPage(policyKey));
    };
    window.addEventListener('dsp_pages_updated', handleUpdate);
    return () => window.removeEventListener('dsp_pages_updated', handleUpdate);
  }, [policyKey]);

  const isBn = language === 'bn';

  const title = isBn
    ? (pageData.titleBn || pageData.title)
    : (pageData.title || pageData.titleBn);

  const rawContent = isBn
    ? (pageData.contentBn || pageData.content || '')
    : (pageData.content || pageData.contentBn || '');

  const summary = isBn
    ? (pageData.summaryBn || pageData.summary)
    : (pageData.summary || pageData.summaryBn);

  const highlights = isBn
    ? (pageData.highlightsBn || pageData.highlights)
    : (pageData.highlights || pageData.highlightsBn);

  // Helper to parse content into structured blocks
  const renderContentBlocks = (text: string) => {
    if (!text) return null;

    // Split by double newlines or numbered lines
    const blocks = text.split(/\n\s*\n/).filter(Boolean);

    return blocks.map((block, idx) => {
      const lines = block.split('\n').filter(Boolean);
      const firstLine = lines[0] || '';
      const isHeader = /^(\d+|[১২৩৪৫৬৭৮৯০]+)\.\s*/.test(firstLine);

      if (isHeader) {
        const match = firstLine.match(/^(\d+|[১২৩৪৫৬৭৮৯০]+)\.\s*(.*)/);
        const num = match ? match[1] + '.' : `${idx + 1}.`;
        const headingText = match ? match[2] : firstLine;
        const restLines = lines.slice(1);

        return (
          <div key={idx} className="space-y-2 pb-6 border-b border-slate-100 last:border-b-0 last:pb-0">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-start gap-2">
              <span className="text-orange-500 font-extrabold shrink-0">{num}</span>
              <span>{headingText}</span>
            </h3>
            {restLines.length > 0 && (
              <div className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-5 sm:pl-7 space-y-1.5">
                {restLines.map((line, lIdx) => (
                  <p key={lIdx}>{line}</p>
                ))}
              </div>
            )}
          </div>
        );
      }

      return (
        <div key={idx} className="space-y-2 pb-6 border-b border-slate-100 last:border-b-0 last:pb-0">
          <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-1.5 font-normal">
            {lines.map((line, lIdx) => (
              <p key={lIdx}>{line}</p>
            ))}
          </div>
        </div>
      );
    });
  };

  const icon = ICON_MAP[policyKey] || <FileText className="w-6 h-6 text-orange-500" />;

  return (
    <div className="w-full bg-[#F8FAFC] min-h-[70vh] py-6 sm:py-10 animate-in fade-in duration-200">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Navigation Row: Back to Home Button */}
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-orange-600 bg-white hover:bg-slate-50 border border-slate-200/90 px-4 py-2 rounded-full shadow-2xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>{isBn ? 'হোমে ফিরুন' : 'Back to Home'}</span>
          </button>
        </div>

        {/* Page Title & Language Selector Row (Matching Reference Image) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
              {icon}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight font-main-heading">
                {title}
              </h1>
              {pageData.lastUpdated && (
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isBn ? `সর্বশেষ আপডেট: ${pageData.lastUpdated}` : `Last Updated: ${pageData.lastUpdated}`}
                </p>
              )}
            </div>
          </div>

          {/* Language Switcher Pill matching Reference Image */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-1.5 flex items-center gap-1 shadow-2xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setLanguage('bn')}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                isBn
                  ? 'bg-[#0052FF] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              বাংলা
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                !isBn
                  ? 'bg-[#0052FF] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Short Summary Callout if available */}
        {summary && (
          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 text-xs sm:text-sm text-blue-950 font-medium leading-relaxed">
            💡 {summary}
          </div>
        )}

        {/* Main Clean Policy Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-10 space-y-8 text-slate-800">
          {renderContentBlocks(rawContent)}

          {/* Key Highlights list if provided */}
          {highlights && highlights.length > 0 && (
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                {isBn ? 'মূল হাইলাইটস / বিশেষ সুবিধাসমূহ:' : 'Key Highlights & Advantages:'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {highlights.map((item, hIdx) => (
                  <div key={hIdx} className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm font-semibold text-slate-800">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Contact Help Note */}
        <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-slate-700">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              {isBn
                ? 'আপনার কোনো প্রশ্ন বা সাহায্য লাগবে? সরাসরি হোয়াটসঅ্যাপে আমাদের টিমকে জানান।'
                : 'Have questions or need assistance? Contact our WhatsApp support anytime.'}
            </span>
          </div>
          <a
            href={`https://wa.me/${SHOP_INFO.whatsappNumber.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shrink-0 text-center shadow-2xs"
          >
            {isBn ? 'হোয়াটসঅ্যাপ মেসেজ' : 'WhatsApp Support'}
          </a>
        </div>
      </div>
    </div>
  );
};
