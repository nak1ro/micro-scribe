"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient, useQueries } from "@tanstack/react-query";
import { transcriptionApi } from "@/services/transcription/api";
import { TranscriptionJobStatus } from "@/types/api/transcription";
import type { TranscriptionJobListItem } from "@/types/api/transcription";
import type { TranscriptionListItem } from "@/types/models/transcription";

interface UseTranscriptionsOptions {
    page?: number;
    pageSize?: number;
}

interface UseTranscriptionsReturn {
    items: TranscriptionListItem[];
    isLoading: boolean;
    error: string | null;
    hasActiveJobs: boolean;
    refetch: () => Promise<void>;
    deleteItem: (id: string) => Promise<void>;
}

// Query key factory for consistent cache management
const transcriptionsKeys = {
    all: ["transcriptions"] as const,
    jobs: (page: number, pageSize: number) => [...transcriptionsKeys.all, "jobs", page, pageSize] as const,
};

// Polling interval when jobs are in progress (3 seconds)
const POLLING_INTERVAL_MS = 3000;

// Map job status enum to UI status string
function mapJobStatus(status: TranscriptionJobStatus): TranscriptionListItem["status"] {
    switch (status) {
        case TranscriptionJobStatus.Pending:
            return "pending";
        case TranscriptionJobStatus.Processing:
            return "processing";
        case TranscriptionJobStatus.Completed:
            return "completed";
        case TranscriptionJobStatus.Failed:
            return "failed";
        case TranscriptionJobStatus.Cancelled:
            return "cancelled";
        default:
            return "pending";
    }
}

// Map API job to list item format
function mapJobToListItem(job: TranscriptionJobListItem): TranscriptionListItem {
    return {
        id: job.jobId,
        fileName: job.originalFileName,
        uploadDate: job.createdAtUtc,
        status: mapJobStatus(job.status),
        duration: job.durationSeconds,
        language: job.languageCode,
    };
}

// Check if any job is currently active (pending or processing)
function hasActiveJobs(items: TranscriptionJobListItem[]): boolean {
    return items.some(
        (job) => job.status === TranscriptionJobStatus.Pending ||
            job.status === TranscriptionJobStatus.Processing
    );
}

export function useTranscriptions(
    options: UseTranscriptionsOptions = {}
): UseTranscriptionsReturn {
    const { page = 1, pageSize = 50 } = options;
    const queryClient = useQueryClient();

    // 1. Fetch the list (initial load + manual refetch)
    // We disable automatic polling for the list itself
    const listQuery = useQuery({
        queryKey: transcriptionsKeys.jobs(page, pageSize),
        queryFn: () => transcriptionApi.listJobs({ page, pageSize }),
    });

    const initialItems = listQuery.data?.items.map(mapJobToListItem) ?? [];

    // 2. Identify active jobs that need polling
    const activeJobs = initialItems.filter(
        (job) => job.status === "pending" || job.status === "processing"
    );

    // 3. Setup individual polling for active jobs
    // using useQueries to handle dynamic number of hooks
    const jobQueries = useQueries({ // @ts-ignore - useQueries typings can be tricky with dynamic arrays
        queries: activeJobs.map((job) => ({
            queryKey: ["transcriptions", "job", job.id],
            queryFn: () => transcriptionApi.getJob(job.id),
            refetchInterval: (query: any) => {
                const data = query.state.data;
                // Stop polling if completed/failed/cancelled
                if (data && (
                    data.status === TranscriptionJobStatus.Completed ||
                    data.status === TranscriptionJobStatus.Failed ||
                    data.status === TranscriptionJobStatus.Cancelled
                )) {
                    return false;
                }
                return POLLING_INTERVAL_MS;
            },
        })),
    });

    // 4. Merge polling results into the list
    const items = React.useMemo(() => {
        if (!initialItems.length) return [];

        return initialItems.map((item) => {
            // Find if there's an active poll for this item
            const pollResult = jobQueries.find((q) => q.data?.jobId === item.id);

            if (pollResult?.data) {
                // Merge the latest status from polling
                return {
                    ...item,
                    status: mapJobStatus(pollResult.data.status),
                    duration: pollResult.data.durationSeconds,
                    // We could also update other fields if needed
                };
            }
            return item;
        });
    }, [initialItems, jobQueries]);

    // Delete mutation (cancels the job)
    const deleteMutation = useMutation({
        mutationFn: (id: string) => transcriptionApi.cancelJob(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: transcriptionsKeys.all });
        },
    });

    const refetch = async () => {
        await listQuery.refetch();
    };

    const deleteItem = async (id: string) => {
        await deleteMutation.mutateAsync(id);
    };

    const hasActive = React.useMemo(() => hasActiveJobsFromList(items), [items]);

    return {
        items,
        isLoading: listQuery.isLoading,
        error: listQuery.error?.message ?? null,
        hasActiveJobs: hasActive,
        refetch,
        deleteItem,
    };
}

// Check if any job is currently active (pending or processing) from the internal list items
function hasActiveJobsFromList(items: TranscriptionListItem[]): boolean {
    return items.some(
        (job) => job.status === "pending" ||
            job.status === "processing"
    );
}

// Hook for fetching a single transcription job's details
export function useTranscriptionJob(jobId: string) {
    return useQuery({
        queryKey: ["transcriptions", "job", jobId],
        queryFn: () => transcriptionApi.getJob(jobId),
        enabled: !!jobId,
    });
}

