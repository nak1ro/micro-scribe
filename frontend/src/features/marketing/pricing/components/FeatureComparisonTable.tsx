"use client";

import * as React from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { featureComparisonData } from "../data";

// Feature comparison table showing Free vs Pro limits
export function FeatureComparisonTable() {
    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="border-b border-border">
                        <th className="py-4 px-4 text-left text-sm font-semibold text-foreground">
                            Feature
                        </th>
                        <th className="py-4 px-4 text-center text-sm font-semibold text-foreground">
                            Free
                        </th>
                        <th className="py-4 px-4 text-center text-sm font-semibold text-primary">
                            Pro
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {featureComparisonData.map((row, index) => (
                        <tr
                            key={index}
                            className={cn(
                                "border-b border-border transition-colors",
                                "hover:bg-muted/50"
                            )}
                        >
                            <td className="py-4 px-4 text-sm text-foreground">
                                {row.feature}
                            </td>
                            <td className="py-4 px-4 text-center">
                                <FeatureValue value={row.free} />
                            </td>
                            <td className="py-4 px-4 text-center">
                                <FeatureValue value={row.pro} isPro />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// Renders feature value as check, X, or text
function FeatureValue({
    value,
    isPro = false,
}: {
    value: string | boolean;
    isPro?: boolean;
}) {
    if (typeof value === "boolean") {
        if (value) {
            return (
                <div className="flex justify-center">
                    <div
                        className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center",
                            isPro ? "bg-primary/10" : "bg-success/10"
                        )}
                    >
                        <Check
                            className={cn(
                                "h-4 w-4",
                                isPro ? "text-primary" : "text-success"
                            )}
                        />
                    </div>
                </div>
            );
        }
        return (
            <div className="flex justify-center">
                <div className="w-6 h-6 rounded-full flex items-center justify-center bg-muted">
                    <X className="h-4 w-4 text-muted-foreground" />
                </div>
            </div>
        );
    }

    return (
        <span
            className={cn(
                "text-sm",
                isPro ? "text-primary font-medium" : "text-muted-foreground"
            )}
        >
            {value}
        </span>
    );
}
