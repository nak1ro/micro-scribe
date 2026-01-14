"use client";

import { PaymentElement } from "@stripe/react-stripe-js";
import { Button, Alert } from "@/components/ui";
import { useCheckoutSubmit } from "@/features/billing";
import type { BillingInterval } from "../../types";

interface CheckoutFormProps {
    interval: BillingInterval;
}

// Payment form with Stripe Elements
export function CheckoutForm({ interval }: CheckoutFormProps) {
    const { handleSubmit, isProcessing, errorMessage, isReady } = useCheckoutSubmit({ interval });

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />

            {errorMessage && (
                <Alert variant="destructive">
                    {errorMessage}
                </Alert>
            )}

            <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={!isReady || isProcessing}
                isLoading={isProcessing}
            >
                {isProcessing ? "Processing..." : "Subscribe Now"}
            </Button>
        </form>
    );
}
