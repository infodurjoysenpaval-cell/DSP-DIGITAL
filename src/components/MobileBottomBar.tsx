import React from 'react';
import { Home, List, MessageSquare, User, Menu } from 'lucide-react';
import { UserProfile } from '../types';
import { SHOP_INFO } from '../data/storeData';

interface MobileBottomBarProps {
  cartCount: number;
  onOpenCart: () => void;
  selectedCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
  onOpenCategories: () => void;
  onFocusSearch: () => void;
  searchQuery: string;
  currentUser?: UserProfile | null;
  onOpenAuth: (mode?: 'login' | 'register' | 'profile') => void;
  onOpenMenu: () => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  onSelectCategory,
  onOpenCategories,
  currentUser,
  onOpenAuth,
  onOpenMenu,
}) => {
  const phone = SHOP_INFO.whatsappNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent('Hello DSP Digital Mart! I need support.')}`;

  return (
    <nav
      id="mobile-bottom-nav-bar"
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] px-1 py-1"
    >
      <div className="grid grid-cols-5 items-center max-w-md mx-auto">
        {/* 1. Chat */}
        <a
          id="mobile-nav-chat"
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-1 text-slate-600 hover:text-blue-600 transition-colors"
        >
          <MessageSquare className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] sm:text-[11px] font-nav-text text-slate-600 mt-0.5">
            Chat
          </span>
        </a>

        {/* 2. Categories */}
        <button
          id="mobile-nav-categories"
          onClick={onOpenCategories}
          className="flex flex-col items-center justify-center py-1 text-slate-600 hover:text-blue-600 transition-colors"
        >
          <List className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] sm:text-[11px] font-nav-text text-slate-600 mt-0.5">
            Categories
          </span>
        </button>

        {/* 3. Home (Center Highlighted) */}
        <button
          id="mobile-nav-home"
          onClick={() => {
            onSelectCategory(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex flex-col items-center justify-center py-0.5"
        >
          <div className="w-12 h-7 sm:w-14 sm:h-8 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200/80 flex items-center justify-center shadow-2xs transition-transform active:scale-95">
            <Home className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-nav-text text-blue-600 mt-0.5">
            Home
          </span>
        </button>

        {/* 4. Account */}
        <button
          id="mobile-nav-account"
          onClick={() => onOpenAuth(currentUser ? 'profile' : 'login')}
          className="flex flex-col items-center justify-center py-1 text-slate-600 hover:text-blue-600 transition-colors"
        >
          {currentUser ? (
            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-btn-text">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
          ) : (
            <User className="w-5 h-5 stroke-[1.8]" />
          )}
          <span className="text-[10px] sm:text-[11px] font-nav-text text-slate-600 mt-0.5">
            Account
          </span>
        </button>

        {/* 5. Menu */}
        <button
          id="mobile-nav-menu"
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center py-1 text-slate-600 hover:text-blue-600 transition-colors"
        >
          <Menu className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] sm:text-[11px] font-nav-text text-slate-600 mt-0.5">
            Menu
          </span>
        </button>
      </div>
    </nav>
  );
};
