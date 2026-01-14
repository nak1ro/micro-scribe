"use client";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui";
import type { BillingInterval } from "@/features/billing";
import { pricingConfig } from "@/features/marketing/pricing/data";

interface BillingCycleToggleProps {
    interval: BillingInterval;
    onIntervalChange: (interval: BillingInterval) => void;
}

// Toggle between monthly and annual billing cycles
export function BillingCycleToggle({ interval, onIntervalChange }: BillingCycleToggleProps) {
    const annualTotal = pricingConfig.annual.pro * 12;

    return (
        <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Choose billing cycle</h2>
            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={() => onIntervalChange("Monthly")}
                    aria-pressed={interval === "Monthly"}
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
                    onClick={() => onIntervalChange("Yearly")}
                    aria-pressed={interval === "Yearly"}
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
        </Card>
    );
}
