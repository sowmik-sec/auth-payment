import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from './api';
import { useNavigate } from '@tanstack/react-router';

export const useUser = () => {
    const token = localStorage.getItem('access_token');
    return useQuery({
        queryKey: ['me'],
        queryFn: authApi.getMe,
        retry: false,
        enabled: !!token, // Only fetch if we have a token
    });
};

export const useLogin = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: ({ email, password }: any) => authApi.login(email, password),
        onSuccess: (data) => {
            localStorage.setItem('access_token', data.access_token);
            queryClient.invalidateQueries({ queryKey: ['me'] });
            navigate({ to: '/' });
        },
    });
};

export const useRegister = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: ({ email, password, full_name }: any) => authApi.register(email, password, full_name),
        onSuccess: (data) => {
            localStorage.setItem('access_token', data.access_token);
            queryClient.invalidateQueries({ queryKey: ['me'] });
            navigate({ to: '/' });
        },
    });
};

export const useLogout = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: authApi.logout,
        onSuccess: () => {
            localStorage.removeItem('access_token');
            queryClient.setQueryData(['me'], null);
            navigate({ to: '/login' });
        }
    })
}
