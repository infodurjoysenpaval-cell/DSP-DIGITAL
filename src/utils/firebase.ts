import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  sendEmailVerification,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  UserCredential,
} from 'firebase/auth';
import { UserProfile } from '../types';
import { saveGoogleUser, setUserEmailVerified, getCurrentUser } from './authStorage';

export const FIREBASE_CONFIG = {
  projectId: "gen-lang-client-0552424390",
  appId: "1:357993472629:web:9241bcddcf162dc4678e3c",
  apiKey: "AIzaSyAgc6CFQDxGHzoCV7l5Au8pQUtQPoOgSrQ",
  authDomain: "gen-lang-client-0552424390.firebaseapp.com",
  storageBucket: "gen-lang-client-0552424390.firebasestorage.app",
  messagingSenderId: "357993472629",
  measurementId: "",
  oAuthClientId: "357993472629-0mpbqbh9oksla6jubpk9dq0kilueult0.apps.googleusercontent.com",
};

export const GOOGLE_OAUTH_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID || FIREBASE_CONFIG.oAuthClientId;

const app = getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Helper to decode Google JWT token
export function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

/**
 * 1. Perform Official Google Sign-In with Firebase Auth
 * Automatically marks email as verified because Google authenticates the email address.
 */
export async function performOfficialGoogleSignIn(): Promise<{
  success: boolean;
  user?: UserProfile;
  message?: string;
}> {
  // Method 1: Firebase Auth Google Popup
  try {
    const result: UserCredential = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;
    if (fbUser && fbUser.email) {
      const userProfile: UserProfile = {
        id: `usr_g_${fbUser.uid}`,
        name: fbUser.displayName || fbUser.email.split('@')[0] || 'Google User',
        email: fbUser.email,
        phone: fbUser.phoneNumber || '',
        avatar:
          fbUser.photoURL ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        walletBalance: 0,
        referralCode:
          (fbUser.displayName || 'DSP').replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() +
          Math.floor(1000 + Math.random() * 9000),
        createdAt: new Date().toISOString(),
        emailVerified: true, // Google accounts are pre-verified by Google
        authProvider: 'google',
      };
      const saved = saveGoogleUser(userProfile);
      return { success: true, user: saved };
    }
  } catch (fbError: any) {
    console.warn('Firebase signInWithPopup fallback, trying Google Identity Services:', fbError?.message || fbError);
    if (fbError?.code === 'auth/popup-closed-by-user') {
      return { success: false, message: 'Google Sign-In popup was closed.' };
    }
  }

  // Method 2: Google Identity Services (GIS) OAuth Token Client
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.google?.accounts?.oauth2) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_OAUTH_CLIENT_ID,
          scope: 'openid profile email',
          callback: async (resp: any) => {
            if (resp.error) {
              resolve({
                success: false,
                message: `Google Sign-In error: ${resp.error_description || resp.error}`,
              });
              return;
            }

            if (resp.access_token) {
              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${resp.access_token}` },
                });
                const gData = await res.json();
                if (gData && gData.email) {
                  const userProfile: UserProfile = {
                    id: `usr_g_${gData.sub || Date.now()}`,
                    name: gData.name || gData.given_name || 'Google User',
                    email: gData.email,
                    phone: '',
                    avatar:
                      gData.picture ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
                    walletBalance: 0,
                    referralCode:
                      (gData.name || 'DSP').replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() +
                      Math.floor(1000 + Math.random() * 9000),
                    createdAt: new Date().toISOString(),
                    emailVerified: true, // Verified by Google OAuth
                    authProvider: 'google',
                  };
                  const saved = saveGoogleUser(userProfile);
                  resolve({ success: true, user: saved });
                  return;
                }
              } catch (e: any) {
                resolve({ success: false, message: e.message || 'Failed to fetch Google profile' });
                return;
              }
            }
            resolve({ success: false, message: 'Google Sign-In did not complete.' });
          },
        });
        client.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err: any) {
        resolve({ success: false, message: err.message || 'Google OAuth failed to initialize' });
        return;
      }
    }

    resolve({
      success: false,
      message: 'Google Sign-In service is initializing. Please try again in a moment.',
    });
  });
}

/**
 * 2. Send Firebase Email Verification Link to User's Email Inbox
 */
export async function sendFirebaseVerificationEmail(targetUser?: User | null): Promise<{
  success: boolean;
  message: string;
}> {
  const currentUser = targetUser || auth.currentUser;
  if (!currentUser) {
    return {
      success: false,
      message: 'No active Firebase session. Please sign in or provide your email first.',
    };
  }

  try {
    const actionCodeSettings = {
      url: window.location.origin + window.location.pathname,
      handleCodeInApp: true,
    };
    await sendEmailVerification(currentUser, actionCodeSettings);
    return {
      success: true,
      message: `Verification link sent to ${currentUser.email}! Please check your Gmail/inbox.`,
    };
  } catch (error: any) {
    if (error?.code === 'auth/too-many-requests') {
      return {
        success: false,
        message: 'A verification email was recently sent. Please check your inbox or wait a moment.',
      };
    }
    return {
      success: false,
      message: error?.message || 'Failed to send verification email. Please try again.',
    };
  }
}

/**
 * 3. Send Passwordless Magic Email Sign-In / Verification Link to User's Gmail / Email
 */
export async function sendEmailSignInVerificationLink(email: string): Promise<{
  success: boolean;
  message: string;
}> {
  const cleanEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    return {
      success: false,
      message: 'Please enter a valid email address.',
    };
  }

  const actionCodeSettings = {
    url: window.location.origin + window.location.pathname + '?emailAuth=true',
    handleCodeInApp: true,
  };

  try {
    await sendSignInLinkToEmail(auth, cleanEmail, actionCodeSettings);
    try {
      window.localStorage.setItem('dsp_email_for_signin', cleanEmail);
    } catch (e) {}

    return {
      success: true,
      message: `Firebase verification link sent to ${cleanEmail}! Open your email and click the link to verify & sign in.`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Failed to send email verification link.',
    };
  }
}

/**
 * 4. Check & Complete Email Verification from incoming Link
 */
export async function checkIncomingEmailVerificationLink(): Promise<{
  verified: boolean;
  user?: UserProfile;
  message?: string;
}> {
  if (typeof window === 'undefined') return { verified: false };

  if (isSignInWithEmailLink(auth, window.location.href)) {
    let email = window.localStorage.getItem('dsp_email_for_signin');
    if (!email) {
      email = window.prompt('Please enter the email address you used to request the verification link:');
    }

    if (email) {
      try {
        const result = await signInWithEmailLink(auth, email, window.location.href);
        window.localStorage.removeItem('dsp_email_for_signin');

        // Clean query params from URL without reload
        const newUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);

        if (result.user && result.user.email) {
          const userProfile: UserProfile = {
            id: `usr_fb_${result.user.uid}`,
            name: result.user.displayName || email.split('@')[0] || 'Verified User',
            email: result.user.email,
            phone: result.user.phoneNumber || '',
            avatar:
              result.user.photoURL ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
            walletBalance: 0,
            referralCode:
              (email.split('@')[0] || 'DSP').replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() +
              Math.floor(1000 + Math.random() * 9000),
            createdAt: new Date().toISOString(),
            emailVerified: true, // Successfully verified via email link!
            authProvider: 'firebase',
          };
          const saved = saveGoogleUser(userProfile);
          return {
            verified: true,
            user: saved,
            message: `Email ${email} has been successfully verified with Firebase!`,
          };
        }
      } catch (err: any) {
        return {
          verified: false,
          message: err?.message || 'Email verification link was invalid or expired.',
        };
      }
    }
  }

  return { verified: false };
}

/**
 * 5. Check live verification status by reloading the current Firebase user
 */
export async function checkCurrentEmailVerificationStatus(): Promise<{
  isVerified: boolean;
  user?: UserProfile;
}> {
  if (!auth.currentUser) {
    const current = getCurrentUser();
    return { isVerified: current?.emailVerified || false, user: current || undefined };
  }

  try {
    await auth.currentUser.reload();
    const isVerified = auth.currentUser.emailVerified;
    if (isVerified) {
      const updated = setUserEmailVerified(auth.currentUser.uid, true);
      return { isVerified: true, user: updated || undefined };
    }
    return { isVerified: false };
  } catch (err) {
    console.warn('Error refreshing Firebase email verification:', err);
    return { isVerified: false };
  }
}
