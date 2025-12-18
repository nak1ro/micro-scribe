"use client";

import * as React from "react";
import { useUsage } from "@/hooks/useUsage";
import { PlanType } from "@/types/api/usage";
import { SubscriptionPlan } from "../types";
import { planTiers, mockBillingHistory, subscriptionCopy } from "../data";
import { PlanCard } from "./PlanCard";
import { BillingHistorySection } from "./BillingHistorySection";
import { SubscriptionActions } from "./SubscriptionActions";

// Main subscription page content orchestrating all subscription components
export function SubscriptionContent() {
    const { data: usage } = useUsage();

    // Map backend PlanType to local SubscriptionPlan
    const currentPlan = usage?.planType === PlanType.Pro
        ? SubscriptionPlan.Pro
        : SubscriptionPlan.Free;

    const isPro = currentPlan === SubscriptionPlan.Pro;

    // Action handlers (UI placeholders for Stripe integration)
    const handleUpgrade = () => {
        console.log("Redirecting to Stripe Checkout...");
        // TODO: Integrate with Stripe Checkout
    };

    const handleDowngrade = () => {
        console.log("Processing downgrade request...");
        // TODO: Integrate with backend downgrade endpoint
    };

    const handleCancel = () => {
        console.log("Processing cancellation...");
        // TODO: Integrate with backend cancellation endpoint
    };

    const handleManageBilling = () => {
        console.log("Redirecting to Stripe Billing Portal...");
        // TODO: Integrate with Stripe Customer Portal
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground">
                    {subscriptionCopy.pageTitle}
                </h1>
                <p className="mt-1 text-muted-foreground">
                    {subscriptionCopy.pageDescription}
                </p>
            </div>

            {/* Plan comparison cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {planTiers.map((tier) => (
                    <PlanCard
                        key={tier.plan}
                        tier={tier}
                        currentPlan={currentPlan}
                        onUpgrade={handleUpgrade}
                        onDowngrade={handleDowngrade}
                    />
                ))}
            </div>

            {/* Subscription actions (only for Pro users) */}
            <SubscriptionActions
                currentPlan={currentPlan}
                onCancel={handleCancel}
                onManageBilling={handleManageBilling}
            />

            {/* Billing history (only for Pro users with history) */}
            {isPro && (
                <BillingHistorySection history={mockBillingHistory} />
            )}
        </div>
    );
}
