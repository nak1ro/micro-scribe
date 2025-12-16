"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Filter, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { TranscriptionList } from "@/features/transcription";
import { StatsCards } from "./StatsCards";
import { FolderPills } from "./FolderPills";
import { useAddToFolder } from "@/hooks";
import type { TranscriptionListItem } from "@/types/models/transcription";

interface DashboardContentProps {
    items: TranscriptionListItem[];
    isLoading: boolean;
    error: string | null;
    onOpenModal: () => void;
    onDownload?: (id: string) => void;
    onDelete: (id: string) => Promise<void>;
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
    onShare,
    folderName,
}: DashboardContentProps) {
    const addToFolderMutation = useAddToFolder();
    const [searchQuery, setSearchQuery] = React.useState("");

    const handleDelete = async (id: string) => {
        try {
            await onDelete(id);
        } catch (err) {
            console.error("Failed to delete:", err);
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
        ids.forEach((id) => onDownload?.(id));
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

    // Filter items based on search query
    const filteredItems = React.useMemo(() => {
        if (!searchQuery.trim()) return items;
        const query = searchQuery.toLowerCase();
        return items.filter((item) =>
            item.fileName.toLowerCase().includes(query)
        );
    }, [items, searchQuery]);

    return (
        <>
            <div className="space-y-6">
                {/* Page Header */}
                <DashboardHeader folderName={folderName} />

                {/* Stats Cards - Only on main dashboard */}
                {!folderName && <StatsCards items={items} isLoading={isLoading} />}

                {/* Search & Filter Bar */}
                <SearchFilterBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />

                {/* Folder Pills - Only on main dashboard */}
                {!folderName && <FolderPills />}

                {/* Error Message */}
                {error && (
                    <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 text-warning-foreground text-sm">
                        {error} — Showing demo data.
                    </div>
                )}

                {/* Transcriptions List */}
                <TranscriptionList
                    items={filteredItems}
                    isLoading={isLoading}
                    onDownload={onDownload}
                    onDelete={handleDelete}
                    onShare={onShare}
                    onNewClick={onOpenModal}
                    onBulkDelete={handleBulkDelete}
                    onBulkDownload={onDownload ? handleBulkDownload : undefined}
                    onBulkShare={onShare ? handleBulkShare : undefined}
                    onMoveToFolder={handleMoveToFolder}
                />
            </div>
        </>
    );
}

interface DashboardHeaderProps {
    folderName?: string;
}

function DashboardHeader({ folderName }: DashboardHeaderProps) {
    if (folderName) {
        return (
            <div>
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to all transcriptions
                </Link>
                <h1 className="text-2xl font-bold text-foreground">
                    {folderName}
                </h1>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-foreground">
                My Transcriptions
            </h1>
            <p className="text-muted-foreground mt-1">
                Manage your audio and video transcriptions
            </p>
        </div>
    );
}

interface SearchFilterBarProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
}

function SearchFilterBar({ searchQuery, onSearchChange }: SearchFilterBarProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search transcriptions..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className={cn(
                        "w-full h-10 pl-10 pr-4 rounded-lg",
                        "bg-card border border-border shadow-sm",
                        "text-foreground placeholder:text-muted-foreground",
                        "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
                        "transition-shadow"
                    )}
                />
            </div>
            <button
                type="button"
                className={cn(
                    "flex items-center gap-2 px-4 h-10 rounded-lg",
                    "bg-card border border-border shadow-sm",
                    "text-muted-foreground hover:text-foreground",
                    "transition-colors"
                )}
            >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filter</span>
            </button>
        </div>
    );
}

// Export the hook for modal state management
export function useDashboardModal() {
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const openModal = React.useCallback(() => setIsModalOpen(true), []);
    const closeModal = React.useCallback(() => setIsModalOpen(false), []);

    return { isModalOpen, openModal, closeModal };
}
