import axios from 'axios';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
    withCredentials: true, // Important for cookies
});

// Response interceptor for refreshing tokens
// Request interceptor to attach token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
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
                const { data } = await api.post('/auth/refresh');

                // Save new access token
                if (data.access_token) {
                    localStorage.setItem('access_token', data.access_token);
                    // Update header for retry
                    originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
                }

                // Retry original request
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed (token expired/invalid)
                localStorage.removeItem('access_token'); // Clear invalid token
                // Return the original 401 error so components know it's an auth failure
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
);
