import { AffiliateApplication } from '../types';

const AFFILIATE_STORAGE_KEY = 'dsp_affiliate_applications';

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
  },
  {
    id: 'AFF-2026-002',
    userId: 'usr-aff-102',
    fullName: 'Farhana Sultana',
    contactNumber: '01912345678',
    whatsappNumber: '01912345678',
    email: 'farhana.techbd@gmail.com',
    channelLink: 'https://youtube.com/@FarhanaTechReviews',
    payoutMethod: 'Nagad',
    accountNumber: '01912345678',
    nidNumber: '28471928374619',
    documentUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
    documentName: 'Trade_License_FarhanaTech.jpg',
    documentType: 'image/jpeg',
    documentSize: '2.1 MB',
    status: 'approved',
    submittedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    reviewedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    notes: 'Verified YouTube reviewer. 10% commission agreement activated.',
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
  }
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

export function saveAffiliateApplication(app: Omit<AffiliateApplication, 'id' | 'submittedAt' | 'status'> & { id?: string; status?: 'pending' | 'approved' | 'rejected' }): AffiliateApplication {
  const all = getAffiliateApplications();
  const newApp: AffiliateApplication = {
    id: app.id || `AFF-${Date.now().toString().slice(-6)}`,
    status: app.status || 'pending',
    submittedAt: new Date().toISOString(),
    ...app,
  };

  // Check if exists for this email or user
  const existingIdx = all.findIndex((a) => (app.id && a.id === app.id) || (app.email && a.email.toLowerCase() === app.email.toLowerCase()));
  if (existingIdx >= 0) {
    all[existingIdx] = { ...all[existingIdx], ...newApp };
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

export function updateAffiliateStatus(id: string, status: 'approved' | 'rejected' | 'pending', notes?: string): void {
  const all = getAffiliateApplications();
  const index = all.findIndex((a) => a.id === id);
  if (index >= 0) {
    all[index].status = status;
    all[index].reviewedAt = new Date().toISOString();
    if (notes !== undefined) {
      all[index].notes = notes;
    }
    try {
      localStorage.setItem(AFFILIATE_STORAGE_KEY, JSON.stringify(all));
      window.dispatchEvent(new CustomEvent('dsp_affiliate_updated'));
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
