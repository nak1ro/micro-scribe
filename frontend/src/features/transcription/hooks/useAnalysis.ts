"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transcriptionApi } from "@/features/transcription/api";
import { signalRService } from "@/services/signalR";
import type { TranscriptionAnalysisDto, AnalysisType } from "@/features/transcription/types";

// Query key factory
const analysisKeys = {
    all: ["analysis"] as const,
    forJob: (jobId: string) => [...analysisKeys.all, jobId] as const,
};

interface UseAnalysisOptions {
    jobId: string;
    enabled?: boolean;
    onAnalysisCompleted?: (analysis: TranscriptionAnalysisDto) => void;
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
    refetch: () => void;
}

export function useAnalysis({ jobId, enabled = true, onAnalysisCompleted }: UseAnalysisOptions): UseAnalysisReturn {
    const queryClient = useQueryClient();
    const [generatingTypes, setGeneratingTypes] = React.useState<AnalysisType[]>([]);

    // Fetch existing analyses
    const query = useQuery({
        queryKey: analysisKeys.forJob(jobId),
        queryFn: () => transcriptionApi.getAnalysis(jobId),
        enabled: enabled && !!jobId,
    });

    // Helper to update analysis in cache
    const updateAnalysisInCache = React.useCallback((updatedAnalysis: TranscriptionAnalysisDto) => {
        queryClient.setQueryData<TranscriptionAnalysisDto[]>(
            analysisKeys.forJob(jobId),
            (old) => {
                if (!old) return old; // Don't create if empty? Or maybe we should?

                const index = old.findIndex(a => a.id === updatedAnalysis.id);
                if (index !== -1) {
                    // Update existing item
                    const newCache = [...old];
                    newCache[index] = updatedAnalysis;
                    return newCache;
                }

                // If it's not in our list, ignore it. 
                // This prevents analyses from other jobs (received via "user-{id}" group) 
                // from appearing in this job's list.
                // Note: The 'generate' mutation adds the pending item to the list, 
                // so subsequent events for that item WILL match.
                return old;
            }
        );
    }, [jobId, queryClient]);

    // Connect to SignalR
    React.useEffect(() => {
        if (!enabled || !jobId) return;

        const connectSignalR = async () => {
            // Connect if not already connected
            if (!signalRService.isConnected()) {
                try {
                    await signalRService.connect();
                } catch (err) {
                    console.error("Failed to connect to SignalR:", err);
                }
            }

            // Register handlers
            // Note: We don't filter by jobId in the event because the DTO payload 
            // might not contain it. Instead, updateAnalysisInCache filters by 
            // checking if the ID exists in our current list.
            signalRService.setOnAnalysisProcessing((event) => {
                updateAnalysisInCache(event as unknown as TranscriptionAnalysisDto);
            });

            signalRService.setOnAnalysisCompleted((event) => {
                const analysis = event as unknown as TranscriptionAnalysisDto;
                updateAnalysisInCache(analysis);
                onAnalysisCompleted?.(analysis);
            });

            signalRService.setOnAnalysisFailed((event) => {
                updateAnalysisInCache(event as unknown as TranscriptionAnalysisDto);
            });
        };

        connectSignalR();

        // Cleanup
        return () => {
            signalRService.setOnAnalysisProcessing(null);
            signalRService.setOnAnalysisCompleted(null);
            signalRService.setOnAnalysisFailed(null);
        };
    }, [jobId, enabled, updateAnalysisInCache, onAnalysisCompleted]);


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
        onSuccess: (pendingAnalyses) => {
            // Update cache with pending analyses
            queryClient.setQueryData<TranscriptionAnalysisDto[]>(
                analysisKeys.forJob(jobId),
                (old) => {
                    if (!old) return pendingAnalyses;
                    // Merge: replace existing types, add new ones
                    const updated = [...old];
                    for (const newAnalysis of pendingAnalyses) {
                        // Check if we already have an entry for this analysis type (maybe failed previously)
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
        isGenerating: generateMutation.isPending, // Keep this for button loading states if needed
        generatingTypes,
        generate,
        generateAll,
        getAnalysisByType,
        refetch: query.refetch,
    };
}
