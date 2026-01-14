"use client";

import * as React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useTheme } from "next-themes";
import type { Stripe, StripeElementsOptions, Appearance } from "@stripe/stripe-js";

interface StripeProviderProps {
    publishableKey: string;
    clientSecret: string;
    children: React.ReactNode;
}

// Cache the stripe promise outside the component to avoid reloading on navigation
const stripePromiseCache = new Map<string, Promise<Stripe | null>>();

function getStripePromise(publishableKey: string): Promise<Stripe | null> {
    if (!stripePromiseCache.has(publishableKey)) {
        stripePromiseCache.set(publishableKey, loadStripe(publishableKey));
    }
    return stripePromiseCache.get(publishableKey)!;
}

// Provider component that wraps children with Stripe Elements context
export function StripeProvider({ publishableKey, clientSecret, children }: StripeProviderProps) {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    // Avoid hydration mismatch - only render after mount
    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Initialize stripe synchronously using the cached promise
    const stripePromise = React.useMemo(
        () => (publishableKey ? getStripePromise(publishableKey) : null),
        [publishableKey]
    );

    // Theme-aware appearance using CSS variables
    const appearance: Appearance = React.useMemo(() => {
        const isDark = resolvedTheme === "dark";

        return {
            theme: isDark ? "night" : "stripe",
            variables: {
                colorPrimary: "hsl(var(--primary))",
                colorBackground: "hsl(var(--card))",
                colorText: "hsl(var(--foreground))",
                colorDanger: "hsl(var(--destructive))",
                fontFamily: "system-ui, sans-serif",
                borderRadius: "8px",
            },
        };
    }, [resolvedTheme]);

    const options: StripeElementsOptions = {
        clientSecret,
        appearance,
    };

    if (!stripePromise || !clientSecret || !mounted) {
        return null;
    }

    return (
        <Elements key={resolvedTheme} stripe={stripePromise} options={options}>
            {children}
        </Elements>
    );
}
