"use client";

import * as React from "react";
import { Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { TranscriptionList } from "@/features/transcription";
import { useTranscriptions } from "@/hooks";

interface DashboardContentProps {
    onOpenModal: () => void;
}

export function DashboardContent({ onOpenModal }: DashboardContentProps) {
    const { items, isLoading, error, refetch, deleteItem } = useTranscriptions();
    const [searchQuery, setSearchQuery] = React.useState("");

    const handleEdit = (id: string) => {
        // TODO: Navigate to edit page or open edit modal
        console.log("Edit transcription:", id);
    };

    const handleDelete = async (id: string) => {
        // TODO: Implement delete confirmation
        console.log("Delete transcription:", id);
        try {
            await deleteItem(id);
        } catch (err) {
            console.error("Failed to delete:", err);
        }
    };

    const handleUploadSuccess = () => {
        refetch();
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
                <DashboardHeader />

                {/* Search & Filter Bar */}
                <SearchFilterBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />

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
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onNewClick={onOpenModal}
                />
            </div>

            {/* Create Transcription Modal - controlled by parent */}
            <CreateTranscriptionModalWrapper onSuccess={handleUploadSuccess} />
        </>
    );
}

function DashboardHeader() {
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
                        "bg-background border border-input",
                        "text-foreground placeholder:text-muted-foreground",
                        "focus:outline-none focus:ring-2 focus:ring-ring"
                    )}
                />
            </div>
            <button
                type="button"
                className={cn(
                    "flex items-center gap-2 px-4 h-10 rounded-lg",
                    "bg-background border border-input",
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

// Wrapper to expose modal control - allows parent to manage open state
interface CreateTranscriptionModalWrapperProps {
    onSuccess: () => void;
}

function CreateTranscriptionModalWrapper({ onSuccess }: CreateTranscriptionModalWrapperProps) {
    // This component is used internally by DashboardPage which manages isOpen state
    return null;
}

// Export the hook for modal state management
export function useDashboardModal() {
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const openModal = React.useCallback(() => setIsModalOpen(true), []);
    const closeModal = React.useCallback(() => setIsModalOpen(false), []);

    return { isModalOpen, openModal, closeModal };
}
