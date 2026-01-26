import { api } from '@/lib/api';

export const paymentApi = {
    initiateCheckout: async (planId: string) => {
        const response = await api.post<{ client_secret: string }>('/payment/checkout', { plan_id: planId });
        return response.data;
    }
};
