"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { TranscriptionItem } from "./TranscriptionItem";
import { TranscriptionEmptyState } from "./TranscriptionEmptyState";
import type { TranscriptionListItem } from "../types";

interface TranscriptionListProps {
    items: TranscriptionListItem[];
    isLoading?: boolean;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
    onNewClick?: () => void;
}

export function TranscriptionList({
    items,
    isLoading = false,
    onEdit,
    onDelete,
    onNewClick,
}: TranscriptionListProps) {
    if (isLoading) {
        return <TranscriptionListSkeleton />;
    }

    if (items.length === 0) {
        return <TranscriptionEmptyState onNewClick={onNewClick} />;
    }

    return (
        <div
            className={cn(
                "border border-border rounded-xl",
                "bg-card overflow-hidden"
            )}
        >
            {items.map((item) => (
                <TranscriptionItem
                    key={item.id}
                    item={item}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Loading Skeleton
// ─────────────────────────────────────────────────────────────

function TranscriptionListSkeleton() {
    return (
        <div className="border border-border rounded-xl bg-card overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
                <div
                    key={i}
                    className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-b-0"
                >
                    {/* Icon skeleton */}
                    <div className="w-10 h-10 rounded-lg bg-muted animate-pulse" />

                    {/* Content skeleton */}
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
                        <div className="h-3 bg-muted rounded w-1/4 animate-pulse" />
                    </div>

                    {/* Duration skeleton */}
                    <div className="hidden sm:block h-4 bg-muted rounded w-16 animate-pulse" />

                    {/* Language skeleton */}
                    <div className="hidden md:block h-4 bg-muted rounded w-10 animate-pulse" />

                    {/* Action skeleton */}
                    <div className="h-8 w-8 rounded bg-muted animate-pulse" />
                </div>
            ))}
        </div>
    );
}
