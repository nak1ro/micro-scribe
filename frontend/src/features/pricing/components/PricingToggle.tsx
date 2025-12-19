"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { BillingInterval, pricingConfig } from "../data";

interface PricingToggleProps {
    value: BillingInterval;
    onChange: (value: BillingInterval) => void;
}

// Toggle between monthly and annual billing with savings indicator
export function PricingToggle({ value, onChange }: PricingToggleProps) {
    return (
        <div className="flex items-center justify-center gap-3">
            <button
                type="button"
                onClick={() => onChange("monthly")}
                className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                    value === "monthly"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                )}
            >
                Monthly
            </button>

            <button
                type="button"
                onClick={() => onChange("annual")}
                className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-colors relative",
                    value === "annual"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                )}
            >
                Annual
                <span className="absolute -top-2 -right-2 px-1.5 py-0.5 text-[10px] font-semibold bg-success text-success-foreground rounded-full">
                    Save {pricingConfig.annualSavingsPercent}%
                </span>
            </button>
        </div>
    );
}
