"use client";

import * as React from "react";
import { useUsage } from "@/hooks/useUsage";
import { PlanType } from "@/types/api/usage";
import { billingCopy } from "../data";
import { CurrentPlanSection } from "./CurrentPlanSection";
import { SavingsCallout } from "./SavingsCallout";
import { LockedFeatures } from "./LockedFeatures";
import { CancelSubscriptionSection } from "./CancelSubscriptionSection";

// Main billing page content orchestrating all billing components
export function BillingContent() {
    const { data: usage } = useUsage();

    // Map backend PlanType to local type
    const planType = usage?.planType === PlanType.Pro ? "Pro" : "Free";
    const isPro = planType === "Pro";

    // Mock billing cycle (would come from backend in real implementation)
    const billingCycle: "monthly" | "annual" = "monthly";
    const nextBillingDate = isPro ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined;

    // Action handlers (placeholders for Stripe integration)
    const handleUpgrade = () => {
        console.log("Redirecting to Stripe Checkout...");
        // TODO: Integrate with Stripe Checkout
    };

    const handleSwitchToAnnual = () => {
        console.log("Redirecting to Stripe for billing change...");
        // TODO: Integrate with Stripe billing portal
    };

    const handleCancel = () => {
        console.log("Processing cancellation...");
        // TODO: Integrate with backend cancellation endpoint
    };

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
                planType={planType}
                billingCycle={isPro ? billingCycle : undefined}
                nextBillingDate={nextBillingDate}
                onUpgrade={handleUpgrade}
            />

            {/* Savings callout (only for monthly Pro users) */}
            <SavingsCallout
                isVisible={isPro && billingCycle === "monthly"}
                onSwitchToAnnual={handleSwitchToAnnual}
            />

            {/* Locked features upsell (Free users only) */}
            {!isPro && <LockedFeatures onUpgrade={handleUpgrade} />}

            {/* Cancel subscription (Pro users only) */}
            {isPro && <CancelSubscriptionSection onCancel={handleCancel} />}
        </div>
    );
}
