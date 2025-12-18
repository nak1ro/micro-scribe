"use client";

import * as React from "react";
import Link from "next/link";
import { Search, ArrowLeft, ArrowUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { TranscriptionList } from "@/features/transcription";
import { StatsCards } from "./StatsCards";
import { FolderPills } from "./FolderPills";
import { useAddToFolder } from "@/hooks";
import type { TranscriptionListItem } from "@/types/models/transcription";

type SortOption = "timeAdded" | "name" | "duration";

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
    const [sortBy, setSortBy] = React.useState<SortOption>("timeAdded");

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
        return [...result].sort((a, b) => {
            switch (sortBy) {
                case "name":
                    return a.fileName.localeCompare(b.fileName);
                case "duration":
                    return (b.duration ?? 0) - (a.duration ?? 0);
                case "timeAdded":
                default:
                    return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
            }
        });
    }, [items, searchQuery, sortBy]);

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
                    onSortChange={setSortBy}
                />

                {/* Folder Pills - Only on main dashboard */}
                {/* Folder Pills - Always visible for tab-like navigation */}
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
    onSortChange: (value: SortOption) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: "timeAdded", label: "Time Added" },
    { value: "name", label: "Name" },
    { value: "duration", label: "Duration" },
];

function SearchFilterBar({ searchQuery, onSearchChange, sortBy, onSortChange }: SearchFilterBarProps) {
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
                    <ArrowUpDown className="h-4 w-4" />
                    <span className="hidden sm:inline">
                        {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
                    </span>
                </button>

                {sortOpen && (
                    <div className={cn(
                        "absolute right-0 top-full mt-1 z-50",
                        "w-40 py-1 rounded-lg",
                        "bg-card border border-border shadow-lg"
                    )}>
                        {SORT_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    onSortChange(option.value);
                                    setSortOpen(false);
                                }}
                                className={cn(
                                    "flex items-center justify-between w-full px-3 py-2 text-sm",
                                    "hover:bg-accent transition-colors",
                                    sortBy === option.value ? "text-primary" : "text-foreground"
                                )}
                            >
                                {option.label}
                                {sortBy === option.value && <Check className="h-4 w-4" />}
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
