import { api } from '@/lib/api';

export interface ConnectionStatus {
    connected: boolean;
    stripe_connect_id?: string;
    status?: string;
}

export const stripeConnectApi = {
    getOAuthUrl: async () => {
        const { data } = await api.get<{ url: string }>('/stripe/connect/oauth');
        return data;
    },
    getStatus: async () => {
        const { data } = await api.get<ConnectionStatus>('/stripe/connect/status');
        return data;
    },
    getDashboardLink: async () => {
        const { data } = await api.post<{ url: string }>('/stripe/connect/dashboard');
        return data;
    },
    disconnect: async () => {
        // Not implemented on backend yet, but placeholder
        // const { data } = await api.post('/stripe/connect/disconnect');
        // return data;
    }
};
