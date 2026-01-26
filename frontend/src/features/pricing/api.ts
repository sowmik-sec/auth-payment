import { api } from '@/lib/api';
import type { PricingPlan } from './types';

export const pricingApi = {
    createPlan: async (data: Partial<PricingPlan>) => {
        const response = await api.post<PricingPlan>('/admin/plans', data);
        return response.data;
    },

    getPlans: async (productId: string) => {
        const response = await api.get<PricingPlan[]>(`/pricing/plans?productId=${productId}`);
        return response.data;
    },

    calculatePrice: async (_planId: string, _couponCode?: string) => {
        // Logic for consumer side later
    }
};
