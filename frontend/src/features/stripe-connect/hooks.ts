import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stripeConnectApi } from './api';
import { toast } from 'sonner';

export const useStripeConnectStatus = () => {
    return useQuery({
        queryKey: ['stripe-connect-status'],
        queryFn: stripeConnectApi.getStatus,
        retry: false,
    });
};

export const useConnectStripe = () => {
    return useMutation({
        mutationFn: stripeConnectApi.getOAuthUrl,
        onSuccess: (data) => {
            // Redirect to Stripe
            window.location.href = data.url;
        },
        onError: (error) => {
            toast.error('Failed to initiate Stripe connection');
            console.error(error);
        }
    });
};

export const useStripeDashboard = () => {
    return useMutation({
        mutationFn: stripeConnectApi.getDashboardLink,
        onSuccess: (data) => {
            window.open(data.url, '_blank');
        },
        onError: (error) => {
            toast.error('Failed to get dashboard link');
            console.error(error);
        }
    });
};

export const useDisconnectStripe = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: stripeConnectApi.disconnect,
        onSuccess: () => {
            toast.success('Disconnected from Stripe');
            queryClient.invalidateQueries({ queryKey: ['stripe-connect-status'] });
        },
        onError: (error) => {
            toast.error('Failed to disconnect');
            console.error(error);
        }
    });
};
