import { Product, VariationItem } from '../types';

export interface VariationDimensions {
  planLabel: string;
  validityLabel: string;
  plans: string[];
  validities: string[];
}

export const getVariationDimensions = (product: Product): VariationDimensions => {
  const planLabel = product.variation || 'Plan';
  const validityLabel = product.variation2 || 'Validity';

  let plans: string[] = product.variationOptions?.filter(Boolean) || [];
  let validities: string[] = product.variation2Options?.filter(Boolean) || [];

  if (product.variationList && product.variationList.length > 0) {
    const extractedPlans = new Set<string>(plans);
    const extractedValidities = new Set<string>(validities);

    product.variationList.forEach((v) => {
      let p = '';
      let val = '';

      if (v.name.includes(',')) {
        const parts = v.name.split(',').map((s) => s.trim());
        p = parts[0];
        val = parts[1];
      } else if (v.name.includes('|')) {
        const parts = v.name.split('|').map((s) => s.trim());
        p = parts[0];
        val = parts[1];
      } else if (v.name.includes(' - ')) {
        const parts = v.name.split(' - ').map((s) => s.trim());
        p = parts[0];
        val = parts[1];
      } else {
        const isValidity = /month|year|day|days|months|years|মেয়াদ|মাস|বছর/i.test(v.name);
        if (isValidity) {
          val = v.name;
        } else {
          p = v.name;
        }
      }

      if (p) extractedPlans.add(p);
      if (val) extractedValidities.add(val);
    });

    plans = Array.from(extractedPlans);
    validities = Array.from(extractedValidities);
  }

  if (plans.length === 0 && product.variationList && product.variationList.length > 0) {
    plans = product.variationList.map((v) => v.name);
  }

  return { planLabel, validityLabel, plans, validities };
};

export const findMatchingVariation = (
  product: Product,
  plan: string,
  validity?: string
): VariationItem | null => {
  if (!product.variationList || product.variationList.length === 0) return null;

  if (plan && validity) {
    const pLower = plan.toLowerCase();
    const vLower = validity.toLowerCase();

    const match = product.variationList.find((v) => {
      const nameLower = v.name.toLowerCase();
      return nameLower.includes(pLower) && nameLower.includes(vLower);
    });
    if (match) return match;
  }

  if (plan) {
    const pLower = plan.toLowerCase();
    const match = product.variationList.find((v) => v.name.toLowerCase().includes(pLower));
    if (match) return match;
  }

  if (validity) {
    const vLower = validity.toLowerCase();
    const match = product.variationList.find((v) => v.name.toLowerCase().includes(vLower));
    if (match) return match;
  }

  return product.variationList.find((v) => v.isDefault) || product.variationList[0];
};
