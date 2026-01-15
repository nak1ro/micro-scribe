"use client";

import * as React from "react";

interface UseTranscriptionSelectionProps {
    onBulkDelete?: (ids: string[]) => void;
    onBulkDownload?: (ids: string[]) => void;
    onBulkShare?: (ids: string[]) => void;
    onMoveToFolder?: (folderId: string, ids: string[]) => void;
}

export function useTranscriptionSelection({
    onBulkDelete,
    onBulkDownload,
    onBulkShare,
    onMoveToFolder,
}: UseTranscriptionSelectionProps = {}) {
    const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

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

    return {
        selectedIds,
        toggleSelect,
        clearSelection,
        handleBulkDelete,
        handleBulkDownload,
        handleBulkShare,
        handleMoveToFolder,
    };
}
