"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { transcriptionApi } from "@/features/transcription/api";
import type { TranscriptionJobDetailResponse, TranscriptSegmentDto } from "@/features/transcription/types";

interface UseSegmentEditProps {
    jobId: string;
}

interface UpdateSegmentParams {
    segmentId: string;
    text: string;
}

interface RevertSegmentParams {
    segmentId: string;
}

export function useSegmentEdit({ jobId }: UseSegmentEditProps) {
    const queryClient = useQueryClient();

    // Helper to update segment in cache
    const updateSegmentInCache = (updatedSegment: TranscriptSegmentDto) => {
        queryClient.setQueryData<TranscriptionJobDetailResponse>(
            ["transcriptions", "job", jobId],
            (oldData) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    segments: oldData.segments.map((seg) =>
                        seg.id === updatedSegment.id ? updatedSegment : seg
                    ),
                };
            }
        );
    };

    // Update segment mutation
    const updateMutation = useMutation({
        mutationFn: ({ segmentId, text }: UpdateSegmentParams) =>
            transcriptionApi.updateSegment(jobId, segmentId, text),
        onSuccess: (updatedSegment) => {
            updateSegmentInCache(updatedSegment);
        },
    });

    // Revert segment mutation
    const revertMutation = useMutation({
        mutationFn: ({ segmentId }: RevertSegmentParams) =>
            transcriptionApi.revertSegment(jobId, segmentId),
        onSuccess: (revertedSegment) => {
            updateSegmentInCache(revertedSegment);
        },
    });

    // Get current segments from cache
    const getCachedSegments = (): TranscriptSegmentDto[] => {
        const data = queryClient.getQueryData<TranscriptionJobDetailResponse>(["transcriptions", "job", jobId]);
        return data?.segments ?? [];
    };

    // Check if any segments are edited
    const getEditedSegments = () => {
        return getCachedSegments().filter((seg) => seg.isEdited);
    };

    // Revert all edited segments
    const revertAll = async () => {
        const editedSegments = getEditedSegments();
        // Revert each segment sequentially to avoid race conditions
        for (const segment of editedSegments) {
            await transcriptionApi.revertSegment(jobId, segment.id);
        }
        // Refetch to get fresh data
        await queryClient.invalidateQueries({ queryKey: ["transcriptions", "job", jobId] });
    };

    return {
        updateSegment: updateMutation.mutateAsync,
        revertSegment: revertMutation.mutateAsync,
        revertAll,
        isUpdating: updateMutation.isPending,
        isReverting: revertMutation.isPending,
        updateError: updateMutation.error,
        revertError: revertMutation.error,
        getEditedSegments,
    };
}
