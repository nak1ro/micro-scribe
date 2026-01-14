"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "iconoir-react";
import { cn } from "@/lib/utils";
import { useFolders, useDeleteFolder, useAddToFolder, FOLDER_COLORS } from "../hooks";
import { FolderModal } from "./FolderModal";
import { FolderPill } from "./FolderPill";
import { useEmailVerification } from "@/context/VerificationContext";
import type { FolderColor, FolderDto } from "../types";
import { toast } from "sonner";

export function FolderPills() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeFolderId = searchParams.get("folder");

    const { data: folders, isLoading } = useFolders();
    const deleteFolderMutation = useDeleteFolder();
    const addToFolderMutation = useAddToFolder();
    const { isVerified, isLoading: isVerificationLoading, openModal: openVerificationModal } = useEmailVerification();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingFolder, setEditingFolder] = React.useState<FolderDto | null>(null);

    const handleFolderClick = (folderId: string | null) => {
        if (folderId) {
            router.push(`/dashboard?folder=${folderId}`);
        } else {
            router.push("/dashboard");
        }
    };

    // Allow actions while loading to prevent false-positive blocks
    const handleNewFolder = () => {
        if (!isVerificationLoading && !isVerified) {
            openVerificationModal();
            return;
        }
        setEditingFolder(null);
        setIsModalOpen(true);
    };

    const handleEdit = (folder: FolderDto) => {
        if (!isVerificationLoading && !isVerified) {
            openVerificationModal();
            return;
        }
        setEditingFolder(folder);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingFolder(null);
    };

    const handleDelete = async (folderId: string) => {
        if (!isVerificationLoading && !isVerified) {
            openVerificationModal();
            return;
        }
        try {
            await deleteFolderMutation.mutateAsync(folderId);
            // If we deleted the active folder, go back to all
            if (activeFolderId === folderId) {
                router.push("/dashboard");
            }
        } catch (error) {
            console.error("Failed to delete folder:", error);
        }
    };

    const handleDrop = async (e: React.DragEvent, folderId: string) => {
        e.preventDefault();
        const jobId = e.dataTransfer.getData("application/x-scribe-job-id");
        if (!jobId) return;

        if (!isVerificationLoading && !isVerified) {
            openVerificationModal();
            return;
        }

        try {
            await addToFolderMutation.mutateAsync({
                folderId,
                jobIds: [jobId]
            });
            toast.success("Added to folder");
        } catch (error) {
            console.error("Failed to add to folder:", error);
            toast.error("Failed to add to folder");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center gap-2">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-8 w-20 rounded-lg bg-muted animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <>
            <div role="tablist" className="flex flex-wrap items-center gap-2">
                {/* All pill */}
                <FolderPill
                    name="All"
                    isActive={!activeFolderId}
                    onClick={() => handleFolderClick(null)}
                />

                {/* Folder pills */}
                {folders?.map((folder) => (
                    <FolderPill
                        key={folder.id}
                        name={folder.name}
                        color={folder.color}
                        count={folder.itemCount}
                        isActive={activeFolderId === folder.id}
                        onClick={() => handleFolderClick(folder.id)}
                        onEdit={() => handleEdit(folder)}
                        onDelete={() => handleDelete(folder.id)}
                        onDrop={(e) => handleDrop(e, folder.id)}
                        showActions
                    />
                ))}

                {/* New Folder button */}
                <button
                    onClick={handleNewFolder}
                    className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg",
                        "text-sm text-muted-foreground",
                        "border border-dashed border-border",
                        "hover:border-primary hover:text-primary",
                        "transition-colors duration-150"
                    )}
                >
                    <Plus className="h-3.5 w-3.5" />
                    New Folder
                </button>
            </div>

            <FolderModal isOpen={isModalOpen} onClose={handleCloseModal} folder={editingFolder} />
        </>
    );
}


