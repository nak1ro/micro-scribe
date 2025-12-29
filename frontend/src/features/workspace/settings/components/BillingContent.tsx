"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
    useSubscriptionStatus,
    useCustomerPortal,
    useChangePlan,
    useCancelSubscription
} from "@/features/billing";
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
    const changePlanMutation = useChangePlan();
    const cancelMutation = useCancelSubscription();

    const isPro = subscription?.plan === "Pro";
    const isActive = subscription?.status === "Active";
    const isCanceling = subscription?.cancelAtPeriodEnd === true;

    // Determine billing cycle from subscription end date
    const nextBillingDate = subscription?.currentPeriodEnd
        ? new Date(subscription.currentPeriodEnd)
        : undefined;

    const handleUpgrade = () => {
        router.push("/account/checkout");
    };

    const handleSwitchToAnnual = () => {
        changePlanMutation.mutate({ newInterval: "Yearly" });
    };

    const handleCancel = () => {
        cancelMutation.mutate(false);
    };

    const handleManagePayment = () => {
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
                cancelAtPeriodEnd={isCanceling}
                onUpgrade={handleUpgrade}
                onManagePayment={handleManagePayment}
                isManaging={portalMutation.isPending}
            />

            {/* Savings callout (only for Pro users on monthly) */}
            <SavingsCallout
                isVisible={isPro && isActive && !isCanceling}
                onSwitchToAnnual={handleSwitchToAnnual}
                isLoading={changePlanMutation.isPending}
            />

            {/* Locked features upsell (Free users only) */}
            {!isPro && <LockedFeatures onUpgrade={handleUpgrade} />}

            {/* Cancel subscription (Pro users only) */}
            {isPro && isActive && !isCanceling && (
                <CancelSubscriptionSection
                    onCancel={handleCancel}
                    isLoading={cancelMutation.isPending}
                />
            )}

            {/* Show canceling status */}
            {isCanceling && (
                <div className="rounded-xl border border-warning/30 bg-warning/5 p-6">
                    <h3 className="text-lg font-semibold text-foreground">
                        Subscription Ending
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Your subscription will end on {nextBillingDate?.toLocaleDateString()}.
                        You can reactivate anytime before this date.
                    </p>
                    <button
                        onClick={handleManagePayment}
                        className="mt-3 text-sm font-medium text-primary hover:underline"
                    >
                        Reactivate Subscription →
                    </button>
                </div>
            )}
        </div>
    );
}
