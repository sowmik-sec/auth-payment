import { api } from '@/lib/api';

export interface Wallet {
    id: string;
    balance: number;
    currency: string;
}

export interface WalletTransaction {
    id: string;
    amount: number;
    type: 'sale' | 'payout' | 'refund' | 'commission';
    description: string;
    created_at: string;
}

export const walletApi = {
    getBalance: async () => {
        const response = await api.get<Wallet>('/wallet/balance');
        return response.data;
    },
    getTransactions: async () => {
        const response = await api.get<WalletTransaction[]>('/wallet/transactions');
        return response.data;
    },
    requestPayout: async (amount: number, method: string) => {
        const response = await api.post('/wallet/payouts', { amount, method });
        return response.data;
    }
};
