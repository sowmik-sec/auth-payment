import { api } from '@/lib/api';
import type { PricingPlan } from './types';

export const pricingApi = {
    createPlan: async (data: Partial<PricingPlan>) => {
        const response = await api.post<PricingPlan>('/admin/plans', data);
        return response.data;
    },

    getPlans: async (productId?: string) => {
        const query = productId ? `?productId=${productId}` : '';
        const response = await api.get<PricingPlan[]>(`/pricing/plans${query}`);
        return response.data;
    },

    getPlan: async (planId: string) => {
        const response = await api.get<PricingPlan>(`/pricing/plans/${planId}`);
        return response.data;
    },

    calculatePrice: async (_planId: string, _couponCode?: string) => {
        // Logic for consumer side later
    },

    updatePlan: async (id: string, data: { name: string; description: string; price?: number; interval?: string }) => {
        const response = await api.put<{ status: string }>(`/admin/plans/${id}`, data);
        return response.data;
    },

    deletePlan: async (id: string) => {
        const response = await api.delete<{ status: string }>(`/admin/plans/${id}`);
        return response.data;
    }
};
