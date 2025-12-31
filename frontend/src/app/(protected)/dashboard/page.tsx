"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CreateTranscriptionModal } from "@/features/transcription";
import { DashboardContent, useDashboardModal } from "@/features/workspace/dashboard";
import { useTranscriptions, useFolderItems, useFolder } from "@/hooks";
import { uploadAbortRegistry } from "@/services/upload/uploadAbortRegistry";
import type { TranscriptionListItem } from "@/types/models/transcription";

function DashboardPageContent() {
    const router = useRouter();  // Add useRouter hook
    const searchParams = useSearchParams();
    const folderId = searchParams.get("folder");

    const { isModalOpen, openModal, closeModal } = useDashboardModal();

    // Clean up URL when closing modal
    const handleCloseModal = () => {
        closeModal();
        const params = new URLSearchParams(searchParams.toString());
        if (params.get("action") === "new") {
            params.delete("action");
            router.replace(`/dashboard?${params.toString()}`);
        }
    };

    const {
        items: allItems,
        isLoading: isLoadingAll,
        error: allError,
        refetch,
        deleteItem,
        cancelItem,
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

    // Abort client-side upload (FFmpeg/Azure upload)
    const handleCancelUpload = (id: string) => {
        uploadAbortRegistry.abort(id);
        removeOptimisticItem(id);
    };

    // Check for "action=new" in URL to open modal
    React.useEffect(() => {
        if (searchParams.get("action") === "new") {
            openModal();
        }
    }, [searchParams, openModal]);

    // Check for "upgrade=success" in URL to show success message
    const [showUpgradeSuccess, setShowUpgradeSuccess] = React.useState(false);
    React.useEffect(() => {
        if (searchParams.get("upgrade") === "success") {
            setShowUpgradeSuccess(true);
            // Remove query param from URL
            const url = new URL(window.location.href);
            url.searchParams.delete("upgrade");
            window.history.replaceState({}, "", url.toString());
            // Hide toast after 5 seconds
            const timer = setTimeout(() => setShowUpgradeSuccess(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [searchParams]);

    return (
        <>
            <DashboardContent
                items={items}
                isLoading={isLoading}
                error={error}
                onOpenModal={openModal}
                onDownload={(id) => console.log("Download:", id)}
                onDelete={deleteItem}
                onCancelUpload={handleCancelUpload}
                onCancelJob={cancelItem}
                onShare={(id) => console.log("Share:", id)}
                folderName={folderId ? folderData?.name : undefined}
            />

            <CreateTranscriptionModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSuccess={handleUploadSuccess}
                onOptimisticAdd={addOptimisticItem}
                onOptimisticUpdate={updateOptimisticItem}
                onOptimisticRemove={removeOptimisticItem}
            />

            {/* Upgrade Success Toast */}
            {showUpgradeSuccess && (
                <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-success text-success-foreground shadow-lg">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-medium">Welcome to Pro! Your upgrade was successful.</span>
                        <button
                            onClick={() => setShowUpgradeSuccess(false)}
                            className="ml-2 hover:opacity-70 transition-opacity"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
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
