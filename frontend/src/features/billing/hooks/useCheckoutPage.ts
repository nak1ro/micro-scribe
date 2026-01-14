import * as React from "react";
import { useBillingConfig, useSetupIntent } from "./useBilling";
import type { BillingInterval } from "../types";
import { pricingConfig } from "@/features/marketing/pricing/data";

interface UseCheckoutPageProps {
    isVerified: boolean;
}

interface UseCheckoutPageReturn {
    // Interval state
    interval: BillingInterval;
    setInterval: (interval: BillingInterval) => void;

    // Billing config
    config: { publishableKey: string } | undefined;
    configLoading: boolean;

    // SetupIntent
    clientSecret: string | undefined;
    setupPending: boolean;
    setupError: boolean;
    retrySetup: () => void;

    // Derived pricing
    price: number;
    period: string;
    totalToday: number;
}

// Manages checkout page state and SetupIntent synchronization
export function useCheckoutPage({ isVerified }: UseCheckoutPageProps): UseCheckoutPageReturn {
    const [interval, setInterval] = React.useState<BillingInterval>("Monthly");

    const { data: config, isLoading: configLoading } = useBillingConfig();
    const setupIntentMutation = useSetupIntent();

    // Create SetupIntent on mount and when interval changes
    React.useEffect(() => {
        if (!isVerified) return;
        setupIntentMutation.mutate({ interval });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [interval, isVerified]);

    // Derived pricing values
    const price = interval === "Monthly" ? pricingConfig.monthly.pro : pricingConfig.annual.pro;
    const period = interval === "Monthly" ? "/month" : "/month, billed annually";
    const annualTotal = pricingConfig.annual.pro * 12;
    const totalToday = interval === "Monthly" ? price : annualTotal;

    const retrySetup = React.useCallback(() => {
        setupIntentMutation.mutate({ interval });
    }, [setupIntentMutation, interval]);

    return {
        interval,
        setInterval,
        config,
        configLoading,
        clientSecret: setupIntentMutation.data?.clientSecret,
        setupPending: setupIntentMutation.isPending,
        setupError: setupIntentMutation.isError,
        retrySetup,
        price,
        period,
        totalToday,
    };
}
