"use client";

import * as React from "react";
import { DashboardLayout } from "@/components/layout";
import { CreateTranscriptionModal } from "@/features/transcription";
import { DashboardContent, useDashboardModal } from "@/features/dashboard";

export default function DashboardPage() {
    const { isModalOpen, openModal, closeModal } = useDashboardModal();

    return (
        <DashboardLayout onNewTranscription={openModal}>
            <DashboardContent onOpenModal={openModal} onUploadSuccess={closeModal} />

            <CreateTranscriptionModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSuccess={() => { }}
            />
        </DashboardLayout>
    );
}
