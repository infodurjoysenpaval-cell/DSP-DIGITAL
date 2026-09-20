import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  Package,
  Bell,
  Wallet,
  Gift,
  Coins,
  Link2,
  User,
  LogOut,
  ArrowRight,
  ShoppingBag,
  CreditCard,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  CircleDollarSign,
  ShieldCheck,
  Plus,
  ArrowUpRight,
  X,
  Key,
  Camera,
  Upload,
  FileText,
} from 'lucide-react';
import { UserProfile, OrderDetails } from '../types';
import {
  getUserOrders,
  logoutUser,
  topUpWallet,
  bindUserReferrer,
  updateUserProfile,
  updateUserAvatar,
  getWalletTransactions,
  WalletTransaction,
} from '../utils/authStorage';
import { saveAffiliateApplication } from '../utils/affiliateStorage';
import { SHOP_INFO } from '../data/storeData';

interface UserAccountDashboardProps {
  currentUser: UserProfile;
  onUserChange: (user: UserProfile | null) => void;
  onBrowseProducts: () => void;
  initialTab?: string;
  onOpenAdmin?: () => void;
}

export const UserAccountDashboard: React.FC<UserAccountDashboardProps> = ({
  currentUser,
  onUserChange,
  onBrowseProducts,
  initialTab = 'dashboard',
  onOpenAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);

  // Top-Up Modal State
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('500');
  const [topUpMethod, setTopUpMethod] = useState<'bkash' | 'nagad' | 'rocket'>('bkash');
  const [topUpTrxId, setTopUpTrxId] = useState('');
  const [topUpMsg, setTopUpMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Bind Referrer State
  const [referrerCodeInput, setReferrerCodeInput] = useState('');
  const [bindMsg, setBindMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit Profile State
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profilePhone, setProfilePhone] = useState(currentUser.phone);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  // Copy state
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  // Affiliate Program Form State (Matching Reference Image)
  const savedAffiliateApp = useMemo(() => {
    try {
      const stored = localStorage.getItem(`dsp_affiliate_app_${currentUser.id}`);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, [currentUser.id]);

  const [affiliateForm, setAffiliateForm] = useState({
    fullName: savedAffiliateApp?.fullName || currentUser.name || '',
    contactNumber: savedAffiliateApp?.contactNumber || currentUser.phone || '',
    whatsappNumber: savedAffiliateApp?.whatsappNumber || currentUser.phone || '',
    email: savedAffiliateApp?.email || currentUser.email || '',
    channelLink: savedAffiliateApp?.channelLink || '',
    payoutMethod: savedAffiliateApp?.payoutMethod || 'bKash',
    accountNumber: savedAffiliateApp?.accountNumber || '',
    nidNumber: savedAffiliateApp?.nidNumber || '',
    documentUrl: savedAffiliateApp?.documentUrl || '',
    documentName: savedAffiliateApp?.documentName || '',
    documentType: savedAffiliateApp?.documentType || '',
    documentSize: savedAffiliateApp?.documentSize || '',
  });

  const [affiliateSubmitted, setAffiliateSubmitted] = useState(!!savedAffiliateApp);
  const [submittingAffiliate, setSubmittingAffiliate] = useState(false);
  const [affiliateMsg, setAffiliateMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    savedAffiliateApp
      ? {
          type: 'success',
          text: 'Your affiliate application has been submitted and is currently under review.',
        }
      : null
  );

  const handleAffiliateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAffiliateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit ~5MB
    if (file.size > 5 * 1024 * 1024) {
      setAffiliateMsg({ type: 'error', text: 'Document size must be less than 5MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const sizeInKb = (file.size / 1024).toFixed(0);
      const sizeStr = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${sizeInKb} KB`;
      setAffiliateForm((prev) => ({
        ...prev,
        documentUrl: base64,
        documentName: file.name,
        documentType: file.type,
        documentSize: sizeStr,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveDocument = () => {
    setAffiliateForm((prev) => ({
      ...prev,
      documentUrl: '',
      documentName: '',
      documentType: '',
      documentSize: '',
    }));
  };

  const handleAffiliateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAffiliateMsg(null);

    if (!affiliateForm.fullName.trim()) {
      setAffiliateMsg({ type: 'error', text: 'Please enter your full name.' });
      return;
    }
    if (!affiliateForm.contactNumber.trim()) {
      setAffiliateMsg({ type: 'error', text: 'Please enter your contact number.' });
      return;
    }
    if (!affiliateForm.email.trim()) {
      setAffiliateMsg({ type: 'error', text: 'Please enter your email address.' });
      return;
    }
    if (!affiliateForm.accountNumber.trim()) {
      setAffiliateMsg({ type: 'error', text: 'Please enter your payout account number.' });
      return;
    }

    setSubmittingAffiliate(true);
    setTimeout(() => {
      const applicationData = {
        ...affiliateForm,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      };
      try {
        localStorage.setItem(`dsp_affiliate_app_${currentUser.id}`, JSON.stringify(applicationData));
      } catch (err) {
        console.error('Failed to save affiliate app', err);
      }

      // Also save to shared admin applications store
      saveAffiliateApplication({
        userId: currentUser.id,
        fullName: affiliateForm.fullName,
        contactNumber: affiliateForm.contactNumber,
        whatsappNumber: affiliateForm.whatsappNumber,
        email: affiliateForm.email,
        channelLink: affiliateForm.channelLink,
        payoutMethod: affiliateForm.payoutMethod,
        accountNumber: affiliateForm.accountNumber,
        nidNumber: affiliateForm.nidNumber,
        documentUrl: affiliateForm.documentUrl,
        documentName: affiliateForm.documentName,
        documentType: affiliateForm.documentType,
        documentSize: affiliateForm.documentSize,
        status: 'pending',
      });

      setSubmittingAffiliate(false);
      setAffiliateSubmitted(true);
      setAffiliateMsg({
        type: 'success',
        text: 'Your application has been submitted successfully! Our admin team will review your documents and approve your account.',
      });
    }, 600);
  };

  // Orders calculation
  const orders: OrderDetails[] = useMemo(() => getUserOrders(currentUser), [currentUser]);

  const deliveredCount = useMemo(
    () => orders.filter((o) => (o.status || 'delivered') === 'delivered').length,
    [orders]
  );
  const pendingCount = useMemo(
    () => orders.filter((o) => o.status === 'pending' || o.status === 'processing').length,
    [orders]
  );
  const lifetimeSpend = useMemo(
    () => orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
    [orders]
  );

  const transactions: WalletTransaction[] = useMemo(
    () => getWalletTransactions(currentUser.id),
    [currentUser.id, isTopUpOpen]
  );

  // First name for greeting e.g. "Hi, Durjoy 👋"
  const firstName = currentUser.name.trim().split(' ')[0] || 'User';

  const referralUrl = `https://www.dspdigitalmart.com?ref=${currentUser.referralCode || 'DSP'}`;

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleCopyLicenseKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTopUpMsg(null);
    const amt = parseFloat(topUpAmount);
    if (isNaN(amt) || amt < 50) {
      setTopUpMsg({ type: 'error', text: 'সর্বনিম্ন টপ-আপ ৫০ টাকা।' });
      return;
    }
    if (!topUpTrxId.trim()) {
      setTopUpMsg({ type: 'error', text: 'অনুগ্রহ করে ট্রানজেকশন আইডি (TrxID) দিন।' });
      return;
    }

    const res = topUpWallet(currentUser.id, amt, topUpMethod, topUpTrxId.trim());
    if (res.success) {
      setTopUpMsg({ type: 'success', text: res.message });
      onUserChange({ ...currentUser, walletBalance: res.newBalance });
      setTopUpTrxId('');
      setTimeout(() => {
        setIsTopUpOpen(false);
        setTopUpMsg(null);
      }, 1500);
    } else {
      setTopUpMsg({ type: 'error', text: res.message });
    }
  };

  const handleBindReferrer = (e: React.FormEvent) => {
    e.preventDefault();
    setBindMsg(null);
    const res = bindUserReferrer(currentUser.id, referrerCodeInput.trim());
    if (res.success) {
      setBindMsg({ type: 'success', text: res.message });
      onUserChange({ ...currentUser, referredBy: referrerCodeInput.trim().toUpperCase() });
      setReferrerCodeInput('');
    } else {
      setBindMsg({ type: 'error', text: res.message });
    }
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    const res = updateUserProfile(currentUser.id, {
      name: profileName.trim(),
      phone: profilePhone.trim(),
    });
    if (res.success && res.user) {
      onUserChange(res.user);
      setProfileMsg('প্রোফাইল সফলভাবে আপডেট হয়েছে!');
      setTimeout(() => setProfileMsg(null), 2500);
    } else {
      setProfileMsg(res.message);
    }
  };

  const handleLogout = () => {
    logoutUser();
    onUserChange(null);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] py-6 sm:py-8">
      <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6">
        {/* Top Greeting Header Matching Reference Image */}
        {activeTab === 'dashboard' && (
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2 font-main-heading">
              Hi, {firstName} <span className="animate-bounce">👋</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-body-text">
              Welcome back to your dashboard
            </p>
          </div>
        )}

        {/* 2-Column Dashboard Layout Matching Reference Image */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Sidebar Menu Card Matching Image */}
          <aside className="w-full lg:w-64 shrink-0 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-3 space-y-1">
            {/* Admin Panel Quick Access (if admin) */}
            {currentUser.role === 'admin' && (
              <button
                id="dash-tab-admin-panel"
                onClick={onOpenAdmin}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-gradient-to-r from-[#0052FF] to-[#00DFBA] text-white font-bold shadow-xs hover:opacity-95 transition-all mb-2 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  <span>Admin Panel</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-200" />
              </button>
            )}

            {/* Dashboard */}
            <button
              id="dash-tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-all duration-150 ${
                activeTab === 'dashboard'
                  ? 'bg-[#FFF5ED] text-[#FF6B00] font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
              }`}
            >
              <LayoutDashboard
                className={`w-4 h-4 ${
                  activeTab === 'dashboard' ? 'text-[#FF6B00]' : 'text-slate-400'
                }`}
              />
              <span>Dashboard</span>
            </button>

            {/* My Orders */}
            <button
              id="dash-tab-orders"
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-all duration-150 ${
                activeTab === 'orders'
                  ? 'bg-[#FFF5ED] text-[#FF6B00] font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package
                  className={`w-4 h-4 ${
                    activeTab === 'orders' ? 'text-[#FF6B00]' : 'text-slate-400'
                  }`}
                />
                <span>My Orders</span>
              </div>
              {orders.length > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {orders.length}
                </span>
              )}
            </button>

            {/* Notifications */}
            <button
              id="dash-tab-notifications"
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-all duration-150 ${
                activeTab === 'notifications'
                  ? 'bg-[#FFF5ED] text-[#FF6B00] font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
              }`}
            >
              <Bell
                className={`w-4 h-4 ${
                  activeTab === 'notifications' ? 'text-[#FF6B00]' : 'text-slate-400'
                }`}
              />
              <span>Notifications</span>
            </button>

            {/* Wallet */}
            <button
              id="dash-tab-wallet"
              onClick={() => setActiveTab('wallet')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-all duration-150 ${
                activeTab === 'wallet'
                  ? 'bg-[#FFF5ED] text-[#FF6B00] font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
              }`}
            >
              <div className="flex items-center gap-3">
                <Wallet
                  className={`w-4 h-4 ${
                    activeTab === 'wallet' ? 'text-[#FF6B00]' : 'text-slate-400'
                  }`}
                />
                <span>Wallet</span>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                ৳{currentUser.walletBalance || 0}
              </span>
            </button>

            {/* Refer & Earn */}
            <button
              id="dash-tab-refer"
              onClick={() => setActiveTab('refer')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-all duration-150 ${
                activeTab === 'refer'
                  ? 'bg-[#FFF5ED] text-[#FF6B00] font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
              }`}
            >
              <Gift
                className={`w-4 h-4 ${
                  activeTab === 'refer' ? 'text-[#FF6B00]' : 'text-slate-400'
                }`}
              />
              <span>Refer & Earn</span>
            </button>

            {/* Affiliate */}
            <button
              id="dash-tab-affiliate"
              onClick={() => setActiveTab('affiliate')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm transition-all duration-150 ${
                activeTab === 'affiliate'
                  ? 'bg-[#FFEDE1] text-[#FF6B00] font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
              }`}
            >
              {activeTab === 'affiliate' ? (
                <div className="w-6 h-6 rounded-full bg-[#FF6B00] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  $
                </div>
              ) : (
                <div className="w-6 h-6 flex items-center justify-center text-slate-400 shrink-0">
                  <Coins className="w-4 h-4" />
                </div>
              )}
              <span>Affiliate</span>
            </button>

            {/* Bind Referrer */}
            <button
              id="dash-tab-bind-referrer"
              onClick={() => setActiveTab('bind-referrer')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-all duration-150 ${
                activeTab === 'bind-referrer'
                  ? 'bg-[#FFF5ED] text-[#FF6B00] font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
              }`}
            >
              <Link2
                className={`w-4 h-4 ${
                  activeTab === 'bind-referrer' ? 'text-[#FF6B00]' : 'text-slate-400'
                }`}
              />
              <span>Bind Referrer</span>
            </button>

            {/* Profile */}
            <button
              id="dash-tab-profile"
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-all duration-150 ${
                activeTab === 'profile'
                  ? 'bg-[#FFF5ED] text-[#FF6B00] font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
              }`}
            >
              <User
                className={`w-4 h-4 ${
                  activeTab === 'profile' ? 'text-[#FF6B00]' : 'text-slate-400'
                }`}
              />
              <span>Profile</span>
            </button>

            {/* Divider */}
            <div className="border-t border-slate-100 my-2 pt-1" />

            {/* Sign Out Button */}
            <button
              id="dash-btn-signout"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#F43F5E] hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4 text-[#F43F5E]" />
              <span>Sign Out</span>
            </button>
          </aside>

          {/* Right Main Content Area */}
          <main className="flex-1 w-full space-y-6">
            {/* ================= TAB 1: DASHBOARD (Exact Match to Image) ================= */}
            {activeTab === 'dashboard' && (
              <>
                {/* 1. MY WALLET Sleek Dark Chocolate Banner Matching Reference Image */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1B1008] via-[#2A150C] to-[#452010] p-6 sm:p-7 text-white shadow-md">
                  {/* Top Bar: Icon + Title on left, "Top up ->" on right */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-amber-200/90" />
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-100/90">
                        MY WALLET
                      </span>
                    </div>

                    <button
                      id="wallet-top-up-btn"
                      onClick={() => setIsTopUpOpen(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-white/90 bg-white/10 hover:bg-white/20 border border-white/20 transition-all hover:scale-[1.02] active:scale-95"
                    >
                      <span>Top up</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Large Balance Display */}
                  <div className="space-y-0.5">
                    <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-price-text text-white">
                      ৳{currentUser.walletBalance || 0}
                    </div>
                    <p className="text-xs sm:text-sm text-white/70 font-normal">
                      Available Balance
                    </p>
                  </div>
                </div>

                {/* 2. Four Metric Cards Row Matching Reference Image */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {/* Card 1: LIFETIME SPEND */}
                  <div
                    onClick={() => setActiveTab('orders')}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100/90 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-orange-200 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        LIFETIME SPEND
                      </span>
                      <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-2 font-price-text">
                        ৳{lifetimeSpend.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right mt-3 text-slate-400 group-hover:text-[#FF6B00] group-hover:translate-x-1 transition-all">
                      <ArrowRight className="w-4 h-4 ml-auto inline-block" />
                    </div>
                  </div>

                  {/* Card 2: ORDERS */}
                  <div
                    onClick={() => setActiveTab('orders')}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100/90 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-orange-200 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        ORDERS
                      </span>
                      <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-2 font-price-text">
                        {orders.length}
                      </div>
                    </div>
                    <div className="text-right mt-3 text-slate-400 group-hover:text-[#FF6B00] group-hover:translate-x-1 transition-all">
                      <ArrowRight className="w-4 h-4 ml-auto inline-block" />
                    </div>
                  </div>

                  {/* Card 3: DELIVERED */}
                  <div
                    onClick={() => setActiveTab('orders')}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100/90 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-orange-200 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        DELIVERED
                      </span>
                      <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-2 font-price-text">
                        {deliveredCount}
                      </div>
                    </div>
                    <div className="text-right mt-3 text-slate-400 group-hover:text-[#FF6B00] group-hover:translate-x-1 transition-all">
                      <ArrowRight className="w-4 h-4 ml-auto inline-block" />
                    </div>
                  </div>

                  {/* Card 4: PENDING */}
                  <div
                    onClick={() => setActiveTab('orders')}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100/90 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-orange-200 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        PENDING
                      </span>
                      <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-2 font-price-text">
                        {pendingCount}
                      </div>
                    </div>
                    <div className="text-right mt-3 text-slate-400 group-hover:text-[#FF6B00] group-hover:translate-x-1 transition-all">
                      <ArrowRight className="w-4 h-4 ml-auto inline-block" />
                    </div>
                  </div>
                </div>

                {/* 3. Recent Orders Section Matching Reference Image */}
                <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 sm:p-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 font-main-heading">
                      Recent Orders
                    </h2>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs sm:text-sm font-semibold text-[#FF6B00] hover:text-[#E05E00] flex items-center gap-1 transition-colors"
                    >
                      <span>View all</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Empty state matching Image exactly when 0 orders */}
                  {orders.length === 0 ? (
                    <div className="py-12 sm:py-16 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100/80 text-slate-400 flex items-center justify-center mx-auto mb-3">
                        <ShoppingBag className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-slate-600">
                        No orders yet.
                      </p>
                      <button
                        onClick={onBrowseProducts}
                        className="text-xs sm:text-sm font-bold text-[#FF6B00] hover:underline mt-1.5 inline-flex items-center gap-1"
                      >
                        <span>Browse products</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    /* Display recent orders list */
                    <div className="divide-y divide-slate-100">
                      {orders.slice(0, 4).map((ord) => (
                        <div
                          key={ord.orderId}
                          className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 px-2 rounded-xl transition-colors"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-800">
                                #{ord.orderId}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  (ord.status || 'delivered') === 'delivered'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {ord.status === 'pending' ? 'Pending' : 'Delivered'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 font-medium">
                              {ord.items.map((it) => it.product.name).join(', ')}
                            </p>
                            <span className="text-[11px] text-slate-400">
                              {new Date(ord.createdAt).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4">
                            <span className="text-sm font-bold text-slate-900 font-price-text">
                              ৳{ord.totalAmount.toLocaleString()}
                            </span>
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-[#FF6B00] hover:text-white text-slate-700 transition-colors"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ================= TAB 2: MY ORDERS ================= */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 font-main-heading">
                      My Orders
                    </h2>
                    <p className="text-xs text-slate-500">
                      View all your purchased digital products and license details
                    </p>
                  </div>
                  <button
                    onClick={onBrowseProducts}
                    className="px-3 py-1.5 bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                  >
                    + New Order
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="py-16 text-center">
                    <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-slate-700">No orders placed yet</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      All your software keys, VPN accounts, and digital subscriptions will appear here right after checkout.
                    </p>
                    <button
                      onClick={onBrowseProducts}
                      className="mt-4 px-4 py-2 bg-[#FF6B00] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#E05E00] transition-colors"
                    >
                      Browse Digital Products
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div
                        key={order.orderId}
                        className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300 transition-all space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-800">
                              Order #{order.orderId}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                (order.status || 'delivered') === 'delivered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {(order.status || 'delivered').toUpperCase()}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500">
                            {new Date(order.createdAt).toLocaleString()}
                          </span>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-100">
                              <img
                                src={item.product.images[0]}
                                alt={item.product.name}
                                className="w-12 h-12 object-contain rounded-lg bg-slate-50 p-1 border border-slate-200 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-bold text-slate-800 truncate">
                                  {item.product.name}
                                </h4>
                                <p className="text-[11px] text-slate-500">
                                  {item.selectedVariation?.name || 'Default Plan'} • Qty: {item.quantity}
                                </p>
                              </div>
                              <span className="text-xs font-bold text-slate-900">
                                ৳{(item.selectedVariation?.salePrice || item.product.salePrice || 0) * item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Digital License Key Badge if available */}
                        {order.licenseKey && (
                          <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <Key className="w-4 h-4 text-blue-600 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-[10px] uppercase font-bold text-blue-800">Digital License Key</p>
                                <p className="text-xs font-mono font-bold text-blue-900 truncate">
                                  {order.licenseKey}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleCopyLicenseKey(order.licenseKey!)}
                              className="px-2.5 py-1 bg-white hover:bg-blue-600 hover:text-white text-blue-700 text-xs font-bold rounded-lg border border-blue-200 shadow-2xs transition-colors shrink-0 flex items-center gap-1"
                            >
                              <Copy className="w-3 h-3" />
                              <span>{copiedKey ? 'Copied!' : 'Copy'}</span>
                            </button>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                          <span className="text-slate-500">
                            Paid via: <strong className="uppercase text-slate-700">{order.paymentMethod}</strong>
                          </span>
                          <span className="font-extrabold text-sm text-slate-900">
                            Total: ৳{order.totalAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ================= TAB 3: NOTIFICATIONS ================= */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 sm:p-6 space-y-4">
                <h2 className="text-base font-bold text-slate-900 font-main-heading">
                  Notifications
                </h2>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-emerald-900">
                        Welcome to DSP DIGITAL MART!
                      </h4>
                      <p className="text-xs text-emerald-700 mt-0.5">
                        Your customer account is active. You can now purchase software licenses, VPNs, and AI tools with 24/7 instant support.
                      </p>
                      <span className="text-[10px] text-emerald-600 mt-1 block">Just now</span>
                    </div>
                  </div>

                  {currentUser.walletBalance && currentUser.walletBalance > 0 ? (
                    <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-3">
                      <Wallet className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-blue-900">
                          Wallet Balance Available
                        </h4>
                        <p className="text-xs text-blue-700 mt-0.5">
                          You have ৳{currentUser.walletBalance} in your wallet ready for 1-click checkout.
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {/* ================= TAB 4: WALLET ================= */}
            {activeTab === 'wallet' && (
              <div className="space-y-5">
                {/* Big Wallet Card */}
                <div className="rounded-2xl bg-gradient-to-r from-[#1B1008] via-[#2A150C] to-[#452010] p-6 sm:p-7 text-white shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-200">
                      DSP Digital Wallet
                    </span>
                    <button
                      onClick={() => setIsTopUpOpen(true)}
                      className="px-4 py-1.5 bg-white text-[#1B1008] hover:bg-amber-50 text-xs font-bold rounded-full transition-all flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Money / Top Up</span>
                    </button>
                  </div>
                  <div className="text-3xl sm:text-5xl font-extrabold font-price-text">
                    ৳{currentUser.walletBalance || 0}
                  </div>
                  <p className="text-xs text-white/70 mt-1">Available balance for instant checkout</p>
                </div>

                {/* Wallet Transactions */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-2xs">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">Transaction History</h3>
                  {transactions.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      No wallet transactions recorded yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {transactions.map((tx) => (
                        <div key={tx.id} className="py-3 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-slate-800">{tx.description}</p>
                            <p className="text-[11px] text-slate-400">
                              {new Date(tx.createdAt).toLocaleDateString()} {tx.trxId ? `• TrxID: ${tx.trxId}` : ''}
                            </p>
                          </div>
                          <span
                            className={`font-bold font-price-text text-sm ${
                              tx.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {tx.type === 'credit' ? '+' : '-'}৳{tx.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ================= TAB 5: REFER & EARN ================= */}
            {activeTab === 'refer' && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 sm:p-6 space-y-5">
                <div>
                  <h2 className="text-base font-bold text-slate-900 font-main-heading">
                    Refer & Earn
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Share your unique link with friends. When they buy, earn 5% wallet cashback!
                  </p>
                </div>

                <div className="p-4 bg-orange-50/60 border border-orange-100 rounded-2xl space-y-2">
                  <span className="text-xs font-bold text-orange-900 uppercase">Your Referral Code</span>
                  <div className="flex items-center gap-3">
                    <span className="px-4 py-2 bg-white rounded-xl font-mono text-base font-bold text-[#FF6B00] border border-orange-200">
                      {currentUser.referralCode || 'DSP1001'}
                    </span>
                    <button
                      onClick={handleCopyReferral}
                      className="px-4 py-2 bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedRef ? 'Link Copied!' : 'Copy Share Link'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 pt-1 font-mono truncate">{referralUrl}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                    <span className="text-xs text-slate-500 font-semibold">Total Referred</span>
                    <div className="text-xl font-bold text-slate-800 mt-1">0 Users</div>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                    <span className="text-xs text-slate-500 font-semibold">Referral Earnings</span>
                    <div className="text-xl font-bold text-emerald-600 mt-1">৳0</div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 6: AFFILIATE ================= */}
            {activeTab === 'affiliate' && (
              <div className="space-y-6">
                {/* Header matching screenshot: Dollar Icon + Title */}
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full border-[1.5px] border-slate-900 flex items-center justify-center text-slate-900 font-bold text-xs shrink-0">
                    $
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-main-heading">
                    Affiliate Program
                  </h1>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_1px_6px_rgba(0,0,0,0.02)] p-6 sm:p-8 md:p-10">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Apply to become an affiliate
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-6 sm:mb-8">
                    Fill in your details — our team will review and approve your application.
                  </p>

                  {affiliateMsg && (
                    <div
                      className={`mb-6 p-4 rounded-xl text-xs sm:text-sm font-medium flex items-start gap-2.5 ${
                        affiliateMsg.type === 'success'
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                          : 'bg-rose-50 border border-rose-200 text-rose-800'
                      }`}
                    >
                      {affiliateMsg.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div>{affiliateMsg.text}</div>
                    </div>
                  )}

                  <form onSubmit={handleAffiliateSubmit}>
                    {/* Row 1: Full name + Contact number */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-5">
                      <div>
                        <label className="block text-xs sm:text-[13px] font-medium text-slate-700 mb-2">
                          Full name
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={affiliateForm.fullName}
                          onChange={handleAffiliateChange}
                          placeholder="Your name"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 transition-all bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-[13px] font-medium text-slate-700 mb-2">
                          Contact number
                        </label>
                        <input
                          type="text"
                          name="contactNumber"
                          value={affiliateForm.contactNumber}
                          onChange={handleAffiliateChange}
                          placeholder="01XXXXXXXXX"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 transition-all bg-white"
                        />
                      </div>
                    </div>

                    {/* Row 2: WhatsApp number + Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-5">
                      <div>
                        <label className="block text-xs sm:text-[13px] font-medium text-slate-700 mb-2">
                          WhatsApp number
                        </label>
                        <input
                          type="text"
                          name="whatsappNumber"
                          value={affiliateForm.whatsappNumber}
                          onChange={handleAffiliateChange}
                          placeholder="01XXXXXXXXX"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 transition-all bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-[13px] font-medium text-slate-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={affiliateForm.email}
                          onChange={handleAffiliateChange}
                          placeholder="you@example.com"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 transition-all bg-white"
                        />
                      </div>
                    </div>

                    {/* Row 3: Page / Group / Channel link (where you'll sell) */}
                    <div className="mb-4 sm:mb-5">
                      <label className="block text-xs sm:text-[13px] font-medium text-slate-700 mb-2">
                        Page / Group / Channel link (where you'll sell)
                      </label>
                      <input
                        type="text"
                        name="channelLink"
                        value={affiliateForm.channelLink}
                        onChange={handleAffiliateChange}
                        placeholder="https://facebook.com/yourpage"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 transition-all bg-white"
                      />
                    </div>

                    {/* Row 4: Payout method + Account number */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                      <div>
                        <label className="block text-xs sm:text-[13px] font-medium text-slate-700 mb-2">
                          Payout method
                        </label>
                        <div className="relative">
                          <select
                            name="payoutMethod"
                            value={affiliateForm.payoutMethod}
                            onChange={handleAffiliateChange}
                            className="w-full appearance-none px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 transition-all cursor-pointer pr-10"
                          >
                            <option value="bKash">bKash</option>
                            <option value="Nagad">Nagad</option>
                            <option value="Rocket">Rocket</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs sm:text-[13px] font-medium text-slate-700 mb-2">
                          Account number
                        </label>
                        <input
                          type="text"
                          name="accountNumber"
                          value={affiliateForm.accountNumber}
                          onChange={handleAffiliateChange}
                          placeholder="01XXXXXXXXX"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 transition-all bg-white"
                        />
                      </div>
                    </div>

                    {/* Row 5: NID / ID Number */}
                    <div className="mb-4 sm:mb-5">
                      <label className="block text-xs sm:text-[13px] font-medium text-slate-700 mb-2">
                        National ID (NID) / Passport / Student ID Number (পরিচয়পত্র নম্বর)
                      </label>
                      <input
                        type="text"
                        name="nidNumber"
                        value={affiliateForm.nidNumber}
                        onChange={handleAffiliateChange}
                        placeholder="যেমন: 19954817293847"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 transition-all bg-white"
                      />
                    </div>

                    {/* Row 6: Document Verification Upload */}
                    <div className="mb-6 sm:mb-8">
                      <label className="block text-xs sm:text-[13px] font-medium text-slate-700 mb-1.5">
                        Upload ID / Verification Document (NID, পাসপোর্ট, ট্রেড লাইসেন্স বা স্টুডেন্ট আইডি কার্ডের ছবি)
                      </label>
                      <p className="text-[11px] text-slate-500 mb-2.5">
                        অ্যাডমিন প্যানেলে আপনার ডকুমেন্ট যাচাই ও অ্যাপ্রুভালের জন্য পরিষ্কার ছবি বা ডকুমেন্ট আপলোড করুন (সর্বোচ্চ ৫ MB)
                      </p>

                      {affiliateForm.documentUrl ? (
                        <div className="p-3.5 rounded-2xl border border-blue-200 bg-blue-50/50 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 rounded-xl bg-white border border-blue-200 overflow-hidden shrink-0 flex items-center justify-center">
                              {affiliateForm.documentType?.includes('image') || affiliateForm.documentUrl.startsWith('data:image') ? (
                                <img
                                  src={affiliateForm.documentUrl}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <FileText className="w-6 h-6 text-[#0052FF]" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {affiliateForm.documentName || 'Verification_Document.jpg'}
                              </p>
                              <span className="text-[11px] text-slate-500">
                                {affiliateForm.documentSize || 'Ready for review'}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleRemoveDocument}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Remove file"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-slate-200 hover:border-[#0052FF] rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/20 group">
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleDocumentUpload}
                            className="hidden"
                          />
                          <div className="w-10 h-10 rounded-full bg-white shadow-2xs border border-slate-200 flex items-center justify-center text-slate-600 group-hover:text-[#0052FF] transition-colors mb-2">
                            <Upload className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-bold text-slate-700 group-hover:text-[#0052FF]">
                            ডকুমেন্ট বা NID কার্ডের ছবি নির্বাচন করুন
                          </span>
                          <span className="text-[11px] text-slate-400 mt-0.5">
                            PNG, JPG, JPEG বা PDF (Max 5MB)
                          </span>
                        </label>
                      )}
                    </div>

                    {/* Submit button: matching peach/coral style in reference image */}
                    <button
                      type="submit"
                      disabled={submittingAffiliate}
                      className="px-7 py-3 rounded-2xl sm:rounded-full bg-[#FFB088] hover:bg-[#FFA072] active:scale-[0.98] text-white text-sm font-semibold transition-all shadow-2xs disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      <span>{submittingAffiliate ? 'Submitting...' : 'Submit application'}</span>
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ================= TAB 7: BIND REFERRER ================= */}
            {activeTab === 'bind-referrer' && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 sm:p-6 space-y-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 font-main-heading">
                    Bind Referrer
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    If a friend referred you to DSP Digital Mart, enter their referral code below.
                  </p>
                </div>

                {currentUser.referredBy ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Already bound with referrer code: <strong>{currentUser.referredBy}</strong></span>
                  </div>
                ) : (
                  <form onSubmit={handleBindReferrer} className="space-y-3 max-w-md">
                    {bindMsg && (
                      <div
                        className={`p-3 rounded-xl text-xs font-semibold ${
                          bindMsg.type === 'success'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {bindMsg.text}
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Referral Code
                      </label>
                      <input
                        type="text"
                        value={referrerCodeInput}
                        onChange={(e) => setReferrerCodeInput(e.target.value)}
                        placeholder="e.g. TAN1024"
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm uppercase font-mono focus:outline-none focus:border-[#FF6B00]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                    >
                      Bind Code
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* ================= TAB 8: PROFILE ================= */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 sm:p-6 space-y-5">
                <div>
                  <h2 className="text-base font-bold text-slate-900 font-main-heading">
                    Profile Information
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Your real customer account details at DSP DIGITAL MART
                  </p>
                </div>

                {profileMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
                    {profileMsg}
                  </div>
                )}

                {/* Profile Photo Customization */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md bg-slate-200 flex items-center justify-center">
                      {currentUser.avatar ? (
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-[#FF6B00] to-[#FFA048] flex items-center justify-center text-white text-xl font-bold">
                          {currentUser.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <div className="text-xs font-bold text-slate-800">
                      Profile Picture (কাস্টম ছবি)
                    </div>
                    <p className="text-[11px] text-slate-500">
                      আপনার প্রোফাইলে যে ছবিটা আপলোড করবেন সেটি ওয়েবসাইটে এবং অ্যাকাউন্টে সেভ থাকবে।
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-xs font-semibold text-slate-700 shadow-2xs transition-colors">
                        <Camera className="w-3.5 h-3.5 text-[#FF6B00]" />
                        <span>ছবি আপলোড করুন</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 2 * 1024 * 1024) {
                              alert('ছবির সাইজ ২MB এর কম হতে হবে');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              const base64 = reader.result as string;
                              updateUserAvatar(currentUser.id, base64);
                              onUserChange({ ...currentUser, avatar: base64 });
                              setProfileMsg('প্রোফাইল ছবি সফলভাবে আপডেট হয়েছে!');
                              setTimeout(() => setProfileMsg(null), 2500);
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>

                      {currentUser.avatar && (
                        <button
                          type="button"
                          onClick={() => {
                            updateUserAvatar(currentUser.id, '');
                            onUserChange({ ...currentUser, avatar: undefined });
                            setProfileMsg('প্রোফাইল ছবি সরানো হয়েছে।');
                            setTimeout(() => setProfileMsg(null), 2500);
                          }}
                          className="px-2.5 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-[11px] font-semibold transition-colors"
                        >
                          ছবি মুছুন
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleProfileSave} className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="text"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address (Permanent)
                    </label>
                    <input
                      type="email"
                      value={currentUser.email}
                      disabled
                      className="w-full px-3.5 py-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-xl text-xs sm:text-sm cursor-not-allowed"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                  >
                    Save Changes
                  </button>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Top-Up / Add Money Modal */}
      {isTopUpOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsTopUpOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 font-main-heading">
              Wallet Top Up (ব্যালেন্স যোগ করুন)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Send money via bKash, Nagad or Rocket to add balance to your account.
            </p>

            {topUpMsg && (
              <div
                className={`mt-3 p-3 rounded-xl text-xs font-semibold ${
                  topUpMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {topUpMsg.text}
              </div>
            )}

            <form onSubmit={handleTopUpSubmit} className="mt-4 space-y-4">
              {/* Method selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['bkash', 'nagad', 'rocket'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setTopUpMethod(m)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold uppercase transition-all ${
                        topUpMethod === m
                          ? 'border-[#FF6B00] bg-orange-50 text-[#FF6B00] shadow-2xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Amount (BDT)
                </label>
                <div className="flex gap-2">
                  {['200', '500', '1000', '2000'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setTopUpAmount(val)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                        topUpAmount === val
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      ৳{val}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  min="50"
                  required
                  className="w-full mt-2 px-3.5 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              {/* Merchant / Personal Number */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
                <p>
                  Send Money to official {topUpMethod.toUpperCase()}:{' '}
                  <strong className="text-slate-900 font-mono text-sm">{SHOP_INFO.whatsappNumber}</strong>
                </p>
                <p className="text-[11px] text-slate-400">
                  টাকা পাঠিয়ে নিচের বক্সে ট্রানজেকশন আইডি দিন।
                </p>
              </div>

              {/* Transaction ID */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Transaction ID (TrxID)
                </label>
                <input
                  type="text"
                  value={topUpTrxId}
                  onChange={(e) => setTopUpTrxId(e.target.value)}
                  placeholder="e.g. 9J87X1K2P"
                  required
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono uppercase focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors"
              >
                Confirm Top Up (৳{topUpAmount})
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 font-main-heading">
              Order #{selectedOrder.orderId} Details
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
            </p>

            <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {selectedOrder.licenseKey && (
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase text-blue-800">
                    Product License Key / Credential
                  </span>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <span className="font-mono text-xs font-bold text-blue-900 truncate">
                      {selectedOrder.licenseKey}
                    </span>
                    <button
                      onClick={() => handleCopyLicenseKey(selectedOrder.licenseKey!)}
                      className="px-2.5 py-1 bg-white hover:bg-blue-600 hover:text-white text-blue-700 text-xs font-bold rounded-lg border border-blue-200 shadow-2xs transition-colors shrink-0"
                    >
                      {copiedKey ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}

              <div className="divide-y divide-slate-100">
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{it.product.name}</p>
                      <p className="text-[11px] text-slate-400">{it.selectedVariation?.name || 'Default'}</p>
                    </div>
                    <span className="font-bold text-slate-900">
                      ৳{(it.selectedVariation?.salePrice || it.product.salePrice || 0) * it.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 text-xs flex justify-between font-bold text-slate-800">
                <span>Total Paid:</span>
                <span className="text-sm font-price-text">৳{selectedOrder.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
