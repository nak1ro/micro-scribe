"use client";

import * as React from "react";

export function ViewerSkeleton() {
    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header skeleton */}
            <div className="h-16 border-b border-border px-6 flex items-center gap-4">
                <div className="h-8 w-8 rounded-md bg-muted animate-pulse" />
                <div className="h-5 w-48 rounded bg-muted animate-pulse" />
            </div>

            {/* Content skeleton */}
            <div className="flex-1 p-6 md:p-8 space-y-6 overflow-hidden">
                {/* Transcript text skeleton lines */}
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                        {/* Timestamp + speaker skeleton */}
                        <div className="flex items-center gap-3">
                            <div className="h-4 w-16 rounded bg-muted animate-pulse" />
                            <div className="h-4 w-20 rounded bg-muted animate-pulse" />
                        </div>
                        {/* Text lines skeleton - deterministic widths to avoid hydration mismatch */}
                        <div className="space-y-2 pl-0">
                            <div
                                className="h-4 rounded bg-muted animate-pulse"
                                style={{ width: `${70 + ((i * 13) % 25)}%` }}
                            />
                            <div
                                className="h-4 rounded bg-muted animate-pulse"
                                style={{ width: `${50 + ((i * 17) % 40)}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Audio player skeleton */}
            <div className="h-24 border-t border-border px-6 flex items-center gap-4">
                <div className="h-4 w-12 rounded bg-muted animate-pulse" />
                <div className="flex-1 h-2 rounded-full bg-muted animate-pulse" />
                <div className="h-4 w-12 rounded bg-muted animate-pulse" />
            </div>
        </div>
    );
}
