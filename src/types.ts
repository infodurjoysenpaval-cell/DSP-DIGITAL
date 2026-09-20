export interface VariationItem {
  _id: string;
  name: string;
  regularPrice: number;
  salePrice: number;
  quantity?: number;
  isDefault?: boolean;
  image?: string | null;
  sku?: string | null;
  costPrice?: number | null;
  physicalStock?: number;
  [key: string]: any;
}

export interface FaqItem {
  question: string;
  answer: string;
  [key: string]: any;
}

export interface ProductTag {
  _id: string;
  name: string;
  slug?: string;
  [key: string]: any;
}

export interface ProductCategory {
  _id?: string;
  name?: string;
  slug?: string;
  images?: string[];
  [key: string]: any;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  tags?: ProductTag[];
  category?: ProductCategory | string | null;
  categories?: ProductCategory[];
  images: string[];
  salePrice: number | null;
  regularPrice: number | null;
  isVariation: boolean;
  variation?: string | null;
  variationOptions?: string[];
  variation2?: string | null;
  variation2Options?: string[];
  variation3?: string | null;
  variation3Options?: string[];
  variationList?: VariationItem[];
  description?: string | null;
  shortDescription?: string | null;
  seoDescription?: string | null;
  seoKeyword?: string | null;
  seoTitle?: string | null;
  totalSold?: number;
  ratingCount?: number;
  ratingTotal?: number;
  reviewTotal?: number;
  faqList?: FaqItem[];
  warranty?: string | null;
  keyFeature?: string | null;
  specifications?: any;
  isPreOrder?: boolean;
  deliveryCharge?: {
    insideCity?: number | null;
    outsideCity?: number | null;
    isEnableDeliveryCharge?: boolean;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  images: string[];
  categoryProducts?: number;
  showHomeMenu?: boolean;
  [key: string]: any;
}

export interface CarouselBanner {
  _id: string;
  name: string;
  images: string[];
  url?: string | null;
  urlType?: string | null;
  [key: string]: any;
}

export interface Tag {
  _id: string;
  name: string;
  slug?: string | null;
  [key: string]: any;
}

export interface ShopInfo {
  _id?: string;
  websiteName: string;
  shortDescription: string;
  fabIcon: string;
  logoPrimary: string;
  whatsappNumber: string;
  headerNews?: string;
  brandingText?: string;
  addresses: Array<{ type?: number | null; value: string; [key: string]: any }>;
  emails: Array<{ type?: number | null; value: string; [key: string]: any }>;
  phones: Array<{ type?: number | null; value: string; [key: string]: any }>;
  socialLinks: Array<{ type: number; value: string; [key: string]: any }>;
  [key: string]: any;
}

export interface CartItem {
  product: Product;
  selectedVariation?: VariationItem | null;
  quantity: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  createdAt: string;
}

export interface OrderDetails {
  orderId: string;
  userId?: string;
  customerName: string;
  phone: string;
  email: string;
  notes?: string;
  items: CartItem[];
  paymentMethod: 'bkash' | 'nagad' | 'rocket' | 'bank';
  transactionId?: string;
  totalAmount: number;
  createdAt: string;
}
