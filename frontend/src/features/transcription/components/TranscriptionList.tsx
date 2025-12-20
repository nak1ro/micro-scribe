"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { TranscriptionCard } from "./TranscriptionCard";
import { TranscriptionEmptyState } from "./TranscriptionEmptyState";
import { BulkActionBar } from "./BulkActionBar";
import type { TranscriptionListItem } from "@/types/models/transcription";
import { TranscriptionItem } from "@/features/transcription";

type InputType = "file" | "youtube" | "voice";
type SortField = "fileName" | "uploadDate" | "duration";
type SortDirection = "asc" | "desc";

interface TranscriptionListProps {
    items: TranscriptionListItem[];
    isLoading?: boolean;
    onDownload?: (id: string) => void;
    onDelete?: (id: string) => void;
    onShare?: (id: string) => void;
    onNewClick?: (type?: InputType) => void;
    onBulkDelete?: (ids: string[]) => void;
    onBulkDownload?: (ids: string[]) => void;
    onBulkShare?: (ids: string[]) => void;
    onMoveToFolder?: (folderId: string, ids: string[]) => void;
}

export function TranscriptionList({
    items,
    isLoading = false,
    onDownload,
    onDelete,
    onShare,
    onNewClick,
    onBulkDelete,
    onBulkDownload,
    onBulkShare,
    onMoveToFolder,
}: TranscriptionListProps) {
    // Selection state
    const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

    // Sorting state
    const [sortField, setSortField] = React.useState<SortField>("uploadDate");
    const [sortDirection, setSortDirection] = React.useState<SortDirection>("desc");

    // Selection handlers
    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const clearSelection = () => setSelectedIds(new Set());

    // Sort items
    const sortedItems = React.useMemo(() => {
        return [...items].sort((a, b) => {
            let comparison = 0;
            switch (sortField) {
                case "fileName":
                    comparison = a.fileName.localeCompare(b.fileName);
                    break;
                case "uploadDate":
                    comparison = new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
                    break;
                case "duration":
                    comparison = (a.duration ?? 0) - (b.duration ?? 0);
                    break;
            }
            return sortDirection === "asc" ? comparison : -comparison;
        });
    }, [items, sortField, sortDirection]);

    // Bulk action handlers
    const handleBulkDelete = () => {
        if (selectedIds.size > 0) {
            onBulkDelete?.(Array.from(selectedIds));
            clearSelection();
        }
    };

    const handleBulkDownload = () => {
        if (selectedIds.size > 0) {
            onBulkDownload?.(Array.from(selectedIds));
        }
    };

    const handleBulkShare = () => {
        if (selectedIds.size > 0) {
            onBulkShare?.(Array.from(selectedIds));
        }
    };

    const handleMoveToFolder = (folderId: string) => {
        if (selectedIds.size > 0) {
            onMoveToFolder?.(folderId, Array.from(selectedIds));
            clearSelection();
        }
    };

    if (isLoading) {
        return <CardGridSkeleton />;
    }

    if (items.length === 0) {
        return <TranscriptionEmptyState onNewClick={onNewClick} />;
    }

    return (
        <>
            {/* Selection toolbar */}
            {selectedIds.size > 0 && (
                <div className="mb-4">
                    <BulkActionBar
                        selectedCount={selectedIds.size}
                        onClear={clearSelection}
                        onDelete={onBulkDelete ? handleBulkDelete : undefined}
                        onDownload={onBulkDownload ? handleBulkDownload : undefined}
                        onShare={onBulkShare ? handleBulkShare : undefined}
                        onMoveToFolder={onMoveToFolder ? handleMoveToFolder : undefined}
                    />
                </div>
            )}

            {/* Card Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedItems.map((item) => (
                    <TranscriptionCard
                        key={item.id}
                        item={item}
                        isSelected={selectedIds.has(item.id)}
                        onSelect={toggleSelect}
                        onDownload={onDownload}
                        onDelete={onDelete}
                        onShare={onShare}
                    />
                ))}
            </div>

            {/* Alternative: List View with TranscriptionItem */}
            {/*<div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">*/}
            {/*    {sortedItems.map((item, index) => (*/}
            {/*        <TranscriptionItem*/}
            {/*            key={item.id}*/}
            {/*            item={item}*/}
            {/*            index={index}*/}
            {/*            isSelected={selectedIds.has(item.id)}*/}
            {/*            onSelect={toggleSelect}*/}
            {/*            onDownload={onDownload}*/}
            {/*            onDelete={onDelete}*/}
            {/*            onShare={onShare}*/}
            {/*        />*/}
            {/*    ))}*/}
            {/*</div>*/}
        </>
    );
}

// Loading Skeleton for Card Grid
function CardGridSkeleton() {
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
