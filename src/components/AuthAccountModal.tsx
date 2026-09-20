import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  LogOut,
  ShoppingBag,
  Package,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { UserProfile, OrderDetails } from '../types';
import {
  loginUser,
  registerUser,
  logoutUser,
  getUserOrders,
} from '../utils/authStorage';
import { SHOP_INFO } from '../data/storeData';

interface AuthAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onUserChange: (user: UserProfile | null) => void;
  initialMode?: 'login' | 'register' | 'profile';
  onStartShopping?: () => void;
}

export const AuthAccountModal: React.FC<AuthAccountModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
  initialMode = 'login',
  onStartShopping,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'profile'>(
    currentUser ? 'profile' : initialMode
  );

  // Form states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');

  // Keep mode in sync when opening or user state changes
  React.useEffect(() => {
    if (currentUser) {
      setMode('profile');
    } else {
      setMode(initialMode === 'profile' ? 'login' : initialMode);
    }
    setErrorMsg('');
    setSuccessMsg('');
  }, [currentUser, initialMode, isOpen]);

  if (!isOpen) return null;

  const orders: OrderDetails[] = currentUser ? getUserOrders(currentUser) : [];

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const res = loginUser(identifier, password);
    if (!res.success) {
      setErrorMsg(res.message);
      return;
    }

    setSuccessMsg(res.message);
    if (res.user) {
      onUserChange(res.user);
      setMode('profile');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const res = registerUser(regName, regEmail, regPhone, regPassword);
    if (!res.success) {
      setErrorMsg(res.message);
      return;
    }

    setSuccessMsg(res.message);
    if (res.user) {
      onUserChange(res.user);
      setMode('profile');
    }
  };

  const handleDemoLogin = () => {
    setErrorMsg('');
    const res = loginUser('customer@dspdigitalmart.com', '123456');
    if (res.success && res.user) {
      setSuccessMsg('ডেমো একাউন্টে লগইন সফল হয়েছে!');
      onUserChange(res.user);
      setMode('profile');
    }
  };

  const handleLogout = () => {
    logoutUser();
    onUserChange(null);
    setMode('login');
    setSuccessMsg('সফলভাবে লগআউট করা হয়েছে।');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div
        id="auth-account-modal"
        className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-main-heading text-slate-800">
                {currentUser
                  ? 'আমার একাউন্ট (Customer Portal)'
                  : mode === 'login'
                  ? 'কাস্টমার লগইন'
                  : 'নতুন একাউন্ট রেজিস্টার'}
              </h2>
              <p className="text-[11px] text-slate-500 font-body-text">
                {currentUser
                  ? 'অর্ডার হিস্টোরি ও লাইসেন্স ডেলিভারি তথ্য'
                  : 'DSP DIGITAL MART এ স্বাগতম'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div className="mx-5 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-body-text">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mx-5 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-body-text flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ================= MODE: LOGGED IN USER PROFILE ================= */}
        {currentUser && mode === 'profile' && (
          <div className="p-5 sm:p-6 space-y-5">
            {/* User Profile Overview Card */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50/60 border border-blue-100 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-lg font-main-heading shadow-md shadow-blue-500/20">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-sub-heading text-slate-800">
                      {currentUser.name}
                    </h3>
                    <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-btn-text rounded-full">
                      ভেরিফাইড
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5 font-body-text">
                    <Mail className="w-3 h-3 text-slate-400" />
                    {currentUser.email}
                  </p>
                  <p className="text-xs text-slate-600 flex items-center gap-1 font-body-text">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {currentUser.phone}
                  </p>
                </div>
              </div>

              <button
                id="btn-customer-logout"
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-btn-text rounded-xl border border-slate-200 hover:border-rose-200 transition-all shadow-2xs"
                title="লগআউট করুন"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">লগআউট</span>
              </button>
            </div>

            {/* Sub-tabs: Orders vs Profile */}
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex items-center gap-2 pb-2.5 px-3 text-xs sm:text-sm font-btn-text border-b-2 transition-all ${
                  activeTab === 'orders'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>আমার অর্ডারসমূহ ({orders.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 pb-2.5 px-3 text-xs sm:text-sm font-btn-text border-b-2 transition-all ${
                  activeTab === 'profile'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <User className="w-4 h-4" />
                <span>প্রোফাইল তথ্য</span>
              </button>
            </div>

            {/* TAB: Order History */}
            {activeTab === 'orders' && (
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {orders.length === 0 ? (
                  <div className="text-center py-8 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <h4 className="text-sm font-sub-heading text-slate-700">
                      কোনো পূর্ববর্তী অর্ডার পাওয়া যায়নি
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto font-body-text">
                      আপনি এখনও কোনো প্রোডাক্ট কেনেননি। আপনার পছন্দের ডিজিটাল সফটওয়্যার বা সাবস্ক্রিপশন কিনতে পারেন।
                    </p>
                    {onStartShopping && (
                      <button
                        onClick={() => {
                          onClose();
                          onStartShopping();
                        }}
                        className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-btn-text rounded-xl shadow-sm transition-colors"
                      >
                        <span>কেনাকাটা শুরু করুন</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ) : (
                  orders.map((ord) => (
                    <div
                      key={ord.orderId}
                      className="p-3.5 bg-white border border-slate-200 rounded-2xl hover:border-blue-200 transition-all shadow-2xs space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-price-text text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200/60">
                            #{ord.orderId}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-body-text">
                            <Calendar className="w-3 h-3" />
                            {new Date(ord.createdAt).toLocaleDateString('bn-BD', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <span className="text-[10px] font-sub-heading px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          ডেলিভারি প্রক্রিয়াধীন
                        </span>
                      </div>

                      {/* Items List */}
                      <div className="space-y-1.5 pt-1 border-t border-slate-100 font-body-text">
                        {ord.items.map((it, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-xs text-slate-700"
                          >
                            <span className="font-medium truncate max-w-[240px]">
                              {it.quantity}x {it.product.name}
                              {it.selectedVariation && (
                                <span className="text-slate-400 text-[11px]">
                                  {' '}
                                  ({it.selectedVariation.name})
                                </span>
                              )}
                            </span>
                            <span className="font-price-text text-slate-800">
                              ৳
                              {(
                                (it.selectedVariation
                                  ? it.selectedVariation.salePrice
                                  : it.product.salePrice || 0) * it.quantity
                              ).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Footer Summary */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <span className="text-slate-500 font-body-text">
                          পেমেন্ট:{' '}
                          <span className="font-sub-heading text-slate-700 capitalize">
                            {ord.paymentMethod}
                          </span>
                          {ord.transactionId && (
                            <span className="text-[10px] font-mono text-slate-400 ml-1">
                              (Trx: {ord.transactionId})
                            </span>
                          )}
                        </span>
                        <span className="font-price-text text-blue-700 text-sm">
                          সর্বমোট: ৳{ord.totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: Profile Details */}
            {activeTab === 'profile' && (
              <div className="space-y-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70 text-xs font-body-text">
                <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                  <span className="text-slate-500">পুরো নাম</span>
                  <span className="font-semibold text-slate-800">{currentUser.name}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                  <span className="text-slate-500">ইমেইল ঠিকানা</span>
                  <span className="font-semibold text-slate-800 font-mono">{currentUser.email}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                  <span className="text-slate-500">মোবাইল নম্বর</span>
                  <span className="font-semibold text-slate-800">{currentUser.phone}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                  <span className="text-slate-500">মেম্বারশিপ স্ট্যাটাস</span>
                  <span className="font-semibold text-emerald-600">রেজিস্টার্ড কাস্টমার</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">সাপোর্ট প্রয়োজন?</span>
                  <a
                    href={`https://wa.me/${SHOP_INFO.whatsappNumber.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-btn-text text-blue-600 hover:underline"
                  >
                    হোয়াটসঅ্যাপে হেল্প নিন
                  </a>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-btn-text transition-colors"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        )}

        {/* ================= MODE: LOGIN FORM ================= */}
        {(!currentUser || mode !== 'profile') && mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="p-5 sm:p-6 space-y-4">
            <div className="text-center pb-1">
              <h3 className="text-lg font-sub-heading text-slate-800">লগইন করুন</h3>
              <p className="text-xs text-slate-500 mt-0.5 font-body-text">
                আপনার একাউন্টে লগইন করে পূর্বের অর্ডার এবং লাইসেন্স কোড দেখতে পারবেন
              </p>
            </div>

            {/* Identifier Input */}
            <div className="space-y-1">
              <label className="block text-xs font-body-text font-semibold text-slate-700">
                ইমেইল অথবা মোবাইল নম্বর <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="auth-login-identifier"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. customer@dspdigitalmart.com বা 01712..."
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-xs sm:text-sm font-body-text text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="block text-xs font-body-text font-semibold text-slate-700">
                পাসওয়ার্ড <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="auth-login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="আপনার পাসওয়ার্ড লিখুন"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-xs sm:text-sm font-body-text text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              id="auth-login-submit"
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-btn-text shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>লগইন করুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Demo 1-Click Login Button for convenience */}
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-btn-text transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>এক ক্লিকে ডেমো একাউন্টে লগইন করুন (Test Demo)</span>
            </button>

            {/* Switch to Register */}
            <div className="text-center pt-2 border-t border-slate-100 space-y-2 font-body-text">
              <p className="text-xs text-slate-500">
                নতুন কাস্টমার?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setMode('register');
                  }}
                  className="font-btn-text text-blue-600 hover:underline"
                >
                  নতুন একাউন্ট তৈরি করুন
                </button>
              </p>

              {/* Guest option */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs font-btn-text text-slate-400 hover:text-slate-700 transition-colors"
                >
                  লগইন ছাড়াই গেস্ট হিসেবে কেনাকাটা করুন →
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ================= MODE: REGISTER FORM ================= */}
        {(!currentUser || mode !== 'profile') && mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="p-5 sm:p-6 space-y-3.5">
            <div className="text-center pb-1">
              <h3 className="text-lg font-sub-heading text-slate-800">নতুন একাউন্ট খুলুন</h3>
              <p className="text-xs text-slate-500 mt-0.5 font-body-text">
                একাউন্ট থাকলে আপনার সকল অর্ডারের লাইসেন্স ও রিসিপ্ট সুরক্ষিত থাকবে
              </p>
            </div>

            {/* Full Name */}
            <div className="space-y-1">
              <label className="block text-xs font-body-text font-semibold text-slate-700">
                পুরো নাম <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="auth-register-name"
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. তানভীর আহমেদ"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-xs sm:text-sm font-body-text text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="block text-xs font-body-text font-semibold text-slate-700">
                ইমেইল ঠিকানা <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="auth-register-email"
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="e.g. name@gmail.com (লাইসেন্স ডেলিভারির জন্য)"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-xs sm:text-sm font-body-text text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="block text-xs font-body-text font-semibold text-slate-700">
                মোবাইল নম্বর <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="auth-register-phone"
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="e.g. 017XXXXXXXX"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-xs sm:text-sm font-body-text text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-xs font-body-text font-semibold text-slate-700">
                পাসওয়ার্ড <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="auth-register-password"
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="কমপক্ষে ৪ অক্ষরের পাসওয়ার্ড"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-xs sm:text-sm font-body-text text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            {/* Register Button */}
            <button
              id="auth-register-submit"
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-btn-text shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>রেজিস্টার সম্পন্ন করুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Switch to Login */}
            <div className="text-center pt-2 border-t border-slate-100 font-body-text">
              <p className="text-xs text-slate-500">
                ইতিমধ্যে একাউন্ট আছে?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setMode('login');
                  }}
                  className="font-btn-text text-blue-600 hover:underline"
                >
                  লগইন করুন
                </button>
              </p>
            </div>
          </form>
        )}

        {/* Security Assurance Badge */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-500 font-body-text">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>১০০% নিরাপদ ও এনক্রিপ্টেড ডিজিটাল শপিং প্ল্যাটফর্ম</span>
        </div>
      </div>
    </div>
  );
};
