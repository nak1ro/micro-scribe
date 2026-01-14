"use client";

import { ArrowLeft } from "iconoir-react";
import { Button, Spinner, Card, Alert } from "@/components/ui";
import { useStripeNavigationBlock, useCheckoutPage } from "@/features/billing";
import { StripeProvider } from "../../providers";
import { CheckoutForm } from "./CheckoutForm";
import { BillingCycleToggle } from "./BillingCycleToggle";
import { ProFeaturesList } from "./ProFeaturesList";
import { VerificationRequired } from "./VerificationRequired";
import { useEmailVerification } from "@/context/VerificationContext";

// Checkout page content
export function CheckoutContent() {
    const { isVerified, resendEmail, resendLoading, resendSuccess } = useEmailVerification();

    // Force full page reload when navigating away to stop Stripe beacons
    useStripeNavigationBlock();

    const {
        interval,
        setInterval,
        config,
        configLoading,
        clientSecret,
        setupPending,
        setupError,
        retrySetup,
        price,
        period,
        totalToday,
    } = useCheckoutPage({ isVerified });

    if (configLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!isVerified) {
        return (
            <VerificationRequired
                onResendEmail={resendEmail}
                resendLoading={resendLoading}
                resendSuccess={resendSuccess}
            />
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <a
                        href="/account/billing"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to billing
                    </a>
                    <h1 className="text-2xl font-bold text-foreground">Upgrade to Pro</h1>
                    <p className="text-muted-foreground mt-1">
                        Unlock unlimited transcriptions and premium features
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Plan Details */}
                    <div className="space-y-6">
                        <BillingCycleToggle interval={interval} onIntervalChange={setInterval} />
                        <ProFeaturesList />
                    </div>

                    {/* Right: Payment Form */}
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold mb-4">Payment details</h2>

                        {setupPending && (
                            <div className="flex items-center justify-center py-12">
                                <Spinner size="lg" />
                            </div>
                        )}

                        {setupError && (
                            <Alert variant="destructive" className="mb-4">
                                Failed to initialize payment. Please try again.
                                <Button variant="outline" size="sm" className="mt-2" onClick={retrySetup}>
                                    Retry
                                </Button>
                            </Alert>
                        )}

                        {config?.publishableKey && clientSecret && (
                            <StripeProvider publishableKey={config.publishableKey} clientSecret={clientSecret}>
                                <CheckoutForm interval={interval} />
                            </StripeProvider>
                        )}

                        {/* Order Summary */}
                        <div className="mt-6 pt-6 border-t border-border">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Pro Plan ({interval})</span>
                                <span className="font-medium">${price}{period}</span>
                            </div>
                            <div className="flex justify-between mt-2 text-lg font-semibold">
                                <span>Total today</span>
                                <span>${totalToday}</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
