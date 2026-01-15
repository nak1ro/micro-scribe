"use client";

import * as React from "react";
import { TranscriptionCard } from "./TranscriptionCard";
import { TranscriptionEmptyState } from "./TranscriptionEmptyState";
import { BulkActionBar } from "./BulkActionBar";
import { CardGridSkeleton } from "./CardGridSkeleton";
import { useTranscriptionSelection } from "@/features/transcription/hooks/useTranscriptionSelection";
import type { TranscriptionListItem } from "@/types/models/transcription";

type InputType = "file" | "youtube" | "voice";

interface TranscriptionListProps {
    items: TranscriptionListItem[];
    isLoading?: boolean;
    onDownload?: (id: string) => void;
    onDelete?: (id: string) => void;
    onCancelUpload?: (id: string) => void;
    onCancelJob?: (id: string) => void;
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
    onCancelUpload,
    onCancelJob,
    onShare,
    onNewClick,
    onBulkDelete,
    onBulkDownload,
    onBulkShare,
    onMoveToFolder,
}: TranscriptionListProps) {
    const {
        selectedIds,
        toggleSelect,
        clearSelection,
        handleBulkDelete,
        handleBulkDownload,
        handleBulkShare,
        handleMoveToFolder,
    } = useTranscriptionSelection({
        onBulkDelete,
        onBulkDownload,
        onBulkShare,
        onMoveToFolder
    });

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
                {items.map((item) => (
                    <TranscriptionCard
                        key={item.id}
                        item={item}
                        isSelected={selectedIds.has(item.id)}
                        onSelect={toggleSelect}
                        onDownload={onDownload}
                        onDelete={onDelete}
                        onCancelUpload={onCancelUpload}
                        onCancelJob={onCancelJob}
                        onShare={onShare}
                    />
                ))}
            </div>
        </>
    );
}


