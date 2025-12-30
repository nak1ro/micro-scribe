"use client";

import * as React from "react";
import { Receipt, Check, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

// Placeholder billing history data
const MOCK_INVOICES = [
    { id: "inv_001", date: "2024-12-15", amount: 9.99, status: "paid" as const },
    { id: "inv_002", date: "2024-11-15", amount: 9.99, status: "paid" as const },
    { id: "inv_003", date: "2024-10-15", amount: 9.99, status: "paid" as const },
    { id: "inv_004", date: "2024-09-15", amount: 9.99, status: "paid" as const },
    { id: "inv_005", date: "2024-08-15", amount: 9.99, status: "paid" as const },
    { id: "inv_006", date: "2024-07-15", amount: 9.99, status: "paid" as const },
    { id: "inv_007", date: "2024-06-15", amount: 9.99, status: "paid" as const },
];

interface Invoice {
    id: string;
    date: string;
    amount: number;
    status: "paid" | "pending" | "failed";
}

export function BillingHistorySection() {
    const [isExpanded, setIsExpanded] = React.useState(false);

    const visibleInvoices = isExpanded ? MOCK_INVOICES : MOCK_INVOICES.slice(0, 5);
    const hasMoreInvoices = MOCK_INVOICES.length > 5;

    return (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-4 p-6 border-b border-border">
                <div className="p-2 rounded-lg bg-muted">
                    <Receipt className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-foreground">
                        Billing History
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        View your past invoices
                    </p>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border bg-muted/30">
                            <th className="text-left text-sm font-medium text-muted-foreground px-6 py-3">
                                Date
                            </th>
                            <th className="text-left text-sm font-medium text-muted-foreground px-6 py-3">
                                Amount
                            </th>
                            <th className="text-left text-sm font-medium text-muted-foreground px-6 py-3">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {visibleInvoices.map((invoice) => (
                            <InvoiceRow key={invoice.id} invoice={invoice} />
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Expand/Collapse */}
            {hasMoreInvoices && (
                <div className="p-4 border-t border-border">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full justify-center gap-2"
                    >
                        {isExpanded ? (
                            <>
                                <ChevronUp className="h-4 w-4" />
                                Show less
                            </>
                        ) : (
                            <>
                                <ChevronDown className="h-4 w-4" />
                                View all ({MOCK_INVOICES.length} invoices)
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}

function InvoiceRow({ invoice }: { invoice: Invoice }) {
    const formattedDate = new Date(invoice.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    const formattedAmount = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(invoice.amount);

    return (
        <tr className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
            <td className="px-6 py-4 text-sm text-foreground">
                {formattedDate}
            </td>
            <td className="px-6 py-4 text-sm text-foreground font-medium">
                {formattedAmount}
            </td>
            <td className="px-6 py-4">
                <StatusBadge status={invoice.status} />
            </td>
        </tr>
    );
}

function StatusBadge({ status }: { status: Invoice["status"] }) {
    const config = {
        paid: {
            icon: Check,
            label: "Paid",
            className: "bg-success/10 text-success",
        },
        pending: {
            icon: Clock,
            label: "Pending",
            className: "bg-warning/10 text-warning",
        },
        failed: {
            icon: Clock,
            label: "Failed",
            className: "bg-destructive/10 text-destructive",
        },
    };

    const { icon: Icon, label, className } = config[status];

    return (
        <span className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
            className
        )}>
            <Icon className="h-3 w-3" />
            {label}
        </span>
    );
}
