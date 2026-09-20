import { UserProfile, OrderDetails } from '../types';

const CURRENT_USER_KEY = 'dsp_current_user';
const REGISTERED_USERS_KEY = 'dsp_registered_users';
const ORDERS_STORAGE_KEY = 'dsp_customer_orders';
const WALLET_HISTORY_KEY = 'dsp_wallet_transactions';

export interface StoredUserAccount extends UserProfile {
  passwordHash: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  method?: string;
  trxId?: string;
  description: string;
  status: 'completed' | 'pending';
  createdAt: string;
}

// Generate unique referral code
const generateReferralCode = (name: string): string => {
  const prefix = name.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'DSP';
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${randomSuffix}`;
};

export const getRegisteredUsers = (): StoredUserAccount[] => {
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    if (!raw) return [];
    const parsed: StoredUserAccount[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Scrub any legacy demo accounts
    const filtered = parsed.filter(
      (u) => u.id !== 'usr_demo_101' && u.email !== 'customer@dspdigitalmart.com'
    );
    if (filtered.length !== parsed.length) {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(filtered));
    }
    return filtered;
  } catch (e) {
    return [];
  }
};

export const getCurrentUser = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    const parsed: UserProfile = JSON.parse(raw);
    if (parsed.id === 'usr_demo_101' || parsed.email === 'customer@dspdigitalmart.com') {
      localStorage.removeItem(CURRENT_USER_KEY);
      return null;
    }
    return parsed;
  } catch (e) {
    return null;
  }
};

export const loginUser = (
  identifier: string,
  password: string
): { success: boolean; message: string; user?: UserProfile } => {
  const cleanId = identifier.trim().toLowerCase();
  const cleanPass = password.trim();

  if (!cleanId) {
    return { success: false, message: 'অনুগ্রহ করে আপনার মোবাইল নম্বর অথবা ইমেইল দিন।' };
  }
  if (!cleanPass) {
    return { success: false, message: 'অনুগ্রহ করে পাসওয়ার্ড দিন।' };
  }

  // Admin Login Support (admin@gmail.com / admin)
  if (cleanId === 'admin@gmail.com' && cleanPass === 'admin') {
    const adminProfile: UserProfile = {
      id: 'usr_admin_master',
      name: 'Admin',
      email: 'admin@gmail.com',
      phone: '01712792184',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      walletBalance: 100000,
      referralCode: 'ADMINVIP',
      createdAt: '2026-08-19T00:00:00.000Z',
    };
    try {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(adminProfile));
    } catch (e) {}
    return { success: true, message: 'অ্যাডমিন প্যানেলে স্বাগতম!', user: adminProfile };
  }

  const users = getRegisteredUsers();
  const found = users.find(
    (u) =>
      u.email.toLowerCase() === cleanId ||
      u.phone.replace(/[^0-9]/g, '') === cleanId.replace(/[^0-9]/g, '')
  );

  if (!found) {
    return {
      success: false,
      message: 'এই মোবাইল নম্বর বা ইমেইল দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে নতুন একাউন্ট খুলুন।',
    };
  }

  if (found.passwordHash !== cleanPass) {
    return {
      success: false,
      message: 'ভুল পাসওয়ার্ড! দয়া করে সঠিক পাসওয়ার্ড দিন।',
    };
  }

  const profile: UserProfile = {
    id: found.id,
    name: found.name,
    email: found.email,
    phone: found.phone,
    avatar: found.avatar,
    walletBalance: found.walletBalance ?? 0,
    referralCode: found.referralCode || generateReferralCode(found.name),
    referredBy: found.referredBy,
    createdAt: found.createdAt,
  };

  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
  } catch (e) {}

  return { success: true, message: 'সফলভাবে লগইন হয়েছে!', user: profile };
};

export const loginWithGoogle = (): { success: boolean; message: string; user?: UserProfile } => {
  const users = getRegisteredUsers();
  let googleUser = users.find((u) => u.email.includes('google') || u.email.includes('gmail'));

  if (!googleUser) {
    const newUser: StoredUserAccount = {
      id: `usr_google_${Date.now()}`,
      name: 'Google User',
      email: 'user.google@gmail.com',
      phone: '01711223344',
      passwordHash: 'google_oauth_auth',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      walletBalance: 0,
      referralCode: generateReferralCode('Google User'),
      createdAt: new Date().toISOString(),
    };
    users.unshift(newUser);
    try {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
    } catch (e) {}
    googleUser = newUser;
  }

  const profile: UserProfile = {
    id: googleUser.id,
    name: googleUser.name,
    email: googleUser.email,
    phone: googleUser.phone,
    avatar: googleUser.avatar,
    walletBalance: googleUser.walletBalance ?? 0,
    referralCode: googleUser.referralCode,
    createdAt: googleUser.createdAt,
  };

  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
  } catch (e) {}

  return { success: true, message: 'Google দিয়ে সফলভাবে সাইন ইন করা হয়েছে!', user: profile };
};

export const saveGoogleUser = (googleProfile: UserProfile): UserProfile => {
  const users = getRegisteredUsers();
  let existing = users.find((u) => u.email.toLowerCase() === googleProfile.email.toLowerCase());

  if (!existing) {
    const newUser: StoredUserAccount = {
      ...googleProfile,
      passwordHash: 'google_oauth_authenticated',
    };
    users.unshift(newUser);
    try {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
    } catch (e) {}
    existing = newUser;
  }

  const profile: UserProfile = {
    id: existing.id,
    name: googleProfile.name || existing.name,
    email: existing.email,
    phone: existing.phone,
    avatar: googleProfile.avatar || existing.avatar,
    walletBalance: existing.walletBalance ?? 0,
    referralCode: existing.referralCode,
    createdAt: existing.createdAt,
  };

  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
  } catch (e) {}

  return profile;
};

export const registerUser = (
  name: string,
  email: string,
  phone: string,
  password: string,
  referredByCode?: string,
  avatar?: string
): { success: boolean; message: string; user?: UserProfile } => {
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = phone.trim();
  const cleanPass = password.trim();

  if (!cleanName || cleanName.length < 3) {
    return { success: false, message: 'অনুগ্রহ করে আপনার সম্পূর্ণ নাম (কমপক্ষে ৩ অক্ষর) দিন।' };
  }

  // Bangladesh Mobile Number check (11 digits e.g. 01XXXXXXXXX)
  const phoneDigits = cleanPhone.replace(/[^0-9]/g, '');
  if (phoneDigits.length !== 11 || !phoneDigits.startsWith('01')) {
    return { success: false, message: 'অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।' };
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    return { success: false, message: 'অনুগ্রহ করে সঠিক ইমেইল এড্রেস প্রদান করুন।' };
  }

  // Password validation (at least 6 characters)
  if (!cleanPass || cleanPass.length < 6) {
    return { success: false, message: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' };
  }

  const users = getRegisteredUsers();

  // Check if phone or email already registered
  const existingPhone = users.find(
    (u) => u.phone.replace(/[^0-9]/g, '') === phoneDigits
  );
  if (existingPhone) {
    return { success: false, message: 'এই মোবাইল নম্বরে ইতিমধ্যে একটি একাউন্ট রয়েছে। অনুগ্রহ করে লগইন করুন।' };
  }

  const existingEmail = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existingEmail) {
    return { success: false, message: 'এই ইমেইল এড্রেসে ইতিমধ্যে একটি একাউন্ট রয়েছে। অনুগ্রহ করে লগইন করুন।' };
  }

  const referralCode = generateReferralCode(cleanName);

  const newUser: StoredUserAccount = {
    id: `usr_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
    name: cleanName,
    email: cleanEmail,
    phone: phoneDigits,
    passwordHash: cleanPass,
    avatar: avatar?.trim() || undefined,
    walletBalance: 0,
    referralCode,
    referredBy: referredByCode?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };

  const updatedUsers = [...users, newUser];
  try {
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updatedUsers));
  } catch (e) {}

  const profile: UserProfile = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    phone: newUser.phone,
    avatar: newUser.avatar,
    walletBalance: newUser.walletBalance,
    referralCode: newUser.referralCode,
    referredBy: newUser.referredBy,
    createdAt: newUser.createdAt,
  };

  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
  } catch (e) {}

  return { success: true, message: 'অভিনন্দন! আপনার একাউন্ট সফলভাবে তৈরি হয়েছে।', user: profile };
};

export const logoutUser = (): void => {
  try {
    localStorage.removeItem(CURRENT_USER_KEY);
  } catch (e) {}
};

export const updateUserProfile = (
  userId: string,
  updatedData: Partial<UserProfile>
): { success: boolean; user?: UserProfile; message: string } => {
  try {
    const users = getRegisteredUsers();
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return { success: false, message: 'ব্যবহারকারী পাওয়া যায়নি।' };
    }

    const current = users[userIndex];
    const updatedUser: StoredUserAccount = {
      ...current,
      ...updatedData,
    };

    users[userIndex] = updatedUser;
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));

    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      const newProfile: UserProfile = {
        ...currentUser,
        ...updatedData,
      };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newProfile));
      return { success: true, user: newProfile, message: 'প্রোফাইল সফলভাবে আপডেট হয়েছে!' };
    }

    return { success: true, message: 'প্রোফাইল আপডেট হয়েছে!' };
  } catch (e) {
    return { success: false, message: 'প্রোফাইল আপডেট ব্যর্থ হয়েছে।' };
  }
};

export const updateUserAvatar = (userId: string, avatarUrl: string): boolean => {
  try {
    const cur = getCurrentUser();
    if (cur) {
      cur.avatar = avatarUrl;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(cur));
    }
    const users = getRegisteredUsers();
    const idx = users.findIndex((u) => u.id === userId || (cur?.email && u.email === cur.email));
    if (idx !== -1) {
      users[idx].avatar = avatarUrl;
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
    }
    window.dispatchEvent(new Event('dsp_user_updated'));
    return true;
  } catch (e) {
    return false;
  }
};

export const topUpWallet = (
  userId: string,
  amount: number,
  method: string,
  trxId: string
): { success: boolean; newBalance: number; message: string } => {
  try {
    const users = getRegisteredUsers();
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return { success: false, newBalance: 0, message: 'ব্যবহারকারী পাওয়া যায়নি।' };
    }

    const currentBalance = users[userIndex].walletBalance || 0;
    const newBalance = currentBalance + amount;
    users[userIndex].walletBalance = newBalance;
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));

    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      currentUser.walletBalance = newBalance;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    }

    // Save transaction
    const newTx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      userId,
      type: 'credit',
      amount,
      method,
      trxId,
      description: `Wallet Top-Up via ${method.toUpperCase()}`,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    try {
      const rawTx = localStorage.getItem(WALLET_HISTORY_KEY);
      const list: WalletTransaction[] = rawTx ? JSON.parse(rawTx) : [];
      localStorage.setItem(WALLET_HISTORY_KEY, JSON.stringify([newTx, ...list]));
    } catch {}

    return {
      success: true,
      newBalance,
      message: `৳${amount} ওয়ালেটে সফলভাবে যোগ করা হয়েছে! বর্তমান ব্যালেন্স ৳${newBalance}।`,
    };
  } catch (e) {
    return { success: false, newBalance: 0, message: 'টপ-আপ সম্পন্ন হতে পারেনি।' };
  }
};

export const getWalletTransactions = (userId: string): WalletTransaction[] => {
  try {
    const raw = localStorage.getItem(WALLET_HISTORY_KEY);
    if (!raw) return [];
    const list: WalletTransaction[] = JSON.parse(raw);
    return list.filter((t) => t.userId === userId);
  } catch {
    return [];
  }
};

export const bindUserReferrer = (
  userId: string,
  referrerCode: string
): { success: boolean; message: string } => {
  const cleanCode = referrerCode.trim().toUpperCase();
  if (!cleanCode) return { success: false, message: 'অনুগ্রহ করে রেফারেল কোড দিন।' };

  const users = getRegisteredUsers();
  const currentUserIndex = users.findIndex((u) => u.id === userId);
  if (currentUserIndex === -1) return { success: false, message: 'ব্যবহারকারী পাওয়া যায়নি।' };

  if (users[currentUserIndex].referralCode === cleanCode) {
    return { success: false, message: 'আপনি নিজের রেফারেল কোড ব্যবহার করতে পারবেন না।' };
  }

  if (users[currentUserIndex].referredBy) {
    return { success: false, message: 'আপনি ইতিমধ্যে একজন রেফারারের সাথে যুক্ত আছেন।' };
  }

  const referrer = users.find((u) => u.referralCode?.toUpperCase() === cleanCode);
  if (!referrer) {
    return { success: false, message: 'অবৈধ রেফারেল কোড! অনুগ্রহ করে সঠিক কোড দিন।' };
  }

  users[currentUserIndex].referredBy = cleanCode;
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));

  const cur = getCurrentUser();
  if (cur && cur.id === userId) {
    cur.referredBy = cleanCode;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(cur));
  }

  return { success: true, message: `রেফারার (${referrer.name}) সফলভাবে যুক্ত হয়েছে!` };
};

export const saveOrderToHistory = (order: OrderDetails): void => {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    const orders: OrderDetails[] = raw ? JSON.parse(raw) : [];

    // Ensure status is set
    const orderToSave: OrderDetails = {
      ...order,
      status: order.status || 'delivered', // Digital delivery is fast / completed
      licenseKey: order.licenseKey || `DSP-KEY-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    };

    const updated = [orderToSave, ...orders];
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));

    // Global event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('dsp_order_placed', { detail: orderToSave }));
    }
  } catch (e) {}
};

export interface RealPurchaseNotification {
  id: string;
  customerName: string;
  productName: string;
  createdAt: string;
}

export const getRealPurchaseNotifications = (): RealPurchaseNotification[] => {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) return [];
    const orders: OrderDetails[] = JSON.parse(raw);
    if (!Array.isArray(orders)) return [];

    return orders
      .filter((ord) => ord && ord.items && ord.items.length > 0)
      .map((ord) => {
        const firstItem = ord.items[0];
        const productName = firstItem?.selectedVariation
          ? `${firstItem.product.name} (${firstItem.selectedVariation.name})`
          : firstItem?.product?.name || 'Digital Product';

        const rawName = (ord.customerName || 'Customer').trim();
        const parts = rawName.split(/\s+/);
        const customerName =
          parts.length > 1
            ? `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`
            : parts[0] || 'Customer';

        return {
          id: ord.orderId,
          customerName,
          productName,
          createdAt: ord.createdAt || new Date().toISOString(),
        };
      });
  } catch (e) {
    return [];
  }
};

export const formatRelativeTime = (isoString: string): string => {
  try {
    const time = new Date(isoString).getTime();
    if (isNaN(time)) return 'Just now';
    const now = Date.now();
    const diffInSeconds = Math.max(0, Math.floor((now - time) / 1000));

    if (diffInSeconds < 60) return 'Just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d ago`;
    return `${Math.floor(diffInDays / 30)}mo ago`;
  } catch (e) {
    return 'Recently';
  }
};

export const getUserOrders = (user?: UserProfile | null): OrderDetails[] => {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) return [];
    const allOrders: OrderDetails[] = JSON.parse(raw);
    if (!user) return allOrders;
    return allOrders.filter(
      (ord) =>
        (ord.userId && ord.userId === user.id) ||
        (ord.email && ord.email.toLowerCase() === user.email.toLowerCase()) ||
        (ord.phone && ord.phone.replace(/[^0-9]/g, '') === user.phone.replace(/[^0-9]/g, ''))
    );
  } catch (e) {
    return [];
  }
};
