"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transcriptionApi } from "@/services/transcription/api";
import type { TranscriptionAnalysisDto, AnalysisType } from "@/types/api/analysis";

// Query key factory
const analysisKeys = {
    all: ["analysis"] as const,
    forJob: (jobId: string) => [...analysisKeys.all, jobId] as const,
};

interface UseAnalysisOptions {
    jobId: string;
    enabled?: boolean;
}

interface UseAnalysisReturn {
    analyses: TranscriptionAnalysisDto[];
    isLoading: boolean;
    error: string | null;
    isGenerating: boolean;
    generatingTypes: AnalysisType[];
    generate: (types: AnalysisType[]) => void;
    generateAll: () => void;
    getAnalysisByType: (type: AnalysisType) => TranscriptionAnalysisDto | undefined;
}

export function useAnalysis({ jobId, enabled = true }: UseAnalysisOptions): UseAnalysisReturn {
    const queryClient = useQueryClient();
    const [generatingTypes, setGeneratingTypes] = React.useState<AnalysisType[]>([]);

    // Fetch existing analyses
    const query = useQuery({
        queryKey: analysisKeys.forJob(jobId),
        queryFn: () => transcriptionApi.getAnalysis(jobId),
        enabled: enabled && !!jobId,
    });

    // Generate mutation
    const generateMutation = useMutation({
        mutationFn: (types: (AnalysisType | "All")[]) =>
            transcriptionApi.generateAnalysis(jobId, types),
        onMutate: (types) => {
            // Track which types are generating
            if (types.includes("All")) {
                setGeneratingTypes(["ShortSummary", "LongSummary", "ActionItems", "MeetingMinutes", "Topics", "Sentiment"]);
            } else {
                setGeneratingTypes(types as AnalysisType[]);
            }
        },
        onSuccess: (newAnalyses) => {
            // Update cache with new analyses
            queryClient.setQueryData<TranscriptionAnalysisDto[]>(
                analysisKeys.forJob(jobId),
                (old) => {
                    if (!old) return newAnalyses;
                    // Merge: replace existing types, add new ones
                    const updated = [...old];
                    for (const newAnalysis of newAnalyses) {
                        const existingIdx = updated.findIndex(a => a.analysisType === newAnalysis.analysisType);
                        if (existingIdx >= 0) {
                            updated[existingIdx] = newAnalysis;
                        } else {
                            updated.push(newAnalysis);
                        }
                    }
                    return updated;
                }
            );
        },
        onSettled: () => {
            setGeneratingTypes([]);
        },
    });

    const generate = React.useCallback((types: AnalysisType[]) => {
        generateMutation.mutate(types);
    }, [generateMutation]);

    const generateAll = React.useCallback(() => {
        generateMutation.mutate(["All"]);
    }, [generateMutation]);

    const getAnalysisByType = React.useCallback((type: AnalysisType): TranscriptionAnalysisDto | undefined => {
        return query.data?.find(a => a.analysisType === type);
    }, [query.data]);

    return {
        analyses: query.data ?? [],
        isLoading: query.isLoading,
        error: query.error instanceof Error ? query.error.message : null,
        isGenerating: generateMutation.isPending,
        generatingTypes,
        generate,
        generateAll,
        getAnalysisByType,
    };
}
