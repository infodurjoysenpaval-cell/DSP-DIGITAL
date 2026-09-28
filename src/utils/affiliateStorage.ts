import { AffiliateApplication, AffiliatePayoutRequest, UserProfile } from '../types';
import {
  syncAffiliateToFirestore,
  updateAffiliateStatusInFirestore,
  deleteAffiliateFromFirestore,
  fetchAffiliatesFromFirestore,
  syncUserToFirestore,
} from './firebase';

const AFFILIATE_STORAGE_KEY = 'dsp_affiliate_applications';
const ACTIVE_REFERRAL_CODE_KEY = 'dsp_active_referral_code';

const DEFAULT_APPLICATIONS: AffiliateApplication[] = [];

export async function syncAffiliatesFromServer(): Promise<AffiliateApplication[]> {
  try {
    if (typeof window !== 'undefined') {
      const mergedMap = new Map<string, AffiliateApplication>();

      // 1. Existing local storage applications (filter out any mock test data)
      try {
        const raw = localStorage.getItem(AFFILIATE_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            parsed.forEach((a: AffiliateApplication) => {
              if (a && a.id && a.id !== 'AFF-2026-001' && a.id !== 'AFF-2026-002' && a.id !== 'AFF-2026-003') {
                mergedMap.set(a.id, a);
              }
            });
          }
        }
      } catch {}

      // 2. Fetch from Firestore (Authoritative cloud store)
      try {
        const firestoreAffs = await fetchAffiliatesFromFirestore();
        if (Array.isArray(firestoreAffs)) {
          firestoreAffs.forEach((a: AffiliateApplication) => {
            if (a && a.id && a.id !== 'AFF-2026-001' && a.id !== 'AFF-2026-002' && a.id !== 'AFF-2026-003') {
              mergedMap.set(a.id, { ...mergedMap.get(a.id), ...a });
            }
          });
        }
      } catch (err) {
        console.warn('Firestore affiliates fetch notice:', err);
      }

      // 3. Fetch from Server API
      try {
        const res = await fetch('/api/affiliates');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.affiliates)) {
            data.affiliates.forEach((a: AffiliateApplication) => {
              if (a && a.id && a.id !== 'AFF-2026-001' && a.id !== 'AFF-2026-002' && a.id !== 'AFF-2026-003') {
                mergedMap.set(a.id, { ...mergedMap.get(a.id), ...a });
              }
            });
          }
        }
      } catch (err) {
        console.warn('Server affiliates fetch notice:', err);
      }

      const mergedList = Array.from(mergedMap.values());
      try {
        localStorage.setItem(AFFILIATE_STORAGE_KEY, JSON.stringify(mergedList));
      } catch {}
      window.dispatchEvent(new CustomEvent('dsp_affiliate_updated'));
      return mergedList;
    }
  } catch (e) {
    console.error('syncAffiliatesFromServer error:', e);
  }
  return getAffiliateApplications();
}

export function getAffiliateApplications(): AffiliateApplication[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(AFFILIATE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Filter out stale mock test entries
      return parsed.filter(
        (a) => a && a.id && a.id !== 'AFF-2026-001' && a.id !== 'AFF-2026-002' && a.id !== 'AFF-2026-003'
      );
    }
    return [];
  } catch (e) {
    return [];
  }
}

export function saveAffiliateApplication(
  app: Omit<AffiliateApplication, 'id' | 'submittedAt' | 'status'> & {
    id?: string;
    status?: 'pending' | 'approved' | 'rejected' | 'restricted';
  }
): AffiliateApplication {
  const all = getAffiliateApplications();
  const generatedCode =
    app.referralCode ||
    (app.fullName
      ? app.fullName.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase() +
        Math.floor(10 + Math.random() * 90)
      : 'REF' + Math.floor(1000 + Math.random() * 9000));

  const newApp: AffiliateApplication = {
    id: app.id || `AFF-${Date.now().toString().slice(-6)}`,
    status: app.status || 'pending',
    submittedAt: new Date().toISOString(),
    referralCode: generatedCode,
    availableBalance: 0,
    totalEarned: 0,
    paidOut: 0,
    salesCount: 0,
    payoutRequests: [],
    ...app,
  };

  // Check if exists for this email or user
  const existingIdx = all.findIndex(
    (a) =>
      (app.id && a.id === app.id) ||
      (app.email && a.email.toLowerCase() === app.email.toLowerCase()) ||
      (app.userId && a.userId === app.userId)
  );

  if (existingIdx >= 0) {
    all[existingIdx] = {
      ...all[existingIdx],
      ...newApp,
      id: all[existingIdx].id,
      availableBalance: all[existingIdx].availableBalance ?? 0,
      totalEarned: all[existingIdx].totalEarned ?? 0,
      paidOut: all[existingIdx].paidOut ?? 0,
      salesCount: all[existingIdx].salesCount ?? 0,
      referralCode: all[existingIdx].referralCode || generatedCode,
    };
  } else {
    all.unshift(newApp);
  }

  // 1. Safe local storage write
  try {
    localStorage.setItem(AFFILIATE_STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    console.warn('LocalStorage save notice for affiliate:', e);
  }

  try {
    window.dispatchEvent(new CustomEvent('dsp_affiliate_updated'));
  } catch {}

  // 2. Authoritative Firestore Sync (CRITICAL: ALWAYS CALLED)
  syncAffiliateToFirestore(newApp)
    .then((success) => {
      if (success) {
        console.log('[Firestore] Affiliate application saved successfully:', newApp.id);
      }
    })
    .catch((err) => {
      console.warn('[Firestore] Affiliate sync notice:', err);
    });

  // 3. Post to backend server endpoint for cross-browser persistence
  if (typeof window !== 'undefined') {
    fetch('/api/affiliates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newApp),
    }).catch(() => {});

    try {
      const bc = new BroadcastChannel('dsp_affiliate_channel');
      bc.postMessage({ type: 'AFFILIATE_SAVED', app: newApp });
      bc.close();
    } catch {}
  }

  return newApp;
}

export function updateAffiliateStatus(
  id: string,
  status: 'approved' | 'restricted' | 'rejected' | 'pending',
  notes?: string
): void {
  const all = getAffiliateApplications();
  const index = all.findIndex((a) => a.id === id);
  if (index >= 0) {
    all[index].status = status;
    all[index].reviewedAt = new Date().toISOString();
    if (notes !== undefined) {
      all[index].notes = notes;
    }
    // If approving, make sure affiliate has referral code and stats initialized
    if (status === 'approved') {
      if (!all[index].referralCode) {
        all[index].referralCode =
          all[index].fullName.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase() +
          Math.floor(10 + Math.random() * 90);
      }
      if (all[index].availableBalance === undefined) {
        all[index].availableBalance = 10;
        all[index].totalEarned = 10;
        all[index].salesCount = 1;
      }
    }

    try {
      localStorage.setItem(AFFILIATE_STORAGE_KEY, JSON.stringify(all));
      window.dispatchEvent(new CustomEvent('dsp_affiliate_updated'));

      // Update in Firestore for authoritative real-time cloud persistence
      updateAffiliateStatusInFirestore(id, status, notes, {
        referralCode: all[index].referralCode,
        userId: all[index].userId,
        email: all[index].email,
        fullName: all[index].fullName,
        phone: all[index].contactNumber,
      }).catch((e) => {
        console.warn('Notice updating affiliate in Firestore:', e);
      });

      // Sync status to server
      if (typeof window !== 'undefined') {
        fetch(`/api/affiliates/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status,
            notes,
            referralCode: all[index].referralCode,
            userId: all[index].userId,
            email: all[index].email,
            fullName: all[index].fullName,
            phone: all[index].contactNumber,
          }),
        }).catch(() => {});

        try {
          const bc = new BroadcastChannel('dsp_affiliate_channel');
          bc.postMessage({ type: 'AFFILIATE_STATUS_UPDATED', id, status });
          bc.close();
        } catch {}
      }

      // Also update local cached application for this user
      if (all[index].userId) {
        try {
          const appRaw = localStorage.getItem(`dsp_affiliate_app_${all[index].userId}`);
          if (appRaw) {
            const parsedApp = JSON.parse(appRaw);
            parsedApp.status = status;
            if (all[index].referralCode) parsedApp.referralCode = all[index].referralCode;
            localStorage.setItem(`dsp_affiliate_app_${all[index].userId}`, JSON.stringify(parsedApp));
          }
        } catch {}
      }

      // Also sync user in registered users
      const regUsersRaw = localStorage.getItem('dsp_registered_users');
      if (regUsersRaw) {
        const users = JSON.parse(regUsersRaw);
        const uIdx = users.findIndex(
          (u: any) =>
            u.id === all[index].userId ||
            (all[index].email && u.email?.toLowerCase() === all[index].email?.toLowerCase()) ||
            (all[index].contactNumber && u.phone && u.phone.replace(/[^0-9]/g, '') === all[index].contactNumber.replace(/[^0-9]/g, ''))
        );
        if (uIdx >= 0) {
          users[uIdx].affiliateStatus = status;
          users[uIdx].isAffiliate = status === 'approved';
          if (all[index].referralCode) {
            users[uIdx].referralCode = all[index].referralCode;
          }
          localStorage.setItem('dsp_registered_users', JSON.stringify(users));
          window.dispatchEvent(new CustomEvent('dsp_users_changed'));
        }
      }

      // Also sync current active user if matches
      const currentRaw = localStorage.getItem('dsp_current_user');
      if (currentRaw) {
        const cur = JSON.parse(currentRaw);
        if (
          cur.id === all[index].userId ||
          (all[index].email && cur.email?.toLowerCase() === all[index].email?.toLowerCase()) ||
          (all[index].contactNumber && cur.phone && cur.phone.replace(/[^0-9]/g, '') === all[index].contactNumber.replace(/[^0-9]/g, ''))
        ) {
          cur.affiliateStatus = status;
          cur.isAffiliate = status === 'approved';
          if (all[index].referralCode) {
            cur.referralCode = all[index].referralCode;
          }
          localStorage.setItem('dsp_current_user', JSON.stringify(cur));
          window.dispatchEvent(new CustomEvent('dsp_user_updated', { detail: cur }));
          window.dispatchEvent(new CustomEvent('dsp_affiliate_updated'));
        }
      }
    } catch (e) {
      console.error('Failed to update affiliate status', e);
    }
  }
}

export function deleteAffiliateApplication(id: string): void {
  const target = getAffiliateApplications().find((a) => a.id === id);
  const all = getAffiliateApplications().filter((a) => a.id !== id);
  try {
    localStorage.setItem(AFFILIATE_STORAGE_KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent('dsp_affiliate_updated'));

    // Wipe from Firestore permanently
    deleteAffiliateFromFirestore(id).catch(() => {});

    // Server wipe
    if (typeof window !== 'undefined') {
      fetch(`/api/affiliates/${id}`, { method: 'DELETE' }).catch(() => {});

      try {
        const bc = new BroadcastChannel('dsp_affiliate_channel');
        bc.postMessage({ type: 'AFFILIATE_DELETED', id });
        bc.close();
      } catch {}
    }

    // Reset user status if linked
    if (target) {
      const regUsersRaw = localStorage.getItem('dsp_registered_users');
      if (regUsersRaw) {
        const users = JSON.parse(regUsersRaw);
        const uIdx = users.findIndex(
          (u: any) =>
            u.id === target.userId ||
            (target.email && u.email?.toLowerCase() === target.email?.toLowerCase())
        );
        if (uIdx >= 0) {
          delete users[uIdx].affiliateStatus;
          users[uIdx].isAffiliate = false;
          localStorage.setItem('dsp_registered_users', JSON.stringify(users));
        }
      }

      const currentRaw = localStorage.getItem('dsp_current_user');
      if (currentRaw) {
        const cur = JSON.parse(currentRaw);
        if (
          cur.id === target.userId ||
          (target.email && cur.email?.toLowerCase() === target.email?.toLowerCase())
        ) {
          delete cur.affiliateStatus;
          cur.isAffiliate = false;
          localStorage.setItem('dsp_current_user', JSON.stringify(cur));
          window.dispatchEvent(new CustomEvent('dsp_user_updated', { detail: cur }));
        }
      }
    }
  } catch (e) {
    console.error('Failed to delete affiliate application', e);
  }
}

/**
 * Checks whether the current user is an approved affiliate
 */
export function isApprovedAffiliate(user?: UserProfile | null): boolean {
  if (!user) return false;
  if (user.isAffiliate === true || user.affiliateStatus === 'approved') return true;
  const all = getAffiliateApplications();
  const cleanPhone = user.phone ? user.phone.replace(/[^0-9]/g, '') : '';
  const match = all.find(
    (a) =>
      (a.userId && a.userId === user.id) ||
      (a.email && user.email && a.email.toLowerCase() === user.email.toLowerCase()) ||
      (cleanPhone && a.contactNumber && a.contactNumber.replace(/[^0-9]/g, '') === cleanPhone)
  );
  return match?.status === 'approved';
}

/**
 * Get the affiliate application object for the given user
 */
export function getAffiliateForUser(user?: UserProfile | null): AffiliateApplication | null {
  if (!user) return null;
  const all = getAffiliateApplications();
  const cleanPhone = user.phone ? user.phone.replace(/[^0-9]/g, '') : '';
  const match = all.find(
    (a) =>
      (a.userId && a.userId === user.id) ||
      (a.email && user.email && a.email.toLowerCase() === user.email.toLowerCase()) ||
      (cleanPhone && a.contactNumber && a.contactNumber.replace(/[^0-9]/g, '') === cleanPhone)
  );
  return match || null;
}

/**
 * Get active referral code from URL or storage
 */
export function getActiveReferralCode(): string | null {
  try {
    // Check URL first if available
    if (typeof window !== 'undefined' && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref') || params.get('aff');
      if (ref) {
        const clean = ref.trim().toUpperCase();
        localStorage.setItem(ACTIVE_REFERRAL_CODE_KEY, clean);
        return clean;
      }
    }
    return localStorage.getItem(ACTIVE_REFERRAL_CODE_KEY);
  } catch (e) {
    return null;
  }
}

export function setActiveReferralCode(code: string): void {
  try {
    localStorage.setItem(ACTIVE_REFERRAL_CODE_KEY, code.trim().toUpperCase());
  } catch (e) {}
}

export function clearActiveReferralCode(): void {
  try {
    localStorage.removeItem(ACTIVE_REFERRAL_CODE_KEY);
  } catch (e) {}
}

/**
 * Credit commission (15% product discount value or referral bonus) to the referring affiliate
 * when a customer orders via their referral link
 */
export function creditAffiliateCommission(
  referralCode: string,
  amount: number = 20,
  orderId?: string,
  itemsSummary?: string,
  totalAmount?: number
): boolean {
  if (!referralCode) return false;
  const cleanCode = referralCode.trim().toUpperCase();
  const all = getAffiliateApplications();

  // Find approved affiliate with this referral code
  const index = all.findIndex(
    (a) =>
      a.referralCode?.toUpperCase() === cleanCode &&
      a.status === 'approved' // Restricted or rejected affiliates do NOT earn commissions
  );

  const saleRecord = {
    id: `sale_${Date.now()}`,
    orderId: orderId || `ORD-${Date.now().toString().slice(-6)}`,
    itemsSummary: itemsSummary || 'Product Purchase via Referral Link',
    totalAmount: totalAmount || Math.round(amount / 0.15),
    commission: amount,
    date: new Date().toISOString(),
  };

  if (index >= 0) {
    const prevBal = all[index].availableBalance ?? 0;
    const prevEarned = all[index].totalEarned ?? 0;
    const prevSales = all[index].salesCount ?? 0;

    all[index].availableBalance = prevBal + amount;
    all[index].totalEarned = prevEarned + amount;
    all[index].salesCount = prevSales + 1;
    all[index].referralSales = [saleRecord, ...(all[index].referralSales || [])];

    try {
      localStorage.setItem(AFFILIATE_STORAGE_KEY, JSON.stringify(all));
      window.dispatchEvent(new CustomEvent('dsp_affiliate_updated'));
      return true;
    } catch (e) {
      console.error('Failed to credit affiliate balance', e);
      return false;
    }
  }

  // Also check if any registered user has this referral code
  try {
    const regUsersRaw = localStorage.getItem('dsp_registered_users');
    if (regUsersRaw) {
      const users = JSON.parse(regUsersRaw);
      const uIdx = users.findIndex(
        (u: any) => u.referralCode?.toUpperCase() === cleanCode && u.affiliateStatus !== 'restricted'
      );
      if (uIdx >= 0) {
        users[uIdx].walletBalance = (users[uIdx].walletBalance || 0) + amount;
        localStorage.setItem('dsp_registered_users', JSON.stringify(users));

        // Create an affiliate application entry if missing
        saveAffiliateApplication({
          userId: users[uIdx].id,
          fullName: users[uIdx].name,
          contactNumber: users[uIdx].phone || '01XXXXXXXXX',
          email: users[uIdx].email,
          payoutMethod: 'bKash',
          accountNumber: users[uIdx].phone || '',
          status: 'approved',
          referralCode: cleanCode,
          availableBalance: amount,
          totalEarned: amount,
          salesCount: 1,
        });

        window.dispatchEvent(new CustomEvent('dsp_affiliate_updated'));
        return true;
      }
    }
  } catch (e) {}

  return false;
}

/**
 * Affiliate requests a payout
 */
export function requestAffiliatePayout(
  affiliateId: string,
  amount: number,
  method: string,
  account: string
): { success: boolean; message: string } {
  if (amount < 100) {
    return { success: false, message: 'Minimum payout amount is ৳100.' };
  }

  const all = getAffiliateApplications();
  const index = all.findIndex((a) => a.id === affiliateId);
  if (index === -1) {
    return { success: false, message: 'Affiliate account not found.' };
  }

  const currentBal = all[index].availableBalance ?? 0;
  if (currentBal < amount) {
    return { success: false, message: `Insufficient balance. Available: ৳${currentBal}` };
  }

  all[index].availableBalance = currentBal - amount;
  all[index].paidOut = (all[index].paidOut ?? 0) + amount;

  const newRequest: AffiliatePayoutRequest = {
    id: `PAY-${Date.now().toString().slice(-6)}`,
    affiliateId,
    amount,
    payoutMethod: method || all[index].payoutMethod || 'bKash',
    accountNumber: account || all[index].accountNumber,
    requestedAt: new Date().toISOString(),
    status: 'pending',
  };

  all[index].payoutRequests = [newRequest, ...(all[index].payoutRequests || [])];

  try {
    localStorage.setItem(AFFILIATE_STORAGE_KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent('dsp_affiliate_updated'));
    return {
      success: true,
      message: `Payout request for ৳${amount} to ${newRequest.payoutMethod} submitted successfully!`,
    };
  } catch (e) {
    return { success: false, message: 'Failed to process payout request.' };
  }
}
