"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
    TranscriptionList,
    NewTranscriptionButtons,
    type TranscriptionListItem,
} from "@/features/transcription";
import { transcriptionApi } from "@/services/transcription/api";
import { TranscriptionJobStatus } from "@/types/api/transcription";

export default function TranscriptionPage() {
    const [items, setItems] = React.useState<TranscriptionListItem[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    // Fetch media files on mount
    React.useEffect(() => {
        async function fetchData() {
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
            } catch (err) {
                console.error("Failed to fetch media:", err);
                setError("Failed to load transcriptions");
                // Use placeholder data for demo
                setItems(getPlaceholderData());
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, []);

    const handleEdit = (id: string) => {
        // TODO: Navigate to edit page or open edit modal
        console.log("Edit transcription:", id);
    };

    const handleDelete = async (id: string) => {
        // TODO: Implement delete confirmation and API call
        console.log("Delete transcription:", id);
        try {
            await transcriptionApi.deleteMedia(id);
            setItems((prev) => prev.filter((item) => item.id !== id));
        } catch (err) {
            console.error("Failed to delete:", err);
        }
    };

    const handleNewClick = () => {
        // Scroll to new transcription section or open modal
        console.log("New transcription clicked");
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Page Header */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        My Transcriptions
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your audio and video transcriptions
                    </p>
                </div>

                {/* New Transcription Buttons */}
                <section>
                    <h2 className="text-lg font-semibold text-foreground mb-4">
                        Create New Transcription
                    </h2>
                    <NewTranscriptionButtons
                        onUploadClick={() => console.log("Upload clicked")}
                        onYoutubeClick={() => console.log("YouTube clicked")}
                        onMicClick={() => console.log("Mic clicked")}
                    />
                </section>

                {/* Transcriptions List */}
                <section>
                    <h2 className="text-lg font-semibold text-foreground mb-4">
                        Recent Transcriptions
                    </h2>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-warning/10 border border-warning/20 text-warning-foreground text-sm">
                            {error} — Showing demo data.
                        </div>
                    )}

                    <TranscriptionList
                        items={items}
                        isLoading={isLoading}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onNewClick={handleNewClick}
                    />
                </section>
            </div>
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
