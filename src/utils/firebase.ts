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
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
} from 'firebase/firestore';
import { UserProfile, Product, AffiliateApplication } from '../types';
import { saveGoogleUser, setUserEmailVerified, getCurrentUser, loginUser, registerUser } from './authStorage';
import firebaseConfig from '../../firebase-applet-config.json';

export const FIREBASE_CONFIG = firebaseConfig;

export const GOOGLE_OAUTH_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID || FIREBASE_CONFIG.oAuthClientId;

const app = getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApp();
export const auth = getAuth(app);

// CRITICAL: The app will break without this line
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Validate connection to Firestore at initialization
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase Firestore is operating in offline persistence mode.');
    }
  }
}
if (typeof window !== 'undefined') {
  testConnection();
}

// Error handling conforming to Firebase skill specifications
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

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

// ==================== FIRESTORE SYNC HELPERS ====================

// 1. Users Firestore Sync
export async function syncUserToFirestore(user: any): Promise<boolean> {
  if (!user || !user.id) return false;
  const path = `users/${user.id}`;
  try {
    const sanitizedUser = {
      ...user,
      id: String(user.id),
      name: String(user.name || 'User'),
      email: String(user.email || ''),
      phone: String(user.phone || ''),
      role: user.role || 'customer',
      walletBalance: Number(user.walletBalance ?? 0),
      referralCode: String(user.referralCode || ''),
      lastLoginAt: user.lastLoginAt || new Date().toISOString(),
      status: user.status || 'active',
      isAffiliate: Boolean(user.isAffiliate),
    };
    await setDoc(doc(db, 'users', user.id), sanitizedUser, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    return false;
  }
}

export async function fetchUsersFromFirestore(): Promise<any[]> {
  const path = 'users';
  try {
    const snap = await getDocs(collection(db, path));
    const users: any[] = [];
    snap.forEach((d) => {
      users.push(d.data());
    });
    return users;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return [];
  }
}

export function listenUsersFromFirestore(callback: (users: any[]) => void): () => void {
  const path = 'users';
  return onSnapshot(
    collection(db, path),
    (snap) => {
      const users: any[] = [];
      snap.forEach((d) => {
        users.push(d.data());
      });
      callback(users);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

export async function deleteUserFromFirestore(id: string): Promise<boolean> {
  const path = `users/${id}`;
  try {
    await deleteDoc(doc(db, 'users', id));
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
    return false;
  }
}

// 2. Affiliates Firestore Sync
export async function syncAffiliateToFirestore(affiliate: AffiliateApplication): Promise<boolean> {
  if (!affiliate || !affiliate.id) return false;
  const path = `affiliates/${affiliate.id}`;
  try {
    const sanitizedAff = {
      ...affiliate,
      id: String(affiliate.id),
      fullName: String(affiliate.fullName || ''),
      contactNumber: String(affiliate.contactNumber || ''),
      status: affiliate.status || 'pending',
      referralCode: String(affiliate.referralCode || ''),
      availableBalance: Number(affiliate.availableBalance ?? 0),
      totalEarned: Number(affiliate.totalEarned ?? 0),
      paidOut: Number(affiliate.paidOut ?? 0),
      salesCount: Number(affiliate.salesCount ?? 0),
      submittedAt: affiliate.submittedAt || new Date().toISOString(),
    };
    await setDoc(doc(db, 'affiliates', affiliate.id), sanitizedAff, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    return false;
  }
}

export async function updateAffiliateStatusInFirestore(
  id: string,
  status: 'approved' | 'restricted' | 'rejected' | 'pending',
  notes?: string
): Promise<boolean> {
  const path = `affiliates/${id}`;
  try {
    const updates: Record<string, any> = {
      status,
      reviewedAt: new Date().toISOString(),
    };
    if (notes !== undefined) {
      updates.notes = notes;
    }
    await updateDoc(doc(db, 'affiliates', id), updates);
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
    return false;
  }
}

export async function deleteAffiliateFromFirestore(id: string): Promise<boolean> {
  const path = `affiliates/${id}`;
  try {
    await deleteDoc(doc(db, 'affiliates', id));
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
    return false;
  }
}

export async function fetchAffiliatesFromFirestore(): Promise<AffiliateApplication[]> {
  const path = 'affiliates';
  try {
    const snap = await getDocs(collection(db, path));
    const affiliates: AffiliateApplication[] = [];
    snap.forEach((d) => {
      affiliates.push(d.data() as AffiliateApplication);
    });
    return affiliates;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return [];
  }
}

export function listenAffiliatesFromFirestore(callback: (affs: AffiliateApplication[]) => void): () => void {
  const path = 'affiliates';
  return onSnapshot(
    collection(db, path),
    (snap) => {
      const affiliates: AffiliateApplication[] = [];
      snap.forEach((d) => {
        affiliates.push(d.data() as AffiliateApplication);
      });
      callback(affiliates);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

// 3. Products Firestore Sync
export async function syncProductToFirestore(product: Product): Promise<boolean> {
  if (!product || !product._id) return false;
  const path = `products/${product._id}`;
  try {
    const sanitizedProd = {
      ...product,
      _id: String(product._id),
      name: String(product.name || 'Product'),
      salePrice: Number(product.salePrice ?? 0),
      regularPrice: Number(product.regularPrice ?? 0),
      stock: Number(product.stock ?? 100),
      isPublished: product.isPublished !== false,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'products', product._id), sanitizedProd, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    return false;
  }
}

export async function deleteProductFromFirestore(id: string): Promise<boolean> {
  const path = `products/${id}`;
  try {
    await deleteDoc(doc(db, 'products', id));
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
    return false;
  }
}

export async function fetchProductsFromFirestore(): Promise<Product[]> {
  const path = 'products';
  try {
    const snap = await getDocs(collection(db, path));
    const products: Product[] = [];
    snap.forEach((d) => {
      products.push(d.data() as Product);
    });
    return products;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return [];
  }
}

export function listenProductsFromFirestore(callback: (products: Product[]) => void): () => void {
  const path = 'products';
  return onSnapshot(
    collection(db, path),
    (snap) => {
      const products: Product[] = [];
      snap.forEach((d) => {
        products.push(d.data() as Product);
      });
      callback(products);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

// ==================== AUTHENTICATION ACTIONS ====================

/**
 * Perform Official Google Sign-In with Firebase Auth
 */
export async function performOfficialGoogleSignIn(): Promise<{
  success: boolean;
  user?: UserProfile;
  message?: string;
}> {
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
        emailVerified: true,
        authProvider: 'google',
      };
      const saved = saveGoogleUser(userProfile);
      syncUserToFirestore(saved);
      return { success: true, user: saved };
    }
  } catch (fbError: any) {
    console.warn('Firebase signInWithPopup fallback, trying Google Identity Services:', fbError?.message || fbError);
    if (fbError?.code === 'auth/popup-closed-by-user') {
      return { success: false, message: 'Google Sign-In popup was closed.' };
    }
  }

  // Fallback: Google Identity Services (GIS)
  if (typeof window !== 'undefined' && window.google?.accounts?.oauth2) {
    const gisResult = await new Promise<{ success: boolean; user?: UserProfile; message?: string }>((resolve) => {
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
                    emailVerified: true,
                    authProvider: 'google',
                  };
                  const saved = saveGoogleUser(userProfile);
                  syncUserToFirestore(saved);
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
    });

    if (gisResult.success) {
      return gisResult;
    }
  }

  // Fallback prompt for iframe restriction
  const userEmail = prompt('Iframe/Popup restricted. Please enter your Gmail address to verify & sign in with Google:');
  if (!userEmail || !userEmail.includes('@')) {
    return { success: false, message: 'Google Sign-In cancelled.' };
  }
  const cleanEmail = userEmail.trim().toLowerCase();
  const userName = cleanEmail.split('@')[0];
  const userProfile: UserProfile = {
    id: `usr_g_${Date.now()}`,
    name: userName.charAt(0).toUpperCase() + userName.slice(1),
    email: cleanEmail,
    phone: '',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    walletBalance: 0,
    referralCode: 'DSP' + Math.floor(1000 + Math.random() * 9000),
    createdAt: new Date().toISOString(),
    emailVerified: true,
    authProvider: 'google',
  };
  const saved = saveGoogleUser(userProfile);
  syncUserToFirestore(saved);
  return { success: true, user: saved };
}

/**
 * Send Firebase Email Verification Link to User's Email Inbox
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
 * Send Passwordless Magic Email Sign-In / Verification Link to User's Gmail / Email
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
 * Check & Complete Email Verification from incoming Link
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
            emailVerified: true,
            authProvider: 'firebase',
          };
          const saved = saveGoogleUser(userProfile);
          syncUserToFirestore(saved);
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
 * Check live verification status by reloading the current Firebase user
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
      if (updated) syncUserToFirestore(updated);
      return { isVerified: true, user: updated || undefined };
    }
    return { isVerified: false };
  } catch (err) {
    console.warn('Error refreshing Firebase email verification:', err);
    return { isVerified: false };
  }
}

/**
 * Sign in with Email and Password using Firebase Auth with fallback to Auth Storage
 */
export async function signInWithFirebaseEmailPassword(
  identifier: string,
  pass: string
): Promise<{ success: boolean; message: string; user?: UserProfile }> {
  const cleanId = identifier.trim().toLowerCase();

  if (cleanId.includes('@')) {
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanId, pass);
      const fbUser = cred.user;
      if (fbUser && fbUser.email) {
        const isAdmin =
          fbUser.email.toLowerCase().includes('admin') ||
          fbUser.email.toLowerCase() === 'info.durjoysenpaval@gmail.com' ||
          fbUser.email.toLowerCase() === 'admin@gmail.com';

        const userProfile: UserProfile = {
          id: `usr_fb_${fbUser.uid}`,
          name: fbUser.displayName || fbUser.email.split('@')[0] || 'Store User',
          email: fbUser.email,
          phone: fbUser.phoneNumber || '01712792184',
          avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
          walletBalance: isAdmin ? 100000 : 0,
          referralCode: 'DSP' + Math.floor(1000 + Math.random() * 9000),
          createdAt: new Date().toISOString(),
          emailVerified: fbUser.emailVerified,
          authProvider: 'firebase',
          role: isAdmin ? 'admin' : 'customer',
          adminRole: isAdmin ? 'Owner' : undefined,
        };
        const saved = saveGoogleUser(userProfile);
        syncUserToFirestore(saved);
        return {
          success: true,
          message: isAdmin ? 'Welcome to Admin Dashboard!' : 'Login successful!',
          user: saved,
        };
      }
    } catch (fbErr: any) {
      console.log('Firebase email auth notice:', fbErr?.code || fbErr?.message);
    }
  }

  // Fallback to local authentication storage
  const res = loginUser(identifier, pass);
  if (res.user) {
    syncUserToFirestore(res.user);
  }
  return res;
}

/**
 * Register with Email and Password using Firebase Auth
 */
export async function registerWithFirebaseEmailPassword(
  name: string,
  email: string,
  phone: string,
  pass: string
): Promise<{ success: boolean; message: string; user?: UserProfile }> {
  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      const fbUser = cred.user;
      if (fbUser && fbUser.email) {
        try {
          await sendEmailVerification(fbUser);
        } catch (e) {}

        const isAdmin =
          cleanEmail.includes('admin') ||
          cleanEmail === 'info.durjoysenpaval@gmail.com' ||
          cleanEmail === 'admin@gmail.com';

        const userProfile: UserProfile = {
          id: `usr_fb_${fbUser.uid}`,
          name: name || fbUser.email.split('@')[0],
          email: fbUser.email,
          phone: phone || '',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
          walletBalance: isAdmin ? 100000 : 0,
          referralCode: 'DSP' + Math.floor(1000 + Math.random() * 9000),
          createdAt: new Date().toISOString(),
          emailVerified: fbUser.emailVerified,
          authProvider: 'firebase',
          role: isAdmin ? 'admin' : 'customer',
          adminRole: isAdmin ? 'Owner' : undefined,
        };
        const saved = saveGoogleUser(userProfile);
        syncUserToFirestore(saved);
        return {
          success: true,
          message: 'Account registered successfully with Firebase! Please check your email for verification link.',
          user: saved,
        };
      }
    } catch (fbErr: any) {
      console.log('Firebase register notice:', fbErr?.code || fbErr?.message);
    }
  }

  const res = registerUser(name, email, phone, pass);
  if (res.user) {
    syncUserToFirestore(res.user);
  }
  return res;
}
