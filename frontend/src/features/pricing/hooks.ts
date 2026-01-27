import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pricingApi } from './api';
import type { PricingPlan } from './types';

// ... (existing useCreatePlan code)

export const useCreatePlan = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<PricingPlan>) => pricingApi.createPlan(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plans'] });
        },
        onError: (error: any) => {
            console.error("Failed to create plan", error);
        }
    });
};

export const usePlans = (productId?: string) => {
    return useQuery({
        queryKey: ['plans', productId],
        queryFn: () => pricingApi.getPlans(productId),
    });
};

export const usePlan = (planId: string) => {
    return useQuery({
        queryKey: ['plan', planId],
        queryFn: () => pricingApi.getPlan(planId),
        enabled: !!planId,
    });
};
