"use client";

import * as React from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { featureComparisonData } from "../data";

// Category groupings for visual hierarchy
const featureCategories = [
    {
        name: "Usage Limits",
        features: ["Daily Transcriptions", "Max File Duration", "Max File Size", "Files Per Upload", "Concurrent Jobs"]
    },
    {
        name: "Premium Features",
        features: ["Priority Processing", "Translation", "All AI Models", "Unlimited Storage"]
    }
];

// Feature comparison table showing Free vs Pro limits
export function FeatureComparisonTable() {
    // Group features by category
    const groupedFeatures = featureCategories.map(category => ({
        ...category,
        rows: category.features
            .map(featureName => featureComparisonData.find(row => row.feature === featureName))
            .filter(Boolean)
    }));

    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="border-b border-border bg-muted/50">
                        <th className="py-4 px-6 text-left text-sm font-semibold text-foreground">
                            Feature
                        </th>
                        <th className="py-4 px-6 text-center text-sm font-semibold text-muted-foreground">
                            Free
                        </th>
                        <th className="py-4 px-6 text-center text-sm font-semibold text-primary">
                            Pro
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {groupedFeatures.map((category, catIndex) => (
                        <React.Fragment key={category.name}>
                            {/* Category header row */}
                            <tr className="bg-muted/30">
                                <td
                                    colSpan={3}
                                    className="py-3 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider"
                                >
                                    {category.name}
                                </td>
                            </tr>
                            {/* Feature rows */}
                            {category.rows.map((row, index) => row && (
                                <tr
                                    key={row.feature}
                                    className={cn(
                                        "border-b border-border/50 transition-colors",
                                        "hover:bg-primary/5",
                                        // Last row in category has stronger border
                                        index === category.rows.length - 1 && catIndex < groupedFeatures.length - 1 && "border-b-border"
                                    )}
                                >
                                    <td className="py-4 px-6 text-sm text-foreground">
                                        {row.feature}
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <FeatureValue value={row.free} />
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <FeatureValue value={row.pro} isPro />
                                    </td>
                                </tr>
                            ))}
                        </React.Fragment>
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
                            "w-7 h-7 rounded-full flex items-center justify-center",
                            isPro ? "bg-primary/15" : "bg-success/15"
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
                <div className="w-7 h-7 rounded-full flex items-center justify-center bg-muted">
                    <X className="h-4 w-4 text-muted-foreground/50" />
                </div>
            </div>
        );
    }

    return (
        <span
            className={cn(
                "text-sm font-medium",
                isPro ? "text-primary" : "text-foreground"
            )}
        >
            {value}
        </span>
    );
}
