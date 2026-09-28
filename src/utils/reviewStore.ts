import { Product } from '../types';
import { PRODUCTS } from '../data/storeData';

export interface Review {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  customerName: string;
  customerAvatar?: string;
  rating: number; // 1 to 5
  reviewText: string;
  status: 'approved' | 'pending';
  images?: string[];
  reply?: string;
  replyAt?: string;
  createdAt: string;
}

const REVIEWS_STORAGE_KEY = 'dsp_admin_reviews_v1';

const DEFAULT_REVIEWS: Review[] = [
  {
    id: 'rev-001',
    productId: '6a8308caee4e0385aeea5bee',
    productName: 'Test Product One',
    productImage: 'https://cdn.saleecom.com/upload/images/6a5b95a31438b186e57eabff/12206-b210e.webp?resolution=1254_1254',
    customerName: 'Tanvir Ahmed',
    rating: 5,
    reviewText: 'Very Good',
    status: 'approved',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    reply: 'Thank you for your valuable feedback! We are always here to serve you.',
    replyAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'rev-002',
    productId: '6a638279059437794b4e8d4e',
    productName: 'Claude AI Pro Genuine Subscription – Premium AI Power',
    productImage: 'https://cdn.saleecom.com/upload/images/6a5b95a31438b186e57eabff/12206-b210e.webp?resolution=1254_1254',
    customerName: 'Durjoy Sen',
    rating: 5,
    reviewText: '100% genuine access, got the invitation instantly on my email within 2 minutes. Highly recommended for developers & writers!',
    status: 'approved',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    reply: 'Thanks a lot Durjoy bhai! Enjoy Claude Pro.',
    replyAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'rev-003',
    productId: '6a5b95a41438b186e57eac7a',
    productName: 'Grammarly Pro Subscription – Premium AI Writing',
    productImage: 'https://cdn.saleecom.com/upload/images/6a5b95a31438b186e57eabff/11333-f858.webp?resolution=1254_1254',
    customerName: 'Sabbir Rahman',
    rating: 5,
    reviewText: 'Original private account delivery. Works flawlessly on all my browser extensions.',
    status: 'approved',
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: 'rev-004',
    productId: '6a77397664665e5a0aca9f34',
    productName: 'Windows 11 Pro License Key | DSP TECH MART',
    productImage: 'https://cdn.saleecom.com/upload/images/6a5b95a31438b186e57eabff/11327-a45e.webp?resolution=1254_1254',
    customerName: 'Rashedul Islam',
    rating: 4,
    reviewText: 'Key received on WhatsApp and activated Windows successfully.',
    status: 'pending',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

export const getReviews = (): Review[] => {
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(DEFAULT_REVIEWS));
      return DEFAULT_REVIEWS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_REVIEWS;
  } catch {
    return DEFAULT_REVIEWS;
  }
};

export const saveReviewsList = (reviews: Review[]): void => {
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('dsp_reviews_updated', { detail: reviews }));
    }
  } catch {}
};

export const addReview = (reviewData: Omit<Review, 'id' | 'createdAt'>): Review => {
  const reviews = getReviews();
  const newReview: Review = {
    ...reviewData,
    id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: new Date().toISOString(),
  };
  const updated = [newReview, ...reviews];
  saveReviewsList(updated);
  return newReview;
};

export const updateReview = (id: string, updates: Partial<Review>): Review | null => {
  const reviews = getReviews();
  const index = reviews.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const updatedReview = { ...reviews[index], ...updates };
  reviews[index] = updatedReview;
  saveReviewsList(reviews);
  return updatedReview;
};

export const deleteReview = (id: string): boolean => {
  const reviews = getReviews();
  const filtered = reviews.filter((r) => r.id !== id);
  saveReviewsList(filtered);
  return true;
};

export const duplicateReview = (id: string): Review | null => {
  const reviews = getReviews();
  const target = reviews.find((r) => r.id === id);
  if (!target) return null;

  const duplicated: Review = {
    ...target,
    id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    reviewText: `${target.reviewText} (Copy)`,
    createdAt: new Date().toISOString(),
  };
  const updated = [duplicated, ...reviews];
  saveReviewsList(updated);
  return duplicated;
};

export const bulkDeleteReviews = (ids: string[]): void => {
  const reviews = getReviews();
  const filtered = reviews.filter((r) => !ids.includes(r.id));
  saveReviewsList(filtered);
};

export const bulkUpdateReviewStatus = (ids: string[], status: 'approved' | 'pending'): void => {
  const reviews = getReviews();
  const updated = reviews.map((r) => (ids.includes(r.id) ? { ...r, status } : r));
  saveReviewsList(updated);
};
