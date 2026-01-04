"use client";

import * as React from "react";
import { Receipt, Check, Clock, ChevronDown, ChevronUp, Download } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { InvoiceItem } from "@/types/api/billing";

interface BillingHistorySectionProps {
    invoices: InvoiceItem[];
    hasMore: boolean;
    isLoading?: boolean;
}

export function BillingHistorySection({ invoices, hasMore, isLoading }: BillingHistorySectionProps) {
    const [isExpanded, setIsExpanded] = React.useState(false);

    const visibleInvoices = isExpanded ? invoices : invoices.slice(0, 5);
    const canExpand = invoices.length > 5 || hasMore;

    if (isLoading) {
        return (
            <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-muted">
                        <Receipt className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-foreground">
                            Billing History
                        </h3>
                        <p className="text-sm text-muted-foreground">Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (invoices.length === 0) {
        return (
            <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-muted">
                        <Receipt className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-foreground">
                            Billing History
                        </h3>
                        <p className="text-sm text-muted-foreground">No invoices yet</p>
                    </div>
                </div>
            </div>
        );
    }

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
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
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
                            <th className="text-right text-sm font-medium text-muted-foreground px-6 py-3">
                                Invoice
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

            {/* Mobile List View */}
            <div className="block sm:hidden divide-y divide-border">
                {visibleInvoices.map((invoice) => (
                    <InvoiceMobileCard key={invoice.id} invoice={invoice} />
                ))}
            </div>

            {/* Expand/Collapse */}
            {canExpand && (
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
                                View all invoices
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}

function InvoiceRow({ invoice }: { invoice: InvoiceItem }) {
    const formattedDate = new Date(invoice.createdAtUtc).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    // Convert cents to dollars
    const formattedAmount = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: invoice.currency.toUpperCase(),
    }).format(invoice.amountCents / 100);

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
            <td className="px-6 py-4 text-right">
                {invoice.invoicePdf && (
                    <a
                        href={invoice.invoicePdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                        <Download className="h-3.5 w-3.5" />
                        PDF
                    </a>
                )}
            </td>
        </tr>
    );
}

function StatusBadge({ status }: { status: InvoiceItem["status"] }) {
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

function InvoiceMobileCard({ invoice }: { invoice: InvoiceItem }) {
    const formattedDate = new Date(invoice.createdAtUtc).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    const formattedAmount = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: invoice.currency.toUpperCase(),
    }).format(invoice.amountCents / 100);

    return (
        <div className="p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{formattedDate}</span>
                <span className="text-sm font-medium text-foreground">{formattedAmount}</span>
            </div>
            <div className="flex items-center justify-between">
                <StatusBadge status={invoice.status} />
                {invoice.invoicePdf && (
                    <a
                        href={invoice.invoicePdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                        <Download className="h-3.5 w-3.5" />
                        PDF
                    </a>
                )}
            </div>
        </div>
    );
}
