"use client";

import * as React from "react";
import { useStripe, useElements } from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";
import { useSubscribe } from "./useBilling";
import { authApi } from "@/features/auth/api/client";
import type { BillingInterval } from "../types";
import type { StripeError } from "@stripe/stripe-js";

interface UseCheckoutSubmitProps {
    interval: BillingInterval;
}

interface UseCheckoutSubmitReturn {
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    isProcessing: boolean;
    errorMessage: string | null;
    isReady: boolean;
}

// Extended error type for setup_intent_unexpected_state
type SetupIntentError = StripeError & {
    setup_intent?: {
        payment_method?: string;
    };
};

// Handles checkout form submission logic
export function useCheckoutSubmit({ interval }: UseCheckoutSubmitProps): UseCheckoutSubmitReturn {
    const stripe = useStripe();
    const elements = useElements();
    const router = useRouter();
    const subscribeMutation = useSubscribe();

    const [isProcessing, setIsProcessing] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

    const handleSubmit = React.useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsProcessing(true);
        setErrorMessage(null);

        const { setupIntent, error } = await stripe.confirmSetup({
            elements,
            confirmParams: { return_url: window.location.href },
            redirect: "if_required",
        });

        if (error) {
            // Handle double-click: SetupIntent already succeeded
            if (error.code === "setup_intent_unexpected_state") {
                const setupError = error as SetupIntentError;
                const paymentMethodId = setupError.setup_intent?.payment_method;

                if (paymentMethodId) {
                    try {
                        await subscribeMutation.mutateAsync({ paymentMethodId, interval });
                        await authApi.refreshSession();
                        router.push("/dashboard?upgrade=success");
                        return;
                    } catch {
                        setErrorMessage("Failed to create subscription. Please try again.");
                        setIsProcessing(false);
                        return;
                    }
                }
            }
            setErrorMessage(error.message ?? "An error occurred");
            setIsProcessing(false);
            return;
        }

        if (setupIntent?.payment_method) {
            try {
                await subscribeMutation.mutateAsync({
                    paymentMethodId: setupIntent.payment_method as string,
                    interval,
                });
                await authApi.refreshSession();
                router.push("/dashboard?upgrade=success");
            } catch {
                setErrorMessage("Failed to create subscription. Please try again.");
                setIsProcessing(false);
            }
        }
    }, [stripe, elements, interval, subscribeMutation, router]);

    return {
        handleSubmit,
        isProcessing,
        errorMessage,
        isReady: !!stripe,
    };
}
