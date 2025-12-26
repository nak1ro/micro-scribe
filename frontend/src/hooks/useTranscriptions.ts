"use client";

import * as React from "react";
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
    addOptimisticItem: (item: TranscriptionListItem) => void;
    updateOptimisticItem: (id: string, updates: Partial<TranscriptionListItem>) => void;
    removeOptimisticItem: (id: string) => void;
}

// Query key factory for consistent cache management
const transcriptionsKeys = {
    all: ["transcriptions"] as const,
    jobs: (page: number, pageSize: number) => [...transcriptionsKeys.all, "jobs", page, pageSize] as const,
};

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
        processingStep: job.processingStep,
        duration: job.durationSeconds,
        language: job.sourceLanguage,
        preview: job.transcriptPreview,
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

    // Local state for optimistic items (uploads in progress)
    const [optimisticItems, setOptimisticItems] = React.useState<TranscriptionListItem[]>([]);

    // Fetch the list - SignalR handles real-time status updates via cache manipulation
    const listQuery = useQuery({
        queryKey: transcriptionsKeys.jobs(page, pageSize),
        queryFn: () => transcriptionApi.listJobs({ page, pageSize }),
    });

    const serverItems = listQuery.data?.items.map(mapJobToListItem) ?? [];

    // Merge optimistic items with server items (optimistic at top, filter out duplicates)
    const items = React.useMemo(() => {
        const serverIds = new Set(serverItems.map(item => item.id));
        // Remove optimistic items that now exist on server
        const activeOptimistic = optimisticItems.filter(item => !serverIds.has(item.id));
        return [...activeOptimistic, ...serverItems];
    }, [serverItems, optimisticItems]);

    // Delete mutation (permanently deletes the job)
    const deleteMutation = useMutation({
        mutationFn: (id: string) => transcriptionApi.deleteJob(id),
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

    // Optimistic update functions
    const addOptimisticItem = (item: TranscriptionListItem) => {
        setOptimisticItems(prev => [item, ...prev]);
    };

    const updateOptimisticItem = (id: string, updates: Partial<TranscriptionListItem>) => {
        setOptimisticItems(prev =>
            prev.map(item => item.id === id ? { ...item, ...updates } : item)
        );
    };

    const removeOptimisticItem = (id: string) => {
        setOptimisticItems(prev => prev.filter(item => item.id !== id));
    };

    const hasActive = React.useMemo(() => hasActiveJobsFromList(items), [items]);

    return {
        items,
        isLoading: listQuery.isLoading,
        error: listQuery.error?.message ?? null,
        hasActiveJobs: hasActive,
        refetch,
        deleteItem,
        addOptimisticItem,
        updateOptimisticItem,
        removeOptimisticItem,
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
// SignalR handles real-time updates via cache invalidation
export function useTranscriptionJob(jobId: string) {
    return useQuery({
        queryKey: ["transcriptions", "job", jobId],
        queryFn: () => transcriptionApi.getJob(jobId),
        enabled: !!jobId,
    });
}

