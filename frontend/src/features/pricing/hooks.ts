import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pricingApi } from './api';
import type { PricingPlan } from './types';
// import { useToast } from '@/hooks/use-toast'; 

export const useCreatePlan = () => {
    const queryClient = useQueryClient();
    // const { toast } = useToast(); 

    return useMutation({
        mutationFn: (data: Partial<PricingPlan>) => pricingApi.createPlan(data),
        onSuccess: () => {
            // toast({ title: "Success", description: "Plan created successfully" });
            queryClient.invalidateQueries({ queryKey: ['plans'] });
        },
        onError: (error: any) => {
            // toast({ title: "Error", description: error.response?.data?.error || "Failed to create plan", variant: "destructive" });
            console.error("Failed to create plan", error);
        }
    });
};

export const usePlans = (_productId: string) => {
    // Implement query hook later
};
