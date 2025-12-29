"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { planDisplayData, billingCopy } from "../data";

interface CurrentPlanSectionProps {
    planType: "Free" | "Pro";
    nextBillingDate?: Date;
    cancelAtPeriodEnd?: boolean;
    onUpgrade: () => void;
    onManagePayment?: () => void;
    isManaging?: boolean;
}

// Displays current plan status with billing details
export function CurrentPlanSection({
    planType,
    nextBillingDate,
    cancelAtPeriodEnd,
    onUpgrade,
    onManagePayment,
    isManaging,
}: CurrentPlanSectionProps) {
    const plan = planDisplayData[planType];
    const isPro = planType === "Pro";

    return (
        <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-semibold text-foreground">
                            {plan.name}
                        </h2>
                        <span
                            className={cn(
                                "px-2 py-0.5 text-xs font-medium rounded-full",
                                isPro
                                    ? "bg-primary/10 text-primary"
                                    : "bg-muted text-muted-foreground"
                            )}
                        >
                            {billingCopy.currentPlanLabel}
                        </span>
                        {cancelAtPeriodEnd && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-destructive/10 text-destructive">
                                Canceling
                            </span>
                        )}
                    </div>

                    {isPro && nextBillingDate && (
                        <p className="text-sm text-muted-foreground">
                            {cancelAtPeriodEnd ? "Access until" : billingCopy.nextBillingLabel}:{" "}
                            {nextBillingDate.toLocaleDateString()}
                        </p>
                    )}
                </div>

                <div className="flex gap-2">
                    {!isPro && (
                        <Button onClick={onUpgrade} size="lg">
                            Upgrade to Pro
                        </Button>
                    )}
                    {isPro && onManagePayment && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onManagePayment}
                            disabled={isManaging}
                        >
                            {isManaging ? "Loading..." : "Manage Payment"}
                        </Button>
                    )}
                </div>
            </div>

            {/* Plan limits summary */}
            <div className="mt-4 pt-4 border-t border-border">
                <div className="flex flex-wrap gap-4">
                    {plan.limits.map((limit, index) => (
                        <span
                            key={index}
                            className="text-sm text-muted-foreground"
                        >
                            • {limit}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
