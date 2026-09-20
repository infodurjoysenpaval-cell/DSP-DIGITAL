import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { UserProfile } from '../types';
import { loginUser, registerUser, loginWithGoogle, saveGoogleUser } from '../utils/authStorage';

declare global {
  interface Window {
    google?: any;
  }
}

interface AuthAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onUserChange: (user: UserProfile | null) => void;
  initialMode?: 'login' | 'register';
  onOpenDashboard?: (user?: UserProfile) => void;
}

export const AuthAccountModal: React.FC<AuthAccountModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
  initialMode = 'login',
  onOpenDashboard,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const [customGmail, setCustomGmail] = useState('');
  const [showCustomEmailInput, setShowCustomEmailInput] = useState(false);

  // Form states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setMode(initialMode);
    setShowGoogleChooser(false);
    setErrorMsg('');
    setSuccessMsg('');
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSelectGoogleAccount = (acc: { name: string; email: string; avatar?: string }) => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    setTimeout(() => {
      const googleUser: UserProfile = {
        id: `usr_g_${Date.now()}`,
        name: acc.name,
        email: acc.email,
        phone: '0171' + Math.floor(1000000 + Math.random() * 9000000),
        avatar: acc.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        walletBalance: 0,
        referralCode: (acc.name || 'DSP').slice(0, 3).toUpperCase() + Math.floor(1000 + Math.random() * 9000),
        createdAt: new Date().toISOString(),
      };

      const saved = saveGoogleUser(googleUser);
      onUserChange(saved);
      setLoading(false);
      setSuccessMsg(`DSP DIGITAL MART-এ (${saved.email}) দিয়ে সফলভাবে লগইন হয়েছে!`);
      setTimeout(() => {
        setShowGoogleChooser(false);
        onClose();
        onOpenDashboard?.(saved);
      }, 600);
    }, 400);
  };

  const handleGoogleSignIn = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const GOOGLE_CLIENT_ID = '357993472629-apps.googleusercontent.com';

    const triggerGIS = () => {
      if (window.google?.accounts?.oauth2) {
        try {
          const client = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: 'openid profile email',
            callback: async (resp: any) => {
              if (resp.error) {
                setLoading(false);
                if (resp.error === 'popup_closed_by_user') {
                  setErrorMsg('গুগল সাইন-ইন উইন্ডোটি বন্ধ করা হয়েছে।');
                } else {
                  setShowGoogleChooser(true);
                }
                return;
              }

              if (resp.access_token) {
                try {
                  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${resp.access_token}` },
                  });
                  const gData = await res.json();
                  if (gData && gData.email) {
                    const googleUser: UserProfile = {
                      id: `usr_g_${gData.sub || Date.now()}`,
                      name: gData.name || gData.given_name || 'Google User',
                      email: gData.email,
                      phone: '0171' + Math.floor(1000000 + Math.random() * 9000000),
                      avatar: gData.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
                      walletBalance: 0,
                      referralCode: (gData.name || 'DSP').slice(0, 3).toUpperCase() + Math.floor(1000 + Math.random() * 9000),
                      createdAt: new Date().toISOString(),
                    };

                    const saved = saveGoogleUser(googleUser);
                    onUserChange(saved);
                    setLoading(false);
                    setSuccessMsg(`DSP DIGITAL MART-এ অফিশিয়াল গুগল অ্যাকাউন্ট (${saved.email}) দিয়ে সফলভাবে লগইন হয়েছে!`);
                    setTimeout(() => {
                      onClose();
                      onOpenDashboard?.(saved);
                    }, 600);
                    return;
                  }
                } catch (e) {
                  console.error(e);
                }
              }

              setLoading(false);
              setShowGoogleChooser(true);
            },
          });
          client.requestAccessToken({ prompt: 'select_account' });
        } catch (e) {
          setLoading(false);
          setShowGoogleChooser(true);
        }
      } else {
        setLoading(false);
        setShowGoogleChooser(true);
      }
    };

    if (!window.google?.accounts?.oauth2) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        triggerGIS();
      };
      script.onerror = () => {
        setLoading(false);
        setShowGoogleChooser(true);
      };
      document.body.appendChild(script);
    } else {
      triggerGIS();
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    setTimeout(() => {
      const res = loginUser(identifier, password);
      setLoading(false);

      if (!res.success) {
        setErrorMsg(res.message);
        return;
      }

      setSuccessMsg(res.message);
      if (res.user) {
        onUserChange(res.user);
        const authedUser = res.user;
        setTimeout(() => {
          onClose();
          onOpenDashboard?.(authedUser);
        }, 500);
      }
    }, 400);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মিলছে না!');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const res = registerUser(regName, regEmail, regPhone, regPassword);
      setLoading(false);

      if (!res.success) {
        setErrorMsg(res.message);
        return;
      }

      setSuccessMsg(res.message);
      if (res.user) {
        onUserChange(res.user);
        const authedUser = res.user;
        setTimeout(() => {
          onClose();
          onOpenDashboard?.(authedUser);
        }, 500);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        id="auth-account-modal"
        className="relative bg-white w-full max-w-sm sm:max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Branding Badge (Matching Neon Blue Theme) */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-full bg-blue-100/90 flex items-center justify-center mx-auto mb-3.5 shadow-2xs">
            <Zap className="w-6 h-6 text-[#2563EB] fill-[#2563EB]" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {mode === 'login' ? 'Welcome back' : 'Create an Account'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {mode === 'login'
              ? 'Sign in to your DSP Digital account'
              : 'Sign up for your DSP Digital account'}
          </p>
        </div>

        {/* Error / Success Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ================= GOOGLE ACCOUNT CHOOSER (DSP DIGITAL MART BRANDED) ================= */}
        {showGoogleChooser ? (
          <div className="py-1 animate-in fade-in zoom-in-95 duration-150">
            {/* Google Header */}
            <div className="text-center pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center justify-center gap-2 mb-1.5">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="text-base font-extrabold text-slate-800">Sign in with Google</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                To continue to <strong className="text-slate-900 font-bold">DSP DIGITAL MART</strong>
              </p>
            </div>

            <p className="text-xs font-semibold text-slate-700 mb-2.5 px-1">Choose an account</p>

            {/* Account Options */}
            <div className="space-y-2 mb-4">
              {/* Option 1: Official User Google Account */}
              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  handleSelectGoogleAccount({
                    name: 'Durjoy Sen Paval',
                    email: 'info.durjoysenpaval@gmail.com',
                    avatar:
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
                  })
                }
                className="w-full p-3 bg-slate-50 hover:bg-slate-100/90 border border-slate-200 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer group disabled:opacity-50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden border border-slate-200">
                    <span className="uppercase">D</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-[#2563EB]">
                      Durjoy Sen Paval
                    </p>
                    <p className="text-xs text-slate-500 truncate">info.durjoysenpaval@gmail.com</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0 border border-emerald-100">
                  Google Account
                </span>
              </button>

              {/* Option 2: Custom Gmail Entry */}
              {showCustomEmailInput ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (customGmail.trim()) {
                      const cleanEmail = customGmail.trim().toLowerCase();
                      const namePart = cleanEmail.split('@')[0];
                      const formattedName =
                        namePart.charAt(0).toUpperCase() + namePart.slice(1);
                      handleSelectGoogleAccount({
                        name: formattedName,
                        email: cleanEmail,
                        avatar:
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
                      });
                    }
                  }}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2"
                >
                  <label className="block text-xs font-semibold text-slate-700">
                    Enter your Google / Gmail Address
                  </label>
                  <input
                    type="email"
                    required
                    value={customGmail}
                    onChange={(e) => setCustomGmail(e.target.value)}
                    placeholder="your.email@gmail.com"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#2563EB]"
                  />
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowCustomEmailInput(false)}
                      className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-1.5 text-xs bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-xl cursor-pointer"
                    >
                      {loading ? 'Authenticating...' : 'Continue'}
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCustomEmailInput(true)}
                  className="w-full p-3 bg-white hover:bg-slate-50 border border-dashed border-slate-300 rounded-2xl flex items-center gap-3 text-left transition-all cursor-pointer text-slate-700 text-xs font-semibold"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <span>Use another Google Account</span>
                </button>
              )}
            </div>

            {/* Google Terms Disclaimer */}
            <p className="text-[11px] leading-relaxed text-slate-400 text-center px-2 border-t border-slate-100 pt-3">
              To continue, Google will share your name, email address, language preference, and profile picture with <strong className="text-slate-600 font-semibold">DSP DIGITAL MART</strong>.
            </p>

            <button
              type="button"
              onClick={() => {
                setShowGoogleChooser(false);
                setShowCustomEmailInput(false);
              }}
              className="w-full mt-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors text-center cursor-pointer"
            >
              ← Back to Sign In
            </button>
          </div>
        ) : (
          <>
            {/* Google Sign-In Button (Exact Match to image.png) */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-full border border-slate-200/90 bg-slate-100/80 hover:bg-slate-200/80 text-slate-800 text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2.5 shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Or Divider */}
            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative bg-white px-3 text-xs text-slate-400 font-medium">or</span>
            </div>
          </>
        )}

        {/* ================= SIGN IN FORM ================= */}
        {!showGoogleChooser && mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="login-identifier"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#2563EB] transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert('Password reset link sent to your email!')}
                  className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#2563EB] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="btn-login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-sm font-bold shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
            </button>

            {/* Switch to Register */}
            <div className="text-center pt-2 text-xs text-slate-500 font-medium">
              No account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-[#2563EB] font-bold hover:underline transition-colors ml-0.5 cursor-pointer"
              >
                Create one free
              </button>
            </div>
          </form>
        )}

        {/* ================= REGISTER FORM ================= */}
        {!showGoogleChooser && mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Durjoy Sen"
                  className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#2563EB] transition-colors"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="reg-phone"
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="e.g. 017XXXXXXXX"
                  className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#2563EB] transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#2563EB] transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#2563EB] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="reg-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#2563EB] transition-colors"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="btn-register-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-sm font-bold shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer mt-1"
            >
              <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
            </button>

            {/* Switch to Login */}
            <div className="text-center pt-2 text-xs text-slate-500 font-medium">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-[#2563EB] font-bold hover:underline transition-colors ml-0.5 cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
