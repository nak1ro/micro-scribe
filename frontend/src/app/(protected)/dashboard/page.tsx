"use client";

import * as React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TranscriptionList, CreateTranscriptionModal } from "@/features/transcription";
import { useTranscriptions } from "@/hooks/useTranscriptions";
import { Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
    const { items, isLoading, error, refetch, deleteItem } = useTranscriptions();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
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

    const openModal = () => setIsModalOpen(true);

    // Filter items based on search query
    const filteredItems = React.useMemo(() => {
        if (!searchQuery.trim()) return items;
        const query = searchQuery.toLowerCase();
        return items.filter((item) =>
            item.fileName.toLowerCase().includes(query)
        );
    }, [items, searchQuery]);

    return (
        <DashboardLayout onNewTranscription={openModal}>
            <div className="space-y-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        My Transcriptions
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your audio and video transcriptions
                    </p>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search transcriptions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
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
                    onNewClick={openModal}
                />
            </div>

            {/* Create Transcription Modal */}
            <CreateTranscriptionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleUploadSuccess}
            />
        </DashboardLayout>
    );
}
