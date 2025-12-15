"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

    // Fetch transcription jobs with TanStack Query
    const query = useQuery({
        queryKey: transcriptionsKeys.jobs(page, pageSize),
        queryFn: () => transcriptionApi.listJobs({ page, pageSize }),
        // Enable polling when there are active jobs
        refetchInterval: (query) => {
            const data = query.state.data;
            if (data && hasActiveJobs(data.items)) {
                return POLLING_INTERVAL_MS;
            }
            return false;
        },
    });

    // Map jobs to list items
    const items = query.data?.items.map(mapJobToListItem) ?? [];

    // Delete mutation (cancels the job)
    const deleteMutation = useMutation({
        mutationFn: (id: string) => transcriptionApi.cancelJob(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: transcriptionsKeys.all });
        },
    });

    const refetch = async () => {
        await query.refetch();
    };

    const deleteItem = async (id: string) => {
        await deleteMutation.mutateAsync(id);
    };

    return {
        items,
        isLoading: query.isLoading,
        error: query.error?.message ?? null,
        hasActiveJobs: query.data ? hasActiveJobs(query.data.items) : false,
        refetch,
        deleteItem,
    };
}
