"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { planDisplayData, billingCopy } from "../data";

interface CurrentPlanSectionProps {
    planType: "Free" | "Pro";
    billingCycle?: "monthly" | "annual";
    nextBillingDate?: Date;
    onUpgrade: () => void;
}

// Displays current plan status with billing details
export function CurrentPlanSection({
    planType,
    billingCycle,
    nextBillingDate,
    onUpgrade,
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
                    </div>

                    {isPro && billingCycle && (
                        <p className="text-sm text-muted-foreground">
                            {billingCopy.billingCycleLabel}:{" "}
                            <span className="capitalize">{billingCycle}</span>
                        </p>
                    )}

                    {isPro && nextBillingDate && (
                        <p className="text-sm text-muted-foreground">
                            {billingCopy.nextBillingLabel}:{" "}
                            {nextBillingDate.toLocaleDateString()}
                        </p>
                    )}
                </div>

                {!isPro && (
                    <Button onClick={onUpgrade} size="lg">
                        Upgrade to Pro
                    </Button>
                )}
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
