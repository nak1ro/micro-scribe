"use client";

import { Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { BillingHistoryItem } from "../types";
import { subscriptionCopy } from "../data";

interface BillingHistorySectionProps {
    history: BillingHistoryItem[];
}

// Displays billing history as a table with invoice download links
export function BillingHistorySection({ history }: BillingHistorySectionProps) {
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
        }).format(date);
    };

    const formatAmount = (amount: number, currency: string) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
        }).format(amount);
    };

    const getStatusStyles = (status: BillingHistoryItem["status"]) => {
        switch (status) {
            case "paid":
                return "bg-success/10 text-success";
            case "pending":
                return "bg-warning/10 text-warning";
            case "failed":
                return "bg-destructive/10 text-destructive";
            default:
                return "bg-muted text-muted-foreground";
        }
    };

    return (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">
                    {subscriptionCopy.billingHistoryTitle}
                </h3>
            </div>

            {history.length === 0 ? (
                <div className="px-6 py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        {subscriptionCopy.noBillingHistory}
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Date
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Amount
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Invoice
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {history.map((item) => (
                                <tr
                                    key={item.id}
                                    className="hover:bg-muted/20 transition-colors"
                                >
                                    <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap">
                                        {formatDate(item.date)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap font-medium">
                                        {formatAmount(item.amount, item.currency)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={cn(
                                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                                                getStatusStyles(item.status)
                                            )}
                                        >
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        {item.invoiceUrl && (
                                            <button
                                                onClick={() => console.log("Download invoice:", item.id)}
                                                className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
                                                aria-label={`Download invoice for ${formatDate(item.date)}`}
                                            >
                                                <Download className="h-4 w-4" />
                                                <span>Download</span>
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
