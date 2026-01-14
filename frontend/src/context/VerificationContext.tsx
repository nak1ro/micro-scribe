"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { authApi } from "@/features/auth/api/client";

export interface VerificationContextType {
    isVerified: boolean;
    isLoading: boolean;
    isModalOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
    resendEmail: () => Promise<void>;
    resendLoading: boolean;
    resendSuccess: boolean;
}

export const VerificationContext = createContext<VerificationContextType | undefined>(undefined);

export function VerificationProvider({ children }: { children: ReactNode }) {
    const { user, isLoading } = useAuth();
    const isVerified = user?.emailConfirmed ?? false;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);

    const openModal = useCallback(() => setIsModalOpen(true), []);
    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setResendSuccess(false);
    }, []);

    const resendEmail = useCallback(async () => {
        if (!user?.email) return;
        setResendLoading(true);
        try {
            await authApi.resendConfirmation(user.email);
            setResendSuccess(true);
        } catch {
            // Silent fail for security
        } finally {
            setResendLoading(false);
        }
    }, [user?.email]);

    return (
        <VerificationContext.Provider
            value={{
                isVerified,
                isLoading,
                isModalOpen,
                openModal,
                closeModal,
                resendEmail,
                resendLoading,
                resendSuccess,
            }}
        >
            {children}
        </VerificationContext.Provider>
    );
}

export function useEmailVerification() {
    const context = useContext(VerificationContext);
    if (context === undefined) {
        throw new Error("useEmailVerification must be used within a VerificationProvider");
    }
    return context;
}
