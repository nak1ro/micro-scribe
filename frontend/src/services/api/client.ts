import axios from 'axios';
import { setupInterceptors } from './interceptors';

// Create a new axios instance with custom config
export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Critical for cookie-based auth
    timeout: 30000, // 30s timeout
});

// Apply interceptors
setupInterceptors(apiClient);
