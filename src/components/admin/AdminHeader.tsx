import React, { useRef } from 'react';
import {
  Globe,
  Languages,
  HelpCircle,
  Search,
  Bell,
  User,
  LogOut,
  ExternalLink,
  Camera,
  Upload,
  Menu,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { updateUserAvatar } from '../../utils/authStorage';

interface AdminHeaderProps {
  title: string;
  currentUser: UserProfile | null;
  onVisitWebsite: () => void;
  onLogout: () => void;
  onToggleMobileSidebar?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  currentUser,
  onVisitWebsite,
  onLogout,
  onToggleMobileSidebar,
}) => {
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [avatarPreview, setAvatarPreview] = React.useState<string>(
    currentUser?.avatar || ''
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync avatar preview if currentUser changes
  React.useEffect(() => {
    if (currentUser?.avatar) {
      setAvatarPreview(currentUser.avatar);
    }
  }, [currentUser?.avatar]);

  // Handle image upload / selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (< 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('ছবির সাইজ ২MB এর কম হতে হবে');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setAvatarPreview(base64);
      if (currentUser?.id) {
        updateUserAvatar(currentUser.id, base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const currentDisplayAvatar = avatarPreview || currentUser?.avatar;

  return (
    <header className="h-16 sm:h-18 bg-white border-b border-slate-200/80 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.02)] shrink-0">
      {/* Title & Mobile Hamburger */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            aria-label="Open Navigation Menu"
            className="lg:hidden w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors shrink-0"
          >
            <Menu className="w-5 h-5 text-[#0052FF]" />
          </button>
        )}
        <h1 className="text-base sm:text-2xl font-extrabold text-slate-800 tracking-tight font-main-heading truncate max-w-[180px] sm:max-w-none">
          {title}
        </h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3.5">
        {/* Action Icons - hidden on very small phones, visible on sm+ */}
        <div className="hidden sm:flex items-center gap-1 sm:gap-1.5 text-slate-600">
          <button
            title="Language"
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <Globe className="w-4 h-4 text-slate-500" />
          </button>
          <button
            title="Translate"
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <Languages className="w-4 h-4 text-slate-500" />
          </button>
          <button
            title="Help"
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-slate-500" />
          </button>
          <button
            title="Search"
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <Search className="w-4 h-4 text-slate-500" />
          </button>
          <button
            title="Notifications"
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center relative transition-colors"
          >
            <Bell className="w-4 h-4 text-slate-500" />
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5 ring-2 ring-white"></span>
          </button>
        </div>

        {/* User Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-10 h-10 rounded-full bg-slate-100 hover:ring-2 hover:ring-[#0052FF]/40 flex items-center justify-center overflow-hidden border border-slate-200 transition-all cursor-pointer shadow-2xs"
            title="User Profile"
          >
            {currentDisplayAvatar ? (
              <img
                src={currentDisplayAvatar}
                alt={currentUser?.name || 'Admin'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#0052FF] text-white flex items-center justify-center font-bold text-sm">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
              </div>
            )}
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50">
              {/* User info header */}
              <div className="px-4 pb-3 border-b border-slate-100 flex items-center gap-3">
                <div className="relative group">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                    {currentDisplayAvatar ? (
                      <img
                        src={currentDisplayAvatar}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    title="কাস্টম প্রোফাইল ছবি আপলোড করুন"
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0052FF] hover:bg-[#0045DC] text-white flex items-center justify-center shadow-xs cursor-pointer"
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {currentUser?.name || 'Admin'}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {currentUser?.email}
                  </div>
                  <div className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-blue-50 text-[#0052FF] text-[10px] font-bold">
                    {currentUser?.role === 'admin' ? 'Super Admin' : 'Customer'}
                  </div>
                </div>
              </div>

              {/* Hidden File Input for uploading custom picture */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />

              {/* Action to change photo */}
              <div className="px-3 pt-2 pb-1 border-b border-slate-100">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-[#0052FF]" />
                  <span>কাস্টম ছবি পরিবর্তন / আপলোড</span>
                </button>
              </div>

              {/* Links */}
              <div className="pt-1">
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    onVisitWebsite();
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  <span>Visit Storefront</span>
                </button>

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
