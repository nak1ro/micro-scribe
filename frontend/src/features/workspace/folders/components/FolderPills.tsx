"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Folder, Plus, MoreVert, EditPencil, Trash } from "iconoir-react";
import { cn } from "@/lib/utils";
import { useFolders, useDeleteFolder, FOLDER_COLORS } from "@/hooks";
import { FolderModal } from "@/features/workspace/folders";
import { useEmailVerification } from "@/context/VerificationContext";
import type { FolderColor, FolderDto } from "@/types/models/folder";
import { useAddToFolder } from "@/hooks/useFolders";
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

interface FolderPillProps {
    name: string;
    color?: FolderColor;
    count?: number;
    isActive?: boolean;
    onClick: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    onDrop?: (e: React.DragEvent) => void;
    showActions?: boolean;
}

function FolderPill({ name, color, count, isActive, onClick, onEdit, onDelete, onDrop, showActions }: FolderPillProps) {
    const colors = color ? FOLDER_COLORS[color] : null;
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isConfirmingDelete, setIsConfirmingDelete] = React.useState(false);
    const [isDragOver, setIsDragOver] = React.useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);

    // Close menu on outside click
    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsMenuOpen(false);
                setIsConfirmingDelete(false);
            }
        };
        if (isMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isMenuOpen]);

    const handleMenuClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMenuOpen(!isMenuOpen);
        setIsConfirmingDelete(false);
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMenuOpen(false);
        onEdit?.();
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsConfirmingDelete(true);
    };

    const handleConfirmDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMenuOpen(false);
        setIsConfirmingDelete(false);
        onDelete?.();
    };

    const handleCancelDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsConfirmingDelete(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        if (!onDrop) return;
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        if (!onDrop) return;
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        if (!onDrop) return;
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        onDrop(e);
    };

    return (
        <div className="relative group" ref={menuRef}>
            <div
                onClick={onClick}
                className={cn(
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer",
                    "text-sm font-medium",
                    "border transition-all duration-150",
                    isDragOver && "ring-2 ring-primary ring-offset-2 scale-105 bg-primary/10",
                    isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {colors && (
                    <Folder
                        className="h-3.5 w-3.5"
                        style={{ color: isActive ? "currentColor" : colors.border }}
                    />
                )}
                <span>{name}</span>

                {/* Count - hidden on hover when actions available */}
                {count !== undefined && count > 0 && (
                    <span className={cn(
                        "text-xs tabular-nums",
                        isActive ? "opacity-80" : "text-muted-foreground/60",
                        showActions && "group-hover:hidden"
                    )}>
                        {count}
                    </span>
                )}

                {/* 3-dot menu button - visible on hover */}
                {showActions && (
                    <button
                        type="button"
                        onClick={handleMenuClick}
                        className={cn(
                            "p-0.5 rounded hidden group-hover:flex items-center justify-center",
                            "transition-colors",
                            isActive
                                ? "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/20"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                    >
                        <MoreVert className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>

            {/* Dropdown Menu */}
            {isMenuOpen && (
                <div
                    className={cn(
                        "absolute left-0 top-full mt-1 z-50",
                        "min-w-[140px] py-1",
                        "bg-popover border border-border rounded-lg shadow-lg"
                    )}
                >
                    {!isConfirmingDelete ? (
                        <>
                            <button
                                onClick={handleEditClick}
                                className={cn(
                                    "flex items-center gap-2 w-full px-3 py-2 text-sm",
                                    "text-foreground hover:bg-accent",
                                    "transition-colors"
                                )}
                            >
                                <EditPencil className="h-3.5 w-3.5" />
                                Edit
                            </button>
                            <button
                                onClick={handleDeleteClick}
                                className={cn(
                                    "flex items-center gap-2 w-full px-3 py-2 text-sm",
                                    "text-destructive hover:bg-destructive/10",
                                    "transition-colors"
                                )}
                            >
                                <Trash className="h-3.5 w-3.5" />
                                Delete
                            </button>
                        </>
                    ) : (
                        <div className="px-3 py-2 space-y-2">
                            <p className="text-xs text-muted-foreground">
                                Delete folder?
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleConfirmDelete}
                                    className={cn(
                                        "flex-1 px-2 py-1 text-xs font-medium rounded",
                                        "bg-destructive text-destructive-foreground",
                                        "hover:bg-destructive/90 transition-colors"
                                    )}
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={handleCancelDelete}
                                    className={cn(
                                        "flex-1 px-2 py-1 text-xs font-medium rounded",
                                        "bg-muted text-muted-foreground",
                                        "hover:bg-accent transition-colors"
                                    )}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
