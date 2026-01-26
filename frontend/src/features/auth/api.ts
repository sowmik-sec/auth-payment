import { api } from '@/lib/api';

export interface User {
    id: string;
    email: string;
    full_name: string;
}

export const authApi = {
    login: async (email: string, password: string) => {
        const { data } = await api.post('/auth/login', { email, password });
        return data; // returns access_token, etc.
    },
    register: async (email: string, password: string, full_name: string) => {
        const { data } = await api.post('/auth/register', { email, password, full_name });
        return data;
    },
    logout: async () => {
        await api.post('/auth/logout'); // We need to implement this on backend too!
    },
    getMe: async () => {
        const { data } = await api.get<User>('/users/me'); // We need to implement this on backend too!
        return data;
    }
};
