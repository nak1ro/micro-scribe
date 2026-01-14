"use client";

import * as React from "react";
import { TranscriptionList, DeleteConfirmationModal, ExportModal } from "@/features/transcription";
import { FolderPills, useAddToFolder } from "@/features/folders";
import type { TranscriptionListItem } from "@/types/models/transcription";
import type { SortOption, SortDirection } from "../types";
import { DashboardHeader } from "./DashboardHeader";
import { SearchFilterBar } from "./SearchFilterBar";
import { useDashboardFiltering } from "../hooks";

interface DashboardContentProps {
    items: TranscriptionListItem[];
    isLoading: boolean;
    error: string | null;
    onOpenModal: () => void;
    onDownload?: (id: string) => void;
    onDelete: (id: string) => Promise<void>;
    onCancelUpload?: (id: string) => void;
    onCancelJob?: (id: string) => Promise<void>;
    onShare?: (id: string) => void;
    folderName?: string;
}

export function DashboardContent({
    items,
    isLoading,
    error,
    onOpenModal,
    onDownload,
    onDelete,
    onCancelUpload,
    onCancelJob,
    onShare,
    folderName,
}: DashboardContentProps) {
    const addToFolderMutation = useAddToFolder();

    const {
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        sortDirection,
        setSortDirection,
        filteredAndSortedItems
    } = useDashboardFiltering(items);

    // Delete modal state
    const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
    const [itemToDelete, setItemToDelete] = React.useState<TranscriptionListItem | null>(null);

    // Export modal state
    const [exportModalOpen, setExportModalOpen] = React.useState(false);
    const [itemToExport, setItemToExport] = React.useState<TranscriptionListItem | null>(null);

    // Open delete confirmation modal
    const handleDeleteClick = (id: string) => {
        const item = items.find((i) => i.id === id);
        if (item) {
            setItemToDelete(item);
            setDeleteModalOpen(true);
        }
    };

    // Confirm delete action
    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        await onDelete(itemToDelete.id);
        setDeleteModalOpen(false);
        setItemToDelete(null);
    };

    // Open export modal
    const handleDownloadClick = (id: string) => {
        const item = items.find((i) => i.id === id);
        if (item && item.status === "completed") {
            setItemToExport(item);
            setExportModalOpen(true);
        }
    };

    const handleBulkDelete = async (ids: string[]) => {
        for (const id of ids) {
            try {
                await onDelete(id);
            } catch (err) {
                console.error("Failed to delete:", id, err);
            }
        }
    };

    const handleBulkDownload = (ids: string[]) => {
        // Open export modal for first item (bulk export not fully supported yet)
        if (ids.length > 0) {
            handleDownloadClick(ids[0]);
        }
    };

    const handleBulkShare = (ids: string[]) => {
        ids.forEach((id) => onShare?.(id));
    };

    const handleMoveToFolder = async (folderId: string, ids: string[]) => {
        try {
            await addToFolderMutation.mutateAsync({ folderId, jobIds: ids });
        } catch (err) {
            console.error("Failed to move to folder:", err);
        }
    };



    return (
        <>
            <div className="space-y-6">
                {/* Page Header */}
                <DashboardHeader folderName={folderName} />

                {/* Search & Sort Bar */}
                <SearchFilterBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    onSortChange={setSortBy}
                    onDirectionChange={setSortDirection}
                />

                <FolderPills />

                {/* Error Message */}
                {error && (
                    <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 text-warning-foreground text-sm">
                        {error} — Showing demo data.
                    </div>
                )}

                {/* Transcriptions List */}
                <TranscriptionList
                    items={filteredAndSortedItems}
                    isLoading={isLoading}
                    onDownload={handleDownloadClick}
                    onDelete={handleDeleteClick}
                    onCancelUpload={onCancelUpload}
                    onCancelJob={onCancelJob}
                    onShare={onShare}
                    onNewClick={onOpenModal}
                    onBulkDelete={handleBulkDelete}
                    onBulkDownload={handleBulkDownload}
                    onBulkShare={onShare ? handleBulkShare : undefined}
                    onMoveToFolder={handleMoveToFolder}
                />
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setItemToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                fileName={itemToDelete?.fileName || ""}
            />

            {/* Export Modal */}
            {itemToExport && (
                <ExportModal
                    isOpen={exportModalOpen}
                    onClose={() => {
                        setExportModalOpen(false);
                        setItemToExport(null);
                    }}
                    jobId={itemToExport.id}
                />
            )}
        </>
    );
}
