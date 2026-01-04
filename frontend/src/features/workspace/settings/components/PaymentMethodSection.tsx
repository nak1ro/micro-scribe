"use client";

import * as React from "react";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui";
import type { PaymentMethodResponse } from "@/types/api/billing";

interface PaymentMethodSectionProps {
    paymentMethod: PaymentMethodResponse | null | undefined;
    onManagePayment: () => void;
    isLoading?: boolean;
}

export function PaymentMethodSection({ paymentMethod, onManagePayment, isLoading }: PaymentMethodSectionProps) {
    // No payment method on file
    if (!paymentMethod) {
        return (
            <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-muted">
                            <CreditCard className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-foreground">
                                Payment Method
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                No payment method on file
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onManagePayment}
                        disabled={isLoading}
                    >
                        {isLoading ? "Loading..." : "Add Card"}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-muted">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-foreground">
                            Payment Method
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            <CardBrandIcon brand={paymentMethod.brand} />
                            <span className="text-sm text-foreground font-medium">
                                •••• {paymentMethod.last4}
                            </span>
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                                Expires {paymentMethod.expMonth}/{paymentMethod.expYear}
                            </span>
                        </div>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onManagePayment}
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                >
                    {isLoading ? "Loading..." : "Update"}
                </Button>
            </div>
        </div>
    );
}

// Card brand icon component
function CardBrandIcon({ brand }: { brand: string }) {
    const brandLower = brand.toLowerCase();

    const colors: Record<string, string> = {
        visa: "bg-blue-500",
        mastercard: "bg-orange-500",
        amex: "bg-blue-600",
        discover: "bg-orange-400",
    };

    return (
        <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${colors[brandLower] || "bg-gray-500"}`}>
            {brand}
        </span>
    );
}
