import { PolicyPage } from '../types';

const PAGES_STORAGE_KEY = 'dsp_custom_pages';

export const DEFAULT_PAGES: Record<string, PolicyPage> = {
  refund: {
    id: 'page-refund',
    key: 'refund',
    title: 'Return & Refund Policy',
    lastUpdated: '2026-09-20',
    summary: 'Our 100% replacement and money-back guarantee for digital licenses and software keys.',
    content: `At DSP DIGITAL MART, we are committed to delivering 100% genuine and fully functional digital products, software licenses, and subscription accounts.

Key Guarantee:
If any provided license key or login credential does not work upon delivery, our support team will replace it within 1–2 hours or issue a full refund.

Eligibility for Refund / Replacement:
• Any key or account that fails activation within the initial warranty period.
• Inability from our technical support team to resolve the activation error.
• Out-of-stock items where immediate delivery cannot be completed.

Refund Processing:
Refunds are processed directly to your original payment method (bKash, Nagad, Rocket, or Bank Transfer) within 24 to 48 hours without unnecessary deductions.`,
    highlights: [
      '100% genuine license guarantee',
      'Instant replacement within 1–2 hours if key invalid',
      'No hassle 24–48 hours refund via bKash/Nagad'
    ],
    isPublished: true,
  },
  privacy: {
    id: 'page-privacy',
    key: 'privacy',
    title: 'Privacy Policy',
    lastUpdated: '2026-09-20',
    summary: 'How we safeguard customer information, payment details, and digital communication.',
    content: `Your privacy and data security are our top priorities at DSP DIGITAL MART. We strictly safeguard all customer information collected during order placement and checkout.

What Information We Collect:
• Customer Name, Phone number, and Email address for digital license delivery.
• Transaction IDs for payment confirmation and receipt generation.

Information Security:
We never share, sell, rent, or disclose your personal contact or payment information to any third party. All records are securely stored and encrypted for order tracking, warranty service, and renewal alerts.

Your Rights:
You can request account deletion or data inspection at any time by contacting our support team via WhatsApp or Email.`,
    highlights: [
      'Zero third-party data sharing',
      'Encrypted transaction records',
      'Full privacy guarantee for customer accounts'
    ],
    isPublished: true,
  },
  terms: {
    id: 'page-terms',
    key: 'terms',
    title: 'Terms and Conditions',
    lastUpdated: '2026-09-20',
    summary: 'Standard service rules, usage limits, and warranty conditions for digital goods.',
    content: `Welcome to DSP DIGITAL MART. By placing an order on our platform, you agree to comply with our service terms:

Digital Product Delivery:
License keys and subscriptions are delivered electronically via WhatsApp, Email, or your user account dashboard instantly or within 10–30 minutes of payment verification.

Single / Multi-Device Rules:
License keys must only be activated on the allowed number of devices specified in the product description. Attempting to activate on more devices may invalidate the license warranty.

Warranty Period:
Full replacement warranty is valid throughout the advertised subscription duration provided account credentials are not modified without authorization.

Support:
Our team is available 24/7 to assist with remote setup, activation verification, and troubleshooting.`,
    highlights: [
      'Instant electronic delivery',
      'Device limits must be respected',
      'Lifetime or full advertised warranty support'
    ],
    isPublished: true,
  },
  about: {
    id: 'page-about',
    key: 'about',
    title: 'About Us',
    lastUpdated: '2026-09-20',
    summary: 'Bangladesh’s premier destination for genuine digital products and software licenses.',
    content: `DSP DIGITAL MART is Bangladesh's premier and trusted online destination for authentic software licenses, creative design tools, streaming passes, antivirus protection, and premium digital subscriptions.

Headquartered in Khulna, Bangladesh, our mission is to empower professionals, students, freelancers, and businesses with affordable, genuine digital solutions backed by lightning-fast delivery and reliable 24/7 customer service.

Our Core Values:
• Authenticity: Only genuine keys from authorized distributors.
• Affordability: Fair Bangladesh pricing payable via local bKash and Nagad.
• Speed: Automated and expedited order fulfillment within minutes.
• Reliability: Dedicated post-purchase support and free installation help.

Contact Information:
Location: Khulna, Bangladesh
Hotline / WhatsApp: +8801712792184
Email: dspdigitalmart@gmail.com`,
    highlights: [
      'Authentic software at affordable BD rates',
      'Fast automated delivery to WhatsApp and Email',
      'Dedicated helpline: +8801712792184'
    ],
    isPublished: true,
  },
  'why-shop': {
    id: 'page-why-shop',
    key: 'why-shop',
    title: 'Why Shop Online with Us',
    lastUpdated: '2026-09-20',
    summary: 'The DSP Digital Mart advantage: genuine licenses, instant delivery, and local support.',
    content: `Shopping with DSP DIGITAL MART guarantees authentic software, zero risk, and complete peace of mind:

100% Genuine Keys:
Directly sourced official license keys and verified accounts with official publisher activation.

Instant Delivery:
Delivered within minutes directly to your WhatsApp, Email, and Customer Dashboard.

Affordable BD Pricing:
Unbeatable rates tailored for Bangladesh with localized bKash, Nagad, and Rocket checkout.

24/7 Friendly Support:
Real human support ready to assist via WhatsApp, call, or remote AnyDesk assistance anytime.

Money-Back Guarantee:
If a key fails and our team cannot resolve it, you receive an immediate refund or replacement.`,
    highlights: [
      '100% Official Genuine Licenses',
      'Instant 5-Minute Delivery',
      'Localized bKash & Nagad payments',
      'AnyDesk Remote Setup Assistance'
    ],
    isPublished: true,
  },
  faq: {
    id: 'page-faq',
    key: 'faq',
    title: 'Frequently Asked Questions (FAQ)',
    lastUpdated: '2026-09-20',
    summary: 'Answers to the most common questions about ordering, delivery, and payments.',
    content: `Here are answers to the most common questions from our valued customers:

Q: How will I receive my digital product or license key?
A: Once your payment is verified, your license key or account credentials will be sent directly to your WhatsApp number and Email, and will also be available inside your DSP Digital Mart account dashboard.

Q: How long does delivery take?
A: Most orders are delivered within 5 to 30 minutes. For custom subscriptions or pre-orders, it may take up to 1–2 hours.

Q: Are these genuine official licenses?
A: Yes, absolutely! All software licenses (such as Windows, Office, Kaspersky, Canva, etc.) are 100% genuine and activate directly with official servers.

Q: What payment methods do you accept?
A: We accept bKash Personal, Nagad Personal, Rocket, and Bank Transfers.

Q: What should I do if a key fails to activate?
A: Simply message our WhatsApp hotline (+8801712792184) with a screenshot of the error. Our support team will verify and replace the key or provide remote setup assistance within minutes.`,
    highlights: [
      'Immediate delivery to WhatsApp and Email',
      'Replacement warranty for every valid order',
      'Dedicated helpline: +8801712792184'
    ],
    isPublished: true,
  },
  support: {
    id: 'page-support',
    key: 'support',
    title: 'After Sales Support',
    lastUpdated: '2026-09-20',
    summary: 'Comprehensive warranty, installation help, and ongoing customer assistance.',
    content: `Our relationship doesn't end when you complete your purchase! We provide lifetime customer guidance and full warranty backing for all our products:

Step-by-step Setup Guides:
Detailed video and screenshot tutorials to ensure quick and hassle-free software installation.

Remote Desk Assistance:
If you encounter activation or installation errors, our certified technical specialists can assist you remotely via AnyDesk or TeamViewer.

Warranty Renewal Notifications:
Friendly reminders before your subscription expires so your work and workflow are never interrupted.

Direct WhatsApp Helpline:
Call or chat with our live support team directly at +8801712792184 for real-time resolution.`,
    highlights: [
      'Free AnyDesk Remote Installation Support',
      'Fast response on WhatsApp: +8801712792184',
      'Full replacement warranty during active period'
    ],
    isPublished: true,
  },
  'payment-methods': {
    id: 'page-payment-methods',
    key: 'payment-methods',
    title: 'Online Payment Methods',
    lastUpdated: '2026-09-20',
    summary: 'Secure and localized payment options for customers in Bangladesh.',
    content: `We support the most convenient, secure, and widely used payment options in Bangladesh:

bKash Personal / Send Money:
Send payment to 01712792184 and provide the 10-character Transaction ID (TrxID) in checkout for instant verification.

Nagad Personal / Send Money:
Fast and reliable mobile banking to 01712792184 with zero hassle.

Rocket Personal / Send Money:
Dutch-Bangla Bank mobile banking to 01712792184 for quick payments.

Bank Transfer / Online Banking:
Available upon request for corporate clients and bulk orders. Contact us on WhatsApp for official account details.

Security Note:
Always ensure you send payment only to our official numbers listed on the website. We never ask for your PIN or OTP.`,
    highlights: [
      'bKash: 01712792184',
      'Nagad: 01712792184',
      'Rocket: 01712792184',
      'Bank Transfer upon request'
    ],
    isPublished: true,
  },
};

export function getAllPages(): Record<string, PolicyPage> {
  try {
    const raw = localStorage.getItem(PAGES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PAGES_STORAGE_KEY, JSON.stringify(DEFAULT_PAGES));
      return DEFAULT_PAGES;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PAGES, ...parsed };
  } catch (e) {
    console.error('Failed to load custom pages', e);
    return DEFAULT_PAGES;
  }
}

export function getPage(key: string): PolicyPage {
  const all = getAllPages();
  return all[key] || DEFAULT_PAGES[key] || {
    id: `page-${key}`,
    key,
    title: key.replace('-', ' ').toUpperCase(),
    lastUpdated: new Date().toISOString().split('T')[0],
    content: 'Content not yet defined.',
    isPublished: true,
  };
}

export function savePage(page: PolicyPage): void {
  const all = getAllPages();
  all[page.key] = {
    ...page,
    lastUpdated: new Date().toISOString().split('T')[0],
  };
  try {
    localStorage.setItem(PAGES_STORAGE_KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent('dsp_pages_updated', { detail: { key: page.key } }));
  } catch (e) {
    console.error('Failed to save page', e);
  }
}

export function resetPageToDefault(key: string): PolicyPage {
  const defaultPage = DEFAULT_PAGES[key];
  if (!defaultPage) return getPage(key);

  const all = getAllPages();
  all[key] = { ...defaultPage };
  try {
    localStorage.setItem(PAGES_STORAGE_KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent('dsp_pages_updated', { detail: { key } }));
  } catch (e) {
    console.error('Failed to reset page', e);
  }
  return defaultPage;
}
