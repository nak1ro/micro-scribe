"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSubscriptionStatus, useCustomerPortal } from "@/features/billing";
import { SubscriptionPlan, SubscriptionStatus } from "@/types/api/billing";
import { billingCopy } from "../data";
import { CurrentPlanSection } from "./CurrentPlanSection";
import { SavingsCallout } from "./SavingsCallout";
import { LockedFeatures } from "./LockedFeatures";
import { CancelSubscriptionSection } from "./CancelSubscriptionSection";
import { Spinner } from "@/components/ui";

// Main billing page content orchestrating all billing components
export function BillingContent() {
    const router = useRouter();
    const { data: subscription, isLoading } = useSubscriptionStatus();
    const portalMutation = useCustomerPortal();

    const isPro = subscription?.plan === SubscriptionPlan.Pro;
    const isActive = subscription?.status === SubscriptionStatus.Active;

    // Determine billing cycle from subscription end date
    const nextBillingDate = subscription?.currentPeriodEnd
        ? new Date(subscription.currentPeriodEnd)
        : undefined;

    const handleUpgrade = () => {
        router.push("/account/checkout");
    };

    const handleSwitchToAnnual = () => {
        // Open Stripe portal for billing changes
        portalMutation.mutate({ returnUrl: window.location.href });
    };

    const handleCancel = () => {
        // Open Stripe portal for cancellation
        portalMutation.mutate({ returnUrl: window.location.href });
    };

    if (isLoading) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-8 flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground">
                    {billingCopy.pageTitle}
                </h1>
                <p className="mt-1 text-muted-foreground">
                    {billingCopy.pageDescription}
                </p>
            </div>

            {/* Current plan overview */}
            <CurrentPlanSection
                planType={isPro ? "Pro" : "Free"}
                nextBillingDate={nextBillingDate}
                cancelAtPeriodEnd={subscription?.cancelAtPeriodEnd}
                onUpgrade={handleUpgrade}
            />

            {/* Savings callout (only for Pro users) */}
            <SavingsCallout
                isVisible={isPro && isActive}
                onSwitchToAnnual={handleSwitchToAnnual}
            />

            {/* Locked features upsell (Free users only) */}
            {!isPro && <LockedFeatures onUpgrade={handleUpgrade} />}

            {/* Cancel subscription (Pro users only) */}
            {isPro && isActive && <CancelSubscriptionSection onCancel={handleCancel} />}
        </div>
    );
}
