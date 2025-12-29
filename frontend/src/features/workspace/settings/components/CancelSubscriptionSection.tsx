"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { billingCopy } from "../data";

interface CancelSubscriptionSectionProps {
    onCancel: () => void;
    isLoading?: boolean;
}

// Danger zone section for subscription cancellation
export function CancelSubscriptionSection({ onCancel, isLoading }: CancelSubscriptionSectionProps) {
    const [showConfirm, setShowConfirm] = React.useState(false);

    const handleCancel = () => {
        onCancel();
        setShowConfirm(false);
    };

    if (showConfirm) {
        return (
            <div
                className={cn(
                    "rounded-xl p-6",
                    "bg-destructive/5 border border-destructive/20"
                )}
            >
                <div className="flex items-start gap-4">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground">
                            {billingCopy.cancelConfirmTitle}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            {billingCopy.cancelConfirmMessage}
                        </p>
                        <div className="flex gap-3 mt-4">
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleCancel}
                                disabled={isLoading}
                            >
                                {isLoading ? "Canceling..." : "Yes, Cancel Subscription"}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowConfirm(false)}
                                disabled={isLoading}
                            >
                                Keep Subscription
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground">
                {billingCopy.cancelTitle}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
                {billingCopy.cancelDescription}
            </p>
            <Button
                variant="outline"
                size="sm"
                className="mt-4 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setShowConfirm(true)}
            >
                {billingCopy.cancelButton}
            </Button>
        </div>
    );
}
