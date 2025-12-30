"use client";

import * as React from "react";
import { Search, ArrowUpDown, Check, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { TranscriptionList, DeleteConfirmationModal, ExportModal } from "@/features/transcription";
import { FolderPills } from "@/features/workspace/folders/components/FolderPills";
import { useAddToFolder } from "@/hooks";
import type { TranscriptionListItem } from "@/types/models/transcription";

type SortOption = "timeAdded" | "name" | "duration";
type SortDirection = "asc" | "desc";

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
    const [searchQuery, setSearchQuery] = React.useState("");
    const [sortBy, setSortBy] = React.useState<SortOption>("timeAdded");
    const [sortDirection, setSortDirection] = React.useState<SortDirection>("desc");

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

    // Filter and sort items
    const filteredAndSortedItems = React.useMemo(() => {
        let result = items;

        // Filter by search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter((item) =>
                item.fileName.toLowerCase().includes(query)
            );
        }

        // Sort
        const sorted = [...result].sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case "name":
                    comparison = a.fileName.localeCompare(b.fileName);
                    break;
                case "duration":
                    comparison = (a.duration ?? 0) - (b.duration ?? 0);
                    break;
                case "timeAdded":
                default:
                    comparison = new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
                    break;
            }
            return sortDirection === "asc" ? comparison : -comparison;
        });

        return sorted;
    }, [items, searchQuery, sortBy, sortDirection]);

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

interface DashboardHeaderProps {
    folderName?: string;
}

function DashboardHeader({ folderName }: DashboardHeaderProps) {
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
    sortBy: SortOption;
    sortDirection: SortDirection;
    onSortChange: (value: SortOption) => void;
    onDirectionChange: (value: SortDirection) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: "timeAdded", label: "Time Added" },
    { value: "name", label: "Name" },
    { value: "duration", label: "Duration" },
];

function SearchFilterBar({ searchQuery, onSearchChange, sortBy, sortDirection, onSortChange, onDirectionChange }: SearchFilterBarProps) {
    const [sortOpen, setSortOpen] = React.useState(false);
    const sortRef = React.useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
                setSortOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSortOptionClick = (option: SortOption) => {
        if (sortBy === option) {
            // Toggle direction if same option clicked
            onDirectionChange(sortDirection === "asc" ? "desc" : "asc");
        } else {
            onSortChange(option);
            // Default to desc for time/duration, asc for name
            onDirectionChange(option === "name" ? "asc" : "desc");
        }
        setSortOpen(false);
    };

    const DirectionIcon = sortDirection === "asc" ? ArrowUp : ArrowDown;

    return (
        <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search transcriptions..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    aria-label="Search transcriptions"
                    className={cn(
                        "w-full h-10 pl-10 pr-4 rounded-lg",
                        "bg-card border border-border shadow-sm",
                        "text-sm text-foreground placeholder:text-muted-foreground",
                        "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
                        "transition-shadow"
                    )}
                />
            </div>

            {/* Sort Dropdown */}
            <div className="relative" ref={sortRef}>
                <button
                    type="button"
                    onClick={() => setSortOpen(!sortOpen)}
                    className={cn(
                        "flex items-center gap-2 px-4 h-10 rounded-lg",
                        "bg-card border border-border shadow-sm",
                        "text-muted-foreground hover:text-foreground",
                        "transition-colors"
                    )}
                >
                    <span className="hidden sm:inline">
                        {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
                    </span>
                    <DirectionIcon className="h-3 w-3 text-primary" />
                </button>

                {sortOpen && (
                    <div className={cn(
                        "absolute right-0 top-full mt-1 z-50",
                        "w-44 py-1 rounded-lg",
                        "bg-card border border-border shadow-lg"
                    )}>
                        {SORT_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleSortOptionClick(option.value)}
                                className={cn(
                                    "flex items-center justify-between w-full px-3 py-2 text-sm",
                                    "hover:bg-accent transition-colors",
                                    sortBy === option.value ? "text-primary" : "text-foreground"
                                )}
                            >
                                <span>{option.label}</span>
                                <span className="flex items-center gap-1">
                                    {sortBy === option.value && (
                                        <>
                                            <DirectionIcon className="h-3 w-3" />
                                            <Check className="h-4 w-4" />
                                        </>
                                    )}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
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
