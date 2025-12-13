"use client";

import * as React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
    TranscriptionList,
    CreateTranscriptionModal,
    type TranscriptionListItem,
    type TranscriptionFormData,
} from "@/features/transcription";
import { transcriptionApi } from "@/services/transcription/api";
import { Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
    const [items, setItems] = React.useState<TranscriptionListItem[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");

    // Fetch media files on mount
    React.useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const response = await transcriptionApi.listMedia({ page: 1, pageSize: 50 });

            // Transform API response to list items
            const listItems: TranscriptionListItem[] = response.items.map((media) => ({
                id: media.id,
                fileName: media.originalFileName,
                uploadDate: media.createdAtUtc,
                status: "completed", // TODO: Fetch actual transcription status
                duration: media.durationSeconds,
                language: null, // TODO: Fetch from transcription job
            }));

            setItems(listItems);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch media:", err);
            setError("Failed to load transcriptions");
            // Use placeholder data for demo
            setItems(getPlaceholderData());
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (id: string) => {
        // TODO: Navigate to edit page or open edit modal
        console.log("Edit transcription:", id);
    };

    const handleDelete = async (id: string) => {
        // TODO: Implement delete confirmation
        console.log("Delete transcription:", id);
        try {
            await transcriptionApi.deleteMedia(id);
            setItems((prev) => prev.filter((item) => item.id !== id));
        } catch (err) {
            console.error("Failed to delete:", err);
        }
    };

    const handleTranscriptionSubmit = async (data: TranscriptionFormData) => {
        console.log("Creating transcription:", data);

        // TODO: Implement actual upload and transcription flow
        // 1. If file: Upload to S3 via presigned URL
        // 2. Create transcription job
        // 3. Refresh list

        // For now, just refresh the list
        await fetchData();
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
                onSubmit={handleTranscriptionSubmit}
            />
        </DashboardLayout>
    );
}

// ─────────────────────────────────────────────────────────────
// Placeholder Data (for demo when API fails)
// ─────────────────────────────────────────────────────────────

function getPlaceholderData(): TranscriptionListItem[] {
    return [
        {
            id: "1",
            fileName: "team_meeting_2024-12-10.mp3",
            uploadDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            status: "completed",
            duration: 3621,
            language: "en",
        },
        {
            id: "2",
            fileName: "podcast_episode_42.wav",
            uploadDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            status: "processing",
            duration: 5432,
            language: "en",
        },
        {
            id: "3",
            fileName: "interview_candidate_john.mp4",
            uploadDate: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
            status: "completed",
            duration: 2145,
            language: "pl",
        },
        {
            id: "4",
            fileName: "lecture_machine_learning.mp3",
            uploadDate: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
            status: "failed",
            duration: null,
            language: null,
        },
        {
            id: "5",
            fileName: "voice_memo_ideas.m4a",
            uploadDate: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
            status: "pending",
            duration: 180,
            language: null,
        },
    ];
}
