"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transcriptionApi } from "@/services/transcription/api";
import type { MediaFileResponse } from "@/types/api/transcription";
import type { TranscriptionListItem } from "@/types/models/transcription";

interface UseTranscriptionsOptions {
    page?: number;
    pageSize?: number;
}

interface UseTranscriptionsReturn {
    items: TranscriptionListItem[];
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    deleteItem: (id: string) => Promise<void>;
}

// Query key factory for consistent cache management
const transcriptionsKeys = {
    all: ["transcriptions"] as const,
    list: (page: number, pageSize: number) => [...transcriptionsKeys.all, page, pageSize] as const,
};

// Map API response to list item format
function mapMediaToListItem(media: MediaFileResponse): TranscriptionListItem {
    return {
        id: media.id,
        fileName: media.originalFileName,
        uploadDate: media.createdAtUtc,
        status: "completed", // TODO: Fetch actual transcription status
        duration: media.durationSeconds,
        language: null, // TODO: Fetch from transcription job
    };
}

export function useTranscriptions(
    options: UseTranscriptionsOptions = {}
): UseTranscriptionsReturn {
    const { page = 1, pageSize = 50 } = options;
    const queryClient = useQueryClient();

    // Fetch transcriptions with TanStack Query
    const query = useQuery({
        queryKey: transcriptionsKeys.list(page, pageSize),
        queryFn: () => transcriptionApi.listMedia({ page, pageSize }),
        select: (data) => data.items.map(mapMediaToListItem),
    });

    // Delete mutation with cache invalidation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => transcriptionApi.deleteMedia(id),
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
        items: query.data ?? [],
        isLoading: query.isLoading,
        error: query.error?.message ?? null,
        refetch,
        deleteItem,
    };
}
