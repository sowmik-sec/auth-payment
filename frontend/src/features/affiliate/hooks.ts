import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { affiliateApi } from './api';

export const useAffiliateStats = () => {
    return useQuery({
        queryKey: ['affiliateStats'],
        queryFn: affiliateApi.getStats,
    });
};

export const useCreateLink = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ programId, code }: { programId: string, code: string }) =>
            affiliateApi.createLink(programId, code),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['affiliateStats'] });
        },
    });
};

// Temp for testing
export const useCreateProgram = () => {
    return useMutation({
        mutationFn: (rate: number) => affiliateApi.createProgram(rate),
    });
}
