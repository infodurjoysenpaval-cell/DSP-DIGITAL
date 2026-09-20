import React, { useState } from 'react';
import { CATEGORIES } from '../data/storeData';
import { Category } from '../types';
import { ChevronRight, ShieldCheck, Sparkles, Layers } from 'lucide-react';

interface CategoryBarProps {
  selectedCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const [showAllMobile, setShowAllMobile] = useState(false);

  return (
    <section className="w-full max-w-[1600px] 2xl:max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
      {/* Category Pills Row Matching Image 1 (All Gift Cards, VPN & Online Security, Windows Utility Key, etc.) */}
      <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-2 scrollbar-none">
        {/* All Products pill */}
        <button
          onClick={() => onSelectCategory(null)}
          className={`shrink-0 px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-nav-text transition-all shadow-2xs border ${
            selectedCategory === null
              ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:text-blue-600'
          }`}
        >
          All Gift Cards & Services
        </button>

        {/* Dynamic Category Pills */}
        {CATEGORIES.map((cat: Category) => {
          const isSelected = selectedCategory === cat.slug;
          return (
            <button
              key={cat._id}
              id={`cat-pill-${cat.slug}`}
              onClick={() => onSelectCategory(isSelected ? null : cat.slug)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-nav-text transition-all shadow-2xs border flex items-center gap-2 ${
                isSelected
                  ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              <img
                src={cat.images[0]}
                alt={cat.name}
                referrerPolicy="no-referrer"
                className="w-4 h-4 object-contain shrink-0"
              />
              <span className="whitespace-nowrap font-nav-text">{cat.name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
