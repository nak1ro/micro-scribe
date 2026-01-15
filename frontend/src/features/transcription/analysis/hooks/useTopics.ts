import * as React from "react";
import type { TranscriptionAnalysisDto, TopicsContent } from "@/features/transcription/types";
import { parseAnalysisContent } from "@/features/transcription/types";

interface UseTopicsProps {
    topicsAnalysis: TranscriptionAnalysisDto | undefined;
    displayLanguage: string | null;
}

// Extracts and parses topics from analysis, respecting translated content
export function useTopics({ topicsAnalysis, displayLanguage }: UseTopicsProps): string[] {
    return React.useMemo(() => {
        if (!topicsAnalysis) return [];

        let content = topicsAnalysis.content;
        if (displayLanguage && topicsAnalysis.translations[displayLanguage]) {
            content = topicsAnalysis.translations[displayLanguage];
        }

        const parsed = parseAnalysisContent<TopicsContent>(content);
        return parsed?.topics ?? [];
    }, [topicsAnalysis, displayLanguage]);
}
