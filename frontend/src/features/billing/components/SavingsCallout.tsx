"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { billingCopy } from "../data";

interface SavingsCalloutProps {
    isVisible: boolean;
    onSwitchToAnnual: () => void;
}

// Banner showing potential savings from switching to annual billing
export function SavingsCallout({ isVisible, onSwitchToAnnual }: SavingsCalloutProps) {
    if (!isVisible) return null;

    return (
        <div
            className={cn(
                "rounded-xl p-4",
                "bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10",
                "border border-primary/20"
            )}
        >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                        {billingCopy.savingsMessage}
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onSwitchToAnnual}
                    className="border-primary/30 hover:bg-primary/10"
                >
                    Switch to Annual
                </Button>
            </div>
        </div>
    );
}
