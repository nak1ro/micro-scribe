"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
    signalRService,
    type JobStatusUpdateEvent,
    type JobCompletedEvent,
    type JobFailedEvent,
    type TranslationStatusUpdateEvent,
} from "@/services/signalR";
import { TranscriptionJobStatus } from "@/features/transcription/types";
import type { TranscriptionListItem } from "@/types/models/transcription";

// Query keys from useTranscriptions
const transcriptionsKeys = {
    all: ["transcriptions"] as const,
    job: (id: string) => ["transcriptions", "job", id] as const,
};

// Map backend status string to frontend status
function mapStatusString(status: string): TranscriptionListItem["status"] {
    switch (status) {
        case "Pending":
            return "pending";
        case "Processing":
            return "processing";
        case "Completed":
            return "completed";
        case "Failed":
            return "failed";
        case "Cancelled":
            return "cancelled";
        default:
            return "pending";
    }
}

// Hook to register SignalR event handlers that update TanStack Query cache
export function useSignalREvents() {
    const queryClient = useQueryClient();

    React.useEffect(() => {
        // Handler: Update job status in cache
        const handleJobStatusUpdate = (event: JobStatusUpdateEvent) => {
            // Update list cache
            queryClient.setQueriesData<{ items: TranscriptionListItem[] }>(
                { queryKey: transcriptionsKeys.all },
                (old) => {
                    if (!old?.items) return old;
                    return {
                        ...old,
                        items: old.items.map((item) =>
                            item.id === event.jobId
                                ? {
                                    ...item,
                                    status: mapStatusString(event.status),
                                    processingStep: event.processingStep,
                                }
                                : item
                        ),
                    };
                }
            );

            // Invalidate single job query if viewing it
            queryClient.invalidateQueries({
                queryKey: transcriptionsKeys.job(event.jobId),
                refetchType: "none", // Don't refetch, just mark stale
            });
        };

        // Handler: Job completed - refetch to get full data
        const handleJobCompleted = (event: JobCompletedEvent) => {
            // Update status in list cache
            queryClient.setQueriesData<{ items: TranscriptionListItem[] }>(
                { queryKey: transcriptionsKeys.all },
                (old) => {
                    if (!old?.items) return old;
                    return {
                        ...old,
                        items: old.items.map((item) =>
                            item.id === event.jobId
                                ? { ...item, status: "completed" as const, processingStep: null }
                                : item
                        ),
                    };
                }
            );

            // Refetch list to get preview text
            queryClient.invalidateQueries({ queryKey: transcriptionsKeys.all });

            // Refetch single job to get segments
            queryClient.invalidateQueries({
                queryKey: transcriptionsKeys.job(event.jobId),
            });
        };

        // Handler: Job failed - update status and error
        const handleJobFailed = (event: JobFailedEvent) => {
            queryClient.setQueriesData<{ items: TranscriptionListItem[] }>(
                { queryKey: transcriptionsKeys.all },
                (old) => {
                    if (!old?.items) return old;
                    return {
                        ...old,
                        items: old.items.map((item) =>
                            item.id === event.jobId
                                ? { ...item, status: "failed" as const, processingStep: null }
                                : item
                        ),
                    };
                }
            );

            console.error(`[SignalR] Job ${event.jobId} failed:`, event.errorMessage);
        };

        // Handler: Translation status update
        const handleTranslationStatusUpdate = (event: TranslationStatusUpdateEvent) => {
            // If translation complete (status null), refetch job to get translations
            if (event.translationStatus === null && event.translatingToLanguage === null) {
                queryClient.invalidateQueries({
                    queryKey: transcriptionsKeys.job(event.jobId),
                });
            } else {
                // Just invalidate to update status fields
                queryClient.invalidateQueries({
                    queryKey: transcriptionsKeys.job(event.jobId),
                    refetchType: "none",
                });
            }
        };

        // Register handlers
        signalRService.setOnJobStatusUpdate(handleJobStatusUpdate);
        signalRService.setOnJobCompleted(handleJobCompleted);
        signalRService.setOnJobFailed(handleJobFailed);
        signalRService.setOnTranslationStatusUpdate(handleTranslationStatusUpdate);

        // Cleanup
        return () => {
            signalRService.setOnJobStatusUpdate(null);
            signalRService.setOnJobCompleted(null);
            signalRService.setOnJobFailed(null);
            signalRService.setOnTranslationStatusUpdate(null);
        };
    }, [queryClient]);
}
