import { api } from '@/lib/api';

export const paymentApi = {
    initiateCheckout: async (planId: string, affiliateCode?: string, amount?: number, quantity?: number) => {
        const response = await api.post<{ client_secret: string }>('/payment/checkout', {
            plan_id: planId,
            affiliate_code: affiliateCode,
            amount,
            quantity
        });
        return response.data;
    }
};
