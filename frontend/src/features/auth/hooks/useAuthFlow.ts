"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";
import type { AuthError } from "../types";

// Helper to extract error message from API errors
function getErrorMessage(error: unknown, fallback: string): string {
    const authError = error as { status?: number; message?: string; response?: { data?: AuthError } };

    // Check for axios-style error response
    if (authError.response?.data?.detail) {
        return authError.response.data.detail;
    }
    if (authError.response?.data?.message) {
        return authError.response.data.message;
    }

    // Check for Error instance
    if (error instanceof Error) {
        return error.message;
    }

    return fallback;
}

// HTTP status-based error messages
function getStatusBasedMessage(error: unknown, context: "login" | "signup"): string {
    const authError = error as { status?: number; response?: { status?: number } };
    const status = authError.status ?? authError.response?.status;

    if (context === "signup") {
        if (status === 409) {
            return "An account with this email already exists. Please log in instead.";
        }
        if (status && status >= 500) {
            return "Registration failed. Please try again later.";
        }
        return getErrorMessage(error, "Registration failed. Please try again.");
    }

    return getErrorMessage(error, "Login failed. Please try again.");
}

interface AuthFlowOptions {
    redirectTo?: string;
}

export function useAuthFlow(options: AuthFlowOptions = {}) {
    const { redirectTo = "/dashboard" } = options;
    const router = useRouter();
    const { login, register } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = useCallback(async (data: { email: string; password: string }) => {
        setError(null);
        setIsLoading(true);
        try {
            await login({ email: data.email, password: data.password });
            router.push(redirectTo);
        } catch (err: unknown) {
            setError(getStatusBasedMessage(err, "login"));
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [login, router, redirectTo]);

    const handleSignUp = useCallback(async (data: { email: string; password: string }) => {
        setError(null);
        setIsLoading(true);
        try {
            await register({
                email: data.email,
                password: data.password,
                confirmPassword: data.password,
            });
            router.push(redirectTo);
        } catch (err: unknown) {
            setError(getStatusBasedMessage(err, "signup"));
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [register, router, redirectTo]);

    return {
        error,
        isLoading,
        handleLogin,
        handleSignUp,
    };
}
