import { Product, OrderDetails, UserProfile } from '../types';
import { PRODUCTS, SHOP_INFO } from '../data/storeData';
import { getRegisteredUsers, getUserOrders } from './authStorage';

const LIVE_PRODUCTS_KEY = 'dsp_live_products_v1';
const THEME_CONFIG_KEY = 'dsp_theme_config_v1';
const STORE_SETTINGS_KEY = 'dsp_store_settings_v1';
const VENDOR_ADMINS_KEY = 'dsp_vendor_admins_v1';

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  dashboardStyle: 'classic' | 'professional';
  searchHints: string;
  checkoutLanguage: 'bn' | 'en' | 'it';
}

export interface StoreSettings {
  deliveryCharge: {
    insideCity: number;
    outsideCity: number;
    freeDeliveryMinOrder?: number;
    enabled: boolean;
  };
  advancePayment: {
    enabled: boolean;
    amount: number;
    type?: 'fixed' | 'percentage';
  };
  smsGateway: {
    provider: string;
    senderId: string;
    apiKey: string;
    template?: string;
    enabled: boolean;
  };
  courier: {
    provider: string;
    apiKey?: string;
    secretKey?: string;
    storeId?: string;
    autoAssign: boolean;
  };
  paymentMethods: {
    bkash: { enabled: boolean; number: string; type: string };
    nagad: { enabled: boolean; number: string; type: string };
    rocket: { enabled: boolean; number: string; type: string };
    bank: { enabled: boolean; bankName: string; accountNo: string; branch: string };
    wallet: { enabled: boolean };
  };
  chatManage: {
    whatsapp: string;
    messenger: string;
    telegram?: string;
    floatingWidgetEnabled?: boolean;
  };
  shopCurrency: string;
  country: string;
  currencyCode: string;

  // Real Tracking & Analytics Pixels
  facebookPixel: {
    pixelId: string;
    headerScript: string;
    bodyScript: string;
    accessToken: string;
    testEventCode?: string;
    enabled: boolean;
  };
  tiktokPixel: {
    pixelId: string;
    headerScript: string;
    accessToken?: string;
    enabled: boolean;
  };
  tagManager: {
    gtmId: string;
    ga4MeasurementId: string;
    headScript: string;
    bodyNoScript: string;
    ecommerceDataLayer: boolean;
    enabled: boolean;
  };

  // Additional Cards matching screenshot
  fraudCheck: {
    provider: string;
    apiKey: string;
    blockHighRisk: boolean;
    maxCodAmount: number;
    enabled: boolean;
  };
  socialLogin: {
    googleClientId: string;
    facebookAppId: string;
    googleEnabled: boolean;
    facebookEnabled: boolean;
  };
  facebookCatalog: {
    catalogId: string;
    feedUrl: string;
    autoSync: boolean;
  };
  manageOffer: {
    offerTitle: string;
    discountPercent: number;
    couponCode: string;
    endDate: string;
    bannerEnabled: boolean;
  };
  domainManage: {
    primaryDomain: string;
    customDomain: string;
    sslActive: boolean;
    cnameTarget: string;
  };
  orderSetting: {
    minOrderAmount: number;
    maxOrderAmount: number;
    autoConfirmDigital: boolean;
    cancelWindowHours: number;
  };
  productSetting: {
    lowStockThreshold: number;
    showOutOfStock: boolean;
    autoDeliverLicenseKey: boolean;
  };
  googleSearchConsole: {
    metaVerification: string;
    sitemapUrl: string;
    enabled: boolean;
  };
  blogSettings: {
    enabled: boolean;
    commentsModeration: boolean;
    postsPerPage: number;
  };
  invoiceSettings: {
    companyName: string;
    companyPhone: string;
    companyAddress: string;
    footerTerms: string;
    logoUrl: string;
  };
  rewardPoint: {
    enabled: boolean;
    pointsPer100: number;
    pointValueBdt: number;
    signupBonus: number;
    referralBonus: number;
  };
  ePBX: {
    provider: string;
    apiKey: string;
    callerId: string;
    autoCallOnOrder: boolean;
    enabled: boolean;
  };
  bizmation: {
    apiKey: string;
    branchId: string;
    syncProducts: boolean;
    syncOrders: boolean;
    enabled: boolean;
  };
  homepageStats: {
    ordersDelivered: string;
    happyCustomers: string;
    avgDeliveryTime: string;
    verifiedReviewAvg: string;
  };
}

export type VendorRole = 'Owner' | 'Admin' | 'Manager' | 'ProductAdder';

export interface VendorAdmin {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: VendorRole;
  lastLogin: string;
  registeredAt: string;
  access: 'Allowed' | 'Restricted';
  avatar?: string;
}

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  primaryColor: '#FE1AA7',
  secondaryColor: '#00993B',
  tertiaryColor: '#00C217',
  dashboardStyle: 'professional',
  searchHints: 'windows 11, vpn, canva, chatgpt, antivirus, idm, ms office',
  checkoutLanguage: 'en',
};

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  deliveryCharge: {
    insideCity: 0,
    outsideCity: 0,
    freeDeliveryMinOrder: 500,
    enabled: false,
  },
  advancePayment: {
    enabled: false,
    amount: 0,
    type: 'fixed',
  },
  smsGateway: {
    provider: 'Alpha Net SMS Gateway',
    senderId: 'DSPMART',
    apiKey: 'ak_live_89127491274',
    template: 'Dear {customer_name}, your order #{order_id} has been received. Thank you for shopping with DSP Digital Mart!',
    enabled: true,
  },
  courier: {
    provider: 'Steadfast Courier',
    apiKey: 'stdf_api_91827491827',
    secretKey: 'stdf_sec_81927491827',
    storeId: 'DSP_STORE_1',
    autoAssign: true,
  },
  paymentMethods: {
    bkash: { enabled: true, number: '01712792184', type: 'Personal / Send Money' },
    nagad: { enabled: true, number: '01712792184', type: 'Personal / Send Money' },
    rocket: { enabled: true, number: '01712792184', type: 'Personal / Send Money' },
    bank: { enabled: true, bankName: 'Islami Bank Bangladesh', accountNo: '20501234567890', branch: 'Khulna' },
    wallet: { enabled: true },
  },
  chatManage: {
    whatsapp: SHOP_INFO.whatsappNumber || '+8801712792184',
    messenger: 'https://m.me/dspdigitalmart',
    telegram: 'https://t.me/dspdigitalmart',
    floatingWidgetEnabled: true,
  },
  shopCurrency: '৳',
  country: 'Bangladesh',
  currencyCode: 'BDT',

  facebookPixel: {
    pixelId: '1372451788410293',
    headerScript: `<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1372451788410293');
fbq('track', 'PageView');
</script>`,
    bodyScript: `<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=1372451788410293&ev=PageView&noscript=1"
/></noscript>`,
    accessToken: 'EAAPCWzX9odEBSkV0ZAVAQKWhHJfoYf2f4ZBTgIvOfNO3yqPuxZAM3WZBcmGTGzUSScwjCd2TBWh7rYIzvjufROgIf44N73SWllhodBMPudhZCju8YFNY51jZCZBFUPVuXnWbGphat0CNYOpLyCBiHQBkQSzvuFZA8cdnlmu5ufaBKTLboRQgpCLLBjE0NCR8EgZDZD',
    testEventCode: 'TEST12345',
    enabled: true,
  },

  tiktokPixel: {
    pixelId: 'C79234KL129841',
    headerScript: `<!-- TikTok Pixel Code -->
<script>
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
  ttq.load('C79234KL129841');
  ttq.page();
}(window, document, 'ttq');
</script>`,
    accessToken: 'tiktok_events_token_sample',
    enabled: true,
  },

  tagManager: {
    gtmId: 'GTM-TMMCPB3C',
    ga4MeasurementId: 'G-32984920',
    headScript: `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TMMCPB3C');</script>
<!-- End Google Tag Manager -->`,
    bodyNoScript: `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TMMCPB3C"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`,
    ecommerceDataLayer: true,
    enabled: true,
  },

  fraudCheck: {
    provider: 'BD Courier Fraud API',
    apiKey: 'fraud_live_981274912',
    blockHighRisk: true,
    maxCodAmount: 3000,
    enabled: true,
  },

  socialLogin: {
    googleClientId: '101269658334-apps.googleusercontent.com',
    facebookAppId: '89127491287419',
    googleEnabled: true,
    facebookEnabled: false,
  },

  facebookCatalog: {
    catalogId: 'cat_912849182',
    feedUrl: 'https://dspdigitalmart.com/feeds/products.xml',
    autoSync: true,
  },

  manageOffer: {
    offerTitle: 'Eid Special 35% Flash Sale On All Antivirus & Software',
    discountPercent: 35,
    couponCode: 'DSP35',
    endDate: '2026-12-31',
    bannerEnabled: true,
  },

  domainManage: {
    primaryDomain: 'dspdigitalmart.com',
    customDomain: 'shop.dspdigitalmart.com',
    sslActive: true,
    cnameTarget: 'cname.vercel-dns.com',
  },

  orderSetting: {
    minOrderAmount: 100,
    maxOrderAmount: 50000,
    autoConfirmDigital: true,
    cancelWindowHours: 2,
  },

  productSetting: {
    lowStockThreshold: 5,
    showOutOfStock: true,
    autoDeliverLicenseKey: true,
  },

  googleSearchConsole: {
    metaVerification: 'google-site-verification=abc123xyz890DSPMART',
    sitemapUrl: 'https://dspdigitalmart.com/sitemap.xml',
    enabled: true,
  },

  blogSettings: {
    enabled: true,
    commentsModeration: true,
    postsPerPage: 6,
  },

  invoiceSettings: {
    companyName: 'DSP Digital Mart Bangladesh',
    companyPhone: '+8801712792184',
    companyAddress: 'Khulna Sadar, Khulna, Bangladesh',
    footerTerms: 'Thank you for choosing DSP Digital Mart. Digital licenses are non-refundable once delivered.',
    logoUrl: '/favicon.ico',
  },

  rewardPoint: {
    enabled: true,
    pointsPer100: 5,
    pointValueBdt: 0.5,
    signupBonus: 50,
    referralBonus: 100,
  },

  ePBX: {
    provider: 'Daffodil ePBX Solution',
    apiKey: 'epbx_live_8912749',
    callerId: '+8809612345678',
    autoCallOnOrder: false,
    enabled: false,
  },

  bizmation: {
    apiKey: 'biz_api_live_19827419',
    branchId: 'KHULNA_MAIN_01',
    syncProducts: true,
    syncOrders: true,
    enabled: true,
  },
  homepageStats: {
    ordersDelivered: '48K+',
    happyCustomers: '12K+',
    avgDeliveryTime: '~38s',
    verifiedReviewAvg: '4.9',
  },
};

// ---------------- PRODUCTS ----------------
export const syncInitialProducts = (defaults: Product[]) => {
  try {
    const raw = localStorage.getItem(LIVE_PRODUCTS_KEY);
    if (!raw) {
      localStorage.setItem(LIVE_PRODUCTS_KEY, JSON.stringify(defaults));
    }
  } catch (e) {}
};

export const getLiveProducts = (): Product[] => {
  try {
    const raw = localStorage.getItem(LIVE_PRODUCTS_KEY);
    if (!raw) {
      localStorage.setItem(LIVE_PRODUCTS_KEY, JSON.stringify(PRODUCTS));
      return PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return PRODUCTS;
  } catch (e) {
    return PRODUCTS;
  }
};

export const saveLiveProducts = (products: Product[]) => {
  try {
    localStorage.setItem(LIVE_PRODUCTS_KEY, JSON.stringify(products));
    window.dispatchEvent(new Event('dsp_products_updated'));
  } catch (e) {
    console.error('Failed to save live products', e);
  }
};

export const addLiveProduct = (newProd: Partial<Product>): Product => {
  const current = getLiveProducts();
  const slug = (newProd.name || 'product')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  const created: Product = {
    _id: `prod_${Date.now()}`,
    name: newProd.name || 'New Product',
    slug: `${slug}-${Math.floor(100 + Math.random() * 900)}`,
    images: newProd.images && newProd.images.length > 0 ? newProd.images : ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'],
    salePrice: newProd.salePrice ?? 500,
    regularPrice: newProd.regularPrice ?? 800,
    category: newProd.category || 'Software',
    isVariation: false,
    description: newProd.description || 'Official digital license product with instant delivery.',
    shortDescription: newProd.shortDescription || 'Instant Delivery in Bangladesh',
    totalSold: 0,
    ratingCount: 5,
    ratingTotal: 25,
    isPublished: true,
    stock: newProd.stock ?? 100,
    openingStock: newProd.openingStock ?? 100,
    ...newProd,
  };

  const updated = [created, ...current];
  saveLiveProducts(updated);
  return created;
};

export const updateLiveProduct = (id: string, updates: Partial<Product>): boolean => {
  const current = getLiveProducts();
  const index = current.findIndex((p) => p._id === id);
  if (index === -1) return false;
  current[index] = { ...current[index], ...updates };
  saveLiveProducts(current);
  return true;
};

export const deleteLiveProduct = (id: string): boolean => {
  const current = getLiveProducts();
  const filtered = current.filter((p) => p._id !== id);
  saveLiveProducts(filtered);
  return true;
};

// ---------------- THEME CONFIG ----------------
export const getThemeConfig = (): ThemeConfig => {
  try {
    const raw = localStorage.getItem(THEME_CONFIG_KEY);
    if (!raw) return DEFAULT_THEME_CONFIG;
    return { ...DEFAULT_THEME_CONFIG, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_THEME_CONFIG;
  }
};

export const saveThemeConfig = (config: ThemeConfig) => {
  try {
    localStorage.setItem(THEME_CONFIG_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('dsp_theme_updated', { detail: config }));
  } catch (e) {}
};

// ---------------- STORE SETTINGS ----------------
export const getStoreSettings = (): StoreSettings => {
  try {
    const raw = localStorage.getItem(STORE_SETTINGS_KEY);
    if (!raw) return DEFAULT_STORE_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STORE_SETTINGS,
      ...parsed,
      deliveryCharge: { ...DEFAULT_STORE_SETTINGS.deliveryCharge, ...(parsed.deliveryCharge || {}) },
      advancePayment: { ...DEFAULT_STORE_SETTINGS.advancePayment, ...(parsed.advancePayment || {}) },
      smsGateway: { ...DEFAULT_STORE_SETTINGS.smsGateway, ...(parsed.smsGateway || {}) },
      courier: { ...DEFAULT_STORE_SETTINGS.courier, ...(parsed.courier || {}) },
      paymentMethods: {
        ...DEFAULT_STORE_SETTINGS.paymentMethods,
        ...(parsed.paymentMethods || {}),
        bkash: { ...DEFAULT_STORE_SETTINGS.paymentMethods.bkash, ...(parsed.paymentMethods?.bkash || {}) },
        nagad: { ...DEFAULT_STORE_SETTINGS.paymentMethods.nagad, ...(parsed.paymentMethods?.nagad || {}) },
        rocket: { ...DEFAULT_STORE_SETTINGS.paymentMethods.rocket, ...(parsed.paymentMethods?.rocket || {}) },
        bank: { ...DEFAULT_STORE_SETTINGS.paymentMethods.bank, ...(parsed.paymentMethods?.bank || {}) },
        wallet: { ...DEFAULT_STORE_SETTINGS.paymentMethods.wallet, ...(parsed.paymentMethods?.wallet || {}) },
      },
      chatManage: { ...DEFAULT_STORE_SETTINGS.chatManage, ...(parsed.chatManage || {}) },
      facebookPixel: (() => {
        const fp = typeof parsed.facebookPixel === 'object' && parsed.facebookPixel !== null
          ? { ...DEFAULT_STORE_SETTINGS.facebookPixel, ...parsed.facebookPixel }
          : { ...DEFAULT_STORE_SETTINGS.facebookPixel };
        if (fp.pixelId === '8917249127491' || !fp.pixelId) {
          fp.pixelId = '1372451788410293';
        }
        if (fp.accessToken === 'EAACedEose0cBA...' || !fp.accessToken) {
          fp.accessToken = 'EAAPCWzX9odEBSkV0ZAVAQKWhHJfoYf2f4ZBTgIvOfNO3yqPuxZAM3WZBcmGTGzUSScwjCd2TBWh7rYIzvjufROgIf44N73SWllhodBMPudhZCju8YFNY51jZCZBFUPVuXnWbGphat0CNYOpLyCBiHQBkQSzvuFZA8cdnlmu5ufaBKTLboRQgpCLLBjE0NCR8EgZDZD';
        }
        return fp;
      })(),
      tiktokPixel: typeof parsed.tiktokPixel === 'object' && parsed.tiktokPixel !== null
        ? { ...DEFAULT_STORE_SETTINGS.tiktokPixel, ...parsed.tiktokPixel }
        : { ...DEFAULT_STORE_SETTINGS.tiktokPixel, pixelId: typeof parsed.tiktokPixel === 'string' ? parsed.tiktokPixel : DEFAULT_STORE_SETTINGS.tiktokPixel.pixelId },
      tagManager: (() => {
        const tm = typeof parsed.tagManager === 'object' && parsed.tagManager !== null
          ? { ...DEFAULT_STORE_SETTINGS.tagManager, ...parsed.tagManager }
          : { ...DEFAULT_STORE_SETTINGS.tagManager };
        if (tm.gtmId === 'GTM-N6WQ89P' || !tm.gtmId) {
          tm.gtmId = 'GTM-TMMCPB3C';
          tm.headScript = DEFAULT_STORE_SETTINGS.tagManager.headScript;
          tm.bodyNoScript = DEFAULT_STORE_SETTINGS.tagManager.bodyNoScript;
        }
        tm.enabled = true;
        return tm;
      })(),
      fraudCheck: { ...DEFAULT_STORE_SETTINGS.fraudCheck, ...(parsed.fraudCheck || {}) },
      socialLogin: { ...DEFAULT_STORE_SETTINGS.socialLogin, ...(parsed.socialLogin || {}) },
      facebookCatalog: { ...DEFAULT_STORE_SETTINGS.facebookCatalog, ...(parsed.facebookCatalog || {}) },
      manageOffer: { ...DEFAULT_STORE_SETTINGS.manageOffer, ...(parsed.manageOffer || {}) },
      domainManage: { ...DEFAULT_STORE_SETTINGS.domainManage, ...(parsed.domainManage || {}) },
      orderSetting: { ...DEFAULT_STORE_SETTINGS.orderSetting, ...(parsed.orderSetting || {}) },
      productSetting: { ...DEFAULT_STORE_SETTINGS.productSetting, ...(parsed.productSetting || {}) },
      googleSearchConsole: { ...DEFAULT_STORE_SETTINGS.googleSearchConsole, ...(parsed.googleSearchConsole || {}) },
      blogSettings: { ...DEFAULT_STORE_SETTINGS.blogSettings, ...(parsed.blogSettings || {}) },
      invoiceSettings: { ...DEFAULT_STORE_SETTINGS.invoiceSettings, ...(parsed.invoiceSettings || {}) },
      rewardPoint: { ...DEFAULT_STORE_SETTINGS.rewardPoint, ...(parsed.rewardPoint || {}) },
      ePBX: { ...DEFAULT_STORE_SETTINGS.ePBX, ...(parsed.ePBX || {}) },
      bizmation: { ...DEFAULT_STORE_SETTINGS.bizmation, ...(parsed.bizmation || {}) },
      homepageStats: { ...DEFAULT_STORE_SETTINGS.homepageStats, ...(parsed.homepageStats || {}) },
    };
  } catch (e) {
    return DEFAULT_STORE_SETTINGS;
  }
};

export const saveStoreSettings = (settings: StoreSettings) => {
  try {
    localStorage.setItem(STORE_SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('dsp_settings_updated', { detail: settings }));
  } catch (e) {}
};

// ---------------- VENDOR ADMINS ----------------
export const getVendorAdmins = (): VendorAdmin[] => {
  try {
    const raw = localStorage.getItem(VENDOR_ADMINS_KEY);
    if (!raw) {
      const initial: VendorAdmin[] = [
        {
          id: 'adm_1',
          name: 'Demo23',
          username: 'admin@gmail.com',
          role: 'Owner',
          lastLogin: 'Today',
          registeredAt: 'Aug 19, 2026',
          access: 'Allowed',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        },
      ];
      localStorage.setItem(VENDOR_ADMINS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
};

export const saveVendorAdmins = (admins: VendorAdmin[]) => {
  try {
    localStorage.setItem(VENDOR_ADMINS_KEY, JSON.stringify(admins));
  } catch (e) {}
};

export const addVendorAdmin = (admin: Omit<VendorAdmin, 'id'>): VendorAdmin => {
  const current = getVendorAdmins();
  const created: VendorAdmin = {
    id: `adm_${Date.now()}`,
    ...admin,
  };
  saveVendorAdmins([created, ...current]);
  return created;
};

// ---------------- ALL ORDERS (ADMIN) ----------------
export const getAdminOrders = (): OrderDetails[] => {
  try {
    const raw = localStorage.getItem('dsp_customer_orders');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
};

export const updateOrderStatus = (
  orderId: string,
  status: 'pending' | 'delivered' | 'processing' | 'cancelled' | 'confirmed' | 'hold',
  licenseKey?: string
): boolean => {
  try {
    const orders = getAdminOrders();
    const idx = orders.findIndex((o) => o.orderId === orderId);
    if (idx === -1) return false;
    orders[idx] = {
      ...orders[idx],
      status: status as any,
      licenseKey: licenseKey !== undefined ? licenseKey : orders[idx].licenseKey,
    };
    localStorage.setItem('dsp_customer_orders', JSON.stringify(orders));
    window.dispatchEvent(new Event('dsp_orders_updated'));
    return true;
  } catch (e) {
    return false;
  }
};
