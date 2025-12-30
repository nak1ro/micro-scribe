"use client";

import * as React from "react";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui";

interface PaymentMethodSectionProps {
    onManagePayment: () => void;
    isLoading?: boolean;
}

// Placeholder payment data
const MOCK_PAYMENT = {
    brand: "Visa",
    last4: "4242",
    expMonth: 12,
    expYear: 2026,
};

export function PaymentMethodSection({ onManagePayment, isLoading }: PaymentMethodSectionProps) {
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
                        <div className="flex items-center gap-2 mt-2">
                            <CardBrandIcon brand={MOCK_PAYMENT.brand} />
                            <span className="text-sm text-foreground font-medium">
                                •••• {MOCK_PAYMENT.last4}
                            </span>
                            <span className="text-sm text-muted-foreground">
                                Expires {MOCK_PAYMENT.expMonth}/{MOCK_PAYMENT.expYear}
                            </span>
                        </div>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onManagePayment}
                    disabled={isLoading}
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

    // Simple colored badge for card brand
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
