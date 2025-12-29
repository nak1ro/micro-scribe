"use client";

import * as React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import type { Stripe, StripeElementsOptions } from "@stripe/stripe-js";

interface StripeProviderProps {
    publishableKey: string;
    clientSecret: string;
    children: React.ReactNode;
}

// Provider component that wraps children with Stripe Elements context
export function StripeProvider({ publishableKey, clientSecret, children }: StripeProviderProps) {
    const [stripePromise, setStripePromise] = React.useState<Promise<Stripe | null> | null>(null);

    React.useEffect(() => {
        if (publishableKey) {
            setStripePromise(loadStripe(publishableKey));
        }
    }, [publishableKey]);

    const options: StripeElementsOptions = {
        clientSecret,
        appearance: {
            theme: "stripe",
            variables: {
                colorPrimary: "hsl(252 100% 68%)",
                colorBackground: "hsl(0 0% 100%)",
                colorText: "hsl(0 0% 15%)",
                colorDanger: "hsl(0 84% 60%)",
                fontFamily: "system-ui, sans-serif",
                borderRadius: "8px",
            },
        },
    };

    if (!stripePromise || !clientSecret) {
        return null;
    }

    return (
        <Elements stripe={stripePromise} options={options}>
            {children}
        </Elements>
    );
}
