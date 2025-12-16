"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { TranscriptionItem } from "./TranscriptionItem";
import { TranscriptionEmptyState } from "./TranscriptionEmptyState";
import { BulkActionBar } from "./BulkActionBar";
import type { TranscriptionListItem } from "@/types/models/transcription";

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

    const selectAll = () => {
        if (selectedIds.size === items.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(items.map(item => item.id)));
        }
    };

    const clearSelection = () => setSelectedIds(new Set());

    // Sort handler
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(prev => prev === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("desc");
        }
    };

    // Sort items
    const sortedItems = React.useMemo(() => {
        return [...items].sort((a, b) => {
            let comparison = 0;
            if (sortField === "fileName") {
                comparison = a.fileName.localeCompare(b.fileName);
            } else if (sortField === "uploadDate") {
                comparison = new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
            } else if (sortField === "duration") {
                comparison = (a.duration ?? 0) - (b.duration ?? 0);
            }
            return sortDirection === "asc" ? comparison : -comparison;
        });
    }, [items, sortField, sortDirection]);

    // Bulk action handlers
    const handleBulkDelete = () => {
        if (onBulkDelete) {
            onBulkDelete(Array.from(selectedIds));
            clearSelection();
        }
    };

    const handleBulkDownload = () => {
        if (onBulkDownload) {
            onBulkDownload(Array.from(selectedIds));
        }
    };

    if (isLoading) {
        return <TranscriptionListSkeleton />;
    }

    if (items.length === 0) {
        return <TranscriptionEmptyState onNewClick={onNewClick} />;
    }

    const isAllSelected = selectedIds.size === items.length && items.length > 0;
    const isPartiallySelected = selectedIds.size > 0 && selectedIds.size < items.length;

    return (
        <>
            <div className={cn(
                "border border-border rounded-xl",
                "bg-card overflow-hidden"
            )}>
                {/* Table Header */}
                <div className={cn(
                    "grid items-center gap-4 px-4 py-3",
                    "bg-muted/50 border-b border-border",
                    "text-sm font-medium text-muted-foreground",
                    "grid-cols-[40px_1fr_160px_100px_100px_40px]"
                )}>
                    {/* Checkbox */}
                    <div className="flex items-center justify-center">
                        <input
                            type="checkbox"
                            checked={isAllSelected}
                            ref={el => {
                                if (el) el.indeterminate = isPartiallySelected;
                            }}
                            onChange={selectAll}
                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                        />
                    </div>

                    {/* Name */}
                    <SortableHeader
                        label="Name"
                        field="fileName"
                        currentField={sortField}
                        direction={sortDirection}
                        onSort={handleSort}
                    />

                    {/* Uploaded */}
                    <SortableHeader
                        label="Uploaded"
                        field="uploadDate"
                        currentField={sortField}
                        direction={sortDirection}
                        onSort={handleSort}
                    />

                    {/* Duration */}
                    <SortableHeader
                        label="Duration"
                        field="duration"
                        currentField={sortField}
                        direction={sortDirection}
                        onSort={handleSort}
                    />

                    {/* Status */}
                    <div>Status</div>

                    {/* Actions placeholder */}
                    <div />
                </div>

                {/* Items */}
                {sortedItems.map((item, index) => (
                    <TranscriptionItem
                        key={item.id}
                        item={item}
                        index={index}
                        isSelected={selectedIds.has(item.id)}
                        onSelect={toggleSelect}
                        onDownload={onDownload}
                        onDelete={onDelete}
                        onShare={onShare}
                    />
                ))}
            </div>

            {/* Bulk Action Bar */}
            {selectedIds.size > 0 && (
                <BulkActionBar
                    selectedCount={selectedIds.size}
                    onClear={clearSelection}
                    onDelete={onBulkDelete ? handleBulkDelete : undefined}
                    onDownload={onBulkDownload ? handleBulkDownload : undefined}
                />
            )}
        </>
    );
}

// Sortable Header Component
interface SortableHeaderProps {
    label: string;
    field: SortField;
    currentField: SortField;
    direction: SortDirection;
    onSort: (field: SortField) => void;
}

function SortableHeader({ label, field, currentField, direction, onSort }: SortableHeaderProps) {
    const isActive = currentField === field;

    return (
        <button
            onClick={() => onSort(field)}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
            {label}
            {isActive ? (
                direction === "asc" ? (
                    <ArrowUp className="h-3.5 w-3.5" />
                ) : (
                    <ArrowDown className="h-3.5 w-3.5" />
                )
            ) : (
                <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
            )}
        </button>
    );
}

// Loading Skeleton
function TranscriptionListSkeleton() {
    return (
        <div className="border border-border rounded-xl bg-card overflow-hidden">
            {/* Header skeleton */}
            <div className="grid items-center gap-4 px-4 py-3 bg-muted/50 border-b border-border grid-cols-[40px_1fr_160px_100px_100px_40px]">
                <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded w-16 animate-pulse" />
                <div className="h-4 bg-muted rounded w-20 animate-pulse" />
                <div className="h-4 bg-muted rounded w-16 animate-pulse" />
                <div className="h-4 bg-muted rounded w-14 animate-pulse" />
                <div />
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
                <div
                    key={i}
                    className="grid items-center gap-4 px-4 py-4 border-b border-border last:border-b-0 grid-cols-[40px_1fr_160px_100px_100px_40px]"
                >
                    <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                    <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
                    <div className="h-4 bg-muted rounded w-24 animate-pulse" />
                    <div className="h-4 bg-muted rounded w-12 animate-pulse" />
                    <div className="h-6 bg-muted rounded-full w-20 animate-pulse" />
                    <div className="h-8 w-8 rounded bg-muted animate-pulse" />
                </div>
            ))}
        </div>
    );
}
