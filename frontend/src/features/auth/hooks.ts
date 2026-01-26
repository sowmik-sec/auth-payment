import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from './api';
import { useNavigate } from '@tanstack/react-router';

export const useUser = () => {
    return useQuery({
        queryKey: ['me'],
        queryFn: authApi.getMe,
        retry: false,
    });
};

export const useLogin = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: ({ email, password }: any) => authApi.login(email, password),
        onSuccess: () => {
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
        onSuccess: () => {
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
            queryClient.setQueryData(['me'], null);
            navigate({ to: '/login' });
        }
    })
}
