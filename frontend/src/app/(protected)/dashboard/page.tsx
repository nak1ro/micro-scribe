"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CreateTranscriptionModal } from "@/features/transcription";
import { DashboardContent, useDashboardModal } from "@/features/dashboard";
import { useTranscriptions, useFolderItems, useFolder } from "@/hooks";
import type { TranscriptionListItem } from "@/types/models/transcription";

function DashboardPageContent() {
    const searchParams = useSearchParams();
    const folderId = searchParams.get("folder");

    const { isModalOpen, openModal, closeModal } = useDashboardModal();
    const {
        items: allItems,
        isLoading: isLoadingAll,
        error: allError,
        refetch,
        deleteItem,
        addOptimisticItem,
        updateOptimisticItem,
        removeOptimisticItem,
    } = useTranscriptions();

    const { data: folderData } = useFolder(folderId ?? "");
    const { data: folderItemsData, isLoading: isLoadingFolder } = useFolderItems(folderId ?? "");

    // Map folder items to TranscriptionListItem format
    const folderItems: TranscriptionListItem[] = React.useMemo(() => {
        if (!folderItemsData?.items) return [];
        return folderItemsData.items.map((item) => ({
            id: item.jobId,
            fileName: item.originalFileName,
            uploadDate: item.createdAtUtc,
            status: item.status.toLowerCase() as TranscriptionListItem["status"],
            duration: item.durationSeconds,
            language: item.sourceLanguage,
            preview: item.transcriptPreview,
        }));
    }, [folderItemsData]);

    // Use folder items if filtering by folder, otherwise all items
    const items = folderId ? folderItems : allItems;
    const isLoading = folderId ? isLoadingFolder : isLoadingAll;
    const error = folderId ? null : allError;



    const handleUploadSuccess = async () => {
        await refetch();
    };

    // Check for "action=new" in URL to open modal
    React.useEffect(() => {
        if (searchParams.get("action") === "new") {
            openModal();
            // Optional: Clean up URL without reload if desired, but "new" action works fine as persistent trigger until closed?
            // Actually better to replace URL to avoid re-opening on refresh if we wanted, but for now simple is fine.
            // Let's just open it.
        }
    }, [searchParams, openModal]);

    return (
        <>
            <DashboardContent
                items={items}
                isLoading={isLoading}
                error={error}
                onOpenModal={openModal}
                onDownload={(id) => console.log("Download:", id)}
                onDelete={deleteItem}
                onShare={(id) => console.log("Share:", id)}
                folderName={folderId ? folderData?.name : undefined}
            />

            <CreateTranscriptionModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSuccess={handleUploadSuccess}
                onOptimisticAdd={addOptimisticItem}
                onOptimisticUpdate={updateOptimisticItem}
                onOptimisticRemove={removeOptimisticItem}
            />
        </>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <DashboardPageContent />
        </Suspense>
    );
}
