"use client";

import * as React from "react";

// Loading Skeleton for Card Grid
export function CardGridSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(8)].map((_, i) => (
                <div
                    key={i}
                    className="flex flex-col p-4 rounded-xl bg-card border border-border animate-pulse"
                >
                    {/* Icon + Title skeleton */}
                    <div className="flex items-start gap-3 mb-3">
                        <div className="w-9 h-9 rounded-lg bg-muted" />
                        <div className="flex-1">
                            <div className="h-4 bg-muted rounded w-3/4" />
                        </div>
                    </div>

                    {/* Preview skeleton */}
                    <div className="space-y-2 mb-4">
                        <div className="h-3 bg-muted rounded w-full" />
                        <div className="h-3 bg-muted rounded w-2/3" />
                    </div>

                    {/* Footer skeleton */}
                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                        <div className="h-5 bg-muted rounded-full w-20" />
                        <div className="h-3 bg-muted rounded w-16" />
                    </div>
                </div>
            ))}
        </div>
    );
}
