import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { PRODUCTS } from './src/data/storeData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Enable JSON parser with 50mb limit to handle optimized images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Persistent Server Data Directory
const DATA_DIR = path.join(__dirname, 'server-data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const AFFILIATES_FILE = path.join(DATA_DIR, 'affiliates.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');

function readJSON<T>(filePath: string, defaultVal: T): T {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultVal, null, 2), 'utf-8');
      return defaultVal;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (err) {
    console.error(`[Server Data] Error reading ${filePath}:`, err);
    return defaultVal;
  }
}

function writeJSON<T>(filePath: string, data: T): boolean {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`[Server Data] Error writing ${filePath}:`, err);
    return false;
  }
}

// Initial default affiliate applications
const DEFAULT_AFFILIATES = [
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
    status: 'pending',
    submittedAt: new Date(Date.now() - 3600000 * 14).toISOString(),
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
    status: 'approved',
    submittedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    reviewedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    referralCode: 'SRZKJC',
    availableBalance: 10,
    totalEarned: 10,
    paidOut: 0,
    salesCount: 1,
  },
];

// Seed initial files if not present
if (!fs.existsSync(PRODUCTS_FILE)) {
  writeJSON(PRODUCTS_FILE, PRODUCTS);
}
if (!fs.existsSync(AFFILIATES_FILE)) {
  writeJSON(AFFILIATES_FILE, DEFAULT_AFFILIATES);
}
if (!fs.existsSync(USERS_FILE)) {
  writeJSON(USERS_FILE, []);
}

// ---------------- API ROUTES ----------------

// 1. Users API (When any user logs in or registers, admin sees them immediately)
app.get('/api/users', (_req: Request, res: Response) => {
  const users = readJSON<any[]>(USERS_FILE, []);
  res.json({ success: true, users });
});

app.post('/api/users/sync', (req: Request, res: Response) => {
  const incomingUser = req.body;
  if (!incomingUser || (!incomingUser.id && !incomingUser.email && !incomingUser.phone)) {
    return res.status(400).json({ success: false, message: 'Invalid user payload' });
  }

  const users = readJSON<any[]>(USERS_FILE, []);
  const cleanEmail = incomingUser.email?.toLowerCase().trim();
  const cleanPhone = incomingUser.phone?.replace(/[^0-9]/g, '');

  const existingIndex = users.findIndex(
    (u) =>
      (incomingUser.id && u.id === incomingUser.id) ||
      (cleanEmail && u.email && u.email.toLowerCase().trim() === cleanEmail) ||
      (cleanPhone && u.phone && u.phone.replace(/[^0-9]/g, '') === cleanPhone)
  );

  const now = new Date().toISOString();

  if (existingIndex !== -1) {
    const prev = users[existingIndex];
    users[existingIndex] = {
      ...prev,
      ...incomingUser,
      id: prev.id || incomingUser.id,
      name: incomingUser.name || prev.name,
      email: incomingUser.email || prev.email,
      phone: incomingUser.phone || prev.phone,
      walletBalance: incomingUser.walletBalance !== undefined ? incomingUser.walletBalance : (prev.walletBalance || 0),
      lastLoginAt: now,
      loginCount: (prev.loginCount || 0) + 1,
      status: 'active',
      role: incomingUser.role || prev.role || 'customer',
      adminRole: incomingUser.adminRole || prev.adminRole,
      affiliateStatus: incomingUser.affiliateStatus || prev.affiliateStatus,
      isAffiliate: incomingUser.isAffiliate !== undefined ? incomingUser.isAffiliate : prev.isAffiliate,
    };
  } else {
    const newUser = {
      ...incomingUser,
      id: incomingUser.id || `usr_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: incomingUser.createdAt || now,
      lastLoginAt: now,
      loginCount: 1,
      status: 'active',
      role: incomingUser.role || 'customer',
      walletBalance: incomingUser.walletBalance || 0,
    };
    users.unshift(newUser);
  }

  writeJSON(USERS_FILE, users);
  res.json({ success: true, users });
});

app.post('/api/users/login', (req: Request, res: Response) => {
  const { identifier, user } = req.body;
  const users = readJSON<any[]>(USERS_FILE, []);
  const cleanId = (identifier || '').toLowerCase().trim();

  let matched = users.find(
    (u) =>
      (user?.id && u.id === user.id) ||
      (u.email && u.email.toLowerCase().trim() === cleanId) ||
      (u.phone && u.phone.replace(/[^0-9]/g, '') === cleanId.replace(/[^0-9]/g, ''))
  );

  const now = new Date().toISOString();
  if (matched) {
    matched.lastLoginAt = now;
    matched.loginCount = (matched.loginCount || 0) + 1;
    matched.status = 'active';
    if (user) {
      Object.assign(matched, user);
    }
  } else if (user) {
    matched = {
      ...user,
      id: user.id || `usr_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
      lastLoginAt: now,
      loginCount: 1,
      status: 'active',
      createdAt: user.createdAt || now,
    };
    users.unshift(matched);
  }

  writeJSON(USERS_FILE, users);
  res.json({ success: true, user: matched, users });
});

app.delete('/api/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  let users = readJSON<any[]>(USERS_FILE, []);
  users = users.filter((u) => u.id !== id);
  writeJSON(USERS_FILE, users);
  res.json({ success: true, message: 'User deleted successfully', users });
});

// 2. Affiliates API (When any user joins as affiliate, admin sees them; cancel wipes them)
app.get('/api/affiliates', (_req: Request, res: Response) => {
  const affiliates = readJSON<any[]>(AFFILIATES_FILE, DEFAULT_AFFILIATES);
  res.json({ success: true, affiliates });
});

app.post('/api/affiliates', (req: Request, res: Response) => {
  const appData = req.body;
  if (!appData || (!appData.fullName && !appData.contactNumber && !appData.email)) {
    return res.status(400).json({ success: false, message: 'Invalid affiliate data' });
  }

  const affiliates = readJSON<any[]>(AFFILIATES_FILE, DEFAULT_AFFILIATES);
  const cleanEmail = appData.email?.toLowerCase().trim();
  const cleanPhone = appData.contactNumber?.replace(/[^0-9]/g, '');

  const existingIdx = affiliates.findIndex(
    (a) =>
      (appData.id && a.id === appData.id) ||
      (appData.userId && a.userId === appData.userId) ||
      (cleanEmail && a.email && a.email.toLowerCase().trim() === cleanEmail) ||
      (cleanPhone && a.contactNumber && a.contactNumber.replace(/[^0-9]/g, '') === cleanPhone)
  );

  const generatedCode =
    appData.referralCode ||
    (appData.fullName
      ? appData.fullName.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase() +
        Math.floor(10 + Math.random() * 90)
      : 'REF' + Math.floor(1000 + Math.random() * 9000));

  const newApp = {
    id: appData.id || `AFF-${Date.now().toString().slice(-6)}`,
    status: appData.status || 'pending',
    submittedAt: appData.submittedAt || new Date().toISOString(),
    referralCode: generatedCode,
    availableBalance: 0,
    totalEarned: 0,
    paidOut: 0,
    salesCount: 0,
    ...appData,
  };

  if (existingIdx >= 0) {
    affiliates[existingIdx] = {
      ...affiliates[existingIdx],
      ...newApp,
      id: affiliates[existingIdx].id,
      referralCode: affiliates[existingIdx].referralCode || generatedCode,
    };
  } else {
    affiliates.unshift(newApp);
  }

  writeJSON(AFFILIATES_FILE, affiliates);

  // Also sync user's affiliateStatus in users list if exists
  if (appData.userId || cleanEmail) {
    const users = readJSON<any[]>(USERS_FILE, []);
    const uIdx = users.findIndex(
      (u) =>
        (appData.userId && u.id === appData.userId) ||
        (cleanEmail && u.email && u.email.toLowerCase().trim() === cleanEmail)
    );
    if (uIdx >= 0) {
      users[uIdx].affiliateStatus = newApp.status;
      users[uIdx].isAffiliate = newApp.status === 'approved';
      users[uIdx].referralCode = newApp.referralCode;
      writeJSON(USERS_FILE, users);
    }
  }

  res.json({ success: true, application: newApp, affiliates });
});

app.patch('/api/affiliates/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  const affiliates = readJSON<any[]>(AFFILIATES_FILE, DEFAULT_AFFILIATES);

  const idx = affiliates.findIndex((a) => a.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Affiliate not found' });
  }

  affiliates[idx].status = status;
  affiliates[idx].reviewedAt = new Date().toISOString();
  if (notes !== undefined) {
    affiliates[idx].notes = notes;
  }

  if (status === 'approved') {
    if (!affiliates[idx].referralCode) {
      affiliates[idx].referralCode =
        affiliates[idx].fullName.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase() +
        Math.floor(10 + Math.random() * 90);
    }
    if (affiliates[idx].availableBalance === undefined) {
      affiliates[idx].availableBalance = 10;
      affiliates[idx].totalEarned = 10;
      affiliates[idx].salesCount = 1;
    }
  }

  writeJSON(AFFILIATES_FILE, affiliates);

  // Sync user status in users file
  const users = readJSON<any[]>(USERS_FILE, []);
  const targetUser = affiliates[idx];
  const uIdx = users.findIndex(
    (u) =>
      u.id === targetUser.userId ||
      (targetUser.email && u.email?.toLowerCase() === targetUser.email.toLowerCase())
  );
  if (uIdx >= 0) {
    users[uIdx].affiliateStatus = status;
    users[uIdx].isAffiliate = status === 'approved';
    users[uIdx].referralCode = targetUser.referralCode;
    writeJSON(USERS_FILE, users);
  }

  res.json({ success: true, application: affiliates[idx], affiliates });
});

// Delete or cancel affiliate application: completely wipes them from affiliates
app.delete('/api/affiliates/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const affiliates = readJSON<any[]>(AFFILIATES_FILE, DEFAULT_AFFILIATES);
  const target = affiliates.find((a) => a.id === id);
  const remaining = affiliates.filter((a) => a.id !== id);
  writeJSON(AFFILIATES_FILE, remaining);

  // If user was linked, reset their affiliate status
  if (target) {
    const users = readJSON<any[]>(USERS_FILE, []);
    const uIdx = users.findIndex(
      (u) =>
        u.id === target.userId ||
        (target.email && u.email?.toLowerCase() === target.email.toLowerCase())
    );
    if (uIdx >= 0) {
      users[uIdx].affiliateStatus = undefined;
      users[uIdx].isAffiliate = false;
      writeJSON(USERS_FILE, users);
    }
  }

  res.json({
    success: true,
    message: 'Affiliate record completely removed from system.',
    affiliates: remaining,
  });
});

// 3. Products API (Ensures uploaded images and products NEVER vanish on refresh)
app.get('/api/products', (_req: Request, res: Response) => {
  let products = readJSON<any[]>(PRODUCTS_FILE, []);
  if (!products || products.length === 0) {
    products = PRODUCTS;
    writeJSON(PRODUCTS_FILE, products);
  }
  res.json({ success: true, products });
});

app.post('/api/products', (req: Request, res: Response) => {
  const newProduct = req.body;
  if (!newProduct || !newProduct._id) {
    return res.status(400).json({ success: false, message: 'Invalid product data' });
  }

  let products = readJSON<any[]>(PRODUCTS_FILE, PRODUCTS);
  // Prepend to top
  products = [newProduct, ...products.filter((p) => p._id !== newProduct._id)];
  writeJSON(PRODUCTS_FILE, products);
  res.json({ success: true, product: newProduct, products });
});

app.put('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  let products = readJSON<any[]>(PRODUCTS_FILE, PRODUCTS);
  const index = products.findIndex((p) => p._id === id);

  if (index !== -1) {
    products[index] = { ...products[index], ...updates };
  } else {
    products.unshift({ _id: id, ...updates });
  }

  writeJSON(PRODUCTS_FILE, products);
  res.json({ success: true, product: products[index !== -1 ? index : 0], products });
});

app.delete('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  let products = readJSON<any[]>(PRODUCTS_FILE, PRODUCTS);
  products = products.filter((p) => p._id !== id);
  writeJSON(PRODUCTS_FILE, products);
  res.json({ success: true, message: 'Product deleted', products });
});

// 4. Image Upload & Optimization API
app.post('/api/upload', (req: Request, res: Response) => {
  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ success: false, message: 'No image data provided' });
  }
  // Returns safe persistent image representation
  res.json({ success: true, url: image });
});

// ---------------- DEV & PROD INTEGRATION ----------------
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // Mount Vite middleware in development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
