import * as React from "react";
import type { TranscriptionAnalysisDto, ActionItemsContent, ActionItemContent } from "@/features/transcription/types/analysis";
import { parseAnalysisContent } from "@/features/transcription/types/analysis";

interface UseActionItemsProps {
    actionItemsAnalysis: TranscriptionAnalysisDto | undefined;
    displayLanguage: string | null;
}

export function useActionItems({ actionItemsAnalysis, displayLanguage }: UseActionItemsProps) {
    const [completed, setCompleted] = React.useState<Set<number>>(new Set());

    const actionItems = React.useMemo((): ActionItemContent[] => {
        if (!actionItemsAnalysis) return [];

        let content = actionItemsAnalysis.content;
        if (displayLanguage && actionItemsAnalysis.translations[displayLanguage]) {
            content = actionItemsAnalysis.translations[displayLanguage];
        }

        const parsed = parseAnalysisContent<ActionItemsContent>(content);
        return parsed?.actionItems ?? [];
    }, [actionItemsAnalysis, displayLanguage]);

    const toggleComplete = (index: number) => {
        setCompleted(prev => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    };

    const completedCount = completed.size;
    const totalCount = actionItems.length;
    const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return {
        completed,
        actionItems,
        toggleComplete,
        completedCount,
        totalCount,
        progressPercentage
    };
}
