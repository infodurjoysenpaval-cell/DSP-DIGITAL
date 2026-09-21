import { AffiliateApplication, AffiliatePayoutRequest, UserProfile } from '../types';

const AFFILIATE_STORAGE_KEY = 'dsp_affiliate_applications';
const ACTIVE_REFERRAL_CODE_KEY = 'dsp_active_referral_code';

const DEFAULT_APPLICATIONS: AffiliateApplication[] = [
  {
    id: 'AFF-2026-001',
    userId: 'usr-aff-101',
    fullName: 'Ariful Islam',
    contactNumber: '01719876543',
    whatsappNumber: '01719876543',
    email: 'ariful.digital@gmail.com',
    channelLink: 'https://facebook.com/arifulsoftwarehub',
    payoutMethod: 'bKash',
    accountNumber: '01719876543',
    nidNumber: '19954718293847',
    documentUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
    documentName: 'NID_Card_Front_Ariful.jpg',
    documentType: 'image/jpeg',
    documentSize: '1.4 MB',
    status: 'pending',
    submittedAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    notes: 'Facebook page has 18k tech followers. Strong prospective partner.',
    referralCode: 'ARIFUL26',
    availableBalance: 0,
    totalEarned: 0,
    paidOut: 0,
    salesCount: 0,
  },
  {
    id: 'AFF-2026-002',
    userId: 'usr-aff-102',
    fullName: 'Farhana Sultana',
    contactNumber: '01912345678',
    whatsappNumber: '01912345678',
    email: 'farhana.techbd@gmail.com',
    channelLink: 'https://youtube.com/@FarhanaTechReviews',
    payoutMethod: 'bKash',
    accountNumber: '01912345678',
    nidNumber: '28471928374619',
    documentUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
    documentName: 'Trade_License_FarhanaTech.jpg',
    documentType: 'image/jpeg',
    documentSize: '2.1 MB',
    status: 'approved',
    submittedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    reviewedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    notes: 'Verified YouTube reviewer. 15% discount and 20 Tk commission activated.',
    referralCode: 'SRZKJC',
    availableBalance: 10,
    totalEarned: 10,
    paidOut: 0,
    salesCount: 1,
  },
  {
    id: 'AFF-2026-003',
    userId: 'usr-aff-103',
    fullName: 'Tanvir Hossain',
    contactNumber: '01833445566',
    whatsappNumber: '01833445566',
    email: 'tanvir.freelance@outlook.com',
    channelLink: 'https://t.me/freelancers_bd_group',
    payoutMethod: 'Rocket',
    accountNumber: '018334455667',
    nidNumber: '39482716384920',
    documentUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    documentName: 'Student_ID_DU_Tanvir.png',
    documentType: 'image/png',
    documentSize: '950 KB',
    status: 'pending',
    submittedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    notes: 'Manages a Telegram channel for 5,000 university students.',
    referralCode: 'TANVIRDU',
    availableBalance: 0,
    totalEarned: 0,
    paidOut: 0,
    salesCount: 0,
  },
];

export function getAffiliateApplications(): AffiliateApplication[] {
  try {
    const raw = localStorage.getItem(AFFILIATE_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(AFFILIATE_STORAGE_KEY, JSON.stringify(DEFAULT_APPLICATIONS));
      return DEFAULT_APPLICATIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_APPLICATIONS;
  } catch (e) {
    console.error('Failed to get affiliate applications', e);
    return DEFAULT_APPLICATIONS;
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

  try {
    localStorage.setItem(AFFILIATE_STORAGE_KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent('dsp_affiliate_updated'));
  } catch (e) {
    console.error('Failed to save affiliate app', e);
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

      // Also sync user in registered users
      const regUsersRaw = localStorage.getItem('dsp_registered_users');
      if (regUsersRaw) {
        const users = JSON.parse(regUsersRaw);
        const uIdx = users.findIndex(
          (u: any) =>
            u.id === all[index].userId ||
            (all[index].email && u.email?.toLowerCase() === all[index].email?.toLowerCase())
        );
        if (uIdx >= 0) {
          users[uIdx].affiliateStatus = status;
          users[uIdx].isAffiliate = status === 'approved';
          if (all[index].referralCode) {
            users[uIdx].referralCode = all[index].referralCode;
          }
          localStorage.setItem('dsp_registered_users', JSON.stringify(users));
        }
      }

      // Also sync current active user if matches
      const currentRaw = localStorage.getItem('dsp_current_user');
      if (currentRaw) {
        const cur = JSON.parse(currentRaw);
        if (
          cur.id === all[index].userId ||
          (all[index].email && cur.email?.toLowerCase() === all[index].email?.toLowerCase())
        ) {
          cur.affiliateStatus = status;
          cur.isAffiliate = status === 'approved';
          if (all[index].referralCode) {
            cur.referralCode = all[index].referralCode;
          }
          localStorage.setItem('dsp_current_user', JSON.stringify(cur));
          window.dispatchEvent(new CustomEvent('dsp_user_updated', { detail: cur }));
        }
      }
    } catch (e) {
      console.error('Failed to update affiliate status', e);
    }
  }
}

export function deleteAffiliateApplication(id: string): void {
  const all = getAffiliateApplications().filter((a) => a.id !== id);
  try {
    localStorage.setItem(AFFILIATE_STORAGE_KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent('dsp_affiliate_updated'));
  } catch (e) {
    console.error('Failed to delete affiliate application', e);
  }
}

/**
 * Checks whether the current user is an approved affiliate
 */
export function isApprovedAffiliate(user?: UserProfile | null): boolean {
  if (!user) return false;
  if (user.affiliateStatus === 'approved') return true;
  const all = getAffiliateApplications();
  const match = all.find(
    (a) =>
      (a.userId && a.userId === user.id) ||
      (a.email && a.email.toLowerCase() === user.email.toLowerCase())
  );
  return match?.status === 'approved';
}

/**
 * Get the affiliate application object for the given user
 */
export function getAffiliateForUser(user?: UserProfile | null): AffiliateApplication | null {
  if (!user) return null;
  const all = getAffiliateApplications();
  const match = all.find(
    (a) =>
      (a.userId && a.userId === user.id) ||
      (a.email && a.email.toLowerCase() === user.email.toLowerCase())
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
