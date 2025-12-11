import { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { handleApiError } from './error-handler';

// Custom event for unauthorized access (can be listened to by AuthProvider)
export const UNAUTHORIZED_EVENT = 'api:unauthorized';

export function setupInterceptors(instance: AxiosInstance): void {
    // Response interceptor
    instance.interceptors.response.use(
        (response: AxiosResponse) => {
            return response;
        },
        (error: AxiosError) => {
            // Handle 401 Unauthorized globally
            if (error.response?.status === 401) {
                // Dispatch event so the UI can redirect to login or clear state
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
                }
            }

            // Re-throw the error so specific calls can handle it too if needed
            // We attach the parsed error object to the Promise rejection for easier usage
            const parsedError = handleApiError(error);
            return Promise.reject(parsedError);
        }
    );
}
