export interface IncomeEntry {
  id: string;
  title: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  paymentMethod: string;
  date: string;
  description?: string;
  referenceNo?: string;
  createdAt: string;
}

export interface IncomeCategory {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface StockAdjustmentEntry {
  id: string;
  productId: string;
  productName: string;
  type: 'addition' | 'subtraction';
  quantity: number;
  reason: string;
  adjustedBy: string;
  date: string;
  createdAt: string;
}

export interface DamageEntry {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  lossAmount: number;
  reason: string;
  date: string;
  createdAt: string;
}

export interface ActivityLogEntry {
  id: string;
  user: string;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface IpBlockEntry {
  id: string;
  ipAddress: string;
  reason: string;
  blockedAt: string;
  blockedBy: string;
  status: 'blocked' | 'whitelisted';
}

const INCOME_STORAGE_KEY = 'dsp_income_entries_v1';
const INCOME_CATS_STORAGE_KEY = 'dsp_income_categories_v1';
const STOCK_ADJ_KEY = 'dsp_stock_adjustments_v1';
const DAMAGE_KEY = 'dsp_damage_entries_v1';
const ACTIVITY_LOG_KEY = 'dsp_activity_logs_v1';
const IP_BLOCK_KEY = 'dsp_ip_block_v1';

const DEFAULT_INCOME_CATS: IncomeCategory[] = [
  { id: 'cat-inc-1', name: 'Software Reselling', description: 'Direct software keys and licenses revenue', createdAt: '2026-08-01T10:00:00.000Z' },
  { id: 'cat-inc-2', name: 'Subscription Services', description: 'Monthly and annual digital tool subscriptions', createdAt: '2026-08-01T10:00:00.000Z' },
  { id: 'cat-inc-3', name: 'Custom Social Marketing', description: 'Facebook page setup and social growth campaigns', createdAt: '2026-08-05T10:00:00.000Z' },
  { id: 'cat-inc-4', name: 'Affiliate Partnership Revenue', description: 'Partner commission profits', createdAt: '2026-08-10T10:00:00.000Z' },
];

const DEFAULT_INCOME: IncomeEntry[] = [
  {
    id: 'inc-001',
    title: 'Bulk License Sale - Tech Solution BD',
    categoryId: 'cat-inc-1',
    categoryName: 'Software Reselling',
    amount: 15400,
    paymentMethod: 'Bank Transfer',
    date: '2026-09-25',
    description: '10x Windows 11 Pro Genuine Keys delivered to enterprise client',
    referenceNo: 'TXN-BANK-8832',
    createdAt: '2026-09-25T14:30:00.000Z',
  },
  {
    id: 'inc-002',
    title: 'Claude AI Pro Enterprise Subscription',
    categoryId: 'cat-inc-2',
    categoryName: 'Subscription Services',
    amount: 2850,
    paymentMethod: 'bKash Merchant',
    date: '2026-09-27',
    description: '1 Month Claude Pro Invitation + Dedicated Support',
    referenceNo: 'TXN-BK-9182',
    createdAt: '2026-09-27T09:15:00.000Z',
  },
  {
    id: 'inc-003',
    title: 'Facebook Verified Bin Access',
    categoryId: 'cat-inc-3',
    categoryName: 'Custom Social Marketing',
    amount: 1200,
    paymentMethod: 'Nagad',
    date: '2026-09-28',
    description: 'Instant BIN code delivery for Ads Manager',
    referenceNo: 'TXN-NG-4412',
    createdAt: '2026-09-28T08:00:00.000Z',
  },
];

const DEFAULT_ACTIVITY_LOGS: ActivityLogEntry[] = [
  {
    id: 'act-1',
    user: 'info.durjoysenpaval@gmail.com',
    action: 'Order Fulfilled & Email Sent',
    module: 'Orders',
    details: 'Dispatched digital license key to customer order #DSP-849201',
    ipAddress: '103.145.118.24',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'act-2',
    user: 'admin@dspdigitalmart.com',
    action: 'Affiliate Approved',
    module: 'Affiliates',
    details: 'Approved affiliate application for Tanvir Ahmed with 15% discount rate',
    ipAddress: '103.145.118.24',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'act-3',
    user: 'system',
    action: 'Automatic Cloud Sync',
    module: 'Firestore Database',
    details: 'Synced product catalogs and user accounts with Firestore collection',
    ipAddress: '127.0.0.1',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
];

const DEFAULT_IP_BLOCK: IpBlockEntry[] = [
  {
    id: 'ip-1',
    ipAddress: '185.220.101.5',
    reason: 'Suspicious checkout attempts / Bot crawler',
    blockedAt: '2026-09-20T12:00:00.000Z',
    blockedBy: 'Super Admin',
    status: 'blocked',
  },
  {
    id: 'ip-2',
    ipAddress: '103.145.118.24',
    reason: 'Official Admin IP Whitelist',
    blockedAt: '2026-07-18T00:00:00.000Z',
    blockedBy: 'Owner',
    status: 'whitelisted',
  },
];

// Income Handlers
export const getIncomeEntries = (): IncomeEntry[] => {
  try {
    const raw = localStorage.getItem(INCOME_STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_INCOME;
  } catch {
    return DEFAULT_INCOME;
  }
};

export const saveIncomeEntries = (entries: IncomeEntry[]): void => {
  try {
    localStorage.setItem(INCOME_STORAGE_KEY, JSON.stringify(entries));
  } catch {}
};

export const addIncomeEntry = (entry: Omit<IncomeEntry, 'id' | 'createdAt'>): IncomeEntry => {
  const entries = getIncomeEntries();
  const newEntry: IncomeEntry = {
    ...entry,
    id: `inc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: new Date().toISOString(),
  };
  saveIncomeEntries([newEntry, ...entries]);
  return newEntry;
};

export const deleteIncomeEntry = (id: string): void => {
  const entries = getIncomeEntries();
  saveIncomeEntries(entries.filter((e) => e.id !== id));
};

// Income Categories
export const getIncomeCategories = (): IncomeCategory[] => {
  try {
    const raw = localStorage.getItem(INCOME_CATS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_INCOME_CATS;
  } catch {
    return DEFAULT_INCOME_CATS;
  }
};

export const saveIncomeCategories = (cats: IncomeCategory[]): void => {
  try {
    localStorage.setItem(INCOME_CATS_STORAGE_KEY, JSON.stringify(cats));
  } catch {}
};

export const addIncomeCategory = (name: string, description?: string): IncomeCategory => {
  const cats = getIncomeCategories();
  const newCat: IncomeCategory = {
    id: `cat-inc-${Date.now()}`,
    name,
    description,
    createdAt: new Date().toISOString(),
  };
  saveIncomeCategories([...cats, newCat]);
  return newCat;
};

export const deleteIncomeCategory = (id: string): void => {
  const cats = getIncomeCategories();
  saveIncomeCategories(cats.filter((c) => c.id !== id));
};

// Stock Adjustments
export const getStockAdjustments = (): StockAdjustmentEntry[] => {
  try {
    const raw = localStorage.getItem(STOCK_ADJ_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addStockAdjustment = (adj: Omit<StockAdjustmentEntry, 'id' | 'createdAt'>): StockAdjustmentEntry => {
  const entries = getStockAdjustments();
  const newAdj: StockAdjustmentEntry = {
    ...adj,
    id: `adj-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(STOCK_ADJ_KEY, JSON.stringify([newAdj, ...entries]));
  return newAdj;
};

// Damage Entries
export const getDamageEntries = (): DamageEntry[] => {
  try {
    const raw = localStorage.getItem(DAMAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addDamageEntry = (entry: Omit<DamageEntry, 'id' | 'createdAt'>): DamageEntry => {
  const entries = getDamageEntries();
  const newEntry: DamageEntry = {
    ...entry,
    id: `dmg-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(DAMAGE_KEY, JSON.stringify([newEntry, ...entries]));
  return newEntry;
};

// Activity Logs
export const getActivityLogs = (): ActivityLogEntry[] => {
  try {
    const raw = localStorage.getItem(ACTIVITY_LOG_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_ACTIVITY_LOGS;
  } catch {
    return DEFAULT_ACTIVITY_LOGS;
  }
};

export const logActivity = (action: string, module: string, details: string, user = 'Admin'): void => {
  try {
    const logs = getActivityLogs();
    const newLog: ActivityLogEntry = {
      id: `act-${Date.now()}`,
      user,
      action,
      module,
      details,
      ipAddress: '103.145.118.24',
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify([newLog, ...logs.slice(0, 99)]));
  } catch {}
};

// IP Blocks
export const getIpBlocks = (): IpBlockEntry[] => {
  try {
    const raw = localStorage.getItem(IP_BLOCK_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_IP_BLOCK;
  } catch {
    return DEFAULT_IP_BLOCK;
  }
};

export const addIpBlock = (ipAddress: string, reason: string, status: 'blocked' | 'whitelisted' = 'blocked'): IpBlockEntry => {
  const entries = getIpBlocks();
  const newEntry: IpBlockEntry = {
    id: `ip-${Date.now()}`,
    ipAddress,
    reason,
    blockedAt: new Date().toISOString(),
    blockedBy: 'Super Admin',
    status,
  };
  localStorage.setItem(IP_BLOCK_KEY, JSON.stringify([newEntry, ...entries]));
  return newEntry;
};

export const removeIpBlock = (id: string): void => {
  const entries = getIpBlocks();
  localStorage.setItem(IP_BLOCK_KEY, JSON.stringify(entries.filter((e) => e.id !== id)));
};
