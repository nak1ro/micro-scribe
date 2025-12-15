"use client";

import * as React from "react";
import { DashboardLayout } from "@/components/layout";
import { CreateTranscriptionModal } from "@/features/transcription";
import { DashboardContent, useDashboardModal } from "@/features/dashboard";
import { useTranscriptions } from "@/hooks";

export default function DashboardPage() {
    const { isModalOpen, openModal, closeModal } = useDashboardModal();
    const {
        items,
        isLoading,
        error,
        refetch,
        deleteItem,
        addOptimisticItem,
        updateOptimisticItem,
        removeOptimisticItem,
    } = useTranscriptions();

    const handleUploadSuccess = async () => {
        await refetch();
    };

    return (
        <DashboardLayout onNewTranscription={openModal}>
            <DashboardContent
                items={items}
                isLoading={isLoading}
                error={error}
                onOpenModal={openModal}
                onEdit={(id) => console.log("Edit:", id)}
                onDelete={deleteItem}
            />

            <CreateTranscriptionModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSuccess={handleUploadSuccess}
                onOptimisticAdd={addOptimisticItem}
                onOptimisticUpdate={updateOptimisticItem}
                onOptimisticRemove={removeOptimisticItem}
            />
        </DashboardLayout>
    );
}
