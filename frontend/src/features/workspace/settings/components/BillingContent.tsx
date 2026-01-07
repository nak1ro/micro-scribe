"use client";

import * as React from "react";
import {
    useSubscriptionStatus,
    useCustomerPortal,
    useChangePlan,
    useCancelSubscription,
    usePaymentMethod,
    useInvoices,
} from "@/features/billing";
import { billingCopy } from "../data";
import { CurrentPlanSection } from "./CurrentPlanSection";
import { PaymentMethodSection } from "./PaymentMethodSection";
import { BillingHistorySection } from "./BillingHistorySection";
import { SavingsCallout } from "./SavingsCallout";
import { LockedFeatures } from "./LockedFeatures";
import { CancelSubscriptionSection } from "./CancelSubscriptionSection";
import { Spinner, ConfirmationDialog } from "@/components/ui";

// Main billing page content orchestrating all billing components
export function BillingContent() {
    const { data: subscription, isLoading } = useSubscriptionStatus();
    const portalMutation = useCustomerPortal();
    const changePlanMutation = useChangePlan();
    const cancelMutation = useCancelSubscription();
    const { data: paymentMethod, isLoading: isLoadingPayment } = usePaymentMethod();
    const { data: invoicesData, isLoading: isLoadingInvoices } = useInvoices();
    const [showAnnualConfirm, setShowAnnualConfirm] = React.useState(false);

    const isPro = subscription?.plan === "Pro";
    const isActive = subscription?.status === "Active";
    const isCanceling = subscription?.cancelAtPeriodEnd === true;

    // Determine billing cycle from subscription end date
    const nextBillingDate = subscription?.currentPeriodEnd
        ? new Date(subscription.currentPeriodEnd)
        : undefined;

    const handleUpgrade = () => {
        // Use full page navigation to avoid COEP policy conflict with Stripe.js
        window.location.href = "/account/checkout";
    };

    const handleSwitchToAnnual = () => {
        setShowAnnualConfirm(true);
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
                interval={subscription?.interval}
            />

            {/* Payment method (Pro users only) */}
            {isPro && (
                <PaymentMethodSection
                    paymentMethod={paymentMethod}
                    onManagePayment={handleManagePayment}
                    isLoading={portalMutation.isPending || isLoadingPayment}
                />
            )}

            {/* Billing history (Pro users only) */}
            {isPro && (
                <BillingHistorySection
                    invoices={invoicesData?.invoices ?? []}
                    hasMore={invoicesData?.hasMore ?? false}
                    isLoading={isLoadingInvoices}
                />
            )}

            {/* Savings callout (only for Pro users on monthly) */}
            <SavingsCallout
                isVisible={isPro && isActive && !isCanceling && subscription?.interval === "Monthly"}
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

            <ConfirmationDialog
                open={showAnnualConfirm}
                onOpenChange={setShowAnnualConfirm}
                title="Switch to Annual Billing?"
                description={
                    <span>
                        You are about to switch to annual billing.
                        You will be <strong>charged immediately</strong> for the pro-rated amount for the remainder of the year.
                    </span>
                }
                confirmText="Switch & Pay"
                onConfirm={() => changePlanMutation.mutate({ newInterval: "Yearly" }, { onSuccess: () => setShowAnnualConfirm(false) })}
                isLoading={changePlanMutation.isPending}
            />
        </div>
    );
}
