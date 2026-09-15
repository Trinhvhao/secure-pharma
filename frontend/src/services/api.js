/**
 * Axios Client with interceptors
 */
import axios from 'axios';

// Create axios instance
const api = axios.create({
    baseURL: '/api', // Using Vite proxy
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle network errors
        if (!error.response) {
            console.error('Network error:', error.message);
            return Promise.reject({
                response: {
                    status: 0,
                    data: {
                        success: false,
                        error: {
                            code: 'NETWORK_ERROR',
                            message: 'Không thể kết nối đến server'
                        }
                    }
                }
            });
        }

        // Handle 401 - unauthorized
        if (error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Redirect to login if not already there
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default api;
