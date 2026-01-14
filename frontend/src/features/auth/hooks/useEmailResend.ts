"use client";

import { useState } from "react";
import { authApi } from "../api";

export function useEmailResend() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleResend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setIsLoading(true);
        try {
            await authApi.resendConfirmation(email);
            setIsSuccess(true);
        } catch {
            // Passive failure - don't reveal if email exists
        } finally {
            setIsLoading(false);
        }
    };

    return {
        email,
        setEmail,
        isLoading,
        isSuccess,
        handleResend,
    };
}
