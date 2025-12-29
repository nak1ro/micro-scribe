"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, Sparks } from "iconoir-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button, Spinner } from "@/components/ui";
import { useBillingConfig, useSetupIntent } from "@/features/billing";
import { StripeProvider } from "./StripeProvider";
import { CheckoutForm } from "./CheckoutForm";
import { pricingConfig, planCardContent } from "@/features/marketing/pricing/data";
import type { BillingInterval } from "@/types/api/billing";

// Checkout page content
export function CheckoutContent() {
    const router = useRouter();
    const [interval, setInterval] = React.useState<BillingInterval>("Monthly");

    const { data: config, isLoading: configLoading } = useBillingConfig();
    const setupIntentMutation = useSetupIntent();

    // Create SetupIntent when interval changes
    React.useEffect(() => {
        setupIntentMutation.mutate({ interval });
    }, [interval]);

    const price = interval === "Monthly" ? pricingConfig.monthly.pro : pricingConfig.annual.pro;
    const period = interval === "Monthly" ? "/month" : "/month, billed annually";
    const annualTotal = pricingConfig.annual.pro * 12;

    if (configLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/account/billing"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to billing
                    </Link>
                    <h1 className="text-2xl font-bold text-foreground">Upgrade to Pro</h1>
                    <p className="text-muted-foreground mt-1">
                        Unlock unlimited transcriptions and premium features
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Plan Details */}
                    <div className="space-y-6">
                        {/* Billing Toggle */}
                        <div className="rounded-xl border border-border bg-card p-6">
                            <h2 className="text-lg font-semibold mb-4">Choose billing cycle</h2>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setInterval("Monthly")}
                                    className={cn(
                                        "flex-1 p-4 rounded-lg border-2 transition-all",
                                        interval === "Monthly"
                                            ? "border-primary bg-primary/5"
                                            : "border-border hover:border-muted-foreground"
                                    )}
                                >
                                    <div className="text-sm font-medium">Monthly</div>
                                    <div className="text-2xl font-bold mt-1">
                                        ${pricingConfig.monthly.pro}
                                        <span className="text-sm font-normal text-muted-foreground">/mo</span>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setInterval("Yearly")}
                                    className={cn(
                                        "flex-1 p-4 rounded-lg border-2 transition-all relative",
                                        interval === "Yearly"
                                            ? "border-primary bg-primary/5"
                                            : "border-border hover:border-muted-foreground"
                                    )}
                                >
                                    <span className="absolute -top-2 right-2 px-2 py-0.5 text-xs font-semibold bg-success text-success-foreground rounded-full">
                                        Save {pricingConfig.annualSavingsPercent}%
                                    </span>
                                    <div className="text-sm font-medium">Annual</div>
                                    <div className="text-2xl font-bold mt-1">
                                        ${pricingConfig.annual.pro}
                                        <span className="text-sm font-normal text-muted-foreground">/mo</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        ${annualTotal} billed yearly
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Pro Features */}
                        <div className="rounded-xl border border-border bg-card p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparks className="h-5 w-5 text-primary" />
                                <h2 className="text-lg font-semibold">Pro Plan includes</h2>
                            </div>
                            <div className="space-y-3">
                                {planCardContent.pro.features.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <CheckCircle className="h-4 w-4 text-success shrink-0" />
                                        <span className="text-sm">{feature.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Payment Form */}
                    <div className="rounded-xl border border-border bg-card p-6">
                        <h2 className="text-lg font-semibold mb-4">Payment details</h2>

                        {setupIntentMutation.isPending && (
                            <div className="flex items-center justify-center py-12">
                                <Spinner size="lg" />
                            </div>
                        )}

                        {setupIntentMutation.isError && (
                            <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
                                Failed to initialize payment. Please try again.
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-2"
                                    onClick={() => setupIntentMutation.mutate({ interval })}
                                >
                                    Retry
                                </Button>
                            </div>
                        )}

                        {config?.publishableKey && setupIntentMutation.data?.clientSecret && (
                            <StripeProvider
                                publishableKey={config.publishableKey}
                                clientSecret={setupIntentMutation.data.clientSecret}
                            >
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
                                <span>${interval === "Monthly" ? price : annualTotal}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
