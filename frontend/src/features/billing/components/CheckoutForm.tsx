"use client";

import * as React from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { useSubscribe } from "@/features/billing";
import type { BillingInterval } from "@/types/api/billing";

interface CheckoutFormProps {
    interval: BillingInterval;
}

// Payment form with Stripe Elements
export function CheckoutForm({ interval }: CheckoutFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const router = useRouter();
    const subscribeMutation = useSubscribe();

    const [isProcessing, setIsProcessing] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setErrorMessage(null);

        // Confirm the SetupIntent
        const { setupIntent, error } = await stripe.confirmSetup({
            elements,
            confirmParams: {
                return_url: window.location.href,
            },
            redirect: "if_required",
        });

        if (error) {
            setErrorMessage(error.message ?? "An error occurred");
            setIsProcessing(false);
            return;
        }

        if (setupIntent && setupIntent.payment_method) {
            // Create subscription on backend
            try {
                await subscribeMutation.mutateAsync({
                    paymentMethodId: setupIntent.payment_method as string,
                    interval,
                });
                router.push("/dashboard?upgrade=success");
            } catch {
                setErrorMessage("Failed to create subscription. Please try again.");
                setIsProcessing(false);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />

            {errorMessage && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    {errorMessage}
                </div>
            )}

            <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={!stripe || isProcessing}
                isLoading={isProcessing}
            >
                {isProcessing ? "Processing..." : "Subscribe Now"}
            </Button>
        </form>
    );
}
