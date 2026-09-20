import { IncompleteOrder, CartItem } from '../types';
import { PRODUCTS } from '../data/storeData';

const INCOMPLETE_STORAGE_KEY = 'dsp_incomplete_orders';

const DEFAULT_INCOMPLETE_ORDERS: IncompleteOrder[] = [
  {
    id: 'INC-98214',
    customerName: 'Shakil Ahmed',
    phone: '01715894321',
    email: 'shakil.ahmed@gmail.com',
    items: [
      {
        product: PRODUCTS[0], // Windows 11 Pro
        quantity: 1,
      },
      {
        product: PRODUCTS[1], // Microsoft 365
        quantity: 1,
      }
    ],
    totalAmount: (PRODUCTS[0].salePrice || 999) + (PRODUCTS[1].salePrice || 1499),
    paymentMethod: 'bkash',
    notes: 'Stopped at bKash TrxID verification step',
    stage: 'payment_pending',
    lastActiveAt: new Date(Date.now() - 3600000 * 2.5).toISOString(),
    status: 'abandoned',
    notesAdmin: 'Called once, customer said bKash balance was low, promised to buy in evening.',
  },
  {
    id: 'INC-98215',
    customerName: 'Mehedi Hasan',
    phone: '01824719283',
    email: 'mehedi.developer@yahoo.com',
    items: [
      {
        product: PRODUCTS[2] || PRODUCTS[0], // Canva Pro / Product
        quantity: 2,
      }
    ],
    totalAmount: ((PRODUCTS[2] || PRODUCTS[0]).salePrice || 499) * 2,
    paymentMethod: 'nagad',
    notes: 'Entered phone and selected Nagad, but modal was closed',
    stage: 'checkout_entered',
    lastActiveAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    status: 'abandoned',
  },
  {
    id: 'INC-98216',
    customerName: 'Sadia Rahman',
    phone: '01955112233',
    email: 'sadia.art@gmail.com',
    items: [
      {
        product: PRODUCTS[3] || PRODUCTS[0],
        quantity: 1,
      }
    ],
    totalAmount: (PRODUCTS[3] || PRODUCTS[0]).salePrice || 1200,
    stage: 'cart_abandoned',
    lastActiveAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    status: 'contacted',
    notesAdmin: 'Sent WhatsApp 10% off discount voucher to recover order.',
  }
];

export function getIncompleteOrders(): IncompleteOrder[] {
  try {
    const raw = localStorage.getItem(INCOMPLETE_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(INCOMPLETE_STORAGE_KEY, JSON.stringify(DEFAULT_INCOMPLETE_ORDERS));
      return DEFAULT_INCOMPLETE_ORDERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_INCOMPLETE_ORDERS;
  } catch (e) {
    console.error('Failed to get incomplete orders', e);
    return DEFAULT_INCOMPLETE_ORDERS;
  }
}

export function saveIncompleteOrderDraft(orderData: {
  customerName?: string;
  phone?: string;
  email?: string;
  items: CartItem[];
  totalAmount: number;
  paymentMethod?: string;
  notes?: string;
  userId?: string;
  stage?: 'cart_abandoned' | 'checkout_entered' | 'payment_pending';
}): IncompleteOrder | null {
  // Only save if there are items and either phone or name or at least 1 item
  if (!orderData.items || orderData.items.length === 0) return null;

  const all = getIncompleteOrders();
  const phoneClean = (orderData.phone || '').trim();
  const emailClean = (orderData.email || '').trim().toLowerCase();

  // Find existing incomplete order for same phone or email
  let existingIdx = -1;
  if (phoneClean && phoneClean.length >= 7) {
    existingIdx = all.findIndex((o) => o.phone && o.phone.replace(/[^0-9]/g, '').includes(phoneClean.replace(/[^0-9]/g, '')));
  } else if (emailClean) {
    existingIdx = all.findIndex((o) => o.email && o.email.toLowerCase() === emailClean);
  }

  const now = new Date().toISOString();

  if (existingIdx >= 0) {
    all[existingIdx] = {
      ...all[existingIdx],
      customerName: orderData.customerName || all[existingIdx].customerName || 'Guest Visitor',
      phone: phoneClean || all[existingIdx].phone,
      email: emailClean || all[existingIdx].email,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      paymentMethod: orderData.paymentMethod || all[existingIdx].paymentMethod,
      stage: orderData.stage || all[existingIdx].stage || 'checkout_entered',
      lastActiveAt: now,
      status: 'abandoned',
    };
    try {
      localStorage.setItem(INCOMPLETE_STORAGE_KEY, JSON.stringify(all));
      window.dispatchEvent(new CustomEvent('dsp_incomplete_orders_updated'));
    } catch (e) {
      console.error('Failed to update incomplete order', e);
    }
    return all[existingIdx];
  } else if (phoneClean || orderData.customerName) {
    const newIncomplete: IncompleteOrder = {
      id: `INC-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: orderData.userId,
      customerName: orderData.customerName || 'Guest Visitor',
      phone: phoneClean,
      email: emailClean,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      paymentMethod: orderData.paymentMethod,
      stage: orderData.stage || 'checkout_entered',
      lastActiveAt: now,
      status: 'abandoned',
    };
    all.unshift(newIncomplete);
    try {
      localStorage.setItem(INCOMPLETE_STORAGE_KEY, JSON.stringify(all));
      window.dispatchEvent(new CustomEvent('dsp_incomplete_orders_updated'));
    } catch (e) {
      console.error('Failed to save new incomplete order', e);
    }
    return newIncomplete;
  }

  return null;
}

export function resolveIncompleteOrder(phoneOrEmail: string): void {
  if (!phoneOrEmail) return;
  const all = getIncompleteOrders();
  const clean = phoneOrEmail.replace(/[^0-9a-zA-Z]/g, '').toLowerCase();

  const filtered = all.filter((o) => {
    const oPhone = (o.phone || '').replace(/[^0-9]/g, '');
    const oEmail = (o.email || '').toLowerCase();
    if (clean.includes(oPhone) || oPhone.includes(clean)) return false;
    if (oEmail && oEmail.includes(clean)) return false;
    return true;
  });

  try {
    localStorage.setItem(INCOMPLETE_STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('dsp_incomplete_orders_updated'));
  } catch (e) {
    console.error('Failed to resolve incomplete order', e);
  }
}

export function updateIncompleteOrderStatus(
  id: string,
  status: 'abandoned' | 'recovered' | 'contacted',
  notesAdmin?: string
): void {
  const all = getIncompleteOrders();
  const idx = all.findIndex((o) => o.id === id);
  if (idx >= 0) {
    all[idx].status = status;
    if (notesAdmin !== undefined) {
      all[idx].notesAdmin = notesAdmin;
    }
    try {
      localStorage.setItem(INCOMPLETE_STORAGE_KEY, JSON.stringify(all));
      window.dispatchEvent(new CustomEvent('dsp_incomplete_orders_updated'));
    } catch (e) {
      console.error('Failed to update incomplete order status', e);
    }
  }
}

export function deleteIncompleteOrder(id: string): void {
  const all = getIncompleteOrders().filter((o) => o.id !== id);
  try {
    localStorage.setItem(INCOMPLETE_STORAGE_KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent('dsp_incomplete_orders_updated'));
  } catch (e) {
    console.error('Failed to delete incomplete order', e);
  }
}
