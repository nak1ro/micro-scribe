"use client";

import * as React from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { SubscriptionPlan } from "../types";
import { subscriptionCopy } from "../data";

interface SubscriptionActionsProps {
    currentPlan: SubscriptionPlan;
    onCancel: () => void;
    onManageBilling: () => void;
}

// Action buttons for subscription management (cancel, manage billing)
export function SubscriptionActions({
    currentPlan,
    onCancel,
    onManageBilling,
}: SubscriptionActionsProps) {
    const [showCancelConfirm, setShowCancelConfirm] = React.useState(false);
    const isPro = currentPlan === SubscriptionPlan.Pro;

    // Only show for Pro users
    if (!isPro) {
        return null;
    }

    const handleCancelClick = () => {
        setShowCancelConfirm(true);
    };

    const handleConfirmCancel = () => {
        setShowCancelConfirm(false);
        onCancel();
    };

    return (
        <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
                Manage Subscription
            </h3>

            {!showCancelConfirm ? (
                <div className="flex flex-wrap gap-3">
                    <Button
                        variant="outline"
                        onClick={onManageBilling}
                        className="gap-2"
                    >
                        <span>{subscriptionCopy.manageBillingButton}</span>
                        <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={handleCancelClick}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                        {subscriptionCopy.cancelButton}
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                        <p className="text-sm text-foreground">
                            {subscriptionCopy.confirmCancel}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="destructive"
                            onClick={handleConfirmCancel}
                        >
                            Yes, Cancel Subscription
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setShowCancelConfirm(false)}
                        >
                            Keep Subscription
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
