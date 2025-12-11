import { AxiosError } from 'axios';

export interface ApiError {
    message: string;
    code?: string;
    errors?: Record<string, string[]>;
    status?: number;
}

interface ValidationProblemDetails {
    type: string;
    title: string;
    status: number;
    errors?: Record<string, string[]>;
    traceId?: string;
    detail?: string;
}

export function handleApiError(error: unknown): ApiError {
    if (isAxiosError(error)) {
        const responseData = error.response?.data as ValidationProblemDetails | undefined;
        const status = error.response?.status;

        // Handle RFC 7807 Validation Problem Details
        if (responseData && (responseData.title || responseData.detail)) {
            return {
                message: responseData.detail || responseData.title || 'An error occurred',
                status,
                errors: responseData.errors,
            };
        }

        // Handle standard HTTP errors without body
        if (status === 401) return { message: 'Unauthorized', status };
        if (status === 403) return { message: 'Forbidden', status };
        if (status === 404) return { message: 'Resource not found', status };
        if (status && status >= 500) return { message: 'Server error', status };

        return {
            message: error.message || 'Network error',
            status,
        };
    }

    if (error instanceof Error) {
        return { message: error.message };
    }

    return { message: 'An unknown error occurred' };
}

function isAxiosError(error: unknown): error is AxiosError {
    return (error as AxiosError).isAxiosError;
}
