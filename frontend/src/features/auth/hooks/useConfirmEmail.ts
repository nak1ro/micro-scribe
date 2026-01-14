"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "./useAuth";
import { authApi } from "../api";
import type { AuthError } from "../types";

export type ConfirmationState = "verifying" | "success" | "error";

export function useConfirmEmail() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useAuth();

    const [state, setState] = useState<ConfirmationState>("verifying");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const userId = searchParams.get("userId");
    const token = searchParams.get("token");

    useEffect(() => {
        const confirmEmail = async () => {
            if (!userId || !token) {
                setState("error");
                setErrorMessage("Invalid confirmation link. Missing required parameters.");
                return;
            }

            try {
                await authApi.confirmEmail(userId, token);
                await authApi.refreshSession();
                setState("success");

                if (user) {
                    redirectTimeoutRef.current = setTimeout(() => {
                        router.push("/dashboard");
                    }, 2000);
                }
            } catch (error: unknown) {
                setState("error");
                const authError = error as { response?: { data?: AuthError } };
                setErrorMessage(
                    authError.response?.data?.detail ||
                    authError.response?.data?.message ||
                    "Verification failed. The link may have expired."
                );
            }
        };

        confirmEmail();

        // Cleanup timeout on unmount
        return () => {
            if (redirectTimeoutRef.current) {
                clearTimeout(redirectTimeoutRef.current);
            }
        };
    }, [userId, token, user, router]);

    return {
        state,
        errorMessage,
        isLoggedIn: !!user,
    };
}
