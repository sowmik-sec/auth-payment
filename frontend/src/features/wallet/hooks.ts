import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletApi } from './api';

export const useWallet = () => {
    return useQuery({
        queryKey: ['wallet'],
        queryFn: walletApi.getBalance,
    });
};

export const useTransactions = () => {
    return useQuery({
        queryKey: ['transactions'],
        queryFn: walletApi.getTransactions,
    });
};

export const useRequestPayout = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ amount, method }: { amount: number, method: string }) =>
            walletApi.requestPayout(amount, method),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wallet'] });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
        },
    });
};
