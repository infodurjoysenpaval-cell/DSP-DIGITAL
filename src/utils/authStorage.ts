import { UserProfile, OrderDetails } from '../types';

const CURRENT_USER_KEY = 'dsp_current_user';
const REGISTERED_USERS_KEY = 'dsp_registered_users';
const ORDERS_STORAGE_KEY = 'dsp_customer_orders';

export interface StoredUserAccount extends UserProfile {
  passwordHash: string;
}

// Default pre-seeded demo user for instant one-click testing
const DEFAULT_DEMO_USER: StoredUserAccount = {
  id: 'usr_demo_101',
  name: 'Tanvir Ahmed',
  email: 'customer@dspdigitalmart.com',
  phone: '01712000000',
  passwordHash: '123456',
  createdAt: '2026-01-10T10:00:00.000Z',
};

export const getRegisteredUsers = (): StoredUserAccount[] => {
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    if (!raw) {
      const initial = [DEFAULT_DEMO_USER];
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    return [DEFAULT_DEMO_USER];
  }
};

export const getCurrentUser = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const loginUser = (identifier: string, password: string): { success: boolean; message: string; user?: UserProfile } => {
  const cleanId = identifier.trim().toLowerCase();
  const cleanPass = password.trim();

  if (!cleanId) {
    return { success: false, message: 'অনুগ্রহ করে আপনার ইমেইল অথবা মোবাইল নম্বর দিন।' };
  }
  if (!cleanPass) {
    return { success: false, message: 'অনুগ্রহ করে পাসওয়ার্ড দিন।' };
  }

  const users = getRegisteredUsers();
  const found = users.find(
    (u) =>
      u.email.toLowerCase() === cleanId ||
      u.phone.replace(/[^0-9]/g, '') === cleanId.replace(/[^0-9]/g, '')
  );

  if (!found) {
    return { success: false, message: 'এই ইমেইল বা নম্বরে কোনো একাউন্ট পাওয়া যায়নি। নতুন একাউন্ট তৈরি করুন।' };
  }

  if (found.passwordHash !== cleanPass) {
    return { success: false, message: 'ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিয়ে পুনরায় চেষ্টা করুন।' };
  }

  const profile: UserProfile = {
    id: found.id,
    name: found.name,
    email: found.email,
    phone: found.phone,
    avatar: found.avatar,
    createdAt: found.createdAt,
  };

  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
  } catch (e) {}

  return { success: true, message: 'লগইন সফল হয়েছে!', user: profile };
};

export const registerUser = (
  name: string,
  email: string,
  phone: string,
  password: string
): { success: boolean; message: string; user?: UserProfile } => {
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = phone.trim();
  const cleanPass = password.trim();

  if (!cleanName) return { success: false, message: 'অনুগ্রহ করে আপনার পুরো নাম প্রদান করুন।' };
  if (!cleanEmail || !cleanEmail.includes('@')) return { success: false, message: 'সঠিক ইমেইল ঠিকানা প্রদান করুন।' };
  if (!cleanPhone || cleanPhone.replace(/[^0-9]/g, '').length < 10) {
    return { success: false, message: 'সঠিক মোবাইল নম্বর প্রদান করুন।' };
  }
  if (!cleanPass || cleanPass.length < 4) {
    return { success: false, message: 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।' };
  }

  const users = getRegisteredUsers();
  const exists = users.find(
    (u) =>
      u.email.toLowerCase() === cleanEmail ||
      u.phone.replace(/[^0-9]/g, '') === cleanPhone.replace(/[^0-9]/g, '')
  );

  if (exists) {
    return { success: false, message: 'এই ইমেইল বা মোবাইল নম্বরে ইতিমধ্যে একাউন্ট রয়েছে। দয়া করে লগইন করুন।' };
  }

  const newUser: StoredUserAccount = {
    id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    name: cleanName,
    email: cleanEmail,
    phone: cleanPhone,
    passwordHash: cleanPass,
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
    createdAt: newUser.createdAt,
  };

  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
  } catch (e) {}

  return { success: true, message: 'একাউন্ট সফলভাবে তৈরি হয়েছে!', user: profile };
};

export const logoutUser = (): void => {
  try {
    localStorage.removeItem(CURRENT_USER_KEY);
  } catch (e) {}
};

export const saveOrderToHistory = (order: OrderDetails): void => {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    const orders: OrderDetails[] = raw ? JSON.parse(raw) : [];
    // prepend new order so latest is first
    const updated = [order, ...orders];
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));

    // Dispatch global event so UI components can immediately react to real purchases
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('dsp_order_placed', { detail: order }));
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

        // Privacy-safe customer name (e.g. "Tanvir Ahmed" -> "Tanvir A." or first name)
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
