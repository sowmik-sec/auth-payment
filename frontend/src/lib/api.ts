import axios from 'axios';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
    withCredentials: true, // Important for cookies
});

// Response interceptor for refreshing tokens
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Call refresh endpoint
                // valid refresh token is expected in httpOnly cookie
                await api.post('/auth/refresh');

                // Retry original request
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed (token expired/invalid), redirect to login
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);
