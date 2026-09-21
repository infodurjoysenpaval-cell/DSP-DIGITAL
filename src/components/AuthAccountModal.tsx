import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Zap,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { UserProfile } from '../types';
import { loginUser, registerUser, saveGoogleUser } from '../utils/authStorage';
import {
  performOfficialGoogleSignIn,
  sendEmailSignInVerificationLink,
  signInWithFirebaseEmailPassword,
  registerWithFirebaseEmailPassword,
  GOOGLE_OAUTH_CLIENT_ID,
  parseJwt,
} from '../utils/firebase';

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
  currentUser: _currentUser,
  onUserChange,
  initialMode = 'login',
  onOpenDashboard,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');

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

  // Forgot password
  const [resetEmail, setResetEmail] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    setMode(initialMode === 'register' ? 'register' : 'login');
    setErrorMsg('');
    setSuccessMsg('');
    setGoogleLoading(false);
  }, [initialMode, isOpen]);

  // Google GSI auto-listener
  useEffect(() => {
    if (!isOpen) return;

    const setupGoogleId = () => {
      try {
        if (typeof window !== 'undefined' && window.google?.accounts?.id) {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_OAUTH_CLIENT_ID,
            callback: (response: any) => {
              if (response?.credential) {
                const payload = parseJwt(response.credential);
                if (payload && payload.email) {
                  const googleUser: UserProfile = {
                    id: `usr_g_${payload.sub || Date.now()}`,
                    name: payload.name || payload.given_name || 'Google User',
                    email: payload.email,
                    phone: '',
                    avatar:
                      payload.picture ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
                    walletBalance: 0,
                    referralCode:
                      (payload.name || 'DSP').replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() +
                      Math.floor(1000 + Math.random() * 9000),
                    createdAt: new Date().toISOString(),
                    emailVerified: true,
                    authProvider: 'google',
                  };
                  const saved = saveGoogleUser(googleUser);
                  onUserChange(saved);
                  setSuccessMsg(`Google verification successful! Logged in as ${saved.email}`);
                  setTimeout(() => {
                    onClose();
                    onOpenDashboard?.(saved);
                  }, 600);
                }
              }
            },
            auto_select: false,
          });
        }
      } catch (e) {
        console.warn('GSI init notice:', e);
      }
    };

    const timer = setTimeout(setupGoogleId, 150);
    return () => clearTimeout(timer);
  }, [isOpen, onUserChange, onClose, onOpenDashboard]);

  if (!isOpen) return null;

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setGoogleLoading(true);

    try {
      const res = await performOfficialGoogleSignIn();
      setGoogleLoading(false);

      if (res.success && res.user) {
        onUserChange(res.user);
        setSuccessMsg(`Welcome back, ${res.user.name}!`);
        setTimeout(() => {
          onClose();
          onOpenDashboard?.(res.user);
        }, 500);
      } else if (res.message) {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setGoogleLoading(false);
      setErrorMsg(err?.message || 'Google Sign-In failed. Please try again.');
    }
  };

  // Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await signInWithFirebaseEmailPassword(identifier, password);
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
        }, 400);
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err?.message || 'Login failed.');
    }
  };

  // Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Password and confirm password do not match!');
      return;
    }

    setLoading(true);

    try {
      const res = await registerWithFirebaseEmailPassword(regName, regEmail, regPhone, regPassword);
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
        }, 400);
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err?.message || 'Registration failed.');
    }
  };

  // Forgot Password Submit
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await sendEmailSignInVerificationLink(resetEmail.trim());
      setLoading(false);
      if (res.success) {
        setSuccessMsg(res.message);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err?.message || 'Failed to send reset link.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="auth-account-modal"
        className="relative bg-white w-full max-w-[440px] rounded-3xl shadow-2xl p-7 sm:p-9 border border-slate-100 my-auto animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button (X) */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Lightning Icon Badge */}
        <div className="w-12 h-12 rounded-full bg-[#EBF2FE] flex items-center justify-center mx-auto mb-4">
          <Zap className="w-5 h-5 text-[#2563EB] fill-[#2563EB]" />
        </div>

        {/* Dynamic Titles */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {mode === 'login' && 'Welcome back'}
            {mode === 'register' && 'Create an account'}
            {mode === 'forgot' && 'Reset password'}
          </h2>
          <p className="text-sm text-slate-500 mt-1.5">
            {mode === 'login' && 'Sign in to your DSP Digital account'}
            {mode === 'register' && 'Sign up to start shopping on DSP Digital'}
            {mode === 'forgot' && 'Enter your email to receive password reset instructions'}
          </p>
        </div>

        {/* Error and Success Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium flex items-start gap-2 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-medium flex items-start gap-2 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ================= LOGIN & REGISTER GOOGLE BUTTON ================= */}
        {mode !== 'forgot' && (
          <>
            <button
              id="btn-continue-with-google"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition-all flex items-center justify-center gap-2.5 shadow-2xs cursor-pointer disabled:opacity-60 active:scale-[0.99]"
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
              <span>{googleLoading ? 'Connecting with Google...' : 'Continue with Google'}</span>
            </button>

            {/* Subtle 'or' divider */}
            <div className="relative my-5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative bg-white px-3 text-xs text-slate-400">or</span>
            </div>
          </>
        )}

        {/* ================= 1. LOGIN FORM (MATCHES SCREENSHOT EXACTLY) ================= */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Email or Mobile / Username
              </label>
              <div className="relative rounded-xl border border-slate-200 bg-[#F8FAFC] focus-within:bg-white focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/10 transition-all">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-identifier"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="01XXXXXXXXX or email@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-transparent border-0 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-xs font-medium text-[#2563EB] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative rounded-xl border border-slate-200 bg-[#F8FAFC] focus-within:bg-white focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/10 transition-all">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-transparent border-0 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-mono tracking-wider placeholder:font-sans placeholder:tracking-normal"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-sm font-semibold shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer active:scale-[0.99] mt-5"
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            </button>

            {/* Footer switcher */}
            <p className="text-center text-sm text-slate-500 mt-5">
              No account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="font-semibold text-[#2563EB] hover:underline cursor-pointer"
              >
                Create one free
              </button>
            </p>
          </form>
        )}

        {/* ================= 2. REGISTER FORM ================= */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative rounded-xl border border-slate-200 bg-[#F8FAFC] focus-within:bg-white focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/10 transition-all">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Durjoy Sen"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-transparent border-0 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Mobile Number
              </label>
              <div className="relative rounded-xl border border-slate-200 bg-[#F8FAFC] focus-within:bg-white focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/10 transition-all">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="reg-phone"
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-transparent border-0 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative rounded-xl border border-slate-200 bg-[#F8FAFC] focus-within:bg-white focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/10 transition-all">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="you@gmail.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-transparent border-0 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative rounded-xl border border-slate-200 bg-[#F8FAFC] focus-within:bg-white focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/10 transition-all">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-8 pr-2.5 py-2.5 bg-transparent border-0 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-mono tracking-wider placeholder:font-sans placeholder:tracking-normal"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Confirm
                </label>
                <div className="relative rounded-xl border border-slate-200 bg-[#F8FAFC] focus-within:bg-white focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/10 transition-all">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="reg-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-8 pr-2.5 py-2.5 bg-transparent border-0 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-mono tracking-wider placeholder:font-sans placeholder:tracking-normal"
                  />
                </div>
              </div>
            </div>

            <button
              id="btn-register-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-sm font-semibold shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer active:scale-[0.99] mt-3"
            >
              <span>{loading ? 'Creating account...' : 'Create Account'}</span>
            </button>

            <p className="text-center text-sm text-slate-500 mt-4">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="font-semibold text-[#2563EB] hover:underline cursor-pointer"
              >
                Sign in
              </button>
            </p>
          </form>
        )}

        {/* ================= 3. FORGOT PASSWORD ================= */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Registered Email Address
              </label>
              <div className="relative rounded-xl border border-slate-200 bg-[#F8FAFC] focus-within:bg-white focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/10 transition-all">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="reset-email-input"
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-transparent border-0 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <button
              id="btn-forgot-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-sm font-semibold shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer active:scale-[0.99]"
            >
              <span>{loading ? 'Sending link...' : 'Send Reset Link'}</span>
            </button>

            <p className="text-center text-sm text-slate-500 mt-4">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="inline-flex items-center gap-1.5 font-semibold text-[#2563EB] hover:underline cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign in
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
